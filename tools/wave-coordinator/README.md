# LWS Wave Attack Coordinator

Sync your alliance's tsunami — personal click-send times so every march lands on the target at the exact same second.

Part of the [R5TOOLS.IO](https://r5tools.io) Last War: Survival alliance toolkit.

## What it does

1. **R5 (CREATE mode):** picks the impact time (when marches LAND). Generates a shareable URL. Sends it to the alliance chat.
2. **Members (JOIN mode):** open the URL, enter their personal march time (seconds), get their individual click-send countdown with audio + vibration cues at t-15/10/5/3/2/1/GO.
3. Every member's countdown lands on the same impact second — the tsunami syncs.

## Features

- Client-only. No login. No backend. Wave config encoded in URL.
- NTP-style device clock skew display (worldtimeapi.org sync) — warns members if their phone is >200ms off.
- WebAudio API for reliable sub-second cue timing (not `<audio>` tags).
- Vibration API for Android tactile cues.
- Full-screen mode.
- EN + KR (formal 존댓말 register).
- Share buttons: native share sheet, WhatsApp, Discord, KakaoTalk.

## Structure

```
index.html                  — CREATE + JOIN modes in one page, mode chosen by ?w= param
static/wave-coordinator.js  — app logic (mode dispatch, NTP sync, cues)
static/i18n.js              — EN/KR string table + runtime
static/styles.css           — shared LWS suite palette
static/lws-track.js         — analytics beacon + ?ref= capture
```

## Deploy

GitHub Pages from `main` branch, root.

Live at https://bullochman.github.io/lws-wave-coordinator-static/
