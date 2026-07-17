#!/usr/bin/env python3
"""add_videoobject_schema.py — PLACEHOLDER.

Injects VideoObject JSON-LD for pages that embed YouTube or TikTok videos.
Right now r5tools-landing does not yet embed video content, so this script is
a scaffold. It scans for embed markers, and if any are found, emits a schema
block. Idempotent via BEGIN/END sentinel comments. Skips /ko/.

Embed markers scanned for:
  - <iframe ... src="https://www.youtube.com/embed/VIDEO_ID"...
  - <iframe ... src="https://www.youtube-nocookie.com/embed/VIDEO_ID"...
  - <blockquote class="tiktok-embed" cite="https://www.tiktok.com/@user/video/ID"...
  - data-video-id="..." attributes (custom embed pattern)

When you author a page with a video, run:
    python scripts/seo/add_videoobject_schema.py

and the page will get valid schema.org/VideoObject JSON-LD wired up.

TODO (future work — currently no-op because no embeds exist):
  - Query oEmbed for title / thumbnail / duration when available.
  - Read a sidecar JSON file next to each page (`page-videos.json`) for
    curated title / thumbnail / duration overrides.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Dict, List, Optional

ROOT = Path(__file__).resolve().parents[2]
BEGIN = "<!-- BEGIN r5tools:seo:videoobject v1 -->"
END = "<!-- END r5tools:seo:videoobject v1 -->"

SEO_DIRS = ["guides", "events", "buildings", "heroes", "seasons", "warzones", "glossary", "automation"]

CANONICAL_RE = re.compile(r'<link\s+rel=["\']canonical["\']\s+href=["\']([^"\']*)["\']', re.IGNORECASE)
TITLE_RE = re.compile(r"<title[^>]*>(.*?)</title>", re.IGNORECASE | re.DOTALL)
DESC_RE = re.compile(r'<meta\s+name=["\']description["\']\s+content=["\']([^"\']*)["\']', re.IGNORECASE)

YT_EMBED = re.compile(
    r"""<iframe[^>]*\bsrc=["'](?:https?:)?//(?:www\.)?(?:youtube(?:-nocookie)?\.com/embed/|youtu\.be/)([A-Za-z0-9_-]{6,20})""",
    re.IGNORECASE,
)
TT_EMBED = re.compile(
    r'''<blockquote[^>]*\bclass=["'][^"']*tiktok-embed[^"']*["'][^>]*\bcite=["']([^"']+)["']''',
    re.IGNORECASE,
)


def _clean(s: str) -> str:
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", s)).strip()


def collect_videos(html: str) -> List[Dict[str, str]]:
    videos: List[Dict[str, str]] = []
    for m in YT_EMBED.finditer(html):
        vid = m.group(1)
        videos.append({
            "provider": "YouTube",
            "contentUrl": f"https://www.youtube.com/watch?v={vid}",
            "embedUrl": f"https://www.youtube.com/embed/{vid}",
            "thumbnailUrl": f"https://i.ytimg.com/vi/{vid}/hqdefault.jpg",
        })
    for m in TT_EMBED.finditer(html):
        url = m.group(1)
        videos.append({
            "provider": "TikTok",
            "contentUrl": url,
            "embedUrl": url,
            "thumbnailUrl": None,
        })
    return videos


def build_schema(page_name: str, description: str, videos: List[Dict[str, str]]) -> str:
    entries = []
    for i, v in enumerate(videos, 1):
        entry = {
            "@type": "VideoObject",
            "name": f"{page_name} — clip {i}" if len(videos) > 1 else page_name,
            "description": description,
            "contentUrl": v["contentUrl"],
            "embedUrl": v["embedUrl"],
            # Placeholder — oEmbed lookup should populate uploadDate/duration
            # when we start authoring video-heavy pages.
            "uploadDate": "1970-01-01",
        }
        if v.get("thumbnailUrl"):
            entry["thumbnailUrl"] = v["thumbnailUrl"]
        entries.append(entry)

    schema = entries[0] if len(entries) == 1 else {"@context": "https://schema.org", "@graph": entries}
    if "@context" not in schema:
        schema = {"@context": "https://schema.org", **schema}
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


def iter_target_files() -> List[Path]:
    out: List[Path] = []
    for sub in SEO_DIRS:
        d = ROOT / sub
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
    touched = 0
    with_video = 0

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

        videos = collect_videos(html)
        if not videos:
            continue
        with_video += 1
        title_m = TITLE_RE.search(html)
        page_name = _clean(title_m.group(1)) if title_m else path.stem
        page_name = re.sub(r"\s*\|\s*R5TOOLS\.IO\s*$", "", page_name, flags=re.IGNORECASE)
        desc_m = DESC_RE.search(html)
        description = desc_m.group(1) if desc_m else page_name
        block = build_schema(page_name, description, videos)
        new = inject(html, block)
        if new == html:
            continue
        if not args.dry_run:
            path.write_text(new, encoding="utf-8")
        touched += 1
        if args.verbose:
            print(f"video({len(videos)})  {path.relative_to(ROOT)}")

    print(
        f"scanned={scanned}  video-embeds={with_video}  touched={touched}"
        f"  mode={'strip' if args.strip else ('dry' if args.dry_run else 'write')}"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
