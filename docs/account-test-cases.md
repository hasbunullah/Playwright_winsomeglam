# Account test cases

Module 12 uses `AccountPage`, the `account` fixture and `tests/account.spec.js`.
Locators and dynamic queries belong to constructors; actions and data reading
are page methods; expected outcomes remain in specs. No generated Shopify class
names, rotating identity tokens or generated form IDs are used as selectors.

Public inspection confirmed `/account` redirects to Shopify email-based sign-in,
with a labelled Email input, Continue button, marketing-consent checkbox, store
identity link, and Terms/Privacy dialog controls. There is no initial password
field. Navigation needed a commit/control readiness check after an initial load
timeout. No email was entered and no identity form was submitted during inspection.

| ID | Scenario and expected result |
| --- | --- |
| ACCOUNT-01 | Desktop Account link is visible and targets `/account` |
| ACCOUNT-02 | Account click opens Shopify sign-in and heading |
| ACCOUNT-03 | Enter on Account opens sign-in |
| ACCOUNT-04 | Direct `/account` navigation opens email-based sign-in, not password input |
| ACCOUNT-05 | Email input is labelled, required, email type and autocomplete email |
| ACCOUNT-06 | Empty email fails required constraints |
| ACCOUNT-07–08 | Two malformed email formats fail type constraints |
| ACCOUNT-09 | Whitespace-only email is empty and invalid |
| ACCOUNT-10 | Syntactically valid synthetic email passes constraints without requesting a code |
| ACCOUNT-11 | Correcting malformed email clears type mismatch |
| ACCOUNT-12 | Marketing checkbox toggles locally and can be restored |
| ACCOUNT-13 | Terms and Privacy buttons are visible and declare dialogs |
| ACCOUNT-14 | Store identity link returns to storefront |
| ACCOUNT-15 | Mobile Account menu entry opens sign-in |
| ACCOUNT-16 | Mobile email/Continue are visible; malformed email violates constraints |

The inspected form uses `novalidate`; native input validity is not proof that
Shopify's application blocks submission or displays correct error feedback.
Continue is never clicked in this subset. A fixture intercepts non-read requests
to the inspected `shopify.com` identity host and aborts them locally as an extra
guard; this may also block identity-host telemetry. These are anonymous tests,
not authenticated session tests. Marketing checkbox interaction does not submit
consent or subscribe the address. Synthetic addresses use `.invalid`.

Successful login, code request/delivery, invalid or expired verification codes,
rate limiting, account creation, logout, session persistence and authenticated
Saved Items require a dedicated controlled account and separate authorization
for the relevant identity actions. No CAPTCHA or security controls are bypassed.
Policy-dialog contents/interactions remain outside this initial subset.

Requires BASE_URL, Chromium, public storefront and Shopify identity availability.
The destination assertion matches the observed HTTPS Shopify login route while
allowing rotating store identifiers/query tokens. Mobile uses emulation. Syntax,
discovery and saved-markup locator/input-constraint checks passed for 16 cases;
the live functional suite has not been executed. This is partial Account coverage.

```powershell
npm.cmd test -- tests/account.spec.js
```

Checkout is the final planned module; earlier documented gaps remain open.
