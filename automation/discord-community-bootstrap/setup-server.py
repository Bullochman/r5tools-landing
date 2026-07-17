#!/usr/bin/env python3
"""
setup-server.py — one-shot idempotent bootstrap for the r5tools community Discord.

USAGE:
    export DISCORD_BOT_TOKEN=...
    export DISCORD_GUILD_ID=...          # target server ID
    python3 setup-server.py --dry-run    # preview all mutations, mutate nothing
    python3 setup-server.py               # actually apply

WHAT IT DOES:
    1. Reads server-config.yaml
    2. For each ROLE: looks up by name → creates if missing, updates color/hoist/mentionable if drifted
    3. For each CATEGORY: looks up by name → creates if missing, sets position
    4. For each CHANNEL: looks up by (name, category) → creates if missing (text/announcement/forum/voice),
       sets topic + slowmode + permission overwrites
    5. Applies Community Server settings (verification_level, system_channel, rules_channel, etc.)

IDEMPOTENCY:
    Every mutation is guarded by a "does it already exist / match?" check.
    Running twice on a fully-configured server = zero API writes past the initial fetch.

    Rate-limit safe: we let discord.py's built-in bucketing pace requests.
    You'll see brief pauses on first run when hitting 5-role/5s or 2-channel/5s buckets.

DRY RUN:
    --dry-run prints every action prefixed with [DRY] and skips the mutation.

STATE:
    bot-state.json (gitignored) is written on success — records the run timestamp
    + guild ID + counts. Used by other scripts (welcome-flow, verify-flow, content-seeder)
    to sanity-check they're pointed at the right server.

DEPS:
    pip install "discord.py>=2.3" "PyYAML>=6.0"
"""

from __future__ import annotations

import argparse
import asyncio
import json
import logging
import os
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import discord
import yaml

# ─────────────────────────────────────────────────────────────────────────────
# Paths + logging
# ─────────────────────────────────────────────────────────────────────────────
HERE = Path(__file__).resolve().parent
CONFIG_PATH = HERE / "server-config.yaml"
STATE_PATH = HERE / "bot-state.json"

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("setup-server")


# ─────────────────────────────────────────────────────────────────────────────
# Permission preset expansion — collapsed reference of what each preset grants.
# We express channel overwrites in the yaml as short keys; expand them here.
# ─────────────────────────────────────────────────────────────────────────────
PRESET_ROLE_PERMS: dict[str, discord.Permissions] = {
    "admin":      discord.Permissions.all(),
    "mod":        discord.Permissions(
        manage_messages=True, manage_threads=True, kick_members=True,
        ban_members=True, moderate_members=True, mute_members=True,
        deafen_members=True, move_members=True, view_audit_log=True,
        manage_nicknames=True, read_messages=True, send_messages=True,
        embed_links=True, attach_files=True, read_message_history=True,
        add_reactions=True, use_external_emojis=True, connect=True,
        speak=True, use_voice_activation=True,
    ),
    "member":     discord.Permissions(
        read_messages=True, send_messages=True, embed_links=True,
        attach_files=True, read_message_history=True, add_reactions=True,
        use_external_emojis=True, connect=True, speak=True,
        use_voice_activation=True, create_public_threads=True,
        send_messages_in_threads=True,
    ),
    "restricted": discord.Permissions(
        read_messages=True, read_message_history=True, add_reactions=True,
    ),
    "bot":        discord.Permissions(
        read_messages=True, send_messages=True, embed_links=True,
        attach_files=True, read_message_history=True, add_reactions=True,
        manage_webhooks=True,
    ),
}

# Short-key → discord.py PermissionOverwrite kwarg
OVERWRITE_KEY_MAP = {
    "view":                    "view_channel",
    "send":                    "send_messages",
    "add_reactions":           "add_reactions",
    "read_history":            "read_message_history",
    "manage_messages":         "manage_messages",
    "manage_threads":          "manage_threads",
    "create_public_threads":   "create_public_threads",
    "mention_everyone":        "mention_everyone",
    "connect":                 "connect",
    "speak":                   "speak",
    "mute_members":            "mute_members",
    "move_members":            "move_members",
}


def hex_to_color(h: str) -> discord.Color:
    return discord.Color(int(h.lstrip("#"), 16))


def load_config() -> dict[str, Any]:
    with CONFIG_PATH.open("r", encoding="utf-8") as f:
        return yaml.safe_load(f)


def build_overwrites(
    overwrite_spec: dict[str, dict[str, bool]],
    roles_by_name: dict[str, discord.Role],
    guild: discord.Guild,
) -> dict[discord.Role | discord.Member, discord.PermissionOverwrite]:
    """Convert yaml short-form overwrite dict → discord.py overwrites dict."""
    result: dict[Any, discord.PermissionOverwrite] = {}
    for role_name, perms in (overwrite_spec or {}).items():
        target: discord.Role | None
        if role_name == "@everyone":
            target = guild.default_role
        else:
            target = roles_by_name.get(role_name)
            if target is None:
                log.warning("  skipping overwrite for missing role: %s", role_name)
                continue
        kwargs: dict[str, bool] = {}
        for short_key, allow in perms.items():
            long_key = OVERWRITE_KEY_MAP.get(short_key)
            if long_key is None:
                log.warning("  unknown overwrite key: %s", short_key)
                continue
            kwargs[long_key] = allow
        result[target] = discord.PermissionOverwrite(**kwargs)
    return result


def channel_type_from_str(s: str) -> discord.ChannelType:
    return {
        "text":         discord.ChannelType.text,
        "announcement": discord.ChannelType.news,
        "forum":        discord.ChannelType.forum,
        "voice":        discord.ChannelType.voice,
    }[s]


# ─────────────────────────────────────────────────────────────────────────────
# Core sync
# ─────────────────────────────────────────────────────────────────────────────
async def sync_roles(
    guild: discord.Guild,
    role_specs: list[dict[str, Any]],
    dry_run: bool,
) -> dict[str, discord.Role]:
    """Create or update each declared role. Returns name→Role map."""
    existing = {r.name: r for r in guild.roles}
    out: dict[str, discord.Role] = {}
    for spec in role_specs:
        name = spec["name"]
        color = hex_to_color(spec["color"])
        hoist = spec.get("hoist", False)
        mentionable = spec.get("mentionable", False)
        preset = spec.get("permissions_preset", "member")
        perms = PRESET_ROLE_PERMS.get(preset, PRESET_ROLE_PERMS["member"])

        role = existing.get(name)
        if role is None:
            if dry_run:
                log.info("[DRY] CREATE role: %s (color=%s, hoist=%s)", name, spec["color"], hoist)
                # fake a stub so channels can reference; permissions won't matter in dry-run
                continue
            role = await guild.create_role(
                name=name, color=color, hoist=hoist,
                mentionable=mentionable, permissions=perms,
                reason="setup-server bootstrap",
            )
            log.info("CREATED role: %s", name)
        else:
            drift = (
                role.color != color
                or role.hoist != hoist
                or role.mentionable != mentionable
                or role.permissions.value != perms.value
            )
            if drift:
                if dry_run:
                    log.info("[DRY] UPDATE role: %s (drift detected)", name)
                else:
                    await role.edit(
                        color=color, hoist=hoist, mentionable=mentionable,
                        permissions=perms, reason="setup-server drift correction",
                    )
                    log.info("UPDATED role: %s", name)
            else:
                log.info("OK role: %s", name)
        if role is not None:
            out[name] = role
    return out


async def sync_categories_and_channels(
    guild: discord.Guild,
    category_specs: list[dict[str, Any]],
    roles_by_name: dict[str, discord.Role],
    dry_run: bool,
) -> tuple[int, int]:
    """Create/update all categories and channels. Returns (cat_count, ch_count)."""
    existing_cats = {c.name: c for c in guild.categories}
    ch_count = 0

    for cat_idx, cat_spec in enumerate(category_specs):
        cat_name = cat_spec["name"]
        position = cat_spec.get("position", cat_idx)

        cat = existing_cats.get(cat_name)
        if cat is None:
            if dry_run:
                log.info("[DRY] CREATE category: %s", cat_name)
                continue
            cat = await guild.create_category(
                name=cat_name, position=position,
                reason="setup-server bootstrap",
            )
            log.info("CREATED category: %s", cat_name)
        else:
            if cat.position != position:
                if dry_run:
                    log.info("[DRY] UPDATE category position: %s → %d", cat_name, position)
                else:
                    await cat.edit(position=position)
                    log.info("UPDATED category position: %s → %d", cat_name, position)
            else:
                log.info("OK category: %s", cat_name)

        # Channels under this category
        existing_by_name = {c.name: c for c in cat.channels} if cat else {}
        for ch_spec in cat_spec.get("channels", []):
            ch_name = ch_spec["name"]
            # Discord normalizes text/announcement/forum channel names to lowercase-with-hyphens.
            # Voice channel names preserve case. Match accordingly.
            ch_type_str = ch_spec.get("type", "text")
            lookup_name = ch_name if ch_type_str == "voice" else ch_name.lower().replace(" ", "-")
            ch_type = channel_type_from_str(ch_type_str)
            topic = ch_spec.get("topic")
            slowmode = ch_spec.get("slowmode", 0)
            overwrites = build_overwrites(ch_spec.get("overwrites", {}), roles_by_name, guild)

            ch = existing_by_name.get(lookup_name)
            if ch is None:
                if dry_run:
                    log.info("[DRY] CREATE %s channel: %s / %s", ch_type_str, cat_name, ch_name)
                    ch_count += 1
                    continue
                create_kwargs: dict[str, Any] = {
                    "name": ch_name,
                    "category": cat,
                    "overwrites": overwrites,
                    "reason": "setup-server bootstrap",
                }
                if ch_type_str in ("text", "announcement", "forum"):
                    if topic:
                        create_kwargs["topic"] = topic
                    if slowmode:
                        create_kwargs["slowmode_delay"] = slowmode
                if ch_type_str == "text":
                    ch = await guild.create_text_channel(**create_kwargs)
                elif ch_type_str == "announcement":
                    ch = await guild.create_text_channel(news=True, **create_kwargs)
                elif ch_type_str == "forum":
                    ch = await guild.create_forum(**create_kwargs)
                elif ch_type_str == "voice":
                    ch = await guild.create_voice_channel(
                        name=ch_name, category=cat,
                        overwrites=overwrites, reason="setup-server bootstrap",
                    )
                log.info("CREATED %s channel: %s / %s", ch_type_str, cat_name, ch_name)
                ch_count += 1
            else:
                # Update topic + slowmode + overwrites if drifted
                edits: dict[str, Any] = {}
                if hasattr(ch, "topic") and topic and getattr(ch, "topic", None) != topic:
                    edits["topic"] = topic
                if hasattr(ch, "slowmode_delay") and getattr(ch, "slowmode_delay", 0) != slowmode:
                    edits["slowmode_delay"] = slowmode
                # Compare overwrites — simple heuristic: any target diff → re-apply
                current_overwrites = {k: v for k, v in ch.overwrites.items()}
                needs_perm_sync = current_overwrites != overwrites
                if edits or needs_perm_sync:
                    if dry_run:
                        log.info("[DRY] UPDATE channel: %s / %s (drift)", cat_name, ch_name)
                    else:
                        if edits:
                            await ch.edit(**edits)
                        if needs_perm_sync:
                            # Batch: overwrite each target
                            for target, ow in overwrites.items():
                                await ch.set_permissions(target, overwrite=ow)
                        log.info("UPDATED channel: %s / %s", cat_name, ch_name)
                else:
                    log.info("OK channel: %s / %s", cat_name, ch_name)
                ch_count += 1

    return len(category_specs), ch_count


async def apply_community_features(
    guild: discord.Guild,
    features: dict[str, Any],
    channels_by_name: dict[str, discord.abc.GuildChannel],
    dry_run: bool,
) -> None:
    """
    Set server-level features (verification_level, system_channel, rules_channel...).
    Some (like discoverable, community) require manual toggle in Server Settings UI
    because they need 2FA-required + explicit consent — see README.md.
    """
    v_level_map = {
        "off":       discord.VerificationLevel.none,
        "low":       discord.VerificationLevel.low,
        "medium":    discord.VerificationLevel.medium,
        "high":      discord.VerificationLevel.high,
        "very_high": discord.VerificationLevel.highest,
    }
    n_map = {
        "all_messages":  discord.NotificationLevel.all_messages,
        "only_mentions": discord.NotificationLevel.only_mentions,
    }
    c_map = {
        "disabled":       discord.ContentFilter.disabled,
        "no_role":        discord.ContentFilter.no_role,
        "all_members":    discord.ContentFilter.all_members,
    }

    edits: dict[str, Any] = {}
    vl = features.get("verification_level")
    if vl and guild.verification_level != v_level_map.get(vl):
        edits["verification_level"] = v_level_map[vl]

    nl = features.get("default_notifications")
    if nl and guild.default_notifications != n_map.get(nl):
        edits["default_notifications"] = n_map[nl]

    ef = features.get("explicit_content_filter")
    if ef and guild.explicit_content_filter != c_map.get(ef):
        edits["explicit_content_filter"] = c_map[ef]

    sys_ch = features.get("system_channel")
    if sys_ch:
        ch = channels_by_name.get(sys_ch.lower().replace(" ", "-"))
        if ch and guild.system_channel != ch:
            edits["system_channel"] = ch

    afk_timeout = features.get("afk_timeout_seconds")
    if afk_timeout and guild.afk_timeout != afk_timeout:
        edits["afk_timeout"] = afk_timeout

    if not edits:
        log.info("OK community features (no drift)")
        return

    if dry_run:
        log.info("[DRY] UPDATE community features: %s", list(edits.keys()))
    else:
        await guild.edit(reason="setup-server community features", **edits)
        log.info("UPDATED community features: %s", list(edits.keys()))

    # rules_channel + updates_channel require Community mode to be enabled first
    rules_name = features.get("rules_channel")
    updates_name = features.get("updates_channel")
    if rules_name or updates_name:
        log.info(
            "Community-mode channels (rules=%s, updates=%s) must be set via "
            "Server Settings → Enable Community after this script. See README.md.",
            rules_name, updates_name,
        )


# ─────────────────────────────────────────────────────────────────────────────
# Entry point
# ─────────────────────────────────────────────────────────────────────────────
async def run(dry_run: bool) -> None:
    token = os.environ.get("DISCORD_BOT_TOKEN")
    guild_id_str = os.environ.get("DISCORD_GUILD_ID")
    if not token:
        log.error("DISCORD_BOT_TOKEN not set")
        sys.exit(2)
    if not guild_id_str:
        log.error("DISCORD_GUILD_ID not set")
        sys.exit(2)
    guild_id = int(guild_id_str)

    config = load_config()
    log.info("Loaded config: %d roles, %d categories", len(config["roles"]), len(config["categories"]))
    log.info("Mode: %s", "DRY RUN" if dry_run else "APPLY")

    intents = discord.Intents.default()
    intents.members = True
    intents.message_content = False

    client = discord.Client(intents=intents)
    ready = asyncio.Event()

    result: dict[str, Any] = {}

    @client.event
    async def on_ready() -> None:
        try:
            guild = client.get_guild(guild_id)
            if guild is None:
                log.error("Bot is not in guild %d — invite it first with admin perms.", guild_id)
                await client.close()
                return

            log.info("Connected to guild: %s (%d members)", guild.name, guild.member_count or -1)

            roles_by_name = await sync_roles(guild, config["roles"], dry_run)

            cat_count, ch_count = await sync_categories_and_channels(
                guild, config["categories"], roles_by_name, dry_run,
            )

            # Refresh channels for community-feature lookups
            channels_by_name = {c.name: c for c in guild.channels}
            await apply_community_features(
                guild,
                config["server"]["community_features"],
                channels_by_name,
                dry_run,
            )

            result.update({
                "guild_id": guild_id,
                "guild_name": guild.name,
                "role_count": len(roles_by_name),
                "category_count": cat_count,
                "channel_count": ch_count,
                "dry_run": dry_run,
                "run_at": datetime.now(timezone.utc).isoformat(),
            })
        finally:
            ready.set()
            await client.close()

    await client.start(token)
    await ready.wait()

    if not dry_run and result:
        STATE_PATH.write_text(json.dumps(result, indent=2), encoding="utf-8")
        log.info("Wrote %s", STATE_PATH.name)

    log.info("Done. Summary: %s", json.dumps(result, indent=2, default=str))


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--dry-run", action="store_true", help="Preview only, no mutations.")
    args = p.parse_args()
    asyncio.run(run(args.dry_run))


if __name__ == "__main__":
    main()
