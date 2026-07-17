#!/usr/bin/env python3
"""
launch-week-broadcast.py — one-shot ProductHunt-launch-day broadcast to the server.

WHAT IT DOES:
    1. Parses `marketing/discord/launch-posts.md` to extract:
         - LONG variant (English)
         - LONG variant (Korean)
         - SHORT variant (English — for @everyone teaser)
    2. Posts LONG-EN into #announcements → pins it
    3. Posts LONG-KR into #kr-community → pins it
    4. Sends SHORT-EN + link into #announcements with an @everyone mention
       (THIS IS THE ONLY SCRIPT IN THIS BUNDLE THAT USES @everyone — deliberate.)

SCHEDULE:
    Default target time is Tuesday 2026-07-28 12:15 AM Pacific Time
    (ProductHunt launches at 00:01 PT — we drop the community broadcast 14 min later
    so early-hunters click through to a live server + fresh announcement).

MODES:
    --dry-run             print what would post, mutate nothing
    --schedule            sleep until the target datetime, then broadcast
    --send-now            broadcast immediately (skip the schedule)
    --unpin               unpin any previously-pinned launch messages (cleanup)

RE-RUN SAFETY:
    Once broadcast successfully, state["launch_broadcast"]["completed"] = true.
    Re-running without --force is a no-op. Use --force to re-broadcast intentionally.

USAGE:
    export DISCORD_BOT_TOKEN=...
    export DISCORD_GUILD_ID=...
    python3 launch-week-broadcast.py --dry-run
    python3 launch-week-broadcast.py --schedule           # blocks until launch time
    python3 launch-week-broadcast.py --send-now           # fire immediately

DEPS:
    pip install "discord.py>=2.3"
"""

from __future__ import annotations

import argparse
import asyncio
import json
import logging
import os
import re
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

import discord

HERE = Path(__file__).resolve().parent
STATE_PATH = HERE / "bot-state.json"
LAUNCH_POSTS_PATH = Path(
    "/Users/evanjones/claudecode/r5tools/r5tools-landing/marketing/discord/launch-posts.md"
)

# ProductHunt launch time: 2026-07-28 00:01 Pacific → we go at 00:15 PT.
# Pacific in late July = PDT = UTC−7. Target = 07:15 UTC.
LAUNCH_TARGET_UTC = datetime(2026, 7, 28, 7, 15, tzinfo=timezone.utc)

# Discord hard limit
MAX_MESSAGE_CHARS = 2000

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("launch-broadcast")


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


# ─────────────────────────────────────────────────────────────────────────────
# Parser — pulls SHORT-EN / LONG-EN / LONG-KR out of launch-posts.md
# ─────────────────────────────────────────────────────────────────────────────
def parse_launch_posts(md: str) -> dict[str, str]:
    """Return {short_en, long_en, long_kr} bodies, blockquote markers stripped."""
    sections: dict[str, str] = {}

    # SHORT section — English
    m = re.search(r"##\s+SHORT[\s\S]*?###\s+English\s*\n\n>\s*(.+?)\n\n", md)
    if m:
        sections["short_en"] = m.group(1).strip()

    # LONG section — split by "### 한국어" to get EN/KR halves
    m_long = re.search(r"##\s+LONG[\s\S]+?(?=\n##\s|\Z)", md)
    if m_long:
        long_block = m_long.group(0)
        # English portion — from "### English" up to "### 한국어"
        m_en = re.search(r"###\s+English\s*\n([\s\S]+?)(?=\n###\s+한국어)", long_block)
        m_kr = re.search(r"###\s+한국어\s*\n([\s\S]+?)(?=\n---|\Z)", long_block)
        if m_en:
            sections["long_en"] = _clean_long(m_en.group(1))
        if m_kr:
            sections["long_kr"] = _clean_long(m_kr.group(1))

    return sections


def _clean_long(raw: str) -> str:
    """Drop leading `**Title:**` heading; keep the rest of the body intact."""
    text = raw.strip()
    # Drop the title line if it's the first bolded line
    text = re.sub(r"^\*\*(?:Title|제목)[^*]*\*\*\s*\n\n?", "", text, count=1)
    # Trim trailing signature to keep pinned messages tight
    text = re.sub(r"\n\s*—\s*Evan[^\n]*$", "", text.strip())
    return text.strip()


def chunk_message(text: str, limit: int = MAX_MESSAGE_CHARS) -> list[str]:
    """Split on paragraph boundaries so we never break mid-sentence."""
    if len(text) <= limit:
        return [text]
    parts: list[str] = []
    buf: list[str] = []
    running = 0
    for para in text.split("\n\n"):
        add_len = len(para) + (2 if buf else 0)
        if running + add_len > limit:
            if buf:
                parts.append("\n\n".join(buf))
                buf = [para]
                running = len(para)
            else:
                # single paragraph > limit — hard split
                for i in range(0, len(para), limit):
                    parts.append(para[i:i + limit])
                buf = []
                running = 0
        else:
            buf.append(para)
            running += add_len
    if buf:
        parts.append("\n\n".join(buf))
    return parts


# ─────────────────────────────────────────────────────────────────────────────
async def broadcast(client: discord.Client, guild_id: int, dry_run: bool) -> None:
    guild = client.get_guild(guild_id)
    if guild is None:
        log.error("Not in guild %d", guild_id)
        return

    posts = parse_launch_posts(LAUNCH_POSTS_PATH.read_text(encoding="utf-8"))
    missing = [k for k in ("short_en", "long_en", "long_kr") if k not in posts]
    if missing:
        log.error("launch-posts.md missing sections: %s", missing)
        sys.exit(3)
    log.info("Parsed sections: short_en=%d chars, long_en=%d chars, long_kr=%d chars",
             len(posts["short_en"]), len(posts["long_en"]), len(posts["long_kr"]))

    announcements = discord.utils.get(guild.text_channels, name="announcements")
    kr_channel = discord.utils.get(guild.text_channels, name="kr-community")
    if announcements is None or kr_channel is None:
        log.error("Missing #announcements or #kr-community — run setup-server.py.")
        return

    state = load_state()
    launch_state = state.setdefault("launch_broadcast", {})
    launch_state.setdefault("pinned_message_ids", [])

    # ── LONG EN → #announcements, pin ──────────────────────────────────
    for i, chunk in enumerate(chunk_message(posts["long_en"])):
        if dry_run:
            log.info("[DRY] #announcements ← LONG_EN chunk %d (%d chars)", i + 1, len(chunk))
            continue
        msg = await announcements.send(chunk)
        if i == 0:
            try:
                await msg.pin(reason="launch-day broadcast (EN)")
                launch_state["pinned_message_ids"].append({"channel": announcements.id, "message": msg.id})
                log.info("Pinned LONG_EN message id=%s in #announcements", msg.id)
            except discord.HTTPException as e:
                log.warning("Failed to pin: %s", e)
        await asyncio.sleep(1.0)

    # ── LONG KR → #kr-community, pin ───────────────────────────────────
    for i, chunk in enumerate(chunk_message(posts["long_kr"])):
        if dry_run:
            log.info("[DRY] #kr-community ← LONG_KR chunk %d (%d chars)", i + 1, len(chunk))
            continue
        msg = await kr_channel.send(chunk)
        if i == 0:
            try:
                await msg.pin(reason="launch-day broadcast (KR)")
                launch_state["pinned_message_ids"].append({"channel": kr_channel.id, "message": msg.id})
                log.info("Pinned LONG_KR message id=%s in #kr-community", msg.id)
            except discord.HTTPException as e:
                log.warning("Failed to pin: %s", e)
        await asyncio.sleep(1.0)

    # ── SHORT EN → #announcements w/ @everyone (deliberate) ─────────────
    teaser = f"@everyone — **r5tools is live on Product Hunt.**\n\n{posts['short_en']}\n\nhttps://r5tools.io"
    if dry_run:
        log.info("[DRY] #announcements ← SHORT_EN teaser w/ @everyone (%d chars)", len(teaser))
    else:
        teaser_msg = await announcements.send(
            teaser,
            allowed_mentions=discord.AllowedMentions(everyone=True, users=False, roles=False),
        )
        launch_state["pinned_message_ids"].append(
            {"channel": announcements.id, "message": teaser_msg.id, "teaser": True}
        )
        log.info("Posted SHORT_EN teaser w/ @everyone id=%s", teaser_msg.id)

    if not dry_run:
        launch_state["completed"] = True
        launch_state["completed_at"] = datetime.now(timezone.utc).isoformat()
        save_state(state)


async def unpin_previous(client: discord.Client, guild_id: int, dry_run: bool) -> None:
    guild = client.get_guild(guild_id)
    if guild is None:
        return
    state = load_state()
    pinned = state.get("launch_broadcast", {}).get("pinned_message_ids", [])
    for ref in pinned:
        ch = guild.get_channel(int(ref["channel"]))
        if ch is None:
            continue
        try:
            msg = await ch.fetch_message(int(ref["message"]))
        except (discord.NotFound, discord.Forbidden):
            continue
        if dry_run:
            log.info("[DRY] unpin msg %s in #%s", msg.id, ch.name)
        else:
            try:
                await msg.unpin(reason="launch-week-broadcast --unpin")
                log.info("Unpinned msg %s in #%s", msg.id, ch.name)
            except discord.HTTPException as e:
                log.warning("Unpin failed: %s", e)


# ─────────────────────────────────────────────────────────────────────────────
async def main_async(args: argparse.Namespace) -> None:
    token = os.environ.get("DISCORD_BOT_TOKEN")
    guild_id_str = os.environ.get("DISCORD_GUILD_ID")
    if not token or not guild_id_str:
        log.error("DISCORD_BOT_TOKEN and DISCORD_GUILD_ID required")
        sys.exit(2)
    guild_id = int(guild_id_str)

    state = load_state()
    if state.get("launch_broadcast", {}).get("completed") and not args.force and not args.unpin:
        log.info("Launch broadcast already marked completed. Use --force to re-run.")
        return

    intents = discord.Intents.default()
    intents.members = False
    intents.message_content = False
    client = discord.Client(intents=intents)
    ready = asyncio.Event()

    @client.event
    async def on_ready() -> None:
        try:
            if args.unpin:
                await unpin_previous(client, guild_id, args.dry_run)
                return
            if args.schedule and not args.send_now:
                now = datetime.now(timezone.utc)
                if LAUNCH_TARGET_UTC > now:
                    wait_s = (LAUNCH_TARGET_UTC - now).total_seconds()
                    log.info("Sleeping %.0fs until launch time (%s UTC)...",
                             wait_s, LAUNCH_TARGET_UTC.isoformat())
                    await asyncio.sleep(wait_s)
                else:
                    log.info("Launch time already passed — broadcasting immediately.")
            await broadcast(client, guild_id, args.dry_run)
        finally:
            ready.set()
            await client.close()

    await client.start(token)
    await ready.wait()


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--dry-run", action="store_true")
    mode = p.add_mutually_exclusive_group()
    mode.add_argument("--schedule", action="store_true",
                      help="Sleep until the ProductHunt launch time, then broadcast.")
    mode.add_argument("--send-now", action="store_true",
                      help="Broadcast immediately, no schedule.")
    mode.add_argument("--unpin", action="store_true",
                      help="Unpin any previously-pinned launch messages.")
    p.add_argument("--force", action="store_true",
                   help="Re-broadcast even if state marks it completed.")
    args = p.parse_args()
    asyncio.run(main_async(args))


if __name__ == "__main__":
    main()
