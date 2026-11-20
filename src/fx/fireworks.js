// Night-time fireworks over the castle: peonies, rings, hearts, Mickey heads,
// golden willows, crossettes and a big finale. Additive particles + a flash light.
import * as THREE from 'three';
import { C } from '../park/layout.js';

const VS = /* glsl */`
attribute vec3 aColor; attribute float aSize; attribute float aAlpha;
uniform float uScale;
varying vec3 vC; varying float vA;
void main(){
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = clamp(aSize * uScale / max(-mv.z, 0.1), 2.2, 110.0);
  vC = aColor; vA = aAlpha;
}`;
const FS = /* glsl */`
varying vec3 vC; varying float vA;
void main(){
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  float core = smoothstep(0.5, 0.0, d);
  float a = (core * core * 0.9 + smoothstep(0.15, 0.0, d)) * vA;
  if (a < 0.003) discard;
  gl_FragColor = vec4(vC * a * 1.45, a);
}`;

const PALETTE = [
  [1.0, 0.25, 0.3], [1.0, 0.8, 0.3], [0.35, 0.65, 1.0], [0.45, 1.0, 0.55], [0.85, 0.4, 1.0],
  [1.0, 1.0, 1.0], [1.0, 0.5, 0.15], [0.3, 1.0, 0.95], [1.0, 0.45, 0.75],
];

export class Fireworks {
  constructor(world, app) {
    this.app = app;
    const N = this.N = 26000;
    this.pos = new Float32Array(N * 3);
    this.vel = new Float32Array(N * 3);
    this.col = new Float32Array(N * 3);
    this.size = new Float32Array(N);
    this.alpha = new Float32Array(N);
    this.life = new Float32Array(N);
    this.max = new Float32Array(N);
    this.kind = new Uint8Array(N); // 0 spark, 1 trail spark (no gravity drag), 2 glitter, 3 crossette seed
    this.drag = new Float32Array(N);
    this.grav = new Float32Array(N);
    this.i = 0;
    for (let i = 0; i < N; i++) this.pos[i * 3 + 1] = -999;
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('aColor', new THREE.BufferAttribute(this.col, 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('aSize', new THREE.BufferAttribute(this.size, 1).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('aAlpha', new THREE.BufferAttribute(this.alpha, 1).setUsage(THREE.DynamicDrawUsage));
    this.u = { uScale: { value: 800 } };
    this.points = new THREE.Points(g, new THREE.ShaderMaterial({ vertexShader: VS, fragmentShader: FS, uniforms: this.u, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    this.points.frustumCulled = false;
    this.points.renderOrder = 30;
    world.add(this.points);
    this.shells = [];
    this.light = new THREE.PointLight(0xffffff, 0, 420, 2);
    this.light.position.set(0, 80, -30);
    world.add(this.light);
    this.lightC = new THREE.Color();
    this.glow = 0;
    this.show = null;
    this.onBoom = null;
    this.onLaunch = null;
  }
  emit(x, y, z, vx, vy, vz, r, g, b, size, life, kind = 0, drag = 1.2, grav = 6) {
    const i = this.i; this.i = (this.i + 1) % this.N;
    const i3 = i * 3;
    this.pos[i3] = x; this.pos[i3 + 1] = y; this.pos[i3 + 2] = z;
    this.vel[i3] = vx; this.vel[i3 + 1] = vy; this.vel[i3 + 2] = vz;
    this.col[i3] = r; this.col[i3 + 1] = g; this.col[i3 + 2] = b;
    this.size[i] = size; this.life[i] = life; this.max[i] = life; this.kind[i] = kind;
    this.drag[i] = drag; this.grav[i] = grav;
    return i;
  }
  launch(type, x, z, h, color, color2) {
    const g = 22;
    const vy = Math.sqrt(2 * g * (h - 8));
    this.shells.push({ x, y: 8, z, vx: (Math.random() - 0.5) * 3, vy, vz: (Math.random() - 0.5) * 3, fuse: vy / g * 0.97, type, color, color2, g, trail: 0 });
    if (this.onLaunch) this.onLaunch();
  }
  burst(s) {
    const { x, y, z, type } = s;
    const c = s.color, c2 = s.color2 || c;
    const n = type === 'big' ? 560 : (type === 'willow' ? 340 : 420);
    const sp = type === 'big' ? 34 : 24;
    const dirs = [];
    if (type === 'ring' || type === 'mickey' || type === 'heart') {
      // shaped bursts lie in a plane facing the default camera (+z) with a random tilt
      const tilt = (Math.random() - 0.5) * 0.6;
      const shape = [];
      const M = 140;
      for (let i = 0; i < M; i++) {
        const a = i / M * Math.PI * 2;
        if (type === 'ring') shape.push([Math.cos(a), Math.sin(a)]);
        else if (type === 'heart') {
          const hx = 16 * Math.pow(Math.sin(a), 3), hy = 13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a);
          shape.push([hx / 16, hy / 16]);
        }
      }
      if (type === 'mickey') {
        for (let i = 0; i < 120; i++) { const a = i / 120 * Math.PI * 2; shape.push([Math.cos(a), Math.sin(a)]); }
        for (const ex of [-1, 1]) for (let i = 0; i < 60; i++) { const a = i / 60 * Math.PI * 2; shape.push([ex * 1.05 + Math.cos(a) * 0.55, 1.05 + Math.sin(a) * 0.55]); }
      }
      for (const [u, v] of shape) dirs.push(new THREE.Vector3(u, v, Math.sin(tilt) * u).normalize().multiplyScalar(Math.hypot(u, v)));
    } else {
      for (let i = 0; i < n; i++) {
        const u = Math.random() * 2 - 1, a = Math.random() * Math.PI * 2;
        const r = Math.sqrt(1 - u * u);
        dirs.push(new THREE.Vector3(r * Math.cos(a), u, r * Math.sin(a)).multiplyScalar(0.85 + Math.random() * 0.15));
      }
    }
    for (let k = 0; k < dirs.length; k++) {
      const d = dirs[k];
      const cc = (k % 2) ? c : c2;
      if (type === 'willow') this.emit(x, y, z, d.x * sp * 0.8, d.y * sp * 0.8, d.z * sp * 0.8, 1.0, 0.72, 0.28, 2.2, 4.2 + Math.random() * 1.5, 2, 1.6, 4);
      else if (type === 'glitter') this.emit(x, y, z, d.x * sp, d.y * sp, d.z * sp, 1, 0.95, 0.8, 1.8, 2.4 + Math.random(), 2, 1.5, 6);
      else if (type === 'crossette' && k % 12 === 0) this.emit(x, y, z, d.x * sp, d.y * sp, d.z * sp, cc[0], cc[1], cc[2], 2.2, 1.1, 3, 0.9, 6);
      else this.emit(x, y, z, d.x * sp, d.y * sp, d.z * sp, cc[0], cc[1], cc[2], type === 'big' ? 2.6 : 2.2, 1.8 + Math.random() * 0.9, 0, 1.25, 6);
    }
    this.emit(x, y, z, 0, 0, 0, c[0] * 0.3 + 0.15, c[1] * 0.3 + 0.15, c[2] * 0.3 + 0.15, type === 'big' ? 13 : 9, 0.32, 1, 1, 0);
    this.flash(x, y, z, c, type === 'big' ? 2.2 : 1.2);
    if (this.onBoom) this.onBoom(this.app.camera.position.distanceTo(new THREE.Vector3(x, y, z)), type === 'big');
  }
  flash(x, y, z, c, k) {
    this.light.position.set(x, y, z);
    this.lightC.setRGB(c[0], c[1], c[2]);
    this.light.color.copy(this.lightC);
    this.glow = Math.min(1.5, this.glow + k * 0.7);
  }
  startShow() {
    this.show = { t: 0, next: 0.5, finale: false };
  }
  stopShow() { this.show = null; }
  get running() { return !!this.show; }
  pickColor() { return PALETTE[Math.floor(Math.random() * PALETTE.length)]; }
  update(dt) {
    const camH = this.app.renderer.domElement.height / (2 * Math.tan(this.app.camera.fov * Math.PI / 360));
    this.u.uScale.value = camH;
    // choreography
    const S = this.show;
    if (S) {
      S.t += dt;
      S.next -= dt;
      const [cx, cz] = C.castle;
      if (S.next <= 0) {
        const t = S.t;
        const types = ['peony', 'peony', 'ring', 'willow', 'crossette', 'glitter', 'heart', 'mickey'];
        let count = 1, gap = 1.4;
        if (t < 10) { count = 1; gap = 1.6; }
        else if (t < 40) { count = 1 + (Math.random() < 0.4 ? 1 : 0); gap = 1.0; }
        else if (t < 55) { count = 2; gap = 0.7; }
        else if (t < 66) { count = 3; gap = 0.5; S.finale = true; }
        else if (t < 70) { count = 0; gap = 1; }
        else { this.show = null; }
        for (let k = 0; k < count; k++) {
          let type = types[Math.floor(Math.random() * types.length)];
          if (t > 22 && t < 24) type = 'mickey';
          if (S.finale && Math.random() < 0.35) type = 'big';
          const x = cx + (Math.random() - 0.5) * 60, z = cz - 20 - Math.random() * 30;
          const h = 70 + Math.random() * 45;
          this.launch(type, x, z, h, this.pickColor(), this.pickColor());
        }
        S.next = gap * (0.6 + Math.random() * 0.8);
      }
    }
    // shells
    for (let i = this.shells.length - 1; i >= 0; i--) {
      const s = this.shells[i];
      s.vy -= s.g * dt; s.x += s.vx * dt; s.y += s.vy * dt; s.z += s.vz * dt;
      s.fuse -= dt;
      s.trail -= dt;
      if (s.trail <= 0) { s.trail = 0.016; this.emit(s.x, s.y, s.z, (Math.random() - 0.5) * 2, -2, (Math.random() - 0.5) * 2, 1, 0.75, 0.4, 1.1, 0.5, 1, 2, 2); }
      if (s.fuse <= 0) { this.burst(s); this.shells.splice(i, 1); }
    }
    // particles
    const N = this.N, p = this.pos, v = this.vel;
    for (let i = 0; i < N; i++) {
      if (this.life[i] <= 0) { if (this.alpha[i] !== 0) this.alpha[i] = 0; continue; }
      this.life[i] -= dt;
      const i3 = i * 3;
      const dr = Math.exp(-dt * this.drag[i]);
      v[i3] *= dr; v[i3 + 1] = v[i3 + 1] * dr - this.grav[i] * dt; v[i3 + 2] *= dr;
      p[i3] += v[i3] * dt; p[i3 + 1] += v[i3 + 1] * dt; p[i3 + 2] += v[i3 + 2] * dt;
      const lt = this.life[i] / this.max[i];
      const k = this.kind[i];
      if (k === 2) this.alpha[i] = lt * (Math.random() < 0.5 ? 1 : 0.15);
      else if (k === 1) this.alpha[i] = lt * 0.8;
      else this.alpha[i] = Math.min(1, lt * 1.6);
      if (k === 3 && this.life[i] <= 0) {
        // crossette splits into four
        for (let q = 0; q < 4; q++) { const a = q * Math.PI / 2 + Math.random(); this.emit(p[i3], p[i3 + 1], p[i3 + 2], Math.cos(a) * 14, 4, Math.sin(a) * 14, this.col[i3], this.col[i3 + 1], this.col[i3 + 2], 1.7, 1.2, 0, 1.2, 6); }
      }
      // sparkle trails for normal sparks
      if (k === 0 && Math.random() < 0.06) this.emit(p[i3], p[i3 + 1], p[i3 + 2], 0, -1, 0, this.col[i3] * 0.8, this.col[i3 + 1] * 0.8, this.col[i3 + 2] * 0.8, 1.0, 0.5, 1, 3, 3);
    }
    const g = this.points.geometry;
    g.attributes.position.needsUpdate = true;
    g.attributes.aColor.needsUpdate = true;
    g.attributes.aSize.needsUpdate = true;
    g.attributes.aAlpha.needsUpdate = true;
    this.glow = Math.max(0, this.glow - dt * 3);
    this.light.intensity = this.glow * 14000;
  }
}
