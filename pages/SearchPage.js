import { productURLPattern } from '../utils/product-url.js';

export class SearchPage {
  constructor(page) {
    this.page = page;
    this.openButton = page.getByRole('button', { name: 'Open search', exact: true });
    this.dialog = page.locator('[data-owt-search-panel]');
    this.input = this.dialog.getByRole('combobox', { name: 'Search products', exact: true });
    this.closeButton = this.dialog.getByRole('button', { name: 'Close search', exact: true });
    this.status = this.dialog.getByRole('status');
    this.idleResults = this.dialog.locator('[data-owt-search-results][aria-busy="false"]');
    this.completedStatus = query => {
      const escaped = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return this.status.filter({ hasText: new RegExp(`^(?:[1-9]\\d* results?|No results) for “${escaped}”$`) });
    };
    this.results = this.dialog.getByRole('listbox', { name: 'Product results', exact: true });
    this.productOptions = this.results.getByRole('option');
    this.firstProduct = this.productOptions.first();
    this.firstProductImage = this.firstProduct.getByRole('img');
    this.pearlProduct = this.productOptions.filter({ hasText: /pearl/i }).first();
    this.suggestionButton = name => this.dialog.getByRole('button', { name, exact: true });
    this.emptyHeading = this.dialog.getByRole('heading', { name: 'No pieces match that search', exact: true });
    this.clearButton = this.dialog.getByRole('button', { name: 'Clear search', exact: true });
    this.productHeading = page.getByRole('main').getByRole('heading', { level: 1 });
  }

  async open() {
    await this.openButton.click();
  }

  async dismissWithEscape() { await this.input.press('Escape'); }
  async statusText() { return (await this.status.textContent()).trim(); }

  async close() {
    await this.closeButton.click();
  }

  async searchFor(query) {
    if (!query.trim()) {
      await this.input.fill(query);
      return;
    }
    await this.waitForSearch(query, () => this.input.fill(query));
  }

  async selectSuggestion(name) {
    await this.waitForSearch(name, () => this.suggestionButton(name).click());
  }

  async waitForSearch(query, action) {
    await action();
    // A functional search can use cached results. Require completed UI for this
    // exact query, rather than requiring a fresh network request every time.
    await this.completedStatus(query).waitFor({ timeout: 15_000 });
    await this.idleResults.waitFor({ state: 'attached' });
  }

  async clearSearch() {
    await this.clearButton.click();
  }

  async openFirstProduct() {
    const result = this.firstProduct;
    const title = await this.firstProductImage.getAttribute('alt');
    const destination = productURLPattern(await result.getAttribute('href'), this.page.url());
    await Promise.all([
      this.page.waitForURL(destination, { waitUntil: 'commit' }),
      result.click({ noWaitAfter: true }),
    ]);
    return title;
  }
}
