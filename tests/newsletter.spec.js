import { test, expect } from '../fixtures/pages.fixture.js';

for (const location of ['main', 'footer']) {
  test.describe(`Newsletter - ${location} signup`, () => {
    test('Verify the signup displays a required email input and submit control', async ({ newsletter }) => {
      await expect(newsletter.forms[location]).toBeVisible();
      await expect(newsletter.email(location)).toBeVisible();
      await expect(newsletter.email(location)).toHaveAttribute('type', 'email');
      await expect(newsletter.email(location)).toHaveAttribute('required', '');
      await expect(newsletter.submitButton(location)).toBeVisible();
    });

    test('Verify the email input has a meaningful accessible name', async ({ newsletter }) => {
      await expect(newsletter.email(location), 'An email field needs a programmatic label; placeholder text alone is insufficient').toHaveAccessibleName(/email/i);
    });

    test('Verify an empty email blocks subscription and focuses the input', async ({ newsletter }) => {
      await newsletter.submitInvalidEmail(location);
      expect((await newsletter.validity(location)).valueMissing).toBe(true);
      await expect(newsletter.email(location)).toBeFocused();
      expect(newsletter.submissionAttempts).toBe(0);
    });

    for (const email of ['not-an-email', 'qa@']) {
      test(`Verify malformed email ${email} blocks subscription`, async ({ newsletter }) => {
        await newsletter.fillEmail(location, email);
        await newsletter.submitInvalidEmail(location);
        expect((await newsletter.validity(location)).typeMismatch).toBe(true);
        await expect(newsletter.email(location)).toBeFocused();
        expect(newsletter.submissionAttempts).toBe(0);
      });
    }

    test('Verify whitespace-only email cannot be subscribed', async ({ newsletter }) => {
      await newsletter.fillEmail(location, '   ');
      await newsletter.submitInvalidEmail(location);
      expect((await newsletter.validity(location)).valueMissing).toBe(true);
      expect(newsletter.submissionAttempts).toBe(0);
    });

    test('Verify a syntactically valid email passes browser validation without submission', async ({ newsletter }) => {
      await newsletter.fillEmail(location, 'newsletter-test@example.invalid');
      await expect(newsletter.email(location)).toHaveValue('newsletter-test@example.invalid');
      expect((await newsletter.validity(location)).valid).toBe(true);
      expect(newsletter.submissionAttempts).toBe(0);
    });

    test('Verify editing one signup leaves the other email field unchanged', async ({ newsletter }) => {
      const other = location === 'main' ? 'footer' : 'main';
      await newsletter.fillEmail(location, 'newsletter-test@example.invalid');
      await expect(newsletter.email(location)).toHaveValue('newsletter-test@example.invalid');
      await expect(newsletter.email(other)).toHaveValue('');
    });

    test('Verify Enter on an empty email blocks subscription', async ({ newsletter }) => {
      await newsletter.submitInvalidEmail(location, true);
      expect((await newsletter.validity(location)).valueMissing).toBe(true);
      await expect(newsletter.email(location)).toBeFocused();
      expect(newsletter.submissionAttempts).toBe(0);
    });
  });
}

test.describe('Mobile newsletter', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  for (const location of ['main', 'footer']) {
    test(`Verify mobile ${location} signup displays and rejects an invalid email`, async ({ newsletter }) => {
      await expect(newsletter.email(location)).toBeVisible();
      await expect(newsletter.submitButton(location)).toBeVisible();
      await newsletter.fillEmail(location, 'invalid-email');
      await newsletter.submitInvalidEmail(location);
      expect((await newsletter.validity(location)).typeMismatch).toBe(true);
      await expect(newsletter.email(location)).toBeFocused();
      expect(newsletter.submissionAttempts).toBe(0);
    });
  }
});
