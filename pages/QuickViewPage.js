import { productURLPattern } from '../utils/product-url.js';

export class QuickViewPage {
  constructor(page) {
    this.page = page;
    this.root = page.getByRole('main').locator('[data-wgcp-section]');
    this.card = index => this.root.locator('[data-wgcp-card]').nth(index);
    this.trigger = index => this.card(index).getByRole('button', { name: 'QUICK VIEW', exact: true });
    this.cardTitle = index => this.card(index).locator('.wgcp-card__title');
    this.overlay = this.root.locator('[data-wgcp-modal]');
    this.dialog = this.overlay.getByRole('dialog');
    this.title = this.dialog.locator('[data-wgcp-modal-title]');
    this.loadedTitle = this.title.filter({ hasText: /\S/ });
    this.closeButton = this.dialog.getByRole('button', { name: 'Close quick view', exact: true });
    this.backdrop = this.overlay.locator('button[data-wgcp-modal-close]').first();
    this.image = this.dialog.locator('[data-wgcp-modal-image]');
    this.price = this.dialog.locator('[data-wgcp-modal-price] > span');
    this.sku = this.dialog.locator('[data-wgcp-modal-sku]');
    this.description = this.dialog.locator('[data-wgcp-modal-description]');
    this.options = this.dialog.locator('select[data-option-position]');
    this.option = position => this.options.nth(position);
    this.addButton = this.dialog.getByRole('button', { name: 'ADD TO BAG', exact: true });
    this.purchaseButton = this.dialog.locator('[data-wgcp-modal-add]');
    this.detailsLink = this.dialog.getByRole('link', { name: 'FULL DETAILS', exact: true });
    this.status = this.dialog.locator('[data-wgcp-modal-status]');
    this.retryButton = this.dialog.getByRole('button', { name: 'Try again', exact: true });
    this.productHeading = page.getByRole('main').getByRole('heading', { level: 1 });
    this.focusableControls = this.dialog.locator('button:not([disabled]), a[href], select:not([disabled])');
    this.loadedOverlay = this.root.locator('[data-wgcp-modal]:not(.is-loading)');
  }

  async productData(index = 0) {
    const handle = await this.card(index).getAttribute('data-product-handle');
    const response = await this.page.request.get(`/products/${encodeURIComponent(handle)}.js`);
    if (!response.ok()) throw new Error(`Quick View product data failed: HTTP ${response.status()}`);
    return response.json();
  }

  async open(index = 0, keyboard = false) {
    const title = (await this.cardTitle(index).innerText()).trim();
    const destination = productURLPattern(await this.trigger(index).getAttribute('data-product-url'), this.page.url());
    // Hover exposes the desktop card actions; mobile cards expose them directly.
    if (!(await this.page.evaluate(() => matchMedia('(hover: none)').matches))) await this.card(index).hover();
    if (keyboard) { await this.trigger(index).focus(); await this.trigger(index).press('Enter'); }
    else await this.trigger(index).click();
    return { title, destination };
  }

  async waitForProduct() {
    await this.loadedTitle.waitFor();
    await this.loadedOverlay.waitFor();
  }
  async close() { await this.closeButton.click(); }
  async dismissWithEscape() { await this.page.keyboard.press('Escape'); }
  async closeViaBackdrop() {
    const box = await this.backdrop.boundingBox();
    if (!box) throw new Error('Quick View backdrop is not visible');
    await this.backdrop.click({ position: { x: 2, y: 2 } });
  }
  async selectVariant(variant) {
    for (let index = 0; index < variant.options.length; index++) await this.option(index).selectOption(variant.options[index]);
  }
  async displayedPriceInCents() {
    return Math.round(Number((await this.price.innerText()).replace(/[^0-9.]/g, '')) * 100);
  }
  async isImageLoaded() { return this.image.evaluate(image => image.complete && image.naturalWidth > 0); }
  async openFullDetails() { await this.detailsLink.click(); }
  async bodyScrollLocked() { return this.page.evaluate(() => document.body.classList.contains('wgcp-lock')); }
  async focusLastControl() { await this.focusableControls.last().focus(); }
  async pressTab(shift = false) { await this.page.keyboard.press(shift ? 'Shift+Tab' : 'Tab'); }
  async blockProductLoad() {
    this.failureHandler = route => route.fulfill({ status: 503, contentType: 'application/json', body: '{"error":"Simulated product load failure"}' });
    await this.page.route('**/products/*.js', this.failureHandler);
  }
  async restoreProductLoad() {
    await this.page.unroute('**/products/*.js', this.failureHandler);
  }
  async retry() { await this.retryButton.click(); }
  async addToBag() {
    const [response] = await Promise.all([
      this.page.waitForResponse(response => new URL(response.url()).pathname.endsWith('/cart/add.js') && response.request().method() === 'POST'),
      this.purchaseButton.click(),
    ]);
    if (!response.ok()) throw new Error(`Quick View add failed: HTTP ${response.status()}: ${await response.text()}`);
  }
}
