export class ProductPage {
  constructor(page) {
    this.page = page;
    this.main = page.getByRole('main');
    this.root = this.main.locator('[data-wg-pdp]');
    this.heading = this.root.getByRole('heading', { level: 1 });
    this.price = this.root.locator('[data-wg-price]');
    this.comparePrice = this.root.locator('[data-wg-compare]');
    this.sku = this.root.locator('[data-wg-sku]');
    this.stock = this.root.locator('[data-wg-stock]');
    this.form = this.root.locator('form.wg-pdp__form');
    this.variantId = this.form.locator('[data-wg-variant-id]');
    this.quantity = this.form.locator('input[name="quantity"]');
    this.optionGroups = this.form.locator('[data-option-position]');
    this.addButton = this.form.locator('[data-wg-add]');
    this.buyButton = this.form.locator('[data-wg-buy-now]');
    this.thumbnails = this.root.locator('[data-wg-thumb]');
    this.slides = this.root.locator('[data-wg-slide]');
    this.slide = index => this.slides.nth(index);
    this.galleryTrack = this.root.locator('[data-wg-gallery-track]');
    this.activeSlide = this.root.locator('[data-wg-slide][aria-hidden="false"]');
    this.activeImage = this.activeSlide.locator('.wg-pdp__main-image');
    this.panels = this.root.locator('.wg-pdp__accordions details');
    this.stickyPrice = this.root.locator('[data-wg-sticky-price]');
    this.readyRoot = this.main.locator('[data-wg-pdp][data-wg-pdp-ready="true"]');
    this.variantData = this.root.locator('[data-wg-variants]');
    this.breadcrumbs = this.root.locator('.wg-pdp__breadcrumbs');
    this.thumbnail = index => this.thumbnails.nth(index);
    this.currentThumbnails = this.root.locator('[data-wg-thumb][aria-current="true"]');
    this.optionRadio = (index, value) => this.optionGroups.nth(index).getByRole('radio', { name: value, exact: true });
    this.optionLabel = index => this.optionGroups.nth(index).locator('[data-wg-option-label]');
    this.optionControlLabel = (index, id) => this.optionGroups.nth(index).locator('label[for="' + id + '"]');
    this.checkedOptions = index => this.optionGroups.nth(index).locator('input:checked');
    this.panel = name => this.panels.filter({ has: page.locator('summary', { hasText: name }) });
    this.panelSummary = name => this.panel(name).locator('summary');
    this.panelContent = name => this.panel(name).locator('.wg-pdp__accordion-content');
    this.stickyVariant = this.root.locator('[data-wg-sticky-meta]');
  }

  async goto(path = '/products/cz-triple-diamond-drop-earrings') {
    const response = await this.page.goto(path, { waitUntil: 'commit', timeout: 30_000 });
    if (!response?.ok()) throw new Error(`Product navigation failed: ${path} HTTP ${response?.status()}`);
    await this.readyRoot.waitFor();
    return response;
  }

  async title() { return this.root.getAttribute('data-product-title'); }
  async addToBag() {
    const [response] = await Promise.all([
      this.page.waitForResponse(response => new URL(response.url()).pathname.endsWith('/cart/add.js') && response.request().method() === 'POST'),
      this.addButton.click(),
    ]);
    if (!response.ok()) throw new Error(`Product add failed: HTTP ${response.status()}: ${await response.text()}`);
  }
  async displayedPrice() { return this.price.innerText(); }
  async priceInCents(comparison = false) {
    const text = await (comparison ? this.comparePrice : this.price).innerText();
    return Math.round(Number(text.replace(/[^0-9.]/g, '')) * 100);
  }
  async isImageLoaded() {
    return this.activeImage.evaluate(image => image.complete && image.naturalWidth > 0);
  }
  async mediaCount() { return this.thumbnails.count(); }
  async optionGroupCount() { return this.optionGroups.count(); }
  async reload() { await this.page.reload({ waitUntil: 'commit', timeout: 30_000 }); await this.readyRoot.waitFor(); }
  async closePanel(name) {
    if (await this.panel(name).getAttribute('open') !== null) await this.togglePanel(name);
  }
  async openUnknownProduct() {
    const response = await this.page.goto('/products/zzqv-nonexistent-product-987654', { waitUntil: 'domcontentloaded' });
    return response?.status();
  }
  async scrollToPurchaseControls() { await this.addButton.scrollIntoViewIfNeeded(); }
  async hasHorizontalOverflow() {
    return this.page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  }
  async alternativeVariant() {
    const current = await this.selectedVariant();
    return (await this.variants()).find(variant => variant.id !== current.id);
  }
  async availableVariant() { return (await this.variants()).find(variant => variant.available); }
  async unavailableVariant() { return (await this.variants()).find(variant => !variant.available); }
  async variantIds() { return (await this.variants()).map(variant => String(variant.id)); }

  async variants() {
    return JSON.parse(await this.variantData.textContent());
  }

  async selectedVariant() {
    const id = await this.variantId.inputValue();
    const variant = (await this.variants()).find(item => String(item.id) === id);
    if (!variant) throw new Error(`Selected variant ${id} is missing from product data`);
    return variant;
  }

  async selectVariant(variant) {
    for (let index = 0; index < variant.options.length; index++) {
      const radio = this.optionRadio(index, variant.options[index]);
      const id = await radio.getAttribute('id');
      await this.optionControlLabel(index, id).click();
    }
  }
  async togglePanel(name, key) {
    const summary = this.panelSummary(name);
    if (key) { await summary.focus(); await summary.press(key); }
    else await summary.click();
  }

  async selectMedia(index, keyboard = false) {
    const thumbnail = this.thumbnail(index);
    const mediaId = await this.slide(index).getAttribute('data-media-id');
    if (keyboard) { await thumbnail.focus(); await thumbnail.press('Enter'); }
    else if (await thumbnail.isVisible()) await thumbnail.click();
    else {
      // Mobile hides desktop thumbnails and changes media via horizontal scroll.
      // Exercise the track's real scroll listener instead of forcing a hidden click.
      await this.galleryTrack.scrollIntoViewIfNeeded();
      await this.galleryTrack.evaluate((track, targetIndex) => {
        track.scrollTo({ left: targetIndex * track.clientWidth, behavior: 'instant' });
      }, index);
    }
    return mediaId;
  }
}
