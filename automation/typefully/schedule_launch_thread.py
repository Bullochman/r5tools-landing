#!/usr/bin/env python3
"""
Schedule the 12-tweet r5tools.io launch thread on Typefully.

Reads:  marketing/SEND-TODAY/twitter-launch-thread/typefully-import.json
Target: Tue 2026-07-21 08:15 PM America/New_York

Usage:
    python3 schedule_launch_thread.py                # SCHEDULE for real
    python3 schedule_launch_thread.py --dry-run      # validate only
    python3 schedule_launch_thread.py --at "2026-07-21T20:15" --tz US/Eastern
    python3 schedule_launch_thread.py --skip-media   # useful when Typefully upload endpoint is unavailable
"""

from __future__ import annotations

import argparse
import json
import logging
import sys
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

# Allow running the script directly from this folder
sys.path.insert(0, str(Path(__file__).parent))

from typefully_client import (  # noqa: E402
    TypefullyClient,
    TypefullyError,
    load_env_client,
    validate_tweet_length,
)

REPO_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_IMPORT_JSON = (
    REPO_ROOT
    / "marketing"
    / "SEND-TODAY"
    / "twitter-launch-thread"
    / "typefully-import.json"
)
LOG_DIR = Path(__file__).parent / "logs"
LOG_DIR.mkdir(parents=True, exist_ok=True)

DEFAULT_LAUNCH_AT_ET = datetime(2026, 7, 21, 20, 15, tzinfo=ZoneInfo("America/New_York"))


def _configure_logging(verbose: bool) -> None:
    handler_console = logging.StreamHandler()
    handler_file = logging.FileHandler(LOG_DIR / "launch-thread.log")
    fmt = logging.Formatter("%(asctime)s %(levelname)s %(name)s: %(message)s")
    handler_console.setFormatter(fmt)
    handler_file.setFormatter(fmt)
    root = logging.getLogger()
    root.setLevel(logging.DEBUG if verbose else logging.INFO)
    root.handlers = [handler_console, handler_file]


def _load_thread(path: Path) -> list[dict]:
    with path.open() as fh:
        data = json.load(fh)
    thread = data.get("thread")
    if not isinstance(thread, list) or not thread:
        raise SystemExit(f"typefully-import.json has no 'thread' array: {path}")
    return thread


def _preflight(thread: list[dict], skip_media: bool) -> None:
    log = logging.getLogger("launch-thread")
    log.info("Preflighting %d tweets...", len(thread))
    for i, t in enumerate(thread, start=1):
        text = t.get("text", "")
        n = validate_tweet_length(text)
        media = t.get("media") or []
        missing = [m for m in media if not skip_media and not Path(m).exists()]
        log.info("  T%02d: %3d chars, %d media (%s)",
                 i, n, len(media),
                 "OK" if not missing else f"MISSING: {[Path(m).name for m in missing]}")
        if missing and not skip_media:
            raise SystemExit(
                f"Tweet {i} references missing media: {missing}\n"
                f"Fix the paths or rerun with --skip-media."
            )


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--import-json", default=str(DEFAULT_IMPORT_JSON),
                        help=f"Path to typefully-import.json (default: {DEFAULT_IMPORT_JSON})")
    parser.add_argument("--at", default=None,
                        help="ISO datetime (naive) for scheduling, interpreted in --tz")
    parser.add_argument("--tz", default="America/New_York",
                        help="Timezone for --at (default America/New_York)")
    parser.add_argument("--dry-run", action="store_true",
                        help="Validate + preview only. Do not touch Typefully.")
    parser.add_argument("--skip-media", action="store_true",
                        help="Skip media uploads (post text-only).")
    parser.add_argument("--verbose", action="store_true")
    args = parser.parse_args()

    _configure_logging(args.verbose)
    log = logging.getLogger("launch-thread")

    if args.at:
        try:
            naive = datetime.fromisoformat(args.at)
        except ValueError as exc:
            log.error("Invalid --at %r: %s", args.at, exc)
            return 2
        schedule_at = naive.replace(tzinfo=ZoneInfo(args.tz))
    else:
        schedule_at = DEFAULT_LAUNCH_AT_ET

    log.info("Launch thread scheduling target: %s (UTC: %s)",
             schedule_at.isoformat(),
             schedule_at.astimezone(ZoneInfo("UTC")).isoformat())

    import_path = Path(args.import_json)
    if not import_path.exists():
        log.error("Import JSON not found: %s", import_path)
        return 1

    thread = _load_thread(import_path)
    _preflight(thread, skip_media=args.skip_media)

    # Reshape for the client
    payload_tweets: list[dict] = []
    for t in thread:
        item = {"text": t["text"]}
        if not args.skip_media and t.get("media"):
            item["media"] = list(t["media"])
        payload_tweets.append(item)

    if args.dry_run:
        log.info("DRY RUN — would create thread with %d tweets scheduled at %s",
                 len(payload_tweets), schedule_at.isoformat())
        for i, t in enumerate(payload_tweets, start=1):
            log.info("  T%02d [%d chars] %s%s",
                     i, len(t["text"]),
                     t["text"][:100].replace("\n", " ⏎ "),
                     f"  [+{len(t.get('media', []))} media]" if t.get("media") else "")
        log.info("DRY RUN complete. Rerun without --dry-run to schedule.")
        return 0

    try:
        client: TypefullyClient = load_env_client()
    except TypefullyError as exc:
        log.error(str(exc))
        return 1

    # Idempotency: refuse to double-schedule the launch thread
    try:
        already = client.list_scheduled()
    except TypefullyError as exc:
        log.warning("Could not list scheduled drafts (continuing): %s", exc)
        already = []

    hook_signature = thread[0]["text"][:60]
    for d in already:
        # Different Typefully payload shapes may nest content differently
        content = (d.get("content") or d.get("text") or
                   (d.get("tweets") or [{}])[0].get("text", ""))
        if hook_signature and hook_signature in content:
            log.warning(
                "Launch thread appears already scheduled (draft id=%s share_url=%s). "
                "Not creating a duplicate. Cancel it in Typefully first, then rerun.",
                d.get("id"), d.get("share_url"),
            )
            return 0

    try:
        result = client.create_thread(payload_tweets, schedule_at=schedule_at)
    except TypefullyError as exc:
        log.error("Failed to create thread: %s", exc)
        return 1

    log.info("SCHEDULED launch thread. Draft id=%s", result.id)
    if result.share_url:
        log.info("Preview in Typefully: %s", result.share_url)
    log.info("Scheduled for: %s", result.scheduled_date or schedule_at.isoformat())
    print("\nDone. Verify in Typefully dashboard:")
    if result.share_url:
        print(f"  {result.share_url}")
    else:
        print("  https://typefully.com/  (find the draft in Queue)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
