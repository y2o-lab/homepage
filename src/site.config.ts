export const site = {
  title: 'yuno',
  description:
    'Webエンジニア yuno のポートフォリオ。制作物、ブログ、読書の記録、写真をまとめています。',
  url: import.meta.env.SITE_URL ?? 'http://localhost:4321',
  author: 'yuno',
};

export const navigationSections = ['blog', 'projects', 'books', 'photos'] as const;

export const techStack = [
  { name: 'Frontend', items: ['TypeScript', 'Next.js', 'React', 'Svelte', 'Astro'] },
  { name: 'Backend', items: ['C#', '.NET', 'Python', 'FastAPI'] },
  {
    name: 'AI & Workflow',
    items: ['Codex', 'Claude Code', 'Harness Engineering', 'GitHub Copilot'],
  },
  { name: 'Cloud', items: ['AWS'] },
] as const;
