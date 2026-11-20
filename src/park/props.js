// Instanced scenery: trees, lamps, benches, rocks, bushes, light bulbs...
import * as THREE from 'three';
import { Builder } from '../core/builder.js';
import { MATS } from '../core/materials.js';
import { rand, rr } from '../core/rng.js';

const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _p = new THREE.Vector3(), _s = new THREE.Vector3();
const _c = new THREE.Color();

function geoPine() {
  const b = new Builder();
  b.cyl(0.28, 1.2, 0, 0, 0, '#4a3324', { seg: 6 });
  b.cone(1.7, 2.3, 0, 0.9, 0, '#2c5a3a', { seg: 9 });
  b.cone(1.32, 2.1, 0, 2.0, 0, '#2f6040', { seg: 9 });
  b.cone(0.9, 1.9, 0, 3.0, 0, '#336844', { seg: 8 });
  return b.buildGeometry();
}
function geoRound() {
  const b = new Builder();
  b.cyl(0.25, 2.4, 0, 0, 0, '#5a3d28', { seg: 6, rt: 0.17 });
  b.sph(1.6, 0, 3.6, 0, '#44703a', { w: 8, h: 6 });
  b.sph(1.1, 0.9, 3.2, 0.4, '#4c7a3f', { w: 7, h: 5 });
  b.sph(1.0, -0.8, 3.4, -0.5, '#3f6936', { w: 7, h: 5 });
  return b.buildGeometry();
}
function geoPalm() {
  const b = new Builder();
  let x = 0, y = 0;
  for (let i = 0; i < 6; i++) {
    const nx = x + 0.12 * i * 0.25, ny = y + 1.0;
    b.rod(x, y, 0, nx, ny, 0, 0.22 - i * 0.015, i % 2 ? '#8a6a45' : '#7a5c3a', { seg: 6 });
    x = nx; y = ny;
  }
  for (let i = 0; i < 8; i++) {
    const a = i / 8 * Math.PI * 2;
    b.push(x, y, 0, a);
    b.box(0.5, 0.06, 2.6, 0, 0, 1.1, '#3f8a3a', { rx: 0.45 });
    b.box(0.35, 0.05, 1.4, 0, -0.7, 2.6, '#4a9a42', { rx: 0.9 });
    b.pop();
  }
  b.sph(0.18, x + 0.2, y - 0.2, 0.1, '#5a3a20');
  b.sph(0.18, x - 0.15, y - 0.25, -0.12, '#5a3a20');
  return b.buildGeometry();
}
function geoXmasTree() {
  const b = new Builder();
  b.cyl(0.25, 0.8, 0, 0, 0, '#4a3324', { seg: 6 });
  b.cone(1.5, 1.9, 0, 0.6, 0, '#1f5235', { seg: 10 });
  b.cone(1.15, 1.7, 0, 1.5, 0, '#225a3a', { seg: 10 });
  b.cone(0.75, 1.5, 0, 2.4, 0, '#26603e', { seg: 9 });
  const cols = ['#d42a3a', '#f2c64c', '#3f7fe0', '#ffffff', '#e86ac0'];
  for (let i = 0; i < 16; i++) {
    const hgt = 0.9 + rand() * 2.6;
    const rad = (1 - (hgt - 0.6) / 3.4) * 1.45;
    const a = rand() * Math.PI * 2;
    b.sph(0.13, Math.cos(a) * rad, hgt, Math.sin(a) * rad, cols[i % cols.length], { w: 6, h: 4 });
  }
  b.oct(0.28, 0, 4.0, 0, '#ffd75a');
  return b.buildGeometry();
}
function geoLampPost() {
  const b = new Builder();
  b.cyl(0.22, 0.4, 0, 0, 0, '#1c2420', { seg: 8 });
  b.cyl(0.08, 3.3, 0, 0.4, 0, '#1f2924', { seg: 6 });
  b.box(1.1, 0.07, 0.07, 0, 3.45, 0, '#1f2924');
  b.cyl(0.12, 0.12, -0.5, 3.0, 0, '#1f2924', { seg: 6 });
  b.cyl(0.12, 0.12, 0.5, 3.0, 0, '#1f2924', { seg: 6 });
  b.cone(0.22, 0.25, -0.5, 3.62, 0, '#1f2924', { seg: 6 });
  b.cone(0.22, 0.25, 0.5, 3.62, 0, '#1f2924', { seg: 6 });
  b.cone(0.12, 0.3, 0, 3.5, 0, '#1f2924', { seg: 6 });
  return b.buildGeometry();
}
function geoLampGlow() {
  const b = new Builder();
  b.sph(0.2, -0.5, 3.4, 0, '#ffd9a0', { w: 8, h: 6 });
  b.sph(0.2, 0.5, 3.4, 0, '#ffd9a0', { w: 8, h: 6 });
  return b.buildGeometry();
}
function geoBench() {
  const b = new Builder();
  b.box(1.7, 0.08, 0.5, 0, 0.45, 0, '#7a4f2e');
  b.box(1.7, 0.45, 0.07, 0, 0.55, -0.24, '#7a4f2e', { rx: -0.15 });
  for (const x of [-0.75, 0.75]) b.box(0.08, 0.45, 0.45, x, 0, 0, '#1f2622');
  return b.buildGeometry();
}
function geoRock() {
  const b = new Builder();
  b.ico(1, 0, 0.3, 0, '#8a8278', { sy: 0.65 });
  return b.buildGeometry();
}
function geoBush() {
  const b = new Builder();
  b.sph(0.8, 0, 0.5, 0, '#3a6a34', { w: 8, h: 6, sy: 0.75 });
  b.sph(0.55, 0.55, 0.45, 0.2, '#42753a', { w: 7, h: 5 });
  b.sph(0.5, -0.5, 0.4, -0.2, '#36622f', { w: 7, h: 5 });
  return b.buildGeometry();
}
function geoTopiary() {
  const b = new Builder();
  b.cyl(0.8, 0.6, 0, 0, 0, '#a2614a', { seg: 10, rt: 0.7 });
  b.sph(0.95, 0, 1.6, 0, '#2f6a35', { w: 10, h: 8 });
  b.sph(0.55, -0.85, 2.45, 0, '#2f6a35', { w: 8, h: 6 });
  b.sph(0.55, 0.85, 2.45, 0, '#2f6a35', { w: 8, h: 6 });
  return b.buildGeometry();
}
function geoCactus() {
  const b = new Builder();
  b.cyl(0.35, 3.2, 0, 0, 0, '#5f8a4a', { seg: 8 });
  b.sph(0.35, 0, 3.2, 0, '#5f8a4a', { w: 8, h: 4 });
  b.rod(0, 1.4, 0, 0.9, 1.6, 0, 0.22, '#5f8a4a');
  b.cyl(0.22, 1.1, 0.9, 1.6, 0, '#5f8a4a', { seg: 6 });
  b.rod(0, 1.9, 0, -0.7, 2.1, 0, 0.2, '#5f8a4a');
  b.cyl(0.2, 0.9, -0.7, 2.1, 0, '#5f8a4a', { seg: 6 });
  return b.buildGeometry();
}
function geoFlowerPot() {
  const b = new Builder();
  b.cyl(0.55, 0.6, 0, 0, 0, '#c9b8a0', { seg: 10, rt: 0.65 });
  b.sph(0.6, 0, 0.75, 0, '#3d6e34', { w: 8, h: 5, sy: 0.6 });
  const cols = ['#e8364a', '#ffd34d', '#ffffff', '#d667c9'];
  for (let i = 0; i < 7; i++) {
    const a = i / 7 * Math.PI * 2;
    b.sph(0.13, Math.cos(a) * 0.38, 0.95, Math.sin(a) * 0.38, cols[i % 4], { w: 5, h: 4 });
  }
  return b.buildGeometry();
}
function geoBulb() {
  const b = new Builder();
  b.oct(1, 0, 0, 0, '#ffffff');
  return b.buildGeometry();
}

const TYPES = {
  pine: { geo: geoPine, mat: 'leaf', shadow: true },
  round: { geo: geoRound, mat: 'leaf', shadow: true },
  palm: { geo: geoPalm, mat: 'leaf', shadow: true },
  xmas: { geo: geoXmasTree, mat: 'leaf', shadow: true },
  lamp: { geo: geoLampPost, mat: 'gloss', shadow: true },
  lampGlow: { geo: geoLampGlow, mat: 'glow', shadow: false },
  bench: { geo: geoBench, mat: 'std', shadow: false },
  rock: { geo: geoRock, mat: 'std', shadow: true },
  bush: { geo: geoBush, mat: 'leaf', shadow: false },
  topiary: { geo: geoTopiary, mat: 'leaf', shadow: true },
  cactus: { geo: geoCactus, mat: 'std', shadow: true },
  pot: { geo: geoFlowerPot, mat: 'std', shadow: false },
  bulb: { geo: geoBulb, mat: 'bulb', shadow: false },
};

export class Props {
  constructor(groundAt) {
    this.groundAt = groundAt;
    this.items = {};
    for (const k of Object.keys(TYPES)) this.items[k] = [];
    this.bulbMats = [];
  }
  add(type, x, z, { s = 1, ry = rand() * Math.PI * 2, y = null, sy = 1, rx = 0, rz = 0, color = null } = {}) {
    const yy = y ?? this.groundAt(x, z);
    this.items[type].push({ x, y: yy, z, s, ry, sy, rx, rz, color });
  }
  tree(type, x, z, s) { this.add(type, x, z, { s: s ?? rr(0.8, 1.3), ry: rand() * 6.28, rz: rr(-0.04, 0.04) }); }
  lamp(x, z, ry = 0, y = null) {
    this.add('lamp', x, z, { ry, y, s: 1 });
    this.add('lampGlow', x, z, { ry, y, s: 1 });
  }
  bulb(x, y, z, color = '#ffe2a8', s = 0.14) {
    this.items.bulb.push({ x, y, z, s, ry: 0, sy: 1, rx: 0, rz: 0, color });
  }
  // string of bulbs between two points with a slight sag
  bulbLine(a, b2, n, color = '#ffe2a8', sag = 0, s = 0.14) {
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const y = a[1] + (b2[1] - a[1]) * t - Math.sin(Math.PI * t) * sag;
      const c = Array.isArray(color) ? color[i % color.length] : color;
      this.bulb(a[0] + (b2[0] - a[0]) * t, y, a[2] + (b2[2] - a[2]) * t, c, s);
    }
  }
  build(world) {
    this.meshes = {};
    for (const [k, list] of Object.entries(this.items)) {
      if (!list.length) continue;
      const T = TYPES[k];
      const geo = T.geo();
      const mesh = new THREE.InstancedMesh(geo, MATS[T.mat], list.length);
      list.forEach((it, i) => {
        _e.set(it.rx, it.ry, it.rz, 'YXZ');
        _m.compose(_p.set(it.x, it.y, it.z), _q.setFromEuler(_e), _s.set(it.s, it.s * it.sy, it.s));
        mesh.setMatrixAt(i, _m);
        if (it.color || k === 'bulb') mesh.setColorAt(i, _c.set(it.color || '#ffffff'));
      });
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      mesh.castShadow = T.shadow;
      mesh.receiveShadow = k !== 'bulb' && k !== 'lampGlow';
      mesh.computeBoundingSphere();
      mesh.name = 'props:' + k;
      world.add(mesh);
      this.meshes[k] = mesh;
    }
  }
}
