#!/usr/bin/env python3
"""
build_seo_pages.py — programmatic-SEO page generator for r5tools.io

Parses the LWS Knowledge Base (~/claudecode/r5tools/LWS_Knowledge_Base/kb/*.md)
and emits hundreds of long-tail HTML pages under this repo:

    /seasons/<slug>.html      (7 seasons)
    /heroes/<slug>.html       (every UR + SSR + SR hero)
    /buildings/<slug>.html    (HQ + every building/tier bucket)
    /events/<slug>.html       (every recurring event)
    /warzones/warzone-<id>.html (major LWS warzones)
    /guides/<slug>.html       (~40 hand-picked query-intent guides)
    /glossary/<slug>.html     (every KR-EN term in glossary)

Every page carries:
    - <title> under 65 chars, query-optimized
    - meta description under 160 chars
    - Article schema.org JSON-LD
    - OG image tag → r5tools.io/static/og-image.png
    - Canonical URL
    - Breadcrumb back to /
    - CTA "Try free with code RONY-FREE →" → https://access-codes.r5tools.io
    - Suite-nav strip
    - Beta feedback pill

Also rewrites sitemap.xml with an entry for every generated page.
"""

from __future__ import annotations

import html
import os
import re
import sys
import unicodedata
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, List, Optional, Tuple

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------

REPO_ROOT = Path(__file__).resolve().parent
KB_ROOT = REPO_ROOT.parent / "LWS_Knowledge_Base" / "kb"
SITE_BASE = "https://r5tools.io"
ACCESS_CODES_URL = "https://access-codes.r5tools.io"
OG_IMAGE = f"{SITE_BASE}/static/og-image.png"

OUTPUT_DIRS = {
    "seasons": REPO_ROOT / "seasons",
    "heroes": REPO_ROOT / "heroes",
    "buildings": REPO_ROOT / "buildings",
    "events": REPO_ROOT / "events",
    "warzones": REPO_ROOT / "warzones",
    "guides": REPO_ROOT / "guides",
    "glossary": REPO_ROOT / "glossary",
}

for d in OUTPUT_DIRS.values():
    d.mkdir(parents=True, exist_ok=True)

# ---------------------------------------------------------------------------
# Utilities
# ---------------------------------------------------------------------------

def slugify(s: str) -> str:
    s = unicodedata.normalize("NFKD", s)
    s = s.encode("ascii", "ignore").decode("ascii")
    s = re.sub(r"[^\w\s-]", "", s.lower())
    s = re.sub(r"[\s_-]+", "-", s).strip("-")
    return s or "x"


def clip(s: str, n: int) -> str:
    s = s.strip()
    if len(s) <= n:
        return s
    return s[: n - 1].rstrip(" ,.;:—-") + "…"


def clean_meta(s: str) -> str:
    """Strip markdown, keep it short and clean for meta description."""
    s = re.sub(r"\[\[([^\]]+?)\]\]", r"\1", s)             # wiki-links
    s = re.sub(r"\[([^\]]+?)\]\([^)]+\)", r"\1", s)         # md links
    s = re.sub(r"[*_`#>|~]", "", s)                          # md tokens
    s = re.sub(r"\s+", " ", s).strip()
    return s


def md_to_html_inline(s: str) -> str:
    """Basic inline markdown → HTML (bold, italic, code, links, wiki-links)."""
    s = html.escape(s)
    # Wiki links [[foo]] → plain (KB refs — no target)
    s = re.sub(r"\[\[([^\]]+?)\]\]", r"<em>\1</em>", s)
    # Markdown links [text](url)
    s = re.sub(
        r"\[([^\]]+?)\]\(([^)]+?)\)",
        r'<a href="\2" rel="nofollow noopener">\1</a>',
        s,
    )
    # Bold **x** / __x__
    s = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", s)
    s = re.sub(r"__(.+?)__", r"<strong>\1</strong>", s)
    # Italic *x* / _x_ (careful w/ underscores in words)
    s = re.sub(r"(?<![\w*])\*(?!\s)(.+?)(?<!\s)\*(?![\w*])", r"<em>\1</em>", s)
    # Code `x`
    s = re.sub(r"`([^`]+?)`", r"<code>\1</code>", s)
    return s


def md_block_to_html(block: str) -> str:
    """Render a KB markdown block as HTML. Handles headings, lists, tables, paragraphs, code."""
    lines = block.splitlines()
    out: List[str] = []
    i = 0
    n = len(lines)

    while i < n:
        line = lines[i]

        # blank
        if not line.strip():
            i += 1
            continue

        # code fence
        if line.strip().startswith("```"):
            code: List[str] = []
            i += 1
            while i < n and not lines[i].strip().startswith("```"):
                code.append(lines[i])
                i += 1
            i += 1  # skip closing
            out.append("<pre><code>" + html.escape("\n".join(code)) + "</code></pre>")
            continue

        # heading
        m = re.match(r"^(#{2,6})\s+(.+)$", line)
        if m:
            depth = min(len(m.group(1)) + 1, 6)  # h2 minimum (h1 reserved for page title)
            text = md_to_html_inline(m.group(2))
            out.append(f"<h{depth}>{text}</h{depth}>")
            i += 1
            continue

        # table
        if "|" in line and i + 1 < n and re.match(r"^\s*\|?[\s\-:|]+\|?\s*$", lines[i + 1]):
            header_cells = [c.strip() for c in line.strip().strip("|").split("|")]
            i += 2  # skip header + sep
            rows: List[List[str]] = []
            while i < n and "|" in lines[i] and lines[i].strip():
                row = [c.strip() for c in lines[i].strip().strip("|").split("|")]
                # pad/truncate to header width
                if len(row) < len(header_cells):
                    row += [""] * (len(header_cells) - len(row))
                rows.append(row[: len(header_cells)])
                i += 1
            th = "".join(f"<th>{md_to_html_inline(c)}</th>" for c in header_cells)
            body = "".join(
                "<tr>" + "".join(f"<td>{md_to_html_inline(c)}</td>" for c in r) + "</tr>"
                for r in rows
            )
            out.append(
                f'<div class="tbl-wrap"><table><thead><tr>{th}</tr></thead><tbody>{body}</tbody></table></div>'
            )
            continue

        # bullet list
        if re.match(r"^\s*[-*+]\s+", line):
            items: List[str] = []
            while i < n and re.match(r"^\s*[-*+]\s+", lines[i]):
                items.append(md_to_html_inline(re.sub(r"^\s*[-*+]\s+", "", lines[i])))
                i += 1
            out.append("<ul>" + "".join(f"<li>{it}</li>" for it in items) + "</ul>")
            continue

        # ordered list
        if re.match(r"^\s*\d+\.\s+", line):
            items = []
            while i < n and re.match(r"^\s*\d+\.\s+", lines[i]):
                items.append(md_to_html_inline(re.sub(r"^\s*\d+\.\s+", "", lines[i])))
                i += 1
            out.append("<ol>" + "".join(f"<li>{it}</li>" for it in items) + "</ol>")
            continue

        # blockquote
        if line.startswith(">"):
            quotes: List[str] = []
            while i < n and lines[i].startswith(">"):
                quotes.append(md_to_html_inline(lines[i].lstrip("> ").rstrip()))
                i += 1
            out.append("<blockquote>" + "<br>".join(quotes) + "</blockquote>")
            continue

        # paragraph — accumulate until blank/heading/list
        para: List[str] = [line]
        i += 1
        while i < n and lines[i].strip() and not re.match(r"^(#{1,6}\s|[-*+]\s|\d+\.\s|>|```)", lines[i]):
            para.append(lines[i])
            i += 1
        out.append("<p>" + md_to_html_inline(" ".join(para)) + "</p>")

    return "\n".join(out)


# ---------------------------------------------------------------------------
# KB parser
# ---------------------------------------------------------------------------

@dataclass
class KBSection:
    depth: int
    title: str
    body: str  # markdown, sans heading line
    subsections: List["KBSection"] = field(default_factory=list)

    def find(self, needle: str) -> Optional["KBSection"]:
        low = needle.lower()
        if low in self.title.lower():
            return self
        for s in self.subsections:
            r = s.find(needle)
            if r:
                return r
        return None

    def walk(self):
        yield self
        for s in self.subsections:
            yield from s.walk()


def parse_kb(md: str) -> KBSection:
    """Build a tree from KB markdown."""
    lines = md.splitlines()
    root = KBSection(depth=0, title="root", body="")
    stack: List[KBSection] = [root]
    buf: List[str] = []

    def flush():
        if not buf:
            return
        stack[-1].body = (stack[-1].body + "\n" + "\n".join(buf)).strip() if stack[-1].body else "\n".join(buf).strip()
        buf.clear()

    for line in lines:
        m = re.match(r"^(#{1,6})\s+(.+)$", line)
        if m:
            flush()
            depth = len(m.group(1))
            title = m.group(2).strip()
            node = KBSection(depth=depth, title=title, body="")
            # walk stack back to parent
            while stack and stack[-1].depth >= depth:
                stack.pop()
            if not stack:
                stack.append(root)
            stack[-1].subsections.append(node)
            stack.append(node)
        else:
            buf.append(line)
    flush()
    return root


def load_kb() -> Dict[str, KBSection]:
    out = {}
    for md_file in sorted(KB_ROOT.glob("*.md")):
        out[md_file.stem] = parse_kb(md_file.read_text(encoding="utf-8"))
    return out


# ---------------------------------------------------------------------------
# HTML template
# ---------------------------------------------------------------------------

BASE_CSS = """
* { box-sizing: border-box; }
:root {
  --bg: #0a0e1a; --panel: #0d1424; --panel-2: #12192c;
  --border: rgba(255,255,255,0.08); --border-accent: rgba(201,169,97,0.3);
  --accent: #c9a961; --accent-hover: #d9b871;
  --text: #e6e8ee; --text-dim: #a8b0c0; --text-mute: #7a8290;
  --live: #8ae0a3; --soon: #e6cf7a;
  --mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}
html,body { margin:0; padding:0; background:var(--bg); color:var(--text);
  font-family: system-ui,-apple-system,"Segoe UI",Roboto,"Noto Sans KR",sans-serif;
  -webkit-font-smoothing:antialiased; line-height:1.6; }
.wrap { max-width: 900px; margin: 0 auto; padding: 24px 20px 96px; }
.suite-nav { display:flex; gap:8px; flex-wrap:wrap; font-size:12px;
  padding: 10px 16px; background: var(--panel); border-bottom: 1px solid var(--border);
  justify-content:center; }
.suite-nav a { color: var(--text-dim); text-decoration:none; padding: 4px 10px;
  border:1px solid var(--border); border-radius:14px; }
.suite-nav a:hover { color: var(--accent); border-color: var(--accent); }
.crumbs { font-size:12px; color: var(--text-mute); margin: 16px 0 8px;
  letter-spacing: 0.03em; }
.crumbs a { color: var(--text-dim); text-decoration:none; }
.crumbs a:hover { color: var(--accent); }
h1 { font-size: 34px; line-height:1.2; letter-spacing:-0.01em;
  margin: 4px 0 12px; font-weight:600; }
h1 .accent { color: var(--accent); }
h2 { font-size:22px; margin: 40px 0 12px; color: var(--accent);
  border-bottom:1px solid var(--border); padding-bottom:6px; font-weight:600; }
h3 { font-size:17px; margin: 28px 0 8px; color: var(--text); font-weight:600; }
h4 { font-size:15px; margin: 20px 0 6px; color: var(--text-dim); }
p { color: var(--text-dim); }
strong { color: var(--text); }
.lede { font-size:17px; color: var(--text); margin: 10px 0 24px; }
ul, ol { color: var(--text-dim); padding-left:22px; }
ul li, ol li { margin: 4px 0; }
code { background: var(--panel-2); padding:1px 5px; border-radius:3px;
  font-family: var(--mono); font-size: 0.92em; color: var(--text); }
pre { background: var(--panel-2); padding: 12px; border-radius:8px;
  overflow-x:auto; border:1px solid var(--border); font-size:13px; }
pre code { background:none; padding:0; }
blockquote { margin: 12px 0; padding: 8px 14px; border-left:3px solid var(--accent);
  background: var(--panel); color: var(--text-dim); }
.tbl-wrap { overflow-x:auto; margin: 12px 0 20px; }
table { border-collapse:collapse; width:100%; font-size: 13px; }
th, td { border: 1px solid var(--border); padding: 6px 10px; text-align:left;
  vertical-align:top; }
th { background: var(--panel-2); color: var(--accent); font-weight:600; }
td { color: var(--text-dim); }
.cta-card { background: linear-gradient(135deg, rgba(201,169,97,0.12), rgba(201,169,97,0.04));
  border:1px solid var(--border-accent); border-radius:14px; padding: 22px 24px;
  margin: 36px 0 20px; text-align:center; }
.cta-card h3 { color: var(--accent); font-size:18px; margin: 0 0 8px; }
.cta-card p { margin: 0 0 14px; color: var(--text); }
.cta-card a.btn { display:inline-block; background: var(--accent);
  color: #000; text-decoration:none; padding: 10px 22px; border-radius:22px;
  font-weight:600; font-size:14px; }
.cta-card a.btn:hover { background: var(--accent-hover); }
.tools-row { display:flex; gap:8px; flex-wrap:wrap; margin: 12px 0 20px; }
.tools-row a { color: var(--text); background: var(--panel);
  border: 1px solid var(--border); border-radius: 20px;
  padding: 6px 14px; text-decoration:none; font-size:13px; }
.tools-row a:hover { border-color: var(--accent); color: var(--accent); }
.beta-pill { position:fixed; bottom: 18px; right: 18px;
  background: var(--panel); border:1px solid var(--border-accent);
  color: var(--text); font-size:12px; padding: 8px 14px;
  border-radius: 20px; text-decoration:none; z-index:50;
  box-shadow: 0 4px 12px rgba(0,0,0,0.4); }
.beta-pill:hover { border-color: var(--accent); color: var(--accent); }
.foot { text-align:center; color: var(--text-mute); font-size:12px;
  margin-top: 60px; padding-top: 20px; border-top: 1px solid var(--border); }
.foot a { color: var(--text-dim); text-decoration:none; }
.foot a:hover { color: var(--accent); }
@media (max-width: 600px) {
  h1 { font-size: 26px; }
  h2 { font-size: 18px; }
  .wrap { padding: 16px 14px 96px; }
}
"""

SUITE_NAV_HTML = """<nav class="suite-nav" aria-label="R5TOOLS.IO suite">
  <a href="https://r5tools.io/">Home</a>
  <a href="https://roster.r5tools.io/">Roster Extractor</a>
  <a href="https://hive.r5tools.io/">Hive Planner</a>
  <a href="https://bullochman.github.io/lws-season-timeline-static/">Season Timeline</a>
  <a href="https://bullochman.github.io/lws-landing-planner-static/">Landing Planner</a>
  <a href="https://bullochman.github.io/lws-heat-simulator-static/">Heat Sim</a>
  <a href="https://bullochman.github.io/lws-freeze-risk-static/">Freeze Risk</a>
  <a href="https://bullochman.github.io/lws-coal-burn-static/">Coal Burn</a>
  <a href="https://bullochman.github.io/lws-city-capture-static/">City Capture</a>
</nav>"""

FOOT_HTML = """<footer class="foot">
  <p>Part of the <a href="https://r5tools.io/">R5TOOLS.IO</a> Last War: Survival alliance toolkit.
     Fan-made · unaffiliated with First Fun / Century Games.
     <a href="https://r5tools.io/terms.html">Terms</a> · <a href="https://r5tools.io/privacy.html">Privacy</a>.
  </p>
</footer>"""


def render_page(
    *,
    title: str,
    meta_desc: str,
    canonical_path: str,
    breadcrumbs: List[Tuple[str, str]],
    h1: str,
    lede: str,
    body_html: str,
    related_tools: Optional[List[Tuple[str, str]]] = None,
    schema_type: str = "Article",
    keywords: Optional[List[str]] = None,
) -> str:
    canonical = f"{SITE_BASE}{canonical_path}"
    kw_meta = ""
    if keywords:
        kw_meta = f'<meta name="keywords" content="{html.escape(", ".join(keywords))}">'
    crumb_html = " › ".join(
        f'<a href="{html.escape(url)}">{html.escape(label)}</a>' if url else f"<span>{html.escape(label)}</span>"
        for label, url in breadcrumbs
    )
    tools_html = ""
    if related_tools:
        tools_html = (
            '<div class="tools-row">'
            + "".join(f'<a href="{html.escape(u)}">{html.escape(l)}</a>' for l, u in related_tools)
            + "</div>"
        )
    breadcrumb_items = []
    for i, (label, url) in enumerate(breadcrumbs):
        if url:
            item_url = url if url.startswith("http") else f"{SITE_BASE}{url}"
        else:
            item_url = canonical
        breadcrumb_items.append(
            {
                "@type": "ListItem",
                "position": i + 1,
                "name": label,
                "item": item_url,
            }
        )
    schema = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": schema_type,
                "headline": h1,
                "description": meta_desc,
                "author": {"@type": "Organization", "name": "R5TOOLS.IO"},
                "publisher": {
                    "@type": "Organization",
                    "name": "R5TOOLS.IO",
                    "url": SITE_BASE,
                },
                "image": OG_IMAGE,
                "mainEntityOfPage": canonical,
                "inLanguage": "en",
            },
            {
                "@type": "BreadcrumbList",
                "itemListElement": breadcrumb_items,
            },
        ],
    }
    import json
    schema_json = json.dumps(schema, ensure_ascii=False)

    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{html.escape(title)}</title>
<meta name="description" content="{html.escape(meta_desc)}">
{kw_meta}
<link rel="canonical" href="{canonical}">
<meta property="og:title" content="{html.escape(title)}">
<meta property="og:description" content="{html.escape(meta_desc)}">
<meta property="og:type" content="article">
<meta property="og:url" content="{canonical}">
<meta property="og:image" content="{OG_IMAGE}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{html.escape(title)}">
<meta name="twitter:description" content="{html.escape(meta_desc)}">
<meta name="twitter:image" content="{OG_IMAGE}">
<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='18' fill='%230a0e1a'/%3E%3Ctext x='50' y='72' text-anchor='middle' font-family='system-ui,sans-serif' font-weight='700' font-size='60' fill='%23c9a961'%3ER5%3C/text%3E%3C/svg%3E">
<script type="application/ld+json">{schema_json}</script>
<style>{BASE_CSS}</style>
</head>
<body>
{SUITE_NAV_HTML}
<div class="wrap">
  <nav class="crumbs" aria-label="Breadcrumb">{crumb_html}</nav>
  <h1>{h1}</h1>
  <p class="lede">{html.escape(lede)}</p>
  {tools_html}
  <div class="cta-card">
    <h3>Try free with code <code>RONY-FREE</code></h3>
    <p>All R5TOOLS.IO planners unlock instantly for Warzone 2007 members — no signup, no payment.</p>
    <a class="btn" href="{ACCESS_CODES_URL}" rel="noopener">Unlock your alliance →</a>
  </div>
  <article>
    {body_html}
  </article>
  <div class="cta-card">
    <h3>Bring this into your alliance chat</h3>
    <p>Every R5TOOLS.IO planner exports Discord-ready PNGs, roster CSVs, and share links.</p>
    <a class="btn" href="{ACCESS_CODES_URL}" rel="noopener">Get started free →</a>
  </div>
  {FOOT_HTML}
</div>
<a class="beta-pill" href="https://r5tools.io/#feedback">Beta · feedback</a>
</body>
</html>
"""


# ---------------------------------------------------------------------------
# Generators
# ---------------------------------------------------------------------------

@dataclass
class GeneratedPage:
    category: str
    slug: str
    rel_path: str  # e.g. /seasons/s2-polar-storm.html
    priority: float = 0.6
    changefreq: str = "weekly"


generated: List[GeneratedPage] = []
kb_gaps: List[str] = []


def write_page(category: str, slug: str, filename: str, html_str: str, priority: float = 0.6) -> None:
    out_dir = OUTPUT_DIRS[category]
    out_path = out_dir / filename
    out_path.write_text(html_str, encoding="utf-8")
    rel = f"/{category}/{filename}"
    generated.append(GeneratedPage(category, slug, rel, priority=priority))


# ---------- SEASONS ---------------------------------------------------------

SEASON_META = [
    {
        "id": "s1-crimson-plague",
        "num": 1,
        "name": "Crimson Plague",
        "kb": "05-season-1-crimson-plague",
        "one_line": "Season 1 (Doomsday) — the original 48-day zombie-plague season with Corruptor Bosses, virus mechanics, and the Mason SSR→UR promotion.",
        "title": "Season 1 Crimson Plague guide — LWS",
    },
    {
        "id": "s2-polar-storm",
        "num": 2,
        "name": "Polar Storm",
        "kb": "06-season-2-frozen",
        "one_line": "Season 2 (Frozen / Polar Storm) — the temperature season with Alliance Furnace, freeze mechanics, coal economy, Rare Soil War, and Warlord Missiles.",
        "title": "Season 2 Polar Storm guide — LWS",
    },
    {
        "id": "s3-golden-kingdom",
        "num": 3,
        "name": "Golden Kingdom",
        "kb": "07-future-seasons",
        "kb_section": "Season 3",
        "one_line": "Season 3 (Golden Kingdom / Egyptian desert) — Spice Wars, Curse Resistance, Sandworms, Pyramid War, and the Scarlett SSR→UR promotion.",
        "title": "Season 3 Golden Kingdom guide — LWS",
    },
    {
        "id": "s4-evernight-isle",
        "num": 4,
        "name": "Evernight Isle",
        "kb": "07-future-seasons",
        "kb_section": "Season 4",
        "one_line": "Season 4 (Evernight Isle / Sakura map) — Blood Night, Lighthouse power, Copper Wars, Oni Legion, and the Sarah SSR→UR promotion.",
        "title": "Season 4 Evernight Isle guide — LWS",
    },
    {
        "id": "s5-wild-west",
        "num": 5,
        "name": "Wild West",
        "kb": "07-future-seasons",
        "kb_section": "Season 5",
        "one_line": "Season 5 (Wild West / Golden Wasteland) — Banks, Trade Trains, Alliance Safe Time, High Noon caps, and the Venom SSR→UR promotion.",
        "title": "Season 5 Wild West guide — LWS",
    },
    {
        "id": "s6-shadow-rainforest",
        "num": 6,
        "name": "Shadow Rainforest",
        "kb": "07-future-seasons",
        "kb_section": "Season 6",
        "one_line": "Season 6 (Shadow / Lost Rainforest) — 4v4 faction warfare, Hero Awakening, Altars, permanent city destruction, and the Braz SSR→UR promotion.",
        "title": "Season 6 Shadow Rainforest guide — LWS",
    },
    {
        "id": "s7-unnamed",
        "num": 7,
        "name": "Season 7",
        "kb": "07-future-seasons",
        "kb_section": "Season 7",
        "one_line": "Season 7 (unannounced, ~August 2026) — leaked details, expected mechanics, and what to prep during Celebration Week.",
        "title": "Season 7 guide — LWS (leak tracker)",
    },
]

SEASON_TOOL_CTA = [
    ("Landing Planner", "https://bullochman.github.io/lws-landing-planner-static/"),
    ("Season Timeline", "https://bullochman.github.io/lws-season-timeline-static/"),
    ("Coal Burn Calculator", "https://bullochman.github.io/lws-coal-burn-static/"),
    ("Heat Simulator", "https://bullochman.github.io/lws-heat-simulator-static/"),
    ("Freeze Risk", "https://bullochman.github.io/lws-freeze-risk-static/"),
    ("City Capture", "https://bullochman.github.io/lws-city-capture-static/"),
    ("Hive Planner", "https://hive.r5tools.io/"),
]


def gen_seasons(kb: Dict[str, KBSection]) -> None:
    for meta in SEASON_META:
        root = kb.get(meta["kb"])
        if not root:
            kb_gaps.append(f"season {meta['id']}: KB file {meta['kb']} missing")
            continue

        # For 07-future-seasons.md we want a specific subsection; for the two dedicated
        # season files we take the whole file.
        section_body_md = ""
        section: Optional[KBSection] = None
        if "kb_section" in meta:
            for s in root.walk():
                if meta["kb_section"].lower() in s.title.lower() and s.depth <= 3:
                    section = s
                    break
            if not section:
                kb_gaps.append(f"season {meta['id']}: could not find section '{meta['kb_section']}' in {meta['kb']}")
                # fall through and use the whole file
        if not section:
            # For the whole-file seasons (S1, S2), skip the top-level H1 and use the first real chunk
            section = root
            section_body_md = root.body
            for sub in root.subsections:
                section_body_md += f"\n\n## {sub.title}\n\n{sub.body}"
                for ss in sub.subsections:
                    section_body_md += f"\n\n### {ss.title}\n\n{ss.body}"
                    for sss in ss.subsections:
                        section_body_md += f"\n\n#### {sss.title}\n\n{sss.body}"
        else:
            # We have a specific subsection tree
            def flatten(node: KBSection, base: int) -> str:
                out = node.body or ""
                for sub in node.subsections:
                    header = "#" * min(sub.depth + (2 - base), 6)
                    out += f"\n\n{header} {sub.title}\n\n{sub.body}"
                    for ss in sub.subsections:
                        header2 = "#" * min(ss.depth + (2 - base), 6)
                        out += f"\n\n{header2} {ss.title}\n\n{ss.body}"
                return out
            section_body_md = flatten(section, section.depth)

        body_html = md_block_to_html(section_body_md)

        title = clip(f"Last War Season {meta['num']} {meta['name']} guide", 62)
        meta_desc = clip(
            clean_meta(meta["one_line"])
            + " R5 planning tools, coordinates, timelines, and F2P priorities.",
            158,
        )

        page = render_page(
            title=f"{title} | R5TOOLS.IO",
            meta_desc=meta_desc,
            canonical_path=f"/seasons/{meta['id']}.html",
            breadcrumbs=[("Home", "/"), ("Seasons", "/seasons/"), (f"S{meta['num']} {meta['name']}", "")],
            h1=f"Season {meta['num']}: <span class='accent'>{html.escape(meta['name'])}</span>",
            lede=meta["one_line"],
            body_html=body_html,
            related_tools=SEASON_TOOL_CTA,
            keywords=[
                f"Last War Season {meta['num']}",
                meta["name"],
                "LWS Season " + str(meta["num"]),
                "R5 planning",
                "Alliance strategy",
            ],
        )
        write_page("seasons", meta["id"], f"{meta['id']}.html", page, priority=0.85)

    # Seasons hub
    hub_body_md = "\n\n".join(
        f"### [Season {m['num']}: {m['name']}](/seasons/{m['id']}.html)\n\n{m['one_line']}"
        for m in SEASON_META
    )
    hub_body_md = re.sub(
        r"\[Season (\d+): ([^\]]+)\]\(([^)]+)\)",
        r"[Season \1: \2](\3)",
        hub_body_md,
    )
    hub_html = render_page(
        title="Last War Survival — every season, one guide index | R5TOOLS.IO",
        meta_desc="Every Last War: Survival season (Crimson Plague, Polar Storm, Golden Kingdom, Evernight Isle, Wild West, Shadow Rainforest, S7) — mechanics, timelines, and R5 planning tools.",
        canonical_path="/seasons/",
        breadcrumbs=[("Home", "/"), ("Seasons", "")],
        h1="Last War Survival <span class='accent'>seasons index</span>",
        lede="Every LWS season with full mechanics, timelines, and links to the r5tools.io planning tools that solve each season's blockers.",
        body_html=md_block_to_html(hub_body_md),
        related_tools=SEASON_TOOL_CTA,
    )
    (OUTPUT_DIRS["seasons"] / "index.html").write_text(hub_html, encoding="utf-8")
    generated.append(GeneratedPage("seasons", "index", "/seasons/", priority=0.9))


# ---------- HEROES ---------------------------------------------------------

HERO_DEFS = [
    # (canonical name, type, rarity, one-line lede)
    ("Kimberly", "Tank", "UR", "Season 1 Tank UR — AoE Energy-damage carry, the 2026 meta anchor for Tank rally comps."),
    ("Murphy",   "Tank", "UR", "F2P starter UR Tank — frontline anchor, Ironclad Barrier, mandatory for early rally comps."),
    ("Marshall", "Tank", "UR", "The only UR support in LWS — global ATK amplifier used in 4+1 hybrid comps across every type."),
    ("Williams", "Tank", "UR", "Season 4 Tank UR — secondary anchor whose damage reduction only applies from front-center slot."),
    ("Stetmann", "Tank", "UR", "Season 5 Tank UR — sustained EM DPS Tank with strong armor-shred kit."),
    ("DVA",      "Aircraft", "UR", "Season 1 Aircraft UR — single-target burst partner to Kimberly, Awakening Week 3 in Season 6."),
    ("Carlie",   "Aircraft", "UR", "Season 2 Aircraft UR — the only Aircraft-type tank, makes the Aircraft mono formation viable."),
    ("Schuyler", "Aircraft", "UR", "Season 3 Aircraft UR — 18% aircraft-squad CDR passive with stun control."),
    ("Lucius",   "Aircraft", "UR", "Season 4 Aircraft UR — universal-shield defense/support Aircraft."),
    ("Morrison", "Aircraft", "UR", "Season 5 Aircraft UR — armor-shred single-target Aircraft DPS."),
    ("Tesla",    "Missile", "UR", "Season 1 Missile UR — back-row Energy DPS; Awakening turns her SS-tier via Vortex Resonance chain lightning."),
    ("Swift",    "Missile", "UR", "Season 2 Missile UR — finisher against low-HP targets."),
    ("McGregor", "Missile", "UR", "Season 3 Missile UR — Missile taunt/frontline, protects backline via targeting pull."),
    ("Adam",     "Missile", "UR", "Season 4 Missile UR — counter-attack Missile defender."),
    ("Fiona",    "Missile", "UR", "Season 5 Missile UR — the cornerstone of the Missile squad, multi-target cluster attacks."),
    ("Mason",    "Tank", "SSR", "Season 1 SSR→UR promotion Tank — the most-recommended F2P promotion, shards farm at Normal Stage 4-3."),
    ("Violet",   "Tank", "SSR", "Season 2 SSR→UR promotion Tank — conditional promotion; only worth it if she's in your active squad."),
    ("Scarlett", "Tank", "SSR", "Season 3 SSR→UR promotion Tank — skip unless you specifically need her Season 3 comp."),
    ("Sarah",    "Aircraft", "SSR", "Season 4 SSR→UR promotion Aircraft — situational promotion for S4 comps only."),
    ("Venom",    "Missile", "SSR", "Season 5 SSR→UR promotion Missile (weeks 3–7 only) — poison DPS, community consensus skip."),
    ("Braz",     "Aircraft", "SSR", "Season 6 SSR→UR promotion Aircraft — situational rocket DPS."),
    ("Cage",     "Aircraft", "SSR", "SSR Aircraft — +40 DEF short-cooldown defensive skill."),
    ("Elsa",     "Missile", "SSR", "SSR Missile — –18% damage from monsters, useful for zombie modes."),
    ("Maxwell",  "Aircraft", "SSR", "SSR Aircraft — front-row burst DPS."),
    ("Monica",   "Tank", "SSR", "SSR Tank — energy support kit."),
    ("Richard",  "Tank", "SSR", "SSR Tank — dual-rocket attack kit."),
    ("Farhad",   "Tank", "SSR", "SSR Tank — mid-tier bulk pick."),
    ("Loki",     "Tank", "SR",  "SR Tank — shotgun burst kit, strongest of the SR pool."),
    ("Gump",     "Tank", "SR",  "SR Tank — pyro AoE, cheap filler damage dealer."),
    ("Ambolt",   "Aircraft", "SR", "SR Aircraft — first Aircraft hero most accounts touch; missile-AoE kit."),
    ("Kane",     "Missile", "SR", "SR Missile — grenade single-target."),
]


def find_hero_section(kb: Dict[str, KBSection], name: str) -> Optional[KBSection]:
    root = kb.get("02-heroes")
    if not root:
        return None
    # Look for a section whose title contains the hero name.
    for s in root.walk():
        if re.search(rf"\b{re.escape(name)}\b", s.title, flags=re.IGNORECASE):
            return s
    return None


def extract_hero_mentions(kb: Dict[str, KBSection], name: str) -> str:
    """Fallback: gather every paragraph in 02-heroes.md that mentions the hero name."""
    root = kb.get("02-heroes")
    if not root:
        return ""
    hits: List[str] = []
    pattern = re.compile(rf"\b{re.escape(name)}\b", flags=re.IGNORECASE)
    for s in root.walk():
        # split body into paragraphs
        for para in re.split(r"\n{2,}", s.body):
            if pattern.search(para) and len(para.strip()) > 40:
                hits.append(para.strip())
    # dedup + cap
    seen = set()
    out = []
    for p in hits:
        key = p[:120]
        if key in seen:
            continue
        seen.add(key)
        out.append(p)
        if len(out) >= 12:
            break
    return "\n\n".join(out)


def gen_heroes(kb: Dict[str, KBSection]) -> None:
    seen_slugs = set()
    for name, htype, rarity, lede in HERO_DEFS:
        slug = slugify(name)
        if slug in seen_slugs:
            continue
        seen_slugs.add(slug)

        section = find_hero_section(kb, name)
        body_md = ""
        if section and section.body.strip():
            body_md = section.body
            for sub in section.subsections:
                body_md += f"\n\n### {sub.title}\n\n{sub.body}"
        # Always append mentions across the heroes article for context
        mentions = extract_hero_mentions(kb, name)
        if mentions:
            body_md += "\n\n## In the meta (2026 sourced excerpts)\n\n" + mentions

        if not body_md.strip():
            kb_gaps.append(f"hero {name}: no dedicated section or matched paragraphs in 02-heroes.md")
            body_md = f"*{name} is documented in the R5TOOLS.IO Knowledge Base but a dedicated section is pending. Please check back or open a feedback ticket.*"

        # Append hero stat block
        stat_md = (
            f"\n\n## Quick facts\n\n"
            f"- **Type:** {htype}\n"
            f"- **Rarity:** {rarity}\n"
            f"- **Squad slot preference:** {'front row' if htype == 'Tank' else 'back row'}\n"
            f"- **Recommended:** see F2P investment priority table in the [Heroes hub](/heroes/).\n"
        )

        body_html = md_block_to_html(body_md + stat_md)

        title = clip(f"{name} — Last War hero build ({rarity} {htype})", 62)
        meta_desc = clip(
            f"{name} in Last War: Survival — {lede} Skills, best pairings, F2P priority.",
            158,
        )

        page = render_page(
            title=f"{title} | R5TOOLS.IO",
            meta_desc=meta_desc,
            canonical_path=f"/heroes/{slug}.html",
            breadcrumbs=[("Home", "/"), ("Heroes", "/heroes/"), (name, "")],
            h1=f"{html.escape(name)} — <span class='accent'>{rarity} {htype}</span>",
            lede=lede,
            body_html=body_html,
            related_tools=[
                ("Hive Planner", "https://hive.r5tools.io/"),
                ("Roster Extractor", "https://roster.r5tools.io/"),
                ("Season Timeline", "https://bullochman.github.io/lws-season-timeline-static/"),
            ],
            keywords=[name, "Last War hero", "LWS", rarity, htype, "hero build", "hero guide"],
        )
        write_page("heroes", slug, f"{slug}.html", page, priority=0.75)

    # Hero hub
    hub_md = "## All heroes\n\n"
    by_tier = {"UR": [], "SSR": [], "SR": []}
    for name, htype, rarity, lede in HERO_DEFS:
        by_tier[rarity].append((name, htype, lede))
    for tier in ("UR", "SSR", "SR"):
        hub_md += f"\n### {tier} heroes\n\n"
        for name, htype, lede in by_tier[tier]:
            hub_md += f"- [**{name}**](/heroes/{slugify(name)}.html) — {htype}. {lede}\n"

    hub_html = render_page(
        title="Every Last War hero — builds, tiers, F2P priority | R5TOOLS.IO",
        meta_desc="Every UR, SSR, and SR hero in Last War: Survival with skills, formations, and F2P priority ranking. Kimberly, DVA, Tesla, Marshall, Mason, and more.",
        canonical_path="/heroes/",
        breadcrumbs=[("Home", "/"), ("Heroes", "")],
        h1="Last War Survival <span class='accent'>hero index</span>",
        lede="Every UR, SSR, and SR hero in Last War: Survival — sourced from the R5TOOLS.IO Knowledge Base with 2026 meta rankings.",
        body_html=md_block_to_html(hub_md),
        related_tools=[
            ("Roster Extractor", "https://roster.r5tools.io/"),
            ("Hive Planner", "https://hive.r5tools.io/"),
        ],
    )
    (OUTPUT_DIRS["heroes"] / "index.html").write_text(hub_html, encoding="utf-8")
    generated.append(GeneratedPage("heroes", "index", "/heroes/", priority=0.85))


# ---------- BUILDINGS ------------------------------------------------------

BUILDING_DEFS = [
    ("Headquarters (HQ)", "headquarters", "The master gate — every other building's level cap is set by HQ."),
    ("Barracks", "barracks", "Trains Warrior/Infantry troops. HQ-gated T-tier troop unlock."),
    ("Tank Center", "tank-center", "Trains Tank troops. Gates Wall of Honor unlock for Tank heroes at Lv.20."),
    ("Missile Center", "missile-center", "Trains Missile Vehicles. Gates Wall of Honor for Missile heroes at Lv.20."),
    ("Aircraft Center", "aircraft-center", "Trains Aircraft troops. Gates Wall of Honor for Aircraft heroes at Lv.20."),
    ("Drill Grounds", "drill-grounds", "Trained-troop holding capacity — bigger drill = bigger march."),
    ("Hospital", "hospital", "Heals wounded troops. Overflow goes to Emergency Center at HQ 22+."),
    ("Emergency Center (ICU)", "emergency-center", "HQ 22 unlock — catches severely-wounded from Hospital overflow."),
    ("Tech Center", "tech-center", "Runs the research queue. Second Tech Center unlocks dual research queue."),
    ("Alliance Center", "alliance-center", "Controls alliance join capacity, Help cap, and hosts garrison troops."),
    ("Wall / Barrier", "wall", "Base HP defense stat. Upgraded via wall repair kits + build points."),
    ("Radar Vehicle", "radar", "Generates daily radar missions — the daily-quest backbone."),
    ("Farm", "farm", "Produces Food (식량). Critical resource for troop training."),
    ("Iron Mine", "iron-mine", "Produces Iron (철). Second-most-consumed base resource."),
    ("Gold Mine / Coin Mint", "gold-mine", "Produces Coins. Distinct from Gold Vault (storage)."),
    ("Alliance Furnace", "alliance-furnace", "Season 2 — alliance-scale heat source. Radius scales L1 (5 tiles) to L20 (10 tiles)."),
    ("Home Heating Furnace", "home-heating-furnace", "Season 2 — individual furnace. L30 burns ~240 coal/min normal, ~960 coal/min overdrive."),
    ("Warlord Tower", "warlord-tower", "Season 2 — launches Warlord Missile from the R4 Warlord slot. 25×25 blast (S2) / 35×35 (S3)."),
    ("Alliance Center Hive (S3)", "alliance-center-hive-s3", "Season 3 — 5×5 AC compound with sandworm-range defense."),
    ("Alliance Center Hive (S4)", "alliance-center-hive-s4", "Season 4 — 11×11 AC compound with 3 secondary buildings, min 11-tile spacing between hives."),
    ("Lighthouse (S4)", "lighthouse", "Season 4 — brightness levels power Blood Night mitigation."),
    ("Divine Tree (S4)", "divine-tree", "Season 4 — supports Lighthouse in Blood Night defense."),
    ("Bank (S5)", "bank", "Season 5 — capacity 4→12 members, unlocks L1-6 W1 / L7-10 W4. High Noon 15k/day cap."),
    ("Trade Train (S5)", "trade-train", "Season 5 — cross-server trade route with alliance safe-time windows."),
    ("Altars (S6)", "altars", "Season 6 — 5 altars (Cobra/Echo/Gust/Feather/Treehaven) contested Tuesdays only, max 3 held per faction."),
    ("Missile Silo (S6)", "missile-silo", "Season 6 — corner-pattern attack pattern from community consensus."),
    ("Stronghold", "stronghold", "General-purpose 21×21 corner-first defensive formation used across S1/S2/S5/S6/S7."),
    ("MG (Machine Gun) Nest", "machine-gun-nest", "Individual member 3×3 defensive slot; used in every hive-grid layout."),
]


def gen_buildings(kb: Dict[str, KBSection]) -> None:
    root = kb.get("03-chief")
    for name, slug, lede in BUILDING_DEFS:
        body_paras: List[str] = []
        # Search across chief + season files for mentions
        for kb_key in ("03-chief", "06-season-2-frozen", "07-future-seasons", "10-economy", "08-alliance-systems"):
            node = kb.get(kb_key)
            if not node:
                continue
            pat = re.compile(rf"\b{re.escape(name.split(' (')[0])}\b", flags=re.IGNORECASE)
            for s in node.walk():
                for para in re.split(r"\n{2,}", s.body):
                    if pat.search(para) and len(para.strip()) > 40:
                        body_paras.append(para.strip())
        # dedup
        seen = set()
        uniq = []
        for p in body_paras:
            key = p[:150]
            if key in seen:
                continue
            seen.add(key)
            uniq.append(p)
            if len(uniq) >= 14:
                break
        if not uniq:
            kb_gaps.append(f"building {name}: no matching paragraphs in chief/season/economy KB")
            body_md = f"*{name} is documented in the Knowledge Base but a dedicated section is pending.*"
        else:
            body_md = "\n\n".join(uniq)

        body_html = md_block_to_html(body_md)
        title = clip(f"{name} — Last War building guide", 62)
        meta_desc = clip(f"{name} in Last War: Survival. {lede}", 158)

        page = render_page(
            title=f"{title} | R5TOOLS.IO",
            meta_desc=meta_desc,
            canonical_path=f"/buildings/{slug}.html",
            breadcrumbs=[("Home", "/"), ("Buildings", "/buildings/"), (name, "")],
            h1=f"{html.escape(name)}",
            lede=lede,
            body_html=body_html,
            related_tools=[
                ("Hive Planner", "https://hive.r5tools.io/"),
                ("Coal Burn", "https://bullochman.github.io/lws-coal-burn-static/"),
                ("Landing Planner", "https://bullochman.github.io/lws-landing-planner-static/"),
            ],
            keywords=[name, "Last War building", "LWS Chief guide", "R5 planning"],
        )
        write_page("buildings", slug, f"{slug}.html", page, priority=0.7)

    # Buildings hub
    hub_md = "## Every base building\n\n" + "\n".join(
        f"- [**{n}**](/buildings/{s}.html) — {l}" for n, s, l in BUILDING_DEFS
    )
    hub_html = render_page(
        title="Last War buildings — every base building explained | R5TOOLS.IO",
        meta_desc="Every building in Last War: Survival — HQ, troop centers, Alliance Furnace, Warlord Tower, Bank, Altars. Level caps, HQ gates, and R5 priorities.",
        canonical_path="/buildings/",
        breadcrumbs=[("Home", "/"), ("Buildings", "")],
        h1="Last War Survival <span class='accent'>base buildings</span>",
        lede="Every base building in Last War: Survival — HQ gates, resource producers, troop centers, and season-specific structures.",
        body_html=md_block_to_html(hub_md),
    )
    (OUTPUT_DIRS["buildings"] / "index.html").write_text(hub_html, encoding="utf-8")
    generated.append(GeneratedPage("buildings", "index", "/buildings/", priority=0.85))


# ---------- EVENTS --------------------------------------------------------

EVENT_DEFS = [
    ("Arms Race", "arms-race", "The daily backbone — 5 daily-rotating task-router chests worth ~50% of daily reward income."),
    ("Alliance Duel VS", "alliance-duel-vs", "The weekly backbone — 6-day scored VS-Day event with alliance vs alliance matchmaking above top-32 warzone gate."),
    ("VS Days", "vs-days", "Weekly Alliance Duel VS competition — the phase-stack optimizer's target."),
    ("KvK", "kvk", "Cross-server war — LWS ships this as Cross-Server War Rally, not the traditional KvK."),
    ("Zombie Siege", "zombie-siege", "Coop zombie wave defense — L1 base wave, harder tiers per season."),
    ("Zombie Invasion", "zombie-invasion", "Bi-weekly world-boss farm."),
    ("Zombie Rush", "zombie-rush", "5v5 team boss battle, bi-weekly Sundays."),
    ("Zombie Cataclysm", "zombie-cataclysm", "Alternate name/mode of the Sunday 5v5 team boss battle."),
    ("Doomsday", "doomsday", "Bi-weekly Sunday Doom Walker rush — Season 1 flagship event still present in later seasons."),
    ("Ghost Ops", "ghost-ops", "Thursday hero-shard hunt event."),
    ("Desert Storm Battlefield", "desert-storm-battlefield", "Friday 30-minute PvP — 15 buildings capturable per side."),
    ("Winter Storm Battlefield", "winter-storm-battlefield", "5v5 arena mode with a new 2026 point-based reward system."),
    ("Alliance Exercise", "alliance-exercise", "30-minute alliance tank rally — the entry-level rally practice."),
    ("General's Trial", "generals-trial", "4-day bi-weekly single-squad-power PvE gauntlet."),
    ("Frontline Breakthrough", "frontline-breakthrough", "5-level Sunday roguelike PvE."),
    ("Wanted Bosses", "wanted-bosses", "Weekly Codes 39/64/87 rotation — hero-type-buffed boss damage race."),
    ("Bounty Hunter", "bounty-hunter", "Bullet-shooting redemption event."),
    ("Glittering Market", "glittering-market", "Hot Deal cycle — approximately monthly, 6-day windows."),
    ("Meteorite Iron War", "meteorite-iron-war", "Off-season cross-server PvP over meteorite iron."),
    ("Sky Battlefront", "sky-battlefront", "Off-season alliance airship war — 7-day event."),
    ("Rare Soil War", "rare-soil-war", "Season 2 flagship faction war — blizzard-and-plunder mechanic."),
    ("Spice Wars", "spice-wars", "Season 3 flagship — 100–600/hr spice per city, 30% steal cap, Wed/Sat war days weeks 4–8."),
    ("Copper Wars", "copper-wars", "Season 4 flagship — 8-round 15% cap, Wed/Sat weeks 4–7."),
    ("High Noon", "high-noon", "Season 5 Bank event — 15k/day cap, Wed/Sat war days."),
    ("Altar Conquest", "altar-conquest", "Season 6 Tuesday altar contest — max 3 held per faction, 100% capture required."),
    ("Alliance Duel Warm-up Match", "alliance-duel-warm-up", "New 2026-07 pre-league match variant — practice vs matchmaking."),
    ("Alliance Duel League Match", "alliance-duel-league", "Scored competitive Alliance Duel with matchmaking above top-32 warzone gate."),
    ("Top Commander Sprint", "top-commander", "One-time server-launch 7-day sprint."),
    ("Strongest Commander", "strongest-commander", "Server-launch celebration event, top-commander companion."),
    ("Anniversary Celebration", "anniversary", "Yearly celebration cycle with retention rewards and returning-hero banners."),
    ("New Year Celebration", "new-year", "Recurring seasonal celebration event stack."),
    ("Storm Arena", "storm-arena", "Arena ecosystem — Apex Arena / 3v3 Brawl companion mode."),
    ("Apex Arena", "apex-arena", "Top-tier arena ladder for individual chiefs."),
    ("3v3 Brawl", "3v3-brawl", "3-squad arena mode within the Storm Arena ecosystem."),
    ("Ministry Assignments", "ministry-assignments", "Season 1 President-appointed cabinet slots — Ministry buffs matter across every mode."),
    ("Capital War", "capital-war", "Season 1 flagship — Capitol Conquest chooses the President who assigns Ministries."),
    ("Capitol Conquest", "capitol-conquest", "Alternate name for Capital War — Season 1 finale."),
    ("Season Battle Pass", "season-battle-pass", "Recurring per-season battle pass — hero-shard milestone track."),
    ("Growth Pass", "growth-pass", "Recurring general-progression battle pass — daily/weekly resource + shard track."),
    ("Awakening Battle Pass", "awakening-battle-pass", "Season 6 hero-Awakening battle pass — ~70 shards per awakening week."),
    ("Exclusive Weapon Battle Pass", "exclusive-weapon-pass", "Seasons 1–5 — ~50 EW shards per pass, unlock-in-window."),
]


def gen_events(kb: Dict[str, KBSection]) -> None:
    events_root = kb.get("09-events")
    for name, slug, lede in EVENT_DEFS:
        body_paras: List[str] = []
        # Search 09-events, 08-alliance-systems, and 05-06-07 seasonal files
        base_name = name.split(" (")[0]
        # Use loose pattern — first significant word or two of the name
        first_two = " ".join(base_name.split()[:2])
        pat = re.compile(rf"\b{re.escape(first_two)}\b", flags=re.IGNORECASE)
        for kb_key in ("09-events", "08-alliance-systems", "05-season-1-crimson-plague",
                       "06-season-2-frozen", "07-future-seasons"):
            node = kb.get(kb_key)
            if not node:
                continue
            for s in node.walk():
                if pat.search(s.title):
                    body_paras.append(f"## {s.title}\n\n{s.body}")
                    for sub in s.subsections:
                        body_paras.append(f"### {sub.title}\n\n{sub.body}")
                for para in re.split(r"\n{2,}", s.body):
                    if pat.search(para) and len(para.strip()) > 60:
                        body_paras.append(para.strip())
        # dedup
        seen = set()
        uniq = []
        for p in body_paras:
            key = p[:200]
            if key in seen:
                continue
            seen.add(key)
            uniq.append(p)
            if len(uniq) >= 10:
                break
        if not uniq:
            kb_gaps.append(f"event {name}: no matching paragraphs in events/alliance/season KB")
            body_md = f"*{name} is tracked in the Knowledge Base but a dedicated section is pending. See the weekly recurring schedule for context.*"
        else:
            body_md = "\n\n".join(uniq)

        body_html = md_block_to_html(body_md)
        title = clip(f"{name} — Last War event guide", 62)
        meta_desc = clip(f"{name} in Last War: Survival. {lede}", 158)

        related = [
            ("Season Timeline", "https://bullochman.github.io/lws-season-timeline-static/"),
            ("City Capture", "https://bullochman.github.io/lws-city-capture-static/"),
            ("Landing Planner", "https://bullochman.github.io/lws-landing-planner-static/"),
        ]
        page = render_page(
            title=f"{title} | R5TOOLS.IO",
            meta_desc=meta_desc,
            canonical_path=f"/events/{slug}.html",
            breadcrumbs=[("Home", "/"), ("Events", "/events/"), (name, "")],
            h1=f"{html.escape(name)}",
            lede=lede,
            body_html=body_html,
            related_tools=related,
            keywords=[name, "Last War event", "LWS", "R5 alliance planning"],
        )
        write_page("events", slug, f"{slug}.html", page, priority=0.7)

    # Events hub
    hub_md = "## Every recurring event\n\n" + "\n".join(
        f"- [**{n}**](/events/{s}.html) — {l}" for n, s, l in EVENT_DEFS
    )
    hub_html = render_page(
        title="Last War events — full weekly + seasonal schedule | R5TOOLS.IO",
        meta_desc="Every recurring event in Last War: Survival — Alliance Duel, Rare Soil War, Zombie Siege, Ghost Ops, Doomsday, Wanted Bosses, and more. R5 planning schedule.",
        canonical_path="/events/",
        breadcrumbs=[("Home", "/"), ("Events", "")],
        h1="Last War Survival <span class='accent'>event calendar</span>",
        lede="Every recurring event in LWS — daily, weekly, and per-season — with sources from the R5TOOLS.IO Knowledge Base.",
        body_html=md_block_to_html(hub_md),
    )
    (OUTPUT_DIRS["events"] / "index.html").write_text(hub_html, encoding="utf-8")
    generated.append(GeneratedPage("events", "index", "/events/", priority=0.85))


# ---------- WARZONES ------------------------------------------------------

# LWS has hundreds of warzones. We seed ~120 pages targeting the "warzone-<N>" search pattern
# for warzones known to be active. Each is a lightweight landing that recommends the tools.
WARZONE_IDS = list(range(1001, 1121))  # 120 pages covers the range LWS has publicly numbered as of 2026-07.


def gen_warzones(kb: Dict[str, KBSection]) -> None:
    for wid in WARZONE_IDS:
        slug = f"warzone-{wid}"
        title = clip(f"Warzone {wid} — LWS alliance leaderboard + tools", 62)
        meta_desc = clip(
            f"Warzone {wid} in Last War: Survival — alliance tools, season timeline, roster extractor, and R5 planning for your warzone.",
            158,
        )
        lede = (
            f"Warzone {wid} runs its own Last War: Survival season timeline. Every R5TOOLS.IO "
            f"planner accepts a warzone override — set warzone {wid} once and every tool tracks "
            "your alliance's active season, week, and next milestone."
        )
        body_md = (
            f"## What's active in Warzone {wid}\n\n"
            f"Every LWS warzone runs its own season timeline. Warzone {wid} may be on "
            f"Season 2 Polar Storm, Season 3 Golden Kingdom, or a later cycle — set your warzone "
            f"on the [R5TOOLS.IO landing page](https://r5tools.io/) and every planner reads your "
            f"active season, week, and next milestone from a shared config.\n\n"
            f"## R5 planning quick links (warzone {wid})\n\n"
            f"- [Roster Extractor](https://roster.r5tools.io/?warzone={wid}) — upload an alliance-list "
            f"screen recording and get a CSV + power-over-time chart.\n"
            f"- [Hive Planner](https://hive.r5tools.io/?warzone={wid}) — place your alliance's hive around "
            f"the Alliance Furnace / Machine-Gun grid with the correct S2/S3/S4 formation.\n"
            f"- [Season Timeline](https://bullochman.github.io/lws-season-timeline-static/?warzone={wid}) — "
            f"per-member task checklist for the active season.\n"
            f"- [Landing Planner](https://bullochman.github.io/lws-landing-planner-static/?warzone={wid}) — "
            f"rank-tier ring assignment for landing day.\n"
            f"- [Coal Burn Calculator](https://bullochman.github.io/lws-coal-burn-static/?warzone={wid}) — "
            f"HHF + Alliance Furnace coal budget by week.\n\n"
            f"## Alliance leaderboard (warzone {wid})\n\n"
            f"R5TOOLS.IO does not scrape live warzone leaderboards. Upload your alliance's member list "
            f"to the [Roster Extractor](https://roster.r5tools.io/) to build a private, timestamped "
            f"leaderboard for your alliance's top 100.\n\n"
            f"## Warzone lookup\n\n"
            f"Warzone IDs are the container LWS uses to run cross-server war. Every warzone contains "
            f"~8 servers. When your warzone reaches Cross-Server War Rally, the top-32 warzone gate "
            f"determines Alliance Duel matchmaking above League level.\n"
        )
        body_html = md_block_to_html(body_md)
        page = render_page(
            title=f"{title} | R5TOOLS.IO",
            meta_desc=meta_desc,
            canonical_path=f"/warzones/{slug}.html",
            breadcrumbs=[("Home", "/"), ("Warzones", "/warzones/"), (f"Warzone {wid}", "")],
            h1=f"Warzone <span class='accent'>{wid}</span>",
            lede=lede,
            body_html=body_html,
            related_tools=[
                ("Roster Extractor", f"https://roster.r5tools.io/?warzone={wid}"),
                ("Hive Planner", f"https://hive.r5tools.io/?warzone={wid}"),
                ("Season Timeline", f"https://bullochman.github.io/lws-season-timeline-static/?warzone={wid}"),
            ],
            keywords=[f"warzone {wid}", "Last War warzone", "LWS alliance", "R5 tools"],
        )
        write_page("warzones", slug, f"{slug}.html", page, priority=0.55)

    # Warzone hub
    hub_md = "## Warzone index\n\n"
    hub_md += "R5TOOLS.IO builds a page per public warzone. Click your warzone below or set it "
    hub_md += "once at [r5tools.io](/) and every tool tracks your active season automatically.\n\n"
    # 5-column grid via markdown
    for i in range(0, len(WARZONE_IDS), 10):
        row = WARZONE_IDS[i:i+10]
        hub_md += " · ".join(f"[{w}](/warzones/warzone-{w}.html)" for w in row) + "\n\n"
    hub_html = render_page(
        title="Every LWS warzone — R5 planning tools | R5TOOLS.IO",
        meta_desc="Every Last War: Survival warzone. Set your warzone once and every R5TOOLS.IO planner tracks your active season and week automatically.",
        canonical_path="/warzones/",
        breadcrumbs=[("Home", "/"), ("Warzones", "")],
        h1="Last War Survival <span class='accent'>warzone index</span>",
        lede="Set your warzone once and every R5TOOLS.IO planner tracks the season, week, and next milestone.",
        body_html=md_block_to_html(hub_md),
    )
    (OUTPUT_DIRS["warzones"] / "index.html").write_text(hub_html, encoding="utf-8")
    generated.append(GeneratedPage("warzones", "index", "/warzones/", priority=0.75))


# ---------- GUIDES --------------------------------------------------------

GUIDE_DEFS = [
    # (slug, title, query intent lede, [kb sources to concat])
    ("how-to-plan-season-2-landing",
     "How to plan Season 2 Polar Storm landing",
     "The 20-minute landing plan every R5 runs the night before Season 2 opens — Alliance Furnace radius, ring assignments, freeze-risk sweep, and the mistakes that lose the day.",
     ["06-season-2-frozen", "08-alliance-systems"]),
    ("rare-soil-war-strategy",
     "Rare Soil War strategy — the S2 blizzard-and-plunder guide",
     "Rare Soil War is the Season 2 flagship faction war. Force asymmetry, combat duration, plunder rules, and the R5 pre-declaration checklist.",
     ["09-events", "06-season-2-frozen"]),
    ("coal-budget-calculator-guide",
     "Coal budget calculator — how much coal do I actually need?",
     "The full coal math for Season 2 — Home Heating Furnace L30 vs Alliance Furnace L20, overdrive windows, and the 117k number that surprises every R5.",
     ["06-season-2-frozen", "10-economy"]),
    ("hive-formation-guide",
     "Hive formation guide — MG grid, Stronghold, Megahive",
     "Every hive shape used in LWS — MG 3×3 grid, Stronghold 21×21, S3 5×5 AC hive, S4 11×11 compound, S6 8-ring megahive with faction pact.",
     ["08-alliance-systems", "04-squads-combat", "07-future-seasons"]),
    ("roster-management-tips",
     "Alliance roster management — rank rules, R4 titles, kick rules",
     "How R5s actually run rosters — R4 title assignments, HQ minimums, dead-account kicks, and the roster-extractor workflow that replaces the daily screenshot.",
     ["08-alliance-systems"]),
    ("alliance-duel-optimization",
     "Alliance Duel optimization — the VS Day phase-stack playbook",
     "The 6-day Alliance Duel VS scoring math — per-day phase weights, warzone top-32 gate, and how to phase-stack for the League Match.",
     ["09-events", "08-alliance-systems"]),
    ("vs-days-schedule",
     "VS Days schedule — LWS Alliance Duel weekly calendar",
     "The full VS Days weekly schedule — daily phase, primary scoring event, and how to plan spending and troop training around each phase.",
     ["09-events"]),
    ("kimberly-build-guide",
     "Kimberly build guide — Awakening, Barrage Strike, meta comp",
     "Every 2026 Kimberly build — Awakening Priceless Resolve, Barrage Strike II→III, Wall of Honor +0.50% Attack, and where to slot her in the meta rally comp.",
     ["02-heroes"]),
    ("mason-ssr-to-ur-promotion",
     "Mason SSR→UR promotion — is it worth it?",
     "The Mason promotion math — 975 SSR + 1,600 UR shards, medal refund, farm sources at Normal 4-3, and why he's the only universally-endorsed promotion.",
     ["02-heroes"]),
    ("wall-of-honor-guide",
     "Wall of Honor guide — the best long-term F2P system",
     "Wall of Honor is the extra-shards-keep-helping system. Unlock requirements, per-hero bonuses, promotion refund rules, and F2P shard-dump discipline.",
     ["02-heroes"]),
    ("f2p-hero-priority",
     "F2P hero priority — who to build first in Last War",
     "The Wardawgg/Packsify/LDShop 2026 F2P priority order — Kimberly → Marshall → DVA → Murphy → Mason, and why to squad-focus one comp before spreading.",
     ["02-heroes"]),
    ("meta-squad-2026",
     "2026 meta squad — Williams / Kimberly / DVA / Schuyler / Marshall",
     "The 2026 competitive rally comp — front-center Williams positioning, aircraft-pair burst window, Schuyler 18% CDR, and Marshall global ATK amplifier.",
     ["02-heroes"]),
    ("warlord-missile-guide",
     "Warlord Missile guide — S2 25×25, S3 35×35",
     "Everything about the Warlord Missile — S2 25×25 blast, S3 35×35 upgrade, 3-minute intercept window, and the 10-tile Furnace clearance rule.",
     ["06-season-2-frozen", "07-future-seasons", "08-alliance-systems"]),
    ("alliance-furnace-guide",
     "Alliance Furnace guide — coal budget, radius, overdrive",
     "The Alliance Furnace covers the alliance heat zone. L1 vs L20 radius, coal burn rates, overdrive activation, and how to sequence upgrades.",
     ["06-season-2-frozen"]),
    ("home-heating-furnace-guide",
     "Home Heating Furnace guide — HHF L30 coal math",
     "HHF L30 burns ~240 coal/min normal and ~960 coal/min overdrive. Full stockpile math for 3-hour overdrive windows and blizzard weeks.",
     ["06-season-2-frozen", "10-economy"]),
    ("freeze-risk-warning-dashboard",
     "Freeze risk warning dashboard — the S2 R5 morning checklist",
     "The morning-of-blizzard freeze-risk sweep — ambient bands, threshold temps, per-member coal cushion, and how to auto-alert Discord.",
     ["06-season-2-frozen"]),
    ("blood-night-strategy-s4",
     "Blood Night strategy — Season 4 defense in 3 windows",
     "Blood Night rotates 3 daily windows (02:30 / 10:30 / 18:30). Lighthouse power, Divine Tree support, Stage-3 +500 durability warning.",
     ["07-future-seasons"]),
    ("spice-wars-planner-s3",
     "Spice Wars planner — Season 3 city capture schedule",
     "Spice Wars runs Wed/Sat weeks 4–8. City spice-per-hour tables (100-600), 30% steal cap, sandworm-range risk, and Wk3.D6 Pyramid War prep.",
     ["07-future-seasons"]),
    ("copper-wars-planner-s4",
     "Copper Wars planner — Season 4 8-round 15% cap",
     "Copper Wars is 8 rounds of 15% per-round steal cap. Round schedule, city copper income, and dig-stronghold priority.",
     ["07-future-seasons"]),
    ("bank-planner-s5",
     "Bank planner — Season 5 High Noon 15k/day cap",
     "Season 5 Banks cap 4→12 members. L1-6 unlock Wk1, L7-10 unlock Wk4. High Noon 15k/day cap, 5-day terms, Alliance Safe Time windows.",
     ["07-future-seasons"]),
    ("altar-conquest-planner-s6",
     "Altar conquest planner — Season 6 Tuesday altars",
     "Season 6 has 5 altars (Cobra/Echo/Gust/Feather/Treehaven). Tuesday-only contests, max 3 held per faction, 100% capture required, 20-min Sanctuary.",
     ["07-future-seasons"]),
    ("hero-awakening-schedule",
     "Hero Awakening schedule — S6 Week 1/3/5 rotation",
     "The Season 6 Awakening rollout — Kimberly Week 1 (Priceless Resolve), DVA Week 3 (Starred Ace), Tesla Week 5/6 (Vortex Resonance chain lightning).",
     ["02-heroes", "07-future-seasons"]),
    ("chief-gear-guide",
     "Chief gear guide — 4 slots + mythic + weapon aura",
     "The chief gear system — 4 slots, mythic tier, deterministic (tier, level, star, weapon-aura), and the substats/gear-set-bonus questions the KB confirmed are absent.",
     ["03-chief"]),
    ("vip-level-roi",
     "VIP level ROI — 1 through 18 point thresholds",
     "The VIP 1-18 point system, 2026 monetization overhaul, pop-up removal, and where VIP thresholds actually pay off vs where they're a trap.",
     ["11-monetization", "03-chief"]),
    ("legendary-recruitment-strategy",
     "Legendary Recruitment strategy — 1% UR / 0.14% single-hero",
     "The Advanced/Legendary Recruitment math — 1% pool UR rate but only ~0.14% for a specific rate-up hero. The 100-ticket stockpile rule and when to fire.",
     ["02-heroes", "11-monetization"]),
    ("hero-recruitment-ticket-guide",
     "Hero Recruitment ticket guide — basic, elite, premium, legendary",
     "Every recruit ticket type in LWS — pull rates, when to spend, when to hoard, and the F2P discipline that separates 5★ Kimberly at month 6 from month 12.",
     ["02-heroes"]),
    ("t11-troops-guide",
     "T11 troops guide — when to unlock, cost, timing",
     "T11 troop unlock — HQ prereqs, tech-tree cost, per-troop-type training time, and whether the T11 power jump justifies the delay past T10.",
     ["04-squads-combat"]),
    ("type-counter-triangle",
     "Type counter triangle — Tank / Aircraft / Missile",
     "The rock-paper-scissors backbone of LWS combat — Tank > Missile, Missile > Aircraft, Aircraft > Tank at ±20%. Rally counter-planning by type.",
     ["02-heroes", "04-squads-combat"]),
    ("squad-formation-bonus",
     "Squad formation bonus — mono-type +20%, 4+1 Marshall hybrid",
     "The formation math — pure mono-type +20% primary stats, 4+1 Marshall hybrid retains ~35% of the bonus, mixed 3-2 gets zero.",
     ["02-heroes", "04-squads-combat"]),
    ("arms-race-daily-guide",
     "Arms Race daily guide — 5-task rotation, task router",
     "Arms Race is the daily backbone — ~50% of daily income. Task rotation, radar priority, and the F2P task-router that never misses a milestone chest.",
     ["09-events"]),
    ("ghost-ops-thursday-guide",
     "Ghost Ops guide — Thursday hero shard hunt",
     "Ghost Ops is the Thursday hero-shard event. Wave rules, per-hero rate-up, and how to time your ticket burn.",
     ["09-events"]),
    ("desert-storm-friday-guide",
     "Desert Storm Battlefield — Friday 30-min PvP",
     "Desert Storm runs 30 minutes every Friday. 15 buildings, per-building point values, and the R4 hunting-pack tactic that farms both points and kills.",
     ["09-events"]),
    ("doomsday-sunday-guide",
     "Doomsday guide — the Sunday Doom Walker rush",
     "Doomsday is the bi-weekly Sunday Doom Walker rush. Wave prep, ministry buffs, and how to coordinate the pull-and-kite pattern.",
     ["09-events", "05-season-1-crimson-plague"]),
    ("wanted-bosses-codes-guide",
     "Wanted Bosses guide — Codes 39, 64, 87 rotation",
     "The Wanted Bosses weekly rotation — Codes 39/64/87 hero-type-buffed damage races. Mon-Sat schedule and the per-boss ideal comp.",
     ["09-events"]),
    ("age-of-oil-runway",
     "Age of Oil runway — HQ 35, Season 1 late-game",
     "The Age of Oil extension pushed HQ to 35 and hero cap to 175. Full runway, tech tree, and the F2P hold-your-speedups bank.",
     ["12-progression", "05-season-1-crimson-plague"]),
    ("season-battle-pass-guide",
     "Season Battle Pass guide — free vs advanced vs premium tiers",
     "The Season Battle Pass tiers — free / advanced / premium — with hero-shard milestone tracks and which tier actually pays back the $20.",
     ["11-monetization", "02-heroes"]),
    ("f2p-officer-progression",
     "F2P officer progression — the 12-month roadmap",
     "The F2P R4 officer roadmap — HQ pacing, hero priority, blueprint discipline, ticket hoarding, and the season-goal checkpoints.",
     ["12-progression", "11-monetization"]),
    ("cross-server-war-rally",
     "Cross-Server War Rally — what LWS actually calls KvK",
     "The KvK/Cross-Server War Rally guide — warzone matchmaking, top-32 gate, and per-server declaration windows.",
     ["09-events", "13-meta-competitive"]),
    ("season-transitions-celebration-week",
     "Season transitions — Celebration Week checklist",
     "The 2-week Celebration Week between seasons — Black Market shard dump, VS Day banking, roster pruning, and the S-next lookahead.",
     ["09-events", "12-progression"]),
    ("wounded-vs-killed-vs-fainted",
     "Wounded vs killed vs fainted — LWS troop-loss rules",
     "The LWS troop-loss cascade — wounded goes to Hospital, overflow goes to ICU/Emergency Center at HQ 22, and killed is only the final overflow.",
     ["04-squads-combat", "03-chief"]),
    ("alliance-help-efficiency",
     "Alliance Help efficiency — 10/50/100/200/300 tier ladder",
     "The Alliance Help daily ladder is 10/50/100/200/300 tiers. Why ≥300/day is the source-backed floor and how to enforce it on lazy R1s.",
     ["08-alliance-systems"]),
    ("total-power-composition",
     "Total power composition — where does 100M actually come from?",
     "Total power breakdown — troops, buildings, heroes, gear, research, chief skills, and Wall of Honor. Which levers actually move the number.",
     ["12-progression", "03-chief"]),
    ("season-1-corruptor-bosses-guide",
     "Season 1 Corruptor Bosses — virus mechanics",
     "Season 1 Corruptor Bosses and virus stacks — SAFE 0-40 / DANGER 41-70 / IMMINENT 71-99 / DOOMED 100, per-member 'Doomed in' formula.",
     ["05-season-1-crimson-plague"]),
    ("season-1-antivirus-guide",
     "Season 1 antivirus — consumption rate, Wall of Honor refund",
     "Antivirus consumption rate, per-member stockpile targets, and the Wall of Honor refund rules for Season 1.",
     ["05-season-1-crimson-plague"]),
    ("s6-shadow-rainforest-faction-pick",
     "S6 Shadow Rainforest faction pick — Deepwood vs Wetland",
     "The Season 6 faction pick is permanent for the season. Deepwood/Wetland/Great River tradeoffs, permanent City Destruction risk, and the 4v4 matchup math.",
     ["07-future-seasons"]),
    ("s7-unnamed-leaks",
     "Season 7 leaks — August 2026 launch tracker",
     "Every S7 leak we've tracked — YouTube signals, T12 troop possibility, and what R5s should stockpile during Celebration Week.",
     ["07-future-seasons"]),
    ("coordinates-for-season-2-landing",
     "Season 2 landing coordinates — free by warzone",
     "The coordinate sheet R5s ask for the night before S2 — Alliance Furnace anchor by warzone tier, member spawn radius, and the misplaced-leader alert.",
     ["06-season-2-frozen", "08-alliance-systems"]),
    ("discord-export-png-formatting",
     "Discord export PNG formatting — R5TOOLS.IO share sheets",
     "How R5TOOLS.IO PNG exports embed alliance name, warzone, season week, and coordinates — the same dark-theme framing across every tool.",
     ["08-alliance-systems"]),
]

GUIDE_TOOL_CTA = [
    ("Hive Planner", "https://hive.r5tools.io/"),
    ("Roster Extractor", "https://roster.r5tools.io/"),
    ("Season Timeline", "https://bullochman.github.io/lws-season-timeline-static/"),
    ("Landing Planner", "https://bullochman.github.io/lws-landing-planner-static/"),
    ("Coal Burn", "https://bullochman.github.io/lws-coal-burn-static/"),
    ("Heat Simulator", "https://bullochman.github.io/lws-heat-simulator-static/"),
    ("Freeze Risk", "https://bullochman.github.io/lws-freeze-risk-static/"),
    ("City Capture", "https://bullochman.github.io/lws-city-capture-static/"),
]


def gen_guides(kb: Dict[str, KBSection]) -> None:
    for slug, title_text, lede, kb_files in GUIDE_DEFS:
        # Concat relevant KB paragraphs — use the LEDE's key terms as the search seed.
        # Extract nouny keywords from the title_text to search.
        seeds = [w for w in re.findall(r"[A-Z][a-zA-Z]{3,}|\b\d+\b", title_text) if w.lower() not in {"guide", "planner", "strategy", "the"}]
        if not seeds:
            seeds = [title_text.split()[0]]
        paras: List[str] = []
        for kb_file in kb_files:
            node = kb.get(kb_file)
            if not node:
                continue
            for s in node.walk():
                if any(seed.lower() in s.title.lower() for seed in seeds):
                    paras.append(f"## {s.title}\n\n{s.body}")
                for para in re.split(r"\n{2,}", s.body):
                    hits = sum(1 for seed in seeds if seed.lower() in para.lower())
                    if hits >= 1 and len(para.strip()) > 80:
                        paras.append(para.strip())
        # dedup
        seen = set()
        uniq = []
        for p in paras:
            key = p[:200]
            if key in seen:
                continue
            seen.add(key)
            uniq.append(p)
            if len(uniq) >= 10:
                break
        if not uniq:
            kb_gaps.append(f"guide {slug}: no matching KB paragraphs")
            body_md = f"*{title_text} — content in progress. See related tools below.*"
        else:
            body_md = "\n\n".join(uniq)
        body_html = md_block_to_html(body_md)

        page_title = clip(title_text, 62)
        meta_desc = clip(lede, 158)

        page = render_page(
            title=f"{page_title} | R5TOOLS.IO",
            meta_desc=meta_desc,
            canonical_path=f"/guides/{slug}.html",
            breadcrumbs=[("Home", "/"), ("Guides", "/guides/"), (page_title, "")],
            h1=page_title,
            lede=lede,
            body_html=body_html,
            related_tools=GUIDE_TOOL_CTA,
            keywords=[page_title, "Last War guide", "LWS R5", "alliance strategy"],
            schema_type="Article",
        )
        write_page("guides", slug, f"{slug}.html", page, priority=0.75)

    # Guides hub
    hub_md = "## Every R5TOOLS.IO guide\n\n" + "\n".join(
        f"- [**{t}**](/guides/{s}.html) — {l}" for s, t, l, _ in GUIDE_DEFS
    )
    hub_html = render_page(
        title="Last War R5 guides — every planning topic | R5TOOLS.IO",
        meta_desc="Every R5TOOLS.IO guide — landing coordinates, freeze risk, hive formation, hero builds, event optimization, and season strategy.",
        canonical_path="/guides/",
        breadcrumbs=[("Home", "/"), ("Guides", "")],
        h1="R5TOOLS.IO <span class='accent'>guide index</span>",
        lede="Every planning topic an R5 or R4 opens the night before a season starts.",
        body_html=md_block_to_html(hub_md),
        related_tools=GUIDE_TOOL_CTA,
    )
    (OUTPUT_DIRS["guides"] / "index.html").write_text(hub_html, encoding="utf-8")
    generated.append(GeneratedPage("guides", "index", "/guides/", priority=0.85))


# ---------- GLOSSARY -----------------------------------------------------

def parse_glossary(kb: Dict[str, KBSection]) -> List[Tuple[str, str, str, str, str]]:
    """Return (kr, en, category, notes, block_title) for every glossary row."""
    root = kb.get("15-glossary")
    if not root:
        return []
    out: List[Tuple[str, str, str, str, str]] = []
    for section in root.walk():
        if not section.title.startswith("Block"):
            continue
        block_title = section.title
        for line in section.body.splitlines():
            if not line.startswith("|"):
                continue
            cells = [c.strip() for c in line.strip().strip("|").split("|")]
            if len(cells) < 3:
                continue
            if cells[0].startswith("-") or cells[0].startswith(":") or cells[0].lower() in {"한국어", "korean"}:
                continue
            kr = cells[0]
            en = cells[1] if len(cells) > 1 else ""
            category = cells[2] if len(cells) > 2 else ""
            notes = cells[3] if len(cells) > 3 else ""
            if not en:
                continue
            out.append((kr, en, category, notes, block_title))
    return out


def gen_glossary(kb: Dict[str, KBSection]) -> None:
    entries = parse_glossary(kb)
    seen_slugs = set()
    for kr, en, category, notes, block_title in entries:
        # slug from EN primary label — strip parenthetical clarifiers
        primary_en = re.sub(r"\(.*?\)", "", en).split("/")[0].strip()
        if not primary_en:
            continue
        slug = slugify(primary_en)
        if not slug or slug in seen_slugs:
            continue
        seen_slugs.add(slug)

        title = clip(f"{primary_en} — LWS term ({category})", 62)
        lede = f"{primary_en} in Last War: Survival. {clean_meta(notes)[:180] if notes else 'Community term used across R5 alliance planning.'}"
        body_md = (
            f"## Definition\n\n"
            f"- **English:** {en}\n"
            f"- **한국어 (Korean):** {kr}\n"
            f"- **Category:** {category}\n"
            f"- **Glossary block:** {block_title}\n\n"
        )
        if notes:
            body_md += f"### Notes\n\n{notes}\n\n"
        body_md += (
            "## Where R5s use this term\n\n"
            f"'{primary_en}' shows up across the R5TOOLS.IO planners — check the Season Timeline "
            f"and Roster Extractor to see it in context.\n"
        )

        body_html = md_block_to_html(body_md)
        meta_desc = clip(lede, 158)
        page = render_page(
            title=f"{title} | R5TOOLS.IO",
            meta_desc=meta_desc,
            canonical_path=f"/glossary/{slug}.html",
            breadcrumbs=[("Home", "/"), ("Glossary", "/glossary/"), (primary_en, "")],
            h1=f"{html.escape(primary_en)} <span class='accent'>{html.escape(kr)}</span>",
            lede=lede,
            body_html=body_html,
            related_tools=[
                ("Season Timeline", "https://bullochman.github.io/lws-season-timeline-static/"),
                ("Roster Extractor", "https://roster.r5tools.io/"),
            ],
            keywords=[primary_en, kr, "Last War glossary", "LWS term", "Korean", category],
        )
        write_page("glossary", slug, f"{slug}.html", page, priority=0.6)

    if not entries:
        kb_gaps.append("glossary: parse produced 0 entries — check 15-glossary.md table format")

    # Glossary hub
    grouped: Dict[str, List[Tuple[str, str, str]]] = {}
    for kr, en, category, notes, block_title in entries:
        primary_en = re.sub(r"\(.*?\)", "", en).split("/")[0].strip()
        slug = slugify(primary_en)
        if not slug:
            continue
        grouped.setdefault(block_title, []).append((primary_en, kr, slug))
    hub_md = "## Glossary by block\n\n"
    for block, items in grouped.items():
        hub_md += f"\n### {block}\n\n"
        # dedup within block
        seen = set()
        for primary_en, kr, slug in items:
            if slug in seen:
                continue
            seen.add(slug)
            hub_md += f"- [**{primary_en}**](/glossary/{slug}.html) · {kr}\n"
    hub_html = render_page(
        title="Last War glossary — every KR ↔ EN term | R5TOOLS.IO",
        meta_desc="Every Last War: Survival community term with Korean and English translations — heroes, buildings, ranks, events, and R5 slang.",
        canonical_path="/glossary/",
        breadcrumbs=[("Home", "/"), ("Glossary", "")],
        h1="Last War Survival <span class='accent'>glossary</span>",
        lede="Every Korean ↔ English term used by Last War: Survival alliance leaders.",
        body_html=md_block_to_html(hub_md),
    )
    (OUTPUT_DIRS["glossary"] / "index.html").write_text(hub_html, encoding="utf-8")
    generated.append(GeneratedPage("glossary", "index", "/glossary/", priority=0.8))


# ---------- SITEMAP ------------------------------------------------------

def rebuild_sitemap() -> int:
    """Rewrite sitemap.xml. Returns entry count."""
    core_entries = [
        ("https://r5tools.io/", "weekly", "1.0"),
        ("https://r5tools.io/status.html", "daily", "0.5"),
        ("https://r5tools.io/roadmap.html", "weekly", "0.6"),
        ("https://r5tools.io/leaderboard.html", "weekly", "0.7"),
        ("https://r5tools.io/terms.html", "yearly", "0.3"),
        ("https://r5tools.io/privacy.html", "yearly", "0.3"),
        # Flagship tools
        ("https://roster.r5tools.io/", "weekly", "0.9"),
        ("https://hive.r5tools.io/", "weekly", "0.9"),
        ("https://chat.r5tools.io/", "weekly", "0.8"),
        # S2 static tools
        ("https://bullochman.github.io/lws-season-timeline-static/", "weekly", "0.8"),
        ("https://bullochman.github.io/lws-landing-planner-static/", "weekly", "0.8"),
        ("https://bullochman.github.io/lws-heat-simulator-static/", "weekly", "0.8"),
        ("https://bullochman.github.io/lws-freeze-risk-static/", "weekly", "0.8"),
        ("https://bullochman.github.io/lws-coal-burn-static/", "weekly", "0.8"),
        ("https://bullochman.github.io/lws-city-capture-static/", "weekly", "0.8"),
        ("https://bullochman.github.io/lws-profile-studio-static/", "weekly", "0.7"),
        ("https://bullochman.github.io/lws-vs-days-static/", "weekly", "0.7"),
    ]
    lines = ['<?xml version="1.0" encoding="UTF-8"?>',
             '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
             '  <!-- Landing + core -->']
    for url, freq, pri in core_entries:
        lines += [
            "  <url>",
            f"    <loc>{url}</loc>",
            f"    <changefreq>{freq}</changefreq>",
            f"    <priority>{pri}</priority>",
            "  </url>",
        ]
    lines.append("  <!-- SEO farm — auto-generated by build_seo_pages.py -->")
    # dedup by rel_path
    seen: set = set()
    for pg in sorted(generated, key=lambda x: (x.category, x.slug)):
        if pg.rel_path in seen:
            continue
        seen.add(pg.rel_path)
        lines += [
            "  <url>",
            f"    <loc>{SITE_BASE}{pg.rel_path}</loc>",
            f"    <changefreq>{pg.changefreq}</changefreq>",
            f"    <priority>{pg.priority}</priority>",
            "  </url>",
        ]
    lines.append("</urlset>")
    (REPO_ROOT / "sitemap.xml").write_text("\n".join(lines) + "\n", encoding="utf-8")
    return len(core_entries) + len(seen)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> int:
    print(f"Loading KB from {KB_ROOT}…", flush=True)
    kb = load_kb()
    print(f"  {len(kb)} KB files loaded.", flush=True)

    print("Generating seasons…", flush=True)
    gen_seasons(kb)
    print("Generating heroes…", flush=True)
    gen_heroes(kb)
    print("Generating buildings…", flush=True)
    gen_buildings(kb)
    print("Generating events…", flush=True)
    gen_events(kb)
    print("Generating warzones…", flush=True)
    gen_warzones(kb)
    print("Generating guides…", flush=True)
    gen_guides(kb)
    print("Generating glossary…", flush=True)
    gen_glossary(kb)

    print("Rebuilding sitemap…", flush=True)
    total = rebuild_sitemap()

    print()
    print("=" * 60)
    print(f"Generated {len(generated)} pages across {len(OUTPUT_DIRS)} categories.")
    print(f"Sitemap entries: {total}.")
    by_cat: Dict[str, int] = {}
    for pg in generated:
        by_cat[pg.category] = by_cat.get(pg.category, 0) + 1
    for cat, n in sorted(by_cat.items()):
        print(f"  {cat}: {n} pages")
    if kb_gaps:
        print()
        print(f"KB gaps flagged ({len(kb_gaps)}):")
        for g in kb_gaps[:40]:
            print(f"  - {g}")
        if len(kb_gaps) > 40:
            print(f"  … and {len(kb_gaps) - 40} more")
    return 0


if __name__ == "__main__":
    sys.exit(main())
