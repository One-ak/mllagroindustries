import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';

const root = path.dirname(fileURLToPath(import.meta.url));
const output = await build({
  configFile: false,
  root,
  publicDir: false,
  build: {
    outDir: path.join(root, '../social/assets'),
    emptyOutDir: false,
    rollupOptions: {
      input: path.join(root, 'src/main.jsx'),
      output: {
        entryFileNames: 'social-app-[hash].js',
        assetFileNames: 'social-app-[hash].[ext]'
      }
    }
  }
});

const files = (Array.isArray(output) ? output : [output]).flatMap(result => result.output);
const entry = files.find(file => file.type === 'chunk' && file.isEntry);
const stylesheet = files.find(file => file.type === 'asset' && file.fileName.endsWith('.css'));
if (!entry || !stylesheet) throw new Error('Social hub build did not produce its script and stylesheet.');

const htmlPath = path.join(root, '../social/index.html');
let html = await readFile(htmlPath, 'utf8');
const entryPattern = /src="\.\/assets\/(?:index|social-app)-[^"\s]+\.js"/;
if (!entryPattern.test(html)) throw new Error('Social hub script entry was not found.');
html = html.replace(entryPattern, `src="./assets/${entry.fileName}"`);
html = html.replace(/\s*<link data-social-app[^>]+>/, '');
html = html.replace(
  /(<link rel="stylesheet" crossorigin href="\.\/assets\/[^"\s]+\.css">)/,
  `$1\n    <link data-social-app rel="stylesheet" href="./assets/${stylesheet.fileName}">`
);
await writeFile(htmlPath, html);
console.log(`Updated social/index.html with ${entry.fileName} and ${stylesheet.fileName}`);
