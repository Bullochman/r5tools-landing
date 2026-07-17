#!/usr/bin/env python3
"""
r5tools weekly digest — Sunday newsletter builder + sender.

Reads blog posts from the past 7 days (plus optional "new tool releases"
and "tip of the week" from a small YAML/JSON side-file), renders a
newsletter HTML email, and sends via SMTP to every subscriber tagged
"newsletter" in the drip subscribers JSONL.

USAGE
    # dry-run — print the rendered digest to stdout, no SMTP
    python3 weekly-digest-builder.py --dry-run

    # actually send this week's digest
    python3 weekly-digest-builder.py

    # send a single test copy to one address
    python3 weekly-digest-builder.py --test evan@r5tools.io

    # send a specific past week (uses posts dated in that ISO week)
    python3 weekly-digest-builder.py --week 2026-07-13

    # override subject / A/B variant
    python3 weekly-digest-builder.py --subject-variant b

ENVIRONMENT VARIABLES (same as send_drip.py where possible)
    SMTP_HOST                SMTP server hostname
    SMTP_USER                SMTP username
    SMTP_PASS                SMTP password
    SMTP_PORT                (default 587 STARTTLS, 465 SSL)
    SMTP_SSL                 "1" for implicit SSL
    FROM_EMAIL               (default evan@r5tools.io)
    FROM_NAME                (default "Evan @ r5tools")
    SUBSCRIBERS_FILE         path to drip_subscribers.jsonl
    SERVER_SECRET            HMAC for unsubscribe tokens (must match access-codes server)
    UNSUBSCRIBE_BASE         (default https://access-codes.r5tools.io/api/drip/unsubscribe)
    NEWSLETTER_TAG           (default "newsletter") — only subscribers with this tag receive

CRON
    0 15 * * SUN  cd /path/to/newsletter && /usr/bin/python3 weekly-digest-builder.py

    (15 UTC on Sunday = 10 AM Central. Adjust for DST if it matters — for
    a low-frequency send this drift is not worth the extra logic.)
"""

from __future__ import annotations

import argparse
import datetime as _dt
import email.utils
import hashlib
import hmac
import html as _html_lib
import json
import os
import smtplib
import ssl
import sys
import time
from email.message import EmailMessage
from pathlib import Path

# Reuse the blog builder's Post loader + markdown renderer.
HERE = Path(__file__).resolve().parent
BLOG_AUTOMATION = HERE.parent
sys.path.insert(0, str(BLOG_AUTOMATION))
from build_blog import (  # type: ignore  # noqa: E402
    Post, load_posts, render_markdown, SITE_URL,
)

DEFAULT_SUBSCRIBERS = (
    HERE.parent.parent.parent.parent
    / "LWS_Access_Codes" / "logs" / "drip_subscribers.jsonl"
)
DEFAULT_UNSUBSCRIBE_BASE = "https://access-codes.r5tools.io/api/drip/unsubscribe"
DEFAULT_FROM_EMAIL = "evan@r5tools.io"
DEFAULT_FROM_NAME = "Evan @ r5tools"
LOGS_DIR = HERE / "logs"
LOGS_DIR.mkdir(exist_ok=True)
SEND_LOG = LOGS_DIR / "digest-sends.jsonl"

# Auxiliary content — hand-curated per-week in a small JSON file if desired.
# Format:
#   {
#     "tip": {"lang": "en", "title": "...", "body_md": "..."},
#     "new_tools": [{"name": "...", "url": "...", "blurb": "..."}]
#   }
AUX_FILE = HERE / "digest-extras.json"


# ---------- subject line A/B variants ----------

def subject_variants(week_start: _dt.date, posts: list[Post]) -> dict[str, str]:
    """Return {variant_id: subject_line}. Deterministic per week."""
    # Use the top post as the hook.
    top = posts[0] if posts else None
    top_title = top.title if top else "r5tools weekly"
    week_num = week_start.isocalendar().week

    return {
        "a": f"r5tools week {week_num}: {top_title}",
        "b": f"[r5tools] {top_title}" if top else f"r5tools week {week_num}",
        "c": f"{top_title} — plus {max(0, len(posts) - 1)} more from this week"
             if top else f"r5tools weekly digest — week {week_num}",
    }


def pick_variant(variant_id: str | None, week_start: _dt.date, posts: list[Post]) -> tuple[str, str]:
    subs = subject_variants(week_start, posts)
    if variant_id and variant_id in subs:
        return variant_id, subs[variant_id]
    # Deterministic rotation by ISO week.
    week_num = week_start.isocalendar().week
    keys = sorted(subs.keys())
    picked = keys[week_num % len(keys)]
    return picked, subs[picked]


# ---------- week window ----------

def week_window(anchor: _dt.date) -> tuple[_dt.date, _dt.date]:
    """Return (start, end) inclusive for the ISO week containing `anchor`
    (Monday..Sunday). Sunday of that week is the send day."""
    dow = anchor.weekday()  # Monday = 0
    start = anchor - _dt.timedelta(days=dow)
    end = start + _dt.timedelta(days=6)
    return start, end


def posts_this_week(all_posts: list[Post], start: _dt.date, end: _dt.date, lang: str) -> list[Post]:
    out = [p for p in all_posts
           if not p.draft and p.lang == lang and start <= p.date <= end
           and p.word_count() >= 500]
    out.sort(key=lambda p: p.date, reverse=True)
    return out


# ---------- rendering ----------

def _escape(s: str) -> str:
    return _html_lib.escape(s or "")


def render_digest_html(week_start: _dt.date, week_end: _dt.date,
                       posts: list[Post], aux: dict,
                       unsubscribe_url: str, lang: str) -> str:
    """Semantic minimal HTML — safe for major clients (Gmail, Outlook, Apple Mail)."""
    tip = aux.get("tip") or {}
    new_tools = aux.get("new_tools") or []
    week_label = {
        "en": f"Week of {week_start.isoformat()} — r5tools digest",
        "ko": f"{week_start.isoformat()} 주간 — r5tools 다이제스트",
    }.get(lang, f"Week of {week_start.isoformat()} — r5tools digest")

    intro = {
        "en": ("Here's this week from r5tools — what shipped on the blog, "
               "what's changing in the LWS meta, and the tools most R5s "
               "should keep an eye on."),
        "ko": ("이번 주 r5tools 소식입니다 — 블로그에 게시된 새 글, "
               "LWS 메타 변화, 그리고 주목할 만한 툴 업데이트."),
    }.get(lang, "Here's this week from r5tools.")

    parts = []
    parts.append(f"""<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0f1116;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Noto Sans KR',sans-serif;color:#c8ccd4;font-size:15px;line-height:1.55">
<div style="max-width:640px;margin:0 auto;padding:28px 22px;background:#0f1116">
  <div style="text-align:center;margin-bottom:18px">
    <a href="https://r5tools.io/" style="color:#c9a961;text-decoration:none;font-size:13px;letter-spacing:0.16em;font-weight:600">R5TOOLS.IO</a>
    <div style="color:#7a8290;font-size:11px;margin-top:2px;letter-spacing:0.06em">{_escape(week_label)}</div>
  </div>
  <p style="color:#e6e8ee;font-size:15px">{_escape(intro)}</p>
""")

    if posts:
        section_title = "New this week" if lang != "ko" else "이번 주 새 글"
        parts.append(f'<h2 style="color:#c9a961;font-size:16px;margin:24px 0 8px;letter-spacing:0.08em;text-transform:uppercase">{_escape(section_title)}</h2>')
        for p in posts:
            url = p.canonical_url
            parts.append(f"""<div style="border-left:3px solid #c9a961;padding:8px 0 8px 14px;margin:14px 0">
  <a href="{_escape(url)}" style="color:#e6e8ee;text-decoration:none;font-size:17px;font-weight:600">{_escape(p.title)}</a>
  <div style="color:#a8b0c0;font-size:13px;margin-top:6px">{_escape(p.description)}</div>
  <div style="margin-top:8px"><a href="{_escape(url)}" style="color:#c9a961;text-decoration:none;font-size:13px">Read it →</a></div>
</div>""")
    else:
        parts.append(f'<p style="color:#a8b0c0;font-style:italic">No new blog posts this week. Back next Sunday.</p>')

    if new_tools:
        section_title = "New / updated tools" if lang != "ko" else "새 · 업데이트된 툴"
        parts.append(f'<h2 style="color:#c9a961;font-size:16px;margin:32px 0 8px;letter-spacing:0.08em;text-transform:uppercase">{_escape(section_title)}</h2>')
        for tool in new_tools:
            parts.append(f"""<div style="background:#181c26;border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:14px 16px;margin:10px 0">
  <a href="{_escape(tool.get('url', ''))}" style="color:#e6e8ee;text-decoration:none;font-size:15px;font-weight:600">{_escape(tool.get('name', ''))}</a>
  <div style="color:#a8b0c0;font-size:13px;margin-top:4px">{_escape(tool.get('blurb', ''))}</div>
</div>""")

    if tip and tip.get("body_md"):
        section_title = "Tip of the week" if lang != "ko" else "이번 주 팁"
        tip_html = render_markdown(tip.get("body_md", ""))
        # Downgrade any paragraph styling — we don't have the site's stylesheet in emails.
        tip_html = (tip_html
                    .replace("<p>", "<p style='color:#a8b0c0;margin:0 0 10px'>")
                    .replace("<strong>", "<strong style='color:#e6e8ee'>"))
        parts.append(f"""<h2 style="color:#c9a961;font-size:16px;margin:32px 0 8px;letter-spacing:0.08em;text-transform:uppercase">{_escape(section_title)}</h2>
<div style="background:#181c26;border:1px solid rgba(201,169,97,0.25);border-radius:10px;padding:16px 18px;margin:10px 0">
  <div style="color:#e6e8ee;font-weight:600;font-size:14px;margin-bottom:8px">{_escape(tip.get('title', ''))}</div>
  {tip_html}
</div>""")

    cta_line = ("Open the suite" if lang != "ko" else "툴 열기")
    parts.append(f"""<div style="text-align:center;margin:32px 0 12px">
  <a href="https://r5tools.io/" style="display:inline-block;background:#c9a961;color:#000;text-decoration:none;padding:11px 26px;border-radius:22px;font-weight:600;font-size:14px">{_escape(cta_line)} →</a>
</div>
<hr style="border:0;border-top:1px solid #2a3038;margin:28px 0 14px">
<p style="color:#7a8290;font-size:12px;text-align:center;line-height:1.5">
  You're getting this because you subscribed to the r5tools weekly at r5tools.io.<br>
  <a href="{_escape(unsubscribe_url)}" style="color:#a8b0c0">Unsubscribe with one click</a>
  · <a href="https://r5tools.io/blog/" style="color:#a8b0c0">Read on the web</a>
  · Fan-made · unaffiliated with First Fun / Century Games.
</p>
</div>
</body></html>
""")
    return "".join(parts)


def render_digest_text(week_start: _dt.date, posts: list[Post], aux: dict,
                       unsubscribe_url: str, lang: str) -> str:
    lines = []
    lines.append(f"r5tools weekly — week of {week_start.isoformat()}")
    lines.append("")
    if posts:
        lines.append("NEW THIS WEEK")
        lines.append("-" * 40)
        for p in posts:
            lines.append(f"* {p.title}")
            lines.append(f"  {p.description}")
            lines.append(f"  {p.canonical_url}")
            lines.append("")
    else:
        lines.append("No new blog posts this week. Back next Sunday.")
        lines.append("")

    new_tools = aux.get("new_tools") or []
    if new_tools:
        lines.append("NEW / UPDATED TOOLS")
        lines.append("-" * 40)
        for t in new_tools:
            lines.append(f"* {t.get('name', '')} — {t.get('blurb', '')}")
            lines.append(f"  {t.get('url', '')}")
            lines.append("")

    tip = aux.get("tip") or {}
    if tip and tip.get("body_md"):
        lines.append("TIP OF THE WEEK")
        lines.append("-" * 40)
        lines.append(tip.get("title", ""))
        lines.append("")
        # crude MD -> text: strip formatting markers
        body = tip.get("body_md", "")
        for line in body.split("\n"):
            lines.append(line)
        lines.append("")

    lines.append("---")
    lines.append("You're getting this because you subscribed at r5tools.io.")
    lines.append(f"Unsubscribe (one click, no confirmation): {unsubscribe_url}")
    lines.append("Read on the web: https://r5tools.io/blog/")
    lines.append("")
    return "\n".join(lines)


# ---------- subscriber IO ----------

def load_subscribers(path: Path, tag: str = "newsletter") -> list[dict]:
    if not path.exists():
        return []
    subs = []
    with path.open("r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                rec = json.loads(line)
            except json.JSONDecodeError:
                continue
            if rec.get("status") != "active":
                continue
            if rec.get("tag") != tag:
                continue
            subs.append(rec)
    return subs


# ---------- unsubscribe token ----------

def make_unsub_url(email_addr: str, base: str, secret: str) -> str:
    if not secret:
        return f"{base}?email={email.utils.quote(email_addr)}"
    tok = hmac.new(secret.encode("utf-8"), email_addr.encode("utf-8"), hashlib.sha256).hexdigest()[:32]
    return f"{base}?email={email.utils.quote(email_addr)}&token={tok}"


# ---------- SMTP ----------

def connect_smtp():
    host = os.environ.get("SMTP_HOST")
    user = os.environ.get("SMTP_USER")
    password = os.environ.get("SMTP_PASS")
    if not (host and user and password):
        raise RuntimeError("SMTP_HOST + SMTP_USER + SMTP_PASS must be set (or use --dry-run)")
    use_ssl = os.environ.get("SMTP_SSL", "").strip() in ("1", "true", "yes")
    port = int(os.environ.get("SMTP_PORT", "465" if use_ssl else "587"))
    if use_ssl:
        ctx = ssl.create_default_context()
        smtp = smtplib.SMTP_SSL(host, port, timeout=30, context=ctx)
    else:
        smtp = smtplib.SMTP(host, port, timeout=30)
        smtp.starttls(context=ssl.create_default_context())
    smtp.login(user, password)
    return smtp


def build_message(from_email: str, from_name: str, to_addr: str,
                  subject: str, text_body: str, html_body: str,
                  unsubscribe_url: str) -> EmailMessage:
    msg = EmailMessage()
    msg["From"] = email.utils.formataddr((from_name, from_email))
    msg["To"] = to_addr
    msg["Subject"] = subject
    msg["Date"] = email.utils.formatdate(localtime=False)
    msg["Message-ID"] = email.utils.make_msgid(domain="r5tools.io")
    # RFC 8058 one-click unsubscribe
    msg["List-Unsubscribe"] = f"<{unsubscribe_url}>"
    msg["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click"
    msg.set_content(text_body)
    msg.add_alternative(html_body, subtype="html")
    return msg


# ---------- main ----------

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true", help="do not send; print rendered digest and recipients")
    ap.add_argument("--test", help="send a single copy to this address only")
    ap.add_argument("--week", help="date string YYYY-MM-DD; use the ISO week containing this date")
    ap.add_argument("--lang", default="en", help="subscribers' language (default en)")
    ap.add_argument("--subject-variant", choices=["a", "b", "c"])
    ap.add_argument("--subscribers", help="path override for drip_subscribers.jsonl")
    args = ap.parse_args()

    if args.week:
        anchor = _dt.date.fromisoformat(args.week)
    else:
        anchor = _dt.date.today()
    week_start, week_end = week_window(anchor)

    all_posts = load_posts()
    posts = posts_this_week(all_posts, week_start, week_end, args.lang)

    aux: dict = {}
    if AUX_FILE.exists():
        try:
            aux = json.loads(AUX_FILE.read_text(encoding="utf-8"))
        except json.JSONDecodeError as e:
            print(f"[warn] {AUX_FILE.name} invalid: {e}", file=sys.stderr)

    variant_id, subject = pick_variant(args.subject_variant, week_start, posts)

    subs_path = Path(args.subscribers) if args.subscribers else Path(
        os.environ.get("SUBSCRIBERS_FILE") or str(DEFAULT_SUBSCRIBERS))
    tag = os.environ.get("NEWSLETTER_TAG", "newsletter")

    if args.test:
        recipients = [{"email": args.test, "lang": args.lang}]
    else:
        recipients = load_subscribers(subs_path, tag=tag)

    unsub_base = os.environ.get("UNSUBSCRIBE_BASE", DEFAULT_UNSUBSCRIBE_BASE)
    secret = os.environ.get("SERVER_SECRET", "")

    from_email = os.environ.get("FROM_EMAIL", DEFAULT_FROM_EMAIL)
    from_name = os.environ.get("FROM_NAME", DEFAULT_FROM_NAME)

    print(f"[digest] week={week_start.isoformat()}..{week_end.isoformat()} "
          f"lang={args.lang} posts={len(posts)} subject_variant={variant_id} "
          f"recipients={len(recipients)}")

    if not recipients:
        print("[digest] no recipients — nothing to send")
        return 0

    if args.dry_run:
        sample_email = recipients[0]["email"]
        unsub_url = make_unsub_url(sample_email, unsub_base, secret)
        text_body = render_digest_text(week_start, posts, aux, unsub_url, args.lang)
        html_body = render_digest_html(week_start, week_end, posts, aux, unsub_url, args.lang)
        print("---- SUBJECT ----")
        print(subject)
        print("---- TEXT ----")
        print(text_body)
        print("---- HTML (first 800 chars) ----")
        print(html_body[:800])
        return 0

    smtp = connect_smtp()
    sent = failed = 0
    try:
        for rec in recipients:
            addr = rec["email"]
            unsub_url = make_unsub_url(addr, unsub_base, secret)
            text_body = render_digest_text(week_start, posts, aux, unsub_url, args.lang)
            html_body = render_digest_html(week_start, week_end, posts, aux, unsub_url, args.lang)
            msg = build_message(from_email, from_name, addr, subject,
                                text_body, html_body, unsub_url)
            try:
                smtp.send_message(msg)
                sent += 1
            except (smtplib.SMTPException, OSError) as e:
                failed += 1
                print(f"[digest] failed {addr}: {e}", file=sys.stderr)
            time.sleep(0.15)  # gentle rate limit
    finally:
        try:
            smtp.quit()
        except Exception:
            pass

    log_line = {
        "ts": _dt.datetime.now(_dt.timezone.utc).isoformat(),
        "week_start": week_start.isoformat(),
        "week_end": week_end.isoformat(),
        "lang": args.lang,
        "subject": subject,
        "variant": variant_id,
        "posts_count": len(posts),
        "sent": sent,
        "failed": failed,
        "recipients": len(recipients),
    }
    SEND_LOG.open("a", encoding="utf-8").write(json.dumps(log_line) + "\n")

    print(f"[digest] sent={sent} failed={failed}")
    return 0 if failed == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
