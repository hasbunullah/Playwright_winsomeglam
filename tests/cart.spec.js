import { test, expect } from '../fixtures/pages.fixture.js';

test.describe('Cart - empty state', () => {
  test('Verify an empty cart displays recovery without checkout', async ({ cart }) => {
    await cart.goto();
    await expect(cart.emptyHeading).toBeVisible();
    await expect(cart.continueLink).toBeVisible();
    await expect(cart.rows).toHaveCount(0);
    await expect(cart.checkoutButton).toHaveCount(0);
  });

  test('Verify Continue shopping opens the all-products collection', async ({ cart, page }) => {
    await cart.goto();
    await cart.continueShopping();
    await expect(page).toHaveURL(/\/collections\/all\/?$/);
    await expect(cart.collectionHeading).toHaveText('Products');
  });
});

test.describe('Cart - product entry points', () => {
  test('Verify Product Details adds the selected variant to the cart', async ({ cart, product, cartVariant }) => {
    await product.selectVariant(cartVariant);
    await product.addToBag();
    await expect.poll(async () => (await cart.state()).item_count).toBe(1);
    const state = await cart.state();
    expect(state.items[0].variant_id).toBe(cartVariant.id);
    expect(state.items[0].quantity).toBe(1);
    await cart.goto();
    await expect(cart.itemTitle(0)).toHaveText(state.items[0].product_title);
    await expect(cart.quantity(0)).toHaveValue('1');
  });

  test('Verify Quick View adds its selected variant to the cart', async ({ cart, quickView }) => {
    const product = await quickView.productData();
    const variant = product.variants.find(item => item.available);
    expect(variant, 'Quick View cart test requires an available variant').toBeTruthy();
    await quickView.open();
    await quickView.waitForProduct();
    await quickView.selectVariant(variant);
    await quickView.addToBag();
    await expect.poll(async () => (await cart.state()).item_count).toBe(1);
    const state = await cart.state();
    expect(state.items[0].variant_id).toBe(variant.id);
    await cart.goto();
    await expect(cart.itemTitle(0)).toHaveText(product.title);
  });
});

test.describe('Cart - populated cart functional and UI scenarios', () => {
  test.beforeEach(async ({ cart, cartVariant }) => {
    await cart.seed(cartVariant.id);
    await cart.goto();
  });

  test('Verify cart displays the correct item, loaded image, quantity and total', async ({ cart }) => {
    const state = await cart.state();
    await expect(cart.rows).toHaveCount(1);
    await expect(cart.itemTitle(0)).toHaveText(state.items[0].product_title);
    await expect(cart.quantity(0)).toHaveValue('1');
    await expect(cart.itemImage(0)).toHaveAttribute('alt', /\S/);
    await expect.poll(() => cart.isImageLoaded(0)).toBe(true);
    expect(await cart.lineTotalInCents(0)).toBe(state.items[0].final_line_price);
    expect(await cart.totalInCents()).toBe(state.total_price);
    await expect(cart.checkoutButton).toBeEnabled();
  });

  test('Verify increasing quantity updates the item and cart total', async ({ cart }) => {
    await cart.changeQuantity(0, 'increase');
    await expect(cart.quantity(0)).toHaveValue('2');
    await expect.poll(async () => (await cart.state()).item_count).toBe(2);
    const state = await cart.state();
    await expect.poll(() => cart.lineTotalInCents(0)).toBe(state.items[0].final_line_price);
    await expect.poll(() => cart.totalInCents()).toBe(state.total_price);
  });

  test('Verify decreasing quantity updates the item and cart total', async ({ cart, cartVariant }) => {
    await cart.seed(cartVariant.id);
    await cart.reload();
    await expect(cart.quantity(0)).toHaveValue('2');
    await cart.changeQuantity(0, 'decrease');
    await expect(cart.quantity(0)).toHaveValue('1');
    await expect.poll(async () => (await cart.state()).item_count).toBe(1);
    const state = await cart.state();
    await expect.poll(() => cart.totalInCents()).toBe(state.total_price);
  });

  test('Verify removing the final item restores the empty cart', async ({ cart }) => {
    await cart.remove(0);
    await expect(cart.emptyHeading).toBeVisible();
    await expect(cart.rows).toHaveCount(0);
    await expect.poll(async () => (await cart.state()).item_count).toBe(0);
    await expect(cart.checkoutButton).toHaveCount(0);
  });

  test('Verify reloading preserves cart items and quantity', async ({ cart }) => {
    const before = await cart.state();
    await cart.reload();
    await expect(cart.itemTitle(0)).toHaveText(before.items[0].product_title);
    await expect(cart.quantity(0)).toHaveValue(String(before.items[0].quantity));
    const after = await cart.state();
    expect(after.items[0].variant_id).toBe(before.items[0].variant_id);
    expect(after.total_price).toBe(before.total_price);
  });

  test('Verify adding the same variant again merges its quantity into one line', async ({ cart, cartVariant, product }) => {
    await product.goto();
    await product.selectVariant(cartVariant);
    await product.addToBag();
    await expect.poll(async () => (await cart.state()).item_count).toBe(2);
    await cart.goto();
    await expect(cart.rows).toHaveCount(1);
    await expect(cart.quantity(0)).toHaveValue('2');
  });

  test('Verify different variants remain separate cart lines', async ({ cart, cartVariant, product }) => {
    await product.goto();
    const variants = await product.variants();
    const other = variants.find(item => item.available && item.id !== cartVariant.id);
    test.skip(!other, 'Requires two available variants of the test product');
    await product.selectVariant(other);
    await product.addToBag();
    await expect.poll(async () => (await cart.state()).item_count).toBe(2);
    await cart.goto();
    await expect(cart.rows).toHaveCount(2);
    const state = await cart.state();
    expect(state.items.map(item => item.variant_id).sort()).toEqual([cartVariant.id, other.id].sort());
  });

  test('Verify the cart product link opens the matching variant', async ({ cart, cartVariant, page }) => {
    await cart.openItem(0);
    await expect(page).toHaveURL(new RegExp(`/products/[^?]+\\?variant=${cartVariant.id}(?:&|$)`));
    await expect(cart.collectionHeading).toBeVisible();
  });

  test('Verify decreasing quantity is disabled at the minimum of one', async ({ cart }) => {
    await expect(cart.quantity(0)).toHaveValue('1');
    await expect(cart.decrease(0)).toBeDisabled();
  });

  for (const value of ['-1', '1.5']) {
    test(`Verify quantity ${value} violates the quantity input constraints`, async ({ cart }) => {
      await cart.enterQuantity(0, value);
      expect(await cart.quantityValidity(0)).toBe(false);
      // Do not blur/submit invalid input; this checks browser constraints only.
    });
  }
});

test.describe('Mobile cart', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test('Verify mobile cart quantity and removal controls work', async ({ cart, cartVariant }) => {
    await cart.seed(cartVariant.id);
    await cart.goto();
    await expect(cart.itemTitle(0)).toBeVisible();
    await cart.changeQuantity(0, 'increase');
    await expect(cart.quantity(0)).toHaveValue('2');
    await cart.remove(0);
    await expect(cart.emptyHeading).toBeVisible();
  });
});
