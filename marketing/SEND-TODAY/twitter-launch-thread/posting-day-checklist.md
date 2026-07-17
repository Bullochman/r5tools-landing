# Posting Day Checklist — Twitter Launch Thread

**Target post moment: T = Tuesday 20:15 America/New_York (ET).**
All times below are relative to T.

---

## T–6h (2:15 PM ET) — Pre-flight

- [ ] Open `00-post-in-order.md`. Confirm all 12 tweet bodies still read right after a day of hindsight. Small copy tweaks OK, but do NOT push over 280 chars. Re-check any tweet you edit with `python3 -c "print(len('''...'''))"`.
- [ ] Confirm `media/` contents. Every non-TODO file present:
  - tweet-02-landing-planner.png
  - tweet-03-heat-simulator.png
  - tweet-04-coal-burn.png
  - tweet-05-freeze-risk.png
  - tweet-07-city-capture.png
  - tweet-08-season-timeline.png
  - tweet-12-homepage-hero.png
- [ ] Resolve outstanding TODO assets or accept text-only for those slots:
  - tweet-01 hero mosaic (recommended: build with the ImageMagick command in the .TODO file)
  - tweet-06 roster-extractor video/diagram
  - tweet-09 hive grid multi-alliance + missile overlay
- [ ] r5tools.io final smoke test: load homepage in fresh incognito. Confirm `RONY-FREE` code entry actually works end-to-end on the free-tier flow. If broken, DO NOT LAUNCH — every reply will hit a dead code and the thread torches trust in one evening.
- [ ] Stripe links live check:
  - $10 personal: `https://buy.stripe.com/3cI8wO8g13vf0DY39A6c001` returns a real checkout page
  - $30 Alliance Founding: `https://buy.stripe.com/7sY3cubsdd5PgCW8tU6c002` returns a real checkout page
- [ ] Import `typefully-import.json` into Typefully. Manually confirm each tweet's char count matches this doc (Typefully shows a bar; watch for reds).
- [ ] Schedule thread for T. Set inter-tweet delay to 35s.

---

## T–1h (7:15 PM ET) — Positioning

- [ ] Un-pin the current pinned tweet on the EN account. Note which tweet it was so you can restore it after 2 weeks.
- [ ] Draft the KR quote-retweet body in the KR alliance account composer (do NOT send yet):
  ```
  R5 여러분 참고하세요 — 저희가 만든 도구 11종 스레드. 워존 2007은 RONY-FREE 코드로 무료.
  ```
  (Weighted units ≈ 130. Well under.)
- [ ] Have replies-of-first-resort ready in a Notes doc — you will get these three FAQs within 15 min every time:
  - "Is the free tier really free forever, or is it a trial?" → "Free tier is real, no time limit, no email. Full free tier: landing, heat, coal, freeze, city cap, timeline, hive grid. Roster history and Discord PNG export are the $10 tier."
  - "Does it work outside WZ 2007?" → "Yes — every warzone. RONY-FREE is a WZ 2007 courtesy code. Everyone else uses the free tier as-is (same tools, no code needed) or the $10/$30 tiers."
  - "Data privacy?" → "Roster data is stored locally in your browser (IndexedDB / local SQLite). Not shared with other alliances. JSON export = your backup. No account required."
- [ ] Silence phone notifications for everything except X, Discord, and Stripe (`Focus > Work`). You will be typing for 4+ hours.

---

## T–5m (8:10 PM ET) — Final go/no-go

- [ ] Typefully "next scheduled post" panel shows Tweet 1 at 20:15. If not, fix.
- [ ] Confirm the pinned-tweet slot is EMPTY on both accounts (EN and KR).
- [ ] r5tools.io homepage: refresh, confirm still up.
- [ ] Stripe dashboard: confirm no webhook backlog / test mode toggle.

---

## T (8:15 PM ET) — Launch

- [ ] Let Typefully fire. Do NOT manually post. If Typefully hangs, wait 60s. If still hung, fall back: open the composer, paste tweets 1–12 manually from `00-post-in-order.md` with 40-second gaps.
- [ ] The moment Tweet 12 posts, pin Tweet 1.
- [ ] From KR alliance account: send the pre-drafted quote-retweet of Tweet 1 (see T–1h step above).

---

## T+5m to T+4h — Reply protocol

**The 4-hour engagement window is where the thread lives or dies.** Reply to every reply. Not selective — every one, including one-word replies.

- [ ] Set a 15-min repeating timer. Every check: refresh Tweet 1's replies + notifications.
- [ ] Reply template shapes:
  - **"Nice / cool / good luck"** → "Thanks. If you try it, DM me what breaks — I fix same-day." (Signals human, invites feedback loop.)
  - **"How does X compare to [competitor]?"** → NEVER quote the competitor. Answer only about your tool: "For X specifically, we do <one specific thing>. Try it free with RONY-FREE and see if it fits your workflow."
  - **"Does it work for [my warzone]?"** → "Yes, every warzone. RONY-FREE is a WZ 2007 courtesy code — everyone else, free tier is public."
  - **"KR?" / Korean text** → reply in Korean using Reply 9 template from `../../x-twitter.md`.
  - **Skeptical / "this is an ad"** → "Fair. R5 of RONY, WZ 2007. Free tier is real, no email. If you find one tool that doesn't do what the tweet says, I'll refund the ones who paid."
- [ ] Track sales in real time. Every $30 Founding purchase — reply to the buyer publicly with "welcome, alliance N of 10, DM me your alliance name and I'll set your seats." That single reply is worth 3 tweets of copy.
- [ ] If the Founding tier hits 10/10 during the window, immediately post the legitimacy tweet (per `x-twitter.md` posting hygiene):
  ```
  Founding tier closed at 10. Alliance tier is now $50. Personal $10 and free tier unchanged. Thanks to the 10 R5s who took the flyer.
  ```

---

## T+6h (Wednesday 2:15 AM ET / 3:15 PM KST) — Wind-down

- [ ] Engagement window has closed. Any reply after this point gets a response within the next 24h, not immediately.
- [ ] Screenshot the thread's Twitter analytics view for the record (`../analytics-setup.md` for what to log).
- [ ] Sleep. You have KR daytime coming.

---

## T+18h (Wednesday 2:15 PM ET) — KR daylight bump

- [ ] Check overnight KR replies. Reply in Korean where needed.
- [ ] From EN account, quote-retweet the highest-engagement middle tweet with a follow-up observation. Example if Tweet 4 (Coal Calc) won:
  ```
  Reply overnight from a WZ 3141 R5: "Ran your calc, we were 40% short for Week 4. Fixed our HHF upgrade order. Thanks."
  This is why the calc exists.
  ```

---

## T+24h — Day-after review

- [ ] Count: replies, retweets, likes, profile visits, r5tools.io referral hits from t.co (in Plausible/GA if `../analytics-setup.md` is wired).
- [ ] Founding tier: N/10 sold. If <3 sold, thread underperformed — pull the fallback single-post variant (`fallback-single-post.md`) for a Friday re-attempt with different framing.
- [ ] Every buyer from the launch gets a DM within 24h: "Welcome. What's the first tool you're spinning up? I'll walk you through if useful."

---

## T+14d — Un-pin / re-pin

- [ ] Un-pin the launch thread.
- [ ] Pin whichever middle tweet had the highest 14-day engagement — that becomes the profile's evergreen top for the next 14d cycle.
- [ ] Update `../analytics-setup.md` with 14-day totals if not auto-tracked.

---

## Escalation triggers (stop and think before continuing)

- **Site outage during T to T+4h** — post an immediate "site up, refresh, sorry" tweet in the thread. Do not delete. Do not go dark.
- **Stripe payment failure reported by a buyer** — refund manually via Stripe dashboard, DM apology, still reply publicly with "sorted."
- **Someone claims a tool gave wrong data with a screenshot** — reply publicly: "Investigating, will DM within 1h." Then investigate. Do NOT get defensive on-thread. Public correction after fix is a trust builder.
- **A KR player calls the KR translation broken** — DM immediately, ask for the specific string, fix in `../../ko/` and redeploy. Reply publicly with "fixed, thanks for the catch."
