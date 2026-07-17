#!/usr/bin/env python3
"""
r5tools blog builder.

Reads Markdown post files (YAML frontmatter + body) from ./posts/, renders
each to /blog/YYYY/MM/<slug>.html on the site, regenerates the blog index,
regenerates the RSS 2.0 feed at /blog/feed.xml, and injects Article JSON-LD
+ OG / Twitter Card meta.

Idempotent — a rebuild with no source-file changes emits no unnecessary
writes (compares rendered output before writing).

USAGE
    python3 build_blog.py                 # build everything
    python3 build_blog.py --post <slug>   # rebuild one post
    python3 build_blog.py --dry-run       # show what would change
    python3 build_blog.py --check         # non-zero exit if any post fails validation

DEPENDENCIES
    Pure Python 3 stdlib. If `markdown` and `PyYAML` are installed we use
    them for higher-fidelity markdown -> HTML and richer frontmatter parsing.
    Otherwise we fall back to a small internal implementation that covers
    the subset r5tools posts actually use (headings, bold, italic, code,
    fenced code, lists, links, blockquotes, tables, horizontal rules).

FRONTMATTER SCHEMA
    ---
    title: "Season 2 week 1 — the coal budget nobody plans for"
    date: 2026-07-18                  # YYYY-MM-DD (post publish date)
    lang: en                          # en | ko | ja | pt | es
    slug: season-2-week-1-coal-budget # optional; derived from filename if absent
    author: "Evan @ r5tools"          # optional; defaults to "Evan @ r5tools"
    description: "One-line dek used for SEO + OG description (150-160 chars)."
    seo_keywords: ["season 2", "coal budget", "lws r5"]
    tags: ["season-2", "coal", "week-1"]
    hero_cta: coal-burn               # optional key from CTA_LINKS below
    canonical: null                   # optional override (defaults to the built URL)
    draft: false                      # if true, skipped by builder
    ---

    Body markdown here.
"""

from __future__ import annotations

import argparse
import datetime as _dt
import hashlib
import html as _html_lib
import json
import os
import re
import sys
import xml.sax.saxutils as _xml
from pathlib import Path

# Optional deps — used if present, fall back to stdlib impl otherwise.
try:  # pragma: no cover
    import yaml  # type: ignore
    _HAS_YAML = True
except ImportError:  # pragma: no cover
    _HAS_YAML = False

try:  # pragma: no cover
    import markdown as _md  # type: ignore
    _HAS_MARKDOWN = True
except ImportError:  # pragma: no cover
    _HAS_MARKDOWN = False


# ---- paths ----

HERE = Path(__file__).resolve().parent
POSTS_DIR = HERE / "posts"
TEMPLATES_DIR = HERE / "templates"
LOGS_DIR = HERE / "logs"
LOGS_DIR.mkdir(exist_ok=True)

SITE_ROOT = HERE.parent.parent  # r5tools-landing/
BLOG_DIR = SITE_ROOT / "blog"
BLOG_DIR.mkdir(exist_ok=True)

SITE_URL = "https://r5tools.io"
BLOG_URL = f"{SITE_URL}/blog"
BLOG_TITLE = "R5TOOLS.IO Blog"
BLOG_DESCRIPTION = (
    "Weekly Last War: Survival meta, event breakdowns, alliance case studies, "
    "and R5-to-R5 tool walkthroughs from the R5TOOLS.IO team."
)
DEFAULT_AUTHOR = "Evan @ r5tools"
DEFAULT_LANG = "en"
SUPPORTED_LANGS = {"en", "ko", "ja", "pt", "es"}
KO_PATH_PREFIX = {"ko": "/ko", "ja": "/ja", "pt": "/pt", "es": "/es"}
LANG_LABELS = {
    "en": "English", "ko": "한국어", "ja": "日本語",
    "pt": "Português", "es": "Español",
}
POSTS_PER_INDEX_PAGE = 20

# CTA presets used by the "hero_cta" frontmatter shortcut.
CTA_LINKS = {
    "unlock":       ("Unlock your alliance", "https://access-codes.r5tools.io"),
    "landing":      ("Open the Landing Planner",  "https://bullochman.github.io/lws-landing-planner-static/"),
    "coal-burn":    ("Open the Coal Burn Calculator", "https://bullochman.github.io/lws-coal-burn-static/"),
    "heat-sim":     ("Open the Heat Simulator", "https://bullochman.github.io/lws-heat-simulator-static/"),
    "freeze-risk":  ("Open the Freeze-Risk Dashboard", "https://bullochman.github.io/lws-freeze-risk-static/"),
    "roster":       ("Open the Roster Extractor", "https://roster.r5tools.io/"),
    "hive":         ("Open the Hive Planner", "https://hive.r5tools.io/"),
    "season-timeline": ("Open the Season Timeline", "https://bullochman.github.io/lws-season-timeline-static/"),
    "city-capture": ("Open the City Capture Planner", "https://bullochman.github.io/lws-city-capture-static/"),
}


# ---------- frontmatter parsing ----------

_FRONTMATTER_RE = re.compile(r"^---\s*\n(.*?\n)---\s*\n(.*)$", re.DOTALL)


def parse_frontmatter(text: str) -> tuple[dict, str]:
    """Split a markdown source into (frontmatter_dict, body_str)."""
    m = _FRONTMATTER_RE.match(text)
    if not m:
        return {}, text
    fm_raw, body = m.group(1), m.group(2)
    if _HAS_YAML:
        try:
            fm = yaml.safe_load(fm_raw) or {}
        except yaml.YAMLError as e:
            raise ValueError(f"invalid YAML frontmatter: {e}") from e
    else:
        fm = _parse_yaml_lite(fm_raw)
    if not isinstance(fm, dict):
        raise ValueError("frontmatter must be a mapping")
    return fm, body


def _parse_yaml_lite(text: str) -> dict:
    """Minimal YAML subset: scalars, quoted strings, inline arrays."""
    out: dict = {}
    for line in text.splitlines():
        if not line.strip() or line.strip().startswith("#"):
            continue
        if ":" not in line:
            continue
        key, _, raw = line.partition(":")
        key = key.strip()
        raw = raw.strip()
        if not raw:
            out[key] = ""
            continue
        # inline array
        if raw.startswith("[") and raw.endswith("]"):
            inner = raw[1:-1]
            items = [_scalar_lite(x.strip()) for x in inner.split(",") if x.strip()]
            out[key] = items
            continue
        out[key] = _scalar_lite(raw)
    return out


def _scalar_lite(s: str):
    if len(s) >= 2 and s[0] == s[-1] and s[0] in ("'", '"'):
        return s[1:-1]
    if s.lower() in ("true", "false"):
        return s.lower() == "true"
    if s.lower() in ("null", "~"):
        return None
    try:
        if "." in s:
            return float(s)
        return int(s)
    except ValueError:
        return s


# ---------- markdown rendering ----------

_INLINE_LINK_RE = re.compile(r"\[([^\]]+)\]\(([^)]+)\)")
_BOLD_RE = re.compile(r"\*\*(.+?)\*\*")
_ITAL_RE = re.compile(r"(?<![*\w])\*(?!\s)(.+?)(?<!\s)\*(?!\*)")
_CODE_RE = re.compile(r"`([^`]+)`")
_H1_RE = re.compile(r"^# +(.+)$")
_H2_RE = re.compile(r"^## +(.+)$")
_H3_RE = re.compile(r"^### +(.+)$")
_H4_RE = re.compile(r"^#### +(.+)$")
_HR_RE = re.compile(r"^---+\s*$")
_QUOTE_RE = re.compile(r"^> ?(.*)$")
_UL_RE = re.compile(r"^[-*] +(.+)$")
_OL_RE = re.compile(r"^\d+\. +(.+)$")


def render_markdown(body: str) -> str:
    """Render post body markdown -> HTML."""
    if _HAS_MARKDOWN:
        return _md.markdown(
            body,
            extensions=["fenced_code", "tables", "sane_lists"],
            output_format="html5",
        )
    return _render_markdown_lite(body)


def _inline(s: str) -> str:
    s = _INLINE_LINK_RE.sub(r'<a href="\2">\1</a>', s)
    s = _BOLD_RE.sub(r"<strong>\1</strong>", s)
    s = _ITAL_RE.sub(r"<em>\1</em>", s)
    s = _CODE_RE.sub(r"<code>\1</code>", s)
    return s


def _render_markdown_lite(body: str) -> str:
    """Stdlib fallback markdown renderer covering the subset r5tools posts use."""
    lines = body.split("\n")
    out: list[str] = []
    para: list[str] = []
    list_stack: list[str] = []   # 'ul' or 'ol'
    in_code = False
    code_buf: list[str] = []
    in_quote = False
    quote_buf: list[str] = []
    in_table = False
    table_buf: list[str] = []

    def close_lists():
        while list_stack:
            out.append(f"</{list_stack.pop()}>")

    def flush_para():
        if not para:
            return
        text = _inline(" ".join(x.strip() for x in para).strip())
        if text:
            out.append(f"<p>{text}</p>")
        para.clear()

    def flush_quote():
        nonlocal in_quote
        if not in_quote:
            return
        joined = "\n".join(quote_buf)
        # Recursively render quote body as markdown.
        inner = _render_markdown_lite(joined)
        out.append(f"<blockquote>{inner}</blockquote>")
        quote_buf.clear()
        in_quote = False

    def flush_table():
        nonlocal in_table
        if not in_table:
            return
        # table_buf: header row, separator, then body rows
        rows = [r for r in table_buf if r.strip()]
        if len(rows) < 2:
            in_table = False
            table_buf.clear()
            return
        header = [c.strip() for c in rows[0].strip("|").split("|")]
        body_rows = [
            [c.strip() for c in r.strip("|").split("|")] for r in rows[2:]
        ]
        parts = ["<div class='tbl-wrap'><table><thead><tr>"]
        for c in header:
            parts.append(f"<th>{_inline(c)}</th>")
        parts.append("</tr></thead><tbody>")
        for row in body_rows:
            parts.append("<tr>" + "".join(f"<td>{_inline(c)}</td>" for c in row) + "</tr>")
        parts.append("</tbody></table></div>")
        out.append("".join(parts))
        table_buf.clear()
        in_table = False

    for raw in lines:
        line = raw.rstrip("\n")

        # fenced code
        if line.strip().startswith("```"):
            if in_code:
                out.append("<pre><code>" + _html_lib.escape("\n".join(code_buf)) + "</code></pre>")
                code_buf.clear()
                in_code = False
            else:
                flush_para(); close_lists(); flush_quote(); flush_table()
                in_code = True
            continue
        if in_code:
            code_buf.append(line)
            continue

        # blockquote
        m = _QUOTE_RE.match(line)
        if m and (in_quote or line.startswith(">")):
            flush_para(); close_lists(); flush_table()
            in_quote = True
            quote_buf.append(m.group(1))
            continue
        if in_quote and not line.strip():
            flush_quote()
            continue
        if in_quote:
            flush_quote()

        # tables — detect "|" line
        if "|" in line and line.strip().startswith("|"):
            flush_para(); close_lists()
            in_table = True
            table_buf.append(line)
            continue
        if in_table:
            flush_table()

        if not line.strip():
            flush_para(); close_lists()
            continue

        if _HR_RE.match(line):
            flush_para(); close_lists()
            out.append("<hr>")
            continue

        for h_re, tag in ((_H4_RE, "h4"), (_H3_RE, "h3"), (_H2_RE, "h2"), (_H1_RE, "h1")):
            m = h_re.match(line)
            if m:
                flush_para(); close_lists()
                out.append(f"<{tag}>{_inline(m.group(1))}</{tag}>")
                break
        else:
            m_ul = _UL_RE.match(line)
            m_ol = _OL_RE.match(line)
            if m_ul or m_ol:
                flush_para()
                want = "ul" if m_ul else "ol"
                if not list_stack or list_stack[-1] != want:
                    close_lists()
                    out.append(f"<{want}>")
                    list_stack.append(want)
                content = (m_ul or m_ol).group(1)
                out.append(f"<li>{_inline(content)}</li>")
                continue
            close_lists()
            para.append(line)

    if in_code:
        out.append("<pre><code>" + _html_lib.escape("\n".join(code_buf)) + "</code></pre>")
    flush_para()
    close_lists()
    flush_quote()
    flush_table()
    return "\n".join(out)


# ---------- post model ----------

class Post:
    __slots__ = (
        "source_path", "title", "date", "lang", "slug", "author",
        "description", "seo_keywords", "tags", "hero_cta", "canonical",
        "draft", "body_markdown", "body_html",
    )

    def __init__(self, source_path: Path, fm: dict, body: str):
        self.source_path = source_path
        self.title = str(fm.get("title") or "").strip()
        raw_date = fm.get("date")
        self.date = _coerce_date(raw_date)
        self.lang = (fm.get("lang") or DEFAULT_LANG).strip().lower()
        if self.lang not in SUPPORTED_LANGS:
            raise ValueError(f"{source_path.name}: unsupported lang {self.lang!r}")
        # slug default: derive from filename after date prefix
        self.slug = (fm.get("slug") or _slug_from_filename(source_path.stem)).strip()
        self.author = (fm.get("author") or DEFAULT_AUTHOR).strip()
        self.description = str(fm.get("description") or "").strip()
        self.seo_keywords = _as_list(fm.get("seo_keywords"))
        self.tags = _as_list(fm.get("tags"))
        self.hero_cta = (fm.get("hero_cta") or "").strip() or None
        self.canonical = (fm.get("canonical") or "").strip() or None
        self.draft = bool(fm.get("draft", False))
        self.body_markdown = body.strip() + "\n"
        self.body_html = ""  # rendered lazily

    def word_count(self) -> int:
        return len(re.findall(r"\S+", self.body_markdown))

    @property
    def url_path(self) -> str:
        y = f"{self.date.year:04d}"
        m = f"{self.date.month:02d}"
        prefix = "" if self.lang == "en" else KO_PATH_PREFIX.get(self.lang, "")
        return f"{prefix}/blog/{y}/{m}/{self.slug}.html"

    @property
    def out_path(self) -> Path:
        y = f"{self.date.year:04d}"
        m = f"{self.date.month:02d}"
        if self.lang == "en":
            base = BLOG_DIR / y / m
        else:
            base = SITE_ROOT / self.lang / "blog" / y / m
        return base / f"{self.slug}.html"

    @property
    def canonical_url(self) -> str:
        if self.canonical:
            return self.canonical
        return SITE_URL + self.url_path


def _coerce_date(raw) -> _dt.date:
    if isinstance(raw, _dt.datetime):
        return raw.date()
    if isinstance(raw, _dt.date):
        return raw
    if isinstance(raw, str):
        try:
            return _dt.date.fromisoformat(raw[:10])
        except ValueError as e:
            raise ValueError(f"bad date {raw!r}") from e
    raise ValueError(f"date required in frontmatter (got {raw!r})")


def _as_list(v) -> list:
    if v is None:
        return []
    if isinstance(v, list):
        return [str(x).strip() for x in v if str(x).strip()]
    if isinstance(v, str):
        return [x.strip() for x in v.split(",") if x.strip()]
    return [str(v)]


def _slug_from_filename(stem: str) -> str:
    # filename convention: YYYY-MM-DD-slug.md
    parts = stem.split("-", 3)
    if len(parts) == 4:
        return parts[3]
    return stem


# ---------- validation ----------

MIN_WORDS = 500


def validate(post: Post) -> list[str]:
    problems = []
    if not post.title:
        problems.append("missing title")
    if not post.description:
        problems.append("missing description")
    if len(post.description) > 240:
        problems.append(f"description too long ({len(post.description)} chars)")
    if not post.tags:
        problems.append("missing tags (at least 1)")
    if not post.seo_keywords:
        problems.append("missing seo_keywords (at least 1)")
    if post.word_count() < MIN_WORDS:
        problems.append(f"under {MIN_WORDS} words ({post.word_count()}) — do not publish thin content")
    if re.search(r"[^\w\-]", post.slug):
        problems.append(f"slug contains invalid characters: {post.slug!r}")
    return problems


# ---------- HTML rendering ----------

SUITE_NAV = """<nav class="suite-nav" aria-label="R5TOOLS.IO suite">
  <a href="/">Home</a>
  <a href="/blog/">Blog</a>
  <a href="https://roster.r5tools.io/">Roster Extractor</a>
  <a href="https://hive.r5tools.io/">Hive Planner</a>
  <a href="https://bullochman.github.io/lws-season-timeline-static/">Season Timeline</a>
  <a href="https://bullochman.github.io/lws-landing-planner-static/">Landing Planner</a>
  <a href="https://bullochman.github.io/lws-heat-simulator-static/">Heat Sim</a>
  <a href="https://bullochman.github.io/lws-freeze-risk-static/">Freeze Risk</a>
  <a href="https://bullochman.github.io/lws-coal-burn-static/">Coal Burn</a>
  <a href="https://bullochman.github.io/lws-city-capture-static/">City Capture</a>
</nav>"""

ANALYTICS_BLOCK = """<!-- r5tools:analytics v1 START -->
<script src="/analytics-config.js"></script>
<script>
  (function () {
    var id = (window.R5T_ANALYTICS || {}).ga4MeasurementId || "";
    if (!id) return;
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(id);
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", id, { anonymize_ip: true, allow_google_signals: false });
  })();
  (function () {
    var cfg = window.R5T_ANALYTICS || {};
    if (!cfg.plausibleDomain) return;
    var p = document.createElement("script");
    p.defer = true;
    p.setAttribute("data-domain", cfg.plausibleDomain);
    p.src = cfg.plausibleScriptUrl || "https://plausible.io/js/script.js";
    document.head.appendChild(p);
    window.plausible = window.plausible || function () { (window.plausible.q = window.plausible.q || []).push(arguments); };
  })();
</script>
<script src="/analytics.js" defer></script>
<!-- r5tools:analytics v1 END -->"""

FOUNDING_WIDGET_INJECT = """<!-- BEGIN founding-widget-inject -->
<script src="/founding-widget.js" defer></script>
<!-- END founding-widget-inject -->"""

FAVICON = ("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'"
           "%3E%3Crect width='100' height='100' rx='18' fill='%230a0e1a'/%3E%3Ctext x='50' y='72'"
           " text-anchor='middle' font-family='system-ui,sans-serif' font-weight='700' font-size='60'"
           " fill='%23c9a961'%3ER5%3C/text%3E%3C/svg%3E")

BASE_STYLES = """
* { box-sizing: border-box; }
:root {
  --bg:#0a0e1a; --panel:#0d1424; --panel-2:#12192c;
  --border:rgba(255,255,255,0.08); --border-accent:rgba(201,169,97,0.3);
  --accent:#c9a961; --accent-hover:#d9b871;
  --text:#e6e8ee; --text-dim:#a8b0c0; --text-mute:#7a8290;
  --live:#8ae0a3; --soon:#e6cf7a;
  --mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}
html,body { margin:0; padding:0; background:var(--bg); color:var(--text);
  font-family: system-ui,-apple-system,"Segoe UI",Roboto,"Noto Sans KR",sans-serif;
  -webkit-font-smoothing:antialiased; line-height:1.6; }
a { color: var(--accent); }
a:hover { color: var(--accent-hover); }
.wrap { max-width: 820px; margin: 0 auto; padding: 24px 20px 96px; }
.suite-nav { display:flex; gap:8px; flex-wrap:wrap; font-size:12px;
  padding: 10px 16px; background: var(--panel); border-bottom: 1px solid var(--border);
  justify-content:center; }
.suite-nav a { color: var(--text-dim); text-decoration:none; padding: 4px 10px;
  border:1px solid var(--border); border-radius:14px; }
.suite-nav a:hover { color: var(--accent); border-color: var(--accent); }
.crumbs { font-size:12px; color: var(--text-mute); margin: 16px 0 8px; letter-spacing:0.03em; }
.crumbs a { color: var(--text-dim); text-decoration:none; }
.crumbs a:hover { color: var(--accent); }
h1 { font-size: 36px; line-height:1.15; letter-spacing:-0.01em; margin: 6px 0 12px; font-weight:600; }
h1 .accent { color: var(--accent); }
h2 { font-size:22px; margin: 40px 0 12px; color: var(--accent);
  border-bottom:1px solid var(--border); padding-bottom:6px; font-weight:600; }
h3 { font-size:17px; margin: 28px 0 8px; color: var(--text); font-weight:600; }
h4 { font-size:15px; margin: 20px 0 6px; color: var(--text-dim); }
p, li { color: var(--text-dim); }
strong { color: var(--text); }
.lede { font-size:17px; color: var(--text); margin: 10px 0 24px; }
.meta { font-size:12px; color: var(--text-mute); letter-spacing:0.05em; text-transform:uppercase;
  margin: 0 0 4px; }
.byline { font-size:13px; color: var(--text-dim); margin: 4px 0 24px; }
.byline .dot { color: var(--text-mute); margin: 0 6px; }
.tag { display:inline-block; font-size:11px; padding: 2px 10px; margin: 0 4px 4px 0;
  background: var(--panel); border:1px solid var(--border); border-radius:14px; color: var(--text-dim);
  text-decoration:none; letter-spacing:0.04em; }
.tag:hover { border-color: var(--accent); color: var(--accent); }
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
th, td { border: 1px solid var(--border); padding: 6px 10px; text-align:left; vertical-align:top; }
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
.related { margin: 48px 0 20px; }
.related h2 { border-bottom:1px solid var(--border); padding-bottom:8px; }
.related-list { display:grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap:12px; }
.related-card { background: var(--panel); border:1px solid var(--border); border-radius:10px;
  padding: 14px 16px; text-decoration:none; color: var(--text); display:block; }
.related-card:hover { border-color: var(--accent); }
.related-card .rc-date { font-size:11px; color: var(--text-mute); letter-spacing:0.05em; text-transform:uppercase; }
.related-card .rc-title { font-size:14px; color: var(--text); margin-top:4px; font-weight:600; line-height:1.35; }
.newsletter-widget { margin: 40px 0 20px; padding: 20px 22px; background: var(--panel);
  border:1px solid var(--border-accent); border-radius:12px; }
.newsletter-widget h3 { color: var(--accent); font-size:15px; margin:0 0 6px; letter-spacing:0.06em;
  text-transform:uppercase; }
.newsletter-widget p { color: var(--text); font-size:14px; margin: 0 0 12px; }
.newsletter-widget form { display:flex; gap:8px; flex-wrap:wrap; }
.newsletter-widget input[type=email] { flex:1; min-width:200px; padding: 9px 12px;
  background: var(--panel-2); border:1px solid var(--border); color: var(--text);
  border-radius:8px; font-size:14px; font-family:inherit; }
.newsletter-widget input[type=email]:focus { outline:none; border-color: var(--accent); }
.newsletter-widget button { padding: 9px 18px; background: var(--accent); color:#000;
  border:none; border-radius:8px; font-weight:600; cursor:pointer; font-size:14px; }
.newsletter-widget button:hover { background: var(--accent-hover); }
.newsletter-widget .status { margin-top:8px; font-size:13px; color: var(--text-dim); min-height:1em; }
.foot { text-align:center; color: var(--text-mute); font-size:12px;
  margin-top: 60px; padding-top: 20px; border-top: 1px solid var(--border); }
.foot a { color: var(--text-dim); text-decoration:none; }
.foot a:hover { color: var(--accent); }
.beta-pill { position:fixed; bottom: 18px; right: 18px;
  background: var(--panel); border:1px solid var(--border-accent);
  color: var(--text); font-size:12px; padding: 8px 14px;
  border-radius: 20px; text-decoration:none; z-index:50;
  box-shadow: 0 4px 12px rgba(0,0,0,0.4); }
.beta-pill:hover { border-color: var(--accent); color: var(--accent); }
@media (max-width: 600px) {
  h1 { font-size: 26px; }
  h2 { font-size: 18px; }
  .wrap { padding: 16px 14px 96px; }
}
"""

# Index-specific style tweaks
INDEX_STYLES = """
.post-list { list-style:none; padding:0; margin: 24px 0; display:grid; gap: 16px; }
.post-item { background: var(--panel); border:1px solid var(--border); border-radius:12px;
  padding: 20px 22px; transition: border-color 0.15s; }
.post-item:hover { border-color: var(--accent); }
.post-item .pi-date { font-size:11px; color: var(--text-mute); letter-spacing:0.06em;
  text-transform:uppercase; }
.post-item .pi-title { font-size: 20px; margin: 6px 0 8px; }
.post-item .pi-title a { color: var(--text); text-decoration:none; }
.post-item .pi-title a:hover { color: var(--accent); }
.post-item .pi-desc { color: var(--text-dim); font-size:14px; margin: 0 0 10px; }
.post-item .pi-tags .tag { font-size:10px; }
.pager { display:flex; justify-content:space-between; margin: 32px 0; font-size:14px; }
.pager a { color: var(--accent); text-decoration:none; }
.pager .empty { color: var(--text-mute); }
"""


def _newsletter_widget_html(lang: str) -> str:
    """Signup widget shown in blog footer."""
    labels = {
        "en": ("Get one email a week", "New tools, meta reads, and LWS math — no spam, one-click unsubscribe.",
               "Your email", "Subscribe", "Subscribed — check your inbox."),
        "ko": ("주 1회 이메일 받기", "새 툴, 메타 분석, LWS 계산 자료를 한 번에. 스팸 없음, 원클릭 해지.",
               "이메일 주소", "구독", "구독 완료 — 받은편지함 확인해 주세요."),
        "ja": ("週1回のメールを受け取る", "新ツール、メタ分析、LWS計算資料。スパムなし、ワンクリックで解除。",
               "メールアドレス", "登録", "登録完了 — 受信箱をご確認ください。"),
        "pt": ("Receba um email por semana", "Novas ferramentas, análise meta e matemática do LWS. Sem spam.",
               "Seu email", "Inscrever", "Inscrito — confira seu email."),
        "es": ("Recibe un email a la semana", "Nuevas herramientas, análisis del meta y matemáticas de LWS.",
               "Tu email", "Suscribir", "Suscrito — revisa tu bandeja."),
    }.get(lang, None) or labels_en_default()  # type: ignore
    h, p, place, btn, done = labels
    return f"""<aside class="newsletter-widget">
  <h3>{_html_lib.escape(h)}</h3>
  <p>{_html_lib.escape(p)}</p>
  <form onsubmit="return r5tSubscribeNewsletter(event, this)">
    <input type="email" name="email" required placeholder="{_html_lib.escape(place)}" autocomplete="email">
    <button type="submit">{_html_lib.escape(btn)}</button>
  </form>
  <div class="status" data-done="{_html_lib.escape(done)}"></div>
</aside>
<script>
function r5tSubscribeNewsletter(ev, form){{
  ev.preventDefault();
  var email = form.email.value.trim();
  if (!email) return false;
  var status = form.parentElement.querySelector('.status');
  status.textContent = '...';
  fetch('https://access-codes.r5tools.io/api/drip/subscribe', {{
    method:'POST',
    headers: {{'Content-Type':'application/json'}},
    body: JSON.stringify({{email: email, lang: '{lang}', tag: 'newsletter'}})
  }}).then(function(r){{return r.json();}})
    .then(function(j){{
      status.textContent = status.dataset.done;
      if (window.r5t && window.r5t.track) window.r5t.track('newsletter_subscribe', {{lang:'{lang}'}});
    }})
    .catch(function(){{ status.textContent = 'Error — try again in a moment.'; }});
  return false;
}}
</script>"""


def labels_en_default():
    return (
        "Get one email a week",
        "New tools, meta reads, and LWS math — no spam, one-click unsubscribe.",
        "Your email",
        "Subscribe",
        "Subscribed — check your inbox.",
    )


def _hero_cta_html(post: Post, lang: str) -> str:
    """Optional hero CTA above article body if hero_cta was set."""
    if not post.hero_cta or post.hero_cta not in CTA_LINKS:
        return ""
    label, url = CTA_LINKS[post.hero_cta]
    unlock_line_en = "All R5TOOLS.IO planners unlock instantly for Warzone 2007 members — no signup, no payment."
    unlock_line_ko = "워존 2007 얼라이언스는 무료로 잠금 해제 — 가입도 결제도 필요 없습니다."
    unlock_line = unlock_line_ko if lang == "ko" else unlock_line_en
    return f"""<div class="cta-card">
  <h3>{_html_lib.escape(label)}</h3>
  <p>{_html_lib.escape(unlock_line)}</p>
  <a class="btn" href="{_html_lib.escape(url)}" rel="noopener">{_html_lib.escape(label)} →</a>
</div>"""


def _foot_html(lang: str) -> str:
    if lang == "ko":
        return (
            "<p>R5TOOLS.IO 라스트 워: 서바이벌 얼라이언스 툴킷의 일부. "
            "팬 제작 · First Fun / Century Games와 무관합니다. "
            "<a href='https://r5tools.io/terms.html'>이용약관</a> · "
            "<a href='https://r5tools.io/privacy.html'>개인정보</a>.</p>"
        )
    return (
        "<p>Part of the <a href='https://r5tools.io/'>R5TOOLS.IO</a> Last War: Survival alliance toolkit. "
        "Fan-made · unaffiliated with First Fun / Century Games. "
        "<a href='https://r5tools.io/terms.html'>Terms</a> · "
        "<a href='https://r5tools.io/privacy.html'>Privacy</a>.</p>"
    )


def _hreflang_links(post: Post, all_posts_by_slug: dict[str, list[Post]]) -> str:
    """Emit hreflang alternates if this slug is available in multiple langs."""
    variants = all_posts_by_slug.get(post.slug, [])
    if len(variants) <= 1:
        return (
            f'<link rel="alternate" hreflang="{post.lang}" href="{post.canonical_url}">\n'
            f'<link rel="alternate" hreflang="x-default" href="{post.canonical_url}">'
        )
    lines = []
    for v in variants:
        lines.append(f'<link rel="alternate" hreflang="{v.lang}" href="{v.canonical_url}">')
    # x-default = English if available, else first
    en = next((v for v in variants if v.lang == "en"), variants[0])
    lines.append(f'<link rel="alternate" hreflang="x-default" href="{en.canonical_url}">')
    return "\n".join(lines)


def _breadcrumb_ld(post: Post) -> dict:
    return {
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": f"{SITE_URL}/"},
            {"@type": "ListItem", "position": 2, "name": "Blog", "item": f"{BLOG_URL}/"},
            {"@type": "ListItem", "position": 3, "name": post.title, "item": post.canonical_url},
        ],
    }


def _article_ld(post: Post) -> dict:
    return {
        "@type": "Article",
        "headline": post.title,
        "description": post.description,
        "datePublished": post.date.isoformat(),
        "dateModified": post.date.isoformat(),
        "author": {"@type": "Person", "name": post.author, "url": SITE_URL},
        "publisher": {
            "@type": "Organization", "name": "R5TOOLS.IO", "url": SITE_URL,
            "logo": {"@type": "ImageObject", "url": f"{SITE_URL}/static/og-image.png"},
        },
        "image": f"{SITE_URL}/static/og-image.png",
        "mainEntityOfPage": post.canonical_url,
        "inLanguage": post.lang,
        "keywords": ", ".join(post.seo_keywords) if post.seo_keywords else None,
    }


def _related_html(post: Post, all_posts: list[Post]) -> str:
    """Pick 3-5 same-language posts sharing at least one tag."""
    tags = set(post.tags)
    scored: list[tuple[int, Post]] = []
    for p in all_posts:
        if p is post or p.lang != post.lang or p.draft:
            continue
        common = len(set(p.tags) & tags)
        if common == 0:
            continue
        scored.append((common, p))
    # sort by (common tags desc, date desc)
    scored.sort(key=lambda x: (x[0], x[1].date.toordinal()), reverse=True)
    picks = [p for _, p in scored[:5]]
    if len(picks) < 3:
        # backfill with latest same-language posts
        extras = [p for p in all_posts
                  if p is not post and p.lang == post.lang and not p.draft and p not in picks]
        extras.sort(key=lambda x: x.date, reverse=True)
        picks.extend(extras[: 3 - len(picks)])
    if not picks:
        return ""
    heading = {
        "en": "Related posts", "ko": "관련 글", "ja": "関連記事",
        "pt": "Posts relacionados", "es": "Posts relacionados",
    }.get(post.lang, "Related posts")
    cards = []
    for p in picks:
        cards.append(
            f'<a class="related-card" href="{p.url_path}">'
            f'<div class="rc-date">{p.date.isoformat()}</div>'
            f'<div class="rc-title">{_html_lib.escape(p.title)}</div>'
            f'</a>'
        )
    return (
        f'<section class="related"><h2>{heading}</h2>'
        f'<div class="related-list">{"".join(cards)}</div></section>'
    )


def render_post_html(post: Post, all_posts: list[Post], by_slug: dict[str, list[Post]]) -> str:
    if not post.body_html:
        post.body_html = render_markdown(post.body_markdown)
    ld = {"@context": "https://schema.org", "@graph": [_article_ld(post), _breadcrumb_ld(post)]}
    ld_json = json.dumps(ld, ensure_ascii=False, separators=(",", ":"))
    kw_meta = ", ".join(post.seo_keywords) if post.seo_keywords else ""
    tags_html = "".join(
        f'<a class="tag" href="/blog/?tag={_html_lib.escape(t)}">{_html_lib.escape(t)}</a>'
        for t in post.tags
    )
    hero_cta = _hero_cta_html(post, post.lang)
    related = _related_html(post, all_posts)
    newsletter = _newsletter_widget_html(post.lang)
    hreflang = _hreflang_links(post, by_slug)
    return f"""<!doctype html>
<html lang="{post.lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{_html_lib.escape(post.title)} | R5TOOLS.IO Blog</title>
<meta name="description" content="{_html_lib.escape(post.description)}">
<meta name="keywords" content="{_html_lib.escape(kw_meta)}">
<meta name="author" content="{_html_lib.escape(post.author)}">
<link rel="canonical" href="{post.canonical_url}">
{hreflang}
<meta property="og:title" content="{_html_lib.escape(post.title)}">
<meta property="og:description" content="{_html_lib.escape(post.description)}">
<meta property="og:type" content="article">
<meta property="og:url" content="{post.canonical_url}">
<meta property="og:image" content="{SITE_URL}/static/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="article:published_time" content="{post.date.isoformat()}">
<meta property="article:author" content="{_html_lib.escape(post.author)}">
{"".join(f'<meta property="article:tag" content="{_html_lib.escape(t)}">' for t in post.tags)}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{_html_lib.escape(post.title)}">
<meta name="twitter:description" content="{_html_lib.escape(post.description)}">
<meta name="twitter:image" content="{SITE_URL}/static/og-image.png">
<link rel="icon" type="image/svg+xml" href="{FAVICON}">
<link rel="alternate" type="application/rss+xml" title="R5TOOLS.IO Blog" href="/blog/feed.xml">
<script type="application/ld+json">{ld_json}</script>
<style>{BASE_STYLES}</style>
{ANALYTICS_BLOCK}
</head>
<body>
{SUITE_NAV}
<div class="wrap">
  <nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a> › <a href="/blog/">Blog</a> › <span>{_html_lib.escape(post.title)}</span></nav>
  <div class="meta">{post.date.isoformat()} · {_html_lib.escape(post.author)}</div>
  <h1>{_html_lib.escape(post.title)}</h1>
  <p class="lede">{_html_lib.escape(post.description)}</p>
  <div class="byline">{tags_html}</div>
  {hero_cta}
  <article>
{post.body_html}
  </article>
  {newsletter}
  <div class="cta-card">
    <h3>Bring this into your alliance chat</h3>
    <p>Every R5TOOLS.IO planner exports Discord-ready PNGs, roster CSVs, and share links.</p>
    <a class="btn" href="https://access-codes.r5tools.io" rel="noopener">Get started free →</a>
  </div>
  {related}
  <footer class="foot">
  {_foot_html(post.lang)}
  </footer>
</div>
<a class="beta-pill" href="https://r5tools.io/#feedback">Beta · feedback</a>
{FOUNDING_WIDGET_INJECT}
</body>
</html>
"""


# ---------- index page ----------

def render_index(posts_en: list[Post], page: int, total_pages: int, lang: str = "en") -> str:
    lang_prefix = "" if lang == "en" else f"/{lang}"
    heading_map = {
        "en": ("R5TOOLS.IO Blog", "Weekly LWS meta, event breakdowns, and R5-to-R5 tool walkthroughs."),
        "ko": ("R5TOOLS.IO 블로그", "주간 LWS 메타, 이벤트 분석, R5 대 R5 툴 사용기."),
        "ja": ("R5TOOLS.IO ブログ", "週次のLWSメタ、イベント解説、R5から R5への実戦ツール解説。"),
        "pt": ("R5TOOLS.IO Blog", "Meta semanal do LWS, análises de eventos e guias R5-para-R5."),
        "es": ("R5TOOLS.IO Blog", "Meta semanal de LWS, análisis de eventos y guías R5-a-R5."),
    }
    hd_title, hd_dek = heading_map.get(lang, heading_map["en"])
    items_html = []
    for p in posts_en:
        tags_html = "".join(
            f'<a class="tag" href="{lang_prefix}/blog/?tag={_html_lib.escape(t)}">{_html_lib.escape(t)}</a>'
            for t in p.tags
        )
        items_html.append(
            f'<li class="post-item">'
            f'<div class="pi-date">{p.date.isoformat()}</div>'
            f'<h2 class="pi-title"><a href="{p.url_path}">{_html_lib.escape(p.title)}</a></h2>'
            f'<p class="pi-desc">{_html_lib.escape(p.description)}</p>'
            f'<div class="pi-tags">{tags_html}</div>'
            f'</li>'
        )
    prev_html = ""
    next_html = ""
    if page > 1:
        prev_link = f"{lang_prefix}/blog/" if page == 2 else f"{lang_prefix}/blog/page/{page-1}.html"
        prev_html = f'<a href="{prev_link}">← Newer posts</a>'
    else:
        prev_html = '<span class="empty">← Newer posts</span>'
    if page < total_pages:
        next_html = f'<a href="{lang_prefix}/blog/page/{page+1}.html">Older posts →</a>'
    else:
        next_html = '<span class="empty">Older posts →</span>'

    self_url = f"{SITE_URL}{lang_prefix}/blog/" if page == 1 else f"{SITE_URL}{lang_prefix}/blog/page/{page}.html"
    blog_ld = {
        "@context": "https://schema.org",
        "@type": "Blog",
        "name": BLOG_TITLE,
        "description": BLOG_DESCRIPTION,
        "url": self_url,
        "inLanguage": lang,
    }
    ld_json = json.dumps(blog_ld, ensure_ascii=False, separators=(",", ":"))
    return f"""<!doctype html>
<html lang="{lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{_html_lib.escape(hd_title)} — LWS meta + tool walkthroughs</title>
<meta name="description" content="{_html_lib.escape(hd_dek)}">
<link rel="canonical" href="{self_url}">
<meta property="og:title" content="{_html_lib.escape(hd_title)}">
<meta property="og:description" content="{_html_lib.escape(hd_dek)}">
<meta property="og:type" content="website">
<meta property="og:url" content="{self_url}">
<meta property="og:image" content="{SITE_URL}/static/og-image.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/svg+xml" href="{FAVICON}">
<link rel="alternate" type="application/rss+xml" title="{_html_lib.escape(BLOG_TITLE)}" href="{lang_prefix}/blog/feed.xml">
<script type="application/ld+json">{ld_json}</script>
<style>{BASE_STYLES}{INDEX_STYLES}</style>
{ANALYTICS_BLOCK}
</head>
<body>
{SUITE_NAV}
<div class="wrap">
  <nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a> › <span>Blog</span></nav>
  <h1>{_html_lib.escape(hd_title)}</h1>
  <p class="lede">{_html_lib.escape(hd_dek)}</p>
  {_newsletter_widget_html(lang)}
  <ul class="post-list">
  {"".join(items_html)}
  </ul>
  <nav class="pager">{prev_html}{next_html}</nav>
  <footer class="foot">
  {_foot_html(lang)}
  </footer>
</div>
<a class="beta-pill" href="https://r5tools.io/#feedback">Beta · feedback</a>
{FOUNDING_WIDGET_INJECT}
</body>
</html>
"""


# ---------- RSS ----------

def render_feed(posts: list[Post], lang: str = "en") -> str:
    """RSS 2.0 feed of the most recent 30 posts of the given language.

    lastBuildDate is derived from the newest post's date rather than "now" so
    the builder is idempotent (repeated runs on unchanged input emit no
    unnecessary writes).
    """
    lang_prefix = "" if lang == "en" else f"/{lang}"
    feed_url = f"{SITE_URL}{lang_prefix}/blog/feed.xml"
    if posts:
        newest = max(posts, key=lambda p: p.date)
        build_dt = _dt.datetime.combine(newest.date, _dt.time(12, 0, 0), tzinfo=_dt.timezone.utc)
    else:
        build_dt = _dt.datetime(2026, 1, 1, tzinfo=_dt.timezone.utc)
    build_date = _rfc822(build_dt)
    items = []
    for p in posts[:30]:
        pubdate = _rfc822(
            _dt.datetime.combine(p.date, _dt.time(12, 0, 0), tzinfo=_dt.timezone.utc)
        )
        # For content:encoded, ensure we have the rendered HTML
        if not p.body_html:
            p.body_html = render_markdown(p.body_markdown)
        content_html = p.body_html
        cats = "".join(f"<category>{_xml.escape(t)}</category>" for t in p.tags)
        items.append(f"""    <item>
      <title>{_xml.escape(p.title)}</title>
      <link>{_xml.escape(p.canonical_url)}</link>
      <guid isPermaLink="true">{_xml.escape(p.canonical_url)}</guid>
      <pubDate>{pubdate}</pubDate>
      <author>evan@r5tools.io ({_xml.escape(p.author)})</author>
      {cats}
      <description>{_xml.escape(p.description)}</description>
      <content:encoded><![CDATA[{content_html}]]></content:encoded>
    </item>""")
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>{_xml.escape(BLOG_TITLE)}</title>
    <link>{SITE_URL}{lang_prefix}/blog/</link>
    <atom:link href="{feed_url}" rel="self" type="application/rss+xml"/>
    <description>{_xml.escape(BLOG_DESCRIPTION)}</description>
    <language>{lang}</language>
    <lastBuildDate>{build_date}</lastBuildDate>
    <generator>r5tools build_blog.py</generator>
{chr(10).join(items)}
  </channel>
</rss>
"""


def _rfc822(dt: _dt.datetime) -> str:
    return dt.strftime("%a, %d %b %Y %H:%M:%S +0000")


# ---------- IO helpers ----------

def write_if_changed(path: Path, content: str, dry_run: bool = False) -> bool:
    """Write only if the content differs. Returns True if a write occurred."""
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists():
        old = path.read_bytes()
        if hashlib.sha256(old).digest() == hashlib.sha256(content.encode("utf-8")).digest():
            return False
    if dry_run:
        print(f"[dry-run] would write {path.relative_to(SITE_ROOT)} ({len(content)} bytes)")
        return True
    path.write_text(content, encoding="utf-8")
    return True


# ---------- discovery ----------

def load_posts(only_slug: str | None = None) -> list[Post]:
    posts: list[Post] = []
    for md_path in sorted(POSTS_DIR.glob("*.md")):
        try:
            raw = md_path.read_text(encoding="utf-8")
            fm, body = parse_frontmatter(raw)
            p = Post(md_path, fm, body)
        except Exception as e:
            print(f"[ERROR] {md_path.name}: {e}", file=sys.stderr)
            continue
        if only_slug and p.slug != only_slug:
            continue
        posts.append(p)
    return posts


# ---------- build ----------

def build(dry_run: bool = False, only_slug: str | None = None, check: bool = False) -> int:
    posts = load_posts(only_slug=only_slug)
    if not posts:
        print("no posts found in", POSTS_DIR)
        return 0

    total_problems = 0
    for p in posts:
        problems = validate(p)
        if problems:
            total_problems += 1
            print(f"[WARN] {p.source_path.name}: {'; '.join(problems)}", file=sys.stderr)

    if check and total_problems:
        return 1

    # Filter draft + validation failures for actual publishing.
    publishable = [p for p in posts if not p.draft]
    for p in list(publishable):
        if p.word_count() < MIN_WORDS:
            print(f"[SKIP] {p.source_path.name}: too short, not publishing")
            publishable.remove(p)

    publishable.sort(key=lambda p: (p.date, p.slug), reverse=True)

    by_slug: dict[str, list[Post]] = {}
    for p in publishable:
        by_slug.setdefault(p.slug, []).append(p)

    writes = 0
    # Individual post pages
    for p in publishable:
        html = render_post_html(p, publishable, by_slug)
        if write_if_changed(p.out_path, html, dry_run=dry_run):
            writes += 1

    # Per-language index + feed
    langs_seen = sorted({p.lang for p in publishable})
    for lang in langs_seen:
        lang_posts = [p for p in publishable if p.lang == lang]
        n_pages = max(1, (len(lang_posts) + POSTS_PER_INDEX_PAGE - 1) // POSTS_PER_INDEX_PAGE)
        for page in range(1, n_pages + 1):
            start = (page - 1) * POSTS_PER_INDEX_PAGE
            end = start + POSTS_PER_INDEX_PAGE
            html = render_index(lang_posts[start:end], page, n_pages, lang=lang)
            if lang == "en":
                out = BLOG_DIR / "index.html" if page == 1 else BLOG_DIR / "page" / f"{page}.html"
            else:
                base = SITE_ROOT / lang / "blog"
                out = base / "index.html" if page == 1 else base / "page" / f"{page}.html"
            if write_if_changed(out, html, dry_run=dry_run):
                writes += 1

        feed_xml = render_feed(lang_posts, lang=lang)
        feed_out = BLOG_DIR / "feed.xml" if lang == "en" else SITE_ROOT / lang / "blog" / "feed.xml"
        if write_if_changed(feed_out, feed_xml, dry_run=dry_run):
            writes += 1

    # Sitemap fragment for blog posts
    urls = []
    for p in publishable:
        urls.append(
            f"  <url><loc>{p.canonical_url}</loc><lastmod>{p.date.isoformat()}</lastmod>"
            f"<changefreq>monthly</changefreq><priority>0.7</priority></url>"
        )
    urls.append(
        f"  <url><loc>{SITE_URL}/blog/</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>"
    )
    fragment = "<?xml version='1.0' encoding='UTF-8'?>\n" \
               "<urlset xmlns='http://www.sitemaps.org/schemas/sitemap/0.9'>\n" \
               + "\n".join(urls) + "\n</urlset>\n"
    if write_if_changed(BLOG_DIR / "sitemap-blog.xml", fragment, dry_run=dry_run):
        writes += 1

    # Log
    log_line = {
        "ts": _dt.datetime.now(_dt.timezone.utc).isoformat(),
        "posts": len(publishable),
        "writes": writes,
        "problems": total_problems,
    }
    (LOGS_DIR / "build.jsonl").open("a", encoding="utf-8").write(json.dumps(log_line) + "\n")

    print(f"built {len(publishable)} posts, {writes} file(s) written, {total_problems} validation warning(s)")
    return 0


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--post", help="rebuild only this slug")
    ap.add_argument("--check", action="store_true", help="non-zero exit on validation problems")
    args = ap.parse_args()
    sys.exit(build(dry_run=args.dry_run, only_slug=args.post, check=args.check))


if __name__ == "__main__":
    main()
