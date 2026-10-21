export class ContactPage {
  constructor(page) {
    this.page = page;
    this.main = page.getByRole('main');
    this.heading = this.main.getByRole('heading', { name: 'Client Care & Inquiries', exact: true });
    this.form = this.main.locator('form#ContactForm');
    this.name = this.form.getByRole('textbox', { name: 'Your Name', exact: true });
    this.email = this.form.getByRole('textbox', { name: 'Email Address', exact: true });
    this.order = this.form.getByRole('textbox', { name: 'Order Number (Optional)', exact: true });
    this.topic = this.form.getByRole('combobox', { name: 'Reason for Inquiry', exact: true });
    this.message = this.form.getByRole('textbox', { name: 'Your Message', exact: true });
    this.sendButton = this.form.getByRole('button', { name: 'SEND INQUIRY', exact: true });
    this.faqLink = this.main.getByRole('link', { name: 'Frequently Asked Questions', exact: true });
    this.faqHeading = this.main.getByRole('heading', { name: 'Keeping it looking new', exact: true });
    this.emailLink = this.main.locator('a[href^="mailto:"]');
    this.phoneLink = this.main.locator('a[href^="tel:"]');
    this.fields = { name: this.name, email: this.email, order: this.order, message: this.message };
    this.submissionAttempts = 0;
  }

  async blockSubmissions() {
    await this.page.route('**/*', async route => {
      const request = route.request();
      if (request.method() === 'POST' && /^\/contact\/?$/.test(new URL(request.url()).pathname)) {
        this.submissionAttempts++;
        await route.abort('blockedbyclient');
      } else await route.fallback();
    });
  }
  async goto() {
    const response = await this.page.goto('/pages/contact', { waitUntil: 'domcontentloaded' });
    if (!response?.ok()) throw new Error(`Contact navigation failed: HTTP ${response?.status()}`);
    await this.heading.waitFor();
  }
  async fillInquiry({ name = 'Automation Test', email = 'qa@example.invalid', order = '', message = 'Synthetic validation test. Do not send.' } = {}) {
    await this.name.fill(name);
    await this.email.fill(email);
    await this.order.fill(order);
    await this.message.fill(message);
  }
  async clearField(field) { await this.fields[field].fill(''); }
  async selectTopic(value) { await this.topic.selectOption(value); }
  async formValid() { return this.form.evaluate(form => form.checkValidity()); }
  async fieldValidity(field) {
    return this.fields[field].evaluate(input => ({ valid: input.validity.valid, valueMissing: input.validity.valueMissing, typeMismatch: input.validity.typeMismatch }));
  }
  async attemptInvalidSubmission() { await this.sendButton.click(); }
  async openFaq() { await this.faqLink.click(); }
}
