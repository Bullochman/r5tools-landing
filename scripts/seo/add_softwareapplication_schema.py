#!/usr/bin/env python3
"""add_softwareapplication_schema.py — inject SoftwareApplication JSON-LD.

Targets:
  - / (index.html)                          — the R5TOOLS.IO suite as a whole
  - /refer.html                             — Refer & Earn program
  - Named tool landing pages (see TOOL_LANDING_PAGES).

Fields:
  applicationCategory = GameApplication (per user spec; R5TOOLS.IO is Last War
    tooling and Google's schema browser treats this cleanly)
  operatingSystem     = Web
  offers              = single free tier @ USD 0.00 (Warzone 2007 unlock);
                        paid tiers priced from pricing block in future revision
  aggregateRating     = placeholder (starRating=null) until we have real reviews

Idempotent via BEGIN/END sentinel comments. Skips /ko/. Injects before </head>.

Usage:
    python scripts/seo/add_softwareapplication_schema.py             # write
    python scripts/seo/add_softwareapplication_schema.py --dry-run
    python scripts/seo/add_softwareapplication_schema.py --strip
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Dict, List, Optional

ROOT = Path(__file__).resolve().parents[2]
BEGIN = "<!-- BEGIN r5tools:seo:softwareapp v1 -->"
END = "<!-- END r5tools:seo:softwareapp v1 -->"

TITLE_RE = re.compile(r"<title[^>]*>(.*?)</title>", re.IGNORECASE | re.DOTALL)
DESC_RE = re.compile(r'<meta\s+name=["\']description["\']\s+content=["\']([^"\']*)["\']', re.IGNORECASE)
CANONICAL_RE = re.compile(r'<link\s+rel=["\']canonical["\']\s+href=["\']([^"\']*)["\']', re.IGNORECASE)


def _clean_text(html: str) -> str:
    text = re.sub(r"<[^>]+>", " ", html)
    return re.sub(r"\s+", " ", text).strip()


TOOL_LANDING_PAGES: List[Dict[str, object]] = [
    {
        "path": "index.html",
        "name": "R5TOOLS.IO",
        "url": "https://r5tools.io/",
        "description": (
            "A suite of planning tools for Last War: Survival alliance leaders "
            "(R5s / R4s). Season 2 landing coordination, temperature / freeze risk, "
            "coal budgets, hive formations, city capture priorities, and more. EN + KR."
        ),
        "image": "https://r5tools.io/static/og-image.png",
        "featureList": [
            "Hive Planner",
            "Landing Planner",
            "Heat Simulator",
            "Freeze Risk Dashboard",
            "Coal Burn Calculator",
            "City Capture Planner",
            "Roster Extractor",
            "Season Timeline",
        ],
    },
    {
        "path": "refer.html",
        "name": "R5TOOLS.IO Refer & Earn",
        "url": "https://r5tools.io/refer.html",
        "description": (
            "Every R5TOOLS.IO user gets a unique referral code. Share it, and earn "
            "a revenue share on every paid unlock you drive."
        ),
        "image": "https://r5tools.io/static/og-image.png",
        "featureList": [],
    },
    {
        "path": "cheat-sheet.html",
        "name": "R5TOOLS.IO Cheat Sheet",
        "url": "https://r5tools.io/cheat-sheet.html",
        "description": "Season 2 (Polar Storm) one-page R5 cheat sheet — furnace, hive, freeze, capture priorities.",
        "image": "https://r5tools.io/static/og-image.png",
        "featureList": [],
    },
    {
        "path": "leaderboard.html",
        "name": "R5TOOLS.IO Leaderboard",
        "url": "https://r5tools.io/leaderboard.html",
        "description": "Alliance leaderboards and referral standings across the R5TOOLS.IO suite.",
        "image": "https://r5tools.io/static/og-image.png",
        "featureList": [],
    },
]


def build_schema(meta: Dict[str, object]) -> str:
    schema = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": meta["name"],
        "url": meta["url"],
        "description": meta["description"],
        "applicationCategory": "GameApplication",
        "applicationSubCategory": "Strategy game companion tool",
        "operatingSystem": "Web",
        "image": meta.get("image"),
        "publisher": {
            "@type": "Organization",
            "name": "R5TOOLS.IO",
            "url": "https://r5tools.io/",
        },
        "offers": {
            "@type": "Offer",
            "price": "0.00",
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock",
            "url": "https://r5tools.io/#pricing",
            "description": "Warzone 2007 members unlock the full suite free via code RONY-FREE.",
        },
        # Placeholder — Google will ignore aggregateRating without ratingValue,
        # but we keep the structure so we can flip values in later revision.
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": None,
            "ratingCount": 0,
            "bestRating": "5",
            "worstRating": "1",
            "reviewCount": 0,
            "_note": "placeholder — populate when real reviews collected",
        },
    }
    if meta.get("featureList"):
        schema["featureList"] = meta["featureList"]
    # Strip aggregateRating if placeholder — Google Search Console flags null ratingValue.
    if schema["aggregateRating"]["ratingValue"] is None:
        del schema["aggregateRating"]
    payload = json.dumps(schema, ensure_ascii=False, separators=(",", ":"))
    json.loads(payload)
    return f'{BEGIN}\n<script type="application/ld+json">{payload}</script>\n{END}'


def strip_previous(html: str) -> str:
    return re.sub(
        re.escape(BEGIN) + r".*?" + re.escape(END) + r"\n?",
        "",
        html,
        flags=re.DOTALL,
    )


def inject(html: str, block: str) -> str:
    html = strip_previous(html)
    if "</head>" not in html:
        return html
    return html.replace("</head>", block + "\n</head>", 1)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--strip", action="store_true")
    ap.add_argument("--verbose", "-v", action="store_true")
    args = ap.parse_args()

    scanned = 0
    touched = 0

    for meta in TOOL_LANDING_PAGES:
        path = ROOT / str(meta["path"])
        if not path.exists():
            continue
        scanned += 1
        html = path.read_text(encoding="utf-8", errors="replace")

        if args.strip:
            new = strip_previous(html)
            if new != html:
                if not args.dry_run:
                    path.write_text(new, encoding="utf-8")
                touched += 1
                if args.verbose:
                    print(f"strip  {path.relative_to(ROOT)}")
            continue

        block = build_schema(meta)
        new = inject(html, block)
        if new == html:
            continue
        if not args.dry_run:
            path.write_text(new, encoding="utf-8")
        touched += 1
        if args.verbose:
            print(f"softapp  {path.relative_to(ROOT)}")

    print(
        f"scanned={scanned}  touched={touched}"
        f"  mode={'strip' if args.strip else ('dry' if args.dry_run else 'write')}"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
