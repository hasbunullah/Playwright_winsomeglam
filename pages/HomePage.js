export class HomePage {
  constructor(page) {
    this.page = page;
    this.main = page.getByRole('main');
    this.signatureHeading = this.main.getByRole('heading', { name: 'Find Your Signature Shape', exact: true });
    this.earringsHeading = this.main.getByRole('heading', { name: 'Earrings', exact: true });
    this.newInHeading = this.main.getByRole('heading', { name: 'New in', exact: true });
    this.collectionsHeading = this.main.getByRole('heading', { name: 'Collections', exact: true });
    this.storyHeading = this.main.getByRole('heading', { name: 'Fine jewellery lost the plot. We wanted the feeling back.', exact: true });
    this.contactHeading = this.main.getByRole('heading', { name: 'Client Care & Inquiries', exact: true });
    this.huggiesHeading = this.main.getByRole('heading', { name: 'Huggies', exact: true });
    this.studsHeading = this.main.getByRole('heading', { name: 'Studs', exact: true });
    this.ringsHeading = this.main.getByRole('heading', { name: 'Rings', exact: true });
    this.termsHeading = this.main.getByRole('heading', { name: 'Terms of service', exact: true });
    this.shippingHeading = this.main.getByRole('heading', { name: 'Shipping policy', exact: true });
    this.privacyHeading = this.main.getByRole('heading', { name: 'Privacy policy', exact: true });
    this.refundHeading = this.main.getByRole('heading', { name: 'Refund policy', exact: true });
    this.faqHeading = this.main.getByRole('heading', { name: 'Keeping it looking new', exact: true });
    // Theme data attributes avoid generated Shopify section IDs.
    this.header = page.locator('[data-owt-header]');
    this.readyHeader = this.header.and(page.locator('[data-owt-ready="true"]'));
    this.desktopNavigation = this.header.getByRole('navigation', { name: 'Main navigation', exact: true });
    this.logo = this.header.getByRole('link', { name: 'Winsome Glam home', exact: true });
    this.earringsToggle = this.desktopNavigation.getByRole('button', { name: 'Open Earrings menu', exact: true });
    this.earringsMenu = this.header.locator('[data-owt-mega-panel]');
    this.mobileToggle = this.header.getByRole('button', { name: 'Open menu', exact: true });
    this.mobileMenu = this.header.getByRole('dialog', { name: 'Main menu', exact: true });
    this.mobileNavigation = this.mobileMenu.getByRole('navigation', { name: 'Mobile navigation', exact: true });
    this.mobileClose = this.mobileMenu.locator('aside').getByRole('button', { name: 'Close menu', exact: true });
    this.heroFirstSlide = this.main.locator('.wg-copy-slide').filter({
      has: page.getByRole('heading', { name: 'Jewellery for Every Occasion', exact: true }),
    });
    this.firstSlideButton = this.main.getByRole('button', { name: 'Go to slide 1', exact: true });
    this.pauseSlider = this.main.getByRole('button', { name: 'Pause slider', exact: true });
    this.footer = page.locator('footer.gv-footer-section');
    this.primaryLink = name => this.desktopNavigation.getByRole('link', { name, exact: true });
    this.heroLink = name => this.heroFirstSlide.getByRole('link', { name, exact: true });
    this.earringsLink = name => this.earringsMenu.getByRole('link', { name, exact: true });
    this.mobileLink = name => this.mobileNavigation.getByRole('link', { name, exact: true });
    this.footerLink = name => this.footer.getByRole('link', { name, exact: true });
  }

  async goto() {
    // Wait for the navigation UI instead of unrelated deferred page scripts.
    await this.page.goto('/', { waitUntil: 'commit' });
    await this.readyHeader.waitFor({ state: 'visible' });
    await this.main.waitFor({ state: 'visible' });
  }

  async followPrimaryLink(name) {
    await this.followLink(this.primaryLink(name));
  }

  async followHeroLink(name) {
    // Stop the carousel before selecting a slide so CTA clicks cannot race it.
    await this.pauseSlider.click();
    await this.firstSlideButton.click();
    await this.followLink(this.heroLink(name));
  }

  async openEarringsMenu() {
    // Keyboard focus opens the menu without racing its mouse-leave timer.
    await this.earringsToggle.focus();
    await this.earringsMenu.waitFor({ state: 'visible' });
  }

  async followEarringsLink(name) {
    await this.openEarringsMenu();
    await this.followLink(this.earringsLink(name));
  }

  async closeEarringsMenu() {
    // Send Escape from the menu control, as a keyboard user would.
    await this.earringsToggle.press('Escape');
  }

  async returnHome() {
    await this.followLink(this.logo);
  }

  async openMobileMenu() {
    await this.mobileToggle.click();
  }

  async closeMobileMenu() {
    await this.mobileClose.click();
  }

  async followMobileLink(name) {
    await this.followLink(this.mobileLink(name));
  }

  async followFooterLink(name) {
    await this.followLink(this.footerLink(name));
  }

  async followLink(link) {
    const destination = new URL(await link.getAttribute('href'), this.page.url()).href;
    // Wait for the destination document and its main content before assertions.
    await Promise.all([
      this.page.waitForURL(destination, { waitUntil: 'commit' }),
      link.click({ noWaitAfter: true }),
    ]);
    await this.main.waitFor({ state: 'visible' });
  }
}
