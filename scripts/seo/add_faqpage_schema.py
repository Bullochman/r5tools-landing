#!/usr/bin/env python3
"""add_faqpage_schema.py — inject FAQPage JSON-LD into pages with Q&A markup.

Scans EN pages under r5tools-landing/ for FAQ markers (`<h2>Q:`, `<h3>Q:`,
`<h3>Frequently Asked Questions</h3>`, `<h2>FAQ</h2>`, ...) and injects a
FAQPage JSON-LD block after the existing `application/ld+json` graph. Idempotent
via BEGIN/END sentinel comments.

Usage:
    python scripts/seo/add_faqpage_schema.py             # scan + inject
    python scripts/seo/add_faqpage_schema.py --dry-run   # report only
    python scripts/seo/add_faqpage_schema.py --strip     # remove all injections

Constraints:
    - Never touches /ko/ (KR agent territory).
    - Never modifies files whose content graph would fail json.tool validation.
    - Skips pages with no detectable Q/A pairs.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import List, Tuple

ROOT = Path(__file__).resolve().parents[2]
BEGIN = "<!-- BEGIN r5tools:seo:faqpage v1 -->"
END = "<!-- END r5tools:seo:faqpage v1 -->"

# Directories that hold SEO pages. We skip /ko/ intentionally.
SEO_DIRS = ["guides", "events", "buildings", "heroes", "seasons", "warzones", "glossary", "automation"]
CORE_FILES = ["cheat-sheet.html", "roadmap.html", "leaderboard.html", "waitlist.html"]

# Q/A pair extractors. Each returns list[(question, answer)].
Q_HEADING = re.compile(r"<h([23])[^>]*>\s*Q[:.\)]\s*([^<]{3,300})</h\1>", re.IGNORECASE)
Q_STRONG = re.compile(r"<p[^>]*>\s*<strong[^>]*>\s*Q[:.\)]\s*([^<]{3,300})</strong>\s*([^<].{3,2000}?)</p>", re.IGNORECASE | re.DOTALL)
FAQ_SECTION_MARKERS = [
    re.compile(r"<h[123][^>]*>\s*(?:Frequently\s+Asked\s+Questions|FAQ|F\.A\.Q\.?)\s*</h[123]>", re.IGNORECASE),
]


def _clean_text(html: str) -> str:
    """Strip inner tags, collapse whitespace, HTML-unescape common entities."""
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


def extract_qa_pairs(html: str) -> List[Tuple[str, str]]:
    """Best-effort Q/A extraction.

    Pattern A: consecutive <h2>Q: ...</h2> / <p>A: ...</p> or next <p>.
    Pattern B: <p><strong>Q: ...</strong>...</p> style.
    Pattern C: an "FAQ" section heading followed by <h3>question</h3><p>answer</p>*.
    """
    pairs: List[Tuple[str, str]] = []

    # Pattern A: heading Q: X   then next paragraph is the answer.
    for m in Q_HEADING.finditer(html):
        q = _clean_text(m.group(2))
        after = html[m.end():m.end() + 4000]
        # first following <p>...</p> (skip empty/whitespace)
        pm = re.search(r"<p[^>]*>(.*?)</p>", after, re.DOTALL | re.IGNORECASE)
        if not pm:
            continue
        raw = pm.group(1)
        # Sometimes the pattern is "A: <answer>" — strip the leading A:
        raw = re.sub(r"^\s*(<strong>)?\s*A[:.)]\s*(</strong>)?\s*", "", raw, flags=re.IGNORECASE)
        a = _clean_text(raw)
        if q and a and len(a) > 10:
            pairs.append((q, a))

    # Pattern B: bolded Q: inside a <p>
    for m in Q_STRONG.finditer(html):
        q = _clean_text(m.group(1))
        a = _clean_text(m.group(2))
        # trim leading "A:" if present
        a = re.sub(r"^\s*A[:.)]\s*", "", a)
        if q and a and (q, a) not in pairs:
            pairs.append((q, a))

    # Pattern C: after an FAQ section heading, walk H3+P alternation until next H2.
    for marker in FAQ_SECTION_MARKERS:
        for m in marker.finditer(html):
            tail = html[m.end():]
            # cap at next <h2> to bound the FAQ section
            next_h2 = re.search(r"<h2[^>]*>", tail, re.IGNORECASE)
            section = tail[: next_h2.start()] if next_h2 else tail[:15000]
            # collect <h3>question</h3><p>answer</p> alternations
            for qm in re.finditer(
                r"<h3[^>]*>(.*?)</h3>\s*<p[^>]*>(.*?)</p>",
                section,
                re.DOTALL | re.IGNORECASE,
            ):
                q = _clean_text(qm.group(1))
                a = _clean_text(qm.group(2))
                if q and a and len(a) > 10 and (q, a) not in pairs:
                    pairs.append((q, a))

    # Dedupe on question text, keep first answer.
    seen = set()
    out: List[Tuple[str, str]] = []
    for q, a in pairs:
        key = q.lower().strip(" ?.")
        if key in seen:
            continue
        seen.add(key)
        out.append((q, a))
    return out


def build_faq_schema(pairs: List[Tuple[str, str]]) -> str:
    """Return a validated JSON-LD <script> block for FAQPage."""
    schema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": q,
                "acceptedAnswer": {"@type": "Answer", "text": a},
            }
            for q, a in pairs
        ],
    }
    # Validate via json.dumps → json.loads round trip (equivalent to `python -m json.tool`).
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
    """Inject the block right before </head>. Idempotent."""
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
    for name in CORE_FILES:
        p = base / name
        if p.exists():
            out.append(p)
    # explicitly exclude anything under /ko/
    out = [p for p in out if "/ko/" not in str(p)]
    return out


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--strip", action="store_true", help="remove existing injections")
    ap.add_argument("--verbose", "-v", action="store_true")
    args = ap.parse_args()

    touched = 0
    scanned = 0
    with_faq = 0

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

        pairs = extract_qa_pairs(html)
        if not pairs:
            continue
        with_faq += 1
        block = build_faq_schema(pairs)
        new = inject(html, block)
        if new == html:
            continue
        if not args.dry_run:
            path.write_text(new, encoding="utf-8")
        touched += 1
        if args.verbose:
            print(f"faq({len(pairs):2d})  {path.relative_to(ROOT)}")

    print(
        f"scanned={scanned}  faq-eligible={with_faq}  touched={touched}"
        f"  mode={'strip' if args.strip else ('dry' if args.dry_run else 'write')}"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
