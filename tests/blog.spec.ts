import { expect, test } from '@playwright/test';

const title = 'ハーネスエンジニアリングについて思考整理';
const route = '/blog/harness-engineering/';

test('opens the reprinted article through the blog index and renders its content', async ({
  page,
}, testInfo) => {
  await page.goto('/');

  await page.getByRole('link', { name: 'Read Blog', exact: true }).click();
  const post = page.getByRole('link', { name: new RegExp(title) });
  await expect(post).toContainText(title);
  await expect(post).toContainText('AIエージェントを「お願い」ではなく「仕組み」で制御する。');
  await expect(post).toHaveAttribute('href', route);
  await post.click();

  await expect(page).toHaveURL(route);
  await expect(page).toHaveTitle(`${title} | yuno`);
  await expect(page.getByRole('heading', { name: title, level: 1 })).toBeVisible();
  const article = page.getByRole('article');
  await expect(article.locator('blockquote')).toContainText('Zennの再掲載');
  await expect(article.locator('blockquote')).toContainText('初公開：2026年3月22日');
  await expect(article.getByRole('link', { name: 'Zennの元記事' })).toHaveAttribute(
    'href',
    'https://zenn.dev/yuya_0811/articles/d97286991fa8c5',
  );
  await expect(article.locator('table')).toHaveCount(2);
  await expect(article.locator('pre')).toHaveCount(3);
  await expect(article.locator('pre').filter({ hasText: 'PreToolUse' })).toBeVisible();
  await expect(article.locator('pre').filter({ hasText: 'PostToolUse' })).toBeVisible();
  await expect(article.getByRole('heading', { name: 'まとめ', exact: true })).toBeVisible();

  const diagram = article.getByRole('img', { name: /Hooks、Pre-commit、CI\/CD/ });
  await diagram.scrollIntoViewIfNeeded();
  await expect(diagram).toBeVisible();
  await expect(diagram).toHaveJSProperty('naturalWidth', 1400);

  expect(
    await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1),
  ).toBe(false);
  await page.screenshot({ path: testInfo.outputPath('article.png'), fullPage: true });

  await article.getByRole('link', { name: '← Blog に戻る' }).click();
  await expect(page).toHaveURL('/blog/');
  await expect(page.locator('.card')).toHaveCount(3);
  await page.getByRole('link', { name: new RegExp(title) }).click();
  await expect(page).toHaveURL(route);
});

test('includes the reprinted article in RSS and the sitemap', async ({ request }) => {
  const rss = await request.get('/rss.xml');
  expect(rss.status()).toBe(200);
  const feed = await rss.text();
  expect(feed).toContain(title);
  expect(feed).toContain(route);

  const sitemap = await request.get('/sitemap-0.xml');
  expect(sitemap.status()).toBe(200);
  expect(await sitemap.text()).toContain(route);
});

test('opens the Keyball39 setup article from Latest and the blog index', async ({ page }) => {
  const keyballTitle = 'Keyball39のキーマップを画面に表示するチートシートを作りました';
  const keyballRoute = '/blog/keyball39-keymap-cheat-sheet/';
  await page.goto('/');
  const latest = page.getByLabel('Latest').getByRole('link', { name: new RegExp(keyballTitle) });
  await expect(latest.locator('time')).toHaveAttribute('datetime', '2026-10-18T00:00:00.000Z');
  await latest.click();
  await expect(page).toHaveURL(keyballRoute);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(keyballTitle);
  const article = page.getByRole('article');
  for (const heading of [
    'ツール紹介',
    '初期セットアップ',
    '3. ファームウェアの書き込み',
    '4. 接続',
    '使い方',
    '最後に',
  ]) {
    await expect(article.getByRole('heading', { name: heading, exact: true })).toBeVisible();
  }
  await expect(article).toContainText('自動バックアップはキー配置のみ');
  await expect(
    article.locator('pre').filter({ hasText: 'mise run firmware-prepare' }),
  ).toBeVisible();
  await expect(article.locator('pre').filter({ hasText: 'mise run firmware-flash' })).toBeVisible();
  await expect(
    article.getByRole('link', { name: 'y2o-lab/keyball39-keymap-cheat-sheet', exact: true }),
  ).toHaveAttribute('href', 'https://github.com/y2o-lab/keyball39-keymap-cheat-sheet');
  await expect(article.getByRole('img')).toHaveCount(5);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.goto('/blog/');
  await page.getByRole('link', { name: new RegExp(keyballTitle) }).click();
  await expect(page).toHaveURL(keyballRoute);
});

test('includes the Keyball39 article in RSS and the sitemap', async ({ request }) => {
  const route = '/blog/keyball39-keymap-cheat-sheet/';
  expect(await (await request.get('/rss.xml')).text()).toContain(route);
  expect(await (await request.get('/sitemap-0.xml')).text()).toContain(route);
});
