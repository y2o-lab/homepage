import { expect, test } from '@playwright/test';

test('shows text-first projects with independent site, GitHub and npm links', async ({ page }) => {
  await page.goto('/projects/preview/');
  await expect(page.locator('[data-kind]:visible')).toHaveCount(3);
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
  await page.goto('/projects/preview/');
  const web = page.locator('[data-kind="web"]');
  const cli = page.locator('[data-kind="cli"]');
  const library = page.locator('[data-kind="library"]');
  await expect(web.getByRole('link', { name: /^サイト/ })).toHaveAttribute('href', /^https?:\/\//);
  await expect(web.getByRole('link', { name: /^GitHub/ })).toHaveAttribute(
    'href',
    'https://github.com/y2o-lab/homepage',
  );
  await expect(web.getByRole('link', { name: /^npm/ })).toHaveCount(0);
  await expect(cli.getByRole('link', { name: /^サイト/ })).toHaveCount(0);
  await expect(cli.getByRole('link', { name: /^GitHub/ })).toHaveAttribute(
    'href',
    'https://github.com/y2o-lab/storymesh',
  );
  await expect(cli.getByRole('link', { name: /^npm/ })).toHaveAttribute(
    'href',
    'https://www.npmjs.com/package/storymesh',
  );
  await expect(library.getByRole('link', { name: /^npm/ })).toHaveAttribute(
    'href',
    'https://www.npmjs.com/package/clsx',
  );
  await expect(page.locator('main img, .tile-visual, .timer-window')).toHaveCount(0);
  await page.getByRole('button', { name: 'CLI' }).click();
  await expect(page.locator('[data-kind]:visible')).toHaveCount(1);
  await expect(cli).toBeVisible();
  await expect(page.getByRole('button', { name: 'CLI' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Libraries' }).click();
  await expect(library).toBeVisible();
  await expect(page.locator('[data-kind]:visible')).toHaveCount(1);
  await page.getByRole('button', { name: 'Web', exact: false }).click();
  await expect(web).toBeVisible();
  await page.getByRole('button', { name: 'All' }).click();
  await expect(page.locator('[data-kind]:visible')).toHaveCount(3);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(web.locator('.project-detail-link')).toHaveCount(0);
  await expect(library.locator('.project-detail-link')).toHaveCount(0);
  await expect(page.locator('h2 a')).toHaveCount(0);
  await cli.getByRole('link', { name: 'Storymesh のブログを読む' }).click();
  await expect(page).toHaveURL(/\/blog\/storymesh\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Storymesh');
});
