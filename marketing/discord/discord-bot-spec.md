# r5tools Discord Bot — Product Spec

A slash-command Discord bot that other alliances install in their own Discord servers. Each command hits r5tools.io's API and returns results in-server so R5s / officers don't need to leave Discord to check coal budgets, freeze risk, heat coverage, or roster deltas.

**Product wedge:** the bot is the distribution vehicle. R5s who install it in their alliance Discord expose the r5tools brand to every R4/R3/member in that alliance — organically, without a marketing post. Every `/coalcheck` a member runs is a passive impression. That's how we go from "R5s bought a tool" to "everyone in the alliance knows about r5tools."

---

## TL;DR — build now or later?

**Build later.** Specifically: **after we have 100 paying alliances** on the Founding Tier (i.e. after the Founding-10 slots close AND the $50 tier sells another 90). Reasoning:

1. **Founding Tier revenue funds the bot** — 100 alliances × ~$40 avg ($30 for founding-10, $50 for the next 90) = ~$4,800. That covers ~40-60 hours of bot dev time plus hosting.
2. **Product-market fit validation** — 100 alliances is enough signal that the tool suite is worth extending into a bot. Building the bot at 5 alliances is premature.
3. **API surface needs hardening first** — r5tools.io's current API is optimized for the web UI (browser-based auth, cookie sessions, PII on client). Bot access needs machine-to-machine auth (per-alliance API keys), rate limiting per Discord guild, and idempotent endpoints. Estimated ~15 hours of API refactoring **before** the bot even starts.
4. **Discord ecosystem risk** — Discord has been tightening verification requirements for public bots (100+ server → mandatory verification, requires ID upload). Best to hit that with a mature product, not a beta.

**What to do NOW instead of building the bot:**
- **Manual embed generator** — a page at `r5tools.io/embed/coal?alliance=X` that renders a shareable embed image. R5s copy-paste the URL into their Discord and it auto-unfurls to a rich preview. Zero bot infrastructure. Covers 80% of the bot's value at <5% of the build cost.
- **Webhook drop endpoint** — POST `r5tools.io/api/discord/webhook` with an alliance ID + tool result, we generate the Discord webhook message payload for you to run. Easier trust boundary than a full bot.
- **Zapier / Make.com recipes** — publish 3-4 recipes showing how to wire r5tools export → Zapier → Discord webhook. Ships value tomorrow with no code.

Build the real bot at 100 paying alliances. Everything below is the spec for **when** we build it — pin this doc, revisit at the 100-alliance milestone.

---

## Language: discord.js vs discord.py

**Recommendation: discord.js (TypeScript).**

Reasoning:
- **Existing r5tools stack is JS/TS-heavy** — the landing site, the tools, the API layer. Sharing code (validation schemas, type definitions, error handling patterns) between the bot and the API cuts dev time in half.
- **Slash command tooling is more mature on discord.js** — the discord-api-types package + slash-create + @discordjs/builders is the current standard. Python has py-cord and discord.py + app_commands but the type safety is weaker.
- **Deployment parity** — same Node runtime, same Docker image pattern as the r5tools API. One less thing to operate.
- **Hosting simpler** — deploy to Lightsail alongside the r5tools API (same box as the MdR voice agent per Evan's setup) with pm2 or systemd. Or serverless via Cloudflare Workers with `discord-interactions` for pure slash-command interactions (HTTP-only bot, no persistent gateway).

**Skip discord.py** unless we hire a Python-heavy engineer. The 2022 discord.py drama + rebirth added maintenance uncertainty; py-cord is fine but doesn't offer anything discord.js doesn't.

---

## Architecture sketch

```
┌─────────────────┐
│  Discord Guild  │  (alliance's own server, bot installed)
└────────┬────────┘
         │  slash command (/coalcheck L30 members=50 event=severe)
         ▼
┌─────────────────────────────────────┐
│  Discord Interactions HTTP Endpoint  │  (Cloudflare Worker OR Node/Express)
│  - verify signature (ed25519)        │
│  - route command                     │
│  - defer if >3s expected             │
└────────┬────────────────────────────┘
         │  authenticated call w/ per-guild API key
         ▼
┌─────────────────────────────────┐
│  r5tools.io API                 │  (existing Node service)
│  - /api/v1/coal/calculate       │
│  - /api/v1/heat/simulate        │
│  - /api/v1/freeze/risk          │
│  - /api/v1/roster/{alliance}    │
│  - rate-limit: 60 req/min/guild │
└────────┬────────────────────────┘
         │  result JSON
         ▼
┌─────────────────────────────────┐
│  Response formatter             │
│  - build Discord Embed          │
│  - localize (from guild locale) │
│  - attach PNG chart (canvas)    │
└────────┬────────────────────────┘
         │  followUp() to Discord webhook
         ▼
     Guild channel (bot posts result)
```

**Auth model:**
- Bot installed → OAuth2 flow → alliance R5 pastes their r5tools.io "Founding Tier" API key OR clicks "sign in with Discord" to link their r5tools account. Persistent guild → r5tools-account mapping stored in bot DB (Postgres, small).
- Slash command → HMAC-signed request from bot → r5tools API with `X-r5tools-Guild-ID` header. API resolves guild → alliance → user, applies rate limits, returns data.
- **No PII stored on bot** — only guild ID ↔ alliance ID mapping. Actual roster data stays in r5tools.io's DB.

**Hosting:**
- Interaction endpoint: Cloudflare Workers (free tier handles 100k requests/day easily, ~$5/mo at scale).
- API: existing r5tools.io stack, Lightsail (already provisioned per Evan's setup for MdR voice agent + financials dashboard).
- Bot DB: Postgres on Lightsail, or Neon serverless Postgres (free tier fine at launch).

---

## Slash commands

### `/coalcheck`

**Purpose:** Calculate coal burn for a blizzard event and check if the alliance's stockpile is enough.

**Options:**
- `hhf_level` (integer, required) — HHF level of the alliance's typical member. Default: 30.
- `members` (integer, required) — active members in the alliance. Default: pulled from linked roster if available.
- `event` (choice, required) — `mild` / `moderate` / `severe` / `extreme`. Maps to blizzard severity tiers.
- `duration_hours` (integer, optional) — overdrive duration. Default: 3.

**Response embed:**
```
📊 Coal Burn Estimate — [Alliance Name]
Event: Severe blizzard (3-hour overdrive)
Members: 50 · HHF L30

Per-member burn:        173,000 coal
Alliance-wide (HHF):    8,650,000 coal
AF overdrive:             173,000 coal
────────────────────────────────────
Total burn:             8,823,000 coal

Your reserve:          12,400,000 coal (linked)
Status: ✅ Safe (72h buffer)

Full breakdown: r5tools.io/coal?guild=[guild_id]
```

If reserve isn't linked (bot has no roster access): shows just the burn estimate, no status line.

### `/heatcheck`

**Purpose:** Check heat coverage and freeze-risk cells for the alliance's current hive layout.

**Options:**
- `blizzard_temp` (integer, optional) — expected blizzard low, °C. Default: -50.
- `ambient_temp` (integer, optional) — current ambient. Default: -30.
- `layout` (string, optional) — layout name from linked r5tools account. Default: most recent saved.

**Response:**
- Embed with alliance-heat-coverage summary: X of Y members inside AF radius, Z members below freeze threshold.
- Attached PNG (rendered by API via Sharp/Canvas) showing the hive grid with risk cells highlighted red.
- Link to full interactive view on r5tools.io.

### `/freezealert`

**Purpose:** Subscribe the guild's channel to auto-alerts when a blizzard event is predicted to freeze-risk any linked member.

**Options:**
- `subscribe` (boolean, required) — true to enable, false to disable.
- `threshold` (choice, optional) — `any_risk` / `high_risk` / `critical_only`. Default: `high_risk`.
- `channel` (channel, optional) — target channel. Default: current channel.

**Behavior:**
- On subscribe, bot registers a webhook subscription with r5tools API.
- Whenever the alliance's freeze-risk score crosses threshold (based on blizzard forecast + linked roster), r5tools API POSTs to the bot's webhook, which posts an alert to the subscribed channel.
- Auto-mentions R5 role if configured (via `/freezealert mention role:@R5`).

### `/roster`

**Purpose:** Query the linked alliance roster — power, rank, freeze-eligibility flag, or a specific member's stats.

**Subcommands:**
- `/roster power` — total alliance power + top 10 members.
- `/roster deltas` — power changes since last snapshot (24h / 7d / 30d).
- `/roster member <name>` — one member's stats.
- `/roster refresh` — trigger a fresh Roster Extractor run (requires linked account + attaches a screen recording upload).
- `/roster export` — DMs the requesting user a CSV export.

**Rate limit:** 6 roster queries/minute/guild to prevent misuse.

### `/tools`

**Purpose:** Meta-command listing all bot commands + linking to r5tools.io.

Also serves as the "onboarding" command — new bot installs post `/tools` and the response includes the setup checklist.

### `/link` (setup command)

**Purpose:** Link the guild to an r5tools alliance account. Runs the OAuth flow.

Only R5 role in the guild can run this (or the user who installed the bot, if no R5 role exists).

---

## What we're NOT building in v1

- **Voice channel integration** — no music, no voice notifications. Text/embed only.
- **Message-content-based commands** — Discord requires a Message Content Intent for reading channel text, which requires verification. Slash commands only.
- **Cross-alliance leaderboards** — privacy nightmare, save for v2 with explicit opt-in.
- **Automated alliance recruitment / auto-scanning enemy alliances** — reputational risk, sits too close to First Fun's ToS red line.
- **PII storage on the bot** — bot stores guild ID + r5tools alliance ID mapping only. Everything else queries live from r5tools API.

---

## Estimated build time

Assuming discord.js + TypeScript + Cloudflare Workers for interactions + existing r5tools API extended:

| Milestone | Est. hours | Notes |
|---|---|---|
| API refactoring (auth, per-guild keys, rate limits) | 15h | Prereq — must land before bot dev starts |
| Discord app registration + slash command scaffolding | 4h | discord.js + slash-create boilerplate |
| `/coalcheck` (simplest command, proves the pattern) | 8h | Includes embed formatter + localization |
| `/heatcheck` + PNG chart rendering | 12h | Canvas/Sharp for chart, S3 for temp storage |
| `/freezealert` (webhook subscription + alert delivery) | 10h | Most complex — bidirectional webhooks |
| `/roster` (all subcommands) | 12h | Depends on roster API + rate limiting |
| `/tools` + `/link` (setup + meta) | 5h | OAuth flow, guild-to-alliance mapping |
| Localization (7 languages, embed templates only) | 6h | Reuse existing i18n dictionary from web |
| Testing (each command × 3 languages × edge cases) | 10h | Discord testing sucks; add buffer |
| Docs + install page (`r5tools.io/discord`) | 4h | Includes invite link, permissions rationale |
| Verified-bot application (Discord verification) | 3h (Evan's time, mostly waiting) | Required at 100 servers |
| **TOTAL** | **~89 hours** | Roughly 2-3 weeks solo dev, or 1 week with dedicated focus |

Add ~20% buffer for Discord API quirks (rate limits, deferred interactions, webhook signature edge cases). Call it **~110 hours** end-to-end from spec to shipped-to-public.

**Cost to run at scale:**
- Cloudflare Workers: $5/mo up to a few million requests
- Postgres (Neon or Lightsail): $0-20/mo
- r5tools API scaling: negligible at 100 alliances, review at 500+
- Discord Verified Bot: free but requires ID upload + business info

---

## Success metrics

Post-launch KPIs (measured monthly):

1. **Install count** — target 30+ guilds in first month post-launch (assumes 100 paying alliances is the launch trigger).
2. **Daily active guilds** — guilds where at least 1 slash command was run in last 24h. Target 40% DAU/MAU.
3. **Commands per guild per day** — median. Target 3+ commands/day/guild (means bot is embedded in daily workflow, not a novelty).
4. **Alliance conversions attributed to bot** — R5s who joined an alliance where bot was installed → later bought r5tools Founding Tier for their new alliance. Track via UTM in bot embed links.
5. **`/freezealert` subscription rate** — % of guilds that enable freeze alerts. Higher = stickier. Target 25%+.

If DAU/MAU is <20% after 3 months, deprecate the bot and refund the compute — the manual embed generator + Zapier recipes are sufficient for the segment that wanted this.

---

## Rollout plan (when we hit the 100-alliance trigger)

1. **Week 0** — API refactoring lands, bot repo scaffolded.
2. **Week 1-2** — build `/coalcheck` + `/heatcheck` + `/link`. Internal testing in r5tools community Discord (per `community-server-setup.md`).
3. **Week 3** — beta rollout to Founding-10 alliances only. Two-week bake period; iterate on their feedback.
4. **Week 5** — public launch. Announcement in r5tools community `#announcements`, Reddit post to r/LastWarSurvival, DM to every Founding Tier + Personal Tier user.
5. **Week 6-8** — verified-bot application (required once we hit 75+ guilds; Discord verification takes 2-4 weeks).
6. **Month 3+** — v2 features (voice/text notifications, cross-guild leaderboards with opt-in, custom alert triggers).
