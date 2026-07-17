#!/usr/bin/env python3
"""
build_cheatsheet.py — generate the Season 2 Landing Cheat Sheet PDF (EN + KR).

Output:
    season-2-landing-cheat-sheet.pdf     (English, ~6 pages, print-ready A4-ish)
    season-2-landing-cheat-sheet-ko.pdf  (Korean, glossary-translated headings + content)

Everything numeric here is sourced from the LWS_Knowledge_Base article
`kb/06-season-2-frozen.md` (see the KB for citation trail). Do not invent
alliance names, warzones, or benchmarks. If a value isn't in the KB, don't
put it in the sheet.

Deps:
    reportlab (required — falls back to a helpful message if missing)
    qrcode    (optional — QR code drops back to plain text URL if missing)
"""

from __future__ import annotations

import io
import os
import re
import sys
from pathlib import Path
from typing import Dict, List, Optional, Tuple

# --- Locate KB glossary for KR translation ----------------------------------
REPO = Path(__file__).resolve().parents[2]  # -> r5tools/
KB_GLOSSARY = REPO.parent / "LWS_Knowledge_Base" / "kb" / "15-glossary.md"
KB_S2 = REPO.parent / "LWS_Knowledge_Base" / "kb" / "06-season-2-frozen.md"

OUT_EN = Path(__file__).resolve().parent / "season-2-landing-cheat-sheet.pdf"
OUT_KO = Path(__file__).resolve().parent / "season-2-landing-cheat-sheet-ko.pdf"

REFER_URL = "https://r5tools.io/refer.html?ref=CHEATSHEET"

# --- Reportlab imports (hard require) ---------------------------------------
try:
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import LETTER
    from reportlab.lib.units import inch
    from reportlab.pdfgen import canvas
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont
    from reportlab.lib.utils import ImageReader
except ImportError:
    print(
        "ERROR: reportlab not installed. Run: pip install reportlab qrcode\n",
        file=sys.stderr,
    )
    sys.exit(1)

# --- Optional QR ------------------------------------------------------------
try:
    import qrcode  # type: ignore
except ImportError:
    qrcode = None  # graceful


# =============================================================================
# Brand tokens (must match r5tools.io look)
# =============================================================================
BRAND = {
    "bg": colors.HexColor("#0a0e1a"),
    "panel": colors.HexColor("#0d1424"),
    "border": colors.HexColor("#20293e"),
    "accent": colors.HexColor("#c9a961"),
    "accent_dim": colors.HexColor("#8f7844"),
    "text": colors.HexColor("#e6e8ee"),
    "text_dim": colors.HexColor("#a8b0c0"),
    "text_mute": colors.HexColor("#7a8290"),
    "danger": colors.HexColor("#e88a4a"),
    "cold": colors.HexColor("#5eb8ff"),
    "warm": colors.HexColor("#ffb87c"),
    "success": colors.HexColor("#8ae0a3"),
}


# =============================================================================
# Font registration — try to pick something with Hangul coverage for KR pdf.
# On macOS, AppleSDGothicNeo / NanumGothic ttf are usually present; fall back
# to Helvetica if none found (Hangul will render as boxes — better than crash).
# =============================================================================
def register_fonts() -> Tuple[str, str, str]:
    """Return (regular, bold, korean) font family names."""
    regular = "Helvetica"
    bold = "Helvetica-Bold"
    korean = None

    kr_candidates = [
        # macOS system fonts
        "/System/Library/Fonts/AppleSDGothicNeo.ttc",
        "/System/Library/Fonts/Supplemental/AppleGothic.ttf",
        "/Library/Fonts/NanumGothic.ttf",
        "/System/Library/Fonts/Supplemental/NotoSansKR-Regular.otf",
        # linux fallbacks
        "/usr/share/fonts/truetype/nanum/NanumGothic.ttf",
        "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
    ]
    for path in kr_candidates:
        if os.path.exists(path):
            try:
                # ttc files need subfontIndex; try 0
                if path.endswith(".ttc"):
                    pdfmetrics.registerFont(TTFont("KRFont", path, subfontIndex=0))
                else:
                    pdfmetrics.registerFont(TTFont("KRFont", path))
                korean = "KRFont"
                break
            except Exception:
                continue

    # A "clean" sans for headings — DejaVuSans if present, otherwise Helvetica.
    dejavu_paths = [
        "/System/Library/Fonts/Supplemental/Verdana.ttf",  # macos alt
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ]
    for path in dejavu_paths:
        if os.path.exists(path):
            try:
                pdfmetrics.registerFont(TTFont("BodyFont", path))
                regular = "BodyFont"
                break
            except Exception:
                pass
    # If Helvetica-Bold isn't found (rare), stay with regular.
    return regular, bold, korean or regular


# =============================================================================
# Minimal glossary-based EN->KO translator
# =============================================================================
def load_glossary() -> Dict[str, str]:
    """{english_phrase: korean_phrase} from KB glossary + hand-authored terms."""
    hand: Dict[str, str] = {
        # ---- headings ----
        "The Season 2 Landing Cheat Sheet": "시즌 2 랜딩 치트시트",
        "Season 2 Landing Cheat Sheet": "시즌 2 랜딩 치트시트",
        "Polar Storm · Frozen Map · Rare Soil War": "폴라 스톰 · 얼어붙은 맵 · 희토 전쟁",
        "The 4 coordinates every alliance botches": "모든 얼라이언스가 놓치는 4개 좌표",
        "HQ-level to landing tier priority": "본부 레벨별 랜딩 티어 우선순위",
        "Rally leader placement — the 3-second window": "랠리 리더 배치 — 3초 창",
        "First 72 hours: build order & resource ratio": "첫 72시간: 건설 순서 & 자원 비율",
        "You're screwed if…": "이러면 망합니다…",
        "Get the Landing Planner tool": "랜딩 플래너 도구 받기",
        # ---- roles / ranks ----
        "R5": "R5",
        "R4": "R4",
        "R3": "R3",
        "R2": "R2",
        "R1": "R1",
        # ---- meta ----
        "Built by an active R5 in Warzone 2007": "Warzone 2007 현역 R5가 제작",
        "Free — no strings.": "완전 무료 — 조건 없음.",
        "Written by an active R5. Distribute freely inside your alliance.": "현역 R5가 작성. 얼라이언스 내부에서 자유롭게 배포하세요.",
        "Unlock the full toolkit": "전체 도구 잠금 해제",
        "Scan for the referral bonus": "리퍼럴 보너스는 QR 스캔",
        "$30 for the whole alliance. Use code": "얼라이언스 전체 $30. 코드 사용:",
        "for free access.": "무료 이용.",
        # ---- body words used in headings ----
        "Coordinate": "좌표",
        "Tier": "티어",
        "Landing tile": "랜딩 타일",
        "Rally leader": "랠리 리더",
        "Alliance Furnace": "동맹 화로",
        "High-Heat Furnace": "고열 화로",
        "Titanium Alloy Factory": "티타늄 합금 공장",
        "Blizzard": "눈보라",
        "Warlord Missile": "워로드 미사일",
        "Rare Soil": "희토",
        "Frozen": "동결",
        "Coal": "석탄",
        "Titanium": "티타늄",
    }

    if not KB_GLOSSARY.exists():
        return hand

    inside = False
    for line in KB_GLOSSARY.read_text(encoding="utf-8").splitlines():
        s = line.strip()
        if s.startswith("## KR ↔ EN terminology"):
            inside = True
            continue
        if inside and s.startswith("## ") and "terminology" not in s:
            break
        if not inside:
            continue
        if not s.startswith("|") or s.startswith("|---"):
            continue
        cells = [c.strip() for c in s.strip("|").split("|")]
        if len(cells) < 2:
            continue
        kr, en = cells[0], cells[1]
        if en.lower() == "english" or kr.lower() == "한국어":
            continue
        for variant in re.split(r"\s*/\s*", en):
            core = re.sub(r"\s*\(.*?\)\s*", "", variant).strip()
            if not core or len(core) <= 2:
                continue
            # never overwrite a hand-authored translation
            hand.setdefault(core, kr.split("/")[0].strip())
    return hand


GLOSSARY = load_glossary()


def tr(text: str, lang: str) -> str:
    """Translate an EN string to `lang`. Hits exact-match glossary first, then
    does term-by-term substitution on longer terms."""
    if lang == "en":
        return text
    # Exact match (headings, key phrases)
    if text in GLOSSARY:
        return GLOSSARY[text]
    # Substitution pass — longest keys first so we don't clobber prefixes
    out = text
    for en_phrase in sorted(GLOSSARY.keys(), key=len, reverse=True):
        if len(en_phrase) < 4:
            continue
        if en_phrase in out:
            out = out.replace(en_phrase, GLOSSARY[en_phrase])
    return out


# =============================================================================
# Cheat sheet CONTENT — every fact traced back to KB `kb/06-season-2-frozen.md`
# =============================================================================
CONTENT: Dict[str, object] = {
    "cover_title": "The Season 2 Landing Cheat Sheet",
    "cover_subtitle": "Polar Storm · Frozen Map · Rare Soil War",
    "cover_footer": "Written by an active R5. Distribute freely inside your alliance.",
    "cover_source": "Source: R5TOOLS.IO Last War: Survival Knowledge Base — kb/06-season-2-frozen.md",
    # ---- Page 2: the 4 coordinates ----
    "p2_title": "The 4 coordinates every alliance botches",
    "p2_body": [
        ("Alliance Furnace tile",
         "The single tile your R4/R5 plants the Alliance Furnace on. Must be a "
         "Level-1 territory. Must be inside your intended corner but far enough "
         "in that the hive can wrap it. Once placed, up to 20 members must "
         "reinforce it to activate — no build-time delay after activation."),
        ("Assembly Point",
         "Should sit near the Alliance Furnace but OUTSIDE the 25×25 Warlord "
         "Missile blast area. The Assembly Point is your evicted-defenders' "
         "return tile when a Warlord Missile lands (every base inside the "
         "blast area is randomly teleported across the map on impact)."),
        ("Rally leaders' anchor tiles",
         "R4/R5 rally leaders — Marshal, Warlord — pin to the inner ring "
         "adjacent to the Alliance Furnace. Their rally leader temperature "
         "bonus applies to the entire rally, so lower-power members can join "
         "operations deep in the frost."),
        ("Weakest-member fallback ring",
         "Weakest members (lowest HQ, lowest heat stack) park CLOSEST to the "
         "Alliance Furnace. Stronger anchors absorb hits on the outer ring. "
         "This inverts the intuition — most alliances put their strongest on "
         "the furnace because that's where the fighting is. Wrong. Freeze "
         "cascades kill weak members first; put them in the warmest ground."),
    ],
    # ---- Page 3: HQ-level landing tier table ----
    "p3_title": "HQ-level to landing tier priority",
    "p3_intro": (
        "Weaker players get the warmest tiles. Strongest anchor the outer ring. "
        "Alliance Furnace at L1 puts out only +3 °C, so tile choice matters more "
        "than gear at the start of Week 1."
    ),
    "p3_table_header": ["HQ Level", "Landing Tier", "Distance from Furnace", "Reason"],
    "p3_table_rows": [
        ["HQ 30+", "OUTER RING", "8–12 tiles", "Absorbs hits · rally anchor · high heat stack"],
        ["HQ 27–29", "MID RING",   "5–7 tiles",  "Backup reinforcement · shares heat radius"],
        ["HQ 24–26", "INNER RING", "3–4 tiles",  "Needs city + furnace coverage to survive W3 blizzard"],
        ["HQ ≤ 23",  "FURNACE ADJACENT", "1–2 tiles", "Any freeze cascade kills them first · park here"],
    ],
    "p3_notes": [
        "L6 city grants +60 °C in range — captured cities snap the local tile to -10 °C, effectively a warm island.",
        "Do NOT park directly on the Alliance Furnace tile — the 25×25 Warlord Missile blast will teleport you away.",
        "The 5-tile safe-distance rule (outside the 25×25 blast) still applies to everyone, weak or strong.",
    ],
    # ---- Page 4: rally leader placement + 3-second window ----
    "p4_title": "Rally leader placement — the 3-second window",
    "p4_intro": (
        "Rallies use the leader's temperature bonus — every member in a rally "
        "inherits the leader's heat stack. This is why a low-heat R2 can join "
        "a rally into the -80 °C Capitol zone if the R5 leading has +131 °C "
        "stacked. Place your rally leaders where they can start rallies inside "
        "3 seconds of a call in alliance chat."
    ),
    "p4_facts": [
        "Rally leaders (Marshal, Warlord) MUST be within 1–2 tiles of the Alliance Furnace.",
        "The Warlord Missile has a 3-minute (180s) prep window during which the enemy Warlord's base coordinates are broadcast in world chat — cancel it by rallying their base and forcing a breach or relocation.",
        "A cancelled Warlord Missile applies a 72-hour cooldown on the missile skill (not the Warlord role — rotate title to a shadow Warlord R4 to keep another missile ready).",
        "Combat opens at 12:30 server time on Wednesday and Saturday of every war week — Prep runs 12:00–12:30, Combat runs 12:30–13:10 (40 min max).",
        "Season 2 has NO Alliance Safe Time (that's Season 5+). Every alliance on your warzone fights on the same fixed 12:30 server-time schedule.",
    ],
    "p4_diagram_note": (
        "Below: standard rally-leader anchor pattern. Furnace at center; two "
        "rally leaders at N/S with 1-tile buffer; Assembly Point outside the "
        "25×25 blast ring so evicted bases have somewhere to return."
    ),
    # ---- Page 5: 72-hour build order ----
    "p5_title": "First 72 hours: build order & resource ratio",
    "p5_intro": (
        "Coal is fuel and factory-upgrade currency. Titanium is furnace-upgrade "
        "currency only. Rare Soil is season rank + Alliance Furnace auto-upgrade "
        "trigger. Meat and iron are base-game resources — Season 2 does not "
        "consume them at unusual rates, so keep normal RSS gathering going but "
        "prioritize coal above all else."
    ),
    "p5_priority": [
        "HOUR 0–2: R4/R5 deploys Alliance Furnace on a Level-1 territory. Every online member reinforces immediately (~20 needed to activate).",
        "HOUR 0–2: Every member builds their own High-Heat Furnace (personal, max L30) and turns on the 'auto-activate in blizzard' toggle.",
        "HOUR 2–12: Capture your first Level-1 dig site (adjacency rule — first alliance capture MUST be an L1 dig site).",
        "HOUR 2–24: Every member builds Titanium Alloy Factory #1. Factory #2 unlocks at L15 on #1; same for #3 and #4.",
        "HOUR 12–72: Radar missions cleared for coal payout (stack radars before season start; first-kill on a level-180 Wanderer post-transition = ~200,000 coal community-reported).",
        "HOUR 24–72: R5 captures 2nd dig site (2 captures/day cap) and starts positioning for first L1 city (unlocks W1 day 3 + 12h).",
    ],
    "p5_ratios_header": ["Resource", "Where it goes", "Prioritize"],
    "p5_ratios_rows": [
        ["Coal",           "Furnace fuel + Titanium factory upgrades",  "★★★ HIGHEST — everything downstream needs it"],
        ["Titanium",       "High-Heat Furnace upgrades ONLY",           "★★  Only after factories are producing at L15+"],
        ["Rare Soil",      "Season rank + Alliance Furnace auto-upgrade","★★★ Capture territory early; hold forever"],
        ["Meat / Iron",    "Base-game troop training + healing",         "★   Keep normal gathering; not the bottleneck"],
        ["Oil",            "Vehicle production (base-game)",             "★   Keep normal gathering; not the bottleneck"],
    ],
    "p5_notes": [
        "Alliance Furnace L20 burns 1,440 coal/min normal, 5,760 coal/min overdrive — plan 50 coal donations/member/day cap.",
        "Do NOT kill your highest-level Wanderer / Doom Walker BEFORE the map transition — the coal first-kill reward only pays out post-transition.",
        "Titanium Alloy Factory upgrade coal cost: L1 = 720 · L15 = 137,000 · L30 = 359,300. Full 4-factory build to L15 is ~Week 1-2 priority.",
    ],
    # ---- Page 6: you're screwed if X ----
    "p6_title": "You're screwed if…  (the R5 warning checklist)",
    "p6_items": [
        ("Your Alliance Furnace isn't activated by end of Day 1.",
         "20 reinforcements gate it. If nobody garrisons, nobody has shared heat. Week 1 -30 °C blizzard freezes half the hive."),
        ("Your first alliance capture isn't a Level-1 dig site.",
         "The adjacency rule locks you out of expansion. Every subsequent capture must be adjacent to existing alliance territory — the L1 dig site is your anchor."),
        ("You parked bases directly on the Alliance Furnace tile.",
         "Warlord Missile lands, 25×25 blast area, every base inside gets randomly teleported across the map. You'll spend 30+ minutes teleporting back while defenders are down."),
        ("Your Warlord officer burned the missile skill before a war round.",
         "72-hour cooldown. Rotate the Warlord title to a shadow R4 who hasn't fired theirs — otherwise you enter Wednesday war with no missile available."),
        ("You captured into a higher stockpile bracket you can't defend.",
         "Rare Soil War brackets (Ranks 1–10, 11–20, 21–30, 31–50) are set by stockpile. Over-capturing promotes you into a tougher bracket where you get plundered faster than you produce."),
        ("Your weakest HQs are on the outer ring.",
         "Freeze cascades kill low-heat members first. Weak = furnace-adjacent. Strong = outer ring. Getting this backwards is the #1 wipe pattern."),
        ("Nobody enabled 'auto-activate in blizzard' on their High-Heat Furnace.",
         "Blizzards are announced hours in advance but if a member is asleep, the auto-toggle is what keeps them from freezing. Enable it Day 1, no exceptions."),
        ("You planned around 'Alliance Safe Time' from a Season 5 guide.",
         "Season 2 has no Safe Time. Every alliance fights at 12:30 server time on Wednesday and Saturday. If your server-time = 04:30 local, that's the hour you fight. Plan the roster around it."),
    ],
    # ---- back cover ----
    "back_title": "Get the Landing Planner tool",
    "back_pitch": (
        "This cheat sheet gets you 80% of the way. The Landing Planner tool "
        "does the last 20% — assigns every one of your 100 members a specific "
        "tile relative to your anchor, exports a labeled PNG for Discord, and "
        "generates a Freeze-Risk score per member before Day 1 even starts."
    ),
    "back_cta_title": "Unlock the full toolkit",
    "back_cta_body": (
        "$30 for the whole alliance. Use code RONY-FREE for free access."
    ),
    "back_kr_note_en": (
        "Korean edition available — same tools, KR terminology. See r5tools.io/ko/"
    ),
    "back_kr_note_ko": (
        "한국어 버전도 있습니다 — 같은 도구, 한국어 용어. r5tools.io/ko/ 방문"
    ),
    "back_qr_caption": "Scan for the referral bonus",
    "back_url": REFER_URL,
}


# =============================================================================
# Layout primitives
# =============================================================================
PAGE_W, PAGE_H = LETTER
MARGIN = 0.6 * inch


def draw_bg(c: canvas.Canvas):
    c.setFillColor(BRAND["bg"])
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)


def draw_accent_band(c: canvas.Canvas, y: float, w: float = None, h: float = 4):
    c.setFillColor(BRAND["accent"])
    c.rect(MARGIN, y, (w or (PAGE_W - 2 * MARGIN)), h, fill=1, stroke=0)


def draw_header(c: canvas.Canvas, page_label: str, section: str, fonts):
    reg, bold, kr = fonts
    c.setFillColor(BRAND["accent"])
    c.setFont(bold, 9)
    c.drawString(MARGIN, PAGE_H - MARGIN + 6, "R5TOOLS.IO")
    c.setFillColor(BRAND["text_mute"])
    # Use KR font when the section string contains Hangul.
    has_hangul = any("가" <= ch <= "힣" for ch in section)
    header_font = kr if has_hangul and kr else reg
    c.setFont(header_font, 8)
    c.drawRightString(PAGE_W - MARGIN, PAGE_H - MARGIN + 6, f"{section}  ·  {page_label}")
    # thin accent underline
    c.setStrokeColor(BRAND["border"])
    c.setLineWidth(0.5)
    c.line(MARGIN, PAGE_H - MARGIN - 2, PAGE_W - MARGIN, PAGE_H - MARGIN - 2)


def draw_footer(c: canvas.Canvas, fonts, lang="en"):
    reg, _, kr = fonts
    font = kr if lang == "ko" else reg
    c.setFillColor(BRAND["text_mute"])
    c.setFont(font, 7.5)
    c.setStrokeColor(BRAND["border"])
    c.setLineWidth(0.5)
    c.line(MARGIN, MARGIN - 4, PAGE_W - MARGIN, MARGIN - 4)
    left = tr("R5TOOLS.IO · Season 2 Landing Cheat Sheet", lang)
    right = "r5tools.io"
    c.drawString(MARGIN, MARGIN - 16, left)
    c.drawRightString(PAGE_W - MARGIN, MARGIN - 16, right)


def wrap_text(text: str, max_chars: int) -> List[str]:
    """Naive character-count wrapper — good enough for CJK because we treat
    them at 1 char each (they're 2 columns wide but reportlab measures kerned
    width correctly, so most lines still fit)."""
    words = text.split()
    out, line = [], ""
    for w in words:
        candidate = f"{line} {w}".strip()
        if len(candidate) > max_chars:
            if line:
                out.append(line)
            line = w
        else:
            line = candidate
    if line:
        out.append(line)
    return out


def draw_paragraph(
    c: canvas.Canvas,
    text: str,
    x: float,
    y: float,
    width: float,
    font: str,
    size: float,
    color,
    leading: float = None,
    max_chars: int = 90,
) -> float:
    c.setFillColor(color)
    c.setFont(font, size)
    leading = leading or size * 1.35
    lines = wrap_text(text, max_chars)
    for line in lines:
        c.drawString(x, y, line)
        y -= leading
    return y


# =============================================================================
# PAGE BUILDERS
# =============================================================================
def build_cover(c: canvas.Canvas, fonts, lang: str):
    reg, bold, kr = fonts
    body_font = kr if lang == "ko" else reg
    bold_font = kr if lang == "ko" else bold
    draw_bg(c)

    # Big gold band as design element
    c.setFillColor(BRAND["accent"])
    c.rect(0, PAGE_H * 0.72, PAGE_W, 8, fill=1, stroke=0)

    # R5TOOLS.IO brand tag
    c.setFillColor(BRAND["accent"])
    c.setFont(bold, 11)
    c.drawString(MARGIN, PAGE_H - MARGIN, "R5TOOLS.IO")

    # Big centered title
    title = tr(CONTENT["cover_title"], lang)
    subtitle = tr(CONTENT["cover_subtitle"], lang)

    c.setFillColor(BRAND["text"])
    c.setFont(bold_font, 34 if lang == "en" else 28)
    # simple two-line rendering for very long titles
    tw = c.stringWidth(title, bold_font, 34 if lang == "en" else 28)
    if tw > (PAGE_W - 2 * MARGIN):
        # split at midpoint word
        words = title.split()
        mid = len(words) // 2
        first, second = " ".join(words[:mid]), " ".join(words[mid:])
        c.drawCentredString(PAGE_W / 2, PAGE_H * 0.55, first)
        c.drawCentredString(PAGE_W / 2, PAGE_H * 0.55 - 40, second)
    else:
        c.drawCentredString(PAGE_W / 2, PAGE_H * 0.55, title)

    c.setFillColor(BRAND["accent"])
    c.setFont(body_font, 14)
    c.drawCentredString(PAGE_W / 2, PAGE_H * 0.44, subtitle)

    # attribution
    c.setFillColor(BRAND["text_dim"])
    c.setFont(body_font, 10)
    c.drawCentredString(PAGE_W / 2, PAGE_H * 0.38, tr(CONTENT["cover_footer"], lang))

    # bottom band with source
    c.setStrokeColor(BRAND["border"])
    c.setLineWidth(0.5)
    c.line(MARGIN, MARGIN + 40, PAGE_W - MARGIN, MARGIN + 40)
    c.setFillColor(BRAND["text_mute"])
    c.setFont(body_font, 8)
    c.drawCentredString(PAGE_W / 2, MARGIN + 24, tr(CONTENT["cover_source"], lang))
    c.drawCentredString(PAGE_W / 2, MARGIN + 10, "r5tools.io  ·  2026")


def build_page_4coords(c: canvas.Canvas, fonts, lang: str):
    reg, bold, kr = fonts
    body_font = kr if lang == "ko" else reg
    bold_font = kr if lang == "ko" else bold
    draw_bg(c)
    draw_header(c, "PAGE 2", tr("The 4 coordinates every alliance botches", lang), fonts)

    y = PAGE_H - MARGIN - 30
    c.setFillColor(BRAND["accent"])
    c.setFont(bold_font, 20)
    c.drawString(MARGIN, y, tr(CONTENT["p2_title"], lang))
    y -= 8
    draw_accent_band(c, y, w=60)
    y -= 30

    # ASCII-style diagram box, top of page
    diagram_x = PAGE_W - MARGIN - 2.7 * inch
    diagram_y = y
    diagram_w = 2.5 * inch
    diagram_h = 2.5 * inch
    c.setFillColor(BRAND["panel"])
    c.setStrokeColor(BRAND["border"])
    c.setLineWidth(0.5)
    c.rect(diagram_x, diagram_y - diagram_h, diagram_w, diagram_h, fill=1, stroke=1)

    # Draw a schematic 5x5 grid with furnace at center
    grid_pad = 12
    grid_x0 = diagram_x + grid_pad
    grid_y0 = diagram_y - diagram_h + grid_pad
    grid_w = diagram_w - 2 * grid_pad
    cells = 7
    cell = grid_w / cells
    # outer 25x25 shaded blast area
    c.setFillColor(colors.HexColor("#3a1e12"))
    c.rect(grid_x0, grid_y0, grid_w, grid_w, fill=1, stroke=0)
    # grid lines
    c.setStrokeColor(BRAND["border"])
    c.setLineWidth(0.3)
    for i in range(cells + 1):
        c.line(grid_x0 + i * cell, grid_y0, grid_x0 + i * cell, grid_y0 + grid_w)
        c.line(grid_x0, grid_y0 + i * cell, grid_x0 + grid_w, grid_y0 + i * cell)
    # furnace at center
    cx = grid_x0 + 3 * cell + cell / 2
    cy = grid_y0 + 3 * cell + cell / 2
    c.setFillColor(BRAND["accent"])
    c.circle(cx, cy, cell * 0.35, fill=1, stroke=0)
    # rally leaders (N/S)
    c.setFillColor(BRAND["danger"])
    c.circle(grid_x0 + 3 * cell + cell / 2, grid_y0 + 4 * cell + cell / 2, cell * 0.22, fill=1, stroke=0)
    c.circle(grid_x0 + 3 * cell + cell / 2, grid_y0 + 2 * cell + cell / 2, cell * 0.22, fill=1, stroke=0)
    # assembly point outside blast (top-right corner-ish)
    c.setFillColor(BRAND["success"])
    c.circle(grid_x0 + 6 * cell + cell / 2, grid_y0 + 6 * cell + cell / 2, cell * 0.20, fill=1, stroke=0)
    # weak members adjacent
    c.setFillColor(BRAND["cold"])
    for dx, dy in [(2, 3), (4, 3), (3, 2), (3, 4)]:
        c.circle(grid_x0 + dx * cell + cell / 2, grid_y0 + dy * cell + cell / 2, cell * 0.14, fill=1, stroke=0)

    # legend
    lg_y = diagram_y - diagram_h - 10
    c.setFillColor(BRAND["text_mute"])
    c.setFont(body_font, 7)
    c.drawString(diagram_x, lg_y, tr("● Furnace  ● Rally leader  ● Weakest  ● Assembly", lang))

    # Body items on left side
    body_x = MARGIN
    body_w = diagram_x - MARGIN - 20
    for label, desc in CONTENT["p2_body"]:  # type: ignore
        c.setFillColor(BRAND["accent"])
        c.setFont(bold_font, 11)
        c.drawString(body_x, y, tr(label, lang))
        y -= 14
        y = draw_paragraph(
            c, tr(desc, lang), body_x, y, body_w,
            body_font, 9, BRAND["text"], leading=12, max_chars=64,
        )
        y -= 8

    draw_footer(c, fonts, lang)


def build_page_hq_table(c: canvas.Canvas, fonts, lang: str):
    reg, bold, kr = fonts
    body_font = kr if lang == "ko" else reg
    bold_font = kr if lang == "ko" else bold
    draw_bg(c)
    draw_header(c, "PAGE 3", tr("HQ-level to landing tier priority", lang), fonts)

    y = PAGE_H - MARGIN - 30
    c.setFillColor(BRAND["accent"])
    c.setFont(bold_font, 20)
    c.drawString(MARGIN, y, tr(CONTENT["p3_title"], lang))
    y -= 8
    draw_accent_band(c, y, w=60)
    y -= 26

    # intro
    y = draw_paragraph(
        c, tr(CONTENT["p3_intro"], lang), MARGIN, y,
        PAGE_W - 2 * MARGIN, body_font, 10, BRAND["text_dim"],
        leading=13, max_chars=95,
    )
    y -= 12

    # table
    col_widths = [0.9, 1.5, 1.6, 3.4]
    total_w = PAGE_W - 2 * MARGIN
    scale = total_w / sum(col_widths)
    col_widths = [w * scale for w in col_widths]

    header = [tr(h, lang) for h in CONTENT["p3_table_header"]]
    row_h = 22
    c.setFillColor(BRAND["accent"])
    c.rect(MARGIN, y - row_h, total_w, row_h, fill=1, stroke=0)
    c.setFillColor(BRAND["bg"])
    c.setFont(bold_font, 9)
    x = MARGIN + 6
    for i, cell in enumerate(header):
        c.drawString(x, y - 14, cell)
        x += col_widths[i]
    y -= row_h

    for i, row in enumerate(CONTENT["p3_table_rows"]):  # type: ignore
        bg = BRAND["panel"] if i % 2 == 0 else colors.HexColor("#0f1626")
        c.setFillColor(bg)
        c.rect(MARGIN, y - row_h, total_w, row_h, fill=1, stroke=0)
        c.setStrokeColor(BRAND["border"])
        c.setLineWidth(0.3)
        c.rect(MARGIN, y - row_h, total_w, row_h, fill=0, stroke=1)
        x = MARGIN + 6
        for j, cell in enumerate(row):
            if j == 0:
                c.setFillColor(BRAND["accent"])
                c.setFont(bold_font, 10)
            elif j == 1:
                c.setFillColor(BRAND["warm"])
                c.setFont(bold_font, 9)
            else:
                c.setFillColor(BRAND["text"])
                c.setFont(body_font, 9)
            c.drawString(x, y - 14, tr(cell, lang))
            x += col_widths[j]
        y -= row_h

    y -= 20
    # notes
    c.setFillColor(BRAND["accent"])
    c.setFont(bold_font, 11)
    c.drawString(MARGIN, y, tr("Notes:", lang))
    y -= 16
    c.setFillColor(BRAND["text"])
    c.setFont(body_font, 9)
    for note in CONTENT["p3_notes"]:  # type: ignore
        c.setFillColor(BRAND["accent"])
        c.drawString(MARGIN, y, "▸")
        y = draw_paragraph(
            c, tr(note, lang), MARGIN + 14, y,
            PAGE_W - 2 * MARGIN - 14, body_font, 9, BRAND["text"],
            leading=12, max_chars=95,
        )
        y -= 4

    draw_footer(c, fonts, lang)


def build_page_rally(c: canvas.Canvas, fonts, lang: str):
    reg, bold, kr = fonts
    body_font = kr if lang == "ko" else reg
    bold_font = kr if lang == "ko" else bold
    draw_bg(c)
    draw_header(c, "PAGE 4", tr("Rally leader placement — the 3-second window", lang), fonts)

    y = PAGE_H - MARGIN - 30
    c.setFillColor(BRAND["accent"])
    c.setFont(bold_font, 20)
    c.drawString(MARGIN, y, tr(CONTENT["p4_title"], lang))
    y -= 8
    draw_accent_band(c, y, w=60)
    y -= 26

    y = draw_paragraph(
        c, tr(CONTENT["p4_intro"], lang), MARGIN, y,
        PAGE_W - 2 * MARGIN, body_font, 10, BRAND["text_dim"],
        leading=13, max_chars=95,
    )
    y -= 12

    # boxed key facts
    c.setFillColor(BRAND["accent"])
    c.setFont(bold_font, 12)
    c.drawString(MARGIN, y, tr("Key facts:", lang))
    y -= 18

    for fact in CONTENT["p4_facts"]:  # type: ignore
        c.setFillColor(BRAND["panel"])
        c.setStrokeColor(BRAND["border"])
        # measure to compute box height
        lines = wrap_text(tr(fact, lang), 100)
        box_h = 8 + len(lines) * 12
        c.rect(MARGIN, y - box_h, PAGE_W - 2 * MARGIN, box_h, fill=1, stroke=1)
        c.setFillColor(BRAND["accent"])
        c.rect(MARGIN, y - box_h, 4, box_h, fill=1, stroke=0)
        c.setFillColor(BRAND["text"])
        c.setFont(body_font, 9)
        line_y = y - 6
        for line in lines:
            c.drawString(MARGIN + 12, line_y - 8, line)
            line_y -= 12
        y -= box_h + 6

    y -= 6
    # diagram note
    c.setFillColor(BRAND["text_dim"])
    c.setFont(body_font, 9)
    y = draw_paragraph(
        c, tr(CONTENT["p4_diagram_note"], lang), MARGIN, y,
        PAGE_W - 2 * MARGIN, body_font, 9, BRAND["text_dim"],
        leading=12, max_chars=100,
    )
    y -= 6

    # Simple furnace + rally leader schematic ring
    ring_r = 60
    cx = PAGE_W / 2
    cy = y - ring_r - 10

    # Draw a "5-tile safe distance" outer dashed circle
    c.setStrokeColor(BRAND["danger"])
    c.setLineWidth(1)
    c.setDash(3, 3)
    c.circle(cx, cy, ring_r + 20, stroke=1, fill=0)
    c.setDash()

    # Furnace glow
    c.setFillColor(BRAND["accent"])
    c.circle(cx, cy, 10, fill=1, stroke=0)
    # rally leaders N/S
    c.setFillColor(BRAND["danger"])
    c.circle(cx, cy + 18, 6, fill=1, stroke=0)
    c.circle(cx, cy - 18, 6, fill=1, stroke=0)
    # assembly outside blast
    c.setFillColor(BRAND["success"])
    c.circle(cx + ring_r + 32, cy + ring_r + 32, 7, fill=1, stroke=0)

    # labels
    c.setFillColor(BRAND["text_dim"])
    c.setFont(body_font, 8)
    c.drawCentredString(cx, cy - ring_r - 32, tr("Furnace  ·  Rally leaders adjacent  ·  Assembly outside 25×25 blast", lang))

    draw_footer(c, fonts, lang)


def build_page_build_order(c: canvas.Canvas, fonts, lang: str):
    reg, bold, kr = fonts
    body_font = kr if lang == "ko" else reg
    bold_font = kr if lang == "ko" else bold
    draw_bg(c)
    draw_header(c, "PAGE 5", tr("First 72 hours: build order & resource ratio", lang), fonts)

    y = PAGE_H - MARGIN - 30
    c.setFillColor(BRAND["accent"])
    c.setFont(bold_font, 20)
    c.drawString(MARGIN, y, tr(CONTENT["p5_title"], lang))
    y -= 8
    draw_accent_band(c, y, w=60)
    y -= 26

    y = draw_paragraph(
        c, tr(CONTENT["p5_intro"], lang), MARGIN, y,
        PAGE_W - 2 * MARGIN, body_font, 10, BRAND["text_dim"],
        leading=13, max_chars=95,
    )
    y -= 14

    # priority list
    c.setFillColor(BRAND["accent"])
    c.setFont(bold_font, 12)
    c.drawString(MARGIN, y, tr("Priority order:", lang))
    y -= 16
    for i, item in enumerate(CONTENT["p5_priority"], 1):  # type: ignore
        c.setFillColor(BRAND["accent"])
        c.setFont(bold_font, 10)
        c.drawString(MARGIN, y, f"{i}.")
        y = draw_paragraph(
            c, tr(item, lang), MARGIN + 16, y,
            PAGE_W - 2 * MARGIN - 16, body_font, 9, BRAND["text"],
            leading=12, max_chars=94,
        )
        y -= 4

    y -= 8

    # ratios table
    col_widths = [1.2, 3.3, 3.0]
    total_w = PAGE_W - 2 * MARGIN
    scale = total_w / sum(col_widths)
    col_widths = [w * scale for w in col_widths]

    header = [tr(h, lang) for h in CONTENT["p5_ratios_header"]]
    row_h = 20
    c.setFillColor(BRAND["accent"])
    c.rect(MARGIN, y - row_h, total_w, row_h, fill=1, stroke=0)
    c.setFillColor(BRAND["bg"])
    c.setFont(bold_font, 9)
    x = MARGIN + 6
    for i, cell in enumerate(header):
        c.drawString(x, y - 13, cell)
        x += col_widths[i]
    y -= row_h

    for i, row in enumerate(CONTENT["p5_ratios_rows"]):  # type: ignore
        bg = BRAND["panel"] if i % 2 == 0 else colors.HexColor("#0f1626")
        c.setFillColor(bg)
        c.rect(MARGIN, y - row_h, total_w, row_h, fill=1, stroke=0)
        c.setStrokeColor(BRAND["border"])
        c.setLineWidth(0.3)
        c.rect(MARGIN, y - row_h, total_w, row_h, fill=0, stroke=1)
        x = MARGIN + 6
        for j, cell in enumerate(row):
            if j == 0:
                c.setFillColor(BRAND["accent"])
                c.setFont(bold_font, 9)
            elif j == 2:
                c.setFillColor(BRAND["warm"])
                c.setFont(body_font, 8.5)
            else:
                c.setFillColor(BRAND["text"])
                c.setFont(body_font, 8.5)
            c.drawString(x, y - 13, tr(cell, lang))
            x += col_widths[j]
        y -= row_h

    y -= 14
    c.setFillColor(BRAND["accent"])
    c.setFont(bold_font, 11)
    c.drawString(MARGIN, y, tr("Notes:", lang))
    y -= 14
    for note in CONTENT["p5_notes"]:  # type: ignore
        c.setFillColor(BRAND["accent"])
        c.drawString(MARGIN, y, "▸")
        y = draw_paragraph(
            c, tr(note, lang), MARGIN + 14, y,
            PAGE_W - 2 * MARGIN - 14, body_font, 8.5, BRAND["text"],
            leading=11, max_chars=100,
        )
        y -= 3

    draw_footer(c, fonts, lang)


def build_page_screwed(c: canvas.Canvas, fonts, lang: str):
    reg, bold, kr = fonts
    body_font = kr if lang == "ko" else reg
    bold_font = kr if lang == "ko" else bold
    draw_bg(c)
    draw_header(c, "PAGE 6", tr("You're screwed if…", lang), fonts)

    y = PAGE_H - MARGIN - 30
    c.setFillColor(BRAND["danger"])
    c.setFont(bold_font, 20)
    c.drawString(MARGIN, y, tr(CONTENT["p6_title"], lang))
    y -= 8
    c.setFillColor(BRAND["danger"])
    c.rect(MARGIN, y, 60, 4, fill=1, stroke=0)
    y -= 20

    for i, (headline, body) in enumerate(CONTENT["p6_items"], 1):  # type: ignore
        # measure lines needed
        head_lines = wrap_text(f"{i}. {tr(headline, lang)}", 88)
        body_lines = wrap_text(tr(body, lang), 105)
        box_h = 10 + len(head_lines) * 13 + len(body_lines) * 11 + 6

        c.setFillColor(BRAND["panel"])
        c.setStrokeColor(BRAND["border"])
        c.setLineWidth(0.5)
        c.rect(MARGIN, y - box_h, PAGE_W - 2 * MARGIN, box_h, fill=1, stroke=1)
        # red stripe left
        c.setFillColor(BRAND["danger"])
        c.rect(MARGIN, y - box_h, 4, box_h, fill=1, stroke=0)

        # headline
        c.setFillColor(BRAND["danger"])
        c.setFont(bold_font, 10)
        line_y = y - 12
        for hl in head_lines:
            c.drawString(MARGIN + 12, line_y, hl)
            line_y -= 13
        # body
        c.setFillColor(BRAND["text"])
        c.setFont(body_font, 8.5)
        for bl in body_lines:
            c.drawString(MARGIN + 12, line_y, bl)
            line_y -= 11
        y -= box_h + 4

    draw_footer(c, fonts, lang)


def make_qr_image(url: str, size_px: int = 200) -> Optional[bytes]:
    if not qrcode:
        return None
    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=8,
        border=2,
    )
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="#c9a961", back_color="#0a0e1a")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


def build_back(c: canvas.Canvas, fonts, lang: str):
    reg, bold, kr = fonts
    body_font = kr if lang == "ko" else reg
    bold_font = kr if lang == "ko" else bold
    draw_bg(c)

    # gold band at top
    c.setFillColor(BRAND["accent"])
    c.rect(0, PAGE_H - 0.4 * inch, PAGE_W, 8, fill=1, stroke=0)

    # header brand
    c.setFillColor(BRAND["accent"])
    c.setFont(bold, 11)
    c.drawString(MARGIN, PAGE_H - MARGIN, "R5TOOLS.IO")

    y = PAGE_H * 0.75
    c.setFillColor(BRAND["accent"])
    c.setFont(bold_font, 26)
    c.drawCentredString(PAGE_W / 2, y, tr(CONTENT["back_title"], lang))
    y -= 30

    c.setFillColor(BRAND["text_dim"])
    y = draw_paragraph(
        c, tr(CONTENT["back_pitch"], lang), MARGIN + 30, y,
        PAGE_W - 2 * MARGIN - 60, body_font, 12, BRAND["text_dim"],
        leading=16, max_chars=75,
    )
    y -= 30

    # QR code centered
    qr_bytes = make_qr_image(CONTENT["back_url"])  # type: ignore
    if qr_bytes:
        qr_size = 1.8 * inch
        qr_x = (PAGE_W - qr_size) / 2
        c.drawImage(
            ImageReader(io.BytesIO(qr_bytes)),
            qr_x, y - qr_size,
            width=qr_size, height=qr_size,
            mask="auto",
        )
        y_after_qr = y - qr_size - 12
    else:
        y_after_qr = y - 20

    c.setFillColor(BRAND["text_dim"])
    c.setFont(body_font, 10)
    c.drawCentredString(PAGE_W / 2, y_after_qr, tr(CONTENT["back_qr_caption"], lang))
    c.setFillColor(BRAND["accent"])
    c.setFont(body_font, 9)
    c.drawCentredString(PAGE_W / 2, y_after_qr - 14, CONTENT["back_url"])  # type: ignore

    # bottom CTA panel
    panel_h = 90
    panel_y = MARGIN + 20
    c.setFillColor(BRAND["panel"])
    c.setStrokeColor(BRAND["accent_dim"])
    c.setLineWidth(1)
    c.rect(MARGIN, panel_y, PAGE_W - 2 * MARGIN, panel_h, fill=1, stroke=1)
    c.setFillColor(BRAND["accent"])
    c.setFont(bold_font, 14)
    c.drawCentredString(PAGE_W / 2, panel_y + panel_h - 22, tr(CONTENT["back_cta_title"], lang))
    c.setFillColor(BRAND["text"])
    c.setFont(body_font, 11)
    c.drawCentredString(PAGE_W / 2, panel_y + panel_h - 42, tr(CONTENT["back_cta_body"], lang))
    # KR note: pick the localized string, and render in Korean-capable font
    # regardless of current lang so the Hangul in the EN back cover renders too.
    kr_note = CONTENT["back_kr_note_ko"] if lang == "ko" else CONTENT["back_kr_note_en"]
    c.setFillColor(BRAND["text_mute"])
    # Use KR font when the string contains Hangul; else the body font.
    has_hangul = any("가" <= ch <= "힣" for ch in kr_note)
    note_font = kr if has_hangul and kr else body_font
    c.setFont(note_font, 9)
    c.drawCentredString(PAGE_W / 2, panel_y + panel_h - 58, kr_note)
    c.setFillColor(BRAND["accent"])
    c.setFont(bold_font, 10)
    c.drawCentredString(PAGE_W / 2, panel_y + 12, "r5tools.io")


# =============================================================================
# Main renderer
# =============================================================================
def build_pdf(out_path: Path, lang: str = "en") -> Path:
    fonts = register_fonts()
    c = canvas.Canvas(str(out_path), pagesize=LETTER)
    c.setTitle(tr(CONTENT["cover_title"], lang))
    c.setAuthor("R5TOOLS.IO")
    c.setSubject("Last War: Survival — Season 2 Landing Cheat Sheet")
    c.setKeywords(["Last War Survival", "Season 2", "Polar Storm", "R5", "alliance"])

    build_cover(c, fonts, lang)
    c.showPage()
    build_page_4coords(c, fonts, lang)
    c.showPage()
    build_page_hq_table(c, fonts, lang)
    c.showPage()
    build_page_rally(c, fonts, lang)
    c.showPage()
    build_page_build_order(c, fonts, lang)
    c.showPage()
    build_page_screwed(c, fonts, lang)
    c.showPage()
    build_back(c, fonts, lang)
    c.showPage()

    c.save()
    return out_path


def main():
    print(f"Building EN cheat sheet -> {OUT_EN.name}")
    build_pdf(OUT_EN, lang="en")
    size_en = OUT_EN.stat().st_size
    print(f"  OK   {OUT_EN}  ({size_en/1024:.1f} KB)")

    print(f"Building KR cheat sheet -> {OUT_KO.name}")
    build_pdf(OUT_KO, lang="ko")
    size_ko = OUT_KO.stat().st_size
    print(f"  OK   {OUT_KO}  ({size_ko/1024:.1f} KB)")

    total = (size_en + size_ko) / 1024
    print(f"\nTotal: {total:.1f} KB across both PDFs.")

    if not qrcode:
        print("  NOTE: qrcode not installed — QR code omitted. `pip install qrcode` to enable.")


if __name__ == "__main__":
    main()
