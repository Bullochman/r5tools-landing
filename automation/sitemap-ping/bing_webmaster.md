# Bing Webmaster Tools — setup for r5tools.io

The IndexNow API (which we already call from `ping_sitemap.py`) covers Bing,
Yandex, Seznam, Naver, and Yep. But you still want a verified Bing Webmaster
property so you can see crawl stats, index coverage, and manually resubmit the
sitemap if something goes sideways.

## 1. Sign in

1. https://www.bing.com/webmasters/
2. Sign in with a Microsoft account. If you don't have one dedicated to r5tools,
   use your Outlook/Hotmail personal account or create a new one.

## 2. Add the property

Two options:

**Option A — import from Google Search Console (fastest, no re-verification).**
Bing offers a one-click GSC import once you sign in.

**Option B — add manually.**
1. **Add a site** → paste `https://r5tools.io/`.
2. Choose a verification method:
   - **XML file** — download `BingSiteAuth.xml`, drop it in the site root,
     commit + push, verify.
   - **Meta tag** — add `<meta name="msvalidate.01" content="...">` inside the
     `<head>` of `/Users/evanjones/claudecode/r5tools/r5tools-landing/index.html`,
     commit + push, verify.
   - **DNS CNAME** — Bing gives you a CNAME target; add it to your DNS
     provider. This is the cleanest option because it doesn't touch site files.

## 3. Submit the sitemap manually (one time)

Once verified:

1. Left nav → **Sitemaps**.
2. **Submit sitemap** → `https://r5tools.io/sitemap.xml`.
3. Bing will report status within a few minutes. It should show "Success" and
   1,398 URLs discovered.

After that first manual submission, IndexNow handles ongoing updates and you
don't need to click again.

## 4. IndexNow — nothing to do here

Bing honors IndexNow automatically for any host that hosts the key
verification file at `https://r5tools.io/<key>.txt`. That's already handled by
`generate_indexnow_key.py`. No separate Bing-side setup needed.

## 5. (Optional) Bing Webmaster API key

If you want programmatic sitemap submission specifically to Bing (in addition
to IndexNow), Bing offers an API key:

1. **Settings (gear icon) → API access → Generate**.
2. Copy the key.
3. Export it:

       export BING_WEBMASTER_API_KEY=<key>

4. That's a nice-to-have; `ping_sitemap.py` does not currently use it because
   IndexNow already covers Bing. Wire it in if IndexNow ever misbehaves.

## Notes

- Bing crawl budget for a new domain is much smaller than Google's — expect
  discovery to lag GSC by a week or two.
- Bing does not currently support Domain-scope verification the way GSC does.
  You verify `https://r5tools.io/` specifically; `www.r5tools.io` would be a
  second property. Since the site canonicalizes to the apex, only add the apex.
