import type { CollectionEntry } from 'astro:content';

export type ContentSection = 'blog' | 'notes' | 'books' | 'projects';
export type AnyEntry =
  | CollectionEntry<'blog'>
  | CollectionEntry<'notes'>
  | CollectionEntry<'books'>
  | CollectionEntry<'projects'>;

export const sectionLabels: Record<ContentSection, string> = {
  blog: 'ブログ',
  notes: '勉強メモ',
  books: '書籍メモ',
  projects: '作ったもの',
};

export const sectionDescriptions: Record<ContentSection, string> = {
  blog: '考えたこと、調べたこと、日々の記録。',
  notes: '技術や学習内容をあとから取り出せる形で残します。',
  books: '読んだ本、読んでいる本、そこから得たメモ。',
  projects: '作ったもの、試したもの、公開したものの記録。',
};

export function isPublished<T extends AnyEntry>(entry: T): boolean {
  return !entry.data.draft;
}

export function byNewest<T extends AnyEntry>(a: T, b: T): number {
  return b.data.pubDate.getTime() - a.data.pubDate.getTime();
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Tokyo',
  }).format(date);
}
