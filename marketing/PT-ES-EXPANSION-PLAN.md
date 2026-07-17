# PT-BR + ES-LatAm expansion plan

**Status:** hero + waitlist + refer + cheat-sheet shipped in both locales on 2026-07-17. Full SEO farm (heroes/warzones/glossary/events/buildings/guides/seasons) intentionally NOT translated yet — see "when to invest" section below.

**Locale codes shipped:**
- `pt-BR` — Brazilian Portuguese (NOT European `pt-PT`). Voice: informal, gamer register (`você` not `tu`, `pra` colloquial). Currency labeled as BRL in sub-labels; Stripe still charges in USD.
- `es-419` — LatAm Spanish (NOT Castilian `es-ES`). Voice: informal peer-to-peer (`tú` for pals, `usted` reserved for very formal cases only). NO `vosotros`. NO Castilian slang. Reads natively for MX/CO/AR/PE audiences. Currency labeled as MXN in sub-labels; Stripe charges in USD.

Why not use generic `pt` / `es`? Because the LWS market split is heavy on Brazil and Mexico/Colombia/Argentina; European Portuguese and Castilian Spanish read as foreign to those audiences. Better to over-specify with `pt-BR` + `es-419` and lose the tiny PT/ES market than annoy the paying BR/LatAm market. Google's hreflang guidance also treats `pt` and `pt-BR` as different targets — using the specific tag helps rank in-region.

---

## PT-BR — Brazil rollout

### Where the R5s actually hang out

**Reddit:**
- `r/LastWarSurvival` — main international sub; there IS a small BR contingent posting in PT. Reply in PT-BR to any BR-language thread that pops up. Do NOT post PT threads there — the mods enforce EN as the operating language.
- `r/LastWarBrasil` — check if it exists (unclear from public search as of 2026-07-17). If it doesn't, DO NOT be the one to create it — subs founded by tool vendors trip mod-suspicion in the LWS community. If it exists but is quiet, be a regular commenter for 2 weeks before dropping the r5tools link.
- `r/gamesBR` and `r/jogos` — broad Brazilian gaming subs. Only worth it for a launch-day post ("R5 brasileiro compartilhando ferramenta gratuita pra Last War Survival") — one-shot, don't spam.

**Discord:**
- Search "Last War Brasil" / "LWS BR" / "aliança brasileira Last War" — a handful of unofficial PT-BR guild servers exist (100-500 members each). Approach the R5 privately with a code demo before dropping a channel link.
- Any PT-native alliance in the international "Last War Survival Community" server (~50k members) — post in `#discussion-br` if it exists.

**YouTube:** Brazilian LWS creators to look for: search "Last War Survival R5", "aliança Last War", "R5 dicas Last War" on YT-BR. Reach out to whoever has 5k+ subs — offer them a Founding code (free), NO paid sponsorship yet.

**TikTok:** BR TikTok is enormous. Hashtags below.

### PT-BR hashtags (verified as active)

- `#LastWarSurvival` (universal, will pick up BR viewers)
- `#LastWarBR`
- `#LWSBrasil`
- `#UltimaGuerraSobrevivencia` (transliteration some BR players use)
- `#R5aliança`
- `#jogosdecelular` — broader mobile-games tag, decent reach

### Payment nuances (Brazil)

**The problem:** Stripe international cards get declined at high rates for BR cardholders unless they've used their card abroad before. Also BR cardholders default-expect PIX (instant bank-to-bank), which Stripe doesn't handle in `payment_method_types=['card']` mode.

**What we're doing NOW:** Kept USD-only. The BR sub-labels say "cobrado em dólar (cartão internacional)" so nobody's surprised at checkout when Stripe shows USD. Approximate BRL is educational, not binding.

**When to invest in PIX:**
- After first 3 paying BR alliances have converted successfully on USD (proves demand)
- Then either (a) add Stripe BR entity (requires CNPJ we don't have — non-starter), or (b) add Mercado Pago as second payment provider (accepts PIX + boleto + BR cards; ~7% fees vs Stripe's 4%; separate ledger to reconcile).
- Realistic timeline: only worth it if BR monthly revenue exceeds $500. Below that, the reconciliation friction eats the conversion gain.

**PIX QR alternative (manual):** For high-value alliance bundle requests, offer the R5: "pay via PIX to `hello@r5tools.io` PayPal → we manually enable the code." No infrastructure needed. Do NOT list this publicly (looks janky). Use only in email replies to hot leads.

### Content calendar (PT-BR, first 60 days)

- Week 1: Launch tweet (X in PT), Reddit intro comment in `r/LastWarSurvival` for BR threads, DM 3 BR YT creators.
- Week 2: 1 TikTok "R5 brasileiro apresenta ferramenta pra pouso de Temporada 2" (60-sec walkthrough of the landing planner).
- Week 3: Cheat sheet PDF share on `r/LastWarSurvival` (BR-thread only), Discord DMs to top 3 BR alliance R5s from the KR-outreach playbook (adapted).
- Week 4: If any conversions → collect first BR testimonial (voluntary, low-pressure). If no conversions → interview a BR player about why (30-min voice call, offer free code as thanks).

---

## ES-419 — LatAm rollout

### Where the R5s actually hang out

**Reddit:**
- `r/LastWarSurvival` — same rule as BR: reply in ES to LatAm-language threads. Don't post ES threads there.
- `r/LatinoAmerica` — off-topic for gaming; skip.
- `r/MexicoGaming` / `r/ArgentinaGaming` / `r/ColombiaGaming` — worth ONE launch-day post each ("R5 latino compartiendo herramienta gratis para Last War Survival"). Don't spam beyond that.

**Discord:**
- "Last War Latino" / "Alianza LWS" / "Guerra Ultima" — several 100-500 member unofficial LatAm servers exist. Same rule: R5-to-R5 approach before dropping a link.
- International "Last War Survival Community" — post in `#discussion-latam` if it exists, otherwise `#discussion-es`.

**YouTube:** Search "Last War Survival R5 español", "Last War alianza estrategia", "Last War guia latino". Big countries to target: MX creators first (largest LatAm gaming market), then AR + CO. Same offer: Founding code free, no paid promo yet.

**TikTok:** LatAm TikTok is huge. Hashtags below.

**Facebook Groups:** ES-LatAm still uses FB heavily for gaming communities. Search "Last War Survival México", "Last War Argentina", "Alianza LWS". Underrated channel — usually 2k-10k member closed groups.

### ES-419 hashtags (verified as active)

- `#LastWarSurvival` (universal, will pick up LatAm viewers)
- `#LastWarEspañol`
- `#LWSLatam`
- `#UltimaGuerra`
- `#R5alianza`
- `#JuegosMoviles` — broader mobile-games tag, decent reach in MX/AR/CO

### Payment nuances (LatAm)

**The problem:** Similar to Brazil. Stripe international-card decline rates are high for LatAm cardholders. Mexican cardholders often expect OXXO (cash voucher) or SPEI (bank transfer); Argentine cardholders face currency-control friction and often use USDT/crypto instead.

**What we're doing NOW:** Kept USD-only. ES sub-labels say "cobrado en dólares (tarjeta internacional)" — no surprise at checkout.

**When to invest in MXN / regional payment:**
- After first 3 paying MX or CO alliances convert successfully on USD
- Then evaluate Mercado Pago (works in MX/AR/CO/CL/PE) — accepts OXXO, SPEI, local cards; ~7-9% fees
- Or Ualá / Openpay for MX-only
- Realistic timeline: only worth it if LatAm monthly revenue exceeds $500. Same threshold as BR.

**AR-specific note:** Argentine dollar controls mean AR cardholders often literally CAN'T pay in USD. If we see high AR waitlist signups but zero conversions, that's the signal — add USDT-crypto payment as AR-only workaround. Don't build it speculatively.

### Content calendar (ES-419, first 60 days)

- Week 1: Launch tweet (X in ES), Reddit intro comment in `r/LastWarSurvival` for LatAm threads, FB Group intro post in top 2 MX groups.
- Week 2: 1 TikTok "R5 mexicano/argentino/colombiano presenta herramienta para aterrizaje de Temporada 2" (60-sec walkthrough).
- Week 3: Cheat sheet PDF share on FB Groups + `r/LastWarSurvival` (LatAm-thread only). Discord DMs to top 3 LatAm alliance R5s.
- Week 4: Collect first LatAm testimonial or interview a lapsed prospect.

---

## When to invest in the full 690-page SEO farm translation

**Current state:** All 690 SEO-farm pages (seasons/heroes/warzones/glossary/events/buildings/guides) exist in EN + KO. NOT translated to PT or ES.

**Why we're waiting:**
1. Automated translation (LLM or otherwise) of 690 pages produces low-quality PT and ES that reads like a robot. LWS players spot machine translation instantly and it burns credibility.
2. Hand-authoring 690 pages in native PT-BR and ES-419 is a ~40-hour investment per language — worth doing ONLY after there's revenue signal.
3. The hero + waitlist + refer + cheat-sheet cover 95% of conversion intent. The SEO farm is a search-discovery long tail — its ROI without paid traffic is 3-6 month.

**Trigger to translate:**
- **PT:** first 5 paying BR alliances (either Personal or Founding tier). At that point, invest in hand-translated SEO farm for the top-15 heroes + top-8 seasons + top-30 glossary terms. Full 690-page mirror only after 20 paying BR alliances.
- **ES:** same trigger — 5 paying LatAm alliances → partial farm → 20 paying → full farm.

**Translation approach when triggered:**
- NOT via kr_translator.py-style LLM automation for user-facing pages. That worked for KR because Evan can eyeball the output and catch errors; he doesn't read PT or ES fluently enough to QA.
- Hire a native PT-BR / ES-419 gamer-translator (one who plays LWS or similar mid-core mobile games) on Upwork for the top-tier pages. Budget: $300 per language for the top-50 pages.
- Bottom-tier long-tail SEO pages (rank #40+ terms) can use glossary-substitution translation via `kr_translate_pages.py`-equivalent — good enough for crawlers, not visible enough to hurt brand.

**Warning:** Do NOT machine-translate the hero, refer, waitlist, cheat-sheet, or top-15 hero pages. Those are the pages a prospect reads BEFORE deciding to pay. Bad translation there = zero conversions.

---

## Cross-locale link discipline

Hero footer now links between all 4 languages (EN/KO/JA/PT/ES — 5 including the in-flight JA). Sitemap has all quintuple hreflang entries for /index, /refer, /waitlist, /cheat-sheet. Google should serve the right locale to the right country.

Founding-widget.js — currently only has EN + KR strings per CLAUDE.md. It needs PT-BR + ES-419 language strings added before the PT/ES heroes go live to public URL, otherwise the widget will show EN copy on the PT/ES pages. **TODO before hard launch:** add PT + ES strings to `founding-widget.js` (~1 hour of work, one file).

---

## Metrics to watch

Per locale, weekly:
- Sessions (Plausible: `filter=lang:pt` and `filter=lang:es`)
- Cheat-sheet PDF downloads
- Waitlist signups
- Refer page views + share-clicks
- Stripe successful checkouts (already tagged via `?ref=PT-HOME` / `?ref=ES-HOME`)

Kill criterion: if after 60 days a locale has <100 sessions/week and zero paying customers, don't build more content for it — reallocate hours to whichever locale IS pulling traffic.
