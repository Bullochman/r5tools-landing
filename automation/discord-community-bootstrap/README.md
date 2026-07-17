# r5tools Community Discord — Bootstrap Kit

Everything needed to spin up the **discord.gg/r5tools** community server from an
empty shell to a fully-populated, moderated, verification-gated, content-seeded,
launch-week-ready Discord. All scripts are idempotent — safe to re-run.

**Blueprint reference:** `../../marketing/discord/community-server-setup.md` (this kit
turns that spec into executable Python + YAML.)

---

## 0. One-time prerequisites (before you touch a script)

### 0a. Create the Discord app + bot

1. https://discord.com/developers/applications → **New Application** → name it `r5tools`.
2. Go to **Bot** tab → **Add Bot** → **Reset Token** → copy the token; save it in your password manager. This is `DISCORD_BOT_TOKEN`.
3. Under **Privileged Gateway Intents** enable **Server Members Intent** and **Message Content Intent** (only members intent is strictly required for these scripts, but content intent is useful for future features).
4. Under **Bot → Public Bot** — turn OFF (private bot; only Evan installs it anywhere).

### 0b. Create the empty Discord server manually

Discord does not permit bots to create guilds (except via team accounts on Verified Developer status). Evan must click:

- Discord app → **+** icon on server rail → **Create My Own** → **For a club or community** → name it `r5tools` → skip icon (upload later) → **Create**.
- Right-click the new server icon → **Server Settings** → **Widget** or **General** → copy the **Server ID** (also called Guild ID). Save it as `DISCORD_GUILD_ID`.

**Note:** You'll get the ID by right-clicking the server icon (needs Developer Mode enabled in **User Settings → Advanced → Developer Mode**).

### 0c. Invite the bot to the empty server with admin permissions

Build the invite URL in the Developer Portal → **OAuth2 → URL Generator**:

- Scopes: `bot` + `applications.commands`
- Bot Permissions: **Administrator** (during setup only — you can tighten later)

Paste the URL into a browser, select the `r5tools` server, authorize.

### 0d. Install dependencies

```
python3 -m venv .venv
source .venv/bin/activate
pip install "discord.py>=2.3" "PyYAML>=6.0"
```

### 0e. Export environment variables

```
export DISCORD_BOT_TOKEN=<your token>
export DISCORD_GUILD_ID=<your guild id>
```

**Open a new terminal for this if you added the exports to `~/.zshrc`.** In-shell exports are fine as long as you stay in this shell.

---

## 1. Run the server bootstrap

```
cd /Users/evanjones/claudecode/r5tools/r5tools-landing/automation/discord-community-bootstrap

python3 setup-server.py --dry-run     # preview every mutation
python3 setup-server.py               # actually create roles, categories, channels, permissions
```

**What it does:**
- Creates 9 roles per `server-config.yaml` with correct colors, hoisting, permission presets.
- Creates 7 categories.
- Creates ~19 channels (welcome, rules, announcements, changelog, tools-help, bug-reports, feature-requests, kr-community, jp-community, r5-officers, r5-verify-queue, founding-tier-only, general, off-topic, staff-general, mod-log, General Voice, R5 Voice).
- Applies channel permission overwrites per role.
- Sets server verification level, default notifications, system channel.
- Writes `bot-state.json` on success.

**Idempotent:** re-run any time to reconcile drift. Existing roles/channels/permissions are updated in place, never duplicated.

### 1a. After setup-server, flip on Community mode manually

Discord requires manual consent for Community features:

- **Server Settings → Enable Community → Get Started**
- Enable the safety-check checkboxes (2FA required, email verification, etc.)
- Set **Rules channel** = `#rules`
- Set **Community Updates channel** = `#changelog` (or `#announcements`)
- Enable **Server Discovery** later once you cross 100 members.

`setup-server.py` sets everything it can from the API; Community mode itself must be toggled in the UI (Discord policy).

---

## 2. Launch the always-on bots

These two run as long-lived processes. Use `tmux` / `screen` / `pm2` / `systemd` on the Lightsail box.

```
python3 welcome-flow.py     # in one screen — DMs new members, handles rules-acceptance reactions
python3 verify-flow.py      # in another screen — /verify r5, /verify r4, /verify founding slash commands
```

**Verify slash-command sync:** the first time `verify-flow.py` runs it registers `/verify r5`, `/verify r4`, `/verify founding`, and `/verify status` scoped to your guild. Sync is instant (guild-scoped, not global). Test in `#tools-help` by typing `/verify` and confirming autocomplete shows the four subcommands.

---

## 3. Pre-seed 30 days of content

```
python3 content-seeder.py --backfill 3 --dry-run   # peek at the first 3 tips
python3 content-seeder.py --backfill 3             # actually post first 3 tips into #tools-help
python3 content-seeder.py --loop &                 # daemon posts 08:00 CT daily thereafter
```

Reads `../marketing/content-calendar/tips-en.md`. State is tracked in `bot-state.json` so restarts don't duplicate.

---

## 4. Launch-week broadcast

```
python3 launch-week-broadcast.py --dry-run         # verify parsed sections + preview posts
python3 launch-week-broadcast.py --schedule &      # sleeps until 2026-07-28 07:15 UTC (00:15 PT), then fires
# OR — if you want to send it right now:
python3 launch-week-broadcast.py --send-now
```

**What broadcasts:**
- LONG English → `#announcements`, pinned
- LONG Korean → `#kr-community`, pinned
- SHORT English teaser with `@everyone` → `#announcements` (**this is the only script that ever uses `@everyone`**)

Re-running after completion is a no-op unless you pass `--force`. Use `--unpin` to clean up pinned launch messages after the launch week.

---

## 5. State + logs

- `bot-state.json` — merged state written by all four bots. **Gitignored.** Contains guild ID, rules message ID, seeder progress, verification queue, launch state.
- Every bot logs to stdout with a per-line timestamp. Redirect to a file with `>> logs/<bot>.log 2>&1` if running under nohup/tmux.

---

## 6. When to tighten bot permissions

The bot is created with Administrator during setup. That's convenient, not required. Once the server is stable:

- Developer Portal → **Bot → Permissions Calculator** → uncheck Administrator, check:
  - Manage Channels, Manage Roles, Manage Messages, Read Messages, Send Messages, Embed Links, Attach Files, Read Message History, Add Reactions, Use Slash Commands, Kick Members (only if the bot ever needs to kick), Mute Members.
- Regenerate invite URL with the tighter perm set and re-invite (Discord updates existing bot's perms without kicking).

---

## 7. Troubleshooting

- **`Bot is not in guild X`** — you skipped step 0c. Invite the bot with admin perms.
- **`Missing perms to assign Free`** — role hierarchy issue. In Server Settings → Roles, drag the bot's auto-created role above `Free`, `Alliance Member`, `R4`, `R5`, `Founding`. Bot can only manage roles positioned below its own top role.
- **Slash commands don't appear** — guild-scoped sync is instant; if still missing, kick+reinvite bot including `applications.commands` scope.
- **Welcome DMs never arrive** — user has DMs from server members turned off. Not fixable server-side; the welcome message also appears in `#welcome` as a fallback (add that flow if desired).
- **Rules message duplicated** — delete `welcome.rules_message_id` from `bot-state.json` if you want a fresh post; otherwise the bot always reuses the existing message.

---

## 8. What's NOT in this kit

- **Vanity URL `discord.gg/r5tools`** — requires Level 3 boost (14 boosts). Ask Founding-alliance R5s for boosts and claim manually in Server Settings → Vanity URL when unlocked.
- **Server icon + banner** — upload manually via Server Settings → Overview.
- **GitHub webhook into `#changelog`** — configure in the r5tools-landing repo Settings → Webhooks. Point it at the Discord channel webhook URL.
- **Stripe webhook to a private `#stripe-events` channel** — deliberately excluded from this initial cut (add later once Stripe is auto-issuing Founding codes).
