import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const commonContentSchema = z.object({
  title: z.string(),
  description: z.string(),
  pubDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  draft: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
});

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
  schema: commonContentSchema,
});

const notes = defineCollection({
  loader: glob({ base: './src/content/notes', pattern: '**/*.{md,mdx}' }),
  schema: commonContentSchema.extend({
    topic: z.string().optional(),
  }),
});

const books = defineCollection({
  loader: glob({ base: './src/content/books', pattern: '**/*.{md,mdx}' }),
  schema: commonContentSchema.extend({
    bookTitle: z.string(),
    bookAuthor: z.string().optional(),
    coverImage: z.string().startsWith('/'),
    coverAlt: z.string().optional(),
    status: z.enum(['reading', 'finished', 'paused']).default('reading'),
  }),
});

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.{md,mdx}' }),
  schema: commonContentSchema.extend({
    url: z.url().optional(),
    repository: z.url().optional(),
    featured: z.boolean().default(false),
  }),
});

export const collections = { blog, notes, books, projects };
