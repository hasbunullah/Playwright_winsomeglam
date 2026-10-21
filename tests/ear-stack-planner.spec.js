import { test, expect } from '../fixtures/pages.fixture.js';

test.describe('Ear Stack Planner - UI and keyboard', () => {
  test('Verify opening the planner displays the piercing selection step', async ({ planner }) => {
    await planner.open();
    await expect(planner.dialog).toBeVisible();
    await expect(planner.stepOne).toBeVisible();
    await expect(planner.stepTwo).toBeHidden();
  });

  test('Verify closing the planner restores focus to its trigger', async ({ planner }) => {
    await planner.open();
    await planner.close();
    await expect(planner.dialog).toBeHidden();
    await expect(planner.openButton).toBeFocused();
  });

  test('Verify Escape closes the planner and restores focus', async ({ planner }) => {
    await planner.open();
    await planner.escape();
    await expect(planner.dialog).toBeHidden();
    await expect(planner.openButton).toBeFocused();
  });

  test('Verify the planner can be opened with Enter', async ({ planner }) => {
    await planner.open(true);
    await expect(planner.dialog).toBeFocused();
    await expect(planner.stepOne).toBeVisible();
  });
});

test.describe('Ear Stack Planner - selection and totals', () => {
  test.beforeEach(async ({ planner }) => { await planner.open(); });

  for (const count of [1, 2, 3]) {
    test(`Verify choosing ${count} piercings displays the correct positions`, async ({ planner }) => {
      await planner.choosePiercings(count);
      await expect(planner.stepTwo).toBeVisible();
      await expect(planner.slots).toHaveCount(count);
      await expect(planner.positionLimit).toHaveText(String(count));
      await expect(planner.slot('lobe')).toBeVisible();
      if (count < 2) await expect(planner.slot('second_lobe')).toBeHidden();
      if (count < 3) await expect(planner.slot('helix')).toBeHidden();
    });
  }

  test('Verify selecting a piece fills its position and updates the total', async ({ planner }) => {
    await planner.choosePiercings(1);
    const piece = await planner.selectProduct();
    await expect(planner.slotTitle('lobe')).toHaveText(piece.title);
    await expect(planner.filledCount).toHaveText('1');
    expect(await planner.totalInCents()).toBe(piece.price);
    await expect(planner.addButton).toBeEnabled();
  });

  test('Verify two selected pieces produce the sum of their prices', async ({ planner }) => {
    await planner.choosePiercings(2);
    const first = await planner.selectProduct(0);
    const second = await planner.selectProduct(1);
    await expect(planner.slotTitle('lobe')).toHaveText(first.title);
    await expect(planner.slotTitle('second_lobe')).toHaveText(second.title);
    await expect(planner.filledCount).toHaveText('2');
    expect(await planner.totalInCents()).toBe(first.price + second.price);
  });

  test('Verify replacing a piece changes its position without increasing the count', async ({ planner }) => {
    await planner.choosePiercings(1);
    await planner.selectProduct(0);
    const replacement = await planner.selectProduct(1);
    await expect(planner.slotTitle('lobe')).toHaveText(replacement.title);
    await expect(planner.filledCount).toHaveText('1');
    expect(await planner.totalInCents()).toBe(replacement.price);
  });

  test('Verify removing a piece updates the remaining total', async ({ planner }) => {
    await planner.choosePiercings(2);
    await planner.selectProduct(0);
    const remaining = await planner.selectProduct(1);
    await planner.removeProduct('lobe');
    await expect(planner.filledCount).toHaveText('1');
    await expect(planner.removeButton('lobe')).toBeHidden();
    expect(await planner.totalInCents()).toBe(remaining.price);
  });

  test('Verify reducing positions removes pieces from excluded positions', async ({ planner }) => {
    await planner.choosePiercings(2);
    const retained = await planner.selectProduct(0);
    await planner.selectProduct(1);
    await planner.changePositions();
    await planner.choosePiercings(1);
    await expect(planner.slot('second_lobe')).toBeHidden();
    await expect(planner.filledCount).toHaveText('1');
    await expect(planner.slotTitle('lobe')).toHaveText(retained.title);
    expect(await planner.totalInCents()).toBe(retained.price);
  });

  test('Verify a starter preset fills its advertised number of positions', async ({ planner }) => {
    const count = await planner.selectPreset();
    await expect(planner.stepTwo).toBeVisible();
    await expect(planner.filledCount).toHaveText(String(count));
    await expect(planner.positionLimit).toHaveText(String(count));
    await expect(planner.saveButton).toBeEnabled();
  });

  test('Verify a locally saved stack is restored after reload', async ({ planner }) => {
    await planner.choosePiercings(1);
    const piece = await planner.selectProduct();
    await planner.save();
    await expect(planner.status).toHaveText('Your stack is saved on this device.');
    await planner.reload();
    await planner.open();
    await planner.choosePiercings(1);
    await expect(planner.slotTitle('lobe')).toHaveText(piece.title);
    await expect(planner.filledCount).toHaveText('1');
    expect(await planner.totalInCents()).toBe(piece.price);
  });

  test('Verify a position can be selected with the keyboard', async ({ planner }) => {
    await planner.choosePiercings(2);
    await planner.selectSlot('second_lobe', true);
    await expect(planner.slot('second_lobe')).toHaveAttribute('aria-current', 'true');
    const piece = await planner.selectProduct();
    await expect(planner.slotTitle('second_lobe')).toHaveText(piece.title);
  });
});

test.describe('Ear Stack Planner - negative and boundary scenarios', () => {
  test('Verify an empty stack disables Save, Share and Add', async ({ planner }) => {
    await planner.open();
    await planner.choosePiercings(1);
    await expect(planner.filledCount).toHaveText('0');
    await expect(planner.saveButton).toBeDisabled();
    await expect(planner.shareButton).toBeDisabled();
    await expect(planner.addButton).toBeDisabled();
    expect(await planner.totalInCents()).toBe(0);
  });

  test('Verify removing the last piece disables stack actions again', async ({ planner }) => {
    await planner.open();
    await planner.choosePiercings(1);
    await planner.selectProduct();
    await planner.removeProduct('lobe');
    await expect(planner.filledCount).toHaveText('0');
    await expect(planner.saveButton).toBeDisabled();
    await expect(planner.shareButton).toBeDisabled();
    await expect(planner.addButton).toBeDisabled();
    expect(await planner.totalInCents()).toBe(0);
  });

  test('Verify a malformed shared stack does not break planner selection', async ({ planner }) => {
    await planner.goto('?wg_stack=invalid-stack-payload');
    await planner.open();
    await planner.choosePiercings(1);
    await expect(planner.filledCount).toHaveText('0');
    const piece = await planner.selectProduct();
    await expect(planner.slotTitle('lobe')).toHaveText(piece.title);
  });
});

test.describe('Mobile Ear Stack Planner', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test('Verify mobile selection and removal update the stack', async ({ planner }) => {
    await planner.open();
    await planner.choosePiercings(1);
    const piece = await planner.selectProduct();
    await expect(planner.slotTitle('lobe')).toHaveText(piece.title);
    expect(await planner.totalInCents()).toBe(piece.price);
    await planner.removeProduct('lobe');
    await expect(planner.filledCount).toHaveText('0');
  });

  test('Verify the mobile planner closes with its Close control', async ({ planner }) => {
    await planner.open();
    await expect(planner.dialog).toBeVisible();
    await planner.close();
    await expect(planner.dialog).toBeHidden();
  });
});
