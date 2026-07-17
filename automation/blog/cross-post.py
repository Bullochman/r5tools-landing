#!/usr/bin/env python3
"""
r5tools blog cross-poster.

When a new blog post is built, triggers:

  * A Typefully draft (scheduled for tonight 19:00 Central by default)
    → auto-publishes to X unless the config disables scheduling.
  * A Discord announcement in #announcements via the r5tools bot content
    directory (drops a markdown file for the bot to schedule + send).
  * Adds the post to the newsletter queue (a JSONL file the digest builder
    already reads via posts_this_week).

Idempotent: keeps a `crosspost-state.json` of already-crossposted slugs so
re-running does not double-post.

USAGE
    # cross-post everything not yet posted
    python3 cross-post.py

    # cross-post a specific slug (still respects state — pass --force to re-post)
    python3 cross-post.py --post launching-r5tools
    python3 cross-post.py --post launching-r5tools --force

    # skip specific channels
    python3 cross-post.py --skip x
    python3 cross-post.py --skip discord --skip x

    # dry-run — show what would be posted, don't call APIs
    python3 cross-post.py --dry-run

CONFIG (cross-post-config.yaml or .json in this dir)
    x:
      enabled: true
      schedule_time: "19:00"       # local time (see timezone key)
      timezone: "America/Chicago"
      threadify: true              # if true, split long posts into a thread
      draft_only: false            # if true, don't schedule — leave as draft
    discord:
      enabled: true
      channel: "announcements"
      guild_id: "..."
    newsletter:
      enabled: true                # posts already flow via file-system; this
                                   # just marks them as "queued" in state.
"""

from __future__ import annotations

import argparse
import datetime as _dt
import json
import os
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from build_blog import load_posts, Post, SITE_URL  # noqa: E402

STATE_FILE = HERE / "crosspost-state.json"
CONFIG_FILE_YAML = HERE / "cross-post-config.yaml"
CONFIG_FILE_JSON = HERE / "cross-post-config.json"
LOG_FILE = HERE / "logs" / "crosspost.jsonl"
LOG_FILE.parent.mkdir(exist_ok=True)

# Discord bot content directory — the bot polls this dir for scheduled posts.
DISCORD_BOT_CONTENT_DIR = (
    HERE.parent.parent / "automation" / "discord-bot" / "content"
)

# Typefully client lives alongside other automation.
TYPEFULLY_CLIENT_DIR = HERE.parent / "typefully"


DEFAULT_CONFIG = {
    "x": {
        "enabled": True,
        "schedule_time": "19:00",
        "timezone": "America/Chicago",
        "threadify": True,
        "draft_only": False,
    },
    "discord": {
        "enabled": True,
        "channel": "announcements",
        "guild_id": None,
    },
    "newsletter": {
        "enabled": True,
    },
}


# ---------- config ----------

def load_config() -> dict:
    if CONFIG_FILE_YAML.exists():
        try:
            import yaml  # type: ignore
            with CONFIG_FILE_YAML.open("r", encoding="utf-8") as f:
                cfg = yaml.safe_load(f) or {}
        except ImportError:
            print("[warn] PyYAML not installed; ignoring cross-post-config.yaml. "
                  "Install with `pip install pyyaml` or use JSON config.", file=sys.stderr)
            cfg = {}
    elif CONFIG_FILE_JSON.exists():
        cfg = json.loads(CONFIG_FILE_JSON.read_text(encoding="utf-8"))
    else:
        cfg = {}
    return _merge(DEFAULT_CONFIG, cfg)


def _merge(base: dict, override: dict) -> dict:
    out = dict(base)
    for k, v in (override or {}).items():
        if isinstance(v, dict) and isinstance(out.get(k), dict):
            out[k] = _merge(out[k], v)
        else:
            out[k] = v
    return out


# ---------- state ----------

def load_state() -> dict:
    if not STATE_FILE.exists():
        return {}
    try:
        return json.loads(STATE_FILE.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {}


def save_state(state: dict) -> None:
    STATE_FILE.write_text(json.dumps(state, indent=2, sort_keys=True), encoding="utf-8")


# ---------- X / Typefully ----------

def build_x_thread(post: Post) -> list[str]:
    """Split a post into a Twitter/X thread. Returns list of tweets, each ≤280 chars."""
    tweets: list[str] = []
    # T1 — hook + link
    t1 = f"{post.title}\n\n{post.description}\n\n{post.canonical_url}"
    tweets.append(_truncate_tweet(t1))
    # T2 — takeaway
    body_first_para = post.body_markdown.strip().split("\n\n")[0]
    t2 = f"Takeaway:\n\n{body_first_para}"
    tweets.append(_truncate_tweet(t2))
    # T3 — CTA
    t3 = (
        "Full breakdown — numbers, tables, and the tool that automates it — "
        f"is on the blog:\n{post.canonical_url}"
    )
    tweets.append(_truncate_tweet(t3))
    return tweets


def _truncate_tweet(text: str) -> str:
    """Trim to 280 chars without breaking a URL or a word."""
    if len(text) <= 280:
        return text
    # Trim to 275 and add ellipsis.
    trimmed = text[:270].rsplit(" ", 1)[0]
    return trimmed + "…"


def post_to_x(post: Post, cfg: dict, dry_run: bool) -> dict:
    xcfg = cfg.get("x", {})
    tweets = build_x_thread(post) if xcfg.get("threadify") else [
        _truncate_tweet(f"{post.title} — {post.canonical_url}")
    ]
    result = {"channel": "x", "slug": post.slug, "tweets": len(tweets)}

    if dry_run:
        result["mode"] = "dry-run"
        result["preview"] = tweets
        return result

    # Import the typefully client (lives in the sibling automation dir).
    sys.path.insert(0, str(TYPEFULLY_CLIENT_DIR))
    try:
        from typefully_client import TypefullyClient, THREAD_SEPARATOR  # type: ignore
    except ImportError as e:
        result["error"] = f"typefully_client import failed: {e}"
        return result

    api_key = os.environ.get("TYPEFULLY_API_KEY", "")
    if not api_key:
        result["error"] = "TYPEFULLY_API_KEY not set"
        return result

    client = TypefullyClient(api_key)
    content = THREAD_SEPARATOR.join(tweets)

    schedule_at = None
    if not xcfg.get("draft_only"):
        schedule_at = _next_local_time_utc(
            xcfg.get("schedule_time", "19:00"),
            xcfg.get("timezone", "America/Chicago"),
        )
    try:
        draft = client.create_draft(
            content=content,
            threadify=False,  # we've already split
            schedule_at=schedule_at,
        )
        result["draft_id"] = getattr(draft, "id", None)
        result["share_url"] = getattr(draft, "share_url", None)
        result["scheduled_at"] = getattr(draft, "scheduled_date", None)
    except Exception as e:  # pragma: no cover — Typefully SDK-side failure
        result["error"] = str(e)
    return result


def _next_local_time_utc(hhmm: str, tz_name: str) -> _dt.datetime:
    """Return the next occurrence of hh:mm in the given timezone, in UTC."""
    try:
        from zoneinfo import ZoneInfo
        tz = ZoneInfo(tz_name)
    except Exception:
        tz = _dt.timezone.utc
    hh, mm = map(int, hhmm.split(":"))
    now = _dt.datetime.now(tz)
    target = now.replace(hour=hh, minute=mm, second=0, microsecond=0)
    if target <= now:
        target += _dt.timedelta(days=1)
    return target.astimezone(_dt.timezone.utc)


# ---------- Discord ----------

def post_to_discord(post: Post, cfg: dict, dry_run: bool) -> dict:
    dcfg = cfg.get("discord", {})
    channel = dcfg.get("channel", "announcements")
    result = {"channel": "discord", "slug": post.slug, "discord_channel": channel}

    body = f"""**New on the blog:** *{post.title}*

{post.description}

Read it → {post.canonical_url}
"""
    # Discord bot reads content/<id>.md files, YAML frontmatter + body.
    md_body = f"""---
title: "Blog: {post.slug}"
channel: "{channel}"
guild_id: "{dcfg.get('guild_id', '') or ''}"
scheduled_for: null  # null = as soon as possible; bot enforces ≥30s in the future
tags: {json.dumps(list(post.tags))}
source: "blog-crosspost"
---

{body.strip()}
"""
    filename = f"blog-{post.slug}.md"
    target = DISCORD_BOT_CONTENT_DIR / filename

    if dry_run:
        result["mode"] = "dry-run"
        result["target_file"] = str(target)
        result["preview"] = body
        return result

    if not DISCORD_BOT_CONTENT_DIR.exists():
        result["error"] = f"discord bot content dir missing: {DISCORD_BOT_CONTENT_DIR}"
        return result

    target.write_text(md_body, encoding="utf-8")
    result["written"] = str(target)
    return result


# ---------- Newsletter ----------

def queue_for_newsletter(post: Post, cfg: dict, dry_run: bool) -> dict:
    # The digest builder already picks up any post in this week's window
    # from posts/. This is a no-op except for state tracking. We still record
    # it so we know the crosspost pipeline "considered" this post for the
    # newsletter — useful when auditing whether a post made it into a digest.
    return {
        "channel": "newsletter",
        "slug": post.slug,
        "note": "auto-picked by weekly-digest-builder from posts/",
        "mode": "dry-run" if dry_run else "queued",
    }


# ---------- main ----------

def crosspost_one(post: Post, cfg: dict, dry_run: bool, skip: set[str]) -> list[dict]:
    results = []
    if cfg.get("x", {}).get("enabled") and "x" not in skip:
        results.append(post_to_x(post, cfg, dry_run))
    if cfg.get("discord", {}).get("enabled") and "discord" not in skip:
        results.append(post_to_discord(post, cfg, dry_run))
    if cfg.get("newsletter", {}).get("enabled") and "newsletter" not in skip:
        results.append(queue_for_newsletter(post, cfg, dry_run))
    return results


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--post", help="only cross-post this slug")
    ap.add_argument("--force", action="store_true",
                    help="re-cross-post even if state says it was already sent")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--skip", action="append", default=[],
                    choices=["x", "discord", "newsletter"],
                    help="skip a channel (repeat to skip several)")
    args = ap.parse_args()

    cfg = load_config()
    state = load_state()
    skip = set(args.skip)

    posts = [p for p in load_posts() if not p.draft and p.word_count() >= 500]
    if args.post:
        posts = [p for p in posts if p.slug == args.post]
        if not posts:
            print(f"[error] no post with slug {args.post!r}", file=sys.stderr)
            return 1

    to_process: list[Post] = []
    for p in posts:
        key = f"{p.slug}::{p.lang}"
        if not args.force and state.get(key, {}).get("done"):
            continue
        to_process.append(p)

    if not to_process:
        print("[crosspost] nothing to do — all posts already cross-posted")
        return 0

    for p in to_process:
        print(f"[crosspost] {p.slug} ({p.lang}) — {p.canonical_url}")
        results = crosspost_one(p, cfg, args.dry_run, skip)
        for r in results:
            print(f"  → {r.get('channel')}: {r}")
            LOG_FILE.open("a", encoding="utf-8").write(json.dumps({
                "ts": _dt.datetime.now(_dt.timezone.utc).isoformat(),
                "slug": p.slug, "lang": p.lang, **r,
            }) + "\n")
        if not args.dry_run:
            key = f"{p.slug}::{p.lang}"
            state.setdefault(key, {})
            state[key]["done"] = True
            state[key]["ts"] = _dt.datetime.now(_dt.timezone.utc).isoformat()
            state[key]["channels"] = [r.get("channel") for r in results if "error" not in r]

    if not args.dry_run:
        save_state(state)

    return 0


if __name__ == "__main__":
    sys.exit(main())
