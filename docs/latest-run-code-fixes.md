# Corrections following the 269-case run

The reviewed full run contains 216 passed, 48 failed, 3 broken and 2 skipped
results. Failed + broken = 51 unsuccessful tests. Original Allure and Playwright
full-run reports are preserved; validation uses separate folders in `.verification`.

## Test-code corrections

- Product URL expectations accept the collection-prefixed and canonical product
  paths, keeping the same origin, exact handle and explicit variant requirement.
  A wrong product, different host or wrong requested variant still fails.
- Mobile product media selection scrolls the actual gallery track when desktop
  thumbnails are hidden. It exercises the site's scroll handler without forcing
  a hidden click or assigning the active-media state. This does not prove native
  touch/swipe behavior.
- Product Details and Virtual Try-On navigation waits for document commit and
  verified component readiness instead of unrelated DOMContentLoaded work.
  Navigation is bounded at 30 seconds; test retries remain zero.
- Search waits for completed query-specific UI and idle results. Cached results
  no longer require an unnecessary new HTTP response. Missing or stale query
  results still fail. This is functional UI validation, not an HTTP contract test.
- A fresh anonymous cart no longer receives a startup clear POST. Teardown checks
  whether the cart has items before clearing it. HTTP 429 remains an explicit
  failure, with Retry-After information when available; mutations are not retried.
  Cleanup diagnostics are attached without masking a primary test failure.

## Validation

The five previously unsuccessful read-only scenarios passed in a single-worker
live run (19.5 seconds): both collection product links, mobile product gallery,
search-query removal and Try-On size control. See
`.verification/code-fixes-report/index.html`.

Two additional single-worker Cart cases passed (12.0 seconds): empty-cart display
and Product Details add-to-bag, including teardown cleanup. See
`.verification/cart-fixes-report/index.html`. Seven targeted cases passed in total;
the complete 269-case suite has not been rerun.

Local regression checks verified URL rejection of wrong hosts/products/variants,
no clear POST for an empty cart, one clear for a populated cart, and visible HTTP
429 failures without mutation retries. Syntax and discovery still find 269 cases.

These checks do not establish that all 43 rate-limited Cart/Checkout tests now
pass. Rate limiting must remain visible if it recurs. No Checkout guards, final
submission boundaries, worker counts or global retry settings were weakened.

## Website findings

The three FAQ publication assertions remain unchanged: the last full run confirmed
unfinished answer text. Those are real content defects rather than test-code
failures. The earlier payment-unavailable message was observed during inspection,
but the full run's payment-readiness test never reached its assertion because cart
setup failed. Newsletter label checks passed in that run; the earlier predicted
label failures should not be described as current confirmed test failures.
