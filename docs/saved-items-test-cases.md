# Saved Items test cases

Module 7: anonymous entry-point coverage. `SavedItemsPage` owns constructor-defined
locators, navigation, actions and data reading. `tests/saved-items.spec.js` owns
the expected results. The `savedItems` fixture uses an isolated browser context.

Read-only inspection on October 19, 2026 confirmed that the header Saved link
points to Shopify account authentication, its anonymous counter is zero, and a
collection Save click navigates to Shopify login. This is not a public local
wishlist. No login, registration, password reset or account mutation was performed.
Product and mobile cases below are acceptance criteria based on inspected theme
controls; their interactions have not been functionally executed.

| ID | Category | Steps and expected result |
| --- | --- | --- |
| SAVE-01 | UI/positive | Open fresh collection session; Saved is visible, accessible name/count are zero, local saved list empty |
| SAVE-02 | UI | Collection Save is unpressed with a meaningful Save accessible name |
| SAVE-03 | Persistence boundary | Reload fresh session; counter/list stay empty and product remains unselected |
| SAVE-04 | Functional | Header Saved navigates to Shopify account/login |
| SAVE-05 | Keyboard | Enter on Saved navigates to Shopify account/login |
| SAVE-06 | Negative/authentication | Guest collection Save redirects to authentication; returning to collection shows no saved item or count increment |
| SAVE-07 | Negative/authentication | Guest Product Details Save redirects to authentication; returning shows no saved state or count increment |
| SAVE-08 | Mobile | Mobile menu shows zero Saved count; Saved opens authentication |
| SAVE-09 | Mobile negative | Collection Save requires authentication |

Authentication destinations are asserted against the known Shopify host and
account/login path shapes; rotating query tokens are intentionally not fixed.
Tests wait for navigation commit rather than submitting any authentication form.
External authentication availability remains a real runtime dependency. The local
storage read observes the current theme's `wg-wishlist-products` key without
writing synthetic logged-in state or bypassing authentication.

Requirements: BASE_URL, Chromium, public catalog access, the populated Earrings
collection and the published default product. Authenticated saved-list rendering,
add/remove, duplicate prevention, count changes, empty-state recovery after
removal, cross-page/account persistence and storage-error handling are NOT covered
by these nine cases. They remain pending a dedicated test account and inspection
of the authenticated destination. No unconditional passing placeholders or silent
skips were added for these missing flows. This module is therefore partially
covered, not fully functionally complete.

Validation: JavaScript syntax and discovery of nine cases passed. Functional
execution has not been run.

```powershell
npm.cmd test -- tests/saved-items.spec.js
```

Six later modules remain: Ear Stack Planner, Virtual Try-On, Content and Support,
Newsletter, Account, Checkout. Authenticated Saved Items coverage remains open
in addition to those six modules.
