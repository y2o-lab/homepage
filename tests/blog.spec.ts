import { expect, test } from '@playwright/test';

const title = 'ハーネスエンジニアリングについて思考整理';
const route = '/blog/harness-engineering/';

test('opens the reprinted article from the homepage and renders its content', async ({
  page,
}, testInfo) => {
  await page.goto('/');

  const latest = page.getByLabel('最近の更新').getByRole('link').first();
  await expect(latest).toContainText(title);
  await expect(latest).toContainText('AIエージェントを「お願い」ではなく「仕組み」で制御する。');
  await expect(latest).toHaveAttribute('href', route);
  await latest.click();

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
  await expect(page.locator('.card')).toHaveCount(1);
  await expect(page.locator('.card').first()).toContainText(title);
  await page.locator('.card').first().click();
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
