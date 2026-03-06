/**
 * E2E tests: Lighthouse audits with minimum score 90 for all categories.
 * SOC2-aligned: ensures performance, accessibility, best-practices, and SEO meet bar.
 * Run: npm run test:e2e (app must be running or webServer will start it)
 */
const { test, expect } = require('@playwright/test');
const { chromium } = require('playwright');
const { playAudit } = require('playwright-lighthouse');
const getPort = require('get-port');

const LIGHTHOUSE_THRESHOLD = 90;

test.describe('Lighthouse audits', () => {
  test('homepage scores >= 90 for performance, accessibility, best-practices, seo', async ({ page: _pwPage, baseURL }) => {
    const port = await getPort();
    const browser = await chromium.launch({
      args: [`--remote-debugging-port=${port}`],
    });
    try {
      const page = await browser.newPage();
      const url = baseURL || 'http://localhost:3000';
      await page.goto(url, { waitUntil: 'networkidle' });

      await playAudit({
        page,
        port,
        thresholds: {
          performance: LIGHTHOUSE_THRESHOLD,
          accessibility: LIGHTHOUSE_THRESHOLD,
          'best-practices': LIGHTHOUSE_THRESHOLD,
          seo: LIGHTHOUSE_THRESHOLD,
        },
      });
    } finally {
      await browser.close();
    }
  });
});

test.describe('Smoke / SOC2-relevant', () => {
  test('store view loads and has main content', async ({ page, baseURL }) => {
    await page.goto(baseURL || '/');
    await expect(page.locator('main.page-content')).toBeVisible();
  });

  test('security headers are present', async ({ request, baseURL }) => {
    const res = await request.get(baseURL || 'http://localhost:3000');
    expect(res.status()).toBe(200);
    const headers = res.headers();
    expect(headers['x-frame-options']?.toLowerCase()).toBe('deny');
    expect(headers['x-content-type-options']?.toLowerCase()).toBe('nosniff');
  });
});
