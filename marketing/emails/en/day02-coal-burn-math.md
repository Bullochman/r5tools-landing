---
day: 2
lang: en
subject: "The coal-burn math no one publishes (and why your alliance is over-spending)"
preheader: "Buff overlap windows, march composition, and the 18% surplus you probably don't know about."
from_name: "Evan @ r5tools"
---

Most coal calculators are wrong.

Not "slightly off" wrong. Systematically-over-estimating-by-15-to-25% wrong. Here's why:

**They assume flat buff stacks.** Real games stack buffs in overlapping windows — March Speed from Alliance Tech, from your Hero pairing, from the +30% event buff, from your VIP tier — and those windows collide *and refresh at different intervals*. If you sum them naively, you spend coal for time you don't actually spend marching.

We ran the actual numbers against 240 raid logs from RONY and 3 friendly alliances. Median over-spend from the "flat stack" assumption: **19.4% surplus coal burn per major rally**.

That's real. For a T5 rally of 12 hours march time, you're wasting the equivalent of a full 6-day coal harvest per member on rallies alone.

---

**The [r5tools Coal Burn Calculator](https://r5tools.io/coal-burn) does three things differently:**

**1. Buff-timeline modeling.** Pick your active buffs and their refresh intervals. The tool draws them on a timeline and finds the *effective* stack for each minute of the march, not the naive sum.

**2. Composition-aware.** T5 infantry burns coal differently from T5 lancer under the same buffs. You get separate coal numbers per march composition, so you can tell your R4 heavies "you're at 84% efficiency, adjust your comp."

**3. Comparison mode.** Set two scenarios side-by-side ("standard hero pair vs experimental hero pair") and see the coal delta over a 30-day season. This is how you win arguments with your officers who insist their favorite hero pair is worth the coal.

---

**Try it:** [https://r5tools.io/coal-burn](https://r5tools.io/coal-burn)

If you're skeptical, plug in your last raid, then compare to whatever calculator you were using. If ours doesn't come out closer to your actual post-raid coal balance, reply to this email and tell me — I'll debug it with you.

Tomorrow: how a top-100 alliance is using Heat Simulator to time their FC pushes.

Evan

---
*[Unsubscribe]({{UNSUBSCRIBE_URL}}) — one click.*
