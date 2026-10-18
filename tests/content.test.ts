import { describe, expect, it } from 'vitest';
import {
  type AnyEntry,
  byNewest,
  byTakenDate,
  formatDate,
  getProjectBlogUrl,
  isPublished,
} from '../src/lib/content';

function entry(pubDate: Date, draft = false) {
  return {
    data: {
      draft,
      pubDate,
    },
  } as unknown as AnyEntry;
}

describe('content helpers', () => {
  it('filters draft entries', () => {
    expect(isPublished(entry(new Date('2026-06-27'), false))).toBe(true);
    expect(isPublished(entry(new Date('2026-06-27'), true))).toBe(false);
  });

  it('sorts entries by newest publication date first', () => {
    const older = entry(new Date('2025-01-01'));
    const newer = entry(new Date('2026-01-01'));

    expect([older, newer].sort(byNewest)).toEqual([newer, older]);
  });

  it('sorts photos by newest capture date first', () => {
    const older = {
      data: {
        takenDate: new Date('2025-01-01'),
      },
    } as unknown as Parameters<typeof byTakenDate>[0];
    const newer = {
      data: {
        takenDate: new Date('2026-01-01'),
      },
    } as unknown as Parameters<typeof byTakenDate>[0];

    expect([older, newer].sort(byTakenDate)).toEqual([newer, older]);
  });

  it('formats dates for Japanese readers', () => {
    expect(formatDate(new Date('2026-06-27T00:00:00+09:00'))).toBe('2026年6月27日');
  });
});

describe('project blog links', () => {
  const articles = [
    { id: 'storymesh', data: { draft: false } },
    { id: 'unfinished', data: { draft: true } },
  ] as Parameters<typeof getProjectBlogUrl>[1];

  it('links to an existing published article', () => {
    expect(getProjectBlogUrl('storymesh', articles)).toBe('/blog/storymesh/');
  });

  it('hides unset, missing and draft articles', () => {
    expect(getProjectBlogUrl(undefined, articles)).toBeUndefined();
    expect(getProjectBlogUrl('unknown', articles)).toBeUndefined();
    expect(getProjectBlogUrl('unfinished', articles)).toBeUndefined();
  });
});
