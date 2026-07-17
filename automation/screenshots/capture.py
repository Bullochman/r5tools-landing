#!/usr/bin/env python3
"""
capture.py — Weekly screenshot capture for r5tools tools + landing pages.

Reads targets.yaml, loads each URL in headless Chromium via Playwright,
dismisses common cookie/consent banners, waits for a selector, and saves
both a viewport-sized and a full-page PNG to:
    latest/<name>.png
    latest/<name>-full.png
    history/YYYY-MM-DD/<name>.png
    history/YYYY-MM-DD/<name>-full.png

Rotates history: keeps 12 most-recent dated snapshot folders, deletes older.
Skips URLs that 404 (logs + continues).

Usage:
    python3 capture.py                    # full run
    python3 capture.py --dry-run          # print targets, don't launch browser
    python3 capture.py --only NAME        # single target by name
    python3 capture.py --targets file.yml # alternate targets file
"""

from __future__ import annotations

import argparse
import datetime as dt
import io
import shutil
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
DEFAULT_TARGETS = HERE / "targets.yaml"
LATEST_DIR = HERE / "latest"
HISTORY_DIR = HERE / "history"
LOG_DIR = HERE / "logs"

HISTORY_KEEP_WEEKS = 12
PAGE_TIMEOUT_MS = 30_000
MAX_FILE_BYTES = 500 * 1024  # aggressive re-encode threshold

COOKIE_SELECTORS = [
    'button:has-text("Accept all")',
    'button:has-text("Accept All")',
    'button:has-text("Accept")',
    'button:has-text("I agree")',
    'button:has-text("Got it")',
    'button:has-text("OK")',
    'button:has-text("Close")',
    'button[aria-label="Close"]',
    'button[aria-label="close"]',
    '#onetrust-accept-btn-handler',
    '.cookie-accept',
    '.cc-btn.cc-accept-all',
    '.cc-dismiss',
]


def log(msg: str, logfile) -> None:
    line = f"[{dt.datetime.now().isoformat(timespec='seconds')}] {msg}"
    print(line, flush=True)
    logfile.write(line + "\n")
    logfile.flush()


def try_import_playwright():
    try:
        from playwright.sync_api import sync_playwright  # noqa: F401
        return True, None
    except ImportError as e:
        return False, e


def try_import_yaml():
    try:
        import yaml  # noqa: F401
        return True
    except ImportError:
        return False


def load_targets(path: Path) -> list[dict]:
    import yaml
    with path.open() as f:
        data = yaml.safe_load(f) or []
    normalized = []
    for i, t in enumerate(data):
        if not isinstance(t, dict) or "url" not in t or "name" not in t:
            print(f"warn: target #{i} missing url/name, skipping: {t!r}", file=sys.stderr)
            continue
        vp = t.get("viewport") or [1440, 900]
        normalized.append({
            "url": t["url"],
            "name": t["name"],
            "viewport": {"width": int(vp[0]), "height": int(vp[1])},
            "wait_for_selector": t.get("wait_for_selector", "body"),
            "wait_after_ms": int(t.get("wait_after_ms", 800)),
            "hover_selector": t.get("hover_selector"),
            "click_selector": t.get("click_selector"),
            "full_page": bool(t.get("full_page", True)),
            "viewport_only": bool(t.get("viewport_only", False)),
        })
    return normalized


def dismiss_banners(page) -> None:
    for sel in COOKIE_SELECTORS:
        try:
            btn = page.locator(sel).first
            if btn.is_visible(timeout=250):
                btn.click(timeout=1000)
                page.wait_for_timeout(200)
        except Exception:
            pass


def maybe_reencode(png_bytes: bytes, max_bytes: int = MAX_FILE_BYTES) -> bytes:
    """If PNG is over the size cap, re-save through Pillow with optimize=True.
    Falls back to original bytes if Pillow isn't available or re-encode grows."""
    if len(png_bytes) <= max_bytes:
        return png_bytes
    try:
        from PIL import Image
    except ImportError:
        return png_bytes
    try:
        img = Image.open(io.BytesIO(png_bytes))
        # Convert to palette mode for large screenshots — huge compression win,
        # negligible visual loss for UI shots.
        buf = io.BytesIO()
        img.convert("P", palette=Image.ADAPTIVE, colors=256).save(
            buf, format="PNG", optimize=True
        )
        out = buf.getvalue()
        return out if len(out) < len(png_bytes) else png_bytes
    except Exception:
        return png_bytes


def capture_target(page, target: dict, out_paths: list[Path], logfile) -> bool:
    url = target["url"]
    name = target["name"]
    page.set_viewport_size(target["viewport"])

    try:
        resp = page.goto(url, timeout=PAGE_TIMEOUT_MS, wait_until="domcontentloaded")
    except Exception as e:
        log(f"FAIL {name}: goto error: {e}", logfile)
        return False

    if resp is None:
        log(f"WARN {name}: no response object for {url}", logfile)
    else:
        status = resp.status
        if status == 404 or status >= 500:
            log(f"SKIP {name}: HTTP {status} for {url}", logfile)
            return False

    dismiss_banners(page)

    try:
        page.wait_for_selector(target["wait_for_selector"], timeout=PAGE_TIMEOUT_MS)
    except Exception as e:
        log(f"WARN {name}: wait_for_selector '{target['wait_for_selector']}' failed: {e}", logfile)

    if target["wait_after_ms"]:
        page.wait_for_timeout(target["wait_after_ms"])

    if target["hover_selector"]:
        try:
            page.hover(target["hover_selector"], timeout=3000)
            page.wait_for_timeout(300)
        except Exception as e:
            log(f"WARN {name}: hover failed: {e}", logfile)

    if target["click_selector"]:
        try:
            page.click(target["click_selector"], timeout=3000)
            page.wait_for_timeout(500)
        except Exception as e:
            log(f"WARN {name}: click failed: {e}", logfile)

    # Viewport shot
    try:
        vp_bytes = page.screenshot(full_page=False, type="png")
        vp_bytes = maybe_reencode(vp_bytes)
        for base in out_paths:
            base.parent.mkdir(parents=True, exist_ok=True)
            (base.parent / f"{name}.png").write_bytes(vp_bytes)
    except Exception as e:
        log(f"FAIL {name}: viewport screenshot: {e}", logfile)
        return False

    # Full-page shot
    if target["full_page"] and not target["viewport_only"]:
        try:
            fp_bytes = page.screenshot(full_page=True, type="png")
            fp_bytes = maybe_reencode(fp_bytes)
            for base in out_paths:
                (base.parent / f"{name}-full.png").write_bytes(fp_bytes)
        except Exception as e:
            log(f"WARN {name}: full-page screenshot: {e}", logfile)

    log(f"OK   {name} ({len(vp_bytes)//1024} KB viewport)", logfile)
    return True


def rotate_history(keep: int = HISTORY_KEEP_WEEKS) -> None:
    if not HISTORY_DIR.exists():
        return
    dated = sorted(
        (p for p in HISTORY_DIR.iterdir() if p.is_dir()),
        reverse=True,
    )
    for old in dated[keep:]:
        shutil.rmtree(old, ignore_errors=True)


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--targets", type=Path, default=DEFAULT_TARGETS)
    ap.add_argument("--only", help="capture a single target by name")
    ap.add_argument("--dry-run", action="store_true", help="print targets and exit")
    args = ap.parse_args()

    if not try_import_yaml():
        print("error: pyyaml not installed. Run: pip install pyyaml", file=sys.stderr)
        return 2

    if not args.targets.exists():
        print(f"error: targets file not found: {args.targets}", file=sys.stderr)
        return 2

    targets = load_targets(args.targets)
    if args.only:
        targets = [t for t in targets if t["name"] == args.only]
        if not targets:
            print(f"error: no target named {args.only!r}", file=sys.stderr)
            return 2

    if args.dry_run:
        print(f"{len(targets)} target(s):")
        for t in targets:
            print(f"  {t['name']:24s}  {t['url']}  {t['viewport']['width']}x{t['viewport']['height']}")
        return 0

    ok, err = try_import_playwright()
    if not ok:
        print("error: playwright not installed.", file=sys.stderr)
        print("  Fix: pip install playwright && playwright install chromium", file=sys.stderr)
        print(f"  ({err})", file=sys.stderr)
        return 2

    from playwright.sync_api import sync_playwright

    today = dt.date.today().isoformat()
    LATEST_DIR.mkdir(parents=True, exist_ok=True)
    HISTORY_DIR.mkdir(parents=True, exist_ok=True)
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    history_today = HISTORY_DIR / today
    history_today.mkdir(parents=True, exist_ok=True)

    logpath = LOG_DIR / f"capture-{today}.log"
    with logpath.open("a") as logfile:
        log(f"=== capture run start ({len(targets)} targets) ===", logfile)

        try:
            with sync_playwright() as p:
                try:
                    browser = p.chromium.launch(headless=True)
                except Exception as e:
                    log(f"FATAL: chromium launch failed: {e}", logfile)
                    print("Chromium binary missing? Run: playwright install chromium", file=sys.stderr)
                    return 3

                context = browser.new_context(
                    viewport={"width": 1440, "height": 900},
                    device_scale_factor=1,
                    user_agent=(
                        "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_0) "
                        "AppleWebKit/537.36 (KHTML, like Gecko) "
                        "Chrome/122.0.0.0 Safari/537.36 r5tools-screenshot-bot/1.0"
                    ),
                    ignore_https_errors=True,
                )
                page = context.new_page()
                page.set_default_timeout(PAGE_TIMEOUT_MS)

                ok_count = 0
                fail_count = 0
                for t in targets:
                    if capture_target(page, t, [LATEST_DIR / t["name"], history_today / t["name"]], logfile):
                        ok_count += 1
                    else:
                        fail_count += 1

                context.close()
                browser.close()

            rotate_history()
            log(f"=== done: {ok_count} ok / {fail_count} fail ===", logfile)
            return 0 if fail_count == 0 else 1

        except Exception as e:
            log(f"FATAL: {e}", logfile)
            return 4


if __name__ == "__main__":
    sys.exit(main())
