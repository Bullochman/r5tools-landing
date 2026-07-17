#!/usr/bin/env python3
"""add_howto_schema.py — inject HowTo JSON-LD into step-by-step guide pages.

A page is HowTo-eligible when it satisfies BOTH:
  1. Title / URL slug matches a "how to..." or "...-guide" pattern
     (e.g. how-to-plan-season-2-landing, alliance-furnace-guide).
  2. Body contains at least 3 ordered-list steps inside <ol><li>...</li></ol>
     within the first <article> (or first <ol> we find after <h1>).

Idempotent via BEGIN/END sentinel comments. Skips /ko/. Injects right before
</head>.

Usage:
    python scripts/seo/add_howto_schema.py            # write
    python scripts/seo/add_howto_schema.py --dry-run  # scan only
    python scripts/seo/add_howto_schema.py --strip    # remove injections
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import List, Optional

ROOT = Path(__file__).resolve().parents[2]
BEGIN = "<!-- BEGIN r5tools:seo:howto v1 -->"
END = "<!-- END r5tools:seo:howto v1 -->"

# Restrict to /guides/ — that's where the step-by-step content lives.
SEO_DIRS = ["guides"]

TITLE_RE = re.compile(r"<title[^>]*>(.*?)</title>", re.IGNORECASE | re.DOTALL)
H1_RE = re.compile(r"<h1[^>]*>(.*?)</h1>", re.IGNORECASE | re.DOTALL)
DESC_RE = re.compile(r'<meta\s+name=["\']description["\']\s+content=["\']([^"\']*)["\']', re.IGNORECASE)
CANONICAL_RE = re.compile(r'<link\s+rel=["\']canonical["\']\s+href=["\']([^"\']*)["\']', re.IGNORECASE)
IMAGE_RE = re.compile(r'<meta\s+property=["\']og:image["\']\s+content=["\']([^"\']*)["\']', re.IGNORECASE)

# Match a howto slug OR a "*-guide.html" filename OR the "how-to-" prefix.
HOWTO_SLUG = re.compile(r"^(how-to-|.*-guide$)", re.IGNORECASE)


def _clean_text(html: str) -> str:
    text = re.sub(r"<[^>]+>", " ", html)
    text = re.sub(r"\s+", " ", text).strip()
    return (
        text.replace("&nbsp;", " ")
            .replace("&amp;", "&")
            .replace("&quot;", '"')
            .replace("&#x27;", "'")
            .replace("&#39;", "'")
            .replace("&lt;", "<")
            .replace("&gt;", ">")
    )


def extract_first_ol_steps(html: str) -> List[str]:
    """Return cleaned <li> text from the first <ol> after </h1>. Cap at 20 steps."""
    h1 = H1_RE.search(html)
    tail = html[h1.end():] if h1 else html
    om = re.search(r"<ol[^>]*>(.*?)</ol>", tail, re.DOTALL | re.IGNORECASE)
    if not om:
        return []
    inner = om.group(1)
    steps = []
    for lm in re.finditer(r"<li[^>]*>(.*?)</li>", inner, re.DOTALL | re.IGNORECASE):
        s = _clean_text(lm.group(1))
        if s and len(s) > 5:
            steps.append(s)
        if len(steps) >= 20:
            break
    return steps


def is_howto_slug(path: Path) -> bool:
    return bool(HOWTO_SLUG.match(path.stem))


def build_howto_schema(
    *,
    name: str,
    description: str,
    canonical: str,
    image: Optional[str],
    steps: List[str],
) -> str:
    schema = {
        "@context": "https://schema.org",
        "@type": "HowTo",
        "name": name,
        "description": description,
        "step": [
            {
                "@type": "HowToStep",
                "position": i + 1,
                "name": f"Step {i + 1}",
                "text": step[:900],
                "url": f"{canonical}#step-{i + 1}",
            }
            for i, step in enumerate(steps)
        ],
    }
    if image:
        schema["image"] = image
    payload = json.dumps(schema, ensure_ascii=False, separators=(",", ":"))
    json.loads(payload)  # validation
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


def iter_target_files() -> List[Path]:
    base = ROOT
    out: List[Path] = []
    for sub in SEO_DIRS:
        d = base / sub
        if d.is_dir():
            out.extend(sorted(p for p in d.glob("*.html")))
    return [p for p in out if "/ko/" not in str(p)]


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--strip", action="store_true")
    ap.add_argument("--verbose", "-v", action="store_true")
    args = ap.parse_args()

    scanned = 0
    eligible = 0
    touched = 0
    reasons_skipped = {"slug": 0, "no-steps": 0, "no-canonical": 0}

    for path in iter_target_files():
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

        if not is_howto_slug(path):
            reasons_skipped["slug"] += 1
            continue

        steps = extract_first_ol_steps(html)
        if len(steps) < 3:
            reasons_skipped["no-steps"] += 1
            continue

        canonical_m = CANONICAL_RE.search(html)
        if not canonical_m:
            reasons_skipped["no-canonical"] += 1
            continue

        title_m = TITLE_RE.search(html)
        name = _clean_text(title_m.group(1)) if title_m else path.stem
        # Strip trailing "| R5TOOLS.IO"
        name = re.sub(r"\s*\|\s*R5TOOLS\.IO\s*$", "", name, flags=re.IGNORECASE)

        desc_m = DESC_RE.search(html)
        description = desc_m.group(1) if desc_m else name

        image_m = IMAGE_RE.search(html)
        image = image_m.group(1) if image_m else None

        eligible += 1
        block = build_howto_schema(
            name=name,
            description=description,
            canonical=canonical_m.group(1),
            image=image,
            steps=steps,
        )
        new = inject(html, block)
        if new == html:
            continue
        if not args.dry_run:
            path.write_text(new, encoding="utf-8")
        touched += 1
        if args.verbose:
            print(f"howto({len(steps):2d})  {path.relative_to(ROOT)}")

    print(
        f"scanned={scanned}  howto-eligible={eligible}  touched={touched}"
        f"  skipped={reasons_skipped}"
        f"  mode={'strip' if args.strip else ('dry' if args.dry_run else 'write')}"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
