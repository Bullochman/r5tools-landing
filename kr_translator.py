#!/usr/bin/env python3
"""
kr_translator.py — on-disk cached Korean translation for the SEO farm.

Uses Anthropic claude-sonnet-4-6 via the SDK to produce native-idiomatic Korean
markdown from English KB blocks. Cache lives under:
    ~/claudecode/r5tools/LWS_Knowledge_Base/kb-ko/<sha1>.md

so repeated build_seo_pages.py runs never re-translate.

Preserves LWS terminology (얼라이언스, 워로드, 하이브, 하이브 그리드, 라이브 등)
and Markdown structure (headings, lists, tables, code blocks).
"""

from __future__ import annotations

import hashlib
import os
import sys
import time
from pathlib import Path
from typing import Optional

CACHE_DIR = Path(__file__).resolve().parent.parent / "LWS_Knowledge_Base" / "kb-ko"
CACHE_DIR.mkdir(parents=True, exist_ok=True)

MODEL = "claude-sonnet-4-6"
MAX_TOKENS = 8000

# Token accounting for the report
_stats = {"input_tokens": 0, "output_tokens": 0, "api_calls": 0, "cache_hits": 0, "cache_misses": 0}


def stats() -> dict:
    return dict(_stats)


def _client():
    try:
        import anthropic
    except ImportError:
        return None
    key = os.environ.get("ANTHROPIC_API_KEY")
    if not key:
        return None
    return anthropic.Anthropic(api_key=key)


def _cache_key(text: str, tag: str = "md") -> Path:
    h = hashlib.sha1((tag + "::" + text).encode("utf-8")).hexdigest()
    return CACHE_DIR / f"{h}.{tag}"


SYSTEM_PROMPT = """You are translating Last War: Survival (LWS) alliance planning content from English to native, idiomatic Korean for R5s and R4s reading r5tools.io.

Rules:
1. Output ONLY the Korean translation. No preamble, no commentary, no code fences.
2. Preserve every Markdown structure: headings (#, ##, ###), lists (- , 1. ), tables (|...|), code blocks (```), links [text](url), wiki-links [[foo]], bold **x**, italic *x*, code `x`.
3. Use canonical LWS-KR terminology:
   - alliance = 얼라이언스
   - warlord = 워로드
   - hive = 하이브
   - hive grid = 하이브 그리드
   - warzone = 워존
   - rally = 랠리
   - Alliance Furnace = 얼라이언스 화로
   - Home Heating Furnace / HHF = 개인 난로
   - Warlord Missile = 워로드 미사일
   - Rare Soil War = 희귀 토양 전쟁
   - Spice Wars = 향신료 전쟁
   - Copper Wars = 구리 전쟁
   - Blood Night = 블러드 나이트
   - Doomsday = 둠스데이
   - Corruptor Boss = 부패자 보스
   - Zombie Siege = 좀비 시즈
   - Zombie Invasion = 좀비 인베이전
   - Ghost Ops = 고스트 옵스
   - VS Days / Alliance Duel = 얼라이언스 듀얼
   - Wall of Honor = 명예의 벽
   - Season / Season N = 시즌 N
   - Crimson Plague = 크림슨 플레이그
   - Polar Storm = 폴라 스톰
   - Golden Kingdom = 골든 킹덤
   - Evernight Isle = 에버나이트 아일
   - Wild West = 와일드 웨스트
   - Shadow Rainforest = 그림자 열대우림
   - Chief = 치프
   - HQ / Headquarters = 본부 (HQ)
   - Rank R5/R4/R3/R2/R1 = R5/R4/R3/R2/R1 (그대로 유지)
   - UR / SSR / SR = UR / SSR / SR (그대로 유지)
   - Tank / Aircraft / Missile = 탱크 / 항공기 / 미사일
   - Wounded / Killed = 부상 / 사망
   - Hospital = 병원
   - Emergency Center / ICU = 응급 센터
4. Keep proper nouns (hero names: Kimberly, DVA, Tesla, Marshall, Mason, etc.) in Latin script.
5. Keep all URLs, numbers, dates, and code snippets unchanged.
6. Korean sentence style: R5-to-R5 tone, respectful but direct. Use 합니다/입니다 forms in explanatory text, imperative 하세요 for action items.
7. Do not add "번역:" or "다음은 번역입니다" — output pure content only."""


def translate_markdown(text: str, *, tag: str = "md", verbose: bool = False) -> Optional[str]:
    """Translate a markdown block to Korean. Returns None on total failure.
    Cached on disk. `tag` differentiates content types (md, title, meta, lede)."""
    text = text.strip()
    if not text:
        return ""
    cache_path = _cache_key(text, tag)
    if cache_path.exists():
        _stats["cache_hits"] += 1
        return cache_path.read_text(encoding="utf-8")
    _stats["cache_misses"] += 1

    client = _client()
    if client is None:
        if verbose:
            print(f"  [translate] no client — cannot translate {tag} ({len(text)} chars)", file=sys.stderr)
        return None

    max_retries = 3
    for attempt in range(max_retries):
        try:
            resp = client.messages.create(
                model=MODEL,
                max_tokens=MAX_TOKENS,
                system=SYSTEM_PROMPT,
                messages=[{"role": "user", "content": f"Translate to Korean:\n\n{text}"}],
            )
            out = "".join(block.text for block in resp.content if hasattr(block, "text"))
            out = out.strip()
            if out.startswith("```") and out.endswith("```"):
                # strip accidental code fence
                lines = out.splitlines()
                if len(lines) >= 2:
                    out = "\n".join(lines[1:-1]).strip()
            _stats["input_tokens"] += resp.usage.input_tokens
            _stats["output_tokens"] += resp.usage.output_tokens
            _stats["api_calls"] += 1
            cache_path.write_text(out, encoding="utf-8")
            if verbose:
                print(f"  [translate {tag}] {len(text)}c → {len(out)}c ok", file=sys.stderr)
            return out
        except Exception as e:
            wait = 2 ** attempt
            if verbose:
                print(f"  [translate {tag}] attempt {attempt+1} failed: {e}; sleep {wait}s", file=sys.stderr)
            time.sleep(wait)
    return None


def cost_estimate() -> str:
    # claude-sonnet-4-6 input: $3/MTok, output: $15/MTok
    inp = _stats["input_tokens"]
    out = _stats["output_tokens"]
    cost = (inp / 1_000_000) * 3.0 + (out / 1_000_000) * 15.0
    return f"input {inp:,} tok, output {out:,} tok, calls {_stats['api_calls']}, cache hits {_stats['cache_hits']}, cost ~${cost:.2f}"
