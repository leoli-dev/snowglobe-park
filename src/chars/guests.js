// Park guests: hundreds of tiny visitors in winter coats strolling the paths,
// some wearing Mickey ears, some carrying Mickey balloons.
import * as THREE from 'three';
import { Builder } from '../core/builder.js';
import { MATS } from '../core/materials.js';
import { PATHS, C, A } from '../park/layout.js';
import { rand, rr, pick } from '../core/rng.js';

const COATS = ['#c8283a', '#2f5fc6', '#2f7a4a', '#f2c94c', '#f4f0e8', '#7a3ad8', '#e86a9a', '#2a3a5a', '#e8742a', '#3ab8c8', '#8a5a3a', '#d8d8dc'];
const SKINS = ['#f6cfac', '#e9b48c', '#c98e66', '#8a5a3a', '#f2d2b8'];
const BALLOON = ['#e8423a', '#f6d55c', '#2f6fd8', '#3aa86a', '#f08ac0', '#9a5ad8', '#f4f4f4'];

function circlePts(cx, cz, r, n = 24) {
  const p = [];
  for (let i = 0; i <= n; i++) { const a = i / n * Math.PI * 2; p.push([cx + Math.cos(a) * r, cz + Math.sin(a) * r]); }
  return p;
}

export function buildGuests(world, ctx, count = 760) {
  const routes = PATHS.filter(p => p.id !== 'fan0').map(p => ({ pts: p.pts, w: p.w }));
  routes.push({ pts: circlePts(A.carousel[0], A.carousel[1], 11.5), w: 4 });
  routes.push({ pts: circlePts(C.hub.x, C.hub.z, 10), w: 5 });
  routes.push({ pts: [[0, -44], [0, -46]], w: 6 });
  routes.push({ pts: [[-20, 94], [20, 94], [20, 110], [-20, 110], [-20, 94]], w: 5 });
  routes.push({ pts: [[-15, 139], [15, 139]], w: 5 });
  for (const r of routes) {
    r.cum = [0];
    for (let i = 1; i < r.pts.length; i++) r.cum.push(r.cum[i - 1] + Math.hypot(r.pts[i][0] - r.pts[i - 1][0], r.pts[i][1] - r.pts[i - 1][1]));
    r.len = r.cum[r.cum.length - 1];
  }
  const totalLen = routes.reduce((a, r) => a + r.len * r.w, 0);

  // geometry
  const bb = new Builder();
  for (const s of [-1, 1]) bb.cyl(0.075, 0.8, s * 0.1, 0, 0, '#2a2a2e', { seg: 5 });
  bb.cyl(0.21, 0.72, 0, 0.72, 0, '#ffffff', { seg: 8, rt: 0.17 });
  bb.sph(0.18, 0, 1.42, 0, '#ffffff', { w: 6, h: 4, sy: 0.5 });
  for (const s of [-1, 1]) bb.rod(s * 0.2, 1.38, 0, s * 0.26, 0.92, 0.04, 0.055, '#ffffff', { seg: 4 });
  bb.cyl(0.12, 0.08, 0, 1.44, 0, '#d8d8d8', { seg: 6 });
  const bodyGeo = bb.buildGeometry();
  const hb = new Builder();
  hb.sph(0.13, 0, 1.6, 0.01, '#ffffff', { w: 8, h: 6 });
  hb.sph(0.138, 0, 1.63, -0.02, '#4a3a30', { w: 8, h: 5 });
  const headGeo = hb.buildGeometry();
  const eb = new Builder();
  for (const s of [-1, 1]) eb.cyl(0.085, 0.02, s * 0.12, 1.78, -0.02, '#111111', { rx: Math.PI / 2, seg: 10 });
  eb.sph(0.142, 0, 1.64, -0.02, '#111111', { w: 8, h: 4 });
  const earGeo = eb.buildGeometry();
  const lb = new Builder();
  lb.sph(0.32, 0, 0, 0, '#ffffff', { w: 10, h: 8 });
  lb.sph(0.18, -0.3, 0.27, 0, '#ffffff', { w: 8, h: 6 });
  lb.sph(0.18, 0.3, 0.27, 0, '#ffffff', { w: 8, h: 6 });
  lb.cyl(0.006, 1.7, 0, -2.0, 0, '#dddddd', { seg: 3 });
  const balloonGeo = lb.buildGeometry();

  const bodies = new THREE.InstancedMesh(bodyGeo, MATS.std, count);
  const heads = new THREE.InstancedMesh(headGeo, MATS.nosnow, count);
  const nEars = Math.floor(count * 0.28), nBal = Math.floor(count * 0.09);
  const ears = new THREE.InstancedMesh(earGeo, MATS.gloss, nEars);
  const balloons = new THREE.InstancedMesh(balloonGeo, MATS.gloss, nBal);
  const c = new THREE.Color();
  const guests = [];
  for (let i = 0; i < count; i++) {
    // weighted by route length × width
    let pickL = rand() * totalLen, route = routes[0];
    for (const r of routes) { pickL -= r.len * r.w; if (pickL <= 0) { route = r; break; } }
    const stand = rand() < 0.14;
    guests.push({
      route, s: rand() * route.len, dir: rand() < 0.5 ? 1 : -1,
      off: (rand() - 0.5) * (route.w - 1.2), v: rr(0.8, 1.45), ph: rand() * 10,
      pause: stand ? 1e9 : 0, scale: rr(0.82, 1.05) * (rand() < 0.15 ? 0.7 : 1),
      ear: i < nEars ? i : -1, bal: i >= count - nBal ? i - (count - nBal) : -1,
    });
    bodies.setColorAt(i, c.set(pick(COATS)));
    heads.setColorAt(i, c.set(pick(SKINS)));
  }
  for (let i = 0; i < nBal; i++) balloons.setColorAt(i, c.set(BALLOON[i % BALLOON.length]));
  for (const m of [bodies, heads, ears, balloons]) {
    m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
    m.frustumCulled = false;
    m.castShadow = false;
    m.receiveShadow = true;
    world.add(m);
  }
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), p = new THREE.Vector3(), sc = new THREE.Vector3();
  const ptAt = (r, s, out) => {
    let i = 1;
    while (i < r.cum.length - 1 && r.cum[i] < s) i++;
    const a = r.pts[i - 1], b2 = r.pts[i];
    const seg = r.cum[i] - r.cum[i - 1] || 1;
    const t = Math.min(1, Math.max(0, (s - r.cum[i - 1]) / seg));
    const dx = (b2[0] - a[0]) / seg, dz = (b2[1] - a[1]) / seg;
    out.x = a[0] + (b2[0] - a[0]) * t; out.z = a[1] + (b2[1] - a[1]) * t; out.dx = dx; out.dz = dz;
    return out;
  };
  const tmp = { x: 0, z: 0, dx: 0, dz: 1 };
  let frame = 0;
  const update = (dt, time) => {
    frame++;
    for (let i = 0; i < guests.length; i++) {
      const g = guests[i];
      let moving = false;
      if (g.pause > 0) g.pause -= dt;
      else {
        g.s += g.v * g.dir * dt;
        moving = true;
        if (g.s > g.route.len) { g.s = g.route.len; g.dir = -1; g.pause = rand() < 0.4 ? rr(1, 6) : 0; }
        if (g.s < 0) { g.s = 0; g.dir = 1; g.pause = rand() < 0.4 ? rr(1, 6) : 0; }
        if (rand() < dt * 0.012) g.pause = rr(2, 8);
      }
      ptAt(g.route, g.s, tmp);
      const nx = -tmp.dz, nz = tmp.dx;
      const x = tmp.x + nx * g.off, z = tmp.z + nz * g.off;
      const bob = moving ? Math.abs(Math.sin(time * 7 * g.v + g.ph)) * 0.05 : 0;
      const yaw = Math.atan2(tmp.dx * g.dir, tmp.dz * g.dir) + (moving ? 0 : Math.sin(time * 0.3 + g.ph) * 0.8);
      const y = ctx.H(x, z);
      e.set(0, yaw, moving ? Math.sin(time * 7 * g.v + g.ph) * 0.04 : 0);
      q.setFromEuler(e);
      m4.compose(p.set(x, y + bob, z), q, sc.setScalar(g.scale));
      bodies.setMatrixAt(i, m4);
      heads.setMatrixAt(i, m4);
      if (g.ear >= 0) ears.setMatrixAt(g.ear, m4);
      if (g.bal >= 0) {
        e.set(Math.sin(time * 1.3 + g.ph) * 0.1, yaw, Math.sin(time * 1.1 + g.ph) * 0.12); q.setFromEuler(e);
        m4.compose(p.set(x + Math.sin(yaw + 1.2) * 0.3, y + 3.3 * g.scale + Math.sin(time * 1.6 + g.ph) * 0.06, z + Math.cos(yaw + 1.2) * 0.3), q, sc.setScalar(1));
        balloons.setMatrixAt(g.bal, m4);
      }
    }
    bodies.instanceMatrix.needsUpdate = true;
    heads.instanceMatrix.needsUpdate = true;
    ears.instanceMatrix.needsUpdate = true;
    balloons.instanceMatrix.needsUpdate = true;
  };
  ctx.anims.push(update);
  // balloon vendor with a giant cluster of Mickey balloons on Main Street
  const vb = new Builder();
  vb.cyl(0.05, 2.4, 0, 0, 0, '#dddddd', { seg: 3 });
  for (let k = 0; k < 26; k++) {
    const a = k * 2.4, r = 0.4 + (k % 5) * 0.18, hh = 2.6 + (k % 7) * 0.25;
    const col = BALLOON[k % BALLOON.length];
    const bx = Math.cos(a) * r, bz = Math.sin(a) * r;
    vb.sph(0.3, bx, hh, bz, col, { mat: 'gloss', w: 8, h: 6 });
    vb.sph(0.17, bx - 0.28, hh + 0.25, bz, col, { mat: 'gloss', w: 6, h: 5 });
    vb.sph(0.17, bx + 0.28, hh + 0.25, bz, col, { mat: 'gloss', w: 6, h: 5 });
  }
  const vendor = vb.build({ name: 'balloons' });
  vendor.position.set(4.4, 0.9, 80);
  world.add(vendor);
  ctx.anims.push((dt, t) => { vendor.rotation.y = Math.sin(t * 0.4) * 0.15; vendor.rotation.z = Math.sin(t * 0.7) * 0.03; });
  ctx.poi({ id: 'balloons', name: '米奇气球小贩', en: 'Balloon vendor', land: '美国小镇大街', x: 4.4, y: 3, z: 80, dist: 12, pitch: 0.25, yaw: -0.8 });
  return { guests, update };
}
