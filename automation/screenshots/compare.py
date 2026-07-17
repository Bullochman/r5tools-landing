#!/usr/bin/env python3
"""
compare.py — Visual regression check.

Compares each PNG in latest/ against the most recent PRIOR snapshot in
history/ (i.e. skips today's folder if present). Uses Pillow's
ImageChops.difference to compute a mean-pixel-diff ratio. Anything above
--threshold (default 0.05 = 5%) is flagged, diff image saved to
screenshots/diffs/YYYY-MM-DD/<name>-diff.png, and optionally posted to a
Slack or Discord webhook.

Env vars:
    SLACK_WEBHOOK_URL     if set, POSTs a summary
    DISCORD_WEBHOOK_URL   if set, POSTs a summary

Usage:
    python3 compare.py
    python3 compare.py --threshold 0.10
    python3 compare.py --quiet
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import os
import sys
import urllib.request
from pathlib import Path

HERE = Path(__file__).resolve().parent
LATEST_DIR = HERE / "latest"
HISTORY_DIR = HERE / "history"
DIFF_DIR = HERE / "diffs"


def try_import_pillow():
    try:
        from PIL import Image, ImageChops  # noqa: F401
        return True
    except ImportError:
        return False


def find_previous_snapshot_dir() -> Path | None:
    if not HISTORY_DIR.exists():
        return None
    today = dt.date.today().isoformat()
    dated = sorted(
        (p for p in HISTORY_DIR.iterdir() if p.is_dir() and p.name != today),
        reverse=True,
    )
    return dated[0] if dated else None


def diff_ratio(img_a, img_b) -> float:
    """Mean pixel difference / 255, normalized. Handles size mismatches by
    resizing b to a's size (any resize == big diff, which is what we want)."""
    from PIL import Image, ImageChops
    if img_a.size != img_b.size:
        img_b = img_b.resize(img_a.size)
    if img_a.mode != img_b.mode:
        img_b = img_b.convert(img_a.mode)
    diff = ImageChops.difference(img_a, img_b)
    # Reduce to grayscale for a single per-pixel scalar
    if diff.mode != "L":
        diff = diff.convert("L")
    hist = diff.histogram()
    total = sum(hist)
    if total == 0:
        return 0.0
    weighted = sum(i * c for i, c in enumerate(hist))
    return (weighted / total) / 255.0


def make_diff_image(img_a, img_b, out_path: Path) -> None:
    from PIL import Image, ImageChops
    if img_a.size != img_b.size:
        img_b = img_b.resize(img_a.size)
    if img_a.mode != img_b.mode:
        img_b = img_b.convert(img_a.mode)
    diff = ImageChops.difference(img_a, img_b)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    diff.save(out_path, format="PNG", optimize=True)


def post_webhook(changed: list[dict], threshold: float) -> None:
    slack = os.environ.get("SLACK_WEBHOOK_URL")
    discord = os.environ.get("DISCORD_WEBHOOK_URL")
    if not (slack or discord) or not changed:
        return
    lines = [f"r5tools weekly screenshots: {len(changed)} page(s) changed >{threshold*100:.0f}%"]
    for c in changed[:15]:
        lines.append(f"  - {c['name']}: {c['diff']*100:.1f}%")
    if len(changed) > 15:
        lines.append(f"  ... +{len(changed) - 15} more")
    body = "\n".join(lines)

    if slack:
        try:
            req = urllib.request.Request(
                slack,
                data=json.dumps({"text": body}).encode(),
                headers={"Content-Type": "application/json"},
            )
            urllib.request.urlopen(req, timeout=10).read()
        except Exception as e:
            print(f"warn: slack webhook failed: {e}", file=sys.stderr)

    if discord:
        try:
            req = urllib.request.Request(
                discord,
                data=json.dumps({"content": body}).encode(),
                headers={"Content-Type": "application/json"},
            )
            urllib.request.urlopen(req, timeout=10).read()
        except Exception as e:
            print(f"warn: discord webhook failed: {e}", file=sys.stderr)


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--threshold", type=float, default=0.05, help="diff ratio 0-1 (default 0.05)")
    ap.add_argument("--quiet", action="store_true")
    args = ap.parse_args()

    if not try_import_pillow():
        print("error: pillow not installed. Run: pip install pillow", file=sys.stderr)
        return 2

    from PIL import Image

    if not LATEST_DIR.exists():
        print(f"error: no latest/ dir at {LATEST_DIR}", file=sys.stderr)
        return 2

    prev_dir = find_previous_snapshot_dir()
    if prev_dir is None:
        print("info: no previous snapshot to compare against, skipping.")
        return 0

    today = dt.date.today().isoformat()
    diff_today = DIFF_DIR / today

    latest_files = sorted(LATEST_DIR.glob("*.png"))
    changed: list[dict] = []
    checked = 0

    for latest_path in latest_files:
        # Skip *-full.png for comparison — viewport shot is the canonical one
        if latest_path.stem.endswith("-full"):
            continue
        prev_path = prev_dir / latest_path.name
        if not prev_path.exists():
            if not args.quiet:
                print(f"NEW  {latest_path.name} (no prior)")
            continue
        checked += 1
        try:
            a = Image.open(latest_path)
            b = Image.open(prev_path)
            ratio = diff_ratio(a, b)
        except Exception as e:
            print(f"warn: diff failed for {latest_path.name}: {e}", file=sys.stderr)
            continue

        flagged = ratio > args.threshold
        if flagged:
            out = diff_today / f"{latest_path.stem}-diff.png"
            try:
                make_diff_image(a, b, out)
            except Exception as e:
                print(f"warn: diff image failed for {latest_path.name}: {e}", file=sys.stderr)
            changed.append({"name": latest_path.stem, "diff": ratio, "diff_image": str(out)})
            if not args.quiet:
                print(f"CHNG {latest_path.stem}: {ratio*100:.2f}%  (>{args.threshold*100:.0f}%)")
        elif not args.quiet:
            print(f"ok   {latest_path.stem}: {ratio*100:.2f}%")

    print(f"compared {checked} files vs {prev_dir.name}: {len(changed)} flagged")
    if changed:
        post_webhook(changed, args.threshold)

    return 0


if __name__ == "__main__":
    sys.exit(main())
