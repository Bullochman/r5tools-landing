"""
Idempotent importer: parses /marketing/discord/launch-posts.md and writes
one content file per variant to ./content/.

Also parses /marketing/content-calendar/tips-en.md and writes tip-01..tip-30
using the Discord-sized body from each tip.

Writes YAML frontmatter (id, lang, channel_type, source) then the body.
"""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
CONTENT_DIR = ROOT / "content"
CONTENT_DIR.mkdir(exist_ok=True)

MARKETING = ROOT.parent.parent / "marketing"
LAUNCH_POSTS = MARKETING / "discord" / "launch-posts.md"
TIPS_EN = MARKETING / "content-calendar" / "tips-en.md"


# ---- launch posts ----------------------------------------------------------

def _parse_launch_posts(text: str) -> dict[str, str]:
    """
    Splits launch-posts.md into named variants:
      launch-short, launch-medium, launch-long (English)
      launch-short-ko, launch-medium-ko, launch-long-ko

    Rules:
      - Level-2 headings like "## SHORT — ..." start a size block.
      - Level-3 headings "### English" or "### 한국어" pick the language.
      - Body is everything until the next ##/### heading OR "---" separator.
      - We strip leading blockquote markers ("> ") because Discord doesn't
        need them and they hurt readability in chunked messages.
    """
    variants: dict[str, str] = {}

    size_map = {"SHORT": "short", "MEDIUM": "medium", "LONG": "long"}
    lang_map = {"english": "", "한국어": "-ko", "korean": "-ko"}

    current_size: str | None = None
    current_lang: str | None = None
    buffer: list[str] = []

    def flush():
        nonlocal buffer
        if current_size and current_lang is not None and buffer:
            key = f"launch-{current_size}{current_lang}"
            body = _strip_quote("\n".join(buffer)).strip()
            if body:
                variants[key] = body
        buffer = []

    for raw in text.splitlines():
        line = raw.rstrip()

        if line.startswith("## "):
            flush()
            head = line[3:].strip()
            first_word = head.split()[0].upper().rstrip(":")
            current_size = size_map.get(first_word)
            current_lang = None
            continue

        if line.startswith("### "):
            flush()
            head = line[4:].strip().lower()
            lang_key = None
            for k, v in lang_map.items():
                if k in head:
                    lang_key = v
                    break
            current_lang = lang_key
            continue

        if line.strip() == "---":
            flush()
            continue

        if current_size and current_lang is not None:
            buffer.append(raw)

    flush()
    return variants


_QUOTE_RE = re.compile(r"^> ?", re.MULTILINE)


def _strip_quote(body: str) -> str:
    return _QUOTE_RE.sub("", body)


def _write(name: str, lang: str, channel_type: str, body: str, source: str) -> bool:
    """Return True if file was written or updated."""
    path = CONTENT_DIR / f"{name}.md"
    frontmatter = (
        "---\n"
        f"id: {name}\n"
        f"lang: {lang}\n"
        f"channel_type: {channel_type}\n"
        f"source: {source}\n"
        "---\n\n"
    )
    new = frontmatter + body.strip() + "\n"
    if path.exists() and path.read_text(encoding="utf-8") == new:
        return False
    path.write_text(new, encoding="utf-8")
    return True


# ---- tips ------------------------------------------------------------------

_TIP_HEADING_RE = re.compile(r"^## Tip (\d+)\b", re.MULTILINE)
_DISCORD_BODY_RE = re.compile(
    r"\*\*Body \(Discord[^)]*\):\*\*\s*(.+)", re.IGNORECASE
)


def _parse_tips(text: str) -> dict[str, str]:
    """
    Return {tip-01: body, ...} using each tip's Discord body line.
    Falls back to X body if Discord body missing.
    """
    tips: dict[str, str] = {}
    # split on tip headings, keep the numbers
    matches = list(_TIP_HEADING_RE.finditer(text))
    for i, m in enumerate(matches):
        start = m.start()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        block = text[start:end]
        num = int(m.group(1))
        # heading = "## Tip N — Title"
        heading_line = block.splitlines()[0]
        title = heading_line.split("—", 1)[-1].strip() if "—" in heading_line else ""

        discord_match = _DISCORD_BODY_RE.search(block)
        body = discord_match.group(1).strip() if discord_match else ""
        if not body:
            # fall back to X body
            x_match = re.search(r"\*\*Body \(X[^)]*\):\*\*\s*(.+)", block, re.IGNORECASE)
            body = x_match.group(1).strip() if x_match else ""
        if not body:
            continue

        # Format: title on its own line, then body, then link nudge
        formatted = (f"**{title}**\n\n{body}" if title else body)
        tips[f"tip-{num:02d}"] = formatted
    return tips


# ---- driver ----------------------------------------------------------------

def main() -> None:
    written = 0
    skipped = 0

    if LAUNCH_POSTS.exists():
        variants = _parse_launch_posts(LAUNCH_POSTS.read_text(encoding="utf-8"))
        for name, body in sorted(variants.items()):
            lang = "ko" if name.endswith("-ko") else "en"
            # short → general, medium → tools, long → announcement
            size = name.split("-")[1]
            channel_type = {
                "short": "general",
                "medium": "tools",
                "long": "announcement",
            }.get(size, "general")
            if _write(name, lang, channel_type, body, "discord/launch-posts.md"):
                written += 1
                print(f"[wrote]   {name}.md ({lang}, {len(body)} chars)")
            else:
                skipped += 1
    else:
        print(f"[skip] {LAUNCH_POSTS} missing")

    if TIPS_EN.exists():
        tips = _parse_tips(TIPS_EN.read_text(encoding="utf-8"))
        for name, body in sorted(tips.items()):
            if _write(name, "en", "general", body,
                      "content-calendar/tips-en.md"):
                written += 1
                print(f"[wrote]   {name}.md ({len(body)} chars)")
            else:
                skipped += 1
    else:
        print(f"[skip] {TIPS_EN} missing")

    print(f"\nDone. wrote={written} unchanged={skipped} dir={CONTENT_DIR}")


if __name__ == "__main__":
    main()
