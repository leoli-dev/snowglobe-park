// Adventureland: Swiss Family Treehouse, Enchanted Tiki Room, Jungle Cruise,
// Indiana Jones temple, Aladdin's magic carpets, Pirates of the Caribbean fort,
// Pride Rock on the jungle island.
import * as THREE from 'three';
import { Builder } from '../core/builder.js';
import { makeSign } from '../core/signs.js';
import { A } from './layout.js';
import { jungleCurve } from './water.js';
import { rand, rr } from '../core/rng.js';

const BARK = '#6a4a32', LEAF = '#3f7a3a', LEAF2 = '#4c8a40', THATCH = '#b8913f', BAMBOO = '#c9a46a', WOOD = '#7a5434';

function treehouse(b, props, [x, z]) {
  b.push(x, 0, z);
  for (let i = 0; i < 10; i++) {
    const a = i / 10 * Math.PI * 2 + 0.2;
    b.rod(Math.cos(a) * 4.8, 0, Math.sin(a) * 4.8, Math.cos(a) * 1.0, 4.5, Math.sin(a) * 1.0, 0.42, BARK);
  }
  b.cyl(1.8, 16, 0, 0, 0, BARK, { rt: 1.0, seg: 10 });
  const blobs = [];
  for (let i = 0; i < 8; i++) {
    const a = i / 8 * Math.PI * 2 + 0.4;
    const h = 9 + (i % 3) * 2.2, len = rr(5.5, 7.5);
    const ex = Math.cos(a) * len, ez = Math.sin(a) * len;
    b.rod(0, h, 0, ex, h + 2.8, ez, 0.42, BARK);
    b.sph(rr(2.8, 3.6), ex, h + 3.6, ez, i % 2 ? LEAF : LEAF2, { sy: 0.55, mat: 'leaf', w: 10, h: 7 });
  }
  b.sph(5.4, 0, 18.5, 0, LEAF, { sy: 0.5, mat: 'leaf', w: 12, h: 8 });
  b.sph(3.6, 1.5, 21, -1, LEAF2, { sy: 0.55, mat: 'leaf', w: 10, h: 7 });
  // platforms, railings & little thatched roofs
  for (const [h, r, a0] of [[4.6, 3.3, 0.3], [8.8, 3.7, 2.2], [12.8, 3.0, 4.2]]) {
    const px = Math.cos(a0) * 2.2, pz = Math.sin(a0) * 2.2;
    b.cyl(r, 0.35, px, h, pz, WOOD, { seg: 10 });
    for (let k = 0; k < 10; k++) {
      const a = k / 10 * Math.PI * 2;
      b.cyl(0.06, 1.0, px + Math.cos(a) * r * 0.95, h + 0.35, pz + Math.sin(a) * r * 0.95, '#5a3a22', { seg: 4 });
    }
    b.torus(r * 0.95, 0.06, px, h + 1.35, pz, '#5a3a22', { ts: 20, rs: 4 });
    b.cone(r * 1.15, 1.7, px, h + 2.4, pz, THATCH, { seg: 10 });
    for (let k = 0; k < 4; k++) b.cyl(0.08, 2.1, px + Math.cos(k * 1.57 + 0.78) * r * 0.8, h + 0.35, pz + Math.sin(k * 1.57 + 0.78) * r * 0.8, '#5a3a22', { seg: 4 });
    b.box(0.8, 1.0, 0.1, px + Math.cos(a0) * 1.3, h + 0.6, pz + Math.sin(a0) * 1.3, '#ffcf8a', { mat: 'glow', ry: -a0 + Math.PI / 2 });
  }
  // staircase spiral
  for (let k = 0; k < 26; k++) {
    const a = k * 0.42, h = 0.4 + k * 0.48;
    b.box(1.2, 0.12, 0.5, Math.cos(a) * 2.6, h, Math.sin(a) * 2.6, WOOD, { ry: -a });
  }
  // water wheel with bamboo flume
  b.push(4.5, 0, 3.2, 0.6);
  b.torus(1.6, 0.12, 0, 1.7, 0, WOOD, { rx: 0, ts: 18 });
  for (let k = 0; k < 8; k++) b.box(0.15, 3.2, 0.5, 0, 1.7, 0, WOOD, { rz: k * Math.PI / 8 });
  b.rod(0, 3.5, 0, -3.5, 9, -2.5, 0.18, BAMBOO);
  b.pop();
  b.pop();
  props.bulbLine([x - 3, 5.6, z + 3], [x + 3.5, 9.8, z - 2], 14, '#ffc066', 0.6, 0.12);
}

function tikiRoom(b, props, [x, z]) {
  b.push(x, 0, z, -Math.PI / 2);
  b.box(13, 0.7, 11, 0, 0, 0, '#9a8a72');
  b.box(9, 3.8, 7.5, 0, 0.7, 0, BAMBOO);
  for (let i = -4; i <= 4; i += 0.5) b.cyl(0.12, 3.8, i, 0.7, 3.78, '#b48a50', { seg: 5 });
  b.box(2, 2.6, 0.2, 0, 0.7, 3.85, '#3a2416');
  // layered thatch: flared eaves then a steep peak
  b.cyl(9.2, 1.2, 0, 4.0, 0, '#8f6a2e', { rt: 7.2, seg: 4, flat: true, ry: Math.PI / 4, sz: 0.85 });
  b.cyl(7.4, 2.4, 0, 5.1, 0, '#a37a34', { rt: 4.6, seg: 4, flat: true, ry: Math.PI / 4, sz: 0.85 });
  b.cyl(4.8, 2.6, 0, 7.4, 0, '#8f6a2e', { rt: 2.2, seg: 4, flat: true, ry: Math.PI / 4, sz: 0.85 });
  b.cone(2.3, 3.2, 0, 9.9, 0, '#a37a34', { seg: 4, flat: true, ry: Math.PI / 4, sz: 0.85 });
  b.cone(0.25, 2.6, 0, 12.8, 0, '#7a5434', { seg: 6 });
  // tiki totems
  const tc = ['#7a4a2a', '#8f5a2f', '#6a3e22'];
  for (let k = 0; k < 6; k++) {
    const tx = -5.5 + (k % 3) * 5.5, tz = k < 3 ? 6.2 : -6.2;
    b.cyl(0.55, 3.2, tx, 0.7, tz, tc[k % 3], { seg: 8 });
    b.box(0.85, 0.25, 0.3, tx, 2.9, tz + (tz > 0 ? 0.45 : -0.45), '#e8d8a0');
    b.box(0.3, 0.3, 0.3, tx - 0.22, 3.3, tz + (tz > 0 ? 0.5 : -0.5), '#2a8a8a');
    b.box(0.3, 0.3, 0.3, tx + 0.22, 3.3, tz + (tz > 0 ? 0.5 : -0.5), '#2a8a8a');
    b.cone(0.7, 0.7, tx, 3.9, tz, '#c84a2a', { seg: 8 });
  }
  // torches
  for (const [tx, tz] of [[-6, 4.5], [6, 4.5], [-6, -4.5], [6, -4.5]]) {
    b.cyl(0.1, 2.6, tx, 0.7, tz, '#5a3a22', { seg: 5 });
    b.cone(0.28, 0.7, tx, 3.3, tz, '#ff9a3a', { seg: 6, mat: 'neon' });
  }
  // birds on the roof edge
  const bc = ['#e83a3a', '#3a8ae8', '#f2d23a', '#3ac86a', '#e87a3a'];
  for (let k = 0; k < 10; k++) {
    const bx = -5.5 + k * 1.2;
    b.ell(bx, 4.5, 5.8, 0.25, 0.35, 0.22, bc[k % 5], { mat: 'gloss' });
    b.sph(0.14, bx, 4.95, 5.85, bc[(k + 2) % 5], { mat: 'gloss', w: 6, h: 4 });
  }
  b.pop();
}

function indyTemple(b, props, [x, z]) {
  b.push(x, 0, z, Math.PI / 2);
  const S = ['#c9a26b', '#bf955f', '#b58a55', '#aa7f4a'];
  b.box(18, 3, 14, 0, 0, 0, S[0]);
  b.box(15, 3, 11.5, 0, 3, -0.5, S[1]);
  b.box(11, 3, 9, 0, 6, -1, S[2]);
  b.box(6.5, 3.5, 6.5, 0, 9, -1.5, S[3]);
  b.pyr(6.5, 2.6, 6.5, 0, 12.5, -1.5, '#9c7342');
  // stairs
  for (let k = 0; k < 8; k++) b.box(4, 0.4, 1.0, 0, k * 0.4, 7 + 1.6 - k * 0.5, '#d1ad78');
  b.box(3.6, 4.2, 0.6, 0, 3, 5.6, '#2a1d14', { mat: 'nosnow' });
  // the stone face of Mara
  b.ell(0, 9.6, 5.4, 2.0, 1.7, 0.8, '#a88655');
  b.ell(-0.75, 10.0, 6.1, 0.45, 0.3, 0.2, '#f2f0e0');
  b.ell(0.75, 10.0, 6.1, 0.45, 0.3, 0.2, '#f2f0e0');
  b.sph(0.18, -0.75, 10.0, 6.28, '#24c8b0', { mat: 'neon' });
  b.sph(0.18, 0.75, 10.0, 6.28, '#24c8b0', { mat: 'neon' });
  b.box(1.6, 0.3, 0.3, 0, 8.8, 6.1, '#5a3a22');
  for (const cx of [-5.5, -3, 3, 5.5]) {
    b.cyl(0.55, 6, cx, 3, 5.2, '#c2995f', { seg: 8 });
    b.box(1.4, 0.5, 1.4, cx, 9, 5.2, '#b58a55');
  }
  // vines
  for (let k = 0; k < 14; k++) {
    const vx = rr(-7, 7), vy = rr(4, 10);
    b.rod(vx, vy, 6.0, vx + rr(-0.5, 0.5), vy - rr(1.5, 3), 6.2, 0.08, '#3f7a3a');
  }
  // torches
  for (const tx of [-2.6, 2.6]) {
    b.cyl(0.1, 2.0, tx, 3, 6.6, '#5a3a22', { seg: 5 });
    b.cone(0.25, 0.6, tx, 5.0, 6.6, '#ff9a3a', { seg: 6, mat: 'neon' });
  }
  // Indy's jeep
  b.push(7.5, 0, 9.5, 0.4);
  b.box(2.0, 1.0, 3.6, 0, 0.5, 0, '#5c6a3a');
  b.box(1.9, 0.6, 1.2, 0, 1.5, 0.9, '#4c5a32');
  b.box(1.8, 0.8, 0.1, 0, 1.5, 0.6, '#9ab8c8');
  for (const s of [-1, 1]) for (const zz of [-1.2, 1.2]) b.cyl(0.45, 0.3, s * 1.0, 0.45, zz, '#222222', { rz: Math.PI / 2, seg: 10 });
  b.pop();
  // crates
  for (let k = 0; k < 5; k++) b.box(1, 1, 1, -7 + k * 0.6, k > 2 ? 1 : 0, 9 + (k % 2), '#9a7444', { ry: k * 0.3 });
  b.pop();
}

function pirateFort(b, props, [x, z]) {
  const STONE = '#c2b092', STONE2 = '#a99878';
  b.push(x, 0, z);
  b.box(19, 1, 15, 0, 0, 0, STONE2);
  b.box(18, 7, 13, 0, 1, 0, STONE);
  for (let s = -8.6; s <= 8.6; s += 1.6) {
    b.box(0.9, 0.9, 0.8, s, 8, 6.2, STONE); b.box(0.9, 0.9, 0.8, s, 8, -6.2, STONE);
  }
  for (let s = -5.6; s <= 5.6; s += 1.6) {
    b.box(0.8, 0.9, 0.9, 8.6, 8, s, STONE); b.box(0.8, 0.9, 0.9, -8.6, 8, s, STONE);
  }
  // bastions at the corners
  for (const [bx, bz] of [[-9, 6.5], [9, 6.5], [-9, -6.5], [9, -6.5]]) b.cyl(2.2, 8.4, bx, 0.6, bz, STONE2, { seg: 8, flat: true });
  // watchtower
  b.cyl(2.6, 15, 5.5, 1, -2, STONE, { seg: 12 });
  b.cyl(3.0, 1.0, 5.5, 16, -2, STONE2, { seg: 12 });
  for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; b.box(0.8, 0.9, 0.8, 5.5 + Math.cos(a) * 2.7, 17, -2 + Math.sin(a) * 2.7, STONE); }
  b.cyl(0.08, 5, 5.5, 17, -2, '#5a4a3a', { seg: 4 });
  b.box(2.0, 1.2, 0.05, 6.5, 20.6, -2, '#141414');
  b.sph(0.25, 6.4, 21.25, -1.96, '#f2f2f2', { w: 6, h: 5 });
  b.box(0.7, 0.08, 0.03, 6.4, 20.85, -1.95, '#f2f2f2', { rz: 0.6 });
  b.box(0.7, 0.08, 0.03, 6.4, 20.85, -1.95, '#f2f2f2', { rz: -0.6 });
  // cannons on the south wall facing the lagoon
  for (const cx of [-6, -2, 2]) {
    b.cyl(0.32, 2.4, cx, 6.2, 6.4, '#202020', { rx: Math.PI / 2, seg: 10, mat: 'gloss' });
    b.box(1, 0.6, 1.2, cx, 5.6, 6.0, '#5a3a22');
  }
  // water gate (boats sail into the ride)
  b.box(5, 4.4, 0.8, -4, 0.6, 6.6, '#1a1412', { mat: 'nosnow' });
  b.cyl(2.5, 0.8, -4, 5.0, 6.6, '#1a1412', { rx: Math.PI / 2, seg: 14, mat: 'nosnow' });
  b.torus(2.85, 0.25, -4, 5.0, 7.3, '#b8a07a', { rx: 0, arc: Math.PI, ts: 14 });
  b.box(6.2, 1.2, 0.3, -4, 8.2, 7.2, '#3a2418');
  b.pop();
  props.bulbLine([x - 9, 9, z + 7], [x + 9, 9, z + 7], 20, '#ffb050', 0.5, 0.11);
  const sign = makeSign(['加勒比海盗', 'Pirates of the Caribbean'], { w: 5.8, h: 1.1, bg: '#2b1a12', fg: '#f3d68a' });
  sign.position.set(x - 4, 8.8, z + 7.4);
  return sign;
}

export function pirateShip(sailColor = '#2a2624', flag = true) {
  const b = new Builder();
  const HULL = '#3a2618', HULL2 = '#5a3a22';
  b.box(3.6, 2.2, 11, 0, 0, 0, HULL);
  b.prism(3.6, 1.6, 2.6, 0, 0, 6.3, HULL, { rx: Math.PI / 2 });
  b.box(3.8, 0.35, 11.2, 0, 2.2, 0, '#c9a24a', { mat: 'metal' });
  b.box(3.6, 2.4, 3.2, 0, 2.2, -4.2, HULL2);
  b.box(3.9, 0.3, 3.5, 0, 4.6, -4.2, '#c9a24a', { mat: 'metal' });
  for (const s of [-1, 1]) {
    for (let k = -3; k <= 3; k += 1.4) b.cyl(0.18, 0.6, s * 1.8, 1.2, k, '#151515', { rz: s * Math.PI / 2, seg: 8 });
    b.box(0.1, 0.5, 2.6, s * 1.85, 3.2, -4.2, '#ffd08a', { mat: 'glow' });
  }
  // masts & sails
  const masts = [[0, 3.2, 10.5], [-3.8, 2.5, 8], [3.6, 2.4, 8]];
  for (const [mz, , h] of masts) {
    b.cyl(0.16, h, 0, 2.2, mz + 0.5, '#4a3020', { seg: 6 });
    for (const [sy, sw, sh] of [[2.2 + h * 0.35, 3.4, 2.4], [2.2 + h * 0.68, 2.6, 1.8]]) {
      b.box(sw, sh, 0.12, 0, sy, mz + 0.5, sailColor, { rx: 0.08 });
      b.cyl(0.07, sw + 0.6, -(sw + 0.6) / 2, sy + sh, mz + 0.5, '#4a3020', { rz: -Math.PI / 2, seg: 4 });
    }
  }
  b.rod(0, 3, 6.5, 0, 4.5, 9.8, 0.1, '#4a3020');
  if (flag) {
    b.box(1.3, 0.8, 0.04, 0.65, 13.2, 1.0, '#111111');
    b.sph(0.18, 0.6, 13.65, 1.03, '#f0f0f0', { w: 6, h: 5 });
  }
  return b.build({ name: 'ship' });
}

function jungleBoat(stripe) {
  const b = new Builder();
  b.box(2.2, 0.9, 6.0, 0, 0, 0, '#e8e2d0');
  b.box(2.24, 0.25, 6.04, 0, 0.6, 0, '#5a7a4a');
  b.prism(2.2, 0.9, 1.4, 0, 0, 3.6, '#e8e2d0', { rx: Math.PI / 2 });
  for (const s of [-1, 1]) for (const zz of [-2.5, 2.5]) b.cyl(0.05, 1.8, s * 1.0, 0.9, zz, '#d9cfb0', { seg: 4 });
  for (let k = 0; k < 8; k++) b.box(2.5 / 8, 0.08, 6.0, -1.25 + (k + 0.5) * 2.5 / 8, 2.7, 0, k % 2 ? stripe : '#f4efe4');
  const cs = ['#d8483a', '#3a6ad8', '#f2c94c', '#3aa86a', '#e8e8e8', '#c45ab8'];
  for (let k = 0; k < 6; k++) {
    const zz = -2.2 + k * 0.85;
    b.sph(0.2, -0.5, 1.6, zz, '#f2c9a0', { w: 6, h: 5 }); b.box(0.45, 0.5, 0.3, -0.5, 1.0, zz, cs[k % 6]);
    b.sph(0.2, 0.5, 1.6, zz, '#c99a72', { w: 6, h: 5 }); b.box(0.45, 0.5, 0.3, 0.5, 1.0, zz, cs[(k + 3) % 6]);
  }
  return b.build({ name: 'jungleBoat' });
}

function elephant(b, x, z, ry, s = 1) {
  b.push(x, 0, z, ry, s);
  b.ell(0, 1.9, 0, 1.0, 1.0, 1.6, '#8e8e94');
  for (const [lx, lz] of [[-0.55, 0.9], [0.55, 0.9], [-0.55, -0.9], [0.55, -0.9]]) b.cyl(0.32, 1.4, lx, 0, lz, '#86868c', { seg: 8 });
  b.ell(0, 2.6, 1.6, 0.75, 0.75, 0.7, '#8e8e94');
  b.ell(-0.75, 2.6, 1.4, 0.12, 0.65, 0.55, '#8a8288');
  b.ell(0.75, 2.6, 1.4, 0.12, 0.65, 0.55, '#8a8288');
  b.rod(0, 2.4, 2.2, 0, 3.2, 3.0, 0.2, '#8e8e94');
  b.rod(0, 3.2, 3.0, 0, 4.0, 3.1, 0.16, '#8e8e94');
  b.cone(0.08, 0.6, 0.3, 2.3, 2.2, '#f4f0e6', { rx: 1.2, seg: 5 });
  b.cone(0.08, 0.6, -0.3, 2.3, 2.2, '#f4f0e6', { rx: 1.2, seg: 5 });
  b.pop();
}

function prideRock(b, [x, z]) {
  b.push(x, 0, z);
  b.ico(5.5, 0, 1.0, 0, '#a08868', { sy: 0.7, d: 1 });
  b.ico(3.8, -1.2, 4.5, -0.6, '#958060', { sy: 0.9, d: 1 });
  b.box(6.5, 0.9, 2.6, 2.3, 6.3, 0.3, '#a8906e', { rz: 0.18, ry: 0.3 });
  b.ico(1.8, 3.6, 2.5, 1.8, '#8c7858', { d: 0 });
  // waterfall rocks
  b.ico(2.2, -4.2, 1.6, 2.6, '#7c7468', { d: 0 });
  b.pop();
}

function carpets(ctx, [x, z]) {
  const { b, world, props } = ctx;
  b.push(x, 0, z);
  b.cyl(7.6, 0.5, 0, 0, 0, '#2f6fb0', { seg: 24 });
  b.cyl(7.0, 0.55, 0, 0, 0, '#e8d6a8', { seg: 24 });
  b.cyl(1.6, 2.2, 0, 0.5, 0, '#d4a83a', { seg: 12, mat: 'metal' });
  // giant genie lamp on top of the center column
  b.lathe([[0, 0], [1.6, 0.2], [2.2, 1.0], [1.4, 1.6], [0.5, 1.8], [0.3, 2.4], [0.6, 2.6], [0, 2.9]], 0, 2.7, 0, '#e7bd57', { mat: 'metal', seg: 20 });
  b.rod(1.8, 3.6, 0, 3.6, 4.6, 0, 0.25, '#e7bd57', { mat: 'metal' });
  b.torus(0.6, 0.12, -2.1, 3.8, 0, '#e7bd57', { rx: 0, mat: 'metal' });
  // camels
  for (const s of [-1, 1]) {
    b.push(s * 9, 0, 0, s > 0 ? -Math.PI / 2 : Math.PI / 2);
    b.ell(0, 1.8, 0, 0.6, 0.6, 1.2, '#c8a06a');
    b.sph(0.55, 0, 2.5, 0, '#c8a06a');
    for (const [lx, lz] of [[-0.3, 0.7], [0.3, 0.7], [-0.3, -0.7], [0.3, -0.7]]) b.cyl(0.13, 1.4, lx, 0, lz, '#b8905a', { seg: 6 });
    b.rod(0, 2, 1.0, 0, 3.2, 1.6, 0.2, '#c8a06a');
    b.ell(0, 3.3, 1.9, 0.25, 0.25, 0.45, '#c8a06a');
    b.pop();
  }
  b.pop();
  // rotating carpets
  const rb = new Builder();
  rb.cyl(0.45, 6.5, 0, 0, 0, '#d4a83a', { seg: 8, mat: 'metal' });
  const hub = rb.build({ name: 'carpetHub' });
  hub.position.set(x, 0, z);
  world.add(hub);
  const cols = [['#c8283a', '#f2c94c'], ['#2f6fb0', '#f2c94c'], ['#6a2fa0', '#e8b84a'], ['#2a8a5a', '#f0e0a0']];
  const arms = [];
  for (let i = 0; i < 8; i++) {
    const cb = new Builder();
    const [c1, c2] = cols[i % 4];
    cb.box(1.7, 0.16, 2.6, 0, 0, 0, c1);
    cb.box(1.3, 0.17, 2.2, 0, 0.005, 0, c2);
    cb.box(1.0, 0.18, 1.8, 0, 0.01, 0, c1);
    cb.sph(0.2, 0, 0.75, 0.2, '#f2c9a0', { w: 6, h: 5 });
    cb.box(0.45, 0.55, 0.3, 0, 0.18, 0.2, ['#e8483a', '#3a6ad8', '#f2c94c', '#3aa86a'][i % 4]);
    cb.rod(0, 0.1, 0, -4.2, 2.0, 0, 0.08, '#d4a83a', { mat: 'metal' });
    const carpet = cb.build({ name: 'carpet' });
    const pivot = new THREE.Object3D();
    pivot.position.set(x, 0, z);
    carpet.position.set(4.6, 3, 0);
    pivot.add(carpet);
    pivot.rotation.y = i / 8 * Math.PI * 2;
    world.add(pivot);
    arms.push({ pivot, carpet, ph: i * 0.9 });
  }
  ctx.anims.push((dt, t) => {
    for (const a of arms) {
      a.pivot.rotation.y += dt * 0.45;
      a.carpet.position.y = 3 + Math.sin(t * 0.7 + a.ph) * 1.4;
      a.carpet.rotation.z = Math.sin(t * 0.7 + a.ph + 1) * 0.08;
    }
  });
}

function waterfall(ctx, x, z, h, w, ry) {
  const c = document.createElement('canvas'); c.width = 64; c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = 'rgba(210,235,255,0.55)'; g.fillRect(0, 0, 64, 256);
  for (let i = 0; i < 90; i++) {
    g.fillStyle = `rgba(255,255,255,${0.3 + Math.random() * 0.6})`;
    g.fillRect(Math.random() * 64, Math.random() * 256, 1 + Math.random() * 2, 10 + Math.random() * 40);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  const m = new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, opacity: 0.85 });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
  mesh.position.set(x, h / 2 + 0.2, z);
  mesh.rotation.y = ry;
  ctx.world.add(mesh);
  ctx.anims.push((dt) => { t.offset.y += dt * 1.2; });
  for (let k = 0; k < 2; k++) ctx.anims.push((dt) => { if (Math.random() < dt * 6) ctx.smoke.emit(x + (Math.random() - 0.5) * w, 0.6, z, 1.2, 1, 0.8, 1.4, 1.2); });
  return mesh;
}

export function buildAdventure(ctx) {
  const { b, props, world } = ctx;
  treehouse(b, props, A.treehouse); ctx.occ(A.treehouse[0], A.treehouse[1], 8);
  tikiRoom(b, props, A.tiki); ctx.occ(A.tiki[0], A.tiki[1], 7.5);
  indyTemple(b, props, A.indy); ctx.occ(A.indy[0], A.indy[1], 10);
  world.add(pirateFort(b, props, A.pirates)); ctx.occRect(A.pirates[0] - 11, A.pirates[1] - 8, A.pirates[0] + 11, A.pirates[1] + 8);
  carpets(ctx, A.aladdin); ctx.occ(A.aladdin[0], A.aladdin[1], 10);
  prideRock(b, A.jungle);

  // pirate ship docked in its lagoon
  const ship = pirateShip('#2a2624');
  ship.position.set(A.pirateLagoon.x - 1, 0.1, A.pirateLagoon.z);
  ship.rotation.y = Math.PI / 2;
  world.add(ship);
  ctx.anims.push((dt, t) => { ship.rotation.z = Math.sin(t * 0.6) * 0.025; ship.position.y = 0.1 + Math.sin(t * 0.8) * 0.08; });

  // Jungle Cruise boats on the jungle river
  const curve = jungleCurve();
  const boats = ['#3f8a4a', '#e0b23a', '#c8483a'].map((s) => { const bt = jungleBoat(s); world.add(bt); return bt; });
  const p = new THREE.Vector3(), tg = new THREE.Vector3();
  const L = curve.getLength();
  ctx.anims.push((dt, t) => {
    boats.forEach((bt, i) => {
      const u = ((t * 1.6 / L) + i / 3) % 1;
      curve.getPointAt(u, p); curve.getTangentAt(u, tg);
      bt.position.set(p.x, 0.15 + Math.sin(t * 2 + i) * 0.05, p.z);
      bt.rotation.y = Math.atan2(tg.x, tg.z);
    });
  });
  // dock pavilion
  b.push(-40.8, 0, 61, Math.PI / 2);
  b.box(6, 0.5, 4, 0, 0, 0, '#8a6a44');
  for (const [dx, dz] of [[-2.6, -1.6], [2.6, -1.6], [-2.6, 1.6], [2.6, 1.6]]) b.cyl(0.15, 3.2, dx, 0.5, dz, '#6a4a2a', { seg: 5 });
  b.prism(7, 2.4, 5, 0, 3.6, 0, THATCH, { ry: Math.PI / 2 });
  b.pop();
  const js = makeSign(['丛林巡航', 'Jungle Cruise'], { w: 4.6, h: 1.0, bg: '#2f4a28', fg: '#f6e3a0' });
  js.position.set(-39.2, 3.2, 61); js.rotation.y = Math.PI / 2; world.add(js);
  // animals
  elephant(b, -70, 51, 0.8, 0.9);
  elephant(b, -74, 70, 2.4, 1.0);
  const hippos = [];
  for (const [hx, hz] of [[-49, 75], [-66, 47.5], [-76.5, 61]]) {
    const hb = new Builder();
    hb.ell(0, 0, 0, 0.9, 0.55, 1.2, '#7c6a78');
    hb.sph(0.18, -0.4, 0.45, 0.6, '#7c6a78'); hb.sph(0.18, 0.4, 0.45, 0.6, '#7c6a78');
    hb.sph(0.12, -0.3, 0.38, 0.95, '#ffffff', { w: 6, h: 4 }); hb.sph(0.12, 0.3, 0.38, 0.95, '#ffffff', { w: 6, h: 4 });
    hb.sph(0.07, -0.3, 0.4, 1.05, '#111111', { w: 5, h: 4 }); hb.sph(0.07, 0.3, 0.4, 1.05, '#111111', { w: 5, h: 4 });
    const h = hb.build({ name: 'hippo' });
    h.position.set(hx, 0, hz); h.rotation.y = rand() * 6;
    world.add(h);
    hippos.push(h);
  }
  ctx.anims.push((dt, t) => hippos.forEach((h, i) => { h.position.y = -0.15 + Math.max(-0.6, Math.sin(t * 0.5 + i * 2.1) * 0.5); }));
  // crocodile on the bank
  b.push(-46, 0, 49, 2.2);
  b.ell(0, 0.3, 0, 0.45, 0.25, 1.6, '#4a6a3a');
  b.ell(0, 0.3, 1.8, 0.3, 0.18, 0.7, '#4a6a3a');
  b.rod(0, 0.3, -1.4, 0.3, 0.2, -3.0, 0.2, '#4a6a3a');
  b.pop();
  // giraffe on the island
  b.push(-63, 0, 58, 0.5);
  b.ell(0, 2.6, 0, 0.55, 0.6, 1.0, '#e0b060');
  for (const [lx, lz] of [[-0.3, 0.6], [0.3, 0.6], [-0.3, -0.6], [0.3, -0.6]]) b.cyl(0.1, 2.3, lx, 0, lz, '#d8a858', { seg: 5 });
  b.rod(0, 2.9, 0.7, 0, 5.4, 1.4, 0.2, '#e0b060');
  b.ell(0, 5.5, 1.6, 0.22, 0.25, 0.5, '#e0b060');
  b.pop();
  waterfall(ctx, -64, 66.7, 4.5, 2.4, 0);

  // jungle planting
  for (let k = 0; k < 70; k++) {
    const a = rand() * Math.PI * 2, r = rr(0, 1);
    const jx = -60 + Math.cos(a) * (8 + r * 16), jz = 63 + Math.sin(a) * (6 + r * 14);
    if (ctx.maskAt(jx, jz) < 200 || ctx.isOcc(jx, jz)) continue;
    props.add(rand() < 0.6 ? 'palm' : (rand() < 0.5 ? 'bush' : 'round'), jx, jz, { s: rr(0.8, 1.3) });
  }
  // Adventureland gateway
  b.push(-19, 0, 32.5, Math.PI / 2 + 0.25);
  for (const s of [-1, 1]) { b.cyl(0.35, 6, s * 3.6, 0, 0, BAMBOO, { seg: 8 }); b.cone(0.6, 0.9, s * 3.6, 6, 0, THATCH, { seg: 8 }); }
  b.box(8.4, 0.5, 0.5, 0, 5, 0, '#8a6a3a');
  b.box(8.8, 0.25, 0.7, 0, 5.5, 0, THATCH);
  b.pop();
  const gs = makeSign(['探险世界', 'Adventureland'], { w: 4.6, h: 1.0, bg: '#5a3a1a', fg: '#ffe3a0' });
  gs.position.set(-19, 4.25, 32.5); gs.rotation.y = Math.PI / 2 + 0.25; world.add(gs);
  for (const [tx, tz] of [[-22, 29], [-22, 36]]) {
    b.cyl(0.1, 2.4, tx, 0, tz, '#5a3a22', { seg: 5 });
    b.cone(0.25, 0.6, tx, 2.4, tz, '#ff9a3a', { seg: 6, mat: 'neon' });
  }

  ctx.poi({ id: 'adventureland', name: '探险世界', en: 'Adventureland', land: '探险世界', x: -45, y: 4, z: 55, dist: 95, pitch: 0.55, yaw: -0.6, group: true });
  ctx.poi({ id: 'treehouse', name: '瑞士家庭树屋', en: 'Swiss Family Treehouse', land: '探险世界', x: A.treehouse[0], y: 10, z: A.treehouse[1], dist: 42, pitch: 0.25, yaw: 0.9 });
  ctx.poi({ id: 'tiki', name: '魔幻提基屋', en: 'Enchanted Tiki Room', land: '探险世界', x: A.tiki[0], y: 5, z: A.tiki[1], dist: 30, pitch: 0.3, yaw: -1.2 });
  ctx.poi({ id: 'jungle', name: '丛林巡航', en: 'Jungle Cruise', land: '探险世界', x: -60, y: 2, z: 63, dist: 52, pitch: 0.55, yaw: 1.2 });
  ctx.poi({ id: 'prideRock', name: '荣耀石（狮子王）', en: 'Pride Rock', land: '探险世界', x: -60, y: 6, z: 63, dist: 22, pitch: 0.3, yaw: 0.6 });
  ctx.poi({ id: 'indy', name: '夺宝奇兵神庙', en: 'Indiana Jones Adventure', land: '探险世界', x: A.indy[0], y: 6, z: A.indy[1], dist: 40, pitch: 0.3, yaw: 1.6 });
  ctx.poi({ id: 'aladdin', name: '阿拉丁飞毯', en: 'Magic Carpets of Aladdin', land: '探险世界', x: A.aladdin[0], y: 3, z: A.aladdin[1], dist: 28, pitch: 0.4, yaw: 0.4 });
  ctx.poi({ id: 'pirates', name: '加勒比海盗', en: 'Pirates of the Caribbean', land: '探险世界', x: A.pirates[0], y: 6, z: A.pirates[1] + 6, dist: 46, pitch: 0.3, yaw: 0.2 });
}
