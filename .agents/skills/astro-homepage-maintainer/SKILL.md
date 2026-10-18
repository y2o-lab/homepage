---
name: astro-homepage-maintainer
description: Maintain and extend this Astro personal homepage. Use when working on Astro routes, layouts, components, Svelte islands, Tailwind CSS, content collection plumbing, tests, build behavior, dependencies, or project verification for this repository.
---

# Astro Homepage Maintainer

## Workflow

1. Read `AGENTS.md` and `references/project-map.md` before planning changes.
2. Inspect the existing Astro route, component, content, and test pattern nearest to the request.
3. Keep edits scoped to source files. Do not patch `dist/`, `.astro/`, `node_modules/`, `playwright-report/`, or `test-results/`.
4. Prefer existing helpers in `src/lib/content.ts`, constants in `src/site.config.ts`, and collection schemas in `src/content.config.ts`.
5. Preserve Japanese copy tone unless the edited page already uses another language.
6. Add or update tests when behavior, schema, sorting, filtering, routing, or visible layout expectations change.
7. Verify with the narrowest useful command, then use `pnpm build` when routes, content schemas, or rendered pages changed.
8. When the task adds, publishes, revises, or removes content (including photos), always apply [homepage-content-sync](../homepage-content-sync/SKILL.md) and complete homepage updates and verification in the same task.

## Command Selection

- Source formatting or lint risk: run `pnpm check:code`.
- Content helper or schema behavior: run `pnpm test`.
- Astro route, layout, integration, or content collection changes: run `pnpm build`.
- Navigation, responsive layout, or cross-page rendering changes: run `pnpm test:e2e`.
- Codex harness changes: run `pnpm verify:codex`.

## References

- Read `references/project-map.md` for the repository map, ownership boundaries, and verification matrix.
