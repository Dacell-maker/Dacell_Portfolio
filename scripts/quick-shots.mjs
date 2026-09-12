import { chromium } from 'playwright-core';
import fs from 'node:fs';
const BASE = 'http://localhost:5173';
fs.mkdirSync('screenshots', { recursive: true });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
const page = await context.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));

await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForSelector('.preloader', { state: 'detached', timeout: 15000 });
await wait(2600);
await page.screenshot({ path: 'screenshots/01-hero.png' });
console.log('title:', JSON.stringify((await page.textContent('.hero__title'))?.replace(/\s+/g, ' ').trim()));

for (const [id, file] of [['about','02-about.png'],['projects','03-projects.png'],['skills','04-skills.png'],['experience','05-experience.png'],['contact','06-contact.png']]) {
  await page.evaluate((s) => { const el = document.getElementById(s); window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 40, behavior: 'auto' }); }, id);
  await wait(1500);
  await page.screenshot({ path: `screenshots/${file}` });
}
await page.evaluate(() => { const el = document.getElementById('projects'); window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 40, behavior: 'auto' }); });
await wait(800);
await page.locator('.project-card').first().hover();
await wait(700);
await page.screenshot({ path: 'screenshots/07-card-hover.png' });
console.log('errors:', errors.length ? errors : 'none');
await browser.close();
