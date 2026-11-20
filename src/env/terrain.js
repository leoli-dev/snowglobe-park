// Ground inside the globe: flat park, the railroad berm, snowbanks that climb
// to the glass, and the painted park map (paths, plazas, water beds).
import * as THREE from 'three';
import { GLOBE, PARK_R, TRACK_R, TRACK_Y, TEX_HALF, smoothstep, lerp, DEG } from '../core/config.js';
import { vnoise } from '../core/rng.js';
import { patchMaterial, U } from '../core/materials.js';
import { PATHS, PLAZAS, WATER, LANDS, C } from '../park/layout.js';

const R = GLOBE.R;
function angDeg(x, z) { // from north, clockwise
  let a = Math.atan2(x, -z) / DEG;
  return a < 0 ? a + 360 : a;
}
function entranceMask(a) {
  const d = Math.abs(a - 180);
  return smoothstep(12.5, 7.5, d);
}
export function groundH(x, z) {
  const r = Math.hypot(x, z);
  if (r < PARK_R) return 0;
  if (r < 120) return TRACK_Y * smoothstep(PARK_R, 120, r);
  if (r < 131) return TRACK_Y;
  const a = angDeg(x, z);
  const t = (r - 131) / 17;
  let h = TRACK_Y + 13 * Math.pow(Math.max(t, 0), 1.5);
  const e = entranceMask(a);
  if (e > 0) h = lerp(h, TRACK_Y, e);
  h += (vnoise(a * 0.09, r * 0.09) * 2.6 + vnoise(a * 0.31, r * 0.3) * 0.9) * smoothstep(131, 139, r) * (1 - e);
  return h;
}
function sphereLowY(r) { return GLOBE.cy - Math.sqrt(Math.max(R * R - r * r, 0)); }
// radius where the ground meets the glass along a direction
function edgeR(dx, dz) {
  let lo = 131, hi = R - 0.05;
  for (let i = 0; i < 30; i++) {
    const mid = (lo + hi) / 2;
    const h = groundH(dx * mid, dz * mid);
    if (h > sphereLowY(mid)) lo = mid; else hi = mid;
  }
  return lo;
}

// ---------------- ground texture ----------------
const TS = 4096;
const px = (x) => (x + TEX_HALF) / (TEX_HALF * 2) * TS;
const pz = (z) => (z + TEX_HALF) / (TEX_HALF * 2) * TS;
const pm = (m) => m / (TEX_HALF * 2) * TS;

const PAVE = {
  brick: '#a2543f', brick2: '#8f5444', stone: '#d9cbb4', sand: '#cdb48a', dirt: '#a88458',
  fanta: '#d8c3a6', toon: '#e9c86a', toy: '#c8b48a', future: '#b9c3c9', hub: '#d4b6a0',
};
const EDGE = {
  brick: '#6e3a2c', brick2: '#5e3a30', stone: '#9d8f7c', sand: '#9c8460', dirt: '#755a3a',
  fanta: '#a48d73', toon: '#b38f3a', toy: '#8f7d5a', future: '#7f8a91', hub: '#9b7f6a',
};

function strokePath(g, pts, w) {
  g.beginPath();
  g.moveTo(px(pts[0][0]), pz(pts[0][1]));
  for (let i = 1; i < pts.length; i++) g.lineTo(px(pts[i][0]), pz(pts[i][1]));
  g.lineWidth = pm(w);
  g.stroke();
}
function ellipse(g, x, z, rx, rz) {
  g.beginPath(); g.ellipse(px(x), pz(z), pm(rx), pm(rz), 0, 0, Math.PI * 2);
}
function jungleLoop(g) {
  const pts = WATER.jungle;
  g.beginPath();
  // smooth closed loop via quadratic midpoints
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  let m0 = mid(pts[pts.length - 1], pts[0]);
  g.moveTo(px(m0[0]), pz(m0[1]));
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i], m = mid(p, pts[(i + 1) % pts.length]);
    g.quadraticCurveTo(px(p[0]), pz(p[1]), px(m[0]), pz(m[1]));
  }
  g.closePath();
}

function paintGround(g, mask) {
  // winter grass
  g.fillStyle = '#6b865a'; g.fillRect(0, 0, TS, TS);
  // grain (tiled noise pattern)
  const nc = document.createElement('canvas'); nc.width = nc.height = 256;
  const ng = nc.getContext('2d');
  const img = ng.createImageData(256, 256);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = Math.random() * 255;
    img.data[i] = n; img.data[i + 1] = n; img.data[i + 2] = n * 0.8; img.data[i + 3] = 255;
  }
  ng.putImageData(img, 0, 0);
  g.save(); g.globalAlpha = 0.09; g.globalCompositeOperation = 'overlay';
  g.fillStyle = g.createPattern(nc, 'repeat'); g.fillRect(0, 0, TS, TS);
  g.restore();
  // land tints
  for (const l of LANDS) {
    const gr = g.createRadialGradient(px(l.x), pz(l.z), 0, px(l.x), pz(l.z), pm(l.r));
    gr.addColorStop(0, l.color + 'cc'); gr.addColorStop(1, l.color + '00');
    g.fillStyle = gr; g.fillRect(0, 0, TS, TS);
  }
  // berm and snowbanks: paler, snowy ground
  const bg = g.createRadialGradient(px(0), pz(0), pm(PARK_R - 2), px(0), pz(0), pm(150));
  bg.addColorStop(0, 'rgba(120,140,110,0)'); bg.addColorStop(0.15, 'rgba(160,172,150,0.9)'); bg.addColorStop(1, 'rgba(230,236,238,1)');
  g.fillStyle = bg; g.fillRect(0, 0, TS, TS);
  // railroad ballast
  g.strokeStyle = '#6b6158';
  g.lineWidth = pm(4.6);
  g.beginPath(); g.arc(px(0), pz(0), pm(TRACK_R), 0, Math.PI * 2); g.stroke();
  mask.strokeStyle = '#777'; mask.lineWidth = pm(4.6);
  mask.beginPath(); mask.arc(px(0), pz(0), pm(TRACK_R), 0, Math.PI * 2); mask.stroke();

  // water beds + banks
  const bank = (draw, w) => { draw(); g.lineWidth = pm(w); g.strokeStyle = '#b3a27c'; g.stroke(); };
  const water = '#17414c';
  // moat
  const m = WATER.moat;
  g.beginPath(); g.arc(px(m.x), pz(m.z), pm((m.rin + m.rout) / 2), 0, Math.PI * 2);
  g.lineWidth = pm(m.rout - m.rin + 2.2); g.strokeStyle = '#9b8f7e'; g.stroke();
  g.lineWidth = pm(m.rout - m.rin); g.strokeStyle = water; g.stroke();
  // river
  const rv = WATER.river;
  ellipse(g, rv.x, rv.z, rv.rx + 1.4, rv.rz + 1.4); g.fillStyle = '#b3a27c'; g.fill();
  ellipse(g, rv.x, rv.z, rv.rx, rv.rz); g.fillStyle = water; g.fill();
  ellipse(g, rv.x, rv.z, rv.ix, rv.iz); g.fillStyle = '#7d7a4c'; g.fill();
  ellipse(g, rv.x, rv.z, rv.ix - 0.5, rv.iz - 0.5); g.fillStyle = '#5f7f48'; g.fill();
  // jungle river
  jungleLoop(g); g.lineWidth = pm(WATER.jungleW + 2); g.strokeStyle = '#8f8160'; g.stroke();
  jungleLoop(g); g.lineWidth = pm(WATER.jungleW); g.strokeStyle = '#1c4a3f'; g.stroke();
  for (const p of WATER.ponds) {
    ellipse(g, p.x, p.z, p.rx + 1, p.rz + 1); g.fillStyle = '#a99a78'; g.fill();
    ellipse(g, p.x, p.z, p.rx, p.rz); g.fillStyle = water; g.fill();
  }
  // mask: no snow on water beds
  mask.fillStyle = '#000';
  ellipse(mask, rv.x, rv.z, rv.rx, rv.rz); mask.fill();
  ellipse(mask, rv.x, rv.z, rv.ix, rv.iz); mask.fillStyle = '#fff'; mask.fill();

  // plazas
  for (const pl of PLAZAS) {
    g.fillStyle = PAVE[pl.mat]; mask.fillStyle = '#404040';
    g.strokeStyle = EDGE[pl.mat]; g.lineWidth = pm(0.6);
    if (pl.kind === 'circle') {
      g.beginPath(); g.arc(px(pl.x), pz(pl.z), pm(pl.r), 0, Math.PI * 2); g.fill(); g.stroke();
      mask.beginPath(); mask.arc(px(pl.x), pz(pl.z), pm(pl.r), 0, Math.PI * 2); mask.fill();
    } else {
      g.fillRect(px(pl.x0), pz(pl.z0), pm(pl.x1 - pl.x0), pm(pl.z1 - pl.z0));
      g.strokeRect(px(pl.x0), pz(pl.z0), pm(pl.x1 - pl.x0), pm(pl.z1 - pl.z0));
      mask.fillRect(px(pl.x0), pz(pl.z0), pm(pl.x1 - pl.x0), pm(pl.z1 - pl.z0));
    }
  }
  // paths: edge then fill
  g.lineCap = 'round'; g.lineJoin = 'round';
  mask.lineCap = 'round'; mask.lineJoin = 'round';
  for (const p of PATHS) {
    g.strokeStyle = EDGE[p.kind]; strokePath(g, p.pts, p.w + 1.2);
  }
  for (const p of PATHS) {
    g.strokeStyle = PAVE[p.kind]; strokePath(g, p.pts, p.w);
    mask.strokeStyle = '#404040'; strokePath(mask, p.pts, p.w);
  }
  // Main Street brick texture
  g.save();
  g.beginPath(); g.rect(px(-5), pz(44), pm(10), pm(70)); g.rect(px(-26), pz(90), pm(52), pm(23)); g.clip();
  g.strokeStyle = 'rgba(70,30,20,0.35)'; g.lineWidth = 1.2;
  for (let z = 44; z < 114; z += 0.45) { g.beginPath(); g.moveTo(px(-26), pz(z)); g.lineTo(px(26), pz(z)); g.stroke(); }
  g.restore();
  // sidewalks of Main Street
  g.fillStyle = '#c9b8a1';
  g.fillRect(px(-7), pz(44), pm(2), pm(46)); g.fillRect(px(5), pz(44), pm(2), pm(46));
  // hub: concentric bands + inner garden
  const hub = C.hub;
  g.strokeStyle = 'rgba(120,80,60,0.25)'; g.lineWidth = pm(0.3);
  for (let r = 7.5; r < hub.r; r += 1.4) { g.beginPath(); g.arc(px(hub.x), pz(hub.z), pm(r), 0, Math.PI * 2); g.stroke(); }
  g.fillStyle = '#4f7a3f'; g.beginPath(); g.arc(px(hub.x), pz(hub.z), pm(6.5), 0, Math.PI * 2); g.fill();
  mask.fillStyle = '#ffffff'; mask.beginPath(); mask.arc(px(hub.x), pz(hub.z), pm(6.5), 0, Math.PI * 2); mask.fill();
  // flower beds (dots)
  const beds = [[hub.x, hub.z, 6.2], [0, 101, 7.5], [0, 139, 9]];
  const fl = ['#e8364a', '#f2c94c', '#ffffff', '#c95fd6', '#ff8a3d'];
  for (const [x, z, r] of beds) {
    for (let i = 0; i < 900; i++) {
      const a = Math.random() * Math.PI * 2, rr = Math.sqrt(Math.random()) * r;
      g.fillStyle = fl[i % fl.length];
      g.beginPath(); g.arc(px(x + Math.cos(a) * rr), pz(z + Math.sin(a) * rr), 2.2, 0, Math.PI * 2); g.fill();
    }
  }
  // Tomorrowland pavement pattern
  g.save();
  g.strokeStyle = 'rgba(80,110,140,0.35)'; g.lineWidth = pm(0.25);
  for (const pth of PATHS.filter(p => p.kind === 'future')) {
    g.setLineDash([pm(2), pm(2)]); strokePath(g, pth.pts, 0.25);
  }
  g.restore();
}

export class Terrain {
  constructor(world) {
    // textures
    const cv = document.createElement('canvas'); cv.width = cv.height = TS;
    const mk = document.createElement('canvas'); mk.width = mk.height = 1024;
    const g = cv.getContext('2d');
    const mg = mk.getContext('2d');
    mg.fillStyle = '#fff'; mg.fillRect(0, 0, 1024, 1024);
    mg.scale(1024 / TS, 1024 / TS);
    paintGround(g, mg);
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 16;
    tex.generateMipmaps = true;
    const mtex = new THREE.CanvasTexture(mk);
    mtex.colorSpace = THREE.NoColorSpace;
    U.uSnowMask.value = mtex;
    this.canvas = cv;
    this.maskData = mg.getImageData(0, 0, 1024, 1024).data;

    const mat = patchMaterial(new THREE.MeshStandardMaterial({ map: tex, roughness: 0.93, metalness: 0 }), { snow: 1, mask: true });
    this.mat = mat;
    const uvOf = (x, z) => [(x + TEX_HALF) / (TEX_HALF * 2), (TEX_HALF - z) / (TEX_HALF * 2)];

    // flat disc
    const disc = new THREE.CircleGeometry(PARK_R, 200).rotateX(-Math.PI / 2);
    {
      const p = disc.attributes.position, uv = disc.attributes.uv;
      for (let i = 0; i < p.count; i++) { const [u, v] = uvOf(p.getX(i), p.getZ(i)); uv.setXY(i, u, v); }
    }
    const discMesh = new THREE.Mesh(disc, mat);
    discMesh.receiveShadow = true;
    world.add(discMesh);

    // berm + snowbanks up to the glass
    const SEG = 360, RINGS = 34;
    const pos = [], uvs = [], idx = [];
    this.edge = [];
    for (let j = 0; j <= SEG; j++) {
      const a = j / SEG * Math.PI * 2;
      const dx = Math.sin(a), dz = -Math.cos(a);
      const re = edgeR(dx, dz);
      this.edge.push({ dx, dz, r: re, y: groundH(dx * re, dz * re) });
      for (let i = 0; i <= RINGS; i++) {
        const t = i / RINGS;
        const r = PARK_R + (re - PARK_R) * t;
        const x = dx * r, z = dz * r;
        let y = groundH(x, z);
        if (i === RINGS) y = sphereLowY(re) + 0.05;
        pos.push(x, y, z);
        uvs.push(...uvOf(x, z));
      }
    }
    for (let j = 0; j < SEG; j++) for (let i = 0; i < RINGS; i++) {
      const a = j * (RINGS + 1) + i, b = (j + 1) * (RINGS + 1) + i;
      idx.push(a, a + 1, b, b, a + 1, b + 1);
    }
    const bg = new THREE.BufferGeometry();
    bg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    bg.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    bg.setIndex(idx);
    bg.computeVertexNormals();
    const berm = new THREE.Mesh(bg, mat);
    berm.receiveShadow = true;
    berm.castShadow = true;
    world.add(berm);

    // packed-snow wall visible through the glass below the ground line
    const bandPos = [], bandUv = [], bandIdx = [];
    const ROWS = 10, Rin = R - 0.7;
    for (let j = 0; j <= SEG; j++) {
      const e = this.edge[j];
      const yTop = sphereLowY(e.r) + 0.05;
      for (let i = 0; i <= ROWS; i++) {
        const y = lerp(yTop, GLOBE.cutY + 0.5, i / ROWS);
        const rr = Math.sqrt(Math.max(Rin * Rin - (y - GLOBE.cy) ** 2, 0));
        bandPos.push(e.dx * rr, y, e.dz * rr);
        bandUv.push(...uvOf(e.dx * 149, e.dz * 149));
      }
    }
    for (let j = 0; j < SEG; j++) for (let i = 0; i < ROWS; i++) {
      const a = j * (ROWS + 1) + i, b = (j + 1) * (ROWS + 1) + i;
      bandIdx.push(a, b, a + 1, b, b + 1, a + 1);
    }
    const band = new THREE.BufferGeometry();
    band.setAttribute('position', new THREE.Float32BufferAttribute(bandPos, 3));
    band.setAttribute('uv', new THREE.Float32BufferAttribute(bandUv, 2));
    band.setIndex(bandIdx);
    band.computeVertexNormals();
    const snowWall = new THREE.Mesh(band, new THREE.MeshStandardMaterial({ color: 0xeef2f6, roughness: 0.95, side: THREE.DoubleSide }));
    world.add(snowWall);
    // floor disc closing the bottom of the snow platform
    const floor = new THREE.Mesh(new THREE.CircleGeometry(138, 96).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xdfe6ec, roughness: 1 }));
    floor.position.y = GLOBE.cutY + 0.4;
    world.add(floor);
  }
}

export { angDeg };
