import { test, expect } from '../fixtures/pages.fixture.js';

const questions = ['Will these tarnish?', 'Are they safe for sensitive ears?', 'How long does international delivery take?'];

test.describe('Content - story and policy pages', () => {
  for (const path of ['/pages/our-story', '/pages/our-story-1']) {
    test(`Verify ${path} displays the story and its key sections`, async ({ content }) => {
      await content.goto(path);
      await expect(content.heading('Fine jewellery lost the plot. We wanted the feeling back.')).toBeVisible();
      for (const heading of ['Thicker plating', 'Small batches', 'Honest pricing']) await expect(content.heading(heading)).toBeVisible();
      expect((await content.storyText()).join(' ').trim().length).toBeGreaterThan(100);
    });
  }

  for (const [slug, title] of [['terms-of-service', 'Terms of service'], ['shipping-policy', 'Shipping policy'], ['privacy-policy', 'Privacy policy'], ['refund-policy', 'Refund policy']]) {
    test(`Verify ${title} loads with readable policy content`, async ({ content }) => {
      await content.goto(`/policies/${slug}`);
      await expect(content.heading(title)).toBeVisible();
      await expect(content.policyBody).toBeVisible();
      await expect(content.policyBody).toContainText('Winsome Glam');
      await expect(content.policyBody).not.toHaveText(/^\s*$/);
    });
  }
});

test.describe('Content - care and FAQ interactions', () => {
  test.beforeEach(async ({ content }) => { await content.goto('/pages/faqs'); });

  for (const title of ['Daily', 'Storage', 'Water']) {
    test(`Verify the ${title} care card displays guidance`, async ({ content }) => {
      await expect(content.heading(title)).toBeVisible();
      await expect(content.careText(title)).toBeVisible();
      await expect(content.careText(title)).toHaveText(/\S/);
    });
  }

  for (const question of questions) {
    test(`Verify FAQ opens and closes: ${question}`, async ({ content }) => {
      await expect(content.faqButton(question)).toHaveAttribute('aria-expanded', 'false');
      await expect(content.faqAnswer(question)).toBeHidden();
      await content.toggleQuestion(question);
      await expect(content.faqButton(question)).toHaveAttribute('aria-expanded', 'true');
      await expect(content.faqAnswer(question)).toBeVisible();
      await content.toggleQuestion(question);
      await expect(content.faqButton(question)).toHaveAttribute('aria-expanded', 'false');
      await expect(content.faqAnswer(question)).toBeHidden();
    });

    test(`Verify FAQ has a published answer rather than placeholder text: ${question}`, async ({ content }) => {
      await content.toggleQuestion(question);
      await expect(content.faqAnswer(question)).toHaveText(/\S/);
      await expect(content.faqAnswer(question), 'FAQ content must be completed before publication').not.toContainText('Provide the answer to the frequently asked question here.');
    });
  }

  test('Verify FAQ supports keyboard expansion and collapse', async ({ content }) => {
    const question = questions[0];
    await content.toggleQuestion(question, true);
    await expect(content.faqAnswer(question)).toBeVisible();
    await content.toggleQuestion(question, true);
    await expect(content.faqAnswer(question)).toBeHidden();
    await expect(content.faqButton(question)).toBeFocused();
  });
});

test.describe('Mobile content', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  test('Verify mobile FAQ expands its answer', async ({ content }) => {
    await content.goto('/pages/faqs');
    await content.toggleQuestion(questions[0]);
    await expect(content.faqAnswer(questions[0])).toBeVisible();
    await expect(content.faqButton(questions[0])).toHaveAttribute('aria-expanded', 'true');
  });
});
