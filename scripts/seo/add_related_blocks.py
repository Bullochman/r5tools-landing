#!/usr/bin/env python3
"""add_related_blocks.py — append a "Related" block to each SEO page.

For every EN SEO page in guides/, events/, buildings/, heroes/, seasons/,
warzones/, glossary/, automation/, pick 3-5 sibling pages (same category)
that best match by keyword overlap and append a small "Related" block just
before </article> (or, failing that, just before the footer .cta-card).

Idempotent — the entire block lives between BEGIN/END sentinel comments.
Re-running rebuilds the block (so if we add new pages, related blocks
update). Skips /ko/. Never touches non-SEO pages.

Usage:
    python scripts/seo/add_related_blocks.py            # write
    python scripts/seo/add_related_blocks.py --dry-run  # scan only
    python scripts/seo/add_related_blocks.py --strip    # remove all injections
    python scripts/seo/add_related_blocks.py --count 4  # override target count
"""
from __future__ import annotations

import argparse
import math
import re
import sys
from collections import Counter
from pathlib import Path
from typing import Dict, List, Tuple

ROOT = Path(__file__).resolve().parents[2]
BEGIN = "<!-- BEGIN r5tools:seo:related v1 -->"
END = "<!-- END r5tools:seo:related v1 -->"

SEO_DIRS = ["guides", "events", "buildings", "heroes", "seasons", "warzones", "glossary", "automation"]

TITLE_RE = re.compile(r"<title[^>]*>(.*?)</title>", re.IGNORECASE | re.DOTALL)
DESC_RE = re.compile(r'<meta\s+name=["\']description["\']\s+content=["\']([^"\']*)["\']', re.IGNORECASE)
KW_RE = re.compile(r'<meta\s+name=["\']keywords["\']\s+content=["\']([^"\']*)["\']', re.IGNORECASE)
CANONICAL_RE = re.compile(r'<link\s+rel=["\']canonical["\']\s+href=["\']([^"\']*)["\']', re.IGNORECASE)

STOPWORDS = set(
    "the a an and or but if to for of in on at by as with from is are was were be been being "
    "how what when why where which who whom whose that this those these it its i you he she we they "
    "your our their my me us them not no yes so than then here there over under about into onto "
    "guide guides r5tools last war survival lws season s1 s2 s3 s4 s5 s6".split()
)


def _clean(s: str) -> str:
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", s)).strip()


def strip_previous(html: str) -> str:
    return re.sub(
        re.escape(BEGIN) + r".*?" + re.escape(END) + r"\n?",
        "",
        html,
        flags=re.DOTALL,
    )


def tokenize(text: str) -> List[str]:
    tokens = re.findall(r"[a-z0-9]+", text.lower())
    return [t for t in tokens if len(t) > 2 and t not in STOPWORDS]


def category_of(path: Path) -> str:
    return path.parent.name


def load_pages() -> Dict[Path, dict]:
    """Return {path: {category, url, title, keywords_tokens}} for every EN SEO page."""
    out: Dict[Path, dict] = {}
    for sub in SEO_DIRS:
        d = ROOT / sub
        if not d.is_dir():
            continue
        for path in sorted(d.glob("*.html")):
            if "/ko/" in str(path):
                continue
            html = path.read_text(encoding="utf-8", errors="replace")
            title_m = TITLE_RE.search(html)
            title = _clean(title_m.group(1)) if title_m else path.stem
            title = re.sub(r"\s*\|\s*R5TOOLS\.IO\s*$", "", title, flags=re.IGNORECASE)
            desc_m = DESC_RE.search(html)
            desc = desc_m.group(1) if desc_m else ""
            kw_m = KW_RE.search(html)
            kw = kw_m.group(1) if kw_m else ""
            canon_m = CANONICAL_RE.search(html)
            url = canon_m.group(1) if canon_m else f"/{path.relative_to(ROOT)}"
            tokens = tokenize(f"{path.stem} {title} {desc} {kw}")
            out[path] = {
                "category": category_of(path),
                "url": url,
                "title": title,
                "tokens": Counter(tokens),
                "raw_html": html,
            }
    return out


def score(a: Counter, b: Counter) -> float:
    """Cosine similarity between two token counters."""
    if not a or not b:
        return 0.0
    common = set(a) & set(b)
    if not common:
        return 0.0
    dot = sum(a[t] * b[t] for t in common)
    na = math.sqrt(sum(v * v for v in a.values()))
    nb = math.sqrt(sum(v * v for v in b.values()))
    return dot / (na * nb) if na and nb else 0.0


def pick_related(page: Path, pages: Dict[Path, dict], target: int) -> List[Tuple[Path, float]]:
    """Pick top-N sibling pages from the same category by token overlap."""
    src = pages[page]
    candidates: List[Tuple[Path, float]] = []
    for other, meta in pages.items():
        if other == page:
            continue
        if meta["category"] != src["category"]:
            continue
        s = score(src["tokens"], meta["tokens"])
        if s > 0:
            candidates.append((other, s))
    candidates.sort(key=lambda x: (-x[1], pages[x[0]]["title"]))
    return candidates[:target]


def build_block(picks: List[Tuple[Path, float]], pages: Dict[Path, dict]) -> str:
    if not picks:
        return ""
    items = "\n".join(
        f'    <li><a href="{pages[p]["url"]}">{pages[p]["title"]}</a></li>'
        for p, _ in picks
    )
    return (
        f"{BEGIN}\n"
        f'<section class="related" aria-label="Related pages" '
        f'style="margin:40px 0 12px;padding:18px 20px;background:var(--panel,#0d1424);'
        f'border:1px solid var(--border,rgba(255,255,255,0.08));border-radius:10px">\n'
        f'  <h3 style="margin:0 0 10px;font-size:14px;letter-spacing:0.08em;'
        f'text-transform:uppercase;color:var(--accent,#c9a961)">Related</h3>\n'
        f'  <ul style="margin:0;padding-left:20px;color:var(--text-dim,#a8b0c0);'
        f'font-size:14px;line-height:1.8">\n{items}\n  </ul>\n'
        f"</section>\n"
        f"{END}"
    )


def inject(html: str, block: str) -> str:
    """Insert block. Prefer just before </article>; fallback to before </div>\n<a class=\"beta-pill\"."""
    html = strip_previous(html)
    if not block:
        return html
    if "</article>" in html:
        return html.replace("</article>", block + "\n</article>", 1)
    # Fallback for pages without <article>: insert before final .cta-card or footer.
    m = re.search(r'<div class="cta-card">', html)
    if m:
        return html[: m.start()] + block + "\n  " + html[m.start():]
    if "</main>" in html:
        return html.replace("</main>", block + "\n</main>", 1)
    if "</body>" in html:
        return html.replace("</body>", block + "\n</body>", 1)
    return html


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--strip", action="store_true")
    ap.add_argument("--count", type=int, default=5, help="target number of related links (default 5, minimum 3)")
    ap.add_argument("--verbose", "-v", action="store_true")
    args = ap.parse_args()
    target = max(3, args.count)

    print("Loading pages...", file=sys.stderr)
    pages = load_pages()
    print(f"  loaded {len(pages)} EN SEO pages", file=sys.stderr)

    touched = 0
    empty = 0

    for path, meta in pages.items():
        html = meta["raw_html"]
        if args.strip:
            new = strip_previous(html)
            if new != html:
                if not args.dry_run:
                    path.write_text(new, encoding="utf-8")
                touched += 1
                if args.verbose:
                    print(f"strip  {path.relative_to(ROOT)}")
            continue

        picks = pick_related(path, pages, target)
        if not picks:
            empty += 1
            continue
        block = build_block(picks, pages)
        new = inject(html, block)
        if new == html:
            continue
        if not args.dry_run:
            path.write_text(new, encoding="utf-8")
        touched += 1
        if args.verbose:
            print(f"related({len(picks)}) {path.relative_to(ROOT)}")

    print(
        f"pages={len(pages)}  touched={touched}  no-siblings={empty}  target-per-page={target}"
        f"  mode={'strip' if args.strip else ('dry' if args.dry_run else 'write')}"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
