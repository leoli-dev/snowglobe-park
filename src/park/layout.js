// Park master plan. Coordinates in meters; north = -z, east = +x.
// The entrance faces the default camera (south, +z).
import { P } from '../core/config.js';

export const C = {
  castle: [0, -10],
  moat: { x: 0, z: -10, rin: 21, rout: 27 },
  hub: { x: 0, z: 31, r: 13 },
  ring: { x: 0, z: -10, r: 33, w: 6 }, // promenade around the castle
  station: [0, 126],
};

// ---------------- attraction anchors ----------------
export const A = {
  // Main Street & entrance
  christmasTree: [0, 101],
  floralMickey: [0, 139],
  // Adventureland
  treehouse: [-28, 49],
  tiki: [-30, 72],
  aladdin: [-33, 86],
  indy: [-54, 86],
  jungle: [-60, 63],
  pirates: [-62, 18],
  pirateLagoon: { x: -62, z: 31, rx: 9, rz: 4.5 },
  // Frontierland
  river: { x: -58, z: -17, rx: 22, rz: 15, ix: 12, iz: 7 },
  bigThunder: P(280, 98),
  splash: P(255, 100),
  splashPool: [-84, 28],
  frontierRow: [-45, 14],
  // Liberty Square
  mansion: P(305, 80),
  libertyTree: [-36, -40],
  // Fantasyland
  carousel: [0, -55],
  peterPan: P(335, 52),
  teacups: P(25, 52),
  pooh: P(352, 74),
  rapunzel: P(8, 70),
  dumbo: P(20, 78),
  dwarfs: P(8, 98),
  smallWorld: P(342, 94),
  icePalace: P(323, 96),
  alice: [-28, -76.5],
  matterhorn: P(58, 54),
  // Toontown
  mickeyHouse: P(38, 98),
  minnieHouse: P(46, 102),
  goofyHouse: P(30, 92),
  chipTree: P(26, 104),
  donaldPond: P(46, 82),
  gadget: P(57, 96),
  duffy: [42, -66],
  // Toy Story Land
  woody: [44, -1],
  saucers: [63, 7],
  slinky: P(70, 86),
  rcRacer: P(68, 104),
  // Tomorrowland & Pixar
  astro: [37, 15],
  peopleMover: { x: 40, z: 15, rx: 14, rz: 9, y: 6.5 },
  buzz: [34, 40],
  moonliner: [24, 51],
  spaceMountain: P(135, 82),
  speedway: P(155, 90),
  tron: P(112, 95),
  wheel: P(92, 106),
};

// ---------------- path network (ground texture + guest routes) ----------------
// [points, width, kind]
const ringPts = [];
for (let a = 212; a <= 508; a += 8) ringPts.push(P(a % 360, C.ring.r).map((v, i) => v + (i ? C.ring.z : C.ring.x)));

export const PATHS = [
  { id: 'main', pts: [[0, 113], [0, 44]], w: 10, kind: 'brick' },
  { id: 'castleBridge', pts: [[0, 20], [0, 2]], w: 8, kind: 'stone' },
  { id: 'castleNorth', pts: [[0, -24], [0, -44]], w: 8, kind: 'stone' },
  { id: 'ring', pts: ringPts, w: C.ring.w, kind: 'stone' },
  // Adventureland
  { id: 'adv1', pts: [[-12, 31], [-26, 34], [-38, 38], [-52, 40], [-66, 42], [-80, 41]], w: 6, kind: 'sand' },
  { id: 'adv2', pts: [[-38, 38], [-40, 52], [-39, 66], [-41, 78], [-45, 88], [-42, 96]], w: 5, kind: 'sand' },
  // Frontierland
  { id: 'fr1', pts: [[-34, -3], [-42, 3], [-56, 6], [-70, 7], [-82, 9]], w: 6, kind: 'dirt' },
  { id: 'fr2', pts: [[-82, 9], [-86, 22], [-80, 41]], w: 5, kind: 'dirt' },
  // Liberty Square
  { id: 'lib1', pts: [[-28, -27], [-38, -36], [-50, -40], [-58, -38]], w: 6, kind: 'brick2' },
  // Fantasyland
  { id: 'fan0', pts: [[0, -44], [0, -64]], w: 8, kind: 'fanta' },
  { id: 'fan1', pts: [[0, -64], [-12, -62], [-24, -64], [-36, -70], [-46, -70], [-54, -64]], w: 6, kind: 'fanta' },
  { id: 'fan2', pts: [[0, -64], [12, -62], [24, -60], [36, -56], [46, -56]], w: 6, kind: 'fanta' },
  { id: 'fan3', pts: [[0, -64], [2, -80], [6, -86]], w: 5, kind: 'fanta' },
  { id: 'fan4', pts: [[-12, -40], [-24, -36]], w: 5, kind: 'fanta' },
  { id: 'fan5', pts: [[12, -40], [24, -36]], w: 5, kind: 'fanta' },
  // Toontown
  { id: 'toon1', pts: [[46, -56], [52, -64], [53, -72], [53, -84], [50, -90]], w: 6, kind: 'toon' },
  { id: 'toon2', pts: [[53, -72], [64, -68], [70, -64]], w: 5, kind: 'toon' },
  // Toy Story
  { id: 'toy1', pts: [[31.9, -18.5], [42, -9], [56, -6], [70, -6], [84, -2], [96, 4]], w: 6, kind: 'toy' },
  { id: 'toy2', pts: [[56, -6], [62, -18], [66, -32], [72, -42], [88, -44]], w: 5, kind: 'toy' },
  // Tomorrowland
  { id: 'tom1', pts: [[12, 31], [24, 28], [36, 26], [48, 28], [60, 32], [72, 30], [86, 24], [98, 14]], w: 7, kind: 'future' },
  { id: 'tom2', pts: [[36, 26], [40, 40], [41, 54], [37, 66], [30, 76], [24, 88]], w: 6, kind: 'future' },
];

// plazas: circles and rectangles
export const PLAZAS = [
  { kind: 'circle', x: C.hub.x, z: C.hub.z, r: C.hub.r, mat: 'hub' },
  { kind: 'rect', x0: -26, x1: 26, z0: 90, z1: 113, mat: 'brick' },
  { kind: 'circle', x: 0, z: -56, r: 14, mat: 'fanta' }, // carousel court
  { kind: 'circle', x: A.astro[0], z: A.astro[1], r: 11, mat: 'future' },
  { kind: 'circle', x: A.teacups[0], z: A.teacups[1], r: 10, mat: 'fanta' },
  { kind: 'circle', x: A.dumbo[0], z: A.dumbo[1], r: 10, mat: 'fanta' },
  { kind: 'circle', x: A.saucers[0], z: A.saucers[1], r: 9, mat: 'toy' },
  { kind: 'circle', x: A.duffy[0], z: A.duffy[1], r: 7, mat: 'toon' },
  { kind: 'circle', x: A.woody[0], z: A.woody[1], r: 8, mat: 'toy' },
  { kind: 'circle', x: A.aladdin[0], z: A.aladdin[1], r: 8, mat: 'sand' },
  { kind: 'rect', x0: -17, x1: 17, z0: 131, z1: 146, mat: 'stone' }, // entrance plaza (on the berm)
];

// water bodies
export const WATER = {
  moat: C.moat,
  river: A.river,
  jungle: [[-44, 52], [-50, 47], [-62, 47], [-72, 52], [-77, 63], [-73, 74], [-62, 79], [-50, 77], [-44, 69]],
  jungleW: 7,
  ponds: [
    { x: A.splashPool[0], z: A.splashPool[1], rx: 6.5, rz: 4.5 },
    { x: -62, z: 31, rx: 9, rz: 4.5 },
    { x: A.donaldPond[0], z: A.donaldPond[1], rx: 7, rz: 4.5 },
  ],
};

// land tints drawn under everything (soft blobs)
export const LANDS = [
  { id: 'main', name: '美国小镇大街', x: 0, z: 78, r: 34, color: '#7f9c6b' },
  { id: 'adv', name: '探险世界', x: -52, z: 62, r: 44, color: '#4f8a4a' },
  { id: 'fron', name: '边域世界', x: -74, z: 0, r: 40, color: '#8e8a55' },
  { id: 'lib', name: '自由广场', x: -48, z: -42, r: 26, color: '#6f8f5c' },
  { id: 'fan', name: '梦幻世界', x: 0, z: -72, r: 44, color: '#6fa067' },
  { id: 'toon', name: '米奇卡通城', x: 62, z: -72, r: 30, color: '#86b062' },
  { id: 'toy', name: '玩具总动员乐园', x: 76, z: -24, r: 32, color: '#79a85a' },
  { id: 'tom', name: '明日世界', x: 60, z: 40, r: 44, color: '#6d8f78' },
];
