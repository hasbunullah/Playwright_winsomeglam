export class ContentPage {
  constructor(page) {
    this.page = page;
    this.main = page.getByRole('main');
    this.heading = name => this.main.getByRole('heading', { name, exact: true });
    this.policyBody = this.main.locator('.shopify-policy__body');
    this.storyParagraphs = this.main.locator('p');
    this.faqRoot = this.main.locator('.wg-care-faqs');
    this.faqItem = question => this.faqRoot.locator('.wg-faq-item').filter({ has: page.locator('.wg-faq-item__question', { hasText: question }) });
    this.faqButton = question => this.faqItem(question).getByRole('button');
    this.faqAnswer = question => this.faqItem(question).locator('.wg-faq-item__content');
    this.careCard = title => this.faqRoot.locator('.wg-care-card').filter({ has: page.getByRole('heading', { name: title, exact: true }) });
    this.careText = title => this.careCard(title).locator('.wg-care-card__text');
  }

  async goto(path) {
    const response = await this.page.goto(path, { waitUntil: 'domcontentloaded' });
    if (!response?.ok()) throw new Error(`Content navigation failed for ${path}: HTTP ${response?.status()}`);
    await this.main.waitFor();
  }
  async toggleQuestion(question, keyboard = false) {
    if (keyboard) { await this.faqButton(question).focus(); await this.faqButton(question).press('Enter'); }
    else await this.faqButton(question).click();
  }
  async storyText() { return this.storyParagraphs.allTextContents(); }
}
