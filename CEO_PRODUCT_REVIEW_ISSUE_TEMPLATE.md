# CEO Product Review — Issue Template

Copy the block below once per defect into `docs/review/2026-07-17/issues.md`, or
into one file per issue named `REV-{NNN}.md`. One issue = one defect. If you find
the same defect on four pages, that is one issue with four routes listed — not
four issues.

Fields marked **(required)** must be filled before the issue can be triaged.
An issue with no reproduction steps and no screenshot will be closed unread.

---

```markdown
## REV-___ — <one-line summary in customer language>

| Field | Value |
| --- | --- |
| **Issue ID** (required) | REV-___ |
| **Date** (required) | 2026-__-__ |
| **Reviewer** | CEO |
| **Environment** (required) | Production `https://www.gothailandhome.com` · Chrome ___ · macOS ___ · build `eedf3f7` |
| **Route** (required) | `/{lang}/...` — paste the full URL from the address bar, including query string |
| **Language** (required) | en / zh / th |
| **Device** (required) | Desktop 1440 / Desktop 1280 / Desktop 1024 / iPad 768 portrait / iPad landscape 1024 / Mobile 430 / Mobile 390 / Mobile 375 · real device or DevTools responsive |
| **Journey** | browse / buy / rent / listing detail / project detail / developer / district / knowledge / marketplace / lead form / language switch / navigation |
| **Checklist item** | e.g. 1.6.8 — leave blank if found outside the checklist |
| **Severity** (required) | P0 / P1 / P2 / P3 |
| **Decision** (required) | Fix before launch / Fix next wave / Backlog / Waived / Not an issue |
| **Assigned executor** (required) | <name or team> |
| **Target wave** | e.g. Phase 12 Wave 3 |
| **Status** | Open / In progress / Fixed / Verified / Closed |

### Reproduction steps (required)
Start from a cold page load. Literal actions, in order. Anyone must be able to
follow these without asking you a question.

1.
2.
3.

### Expected result (required)
What a first-time customer would reasonably expect to happen.

### Actual result (required)
What happened. Describe the customer-visible behaviour, not a guess at the cause.

### Screenshot reference (required)
`REV-___{route-slug}_{lang}_{width}.png` — stored in `docs/review/2026-07-17/`

### Customer impact (required for P0/P1)
Answer in one sentence: what does this cost a real buyer or tenant?
Name which decision question it fails — purpose clear / credible / premium /
information complete / next action obvious / contact roles correct / roles
separated / no fake content / international standard / would continue using.

### Reproducibility
Every time / Intermittent (___ of ___ attempts) / Once only

### Also seen on
Other routes, languages, or widths where the same defect appears. If this only
occurs in one language or at one width, say so explicitly — that is diagnostic.

### Regression?
Is this an item the Phase 12 reports list as already fixed? (See
`CEO_PRODUCT_REVIEW_GUIDE.md` §8.) If yes, name the item and raise severity to
at least P1.

### Notes
Anything else: related issue IDs, a product decision this depends on, or a
"wish" you want recorded without triaging it as a defect.
```

---

## Severity quick reference

| | Meaning | Gate |
| --- | --- | --- |
| **P0** | Journey broken, or trust destroyed on sight (wrong price, wrong attribution, lost lead, dead nav link, fake-looking content presented as real). | Blocks launch. |
| **P1** | Journey completes but a real customer hesitates, gets confused, or leaves (unclear next action, missing decision info, mixed-language section, unusable mobile menu, horizontal overflow, back-navigation loses place). | Blocks launch unless waived in writing. |
| **P2** | Noticeable quality gap; does not stop or mislead (inconsistent CTA wording, uneven cards, imperfect crop, one untranslated label). | Ship, fix next wave. |
| **P3** | Cosmetic; only a designer notices. | Backlog. |

Undecided between two levels? Ask *"would a real buyer lose confidence?"*
Yes → higher. No → lower.

---

## Worked example

```markdown
## REV-014 — Rent price gives no period, so a tenant can't tell monthly from total

| Field | Value |
| --- | --- |
| **Issue ID** | REV-014 |
| **Date** | 2026-07-18 |
| **Reviewer** | CEO |
| **Environment** | Production `https://www.gothailandhome.com` · Chrome 138 · macOS 15.5 · build `eedf3f7` |
| **Route** | `https://www.gothailandhome.com/en/properties/<id>` |
| **Language** | en |
| **Device** | Mobile 390 (DevTools responsive) |
| **Journey** | rent / listing detail |
| **Checklist item** | 1.5.3 |
| **Severity** | P0 |
| **Decision** | Fix before launch |
| **Assigned executor** | <name> |
| **Target wave** | Phase 12 Wave 3 |
| **Status** | Open |

### Reproduction steps
1. Cold-load `https://www.gothailandhome.com/en/rent` at 390 width.
2. Tap the first rental card's "View details".
3. Read the price block at the top of the detail page.

### Expected result
The price states the amount, the currency, and the period — a tenant reads
"฿45,000 / month" and knows exactly what they are committing to.

### Actual result
The price block shows the amount and currency with no period. Nothing on the
page says whether this is per month, per year, or a total contract value.

### Screenshot reference
`REV-014_properties-detail_en_390.png`

### Customer impact
A tenant cannot tell what they would be paying, so they cannot decide whether to
enquire — this fails "information complete enough to make a decision" and
"credible" on the single most important number on the page.

### Reproducibility
Every time

### Also seen on
`/en/rent` cards, and the same listing at 1440. Present in zh and th.

### Regression?
No — not listed as fixed in any Phase 12 report.

### Notes
Related: REV-011 (currency ambiguity on buy cards).
```
