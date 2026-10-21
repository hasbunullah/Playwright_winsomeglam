import { test, expect } from '../fixtures/pages.fixture.js';

test.describe('Collections and product listing — positive scenarios', () => {
  test('Verify a directory collection opens its matching listing', async ({ collection, page }) => {
    await collection.goto('/collections');
    await expect(collection.directoryEarrings).toBeVisible();
    await collection.openDirectoryEarrings();
    await expect(page).toHaveURL(/\/collections\/earrings\/?$/);
    await expect(collection.heading).toHaveText('Earrings');
  });
});

test.describe('Product listing — positive scenarios', () => {
  test.beforeEach(async ({ collection }) => {
    await collection.goto();
  });

  test('Verify product cards display titles, loaded images and current prices', async ({ collection }) => {
    await expect(collection.firstCard).toBeVisible();
    for (let index = 0; index < await collection.cardCount(); index++) {
      await expect(collection.cardTitle(index)).toHaveText(/\S/);
      await expect(collection.cardPrice(index)).toHaveText(/\d/);
      const image = collection.cardImage(index);
      await collection.scrollToCardImage(index);
      await expect(image).toHaveAttribute('alt', /\S/);
      await expect.poll(() => collection.isCardImageLoaded(index)).toBe(true);
    }
  });

  for (const linkType of ['title', 'image']) {
    test(`Verify selecting a product through ${linkType === 'image' ? 'its image' : 'its title'} opens the matching product`, async ({ collection, page }) => {
      const { title, destination } = await collection.openProduct(0, linkType);
      await expect(page).toHaveURL(destination);
      await expect(collection.heading).toHaveText(title);
    });
  }

  for (const [sort, descending] of [['price-ascending', false], ['price-descending', true]]) {
    test(`Verify ${sort} orders displayed current prices correctly`, async ({ collection }) => {
      test.skip(await collection.total() < 2, 'Ordering requires at least two catalog products');
      await collection.sortBy(sort);
      const prices = await collection.visiblePrices();
      expect(prices.length).toBeGreaterThan(1);
      expect(prices).toEqual([...prices].sort((a, b) => descending ? b - a : a - b));
    });
  }

  for (const [sort, descending] of [['title-ascending', false], ['title-descending', true]]) {
    test(`Verify ${sort} orders displayed product titles correctly`, async ({ collection }) => {
      test.skip(await collection.total() < 2, 'Ordering requires at least two catalog products');
      await collection.sortBy(sort);
      const titles = await collection.visibleTitles();
      expect(titles.length).toBeGreaterThan(1);
      const comparison = new Intl.Collator('en', { sensitivity: 'base' });
      expect(titles).toEqual([...titles].sort((a, b) => descending ? comparison.compare(b, a) : comparison.compare(a, b)));
    });
  }

  for (const size of [9, 12, 16]) {
    test(`Verify choosing ${size} products per page displays the expected number`, async ({ collection, page }) => {
      const total = await collection.total();
      await collection.setPageSize(size);
      await expect(page).toHaveURL(new RegExp(`wg_per_page=${size}(?:&|$)`));
      await expect(collection.cards).toHaveCount(Math.min(size, total));
      await expect(collection.summary).toContainText(`of ${total} pieces`);
    });
  }

  test('Verify next page shows different products and Previous restores the first page', async ({ collection, page }) => {
    test.skip(await collection.total() <= 9, 'Pagination requires more than nine catalog products');
    const original = await collection.visibleTitles();
    await collection.goToPage(2, true);
    await expect(page).toHaveURL(/wg_page=2(?:&|$)/);
    await expect.poll(() => collection.visibleTitles()).not.toEqual(original);
    const second = await collection.visibleTitles();
    expect(second.filter(title => original.includes(title))).toEqual([]);
    await collection.goToPage(1);
    await expect.poll(() => collection.visibleTitles()).toEqual(original);
  });

  for (const group of ['Availability', 'Metal', 'Style', 'Stone']) {
    test(`Verify a supported ${group} filter applies and Clear restores the collection`, async ({ collection, page }) => {
      const total = await collection.total();
      const label = collection.firstEnabledFilter(group);
      await expect(label).toBeVisible();
      const advertisedCount = await collection.advertisedFilterCount(label);
      const { name, value } = await collection.applyFilter(label);
      await expect(collection.checkboxByValue(name, value)).toBeChecked();
      await expect(collection.root).toHaveAttribute('data-product-count', String(advertisedCount));
      await collection.clearFilters();
      await expect(page).toHaveURL(/\/collections\/all\/?$/);
      await expect(collection.root).toHaveAttribute('data-product-count', String(total));
    });
  }

  test('Verify the Under 30 quick filter excludes higher-priced products', async ({ collection, page }) => {
    await collection.applyUnder30Filter();
    await expect(page).toHaveURL(/filter\.v\.price\.lte=30/);
    await expect(collection.firstCard).toBeVisible();
    expect((await collection.visiblePrices()).every(price => price <= 30)).toBe(true);
  });

  test('Verify combined price and availability filters persist when sorting', async ({ collection }) => {
    await collection.goto('/collections/all?filter.v.price.lte=30');
    const label = collection.inStockLabel;
    await collection.applyFilter(label);
    await collection.sortBy('price-ascending');
    expect(collection.queryParameter('filter.v.price.lte')).toBe('30');
    expect(collection.queryParameter('filter.v.availability')).toBe('1');
    await expect(collection.inStockCheckbox).toBeChecked();
    await expect(collection.firstCard).toBeVisible();
    const prices = await collection.visiblePrices();
    expect(prices.every(price => price <= 30)).toBe(true);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });
});

test.describe('Collections and product listing — negative and boundary scenarios', () => {
  test('Verify a zero-price filter shows no products and Clear recovers the listing', async ({ collection, page }) => {
    await collection.goto('/collections/earrings?filter.v.price.lte=0');
    await expect(collection.emptyHeading).toBeVisible();
    await expect(collection.cards).toHaveCount(0);
    await collection.clearEmptyState();
    await expect(page).toHaveURL(/\/collections\/earrings\/?$/);
    await expect(collection.firstCard).toBeVisible();
  });

  test('Verify zero-count filter options cannot be selected', async ({ collection, page }) => {
    await collection.goto('/collections/earrings?filter.v.price.lte=0');
    const inputs = await collection.filterInputs();
    expect(inputs.length).toBeGreaterThan(0);
    for (const input of inputs) await expect(input).toBeDisabled();
    await expect(page).toHaveURL(/filter\.v\.price\.lte=0/);
  });

  for (const invalidSize of ['0', '-1', '999', 'invalid']) {
    test(`Verify unsupported page size ${invalidSize} falls back to nine products`, async ({ collection }) => {
      await collection.goto(`/collections/all?wg_per_page=${invalidSize}`);
      await expect(collection.pageSize).toHaveValue('9');
      await expect(collection.cards).toHaveCount(Math.min(9, await collection.total()));
    });
  }

  test('Verify a negative page number displays the first page with Previous disabled', async ({ collection }) => {
    await collection.goto('/collections/all?wg_page=-10');
    await expect(collection.summary).toHaveText(/^Showing 1[–-]\d+ of \d+ pieces$/);
    await expect(collection.disabledPrevious).toBeVisible();
  });

  test('Verify a page beyond the last page displays the final products with Next disabled', async ({ collection }) => {
    await collection.goto('/collections/all?wg_page=999999');
    const total = await collection.total();
    test.skip(total === 0, 'The final-page boundary requires a nonempty catalog');
    await expect(collection.cards).toHaveCount(total % 9 || 9);
    const first = Math.floor((total - 1) / 9) * 9 + 1;
    await expect(collection.summary).toHaveText(new RegExp(`^Showing ${first}[–-]${total} of ${total} pieces$`));
    await expect(collection.disabledNext).toBeVisible();
  });
});

test.describe('Mobile collections', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test('Verify mobile filters open and Escape dismisses them with focus restored', async ({ collection }) => {
    await collection.goto();
    await collection.openFilterDrawer();
    await expect(collection.openFilters).toHaveAttribute('aria-expanded', 'true');
    await expect(collection.closeFilters).toBeVisible();
    await collection.dismissFiltersWithEscape();
    await expect(collection.openFilters).toHaveAttribute('aria-expanded', 'false');
    await expect(collection.openFilters).toBeFocused();
  });

  test('Verify mobile price sorting orders products correctly', async ({ collection }) => {
    await collection.goto();
    test.skip(await collection.total() < 2, 'Ordering requires at least two catalog products');
    await collection.sortBy('price-descending');
    const prices = await collection.visiblePrices();
    expect(prices.length).toBeGreaterThan(1);
    expect(prices).toEqual([...prices].sort((a, b) => b - a));
  });

  test('Verify applying a zero maximum price on mobile shows the empty state', async ({ collection }) => {
    await collection.goto('/collections/earrings');
    await collection.openFilterDrawer();
    await collection.setMinimumPrice();
    await expect(collection.priceSlider).toHaveValue('0');
    await collection.submitFilters();
    await expect(collection.emptyHeading).toBeVisible();
    await expect(collection.cards).toHaveCount(0);
  });
});
