#!/usr/bin/env python3
"""
welcome-flow.py — long-running bot for onboarding new members.

WHAT IT DOES:
    1. On member join → DM them the welcome message (EN default) + link to #rules,
       then assign the default "Free" role.
    2. Posts (or refreshes) a persistent "rules acceptance" message in #rules with
       reactions: ✅ = accept rules, 🇺🇸/🇰🇷/🇯🇵 = pick language.
    3. Handles raw_reaction_add on that message:
         - ✅  → remove "Free", add "Alliance Member"  (unlocks the server)
         - 🇺🇸 → add "EN-speaker" tag (channel-viewable through existing role)
         - 🇰🇷 → grant view of #kr-community
         - 🇯🇵 → grant view of #jp-community
    4. Persists the rules-message ID in bot-state.json so restarts don't post duplicates.

USAGE:
    export DISCORD_BOT_TOKEN=...
    export DISCORD_GUILD_ID=...
    python3 welcome-flow.py

    Runs indefinitely. Use `pm2 start welcome-flow.py --interpreter python3`
    or a systemd unit for prod.

STATE:
    bot-state.json — merged with setup-server.py's state file.
    Adds keys:  welcome.rules_message_id, welcome.rules_channel_id

RATE-LIMIT SAFETY:
    All mutations go through discord.py which handles 429s automatically.
    We add a 0.5s sleep between per-member role changes as extra buffer.

DEPS:
    pip install "discord.py>=2.3"
"""

from __future__ import annotations

import asyncio
import json
import logging
import os
import sys
from pathlib import Path
from typing import Any

import discord

HERE = Path(__file__).resolve().parent
STATE_PATH = HERE / "bot-state.json"

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("welcome-flow")

# ─────────────────────────────────────────────────────────────────────────────
# Copy — kept inline so ops can `grep` for wording quickly.
# ─────────────────────────────────────────────────────────────────────────────
WELCOME_DM_EN = """\
Welcome to **r5tools** — {username}!

r5tools is a suite of alliance-planning tools for *Last War: Survival*, built by
an active R5 (Evan, RONY, WZ 2007). Landing planner, heat sim, coal calc,
roster extractor, freeze risk dashboard, city capture planner, season timeline,
hive grid manager, VS days planner, profile studio, KB chat.

**Free code:** `RONY-FREE` — paste it at r5tools.io and everything unlocks.
No card. No email. Any warzone.

**Three quick steps:**
  1. Read the pinned rules in <#{rules_channel_id}>
  2. React ✅ to accept rules (unlocks the server)
  3. React 🇺🇸 / 🇰🇷 / 🇯🇵 to pick your language

**Founding-Alliance Tier** is $30 flat for your whole alliance forever — first
10 alliances only, then $50. If you're an R5, use `/verify founding` after
you accept the rules.

I'm Evan (the founder). DM me anytime — I answer everything.
"""

WELCOME_DM_KR = """\
r5tools 에 오신 것을 환영합니다 — {username}님!

r5tools는 *라스트 워: 서바이벌* 얼라이언스 계획 도구 모음입니다. 현역 R5(WZ 2007
RONY, Evan)가 만들었습니다.

**무료 코드:** `RONY-FREE` — r5tools.io 에 붙여넣으시면 전부 열립니다. 카드 불필요,
이메일 불필요. 어느 워존이든 됩니다.

**세 단계:**
  1. <#{rules_channel_id}> 에서 규칙 읽기
  2. ✅ 반응으로 규칙 수락 (서버 열림)
  3. 🇰🇷 반응으로 한국어 채널 접근

**얼라이언스 창립 티어**는 $30 얼라이언스 평생, 첫 10개 얼라이언스만. R5이시면
규칙 수락 후 `/verify founding` 사용하세요.

만든 사람은 Evan(에반)입니다. DM 언제든 주세요.
"""

RULES_MESSAGE_BODY = """\
**Server Rules — please read before reacting**

1. **R5-to-R5 voice.** Direct, helpful, not sales-y.
2. **English default in #general.** Use language channels for your language.
3. **No competitor tool spam.** Mentioning alternatives when helping is fine.
   Don't drop invite links to competing Discords.
4. **No selling/recruiting outside dedicated channels.** One post per week per user.
5. **No exploits, account sharing, or boosting services.**
6. **No harassment, doxing, or NSFW.** Standard Discord ToS.

Consequences: warn → mute 24h → mute 7d → ban.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**React to unlock the server:**
✅ — I've read the rules and I agree (unlocks channels)

**Pick your language (optional, any number):**
🇺🇸 English   🇰🇷 한국어   🇯🇵 日本語
"""

# ─────────────────────────────────────────────────────────────────────────────
# State helpers
# ─────────────────────────────────────────────────────────────────────────────
def load_state() -> dict[str, Any]:
    if not STATE_PATH.exists():
        return {}
    try:
        return json.loads(STATE_PATH.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {}


def save_state(state: dict[str, Any]) -> None:
    STATE_PATH.write_text(json.dumps(state, indent=2, default=str), encoding="utf-8")


# ─────────────────────────────────────────────────────────────────────────────
# Bot
# ─────────────────────────────────────────────────────────────────────────────
class WelcomeBot(discord.Client):
    def __init__(self, guild_id: int) -> None:
        intents = discord.Intents.default()
        intents.members = True
        intents.reactions = True
        intents.message_content = False
        super().__init__(intents=intents)
        self.guild_id = guild_id
        self.state: dict[str, Any] = load_state()

    # ── Ready ──────────────────────────────────────────────────────────────
    async def on_ready(self) -> None:
        log.info("Logged in as %s (%s)", self.user, self.user.id if self.user else "?")
        guild = self.get_guild(self.guild_id)
        if guild is None:
            log.error("Not in guild %d — check DISCORD_GUILD_ID", self.guild_id)
            await self.close()
            return
        await self.ensure_rules_message(guild)

    # ── Post/refresh the rules-acceptance message ─────────────────────────
    async def ensure_rules_message(self, guild: discord.Guild) -> None:
        rules_channel = discord.utils.get(guild.text_channels, name="rules")
        if rules_channel is None:
            log.error("#rules channel not found — run setup-server.py first.")
            return

        # Refresh cached message ID?
        w_state = self.state.setdefault("welcome", {})
        msg_id = w_state.get("rules_message_id")
        message: discord.Message | None = None
        if msg_id:
            try:
                message = await rules_channel.fetch_message(int(msg_id))
            except (discord.NotFound, discord.Forbidden):
                message = None

        if message is None:
            message = await rules_channel.send(RULES_MESSAGE_BODY)
            w_state["rules_message_id"] = message.id
            w_state["rules_channel_id"] = rules_channel.id
            save_state(self.state)
            log.info("Posted new rules-acceptance message: %s", message.id)
            for emoji in ("✅", "🇺🇸", "🇰🇷", "🇯🇵"):
                try:
                    await message.add_reaction(emoji)
                    await asyncio.sleep(0.3)
                except discord.HTTPException as e:
                    log.warning("Failed to add %s: %s", emoji, e)
        else:
            log.info("Rules-acceptance message already exists: %s", msg_id)

    # ── On join ────────────────────────────────────────────────────────────
    async def on_member_join(self, member: discord.Member) -> None:
        guild = member.guild
        if guild.id != self.guild_id:
            return

        # Assign default "Free" role
        free_role = discord.utils.get(guild.roles, name="Free")
        if free_role and free_role not in member.roles:
            try:
                await member.add_roles(free_role, reason="new-member default")
                await asyncio.sleep(0.5)
                log.info("Assigned Free to %s", member)
            except discord.Forbidden:
                log.warning("Missing perms to assign Free to %s", member)

        # DM welcome message
        rules_ch_id = self.state.get("welcome", {}).get("rules_channel_id", 0)
        body = WELCOME_DM_EN.format(username=member.display_name, rules_channel_id=rules_ch_id)
        try:
            await member.send(body)
            log.info("DM'd welcome (EN) to %s", member)
        except discord.Forbidden:
            log.info("Cannot DM %s (DMs closed); skipping welcome DM.", member)

    # ── Reaction-role handler ─────────────────────────────────────────────
    async def on_raw_reaction_add(self, payload: discord.RawReactionActionEvent) -> None:
        if payload.guild_id != self.guild_id or payload.user_id == (self.user.id if self.user else 0):
            return
        rules_msg_id = self.state.get("welcome", {}).get("rules_message_id")
        if not rules_msg_id or payload.message_id != int(rules_msg_id):
            return

        guild = self.get_guild(self.guild_id)
        if guild is None:
            return
        member = guild.get_member(payload.user_id)
        if member is None or member.bot:
            return

        emoji = str(payload.emoji)

        if emoji == "✅":
            free_role = discord.utils.get(guild.roles, name="Free")
            member_role = discord.utils.get(guild.roles, name="Alliance Member")
            if member_role and member_role not in member.roles:
                try:
                    await member.add_roles(member_role, reason="rules accepted")
                    if free_role and free_role in member.roles:
                        await member.remove_roles(free_role, reason="graduated from Free")
                    log.info("%s accepted rules → Alliance Member", member)
                except discord.Forbidden:
                    log.warning("Cannot modify roles for %s", member)

        elif emoji in ("🇰🇷", "🇯🇵"):
            # Grant view of language channel via direct channel overwrite (per-user).
            # Using role-based access is cleaner but keeps role count low; do direct overwrite here.
            channel_name = {"🇰🇷": "kr-community", "🇯🇵": "jp-community"}[emoji]
            channel = discord.utils.get(guild.text_channels, name=channel_name)
            if channel is None:
                return
            try:
                await channel.set_permissions(
                    member,
                    view_channel=True, send_messages=True, read_message_history=True,
                    reason=f"language self-select via {emoji}",
                )
                log.info("Granted %s access to #%s via %s", member, channel_name, emoji)
            except discord.Forbidden:
                log.warning("Cannot set overwrite on #%s for %s", channel_name, member)

        elif emoji == "🇺🇸":
            # No-op; English is the default channel language. Log for stats.
            log.info("%s selected EN", member)


# ─────────────────────────────────────────────────────────────────────────────
def main() -> None:
    token = os.environ.get("DISCORD_BOT_TOKEN")
    guild_id_str = os.environ.get("DISCORD_GUILD_ID")
    if not token or not guild_id_str:
        log.error("DISCORD_BOT_TOKEN and DISCORD_GUILD_ID required")
        sys.exit(2)
    bot = WelcomeBot(guild_id=int(guild_id_str))
    bot.run(token, log_handler=None)


if __name__ == "__main__":
    main()
