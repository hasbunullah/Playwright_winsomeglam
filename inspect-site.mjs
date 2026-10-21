import { chromium } from '@playwright/test';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

// Read-only discovery: navigation and DOM inspection only, no form submissions.
const origin = 'https://winsomeglam.com';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const previous = await readFile('docs/site-inventory.json', 'utf8').then(JSON.parse).catch(() => null);
const canonical = path => path.includes('/products/') ? '/products/' + path.split('/products/')[1] : path;
const pending = previous ? [...new Set(previous.remaining.map(canonical))] : ['/', '/cart', '/search?q=pearl'];
const results = previous?.pages || [];
const seen = new Set(results.map(row => canonical(row.path)));
const cleanUrl = href => { const url = new URL(href); return url.origin + url.pathname; };
try {
  while (pending.length && seen.size < 110) {
    const path = pending.shift();
    if (seen.has(canonical(path))) continue;
    seen.add(canonical(path));
    try {
      const response = await page.goto(origin + path, { waitUntil: 'domcontentloaded', timeout: 20000 });
      const data = await page.evaluate(() => ({
        title: document.title,
        headings: [...document.querySelectorAll('main h1, main h2, main h3')].map(e => e.textContent.trim()),
        text: (document.querySelector('main') || document.body).innerText.slice(0, 16000),
        controls: [...document.querySelectorAll('main button, main input, main select, main textarea')].map(e => ({ tag: e.tagName, type: e.type, name: e.name, label: e.getAttribute('aria-label'), placeholder: e.getAttribute('placeholder'), text: e.textContent.trim().slice(0, 250) })),
        links: [...new Set([...document.querySelectorAll('a[href]')].map(e => e.href))],
      }));
      const links = data.links;
      data.links = links.map(cleanUrl);
      results.push({ path, url: cleanUrl(page.url()), status: response?.status(), ...data });
      console.log(`${response?.status()} ${path}`);
      for (const href of links) {
        const url = new URL(href);
        if (url.origin === origin && /^\/(collections(?:\/|$)|products\/|pages\/|policies\/|account$)/.test(url.pathname) && !seen.has(url.pathname) && !pending.includes(url.pathname)) pending.push(url.pathname);
      }
    } catch (error) {
      results.push({ path, error: error.message });
      console.log(`ERROR ${path}`);
    }
  }
  await mkdir('docs', { recursive: true });
  await writeFile('docs/site-inventory.json', JSON.stringify({ inspectedAt: new Date().toISOString(), method: 'Read-only Chromium navigation; no user interactions or submissions', remaining: pending, pages: results }, null, 2));
} finally {
  await browser.close();
}
