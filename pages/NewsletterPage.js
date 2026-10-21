export class NewsletterPage {
  constructor(page) {
    this.page = page;
    this.forms = {
      main: page.getByRole('main').locator('form.wg-newsletter__form'),
      footer: page.locator('footer.gv-footer-section').locator('form.gv-news-form'),
    };
    this.email = location => this.forms[location].getByRole('textbox');
    this.submitButton = location => this.forms[location].getByRole('button', { name: location === 'main' ? 'JOIN THE LIST' : 'Subscribe', exact: true });
    this.submissionAttempts = 0;
  }

  async blockSubscriptions() {
    await this.page.route('**/*', async route => {
      const request = route.request();
      if (request.method() === 'POST' && /^\/contact\/?$/.test(new URL(request.url()).pathname)) {
        this.submissionAttempts++;
        await route.abort('blockedbyclient');
      } else await route.fallback();
    });
  }

  async goto() {
    // These forms do not depend on every deferred home-page script finishing.
    const response = await this.page.goto('/', { waitUntil: 'commit' });
    if (!response?.ok()) throw new Error(`Newsletter navigation failed: HTTP ${response?.status()}`);
    await this.forms.main.waitFor();
    await this.forms.footer.waitFor();
  }
  async fillEmail(location, value) { await this.email(location).fill(value); }
  async submitInvalidEmail(location, keyboard = false) {
    if (keyboard) await this.email(location).press('Enter');
    else await this.submitButton(location).click();
  }
  async validity(location) {
    return this.email(location).evaluate(input => ({
      valid: input.validity.valid,
      valueMissing: input.validity.valueMissing,
      typeMismatch: input.validity.typeMismatch,
    }));
  }
}
