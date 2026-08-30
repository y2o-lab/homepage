import { expect, test } from '@playwright/test';

test('renders the latest photo prominently and opens the gallery lightbox', async ({ page }) => {
  await page.goto('/photos/');

  await expect(page.getByRole('heading', { name: '写真' })).toBeVisible();
  await expect(page.locator('[data-photo-gallery]')).toBeVisible();
  await expect(page.locator('.photo-card')).toHaveCount(9);
  await expect(page.locator('.photo-card--latest')).toHaveCount(1);

  const links = page.locator('[data-photo-lightbox-link]');
  await expect(links).toHaveCount(9);
  await expect(links.first()).toHaveAttribute('href', '/photos/market-lane.jpg');

  await links.first().click();

  const lightbox = page.locator('.pswp.pswp--open');
  await expect(lightbox).toBeVisible();
  await expect(lightbox.getByRole('button', { name: 'Close' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(lightbox).toBeHidden();
});
