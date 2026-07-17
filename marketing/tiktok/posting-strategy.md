# r5tools.io — TikTok posting strategy

## Cadence

- **3-4 videos per week.** Enough to feed the algorithm; not enough to burn through the 10-script bank before we know what's working.
- **Batch-shoot 6-8 videos in one 90-minute session, schedule the rest.** Do not try to produce a script the day it needs to post — the friction kills consistency.
- **Never post two of the same theme back-to-back.** Rotate categories (feature-explainer → mechanic-tip → pricing → social-proof → feature-explainer). Mixed themes read as a channel, not a spam account.
- **Post the two flagship scripts first** — Script 1 (Landing Planner) and Script 5 (Roster Extractor). These are the strongest conversion hooks per the project docs. First impressions determine which side of the algorithm the account lands on.

## Best times to post

Target the overlap between EN-evening and KR-morning to maximize both audiences from one post:

- **Primary window: 6-8 PM Eastern (US)** = **7-9 AM KST (Korea, next day)**. Catches US players heading into an evening play session AND KR players opening the app on their morning commute.
- **Secondary window: 8-10 PM Pacific (US)** = **1-3 PM KST**. Second US wave + KR lunch break.
- Avoid dead zones: 2-6 AM Eastern is a black hole for LWS content — the algorithm sees a video posted then, buries it, and it never recovers even if the topic is strong.
- **KR-first posts:** if you're pushing a KR-adapted script (see `kr-tiktok-adapter.md`), post it at **9 PM KST (7 AM ET)** and let it ride the KR evening. Do not cross-post to the same account within 6 hours.

## Iteration rules

Set explicit kill/scale thresholds so you don't emotionally hang on to a video that isn't landing:

- **< 500 views after 24 hours → kill.** Do not delete (the account benefits from post volume), but do not push it further and do not remix the theme. Move on.
- **500 - 5,000 views after 24 hours → hold.** Standard performer. No action. Let it accumulate for a week; some LWS content pops at day 5-7 when a subreddit or Discord picks it up.
- **> 5,000 views after 24 hours → double down.** Within 48 hours, post a follow-up video on the same theme with a variant hook. If the original hit because of an audio choice, reuse the same audio.
- **> 20,000 views → post 3 remixes within a week.** Different hooks, same theme, different B-roll. This is where compound growth comes from.
- **> 100,000 views → cut a 60s or 90s variant** and post as a "long-form deep dive" version. TikTok's algorithm will re-cross-pollinate the long variant back into the shorter one's audience.

## Hook / retention diagnosis

- **Views but no likes or comments** → the hook is working but the middle sags. Shorten the beat sheet, add a text-overlay pattern-interrupt every 5 seconds.
- **Low completion rate (< 40%)** → your CTA never gets seen. Front-load the value; move a piece of the CTA to the middle.
- **Bookmarks > likes** → gold. That means players are saving the video to refer to later. Post more like it, and add "screenshot this" as an on-screen prompt.
- **Comments asking "where do I get this?"** → the CTA is buried. Make the URL bigger, longer on-screen, and put it in the video description first line.

## When to run TikTok Ads (paid boost)

**Wait.** Do not run ads until three organic videos have hit > 20k views. Rationale:

1. TikTok Ads is expensive per-view compared to organic pickup for gaming content. Paying to push an unproven hook wastes money confirming it doesn't work.
2. Once three videos hit 20k+ organically, you have a proven creative template. Ad spend then amplifies a known-working hook instead of guessing.
3. The Spark Ads format (boost an existing organic post) is far cheaper than a cold ad, but Spark Ads requires an organic post that's already performing to be worth running.

**When you do start ads:**
- Budget cap $50/day per campaign for the first two weeks. This is enough signal to know if the ad works without meaningful loss if it doesn't.
- Only Spark Ads. Never cold creative. Boost your best organic performer.
- Target: 18-45, US + KR, interests in mobile strategy games, `#LastWarSurvival` and adjacent hashtags.
- Kill any ad set with CPM > $8 or CTR < 1.5% after 48 hours.
- Reinvest 20% of every dollar Referral revenue generates back into ads once ads are proven.

## Content pipeline discipline

- **Every video links r5tools.io in the bio** — the description CTA is helpful but bio is what viewers actually tap.
- **RONY-FREE code goes in the description, on-screen text, AND voiceover.** Redundancy compensates for muted watchers, non-English viewers, and people who scroll past the CTA.
- **Track what works in a spreadsheet.** One row per post: video ID, script #, post time, views @ 24h / 48h / 7d, likes, comments, saves, r5tools.io sign-ups attributed via UTM in the bio link. Without the tracking, iteration is guesswork.
- **Re-shoot bad-audio takes immediately.** The single biggest reason a promising video fails is bad audio, not bad script. See `voiceover-tips.md`.

## Cross-posting

- **Cross-post to Instagram Reels and YouTube Shorts** the same day but not the same minute. Post to TikTok first, wait 4-6 hours, then Reels, then Shorts. This avoids TikTok's algorithm downranking content flagged as reposted-from-Meta.
- **Do not cross-post to Twitter/X.** Different format, different audience — a separate short-form video strategy for X lives in `marketing/x-twitter.md`.
- **Re-cut for Discord and Reddit** with a text lead-in — LWS-community subreddits and Discord servers will share TikTok videos IF you post them as native embeds with a written R5 note attached, not as raw links.
