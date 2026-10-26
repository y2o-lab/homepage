# homepage

Astro で作る個人ホームページです。ブログ、制作物、読書の記録、写真を Markdown / MDX で管理できます。

## Commands

```sh
pnpm install
pnpm dev
pnpm lint
pnpm format
pnpm check
pnpm test
pnpm test:e2e
pnpm build
pnpm preview
```

Terraform は [mise](https://mise.jdx.dev/) で管理しています。

```sh
mise install
mise exec terraform -- terraform fmt -check -recursive infra
```

## Content

- `src/content/blog`: ブログ
- `src/content/projects`: 作ったもの
- `src/content/books`: 書籍メモ

Frontmatter の型は `src/content.config.ts` で管理しています。

## Tooling

- Package manager: pnpm
- Linter / formatter: Biome
- UI islands: Svelte
- Styling: Tailwind CSS v4 with the official Vite plugin
- Unit tests: Vitest
- E2E tests: Playwright

## Automated review and security

[upto PR #93](https://github.com/y2o-lab/upto/pull/93) を参考に、以下を設定しています。

- CodeRabbit: `.coderabbit.yaml` で日本語の簡潔なレビューとBiomeを有効にし、Astro、コンテンツ、CI、Terraformの変更を確認します。デフォルトブランチと `release`、`release-infra` 向けのPRが対象で、ドラフトと生成物は除外します。
- CodeQL: `.github/workflows/codeql.yml` でJavaScript/TypeScript、GitHub Actions、Python製Codexフックを `security-extended` で解析します。`main`、`release`、`release-infra` 向けのPR・push・merge queue、週次（水曜12:23 JST）・手動実行に対応します。週次実行はデフォルトブランチが対象です。依存インストール、ビルド、本番Secretsは使いません。

GitHub側でCodeRabbit Appのリポジトリアクセスを許可してください。CodeQLはCode scanningのAdvanced setupを使います。Default setupが有効な場合は無効化してから、このワークフローを使ってください。非公開リポジトリではGitHub Code Securityの利用権限も必要です。

CodeQLの解析対象は対応するJS/TS・PythonファイルとActionsワークフローです。`.astro`、`.svelte`、MDX、Terraformの直接解析は対象外のため、既存の型チェック・テストとCodeRabbitで補います。merge queueでは解析のみ行い、結果のアップロードはPR・pushなどで行います。

## Site URL

ローカルでは `http://localhost:4321` を使用します。production では GitHub Actions が `SITE_URL` を渡し、RSS と sitemap の URL を生成します。値は Terraform の production `custom_domain` と一致させてください。Cloudflare Pages / Terraform / GitHub Actions の初回設定は [infra/cloudflare/README.md](infra/cloudflare/README.md) を参照してください。
