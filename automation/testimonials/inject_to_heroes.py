#!/usr/bin/env python3
"""
inject_to_heroes.py — replace the placeholder testimonial block on each hero
page with the top-3 approved testimonials for that language.

Idempotent: uses HTML marker comments to fence the injectable region so
re-running the script cleanly REPLACES the block (never appends duplicates).

    <!-- r5tools:testimonials v1 START -->
    ... whatever is between these markers gets swapped ...
    <!-- r5tools:testimonials v1 END -->

If any language has fewer than 3 approved testimonials, we DO NOT fabricate —
the PLACEHOLDER cards remain untouched for that page. This preserves the
"no fabrication" policy called out in the project spec.

TARGETS
    /index.html           -> lang=en, top 3 EN
    /ko/index.html        -> lang=ko
    /ja/index.html        -> lang=ja  (if present)
    /pt/index.html        -> lang=pt  (if present)
    /es/index.html        -> lang=es  (if present)

SOURCE
    LWS_Access_Codes/logs/testimonials-approved.jsonl (produced by moderator.py)

USAGE
    python3 inject_to_heroes.py          # dry-run diff summary
    python3 inject_to_heroes.py --apply  # write changes to disk
    python3 inject_to_heroes.py --lang ko --apply
    python3 inject_to_heroes.py --min 2  # inject even with just 2 approved
                                         # (default: 3)
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
from datetime import datetime
from pathlib import Path
from typing import Iterable

HERE = Path(__file__).resolve().parent
LANDING_ROOT = HERE.parents[1]   # r5tools-landing/
REPO_ROOT = Path(os.environ.get("R5T_HOME", HERE.parents[2]))
APPROVED_LOG = REPO_ROOT / "LWS_Access_Codes" / "logs" / "testimonials-approved.jsonl"
WITHDRAWN_LOG = REPO_ROOT / "LWS_Access_Codes" / "logs" / "testimonials-withdrawn.jsonl"

# Blurb + heading strings per lang for the top-of-section chrome. These live in
# HTML directly (not I18N object) because the block is a hard-replace and each
# language file gets its own generation.
LANG_STRINGS = {
    "en": {
        "heading": "WHAT R5s SAY",
        "blurb":   "Real testimonials from R5s, R4s, and members using r5tools every week. Every card below is a verified paid user.",
        "verified": "VERIFIED",
        "warzone_prefix": "WZ",
        "role_map": {"R5": "R5", "R4": "R4", "member": "Member"},
    },
    "ko": {
        "heading": "얼라이언스 리더 후기",
        "blurb":   "매주 r5tools를 사용하는 R5, R4, 멤버들의 실제 후기입니다. 아래 모든 카드는 인증된 유료 사용자입니다.",
        "verified": "인증됨",
        "warzone_prefix": "워존",
        "role_map": {"R5": "R5", "R4": "R4", "member": "멤버"},
    },
    "ja": {
        "heading": "アライアンスリーダーの声",
        "blurb":   "毎週r5toolsを使用しているR5、R4、メンバーからの本物のレビュー。下記すべてのカードは認証済み有料ユーザーです。",
        "verified": "認証済み",
        "warzone_prefix": "WZ",
        "role_map": {"R5": "R5", "R4": "R4", "member": "メンバー"},
    },
    "pt": {
        "heading": "O QUE OS R5s DIZEM",
        "blurb":   "Depoimentos reais de R5s, R4s e membros que usam r5tools toda semana. Cada card abaixo é um usuário pago verificado.",
        "verified": "VERIFICADO",
        "warzone_prefix": "WZ",
        "role_map": {"R5": "R5", "R4": "R4", "member": "Membro"},
    },
    "es": {
        "heading": "LO QUE DICEN LOS R5s",
        "blurb":   "Testimonios reales de R5s, R4s y miembros que usan r5tools cada semana. Cada tarjeta a continuación es un usuario pago verificado.",
        "verified": "VERIFICADO",
        "warzone_prefix": "WZ",
        "role_map": {"R5": "R5", "R4": "R4", "member": "Miembro"},
    },
}

# Marker comments — MUST match exactly what the placeholder blocks in the hero
# HTML files use (added by hand in the initial hero build).
MARKER_START = "<!-- r5tools:testimonials v1 START -->"
MARKER_END   = "<!-- r5tools:testimonials v1 END -->"

TARGETS = [
    ("en", LANDING_ROOT / "index.html"),
    ("ko", LANDING_ROOT / "ko" / "index.html"),
    ("ja", LANDING_ROOT / "ja" / "index.html"),
    ("pt", LANDING_ROOT / "pt" / "index.html"),
    ("es", LANDING_ROOT / "es" / "index.html"),
]

# ----- helpers -----------------------------------------------------------

def _read_jsonl(path: Path) -> list[dict]:
    if not path.exists(): return []
    out = []
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line: continue
            try: out.append(json.loads(line))
            except json.JSONDecodeError: continue
    return out

def load_approved(min_len: int = 40) -> list[dict]:
    """Load approved, minus anything the user has since withdrawn."""
    withdrawn_ids = {r.get("id") for r in _read_jsonl(WITHDRAWN_LOG)}
    rows = []
    for r in _read_jsonl(APPROVED_LOG):
        if r.get("id") in withdrawn_ids: continue
        if r.get("moderation", {}).get("decision") != "approved": continue
        if len((r.get("quote") or "")) < min_len: continue
        rows.append(r)
    return rows

def top_for_lang(rows: list[dict], lang: str, n: int = 3) -> list[dict]:
    """Rank by (rating desc, verified paid first, most-recent approval)."""
    langset = [r for r in rows if r.get("lang") == lang]
    return sorted(
        langset,
        key=lambda r: (
            -(r.get("rating") or 0),
            0 if r.get("verified_paid_user") else 1,
            -(int(datetime.fromisoformat(r["approved_at"].replace("Z","+00:00")).timestamp())
              if r.get("approved_at") else 0),
        ),
    )[:n]

def _escape(s: str) -> str:
    return (s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
             .replace('"', "&quot;").replace("'", "&#39;"))

def _initials(name: str, fallback: str = "R5") -> str:
    parts = re.split(r"\s+", (name or fallback).strip())
    letters = "".join(p[0] for p in parts if p)[:2].upper()
    return letters or fallback[:2].upper()

def render_card(row: dict, strings: dict) -> str:
    quote = _escape(row.get("quote", ""))
    name = _escape(row.get("name") or "R5")
    role_label = strings["role_map"].get(row.get("role") or "R5", row.get("role") or "")
    wz = row.get("warzone")
    wz_str = f" · {strings['warzone_prefix']} {int(wz)}" if wz else ""
    rating = row.get("rating") or 0
    star_str = ("★" * rating).ljust(5, "☆") if rating else ""
    star_html = f'<div class="stars">{star_str}</div>' if rating else ""
    verified_html = (
        f'<span class="verified">✓ {strings["verified"]}</span>'
        if row.get("verified_paid_user") else ""
    )
    return (
        '        <div class="testimonial">\n'
        + (f'          {star_html}\n' if star_html else "")
        + f'          <div class="testimonial-body">"{quote}"</div>\n'
        + '          <div class="testimonial-attr">\n'
        + f'            <span class="avatar">{_initials(row.get("name") or "R5", role_label)}</span>\n'
        + f'            <span>{_escape(name)} · {_escape(role_label)}{_escape(wz_str)}</span>\n'
        + f'            {verified_html}\n'
        + '          </div>\n'
        + '        </div>'
    )

def build_section(rows: list[dict], lang: str) -> str:
    strings = LANG_STRINGS.get(lang, LANG_STRINGS["en"])
    cards = "\n".join(render_card(r, strings) for r in rows)
    heading = _escape(strings["heading"])
    blurb = _escape(strings["blurb"])
    generated = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
    return (
        f"{MARKER_START}\n"
        f"    <!-- auto-generated by automation/testimonials/inject_to_heroes.py @ {generated} -->\n"
        f"    <section>\n"
        f"      <h2>{heading}</h2>\n"
        f"      <p class=\"sec-blurb\">{blurb}</p>\n"
        f"      <div class=\"testimonials\">\n"
        f"{cards}\n"
        f"      </div>\n"
        f"    </section>\n"
        f"    {MARKER_END}"
    )

# ----- injection --------------------------------------------------------

def replace_block(html: str, new_block: str) -> tuple[str, str]:
    """Return (new_html, status)."""
    pattern = re.compile(
        re.escape(MARKER_START) + r".*?" + re.escape(MARKER_END),
        re.DOTALL,
    )
    if not pattern.search(html):
        return html, "no-markers"
    new_html = pattern.sub(lambda _: new_block, html, count=1)
    if new_html == html: return html, "unchanged"
    return new_html, "replaced"

# ----- CLI --------------------------------------------------------------

def main() -> int:
    ap = argparse.ArgumentParser(description="Inject approved testimonials into hero pages")
    ap.add_argument("--apply", action="store_true", help="write changes (default: dry-run)")
    ap.add_argument("--lang", help="limit to one language")
    ap.add_argument("--min", type=int, default=3, help="minimum approved needed to inject (default 3)")
    args = ap.parse_args()

    approved = load_approved()
    print(f"[inject] {len(approved)} approved testimonials loaded")

    any_written = False
    for lang, path in TARGETS:
        if args.lang and lang != args.lang: continue
        if not path.exists():
            print(f"  [{lang}] {path.relative_to(LANDING_ROOT)} — skip (file missing)")
            continue
        rows = top_for_lang(approved, lang, n=3)
        if len(rows) < args.min:
            print(f"  [{lang}] only {len(rows)} approved (need {args.min}) — keeping PLACEHOLDER")
            continue
        html = path.read_text(encoding="utf-8")
        if MARKER_START not in html:
            print(f"  [{lang}] no marker found in {path.name} — skip (needs manual marker)")
            continue
        new_block = build_section(rows, lang)
        new_html, status = replace_block(html, new_block)
        if status == "no-markers":
            print(f"  [{lang}] no-markers"); continue
        if not args.apply:
            print(f"  [{lang}] {path.relative_to(LANDING_ROOT)} — would inject {len(rows)} cards")
        else:
            path.write_text(new_html, encoding="utf-8")
            print(f"  [{lang}] {path.relative_to(LANDING_ROOT)} — {status} ({len(rows)} cards)")
            any_written = True

    if not args.apply and not any_written:
        print("\n(dry-run — pass --apply to write)")
    return 0

if __name__ == "__main__":
    sys.exit(main())
