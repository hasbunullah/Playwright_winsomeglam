# Collections and product listing test cases

Written October 19, 2026. Scope: module 3 only. Public collection markup was
inspected read-only on the directory, all-products collection, Earrings, and
Earrings with a zero maximum price. Functional tests have not been executed.

Implementation: `pages/CollectionPage.js`, `tests/collections.spec.js`, and the
`collection` fixture in `fixtures/pages.fixture.js`.

Each case uses a new browser context. Requires BASE_URL and public catalog access.
The all-products collection must contain products; ordering requires two or more
and pagination requires more than nine. Those two prerequisites have explicit
skip reasons. The zero-price empty-state cases require no free Earrings products.
Amounts and totals are read from the current page rather than fixed catalog prices.

| ID | Type | Steps | Expected result |
| --- | --- | --- | --- |
| COL-01 | Positive | Open directory; select Earrings | Earrings URL and heading match |
| COL-02 | Positive | Open all-products listing; inspect displayed cards | Titles, current prices, descriptive image alt text and loaded images exist |
| COL-03–04 | Positive | Select first product via title / image | Destination URL and product heading match the selected card |
| COL-05–06 | Positive | Choose ascending / descending price | Displayed current prices follow selected order |
| COL-07–08 | Positive | Choose ascending / descending title | Displayed titles follow selected order |
| COL-09–11 | Boundary | Choose 9 / 12 / 16 products per page | Card count equals the smaller of page size and catalog total; URL and summary agree |
| COL-12 | Positive | Open page two; return to page one | Second-page products differ without duplicates; first page is restored |
| COL-13–16 | Positive | Select first enabled Availability / Metal / Style / Stone option; Clear | Query and checkbox reflect selection; result total matches advertised option count; Clear restores original total |
| COL-17 | Positive | Select Under 30 quick filter | Price limit appears in URL and displayed prices are at most 30 in storefront currency |
| COL-18 | Positive | Apply price and in-stock filters; change sorting | Both parameters persist; availability remains checked; displayed prices respect limit and ordering |
| COL-19 | Negative | Open Earrings with price limit zero; use empty-state Clear | No pieces found and no cards; Clear restores Earrings products |
| COL-20 | Negative | Inspect options in zero-price empty state | All zero-count checkbox options are disabled |
| COL-21–24 | Negative | Request page size 0 / -1 / 999 / invalid | Effective page size falls back to nine and expected card count renders |
| COL-25 | Boundary | Request negative page number | First page renders with Previous disabled |
| COL-26 | Boundary | Request page beyond catalog end | Final-page card count renders with Next disabled |
| COL-27 | Mobile | Open filters; press Escape | Drawer closes, expanded state resets and focus returns to trigger |
| COL-28 | Mobile | Select descending price | Displayed prices follow descending order |
| COL-29 | Mobile negative | Open Earrings filters; set slider to zero using Home; Apply | Empty heading renders and no product cards remain |

Filter cases verify selected state, query and advertised counts. They do not
independently verify every product's metafield values or every page of filtered
results. Ordering checks cover the displayed page, not the entire catalog.
Featured, relevance, best-selling and date ordering need independent expected
ranking data before they can receive meaningful order assertions. Cart, quick
view and saved-item actions belong to later modules.

Validation completed: JavaScript syntax checks and Playwright discovery of all
29 cases. Discovery does not establish functional passes.

Run when functional execution is requested:

```powershell
npm.cmd test -- tests/collections.spec.js
```
