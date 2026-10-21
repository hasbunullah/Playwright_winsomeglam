# Ear Stack Planner test cases

Module 8: `EarStackPlannerPage`, the isolated `planner` fixture and
`tests/ear-stack-planner.spec.js`. Constructor-defined locators, page methods for
actions and data reading, and scenario assertions in specs follow the existing POM.

Implementation uses the previously captured product-page planner markup and script.
A new live inspection attempt timed out during navigation; no live interaction
result or functional pass is claimed. Tests require the published default product,
the inspected planner theme, two selectable products for replacement/two-piece
scenarios and enough eligible products to fill the displayed starter preset.
Missing controls or catalog prerequisites fail visibly rather than being hidden
by skips. Numeric prices assume the inspected decimal-point currency format.

| ID | Scenario and expected result |
| --- | --- |
| PLAN-01 | Open planner: piercing-selection step visible, product-selection step hidden |
| PLAN-02 | Close: modal hidden, focus restored |
| PLAN-03 | Escape: modal hidden, focus restored |
| PLAN-04 | Enter on trigger: modal opens and receives focus |
| PLAN-05–07 | Choose one/two/three piercings: matching slot count and position limit |
| PLAN-08 | Select one piece: matching slot title, count and price; Add enabled |
| PLAN-09 | Select two pieces: each fills its position and total equals sum |
| PLAN-10 | Replace a piece: title/price change while count remains one |
| PLAN-11 | Remove one of two pieces: count and price reflect remaining piece |
| PLAN-12 | Reduce positions: excluded piece removed and retained piece preserved |
| PLAN-13 | Choose preset: advertised position count fills and Save enables |
| PLAN-14 | Save locally and reload: selected title, count and total restored |
| PLAN-15 | Enter on position: active position changes and accepts selected piece |
| PLAN-16 | Empty selection: zero total and Save/Share/Add disabled |
| PLAN-17 | Remove final piece: count/total reset and actions disable |
| PLAN-18 | Malformed shared payload: planner remains usable with clean selection |
| PLAN-19 | Mobile select/remove: slot and total update, then count resets |
| PLAN-20 | Mobile Close: modal dismisses |

Price checks compare UI totals with selected card data, not an independent audit
of catalog pricing. Save writes only device-local storage inside the isolated
test browser context. No share message, clipboard write, native share dialog,
stack cart submission, account mutation, checkout or order is performed.

Successful share-link generation/restoration, denied-storage recovery, planner
cart payload/contents and inventory failures remain pending additional coverage.
Existing empty-stack checks assert action state; they do not prove protection
against manually crafted requests. This is the initial planner subset rather
than complete end-to-end planner coverage.

Validation: syntax checks, test discovery and saved-markup locator checks passed.
All 20 cases are discoverable; the functional suite has not been run.

```powershell
npm.cmd test -- tests/ear-stack-planner.spec.js
```

Five later modules remain: Virtual Try-On, Content and Support, Newsletter,
Account and Checkout. Authenticated Saved Items and the planner gaps above
remain open in addition to those modules.
