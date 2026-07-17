# How to Find R5s in Other Warzones — Playbook

Peer R5-to-R5 outreach is the highest-converting channel we have. But you can't DM an R5 you can't identify. This playbook walks through the four channels where R5 identities surface publicly.

**Time budget:** ~15 min per warzone. Goal: leave every row in `warzone-tracking.csv` with a real R5 name and a channel to reach them.

---

## 1. Official LWS Discord — warzone channels

**URL:** https://discord.gg/lastwarsurvival (or the current official invite)

**Where R5s show up:**
- `#server-recruitment` / `#alliance-recruitment` — R5s post looking for members
- `#warzone-<XXXX>` regional channels — R5s coordinate cross-alliance events
- `#cross-server-war` — R5s trash-talk opponents mid-CSW (goldmine for identifying enemy R5s)
- `#leadership-lounge` if you can get in — R4+ only in some servers

**Extraction method:**
1. Search each `#warzone-2XXX` channel for messages tagged `[R5]`, `R5 of`, or the crown emoji
2. Scroll back 30 days; longer-tenured R5s are more likely to still be active
3. Right-click username → Copy User ID for DM
4. Note their **timezone** from message timestamps (helps time your DM)

**Signal quality:** High. Anyone declaring themselves R5 in a public channel is real.

---

## 2. Cross-Server War interactions (in-game)

**When:** After every CSW (Wednesdays + Saturdays in current-season warzones)

**Where R5s show up:**
- **Killfeed** — every rally kill logs the rally leader; if they're R5, their name appears with the crown icon
- **Enemy alliance roster** — after CSW, you can view opposing alliances' member lists in the war UI
- **Mail** — R5s of losing/winning alliances often send diplomatic mail post-war

**Extraction method:**
1. Screen-record the enemy alliance roster during CSW war window
2. Feed video to **Roster Extractor** (`roster.r5tools.io`) — outputs R5 name at top of every extracted alliance
3. In-game mail their R5 directly (highest response rate — they already know your name from the war)
4. Log: `warzone_id`, `r5_name`, `contact_channel=in-game-mail`

**Signal quality:** Highest. You just fought them — they'll open your mail.

---

## 3. YouTube LWS creators — comments + community tab

**Top LWS YouTubers as of 2026-07:**
- ChoBu2 (KR, ~180k subs)
- Sanko Gaming (EN, ~90k)
- ChiefWildBeard (EN, ~60k)
- LWS Playbook (EN, ~40k)
- LastWar TV (multi-lang, ~120k)

**Where R5s show up:**
- Comment sections of hero-tier / meta / CSW breakdown videos
- Community tab polls ("which alliance is strongest?")
- Live-stream chat during weekend war streams
- Video titles like "How [ALLIANCE X] Won WZ 2015" — the alliance name is right there

**Extraction method:**
1. Filter comments by "Top" (surfaces long-form R5 discussions)
2. Look for commenters with warzone tags in their username (e.g. "Kaladin - R5 WZ 2019")
3. Click username → check their About tab for Discord / email / other contact
4. Reply to their comment publicly with a short hook: "Hey, R5 of RONY WZ 2007 — DM me if you want a landing planner for free"

**Signal quality:** Medium. YouTube comments skew toward whales and enthusiasts, so R5s who comment tend to be spendy.

---

## 4. Reddit + Naver café

**Reddit:**
- r/LastWarSurvival — R5s post "State of my alliance" threads occasionally
- r/LastWarSurvivalTop — smaller, more R5-heavy
- Search filters: `flair:R5`, `flair:Alliance Leader`, or full-text "R5 of"

**Naver café (KR only):**
- 라스트워: 서바이벌 café — the main KR community
- 얼라이언스 자유게시판 board — R5s post alliance updates
- 워존별 게시판 (some warzones have dedicated sub-boards)

**Extraction method:**
1. Reddit: `site:reddit.com/r/LastWarSurvival "R5" "WZ 2XXX"` in Google
2. Naver: Search 워존 [number] + R5 in café search
3. DM via Reddit inbox / Naver 쪽지
4. Log the channel as `reddit` or `naver-café`

**Signal quality:** Medium-high. R5s who post on forums tend to be engaged operators (our ICP).

---

## 5. In-game — "Server Ranking" screen

**Where:** Warzone map → menu → Alliance Ranking

**What you see:** Top 20 alliances in every warzone with R5 names. Requires a scout account in that warzone (or ask a friend in that WZ to send screenshots).

**Extraction method:**
1. Ask allies who've migrated in from other warzones for old screenshots
2. Post-CSW, you can sometimes see enemy warzone rankings during the war UI
3. Log every visible R5 into the tracking CSV

**Signal quality:** Perfect. You literally see the R5 name in-game.

---

## Cadence

- **Week 1:** Fill in 10 warzones (2001-2010) using Discord + YouTube
- **Week 2:** Fill in 10 more (2011-2020) using Reddit + Naver
- **Week 3:** Send 5 DMs per day (Template 1/2/4) with personalization
- **Ongoing:** Every CSW your alliance fights, log the enemy R5 into the CSV within 24h

## Response tracking

Update `warzone-tracking.csv` `response` column with one of:
- `no-reply` — DM read, no answer after 5 days
- `not-interested` — explicit no
- `interested-free` — took the free code, no purchase
- `interested-personal` — bought $10 Personal tier
- `interested-founding` — bought $30 Founding tier
- `future-followup` — asked to be pinged later (log a date in `notes`)

## Kill criteria

Stop DMing a warzone if:
- 5 sequential R5s reply "not-interested"
- The warzone is a known dead server (population <30% of full)
- Language barrier is total and you can't find a translator
