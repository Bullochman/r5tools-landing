#!/usr/bin/env python3
"""build_founding_widget_inject.py

Injects the founding-tier scarcity widget into every HTML page in the
r5tools-landing tree. Idempotent — grep for the marker before injecting.

Injection point: right before </body>. Uses a `defer` script tag so it
never blocks main-thread render. English pages point at `/founding-widget.js`
and Korean pages under /ko/ point at `/founding-widget.js` (same script;
widget picks up KR strings via <html lang="ko"> or the /ko/ URL prefix).

Usage:
    python3 build_founding_widget_inject.py            # inject into all HTML pages
    python3 build_founding_widget_inject.py --dry-run  # show what would change
    python3 build_founding_widget_inject.py --remove   # strip the injected block

Skips:
    - files that already contain the marker
    - files without a </body> tag (partial fragments, redirects)
    - files under node_modules/, .git/
"""
import argparse
import os
import re
import sys
from pathlib import Path

BASE = Path(__file__).parent.resolve()
MARKER_BEGIN = "<!-- BEGIN founding-widget-inject -->"
MARKER_END = "<!-- END founding-widget-inject -->"

# The injected block. Widget script uses defer so it never blocks paint.
# href resolves relative to the site root so /ko/foo.html and /guides/bar.html
# both get the same file.
INJECT_BLOCK = (
    "\n" + MARKER_BEGIN + "\n"
    '<script src="/founding-widget.js" defer></script>\n'
    + MARKER_END + "\n"
)

# Anywhere between the markers (inclusive) — used by --remove.
INJECT_RE = re.compile(
    re.escape(MARKER_BEGIN) + r".*?" + re.escape(MARKER_END) + r"\n?",
    re.DOTALL,
)

SKIP_DIRS = {".git", "node_modules", "__pycache__", "screenshots", "data"}


def iter_html_files(root: Path):
    for dirpath, dirnames, filenames in os.walk(root):
        # Prune skip dirs in-place.
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS and not d.startswith(".")]
        for fn in filenames:
            if fn.endswith(".html"):
                yield Path(dirpath) / fn


def inject_into(path: Path, dry_run: bool) -> str:
    try:
        text = path.read_text(encoding="utf-8")
    except (OSError, UnicodeDecodeError):
        return "read-error"
    if MARKER_BEGIN in text:
        return "already-injected"
    if "</body>" not in text:
        return "no-body-tag"
    new_text = text.replace("</body>", INJECT_BLOCK + "</body>", 1)
    if new_text == text:
        return "no-change"
    if dry_run:
        return "would-inject"
    path.write_text(new_text, encoding="utf-8")
    return "injected"


def remove_from(path: Path, dry_run: bool) -> str:
    try:
        text = path.read_text(encoding="utf-8")
    except (OSError, UnicodeDecodeError):
        return "read-error"
    if MARKER_BEGIN not in text:
        return "no-marker"
    new_text = INJECT_RE.sub("", text)
    if new_text == text:
        return "no-change"
    if dry_run:
        return "would-remove"
    path.write_text(new_text, encoding="utf-8")
    return "removed"


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--dry-run", action="store_true", help="Show what would change without writing.")
    ap.add_argument("--remove", action="store_true", help="Strip the injected block instead of adding it.")
    ap.add_argument("--root", default=str(BASE), help="Root dir to scan (default: this script's dir).")
    args = ap.parse_args()

    root = Path(args.root).resolve()
    if not root.exists():
        print(f"[founding-inject] root not found: {root}", file=sys.stderr)
        sys.exit(2)

    op = remove_from if args.remove else inject_into
    counts = {}
    for html in iter_html_files(root):
        result = op(html, args.dry_run)
        counts[result] = counts.get(result, 0) + 1
        if result in ("injected", "removed", "would-inject", "would-remove"):
            print(f"[{result}] {html.relative_to(root)}")

    print("---")
    print("Summary:")
    for k in sorted(counts):
        print(f"  {k:>18}: {counts[k]}")
    print(f"  {'total':>18}: {sum(counts.values())}")


if __name__ == "__main__":
    main()
