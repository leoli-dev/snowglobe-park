// Post-processing chain: room → inner world → glass, bloom, tone mapping,
// tilt-shift lens blur (miniature mode) and a light color grade.
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

const TiltShift = {
  uniforms: {
    tDiffuse: { value: null }, uRes: { value: new THREE.Vector2(1, 1) },
    uFocus: { value: 0.45 }, uBand: { value: 0.16 }, uBlur: { value: 14 }, uAngle: { value: 0 },
  },
  vertexShader: /* glsl */`varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: /* glsl */`
  uniform sampler2D tDiffuse; uniform vec2 uRes; uniform float uFocus, uBand, uBlur, uAngle;
  varying vec2 vUv;
  void main(){
    vec2 p = vUv - vec2(0.5, uFocus);
    float d = abs(-sin(uAngle) * p.x * (uRes.x / uRes.y) + cos(uAngle) * p.y);
    float amt = smoothstep(uBand * 0.5, uBand * 0.5 + 0.3, d);
    float rad = amt * uBlur;
    if (rad < 0.35) { gl_FragColor = texture2D(tDiffuse, vUv); return; }
    vec4 acc = vec4(0.0); float ws = 0.0;
    for (int i = 0; i < 48; i++) {
      float fi = float(i);
      float r = sqrt((fi + 0.5) / 48.0) * rad;
      float th = fi * 2.39996323;
      vec2 off = vec2(cos(th), sin(th)) * r / uRes;
      vec4 c = texture2D(tDiffuse, vUv + off);
      float l = dot(c.rgb, vec3(0.299, 0.587, 0.114));
      float w = 1.0 + pow(l, 4.0) * 6.0 * amt;
      acc += c * w; ws += w;
    }
    gl_FragColor = acc / ws;
  }`,
};

const Grade = {
  uniforms: {
    tDiffuse: { value: null }, uSat: { value: 1.06 }, uContrast: { value: 1.03 }, uVig: { value: 0.35 },
    uBright: { value: 1.0 }, uAspect: { value: 1.6 }, uWarm: { value: 0.0 }, uFlash: { value: 0 },
  },
  vertexShader: TiltShift.vertexShader,
  fragmentShader: /* glsl */`
  uniform sampler2D tDiffuse; uniform float uSat, uContrast, uVig, uBright, uAspect, uWarm, uFlash;
  varying vec2 vUv;
  void main(){
    vec3 c = texture2D(tDiffuse, vUv).rgb;
    float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
    c = mix(vec3(l), c, uSat);
    c = (c - 0.5) * uContrast + 0.5;
    c *= uBright;
    c += vec3(0.03, 0.012, -0.02) * uWarm;
    float v = smoothstep(1.05, 0.2, length((vUv - 0.5) * vec2(uAspect, 1.0)));
    c *= mix(1.0, v, uVig);
    c = mix(c, vec3(1.0), uFlash);
    gl_FragColor = vec4(clamp(c, 0.0, 1.0), 1.0);
  }`,
};

export class Post {
  constructor(renderer, room, world, glassScene, camera) {
    this.renderer = renderer;
    const size = renderer.getDrawingBufferSize(new THREE.Vector2());
    const rt = new THREE.WebGLRenderTarget(size.x, size.y, { type: THREE.HalfFloatType, samples: 4 });
    this.composer = new EffectComposer(renderer, rt);
    const p1 = new RenderPass(room, camera);
    const p2 = new RenderPass(world, camera); p2.clear = false;
    const p3 = new RenderPass(glassScene, camera); p3.clear = false;
    this.bloom = new UnrealBloomPass(new THREE.Vector2(size.x, size.y), 0.35, 0.55, 1.0);
    this.output = new OutputPass();
    this.tilt = new ShaderPass(TiltShift);
    this.tilt.enabled = false;
    this.grade = new ShaderPass(Grade);
    for (const p of [p1, p2, p3, this.bloom, this.output, this.tilt, this.grade]) this.composer.addPass(p);
  }
  setSize(w, h, pr) {
    this.composer.setPixelRatio(pr);
    this.composer.setSize(w, h);
    this.tilt.uniforms.uRes.value.set(w * pr, h * pr);
    this.grade.uniforms.uAspect.value = w / h;
  }
  render(dt) { this.composer.render(dt); }
}
