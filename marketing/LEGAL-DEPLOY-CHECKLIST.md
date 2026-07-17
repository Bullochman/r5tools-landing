# Legal Pack Deploy Checklist

Version 1.0 — 2026-07-17 — for the r5tools.io v2.0 legal pack rollout.

**Reminder:** none of this is legal advice. See "When to consult a real lawyer" at the bottom.

---

## What ships immediately (safe to deploy now)

These files are ready to push to GitHub Pages today. They are the EN sources of truth and the four non-EN language stubs. Push order matters only in the sense that you want the legal-pack landing pages live BEFORE you email existing users about them.

1. **Publish the EN legal pack first**
   - `privacy.html` — GDPR + CCPA + PIPA compliant, v2.0
   - `terms.html` — includes non-affiliation, anti-cheat clarity, arbitration in Birmingham, AL
   - `refund.html` — new file; 14/14/30-day windows
   - `trust.html` — new file; consolidated skeptic-safe summary + bug bounty
2. **Publish the cookie banner**
   - `cookie-consent.js` — new file; fires only for EEA/UK visitors (or when `?force_consent=1`)
   - Bumped `build_analytics_inject.py` to v2 so re-running it swaps every page to the consent-gated GA4 snippet
   - After push, run: `python3 build_analytics_inject.py` from the repo root and commit the sweep
3. **Publish the translations**
   - `ko/{privacy,terms,refund,trust}.html` — 4 files
   - `ja/{privacy,terms,refund,trust}.html` — 4 files
   - `pt/{privacy,terms,refund,trust}.html` — 4 files
   - `es/{privacy,terms,refund,trust}.html` — 4 files
   - Every non-EN file has `<!-- [REVIEW-NEEDED] ... -->` at the top. Do NOT strip these until a native speaker has reviewed. The pages are safe to ship because the disclaimer is machine-visible only, not user-visible.
4. **Publish the sitemap update**
   - `sitemap.xml` — now includes 20 legal-pack URLs with full hreflang triads (EN + 4 langs × 4 pages = 20)
   - After push, ping IndexNow / GSC / Bing via the existing `automation/sitemap-ping/` cron; a manual `curl` to Google Search Console's Submit-URL endpoint is fine too
5. **robots.txt** — no change needed; the legal pages sit at the root and are already covered by `Allow: /`

**Push sequence (safe):**

```bash
cd ~/claudecode/r5tools/r5tools-landing
python3 build_analytics_inject.py             # re-injects consent-gated GA4 across all pages
git add privacy.html terms.html refund.html trust.html cookie-consent.js
git add ko/{privacy,terms,refund,trust}.html
git add ja/{privacy,terms,refund,trust}.html
git add pt/{privacy,terms,refund,trust}.html
git add es/{privacy,terms,refund,trust}.html
git add sitemap.xml build_analytics_inject.py
git add marketing/LEGAL-DEPLOY-CHECKLIST.md
git commit -m "Legal pack v2: GDPR+CCPA+PIPA privacy, ToS, refund, trust + 4 langs + EEA cookie banner"
git push
```

Verify after ~60s: `curl -sI https://r5tools.io/refund.html | head -3` returns HTTP 200.

---

## Heads-up email to existing users

Send within 7 days of publishing. Standard courtesy under both GDPR and CCPA for a material privacy-policy update, even though nothing about our actual data-handling behavior changes.

**Segments:**

- **Free waitlist subscribers** (no purchase): 1 email, short.
- **Paid users** (any tier): 1 email, mentions Refund Policy + Trust page + link to Discord for questions.

**Subject line:** `Small update to our privacy policy and terms`

**Body (EN plain-text draft — mirror in KR/JA/PT/ES via `marketing/emails/`):**

```
Hey — Evan here (r5tools.io).

Quick heads-up: we published a rewritten privacy policy, terms of service,
refund policy, and a new "trust" page today. The what-we-actually-do part
hasn't changed. What's new:

- Cleaner GDPR / CCPA / PIPA language for our international R5s
- Explicit refund windows: 14 days on Personal + Alliance Bundle, 30 days
  on Alliance Founding (because lifetime pricing deserves a longer window)
- A trust page that spells out exactly what we do and DON'T touch
  (spoiler: never your game credentials)
- A cookie banner for EEA/UK visitors — nothing changes for you if you're
  in the US or KR or JP

If any of this makes you uncomfortable, reply to this email and I'll fix it
(or refund you, whichever is right).

Read them here:
  https://r5tools.io/privacy.html
  https://r5tools.io/terms.html
  https://r5tools.io/refund.html
  https://r5tools.io/trust.html

Thanks for using the tool.
- Evan
  evanjones@mdr.net
```

Send via the existing `marketing/emails/send_drip.py` scaffold on a one-off ad-hoc list, not as part of the drip sequence.

---

## Data Processing Agreements (DPAs) needed

These are legally required if any of the following happen:

- We cross 5,000 EU users in a given year, OR
- A GDPR-DSAR (data subject access request) audit shows we're processing personal data on behalf of an EEA data subject

We already have (or can request in under 5 min) standard DPAs for:

- **Stripe** — request via Stripe Dashboard → Compliance → Data Processing Addendum. Auto-signed once you accept.
- **Plausible Analytics** — DPA is auto-included in their standard terms; download PDF from dashboard settings.
- **Anthropic** — request via console.anthropic.com → Settings → Legal → DPA request. Slower turnaround (5-10 business days for a signed copy).

DPAs we still need before crossing the EU-user threshold:

- **Cloudflare** — request via dash.cloudflare.com → Manage Account → Compliance → DPA. Auto-signed.
- **Railway** — request in-app; standard SCC-based DPA.
- **GitHub Pages** — GitHub's default terms include a data processing addendum for Enterprise customers; for Pages under a personal plan, we rely on the general GitHub Terms of Service. If audited, upgrade to Pro/Team ($4/mo) to get the DPA.
- **SMTP provider** (Postmark / Amazon SES) — Postmark provides a standard DPA in the dashboard; SES is covered under the AWS Service Terms + Data Processing Addendum, auto-effective.

Store executed DPAs at `~/claudecode/r5tools/legal/dpa/` (create the dir when the first PDF lands).

---

## When to consult a real lawyer

We wrote everything in this pack as a working developer, not a lawyer. It's directionally correct but it needs professional review before it becomes bet-the-company text. Get a lawyer involved BEFORE any of these thresholds land:

- **Revenue:** crossing $10K MRR ($120K ARR run rate). Below that, the cost of a full legal review outweighs the incremental risk.
- **EU users:** crossing 5,000 identified EEA users, OR receiving your first DSAR from an EEA regulator. Whichever comes first.
- **Korean users:** crossing 10,000 identified KR users (PIPA compliance gets stricter above this threshold, and Korean consumer-protection notices become mandatory).
- **First cease-and-desist** from any rights-holder (Last War Games, First Fun, Century Games, or a related party). Do NOT respond without counsel.
- **First security incident** involving PII. Notification obligations start ticking at 72 hours; you want a lawyer helping you draft the notice.
- **Any offer to acquire, invest in, or license the site.** Even a "just a chat" from someone's BD person.
- **When we start collecting anything genuinely sensitive** — health data, precise location, biometrics, minors' data, payment card data outside Stripe.

**Recommended path when the time comes:**

- Alabama: solo practitioner familiar with SaaS + consumer software. Rough budget for a full legal-pack review: $2,500-$5,000 one-time, then $150-$300/mo retainer for questions as they come up.
- Cross-border (KR / EEA): use a firm with international reach; ClerkyLegal, Priori Legal, or LegalPad marketplaces can source specialists at $300-$500/hr.
- **Do NOT** rely on Fiverr / Legal Zoom / a template site for the actual redraft when we reach the threshold. Their output looks legal but is often not defensible in the specific jurisdictions we care about (Alabama arbitration + EEA consumer law + PIPA is a rare combo).

---

## Post-deploy verification (do these within 24 hours)

1. Every page loads with correct language toggle: `for u in privacy terms refund trust; do for l in "" ko/ ja/ pt/ es/; do echo -n "$l$u "; curl -sI https://r5tools.io/${l}${u}.html | head -1; done; done`
2. Cookie banner shows for an EU IP: use a VPN → any of DE, FR, IE. Confirm banner renders, Accept sets `_ga` cookie, Reject does not.
3. Cookie banner does NOT show for US/KR/JP IPs unless `?force_consent=1` is on the URL.
4. GA4 respects the reject: DevTools → Application → Cookies → confirm no `_ga*` cookies present after rejecting.
5. Search Console: submit the updated sitemap manually so Google discovers the new URLs faster than the daily cron.
6. IndexNow / Bing: the automation/sitemap-ping/ cron will handle these automatically on the next 08:00 UTC run.
7. Discord: pin a message linking the new /trust.html for community skeptics.

---

## Ownership + review cadence

- **Owner:** Evan Jones (evanjones@mdr.net)
- **Review cadence:** every 6 months, or immediately when any of the "consult a lawyer" thresholds hit
- **Next review:** 2027-01-17
- **Translation-review deliverable:** replace `[REVIEW-NEEDED]` HTML comments with `[REVIEWED YYYY-MM-DD by <name>]` once a native speaker signs off on each language file
