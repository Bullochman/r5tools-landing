# Typefully — setup one-pager (for Evan)

Everything you need to get Typefully API scheduling working end-to-end.
Read top to bottom. About 5 min.

---

## 1. Sign up

- **URL:** https://typefully.com/
- **Plan you need:** **Starter** at ~$12.50/mo (annual) or $15/mo
  (monthly). This is the lowest tier that unlocks:
  - Scheduling (free tier is draft-only, no schedule)
  - API access (free tier has no API)
  - Threads with more than 3 tweets
- **Recommended:** Start on the monthly plan for the first 30 days so
  you can bail if it doesn't stick. Downgrade to annual at Day 30 if
  you're using it.
- **Connect your X/Twitter account** inside Typefully first — Settings
  -> Connected Accounts -> Add X. Without this connection Typefully
  can accept scheduled drafts but they'll fail at post time.

## 2. Grab the API key

1. Open https://typefully.com/settings/integrations (or Settings ->
   Integrations from the sidebar; some plans surface it under
   Settings -> **API**).
2. Click **Generate API key**. It'll be a `tf_...` string.
3. Copy it once — Typefully doesn't show it again after you close the
   dialog. If you lose it, generate a new one and revoke the old.

## 3. Set it in your shell

```bash
# One-shot for the current shell:
export TYPEFULLY_API_KEY="tf_paste_here"

# Persist across sessions — add this line to ~/.zshrc:
echo 'export TYPEFULLY_API_KEY="tf_paste_here"' >> ~/.zshrc
```

**Open a new terminal window after editing `~/.zshrc`** — the current
one has stale env.

For extra safety, prefer macOS Keychain over rc-file plaintext:

```bash
security add-generic-password -a evanjones -s typefully -w tf_paste_here

# Then when running scripts:
export TYPEFULLY_API_KEY="$(security find-generic-password -a evanjones -s typefully -w)"
```

## 4. Run the scheduler

From `~/claudecode/r5tools/r5tools-landing/automation/typefully/`:

```bash
# Preview first — no API calls made
python3 schedule_launch_thread.py --dry-run
python3 schedule_content_calendar.py --dry-run

# When previews look right, schedule for real
python3 schedule_launch_thread.py
python3 schedule_content_calendar.py
```

The launch thread scheduler targets **Tue 2026-07-21 8:15 PM ET** by
default. Override with `--at "YYYY-MM-DDTHH:MM" --tz America/New_York`.

## 5. Verify in the Typefully dashboard

1. Go to https://typefully.com/
2. Click **Queue** in the left sidebar. The 12-tweet thread should
   appear as one item at the top (or at the 2026-07-21 20:15 slot),
   and Days 1..30 should populate the days beneath it.
3. Click the thread. You should see 12 composer cards with the media
   attached to tweets 1-9 and 12.
4. **Media check:** if you see grey "missing media" placeholders on
   any tweet, the API's upload endpoint isn't available on your plan.
   Two options:
   - Manually drag-drop each `tweet-NN-*.png` into the composer from
     `marketing/SEND-TODAY/twitter-launch-thread/media/`.
   - Upload the images to a CDN (r5tools.io itself works — drop them in
     `r5tools-landing/marketing/SEND-TODAY/twitter-launch-thread/media/`
     which is served from the site) and change the paths in
     `typefully-import.json` to full `https://r5tools.io/...` URLs.
     Then re-run `schedule_launch_thread.py` (it'll skip because
     already scheduled — cancel the existing draft first from
     Typefully's Queue -> ... -> Delete).
5. Confirm each scheduled slot shows a valid X account handle on the
   left-hand-side of the composer. If it says "no account connected"
   Typefully will silently fail at post time — go back to Step 1.

## 6. When something is off

**"401 Unauthorized" from the script**
The API key is wrong, revoked, or your plan doesn't include API
access. Regenerate at Settings -> Integrations.

**"429 rate-limited"**
The client already backs off automatically. If it happens more than
once per run, you're batching too fast — split the calendar into
weeks with `--days 1-7`, `--days 8-14`, etc.

**"Draft response missing id"**
Typefully changed the API response shape. Open an issue in this
folder's README (there's a "What breaks if Typefully changes their
API" section). Meanwhile: schedule manually via Typefully's UI copy-
paste from `typefully-import.json`.

**Tweet is over 280 chars**
The script logs it and skips. Edit the source (`x-twitter.md` for the
30-day calendar, `typefully-import.json` for the launch thread) and
re-run.

**Scheduled tweet didn't post at the scheduled time**
- Check Typefully -> Settings -> Connected Accounts. If your X token
  expired (they die every ~90 days) Typefully queues but never sends.
  Reconnect X and Typefully will retry.
- Check the tweet in Queue for a red "failed" badge.

## 7. Fallback if Typefully disappears

Not a hypothetical — Publer bought Buffer and Buffer bought Typefully
in the last couple of years (verify current ownership before relying).
If Typefully suddenly changes plans or shuts the API down mid-campaign:

1. **Buffer** (buffer.com) — same $6-15/mo tier, has an API. Their
   thread scheduling is worse (they'll insert a 1-minute delay between
   tweets you can't reduce, and the media queue is uglier), but it
   works. Client rewrite is ~half a day.
2. **X native scheduling** — free, but no threads and no batch import.
   You'd manually paste each of the 30 days one at a time using
   X.com's compose window. Painful; only viable as an emergency-only
   fallback for one week.
3. **Zapier -> X** — you can build a "on new row in Google Sheet ->
   post to X at scheduled time" Zap that mimics what these scripts do.
   No thread support though (Zapier posts tweets one at a time, which
   breaks the thread rendering on X).

Preferred fallback: **Buffer** for the calendar, **manual X.com
compose** for the launch thread (do it live from your phone at
8:15 PM ET so replies stack cleanly).

---

## Reference

- API docs: https://support.typefully.com/en/articles/8718287-typefully-api
- Pricing: https://typefully.com/pricing
- X plan tier guide: https://help.x.com/en/using-x/x-premium
- Source files this pulls from:
  - `../../marketing/SEND-TODAY/twitter-launch-thread/typefully-import.json`
  - `../../marketing/SEND-TODAY/twitter-schedule.csv`
  - `../../marketing/x-twitter.md`
