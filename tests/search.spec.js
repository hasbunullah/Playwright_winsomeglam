import { test, expect } from '../fixtures/pages.fixture.js';

test.describe('Search', () => {
  test('Verify the header search opens with a search input', async ({ search }) => {
    await expect(search.input).toBeVisible();
  });

  test('Verify opening search focuses the search input', async ({ search }) => {
    await expect(search.input).toBeFocused();
  });

  test('Verify opening search displays default products', async ({ search }) => {
    await expect(search.firstProduct).toBeVisible();
  });

  test('Verify the close button dismisses search', async ({ search }) => {
    await search.close();
    await expect(search.dialog).toBeHidden();
  });

  test('Verify Escape dismisses search and returns focus to its trigger', async ({ search }) => {
    await search.dismissWithEscape();
    await expect(search.dialog).toBeHidden();
    await expect(search.openButton).toBeFocused();
  });

  test('Verify a product keyword returns relevant search results', async ({ search }) => {
    await search.searchFor('Pearl');
    await expect(search.pearlProduct).toBeVisible();
  });

  test('Verify an unmatched query displays the no-results state', async ({ search }) => {
    await search.searchFor('zzqvnomatch987654');
    await expect(search.status).toHaveText('No results for “zzqvnomatch987654”');
    await expect(search.emptyHeading).toBeVisible();
  });

  test('Verify Clear search restores the default products after no results', async ({ search }) => {
    await search.searchFor('zzqvnomatch987654');
    await expect(search.emptyHeading).toBeVisible();
    await search.clearSearch();
    await expect(search.input).toHaveValue('');
    await expect(search.firstProduct).toBeVisible();
  });

  test('Verify removing a query restores the default search state', async ({ search }) => {
    const defaultStatus = await search.statusText();
    await search.searchFor('Pearl');
    await expect(search.status).toContainText('results for “Pearl”');
    await search.searchFor('');
    await expect(search.status).toHaveText(defaultStatus);
  });

  test('Verify a whitespace-only query resets to an empty input', async ({ search }) => {
    await search.searchFor('   ');
    await expect(search.input).toHaveValue('');
    await expect(search.firstProduct).toBeVisible();
  });

  for (const suggestion of ['Pearl', 'Huggies', 'Gold', 'Drops', 'Climbers']) {
    test(`Verify the ${suggestion} suggestion applies its search query`, async ({ search }) => {
      await search.selectSuggestion(suggestion);
      await expect(search.input).toHaveValue(suggestion);
      await expect(search.status).toHaveText(new RegExp(`^(?:[1-9]\\d* results?|No results) for “${suggestion}”$`));
    });
  }

  test('Verify selecting a search result opens the matching product', async ({ search }) => {
    await search.searchFor('Pearl');
    await expect(search.status).toContainText('results for “Pearl”');
    const title = await search.openFirstProduct();
    await expect(search.productHeading).toHaveText(title);
  });
});

test.describe('Mobile search', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test('Verify mobile search opens and closes', async ({ search }) => {
    await expect(search.input).toBeVisible();
    await search.close();
    await expect(search.dialog).toBeHidden();
  });

  test('Verify a mobile search displays relevant product results', async ({ search }) => {
    await search.searchFor('Pearl');
    await expect(search.pearlProduct).toBeVisible();
  });
});
