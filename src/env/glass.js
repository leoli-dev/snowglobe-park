// Glass dome: premultiplied fresnel reflections of the room, rendered as two
// shells (inner far side, outer near side). Fades away when the camera dives in.
import * as THREE from 'three';
import { GLOBE } from '../core/config.js';

const VS = /* glsl */`
varying vec3 vW; varying vec3 vN;
void main(){
  vec4 w = modelMatrix * vec4(position, 1.0);
  vW = w.xyz; vN = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * w;
}`;
const FS = /* glsl */`
uniform sampler2D uEnv;
uniform float uOpacity, uBack, uTime, uShine;
uniform vec3 uTint;
varying vec3 vW; varying vec3 vN;
vec2 eq(vec3 d){ return vec2(atan(d.z, d.x) * 0.15915 + 0.5, asin(clamp(d.y, -1.0, 1.0)) * 0.31831 + 0.5); }
void main(){
  vec3 N = normalize(vN);
  vec3 V = normalize(cameraPosition - vW);
  if (uBack > 0.5) N = -N;
  float ndv = clamp(dot(N, V), 0.0, 1.0);
  float F = 0.035 + 0.965 * pow(1.0 - ndv, 5.0);
  vec3 R = reflect(-V, N);
  vec3 env = texture2D(uEnv, eq(R)).rgb;
  float rim = pow(1.0 - ndv, 2.2);
  // thin "edge thickness" brightening + faint caustic band near the base
  float base = smoothstep(-5.0, -20.0, vW.y);
  vec3 col = env * (F * 2.2 + 0.05) * uShine + uTint * (rim * 0.22 + base * 0.08);
  float a = clamp(F * 0.55 + rim * 0.16 + 0.018 + base * 0.05, 0.0, 0.92);
  if (uBack > 0.5) { col *= 0.45; a *= 0.6; }
  gl_FragColor = vec4(col * uOpacity, a * uOpacity);
}`;

export class Glass {
  constructor(scene, envTex) {
    const R = GLOBE.R;
    const thetaLen = Math.acos((GLOBE.cutY - GLOBE.cy) / R); // from the top down to the cut
    const geo = new THREE.SphereGeometry(R, 160, 96, 0, Math.PI * 2, 0, thetaLen);
    const mk = (back) => new THREE.ShaderMaterial({
      vertexShader: VS, fragmentShader: FS,
      uniforms: {
        uEnv: { value: envTex }, uOpacity: { value: 1 }, uBack: { value: back ? 1 : 0 },
        uTime: { value: 0 }, uTint: { value: new THREE.Color(0.75, 0.85, 1.0) }, uShine: { value: 1 },
      },
      transparent: true, depthWrite: false, side: back ? THREE.BackSide : THREE.FrontSide,
      blending: THREE.CustomBlending, blendEquation: THREE.AddEquation,
      blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor,
    });
    this.back = new THREE.Mesh(geo, mk(true));
    this.front = new THREE.Mesh(geo, mk(false));
    for (const m of [this.back, this.front]) {
      m.position.set(GLOBE.cx, GLOBE.cy, GLOBE.cz);
      m.frustumCulled = false;
    }
    this.back.renderOrder = 50;
    this.front.renderOrder = 60;
    scene.add(this.back, this.front);
  }
  // inside: 0 (outside) .. 1 (camera inside the glass)
  update(inside, shine = 1) {
    const o = 1 - inside;
    this.front.material.uniforms.uOpacity.value = o;
    this.back.material.uniforms.uOpacity.value = o;
    this.front.visible = this.back.visible = o > 0.003;
    this.front.material.uniforms.uShine.value = shine;
  }
}
