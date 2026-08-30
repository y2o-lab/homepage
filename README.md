# homepage

Astro で作る個人ホームページです。ブログ、作ったもの、勉強メモ、書籍メモを Markdown / MDX で管理できます。

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
- `src/content/notes`: 勉強メモ
- `src/content/books`: 書籍メモ

Frontmatter の型は `src/content.config.ts` で管理しています。

## Tooling

- Package manager: pnpm
- Linter / formatter: Biome
- UI islands: Svelte
- Styling: Tailwind CSS v4 with the official Vite plugin
- Unit tests: Vitest
- E2E tests: Playwright

## Site URL

ローカルでは `http://localhost:4321` を使用します。production では GitHub Actions が `SITE_URL` を渡し、RSS と sitemap の URL を生成します。値は Terraform の production `custom_domain` と一致させてください。Cloudflare Pages / Terraform / GitHub Actions の初回設定は [infra/cloudflare/README.md](infra/cloudflare/README.md) を参照してください。
