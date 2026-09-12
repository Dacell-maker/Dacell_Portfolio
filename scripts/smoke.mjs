import { chromium } from 'playwright-core';
import fs from 'node:fs';

const BASE = process.env.BASE ?? 'http://localhost:5173';
const OUT = 'screenshots';
fs.mkdirSync(OUT, { recursive: true });

const errors = [];

const browser = await chromium.launch({
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--force-color-profile=srgb'],
});

async function newPage(width, height, mobile = false) {
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 2,
    isMobile: mobile,
    hasTouch: mobile,
  });
  const page = await context.newPage();
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`[console ${width}px] ${msg.text()}`);
  });
  page.on('pageerror', (err) => errors.push(`[pageerror ${width}px] ${err.message}`));
  return { context, page };
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/* ---------------------------------------------------------- desktop home */
{
  const { page, context } = await newPage(1440, 900);
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForSelector('.preloader', { state: 'detached', timeout: 15000 });
  await wait(2600); // hero entrance
  await page.screenshot({ path: `${OUT}/01-hero.png` });

  const title = await page.textContent('.hero__title');
  console.log('hero title:', JSON.stringify(title?.replace(/\s+/g, ' ').trim()));
  console.log('project cards:', await page.locator('.project-card').count());
  console.log('placeholders:', await page.locator('.placeholder').count());

  // scroll through the page, capturing each section
  const shots = [
    ['about', '02-about.png'],
    ['projects', '03-projects.png'],
    ['skills', '04-skills.png'],
    ['experience', '05-experience.png'],
    ['contact', '06-contact.png'],
  ];
  for (const [id, file] of shots) {
    await page.evaluate((sectionId) => {
      const el = document.getElementById(sectionId);
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 40, behavior: 'auto' });
    }, id);
    await wait(1500);
    await page.screenshot({ path: `${OUT}/${file}` });
  }

  // hover a project card to check the interaction layer
  await page.evaluate(() => {
    const el = document.getElementById('projects');
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 40, behavior: 'auto' });
  });
  await wait(900);
  const card = page.locator('.project-card').first();
  await card.hover();
  await wait(700);
  await page.screenshot({ path: `${OUT}/07-card-hover.png` });

  // filter interaction
  await page.locator('.filters__btn', { hasText: 'Web App' }).click();
  await wait(900);
  await page.screenshot({ path: `${OUT}/08-filtered.png` });
  console.log('cards after filter:', await page.locator('.project-card').count());

  await context.close();
}

/* ------------------------------------------------------------- admin flow */
{
  const { page, context } = await newPage(1440, 900);
  await page.goto(`${BASE}/admin`, { waitUntil: 'networkidle' });
  await wait(1200);
  console.log('admin redirected to:', page.url());
  await page.screenshot({ path: `${OUT}/09-admin-login.png` });

  // sign in with the dev credentials created through the API test
  await page.fill('#email', 'davidsegun044@gmail.com');
  await page.fill('#password', 'testpass123');
  await page.screenshot({ path: `${OUT}/10-admin-login-filled.png` });
  await page.click('button[type="submit"]');
  await wait(2200);
  console.log('after login url:', page.url());
  await page.screenshot({ path: `${OUT}/11-admin-overview.png` });

  await page.click('a[href="/admin/projects"]');
  await wait(1600);
  await page.screenshot({ path: `${OUT}/12-admin-projects.png` });
  console.log('admin table rows:', await page.locator('.table tbody tr').count());

  await page.click('button:has-text("Add project")');
  await wait(1200);
  await page.screenshot({ path: `${OUT}/13-admin-form.png` });

  await page.fill('#f-name', 'Test Studio Site');
  await page.fill('#f-short', 'A test project created through the admin UI.');
  await page.fill('#f-tech', 'React, TypeScript, Motion');
  await page.fill('#f-live', 'https://example.com');
  await wait(400);
  await page.screenshot({ path: `${OUT}/14-admin-form-filled.png` });
  await page.click('.drawer__foot button.btn--primary');
  await wait(1800);
  await page.screenshot({ path: `${OUT}/15-admin-after-create.png` });
  console.log('rows after create:', await page.locator('.table tbody tr').count());

  // delete it again through the confirm modal
  const row = page.locator('.table tbody tr', { hasText: 'Test Studio Site' });
  await row.locator('.icon-btn--danger').click();
  await wait(900);
  await page.screenshot({ path: `${OUT}/16-admin-confirm.png` });
  await page.click('.modal__panel button.btn--danger');
  await wait(1400);
  console.log('rows after delete:', await page.locator('.table tbody tr').count());

  await page.click('a[href="/admin/settings"]');
  await wait(1200);
  await page.screenshot({ path: `${OUT}/17-admin-settings.png` });

  await context.close();
}

/* ----------------------------------------------------------------- mobile */
{
  const { page, context } = await newPage(390, 844, true);
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForSelector('.preloader', { state: 'detached', timeout: 15000 });
  await wait(2200);
  await page.screenshot({ path: `${OUT}/18-mobile-hero.png` });

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  console.log('mobile horizontal overflow (px):', overflow);

  await page.click('.nav__burger');
  await wait(900);
  await page.screenshot({ path: `${OUT}/19-mobile-menu.png` });
  await page.click('.nav__burger');
  await wait(700);

  await page.evaluate(() => {
    const el = document.getElementById('projects');
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 30, behavior: 'auto' });
  });
  await wait(1400);
  await page.screenshot({ path: `${OUT}/20-mobile-projects.png`, fullPage: false });

  await page.evaluate(() => {
    const el = document.getElementById('contact');
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 30, behavior: 'auto' });
  });
  await wait(1400);
  await page.screenshot({ path: `${OUT}/21-mobile-contact.png` });
  await context.close();
}

/* ----------------------------------------------------------------- tablet */
{
  const { page, context } = await newPage(900, 1100);
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForSelector('.preloader', { state: 'detached', timeout: 15000 });
  await wait(2200);
  await page.evaluate(() => {
    const el = document.getElementById('projects');
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 40, behavior: 'auto' });
  });
  await wait(1400);
  await page.screenshot({ path: `${OUT}/22-tablet-projects.png` });
  await context.close();
}

await browser.close();

console.log('\n--- console/page errors ---');
if (errors.length === 0) console.log('none');
else console.log(errors.slice(0, 25).join('\n'));
