// Character kit: every character is assembled from simple primitives into a
// toy-like figurine (body mesh + one waving arm). Faces +z, feet at y = 0.
import * as THREE from 'three';
import { Builder } from '../core/builder.js';
import { MATS } from '../core/materials.js';

const BK = '#141414', WH = '#ffffff', SKIN = '#f6cfac', SKIN2 = '#e9b48c', SKIN3 = '#b9845c', SKIN4 = '#8a5a3a';
const GOLD = '#e7bd57';

// ---------- shared parts ----------
function eyes(b, y, z, sep, ew, eh, pupil = BK, white = WH, pz = 0.012) {
  for (const s of [-1, 1]) {
    if (white) b.ell(s * sep, y, z, ew, eh, ew * 0.6, white, { w: 10, h: 8 });
    b.ell(s * sep, y - eh * 0.15, z + ew * 0.55 + pz, ew * 0.55, eh * 0.6, ew * 0.3, pupil, { w: 8, h: 6 });
  }
}
function dotEyes(b, y, z, sep, r = 0.022, c = BK) {
  for (const s of [-1, 1]) b.sph(r, s * sep, y, z, c, { w: 6, h: 5 });
}
function gloveArm(arm, len, sleeve, glove, r = 0.045) {
  arm.rod(0, 0, 0, 0, -len, 0.02, r, sleeve, { seg: 8 });
  if (glove) { arm.sph(r * 2.0, 0, -len - r, 0.03, glove, { w: 8, h: 6 }); arm.cyl(r * 1.6, r * 1.2, 0, -len + r * 0.4, 0.02, glove, { seg: 8 }); }
}
function staticArm(b, sx, y, len, sleeve, hand, r = 0.045, out = 0.2) {
  b.rod(sx * 0.0, y, 0, sx * out, y - len, 0.05, r, sleeve, { seg: 8 });
  if (hand) b.sph(r * 1.9, sx * (out + 0.01), y - len - r, 0.06, hand, { w: 8, h: 6 });
}
function legs(b, hipY, sep, color, r = 0.05, shoe = null, shoeSize = [0.09, 0.07, 0.16]) {
  for (const s of [-1, 1]) {
    b.rod(s * sep, hipY, 0, s * sep, 0.08, 0, r, color, { seg: 8 });
    if (shoe) b.ell(s * sep, shoeSize[1], 0.05, shoeSize[0], shoeSize[1], shoeSize[2], shoe, { w: 10, h: 7 });
  }
}

// ---------- Mickey & friends ----------
function mickeyHead(b, y, opts = {}) {
  b.sph(0.32, 0, y, 0, BK, { w: 16, h: 12 });
  b.ell(-0.31, y + 0.33, -0.04, 0.21, 0.21, 0.05, BK, { w: 16, h: 6 });
  b.ell(0.31, y + 0.33, -0.04, 0.21, 0.21, 0.05, BK, { w: 16, h: 6 });
  b.ell(0, y - 0.07, 0.1, 0.26, 0.24, 0.24, '#f4cba4', { w: 14, h: 10 });
  b.ell(0, y - 0.13, 0.27, 0.15, 0.1, 0.12, '#f4cba4');
  b.sph(0.065, 0, y - 0.07, 0.4, BK);
  b.ell(0, y - 0.22, 0.31, 0.09, 0.035, 0.03, '#7a1a1a');
  b.ell(0, y - 0.235, 0.325, 0.045, 0.018, 0.015, '#e86a7a');
  eyes(b, y + 0.07, 0.27, 0.07, 0.05, 0.09);
  if (opts.lashes) for (const s of [-1, 1]) b.box(0.07, 0.015, 0.01, s * 0.1, y + 0.17, 0.29, BK, { rz: s * 0.5 });
}
function mickey(b, arm, o) {
  legs(b, 0.52, 0.12, BK, 0.045, '#f6c62a', [0.12, 0.09, 0.2]);
  b.ell(0, 0.6, 0, 0.27, 0.2, 0.22, '#d8202a');
  b.ell(-0.08, 0.66, 0.2, 0.04, 0.05, 0.02, WH); b.ell(0.08, 0.66, 0.2, 0.04, 0.05, 0.02, WH);
  b.ell(0, 0.86, 0, 0.2, 0.24, 0.17, BK);
  staticArm(b, -1, 0.98, 0.3, BK, WH);
  mickeyHead(b, 1.38);
  b.rod(0, 0.55, -0.2, 0.05, 0.3, -0.5, 0.015, BK);
  if (o.santa) {
    b.cone(0.3, 0.42, 0, 1.6, -0.02, '#d8202a', { rx: -0.35 });
    b.torus(0.29, 0.06, 0, 1.6, 0, WH, { rx: Math.PI / 2 + 0.15 });
    b.sph(0.08, 0, 1.92, -0.2, WH);
  }
  gloveArm(arm, 0.3, BK, WH);
  return { shoulder: [0.19, 0.98, 0], height: 2.0 };
}
function minnie(b, arm) {
  legs(b, 0.5, 0.11, BK, 0.04, '#f6c62a', [0.11, 0.08, 0.18]);
  b.cyl(0.42, 0.42, 0, 0.42, 0, '#d8202a', { rt: 0.18, seg: 16 });
  for (let k = 0; k < 14; k++) { const a = k * 2.4, h = 0.45 + (k % 4) * 0.09, r = 0.42 - (h - 0.42) * 0.55; b.sph(0.03, Math.cos(a) * r, h, Math.sin(a) * r, WH, { w: 5, h: 4 }); }
  b.ell(0, 0.98, 0, 0.18, 0.18, 0.15, '#d8202a');
  staticArm(b, -1, 1.02, 0.28, BK, WH, 0.04);
  mickeyHead(b, 1.42, { lashes: true });
  // bow
  b.ell(-0.14, 1.85, 0.0, 0.15, 0.1, 0.05, '#d8202a', { az: 0.35 });
  b.ell(0.14, 1.85, 0.0, 0.15, 0.1, 0.05, '#d8202a', { az: -0.35 });
  b.sph(0.06, 0, 1.85, 0.02, '#d8202a');
  for (const [x, y] of [[-0.18, 1.88], [-0.1, 1.8], [0.12, 1.88], [0.19, 1.81]]) b.sph(0.025, x, y, 0.05, WH, { w: 5, h: 4 });
  gloveArm(arm, 0.28, BK, WH, 0.04);
  return { shoulder: [0.18, 1.02, 0], height: 2.0 };
}
function duck(b, arm, o) {
  const ORANGE = '#f0a02a';
  for (const s of [-1, 1]) { b.rod(s * 0.1, 0.3, 0, s * 0.11, 0.06, 0.02, 0.035, ORANGE); b.ell(s * 0.12, 0.04, 0.12, 0.12, 0.04, 0.2, ORANGE); }
  b.ell(0, 0.55, -0.02, 0.27, 0.32, 0.25, WH);
  b.cone(0.12, 0.25, 0, 0.45, -0.25, WH, { rx: -2.0 });
  b.ell(0, 0.8, 0, 0.27, 0.2, 0.25, o.shirt);
  if (o.collar) b.ell(0, 0.9, -0.05, 0.26, 0.08, 0.24, o.collar);
  if (o.bowtie) { b.ell(-0.06, 0.94, 0.22, 0.06, 0.04, 0.02, o.bowtie); b.ell(0.06, 0.94, 0.22, 0.06, 0.04, 0.02, o.bowtie); }
  staticArm(b, -1, 0.88, 0.26, o.shirt, WH, 0.045, 0.24);
  b.sph(0.26, 0, 1.22, 0.02, WH);
  b.ell(0, 1.12, 0.24, 0.15, 0.045, 0.17, ORANGE);
  b.ell(0, 1.07, 0.21, 0.12, 0.035, 0.14, ORANGE);
  eyes(b, 1.28, 0.2, 0.07, 0.05, 0.08, o.pupil || '#2a4a9a');
  if (o.lashes) for (const s of [-1, 1]) b.box(0.06, 0.012, 0.01, s * 0.1, 1.38, 0.22, BK, { rz: s * 0.5 });
  if (o.hat) {
    b.cyl(0.17, 0.12, 0, 1.43, -0.03, o.hat, { seg: 14 });
    b.cyl(0.18, 0.04, 0, 1.43, -0.03, BK, { seg: 14 });
    b.rod(0.1, 1.48, -0.12, 0.12, 1.36, -0.3, 0.02, BK);
  }
  if (o.bow) { b.ell(-0.12, 1.47, -0.02, 0.12, 0.07, 0.04, o.bow, { az: 0.3 }); b.ell(0.12, 1.47, -0.02, 0.12, 0.07, 0.04, o.bow, { az: -0.3 }); b.sph(0.05, 0, 1.47, 0, o.bow); }
  gloveArm(arm, 0.26, o.shirt, WH);
  return { shoulder: [0.22, 0.9, 0], height: 1.5 };
}
function goofy(b, arm) {
  legs(b, 0.85, 0.12, '#2f4f8a', 0.06, '#8a5a2a', [0.13, 0.1, 0.26]);
  b.ell(0, 0.95, 0, 0.24, 0.16, 0.2, '#2f4f8a');
  b.ell(0, 1.22, 0, 0.23, 0.26, 0.19, '#e8742a');
  b.ell(0, 1.2, 0.04, 0.24, 0.2, 0.17, BK, { sy: 1 });
  b.ell(0, 1.48, 0.0, 0.12, 0.08, 0.12, '#e8742a');
  staticArm(b, -1, 1.38, 0.42, '#e8742a', WH, 0.05, 0.28);
  b.ell(0, 1.78, 0.03, 0.22, 0.24, 0.22, BK);
  b.ell(0, 1.66, 0.25, 0.14, 0.11, 0.24, '#d9b991');
  b.sph(0.06, 0, 1.72, 0.5, BK);
  b.box(0.035, 0.06, 0.02, -0.025, 1.56, 0.42, WH); b.box(0.035, 0.06, 0.02, 0.025, 1.56, 0.42, WH);
  eyes(b, 1.88, 0.19, 0.06, 0.05, 0.08);
  for (const s of [-1, 1]) b.box(0.05, 0.42, 0.14, s * 0.23, 1.42, -0.02, BK, { rz: s * 0.12 });
  b.cyl(0.2, 0.22, 0, 1.98, -0.02, '#3a8a3a', { seg: 14, rt: 0.17 });
  b.cyl(0.26, 0.03, 0, 1.98, -0.02, '#3a8a3a', { seg: 14 });
  gloveArm(arm, 0.42, '#e8742a', WH, 0.05);
  return { shoulder: [0.24, 1.38, 0], height: 2.3 };
}
function pluto(b) {
  const Y = '#e8a83a';
  b.ell(0, 0.5, -0.05, 0.2, 0.2, 0.42, Y);
  for (const [x, z] of [[-0.12, 0.25], [0.12, 0.25], [-0.12, -0.32], [0.12, -0.32]]) { b.rod(x, 0.45, z, x, 0.05, z + 0.02, 0.045, Y); b.ell(x, 0.04, z + 0.06, 0.06, 0.04, 0.09, Y); }
  b.torus(0.12, 0.03, 0, 0.72, 0.28, '#3a8a3a', { rx: 1.0 });
  b.rod(0, 0.6, 0.25, 0, 0.88, 0.38, 0.1, Y);
  b.ell(0, 0.95, 0.42, 0.17, 0.16, 0.18, Y);
  b.ell(0, 0.88, 0.62, 0.08, 0.07, 0.17, Y);
  b.sph(0.05, 0, 0.9, 0.79, BK);
  eyes(b, 1.02, 0.55, 0.05, 0.035, 0.06);
  for (const s of [-1, 1]) b.ell(s * 0.17, 0.85, 0.36, 0.035, 0.18, 0.07, BK, { az: s * 0.2 });
  b.rod(0, 0.6, -0.45, 0, 0.85, -0.65, 0.025, BK);
  return { height: 1.1 };
}
function chipmunk(b, arm, nose) {
  const BR = '#8a5a33', TAN = '#e2c49c';
  legs(b, 0.3, 0.08, BR, 0.04, BR, [0.07, 0.05, 0.12]);
  b.ell(0, 0.42, 0, 0.18, 0.22, 0.16, BR);
  b.ell(0, 0.42, 0.06, 0.12, 0.16, 0.12, TAN);
  staticArm(b, -1, 0.55, 0.18, BR, BR, 0.035);
  b.sph(0.2, 0, 0.78, 0.02, BR);
  b.ell(0, 0.72, 0.12, 0.15, 0.11, 0.12, TAN);
  b.sph(0.04, 0, 0.76, 0.24, nose);
  b.box(nose === BK ? 0.04 : 0.06, 0.05, 0.01, 0, 0.66, 0.22, WH);
  eyes(b, 0.85, 0.16, 0.06, 0.04, 0.06);
  for (const s of [-1, 1]) b.sph(0.07, s * 0.15, 0.95, -0.02, BR);
  b.ell(0, 0.6, -0.25, 0.12, 0.32, 0.1, '#6a4020', { ax: -0.5 });
  gloveArm(arm, 0.18, BR, BR, 0.035);
  return { shoulder: [0.15, 0.55, 0], height: 1.1 };
}

// ---------- humans ----------
const HAIR = {
  cap(b, y, c, s = 1) { b.sph(0.128 * s, 0, y + 0.02 * s, -0.025 * s, c, { w: 14, h: 10 }); },
};
function head(b, y, skin, o = {}) {
  b.cyl(0.045, 0.12, 0, y - 0.2, 0, skin, { seg: 8 });
  b.sph(0.12, 0, y, 0.01, skin, { w: 14, h: 10 });
  dotEyes(b, y + 0.01, 0.115, 0.042, 0.018, o.eye || '#2a2a3a');
  b.ell(0, y - 0.055, 0.115, 0.03, 0.01, 0.01, o.lip || '#c8505a');
  b.ell(-0.07, y - 0.025, 0.1, 0.025, 0.015, 0.01, '#f0a0a0'); b.ell(0.07, y - 0.025, 0.1, 0.025, 0.015, 0.01, '#f0a0a0');
}
function hairStyle(b, y, c, style) {
  HAIR.cap(b, y, c);
  switch (style) {
    case 'bun': b.sph(0.07, 0, y + 0.14, -0.06, c); break;
    case 'long': b.ell(0, y - 0.15, -0.07, 0.14, 0.24, 0.07, c); break;
    case 'xlong': b.ell(0, y - 0.3, -0.08, 0.15, 0.4, 0.08, c); break;
    case 'short': b.ell(0, y - 0.03, -0.03, 0.15, 0.1, 0.12, c); break;
    case 'braid':
      for (let k = 0; k < 7; k++) b.sph(0.045 - k * 0.003, 0.07 + k * 0.012, y - 0.08 - k * 0.07, 0.05 + k * 0.012, c, { w: 6, h: 5 });
      break;
    case 'braids2':
      for (const s of [-1, 1]) for (let k = 0; k < 6; k++) b.sph(0.04, s * (0.1 + k * 0.005), y - 0.08 - k * 0.07, 0.04 + k * 0.01, c, { w: 6, h: 5 });
      break;
    case 'pony':
      b.ell(0, y - 0.25, -0.12, 0.08, 0.3, 0.07, c);
      for (let k = 0; k < 3; k++) b.torus(0.07, 0.015, 0, y - 0.1 - k * 0.15, -0.12, '#2fb0a8', { rx: Math.PI / 2 });
      break;
    case 'curly':
      for (let k = 0; k < 14; k++) { const a = k / 14 * Math.PI * 2; b.sph(0.08, Math.cos(a) * 0.14, y + Math.sin(a) * 0.1 - 0.02, -0.06 + Math.sin(a * 2) * 0.03, c, { w: 7, h: 5 }); }
      b.ell(0, y - 0.18, -0.08, 0.18, 0.22, 0.09, c);
      break;
    case 'ariel':
      b.ell(0, y - 0.12, -0.08, 0.17, 0.26, 0.1, c);
      b.sph(0.09, -0.08, y + 0.08, 0.02, c); b.sph(0.09, 0.08, y + 0.1, 0.0, c);
      break;
    case 'halfup': b.ell(0, y - 0.16, -0.07, 0.14, 0.23, 0.07, c); b.sph(0.05, 0, y + 0.02, -0.12, c); break;
    case 'pixie': b.ell(0, y + 0.03, -0.02, 0.14, 0.11, 0.13, c); break;
  }
}
function princess(b, arm, o) {
  const skin = o.skin || SKIN;
  if (o.tail) {
    b.cyl(0.2, 0.5, 0, 0.0, 0, o.tail, { rt: 0.16, seg: 12 });
    b.ell(0, 0.08, 0.15, 0.28, 0.06, 0.16, o.tail, { ax: 0.4 });
    b.cyl(0.16, 0.45, 0, 0.5, 0, o.tail, { rt: 0.15, seg: 12 });
  } else if (o.pants) {
    legs(b, 0.85, 0.08, o.pants, 0.07, o.shoes || '#6a4a2a', [0.07, 0.05, 0.12]);
    b.ell(0, 0.88, 0, 0.17, 0.12, 0.13, o.pants);
  } else {
    b.cyl(o.wide || 0.5, 0.95, 0, 0, 0, o.skirt, { rt: 0.16, seg: 18 });
    if (o.hem) b.cyl((o.wide || 0.5) + 0.03, 0.12, 0, 0, 0, o.hem, { rt: (o.wide || 0.5) - 0.02, seg: 18 });
    if (o.over) b.cyl((o.wide || 0.5) * 0.85, 0.55, 0, 0.42, 0.02, o.over, { rt: 0.17, seg: 16 });
  }
  b.ell(0, 1.1, 0, 0.15, 0.19, 0.11, o.top);
  if (o.sash) b.torus(0.15, 0.03, 0, 0.98, 0, o.sash, { rx: Math.PI / 2 });
  b.ell(0, 1.27, 0, 0.13, 0.05, 0.08, o.neck || skin);
  if (o.collar) b.ell(0, 1.3, -0.04, 0.16, 0.06, 0.1, o.collar);
  if (o.puff) for (const s of [-1, 1]) b.sph(0.075, s * 0.17, 1.24, 0, o.puff);
  staticArm(b, -1, 1.22, 0.36, o.sleeve || skin, skin, 0.038, 0.12);
  head(b, 1.5, skin, { eye: o.eye, lip: o.lip });
  hairStyle(b, 1.5, o.hair, o.style);
  if (o.crown) {
    b.torus(0.07, 0.015, 0, 1.64, -0.01, GOLD, { rx: Math.PI / 2, mat: 'metal' });
    for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2; b.cone(0.018, 0.06, Math.cos(a) * 0.07, 1.64, -0.01 + Math.sin(a) * 0.07, GOLD, { seg: 4, mat: 'metal' }); }
  }
  if (o.tiara) b.torus(0.11, 0.015, 0, 1.6, 0.0, o.tiara, { rx: 1.2, arc: Math.PI, mat: 'metal' });
  if (o.band) b.torus(0.125, 0.018, 0, 1.56, -0.01, o.band, { rx: 1.35 });
  if (o.bow) { b.ell(-0.06, 1.65, 0, 0.06, 0.035, 0.02, o.bow, { az: 0.3 }); b.ell(0.06, 1.65, 0, 0.06, 0.035, 0.02, o.bow, { az: -0.3 }); }
  if (o.flower) b.sph(0.035, 0.1, 1.57, 0.05, o.flower, { w: 6, h: 4 });
  if (o.cape) b.box(0.42, 1.1, 0.02, 0, 0.15, -0.14, o.cape, { rx: 0.12, mat: o.capeMat || 'std' });
  if (o.hat === 'crown2') b.cyl(0.08, 0.06, 0, 1.63, 0, GOLD, { seg: 8, mat: 'metal' });
  if (o.extra) o.extra(b);
  gloveArm(arm, 0.36, o.sleeve || skin, skin, 0.038);
  return { shoulder: [0.16, 1.22, 0], height: 1.75 };
}
function man(b, arm, o) {
  const skin = o.skin || SKIN;
  const s = o.scale || 1;
  legs(b, 0.9 * s, 0.09 * s, o.pants, 0.065 * s, o.shoes || '#3a2a1a', [0.08 * s, 0.05 * s, 0.13 * s]);
  b.ell(0, 1.12 * s, 0, 0.19 * s, 0.26 * s, 0.13 * s, o.top);
  if (o.vest) b.ell(0, 1.14 * s, 0.015, 0.195 * s, 0.22 * s, 0.13 * s, o.vest);
  if (o.belt) b.torus(0.17 * s, 0.025, 0, 0.9 * s, 0, o.belt, { rx: Math.PI / 2 });
  if (o.coat) b.cyl(0.24 * s, 0.75 * s, 0, 0.55 * s, -0.02, o.coat, { rt: 0.2 * s, seg: 12 });
  staticArm(b, -1, 1.32 * s, 0.4 * s, o.sleeve || o.top, o.glove || skin, 0.045 * s, 0.22 * s);
  head(b, 1.58 * s, skin, { lip: '#b0605a' });
  if (o.hair) hairStyle(b, 1.58 * s, o.hair, o.style || 'pixie');
  if (o.hat) o.hat(b, 1.58 * s);
  if (o.extra) o.extra(b, s);
  gloveArm(arm, 0.4 * s, o.sleeve || o.top, o.glove || skin, 0.045 * s);
  return { shoulder: [0.2 * s, 1.32 * s, 0], height: 1.85 * s };
}
function dwarf(b, arm, o) {
  legs(b, 0.35, 0.08, '#6a4a2a', 0.05, '#4a2a1a', [0.08, 0.05, 0.13]);
  b.ell(0, 0.55, 0, 0.22, 0.26, 0.18, o.tunic);
  b.torus(0.2, 0.03, 0, 0.46, 0, '#3a2a1a', { rx: Math.PI / 2 });
  staticArm(b, -1, 0.7, 0.24, o.tunic, SKIN, 0.045, 0.24);
  b.sph(0.17, 0, 0.98, 0.02, SKIN);
  b.sph(0.06, 0, 0.95, 0.19, '#f0a090');
  dotEyes(b, 1.03, 0.15, 0.06, 0.02);
  if (o.beard !== false) b.ell(0, 0.82, 0.1, 0.15, 0.17, 0.08, o.beard || '#f2f2f2');
  if (o.glasses) b.torus(0.04, 0.008, -0.06, 1.03, 0.17, BK, { rx: 0 }), b.torus(0.04, 0.008, 0.06, 1.03, 0.17, BK, { rx: 0 });
  b.cone(0.17, o.long ? 0.55 : 0.35, 0, 1.08, -0.02, o.hat, { rx: -0.35, seg: 10 });
  if (o.ears) for (const s of [-1, 1]) b.ell(s * 0.19, 0.98, 0, 0.05, 0.09, 0.03, SKIN);
  gloveArm(arm, 0.24, o.tunic, SKIN, 0.045);
  return { shoulder: [0.2, 0.7, 0], height: 1.25 };
}

// ---------- animals & creatures ----------
function bear(b, arm, o) {
  const c = o.fur;
  legs(b, 0.3, 0.12, c, 0.08, c, [0.1, 0.06, 0.14]);
  b.ell(0, 0.55, 0, 0.3, 0.32, 0.26, c);
  if (o.belly) b.ell(0, 0.52, 0.12, 0.2, 0.22, 0.16, o.belly);
  if (o.shirt) b.ell(0, 0.72, 0, 0.31, 0.2, 0.27, o.shirt);
  if (o.collar) b.ell(0, 0.86, 0.02, 0.27, 0.07, 0.24, o.collar);
  staticArm(b, -1, 0.8, 0.28, o.shirt || c, c, 0.07, 0.3);
  b.sph(0.27, 0, 1.1, 0.02, c, { w: 14, h: 10 });
  b.ell(0, 1.04, 0.2, 0.13, 0.1, 0.1, o.muzzle || c);
  b.ell(0, 1.08, 0.3, 0.05, 0.035, 0.03, o.nose || BK);
  dotEyes(b, 1.16, 0.24, 0.08, 0.028);
  for (const s of [-1, 1]) { b.sph(0.09, s * 0.2, 1.32, -0.02, c); b.sph(0.05, s * 0.2, 1.32, 0.04, o.innerEar || o.muzzle || c); }
  if (o.mickeyMark) { b.sph(0.06, 0.14, 0.9, 0.24, o.mickeyMark, { w: 6, h: 5 }); b.sph(0.035, 0.09, 0.97, 0.22, o.mickeyMark, { w: 5, h: 4 }); b.sph(0.035, 0.19, 0.97, 0.22, o.mickeyMark, { w: 5, h: 4 }); }
  if (o.extra) o.extra(b);
  gloveArm(arm, 0.28, o.shirt || c, c, 0.07);
  return { shoulder: [0.3, 0.8, 0], height: 1.45 };
}
function fox(b, arm, o) {
  const c = o.fur;
  legs(b, 0.38, 0.1, c, 0.06, o.feet || c, [0.08, 0.05, 0.13]);
  b.ell(0, 0.62, 0, 0.24, 0.3, 0.2, c);
  b.ell(0, 0.6, 0.1, 0.15, 0.22, 0.12, o.belly || WH);
  if (o.top) b.ell(0, 0.72, 0, 0.25, 0.2, 0.21, o.top);
  if (o.tie) b.box(0.05, 0.22, 0.02, 0, 0.68, 0.21, o.tie);
  staticArm(b, -1, 0.82, 0.3, o.top || c, c, 0.05, 0.26);
  b.sph(0.22, 0, 1.14, 0.02, c, { w: 14, h: 10 });
  b.ell(0, 1.07, 0.18, 0.12, 0.09, 0.14, o.muzzle || WH);
  b.sph(0.035, 0, 1.1, 0.32, BK);
  eyes(b, 1.2, 0.17, 0.07, 0.04, 0.05, o.eye || '#3a2a6a');
  for (const s of [-1, 1]) {
    b.cone(0.1, o.earLen || 0.22, s * 0.13, 1.3, -0.02, c, { rz: -s * 0.3, seg: 6 });
    b.cone(0.06, (o.earLen || 0.22) * 0.75, s * 0.13, 1.31, 0.02, o.innerEar || '#f8d8e0', { rz: -s * 0.3, seg: 6 });
  }
  if (o.tail) { b.ell(0.15, 0.55, -0.32, 0.14, 0.32, 0.14, o.tail, { ax: -0.6, az: -0.4 }); b.ell(0.25, 0.8, -0.5, 0.09, 0.1, 0.09, o.tailTip || WH); }
  if (o.extra) o.extra(b);
  gloveArm(arm, 0.3, o.top || c, c, 0.05);
  return { shoulder: [0.24, 0.82, 0], height: 1.5 };
}
function bunny(b, arm, o) {
  const c = o.fur;
  legs(b, 0.35, 0.1, c, 0.06, c, [0.09, 0.05, 0.16]);
  b.ell(0, 0.6, 0, 0.22, 0.28, 0.19, c);
  b.ell(0, 0.58, 0.09, 0.14, 0.2, 0.11, o.belly || WH);
  if (o.top) b.ell(0, 0.68, 0, 0.23, 0.22, 0.2, o.top);
  if (o.skirt) b.cyl(0.36, 0.14, 0, 0.42, 0, o.skirt, { rt: 0.24, seg: 16 });
  staticArm(b, -1, 0.8, 0.28, o.top || c, c, 0.05, 0.24);
  b.sph(0.21, 0, 1.08, 0.02, c, { w: 14, h: 10 });
  b.ell(0, 1.02, 0.16, 0.1, 0.07, 0.08, o.muzzle || WH);
  b.sph(0.028, 0, 1.06, 0.24, o.nose || '#f08aa0');
  eyes(b, 1.13, 0.17, 0.075, 0.045, 0.06, o.eye || '#5a3a8a');
  for (const s of [-1, 1]) {
    b.ell(s * 0.08, 1.45, -0.02, 0.06, o.earH || 0.3, 0.04, c, { az: -s * (o.droop ? 0.9 : 0.12) });
    b.ell(s * 0.08, 1.45, 0.01, 0.035, (o.earH || 0.3) * 0.8, 0.02, o.innerEar || '#f8c8d8', { az: -s * (o.droop ? 0.9 : 0.12) });
  }
  if (o.extra) o.extra(b);
  gloveArm(arm, 0.28, o.top || c, c, 0.05);
  return { shoulder: [0.22, 0.8, 0], height: 1.5 };
}
function stitch(b, arm) {
  const BL = '#3a6ad8', LB = '#8ab0f0';
  legs(b, 0.22, 0.1, BL, 0.06, BL, [0.08, 0.04, 0.1]);
  b.ell(0, 0.42, 0, 0.2, 0.22, 0.17, BL);
  b.ell(0, 0.4, 0.08, 0.13, 0.15, 0.1, LB);
  staticArm(b, -1, 0.5, 0.2, BL, BL, 0.045, 0.22);
  b.ell(0, 0.82, 0.04, 0.28, 0.22, 0.24, BL);
  b.ell(0, 0.76, 0.24, 0.12, 0.08, 0.06, LB);
  b.ell(0, 0.82, 0.29, 0.07, 0.045, 0.04, '#1a2a5a');
  for (const s of [-1, 1]) {
    b.ell(s * 0.13, 0.9, 0.2, 0.08, 0.09, 0.05, '#0a0f1a');
    b.sph(0.02, s * 0.11, 0.93, 0.25, WH, { w: 5, h: 4 });
    b.ell(s * 0.33, 0.95, -0.02, 0.2, 0.08, 0.03, BL, { az: -s * 0.3, ay: s * 0.2 });
    b.ell(s * 0.3, 0.95, 0.0, 0.13, 0.05, 0.025, '#e8a0c0', { az: -s * 0.3, ay: s * 0.2 });
  }
  b.ell(0, 0.66, 0.22, 0.12, 0.03, 0.02, '#1a1a2a');
  gloveArm(arm, 0.2, BL, BL, 0.045);
  return { shoulder: [0.2, 0.5, 0], height: 1.15 };
}
function baymax(b, arm) {
  legs(b, 0.4, 0.17, WH, 0.12, WH, [0.14, 0.07, 0.18]);
  b.ell(0, 0.95, 0, 0.55, 0.6, 0.45, '#fbfbfb', { w: 18, h: 14 });
  staticArm(b, -1, 1.25, 0.6, '#fbfbfb', '#fbfbfb', 0.13, 0.5);
  b.ell(0, 1.72, 0.02, 0.27, 0.2, 0.22, '#fbfbfb');
  b.sph(0.035, -0.09, 1.73, 0.21, BK); b.sph(0.035, 0.09, 1.73, 0.21, BK);
  b.box(0.18, 0.01, 0.01, 0, 1.73, 0.215, BK);
  gloveArm(arm, 0.6, '#fbfbfb', '#fbfbfb', 0.13);
  return { shoulder: [0.5, 1.25, 0], height: 2.0 };
}
function olaf(b, arm) {
  b.sph(0.32, 0, 0.3, 0, '#fbfdff', { w: 14, h: 10 });
  b.sph(0.24, 0, 0.75, 0, '#fbfdff', { w: 14, h: 10 });
  for (const y of [0.85, 0.7, 0.55]) b.sph(0.04, 0, y, 0.24, '#1a1a1a', { w: 6, h: 5 });
  b.ell(0, 1.18, 0.02, 0.22, 0.24, 0.2, '#fbfdff');
  b.cone(0.05, 0.25, 0, 1.15, 0.2, '#f08a2a', { rx: Math.PI / 2, seg: 8 });
  dotEyes(b, 1.24, 0.19, 0.07, 0.03);
  for (const s of [-1, 1]) b.box(0.08, 0.02, 0.02, s * 0.08, 1.33, 0.2, '#3a2a1a', { rz: s * 0.3 });
  b.ell(0, 1.05, 0.19, 0.1, 0.04, 0.03, '#2a1a1a'); b.box(0.04, 0.05, 0.01, 0, 1.04, 0.22, WH);
  for (let k = 0; k < 3; k++) b.rod(0, 1.38, 0, (k - 1) * 0.06, 1.55, (k - 1) * 0.03, 0.01, '#5a3a22');
  b.rod(-0.2, 0.8, 0, -0.5, 0.95, 0.05, 0.02, '#5a3a22');
  arm.rod(0, 0, 0, 0, -0.32, 0.02, 0.02, '#5a3a22');
  for (let k = 0; k < 3; k++) arm.rod(0, -0.3, 0.02, (k - 1) * 0.04, -0.38, 0.02, 0.012, '#5a3a22');
  return { shoulder: [0.2, 0.82, 0], height: 1.4 };
}
function quadruped(b, arm, o) {
  const c = o.fur, s = o.scale || 1;
  b.push(0, 0, 0, 0, s);
  b.ell(0, 0.95, 0, 0.32, 0.32, 0.65, c);
  for (const [x, z] of [[-0.2, 0.42], [0.2, 0.42], [-0.2, -0.45], [0.2, -0.45]]) { b.rod(x, 0.85, z, x, 0.05, z, 0.07, c); b.ell(x, 0.05, z + 0.03, 0.08, 0.05, 0.1, o.hoof || '#3a2a1a'); }
  b.rod(0, 1.1, 0.45, 0, 1.5, 0.7, 0.14, c);
  b.ell(0, 1.58, 0.82, 0.16, 0.17, 0.28, c);
  if (o.muzzle) b.ell(0, 1.5, 1.05, 0.11, 0.1, 0.1, o.muzzle);
  b.sph(0.05, 0, 1.55, 1.12, o.nose || BK);
  dotEyes(b, 1.68, 0.95, 0.09, 0.025);
  for (const sx of [-1, 1]) b.ell(sx * 0.14, 1.74, 0.72, 0.05, 0.09, 0.04, c, { az: -sx * 0.5 });
  if (o.antlers) for (const sx of [-1, 1]) { b.rod(sx * 0.08, 1.75, 0.72, sx * 0.3, 2.2, 0.6, 0.03, o.antlers); b.rod(sx * 0.2, 2.0, 0.66, sx * 0.4, 2.1, 0.8, 0.025, o.antlers); b.rod(sx * 0.25, 2.1, 0.63, sx * 0.15, 2.35, 0.7, 0.025, o.antlers); }
  if (o.mane) b.ell(0, 1.55, 0.7, 0.24, 0.3, 0.22, o.mane);
  b.rod(0, 0.95, -0.62, 0, 0.6, -0.85, 0.04, o.tail || c);
  if (o.bow) b.sph(0.06, 0, 0.6, -0.85, o.bow);
  if (o.extra) o.extra(b);
  b.pop();
  return { height: 1.9 * s };
}
function buzz(b, arm) {
  const W2 = '#f4f4f0', G = '#6ad04a', P = '#7a3ad8';
  legs(b, 0.85, 0.1, W2, 0.08, P, [0.09, 0.06, 0.15]);
  for (const s of [-1, 1]) b.ell(s * 0.1, 0.5, 0.02, 0.09, 0.12, 0.09, G);
  b.ell(0, 0.95, 0, 0.2, 0.12, 0.15, P);
  b.ell(0, 1.2, 0, 0.25, 0.27, 0.2, W2);
  b.box(0.26, 0.22, 0.06, 0, 1.12, 0.17, '#9aa8b8');
  for (let k = 0; k < 3; k++) b.sph(0.025, -0.06 + k * 0.06, 1.2, 0.21, ['#e8423a', '#2f6fd8', G][k], { w: 5, h: 4 });
  b.ell(0, 1.28, 0.08, 0.24, 0.12, 0.16, G);
  for (const s of [-1, 1]) b.box(0.45, 0.16, 0.05, s * 0.3, 1.24, -0.22, W2, { rz: s * 0.4 });
  staticArm(b, -1, 1.35, 0.38, W2, G, 0.06, 0.26);
  b.sph(0.13, 0, 1.6, 0.02, SKIN);
  b.ell(0, 1.62, -0.02, 0.16, 0.18, 0.15, P);
  b.ell(0, 1.58, 0.02, 0.13, 0.15, 0.13, SKIN);
  dotEyes(b, 1.62, 0.12, 0.045, 0.02, '#3a5a2a');
  b.box(0.04, 0.02, 0.01, 0, 1.55, 0.13, '#b05050');
  gloveArm(arm, 0.38, W2, G, 0.06);
  return { shoulder: [0.26, 1.35, 0], height: 1.85 };
}
function robot(b, arm, o) { // WALL-E / R2 / BB-8 / EVE
  if (o.kind === 'walle') {
    for (const s of [-1, 1]) b.box(0.18, 0.3, 0.6, s * 0.3, 0, 0, '#5a5a5a');
    b.box(0.5, 0.48, 0.48, 0, 0.32, 0, '#e8b83a');
    b.rod(0, 0.8, 0, 0, 1.0, 0.02, 0.03, '#888888');
    for (const s of [-1, 1]) { b.cyl(0.09, 0.2, s * 0.09, 1.05, 0, '#8a8a8a', { rx: Math.PI / 2, seg: 10 }); b.cyl(0.06, 0.02, s * 0.09, 1.05, 0.2, '#2a2a2a', { rx: Math.PI / 2, seg: 10 }); }
    staticArm(b, -1, 0.6, 0.25, '#7a7a7a', '#7a7a7a', 0.03, 0.3);
    gloveArm(arm, 0.25, '#7a7a7a', '#7a7a7a', 0.03);
    return { shoulder: [0.28, 0.6, 0], height: 1.15 };
  }
  if (o.kind === 'eve') {
    b.ell(0, 0.95, 0, 0.22, 0.35, 0.2, '#fbfbfb');
    b.ell(0, 1.45, 0.02, 0.2, 0.16, 0.18, '#fbfbfb');
    b.ell(0, 1.45, 0.08, 0.16, 0.09, 0.12, '#14141a');
    for (const s of [-1, 1]) b.ell(s * 0.06, 1.46, 0.19, 0.04, 0.02, 0.01, '#5ad0ff', { mat: 'neon' });
    staticArm(b, -1, 1.15, 0.35, '#fbfbfb', '#fbfbfb', 0.05, 0.22);
    gloveArm(arm, 0.35, '#fbfbfb', '#fbfbfb', 0.05);
    return { shoulder: [0.22, 1.15, 0], height: 1.6, hover: true };
  }
  if (o.kind === 'r2') {
    b.cyl(0.25, 0.65, 0, 0.1, 0, '#f4f4f4', { seg: 14 });
    b.box(0.2, 0.25, 0.05, 0, 0.4, 0.24, '#2f5fd8');
    b.dome(0.25, 0, 0.75, 0, '#c8ccd2', { mat: 'metal' });
    b.sph(0.05, 0, 0.9, 0.2, '#111111', { w: 6, h: 5 });
    for (const s of [-1, 1]) b.box(0.08, 0.7, 0.15, s * 0.3, 0, 0, '#e8e8e8');
    arm.box(0.001, 0.001, 0.001, 0, 0, 0, '#ffffff');
    return { shoulder: [0, 0.5, 0], height: 1.0 };
  }
  if (o.kind === 'bb8') {
    b.sph(0.35, 0, 0.35, 0, '#f4f4f0', { w: 16, h: 12 });
    b.torus(0.2, 0.04, 0.0, 0.35, 0.28, '#f08a2a', { rx: 0 });
    b.torus(0.2, 0.04, 0.28, 0.35, 0, '#f08a2a', { rx: 0, ry: Math.PI / 2 });
    b.dome(0.2, 0, 0.7, 0, '#f4f4f0');
    b.sph(0.05, 0, 0.8, 0.17, '#111111', { w: 6, h: 5 });
    arm.box(0.001, 0.001, 0.001, 0, 0, 0, '#ffffff');
    return { shoulder: [0, 0.5, 0], height: 0.9 };
  }
  return { height: 1 };
}

// ---------- registry ----------
// Each entry: [Chinese name, English name, builder, options]
export const ROSTER = {
  mickey: ['米奇', 'Mickey Mouse', mickey, {}],
  santaMickey: ['圣诞米奇', 'Santa Mickey', mickey, { santa: true }],
  minnie: ['米妮', 'Minnie Mouse', minnie, {}],
  donald: ['唐老鸭', 'Donald Duck', duck, { shirt: '#2f5fc6', collar: '#5a8ae8', bowtie: '#d8202a', hat: '#2f5fc6' }],
  daisy: ['黛丝', 'Daisy Duck', duck, { shirt: '#a86ad8', bow: '#f08ac0', lashes: true, pupil: '#2a2a6a' }],
  goofy: ['高飞', 'Goofy', goofy, {}],
  pluto: ['布鲁托', 'Pluto', pluto, {}],
  chip: ['奇奇', 'Chip', chipmunk, BK],
  dale: ['蒂蒂', 'Dale', chipmunk, '#d8303a'],
  cinderella: ['灰姑娘', 'Cinderella', princess, { skirt: '#9fd0f2', top: '#bfe2f8', puff: '#d8eefa', hair: '#f2d27a', style: 'bun', band: '#5aa0e8', hem: '#ffffff', wide: 0.56 }],
  snowwhite: ['白雪公主', 'Snow White', princess, { skirt: '#f6dc6a', top: '#2f4fa8', puff: '#d8303a', collar: '#ffffff', hair: '#1a1410', style: 'short', bow: '#d8303a', skin: '#fbe2d0' }],
  aurora: ['爱洛公主', 'Aurora', princess, { skirt: '#f2a6c8', top: '#f6b8d4', over: '#ec92bc', hair: '#f2cf6a', style: 'long', crown: true }],
  belle: ['贝儿', 'Belle', princess, { skirt: '#f6c83a', top: '#f8d45a', over: '#efb92a', hair: '#7a4a2a', style: 'halfup', wide: 0.58 }],
  ariel: ['小美人鱼爱丽儿', 'Ariel', princess, { tail: '#3ab88a', top: '#a86ad8', hair: '#d8402a', style: 'ariel' }],
  jasmine: ['茉莉公主', 'Jasmine', princess, { pants: '#3ac8c0', top: '#3ac8c0', hair: '#141018', style: 'pony', skin: SKIN2, tiara: GOLD, shoes: '#3ac8c0' }],
  rapunzel: ['乐佩', 'Rapunzel', princess, { skirt: '#b88ad8', top: '#9a6ac8', puff: '#e8b8f0', hair: '#f6d25a', style: 'xlong', flower: '#ff8ac8', extra: (b) => b.tube([[0, 1.3, -0.1], [0, 0.8, -0.35], [0.1, 0.3, -0.7], [0.2, 0.05, -1.3], [0.1, 0.05, -2.0]].map(p => new THREE.Vector3(...p)), 0.08, '#f6d25a', { seg: 24 }) }],
  mulan: ['花木兰', 'Mulan', princess, { skirt: '#2f5fa8', top: '#f6a6b8', sash: '#d8303a', hair: '#141018', style: 'bun', over: '#e85a7a', flower: '#f6e05a' }],
  tiana: ['蒂安娜', 'Tiana', princess, { skirt: '#7ac87a', top: '#a8e0a0', over: '#5aa85a', hair: '#1a1210', style: 'bun', skin: SKIN4, tiara: GOLD }],
  moana: ['莫阿娜', 'Moana', princess, { skirt: '#e8d0a0', top: '#c8303a', hair: '#1a1210', style: 'curly', skin: SKIN3, flower: '#ffffff', wide: 0.34 }],
  merida: ['梅莉达', 'Merida', princess, { skirt: '#2f6a5a', top: '#2f6a5a', hair: '#d8582a', style: 'curly', wide: 0.42, extra: (b) => { b.torus(0.4, 0.015, -0.3, 1.0, 0.1, '#7a4a2a', { rx: 0, arc: Math.PI, rz: Math.PI / 2 }); } }],
  elsa: ['艾莎', 'Elsa', princess, { skirt: '#9ad8f8', top: '#7ac8f2', hair: '#f6eed8', style: 'braid', cape: '#d8f2ff', skin: '#fbe6dc', capeMat: 'glow' }],
  anna: ['安娜', 'Anna', princess, { skirt: '#2a4a3a', top: '#1a1a2a', hem: '#d8a83a', hair: '#b8582a', style: 'braids2', cape: '#c8306a' }],
  alice: ['爱丽丝', 'Alice', princess, { skirt: '#7ab8f0', top: '#8ac0f2', over: '#ffffff', hair: '#f6d86a', style: 'long', band: '#141414', wide: 0.4 }],
  tinker: ['小叮当', 'Tinker Bell', princess, { skirt: '#6ad06a', top: '#5ac05a', hair: '#f6d86a', style: 'bun', wide: 0.22, extra: (b) => { for (const s of [-1, 1]) b.ell(s * 0.25, 1.2, -0.12, 0.25, 0.32, 0.02, '#dff8ff', { az: s * 0.4, mat: 'neon' }); } }],
  peterpan: ['小飞侠彼得潘', 'Peter Pan', man, { top: '#4aa84a', pants: '#3a8a3a', sleeve: '#4aa84a', shoes: '#6a4a2a', hair: '#c8742a', belt: '#7a4a2a', hat: (b, y) => { b.cone(0.15, 0.22, 0, y + 0.07, -0.02, '#4aa84a', { rx: -0.6, seg: 8 }); b.rod(0.05, y + 0.12, -0.02, 0.15, y + 0.3, -0.15, 0.012, '#d8303a'); } }],
  hook: ['虎克船长', 'Captain Hook', man, { top: '#b8202a', pants: '#3a2a3a', coat: '#b8202a', hair: '#141018', style: 'long', glove: '#e8e0d0', hat: (b, y) => { b.ell(0, y + 0.12, 0, 0.28, 0.06, 0.2, '#b8202a'); b.rod(-0.1, y + 0.15, 0.05, 0.25, y + 0.3, -0.25, 0.03, '#ffffff'); } }],
  jack: ['杰克船长', 'Captain Jack Sparrow', man, { top: '#f2ece0', vest: '#5a4a3a', pants: '#4a3a2a', sleeve: '#f2ece0', hair: '#2a1a10', style: 'long', belt: '#c8303a', skin: SKIN2, hat: (b, y) => { b.ell(0, y + 0.1, 0, 0.24, 0.05, 0.22, '#3a2a1a'); b.cone(0.16, 0.14, 0, y + 0.1, 0, '#3a2a1a', { seg: 3, flat: true }); b.torus(0.125, 0.025, 0, y + 0.05, 0, '#c8303a', { rx: Math.PI / 2 }); } }],
  aladdin: ['阿拉丁', 'Aladdin', man, { top: '#f2ece0', vest: '#7a3ad8', pants: '#f2ece0', sleeve: SKIN2, skin: SKIN2, hair: '#141018', hat: (b, y) => b.cyl(0.09, 0.12, 0.03, y + 0.08, 0, '#c8303a', { seg: 10, rt: 0.08 }) }],
  genie: ['精灵', 'Genie', (b, arm) => {
    const BL = '#4a8ae8';
    b.cone(0.3, 0.9, 0, 0, 0, BL, { rx: Math.PI, seg: 12 });
    b.ell(0, 0.95, 0, 0.42, 0.42, 0.32, BL);
    b.torus(0.3, 0.05, 0, 0.62, 0, '#d8303a', { rx: Math.PI / 2 });
    staticArm(b, -1, 1.15, 0.4, BL, BL, 0.09, 0.45);
    b.sph(0.22, 0, 1.55, 0.04, BL);
    dotEyes(b, 1.6, 0.24, 0.07, 0.03);
    b.ell(0, 1.42, 0.17, 0.09, 0.08, 0.06, '#141414');
    b.ell(0, 1.73, -0.12, 0.06, 0.18, 0.06, '#141414');
    for (const s of [-1, 1]) b.torus(0.08, 0.03, s * 0.45, 0.75, 0.05, GOLD, { mat: 'metal' });
    gloveArm(arm, 0.4, BL, BL, 0.09);
    return { shoulder: [0.42, 1.15, 0], height: 1.85, hover: true };
  }, {}],
  madhatter: ['疯帽子', 'Mad Hatter', man, { top: '#3a8a5a', coat: '#3a8a5a', pants: '#e8a03a', sleeve: '#3a8a5a', hair: '#e8742a', style: 'curly', skin: '#f8e0d0', hat: (b, y) => { b.cyl(0.16, 0.3, 0, y + 0.08, -0.01, '#3a7a4a', { seg: 12, rt: 0.19 }); b.cyl(0.25, 0.02, 0, y + 0.08, -0.01, '#3a7a4a', { seg: 12 }); b.box(0.08, 0.06, 0.01, 0.1, y + 0.25, 0.17, '#ffffff'); } }],
  woody: ['胡迪', 'Woody', man, { top: '#f2d24a', vest: '#f4f2ea', pants: '#3a5fa8', sleeve: '#f2d24a', hair: '#7a4a2a', shoes: '#7a4a2a', belt: '#5a3a1a', hat: (b, y) => { b.ell(0, y + 0.09, 0, 0.26, 0.03, 0.24, '#8a5a2a'); b.cyl(0.13, 0.13, 0, y + 0.09, 0, '#8a5a2a', { seg: 12, rt: 0.11 }); }, extra: (b, s) => { for (let k = 0; k < 6; k++) b.sph(0.03 * s, (k % 2 ? 0.1 : -0.1) * s, (1.0 + k * 0.05) * s, 0.13 * s, '#141414', { w: 5, h: 4 }); b.torus(0.08 * s, 0.025 * s, 0, 1.38 * s, 0.04 * s, '#d8303a', { rx: Math.PI / 2 }); } }],
  jessie: ['翠丝', 'Jessie', man, { top: '#f4f0e8', vest: '#f4f0e8', pants: '#f4f2ea', sleeve: '#f4f0e8', hair: '#c8402a', style: 'braid', shoes: '#7a4a2a', hat: (b, y) => { b.ell(0, y + 0.09, 0, 0.25, 0.03, 0.23, '#d8303a'); b.cyl(0.12, 0.12, 0, y + 0.09, 0, '#d8303a', { seg: 12, rt: 0.1 }); }, extra: (b) => { for (let k = 0; k < 6; k++) b.sph(0.04, (k % 2 ? 0.1 : -0.1), 0.3 + k * 0.1, 0.07, '#141414', { w: 5, h: 4 }); } }],
  buzz: ['巴斯光年', 'Buzz Lightyear', buzz, {}],
  pooh: ['小熊维尼', 'Winnie the Pooh', bear, { fur: '#f2b630', shirt: '#d8303a', muzzle: '#f6c858' }],
  tigger: ['跳跳虎', 'Tigger', (b, arm) => {
    const r = fox(b, arm, { fur: '#f08a2a', belly: '#f6e6a0', muzzle: '#f6e6a0', earLen: 0.12, innerEar: '#f6e6a0', eye: '#2a6a3a' });
    for (let k = 0; k < 5; k++) b.torus(0.235, 0.015, 0, 0.45 + k * 0.08, 0, '#141414', { rx: Math.PI / 2 });
    const pts = [];
    for (let i = 0; i <= 20; i++) pts.push(new THREE.Vector3(Math.sin(i * 0.9) * 0.06, 0.45 - i * 0.02, -0.25 - Math.cos(i * 0.9) * 0.06 - i * 0.008));
    b.tube(pts, 0.035, '#f08a2a', { seg: 40 });
    return { ...r, bounce: true };
  }, {}],
  piglet: ['小猪皮杰', 'Piglet', (b, arm) => {
    const P = '#f6b8c8';
    legs(b, 0.2, 0.06, P, 0.035, P, [0.05, 0.03, 0.07]);
    b.ell(0, 0.38, 0, 0.13, 0.18, 0.12, '#c8306a');
    for (let k = 0; k < 4; k++) b.torus(0.125, 0.012, 0, 0.3 + k * 0.05, 0, '#7a1a3a', { rx: Math.PI / 2 });
    b.sph(0.13, 0, 0.66, 0.01, P);
    b.ell(0, 0.63, 0.12, 0.05, 0.04, 0.04, '#f8a0b8');
    dotEyes(b, 0.7, 0.11, 0.05, 0.018);
    for (const s of [-1, 1]) b.ell(s * 0.07, 0.84, 0, 0.03, 0.09, 0.02, P, { az: -s * 0.2 });
    staticArm(b, -1, 0.45, 0.14, P, P, 0.025, 0.14);
    gloveArm(arm, 0.14, P, P, 0.025);
    return { shoulder: [0.13, 0.45, 0], height: 0.95 };
  }, {}],
  eeyore: ['屹耳', 'Eeyore', quadruped, { fur: '#9a9aa8', mane: '#2a2a32', muzzle: '#c8c8d0', bow: '#e86a9a', scale: 0.7 }],
  cheshire: ['柴郡猫', 'Cheshire Cat', (b, arm) => {
    b.ell(0, 0.5, -0.1, 0.28, 0.22, 0.45, '#c86ad8', { ax: 0.2 });
    for (let k = 0; k < 5; k++) b.torus(0.25, 0.03, 0, 0.5, -0.4 + k * 0.17, '#f6a6e8', { rx: 0 });
    b.sph(0.3, 0, 0.75, 0.3, '#c86ad8');
    eyes(b, 0.86, 0.52, 0.1, 0.06, 0.07, '#141414', '#f6e05a');
    b.ell(0, 0.62, 0.53, 0.2, 0.06, 0.04, '#ffffff');
    for (const s of [-1, 1]) b.cone(0.1, 0.2, s * 0.2, 0.98, 0.25, '#c86ad8', { rz: -s * 0.3, seg: 6 });
    arm.box(0.001, 0.001, 0.001, 0, 0, 0, '#ffffff');
    return { shoulder: [0, 0.5, 0], height: 1.1 };
  }, {}],
  dwarfDoc: ['万事通', 'Doc', dwarf, { tunic: '#c87a3a', hat: '#a86a2a', glasses: true }],
  dwarfGrumpy: ['爱生气', 'Grumpy', dwarf, { tunic: '#a83a3a', hat: '#8a3a2a' }],
  dwarfHappy: ['开心果', 'Happy', dwarf, { tunic: '#d8902a', hat: '#c87a3a' }],
  dwarfSleepy: ['瞌睡虫', 'Sleepy', dwarf, { tunic: '#6a8a3a', hat: '#5a7a3a', long: true }],
  dwarfBashful: ['害羞鬼', 'Bashful', dwarf, { tunic: '#c8a03a', hat: '#6a8a5a' }],
  dwarfSneezy: ['喷嚏精', 'Sneezy', dwarf, { tunic: '#7a5a3a', hat: '#a8723a' }],
  dwarfDopey: ['糊涂蛋', 'Dopey', dwarf, { tunic: '#6a8a3a', hat: '#8a5ab8', beard: false, ears: true, long: true }],
  duffy: ['达菲', 'Duffy', bear, { fur: '#c89a6a', muzzle: '#f2dcc0', shirt: '#2f4f9a', collar: '#ffffff', mickeyMark: '#f2dcc0', extra: (b) => { b.cyl(0.18, 0.08, 0, 1.33, -0.02, '#2f4f9a', { seg: 14 }); b.cyl(0.2, 0.02, 0, 1.33, -0.02, '#ffffff', { seg: 14 }); } }],
  shelliemay: ['雪莉玫', 'ShellieMay', bear, { fur: '#c89a6a', muzzle: '#f2dcc0', shirt: '#f6a6c0', collar: '#ffffff', extra: (b) => { b.ell(-0.1, 1.37, 0.0, 0.1, 0.06, 0.04, '#f06a9a', { az: 0.3 }); b.ell(0.1, 1.37, 0.0, 0.1, 0.06, 0.04, '#f06a9a', { az: -0.3 }); } }],
  linabell: ['玲娜贝儿', 'LinaBell', fox, { fur: '#f6b6c9', belly: '#fff0f4', muzzle: '#fff0f4', eye: '#7a4ab8', tail: '#f6b6c9', tailTip: '#ffffff', earLen: 0.24, extra: (b) => { b.sph(0.05, 0.18, 1.42, 0.06, '#8a7af0'); for (let k = 0; k < 5; k++) { const a = k / 5 * 6.28; b.sph(0.03, 0.18 + Math.cos(a) * 0.05, 1.42 + Math.sin(a) * 0.05, 0.07, '#b8a8ff', { w: 5, h: 4 }); } b.torus(0.06, 0.012, -0.25, 0.75, 0.15, '#c8a050', { rx: 0, mat: 'metal' }); } }],
  stellalou: ['星黛露', 'StellaLou', bunny, { fur: '#b8a0e0', belly: '#e8e0f8', muzzle: '#e8e0f8', skirt: '#f8b8d8', eye: '#3a2a6a', extra: (b) => { b.ell(-0.08, 1.33, 0.02, 0.08, 0.05, 0.03, '#f8b8d8', { az: 0.3 }); b.ell(0.08, 1.33, 0.02, 0.08, 0.05, 0.03, '#f8b8d8', { az: -0.3 }); } }],
  gelatoni: ['杰拉多尼', 'Gelatoni', fox, { fur: '#7ac8a4', belly: '#e8f6ee', muzzle: '#e8f6ee', earLen: 0.14, eye: '#2a2a3a', tail: '#7ac8a4', tailTip: '#f6e05a', extra: (b) => { b.ell(0, 1.34, -0.02, 0.18, 0.05, 0.16, '#8a5ab8'); b.sph(0.03, 0.05, 1.4, -0.02, '#8a5ab8'); } }],
  cookieann: ['可琦安', 'CookieAnn', bear, { fur: '#f2dc9a', muzzle: '#fff4dc', shirt: '#ffffff', nose: '#6a3a2a', extra: (b) => { b.cyl(0.15, 0.22, 0, 1.33, -0.02, '#ffffff', { seg: 12 }); b.sph(0.18, 0, 1.57, -0.02, '#ffffff', { sy: 0.6 }); for (const s of [-1, 1]) b.ell(s * 0.24, 1.08, 0, 0.06, 0.16, 0.08, '#d8b070', { az: -s * 0.3 }); } }],
  olumel: ['奥乐米拉', 'OluMel', (b, arm) => {
    const G = '#7ac86a';
    legs(b, 0.25, 0.1, G, 0.06, G, [0.08, 0.04, 0.12]);
    b.ell(0, 0.5, -0.06, 0.32, 0.3, 0.26, '#3a8a5a');
    for (let k = 0; k < 6; k++) { const a = k / 6 * 6.28; b.ell(Math.cos(a) * 0.15, 0.5 + Math.sin(a) * 0.15, -0.3, 0.07, 0.07, 0.03, '#2a6a4a'); }
    b.ell(0, 0.5, 0.12, 0.22, 0.24, 0.12, '#f6e6a0');
    staticArm(b, -1, 0.65, 0.22, G, G, 0.05, 0.3);
    b.sph(0.22, 0, 0.95, 0.04, G);
    dotEyes(b, 1.0, 0.24, 0.07, 0.025);
    for (let k = 0; k < 10; k++) { const a = k / 10 * 6.28; b.sph(0.045, Math.cos(a) * 0.2, 0.75, 0.04 + Math.sin(a) * 0.17, ['#ff8ab0', '#f6e05a', '#ffffff'][k % 3], { w: 5, h: 4 }); }
    b.box(0.12, 0.3, 0.05, -0.15, 0.45, 0.25, '#c8864a', { rz: 0.6 });
    gloveArm(arm, 0.22, G, G, 0.05);
    return { shoulder: [0.3, 0.65, 0], height: 1.25 };
  }, {}],
  judy: ['朱迪', 'Judy Hopps', bunny, { fur: '#9a9aa8', belly: '#e8e8f0', muzzle: '#e8e8f0', top: '#2f4f9a', eye: '#6a4ab8', earH: 0.32, innerEar: '#3a3a44', extra: (b) => { b.sph(0.035, 0.1, 0.78, 0.2, GOLD, { mat: 'metal' }); } }],
  nick: ['尼克', 'Nick Wilde', fox, { fur: '#e8823a', belly: '#f6e2c0', muzzle: '#f6e2c0', top: '#7ac87a', tie: '#2f4f8a', eye: '#3a8a3a', tail: '#e8823a', tailTip: '#f6e2c0', innerEar: '#5a3a2a' }],
  simba: ['辛巴', 'Simba', quadruped, { fur: '#e8b05a', muzzle: '#f6e0b0', nose: '#7a3a2a', tail: '#a86a2a', scale: 0.55 }],
  sven: ['驯鹿斯文', 'Sven', quadruped, { fur: '#9a6a3a', muzzle: '#c89a6a', antlers: '#6a4a2a', scale: 0.9 }],
  bullseye: ['红心', 'Bullseye', quadruped, { fur: '#8a5a32', mane: '#3a2010', muzzle: '#f2ece0', scale: 0.9 }],
  stitch: ['史迪奇', 'Stitch', stitch, {}],
  baymax: ['大白', 'Baymax', baymax, {}],
  olaf: ['雪宝', 'Olaf', olaf, {}],
  rex: ['抱抱龙', 'Rex', (b, arm) => {
    const G = '#5aa84a';
    for (const s of [-1, 1]) { b.rod(s * 0.18, 0.7, 0, s * 0.2, 0.08, 0.05, 0.1, G); b.ell(s * 0.2, 0.05, 0.12, 0.12, 0.05, 0.2, G); }
    b.ell(0, 0.95, -0.1, 0.32, 0.42, 0.3, G, { ax: 0.3 });
    b.ell(0, 0.85, 0.06, 0.22, 0.3, 0.2, '#c8d870');
    b.rod(0, 0.7, -0.35, 0, 0.3, -1.1, 0.16, G);
    b.ell(0, 1.55, 0.25, 0.2, 0.18, 0.35, G);
    b.ell(0, 1.43, 0.35, 0.18, 0.06, 0.3, '#c8d870');
    eyes(b, 1.66, 0.32, 0.1, 0.04, 0.05);
    staticArm(b, -1, 1.1, 0.12, G, G, 0.035, 0.2);
    gloveArm(arm, 0.12, G, G, 0.035);
    return { shoulder: [0.2, 1.1, 0.1], height: 1.85 };
  }, {}],
  alien: ['三眼仔', 'Little Green Men', (b, arm) => {
    const G = '#7ad84a';
    legs(b, 0.3, 0.07, '#4a6ae8', 0.05, '#4a6ae8', [0.06, 0.04, 0.09]);
    b.ell(0, 0.45, 0, 0.16, 0.2, 0.14, '#4a6ae8');
    b.box(0.1, 0.1, 0.02, 0, 0.48, 0.14, '#e8423a');
    staticArm(b, -1, 0.55, 0.2, G, G, 0.035, 0.18);
    b.ell(0, 0.82, 0.02, 0.2, 0.18, 0.18, G);
    for (const ex of [-0.08, 0, 0.08]) { b.sph(0.045, ex, 0.86, 0.17, '#ffffff', { w: 6, h: 5 }); b.sph(0.02, ex, 0.86, 0.21, '#141414', { w: 5, h: 4 }); }
    b.rod(0, 0.98, 0, 0, 1.18, 0, 0.012, G); b.sph(0.03, 0, 1.2, 0, G, { w: 5, h: 4 });
    b.ell(0, 0.74, 0.17, 0.06, 0.015, 0.01, '#141414');
    gloveArm(arm, 0.2, G, G, 0.035);
    return { shoulder: [0.16, 0.55, 0], height: 1.1 };
  }, {}],
  mike: ['大眼仔', 'Mike Wazowski', (b, arm) => {
    const G = '#8ad84a';
    legs(b, 0.3, 0.12, G, 0.04, G, [0.07, 0.04, 0.12]);
    b.sph(0.38, 0, 0.62, 0, G, { w: 16, h: 12 });
    b.sph(0.18, 0, 0.72, 0.26, '#ffffff');
    b.sph(0.09, 0, 0.72, 0.4, '#4a9a3a'); b.sph(0.05, 0, 0.72, 0.46, '#141414');
    b.ell(0, 0.45, 0.32, 0.14, 0.04, 0.03, '#2a2a2a');
    for (const s of [-1, 1]) b.cone(0.05, 0.12, s * 0.2, 0.97, 0, '#e8e0d0', { seg: 6 });
    staticArm(b, -1, 0.65, 0.3, G, G, 0.03, 0.42);
    gloveArm(arm, 0.3, G, G, 0.03);
    return { shoulder: [0.36, 0.65, 0], height: 1.1 };
  }, {}],
  sulley: ['毛怪', 'Sulley', (b, arm) => {
    const B = '#4ab8d8', P = '#8a5ad8';
    legs(b, 0.6, 0.18, B, 0.12, B, [0.13, 0.07, 0.2]);
    b.ell(0, 1.1, 0, 0.5, 0.6, 0.42, B, { w: 16, h: 12 });
    for (let k = 0; k < 12; k++) { const a = k * 2.3, y = 0.7 + (k % 4) * 0.25; b.sph(0.08, Math.cos(a) * 0.45, y, Math.sin(a) * 0.38, P, { w: 6, h: 5 }); }
    staticArm(b, -1, 1.45, 0.55, B, '#f2ece0', 0.12, 0.6);
    b.ell(0, 1.85, 0.12, 0.3, 0.26, 0.28, B);
    b.ell(0, 1.75, 0.34, 0.16, 0.08, 0.06, '#2a2a3a');
    dotEyes(b, 1.93, 0.34, 0.09, 0.035, '#2a6ae8');
    for (const s of [-1, 1]) b.cone(0.06, 0.18, s * 0.18, 2.06, 0.05, '#e8e0d0', { rz: -s * 0.4, seg: 6 });
    gloveArm(arm, 0.55, B, '#f2ece0', 0.12);
    return { shoulder: [0.5, 1.45, 0], height: 2.3 };
  }, {}],
  vader: ['达斯·维达', 'Darth Vader', man, { top: '#141418', pants: '#141418', coat: '#141418', sleeve: '#141418', glove: '#141418', skin: '#141418', shoes: '#141418', scale: 1.08, hat: (b, y) => { b.dome(0.17, 0, y - 0.05, -0.01, '#18181c', { mat: 'gloss' }); b.cyl(0.19, 0.12, 0, y - 0.17, -0.01, '#18181c', { rt: 0.15, seg: 12, mat: 'gloss' }); b.box(0.1, 0.07, 0.03, 0, y - 0.07, 0.12, '#3a3a40'); }, extra: (b, s) => { b.box(0.16 * s, 0.1 * s, 0.03, 0, 1.2 * s, 0.13 * s, '#c8303a', { mat: 'neon' }); b.box(0.5 * s, 1.3 * s, 0.02, 0, 0.1 * s, -0.16 * s, '#0a0a0c', { rx: 0.1 }); } }],
  trooper: ['帝国白兵', 'Stormtrooper', man, { top: '#f4f4f4', pants: '#f4f4f4', sleeve: '#f4f4f4', glove: '#141414', skin: '#f4f4f4', shoes: '#f4f4f4', belt: '#202020', hat: (b, y) => { b.sph(0.14, 0, y + 0.01, 0, '#f6f6f6', { mat: 'gloss' }); b.box(0.16, 0.04, 0.03, 0, y + 0.01, 0.12, '#141414'); b.box(0.06, 0.06, 0.03, 0, y - 0.07, 0.13, '#3a3a3a'); } }],
  spiderman: ['蜘蛛侠', 'Spider-Man', man, { top: '#d8202a', pants: '#2f4fb8', sleeve: '#d8202a', glove: '#d8202a', skin: '#d8202a', shoes: '#d8202a', hat: (b, y) => { for (const s of [-1, 1]) b.ell(s * 0.05, y + 0.02, 0.105, 0.035, 0.05, 0.02, '#ffffff', { az: s * 0.5 }); } }],
  ironman: ['钢铁侠', 'Iron Man', man, { top: '#b8202a', pants: '#b8202a', sleeve: '#b8202a', glove: '#e8b83a', skin: '#e8b83a', shoes: '#b8202a', hat: (b, y) => { b.sph(0.13, 0, y + 0.01, 0, '#b8202a', { mat: 'gloss' }); b.ell(0, y - 0.01, 0.06, 0.1, 0.11, 0.08, '#e8b83a', { mat: 'metal' }); for (const s of [-1, 1]) b.box(0.05, 0.015, 0.01, s * 0.045, y + 0.02, 0.135, '#bfefff', { mat: 'neon' }); }, extra: (b, s) => { b.cyl(0.05, 0.02, 0, 1.25, 0.13, '#bfefff', { rx: Math.PI / 2, seg: 10, mat: 'neon' }); } }],
  pocahontas: ['宝嘉康蒂', 'Pocahontas', princess, { skirt: '#c89a62', top: '#c89a62', hem: '#a87a44', hair: '#141018', style: 'xlong', skin: SKIN3, wide: 0.3, extra: (b) => { b.torus(0.09, 0.015, 0, 1.28, 0.02, '#3ac8c0', { rx: Math.PI / 2 }); } }],
  marie: ['玛丽猫', 'Marie', fox, { fur: '#fbfbfb', belly: '#ffffff', muzzle: '#ffffff', eye: '#3a7ad8', earLen: 0.15, innerEar: '#f8b8c8', tail: '#fbfbfb', tailTip: '#fbfbfb', extra: (b) => { b.ell(-0.08, 1.36, 0.02, 0.08, 0.05, 0.03, '#f08ab0', { az: 0.3 }); b.ell(0.08, 1.36, 0.02, 0.08, 0.05, 0.03, '#f08ab0', { az: -0.3 }); b.sph(0.035, 0, 1.36, 0.04, '#f08ab0'); b.torus(0.17, 0.025, 0, 0.92, 0.02, '#f08ab0', { rx: Math.PI / 2 }); } }],
  lotso: ['草莓熊', 'Lotso', bear, { fur: '#e88ab0', belly: '#f6c2d6', muzzle: '#f8cfe0', nose: '#8a3a6a', innerEar: '#f6c2d6' }],
  pinocchio: ['匹诺曹', 'Pinocchio', man, { scale: 0.68, top: '#f2d24a', vest: '#2f5fc6', pants: '#d8303a', sleeve: '#f2d24a', glove: '#ffffff', skin: '#f4caa0', hair: '#3a2a1a', shoes: '#7a4a2a', hat: (b, y) => { b.cyl(0.14, 0.1, 0, y + 0.08, -0.01, '#f2d24a', { seg: 10, rt: 0.11 }); b.ell(0, y + 0.08, 0, 0.18, 0.02, 0.17, '#f2d24a'); b.rod(0.08, y + 0.15, -0.05, 0.2, y + 0.34, -0.2, 0.012, '#d8303a'); b.cone(0.025, 0.16, 0, y - 0.02, 0.11, '#f4caa0', { rx: Math.PI / 2, seg: 6 }); } }],
  walle: ['瓦力', 'WALL-E', robot, { kind: 'walle' }],
  eve: ['伊娃', 'EVE', robot, { kind: 'eve' }],
  r2d2: ['R2-D2', 'R2-D2', robot, { kind: 'r2' }],
  bb8: ['BB-8', 'BB-8', robot, { kind: 'bb8' }],
};

function prepArmGeo(geo) { return geo; }

// Build a character group. opts: { scale, mono (statue color), noArm }
export function makeCharacter(id, opts = {}) {
  const def = ROSTER[id];
  if (!def) throw new Error('unknown character ' + id);
  const [zh, en, fn, o] = def;
  const b = new Builder(), arm = new Builder();
  const info = fn(b, arm, o) || {};
  const grp = new THREE.Group();
  grp.name = id;
  const mono = opts.mono;
  const addMeshes = (builder, parent) => {
    if (mono) {
      const g = builder.buildGeometry();
      if (!g) return null;
      const c = new THREE.Color(mono);
      const col = g.attributes.color;
      for (let i = 0; i < col.count; i++) col.setXYZ(i, c.r, c.g, c.b);
      const m = new THREE.Mesh(g, MATS.metal);
      m.castShadow = true;
      parent.add(m);
      return m;
    }
    if (builder.isEmpty()) return null;
    const g = builder.build({ name: id });
    parent.add(g);
    return g;
  };
  const body = addMeshes(b, grp);
  let armObj = null;
  if (!opts.noArm && !arm.isEmpty()) {
    armObj = new THREE.Group();
    const sh = info.shoulder || [0.2, 1.2, 0];
    armObj.position.set(sh[0], sh[1], sh[2]);
    addMeshes(arm, armObj);
    grp.add(armObj);
  }
  grp.traverse(o2 => { if (o2.isMesh) { o2.castShadow = true; o2.receiveShadow = true; } });
  const s = opts.scale || 1;
  grp.scale.setScalar(s);
  grp.userData = { id, zh, en, arm: armObj, height: (info.height || 1.8) * s, hover: !!info.hover, bounce: !!info.bounce };
  return grp;
}

export function characterName(id) { const d = ROSTER[id]; return d ? d[0] : id; }
export function characterEn(id) { const d = ROSTER[id]; return d ? d[1] : id; }
