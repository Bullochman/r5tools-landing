# Server hooks required by the conversion-nudge system

The trigger engine + in-app nudge script both work **today** against files that
LWS_Access_Codes/server.py already writes (`activity.jsonl`,
`drip_subscribers.jsonl`, `redemptions.jsonl`) — no server changes are strictly
required to send email nudges.

But two capabilities would meaningfully improve the system, and the in-app
toast requires one of them. Documented here so Evan can add them when he
wants, not by this task.

---

## 1. `GET /api/nudge/pending` — client fetch endpoint (in-app toast)

**Consumer:** `in-app-nudge.js` calls this on every landing/tool page load.

**Auth:** Reads the `lws_unlock_code` cookie already set by
`LWSAccessCodes.gate()`. Server maps cookie → email via the
drip_subscribers.jsonl row that was written on subscribe (or falls back to no
match → returns empty list). No admin auth; scope is read-only,
visitor-specific, non-sensitive.

**Response:**
```json
{
  "pending": [
    {
      "trigger_id": "high_usage_free",
      "template": "high-usage-upgrade",
      "lang": "en",
      "subject": "You're on a roll — quick heads-up about your free tier",
      "toast_text": "You've used 5+ tools this week — unlock the full suite for $30 (one time).",
      "cta_url": "https://r5tools.io/#pricing",
      "expires_at": "2026-07-18T14:00:00Z"
    }
  ]
}
```

**Implementation sketch:**
```python
def handle_nudge_pending(self):
    email = self._email_for_cookie(self._cookie("lws_unlock_code"))
    if not email:
        return self._json({"pending": []})
    pending = []
    pending_file = Path(NUDGE_PENDING_FILE)  # matches trigger_engine env var
    if pending_file.exists():
        cutoff = datetime.now(timezone.utc) - timedelta(hours=48)
        with open(pending_file, "r") as f:
            for line in f:
                try:
                    e = json.loads(line)
                except json.JSONDecodeError:
                    continue
                if e.get("email", "").lower() != email.lower():
                    continue
                ts = _parse_iso(e.get("ts", ""))
                if ts and ts >= cutoff:
                    pending.append({
                        "trigger_id": e["trigger_id"],
                        "template": e["template"],
                        "lang": e.get("lang", "en"),
                        "subject": e.get("subject", ""),
                        "toast_text": e.get("toast_text", e.get("subject", "")),
                        "cta_url": e.get("cta_url", "https://r5tools.io/"),
                    })
    return self._json({"pending": pending})
```

**Cache headers:** `Cache-Control: no-store` — the pending list is
visitor-specific and short-lived.

**CORS:** `Access-Control-Allow-Origin: https://r5tools.io` (or the same
allowlist already used by `/api/refer/*`). `Access-Control-Allow-Credentials: true`
required because the fetch is `credentials: "include"`.

---

## 2. `GET /api/user-events?email=X` — admin-auth activity readout

**Consumer:** trigger_engine.py could optionally consume this instead of
reading `activity.jsonl` directly, which matters once the server runs on
Railway and the engine on a different host.

**Auth:** Bearer `ADMIN_TOKEN` (same token already used by
`/api/admin/refer/*`).

**Query params:**
- `email` — required, the subscriber to look up
- `days` — optional, default 30, max 90

**Response:**
```json
{
  "email": "someone@example.com",
  "since": "2026-06-17T00:00:00Z",
  "events": [
    {
      "ts": "2026-07-16T14:32:11Z",
      "event": "gate_check",
      "tool": "hive",
      "tier": "free-warzone",
      "country": "KR",
      "referer": "https://hive.r5tools.io/"
    }
  ],
  "counts": {
    "gate_check": 12,
    "pricing_page_view": 2,
    "purchase_click": 1
  }
}
```

**Implementation sketch:** Reuse `read_activity()`, filter rows where
`metadata.email == query.email OR ip in email_ip_set`, return most-recent-N
with a summary.

---

## 3. Existing endpoints already reused (no changes)

| Endpoint | Used by | Notes |
|---|---|---|
| `GET /api/founding-count` | trigger_engine.py | For `founding_almost_out` global signal. |
| `GET /api/drip/unsubscribe` | send_drip.py (inherited) | Unsubscribe token already valid across both drip + nudges — same SERVER_SECRET signs. |
| `POST /api/drip/subscribe` | (upstream) | Nudges just read the resulting `drip_subscribers.jsonl` — no new write path. |
| `POST /api/refer/attribute` | analytics.js | Not touched by nudges; but the referral code we personalize into `{{REFERRAL_CODE}}` comes from `GET /api/refer/me` which already exists. |

---

## Suppression parity with the drip

The nudge engine treats `status == "unsubscribed"` in
drip_subscribers.jsonl as a hard skip. So one unsub click kills BOTH the
time-based drip AND the behavior-based nudges — which is what the RFC 8058
one-click unsubscribe legally requires anyway.

If Evan later wants a "kill nudges but keep drip" or vice-versa option,
add a `nudge_status` column to subscribers and gate on that instead.

---

## Rollout order

1. Ship trigger_engine.py + templates + cron → email-channel nudges work
   immediately with zero server changes (reads local activity.jsonl).
2. Add `GET /api/nudge/pending` when in-app toast goes live.
3. Add `GET /api/user-events` only when the engine host is separated from the
   activity log host.
