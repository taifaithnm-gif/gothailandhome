# CEO Product Review — Guide

**Product:** GoThailandHome
**Baseline commit:** `eedf3f7` (Phase 12 Design QA)
**Prepared:** 2026-07-17
**Reviewer:** CEO
**Method:** Manual, human-eye review. No tooling, no code reading.

This guide defines *how* to run the review. The executable steps live in
`CEO_PRODUCT_REVIEW_CHECKLIST.md`. Every defect is logged with
`CEO_PRODUCT_REVIEW_ISSUE_TEMPLATE.md`.

---

## 1. What this review is

You are the **first-time customer**, not the engineer. For every screen the only
questions that matter are:

1. Is the purpose of the page immediately clear?
2. Does the page look credible?
3. Does it feel sufficiently premium?
4. Is the information complete enough to make a decision?
5. Is the next action obvious?
6. Are contact roles correct, and are **owner / agent / agency / developer / platform** clearly separated?
7. Is there any fake-looking, weak, duplicated or placeholder content?
8. Does this meet an international property-platform standard?
9. **Would a real buyer or tenant continue using this platform?**

Question 9 is the decision. Questions 1–8 are the evidence.

Do **not** review code quality, architecture, or performance internals. If
something is slow or ugly *as a customer experiences it*, log it as an experience
issue.

---

## 2. Route model (what you will be typing)

Every public page is language-prefixed. There is no unprefixed page.

```
/{lang}/...        lang ∈ { en, zh, th }
```

| Area | Route |
| --- | --- |
| Home | `/{lang}` |
| Buy landing | `/{lang}/buy` |
| Rent landing | `/{lang}/rent` |
| All listings | `/{lang}/properties` |
| Listing detail | `/{lang}/properties/{id}` |
| Projects index | `/{lang}/projects` |
| Project detail | `/{lang}/projects/{slug}` (e.g. `one-bangkok`) |
| Developers index | `/{lang}/developers` |
| Developer detail | `/{lang}/developers/{slug}` |
| Cities index | `/{lang}/cities` |
| City detail | `/{lang}/cities/{slug}` |
| District detail | `/{lang}/districts/{slug}` (e.g. `dusit`, `watthana`) |
| Knowledge hub | `/{lang}/knowledge` |
| Knowledge — glossary | `/{lang}/knowledge/glossary` |
| Knowledge — districts | `/{lang}/knowledge/bangkok-districts` |
| Marketplace hub | `/{lang}/marketplace` |
| Buyer intake form | `/{lang}/find-my-home` |
| Seller/landlord intake form | `/{lang}/list-your-property` |
| Developer partnership form | `/{lang}/partners/developers` |
| Agency partnership form | `/{lang}/partners/agencies` |
| Contact | `/{lang}/contact` |
| About | `/{lang}/about` |
| Lead submitted | `/{lang}/leads/success` |
| Lead failed | `/{lang}/leads/error` |
| Legacy search helper | `/{lang}/search` → redirects to `/properties` (intentionally not in nav) |

**Navigation surfaces to exercise:** desktop primary nav, mobile drawer
(Browse / Marketplace / Company sections), language switcher, footer
(Explore / Company columns), breadcrumbs on marketplace + knowledge pages.

**Lead-generating forms (5):** find-my-home, list-your-property,
partners/developers, partners/agencies, contact, plus the **project lead form**
embedded on `/{lang}/projects/{slug}`.

**Note:** there is no districts *index* page. Districts are reached from the
homepage "Explore Bangkok districts" section and from city pages. Judge whether
that is acceptable as a customer, and log it if not.

---

## 3. Review sequence

Run in this order. Each pass builds on the last; do not jump ahead.

| Pass | Focus | Why this order |
| --- | --- | --- |
| **Pass 1** | Desktop 1440 · English · full journey set | Establishes the reference experience. Most issues surface here. |
| **Pass 2** | Desktop 1280 → 1024 · English · layout + nav only | Catches crowding and overflow at the squeeze points. |
| **Pass 3** | Mobile 390 · English · full journey set | Mobile is the real customer device. Second-highest yield. |
| **Pass 4** | Mobile 430 + 375 · spot-check only | Confirms the extremes; do not re-walk everything. |
| **Pass 5** | iPad 768 portrait + landscape | Confirms the tablet break between drawer and inline nav. |
| **Pass 6** | Simplified Chinese (`zh`) · desktop + mobile | Language integrity, wrapping, mixed strings. |
| **Pass 7** | Thai (`th`) · desktop + mobile | Longest strings; highest wrap/overflow risk. |
| **Pass 8** | Data credibility sweep (any device, English) | Property/project/developer accuracy, sources, roles, prices. |

---

## 4. Session structure

Do not attempt this in one sitting. Fatigue produces false passes.

| Session | Duration | Contents | Output |
| --- | --- | --- | --- |
| **S1 — Reference** | 60–75 min | Pass 1 | Issue log + a verdict on "would a real buyer continue?" |
| **S2 — Responsive** | 45–60 min | Passes 2, 3, 4, 5 | Issue log |
| **S3 — Language** | 45 min | Passes 6, 7 | Issue log |
| **S4 — Credibility** | 45 min | Pass 8 | Issue log + trust verdict |
| **S5 — Decision** | 30 min | Triage all issues, assign severity, apply stop/go | Go / No-Go |

Between sessions, take a real break. Start each session on a **cold page load**
(new tab, cleared history for the site) so first-impression judgement is honest.

---

## 5. Device and browser setup

**Browser:** Chrome (primary). Safari on a real iPhone if available for Pass 3/4.

**Desktop widths** — use Chrome DevTools → Toggle device toolbar → **Responsive**,
type the width manually:

| Target | Width × Height |
| --- | --- |
| Desktop large | 1440 × 900 |
| Desktop standard | 1280 × 800 |
| Desktop small / laptop | 1024 × 768 |

**iPad:**

| Target | Width × Height |
| --- | --- |
| iPad portrait | 768 × 1024 |
| iPad landscape | 1024 × 768 (same as desktop-small — note where the nav differs) |

**Mobile:**

| Target | Width × Height | Stands in for |
| --- | --- | --- |
| 430 × 932 | iPhone Pro Max class |
| 390 × 844 | iPhone standard — **the primary mobile reference** |
| 375 × 667 | iPhone SE / small Android — **short-viewport worst case** |

**Settings for every pass:**

- Zoom **100%**. Any other zoom invalidates a layout finding.
- Device pixel ratio: default.
- Throttling: **off** by default. Run one mobile pass with "Fast 3G" only if you
  want to judge perceived loading; log those separately as perceived-speed notes.
- Keyboard checks: use a real keyboard, `Tab` / `Shift+Tab` / `Enter` / `Esc`.

---

## 6. Severity definitions

Assign severity from the **customer's** point of view, not from implementation cost.

| Severity | Definition | Examples | Response |
| --- | --- | --- | --- |
| **P0 — Blocker** | The customer cannot complete a core journey, or the platform loses credibility on sight. Trust-destroying. | Lead form does not submit or loses data · wrong price/currency · a listing attributed to the wrong developer or agent · page crashes or 404s from a real nav link · obviously fake content presented as real | **Blocks launch.** Fix before any public exposure. |
| **P1 — Major** | The journey completes, but a real buyer or tenant would hesitate, get confused, or go to a competitor. | Next action not obvious on a detail page · key decision info missing · mixed-language UI in a whole section · mobile menu unusable · horizontal overflow on a main page · back navigation loses the customer's place | **Blocks launch** unless explicitly waived with a written reason. |
| **P2 — Minor** | Noticeable quality gap. Does not stop or mislead the customer. | Inconsistent CTA wording · uneven card heights · imperfect image crop · a single untranslated label · spacing drift | Ship, fix in the next wave. |
| **P3 — Polish** | Cosmetic or taste-level. Only a designer would notice. | Hover timing · one-pixel alignment · minor tone/word preference | Backlog. |

**Tie-breaker:** if you cannot decide between two levels, ask *"would a real buyer
lose confidence?"* — yes → the higher level; no → the lower.

---

## 7. Evidence collection

An issue without evidence will be argued about instead of fixed.

**Every issue requires:**

1. **A screenshot.** Full page, not a crop, unless the crop is annotated.
2. **The exact URL** from the address bar (including the `/{lang}` prefix and any query string).
3. **The device width** you were at.
4. **The reproduction steps** — literal clicks, in order, starting from a cold load.

**Screenshot naming:**

```
REV-{NNN}_{route-slug}_{lang}_{width}.png
```

Examples:
```
REV-007_projects-one-bangkok_th_390.png
REV-021_find-my-home_zh_1440.png
```

**Storage:** `docs/review/2026-07-17/` — one folder for the whole review.
Reference the filename in the issue's *Screenshot reference* field. Never paste
an image without also filling the URL and steps.

**Numbering:** issues are `REV-001` upward, in the order you find them, across
all sessions. Do not restart numbering per session.

**Annotation:** a red box around the defect is enough. Do not annotate a proposed
fix onto the screenshot — the issue records the problem, not the solution.

---

## 8. Rules of engagement

- **Do not propose new features.** If you want one, write it in the notes field
  as a "wish", not as an issue. Wishes are not triaged in this review.
- **Do not reopen resolved items.** The items below are already fixed and
  verified in the Phase 12 reports; if you see them *still happening*, that is a
  new **P0/P1 regression** and must be logged as such:
  - Footer "Partners" pointing at the marketplace hub
  - "View all listings" wording on non-listing sections
  - "Placeholder content for MVP preview" banner on About
  - English-only mobile drawer section captions
  - Homepage hero search clipped on short mobile viewports
  - English-only BTS/MRT labels in the homepage hero search
  - Visible scrollbar streak across the desktop nav
  - Project lead form using off-system controls
- **Known and accepted (do not log again unless the customer impact is worse
  than described):**
  - Listing cards showing "Images unavailable" — honest empty state; the media
    pipeline is a separate track. Log only if the *volume* of empty media makes
    the platform non-credible — that judgement is exactly what this review is for.
  - `/{lang}/search` still redirecting to `/properties` — deliberate, and it is
    no longer linked from the nav or footer.
  - Project and developer cards being text-led where no hero image exists.
- **Open product decisions awaiting your call** (answer them in S5; they are not
  issues):
  1. Is removing Search from the nav acceptable while the `/search` redirect
     stays alive for old bookmarks?
  2. Should listing cards become fully clickable, or keep the explicit
     "View details" CTA?
  3. Priority: real listing photography vs further navigation simplification?
  4. Should the `official` evidence badge take its own dedicated colour, or keep
     the current brand-deep colour?

---

## 9. Stop / Go criteria

Apply at the end of **S5 — Decision**.

### GO — approve for public exposure

All of the following must be true:

- **Zero P0 issues open.**
- **Zero P1 issues open**, or every open P1 has a written, dated waiver from you
  naming the reason and the fix wave.
- All three languages complete a **buy** journey and a **rent** journey end to
  end, including one lead submission each.
- All 6 lead-capture forms submit successfully and land on `/{lang}/leads/success`.
- No horizontal overflow on any main page at 375, 390, 430, or 768.
- Contact roles are correct on every detail page: the customer can tell whether
  they are talking to the **owner, an agent, an agency, the developer, or the
  platform**.
- No price or currency is wrong or ambiguous anywhere you looked.
- Your answer to *"would a real buyer or tenant continue using this platform?"*
  is **yes** for desktop **and** mobile, in **at least English**.

### NO-GO — hold

Any one of these:

- **Any open P0.**
- **Three or more open P1s in a single journey** (that journey is structurally not
  ready, regardless of individual severity).
- A lead form loses data, submits silently, or routes to the wrong recipient.
- Any content that a customer could reasonably read as fabricated, or any data
  attributed to the wrong owner/agent/agency/developer.
- Your honest answer to *"would a real buyer continue?"* is **no** on mobile.

### CONDITIONAL GO

- **P1s confined to a single non-core surface** (e.g. Knowledge or About) and
  none in browse / listing detail / project detail / lead capture:
  approve with that surface temporarily de-linked from the primary navigation,
  and a named fix wave.
- **A language is materially weaker than English** (mixed strings, broken
  wrapping) but English and the other language are clean: approve English +
  the clean language, hold the weak locale's launch until fixed.

### Recording the decision

Write the verdict at the top of the completed checklist file:

```
VERDICT: GO / NO-GO / CONDITIONAL GO
Date:
Open P0: n    Open P1: n    Waived P1: n
Conditions:
Signed:
```
