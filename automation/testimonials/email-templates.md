# Testimonial-ask email templates

Four trigger moments × five languages = 20 template files, all under
`./templates/<template-id>-<lang>.md`.

## Voice rules

- **R5-to-R5, not marketing team.** Evan writes as a fellow player. No
  "we value your feedback" corporate-speak.
- **Never look like a spam "leave us a review" email.** The email should feel
  like Evan noticed the specific behavior that triggered it. That's WHY the
  trigger context is in the greeting ("you've been on the suite a lot this
  week", "your unlock cleared cleanly yesterday", "you've been Founding for
  a month").
- **Every email ends with a personalized link** (`{{FORM_URL}}`) and the
  standard unsubscribe footer (`{{UNSUBSCRIBE_URL}}`).
- **Two paragraph max.** People bounce on long asks.
- **Never promise the credit before they submit** (avoid making it feel
  transactional). The credit is a surprise on the thank-you page.
- **Include an opt-out signal in the ask itself** — "no pressure, ignore if
  busy" — so silence isn't awkward.

## Placeholders

Every template supports these tokens (substituted by `capture.py::_render`):

- `{{HANDLE}}` — the R5's handle or fallback to email name
- `{{FORM_URL}}` — the pre-tokenized `/testimonial-form.html?user=…` URL
- `{{WARZONE}}` — "your warzone" fallback if unknown
- `{{UNSUBSCRIBE_URL}}` — standard unsub

## Frontmatter

Each `.md` template starts with YAML frontmatter matching `send_drip.py`:

```
---
subject: "Subject line"
preheader: "Optional preheader shown in inbox previews"
from_name: "Evan @ r5tools"
---
Body starts here…
```

## The four triggers

| Template id | Fired when | Voice / hook |
|---|---|---|
| `trigger-tool-use-5`    | User has 5+ `gate_check`/`tool_action` events in the last 7d | "You've been on the suite a lot — how's it going?" |
| `trigger-unlock-success`| 2–72h after first `unlock_success_paid` event                 | "Congrats — unlock cleared. If you have 30s, drop me a line?" |
| `trigger-founding-day-30`| 30 days after joining a Founding tier                        | "It's been a month as Founding. Would love your take." |
| `trigger-drip-reply`    | (Not sent by capture.py — covered by `emails/day07-ask.md`.)   | Reply-to-me pattern, already in drip |

## Files

Live templates written into `./templates/`:

- `trigger-tool-use-5-{en,ko,ja,pt,es}.md`
- `trigger-unlock-success-{en,ko,ja,pt,es}.md`
- `trigger-founding-day-30-{en,ko,ja,pt,es}.md`

The 4th (drip-reply) is intentionally NOT here — it's already delivered by
`marketing/emails/{en,ko}/day07-ask.md`. `capture.py` still tracks it in
`asks.jsonl` so the 90-day rate-limit budget covers it.

## Testing a template

```bash
cd automation/testimonials
python3 capture.py --user evan@r5tools.io --trigger unlock_success
# prints the exact rendered body + subject to stdout (no send)
```

## Localization notes

- **KO:** 존댓말 register throughout. Match the tone of `marketing/emails/ko/*`.
- **JA:** 敬語 (polite form). No cutesy emojis in body — English shibboleth.
- **PT:** Brazilian PT (pt-BR). "você" not "tu".
- **ES:** LatAm neutral. "tú" for informal peer-to-peer.
