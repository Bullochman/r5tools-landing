#!/usr/bin/env python3
"""
kr_translate_pages.py — mirror the SEO farm to /ko/ using a glossary-driven
static translator. No paid API required.

Strategy
--------
1. Walk every English SEO page under seasons/ heroes/ buildings/ events/
   warzones/ guides/ glossary/.
2. Rewrite meta / nav / CTA / breadcrumb / section-heading strings using a
   curated Korean phrase table built from the LWS_Knowledge_Base glossary +
   hand-authored template phrases.
3. Preserve every URL, JSON-LD structure, canonical link, and article HTML.
4. Change <html lang="en"> to <html lang="ko">, add hreflang cross-links on
   both KR and EN pages, and add a small "auto-translated" notice with a link
   back to the English original.
5. Add lang-switcher pill in the top nav so KR readers can jump back.
6. Emit each page to /ko/<same-path>.

Optional: if ANTHROPIC_API_KEY is set, use the SDK to translate long article
paragraphs (fall back to the glossary-substituted English text otherwise).
This keeps the run entirely offline by default.

Then update sitemap.xml with every KR URL + <xhtml:link rel="alternate"
hreflang="ko"/> pointers on the existing EN entries.
"""

from __future__ import annotations

import argparse
import html as htmllib
import json
import re
import shutil
import sys
from pathlib import Path
from typing import Dict, List, Tuple

REPO = Path(__file__).resolve().parent
KB_GLOSSARY = REPO.parent / "LWS_Knowledge_Base" / "kb" / "15-glossary.md"
KO_ROOT = REPO / "ko"
SITE = "https://r5tools.io"

SECTIONS = ["seasons", "heroes", "buildings", "events", "warzones", "guides", "glossary"]


# ---------------------------------------------------------------------------
# Glossary: parse KB 15-glossary.md into a KR-first term dictionary
# ---------------------------------------------------------------------------

def load_kb_glossary() -> Dict[str, str]:
    """Parse the KB glossary; return {english_phrase: korean_phrase}.
    Only pulls from the '## KR ↔ EN terminology' section — that's the sole
    location where cell[0]=KR, cell[1]=EN. Numeric anchors table and other
    tables use different column semantics."""
    out: Dict[str, str] = {}
    if not KB_GLOSSARY.exists():
        return out
    inside_glossary = False
    for line in KB_GLOSSARY.read_text(encoding="utf-8").splitlines():
        stripped = line.strip()
        if stripped.startswith("## KR ↔ EN terminology"):
            inside_glossary = True
            continue
        if inside_glossary and stripped.startswith("## ") and "terminology" not in stripped:
            # left the glossary block
            break
        if not inside_glossary:
            continue
        line = stripped
        if not line.startswith("|") or line.startswith("|---") or line.startswith("|:") :
            continue
        cells = [c.strip() for c in line.strip("|").split("|")]
        if len(cells) < 2:
            continue
        kr, en = cells[0], cells[1]
        if kr.lower() in {"한국어", "korean"} or en.lower() in {"english"}:
            continue
        # Handle multi-alt terms: split on " / " and register each variant
        en_variants = [x.strip() for x in re.split(r"\s*/\s*", en) if x.strip()]
        kr_primary = kr.split("/")[0].strip() if "/" in kr else kr
        for e in en_variants:
            # strip parenthetical
            core = re.sub(r"\s*\(.*?\)\s*", "", e).strip()
            if not core:
                continue
            # skip if english side looks like a KR literal or contains hangul
            if any("가" <= ch <= "힣" for ch in core):
                continue
            # skip 1-2 char abbreviations that would cause aggressive substitution
            if len(core) <= 2:
                continue
            # skip words that would obviously conflict with common English
            # (words that appear in HTML boilerplate or aren't game-specific)
            if core.lower() in {"category", "name", "notes", "block", "reference"}:
                continue
            out.setdefault(core, kr_primary)
    return out


# ---------------------------------------------------------------------------
# Hand-authored template + high-frequency phrase table.
# These override the KB glossary when there's overlap.
# ---------------------------------------------------------------------------

BOILERPLATE: Dict[str, str] = {
    # nav / suite
    "Home": "홈",
    "Roster Extractor": "로스터 추출기",
    "Hive Planner": "하이브 플래너",
    "Season Timeline": "시즌 타임라인",
    "Landing Planner": "랜딩 플래너",
    "Heat Sim": "히트 시뮬레이터",
    "Freeze Risk": "동결 리스크",
    "Coal Burn Calculator": "석탄 소비 계산기",
    "Coal Burn": "석탄 소비",
    "City Capture": "도시 점령",
    "Heat Simulator": "히트 시뮬레이터",
    "Freeze Risk Calculator": "동결 리스크 계산기",
    # breadcrumb hubs
    "Heroes": "히어로",
    "Buildings": "건물",
    "Seasons": "시즌",
    "Events": "이벤트",
    "Warzones": "워존",
    "Guides": "가이드",
    "Glossary": "용어집",
    "Breadcrumb": "이동 경로",
    # CTA card
    "Try free with code": "이 코드로 무료 체험",
    "All R5TOOLS.IO planners unlock instantly for Warzone 2007 members — no signup, no payment.":
        "R5TOOLS.IO의 모든 플래너는 워존 2007 소속 얼라이언스 회원에게 즉시 잠금 해제됩니다 — 가입 불필요, 결제 불필요.",
    "Unlock your alliance →": "우리 얼라이언스 잠금 해제 →",
    "Bring this into your alliance chat": "얼라이언스 채팅에 바로 공유",
    "Every R5TOOLS.IO planner exports Discord-ready PNGs, roster CSVs, and share links.":
        "R5TOOLS.IO의 모든 플래너는 Discord용 PNG, 로스터 CSV, 공유 링크로 즉시 내보낼 수 있습니다.",
    "Get started free →": "지금 무료로 시작 →",
    # footer
    "Part of the": "다음 툴 세트의 일부입니다:",
    "Last War: Survival alliance toolkit.": "라스트 워: 서바이벌 얼라이언스 도구.",
    "Fan-made · unaffiliated with First Fun / Century Games.":
        "팬 제작 · First Fun / Century Games와 무관합니다.",
    "Terms": "이용약관",
    "Privacy": "개인정보처리방침",
    # beta pill
    "Beta · feedback": "베타 · 피드백",
    # common h3 section headings that repeat across every page bucket
    "Quick facts": "요약 정보",
    "Definition": "정의",
    "Notes": "메모",
    "Where R5s use this term": "R5가 이 용어를 쓰는 곳",
    "In the meta (2026 sourced excerpts)": "메타 현황 (2026 출처 발췌)",
    "R5 planning quick links": "R5 기획 퀵링크",
    "Alliance leaderboard": "얼라이언스 리더보드",
    "Warzone lookup": "워존 조회",
    "What's active in": "현재 진행 중",
    "What&#x27;s active in": "현재 진행 중",
    "Warzone": "워존",
    "Season": "시즌",
    "Hero": "히어로",
    "Building": "건물",
    "Event": "이벤트",
    "Guide": "가이드",
    "Category": "카테고리",
    "English": "영어",
    "Politics": "정치",
    "Resource": "자원",
    "Item": "아이템",
    "Currency": "재화",
    "Slang": "슬랭",
    "Skill": "스킬",
    "Meta": "메타",
    "Publisher": "퍼블리셔",
    "R4 title": "R4 직책",
    "S1 role": "S1 역할",
    "Recommended": "권장",
    "Rarity": "희귀도",
    "Type": "유형",
    "Squad slot preference": "부대 슬롯 선호",
    "front row": "전열",
    "back row": "후열",
    "Milestone": "마일스톤",
    "Cumulative": "누적",
    "Effect": "효과",
    "Unlock": "해금",
    # h1 tokens
    "UR Tank": "UR 탱크",
    "UR Aircraft": "UR 항공기",
    "UR Missile": "UR 미사일",
    "SSR Tank": "SSR 탱크",
    "SSR Aircraft": "SSR 항공기",
    "SSR Missile": "SSR 미사일",
    "SR Tank": "SR 탱크",
    "SR Aircraft": "SR 항공기",
    "SR Missile": "SR 미사일",
    # LWS canonical (superset of KB)
    "Last War: Survival": "라스트 워: 서바이벌",
    "Last War Survival": "라스트 워 서바이벌",
    "Last War glossary": "라스트 워 용어집",
    "LWS term": "LWS 용어",
    "Korean": "한국어",
    "alliance": "얼라이언스",
    "Alliance": "얼라이언스",
    "warlord": "워로드",
    "Warlord": "워로드",
    "hive": "하이브",
    "Hive": "하이브",
    "hive grid": "하이브 그리드",
    "warzone": "워존",
    "rally": "랠리",
    "Alliance Furnace": "얼라이언스 화로",
    "Home Heating Furnace": "개인 난로",
    "HHF": "HHF",
    "Warlord Missile": "워로드 미사일",
    "Rare Soil War": "희귀 토양 전쟁",
    "Spice Wars": "향신료 전쟁",
    "Copper Wars": "구리 전쟁",
    "Blood Night": "블러드 나이트",
    "Doomsday": "둠스데이",
    "Corruptor Boss": "부패자 보스",
    "Zombie Siege": "좀비 시즈",
    "Zombie Invasion": "좀비 인베이전",
    "Ghost Ops": "고스트 옵스",
    "VS Days": "VS 데이",
    "Alliance Duel": "얼라이언스 듀얼",
    "Wall of Honor": "명예의 벽",
    "Crimson Plague": "크림슨 플레이그",
    "Polar Storm": "폴라 스톰",
    "Golden Kingdom": "골든 킹덤",
    "Evernight Isle": "에버나이트 아일",
    "Wild West": "와일드 웨스트",
    "Shadow Rainforest": "그림자 열대우림",
    "Lost Rainforest": "잃어버린 열대우림",
    "Chief": "치프",
    "Headquarters": "본부",
    "Tank": "탱크",
    "Aircraft": "항공기",
    "Missile": "미사일",
    "Missile Vehicle": "미사일 차량",
    "Wounded": "부상",
    "Killed": "사망",
    "Hospital": "병원",
    "Emergency Center": "응급 센터",
    "ICU": "응급 센터 (ICU)",
    "Barracks": "병영",
    "Tank Center": "탱크 센터",
    "Aircraft Center": "항공기 센터",
    "Missile Center": "미사일 발사대",
    "Drill Grounds": "연병장",
    "Tech Center": "과학 센터",
    "Research Center": "과학 센터",
    "Alliance Center": "연맹 센터",
    "Wall": "방벽",
    "Radar": "레이더",
    "Farm": "농장",
    "Iron Mine": "철광",
    "Gold Mine": "골드 광산",
    "Oil Rig": "오일 시추기",
    "Tavern": "술집",
    "Drone Center": "드론 센터",
    "Armament Institute": "무기 연구소",
    "Material Workshop": "재료 공방",
    "Gear Factory": "장비 공장",
    "Arsenal": "무기고",
    "Recon Plane": "정찰기",
    "Missile Silo": "미사일 사일로",
    "Tower of Victory": "승리의 탑",
    "Blessing Fountain": "축복의 샘",
    "Lighthouse": "등대",
    "Ancestral Temple": "조상 사원",
    "Military Stronghold": "요새",
    "Capital": "수도",
    "Capitol": "수도",
    "Dig Site": "채굴장",
    # events
    "Arms Race": "무기 경쟁",
    "Arena": "아레나",
    "Cross-Server War": "크로스서버 전쟁",
    "Kingdom vs Kingdom": "왕국 대 왕국",
    "KvK": "왕국 대 왕국",
    "SvS": "서버 대 서버",
    "Rally": "랠리",
    # ranks
    "R5": "R5",
    "R4": "R4",
    "R3": "R3",
    "R2": "R2",
    "R1": "R1",
    "Leader": "연맹장",
    "Officer": "임원",
    "Veteran": "베테랑",
    "Elite": "엘리트",
    "Member": "멤버",
    "Recruiter": "모집관",
    "Muse": "여신",
    "Butler": "집사",
    # meta-page phrase table for CTA/notice
    "Auto-translated. View the English original.":
        "자동 번역되었습니다. 영문 원본 보기.",
    "Try the R5TOOLS.IO planner suite in Korean —":
        "R5TOOLS.IO 플래너 세트를 한국어로 사용해 보세요 —",
}


# Article body: sentence-level phrase table for the recurring boilerplate that
# appears verbatim in the warzone/hero/season/building/event/guide templates.
BODY_PHRASES: Dict[str, str] = {
    "Every LWS warzone runs its own season timeline.":
        "모든 LWS 워존은 자체 시즌 타임라인으로 운영됩니다.",
    "may be on Season 2 Polar Storm, Season 3 Golden Kingdom, or a later cycle":
        "시즌 2 폴라 스톰, 시즌 3 골든 킹덤 또는 이후 시즌 중 하나를 진행할 수 있습니다",
    "set your warzone on the": "다음에서 워존을 설정하고",
    "and every planner reads your active season, week, and next milestone from a shared config.":
        "모든 플래너가 공유 설정에서 현재 시즌, 주차, 다음 마일스톤을 읽어옵니다.",
    "upload an alliance-list screen recording and get a CSV + power-over-time chart.":
        "얼라이언스 멤버 리스트 화면 녹화를 업로드하면 CSV와 파워 추이 차트를 얻을 수 있습니다.",
    "place your alliance's hive around the Alliance Furnace / Machine-Gun grid with the correct S2/S3/S4 formation.":
        "얼라이언스 화로 / 기관총 그리드 주변에 S2/S3/S4에 맞는 정확한 진형으로 하이브를 배치합니다.",
    "place your alliance&#x27;s hive around the Alliance Furnace / Machine-Gun grid with the correct S2/S3/S4 formation.":
        "얼라이언스 화로 / 기관총 그리드 주변에 S2/S3/S4에 맞는 정확한 진형으로 하이브를 배치합니다.",
    "per-member task checklist for the active season.":
        "현재 시즌의 멤버별 작업 체크리스트.",
    "rank-tier ring assignment for landing day.":
        "랜딩 데이 랭크별 링 배치.",
    "HHF + Alliance Furnace coal budget by week.":
        "주차별 HHF + 얼라이언스 화로 석탄 예산.",
    "R5TOOLS.IO does not scrape live warzone leaderboards.":
        "R5TOOLS.IO는 라이브 워존 리더보드를 스크래핑하지 않습니다.",
    "Upload your alliance's member list to the":
        "얼라이언스 멤버 리스트를 다음에 업로드하세요:",
    "Upload your alliance&#x27;s member list to the":
        "얼라이언스 멤버 리스트를 다음에 업로드하세요:",
    "to build a private, timestamped leaderboard for your alliance's top 100.":
        "얼라이언스 상위 100명의 비공개, 타임스탬프 리더보드를 생성합니다.",
    "to build a private, timestamped leaderboard for your alliance&#x27;s top 100.":
        "얼라이언스 상위 100명의 비공개, 타임스탬프 리더보드를 생성합니다.",
    "Warzone IDs are the container LWS uses to run cross-server war.":
        "워존 ID는 LWS가 크로스서버 전쟁을 운영하는 데 사용하는 컨테이너입니다.",
    "Every warzone contains ~8 servers.":
        "각 워존에는 약 8개 서버가 포함됩니다.",
    "When your warzone reaches Cross-Server War Rally, the top-32 warzone gate determines Alliance Duel matchmaking above League level.":
        "워존이 크로스서버 워 랠리에 도달하면 상위 32위 워존 게이트가 리그 이상의 얼라이언스 듀얼 매치메이킹을 결정합니다.",
    "runs its own Last War: Survival season timeline.":
        "자체 라스트 워: 서바이벌 시즌 타임라인을 실행합니다.",
    "Every R5TOOLS.IO planner accepts a warzone override — set warzone":
        "모든 R5TOOLS.IO 플래너는 워존 오버라이드를 지원합니다 — 워존",
    "once and every tool tracks your alliance's active season, week, and next milestone.":
        "을(를) 한 번 설정하면 모든 도구가 얼라이언스의 현재 시즌, 주차, 다음 마일스톤을 추적합니다.",
    "once and every tool tracks your alliance&#x27;s active season, week, and next milestone.":
        "을(를) 한 번 설정하면 모든 도구가 얼라이언스의 현재 시즌, 주차, 다음 마일스톤을 추적합니다.",
    "shows up across the R5TOOLS.IO planners — check the Season Timeline and Roster Extractor to see it in context.":
        "R5TOOLS.IO 플래너 곳곳에 등장합니다 — 시즌 타임라인과 로스터 추출기에서 실제 사용 예를 확인하세요.",
    "in Last War: Survival — alliance tools, season timeline, roster extractor, and R5 planning for your warzone.":
        "라스트 워: 서바이벌 워존을 위한 얼라이언스 도구, 시즌 타임라인, 로스터 추출기 및 R5 기획 리소스.",
    "Community term used across R5 alliance planning.":
        "R5 얼라이언스 기획 전반에서 쓰이는 커뮤니티 용어입니다.",
    "in Last War: Survival.": "— 라스트 워: 서바이벌.",
    "Glossary block": "용어집 블록",
    "guide index": "가이드 인덱스",
    "Every planning topic an R5 or R4 opens the night before a season starts.":
        "시즌 시작 전날 밤 R5 또는 R4가 열어보는 모든 기획 주제.",
    "Every Korean ↔ English term used by Last War: Survival alliance leaders.":
        "라스트 워: 서바이벌 얼라이언스 리더가 사용하는 모든 한국어 ↔ 영어 용어.",
    "every KR ↔ EN term": "모든 한국어 ↔ 영어 용어",
    "Every Last War: Survival community term with Korean and English translations — heroes, buildings, ranks, events, and R5 slang.":
        "라스트 워: 서바이벌 커뮤니티 용어를 한국어와 영어로 모두 정리 — 히어로, 건물, 랭크, 이벤트, R5 슬랭.",
}


def build_dictionary() -> Dict[str, str]:
    """Merge KB glossary + BOILERPLATE + BODY_PHRASES. Longer keys first."""
    merged: Dict[str, str] = {}
    kb = load_kb_glossary()
    merged.update(kb)
    merged.update(BOILERPLATE)
    merged.update(BODY_PHRASES)
    # Return sorted so we substitute long keys before short ones
    return dict(sorted(merged.items(), key=lambda kv: -len(kv[0])))


# ---------------------------------------------------------------------------
# HTML translation
# ---------------------------------------------------------------------------

# Common metadata pattern rewrites (regex-based)
META_PATTERNS: List[Tuple[re.Pattern, str]] = [
    # "Warzone 1001 — LWS alliance leaderboard + tools" → title pattern
    (re.compile(r"— LWS alliance leaderboard \+ tools"), "— LWS 얼라이언스 리더보드 + 도구"),
    (re.compile(r"— LWS term"), "— LWS 용어"),
    (re.compile(r"\| R5TOOLS\.IO"), "| R5TOOLS.IO"),
    # meta-desc noise fixes
    (re.compile(r"tools?,?\s*season timeline,?\s*roster extractor,?\s*and R5 planning for your warzone\."),
     "도구, 시즌 타임라인, 로스터 추출기, R5 기획 리소스."),
    (re.compile(r"\bR5 planning\b"), "R5 기획"),
    (re.compile(r"\balliance strategy\b"), "얼라이언스 전략"),
    (re.compile(r"\bLast War strategy\b"), "라스트 워 전략"),
    (re.compile(r"\bLast War\b(?![\s\-]?(?:Survival|:))"), "라스트 워"),
    # Common category words
    (re.compile(r"\bhero build\b"), "히어로 빌드"),
    (re.compile(r"\bleaderboard\b"), "리더보드"),
    (re.compile(r"\bfull weekly \+ seasonal schedule\b"), "주간 + 시즌 전체 일정"),
    (re.compile(r"\bevery .+? topic\b"), "모든 주제"),
    (re.compile(r"\bevents?\b"), "이벤트"),
    (re.compile(r"\bguides?\b"), "가이드"),
    (re.compile(r"\bplanning\b"), "기획"),
    (re.compile(r"\bstrategy\b"), "전략"),
    (re.compile(r"\btools?\b"), "도구"),
    (re.compile(r"\bcooldowns?\b"), "쿨다운"),
    (re.compile(r"\btimeline\b"), "타임라인"),
    (re.compile(r"\balliance\b", re.IGNORECASE), "얼라이언스"),
    (re.compile(r"\bwarzones?\b", re.IGNORECASE), "워존"),
    (re.compile(r"\bseasons?\b", re.IGNORECASE), "시즌"),
    (re.compile(r"\bheroes?\b", re.IGNORECASE), "히어로"),
    (re.compile(r"\bbuildings?\b", re.IGNORECASE), "건물"),
]


def translate_text(text: str, dic: Dict[str, str]) -> str:
    """Substitute known English phrases with Korean, leaving unknown text alone."""
    out = text
    for en, kr in dic.items():
        if en in out:
            out = out.replace(en, kr)
    return out


# Regex that matches all HTML text nodes (content outside tags).
# We'll replace each text node with a translated version.
TEXT_NODE_RE = re.compile(r">([^<]+)<")


def translate_html_body(html: str, dic: Dict[str, str]) -> str:
    """Translate visible text between tags. Preserves URLs and attributes."""
    def repl(m: re.Match) -> str:
        raw = m.group(1)
        if not raw.strip():
            return m.group(0)
        translated = translate_text(raw, dic)
        return f">{translated}<"
    return TEXT_NODE_RE.sub(repl, html)


def translate_meta_content(html: str, dic: Dict[str, str]) -> str:
    """Translate content="..." on meta / title-ish tags."""
    def repl(m: re.Match) -> str:
        attr_prefix, content, attr_suffix = m.group(1), m.group(2), m.group(3)
        translated = translate_text(content, dic)
        for pat, sub in META_PATTERNS:
            translated = pat.sub(sub, translated)
        return f'{attr_prefix}"{translated}"{attr_suffix}'
    # meta name/property content and og image alts etc.
    return re.sub(
        r'((?:name|property|itemprop)="[^"]+"\s+content=)"([^"]*)"(\s*/?>)',
        repl,
        html,
    )


def translate_title_tag(html: str, dic: Dict[str, str]) -> str:
    def repl(m: re.Match) -> str:
        inner = translate_text(m.group(1), dic)
        for pat, sub in META_PATTERNS:
            inner = pat.sub(sub, inner)
        return f"<title>{inner}</title>"
    return re.sub(r"<title>([^<]*)</title>", repl, html)


STRUCTURAL_JSON_KEYS = {
    "@type", "@context", "@id", "@graph", "type", "url", "item", "image",
    "logo", "mainEntityOfPage", "position",
}


def translate_json_ld(html: str, dic: Dict[str, str]) -> str:
    """Translate 'name' / 'headline' / 'description' fields inside JSON-LD blocks.
    Never touches @type/@context/URLs — those are structural and must stay ASCII."""
    def repl_block(m: re.Match) -> str:
        raw = m.group(1)
        try:
            data = json.loads(raw)
        except Exception:
            return m.group(0)

        def walk(node):
            if isinstance(node, dict):
                for k, v in list(node.items()):
                    if k in STRUCTURAL_JSON_KEYS:
                        # recurse into @graph but skip translation on the values
                        if k == "@graph":
                            walk(v)
                        continue
                    if k in {"name", "headline", "description"} and isinstance(v, str):
                        node[k] = translate_text(v, dic)
                        for pat, sub in META_PATTERNS:
                            node[k] = pat.sub(sub, node[k])
                    elif k == "inLanguage":
                        node[k] = "ko"
                    else:
                        walk(v)
            elif isinstance(node, list):
                for item in node:
                    walk(item)
        walk(data)
        return f'<script type="application/ld+json">{json.dumps(data, ensure_ascii=False)}</script>'
    return re.sub(
        r'<script type="application/ld\+json">(.+?)</script>',
        repl_block,
        html,
        flags=re.DOTALL,
    )


def add_hreflang_ko_link(html: str, en_url: str, ko_url: str) -> str:
    """Inject hreflang alternate links under <link rel="canonical" ...>."""
    hreflang = (
        f'\n<link rel="alternate" hreflang="en" href="{en_url}">'
        f'\n<link rel="alternate" hreflang="ko" href="{ko_url}">'
        f'\n<link rel="alternate" hreflang="x-default" href="{en_url}">'
    )
    return re.sub(
        r'(<link rel="canonical" href="[^"]*">)',
        r"\1" + hreflang,
        html,
        count=1,
    )


def switch_canonical(html: str, ko_url: str) -> str:
    return re.sub(
        r'<link rel="canonical" href="[^"]*">',
        f'<link rel="canonical" href="{ko_url}">',
        html,
        count=1,
    )


def switch_og_url(html: str, ko_url: str) -> str:
    return re.sub(
        r'(<meta property="og:url" content=)"[^"]*"',
        rf'\1"{ko_url}"',
        html,
        count=1,
    )


def switch_html_lang(html: str) -> str:
    return re.sub(r'<html lang="[^"]*">', '<html lang="ko">', html, count=1)


def inject_lang_pill(html: str, en_url: str) -> str:
    """Add a small EN/KR language pill inside the suite-nav.
    Also injects an 'auto-translated' notice under the H1."""
    lang_pill = (
        '  <a href="' + en_url + '" hreflang="en" rel="alternate" '
        'style="border-color:#c9a961;color:#c9a961;">EN</a>\n'
    )
    html = re.sub(
        r'(<nav class="suite-nav"[^>]*>\s*)',
        r"\1" + lang_pill,
        html,
        count=1,
    )
    # Auto-translation notice
    notice = (
        f'\n  <p style="font-size:12px;color:var(--text-mute);'
        f'margin:4px 0 12px;padding:6px 10px;border-left:2px solid var(--accent);'
        f'background:var(--panel);border-radius:4px;">'
        f'자동 번역되었습니다. '
        f'<a href="{en_url}" style="color:var(--text-dim);text-decoration:underline;">'
        f'영문 원본 보기 →</a></p>\n'
    )
    html = re.sub(r"(<h1[^>]*>.*?</h1>)", r"\1" + notice, html, count=1, flags=re.DOTALL)
    return html


def _stash_scripts_and_styles(html: str) -> Tuple[str, Dict[str, str]]:
    """Replace <script>...</script>, <style>...</style>, and <pre><code>...</code></pre>
    with placeholders so body translation doesn't corrupt their contents."""
    stash: Dict[str, str] = {}
    counter = [0]

    def store(match: re.Match) -> str:
        key = f"__STASH_{counter[0]}__"
        counter[0] += 1
        stash[key] = match.group(0)
        return f">{key}<"

    # order matters — do the longer/nested ones first
    html = re.sub(r"<script\b[^>]*>.*?</script>", store, html, flags=re.DOTALL)
    html = re.sub(r"<style\b[^>]*>.*?</style>", store, html, flags=re.DOTALL)
    html = re.sub(r"<pre>.*?</pre>", store, html, flags=re.DOTALL)
    return html, stash


def _restore_stash(html: str, stash: Dict[str, str]) -> str:
    for key, val in stash.items():
        html = html.replace(f">{key}<", val)
    return html


def _strip_prior_hreflang_and_pills(html: str) -> str:
    """Remove any previously-injected hreflang links and language pills so the
    KR page starts from a clean slate (idempotent re-runs)."""
    # remove hreflang alternate <link> lines
    html = re.sub(r'\n?<link rel="alternate" hreflang="[^"]*" href="[^"]*">', "", html)
    # remove the language pill lines (EN and KR pills injected by inject_lang_pill)
    html = re.sub(
        r'  <a href="[^"]*" hreflang="(?:en|ko)" rel="alternate" style="border-color:#c9a961;color:#c9a961;">(?:EN|한국어)</a>\n',
        "",
        html,
    )
    # remove the auto-translated notice
    html = re.sub(
        r'\n  <p style="font-size:12px;color:var\(--text-mute\);[^"]*">\s*자동 번역되었습니다\..*?</p>\n',
        "",
        html,
        flags=re.DOTALL,
    )
    return html


def translate_page(en_html: str, ko_url: str, en_url: str, dic: Dict[str, str]) -> str:
    """Full HTML-page translation pipeline."""
    h = _strip_prior_hreflang_and_pills(en_html)
    h = switch_html_lang(h)
    h = translate_title_tag(h, dic)
    h = translate_meta_content(h, dic)
    h = translate_json_ld(h, dic)
    # Stash scripts/styles/pre so body translator doesn't touch them
    h, stash = _stash_scripts_and_styles(h)
    h = translate_html_body(h, dic)
    h = _restore_stash(h, stash)
    h = switch_canonical(h, ko_url)
    h = switch_og_url(h, ko_url)
    h = add_hreflang_ko_link(h, en_url, ko_url)
    h = inject_lang_pill(h, en_url)
    return h


def add_hreflang_to_en(en_html: str, en_url: str, ko_url: str) -> str:
    """On the English side, add hreflang alternates + a Korean pill."""
    # skip if we already added it
    if 'hreflang="ko"' in en_html:
        return en_html
    hreflang = (
        f'\n<link rel="alternate" hreflang="en" href="{en_url}">'
        f'\n<link rel="alternate" hreflang="ko" href="{ko_url}">'
        f'\n<link rel="alternate" hreflang="x-default" href="{en_url}">'
    )
    en_html = re.sub(
        r'(<link rel="canonical" href="[^"]*">)',
        r"\1" + hreflang,
        en_html,
        count=1,
    )
    # add KR pill to suite-nav
    lang_pill = (
        '  <a href="' + ko_url + '" hreflang="ko" rel="alternate" '
        'style="border-color:#c9a961;color:#c9a961;">한국어</a>\n'
    )
    en_html = re.sub(
        r'(<nav class="suite-nav"[^>]*>\s*)',
        r"\1" + lang_pill,
        en_html,
        count=1,
    )
    return en_html


# ---------------------------------------------------------------------------
# Page discovery + writing
# ---------------------------------------------------------------------------

def all_en_pages() -> List[Path]:
    out: List[Path] = []
    for sect in SECTIONS:
        d = REPO / sect
        if not d.exists():
            continue
        for f in sorted(d.glob("*.html")):
            out.append(f)
    return out


def rel_url_from_repo(p: Path) -> str:
    rel = p.relative_to(REPO).as_posix()
    return f"{SITE}/{rel}"


def ko_path_for(en_path: Path) -> Path:
    rel = en_path.relative_to(REPO)
    return KO_ROOT / rel


def ko_url_for(en_path: Path) -> str:
    rel = en_path.relative_to(REPO).as_posix()
    return f"{SITE}/ko/{rel}"


def process_all(dic: Dict[str, str], limit: int = 0, dry_run: bool = False) -> Tuple[int, List[Path]]:
    pages = all_en_pages()
    if limit:
        pages = pages[:limit]
    processed: List[Path] = []
    for i, en_path in enumerate(pages, 1):
        en_html = en_path.read_text(encoding="utf-8")
        en_url = rel_url_from_repo(en_path)
        ko_url = ko_url_for(en_path)
        ko_html = translate_page(en_html, ko_url, en_url, dic)
        ko_out = ko_path_for(en_path)
        if not dry_run:
            ko_out.parent.mkdir(parents=True, exist_ok=True)
            ko_out.write_text(ko_html, encoding="utf-8")
            # also add hreflang cross-link on the EN page
            en_html_with_hreflang = add_hreflang_to_en(en_html, en_url, ko_url)
            if en_html_with_hreflang != en_html:
                en_path.write_text(en_html_with_hreflang, encoding="utf-8")
        processed.append(en_path)
        if i % 50 == 0 or i == len(pages):
            print(f"  translated {i}/{len(pages)}", file=sys.stderr)
    return len(processed), processed


# ---------------------------------------------------------------------------
# Sitemap rewrite
# ---------------------------------------------------------------------------

def rewrite_sitemap(processed: List[Path]) -> int:
    """Rewrite sitemap.xml to include KR URLs + xhtml:link alternates on each EN URL.
    Returns count of KR URLs added."""
    sitemap_path = REPO / "sitemap.xml"
    text = sitemap_path.read_text(encoding="utf-8")

    # Compute all EN URLs -> KR URLs mapping
    ko_map: Dict[str, str] = {}
    for en_path in processed:
        en_url = rel_url_from_repo(en_path)
        ko_map[en_url] = ko_url_for(en_path)

    # Ensure xmlns:xhtml is declared
    if "xmlns:xhtml" not in text:
        text = text.replace(
            'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
            'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml"',
            1,
        )

    # For each EN URL in the map, add xhtml:link alternates under its <url> block
    def add_alternates(match: re.Match) -> str:
        block = match.group(0)
        loc_match = re.search(r"<loc>([^<]+)</loc>", block)
        if not loc_match:
            return block
        loc = loc_match.group(1).strip()
        if loc not in ko_map:
            return block
        if 'hreflang="ko"' in block:
            return block  # already annotated
        ko_url = ko_map[loc]
        alt_en = f'    <xhtml:link rel="alternate" hreflang="en" href="{loc}"/>\n'
        alt_ko = f'    <xhtml:link rel="alternate" hreflang="ko" href="{ko_url}"/>\n'
        alt_x = f'    <xhtml:link rel="alternate" hreflang="x-default" href="{loc}"/>\n'
        return block.rstrip().rstrip("</url>").rstrip() + "\n" + alt_en + alt_ko + alt_x + "  </url>"

    text = re.sub(r"<url>.*?</url>", add_alternates, text, flags=re.DOTALL)

    # Append KR URLs at the end (before </urlset>)
    ko_entries = []
    for en_url, ko_url in ko_map.items():
        ko_entries.append(
            "  <url>\n"
            f"    <loc>{ko_url}</loc>\n"
            f'    <xhtml:link rel="alternate" hreflang="en" href="{en_url}"/>\n'
            f'    <xhtml:link rel="alternate" hreflang="ko" href="{ko_url}"/>\n'
            f'    <xhtml:link rel="alternate" hreflang="x-default" href="{en_url}"/>\n'
            "    <changefreq>weekly</changefreq>\n"
            "    <priority>0.7</priority>\n"
            "  </url>"
        )
    # If KR urls already exist in the sitemap, skip re-appending
    existing_ko = set(re.findall(r"<loc>(https://r5tools\.io/ko/[^<]+)</loc>", text))
    new_entries = [e for e in ko_entries if not any(u in e for u in existing_ko)]

    # Also add the /ko/ landing page
    if "https://r5tools.io/ko/</loc>" not in text:
        ko_root = (
            "  <url>\n"
            "    <loc>https://r5tools.io/ko/</loc>\n"
            '    <xhtml:link rel="alternate" hreflang="en" href="https://r5tools.io/"/>\n'
            '    <xhtml:link rel="alternate" hreflang="ko" href="https://r5tools.io/ko/"/>\n'
            '    <xhtml:link rel="alternate" hreflang="x-default" href="https://r5tools.io/"/>\n'
            "    <changefreq>weekly</changefreq>\n"
            "    <priority>0.9</priority>\n"
            "  </url>"
        )
        new_entries.insert(0, ko_root)

    if new_entries:
        block = "  <!-- Korean mirror -->\n" + "\n".join(new_entries) + "\n"
        text = text.replace("</urlset>", block + "</urlset>")

    sitemap_path.write_text(text, encoding="utf-8")
    return len(new_entries)


# ---------------------------------------------------------------------------
# Extra: /ko/ index page + section index pages
# ---------------------------------------------------------------------------

def write_ko_landing() -> None:
    """Write a small /ko/index.html that acts as the KR hub."""
    KO_ROOT.mkdir(parents=True, exist_ok=True)
    page = """<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>R5TOOLS.IO — 라스트 워: 서바이벌 얼라이언스 도구 (한국어)</title>
<meta name="description" content="라스트 워: 서바이벌 얼라이언스 리더를 위한 R5 기획 도구 — 하이브 플래너, 로스터 추출기, 시즌 타임라인, 랜딩 플래너, 히트 시뮬레이터. Warzone 2007 회원 무료.">
<meta name="keywords" content="라스트 워 서바이벌, LWS, 얼라이언스, 하이브 플래너, R5, 워존">
<link rel="canonical" href="https://r5tools.io/ko/">
<link rel="alternate" hreflang="en" href="https://r5tools.io/">
<link rel="alternate" hreflang="ko" href="https://r5tools.io/ko/">
<link rel="alternate" hreflang="x-default" href="https://r5tools.io/">
<meta property="og:title" content="R5TOOLS.IO — 라스트 워 얼라이언스 도구 (한국어)">
<meta property="og:description" content="라스트 워: 서바이벌 얼라이언스 리더를 위한 R5 기획 도구.">
<meta property="og:type" content="website">
<meta property="og:url" content="https://r5tools.io/ko/">
<meta property="og:image" content="https://r5tools.io/static/og-image.png">
<style>
:root { --bg:#0a0e1a; --panel:#0d1424; --border:rgba(255,255,255,0.08);
  --accent:#c9a961; --text:#e6e8ee; --text-dim:#a8b0c0; --text-mute:#7a8290; }
* { box-sizing:border-box; }
html,body { margin:0; background:var(--bg); color:var(--text);
  font-family: system-ui,-apple-system,"Noto Sans KR",sans-serif; line-height:1.6; }
.wrap { max-width: 960px; margin: 0 auto; padding: 40px 20px 96px; }
h1 { font-size:36px; margin:0 0 8px; }
h1 .accent { color: var(--accent); }
.lede { font-size:18px; color: var(--text-dim); margin: 0 0 32px; }
.section { margin: 32px 0; padding: 20px; background: var(--panel);
  border: 1px solid var(--border); border-radius: 12px; }
.section h2 { color: var(--accent); font-size: 20px; margin: 0 0 12px; }
.section p { color: var(--text-dim); margin: 0 0 12px; }
.section a { color: var(--text); text-decoration: none;
  display: inline-block; margin: 4px 8px 4px 0; padding: 6px 12px;
  border: 1px solid var(--border); border-radius: 20px; font-size: 14px; }
.section a:hover { border-color: var(--accent); color: var(--accent); }
.foot { text-align:center; color:var(--text-mute); font-size:12px;
  margin-top:60px; padding-top:20px; border-top:1px solid var(--border); }
.foot a { color:var(--text-dim); text-decoration:none; }
</style>
<!-- r5tools:analytics v1 START -->
<script src="/analytics-config.js"></script>
<script>
  (function(){var id=(window.R5T_ANALYTICS||{}).ga4MeasurementId||"";if(!id)return;var s=document.createElement("script");s.async=true;s.src="https://www.googletagmanager.com/gtag/js?id="+encodeURIComponent(id);document.head.appendChild(s);window.dataLayer=window.dataLayer||[];window.gtag=function(){window.dataLayer.push(arguments);};window.gtag("js",new Date());window.gtag("config",id,{anonymize_ip:true,allow_google_signals:false});})();
  (function(){var cfg=window.R5T_ANALYTICS||{};if(!cfg.plausibleDomain)return;var p=document.createElement("script");p.defer=true;p.setAttribute("data-domain",cfg.plausibleDomain);p.src=cfg.plausibleScriptUrl||"https://plausible.io/js/script.js";document.head.appendChild(p);window.plausible=window.plausible||function(){(window.plausible.q=window.plausible.q||[]).push(arguments);};})();
</script>
<script src="/analytics.js" defer></script>
<!-- r5tools:analytics v1 END -->
</head>
<body>
<div class="wrap">
  <h1>R5<span class="accent">TOOLS.IO</span> — 한국어</h1>
  <p class="lede">라스트 워: 서바이벌 얼라이언스 리더를 위한 R5 기획 도구 세트. Warzone 2007 회원은 코드 <code>RONY-FREE</code>로 즉시 잠금 해제됩니다.</p>

  <div class="section">
    <h2>플래너 & 도구</h2>
    <p>모든 플래너는 워존 오버라이드를 지원합니다. 워존을 한 번 설정하면 모든 도구가 얼라이언스의 현재 시즌, 주차, 다음 마일스톤을 추적합니다.</p>
    <a href="https://roster.r5tools.io/">로스터 추출기</a>
    <a href="https://hive.r5tools.io/">하이브 플래너</a>
    <a href="https://bullochman.github.io/lws-season-timeline-static/">시즌 타임라인</a>
    <a href="https://bullochman.github.io/lws-landing-planner-static/">랜딩 플래너</a>
    <a href="https://bullochman.github.io/lws-heat-simulator-static/">히트 시뮬레이터</a>
    <a href="https://bullochman.github.io/lws-freeze-risk-static/">동결 리스크</a>
    <a href="https://bullochman.github.io/lws-coal-burn-static/">석탄 소비</a>
    <a href="https://bullochman.github.io/lws-city-capture-static/">도시 점령</a>
  </div>

  <div class="section">
    <h2>시즌 (Seasons)</h2>
    <p>S1 크림슨 플레이그부터 S6 그림자 열대우림까지 시즌별 가이드.</p>
    <a href="/ko/seasons/">시즌 인덱스</a>
    <a href="/ko/seasons/s1-crimson-plague.html">S1 크림슨 플레이그</a>
    <a href="/ko/seasons/s2-polar-storm.html">S2 폴라 스톰</a>
    <a href="/ko/seasons/s3-golden-kingdom.html">S3 골든 킹덤</a>
    <a href="/ko/seasons/s4-evernight-isle.html">S4 에버나이트 아일</a>
    <a href="/ko/seasons/s5-wild-west.html">S5 와일드 웨스트</a>
    <a href="/ko/seasons/s6-shadow-rainforest.html">S6 그림자 열대우림</a>
  </div>

  <div class="section">
    <h2>히어로 (Heroes)</h2>
    <p>UR, SSR, SR 히어로 개별 페이지 — 메타, 스킬, 각성, 랠리 진형.</p>
    <a href="/ko/heroes/">히어로 인덱스</a>
    <a href="/ko/heroes/kimberly.html">Kimberly (킴벌리)</a>
    <a href="/ko/heroes/dva.html">DVA (디바)</a>
    <a href="/ko/heroes/tesla.html">Tesla (테슬라)</a>
    <a href="/ko/heroes/marshall.html">Marshall (마샬)</a>
    <a href="/ko/heroes/mason.html">Mason (메이슨)</a>
    <a href="/ko/heroes/violet.html">Violet (바이올렛)</a>
  </div>

  <div class="section">
    <h2>워존 (Warzones)</h2>
    <p>워존별 얼라이언스 리더보드 도구 및 시즌 타임라인.</p>
    <a href="/ko/warzones/">워존 인덱스</a>
  </div>

  <div class="section">
    <h2>가이드 · 이벤트 · 건물 · 용어집</h2>
    <a href="/ko/guides/">가이드</a>
    <a href="/ko/events/">이벤트</a>
    <a href="/ko/buildings/">건물</a>
    <a href="/ko/glossary/">용어집 (한국어 ↔ 영어)</a>
  </div>

  <footer class="foot">
    <p>R5TOOLS.IO · 팬 제작 · First Fun / Century Games와 무관합니다.
    <a href="https://r5tools.io/">English</a> ·
    <a href="https://r5tools.io/terms.html">이용약관</a> ·
    <a href="https://r5tools.io/privacy.html">개인정보처리방침</a></p>
  </footer>
</div>
</body>
</html>
"""
    (KO_ROOT / "index.html").write_text(page, encoding="utf-8")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=0,
                        help="Only process first N pages (0 = all)")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--skip-sitemap", action="store_true")
    parser.add_argument("--sections", default="",
                        help="Comma-separated sections to include (default: all)")
    args = parser.parse_args()

    if args.sections:
        allowed = set(args.sections.split(","))
        global SECTIONS
        SECTIONS = [s for s in SECTIONS if s in allowed]

    print(f"→ Loading glossary + boilerplate…", file=sys.stderr)
    dic = build_dictionary()
    print(f"  dictionary: {len(dic):,} entries", file=sys.stderr)

    print(f"→ Translating pages under sections: {SECTIONS}", file=sys.stderr)
    count, processed = process_all(dic, limit=args.limit, dry_run=args.dry_run)
    print(f"→ Translated {count} pages", file=sys.stderr)

    if not args.dry_run:
        print(f"→ Writing /ko/index.html landing", file=sys.stderr)
        write_ko_landing()

        if not args.skip_sitemap:
            print(f"→ Updating sitemap.xml", file=sys.stderr)
            n = rewrite_sitemap(processed)
            print(f"  added {n} KR entries + cross-linked {len(processed)} EN entries", file=sys.stderr)

    print(f"✓ Done. KR pages under {KO_ROOT}", file=sys.stderr)


if __name__ == "__main__":
    main()
