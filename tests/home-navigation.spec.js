import { test, expect } from '../fixtures/pages.fixture.js';

test.describe('Home and desktop navigation', () => {
  test('Verify the home page displays the brand and main navigation', async ({ home }) => {
    await expect(home.logo).toBeVisible();
    await expect(home.desktopNavigation).toBeVisible();
  });

  test("Verify the Shop Earrings hero link opens the correct collection", async ({ home }) => {
    await home.followHeroLink("SHOP EARRINGS");
    await expect(home.earringsHeading).toBeVisible();
  });

  test("Verify the Shop New In hero link opens the correct collection", async ({ home }) => {
    await home.followHeroLink("SHOP NEW IN");
    await expect(home.newInHeading).toBeVisible();
  });

  test("Verify the Earrings header link opens the correct page", async ({ home }) => {
    await home.followPrimaryLink("Earrings");
    await expect(home.earringsHeading).toBeVisible();
  });

  test("Verify the Collections header link opens the correct page", async ({ home }) => {
    await home.followPrimaryLink("Collections");
    await expect(home.collectionsHeading).toBeVisible();
  });

  test("Verify the New in header link opens the correct page", async ({ home }) => {
    await home.followPrimaryLink("New in");
    await expect(home.newInHeading).toBeVisible();
  });

  test("Verify the Our Story header link opens the correct page", async ({ home }) => {
    await home.followPrimaryLink("Our Story");
    await expect(home.storyHeading).toBeVisible();
  });

  test("Verify the Contact Us header link opens the correct page", async ({ home }) => {
    await home.followPrimaryLink("Contact Us");
    await expect(home.contactHeading).toBeVisible();
  });

  test('Verify the desktop Earrings menu opens and closes with Escape', async ({ home }) => {
    await home.openEarringsMenu();
    await expect(home.earringsMenu).toBeVisible();
    await home.closeEarringsMenu();
    await expect(home.earringsMenu).toBeHidden();
  });

  test("Verify the Earrings menu opens the Huggies collection", async ({ home }) => {
    await home.followEarringsLink('Huggies');
    await expect(home.huggiesHeading).toBeVisible();
  });

  test("Verify the Earrings menu opens the Studs collection", async ({ home }) => {
    await home.followEarringsLink('Studs');
    await expect(home.studsHeading).toBeVisible();
  });

  test("Verify the Earrings menu opens the Rings collection", async ({ home }) => {
    await home.followEarringsLink('Rings');
    await expect(home.ringsHeading).toBeVisible();
  });

  test('Verify the logo returns to the home page from a collection', async ({ home }) => {
    await home.followPrimaryLink('Collections');
    await expect(home.collectionsHeading).toBeVisible();
    await home.returnHome();
    await expect(home.signatureHeading).toBeVisible();
  });

  test("Verify the Terms of Service footer link opens the correct page", async ({ home }) => {
    await home.followFooterLink("Terms of Service");
    await expect(home.termsHeading).toBeVisible();
  });

  test("Verify the Shipping Policy footer link opens the correct page", async ({ home }) => {
    await home.followFooterLink("Shipping Policy");
    await expect(home.shippingHeading).toBeVisible();
  });

  test("Verify the Privacy Policy footer link opens the correct page", async ({ home }) => {
    await home.followFooterLink("Privacy Policy");
    await expect(home.privacyHeading).toBeVisible();
  });

  test("Verify the Refund Policy footer link opens the correct page", async ({ home }) => {
    await home.followFooterLink("Refund Policy");
    await expect(home.refundHeading).toBeVisible();
  });

  test("Verify the FAQ footer link opens the correct page", async ({ home }) => {
    await home.followFooterLink("FAQ's");
    await expect(home.faqHeading).toBeVisible();
  });
});

test.describe('Mobile navigation', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test('Verify the mobile menu opens and closes on the home page', async ({ home }) => {
    await home.openMobileMenu();
    await expect(home.mobileMenu).toBeVisible();
    await home.closeMobileMenu();
    await expect(home.mobileMenu).toBeHidden();
  });

  test('Verify the mobile Collections link opens the collection directory', async ({ home }) => {
    await home.openMobileMenu();
    await home.followMobileLink('Collections');
    await expect(home.collectionsHeading).toBeVisible();
  });
});
