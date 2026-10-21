import { test, expect } from '../fixtures/pages.fixture.js';

const signInURL = /^https:\/\/shopify\.com\/authentication\/\d+\/login\/?(?:\?.*)?$/;

test.describe('Account - storefront entry points', () => {
  test('Verify the desktop Account link targets the account route', async ({ account }) => {
    await account.gotoStorefront();
    await expect(account.accountLink).toBeVisible();
    await expect(account.accountLink).toHaveAttribute('href', '/account');
  });

  test('Verify the desktop Account link opens Shopify sign-in', async ({ account, page }) => {
    await account.gotoStorefront();
    await account.openAccount();
    await expect(page).toHaveURL(signInURL);
    await expect(account.signInHeading).toBeVisible();
  });

  test('Verify Account supports keyboard navigation to sign-in', async ({ account, page }) => {
    await account.gotoStorefront();
    await account.openAccount(true);
    await expect(page).toHaveURL(signInURL);
    await expect(account.email).toBeVisible();
  });
});

test.describe('Account - anonymous sign-in UI and input constraints', () => {
  test.beforeEach(async ({ account }) => { await account.gotoSignIn(); });

  test('Verify direct account navigation redirects to email-based sign-in', async ({ account, page }) => {
    await expect(page).toHaveURL(signInURL);
    await expect(account.signInHeading).toBeVisible();
    await expect(account.email).toBeVisible();
    await expect(account.continueButton).toBeVisible();
    await expect(account.passwordInput).toHaveCount(0);
  });

  test('Verify the email field has a label and required email configuration', async ({ account }) => {
    await expect(account.email).toHaveAccessibleName('Email');
    await expect(account.email).toHaveAttribute('type', 'email');
    await expect(account.email).toHaveAttribute('required', '');
    await expect(account.email).toHaveAttribute('autocomplete', 'email');
  });

  test('Verify an empty email violates required-field constraints', async ({ account }) => {
    expect((await account.emailValidity()).valueMissing).toBe(true);
    expect((await account.emailValidity()).valid).toBe(false);
  });

  for (const email of ['invalid-email', 'qa@']) {
    test(`Verify malformed email ${email} violates email constraints`, async ({ account }) => {
      await account.fillEmail(email);
      expect((await account.emailValidity()).typeMismatch).toBe(true);
      expect((await account.emailValidity()).valid).toBe(false);
    });
  }

  test('Verify whitespace-only input is treated as an empty email', async ({ account }) => {
    await account.fillEmail('   ');
    expect((await account.emailValidity()).valueMissing).toBe(true);
  });

  test('Verify a syntactically valid email passes constraints without requesting a code', async ({ account }) => {
    await account.fillEmail('account-test@example.invalid');
    await expect(account.email).toHaveValue('account-test@example.invalid');
    expect((await account.emailValidity()).valid).toBe(true);
  });

  test('Verify correcting an invalid email clears its type mismatch', async ({ account }) => {
    await account.fillEmail('invalid-email');
    expect((await account.emailValidity()).typeMismatch).toBe(true);
    await account.fillEmail('account-test@example.invalid');
    expect((await account.emailValidity()).typeMismatch).toBe(false);
    expect((await account.emailValidity()).valid).toBe(true);
  });

  test('Verify marketing consent can be toggled without submitting sign-in', async ({ account }) => {
    const original = await account.marketingConsentChecked();
    await account.toggleMarketingConsent();
    expect(await account.marketingConsentChecked()).toBe(!original);
    await account.toggleMarketingConsent();
    expect(await account.marketingConsentChecked()).toBe(original);
  });

  test('Verify terms and privacy controls are available on sign-in', async ({ account }) => {
    await expect(account.termsButton).toBeVisible();
    await expect(account.privacyButton).toBeVisible();
    await expect(account.termsButton).toHaveAttribute('aria-haspopup', 'dialog');
    await expect(account.privacyButton).toHaveAttribute('aria-haspopup', 'dialog');
  });

  test('Verify the store identity link returns to the storefront', async ({ account, page }) => {
    await account.returnToStore();
    await expect(page).toHaveURL(/^https:\/\/winsomeglam\.com\/?(?:\?.*)?$/);
    await expect(account.accountLink).toBeVisible();
  });
});

test.describe('Mobile account', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test('Verify the mobile Account link opens sign-in', async ({ account, page }) => {
    await account.gotoStorefront();
    await account.openMobileMenu();
    await expect(account.mobileAccountLink).toBeVisible();
    await account.openMobileAccount();
    await expect(page).toHaveURL(signInURL);
    await expect(account.email).toBeVisible();
  });

  test('Verify mobile sign-in exposes email and Continue controls', async ({ account }) => {
    await account.gotoSignIn();
    await expect(account.email).toBeVisible();
    await expect(account.continueButton).toBeVisible();
    await account.fillEmail('invalid-email');
    expect((await account.emailValidity()).typeMismatch).toBe(true);
  });
});
