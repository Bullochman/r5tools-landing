# r5tools.io Community Discord — Setup Playbook

This is the blueprint if Evan spins up **discord.gg/r5tools** as the home base for r5tools users. Not required — the outreach playbook in `discord-outreach.md` works without an owned Discord — but if you want a support/community hub that also doubles as a sales funnel, this is how to structure it.

**Vanity URL to reserve:** `discord.gg/r5tools` (requires Level 3 boost). Interim URL: whatever Discord assigns until boosts land.

**Server icon:** r5tools "R5" mark from `/screenshots/logo/` (create if missing).

**Server banner:** landing planner screenshot with alliance names blurred out.

---

## Channel structure

Organized into categories. Every channel has a clear one-line purpose in its topic — Discord users skim topics, not scroll history.

### 📌 START HERE (top category, everyone sees first)

- **#welcome** — auto-greet from bot, links to `#rules` and `#faq`. Topic: "New here? Read rules, then grab your role in #verify."
- **#rules** — 6-8 rules max, plain language. See "Rules" section below.
- **#announcements** — R5tools updates only, no member chat. Locked to Evan + moderator role.
- **#changelog** — auto-post from GitHub webhook on r5tools-landing repo commits. Silent (no @everyone).
- **#verify** — reactive role assignment. React with 🇰🇷 = Korean role, 🇺🇸 = English, 🇪🇸 = Spanish, etc. React with ⚔️ = R5 role (gates access to `#r5-lounge`), 🛡️ = R4/officer role, 🎯 = alliance member role.

### 🛠️ TOOL SUPPORT (biggest category by activity — this is why people join)

- **#tool-help** — general "how do I use X" questions. Volunteers + Evan reply here.
- **#landing-planner** — questions/feedback specific to landing planner.
- **#heat-freeze** — heat sim + freeze risk dashboard combined channel.
- **#coal-burn** — coal calc questions, blizzard prep discussions.
- **#roster-extractor** — OCR issues, CSV formatting, screen-record tips. This will be the highest-traffic channel — Unicode/name issues generate the most tickets.
- **#hive-grid** — hive planner + PNG export.
- **#city-capture** — capture scheduling, protection windows, 2-city cap.
- **#feature-requests** — new tool ideas. Use Discord's forum-channel type here so each request is its own thread. Add ✅ / ❌ / 🚧 reactions for triage.
- **#bug-reports** — forum channel. Template pinned: "What tool / what happened / what expected / screenshot / your warzone." Auto-tags: `open`, `investigating`, `fixed`, `wontfix`.

### 🏆 R5 LOUNGE (gated to ⚔️ R5 role)

- **#r5-general** — R5-only strategy chat. No promo, no tool spam.
- **#r5-coordination** — cross-warzone R5 introductions, CSW planning, alliance mergers.
- **#founding-alliance-perks** — private channel for the first 10 Founding Tier alliances. Early features, direct Evan access, roadmap voting.

### 🌍 LANGUAGE CHANNELS (auto-visible based on flag reaction in #verify)

- **#korean-한국어**
- **#español**
- **#português**
- **#japanese-日本語**
- **#deutsch**
- **#français**

Each language channel is a general-chat + tool-help combined channel. Don't over-split by language — audience isn't big enough yet to justify per-tool per-language channels.

### 🎮 WARZONE COORDINATION

- **#warzone-2007** — RONY / TINO home base. Landing coords, hive layouts, weekly plans.
- **#other-warzones** — general channel until a specific warzone reaches ~20 members, then split.
- **#looking-for-alliance** — LFA + LFR posts. 1 post per user per week rate limit (Carl-bot).
- **#alliance-recruitment** — inverse of above. R5s post recruitment blurbs. Same rate limit.

### 🗣️ COMMUNITY

- **#general** — casual chat, memes, screenshots. Only channel with @everyone-pings allowed for members.
- **#screenshots-and-clips** — image/video-only channel. Auto-delete text posts (Dyno rule).
- **#off-topic** — non-LWS chatter. Prevents general from getting cluttered.

### 🔐 STAFF-ONLY

- **#mod-log** — auto-log from Dyno / Carl-bot for all mod actions.
- **#staff-general** — private mod chat.
- **#stripe-events** — webhook from Stripe for new Founding Tier / Personal Tier purchases. Silent alert. Let Evan DM new customers within 1 hour.

---

## Roles

- **@Founder** — Evan only. Red color.
- **@Moderator** — appointed volunteers. Green. Full mod perms except server settings.
- **@Support** — power-users who help in tool channels but aren't mods. Blue. Can only manage messages in tool channels.
- **@Founding Alliance R5** — one per each of the first 10 Founding Tier alliances. Gold. Access to `#founding-alliance-perks`.
- **@R5** — verified R5s. Access to `#r5-lounge`. Verification = post a screenshot of your R5 title in `#verify`.
- **@R4 / Officer** — verified R4s. Purple. Access to `#r5-coordination` read-only.
- **@Member** — everyone else after they hit ✅ in `#verify`. Default color.
- **@Bot** — bots. Bottom of hierarchy.

Language roles (Korean / English / etc.) are separate from rank roles and are auto-assigned via reaction in `#verify`.

---

## Welcome message

Bot posts this in `#welcome` when a new member joins. Also DMs a copy so mobile users see it.

```
Welcome to r5tools.io — [username]!

r5tools is a suite of alliance-planning tools for Last War: Survival, built by an
active R5 (RONY, WZ 2007). Landing planner, heat sim, coal calc, roster extractor,
freeze risk dashboard, city capture planner, season timeline, hive grid manager.

Free code: RONY-FREE — paste it at r5tools.io and everything unlocks. No card, no
email. Works on any warzone.

Three quick steps:
  1. Read #rules (30 seconds, 6 rules)
  2. React in #verify to pick your language + rank (unlocks channels)
  3. Post a hello in #general or dive straight into #tool-help

Founding Alliance Tier is $30 flat for your whole alliance forever — first 10
alliances only, then it goes to $50. If you're an R5, check #founding-alliance-perks
after you verify.

I'm Evan (the founder). DM me anytime — I answer everything.
```

**Korean version** (auto-DM'd when a member picks 🇰🇷 in #verify):

```
r5tools.io 에 오신 것을 환영합니다 — [username]님!

r5tools는 라스트 워: 서바이벌 얼라이언스 계획 도구 모음입니다. 현역 R5 (WZ 2007
RONY)가 만들었습니다. 랜딩 플래너, 히트 시뮬레이터, 석탄 소모 계산기, 로스터
익스트랙터, 동결 위험 대시보드, 도시 점령 플래너, 시즌 타임라인, 하이브 그리드
매니저.

무료 코드: RONY-FREE — r5tools.io 에 붙여넣으시면 전부 열립니다. 카드 불필요,
이메일 불필요. 어느 워존이든 됩니다.

세 단계:
  1. #rules 읽기 (30초, 6개 규칙)
  2. #verify 에서 이모지 반응으로 언어 + 랭크 선택 (채널 열림)
  3. #general 이나 #korean-한국어 에서 인사 하시거나 #tool-help 바로 이용

얼라이언스 창립 티어는 $30 얼라이언스 평생, 첫 10개 얼라이언스만 — 이후 $50입니다.
R5이시면 verify 후 #founding-alliance-perks 확인하세요.

만든 사람은 Evan(에반)입니다. DM 언제든 주세요 — 전부 답장드립니다.
```

---

## Verification flow

Simple three-step, no bot forms — react in `#verify` and Carl-bot auto-assigns.

**Level 1 — Language** (required to see language channels):
> React with your language: 🇺🇸 English · 🇰🇷 한국어 · 🇪🇸 Español · 🇧🇷 Português · 🇯🇵 日本語 · 🇩🇪 Deutsch · 🇫🇷 Français
> You can pick more than one.

**Level 2 — Rank** (required to see role-gated channels):
> React with your alliance rank: ⚔️ R5 · 🛡️ R4/Officer · 🎯 R3+/Member · 👁️ Just here to look

R5 verification is trust-based initially. Later, add a `#r5-proof` channel where R5s DM a screenshot to a mod to get the R5 role manually. Prevents randoms claiming R5 status to access private R5 discussions.

**Level 3 — Warzone** (optional, unlocks warzone channels):
> Type `/warzone 2007` (or your warzone number). Bot auto-assigns @WZ-2007 role and grants access to `#warzone-2007`.

---

## Rules (post in #rules)

1. **Be an R5-to-R5.** Direct, helpful, not sales-y. Same voice we use in-game with allies.
2. **English or your flag'd language channel.** #general defaults to English; use language channels for your language.
3. **No competitor tool spam.** You can mention alternatives when helping someone (LW Spy for map scanning, Cpt Hedgehog for server info, AMP for alliance management). Don't drop invite links to competing Discords.
4. **No selling your alliance / warzone / recruitment outside #looking-for-alliance and #alliance-recruitment.** One post per week per user.
5. **No leaked in-game exploits, no account sharing, no boosting services.** First Fun's ToS applies — don't put r5tools at risk.
6. **No harassment, no doxing, no NSFW.** Standard Discord ToS.

Consequences: warn → mute 24h → mute 7d → ban. Ban is final unless appealed via DM to Evan.

---

## Bot stack recommendation

**MEE6** — skip it. Free tier is too limited for verification + leveling and the paid tier isn't worth it at our scale. If we ever want leveling ranks (@Bronze/Silver/Gold based on message count) revisit later.

**Carl-bot** — **primary bot.** Handles: reaction roles (verification), autoresponder for FAQ triggers, tags for canned FAQ responses, per-channel slowmode, custom !commands for tool links. Free tier covers everything we need.

**Dyno** — **secondary bot for moderation.** Better mod tools than Carl-bot: auto-mod (spam, invite links, mass-mentions), custom auto-purge in screenshot channels (delete text-only messages), music module if we ever want voice-channel background music during community events.

**Ticket Tool** — for `#bug-reports` and `#feature-requests`, use Discord's native **forum channels** instead of a ticket bot. Native forums have better search + tagging and don't require a third-party bot.

**Statbot or Server Stats** — track member growth + channel activity. Free tier is fine. Useful for the Ops Center dashboard.

**Custom r5tools bot** — see `discord-bot-spec.md` for the slash-command bot that talks to r5tools.io's API. That's a separate build and should live in **its own** Discord app (so other alliances can add it to their servers without adding our whole community bot stack).

**Do NOT add:** Groovy/Rythm (dead), Hydra (dead), MEE6 paid, any bot that requires paying to unlock basic verification/leveling.

---

## FAQ (pin in #faq, also auto-respondable via Carl-bot triggers)

**Q: What does the free code unlock?**
A: `RONY-FREE` unlocks all 11 tools with full functionality. The paid tiers only add historical roster tracking (line charts over time) and Discord PNG exports for the paid Roster Extractor features.

**Q: Do I need to make an account?**
A: Nope. Free tier stores everything in your browser (localStorage + IndexedDB). If you want to sync across devices, that's the paid tier — magic-link email login, no password.

**Q: Is my roster data shared with other alliances?**
A: No. Roster data lives in your local browser storage (or on your device if you use the export). Nothing goes to a shared database. Backup JSON export is available anytime.

**Q: What warzones does r5tools work on?**
A: All of them. `RONY-FREE` is the "WZ 2007 native" code but it works everywhere. City Capture Planner and Season Timeline are calibrated for standard Season 2 (Polar Storm); Season 3 (Golden Kingdom) tools are in beta.

**Q: I got a bug — where do I report it?**
A: Post in `#bug-reports` with: tool name / what happened / what you expected / screenshot / your warzone. Response within 24h, fix within 48h for anything blocking core workflow.

**Q: Is this affiliated with First Fun / official?**
A: No. r5tools.io is an independent tool built by an active R5 (Evan, RONY, WZ 2007). Not endorsed by First Fun. Complies with their ToS — no game-client automation, no map scraping, no account access.

**Q: Founding Alliance Tier — how do I know if slots are still open?**
A: `#founding-alliance-perks` topic shows the current count (e.g. "3/10 slots claimed"). Once 10 alliances are in, the tier price goes to $50 and the perks (early features, direct Evan access) stay grandfathered for the founding 10.

**Q: Can I refund the Founding Tier?**
A: Yes, within 14 days of purchase, full refund via Stripe. After 14 days, only if the tool stops working (which it won't). DM Evan.

**Q: What languages does r5tools support?**
A: 한국어 / English / Español / Português / 日本語 / Deutsch / Français. Native localization, not machine translation. If you spot a translation issue, DM Evan and it's fixed same day.

**Q: What's the difference between Roster Extractor free and paid?**
A: Free: OCR your alliance list screen recording, output as CSV. Paid: historical power tracking (line charts over time), Discord PNG exports, Premium OCR review pass for edge-case screenshots (rare fonts, odd resolutions).

**Q: Can I self-host r5tools?**
A: Not open-source (yet). The tools are hosted at r5tools.io. If you're building on top and want API access, DM Evan — the Founding Tier will get first API access when we open it up.

**Q: I'm an R5 — how do I get the R5 role?**
A: Post an in-game screenshot showing your R5 title to a mod via DM. We grant the role manually. Prevents randoms claiming R5 access to `#r5-lounge`.

**Q: I want to add r5tools slash commands to my alliance's Discord — is there a bot?**
A: In progress. See `discord-bot-spec.md` for the roadmap. Founding Tier alliances get early access when it launches.

---

## Launch checklist (when Evan flips this Discord live)

- [ ] Server created, icon + banner uploaded, channels + roles configured per above.
- [ ] Carl-bot + Dyno invited, verification reaction messages posted in `#verify`.
- [ ] Welcome message + rules + FAQ posted and pinned.
- [ ] `#announcements` seeded with 3 posts: server launch, first tool tutorial, Founding Tier open slots.
- [ ] `#changelog` webhook wired to GitHub `r5tools-landing` repo.
- [ ] Stripe webhook wired to `#stripe-events` (silent).
- [ ] Vanity URL reserved (once 14 boosts land — Founding alliance R5s asked to boost).
- [ ] Invite link generated (permanent, no member cap): use in `discord-outreach.md` and all launch posts.
- [ ] First 5 tool tutorials posted (one per channel: landing, heat, coal, roster, hive).
- [ ] Evan online in `#tool-help` and `#general` for the first 48 hours minimum.
- [ ] Founding-tier R5s DM'd with private-channel invite and thank-you.
