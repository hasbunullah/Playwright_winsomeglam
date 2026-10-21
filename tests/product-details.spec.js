import { test, expect } from '../fixtures/pages.fixture.js';

const productPath = '/products/cz-triple-diamond-drop-earrings';
const panelNames = ['DESCRIPTION', 'MATERIALS & DIMENSIONS', 'JEWELLERY CARE', 'SHIPPING & RETURNS'];

test.describe('Product details - positive functional and UI scenarios', () => {
  test.beforeEach(async ({ product }) => { await product.goto(); });

  test('Verify the product heading and breadcrumb identify the current product', async ({ product }) => {
    const title = await product.title();
    await expect(product.heading).toHaveText(title);
    await expect(product.breadcrumbs).toContainText(title);
  });

  test('Verify price and SKU match the selected variant', async ({ product }) => {
    const variant = await product.selectedVariant();
    expect(await product.priceInCents()).toBe(variant.price);
    if (variant.sku) await expect(product.sku).toHaveText(variant.sku);
    else await expect(product.sku).toHaveText(/\S/);
  });

  test('Verify sale pricing displays a higher comparison price only when discounted', async ({ product }) => {
    const variant = await product.selectedVariant();
    if (variant.compare_at_price > variant.price) {
      await expect(product.comparePrice).toBeVisible();
      expect(await product.priceInCents(true)).toBe(variant.compare_at_price);
    } else await expect(product.comparePrice).toBeHidden();
  });

  test('Verify the main product image loads with descriptive alternative text', async ({ product }) => {
    await expect(product.activeImage).toBeVisible();
    await expect(product.activeImage).toHaveAttribute('alt', /\S/);
    await expect.poll(() => product.isImageLoaded()).toBe(true);
  });

  test('Verify a gallery thumbnail displays its matching media', async ({ product }) => {
    test.skip(await product.mediaCount() < 2, 'Requires multiple product media');
    const mediaId = await product.selectMedia(1);
    await expect(product.activeSlide).toHaveAttribute('data-media-id', mediaId);
    await expect(product.thumbnail(1)).toHaveAttribute('aria-current', 'true');
    await expect(product.thumbnail(0)).toHaveAttribute('aria-current', 'false');
  });

  test('Verify the first gallery image can be restored after changing media', async ({ product }) => {
    test.skip(await product.mediaCount() < 2, 'Requires multiple product media');
    await product.selectMedia(1);
    const mediaId = await product.selectMedia(0);
    await expect(product.activeSlide).toHaveAttribute('data-media-id', mediaId);
    await expect(product.currentThumbnails).toHaveCount(1);
  });

  test('Verify gallery thumbnails support keyboard activation', async ({ product }) => {
    test.skip(await product.mediaCount() < 2, 'Requires multiple product media');
    const mediaId = await product.selectMedia(1, true);
    await expect(product.activeSlide).toHaveAttribute('data-media-id', mediaId);
    await expect(product.thumbnail(1)).toBeFocused();
  });

  test('Verify selecting another variant updates options, URL, SKU and price', async ({ product, page }) => {
    const other = await product.alternativeVariant();
    test.skip(!other, 'Requires at least two variants');
    await product.selectVariant(other);
    await expect(product.variantId).toHaveValue(String(other.id));
    await expect(page).toHaveURL(new RegExp(`variant=${other.id}(?:&|$)`));
    if (other.sku) await expect(product.sku).toHaveText(other.sku);
    expect(await product.priceInCents()).toBe(other.price);
    for (let index = 0; index < other.options.length; index++) {
      await expect(product.optionRadio(index, other.options[index])).toBeChecked();
      await expect(product.optionLabel(index)).toHaveText(other.options[index]);
    }
  });

  test('Verify variant selection survives a page reload', async ({ product }) => {
    const variants = await product.variants();
    test.skip(variants.length < 2, 'Requires at least two variants');
    const variant = variants[1];
    await product.selectVariant(variant);
    await product.reload();
    await expect(product.variantId).toHaveValue(String(variant.id));
    await expect(product.optionRadio(0, variant.options[0])).toBeChecked();
  });

  test('Verify available variants enable purchase controls and show in-stock status', async ({ product }) => {
    const variant = await product.availableVariant();
    test.skip(!variant, 'Requires an available variant');
    await product.selectVariant(variant);
    await expect(product.addButton).toBeEnabled();
    await expect(product.buyButton).toBeEnabled();
    await expect(product.stock).toContainText('In stock');
    await expect(product.addButton).toContainText(await product.displayedPrice());
  });

  test('Verify the product form uses a fixed quantity of one', async ({ product }) => {
    await expect(product.quantity).toHaveValue('1');
    await expect(product.quantity).toHaveAttribute('type', 'hidden');
  });

  test('Verify sticky product details agree with the selected variant', async ({ product }) => {
    const variants = await product.variants();
    const variant = variants.at(-1);
    await product.selectVariant(variant);
    await expect(product.stickyPrice).toHaveText(await product.displayedPrice());
    await expect(product.stickyVariant).toHaveText(variant.title);
  });

  for (const name of panelNames) {
    test(`Verify the ${name} panel opens and closes`, async ({ product }) => {
      const panel = product.panel(name);
      // Description starts open; normalize through its public control.
      await product.closePanel(name);
      await expect(product.panelContent(name)).toBeHidden();
      await product.togglePanel(name);
      await expect(panel).toHaveAttribute('open', '');
      await expect(product.panelContent(name)).toBeVisible();
      await expect(product.panelContent(name)).toHaveText(/\S/);
      await product.togglePanel(name);
      await expect(product.panelContent(name)).toBeHidden();
    });
  }

  test('Verify information panels support keyboard opening and closing', async ({ product }) => {
    const name = 'JEWELLERY CARE';
    await product.closePanel(name);
    await product.togglePanel(name, 'Enter');
    await expect(product.panelContent(name)).toBeVisible();
    await product.togglePanel(name, 'Space');
    await expect(product.panelContent(name)).toBeHidden();
  });
});

test.describe('Product details - negative and boundary scenarios', () => {
  test('Verify an unknown product returns a not-found page without purchase controls', async ({ product }) => {
    const status = await product.openUnknownProduct();
    expect(status).toBe(404);
    await expect(product.main).toBeVisible();
    await expect(product.main).toContainText(/404|not found|does not exist/i);
    await expect(product.addButton).toHaveCount(0);
  });

  for (const invalidId of ['0', 'not-a-variant']) {
    test(`Verify invalid variant ${invalidId} falls back to a valid product variant`, async ({ product }) => {
      await product.goto(`${productPath}?variant=${invalidId}`);
      const selected = await product.selectedVariant();
      expect(await product.variantIds()).toContain(String(selected.id));
      await expect(product.heading).toBeVisible();
      expect(await product.priceInCents()).toBe(selected.price);
      if (selected.available) await expect(product.addButton).toBeEnabled();
      else await expect(product.addButton).toBeDisabled();
    });
  }

  test('Verify a sold-out variant disables both purchase actions', async ({ product }) => {
    await product.goto();
    const variant = await product.unavailableVariant();
    test.skip(!variant, 'No sold-out variant exists on the inspected product; requires catalog test data');
    await product.selectVariant(variant);
    await expect(product.addButton).toBeDisabled();
    await expect(product.buyButton).toBeDisabled();
    await expect(product.addButton).toHaveText('SOLD OUT');
    await expect(product.stock).toHaveText('Out of stock');
  });

  test('Verify repeated option selection keeps one selection per option group', async ({ product }) => {
    await product.goto();
    const variant = await product.selectedVariant();
    await product.selectVariant(variant);
    await product.selectVariant(variant);
    for (let index = 0; index < await product.optionGroupCount(); index++) await expect(product.checkedOptions(index)).toHaveCount(1);
    await expect(product.variantId).toHaveValue(String(variant.id));
  });
});

test.describe('Mobile product details', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  test.beforeEach(async ({ product }) => { await product.goto(); });

  test('Verify product information and purchase controls are visible without horizontal page overflow', async ({ product }) => {
    await expect(product.heading).toBeVisible();
    await expect(product.price).toBeVisible();
    await product.scrollToPurchaseControls();
    await expect(product.addButton).toBeVisible();
    await expect(product.buyButton).toBeVisible();
    expect(await product.hasHorizontalOverflow()).toBe(false);
  });

  test('Verify mobile variant selection updates the selected product', async ({ product }) => {
    const variants = await product.variants();
    test.skip(variants.length < 2, 'Requires at least two variants');
    await product.selectVariant(variants[1]);
    await expect(product.variantId).toHaveValue(String(variants[1].id));
    expect(await product.priceInCents()).toBe(variants[1].price);
  });

  test('Verify mobile gallery selection changes the active image', async ({ product }) => {
    test.skip(await product.mediaCount() < 2, 'Requires multiple product media');
    const id = await product.selectMedia(1);
    await expect(product.activeSlide).toHaveAttribute('data-media-id', id);
    await expect(product.activeImage).toBeVisible();
  });

  test('Verify mobile care information expands and collapses', async ({ product }) => {
    const name = 'JEWELLERY CARE';
    await product.closePanel(name);
    await product.togglePanel(name);
    await expect(product.panelContent(name)).toBeVisible();
    await product.togglePanel(name);
    await expect(product.panelContent(name)).toBeHidden();
  });
});
