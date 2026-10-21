# Bag / Cart test cases

Module 6. Uses `CartPage`, the isolated `cart` fixture, `cartVariant` test-data
fixture, and `tests/cart.spec.js`. Locators and locator functions live in page
constructors, actions and data reading in page methods, and assertions in specs.

Public browser inspection confirmed empty-cart recovery, the populated cart table,
quantity controls, removal, totals and checkout control. One item was added to a
fresh anonymous inspection session and that session cart was cleared afterward.
Tests have been written; functional execution remains pending.

| Case | Scenario and expected result |
| --- | --- |
| CART-01 | Empty cart shows recovery and no checkout control |
| CART-02 | Continue shopping opens the all-products collection |
| CART-03 | Product Details adds the selected variant at quantity one; cart title agrees |
| CART-04 | Quick View adds its selected variant; cart title agrees |
| CART-05 | Cart title, loaded image, quantity, line total and estimated total agree with session cart JSON |
| CART-06 | Increase quantity updates count, line total and estimated total |
| CART-07 | Decrease quantity from two to one updates count and estimated total |
| CART-08 | Remove final item restores empty state and hides checkout |
| CART-09 | Reload preserves item, quantity and total |
| CART-10 | Repeated UI add of the same variant merges into one line at quantity two |
| CART-11 | UI add of a second available variant creates a separate line |
| CART-12 | Product link opens matching variant URL |
| CART-13 | Decrease is disabled at minimum quantity one |
| CART-14–15 | Negative and fractional quantities violate native input constraints |
| CART-16 | Mobile increase and removal update the cart and restore empty state |

Prerequisites: BASE_URL, Chromium, and a published available variant of
`cz-triple-diamond-drop-earrings`. Missing baseline stock fails setup rather than
silently skipping core cart tests. The distinct-variant scenario explicitly skips
if a second available variant does not exist. Stock must support quantity two for
quantity scenarios; real stock rejections are not suppressed.

Each test uses its own browser context and anonymous session cart. The fixture
does not clear an already fresh cart before setup. In teardown it reads the cart
and clears only a nonempty session. Cleanup errors are attached to the report;
they fail an otherwise passing test without replacing an existing primary error.
API seeding establishes
preconditions only; Product Details and Quick View entry-point tests and repeat
and distinct-variant cases add through the actual UI. No orders or checkout
submissions are performed. Cart API data checks UI consistency, not independent
catalog accuracy; numeric totals assume decimal-point currency formatting.

Negative/fractional cases check native input validity without blur/submission.
They do not establish server-side rejection, correction or recovery behavior.
Drawer/full-page agreement, injected mutation failures, inventory maximums,
discounts and multi-item removal preservation remain future coverage; checkout
is a separate module. Screenshots and traces use existing failure reporting.

Validation: JavaScript syntax and Playwright discovery pass for 16 cases. After
the initial full run encountered setup HTTP 429 responses, fixture corrections
were validated with two passing live cases (empty cart and Product Details add).
The full Cart suite has not yet been rerun; see `latest-run-code-fixes.md`.

```powershell
npm.cmd test -- tests/cart.spec.js
```

Seven modules remain after Cart: Saved Items, Ear Stack Planner, Virtual Try-On,
Content and Support, Newsletter, Account, Checkout.
