// Mickey's Toontown: Mickey's and Minnie's houses, Goofy's playhouse,
// Chip 'n' Dale treehouse, Donald's boat, Gadget's Go Coaster, and the
// Duffy & Friends gazebo.
import * as THREE from 'three';
import { Builder } from '../core/builder.js';
import { makeSign } from '../core/signs.js';
import { A } from './layout.js';
import { coaster, mound } from './rides.js';
import { faceTo } from '../core/config.js';
import { rr } from '../core/rng.js';

const WIN = '#ffd49a';

function toonHouse(b, o) {
  const { w, d, h, wall, roof, trim, door } = o;
  // slightly wonky walls
  b.box(w, h, d, 0, 0, 0, wall, { rz: 0.03 });
  b.box(w + 0.4, 0.3, d + 0.4, 0, h - 0.1, 0, trim, { rz: 0.03 });
  // curvy roof: squashed dome on a prism
  b.prism(w + 1.2, h * 0.55, d + 1.0, 0, h, 0, roof, { ry: Math.PI / 2, rz: -0.04 });
  b.dome(w * 0.32, w * 0.18, h + h * 0.35, 0, roof, { sy: 0.8 });
  b.box(1.4, 2.6, 0.2, 0, 0, d / 2 + 0.05, door);
  b.sph(0.12, 0.45, 1.3, d / 2 + 0.2, '#f2c94c', { mat: 'metal' });
}

function mickeyHouse(ctx, [x, z]) {
  const { b, props } = ctx;
  const ry = faceTo(x, z, 53, -72);
  b.push(x, 0, z, ry);
  toonHouse(b, { w: 8, d: 7, h: 4.6, wall: '#f6d55c', roof: '#d8423a', trim: '#ffffff', door: '#2f6a3a' });
  // round Mickey-ears window
  b.cyl(0.85, 0.2, 2.4, 2.5, 3.52, '#111111', { rx: Math.PI / 2, seg: 16 });
  b.cyl(0.5, 0.2, 1.6, 3.4, 3.52, '#111111', { rx: Math.PI / 2, seg: 12 });
  b.cyl(0.5, 0.2, 3.2, 3.4, 3.52, '#111111', { rx: Math.PI / 2, seg: 12 });
  b.cyl(0.7, 0.22, 2.4, 2.5, 3.53, WIN, { rx: Math.PI / 2, seg: 16, mat: 'glow' });
  b.box(1.2, 1.2, 0.15, -2.6, 1.6, 3.55, WIN, { mat: 'glow' });
  // chimney (bent)
  b.cyl(0.6, 3, -2.5, 5, -1, '#b8433a', { seg: 8, rz: 0.15 });
  // mailbox & fence
  b.cyl(0.08, 1.1, 3.6, 0, 6, '#5a3a22', { seg: 4 });
  b.box(0.5, 0.45, 0.8, 3.6, 1.1, 6, '#2f6fd8', { mat: 'gloss' });
  for (let k = -4; k <= 4; k += 0.7) b.box(0.12, 1.0, 0.08, k, 0, 7.2, '#ffffff');
  b.box(8.4, 0.12, 0.1, 0, 0.75, 7.2, '#ffffff');
  b.pop();
  // Mickey-head hedge
  const hx = x + Math.sin(ry) * 9 - Math.cos(ry) * 3, hz = z + Math.cos(ry) * 9 + Math.sin(ry) * 3;
  props.add('topiary', hx, hz, { s: 1.0, ry });
  ctx.occ(x, z, 6);
  return ry;
}

function minnieHouse(ctx, [x, z]) {
  const { b } = ctx;
  const ry = faceTo(x, z, 64, -68);
  b.push(x, 0, z, ry);
  toonHouse(b, { w: 7.5, d: 6.5, h: 4.4, wall: '#f4b6d2', roof: '#a86ad8', trim: '#ffffff', door: '#e85a9a' });
  // heart windows
  for (const wx of [-2.4, 2.4]) {
    b.sph(0.42, wx - 0.3, 2.2, 3.3, '#ff6a9a', { mat: 'glow', sz: 0.3 });
    b.sph(0.42, wx + 0.3, 2.2, 3.3, '#ff6a9a', { mat: 'glow', sz: 0.3 });
    b.cone(0.62, 0.8, wx, 2.05, 3.3, '#ff6a9a', { rx: Math.PI, seg: 8, mat: 'glow', sz: 0.3 });
  }
  // polka-dot bow on the roof
  b.ell(-0.9, 7.6, 0, 0.9, 0.6, 0.3, '#e8283a', { az: 0.4 });
  b.ell(0.9, 7.6, 0, 0.9, 0.6, 0.3, '#e8283a', { az: -0.4 });
  b.sph(0.35, 0, 7.6, 0.1, '#e8283a');
  for (let k = 0; k < 8; k++) b.sph(0.1, rr(-1.4, 1.4), 7.6 + rr(-0.4, 0.4), 0.32, '#ffffff', { w: 5, h: 4 });
  // picket fence & flower beds
  for (let k = -3.8; k <= 3.8; k += 0.6) b.box(0.12, 0.9, 0.08, k, 0, 6.6, '#ffffff');
  for (let k = 0; k < 14; k++) b.sph(0.22, rr(-3.5, 3.5), 0.25, rr(4.5, 6.2), ['#ff6a9a', '#ffffff', '#c86aff', '#ffd25a'][k % 4], { w: 5, h: 4 });
  b.pop();
  ctx.occ(x, z, 5.5);
}

function goofyHouse(ctx, [x, z]) {
  const { b } = ctx;
  const ry = faceTo(x, z, 53, -78);
  b.push(x, 0, z, ry);
  b.box(7, 5, 6, 0, 0, 0, '#6aa84a', { rz: -0.06 });
  b.prism(8.2, 3.2, 7, 0.4, 5, 0, '#e87a2a', { ry: Math.PI / 2, rz: 0.12 });
  b.cyl(0.55, 3.4, -2.2, 6, 0, '#c84a2a', { seg: 8, rz: -0.35 });
  b.box(1.4, 2.4, 0.2, 0.6, 0, 3.05, '#f2c94c');
  b.box(1.4, 1.4, 0.15, -2, 2, 3.03, WIN, { mat: 'glow', rz: 0.15 });
  // giant "how-to-play" bouncy pumpkin patch
  for (let k = 0; k < 5; k++) b.sph(0.8, rr(-3, 3), 0.55, rr(4.5, 6.5), '#f08a2a', { sy: 0.7, mat: 'gloss' });
  // silo
  b.cyl(1.6, 7, 4.8, 0, -1, '#d8c8a0', { seg: 12 });
  b.dome(1.7, 4.8, 7, -1, '#c84a2a');
  b.pop();
  ctx.occ(x, z, 6);
}

function chipTree(ctx, [x, z]) {
  const { b } = ctx;
  b.cyl(2.4, 8, x, 0, z, '#7a5434', { rt: 1.6, seg: 10 });
  for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2; b.rod(x, 7, z, x + Math.cos(a) * 4, 9.5, z + Math.sin(a) * 4, 0.4, '#7a5434'); }
  b.sph(5.5, x, 11.5, z, '#d8862a', { sy: 0.6, mat: 'leaf' });
  b.sph(3.5, x + 2, 13, z - 1, '#c86a2a', { sy: 0.6, mat: 'leaf' });
  // acorn-shaped house in the branches
  b.ell(x + 2.2, 6.5, z + 1.8, 1.3, 1.5, 1.3, '#a86a3a');
  b.dome(1.5, x + 2.2, 7.4, z + 1.8, '#6a4020', { sy: 0.6 });
  b.cyl(0.12, 0.6, x + 2.2, 8.2, z + 1.8, '#6a4020', { seg: 5 });
  b.box(0.6, 0.9, 0.1, x + 2.2, 5.9, z + 3.1, WIN, { mat: 'glow' });
  // twisty slide
  const pts = [];
  for (let i = 0; i <= 20; i++) { const a = i * 0.45; pts.push(new THREE.Vector3(x + Math.cos(a) * 3.2, 5.8 - i * 0.27, z + Math.sin(a) * 3.2)); }
  b.tube(pts, 0.35, '#f2c94c', { seg: 60, mat: 'gloss' });
  ctx.occ(x, z, 5);
}

function donaldBoat(ctx, [x, z]) {
  const { b, world } = ctx;
  const bb = new Builder();
  bb.box(2.8, 1.4, 6.5, 0, 0, 0, '#ffffff', { mat: 'gloss' });
  bb.prism(2.8, 1.4, 1.6, 0, 0, 4.0, '#ffffff', { rx: Math.PI / 2, mat: 'gloss' });
  bb.box(2.84, 0.35, 6.54, 0, 0.9, 0, '#2f6fd8', { mat: 'gloss' });
  bb.box(2.2, 1.8, 2.6, 0, 1.4, -1.0, '#f4f0e6');
  bb.box(2.25, 0.6, 2.65, 0, 2.3, -1.0, '#9ad8f8', { mat: 'glow' });
  bb.box(2.6, 0.25, 3.0, 0, 3.2, -1.0, '#2f6fd8', { mat: 'gloss' });
  bb.cyl(0.25, 1.6, 0, 3.4, -1.6, '#e8c43a', { seg: 8 });
  bb.torus(0.55, 0.15, 1.45, 1.6, 0.8, '#e8423a', { rx: 0, ry: Math.PI / 2 });
  const boat = bb.build({ name: 'missDaisy' });
  boat.position.set(x, 0.2, z);
  boat.rotation.y = 0.9;
  world.add(boat);
  ctx.anims.push((dt, t) => { boat.rotation.z = Math.sin(t * 0.8) * 0.03; boat.position.y = 0.15 + Math.sin(t * 1.1) * 0.06; });
  ctx.occ(x, z, 7);
}

function gadget(ctx, [x, z]) {
  const { b } = ctx;
  mound(b, x, 0, z, 5, 3.4, 4.5, '#9a7a4a');
  b.box(2.4, 2.6, 2.4, x - 1, 0, z - 6.5, '#e87a2a');
  b.cone(1.8, 1.6, x - 1, 2.6, z - 6.5, '#5aa0e8', { seg: 8 });
  const pts = [[6, 1.5, 0], [4, 3.5, 5], [-2, 5.5, 6], [-6.5, 4.5, 1], [-5, 2.5, -4], [1, 3.8, -6], [6, 2.5, -4]];
  coaster(ctx, {
    ox: x, oz: z, pts, rail: '#f2a23a', spine: '#c86a2a', support: '#7a8a9a', width: 0.9,
    nCars: 4, spacing: 1.5, speed: 6,
    carFn: () => {
      const cb = new Builder();
      cb.ell(0, 0.45, 0, 0.55, 0.45, 0.75, '#a86a3a');
      cb.dome(0.58, 0, 0.62, 0, '#6a4020', { sy: 0.5 });
      cb.sph(0.16, 0, 1.05, 0.2, '#f2c9a0', { w: 6, h: 5 });
      return cb.build({ name: 'acorn' });
    },
  });
  ctx.occ(x, z, 8.5);
}

function duffyGazebo(ctx, [x, z]) {
  const { b, props } = ctx;
  b.cyl(5, 0.5, x, 0, z, '#f6efe2', { seg: 8, flat: true });
  for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2 + Math.PI / 8; b.cyl(0.16, 3.6, x + Math.cos(a) * 4.4, 0.5, z + Math.sin(a) * 4.4, '#ffffff', { seg: 6 }); }
  b.cyl(5.3, 0.4, x, 4.1, z, '#ffffff', { seg: 8, flat: true });
  b.cone(5.6, 2.8, x, 4.5, z, '#f4a6c0', { seg: 8, flat: true });
  b.sph(0.35, x, 7.4, z, '#e7bd57', { mat: 'metal' });
  for (let k = 0; k < 24; k++) { const a = k / 24 * Math.PI * 2; props.bulb(x + Math.cos(a) * 5.4, 4.35, z + Math.sin(a) * 5.4, '#ffd6e8', 0.12); }
  const s = makeSign(['达菲和他的朋友们', 'Duffy & Friends'], { w: 4.6, h: 0.9, bg: '#f4a6c0', fg: '#5a2a4a', border: '#ffffff' });
  s.position.set(x, 1.2, z + 5.4); s.rotation.y = 0;
  ctx.world.add(s);
  ctx.occ(x, z, 5.5);
}

export function buildToontown(ctx) {
  const { b, world, props } = ctx;
  mickeyHouse(ctx, A.mickeyHouse);
  minnieHouse(ctx, A.minnieHouse);
  goofyHouse(ctx, A.goofyHouse);
  chipTree(ctx, A.chipTree);
  donaldBoat(ctx, A.donaldPond);
  gadget(ctx, A.gadget);
  duffyGazebo(ctx, A.duffy);
  // Toontown gateway arch & wobbly lamps
  b.push(48.5, 0, -59, -0.8);
  for (const s of [-1, 1]) b.cyl(0.45, 5.2, s * 3.6, 0, 0, s < 0 ? '#e8423a' : '#2f6fd8', { seg: 10, rz: s * 0.08 });
  b.box(8.4, 1.0, 0.6, 0, 5.0, 0, '#f6d55c', { rz: 0.05 });
  b.pop();
  const gs = makeSign(['米奇卡通城', "Mickey's Toontown"], { w: 4.6, h: 0.9, bg: '#f6d55c', fg: '#c8283a', border: '#2f6fd8' });
  gs.position.set(48.5 + Math.sin(-0.8) * 0.35, 5.5, -59 + Math.cos(-0.8) * 0.35); gs.rotation.y = -0.8; world.add(gs);
  for (const [lx, lz] of [[50, -70], [56, -80], [57, -66], [66, -72]]) {
    b.cyl(0.12, 3.2, lx, 0, lz, '#2f6fd8', { seg: 6, rz: 0.12 });
    b.sph(0.45, lx + 0.4, 3.4, lz, '#ffd86a', { mat: 'glow' });
  }
  // a toon fountain
  b.cyl(2.2, 0.6, 62, 0, -84, '#5aa0e8', { seg: 16 });
  b.cyl(0.4, 2.0, 62, 0.6, -84, '#f6d55c', { seg: 8 });
  b.sph(0.8, 62, 2.9, -84, '#e8423a', { mat: 'gloss' });
  ctx.occ(62, -84, 2.5);

  const P = (id, name, en, pos, y, dist, pitch, yaw, extra = {}) => ctx.poi({ id, name, en, land: '米奇卡通城', x: pos[0], y, z: pos[1], dist, pitch, yaw, ...extra });
  P('toontown', '米奇卡通城', "Mickey's Toontown", [60, -72], 3, 80, 0.6, -0.5, { group: true });
  P('mickeyhouse', '米奇的家', "Mickey's House", A.mickeyHouse, 3, 24, 0.3, -1.0);
  P('minniehouse', '米妮的家', "Minnie's House", A.minnieHouse, 3, 22, 0.3, -1.4);
  P('goofyhouse', '高飞游乐屋', "Goofy's Playhouse", A.goofyHouse, 3, 22, 0.3, -0.6);
  P('chiptree', '奇奇蒂蒂树屋', "Chip 'n' Dale Treehouse", A.chipTree, 6, 24, 0.25, -0.3);
  P('donaldboat', '唐老鸭的船', "Donald's Boat", A.donaldPond, 2, 20, 0.35, -0.8);
  P('gadget', '橡果过山车', "Gadget's Go Coaster", A.gadget, 3, 26, 0.4, -1.4);
  P('duffy', '达菲和朋友们', 'Duffy & Friends', A.duffy, 2, 18, 0.3, 0.2);
}
