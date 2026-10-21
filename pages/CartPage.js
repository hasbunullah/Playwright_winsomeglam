export class CartPage {
  constructor(page) {
    this.page = page;
    this.main = page.getByRole('main');
    this.root = this.main.locator('cart-items-component');
    this.emptyHeading = this.root.getByRole('heading', { name: 'Your cart is empty', exact: true });
    this.continueLink = this.root.getByRole('link', { name: 'Continue shopping', exact: true });
    this.rows = this.root.locator('tbody tr[data-key]');
    this.row = index => this.rows.nth(index);
    this.itemTitle = index => this.row(index).locator('.cart-items__title');
    this.itemImage = index => this.row(index).getByRole('img');
    this.quantity = index => this.row(index).getByRole('spinbutton', { name: 'Quantity', exact: true });
    this.increase = index => this.row(index).getByRole('button', { name: 'Increase quantity', exact: true });
    this.decrease = index => this.row(index).getByRole('button', { name: 'Decrease quantity', exact: true });
    this.removeButton = index => this.row(index).getByRole('button', { name: /^Remove / });
    this.lineTotal = index => this.row(index).locator('.cart-items__price');
    this.total = this.root.getByTestId('cart-total-value');
    this.checkoutButton = this.root.getByRole('button', { name: 'Check out', exact: true });
    this.collectionHeading = this.main.getByRole('heading', { level: 1 });
    this.error = index => this.row(index).getByRole('alert');
  }

  async goto() { await this.page.goto('/cart', { waitUntil: 'domcontentloaded' }); await this.root.waitFor(); }
  async reload() { await this.page.reload({ waitUntil: 'domcontentloaded' }); await this.root.waitFor(); }
  async state() {
    const response = await this.page.request.get('/cart.js');
    if (!response.ok()) throw new Error(`Cart read failed: HTTP ${response.status()}`);
    return response.json();
  }
  async seed(variantId, quantity = 1) {
    const response = await this.page.request.post('/cart/add.js', { data: { items: [{ id: variantId, quantity }] } });
    if (!response.ok()) throw new Error(`Cart setup failed: HTTP ${response.status()}: ${await response.text()}`);
    return response.json();
  }
  async clearSession() {
    const response = await this.page.request.post('/cart/clear.js');
    if (!response.ok()) {
      const retryAfter = response.headers()['retry-after'];
      throw new Error(`Cart cleanup failed: HTTP ${response.status()}${retryAfter ? `; Retry-After: ${retryAfter}` : ''}. No automatic mutation retry was attempted.`);
    }
  }
  async clearIfNotEmpty() {
    if ((await this.state()).item_count > 0) await this.clearSession();
  }
  async continueShopping() { await this.continueLink.click(); }
  async changeQuantity(index, direction) {
    const [response] = await Promise.all([
      this.page.waitForResponse(response => /\/cart\/change(?:\.js)?$/.test(new URL(response.url()).pathname) && response.request().method() === 'POST'),
      (direction === 'increase' ? this.increase(index) : this.decrease(index)).click(),
    ]);
    if (!response.ok()) throw new Error(`Cart quantity change failed: HTTP ${response.status()}`);
  }
  async remove(index) {
    const [response] = await Promise.all([
      this.page.waitForResponse(response => /\/cart\/change(?:\.js)?$/.test(new URL(response.url()).pathname) && response.request().method() === 'POST'),
      this.removeButton(index).click(),
    ]);
    if (!response.ok()) throw new Error(`Cart removal failed: HTTP ${response.status()}`);
  }
  async enterQuantity(index, value) { await this.quantity(index).fill(value); }
  async quantityValidity(index) { return this.quantity(index).evaluate(input => input.validity.valid); }
  async totalInCents() { return Math.round(Number((await this.total.innerText()).replace(/[^0-9.]/g, '')) * 100); }
  async lineTotalInCents(index) { return Math.round(Number((await this.lineTotal(index).innerText()).replace(/[^0-9.]/g, '')) * 100); }
  async isImageLoaded(index) { return this.itemImage(index).evaluate(image => image.complete && image.naturalWidth > 0); }
  async openItem(index) { await this.itemTitle(index).click(); }
}
