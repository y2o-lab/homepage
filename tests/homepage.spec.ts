import { expect, test } from '@playwright/test';

const themedRoutes = [
  '/',
  '/blog/',
  '/blog/harness-engineering/',
  '/blog/storymesh/',
  '/projects/',
  '/books/',
  '/books/sample-book/',
  '/photos/',
] as const;

test('renders the desk board homepage navigation and key panels', async ({ page }) => {
  await page.goto('/');

  const navigation = page.getByRole('navigation', { name: 'Primary navigation' });

  await expect(page).toHaveTitle('yuno');
  await expect(page.getByRole('link', { name: 'yuno のトップへ' })).toHaveText('yuno');
  await expect(page.getByRole('contentinfo')).toContainText('yuno');
  await expect(page.getByRole('img', { name: 'yuno のプロフィールアイコン' })).toBeVisible();
  await expect(navigation.getByRole('link')).toHaveCount(4);
  for (const [name, href] of [
    ['Blog', '/blog/'],
    ['Projects', '/projects/'],
    ['Reading', '/books/'],
    ['Photography', '/photos/'],
  ]) {
    const link = navigation.getByRole('link', { name, exact: true });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', href);
  }
  await expect(navigation.locator('a[href="/notes/"]')).toHaveCount(0);
  await expect(page.getByLabel('プロフィール概要')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Build notes for the web.' })).toBeVisible();
  await expect(page.getByLabel('現在の活動')).toBeVisible();
  await expect(page.getByRole('link', { name: 'View Projects' })).toHaveCount(2);
  await expect(page.locator('a[href^="/notes/"]')).toHaveCount(0);
  await expect(page.locator('.project-card')).toHaveCount(4);
  await expect(page.locator('.project-card h3')).toHaveText([
    'Blog',
    'Projects',
    'Reading',
    'Photography',
  ]);
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

test('opens the Storymesh post from recent updates and the blog index', async ({ page }) => {
  const title = 'Storymesh — StorybookのStory不足を検知するOSSを作りました';
  await page.goto('/');

  const latestPost = page.getByLabel('最近の更新').getByRole('link').first();
  await expect(latestPost).toContainText(title);
  await expect(latestPost.locator('time')).toHaveAttribute('datetime', '2026-10-18T00:00:00.000Z');
  await latestPost.click();

  await expect(page).toHaveURL(/\/blog\/storymesh\/$/);
  await expect(page.getByRole('heading', { level: 1, name: title })).toBeVisible();
  await expect(
    page.getByRole('heading', { name: '6. 既存のStoryからymlを作成する' }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'https://github.com/y2o-lab/storymesh', exact: true }),
  ).toHaveAttribute('href', 'https://github.com/y2o-lab/storymesh');
  await expect(
    page.getByRole('link', { name: 'https://www.npmjs.com/package/storymesh', exact: true }),
  ).toHaveAttribute('href', 'https://www.npmjs.com/package/storymesh');
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1),
  ).toBe(false);

  await page.goto('/blog/');
  await page.getByRole('link', { name: title }).click();
  await expect(page).toHaveURL(/\/blog\/storymesh\/$/);
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
  await expect(page.getByRole('link', { name: '← Reading に戻る' })).toBeVisible();
});

test('opens each portfolio section with a matching heading and title', async ({ page }) => {
  await page.goto('/');

  for (const [name, href] of [
    ['Blog', '/blog/'],
    ['Projects', '/projects/'],
    ['Reading', '/books/'],
    ['Photography', '/photos/'],
  ]) {
    await page.getByRole('navigation').getByRole('link', { name, exact: true }).click();
    await expect(page).toHaveURL(href);
    await expect(page).toHaveTitle(`${name} | yuno`);
    await expect(page.getByRole('heading', { name, exact: true, level: 1 })).toBeVisible();
  }

  await page.goto('/');
  for (const href of await page
    .locator('.latest-list a, .project-card')
    .evaluateAll((links) => links.map((link) => link.getAttribute('href')))) {
    if (!href) throw new Error('homepage link has no destination');
    const response = await page.goto(href);
    expect(response?.status(), href).toBe(200);
  }
});

test('returns 404 for removed study note routes', async ({ request }) => {
  for (const route of ['/notes/', '/notes/astro-content-collections/']) {
    const response = await request.get(route);
    expect(response.status(), route).toBe(404);
  }
  const sitemap = await request.get('/sitemap-0.xml');
  expect(sitemap.status()).toBe(200);
  expect(await sitemap.text()).not.toContain('/notes/');
});
