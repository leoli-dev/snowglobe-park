// Inner sky dome (only inside the glass). From outside it is a translucent tint
// of the little world's own sky; once you dive in it becomes the full sky.
import * as THREE from 'three';
import { GLOBE } from '../core/config.js';

const VS = /* glsl */`
varying vec3 vW;
void main(){
  vec4 w = modelMatrix * vec4(position, 1.0);
  vW = w.xyz;
  gl_Position = projectionMatrix * viewMatrix * w;
}`;
const FS = /* glsl */`
uniform vec3 uZen, uHor, uSunCol, uSunDir, uMoonDir, uOver;
uniform float uSunset, uStars, uOvercast, uAlpha, uInside, uTime, uFlash, uMoon, uAurora;
varying vec3 vW;
float hash3(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float hash1(float n){ return fract(sin(n) * 43758.5453); }
void main(){
  vec3 C = vec3(${GLOBE.cx.toFixed(1)}, ${GLOBE.cy.toFixed(1)}, ${GLOBE.cz.toFixed(1)});
  vec3 dl = normalize(vW - C);
  vec3 dv = normalize(vW - cameraPosition);
  vec3 d = normalize(mix(dl, dv, uInside));
  float h = clamp((d.y + 0.08) / 1.08, 0.0, 1.0);
  vec3 col = mix(uHor, uZen, pow(h, 0.5));
  float sd = max(dot(d, uSunDir), 0.0);
  col += uSunCol * uSunset * pow(sd, 3.0) * (1.0 - h) * 0.85;
  col += uSunCol * pow(sd, 1400.0) * 9.0 * uInside * (1.0 - uOvercast);
  col += uSunCol * pow(sd, 14.0) * 0.22 * (1.0 - uOvercast * 0.75);
  float md = max(dot(d, uMoonDir), 0.0);
  float disc = smoothstep(0.99955, 0.99975, md);
  // crescent: offset second disc
  vec3 off = normalize(uMoonDir + vec3(0.012, 0.004, 0.0));
  float cut = smoothstep(0.99955, 0.99975, max(dot(d, off), 0.0));
  col += vec3(0.95, 0.96, 1.0) * disc * (1.0 - cut * 0.82) * 3.0 * uMoon * (1.0 - uOvercast);
  col += vec3(0.35, 0.45, 0.8) * pow(md, 60.0) * 0.3 * uMoon * (1.0 - uOvercast * 0.8);
  // stars live on the dome
  vec3 sp = dl * 170.0; vec3 id = floor(sp); vec3 fr = fract(sp) - 0.5;
  float s = hash3(id);
  float tw = 0.55 + 0.45 * sin(uTime * (1.5 + s * 3.0) + s * 60.0);
  float star = smoothstep(0.22, 0.0, length(fr)) * step(0.972, s) * tw * (0.5 + 2.0 * fract(s * 91.7));
  col += vec3(1.0, 0.97, 0.9) * star * uStars * smoothstep(0.0, 0.3, dl.y) * (1.0 - uOvercast);
  // aurora ribbons
  if (uAurora > 0.001) {
    float az = atan(dl.z, dl.x);
    float band = sin(az * 3.0 + sin(az * 7.0 + uTime * 0.15) * 0.8 + uTime * 0.05);
    float y = dl.y;
    float curtain = smoothstep(0.25, 0.5, y) * smoothstep(0.95, 0.6, y);
    float rib = smoothstep(0.55, 1.0, band) * curtain;
    float rays = 0.6 + 0.4 * sin(az * 90.0 + uTime * 0.6);
    col += mix(vec3(0.1, 1.0, 0.55), vec3(0.6, 0.3, 1.0), smoothstep(0.45, 0.85, y)) * rib * rays * uAurora * 0.9;
  }
  col = mix(col, uOver, uOvercast * 0.82);
  col += vec3(0.75, 0.8, 1.0) * uFlash;
  float a = mix(uAlpha * (0.25 + 0.75 * h), 1.0, uInside);
  gl_FragColor = vec4(col * a, a);
}`;

export class Sky {
  constructor(scene) {
    this.u = {
      uZen: { value: new THREE.Color() }, uHor: { value: new THREE.Color() },
      uSunCol: { value: new THREE.Color() }, uSunDir: { value: new THREE.Vector3(0, 1, 0) },
      uMoonDir: { value: new THREE.Vector3(0, 1, 0) }, uOver: { value: new THREE.Color() },
      uSunset: { value: 0 }, uStars: { value: 0 }, uOvercast: { value: 0 }, uAlpha: { value: 0.5 },
      uInside: { value: 0 }, uTime: { value: 0 }, uFlash: { value: 0 }, uMoon: { value: 0 }, uAurora: { value: 0 },
    };
    const R = GLOBE.R - 1.2;
    const thetaLen = Math.acos((-2 - GLOBE.cy) / R);
    const geo = new THREE.SphereGeometry(R, 96, 48, 0, Math.PI * 2, 0, thetaLen);
    const mat = new THREE.ShaderMaterial({
      vertexShader: VS, fragmentShader: FS, uniforms: this.u,
      side: THREE.BackSide, transparent: true, depthWrite: false,
      blending: THREE.CustomBlending, blendEquation: THREE.AddEquation,
      blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor,
    });
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.position.set(GLOBE.cx, GLOBE.cy, GLOBE.cz);
    this.mesh.renderOrder = -50;
    this.mesh.frustumCulled = false;
    scene.add(this.mesh);
  }
}
