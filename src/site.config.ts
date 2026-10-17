export const site = {
  title: 'yuno',
  description:
    'Webエンジニア yuno のポートフォリオ。制作物、ブログ、読書の記録、写真をまとめています。',
  url: import.meta.env.SITE_URL ?? 'http://localhost:4321',
  author: 'yuno',
};

export const navigationSections = ['blog', 'projects', 'books', 'photos'] as const;
