// Screenshot harness: drives a local Chromium-based browser (Thorium by default) via playwright-core.
// usage: node tools/shot.mjs '<json array of {name, eval, wait}>' [outDir] [w] [h]
import { chromium } from 'playwright-core';
import path from 'node:path';
import fs from 'node:fs';

// any Chromium-based browser works; set BROWSER_PATH to point at it
const BROWSER = process.env.BROWSER_PATH || '/Applications/Thorium.app/Contents/MacOS/Thorium';
const spec = JSON.parse(process.argv[2] || '[{"name":"default","wait":4000}]');
const outDir = process.argv[3] || '/tmp/sg-shots';
const W = +(process.argv[4] || 1440), H = +(process.argv[5] || 900);
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({
  executablePath: BROWSER,
  headless: true,
  args: ['--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=metal', '--enable-webgl', '--disable-background-timer-throttling'],
});
const version = browser.version();
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
const logs = [];
page.on('console', (m) => logs.push(`[${m.type()}] ${m.text()}`));
page.on('pageerror', (e) => logs.push(`[pageerror] ${e.message}`));
const url = 'file://' + path.resolve('dist/index.html');
const t0 = Date.now();
await page.goto(url);
try {
  await page.waitForFunction(() => window.SG && window.SG.ready, null, { timeout: 60000 });
} catch (e) {
  logs.push('[harness] not ready after 60s');
}
const loadMs = Date.now() - t0;
const gl = await page.evaluate(() => {
  try {
    const r = window.SG.renderer; const g = r.getContext();
    const ext = g.getExtension('WEBGL_debug_renderer_info');
    return { renderer: ext ? g.getParameter(ext.UNMASKED_RENDERER_WEBGL) : g.getParameter(g.RENDERER), calls: r.info.render.calls, tris: r.info.render.triangles };
  } catch (e) { return { err: String(e) }; }
});
for (const s of spec) {
  if (s.eval) {
    try { await page.evaluate(s.eval); } catch (e) { logs.push(`[eval error ${s.name}] ${e.message}`); }
  }
  await page.waitForTimeout(s.wait ?? 2500);
  const file = path.join(outDir, `${s.name}.png`);
  await page.screenshot({ path: file });
  const info = await page.evaluate(() => ({ fps: Math.round(window.SG?.fps), calls: window.SG?.stats?.calls, tris: window.SG?.stats?.tris, pr: window.SG?.renderer.getPixelRatio() }));
  console.log(`shot ${file}`, JSON.stringify(info));
}
console.log('browser', version, 'load', loadMs, 'ms', JSON.stringify(gl));
console.log(logs.slice(0, 40).join('\n'));
await browser.close();
