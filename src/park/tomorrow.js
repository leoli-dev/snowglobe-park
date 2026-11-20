// Tomorrowland & Pixar pier: Space Mountain, TRON Lightcycle Run, Astro
// Orbiter, PeopleMover, Buzz Lightyear, Moonliner, Tomorrowland Speedway and
// the Mickey-face Ferris wheel.
import * as THREE from 'three';
import { Builder } from '../core/builder.js';
import { MATS } from '../core/materials.js';
import { makeSign } from '../core/signs.js';
import { A } from './layout.js';
import { follow, ellipseCurve } from './rides.js';
import { rr, rand } from '../core/rng.js';
import { DEG, faceTo } from '../core/config.js';

const WHITE = '#f2f5f8', STEEL = '#c8d0da', NEON = '#4ab8ff';
const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _p = new THREE.Vector3(), _s = new THREE.Vector3(1, 1, 1);

function spaceMountain(ctx, [x, z]) {
  const { b, world, props } = ctx;
  b.push(x, 0, z);
  b.cyl(19, 1.6, 0, 0, 0, '#dfe4ea', { seg: 48 });
  b.lathe([[0, 1.6], [17.6, 1.6], [15.2, 7], [12.0, 12.5], [8.6, 17.5], [5.2, 22.5], [2.6, 26.5], [0, 27.4]], 0, 0, 0, WHITE, { seg: 48, mat: 'gloss' });
  const nR = 16;
  for (let k = 0; k < nR; k++) {
    const a = k / nR * Math.PI * 2;
    const cs = Math.cos(a), sn = Math.sin(a);
    b.beam(cs * 18.4, 1.6, sn * 18.4, cs * 1.6, 33, sn * 1.6, 0.55, '#ffffff', { t2: 0.9 });
    // night glow strips between ribs
    const a2 = a + Math.PI / nR;
    b.beam(Math.cos(a2) * 17.0, 2.4, Math.sin(a2) * 17.0, Math.cos(a2) * 6.0, 21, Math.sin(a2) * 6.0, 0.12, NEON, { mat: 'neon' });
  }
  b.torus(18.6, 0.25, 0, 1.6, 0, NEON, { mat: 'neon', ts: 64 });
  // entrance pylon and bridge
  b.cyl(1.0, 15, -16, 0, -19, '#ffffff', { seg: 12 });
  b.torus(1.8, 0.2, -16, 13.5, -19, '#d8283a', { ts: 18 });
  b.cone(1.2, 3, -16, 15, -19, '#ffffff', { seg: 12 });
  b.box(3, 0.5, 9, -11.5, 5, -14, '#e4e8ee', { ry: 0.8 });
  b.pop();
  const sign = makeSign(['太空山', 'Space Mountain'], { w: 4.2, h: 1.1, bg: '#0f1a3a', fg: '#9fdcff', border: '#4ab8ff' });
  sign.position.set(x - 16, 10, z - 17.8); sign.rotation.y = faceTo(x - 16, z - 19, 36, 26); world.add(sign);
  ctx.occ(x, z, 19.5);
}

function tron(ctx, [x, z]) {
  const { b, world } = ctx;
  const ang = 112 * DEG;
  const T = new THREE.Vector3(Math.cos(ang), 0, Math.sin(ang)); // along the canopy
  const Nn = new THREE.Vector3(-T.z, 0, T.x); // across
  const ribs = 15, half = 13;
  const surfPos = [], surfIdx = [];
  const ROWS = 12;
  for (let i = 0; i < ribs; i++) {
    const s = -half + i * (2 * half / (ribs - 1));
    const h = 6.2 + 2.6 * Math.sin(s * 0.33 + 0.8);
    const w = 5.2 + 0.6 * Math.cos(s * 0.25);
    const pts = [];
    for (let j = 0; j <= ROWS; j++) {
      const a = Math.PI * j / ROWS;
      const o = -Math.cos(a) * w, y = Math.sin(a) * h;
      const p = new THREE.Vector3(x + T.x * s + Nn.x * o, y, z + T.z * s + Nn.z * o);
      pts.push(p);
      surfPos.push(p.x, p.y, p.z);
    }
    b.tube(pts, 0.22, '#3a4250', { seg: 30, rs: 5 });
    b.tube(pts.map(p => p.clone().add(new THREE.Vector3(0, 0.3, 0))), 0.07, NEON, { seg: 30, rs: 4, mat: 'neon' });
    b.cyl(0.35, 0.6, pts[0].x, 0, pts[0].z, '#3a4250', { seg: 6 });
    b.cyl(0.35, 0.6, pts[ROWS].x, 0, pts[ROWS].z, '#3a4250', { seg: 6 });
  }
  for (let i = 0; i < ribs - 1; i++) for (let j = 0; j < ROWS; j++) {
    const a = i * (ROWS + 1) + j, c = (i + 1) * (ROWS + 1) + j;
    surfIdx.push(a, c, a + 1, a + 1, c, c + 1);
  }
  const sg = new THREE.BufferGeometry();
  sg.setAttribute('position', new THREE.Float32BufferAttribute(surfPos, 3));
  sg.setIndex(surfIdx);
  sg.computeVertexNormals();
  const col = new Float32Array(surfPos.length).fill(0);
  for (let i = 0; i < col.length; i += 3) { col[i] = 0.12; col[i + 1] = 0.22; col[i + 2] = 0.4; }
  sg.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const canopy = new THREE.Mesh(sg, MATS.glassy);
  canopy.material.side = THREE.DoubleSide;
  canopy.renderOrder = 8;
  world.add(canopy);
  // lightcycle launch track
  const loop = [];
  for (let i = 0; i <= 24; i++) {
    const s = -half - 3 + i * ((2 * half + 6) / 24);
    loop.push(new THREE.Vector3(x + T.x * s, 0.35, z + T.z * s));
  }
  for (let i = 1; i < 16; i++) {
    const a = Math.PI * i / 16;
    const s = half + 3 + Math.sin(a) * 8, o = (1 - Math.cos(a)) * 6;
    loop.push(new THREE.Vector3(x + T.x * s + Nn.x * o, 0.35 + Math.sin(a) * 4, z + T.z * s + Nn.z * o));
  }
  for (let i = 0; i <= 24; i++) {
    const s = half + 3 - i * ((2 * half + 6) / 24);
    loop.push(new THREE.Vector3(x + T.x * s + Nn.x * 12, 0.35 + Math.sin(i / 24 * Math.PI) * 3, z + T.z * s + Nn.z * 12));
  }
  for (let i = 1; i < 16; i++) {
    const a = Math.PI * i / 16;
    const s = -half - 3 - Math.sin(a) * 8, o = 12 - (1 - Math.cos(a)) * 6;
    loop.push(new THREE.Vector3(x + T.x * s + Nn.x * o, 0.35, z + T.z * s + Nn.z * o));
  }
  const curve = new THREE.CatmullRomCurve3(loop, true);
  b.tube(curve, 0.5, '#20262e', { seg: 320, rs: 4, closed: true });
  // lightcycles
  const cycles = [];
  for (let k = 0; k < 7; k++) {
    const cb = new Builder();
    cb.ell(0, 0.75, 0, 0.35, 0.4, 1.4, '#14181e', { mat: 'gloss' });
    cb.torus(0.55, 0.12, 0, 0.6, 0.95, k % 2 ? '#ff9a3a' : NEON, { rx: 0, ry: Math.PI / 2, mat: 'neon' });
    cb.torus(0.55, 0.12, 0, 0.6, -0.95, k % 2 ? '#ff9a3a' : NEON, { rx: 0, ry: Math.PI / 2, mat: 'neon' });
    cb.box(0.08, 0.1, 2.4, 0, 1.0, 0, k % 2 ? '#ff9a3a' : NEON, { mat: 'neon' });
    cb.sph(0.22, 0, 1.35, -0.2, '#1a1a1a', { w: 6, h: 5 });
    const cyc = cb.build({ name: 'lightcycle' });
    world.add(cyc);
    cycles.push(cyc);
  }
  const L = curve.getLength();
  let sd = 0, v = 4, lt = 0;
  const p = new THREE.Vector3(), t = new THREE.Vector3(), look = new THREE.Vector3();
  ctx.anims.push((dt) => {
    lt += dt;
    const cyc = lt % 14;
    const target = cyc < 1.2 ? 4 : (cyc < 2.4 ? 34 : 16);
    v += (target - v) * Math.min(1, dt * (cyc < 2.4 ? 3.5 : 1.2));
    sd = (sd + v * dt) % L;
    cycles.forEach((c, k) => {
      const u = (((sd - k * 2.8) % L) + L) % L / L;
      curve.getPointAt(u, p); curve.getTangentAt(u, t);
      c.position.copy(p);
      look.copy(p).add(t); c.lookAt(look);
    });
  });
  const sign = makeSign(['创极速光轮', 'TRON Lightcycle Power Run'], { w: 5, h: 1.0, bg: '#05080f', fg: '#7fd8ff', border: '#4ab8ff' });
  sign.position.set(x - T.x * 15 + Nn.x * 1, 6.2, z - T.z * 15 + Nn.z * 1); sign.rotation.y = Math.atan2(-T.x, -T.z); world.add(sign);
  ctx.occ(x, z, 15); ctx.occ(x + Nn.x * 9, z + Nn.z * 9, 10);
}

function astroOrbiter(ctx, [x, z]) {
  const { b, world } = ctx;
  b.cyl(3.4, 6.5, x, 0, z, '#e8ecf2', { seg: 20 });
  b.cyl(4.6, 0.6, x, 6.5, z, '#d8283a', { seg: 24, mat: 'gloss' });
  b.cyl(0.6, 14, x, 7.1, z, STEEL, { seg: 10, mat: 'metal' });
  // the armillary of planets
  const PL = ['#e8a03a', '#4a8ae8', '#d84a3a', '#9ad86a', '#c86ae8', '#f6d55c'];
  for (let k = 0; k < 3; k++) b.torus(3.2 - k * 0.6, 0.08, x, 18.5 + k * 0.6, z, '#e7bd57', { mat: 'metal', rx: Math.PI / 2 + k * 0.5, rz: k * 0.7, ts: 24 });
  PL.forEach((c, k) => { const a = k / 6 * Math.PI * 2; b.sph(0.45 + (k % 3) * 0.15, x + Math.cos(a) * 2.6, 18.6 + Math.sin(a * 2) * 1.2, z + Math.sin(a) * 2.6, c, { mat: 'gloss' }); });
  b.sph(1.0, x, 21.2, z, '#f6d55c', { mat: 'neon' });
  // rockets
  const rb = new Builder();
  rb.cyl(0.55, 2.2, 0, 0, -1.1, '#ffffff', { rx: Math.PI / 2, seg: 10, mat: 'gloss' });
  rb.cone(0.55, 1.1, 0, 0, 1.1, '#d8283a', { rx: Math.PI / 2, seg: 10, mat: 'gloss' });
  for (let k = 0; k < 3; k++) rb.box(0.08, 0.7, 0.8, 0, 0, -1.0, '#d8283a', { rz: k * Math.PI * 2 / 3, mat: 'gloss' });
  rb.sph(0.2, 0, 0.5, 0.2, '#f2c9a0', { w: 5, h: 4 });
  rb.rod(0, 0, 0, 0, -0.2, 0, 0.05, '#cccccc');
  const rGeo = rb.buildGeometry();
  const rockets = new THREE.InstancedMesh(rGeo, MATS.gloss, 12);
  const rc = ['#ffffff', '#e8f4ff', '#fff0f0', '#f0fff4'];
  for (let i = 0; i < 12; i++) rockets.setColorAt(i, new THREE.Color(rc[i % 4]));
  world.add(rockets);
  const armB = new Builder();
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; armB.rod(0, 0, 0, Math.cos(a) * 6.5, -1.2, Math.sin(a) * 6.5, 0.08, STEEL, { mat: 'metal' }); }
  const arms = armB.build({ name: 'astroArms' });
  arms.position.set(x, 15, z);
  world.add(arms);
  let rot = 0;
  ctx.anims.push((dt, t) => {
    rot += dt * 0.9;
    arms.rotation.y = -rot;
    for (let i = 0; i < 12; i++) {
      const a = rot + i / 12 * Math.PI * 2;
      const h = 13.6 + Math.sin(t * 0.8 + i) * 0.9;
      _p.set(x + Math.cos(a) * 6.8, h, z - Math.sin(a) * 6.8);
      _e.set(0.08, a, -0.25); _q.setFromEuler(_e);
      _m.compose(_p, _q, _s);
      rockets.setMatrixAt(i, _m);
    }
    rockets.instanceMatrix.needsUpdate = true;
  });
  ctx.occ(x, z, 5);
}

function peopleMover(ctx) {
  const { b, world } = ctx;
  const pm = A.peopleMover;
  const curve = ellipseCurve(pm.x, pm.z, pm.rx, pm.rz, pm.y, 48);
  const N = 72;
  const p1 = new THREE.Vector3(), p2 = new THREE.Vector3();
  for (let i = 0; i < N; i++) {
    curve.getPointAt(i / N, p1); curve.getPointAt((i + 1) / N, p2);
    const len = p1.distanceTo(p2);
    b.box(2.2, 0.7, len + 0.1, (p1.x + p2.x) / 2, pm.y - 0.7, (p1.z + p2.z) / 2, '#e4e8ee', { ry: Math.atan2(p2.x - p1.x, p2.z - p1.z) });
    b.box(0.25, 0.5, len + 0.1, (p1.x + p2.x) / 2, pm.y, (p1.z + p2.z) / 2, NEON, { ry: Math.atan2(p2.x - p1.x, p2.z - p1.z), mat: 'neon' });
    if (i % 4 === 0) b.cyl(0.4, pm.y - 0.7, p1.x, 0, p1.z, '#d8dde4', { seg: 8 });
  }
  for (let k = 0; k < 3; k++) {
    const tb = new Builder();
    for (let c = 0; c < 4; c++) {
      const zz = -c * 2.3;
      tb.box(1.8, 0.9, 2.1, 0, 0, zz, '#2f5fc6', { mat: 'gloss' });
      tb.box(1.82, 0.2, 2.12, 0, 0.9, zz, '#ffffff', { mat: 'gloss' });
      tb.box(1.6, 0.12, 1.8, 0, 2.1, zz, '#ffffff', { mat: 'gloss' });
      for (const s of [-1, 1]) tb.cyl(0.04, 1.2, s * 0.8, 0.9, zz + 0.9, '#cccccc', { seg: 4 });
      tb.sph(0.18, -0.35, 1.35, zz, '#f2c9a0', { w: 5, h: 4 }); tb.sph(0.18, 0.35, 1.35, zz, '#c99a72', { w: 5, h: 4 });
    }
    const train = tb.build({ name: 'peoplemover' });
    world.add(train);
    follow(ctx, train, curve, 3.2, k / 3, 0.05);
  }
}

function buzzBuilding(ctx, [x, z]) {
  const { b, world, props } = ctx;
  const ry = faceTo(x, z, 36, 26);
  b.push(x, 0, z, ry);
  b.box(13, 6, 10, 0, 0, 0, '#ffffff');
  b.box(13.4, 0.6, 10.4, 0, 6, 0, '#7a3ad8', { mat: 'gloss' });
  b.box(13.6, 0.5, 0.3, 0, 2.8, 5.05, '#7ad84a', { mat: 'neon' });
  b.dome(4.2, -2.5, 6.6, -1, '#dfe8f2', { mat: 'gloss' });
  b.torus(4.3, 0.25, -2.5, 6.7, -1, '#7ad84a', { mat: 'neon', ts: 28 });
  b.box(4, 3, 0.3, 3.5, 0, 5.05, '#1a1030', { mat: 'nosnow' });
  for (const wx of [-4.5, -2]) b.box(1.6, 1.4, 0.15, wx, 1.4, 5.05, '#c8e8ff', { mat: 'glow' });
  b.cyl(1.2, 0.8, 3.5, 6.6, 0, '#7a3ad8', { seg: 12, mat: 'gloss' }); // pedestal for Buzz statue
  b.pop();
  const s = makeSign(['巴斯光年星际营救', "Buzz Lightyear's Space Ranger Spin"], { w: 6.5, h: 1.1, bg: '#2a1050', fg: '#b8ff8a', border: '#7ad84a' });
  const off = new THREE.Vector3(0, 0, 5.25).applyAxisAngle(new THREE.Vector3(0, 1, 0), ry);
  s.position.set(x + off.x, 4.5, z + off.z); s.rotation.y = ry; world.add(s);
  ctx.buzzTop = new THREE.Vector3(3.5, 7.4, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), ry).add(new THREE.Vector3(x, 0, z));
  ctx.buzzRy = ry;
  ctx.occ(x, z, 8);
}

function moonliner(ctx, [x, z]) {
  const { b } = ctx;
  b.cyl(3.2, 1.2, x, 0, z, '#d8dde4', { seg: 20 });
  b.lathe([[0, 0], [1.2, 0.2], [1.6, 2], [1.7, 6], [1.5, 10], [1.0, 13], [0.4, 15.4], [0, 16]], x, 1.6, z, '#f4f6f8', { seg: 20, mat: 'gloss' });
  b.lathe([[0.95, 0], [1.02, 0.1], [0.55, 2.4], [0.0, 3.2]], x, 14.0, z, '#d8283a', { seg: 20, mat: 'gloss' });
  b.torus(1.62, 0.18, x, 7.5, z, '#d8283a', { ts: 24, mat: 'gloss' });
  for (let k = 0; k < 3; k++) {
    const a = k / 3 * Math.PI * 2;
    b.push(x, 1.6, z, a);
    b.box(0.25, 5, 3.0, 0, 0, 2.2, '#d8283a', { rx: -0.25, mat: 'gloss' });
    b.pop();
  }
  for (let k = 0; k < 4; k++) b.box(0.6, 0.6, 0.1, x + Math.cos(k * 1.57) * 1.62, 9, z + Math.sin(k * 1.57) * 1.62, '#9ad8ff', { ry: -k * 1.57 + Math.PI / 2, mat: 'glow' });
  ctx.occ(x, z, 3.5);
}

function speedway(ctx, [x, z]) {
  const { b, world } = ctx;
  const ang = 155 * DEG;
  const ry = -ang;
  const sh = new THREE.Shape();
  const half = 9, r = 6;
  sh.absarc(half, 0, r, -Math.PI / 2, Math.PI / 2, false);
  sh.absarc(-half, 0, r, Math.PI / 2, Math.PI * 1.5, false);
  const hole = new THREE.Path();
  hole.absarc(half, 0, r - 3.2, -Math.PI / 2, Math.PI / 2, false);
  hole.absarc(-half, 0, r - 3.2, Math.PI / 2, Math.PI * 1.5, false);
  sh.holes.push(hole);
  b.push(x, 0, z, ry);
  b.extrude(sh, 0.12, 0, 0.12, 0, '#3a3e44', { rx: Math.PI / 2, mat: 'nosnow' });
  for (let k = 0; k < 40; k++) {
    const t = k / 40 * Math.PI * 2;
    const px = (Math.cos(t) >= 0 ? half : -half) + Math.cos(t) * (r + 0.3), pz = Math.sin(t) * (r + 0.3);
    b.box(0.6, 0.25, 0.5, px, 0, pz, k % 2 ? '#e8283a' : '#ffffff', { ry: -t });
  }
  // grandstand
  for (let k = 0; k < 4; k++) b.box(12, 0.8, 1.2, 0, k * 0.8, -r - 2.5 - k * 1.1, '#9aa4b0');
  const cs = ['#e8423a', '#2f6fd8', '#f6d55c', '#3aa86a', '#ffffff'];
  for (let k = 0; k < 40; k++) b.sph(0.22, -5.6 + (k % 10) * 1.2, (Math.floor(k / 10)) * 0.8 + 1.0, -r - 2.5 - Math.floor(k / 10) * 1.1, cs[k % 5], { w: 5, h: 4 });
  // start gantry
  for (const s of [-1, 1]) b.cyl(0.15, 4, 0, 0, s * (r + 0.4), '#e8ecf2', { seg: 6 });
  b.box(0.3, 0.6, 2 * r + 1, 0, 4, 0, '#e8ecf2');
  for (let k = 0; k < 8; k++) b.box(0.32, 0.3, 0.6, 0, 3.4 + (k % 2) * 0.3, -2 + k * 0.6, k % 2 ? '#111111' : '#ffffff');
  b.pop();
  // cars on the oval
  const pts = [];
  for (let i = 0; i < 48; i++) {
    const t = i / 48 * Math.PI * 2;
    const lx = (Math.cos(t) >= 0 ? half : -half) + Math.cos(t) * (r - 1.6), lz = Math.sin(t) * (r - 1.6);
    const c = Math.cos(ry), s2 = Math.sin(ry);
    pts.push(new THREE.Vector3(x + lx * c + lz * s2, 0.12, z - lx * s2 + lz * c));
  }
  const curve = new THREE.CatmullRomCurve3(pts, true);
  const carCols = ['#2f6fd8', '#f6d55c', '#3aa86a', '#ffffff', '#9a5ad8'];
  const mk = (color, mcqueen) => {
    const cb = new Builder();
    cb.box(1.2, 0.5, 2.2, 0, 0.2, 0, color, { mat: 'gloss' });
    cb.box(1.0, 0.45, 1.0, 0, 0.7, -0.2, color, { mat: 'gloss' });
    for (const sx of [-0.62, 0.62]) for (const sz of [-0.7, 0.7]) cb.cyl(0.25, 0.2, sx, 0.25, sz, '#151515', { rz: Math.PI / 2, seg: 10 });
    if (mcqueen) {
      cb.box(0.9, 0.35, 0.05, 0, 0.75, 0.31, '#ffffff');
      cb.sph(0.1, -0.2, 0.78, 0.34, '#3a7ad8', { w: 5, h: 4 }); cb.sph(0.1, 0.2, 0.78, 0.34, '#3a7ad8', { w: 5, h: 4 });
      for (const s of [-1, 1]) { cb.box(0.05, 0.12, 1.4, s * 0.61, 0.45, 0, '#f6d55c', { rx: 0.15 }); cb.box(0.05, 0.12, 0.9, s * 0.61, 0.32, -0.2, '#f6d55c', { rx: -0.25 }); }
      cb.box(0.9, 0.1, 0.3, 0, 0.8, -1.1, '#e8423a');
    } else {
      cb.sph(0.2, 0, 1.1, -0.2, '#f2c9a0', { w: 5, h: 4 });
    }
    return cb.build({ name: mcqueen ? 'mcqueen' : 'kart' });
  };
  const mcq = mk('#d8202a', true);
  world.add(mcq);
  follow(ctx, mcq, curve, 6.2, 0.0);
  carCols.forEach((c, i) => { const car = mk(c, false); world.add(car); follow(ctx, car, curve, 4.6 + i * 0.25, (i + 1) / 6); });
  ctx.mcqueen = mcq;
  ctx.occ(x, z, 16);
}

function ferrisWheel(ctx, [x, z]) {
  const { b, world, props } = ctx;
  const rad = new THREE.Vector3(x, 0, z).normalize();
  const ry = Math.atan2(-rad.z, rad.x);
  const HY = 19.5, R = 16.5;
  // static supports + Mickey face hub
  b.push(x, 0, z, ry);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.beam(sx * 3.2, 0, sz * 8.5, sx * 1.9, HY, 0, 0.55, '#e8ecf2');
  b.cyl(0.6, 4.2, -2.1, HY, 0, STEEL, { rz: -Math.PI / 2, seg: 12, mat: 'metal' });
  for (const sx of [-1, 1]) {
    const fx = sx * 2.2;
    const disc = (r, y, zz, c, depth = 0.25) => b.cyl(r, depth, fx, HY + y, zz, c, { rz: -sx * Math.PI / 2, seg: 28 });
    disc(4.3, 0, 0, '#111111', 0.4);
    disc(2.4, 3.6, -3.4, '#111111', 0.4);
    disc(2.4, 3.6, 3.4, '#111111', 0.4);
    disc(3.2, -0.4, 0, '#f2c9a0', 0.5);
    disc(0.75, 0.6, -0.9, '#ffffff', 0.6); disc(0.75, 0.6, 0.9, '#ffffff', 0.6);
    disc(0.35, 0.5, -0.9, '#111111', 0.7); disc(0.35, 0.5, 0.9, '#111111', 0.7);
    disc(0.55, -0.6, 0, '#111111', 0.7);
    disc(1.1, -1.9, 0, '#a8262e', 0.6);
  }
  b.box(10, 1.2, 22, 0, 0, 0, '#2f6fd8');
  b.pop();
  // rotating rims & neon spokes
  const wb = new Builder();
  for (const sx of [-1.4, 1.4]) {
    wb.torus(R, 0.32, sx, 0, 0, '#f2f5f8', { rx: 0, ry: Math.PI / 2, ts: 72, mat: 'gloss' });
    wb.torus(R * 0.62, 0.18, sx, 0, 0, '#f2f5f8', { rx: 0, ry: Math.PI / 2, ts: 48, mat: 'gloss' });
    for (let k = 0; k < 16; k++) {
      const a = k / 16 * Math.PI * 2;
      wb.beam(sx, Math.cos(a) * 4.4, Math.sin(a) * 4.4, sx, Math.cos(a) * R, Math.sin(a) * R, 0.16, ['#ff4a8a', '#4ab8ff', '#ffd24a', '#7aff8a'][k % 4], { mat: 'neon' });
    }
  }
  for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2; wb.rod(-1.4, Math.cos(a) * R, Math.sin(a) * R, 1.4, Math.cos(a) * R, Math.sin(a) * R, 0.12, '#d8dde4'); }
  const wheel = wb.build({ name: 'wheel' });
  const pivot = new THREE.Object3D();
  pivot.position.set(x, HY, z);
  pivot.rotation.y = ry;
  pivot.add(wheel);
  world.add(pivot);
  // gondolas stay upright
  const gb = new Builder();
  gb.box(1.9, 1.8, 2.2, 0, -2.4, 0, '#ffffff', { mat: 'gloss' });
  gb.box(1.95, 0.7, 2.25, 0, -1.6, 0, '#9ad8ff', { mat: 'glow' });
  gb.dome(1.3, 0, -0.6, 0, '#ffffff', { mat: 'gloss', sy: 0.5 });
  gb.rod(0, -0.4, 0, 0, 0, 0, 0.08, '#cccccc');
  const gGeo = gb.buildGeometry();
  const gondolas = new THREE.InstancedMesh(gGeo, MATS.gloss, 16);
  const gc = ['#ff8ab0', '#8ad0ff', '#ffe08a', '#9aef8a'];
  for (let i = 0; i < 16; i++) gondolas.setColorAt(i, new THREE.Color(gc[i % 4]));
  gondolas.castShadow = true;
  world.add(gondolas);
  let rot = 0;
  const v = new THREE.Vector3();
  ctx.anims.push((dt, t) => {
    rot += dt * 0.12;
    wheel.rotation.x = rot;
    for (let i = 0; i < 16; i++) {
      const a = rot + i / 16 * Math.PI * 2;
      v.set(0, Math.cos(a) * R, Math.sin(a) * R).applyAxisAngle(new THREE.Vector3(0, 1, 0), ry);
      _p.set(x + v.x, HY + v.y, z + v.z);
      _e.set(0, ry, Math.sin(t * 0.9 + i) * 0.05); _q.setFromEuler(_e);
      _m.compose(_p, _q, _s);
      gondolas.setMatrixAt(i, _m);
    }
    gondolas.instanceMatrix.needsUpdate = true;
  });
  ctx.occ(x, z, 10);
}

export function buildTomorrow(ctx) {
  const { b, world, props } = ctx;
  spaceMountain(ctx, A.spaceMountain);
  tron(ctx, A.tron);
  astroOrbiter(ctx, A.astro);
  peopleMover(ctx);
  buzzBuilding(ctx, A.buzz);
  moonliner(ctx, A.moonliner);
  speedway(ctx, A.speedway);
  ferrisWheel(ctx, A.wheel);
  // futuristic light pylons and a satellite dish
  for (const [lx, lz] of [[26, 22], [26, 34], [48, 22], [56, 36], [70, 26], [44, 48], [42, 64]]) {
    b.cyl(0.18, 6, lx, 0, lz, '#e8ecf2', { seg: 8 });
    b.torus(0.8, 0.1, lx, 6.2, lz, NEON, { mat: 'neon', ts: 16 });
    b.sph(0.3, lx, 6.2, lz, '#e8f6ff', { mat: 'glow' });
  }
  const db = new Builder();
  db.dome(2.4, 0, 0, 0, '#e8ecf2', { rx: Math.PI, mat: 'gloss', sy: 0.5 });
  db.rod(0, -1.2, 0, 0, 1.6, 0, 0.08, '#cccccc');
  const dish = db.build({ name: 'dish' });
  dish.position.set(76, 7, 46);
  world.add(dish);
  b.cyl(0.5, 6, 76, 0, 46, '#d8dde4', { seg: 8 });
  ctx.anims.push((dt, t) => { dish.rotation.set(0.6, t * 0.4, 0); });
  // Tomorrowland gateway
  b.push(22, 0, 28.5, -1.35);
  for (const s of [-1, 1]) { b.cyl(0.35, 7, s * 4, 0, 0, '#e8ecf2', { seg: 10 }); b.torus(0.9, 0.12, s * 4, 7, 0, NEON, { mat: 'neon' }); }
  b.beam(-4, 6.6, 0, 4, 6.6, 0, 0.3, '#e8ecf2');
  b.pop();
  const gs = makeSign(['明日世界', 'Tomorrowland'], { w: 4.4, h: 0.9, bg: '#0f1a3a', fg: '#9fdcff', border: '#4ab8ff' });
  gs.position.set(22, 5.6, 28.5); gs.rotation.y = -1.35; world.add(gs);

  const P = (id, name, en, pos, y, dist, pitch, yaw, extra = {}) => ctx.poi({ id, name, en, land: '明日世界', x: pos[0], y, z: pos[1], dist, pitch, yaw, ...extra });
  P('tomorrowland', '明日世界', 'Tomorrowland', [58, 40], 6, 120, 0.5, -1.9, { group: true });
  P('spacemountain', '太空山', 'Space Mountain', A.spaceMountain, 14, 70, 0.22, -2.2);
  P('tron', '创极速光轮', 'TRON Lightcycle Power Run', A.tron, 4, 50, 0.3, -2.0);
  P('astro', '宇宙飞行器（天文飞行器）', 'Astro Orbiter', A.astro, 12, 40, 0.2, -2.3);
  P('peoplemover', '明日世界飞跃车', 'PeopleMover', [A.peopleMover.x, A.peopleMover.z], 6, 40, 0.4, -1.6);
  P('buzz', '巴斯光年星际营救', "Buzz Lightyear's Space Ranger Spin", A.buzz, 5, 32, 0.3, -2.6);
  P('moonliner', '月球火箭 Moonliner', 'Moonliner', A.moonliner, 9, 28, 0.2, -2.0);
  P('speedway', '明日世界赛车场', 'Tomorrowland Speedway', A.speedway, 2, 44, 0.45, -2.6);
  P('wheel', '皮克斯米奇摩天轮', 'Pixar Pal-A-Round', A.wheel, 20, 70, 0.15, -1.6);
}
