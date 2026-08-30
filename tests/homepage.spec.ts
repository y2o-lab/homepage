import { expect, test } from '@playwright/test';

const themedRoutes = [
  '/',
  '/blog/',
  '/blog/hello/',
  '/blog/markdown-rendering-sample/',
  '/projects/',
  '/projects/homepage/',
  '/notes/',
  '/notes/astro-content-collections/',
  '/books/',
  '/books/sample-book/',
  '/photos/',
] as const;

test('renders the desk board homepage navigation and key panels', async ({ page }) => {
  await page.goto('/');

  const navigation = page.getByRole('navigation', { name: 'Primary navigation' });

  await expect(page).toHaveTitle(/inoue\./);
  await expect(navigation.getByRole('link', { name: 'ブログ' })).toBeVisible();
  await expect(navigation.getByRole('link', { name: '作ったもの' })).toBeVisible();
  await expect(navigation.getByRole('link', { name: '勉強メモ' })).toBeVisible();
  await expect(navigation.getByRole('link', { name: '書籍メモ' })).toBeVisible();
  await expect(navigation.getByRole('link', { name: '写真' })).toBeVisible();
  await expect(page.getByLabel('プロフィール概要')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Build notes for the web.' })).toBeVisible();
  await expect(page.getByLabel('現在の活動')).toBeVisible();
  await expect(page.getByRole('link', { name: 'View Works' })).toBeVisible();
  await expect(page.getByRole('link', { name: '作ったものを見る' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '最近の更新' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '見るもの' })).toBeVisible();
  await expect(page.getByTestId('home-dashboard')).toBeVisible();

  const entranceMotion = await page.evaluate(() => {
    const header = document.querySelector('.site-header');
    const sidebar = document.querySelector('.home-entrance .sidebar');
    const card = document.querySelector('.home-entrance .project-card');

    return {
      header: header ? getComputedStyle(header).animationName : null,
      sidebar: sidebar ? getComputedStyle(sidebar).animationName : null,
      card: card ? getComputedStyle(card).animationName : null,
    };
  });

  expect(entranceMotion).toEqual({
    header: 'desk-drop',
    sidebar: 'desk-slide',
    card: 'card-place',
  });
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

test('applies the homepage theme shell across public pages', async ({ page }) => {
  for (const route of themedRoutes) {
    await page.goto(route);

    const theme = await page.evaluate(() => {
      const root = getComputedStyle(document.documentElement);
      const body = getComputedStyle(document.body);
      const main = getComputedStyle(document.querySelector('main') ?? document.body);
      const brand = document.querySelector('.brand');
      const brandMark = brand ? getComputedStyle(brand, '::before') : null;

      return {
        bg: root.getPropertyValue('--bg').trim(),
        text: root.getPropertyValue('--text').trim(),
        bodyColor: body.color,
        bodyBackground: body.backgroundImage,
        brandMarkWidth: brandMark?.width,
        mainWidth: Number.parseFloat(main.width),
        hasHorizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
      };
    });

    expect(theme.bg, route).toBe('#f5dfb1');
    expect(theme.text, route).toBe('#2e261d');
    expect(theme.bodyColor, route).toBe('rgb(46, 38, 29)');
    expect(theme.bodyBackground, route).toContain('linear-gradient');
    expect(theme.brandMarkWidth, route).toBe('38px');
    expect(theme.mainWidth, route).toBeLessThanOrEqual(1180);
    expect(theme.hasHorizontalOverflow, route).toBe(false);
  }
});

test('renders rich markdown content and mermaid diagrams', async ({ page }) => {
  await page.goto('/blog/markdown-rendering-sample/');

  await expect(page.getByRole('heading', { name: 'Markdown 表示サンプル' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Mermaid 図' })).toBeVisible();
  await expect(page.getByText('src/styles/global.css')).toBeVisible();
  await expect(page.locator('.mermaid-diagram[data-mermaid-rendered="build"] svg')).toBeVisible();

  const articleMetrics = await page.evaluate(() => {
    const article = document.querySelector('.content-article');
    const diagram = document.querySelector('.mermaid-diagram');
    const mermaidSource = document.querySelector('pre[data-language="mermaid"]');

    return {
      articleWidth: article ? Number.parseFloat(getComputedStyle(article).width) : 0,
      diagramOverflow: diagram ? diagram.scrollWidth >= diagram.clientWidth : false,
      hasHorizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
      hasClientMermaidSource: Boolean(mermaidSource),
    };
  });

  expect(articleMetrics.articleWidth).toBeGreaterThan(0);
  expect(articleMetrics.articleWidth).toBeLessThanOrEqual(760);
  expect(articleMetrics.diagramOverflow).toBe(true);
  expect(articleMetrics.hasHorizontalOverflow).toBe(false);
  expect(articleMetrics.hasClientMermaidSource).toBe(false);
});

test('shows reading notes as a shelf of book covers and opens a note', async ({ page }) => {
  await page.goto('/books/');

  const shelf = page.getByTestId('bookshelf');
  await expect(shelf).toBeVisible();
  await expect(shelf.getByRole('listitem')).toHaveCount(4);
  const shelfColumns = await shelf
    .locator('.bookshelf__grid')
    .evaluate(
      (element) => getComputedStyle(element).gridTemplateColumns.trim().split(/\s+/).length,
    );
  const viewportWidth = page.viewportSize()?.width ?? 0;
  expect(shelfColumns).toBe(viewportWidth <= 720 ? 2 : 4);
  await expect(
    shelf.getByRole('img', { name: 'テラコッタ色の表紙のハードカバー本' }),
  ).toBeVisible();
  await shelf.getByRole('link', { name: 'サンプル書籍 のメモを読む' }).click();

  await expect(page).toHaveURL(/\/books\/sample-book\/$/);
  await expect(page.getByRole('heading', { name: '読書メモのサンプル' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'この本から持ち帰ったこと' })).toBeVisible();
  await expect(page.getByRole('link', { name: '← 本棚に戻る' })).toBeVisible();
});
