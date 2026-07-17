#!/usr/bin/env python3
"""
content-seeder.py — pre-seed the first 30 days of channel content.

WHAT IT DOES:
    1. Parses `marketing/content-calendar/tips-en.md` into ~30 tips.
    2. Posts one tip per day into #tools-help (Discord variant, ≤100 char body + tool tag).
    3. Posts weekly milestone announcements (7-day cadence) into #announcements.

MODES:
    --dry-run          print what would post, mutate nothing
    --once             post today's tip only (for cron use)
    --loop             run forever, post at 08:00 CT daily
    --backfill N       post the next N tips right now, spaced 5 seconds apart
                       (useful for pre-loading before the server is public)

SCHEDULING:
    Idempotent by tip index. bot-state.json tracks the last-posted tip number,
    so re-running --once on the same day is a no-op.

USAGE:
    export DISCORD_BOT_TOKEN=...
    export DISCORD_GUILD_ID=...
    python3 content-seeder.py --backfill 3 --dry-run
    python3 content-seeder.py --once
    python3 content-seeder.py --loop &

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
from datetime import datetime, time as dtime, timedelta, timezone
from pathlib import Path
from typing import Any

import discord

HERE = Path(__file__).resolve().parent
STATE_PATH = HERE / "bot-state.json"
TIPS_PATH = Path("/Users/evanjones/claudecode/r5tools/r5tools-landing/marketing/content-calendar/tips-en.md")

# US Central Time approximation (fixed −5 UTC, does NOT account for DST — good enough for a loop).
CT_OFFSET = timedelta(hours=-5)
DAILY_POST_TIME_CT = dtime(hour=8, minute=0)

WEEKLY_MILESTONES = [
    "Week 1 — Onboarding open. Free code `RONY-FREE` unlocks every tool. Any warzone.",
    "Week 2 — Landing Planner update: Ministry-seat warnings + PNG export improvements.",
    "Week 3 — Roster Extractor got a Korean-name accuracy pass. Screenshot us any misses.",
    "Week 4 — Freeze Risk Dashboard is now the fastest way to catch under-heated members before a −70C blizzard.",
]

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("content-seeder")


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
# Tip-file parser
# ─────────────────────────────────────────────────────────────────────────────
TIP_HEADER_RE = re.compile(r"^##\s+Tip\s+(\d+)\s+—\s+(.+)$", re.MULTILINE)
DISCORD_BODY_RE = re.compile(r"^\*\*Body\s*\(Discord[^)]*\)\*\*:\s*(.+)$", re.MULTILINE)
TOOL_TAG_RE = re.compile(r"^\*\*Related tool:\*\*\s*(.+)$", re.MULTILINE)


def parse_tips(md: str) -> list[dict[str, str]]:
    """Split tips-en.md into a list of {n, title, body, tool} dicts."""
    tips: list[dict[str, str]] = []
    # Split by tip header — first chunk before Tip 1 is preamble.
    parts = TIP_HEADER_RE.split(md)
    # After split: [preamble, n1, title1, chunk1, n2, title2, chunk2, ...]
    if len(parts) < 4:
        return tips
    for i in range(1, len(parts), 3):
        try:
            n = int(parts[i])
            title = parts[i + 1].strip()
            chunk = parts[i + 2]
        except (IndexError, ValueError):
            continue
        body_match = DISCORD_BODY_RE.search(chunk)
        tool_match = TOOL_TAG_RE.search(chunk)
        body = body_match.group(1).strip() if body_match else title
        tool = tool_match.group(1).strip().rstrip(".") if tool_match else ""
        tips.append({
            "n": str(n),
            "title": title,
            "body": body,
            "tool": tool,
        })
    return tips


def format_tip_post(tip: dict[str, str]) -> str:
    tool_line = f" — *{tip['tool']}*" if tip["tool"] else ""
    return f"**Daily Tip #{tip['n']} — {tip['title']}**{tool_line}\n{tip['body']}"


# ─────────────────────────────────────────────────────────────────────────────
# Posting
# ─────────────────────────────────────────────────────────────────────────────
async def post_tip(
    guild: discord.Guild, tip: dict[str, str], dry_run: bool,
) -> None:
    channel = discord.utils.get(guild.text_channels, name="tools-help")
    if channel is None:
        log.error("#tools-help not found; run setup-server.py first.")
        return
    body = format_tip_post(tip)
    if dry_run:
        log.info("[DRY] tools-help ← Tip #%s (%d chars)", tip["n"], len(body))
        return
    await channel.send(body)
    log.info("Posted Tip #%s to #tools-help", tip["n"])


async def post_weekly_milestone(
    guild: discord.Guild, week_index: int, dry_run: bool,
) -> None:
    channel = discord.utils.get(guild.text_channels, name="announcements")
    if channel is None:
        log.error("#announcements not found; run setup-server.py first.")
        return
    if week_index >= len(WEEKLY_MILESTONES):
        log.info("No milestone defined for week %d; skipping.", week_index + 1)
        return
    body = WEEKLY_MILESTONES[week_index]
    if dry_run:
        log.info("[DRY] announcements ← Week %d milestone", week_index + 1)
        return
    await channel.send(body)
    log.info("Posted Week %d milestone to #announcements", week_index + 1)


# ─────────────────────────────────────────────────────────────────────────────
async def run_once(
    client: discord.Client, guild_id: int, tips: list[dict[str, str]],
    dry_run: bool, index_override: int | None = None,
) -> None:
    """Post the current-day tip (and Sunday milestone) exactly once."""
    guild = client.get_guild(guild_id)
    if guild is None:
        log.error("Not in guild %d", guild_id)
        return

    state = load_state()
    s_seed = state.setdefault("seeder", {})
    today_ct = (datetime.now(timezone.utc) + CT_OFFSET).date()
    last_iso = s_seed.get("last_tip_date")

    if index_override is not None:
        idx = index_override
    else:
        # Count days elapsed from first-post date.
        first_iso = s_seed.get("first_tip_date")
        if not first_iso:
            first_date = today_ct
            s_seed["first_tip_date"] = today_ct.isoformat()
        else:
            first_date = datetime.fromisoformat(first_iso).date()
        idx = (today_ct - first_date).days

    if last_iso and last_iso == today_ct.isoformat() and index_override is None:
        log.info("Already posted a tip today (%s); skipping.", today_ct.isoformat())
        return

    if idx < 0 or idx >= len(tips):
        log.info("No tip available for day-offset %d (tips=%d); skipping.", idx, len(tips))
        return

    await post_tip(guild, tips[idx], dry_run)

    # Weekly milestone on Sunday (weekday 6)
    if today_ct.weekday() == 6:
        week_index = idx // 7
        await post_weekly_milestone(guild, week_index, dry_run)

    if not dry_run:
        s_seed["last_tip_date"] = today_ct.isoformat()
        s_seed["last_tip_index"] = idx
        save_state(state)


async def run_backfill(
    client: discord.Client, guild_id: int, tips: list[dict[str, str]],
    count: int, dry_run: bool,
) -> None:
    guild = client.get_guild(guild_id)
    if guild is None:
        log.error("Not in guild %d", guild_id)
        return
    for i in range(min(count, len(tips))):
        await post_tip(guild, tips[i], dry_run)
        await asyncio.sleep(5)   # gentle spacing; discord.py handles 429s


async def run_loop(
    client: discord.Client, guild_id: int, tips: list[dict[str, str]], dry_run: bool,
) -> None:
    while not client.is_closed():
        now_utc = datetime.now(timezone.utc)
        now_ct = now_utc + CT_OFFSET
        next_post_ct = datetime.combine(now_ct.date(), DAILY_POST_TIME_CT, tzinfo=timezone.utc) - CT_OFFSET
        if next_post_ct <= now_utc:
            next_post_ct += timedelta(days=1)
        wait_seconds = (next_post_ct - now_utc).total_seconds()
        log.info("Sleeping %.0fs until next post window (%s UTC).",
                 wait_seconds, next_post_ct.isoformat(timespec="minutes"))
        await asyncio.sleep(wait_seconds)
        try:
            await run_once(client, guild_id, tips, dry_run)
        except Exception:
            log.exception("run_once failed; will retry tomorrow.")


# ─────────────────────────────────────────────────────────────────────────────
async def main_async(args: argparse.Namespace) -> None:
    token = os.environ.get("DISCORD_BOT_TOKEN")
    guild_id_str = os.environ.get("DISCORD_GUILD_ID")
    if not token or not guild_id_str:
        log.error("DISCORD_BOT_TOKEN and DISCORD_GUILD_ID required")
        sys.exit(2)
    guild_id = int(guild_id_str)

    if not TIPS_PATH.exists():
        log.warning("tips-en.md not found at %s — nothing to seed.", TIPS_PATH)
        sys.exit(0)
    tips = parse_tips(TIPS_PATH.read_text(encoding="utf-8"))
    log.info("Parsed %d tips from %s", len(tips), TIPS_PATH.name)
    if not tips:
        log.warning("No tips parsed; check tips-en.md format.")
        sys.exit(0)

    intents = discord.Intents.default()
    intents.members = False
    intents.message_content = False
    client = discord.Client(intents=intents)

    ready = asyncio.Event()

    @client.event
    async def on_ready() -> None:
        try:
            if args.backfill:
                await run_backfill(client, guild_id, tips, args.backfill, args.dry_run)
            elif args.once:
                await run_once(client, guild_id, tips, args.dry_run)
            elif args.loop:
                await run_loop(client, guild_id, tips, args.dry_run)
            else:
                # default → --once behavior
                await run_once(client, guild_id, tips, args.dry_run)
        finally:
            ready.set()
            if not args.loop:
                await client.close()

    await client.start(token)
    await ready.wait()


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--dry-run", action="store_true")
    mode = p.add_mutually_exclusive_group()
    mode.add_argument("--once", action="store_true", help="Post today's tip and exit.")
    mode.add_argument("--loop", action="store_true", help="Run forever, post at 08:00 CT daily.")
    mode.add_argument("--backfill", type=int, default=0, help="Post N tips now, spaced 5s.")
    args = p.parse_args()
    asyncio.run(main_async(args))


if __name__ == "__main__":
    main()
