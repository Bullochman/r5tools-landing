# 90-Day Post-PH Launch Roadmap

ProductHunt is the launch — not the campaign. Most PH launches decay to zero-traffic within 3 days of the badge going up. To convert PH momentum into a sustained top-of-funnel, chain 4-5 platform-specific launches over the following 90 days. Each one reuses ~70% of the PH assets with a platform-specific angle.

**Assumption:** PH launch is **Tuesday 2026-07-28**. All dates below are relative to that anchor.

---

## Overview — the 90-day chain

| Wave | Platform | Date | Angle | Time investment |
|---|---|---|---|---|
| 1 | Product Hunt | 2026-07-28 | Solo maker + KR-first + real free tier | 3 days (T-14 to T+3) |
| 2 | Hacker News (Show HN) | 2026-08-04 (T+7) | Claude vision pipeline + solo-build velocity | 4 hours |
| 3 | IndieHackers | 2026-08-11 (T+14) | Revenue milestone + solo-founder journey | 3 hours |
| 4 | BetaList | 2026-08-25 (T+28) | Alternative "coming soon" audience discovery | 1 hour (submission), 2 weeks (wait) |
| 5 | r/SideProject | 2026-09-01 (T+35) | Retrospective — "here's what launching on PH taught me" | 2 hours |
| 6 | Reddit LWS + niche gaming subs | 2026-09-15 (T+49) | Case study — "how one alliance used r5tools to win Season 3" | 3 hours (write + monitor) |
| 7 | X/Twitter thread + LinkedIn post | 2026-10-13 (T+77) | 90-day retrospective — numbers, learnings, what's next | 2 hours |

Spacing rationale: never launch two platforms in the same week (audience overlap, feed cannibalization); always leave 1-2 weeks between waves so late-arrivals from Wave N don't collide with Wave N+1's initial signal.

---

## Wave 2 — Hacker News (Show HN)

**When:** Monday 2026-08-04, submit at **7:00 AM PT** (10 AM ET = 3 PM UK = peak morning HN traffic).

**Why HN next:** HN's audience is technical, skews solo-maker-friendly, and rewards specific engineering write-ups. r5tools has a legitimate applied-ML story (Claude vision + second-pass audit for roster OCR) that fits the Show HN format. HN traffic converts poorly to gaming products directly, but Show HN threads get indexed forever — a decent-performing Show HN throws off traffic for 2-3 years.

**Angle:** DO NOT lead with the game. HN readers will bounce on "mobile game tool." Lead with the pipeline.

### Show HN title

**Show HN: r5tools.io – Turning a 90-second phone video into a 100-player CSV with Claude vision**

Character count: 92 (HN limit: 80). Trim to: **Show HN: I turn a 90s phone video into a 100-player CSV with Claude vision** (77 chars).

### Show HN body (first comment)

> I've spent the last three months building a suite of planning tools for the mobile strategy game Last War: Survival. The most technically interesting part is the Roster Extractor, which is what I'm sharing here.
>
> **The problem:** LWS alliances have 100 members. To plan anything (landing coordinates, coal budgets, rally targets) you need everyone's current power, HQ level, and rank. The game exposes this only through a scrolling in-app member list — no export, no API, no OCR-friendly layout. R5s (alliance leaders) typically type it all into a Google Sheet by hand. Takes 60-90 minutes and gets stale within 24 hours.
>
> **The pipeline:**
> 1. R5 records a 90-second video of the in-game member list scrolling on their phone.
> 2. ffmpeg extracts frames at 4 fps (~360 frames).
> 3. Frame-diff detection drops near-duplicates → ~40-60 keeper frames.
> 4. Claude Sonnet 4.6 vision processes frames in batches of 4, extracting rows as JSON.
> 5. Cross-frame dedup by (name, power) tuple → 100 unique rows.
> 6. Rank-sort + editable table for OCR-error correction.
> 7. (Premium tier) A second-pass Claude audit that verifies every row against the source frames and repairs errors on visually-similar names (Korean names with 김/기 or 정/성 confusion is the hard case).
>
> End-to-end: ~2 minutes for a 100-player roster. Costs me ~$0.08 in Anthropic API per roster processed.
>
> **What surprised me:** the second-pass audit was the difference between "impressive demo" and "actually usable." Single-pass extraction hits ~85-90% accuracy — high enough to look great in a video, low enough that R5s have to review every row anyway. The audit pass gets us to 94/94 verified for the roster sizes I've tested, which means the R5 can trust the CSV without manual review. It costs another $0.05 in tokens per roster but it's what makes the tool worth paying for.
>
> **The other tools** (Landing Planner, Freeze Risk, Coal Burn, Hive Grid Manager, and 6 more) are all conventional planning software built on top of this roster data. They're on r5tools.io if you're curious about the game context, but the Claude-vision pipeline is what I wanted to Show HN.
>
> Happy to answer questions about the frame-diff heuristic, the audit-pass prompt, or the cost/latency tradeoffs.

**Length:** ~2,000 chars. HN sweet spot.

**Follow-up comment discipline:**
- Reply to every "why not just [alternative]" question with specific numbers. HN respects specificity.
- If someone asks about the free tier being "just" for one warzone, explain the warzone-neighbor logic honestly. HN readers see through fake generosity.
- **Never** post the r5tools.io URL more than once. It's already in the title. Repeating it looks spammy.

**Expected outcome:** Show HN posts about applied ML pipelines with real numbers typically hit 40-150 upvotes and land on the front page for 3-8 hours. Traffic bump: 2,000-8,000 unique visits over 48 hours.

---

## Wave 3 — IndieHackers

**When:** Monday 2026-08-11, post at **8 AM PT**.

**Why IH next:** IH audience is other solo founders and bootstrappers. They want revenue numbers, journey stories, and lessons learned. r5tools's PH launch results (assuming any level of success) + the first 2 weeks of paying customer numbers is exactly the post format that performs there.

**Angle:** Revenue milestone + specific lessons from PH.

**Post format:** Milestone post to the "Milestones" board OR long-form post to the main feed.

### Milestone title (Milestones board)

**$[X] MRR from a suite of tools I built for my own mobile game alliance**

Fill in the actual number from your Stripe dashboard on 2026-08-11. If under $500 total, frame as one-time revenue: **Made $[X] in first 2 weeks from a mobile-game tools suite I built as a solo dev**.

### Long-form post title (main feed)

**What launching r5tools.io on Product Hunt actually taught me (revenue + traffic + hard lessons)**

### Post body outline

1. **What r5tools is** — 2 sentences. Don't bury the lead.
2. **The origin** — the losing-a-season-in-a-Google-Sheet story, tight.
3. **The PH launch numbers** — actual: rank achieved, upvote count, unique visitors, code redemptions, paid conversions. Real numbers only.
4. **The 3 things that worked** — pre-launch KR alliance broadcast, the Roster Extractor as the "hook feature," writing the first PH comment as a genuine maker story instead of marketing copy.
5. **The 2 things that didn't work** — [fill in based on actual launch experience; typical candidates: "posted to wrong subreddit and got downvoted," "hunter I wanted didn't respond," "screenshot broken on mobile PH view for first 40 min"].
6. **Advice for other solo founders launching a niche tool** — 3 specific tips. IH readers reward tactical specificity over inspiration.
7. **What's next** — brief, one paragraph. Not a roadmap dump.

**Length:** aim for 1,200-1,800 words. IH long-form posts under 800 words feel thin; over 2,500 lose readers.

**Do NOT** cross-post this to your PH page comments — IH readers dislike promo-loops.

---

## Wave 4 — BetaList

**When:** submit 2026-08-25 (T+28). BetaList typically posts submissions 1-3 weeks after submit — the actual public launch date lands mid-September.

**Why BetaList:** slower audience but very much "looking for new products" — high signup intent. Also indexes well on Google for "productname reviews" searches for years afterward.

**Angle:** don't reuse the PH angle. Frame r5tools as "the tool I wish existed when I started playing this game."

**Submission fields:**
- **Name:** r5tools.io
- **Tagline:** Alliance planning tools for Last War: Survival, by an R5
- **Description:** ~500 chars — lift from the launch-brief.md long description
- **URL:** https://r5tools.io/?utm_source=betalist&utm_medium=submission
- **Category:** Games / Productivity (pick one)

**Nothing special to do on launch day** — BetaList doesn't have the pile-on upvote model PH does. Just monitor the post, reply to any commenter, and watch traffic in analytics.

**Expected outcome:** modest — 200-800 signups spread over 2-3 weeks. BetaList's real value is the permanent "featured on BetaList" search-result.

---

## Wave 5 — r/SideProject retrospective

**When:** Monday 2026-09-01 (T+35), post 8 AM PT.

**Why r/SideProject:** this sub loves post-launch retrospectives more than launch announcements. By T+35 you have real 5-week metrics.

**Title:** **I launched r5tools.io on PH 5 weeks ago — here's what actually happened**

**Body outline:**
1. What r5tools is — 2 sentences
2. The 5-week numbers (real, not aspirational): unique visits, signups, paid customers, MRR, tools shipped in response to feedback
3. What I got right (specific, tactical)
4. What I got wrong (specific, tactical, no false humility)
5. What I'm changing next
6. Link at the very bottom, one time only

**Length:** 800-1,200 words. r/SideProject prefers concise.

**Voice:** technical but personal. Same first-person R5 tone as the PH post.

---

## Wave 6 — Reddit LWS + niche gaming subs (case study)

**When:** 2026-09-15 (T+49). Timing aligns with LWS Season 3 approaching, which is when R5s are actively looking for new tools.

**Angle:** case study of a specific alliance using r5tools to win. Requires either your own alliance's Season 3 results OR a paying customer alliance willing to be featured.

**Title:** **Case study: how [Alliance Name] used r5tools.io to win Season 3 in Warzone [XXXX]**

**Body:**
- The alliance's starting position (rank, warzone, member count)
- The specific tools they used at each week of the season
- The concrete outcome (rank achieved, key battles won)
- Their R5's quote (get real permission first)
- Link to r5tools.io at the bottom

**Subreddits (posted 24-48h apart):**
- r/LastWarSurvival (primary)
- r/incremental_games
- r/mobilegaming (only if account has karma there)
- r/androidgaming

**Do NOT** post the same case study to multiple subs the same day. Rotate: r/LWS Monday, r/incremental Wednesday, r/androidgaming Friday.

**Length:** 600-1,000 words per sub, tailored to each sub's tone. r/LWS gets the game-specific detail; r/androidgaming gets a lighter, more general framing.

---

## Wave 7 — Twitter/X thread + LinkedIn post (90-day retrospective)

**When:** Monday 2026-10-13 (T+77). This is the "what I learned in 90 days" post that goes to your professional network.

**Angle:** less product, more journey. The Twitter thread version optimizes for retweets from other solo founders; the LinkedIn version optimizes for professional-network shares.

**Twitter thread structure (10-15 tweets):**
1. Hook — "90 days ago I launched r5tools.io on Product Hunt. Here's what happened."
2. What it is (1 tweet)
3. The 90-day numbers (1 tweet, real)
4. The 3 things I got right (3 tweets, one each)
5. The 3 things I got wrong (3 tweets, one each)
6. What surprised me most (1 tweet — usually the KR angle outperforming expectations)
7. What's next (1 tweet)
8. Thank-you + link to r5tools.io (1 tweet)

Space tweets 30 sec apart when posting so Twitter's algorithm registers them as a coherent thread.

**LinkedIn version:** rewrite as a single 1,500-word post. LinkedIn audience skews to "solo founder building in public" rather than "gamer" so lead with the entrepreneurship story, mention the game as context.

---

## What to change per platform (cheat sheet)

| Platform | Lead with | Downplay | Length sweet spot | Best time to post |
|---|---|---|---|---|
| **ProductHunt** | Solo maker + KR-first + free tier | Technical pipeline detail | 2000-char description + 2400-char first comment | Tue 12:01 AM PT |
| **Hacker News** | Claude vision pipeline | The game itself | 2000-char first comment | Mon 7:00 AM PT |
| **IndieHackers** | Revenue + PH lessons | Product features | 1200-1800 words | Mon 8:00 AM PT |
| **BetaList** | "Tool I wish existed" origin | Solo maker angle | 500-char description | Whenever, no live-day |
| **r/SideProject** | Post-launch retrospective + real numbers | Origin story | 800-1200 words | Mon 8:00 AM PT |
| **Reddit gaming subs** | Case study of specific alliance winning | Solo maker angle (they don't care) | 600-1000 words | 8-10 PM ET (game-planning window) |
| **Twitter/X** | 90-day retrospective, first-person | Product features | 10-15 tweet thread | Mon 9:00 AM ET |
| **LinkedIn** | Solo founder building in public | Game jargon | 1500 words single post | Tue 8:00 AM ET |

---

## Assets that carry across all 7 waves

- **Homepage screenshot** (`press-kit/01-homepage.png`) — reuse everywhere
- **The origin story** (losing Season 2 → building the tools) — reuse everywhere, adjust length
- **The Roster Extractor pipeline description** — reuse for HN + LinkedIn + IH; skip for gaming subs
- **The free-warzone framing** — reuse everywhere, always with the code `RONY-FREE`
- **UTM tracking** — every link uses `?utm_source=<platform>&utm_medium=<post-type>&utm_campaign=launch-wave-N` so you can measure which wave actually drove conversions

---

## When to stop

If Wave 5 (r/SideProject retrospective) generates fewer than 500 unique visits, **skip Wave 6-7 and pivot.** The specific-launch-post format has fatigued for your audience; time to switch to sustained content (YouTube walkthrough series, a newsletter, or paid ads per `../paid-ads.md`) rather than continuing to milk launch-post traffic.

If Wave 2 (HN) or Wave 3 (IH) significantly outperforms the PH launch, **double down there in Wave 8-10** rather than following this sequential plan rigidly. HN in particular can throw off traffic for years if you find a specific technical angle that resonates — plan a second Show HN post 6 months out with a new technical deep-dive (e.g., "the ffmpeg + Claude vision cost curve after processing 10,000 rosters").
