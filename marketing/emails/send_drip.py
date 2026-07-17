#!/usr/bin/env python3
"""
r5tools email drip sender.

Reads subscribers from the LWS_Access_Codes drip store (JSONL), figures out
which day-of-sequence each subscriber is on, renders the appropriate markdown
email to text + minimal HTML, and sends via SMTP.

Idempotent: each subscriber's `last_day_sent` cursor is updated after a
successful send. Re-running the script on the same day is a no-op.

USAGE

    # dry run — print what WOULD be sent, don't touch SMTP
    python3 send_drip.py --dry-run

    # actually send (cron this hourly or daily)
    python3 send_drip.py

    # send a single email manually (testing)
    python3 send_drip.py --test evan@r5tools.io --day 3 --lang en

    # explicit subscribers file
    python3 send_drip.py --subscribers /path/to/drip_subscribers.jsonl

ENVIRONMENT VARIABLES

    Required (unless --dry-run):
        SMTP_HOST         SMTP server hostname (e.g. smtp.fastmail.com)
        SMTP_USER         SMTP username
        SMTP_PASS         SMTP password / app password

    Optional:
        SMTP_PORT         (default 587 for STARTTLS, 465 for SSL)
        SMTP_SSL          "1" to use implicit SSL on port 465 (default STARTTLS)
        FROM_EMAIL        Envelope-from + Reply-To (default: evan@r5tools.io)
        FROM_NAME         Human-readable sender (default: "Evan @ r5tools")
        SUBSCRIBERS_FILE  Path to JSONL subscriber DB
                          (default: ../../../LWS_Access_Codes/logs/drip_subscribers.jsonl
                          relative to this script)
        UNSUBSCRIBE_BASE  Base URL for one-click unsubscribe
                          (default: https://access-codes.r5tools.io/api/drip/unsubscribe)
        SERVER_SECRET     HMAC secret used to sign unsubscribe tokens. MUST
                          match the LWS_Access_Codes server's SERVER_SECRET
                          so tokens verify server-side.
        LOG_FILE          Where to append send log entries
                          (default: send_drip.log next to this script)

SUBSCRIBER RECORD FORMAT (JSONL, one record per line)

    {
      "email": "someone@example.com",
      "lang": "en",                  # "en" or "ko"
      "code": "RONY-FREE",           # unlock code they used (informational)
      "tier": "free-warzone",        # tier (informational)
      "joined_at": "2026-07-17T12:34:56Z",
      "last_day_sent": -1,           # -1 = never sent; 0..7 = last day sent
      "status": "active",            # "active" | "unsubscribed" | "bounced"
      "unsubscribed_at": null
    }

The server (LWS_Access_Codes/server.py) is the writer of this file when users
subscribe on the unlock page. This script only *reads* it and updates the
`last_day_sent` + `last_sent_at` fields via atomic rewrite.
"""

import argparse
import hashlib
import hmac
import json
import os
import re
import smtplib
import ssl
import sys
import time
from datetime import datetime, timezone, timedelta
from email.message import EmailMessage
from email.utils import formatdate, make_msgid
from pathlib import Path
from urllib.parse import urlencode

BASE_DIR = Path(__file__).parent.resolve()
DEFAULT_SUBSCRIBERS = (
    BASE_DIR.parent.parent.parent / "LWS_Access_Codes" / "logs" / "drip_subscribers.jsonl"
).resolve()

# Number of days in the drip sequence (0 through 7 = 8 emails counting day 0).
TOTAL_DAYS = 7  # last day index

# Interval between sends (24h). Cron this script hourly; each subscriber will
# only receive a new email once their `last_sent_at` is >= SEND_INTERVAL old.
SEND_INTERVAL = timedelta(hours=23, minutes=30)  # slight fuzz so hourly cron doesn't stall


# ---------- markdown → text/html rendering (dependency-free) ----------

def parse_frontmatter(md_text):
    """Return (metadata_dict, body_str). Frontmatter is a YAML-ish block delimited
    by --- lines at the top. We only support key: value strings + integers."""
    if not md_text.startswith("---"):
        return {}, md_text
    end = md_text.find("\n---", 3)
    if end == -1:
        return {}, md_text
    header = md_text[3:end].strip()
    body = md_text[end + 4:].lstrip("\n")
    meta = {}
    for line in header.splitlines():
        line = line.strip()
        if not line or ":" not in line:
            continue
        k, _, v = line.partition(":")
        v = v.strip().strip('"').strip("'")
        # try int
        try:
            meta[k.strip()] = int(v)
        except ValueError:
            meta[k.strip()] = v
    return meta, body


_INLINE_LINK_RE = re.compile(r"\[([^\]]+)\]\(([^)]+)\)")
_BOLD_RE = re.compile(r"\*\*([^*]+)\*\*")
_ITAL_RE = re.compile(r"(?<!\*)\*([^*]+)\*(?!\*)")
_CODE_RE = re.compile(r"`([^`]+)`")
_H1_RE = re.compile(r"^# (.+)$", re.MULTILINE)
_H2_RE = re.compile(r"^## (.+)$", re.MULTILINE)
_H3_RE = re.compile(r"^### (.+)$", re.MULTILINE)
_HR_RE = re.compile(r"^---+\s*$", re.MULTILINE)


def render_text(body, unsubscribe_url):
    """Plain-text render — strip markdown formatting, expand link syntax."""
    txt = body
    txt = txt.replace("{{UNSUBSCRIBE_URL}}", unsubscribe_url)
    # links: keep both label and URL for text version
    txt = _INLINE_LINK_RE.sub(lambda m: f"{m.group(1)} ({m.group(2)})", txt)
    # bold / italic / code — strip markers
    txt = _BOLD_RE.sub(r"\1", txt)
    txt = _ITAL_RE.sub(r"\1", txt)
    txt = _CODE_RE.sub(r"\1", txt)
    # headings — leave the text, drop the # markers
    txt = _H3_RE.sub(r"\1", txt)
    txt = _H2_RE.sub(r"\1", txt)
    txt = _H1_RE.sub(r"\1", txt)
    return txt.strip() + "\n"


def _escape_html(s):
    return (
        s.replace("&", "&amp;")
         .replace("<", "&lt;")
         .replace(">", "&gt;")
    )


def render_html(body, unsubscribe_url):
    """Minimal HTML render — a semantic, plain, readable email."""
    body = body.replace("{{UNSUBSCRIBE_URL}}", unsubscribe_url)
    # process line by line into paragraphs / headings / rules
    lines = body.split("\n")
    out = []
    para = []

    def flush_para():
        if not para:
            return
        text = " ".join(para).strip()
        if not text:
            para.clear()
            return
        # inline formatting on the joined paragraph
        text = _escape_html(text)
        # unescape link syntax we want to keep — apply on escaped text using
        # a lookup pass. Simpler: run the markdown regexes on the escaped
        # string. Escape of `[]()` doesn't touch those chars, so this works.
        text = _INLINE_LINK_RE.sub(
            lambda m: f'<a href="{m.group(2)}" style="color:#c9a961">{m.group(1)}</a>',
            text,
        )
        text = _BOLD_RE.sub(r"<strong>\1</strong>", text)
        text = _ITAL_RE.sub(r"<em>\1</em>", text)
        text = _CODE_RE.sub(
            r'<code style="background:#22262e;padding:1px 5px;border-radius:3px">\1</code>',
            text,
        )
        out.append(f"<p style='margin:0 0 14px;line-height:1.55'>{text}</p>")
        para.clear()

    for raw in lines:
        line = raw.rstrip()
        if not line.strip():
            flush_para()
            continue
        if _HR_RE.match(line):
            flush_para()
            out.append("<hr style='border:0;border-top:1px solid #2a3038;margin:22px 0'>")
            continue
        m = _H1_RE.match(line)
        if m:
            flush_para()
            out.append(
                f"<h1 style='font-size:22px;margin:24px 0 12px;color:#e6eaf0'>{_escape_html(m.group(1))}</h1>"
            )
            continue
        m = _H2_RE.match(line)
        if m:
            flush_para()
            out.append(
                f"<h2 style='font-size:18px;margin:22px 0 10px;color:#e6eaf0'>{_escape_html(m.group(1))}</h2>"
            )
            continue
        m = _H3_RE.match(line)
        if m:
            flush_para()
            out.append(
                f"<h3 style='font-size:15px;margin:20px 0 8px;color:#c9a961'>{_escape_html(m.group(1))}</h3>"
            )
            continue
        para.append(line)
    flush_para()

    body_html = "\n".join(out)

    html = f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0f1116;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#c8ccd4;font-size:15px">
  <div style="max-width:600px;margin:0 auto;padding:28px 22px;background:#0f1116">
    {body_html}
  </div>
</body>
</html>
"""
    return html


# ---------- unsubscribe token ----------

def make_unsub_token(email, secret):
    """HMAC-signed token — server verifies with matching SERVER_SECRET.
    Format: bare hex sig (email is already in the URL as ?email=...).
    Must match LWS_Access_Codes/server.py::_drip_make_unsub_token exactly."""
    if not secret:
        return ""
    payload = email.encode("utf-8")
    return hmac.new(secret.encode("utf-8"), payload, hashlib.sha256).hexdigest()[:32]


def unsubscribe_url(email, base_url, secret):
    token = make_unsub_token(email, secret)
    return f"{base_url}?{urlencode({'email': email, 'token': token})}"


# ---------- subscriber DB IO ----------

def load_subscribers(path):
    """Read the JSONL file into a list of dicts. Missing file → empty list."""
    if not path.exists():
        return []
    subs = []
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                subs.append(json.loads(line))
            except json.JSONDecodeError:
                print(f"[warn] skipping malformed line in {path}", file=sys.stderr)
    return subs


def save_subscribers(path, subs):
    """Atomic rewrite of the JSONL file."""
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(".tmp")
    with open(tmp, "w", encoding="utf-8") as f:
        for s in subs:
            f.write(json.dumps(s, ensure_ascii=False) + "\n")
    tmp.replace(path)


# ---------- day calculation ----------

def _parse_iso(ts):
    try:
        return datetime.fromisoformat(ts.replace("Z", "+00:00"))
    except (ValueError, AttributeError):
        return None


def next_day_for(sub, now):
    """Return the day index (0..TOTAL_DAYS) this subscriber should receive next,
    or None if they're up to date / done / paused."""
    if sub.get("status") != "active":
        return None
    joined = _parse_iso(sub.get("joined_at", ""))
    if not joined:
        return None
    last = int(sub.get("last_day_sent", -1))
    if last >= TOTAL_DAYS:
        return None  # sequence complete
    # Day 0 is sent immediately on subscribe. Day N sent when N * 24h has passed since join.
    target_day = last + 1
    unlock_time = joined + timedelta(days=target_day)
    # Also respect SEND_INTERVAL from last actual send (defensive rate limit)
    last_sent = _parse_iso(sub.get("last_sent_at", "")) if sub.get("last_sent_at") else None
    if last_sent and (now - last_sent) < SEND_INTERVAL and target_day > 0:
        return None
    if now >= unlock_time:
        return target_day
    return None


# ---------- template loading ----------

def load_email(day, lang):
    """Return (metadata, body) for the given day + lang. Falls back to EN if
    KR file is missing (should never happen but keeps sender resilient)."""
    lang_dir = BASE_DIR / lang
    # Match by prefix: dayNN-*.md
    prefix = f"day{day:02d}-"
    if lang_dir.exists():
        for p in sorted(lang_dir.iterdir()):
            if p.name.startswith(prefix) and p.suffix == ".md":
                text = p.read_text(encoding="utf-8")
                return parse_frontmatter(text)
    if lang != "en":
        return load_email(day, "en")
    raise FileNotFoundError(f"no email template for day {day} lang {lang}")


# ---------- SMTP send ----------

def _smtp_connect():
    host = os.environ.get("SMTP_HOST")
    user = os.environ.get("SMTP_USER")
    password = os.environ.get("SMTP_PASS")
    if not (host and user and password):
        raise RuntimeError(
            "SMTP_HOST + SMTP_USER + SMTP_PASS must be set (or run --dry-run)"
        )
    use_ssl = os.environ.get("SMTP_SSL", "").strip() in ("1", "true", "yes")
    port = int(os.environ.get("SMTP_PORT", "465" if use_ssl else "587"))
    if use_ssl:
        ctx = ssl.create_default_context()
        smtp = smtplib.SMTP_SSL(host, port, timeout=30, context=ctx)
    else:
        smtp = smtplib.SMTP(host, port, timeout=30)
        smtp.ehlo()
        smtp.starttls(context=ssl.create_default_context())
        smtp.ehlo()
    smtp.login(user, password)
    return smtp


def build_message(sub, day, meta, body, unsub_url):
    from_email = os.environ.get("FROM_EMAIL", "evan@r5tools.io")
    from_name = meta.get("from_name") or os.environ.get("FROM_NAME", "Evan @ r5tools")

    subject = meta.get("subject", f"r5tools · day {day}")
    text = render_text(body, unsub_url)
    html = render_html(body, unsub_url)

    msg = EmailMessage()
    msg["From"] = f"{from_name} <{from_email}>"
    msg["To"] = sub["email"]
    msg["Subject"] = subject
    msg["Reply-To"] = from_email
    msg["Date"] = formatdate(localtime=True)
    msg["Message-ID"] = make_msgid(domain="r5tools.io")

    # One-click unsubscribe headers (RFC 8058) — Gmail/Outlook honor these.
    msg["List-Unsubscribe"] = f"<{unsub_url}>"
    msg["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click"

    if meta.get("preheader"):
        # preheader hidden preview text — most clients render the first ~90 chars
        # of the plain part as the preview. Prepend it invisibly.
        text = meta["preheader"] + "\n\n" + text
        html = html.replace(
            "<body ",
            f'<body data-preheader="{_escape_html(str(meta["preheader"]))}" ',
        )
        html = html.replace(
            '<div style="max-width:600px',
            (
                f'<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">'
                f'{_escape_html(str(meta["preheader"]))}'
                f'</div><div style="max-width:600px'
            ),
        )

    msg.set_content(text)
    msg.add_alternative(html, subtype="html")
    return msg


def send_one(smtp, msg):
    smtp.send_message(msg)


# ---------- log ----------

def append_log(path, entry):
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "a", encoding="utf-8") as f:
        f.write(json.dumps(entry, ensure_ascii=False) + "\n")


# ---------- main ----------

def _default_log_path():
    return BASE_DIR / "send_drip.log"


def cmd_normal(args):
    subs_path = Path(os.environ.get("SUBSCRIBERS_FILE") or args.subscribers or DEFAULT_SUBSCRIBERS)
    log_path = Path(os.environ.get("LOG_FILE") or _default_log_path())
    unsub_base = os.environ.get(
        "UNSUBSCRIBE_BASE", "https://access-codes.r5tools.io/api/drip/unsubscribe"
    )
    secret = os.environ.get("SERVER_SECRET", "")
    if not secret and not args.dry_run:
        print(
            "[warn] SERVER_SECRET is not set — unsubscribe links will NOT verify "
            "against the server. Sending anyway; users can still reply.",
            file=sys.stderr,
        )

    subs = load_subscribers(subs_path)
    if not subs:
        print(f"[info] no subscribers loaded from {subs_path}")
        return 0

    now = datetime.now(timezone.utc)
    to_send = []
    for s in subs:
        d = next_day_for(s, now)
        if d is not None:
            to_send.append((s, d))

    print(f"[info] {len(to_send)} email(s) to send (of {len(subs)} subscribers)")

    if not to_send:
        return 0

    smtp = None if args.dry_run else _smtp_connect()
    sent = 0
    failed = 0
    try:
        for sub, day in to_send:
            lang = sub.get("lang") or "en"
            try:
                meta, body = load_email(day, lang)
            except FileNotFoundError as e:
                print(f"[error] {sub['email']} day {day} lang {lang}: {e}", file=sys.stderr)
                failed += 1
                continue

            unsub_url = unsubscribe_url(sub["email"], unsub_base, secret)
            msg = build_message(sub, day, meta, body, unsub_url)

            if args.dry_run:
                print(f"[dry-run] would send day {day} ({lang}) to {sub['email']}: "
                      f"{meta.get('subject', '(no subject)')}")
                continue

            try:
                send_one(smtp, msg)
                sub["last_day_sent"] = day
                sub["last_sent_at"] = now.isoformat().replace("+00:00", "Z")
                append_log(
                    log_path,
                    {
                        "ts": now.isoformat().replace("+00:00", "Z"),
                        "email": sub["email"],
                        "day": day,
                        "lang": lang,
                        "subject": meta.get("subject", ""),
                        "ok": True,
                    },
                )
                sent += 1
                print(f"[ok] sent day {day} ({lang}) to {sub['email']}")
            except (smtplib.SMTPException, OSError) as e:
                failed += 1
                append_log(
                    log_path,
                    {
                        "ts": now.isoformat().replace("+00:00", "Z"),
                        "email": sub["email"],
                        "day": day,
                        "lang": lang,
                        "ok": False,
                        "error": str(e),
                    },
                )
                print(f"[fail] {sub['email']} day {day}: {e}", file=sys.stderr)

            # Gentle pacing — most SMTP servers are fine with 1/s.
            time.sleep(0.5)
    finally:
        if smtp is not None:
            try:
                smtp.quit()
            except smtplib.SMTPException:
                pass

    if not args.dry_run and sent > 0:
        save_subscribers(subs_path, subs)

    print(f"[done] sent={sent} failed={failed} dry_run={args.dry_run}")
    return 1 if failed and sent == 0 else 0


def cmd_test(args):
    """Send one specific day to one specific address. Doesn't touch subscribers DB."""
    unsub_base = os.environ.get(
        "UNSUBSCRIBE_BASE", "https://access-codes.r5tools.io/api/drip/unsubscribe"
    )
    secret = os.environ.get("SERVER_SECRET", "")
    meta, body = load_email(args.day, args.lang)
    unsub_url = unsubscribe_url(args.test, unsub_base, secret)
    fake_sub = {"email": args.test}
    msg = build_message(fake_sub, args.day, meta, body, unsub_url)

    if args.dry_run:
        print(f"--- Subject: {meta.get('subject')}")
        print(f"--- To: {args.test}")
        print(f"--- Unsubscribe: {unsub_url}")
        print()
        print(msg.get_body(preferencelist=("plain",)).get_content())
        return 0

    smtp = _smtp_connect()
    try:
        send_one(smtp, msg)
    finally:
        try:
            smtp.quit()
        except smtplib.SMTPException:
            pass
    print(f"[ok] test sent day {args.day} ({args.lang}) to {args.test}")
    return 0


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[1])
    ap.add_argument("--dry-run", action="store_true",
                    help="Don't send; print what would be sent.")
    ap.add_argument("--subscribers", default=None,
                    help="Path to drip_subscribers.jsonl (overrides env + default).")
    ap.add_argument("--test", metavar="EMAIL", default=None,
                    help="Send one specific --day to this address, ignore DB.")
    ap.add_argument("--day", type=int, default=0,
                    help="With --test: which day of the sequence (0-7). Default 0.")
    ap.add_argument("--lang", default="en", choices=("en", "ko"),
                    help="With --test: language. Default en.")
    args = ap.parse_args()

    if args.test:
        return cmd_test(args)
    return cmd_normal(args)


if __name__ == "__main__":
    sys.exit(main())
