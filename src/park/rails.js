// Park railroad on the berm (steam train with station stops) and the monorail
// gliding on its beam above the snowbanks.
import * as THREE from 'three';
import { Builder } from '../core/builder.js';
import { MATS } from '../core/materials.js';
import { TRACK_R, TRACK_Y, MONO_R, MONO_Y, DEG, smoothstep } from '../core/config.js';
import { makeSign } from '../core/signs.js';

const WIN = '#ffd49a';

function locomotive(b) {
  // local: +z forward, origin at track center
  b.box(1.9, 0.5, 9.2, 0, 0.55, 0, '#1d1d1f');
  for (const s of [-1, 1]) for (const z of [-1.2, 0.6, 2.4]) {
    b.cyl(0.62, 0.2, s * 0.85, 0.65, z, '#b52a2a', { rz: Math.PI / 2, seg: 14 });
    b.cyl(0.18, 0.24, s * 0.86, 0.65, z, '#d8b25a', { rz: Math.PI / 2, seg: 8, mat: 'metal' });
  }
  b.rod(-0.95, 0.65, -1.2, -0.95, 0.65, 2.4, 0.06, '#9a9a9a', { mat: 'metal' });
  b.rod(0.95, 0.65, -1.2, 0.95, 0.65, 2.4, 0.06, '#9a9a9a', { mat: 'metal' });
  // boiler
  b.cyl(0.85, 5.0, 0, 1.75, -0.4, '#222428', { rx: Math.PI / 2, seg: 16, mat: 'gloss' });
  for (const z of [0.6, 2.0, 3.4]) b.cyl(0.88, 0.14, 0, 1.75, z, '#d8b25a', { rx: Math.PI / 2, seg: 16, mat: 'metal' });
  b.cyl(0.82, 0.3, 0, 1.75, 4.6, '#3a3a3e', { rx: Math.PI / 2, seg: 16 });
  b.box(0.5, 0.45, 0.3, 0, 2.2, 4.85, '#e8c46a', { mat: 'metal' });
  b.box(0.36, 0.3, 0.1, 0, 2.27, 5.0, '#fff2c0', { mat: 'glow' });
  // stack, dome, bell
  b.cyl(0.32, 0.9, 0, 2.5, 3.6, '#1d1d1f', { seg: 10 });
  b.cyl(0.62, 0.7, 0, 3.4, 3.6, '#1d1d1f', { seg: 12, rt: 0.68 });
  b.cyl(0.66, 0.15, 0, 4.1, 3.6, '#d8b25a', { seg: 12, mat: 'metal' });
  b.dome(0.45, 0, 2.55, 1.6, '#d8b25a', { mat: 'metal' });
  b.cone(0.28, 0.4, 0, 2.6, 2.4, '#d8b25a', { mat: 'metal' });
  // cowcatcher
  b.prism(1.8, 0.8, 1.0, 0, 0.1, 5.2, '#b52a2a', { rx: -Math.PI / 2 });
  // cab
  b.box(2.2, 2.4, 2.4, 0, 1.0, -3.4, '#b52a2a');
  b.box(2.5, 0.25, 2.8, 0, 3.4, -3.4, '#1d1d1f');
  for (const s of [-1, 1]) b.box(0.08, 0.8, 1.2, s * 1.11, 2.1, -3.2, WIN, { mat: 'glow' });
  b.box(2.24, 0.15, 2.44, 0, 2.95, -3.4, '#d8b25a', { mat: 'metal' });
  // tender
  b.box(2.1, 1.6, 3.2, 0, 0.7, -6.6, '#1d1d1f');
  b.box(2.14, 0.12, 3.24, 0, 2.2, -6.6, '#d8b25a', { mat: 'metal' });
  b.box(1.7, 0.4, 2.6, 0, 2.3, -6.6, '#141414');
  for (const s of [-1, 1]) for (const z of [-5.7, -7.5]) b.cyl(0.42, 0.18, s * 0.9, 0.45, z, '#b52a2a', { rz: Math.PI / 2, seg: 12 });
}
function coach(b, z, body, roof) {
  b.box(2.1, 0.4, 5.6, 0, 0.5, z, '#2a2a2a');
  b.box(2.2, 0.9, 5.4, 0, 0.9, z, body);
  for (const s of [-1, 1]) for (let k = -2.4; k <= 2.41; k += 1.2) b.cyl(0.05, 1.5, s * 1.02, 1.8, z + k, '#e0c78a', { seg: 4, mat: 'metal' });
  b.box(2.5, 0.2, 5.9, 0, 3.3, z, roof);
  b.box(1.6, 0.3, 5.4, 0, 3.5, z, roof);
  const cs = ['#d8483a', '#3a6ad8', '#f2c94c', '#3aa86a', '#e8e8e8', '#c45ab8'];
  for (let k = -2; k <= 2; k++) {
    b.box(1.9, 0.12, 0.45, 0, 1.75, z + k, '#7a4f2e');
    b.sph(0.2, -0.5, 2.4, z + k, '#f2c9a0', { w: 6, h: 5 });
    b.box(0.46, 0.55, 0.3, -0.5, 1.8, z + k, cs[(k + 5) % 6]);
    b.sph(0.2, 0.5, 2.4, z + k, '#d9a77c', { w: 6, h: 5 });
    b.box(0.46, 0.55, 0.3, 0.5, 1.8, z + k, cs[(k + 8) % 6]);
  }
  for (const s of [-1, 1]) for (const zz of [z - 1.9, z + 1.9]) b.cyl(0.38, 0.16, s * 0.9, 0.42, zz, '#1d1d1f', { rz: Math.PI / 2, seg: 10 });
}

function monorailTrain() {
  const b = new Builder();
  const n = 5, L = 7.4;
  for (let i = 0; i < n; i++) {
    const z = -i * (L + 0.3);
    b.box(2.6, 2.6, L, 0, 0.6, z, '#f4f6f8', { mat: 'gloss' });
    b.box(2.64, 0.35, L, 0, 0.85, z, '#d23a3a', { mat: 'gloss' });
    b.box(2.64, 0.8, L - 1.2, 0, 1.9, z, '#28333f', { mat: 'glow' });
    b.box(2.0, 0.3, L, 0, 3.2, z, '#e8ecf0', { mat: 'gloss' });
    for (const s of [-1, 1]) b.box(0.22, 1.9, L - 0.4, s * 1.05, -1.3, z, '#8b9097');
  }
  b.push(0, 0.6, L / 2);
  b.ell(0, 1.3, 0, 1.3, 1.3, 2.6, '#f4f6f8', { mat: 'gloss' });
  b.ell(0, 1.75, 0.6, 1.0, 0.55, 1.8, '#28333f', { mat: 'glow' });
  b.pop();
  b.push(0, 0.6, -(n - 1) * (L + 0.3) - L / 2);
  b.ell(0, 1.3, 0, 1.3, 1.3, 2.6, '#f4f6f8', { mat: 'gloss' });
  b.pop();
  return b.build({ name: 'monorail' });
}

export function buildRails(ctx) {
  const { b, props, world } = ctx;
  // --- rails & ties ---
  for (const r of [TRACK_R - 0.75, TRACK_R + 0.75]) b.torus(r, 0.09, 0, TRACK_Y + 0.28, 0, '#5a5550', { mat: 'metal', ts: 720, rs: 4 });
  const nTies = Math.round(2 * Math.PI * TRACK_R / 1.1);
  const ties = new THREE.InstancedMesh(new THREE.BoxGeometry(2.5, 0.16, 0.42), MATS.nosnow, nTies);
  const tieBuilder = new Builder(); tieBuilder.box(2.5, 0.16, 0.42, 0, 0, 0, '#5b4030');
  ties.geometry = tieBuilder.buildGeometry();
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
  for (let i = 0; i < nTies; i++) {
    const a = i / nTies * Math.PI * 2;
    e.set(0, -a, 0);
    m.compose(new THREE.Vector3(Math.cos(a) * TRACK_R, TRACK_Y + 0.08, Math.sin(a) * TRACK_R), q.setFromEuler(e), new THREE.Vector3(1, 1, 1));
    ties.setMatrixAt(i, m);
  }
  ties.receiveShadow = true;
  world.add(ties);

  // --- Frontierland & Toontown stations ---
  const stationAt = (angDeg, style) => {
    const a = angDeg * DEG;
    const x = Math.sin(a) * (TRACK_R + 6.5), z = -Math.cos(a) * (TRACK_R + 6.5);
    const ry = Math.atan2(-x, -z); // face the park center
    b.push(x, TRACK_Y, z, ry);
    if (style === 'frontier') {
      b.box(12, 4.2, 5, 0, 0, 0, '#8a5a36');
      b.prism(13, 2.6, 6, 0, 4.2, 0, '#5a3a24', { ry: Math.PI / 2 });
      b.box(13, 0.3, 4, 0, 3.6, 3.6, '#6a4a2a');
      for (const xx of [-6, -2, 2, 6]) b.cyl(0.13, 3.6, xx, 0, 5.4, '#6a4a2a', { seg: 5 });
      for (const xx of [-3.5, 3.5]) b.box(1.2, 1.5, 0.12, xx, 1.2, 2.52, WIN, { mat: 'glow' });
      // water tower
      b.cyl(1.6, 2.6, 8.5, 5, -1, '#7a5030', { seg: 12 });
      b.cone(1.9, 1.2, 8.5, 7.6, -1, '#5a3a24', { seg: 12 });
      for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) b.cyl(0.12, 5, 8.5 + dx, 0, -1 + dz, '#5a3a24', { seg: 5 });
    } else {
      b.box(10, 4.5, 5, 0, 0, 0, '#f4d35e');
      b.dome(3.4, 0, 4.5, 0, '#e8574a', { sy: 0.8, mat: 'gloss' });
      b.box(11, 0.4, 4.2, 0, 3.8, 3.6, '#5aa0e8');
      for (const xx of [-4.5, 0, 4.5]) b.cyl(0.18, 3.8, xx, 0, 5.4, '#e8574a', { seg: 8 });
      b.cyl(0.8, 0.2, 0, 6.6, 2.0, '#ffffff', { rx: Math.PI / 2, seg: 18, mat: 'glow' });
    }
    b.pop();
  };
  stationAt(270, 'frontier');
  stationAt(32, 'toon');

  // --- the steam train ---
  const trainB = new Builder();
  locomotive(trainB);
  coach(trainB, -11.2, '#c8a23a', '#a8303a');
  coach(trainB, -17.2, '#2f6a44', '#c8a23a');
  coach(trainB, -23.2, '#a8303a', '#2f5a8a');
  coach(trainB, -29.2, '#2f5a8a', '#c8a23a');
  const train = trainB.build({ name: 'train' });
  const pivot = new THREE.Object3D();
  pivot.add(train);
  world.add(pivot);
  // the train runs clockwise when seen from above (east → south → west → north)
  train.position.set(0, TRACK_Y + 0.25, -TRACK_R);
  train.rotation.y = Math.PI / 2;
  const stops = [180, 270, 32]; // stations (deg from north, clockwise)
  let ang = 140, speed = 0, dwell = 0, lastStop = -1;
  const vmax = 7.5; // m/s
  const smoke = ctx.smoke;
  const tmp = new THREE.Vector3();
  let puff = 0;
  ctx.anims.push((dt) => {
    // find distance to the next stop
    let next = null, best = 1e9;
    for (const s of stops) {
      let d = (s - ang + 360) % 360;
      if (d < 0.01 && lastStop === s) d = 360;
      if (d < best) { best = d; next = s; }
    }
    const distM = best * DEG * TRACK_R;
    if (dwell > 0) { dwell -= dt; speed = 0; if (dwell <= 0) lastStop = next; }
    else {
      const target = Math.min(vmax, Math.sqrt(Math.max(0, 2 * 0.9 * distM)) + 0.3);
      speed += Math.sign(target - speed) * Math.min(Math.abs(target - speed), dt * 1.4);
      if (distM < 0.25 && lastStop !== next) { dwell = 7; speed = 0; ang = next; }
    }
    ang = (ang + speed * dt / TRACK_R / DEG) % 360;
    // pivot rotation: angle from north clockwise → rotation about y is negative
    pivot.rotation.y = -ang * DEG;
    puff -= dt * (0.6 + speed * 0.5);
    if (smoke && puff <= 0) {
      puff = 1;
      train.localToWorld(tmp.set(0, 4.3, 3.6));
      smoke.emit(tmp.x, tmp.y, tmp.z, 1.2 + speed * 0.1, 0.92);
    }
  });

  // --- monorail beam & pylons ---
  const beam = new Builder();
  beam.lathe([[MONO_R - 0.9, MONO_Y - 1.3], [MONO_R + 0.9, MONO_Y - 1.3], [MONO_R + 0.9, MONO_Y], [MONO_R - 0.9, MONO_Y], [MONO_R - 0.9, MONO_Y - 1.3]], 0, 0, 0, '#d9d4cc', { seg: 240 });
  const nP = 44;
  for (let i = 0; i < nP; i++) {
    const a = (i + 0.5) / nP * Math.PI * 2;
    const x = Math.sin(a) * MONO_R, z = -Math.cos(a) * MONO_R;
    const gy = ctx.H(x, z);
    beam.cyl(0.65, MONO_Y - 1.3 - gy + 0.5, x, gy - 0.5, z, '#cfc9bf', { seg: 8, rt: 0.5 });
    beam.box(2.6, 0.6, 1.4, x, MONO_Y - 1.9, z, '#cfc9bf', { ry: -a });
  }
  world.add(beam.build({ name: 'monoBeam' }));
  // monorail station near Tomorrowland
  {
    const a = 118 * DEG;
    const x = Math.sin(a) * (MONO_R - 4.2), z = -Math.cos(a) * (MONO_R - 4.2);
    b.push(x, MONO_Y - 1.6, z, -a);
    b.box(36, 0.6, 5, 0, 0, 0, '#e8e4dc');
    b.box(36, 0.3, 7, 0, 5.2, 1.5, '#ffffff');
    for (const xx of [-16, -8, 0, 8, 16]) b.cyl(0.25, 5.2, xx, 0.6, -1.8, '#ffffff', { seg: 8 });
    for (let xx = -17; xx <= 17; xx += 0.8) {
      const p = b.toWorld(xx, 5.2, 4.9);
      props.bulb(p.x, p.y, p.z, '#bfe0ff', 0.1);
    }
    b.pop();
  }
  const mono = monorailTrain();
  const mpivot = new THREE.Object3D();
  mpivot.add(mono);
  world.add(mpivot);
  mono.position.set(MONO_R, MONO_Y + 0.05, 0);
  mono.rotation.y = Math.PI; // moving counter-clockwise
  let mang = 0;
  const mspeed = 12;
  ctx.anims.push((dt) => {
    mang = (mang + dt * mspeed / MONO_R / DEG) % 360;
    mpivot.rotation.y = mang * DEG;
  });

  ctx.poi({ id: 'railroad', name: '乐园环线蒸汽火车', en: 'Park Railroad', land: '乐园环线', x: 0, y: 6, z: 126, dist: 40, pitch: 0.25, follow: train, followOffset: [0, 3, 0] });
  ctx.poi({ id: 'monorail', name: '单轨列车', en: 'Monorail', land: '乐园环线', x: 0, y: 18, z: 138, dist: 46, pitch: 0.2, follow: mono, followOffset: [0, 2, -12] });
}
