#!/usr/bin/env python3
"""
build_analytics_inject.py — inject Plausible + GA4 snippets into every .html
under r5tools-landing/ right before </head>. Idempotent (marker-guarded).

Run:
    python3 build_analytics_inject.py               # inject/refresh everywhere
    python3 build_analytics_inject.py --dry-run     # report only
    python3 build_analytics_inject.py --strip       # remove all injected blocks
    python3 build_analytics_inject.py --path FILE   # single file

Skips:
    - 404.html (per spec — we don't want ad-blocker false 404s in the stats)
    - anything under .git/, node_modules/
    - files without <head>

Emits a versioned block delimited by:
    <!-- r5tools:analytics v1 START -->
    ...
    <!-- r5tools:analytics v1 END -->

Re-running will DELETE the old block (any version) and inject the current one,
so bumping v1 → v2 is a matter of changing MARKER_VERSION and re-running.

The injected block references two site-relative files:
    /analytics-config.js     (per-property config — placeholders Evan fills in)
    /analytics.js            (the r5t.track() façade + referral capture)
It also includes the Plausible + GA4 bootstrap inline so no additional HTTP
round-trips are added beyond the two vendor scripts themselves.
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent

# Bump this to force re-injection with a new block after any snippet change.
MARKER_VERSION = "v2"
MARKER_START = f"<!-- r5tools:analytics {MARKER_VERSION} START -->"
MARKER_END = f"<!-- r5tools:analytics {MARKER_VERSION} END -->"
# Matches ANY prior version, so upgrades cleanly strip the old block.
STRIP_RE = re.compile(
    r"[ \t]*<!-- r5tools:analytics v\d+ START -->.*?<!-- r5tools:analytics v\d+ END -->\n?",
    re.DOTALL,
)

# Files inside r5tools-landing/ that must NEVER get the tag.
SKIP_FILENAMES = {"404.html"}
SKIP_DIR_PARTS = {".git", "node_modules", "screenshots"}

# The snippet. Paths are ROOT-RELATIVE, so this works identically for
# /index.html, /ko/index.html, /guides/foo.html, etc.
SNIPPET = f"""{MARKER_START}
<script src="/analytics-config.js"></script>
<script src="/cookie-consent.js"></script>
<script>
  // GA4 bootstrap — only wires up if (a) Measurement ID configured AND
  // (b) user has not rejected cookies (window.LWS_CONSENT set by cookie-consent.js).
  (function () {{
    if (window.LWS_CONSENT === "reject") return;
    var id = (window.R5T_ANALYTICS || {{}}).ga4MeasurementId || "";
    if (!id) return;
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(id);
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {{ window.dataLayer.push(arguments); }};
    window.gtag("js", new Date());
    // anonymize_ip + no ad-personalization = friendly to EU + kids traffic.
    window.gtag("config", id, {{ anonymize_ip: true, allow_google_signals: false }});
  }})();
  // Plausible — cookieless, always safe to run regardless of consent state.
  (function () {{
    var cfg = window.R5T_ANALYTICS || {{}};
    if (!cfg.plausibleDomain) return;
    var p = document.createElement("script");
    p.defer = true;
    p.setAttribute("data-domain", cfg.plausibleDomain);
    p.src = cfg.plausibleScriptUrl || "https://plausible.io/js/script.js";
    document.head.appendChild(p);
    window.plausible = window.plausible || function () {{ (window.plausible.q = window.plausible.q || []).push(arguments); }};
  }})();
</script>
<script src="/analytics.js" defer></script>
{MARKER_END}
"""


def should_skip(p: Path) -> bool:
    if p.name in SKIP_FILENAMES:
        return True
    if any(part in SKIP_DIR_PARTS for part in p.parts):
        return True
    return False


def strip_block(html: str) -> str:
    return STRIP_RE.sub("", html)


def inject(html: str) -> str:
    """Return html with the current-version block sitting just before </head>."""
    cleaned = strip_block(html)
    # If there's no </head>, don't touch it.
    if "</head>" not in cleaned.lower():
        return html
    # Locate the FIRST </head> (case-insensitive) and insert before it.
    def _repl(m: re.Match) -> str:
        return SNIPPET + m.group(0)
    return re.sub(r"</head\s*>", _repl, cleaned, count=1, flags=re.IGNORECASE)


def walk_html_files(root: Path):
    for p in root.rglob("*.html"):
        if should_skip(p.relative_to(root)):
            continue
        yield p


def process_file(p: Path, *, strip_only: bool, dry_run: bool) -> str:
    """Return status string for logging."""
    original = p.read_text(encoding="utf-8", errors="replace")
    if strip_only:
        new = strip_block(original)
        action = "STRIPPED"
    else:
        new = inject(original)
        action = "INJECTED"
    if new == original:
        return "unchanged"
    if not dry_run:
        p.write_text(new, encoding="utf-8")
    return action


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true", help="don't write, just report")
    ap.add_argument("--strip", action="store_true", help="remove injected blocks (any version)")
    ap.add_argument("--path", help="process only this single file (relative to repo root or absolute)")
    args = ap.parse_args()

    if args.path:
        p = Path(args.path)
        if not p.is_absolute():
            p = (REPO_ROOT / p).resolve()
        if not p.exists():
            print(f"ERR: {p} does not exist", file=sys.stderr)
            return 2
        files = [p]
    else:
        files = list(walk_html_files(REPO_ROOT))

    counts = {"INJECTED": 0, "STRIPPED": 0, "unchanged": 0}
    for f in files:
        status = process_file(f, strip_only=args.strip, dry_run=args.dry_run)
        counts[status] = counts.get(status, 0) + 1

    prefix = "DRY-RUN " if args.dry_run else ""
    print(f"{prefix}scanned={len(files)} injected={counts.get('INJECTED',0)} "
          f"stripped={counts.get('STRIPPED',0)} unchanged={counts.get('unchanged',0)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
