# Storymesh記事の画面エビデンス

本番ビルドを `pnpm preview --host 127.0.0.1 --port 4322` で表示し、PlaywrightのChromiumで撮影しました。
ホームはページ全体、記事は冒頭のビューポートを記録しています。フォントの読み込みと登場アニメーションの完了後に撮影しています。

| 画面 | PC（1440 × 1000） | モバイル（393 × 727、Pixel 5設定） |
| --- | --- | --- |
| ホーム | [画像](./home-desktop.png) | [画像](./home-mobile.png) |
| 記事冒頭 | [画像](./article-desktop.png) | [画像](./article-mobile.png) |

- ホームの「最近の更新」の先頭にStorymesh記事を表示。
- ブログ件数は2件、最新日は2026年10月18日。ハーネスエンジニアリング記事とStorymesh記事を含みます。
- 記事URL: `/blog/storymesh/`
- `pnpm check:code` 成功。
- `pnpm test:e2e` 成功（本番ビルドを含む、PC・モバイル計22件）。
