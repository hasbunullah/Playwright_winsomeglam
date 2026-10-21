import { Buffer } from 'node:buffer';

// Generated one-pixel PNG. No personal image or external fixture is required.
const syntheticPhoto = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64');

export class VirtualTryOnPage {
  constructor(page) {
    this.page = page;
    this.readyRoot = page.locator('[data-vto-root][data-vto-ready="true"]');
    this.openButton = page.getByRole('main').locator('[data-vto-open]');
    this.dialog = this.readyRoot.getByRole('dialog', { name: 'See it on your ear', exact: true });
    this.closeButton = this.dialog.getByRole('button', { name: 'Close virtual try on', exact: true });
    this.status = this.dialog.getByRole('status');
    this.usePhotoButton = this.dialog.getByRole('button', { name: 'Use a Photo', exact: true });
    this.photoInput = this.readyRoot.locator('[data-vto-photo-input]');
    this.photo = this.dialog.locator('[data-vto-photo]');
    this.productImage = this.dialog.locator('[data-vto-product]');
    this.sizeSlider = this.dialog.locator('[data-vto-scale]');
    this.angleSlider = this.dialog.locator('[data-vto-rotate]');
    this.resetButton = this.dialog.getByRole('button', { name: 'Reset', exact: true });
    this.saveButton = this.dialog.getByRole('button', { name: 'Save Image', exact: true });
    this.video = this.dialog.locator('[data-vto-video]');
  }

  async disableCamera() {
    // Simulates an unsupported camera API before application scripts execute.
    await this.page.addInitScript(() => {
      Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: undefined });
    });
  }
  async goto() {
    const response = await this.page.goto('/products/cz-triple-diamond-drop-earrings', { waitUntil: 'commit', timeout: 30_000 });
    if (!response?.ok()) throw new Error(`Virtual Try-On navigation failed: HTTP ${response?.status()}`);
    await this.readyRoot.waitFor({ state: 'attached' });
  }
  async open(keyboard = false) {
    if (keyboard) { await this.openButton.focus(); await this.openButton.press('Enter'); }
    else await this.openButton.click();
  }
  async close() { await this.closeButton.click(); }
  async escape() { await this.page.keyboard.press('Escape'); }
  async uploadPhoto() {
    await this.photoInput.setInputFiles({ name: 'synthetic-preview.png', mimeType: 'image/png', buffer: syntheticPhoto });
  }
  async uploadInvalidFile() {
    await this.photoInput.setInputFiles({ name: 'invalid.txt', mimeType: 'text/plain', buffer: Buffer.from('Not an image') });
  }
  async uploadCorruptImage() {
    await this.photoInput.setInputFiles({ name: 'corrupt.png', mimeType: 'image/png', buffer: Buffer.from('Invalid PNG bytes') });
  }
  async choosePhotoThroughPicker() {
    const [chooser] = await Promise.all([this.page.waitForEvent('filechooser'), this.usePhotoButton.click()]);
    await chooser.setFiles({ name: 'synthetic-preview.png', mimeType: 'image/png', buffer: syntheticPhoto });
  }
  async setSizeToMaximum() { await this.sizeSlider.focus(); await this.sizeSlider.press('End'); }
  async setAngleToMinimum() { await this.angleSlider.focus(); await this.angleSlider.press('Home'); }
  async reset() { await this.resetButton.click(); }
  async overlayScale() { return this.productImage.evaluate(image => getComputedStyle(image).getPropertyValue('--vto-scale').trim()); }
  async overlayAngle() { return this.productImage.evaluate(image => getComputedStyle(image).getPropertyValue('--vto-rotation').trim()); }
  async isPreviewLoaded() { return this.photo.evaluate(image => image.complete && image.naturalWidth > 0); }
  async isProductImageLoaded() { return this.productImage.evaluate(image => image.complete && image.naturalWidth > 0); }
  async placement() {
    return this.productImage.evaluate(image => ({ left: image.style.left, top: image.style.top }));
  }
  async dragPiece() {
    const box = await this.productImage.boundingBox();
    if (!box) throw new Error('The product overlay must be visible before dragging');
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;
    await this.page.mouse.move(x, y);
    await this.page.mouse.down();
    await this.page.mouse.move(x + 25, y + 20, { steps: 5 });
    await this.page.mouse.up();
  }
  async downloadPreview() {
    const [download] = await Promise.all([this.page.waitForEvent('download'), this.saveButton.click()]);
    const stream = await download.createReadStream();
    if (!stream) throw new Error('Preview download has no readable content');
    const chunks = [];
    for await (const chunk of stream) chunks.push(chunk);
    const bytes = Buffer.concat(chunks);
    return { filename: download.suggestedFilename(), signature: bytes.subarray(0, 8).toString('hex'), length: bytes.length, failure: await download.failure() };
  }
}
