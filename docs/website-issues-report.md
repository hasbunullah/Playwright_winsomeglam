# Winsome Glam — website issue report

Prepared October 19, 2026 from recorded inspection evidence. This report does not
represent a new live recheck or a completed functional suite run. Prior module
documents already contain these findings; no external issue-tracker submission
has been made by the assistant in this conversation. Whether someone else has
already filed them is unknown. Priorities below are suggested for triage.

## Observed issues

### WG-001 — Checkout reports that payments are unavailable

- **Module:** Checkout. **Suggested priority:** High, investigate first.
- **Location:** Checkout reached from `/checkout` with a populated anonymous cart.
- **Steps:** Add an available item to a fresh session cart; open checkout; inspect
  Payment. Stop before Pay now.
- **Actual:** “This store can’t accept payments right now.”
- **Expected:** The live checkout offers the configured payment methods without a
  payment-unavailable configuration error.
- **Impact:** Checkout is reporting a problem that may prevent purchases. Payment
  authorization/order failure was not exercised; the cause is not established.
- **Evidence:** `.verification/checkout-markup.html` and `checkout-test-cases.md`.
- **Written detection:** `Verify the store is ready to accept payment`.

### WG-002 — Three FAQ answers contain unfinished template text

- **Module:** Content and Support. **Suggested priority:** Medium.
- **Location:** `/pages/faqs`.
- **Steps:** Expand each question: “Will these tarnish?”, “Are they safe for
  sensitive ears?”, “How long does international delivery take?”
- **Actual:** Each contains “Provide the answer to the frequently asked question
  here.”
- **Expected:** A published answer relevant to the question.
- **Impact:** Customers cannot obtain the promised product/delivery guidance.
- **Evidence:** `.verification/faq-markup.html` and `content-support-test-cases.md`.
- **Written detection:** Three independent FAQ publication-quality assertions.

### WG-003 — Both newsletter email inputs lack programmatic labels

- **Module:** Newsletter. **Suggested priority:** Medium.
- **Location:** Main newsletter section and footer on `/`.
- **Steps:** Inspect each email input's associated label and accessible name.
- **Actual:** Inputs have placeholders, but no associated label, aria-label or
  aria-labelledby providing an accessible email-field name.
- **Expected:** Each email input has a meaningful programmatic label, preferably
  a visible associated label.
- **Impact:** Email fields are not reliably identified through accessibility APIs.
- **Evidence:** `.verification/newsletter-dom.html` and `newsletter-test-cases.md`.
- **Written detection:** One accessible-name assertion for each location.

### WG-004 — Newsletter forms share the same HTML ID

- **Module:** Newsletter. **Suggested priority:** Low.
- **Location:** Main and footer signup forms on `/`.
- **Steps:** Inspect the two form elements.
- **Actual:** Both use `id="contact_form"`.
- **Expected:** Form IDs are unique within the document, with corresponding
  references updated consistently.
- **Impact:** ID-based scripts and fragment references can target the wrong form.
  A customer-visible submission malfunction has not been demonstrated.
- **Evidence:** `.verification/newsletter-dom.html`.
- **Test status:** Documented finding. Existing tests scope forms by section/class;
  there is no dedicated duplicate-ID assertion.

### WG-005 — Product Shipping & Returns contains editing instructions

- **Module:** Product Details. **Suggested priority:** Medium.
- **Location:** `/products/cz-triple-diamond-drop-earrings`, Shipping & Returns.
- **Steps:** Open the product and expand Shipping & Returns.
- **Actual:** Customer-facing text includes “Update this text for your current
  policy.”
- **Expected:** Final published guidance consistent with the approved policy,
  with no template/editor instructions.
- **Impact:** Unfinished shipping/returns guidance reduces clarity and trust.
- **Evidence:** `.verification/product-dom.html` and `product-details-test-cases.md`.
- **Test status:** Documented finding. Current panel tests check interaction and
  nonempty content; they do not specifically reject this sentence.

## Findings needing confirmation before filing as defects

| Finding | Recorded observation | What needs confirmation |
| --- | --- | --- |
| Product measurements | Materials & Dimensions gives general advice rather than specific measurements | Whether product-specific dimensions are required and where they should appear |
| Social destinations | Initial inventory notes some links pointing to `#` | Which current visible links are affected and intended external destinations |
| Best Seller / Browse all destinations | Initial plan questions links leading to all-products collection | Current hrefs and business-approved destinations |
| Story route consistency | Header/footer use `/pages/our-story-1` and `/pages/our-story` | Whether separate routes are intentional; captured content is similar |
| Care / FAQ destination | Both link to `/pages/faqs` | May be intentional because that page includes care guidance and questions |

These observations are not equivalent to confirmed broken functionality. They
should not be filed with invented expected destinations or business requirements.

## Execution limitations are not website defects

Intermittent connection errors/timeouts occurred in earlier runs and inspections.
They are not attributed to the website without repeatable evidence. Authenticated
Saved Items, login/logout, real camera capture, successful subscriptions/inquiries,
planner sharing and sandbox payment outcomes remain coverage gaps, not defects.

## Summary

Five observed issue groups are ready for owner triage. Two span multiple controls:
WG-002 covers three FAQ answers and WG-003 covers two email inputs. Together,
WG-001, WG-002 and WG-003 correspond to six written assertions expected to expose
the observed problems. Those assertions have not been executed as a live suite.
WG-004 and WG-005 are documented observations without dedicated defect assertions.

No live order/payment was submitted. Inspection artifacts can contain session
identifiers or rotating tokens; keep the raw HTML private and redact it before
attaching evidence to an external ticket.
