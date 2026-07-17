# Attribution Codes & Tracking

Every unique per-recipient code + shared channel code created across the marketing docs. Redemption analytics land at `/api/stats` per `youtube-outreach.md` line 15. Recommend also layering UTMs on URL shares for channels without per-recipient codes.

## Per-Hunter Lifetime Codes (ProductHunt)

| Recipient | Code | Channel |
|---|---|---|
| Chris Messina | `CHRIS-MESSINA-LIFETIME` | Twitter DM / PH profile |
| Kevin William David | `KWDINC-LIFETIME` | Twitter DM |
| Rich Manalang | `MANALANG-LIFETIME` | Twitter DM |
| Ben Tossell | `BENTOSSELL-LIFETIME` | Twitter DM |
| Fabrizio Rinaldi | `LINUZ90-LIFETIME` | Twitter DM |

## Per-YouTube-Creator Lifetime Codes

| Recipient / Channel | Code | Language |
|---|---|---|
| Cpt Hedgehog / Warzone Wrecking Crew | `HEDGE-WWC-R5T-LIFETIME` | EN |
| Last War Tutorial | `LWT-TUTORIAL-R5T-LIFETIME` | EN |
| Mikie's Productions | `MIKIE-PROD-R5T-LIFETIME` | EN |
| Wardawgg | `WARDAWGG-R5T-LIFETIME` | EN |
| Survivor Mike | `SURVMIKE-R5T-LIFETIME` | EN |
| FaZoL | `FAZOL-R5T-LIFETIME` | EN/RU |
| Last War Survival Game Tips | `LWSGAMETIPS-R5T-LIFETIME` | EN |
| Bacon's Guide to Last Z | `BEGINNER-R5T-LIFETIME` | EN |
| Last War Server 3 | `SERVER3-R5T-LIFETIME` | EN |
| Druzhba | `DRUZHBA-R5T-LIFETIME` | RU/EN |
| Last War Espanol (Serie Completa) | `ESPANOL-R5T-LIFETIME` | ES |
| Frontline Breakthrough 3180 creator | `FLBREAK-R5T-LIFETIME` | EN |
| Sunday FLB weekly runs creator | `SUNDAYFLB-R5T-LIFETIME` | EN |
| S6 Cities Destruction creator | `S6CITY-R5T-LIFETIME` | EN |
| Fatal Mistakes S6 creator | `FATAL-S6-R5T-LIFETIME` | EN |
| KR playlist channel | `LWS-KR-PLAYLIST-LIFETIME` | KO |
| KR Jaryo | `KR-JARYO-R5T-LIFETIME` | KO |
| KR FLB shorts creator | `SHORTS-CJD-R5T-LIFETIME` | KO |
| Cities Distortion S6 (KR) | `CITIES-S6-R5T-LIFETIME` | KO/EN |
| Warlord Missile S2 short creator | `WARLORD-S2-R5T-LIFETIME` | EN |

All YouTube codes pre-loaded into `LWS_Access_Codes/codes.json` as tier `personal_lifetime` with `attribution:youtube-outreach-2026-07` per `youtube-outreach.md` line 16.

**Rotate any leaked code** — reissue with a `-V2` suffix and update the recipient's row.
**If a creator replies, stop reusing that code with anyone else** — the code is now theirs (line 14 of youtube-outreach.md).

## Shared Channel / Warzone Codes

| Code | Purpose | Attribution |
|---|---|---|
| `RONY-FREE` | Warzone 2007 native + launch-window free tier for everyone. 90-day cookie. | Channel-shared - use UTMs to disambiguate source |
| `WARZONE-2007-FREE` | DEPRECATED - grandfathered legacy code (existing cookies still work). DO NOT PROMOTE - point new users at `RONY-FREE` instead. Deletable ~Oct 2026 when 90-day cookies expire. | Legacy only |

## Stripe Purchase Links (Not Codes — Direct Buy)

| Product | Price | URL |
|---|---|---|
| Personal Unlock | $10 | https://buy.stripe.com/3cI8wO8g13vf0DY39A6c001 |
| Alliance Founding | $30 (first 10 alliances, then $50) | https://buy.stripe.com/7sY3cubsdd5PgCW8tU6c002 |

Track Founding tier sold count (currently 0/10). When you post the "Founding tier: X/10" hard-sell tweets on X, update the count each Sunday per `x-twitter.md` posting cadence.

## Recommended UTM Layers (Where Codes Not Possible)

Add UTMs to r5tools.io links you post publicly so you can measure channel-level attribution when the code is the shared `RONY-FREE`:

| Channel | Suggested URL |
|---|---|
| Reddit r/LastWarSurvival | `r5tools.io/?utm_source=reddit&utm_medium=post&utm_campaign=lws-authority` |
| X / Twitter launch thread | `r5tools.io/?utm_source=x&utm_medium=thread&utm_campaign=launch-2026-07` |
| X / Twitter daily calendar | `r5tools.io/?utm_source=x&utm_medium=tweet&utm_campaign=cal-30d` |
| TikTok bio | `r5tools.io/?utm_source=tiktok&utm_medium=bio&utm_campaign=short-form` |
| TikTok description | `r5tools.io/?utm_source=tiktok&utm_medium=desc&utm_campaign=script-<N>` |
| Discord Official #community-tools | `r5tools.io/?utm_source=discord&utm_medium=official&utm_campaign=launch` |
| Discord WWC | `r5tools.io/?utm_source=discord&utm_medium=wwc&utm_campaign=launch` |
| Discord Last War Academy | `r5tools.io/?utm_source=discord&utm_medium=lwacademy&utm_campaign=launch` |
| Discord JP official | `r5tools.io/?utm_source=discord&utm_medium=jp-official&utm_campaign=launch-jp` |
| Naver Cafe | `r5tools.io/?utm_source=naver&utm_medium=cafe&utm_campaign=kr-launch` |
| KakaoTalk open chat | `r5tools.io/?utm_source=kakao&utm_medium=openchat&utm_campaign=kr-launch` |
| DCInside | `r5tools.io/?utm_source=dcinside&utm_medium=mgallery&utm_campaign=kr-launch` |
| ProductHunt page + comments | `r5tools.io/?utm_source=ph&utm_medium=launch&utm_campaign=ph-2026-07-28` |
| PH launch-day X posts | `r5tools.io/?utm_source=x&utm_medium=ph-day&utm_campaign=ph-2026-07-28` |

Concatenate `?ref=<username>` for peer R5 DMs where you want per-conversation attribution (e.g. `r5tools.io/?ref=WZ2015-R5-alliancename`).

## Response Tracking (Piped into warzone-tracking.csv)

Per `how-to-find-r5s.md` lines 119-124, log each DM response as one of:
- `no-reply` (5 days silence)
- `not-interested`
- `interested-free` (took code, no purchase)
- `interested-personal` ($10 buy)
- `interested-founding` ($30 buy)
- `future-followup` (with date in notes)

Update `../warzone-tracking.csv` `response` column after each contact.

## Kill Criteria (Stop Sending)

Per `how-to-find-r5s.md` lines 128-132:
- 5 sequential "not-interested" replies from a warzone
- Warzone <30% population
- Total language barrier with no translator
