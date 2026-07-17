# testimonials — capture, moderate, display

End-to-end flow for turning real r5tools users into real testimonials on the
site. **No fabrication ever.** If there aren't enough approved quotes in a
language, the placeholder cards stay.

---

## Pipeline (data flow)

```
    LWS_Access_Codes/logs/activity.jsonl        ←  every gate_check + tool_action
    LWS_Access_Codes/logs/drip_subscribers.jsonl←  everyone in the drip
                     │
                     ▼
              capture.py           (this dir, cron: hourly)
              ├─ scans behavior + subscriber tier
              ├─ picks users at real-intent moments
              └─ emails personalized /testimonial-form.html link
                     │
                     ▼
        r5tools-landing/testimonial-form.html     (public form)
                     │
                     ▼
        POST /api/testimonials/submit             (server.py — see server-hooks.md)
                     │
                     ▼
  LWS_Access_Codes/logs/testimonials-pending.jsonl
                     │
                     ▼
             moderator.py            (Evan, manual, or --auto)
              ├─ approve → testimonials-approved.jsonl
              └─ reject  → testimonials-rejected.jsonl
                     │
                     ▼
          inject_to_heroes.py       (cron: daily)
          └─ swaps PLACEHOLDER cards for top 3 per lang
                     │
                     ▼
          aggregate_rating.py       (cron: nightly)
          └─ writes /aggregate-rating.json for JSON-LD
```

---

## Files

| File | What it does |
|---|---|
| `capture.py`           | Scans subscribers, emails ask link at the 4 trigger moments |
| `moderator.py`         | CLI: `review`, `list`, `stats`, `withdraw`, `bulk-reject` |
| `inject_to_heroes.py`  | Replaces `<!-- r5tools:testimonials v1 START/END -->` block on each hero page |
| `aggregate_rating.py`  | Nightly rollup → `/aggregate-rating.json` for JSON-LD |
| `server-hooks.md`      | Endpoint spec — endpoints to add to `LWS_Access_Codes/server.py` (Evan wires when ready) |
| `email-templates.md`   | Voice + placeholders spec |
| `templates/*.md`       | 15 template files: 3 triggers × 5 langs (drip Day 7 covers the 4th) |
| `logs/asks.jsonl`      | Every ask sent (dry-run or real) — used for 90d per-user rate limit |

---

## First-run setup

1. Create the JWT secret used by the token-in-URL:
   ```bash
   head -c 32 /dev/urandom | base64 > ../../../LWS_Access_Codes/.jwt-secret
   ```
2. (Optional) point at a real mailer:
   ```bash
   export RESEND_API_KEY=re_xxx
   export R5T_FROM="Evan @ r5tools <hello@r5tools.io>"
   export R5T_BASE_URL="https://r5tools.io"
   ```
   Without `RESEND_API_KEY`, `capture.py --send` prints envelopes to stdout
   instead of actually sending (same pattern as `marketing/send_drip.py`).
3. Wire the server endpoints when ready — see `server-hooks.md`.

## Everyday workflow

```bash
# nightly cron
cd r5tools-landing/automation/testimonials

python3 capture.py --send                    # ask eligible users
python3 moderator.py review --auto           # rubber-stamp clean 4-5 stars,
                                             # queue rest for manual
python3 inject_to_heroes.py --apply          # push top-3 per lang to hero pages
python3 aggregate_rating.py --write          # refresh /aggregate-rating.json

# push landing changes
cd ../..
git add index.html ko/index.html ja/index.html pt/index.html es/index.html aggregate-rating.json
git commit -m "testimonials: nightly injection"
git push
```

## Recommended cron (Lightsail, shares box with MaKayla)

```cron
# hourly ask sweep
5 * * * *  cd ~/r5tools-landing/automation/testimonials && python3 capture.py --send >> logs/cron.log 2>&1

# nightly inject + aggregate at 04:00 UTC
0 4 * * *  cd ~/r5tools-landing/automation/testimonials && python3 inject_to_heroes.py --apply >> logs/cron.log 2>&1
5 4 * * *  cd ~/r5tools-landing/automation/testimonials && python3 aggregate_rating.py --write >> logs/cron.log 2>&1
10 4 * * * cd ~/r5tools-landing && git add -A && git diff --cached --quiet || git commit -m "testimonials: nightly inject" && git push
```

## Auto-approval rules (in `moderator.py --auto` mode)

A testimonial is auto-approved only when ALL of these are true:

- `verified_paid_user == true`
- `rating >= 4`
- `len(quote) > 40`
- no profanity match
- no refund / complaint keyword match
- `time_on_page_ms >= 8000`
- `consent == true`

Everything else — including anything rated 1-3, or with a complaint keyword —
is **forced to manual review**. Per the project constraints, low-star and
refund-adjacent feedback goes to Evan for personal handling and never to the
public wall.

## User right to withdraw

- Every email includes a link to `/unsubscribe`. When a user hits it, the
  server should also fire `moderator.py withdraw <id>` (or the equivalent
  admin endpoint) for any of that email's approved testimonials.
- Manual withdrawal request via email:
  ```bash
  python3 moderator.py withdraw t_20260717_a3b1c2
  ```
  Then re-run `inject_to_heroes.py --apply` so the hero pages drop it.

## Non-fabrication rule (hard)

`inject_to_heroes.py` will NOT inject unless a language has at least `--min`
(default 3) approved testimonials. Below that threshold the PLACEHOLDER
cards stay. Never edit the marker comments to trick this — the whole point
is that the site is honest about not yet having quotes in that language.

## Fabricated-vs-real reference

The initial PLACEHOLDER cards in `index.html`, `ko/index.html`, `ja/index.html`
are **explicitly labeled** with a `PLACEHOLDER` tag inside the card attribution.
They exist only as visual placeholders so the layout doesn't shift when real
quotes arrive. They must never appear on production social share previews as
if they were real. When 3+ approved quotes exist per lang, `inject_to_heroes.py`
replaces them in-place.
