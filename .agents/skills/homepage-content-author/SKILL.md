---
name: homepage-content-author
description: Add, revise, or validate Markdown and MDX content for this Astro homepage. Use for blog posts, project entries, study notes, book notes, frontmatter, draft handling, collection schema updates, slugs, tags, and Japanese reader-facing content edits.
---

# Homepage Content Author

## Workflow

1. Read `references/content-schema.md` before adding or changing content.
2. Choose the collection that matches the user's intent: blog, projects, notes, or books.
3. Inspect nearby entries for filename, frontmatter, excerpt length, heading, and tone conventions.
4. Use Markdown or MDX only when the requested content needs MDX features.
5. Keep slugs stable and lowercase. Prefer descriptive hyphenated filenames.
6. Use `draft: true` for unfinished work.
7. Always apply [homepage-content-sync](../homepage-content-sync/SKILL.md) for content changes, including additions and publication. Complete homepage Latest, section counts, dates, links, and verification in the same task.
8. Run `pnpm build` after content or schema changes. Run `pnpm test` when helper behavior changes.

## Content Quality

- Write concise descriptions because they appear in lists, RSS, and metadata.
- Keep Japanese copy natural and direct.
- Avoid inventing external facts, publication dates, URLs, repositories, or book metadata. Ask or leave draft placeholders when required facts are missing.
- Update `src/content.config.ts` first when a new durable frontmatter field is needed.

## References

- Read `references/content-schema.md` for collection paths, required fields, optional fields, and examples.
