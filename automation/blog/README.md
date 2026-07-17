# r5tools blog + newsletter engine

Content velocity for compound SEO. Blog posts → cross-posted to X + Discord → weekly digest email.

Everything lives in this directory. The published site lives at `/blog/` in the r5tools-landing repo root.

## What's in here

```
automation/blog/
├── build_blog.py            # markdown -> HTML, generates index + feed + JSON-LD
├── cross-post.py            # after build, drafts X thread + Discord post
├── cross-post-config.yaml   # per-channel toggles + schedule times
├── POST-TEMPLATE.md         # starter frontmatter + suggested structure
├── writing-guide.md         # voice, tone, sourcing rules, publish checklist
├── topic-backlog.md         # 20 pre-researched post ideas ranked by SEO
├── README.md                # this file
├── posts/                   # source markdown, one file per post
│   ├── 2026-07-17-launching-r5tools.md
│   ├── 2026-07-18-season-2-week-1-coal-budget.md
│   ├── 2026-07-20-landing-coords-r5s-miss.md
│   └── 2026-07-22-warlord-missile-math.md
├── newsletter/
│   ├── weekly-digest-builder.py    # Sunday cron; SMTP send to newsletter tag
│   └── digest-extras.json          # optional weekly hand-curated tip + new tools
├── templates/               # (empty for now — HTML rendered by build_blog.py directly)
└── logs/
    ├── build.jsonl          # per-build entries: writes + validation warnings
    └── (crosspost.jsonl and digest-sends.jsonl created on first use)
```

Published output lands at:
```
r5tools-landing/blog/
├── index.html                       # blog index (paginated if > 20 posts)
├── feed.xml                         # RSS 2.0
├── sitemap-blog.xml                 # sitemap fragment
├── page/2.html                      # older pages if paginated
└── YYYY/MM/<slug>.html              # individual post pages
```

Plus per-language mirrors: `/ko/blog/…`, `/ja/blog/…`, `/pt/blog/…`, `/es/blog/…`.

## Install

```bash
# From this directory:
pip install jinja2 pyyaml markdown
```

`build_blog.py` runs on stdlib alone if `pyyaml` / `markdown` are missing, but the fallback markdown renderer is smaller (no footnotes / definition lists). Install the deps for the full experience — total install is under 500 KB.

The newsletter builder needs stdlib only. Cross-post needs `pyyaml` (for the config file) and the sibling `typefully_client.py` (already present in `../typefully/`).

## Write a new post

1. Copy the template:
   ```bash
   cp POST-TEMPLATE.md posts/$(date +%Y-%m-%d)-<slug>.md
   ```
2. Fill in frontmatter (title, description, seo_keywords, tags).
3. Write the body per `writing-guide.md`. Minimum 500 words or the builder refuses to publish.
4. Flip `draft: false` when ready.
5. Build + verify:
   ```bash
   python3 build_blog.py --check
   ```
   Non-zero exit if any validation problem (missing tags, short description, thin content, etc.).

The filename convention is `YYYY-MM-DD-<slug>.md`. The date in the filename is only used to derive the default slug — the real publish date lives in the frontmatter's `date:` field.

### Translations

Add a second file with the same slug and a lang suffix in the filename:

```
posts/2026-07-18-season-2-week-1-coal-budget.md       # en
posts/2026-07-18-season-2-week-1-coal-budget.ko.md    # ko (same slug, same date, translated body)
```

The builder auto-emits `hreflang` alternates when it sees multiple langs for the same slug, so Google routes each variant correctly.

## Build the blog

```bash
# Build everything
python3 build_blog.py

# Build one post (useful while editing)
python3 build_blog.py --post launching-r5tools

# Show what would change without writing
python3 build_blog.py --dry-run

# Fail on validation warnings — for CI
python3 build_blog.py --check
```

The builder is **idempotent**: rebuilding with no source changes writes zero files. Safe to wire into a git-post-commit hook, cron, or GitHub Actions.

Under the hood:
- Reads every `*.md` in `posts/`.
- Renders each to `/blog/YYYY/MM/<slug>.html`.
- Regenerates `/blog/index.html` (+ `page/N.html` if > 20 posts).
- Regenerates `/blog/feed.xml` (RSS 2.0 with `content:encoded`).
- Regenerates `/blog/sitemap-blog.xml`.
- Injects `Article` + `BreadcrumbList` JSON-LD, OG tags, Twitter Card meta.
- Injects the analytics block + founding-widget the rest of the site uses.
- Auto-generates a "Related posts" section (3-5 posts with matching tags, same language).

## Cross-post to X + Discord

After `build_blog.py`, run:

```bash
# Cross-post everything not yet posted (state kept in crosspost-state.json)
python3 cross-post.py

# Cross-post one specific slug
python3 cross-post.py --post warlord-missile-math

# Re-post one even if state says it went out
python3 cross-post.py --post warlord-missile-math --force

# Skip a channel
python3 cross-post.py --skip x

# Dry run — show what would happen, don't call APIs
python3 cross-post.py --dry-run
```

Config lives in `cross-post-config.yaml`:
- **x**: creates a 3-tweet thread in Typefully (hook + takeaway + CTA), scheduled for 19:00 America/Chicago (edit if you want a different slot).
- **discord**: drops a markdown file into `../discord-bot/content/blog-<slug>.md` — the r5tools bot picks it up on its next poll and posts to `#announcements`.
- **newsletter**: no-op except for state tracking; the weekly digest builder auto-picks any post from the past 7 days.

### Wire it into the build

The simplest publish loop:

```bash
python3 build_blog.py && python3 cross-post.py
```

Or set up a post-commit hook: `.git/hooks/post-commit` that runs both commands when it detects a change in `automation/blog/posts/`.

### Required env for actual sending

- `TYPEFULLY_API_KEY` — from Typefully Settings → Integrations → API.
- `DISCORD_BOT_TOKEN` — already handled by the r5tools bot; cross-post just writes a file for it to consume.

## Schedule the weekly digest

The digest builder auto-picks posts published in the current ISO week (Mon..Sun) and sends to every subscriber tagged `newsletter` in the drip subscribers JSONL.

```bash
# Dry run — render, don't send
python3 newsletter/weekly-digest-builder.py --dry-run

# Send a test to one address
python3 newsletter/weekly-digest-builder.py --test evan@r5tools.io

# Actual send (uses SMTP env vars)
python3 newsletter/weekly-digest-builder.py

# Send a past week (uses posts dated in that ISO week)
python3 newsletter/weekly-digest-builder.py --week 2026-07-13

# Force a specific subject variant (default: rotates by ISO week)
python3 newsletter/weekly-digest-builder.py --subject-variant b
```

### Subject A/B variants

Three variants per week, deterministic rotation by ISO week number. Override with `--subject-variant a|b|c`.

- **a**: `r5tools week {N}: {top post title}`
- **b**: `[r5tools] {top post title}`
- **c**: `{top post title} — plus {N-1} more from this week`

### Cron

Every Sunday, 10 AM Central (= 15:00 UTC year-round; live with the DST drift):

```cron
# r5tools weekly digest — Sunday 10 AM Central (15:00 UTC)
0 15 * * SUN cd /path/to/r5tools-landing/automation/blog/newsletter && /usr/bin/python3 weekly-digest-builder.py >> logs/cron.log 2>&1
```

### Required env

Same as `../marketing/emails/send_drip.py`:

- `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` — required.
- `SMTP_PORT`, `SMTP_SSL` — optional; defaults to 587/STARTTLS.
- `FROM_EMAIL` (default `evan@r5tools.io`), `FROM_NAME` (default `Evan @ r5tools`).
- `SERVER_SECRET` — HMAC secret for unsubscribe tokens. Must match the LWS_Access_Codes server's `SERVER_SECRET` so tokens verify server-side.
- `SUBSCRIBERS_FILE` — path override for `drip_subscribers.jsonl` (default: sibling `LWS_Access_Codes/logs/drip_subscribers.jsonl`).
- `NEWSLETTER_TAG` — tag filter (default `newsletter`).

### Weekly extras

Drop a `newsletter/digest-extras.json` file to inject a "tip of the week" + "new tools" section into the digest:

```json
{
  "tip": {
    "lang": "en",
    "title": "Pre-load your overdrive coal before every blizzard",
    "body_md": "The 15-minute window before a scheduled blizzard is when the alliance stockpile should hit its Overdrive target — 500k+ minimum. Members who donate coal in the pre-blizzard window burn cheaper than members who donate mid-blizzard."
  },
  "new_tools": [
    {"name": "Blizzard Countdown Widget", "url": "https://…", "blurb": "Ambient chat widget for #officers."}
  ]
}
```

The file is optional — the digest sends fine without it.

## Newsletter signup

**Dedicated page:** `/newsletter-signup.html` at the site root (EN + KR + JA + PT + ES via URL prefix + auto-detect).

**Footer widget:** Every blog post renders a footer widget that POSTs to `/api/drip/subscribe` with `tag: "newsletter"`. No extra wiring — the widget is baked into the post template.

Subscribers are stored in the same JSONL as the 7-day drip; the `tag: "newsletter"` distinguishes them. The digest builder filters on that tag.

## Publishing checklist

Before every real send:

1. `python3 build_blog.py --check` (non-zero exit fails the check).
2. Open the rendered post in a browser: `open ../../blog/YYYY/MM/<slug>.html`.
3. Read it out loud. If it sounds like marketing, rewrite.
4. Verify every link works.
5. Commit: `git commit -m "blog: <slug>"`.
6. Deploy (however you push the site — this component doesn't manage deployment).
7. Cross-post: `python3 cross-post.py --post <slug> --dry-run` first, then without `--dry-run` when the previews look right.

## Retention rules for this component

- **Never publish a post under 500 words.** Builder enforces.
- **Every claim traceable to KB or observed data.** No vibes-based writing. If you can't cite it, delete it.
- **No fabricated alliance or player names.** Composite/anonymized OK if labeled as such at the top of the story.
- **Every post gets canonical URL + JSON-LD + OG + Twitter Card.** Builder handles this automatically.
- **Every post gets tags reused from the vocabulary in writing-guide.md.** New tags dilute the "Related posts" signal — avoid unless the topic really doesn't fit.
- **Idempotency is load-bearing.** The builder is safe to run on every commit; the cross-poster is safe to run on every deploy. Do not break this without a very good reason.
