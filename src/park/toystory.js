// Toy Story Land: Slinky Dog Dash, Alien Swirling Saucers, RC Racer, giant
// toys (blocks, crayons, dominoes, tinker toys) around a huge Woody statue.
import * as THREE from 'three';
import { Builder } from '../core/builder.js';
import { MATS } from '../core/materials.js';
import { makeSign } from '../core/signs.js';
import { A } from './layout.js';
import { coaster } from './rides.js';
import { rr, rand } from '../core/rng.js';
import { faceTo } from '../core/config.js';

const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _p = new THREE.Vector3(), _s = new THREE.Vector3(1, 1, 1), _c = new THREE.Color();
const TOY = ['#e8423a', '#2f6fd8', '#f6d55c', '#3aa86a', '#f08a2a', '#9a5ad8'];

function saucers(ctx, [x, z]) {
  const { b, world, props } = ctx;
  b.cyl(8.6, 0.4, x, 0, z, '#2a3a6a', { seg: 32 });
  for (let k = 0; k < 40; k++) { const a = k / 40 * Math.PI * 2; props.bulb(x + Math.cos(a) * 8.4, 0.5, z + Math.sin(a) * 8.4, k % 2 ? '#7aff8a' : '#9ad0ff', 0.13); }
  // rocket tower
  b.cyl(0.9, 7, x, 0.4, z, '#d8dce4', { seg: 12, mat: 'gloss' });
  b.cone(1.2, 2.6, x, 7.4, z, '#e8423a', { seg: 12, mat: 'gloss' });
  for (let k = 0; k < 3; k++) { const a = k / 3 * Math.PI * 2; b.box(0.15, 2, 1.4, x + Math.cos(a) * 1.0, 0.4, z + Math.sin(a) * 1.0, '#e8423a', { ry: -a, mat: 'gloss' }); }
  b.sph(0.4, x, 10.2, z, '#f6d55c', { mat: 'neon' });
  // saucer vehicles
  const sb = new Builder();
  sb.cyl(1.4, 0.35, 0, 0.6, 0, '#7ad0a8', { seg: 18, mat: 'gloss' });
  sb.torus(1.4, 0.18, 0, 0.78, 0, '#c8d0dc', { mat: 'metal', ts: 20 });
  sb.dome(0.9, 0, 0.95, 0, '#bfe8ff', { mat: 'gloss', sy: 0.8 });
  sb.sph(0.32, 0, 1.25, 0.35, '#7ad84a', { w: 8, h: 6 });
  for (const ex of [-0.12, 0, 0.12]) sb.sph(0.07, ex, 1.32, 0.64, '#ffffff', { w: 5, h: 4 });
  sb.cyl(0.03, 0.35, 0, 1.55, 0.35, '#7ad84a', { seg: 4 });
  const sGeo = sb.buildGeometry();
  const sv = new THREE.InstancedMesh(sGeo, MATS.gloss, 9);
  for (let i = 0; i < 9; i++) sv.setColorAt(i, _c.set(['#ffffff', '#e8f0ff', '#f0fff0'][i % 3]));
  sv.castShadow = true;
  world.add(sv);
  let a1 = 0, a2 = 0;
  ctx.anims.push((dt, t) => {
    a1 += dt * 0.5; a2 -= dt * 1.3;
    for (let s = 0; s < 3; s++) {
      const sa = a1 + s / 3 * Math.PI * 2;
      const sx = x + Math.cos(sa) * 4.6, sz = z + Math.sin(sa) * 4.6;
      for (let c = 0; c < 3; c++) {
        const ca = a2 + c / 3 * Math.PI * 2;
        _p.set(sx + Math.cos(ca) * 2.0, 0.4 + Math.sin(t * 2 + s + c) * 0.1, sz + Math.sin(ca) * 2.0);
        _e.set(0, -ca * 1.5, 0); _q.setFromEuler(_e);
        _m.compose(_p, _q, _s);
        sv.setMatrixAt(s * 3 + c, _m);
      }
    }
    sv.instanceMatrix.needsUpdate = true;
  });
  ctx.occ(x, z, 9);
}

function slinkyDog(ctx, [x, z]) {
  const pts = [[11, 1.2, 0], [9, 4, 7], [1, 7.5, 9], [-7, 6, 7], [-11.5, 3.5, 1], [-9, 6.5, -6], [-2, 9, -8.5], [6, 6, -7.5], [10, 3, -4], [6, 2, -1], [0, 3.5, 2.5], [-5, 2.2, 0], [-1, 1.6, -3.5], [6, 1.4, -2]];
  const res = coaster(ctx, {
    ox: x, oz: z, ry: 0.4, pts, rail: '#f08a2a', spine: '#2f6fd8', support: '#3aa86a', width: 1.1, supportR: 0.22,
    nCars: 6, spacing: 1.7, speed: 8.5,
    carFn: () => {
      const cb = new Builder();
      for (let k = 0; k < 4; k++) cb.torus(0.55, 0.1, 0, 0.55, -0.6 + k * 0.4, '#c8ccd4', { rx: 0, mat: 'metal' });
      cb.sph(0.18, -0.25, 1.1, 0, '#f2c9a0', { w: 6, h: 5 }); cb.sph(0.18, 0.25, 1.1, 0, '#d9a77c', { w: 6, h: 5 });
      return cb.build({ name: 'slinkyCoil' });
    },
    leadFn: () => {
      const hb = new Builder();
      hb.ell(0, 0.6, 0, 0.55, 0.5, 0.75, '#c8864a');
      hb.sph(0.45, 0, 1.1, 0.7, '#c8864a');
      hb.ell(0, 0.95, 1.15, 0.22, 0.2, 0.25, '#c8864a');
      hb.sph(0.1, 0, 1.0, 1.4, '#111111', { w: 6, h: 4 });
      hb.ell(-0.45, 0.95, 0.65, 0.12, 0.5, 0.22, '#5a3a22', { az: 0.3 });
      hb.ell(0.45, 0.95, 0.65, 0.12, 0.5, 0.22, '#5a3a22', { az: -0.3 });
      hb.sph(0.09, -0.15, 1.3, 1.1, '#111111', { w: 5, h: 4 }); hb.sph(0.09, 0.15, 1.3, 1.1, '#111111', { w: 5, h: 4 });
      hb.torus(0.4, 0.06, 0, 0.75, 0.35, '#e8423a', { rx: 0 });
      return hb.build({ name: 'slinkyHead' });
    },
  });
  // tinker-toy hubs on some supports
  for (let k = 0; k < 14; k++) {
    const u = k / 14;
    const p = res.curve.getPointAt(u);
    if (p.y < 2.5) continue;
    ctx.b.cyl(0.55, 0.45, p.x, p.y * 0.5, p.z, TOY[k % 6], { seg: 10, mat: 'gloss' });
  }
  // tail car
  ctx.occ(x, z, 13);
}

function rcRacer(ctx, [x, z]) {
  const { b, world } = ctx;
  const ry = Math.atan2(Math.cos(68 * Math.PI / 180), -Math.sin(68 * Math.PI / 180)) + Math.PI / 2;
  const tan = new THREE.Vector3(Math.cos(68 * Math.PI / 180), 0, Math.sin(68 * Math.PI / 180));
  const yAt = (s) => 0.17 * s * s + 1.2;
  const P = (s, off = 0) => new THREE.Vector3(x + tan.x * s - tan.z * off, yAt(s), z + tan.z * s + tan.x * off);
  const L = [], R = [];
  for (let i = 0; i <= 60; i++) { const s = -12.5 + i * 25 / 60; L.push(P(s, -0.9)); R.push(P(s, 0.9)); }
  b.tube(L, 0.28, '#f08a2a', { seg: 120, rs: 6, mat: 'gloss' });
  b.tube(R, 0.28, '#f08a2a', { seg: 120, rs: 6, mat: 'gloss' });
  for (let i = 0; i <= 24; i++) {
    const s = -12 + i;
    const p = P(s);
    b.push(p.x, p.y - 0.25, p.z, Math.atan2(tan.x, tan.z));
    b.box(2.2, 0.15, 0.3, 0, 0, 0, '#2f6fd8');
    b.pop();
  }
  // support towers at both ends and the middle
  for (const s of [-11, -6, 6, 11]) {
    const p = P(s);
    for (const off of [-1.2, 1.2]) {
      const q = P(s, off);
      b.cyl(0.25, q.y, q.x, 0, q.z, '#e8eef4', { seg: 6 });
    }
    b.beam(P(s, -1.2).x, 0.5, P(s, -1.2).z, P(s, 1.2).x, p.y - 0.5, P(s, 1.2).z, 0.15, '#e8eef4');
  }
  // the RC car
  const cb = new Builder();
  cb.box(2.2, 0.9, 3.6, 0, 0.3, 0, '#e8423a', { mat: 'gloss' });
  cb.box(1.8, 0.6, 1.6, 0, 1.2, -0.3, '#2f6fd8', { mat: 'gloss' });
  cb.box(2.6, 0.12, 0.8, 0, 1.9, -1.6, '#f6d55c', { mat: 'gloss' });
  for (const sx of [-1.2, 1.2]) for (const sz of [-1.2, 1.2]) cb.cyl(0.65, 0.5, sx, 0.65, sz, '#202020', { rz: Math.PI / 2, seg: 12 });
  for (let k = 0; k < 4; k++) cb.sph(0.18, -0.6 + (k % 2) * 1.2, 1.55, 0.6 - (k > 1 ? 1.0 : 0), '#f2c9a0', { w: 5, h: 4 });
  cb.cyl(0.04, 1.6, 0.8, 1.2, -1.5, '#111111', { seg: 4 });
  const car = cb.build({ name: 'rcCar' });
  world.add(car);
  let tt = rr(0, 20);
  const look = new THREE.Vector3();
  ctx.anims.push((dt) => {
    tt += dt;
    const cyc = tt % 22;
    const amp = Math.min(11.8, 3 + cyc * 0.9) * (cyc > 17 ? Math.max(0, 1 - (cyc - 17) / 5) : 1);
    const s = amp * Math.sin(tt * 1.35);
    const p = P(s);
    car.position.set(p.x, p.y + 0.3, p.z);
    const p2 = P(s + 0.1);
    look.copy(p2).sub(p).normalize().multiplyScalar(5).add(car.position);
    car.lookAt(look);
  });
  ctx.occ(x, z, 12);
}

function giantToys(ctx) {
  const { b, props } = ctx;
  // letter blocks
  const blocks = [[52, -12, 0], [53.5, -13.2, 0], [52.8, -12.6, 2], [72, -14, 0], [73.4, -15, 0], [90, 12, 0], [91.4, 11, 0], [90.6, 11.5, 2]];
  blocks.forEach(([bx, bz, by], i) => {
    b.box(2, 2, 2, bx, by, bz, TOY[i % 6], { ry: i * 0.4, mat: 'gloss' });
    b.box(1.4, 1.4, 0.05, bx, by + 0.3, bz + 1.02, '#ffffff', { ry: i * 0.4 });
  });
  // crayon fence
  for (let k = 0; k < 18; k++) {
    const px = 46 + k * 1.1, pz = 10;
    b.cyl(0.4, 2.8, px, 0, pz, TOY[k % 6], { seg: 8, mat: 'gloss' });
    b.cone(0.4, 0.7, px, 2.8, pz, TOY[k % 6], { seg: 8, mat: 'gloss' });
  }
  // dominoes
  for (let k = 0; k < 7; k++) {
    b.box(1.6, 3.2, 0.5, 80 + k * 1.4, 0, 8 + k * 0.6, '#f8f4ec', { ry: 0.4, rx: k === 6 ? 0.5 : 0 });
    b.sph(0.18, 80 + k * 1.4, 2.4, 8 + k * 0.6 + 0.26, '#111111', { w: 5, h: 4 });
  }
  // tinker toy arch over the main path
  const arch = (ax, az, ry) => {
    b.push(ax, 0, az, ry);
    for (const s of [-1, 1]) { b.cyl(0.25, 6, s * 4, 0, 0, '#c8864a', { seg: 8 }); b.cyl(0.8, 0.5, s * 4, 6, 0, '#e8423a', { rx: Math.PI / 2, seg: 12, mat: 'gloss' }); }
    b.rod(-4, 6.2, 0, 4, 6.2, 0, 0.25, '#2f6fd8', { mat: 'gloss' });
    b.cyl(0.8, 0.5, 0, 6.2, -0.25, '#f6d55c', { rx: Math.PI / 2, seg: 12, mat: 'gloss' });
    b.pop();
  };
  arch(36, -14, -0.85);
  const s = makeSign(['玩具总动员乐园', 'Toy Story Land'], { w: 5, h: 1.0, bg: '#2f6fd8', fg: '#f6d55c', border: '#e8423a' });
  s.position.set(36, 4.9, -14); s.rotation.y = -0.85 + Math.PI; ctx.world.add(s);
  // statue pedestals for the big toys
  b.cyl(3.0, 0.8, A.woody[0], 0, A.woody[1], '#2f6fd8', { seg: 20, mat: 'gloss' });
  b.cyl(2.2, 0.6, 76, 0, -14, '#3aa86a', { seg: 16, mat: 'gloss' });
}

export function buildToyStory(ctx) {
  saucers(ctx, A.saucers);
  slinkyDog(ctx, A.slinky);
  rcRacer(ctx, A.rcRacer);
  giantToys(ctx);
  ctx.occ(A.woody[0], A.woody[1], 3.5);
  ctx.occ(76, -14, 3);
  const P = (id, name, en, pos, y, dist, pitch, yaw, extra = {}) => ctx.poi({ id, name, en, land: '玩具总动员乐园', x: pos[0], y, z: pos[1], dist, pitch, yaw, ...extra });
  P('toystory', '玩具总动员乐园', 'Toy Story Land', [70, -14], 4, 90, 0.55, -1.1, { group: true });
  P('slinky', '弹簧狗过山车', 'Slinky Dog Dash', A.slinky, 4, 40, 0.35, -1.0);
  P('saucers', '三眼仔旋转飞碟', 'Alien Swirling Saucers', A.saucers, 2, 26, 0.45, -1.3);
  P('rcracer', '遥控车 RC Racer', 'RC Racer', A.rcRacer, 12, 46, 0.2, -1.2);
}
