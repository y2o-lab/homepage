---
name: homepage-content-sync
description: Synchronize the homepage when adding, publishing, revising, or removing blog posts, projects, book notes, or photos in this repository. Always check and update Latest, section counts, dates, links, and affected tests as part of content work.
---

# Homepage Content Sync

コンテンツを追加・公開・更新・削除する際は、必ずホームへの反映まで同じ作業で完了する。記事や一覧ページだけで作業を終えない。

## 反映の手順

1. `src/pages/index.astro`、`src/lib/content.ts`、`src/site.config.ts` と変更対象のコレクション・一覧ページを読む。対象は Blog、Projects、Reading、Photography。公開中のセクションは `navigationSections` を正とする。
2. ホームの「Latest」、各セクションカードの件数・最新日付・導線を確認し、追加内容に合わせて必要なソース修正を行う。データから自動反映される場合も、生成された表示を必ず確認する。反映済みなら不要なハードコードや形式だけの変更は加えない。
3. 最新欄の表示上限と日付順を確認する。現在は各セクションの上位2件を集め、公開日の降順で全体の上位3件を表示する。同日の追加や複数件の追加でも期待する項目が表示されるか確認し、必要な調整を行う。古い記事が枠外になるのは通常の動作であり、残すために日付を変更しない。
4. `draft: true` はホームの最新欄・件数にも含めない。`pubDate` は実際の掲載日を使い、ホームに載せるために既存項目の日付を変更しない。写真の撮影日 `takenDate` と掲載日 `pubDate` を混同しない。現在のホームは `pubDate`、写真一覧は `takenDate` で並ぶ。
5. 各リンクの到達先を確認する。現在、ブログ・読書メモは詳細ページ、Projects・Photographyは一覧ページへ移動する。削除済みのプロジェクト詳細ルートなどへリンクしない。新しい分類を追加する場合はスキーマ・表示名・一覧の絞り込みも更新する。

## 検証と完了条件

- `tests/homepage.spec.ts` と対象セクションのE2Eテストを確認し、最新項目・件数・リンク先の期待値を更新する。最新欄から外れた古い記事のテストは、一覧経由で引き続き到達できることを検証する。
- 追加項目が最新欄の対象になる場合、その表示とリンク先を検証する。複数の制作物を追加した場合は、それぞれの表示を確認する。PC・モバイルで説明や長いタイトルがはみ出さないことも確認する。
- `pnpm build` と `pnpm test:e2e` を実行する。ホームのロジックやソースを変更した場合は `pnpm check:code`、ヘルパーを変更した場合は `pnpm test` も実行する。
- ホームのスクリーンショットを撮影し、登場アニメーションが完了してから最新欄・件数・レイアウトを目視確認する。最終報告ではホームにどう反映されたかと検証結果を伝える。

コンテンツの執筆には [homepage-content-author](../homepage-content-author/SKILL.md)、ルート・表示処理の変更には [astro-homepage-maintainer](../astro-homepage-maintainer/SKILL.md) を併用する。
