# Quick View test cases

Module 5, written October 19, 2026. Uses `pages/QuickViewPage.js`, the `quickView`
fixture and `tests/quick-view.spec.js`. Locators and dynamic locator functions are
defined in the constructor; actions and browser/data reading stay in page methods;
expected outcomes stay in the specs. Existing reporting and execution settings
are unchanged.

Read-only interactive inspection confirmed collection-card Quick View, the modal,
product title/image/description/price/SKU, colour selector and Full Details link.
The default Earrings product has Gold and Silver variants. Amounts, variant IDs
and stock are read from live product data; numeric price assertions assume the
inspected decimal-point currency format. Tests require BASE_URL and that the
Earrings collection remains populated with the inspected theme controls.

| Case | Category | Steps and expected result |
| --- | --- | --- |
| QV-01 | Positive | Open card Quick View; matching title appears without leaving collection |
| QV-02 | UI | Open modal; image loads with alternative text |
| QV-03 | Positive | Compare title, selected price and SKU with public product JSON; description is nonempty |
| QV-04 | Functional | Select another variant; selected option values, purchase variant ID, price and SKU agree |
| QV-05 | Positive | Select available variant; Add enabled for the selected ID |
| QV-06 | Navigation | Full Details opens the selected product URL and heading |
| QV-07 | Functional | Close button hides modal and restores trigger focus |
| QV-08 | Keyboard | Escape hides modal and restores trigger focus |
| QV-09 | Functional | Backdrop dismisses modal |
| QV-10 | UI | Open locks body scrolling; close restores scrolling |
| QV-11 | Keyboard | Enter on trigger opens and focuses modal |
| QV-12 | Keyboard | Tab from last control wraps to Close; Shift Tab wraps back |
| QV-13 | Negative | Locally simulate HTTP 503 product fetch; error and retry visible; purchase disabled |
| QV-14 | Recovery | Restore real product fetch and Retry; matching product loads, retry/error clear |
| QV-15 | Recovery | Close after simulated failure; modal dismisses and focus returns |
| QV-16 | Negative | Select sold-out variant; purchase disabled with Sold Out label |
| QV-17 | Mobile UI | Open matching product on mobile; Full Details visible; close dismisses |
| QV-18 | Mobile navigation | Full Details opens matching product page |

Failure simulation intercepts only the test browser's product JSON GET request;
it does not change store data. No Add, checkout, account or other write action is
submitted. Selected-variant purchase state is checked here; actual cart contents
after adding belong to the Cart module and remain pending. Multi-variant,
available-variant and sold-out cases skip explicitly when required data is absent.
The inspected product currently has no sold-out variant, so QV-16 is expected to
skip. Public product JSON is a UI consistency oracle, not an independent audit of
catalog accuracy. Mobile uses browser emulation. No functional suite has been run.

Validation: JavaScript syntax and Playwright discovery passed for all 18 cases.
These checks do not establish functional passes.

Run when execution is requested:

```powershell
npm.cmd test -- tests/quick-view.spec.js
```

After this module, eight planned modules remain: Cart, Saved Items, Ear Stack
Planner, Virtual Try-On, Content and Support, Newsletter, Account, and Checkout.
