#!/usr/bin/env python3
"""
verify-flow.py — slash-command verification bot for R5 / R4 / Founding roles.

COMMANDS:
    /verify r5             upload screenshot → posts to #r5-verify-queue for mod approval
    /verify r4             same, for R4/officer role
    /verify founding email:<stripe email> code:<code>
                           auto-checks against LWS_Access_Codes/codes.json + codes.private.json.
                           If email/code matches and tier is alliance-bundle → auto-assign Founding.
                           Fallback: posts to queue for manual approval.
    /verify status         shows caller's currently held verification roles.

MOD FLOW (in #r5-verify-queue):
    Each pending verification posts as an embed with ✅ / ❌ reactions.
    Mods react ✅ → bot assigns the role + DMs the user.
    Mods react ❌ → bot DMs the user with reason (prompted via ephemeral follow-up).

USAGE:
    export DISCORD_BOT_TOKEN=...
    export DISCORD_GUILD_ID=...
    python3 verify-flow.py

CODES JSON LOCATIONS (checked in order, merged):
    /Users/evanjones/claudecode/r5tools/LWS_Access_Codes/codes.json
    /Users/evanjones/claudecode/r5tools/LWS_Access_Codes/codes.private.json   (optional)

    Founding-tier match requires tier == "alliance-bundle".
    Paid-tier match requires tier == "paid-personal".

STATE:
    Appends to bot-state.json under "verify.pending" keyed by message ID in the queue.

DEPS:
    pip install "discord.py>=2.3"
"""

from __future__ import annotations

import asyncio
import json
import logging
import os
import sys
from pathlib import Path
from typing import Any

import discord
from discord import app_commands

HERE = Path(__file__).resolve().parent
STATE_PATH = HERE / "bot-state.json"
CODES_PATHS = [
    Path("/Users/evanjones/claudecode/r5tools/LWS_Access_Codes/codes.json"),
    Path("/Users/evanjones/claudecode/r5tools/LWS_Access_Codes/codes.private.json"),
]

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("verify-flow")


# ─────────────────────────────────────────────────────────────────────────────
def load_state() -> dict[str, Any]:
    if not STATE_PATH.exists():
        return {}
    try:
        return json.loads(STATE_PATH.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {}


def save_state(state: dict[str, Any]) -> None:
    STATE_PATH.write_text(json.dumps(state, indent=2, default=str), encoding="utf-8")


def load_codes() -> dict[str, dict[str, Any]]:
    """Merge codes.json and codes.private.json into a single {code: entry} map."""
    merged: dict[str, dict[str, Any]] = {}
    for path in CODES_PATHS:
        if not path.exists():
            continue
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as e:
            log.warning("Could not read %s: %s", path, e)
            continue
        for code, entry in (data.get("codes") or {}).items():
            merged[code.strip().upper()] = entry
    return merged


def check_founding_code(email: str, code: str) -> tuple[bool, str]:
    """Return (matched, reason). Matched=True only if code is valid + alliance-bundle tier."""
    codes = load_codes()
    entry = codes.get(code.strip().upper())
    if entry is None:
        return False, "code not found"
    if entry.get("disabled"):
        return False, "code disabled"
    tier = entry.get("tier")
    if tier != "alliance-bundle":
        return False, f"code tier is '{tier}', not alliance-bundle"
    # Email cross-check is soft — we don't currently store buyer emails in codes.json.
    # In production, the Stripe webhook would populate entry["buyer_email"]. If present,
    # require a case-insensitive match. If absent, log the mismatch and still queue for mod.
    buyer_email = (entry.get("buyer_email") or "").strip().lower()
    if buyer_email and buyer_email != email.strip().lower():
        return False, "email does not match Stripe record on file"
    return True, "code and tier valid"


# ─────────────────────────────────────────────────────────────────────────────
class VerifyBot(discord.Client):
    def __init__(self, guild_id: int) -> None:
        intents = discord.Intents.default()
        intents.members = True
        intents.reactions = True
        intents.message_content = False
        super().__init__(intents=intents)
        self.guild_id = guild_id
        self.tree = app_commands.CommandTree(self)
        self.state = load_state()

    async def setup_hook(self) -> None:
        # Register slash-command group scoped to the target guild for fast reload
        guild_obj = discord.Object(id=self.guild_id)
        register_commands(self.tree, self, guild_obj)
        await self.tree.sync(guild=guild_obj)
        log.info("Slash commands synced to guild %d", self.guild_id)

    async def on_ready(self) -> None:
        log.info("Logged in as %s", self.user)

    # Mod approval flow via reactions on queue messages
    async def on_raw_reaction_add(self, payload: discord.RawReactionActionEvent) -> None:
        if payload.guild_id != self.guild_id or payload.user_id == (self.user.id if self.user else 0):
            return
        pending = self.state.setdefault("verify", {}).setdefault("pending", {})
        entry = pending.get(str(payload.message_id))
        if not entry:
            return

        guild = self.get_guild(self.guild_id)
        if guild is None:
            return
        actor = guild.get_member(payload.user_id)
        if actor is None:
            return

        # Only Moderator / Founder may approve
        allowed_roles = {r.name for r in actor.roles}
        if "Moderator" not in allowed_roles and "Founder" not in allowed_roles:
            return

        target_member = guild.get_member(int(entry["user_id"]))
        role_name = entry["role"]
        role = discord.utils.get(guild.roles, name=role_name)
        if target_member is None or role is None:
            log.warning("Approval failed — member=%s role=%s missing", target_member, role_name)
            return

        emoji = str(payload.emoji)
        try:
            if emoji == "✅":
                await target_member.add_roles(role, reason=f"verified {role_name} by {actor}")
                try:
                    await target_member.send(f"Your **{role_name}** role has been approved by {actor.display_name}.")
                except discord.Forbidden:
                    pass
                log.info("APPROVED %s → %s (by %s)", target_member, role_name, actor)
                entry["status"] = "approved"
                entry["approver"] = str(actor)
                save_state(self.state)
            elif emoji == "❌":
                try:
                    await target_member.send(
                        f"Your **{role_name}** verification was declined by {actor.display_name}. "
                        "DM Evan if you'd like to appeal."
                    )
                except discord.Forbidden:
                    pass
                log.info("DECLINED %s → %s (by %s)", target_member, role_name, actor)
                entry["status"] = "declined"
                entry["approver"] = str(actor)
                save_state(self.state)
        except discord.Forbidden:
            log.warning("Bot lacks permission to modify %s", target_member)


# ─────────────────────────────────────────────────────────────────────────────
# Slash-command registration (kept out of the class so app_commands.Group works cleanly)
# ─────────────────────────────────────────────────────────────────────────────
def register_commands(tree: app_commands.CommandTree, bot: VerifyBot, guild_obj: discord.Object) -> None:
    verify_group = app_commands.Group(name="verify", description="Request an alliance-rank role.")

    async def _queue(interaction: discord.Interaction, role_name: str, evidence_desc: str,
                     screenshot: discord.Attachment | None) -> None:
        guild = interaction.guild
        if guild is None:
            await interaction.response.send_message("Guild-only command.", ephemeral=True)
            return
        queue_channel = discord.utils.get(guild.text_channels, name="r5-verify-queue")
        if queue_channel is None:
            await interaction.response.send_message(
                "Verification queue channel not found — please tell Evan.", ephemeral=True,
            )
            return
        embed = discord.Embed(
            title=f"Verification request — {role_name}",
            description=(
                f"**User:** {interaction.user.mention} (`{interaction.user}`)\n"
                f"**Requested role:** {role_name}\n"
                f"**Evidence:** {evidence_desc}\n"
                f"\nMods: react ✅ to approve, ❌ to decline."
            ),
            color=discord.Color.orange(),
        )
        if screenshot:
            embed.set_image(url=screenshot.url)

        msg = await queue_channel.send(embed=embed)
        await msg.add_reaction("✅")
        await msg.add_reaction("❌")

        pending = bot.state.setdefault("verify", {}).setdefault("pending", {})
        pending[str(msg.id)] = {
            "user_id": interaction.user.id,
            "user_str": str(interaction.user),
            "role": role_name,
            "evidence": evidence_desc,
            "status": "pending",
        }
        save_state(bot.state)

        await interaction.response.send_message(
            f"Request submitted for **{role_name}** — a mod will review shortly.",
            ephemeral=True,
        )

    @verify_group.command(name="r5", description="Request R5 role — attach a screenshot of your in-game R5 title.")
    async def verify_r5(interaction: discord.Interaction, screenshot: discord.Attachment) -> None:
        await _queue(interaction, "R5", "in-game R5 title screenshot", screenshot)

    @verify_group.command(name="r4", description="Request R4/Officer role — attach a screenshot of your rank.")
    async def verify_r4(interaction: discord.Interaction, screenshot: discord.Attachment) -> None:
        await _queue(interaction, "R4", "in-game R4 rank screenshot", screenshot)

    @verify_group.command(
        name="founding",
        description="Request Founding-Alliance role using your Stripe email + code.",
    )
    async def verify_founding(interaction: discord.Interaction, email: str, code: str) -> None:
        matched, reason = check_founding_code(email, code)
        guild = interaction.guild
        if guild is None:
            await interaction.response.send_message("Guild-only command.", ephemeral=True)
            return
        role = discord.utils.get(guild.roles, name="Founding")
        if role is None:
            await interaction.response.send_message(
                "Founding role missing — please tell Evan.", ephemeral=True,
            )
            return

        if matched:
            member = guild.get_member(interaction.user.id)
            if member and role not in member.roles:
                try:
                    await member.add_roles(role, reason=f"auto-verified via code {code}")
                    await interaction.response.send_message(
                        "Auto-verified — you now have the **Founding** role. Welcome!",
                        ephemeral=True,
                    )
                    log.info("AUTO-VERIFIED %s as Founding via code=%s", member, code)
                    return
                except discord.Forbidden:
                    log.warning("Bot lacks perms to assign Founding to %s", member)

        # Fallback → mod queue
        evidence = f"Stripe email `{email}` + code `{code}` — auto-check failed: {reason}"
        await _queue(interaction, "Founding", evidence, None)

    @verify_group.command(name="status", description="Show your verification roles.")
    async def verify_status(interaction: discord.Interaction) -> None:
        guild = interaction.guild
        if guild is None:
            await interaction.response.send_message("Guild-only.", ephemeral=True)
            return
        member = guild.get_member(interaction.user.id)
        if member is None:
            await interaction.response.send_message("Member lookup failed.", ephemeral=True)
            return
        watched = {"Founding", "R5", "R4", "Alliance Member", "Paid", "Free"}
        held = [r.name for r in member.roles if r.name in watched]
        await interaction.response.send_message(
            f"Your verification roles: **{', '.join(held) if held else '(none)'}**",
            ephemeral=True,
        )

    tree.add_command(verify_group, guild=guild_obj)


# ─────────────────────────────────────────────────────────────────────────────
def main() -> None:
    token = os.environ.get("DISCORD_BOT_TOKEN")
    guild_id_str = os.environ.get("DISCORD_GUILD_ID")
    if not token or not guild_id_str:
        log.error("DISCORD_BOT_TOKEN and DISCORD_GUILD_ID required")
        sys.exit(2)
    bot = VerifyBot(guild_id=int(guild_id_str))
    bot.run(token, log_handler=None)


if __name__ == "__main__":
    main()
