#!/usr/bin/env python3
"""
ping_sitemap.py — Notify search engines that r5tools.io sitemap has updates.

Pings:
  - Google:   https://www.google.com/ping?sitemap=...       (deprecated but still functional)
  - Bing:     https://www.bing.com/webmaster/ping.aspx?siteMap=...
  - IndexNow: https://api.indexnow.org/indexnow             (modern replacement for Bing/Yandex/etc.)
  - GSC API:  Google Search Console Sitemaps API           (optional, requires GSC_SERVICE_ACCOUNT_JSON)

Behavior:
  - By default, pings ONLY URLs modified in the last 24h.
    URL modification time is determined by <lastmod> in sitemap.xml, or by the
    file mtime of the corresponding local HTML file if lastmod is absent.
  - Refuses to run if sitemap.xml hasn't changed since last successful run
    (compares mtime against .state.json) — unless --force is passed.
  - Batches IndexNow submissions to 10,000 URLs per request.
  - Retries transient (5xx) failures once, then logs and continues.
  - All output logged to logs/ping.log.

Usage:
    python3 ping_sitemap.py                         # normal daily run
    python3 ping_sitemap.py --force                 # bypass mtime state check
    python3 ping_sitemap.py --full                  # submit ALL sitemap URLs (weekly resubmit)
    python3 ping_sitemap.py --dry-run               # print what would be sent, no HTTP
    python3 ping_sitemap.py --with-gsc              # also hit Google Search Console API
    python3 ping_sitemap.py --window-hours 48       # override 24h recent-modification window

Env vars:
    INDEXNOW_KEY                 IndexNow API key (32-char hex). Required for IndexNow submission.
    GSC_SERVICE_ACCOUNT_JSON     Path to Google service account JSON. Optional; enables GSC API when --with-gsc.
    R5TOOLS_SITE_ROOT            Override site root path (default: parent of this script's automation dir).
    SITEMAP_URL                  Override sitemap URL (default: https://r5tools.io/sitemap.xml).
"""

from __future__ import annotations

import argparse
import json
import logging
import os
import sys
import time
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Iterable
from urllib.parse import quote, urlparse

try:
    import requests
except ImportError:
    print("ERROR: `requests` is required. Install with: pip3 install requests", file=sys.stderr)
    sys.exit(1)


# --- Paths ---------------------------------------------------------------

SCRIPT_DIR = Path(__file__).resolve().parent
SITE_ROOT = Path(os.environ.get("R5TOOLS_SITE_ROOT") or SCRIPT_DIR.parent.parent).resolve()
SITEMAP_FILE = SITE_ROOT / "sitemap.xml"
LOG_DIR = SCRIPT_DIR / "logs"
LOG_FILE = LOG_DIR / "ping.log"
STATE_FILE = SCRIPT_DIR / ".state.json"

# --- Constants -----------------------------------------------------------

SITEMAP_URL = os.environ.get("SITEMAP_URL", "https://r5tools.io/sitemap.xml")
SITE_HOST = "r5tools.io"
GOOGLE_PING = "https://www.google.com/ping?sitemap="
BING_PING = "https://www.bing.com/webmaster/ping.aspx?siteMap="
INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow"
INDEXNOW_BATCH_SIZE = 10000
HTTP_TIMEOUT = 20
USER_AGENT = "r5tools-sitemap-ping/1.0 (+https://r5tools.io)"

XMLNS = "{http://www.sitemaps.org/schemas/sitemap/0.9}"


# --- Logging -------------------------------------------------------------

def setup_logging() -> logging.Logger:
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    logger = logging.getLogger("sitemap_ping")
    logger.setLevel(logging.INFO)
    logger.handlers.clear()

    fmt = logging.Formatter("%(asctime)s [%(levelname)s] %(message)s", datefmt="%Y-%m-%dT%H:%M:%S%z")

    fh = logging.FileHandler(LOG_FILE)
    fh.setFormatter(fmt)
    logger.addHandler(fh)

    sh = logging.StreamHandler(sys.stdout)
    sh.setFormatter(fmt)
    logger.addHandler(sh)

    return logger


# --- State ---------------------------------------------------------------

def load_state() -> dict:
    if not STATE_FILE.exists():
        return {}
    try:
        return json.loads(STATE_FILE.read_text())
    except (json.JSONDecodeError, OSError):
        return {}


def save_state(state: dict) -> None:
    STATE_FILE.write_text(json.dumps(state, indent=2, sort_keys=True))


# --- Sitemap parsing -----------------------------------------------------

def parse_sitemap(path: Path) -> list[dict]:
    """Return list of {loc, lastmod_dt} dicts. lastmod_dt is a datetime or None."""
    if not path.exists():
        raise FileNotFoundError(f"Sitemap not found at {path}")
    tree = ET.parse(path)
    root = tree.getroot()
    entries: list[dict] = []
    for url_el in root.findall(f"{XMLNS}url"):
        loc_el = url_el.find(f"{XMLNS}loc")
        if loc_el is None or not loc_el.text:
            continue
        loc = loc_el.text.strip()
        lastmod_el = url_el.find(f"{XMLNS}lastmod")
        lastmod_dt: datetime | None = None
        if lastmod_el is not None and lastmod_el.text:
            lastmod_dt = _parse_lastmod(lastmod_el.text.strip())
        entries.append({"loc": loc, "lastmod": lastmod_dt})
    return entries


def _parse_lastmod(s: str) -> datetime | None:
    """Parse sitemap lastmod (W3C date or datetime). Returns tz-aware UTC datetime."""
    for fmt in ("%Y-%m-%dT%H:%M:%S%z", "%Y-%m-%dT%H:%M:%SZ", "%Y-%m-%d"):
        try:
            dt = datetime.strptime(s.replace("Z", "+0000"), fmt.replace("Z", "%z"))
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            return dt.astimezone(timezone.utc)
        except ValueError:
            continue
    return None


def url_to_local_path(loc: str) -> Path | None:
    """Map a sitemap URL to a local HTML file under SITE_ROOT (best effort)."""
    parsed = urlparse(loc)
    path = parsed.path
    if path.endswith("/") or path == "":
        candidate = SITE_ROOT / path.lstrip("/") / "index.html"
    else:
        candidate = SITE_ROOT / path.lstrip("/")
        if not candidate.exists() and not candidate.suffix:
            candidate = candidate.with_suffix(".html")
    return candidate if candidate.exists() else None


def effective_mtime(entry: dict) -> datetime | None:
    """Return the most authoritative modification datetime for a sitemap entry."""
    if entry["lastmod"] is not None:
        return entry["lastmod"]
    local = url_to_local_path(entry["loc"])
    if local is not None:
        return datetime.fromtimestamp(local.stat().st_mtime, tz=timezone.utc)
    return None


def filter_recent(entries: list[dict], window_hours: int) -> list[str]:
    cutoff = datetime.now(tz=timezone.utc) - timedelta(hours=window_hours)
    out: list[str] = []
    for e in entries:
        mt = effective_mtime(e)
        if mt is None:
            continue
        if mt >= cutoff:
            out.append(e["loc"])
    return out


# --- HTTP helpers --------------------------------------------------------

def _request_with_retry(method: str, url: str, logger: logging.Logger, **kw) -> requests.Response | None:
    headers = kw.pop("headers", {}) or {}
    headers.setdefault("User-Agent", USER_AGENT)
    for attempt in (1, 2):
        try:
            resp = requests.request(method, url, timeout=HTTP_TIMEOUT, headers=headers, **kw)
        except requests.RequestException as exc:
            logger.warning(f"{method} {url} attempt {attempt}: exception {exc!r}")
            if attempt == 2:
                return None
            time.sleep(2)
            continue
        if 500 <= resp.status_code < 600:
            logger.warning(f"{method} {url} attempt {attempt}: HTTP {resp.status_code}")
            if attempt == 2:
                return resp
            time.sleep(2)
            continue
        return resp
    return None


# --- Pings ---------------------------------------------------------------

def ping_google(logger: logging.Logger, dry_run: bool) -> None:
    url = GOOGLE_PING + quote(SITEMAP_URL, safe="")
    if dry_run:
        logger.info(f"[dry-run] GET {url}")
        return
    resp = _request_with_retry("GET", url, logger)
    if resp is None:
        logger.error("Google ping: no response after retries")
        return
    body = (resp.text or "")[:200].replace("\n", " ")
    logger.info(f"Google ping: HTTP {resp.status_code} body='{body}'")


def ping_bing(logger: logging.Logger, dry_run: bool) -> None:
    url = BING_PING + quote(SITEMAP_URL, safe="")
    if dry_run:
        logger.info(f"[dry-run] GET {url}")
        return
    resp = _request_with_retry("GET", url, logger)
    if resp is None:
        logger.error("Bing ping: no response after retries")
        return
    body = (resp.text or "")[:200].replace("\n", " ")
    logger.info(f"Bing ping: HTTP {resp.status_code} body='{body}'")


def ping_indexnow(urls: list[str], logger: logging.Logger, dry_run: bool) -> None:
    key = os.environ.get("INDEXNOW_KEY", "").strip()
    if not key:
        logger.warning("IndexNow: INDEXNOW_KEY env not set — skipping IndexNow submission")
        return
    if not urls:
        logger.info("IndexNow: no URLs to submit")
        return
    for batch_start in range(0, len(urls), INDEXNOW_BATCH_SIZE):
        batch = urls[batch_start:batch_start + INDEXNOW_BATCH_SIZE]
        payload = {
            "host": SITE_HOST,
            "key": key,
            "keyLocation": f"https://{SITE_HOST}/{key}.txt",
            "urlList": batch,
        }
        if dry_run:
            logger.info(f"[dry-run] POST {INDEXNOW_ENDPOINT} batch={len(batch)} urls first='{batch[0]}'")
            continue
        resp = _request_with_retry(
            "POST",
            INDEXNOW_ENDPOINT,
            logger,
            json=payload,
            headers={"Content-Type": "application/json; charset=utf-8"},
        )
        if resp is None:
            logger.error(f"IndexNow: no response after retries (batch {batch_start // INDEXNOW_BATCH_SIZE})")
            continue
        body = (resp.text or "")[:200].replace("\n", " ")
        logger.info(f"IndexNow batch {batch_start // INDEXNOW_BATCH_SIZE}: HTTP {resp.status_code} count={len(batch)} body='{body}'")


def submit_gsc(logger: logging.Logger, dry_run: bool) -> None:
    """Submit sitemap to Google Search Console via Sitemaps API (optional)."""
    creds_path = os.environ.get("GSC_SERVICE_ACCOUNT_JSON", "").strip()
    if not creds_path:
        logger.warning("GSC: GSC_SERVICE_ACCOUNT_JSON env not set — skipping GSC API submission")
        return
    if not Path(creds_path).exists():
        logger.error(f"GSC: service account JSON not found at {creds_path}")
        return
    try:
        from google.oauth2 import service_account  # type: ignore
        from googleapiclient.discovery import build  # type: ignore
        from googleapiclient.errors import HttpError  # type: ignore
    except ImportError:
        logger.error("GSC: google-api-python-client not installed. Run: pip3 install google-api-python-client google-auth")
        return

    if dry_run:
        logger.info(f"[dry-run] GSC submit sitemap={SITEMAP_URL} site=https://{SITE_HOST}/")
        return

    scopes = ["https://www.googleapis.com/auth/webmasters"]
    try:
        creds = service_account.Credentials.from_service_account_file(creds_path, scopes=scopes)
        service = build("searchconsole", "v1", credentials=creds, cache_discovery=False)
        site_url = f"https://{SITE_HOST}/"
        service.sitemaps().submit(siteUrl=site_url, feedpath=SITEMAP_URL).execute()
        logger.info(f"GSC: submitted sitemap {SITEMAP_URL} for site {site_url}")
    except HttpError as exc:
        logger.error(f"GSC HttpError: {exc}")
    except Exception as exc:  # noqa: BLE001 — surface anything unexpected in the log
        logger.error(f"GSC unexpected error: {exc!r}")


# --- Main ----------------------------------------------------------------

def main(argv: Iterable[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Ping search engines with r5tools.io sitemap updates.")
    parser.add_argument("--force", action="store_true", help="Ignore sitemap mtime state check and run anyway.")
    parser.add_argument("--full", action="store_true", help="Submit all sitemap URLs (weekly resubmit), not just recent.")
    parser.add_argument("--dry-run", action="store_true", help="Print what would be sent without making HTTP calls.")
    parser.add_argument("--with-gsc", action="store_true", help="Also call Google Search Console Sitemaps API.")
    parser.add_argument("--window-hours", type=int, default=24, help="Recent-modification window in hours (default 24).")
    args = parser.parse_args(list(argv) if argv is not None else None)

    logger = setup_logging()

    if not SITEMAP_FILE.exists():
        logger.error(f"Sitemap missing at {SITEMAP_FILE}")
        return 2

    sitemap_mtime = SITEMAP_FILE.stat().st_mtime
    state = load_state()
    last_mtime = state.get("last_sitemap_mtime", 0.0)

    if not args.force and sitemap_mtime <= last_mtime:
        logger.info(f"Sitemap unchanged since last run (mtime={sitemap_mtime}); skipping. Use --force to override.")
        return 0

    logger.info(f"Sitemap: {SITEMAP_FILE} mtime={sitemap_mtime}")
    entries = parse_sitemap(SITEMAP_FILE)
    logger.info(f"Parsed {len(entries)} sitemap entries")

    if args.full:
        urls_for_indexnow = [e["loc"] for e in entries]
        logger.info(f"--full: submitting all {len(urls_for_indexnow)} URLs to IndexNow")
    else:
        urls_for_indexnow = filter_recent(entries, args.window_hours)
        logger.info(f"Recent (<= {args.window_hours}h): {len(urls_for_indexnow)} URLs")

    # 1. Google + Bing legacy ping — always fire on sitemap change
    ping_google(logger, args.dry_run)
    ping_bing(logger, args.dry_run)

    # 2. IndexNow — only if we have URLs
    ping_indexnow(urls_for_indexnow, logger, args.dry_run)

    # 3. GSC API — opt-in
    if args.with_gsc:
        submit_gsc(logger, args.dry_run)

    if not args.dry_run:
        state["last_sitemap_mtime"] = sitemap_mtime
        state["last_run_utc"] = datetime.now(tz=timezone.utc).isoformat()
        state["last_urls_submitted"] = len(urls_for_indexnow)
        save_state(state)

    logger.info("Done.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
