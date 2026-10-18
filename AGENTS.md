# AGENTS.md

## Project Profile

- This is a personal homepage built with Astro 7, Svelte 5 islands, Tailwind CSS v4, and typed Markdown / MDX content collections.
- Use `pnpm` for every package and script command. Do not introduce npm, yarn, bun, or a second lockfile.
- Keep user-facing copy suitable for Japanese readers unless the edited page already uses another language.
- Treat generated directories as disposable output: `dist/`, `.astro/`, `playwright-report/`, `test-results/`, and `node_modules/` are not source.

## Workflows

- Install dependencies with `pnpm install`.
- Start local development with `pnpm dev`.
- Run static and type checks with `pnpm check`.
- Run formatter and linter checks with `pnpm check:code`.
- Run unit tests with `pnpm test`.
- Run production build with `pnpm build`.
- Run E2E tests with `pnpm test:e2e` when navigation, layout, routing, or rendered pages change.
- Run Codex harness verification with `pnpm verify:codex` after changing `AGENTS.md`, `.codex/**`, or `.agents/**`.

## Coding Rules

- Prefer existing Astro component and content collection patterns over new abstractions.
- Keep content helpers in `src/lib/content.ts`; keep site-wide constants in `src/site.config.ts`.
- Update `src/content.config.ts` before adding new frontmatter fields, then add tests that prove the schema or helper behavior.
- Preserve Biome formatting: 2 spaces, single quotes in JavaScript and TypeScript, trailing commas where Biome applies them.
- Do not edit generated files to fix source behavior.
- Avoid adding production dependencies unless the requested feature clearly requires them.

## Content Rules

- Blog posts live in `src/content/blog`.
- Project entries live in `src/content/projects`.
- Study notes live in `src/content/notes`.
- Book notes live in `src/content/books`.
- Required frontmatter for every collection entry: `title`, `description`, and `pubDate`.
- Use ISO-like dates in frontmatter, for example `2026-06-27`.
- Set `draft: true` for unfinished entries instead of hiding them by filename.

## Codex Harness

- Project-scoped Codex config lives in `.codex/config.toml`.
- Lifecycle hooks live in `.codex/hooks.json` and `.codex/hooks/`.
- Custom subagents live in `.codex/agents/*.toml`.
- Repo-scoped skills live in `.agents/skills/*/SKILL.md`.
- Use `$astro-homepage-maintainer` for implementation, refactors, styling, routing, and verification work.
- Use `$homepage-content-author` for adding or revising Markdown / MDX collection entries.
- Always use `$homepage-content-sync` when adding, publishing, revising, or removing blog posts, projects, book notes, or photos. Complete homepage Latest, section count, date, and link updates and verification in the same task.

## Review Guidelines

- Prioritize correctness, broken routes, invalid content schemas, missing tests, accessibility regressions, and layout regressions.
- Treat accidental secret exposure, unsafe shell guidance, or dependency-manager drift as high-priority findings.
- Verify changes with the narrowest command that proves the behavior, then broaden to `pnpm build` or `pnpm test:e2e` when the change affects rendering or routing.
