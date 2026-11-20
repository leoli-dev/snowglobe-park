// Frontierland + Liberty Square: Rivers of America with the Mark Twain
// riverboat and a tall ship, Tom Sawyer Island, Big Thunder Mountain,
// Splash Mountain, the western row with Country Bear Jamboree, the Haunted
// Mansion with its ghosts, the Liberty Tree and Hall of Presidents.
import * as THREE from 'three';
import { Builder } from '../core/builder.js';
import { MATS } from '../core/materials.js';
import { makeSign } from '../core/signs.js';
import { A } from './layout.js';
import { coaster, rockSpire, mound, ellipseCurve, follow, simpleCar } from './rides.js';
import { pirateShip } from './adventure.js';
import { rand, rr } from '../core/rng.js';

const WIN = '#ffd49a';
const STRATA = ['#b4532f', '#c4673a', '#9a4426', '#d08a55', '#a84c2c', '#bf5d33'];

function markTwain() {
  const b = new Builder();
  // hull
  const hs = new THREE.Shape();
  hs.moveTo(-2.4, -7); hs.lineTo(2.4, -7); hs.lineTo(2.4, 4.5); hs.quadraticCurveTo(2.2, 7.5, 0, 8.6); hs.quadraticCurveTo(-2.2, 7.5, -2.4, 4.5); hs.closePath();
  b.extrude(hs, 1.2, 0, 1.0, 0, '#f4f1ea', { rx: Math.PI / 2, mat: 'gloss' });
  b.box(5.0, 0.3, 15.6, 0, 0.15, 0.4, '#a8302e');
  // decks
  const deck = (y, w, l, zc) => {
    b.box(w, 0.25, l, 0, y, zc, '#f4f1ea', { mat: 'gloss' });
    for (const s of [-1, 1]) for (let z = zc - l / 2 + 0.4; z <= zc + l / 2 - 0.39; z += 0.9) b.cyl(0.05, 0.8, s * (w / 2 - 0.1), y + 0.25, z, '#ffffff', { seg: 4 });
    b.box(w, 0.08, l, 0, y + 1.0, zc, '#ffffff');
  };
  b.box(4.4, 1.9, 11, 0, 0.3, -0.5, '#ece6d6');
  for (const s of [-1, 1]) for (let z = -5; z <= 4; z += 1.2) b.box(0.08, 0.9, 0.7, s * 2.21, 0.8, z, WIN, { mat: 'glow' });
  deck(2.2, 4.8, 12.4, -0.3);
  b.box(4.0, 1.8, 9, 0, 2.45, -0.8, '#ece6d6');
  for (const s of [-1, 1]) for (let z = -4.6; z <= 3; z += 1.1) b.box(0.08, 0.8, 0.6, s * 2.01, 2.9, z, WIN, { mat: 'glow' });
  deck(4.25, 4.4, 9.8, -0.8);
  b.box(3.0, 1.4, 5, 0, 4.5, -1.5, '#ece6d6');
  deck(5.9, 3.4, 5.6, -1.5);
  // pilot house
  b.box(1.8, 1.4, 1.8, 0, 6.15, 0.2, '#f4f1ea');
  b.box(1.82, 0.6, 1.82, 0, 6.6, 0.2, WIN, { mat: 'glow' });
  b.pyr(2.3, 0.8, 2.3, 0, 7.55, 0.2, '#a8302e');
  // twin stacks with crowns
  for (const s of [-1, 1]) {
    b.cyl(0.32, 7, s * 0.9, 4.25, 2.6, '#1d1d1f', { seg: 10 });
    b.cyl(0.55, 0.7, s * 0.9, 11.25, 2.6, '#1d1d1f', { seg: 10, rt: 0.7 });
    for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; b.cone(0.12, 0.45, s * 0.9 + Math.cos(a) * 0.55, 11.95, 2.6 + Math.sin(a) * 0.55, '#d8b25a', { seg: 4, mat: 'metal' }); }
  }
  // flag
  b.cyl(0.04, 2.2, 0, 6, -4, '#dddddd', { seg: 4 });
  b.box(0.9, 0.55, 0.03, 0.45, 7.6, -4, '#c8323a');
  // little passengers on the decks
  const cs = ['#d8483a', '#3a6ad8', '#f2c94c', '#3aa86a', '#ffffff'];
  for (let k = 0; k < 14; k++) {
    const y = k < 8 ? 2.45 : 4.5, z = -5 + (k % 8) * 1.3, x = (k % 2 ? 1 : -1) * (k < 8 ? 2.0 : 1.8);
    b.sph(0.17, x, y + 0.85, z, '#f0c8a0', { w: 5, h: 4 }); b.box(0.3, 0.55, 0.25, x, y + 0.2, z, cs[k % 5]);
  }
  const boat = b.build({ name: 'markTwain' });
  // stern paddle wheel
  const wb = new Builder();
  wb.torus(1.7, 0.1, -0.9, 0, 0, '#a8302e', { rx: 0, ry: Math.PI / 2 });
  wb.torus(1.7, 0.1, 0.9, 0, 0, '#a8302e', { rx: 0, ry: Math.PI / 2 });
  for (let k = 0; k < 5; k++) wb.boxc(1.9, 3.4, 0.12, 0, 0, 0, '#a8302e', { rx: k * Math.PI / 5 });
  const wheel = wb.build({ name: 'paddle' });
  wheel.position.set(0, 1.4, -7.8);
  boat.add(wheel);
  boat.userData.wheel = wheel;
  return boat;
}

function bigThunder(ctx, [x, z]) {
  const { b, props } = ctx;
  // mesa base and spires
  b.push(x, 0, z);
  mound(b, 0, 0.5, 0, 13.5, 3.6, 12.5, '#a84c2c', { d: 1 });
  const spires = [[-3, -3, 28, 4.6], [4, -5, 22, 4.0], [-6, 5, 18, 3.6], [6, 4, 14, 3.2], [1, 7.5, 11, 2.8], [-8.5, -4, 13, 2.6], [8.5, -1, 9, 2.4]];
  for (const [sx, sz, h, r] of spires) rockSpire(b, sx, sz, h, r, STRATA, 3.4);
  // mining town bits
  b.box(4, 3.5, 3, 9.5, 0, 9, '#8a5a36');
  b.prism(4.5, 1.8, 3.4, 9.5, 3.5, 9, '#5a3a24');
  b.cyl(1.3, 2.2, -10, 3.4, 8, '#7a5030', { seg: 10 });
  b.cone(1.5, 0.9, -10, 5.6, 8, '#5a3a24', { seg: 10 });
  for (const [dx, dz] of [[-0.8, -0.8], [0.8, -0.8], [-0.8, 0.8], [0.8, 0.8]]) b.cyl(0.1, 3.4, -10 + dx, 0, 8 + dz, '#5a3a24', { seg: 4 });
  b.pop();
  for (let k = 0; k < 10; k++) props.add('cactus', x + rr(-14, 14), z + rr(10, 15), { s: rr(0.7, 1.2) });
  const track = [
    [12, 4, 6], [10, 6.5, 11], [2, 8.5, 13], [-7, 6, 11.5], [-12.5, 4.5, 5], [-11, 9, -3], [-6, 12.5, -9], [2, 10.5, -11.5],
    [9.5, 7.5, -8], [11, 5, -1], [5, 4.6, 2], [-1, 7, 1.2], [-4, 9.5, -3.5], [2, 6.2, -5], [9, 3.8, 0.5],
  ];
  const mine = coaster(ctx, {
    ox: x, oz: z, pts: track, rail: '#5a4a3a', spine: '#6a4428', support: '#7a5434', width: 1.2, wood: true,
    nCars: 6, spacing: 2.3, speed: 9,
    carFn: () => simpleCar('#9a5a2a', 2, { w: 1.4, l: 2.0 }),
    leadFn: () => {
      const lb = new Builder();
      lb.box(1.4, 0.7, 2.2, 0, 0, 0, '#202020');
      lb.cyl(0.45, 1.6, 0, 0.5, 0.2, '#b52a2a', { rx: Math.PI / 2, seg: 10 });
      lb.cyl(0.25, 0.9, 0, 0.9, 1.4, '#202020', { seg: 8 });
      lb.cyl(0.42, 0.4, 0, 1.8, 1.4, '#202020', { seg: 8, rt: 0.55 });
      lb.box(1.2, 1.1, 0.8, 0, 0.7, -0.6, '#b52a2a');
      return lb.build({ name: 'mineLoco' });
    },
  });
  ctx.occ(x, z, 15);
  return mine;
}

function splashMountain(ctx, [x, z]) {
  const { b, world } = ctx;
  const CLAY = '#a5643a', CLAY2 = '#8f5532', GRASS = '#4f7a3a';
  b.push(x, 0, z);
  mound(b, 0, 0, 0, 11, 5, 10, CLAY);
  mound(b, -2, 3, -2, 7, 8, 6.5, CLAY2);
  mound(b, -3.5, 9, -2.5, 4.6, 6, 4.4, CLAY);
  mound(b, 3, 4, 4, 4.5, 4.5, 4, CLAY2);
  mound(b, -6, 4, 5, 3.6, 3.5, 3.4, CLAY);
  mound(b, 5, 2, -5, 4, 3.2, 3.6, '#9a5a36');
  for (let k = 0; k < 18; k++) { const a = rand() * Math.PI * 2; b.ico(rr(1, 2.2), Math.cos(a) * rr(4, 9), rr(2, 9), Math.sin(a) * rr(4, 8), k % 2 ? GRASS : '#5a8a42', { d: 1, sy: 0.6, mat: 'leaf' }); }
  // the dead tree on the summit
  b.rod(-3.5, 14.5, -2.5, -3.2, 19, -2.2, 0.35, '#4a3a2a');
  for (let k = 0; k < 5; k++) { const a = k * 1.3; b.rod(-3.3, 17 + k * 0.4, -2.3, -3.3 + Math.cos(a) * 2.2, 18.5 + k * 0.5, -2.3 + Math.sin(a) * 2.2, 0.12, '#4a3a2a'); }
  // the flume drop toward the pool (east)
  const top = new THREE.Vector3(0.5, 13.5, 2.2), bot = new THREE.Vector3(11.5, 0.4, 2.2);
  b.beam(top.x, top.y, top.z, bot.x, bot.y, bot.z, 2.4, '#6a4a2a', { t2: 0.5 });
  b.beam(top.x, top.y + 0.5, top.z + 1.15, bot.x, bot.y + 0.5, bot.z + 1.15, 0.25, '#7a5434');
  b.beam(top.x, top.y + 0.5, top.z - 1.15, bot.x, bot.y + 0.5, bot.z - 1.15, 0.25, '#7a5434');
  b.pop();
  // log boats riding down every few seconds
  const lb = new Builder();
  lb.cyl(0.75, 3.6, 0, 0, -1.8, '#7a5030', { rx: Math.PI / 2, seg: 10 });
  lb.box(1.2, 0.3, 3.0, 0, 0.6, 0, '#4a3020');
  for (let k = 0; k < 3; k++) { lb.sph(0.2, -0.3, 1.1, -1 + k, '#f0c8a0', { w: 5, h: 4 }); lb.sph(0.2, 0.3, 1.1, -1 + k, '#c99a72', { w: 5, h: 4 }); }
  const log = lb.build({ name: 'log' });
  world.add(log);
  const A0 = new THREE.Vector3(x + top.x, top.y + 0.7, z + top.z), B0 = new THREE.Vector3(x + bot.x, bot.y + 0.5, z + bot.z);
  const dir = B0.clone().sub(A0).normalize();
  let tt = 0, splashed = false;
  ctx.anims.push((dt) => {
    tt += dt;
    const cyc = tt % 9;
    if (cyc < 1.2) { log.visible = true; log.position.copy(A0).addScaledVector(dir, -2 + cyc * 1.5); splashed = false; }
    else if (cyc < 2.6) {
      const k = (cyc - 1.2) / 1.4; const e = k * k;
      log.position.lerpVectors(A0, B0, e);
    } else if (cyc < 6) {
      if (!splashed) { splashed = true; for (let i = 0; i < 28; i++) ctx.smoke.emit(B0.x + rr(-1.5, 2.5), 0.6, B0.z + rr(-1.5, 1.5), rr(1.2, 2.2), 1, rr(4, 8), rr(0.8, 1.4), 3.5); }
      log.position.set(B0.x + (cyc - 2.6) * 1.0, 0.25, B0.z);
    } else log.visible = false;
    log.lookAt(log.position.x + dir.x, log.position.y + (cyc > 1.2 && cyc < 2.6 ? dir.y : 0), log.position.z + dir.z);
  });
  ctx.occ(x, z, 12);
}

function frontierRow(b, props, world) {
  // western false fronts facing north (toward the river path)
  const blds = [
    { x: -50.5, w: 4.2, h: 5.2, c: '#a8693a', t: '#e8d8b0' },
    { x: -46.2, w: 4.0, h: 6.2, c: '#7a4a6a', t: '#f0e0c0' },
    { x: -41.8, w: 4.6, h: 5.6, c: '#5f7a4a', t: '#f0e2c0' },
  ];
  for (const bl of blds) {
    b.push(bl.x, 0, 15, Math.PI);
    b.box(bl.w, bl.h - 1.2, 6, 0, 0, 0, bl.c);
    b.box(bl.w, 1.4, 0.3, 0, bl.h - 1.4, 3.0, bl.c);
    b.box(bl.w + 0.2, 0.25, 0.4, 0, bl.h, 3.0, bl.t);
    b.box(bl.w * 0.7, 0.8, 0.12, 0, bl.h - 1.15, 3.18, bl.t);
    b.box(1.1, 1.6, 0.1, -bl.w / 4, 0.8, 3.02, WIN, { mat: 'glow' });
    b.box(1.0, 2.2, 0.1, bl.w / 4, 0, 3.02, '#3a2416');
    b.box(1.0, 1.0, 0.1, 0, 2.9, 3.02, WIN, { mat: 'glow' });
    // porch
    b.box(bl.w, 0.25, 1.8, 0, 0, 3.9, '#7a5434');
    b.box(bl.w, 0.15, 2.0, 0, 2.6, 3.9, '#5a3a24', { rx: 0.12 });
    for (const s of [-1, 1]) b.cyl(0.08, 2.6, s * (bl.w / 2 - 0.1), 0.25, 4.7, '#5a3a24', { seg: 4 });
    b.pop();
  }
  // Country Bear Jamboree hall
  b.push(-36.5, 0, 16, Math.PI - 0.4);
  b.box(8, 6, 7, 0, 0, 0, '#7a5030');
  b.prism(8.6, 3, 7.4, 0, 6, 0, '#4a3020');
  b.box(2.4, 3, 0.2, 0, 0, 3.55, '#3a2416');
  for (const s of [-1, 1]) b.box(1.3, 1.6, 0.1, s * 2.4, 1.5, 3.52, WIN, { mat: 'glow' });
  // bear head sign
  b.sph(1.2, 0, 7.0, 3.8, '#6a4020');
  b.sph(0.45, -0.95, 7.9, 3.8, '#6a4020'); b.sph(0.45, 0.95, 7.9, 3.8, '#6a4020');
  b.sph(0.55, 0, 6.7, 4.8, '#c89a6a'); b.sph(0.18, 0, 6.85, 5.3, '#1a1a1a');
  b.pop();
  const cb = makeSign(['乡村熊剧场', 'Country Bear Jamboree'], { w: 4.6, h: 0.9, bg: '#4a2a14', fg: '#f6e3a0' });
  cb.position.set(-35.0, 4.6, 12.3); cb.rotation.y = Math.PI - 0.4; world.add(cb);
  for (let k = 0; k < 6; k++) b.cyl(0.4, 0.9, -52 + k * 0.9, 0, 9.6, '#8a5a30', { seg: 8 });
}

function tomSawyerIsland(b, props) {
  const { x, z } = A.river;
  // Fort Langhorn
  b.push(x - 4, 0, z - 1);
  const LOG = '#7a5634';
  for (const [w, d, px, pz] of [[7, 0.5, 0, 2.8], [7, 0.5, 0, -2.8], [0.5, 5.6, 3.5, 0], [0.5, 5.6, -3.5, 0]]) b.box(w, 2.6, d, px, 0, pz, LOG);
  for (const [px, pz] of [[3.5, 2.8], [-3.5, -2.8]]) {
    b.box(2.2, 3.6, 2.2, px, 0, pz, '#6a4a2a');
    b.pyr(2.8, 1.2, 2.8, px, 3.6, pz, '#4a3020');
  }
  b.cyl(0.06, 5, 0, 0, 0, '#dddddd', { seg: 4 });
  b.box(1.3, 0.8, 0.03, 0.65, 4.2, 0, '#c8323a');
  b.pop();
  // Harper's Mill
  b.push(x + 6, 0, z + 1.5, 0.4);
  b.box(3, 3.2, 3, 0, 0, 0, '#8a6040');
  b.prism(3.4, 1.6, 3.4, 0, 3.2, 0, '#5a3a24');
  b.torus(1.3, 0.1, 1.8, 1.4, 0, '#6a4a2a', { rx: 0, ry: Math.PI / 2 });
  for (let k = 0; k < 6; k++) b.box(0.12, 2.6, 0.3, 1.8, 1.4, 0, '#6a4a2a', { rx: k * Math.PI / 6 });
  b.pop();
  for (let k = 0; k < 16; k++) {
    const a = rand() * Math.PI * 2, r = rr(0.25, 0.85);
    const px = x + Math.cos(a) * A.river.ix * r, pz = z + Math.sin(a) * A.river.iz * r;
    if (Math.hypot(px - (x - 4), pz - (z - 1)) < 5.5 || Math.hypot(px - (x + 6), pz - (z + 1.5)) < 3) continue;
    props.add(k % 3 ? 'pine' : 'round', px, pz, { s: rr(0.8, 1.2) });
  }
  // shoreline rocks
  for (let k = 0; k < 40; k++) {
    const a = k / 40 * Math.PI * 2 + rr(-0.05, 0.05);
    const outer = k % 2 === 0;
    const rx = outer ? A.river.rx + 1.0 : A.river.ix + 0.3, rz = outer ? A.river.rz + 1.0 : A.river.iz + 0.3;
    props.add('rock', x + Math.cos(a) * rx, z + Math.sin(a) * rz, { s: rr(0.5, 1.0) });
  }
}

function hauntedMansion(ctx, [x, z]) {
  const { b, props, world } = ctx;
  const BRICK = '#6b3b35', SLATE = '#3e4450', TRIM = '#cfc6b8', GW = '#b9ffb8';
  const ry = Math.atan2(-58 - x, -38 - z);
  b.push(x, 0, z, ry);
  b.box(15, 0.8, 11, 0, 0, 0, '#7a7a78');
  b.box(13, 10, 9, 0, 0.8, 0, BRICK);
  b.prism(13.6, 5.5, 9.6, 0, 10.8, 0, SLATE, { ry: Math.PI / 2 });
  // central tower
  b.box(4, 15, 4, 0, 0.8, 3.0, BRICK);
  b.box(4.4, 0.4, 4.4, 0, 15.8, 3.0, TRIM);
  b.pyr(4.6, 6, 4.6, 0, 16.2, 3.0, SLATE);
  b.cyl(0.05, 2.5, 0, 22.2, 3.0, '#222222', { seg: 4 });
  b.box(1.2, 0.3, 0.05, 0.3, 24.4, 3.0, '#222222');
  // gothic windows (eerie green glow)
  for (const [wx, wy] of [[-5, 2.5], [-2.6, 2.5], [2.6, 2.5], [5, 2.5], [-5, 6.5], [-2.6, 6.5], [2.6, 6.5], [5, 6.5]]) {
    b.box(1.0, 2.2, 0.15, wx, wy, 4.52, GW, { mat: 'glow' });
    b.cone(0.5, 0.8, wx, wy + 2.2, 4.52, GW, { mat: 'glow', seg: 4 });
  }
  for (const wy of [4, 8, 12]) b.box(1.2, 2.0, 0.15, 0, wy, 5.02, GW, { mat: 'glow' });
  b.box(1.6, 2.6, 0.2, 0, 0.8, 5.05, '#2a1a18');
  // porch with columns
  b.box(6, 0.3, 2.4, 0, 3.6, 6.2, TRIM);
  for (const px of [-2.6, -0.9, 0.9, 2.6]) b.cyl(0.18, 2.8, px, 0.8, 7.1, TRIM, { seg: 8 });
  // chimneys
  for (const cx of [-5.4, 5.4]) b.box(1.2, 5, 1.2, cx, 11, -1.5, BRICK);
  b.pop();
  // graveyard + iron fence
  const gx = x + Math.cos(ry) * 10, gz = z - Math.sin(ry) * 10;
  for (let k = 0; k < 18; k++) {
    const tx = gx + rr(-5, 5), tz = gz + rr(-4, 4);
    if (k % 3 === 0) { b.box(0.8, 1.1, 0.25, tx, 0, tz, '#9a9a96', { ry: ry + rr(-0.2, 0.2) }); b.cyl(0.4, 0.25, tx, 1.1, tz, '#9a9a96', { rx: Math.PI / 2, ry, seg: 8 }); }
    else if (k % 3 === 1) b.box(0.18, 1.3, 0.18, tx, 0, tz, '#8a8a86');
    else b.box(0.7, 0.9, 0.2, tx, 0, tz, '#a8a8a2', { ry: ry + rr(-0.3, 0.3), rz: rr(-0.15, 0.15) });
  }
  b.box(2.4, 2.2, 2, gx + 2, 0, gz - 2, '#8a8a86');
  b.pyr(2.8, 1.4, 2.4, gx + 2, 2.2, gz - 2, '#6a6a68');
  for (let k = 0; k < 40; k++) {
    const a = k / 40 * Math.PI * 2;
    b.cyl(0.05, 1.6, x + Math.cos(a) * 11.5, 0, z + Math.sin(a) * 9.5, '#1a1a1c', { seg: 4 });
    if (k % 4 === 0) b.cone(0.1, 0.3, x + Math.cos(a) * 11.5, 1.6, z + Math.sin(a) * 9.5, '#c9a24a', { seg: 4, mat: 'metal' });
  }
  // dead trees
  for (let k = 0; k < 3; k++) {
    const tx = gx + rr(-6, 6), tz = gz + rr(-5, 5);
    b.rod(tx, 0, tz, tx + 0.3, 4.5, tz, 0.25, '#3a2e2a');
    for (let j = 0; j < 4; j++) { const a = rand() * 6.28; b.rod(tx + 0.2, 2.5 + j * 0.5, tz, tx + Math.cos(a) * 1.8, 3.6 + j * 0.5, tz + Math.sin(a) * 1.8, 0.08, '#3a2e2a'); }
  }
  // ghosts: glowing sheets that float around at night
  const ghostMat = new THREE.MeshBasicMaterial({ color: 0xd8fff0, transparent: true, opacity: 0, depthWrite: false });
  const ghosts = [];
  const gg = new Builder();
  gg.sph(0.55, 0, 2.0, 0, '#ffffff', { w: 10, h: 8 });
  gg.cone(0.75, 1.9, 0, 0.2, 0, '#ffffff', { seg: 10 });
  const ggeo = gg.buildGeometry();
  for (let k = 0; k < 6; k++) {
    const m = new THREE.Mesh(ggeo, ghostMat);
    world.add(m);
    ghosts.push({ m, ph: k * 1.1, r: rr(5, 12), h: rr(2, 9), sp: rr(0.2, 0.45) * (k % 2 ? 1 : -1) });
  }
  ctx.anims.push((dt, t, atmos) => {
    ghostMat.opacity = 0.05 + atmos.lights * 0.4;
    for (const g of ghosts) {
      const a = t * g.sp + g.ph;
      g.m.position.set(x + Math.cos(a) * g.r, g.h + Math.sin(t * 1.3 + g.ph) * 0.8, z + Math.sin(a) * g.r * 0.8);
      g.m.rotation.y = -a;
    }
  });
  ctx.occ(x, z, 10);
}

function libertySquare(ctx) {
  const { b, props } = ctx;
  // Liberty Tree with lanterns
  const [tx, tz] = A.libertyTree;
  b.cyl(1.2, 6, tx, 0, tz, '#5a3d28', { rt: 0.8, seg: 10 });
  for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; b.rod(tx, 5, tz, tx + Math.cos(a) * 4.5, 7.5, tz + Math.sin(a) * 4.5, 0.32, '#5a3d28'); }
  b.sph(6.8, tx, 9, tz, '#3f6a34', { sy: 0.55, mat: 'leaf', w: 14, h: 9 });
  b.sph(4.5, tx + 2, 11, tz - 1, '#467238', { sy: 0.55, mat: 'leaf' });
  for (let k = 0; k < 13; k++) { const a = k / 13 * Math.PI * 2; props.bulb(tx + Math.cos(a) * 5.2, 6.4, tz + Math.sin(a) * 5.2, '#ffcf7a', 0.22); }
  ctx.occ(tx, tz, 5);
  // Hall of Presidents (colonial brick with clock cupola)
  b.push(-47, 0, -53, 0.5);
  b.box(12, 7, 8, 0, 0, 0, '#9a4a3a');
  b.box(12.4, 0.5, 8.4, 0, 7, 0, '#f2ede2');
  b.pyr(12.4, 3, 8.4, 0, 7.5, 0, '#4a4a52');
  for (const wx of [-4.2, -1.4, 1.4, 4.2]) { b.box(1.1, 1.9, 0.12, wx, 1.2, 4.02, WIN, { mat: 'glow' }); b.box(1.1, 1.6, 0.12, wx, 4.4, 4.02, WIN, { mat: 'glow' }); }
  b.box(2.2, 3, 2.2, 0, 10, 0, '#f2ede2');
  b.cyl(0.6, 0.1, 0, 11.6, 1.12, '#fbf6ea', { rx: Math.PI / 2, seg: 16, mat: 'glow' });
  b.dome(1.3, 0, 13, 0, '#4a6a5a', { mat: 'gloss' });
  b.cone(0.1, 1.8, 0, 14.2, 0, '#c9a24a', { seg: 4, mat: 'metal' });
  b.pop();
  ctx.occ(-47, -53, 8);
  // Liberty Bell replica
  b.lathe([[0, 0], [0.9, 0], [0.75, 0.3], [0.55, 1.1], [0.35, 1.4], [0, 1.45]], -40, 0.8, -46, '#6a5a42', { mat: 'metal' });
  b.box(2.2, 0.8, 1.2, -40, 0, -46, '#cfc6b8');
}

export function buildFrontier(ctx) {
  const { b, props, world } = ctx;
  ctx.occ(A.river.x, A.river.z, 0); // river is masked via the ground map
  // riverboat and tall ship on the river
  const R = A.river;
  const mtCurve = ellipseCurve(R.x, R.z, (R.rx + R.ix) / 2 + 0.3, (R.rz + R.iz) / 2 + 0.2, 0.25, 72, true);
  const twain = markTwain(); world.add(twain);
  follow(ctx, twain, mtCurve, 1.9, 0.0, 0, 0.04);
  const columbia = pirateShip('#f2ede0', false); world.add(columbia);
  columbia.scale.setScalar(0.85);
  follow(ctx, columbia, mtCurve, 1.9, 0.5, 0, 0.06);
  let puff = 0;
  const tmp = new THREE.Vector3();
  ctx.anims.push((dt) => {
    twain.userData.wheel.rotation.x -= dt * 2.2;
    puff -= dt;
    if (puff < 0) {
      puff = 0.5;
      for (const s of [-1, 1]) { twain.localToWorld(tmp.set(s * 0.9, 12.2, 2.6)); ctx.smoke.emit(tmp.x, tmp.y, tmp.z, 1.1, 0.35, 1.2, 3.5); }
    }
  });
  // landing dock near the castle promenade
  b.box(4, 0.4, 7, -38, 0.25, -17, '#7a5434');
  b.push(-34.5, 0, -17, -Math.PI / 2);
  b.box(6, 4.2, 3, 0, 0, 0, '#f0e6d0');
  b.box(6.4, 0.3, 3.6, 0, 4.2, 0, '#2f5a46');
  for (const s of [-1, 1]) b.box(1.0, 1.6, 0.1, s * 1.6, 1.2, 1.52, WIN, { mat: 'glow' });
  b.pop();
  const ms = makeSign(['马克·吐温号', 'Mark Twain Riverboat'], { w: 4.2, h: 0.9, bg: '#2f5a46', fg: '#f6e3a0' });
  ms.position.set(-36.1, 3.4, -17); ms.rotation.y = -Math.PI / 2; world.add(ms);

  tomSawyerIsland(b, props);
  bigThunder(ctx, A.bigThunder);
  splashMountain(ctx, A.splash);
  frontierRow(b, props, world);
  ctx.occRect(-53, 9, -32, 21);
  hauntedMansion(ctx, A.mansion);
  libertySquare(ctx);
  // Frontierland gateway (log arch) on the river path
  b.push(-36, 0, 0.5, 0.9);
  for (const s of [-1, 1]) b.cyl(0.4, 5.5, s * 3.6, 0, 0, '#6a4a2a', { seg: 8 });
  b.box(8.6, 0.6, 0.6, 0, 5, 0, '#6a4a2a');
  b.pop();
  const fs = makeSign(['边域世界', 'Frontierland'], { w: 4.4, h: 0.9, bg: '#5a3418', fg: '#ffe3a0' });
  fs.position.set(-36, 4.3, 0.5); fs.rotation.y = 0.9; world.add(fs);

  ctx.poi({ id: 'frontierland', name: '边域世界', en: 'Frontierland', land: '边域世界', x: -72, y: 4, z: -2, dist: 110, pitch: 0.55, yaw: -1.3, group: true });
  ctx.poi({ id: 'bigthunder', name: '巨雷山矿山车', en: 'Big Thunder Mountain Railroad', land: '边域世界', x: A.bigThunder[0], y: 12, z: A.bigThunder[1], dist: 58, pitch: 0.3, yaw: 1.2 });
  ctx.poi({ id: 'splash', name: '飞溅山', en: 'Splash Mountain', land: '边域世界', x: A.splash[0], y: 8, z: A.splash[1], dist: 46, pitch: 0.25, yaw: 1.4 });
  ctx.poi({ id: 'river', name: '美国河 · 马克·吐温号', en: 'Rivers of America', land: '边域世界', x: R.x, y: 3, z: R.z, dist: 60, pitch: 0.5, yaw: 0.9, follow: twain, followOffset: [0, 4, 0] });
  ctx.poi({ id: 'tomsawyer', name: '汤姆·索亚岛', en: "Tom Sawyer Island", land: '边域世界', x: R.x, y: 2, z: R.z, dist: 34, pitch: 0.5, yaw: 0.4 });
  ctx.poi({ id: 'countrybear', name: '乡村熊剧场', en: 'Country Bear Jamboree', land: '边域世界', x: -38, y: 3, z: 15, dist: 28, pitch: 0.3, yaw: 3.0 });
  ctx.poi({ id: 'mansion', name: '幽灵公馆', en: 'Haunted Mansion', land: '自由广场', x: A.mansion[0], y: 8, z: A.mansion[1], dist: 42, pitch: 0.28, yaw: 0.9 });
  ctx.poi({ id: 'liberty', name: '自由之树 · 总统堂', en: 'Liberty Square', land: '自由广场', x: -40, y: 5, z: -44, dist: 40, pitch: 0.35, yaw: 0.6 });
}
