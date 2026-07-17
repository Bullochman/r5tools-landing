#!/usr/bin/env python3
"""
moderator.py — CLI review tool for testimonial submissions.

Reads LWS_Access_Codes/logs/testimonials-pending.jsonl, walks Evan through
each pending row one at a time, and moves the decision into one of:
    - testimonials-approved.jsonl  (goes live on /testimonials.html + hero
                                    cards on next inject_to_heroes.py run)
    - testimonials-rejected.jsonl  (reasoned: spam / offensive / low-quality
                                    / off-topic / duplicate / complaint)

Auto-approve heuristics (only fire in --auto mode):
    * verified paid user AND
    * rating >= 4 AND
    * quote length > 40 chars AND
    * no profanity match AND
    * no refund/complaint keyword AND
    * time-on-page >= 8000ms (bot filter)

Anything with rating < 4 or a refund/complaint keyword is FORCED to manual
review — the "constraints" in the spec say those go to Evan for personal
handling, never auto-published.

USAGE
    python3 moderator.py review              # interactive one-at-a-time
    python3 moderator.py review --auto       # also auto-approve safe rows
    python3 moderator.py list                # dump pending queue
    python3 moderator.py stats               # summary of approved/rejected
    python3 moderator.py withdraw <id>       # honor a user's removal request
    python3 moderator.py bulk-reject spam    # convenience: reject all pending
                                             # as "spam" (nuclear option)
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable

HERE = Path(__file__).resolve().parent
REPO_ROOT = Path(os.environ.get("R5T_HOME", HERE.parents[2]))
ACCESS_CODES_DIR = REPO_ROOT / "LWS_Access_Codes"
PENDING = ACCESS_CODES_DIR / "logs" / "testimonials-pending.jsonl"
APPROVED = ACCESS_CODES_DIR / "logs" / "testimonials-approved.jsonl"
REJECTED = ACCESS_CODES_DIR / "logs" / "testimonials-rejected.jsonl"
WITHDRAWN = ACCESS_CODES_DIR / "logs" / "testimonials-withdrawn.jsonl"

REJECT_REASONS = ["spam", "offensive", "low-quality", "off-topic", "duplicate", "complaint", "unverifiable"]
PROFANITY = {"fuck", "shit", "cunt", "nigger", "faggot", "retard"}  # minimal, expand as needed
COMPLAINT_KEYWORDS = {
    "refund", "chargeback", "scam", "ripoff", "rip-off", "waste of money",
    "hate", "worst", "terrible", "broken", "doesn't work", "does not work",
    "환불", "사기",       # ko
    "返金", "詐欺",       # ja
    "reembolso", "estafa" # es/pt
}

# ----- io helpers ---------------------------------------------------------

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

def _write_jsonl(path: Path, rows: Iterable[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        for row in rows: f.write(json.dumps(row, ensure_ascii=False) + "\n")

def _append_jsonl(path: Path, row: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "a", encoding="utf-8") as f:
        f.write(json.dumps(row, ensure_ascii=False) + "\n")

# ----- policy checks ------------------------------------------------------

def is_profane(text: str) -> bool:
    lowered = text.lower()
    return any(re.search(r"\b" + re.escape(w) + r"\b", lowered) for w in PROFANITY)

def is_complaint(text: str) -> bool:
    lowered = text.lower()
    return any(k in lowered for k in COMPLAINT_KEYWORDS)

def auto_approve_ok(row: dict) -> tuple[bool, str]:
    """Return (ok, reason). Never approves rating < 4 or complaints — those
    are hard-forced to manual review per the project constraints."""
    quote = row.get("quote") or ""
    rating = row.get("rating")
    if not row.get("verified_paid_user"):
        return False, "not verified paid user"
    if rating is None or rating < 4:
        return False, f"rating={rating} (must be >=4 for auto)"
    if len(quote) < 40:
        return False, f"quote too short ({len(quote)} chars)"
    if is_profane(quote):
        return False, "profanity match"
    if is_complaint(quote):
        return False, "complaint keyword match"
    if (row.get("time_on_page_ms") or 0) < 8000:
        return False, "time-on-page < 8s (bot suspicion)"
    if not row.get("consent"):
        return False, "no consent flag"
    return True, "verified paid + rating 4-5 + clean"

# ----- decision ops -------------------------------------------------------

def approve(row: dict, note: str) -> None:
    row["moderation"] = {
        "decision": "approved",
        "at": datetime.now(timezone.utc).isoformat(),
        "note": note,
    }
    row["approved_at"] = row["moderation"]["at"]
    _append_jsonl(APPROVED, row)
    _drop_from_pending(row)

def reject(row: dict, reason: str, note: str = "") -> None:
    row["moderation"] = {
        "decision": "rejected",
        "reason": reason,
        "at": datetime.now(timezone.utc).isoformat(),
        "note": note,
    }
    _append_jsonl(REJECTED, row)
    _drop_from_pending(row)

def _drop_from_pending(row: dict) -> None:
    """Rewrite pending log without the row (matched by id)."""
    keep = [r for r in _read_jsonl(PENDING) if r.get("id") != row.get("id")]
    _write_jsonl(PENDING, keep)

# ----- withdraw (right-to-remove) ----------------------------------------

def withdraw(testimonial_id: str, reason: str = "user-requested") -> bool:
    now = datetime.now(timezone.utc).isoformat()
    changed = False
    for path in (APPROVED, PENDING):
        rows = _read_jsonl(path)
        kept = []
        for r in rows:
            if r.get("id") == testimonial_id:
                r["withdrawn_at"] = now
                r["withdraw_reason"] = reason
                _append_jsonl(WITHDRAWN, r)
                changed = True
            else:
                kept.append(r)
        _write_jsonl(path, kept)
    return changed

# ----- CLI display --------------------------------------------------------

def _color(code: str, s: str) -> str:
    if not sys.stdout.isatty(): return s
    return f"\033[{code}m{s}\033[0m"

def _fmt(row: dict) -> str:
    star_str = ("★" * (row.get("rating") or 0)).ljust(5, "☆") if row.get("rating") else "(no rating)"
    verified = _color("32", "✓ verified") if row.get("verified_paid_user") else _color("33", "unverified")
    warn = ""
    if is_complaint(row.get("quote") or ""): warn += _color("31", " [COMPLAINT-KW]")
    if is_profane(row.get("quote") or ""): warn += _color("31", " [PROFANITY]")
    return (
        f"\n{_color('1','ID')} {row.get('id')}   {_color('1','SUBMITTED')} {row.get('submitted_at','?')}\n"
        f"{_color('1','LANG')} {row.get('lang','?')}   {_color('1','ROLE')} {row.get('role','?')}   "
        f"{_color('1','WZ')} {row.get('warzone') or '—'}   {_color('1','RATING')} {star_str}   "
        f"{verified}{warn}\n"
        f"{_color('1','FROM')} {row.get('name','?')}   {_color('1','EMAIL')} {row.get('email','?')}\n"
        f"{_color('1','QUOTE')} \"{row.get('quote','')}\"\n"
    )

# ----- commands ----------------------------------------------------------

def cmd_review(auto: bool) -> None:
    rows = _read_jsonl(PENDING)
    if not rows:
        print("Nothing pending.")
        return
    print(f"{len(rows)} pending testimonial(s).")
    for row in rows:
        print(_fmt(row))
        if auto:
            ok, why = auto_approve_ok(row)
            if ok:
                print(_color("32", f"[auto-approve] {why}"))
                approve(row, note=f"auto: {why}")
                continue
            else:
                print(_color("33", f"[auto-skip] {why} — falling through to manual"))
        try:
            action = input("(a)pprove  (r)eject  (s)kip  (q)uit > ").strip().lower()
        except EOFError:
            print("\n(non-interactive stdin — stopping)"); return
        if action in ("q", "quit"):
            return
        if action == "s":
            continue
        if action.startswith("a"):
            note = input("optional note> ").strip()
            approve(row, note=note or "manual")
            print(_color("32", "  ✓ approved"))
        elif action.startswith("r"):
            print("reasons: " + ", ".join(REJECT_REASONS))
            reason = input("reason> ").strip().lower() or "low-quality"
            if reason not in REJECT_REASONS: reason = "low-quality"
            note = input("optional note> ").strip()
            reject(row, reason=reason, note=note)
            print(_color("31", f"  ✗ rejected as {reason}"))
        else:
            print("  (skipped — unrecognized input)")

def cmd_list() -> None:
    rows = _read_jsonl(PENDING)
    if not rows:
        print("Empty."); return
    for r in rows: print(_fmt(r))

def cmd_stats() -> None:
    p = len(_read_jsonl(PENDING))
    a = _read_jsonl(APPROVED)
    r = _read_jsonl(REJECTED)
    w = _read_jsonl(WITHDRAWN)
    print(f"Pending:    {p}")
    print(f"Approved:   {len(a)}")
    print(f"Rejected:   {len(r)}")
    print(f"Withdrawn:  {len(w)}")
    if a:
        by_lang = {}
        for row in a:
            by_lang[row.get("lang","?")] = by_lang.get(row.get("lang","?"), 0) + 1
        print("  approved by lang:", ", ".join(f"{k}={v}" for k,v in sorted(by_lang.items())))
        rated = [x.get("rating") for x in a if x.get("rating")]
        if rated:
            print(f"  avg rating (approved): {sum(rated)/len(rated):.2f} across {len(rated)}")

def cmd_withdraw(tid: str) -> None:
    ok = withdraw(tid)
    print("withdrawn" if ok else "not found in approved/pending")

def cmd_bulk_reject(reason: str) -> None:
    rows = _read_jsonl(PENDING)
    if reason not in REJECT_REASONS:
        print(f"reason must be one of: {REJECT_REASONS}"); sys.exit(1)
    confirm = input(f"reject ALL {len(rows)} pending as '{reason}'? type YES: ").strip()
    if confirm != "YES": print("aborted"); return
    for row in rows: reject(row, reason=reason, note="bulk reject")
    print(f"rejected {len(rows)}")

def main() -> int:
    ap = argparse.ArgumentParser(description="r5tools testimonial moderator")
    sub = ap.add_subparsers(dest="cmd", required=True)
    r = sub.add_parser("review"); r.add_argument("--auto", action="store_true")
    sub.add_parser("list")
    sub.add_parser("stats")
    w = sub.add_parser("withdraw"); w.add_argument("id")
    br = sub.add_parser("bulk-reject"); br.add_argument("reason")
    args = ap.parse_args()

    if args.cmd == "review":  cmd_review(auto=args.auto)
    elif args.cmd == "list":  cmd_list()
    elif args.cmd == "stats": cmd_stats()
    elif args.cmd == "withdraw": cmd_withdraw(args.id)
    elif args.cmd == "bulk-reject": cmd_bulk_reject(args.reason)
    return 0

if __name__ == "__main__":
    sys.exit(main())
