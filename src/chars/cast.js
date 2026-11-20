// Where every character stands (or flies), plus their idle animations.
import * as THREE from 'three';
import { makeCharacter, ROSTER } from './figures.js';
import { A, C } from '../park/layout.js';
import { faceTo } from '../core/config.js';
import { Builder } from '../core/builder.js';

// [id, x, z, faceX, faceZ, options]
const SPOTS = [
  // Main Street & Town Square
  ['santaMickey', -3.2, 90.6, 0, 60, { land: '美国小镇大街' }],
  ['minnie', 0, 90.2, 0, 60, { land: '美国小镇大街' }],
  ['pluto', 3.2, 90.6, 0, 60, { land: '美国小镇大街' }],
  ['goofy', -6.1, 72, 0, 72, { land: '美国小镇大街' }],
  ['donald', 6.1, 61.5, 0, 61.5, { land: '美国小镇大街' }],
  ['daisy', 6.1, 64, 0, 64, { land: '美国小镇大街' }],
  ['chip', -6.0, 52, 0, 52, { land: '美国小镇大街' }],
  ['dale', -6.0, 53.6, 0, 53.6, { land: '美国小镇大街' }],
  ['mickey', 0, 31, 0, 80, { land: '美国小镇大街', y: 2.75, scale: 1.25, mono: '#a07a42', statue: '米奇铜像', noArmAnim: true }],
  // castle forecourt
  ['cinderella', -5.5, 19.2, 0, 40, { land: '城堡' }],
  ['aurora', -2.8, 19.6, 0, 40, { land: '城堡' }],
  ['belle', 2.8, 19.6, 0, 40, { land: '城堡' }],
  ['mulan', 5.5, 19.2, 0, 40, { land: '城堡' }],
  ['ariel', -24, -10, 0, 20, { land: '城堡', y: 1.25, rock: true }],
  // Adventureland
  ['aladdin', -42.5, 79, -30, 70, { land: '探险世界' }],
  ['jasmine', -44.5, 80, -30, 70, { land: '探险世界' }],
  ['genie', A.aladdin[0], A.aladdin[1], -20, 80, { land: '探险世界', y: 7.6, scale: 1.3, hover: true }],
  ['moana', -36, 65.5, -45, 60, { land: '探险世界' }],
  ['jack', -55, 27.4, -45, 40, { land: '探险世界' }],
  ['simba', -57.6, 63.3, -40, 63, { land: '探险世界', y: 6.85 }],
  ['tiana', -79, 37.5, -70, 50, { land: '边域世界' }],
  // Fantasyland
  ['snowwhite', 3, -83.5, 6, -70, { land: '梦幻世界' }],
  ['dwarfDoc', -2.5, -84.2, 3, -70, { land: '梦幻世界' }],
  ['dwarfGrumpy', -4.3, -85, 3, -70, { land: '梦幻世界' }],
  ['dwarfHappy', -0.7, -83.2, 3, -70, { land: '梦幻世界' }],
  ['dwarfSleepy', 5.2, -83.0, 3, -70, { land: '梦幻世界' }],
  ['dwarfBashful', 7.0, -83.8, 3, -70, { land: '梦幻世界' }],
  ['dwarfSneezy', 8.8, -84.8, 3, -70, { land: '梦幻世界' }],
  ['dwarfDopey', 1.0, -82.2, 3, -70, { land: '梦幻世界' }],
  ['peterpan', -13.5, -42.5, -10, -30, { land: '梦幻世界' }],
  ['hook', -17.0, -41.5, -10, -30, { land: '梦幻世界' }],
  ['alice', -21.2, -69.6, -14, -60, { land: '梦幻世界' }],
  ['madhatter', -19.3, -71.0, -14, -60, { land: '梦幻世界' }],
  ['cheshire', -33.5, -71.8, -14, -60, { land: '梦幻世界', y: 3.4, hover: true }],
  ['pooh', -6, -66.6, -6, -55, { land: '梦幻世界' }],
  ['tigger', -3.2, -67.2, -4, -55, { land: '梦幻世界' }],
  ['piglet', -8.0, -66.9, -6, -55, { land: '梦幻世界' }],
  ['eeyore', -11, -67.6, -8, -55, { land: '梦幻世界' }],
  ['rapunzel', 6.2, -65.2, 4, -55, { land: '梦幻世界' }],
  ['merida', 17, -64.2, 16, -55, { land: '梦幻世界' }],
  ['elsa', -56, -63.6, -50, -50, { land: '梦幻世界' }],
  ['anna', -59.2, -63.4, -50, -50, { land: '梦幻世界' }],
  ['olaf', -53.2, -63.0, -50, -50, { land: '梦幻世界' }],
  ['sven', -62.8, -62.6, -50, -50, { land: '梦幻世界' }],
  // Toontown
  ['mickey', 55.4, -74.2, 50, -72, { land: '米奇卡通城', tag: 'mickeyHome' }],
  ['stellalou', 44.15, -60.08, 46.31, -54.16, { land: '米奇卡通城' }],
  ['linabell', 39.34, -60.29, 36.68, -54.58, { land: '米奇卡通城' }],
  ['duffy', 37.55, -61.55, 33.09, -57.09, { land: '米奇卡通城' }],
  ['shelliemay', 36.29, -63.34, 30.58, -60.68, { land: '米奇卡通城' }],
  ['gelatoni', 35.72, -65.45, 29.45, -64.90, { land: '米奇卡通城' }],
  ['cookieann', 35.91, -67.63, 29.83, -69.26, { land: '米奇卡通城' }],
  ['olumel', 36.84, -69.61, 31.68, -73.23, { land: '米奇卡通城' }],
  // Toy Story Land
  ['woody', A.woody[0], A.woody[1], 32, -18, { land: '玩具总动员乐园', y: 0.8, scale: 4.2, giant: '巨型胡迪' }],
  ['rex', 76, -14, 62, -4, { land: '玩具总动员乐园', y: 0.6, scale: 3.0, giant: '巨型抱抱龙' }],
  ['woody', 50.0, -12.2, 50, 0, { land: '玩具总动员乐园', tag: 'woodySmall' }],
  ['jessie', 52.4, -12.4, 52, 0, { land: '玩具总动员乐园' }],
  ['bullseye', 55.6, -12.8, 54, 0, { land: '玩具总动员乐园' }],
  ['buzz', 47.6, -12.0, 48, 0, { land: '玩具总动员乐园' }],
  ['alien', 58.2, -0.6, 60, -8, { land: '玩具总动员乐园' }],
  ['alien', 59.8, -0.9, 60, -8, { land: '玩具总动员乐园', tag: 'alien2' }],
  ['alien', 61.4, -0.6, 60, -8, { land: '玩具总动员乐园', tag: 'alien3' }],
  // Tomorrowland
  ['stitch', 24.5, 33.6, 12, 31, { land: '明日世界' }],
  ['baymax', 27.4, 35.4, 12, 31, { land: '明日世界' }],
  ['mike', 45.4, 35.8, 40, 28, { land: '明日世界' }],
  ['sulley', 48.2, 36.8, 40, 28, { land: '明日世界' }],
  ['walle', 36.6, 57.6, 41, 54, { land: '明日世界' }],
  ['eve', 38.4, 58.6, 41, 54, { land: '明日世界', hover: true }],
  ['judy', 60.4, 28.4, 60, 34, { land: '明日世界' }],
  ['nick', 62.6, 28.6, 60, 34, { land: '明日世界' }],
  ['vader', 82.2, 20.8, 78, 28, { land: '明日世界' }],
  ['trooper', 80.0, 22.4, 78, 28, { land: '明日世界' }],
  ['trooper', 84.6, 22.0, 78, 28, { land: '明日世界', tag: 'trooper2' }],
  ['r2d2', 77.6, 21.4, 76, 28, { land: '明日世界' }],
  ['bb8', 86.6, 20.4, 80, 28, { land: '明日世界' }],
  ['spiderman', 22, 28.5, 10, 31, { land: '明日世界', y: 7.0 }],
  ['pocahontas', -33.2, -21.2, -25, -14, { land: '边域世界' }],
  ['marie', -6.0, 80, 0, 80, { land: '美国小镇大街', scale: 0.75 }],
  ['lotso', 58.6, -12.9, 58, 0, { land: '玩具总动员乐园' }],
  ['pinocchio', 8.5, -45.5, 2, -40, { land: '梦幻世界' }],
  ['buzz', 0, 0, 0, 0, { land: '明日世界', tag: 'buzzStatue', buzzRoof: true, scale: 2.2, statue: '巴斯光年巨像' }],
];

export function buildCast(world, ctx) {
  const chars = [];
  const seen = new Set();
  const rockB = new Builder();
  for (const [id, x0, z0, fx, fz, o] of SPOTS) {
    let x = x0, z = z0, y = o.y || 0, ry = faceTo(x0, z0, fx, fz);
    if (o.buzzRoof && ctx.buzzTop) { x = ctx.buzzTop.x; z = ctx.buzzTop.z; y = ctx.buzzTop.y; ry = (ctx.buzzRy || 0); }
    const g = makeCharacter(id, { scale: o.scale || 1, mono: o.mono });
    g.position.set(x, y, z);
    g.rotation.y = ry;
    world.add(g);
    if (o.rock) { rockB.ico(1.6, x, 0, z, '#8a8278', { d: 1, sy: 0.8 }); }
    const ud = g.userData;
    const item = { g, id, ry, y, ph: Math.random() * 10, waveAt: Math.random() * 8, o, ud };
    chars.push(item);
    const key = o.tag || id;
    if (!seen.has(key)) {
      seen.add(key);
      const label = o.giant || o.statue || ROSTER[id][0];
      const h = ud.height;
      ctx.poi({
        id: 'ch-' + key, name: label, en: ROSTER[id][1], land: o.land, kind: 'character',
        x, y: y + h * 0.55, z, dist: Math.max(5.5, h * 2.6), pitch: 0.18, yaw: ry, labelY: y + h + 0.4, char: g,
      });
    }
  }
  if (!rockB.isEmpty()) world.add(rockB.build({ name: 'rocks' }));

  // Tinker Bell circles the castle; Iron Man patrols Space Mountain; the Up house drifts
  const tink = makeCharacter('tinker', { scale: 0.6 });
  world.add(tink);
  const iron = makeCharacter('ironman', {});
  world.add(iron);
  ctx.poi({ id: 'ch-tinker', name: '小叮当', en: 'Tinker Bell', land: '城堡', kind: 'character', x: 0, y: 40, z: -10, dist: 12, pitch: 0.1, follow: tink, followOffset: [0, 0.6, 0] });
  ctx.poi({ id: 'ch-ironman', name: '钢铁侠', en: 'Iron Man', land: '明日世界', kind: 'character', x: A.spaceMountain[0], y: 36, z: A.spaceMountain[1], dist: 14, pitch: 0.1, follow: iron, followOffset: [0, 1, 0] });
  const up = upHouse();
  world.add(up);
  ctx.poi({ id: 'uphouse', name: '飞屋环游记', en: 'Up House', land: '天空', x: 0, y: 100, z: 0, dist: 40, pitch: 0.1, follow: up, followOffset: [0, 8, 0] });

  const tmp = new THREE.Vector3();
  const sm = A.spaceMountain;
  let sparkle = 0;
  ctx.anims.push((dt, t) => {
    for (const c of chars) {
      const { g, ud, o } = c;
      g.scale.y = (o.scale || 1) * (1 + Math.sin(t * 2.1 + c.ph) * 0.012);
      if (!o.statue && !o.giant) g.rotation.y = c.ry + Math.sin(t * 0.45 + c.ph) * 0.22;
      if (o.hover || ud.hover) g.position.y = c.y + Math.sin(t * 1.4 + c.ph) * 0.18;
      if (ud.bounce) g.position.y = c.y + Math.abs(Math.sin(t * 3.2 + c.ph)) * 0.55;
      if (ud.arm && !o.noArmAnim) {
        const cyc = (t + c.waveAt) % 7.5;
        let target = 0.18;
        if (cyc < 2.6) target = 2.55 + Math.sin(t * 9 + c.ph) * 0.32;
        c.armZ = (c.armZ ?? 0.18) + (target - (c.armZ ?? 0.18)) * Math.min(1, dt * 7);
        ud.arm.rotation.z = c.armZ;
      } else if (ud.arm && o.noArmAnim) ud.arm.rotation.z = 2.3; // statue waves forever
    }
    // Tinker Bell
    const a = t * 0.42;
    tink.position.set(Math.cos(a) * 26, 36 + Math.sin(t * 0.9) * 6, -10 + Math.sin(a) * 22);
    tink.rotation.set(0, -a, 0.25);
    sparkle -= dt;
    if (sparkle < 0) { sparkle = 0.04; tink.localToWorld(tmp.set(0, 0.6, -0.4)); ctx.smoke.emit(tmp.x, tmp.y, tmp.z, 0.5, 1.0, -0.4, 1.4, 0.2); }
    // Iron Man
    const b2 = -t * 0.3;
    iron.position.set(sm[0] + Math.cos(b2) * 26, 34 + Math.sin(t * 0.7) * 4, sm[1] + Math.sin(b2) * 26);
    iron.rotation.set(0.9, -b2 + Math.PI, 0);
    // Up house
    const c2 = t * 0.025;
    up.position.set(Math.cos(c2) * 70, 92 + Math.sin(t * 0.3) * 4, Math.sin(c2) * 55);
    up.rotation.y = -c2;
  });
  return chars;
}

function upHouse() {
  const b = new Builder();
  b.box(4, 3.2, 3.6, 0, 0, 0, '#9ad0c8');
  b.box(4.2, 0.3, 3.8, 0, 3.2, 0, '#f6efe0');
  b.prism(4.6, 2.4, 4.2, 0, 3.4, 0, '#7a6a9a', { ry: Math.PI / 2 });
  b.box(1.2, 2.0, 1.2, 1.2, 3.4, 0.8, '#e8a86a');
  b.pyr(1.6, 1.0, 1.6, 1.2, 5.4, 0.8, '#7a6a9a');
  b.box(1.0, 1.0, 0.1, -1, 1.2, 1.82, '#ffd49a', { mat: 'glow' });
  b.box(1.0, 1.0, 0.1, 1, 1.2, 1.82, '#ffd49a', { mat: 'glow' });
  b.box(4.4, 0.25, 1.2, 0, 0, 2.3, '#c8a06a');
  b.cyl(0.25, 1.2, -1.2, 4.2, -0.8, '#a84a3a', { seg: 8 });
  // balloon bouquet
  const cols = ['#e8423a', '#f6d55c', '#2f6fd8', '#3aa86a', '#f08ac0', '#9a5ad8', '#f08a2a', '#7ad0ff'];
  for (let i = 0; i < 160; i++) {
    const u = Math.random(), v = Math.random();
    const th = u * Math.PI * 2, ph = Math.acos(1 - v * 1.4);
    const r = 5 + Math.random() * 0.8;
    b.sph(0.55, Math.cos(th) * Math.sin(ph) * r, 12 + Math.cos(ph) * r * 0.85, Math.sin(th) * Math.sin(ph) * r, cols[i % 8], { mat: 'gloss', w: 7, h: 5 });
  }
  for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2; b.rod(-1.2, 5.4, -0.8, Math.cos(a) * 2.5, 8, Math.sin(a) * 2.5, 0.02, '#e8e8e8'); }
  return b.build({ name: 'upHouse' });
}
