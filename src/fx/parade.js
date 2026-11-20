// Christmas parade: floats roll from Town Square up Main Street, around the hub
// and into Adventureland. At night every float is covered in glowing bulbs.
import * as THREE from 'three';
import { Builder } from '../core/builder.js';
import { makeCharacter } from '../chars/figures.js';

const ROUTE = [[-18, 113], [-18, 95], [-3.2, 92], [-3.2, 46], [-6, 40], [-11, 36], [-24, 34], [-38, 38], [-52, 40], [-66, 42], [-82, 41]];
const NEON = ['#ff4a6a', '#ffd24a', '#4ab8ff', '#7aff8a', '#ff8ae8', '#ffffff'];

function bulbsAround(b, w, l, h, y0 = 0.6) {
  for (let x = -w / 2; x <= w / 2 + 0.01; x += 0.45) for (const z of [-l / 2, l / 2]) b.sph(0.09, x, y0 + h, z, NEON[Math.floor((x + 9) * 3) % 6], { mat: 'neon', w: 4, h: 3 });
  for (let z = -l / 2; z <= l / 2 + 0.01; z += 0.45) for (const x of [-w / 2, w / 2]) b.sph(0.09, x, y0 + h, z, NEON[Math.floor((z + 9) * 3) % 6], { mat: 'neon', w: 4, h: 3 });
}
function base(b, w, l, skirt, top) {
  b.box(w, 0.9, l, 0, 0.15, 0, skirt);
  b.box(w + 0.2, 0.15, l + 0.2, 0, 1.05, 0, top, { mat: 'gloss' });
  for (const s of [-1, 1]) for (const z of [-l / 2 + 0.7, l / 2 - 0.7]) b.cyl(0.3, 0.2, s * (w / 2 - 0.1), 0.3, z, '#222222', { rz: Math.PI / 2, seg: 10 });
  bulbsAround(b, w, l, 1.15, 0);
}

const FLOATS = [
  {
    name: '圣诞雪橇', chars: [['santaMickey', 0.2, 0.0, 2.0], ['minnie', -0.6, -0.6, 2.0]],
    build(b) {
      base(b, 3.4, 6.5, '#b8202a', '#e7bd57');
      b.box(2.6, 1.2, 3.4, 0, 1.2, -0.6, '#c8283a', { mat: 'gloss' });
      b.box(2.7, 0.2, 3.5, 0, 2.4, -0.6, '#e7bd57', { mat: 'metal' });
      b.torus(1.3, 0.12, 0, 2.6, 1.0, '#e7bd57', { rx: 0, ry: Math.PI / 2, arc: Math.PI, mat: 'metal' });
      for (let k = 0; k < 6; k++) b.box(0.5, 0.5, 0.5, -0.8 + (k % 3) * 0.8, 2.4, -2.1 + Math.floor(k / 3) * 0.6, ['#2f6fd8', '#3aa86a', '#f6d55c'][k % 3], { mat: 'gloss' });
      // reindeer
      for (let r = 0; r < 4; r++) {
        const z = 4.6 + Math.floor(r / 2) * 1.8, x = (r % 2 ? 0.6 : -0.6);
        b.ell(x, 1.9, z, 0.22, 0.25, 0.5, '#8a5a32');
        for (const [lx, lz] of [[-0.1, 0.3], [0.1, 0.3], [-0.1, -0.3], [0.1, -0.3]]) b.cyl(0.04, 1.2, x + lx, 0.6, z + lz, '#6a4020', { seg: 5 });
        b.rod(x, 2.0, z + 0.4, x, 2.6, z + 0.65, 0.08, '#8a5a32');
        b.ell(x, 2.7, z + 0.8, 0.1, 0.1, 0.18, '#8a5a32');
        b.sph(0.05, x, 2.7, z + 0.98, r === 0 ? '#ff3a3a' : '#2a1a10', { mat: r === 0 ? 'neon' : 'std' });
        for (const s of [-1, 1]) b.rod(x + s * 0.05, 2.8, z + 0.75, x + s * 0.25, 3.2, z + 0.6, 0.02, '#6a4a2a');
      }
    },
  },
  {
    name: '灰姑娘南瓜马车', chars: [['cinderella', 0, -0.3, 2.3]],
    build(b) {
      base(b, 3.2, 7, '#3a5fb8', '#e7bd57');
      b.ell(0, 3.0, -0.5, 1.4, 1.3, 1.6, '#f2a23a', { mat: 'gloss' });
      for (let k = 0; k < 8; k++) b.torus(1.42, 0.05, 0, 3.0, -0.5, '#e7bd57', { rx: 0, ry: k * Math.PI / 8, mat: 'metal', arc: Math.PI });
      b.cone(0.3, 0.8, 0, 4.2, -0.5, '#e7bd57', { mat: 'metal' });
      for (const s of [-1, 1]) for (const z of [-1.8, 0.8]) b.torus(0.7, 0.08, s * 1.3, 1.8, z, '#e7bd57', { rx: 0, ry: Math.PI / 2, mat: 'metal' });
      for (const x of [-0.6, 0.6]) {
        b.ell(x, 2.0, 2.8, 0.25, 0.3, 0.6, '#ffffff');
        for (const [lx, lz] of [[-0.12, 0.35], [0.12, 0.35], [-0.12, -0.35], [0.12, -0.35]]) b.cyl(0.05, 1.3, x + lx, 0.6, 2.8 + lz, '#f4f4f4', { seg: 5 });
        b.rod(x, 2.2, 3.3, x, 2.9, 3.6, 0.12, '#ffffff');
        b.ell(x, 3.0, 3.85, 0.12, 0.14, 0.25, '#ffffff');
        b.sph(0.08, x, 3.2, 3.7, '#f2d24a', { mat: 'neon' });
      }
    },
  },
  {
    name: '冰雪奇缘', chars: [['elsa', 0, -0.8, 2.6], ['anna', -0.8, 1.2, 1.2], ['olaf', 0.9, 1.4, 1.2]],
    build(b) {
      base(b, 3.4, 7, '#7ac8f2', '#e8f8ff');
      for (let k = 0; k < 7; k++) { const a = k / 7 * Math.PI * 2; b.cyl(0.35, 1.5 + (k % 3) * 0.6, Math.cos(a) * 1.3, 1.2, -0.8 + Math.sin(a) * 1.3, '#bfe6ff', { seg: 6, flat: true, mat: 'ice', rt: 0.15 }); }
      b.cyl(0.9, 1.4, 0, 1.2, -0.8, '#e2f4ff', { seg: 6, flat: true, mat: 'ice' });
      for (let k = 0; k < 6; k++) b.boxc(0.12, 1.6, 0.08, 0, 4.4, -2.6, '#e8faff', { rz: k * Math.PI / 3, mat: 'neon' });
    },
  },
  {
    name: '玩具总动员', chars: [['woody', -0.7, -0.4, 2.3], ['buzz', 0.7, -0.4, 2.3], ['jessie', 0, 1.6, 1.2]],
    build(b) {
      base(b, 3.4, 7, '#2f6fd8', '#f6d55c');
      b.box(3.0, 1.1, 3.4, 0, 1.2, -0.4, '#f6d55c', { mat: 'gloss' });
      for (let k = 0; k < 5; k++) b.box(0.7, 0.7, 0.7, -1.2 + k * 0.6, 1.2 + (k % 2) * 0.7, 2.2, ['#e8423a', '#2f6fd8', '#3aa86a', '#f08a2a', '#9a5ad8'][k], { ry: k * 0.4, mat: 'gloss' });
      b.sph(0.5, 1.0, 1.7, 2.6, '#e8423a', { mat: 'gloss' });
    },
  },
  {
    name: '姜饼屋', chars: [['donald', -0.8, 1.6, 1.2], ['daisy', 0.8, 1.6, 1.2], ['goofy', 0, -1.2, 1.2]],
    build(b) {
      base(b, 3.4, 7, '#8a4a2a', '#f4f0e8');
      b.box(2.4, 2.0, 2.2, 0, 1.2, -1.6, '#b8743a');
      b.prism(2.8, 1.4, 2.6, 0, 3.2, -1.6, '#f4f0e8', { ry: Math.PI / 2 });
      for (let k = 0; k < 8; k++) b.sph(0.12, -1.0 + k * 0.28, 3.25, -0.4, ['#e8423a', '#3aa86a', '#f6d55c', '#ffffff'][k % 4], { mat: 'gloss', w: 5, h: 4 });
      b.box(0.7, 1.0, 0.1, 0, 1.2, -0.48, '#e8423a');
      for (const s of [-1, 1]) { b.cyl(0.08, 1.8, s * 1.3, 1.2, 1.0, '#ffffff', { seg: 6 }); b.torus(0.25, 0.07, s * 1.3, 3.0, 1.0, '#e8423a', { rx: 0 }); }
    },
  },
  {
    name: '维尼蜂蜜罐', chars: [['pooh', 0, -0.3, 2.6], ['tigger', 0.9, 1.6, 1.2], ['piglet', -0.9, 1.6, 1.2]],
    build(b) {
      base(b, 3.4, 6.5, '#3a8a4a', '#f2c94c');
      b.lathe([[0, 0], [1.1, 0.1], [1.45, 0.8], [1.35, 1.6], [0.95, 1.9], [1.05, 2.05], [0, 2.05]], 0, 1.2, -0.3, '#e8a02a', { mat: 'gloss', seg: 18 });
      b.cyl(1.4, 0.35, 0, 2.0, -0.3, '#7a3a1a', { seg: 18 });
    },
  },
  {
    name: '达菲和朋友们', chars: [['duffy', 0, -0.8, 2.0], ['linabell', -0.9, 1.4, 1.2], ['stellalou', 0.9, 1.4, 1.2], ['shelliemay', 0, 2.4, 1.2]],
    build(b) {
      base(b, 3.4, 7, '#f6a6c0', '#ffffff');
      b.cyl(1.4, 0.8, 0, 1.2, -0.8, '#a6d8f6', { seg: 18 });
      for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2; b.sph(0.22, Math.cos(a) * 1.4, 2.1, -0.8 + Math.sin(a) * 1.4, ['#ff8ab0', '#ffe08a', '#b8a8ff'][k % 3], { mat: 'gloss' }); }
      b.cyl(0.06, 3.5, 1.3, 1.2, -2.6, '#ffffff', { seg: 5 });
      b.sph(0.6, 1.3, 5.0, -2.6, '#ff8ab0', { mat: 'gloss' }); b.sph(0.35, 0.85, 5.45, -2.6, '#ff8ab0', { mat: 'gloss' }); b.sph(0.35, 1.75, 5.45, -2.6, '#ff8ab0', { mat: 'gloss' });
    },
  },
  {
    name: '阿拉丁神灯', chars: [['genie', 0, -1.0, 2.4], ['aladdin', -0.7, 1.5, 1.2], ['jasmine', 0.7, 1.5, 1.2]],
    build(b) {
      base(b, 3.4, 7, '#6a2fa8', '#e7bd57');
      b.box(3.0, 0.15, 4.0, 0, 1.25, 0.5, '#c8283a');
      b.box(2.5, 0.16, 3.4, 0, 1.26, 0.5, '#f2c94c');
      b.lathe([[0, 0], [1.0, 0.1], [1.4, 0.6], [0.9, 1.0], [0.3, 1.1], [0.2, 1.4], [0, 1.6]], 0, 1.2, -1.5, '#e7bd57', { mat: 'metal', seg: 18 });
    },
  },
];

function soldier() {
  const b = new Builder();
  for (const s of [-1, 1]) b.cyl(0.07, 0.8, s * 0.1, 0, 0, '#f4f4f4', { seg: 6 });
  b.cyl(0.2, 0.6, 0, 0.8, 0, '#c8202a', { seg: 10 });
  b.torus(0.19, 0.03, 0, 1.05, 0, '#e7bd57', { rx: Math.PI / 2, mat: 'metal' });
  b.sph(0.13, 0, 1.55, 0, '#f6cfac');
  b.cyl(0.14, 0.42, 0, 1.6, 0, '#141414', { seg: 10 });
  for (const s of [-1, 1]) b.sph(0.05, s * 0.05, 1.53, 0.12, '#e86a7a', { w: 5, h: 4 });
  b.rod(0.24, 1.3, 0, 0.26, 0.9, 0.1, 0.05, '#c8202a');
  b.cyl(0.02, 1.0, -0.24, 0.9, 0.1, '#cccccc', { seg: 4 });
  return b.build({ name: 'soldier' });
}

export class Parade {
  constructor(world, app) {
    this.app = app;
    this.curve = new THREE.CatmullRomCurve3(ROUTE.map(([x, z]) => new THREE.Vector3(x, 0, z)), false, 'centripetal');
    this.len = this.curve.getLength();
    this.units = [];
    const group = new THREE.Group();
    group.visible = false;
    world.add(group);
    this.group = group;
    let offset = 0;
    FLOATS.forEach((f, i) => {
      // marching soldiers before each float
      for (let k = 0; k < 4; k++) {
        const s = soldier();
        group.add(s);
        this.units.push({ obj: s, offset: offset + (k % 2) * 0.0, lateral: k % 2 ? 1.0 : -1.0, march: true, ph: k });
        if (k % 2) offset += 1.6;
      }
      offset += 3;
      const b = new Builder();
      f.build(b);
      const fl = b.build({ name: 'float' });
      const holder = new THREE.Group();
      holder.add(fl);
      for (const [id, x, z, y] of f.chars) {
        const c = makeCharacter(id, {});
        c.position.set(x, y, z);
        c.userData.baseY = y;
        holder.add(c);
      }
      group.add(holder);
      this.units.push({ obj: holder, offset: offset + 3.5, lateral: 0, name: f.name });
      offset += 12;
    });
    this.total = offset;
    this.t = -1;
    this.speed = 2.2;
    this.lastHour = null;
    this.onStart = null;
  }
  start() {
    this.t = 0;
    this.group.visible = true;
    if (this.onStart) this.onStart();
  }
  get running() { return this.t >= 0; }
  update(dt, time) {
    // auto schedule: 14:00 and 19:30
    const h = this.app.atmos.hour;
    if (this.lastHour !== null && !this.running) {
      for (const at of [14, 19.5]) if (this.lastHour < at && h >= at) this.start();
    }
    this.lastHour = h;
    if (!this.running) return;
    this.t += dt;
    const head = this.t * this.speed;
    const p = new THREE.Vector3(), tg = new THREE.Vector3();
    let anyVisible = false;
    for (const u of this.units) {
      const s = head - u.offset;
      if (s < 0 || s > this.len) { u.obj.visible = false; continue; }
      anyVisible = true;
      u.obj.visible = true;
      const k = s / this.len;
      this.curve.getPointAt(k, p); this.curve.getTangentAt(k, tg);
      u.obj.position.set(p.x - tg.z * u.lateral, 0, p.z + tg.x * u.lateral);
      u.obj.rotation.y = Math.atan2(tg.x, tg.z);
      // appear / disappear smoothly at both ends
      const edge = Math.min(s, this.len - s);
      const sc = Math.min(1, edge / 4);
      u.obj.scale.setScalar(Math.max(0.001, sc));
      if (u.march) { u.obj.position.y = Math.abs(Math.sin(time * 6 + u.ph)) * 0.12; }
      else {
        u.obj.children.forEach((c, i) => {
          if (c.userData?.arm) {
            c.userData.arm.rotation.z = 2.4 + Math.sin(time * 8 + i) * 0.35;
            c.position.y = (c.userData.baseY || 0) + Math.abs(Math.sin(time * 2 + i)) * 0.08;
          }
        });
      }
    }
    if (!anyVisible && head > this.total + this.len) { this.t = -1; this.group.visible = false; }
  }
}
