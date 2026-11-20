// Main Street U.S.A., Town Square with the giant Christmas tree, the railroad
// station, entrance tunnels, floral Mickey, the hub, streetcar + omnibus.
import * as THREE from 'three';
import { Builder } from '../core/builder.js';
import { makeSign } from '../core/signs.js';
import { C, A } from './layout.js';
import { TRACK_Y } from '../core/config.js';
import { rand } from '../core/rng.js';

const WIN = '#ffd49a';
const PAL = [
  ['#ead2a4', '#fff7ea', '#c8423a', '#2f5f46', '#4b5a68'],
  ['#b5d6c1', '#fffaf0', '#2f7a5a', '#a43a3a', '#5a4a6a'],
  ['#e8b9b1', '#fff5ee', '#6a4aa0', '#2a3f6a', '#3e4a5a'],
  ['#a54a3a', '#f1e6d6', '#e0b040', '#1f3f5f', '#3d3d48'],
  ['#c5d2e6', '#ffffff', '#3a5fa8', '#7a2a3a', '#4b4f5f'],
  ['#f0dfbd', '#8a5a3a', '#2f6a3a', '#7a4a20', '#5a3a2a'],
  ['#d7c08a', '#fff4dc', '#b0303a', '#2b4a2b', '#4a3a2a'],
  ['#9cb9a2', '#f5efe2', '#c06030', '#3a2a4a', '#3a4a4a'],
];

// Victorian shop building, facade at local +z, base at y = 0
export function victorian(b, props, o) {
  const { w, d, floors = 2, pal, roof = 'mansard', bulbs = true, tower = false } = o;
  const [wall, trim, awning, sign, roofC] = pal;
  const gh = 4.4, fh = 3.5;
  const H = gh + (floors - 1) * fh;
  const fz = d / 2;
  b.box(w, H, d, 0, 0, 0, wall);
  // shopfront
  b.box(w - 1.4, 2.5, 0.2, 0, 0.55, fz + 0.02, '#e0a868', { mat: 'glow' });
  for (let x = -w / 2 + 0.7; x <= w / 2 - 0.69; x += 1.35) b.box(0.13, 2.6, 0.26, x, 0.5, fz + 0.06, trim);
  b.box(1.3, 2.7, 0.3, 0, 0, fz + 0.07, '#5b3b2a');
  b.box(w - 1.0, 0.25, 0.3, 0, 0.3, fz + 0.06, trim);
  b.box(w * 0.72, 0.75, 0.22, 0, 3.25, fz + 0.12, sign);
  b.box(w * 0.72 + 0.2, 0.08, 0.26, 0, 3.98, fz + 0.12, '#e5c063', { mat: 'metal' });
  // striped awning
  const n = Math.max(4, Math.floor(w / 0.55));
  for (let i = 0; i < n; i++) {
    b.box(w / n + 0.01, 0.07, 1.7, -w / 2 + (i + 0.5) * w / n, 2.85, fz + 0.75, i % 2 ? awning : '#f6f0e6', { rx: 0.38 });
  }
  // floors
  for (let f = 1; f < floors; f++) {
    const y = gh + (f - 1) * fh;
    b.box(w + 0.25, 0.28, d + 0.25, 0, y - 0.28, 0, trim);
    const nw = Math.max(2, Math.floor(w / 2.0));
    for (let k = 0; k < nw; k++) {
      const x = -w / 2 + (k + 0.5) * w / nw;
      b.box(0.95, 1.75, 0.16, x, y + 0.75, fz + 0.02, WIN, { mat: 'glow' });
      b.box(1.25, 0.2, 0.3, x, y + 2.55, fz + 0.05, trim);
      b.box(1.15, 0.13, 0.32, x, y + 0.62, fz + 0.06, trim);
      if (f === 1 && k % 2 === 0 && w > 6) { // little balcony
        b.box(1.4, 0.1, 0.7, x, y + 0.55, fz + 0.35, trim);
        for (let q = -0.6; q <= 0.61; q += 0.3) b.box(0.05, 0.55, 0.05, x + q, y + 0.6, fz + 0.66, '#2c3a33');
      }
    }
  }
  // cornice
  b.box(w + 0.7, 0.55, d + 0.6, 0, H, 0, trim);
  b.box(w + 0.9, 0.2, d + 0.8, 0, H + 0.5, 0, trim);
  for (let x = -w / 2; x <= w / 2 + 0.01; x += w / Math.max(3, Math.round(w / 1.4))) b.box(0.25, 0.4, 0.35, x, H - 0.4, fz + 0.3, trim);
  let top = H + 0.7;
  if (roof === 'mansard') {
    b.pyr(w + 0.3, 3.0, d + 0.3, 0, top, 0, roofC);
    for (const x of [-w / 4, w / 4]) {
      b.box(1.0, 1.2, 1.0, x, top + 0.2, fz - 0.6, wall);
      b.prism(1.3, 0.7, 1.2, x, top + 1.4, fz - 0.6, roofC);
      b.box(0.55, 0.85, 0.1, x, top + 0.35, fz - 0.06, WIN, { mat: 'glow' });
    }
  } else if (roof === 'gable') {
    b.prism(w + 0.5, 3.2, d + 0.4, 0, top, 0, roofC);
    b.box(1.0, 1.3, 0.1, 0, top + 0.5, fz + 0.2, WIN, { mat: 'glow' });
  } else { // parapet
    b.box(w + 0.3, 1.2, 0.35, 0, top, fz + 0.1, trim);
    b.box(w * 0.4, 0.8, 0.35, 0, top + 1.2, fz + 0.1, trim);
    b.sph(0.25, -w / 2, top + 1.4, fz + 0.1, '#e5c063', { mat: 'metal' });
    b.sph(0.25, w / 2, top + 1.4, fz + 0.1, '#e5c063', { mat: 'metal' });
    b.box(w, 0.4, d, 0, top - 0.2, 0, '#6a6a70');
  }
  if (tower) {
    b.cyl(1.4, 4.5, w / 2 - 0.6, top - 0.5, fz - 0.8, wall, { seg: 12 });
    b.cone(1.8, 3.5, w / 2 - 0.6, top + 4, fz - 0.8, roofC, { seg: 12 });
    b.sph(0.2, w / 2 - 0.6, top + 7.6, fz - 0.8, '#e5c063', { mat: 'metal' });
    b.box(0.6, 1.2, 0.2, w / 2 - 0.6, top + 1.2, fz + 0.6, WIN, { mat: 'glow' });
  }
  // roofline bulbs (Main Street is outlined in lights)
  if (bulbs) {
    for (let x = -w / 2; x <= w / 2 + 0.01; x += 0.55) {
      const p = b.toWorld(x, H + 0.78, fz + 0.48);
      props.bulb(p.x, p.y, p.z, '#ffdca0', 0.1);
    }
  }
  return H;
}

function christmasTree(b, props, x, z) {
  b.push(x, 0, z);
  b.cyl(7.4, 0.6, 0, 0, 0, '#9b8f7e', { seg: 24 });
  b.cyl(0.9, 2.6, 0, 0, 0, '#4a3020', { seg: 8 });
  const tiers = [[6.6, 5.2, 1.6], [5.6, 4.8, 4.5], [4.6, 4.4, 7.2], [3.6, 4.0, 9.8], [2.6, 3.6, 12.2], [1.6, 3.2, 14.4]];
  tiers.forEach(([r, h, y], i) => b.cone(r, h, 0, y, 0, i % 2 ? '#1d5235' : '#215a3a', { seg: 20, mat: 'leaf' }));
  const orn = ['#d9263a', '#f2c13f', '#e9eef5', '#2f6fe0', '#c23fa6', '#ff8a2a'];
  for (let i = 0; i < 140; i++) {
    const t = rand();
    const yy = 2.2 + t * 14.5;
    const rad = (1 - (yy - 1.6) / 16.5) * 6.4 + 0.15;
    const a = rand() * Math.PI * 2;
    b.sph(0.32, Math.cos(a) * rad, yy, Math.sin(a) * rad, orn[i % orn.length], { mat: 'gloss', w: 8, h: 6 });
  }
  // spiral garland of lights
  for (let i = 0; i < 260; i++) {
    const t = i / 260;
    const yy = 2.0 + t * 15.2;
    const rad = (1 - (yy - 1.6) / 16.5) * 6.55 + 0.25;
    const a = t * Math.PI * 2 * 7;
    props.bulb(x + Math.cos(a) * rad, yy, z + Math.sin(a) * rad, ['#ffd27a', '#ff5a4a', '#8fe39a', '#9fc4ff'][i % 4], 0.16);
  }
  // star
  const star = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? 0.55 : 1.35;
    const a = i * Math.PI / 5 + Math.PI / 2;
    if (i === 0) star.moveTo(Math.cos(a) * r, Math.sin(a) * r); else star.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  b.extrude(star, 0.35, 0, 18.6, -0.17, '#ffd55a', { mat: 'neon' });
  // presents around the base
  const gc = ['#c8283a', '#2a6a44', '#f2efe6', '#2c56a8', '#d7a93a'];
  for (let i = 0; i < 14; i++) {
    const a = i / 14 * Math.PI * 2 + 0.2;
    const s = 0.6 + rand() * 0.6;
    b.box(s, s * 0.8, s, Math.cos(a) * 6.9, 0.6, Math.sin(a) * 6.9, gc[i % 5], { ry: a });
    b.box(s + 0.04, 0.12, s + 0.04, Math.cos(a) * 6.9, 0.6 + s * 0.4, Math.sin(a) * 6.9, '#f5d26a', { ry: a, mat: 'gloss' });
  }
  // little fence
  for (let i = 0; i < 36; i++) {
    const a = i / 36 * Math.PI * 2;
    b.cyl(0.07, 0.9, Math.cos(a) * 7.9, 0, Math.sin(a) * 7.9, '#c8a24a', { seg: 5, mat: 'metal' });
  }
  b.torus(7.9, 0.06, 0, 0.85, 0, '#c8a24a', { mat: 'metal', ts: 48 });
  b.pop();
}

function cityHall(b, props) {
  b.push(-20, 0, 98, Math.PI / 2);
  b.box(12, 8.5, 10, 0, 0, 0, '#f3eee3');
  b.box(12.6, 0.6, 10.6, 0, 8.5, 0, '#ffffff');
  b.pyr(12.4, 3, 10.4, 0, 9.1, 0, '#5a6470');
  // portico
  b.box(7, 0.5, 2.6, 0, 0, 5.8, '#e3dccd');
  for (const x of [-3, -1, 1, 3]) b.cyl(0.32, 6.3, x, 0.5, 6.7, '#ffffff', { seg: 10 });
  b.box(7.6, 0.6, 2.8, 0, 6.8, 5.9, '#ffffff');
  b.prism(7.6, 2.2, 2.8, 0, 7.4, 5.9, '#f3eee3');
  for (let f = 0; f < 2; f++) for (const x of [-4.6, -2.2, 2.2, 4.6]) {
    b.box(1, 2, 0.15, x, 1 + f * 4, 5.02, WIN, { mat: 'glow' });
  }
  b.box(1.8, 3, 0.2, 0, 0, 5.05, '#3f5a4a');
  // cupola with clock
  b.box(2.6, 3, 2.6, 0, 11, 0, '#ffffff');
  b.cyl(0.8, 0.12, 0, 12.5, 1.32, '#fffaf0', { rx: Math.PI / 2, seg: 16 });
  b.dome(1.7, 0, 14, 0, '#4f6a5a', { mat: 'gloss' });
  b.cyl(0.05, 4, 0, 15.6, 0, '#cccccc', { seg: 4, mat: 'metal' });
  b.box(1.8, 1.1, 0.05, 0.9, 18.4, 0, '#c8323a');
  b.box(0.9, 0.55, 0.06, 0.45, 18.95, 0, '#2a3f8a');
  b.pop();
  const sign = makeSign(['市政厅', 'City Hall'], { w: 4.2, h: 1.0, bg: '#24402f' });
  sign.position.set(-13.6, 4.6, 98); sign.rotation.y = Math.PI / 2;
  return [sign];
}

function fireStation(b) {
  b.push(-21, 0, 108, Math.PI / 2);
  b.box(10, 8, 8, 0, 0, 0, '#a2453a');
  b.box(10.5, 0.5, 8.5, 0, 8, 0, '#f1e6d6');
  b.box(4, 3.8, 0.3, -2.2, 0, 4.02, '#c0302a');
  b.box(3.6, 3.4, 0.2, -2.2, 0.2, 4.1, '#e8d8b0', { mat: 'glow' });
  for (const x of [-3, 0, 3]) b.box(1.1, 1.9, 0.15, x, 5, 4.02, WIN, { mat: 'glow' });
  b.box(2.4, 2.6, 2.4, 2.5, 8.5, -1, '#a2453a');
  b.pyr(3, 2.2, 3, 2.5, 11.1, -1, '#3d3d48');
  b.sph(0.45, 2.5, 9.6, 0.2, '#d4a83a', { mat: 'metal' });
  b.pop();
}

function theater(b) {
  b.push(20, 0, 98, -Math.PI / 2);
  b.box(12, 9, 10, 0, 0, 0, '#f1d6c0');
  b.box(12.6, 0.6, 10.6, 0, 9, 0, '#fff4ea');
  b.box(8, 1.2, 1.2, 0, 3.6, 5.4, '#7a2a3a');
  for (let x = -3.8; x <= 3.8; x += 0.4) b.sph(0.08, x, 4.85, 6.0, '#ffe6a0', { mat: 'glow', w: 5, h: 4 });
  b.box(6, 2.7, 0.2, 0, 0.4, 5.02, WIN, { mat: 'glow' });
  for (const x of [-4, -1.4, 1.4, 4]) b.box(1, 2, 0.15, x, 5.6, 5.02, WIN, { mat: 'glow' });
  b.cyl(2.2, 12, -5.2, 0, 4.2, '#f1d6c0', { seg: 16 });
  b.cyl(2.5, 0.5, -5.2, 12, 4.2, '#fff4ea', { seg: 16 });
  b.dome(2.4, -5.2, 12.5, 4.2, '#c9a24a', { mat: 'metal' });
  b.cone(0.2, 2.5, -5.2, 14.8, 4.2, '#c9a24a', { mat: 'metal', seg: 6 });
  for (const yy of [3, 7]) for (let k = 0; k < 4; k++) {
    const a = k / 4 * Math.PI * 2 + Math.PI / 4;
    b.push(-5.2 + Math.sin(a) * 2.18, yy, 4.2 + Math.cos(a) * 2.18, a);
    b.box(0.8, 1.8, 0.15, 0, 0, 0, WIN, { mat: 'glow' });
    b.pop();
  }
  b.pop();
  b.push(19, 0, 108, -Math.PI / 2);
  b.box(10, 7.5, 8, 0, 0, 0, '#b9d7c6');
  b.box(10.5, 0.5, 8.5, 0, 7.5, 0, '#ffffff');
  b.prism(10.6, 2.6, 8.6, 0, 8, 0, '#4b5a68', { ry: Math.PI / 2 });
  for (const x of [-3, 0, 3]) { b.box(1.2, 2.2, 0.15, x, 0.6, 4.02, WIN, { mat: 'glow' }); b.box(1.0, 1.8, 0.15, x, 4.4, 4.02, WIN, { mat: 'glow' }); }
  b.pop();
}

function station(b, props) {
  const y = TRACK_Y, zc = 133;
  b.push(0, y, zc);
  // brick body facing south (+z)
  b.box(30, 7.5, 8, 0, 0, 0, '#9a4535');
  b.box(30.6, 0.5, 8.6, 0, 3.6, 0, '#f0e2c8');
  b.box(30.8, 0.6, 8.8, 0, 7.5, 0, '#f0e2c8');
  b.pyr(30.6, 3.6, 8.8, 0, 8.1, 0, '#3f5a4c');
  for (const x of [-12, -8, -4, 4, 8, 12]) {
    b.box(1.3, 2.4, 0.15, x, 0.8, 4.02, WIN, { mat: 'glow' });
    b.box(1.1, 1.8, 0.15, x, 4.6, 4.02, WIN, { mat: 'glow' });
    b.box(1.5, 0.2, 0.3, x, 6.5, 4.05, '#f0e2c8');
  }
  b.box(4, 3.4, 0.3, 0, 0, 4.05, '#3a2a22');
  b.box(3.6, 3.0, 0.2, 0, 0.2, 4.15, '#ffd49a', { mat: 'glow' });
  // central clock tower
  b.box(5, 15, 5, 0, 0, 0.5, '#9a4535');
  b.box(5.6, 0.5, 5.6, 0, 11, 0.5, '#f0e2c8');
  for (const [dx, dz, ry] of [[0, 3.02, 0], [0, -2.02, Math.PI], [2.52, 0.5, Math.PI / 2], [-2.52, 0.5, -Math.PI / 2]]) {
    b.push(dx, 12.8, dz + 0, ry);
    b.cyl(1.55, 0.2, 0, 0, 0, '#d6b25a', { rx: Math.PI / 2, seg: 24, mat: 'metal' });
    b.cyl(1.35, 0.25, 0, 0, 0, '#fbf6ea', { rx: Math.PI / 2, seg: 24, mat: 'glow' });
    b.box(0.12, 1.0, 0.1, 0, 0.0, 0.27, '#222222', { rz: 0.5 });
    b.box(0.12, 0.7, 0.1, 0, 0.0, 0.28, '#222222', { rz: -1.9 });
    b.pop();
  }
  b.box(5.8, 0.6, 5.8, 0, 15, 0.5, '#f0e2c8');
  b.pyr(5.6, 4.2, 5.6, 0, 15.6, 0.5, '#3f5a4c');
  b.cyl(0.05, 3.5, 0, 19.7, 0.5, '#cccccc', { seg: 4, mat: 'metal' });
  b.box(1.6, 1, 0.05, 0.8, 22.2, 0.5, '#c8323a');
  // platform & canopy on the park side, spanning the track
  b.box(30, 0.5, 4, 0, 0, -6.5, '#b8ab98');
  b.box(31, 0.3, 9.5, 0, 4.6, -8, '#2f5a46');
  b.prism(31, 1.4, 9.5, 0, 4.9, -8, '#2f5a46', { ry: Math.PI / 2 });
  for (const x of [-14, -9, -4.5, 4.5, 9, 14]) for (const z of [-4.2, -11.8]) b.cyl(0.15, 4.6, x, 0, z, '#e9e1d0', { seg: 6 });
  // bulbs along the canopy edge
  b.pop();
  for (let x = -15; x <= 15; x += 0.6) props.bulb(x, y + 5.1, zc - 12.8, '#ffdca0', 0.1);
  for (let x = -15; x <= 15; x += 0.6) props.bulb(x, y + 7.95, zc + 4.45, '#ffdca0', 0.1);
  const sign = makeSign(['雪境乐园', 'SNOW GLOBE KINGDOM · EST. 2026'], { w: 12, h: 2.2, bg: '#24402f' });
  sign.position.set(0, y + 9.9, zc + 4.5);
  return [sign];
}

function tunnels(b, props) {
  for (const s of [-1, 1]) {
    const x = s * 11, z = 114.2;
    b.push(x, 0, z);
    b.box(8, 6.5, 1.5, 0, 0, 0, '#9a4535');
    b.box(8.6, 0.6, 1.8, 0, 6.5, 0, '#f0e2c8');
    b.box(4.4, 3.2, 1.8, 0, 0, 0, '#120c0c', { mat: 'nosnow' });
    b.cyl(2.2, 1.8, 0, 3.2, -0.9, '#120c0c', { rx: Math.PI / 2, seg: 16, mat: 'nosnow' });
    b.box(2.4, 1.4, 0.12, s * -0.0, 4.9, -0.82, '#2a4f8a');
    b.pop();
    props.lamp(x - 4.6, z - 1.2, 0);
    props.lamp(x + 4.6, z - 1.2, 0);
  }
}

function floralMickey(b, props) {
  const y = TRACK_Y + 0.05, z = A.floralMickey[1];
  b.push(0, y + 0.8, z, 0, 1, 0.55);
  const disc = (r, x, yy, c, h = 0.25) => b.cyl(r, h, x, 0, yy, c, { seg: 28, mat: 'nosnow' });
  // in the tilted frame, local z acts as "up" on the bed
  disc(6.4, 0, 0, '#3f7a3a', 0.3);
  disc(5.9, 0, 0, '#d33a3a', 0.35);
  disc(5.3, 0, 0, '#5a9a4a', 0.4);
  disc(2.3, 0, -0.4, '#111111', 0.5);
  disc(1.35, -2.2, -2.5, '#111111', 0.5);
  disc(1.35, 2.2, -2.5, '#111111', 0.5);
  disc(1.75, 0, 0.15, '#f2c9a0', 0.55);
  disc(0.55, -0.5, -0.6, '#ffffff', 0.6); disc(0.55, 0.5, -0.6, '#ffffff', 0.6);
  disc(0.25, -0.5, -0.45, '#111111', 0.65); disc(0.25, 0.5, -0.45, '#111111', 0.65);
  disc(0.42, 0, 0.35, '#111111', 0.65);
  disc(0.7, 0, 1.15, '#a8262e', 0.6);
  // yellow border dots
  for (let i = 0; i < 48; i++) {
    const a = i / 48 * Math.PI * 2;
    b.sph(0.22, Math.cos(a) * 5.6, 0.45, Math.sin(a) * 5.6, '#f5cf3a', { w: 6, h: 4, mat: 'nosnow' });
  }
  b.pop();
  // ticket booths & turnstiles
  for (const s of [-1, 1]) {
    b.push(s * 15, y, 141);
    b.box(3, 3, 2.6, 0, 0, 0, '#f2e6d0');
    b.box(2.2, 1.2, 0.2, 0, 1.3, 1.32, WIN, { mat: 'glow' });
    b.pyr(3.8, 1.8, 3.4, 0, 3, 0, '#b03a3a');
    b.sph(0.25, 0, 4.9, 0, '#e5c063', { mat: 'metal' });
    b.pop();
    for (let i = 0; i < 4; i++) b.box(0.4, 1.0, 1.2, s * (7 + i * 1.6), y, 137.5, '#7a7f86', { mat: 'metal' });
    props.lamp(s * 10, 144, 0, y);
    props.lamp(s * 20, 136, 0, y);
  }
}

function hub(b, props) {
  const { x, z } = C.hub;
  b.cyl(1.9, 0.5, x, 0, z, '#d8cfc2', { seg: 20 });
  b.cyl(1.4, 2.0, x, 0.5, z, '#efe8dc', { seg: 20 });
  b.cyl(1.6, 0.25, x, 2.5, z, '#d8cfc2', { seg: 20 });
  // low hedge ring + flower border
  for (let i = 0; i < 40; i++) {
    const a = i / 40 * Math.PI * 2;
    props.add('bush', x + Math.cos(a) * 5.8, z + Math.sin(a) * 5.8, { s: 0.55 });
  }
  for (let i = 0; i < 8; i++) {
    const a = i / 8 * Math.PI * 2 + Math.PI / 8;
    props.lamp(x + Math.cos(a) * 13.6, z + Math.sin(a) * 13.6, -a);
  }
  for (const [tx, tz] of [[-9, 16.5], [9, 16.5], [-13.5, 40], [13.5, 40]]) props.add('topiary', x + tx * 0.9, tz, { s: 1.1, ry: 0 });
  for (let i = 0; i < 6; i++) {
    const a = i / 6 * Math.PI * 2 + 0.25;
    props.add('bench', x + Math.cos(a) * 11.5, z + Math.sin(a) * 11.5, { ry: -a - Math.PI / 2 });
  }
}

// streetcar loop: Main Street lanes + loops around the tree and the hub garden
export function trolleyCurve() {
  const pts = [];
  const lane = 2.3;
  for (let zz = 40; zz <= 92; zz += 4) pts.push(new THREE.Vector3(-lane, 0, zz));
  const tc = A.christmasTree;
  const R1 = Math.hypot(lane, 92 - tc[1]);
  const a0 = Math.atan2(-lane, 92 - tc[1]);
  for (let i = 1; i < 24; i++) {
    const a = a0 + (i / 24) * (2 * Math.abs(a0));
    pts.push(new THREE.Vector3(tc[0] + Math.sin(a) * R1, 0, tc[1] + Math.cos(a) * R1));
  }
  for (let zz = 92; zz >= 40; zz -= 4) pts.push(new THREE.Vector3(lane, 0, zz));
  const hc = [C.hub.x, C.hub.z];
  const R2 = Math.hypot(lane, 40 - hc[1]);
  const b0 = Math.atan2(lane, 40 - hc[1]);
  for (let i = 1; i < 20; i++) {
    const a = b0 + (i / 20) * (Math.PI * 2 - 2 * Math.abs(b0));
    pts.push(new THREE.Vector3(hc[0] + Math.sin(a) * R2, 0, hc[1] + Math.cos(a) * R2));
  }
  return new THREE.CatmullRomCurve3(pts, true, 'centripetal');
}

function rails(b, curve) {
  const N = 600;
  const L = [], R = [];
  const p = new THREE.Vector3(), t = new THREE.Vector3();
  for (let i = 0; i <= N; i++) {
    curve.getPointAt(i / N, p); curve.getTangentAt(i / N, t);
    const nx = -t.z, nz = t.x;
    L.push(new THREE.Vector3(p.x + nx * 0.72, 0.06, p.z + nz * 0.72));
    R.push(new THREE.Vector3(p.x - nx * 0.72, 0.06, p.z - nz * 0.72));
  }
  b.tube(new THREE.CatmullRomCurve3(L, true), 0.07, '#3a3532', { seg: 900, rs: 4, closed: true, mat: 'metal' });
  b.tube(new THREE.CatmullRomCurve3(R, true), 0.07, '#3a3532', { seg: 900, rs: 4, closed: true, mat: 'metal' });
}

function makeStreetcar() {
  const b = new Builder();
  // car body
  b.box(2.3, 0.5, 6.0, 0, 0.55, -1.0, '#3a2a22');
  b.box(2.3, 1.1, 6.0, 0, 1.05, -1.0, '#f1e3c4');
  b.box(2.34, 0.18, 6.04, 0, 1.6, -1.0, '#b23030');
  for (const s of [-1, 1]) for (let z = -3.8; z <= 1.8; z += 1.4) b.cyl(0.06, 1.6, s * 1.08, 1.75, z, '#c9a25a', { seg: 5, mat: 'metal' });
  b.box(2.6, 0.2, 6.4, 0, 3.35, -1.0, '#2f5a3f');
  b.box(1.8, 0.35, 5.6, 0, 3.55, -1.0, '#2f5a3f');
  for (let z = -3.5; z <= 1.5; z += 1.2) {
    b.box(2.0, 0.15, 0.5, 0, 1.6, z, '#7a4f2e');
    const cs = ['#d8483a', '#3a6ad8', '#f2c94c', '#3aa86a', '#e8e8e8'];
    b.sph(0.22, -0.55, 2.35, z, '#f2c9a0', { w: 6, h: 5 }); b.box(0.5, 0.6, 0.35, -0.55, 1.75, z, cs[Math.abs(Math.round(z * 3)) % 5]);
    b.sph(0.22, 0.55, 2.35, z, '#e0b48a', { w: 6, h: 5 }); b.box(0.5, 0.6, 0.35, 0.55, 1.75, z, cs[Math.abs(Math.round(z * 5)) % 5]);
  }
  for (const s of [-1, 1]) for (const z of [-3, 1]) b.cyl(0.45, 0.15, s * 1.1, 0.45, z, '#2a2a2a', { rz: Math.PI / 2, seg: 12 });
  // horse
  b.push(0, 0, 3.6);
  b.ell(0, 1.55, 0, 0.5, 0.6, 1.15, '#7a4a2a');
  for (const [lx, lz] of [[-0.3, 0.7], [0.3, 0.7], [-0.3, -0.7], [0.3, -0.7]]) b.cyl(0.11, 1.2, lx, 0, lz, '#6a3e22', { seg: 6 });
  b.rod(0, 1.9, 0.9, 0, 2.6, 1.45, 0.25, '#7a4a2a');
  b.ell(0, 2.6, 1.75, 0.22, 0.25, 0.55, '#7a4a2a');
  b.box(0.08, 0.5, 0.9, 0, 2.3, 1.1, '#2a1a10', { rx: -0.8 });
  b.sph(0.1, 0, 2.7, 2.25, '#f5f0e8');
  b.rod(0, 1.7, -1.1, 0, 1.0, -1.5, 0.1, '#2a1a10');
  b.pop();
  b.box(0.06, 0.06, 2.0, -0.4, 1.2, 2.6, '#3a2a1a'); b.box(0.06, 0.06, 2.0, 0.4, 1.2, 2.6, '#3a2a1a');
  return b.build({ name: 'streetcar' });
}
function makeOmnibus() {
  const b = new Builder();
  b.box(2.4, 2.2, 5.4, 0, 0.6, 0, '#a32b2b');
  b.box(2.42, 0.2, 5.42, 0, 2.8, 0, '#f1e3c4');
  b.box(2.4, 1.0, 5.4, 0, 3.0, 0, '#2f5a3f');
  b.box(2.5, 0.12, 5.5, 0, 4.0, 0, '#c9a25a', { mat: 'metal' });
  for (const s of [-1, 1]) for (let z = -2; z <= 2; z += 1.0) b.box(0.05, 0.8, 0.7, s * 1.21, 1.5, z, WIN, { mat: 'glow' });
  b.box(2.2, 0.9, 0.05, 0, 1.5, 2.71, WIN, { mat: 'glow' });
  for (let z = -2; z <= 2; z += 1) { b.sph(0.22, -0.5, 4.35, z, '#f2c9a0', { w: 6, h: 5 }); b.sph(0.22, 0.5, 4.35, z, '#e3b48c', { w: 6, h: 5 }); }
  for (const s of [-1, 1]) for (const z of [-1.8, 1.9]) b.cyl(0.55, 0.2, s * 1.2, 0.55, z, '#222222', { rz: Math.PI / 2, seg: 12 });
  b.box(0.6, 0.15, 0.6, 0.8, 0.1, 2.9, '#c9a25a', { mat: 'metal' });
  return b.build({ name: 'omnibus' });
}

export function buildMainStreet(ctx) {
  const { b, props, world } = ctx;
  // building rows: west side faces +x, east side faces -x
  const rows = [
    { side: -1, blocks: [[45, [6.2, 6.6, 6.2]], [68, [7, 7.2, 6.8]]] },
    { side: 1, blocks: [[45, [6.6, 6, 6.4]], [68, [6.8, 7, 7.2]]] },
  ];
  let pi = 0;
  const roofs = ['mansard', 'parapet', 'gable', 'mansard', 'parapet', 'mansard'];
  for (const row of rows) {
    for (const [z0, widths] of row.blocks) {
      let z = z0;
      widths.forEach((w, i) => {
        const zc = z + w / 2;
        const d = 11;
        const xc = row.side * (7 + d / 2);
        b.push(xc, 0, zc, row.side < 0 ? Math.PI / 2 : -Math.PI / 2);
        const floors = (pi % 3 === 1) ? 3 : 2;
        victorian(b, props, { w: w - 0.15, d, floors, pal: PAL[pi % PAL.length], roof: roofs[pi % roofs.length], tower: (i === 0 && z0 === 45) });
        b.pop();
        pi++;
        z += w;
      });
    }
  }
  // corner details at the hub end: round pavilions
  for (const s of [-1, 1]) {
    b.cyl(3.2, 5.2, s * 10.5, 0, 44, '#f3e3c6', { seg: 18 });
    b.cyl(3.5, 0.5, s * 10.5, 5.2, 44, '#fffaf0', { seg: 18 });
    b.cone(3.6, 2.8, s * 10.5, 5.7, 44, '#c6423a', { seg: 18, mat: 'gloss' });
    for (let k = 0; k < 6; k++) {
      const a = k / 6 * Math.PI * 2;
      b.push(s * 10.5 + Math.sin(a) * 3.15, 1.0, 44 + Math.cos(a) * 3.15, a);
      b.box(1.4, 2.6, 0.15, 0, 0, 0, WIN, { mat: 'glow' });
      b.pop();
    }
  }
  const signs = [];
  signs.push(...cityHall(b, props));
  fireStation(b);
  theater(b);
  signs.push(...station(b, props));
  tunnels(b, props);
  floralMickey(b, props);
  christmasTree(b, props, A.christmasTree[0], A.christmasTree[1]);
  hub(b, props);
  for (const s of signs) world.add(s);

  // street lamps & festive garlands
  for (let z = 47; z <= 89; z += 7) {
    props.lamp(-5.7, z, Math.PI / 2);
    props.lamp(5.7, z, Math.PI / 2);
  }
  for (const z of [52, 62, 72, 82]) {
    props.bulbLine([-7.2, 8.6, z], [7.2, 8.6, z], 26, ['#ff5a4a', '#ffd27a', '#7fdc8f', '#ffffff'], 1.4, 0.13);
  }
  for (const [x, z] of [[-24, 92], [24, 92], [-24, 111], [24, 111], [-10, 112], [10, 112], [-12, 92], [12, 92]]) props.lamp(x, z, 0);
  for (const [x, z] of [[-14, 94], [14, 94], [-14, 108], [14, 108]]) props.add('bench', x, z, { ry: x < 0 ? Math.PI / 2 : -Math.PI / 2 });
  for (const [x, z] of [[-9, 96], [9, 96], [-9, 106], [9, 106]]) props.tree('xmas', x, z, 1.25);

  // streetcar + omnibus on the loop
  const curve = trolleyCurve();
  rails(b, curve);
  const car = makeStreetcar(); world.add(car);
  const bus = makeOmnibus(); world.add(bus);
  const len = curve.getLength();
  const p = new THREE.Vector3(), t = new THREE.Vector3();
  let u1 = 0.1, u2 = 0.6;
  ctx.anims.push((dt) => {
    for (const [obj, which] of [[car, 1], [bus, 2]]) {
      let u = which === 1 ? (u1 = (u1 + dt * 2.2 / len) % 1) : (u2 = (u2 + dt * 2.2 / len) % 1);
      curve.getPointAt(u, p); curve.getTangentAt(u, t);
      obj.position.copy(p);
      obj.rotation.y = Math.atan2(t.x, t.z);
    }
  });

  ctx.poi({ id: 'mainstreet', name: '美国小镇大街', en: 'Main Street, U.S.A.', land: '美国小镇大街', x: 0, y: 4, z: 70, dist: 70, pitch: 0.42, yaw: 0.35 });
  ctx.poi({ id: 'tree', name: '小镇广场圣诞树', en: 'Town Square Christmas Tree', land: '美国小镇大街', x: 0, y: 9, z: 101, dist: 42, pitch: 0.25, yaw: 0.6 });
  ctx.poi({ id: 'station', name: '小镇大街火车站', en: 'Main Street Station', land: '美国小镇大街', x: 0, y: 10, z: 130, dist: 50, pitch: 0.2, yaw: 0 });
  ctx.poi({ id: 'floral', name: '米奇花坛', en: 'Floral Mickey', land: '美国小镇大街', x: 0, y: 6, z: 141, dist: 22, pitch: 0.45, yaw: 0 });
  ctx.poi({ id: 'trolley', name: '马拉有轨电车 & 双层巴士', en: 'Horse-drawn Streetcar & Omnibus', land: '美国小镇大街', x: 0, y: 2, z: 60, dist: 26, pitch: 0.3, yaw: 0.8, follow: car });
  ctx.poi({ id: 'hub', name: '中央花园·米奇雕像', en: 'Central Plaza', land: '美国小镇大街', x: 0, y: 3, z: 31, dist: 30, pitch: 0.35, yaw: 0 });
}
