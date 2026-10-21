# Checkout test cases — stop before final order submission

Module 13 uses `CheckoutPage`, `checkout` / `checkoutSession` fixtures and
`tests/checkout.spec.js`. Locators and dynamic queries live in constructors;
actions, data reads and guards live in page methods; assertions stay in specs.
No generated Shopify CSS classes or session-token IDs are used as locators.

## Observed flow

Inspection used one item in a fresh anonymous cart, navigated directly to checkout,
and stopped without entering customer or payment data. The anonymous inspection
cart was cleared afterward. Checkout is a single page: Contact, Delivery, Shipping
method and Payment are already present, followed by Finalize order / Pay now.
There is no separate review step that can safely be assumed.

**Observed live issue:** Payment displays “This store can’t accept payments right
now.” The payment-readiness assertion deliberately fails while this remains.
It is not skipped or changed to accept a broken checkout.

## Coverage (27 cases)

| Group | Cases and expected results |
| --- | --- |
| Cart transition (1) | Cart Check out opens checkout containing selected product and Payment section |
| Sections (1) | Contact, Delivery, Shipping and Payment displayed |
| Item summary (1) | Cart product, variant and quantity appear |
| Monetary summary (1) | Subtotal equals session cart item subtotal; currency agrees |
| Shipping initial state (1) | Address-required prompt appears before rates are available |
| Field UI (1) | Delivery fields visible with labelled email/country/address controls |
| Country (1) | Configured United Kingdom option and selection exist |
| Consent UI (1) | Marketing checkbox toggles locally and returns to its original state |
| Policies (4) | Refund, Shipping, Privacy and Terms expose dialog controls |
| Final-control UI (1) | Pay now and Finalize order are present, without activation |
| Payment readiness (1) | Store does not display the observed payment-unavailable error |
| Delivery entry (1) | Synthetic names/address/city/postcode retain entered values locally |
| Optional phone (1) | Blank phone does not violate required constraints |
| Missing required values (5) | Email, last name, address, city and postcode violate input constraints when empty |
| Invalid email (2) | Two malformed formats violate email type constraints |
| Valid email (1) | Synthetic `.invalid` address passes syntax constraints without ordering |
| Correction (1) | Correcting email clears type mismatch |
| Mobile (2) | Fields/payment visible; summary expands with matching product |

## Live-site boundaries

- No test clicks Pay now, submits payment details, or creates an order. No page
  method for final order submission is provided. Tests use no card numbers or
  payment iframe interaction.
- A capture-phase guard blocks checkout form submits and known final-order button
  activations. A teardown check fails if the guard had to intercept an attempt.
- After checkout email and Payment are rendered, a browser-context route aborts
  **all non-read requests**, including automatic checkout updates. Service workers
  are blocked so routing can intercept browser requests. Do not add page routes
  that override this guard, or use API requests for order/payment endpoints.
- Initial checkout loading may negotiate/create an anonymous checkout session.
  Setup adds a real item to an isolated cart; API teardown clears that session
  cart. This does not erase checkout-session records or store analytics. Tests
  are therefore not strictly read-only even though they never place orders.
- Synthetic addresses and emails are used only after the mutation guard is
  installed. The address is not independently validated for delivery. Local input
  validity is not proof of checkout application/server validation.
- The isolated guard check clicks a synthetic Pay now button on a locally fulfilled
  `.invalid` test origin, never on the live checkout. It verifies interception of
  both final clicks and synthetic mutation requests without creating an order.

Live payment outcomes, shipping-rate/tax recalculation, discount application,
server validation, address normalization, billing-address alternatives, accelerated
payments, payment failures and order confirmation require a staging checkout with
sandbox payments. No discount input or selectable payment method was present in
the inspected state. Those controls are not invented for this suite. Reload,
multi-item checkout, native mobile/touch behavior and full accessibility/visual
audits remain additional coverage. This is a pre-submission subset, not complete
end-to-end checkout coverage.

Prerequisites: BASE_URL, installed Chromium, published default product and stock
for one item. Missing baseline stock fails setup. External checkout availability
is a real dependency. Monetary extraction assumes decimal-point currency amounts.
Checkout URLs contain session data; keep failure screenshots, traces and reports
private, following the project's existing artifact policy.

Validation: JavaScript syntax and discovery passed for 27 cases. Saved-checkout
locators, required-field validity, country options and subtotal extraction were
checked. Final-click and mutation guards passed an isolated synthetic check.
The live functional suite has not been executed. The payment-readiness issue was
observed during inspection, not reported as a completed test run.

```powershell
npm.cmd test -- tests/checkout.spec.js
```

All 13 planned modules now have initial written coverage. Previously documented
functional execution, authenticated scenarios, camera behavior, planner sharing
and checkout sandbox coverage remain pending; the overall project is not declared
fully verified.
