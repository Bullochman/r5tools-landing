#!/usr/bin/env python3
"""
aggregate_rating.py — nightly rollup of approved testimonials → JSON blob
that the homepage JSON-LD SoftwareApplication.aggregateRating reads.

Rules (per project constraints):
    - Only counts testimonials whose moderation.decision == "approved" AND
      that are not in testimonials-withdrawn.jsonl.
    - Only considers rows that have a rating (1-5).
    - THRESHOLD: if count < 5, we write count=0 to the output file. The
      homepage script must NOT inject an aggregateRating schema in that case
      (Google flags low-count aggregate reviews as manipulative / thin).

OUTPUT
    /aggregate-rating.json in the landing repo root, structured:
        {
          "count": 42,
          "avg_rating": 4.6,
          "min_threshold": 5,
          "threshold_met": true,
          "by_lang": {"en": {"count": 20, "avg": 4.7}, "ko": {...}},
          "generated_at": "2026-07-17T04:00:00Z"
        }
    The `threshold_met` boolean is what the homepage checks — anything below
    5 total ratings and we simply don't render the schema.

USAGE
    python3 aggregate_rating.py           # dry-run, print JSON
    python3 aggregate_rating.py --write   # write to /aggregate-rating.json
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

HERE = Path(__file__).resolve().parent
LANDING_ROOT = HERE.parents[1]
REPO_ROOT = Path(os.environ.get("R5T_HOME", HERE.parents[2]))
APPROVED = REPO_ROOT / "LWS_Access_Codes" / "logs" / "testimonials-approved.jsonl"
WITHDRAWN = REPO_ROOT / "LWS_Access_Codes" / "logs" / "testimonials-withdrawn.jsonl"
OUT = LANDING_ROOT / "aggregate-rating.json"

MIN_COUNT_FOR_SCHEMA = 5

def _read_jsonl(path: Path) -> list[dict]:
    if not path.exists(): return []
    out = []
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line: continue
            try: out.append(json.loads(line))
            except json.JSONDecodeError: continue
    return out

def compute() -> dict:
    withdrawn_ids = {r.get("id") for r in _read_jsonl(WITHDRAWN)}
    rated = []
    by_lang: dict[str, list[int]] = {}
    for row in _read_jsonl(APPROVED):
        if row.get("id") in withdrawn_ids: continue
        r = row.get("rating")
        if not r: continue
        rated.append(int(r))
        by_lang.setdefault(row.get("lang", "en"), []).append(int(r))

    count = len(rated)
    avg = round(sum(rated) / count, 2) if count else 0.0
    lang_stats = {
        lang: {"count": len(vals), "avg": round(sum(vals) / len(vals), 2)}
        for lang, vals in by_lang.items()
    }
    return {
        "count": count if count >= MIN_COUNT_FOR_SCHEMA else 0,
        "raw_count": count,
        "avg_rating": avg if count >= MIN_COUNT_FOR_SCHEMA else None,
        "min_threshold": MIN_COUNT_FOR_SCHEMA,
        "threshold_met": count >= MIN_COUNT_FOR_SCHEMA,
        "by_lang": lang_stats,
        "generated_at": datetime.now(timezone.utc).replace(microsecond=0).isoformat(),
    }

def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--write", action="store_true")
    args = ap.parse_args()

    data = compute()
    print(json.dumps(data, indent=2, ensure_ascii=False))

    if args.write:
        OUT.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        print(f"\nwrote {OUT.relative_to(LANDING_ROOT)}")
        if data["threshold_met"]:
            print(f"[schema-eligible] {data['count']} ratings, avg {data['avg_rating']}")
        else:
            print(f"[schema-hidden] only {data['raw_count']} ratings, need {MIN_COUNT_FOR_SCHEMA}")
    return 0

if __name__ == "__main__":
    sys.exit(main())
