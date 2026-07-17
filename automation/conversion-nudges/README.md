# Conversion Nudges — trigger-based nudge system for r5tools.io

Behavior-driven complement to the time-based drip
(`marketing/emails/send_drip.py`). Where the drip sends day 0–7 emails to
every unlock-code subscriber on a fixed schedule, this system watches
`activity.jsonl` and fires a targeted nudge only when a subscriber matches
a specific pattern (high usage + still free, pricing page view without
convert, abandoned Stripe checkout, KR active user, etc.).

## What's here

| File | Purpose |
|---|---|
| `trigger_definitions.yaml` | Declarative trigger config (6 triggers today). |
| `trigger_engine.py` | Loads YAML, evaluates against activity.jsonl + subscribers, sends via `send_drip.py`'s SMTP path. |
| `templates/*.md` | 6 nudge templates × 2 langs = 12 files. Same frontmatter shape as the drip. |
| `in-app-nudge.js` | Client-side bottom-right toast; reads `/api/nudge/pending` + fires local rules. |
| `server-hooks.md` | Endpoints needed for full functionality (in-app requires `/api/nudge/pending`). |
| `crontab.example` | Hourly `--send` + daily dry-run + weekly log rotation. |
| `run.sh` | Cron wrapper that sources `.env`. |
| `logs/` | `nudge-state.json` (per-user fire history), `nudge-fires.jsonl` (append-only log), `nudge-pending.jsonl` (in-app queue). |

## Guarantees

- **Max 1 nudge per user per 24h** across ALL triggers.
- **Quiet hours 10 PM – 8 AM** in visitor's local tz (approx; refined per country).
- **Same unsubscribe list as the drip.** One click kills both.
- **Every template is genuinely useful** even if the reader doesn't upgrade — reason for the value-first, no-shame tone.
- **All triggers have `max_per_user` caps** so nobody gets more than 1–2 sends of the same nudge over their whole lifecycle.

## Wiring in-app-nudge.js

Add to `build_analytics_inject.py` alongside the existing analytics injection:

```python
inject_script("automation/conversion-nudges/in-app-nudge.js")
```

Or hand-add to the pages that should show toasts (refer.html, unlock.html, index.html, tool pages) before the closing `</body>`:

```html
<script defer src="/automation/conversion-nudges/in-app-nudge.js"></script>
```

## Environment variables (setup checklist)

### Required for `--send` mode

Inherited from `send_drip.py` (must match, since we reuse its SMTP + unsubscribe path):

- `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`
- `SMTP_PORT` (optional; default 587 STARTTLS / 465 SSL)
- `SMTP_SSL` (optional; "1" = implicit SSL)
- `FROM_EMAIL` (default `evan@r5tools.io`)
- `FROM_NAME` (default `"Evan @ r5tools"`)
- `SERVER_SECRET` — **must** match `LWS_Access_Codes/server.py` so unsubscribe tokens verify
- `UNSUBSCRIBE_BASE` (default `https://access-codes.r5tools.io/api/drip/unsubscribe`)

### Nudge-specific

- `ACTIVITY_LOG` — path to `LWS_Access_Codes/logs/activity.jsonl` (default is relative)
- `REDEMPTIONS_LOG` — path to `LWS_Access_Codes/logs/redemptions.jsonl` (default relative)
- `SUBSCRIBERS_FILE` — path to `drip_subscribers.jsonl` (default relative — same as `send_drip.py`)
- `NUDGE_STATE_FILE` — per-user fire-history JSON. Default `logs/nudge-state.json` here.
- `NUDGE_LOG_FILE` — append-only fire log. Default `logs/nudge-fires.jsonl`.
- `NUDGE_PENDING_FILE` — client-readable in-app queue. Default `logs/nudge-pending.jsonl`.
- `FOUNDING_COUNT_URL` — default `https://access-codes.r5tools.io/api/founding-count`.
- `QUIET_HOURS_START` — default `22`.
- `QUIET_HOURS_END` — default `8`.

### Optional

- `PLAUSIBLE_API_KEY` + `PLAUSIBLE_SITE_ID` — pulls cross-check aggregates if set.

## How to add a new trigger

1. Add a block to `trigger_definitions.yaml` under `triggers:` with a unique `id`.
2. Write the condition using the vocabulary in the file header (`tool_uses_last_Nd`, `event_last_Nh`, `no_event_since`, `last_event_gt_hours.<name>`, `tier`, `lang`, `global_signal.<key>`).
3. Add two templates: `templates/<template>-en.md` and `templates/<template>-ko.md`. Copy the frontmatter from an existing pair; keep the body <300 words, single CTA.
4. Dry-run: `./run.sh --dry-run --only <trigger_id>` — verify at least one subscriber matches and nothing crashes.
5. Enable in production by removing `--only` and letting hourly cron pick it up.

## Adding a NEW condition operator

Extend `trigger_engine.py::eval_condition`. The `_cmp` helper handles the `>=`/`<=`/`==` comparators automatically — you only need to add the extraction case for new key shapes (e.g. `event_count_last_Nd.<event>` for cross-event counts).

## Debugging

**"Trigger never fires."** Run `--dry-run --only <id>`. If no matches show, echo the ctx for a known-active user by inserting a `print(ctx)` in `eval_condition`.

**"Sent twice."** Check `logs/nudge-state.json` for the user + trigger — `fires` and `last_fire_ts` are the caps that prevent this. If state is corrupt, delete just that user's entry (JSON is human-editable).

**"Send silently fails."** `logs/nudge-fires.jsonl` has an `ok: false` + `error` field on every failure. `smtplib.SMTPAuthenticationError` = SMTP creds; `[Errno 60]` = network to SMTP host.

## Local rules vs server rules

`in-app-nudge.js` runs two rules locally (`high_usage_local`, `pricing_view_local`) so the toast can fire the moment a session pattern completes — no server roundtrip needed. Server-side triggers cover everything cross-session (needs >24h of history, needs cross-user global signals). Don't over-invest in local rules; they can't see anything the current tab doesn't emit.

## Related

- Time-based drip: `../../marketing/emails/send_drip.py` + `../../marketing/emails/{en,ko}/day*.md`.
- Analytics façade: `../../analytics.js` — the `r5t.track()` function every nudge lifecycle event uses.
- Access-codes server (event source + subscriber writer + unsubscribe verifier): `~/claudecode/r5tools/LWS_Access_Codes/server.py`.
