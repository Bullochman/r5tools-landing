# R5TOOLS.IO — Support FAQ (English)

The first 20 questions we expect. Every answer is grounded in the current source-of-truth: `index.html`, `refer.html`, `terms.html`, `privacy.html`, and `LWS_Access_Codes/server.py`. Anything marked **[EVAN — decide]** is a policy question that needs a real answer from Evan before we ship this publicly.

Word counts kept under 400 per answer so the HTML page stays scannable.

---

## Getting Started

### Q1. What is r5tools?
R5TOOLS.IO is a suite of 11 planning tools built for R5s and R4s of *Last War: Survival* alliances. It replaces the Google Sheet + Discord PDF workflow that most alliances still use. The flagship is the **Roster Extractor** — record a 90-second screen recording of your alliance member list, upload the video, and Claude vision converts every row into a CSV in about two minutes. Once your roster is CSV, every other tool in the suite consumes it: Landing Planner, Heat Simulator, Freeze-Risk Dashboard, Coal Burn Calculator, City Capture Planner, Season Timeline, Hive Grid Manager, Profile Studio, VS Days Optimizer, and the KB Chat. Every tool speaks 7 languages (Korean first, then English, Spanish, Portuguese, Japanese, German, French). Every tool exports its state as a dark-theme PNG sized for Discord. Built by an active R5, not a spreadsheet company.

### Q2. How do I unlock?
Go to **[access-codes.r5tools.io](https://access-codes.r5tools.io/)** and enter your code. That single code unlocks every tool in the suite for 90 days on your device (stored in a `lws_unlock_code` cookie). Three ways to get in:
1. **Free — Warzone 2007 members:** ask your R5 for `RONY-FREE` (works from any warzone in practice).
2. **$10 Personal:** one-time payment via Stripe, unlocks the full suite for one player.
3. **$50 Alliance Bundle** (or **$30 Founding — first 10 alliances only**): R5 pays once and shares the code with the whole alliance. Everyone unlocks on their own device.

If you clear cookies or use a new device, just re-enter the code.

### Q3. What does RONY-FREE do?
`RONY-FREE` is the primary free access code for RONY alliance members and Korean-speaking players Evan has personally invited. It's tagged as Warzone 2007 in our system but works from anywhere in practice — we don't hard-enforce warzone. Enter it at [access-codes.r5tools.io](https://access-codes.r5tools.io/) and you get the full 11-tool suite for 90 days on that device. If someone in your alliance is using it, ask them — the same code works for the whole alliance. If you're not in RONY but were sent here by an existing member, you're welcome to use it too.

### Q4. Do I need to install anything?
No. Every tool runs in your browser. No app, no download, no build step. The KB Chat and Roster Extractor call our server (which hits the Claude API for you); the other 9 tools run entirely client-side — your roster CSV stays on your device unless you explicitly upload it. Bookmarking `r5tools.io` is enough. If you install our (future) Discord bot, that's separate and optional.

### Q5. Does this work on my phone?
Yes for most tools. We test on Chrome and Safari on desktop and iOS. The Roster Extractor accepts iPhone `.mov` and Android `.mp4` screen recordings — most R5s do the whole flow from their phone. The heavier planning tools (Heat Simulator, Hive Grid Manager) work better on a tablet or laptop because of screen real estate. Firefox usually works. Older Android builds vary — if a tool breaks on your device, hit the 💡 Send feedback button on any page and tell us the browser + version.

---

## Pricing & Refunds

### Q6. What does $10 / $30 / $50 actually get me?
- **$10 Personal (one-time):** Full 11-tool suite for one player, 90 days per device, includes the standard Roster Extractor. Best for solo R4s or a single R5 trying us out.
- **$30 Alliance Founding (first 10 alliances only, then $50):** Full suite for your whole alliance — you share one code with every member, everyone unlocks on their own device. **Plus lifetime access to every new tool I ship.** Only 10 slots at $30.
- **$50 Alliance Bundle (one-time):** Same alliance-wide sharing as Founding, without the lifetime bonus. Cheaper than 5× Personal codes for a full alliance.
- **+$5 Roster Extractor Premium:** Add-on that runs a second-pass Claude audit — guaranteed 94/94 row accuracy for alliances that can't afford a missed member.

Payments are one-time. No subscription. No auto-renewal.

### Q7. Can I get a refund?
Yes, within limits (from `terms.html`):
- **Within 24 hours of purchase, before you've redeemed the code:** full refund, no questions asked. Email hello@r5tools.io.
- **Code already redeemed:** no refund, except if we caused >48h continuous downtime of the tool you bought for.
- **Alliance disputes:** if your alliance disbands, we don't refund the R5 who bought — the code can be handed to a successor alliance.

We're a solo-dev shop. Ask honestly and we'll usually work with you.

### Q8. What's the Founding tier and why does it end?
The Founding tier is a permanent-lifetime deal for the **first 10 alliances** that buy in: $30 one-time (vs $50 for the regular Alliance Bundle) AND lifetime access to every new tool the suite ever ships. It exists because those first 10 R5s are validating that the suite is worth building further — their bet funds the next 6 months of development. Once 10 alliances claim it, the Founding tier closes at the visible pricing card level (`FIRST 10 ONLY` in the copy). The server has a larger safety cap of 100, but marketing framing is 10. Check the live counter on the pricing card.

### Q9. Can my alliance split the cost?
Yes — that's literally how Alliance Bundle ($50) and Alliance Founding ($30) work. **One R5 pays once, then shares the code with every member.** Each member enters that same code at [access-codes.r5tools.io](https://access-codes.r5tools.io/) and unlocks the full suite on their device for 90 days. Common patterns we've seen:
- R5 pays and expenses it to alliance funds.
- 5 officers split $50 evenly (~$10 each).
- The 4 top-power players chip in $10 apiece for a bundle.

You can also gift a Personal $10 code — Stripe checkout accepts a note.

---

## Referral & Affiliate

### Q10. How do I get my referral code?
Go to **[r5tools.io/refer.html](https://r5tools.io/refer.html)** and sign in with your email — we send a magic link (no password). Once you're in, you'll see your unique code (looks like `R5-YOURNAME-A7K3`) plus a shareable link. If you already unlocked with an anonymous access code, you still need to sign in with email to enter the referral program — that's how we credit your earnings to you specifically.

### Q11. When do I get paid?
Payouts are **manual** — Evan runs a CSV export weekly and PayPal or CashApp each referrer. **No minimums, no schedule games, no clawbacks.** You earn **25% of gross** on every paid unlock attributed to your link within a 30-day cookie window (first-touch attribution — first tagger wins). Self-referrals are blocked. Ledger is human-verifiable — email hello@r5tools.io and ask to see your rows. **[EVAN — decide]** Preferred payout method (PayPal only, CashApp only, or ask the referrer)? And is there a minimum payout amount before you cut a check, or truly zero?

### Q12. Can I promote r5tools on YouTube / TikTok / Twitch?
Yes — please do. Use your referral link (`r5tools.io?ref=R5-YOURNAME-XXXX`) in the description and viewers who buy in the next 30 days credit you 25%. Guidelines: (1) Don't claim r5tools is affiliated with First Fun / Last War: Survival — it's a fan-made tool. (2) Don't promise things we don't do (e.g. "guaranteed no ban" or "auto-plays for you" — we don't automate gameplay). (3) Screen recordings of the tools are fine; recording of the *game* itself is between you and First Fun's ToS. **[EVAN — decide]** Do you want to formalize a creator program (higher rev share for verified creators with >X subs)?

---

## KR / International

### Q13. 한국어 지원되나요? (Do you support Korean?)
네, 완전 지원됩니다. 저희는 **한국어를 1순위 언어**로 개발했습니다 (영어보다 우선). 모든 툴, 랜딩 페이지, PNG 내보내기까지 100% 한글화되어 있고, 워존 2007 한국어 사용자를 주요 사용자층으로 삼고 있습니다. RONY (아군 얼라이언스) R5가 무료 코드 `RONY-FREE`를 배포하고 있으니 R5에게 요청하세요. 카카오톡, 디스코드 어디서든 코드 공유 가능합니다. Full Korean-language FAQ is at [r5tools.io/ko/faq.html](https://r5tools.io/ko/faq.html) — everything Q1-Q20 answered in 한국어.

### Q14. Do you support other languages besides English and Korean?
Yes — **7 languages total from day one**: Korean (한국어) · English · Spanish (Español) · Portuguese (Português BR) · Japanese (日本語) · German (Deutsch) · French (Français). Toggle in the top-right of any page. Every tool, every button, every exported Discord PNG renders in your chosen language. Translations were done by native-speaker R5s where possible and Claude Sonnet 4.6 elsewhere with human review. If a translation reads wrong in your language, hit 💡 Send feedback — we fix it inside a few hours.

---

## Technical

### Q15. The tool is broken / not loading / gives me an error.
Three fast fixes to try first:
1. **Hard refresh:** Cmd+Shift+R (Mac) or Ctrl+F5 (Windows) — most "broken" reports are stale cached JS.
2. **Re-enter your code:** cookies expire at 90 days. Visit [access-codes.r5tools.io](https://access-codes.r5tools.io/) and re-enter.
3. **Try a different browser:** we test Chrome and Safari. Firefox usually works. Older Android + in-app browsers (Discord, Instagram) are hit-or-miss.

If it's still broken, hit the 💡 **Send feedback** button on any page — it forwards your report to Evan's Discord with the tool name, browser, and a reference ID. Urgent issues get flagged in red and Evan gets a `@here` ping. Status page is at [r5tools.io/status.html](https://r5tools.io/status.html).

### Q16. How do I import my roster?
Use the **Roster Extractor** at [roster.r5tools.io](https://roster.r5tools.io/). Three steps:
1. Open your alliance member list in the game. Start iOS or Android screen recording. Slowly scroll from R5 down to R1 (about 90 seconds for a 100-player alliance). Stop.
2. Upload the resulting `.mov` or `.mp4` at roster.r5tools.io.
3. Claude vision reads every row automatically. You get a CSV + JSON in about 2 minutes, cost to us is ~$0.45 in API calls.

The CSV feeds every other tool in the suite — no re-typing, no re-uploading. For alliances where every row must be perfect, add **Roster Extractor Premium (+$5)** which runs a second-pass audit for 94/94 accuracy.

### Q17. Can I use this on multiple devices?
Yes. The cookie is per-device — so if you unlock on your laptop AND your phone AND your tablet, you re-enter the same code on each and each device gets its own 90-day cookie. There's no seat limit enforced. Alliance Bundle / Founding codes are explicitly meant to be shared across the whole alliance's devices. Personal $10 codes are meant for one player but the code isn't locked to one device — we trust you. **[EVAN — decide]** Is there any per-device or per-account cap we want to enforce? Right now the codes.json has no device limit.

---

## Trust & Safety

### Q18. Is this affiliated with Last War: Survival or First Fun?
**No.** R5TOOLS.IO is a **fan-made, independent** tool suite. We are not affiliated with, endorsed by, or licensed by First Fun Group, Century Games, or *Last War: Survival*. Every trademark and game name belongs to their respective owners. We built these tools because we play the game and needed them — nothing more. If First Fun ever asks us to change something, we will. See `terms.html` for the full disclaimer.

### Q19. Will my account get banned for using this?
We can't guarantee zero risk (nobody honestly can), but we've designed the suite to stay safely on the right side of First Fun's ToS:
- **We do not automate any in-game action.** No auto-play, no auto-attack, no bot movement, no packet injection, no game-client modification.
- **We are import-only + planning tools.** You screen-record the game manually. We help you plan a landing, calculate coal burn, or lay out a hive on our side — you execute in-game manually.
- **We never touch your game account credentials.** We never ask for your login. We can't log in for you.

That said: LWS ToS forbids third-party tools that "provide unfair advantage." Planning tools like Google Sheets, coal-burn calculators, and hive-layout diagrams are ubiquitous in the LWS community and (to our knowledge) have not resulted in bans. We monitor this and will update if the ToS interpretation changes.

### Q20. How do you handle my data?
Short version (full policy at [r5tools.io/privacy.html](https://r5tools.io/privacy.html)):
- **Your roster CSV** is stored per an "alliance signature" (SHA-256 hash of R5 name + top 8 members), separate from your IP. **Never shared with other alliances. Never sold. Never used to train models.**
- **Discord webhook URLs** you paste for exports are stored under your access code — sibling tools auto-sync. Never exposed to other alliances.
- **Analytics** are aggregate + IP-masked (last octet zeroed). We use Plausible (cookieless) and optionally GA4 (`anonymize_ip: true, no ad-personalization`).
- **Third-party processors:** Stripe (payments), Anthropic (Claude API for KB Chat + Roster Extractor), Cloudflare (CDN + edge). That's it. No advertisers, no data brokers.
- **Right to delete:** email hello@r5tools.io with your access code — we wipe roster snapshots, webhooks, and support tickets within 7 days.
