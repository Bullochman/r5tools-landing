#!/usr/bin/env python3
"""
generate_indexnow_key.py — one-shot: create an IndexNow key and drop the
verification file at the site root.

IndexNow verifies key ownership by fetching:
    https://<host>/<key>.txt
and expects the body to equal <key>.

Usage:
    python3 generate_indexnow_key.py
    python3 generate_indexnow_key.py --site-root /path/to/r5tools-landing
"""

from __future__ import annotations

import argparse
import secrets
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
DEFAULT_SITE_ROOT = SCRIPT_DIR.parent.parent  # r5tools-landing/


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate IndexNow key and write verification file.")
    parser.add_argument(
        "--site-root",
        default=str(DEFAULT_SITE_ROOT),
        help=f"Site root where <key>.txt is written (default: {DEFAULT_SITE_ROOT}).",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Regenerate even if an IndexNow key file already appears to exist.",
    )
    args = parser.parse_args()

    site_root = Path(args.site_root).resolve()
    if not site_root.exists():
        print(f"ERROR: site root {site_root} does not exist", file=sys.stderr)
        return 2

    existing = [p for p in site_root.glob("*.txt") if len(p.stem) == 32 and all(c in "0123456789abcdef" for c in p.stem)]
    if existing and not args.force:
        print("An IndexNow-style key file already exists at site root:")
        for p in existing:
            print(f"  {p}")
        print("Re-run with --force to generate a new one.")
        print()
        print(f"Existing key (use this as INDEXNOW_KEY env var): {existing[0].stem}")
        return 0

    key = secrets.token_hex(16)  # 32 hex chars
    key_file = site_root / f"{key}.txt"
    key_file.write_text(key)

    print("IndexNow key generated.")
    print()
    print(f"  Key:              {key}")
    print(f"  Verification file: {key_file}")
    print(f"  Verification URL: https://r5tools.io/{key}.txt")
    print()
    print("Next steps:")
    print("  1. Commit the new <key>.txt to git so it deploys with the site:")
    print(f"       git add {key_file.name}")
    print(f"       git commit -m 'Add IndexNow verification key'")
    print("       git push")
    print()
    print("  2. Verify the file is publicly reachable:")
    print(f"       curl -sS https://r5tools.io/{key}.txt")
    print(f"       # should print: {key}")
    print()
    print("  3. Export the key so ping_sitemap.py can find it:")
    print(f"       export INDEXNOW_KEY={key}")
    print("     (add it to your shell rc file for persistence)")
    print()
    print("  4. Test:")
    print("       INDEXNOW_KEY=$INDEXNOW_KEY python3 ping_sitemap.py --force --dry-run")
    return 0


if __name__ == "__main__":
    sys.exit(main())
