# Schema.org enhancement audit — r5tools.io

**Date:** 2026-07-17
**Scope:** EN pages under `r5tools-landing/`. KR pages (`/ko/*`) intentionally excluded — KR-hero-rebuild agent owns those.

---

## Baseline (before this pass)

Every SEO-generated page under `guides/`, `events/`, `buildings/`, `heroes/`, `seasons/`, `warzones/`, `glossary/`, `automation/` already carried a JSON-LD `@graph` with:

- `Article` — headline, description, publisher, image, language
- `WebPage` (implicit via `mainEntityOfPage`)
- `BreadcrumbList` — 3-level (Home › Category › Page)

Verified via `grep -c 'application/ld+json'` on samples — every category returns `1` before this pass.

Homepage (`index.html`), `refer.html`, `cheat-sheet.html`, `leaderboard.html` had **no** schema. That's now fixed.

## After this pass — schema on every page type

| Page type | Schema types present | Injected by |
|---|---|---|
| index.html | SoftwareApplication (Offer, publisher, featureList) | `add_softwareapplication_schema.py` |
| refer.html | SoftwareApplication | `add_softwareapplication_schema.py` |
| cheat-sheet.html | SoftwareApplication | `add_softwareapplication_schema.py` |
| leaderboard.html | SoftwareApplication | `add_softwareapplication_schema.py` |
| guides/*-guide.html | Article + BreadcrumbList + **HowTo** | `build_seo_pages.py` (baseline) + `add_howto_schema.py` |
| guides/how-to-*.html | Article + BreadcrumbList + **HowTo** | same |
| guides/*.html (non-guide) | Article + BreadcrumbList | baseline |
| events/*.html | Article + BreadcrumbList | baseline |
| buildings/*.html | Article + BreadcrumbList | baseline |
| heroes/*.html | Article + BreadcrumbList | baseline |
| seasons/*.html | Article + BreadcrumbList | baseline |
| warzones/*.html | Article + BreadcrumbList | baseline |
| glossary/*.html | Article + BreadcrumbList | baseline |
| automation/*.html | Article + BreadcrumbList | baseline |

## Scripts delivered

All idempotent (BEGIN/END sentinel comments). All emit `--dry-run` and `--strip` modes. All validate JSON via `json.loads` round-trip (equivalent to `python -m json.tool`).

| Script | Effect | Pages touched (this run) |
|---|---|---:|
| `scripts/seo/add_faqpage_schema.py` | Scans for `<h2>Q:` / `<h3>Q:` / `<h[123]>Frequently Asked Questions</h[123]>` markers, emits `FAQPage` JSON-LD. Currently 0 EN pages have Q&A markup so 0 injected — script ready for the future `faq.html` and any guide FAQ sections. | 0 (scanned 693; 0 eligible) |
| `scripts/seo/add_howto_schema.py` | Slug + first-`<ol>`-with-3+-items heuristic. Emits `HowTo` with numbered `HowToStep` entries. | **18** guides |
| `scripts/seo/add_softwareapplication_schema.py` | Curated list of "tool landing" pages. Emits `SoftwareApplication` with `applicationCategory=GameApplication`, `operatingSystem=Web`, `Offer` @ free, publisher. `aggregateRating` placeholder removed at build (Google flags null ratingValue). | **4** (index, refer, cheat-sheet, leaderboard) |
| `scripts/seo/add_videoobject_schema.py` | Scaffold — scans for YouTube/TikTok embeds and emits `VideoObject`. No embeds today → no-op. Ready for future video content. | 0 (scanned 689; 0 eligible) |
| `scripts/seo/add_related_blocks.py` | (Internal linking — see `INTERNAL-LINKING-AUDIT.md`.) Same idempotent + strip contract. | 689 |

### HowTo pages injected

```
guides/alliance-furnace-guide.html        (6 steps)
guides/arms-race-daily-guide.html         (4 steps)
guides/chief-gear-guide.html              (3 steps)
guides/coal-budget-calculator-guide.html  (6 steps)
guides/desert-storm-friday-guide.html     (4 steps)
guides/doomsday-sunday-guide.html         (4 steps)
guides/ghost-ops-thursday-guide.html      (4 steps)
guides/hero-recruitment-ticket-guide.html (4 steps)
guides/home-heating-furnace-guide.html    (6 steps)
guides/how-to-plan-season-2-landing.html  (6 steps)
guides/kimberly-build-guide.html          (4 steps)
guides/season-1-antivirus-guide.html      (3 steps)
guides/season-1-corruptor-bosses-guide.html (3 steps)
guides/season-battle-pass-guide.html      (3 steps)
guides/t11-troops-guide.html              (8 steps)
guides/wall-of-honor-guide.html           (4 steps)
guides/wanted-bosses-codes-guide.html     (4 steps)
guides/warlord-missile-guide.html         (6 steps)
```

Note: `coordinates-for-season-2-landing.html` also has an ordered checklist but the slug doesn't match the `how-to-*` / `*-guide` filter — deliberately conservative so we don't over-emit HowTo for reference articles. Rename to `season-2-landing-guide.html` if you want it eligible.

## Validation

Every injected JSON-LD block round-trips through `json.loads` at build time (script raises if invalid). Spot-checked with:

```
python3 -c "
import re, json
for p in [...paths...]:
    h = open(p).read()
    for b in re.findall(r'<script type=\"application/ld\+json\">(.*?)</script>', h, re.DOTALL):
        json.loads(b)  # would raise on error
"
```

Result: 100% valid. See the schema-audit run log.

## Rich Results eligibility test — how to run

Google's automated tester at <https://search.google.com/test/rich-results> is HTML-scraper-driven, not API-driven. There is no supported curl endpoint. Workflow:

1. Deploy the changes (Vercel push or `gh-pages` build).
2. Open <https://search.google.com/test/rich-results?url=https%3A%2F%2Fr5tools.io%2Fguides%2Fhow-to-plan-season-2-landing.html>.
3. Confirm "HowTo" is listed under "Detected structured data" with 0 errors and 0 warnings.
4. Repeat for one page per schema type:
   - Article + BreadcrumbList — `https://r5tools.io/heroes/adam.html`
   - HowTo — `https://r5tools.io/guides/alliance-furnace-guide.html`
   - SoftwareApplication — `https://r5tools.io/`
   - SoftwareApplication + BreadcrumbList absence — `https://r5tools.io/refer.html`

If any warning appears (typical: "aggregateRating missing" — expected, we stripped the placeholder deliberately), document it in `SCHEMA-VALIDATION-RUN.md` when you run the manual pass.

**Alternative — Schema.org validator (headless-scrapable):**
```
curl -s "https://validator.schema.org/api/validate?url=https%3A%2F%2Fr5tools.io%2F" | jq .
```
Returns JSON with any errors/warnings per detected block. Wire this into a nightly cron once the site is stable.

## What we intentionally did NOT ship

- **Real `aggregateRating`** — placeholder stripped. Populate when there are ≥5 verified reviews (Google's minimum for star display). Wire into `SoftwareApplication` block by editing `add_softwareapplication_schema.py` and re-running.
- **Product schema on the pricing block** — this is a game-tools SaaS with mixed free/paid tiers, and the spec asks for `SoftwareApplication.offers`, not per-tier `Product`. If we introduce a hard SKU catalog, switch to `Product` with per-tier `Offer` children.
- **CollectionPage schema on category hubs** (`guides/index.html`, `heroes/index.html`, etc.) — nice-to-have but Google indexes those from anchor text alone. Deferred.
- **KR schema** — KR-hero-rebuild agent owns `/ko/*`. This pass explicitly filters them out via `if "/ko/" in str(path)`.
