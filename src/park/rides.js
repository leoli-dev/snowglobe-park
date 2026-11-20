// Shared ride machinery: roller-coaster tracks with trains, rock spires,
// and a simple "follow the curve" helper for boats and vehicles.
import * as THREE from 'three';
import { Builder } from '../core/builder.js';
import { rr } from '../core/rng.js';

const _p = new THREE.Vector3(), _t = new THREE.Vector3(), _q = new THREE.Vector3();

// pts: local [x,y,z] relative to origin (ox,oz) rotated by ry
export function coaster(ctx, o) {
  const { b, world, H } = ctx;
  const { ox, oz, ry = 0, pts, rail = '#c8452a', spine = '#7a3a22', support = '#6a4a2a', width = 1.2,
    supportEvery = 2.6, supportR = 0.16, carFn, nCars = 5, spacing = 2.2, speed = 6, wood = false, tension = 0.5 } = o;
  const c = Math.cos(ry), s = Math.sin(ry);
  const world3 = pts.map(([x, y, z]) => new THREE.Vector3(ox + x * c + z * s, y, oz - x * s + z * c));
  const curve = new THREE.CatmullRomCurve3(world3, true, 'catmullrom', tension);
  const L = curve.getLength();
  const N = Math.max(80, Math.round(L / 0.5));
  const left = [], right = [], mid = [];
  let ymin = 1e9, ymax = -1e9;
  for (let i = 0; i <= N; i++) {
    const u = (i % N) / N;
    curve.getPointAt(u, _p); curve.getTangentAt(u, _t);
    const hx = -_t.z, hz = _t.x; const hl = Math.hypot(hx, hz) || 1;
    left.push(new THREE.Vector3(_p.x + hx / hl * width / 2, _p.y, _p.z + hz / hl * width / 2));
    right.push(new THREE.Vector3(_p.x - hx / hl * width / 2, _p.y, _p.z - hz / hl * width / 2));
    mid.push(new THREE.Vector3(_p.x, _p.y - 0.35, _p.z));
    ymin = Math.min(ymin, _p.y); ymax = Math.max(ymax, _p.y);
  }
  b.tube(new THREE.CatmullRomCurve3(left, true), 0.12, rail, { seg: N * 2, rs: 5, closed: true, mat: 'gloss' });
  b.tube(new THREE.CatmullRomCurve3(right, true), 0.12, rail, { seg: N * 2, rs: 5, closed: true, mat: 'gloss' });
  b.tube(new THREE.CatmullRomCurve3(mid, true), 0.22, spine, { seg: N * 2, rs: 5, closed: true, mat: 'gloss' });
  // ties
  for (let i = 0; i < N; i += 2) {
    const u = i / N;
    curve.getPointAt(u, _p); curve.getTangentAt(u, _t);
    b.push(_p.x, _p.y - 0.2, _p.z, Math.atan2(_t.x, _t.z));
    b.box(width + 0.3, 0.12, 0.2, 0, 0, 0, wood ? '#5a3a22' : spine);
    b.pop();
  }
  // supports
  const steps = Math.floor(L / supportEvery);
  for (let i = 0; i < steps; i++) {
    curve.getPointAt(i / steps, _p);
    const gy = H(_p.x, _p.z);
    if (_p.y - gy < 0.8) continue;
    if (wood) {
      b.box(0.3, _p.y - gy - 0.3, 0.3, _p.x, gy, _p.z, support);
      if (i % 2 === 0 && _p.y - gy > 3) b.beam(_p.x - 1.2, gy, _p.z, _p.x + 0.0, _p.y - 0.6, _p.z, 0.18, support);
    } else {
      b.cyl(supportR, _p.y - gy - 0.3, _p.x, gy, _p.z, support, { seg: 6 });
    }
  }
  // train
  const proto = carFn();
  const cars = [];
  for (let i = 0; i < nCars; i++) {
    const car = i === 0 && o.leadFn ? o.leadFn() : proto.clone();
    world.add(car);
    cars.push(car);
  }
  let sDist = rr(0, L), v = speed;
  const look = new THREE.Vector3();
  ctx.anims.push((dt) => {
    // energy-ish speed: faster when low
    curve.getPointAt((sDist / L) % 1, _p);
    const k = (ymax - _p.y) / Math.max(ymax - ymin, 1);
    const target = speed * (0.55 + 0.75 * Math.sqrt(Math.max(k, 0)));
    v += (target - v) * Math.min(1, dt * 2);
    sDist = (sDist + v * dt) % L;
    for (let i = 0; i < cars.length; i++) {
      const u = (((sDist - i * spacing) % L) + L) % L / L;
      curve.getPointAt(u, _p); curve.getTangentAt(u, _t);
      cars[i].position.copy(_p);
      look.copy(_p).add(_t);
      cars[i].lookAt(look);
    }
  });
  return { curve, cars };
}

// craggy rock spire: tapering flat-shaded segments that twist slightly,
// with strata color bands and a jagged cap
export function rockSpire(b, x, z, h, r, strata, y0 = 0, seg = 7) {
  let y = y0, cr = r;
  const layers = Math.max(2, Math.round(h / 4.2));
  let ox = 0, oz = 0;
  for (let i = 0; i < layers; i++) {
    const lh = h / layers * rr(0.85, 1.15);
    const nr = cr * rr(0.8, 0.93);
    ox += rr(-0.35, 0.35); oz += rr(-0.35, 0.35);
    b.cyl(cr, lh, x + ox, y, z + oz, strata[(i + (x * 7 | 0)) % strata.length], { rt: nr, seg, flat: true, ry: rr(0, 6.28) });
    // vertical fins break up the silhouette
    if (i % 2 === 0) for (let k = 0; k < 3; k++) {
      const a = rr(0, 6.28);
      b.box(cr * 0.5, lh * rr(0.6, 1.0), cr * 0.35, x + ox + Math.cos(a) * cr * 0.8, y, z + oz + Math.sin(a) * cr * 0.8, strata[(i + k + 2) % strata.length], { ry: -a + rr(-0.3, 0.3) });
    }
    y += lh; cr = nr;
  }
  b.cyl(cr * 0.95, cr * 0.35, x + ox, y, z + oz, strata[(layers + 1) % strata.length], { rt: cr * 0.7, seg: 6, flat: true, ry: rr(0, 6), rz: rr(-0.12, 0.12) });
  return y;
}

// lumpy rock/earth mound from flat-shaded icosahedra
export function mound(b, x, y, z, rx, ry, rz, color, opts = {}) {
  return b.ico(1, x, y, z, color, { d: opts.d ?? 1, sx: rx, sy: ry, sz: rz, ry: opts.rot ?? rr(0, 6.28), mat: opts.mat });
}

// object follows a closed curve at constant speed
export function follow(ctx, obj, curve, speed, phase = 0, yOff = 0, bob = 0) {
  const L = curve.getLength();
  let s = phase * L;
  const p = new THREE.Vector3(), t = new THREE.Vector3();
  ctx.anims.push((dt, time) => {
    s = (s + speed * dt) % L;
    curve.getPointAt(s / L, p); curve.getTangentAt(s / L, t);
    obj.position.set(p.x, p.y + yOff + (bob ? Math.sin(time * 1.3 + phase * 10) * bob : 0), p.z);
    obj.rotation.y = Math.atan2(t.x, t.z);
  });
}

export function ellipseCurve(cx, cz, rx, rz, y = 0, n = 64, ccw = false) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = (ccw ? -1 : 1) * i / n * Math.PI * 2;
    pts.push(new THREE.Vector3(cx + Math.sin(a) * rx, y, cz - Math.cos(a) * rz));
  }
  return new THREE.CatmullRomCurve3(pts, true);
}

export function simpleCar(color, seats = 2, opts = {}) {
  const b = new Builder();
  const w = opts.w || 1.3, l = opts.l || 1.9;
  b.box(w, 0.6, l, 0, 0.0, 0, color, { mat: 'gloss' });
  b.box(w - 0.2, 0.35, 0.2, 0, 0.6, l / 2 - 0.15, color, { mat: 'gloss' });
  const cs = ['#d8483a', '#3a6ad8', '#f2c94c', '#3aa86a', '#ffffff', '#c45ab8'];
  for (let k = 0; k < seats; k++) {
    const zz = l / 2 - 0.55 - k * 0.8;
    b.sph(0.18, -w / 4, 0.95, zz, '#f2c9a0', { w: 6, h: 5 });
    b.sph(0.18, w / 4, 0.95, zz, '#d9a77c', { w: 6, h: 5 });
    b.box(0.32, 0.35, 0.25, -w / 4, 0.5, zz, cs[(k * 2) % 6]);
    b.box(0.32, 0.35, 0.25, w / 4, 0.5, zz, cs[(k * 2 + 1) % 6]);
  }
  return b.build({ name: 'car' });
}
