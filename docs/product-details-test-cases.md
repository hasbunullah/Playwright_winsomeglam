# Product details test cases

Written October 19, 2026. Module 4 follows the existing JavaScript ES module,
Playwright Test, constructor-defined locators, page actions, fixture and separate
scenario assertions structure. Each title starts with Verify. No fixed delays,
retries, configuration changes or later-module implementations were added.

Files: `pages/ProductPage.js`, `tests/product-details.spec.js`, and the `product`
fixture in `fixtures/pages.fixture.js`.

Read-only browser inspection confirmed the public product page at
`/products/cz-triple-diamond-drop-earrings`: seven images, Gold/Silver options,
variant JSON, price, comparison price, SKU, stock, primary/sticky purchase controls,
four native information panels and a hidden quantity of one. The two inspected
variants were available. Expected interactions below are acceptance criteria;
markup inspection does not establish that they pass.

| ID | Category | Steps | Expected result |
| --- | --- | --- | --- |
| PDP-01 | Positive/UI | Open product | Heading and breadcrumb match the product title |
| PDP-02 | Positive | Read selected variant, price and SKU | Displayed price and SKU match embedded variant data |
| PDP-03 | Positive/UI | Inspect comparison price | Higher comparison price is shown for a discount; otherwise hidden |
| PDP-04 | UI | Inspect active product image | Image loads and has nonempty alternative text |
| PDP-05 | Functional | Select second thumbnail | Matching slide is active and thumbnail current states update |
| PDP-06 | Functional | Select another thumbnail; return to first | Original media returns and only one thumbnail is current |
| PDP-07 | Keyboard | Focus second thumbnail; Enter | Matching media activates and focus remains on thumbnail |
| PDP-08 | Functional | Select another variant | Selected options, option labels, URL, variant ID, price and SKU agree |
| PDP-09 | Functional | Change variant; reload | Variant ID and first option selection persist |
| PDP-10 | Positive | Select an available variant | Add and Buy controls enabled; in-stock text and purchase price agree |
| PDP-11 | Boundary | Inspect product quantity field | Quantity is hidden and fixed at one |
| PDP-12 | UI | Select last variant; inspect sticky metadata | Sticky price and variant title match current selection |
| PDP-13–16 | Functional/UI | Open and close Description, Materials & Dimensions, Jewellery Care, Shipping & Returns | Content is nonempty and visibility follows open state |
| PDP-17 | Keyboard | Open care panel with Enter; close with Space | Content visibility follows keyboard actions |
| PDP-18 | Negative | Navigate to deliberately unknown product handle | HTTP 404 and not-found content; no product purchase control |
| PDP-19–20 | Negative | Open product with variant 0 / not-a-variant | Page recovers to a valid variant with matching price and availability state |
| PDP-21 | Negative | Select an unavailable variant | Add and Buy disabled; Sold Out and Out of stock text shown |
| PDP-22 | Boundary | Select same variant twice | One checked option per group; variant identity unchanged |
| PDP-23 | Mobile UI | Open at 390 × 844; inspect purchase region | Product details and actions visible; no horizontal document overflow |
| PDP-24 | Mobile functional | Select second variant | Variant ID and price update |
| PDP-25 | Mobile functional | Select second thumbnail | Matching image becomes active and visible |
| PDP-26 | Mobile functional | Open and close care panel | Panel content expands and collapses |

Prerequisites: BASE_URL, installed Chromium and public catalog access. The default
product handle must remain published. Tests read current prices and IDs from the
embedded product data, which checks UI consistency rather than independently
auditing catalog accuracy. Monetary assertions assume the inspected storefront's
decimal-point currency formatting. Multi-image, multi-variant, available-variant
and sold-out cases skip explicitly when the corresponding data does not exist.
The sold-out case is currently expected to skip; its coverage remains pending
controlled catalog data. Invalid-ID fallback and 404 behavior are proposed
acceptance criteria pending execution. Mobile coverage uses emulation.

No editable quantity control is rendered, so zero, negative, fractional and
maximum editable quantities are not applicable to this page. No synthetic
unavailable option combinations or inventory changes are introduced. Purchase
actions, cart/network-error handling, wishlist, planner and try-on interactions
belong to their respective modules. UI cases inspect visibility and state;
pixel comparison and a full accessibility audit are outside this subset.

Content finding: Shipping & Returns includes “Update this text for your current
policy.” This is recorded as a content issue, not an expected policy answer.
Materials & Dimensions contains general advice rather than specific measurements.
These findings need content-owner review; the panel tests check interaction only.

Validation: JavaScript syntax checks and Playwright discovery passed for all
26 cases. The functional suite has not been run.

Run when functional execution is requested:

```powershell
npm.cmd test -- tests/product-details.spec.js
```
