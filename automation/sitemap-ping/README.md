# sitemap-ping — r5tools.io search-engine notifier

Automates telling Google, Bing, Yandex, and other IndexNow-compatible search
engines that `https://r5tools.io/sitemap.xml` has updates, so newly built or
edited SEO pages get crawled faster.

## What lives here

    ping_sitemap.py           # main script — run daily and after SEO builds
    generate_indexnow_key.py  # one-shot — create IndexNow key + verification file
    gsc_verify.md             # Google Search Console API setup
    bing_webmaster.md         # Bing Webmaster Tools setup
    crontab.example           # cron entries + post-build hook snippet
    logs/                     # ping.log + cron.log land here
    .state.json               # tracks last sitemap mtime; do not edit by hand

## Dependencies

    pip3 install requests
    # Optional (only if you want GSC API submission):
    pip3 install google-api-python-client google-auth

## First-time setup

1. **Generate an IndexNow key** (writes `<key>.txt` to the site root so IndexNow
   can verify ownership):

       cd /Users/evanjones/claudecode/r5tools/r5tools-landing/automation/sitemap-ping
       python3 generate_indexnow_key.py

   Commit the resulting `<key>.txt` to the r5tools-landing repo and deploy so
   it's live at `https://r5tools.io/<key>.txt`.

2. **Export the key**:

       export INDEXNOW_KEY=<key>

   Add it to `~/.zshrc` so cron and future shells see it. **Open a new terminal**
   after editing `~/.zshrc` — the env var isn't in your current shell yet.

3. **(Optional) Google Search Console API** — follow `gsc_verify.md`, then
   `export GSC_SERVICE_ACCOUNT_JSON=/path/to/key.json`.

4. **(Optional) Bing Webmaster Tools verification** — follow `bing_webmaster.md`
   for the one-time property verification (IndexNow itself needs nothing on
   the Bing side beyond the key file).

## Usage

    # Normal — pings recent (<= 24h) URLs to IndexNow, and the legacy Google/Bing endpoints
    python3 ping_sitemap.py

    # Bypass the mtime state guard (e.g. after a manual sitemap edit)
    python3 ping_sitemap.py --force

    # Weekly full resubmit — send every URL in sitemap.xml
    python3 ping_sitemap.py --full --force

    # Preview without hitting the network
    python3 ping_sitemap.py --dry-run

    # Include Google Search Console API (requires GSC_SERVICE_ACCOUNT_JSON)
    python3 ping_sitemap.py --with-gsc

    # Custom recency window
    python3 ping_sitemap.py --window-hours 48

## How "modified in the last 24h" is determined

The sitemap currently has no `<lastmod>` elements. For each `<url>`, the
script:

1. Uses `<lastmod>` if present in the sitemap.
2. Otherwise, maps the URL back to a local HTML file under
   `r5tools-landing/` and uses that file's mtime.
3. If neither is available, the URL is skipped for recent-only runs — but it
   will be included in `--full` weekly resubmits.

**Recommendation:** update `build_seo_pages.py` to emit `<lastmod>` tags in
`sitemap.xml` (ISO 8601 UTC). That makes the recent-window filter authoritative
regardless of local file state.

## Guardrails baked in

- **Sitemap-unchanged guard.** If `sitemap.xml` mtime hasn't advanced since
  the last successful run (recorded in `.state.json`), the script exits without
  making a single HTTP call. `--force` overrides.
- **Retry once, then continue.** Any 5xx or connection error retries once
  after 2 seconds. If still failing, it's logged and the script moves on —
  a flaky endpoint never blocks the others.
- **IndexNow batching.** Requests are chunked at 10,000 URLs each.
- **No secrets in code.** Keys and credentials come from env vars
  (`INDEXNOW_KEY`, `GSC_SERVICE_ACCOUNT_JSON`).

## Cron recommendation

- **Daily at 08:00 UTC** — recent-window ping. Cheap, covers day-to-day edits.
- **Weekly Sunday 09:00 UTC** — full resubmit with `--full --force`.
  Belt-and-suspenders for anything the daily run missed.
- **Post-build hook** — call `ping_sitemap.py` at the end of
  `build_seo_pages.py`. See the snippet at the bottom of `crontab.example`.

## Logs

- `logs/ping.log` — everything the script logs (INFO + WARNING + ERROR).
- `logs/cron.log` — cron's stdout/stderr redirect (from the `>>` in
  `crontab.example`).

Rotate manually or with the `truncate` line in `crontab.example`.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| `IndexNow: INDEXNOW_KEY env not set` | `export INDEXNOW_KEY=...` — remember cron needs it declared inline (see `crontab.example`). |
| `Sitemap unchanged since last run` | Expected when nothing rebuilt. Run with `--force` if you want to reping anyway. |
| Bing/Google returns 404/410 | Legacy `/ping` endpoints are deprecating; IndexNow + GSC API are the sanctioned paths. Non-2xx is logged and ignored. |
| `GSC: google-api-python-client not installed` | `pip3 install google-api-python-client google-auth`. |
| `logs/` empty after a run | Cron doesn't source your shell rc; PATH may be missing python3. Use `/usr/bin/python3` explicitly (as in `crontab.example`). |
