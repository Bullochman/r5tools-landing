# JP Expansion Plan — R5TOOLS.IO

**Status:** JP hero landing + core funnel (refer / waitlist / cheat-sheet) shipped 2026-07-17. Full JP SEO farm (seasons/heroes/warzones/guides/glossary — 690 pages) deferred until traction proves out.

**Why JP:** #2 highest-paying LWS demographic after KR. Japanese mobile gamers spend disproportionately on QoL / meta tools, and LWS has one of its heaviest paying player bases in Japan. KR + JP together could plausibly account for 50-60% of paid unlocks even though they're a smaller share of overall traffic.

---

## What's live in JP (as of 2026-07-17)

| Page | Path | Live |
|---|---|---|
| Hero landing | `/ja/index.html` | Yes |
| Referral dashboard | `/ja/refer.html` | Yes (JA/EN/KO toggle) |
| Founding waitlist | `/ja/waitlist.html` | Yes |
| Cheat sheet lead-magnet | `/ja/cheat-sheet.html` | Yes (PDF is EN — JA translation TODO) |
| Language toggle on EN + KO heros | `/index.html`, `/ko/index.html` | Yes (hreflang alt tags) |
| Sitemap entries + hreflang triads | `/sitemap.xml` | Yes (JP added to 5 core URLs) |

**Deferred (out of scope for this pass):**
- 690-page JP SEO farm (`/ja/seasons/`, `/ja/heroes/`, `/ja/buildings/`, `/ja/events/`, `/ja/warzones/`, `/ja/guides/`, `/ja/glossary/`)
- JP-native PDF version of the Season 2 Landing Cheat Sheet
- JP FAQ (`/ja/faq.html`) — EN version doesn't ship yet either
- JP-localized versions of privacy / terms / roadmap / status pages
- JP JSON-LD keyword expansion for schema.org

**Trigger to invest in JP SEO farm:** 10 paying JP alliances signup. Below that threshold, hero + funnel + Discord/X organic is enough. Above that, run `kr_translator.py` retargeted at JA and ship the full farm — expected 690 pages, ~2-3 hours of Claude-in-loop translation cost, similar shape to the KR farm.

---

## JP-specific outreach playbook

Different from KR — KR was Discord + dcinside + Kakao heavy. JP is much more platform-fragmented.

### Where JP LWS players actually congregate

1. **Discord — JP-native LWS servers** (different from KR/EN servers)
   - Search Disboard/Top.gg for `Last War: Survival 日本` — expect 8-15 active servers with 200-2000 members each.
   - Larger Japanese mobile-game "meta" servers (`原神メタ`, `モンスト`, etc.) often have LWS sub-channels — cross-post there.
   - **Do not** cross-post to KR servers. KR/JP tensions in mobile-game communities are real; posts perceived as spam from the wrong region get deleted.

2. **X (Twitter)** — JP LWS Twitter is the loudest single channel
   - Hashtags: `#ラストウォー` (Last War), `#ラスサバ` (short for "Last Survival"), `#LastWarSurvival`, `#ラストウォーサバイバル` — the first two carry the majority of the JP community.
   - Post cadence: 1 tweet/day for the first week, then 2/week; JP Twitter rewards consistency over volume.
   - Reply-first strategy: search `#ラストウォー` daily, reply to R5/R4 posts with genuinely helpful answers (with tool link only when directly relevant). JP community heavily penalizes cold-drop tool spam.

3. **TikTok JP** — LWS content mostly under `#ラストウォー`, `#ラスサバ`
   - JP TikTok audience skews younger + more casual than the R5 buyer persona, but it's the top-of-funnel for players who eventually become R5s.
   - Voiceovers work best with a synthetic JA female voice (Yuki / Kyoko on macOS `say`, or ElevenLabs JA voices — MaKayla stack is set up for this).
   - Reuse the 10 EN TikTok scripts in `marketing/tiktok/` as source material, retranslate for JP idiom (do NOT machine-translate — localize).

4. **Reddit JP** — much smaller than KR reddit but exists
   - `r/LastWarSurvival` accepts JP-language posts (small subreddit, mixed-lang tolerated).
   - No dedicated JP LWS subreddit as of 2026-07 — a `r/ラストウォーサバイバル` doesn't exist yet; unclear whether to seed one.

5. **YouTube JP** — JP LWS content creators
   - Search `ラストウォー サバイバル R5` and `ラストウォー 攻略` for active JP creators.
   - JP creators are more responsive to sponsorship / product-mention offers than EN creators; a $50-100 tool-review pact often works. Track outreach in `marketing/warzone-tracking.csv` under a new `region=JP` column.

6. **note.com / Zenn** — JP long-form writing platforms
   - JP gamers write long-form strategy guides on note.com more than on Reddit. Search `ラストウォー note` for guide authors — DM them for tool review / affiliate placement.

7. **Discord — official JP LWS server (if it exists)**
   - Century Games / First Fun does not currently run an official JP Discord for LWS as far as I can confirm (2026-07-17). If they launch one, prioritize it.

### Hashtags whitelist

```
#ラストウォー
#ラスサバ
#LastWarSurvival
#ラストウォーサバイバル
#R5攻略
#ラストウォー攻略
#モバイルSLG    (broader — for TikTok reach beyond LWS)
```

Avoid: `#Genshin` / `#原神` / other-game hashtags — hashtag hijacking is more heavily punished on JP X than KR/EN X.

### Voice + register

- Site copy: **丁寧語** (formal-polite, "です/ます" form) — not 敬語 (super-formal keigo). Matches how JP SaaS communicates to gamers (Notion JP, Figma JP, Cloudflare JP all use this register).
- Discord / Twitter DMs to R5s: 丁寧語 with slightly softer particles ("〜ですよね", "〜という感じで"). Never お客様 / 御社 (business-formal) — R5s aren't customers, they're peers.
- Do NOT use カタカナ英語 for words that have a natural JA form when the JA form is more common in-game (e.g. use "同盟" only when the JP client actually shows "同盟"; if the JP client shows "アライアンス" — use アライアンス).

### JP LWS terminology (verified from JP player communities)

| EN | JP native |
|---|---|
| Alliance | アライアンス |
| Hive | ハイブ |
| Warzone | ウォーゾーン |
| Furnace | ファーネス |
| Overdrive | オーバードライブ |
| Polar Storm | ポーラーストーム |
| Crimson Plague | クリムゾンプレイグ |
| Golden Kingdom | ゴールデンキングダム |
| Rally Leader | ラリーリーダー |
| Landing coordinates | ランディング座標 |
| Rare Earth (season resource) | レアアース |
| Coal (season resource) | 石炭 |
| Titanium | チタン |
| Warlord Missile | ウォーロード ミサイル |
| Freeze | 凍結 |
| Blizzard | ブリザード |

**Note:** JP LWS players use a mix of カタカナ英語 and native JA depending on the term. When in doubt, prefer whatever appears in the JP client localization.

---

## Payment nuances

### Stripe vs PayPal

- **Stripe** is the current default (matches EN/KO) — accepts JP-issued cards fine, JCB support enabled via Stripe default settings.
- **BUT** — Japanese buyers under 35 have a strong preference for PayPal over direct card-entry on unfamiliar sites. Trust barrier is higher than KR/EN.
- **Recommendation:** offer both Stripe + PayPal on the JP pricing page once we have >10 JP paying alliances signed up. Wire up via Stripe's PayPal wallet integration (single Stripe checkout URL, PayPal appears as a payment option).
- **Do NOT** add PayPal-only path — the ledger reconciliation is not worth the complexity below scale.
- **LINE Pay** — could matter for JP mobile buyers, but Stripe doesn't support it directly and standalone LINE Pay integration is heavy. Skip for now; revisit if we see cart-abandonment signal from JP.

### Currency display

- USD is the invoice currency (Stripe processes in USD).
- Display ¥ context sub-label on every price ("約 ¥4,500" style) so JP buyers can gut-check before clicking.
- Approximate rates locked at $1 ≈ ¥150 (as of 2026-07). Update sub-labels when USD/JPY moves >±10%.
- Do NOT localize prices ($30 → ¥4,500 as the primary price) — that creates FX/reconciliation overhead and doesn't match the founding-scarcity messaging where the $30 number is the SEO anchor.

### JP consumption tax (消費税)

- Stripe handles this automatically via Stripe Tax if enabled. If not enabled, JP buyers pay the USD amount and there's no Japan-side tax collection obligation for a US-based sole prop selling digital goods to individual JP consumers under specific thresholds.
- Consult a JP tax accountant before we cross ¥10M annual JP revenue. Below that, Stripe defaults are fine.

---

## When to invest in the full JP SEO farm

**Recommended trigger: 10 paying JP alliances signup.**

That's ~$300-500 gross from JP (mix of Personal + Alliance Bundle unlocks), which is enough to justify the ~2-3 hours of translation cost + ongoing content maintenance for 690 pages.

**Signals to watch:**
- JP direct traffic to `/ja/` > 200 unique/week (GA4 or Plausible filter by lang=ja)
- JP referrer signups > 3 (via `?ref=JP-HOME` attribution in referral dashboard)
- JP alliance-code emails > 5/week (`mailto:hello@r5tools.io?subject=Alliance Bundle`)
- Any JP creator sponsorship close rate > 20%

**When trigger fires, run:**

```bash
# Same pattern KR used — glossary substitution first, then LLM polish.
cd ~/claudecode/r5tools/r5tools-landing
python3 ja_translate_pages.py         # create this — mirror kr_translate_pages.py
python3 ja_translator.py              # create this — mirror kr_translator.py (LLM polish, needs ANTHROPIC_API_KEY)
```

Expected output: 690 pages under `/ja/{seasons,heroes,buildings,events,warzones,guides,glossary}/`, ~10 minutes to build + verify + push, +690 URLs to sitemap.

**Or:** if JP traffic never converts (< 10 paying alliances after 6 months), sunset `/ja/` back to a redirect at `/`. Do NOT let the JP hero rot at half-shipped state — either invest or retire.

---

## Analytics tags for JP funnel

Already wired (via `?ref=JP-HOME` on all outbound links from `/ja/index.html`):

- `JP-HOME` — landing → Stripe / access-codes / tool
- `JP-REFER` — set this on any /ja/refer.html shared link
- `CHEATSHEET-JP` — download button on `/ja/cheat-sheet.html`

Add to `analytics.js` funnel definitions:

```js
// Add to conversion goals in analytics.js:
{ id: 'jp_hero_view', match: /^\/ja\/(index\.html)?$/ },
{ id: 'jp_pricing_click', match: 'ref=JP-HOME' },
{ id: 'jp_cheatsheet_download', match: 'ref=CHEATSHEET-JP' },
```

Plausible custom events: `jp_stripe_click`, `jp_bundle_email`, `jp_free_code_email` — filter by `path startswith /ja/`.

---

## What NOT to do

- **Don't** cross-launch JP + KR content in the same Discord thread. Regional communities are distinct.
- **Don't** use machine translation for any JP-facing copy. Every JP string must read as though written by a native JP LWS player.
- **Don't** claim "8 tools" — the site actually ships 11. This applies to all languages (see `MARKETING-INCONSISTENCIES.md`).
- **Don't** promise timezone-aware customer support in JP — I'm US-Central and reply within 24h. Be honest about it.
- **Don't** invest in JP paid ads (Twitter Ads JP, Yahoo Japan) until 10+ organic JP alliance signups prove the funnel converts. Paid JP ads have historically had 3-5x higher CPM than EN and 2x higher than KR.

---

## Deferred items (revisit at trigger)

- [ ] JP-native cheat-sheet PDF (currently EN PDF served from JP page)
- [ ] JP-native SEO farm (690 pages)
- [ ] JP FAQ page
- [ ] JP-localized email drip campaign (currently EN drip is sent)
- [ ] JP conversion nudges (`automation/conversion-nudges/` — add JA templates)
- [ ] JP Discord server / community (only if JP signup rate justifies)
- [ ] LINE Pay / JCB direct integration
- [ ] JP creator sponsorship program (defer to $500 JP MRR)
- [ ] note.com cross-post automation
