export class CheckoutPage {
  constructor(page) {
    this.page = page;
    this.heading = name => page.getByRole('heading', { name, exact: true });
    this.email = page.getByRole('textbox', { name: 'Email', exact: true });
    this.country = page.getByRole('combobox', { name: 'Country/Region', exact: true });
    this.firstName = page.getByRole('textbox', { name: 'First name', exact: true });
    this.lastName = page.getByRole('textbox', { name: 'Last name', exact: true });
    this.address = page.getByRole('combobox', { name: 'Address', exact: true });
    this.addressInput = this.address;
    this.city = page.getByRole('textbox', { name: 'City', exact: true });
    this.postcode = page.getByRole('textbox', { name: 'Postcode', exact: true });
    this.phone = page.getByRole('textbox', { name: 'Phone (optional)', exact: true });
    this.marketingConsent = page.getByRole('checkbox', { name: 'Email me with news and offers', exact: true });
    this.saveInformation = page.getByRole('checkbox', { name: 'Save this information for next time', exact: true });
    this.cartCheckoutButton = page.getByRole('main').locator('cart-items-component').getByRole('button', { name: 'Check out', exact: true });
    this.cartHeading = page.getByRole('main').getByRole('heading', { level: 1 });
    this.items = page.getByRole('table', { name: 'Shopping cart', exact: true });
    this.itemRow = title => this.items.getByRole('row').filter({ has: page.getByRole('cell').filter({ hasText: title }) });
    this.itemQuantity = title => this.itemRow(title).getByRole('cell').nth(2);
    this.costs = page.getByRole('table', { name: 'Cost summary', exact: true });
    this.subtotalRow = this.costs.getByRole('row').filter({ has: page.getByRole('rowheader', { name: 'Subtotal', exact: true }) });
    this.shippingRow = this.costs.getByRole('row').filter({ has: page.getByRole('rowheader', { name: 'Shipping', exact: true }) });
    this.totalRow = this.costs.getByRole('row').filter({ has: page.getByRole('rowheader', { name: 'Total', exact: true }) });
    this.shippingPrompt = page.getByText('Enter your shipping address to view available shipping methods.', { exact: true });
    this.paymentUnavailable = page.getByText('This store can’t accept payments right now.', { exact: true });
    // Inspection only: no page action exposes clicking this control.
    this.payButton = page.getByRole('button', { name: /^Pay now/ });
    this.policyButton = name => page.getByRole('button', { name, exact: true });
    this.summaryToggle = page.getByRole('button', { name: /^Order summary/ })
      .and(page.locator('[aria-controls="mobileOrderSummary"]'));
    this.fields = { email: this.email, firstName: this.firstName, lastName: this.lastName, address: this.addressInput, city: this.city, postcode: this.postcode, phone: this.phone };
  }

  async armSubmitGuard() {
    await this.page.addInitScript(() => {
      window.__checkoutBlockedSubmits = 0;
      document.addEventListener('submit', event => {
        if (location.pathname.startsWith('/checkouts/')) {
          event.preventDefault();
          event.stopImmediatePropagation();
          window.__checkoutBlockedSubmits++;
        }
      }, true);
      document.addEventListener('click', event => {
        const button = event.target instanceof Element ? event.target.closest('button') : null;
        if (location.pathname.startsWith('/checkouts/') && button &&
          (button.id === 'checkout-pay-button' || /^(pay now|place order|complete order)\b/i.test(button.textContent.trim()))) {
          event.preventDefault();
          event.stopImmediatePropagation();
          window.__checkoutBlockedSubmits++;
        }
      }, true);
    });
  }

  async waitForCheckout() {
    await this.email.waitFor();
    await this.heading('Payment').waitFor();
    // Initial checkout rendering can negotiate its session. Once ready, tests
    // block ALL browser mutations, including final submission and auto-save.
    await this.page.context().route('**/*', async route => {
      if (!['GET', 'HEAD', 'OPTIONS'].includes(route.request().method())) await route.abort('blockedbyclient');
      else await route.fallback();
    });
  }
  async goto() {
    await this.page.goto('/checkout', { waitUntil: 'commit' });
    await this.waitForCheckout();
  }
  async openFromCart() {
    await this.cartCheckoutButton.click({ noWaitAfter: true });
    await this.waitForCheckout();
  }
  async fillField(field, value) { await this.fields[field].fill(value); }
  async validity(field) {
    return this.fields[field].evaluate(input => ({ valid: input.validity.valid, valueMissing: input.validity.valueMissing, typeMismatch: input.validity.typeMismatch }));
  }
  async countryOptions() { return this.country.evaluate(select => [...select.options].map(option => ({ value: option.value, text: option.textContent.trim() }))); }
  async toggleMarketing() { await this.marketingConsent.click(); }
  async marketingChecked() { return this.marketingConsent.isChecked(); }
  async openMobileSummary() { await this.summaryToggle.click(); }
  async blockedFinalSubmits() { return this.page.evaluate(() => window.__checkoutBlockedSubmits || 0); }
  async subtotalInCents() {
    const text = await this.subtotalRow.innerText();
    const match = text.match(/\d[\d,]*\.\d{2}/);
    if (!match) throw new Error('Checkout subtotal does not contain a decimal currency amount');
    return Math.round(Number(match[0].replaceAll(',', '')) * 100);
  }
}
