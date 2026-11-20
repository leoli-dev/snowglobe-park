// All water surfaces merged into one mesh with planar UVs for the ripple map.
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { MATS } from '../core/materials.js';
import { WATER } from './layout.js';
import { TEX_HALF } from '../core/config.js';

const WY = 0.22;
function flatShape(shape, segs = 64) {
  const g = new THREE.ShapeGeometry(shape, segs);
  g.rotateX(Math.PI / 2); // shape xy -> xz (y -> z)
  return g;
}
function ellipseShape(x, z, rx, rz, hole) {
  const s = new THREE.Shape();
  s.absellipse(x, z, rx, rz, 0, Math.PI * 2, false, 0);
  if (hole) {
    const h = new THREE.Path();
    h.absellipse(hole.x, hole.z, hole.rx, hole.rz, 0, Math.PI * 2, true, 0);
    s.holes.push(h);
  }
  return s;
}
function ribbon(curve, w, n = 220) {
  const pos = [], idx = [];
  const p = new THREE.Vector3(), t = new THREE.Vector3();
  for (let i = 0; i <= n; i++) {
    curve.getPointAt((i % n) / n, p); curve.getTangentAt((i % n) / n, t);
    const nx = -t.z, nz = t.x;
    pos.push(p.x + nx * w / 2, 0, p.z + nz * w / 2, p.x - nx * w / 2, 0, p.z - nz * w / 2);
    if (i < n) { const a = i * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

export function jungleCurve() {
  return new THREE.CatmullRomCurve3(WATER.jungle.map(([x, z]) => new THREE.Vector3(x, 0, z)), true, 'centripetal');
}

export function buildWater(world, extra = []) {
  const geos = [];
  const m = WATER.moat;
  const ring = new THREE.RingGeometry(m.rin, m.rout, 128, 1);
  ring.rotateX(-Math.PI / 2); ring.translate(m.x, 0, m.z);
  geos.push(ring);
  const r = WATER.river;
  geos.push(flatShape(ellipseShape(r.x, r.z, r.rx, r.rz, { x: r.x, z: r.z, rx: r.ix, rz: r.iz }), 96));
  geos.push(ribbon(jungleCurve(), WATER.jungleW));
  for (const p of WATER.ponds) geos.push(flatShape(ellipseShape(p.x, p.z, p.rx, p.rz), 40));
  for (const e of extra) geos.push(e);
  for (const g of geos) {
    for (const k of Object.keys(g.attributes)) if (k !== 'position') g.deleteAttribute(k);
    if (!g.index) { const n = g.attributes.position.count; g.setIndex([...Array(n).keys()]); }
    const pos = g.attributes.position;
    const uv = new Float32Array(pos.count * 2);
    const nrm = new Float32Array(pos.count * 3);
    for (let i = 0; i < pos.count; i++) {
      pos.setY(i, WY);
      uv[i * 2] = (pos.getX(i) + TEX_HALF) / (TEX_HALF * 2);
      uv[i * 2 + 1] = (TEX_HALF - pos.getZ(i)) / (TEX_HALF * 2);
      nrm[i * 3 + 1] = 1;
    }
    g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    g.setAttribute('normal', new THREE.BufferAttribute(nrm, 3));
  }
  const merged = mergeGeometries(geos, false);
  // make sure all faces point up
  const mesh = new THREE.Mesh(merged, MATS.water);
  mesh.material.side = THREE.DoubleSide;
  mesh.receiveShadow = true;
  mesh.name = 'water';
  world.add(mesh);
  return mesh;
}

// helper for additional rectangular canals / lagoons
export function rectWater(x0, z0, x1, z1) {
  const g = new THREE.PlaneGeometry(x1 - x0, z1 - z0);
  g.rotateX(-Math.PI / 2); g.translate((x0 + x1) / 2, 0, (z0 + z1) / 2);
  return g;
}
export function ellipseWater(x, z, rx, rz) { return flatShape(ellipseShape(x, z, rx, rz), 40); }
