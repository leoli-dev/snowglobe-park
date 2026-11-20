// Weather inside the glass: snowfall, shake-the-globe glitter snow, rain,
// clouds and lightning. Everything stays inside the sphere.
import * as THREE from 'three';
import { GLOBE } from '../core/config.js';
import { groundH } from '../env/terrain.js';
import { Builder } from '../core/builder.js';

const CX = GLOBE.cx, CY = GLOBE.cy, CZ = GLOBE.cz, R = GLOBE.R - 2.5;

const SNOW_VS = /* glsl */`
attribute float aSize; attribute float aType; attribute float aSeed; attribute float aAlpha;
uniform float uScale, uTime;
varying float vType; varying float vSeed; varying float vA;
void main(){
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  float s = aSize * uScale / max(-mv.z, 0.1);
  gl_PointSize = clamp(s, 1.6, 46.0);
  vType = aType; vSeed = aSeed; vA = aAlpha * clamp(s / 1.6, 0.35, 1.0);
}`;
const SNOW_FS = /* glsl */`
uniform vec3 uSnowCol; uniform float uTime;
varying float vType; varying float vSeed; varying float vA;
vec3 hue(float h){ return clamp(abs(mod(h * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0); }
void main(){
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  if (vType < 0.5) {
    float a = smoothstep(0.5, 0.15, d) * vA;
    if (a < 0.01) discard;
    gl_FragColor = vec4(uSnowCol, a * 0.95);
  } else {
    float tw = pow(0.5 + 0.5 * sin(uTime * (3.0 + vSeed * 5.0) + vSeed * 40.0), 6.0);
    float star = max(smoothstep(0.06, 0.0, abs(c.x)) * smoothstep(0.5, 0.0, abs(c.y)), smoothstep(0.06, 0.0, abs(c.y)) * smoothstep(0.5, 0.0, abs(c.x)));
    float a = (smoothstep(0.35, 0.0, d) * 0.7 + star * tw) * vA;
    if (a < 0.01) discard;
    vec3 col = mix(vec3(1.0, 0.95, 0.8), hue(fract(vSeed * 3.7 + uTime * 0.05)), 0.55) * (0.8 + tw * 2.5);
    gl_FragColor = vec4(col, a);
  }
}`;

export class Weather {
  constructor(world, app) {
    this.app = app;
    this.world = world;
    this.wind = new THREE.Vector3(0.5, 0, 0.2);
    this.windAng = 0.4;
    this.shakeT = 99;
    this.shakeE = 0;
    // ---- snow & glitter particles ----
    const N = this.N = 16000;
    this.pos = new Float32Array(N * 3);
    this.vel = new Float32Array(N * 3);
    this.state = new Uint8Array(N); // 0 dormant, 1 weather, 2 shaken
    this.size = new Float32Array(N);
    this.type = new Float32Array(N);
    this.seed = new Float32Array(N);
    this.alpha = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      this.seed[i] = Math.random();
      this.type[i] = i % 5 === 0 ? 1 : 0;
      this.size[i] = this.type[i] ? 0.28 + Math.random() * 0.2 : 0.32 + Math.random() * 0.4;
      this.pos[i * 3 + 1] = -500;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('aSize', new THREE.BufferAttribute(this.size, 1));
    g.setAttribute('aType', new THREE.BufferAttribute(this.type, 1));
    g.setAttribute('aSeed', new THREE.BufferAttribute(this.seed, 1));
    g.setAttribute('aAlpha', new THREE.BufferAttribute(this.alpha, 1).setUsage(THREE.DynamicDrawUsage));
    this.su = { uScale: { value: 800 }, uTime: { value: 0 }, uSnowCol: { value: new THREE.Color(1, 1, 1) } };
    this.snowPts = new THREE.Points(g, new THREE.ShaderMaterial({ vertexShader: SNOW_VS, fragmentShader: SNOW_FS, uniforms: this.su, transparent: true, depthWrite: false }));
    this.snowPts.frustumCulled = false;
    this.snowPts.renderOrder = 20;
    world.add(this.snowPts);

    // ---- rain ----
    const NR = this.NR = 7000;
    this.rpos = new Float32Array(NR * 3);
    this.rlive = new Uint8Array(NR);
    this.rline = new Float32Array(NR * 6);
    const rg = new THREE.BufferGeometry();
    rg.setAttribute('position', new THREE.BufferAttribute(this.rline, 3).setUsage(THREE.DynamicDrawUsage));
    this.rainMat = new THREE.LineBasicMaterial({ color: 0xbfd2e6, transparent: true, opacity: 0.42, depthWrite: false });
    this.rain = new THREE.LineSegments(rg, this.rainMat);
    this.rain.frustumCulled = false;
    this.rain.renderOrder = 21;
    world.add(this.rain);
    // splash ripples on the ground (tiny points)
    this.splashes = [];

    // ---- clouds ----
    this.cloudMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, transparent: true, opacity: 0, depthWrite: false, emissive: 0x000000 });
    this.clouds = new THREE.Group();
    for (let k = 0; k < 16; k++) {
      const cb = new Builder();
      const n = 6 + (k % 4);
      for (let i = 0; i < n; i++) cb.sph(5 + Math.random() * 6, (i - n / 2) * 5.5 + Math.random() * 3, Math.random() * 4, Math.random() * 6 - 3, '#ffffff', { w: 12, h: 9, sy: 0.7 });
      const geo = cb.buildGeometry();
      const m = new THREE.Mesh(geo, this.cloudMat);
      const a = k / 16 * Math.PI * 2 + Math.random() * 0.3;
      const rr = 30 + Math.random() * 70;
      const y = 104 + Math.random() * 40;
      const maxR = Math.sqrt(R * R - (y - CY) ** 2) - 22;
      const r2 = Math.min(rr, maxR);
      m.position.set(Math.cos(a) * r2, y, Math.sin(a) * r2);
      m.rotation.y = -a;
      m.scale.setScalar(0.9 + Math.random() * 0.5);
      m.renderOrder = 15;
      this.clouds.add(m);
    }
    this.clouds.visible = false;
    world.add(this.clouds);

    // ---- lightning ----
    this.boltMat = new THREE.LineBasicMaterial({ color: 0xeef4ff, transparent: true, opacity: 0 });
    this.bolt = new THREE.Line(new THREE.BufferGeometry(), this.boltMat);
    this.bolt.frustumCulled = false;
    world.add(this.bolt);
    this.nextBolt = 3;
    this.boltT = 0;
    this.onThunder = null;
  }

  shake(strength = 1) {
    this.shakeT = 0;
    this.shakeE = strength;
    const N = this.N;
    const count = Math.floor(N * 0.85 * strength);
    let made = 0;
    for (let i = 0; i < N && made < count; i++) {
      if (this.state[i] === 1 && Math.random() < 0.5) continue;
      const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * 128;
      const x = Math.cos(a) * r, z = Math.sin(a) * r;
      const y = groundH(x, z) + Math.random() * 4;
      this.pos[i * 3] = x; this.pos[i * 3 + 1] = y; this.pos[i * 3 + 2] = z;
      // upward burst + swirl around the globe axis
      const sw = 14 + Math.random() * 16;
      this.vel[i * 3] = -Math.sin(a) * sw + (Math.random() - 0.5) * 8;
      this.vel[i * 3 + 1] = 22 + Math.random() * 42;
      this.vel[i * 3 + 2] = Math.cos(a) * sw + (Math.random() - 0.5) * 8;
      this.state[i] = 2;
      this.alpha[i] = 1;
      made++;
    }
  }

  spawnTop(i, anyHeight) {
    const y = anyHeight ? 12 + Math.random() * 160 : 150 + Math.random() * 30;
    const rmax = Math.sqrt(Math.max(R * R - (y - CY) ** 2, 1)) * 0.98;
    const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * rmax;
    this.pos[i * 3] = CX + Math.cos(a) * r; this.pos[i * 3 + 1] = y; this.pos[i * 3 + 2] = CZ + Math.sin(a) * r;
    this.vel[i * 3] = 0; this.vel[i * 3 + 1] = -3; this.vel[i * 3 + 2] = 0;
    this.state[i] = 1;
    this.alpha[i] = 1;
  }

  update(dt, sdt) {
    const atm = this.app.atmos;
    const W = atm.W;
    const t = this.app.time;
    // wind slowly veers
    this.windAng += dt * 0.05;
    const ws = 1.5 + W.wind * 11;
    this.wind.set(Math.cos(this.windAng) * ws, 0, Math.sin(this.windAng) * ws);
    this.shakeT += dt;
    const swirl = this.shakeE * Math.exp(-this.shakeT / 2.6);

    // ---- snow ----
    const N = this.N;
    const targetWeather = Math.floor(W.snow * 13000);
    let live = 0;
    for (let i = 0; i < N; i++) if (this.state[i] === 1) live++;
    let deficit = targetWeather - live;
    const fall = 3.2 + W.snow * 3.5;
    const p = this.pos, v = this.vel;
    for (let i = 0; i < N; i++) {
      const st = this.state[i];
      if (st === 0) {
        if (deficit > 0 && Math.random() < 0.08) { this.spawnTop(i, live < targetWeather * 0.3); deficit--; }
        else { this.alpha[i] = 0; continue; }
      }
      const i3 = i * 3;
      let x = p[i3], y = p[i3 + 1], z = p[i3 + 2];
      const sd = this.seed[i];
      if (this.state[i] === 1) {
        const tx = Math.sin(t * 0.7 + sd * 30 + y * 0.05) * 1.2, tz = Math.cos(t * 0.6 + sd * 20 + x * 0.05) * 1.2;
        v[i3] += ((this.wind.x + tx) - v[i3]) * Math.min(1, dt * 1.5);
        v[i3 + 2] += ((this.wind.z + tz) - v[i3 + 2]) * Math.min(1, dt * 1.5);
        v[i3 + 1] += ((-fall * (0.7 + sd * 0.6)) - v[i3 + 1]) * Math.min(1, dt * 2);
      } else {
        // shaken: buoyant swirl that slowly settles, like flakes in water
        const rx = x - CX, rz = z - CZ;
        const sw = swirl * 0.9;
        v[i3] += (-rz * 0.12 * sw + Math.sin(t * 1.3 + sd * 50) * 3 * sw) * dt;
        v[i3 + 2] += (rx * 0.12 * sw + Math.cos(t * 1.1 + sd * 40) * 3 * sw) * dt;
        v[i3 + 1] += (-5.5 + Math.sin(t * 2 + sd * 60) * 6 * sw) * dt;
        const drag = Math.exp(-dt * 0.9);
        v[i3] *= drag; v[i3 + 1] *= drag; v[i3 + 2] *= drag;
        if (v[i3 + 1] < -2.6 - sd * 1.2) v[i3 + 1] = -2.6 - sd * 1.2;
      }
      x += v[i3] * dt; y += v[i3 + 1] * dt; z += v[i3 + 2] * dt;
      // keep inside the glass
      const dx = x - CX, dy = y - CY, dz = z - CZ;
      const d2 = dx * dx + dy * dy + dz * dz;
      if (d2 > R * R) {
        const d = Math.sqrt(d2), k = (R - 0.3) / d;
        x = CX + dx * k; y = CY + dy * k; z = CZ + dz * k;
        const vn = (v[i3] * dx + v[i3 + 1] * dy + v[i3 + 2] * dz) / d;
        if (vn > 0) { v[i3] -= vn * dx / d * 1.6; v[i3 + 1] -= vn * dy / d * 1.6; v[i3 + 2] -= vn * dz / d * 1.6; }
      }
      const gh = (x * x + z * z < 110 * 110) ? 0 : groundH(x, z);
      if (y < gh + 0.15) {
        if (this.state[i] === 1 && deficit >= 0) { this.spawnTop(i, false); x = p[i3]; y = p[i3 + 1]; z = p[i3 + 2]; }
        else { this.state[i] = 0; this.alpha[i] = 0; y = -500; }
      }
      p[i3] = x; p[i3 + 1] = y; p[i3 + 2] = z;
      if (this.state[i] === 1 && deficit < -50 && Math.random() < dt * 0.4) { this.state[i] = 0; this.alpha[i] = 0; p[i3 + 1] = -500; deficit++; }
    }
    const sg = this.snowPts.geometry;
    sg.attributes.position.needsUpdate = true;
    sg.attributes.aAlpha.needsUpdate = true;
    this.su.uTime.value = t;
    this.su.uScale.value = this.app.renderer.domElement.height / (2 * Math.tan(this.app.camera.fov * Math.PI / 360));
    // flakes take the ambient light color
    const L = atm.hemi.intensity / 1.6;
    this.su.uSnowCol.value.copy(atm.hemi.color).lerp(new THREE.Color(1, 1, 1), 0.55).multiplyScalar(Math.min(1.15, 0.35 + L * 0.85) + atm.flash);

    // ---- rain ----
    const NR = this.NR;
    const targetR = Math.floor(W.rain * NR);
    const rp = this.rpos, rl = this.rline;
    const vy = -30, vxw = this.wind.x * 1.2, vzw = this.wind.z * 1.2;
    for (let i = 0; i < NR; i++) {
      const i3 = i * 3, i6 = i * 6;
      if (!this.rlive[i]) {
        if (i < targetR) {
          const y = 20 + Math.random() * 150;
          const rmax = Math.sqrt(Math.max(R * R - (y - CY) ** 2, 1)) * 0.97;
          const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * rmax;
          rp[i3] = Math.cos(a) * r; rp[i3 + 1] = y; rp[i3 + 2] = Math.sin(a) * r;
          this.rlive[i] = 1;
        } else { rl[i6 + 1] = rl[i6 + 4] = -500; continue; }
      }
      rp[i3] += vxw * dt; rp[i3 + 1] += vy * dt; rp[i3 + 2] += vzw * dt;
      const x = rp[i3], y = rp[i3 + 1], z = rp[i3 + 2];
      const dx = x - CX, dy = y - CY, dz = z - CZ;
      if (y < 0.2 || dx * dx + dy * dy + dz * dz > R * R) {
        this.rlive[i] = 0;
        if (y < 0.5 && Math.random() < 0.05) this.app.park?.smoke.emit(x, 0.3, z, 0.35, 1, 0.6, 0.35, 0.8);
        rl[i6 + 1] = rl[i6 + 4] = -500;
        continue;
      }
      rl[i6] = x; rl[i6 + 1] = y; rl[i6 + 2] = z;
      rl[i6 + 3] = x - vxw * 0.05; rl[i6 + 4] = y - vy * 0.05; rl[i6 + 5] = z - vzw * 0.05;
    }
    this.rain.geometry.attributes.position.needsUpdate = true;
    this.rainMat.opacity = 0.18 + 0.32 * Math.min(1, W.rain * 1.5);
    this.rainMat.color.copy(atm.hemi.color).lerp(new THREE.Color(0.85, 0.9, 1), 0.5).multiplyScalar(0.6 + L * 0.5 + atm.flash);

    // ---- clouds ----
    const co = Math.min(1, W.cloud);
    this.clouds.visible = co > 0.02;
    this.cloudMat.opacity = co * 0.9;
    const storm = Math.max(W.light, W.overcast * 0.6);
    this.cloudMat.color.setRGB(1 - storm * 0.55, 1 - storm * 0.52, 1 - storm * 0.45);
    this.cloudMat.emissive.setRGB(atm.flash * 0.8, atm.flash * 0.8, atm.flash * 0.9);
    this.clouds.rotation.y += dt * (0.01 + W.wind * 0.02);

    // ---- lightning ----
    this.boltT -= dt;
    if (this.boltMat.opacity > 0) this.boltMat.opacity = Math.max(0, this.boltT > 0 ? (Math.random() < 0.7 ? 1 : 0.2) : this.boltMat.opacity - dt * 6);
    if (W.light > 0.5) {
      this.nextBolt -= dt;
      if (this.nextBolt <= 0) {
        this.nextBolt = 2.5 + Math.random() * 6;
        this.strike();
      }
    }
  }

  strike() {
    const a = Math.random() * Math.PI * 2, r = Math.random() * 90;
    const gx = Math.cos(a) * r, gz = Math.sin(a) * r;
    const pts = [];
    let x = gx + (Math.random() - 0.5) * 30, z = gz + (Math.random() - 0.5) * 30, y = 135;
    while (y > 0) {
      pts.push(new THREE.Vector3(x, y, z));
      y -= 6 + Math.random() * 8;
      x += (gx - x) * 0.25 + (Math.random() - 0.5) * 8;
      z += (gz - z) * 0.25 + (Math.random() - 0.5) * 8;
    }
    pts.push(new THREE.Vector3(gx, groundH(gx, gz), gz));
    this.bolt.geometry.dispose();
    this.bolt.geometry = new THREE.BufferGeometry().setFromPoints(pts);
    this.boltMat.opacity = 1;
    this.boltT = 0.28;
    this.app.atmos.flash = 1.0;
    if (this.onThunder) this.onThunder(0.4 + Math.random() * 1.6);
  }
}
