# Google Search Console — programmatic sitemap submission setup

The `--with-gsc` flag on `ping_sitemap.py` uses the Search Console Sitemaps API
to formally re-submit `sitemap.xml`. That path is the closest thing Google
still officially supports for triggering a re-crawl (the old `/ping` URL is
deprecated). One-time setup below.

## 1. Verify the property in Search Console

1. Open https://search.google.com/search-console/
2. Add property → **Domain** (not URL-prefix): `r5tools.io`
3. Google will give you a `TXT` record like `google-site-verification=abc123...`.
4. Add that as a DNS TXT record at the apex of `r5tools.io` (Cloudflare / your
   DNS provider). Wait a few minutes, click **Verify**.

Note: Domain-property verification covers `https://r5tools.io/`, all
subdomains, and both http/https — this is what we want.

## 2. Enable the Search Console API in Google Cloud

1. https://console.cloud.google.com/
2. Create or reuse a project. If reusing an existing one, note the project ID.
3. **APIs & Services → Library** → search "Search Console API" → **Enable**.

## 3. Create a service account + JSON key

1. **APIs & Services → Credentials** → **Create Credentials → Service account**.
2. Name it something like `r5tools-sitemap-ping`. No project role needed
   (Search Console permissions are granted separately, in step 4).
3. Click **Done**.
4. Open the new service account → **Keys** tab → **Add key → Create new key → JSON**.
5. A JSON file downloads. Move it somewhere safe, e.g.:
       mv ~/Downloads/r5tools-sitemap-ping-*.json ~/.config/r5tools/gsc-service-account.json
       chmod 600 ~/.config/r5tools/gsc-service-account.json

## 4. Grant the service account access to the Search Console property

1. Back in Search Console (https://search.google.com/search-console/), select
   the `r5tools.io` property.
2. **Settings → Users and permissions → Add user**.
3. Paste the service account email (looks like
   `r5tools-sitemap-ping@<project-id>.iam.gserviceaccount.com`).
4. Permission: **Owner** (Full is required for the Sitemaps API `submit` call
   on domain properties; Restricted is not enough).

## 5. Install the Python client

    pip3 install google-api-python-client google-auth

## 6. Export the env var

    export GSC_SERVICE_ACCOUNT_JSON=~/.config/r5tools/gsc-service-account.json

Add that line to `~/.zshrc` so it persists.

**Open a new terminal for this** — env vars set in one shell don't leak into
your existing terminals.

## 7. Verify end-to-end

    cd /Users/evanjones/claudecode/r5tools/r5tools-landing/automation/sitemap-ping
    python3 ping_sitemap.py --dry-run --with-gsc

You should see a line like:

    [dry-run] GSC submit sitemap=https://r5tools.io/sitemap.xml site=https://r5tools.io/

Then a live run:

    python3 ping_sitemap.py --force --with-gsc

Expect a `GSC: submitted sitemap ...` INFO line and no HttpError.

## Troubleshooting

- **403 permission denied** — service account isn't Owner on the property. Re-add in step 4.
- **404 site not found** — property was added as URL-prefix instead of Domain. Recreate as Domain.
- **Unable to fetch credentials** — path in `GSC_SERVICE_ACCOUNT_JSON` is wrong; it must be absolute and readable.
- **Google API discovery errors** — behind a proxy? Set `HTTPS_PROXY` and retry.
