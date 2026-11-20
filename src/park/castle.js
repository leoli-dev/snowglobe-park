// The fairy-tale castle at the heart of the park (blue spires, gold trim,
// projection lighting + icicle "dream lights" at night), its moat bridges.
import { C } from './layout.js';

const WALL = '#f2e6dc', WALL2 = '#ead8cc', TRIM = '#dcc7b4', STONE = '#b4a48e', STONE2 = '#a39279';
const BLUE = '#2c5fc6', BLUE2 = '#3a72dc', GOLD = '#e7bd57', WIN = '#ffd08a', DOOR = '#2a2130';
const DREAM = '#d9ecff';

export function buildCastle(ctx) {
  const { b, props } = ctx;
  const [cx, cz] = C.castle;
  b.push(cx, 0, cz);

  const bulbsOnCone = (x, y0, z, r, h, n = 8, step = 1.1) => {
    for (let k = 0; k < n; k++) {
      const a = k / n * Math.PI * 2;
      const L = Math.hypot(r, h);
      const m = Math.max(2, Math.floor(L / step));
      for (let i = 0; i < m; i++) {
        const t = i / m;
        const rr = r * (1 - t) + 0.08;
        const wx = cx + x + Math.sin(a) * rr, wz = cz + z + Math.cos(a) * rr;
        props.bulb(wx, y0 + h * t, wz, DREAM, 0.12);
      }
    }
  };

  const tower = (x, z, y0, r, h, roofR, roofH, o = {}) => {
    const seg = o.seg || 16;
    b.cyl(r, h, x, y0, z, o.wall || WALL, { seg, mat: 'castle' });
    if (o.corbel) b.cone(r, r * 1.2, x, y0, z, o.wall || WALL, { seg, mat: 'castle', rx: Math.PI });
    b.cyl(r * 1.13, 0.9, x, y0 + h - 0.9, z, TRIM, { seg, mat: 'castle' });
    // windows
    const nw = o.nw ?? Math.max(3, Math.round(r * 2));
    for (const fy of o.winY || [0.55]) {
      for (let k = 0; k < nw; k++) {
        const a = k / nw * Math.PI * 2 + 0.3;
        b.push(x + Math.sin(a) * r * 0.97, y0 + h * fy, z + Math.cos(a) * r * 0.97, a);
        b.box(Math.min(0.55, r * 0.3), Math.min(1.8, h * 0.18), 0.25, 0, 0, 0, WIN, { mat: 'glow' });
        b.cone(Math.min(0.28, r * 0.15), 0.4, 0, Math.min(1.8, h * 0.18), 0, WIN, { mat: 'glow', seg: 6 });
        b.pop();
      }
    }
    // roof
    const yr = y0 + h;
    b.cone(roofR, roofH, x, yr, z, o.roof || BLUE, { seg: 18, mat: 'gloss' });
    b.torus(roofR * 0.98, 0.13, x, yr + 0.12, z, GOLD, { mat: 'metal', ts: 24 });
    b.torus(roofR * 0.55, 0.08, x, yr + roofH * 0.45, z, GOLD, { mat: 'metal', ts: 18 });
    b.sph(Math.max(0.22, roofR * 0.08), x, yr + roofH + 0.15, z, GOLD, { mat: 'metal' });
    b.cone(Math.max(0.08, roofR * 0.03), roofR * 0.45 + 0.6, x, yr + roofH + 0.25, z, GOLD, { mat: 'metal', seg: 6 });
    if (o.flag) {
      b.cyl(0.05, 3, x, yr + roofH + 0.4, z, '#d8d8d8', { seg: 4, mat: 'metal' });
      b.box(1.4, 0.8, 0.05, x + 0.72, yr + roofH + 2.4, z, o.flag, { mat: 'gloss' });
    }
    if (o.dream !== false) bulbsOnCone(x, yr, z, roofR, roofH, o.dn || 8);
  };

  // --- rock plinth ---
  b.box(36, 1.6, 31, 0, 0, -1, STONE2);
  b.box(33, 2.2, 28.5, 0, 1.6, -1, STONE);
  // --- curtain walls with crenellations ---
  const wallH = 9.5, Y0 = 3.8;
  const walls = [
    [-15, 12, 15, 12], [15, 12, 15, -14], [15, -14, -15, -14], [-15, -14, -15, 12],
  ];
  for (const [x1, z1, x2, z2] of walls) {
    const len = Math.hypot(x2 - x1, z2 - z1);
    const ang = Math.atan2(x2 - x1, z2 - z1);
    b.push((x1 + x2) / 2, Y0, (z1 + z2) / 2, ang);
    b.box(1.8, wallH, len, 0, 0, 0, WALL2, { mat: 'castle' });
    b.box(2.3, 0.7, len, 0, wallH - 0.7, 0, TRIM, { mat: 'castle' });
    for (let s = -len / 2 + 0.9; s < len / 2; s += 1.7) {
      b.box(2.1, 0.9, 0.85, 0, wallH, s, WALL2, { mat: 'castle' });
    }
    b.pop();
  }
  // dream-light strings along the wall tops
  for (const [x1, z1, x2, z2] of walls) {
    const n = Math.round(Math.hypot(x2 - x1, z2 - z1) / 1.1);
    props.bulbLine([cx + x1, Y0 + wallH + 1.0, cz + z1], [cx + x2, Y0 + wallH + 1.0, cz + z2], n, DREAM, 0, 0.11);
  }

  // --- gate on the front wall ---
  b.push(0, Y0, 12.9);
  b.box(6.4, 7.2, 0.6, 0, 0, 0, TRIM, { mat: 'castle' });
  b.box(4.2, 5.0, 1.0, 0, 0, 0.05, DOOR, { mat: 'nosnow' });
  b.cyl(2.1, 1.0, 0, 5.0, 0.05, DOOR, { rx: Math.PI / 2, seg: 16, mat: 'nosnow' });
  b.torus(2.45, 0.22, 0, 5.0, 0.6, GOLD, { rx: 0, mat: 'metal', arc: Math.PI, ts: 16 });
  // portcullis bars
  for (let i = -3; i <= 3; i++) b.box(0.08, 4.4, 0.08, i * 0.55, 0.5, 0.65, '#4b3d33', { mat: 'metal' });
  // crest above the gate
  b.cyl(1.1, 0.25, 0, 8.4, 0.5, GOLD, { rx: Math.PI / 2, seg: 16, mat: 'metal' });
  b.cyl(0.8, 0.27, 0, 8.4, 0.52, '#2a55b8', { rx: Math.PI / 2, seg: 16, mat: 'gloss' });
  b.pop();

  // --- second tier block ---
  b.box(24, 12, 16, 0, Y0 + 4, -3, WALL, { mat: 'castle' });
  b.box(25, 0.8, 17, 0, Y0 + 15.2, -3, TRIM, { mat: 'castle' });
  // big arched window + balcony on the front of the tier
  b.box(3.4, 5.2, 0.3, 0, Y0 + 8.6, 5.05, WIN, { mat: 'glow' });
  b.cyl(1.7, 0.3, 0, Y0 + 13.8, 5.05, WIN, { rx: Math.PI / 2, seg: 14, mat: 'glow' });
  b.box(5, 0.4, 1.4, 0, Y0 + 8.2, 5.6, TRIM, { mat: 'castle' });
  for (const x of [-7.5, -4.5, 4.5, 7.5]) {
    b.box(1.0, 3.2, 0.25, x, Y0 + 9, 5.05, WIN, { mat: 'glow' });
    b.cone(0.5, 0.8, x, Y0 + 12.2, 5.05, WIN, { mat: 'glow', seg: 6 });
  }
  // roof of the tier (steep blue hip)
  b.pyr(22, 6, 13, 0, Y0 + 16, -3.5, BLUE2, { mat: 'gloss' });
  // gables with gold trim on the tier
  for (const x of [-6, 6]) {
    b.prism(5, 4.5, 2, x, Y0 + 15.5, 4.2, WALL, { mat: 'castle' });
    b.box(1.0, 2.0, 0.25, x, Y0 + 16.2, 5.25, WIN, { mat: 'glow' });
  }

  // --- central keep and the great spire ---
  b.box(13, 10, 11, 0, Y0 + 16, -4, WALL, { mat: 'castle' });
  b.box(13.8, 0.7, 11.8, 0, Y0 + 25.3, -4, TRIM, { mat: 'castle' });
  for (const x of [-4.2, 0, 4.2]) {
    b.box(1.0, 3.6, 0.25, x, Y0 + 19.5, 1.55, WIN, { mat: 'glow' });
    b.cone(0.5, 0.8, x, Y0 + 23.1, 1.55, WIN, { mat: 'glow', seg: 6 });
  }
  tower(0, -4, Y0 + 26, 4.6, 13, 6.2, 15, { seg: 20, nw: 8, winY: [0.35, 0.72], flag: '#d23b3b', dn: 10 });
  // clustered turrets around the great spire
  const tur = [[4.6, 0.8, 7, 1.5], [-4.6, 0.8, 8, 1.5], [4.2, -8.6, 9, 1.4], [-4.2, -8.6, 6.5, 1.4]];
  for (const [x, z, h, r] of tur) tower(x, z - 0.5, Y0 + 26, r, h, r * 1.35, 5.5, { nw: 4, corbel: true, dn: 6 });

  // --- tall secondary towers ---
  tower(-9.5, 1.5, Y0 + 3, 2.9, 25, 3.7, 11, { nw: 6, winY: [0.45, 0.8], flag: '#2f5fc6' });
  tower(9.5, 1.5, Y0 + 3, 2.9, 23, 3.7, 10.5, { nw: 6, winY: [0.45, 0.8], flag: '#d23b3b' });
  tower(-8, -10, Y0 + 3, 2.4, 28, 3.1, 10, { nw: 5, winY: [0.5, 0.82] });
  tower(8, -10, Y0 + 3, 2.4, 26, 3.1, 9.5, { nw: 5, winY: [0.5, 0.82], roof: BLUE2 });
  // corner towers
  tower(-15, 12, Y0 - 1, 3.2, 15, 3.9, 9, { nw: 5, winY: [0.6] });
  tower(15, 12, Y0 - 1, 3.2, 15, 3.9, 9, { nw: 5, winY: [0.6] });
  tower(-15, -14, Y0 - 1, 3.0, 13, 3.6, 8, { nw: 5, winY: [0.6], roof: BLUE2 });
  tower(15, -14, Y0 - 1, 3.0, 13, 3.6, 8, { nw: 5, winY: [0.6], roof: BLUE2 });
  // gate towers
  tower(-4.8, 13.2, Y0 + 2, 2.2, 13, 2.8, 8, { nw: 4, winY: [0.5, 0.8] });
  tower(4.8, 13.2, Y0 + 2, 2.2, 13, 2.8, 8, { nw: 4, winY: [0.5, 0.8] });
  // small corbelled turrets on the walls
  for (const [x, z, y] of [[-11, 12.6, 11], [11, 12.6, 11], [-15.5, -1, 10], [15.5, -1, 10], [-12, -3, 18], [12, -3, 18]]) {
    tower(x, z, Y0 + y, 1.1, 4.5, 1.4, 4.2, { nw: 3, corbel: true, dn: 4 });
  }
  b.pop();

  // --- bridges over the moat ---
  const bridge = (z1, z2) => {
    const len = Math.abs(z2 - z1), zc = (z1 + z2) / 2;
    b.box(8, 1.0, len, cx, 0.7, zc, '#cdbfa8');
    for (const s of [-1, 1]) {
      b.box(0.7, 1.1, len, cx + s * 3.9, 1.7, zc, '#bfb09a');
      for (let i = 0; i <= 3; i++) {
        const z = z1 + (z2 - z1) * i / 3;
        b.cyl(0.38, 1.6, cx + s * 3.9, 1.7, z, '#bfb09a', { seg: 8 });
        props.lamp(cx + s * 3.9, z, 0, 3.3);
      }
    }
    for (const x of [-2.6, 2.6]) for (const t of [0.33, 0.66]) b.cyl(0.7, 1.4, cx + x, -0.6, z1 + (z2 - z1) * t, '#8e8170', { seg: 10 });
  };
  bridge(C.castle[1] + 13.2, C.moat.z + C.moat.rout + 1.5);
  bridge(C.castle[1] - 15, C.moat.z - C.moat.rout - 1.5);

  ctx.poi({ id: 'castle', name: '童话城堡', en: 'Fairy-tale Castle', land: '城堡', x: cx, y: 22, z: cz, dist: 95, pitch: 0.3, yaw: 0 });
}
