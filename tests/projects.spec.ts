import { expect, test } from '@playwright/test';

test('shows Storymesh with source, package and blog links', async ({ page }) => {
  await page.goto('/projects/');
  await expect(page.locator('[data-kind]:visible')).toHaveCount(2);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Projects');
  const shell = await page.evaluate(() => ({
    background: getComputedStyle(document.body).backgroundImage,
    navigation: getComputedStyle(document.querySelector('nav') ?? document.body).fontWeight,
    header: getComputedStyle(document.querySelector('.site-header') ?? document.body).width,
  }));
  await page.goto('/blog/');
  const blogShell = await page.evaluate(() => ({
    background: getComputedStyle(document.body).backgroundImage,
    navigation: getComputedStyle(document.querySelector('nav') ?? document.body).fontWeight,
    header: getComputedStyle(document.querySelector('.site-header') ?? document.body).width,
  }));
  expect(shell).toEqual(blogShell);
  await page.goto('/projects/');
  const cli = page.locator('[data-kind="cli"]');
  await expect(cli.getByRole('heading', { level: 2 })).toHaveText('Storymesh');
  await expect(page.getByRole('heading', { name: 'Homepage', exact: true })).toHaveCount(0);
  await expect(cli.getByRole('link', { name: /^サイト/ })).toHaveCount(0);
  await expect(cli.getByRole('link', { name: /^GitHub/ })).toHaveAttribute(
    'href',
    'https://github.com/y2o-lab/storymesh',
  );
  await expect(cli.getByRole('link', { name: /^npm/ })).toHaveAttribute(
    'href',
    'https://www.npmjs.com/package/storymesh',
  );
  await expect(page.locator('main img, .tile-visual, .timer-window')).toHaveCount(0);
  await page.getByRole('button', { name: 'CLI' }).click();
  await expect(page.locator('[data-kind]:visible')).toHaveCount(1);
  await expect(cli).toBeVisible();
  await expect(page.getByRole('button', { name: 'CLI' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: 'Libraries' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Web', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'All' }).click();
  await expect(page.locator('[data-kind]:visible')).toHaveCount(2);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(page.locator('h2 a')).toHaveCount(0);
  await cli.getByRole('link', { name: 'Storymesh のブログを読む' }).click();
  await expect(page).toHaveURL(/\/blog\/storymesh\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Storymesh');
});

test('shows the Keyball39 macOS app and filters desktop projects', async ({ page }) => {
  await page.goto('/');
  const latest = page.getByLabel('Latest').getByRole('link', {
    name: /Keyball39 Keymap Cheat Sheet/,
  });
  await expect(latest).toHaveAttribute('href', '/projects/');
  await latest.click();
  await expect(page).toHaveURL('/projects/');
  const desktop = page.locator('[data-kind="desktop"]');
  await expect(desktop.getByRole('heading', { level: 2 })).toHaveText(
    'Keyball39 Keymap Cheat Sheet',
  );
  await expect(desktop).toContainText('デスクトップアプリ');
  await expect(desktop).toContainText('macOSメニューバーアプリ');
  await expect(desktop.getByRole('link', { name: /^GitHub/ })).toHaveAttribute(
    'href',
    'https://github.com/y2o-lab/keyball39-keymap-cheat-sheet',
  );
  await expect(desktop.getByRole('link')).toHaveCount(1);
  await page.getByRole('button', { name: 'Desktop', exact: true }).click();
  await expect(page.locator('[data-kind]:visible')).toHaveCount(1);
  await expect(desktop).toBeVisible();
  await expect(page.getByRole('button', { name: 'Desktop', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.getByRole('button', { name: 'CLI', exact: true }).click();
  await expect(desktop).toBeHidden();
  await page.getByRole('button', { name: 'All', exact: true }).click();
  await expect(page.locator('[data-kind]:visible')).toHaveCount(2);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('removes the preview and standalone project pages from routing and the sitemap', async ({
  request,
}) => {
  for (const route of [
    '/projects/preview/',
    '/projects/homepage/',
    '/projects/preview/astro-cli/',
  ]) {
    expect((await request.get(route)).status(), route).toBe(404);
  }
  const sitemap = await (await request.get('/sitemap-0.xml')).text();
  expect(sitemap).not.toContain('/projects/preview/');
  expect(sitemap).not.toContain('/projects/homepage/');
  expect(sitemap).toContain('/projects/');
});
