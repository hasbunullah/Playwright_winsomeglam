# Winsome Glam automation review

Review date: October 15, 2026. Target: https://winsomeglam.com/.

## Existing structure

Keep JavaScript ES modules, Playwright Test, constructor-defined page locators,
page actions in `pages/`, and independent scenario assertions in `tests/`.
Retain Chromium, one worker, zero retries, and existing reporting. Add shared
fixtures and data only when a module needs them. Module 1 now has a HomePage
class and home/navigation test cases; live test execution is pending.

`site-inventory.json` records read-only browser navigation, response status,
headings, main content, controls and discovered links. This verifies page content
and reachability, not interactive behavior. Authentication and checkout need
separate inspection; public navigation cannot establish complete coverage.

## Module sequence and proposed coverage

All expected results below are proposed acceptance criteria, not test results.
Verify rendered locators and behavior during each module's implementation.

| Order | Module / proposed page class | Proposed spec | Scenarios and expected results |
| --- | --- | --- | --- |
| 1 | Home and navigation / HomePage | home-navigation.spec.js | Home loads with main content; logo returns home; primary links open intended collections/pages; desktop menu opens and closes; mobile menu exposes equivalent destinations; hero CTAs navigate correctly. |
| 2 | Search / SearchPage | search.spec.js | Open/close search; valid product query returns relevant links; suggestion chips apply the query; unmatched query shows empty state; clear restores results; selecting a result opens the matching product. |
| 3 | Collections / CollectionPage | collections.spec.js | Directory links open matching collections; product cards open matching products; each supported sort orders correctly; availability/material/style/stone/price filters restrict results; clear restores collection; empty combinations show recovery. Test pagination only if rendered. |
| 4 | Product details / ProductPage | product-details.spec.js | Product title, images and price agree with selected item; gallery changes image; available options select correct variant; quantity controls enforce allowed values; availability controls purchase action; information panels open and close. |
| 5 | Quick view / QuickViewPage | quick-view.spec.js | Card opens matching product; close returns to listing; options update selection; Full Details opens matching product; add action uses selected variant. |
| 6 | Bag / CartPage | cart.spec.js | Empty state and continue-shopping destination; add selected variant; repeated add and distinct variants behave correctly; quantity changes update subtotal; removal restores empty state; drawer and cart agree; refresh preserves session bag. |
| 7 | Saved items / SavedItemsPage | saved-items.spec.js | Inspect destination first; then add/remove, count, empty state and session persistence if supported. Do not assume the visible Saved link implements a local wishlist. |
| 8 | Ear stack planner / EarStackPlannerPage | ear-stack-planner.spec.js | Open/close planner; choose one/two/three piercings; select and remove positions; change positions; preset selection; count/total match choices; save/share behavior; add complete stack with correct variants. |
| 9 | Virtual try-on / VirtualTryOnPage | virtual-try-on.spec.js | Open/close; decline camera; denied/unavailable camera offers recovery; controlled camera or synthetic photo preview; drag/scale; capture download; closing releases camera. Use synthetic media only. |
| 10 | Content and support / ContentPage, ContactPage | content.spec.js, contact.spec.js | Story and policy headings load; FAQ toggles answers; care links reach intended content; contact controls render; required/email validation blocks invalid submissions. Successful inquiry requires an approved test destination. |
| 11 | Newsletter / NewsletterPage | newsletter.spec.js | Both signup locations render; empty/invalid email validation; success/duplicate responses only with an approved test destination. |
| 12 | Account / AccountPage | account.spec.js | First inspect authentication redirect; then login/logout, invalid credentials and session behavior with a dedicated account. Registration/reset/email flows need controlled accounts. |
| 13 | Checkout / CheckoutPage | checkout.spec.js | Inspect transition from bag; verify items, totals, address/shipping validation and discounts in staging; payment outcomes and order confirmation only with sandbox payments. |

Repeat relevant navigation, collection, modal and bag scenarios at a mobile
viewport. Check keyboard opening/closing, focus return and accessible names when
inspecting menus/dialogs. Use live item data rather than fixed prices or stock.

## Initial observations to investigate

- Header and footer contain repeated destinations; scope locators to the relevant
  region instead of relying on the first matching link.
- Home contains planner and try-on controls, quick view, curated looks and two
  newsletter locations. Their presence does not establish working interactions.
- FAQ content includes unfinished answer text. Confirm in the rendered page and
  report as a content issue rather than encoding it as an expected answer.
- Jewellery care and FAQ links point to the same FAQ route. Header and footer
  story links use different routes; compare their content before choosing checks.
- Some social links on home point to `#`; verify intended destinations.
- Best Seller and Browse all links may point to the all-products collection;
  validate destinations against business expectations.

## Module 1 acceptance cases for review

| ID | Action | Expected result |
| --- | --- | --- |
| HOME-01 | Navigate to `/` | Successful page response, Winsome Glam title and visible main content. |
| HOME-02 | Follow Shop Earrings hero CTA | `/collections/earrings` opens with the Earrings heading. |
| HOME-03 | Follow Shop New In hero CTA | `/collections/new-in` opens with matching collection content. |
| HOME-04 | Use Collections, Our Story and Contact Us primary links | Each opens the destination declared by that header link and matching main content. |
| HOME-05 | Open Earrings menu and select Huggies/Studs/Rings | Intended collection opens; menu can also be dismissed without navigation. |
| HOME-06 | Follow logo from a collection | Returns to `/`. |
| HOME-07 | Open and close mobile navigation | Menu is usable at mobile width and closes without obscuring the page. |
| HOME-08 | Follow footer policy, FAQ and care links | Intended destinations load; duplicated care/FAQ destination is recorded for product review. |

Implemented with user authorization: `pages/HomePage.js` and
`tests/home-navigation.spec.js`. Coverage includes home loading, two hero CTAs,
five primary links, desktop menu dismissal and three collection destinations,
logo return, five footer destinations, and mobile menu dismissal/navigation.
Selectors use inspected roles, names and theme attributes; hero actions pause
the carousel and select slide one before clicking.

Verification: JavaScript syntax and Playwright test discovery only. These checks
do not establish that the live scenarios pass. No functional suite has been run.
Care/story footer inconsistencies, promotional behavior, account links, and
commerce interactions remain outside this first stable subset. Mobile nested
categories and keyboard focus behavior need further interactive inspection.

Run this module when browser execution is authorized:

```powershell
$env:BASE_URL = 'https://winsomeglam.com'
npm.cmd test -- tests/home-navigation.spec.js
```

## Module 2: Search implementation

Read-only interactive inspection on October 16, 2026 confirmed the header search
dialog, labelled combobox, default product options, Pearl predictive results,
unmatched-query empty state, suggestion interaction, whitespace reset, Escape
dismissal, and search input visibility at mobile width. Stable theme attributes
scope the dialog because its heading currently has no accessible text.

Added `pages/SearchPage.js`, `tests/search.spec.js`, and the `search` fixture,
which reuses the existing home fixture for navigation. All test titles begin
with Verify. Tests use one or two relevant assertions and no fixed delays.

| Cases | Expected result |
| --- | --- |
| Open search | Search input is visible. |
| Opening focus | Search input receives focus. |
| Default products | At least one default product is visible. |
| Close button | Dialog is dismissed. |
| Escape | Dialog is dismissed and focus returns to its trigger. |
| Product keyword | Pearl-related product results appear. |
| Unmatched query | Query-specific no-results status and heading appear. |
| Clear search | Empty input and default product results return. |
| Remove query | Original default status returns. |
| Whitespace-only query | Input resets and default products remain available. |
| Pearl, Huggies, Gold, Drops, Climbers (five independent cases) | Chip sets its query and a completed result or no-results status appears. |
| Select result | Destination product heading matches the selected product title. |
| Mobile open/close | Input is visible and close dismisses the dialog. |
| Mobile keyword | Relevant Pearl product results appear. |

Priority: high for keyword results, product navigation, and recovery; medium
for individual chips and focus behavior. Requires public site access and a
Pearl-related catalog product. Prices, stock, and result counts are not fixed.
Chip cases verify applying the query, without assuming every category has stock.
Product navigation is read-only and does not add to bag or submit an order.

Validation update, October 16: the initial unmatched-query and Drops failures
both passed after query-specific response and UI-idle synchronization was added.
The subsequent 38-case regression run passed 36 tests; FAQ navigation failed with
ERR_CONNECTION_CLOSED and one Pearl search timed out waiting for its response.
All five suggestion cases, clear recovery, focus return, product selection, and
mobile cases passed in that run. This is not an all-green full-suite result.
Network failure handling and full-page Enter submission remain outside this
initial subset; no artificial network failures were injected into the live site.

```powershell
npm.cmd run test:headed -- tests/search.spec.js
```

## Module 3: Collections and product listing implementation

Added `CollectionPage`, a `collection` fixture, and 29 independent cases in
`tests/collections.spec.js`. Positive, negative, boundary and mobile scenarios
are detailed in [collections-test-cases.md](collections-test-cases.md).
Read-only markup inspection confirmed collection controls and the zero-price
empty state on October 19, 2026. JavaScript syntax and Playwright discovery
passed; the functional suite has not been run. Ranking options without an
independent ordering oracle and product metafield validation remain outside
this initial subset. No later module has been implemented.

## Module 4: Product details implementation

Added `pages/ProductPage.js`, the `product` fixture, and 26 positive, negative,
functional, UI, keyboard and mobile cases in `tests/product-details.spec.js`.
See [product-details-test-cases.md](product-details-test-cases.md) for steps,
expected outcomes, prerequisites, limitations and observed content issues.
Read-only markup inspection confirmed the default product controls on October
19, 2026. Quantity is fixed at one; editable-quantity cases are not applicable.
Sold-out behavior has a data-dependent case and remains pending unavailable
variant data. Syntax and discovery checks passed; functional tests were not run.

## Module 5: Quick View implementation

Added `QuickViewPage`, the `quickView` fixture and 18 cases covering positive,
negative, recovery, UI, keyboard and mobile scenarios. See
[quick-view-test-cases.md](quick-view-test-cases.md) for expected results and
limitations. Public read-only inspection confirmed the modal and options.
The failure scenarios intercept product GET requests inside the test browser.
Actual cart submission remains pending the Cart module. Functional execution
has not been performed; sold-out coverage requires suitable catalog data.

## Module 6: Bag / Cart implementation

Added `CartPage`, isolated session-cart and available-variant fixtures, and 16
empty-state, UI entry-point, quantity, removal, persistence, boundary and mobile
cases. ProductPage and QuickViewPage expose Add to Bag actions for the entry-point
tests. See [cart-test-cases.md](cart-test-cases.md) for prerequisites and coverage
limitations. Empty and populated cart markup were inspected; the temporary
anonymous inspection cart was cleared. Functional test execution is pending.

## Module 7: Saved Items public entry points

Added `SavedItemsPage`, a `savedItems` fixture and nine anonymous UI, authentication
gate, keyboard, persistence-boundary and mobile cases. Read-only browser inspection
confirmed the Saved header points to Shopify authentication and guest collection
Save navigates to login. See [saved-items-test-cases.md](saved-items-test-cases.md).
Authenticated saved-list add/remove/count/persistence remains pending dedicated
account access and inspection; this module is partially covered. Syntax and
discovery passed, with no functional suite execution or account mutations.

## Module 8: Ear Stack Planner initial implementation

Added `EarStackPlannerPage`, a `planner` fixture and 20 functional, UI, keyboard,
negative, boundary and mobile cases. See
[ear-stack-planner-test-cases.md](ear-stack-planner-test-cases.md). The new public
inspection timed out; implementation uses previously captured planner markup and
script. Functional execution is pending. Local save is covered; actual sharing,
stack cart submission and storage-failure recovery remain outside this subset.

## Module 9: Virtual Try-On photo-path implementation

Added `VirtualTryOnPage`, the `tryOn` fixture and 17 UI, synthetic-photo, editing,
download, validation, recovery, keyboard and mobile cases. See
[virtual-try-on-test-cases.md](virtual-try-on-test-cases.md). The fixture disables
the camera API before page initialization and uses an in-memory generated image.
Real camera capture, permission denial and track-release behavior remain pending;
the functional suite has not been executed.

## Module 10: Content and Support initial implementation

Added `ContentPage`, `ContactPage`, fixtures and 33 story, policy, care, FAQ,
contact UI/validation, keyboard and mobile cases. Read-only inspection confirmed
contact/FAQ controls and the existing placeholder FAQ answers. Three content
quality checks are expected to fail until those answers are published. Contact
POSTs are blocked in the test browser; no inquiry is submitted. See
[content-support-test-cases.md](content-support-test-cases.md). Syntax and discovery
passed; functional execution is pending.

## Module 11: Newsletter validation implementation

Added `NewsletterPage`, a guarded `newsletter` fixture and 20 cases for both
home-page signup locations, invalid email validation, keyboard and mobile use.
Read-only inspection confirmed both forms and their duplicate form ID. Scoped
locators avoid that ambiguity. Two accessibility assertions are expected to expose
the observed missing email labels. Contact POSTs are blocked; success and duplicate
subscription behavior remain pending controlled test destinations. See
[newsletter-test-cases.md](newsletter-test-cases.md). Functional execution is pending.

## Module 12: Account anonymous entry-point implementation

Added `AccountPage`, an `account` fixture and 16 public entry-point, sign-in UI,
email input-constraint, keyboard and mobile cases. Read-only inspection confirmed
Shopify email-based authentication. Continue is not submitted; authenticated
login/logout and verification flows remain pending dedicated account access.
See [account-test-cases.md](account-test-cases.md). Native input validity does not
establish application submission validation because the form uses novalidate.
Syntax/discovery passed; functional suite execution is pending.

## Module 13: Checkout pre-submission implementation

Added `CheckoutPage`, guarded checkout fixtures and 27 pre-order UI, summary,
field-constraint, correction, policy and mobile cases. Read-only checkout-content
inspection used an isolated temporary cart, which was cleared. The live checkout
is a single page and currently reports that the store cannot accept payments;
a readiness test exposes that issue. No live Pay now action or order submission
was performed. Post-load browser mutations and final form submissions are blocked.
See [checkout-test-cases.md](checkout-test-cases.md) for safety boundaries, pending
sandbox scenarios and the distinction between local constraints and real server
validation. Functional suite execution is pending.

## Sources

- [Home](https://winsomeglam.com/)
- [Collections](https://winsomeglam.com/collections)
- [Earrings](https://winsomeglam.com/collections/earrings)
- [Contact](https://winsomeglam.com/pages/contact)
- [FAQ and care](https://winsomeglam.com/pages/faqs)
- [Shipping](https://winsomeglam.com/policies/shipping-policy)
- [Refunds](https://winsomeglam.com/policies/refund-policy)
