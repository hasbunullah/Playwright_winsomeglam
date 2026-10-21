import { test, expect } from '../fixtures/pages.fixture.js';

// Authentication entry is the verified public contract. These tests never sign in.
const authenticationURL = /^https:\/\/shopify\.com\/(?:\d+\/account\/?|authentication\/\d+\/login\/?)(?:\?.*)?$/;

test.describe('Saved Items - anonymous UI and persistence', () => {
  test.beforeEach(async ({ savedItems }) => { await savedItems.gotoCollection(); });

  test('Verify a new anonymous session shows zero saved items', async ({ savedItems }) => {
    await expect(savedItems.savedLink).toBeVisible();
    await expect(savedItems.savedLink).toHaveAccessibleName('Saved, 0 saved items');
    await expect(savedItems.savedCount).toHaveText('0');
    expect(await savedItems.localSavedHandles()).toEqual([]);
  });

  test('Verify the collection Save button starts unselected for guests', async ({ savedItems }) => {
    await expect(savedItems.collectionSave).toBeVisible();
    await expect(savedItems.collectionSave).toHaveAttribute('aria-pressed', 'false');
    await expect(savedItems.collectionSave).toHaveAccessibleName(/^Save \S/);
  });

  test('Verify refreshing does not invent saved items in a new guest session', async ({ savedItems }) => {
    await savedItems.reload();
    await expect(savedItems.savedCount).toHaveText('0');
    await expect(savedItems.collectionSave).toHaveAttribute('aria-pressed', 'false');
    expect(await savedItems.localSavedHandles()).toEqual([]);
  });

  test('Verify Saved in the header opens authentication', async ({ savedItems, page }) => {
    await savedItems.openSavedItems();
    await expect(page).toHaveURL(authenticationURL);
  });

  test('Verify Saved supports keyboard activation', async ({ savedItems, page }) => {
    await savedItems.openSavedItemsWithKeyboard();
    await expect(page).toHaveURL(authenticationURL);
  });

  test('Verify a guest cannot save a collection product without authentication', async ({ savedItems, page }) => {
    await savedItems.saveCollectionProduct();
    await expect(page).toHaveURL(authenticationURL);
    await savedItems.gotoCollection();
    await expect(savedItems.savedCount).toHaveText('0');
    await expect(savedItems.collectionSave).toHaveAttribute('aria-pressed', 'false');
    expect(await savedItems.localSavedHandles()).toEqual([]);
  });
});

test.describe('Saved Items - product entry point', () => {
  test('Verify a guest cannot save a product from Product Details without authentication', async ({ savedItems, page }) => {
    await savedItems.gotoProduct();
    await expect(savedItems.productSave).toHaveAttribute('aria-pressed', 'false');
    await savedItems.saveProduct();
    await expect(page).toHaveURL(authenticationURL);
    await savedItems.gotoProduct();
    await expect(savedItems.productSave).toHaveAttribute('aria-pressed', 'false');
    await expect(savedItems.savedCount).toHaveText('0');
    expect(await savedItems.localSavedHandles()).toEqual([]);
  });
});

test.describe('Mobile Saved Items', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test('Verify the mobile menu shows zero saved items and opens authentication', async ({ savedItems, page }) => {
    await savedItems.gotoCollection();
    await savedItems.openMobileMenu();
    await expect(savedItems.mobileSavedLink).toBeVisible();
    await expect(savedItems.mobileSavedCount).toHaveText('0');
    await savedItems.openMobileSavedItems();
    await expect(page).toHaveURL(authenticationURL);
  });

  test('Verify mobile collection Save requires authentication', async ({ savedItems, page }) => {
    await savedItems.gotoCollection();
    await savedItems.saveCollectionProduct();
    await expect(page).toHaveURL(authenticationURL);
  });
});
