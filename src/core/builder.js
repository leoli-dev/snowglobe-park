// Procedural geometry builder: every primitive is baked into vertex-colored
// geometry and merged per material, so the whole park costs few draw calls.
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { MATS } from './materials.js';

const colorCache = new Map();
export function col(c) {
  if (c && c.isColor) return c;
  let v = colorCache.get(c);
  if (!v) { v = new THREE.Color(c); colorCache.set(c, v); }
  return v;
}

function ensureIndex(g) {
  if (!g.index) {
    const n = g.attributes.position.count;
    const idx = new (n > 65535 ? Uint32Array : Uint16Array)(n);
    for (let i = 0; i < n; i++) idx[i] = i;
    g.setIndex(new THREE.BufferAttribute(idx, 1));
  }
  return g;
}
function strip(g) {
  for (const k of Object.keys(g.attributes)) {
    if (k !== 'position' && k !== 'normal') g.deleteAttribute(k);
  }
  return ensureIndex(g);
}
function flat(g) {
  const ng = g.index ? g.toNonIndexed() : g;
  ng.computeVertexNormals();
  return ng;
}

const baseCache = new Map();
function base(key, make) {
  let g = baseCache.get(key);
  if (!g) { g = strip(make()); baseCache.set(key, g); }
  return g;
}

// triangular prism for gable roofs: width 1 (x), height 1, length 1 (z); bottom at y=0
function prismGeo() {
  const g = new THREE.BufferGeometry();
  const A = [-0.5, 0, -0.5], B = [0.5, 0, -0.5], C = [0, 1, -0.5];
  const D = [-0.5, 0, 0.5], E = [0.5, 0, 0.5], F = [0, 1, 0.5];
  const tris = [
    D, E, F, // front
    B, A, C, // back
    A, D, F, A, F, C, // left slope
    E, B, C, E, C, F, // right slope
    A, B, E, A, E, D, // bottom
  ];
  g.setAttribute('position', new THREE.Float32BufferAttribute(tris.flat(), 3));
  g.computeVertexNormals();
  return g;
}

export const BASE = {
  box: () => base('box', () => new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0)),
  boxc: () => base('boxc', () => new THREE.BoxGeometry(1, 1, 1)),
  cyl: (s = 12) => base('cyl' + s, () => new THREE.CylinderGeometry(1, 1, 1, s, 1).translate(0, 0.5, 0)),
  cylc: (s = 8) => base('cylc' + s, () => new THREE.CylinderGeometry(1, 1, 1, s, 1)),
  frus: (rt, s = 12) => {
    const k = Math.round(rt * 100) / 100;
    return base('frus' + s + '_' + k, () => new THREE.CylinderGeometry(k, 1, 1, s, 1).translate(0, 0.5, 0));
  },
  cone: (s = 12) => base('cone' + s, () => new THREE.ConeGeometry(1, 1, s, 1).translate(0, 0.5, 0)),
  conef: (s = 6) => base('conef' + s, () => flat(new THREE.ConeGeometry(1, 1, s, 1).translate(0, 0.5, 0))),
  frusf: (rt, s = 7) => {
    const k = Math.round(rt * 100) / 100;
    return base('frusf' + s + '_' + k, () => flat(new THREE.CylinderGeometry(k, 1, 1, s, 1).translate(0, 0.5, 0)));
  },
  cylf: (s = 6) => base('cylf' + s, () => flat(new THREE.CylinderGeometry(1, 1, 1, s, 1).translate(0, 0.5, 0))),
  sph: (w = 12, h = 8) => base('sph' + w + 'x' + h, () => new THREE.SphereGeometry(1, w, h)),
  dome: (w = 14, h = 6) => base('dome' + w + 'x' + h, () => new THREE.SphereGeometry(1, w, h, 0, Math.PI * 2, 0, Math.PI / 2)),
  torus: (tube = 0.1, rs = 6, ts = 18, arc = Math.PI * 2) => {
    const k = `torus${tube}_${rs}_${ts}_${arc.toFixed(3)}`;
    return base(k, () => new THREE.TorusGeometry(1, tube, rs, ts, arc));
  },
  prism: () => base('prism', prismGeo),
  pyr: () => base('pyr', () => flat(new THREE.ConeGeometry(Math.SQRT1_2, 1, 4, 1).rotateY(Math.PI / 4).translate(0, 0.5, 0))),
  oct: () => base('oct', () => new THREE.OctahedronGeometry(1, 0)),
  ico: (d = 0) => base('ico' + d, () => new THREE.IcosahedronGeometry(1, d)),
  disc: (s = 16) => base('disc' + s, () => new THREE.CylinderGeometry(1, 1, 1, s, 1)),
};

function paint(g, c) {
  const n = g.attributes.position.count;
  const arr = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { arr[i * 3] = c.r; arr[i * 3 + 1] = c.g; arr[i * 3 + 2] = c.b; }
  g.setAttribute('color', new THREE.BufferAttribute(arr, 3));
}

const _m = new THREE.Matrix4(), _m2 = new THREE.Matrix4();
const _p = new THREE.Vector3(), _s = new THREE.Vector3(), _q = new THREE.Quaternion();
const _e = new THREE.Euler(0, 0, 0, 'YXZ');
const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _d = new THREE.Vector3();
const UP = new THREE.Vector3(0, 1, 0);

export class Builder {
  constructor() {
    this.buckets = new Map();
    this.stack = [new THREE.Matrix4()];
  }
  get top() { return this.stack[this.stack.length - 1]; }
  // push a local frame: translate, then yaw (ry), uniform scale s, optional pitch/roll
  push(x = 0, y = 0, z = 0, ry = 0, s = 1, rx = 0, rz = 0) {
    _e.set(rx, ry, rz);
    const m = new THREE.Matrix4().compose(_p.set(x, y, z), _q.setFromEuler(_e), _s.set(s, s, s));
    this.stack.push(this.top.clone().multiply(m));
    return this;
  }
  pushM(m) { this.stack.push(this.top.clone().multiply(m)); return this; }
  pop() { if (this.stack.length > 1) this.stack.pop(); return this; }
  toWorld(x, y, z) { return new THREE.Vector3(x, y, z).applyMatrix4(this.top); }

  bucket(mat) {
    let b = this.buckets.get(mat);
    if (!b) { b = []; this.buckets.set(mat, b); }
    return b;
  }
  _add(g0, color, mat, px, py, pz, rx, ry, rz, sx, sy, sz) {
    const g = g0.clone();
    _e.set(rx || 0, ry || 0, rz || 0);
    _m.compose(_p.set(px, py, pz), _q.setFromEuler(_e), _s.set(sx, sy, sz));
    _m2.multiplyMatrices(this.top, _m);
    g.applyMatrix4(_m2);
    paint(g, col(color));
    this.bucket(mat || 'std').push(g);
    return g;
  }
  _addQ(g0, color, mat, pos, quat, scale) {
    const g = g0.clone();
    _m.compose(pos, quat, scale);
    _m2.multiplyMatrices(this.top, _m);
    g.applyMatrix4(_m2);
    paint(g, col(color));
    this.bucket(mat || 'std').push(g);
    return g;
  }

  // ---- primitives (y = bottom unless noted) ----
  box(w, h, d, x, y, z, c, o = {}) {
    return this._add(BASE.box(), c, o.mat, x, y, z, o.rx, o.ry, o.rz, w, h, d);
  }
  boxc(w, h, d, x, y, z, c, o = {}) { // centered
    return this._add(BASE.boxc(), c, o.mat, x, y, z, o.rx, o.ry, o.rz, w, h, d);
  }
  cyl(r, h, x, y, z, c, o = {}) {
    const g = o.rt !== undefined ? (o.flat ? BASE.frusf(o.rt / r, o.seg || 7) : BASE.frus(o.rt / r, o.seg || 12)) : (o.flat ? BASE.cylf(o.seg || 6) : BASE.cyl(o.seg || 12));
    return this._add(g, c, o.mat, x, y, z, o.rx, o.ry, o.rz, r * (o.sx || 1), h, r * (o.sz || 1));
  }
  cone(r, h, x, y, z, c, o = {}) {
    const g = o.flat ? BASE.conef(o.seg || 6) : BASE.cone(o.seg || 12);
    return this._add(g, c, o.mat, x, y, z, o.rx, o.ry, o.rz, r * (o.sx || 1), h, r * (o.sz || 1));
  }
  sph(r, x, y, z, c, o = {}) { // centered
    return this._add(BASE.sph(o.w || 12, o.h || 8), c, o.mat, x, y, z, o.rx, o.ry, o.rz, r * (o.sx || 1), r * (o.sy || 1), r * (o.sz || 1));
  }
  ell(x, y, z, rx, ry, rz, c, o = {}) { // ellipsoid, centered
    return this._add(BASE.sph(o.w || 14, o.h || 10), c, o.mat, x, y, z, o.ax, o.ay, o.az, rx, ry, rz);
  }
  dome(r, x, y, z, c, o = {}) {
    return this._add(BASE.dome(o.w || 14, o.h || 6), c, o.mat, x, y, z, o.rx, o.ry, o.rz, r * (o.sx || 1), r * (o.sy || 1), r * (o.sz || 1));
  }
  torus(R, tube, x, y, z, c, o = {}) { // ring lying flat by default (rx = PI/2)
    const g = BASE.torus(+(tube / R).toFixed(3), o.rs || 6, o.ts || 18, o.arc || Math.PI * 2);
    return this._add(g, c, o.mat, x, y, z, o.rx ?? Math.PI / 2, o.ry, o.rz, R, R, R);
  }
  prism(w, h, d, x, y, z, c, o = {}) { // gable roof, ridge along z
    return this._add(BASE.prism(), c, o.mat, x, y, z, o.rx, o.ry, o.rz, w, h, d);
  }
  pyr(w, h, d, x, y, z, c, o = {}) {
    return this._add(BASE.pyr(), c, o.mat, x, y, z, o.rx, o.ry, o.rz, w, h, d);
  }
  oct(r, x, y, z, c, o = {}) {
    return this._add(BASE.oct(), c, o.mat, x, y, z, o.rx, o.ry, o.rz, r * (o.sx || 1), r * (o.sy || 1), r * (o.sz || 1));
  }
  ico(r, x, y, z, c, o = {}) {
    return this._add(BASE.ico(o.d || 0), c, o.mat, x, y, z, o.rx, o.ry, o.rz, r * (o.sx || 1), r * (o.sy || 1), r * (o.sz || 1));
  }
  // cylinder between two points
  rod(x1, y1, z1, x2, y2, z2, r, c, o = {}) {
    _a.set(x1, y1, z1); _b.set(x2, y2, z2);
    _d.subVectors(_b, _a); const len = _d.length();
    if (len < 1e-5) return null;
    _d.divideScalar(len);
    _q.setFromUnitVectors(UP, _d);
    _p.addVectors(_a, _b).multiplyScalar(0.5);
    return this._addQ(BASE.cylc(o.seg || 6), c, o.mat, _p.clone(), _q.clone(), _s.set(r, len, r).clone());
  }
  // box beam between two points (square section t)
  beam(x1, y1, z1, x2, y2, z2, t, c, o = {}) {
    _a.set(x1, y1, z1); _b.set(x2, y2, z2);
    _d.subVectors(_b, _a); const len = _d.length();
    if (len < 1e-5) return null;
    _d.divideScalar(len);
    _q.setFromUnitVectors(UP, _d);
    _p.addVectors(_a, _b).multiplyScalar(0.5);
    return this._addQ(BASE.boxc(), c, o.mat, _p.clone(), _q.clone(), _s.set(t, len, o.t2 || t).clone());
  }
  // arbitrary geometry (will be stripped to position/normal)
  geo(g, x, y, z, c, o = {}) {
    const gg = strip(g.index ? g : g);
    return this._add(gg, c, o.mat, x, y, z, o.rx, o.ry, o.rz, o.sx || 1, o.sy || 1, o.sz || 1);
  }
  tube(points, r, c, o = {}) {
    const curve = (typeof points.getPointAt === "function") ? points : new THREE.CatmullRomCurve3(points, !!o.closed, 'centripetal');
    const g = strip(new THREE.TubeGeometry(curve, o.seg || Math.max(8, points.length * 6), r, o.rs || 6, !!o.closed));
    return this._add(g, c, o.mat, 0, 0, 0, 0, 0, 0, 1, 1, 1);
  }
  lathe(pts, x, y, z, c, o = {}) {
    const g = strip(new THREE.LatheGeometry(pts.map(p => new THREE.Vector2(p[0], p[1])), o.seg || 24));
    return this._add(g, c, o.mat, x, y, z, o.rx, o.ry, o.rz, 1, 1, 1);
  }
  // extruded 2D shape (xy plane) of given depth, then laid out with rotation
  extrude(shape, depth, x, y, z, c, o = {}) {
    const g = strip(new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: o.cs || 8 }));
    return this._add(g, c, o.mat, x, y, z, o.rx, o.ry, o.rz, o.sx || 1, o.sy || 1, o.sz || 1);
  }

  merged(mat) {
    const list = this.buckets.get(mat);
    if (!list || !list.length) return null;
    return mergeGeometries(list, false);
  }
  // build a Group of merged meshes (one per material bucket)
  build({ shadows = true, name = '' } = {}) {
    const grp = new THREE.Group();
    grp.name = name;
    for (const [mat, list] of this.buckets) {
      if (!list.length) continue;
      const g = mergeGeometries(list, false);
      if (!g) continue;
      const m = MATS[mat];
      if (!m) { console.warn('missing material', mat); continue; }
      const mesh = new THREE.Mesh(g, m);
      const noShadow = mat === 'glow' || mat === 'neon' || mat === 'glassy' || mat === 'bulb';
      mesh.castShadow = shadows && !noShadow;
      mesh.receiveShadow = shadows && mat !== 'neon';
      mesh.name = name + ':' + mat;
      grp.add(mesh);
    }
    this.buckets.clear();
    return grp;
  }
  // single merged geometry across all buckets (for instancing), all painted
  buildGeometry() {
    const all = [];
    for (const list of this.buckets.values()) all.push(...list);
    this.buckets.clear();
    return all.length ? mergeGeometries(all, false) : null;
  }
  isEmpty() { for (const l of this.buckets.values()) if (l.length) return false; return true; }
}

// helper: sample points on a closed loop (array of [x,y,z]) as a CatmullRom curve
export function loopCurve(pts, closed = true, type = 'centripetal') {
  return new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(p[0], p[1], p[2])), closed, type);
}
