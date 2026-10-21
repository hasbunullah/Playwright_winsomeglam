export class EarStackPlannerPage {
  constructor(page) {
    this.page = page;
    this.readyRoot = page.locator('[data-wg-planner-ready="true"]');
    this.openButton = this.readyRoot.locator('[data-wg-planner-open]');
    this.dialog = this.readyRoot.getByRole('dialog', { name: 'Ear stack planner', exact: true });
    this.closeButton = this.dialog.getByRole('button', { name: 'Close ear stack planner', exact: true });
    this.stepOne = this.dialog.locator('[data-wg-step-view="1"]');
    this.stepTwo = this.dialog.locator('[data-wg-step-view="2"]');
    this.piercingChoice = count => this.dialog.locator(`[data-wg-piercing-count="${count}"]`);
    this.slots = this.dialog.locator('[data-wg-slot]:visible');
    this.slot = key => this.dialog.locator(`[data-wg-slot][data-slot-id="${key}"]`);
    this.slotTitle = key => this.slot(key).locator('.wg-slot-name');
    this.removeButton = key => this.slot(key).locator('[data-wg-slot-remove]');
    this.products = this.dialog.locator('[data-wg-product]:visible:not([disabled])');
    this.product = index => this.products.nth(index);
    this.filledCount = this.dialog.locator('[data-wg-filled-count]');
    this.positionLimit = this.dialog.locator('[data-wg-position-limit]');
    this.total = this.dialog.locator('[data-wg-stack-total-price]');
    this.saveButton = this.dialog.getByRole('button', { name: 'SAVE', exact: true });
    this.shareButton = this.dialog.getByRole('button', { name: 'SHARE', exact: true });
    this.addButton = this.dialog.getByRole('button', { name: 'ADD THE STACK', exact: true });
    this.changeButton = this.dialog.getByRole('button', { name: 'Change positions', exact: true });
    this.status = this.dialog.locator('[data-wg-planner-status]');
    this.presets = this.stepOne.locator('[data-wg-starter-stack]');
    this.preset = index => this.presets.nth(index);
  }

  async goto(query = '') {
    const response = await this.page.goto(`/products/cz-triple-diamond-drop-earrings${query}`, { waitUntil: 'domcontentloaded' });
    if (!response?.ok()) throw new Error(`Planner navigation failed: HTTP ${response?.status()}`);
    await this.readyRoot.waitFor();
  }
  async open(keyboard = false) {
    if (keyboard) { await this.openButton.focus(); await this.openButton.press('Enter'); }
    else await this.openButton.click();
  }
  async close() { await this.closeButton.click(); }
  async escape() { await this.page.keyboard.press('Escape'); }
  async choosePiercings(count) { await this.piercingChoice(count).click(); }
  async selectSlot(key, keyboard = false) {
    if (keyboard) { await this.slot(key).focus(); await this.slot(key).press('Enter'); }
    else await this.slot(key).click();
  }
  async selectProduct(index = 0) {
    const card = this.product(index);
    const data = {
      title: await card.getAttribute('data-title'),
      id: Number(await card.getAttribute('data-product-id')),
      price: Number(await card.getAttribute('data-price')),
    };
    await card.click();
    return data;
  }
  async removeProduct(key) { await this.removeButton(key).click(); }
  async changePositions() { await this.changeButton.click(); }
  async selectPreset(index = 0) {
    const count = Number(await this.preset(index).getAttribute('data-count'));
    await this.preset(index).click();
    return count;
  }
  async save() { await this.saveButton.click(); }
  async reload() { await this.page.reload({ waitUntil: 'domcontentloaded' }); await this.readyRoot.waitFor(); }
  async totalInCents() { return Math.round(Number((await this.total.innerText()).replace(/[^0-9.]/g, '')) * 100); }
}
