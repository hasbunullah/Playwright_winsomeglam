export class SavedItemsPage {
  constructor(page) {
    this.page = page;
    this.header = page.locator('[data-owt-header]');
    this.readyHeader = page.locator('[data-owt-header][data-owt-ready="true"]');
    this.savedLink = this.header.locator('a.owt-hdr__wishlist[data-owt-wishlist-link]');
    this.savedCount = this.savedLink.locator('[data-owt-saved-count]');
    this.mobileToggle = this.header.getByRole('button', { name: 'Open menu', exact: true });
    this.mobileMenu = this.header.getByRole('dialog', { name: 'Main menu', exact: true });
    this.mobileSavedLink = this.mobileMenu.locator('[data-owt-wishlist-link]');
    this.mobileSavedCount = this.mobileSavedLink.locator('[data-owt-saved-count]');
    this.collectionRoot = page.getByRole('main').locator('[data-wgcp-section]');
    this.readyCollection = page.getByRole('main').locator('[data-wgcp-section][data-wgcp-ready="true"]');
    this.collectionSave = this.collectionRoot.locator('[data-wgcp-card]').first().locator('[data-wgcp-wishlist]');
    this.productRoot = page.getByRole('main').locator('[data-wg-pdp]');
    this.readyProduct = page.getByRole('main').locator('[data-wg-pdp][data-wg-pdp-ready="true"]');
    this.productSave = this.productRoot.locator('form [data-wg-wishlist]');
  }

  async gotoCollection() {
    await this.navigate('/collections/earrings');
    await this.readyCollection.waitFor();
  }

  async gotoProduct() {
    await this.navigate('/products/cz-triple-diamond-drop-earrings');
    await this.readyProduct.waitFor();
  }

  async navigate(path) {
    const response = await this.page.goto(path, { waitUntil: 'domcontentloaded' });
    if (!response?.ok()) throw new Error(`Saved Items navigation failed: HTTP ${response?.status()}`);
    await this.readyHeader.waitFor();
  }

  async reload() {
    await this.page.reload({ waitUntil: 'domcontentloaded' });
    await this.readyHeader.waitFor();
    await this.readyCollection.waitFor();
  }

  async openMobileMenu() { await this.mobileToggle.click(); }

  async followToAuthentication(link, keyboard = false) {
    await Promise.all([
      this.page.waitForURL(url => url.hostname === 'shopify.com' &&
        (/^\/\d+\/account\/?$/.test(url.pathname) || /^\/authentication\/\d+\/login\/?$/.test(url.pathname)),
        { waitUntil: 'commit' }),
      keyboard ? link.press('Enter') : link.click({ noWaitAfter: true }),
    ]);
  }

  async openSavedItems() { await this.followToAuthentication(this.savedLink); }
  async openSavedItemsWithKeyboard() { await this.savedLink.focus(); await this.followToAuthentication(this.savedLink, true); }
  async openMobileSavedItems() { await this.followToAuthentication(this.mobileSavedLink); }
  async saveCollectionProduct() { await this.followToAuthentication(this.collectionSave); }
  async saveProduct() { await this.followToAuthentication(this.productSave); }

  async localSavedHandles() {
    return this.page.evaluate(() => {
      const raw = localStorage.getItem('wg-wishlist-products');
      return raw === null ? [] : JSON.parse(raw);
    });
  }
}
