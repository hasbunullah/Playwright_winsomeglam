# Virtual Try-On test cases

Module 9 uses `VirtualTryOnPage`, the isolated `tryOn` fixture and
`tests/virtual-try-on.spec.js`. Locators and dynamic queries stay in the constructor;
browser actions, file handling and DOM reading stay in page methods; assertions
remain in specs.

The fixture simulates an unavailable camera API before storefront scripts run.
No real webcam, microphone, personal photo or face sample is used. Upload cases
use a generated one-pixel PNG in memory. Downloads remain in Playwright's
temporary test context; no shared Downloads folder or clipboard is used.

| ID | Scenario and expected result |
| --- | --- |
| VTO-01 | Open with unavailable camera API: explicit recovery text and Use a Photo visible |
| VTO-02 | Close dismisses dialog and restores trigger focus |
| VTO-03 | Escape dismisses dialog and restores focus |
| VTO-04 | Enter opens dialog and focuses it |
| VTO-05 | Before photo selection, editing and Save Image controls are hidden |
| VTO-06 | Synthetic photo loads with product overlay, defaults and editing controls |
| VTO-07 | Maximum size sets slider and computed scale variable to 190% |
| VTO-08 | Minimum angle sets slider and computed rotation variable to -45 degrees |
| VTO-09 | Reset restores default scale and angle with feedback |
| VTO-10 | Pointer drag changes overlay placement |
| VTO-11 | Save Image downloads nonempty bytes with PNG signature and expected filename |
| VTO-12 | Close/reopen clears previous preview and hides Save Image |
| VTO-13 | Non-image MIME type produces explicit validation feedback |
| VTO-14 | Corrupt image bytes produce explicit load-error feedback |
| VTO-15 | Valid photo through the picker recovers after corrupt image |
| VTO-16 | Mobile picker loads preview and exposes scale/angle controls |
| VTO-17 | Mobile Close dismisses photo preview |

Requires BASE_URL, the published default product and its current theme controls.
Product-overlay download also depends on a successfully loaded, canvas-compatible
product CDN image. Download checks validate file type/content presence rather
than visual composition accuracy. Slider checks verify computed CSS variables;
they are not pixel comparisons. Invalid MIME is supplied programmatically to
exercise validation even though the file picker normally filters file types.

Implementation is grounded in the previously captured product markup/script.
Real media permission denial, camera tracks being released, automatic face
detection/capture, retake with a controlled camera, missing product-image recovery,
full accessibility checks and touch dragging remain pending additional coverage.
Camera-unavailable simulation is not presented as real camera coverage. These
tests do not submit forms, cart mutations, accounts, payments or orders. Browser
local image processing does not itself establish the site's full privacy claims.

Validation: syntax and discovery passed for 17 cases. Saved-markup locator checks
and decoding of the synthetic PNG passed. A camera-disabled live inspection
confirmed the exact unavailable-camera fallback message. The functional suite
has not been run.

```powershell
npm.cmd test -- tests/virtual-try-on.spec.js
```

Four later modules remain: Content and Support, Newsletter, Account, Checkout.
Previously documented authenticated Saved Items and planner coverage gaps remain.
