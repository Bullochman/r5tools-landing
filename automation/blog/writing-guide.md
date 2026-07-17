# r5tools blog — writing guide

Voice, tone, and rules for every post that goes live on `r5tools.io/blog/`.

## Voice

**R5 to R5.** You are not marketing to R5s — you are one, talking to peers who have the same problem. If a sentence sounds like a landing page, delete it.

Concrete markers:

- **"I / we" is fine.** "I ran the numbers on 30 alliance hives last week…" Not "R5TOOLS.IO analysts observed…"
- **Numbers before adjectives.** "1,440 coal/min" not "a lot of coal."
- **Assume competence.** The reader knows what a rally is. Don't over-explain. Do define terms that are *actually* ambiguous (Warlord Missile, Rare Soil War) with a short in-place clarification, not a whole paragraph.
- **Never call it "the game."** It's *Last War* or *LWS*.
- **No emoji in body copy.** Section headers and code blocks only if the meaning is load-bearing (a thermometer emoji in a temperature table, for example).

## Tone

**Direct. Slightly terse. Never breathless.**

Bad: "Season 2 is here, and it's changing everything!"
Good: "Season 2 opens the same way for every alliance: teleported to a corner, cold, and 12 hours from the first blizzard. What you do in that 12 hours decides whether you survive week 2."

Bad: "The Freeze Risk Dashboard is a powerful tool that helps alliance leaders…"
Good: "Freeze Risk pulls your alliance list, cross-references city coords with the blizzard schedule, and tells you who is going to be bricked at 03:00 UTC. Takes 40 seconds."

## SEO principles

1. **Title tag = primary keyword first.** "Season 2 coal budget — the L20 math nobody publishes" beats "The math behind coal budgets."
2. **Slug = short kebab-case.** `season-2-coal-budget`, not `season-2-week-1-coal-budget-analysis-full-breakdown`.
3. **Description = 150-160 chars.** Read it out loud. If it sounds like a robot wrote it, rewrite.
4. **H2s carry keywords.** Google reads them heavily. But write them for humans first — no "Section 3: SEO Keywords Placement Best Practices."
5. **Internal links = other r5tools pages first, KB pages second, tools third.** Every post should link to at least 2 other r5tools pages.
6. **Every post gets a canonical URL.** Builder handles this; don't manually override unless you're consolidating duplicates.
7. **Tags matter.** They power the "Related posts" section. Use 2-5 tags per post. Reuse the same tags across a series — that's what makes cross-linking automatic.

Common tag vocabulary (reuse these; don't invent one-offs):
`season-2` · `season-1` · `week-1` · `week-2` · `week-3` · `week-4`
`coal` · `heat` · `landing` · `hive` · `warlord-missile` · `rare-soil`
`alliance-strategy` · `officer-playbook` · `hero-drop` · `vs-days`
`meta` · `case-study` · `tool-walkthrough` · `founding-story`

## Sourcing rules

**Every claim must trace to one of:**

1. The **LWS Knowledge Base** (`~/claudecode/LWS_Knowledge_Base/`) — the source of truth for game mechanics.
2. An **r5tools tool** (roster extractor output, hive planner artifact) with the artifact linked.
3. A **specific observable event** the author witnessed, named clearly ("Warzone 2007 KR alliance hive on 2026-07-14, 04:22 UTC").
4. A **cited external source** with the URL and date pulled.

If none of those apply → don't publish the claim.

**Never fabricate alliance names or player names.** If a case study needs a named party, use one of:
- Real named party (with explicit permission from that party in writing).
- Anonymized composite with the label "**Composite case study — details combined from N alliances**" *above the story*.

## Post structure conventions

- **800-1,500 words** is the target. 500 words is the hard floor (builder refuses to publish under 500).
- **Lede paragraph** = the one-line hook + the promise of what the reader will get.
- **First H2 within 250 words.** Long unbroken text = readers bounce.
- **At least one table.** Numbers rendered as text are less scannable than numbers in a table.
- **Concrete call-to-action** near the bottom. Not "check out r5tools.io" — "open the Coal Burn Calculator, drop your L20 furnace count in, take 40 seconds."

## Frontmatter checklist

Every post must have:
- `title` — under 70 chars
- `date` — YYYY-MM-DD, the *publish* date not the write date
- `lang` — `en` (translations happen via separate files with same slug)
- `slug` — kebab-case, no dates, no filler
- `description` — 150-160 chars, no marketing-speak
- `seo_keywords` — 3-6 keywords, primary keyword first
- `tags` — 2-5 tags from the vocabulary above
- `hero_cta` — optional; picks a CTA card at the top of the post (`coal-burn`, `landing`, `heat-sim`, `freeze-risk`, `roster`, `hive`, `season-timeline`, `city-capture`, `unlock`)

## Publishing checklist

Before running `python3 build_blog.py`:

1. Set `draft: false` in frontmatter.
2. Read the post out loud once. If a sentence trips you, rewrite.
3. Verify every internal link resolves (`grep -o 'href="[^"]*"' /path/to/post.md`).
4. Verify sourcing — every non-trivial number has a citation in a `## Sources` section at the bottom.
5. Confirm at least one r5tools tool is linked in-body (not just in a CTA card).
6. Run `python3 build_blog.py --check` — must exit 0.
7. Commit with `git commit -m "blog: <slug>"` before deploy.

## Translations

- Translated posts share the **same slug** as the English original but sit in `posts/` with `lang: ko` (or `ja`, `pt`, `es`).
- Filename convention: `YYYY-MM-DD-slug.md` for EN, `YYYY-MM-DD-slug.ko.md` for KR, etc.
- The builder auto-emits hreflang alternates when it sees multiple langs for the same slug.
- Translate the frontmatter too — `title`, `description`, `seo_keywords` all need native equivalents. Don't copy English keywords into a Korean post.

## What NOT to publish

- Posts under 500 words (builder refuses; fix by expanding or delete).
- "Announcement" posts that add no reader value. If it's just news, put it on X or Discord, not the blog.
- Anything that could be read as accusing a real named player of cheating / griefing without evidence + right of reply.
- Screenshots that show any real player's phone number, email, or Discord user ID.
- AI-generated filler paragraphs. If Claude wrote a paragraph and you didn't edit it, delete it.
