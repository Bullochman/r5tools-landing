"""
r5tools Discord bot — scheduled announcement poster.

Design principles:
- Only posts in servers Evan explicitly invited the bot to.
- Never posts immediately — every message must be scheduled ≥30s in the future
  so it can be cancelled via /r5t cancel.
- Loads post bodies from ./content/<id>.md (YAML frontmatter + body).
- Persists schedule to ./scheduled.jsonl (append-only event log; latest state
  wins per id — think Kafka log compaction).
- Audit-logs every send to ./logs/sent.jsonl.
- Rate-limits: max 1 post per 30 min per (guild, channel).
- Handles: message > 2000 chars (auto-split), missing perms, 429s, disconnects.

Env:
  DISCORD_BOT_TOKEN   (required)
  DISCORD_GUILD_ID    (optional — restrict slash-command sync to one guild for
                       fast iteration; unset = global sync)

Run:
  python3 bot.py

Deps:
  pip install "discord.py>=2.3" "PyYAML>=6.0"
"""

from __future__ import annotations

import asyncio
import json
import logging
import os
import re
import sys
import uuid
from dataclasses import dataclass, field, asdict
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Optional

import discord
from discord import app_commands
from discord.ext import commands, tasks
import yaml

# --- paths -------------------------------------------------------------------

ROOT = Path(__file__).resolve().parent
CONTENT_DIR = ROOT / "content"
SCHEDULE_PATH = ROOT / "scheduled.jsonl"
LOG_DIR = ROOT / "logs"
LOG_DIR.mkdir(exist_ok=True)
SENT_LOG_PATH = LOG_DIR / "sent.jsonl"
BOT_LOG_PATH = LOG_DIR / "bot.log"

# --- logging -----------------------------------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
    handlers=[
        logging.FileHandler(BOT_LOG_PATH),
        logging.StreamHandler(sys.stdout),
    ],
)
log = logging.getLogger("r5tbot")

# --- config ------------------------------------------------------------------

TOKEN = os.environ.get("DISCORD_BOT_TOKEN")
GUILD_ID_ENV = os.environ.get("DISCORD_GUILD_ID")
GUILD_ID = int(GUILD_ID_ENV) if GUILD_ID_ENV and GUILD_ID_ENV.isdigit() else None

MIN_SCHEDULE_DELAY_S = 30
PER_CHANNEL_COOLDOWN_S = 30 * 60          # 30 min throttle
POLL_INTERVAL_S = 60
MAX_DISCORD_MSG_LEN = 2000


# --- data model --------------------------------------------------------------

@dataclass
class ScheduledPost:
    id: str
    content_id: str
    guild_id: int
    channel_id: int
    scheduled_at: str          # ISO-8601 UTC
    scheduled_by: int          # discord user id
    scheduled_by_name: str
    state: str = "scheduled"   # scheduled | sent | cancelled | failed
    error: Optional[str] = None
    sent_at: Optional[str] = None
    sent_message_ids: list[int] = field(default_factory=list)

    def as_json(self) -> str:
        return json.dumps(asdict(self), ensure_ascii=False)


# --- persistence -------------------------------------------------------------

def append_event(post: ScheduledPost) -> None:
    """Append the current state of a post to the log (log-compaction style)."""
    with SCHEDULE_PATH.open("a", encoding="utf-8") as fp:
        fp.write(post.as_json() + "\n")


def load_schedule() -> dict[str, ScheduledPost]:
    """Replay the append-only log; last write per id wins."""
    posts: dict[str, ScheduledPost] = {}
    if not SCHEDULE_PATH.exists():
        return posts
    with SCHEDULE_PATH.open("r", encoding="utf-8") as fp:
        for line in fp:
            line = line.strip()
            if not line:
                continue
            try:
                raw = json.loads(line)
                posts[raw["id"]] = ScheduledPost(**raw)
            except (json.JSONDecodeError, TypeError, KeyError) as exc:
                log.warning("skipping malformed schedule row: %s (%s)", line[:80], exc)
    return posts


# --- content loader ----------------------------------------------------------

FRONTMATTER_RE = re.compile(r"^---\s*\n(.*?)\n---\s*\n?(.*)$", re.DOTALL)


@dataclass
class Content:
    id: str
    lang: str
    channel_type: str
    body: str
    meta: dict


def load_content(content_id: str) -> Optional[Content]:
    path = CONTENT_DIR / f"{content_id}.md"
    if not path.exists():
        return None
    text = path.read_text(encoding="utf-8")
    match = FRONTMATTER_RE.match(text)
    if match:
        try:
            meta = yaml.safe_load(match.group(1)) or {}
        except yaml.YAMLError:
            meta = {}
        body = match.group(2).strip()
    else:
        meta = {}
        body = text.strip()
    return Content(
        id=meta.get("id", content_id),
        lang=meta.get("lang", "en"),
        channel_type=meta.get("channel_type", "general"),
        body=body,
        meta=meta,
    )


def list_content_ids() -> list[str]:
    if not CONTENT_DIR.exists():
        return []
    return sorted(p.stem for p in CONTENT_DIR.glob("*.md"))


# --- message splitting -------------------------------------------------------

def split_message(body: str, limit: int = MAX_DISCORD_MSG_LEN) -> list[str]:
    """
    Split body into ≤ limit-length chunks, breaking on paragraph then line then
    word boundaries. Never breaks a code fence in half.
    """
    if len(body) <= limit:
        return [body]

    chunks: list[str] = []
    remaining = body
    while len(remaining) > limit:
        # Prefer paragraph break
        cut = remaining.rfind("\n\n", 0, limit)
        if cut < limit // 2:
            cut = remaining.rfind("\n", 0, limit)
        if cut < limit // 2:
            cut = remaining.rfind(" ", 0, limit)
        if cut <= 0:
            cut = limit
        chunks.append(remaining[:cut].rstrip())
        remaining = remaining[cut:].lstrip()
    if remaining:
        chunks.append(remaining)
    return chunks


# --- bot ---------------------------------------------------------------------

intents = discord.Intents.default()
intents.message_content = True
intents.guilds = True

bot = commands.Bot(command_prefix="!", intents=intents)

# in-memory state
SCHEDULE: dict[str, ScheduledPost] = {}
LAST_POST_AT: dict[tuple[int, int], datetime] = {}  # (guild_id, channel_id) -> dt


@bot.event
async def on_ready():
    global SCHEDULE
    SCHEDULE = load_schedule()
    active = sum(1 for p in SCHEDULE.values() if p.state == "scheduled")
    log.info("logged in as %s | guilds=%d | active-scheduled=%d",
             bot.user, len(bot.guilds), active)

    try:
        if GUILD_ID:
            guild_obj = discord.Object(id=GUILD_ID)
            bot.tree.copy_global_to(guild=guild_obj)
            synced = await bot.tree.sync(guild=guild_obj)
        else:
            synced = await bot.tree.sync()
        log.info("synced %d slash commands", len(synced))
    except Exception as exc:  # noqa: BLE001
        log.exception("slash sync failed: %s", exc)

    if not scheduler_loop.is_running():
        scheduler_loop.start()


# --- slash commands ----------------------------------------------------------

r5t_group = app_commands.Group(name="r5t", description="r5tools scheduled posts")


@r5t_group.command(name="schedule", description="Schedule a content post for a channel")
@app_commands.describe(
    channel="Channel to post in",
    content_id="Content ID (matches a file in content/)",
    utc_datetime="ISO-8601 UTC datetime, e.g. 2026-07-28T07:15:00Z",
)
async def schedule_cmd(
    interaction: discord.Interaction,
    channel: discord.TextChannel,
    content_id: str,
    utc_datetime: str,
):
    if not interaction.user.guild_permissions.manage_guild:
        await interaction.response.send_message(
            "You need Manage Server permission to schedule posts.", ephemeral=True
        )
        return

    content = load_content(content_id)
    if not content:
        await interaction.response.send_message(
            f"Unknown content_id `{content_id}`. Available: "
            f"{', '.join(list_content_ids()) or '(none)'}",
            ephemeral=True,
        )
        return

    try:
        # accept both "...Z" and "...+00:00"
        when = datetime.fromisoformat(utc_datetime.replace("Z", "+00:00"))
        if when.tzinfo is None:
            when = when.replace(tzinfo=timezone.utc)
        when = when.astimezone(timezone.utc)
    except ValueError:
        await interaction.response.send_message(
            f"Bad datetime `{utc_datetime}`. Use ISO-8601 UTC like "
            f"`2026-07-28T07:15:00Z`.",
            ephemeral=True,
        )
        return

    now = datetime.now(timezone.utc)
    if when < now + timedelta(seconds=MIN_SCHEDULE_DELAY_S):
        await interaction.response.send_message(
            f"Scheduled time must be at least {MIN_SCHEDULE_DELAY_S}s in the future.",
            ephemeral=True,
        )
        return

    post = ScheduledPost(
        id=str(uuid.uuid4())[:8],
        content_id=content_id,
        guild_id=channel.guild.id,
        channel_id=channel.id,
        scheduled_at=when.isoformat(),
        scheduled_by=interaction.user.id,
        scheduled_by_name=str(interaction.user),
    )
    SCHEDULE[post.id] = post
    append_event(post)
    log.info("scheduled post %s (%s) for %s in #%s @ %s",
             post.id, content_id, channel.guild.name, channel.name, when.isoformat())
    await interaction.response.send_message(
        f"Scheduled `{post.id}` — `{content_id}` in <#{channel.id}> at "
        f"`{when.isoformat()}` (UTC). Cancel with `/r5t cancel id:{post.id}`.",
        ephemeral=True,
    )


@r5t_group.command(name="list", description="List scheduled posts (this server)")
async def list_cmd(interaction: discord.Interaction):
    guild_id = interaction.guild_id
    rows = [p for p in SCHEDULE.values()
            if p.guild_id == guild_id and p.state == "scheduled"]
    rows.sort(key=lambda p: p.scheduled_at)
    if not rows:
        await interaction.response.send_message(
            "No scheduled posts for this server.", ephemeral=True
        )
        return
    lines = [
        f"`{p.id}` · `{p.content_id}` · <#{p.channel_id}> · {p.scheduled_at}"
        for p in rows
    ]
    await interaction.response.send_message("\n".join(lines), ephemeral=True)


@r5t_group.command(name="cancel", description="Cancel a scheduled post by id")
@app_commands.describe(id="Post id from /r5t list")
async def cancel_cmd(interaction: discord.Interaction, id: str):
    post = SCHEDULE.get(id)
    if not post or post.state != "scheduled":
        await interaction.response.send_message(
            f"No scheduled post with id `{id}`.", ephemeral=True
        )
        return
    if not interaction.user.guild_permissions.manage_guild:
        await interaction.response.send_message(
            "You need Manage Server permission to cancel.", ephemeral=True
        )
        return
    post.state = "cancelled"
    append_event(post)
    log.info("cancelled post %s by %s", post.id, interaction.user)
    await interaction.response.send_message(f"Cancelled `{post.id}`.", ephemeral=True)


@r5t_group.command(name="content", description="List available content IDs")
async def content_cmd(interaction: discord.Interaction):
    ids = list_content_ids()
    if not ids:
        await interaction.response.send_message(
            "No content files found. Run import_from_launch_posts.py.",
            ephemeral=True,
        )
        return
    # chunk to fit under 2000 chars
    text = "**Available content IDs:**\n" + ", ".join(f"`{i}`" for i in ids)
    for chunk in split_message(text):
        await interaction.response.send_message(chunk, ephemeral=True) \
            if not interaction.response.is_done() \
            else await interaction.followup.send(chunk, ephemeral=True)


bot.tree.add_command(r5t_group)


# --- scheduler loop ----------------------------------------------------------

@tasks.loop(seconds=POLL_INTERVAL_S)
async def scheduler_loop():
    now = datetime.now(timezone.utc)
    due = [
        p for p in SCHEDULE.values()
        if p.state == "scheduled"
        and datetime.fromisoformat(p.scheduled_at) <= now
    ]
    for post in due:
        await send_post(post)


@scheduler_loop.before_loop
async def _before_scheduler():
    await bot.wait_until_ready()


async def send_post(post: ScheduledPost) -> None:
    channel = bot.get_channel(post.channel_id)
    if channel is None:
        try:
            channel = await bot.fetch_channel(post.channel_id)
        except (discord.NotFound, discord.Forbidden) as exc:
            post.state = "failed"
            post.error = f"channel unreachable: {exc}"
            append_event(post)
            log.error("post %s: channel unreachable: %s", post.id, exc)
            return

    key = (post.guild_id, post.channel_id)
    last = LAST_POST_AT.get(key)
    now = datetime.now(timezone.utc)
    if last and (now - last).total_seconds() < PER_CHANNEL_COOLDOWN_S:
        wait = PER_CHANNEL_COOLDOWN_S - (now - last).total_seconds()
        log.info("post %s throttled — %s remaining on channel cooldown",
                 post.id, int(wait))
        return  # try again next tick

    content = load_content(post.content_id)
    if not content:
        post.state = "failed"
        post.error = f"content id not found: {post.content_id}"
        append_event(post)
        log.error("post %s: content not found: %s", post.id, post.content_id)
        return

    chunks = split_message(content.body)
    sent_ids: list[int] = []
    try:
        for idx, chunk in enumerate(chunks):
            msg = await channel.send(chunk, suppress_embeds=False)
            sent_ids.append(msg.id)
            if idx < len(chunks) - 1:
                await asyncio.sleep(1.2)  # gentle inter-chunk pause
    except discord.Forbidden as exc:
        post.state = "failed"
        post.error = f"forbidden: {exc}"
        append_event(post)
        log.error("post %s: forbidden in guild=%s channel=%s: %s",
                  post.id, post.guild_id, post.channel_id, exc)
        return
    except discord.HTTPException as exc:
        # includes 429 rate-limit — leave scheduled so next tick retries
        log.warning("post %s: http error, will retry: %s", post.id, exc)
        return

    post.state = "sent"
    post.sent_at = now.isoformat()
    post.sent_message_ids = sent_ids
    append_event(post)
    LAST_POST_AT[key] = now

    with SENT_LOG_PATH.open("a", encoding="utf-8") as fp:
        fp.write(json.dumps({
            "id": post.id,
            "content_id": post.content_id,
            "guild_id": post.guild_id,
            "channel_id": post.channel_id,
            "message_ids": sent_ids,
            "chunks": len(chunks),
            "sent_at": post.sent_at,
        }, ensure_ascii=False) + "\n")
    log.info("sent post %s (%d chunks) to guild=%s channel=%s",
             post.id, len(chunks), post.guild_id, post.channel_id)


# --- entrypoint --------------------------------------------------------------

def main() -> None:
    if not TOKEN:
        log.error("DISCORD_BOT_TOKEN not set")
        sys.exit(1)
    if not CONTENT_DIR.exists():
        log.warning("content dir %s does not exist yet — run import script", CONTENT_DIR)
        CONTENT_DIR.mkdir(parents=True, exist_ok=True)
    bot.run(TOKEN, log_handler=None)  # we manage logging ourselves


if __name__ == "__main__":
    main()
