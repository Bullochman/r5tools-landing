#!/usr/bin/env python3
"""
r5tools trigger-based conversion nudge engine.

Loads trigger_definitions.yaml, walks every subscriber in the LWS_Access_Codes
drip_subscribers.jsonl, evaluates each trigger's condition block against the
subscriber's 30-day event history (from activity.jsonl + optional Plausible
API), and enqueues an email/in-app nudge for every match — respecting
cooldowns, per-user daily caps, and quiet hours.

Send path: reuses marketing/emails/send_drip.py's SMTP + rendering pipeline
so unsubscribe tokens, headers, and rate-limit fuzz are identical to the
time-based drip.

USAGE
    # Dry-run: print what WOULD be sent, no SMTP, no state writes.
    python3 trigger_engine.py --dry-run

    # Fire for real. Cron this hourly.
    python3 trigger_engine.py --send

    # Only evaluate one trigger (debugging).
    python3 trigger_engine.py --dry-run --only high_usage_free

ENVIRONMENT VARIABLES
    All the SMTP_*, FROM_*, SERVER_SECRET, UNSUBSCRIBE_BASE vars that
    send_drip.py already uses. Plus:

        ACTIVITY_LOG        Path to LWS_Access_Codes/logs/activity.jsonl.
                            Default: ../../../LWS_Access_Codes/logs/activity.jsonl.
        SUBSCRIBERS_FILE    Same as send_drip.py (default drip_subscribers.jsonl).
        REDEMPTIONS_LOG     Path to LWS_Access_Codes/logs/redemptions.jsonl.
        NUDGE_STATE_FILE    Where per-user trigger-fire history is stored.
                            Default: logs/nudge-state.json next to this script.
        NUDGE_LOG_FILE      Append-only fire log. Default logs/nudge-fires.jsonl.
        NUDGE_PENDING_FILE  Client-readable file consumed by in-app-nudge.js
                            via /api/nudge/pending. Default logs/nudge-pending.jsonl.
        PLAUSIBLE_API_KEY   Optional. If set, engine also pulls Plausible
                            aggregate for the current site (nice-to-have for
                            events not logged server-side, e.g. pricing_page_view
                            if pricing lives outside the gated tool).
        PLAUSIBLE_SITE_ID   Default: r5tools.io.
        FOUNDING_COUNT_URL  Default: https://access-codes.r5tools.io/api/founding-count.
        QUIET_HOURS_START   Default 22 (10 PM local).
        QUIET_HOURS_END     Default 8  (8 AM local).

STATE FILE FORMAT (logs/nudge-state.json)
    {
      "users": {
        "someone@example.com": {
          "triggers": {
            "high_usage_free": {"fires": 1, "last_fire_ts": "2026-07-17T14:00:00Z"},
            "pricing_page_no_convert": {"fires": 2, "last_fire_ts": "2026-07-16T09:00:00Z"}
          },
          "last_any_fire_ts": "2026-07-17T14:00:00Z"
        }
      },
      "global": {
        "founding_broadcast_sent": false
      }
    }
"""

import argparse
import json
import os
import re
import sys
import urllib.request
import urllib.error
from collections import defaultdict, Counter
from datetime import datetime, timezone, timedelta
from pathlib import Path

# Reuse the drip sender for template rendering + SMTP so nudges look
# identical to the day-N drip emails (same unsubscribe headers, same HTML shell).
BASE_DIR = Path(__file__).parent.resolve()
DRIP_DIR = BASE_DIR.parent.parent / "marketing" / "emails"
sys.path.insert(0, str(DRIP_DIR))
import send_drip  # noqa: E402


# ---------- YAML loader (dependency-free — only supports the subset we use) ----------

def _yaml_scalar(v):
    v = v.strip()
    if not v:
        return ""
    # comment strip
    if "#" in v:
        # only strip # that's outside quotes; simple heuristic
        if v[0] not in ("'", '"'):
            v = v.split("#", 1)[0].rstrip()
    v = v.strip()
    if len(v) >= 2 and v[0] == v[-1] and v[0] in ("'", '"'):
        return v[1:-1]
    if v in ("true", "True"):
        return True
    if v in ("false", "False"):
        return False
    if v in ("null", "None", "~"):
        return None
    if v.startswith("[") and v.endswith("]"):
        inner = v[1:-1]
        return [_yaml_scalar(x) for x in inner.split(",") if x.strip()]
    try:
        return int(v)
    except ValueError:
        pass
    try:
        return float(v)
    except ValueError:
        pass
    return v


def load_yaml(path):
    """Minimal YAML: top-level keys, nested mappings, and a list of mappings
    under `triggers:`. Sufficient for trigger_definitions.yaml — do not use
    this on arbitrary YAML."""
    root = {}
    stack = [(0, root)]  # (indent, container)
    current_list = None
    current_list_indent = None
    with open(path, "r", encoding="utf-8") as f:
        lines = f.readlines()
    for raw in lines:
        # strip comments and blank
        line = raw.rstrip("\n")
        if not line.strip() or line.strip().startswith("#"):
            continue
        # compute indent (spaces only)
        indent = len(line) - len(line.lstrip(" "))
        body = line.strip()

        # pop stack until we're at the right depth
        while stack and stack[-1][0] > indent:
            stack.pop()
        parent = stack[-1][1] if stack else root

        # list item?
        if body.startswith("- "):
            item_body = body[2:].strip()
            # ensure the container is a list
            if not isinstance(parent, list):
                # parent must be the value of a `key:` on a previous line
                # (already handled — stack entries with lists)
                raise ValueError(f"unexpected list item: {line}")
            if ":" in item_body:
                new_dict = {}
                parent.append(new_dict)
                k, _, v = item_body.partition(":")
                k = k.strip()
                v = v.strip()
                if v:
                    new_dict[k] = _yaml_scalar(v)
                else:
                    # nested block will attach below new_dict
                    stack.append((indent + 2, new_dict))
                # push the dict itself so nested keys attach to it
                stack.append((indent + 2, new_dict))
            else:
                parent.append(_yaml_scalar(item_body))
            continue

        # key: value or key: (block follows)
        if ":" in body:
            k, _, v = body.partition(":")
            k = k.strip()
            v = v.strip()
            if v == "":
                # block follows — decide list vs dict by peeking next non-blank line
                new_container = None
                # peek
                idx = lines.index(raw)
                for peek in lines[idx + 1:]:
                    if not peek.strip() or peek.strip().startswith("#"):
                        continue
                    p_indent = len(peek) - len(peek.lstrip(" "))
                    if p_indent <= indent:
                        # empty block — treat as null
                        new_container = None
                        break
                    if peek.strip().startswith("- "):
                        new_container = []
                    else:
                        new_container = {}
                    break
                if isinstance(parent, list):
                    raise ValueError(f"cannot attach key to list at {line}")
                parent[k] = new_container if new_container is not None else None
                if new_container is not None:
                    stack.append((indent + 2, new_container))
            else:
                if isinstance(parent, list):
                    raise ValueError(f"cannot attach key to list at {line}")
                parent[k] = _yaml_scalar(v)
            continue

        raise ValueError(f"unparseable line: {line!r}")

    return root


# ---------- data loaders ----------

def _default_activity_log():
    return (BASE_DIR.parent.parent.parent / "LWS_Access_Codes" / "logs" / "activity.jsonl").resolve()


def _default_redemptions_log():
    return (BASE_DIR.parent.parent.parent / "LWS_Access_Codes" / "logs" / "redemptions.jsonl").resolve()


def load_activity(path, since):
    """Return list of activity rows newer than `since` (utc datetime)."""
    if not path.exists():
        return []
    rows = []
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                r = json.loads(line)
            except json.JSONDecodeError:
                continue
            ts = send_drip._parse_iso(r.get("ts", ""))
            if ts and ts >= since:
                rows.append(r)
    return rows


def load_redemptions(path):
    """Return {email_or_ip: [redemption rows]} — redemptions.jsonl only has
    code+ip+ua for our anonymous auth model. We attribute a paid tier to a
    user by cross-referencing on `email` field (present in Stripe-flow rows)
    or falling back to IP match against the subscriber's recorded IPs."""
    if not path.exists():
        return []
    rows = []
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                rows.append(json.loads(line))
            except json.JSONDecodeError:
                continue
    return rows


# ---------- per-user event aggregation ----------

# We correlate activity rows → subscriber by (a) explicit email in metadata,
# then (b) IP match, then (c) referral code if the subscriber has one.
# All three are best-effort — this is a nudge system, not billing.

def index_activity_by_user(activity_rows, subscribers):
    """Return {email: [activity_rows]} best-effort mapping."""
    # Build lookup tables
    email_of_ip = {}
    for sub in subscribers:
        email = sub.get("email")
        if not email:
            continue
        for ip in sub.get("_ips", []) or []:
            email_of_ip[ip] = email
        if sub.get("ip"):
            email_of_ip[sub["ip"]] = email

    by_email = defaultdict(list)
    for row in activity_rows:
        # 1. explicit email in metadata
        meta = row.get("metadata") or {}
        em = (meta.get("email") or "").lower().strip()
        if em:
            by_email[em].append(row)
            continue
        # 2. IP match
        ip = row.get("ip") or ""
        if ip and ip in email_of_ip:
            by_email[email_of_ip[ip]].append(row)
    return by_email


def user_tier(email, subscriber, redemptions):
    """Determine subscriber's current tier.

    Priority: explicit `tier` field on subscriber → most recent paid redemption
    matching email → subscriber.tier fallback → 'free'."""
    # Look for a paid redemption tied to this email
    paid_tiers = {"paid-personal", "alliance-founding", "alliance-bundle",
                  "alliance-bundle-founding", "lifetime"}
    for r in reversed(redemptions):
        r_email = (r.get("email") or "").lower().strip()
        if r_email == email.lower() and r.get("tier") in paid_tiers:
            return "paid"
    sub_tier = (subscriber.get("tier") or "").lower()
    if sub_tier and any(p in sub_tier for p in ("paid", "founding", "lifetime", "bundle")):
        return "paid"
    return "free"


def aggregate_user_events(rows, now):
    """Compute the summaries used by trigger conditions.

    Returns dict:
        tool_uses_last_7d, tool_uses_last_14d, tool_uses_last_30d
        tool_uses_last_7d.<tool>: per-tool
        event_counts_by_window: {window_hours: {event_name: count}}
        last_ts_by_event: {event_name: datetime}
    """
    windows_days = [1, 7, 14, 30]
    windows_hours = [1, 24, 48, 168]
    tool_counts = {d: 0 for d in windows_days}
    per_tool = {d: Counter() for d in windows_days}
    event_by_window_d = {d: Counter() for d in windows_days}
    event_by_window_h = {h: Counter() for h in windows_hours}
    last_ts_by_event = {}

    for r in rows:
        ts = send_drip._parse_iso(r.get("ts", ""))
        if not ts:
            continue
        event = r.get("event") or ("gate_check" if "valid" in r else "unknown")
        # last-seen tracking
        prev = last_ts_by_event.get(event)
        if prev is None or ts > prev:
            last_ts_by_event[event] = ts
        # tool count (gate_check + tool_action)
        tool = r.get("tool") or ""
        age = now - ts
        for d in windows_days:
            if age <= timedelta(days=d):
                if event in ("gate_check", "tool_action") or "valid" in r:
                    tool_counts[d] += 1
                    if tool:
                        per_tool[d][tool] += 1
                event_by_window_d[d][event] += 1
        for h in windows_hours:
            if age <= timedelta(hours=h):
                event_by_window_h[h][event] += 1

    return {
        "tool_counts_days": tool_counts,
        "per_tool_days": per_tool,
        "event_counts_days": event_by_window_d,
        "event_counts_hours": event_by_window_h,
        "last_ts_by_event": last_ts_by_event,
    }


# ---------- global signals ----------

def fetch_founding_count(url):
    """Query /api/founding-count; returns int or None on failure."""
    try:
        with urllib.request.urlopen(url, timeout=6) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            # endpoint shape: {"count": N, "cap": 100}
            return int(data.get("count") or data.get("claimed") or 0)
    except (urllib.error.URLError, ValueError, KeyError, OSError):
        return None


def fetch_plausible_events(site_id, api_key, days=7):
    """Optional: pull Plausible per-page aggregate for pricing_page_view etc.
    Returns dict {event_name: total_count} or {}. Non-fatal on failure."""
    if not api_key:
        return {}
    url = (
        f"https://plausible.io/api/v1/stats/aggregate?site_id={site_id}"
        f"&period={days}d&metrics=events&filters=event:name%3D%3Dpricing_page_view"
    )
    req = urllib.request.Request(url, headers={"Authorization": f"Bearer {api_key}"})
    try:
        with urllib.request.urlopen(req, timeout=6) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return data.get("results", {})
    except (urllib.error.URLError, ValueError, OSError):
        return {}


# ---------- condition evaluation ----------

_OP_RE = re.compile(r"^(>=|<=|==|!=|>|<)\s*(-?\d+(?:\.\d+)?)$")


def _cmp(actual, spec):
    """Match `actual` against a spec like '>=5' or '==foo'."""
    if spec is None:
        return actual is None
    if isinstance(spec, (int, float)):
        return actual == spec
    if isinstance(spec, list):
        return actual in spec
    spec = str(spec).strip()
    m = _OP_RE.match(spec)
    if m:
        op, val = m.group(1), float(m.group(2))
        a = float(actual or 0)
        return {
            ">=": a >= val, "<=": a <= val, "==": a == val, "!=": a != val,
            ">":  a > val,  "<":  a < val,
        }[op]
    # plain string equality
    return str(actual) == spec


def _extract_window(key, prefix):
    """`tool_uses_last_7d` → 7. `tool_uses_last_7d.hive` → (7, 'hive')."""
    rest = key[len(prefix):]
    m = re.match(r"^(\d+)d(?:\.(.+))?$", rest)
    if m:
        return int(m.group(1)), m.group(2)
    m = re.match(r"^(\d+)h(?:\.(.+))?$", rest)
    if m:
        return int(m.group(1)), m.group(2)
    return None, None


def _has_ever_fired(events, event_name):
    return event_name in events["last_ts_by_event"]


def eval_condition(cond, ctx):
    """cond: dict from YAML. ctx: {agg, user_tier, days_since_signup, lang,
    country, global_signals, subscriber}."""
    if not cond:
        return False
    agg = ctx["agg"]
    for key, spec in cond.items():
        # tool_uses_last_Nd or tool_uses_last_Nd.<tool>
        if key.startswith("tool_uses_last_"):
            n, tool = _extract_window(key, "tool_uses_last_")
            if n is None:
                return False
            if tool:
                actual = agg["per_tool_days"].get(n, Counter()).get(tool, 0)
            else:
                actual = agg["tool_counts_days"].get(n, 0)
            if not _cmp(actual, spec):
                return False
            continue
        # event_last_Nh / event_last_Nd — user fired the given event within window
        if key.startswith("event_last_"):
            rest = key[len("event_last_"):]
            m = re.match(r"^(\d+)([hd])$", rest)
            if not m:
                return False
            n, unit = int(m.group(1)), m.group(2)
            if unit == "d":
                counter = agg["event_counts_days"].get(n, Counter())
            else:
                counter = agg["event_counts_hours"].get(n, Counter())
            if counter.get(str(spec), 0) < 1:
                return False
            continue
        # last_event_gt_hours.<name>: '>=X' — hours since last fire >= X
        if key.startswith("last_event_gt_hours."):
            event_name = key[len("last_event_gt_hours."):]
            last_ts = agg["last_ts_by_event"].get(event_name)
            if not last_ts:
                return False
            hours = (ctx["now"] - last_ts).total_seconds() / 3600.0
            if not _cmp(hours, spec):
                return False
            continue
        # no_event_since: 'event_name' — user has NEVER fired this event
        if key == "no_event_since":
            if _has_ever_fired(agg, str(spec)):
                return False
            continue
        # global_signal.<key>: 'op X'
        if key.startswith("global_signal."):
            gkey = key[len("global_signal."):]
            actual = ctx["global_signals"].get(gkey)
            if actual is None:
                return False
            if not _cmp(actual, spec):
                return False
            continue
        # scalar keys
        if key == "tier":
            if not _cmp(ctx["user_tier"], spec):
                return False
            continue
        if key == "days_since_signup":
            if not _cmp(ctx["days_since_signup"], spec):
                return False
            continue
        if key == "lang":
            if not _cmp(ctx["lang"], spec):
                return False
            continue
        if key == "country_in":
            if isinstance(spec, list):
                if ctx["country"] not in spec:
                    return False
            elif not _cmp(ctx["country"], spec):
                return False
            continue
        # unknown key → skip (fail-open to avoid crashing on typos, but log)
        print(f"[warn] unknown condition key: {key}", file=sys.stderr)
    return True


# ---------- state ----------

def load_state(path):
    if not path.exists():
        return {"users": {}, "global": {}}
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return {"users": {}, "global": {}}


def save_state(path, state):
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(".tmp")
    tmp.write_text(json.dumps(state, indent=2, ensure_ascii=False), encoding="utf-8")
    tmp.replace(path)


# ---------- quiet hours ----------

def is_quiet_hours(now, lang, country, quiet_start, quiet_end):
    """Approximate: KR users get Asia/Seoul (UTC+9), everyone else UTC.
    Refinement possible later via IP-country → tz table."""
    if lang == "ko" or country in ("KR", "JP"):
        local = now + timedelta(hours=9)
    elif country in ("US", "CA"):
        local = now - timedelta(hours=5)  # rough US Central
    elif country in ("GB", "IE", "PT"):
        local = now  # WET/UTC
    elif country in ("DE", "FR", "IT", "ES", "NL"):
        local = now + timedelta(hours=1)  # CET
    else:
        local = now
    hour = local.hour
    if quiet_start <= quiet_end:
        return quiet_start <= hour < quiet_end
    # wraps midnight (default: 22..8)
    return hour >= quiet_start or hour < quiet_end


# ---------- pending queue for in-app ----------

def append_pending(path, entry):
    """in-app-nudge.js reads /api/nudge/pending which serves this file."""
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "a", encoding="utf-8") as f:
        f.write(json.dumps(entry, ensure_ascii=False) + "\n")


# ---------- main run loop ----------

def run(args):
    trig_path = BASE_DIR / "trigger_definitions.yaml"
    triggers_root = load_yaml(trig_path)
    triggers = triggers_root.get("triggers", []) or []
    if args.only:
        triggers = [t for t in triggers if t.get("id") == args.only]
        if not triggers:
            print(f"[error] no trigger with id={args.only!r}", file=sys.stderr)
            return 2

    subs_path = Path(os.environ.get("SUBSCRIBERS_FILE") or send_drip.DEFAULT_SUBSCRIBERS)
    activity_path = Path(os.environ.get("ACTIVITY_LOG") or _default_activity_log())
    redemptions_path = Path(os.environ.get("REDEMPTIONS_LOG") or _default_redemptions_log())
    state_path = Path(os.environ.get("NUDGE_STATE_FILE") or (BASE_DIR / "logs" / "nudge-state.json"))
    log_path = Path(os.environ.get("NUDGE_LOG_FILE") or (BASE_DIR / "logs" / "nudge-fires.jsonl"))
    pending_path = Path(os.environ.get("NUDGE_PENDING_FILE") or (BASE_DIR / "logs" / "nudge-pending.jsonl"))
    founding_url = os.environ.get("FOUNDING_COUNT_URL", "https://access-codes.r5tools.io/api/founding-count")
    quiet_start = int(os.environ.get("QUIET_HOURS_START", "22"))
    quiet_end = int(os.environ.get("QUIET_HOURS_END", "8"))

    now = datetime.now(timezone.utc)
    since = now - timedelta(days=30)

    subs = send_drip.load_subscribers(subs_path)
    if not subs:
        print(f"[info] no subscribers in {subs_path}")
        return 0

    activity = load_activity(activity_path, since)
    redemptions = load_redemptions(redemptions_path)
    by_user = index_activity_by_user(activity, subs)

    # Global signals
    founding_claimed = fetch_founding_count(founding_url)
    global_signals = {}
    if founding_claimed is not None:
        global_signals["founding_claimed"] = founding_claimed
    plausible_key = os.environ.get("PLAUSIBLE_API_KEY", "").strip()
    if plausible_key:
        _ = fetch_plausible_events(
            os.environ.get("PLAUSIBLE_SITE_ID", "r5tools.io"),
            plausible_key,
        )  # reserved for future cross-check; not merged into per-user agg

    state = load_state(state_path)
    state.setdefault("users", {})
    state.setdefault("global", {})

    # Evaluate every subscriber × every trigger.
    matches = []  # (sub, trigger, agg)
    for sub in subs:
        email = (sub.get("email") or "").lower().strip()
        if not email or sub.get("status") == "unsubscribed":
            continue
        joined = send_drip._parse_iso(sub.get("joined_at", "")) or now
        days_since_signup = (now - joined).days
        rows = by_user.get(email, [])
        agg = aggregate_user_events(rows, now)
        u_tier = user_tier(email, sub, redemptions)
        lang = sub.get("lang") or "en"
        country = ""  # not tracked on subscriber row today; enrich when available
        for row in rows[:5]:
            country = country or (row.get("country") or "")

        ctx = {
            "agg": agg,
            "user_tier": u_tier,
            "days_since_signup": days_since_signup,
            "lang": lang,
            "country": country,
            "global_signals": global_signals,
            "subscriber": sub,
            "now": now,
        }

        for t in triggers:
            if not eval_condition(t.get("condition") or {}, ctx):
                continue
            matches.append((sub, t, agg))

    if not matches:
        print("[info] no trigger matches")
        return 0

    # Apply rate limits (per-trigger cooldown + max_per_user + global 24h cap + quiet hours).
    to_send = []
    global_founding_broadcast = state["global"].get("founding_broadcast_sent", False)
    for sub, t, agg in matches:
        email = (sub.get("email") or "").lower().strip()
        action = t.get("action") or {}
        trig_id = t["id"]
        u_state = state["users"].setdefault(email, {"triggers": {}, "last_any_fire_ts": None})
        t_state = u_state["triggers"].setdefault(trig_id, {"fires": 0, "last_fire_ts": None})

        # max_per_user
        if t_state["fires"] >= int(action.get("max_per_user", 1)):
            continue
        # cooldown between fires of same trigger
        cd = int(action.get("cooldown_days", 30))
        last_fire = send_drip._parse_iso(t_state.get("last_fire_ts") or "")
        if last_fire and (now - last_fire) < timedelta(days=cd):
            continue
        # global 24h cap per user
        last_any = send_drip._parse_iso(u_state.get("last_any_fire_ts") or "")
        if last_any and (now - last_any) < timedelta(hours=24):
            continue
        # global broadcast one-shot for founding
        if trig_id == "founding_almost_out" and global_founding_broadcast:
            continue
        # quiet hours
        lang = sub.get("lang") or "en"
        country = ""
        for row in (by_user.get(email, []) or [])[:5]:
            country = country or (row.get("country") or "")
        if is_quiet_hours(now, lang, country, quiet_start, quiet_end):
            continue

        # delay_hours — postpone if trigger match is too recent. We proxy the
        # "match time" with the most-recent relevant event; if the newest
        # trigger-relevant event is younger than delay_hours, skip this run.
        delay = int(action.get("delay_hours", 0))
        if delay > 0:
            # pick the newest event ts seen for this user
            newest = max(agg["last_ts_by_event"].values()) if agg["last_ts_by_event"] else None
            if newest and (now - newest) < timedelta(hours=delay):
                continue

        to_send.append((sub, t, agg))

    print(f"[info] {len(to_send)} nudge(s) to send (of {len(matches)} matches)")

    if not to_send:
        return 0

    # Send loop.
    unsub_base = os.environ.get(
        "UNSUBSCRIBE_BASE", "https://access-codes.r5tools.io/api/drip/unsubscribe"
    )
    secret = os.environ.get("SERVER_SECRET", "")

    smtp = None
    if not args.dry_run:
        # Only connect if at least one send is going through email.
        email_sends = [x for x in to_send if (x[1].get("action") or {}).get("channel", "email") in ("email", "both")]
        if email_sends:
            smtp = send_drip._smtp_connect()

    sent = 0
    failed = 0
    try:
        for sub, t, agg in to_send:
            email = sub["email"]
            lang = sub.get("lang") or "en"
            action = t.get("action") or {}
            channel = action.get("channel", "email")
            template_base = action["template"]

            # Load template (falls back to EN if KR file is missing)
            template_path = BASE_DIR / "templates" / f"{template_base}-{lang}.md"
            if not template_path.exists():
                template_path = BASE_DIR / "templates" / f"{template_base}-en.md"
            if not template_path.exists():
                print(f"[error] missing template {template_base} for {email}", file=sys.stderr)
                failed += 1
                continue
            text = template_path.read_text(encoding="utf-8")
            meta, body = send_drip.parse_frontmatter(text)

            unsub_url = send_drip.unsubscribe_url(email, unsub_base, secret)

            # Personalize referral code placeholder if present
            ref_code = sub.get("referral_code") or f"R5-{email.split('@')[0].upper()[:6]}"
            body = body.replace("{{REFERRAL_CODE}}", ref_code)

            log_entry = {
                "ts": now.isoformat().replace("+00:00", "Z"),
                "email": email,
                "trigger_id": t["id"],
                "template": template_base,
                "lang": lang,
                "channel": channel,
                "dry_run": args.dry_run,
            }

            # In-app enqueue (if channel is in_app or both)
            if channel in ("in_app", "both"):
                pending_entry = {
                    **log_entry,
                    "subject": meta.get("subject", ""),
                    "cta_url": _extract_first_link(body),
                    "toast_text": meta.get("toast_text", meta.get("subject", "")),
                }
                if not args.dry_run:
                    append_pending(pending_path, pending_entry)
                print(f"[in-app] queued {t['id']} for {email}")

            # Email send (if channel is email or both)
            if channel in ("email", "both"):
                fake_sub = {"email": email}
                msg = send_drip.build_message(fake_sub, 0, meta, body, unsub_url)

                if args.dry_run:
                    print(f"[dry-run] would send {t['id']} ({lang}) to {email}: "
                          f"{meta.get('subject', '(no subject)')}")
                else:
                    try:
                        send_drip.send_one(smtp, msg)
                        sent += 1
                        print(f"[ok] sent {t['id']} ({lang}) to {email}")
                    except Exception as e:
                        failed += 1
                        log_entry["ok"] = False
                        log_entry["error"] = str(e)
                        send_drip.append_log(log_path, log_entry)
                        print(f"[fail] {email} {t['id']}: {e}", file=sys.stderr)
                        continue

            # State update
            if not args.dry_run:
                t_state = state["users"][email]["triggers"].setdefault(
                    t["id"], {"fires": 0, "last_fire_ts": None}
                )
                t_state["fires"] += 1
                t_state["last_fire_ts"] = now.isoformat().replace("+00:00", "Z")
                state["users"][email]["last_any_fire_ts"] = t_state["last_fire_ts"]
                if t["id"] == "founding_almost_out":
                    state["global"]["founding_broadcast_sent"] = True
                log_entry["ok"] = True
                send_drip.append_log(log_path, log_entry)

            # Pacing
            import time as _time
            _time.sleep(0.5)
    finally:
        if smtp is not None:
            try:
                smtp.quit()
            except Exception:
                pass

    if not args.dry_run:
        save_state(state_path, state)

    print(f"[done] sent={sent} failed={failed} dry_run={args.dry_run}")
    return 1 if failed and sent == 0 else 0


def _extract_first_link(body):
    m = re.search(r"\]\((https?://[^)]+)\)", body)
    return m.group(1) if m else "https://r5tools.io/"


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[1] if __doc__ else "")
    g = ap.add_mutually_exclusive_group()
    g.add_argument("--dry-run", action="store_true",
                   help="Print what would be sent, no SMTP, no state writes.")
    g.add_argument("--send", action="store_true",
                   help="Actually send (default mode; flag is for explicit cron scripts).")
    ap.add_argument("--only", metavar="TRIGGER_ID", default=None,
                    help="Only evaluate this trigger id.")
    args = ap.parse_args()

    # Default to dry-run if neither given — safe fallback.
    if not args.dry_run and not args.send:
        args.dry_run = True
        print("[info] neither --send nor --dry-run given; defaulting to --dry-run", file=sys.stderr)

    return run(args)


if __name__ == "__main__":
    sys.exit(main())
