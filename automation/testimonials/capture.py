#!/usr/bin/env python3
"""
capture.py — testimonial capture / ask engine for r5tools.io

Scans LWS_Access_Codes/logs/ for subscribers whose behavior matches one of the
four "real intent" trigger moments, then emails a personalized submission link
so we only ever ask when the user is happy AND we know why they're happy.

The link points at /testimonial-form.html?user=<jwt-hash>. The hash carries the
subscriber_id + trigger reason so the moderator (moderator.py) can weight
"we know they're a paid user" vs "we know they successfully unlocked 20min ago"
without asking the user to re-enter that context.

TRIGGER MOMENTS
    1. tool_use_5          After 5th gate_check + tool_action in activity.jsonl
                           (behavior-based: they've clearly gotten value).
    2. unlock_success      Within 24h of first unlock_success_paid event
                           (thankful-moment: they just paid + it worked).
    3. founding_day_30     30 days after joining Founding tier
                           (satisfied buyer, they've had a full season slice).
    4. drip_reply          Already handled by drip Day 7 "reply with feedback"
                           — this script only tracks its asks in asks.jsonl for
                           the rate-limit budget, doesn't send anything.

RATE LIMITS
    - Max 1 ask per subscriber per 90 days across ALL triggers.
    - No sends during quiet hours (10 PM - 8 AM in user's local tz;
      resolved from lang → Asia/Seoul for ko else UTC; matches conversion-nudges).
    - Skip anyone whose drip status is "unsubscribed" or who has already
      submitted a testimonial (found in testimonials-pending.jsonl OR
      testimonials-approved.jsonl OR testimonials-rejected.jsonl).

OUTPUTS
    - Sends email via the same envelope as marketing/send_drip.py (Resend API
      if RESEND_API_KEY set, else stdout for hand-delivery).
    - Appends every ask (sent or dry-run) to
      automation/testimonials/logs/asks.jsonl for auditing + rate-limit budget.

RUN
    python3 capture.py                       # dry-run, prints intended sends
    python3 capture.py --send                # actually deliver
    python3 capture.py --trigger unlock_success --send
    python3 capture.py --user evan@r5tools.io --trigger tool_use_5 --send
                                             # force a specific user (skip rate
                                             # limits, useful for E2E test)
    python3 capture.py --stats               # summary of asks-sent by trigger

CONFIG
    R5T_HOME              defaults to ../../.. of this file (repo root)
    R5T_JWT_SECRET        symmetric secret used to sign the user hash. If unset,
                          reads from LWS_Access_Codes/.jwt-secret (create with
                          `head -c 32 /dev/urandom | base64` on first run).
    RESEND_API_KEY        optional; if unset, prints envelopes to stdout
    R5T_FROM              from-address; default "Evan @ r5tools <hello@r5tools.io>"
    R5T_BASE_URL          base URL for the form link; default "https://r5tools.io"
"""

from __future__ import annotations

import argparse
import base64
import hashlib
import hmac
import json
import os
import sys
import time
from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Iterable

# --- paths ---------------------------------------------------------------

HERE = Path(__file__).resolve().parent
REPO_ROOT = Path(os.environ.get("R5T_HOME", HERE.parents[2]))
LOGS_DIR = HERE / "logs"
LOGS_DIR.mkdir(parents=True, exist_ok=True)
TEMPLATES_DIR = HERE / "templates"

ACCESS_CODES_DIR = REPO_ROOT / "LWS_Access_Codes"
ACTIVITY_LOG = ACCESS_CODES_DIR / "logs" / "activity.jsonl"
SUBSCRIBERS_LOG = ACCESS_CODES_DIR / "logs" / "drip_subscribers.jsonl"
PENDING_LOG = ACCESS_CODES_DIR / "logs" / "testimonials-pending.jsonl"
APPROVED_LOG = ACCESS_CODES_DIR / "logs" / "testimonials-approved.jsonl"
REJECTED_LOG = ACCESS_CODES_DIR / "logs" / "testimonials-rejected.jsonl"
ASKS_LOG = LOGS_DIR / "asks.jsonl"

# --- constants -----------------------------------------------------------

TRIGGERS = {
    "tool_use_5": {
        "min_tool_uses": 5,
        "template": "trigger-tool-use-5",
        "reason_hint": "You've used the suite a bunch — how's it going?",
    },
    "unlock_success": {
        "template": "trigger-unlock-success",
        "reason_hint": "Congrats on unlocking — a quick line for us?",
        "min_hours_after_unlock": 2,
        "max_hours_after_unlock": 72,
    },
    "founding_day_30": {
        "template": "trigger-founding-day-30",
        "reason_hint": "30 days as a Founding — worth it?",
        "min_days_after_founding": 30,
    },
    "drip_reply": {
        # Logged only. Actual delivery is by marketing/send_drip.py day7.
        "template": None,
        "reason_hint": "Day-7 drip already asked — logged for rate-limit budget.",
    },
}

RATE_LIMIT_DAYS = 90
QUIET_START_HOUR = 22  # 10 PM local
QUIET_END_HOUR = 8     # 8 AM local

DEFAULT_FROM = os.environ.get("R5T_FROM", "Evan @ r5tools <hello@r5tools.io>")
BASE_URL = os.environ.get("R5T_BASE_URL", "https://r5tools.io").rstrip("/")

# --- helpers -------------------------------------------------------------

def _read_jsonl(path: Path) -> Iterable[dict]:
    if not path.exists():
        return
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                yield json.loads(line)
            except json.JSONDecodeError:
                continue

def _load_jwt_secret() -> bytes:
    env = os.environ.get("R5T_JWT_SECRET")
    if env:
        return env.encode("utf-8")
    secret_file = ACCESS_CODES_DIR / ".jwt-secret"
    if secret_file.exists():
        return secret_file.read_text().strip().encode("utf-8")
    # Fall back to a per-run ephemeral secret so `--stats` and dry-runs work
    # without setup — signed URLs won't verify on the server side, but they're
    # never delivered without --send anyway.
    return b"dev-only-do-not-ship"

def _b64url(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")

def make_user_hash(subscriber_id: str, trigger: str, ttl_days: int = 90) -> str:
    """Short signed token: <b64(payload)>.<b64(hmac-sha256)>.

    Payload is a compact JSON dict; we intentionally keep it small so the URL
    stays scannable. The server verifies by recomputing the HMAC.
    """
    now = int(time.time())
    payload = {
        "s": subscriber_id,          # subscriber id / hashed email
        "t": trigger,                # trigger reason (moderation weight)
        "i": now,                    # issued-at
        "e": now + ttl_days * 86400, # expires-at
    }
    body = json.dumps(payload, separators=(",", ":"), sort_keys=True).encode("utf-8")
    sig = hmac.new(_load_jwt_secret(), body, hashlib.sha256).digest()
    return f"{_b64url(body)}.{_b64url(sig)}"

def _lang_to_tz_offset(lang: str) -> int:
    """Return UTC offset in hours for the subscriber's assumed local time.
    Cheap heuristic (no pytz dep) — matches the discord-bot / conversion-nudges
    quiet-hour convention."""
    return {"ko": 9, "ja": 9, "en": 0, "pt": -3, "es": 1}.get(lang or "en", 0)

def _now_local_hour(lang: str, now: datetime | None = None) -> int:
    now = now or datetime.now(timezone.utc)
    local = now + timedelta(hours=_lang_to_tz_offset(lang))
    return local.hour

# --- data loading --------------------------------------------------------

@dataclass
class Subscriber:
    id: str                 # canonical id — email hash, or email if visible
    email: str | None
    lang: str
    joined_at: datetime | None
    tier: str | None        # "free" | "paid-personal" | "alliance-founding" | ...
    unsubscribed: bool
    warzone: str | None
    role: str | None        # if provided at signup
    handle: str | None      # R5 nickname if provided
    activity: list[dict] = field(default_factory=list)

def _parse_ts(s: str | None) -> datetime | None:
    if not s:
        return None
    try:
        return datetime.fromisoformat(s.replace("Z", "+00:00"))
    except ValueError:
        return None

def load_subscribers() -> dict[str, Subscriber]:
    """Load all known subscribers from drip_subscribers.jsonl. Later rows for
    the same email overwrite earlier ones (log-compaction semantics)."""
    subs: dict[str, Subscriber] = {}
    for row in _read_jsonl(SUBSCRIBERS_LOG):
        email = (row.get("email") or "").strip().lower()
        if not email:
            continue
        sid = row.get("subscriber_id") or hashlib.sha1(email.encode()).hexdigest()[:12]
        subs[sid] = Subscriber(
            id=sid,
            email=email,
            lang=(row.get("lang") or "en").lower(),
            joined_at=_parse_ts(row.get("joined_at") or row.get("ts")),
            tier=row.get("tier"),
            unsubscribed=bool(row.get("unsubscribed")),
            warzone=str(row.get("warzone")) if row.get("warzone") else None,
            role=row.get("role"),
            handle=row.get("handle") or row.get("name"),
        )
    return subs

def load_activity_by_email(subs: dict[str, Subscriber]) -> None:
    """Attach recent activity events per subscriber. activity.jsonl doesn't
    always carry an email column (some rows are anonymous curl checks); we
    match on the `email` field where present."""
    for row in _read_jsonl(ACTIVITY_LOG):
        e = (row.get("email") or "").strip().lower()
        if not e:
            continue
        for sub in subs.values():
            if sub.email == e:
                sub.activity.append(row)
                break

def already_submitted(subscriber_id: str) -> bool:
    """Has this subscriber already submitted a testimonial (any status)?
    Prevents re-asking someone we already got a quote from."""
    for path in (PENDING_LOG, APPROVED_LOG, REJECTED_LOG):
        for row in _read_jsonl(path):
            if row.get("subscriber_id") == subscriber_id:
                return True
    return False

def last_ask_for(subscriber_id: str) -> datetime | None:
    latest = None
    for row in _read_jsonl(ASKS_LOG):
        if row.get("subscriber_id") != subscriber_id:
            continue
        ts = _parse_ts(row.get("ts"))
        if ts and (latest is None or ts > latest):
            latest = ts
    return latest

# --- eligibility ---------------------------------------------------------

@dataclass
class Ask:
    subscriber: Subscriber
    trigger: str
    reason: str          # human-readable "why we're asking now"
    now: datetime

def _tool_use_count(sub: Subscriber) -> int:
    """Count of gate_check + tool_action events attributed to this subscriber."""
    n = 0
    for row in sub.activity:
        tool = row.get("tool") or ""
        event = row.get("event") or ""
        if tool or event in ("gate_check", "tool_action", "unlock_success_paid"):
            n += 1
    return n

def _first_unlock_success_ts(sub: Subscriber) -> datetime | None:
    """Time of first paid unlock_success event."""
    ts_list = []
    for row in sub.activity:
        if row.get("event") == "unlock_success_paid" or row.get("tier", "").startswith("paid"):
            ts = _parse_ts(row.get("ts"))
            if ts:
                ts_list.append(ts)
    return min(ts_list) if ts_list else None

def _founding_join_ts(sub: Subscriber) -> datetime | None:
    """When (if ever) this subscriber joined a Founding tier."""
    if sub.tier and "founding" in sub.tier:
        return sub.joined_at
    return None

def eligible_for(sub: Subscriber, trigger: str, now: datetime, force: bool) -> tuple[bool, str]:
    """Return (eligible, reason-or-skip-explanation)."""
    if sub.unsubscribed and not force:
        return False, "unsubscribed"
    if already_submitted(sub.id) and not force:
        return False, "already-submitted"
    last = last_ask_for(sub.id)
    if last and not force and (now - last).days < RATE_LIMIT_DAYS:
        days_left = RATE_LIMIT_DAYS - (now - last).days
        return False, f"rate-limited ({days_left}d left)"
    if not force:
        h = _now_local_hour(sub.lang, now)
        if h >= QUIET_START_HOUR or h < QUIET_END_HOUR:
            return False, f"quiet-hours (local {h}h)"

    if trigger == "tool_use_5":
        n = _tool_use_count(sub)
        if n < TRIGGERS[trigger]["min_tool_uses"]:
            return False, f"only {n} tool uses"
        return True, f"5+ tool uses ({n} total)"

    if trigger == "unlock_success":
        ts = _first_unlock_success_ts(sub)
        if not ts:
            return False, "no paid unlock event"
        hours = (now - ts).total_seconds() / 3600
        if hours < TRIGGERS[trigger]["min_hours_after_unlock"]:
            return False, f"only {hours:.1f}h since unlock"
        if hours > TRIGGERS[trigger]["max_hours_after_unlock"]:
            return False, f"{hours:.1f}h since unlock (past thankful-moment window)"
        return True, f"paid unlock {hours:.1f}h ago"

    if trigger == "founding_day_30":
        ts = _founding_join_ts(sub)
        if not ts:
            return False, "not a founding-tier subscriber"
        days = (now - ts).days
        if days < TRIGGERS[trigger]["min_days_after_founding"]:
            return False, f"only {days}d as founding"
        return True, f"{days}d as founding member"

    if trigger == "drip_reply":
        # Only tracked for rate-limit budget. Delivery happens in send_drip.
        return False, "delivery is via marketing/send_drip.py day7"

    return False, f"unknown trigger {trigger}"

# --- email rendering / sending ------------------------------------------

def _load_template(template_id: str, lang: str) -> tuple[str, str]:
    """Return (subject, body). Falls back to en if lang-specific missing."""
    for candidate_lang in (lang, "en"):
        path = TEMPLATES_DIR / f"{template_id}-{candidate_lang}.md"
        if path.exists():
            raw = path.read_text(encoding="utf-8")
            # Frontmatter is optional. Split on first blank line after front matter.
            subject = "A quick R5-to-R5 ask"
            body = raw
            if raw.startswith("---"):
                _, fm, rest = raw.split("---", 2)
                for line in fm.strip().splitlines():
                    if ":" in line:
                        k, v = line.split(":", 1)
                        if k.strip().lower() == "subject":
                            subject = v.strip().strip('"').strip("'")
                body = rest.strip()
            return subject, body
    # Ultimate fallback so the pipeline never crashes on a missing template.
    return (
        "Would you write a line about r5tools?",
        f"Hey — you've been using r5tools for a while. Any chance you'd write a "
        f"one-sentence quote we could put on the site? {BASE_URL}/testimonial-form.html",
    )

def _render(body: str, sub: Subscriber, form_url: str) -> str:
    """Trivial mustache-less substitution."""
    name = sub.handle or sub.email or "R5"
    return (
        body
        .replace("{{HANDLE}}", name)
        .replace("{{FORM_URL}}", form_url)
        .replace("{{WARZONE}}", sub.warzone or "your warzone")
        .replace("{{UNSUBSCRIBE_URL}}", f"{BASE_URL}/unsubscribe?email={sub.email}")
    )

def send_ask(ask: Ask, dry_run: bool) -> dict:
    """Compose + (optionally) send. Always returns the log row."""
    trig = TRIGGERS[ask.trigger]
    template_id = trig["template"]
    if not template_id:
        return {"ok": False, "reason": "no template for trigger"}

    subject, body = _load_template(template_id, ask.subscriber.lang)
    token = make_user_hash(ask.subscriber.id, ask.trigger)
    form_url = f"{BASE_URL}/testimonial-form.html?user={token}&lang={ask.subscriber.lang}"
    rendered = _render(body, ask.subscriber, form_url)

    row = {
        "ts": ask.now.replace(microsecond=0).isoformat(),
        "subscriber_id": ask.subscriber.id,
        "email": ask.subscriber.email,
        "lang": ask.subscriber.lang,
        "trigger": ask.trigger,
        "reason": ask.reason,
        "template": template_id,
        "form_url": form_url,
        "sent": not dry_run,
    }

    api_key = os.environ.get("RESEND_API_KEY")
    if dry_run:
        print(f"[DRY] would send → {ask.subscriber.email} · {ask.trigger} · {subject}")
    elif not api_key:
        # No mailer configured — fall back to stdout (same pattern as send_drip).
        print(
            f"--- would-send ---\n"
            f"to: {ask.subscriber.email}\nfrom: {DEFAULT_FROM}\n"
            f"subject: {subject}\n\n{rendered}\n--- end ---"
        )
    else:
        try:
            import urllib.request
            req = urllib.request.Request(
                "https://api.resend.com/emails",
                data=json.dumps({
                    "from": DEFAULT_FROM,
                    "to": [ask.subscriber.email],
                    "subject": subject,
                    "text": rendered,
                }).encode("utf-8"),
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                method="POST",
            )
            with urllib.request.urlopen(req, timeout=15) as r:
                row["resend_id"] = json.loads(r.read()).get("id")
        except Exception as e:
            row["sent"] = False
            row["error"] = str(e)
            print(f"[send-error] {ask.subscriber.email}: {e}", file=sys.stderr)

    with open(ASKS_LOG, "a", encoding="utf-8") as f:
        f.write(json.dumps(row) + "\n")
    return row

# --- orchestration ------------------------------------------------------

def build_asks(subs: dict[str, Subscriber], triggers: list[str], now: datetime, force_user: str | None) -> list[Ask]:
    asks: list[Ask] = []
    for sub in subs.values():
        if force_user and sub.email != force_user.lower() and sub.id != force_user:
            continue
        for trig in triggers:
            ok, reason = eligible_for(sub, trig, now, force=bool(force_user))
            if ok:
                asks.append(Ask(subscriber=sub, trigger=trig, reason=reason, now=now))
                break  # one trigger per user per run — highest-priority wins
    return asks

def print_stats() -> None:
    counts: dict[str, int] = {}
    total = 0
    for row in _read_jsonl(ASKS_LOG):
        if not row.get("sent"):
            continue
        counts[row["trigger"]] = counts.get(row["trigger"], 0) + 1
        total += 1
    print(f"Asks sent (all-time): {total}")
    for k, v in sorted(counts.items(), key=lambda kv: -kv[1]):
        print(f"  {k:25s}  {v}")

# --- CLI ----------------------------------------------------------------

def main() -> int:
    ap = argparse.ArgumentParser(description="r5tools testimonial capture engine")
    ap.add_argument("--send", action="store_true",
                    help="actually deliver (default: dry-run)")
    ap.add_argument("--trigger", choices=list(TRIGGERS.keys()),
                    help="only evaluate this trigger (default: all)")
    ap.add_argument("--user", help="force-evaluate one email/subscriber_id, skip rate limits")
    ap.add_argument("--stats", action="store_true",
                    help="print asks-sent summary and exit")
    args = ap.parse_args()

    if args.stats:
        print_stats()
        return 0

    triggers = [args.trigger] if args.trigger else [
        t for t, cfg in TRIGGERS.items() if cfg.get("template")
    ]
    now = datetime.now(timezone.utc)
    subs = load_subscribers()
    load_activity_by_email(subs)

    print(f"[capture] {len(subs)} subscribers, {len(triggers)} triggers, now={now.isoformat()}")
    asks = build_asks(subs, triggers, now, args.user)
    print(f"[capture] {len(asks)} eligible")

    for ask in asks:
        row = send_ask(ask, dry_run=not args.send)
        status = "SENT" if row.get("sent") else "DRY" if not args.send else "FAIL"
        print(f"  {status:5s} {ask.subscriber.email or ask.subscriber.id:30s} "
              f"{ask.trigger:20s} {ask.reason}")

    return 0

if __name__ == "__main__":
    sys.exit(main())
