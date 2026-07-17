# r5tools weekly screenshot capture

Fresh screenshots of every r5tools tool + landing page, on a weekly schedule.
Feeds social-media posts, blog embeds, tweet threads, press-kit updates.

## What it does

1. `capture.py` — headless Chromium visits every URL in `targets.yaml`,
   dismisses cookie/consent banners, waits for content, and saves PNGs to:
   - `latest/<name>.png` — viewport shot (canonical)
   - `latest/<name>-full.png` — full-page shot
   - `history/YYYY-MM-DD/<name>.png` — dated archive (12-week rotation)
2. `compare.py` — diffs `latest/` vs the last dated snapshot, flags anything
   over 5% pixel change, optionally posts to Slack/Discord webhook.
3. `gallery.py` — regenerates `../../marketing/screenshots-gallery.md` with
   grouped embeds for easy copy-paste into blog/tweet drafts.

## One-time setup

```bash
pip install playwright pillow pyyaml
playwright install chromium
```

If Playwright is missing when you run `capture.py`, it exits with the exact
install command in the error message.

## Test it

```bash
# List targets, don't launch a browser
python3 capture.py --dry-run

# Grab a single target end-to-end
python3 capture.py --only homepage-hero

# Full run (all 27 targets, ~2-3 min)
python3 capture.py

# Then diff + gallery
python3 compare.py
python3 gallery.py
```

## Schedule it

### Cron (simple)

See `crontab.example`. Weekly Sunday 04:00 UTC:

```
0 4 * * 0 cd .../automation/screenshots && python3 capture.py && python3 compare.py && python3 gallery.py
```

### systemd timer (Linux alternative)

`/etc/systemd/system/r5tools-screenshots.service`:

```ini
[Unit]
Description=r5tools weekly screenshot capture
After=network-online.target
Wants=network-online.target

[Service]
Type=oneshot
User=evanjones
WorkingDirectory=/Users/evanjones/claudecode/r5tools/r5tools-landing/automation/screenshots
Environment=SLACK_WEBHOOK_URL=
ExecStart=/usr/bin/env python3 capture.py
ExecStart=/usr/bin/env python3 compare.py
ExecStart=/usr/bin/env python3 gallery.py
```

`/etc/systemd/system/r5tools-screenshots.timer`:

```ini
[Unit]
Description=Weekly r5tools screenshot capture

[Timer]
OnCalendar=Sun *-*-* 04:00:00 UTC
Persistent=true

[Install]
WantedBy=timers.target
```

Enable:
```bash
sudo systemctl enable --now r5tools-screenshots.timer
```

### launchd (macOS alternative)

Save as `~/Library/LaunchAgents/io.r5tools.screenshots.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>io.r5tools.screenshots</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/bash</string>
    <string>-lc</string>
    <string>cd /Users/evanjones/claudecode/r5tools/r5tools-landing/automation/screenshots &amp;&amp; python3 capture.py &amp;&amp; python3 compare.py &amp;&amp; python3 gallery.py</string>
  </array>
  <key>StartCalendarInterval</key>
  <dict>
    <key>Weekday</key><integer>0</integer>
    <key>Hour</key><integer>4</integer>
    <key>Minute</key><integer>0</integer>
  </dict>
  <key>StandardOutPath</key><string>/Users/evanjones/claudecode/r5tools/r5tools-landing/automation/screenshots/logs/launchd.log</string>
  <key>StandardErrorPath</key><string>/Users/evanjones/claudecode/r5tools/r5tools-landing/automation/screenshots/logs/launchd.err</string>
</dict>
</plist>
```

Load:
```bash
launchctl load ~/Library/LaunchAgents/io.r5tools.screenshots.plist
```

## Editing targets

Edit `targets.yaml`. Each entry supports:

```yaml
- url: https://example.com/
  name: filename-stem          # required, becomes <name>.png
  viewport: [1440, 900]         # default
  wait_for_selector: h1         # default 'body'
  wait_after_ms: 800            # extra settle delay
  hover_selector: .btn-cta      # optional interaction
  click_selector: .accordion    # optional interaction
  full_page: true               # default, also saves -full.png
  viewport_only: false          # true to skip full-page shot
```

## Notifications

`compare.py` reads `SLACK_WEBHOOK_URL` and/or `DISCORD_WEBHOOK_URL` from the
environment. If either is set and diffs exceed the threshold (default 5%), a
short summary is posted:

```
r5tools weekly screenshots: 3 page(s) changed >5%
  - hive-grid: 12.4%
  - refer: 8.1%
  - homepage-hero: 6.2%
```

Diff images land in `diffs/YYYY-MM-DD/<name>-diff.png` for review.

## File-size discipline

Screenshots are re-encoded through Pillow when they exceed 500 KB (palette
mode, 256 colors, `optimize=True`). Visually indistinguishable for UI shots,
huge savings on GitHub-hosted tool grids that are mostly flat color.

## Layout

```
automation/screenshots/
├── README.md            ← this file
├── capture.py           ← Playwright capture runner
├── compare.py           ← visual-regression + webhook
├── gallery.py           ← writes marketing/screenshots-gallery.md
├── crontab.example      ← weekly cron recipe
├── targets.yaml         ← URL list
├── latest/              ← current-week PNGs
├── history/YYYY-MM-DD/  ← 12-week rolling archive
├── diffs/YYYY-MM-DD/    ← per-week regression diff images
└── logs/                ← capture + cron logs
```
