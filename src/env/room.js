// The room around the globe: a cozy, dim studio with bokeh fairy lights,
// a walnut table, and the turned-wood music-box base with brass trim.
import * as THREE from 'three';
import { GLOBE, BASE_BOTTOM, DEG } from '../core/config.js';
import { rand, rr } from '../core/rng.js';

// ---------- environment texture used for glass/metal reflections ----------
export function makeEnvTexture() {
  const w = 1024, h = 512;
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d');
  const grd = g.createLinearGradient(0, 0, 0, h);
  grd.addColorStop(0, '#2b211c');
  grd.addColorStop(0.45, '#3a2a21');
  grd.addColorStop(0.55, '#1d1411');
  grd.addColorStop(1, '#0d0908');
  g.fillStyle = grd; g.fillRect(0, 0, w, h);
  g.filter = 'blur(10px)';
  // big warm window / softbox
  g.fillStyle = '#fff1dc'; g.fillRect(w * 0.12, h * 0.12, w * 0.16, h * 0.26);
  g.fillStyle = '#ffe9c8'; g.fillRect(w * 0.58, h * 0.16, w * 0.05, h * 0.5);
  // cool strip from the back
  g.fillStyle = '#cfe0ff'; g.fillRect(w * 0.84, h * 0.2, w * 0.03, h * 0.42);
  // fireplace glow
  g.filter = 'blur(28px)';
  g.fillStyle = '#ff8a3a'; g.fillRect(w * 0.38, h * 0.62, w * 0.14, h * 0.12);
  g.filter = 'blur(3px)';
  // a tree of fairy lights somewhere in the room
  const cols = ['#ffd27a', '#ff6b5a', '#8fe39a', '#a9c8ff', '#ffffff'];
  for (let i = 0; i < 90; i++) {
    const x = w * (0.3 + rand() * 0.25), y = h * (0.3 + rand() * 0.3);
    g.fillStyle = cols[i % cols.length];
    g.beginPath(); g.arc(x, y, 2 + rand() * 3, 0, Math.PI * 2); g.fill();
  }
  g.filter = 'none';
  const t = new THREE.CanvasTexture(c);
  t.mapping = THREE.EquirectangularReflectionMapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function woodTexture() {
  const w = 1024, h = 1024;
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d');
  g.fillStyle = '#4a2215'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 260; i++) {
    const x = rand() * w;
    const wid = 1 + rand() * 5;
    g.strokeStyle = rand() < 0.5 ? 'rgba(30,10,4,0.35)' : 'rgba(120,58,30,0.28)';
    g.lineWidth = wid;
    g.beginPath();
    let xx = x;
    g.moveTo(xx, 0);
    for (let y = 0; y <= h; y += 32) { xx += (rand() - 0.5) * 6; g.lineTo(xx, y); }
    g.stroke();
  }
  // a few knots
  for (let i = 0; i < 6; i++) {
    const x = rand() * w, y = rand() * h;
    for (let r = 3; r < 30; r += 4) {
      g.strokeStyle = 'rgba(25,8,3,0.25)'; g.lineWidth = 1.5;
      g.beginPath(); g.ellipse(x, y, r * 0.5, r * 1.6, 0, 0, Math.PI * 2); g.stroke();
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  return t;
}

function tableTexture() {
  const s = 2048;
  const c = document.createElement('canvas'); c.width = c.height = s;
  const g = c.getContext('2d');
  g.fillStyle = '#2e1a12'; g.fillRect(0, 0, s, s);
  // planks
  const plank = s / 9;
  for (let p = 0; p < 9; p++) {
    const tone = 30 + rand() * 18;
    g.fillStyle = `rgb(${tone + 22},${tone * 0.55},${tone * 0.33})`;
    g.fillRect(0, p * plank, s, plank - 3);
    for (let i = 0; i < 60; i++) {
      g.strokeStyle = rand() < 0.5 ? 'rgba(15,6,2,0.3)' : 'rgba(110,60,32,0.18)';
      g.lineWidth = 1 + rand() * 3;
      const y0 = p * plank + rand() * plank;
      g.beginPath(); g.moveTo(0, y0);
      for (let x = 0; x <= s; x += 64) g.lineTo(x, y0 + Math.sin(x * 0.004 + i) * 6 + (rand() - 0.5) * 3);
      g.stroke();
    }
  }
  // vignette toward the edge so the table melts into darkness
  const vg = g.createRadialGradient(s / 2, s / 2, s * 0.12, s / 2, s / 2, s * 0.5);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(0.7, 'rgba(0,0,0,0.55)');
  vg.addColorStop(1, 'rgba(0,0,0,1)');
  g.fillStyle = vg; g.fillRect(0, 0, s, s);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

function plaqueTexture() {
  const w = 2048, h = 420;
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d');
  const grd = g.createLinearGradient(0, 0, 0, h);
  grd.addColorStop(0, '#f3d58e'); grd.addColorStop(0.5, '#c99a45'); grd.addColorStop(1, '#a8772e');
  g.fillStyle = grd; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#6b4512'; g.lineWidth = 10;
  g.strokeRect(26, 26, w - 52, h - 52);
  g.lineWidth = 3; g.strokeRect(48, 48, w - 96, h - 96);
  g.fillStyle = '#5a3a10';
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = '600 150px "Songti SC", "STSong", "Noto Serif SC", serif';
  g.fillText('雪 境 乐 园', w / 2, h * 0.43);
  g.font = 'italic 54px Georgia, "Times New Roman", serif';
  g.fillText('Snow Globe Kingdom  ·  Merry Christmas 2026', w / 2, h * 0.76);
  // little stars
  for (const x of [w * 0.16, w * 0.84]) {
    g.save(); g.translate(x, h * 0.43);
    g.beginPath();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 ? 22 : 54; const a = i * Math.PI / 5 - Math.PI / 2;
      g.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    g.closePath(); g.fill(); g.restore();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

const BACKDROP_VS = /* glsl */`
varying vec3 vDir;
void main() {
  vDir = position;
  vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  gl_Position = p.xyww;
}`;
const BACKDROP_FS = /* glsl */`
varying vec3 vDir;
uniform float uTime;
uniform vec3 uTop, uMid, uBot, uGlow;
uniform float uBokeh;
float hash(vec2 p){ p = fract(p*vec2(233.34, 851.73)); p += dot(p, p+23.45); return fract(p.x*p.y); }
vec3 pal(float h){
  if (h < 0.42) return vec3(1.0, 0.72, 0.36);
  if (h < 0.6) return vec3(1.0, 0.36, 0.3);
  if (h < 0.75) return vec3(0.45, 0.95, 0.55);
  if (h < 0.9) return vec3(0.55, 0.72, 1.0);
  return vec3(1.0, 0.95, 0.85);
}
vec3 bokeh(vec3 d, float scale, float density, float seed){
  float az = atan(d.z, d.x);
  float el = asin(clamp(d.y, -1.0, 1.0));
  vec2 uv = vec2(az, el) * scale;
  vec2 id = floor(uv); vec2 fr = fract(uv) - 0.5;
  float h = hash(id + seed);
  vec2 off = vec2(hash(id + seed + 3.1), hash(id + seed + 7.7)) - 0.5;
  float r = mix(0.16, 0.42, hash(id + seed + 1.7));
  float dd = length(fr - off * 0.45);
  float ring = smoothstep(r, r * 0.86, dd);
  float edge = smoothstep(r * 0.7, r * 0.95, dd) * ring;
  float on = step(1.0 - density, h);
  float band = smoothstep(-0.32, 0.05, el) * smoothstep(0.85, 0.3, el);
  float tw = 0.65 + 0.35 * sin(uTime * (0.6 + h) + h * 40.0);
  return pal(hash(id + seed + 5.3)) * (ring * 0.55 + edge * 0.35) * on * band * tw;
}
void main(){
  vec3 d = normalize(vDir);
  float y = d.y;
  vec3 c = mix(uMid, uTop, smoothstep(0.05, 0.9, y));
  c = mix(c, uBot, smoothstep(0.0, -0.5, y));
  // warm glow behind the globe
  float gl = pow(max(dot(d, normalize(vec3(-0.2, 0.15, -1.0))), 0.0), 6.0);
  c += uGlow * gl;
  c += bokeh(d, 7.0, 0.45, 0.0) * uBokeh;
  c += bokeh(d, 13.0, 0.35, 11.0) * uBokeh * 0.55;
  gl_FragColor = vec4(c, 1.0);
}`;

export class Room {
  constructor(scene, envTex) {
    this.scene = scene;
    this.envTex = envTex;
    this.u = {
      uTime: { value: 0 },
      uTop: { value: new THREE.Color('#0d0b12') },
      uMid: { value: new THREE.Color('#1b1310') },
      uBot: { value: new THREE.Color('#070506') },
      uGlow: { value: new THREE.Color('#3a1f12') },
      uBokeh: { value: 0.75 },
    };
    const back = new THREE.Mesh(
      new THREE.SphereGeometry(4000, 48, 24),
      new THREE.ShaderMaterial({ vertexShader: BACKDROP_VS, fragmentShader: BACKDROP_FS, uniforms: this.u, side: THREE.BackSide, depthWrite: false })
    );
    back.renderOrder = -100;
    back.frustumCulled = false;
    scene.add(back);

    // table
    const table = new THREE.Mesh(
      new THREE.CircleGeometry(1300, 96).rotateX(-Math.PI / 2),
      new THREE.MeshStandardMaterial({ map: tableTexture(), roughness: 0.42, metalness: 0, envMap: envTex, envMapIntensity: 0.35 })
    );
    table.position.y = BASE_BOTTOM;
    table.receiveShadow = true;
    scene.add(table);

    this.buildBase();
    this.buildDecor();

    // lights
    this.hemi = new THREE.HemisphereLight(0xffe6cf, 0x2a1810, 0.55);
    scene.add(this.hemi);
    const key = new THREE.DirectionalLight(0xffd6ab, 2.4);
    key.position.set(-420, 620, 520);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    const sc = key.shadow.camera;
    sc.left = -420; sc.right = 420; sc.top = 420; sc.bottom = -420; sc.near = 100; sc.far = 1800;
    key.shadow.bias = -0.0006;
    key.shadow.radius = 6;
    scene.add(key);
    this.key = key;
    const rim = new THREE.DirectionalLight(0x9fb8ff, 1.3);
    rim.position.set(560, 300, -620);
    scene.add(rim);
    const fill = new THREE.DirectionalLight(0xffb27a, 0.5);
    fill.position.set(500, 80, 300);
    scene.add(fill);
    this.keyBase = 2.4;
  }

  buildBase() {
    const scene = this.scene;
    const wood = new THREE.MeshStandardMaterial({ map: woodTexture(), roughness: 0.34, metalness: 0, envMap: this.envTex, envMapIntensity: 0.55 });
    wood.map.repeat.set(6, 1);
    const gold = new THREE.MeshStandardMaterial({ color: 0xd6a752, roughness: 0.3, metalness: 1, envMap: this.envTex, envMapIntensity: 0.85 });
    this.gold = gold;
    const V = (r, y) => new THREE.Vector2(r, y);
    const B = BASE_BOTTOM;
    const woodProfile = [
      V(0, B), V(166, B), V(169, B + 1.2), V(170, B + 3.5), V(168.5, B + 5.5), V(164, B + 6.5),
      V(161, B + 8.5), V(158.5, B + 11), V(156, B + 14), V(154, B + 18),
      V(152.5, B + 30), V(151, B + 44), V(150, B + 54), V(151.5, B + 55.5), V(154, B + 57), V(154.5, B + 59.5), V(152, B + 61), V(0, B + 61),
    ];
    const body = new THREE.Mesh(new THREE.LatheGeometry(woodProfile, 160), wood);
    body.castShadow = true; body.receiveShadow = true;
    scene.add(body);
    const top = B + 61;
    const goldProfile = [
      V(0, top), V(151.5, top), V(152.8, top + 1.5), V(152.8, top + 4.5), V(151.5, top + 6), V(149, top + 6.5),
      V(147.5, top + 8.5), V(146.5, top + 11.5), V(144.5, top + 14), V(141.5, top + 15.2), V(138.5, top + 15.2), V(137.2, top + 14), V(0, top + 14),
    ];
    const band = new THREE.Mesh(new THREE.LatheGeometry(goldProfile, 160), gold);
    band.castShadow = true; band.receiveShadow = true;
    scene.add(band);
    // bead ring
    const beads = new THREE.InstancedMesh(new THREE.SphereGeometry(1.3, 10, 8), gold, 180);
    const m = new THREE.Matrix4();
    for (let i = 0; i < 180; i++) {
      const a = i / 180 * Math.PI * 2;
      m.makeTranslation(Math.cos(a) * 166.5, B + 6.2, Math.sin(a) * 166.5);
      beads.setMatrixAt(i, m);
    }
    scene.add(beads);

    // curved brass plaque with engraved name
    const arc = 112 / 152.6;
    const pg = new THREE.CylinderGeometry(153.2, 153.6, 26, 48, 1, true, -arc / 2, arc);
    const plaque = new THREE.Mesh(pg, new THREE.MeshStandardMaterial({ map: plaqueTexture(), metalness: 0.85, roughness: 0.32, envMap: this.envTex, envMapIntensity: 1.1 }));
    plaque.position.y = B + 32;
    scene.add(plaque);

    // wind-up key at the back
    const keyG = new THREE.Group();
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 22, 16).rotateX(Math.PI / 2), gold);
    shaft.position.z = -11;
    keyG.add(shaft);
    const bow = new THREE.Mesh(new THREE.TorusGeometry(9, 2.2, 10, 28), gold);
    bow.position.set(10, 0, -23); keyG.add(bow);
    const bow2 = bow.clone(); bow2.position.x = -10; keyG.add(bow2);
    const hub = new THREE.Mesh(new THREE.SphereGeometry(4, 16, 12), gold);
    hub.position.z = -23; keyG.add(hub);
    keyG.position.set(0, B + 30, -150);
    scene.add(keyG);
    this.windKey = keyG;
  }

  buildDecor() {
    const scene = this.scene;
    const B = BASE_BOTTOM;
    // holly garland on the brass ledge
    const leafG = new THREE.SphereGeometry(1, 8, 6);
    leafG.scale(5.2, 0.9, 2.3);
    const leafM = new THREE.MeshStandardMaterial({ color: 0x1f5a2e, roughness: 0.35, envMap: this.envTex, envMapIntensity: 0.6 });
    const nLeaves = 210;
    const leaves = new THREE.InstancedMesh(leafG, leafM, nLeaves);
    const berries = new THREE.InstancedMesh(new THREE.SphereGeometry(1.6, 10, 8),
      new THREE.MeshStandardMaterial({ color: 0xc21d24, roughness: 0.25, envMap: this.envTex, envMapIntensity: 0.9 }), 120);
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), p = new THREE.Vector3(), s = new THREE.Vector3(1, 1, 1);
    for (let i = 0; i < nLeaves; i++) {
      const a = i / nLeaves * Math.PI * 2 + rr(-0.01, 0.01);
      const r = 154 + rr(-1.5, 3.5);
      p.set(Math.cos(a) * r, B + 58 + rr(0, 2.5), Math.sin(a) * r);
      e.set(rr(-0.5, 0.5), -a + rr(-1.2, 1.2), rr(-0.6, 0.6));
      q.setFromEuler(e);
      s.setScalar(rr(0.8, 1.15));
      m.compose(p, q, s);
      leaves.setMatrixAt(i, m);
    }
    s.set(1, 1, 1);
    for (let i = 0; i < 120; i++) {
      const a = i / 120 * Math.PI * 2 + rr(-0.02, 0.02);
      const r = 155.5 + rr(-0.5, 2.5);
      p.set(Math.cos(a) * r, B + 60.5 + rr(0, 1.5), Math.sin(a) * r);
      m.compose(p, q.identity(), s);
      berries.setMatrixAt(i, m);
    }
    leaves.castShadow = true;
    scene.add(leaves, berries);

    // string of warm fairy lights coiled on the table
    const pts = [];
    for (let i = 0; i <= 260; i++) {
      const a = i / 260 * Math.PI * 2;
      const r = 196 + Math.sin(a * 7) * 9 + Math.sin(a * 3 + 1) * 6;
      pts.push(new THREE.Vector3(Math.cos(a) * r, B + 1.2 + Math.max(0, Math.sin(a * 11)) * 2.5, Math.sin(a) * r));
    }
    const curve = new THREE.CatmullRomCurve3(pts, true);
    const wire = new THREE.Mesh(new THREE.TubeGeometry(curve, 520, 0.7, 5, true),
      new THREE.MeshStandardMaterial({ color: 0x1c2a1a, roughness: 0.6 }));
    scene.add(wire);
    const nb = 150;
    const bulbMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    this.fairyMat = bulbMat;
    const bulbs = new THREE.InstancedMesh(new THREE.SphereGeometry(2.1, 10, 8), bulbMat, nb);
    const warm = [new THREE.Color(3.2, 2.0, 0.8), new THREE.Color(3.0, 1.4, 0.6), new THREE.Color(3.2, 2.6, 1.8)];
    for (let i = 0; i < nb; i++) {
      const pt = curve.getPointAt(i / nb);
      m.makeTranslation(pt.x, pt.y + 1.6, pt.z);
      bulbs.setMatrixAt(i, m);
      bulbs.setColorAt(i, warm[i % 3]);
    }
    scene.add(bulbs);

    // a few wrapped presents on the table
    const gifts = [
      { x: 255, z: 150, w: 58, h: 46, d: 52, c: 0xa8202a, r: 0xe8c15a, ry: 0.4 },
      { x: 300, z: 60, w: 36, h: 30, d: 36, c: 0x1f5d3a, r: 0xd23a3a, ry: -0.3 },
      { x: -270, z: 120, w: 62, h: 40, d: 62, c: 0xf2efe8, r: 0xb8c4d8, ry: 0.8 },
      { x: -230, z: 210, w: 34, h: 52, d: 34, c: 0x2c4f9e, r: 0xf1d27a, ry: 0.1 },
    ];
    for (const gft of gifts) {
      const grp = new THREE.Group();
      const boxM = new THREE.MeshStandardMaterial({ color: gft.c, roughness: 0.55 });
      const ribM = new THREE.MeshStandardMaterial({ color: gft.r, roughness: 0.3, metalness: 0.4, envMap: this.envTex });
      const box = new THREE.Mesh(new THREE.BoxGeometry(gft.w, gft.h, gft.d), boxM);
      box.position.y = gft.h / 2; box.castShadow = true; box.receiveShadow = true; grp.add(box);
      const r1 = new THREE.Mesh(new THREE.BoxGeometry(gft.w + 0.6, gft.h + 0.6, 6), ribM); r1.position.y = gft.h / 2; grp.add(r1);
      const r2 = new THREE.Mesh(new THREE.BoxGeometry(6, gft.h + 0.6, gft.d + 0.6), ribM); r2.position.y = gft.h / 2; grp.add(r2);
      const loopG = new THREE.TorusGeometry(7, 2, 8, 20);
      const l1 = new THREE.Mesh(loopG, ribM); l1.position.set(-6, gft.h + 5, 0); l1.rotation.set(0, 0, 0.5); grp.add(l1);
      const l2 = new THREE.Mesh(loopG, ribM); l2.position.set(6, gft.h + 5, 0); l2.rotation.set(0, 0, -0.5); grp.add(l2);
      grp.position.set(gft.x, B, gft.z); grp.rotation.y = gft.ry;
      scene.add(grp);
    }
  }

  update(t, night, musicOn, dt) {
    this.u.uTime.value = t;
    this.u.uBokeh.value = 0.65 + night * 0.25;
    this.fairyMat.color.setScalar(0.9 + 0.1 * Math.sin(t * 2.0));
    if (musicOn) this.windKey.rotation.z -= dt * 1.4;
  }
}
