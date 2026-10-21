import { test, expect } from '../fixtures/pages.fixture.js';

test.describe('Virtual Try-On - modal and unavailable camera', () => {
  test('Verify Try-On opens with a photo fallback when the camera API is unavailable', async ({ tryOn }) => {
    await tryOn.open();
    await expect(tryOn.dialog).toBeVisible();
    await expect(tryOn.status).toHaveText('Camera is unavailable in this browser. You can use a photo instead.');
    await expect(tryOn.usePhotoButton).toBeVisible();
    await expect(tryOn.video).toBeHidden();
  });

  test('Verify Close dismisses Try-On and restores focus', async ({ tryOn }) => {
    await tryOn.open();
    await tryOn.close();
    await expect(tryOn.dialog).toBeHidden();
    await expect(tryOn.openButton).toBeFocused();
  });

  test('Verify Escape dismisses Try-On and restores focus', async ({ tryOn }) => {
    await tryOn.open();
    await tryOn.escape();
    await expect(tryOn.dialog).toBeHidden();
    await expect(tryOn.openButton).toBeFocused();
  });

  test('Verify Try-On supports keyboard opening', async ({ tryOn }) => {
    await tryOn.open(true);
    await expect(tryOn.dialog).toBeFocused();
  });

  test('Verify editing and download controls are hidden before a photo is loaded', async ({ tryOn }) => {
    await tryOn.open();
    await expect(tryOn.sizeSlider).toBeHidden();
    await expect(tryOn.angleSlider).toBeHidden();
    await expect(tryOn.resetButton).toBeHidden();
    await expect(tryOn.saveButton).toBeHidden();
  });
});

test.describe('Virtual Try-On - synthetic photo editing', () => {
  test.beforeEach(async ({ tryOn }) => {
    await tryOn.open();
    await tryOn.uploadPhoto();
    await expect(tryOn.photo).toBeVisible();
  });

  test('Verify a valid photo displays the preview, product overlay and editing controls', async ({ tryOn }) => {
    await expect.poll(() => tryOn.isPreviewLoaded()).toBe(true);
    await expect(tryOn.productImage).toBeVisible();
    await expect(tryOn.status).toHaveText('Photo loaded. Drag the piece onto your ear, then resize or rotate it.');
    await expect(tryOn.sizeSlider).toHaveValue('100');
    await expect(tryOn.angleSlider).toHaveValue('0');
    await expect(tryOn.saveButton).toBeVisible();
  });

  test('Verify increasing Size changes the overlay scale', async ({ tryOn }) => {
    await tryOn.setSizeToMaximum();
    await expect(tryOn.sizeSlider).toHaveValue('190');
    await expect.poll(() => tryOn.overlayScale()).toBe('1.9');
  });

  test('Verify changing Angle rotates the overlay', async ({ tryOn }) => {
    await tryOn.setAngleToMinimum();
    await expect(tryOn.angleSlider).toHaveValue('-45');
    await expect.poll(() => tryOn.overlayAngle()).toBe('-45deg');
  });

  test('Verify Reset restores default size and angle', async ({ tryOn }) => {
    await tryOn.setSizeToMaximum();
    await tryOn.setAngleToMinimum();
    await tryOn.reset();
    await expect(tryOn.sizeSlider).toHaveValue('100');
    await expect(tryOn.angleSlider).toHaveValue('0');
    await expect(tryOn.status).toHaveText('Placement reset.');
    await expect.poll(() => tryOn.overlayScale()).toBe('1');
    await expect.poll(() => tryOn.overlayAngle()).toBe('0deg');
  });

  test('Verify dragging the product changes its placement', async ({ tryOn }) => {
    const before = await tryOn.placement();
    await tryOn.dragPiece();
    await expect.poll(() => tryOn.placement()).not.toEqual(before);
  });

  test('Verify Save Image downloads a nonempty PNG preview', async ({ tryOn }) => {
    await expect.poll(() => tryOn.isProductImageLoaded()).toBe(true);
    const download = await tryOn.downloadPreview();
    expect(download.failure).toBeNull();
    expect(download.filename).toBe('cz-triple-diamond-drop-earrings-try-on.png');
    expect(download.signature).toBe('89504e470d0a1a0a');
    expect(download.length).toBeGreaterThan(8);
    await expect(tryOn.status).toHaveText('Preview saved.');
  });

  test('Verify reopening Try-On clears the previous preview', async ({ tryOn }) => {
    await tryOn.close();
    await tryOn.open();
    await expect(tryOn.photo).toBeHidden();
    await expect(tryOn.productImage).toBeHidden();
    await expect(tryOn.saveButton).toBeHidden();
  });
});

test.describe('Virtual Try-On - invalid media and recovery', () => {
  test('Verify a non-image file displays validation feedback', async ({ tryOn }) => {
    await tryOn.open();
    await tryOn.uploadInvalidFile();
    await expect(tryOn.status).toHaveText('Please choose a valid image file.');
    await expect(tryOn.saveButton).toBeHidden();
  });

  test('Verify corrupt image bytes display a load error', async ({ tryOn }) => {
    await tryOn.open();
    await tryOn.uploadCorruptImage();
    await expect(tryOn.status).toHaveText('That photo could not be opened. Please choose another image.');
    await expect(tryOn.saveButton).toBeHidden();
  });

  test('Verify selecting a valid image recovers after a corrupt image', async ({ tryOn }) => {
    await tryOn.open();
    await tryOn.uploadCorruptImage();
    await expect(tryOn.status).toHaveText('That photo could not be opened. Please choose another image.');
    await tryOn.choosePhotoThroughPicker();
    await expect(tryOn.photo).toBeVisible();
    await expect.poll(() => tryOn.isPreviewLoaded()).toBe(true);
    await expect(tryOn.saveButton).toBeVisible();
  });
});

test.describe('Mobile Virtual Try-On', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test('Verify mobile photo selection provides editing controls', async ({ tryOn }) => {
    await tryOn.open();
    await tryOn.choosePhotoThroughPicker();
    await expect(tryOn.photo).toBeVisible();
    await expect(tryOn.sizeSlider).toBeVisible();
    await expect(tryOn.angleSlider).toBeVisible();
  });

  test('Verify the mobile Close control dismisses the photo preview', async ({ tryOn }) => {
    await tryOn.open();
    await tryOn.uploadPhoto();
    await expect(tryOn.photo).toBeVisible();
    await tryOn.close();
    await expect(tryOn.dialog).toBeHidden();
  });
});
