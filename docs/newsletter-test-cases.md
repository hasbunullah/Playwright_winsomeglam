# Newsletter test cases

Module 11 uses `NewsletterPage`, the isolated `newsletter` fixture and
`tests/newsletter.spec.js`. Locators are defined in the page constructor;
navigation, actions, routing and validity reads are page methods; assertions and
expected values stay in specs. Execution/report settings are unchanged.

Read-only inspection confirmed two home-page signup forms: the main newsletter
form and footer form. Both submit customer/newsletter fields to `/contact` and
have required email inputs. They share `id="contact_form"`, so locators scope by
main/footer and theme form class instead of the duplicate ID or generated IDs.
After a full-page-load timeout, inspection succeeded by waiting for form controls
after navigation commit. No email was entered or subscribed during inspection.

## Cases (20)

Each location has nine independent cases:

1. Required email input and submit button render.
2. Email input has a meaningful accessible name.
3. Empty submission is blocked and input receives focus.
4. Email without an at-sign is rejected.
5. Email without a domain is rejected.
6. Whitespace-only input is rejected as empty.
7. A syntactically valid email passes native validation without submission.
8. Editing one location leaves the other location unchanged.
9. Enter on an empty email is blocked.

Two mobile cases verify visible controls and malformed-email rejection, one for
each location. All blocked-submission cases require zero attempted contact POSTs.

## Actual findings and boundaries

The inspected email inputs have placeholders but no associated labels, aria-label
or aria-labelledby. Two accessible-name cases are expected to fail until meaningful
labels are added. Placeholder text is not accepted as a substitute. The duplicate
form ID is recorded as a markup issue; scoping prevents it from making selectors
ambiguous, but does not resolve the website defect.

The fixture blocks POSTs to `/contact` before opening the page. If native
validation regresses, an attempted request is aborted locally and the test fails;
the guard does not simulate subscription success. Valid-email cases never click
Submit. Synthetic addresses use the reserved `.invalid` domain. No production
subscriber is created and no marketing email is requested by these cases.

Browser validity is not proof that an address is deliverable or accepted by the
server. Successful subscriptions, duplicate-address responses, server failures,
consent workflows and confirmation emails remain pending a controlled destination
and separate inspection. These cases do not bypass CAPTCHA or authentication.
Requires BASE_URL, Chromium and the inspected published home-page sections.
Native validation messages are not fixed because they depend on browser locale.
Mobile uses emulation; this is not a full accessibility or visual audit.

Validation: syntax, discovery, saved-markup locator and native-email validity
checks passed. All 20 cases are discoverable. The live functional suite has not
been executed; the expected accessibility failures are not a claim of test runs.

```powershell
npm.cmd test -- tests/newsletter.spec.js
```

Two later modules remain: Account and Checkout. Previously documented coverage
gaps in other modules also remain open.
