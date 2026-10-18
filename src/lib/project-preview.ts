import { site } from '@/site.config';

export interface PreviewProject {
  id: string;
  title: string;
  kind: 'web' | 'cli' | 'library';
  type: string;
  description: string;
  tags: string[];
  url?: string;
  repository?: string;
  npm?: string;
  blogId?: string;
  reference?: boolean;
}

// 外部の実在するOSSを表示例として使う。本人の制作物と区別する。
export const previewProjects: PreviewProject[] = [
  {
    id: 'homepage',
    title: 'Homepage',
    kind: 'web',
    type: 'Webサイト',
    description: 'つくったものと、日々の学びが集まる場所。',
    tags: ['Astro', 'Svelte', 'Tailwind CSS'],
    url: site.url,
    repository: 'https://github.com/y2o-lab/homepage',
  },
  {
    id: 'storymesh',
    title: 'Storymesh',
    kind: 'cli',
    type: 'CLIツール',
    description: 'StorybookのStory不足を検知し、雛形を生成する。',
    tags: ['CLI', 'Storybook'],
    repository: 'https://github.com/y2o-lab/storymesh',
    npm: 'https://www.npmjs.com/package/storymesh',
    blogId: 'storymesh',
  },
  {
    id: 'clsx',
    title: 'clsx',
    kind: 'library',
    type: 'ライブラリ',
    description: '条件に合わせて、クラス名を組み立てる。',
    tags: ['JavaScript', 'UI'],
    repository: 'https://github.com/lukeed/clsx',
    npm: 'https://www.npmjs.com/package/clsx',
    reference: true,
  },
];
