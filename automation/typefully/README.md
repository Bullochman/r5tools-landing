# Typefully automation for r5tools.io

Scripts that push the r5tools.io X/Twitter content plan into
[Typefully](https://typefully.com/) via its public REST API. Everything
here is **schedule-only** — nothing posts immediately. You always get a
chance to eyeball the queue in Typefully before a tweet fires.

## What's here

| File | What it does |
|---|---|
| `typefully_client.py` | Thin Python wrapper around Typefully's v1 API. Handles auth, thread-composition, media upload attempts, 429/5xx backoff. |
| `schedule_launch_thread.py` | One-shot: reads `marketing/SEND-TODAY/twitter-launch-thread/typefully-import.json` and schedules the 12-tweet launch thread. |
| `schedule_content_calendar.py` | Batch: parses `marketing/x-twitter.md` + `marketing/SEND-TODAY/twitter-schedule.csv` and schedules Days 1..30 of the calendar as single tweets. |
| `typefully-setup.md` | One-pager for Evan: plan/pricing, API-key steps, verification, fallback plan if the API changes. |
| `logs/` | Everything the scripts do lands here (`launch-thread.log`, `schedule.log`). |

## Prereqs

```bash
pip install requests
```

That is the only runtime dep. `zoneinfo` is stdlib (3.9+).

## Get an API key

1. Sign in to Typefully (web app).
2. Settings -> Integrations (or **API** if that tab exists in your plan) -> Generate key.
3. Copy the `tf_...` value.
4. Export it in your shell:

   ```bash
   export TYPEFULLY_API_KEY="tf_your_key_here"
   ```

   To persist it, add that line to `~/.zshrc` (macOS default) and
   **open a new terminal window** — env vars in the current shell are
   stale after editing rc files.

## Dry-run first

Both scripts support `--dry-run`. Nothing is sent to Typefully.

```bash
# Launch thread (12 tweets, scheduled Tue 2026-07-21 20:15 America/New_York)
python3 schedule_launch_thread.py --dry-run

# 30-day calendar (Days 1..30 as single tweets, 7:15 PM CT each)
python3 schedule_content_calendar.py --dry-run
```

The dry-run prints every tweet with its scheduled time and char count.
Look for `SKIPPED (over 280 chars…)` warnings — those tweets need
trimming in the source file before they'll get scheduled.

## For-real runs

```bash
# Set the API key once per shell.
export TYPEFULLY_API_KEY="tf_your_key_here"

# 1. Launch thread first (schedules for Tue 2026-07-21 20:15 ET by default)
python3 schedule_launch_thread.py

# 2. Then the 30-day queue (starts Day 1 = Wed 2026-07-22 19:15 CT)
python3 schedule_content_calendar.py
```

Both scripts are **idempotent**: they call `list_scheduled()` first and
skip tweets whose first 60 chars match anything already in the queue.
Safe to re-run.

Every action lands in `logs/` with timestamps.

## Useful flags

| Flag | Effect |
|---|---|
| `--dry-run` | validate + preview, never touch Typefully |
| `--skip-media` | schedule text-only (use when Typefully upload endpoint is unavailable in your plan) |
| `--days 3,5,10-14` | (calendar only) restrict to a subset |
| `--at "2026-07-22T19:00" --tz America/New_York` | (launch thread only) override the schedule time |
| `--verbose` | debug-level logging |

## Weekly re-run cron (optional but recommended)

Typefully has been known to drop drafts on plan-downgrades or account
outages. Because both scripts are idempotent, a weekly re-run is safe
and catches drift.

```cron
# ~/Library/LaunchAgents/... or plain crontab -e on macOS
# Every Sunday 6:00 AM local: replay the calendar (skips already-scheduled)
0 6 * * 0 cd /Users/evanjones/claudecode/r5tools/r5tools-landing/automation/typefully && \
  /usr/bin/env TYPEFULLY_API_KEY="$(security find-generic-password -a evanjones -s typefully -w)" \
  /usr/bin/python3 schedule_content_calendar.py >> logs/cron.log 2>&1
```

The `security find-generic-password` bit reads the key from macOS
Keychain — safer than hard-coding it. Add to Keychain once:

```bash
security add-generic-password -a evanjones -s typefully -w tf_your_key
```

## What breaks if Typefully changes their API

- **Response shape drift**: `TypefullyClient._parse_draft` pulls id /
  share_url / schedule_date from multiple possible keys defensively.
  If Typefully renames the fields you'll see `Draft response missing
  id` — bump the key list at the top of `_parse_draft`.
- **Thread separator change**: currently `\n\n\n\n`. If Typefully
  switches (unlikely), update `THREAD_SEPARATOR` in `typefully_client.py`.
- **Media upload endpoint**: the API doesn't publicly document media
  upload. The client probes `/upload/`, `/media/upload/`,
  `/drafts/upload/` in that order and logs a warning if none works.
  When that happens, run with `--skip-media` and attach in the
  Typefully composer manually — or rehost the images on a CDN
  (r5tools.io itself works fine) and update `typefully-import.json`
  media paths to full URLs.
- **Full API removal**: fallback is Buffer. See `typefully-setup.md`
  for the migration outline.

## Files consumed

- `../../marketing/SEND-TODAY/twitter-launch-thread/typefully-import.json`
- `../../marketing/SEND-TODAY/twitter-schedule.csv`
- `../../marketing/x-twitter.md`
- `../../marketing/SEND-TODAY/twitter-launch-thread/media/*.png`
