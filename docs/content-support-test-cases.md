# Content and Support test cases

Module 10 uses `ContentPage`, `ContactPage`, matching fixtures, `content.spec.js`
and `contact.spec.js`. Locators and dynamic queries are defined in constructors;
actions, routing and DOM reading stay in page methods; assertions stay in specs.

Read-only public inspection confirmed contact labels, required fields, topic
values, contact channels, FAQ route, question buttons, expanded attributes and
placeholder FAQ answers. Story/policy expectations use the existing site inventory.
No live inquiry, email, phone call, account action or order was submitted.

## Content cases (17)

| Cases | Expected outcome |
| --- | --- |
| Story routes `/pages/our-story` and `/pages/our-story-1` | Story heading, three key sections and substantive paragraph content |
| Terms, Shipping, Privacy and Refund policies | Correct heading and nonempty policy body identifying the brand |
| Daily, Storage and Water care cards | Visible heading and guidance |
| Each of three FAQ questions | Expand/collapse changes answer visibility and `aria-expanded` |
| Each FAQ answer's publication quality | Answer is nonempty and does not contain the known placeholder |
| Keyboard FAQ | Enter toggles answer and retains focus |
| Mobile FAQ | Answer expands and state agrees |

Known content defect: all three inspected answers contain “Provide the answer to
the frequently asked question here.” The three publication-quality assertions
are expected to fail while that text remains. They are deliberately neither
skipped nor changed to accept placeholder text. Observed content is evidence of
the defect, not a claim that these tests have already been executed.

## Contact cases (16)

| Cases | Expected outcome |
| --- | --- |
| Field UI | Accessible labels and required name/email/message controls |
| Contact channels | Email and telephone links have appropriate URI schemes |
| FAQ navigation | Opens `/pages/faqs` with care heading |
| Empty form | Name receives focus; invalid; no contact POST attempted |
| Missing name/email/message independently | Corresponding field reports missing value, receives focus and blocks submission |
| Two malformed email formats | Type mismatch, email focus and no contact POST |
| Valid required fields with blank order number | Browser form validity succeeds without submitting |
| Five inquiry topics independently | Selected value matches intended topic |
| Mobile form | Entered data retained and browser validation succeeds |

The contact fixture intercepts POST requests to `/contact` and aborts them locally.
Invalid-submission tests additionally assert that the browser did not even attempt
such a POST. The guard prevents sending an inquiry if client validation regresses;
it does not manufacture a success response. Valid-form tests never click Send.
Test email addresses use the reserved `.invalid` domain. No guard bypass or
successful live submission is part of these tests.

Prerequisites: BASE_URL, Chromium and the inspected published routes and theme.
Native validation messages are not hard-coded because their language depends on
the browser. HTTP failures and missing content fail visibly. Mobile uses emulation.
Policy tests check availability/content structure, not legal accuracy or compliance.
FAQ assertions check interaction, not whether business answers are factually correct.
Successful inquiries, server errors, CAPTCHA handling, whitespace-only acceptance,
maximum lengths, complete keyboard/accessibility and pixel-layout audits remain
outside this initial subset. No authenticated support flows are covered.

Validation: JavaScript syntax, test discovery and saved-markup locator checks passed.
All 33 cases are discoverable; the functional suite has not been run.

```powershell
npm.cmd test -- tests/content.spec.js tests/contact.spec.js
```

Three later modules remain: Newsletter, Account and Checkout. Earlier documented
authenticated Saved Items, planner and camera coverage gaps also remain open.
