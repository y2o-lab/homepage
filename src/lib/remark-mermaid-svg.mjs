import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from '@playwright/test';

const cacheDir = join(process.cwd(), '.astro', 'mermaid');
const mmdcBin = join(
  process.cwd(),
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'mmdc.cmd' : 'mmdc',
);

const mermaidConfig = {
  securityLevel: 'strict',
  theme: 'base',
  fontFamily:
    'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  themeVariables: {
    background: '#fff8e4',
    primaryColor: '#fff4d8',
    primaryTextColor: '#2e261d',
    primaryBorderColor: '#b66d43',
    lineColor: '#4c654e',
    secondaryColor: '#e2e8cd',
    tertiaryColor: '#fff8e4',
    textColor: '#2e261d',
    mainBkg: '#fff8e4',
    nodeBorder: '#b66d43',
    clusterBkg: '#fff4d8',
    clusterBorder: '#d6b988',
    titleColor: '#2e261d',
    edgeLabelBackground: '#fff8e4',
  },
  flowchart: {
    htmlLabels: false,
    curve: 'basis',
  },
};

function hashDiagram(source) {
  return createHash('sha256')
    .update(source)
    .update(JSON.stringify(mermaidConfig))
    .digest('hex')
    .slice(0, 16);
}

function ensureConfigFiles() {
  mkdirSync(cacheDir, { recursive: true });

  const mermaidConfigPath = join(cacheDir, 'mermaid-config.json');
  const puppeteerConfigPath = join(cacheDir, 'puppeteer-config.json');
  const chromiumPath = chromium.executablePath();

  writeFileSync(mermaidConfigPath, JSON.stringify(mermaidConfig, null, 2));
  writeFileSync(
    puppeteerConfigPath,
    JSON.stringify(
      {
        executablePath: chromiumPath,
        headless: true,
        args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
      },
      null,
      2,
    ),
  );

  return { mermaidConfigPath, puppeteerConfigPath };
}

function renderMermaidSvg(source) {
  const diagramHash = hashDiagram(source);
  const inputPath = join(cacheDir, `${diagramHash}.mmd`);
  const outputPath = join(cacheDir, `${diagramHash}.svg`);

  if (existsSync(outputPath)) {
    return readFileSync(outputPath, 'utf8');
  }

  const { mermaidConfigPath, puppeteerConfigPath } = ensureConfigFiles();
  writeFileSync(inputPath, source);

  try {
    execFileSync(mmdcBin, [
      '-i',
      inputPath,
      '-o',
      outputPath,
      '-c',
      mermaidConfigPath,
      '-p',
      puppeteerConfigPath,
      '-b',
      'transparent',
      '-I',
      `mermaid-${diagramHash}`,
      '-q',
    ]);
  } catch (error) {
    const details = error.stderr?.toString().trim() || error.message;
    throw new Error(`Failed to render Mermaid diagram with mmdc: ${details}`);
  }

  return readFileSync(outputPath, 'utf8');
}

function toMermaidFigure(svg) {
  return `<figure class="mermaid-diagram" data-mermaid-rendered="build"><div class="mermaid-diagram__canvas" role="img" aria-label="Mermaid diagram">${svg}</div></figure>`;
}

function transformChildren(parent) {
  if (!Array.isArray(parent.children)) {
    return;
  }

  parent.children = parent.children.map((node) => {
    if (node.type === 'code' && node.lang === 'mermaid') {
      return {
        type: 'html',
        value: toMermaidFigure(renderMermaidSvg(node.value)),
      };
    }

    transformChildren(node);
    return node;
  });
}

export function remarkMermaidSvg() {
  return (tree) => {
    transformChildren(tree);
  };
}
