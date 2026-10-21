export class AccountPage {
  constructor(page) {
    this.page = page;
    this.header = page.locator('[data-owt-header]');
    this.readyHeader = page.locator('[data-owt-header][data-owt-ready="true"]');
    this.accountLink = this.header.locator('a.owt-hdr__account');
    this.mobileToggle = this.header.getByRole('button', { name: 'Open menu', exact: true });
    this.mobileMenu = this.header.getByRole('dialog', { name: 'Main menu', exact: true });
    this.mobileAccountLink = this.mobileMenu.getByRole('link', { name: 'Account', exact: true });
    this.signInHeading = page.getByRole('heading', { name: 'Sign in', exact: true });
    this.email = page.getByRole('textbox', { name: 'Email', exact: true });
    this.continueButton = page.getByRole('button', { name: 'Continue', exact: true });
    this.marketingConsent = page.getByRole('checkbox', { name: 'Email me with news and offers', exact: true });
    this.storeLink = page.getByRole('link', { name: 'Winsome Glam', exact: true });
    this.termsButton = page.getByRole('button', { name: 'Terms of service', exact: true });
    this.privacyButton = page.getByRole('button', { name: 'Privacy policy', exact: true });
    this.passwordInput = page.locator('input[type="password"]');
  }

  async blockAuthenticationWrites() {
    // Blocks form, fetch and XHR mutations on the inspected identity host.
    // No login submission is part of this module's anonymous tests.
    await this.page.route('**/*', async route => {
      const request = route.request();
      const url = new URL(request.url());
      if (url.hostname === 'shopify.com' && !['GET', 'HEAD', 'OPTIONS'].includes(request.method())) {
        await route.abort('blockedbyclient');
      } else await route.fallback();
    });
  }

  async gotoStorefront() {
    const response = await this.page.goto('/', { waitUntil: 'commit' });
    if (!response?.ok()) throw new Error(`Account storefront navigation failed: HTTP ${response?.status()}`);
    await this.readyHeader.waitFor();
  }
  async gotoSignIn() {
    await this.page.goto('/account', { waitUntil: 'commit' });
    await this.email.waitFor();
  }
  async openAccount(keyboard = false) {
    if (keyboard) { await this.accountLink.focus(); await this.accountLink.press('Enter'); }
    else await this.accountLink.click({ noWaitAfter: true });
    await this.email.waitFor();
  }
  async openMobileMenu() { await this.mobileToggle.click(); }
  async openMobileAccount() { await this.mobileAccountLink.click({ noWaitAfter: true }); await this.email.waitFor(); }
  async fillEmail(value) { await this.email.fill(value); }
  async emailValidity() {
    return this.email.evaluate(input => ({ valid: input.validity.valid, valueMissing: input.validity.valueMissing, typeMismatch: input.validity.typeMismatch }));
  }
  async toggleMarketingConsent() { await this.marketingConsent.click(); }
  async marketingConsentChecked() { return this.marketingConsent.isChecked(); }
  async returnToStore() { await this.storeLink.click({ noWaitAfter: true }); await this.readyHeader.waitFor(); }
}
