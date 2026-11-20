// Geometry stats: triangles per object group (`node tools/tris.mjs`)
import { chromium } from 'playwright-core';
import path from 'node:path';
const browser = await chromium.launch({ executablePath: process.env.BROWSER_PATH || '/Applications/Thorium.app/Contents/MacOS/Thorium', headless: true, args: ['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
page.on('pageerror', e => console.log('ERR', e.message));
await page.goto('file://' + path.resolve('dist/index.html'));
await page.waitForFunction(() => window.SG && window.SG.ready, null, { timeout: 60000 });
const out = await page.evaluate(() => {
  const S = window.SG;
  const by = {};
  let total = 0, meshes = 0;
  S.world.traverse(o => {
    if (!o.isMesh && !o.isPoints && !o.isLine) return;
    const g = o.geometry; if (!g) return;
    if (!g.attributes.position) return;
    let t = g.index ? g.index.count / 3 : g.attributes.position.count / 3;
    if (o.isInstancedMesh) t *= o.count;
    const key = (o.name || o.parent?.name || o.type).split(':')[0] + (o.isInstancedMesh ? '[inst]' : '');
    by[key] = (by[key] || 0) + t;
    total += t; meshes++;
  });
  const top = Object.entries(by).sort((a, b) => b[1] - a[1]).slice(0, 25).map(([k, v]) => `${k}: ${(v / 1000).toFixed(0)}k`);
  return { total: (total / 1e6).toFixed(2) + 'M', meshes, top, fps: S.fps, stats: S.stats };
});
console.log(JSON.stringify(out, null, 1));
await browser.close();
