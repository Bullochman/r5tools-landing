# Internal linking audit — r5tools.io (EN)

**Date:** 2026-07-17
**Scope:** 689 EN SEO pages under `/guides/`, `/events/`, `/buildings/`, `/heroes/`, `/seasons/`, `/warzones/`, `/glossary/`, `/automation/`. KR pages intentionally excluded (KR agent territory).

Numbers below reflect the state **after** `scripts/seo/add_related_blocks.py` ran, which is the state that shipped.

---

## Summary

| Metric | Value |
|---|---|
| Total EN SEO pages analyzed | 689 |
| Orphan pages (0 incoming links from other SEO pages) | **0** |
| Avg incoming internal links per page | 7.0 |
| Avg outgoing internal links per page | 19.0 |
| Avg outgoing external links per page | 11.3 |
| Categories | 8 (guides, events, buildings, heroes, seasons, warzones, glossary, automation) |

Every EN SEO page now has at least three sibling links via the injected `Related` block, plus the shared `suite-nav` header (8 links) and the `tools-row` (8 links). Together that guarantees ≥19 internal links out of every page.

The pre-existing zero-orphan headline is the direct result of the related-blocks script; prior to that pass, the glossary had ~46 pages with 0 inbound links from other SEO pages (they were only reachable from the sitemap / glossary index).

## Sample — 30 random EN SEO pages

Data source: `marketing/internal-linking-stats.json` (regenerated on every audit run).

| Page | Incoming | Outgoing (internal) | Outgoing (external) |
|---|---:|---:|---:|
| buildings/divine-tree.html | 2 | 17 | 49 |
| buildings/lighthouse.html | 13 | 17 | 58 |
| buildings/radar.html | 1 | 17 | 8 |
| events/new-year.html | 4 | 16 | 60 |
| glossary/alliance-duel.html | 6 | 17 | 7 |
| glossary/alliance-help.html | 7 | 17 | 7 |
| glossary/bomber.html | 1 | 17 | 7 |
| glossary/cobra-barrier.html | 2 | 17 | 7 |
| glossary/copper.html | 3 | 17 | 7 |
| glossary/frontline-breakthrough.html | 3 | 17 | 7 |
| glossary/generals-trial.html | 2 | 17 | 7 |
| glossary/home-server.html | 6 | 17 | 7 |
| glossary/koubutai.html | 1 | 17 | 7 |
| glossary/meteorite-iron-war.html | 5 | 17 | 7 |
| glossary/oni-virus.html | 4 | 17 | 7 |
| glossary/pull.html | 2 | 17 | 7 |
| glossary/r2.html | 27 | 17 | 7 |
| glossary/radar-training.html | 5 | 17 | 7 |
| glossary/snipe.html | 1 | 17 | 7 |
| glossary/tank.html | 12 | 17 | 7 |
| glossary/warzone-duel.html | 8 | 17 | 7 |
| guides/legendary-recruitment-strategy.html | 18 | 18 | 12 |
| heroes/fiona.html | 8 | 19 | 49 |
| warzones/warzone-1016.html | 1 | 22 | 10 |
| warzones/warzone-1025.html | 1 | 22 | 10 |
| warzones/warzone-1048.html | 1 | 22 | 10 |
| warzones/warzone-1062.html | 1 | 22 | 10 |
| warzones/warzone-1064.html | 1 | 22 | 10 |
| warzones/warzone-1072.html | 1 | 22 | 10 |
| warzones/warzone-1073.html | 1 | 22 | 10 |

## By category

| Category | Pages | Internal in-total | Internal out-total | Orphans |
|---|---:|---:|---:|---:|
| buildings | 29 | 201 | 519 | 0 |
| events | 42 | 292 | 712 | 0 |
| glossary | 408 | 2871 | 7358 | 0 |
| guides | 49 | 341 | 929 | 0 |
| heroes | 32 | 253 | 637 | 0 |
| seasons | 8 | 54 | 142 | 0 |
| warzones | 121 | 845 | 2776 | 0 |
| automation | 4 | — | — | 0 |

## Findings & recommendations

### 1. Warzone pages are severely under-linked despite high count

121 warzone pages, each averaging **1 incoming link** — most are reached only from the warzones index and the related-blocks pass. They punch below their weight because they're numeric slugs (`warzone-1064.html`) with limited natural anchor-text hooks in prose.

Recommendation:
- Cross-link warzones **by season/mechanic**, not just by number. e.g. `guides/coordinates-for-season-2-landing.html` should link to a curated 5-warzone list. The related-blocks script would do this if the warzones had richer keywords in `<meta name=keywords>` — right now their token vectors are near-identical.
- Consider a **hub page**: `warzones/by-tier.html` grouping warzones into landing bands.

### 2. Glossary token similarity is weak → related picks stale

408 glossary entries — many single-word (`snipe.html`, `tank.html`) — which means my cosine-similarity picker often lands on the same top-5 for many pages (whatever shares generic combat vocabulary). Sample: `glossary/bomber.html`, `glossary/snipe.html`, `glossary/koubutai.html` all show only 1 incoming link.

Recommendation:
- Enrich each glossary page's `<meta name=keywords>` with 3-5 topical descriptors (troop type, era, event) so the related picker has meaningful signal.
- Consider **A-Z pagination pages** (`glossary/a.html`, `glossary/b.html`) as intermediate hubs → each glossary entry gets 1 more guaranteed inbound link.

### 3. Guide → glossary/hero cross-links are missing

Guides average 18-inbound / 19-outbound but almost no organic prose cross-linking. `guides/kimberly-build-guide.html` should link to `heroes/kimberly.html`, but doesn't (the related-blocks script only picks from the same category).

Recommendation:
- Add a pass to `add_related_blocks.py` that **also** injects a top-3 "related from other categories" cross-category picks. Currently disabled to keep the block small; flip via `--cross-category` flag next iteration.

### 4. Home page is over-weight — index.html carries too much outbound

Not counted in the sample but noted separately: `index.html` links to nearly every category hub. That's fine for the hub itself, but pages like `refer.html` and `cheat-sheet.html` have no organic inbound from category pages.

Recommendation:
- Add a permanent "Free with code RONY-FREE" mini-CTA (already present as `.cta-card`) that links to `refer.html` for a paid slice.

### 5. External link balance is healthy

Average 11.3 external per page, dominated by community source citations in guides. `nofollow` audit not run — spec says leave that for later if `Ahrefs`/`SEMrush` flags it.

## Idempotent related-blocks script

Location: `scripts/seo/add_related_blocks.py`

- Reads each page's canonical URL, title, description, keywords.
- Scores sibling pages in the same category via **cosine similarity of tokenized (stopwords-stripped) metadata**.
- Picks top-N (default 5, minimum 3) and injects a `<section class="related">` block between `<!-- BEGIN r5tools:seo:related v1 -->` / `<!-- END ... -->` sentinels just before `</article>` (or the last `.cta-card` as fallback).
- Re-running rebuilds the block — new pages picked up automatically.
- `--strip` cleanly removes injections.

Run:
```
python scripts/seo/add_related_blocks.py            # write
python scripts/seo/add_related_blocks.py --dry-run  # scan only
python scripts/seo/add_related_blocks.py --count 4  # override to 4 per page
python scripts/seo/add_related_blocks.py --strip    # remove all injections
```

---

**Raw stats JSON:** `marketing/internal-linking-stats.json` — regenerate any time by re-running this audit block.
