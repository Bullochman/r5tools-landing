"""
schedule_launch_broadcast.py

Reads /marketing/SEND-TODAY/discord-targets.csv and produces a schedule plan
for the r5tools launch broadcast.

Modes:
  --dry-run (default) — print planned scheduled posts to stdout, write nothing.
  --write             — append planned posts to scheduled.jsonl so the running
                        bot picks them up on the next poll.

Timing:
  We schedule two broadcasts per eligible server:
    1) T-24h notice — 2026-07-27 12:00 PT (soft teaser)
    2) Launch drop  — 2026-07-28 00:15 PT (right after PH day rolls)

Only "internal" (Evan-owned) servers are auto-scheduled: the RONY/TINO alliance
Discord and the future r5tools community server. Everything else (LWS Official,
WWC, Cpt Hedgehog, KR/JP/DE/ES community servers) is printed as MANUAL because
posting there without explicit invite = ToS-adjacent spam. This mirrors the
safety guidance in safety.md.

You still have to add guild_id + channel_id + tier="internal" rows via
--server (see below) — the CSV does not have Discord IDs.
"""

from __future__ import annotations

import argparse
import csv
import json
import sys
import uuid
from dataclasses import dataclass, asdict, field
from datetime import datetime, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parent
MARKETING = ROOT.parent.parent / "marketing"
TARGETS_CSV = MARKETING / "SEND-TODAY" / "discord-targets.csv"
SCHEDULE_PATH = ROOT / "scheduled.jsonl"

PT = ZoneInfo("America/Los_Angeles")
UTC = timezone.utc

# --- broadcast timing -------------------------------------------------------

T_MINUS_24H = datetime(2026, 7, 27, 12, 0, 0, tzinfo=PT).astimezone(UTC)
LAUNCH_DROP = datetime(2026, 7, 28,  0, 15, 0, tzinfo=PT).astimezone(UTC)

# variant → post length used by launch-day-checklist.md
VARIANT_MAP = {
    "short": "launch-short",
    "medium": "launch-medium",
    "long": "launch-long",
}

# Only these tier values are treated as "servers Evan owns/admins".
# Everything else is manual-only.
INTERNAL_TIERS = {"4"}


@dataclass
class Plan:
    id: str
    content_id: str
    guild_id: int
    channel_id: int
    scheduled_at: str
    scheduled_by: int
    scheduled_by_name: str
    state: str = "scheduled"
    error: str | None = None
    sent_at: str | None = None
    sent_message_ids: list[int] = field(default_factory=list)


def load_targets() -> list[dict]:
    if not TARGETS_CSV.exists():
        print(f"[error] targets csv not found: {TARGETS_CSV}", file=sys.stderr)
        sys.exit(1)
    with TARGETS_CSV.open(encoding="utf-8") as fp:
        return list(csv.DictReader(fp))


def pick_variant(row: dict, lang_hint: str | None = None) -> str:
    variant = (row.get("launch_post_variant") or "medium").strip().lower()
    content_id = VARIANT_MAP.get(variant, "launch-medium")
    # if server is KR/JP-native based on notes, append -ko
    notes = (row.get("notes") or "").lower()
    if lang_hint == "ko" or "native kr" in notes or "kr r5" in notes:
        candidate = f"{content_id}-ko"
        if (ROOT / "content" / f"{candidate}.md").exists():
            content_id = candidate
    return content_id


def build_plans(rows: list[dict], server_overrides: dict[str, tuple[int, int]]) -> tuple[list[Plan], list[dict]]:
    """
    server_overrides maps server_name (as in CSV) -> (guild_id, channel_id)
    for internal servers we're actually able to post to.

    Returns (auto_plans, manual_rows).
    """
    auto: list[Plan] = []
    manual: list[dict] = []
    for row in rows:
        tier = (row.get("tier") or "").strip()
        name = (row.get("server_name") or "").strip()
        override = server_overrides.get(name)

        if tier not in INTERNAL_TIERS or override is None:
            manual.append(row)
            continue

        guild_id, channel_id = override
        content_id = pick_variant(row)

        # T-24h teaser (short)
        auto.append(Plan(
            id=str(uuid.uuid4())[:8],
            content_id="launch-short" if not content_id.endswith("-ko") else "launch-short-ko",
            guild_id=guild_id,
            channel_id=channel_id,
            scheduled_at=T_MINUS_24H.isoformat(),
            scheduled_by=0,
            scheduled_by_name="schedule_launch_broadcast.py",
        ))
        # Launch drop (chosen variant)
        auto.append(Plan(
            id=str(uuid.uuid4())[:8],
            content_id=content_id,
            guild_id=guild_id,
            channel_id=channel_id,
            scheduled_at=LAUNCH_DROP.isoformat(),
            scheduled_by=0,
            scheduled_by_name="schedule_launch_broadcast.py",
        ))
    return auto, manual


def parse_server_arg(vals: list[str]) -> dict[str, tuple[int, int]]:
    """
    --server "RONY/TINO alliance Discord (own)=123:456"
    """
    out: dict[str, tuple[int, int]] = {}
    for v in vals or []:
        try:
            name, ids = v.split("=", 1)
            guild_id, channel_id = ids.split(":", 1)
            out[name.strip()] = (int(guild_id), int(channel_id))
        except ValueError:
            print(f"[warn] bad --server arg: {v!r} "
                  "(expected NAME=guild_id:channel_id)",
                  file=sys.stderr)
    return out


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--write", action="store_true",
                    help="append planned posts to scheduled.jsonl "
                         "(default is dry-run)")
    ap.add_argument("--server", action="append", default=[],
                    metavar="NAME=guild_id:channel_id",
                    help="Map a CSV server_name to real Discord IDs. Repeatable.")
    args = ap.parse_args()

    overrides = parse_server_arg(args.server)
    rows = load_targets()
    auto, manual = build_plans(rows, overrides)

    print(f"=== r5tools launch broadcast plan ===")
    print(f"targets_csv: {TARGETS_CSV}")
    print(f"T-24h:       {T_MINUS_24H.isoformat()}  (2026-07-27 12:00 PT)")
    print(f"launch drop: {LAUNCH_DROP.isoformat()}  (2026-07-28 00:15 PT)")
    print()

    print(f"[AUTO] {len(auto)} scheduled posts across "
          f"{len(overrides)} internal server(s):")
    for p in auto:
        print(f"  {p.scheduled_at}  guild={p.guild_id} channel={p.channel_id} "
              f"content={p.content_id}  id={p.id}")

    print()
    print(f"[MANUAL] {len(manual)} servers require human copy-paste "
          f"(no bot invite / non-internal):")
    for r in manual:
        print(f"  - {r.get('server_name'):40s} tier={r.get('tier')} "
              f"variant={r.get('launch_post_variant')} channel={r.get('post_channel')}")

    if args.write and auto:
        with SCHEDULE_PATH.open("a", encoding="utf-8") as fp:
            for p in auto:
                fp.write(json.dumps(asdict(p), ensure_ascii=False) + "\n")
        print(f"\n[wrote] appended {len(auto)} events → {SCHEDULE_PATH}")
    elif not args.write:
        print("\n(dry-run — pass --write to append to scheduled.jsonl)")


if __name__ == "__main__":
    main()
