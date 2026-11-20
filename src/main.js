import * as THREE from 'three';
import { GLOBE, clamp, smoothstep } from './core/config.js';
import { U, updateWater, MATS } from './core/materials.js';
import { Room, makeEnvTexture } from './env/room.js';
import { Glass } from './env/glass.js';
import { Sky } from './env/sky.js';
import { Atmos } from './env/atmos.js';
import { Terrain, groundH } from './env/terrain.js';
import { GlobeControls } from './ui/controls.js';
import { Post } from './fx/post.js';
import { buildPark } from './park/index.js';
import { Weather } from './fx/weather.js';
import { Fireworks } from './fx/fireworks.js';
import { UI } from './ui/ui.js';
import { Parade } from './fx/parade.js';

const canvas = document.getElementById('scene');
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance', alpha: false });
} catch (e) {
  const lb = document.getElementById('loadlabel');
  if (lb) lb.textContent = '这个浏览器无法启用 WebGL 2，请换用最新版 Chrome、Edge、Safari 或 Firefox 打开。';
  throw e;
}
renderer.info.autoReset = false;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;

const camera = new THREE.PerspectiveCamera(34, innerWidth / innerHeight, 0.1, 6000);
const roomScene = new THREE.Scene();
const world = new THREE.Scene();
const glassScene = new THREE.Scene();

const envTex = makeEnvTexture();
MATS.metal.envMap = envTex; MATS.metal.envMapIntensity = 0.9;
MATS.gloss.envMap = envTex; MATS.gloss.envMapIntensity = 0.25;
MATS.ice.envMap = envTex; MATS.ice.envMapIntensity = 0.8;
MATS.glassy.envMap = envTex;

const room = new Room(roomScene, envTex);
const glass = new Glass(glassScene, envTex);
const sky = new Sky(world);
const atmos = new Atmos(world, sky);
atmos.autoAccum = true;
const terrain = new Terrain(world);

const progress = (p, label) => {
  const bar = document.getElementById('loadbar');
  if (bar) bar.style.transform = `scaleX(${p})`;
  const lb = document.getElementById('loadlabel');
  if (lb && label) lb.textContent = label;
};

// ground picking for zoom-to-cursor / double click
const raycaster = new THREE.Raycaster();
const pickables = [];
function pick(nx, ny) {
  raycaster.setFromCamera({ x: nx, y: ny }, camera);
  const hits = raycaster.intersectObjects(pickables, false);
  for (const h of hits) {
    const c = new THREE.Vector3(GLOBE.cx, GLOBE.cy, GLOBE.cz);
    if (h.point.distanceTo(c) < GLOBE.R - 1) return h.point;
  }
  // fallback: ground plane
  const o = raycaster.ray.origin, d = raycaster.ray.direction;
  if (d.y < -1e-3) {
    const t = -o.y / d.y;
    const p = o.clone().addScaledVector(d, t);
    if (Math.hypot(p.x, p.z) < 140) return p;
  }
  return null;
}

const controls = new GlobeControls(camera, canvas, { groundAt: groundH, pick });
const post = new Post(renderer, roomScene, world, glassScene, camera);

let pixelRatio = Math.min(window.devicePixelRatio || 1, 1.6);
function resize() {
  const w = innerWidth, h = innerHeight;
  renderer.setPixelRatio(pixelRatio);
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  post.setSize(w, h, pixelRatio);
}
addEventListener('resize', resize);
resize();

const app = {
  THREE, renderer, camera, world, roomScene, glassScene, controls, atmos, sky, glass, room, terrain, post, U,
  pickables, time: 0, speed: 1, playing: true, timeRate: 1 / 40, // game hours per real second
  miniature: false, music: false, ready: false,
};
window.SG = app;

async function init() {
  progress(0.15, '正在铺设雪地与铁路…');
  await new Promise(r => setTimeout(r, 30));
  const park = await buildPark(world, app, progress);
  app.park = park;
  for (const m of park.pickables || []) pickables.push(m);
  pickables.push(...world.children.filter(o => o.isMesh && o.geometry?.type === 'CircleGeometry'));

  app.weather = new Weather(world, app);
  app.fireworks = new Fireworks(world, app);
  app.parade = new Parade(world, app);
  progress(0.95, '正在点亮圣诞灯…');
  await new Promise(r => setTimeout(r, 0));
  // compile all shaders up front so the first frames don't stutter
  try { renderer.compile(world, camera); renderer.compile(roomScene, camera); renderer.compile(glassScene, camera); } catch (e) { /* optional */ }
  app.ui = new UI(app);
  progress(1, '完成');
  setWeather('snow');
  app.ready = true;
  document.body.classList.add('ready');
  requestAnimationFrame(loop);
}

function setWeather(k) { atmos.setWeather(k); app.ui?.syncWeather(k); }
app.setWeather = setWeather;

let last = performance.now();
let fpsAcc = 0, fpsN = 0, fpsT = 0;
function loop(now) {
  requestAnimationFrame(loop);
  let dt = (now - last) / 1000; last = now;
  dt = Math.min(dt, 0.06);
  const sdt = dt * app.speed;
  app.time += sdt;
  U.uTime.value = app.time;
  if (app.playing && !app.timeHold) atmos.hour = (atmos.hour + dt * app.timeRate) % 24;

  controls.update(dt);
  const cIn = camera.position.distanceTo(new THREE.Vector3(GLOBE.cx, GLOBE.cy, GLOBE.cz));
  const inside = smoothstep(GLOBE.R + 4, GLOBE.R - 6, cIn);
  app.inside = inside;
  sky.u.uInside.value = inside;
  sky.u.uAlpha.value = 0.55;
  glass.update(inside, app.miniature ? 0.0 : 1);

  atmos.update(dt, app.time);
  room.update(app.time, atmos.lights, app.music, dt);
  updateWater(sdt);
  app.park?.update(sdt, app.time, atmos);
  app.weather?.update(dt, sdt);
  app.fireworks?.update(sdt);
  app.parade?.update(sdt, app.time);
  app.ui?.update(dt);

  // bloom & exposure follow the light level
  const L = atmos.lights;
  post.bloom.strength = 0.14 + L * 0.34 + (app.fireworks?.glow || 0) * 0.08;
  post.bloom.threshold = 1.0 - L * 0.1;
  post.bloom.radius = 0.45;
  renderer.toneMappingExposure = 1.0 + L * 0.12;
  renderer.info.reset();
  post.render(dt);
  app.stats = { calls: renderer.info.render.calls, tris: renderer.info.render.triangles };
  if (app.captureNext) { const cb = app.captureNext; app.captureNext = null; cb(renderer.domElement); }

  // adaptive resolution
  fpsAcc += dt; fpsN++; fpsT += dt;
  if (fpsT > 2.5) {
    const avg = fpsAcc / fpsN;
    if (avg > 0.028 && pixelRatio > 0.8) { pixelRatio = Math.max(0.8, pixelRatio - 0.2); resize(); }
    else if (avg < 0.0135 && pixelRatio < Math.min(devicePixelRatio, 1.6) - 0.01) { pixelRatio = Math.min(pixelRatio + 0.2, Math.min(devicePixelRatio, 1.6)); resize(); }
    app.fps = 1 / avg;
    fpsAcc = 0; fpsN = 0; fpsT = 0;
  }
}

init().catch(err => {
  console.error(err);
  const lb = document.getElementById('loadlabel');
  if (lb) lb.textContent = '加载失败：' + err.message;
});
