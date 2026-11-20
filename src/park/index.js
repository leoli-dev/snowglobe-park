// Assembles the whole park: static geometry (merged), instanced props, water,
// animated rides, vegetation, lamps, characters and guests.
import * as THREE from 'three';
import { Builder } from '../core/builder.js';
import { MATS, U } from '../core/materials.js';
import { updateSigns } from '../core/signs.js';
import { groundH, angDeg } from '../env/terrain.js';
import { PARK_R, TRACK_R, MONO_R, TEX_HALF, smoothstep } from '../core/config.js';
import { rand, rr, pick } from '../core/rng.js';
import { Props } from './props.js';
import { PATHS, LANDS, A } from './layout.js';
import { buildWater } from './water.js';
import { buildCastle } from './castle.js';
import { buildMainStreet } from './mainstreet.js';
import { buildRails } from './rails.js';
import { buildAdventure } from './adventure.js';
import { buildFrontier } from './frontier.js';
import { buildFantasy } from './fantasy.js';
import { buildToontown } from './toontown.js';
import { buildToyStory } from './toystory.js';
import { buildTomorrow } from './tomorrow.js';
import { Smoke } from '../fx/smoke.js';
import { buildCast } from '../chars/cast.js';
import { buildGuests } from '../chars/guests.js';

const tick = () => new Promise(r => setTimeout(r, 0));

export async function buildPark(world, app, progress) {
  const b = new Builder();
  const props = new Props(groundH);
  const smoke = new Smoke(world, 900);
  const anims = [];
  const pois = [];
  const extraWater = [];
  const pickables = [];
  // occupancy grid (1 m) so scattered trees and lamps stay out of buildings
  const occ = new Uint8Array(300 * 300);
  const occMark = (x, z, r) => {
    const x0 = Math.floor(x - r + 150), x1 = Math.ceil(x + r + 150), z0 = Math.floor(z - r + 150), z1 = Math.ceil(z + r + 150);
    for (let zz = Math.max(0, z0); zz <= Math.min(299, z1); zz++) for (let xx = Math.max(0, x0); xx <= Math.min(299, x1); xx++) {
      if ((xx - 150 - x) ** 2 + (zz - 150 - z) ** 2 <= r * r) occ[zz * 300 + xx] = 1;
    }
  };
  const occRect = (x0, z0, x1, z1) => {
    for (let zz = Math.max(0, Math.floor(z0 + 150)); zz <= Math.min(299, Math.ceil(z1 + 150)); zz++)
      for (let xx = Math.max(0, Math.floor(x0 + 150)); xx <= Math.min(299, Math.ceil(x1 + 150)); xx++) occ[zz * 300 + xx] = 1;
  };
  const isOcc = (x, z) => {
    const xx = Math.round(x + 150), zz = Math.round(z + 150);
    if (xx < 0 || zz < 0 || xx > 299 || zz > 299) return true;
    return occ[zz * 300 + xx] === 1;
  };
  const maskAt = (x, z) => {
    const md = app.terrain.maskData;
    const u = Math.floor((x + TEX_HALF) / (TEX_HALF * 2) * 1024), v = Math.floor((z + TEX_HALF) / (TEX_HALF * 2) * 1024);
    if (u < 0 || v < 0 || u > 1023 || v > 1023) return 0;
    return md[(v * 1024 + u) * 4];
  };

  const ctx = {
    b, props, world, app, anims, smoke, H: groundH, extraWater, pickables,
    occ: occMark, occRect, isOcc, maskAt,
    poi: (p) => { pois.push(p); return p; },
    addDynamic: (obj) => { world.add(obj); return obj; },
  };

  const steps = [
    ['城堡', buildCastle], ['美国小镇大街', buildMainStreet], ['环园铁路与单轨', buildRails],
    ['探险世界', buildAdventure], ['边域世界', buildFrontier], ['梦幻世界', buildFantasy],
    ['米奇卡通城', buildToontown], ['玩具总动员乐园', buildToyStory], ['明日世界', buildTomorrow],
  ];
  // reserve the big footprints first
  occMark(0, -10, 28); occRect(-27, 43, 27, 113); occMark(0, 31, 14);
  let i = 0;
  for (const [name, fn] of steps) {
    progress(0.2 + 0.5 * (i++ / steps.length), `正在建造：${name}…`);
    await tick();
    fn(ctx);
  }

  progress(0.72, '正在种下圣诞树与松林…');
  await tick();
  scatterVegetation(ctx);
  pathLamps(ctx);

  progress(0.8, '正在合并几何体…');
  await tick();
  const statics = b.build({ name: 'park' });
  world.add(statics);
  statics.children.forEach(m => pickables.push(m));
  props.build(world);
  const water = buildWater(world, extraWater);
  pickables.push(water);

  progress(0.86, '正在邀请角色与游客…');
  await tick();
  const cast = buildCast(world, ctx);
  const guests = buildGuests(world, ctx, 780);
  const park = {
    pois, props, smoke, anims, ctx, statics, cast, guests,
    pickables,
    update(dt, t, atmos) {
      for (const f of anims) f(dt, t, atmos);
      const L = atmos.lights;
      MATS.bulb.color.setScalar(0.32 + L * 1.75 * (0.92 + 0.08 * Math.sin(t * 3.0)));
      const wind = app.weather?.wind || { x: 0.4, z: 0.1 };
      const lightC = smokeLight.copy(atmos.hemi.color).multiplyScalar(0.45 + atmos.hemi.intensity * 0.35).lerp(white, 0.25 * (1 - atmos.night));
      smoke.update(dt, wind, lightC, app.renderer.domElement.height * 0.9);
      updateSigns();
    },
  };
  const smokeLight = new THREE.Color(), white = new THREE.Color(1, 1, 1);
  app.ctx = ctx;
  return park;
}

function scatterVegetation(ctx) {
  const { props, isOcc, maskAt, occ } = ctx;
  // berm forest
  let placed = 0;
  for (let k = 0; k < 2400 && placed < 720; k++) {
    const a = rand() * Math.PI * 2;
    const r = rr(117, 147);
    if (r > 122.8 && r < 129.5) continue; // railroad
    if (r > 134.6 && r < 141.2) continue; // monorail
    const x = Math.sin(a) * r, z = -Math.cos(a) * r;
    const ad = angDeg(x, z);
    if (Math.abs(ad - 180) < 19 && r > 112) continue; // station & entrance
    if ((Math.abs(ad - 270) < 7 || Math.abs(ad - 32) < 7) && r < 136) continue; // stations
    // stay inside the glass
    const gy = ctx.H(x, z);
    const dc = Math.hypot(x, gy + 6 - 40, z);
    if (dc > 146) continue;
    if (isOcc(x, z)) continue;
    const s = r > 130 ? rr(1.0, 1.9) : rr(0.8, 1.4);
    props.add(rand() < 0.08 ? 'xmas' : 'pine', x, z, { s, ry: rand() * 6.28 });
    ctx.occ(x, z, 1.6 * s);
    placed++;
  }
  // inside the park: fill free grass with trees that suit each land
  const landOf = (x, z) => {
    let best = null, bd = 1e9;
    for (const l of LANDS) {
      const d = Math.hypot(x - l.x, z - l.z) / l.r;
      if (d < bd) { bd = d; best = l.id; }
    }
    return best;
  };
  const kinds = {
    main: ['round', 'xmas', 'round'], adv: ['palm', 'palm', 'round', 'bush'], fron: ['pine', 'round', 'cactus', 'pine'],
    lib: ['round', 'round', 'pine'], fan: ['round', 'pine', 'xmas', 'round'], toon: ['round', 'bush', 'round'],
    toy: ['round', 'bush'], tom: ['round', 'bush', 'pine'],
  };
  let n = 0;
  for (let k = 0; k < 9000 && n < 700; k++) {
    const r = Math.sqrt(rand()) * (PARK_R - 3);
    const a = rand() * Math.PI * 2;
    const x = Math.sin(a) * r, z = -Math.cos(a) * r;
    if (isOcc(x, z) || isOcc(x + 1.5, z) || isOcc(x - 1.5, z) || isOcc(x, z + 1.5) || isOcc(x, z - 1.5)) continue;
    if (maskAt(x, z) < 240 || maskAt(x + 2, z) < 240 || maskAt(x - 2, z) < 240 || maskAt(x, z + 2) < 240 || maskAt(x, z - 2) < 240) continue;
    const land = landOf(x, z);
    const type = pick(kinds[land] || ['round']);
    const s = type === 'bush' ? rr(0.8, 1.4) : rr(0.75, 1.25);
    props.add(type, x, z, { s, ry: rand() * 6.28 });
    ctx.occ(x, z, type === 'bush' ? 1.2 : 2.2);
    n++;
  }
}

function pathLamps(ctx) {
  const { props, isOcc } = ctx;
  for (const p of PATHS) {
    if (p.id === 'main') continue;
    let carry = 5, side = 1;
    for (let i = 0; i < p.pts.length - 1; i++) {
      const [x1, z1] = p.pts[i], [x2, z2] = p.pts[i + 1];
      const L = Math.hypot(x2 - x1, z2 - z1);
      const dx = (x2 - x1) / L, dz = (z2 - z1) / L;
      let s = carry;
      while (s < L) {
        const off = p.w / 2 + 0.8;
        const x = x1 + dx * s + -dz * off * side, z = z1 + dz * s + dx * off * side;
        if (!isOcc(x, z) && Math.hypot(x, z) < PARK_R - 1) { props.lamp(x, z, Math.atan2(dx, dz)); ctx.occ(x, z, 0.8); }
        side = -side;
        s += 11;
      }
      carry = s - L;
    }
  }
}
