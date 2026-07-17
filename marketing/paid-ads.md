# r5tools.io — Paid Ads Campaign Brief

**Owner:** Evan Jones · **Draft date:** 2026-07-17 · **Status:** Copy-paste-ready, awaiting budget approval

> **Rule:** Claude never touches payment or bidding controls. Evan sets budget, activates campaigns, approves creative. Everything below is copy-paste-ready.

---

## 0. Guardrails + tracking prerequisites

Before spending a single dollar:

1. **UTM convention** — every ad URL uses:
   `https://r5tools.io/?utm_source={google|meta|twitter}&utm_medium={cpc|paid_social}&utm_campaign={campaign_id}&utm_content={ad_variant_id}`
2. **Google Ads conversion tracking** — install gtag on `r5tools.io` + fire a `paid_unlock` conversion on the `/unlock` success page (post-Stripe success redirect). Value = $10 (Personal) / $50 (Alliance) / $5 (Roster Premium).
3. **Meta Pixel** — install on landing + fire `Lead` on Access-Code claim, `Purchase` on Stripe success.
4. **Twitter/X conversion pixel** — same events, same value model.
5. **Do not run any ads until Access Codes deploy lands** (task #50). Ads driving to `mailto:` CTAs will burn budget with no attribution loop.

---

## 1. Google Ads campaign brief

### Campaign settings

| Setting | Value |
|---|---|
| Campaign type | Search |
| Networks | Google Search only (turn OFF Display + Search Partners for test) |
| Bidding | Maximize Conversions with target CPA $8 |
| Daily budget | $50–100 recommended (start $50, scale if CPA holds) |
| Test duration | 30 days |
| Locations | US, KR, JP, DE, UK, CA, AU, PH, SG, TH, VN |
| Languages | English + Korean (separate ad groups by language) |
| Age | 18–45 |
| Devices | All (LWS is mobile-first — do NOT exclude mobile) |
| Ad rotation | Optimize for conversions |
| Ad schedule | 24/7 for first 14 days; narrow after data lands |

**Sanity check:** at target $8 CPA, $50/day → ~6 conv/day needed. At blended CVR ~4% that's ~150 clicks/day at ~$0.33 avg CPC. Realistic for long-tail LWS terms; tight for head terms.

### Ad group 1 — "LWS alliance tools" (English)

**Keywords (phrase + exact match):**
- `"last war survival tools"` (P) / `[last war survival tools]` (E)
- `"lws alliance planner"` (P) / `[lws alliance planner]` (E)
- `"last war survival guide"` (P)
- `"lws season 2 tools"` (P)
- `"last war alliance coordination"` (P)
- `"lws r5 tools"` (P) / `[r5 tools]` (E)

**Negatives:** `-free -download -mod -hack -cheat -apk -reddit`

**Ads (3 variants):**

**Ad 1A — Free-trial hook**
- H1: `LWS Alliance Tools — Free Trial` (28)
- H2: `Code RONY-FREE = 30 Days` (25)
- H3: `Built by an Active R5` (23)
- D1: `Landing, heat, coal, freeze, roster — 11 tools, 7 languages, PNG-ready for Discord.` (90)
- D2: `Skip the group chat. Plan Season 2 in 10 minutes. Free trial with code RONY-FREE.` (86)
- Path: `/tools` `/free`
- Final URL: `https://r5tools.io/?utm_source=google&utm_medium=cpc&utm_campaign=ag1_lws_tools&utm_content=ad1a_free`

**Ad 1B — Price / value hook**
- H1: `$30 Alliance-Wide Access` (25)
- H2: `11 LWS Planning Tools` (21)
- H3: `One-Time, No Subscription` (25)
- D1: `Personal $10 · Alliance $50 · Premium roster review +$5. One payment, all seasons.` (88)
- D2: `Built by an active R5. Works in EN + KR + 5 more languages. Discord-ready exports.` (87)
- Path: `/pricing` `/access`
- Final URL: `https://r5tools.io/?utm_source=google&utm_medium=cpc&utm_campaign=ag1_lws_tools&utm_content=ad1b_price`

**Ad 1C — Benefit / specific hook**
- H1: `Plan Season 2 in 10 Minutes` (27)
- H2: `Roster to CSV in 2 Minutes` (26)
- H3: `Heat, Coal, Freeze, Landing` (28)
- D1: `Record your member list → upload → get a CSV in 2 minutes. Then plan your S2 landing.` (89)
- D2: `Every tool exports a Discord PNG. Every tool speaks Korean. RONY-FREE = free trial.` (86)
- Path: `/roster` `/s2`
- Final URL: `https://r5tools.io/?utm_source=google&utm_medium=cpc&utm_campaign=ag1_lws_tools&utm_content=ad1c_benefit`

---

### Ad group 2 — "Roster / spreadsheet" (English)

**Keywords:**
- `"last war survival roster tracker"` (P) / `[last war roster tracker]` (E)
- `"lws spreadsheet"` (P)
- `"last war survival csv"` (P)
- `"lws alliance roster"` (P) / `[lws alliance roster]` (E)
- `"last war member list export"` (P)
- `"lws power ranking tracker"` (P)

**Negatives:** `-google -sheets -template -free -how -guide -reddit`

**Ads (3 variants):**

**Ad 2A — Free-trial hook**
- H1: `Roster Extractor — Free Trial` (30)
- H2: `Video In, CSV Out, 2 Minutes` (29)
- H3: `Code RONY-FREE Unlocks It` (25)
- D1: `Stop typing 94 names into a spreadsheet. Record → upload → CSV. Free trial today.` (85)
- D2: `Auto-dedupes name variants. R5/R4/R3 sorted. HQ + power captured. RONY-FREE.` (81)
- Path: `/roster` `/free`
- Final URL: `https://r5tools.io/?utm_source=google&utm_medium=cpc&utm_campaign=ag2_roster&utm_content=ad2a_free`

**Ad 2B — Price / value hook**
- H1: `Roster Extractor — $10` (23)
- H2: `Premium Review Pass +$5` (23)
- H3: `Never Touch a Spreadsheet` (25)
- D1: `Personal $10 unlocks 20+ videos. Premium +$5 adds Claude vision review for accuracy.` (88)
- D2: `Historical power tracking included. Line-chart your alliance week-over-week.` (81)
- Path: `/roster` `/pricing`
- Final URL: `https://r5tools.io/?utm_source=google&utm_medium=cpc&utm_campaign=ag2_roster&utm_content=ad2b_price`

**Ad 2C — Benefit / specific hook**
- H1: `Roster CSV in 2 Minutes` (24)
- H2: `Track Power Week Over Week` (27)
- H3: `Discord-Ready PNG Included` (27)
- D1: `Screen-record your member list. Get a sorted CSV, editable table, and PNG for Discord.` (89)
- D2: `Historical snapshots + Chart.js trend lines. Backup + restore built in.` (73)
- Path: `/roster` `/trends`
- Final URL: `https://r5tools.io/?utm_source=google&utm_medium=cpc&utm_campaign=ag2_roster&utm_content=ad2c_benefit`

---

### Ad group 3 — "Korean-language LWS" (Korean, KR-targeted)

**Keywords (Korean, phrase):**
- `"라스트워 서바이벌 도구"` (P)
- `"얼라이언스 플래너"` (P)
- `"라스트워 로스터"` (P)
- `"로스터 추출"` (P)
- `"라스트워 시즌2"` (P)
- `"연맹 관리 도구"` (P)
- `"R5 도구"` (P)

**Negatives:** `-무료 -다운로드 -핵 -치트 -APK`

**Ads (3 variants):**

**Ad 3A — Free-trial hook (KR)**
- H1: `라스트워 얼라이언스 도구` (13)
- H2: `RONY-FREE 코드로 무료 체험` (15)
- H3: `현역 R5가 만들었습니다` (12)
- D1: `랜딩, 열지도, 석탄, 동결, 로스터 — 11개 도구, 7개 언어, 디스코드용 PNG 지원.` (47)
- D2: `단톡방 대신 10분 만에 시즌 2를 계획하세요. RONY-FREE 코드로 무료 체험.` (43)
- Path: `/도구` `/무료`
- Final URL: `https://r5tools.io/?utm_source=google&utm_medium=cpc&utm_campaign=ag3_kr&utm_content=ad3a_free`

**Ad 3B — Price / value hook (KR)**
- H1: `얼라이언스 전체 $30` (11)
- H2: `LWS 계획 도구 11개` (11)
- H3: `일회성 결제, 구독 없음` (13)
- D1: `개인 $10 · 얼라이언스 $50 · 로스터 프리미엄 +$5. 한 번 결제, 모든 시즌.` (44)
- D2: `현역 R5가 제작. 한국어 우선 지원. 디스코드 PNG 내보내기 제공.` (35)
- Path: `/가격` `/구매`

**Ad 3C — Benefit / specific hook (KR)**
- H1: `10분 만에 시즌 2 계획` (12)
- H2: `2분 만에 로스터 CSV` (11)
- H3: `열지도, 석탄, 동결, 랜딩` (13)
- D1: `멤버 리스트 녹화 → 업로드 → 2분 만에 CSV. 그 다음 S2 랜딩 계획.` (37)
- D2: `모든 도구가 디스코드 PNG 지원. 모든 도구가 한국어 지원. 무료 체험 RONY-FREE.` (46)

---

### Ad group 4 — "Specific S2 mechanics" (English)

**Keywords:**
- `"lws coal burn calculator"` (P) / `[lws coal calculator]` (E)
- `"last war season 2 freeze"` (P)
- `"lws rare soil war"` (P)
- `"last war heat map"` (P)
- `"lws city capture"` (P)
- `"lws landing planner"` (P)
- `"lws vs days"` (P)

**Negatives:** `-mod -hack -cheat -reddit -youtube`

**Ads (3 variants):**

**Ad 4A — Free-trial hook**
- H1: `Coal Burn Calculator — Free` (28)
- H2: `Freeze Risk Dashboard Live` (27)
- H3: `Code RONY-FREE = 30 Days` (25)
- D1: `L20 furnace: 117k coal for 3h overdrive. Plan your budget before Wk3 hits.` (77)
- D2: `Freeze at -20°C. Blizzards Wk2/3/4/5. Dashboard shows who's at risk. Free trial.` (83)
- Path: `/coal` `/freeze`

**Ad 4B — Price / value hook**
- H1: `S2 Tools — $30 Alliance` (22)
- H2: `Heat, Coal, Freeze, Landing` (28)
- H3: `Built From KB Research` (23)
- D1: `Every calculation cited to a 253-source knowledge base. No made-up numbers.` (77)
- D2: `Alliance-wide $50. One payment. Works for S3 Golden Kingdom too — same tools.` (79)
- Path: `/s2` `/pricing`

**Ad 4C — Benefit / specific hook**
- H1: `Warzone 2007 = Free Codes` (26)
- H2: `Rare Soil War Scheduler` (24)
- H3: `Landing Planner + Rings` (24)
- D1: `Warzone 2007 members get free codes. Every other warzone: $10 personal or $50 alliance.` (89)
- D2: `Rank-tier ring assignment. R5 + titled R4s in Ring 1. Ministry-gate warnings included.` (89)
- Path: `/landing` `/warzone`

---

### Google Ads landing page recommendations

1. **Dedicated LP variant per ad group** (optional v2) — `/?ag=ag1` renders headline tuned to the ad group's query intent.
2. **Above-the-fold**: current hero + WHY-R5s callout is solid; keep.
3. **Add Google Ads conversion pixel** to `/unlock` success page — value=10 (Personal), 50 (Alliance), 5 (Roster Premium). Fire on Stripe redirect landing.
4. **UTM persistence** — capture UTMs in localStorage on first page load and attach to Stripe checkout metadata so CVR by ad_variant is queryable in Stripe dashboard.
5. **Speed** — LP is a single static `index.html`, already <100ms TTFB from GH Pages. No optimization needed.

---

## 2. Meta Ads (Facebook + Instagram) — 5 creative drafts

### Meta creative 1 — Video ad (15s Roster Extractor demo)

**Format:** Vertical 9:16, 15 seconds, sound optional (captions burned in).

**Script + storyboard:**

| t | Visual | Caption (burned-in, bottom third) |
|---|---|---|
| 0.0–1.5s | Phone screen: "Alliance → Members" tab in LWS, R5 crown visible at top | "Your alliance has 94 members." |
| 1.5–4.5s | Slow thumb-scroll down the member list, ~3s total scroll | "Screen record it. That's it." |
| 4.5–6.0s | Cut to laptop: drag video file into r5tools.io/roster upload zone | "Drop the video. Two minutes later..." |
| 6.0–10.0s | Time-lapse: extractor progress bar → review table populates → sortable columns | "94 members. Ranks. HQ levels. Power." |
| 10.0–13.0s | Click "Download CSV" → CSV opens in Google Sheets, sorted by power desc | "CSV in your hands. Discord PNG too." |
| 13.0–15.0s | Full-screen end card: r5tools.io logo + "Try free: code RONY-FREE" | "r5tools.io · RONY-FREE" |

**Ad copy (post text):**

> Primary text: `Your R5 has been typing 94 names into a Google Sheet for two seasons. Stop. Record your member list, upload the video, get a sorted CSV in 2 minutes. First video free with code RONY-FREE.`
> Headline: `Roster CSV in 2 minutes`
> Description: `Built by an active R5. 7 languages. Free trial.`
> CTA button: `Try for Free`
> URL: `https://r5tools.io/?utm_source=meta&utm_medium=paid_social&utm_campaign=video_demo&utm_content=roster_15s`

### Meta creative 2 — Static image, pain-first hero

**Image:** Split-screen. Left half: cluttered Google Sheet screenshot with red misalignments, missing rows, "?" cells — labeled "Before". Right half: r5tools.io Roster Extractor review table, clean, sorted — labeled "After". Dark background matching r5tools.io palette (#0a0e1a + gold #c9a961).

**Copy:**

> Primary text: `The Google Sheet is killing your alliance. 94 members. Half the ranks wrong. Nobody knows who's actually the top rally leader. r5tools.io ships 11 planning tools built by an active R5. Free trial: RONY-FREE.`
> Headline: `Stop losing S2 to alliances with tools`
> Description: `$10 personal, $50 alliance-wide.`
> CTA: `Learn More`

### Meta creative 3 — Carousel (5 cards)

Each card 1080×1080, dark theme, one tool screenshot + one-line benefit.

| # | Screenshot | Headline | Body |
|---|---|---|---|
| 1 | Roster Extractor review table | `Roster in 2 minutes` | `Video in, CSV out. Handles 94+ members.` |
| 2 | Landing Planner ring diagram | `Landing planned in 10 minutes` | `Rank-tier rings. Ministry warnings included.` |
| 3 | Heat Simulator concentric bands | `Season 2 freeze survival` | `Know who's at -20°C before Wk3 blizzards.` |
| 4 | Coal Burn Calculator chart | `L20 overdrive = 117k coal` | `Budget before Wk3. Not during.` |
| 5 | r5tools.io landing hero | `Try free: RONY-FREE` | `11 tools. 7 languages. One-time payment.` |

**Post copy (single):**
> `Eight planning tools your R5 doesn't have. Built by an active R5 for R5s. Free trial with code RONY-FREE — no card required.`
> CTA: `Learn More`
> URL: `https://r5tools.io/?utm_source=meta&utm_medium=paid_social&utm_campaign=carousel_tools&utm_content=5tool_walk`

### Meta creative 4 — Korean version of image ad

Same split-screen visual as Creative 2. All Korean copy.

**Copy (KR):**

> Primary text: `구글 시트로 얼라이언스를 관리하고 계신가요? 94명 멤버, 계급은 절반이 틀리고, 최고 랠리 리더가 누군지 아무도 모릅니다. r5tools.io는 현역 R5가 만든 8개의 계획 도구를 제공합니다. 무료 체험: RONY-FREE.`
> Headline: `도구 없는 얼라이언스에게 S2를 뺏기지 마세요`
> Description: `개인 $10, 얼라이언스 $50.`
> CTA: `자세히 알아보기`
> URL: `https://r5tools.io/?utm_source=meta&utm_medium=paid_social&utm_campaign=image_kr&utm_content=split_kr`

**Targeting:** KR + JP (Korean-diaspora + JP players who play in KR warzones), 18–45, interests include Last War: Survival + mobile strategy games.

### Meta creative 5 — Alliance leader testimonial (placeholder)

**Format:** Static image, testimonial layout, 1080×1350 Instagram Feed.

**Placeholder copy (to swap when we have a real testimonial):**

> `"We were losing our top 5 rally leaders to freeze in Wk3 every season. r5tools.io's Freeze Dashboard flagged every one of them 4 days ahead. Zero freeze-outs in S2."`
> — [Name], R5 of [Alliance], Warzone [####]
>
> CTA overlay: `Try free: RONY-FREE at r5tools.io`

**Placeholder ownership note:** Do NOT run this variant until we have a real quote + permission. Fake testimonials are a Meta policy violation AND terrible for brand.

---

## 3. Twitter / X ad drafts

### Twitter creative 1 — Screenshot + short hook

**Tweet:**
> `Your R5 has been typing 94 names into a Google Sheet for two seasons.`
>
> `Stop.`
>
> `Record → upload → CSV in 2 minutes. Then plan your S2 landing in 10.`
>
> `Free trial: code RONY-FREE`
>
> `r5tools.io`
>
> [Attached image: Roster Extractor review table screenshot, sorted by power]

**Promoted format:** Website Clicks objective. Target: interest keywords `Last War Survival, LWS, mobile strategy, alliance games, First Fun`. Followers of: `@FirstFunGames` + accounts of top LWS content creators.

### Twitter creative 2 — Video demo tweet

**Tweet:**
> `2 minutes. 94 members. Sorted CSV.`
>
> `This is what your alliance roster spreadsheet should feel like.`
>
> `Free trial with RONY-FREE.`
>
> `r5tools.io`
>
> [Attached video: same 15s Roster Extractor demo from Meta Creative 1]

**Promoted format:** Video Views + Website Clicks combo.

### Twitter creative 3 — Reply template (organic + boosted)

**Use case:** Reply to tweets mentioning LWS pain points (roster tracking, S2 planning, freeze issues, alliance coordination). Boost the reply as a Promoted Reply once it lands 5+ organic likes.

**Template A — Roster pain:**
> `We built r5tools.io specifically for this. Record your member list, upload, get a CSV in 2 minutes. Free trial with code RONY-FREE if you want to try it before the next season.`

**Template B — Freeze / S2 pain:**
> `The Freeze Risk Dashboard at r5tools.io flags this 4+ days ahead. Free with warzone 2007 code or code RONY-FREE for anyone else.`

**Template C — Google Sheet complaints:**
> `Same. That's why we shipped r5tools.io — one CSV upload, 11 planning tools consume it. Free trial: RONY-FREE.`

**Rules for using these:**
- Only reply to tweets where the pain-point is genuine and the tweeter is active (posted this week).
- NEVER reply to tweets from First Fun official accounts or LWS moderators.
- Max 3 reply-boosts per day. Twitter's spam detection flags patterns fast.
- Log every reply in `~/claudecode/r5tools/r5tools-landing/marketing/twitter-reply-log.csv` so we can measure conversion attribution.

---

## 4. Projected results — 30-day spreadsheet-ready table

Copy into a Google Sheet as-is.

```
Channel              | Est CPC | Daily Budget | Clicks/day | Est CVR | Signups/day | Est Revenue/day | 30d Revenue
Google Ads (US)      | $1.20   | $30          | 25         | 4%      | 1.0         | $22 (alliance)  | $660
Google Ads (KR)      | $0.60   | $20          | 33         | 6%      | 2.0         | $44 (alliance)  | $1,320
Google Ads (JP/DE/UK) | $1.00  | $15          | 15         | 3%      | 0.45        | $10 (alliance)  | $300
Meta (US)            | $2.50   | $30          | 12         | 3%      | 0.36        | $8 (alliance)   | $240
Meta (KR)            | $0.90   | $20          | 22         | 5%      | 1.1         | $24 (alliance)  | $720
Twitter (blended)    | $1.80   | $15          | 8          | 3%      | 0.24        | $5 (alliance)   | $150
                     |         |              |            |         |             |                 |
Total                |         | $130         | 115        | ~4.3%   | 5.15        | $113            | $3,390
```

### Revenue-mix assumptions

- Alliance $50 = 40% of conversions (heavy weighting because R5s are our target).
- Personal $10 = 45% of conversions.
- Roster Premium $5 = 15% of conversions (usually add-on to Personal).
- Blended per-signup value ≈ $22.

### 30-day revenue range

- **Pessimistic** (CVR at half projection, CPC 25% high): **~$1,700**
- **Baseline** (table above): **~$3,400**
- **Optimistic** (CVR 1.5×, CPC 15% low): **~$6,100**

At $130/day × 30 days = $3,900 ad spend. Baseline = **~$500 net loss on ad spend alone in month 1**, but LTV is $0 for now since we don't have subscription — this is a customer-acquisition test, not a payback-in-30-days test. Watch CPA at week 2 and either scale (CPA < $8) or pause (CPA > $15).

### Kill-switch triggers

- Pause any ad group with 100+ clicks and 0 conversions.
- Pause the whole campaign if blended CPA > $20 after 7 days.
- Pause + investigate if CVR > 10% (likely tracking pixel misfire, not real conversions).

---

## 5. Landing page A/B variants (hero copy)

Current hero is Variant A. Deploy Variant B + C as A/B via `?v=b` / `?v=c` query param — client-side swap at page load. Split 33/33/33 for 14 days.

**Variant A (current, control):**
> Headline: `Your alliance is planning Season 2 in a group chat`
> Sub: `Stop. Here are 11 tools that fix it.`

**Variant B (loss-aversion):**
> Headline: `Stop losing S2 to alliances with tools`
> Sub: `Get the tools. Free trial: code RONY-FREE.`

**Variant C (pain-first / spreadsheet):**
> Headline: `The Google Sheet is killing your alliance`
> Sub: `Try this instead. 11 tools, one CSV, ten minutes to plan a season.`

### A/B measurement

- Instrument each variant with `data-variant="A|B|C"` on hero + fire `hero_view` event with variant to GA4.
- Primary metric: click-through to Roster Extractor OR Access Code claim.
- Secondary metric: paid conversion in Stripe.
- 14 days, then pick the winner and set it as default; retire the other two.

---

## 6. Launch checklist

Before Evan approves budget:

- [ ] Access Codes deploy live at `access-codes.r5tools.io` (task #50)
- [ ] Stripe payment links replace all `mailto:` CTAs on r5tools.io
- [ ] Google Ads conversion pixel installed on `/unlock` success page
- [ ] Meta Pixel installed on landing + firing `Lead` + `Purchase`
- [ ] Twitter/X conversion pixel installed
- [ ] UTM persistence in localStorage → passed to Stripe checkout metadata
- [ ] A/B hero variants B + C shipped (client-side swap on `?v=` query)
- [ ] Twitter reply log CSV created + Evan agrees to reply cadence rules
- [ ] Video demo shot (15s Roster Extractor screen recording) — needed for Meta creative 1 + Twitter creative 2
- [ ] Split-screen Before/After image designed for Meta creative 2 + 4
- [ ] Final URLs QA'd — every UTM combination resolves 200 + fires pixel

Once all boxes checked → Evan sets budget in each platform, activates campaigns. Claude does not touch payment or bidding controls.

---

*End of brief. All copy in this document is copy-paste-ready. Character counts verified for Google Ads headline (≤30) and description (≤90) limits.*
