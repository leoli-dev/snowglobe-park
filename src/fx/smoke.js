// Soft puffs: locomotive steam, riverboat smoke, chimney smoke, splashes
import * as THREE from 'three';

const VS = /* glsl */`
attribute float aSize; attribute float aAlpha; attribute float aWhite;
uniform float uScale;
varying float vA; varying float vW;
void main(){
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = clamp(aSize * uScale / -mv.z, 0.0, 220.0);
  vA = aAlpha; vW = aWhite;
}`;
const FS = /* glsl */`
uniform vec3 uLight;
varying float vA; varying float vW;
void main(){
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  float a = smoothstep(0.5, 0.0, d) * vA;
  if (a < 0.01) discard;
  vec3 col = mix(vec3(0.35), vec3(0.95), vW) * uLight;
  gl_FragColor = vec4(col, a);
}`;

export class Smoke {
  constructor(world, n = 700) {
    this.n = n; this.i = 0;
    this.pos = new Float32Array(n * 3);
    this.vel = new Float32Array(n * 3);
    this.size = new Float32Array(n);
    this.alpha = new Float32Array(n);
    this.white = new Float32Array(n);
    this.life = new Float32Array(n);
    this.max = new Float32Array(n);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3));
    g.setAttribute('aSize', new THREE.BufferAttribute(this.size, 1));
    g.setAttribute('aAlpha', new THREE.BufferAttribute(this.alpha, 1));
    g.setAttribute('aWhite', new THREE.BufferAttribute(this.white, 1));
    this.u = { uScale: { value: 800 }, uLight: { value: new THREE.Color(1, 1, 1) } };
    this.mat = new THREE.ShaderMaterial({ vertexShader: VS, fragmentShader: FS, uniforms: this.u, transparent: true, depthWrite: false });
    this.points = new THREE.Points(g, this.mat);
    this.points.frustumCulled = false;
    this.points.renderOrder = 5;
    world.add(this.points);
  }
  emit(x, y, z, size = 1, white = 0.9, vy = 1.4, life = 3.2, spread = 0.3) {
    const i = this.i; this.i = (this.i + 1) % this.n;
    this.pos[i * 3] = x; this.pos[i * 3 + 1] = y; this.pos[i * 3 + 2] = z;
    this.vel[i * 3] = (Math.random() - 0.5) * spread; this.vel[i * 3 + 1] = vy * (0.7 + Math.random() * 0.6); this.vel[i * 3 + 2] = (Math.random() - 0.5) * spread;
    this.size[i] = size; this.white[i] = white;
    this.life[i] = life; this.max[i] = life;
  }
  update(dt, wind, light, scale) {
    this.u.uScale.value = scale;
    this.u.uLight.value.copy(light);
    for (let i = 0; i < this.n; i++) {
      if (this.life[i] <= 0) { this.alpha[i] = 0; continue; }
      this.life[i] -= dt;
      const t = 1 - this.life[i] / this.max[i];
      this.vel[i * 3 + 1] *= 1 - dt * 0.6;
      this.pos[i * 3] += (this.vel[i * 3] + wind.x * t) * dt;
      this.pos[i * 3 + 1] += this.vel[i * 3 + 1] * dt;
      this.pos[i * 3 + 2] += (this.vel[i * 3 + 2] + wind.z * t) * dt;
      this.size[i] += dt * 1.1;
      this.alpha[i] = Math.min(t * 6, 1) * (1 - t) * 0.75;
    }
    const g = this.points.geometry;
    g.attributes.position.needsUpdate = true;
    g.attributes.aSize.needsUpdate = true;
    g.attributes.aAlpha.needsUpdate = true;
    g.attributes.aWhite.needsUpdate = true;
  }
}
