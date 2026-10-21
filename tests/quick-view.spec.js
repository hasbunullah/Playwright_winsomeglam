import { test, expect } from '../fixtures/pages.fixture.js';

test.describe('Quick View - positive functional and UI scenarios', () => {
  test('Verify Quick View opens the selected product without leaving its collection', async ({ quickView, page }) => {
    const { title } = await quickView.open();
    await expect(quickView.dialog).toBeVisible();
    await expect(quickView.title).toHaveText(title);
    await expect(page).toHaveURL(/\/collections\/earrings\/?$/);
  });

  test('Verify the product image loads with descriptive alternative text', async ({ quickView }) => {
    await quickView.open();
    await quickView.waitForProduct();
    await expect(quickView.image).toBeVisible();
    await expect(quickView.image).toHaveAttribute('alt', /\S/);
    await expect.poll(() => quickView.isImageLoaded()).toBe(true);
  });

  test('Verify product price, SKU and description match product data', async ({ quickView }) => {
    const product = await quickView.productData();
    await quickView.open();
    await quickView.waitForProduct();
    const variant = product.variants.find(item => item.available) || product.variants[0];
    expect(await quickView.displayedPriceInCents()).toBe(variant.price);
    await expect(quickView.sku).toHaveText(variant.sku || '');
    await expect(quickView.description).toHaveText(/\S/);
    await expect(quickView.title).toHaveText(product.title);
  });

  test('Verify changing options selects the correct variant and price', async ({ quickView }) => {
    const product = await quickView.productData();
    test.skip(product.variants.length < 2, 'Requires at least two product variants');
    await quickView.open();
    await quickView.waitForProduct();
    const variant = product.variants[1];
    await quickView.selectVariant(variant);
    await expect(quickView.purchaseButton).toHaveAttribute('data-variant-id', String(variant.id));
    await expect(quickView.sku).toHaveText(variant.sku || '');
    expect(await quickView.displayedPriceInCents()).toBe(variant.price);
    for (let index = 0; index < variant.options.length; index++) await expect(quickView.option(index)).toHaveValue(variant.options[index]);
  });

  test('Verify an available variant enables Add to Bag', async ({ quickView }) => {
    const product = await quickView.productData();
    const variant = product.variants.find(item => item.available);
    test.skip(!variant, 'Requires an available variant');
    await quickView.open();
    await quickView.waitForProduct();
    await quickView.selectVariant(variant);
    await expect(quickView.addButton).toBeEnabled();
    await expect(quickView.purchaseButton).toHaveAttribute('data-variant-id', String(variant.id));
  });

  test('Verify Full Details opens the matching product page', async ({ quickView, page }) => {
    const { title, destination } = await quickView.open();
    await quickView.waitForProduct();
    await expect(quickView.detailsLink).toHaveAttribute('href', /\/products\//);
    await quickView.openFullDetails();
    await expect(page).toHaveURL(destination);
    await expect(quickView.productHeading).toHaveText(title);
  });

  test('Verify Close dismisses Quick View and returns focus to its trigger', async ({ quickView }) => {
    await quickView.open();
    await quickView.waitForProduct();
    await quickView.close();
    await expect(quickView.dialog).toBeHidden();
    await expect(quickView.trigger(0)).toBeFocused();
  });

  test('Verify Escape dismisses Quick View and returns focus to its trigger', async ({ quickView }) => {
    await quickView.open();
    await quickView.waitForProduct();
    await quickView.dismissWithEscape();
    await expect(quickView.dialog).toBeHidden();
    await expect(quickView.trigger(0)).toBeFocused();
  });

  test('Verify the backdrop dismisses Quick View', async ({ quickView }) => {
    await quickView.open();
    await quickView.waitForProduct();
    await quickView.closeViaBackdrop();
    await expect(quickView.dialog).toBeHidden();
  });

  test('Verify opening and closing Quick View locks and restores page scrolling', async ({ quickView }) => {
    await quickView.open();
    await expect.poll(() => quickView.bodyScrollLocked()).toBe(true);
    await quickView.close();
    await expect.poll(() => quickView.bodyScrollLocked()).toBe(false);
  });

  test('Verify Quick View can be opened using the keyboard', async ({ quickView }) => {
    await quickView.open(0, true);
    await expect(quickView.dialog).toBeVisible();
    await expect(quickView.dialog).toBeFocused();
  });

  test('Verify Tab and Shift Tab stay within Quick View', async ({ quickView }) => {
    await quickView.open();
    await quickView.waitForProduct();
    await quickView.focusLastControl();
    await quickView.pressTab();
    await expect(quickView.closeButton).toBeFocused();
    await quickView.pressTab(true);
    await expect(quickView.detailsLink).toBeFocused();
  });
});

test.describe('Quick View - negative and recovery scenarios', () => {
  test('Verify a failed product load shows an error and disables purchase', async ({ quickView }) => {
    await quickView.blockProductLoad();
    await quickView.open();
    await expect(quickView.status).toHaveText('Product details could not be loaded.');
    await expect(quickView.retryButton).toBeVisible();
    await expect(quickView.purchaseButton).toBeDisabled();
  });

  test('Verify Retry recovers after a simulated product load failure', async ({ quickView }) => {
    await quickView.blockProductLoad();
    const { title } = await quickView.open();
    await expect(quickView.retryButton).toBeVisible();
    await quickView.restoreProductLoad();
    await quickView.retry();
    await expect(quickView.title).toHaveText(title);
    await expect(quickView.retryButton).toBeHidden();
    await expect(quickView.status).toBeEmpty();
  });

  test('Verify Quick View can be closed after a product load failure', async ({ quickView }) => {
    await quickView.blockProductLoad();
    await quickView.open();
    await expect(quickView.retryButton).toBeVisible();
    await quickView.close();
    await expect(quickView.dialog).toBeHidden();
    await expect(quickView.trigger(0)).toBeFocused();
  });

  test('Verify a sold-out variant disables Add to Bag', async ({ quickView }) => {
    const product = await quickView.productData();
    const variant = product.variants.find(item => !item.available);
    test.skip(!variant, 'Requires a sold-out variant; unavailable on the inspected product');
    await quickView.open();
    await quickView.waitForProduct();
    await quickView.selectVariant(variant);
    await expect(quickView.purchaseButton).toBeDisabled();
    await expect(quickView.purchaseButton).toHaveText(/sold out/i);
  });
});

test.describe('Mobile Quick View', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test('Verify mobile Quick View displays the selected product and closes', async ({ quickView }) => {
    const { title } = await quickView.open();
    await expect(quickView.title).toHaveText(title);
    await expect(quickView.detailsLink).toBeVisible();
    await quickView.close();
    await expect(quickView.dialog).toBeHidden();
  });

  test('Verify mobile Full Details opens the matching product', async ({ quickView, page }) => {
    const { title, destination } = await quickView.open();
    await quickView.waitForProduct();
    await quickView.openFullDetails();
    await expect(page).toHaveURL(destination);
    await expect(quickView.productHeading).toHaveText(title);
  });
});
