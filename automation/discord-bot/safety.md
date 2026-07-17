# Safety rules for the r5tools Discord bot

This bot exists to auto-post r5tools content in servers Evan owns or
administers. Anything outside that scope is either against Discord's Terms
of Service or looks like spam and burns reputation.

## DO

- **Post in servers you own or admin.** RONY / TINO alliance server, the
  r5tools community server, KR alliance server you help run.
- **Get explicit invite from the server owner** before adding the bot to a
  server that isn't yours. In the invite conversation, be direct: "I'm going
  to use this bot to post r5tools tips and announcements — 1-2 posts per week
  max, in a channel you designate. Is that okay?"
- **Throttle to 1 post per 30 min per channel maximum.** The bot enforces
  this in code (`PER_CHANNEL_COOLDOWN_S`). Don't lower it.
- **Schedule with a real cushion.** Every post has a hard 30-second-minimum
  future delay so you can `/r5t cancel` before it fires. Use that window
  when you have any doubt.
- **Prefer designated channels.** `#tools`, `#resources`, `#announcements`,
  `#creator-projects` — never `#general` on servers you don't own.
- **Log every send.** `logs/sent.jsonl` is your audit trail. When a mod asks
  "did your bot post X at Y time," the answer is there.
- **Match the server's tone.** Server admins can help translate — take them
  up on it.
- **Kill the bot immediately if a mod asks.** `sudo systemctl stop
  r5t-discord-bot`. Apologize, ask which channel is appropriate, offer to
  repost there manually.

## DON'T

- **DM anyone unsolicited.** This is against Discord's Terms of Service and
  triggers account-level actions, not just per-server bans. If you want to
  DM an R5, do it from your own Evan account, not the bot.
- **Post the same message across many servers in short succession.** Even
  if you have posting rights everywhere, back-to-back identical drops
  trigger Discord's anti-spam heuristics and get accounts flagged. Space
  server-crossposts by at least 20 minutes and rotate openers (see
  `launch-posts.md` § "Post-hygiene notes").
- **Use the bot to circumvent server-owner permissions.** If a server owner
  told you no, that's no. Adding the bot on someone else's authority (an
  admin who wasn't asked, an OAuth URL a friend clicked without owner
  approval) is not consent.
- **Auto-post in servers where the CSV lists tier ≤ 3.** Those are
  community/creator/vendor Discords. `schedule_launch_broadcast.py`
  intentionally does NOT auto-schedule for them — it prints them as
  `[MANUAL]` so you copy-paste yourself. That's the guardrail. Don't
  bypass it.
- **Bulk-DM based on Roster Extractor output.** Roster Extractor exists to
  help alliances plan their own operations, not to scrape leads. Never
  wire a roster extract into the bot.
- **Post promo content in a server whose rules forbid it** — WWC, LWS
  Official, Cpt Hedgehog's HQ etc. all have specific channels for tools.
  Post there or nowhere.
- **Post in `#general`** of any server that isn't RONY/TINO or the r5tools
  community server, unless the server owner explicitly directed you to.
- **Argue with a mod who removes a post.** Thank them, ask the right
  channel, take the L.
- **Skip the audit log.** If `logs/sent.jsonl` isn't writing, the bot's
  buggy — fix that before scheduling more sends. Bots without audit logs
  are how bans start.

## Server-owner sanity check before every deploy

Before pushing an updated bot to prod, ask yourself:

1. Can I name every server this bot is currently in?
2. For each one, do I have a person's name (server owner) I got a "yes"
   from?
3. If the r5tools bot posted 5 messages in the wrong channel tomorrow, who
   would I text to apologize?

If any answer is "no" or "not sure," you're not ready to schedule broader
broadcasts. Rein it back to your own alliance server until you are.

## Compliance references

- Discord Terms of Service — https://discord.com/terms
- Discord Community Guidelines — https://discord.com/guidelines
- Discord Developer Policy —
  https://discord.com/developers/docs/policies-and-agreements/developer-policy
- Discord API self-bot / automation ban list —
  https://support.discord.com/hc/en-us/articles/115002192352
