# Content Schema

## Common Fields

Every collection entry requires:

```yaml
title: "Entry title"
description: "Short summary for lists and metadata."
pubDate: 2026-06-27
```

Optional common fields:

```yaml
updatedDate: 2026-06-28
draft: true
tags:
  - astro
  - note
```

## Collections

### Blog

- Path: `src/content/blog`
- Pattern: `**/*.{md,mdx}`
- Use for essays, updates, and longer posts.
- Schema: common fields only.

### Projects

- Path: `src/content/projects`
- Pattern: `**/*.{md,mdx}`
- Use for things the site owner made.
- Extra optional fields:

```yaml
url: "https://example.com"
repository: "https://github.com/user/repo"
featured: true
```

### Notes

- Path: `src/content/notes`
- Pattern: `**/*.{md,mdx}`
- Use for study notes and technical notes.
- Extra optional field:

```yaml
topic: "Astro"
```

### Books

- Path: `src/content/books`
- Pattern: `**/*.{md,mdx}`
- Use for reading notes.
- Extra fields:

```yaml
bookTitle: "Book title"
bookAuthor: "Author name"
coverImage: "/books/book-cover.png"
coverAlt: "表紙を説明する代替テキスト"
status: "reading"
```

`status` must be one of `reading`, `finished`, or `paused`.

## Validation

- Run `pnpm build` after adding or editing entries.
- Run `pnpm test` when changing content helper behavior in `src/lib/content.ts`.
