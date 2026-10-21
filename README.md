# E-commerce Playwright POM

Phase 1 scaffold using JavaScript and Playwright's built-in test runner.
Website discovery is documented in [docs/automation-plan.md](docs/automation-plan.md).
Module 1 has a HomePage class and home/navigation specs. Latest browser verification:
all 20 tests passed in one complete Chromium run (2.1 minutes).
Module 2 adds 18 search tests and a SearchPage class using the existing fixture.
The two initial search failures passed after request/UI synchronization was
added. The subsequent 38-test regression run passed 36 tests; FAQ navigation
encountered a closed connection and one product search timed out waiting for its
response. Live network failures still need investigation if they recur.

## Structure

Corrections after the first 269-case run and seven passing targeted validation
cases are documented in [docs/latest-run-code-fixes.md](docs/latest-run-code-fixes.md).
The original full-run reports are preserved; follow-up reports are separate under
`.verification/`. The complete suite has not yet been rerun after these fixes.

Module 13 adds `CheckoutPage` and 27 guarded pre-submission checkout cases.
No live Pay now action, payment details or order submission is included. See
[docs/checkout-test-cases.md](docs/checkout-test-cases.md) for guard behavior and
pending sandbox coverage. A payment-readiness check is expected to expose the
observed store payment configuration issue. Functional execution is pending.

Module 12 adds `AccountPage` and 16 anonymous Account/sign-in cases. No login codes
are requested. See [docs/account-test-cases.md](docs/account-test-cases.md) for
scope and pending authenticated coverage. Functional execution is pending.

Module 11 adds `NewsletterPage` and 20 signup UI/validation cases across main and
footer locations. Contact POSTs are blocked, and valid emails are not submitted.
See [docs/newsletter-test-cases.md](docs/newsletter-test-cases.md) for pending
subscription flows and the two expected missing-label failures. Functional
execution is pending.

Module 10 adds Content and Support with 33 cases in `content.spec.js` and
`contact.spec.js`. See [docs/content-support-test-cases.md](docs/content-support-test-cases.md).
Contact submissions are blocked in the test browser. Three FAQ publication checks
are expected to expose the observed placeholder answers; functional execution is
pending.

Module 9 adds `VirtualTryOnPage` and 17 synthetic-photo and camera-unavailable
cases. See [docs/virtual-try-on-test-cases.md](docs/virtual-try-on-test-cases.md).
No real camera or personal photos are used; functional execution is pending.

Module 8 adds `EarStackPlannerPage` and 20 planner cases using the shared POM
structure. See [docs/ear-stack-planner-test-cases.md](docs/ear-stack-planner-test-cases.md)
for coverage and pending flows. Functional execution is pending; planner tests
do not submit stacks to the cart or invoke sharing.

Module 7 adds nine anonymous Saved Items cases and `SavedItemsPage`. The actual
public Saved flow requires Shopify authentication. Authenticated add/remove and
persistence coverage remains pending a dedicated test account; see
[docs/saved-items-test-cases.md](docs/saved-items-test-cases.md). Functional
execution is pending.

Module 6 adds `CartPage` and 16 cart cases, with isolated anonymous session setup
and cleanup. See [docs/cart-test-cases.md](docs/cart-test-cases.md). Functional
execution is pending; no checkout or orders are submitted by this module.

Module 5 adds `QuickViewPage` and 18 Quick View cases using the same POM structure.
See [docs/quick-view-test-cases.md](docs/quick-view-test-cases.md) for scenarios,
simulated failure handling and test-data requirements. Functional execution is
pending; purchase submission is reserved for the Cart module.

Module 4 adds `ProductPage` and 26 product-details cases using the shared fixture
structure. Positive, negative, functional, UI, keyboard and mobile scenarios are
documented in [docs/product-details-test-cases.md](docs/product-details-test-cases.md).
Syntax and discovery checks passed; functional execution is pending. The sold-out
case requires an unavailable variant and otherwise skips explicitly.

```text
pages/                 Page classes, added after module approval
tests/                 Independent *.spec.js files, added after module approval
playwright.config.js   Browser, execution, and reporting configuration
package.json           Scripts and the single development dependency
```

The `.gitkeep` files preserve the empty directories in version control.
Add `fixtures/`, `utils/`, or `test-data/` only when an approved module needs them.

## Setup

Install Node.js 22 or newer with npm, then run:

```powershell
npm install
npx playwright install chromium
```

`npm install` generates `package-lock.json`; commit it for reproducible installs.
Use `npm ci` on subsequent clean installs once the lockfile exists.

Keep local environment settings in `.env`. For a fresh checkout, create it from
the example:

```powershell
Copy-Item .env.example .env
```

The Playwright config loads `.env` using Node's built-in loader. `BASE_URL` is
set to `https://winsomeglam.com`. Existing shell or CI variables take precedence.
`.env` is ignored by Git; `.env.example` contains the shared setup template.

## Commands

After test cases and execution are approved:

```powershell
npm test
npm run test:headed
npm run test:ui
npm.cmd run report
```

`npm run test:list` discovers tests without running browser actions.

Run only the Search module with a visible browser after execution approval:

```powershell
npm.cmd run test:headed -- tests/search.spec.js
```

Execution uses Chromium, two parallel workers, and zero retries to limit traffic
and avoid repeating production actions automatically. HTML reports are generated
without opening a browser. Failed runs retain traces and screenshots; these can
contain customer or session data, so keep artifacts private. Generated artifacts
and saved authentication state are ignored by Git.

Avoid running two suites against the same output directory at the same time:
each run clears that directory, which can delete another run's trace files.
Agent verification artifacts are kept separately under `.verification/`.

Independent tests run in parallel with separate browser contexts. For debugging,
use `npm.cmd test -- --workers=1`. To try four workers on a suitable machine, use
`npm.cmd test -- --workers=4`. More workers can increase server or network
contention; compare measured times before increasing the default.
The first two-worker benchmark finished in 2.6 minutes: 22 passed, then 16 failed
at navigation with `ERR_NETWORK_CHANGED`. This interrupted run does not establish
the duration of a successful full suite; rerun on a stable network to measure it.

## Allure report

Run the complete suite and automatically refresh the report:

```powershell
npm.cmd test
```

For the same suite with a visible browser:

```powershell
npm.cmd run test:headed
```

After either run, view the report:

```powershell
npm.cmd run report
```

Allure 3 runs locally on Node.js; Java is not required. Each run starts with clean
`allure-results/` data and replaces the contents of the same `allure-report/`
folder after execution. There are no dated report folders or accumulated old
test results. The previous report remains available while tests run.
The separate `.allure/history.jsonl` file retains up to 20 runs for trend charts.

The report includes suites, test statuses, durations, failures, and Playwright
attachments when available. Automatic hook/action detail is disabled to keep the
report readable. Reports are generated even when tests fail, and the command
still exits with a failure code. A report-generation error also fails the command.

Filtered runs use the same report location and replace it with the selected
tests only. Run the full suite again to restore a complete report. Run one suite
at a time because result and report folders are shared. UI mode and direct
`npx playwright test` runs do not use the automatic clean-and-generate wrapper;
use the commands above for a refreshed Allure report. Listing tests does not
change the report. The original Playwright report remains available through
`npm.cmd run report:playwright`.

Reference: [Allure configuration](https://allurereport.org/docs/v3/configure/).

## Conventions

- Name page files `ProductPage.js` and export a matching `ProductPage` class.
- Define each page's locators in its constructor using the supplied Playwright page.
- Define dynamic locator functions in that constructor too. Specs use page properties
  or those functions; keep selectors, role queries and locator chaining out of specs.
- Prefer role, label, and stable test ID locators verified against the website.
- Keep page actions in the page class and scenario assertions in test files.
- Specs call page methods for navigation, interaction and reading UI data. Keep
  browser evaluation, parsing and reusable interaction logic inside the page class;
  keep expected outcomes and comparisons visible in the specs.
- Name test files by module, such as `product-details.spec.js`.
- Use Playwright's isolated page fixture, built-in assertions, and automatic waits.
- Add shared helpers or fixtures only when real reuse justifies them.
- Keep credentials out of source files and test data.

## Approval boundaries

1. Review this structure before starting website analysis.
2. Inspect the supplied website read-only and document verified findings separately
   from assumptions. Present scenarios and expected results before writing tests.
3. Implement one approved module at a time. Execute tests only with approval and
   available browser access, then wait for approval before the next module.

Do not place orders, submit payments, create or modify accounts, submit contact
forms or subscriptions, or change production data without explicit authorization.
Use staging, sandbox payments, and dedicated test accounts where needed. Never
bypass CAPTCHA, authentication, or other security controls.

Reference: [Playwright configuration](https://playwright.dev/docs/test-configuration).
