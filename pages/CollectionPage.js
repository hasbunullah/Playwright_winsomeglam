import { productURLPattern } from '../utils/product-url.js';

export class CollectionPage {
  constructor(page) {
    this.page = page;
    this.main = page.getByRole('main');
    this.root = this.main.locator('[data-wgcp-section]');
    this.heading = this.main.getByRole('heading', { level: 1 });
    this.cards = this.root.locator('[data-wgcp-card]');
    this.titles = this.cards.locator('.wgcp-card__title');
    this.prices = this.cards.locator('.wgcp-current-price');
    this.sort = this.root.locator('[data-wgcp-sort]:visible');
    this.pageSize = this.root.locator('[data-wgcp-page-size]:visible');
    this.summary = this.root.locator('[data-wgcp-page-summary]');
    this.pagination = this.root.getByRole('navigation', { name: 'Product pages' });
    this.filters = this.root.locator('[data-wgcp-filter-drawer]');
    this.filterLabels = this.filters.locator('label.wgcp__filter-option');
    this.clear = this.filters.locator('.wgcp__filter-heading').getByRole('link', { name: 'Clear', exact: true });
    this.empty = this.root.locator('.wgcp__empty');
    this.openFilters = this.root.locator('[data-wgcp-filter-open]');
    this.closeFilters = this.filters.getByRole('button', { name: 'Close filters', exact: true });
    this.readyRoot = this.main.locator('[data-wgcp-section][data-wgcp-ready="true"]');
    this.readySummary = this.summary.filter({ hasText: /Showing/ });
    this.directoryEarrings = this.main.locator('a[href="/collections/earrings"]').first();
    this.firstCard = this.cards.first();
    this.cardTitle = index => this.cards.nth(index).locator('.wgcp-card__title');
    this.cardPrice = index => this.cards.nth(index).locator('.wgcp-current-price');
    this.cardImage = index => this.cards.nth(index).locator('.wgcp-card__image--primary');
    this.cardLink = (index, type) => this.cards.nth(index).locator(type === 'image' ? '.wgcp-card__image-link' : '.wgcp-card__title');
    this.pageLink = (number, last = false) => {
      const links = this.pagination.getByRole('link', { name: 'Go to page ' + number, exact: true });
      return last ? links.last() : links.first();
    };
    this.filterCheckbox = label => label.getByRole('checkbox');
    this.filterCount = label => label.locator('.wgcp__filter-count');
    this.checkboxByValue = (name, value) => this.filters.locator(`input[name="${name}"][value="${value}"]`);
    this.firstEnabledFilter = group => this.filters.locator('details')
      .filter({ has: page.locator('summary', { hasText: new RegExp('^\\s*' + group + '\\s*$', 'i') }) })
      .locator('label').filter({ has: page.locator('input[type="checkbox"]:not([disabled])') }).first();
    this.inStockLabel = this.filterLabels.filter({ has: page.locator('input[name="filter.v.availability"][value="1"]') });
    this.inStockCheckbox = this.filters.locator('input[name="filter.v.availability"][value="1"]');
    this.under30Link = this.root.locator('.wgcp__quick-filters').getByRole('link', { name: /UNDER/ });
    this.emptyHeading = this.empty.getByRole('heading', { name: 'No pieces found' });
    this.emptyClear = this.empty.getByRole('link', { name: 'Clear', exact: true });
    this.filterCheckboxes = this.filters.locator('input[type="checkbox"]');
    this.disabledPrevious = this.pagination.locator('[aria-disabled="true"]').filter({ hasText: /Prev/ });
    this.disabledNext = this.pagination.locator('[aria-disabled="true"]').filter({ hasText: /Next/ });
    this.applyFiltersButton = this.filters.getByRole('button', { name: 'APPLY FILTERS', exact: true });
    this.priceSlider = this.filters.getByRole('slider', { name: 'Price', exact: true });
  }

  async goto(path = '/collections/all') {
    const response = await this.page.goto(path, { waitUntil: 'domcontentloaded' });
    if (!response?.ok()) throw new Error(`Collection navigation failed: ${path} HTTP ${response?.status()}`);
    if (new URL(this.page.url()).pathname !== '/collections') {
      await this.readyRoot.waitFor();
      // Initialization is asynchronous; the summary is populated after rendering the logical page.
      if (await this.summary.count()) await this.readySummary.waitFor();
    }
    return response;
  }

  async sortBy(value) {
    await Promise.all([
      this.page.waitForURL(url => url.searchParams.get('sort_by') === value, { waitUntil: 'domcontentloaded' }),
      this.sort.selectOption(value),
    ]);
    await this.readySummary.waitFor();
  }

  async applyFilter(label) {
    const input = this.filterCheckbox(label);
    const name = await input.getAttribute('name');
    const value = await input.getAttribute('value');
    await Promise.all([
      this.page.waitForURL(url => url.searchParams.getAll(name).includes(value), { waitUntil: 'domcontentloaded' }),
      label.click(),
    ]);
    return { name, value };
  }
  async openDirectoryEarrings() { await this.directoryEarrings.click(); }
  async cardCount() { return this.cards.count(); }
  async scrollToCardImage(index) { await this.cardImage(index).scrollIntoViewIfNeeded(); }
  async isCardImageLoaded(index) {
    return this.cardImage(index).evaluate(image => image.complete && image.naturalWidth > 0);
  }
  async openProduct(index, linkType) {
    const title = (await this.cardTitle(index).innerText()).trim();
    const link = this.cardLink(index, linkType);
    const destination = productURLPattern(await link.getAttribute('href'), this.page.url());
    await link.click();
    return { title, destination };
  }
  async setPageSize(size) { await this.pageSize.selectOption(String(size)); }
  async visibleTitles() { return (await this.titles.allTextContents()).map(title => title.trim()); }
  async goToPage(number, last = false) { await this.pageLink(number, last).click(); }
  async advertisedFilterCount(label) { return Number(await this.filterCount(label).innerText()); }
  async clearFilters() { await this.clear.click(); }
  async applyUnder30Filter() { await this.under30Link.click(); }
  queryParameter(name) { return new URL(this.page.url()).searchParams.get(name); }
  async clearEmptyState() { await this.emptyClear.click(); }
  async filterInputs() { return this.filterCheckboxes.all(); }
  async openFilterDrawer() { await this.openFilters.click(); }
  async dismissFiltersWithEscape() { await this.page.keyboard.press('Escape'); }
  async setMinimumPrice() { await this.priceSlider.focus(); await this.priceSlider.press('Home'); }
  async submitFilters() { await this.applyFiltersButton.click(); }

  async visiblePrices() {
    return (await this.prices.allTextContents()).map(text => Number(text.replace(/[^0-9.]/g, '')));
  }

  async total() {
    return Number(await this.root.getAttribute('data-product-count'));
  }
}
