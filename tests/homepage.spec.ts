import { expect, test } from '@playwright/test';

const themedRoutes = [
  '/',
  '/blog/',
  '/blog/harness-engineering/',
  '/blog/storymesh/',
  '/blog/keyball39-keymap-cheat-sheet/',
  '/projects/',
  '/books/',
  '/books/sample-book/',
  '/photos/',
] as const;

test('renders the desk board homepage navigation and key panels', async ({ page }, testInfo) => {
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
  const techStack = page.getByRole('region', { name: 'Tech Stack', exact: true });
  await expect(techStack).toBeVisible();
  for (const [group, items] of [
    ['Frontend', ['TypeScript', 'Next.js', 'React', 'Svelte', 'Astro']],
    ['Backend', ['C#', '.NET', 'Python', 'FastAPI']],
    ['AI & Workflow', ['Codex', 'Claude Code', 'Harness Engineering', 'GitHub Copilot']],
    ['Cloud', ['AWS']],
  ] as const) {
    await expect(
      techStack.getByRole('region', { name: group, exact: true }).getByRole('listitem'),
    ).toHaveText([...items]);
  }
  await expect(techStack).not.toContainText('Available');
  await expect(page.getByRole('link', { name: 'View Projects' })).toHaveCount(2);
  await expect(page.locator('a[href^="/notes/"]')).toHaveCount(0);
  await expect(page.locator('.project-card')).toHaveCount(4);
  await expect(page.locator('.project-card h3')).toHaveText([
    'Blog',
    'Projects',
    'Reading',
    'Photography',
  ]);
  for (const [name, count, latestDate] of [
    ['Blog', '3件', '2026年10月18日'],
    ['Projects', '2件', '2026年10月18日'],
    ['Reading', '4件', '2026年6月30日'],
    ['Photography', '9件', '2026年6月2日'],
  ]) {
    const card = page.locator('.project-card').filter({
      has: page.getByRole('heading', { name, exact: true }),
    });
    await expect(card.locator('.project-meta span')).toHaveText([count, `最新 ${latestDate}`]);
  }
  await expect(page.getByRole('heading', { name: 'Latest' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Explore' })).toBeVisible();
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
  await page.evaluate(async () => {
    await Promise.all(document.getAnimations().map((animation) => animation.finished));
  });
  await page.screenshot({ path: testInfo.outputPath('homepage.png'), fullPage: true });
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
  await expect(page.getByRole('heading', { name: 'Latest' })).toBeInViewport();
  await expect(page.getByRole('heading', { name: 'Explore' })).toBeInViewport();
});

test('shows the recent project and both tools in the Projects catalog', async ({ page }) => {
  await page.goto('/');
  const latest = page.getByLabel('Latest');
  const projectsCard = page.locator('.project-card').filter({
    has: page.getByRole('heading', { name: 'Projects', exact: true }),
  });
  await expect(projectsCard).toContainText('2件');

  for (const title of ['Keyball39 Keymap Cheat Sheet']) {
    const update = latest.getByRole('link').filter({
      has: page.locator('strong', { hasText: new RegExp(`^${title}$`) }),
    });
    await expect(update).toBeVisible();
    await expect(update).toContainText('Projects');
    await expect(update).toHaveAttribute('href', '/projects/');
  }

  await projectsCard.click();
  await expect(page).toHaveURL('/projects/');
  await expect(page.getByRole('heading', { level: 2 })).toHaveText([
    'Keyball39 Keymap Cheat Sheet',
    'Storymesh',
  ]);
});

test('opens the Storymesh post from recent updates and the blog index', async ({ page }) => {
  const title = 'Storymesh — StorybookのStory不足を検知するOSSを作りました';
  await page.goto('/');

  const latestPost = page.getByLabel('Latest').getByRole('link', { name: new RegExp(title) });
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
  await expect(page.getByRole('heading', { name: 'Explore' })).toBeVisible();
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
