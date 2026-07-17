# PH Launch Day — Hour-by-Hour Checklist

**Launch date target:** Tuesday 2026-07-28
**Launch time:** 12:01 AM Pacific Time (= 03:01 AM ET = 08:01 AM UK = 16:01 KST)
**Timezone note:** PH day rolls at midnight PT. All times below are in PT.

All commands assume you're running from `~/claudecode/r5tools/`. Discord messages are drafted below — paste, don't retype.

---

## T-14 days · Mon 2026-07-14

- [ ] Send `hunter-outreach.md` DMs (all 5, spaced across the day so you don't look like a batch job).
- [ ] Publish "we're launching on PH" teaser in your own Discord + KR alliance Discord (soft, no CTA yet).
- [ ] Verify Stripe test mode → live mode toggle is clean on both buy links.
- [ ] Verify `RONY-FREE` code still works end-to-end (paste into the unlock flow, confirm 90-day cookie).

---

## T-7 days · Mon 2026-07-21

- [ ] Hunter follow-up: reply to any hunter DMs; if none replied, decide on self-hunt (see `hunter-outreach.md` fallback section).
- [ ] Draft the launch-day social posts (Reddit, Discord, X, LWS community groups). See templates below.
- [ ] Confirm the gallery images from `gallery-plan.md` are all built at 1600×900 minimum. Missing screenshots (hive-grid-ui.png, roster-extractor-ui.png) — capture now, not on launch day.
- [ ] Check `producthunt.com/upcoming` for the 07-28 slot. If a major launch (funded team, well-hunted product) is queued the same Tuesday, decide whether to shift to 08-04.

---

## T-72h · Sat 2026-07-25

- [ ] Final product QA sweep:
  - [ ] Every tool loads in EN and KR without console errors
  - [ ] Stripe buy links go to live checkout with correct prices ($10, $50)
  - [ ] `RONY-FREE` unlock persists across page reloads
  - [ ] Discord PNG exports render correctly from at least 3 tools
  - [ ] Mobile view isn't broken on iPhone Safari (this is where 40% of PH clicks land)
- [ ] Draft PH first-comment (already in `launch-brief.md`) — read it aloud, tighten anything that feels marketer-y.
- [ ] Draft the "launched on PH!" tweet/post for X and Discord (below).
- [ ] Schedule the PH submission in PH's scheduling tool if you're using their queue. Otherwise plan to submit manually at 12:01 AM PT.

---

## T-24h · Mon 2026-07-27 · Morning

**Send the "we launch tomorrow" broadcast now.** This is the single most important pre-launch action — most of your day-1 upvotes will come from people you told 24-48h in advance.

Post in:

### Your own Discord (r5tools + RONY / TINO channels)

> **We launch on ProductHunt tomorrow — Tuesday 12:01 AM PT** (Wed 4 PM KST for KR folks).
>
> PH is the launch board that determines whether r5tools gets seen by tens of thousands of makers/gamers or by nobody. **Upvotes in the first 6 hours are what decide it.**
>
> Here's what I'm asking:
>
> 1. Bookmark this link now: **https://www.producthunt.com/products/r5tools-io** (goes live at 12:01 AM PT tomorrow)
> 2. Sign into PH tomorrow morning your time and hit the ↑ upvote. Takes 10 seconds. You need an existing PH account — if you don't have one, sign up today so the account isn't fresh tomorrow (PH suppresses upvotes from same-day accounts).
> 3. Optional: leave a one-line comment. Comments count for ranking way more than upvotes. Say what your alliance uses the tools for — Landing Planner, Freeze Risk, Roster Extractor, whatever.
>
> That's it. I'll ping the link the moment it's live. Thanks for being here since Week 1.
>
> — Evan (RONY / TINO R5)

### KR alliance Discord (KakaoTalk-adjacent)

> **내일 프로덕트헌트 런칭합니다 — 화요일 오전 12:01 PT (수요일 오후 4시 KST)**
>
> 프로덕트헌트는 이 도구가 널리 보일지 아닐지를 결정하는 사이트예요. **첫 6시간 안의 업보트가 순위를 결정합니다.**
>
> 부탁드리는 것:
>
> 1. 지금 이 링크 북마크: **https://www.producthunt.com/products/r5tools-io** (내일 오전 12:01 PT에 오픈)
> 2. 내일 아침 (한국 시간 오후 4시경) PH 로그인 후 ↑ 업보트. 10초 걸립니다. PH 계정이 필요해요 — 없으시면 오늘 미리 가입해주세요 (PH는 당일 가입 계정의 업보트를 무시합니다).
> 3. 선택사항: 한 줄 댓글 남기기. 댓글이 업보트보다 순위에 더 영향을 미칩니다. 어떤 도구를 쓰는지 (랜딩 플래너, 코얼 계산기, 로스터 추출기 등) 자유롭게 쓰시면 됩니다.
>
> 링크는 오픈되는 순간 다시 공유드립니다. 감사합니다.
>
> — Evan (RONY / TINO R5)

### LWS-adjacent Discord servers (per your `discord-outreach.md`)

Only servers where you've earned goodwill. **Don't** blast the promo servers — they'll ban the account. See `../discord/discord-outreach.md` for the friendly list.

---

## T-6h · Mon 2026-07-27 · 6:00 PM PT

- [ ] **Final screenshot verification:** open r5tools.io in a fresh incognito window at 1600×900. Do the tools that appear in the gallery images still look identical? If any CSS drifted, redo the affected screenshot.
- [ ] **Gallery upload dry-run:** if your PH submission draft supports image uploads before submit, upload all 5 images NOW, not at 12:01 AM. Verify preview looks right. Uploading at midnight when PH is congested with other launches is a known failure point.
- [ ] **Confirm hunter's availability:** DM the confirmed hunter one final "we're on for tomorrow — thanks again" ping.
- [ ] **Prep the first-comment text:** copy the "Maker's first comment" from `launch-brief.md` into your clipboard OR into a separate Note ready to paste. PH's comment box is small and pasting a 2400-char comment from memory at 12:03 AM in the dark is how typos ship.
- [ ] **Water bottle, phone charger, coffee.** You're going to be awake for the first 3 hours minimum.

---

## T-0h · Tue 2026-07-28 · 12:01 AM PT — SUBMIT

- [ ] Hit **Publish** on the PH submission at exactly 12:01 AM PT (not 12:00 — 12:01 avoids the queue-flush behavior some launches see at the exact minute).
- [ ] Copy the resulting PH URL. Format will be `https://www.producthunt.com/products/r5tools-io` or similar.
- [ ] **Post the first comment immediately** (before the first outside upvote lands). The maker's first comment is one of PH's ranking signals.

---

## T+15min · 12:16 AM PT

- [ ] Post the launch URL in your own Discord:

> **WE ARE LIVE ON PRODUCTHUNT** → https://www.producthunt.com/posts/[URL]
>
> Upvote + comment please, we're building the initial ranking signal RIGHT NOW. Every upvote in the first hour is worth 10 upvotes later in the day.

- [ ] Post in the KR alliance Discord (same message translated).
- [ ] Post on X/Twitter from your personal account:

> Just launched r5tools.io on ProductHunt — planning tools for Last War: Survival alliances. Built solo over 3 months as an R5 in a Korean-dominant warzone. Free for my warzone, $10 personal / $50 alliance elsewhere.
>
> Would love your upvote if you make it there today: [PH URL]

---

## T+1h · 1:00 AM PT

- [ ] **Reddit posts.** Post in exactly this order (spread over 20 minutes to avoid the "posted-to-multiple-subs-simultaneously" spam flag):
  - **r/LastWarSurvival** — most important. Title: "I built r5tools.io for our alliance and just launched it on ProductHunt — free for Warzone 2007". Body: 2-3 paragraphs, first-person, link at the bottom. Frame it as "I'm one of you, here's the story" not "please upvote."
  - **r/incremental_games** — title: "Launched a tool suite for Last War: Survival alliance planning". Same body approach.
  - **r/SideProject** — title: "Launched r5tools.io — solo maker, 3 months, mobile-game alliance planning tools". PH-launch mentions are welcome here.
  - **r/androidgaming** — softest fit; only post if you have karma there. Title: "Made a companion tool suite for Last War: Survival."
- [ ] Skip: r/gaming (too broad, will get downvoted), r/patientgamers (wrong fit), r/mobilegaming (spam-heavy sub).

---

## T+2h · 2:00 AM PT

- [ ] **Reply to every PH comment personally.** Even one-word "nice work" comments — reply with a specific thank. Comment-per-comment engagement drives ranking more than upvote volume alone.
- [ ] Check current rank on PH homepage. If not in top 10, don't panic — most launches climb steadily through the morning.
- [ ] If ranked #1-3, ping the hunter to celebrate with them; they'll retweet/repost, which drives another wave.

---

## T+3h · 3:00 AM PT

- [ ] Second Discord ping (own + KR alliance):

> **Currently ranked #[X] on ProductHunt for the day** — thanks to everyone who upvoted. If you haven't yet: [PH URL]. The next 3 hours matter more than the last 3.

- [ ] Now go sleep for 3-4 hours if you can. You'll want to be awake for the 6-9 AM PT wave (which is 9 AM-noon ET = US workday starting = huge second bump).

---

## T+8h · 8:00 AM PT

- [ ] Wake up, check ranking, screenshot current position.
- [ ] Post in Discord servers you have permission to post in:

> Update: r5tools.io is currently at #[X] on ProductHunt today. Massive thanks to the [N] of you who upvoted overnight. If you're just seeing this: [PH URL].
>
> **What's next:** every comment left today gets a personal reply from me. If there's a feature you want, drop it in the PH comments — I'm shipping today based on feedback.

- [ ] **Continue replying to every PH comment.** For each comment: give a specific answer (never "thanks!"), and if the commenter mentions LWS gameplay, ask them a follow-up question. Long comment threads under your post = PH algorithm loves it.
- [ ] Retweet/repost any positive PH mentions on Twitter/X, quote-tweet with a short thanks.

---

## T+12h · 12:00 PM PT

- [ ] **Post in LWS Facebook groups** if you have accounts there. Same message, different platform. LWS FB groups have ~500-2000 members each, mostly casual R5s who don't Reddit.
- [ ] Send targeted DMs to any R5 who's engaged with your Twitter/Discord content in the past 2 weeks. Not a mass DM — 5-10 targeted, one-line personal:

> Hey — r5tools.io went live on ProductHunt today. If you have a min, an upvote helps a ton: [PH URL]. Whether or not you upvote, thanks for the LWS convos over the past few weeks. — Evan

---

## T+18h · 6:00 PM PT

- [ ] **Final push.** Ranking is largely locked by now, but the last few hours can shift you from #4 to #3 (or #7 to #5). Every position matters for the "Featured" badge.
- [ ] Post final Discord update:

> **6 hours left on ProductHunt day.** Currently at #[X]. If you were planning to upvote and haven't yet — now's the time. [PH URL]. Thank you all.

- [ ] Reply to any straggler comments on PH.

---

## T+24h · 12:01 AM PT Wed 2026-07-29 — POST-LAUNCH

- [ ] Screenshot final rank + upvote count. Save as `launch-day-final-rank.png` for later marketing use.
- [ ] Capture the PH badge PNG. PH provides a downloadable badge at your product's URL — download the "Featured on Product Hunt" badge in both light and dark variants. Save into `../../static/producthunt-badge-light.svg` and `producthunt-badge-dark.svg`.
- [ ] **Add the badge to the r5tools.io homepage.** Top-right of the hero, right next to (or replacing) the "Actively improving" banner:
  ```html
  <a href="https://www.producthunt.com/products/r5tools-io" target="_blank">
    <img src="/static/producthunt-badge-dark.svg" alt="Featured on Product Hunt" width="250" height="54" />
  </a>
  ```
  The badge on the homepage does two things: (1) social proof for every future visitor, (2) drives residual traffic back to the PH page for late upvotes.
- [ ] Write a thank-you post on Discord + Twitter + LinkedIn recapping the day. Include the final rank, upvote count, and 2-3 specific features you shipped in response to launch-day comments. This is the transition from "launching" to "shipped and iterating."

---

## Post-launch week (T+2 to T+7)

- [ ] Send hunter a personal thank-you DM with launch-day metrics.
- [ ] Email every code-redeemer from the launch day with a "thanks for trying it" note + ask what's missing.
- [ ] Screenshot the "product page views over time" chart from PH analytics — save for the r5tools.io "About" page as social proof.
- [ ] Begin drafting the follow-on launches per `follow-on-launches.md`. HN Show HN is next; typical timing is 3-5 days after PH so the momentum doesn't fully die.

---

## Emergency scenarios

**PH submission errors at 12:01 AM.** Refresh, try again. If it still errors, DM PH support (@ProductHunt on Twitter — they're responsive) and hold your Discord broadcast until you have a live URL.

**Screenshot broken on the live PH card.** Re-upload immediately from your pre-staged gallery images. Never publish with a broken preview — PH card loads once and caches; a broken initial preview haunts you all day.

**Someone posts a nasty comment on PH.** Reply calmly, specifically, and once. Don't reply twice. If it's flat-out abusive, use PH's report button; don't engage.

**You realize the pricing on the PH page is wrong.** PH lets you edit description post-launch. Fix immediately and note the correction in a first-comment reply.

**Rank isn't moving.** Check the top-3 launches — are they getting way more comments than upvotes (suggests bot upvote pattern that PH will penalize) or organic engagement? If the day is genuinely stacked with strong launches, focus on locking in your existing supporters' comments rather than chasing rank. A #6 launch with 40 real comments outperforms a #3 launch with 5 comments in the long-tail traffic PH sends over the following month.
