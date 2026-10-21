import { test, expect } from '../fixtures/pages.fixture.js';

// Routes must intercept browser requests, including on checkout pages.
test.use({ serviceWorkers: 'block' });
const checkoutURL = /^https:\/\/winsomeglam\.com\/checkouts\//;

test.describe('Checkout - cart transition', () => {
  test('Verify Check out opens the single-page checkout with the selected product', async ({ checkout, cart, cartVariant, page }) => {
    await cart.seed(cartVariant.id);
    const state = await cart.state();
    await cart.goto();
    await checkout.openFromCart();
    await expect(page).toHaveURL(checkoutURL);
    await expect(checkout.items).toContainText(state.items[0].product_title);
    await expect(checkout.heading('Payment')).toBeVisible();
  });
});

test.describe('Checkout - pre-order UI and summary', () => {
  test('Verify Contact, Delivery, Shipping and Payment sections are displayed', async ({ checkoutSession: checkout, page }) => {
    await expect(page).toHaveURL(checkoutURL);
    for (const name of ['Contact', 'Delivery', 'Shipping method', 'Payment']) await expect(checkout.heading(name)).toBeVisible();
  });

  test('Verify the order summary contains the cart product and selected variant', async ({ checkoutSession: checkout, cart }) => {
    const state = await cart.state();
    await expect(checkout.items).toContainText(state.items[0].product_title);
    await expect(checkout.items).toContainText(state.items[0].variant_title);
    await expect(checkout.itemQuantity(state.items[0].product_title)).toHaveText(String(state.items[0].quantity));
  });

  test('Verify checkout subtotal matches the session cart item total', async ({ checkoutSession: checkout, cart }) => {
    const state = await cart.state();
    expect(await checkout.subtotalInCents()).toBe(state.items_subtotal_price);
    await expect(checkout.totalRow).toContainText(state.currency);
  });

  test('Verify shipping asks for an address before offering delivery rates', async ({ checkoutSession: checkout }) => {
    await expect(checkout.shippingPrompt).toBeVisible();
    await expect(checkout.shippingRow).toBeVisible();
  });

  test('Verify delivery fields have accessible labels', async ({ checkoutSession: checkout }) => {
    for (const field of [checkout.firstName, checkout.lastName, checkout.addressInput, checkout.city, checkout.postcode, checkout.phone]) await expect(field).toBeVisible();
    await expect(checkout.email).toHaveAccessibleName('Email');
    await expect(checkout.country).toHaveAccessibleName('Country/Region');
    await expect(checkout.addressInput).toHaveAccessibleName('Address');
  });

  test('Verify the configured delivery country includes the United Kingdom', async ({ checkoutSession: checkout }) => {
    const options = await checkout.countryOptions();
    expect(options).toContainEqual({ value: 'GB', text: 'United Kingdom' });
    await expect(checkout.country).toHaveValue('GB');
  });

  test('Verify marketing consent can be toggled locally without placing an order', async ({ checkoutSession: checkout }) => {
    const original = await checkout.marketingChecked();
    await checkout.toggleMarketing();
    expect(await checkout.marketingChecked()).toBe(!original);
    await checkout.toggleMarketing();
    expect(await checkout.marketingChecked()).toBe(original);
    expect(await checkout.blockedFinalSubmits()).toBe(0);
  });

  for (const name of ['Refund policy', 'Shipping', 'Privacy policy', 'Terms of service']) {
    test(`Verify checkout exposes ${name}`, async ({ checkoutSession: checkout }) => {
      await expect(checkout.policyButton(name)).toBeVisible();
      await expect(checkout.policyButton(name)).toHaveAttribute('aria-haspopup', 'dialog');
    });
  }

  test('Verify the final Pay now control is present without activating it', async ({ checkoutSession: checkout }) => {
    await expect(checkout.heading('Finalize order')).toBeVisible();
    await expect(checkout.payButton).toBeVisible();
    expect(await checkout.blockedFinalSubmits()).toBe(0);
  });

  test('Verify the store is ready to accept payment', async ({ checkoutSession: checkout }) => {
    await expect(checkout.paymentUnavailable, 'Checkout currently reports a live-store payment configuration problem').toBeHidden();
  });
});

test.describe('Checkout - input constraints without final submission', () => {
  test('Verify synthetic delivery details can be entered without submitting an order', async ({ checkoutSession: checkout }) => {
    await checkout.fillField('firstName', 'Automation');
    await checkout.fillField('lastName', 'Test');
    await checkout.fillField('address', '1 Test Street');
    await checkout.fillField('city', 'London');
    await checkout.fillField('postcode', 'SW1A 1AA');
    await expect(checkout.firstName).toHaveValue('Automation');
    await expect(checkout.lastName).toHaveValue('Test');
    await expect(checkout.addressInput).toHaveValue('1 Test Street');
    await expect(checkout.city).toHaveValue('London');
    await expect(checkout.postcode).toHaveValue('SW1A 1AA');
    expect(await checkout.blockedFinalSubmits()).toBe(0);
  });

  test('Verify the optional phone field is not required', async ({ checkoutSession: checkout }) => {
    await expect(checkout.phone).toHaveValue('');
    expect((await checkout.validity('phone')).valueMissing).toBe(false);
  });

  for (const field of ['email', 'lastName', 'address', 'city', 'postcode']) {
    test(`Verify an empty ${field} violates its required input constraint`, async ({ checkoutSession: checkout }) => {
      expect((await checkout.validity(field)).valueMissing).toBe(true);
      expect((await checkout.validity(field)).valid).toBe(false);
    });
  }

  for (const email of ['invalid-email', 'qa@']) {
    test(`Verify email ${email} violates email format constraints`, async ({ checkoutSession: checkout }) => {
      await checkout.fillField('email', email);
      expect((await checkout.validity('email')).typeMismatch).toBe(true);
      expect(await checkout.blockedFinalSubmits()).toBe(0);
    });
  }

  test('Verify a syntactically valid email passes input constraints without ordering', async ({ checkoutSession: checkout }) => {
    await checkout.fillField('email', 'checkout-test@example.invalid');
    await expect(checkout.email).toHaveValue('checkout-test@example.invalid');
    expect((await checkout.validity('email')).valid).toBe(true);
    expect(await checkout.blockedFinalSubmits()).toBe(0);
  });

  test('Verify correcting an invalid email clears its type mismatch', async ({ checkoutSession: checkout }) => {
    await checkout.fillField('email', 'invalid-email');
    expect((await checkout.validity('email')).typeMismatch).toBe(true);
    await checkout.fillField('email', 'checkout-test@example.invalid');
    expect((await checkout.validity('email')).typeMismatch).toBe(false);
  });
});

test.describe('Mobile checkout', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test('Verify mobile checkout displays contact, delivery and final payment sections', async ({ checkoutSession: checkout }) => {
    await expect(checkout.email).toBeVisible();
    await expect(checkout.country).toBeVisible();
    await expect(checkout.heading('Payment')).toBeVisible();
    await expect(checkout.payButton).toBeVisible();
    expect(await checkout.blockedFinalSubmits()).toBe(0);
  });

  test('Verify the mobile order summary expands with the selected product', async ({ checkoutSession: checkout, cart }) => {
    const state = await cart.state();
    await checkout.openMobileSummary();
    await expect(checkout.items).toBeVisible();
    await expect(checkout.items).toContainText(state.items[0].product_title);
  });
});
