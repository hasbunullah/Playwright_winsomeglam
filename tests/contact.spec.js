import { test, expect } from '../fixtures/pages.fixture.js';

test.describe('Contact - UI and navigation', () => {
  test('Verify contact fields have accessible labels and required controls', async ({ contact }) => {
    await expect(contact.heading).toBeVisible();
    for (const field of [contact.name, contact.email, contact.message]) {
      await expect(field).toBeVisible();
      await expect(field).toHaveAttribute('required', '');
    }
    await expect(contact.order).toBeVisible();
    await expect(contact.topic).toBeVisible();
    await expect(contact.sendButton).toBeVisible();
  });

  test('Verify contact channels use email and telephone links', async ({ contact }) => {
    await expect(contact.emailLink).toBeVisible();
    await expect(contact.emailLink).toHaveAttribute('href', /^mailto:[^\s@]+@[^\s@]+$/);
    await expect(contact.phoneLink).toBeVisible();
    await expect(contact.phoneLink).toHaveAttribute('href', /^tel:\+?[\d\s-]+$/);
  });

  test('Verify the FAQ link opens care and questions', async ({ contact, page }) => {
    await contact.openFaq();
    await expect(page).toHaveURL(/\/pages\/faqs\/?$/);
    await expect(contact.faqHeading).toBeVisible();
  });
});

test.describe('Contact - validation without live inquiry submission', () => {
  test('Verify submitting an empty form focuses the required name field', async ({ contact }) => {
    await contact.attemptInvalidSubmission();
    await expect(contact.name).toBeFocused();
    expect(await contact.formValid()).toBe(false);
    expect(contact.submissionAttempts).toBe(0);
  });

  for (const field of ['name', 'email', 'message']) {
    test(`Verify a missing ${field} blocks inquiry submission`, async ({ contact }) => {
      await contact.fillInquiry();
      await contact.clearField(field);
      await contact.attemptInvalidSubmission();
      expect((await contact.fieldValidity(field)).valueMissing).toBe(true);
      expect(await contact.formValid()).toBe(false);
      await expect(contact.fields[field]).toBeFocused();
      expect(contact.submissionAttempts).toBe(0);
    });
  }

  for (const email of ['not-an-email', 'qa@']) {
    test(`Verify invalid email ${email} blocks inquiry submission`, async ({ contact }) => {
      await contact.fillInquiry({ email });
      await contact.attemptInvalidSubmission();
      expect((await contact.fieldValidity('email')).typeMismatch).toBe(true);
      await expect(contact.email).toBeFocused();
      expect(contact.submissionAttempts).toBe(0);
    });
  }

  test('Verify valid required fields pass browser validation with no order number', async ({ contact }) => {
    await contact.fillInquiry();
    await expect(contact.order).toHaveValue('');
    expect(await contact.formValid()).toBe(true);
    expect(contact.submissionAttempts).toBe(0);
  });

  for (const topic of ['Order & Delivery', 'Sizing & Styling Advice', 'Returns & Exchanges', 'Custom Order / Gifting', 'General Question']) {
    test(`Verify inquiry topic selection: ${topic}`, async ({ contact }) => {
      await contact.selectTopic(topic);
      await expect(contact.topic).toHaveValue(topic);
    });
  }
});

test.describe('Mobile contact', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  test('Verify mobile contact fields retain entered values and validation', async ({ contact }) => {
    await contact.fillInquiry({ name: 'Mobile Test', message: 'Synthetic mobile validation.' });
    await expect(contact.name).toHaveValue('Mobile Test');
    await expect(contact.message).toHaveValue('Synthetic mobile validation.');
    expect(await contact.formValid()).toBe(true);
    expect(contact.submissionAttempts).toBe(0);
  });
});
