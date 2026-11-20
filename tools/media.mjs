// Regenerates the README images in media/ by driving the built page in a
// local Chromium-based browser (Thorium by default, override with BROWSER_PATH).
//   npm run build && npm run media
import { chromium } from 'playwright-core';
import path from 'node:path';
import fs from 'node:fs';

const BROWSER = process.env.BROWSER_PATH || '/Applications/Thorium.app/Contents/MacOS/Thorium';
const OUT = path.resolve('media');
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ executablePath: BROWSER, headless: true, args: ['--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=metal'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
await page.goto('file://' + path.resolve('dist/index.html'));
await page.waitForFunction(() => window.SG && window.SG.ready, null, { timeout: 60000 });

const prep = () => page.evaluate(() => {
  document.getElementById('hint').classList.add('gone');
  window.SG.ui.labels.enabled = false;
  window.SG.ui.setPlaying(false);
});
const fly = (t, dist, pitch, yaw) => page.evaluate(([t, dist, pitch, yaw]) => {
  const S = window.SG;
  S.controls.flyTo({ target: new S.THREE.Vector3(...t), dist, pitch, yaw, duration: 0.05 });
}, [t, dist, pitch, yaw]);
const shoot = async (name, wait = 4000) => {
  await page.waitForTimeout(wait);
  await page.screenshot({ path: path.join(OUT, name + '.jpg'), type: 'jpeg', quality: 84 });
  console.log('wrote media/' + name + '.jpg');
};

await prep();
// 1. the whole globe on its music-box base, golden hour with light snow
await page.evaluate(() => { const S = window.SG; S.atmos.hour = 16.2; S.setWeather('snow'); S.controls.flyTo({ target: S.controls.home.clone(), dist: S.ui.homeDist(), pitch: 0.14, yaw: 0, duration: 0.05 }); });
await shoot('hero', 6000);
// 2. fireworks over the castle, seen from inside the globe
await page.evaluate(() => { const S = window.SG; S.atmos.hour = 21.05; S.setWeather('clear'); S.fireworks.startShow(); S.fireworks.show.t = 24; });
await fly([0, 40, 10], 170, 0.12, 0);
await shoot('fireworks', 6000);
// 3. aurora night from outside
await page.evaluate(() => { const S = window.SG; S.fireworks.stopShow(); S.atmos.hour = 23.2; S.setWeather('aurora'); });
await page.evaluate(() => { const S = window.SG; S.controls.flyTo({ target: S.controls.home.clone(), dist: S.ui.homeDist(), pitch: 0.14, yaw: 0, duration: 0.05 }); });
await shoot('aurora', 6000);
// 4. Christmas parade on Main Street
await page.evaluate(() => { const S = window.SG; S.atmos.hour = 14.2; S.setWeather('clear'); S.parade.start(); S.parade.t = 30; });
await fly([0, 2, 64], 34, 0.42, 0);
await shoot('parade', 4500);
// 5. Duffy & friends at the Toontown gazebo
await fly([38.6, 1.0, -64.2], 12, 0.26, -0.78);
await shoot('characters', 3500);
// 6. a photo taken in miniature (tilt-shift) mode, saved straight from the in-page camera
await page.evaluate(() => { const S = window.SG; S.atmos.hour = 15.4; S.setWeather('clear'); S.ui.photo.enter(); });
await fly([0, 4, 40], 95, 0.62, 0.35);
await page.waitForTimeout(4500);
const dataUrl = await page.evaluate(() => new Promise((resolve) => {
  const S = window.SG;
  const before = S.ui.photo.photos.length;
  S.ui.photo.capture();
  const iv = setInterval(() => {
    if (S.ui.photo.photos.length > before) {
      clearInterval(iv);
      const fr = new FileReader();
      fr.onload = () => resolve(fr.result);
      fr.readAsDataURL(S.ui.photo.photos[0].blob);
    }
  }, 100);
}));
fs.writeFileSync(path.join(OUT, 'miniature.jpg'), Buffer.from(dataUrl.split(',')[1], 'base64'));
console.log('wrote media/miniature.jpg');
await browser.close();
