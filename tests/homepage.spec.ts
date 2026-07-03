import { expect, test } from '@playwright/test';

test('renders the desk board homepage navigation and key panels', async ({ page }) => {
  await page.goto('/');

  const navigation = page.getByRole('navigation', { name: 'Primary navigation' });

  await expect(page).toHaveTitle(/inoue\./);
  await expect(navigation.getByRole('link', { name: 'ブログ' })).toBeVisible();
  await expect(navigation.getByRole('link', { name: '作ったもの' })).toBeVisible();
  await expect(navigation.getByRole('link', { name: '勉強メモ' })).toBeVisible();
  await expect(navigation.getByRole('link', { name: '書籍メモ' })).toBeVisible();
  await expect(navigation.getByRole('link', { name: '写真UI案' })).toBeVisible();
  await expect(page.getByLabel('プロフィール概要')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Build notes for the web.' })).toBeVisible();
  await expect(page.getByLabel('現在の活動')).toBeVisible();
  await expect(page.getByRole('link', { name: 'View Works' })).toBeVisible();
  await expect(page.getByRole('link', { name: '作ったものを見る' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '最近の更新' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '見るもの' })).toBeVisible();
  await expect(page.getByTestId('home-dashboard')).toBeVisible();
});

test('keeps desk board readable without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('/');

  const dashboard = page.getByTestId('home-dashboard');
  const box = await dashboard.boundingBox();
  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1,
  );
  const viewportHeight = page.viewportSize()?.height;

  if (!box) {
    throw new Error('home dashboard was not rendered');
  }

  expect(viewportHeight).toBeDefined();
  expect(box.y).toBeLessThan(viewportHeight ?? 0);
  expect(hasHorizontalOverflow).toBe(false);
  await expect(page.getByRole('heading', { name: '最近の更新' })).toBeInViewport();
  await expect(page.getByRole('heading', { name: '見るもの' })).toBeInViewport();
});

test('keeps primary layout readable on mobile', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('banner')).toBeVisible();
  await expect(page.getByRole('main')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Build notes for the web.' })).toBeInViewport();
  await expect(page.getByRole('heading', { name: '見るもの' })).toBeVisible();
});
