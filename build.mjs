import * as esbuild from 'esbuild';
import fs from 'node:fs';

const dev = process.argv.includes('--dev');
const t0 = Date.now();
const r = await esbuild.build({
  entryPoints: ['src/main.js'], bundle: true, minify: !dev, format: 'esm', target: 'es2020',
  write: false, legalComments: 'none', sourcemap: dev ? 'inline' : false, logLevel: 'warning',
});
const js = r.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');
const css = fs.readFileSync('src/styles.css', 'utf8');
const head = fs.readFileSync('src/head.html', 'utf8');
const body = fs.readFileSync('src/body.html', 'utf8');
fs.mkdirSync('dist', { recursive: true });
// artifact page: content only (the host wraps it in a document skeleton)
fs.writeFileSync('dist/artifact.html', `${head}\n<style>${css}</style>\n${body}\n<script type="module">${js}</script>\n`);
// standalone page: full document, works from file:// or any static server
fs.writeFileSync('dist/index.html', `<!doctype html>\n<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n${head}\n<style>${css}</style></head><body>\n${body}\n<script type="module">${js}</script>\n</body></html>\n`);
const kb = (fs.statSync('dist/index.html').size / 1024).toFixed(0);
console.log(`built dist/index.html (${kb} KB) in ${Date.now() - t0} ms`);
