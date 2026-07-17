# r5tools Discord bot

Scheduled-announcement bot for servers **Evan is admin of**. Not for spamming
other people's servers. Read `safety.md` before doing anything with it.

---

## What it does

- Runs as a long-lived Python process (systemd unit provided).
- Reads post bodies from `content/*.md` (YAML frontmatter + body).
- Exposes three slash commands: `/r5t schedule`, `/r5t list`, `/r5t cancel`,
  plus `/r5t content` to enumerate available IDs.
- Every post is **scheduled** — nothing sends immediately. Minimum 30-second
  delay so you can `/r5t cancel` any post before it fires.
- Background task loop wakes every 60s, sends any due posts, then goes back
  to sleep.
- Persists to append-only `scheduled.jsonl` (log-compacted on replay — last
  write per `id` wins). Survives restarts.
- Every send appended to `logs/sent.jsonl` for audit.
- Splits messages longer than 2000 chars into multiple messages at paragraph
  boundaries.
- 429s / disconnects: leaves state as `scheduled`, retries next tick.
- Missing perms / channel gone: state → `failed`, logged.
- Per-channel throttle: max 1 post per 30 min per channel.

---

## Files

```
automation/discord-bot/
  bot.py                          # main bot process (run this)
  import_from_launch_posts.py     # populate content/ from marketing/discord/launch-posts.md + tips
  schedule_launch_broadcast.py    # one-shot: plan the 2026-07-28 launch broadcast
  content/                        # one .md per content_id (YAML frontmatter + body)
  scheduled.jsonl                 # append-only schedule log (auto-created)
  logs/
    bot.log                       # runtime log
    sent.jsonl                    # audit log of every message the bot sent
  README.md                       # this file
  safety.md                       # DO / DON'T list — READ THIS
  r5t-discord-bot.service         # systemd unit for Lightsail deploy
```

---

## First-time setup

### 1. Create a Discord application + bot user

1. Go to https://discord.com/developers/applications → **New Application**.
   Name it `r5tools` (or similar).
2. Left sidebar → **Bot** → **Reset Token** → copy the token. This is the
   `DISCORD_BOT_TOKEN`. You only see it once — save it now.
3. On the Bot page:
   - **PUBLIC BOT** → OFF (only you can invite this bot).
   - **PRIVILEGED GATEWAY INTENTS** → enable **MESSAGE CONTENT INTENT** and
     **SERVER MEMBERS INTENT**.

### 2. Install deps

```bash
python3 -m pip install "discord.py>=2.3" "PyYAML>=6.0"
```

Python 3.11+ (needed for `zoneinfo` in `schedule_launch_broadcast.py`).

### 3. Export env

```bash
export DISCORD_BOT_TOKEN='paste-token-here'
# optional — restrict slash-command sync to one guild for near-instant registration
export DISCORD_GUILD_ID='123456789012345678'
```

### 4. Populate content

```bash
python3 import_from_launch_posts.py
```

Idempotent. Rerun anytime `launch-posts.md` or `tips-en.md` changes.

### 5. Generate an OAuth2 invite URL

Discord Developer Portal → your app → **OAuth2** → **URL Generator**.

- **Scopes:** `bot`, `applications.commands`
- **Bot permissions:** `Send Messages`, `Embed Links`, `Attach Files`,
  `Read Message History`
- Copy the generated URL — it looks like:

  ```
  https://discord.com/api/oauth2/authorize?client_id=<APP_ID>&permissions=51200&scope=bot+applications.commands
  ```

- Open the URL, pick a server Evan is admin of, authorize.

### 6. Run

```bash
python3 bot.py
```

You'll see `logged in as r5tools#1234 | guilds=N` and
`synced N slash commands`. Slash commands appear in Discord within 1–2s if you
set `DISCORD_GUILD_ID`, otherwise up to an hour for global sync.

---

## Slash commands

All commands are ephemeral (only visible to you).

### `/r5t schedule channel:#foo content_id:launch-medium utc_datetime:2026-07-28T07:15:00Z`

Schedules a post. `utc_datetime` accepts ISO-8601 with `Z` or `+00:00`.
Requires **Manage Server** permission.

### `/r5t list`

Lists all `scheduled`-state posts in the current server.

### `/r5t cancel id:abc12345`

Cancels a scheduled post. Requires **Manage Server**.

### `/r5t content`

Lists all available `content_id`s (files in `content/`).

---

## The launch broadcast (2026-07-28)

Plan the launch drops:

```bash
# dry-run — see the plan
python3 schedule_launch_broadcast.py

# actually schedule (only for servers you pass with --server)
python3 schedule_launch_broadcast.py --write \
  --server 'RONY/TINO alliance Discord (own)=<guild_id>:<channel_id>'
```

Only servers with `tier=4` (internal / Evan-owned) in
`discord-targets.csv` **and** given a `--server` override are scheduled.
All other rows print as `[MANUAL]` — you copy-paste those by hand from
`launch-posts.md`. That's a hard rule (see `safety.md`).

Times used:
- **T-24h teaser** (short variant): 2026-07-27 12:00 PT (2026-07-27 19:00 UTC)
- **Launch drop** (chosen variant): 2026-07-28 00:15 PT (2026-07-28 07:15 UTC)

To get a channel ID: enable Developer Mode in Discord
(User Settings → Advanced → Developer Mode ON), then right-click a channel →
**Copy Channel ID**. Same right-click on the server icon → **Copy Server ID**
for the guild id.

---

## Deploy on the Lightsail box

The bot can share the Lightsail box that already runs `mdr-voice-agent` on
port 8765. It doesn't bind any port — pure outbound WebSocket to Discord.

```bash
# on the Lightsail box
sudo mkdir -p /opt/r5tools-discord-bot
sudo chown bitnami:bitnami /opt/r5tools-discord-bot
scp -r ./* bitnami@<lightsail-ip>:/opt/r5tools-discord-bot/

# install unit
sudo cp /opt/r5tools-discord-bot/r5t-discord-bot.service \
        /etc/systemd/system/r5t-discord-bot.service

# put the token in the unit's EnvironmentFile
sudo tee /etc/r5tools-discord-bot.env <<'EOF'
DISCORD_BOT_TOKEN=paste-token-here
DISCORD_GUILD_ID=optional-guild-id
EOF
sudo chmod 600 /etc/r5tools-discord-bot.env

sudo systemctl daemon-reload
sudo systemctl enable --now r5t-discord-bot
sudo journalctl -u r5t-discord-bot -f
```

**Never break MaKayla.** Before restarting the box or touching nginx/systemd,
verify the voice agent process is alive:

```bash
pgrep -f 'node /home/bitnami/app/server.js' && echo "MaKayla OK"
```

---

## Verification checklist

- [ ] `python3 import_from_launch_posts.py` writes 36 files to `content/`
      (6 launch variants + 30 tips) and reports `wrote=0 unchanged=36` on
      second run.
- [ ] `python3 schedule_launch_broadcast.py` prints 15 rows total (0 auto +
      15 manual) with no crashes.
- [ ] `python3 bot.py` starts, logs `logged in as ...`, and syncs at least 4
      slash commands (schedule, list, cancel, content).
- [ ] In Discord, `/r5t content` lists all imported IDs.
- [ ] `/r5t schedule` for a test channel with a datetime 60s in the future
      posts the content on time.
- [ ] `logs/sent.jsonl` gets a new row after a successful post.
- [ ] `/r5t cancel` before send prevents the post; row appears in
      `scheduled.jsonl` with `state="cancelled"`.

---

## Troubleshooting

- **Slash commands don't appear.** Global sync takes up to 60 min. Set
  `DISCORD_GUILD_ID` to your guild for instant registration during dev.
- **`Missing Access`.** Bot lacks View Channel or Send Messages in that
  channel. Fix in Discord server settings → Roles → r5tools bot role.
- **`Forbidden` in logs.** Same. Post state goes to `failed`; not retried.
- **Bot missed the send window during downtime.** On next boot, any post
  whose `scheduled_at` is now in the past fires on the next tick (within
  60s). That is intentional — a delayed launch post is better than a missed
  one. If you don't want that, `/r5t cancel` before restarting.
