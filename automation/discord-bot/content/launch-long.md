---
id: launch-long
lang: en
channel_type: announcement
source: discord/launch-posts.md
---

**Title: Built a planning tool suite for our warzone — free for any alliance, R5s and officers welcome to poke holes**

Hey — Evan, R5 of RONY in Warzone 2007. Not a studio, not a marketing team, just an R5 who spent the night before Season 2 Polar Storm launch running six spreadsheets to place 94 members around our Alliance Furnace and thought "why am I doing this manually in 2026." So I built one. Then another. Then eight. Opening them all up to any alliance today because a bunch of neighbor R5s in WZ 2007 asked for access.

**What the tools actually do.** The **Landing Planner** takes your roster (from the Roster Extractor or a manual paste), sorts by rank + title, and places R5 + titled R4 in ring 1 around AF, untitled R4 in ring 2, key R3 supporters in ring 3, and everyone else in outer rings. Warns you if Ministry seats aren't filled (that's a common landing-day mistake — you get to the map and realize nobody has Warlord title). The **Heat Sim** overlays a blizzard path on your alliance grid and highlights cells that drop below the −70°C freeze threshold — you can shift HHF placements before the blizzard hits, not after. The **Coal Burn Calculator** does the HHF overdrive math a lot of R5s get wrong: HHF L30 normal burn is ~240 coal/min, overdrive is ~4× that, and 50-member alliances hitting overdrive together during a Week-4 severe blizzard drain ~8.6M coal in three hours. That number surprises most R5s the first time they see it. The **City Capture Planner** respects the 2-cities-per-day cap and 36-hour protection window so you can plan an entire capture week without accidentally re-attacking a protected city. The **Roster Extractor** OCRs a screen recording of your alliance member list and outputs a clean CSV in ~30 seconds — handles Unicode names correctly (Korean, Japanese, special-character alliance tags all work), dedupes members whose names contain Ð / ø / Đ / other lookalike glyphs.

**Free tier is real.** Landing Planner, Heat Sim, Coal Burn Calc, City Capture Planner, Season Timeline, and the Hive Grid Manager all work with no code, no email, no account. Roster Extractor free tier extracts to CSV; the paid tier adds historical tracking (line charts of your alliance's power over time) and Discord PNG exports. Warzone 2007 alliances get the paid features free with code `RONY-FREE` because you're neighbors. Any alliance on any warzone can use `RONY-FREE` for the launch window — I'll keep it live as long as it makes sense. **Alliance Founding tier is $30 flat for the whole alliance, forever, first 10 alliances only** — then it goes to $50. Personal-use tier is $10 for one R5's account.

**Language support.** Built Korean-first because WZ 2007 is KR-heavy and I got tired of watching KR R5s copy-paste English tools through Papago. Full native localization in **한국어 / English / Español / Português / 日本語 / Deutsch / Français** — top-right language dropdown, UI + all game terms in native language. No auto-translate garbage — every string was reviewed by native speakers in the relevant warzones. If you catch a translation issue, DM me and it gets fixed same day.

**What r5tools is NOT.** It's not a map scanner. It's not a bot that logs into your game account. It doesn't scrape enemy alliance rosters. It doesn't post anything to your Discord without you clicking "download PNG" and pasting it yourself. Roster data is stored in local SQLite on your device — you can back up to JSON and delete anytime. No account creation for free tier. Only reason I'd ever ask for an email is the Alliance Founding tier magic-link login, and even that's optional if you want to just use the code-based free tier forever.

**Link + one ask.** **r5tools.io** — try the tools right now, takes 30 seconds with `RONY-FREE`. If you're an R5 and it saves you time, tell one other R5. If it breaks, ping me in this thread or DM — I'm the one fixing bugs, no support-ticket runaround. Good hunting.

— Evan / R5 RONY / WZ 2007
