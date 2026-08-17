# LWS Train Conductor Picker

Fair random-pick a conductor for your alliance train chain in *Last War: Survival*.

**Live:** https://bullochman.github.io/lws-train-conductor-static/

## What it does

Alliance trains have historically picked their conductor by rolling dice with no filter for who's actually eligible. This tool:

1. Loads your alliance roster (preset CSV, paste, or upload).
2. Lets the R5 filter by rank, HQ level, min total power, held titles, and manual opt-outs.
3. Fair-random-picks a conductor from the eligible pool — with an optional bias to prefer members who haven't conducted recently.
4. Records rotation history in localStorage so nobody gets stuck conducting three trains in a row.

## Roster CSV format

Same as the [LWS Roster Extractor](https://roster.r5tools.io/):

```
name,rank,hq_level,power,notes
Beccs 베카,R4,30,107700000,titled:recruiter
Chris 데마,R4,30,140200000,
```

- `notes` supports `titled:<title>` entries (e.g. `titled:recruiter`, `titled:butler`).
- Empty rows are skipped.

## Deploy

Static GitHub Pages site — no build step. `git push` to `main` and it goes live in ~1 minute.

## Part of

The [r5tools.io](https://r5tools.io) LWS Alliance toolkit.
