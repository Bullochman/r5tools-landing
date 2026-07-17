#!/usr/bin/env python3
"""
Batch-schedule the 30-day r5tools.io X/Twitter content calendar.

Sources
-------
1. marketing/SEND-TODAY/twitter-schedule.csv
   Rows 2..14  -> the launch-day thread (skipped here — handled by
   schedule_launch_thread.py).  Rows 15..27 -> Days 1-13 single tweets.
2. marketing/x-twitter.md
   Section 2 ("30-day content calendar") — parsed to extract tweet
   bodies for every "Day N" heading.  We stitch Day 14-30 (those days
   the CSV doesn't cover) using the launch date (Day 0 = 2026-07-21) as
   the origin.

Behaviour
---------
- Every scheduled item goes out at 8:15 PM Central-Time (America/Chicago)
  matching the CSV's `time_CT` column and the playbook's cadence.
- Dedup: before creating anything we pull `list_scheduled()`; any draft
  whose first ~60 chars matches the tweet body is treated as already
  scheduled and skipped.
- Every action (create / skip / warn) is logged to
  automation/typefully/logs/schedule.log
- Character-count validation: tweets over 280 chars are logged and
  skipped, never sent (Typefully would just reject them anyway).

Usage
-----
    python3 schedule_content_calendar.py --dry-run       # preview
    python3 schedule_content_calendar.py                 # send to Typefully
    python3 schedule_content_calendar.py --days 1-7      # subset
    python3 schedule_content_calendar.py --skip-media    # text-only
"""

from __future__ import annotations

import argparse
import csv
import logging
import re
import sys
from dataclasses import dataclass, field
from datetime import date, datetime, time, timedelta
from pathlib import Path
from typing import Iterable
from zoneinfo import ZoneInfo

sys.path.insert(0, str(Path(__file__).parent))

from typefully_client import (  # noqa: E402
    TypefullyClient,
    TypefullyError,
    load_env_client,
    validate_tweet_length,
    MAX_TWEET_CHARS,
)

REPO_ROOT = Path(__file__).resolve().parents[2]
MARKETING = REPO_ROOT / "marketing"
CSV_PATH = MARKETING / "SEND-TODAY" / "twitter-schedule.csv"
XTW_PATH = MARKETING / "x-twitter.md"
MEDIA_ROOT = MARKETING / "SEND-TODAY" / "twitter-launch-thread" / "media"
LOG_DIR = Path(__file__).parent / "logs"
LOG_DIR.mkdir(parents=True, exist_ok=True)

LAUNCH_DATE = date(2026, 7, 21)          # Day 0 (launch Tuesday, thread day)
POST_TIME_CT = time(19, 15)              # 7:15 PM CT == 8:15 PM ET
CENTRAL = ZoneInfo("America/Chicago")


# ---------------------------------------------------------------------------
# Data structures
# ---------------------------------------------------------------------------
@dataclass
class CalendarItem:
    day: int                     # 1..30 (Day-N from playbook)
    scheduled: datetime          # tz-aware, America/Chicago
    body: str
    hashtags: list[str] = field(default_factory=list)
    media: list[str] = field(default_factory=list)
    source: str = ""

    def final_text(self) -> str:
        """Return final tweet body with hashtags appended (if not already present)."""
        tags = [t for t in self.hashtags if t and t.lower() not in self.body.lower()]
        if not tags:
            return self.body
        joined = " ".join(tags)
        return f"{self.body}\n\n{joined}".strip()


# ---------------------------------------------------------------------------
# Parsers
# ---------------------------------------------------------------------------
def _parse_hashtags(cell: str) -> list[str]:
    if not cell or cell.strip().lower() in {"none", "n/a", ""}:
        return []
    return [tok.strip() for tok in cell.split() if tok.strip().startswith("#")]


def _parse_media(cell: str) -> list[str]:
    if not cell:
        return []
    val = cell.strip()
    if not val or val.lower().startswith("none"):
        return []
    # CSV lists file basenames; resolve against MEDIA_ROOT.
    return [str(MEDIA_ROOT / val)]


def _extract_body_at_line(md_lines: list[str], line_number: int) -> str:
    """Given a 1-indexed line number pointing at a `>` blockquote, gather
    the whole blockquote body (up until a blank line breaks it)."""
    idx = line_number - 1
    if idx < 0 or idx >= len(md_lines):
        return ""

    # Walk forward from the target line while we're in a blockquote.
    out_lines: list[str] = []
    i = idx
    while i < len(md_lines):
        line = md_lines[i].rstrip("\n")
        if line.startswith("> "):
            out_lines.append(line[2:])
        elif line.strip() == ">":
            out_lines.append("")
        elif not line.strip():
            # blank inside blockquote -> keep, but if the next line isn't
            # a `>`, this ends the block.
            if i + 1 < len(md_lines) and md_lines[i + 1].startswith(">"):
                out_lines.append("")
                i += 1
                continue
            break
        else:
            break
        i += 1

    text = "\n".join(out_lines).strip()
    # Collapse leftover markdown backticks
    return text


def _load_csv_rows() -> list[dict]:
    with CSV_PATH.open() as fh:
        return list(csv.DictReader(fh))


def _load_md_lines() -> list[str]:
    return XTW_PATH.read_text().splitlines()


DAY_HEADING_RE = re.compile(r"^\*\*Day\s+(\d+)\s+—", re.IGNORECASE)


def _md_index_days(md_lines: list[str]) -> dict[int, int]:
    """Return {day_number: line_number_of_first_blockquote_line}."""
    out: dict[int, int] = {}
    for i, line in enumerate(md_lines):
        m = DAY_HEADING_RE.match(line.strip())
        if not m:
            continue
        day = int(m.group(1))
        # First blockquote line after the heading
        for j in range(i + 1, min(i + 10, len(md_lines))):
            if md_lines[j].startswith(">"):
                out[day] = j + 1  # store 1-indexed
                break
    return out


HASHTAG_RULES = {
    "tool tip": ["#LastWarSurvival"],
    "quick clip": ["#LastWarSurvival"],
    "data drop": ["#LastWarSurvival", "#LWS"],
    "community engagement": [],
    "hard sell": ["#LastWarSurvival"],
    "wrap": [],  # Day 30
}

DAY_CATEGORY = {
    1: "tool tip", 2: "community engagement", 3: "quick clip", 4: "tool tip",
    5: "hard sell", 6: "data drop", 7: "community engagement",
    8: "tool tip", 9: "quick clip", 10: "tool tip", 11: "community engagement",
    12: "hard sell", 13: "tool tip", 14: "data drop",
    15: "tool tip", 16: "quick clip", 17: "community engagement",
    18: "tool tip", 19: "hard sell", 20: "tool tip", 21: "quick clip",
    22: "tool tip", 23: "data drop", 24: "community engagement",
    25: "tool tip", 26: "hard sell", 27: "tool tip", 28: "community engagement",
    29: "quick clip", 30: "wrap",
}


def _default_hashtags_for_day(day: int) -> list[str]:
    cat = DAY_CATEGORY.get(day)
    return list(HASHTAG_RULES.get(cat, ["#LastWarSurvival"]))


# ---------------------------------------------------------------------------
# Build the calendar
# ---------------------------------------------------------------------------
def build_calendar() -> list[CalendarItem]:
    csv_rows = _load_csv_rows()
    md_lines = _load_md_lines()
    md_day_index = _md_index_days(md_lines)

    # Extract Day-N -> row from CSV (skip the launch-thread rows T1..T12)
    csv_by_day: dict[int, dict] = {}
    for row in csv_rows:
        tag = row.get("tweet_number", "")
        m = re.search(r"Day\s+(\d+)", tag)
        if not m:
            continue
        csv_by_day[int(m.group(1))] = row

    items: list[CalendarItem] = []
    log = logging.getLogger("calendar")

    for day in range(1, 31):
        # 1. Body — try to pull from x-twitter.md using DAY_HEADING_RE
        body_line = md_day_index.get(day)
        body = _extract_body_at_line(md_lines, body_line) if body_line else ""
        if not body:
            log.warning("Day %d: could not extract body from x-twitter.md — skipping",
                        day)
            continue

        # 2. Strip trailing "(Fill numbers before posting.)"-style hints
        body = re.sub(r"\(Fill numbers.*?\)\s*$", "", body).strip()

        # 3. Date — Day 1 == LAUNCH_DATE + 1
        scheduled_date = LAUNCH_DATE + timedelta(days=day)
        scheduled = datetime.combine(scheduled_date, POST_TIME_CT, tzinfo=CENTRAL)

        # 4. Hashtags — CSV wins if provided; otherwise use per-category rule
        csv_row = csv_by_day.get(day)
        if csv_row:
            csv_tags = _parse_hashtags(csv_row.get("hashtags", ""))
            hashtags = csv_tags or _default_hashtags_for_day(day)
            media = _parse_media(csv_row.get("media_filename", ""))
            source = f"csv-day-{day} + x-twitter.md L{body_line}"
        else:
            hashtags = _default_hashtags_for_day(day)
            media = []
            source = f"x-twitter.md L{body_line}"

        items.append(CalendarItem(
            day=day,
            scheduled=scheduled,
            body=body,
            hashtags=hashtags,
            media=media,
            source=source,
        ))

    return items


# ---------------------------------------------------------------------------
# Scheduling
# ---------------------------------------------------------------------------
def _configure_logging(verbose: bool) -> None:
    fmt = logging.Formatter("%(asctime)s %(levelname)s %(name)s: %(message)s")
    handler_console = logging.StreamHandler()
    handler_console.setFormatter(fmt)
    handler_file = logging.FileHandler(LOG_DIR / "schedule.log")
    handler_file.setFormatter(fmt)
    root = logging.getLogger()
    root.setLevel(logging.DEBUG if verbose else logging.INFO)
    root.handlers = [handler_console, handler_file]


def _parse_days_arg(spec: str | None) -> set[int] | None:
    if not spec:
        return None
    out: set[int] = set()
    for chunk in spec.split(","):
        chunk = chunk.strip()
        if not chunk:
            continue
        if "-" in chunk:
            lo, hi = chunk.split("-", 1)
            out.update(range(int(lo), int(hi) + 1))
        else:
            out.add(int(chunk))
    return out


def _fingerprint(text: str) -> str:
    """Return a 60-char normalized signature for dedup matching."""
    return re.sub(r"\s+", " ", text).strip()[:60].lower()


def _already_scheduled_index(client: TypefullyClient) -> set[str]:
    try:
        drafts = client.list_scheduled()
    except TypefullyError as exc:
        logging.getLogger("calendar").warning(
            "Could not list scheduled drafts (continuing without dedup): %s", exc)
        return set()

    sigs: set[str] = set()
    for d in drafts:
        content = (d.get("content") or d.get("text") or "")
        if not content and isinstance(d.get("tweets"), list) and d["tweets"]:
            content = d["tweets"][0].get("text", "")
        if content:
            sigs.add(_fingerprint(content))
    return sigs


def _pretty_body_preview(text: str, width: int = 100) -> str:
    return text.replace("\n", " ⏎ ")[:width]


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dry-run", action="store_true",
                        help="Preview only. No API calls.")
    parser.add_argument("--days", default=None,
                        help="Restrict to a subset, e.g. '1-7' or '3,5,9'")
    parser.add_argument("--skip-media", action="store_true",
                        help="Do not attach media.")
    parser.add_argument("--verbose", action="store_true")
    args = parser.parse_args()

    _configure_logging(args.verbose)
    log = logging.getLogger("calendar")

    items = build_calendar()
    log.info("Built calendar: %d days successfully parsed", len(items))

    day_filter = _parse_days_arg(args.days)
    if day_filter is not None:
        items = [i for i in items if i.day in day_filter]
        log.info("Filter --days=%s -> %d items remaining", args.days, len(items))

    # Char-length validation up front
    valid: list[CalendarItem] = []
    for item in items:
        final = item.final_text()
        try:
            validate_tweet_length(final)
        except Exception as exc:  # TweetTooLongError
            log.warning("Day %d SKIPPED (over %d chars, actual=%d): %s",
                        item.day, MAX_TWEET_CHARS, len(final),
                        _pretty_body_preview(final))
            continue
        valid.append(item)

    log.info("%d / %d items passed length validation", len(valid), len(items))

    if args.dry_run:
        for item in valid:
            log.info("DRY  Day %02d  %s CT  [%d chars] %d media  %s",
                     item.day,
                     item.scheduled.strftime("%Y-%m-%d %H:%M"),
                     len(item.final_text()),
                     len(item.media) if not args.skip_media else 0,
                     _pretty_body_preview(item.final_text()))
        log.info("DRY RUN complete. Rerun without --dry-run to schedule.")
        return 0

    try:
        client = load_env_client()
    except TypefullyError as exc:
        log.error(str(exc))
        return 1

    already = _already_scheduled_index(client)
    log.info("Found %d already-scheduled drafts to dedup against", len(already))

    created = 0
    skipped_dup = 0
    failed = 0
    for item in valid:
        final = item.final_text()
        sig = _fingerprint(final)
        if sig in already:
            log.info("Day %02d SKIP (already scheduled): %s",
                     item.day, _pretty_body_preview(final))
            skipped_dup += 1
            continue

        media = [] if args.skip_media else list(item.media)
        try:
            result = client.create_single(
                text=final,
                media=media,
                schedule_at=item.scheduled,
            )
            log.info("Day %02d CREATED  draft_id=%s  scheduled=%s  url=%s",
                     item.day, result.id,
                     result.scheduled_date or item.scheduled.isoformat(),
                     result.share_url or "(none)")
            created += 1
            already.add(sig)
        except TypefullyError as exc:
            log.error("Day %02d FAILED: %s", item.day, exc)
            failed += 1

    log.info("SUMMARY: created=%d skipped_dup=%d failed=%d total=%d",
             created, skipped_dup, failed, len(valid))
    return 0 if failed == 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())
