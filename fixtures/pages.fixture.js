import { test as base, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage.js';
import { SearchPage } from '../pages/SearchPage.js';
import { CollectionPage } from '../pages/CollectionPage.js';
import { ProductPage } from '../pages/ProductPage.js';
import { QuickViewPage } from '../pages/QuickViewPage.js';
import { CartPage } from '../pages/CartPage.js';
import { SavedItemsPage } from '../pages/SavedItemsPage.js';
import { EarStackPlannerPage } from '../pages/EarStackPlannerPage.js';
import { VirtualTryOnPage } from '../pages/VirtualTryOnPage.js';
import { ContentPage } from '../pages/ContentPage.js';
import { ContactPage } from '../pages/ContactPage.js';
import { NewsletterPage } from '../pages/NewsletterPage.js';
import { AccountPage } from '../pages/AccountPage.js';
import { CheckoutPage } from '../pages/CheckoutPage.js';

export const test = base.extend({
  checkout: async ({ page, baseURL }, use) => {
    if (!baseURL) throw new Error('Set BASE_URL before running checkout tests');
    const checkout = new CheckoutPage(page);
    await checkout.armSubmitGuard();
    try { await use(checkout); }
    finally {
      if (!page.isClosed() && new URL(page.url()).pathname.startsWith('/checkouts/')) {
        const attempts = await checkout.blockedFinalSubmits();
        if (attempts) throw new Error(`Checkout safety guard blocked ${attempts} final submission attempts`);
      }
    }
  },
  checkoutSession: [async ({ checkout, cart, cartVariant }, use) => {
    await cart.seed(cartVariant.id);
    await checkout.goto();
    await use(checkout);
  }, { timeout: 90_000 }],
  account: async ({ page, baseURL }, use) => {
    if (!baseURL) throw new Error('Set BASE_URL before running account tests');
    const account = new AccountPage(page);
    await account.blockAuthenticationWrites();
    await use(account);
  },
  newsletter: async ({ page, baseURL }, use) => {
    if (!baseURL) throw new Error('Set BASE_URL before running newsletter tests');
    const newsletter = new NewsletterPage(page);
    await newsletter.blockSubscriptions();
    await newsletter.goto();
    await use(newsletter);
  },
  content: async ({ page, baseURL }, use) => {
    if (!baseURL) throw new Error('Set BASE_URL before running content tests');
    await use(new ContentPage(page));
  },
  contact: async ({ page, baseURL }, use) => {
    if (!baseURL) throw new Error('Set BASE_URL before running contact tests');
    const contact = new ContactPage(page);
    await contact.blockSubmissions();
    await contact.goto();
    await use(contact);
  },
  tryOn: async ({ page, baseURL }, use) => {
    if (!baseURL) throw new Error('Set BASE_URL before running Virtual Try-On tests');
    const tryOn = new VirtualTryOnPage(page);
    await tryOn.disableCamera();
    await tryOn.goto();
    await use(tryOn);
  },
  planner: async ({ page, baseURL }, use) => {
    if (!baseURL) throw new Error('Set BASE_URL before running planner tests');
    const planner = new EarStackPlannerPage(page);
    await planner.goto();
    await use(planner);
  },
  savedItems: async ({ page, baseURL }, use) => {
    if (!baseURL) throw new Error('Set BASE_URL before running Saved Items tests');
    await use(new SavedItemsPage(page));
  },
  cart: async ({ page, baseURL }, use, testInfo) => {
    if (!baseURL) throw new Error('Set BASE_URL before running cart tests');
    const cart = new CartPage(page);
    // Playwright supplies a fresh anonymous context per test. Clearing an already
    // empty cart sends an unnecessary POST and triggered HTTP 429 across 43 tests.
    try { await use(cart); }
    finally {
      try { await cart.clearIfNotEmpty(); }
      catch (error) {
        await testInfo.attach('cart-cleanup-error', { body: String(error), contentType: 'text/plain' });
        // Preserve an existing test failure instead of replacing its root cause.
        if (testInfo.status === testInfo.expectedStatus) throw error;
      }
    }
  },
  cartVariant: async ({ product }, use) => {
    await product.goto();
    const variant = await product.availableVariant();
    if (!variant) throw new Error('Cart tests require an available product variant');
    await use(variant);
  },
  quickView: async ({ collection, page }, use) => {
    await collection.goto('/collections/earrings');
    await use(new QuickViewPage(page));
  },
  product: async ({ page, baseURL }, use) => {
    if (!baseURL) throw new Error('Set BASE_URL before running product tests');
    await use(new ProductPage(page));
  },
  collection: async ({ page, baseURL }, use) => {
    if (!baseURL) throw new Error('Set BASE_URL before running collection tests');
    await use(new CollectionPage(page));
  },
  home: [async ({ page, baseURL }, use) => {
    if (!baseURL) {
      throw new Error('Set BASE_URL before running tests, for example https://winsomeglam.com');
    }

    const home = new HomePage(page);
    await home.goto();
    await use(home);
  }, { timeout: 90_000 }],
  search: async ({ home, page }, use) => {
    const search = new SearchPage(page);
    await search.open();
    await use(search);
  },
});

export { expect };
