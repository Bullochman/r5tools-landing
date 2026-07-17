# Testimonial API endpoints — server-hook spec

Endpoints to add to `LWS_Access_Codes/server.py`. Do NOT add these blindly —
Evan will paste them in when he's ready to accept live submissions. Until
then, the frontend form (`/testimonial-form.html`) will POST to a 404 on the
production API and the user will see the network-error toast.

All data lives in JSONL files under `LWS_Access_Codes/logs/`:

| File | Written by | Read by |
|---|---|---|
| `testimonials-pending.jsonl`   | `POST /api/testimonials/submit`   | `moderator.py`, admin UI |
| `testimonials-approved.jsonl`  | `moderator.py`, `POST /admin/approve` | `GET /api/testimonials/list`, `inject_to_heroes.py` |
| `testimonials-rejected.jsonl`  | `moderator.py`, `POST /admin/reject`  | audits |
| `testimonials-withdrawn.jsonl` | `moderator.py withdraw`, unsubscribe hook | `inject_to_heroes.py` (filters out) |
| `../automation/testimonials/logs/asks.jsonl` | `capture.py`                   | rate-limit budget in `capture.py` |

---

## POST /api/testimonials/submit

Public endpoint. Called by `testimonial-form.html` on submit.

### Request body (application/json)

```json
{
  "user": "eyJzIjoiYWJjMTIzIiwidCI6InRvb2xfdXNlXzUi...",
  "quote": "The Freeze-Risk Dashboard saved my whole alliance.",
  "name": "RONY-R5",
  "warzone": 2007,
  "role": "R5",
  "rating": 5,
  "consent": true,
  "lang": "en",
  "page_open_at": "1712345678901",
  "submitted_at": "2026-07-17T15:22:03.000Z",
  "time_on_page_ms": 43210
}
```

### Validation

- `quote`: 40–500 chars, plain text (strip HTML). Reject if empty or > 500.
- `name`: 2–60 chars, allow letters + numbers + spaces + `- _ .` + CJK ranges.
- `warzone`: 1–9999 or null.
- `role`: must be exactly one of `R5`, `R4`, `member`.
- `rating`: null or integer 1–5.
- `consent`: must be `true` — reject with 400 otherwise ("consent required").
- `lang`: one of `en, ko, ja, pt, es`.
- `time_on_page_ms`: must be >= 3000 (bot filter: real humans can't fill this
  form in under 3s). Reject with 400 as "too fast".

### `user` token verification

The `user` field is the JWT-lite hash produced by `capture.py::make_user_hash`.
It's `base64url(payload).base64url(hmac)` where payload =
`{"s":"<subscriber_id>","t":"<trigger>","i":<issued>,"e":<expires>}`.

- If token verifies AND `payload.e > now`, mark the row as
  `verified_paid_user: true` iff the subscriber has a paid tier in
  `users.json` / `codes.json`.
- If token is missing or invalid, still ACCEPT the submission but flag
  `verified_paid_user: false` and `unsolicited: true`. Moderator sees both.

### Anti-abuse (server side)

- **Rate limit per IP:** max 3 submissions per IP per 24h. 429 after.
- **Rate limit per token:** max 1 accepted submission per verified token.
- **Duplicate quote hash:** SHA1 of the quote text; if the same hash already
  exists in `pending|approved|rejected`, reject as 409 "duplicate".
- **Profanity/complaint pre-flag:** run the same regex as `moderator.py::is_complaint`
  and `is_profane`; if either fires, still write to pending but set
  `pre_flag: ["complaint"|"profanity"]` so moderator triage sees it first.

### Response

```json
{ "ok": true, "id": "t_20260717_a3b1c2" }
```

`id` format: `t_YYYYMMDD_<6-char random>`. This is what
`moderator.py withdraw <id>` operates on.

### Side effect: referral credit

On successful accept AND consent, add `$5` to the submitter's referral
balance (via `referrals.json.ledger`, same code as
`referrals.py::credit_referrer` but with source `testimonial_thanks`). Only
fires for verified tokens (otherwise we don't know who to credit).

---

## GET /api/testimonials/list

Public endpoint. Called by `testimonials.html` on load.

### Query params

| Param | Default | Meaning |
|---|---|---|
| `lang` | `all` | `en, ko, ja, pt, es, all` — case-insensitive |
| `role` | `all` | `R5, R4, member, all` |
| `limit` | 20 | max results, capped at 100 server-side |
| `min_rating` | 1 | filter out below this rating |
| `verified_only` | false | if `true`, exclude unverified submissions |

### Response

```json
{
  "items": [
    {
      "id": "t_20260717_a3b1c2",
      "quote": "The Freeze-Risk Dashboard saved my alliance.",
      "name": "RONY-R5",
      "role": "R5",
      "warzone": 2007,
      "rating": 5,
      "lang": "en",
      "verified_paid_user": true,
      "approved_at": "2026-07-17T21:04:00Z"
    }
  ],
  "aggregate": {
    "count": 42,
    "avg_rating": 4.6,
    "warzones_represented": 18
  }
}
```

**Never return** email, subscriber_id, IP, page_open_at, or any moderation notes.

### Caching

Send `Cache-Control: public, max-age=300` (5 min). This endpoint is hit on
every `testimonials.html` load; approvals only happen a few times a day.

---

## POST /api/admin/testimonials/approve

Admin-authed. Same auth pattern as existing `/api/admin/*` endpoints
(bearer token from `ADMIN_TOKEN` env var).

### Request

```json
{ "id": "t_20260717_a3b1c2", "note": "optional moderator note" }
```

Moves the row from pending → approved, sets `approved_at` and
`moderation.decision = "approved"`.

## POST /api/admin/testimonials/reject

### Request

```json
{
  "id": "t_20260717_a3b1c2",
  "reason": "spam|offensive|low-quality|off-topic|duplicate|complaint|unverifiable",
  "note": "optional"
}
```

Moves pending → rejected. Reason must match the allowed set from
`moderator.py::REJECT_REASONS`.

## POST /api/admin/testimonials/withdraw

Same shape as reject but moves from approved (or pending) → withdrawn.
Called when a user emails us asking to be removed.

---

## GET /api/testimonials/aggregate

Public. Read by the JSON-LD `SoftwareApplication.aggregateRating` on the
homepage. Also served from `/aggregate-rating.json` when the nightly cron
has written a static copy (preferred, cheaper).

### Response

```json
{ "count": 42, "avg_rating": 4.6, "generated_at": "2026-07-17T04:00:00Z" }
```

**Rule:** if `count < 5`, return HTTP 204 (no content). The homepage script
should NOT inject an aggregateRating schema in this case — Google flags
low-count aggregate reviews as manipulative.

---

## Data schema (canonical)

Each row in `testimonials-pending|approved|rejected|withdrawn.jsonl`:

```json
{
  "id": "t_20260717_a3b1c2",
  "quote": "...",
  "name": "RONY-R5",
  "warzone": 2007,
  "role": "R5",
  "rating": 5,
  "lang": "en",
  "consent": true,
  "verified_paid_user": true,
  "subscriber_id": "abc123xyz",
  "email": "hidden-except-in-pending",
  "trigger": "unlock_success",
  "ip_hash": "sha1-of-ip-do-not-store-raw-ip",
  "user_agent": "...",
  "submitted_at": "2026-07-17T15:22:03Z",
  "time_on_page_ms": 43210,
  "pre_flag": [],
  "moderation": {
    "decision": "approved|rejected|pending",
    "reason": "if rejected",
    "at": "2026-07-17T21:04:00Z",
    "note": ""
  },
  "approved_at": "2026-07-17T21:04:00Z",
  "withdrawn_at": null,
  "withdraw_reason": null
}
```

- **email is stored in pending** so the moderator can email the person back.
  On approve/reject, drop the email field before writing to approved/rejected
  jsonls. This limits blast radius if those files ever leak.
- **ip is never stored raw** — only `sha1(ip + SERVER_SECRET)` for dedup.

---

## Dedup rules

1. **By id:** never accept the same id twice (obvious).
2. **By quote hash:** SHA1 of normalized quote (lowercase + strip whitespace).
   Reject at submit time as 409.
3. **By subscriber_id + trigger:** capture.py already dedupes at ask time
   (asks.jsonl rate limit), but server should also refuse a 2nd submit from
   the same verified token — return the existing id.

---

## Spam protection notes

- **JS time-on-page check** (already in `testimonial-form.html`): field
  `time_on_page_ms` is client-computed. Server should NOT trust it
  absolutely — pair it with the IP rate limit.
- **No CAPTCHA yet.** Add hCaptcha if pending queue starts filling with
  bot spam faster than moderator can drain it.
- **Discord firehose:** post every new approval + rejection to the
  `#testimonials-mod` channel via `notify_webhook.json` (same infra as
  the referral firehose). Gives Evan a real-time feed on his phone.

---

## Wiring order (when Evan is ready)

1. Add the four endpoints to `server.py` (approve/reject/submit/list).
2. Add the aggregate-rating nightly cron:
   `python3 automation/testimonials/aggregate_rating.py --write`
3. First test: submit via the form on staging with a known token,
   confirm it lands in `testimonials-pending.jsonl`.
4. Run `moderator.py review` to approve it.
5. Run `inject_to_heroes.py --lang en --min 1 --apply` — verify the
   PLACEHOLDER card gets replaced by the real one on `/index.html`.
6. Revert (git checkout) if unhappy — the block is fenced by markers,
   trivial to restore.
