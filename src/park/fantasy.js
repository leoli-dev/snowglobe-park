// Fantasyland: carrousel, Mad Tea Party, Dumbo, Peter Pan's Flight,
// "it's a small world", Seven Dwarfs Mine Train + cottage, Winnie the Pooh,
// Rapunzel's tower, Alice's maze, Elsa's ice palace, the Matterhorn bobsleds.
import * as THREE from 'three';
import { Builder } from '../core/builder.js';
import { MATS } from '../core/materials.js';
import { makeSign } from '../core/signs.js';
import { A } from './layout.js';
import { coaster, rockSpire, mound, simpleCar } from './rides.js';
import { ellipseWater, rectWater } from './water.js';
import { rand, rr } from '../core/rng.js';
import { faceTo } from '../core/config.js';

const WIN = '#ffd49a', GOLD = '#e7bd57';
const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _p = new THREE.Vector3(), _s = new THREE.Vector3(1, 1, 1), _c = new THREE.Color();

function carrousel(ctx, [x, z]) {
  const { b, world, props } = ctx;
  b.cyl(8.2, 0.5, x, 0, z, '#c9b08a', { seg: 28 });
  const rb = new Builder();
  rb.cyl(7.4, 0.5, 0, 0.5, 0, '#f2ead8', { seg: 32 });
  rb.torus(7.4, 0.12, 0, 0.9, 0, GOLD, { mat: 'metal', ts: 40 });
  rb.cyl(1.6, 5.6, 0, 1.0, 0, '#e8d8b8', { seg: 16 });
  for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2; rb.box(0.7, 3.6, 0.1, Math.sin(a) * 1.62, 1.8, Math.cos(a) * 1.62, k % 2 ? '#b8d8f0' : GOLD, { ry: a, mat: k % 2 ? 'gloss' : 'metal' }); }
  // canopy
  rb.cyl(8.0, 0.5, 0, 6.2, 0, '#ffffff', { seg: 32 });
  rb.cone(8.2, 3.2, 0, 6.7, 0, '#f4efe6', { seg: 32, mat: 'gloss' });
  for (let k = 0; k < 16; k++) {
    const a = k / 16 * Math.PI * 2;
    rb.beam(Math.sin(a) * 8.1, 6.75, Math.cos(a) * 8.1, 0, 9.9, 0, 0.18, k % 2 ? '#2f5fc6' : GOLD, { mat: k % 2 ? 'gloss' : 'metal' });
    rb.sph(0.55, Math.sin(a) * 8.0, 6.2, Math.cos(a) * 8.0, ['#c8323a', '#2f5fc6', GOLD, '#7a3aa8'][k % 4], { sy: 0.8, mat: 'gloss' });
  }
  rb.cyl(1.2, 1.5, 0, 9.6, 0, '#f4efe6', { seg: 12 });
  rb.cone(1.5, 1.6, 0, 11.1, 0, '#2f5fc6', { seg: 12, mat: 'gloss' });
  rb.sph(0.3, 0, 12.8, 0, GOLD, { mat: 'metal' });
  const top = rb.build({ name: 'carrousel' });
  top.position.set(x, 0, z);
  world.add(top);
  for (let k = 0; k < 32; k++) { const a = k / 32 * Math.PI * 2; props.bulb(x + Math.sin(a) * 8.15, 6.45, z + Math.cos(a) * 8.15, '#ffe2a8', 0.15); }
  // horses (instanced, ride on the platform)
  const hb = new Builder();
  hb.ell(0, 1.55, 0, 0.32, 0.38, 0.8, '#ffffff', { mat: 'gloss' });
  hb.rod(0, 1.7, 0.6, 0, 2.3, 0.95, 0.17, '#ffffff', { mat: 'gloss' });
  hb.ell(0, 2.35, 1.15, 0.15, 0.17, 0.35, '#ffffff', { mat: 'gloss' });
  hb.box(0.08, 0.35, 0.5, 0, 2.3, 0.85, GOLD, { rx: -0.6, mat: 'metal' });
  for (const [lx, lz, rx] of [[-0.18, 0.5, -0.6], [0.18, 0.5, -0.9], [-0.18, -0.5, 0.5], [0.18, -0.5, 0.7]]) hb.cyl(0.07, 0.7, lx, 0.85, lz, '#ffffff', { rx, mat: 'gloss' });
  hb.box(0.5, 0.15, 0.55, 0, 1.92, -0.05, '#c8323a', { mat: 'gloss' });
  hb.cyl(0.05, 4.4, 0, 0.6, 0, GOLD, { seg: 5, mat: 'metal' });
  hb.rod(0, 1.4, -0.7, 0, 1.0, -1.1, 0.06, '#e8e0d0');
  const horses = new THREE.InstancedMesh(hb.buildGeometry(), MATS.gloss, 24);
  const hc = ['#ffffff', '#f2e6d2', '#e8d2c0', '#fdf6e8'];
  for (let i = 0; i < 24; i++) horses.setColorAt(i, _c.set(hc[i % 4]));
  horses.castShadow = true;
  world.add(horses);
  let rot = 0;
  ctx.anims.push((dt, t) => {
    rot += dt * 0.38;
    top.rotation.y = rot;
    for (let i = 0; i < 24; i++) {
      const ring = i % 2 ? 4.4 : 6.2;
      const a = rot + (i / 24) * Math.PI * 2;
      const bob = Math.sin(t * 2.2 + i * 1.7) * 0.32;
      _p.set(x + Math.sin(a) * ring, 0.5 + bob, z + Math.cos(a) * ring);
      _e.set(0, a + Math.PI / 2, 0); _q.setFromEuler(_e);
      _m.compose(_p, _q, _s);
      horses.setMatrixAt(i, _m);
    }
    horses.instanceMatrix.needsUpdate = true;
  });
  ctx.occ(x, z, 9);
}

function teacups(ctx, [x, z]) {
  const { b, world, props } = ctx;
  b.cyl(9.6, 0.4, x, 0, z, '#b8d0e0', { seg: 32 });
  // giant teapot centerpiece with the dormouse
  b.push(x, 0.4, z);
  b.lathe([[0, 0], [2.0, 0.1], [2.5, 1.2], [2.2, 2.4], [1.2, 3.0], [0.4, 3.2], [0.6, 3.4], [0, 3.9]], 0, 0, 0, '#f4f0e6', { mat: 'gloss', seg: 20 });
  b.rod(2.2, 1.0, 0, 3.6, 2.8, 0, 0.28, '#f4f0e6', { mat: 'gloss' });
  b.torus(1.0, 0.16, -2.4, 1.8, 0, '#f4f0e6', { rx: 0, mat: 'gloss' });
  for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; b.sph(0.32, Math.cos(a) * 2.45, 1.4, Math.sin(a) * 2.45, ['#e86a9a', '#6ab8e8', '#f2c94c'][k % 3], { mat: 'gloss', w: 6, h: 4 }); }
  b.ell(0, 3.6, 0, 0.45, 0.5, 0.45, '#b8a088');
  b.sph(0.25, 0, 4.2, 0.1, '#b8a088');
  b.pop();
  // lanterns strung overhead
  for (let k = 0; k < 6; k++) {
    const a = k / 6 * Math.PI * 2;
    const px = x + Math.cos(a) * 10.6, pz = z + Math.sin(a) * 10.6;
    b.cyl(0.12, 7, px, 0, pz, '#3a4a5a', { seg: 6 });
    props.bulbLine([px, 7, pz], [x, 8.2, z], 9, ['#ff6a8a', '#ffd25a', '#7ad0ff', '#9aef8a'], 0.8, 0.28);
  }
  // spinning cups
  const cb = new Builder();
  cb.lathe([[0, 0], [0.7, 0.05], [0.9, 0.3], [1.15, 0.9], [1.25, 1.35], [1.15, 1.35], [1.05, 0.95], [0, 0.95]], 0, 0.15, 0, '#ffffff', { mat: 'gloss', seg: 18 });
  cb.cyl(0.9, 0.15, 0, 0, 0, '#ffffff', { seg: 18, mat: 'gloss' });
  cb.torus(0.35, 0.08, 1.3, 0.85, 0, '#ffffff', { rx: 0, mat: 'gloss' });
  cb.cyl(0.25, 0.9, 0, 0.3, 0, '#e0c070', { seg: 8, mat: 'metal' });
  cb.sph(0.18, -0.4, 1.35, 0.2, '#f2c9a0', { w: 6, h: 5 });
  cb.sph(0.18, 0.4, 1.35, -0.2, '#d9a77c', { w: 6, h: 5 });
  const cups = new THREE.InstancedMesh(cb.buildGeometry(), MATS.gloss, 18);
  const cc = ['#f6a6c1', '#9fd3f2', '#f8e08a', '#b5e8a8', '#d6b4f0', '#ffc39a'];
  for (let i = 0; i < 18; i++) cups.setColorAt(i, _c.set(cc[i % 6]));
  cups.castShadow = true;
  world.add(cups);
  let A1 = 0, A2 = 0, A3 = 0;
  ctx.anims.push((dt, t) => {
    A1 += dt * 0.35; A2 -= dt * 0.8; A3 += dt * 1.6;
    for (let s = 0; s < 3; s++) {
      const sa = A1 + s / 3 * Math.PI * 2;
      const sx = x + Math.cos(sa) * 5.6, sz = z + Math.sin(sa) * 5.6;
      for (let c = 0; c < 6; c++) {
        const ca = A2 + c / 6 * Math.PI * 2;
        const i = s * 6 + c;
        _p.set(sx + Math.cos(ca) * 2.5, 0.4, sz + Math.sin(ca) * 2.5);
        _e.set(0, A3 * (c % 2 ? -1 : 1) + i, 0); _q.setFromEuler(_e);
        _m.compose(_p, _q, _s);
        cups.setMatrixAt(i, _m);
      }
    }
    cups.instanceMatrix.needsUpdate = true;
  });
  ctx.occ(x, z, 10.5);
}

function dumbo(ctx, [x, z]) {
  const { b, world } = ctx;
  b.cyl(9.5, 0.45, x, 0, z, '#d8c6a0', { seg: 32 });
  b.torus(8.8, 0.5, x, 0.45, z, '#9fd3f2', { ts: 40, rs: 6, mat: 'gloss' });
  b.cyl(1.4, 6.5, x, 0.45, z, '#f2ead8', { seg: 16 });
  b.cyl(2.2, 0.6, x, 6.9, z, GOLD, { seg: 16, mat: 'metal' });
  // hot-air-balloon topper with Timothy on top
  b.sph(1.6, x, 9.3, z, '#f2d24a', { mat: 'gloss', w: 14, h: 10 });
  for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; b.rod(x + Math.cos(a) * 1.5, 9.0, z + Math.sin(a) * 1.5, x, 7.5, z, 0.05, '#c8323a'); }
  b.ell(x, 11.15, z, 0.2, 0.28, 0.18, '#c8323a');
  b.sph(0.18, x, 11.55, z, '#b8a088');
  b.cone(0.12, 0.25, x, 11.7, z, '#c8323a', { seg: 6 });
  b.rod(x + 0.15, 11.3, z, x + 0.5, 12.0, z, 0.03, '#f4f0e6');
  // elephants
  const eb = new Builder();
  eb.ell(0, 0.85, 0, 0.6, 0.55, 0.85, '#a9adb8', { mat: 'gloss' });
  eb.sph(0.5, 0, 1.35, 0.75, '#a9adb8', { mat: 'gloss' });
  eb.ell(-0.62, 1.4, 0.6, 0.06, 0.55, 0.5, '#f0b8c8', { mat: 'gloss' });
  eb.ell(0.62, 1.4, 0.6, 0.06, 0.55, 0.5, '#f0b8c8', { mat: 'gloss' });
  eb.rod(0, 1.2, 1.2, 0, 0.95, 1.55, 0.13, '#a9adb8');
  eb.rod(0, 0.95, 1.55, 0, 1.15, 1.8, 0.1, '#a9adb8');
  eb.cyl(0.32, 0.32, 0, 1.75, 0.75, '#f2d24a', { seg: 10, mat: 'gloss' });
  eb.sph(0.08, -0.2, 1.5, 1.18, '#222222', { w: 5, h: 4 }); eb.sph(0.08, 0.2, 1.5, 1.18, '#222222', { w: 5, h: 4 });
  eb.box(0.8, 0.25, 0.9, 0, 1.35, -0.25, '#c8323a', { mat: 'gloss' });
  eb.sph(0.18, -0.2, 1.75, -0.2, '#f2c9a0', { w: 6, h: 5 }); eb.sph(0.18, 0.2, 1.75, -0.35, '#d9a77c', { w: 6, h: 5 });
  const eGeo = eb.buildGeometry();
  const els = new THREE.InstancedMesh(eGeo, MATS.gloss, 16);
  const ec = ['#ffffff', '#f6e8f0', '#eef4ff', '#fff6e6'];
  for (let i = 0; i < 16; i++) els.setColorAt(i, _c.set(ec[i % 4]));
  els.castShadow = true;
  world.add(els);
  const armB = new Builder();
  for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; armB.rod(0, 0, 0, Math.sin(a) * 6.2, 0, Math.cos(a) * 6.2, 0.1, '#e7bd57', { mat: 'metal' }); }
  const armsMesh = armB.build({ name: 'dumboArms' });
  world.add(armsMesh);
  let rot = 0;
  ctx.anims.push((dt, t) => {
    rot += dt * 0.5;
    armsMesh.position.set(x, 4.5, z);
    armsMesh.rotation.y = rot;
    for (let i = 0; i < 16; i++) {
      const a = rot + i / 16 * Math.PI * 2;
      const h = 2.6 + Math.sin(t * 0.6 + i * 0.9) * 2.2;
      _p.set(x + Math.sin(a) * 6.8, h, z + Math.cos(a) * 6.8);
      _e.set(Math.sin(t * 0.6 + i * 0.9 + 1.2) * 0.12, a + Math.PI / 2, 0); _q.setFromEuler(_e);
      _m.compose(_p, _q, _s);
      els.setMatrixAt(i, _m);
    }
    els.instanceMatrix.needsUpdate = true;
  });
  ctx.occ(x, z, 10);
}

function tudor(b, w, d, h, wall, beam, roof) {
  b.box(w, h, d, 0, 0, 0, wall);
  for (let x = -w / 2; x <= w / 2 + 0.01; x += w / 4) b.box(0.25, h, 0.15, x, 0, d / 2 + 0.03, beam);
  b.box(w, 0.25, 0.15, 0, h * 0.5, d / 2 + 0.03, beam);
  for (let k = 0; k < 4; k++) b.box(0.18, h * 0.55, 0.12, -w / 2 + w / 8 + k * w / 4, h * 0.45, d / 2 + 0.04, beam, { rz: k % 2 ? 0.6 : -0.6 });
  b.prism(w + 0.6, h * 0.8, d + 0.6, 0, h, 0, roof, { ry: Math.PI / 2 });
}

function peterPan(ctx, [x, z]) {
  const { b, world } = ctx;
  const ry = faceTo(x, z, -6, -38);
  b.push(x, 0, z, ry);
  tudor(b, 13, 9, 6, '#f2e6cc', '#5a3a24', '#3a4a8a');
  b.push(-4, 0, 2.5);
  b.box(4, 9, 4, 0, 0, 0, '#e8dcc0');
  b.pyr(4.6, 5, 4.6, 0, 9, 0, '#8a3a3a');
  b.cyl(1.2, 0.25, 0, 6.8, 2.05, '#fbf6ea', { rx: Math.PI / 2, seg: 18, mat: 'glow' });
  b.pop();
  for (const wx of [-2, 2, 5]) b.box(1.1, 1.6, 0.12, wx, 1.4, 4.56, WIN, { mat: 'glow' });
  b.box(1.6, 2.6, 0.2, 1.5, 0, 4.6, '#5a3a24');
  b.pop();
  // Captain Hook's ship flying in circles above the roof
  const sb = new Builder();
  sb.box(1.6, 1.0, 4.6, 0, 0, 0, '#5a3a22');
  sb.prism(1.6, 0.8, 1.2, 0, 0, 2.9, '#5a3a22', { rx: Math.PI / 2 });
  sb.box(1.7, 0.15, 4.8, 0, 1.0, 0, GOLD, { mat: 'metal' });
  sb.cyl(0.08, 4, 0, 1.0, 0.3, '#3a2a1a', { seg: 5 });
  sb.box(1.8, 1.4, 0.06, 0, 2.2, 0.3, '#f4efe4', { rx: 0.1 });
  sb.box(1.3, 1.0, 0.06, 0, 3.7, 0.3, '#f4efe4', { rx: 0.1 });
  sb.box(0.6, 0.35, 0.02, 0.3, 4.8, 0.3, '#111111');
  for (let k = 0; k < 10; k++) sb.sph(0.07, rr(-1, 1), rr(-0.5, 0.2), rr(-2.5, 2.5), '#fff6c0', { mat: 'neon', w: 4, h: 3 });
  const ship = sb.build({ name: 'ppShip' });
  world.add(ship);
  ctx.anims.push((dt, t) => {
    const a = t * 0.35;
    ship.position.set(x + Math.cos(a) * 6, 12.5 + Math.sin(t * 0.9) * 0.8, z + Math.sin(a) * 6);
    ship.rotation.set(Math.sin(t * 0.9) * 0.1, -a, -0.15);
  });
  ctx.occ(x, z, 8);
}

function smallWorld(ctx, [x, z]) {
  const { b, world, props } = ctx;
  const ry = faceTo(x, z, 0, -40);
  const W = '#fbf8f2';
  b.push(x, 0, z, ry);
  b.box(30, 6.5, 7, 0, 0, 0, W);
  b.box(30.6, 0.5, 7.6, 0, 6.5, 0, GOLD, { mat: 'metal' });
  // pastel triangles band
  for (let k = 0; k < 15; k++) b.prism(1.8, 1.4, 0.2, -14 + k * 2, 4.6, 3.52, ['#f6b6c8', '#a6d8f0', '#b8e8b0', '#f8e08a', '#d4b8f0'][k % 5]);
  // boat tunnel
  b.box(5, 3.6, 0.6, 0, 0, 3.3, '#1c2a3a', { mat: 'nosnow' });
  b.cyl(2.5, 0.6, 0, 3.6, 3.3, '#1c2a3a', { rx: Math.PI / 2, seg: 16, mat: 'nosnow' });
  b.torus(2.75, 0.2, 0, 3.6, 3.95, GOLD, { rx: 0, arc: Math.PI, mat: 'metal' });
  // world landmarks
  const spire = (sx, h, r, col) => { b.cone(r, h, sx, 6.9, 0, col, { seg: 4, flat: true }); b.sph(0.25, sx, 6.9 + h, 0, GOLD, { mat: 'metal' }); };
  // Eiffel
  b.push(-13, 6.9, 0.5);
  for (const [dx, dz] of [[-1.4, -1.4], [1.4, -1.4], [-1.4, 1.4], [1.4, 1.4]]) b.rod(dx, 0, dz, 0, 11, 0, 0.12, GOLD, { mat: 'metal' });
  b.box(2.2, 0.15, 2.2, 0, 3, 0, GOLD, { mat: 'metal' });
  b.box(1.2, 0.15, 1.2, 0, 6.5, 0, GOLD, { mat: 'metal' });
  b.pop();
  // onion domes
  b.cyl(1.3, 5, -9, 6.9, 0, '#f6b6c8', { seg: 12 });
  b.sph(1.6, -9, 12.6, 0, GOLD, { mat: 'metal', sy: 1.1 });
  b.cone(0.5, 1.6, -9, 13.9, 0, GOLD, { mat: 'metal' });
  // leaning tower
  b.push(-5, 6.9, 0, 0, 1, 0, 0.12);
  for (let k = 0; k < 5; k++) { b.cyl(1.2, 1.1, 0, k * 1.15, 0, W, { seg: 14 }); b.torus(1.25, 0.08, 0, k * 1.15 + 1.1, 0, GOLD, { mat: 'metal', ts: 16 }); }
  b.pop();
  // central clock tower
  b.box(5, 11, 4, 0, 6.5, 0.5, W);
  b.box(5.4, 0.4, 4.4, 0, 17.5, 0.5, GOLD, { mat: 'metal' });
  b.pyr(5, 6, 4, 0, 17.9, 0.5, '#f6b6c8');
  b.sph(0.35, 0, 24.2, 0.5, GOLD, { mat: 'metal' });
  b.cyl(2.1, 0.25, 0, 13.2, 2.5, GOLD, { rx: Math.PI / 2, seg: 24, mat: 'metal' });
  b.cyl(1.85, 0.3, 0, 13.2, 2.55, '#ffffff', { rx: Math.PI / 2, seg: 24, mat: 'glow' });
  for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; b.box(0.12, 0.3, 0.1, Math.sin(a) * 1.55, 13.2 + Math.cos(a) * 1.55, 2.86, '#3a3a6a', { rz: -a }); }
  // Big Ben, pagoda, Taj
  b.box(2.6, 9, 2.6, 5, 6.9, 0, '#a6d8f0');
  b.pyr(2.8, 3.5, 2.8, 5, 15.9, 0, GOLD, { mat: 'metal' });
  for (let k = 0; k < 3; k++) b.pyr(4 - k, 1.2, 4 - k, 9, 6.9 + k * 1.9, 0, ['#b8e8b0', '#f8e08a', '#f6b6c8'][k]);
  spire(9, 2.5, 0.6, GOLD);
  b.sph(2.2, 13, 8.5, 0, W, { sy: 1.0 });
  b.cone(0.5, 1.8, 13, 10.4, 0, GOLD, { mat: 'metal' });
  for (const dx of [-2.6, 2.6]) { b.cyl(0.3, 4, 13 + dx, 6.9, 0, W, { seg: 8 }); b.sph(0.45, 13 + dx, 11.1, 0, GOLD, { mat: 'metal' }); }
  b.pop();
  // clock hands (animated) and the doll parade disc
  const hb = new Builder();
  hb.box(0.14, 1.1, 0.06, 0, 0, 0, '#222244');
  const hourH = hb.build(); const hb2 = new Builder(); hb2.box(0.1, 1.55, 0.06, 0, 0, 0, '#222244'); const minH = hb2.build();
  const clockPos = new THREE.Vector3(0, 13.2, 2.95);
  const cw = clockPos.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), ry).add(new THREE.Vector3(x, 0, z));
  for (const h of [hourH, minH]) { h.position.copy(cw); h.rotation.y = ry; world.add(h); }
  ctx.anims.push(() => {
    const hr = ctx.app.atmos.hour;
    hourH.rotation.set(0, ry, 0); hourH.rotateZ(-(hr % 12) / 12 * Math.PI * 2);
    minH.rotation.set(0, ry, 0); minH.rotateZ(-(hr % 1) * Math.PI * 2);
  });
  // canal + boats
  const cx0 = x + Math.sin(ry) * 7.5, cz0 = z + Math.cos(ry) * 7.5;
  const along = new THREE.Vector3(Math.cos(ry), 0, -Math.sin(ry));
  const canal = rectWater(-14, -2, 14, 2);
  canal.rotateY(ry); canal.translate(cx0, 0, cz0);
  ctx.extraWater.push(canal);
  const boats = [];
  for (let k = 0; k < 3; k++) {
    const bb = new Builder();
    bb.box(1.6, 0.6, 3.6, 0, 0, 0, ['#f6b6c8', '#a6d8f0', '#f8e08a'][k], { mat: 'gloss' });
    for (let j = 0; j < 3; j++) { bb.sph(0.18, -0.35, 0.95, -1 + j, '#f2c9a0', { w: 5, h: 4 }); bb.sph(0.18, 0.35, 0.95, -1 + j, '#c99a72', { w: 5, h: 4 }); }
    const boat = bb.build({ name: 'swBoat' });
    world.add(boat);
    boats.push(boat);
  }
  ctx.anims.push((dt, t) => {
    boats.forEach((bt, k) => {
      const u = ((t * 0.05 + k / 3) % 1);
      const s = -13 + u * 26;
      bt.position.set(cx0 + along.x * s, 0.2, cz0 + along.z * s);
      bt.rotation.y = ry + Math.PI / 2;
      const edge = Math.min(u, 1 - u);
      bt.scale.setScalar(Math.min(1, edge * 12));
    });
  });
  for (let k = -14; k <= 14; k += 0.7) { const p = new THREE.Vector3(k, 6.95, 3.85).applyAxisAngle(new THREE.Vector3(0, 1, 0), ry); props.bulb(x + p.x, p.y, z + p.z, '#fff2c8', 0.1); }
  // topiary animals
  for (let k = 0; k < 4; k++) {
    const p = new THREE.Vector3(-10 + k * 6.5, 0, 12).applyAxisAngle(new THREE.Vector3(0, 1, 0), ry);
    const tx = x + p.x, tz = z + p.z;
    b.ell(tx, 1.3, tz, 1.0, 0.8, 1.4, '#3a6a34', { mat: 'leaf' });
    b.sph(0.6, tx, 2.2, tz + 1.2, '#3a6a34', { mat: 'leaf' });
    if (k % 2) b.rod(tx, 2.4, tz + 1.5, tx, 4.2, tz + 2.2, 0.25, '#3a6a34', { mat: 'leaf' });
  }
  ctx.occ(x, z, 15);
}

function sevenDwarfs(ctx, [x, z]) {
  const { b, props } = ctx;
  b.push(x, 0, z);
  mound(b, 0, 0, 0, 11, 6, 10, '#7a8a5a');
  mound(b, -1, 4, -2, 7, 8, 6, '#8a8278');
  mound(b, 2, 8, -3, 4, 6, 4, '#9a9288');
  mound(b, -4, 3, 3, 4, 4, 4, '#7a7a6a');
  // mine entrance with glowing gems
  b.box(4, 4, 1, 0, 0, 9.2, '#5a3a22');
  b.box(3, 3.2, 1.2, 0, 0, 9.3, '#1a1410', { mat: 'nosnow' });
  for (let k = 0; k < 8; k++) b.oct(0.35, rr(-1.2, 1.2), rr(0.4, 2.8), 9.95, ['#ff4a6a', '#4af0ff', '#7aff6a', '#ffe04a', '#c86aff'][k % 5], { mat: 'neon' });
  b.pop();
  for (let k = 0; k < 14; k++) { const a = rand() * 6.28; props.add('pine', x + Math.cos(a) * rr(6, 11), z + Math.sin(a) * rr(5, 10), { s: rr(0.7, 1.1), y: null }); }
  // Snow White's cottage
  b.push(x - 12, 0, z + 9, 0.6);
  b.box(6, 3.4, 5, 0, 0, 0, '#c9b49a');
  b.prism(6.8, 3.4, 5.8, 0, 3.4, 0, '#8a6a3a', { ry: Math.PI / 2 });
  b.box(1.0, 4, 1.0, 2, 3, -1.5, '#9a8a7a');
  for (const wx of [-1.6, 1.6]) b.box(1.0, 1.0, 0.1, wx, 1.4, 2.52, WIN, { mat: 'glow' });
  b.box(1.1, 2.2, 0.15, 0, 0, 2.55, '#5a3a22');
  b.pop();
  ctx.smokeSpot = ctx.smokeSpot || [];
  ctx.anims.push((dt) => { if (Math.random() < dt * 2.5) ctx.smoke.emit(x - 12 + Math.cos(0.6) * 2 - Math.sin(0.6) * -1.5, 7.2, z + 9 - Math.sin(0.6) * 2 + Math.cos(0.6) * -1.5, 0.8, 0.85, 1.2, 3); });
  const track = [[10, 2, 8], [4, 3.5, 12], [-5, 5, 10], [-11, 7, 3], [-9, 10, -6], [-2, 12, -10], [6, 9.5, -9], [11, 6, -3], [8, 4, 2], [2, 3, 4], [-3, 4.5, 2], [0, 6.5, -2], [7, 3.2, 3.5]];
  coaster(ctx, {
    ox: x, oz: z, pts: track, rail: '#6a5040', spine: '#5a3a22', support: '#6a4a2a', width: 1.1, wood: true,
    nCars: 5, spacing: 2.1, speed: 8,
    carFn: () => simpleCar('#9a6a3a', 2, { w: 1.3, l: 1.9 }),
  });
  ctx.occ(x, z, 13);
}

function poohCorner(ctx, [x, z]) {
  const { b, world } = ctx;
  // giant storybook
  b.push(x + 6, 0, z + 6, -0.6);
  b.box(4.6, 6, 0.4, -2.2, 0, 0, '#2f6a3a', { ry: 0.25 });
  b.box(4.6, 6, 0.4, 2.2, 0, 0, '#2f6a3a', { ry: -0.25 });
  b.box(4.3, 5.6, 0.3, -2.1, 0.2, 0.25, '#f8f2e2', { ry: 0.25 });
  b.box(4.3, 5.6, 0.3, 2.1, 0.2, 0.25, '#f8f2e2', { ry: -0.25 });
  b.pop();
  const sign = makeSign(['小熊维尼', 'Winnie the Pooh'], { w: 3.4, h: 0.9, bg: '#f8f2e2', fg: '#7a4a1a', border: '#c8a050' });
  sign.position.set(x + 6 + Math.sin(-0.6) * 0.6, 4.2, z + 6 + Math.cos(-0.6) * 0.6); sign.rotation.y = -0.6; world.add(sign);
  // Pooh's honey tree
  b.push(x - 5, 0, z - 3);
  b.cyl(1.8, 7, 0, 0, 0, '#7a5a3a', { rt: 1.4, seg: 10 });
  b.sph(4.2, 0, 9, 0, '#4f8a3f', { sy: 0.65, mat: 'leaf' });
  b.box(1.1, 1.8, 0.4, 0, 0, 1.55, '#4a2a14');
  b.box(0.8, 0.8, 0.3, 0.8, 3.0, 1.45, WIN, { mat: 'glow' });
  b.box(1.6, 0.5, 0.15, 0, 2.2, 1.6, '#e8d8a8');
  b.pop();
  // Hunny pot spinner
  b.cyl(6, 0.4, x + 1, 0, z, '#f2c94c', { seg: 24 });
  const pb = new Builder();
  pb.lathe([[0, 0], [0.9, 0.1], [1.2, 0.7], [1.15, 1.3], [0.85, 1.6], [0.9, 1.75], [0, 1.75]], 0, 0, 0, '#e8a02a', { mat: 'gloss', seg: 16 });
  pb.cyl(1.18, 0.35, 0, 0.75, 0, '#7a3a1a', { seg: 16 });
  pb.sph(0.17, -0.3, 1.9, 0.1, '#f2c9a0', { w: 6, h: 5 }); pb.sph(0.17, 0.3, 1.9, -0.1, '#d9a77c', { w: 6, h: 5 });
  const pots = new THREE.InstancedMesh(pb.buildGeometry(), MATS.gloss, 6);
  pots.castShadow = true;
  for (let i = 0; i < 6; i++) pots.setColorAt(i, _c.set(['#ffffff', '#fff2d8', '#ffe8c0'][i % 3]));
  world.add(pots);
  let rot = 0;
  ctx.anims.push((dt) => {
    rot += dt * 0.6;
    for (let i = 0; i < 6; i++) {
      const a = rot + i / 6 * Math.PI * 2;
      _p.set(x + 1 + Math.cos(a) * 3.8, 0.4, z + Math.sin(a) * 3.8);
      _e.set(0, rot * 3 + i, 0); _q.setFromEuler(_e);
      _m.compose(_p, _q, _s); pots.setMatrixAt(i, _m);
    }
    pots.instanceMatrix.needsUpdate = true;
  });
  ctx.occ(x, z, 9);
}

function rapunzelTower(ctx, [x, z]) {
  const { b } = ctx;
  b.cyl(2.4, 15, x, 0, z, '#b9a58a', { seg: 14 });
  for (let y = 1; y < 15; y += 1.2) b.torus(2.42, 0.06, x, y, z, '#a8947a', { ts: 18, rs: 3 });
  b.cyl(3.0, 4.2, x, 15, z, '#efe2c8', { seg: 14 });
  b.cyl(3.3, 0.5, x, 19.2, z, '#c9b08a', { seg: 14 });
  b.cone(3.7, 6.5, x, 19.7, z, '#7a4aa0', { seg: 14, mat: 'gloss' });
  b.sph(0.3, x, 26.3, z, GOLD, { mat: 'metal' });
  b.box(1.4, 1.8, 0.2, x, 16.2, z + 2.95, WIN, { mat: 'glow' });
  // the famous golden hair cascading from the window
  const hair = [];
  for (let i = 0; i <= 16; i++) hair.push(new THREE.Vector3(x + Math.sin(i * 0.7) * 0.3, 16.2 - i * 1.0, z + 3.2 + Math.min(i, 4) * 0.15));
  b.tube(hair, 0.28, '#f2c94c', { seg: 60, rs: 6 });
  for (let k = 0; k < 20; k++) { const a = rand() * 6.28, y = rr(1, 14); b.sph(0.22, x + Math.cos(a) * 2.45, y, z + Math.sin(a) * 2.45, ['#e86ab0', '#ffffff', '#c86aff', '#5a9a4a'][k % 4], { w: 5, h: 4 }); }
  ctx.occ(x, z, 4);
}

function aliceMaze(ctx, [x, z]) {
  const { b } = ctx;
  const grid = [
    '###########',
    '#.....#...#',
    '#.###.#.#.#',
    '#.#...#.#.#',
    '#.#.###.#.#',
    '#...#...#..',
    '###.#.###.#',
    '#...#.....#',
    '#.#####.###',
    '..........#',
    '###########',
  ];
  const cell = 1.1;
  for (let r = 0; r < grid.length; r++) for (let c = 0; c < grid[r].length; c++) {
    if (grid[r][c] !== '#') continue;
    b.box(cell, 1.5, cell, x + (c - 5) * cell, 0, z + (r - 5) * cell, '#2f5a2a', { mat: 'leaf' });
  }
  for (let k = 0; k < 30; k++) b.sph(0.12, x + rr(-5.5, 5.5), 1.55, z + rr(-5.5, 5.5), k % 2 ? '#e8283a' : '#ffffff', { w: 5, h: 4 });
  // giant mushrooms & the Mad Hatter's hat
  for (const [mx, mz, h, r, c] of [[-8, 2, 2.6, 1.6, '#e85a8a'], [-7.5, -3, 1.8, 1.2, '#9a6ae8'], [7.5, 5, 2.2, 1.4, '#e8a03a']]) {
    b.cyl(0.35, h, x + mx, 0, z + mz, '#f4ecd8', { seg: 8 });
    b.dome(r, x + mx, h, z + mz, c, { sy: 0.6, mat: 'gloss' });
  }
  b.push(x + 8, 0, z - 4);
  b.cyl(2.0, 4.5, 0, 0, 0, '#3f7a5a', { seg: 16, rt: 2.4 });
  b.cyl(3.4, 0.3, 0, 0, 0, '#3f7a5a', { seg: 16 });
  b.cyl(2.45, 0.8, 0, 3.2, 0, '#e8a03a', { seg: 16 });
  b.box(0.8, 1.0, 0.05, 1.2, 3.2, 2.15, '#ffffff', { ry: 0.5 });
  b.pop();
  // card soldiers
  for (let k = 0; k < 3; k++) {
    b.box(0.9, 1.4, 0.12, x - 3 + k * 1.6, 0.5, z + 7, '#f8f4ec');
    b.box(0.3, 0.3, 0.14, x - 3 + k * 1.6, 1.0, z + 7, '#d8283a');
    b.sph(0.22, x - 3 + k * 1.6, 2.15, z + 7, '#f2c9a0', { w: 6, h: 5 });
  }
  ctx.occ(x, z, 8);
}

function icePalace(ctx, [x, z]) {
  const { b, props } = ctx;
  const I1 = '#bfe6ff', I2 = '#8fd2ff', I3 = '#e2f4ff';
  b.push(x, 0, z);
  b.cyl(10, 1.0, 0, 0, 0, I3, { seg: 6, flat: true, mat: 'ice' });
  b.cyl(3.2, 20, 0, 1, 0, I1, { seg: 6, flat: true, mat: 'ice', rt: 2.4 });
  b.cone(2.5, 11, 0, 21, 0, I2, { seg: 6, flat: true, mat: 'ice' });
  const sp = [[5, 0, 12, 1.6], [-5, 0, 13, 1.6], [3, 4, 9, 1.3], [-3, 4, 10, 1.3], [3.5, -4, 14, 1.4], [-3.5, -4, 11, 1.4], [7.5, 2, 7, 1.0], [-7.5, 2, 7.5, 1.0], [0, 6.5, 6, 1.1]];
  for (const [sx, sz, h, r] of sp) {
    b.cyl(r, h, sx, 1, sz, I1, { seg: 6, flat: true, mat: 'ice', rt: r * 0.75 });
    b.cone(r * 0.85, h * 0.45, sx, 1 + h, sz, I2, { seg: 6, flat: true, mat: 'ice' });
  }
  // ice staircase up to the doors
  for (let k = 0; k < 10; k++) b.box(2.6, 0.35, 0.9, 0, 1 + k * 0.38, 9.5 - k * 0.6, I3, { mat: 'ice' });
  b.box(2.2, 3.4, 0.4, 0, 4.8, 3.3, '#e8f8ff', { mat: 'ice' });
  // snowflake emblem
  for (let k = 0; k < 6; k++) b.boxc(0.25, 3.4, 0.15, 0, 13, 3.0, '#f0fbff', { rz: k * Math.PI / 3, mat: 'neon' });
  b.pop();
  for (let k = 0; k < 40; k++) { const a = k / 40 * Math.PI * 2; props.bulb(x + Math.cos(a) * 9.6, 1.2, z + Math.sin(a) * 9.6, '#cfeeff', 0.12); }
  ctx.occ(x, z, 11);
}

function matterhorn(ctx, [x, z]) {
  const { b, props } = ctx;
  b.push(x, 0, z);
  const R = 10.5, H = 40;
  // craggy pyramid: tapering flat-shaded segments that twist, plus rock fins
  const layers = 9;
  let ox = 0, oz = 0, y = 0;
  for (let i = 0; i < layers; i++) {
    const t0 = i / layers, t1 = (i + 1) / layers;
    const r0 = R * Math.pow(1 - t0, 1.15) + 0.4, r1 = R * Math.pow(1 - t1, 1.15) + 0.4;
    const lh = H / layers;
    const snow = t0 > 0.42;
    ox += rr(-0.5, 0.5) * (1 - t0); oz += rr(-0.5, 0.5) * (1 - t0);
    b.cyl(r0, lh * 1.05, ox, y, oz, snow ? (i % 2 ? '#f4f6f8' : '#e6ebf0') : (i % 2 ? '#8c8a86' : '#7a7874'), { rt: r1, seg: 5, flat: true, ry: i * 0.9 + rr(0, 0.5) });
    for (let k = 0; k < 3; k++) {
      const a = rr(0, 6.28), rr0 = r0 * 0.85;
      b.box(r0 * 0.45, lh * 1.4, r0 * 0.3, ox + Math.cos(a) * rr0, y, oz + Math.sin(a) * rr0, snow ? '#eef2f6' : '#85837f', { ry: -a, rz: rr(-0.15, 0.15) });
    }
    y += lh;
  }
  b.cone(1.4, 4.5, ox, y, oz, '#f8fafc', { seg: 4, flat: true, ry: 0.4 });
  const H2 = y;
  // ice caves & waterfall pool
  b.box(3.6, 3.0, 0.8, 0, 0, R - 0.4, '#152030', { mat: 'nosnow' });
  b.box(3.0, 2.4, 0.8, 0.5, 6, R * 0.82, '#152030', { mat: 'nosnow', ry: 0.3 });
  b.pop();
  ctx.extraWater.push(ellipseWater(x + 4, z + 11.5, 4, 2));
  // bobsled track spiralling around the mountain
  const pts = [];
  const turns = 2.3, N = 26;
  for (let i = 0; i < N; i++) {
    const t = i / N;
    const a = t * Math.PI * 2 * turns;
    const h = 2.5 + Math.sin(t * Math.PI) * 12;
    const r = R + 3.2 - Math.sin(t * Math.PI) * 3.4;
    pts.push([Math.cos(a) * r, h, Math.sin(a) * r]);
  }
  coaster(ctx, {
    ox: x, oz: z, pts, rail: '#d0d4da', spine: '#9aa0a8', support: '#c8ccd2', width: 1.1,
    nCars: 2, spacing: 2.4, speed: 11,
    carFn: () => {
      const sb = new Builder();
      sb.box(1.3, 0.7, 2.6, 0, 0, 0, '#ffffff', { mat: 'gloss' });
      sb.box(1.32, 0.25, 2.62, 0, 0.35, 0, '#d23a3a', { mat: 'gloss' });
      sb.box(1.32, 0.12, 2.62, 0, 0.62, 0, '#2a5fd8', { mat: 'gloss' });
      for (let k = 0; k < 2; k++) { sb.sph(0.18, -0.25, 1.0, 0.6 - k * 0.9, '#f2c9a0', { w: 6, h: 5 }); sb.sph(0.18, 0.25, 1.0, 0.4 - k * 0.9, '#d9a77c', { w: 6, h: 5 }); }
      return sb.build({ name: 'bobsled' });
    },
  });
  ctx.occ(x, z, R + 3);
}

export function buildFantasy(ctx) {
  const { b, props, world } = ctx;
  carrousel(ctx, A.carousel);
  teacups(ctx, A.teacups);
  dumbo(ctx, A.dumbo);
  peterPan(ctx, A.peterPan);
  smallWorld(ctx, A.smallWorld);
  sevenDwarfs(ctx, A.dwarfs);
  poohCorner(ctx, A.pooh);
  rapunzelTower(ctx, A.rapunzel);
  aliceMaze(ctx, A.alice);
  icePalace(ctx, A.icePalace);
  matterhorn(ctx, A.matterhorn);
  // pennant strings across the Fantasyland courtyard
  const pc = ['#d8283a', '#2f5fc6', '#f2c94c', '#3a9a5a', '#c86ab8'];
  for (const [a, c] of [[[-14, 6, -44], [14, 6, -44]], [[-14, 6, -66], [14, 6, -66]]]) props.bulbLine(a, c, 22, pc, 0.9, 0.22);
  for (const [px, pz] of [[-14, -44], [14, -44], [-14, -66], [14, -66]]) b.cyl(0.14, 6.2, px, 0, pz, '#5a4a3a', { seg: 6 });
  const gs = makeSign(['梦幻世界', 'Fantasyland'], { w: 4.4, h: 0.9, bg: '#3a2a6a', fg: '#ffe9b0' });
  gs.position.set(0, 4.8, -42); world.add(gs);
  b.box(6.6, 0.4, 0.4, 0, 5.4, -42, GOLD, { mat: 'metal' });

  const P = (id, name, en, pos, y, dist, pitch, yaw, extra = {}) => ctx.poi({ id, name, en, land: '梦幻世界', x: pos[0], y, z: pos[1], dist, pitch, yaw, ...extra });
  P('fantasyland', '梦幻世界', 'Fantasyland', [0, -68], 4, 110, 0.6, 0.0, { group: true });
  P('carrousel', '白马王子旋转木马', "Prince Charming Regal Carrousel", A.carousel, 4, 26, 0.3, 0.3);
  P('teacups', '疯帽子旋转茶杯', 'Mad Tea Party', A.teacups, 2, 26, 0.45, -0.4);
  P('dumbo', '小飞象', 'Dumbo the Flying Elephant', A.dumbo, 4, 28, 0.35, -0.6);
  P('peterpan', '小飞侠天空奇遇', "Peter Pan's Flight", A.peterPan, 8, 32, 0.3, 0.7);
  P('smallworld', '小小世界', "it's a small world", A.smallWorld, 9, 48, 0.2, 0.35);
  P('dwarfs', '七个小矮人矿山车', 'Seven Dwarfs Mine Train', A.dwarfs, 6, 44, 0.3, -0.2);
  P('pooh', '小熊维尼蜂蜜罐', 'Hundred Acre Wood', A.pooh, 3, 28, 0.4, 0.4);
  P('rapunzel', '长发公主之塔', "Rapunzel's Tower", A.rapunzel, 14, 34, 0.15, -0.3);
  P('alice', '爱丽丝梦游仙境迷宫', 'Alice in Wonderland Maze', A.alice, 2, 26, 0.6, 0.5);
  P('icepalace', '冰雪奇缘 · 艾莎冰宫', "Elsa's Ice Palace", A.icePalace, 12, 48, 0.2, 0.6);
  P('matterhorn', '马特洪峰雪橇', 'Matterhorn Bobsleds', A.matterhorn, 16, 70, 0.2, -0.9);
}
