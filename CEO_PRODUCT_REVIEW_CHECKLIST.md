# CEO Product Review — Executable Checklist

**Baseline:** `eedf3f7` · **Prepared:** 2026-07-17
**Use with:** `CEO_PRODUCT_REVIEW_GUIDE.md` (method, severity, stop/go) and
`CEO_PRODUCT_REVIEW_ISSUE_TEMPLATE.md` (one file per defect).

```
VERDICT: ___________________     Date: __________
Open P0: ____   Open P1: ____   Waived P1: ____
Conditions:
Signed:
```

**How to fill a row:** tick the box when the step is *done*, then write
`P` (pass) or `F` (fail) in **P/F**. Every `F` needs a severity (`P0`–`P3`) and a
`REV-NNN` issue ID in **Notes**.

`{lang}` = `en` | `zh` | `th`. Unless a row says otherwise, run it in `en`.

---

# SESSION 1 — Reference pass · Desktop 1440 · English

Cold load. This pass sets the standard everything else is compared against.

## 1.1 First impression — Homepage

**Route:** `/en` · **Width:** 1440

| # | ✓ | Action | Expected | P/F | Sev | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 1.1.1 | ☐ | Load the page. Look for 5 seconds, then look away. | You can say out loud what this company does and where. | | | |
| 1.1.2 | ☐ | Judge the hero. | Brand, headline, and the search control are all visible without scrolling. | | | |
| 1.1.3 | ☐ | Judge credibility. | Looks like a real Thai property platform, not a template or a demo. | | | |
| 1.1.4 | ☐ | Judge premium feel. | Type, spacing, and colour read as a paid professional product. | | | |
| 1.1.5 | ☐ | Find the next action. | The primary thing to do next is obvious without hunting. | | | |
| 1.1.6 | ☐ | Scan every homepage section heading. | Each title honestly describes the cards under it (districts section says districts). | | | |
| 1.1.7 | ☐ | Read the "View all" links. | Wording fits the section it belongs to; not "listings" on a non-listing section. | | | |
| 1.1.8 | ☐ | Scan the property cards. | Prices, currency, and locations are present and plausible. | | | |
| 1.1.9 | ☐ | Count cards with "Images unavailable". | Judge: does the volume of empty media damage credibility? | | | |
| 1.1.10 | ☐ | Hover each card type (listing, project, developer, district). | Hover response is consistent — same lift/shadow language everywhere. | | | |
| 1.1.11 | ☐ | Look for placeholder/lorem/duplicated copy anywhere. | None. | | | |
| 1.1.12 | ☐ | **Verdict:** would a real buyer scroll on? | Yes. | | | |

## 1.2 Global navigation and chrome

**Route:** `/en` · **Width:** 1440

| # | ✓ | Action | Expected | P/F | Sev | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 1.2.1 | ☐ | Read the primary nav left to right. | Every label is understandable to a first-time visitor; nothing cryptic. | | | |
| 1.2.2 | ☐ | Judge nav density. | Does not feel crowded or overwhelming. | | | |
| 1.2.3 | ☐ | Look for a scrollbar or streak under the nav links. | None. | | | |
| 1.2.4 | ☐ | Confirm "Search" is **not** in the nav. | Absent (deliberate). If present → regression. | | | |
| 1.2.5 | ☐ | Click each nav item in turn; use browser Back after each. | Every item lands on a real page; Back returns you to the homepage in the same scroll position. | | | |
| 1.2.6 | ☐ | Scroll down a long page and watch the header. | Sticky header stays usable, does not cover content or jump. | | | |
| 1.2.7 | ☐ | Open the footer. Read both columns. | Labels match their destinations; "Partners" reaches a partnership form, not the marketplace hub. | | | |
| 1.2.8 | ☐ | Click every footer link; Back after each. | All resolve; none 404. | | | |
| 1.2.9 | ☐ | Look for legal links (terms, privacy, company info) in the footer. | Present and reachable — or log their absence as a credibility issue. | | | |
| 1.2.10 | ☐ | Confirm "Search" is **not** in the footer Explore column. | Absent. | | | |
| 1.2.11 | ☐ | Type `/en/search` in the address bar. | Redirects to `/en/properties` (bookmark safety net). | | | |

## 1.3 Journey — Browse properties

**Routes:** `/en/properties` · **Width:** 1440

| # | ✓ | Action | Expected | P/F | Sev | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 1.3.1 | ☐ | Open `/en/properties` cold. | Purpose is clear in one glance: this is the inventory. | | | |
| 1.3.2 | ☐ | Watch the page while it loads. | Loading state is calm and honest — no flash of empty, no layout jump. | | | |
| 1.3.3 | ☐ | Read the result count and heading. | You know how many properties you are looking at. | | | |
| 1.3.4 | ☐ | Use the filter sidebar: set a price range, apply. | Results change; the applied filter is visible; the count updates. | | | |
| 1.3.5 | ☐ | Set filters that return nothing. | Empty state explains what happened and offers a way out — not a blank page. | | | |
| 1.3.6 | ☐ | Clear all filters. | Returns to the full list; no stale filter chips. | | | |
| 1.3.7 | ☐ | Compare 5 cards side by side. | Same fields in the same places; consistent price format and currency. | | | |
| 1.3.8 | ☐ | Check every price for currency. | Currency is unambiguous (a buyer never has to guess THB vs USD). | | | |
| 1.3.9 | ☐ | Check district / transit labels on cards. | Names are real, correctly spelled, and BTS/MRT labelling is consistent. | | | |
| 1.3.10 | ☐ | Judge image quality and cropping on cards with photos. | Sharp, correctly cropped, nothing stretched or with cut-off subjects. | | | |
| 1.3.11 | ☐ | Look for duplicate listings. | None visibly repeated. | | | |
| 1.3.12 | ☐ | Judge the CTA on each card. | Same wording and position on every card. | | | |
| 1.3.13 | ☐ | **Verdict:** is this list good enough to shop from? | Yes. | | | |

## 1.4 Journey — Buy landing

**Route:** `/en/buy` · **Width:** 1440

| # | ✓ | Action | Expected | P/F | Sev | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 1.4.1 | ☐ | Open cold. | It is immediately clear this is for buyers. | | | |
| 1.4.2 | ☐ | Compare with `/en/properties`. | Buy has a distinct reason to exist; it is not a duplicate page. | | | |
| 1.4.3 | ☐ | Check the inventory shown. | Sale properties only — no rentals leaking in. | | | |
| 1.4.4 | ☐ | Check prices. | Sale prices, correct currency, no monthly-rent formatting. | | | |
| 1.4.5 | ☐ | Find the next action for a serious buyer. | Obvious (browse deeper or make contact). | | | |

## 1.5 Journey — Rent landing

**Route:** `/en/rent` · **Width:** 1440

| # | ✓ | Action | Expected | P/F | Sev | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 1.5.1 | ☐ | Open cold. | Immediately clear this is for tenants. | | | |
| 1.5.2 | ☐ | Check the inventory shown. | Rental properties only — no sale listings leaking in. | | | |
| 1.5.3 | ☐ | Check prices. | Rent is shown per month (or the period is stated); currency is unambiguous. | | | |
| 1.5.4 | ☐ | Compare Buy vs Rent side by side in two tabs. | Consistent layout and CTA language; the difference is the intent, not the design. | | | |
| 1.5.5 | ☐ | Find the next action for a serious tenant. | Obvious. | | | |

## 1.6 Journey — Listing detail

**Route:** `/en/properties/{id}` (open 3 different listings: one with photos, one without, one high-priced) · **Width:** 1440

| # | ✓ | Action | Expected | P/F | Sev | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 1.6.1 | ☐ | Arrive by clicking a card (not by typing the URL). | The listing you land on is the card you clicked. | | | |
| 1.6.2 | ☐ | Judge the top of the page. | Price, type, location, and key specs are visible without scrolling. | | | |
| 1.6.3 | ☐ | Ask: could you decide to enquire from this page alone? | Enough information to act — size, beds, floor, district, price. | | | |
| 1.6.4 | ☐ | Judge photos: quality, order, cropping. | First image is the strongest; nothing distorted or badly cropped. | | | |
| 1.6.5 | ☐ | Open a listing with no photos. | Empty media state is honest and dignified — not a broken image, not a fake stock photo. | | | |
| 1.6.6 | ☐ | Read the price block closely. | Amount, currency, and (for rent) period are all explicit. | | | |
| 1.6.7 | ☐ | Read the location block. | District and transit are correct and consistent with the card you came from. | | | |
| 1.6.8 | ☐ | **Find out who you would be talking to.** | The page says clearly whether the contact is the **owner, an agent, an agency, the developer, or the platform**. | | | |
| 1.6.9 | ☐ | Check the contact block for role mixing. | No single block blurs two roles (e.g. platform support presented as the listing agent). | | | |
| 1.6.10 | ☐ | Look for source / evidence / verification labels. | Present, understandable to a customer, and not contradictory. | | | |
| 1.6.11 | ☐ | Judge the primary CTA. | Obvious, above or near the fold, and wording matches the rest of the site. | | | |
| 1.6.12 | ☐ | Press browser Back. | Returns to the list at your previous scroll position with filters intact. | | | |
| 1.6.13 | ☐ | Look for placeholder, duplicated, or auto-generated-sounding description text. | None. | | | |
| 1.6.14 | ☐ | **Verdict:** international-standard listing page? | Yes. | | | |

## 1.7 Journey — Project detail (incl. project lead form)

**Route:** `/en/projects` → `/en/projects/{slug}` (use `one-bangkok` plus one other) · **Width:** 1440

| # | ✓ | Action | Expected | P/F | Sev | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 1.7.1 | ☐ | Open `/en/projects` cold. | Clear what a "project" is versus a "property". | | | |
| 1.7.2 | ☐ | Scan the project cards. | Consistent; text-led cards without images still look intentional, not broken. | | | |
| 1.7.3 | ☐ | Open a project detail page. | Purpose clear; feels like a developer-grade project page. | | | |
| 1.7.4 | ☐ | Check project facts: name, location, status, completion, unit types, price range. | Present and internally consistent. | | | |
| 1.7.5 | ☐ | **Check developer attribution.** | The developer is named, correct, and clearly the developer — not confused with an agent or the platform. | | | |
| 1.7.6 | ☐ | Click through to the developer from the project. | Lands on the right developer page. | | | |
| 1.7.7 | ☐ | Check source / evidence presentation. | A customer can tell where the facts came from and how trustworthy they are. | | | |
| 1.7.8 | ☐ | Check district and transit labels. | Correct and consistent with the district pages. | | | |
| 1.7.9 | ☐ | Judge the project lead form's appearance. | Matches the other forms on the site — same field style, same button. | | | |
| 1.7.10 | ☐ | Submit the project lead form with valid data. | Lands on `/en/leads/success`; the confirmation tells you what happens next. | | | |
| 1.7.11 | ☐ | Submit the form with an invalid email and an empty required field. | Errors are inline, specific, and reachable; nothing is silently dropped. | | | |
| 1.7.12 | ☐ | Ask: who receives this enquiry? | The form makes it clear (developer vs platform). | | | |
| 1.7.13 | ☐ | Back-navigate from the project page. | Returns to the projects index sensibly. | | | |

## 1.8 Journey — Explore developer

**Routes:** `/en/developers` → `/en/developers/{slug}` (open 3) · **Width:** 1440

| # | ✓ | Action | Expected | P/F | Sev | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 1.8.1 | ☐ | Open the index cold. | Purpose clear; feels like a credible directory. | | | |
| 1.8.2 | ☐ | Compare card heights across a row. | Even; cards with no description do not collapse the grid. | | | |
| 1.8.3 | ☐ | Judge logo quality. | Sharp, correctly sized, on an appropriate background; none stretched. | | | |
| 1.8.4 | ☐ | Open a developer detail page. | You learn who they are and why they matter. | | | |
| 1.8.5 | ☐ | Check the project list on the developer page. | Projects shown genuinely belong to this developer. | | | |
| 1.8.6 | ☐ | Check the contact block. | Clearly framed as the developer (or platform on their behalf) — the role is stated. | | | |
| 1.8.7 | ☐ | Check source / evidence labels. | Present and coherent. | | | |
| 1.8.8 | ☐ | Look for thin, duplicated, or boilerplate developer copy. | None that undermines credibility. | | | |

## 1.9 Journey — Explore district / city

**Routes:** `/en/cities` → `/en/cities/{slug}` → `/en/districts/{slug}` (use `dusit`, `watthana`) · **Width:** 1440

| # | ✓ | Action | Expected | P/F | Sev | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 1.9.1 | ☐ | Reach a district page **only by clicking** from the homepage district section. | Works; the path is discoverable. | | | |
| 1.9.2 | ☐ | Reach a district page from a city page. | Works. | | | |
| 1.9.3 | ☐ | Judge: is the absence of a districts index a problem for a customer? | Decide and record. | | | |
| 1.9.4 | ☐ | Read the district page. | Genuinely useful to someone choosing where to live — not filler. | | | |
| 1.9.5 | ☐ | Check district facts and transit references. | Accurate, correctly named, consistent with listing/project pages. | | | |
| 1.9.6 | ☐ | Check the inventory shown on the district page. | Properties shown are actually in that district. | | | |
| 1.9.7 | ☐ | Check source / evidence presentation. | Present; a customer can judge trustworthiness. | | | |
| 1.9.8 | ☐ | Find the next action. | Obvious (browse that district's inventory). | | | |

## 1.10 Journey — Knowledge content

**Routes:** `/en/knowledge`, `/en/knowledge/glossary`, `/en/knowledge/bangkok-districts` · **Width:** 1440

| # | ✓ | Action | Expected | P/F | Sev | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 1.10.1 | ☐ | Open the hub cold. | Clear what is here and who it is for. | | | |
| 1.10.2 | ☐ | Click every card on the hub. | Every card leads somewhere real. No dead ends. | | | |
| 1.10.3 | ☐ | Read the glossary. | Useful, correct, not padded. | | | |
| 1.10.4 | ☐ | Read the districts guide. | Useful and consistent with the district pages. | | | |
| 1.10.5 | ☐ | Judge whether this content raises or lowers trust. | Raises. | | | |
| 1.10.6 | ☐ | Use the breadcrumbs to go back. | Work correctly at every level. | | | |
| 1.10.7 | ☐ | Ask: would a foreign buyer feel better informed after 3 minutes here? | Yes. | | | |

## 1.11 Journey — Marketplace and lead forms

**Routes:** `/en/marketplace`, `/en/find-my-home`, `/en/list-your-property`, `/en/partners/developers`, `/en/partners/agencies`, `/en/contact` · **Width:** 1440

| # | ✓ | Action | Expected | P/F | Sev | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 1.11.1 | ☐ | Open `/en/marketplace` cold. | You understand within 10 seconds what the marketplace offers and which door is yours. | | | |
| 1.11.2 | ☐ | Read the entry cards. | Each names its audience clearly (buyer / seller / developer / agency / browse). | | | |
| 1.11.3 | ☐ | Judge role separation across the hub. | Owner, agent, agency, developer, and platform paths are visibly distinct. | | | |
| 1.11.4 | ☐ | Hover every entry card. | Consistent hover treatment across all of them. | | | |
| 1.11.5 | ☐ | Click each entry card; Back after each. | All five land on the right destination. | | | |
| 1.11.6 | ☐ | **Find My Home** — read before typing. | The value exchange is clear: what you give, what you get. | | | |
| 1.11.7 | ☐ | Find My Home — submit valid data. | Lands on `/en/leads/success` with a confirmation that says what happens next and when. | | | |
| 1.11.8 | ☐ | Find My Home — submit with required fields empty. | Inline errors; nothing lost; you can recover without retyping everything. | | | |
| 1.11.9 | ☐ | **List Your Property** — read, then submit valid data. | Clear it is for owners/landlords; success page reached. | | | |
| 1.11.10 | ☐ | List Your Property — check role framing. | An owner knows this is for them, not for agents. | | | |
| 1.11.11 | ☐ | **Partners → Developers** — submit valid data. | Clear it is a developer partnership; success page reached. | | | |
| 1.11.12 | ☐ | **Partners → Agencies** — submit valid data. | Clear it is an agency partnership; success page reached; distinct from the developer form. | | | |
| 1.11.13 | ☐ | **Contact** — submit valid data. | Clear this reaches the **platform**; success page reached. | | | |
| 1.11.14 | ☐ | Compare all 5 forms plus the project lead form. | Same field style, same button, same error style, same success behaviour. | | | |
| 1.11.15 | ☐ | Read `/en/leads/success`. | Confirms receipt, sets an expectation, offers somewhere to go next. | | | |
| 1.11.16 | ☐ | Open `/en/leads/error` directly. | The failure message is honest and tells the customer how else to reach you. | | | |
| 1.11.17 | ☐ | Use the breadcrumb back from a form. | Returns to the marketplace hub. | | | |
| 1.11.18 | ☐ | **Verdict:** would you trust this platform with your phone number? | Yes. | | | |

## 1.12 Keyboard and focus — Desktop 1440

| # | ✓ | Action | Expected | P/F | Sev | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 1.12.1 | ☐ | From `/en`, press Tab repeatedly through the header. | Every stop shows a clearly visible focus ring. | | | |
| 1.12.2 | ☐ | Tab through the homepage cards. | Focus is visible and follows the reading order. | | | |
| 1.12.3 | ☐ | Tab to the language switcher and activate with Enter. | Reachable and operable by keyboard. | | | |
| 1.12.4 | ☐ | Tab through a form; submit with Enter. | Every field reachable, focus visible, Enter submits. | | | |
| 1.12.5 | ☐ | Tab through breadcrumbs and the footer. | Focus visible throughout. | | | |
| 1.12.6 | ☐ | Watch for focus disappearing behind the sticky header. | Never hidden. | | | |

## 1.13 About page

**Route:** `/en/about` · **Width:** 1440

| # | ✓ | Action | Expected | P/F | Sev | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 1.13.1 | ☐ | Open cold. | The company reads as real and credible. | | | |
| 1.13.2 | ☐ | Look for a placeholder or "MVP preview" notice. | None. If present → regression. | | | |
| 1.13.3 | ☐ | Judge whether this page would reassure a cautious foreign buyer. | Yes. | | | |

---

# SESSION 2 — Responsive

## 2.1 Desktop 1280

**Widths:** 1280 × 800 · **Language:** en

| # | ✓ | Action | Expected | P/F | Sev | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 2.1.1 | ☐ | Load `/en` and compare with your 1440 memory. | Content is centred with wider margins; nothing reflows badly. | | | |
| 2.1.2 | ☐ | Check the primary nav. | All items on one line; no overflow, no scrollbar. | | | |
| 2.1.3 | ☐ | Scroll `/en`, `/en/properties`, `/en/projects/{slug}` fully. | No horizontal scrollbar on any of them. | | | |
| 2.1.4 | ☐ | Check the listing filter sidebar. | Still inline; usable. | | | |

## 2.2 Desktop 1024 — the squeeze point

**Width:** 1024 × 768 · **Language:** en

| # | ✓ | Action | Expected | P/F | Sev | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 2.2.1 | ☐ | Load `/en`. Look hard at the nav. | Readable and not crowded; no visible scrollbar streak. | | | |
| 2.2.2 | ☐ | Try to reach every nav item at this width. | All reachable without awkward horizontal dragging. | | | |
| 2.2.3 | ☐ | Open `/en/properties`. | Filter sidebar still inline and usable, not crushed. | | | |
| 2.2.4 | ☐ | Open `/en/projects/{slug}`. | Two-column split still works; nothing overlaps. | | | |
| 2.2.5 | ☐ | Open `/en/contact`. | Two-column layout intact. | | | |
| 2.2.6 | ☐ | Scroll every main page fully. | No horizontal overflow anywhere. | | | |
| 2.2.7 | ☐ | Check the marketplace hub. | Entry grid still balanced. | | | |

## 2.3 Mobile 390 — primary mobile reference (full journey walk)

**Width:** 390 × 844 · **Language:** en

| # | ✓ | Action | Expected | P/F | Sev | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 2.3.1 | ☐ | Load `/en` cold. Do not scroll. | Brand, headline, and the search control are all reachable on the first screen. | | | |
| 2.3.2 | ☐ | Judge premium feel on the phone. | Holds up — this is where most customers will actually land. | | | |
| 2.3.3 | ☐ | Open the hamburger menu. | Opens below the header; full panel; does not trap the page. | | | |
| 2.3.4 | ☐ | Read the drawer section captions. | Localized and meaningful (Browse / Marketplace / Company). | | | |
| 2.3.5 | ☐ | Tap every drawer link, closing and reopening as needed. | All work; the drawer closes on navigation. | | | |
| 2.3.6 | ☐ | Find the language switcher in the drawer. | Present and usable. | | | |
| 2.3.7 | ☐ | Close the drawer with the close control. | Closes cleanly; page state intact. | | | |
| 2.3.8 | ☐ | Scroll `/en` top to bottom. | No horizontal drift; nothing cut off at either edge. | | | |
| 2.3.9 | ☐ | Watch the sticky header while scrolling. | Stays usable; does not eat the screen or cover tapped content. | | | |
| 2.3.10 | ☐ | Open `/en/properties`. Open the filter drawer. | Opens, is usable one-handed, applies, and closes. | | | |
| 2.3.11 | ☐ | Judge the listing cards on mobile. | Card height is reasonable; empty media does not dominate the screen. | | | |
| 2.3.12 | ☐ | Tap a card CTA. | Tap target is comfortable — no mis-taps. | | | |
| 2.3.13 | ☐ | Walk the full listing detail page. | Price, specs, contact role, and CTA all reachable and legible. | | | |
| 2.3.14 | ☐ | Walk a project detail page and submit the project lead form. | Completable on a phone; success page reached. | | | |
| 2.3.15 | ☐ | Complete Find My Home on the phone. | Completable one-handed; success page reached. | | | |
| 2.3.16 | ☐ | Walk developer, district, knowledge, and marketplace pages. | All legible; no overflow; CTAs reachable. | | | |
| 2.3.17 | ☐ | Use browser Back from three different depths. | Always returns somewhere sensible; scroll position preserved. | | | |
| 2.3.18 | ☐ | Check the footer on mobile. | Stacks cleanly; links are tappable, not cramped. | | | |
| 2.3.19 | ☐ | **Verdict:** would a real buyer or tenant continue on this phone? | Yes. | | | |

## 2.4 Mobile 430 — spot-check

**Width:** 430 × 932 · **Language:** en

| # | ✓ | Action | Expected | P/F | Sev | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 2.4.1 | ☐ | Load `/en`; check hero and search. | Reachable without scrolling; no wasted dead space. | | | |
| 2.4.2 | ☐ | Open the mobile menu. | Works as at 390. | | | |
| 2.4.3 | ☐ | Scroll `/en/properties` and one listing detail. | No horizontal overflow. | | | |
| 2.4.4 | ☐ | Open one form. | Fields full width and comfortable. | | | |

## 2.5 Mobile 375 — short-viewport worst case

**Width:** 375 × 667 · **Language:** en

| # | ✓ | Action | Expected | P/F | Sev | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 2.5.1 | ☐ | Load `/en`. **Do not scroll.** | The hero search is reachable — not pushed below the fold. (Known past defect; a repeat is a regression.) | | | |
| 2.5.2 | ☐ | Scroll `/en` fully. | No horizontal overflow. | | | |
| 2.5.3 | ☐ | Open the mobile drawer. | Fits; all items reachable without awkward scrolling. | | | |
| 2.5.4 | ☐ | Open `/en/properties`; apply a filter. | Filter drawer fits and is usable. | | | |
| 2.5.5 | ☐ | Open a listing detail and reach the contact CTA. | Reachable; tap target comfortable. | | | |
| 2.5.6 | ☐ | Open the longest form (Find My Home) and scroll it. | No field is clipped; submit button reachable. | | | |
| 2.5.7 | ☐ | Scroll every main page fully, watching both edges. | No horizontal overflow anywhere. | | | |

## 2.6 iPad 768 portrait

**Width:** 768 × 1024 · **Language:** en

| # | ✓ | Action | Expected | P/F | Sev | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 2.6.1 | ☐ | Load `/en`. Look at the header. | Hamburger drawer (not the inline nav row) — and it looks deliberate at this width. | | | |
| 2.6.2 | ☐ | Open the drawer. | Localized sections; comfortable tap targets on a tablet. | | | |
| 2.6.3 | ☐ | Judge the card grids. | Two columns; balanced, not stretched. | | | |
| 2.6.4 | ☐ | Open `/en/properties`. | Filter drawer (not the inline sidebar); usable. | | | |
| 2.6.5 | ☐ | Open a project detail and a developer detail. | Content stacks sensibly; no orphaned columns. | | | |
| 2.6.6 | ☐ | Open a form. | Two-column field grid; comfortable. | | | |
| 2.6.7 | ☐ | Scroll every main page fully. | No horizontal overflow. | | | |
| 2.6.8 | ☐ | Judge premium feel on a tablet. | Holds up. | | | |

## 2.7 iPad landscape (1024)

**Width:** 1024 × 768 · **Language:** en

| # | ✓ | Action | Expected | P/F | Sev | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 2.7.1 | ☐ | Load `/en`. | Inline nav appears (the drawer/inline switch happens here). Note whether the change between portrait and landscape feels jarring. | | | |
| 2.7.2 | ☐ | Rotate portrait → landscape on a listing detail. | Content survives the rotation; nothing is lost or clipped. | | | |
| 2.7.3 | ☐ | Check touch targets in the inline nav. | Big enough for a finger, not just a mouse. | | | |
| 2.7.4 | ☐ | Open `/en/properties` and use the filters. | Usable by touch at this width. | | | |

---

# SESSION 3 — Languages

## 3.1 Simplified Chinese — desktop 1440

**Routes:** `/zh` and the full journey set · **Width:** 1440

| # | ✓ | Action | Expected | P/F | Sev | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 3.1.1 | ☐ | Load `/zh` cold. | Reads as a Chinese product, not a translated English one. | | | |
| 3.1.2 | ☐ | Scan the homepage for English strings. | None left behind in a Chinese context. | | | |
| 3.1.3 | ☐ | Check the hero search transit options (BTS/MRT). | Localized labels — not raw English literals. (Known past defect.) | | | |
| 3.1.4 | ☐ | Check the nav and footer. | Fully translated; nothing truncated. | | | |
| 3.1.5 | ☐ | Judge Chinese typography. | Characters render at a comfortable size and weight; no fallback-font mismatch. | | | |
| 3.1.6 | ☐ | Walk browse → listing detail → contact. | Complete journey in Chinese with no English interruption. | | | |
| 3.1.7 | ☐ | Walk project detail → developer → district. | Same. | | | |
| 3.1.8 | ☐ | Read the knowledge pages. | Genuinely translated, not machine-broken. | | | |
| 3.1.9 | ☐ | Submit Find My Home in Chinese. | Labels, errors, and the success page are all in Chinese. | | | |
| 3.1.10 | ☐ | Check contact-role wording. | Owner / agent / agency / developer / platform distinctions survive translation. | | | |
| 3.1.11 | ☐ | Check property/project data in Chinese. | Prices, currency, districts, and transit are correct and not mistranslated. | | | |
| 3.1.12 | ☐ | Check card and button text for clipping. | Nothing truncated or overflowing. | | | |
| 3.1.13 | ☐ | **Verdict:** would a Chinese buyer trust this? | Yes. | | | |

## 3.2 Simplified Chinese — mobile 390

| # | ✓ | Action | Expected | P/F | Sev | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 3.2.1 | ☐ | Load `/zh` at 390. | Hero and search reachable; no overflow. | | | |
| 3.2.2 | ☐ | Open the mobile drawer. | Section captions in Chinese; nothing wrapping badly. | | | |
| 3.2.3 | ☐ | Walk one full journey (browse → detail → enquire). | Completes cleanly. | | | |
| 3.2.4 | ☐ | Scroll main pages watching both edges. | No horizontal overflow. | | | |

## 3.3 Thai — desktop 1440

**Routes:** `/th` and the full journey set · **Width:** 1440

| # | ✓ | Action | Expected | P/F | Sev | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 3.3.1 | ☐ | Load `/th` cold. | Reads as a Thai product. | | | |
| 3.3.2 | ☐ | Scan for English strings. | None left behind. | | | |
| 3.3.3 | ☐ | Check the hero search transit options. | Localized. | | | |
| 3.3.4 | ☐ | **Judge Thai line height and tone marks.** | Tone marks and vowels are not clipped by tight line heights — Thai is the highest-risk script here. | | | |
| 3.3.5 | ☐ | Look at every heading and button for wrapping. | Longer Thai strings do not break buttons, cards, or nav items. | | | |
| 3.3.6 | ☐ | Walk browse → listing detail → contact. | Complete journey in Thai; no English interruption. | | | |
| 3.3.7 | ☐ | Walk project detail → developer → district. | Same. | | | |
| 3.3.8 | ☐ | Read the knowledge pages. | Reads naturally to a Thai speaker. | | | |
| 3.3.9 | ☐ | Submit a form in Thai. | Labels, errors, success page all Thai. | | | |
| 3.3.10 | ☐ | Check district and transit names in Thai. | Correct Thai names, not transliterated English. | | | |
| 3.3.11 | ☐ | Check contact-role wording. | Role separation survives translation. | | | |
| 3.3.12 | ☐ | **Verdict:** would a Thai buyer trust this? | Yes. | | | |

## 3.4 Thai — mobile 390 and 375

| # | ✓ | Action | Expected | P/F | Sev | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 3.4.1 | ☐ | Load `/th` at 390. | No overflow; headings wrap cleanly. | | | |
| 3.4.2 | ☐ | Load `/th` at 375. | Long Thai labels do not force horizontal scroll. | | | |
| 3.4.3 | ☐ | Open the mobile drawer in Thai. | Captions fit; nothing truncated. | | | |
| 3.4.4 | ☐ | Open a Thai form at 375. | Labels and errors fit; nothing clipped. | | | |

## 3.5 Language switching

| # | ✓ | Action | Expected | P/F | Sev | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 3.5.1 | ☐ | From `/en/properties`, switch to Chinese. | **Stays on properties** (`/zh/properties`) — does not dump you on the homepage. | | | |
| 3.5.2 | ☐ | From a listing detail, switch to Thai. | Stays on the same listing. | | | |
| 3.5.3 | ☐ | From a project detail, switch to Chinese, then to English. | Stays on the same project both times. | | | |
| 3.5.4 | ☐ | From a filtered properties list, switch language. | Judge whether filters survive — and whether losing them would annoy a real customer. | | | |
| 3.5.5 | ☐ | Switch language, then press browser Back. | Returns to the previous language on the same page; no loop. | | | |
| 3.5.6 | ☐ | Switch language from a marketplace form with data typed in. | Note what happens to the typed data. Losing a half-filled form is a real customer cost. | | | |
| 3.5.7 | ☐ | Switch language on mobile via the drawer. | Works; drawer closes; you land on the translated equivalent. | | | |
| 3.5.8 | ☐ | Cycle en → zh → th → en on the homepage. | Every hop lands correctly; no 404, no reset. | | | |

---

# SESSION 4 — Data credibility sweep

Any device, English. This is the session that decides whether the platform is
trustworthy. Sample **10 listings, 5 projects, 5 developers, 3 districts**.

## 4.1 Property data accuracy

| # | ✓ | Action | Expected | P/F | Sev | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 4.1.1 | ☐ | For 10 listings, compare card facts vs detail-page facts. | Identical — no price, size, or location drift between card and page. | | | |
| 4.1.2 | ☐ | Check every price for a plausible market value. | Nothing absurd (a THB 5,000 condo sale, a 12M/month rent). | | | |
| 4.1.3 | ☐ | Check currency on all 10. | Explicit and consistent. | | | |
| 4.1.4 | ☐ | Check rent listings for period. | Per-month stated, never ambiguous. | | | |
| 4.1.5 | ☐ | Check district labels against the actual location. | Correct. | | | |
| 4.1.6 | ☐ | Check transit labels (BTS/MRT + station). | Correct line/station naming, consistently formatted. | | | |
| 4.1.7 | ☐ | Look for duplicate listings across the sample. | None. | | | |
| 4.1.8 | ☐ | Read 10 descriptions. | None reads as auto-generated filler or a copy-paste of another listing. | | | |
| 4.1.9 | ☐ | Judge photo quality and cropping across the sample. | Consistent standard; nothing distorted, watermark-covered, or mis-cropped. | | | |

## 4.2 Project data accuracy

| # | ✓ | Action | Expected | P/F | Sev | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 4.2.1 | ☐ | For 5 projects, check name, location, status, completion date. | Present and self-consistent. | | | |
| 4.2.2 | ☐ | Check unit types and price ranges. | Plausible and consistently formatted. | | | |
| 4.2.3 | ☐ | Cross-check each project's district against its district page. | Consistent. | | | |
| 4.2.4 | ☐ | Check project ↔ listing relationships. | Listings attached to a project genuinely belong to it. | | | |
| 4.2.5 | ☐ | Look for empty or near-empty project pages. | Any project page too thin to be useful is a credibility issue — log it. | | | |

## 4.3 Developer attribution

| # | ✓ | Action | Expected | P/F | Sev | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 4.3.1 | ☐ | For 5 developers, check the project list on each. | Every project genuinely belongs to that developer. | | | |
| 4.3.2 | ☐ | From 5 project pages, check the named developer. | Correct in every case. | | | |
| 4.3.3 | ☐ | Check logos against the named company. | Right logo for the right company. | | | |
| 4.3.4 | ☐ | Look for a project attributed to two developers, or none. | None. | | | |
| 4.3.5 | ☐ | Check developer descriptions. | Not duplicated across developers. | | | |

## 4.4 Source and evidence presentation

| # | ✓ | Action | Expected | P/F | Sev | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 4.4.1 | ☐ | Find the source/evidence indicators on a listing, project, developer, and district page. | Present on each. | | | |
| 4.4.2 | ☐ | Read them as a customer with no context. | You understand what they mean without a legend. | | | |
| 4.4.3 | ☐ | Compare evidence labels across page types. | Same vocabulary and visual language everywhere. | | | |
| 4.4.4 | ☐ | Look for contradictions (e.g. "official" on data that also says unverified). | None. | | | |
| 4.4.5 | ☐ | Judge whether the evidence system increases trust or creates doubt. | Increases trust. | | | |
| 4.4.6 | ☐ | Ask: is anything presented as more certain than it is? | No. | | | |

## 4.5 Role separation — owner / agent / agency / developer / platform

| # | ✓ | Action | Expected | P/F | Sev | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 4.5.1 | ☐ | On 5 listing details, name who the contact is. | Unambiguous every time. | | | |
| 4.5.2 | ☐ | On 3 project pages, name who the enquiry reaches. | Unambiguous. | | | |
| 4.5.3 | ☐ | On 3 developer pages, name who the contact is. | Unambiguous. | | | |
| 4.5.4 | ☐ | Check platform support blocks. | Never mistakable for a listing agent or the owner. | | | |
| 4.5.5 | ☐ | Compare the 5 marketplace doors. | Each speaks to exactly one role. | | | |
| 4.5.6 | ☐ | Look for any page where two roles blur together. | None. | | | |
| 4.5.7 | ☐ | Ask: could a customer contact the wrong party by accident? | No. | | | |

## 4.6 Loading, empty and error states

| # | ✓ | Action | Expected | P/F | Sev | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 4.6.1 | ☐ | Hard-reload `/en/properties` and watch. | Loading state is calm; no jarring layout jump when content lands. | | | |
| 4.6.2 | ☐ | Filter to zero results. | Empty state explains and offers a route out. | | | |
| 4.6.3 | ☐ | Visit a listing that has no images. | Honest empty media — not a broken icon, not fake stock imagery. | | | |
| 4.6.4 | ☐ | Type a nonsense URL (`/en/properties/does-not-exist`). | A real not-found page with a way back — not a raw error. | | | |
| 4.6.5 | ☐ | Type `/en/projects/does-not-exist`. | Same. | | | |
| 4.6.6 | ☐ | Open `/en/leads/error`. | Honest, gives an alternative contact route. | | | |
| 4.6.7 | ☐ | Throttle to Fast 3G and load `/en` once. | Perceived loading is tolerable; log a perceived-speed note if not. | | | |

## 4.7 Cross-cutting consistency

| # | ✓ | Action | Expected | P/F | Sev | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 4.7.1 | ☐ | Write down the primary CTA wording on home, properties, listing, project, developer, district, marketplace. | Consistent language; the same action is not called three different things. | | | |
| 4.7.2 | ☐ | Compare button styles across those pages. | One visual system. | | | |
| 4.7.3 | ☐ | Compare card styles across listing / project / developer / district / marketplace. | One family. | | | |
| 4.7.4 | ☐ | Check breadcrumbs where they appear. | Consistent and correct. | | | |
| 4.7.5 | ☐ | Check the footer and legal links from three different pages. | Identical and complete every time. | | | |
| 4.7.6 | ☐ | Ask the final question of the whole review: **would a real buyer or tenant continue using this platform?** | Yes — on desktop and on mobile. | | | |

---

## Tally

| Session | Items | Pass | Fail | P0 | P1 | P2 | P3 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| S1 — Reference (desktop 1440, en) | 96 | | | | | | |
| S2 — Responsive (1280/1024/430/390/375/768) | 45 | | | | | | |
| S3 — Languages (zh / th / switching) | 37 | | | | | | |
| S4 — Credibility (data / roles / states) | 40 | | | | | | |
| **Total** | **218** | | | | | | |

Apply the stop/go criteria in `CEO_PRODUCT_REVIEW_GUIDE.md` §9 and record the
verdict at the top of this file.
