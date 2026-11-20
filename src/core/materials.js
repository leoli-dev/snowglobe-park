// Shared materials and shader patches:
//  - snow cover on up-facing surfaces + wet look in rain (all park materials)
//  - window / neon glow that follows the night factor
//  - castle uplighting projection at night
//  - fog that only exists inside the glass sphere (path length inside the globe)
import * as THREE from 'three';
import { GLOBE, TEX_HALF } from './config.js';

export const U = {
  uTime: { value: 0 },
  uSnow: { value: 0.55 },
  uWet: { value: 0 },
  uGlow: { value: 0 },
  uNeon: { value: 0.35 },
  uCastle: { value: 0 },
  uCastleTint: { value: new THREE.Color(1, 0.55, 0.85) },
  uSkyRefl: { value: new THREE.Color(0.55, 0.65, 0.8) },
  uSnowMask: { value: null },
  uIce: { value: 0.2 },
};

// ---------- fog limited to the inside of the globe ----------
const f = (n) => n.toFixed(1);
THREE.ShaderChunk.fog_pars_vertex = /* glsl */`
#ifdef USE_FOG
  varying float vFogDepth;
  varying vec3 vFogWorld;
#endif`;
THREE.ShaderChunk.fog_vertex = /* glsl */`
#ifdef USE_FOG
  vFogDepth = - mvPosition.z;
  vFogWorld = transpose( mat3( viewMatrix ) ) * ( mvPosition.xyz - viewMatrix[ 3 ].xyz );
#endif`;
THREE.ShaderChunk.fog_pars_fragment = /* glsl */`
#ifdef USE_FOG
  uniform vec3 fogColor;
  varying float vFogDepth;
  varying vec3 vFogWorld;
  #ifdef FOG_EXP2
    uniform float fogDensity;
  #else
    uniform float fogNear;
    uniform float fogFar;
  #endif
#endif`;
THREE.ShaderChunk.fog_fragment = /* glsl */`
#ifdef USE_FOG
  {
    vec3 fv = vFogWorld - cameraPosition;
    float fdist = length( fv );
    vec3 fd = fv / max( fdist, 1e-4 );
    vec3 oc = cameraPosition - vec3( ${f(GLOBE.cx)}, ${f(GLOBE.cy)}, ${f(GLOBE.cz)} );
    float fb = dot( oc, fd );
    float fc = dot( oc, oc ) - ${f(GLOBE.R * GLOBE.R)};
    float fh = fb * fb - fc;
    float inLen = 0.0;
    if ( fh > 0.0 ) {
      fh = sqrt( fh );
      float t0 = max( - fb - fh, 0.0 );
      float t1 = min( - fb + fh, fdist );
      inLen = max( t1 - t0, 0.0 );
    }
    #ifdef FOG_EXP2
      float fogFactor = 1.0 - exp( - fogDensity * inLen );
    #else
      float fogFactor = smoothstep( fogNear, fogFar, inLen );
    #endif
    gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, clamp( fogFactor, 0.0, 1.0 ) );
  }
#endif`;

// ---------- patches ----------
const NOISE = /* glsl */`
float sgHash( vec2 p ) { p = fract( p * vec2( 123.34, 456.21 ) ); p += dot( p, p + 45.32 ); return fract( p.x * p.y ); }
float sgNoise( vec2 p ) {
  vec2 i = floor( p ), fr = fract( p ); vec2 u = fr * fr * ( 3.0 - 2.0 * fr );
  return mix( mix( sgHash( i ), sgHash( i + vec2( 1.0, 0.0 ) ), u.x ), mix( sgHash( i + vec2( 0.0, 1.0 ) ), sgHash( i + vec2( 1.0, 1.0 ) ), u.x ), u.y );
}`;

function snowCode(amount, useMask) {
  return /* glsl */`
  {
    vec3 sgN = normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
    float sgNz = sgNoise( vSgW.xz * 0.35 ) * 0.6 + sgNoise( vSgW.xz * 1.7 + 3.1 ) * 0.4;
    float sgCover = clamp( uSnow * 1.3 - 0.15, 0.0, 1.0 );
    float sgS = smoothstep( 0.22, 0.62, sgN.y + ( sgNz - 0.5 ) * 0.4 - ( 1.0 - sgCover ) * 0.95 ) * smoothstep( 0.0, 0.2, sgCover );
    ${useMask ? 'sgS *= mix( 1.0, texture2D( uSnowMask, vec2( ( vSgW.x + ' + f(TEX_HALF) + ' ) / ' + f(TEX_HALF * 2) + ', ( ' + f(TEX_HALF) + ' - vSgW.z ) / ' + f(TEX_HALF * 2) + ' ) ).r, smoothstep( 0.95, 0.4, uSnow ) * 0.85 + 0.15 );' : ''}
    sgS *= ${amount.toFixed(2)};
    diffuseColor.rgb = mix( diffuseColor.rgb, vec3( 0.9, 0.93, 0.98 ), sgS );
    roughnessFactor = mix( roughnessFactor, 0.62, sgS );
    metalnessFactor = mix( metalnessFactor, 0.0, sgS );
    float sgWet = uWet * smoothstep( 0.1, 0.9, sgN.y ) * ( 1.0 - sgS );
    diffuseColor.rgb *= 1.0 - 0.32 * sgWet;
    roughnessFactor = mix( roughnessFactor, 0.12, sgWet );
  }`;
}

export function patchMaterial(mat, opts = {}) {
  const o = Object.assign({ snow: 1, mask: false, glow: false, neon: false, castle: false, water: false, ice: false, dimDay: false }, opts);
  const key = JSON.stringify(o);
  mat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, {
      uTime: U.uTime, uSnow: U.uSnow, uWet: U.uWet, uGlow: U.uGlow, uNeon: U.uNeon,
      uCastle: U.uCastle, uCastleTint: U.uCastleTint, uSkyRefl: U.uSkyRefl, uSnowMask: U.uSnowMask, uIce: U.uIce,
    });
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vSgW;')
      .replace('#include <project_vertex>', `#include <project_vertex>
      {
        vec4 sgw = vec4( transformed, 1.0 );
        #ifdef USE_INSTANCING
          sgw = instanceMatrix * sgw;
        #endif
        vSgW = ( modelMatrix * sgw ).xyz;
      }`);
    let pre = `#include <common>
varying vec3 vSgW;
uniform float uTime, uSnow, uWet, uGlow, uNeon, uCastle, uIce;
uniform vec3 uCastleTint, uSkyRefl;
uniform sampler2D uSnowMask;
${NOISE}`;
    let body = '';
    if (o.snow > 0) body += snowCode(o.snow, o.mask);
    body += '\n#include <emissivemap_fragment>\n';
    if (o.glow) body += 'totalEmissiveRadiance = vColor.rgb * uGlow;\n';
    if (o.neon) body += 'totalEmissiveRadiance = vColor.rgb * uNeon;\n';
    if (o.ice) body += `{
      vec3 sgV = normalize( vViewPosition );
      float sgF = pow( 1.0 - abs( dot( normal, sgV ) ), 2.0 );
      totalEmissiveRadiance += vColor.rgb * ( uIce * ( 0.35 + sgF ) );
    }\n`;
    if (o.castle) body += `{
      float cy = clamp( vSgW.y / 55.0, 0.0, 1.0 );
      float band = 0.5 + 0.5 * sin( vSgW.y * 0.22 - uTime * 0.9 + vSgW.x * 0.04 );
      totalEmissiveRadiance += uCastleTint * uCastle * ( 0.25 + 0.75 * ( 1.0 - cy * 0.7 ) ) * ( 0.55 + 0.45 * band ) * diffuseColor.rgb;
    }\n`;
    if (o.water) body += `{
      vec3 sgV = normalize( vViewPosition );
      float sgF = pow( 1.0 - clamp( dot( normal, sgV ), 0.0, 1.0 ), 3.0 );
      totalEmissiveRadiance += uSkyRefl * ( 0.12 + sgF * 0.75 );
    }\n`;
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', pre)
      .replace('#include <emissivemap_fragment>', body);
    if (o.dimDay) {
      sh.fragmentShader = sh.fragmentShader.replace('#include <color_fragment>', '#include <color_fragment>\n diffuseColor.rgb *= 0.38;');
    }
  };
  mat.customProgramCacheKey = () => key;
  return mat;
}

function std(params, patch) {
  const m = new THREE.MeshStandardMaterial(Object.assign({ vertexColors: true, roughness: 0.82, metalness: 0 }, params));
  return patchMaterial(m, patch);
}

export const MATS = {
  std: std({}, {}),
  gloss: std({ roughness: 0.32 }, {}),
  metal: std({ roughness: 0.28, metalness: 0.85 }, { snow: 0.6 }),
  glow: std({ roughness: 0.4, emissive: 0xffffff }, { snow: 0, glow: true, dimDay: true }),
  neon: std({ roughness: 0.5, emissive: 0xffffff }, { snow: 0, neon: true }),
  castle: std({ roughness: 0.75, emissive: 0x000000 }, { castle: true }),
  leaf: std({ roughness: 0.9 }, { snow: 1 }),
  ice: std({ roughness: 0.12, metalness: 0.1, emissive: 0x000000 }, { snow: 0.5, ice: true }),
  nosnow: std({}, { snow: 0 }),
  glassy: (() => {
    const m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.08, metalness: 0.1, transparent: true, opacity: 0.55, depthWrite: false });
    return patchMaterial(m, { snow: 0, ice: true });
  })(),
};

// Water: animated normals + sky reflection term
function makeWaterNormal() {
  const s = 256;
  const c = document.createElement('canvas'); c.width = c.height = s;
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(s, s);
  // sum of a few periodic waves so it tiles
  for (let y = 0; y < s; y++) for (let x = 0; x < s; x++) {
    let dx = 0, dy = 0;
    const waves = [[3, 1, 0.9], [1, 4, 0.6], [5, 3, 0.35], [7, -2, 0.25], [-4, 6, 0.2]];
    for (const [kx, ky, a] of waves) {
      const ph = (kx * x + ky * y) / s * Math.PI * 2;
      dx += Math.cos(ph) * kx * a; dy += Math.cos(ph) * ky * a;
    }
    const nx = dx * 0.08, ny = dy * 0.08;
    const len = Math.hypot(nx, ny, 1);
    const i = (y * s + x) * 4;
    img.data[i] = (nx / len * 0.5 + 0.5) * 255;
    img.data[i + 1] = (ny / len * 0.5 + 0.5) * 255;
    img.data[i + 2] = (1 / len * 0.5 + 0.5) * 255;
    img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(18, 18);
  return t;
}
export const waterNormal = makeWaterNormal();
MATS.water = patchMaterial(new THREE.MeshStandardMaterial({
  color: 0x1f5d78, roughness: 0.1, metalness: 0.05, normalMap: waterNormal,
  normalScale: new THREE.Vector2(0.45, 0.45), transparent: true, opacity: 0.9, emissive: 0x000000,
}), { snow: 0, water: true });

// bulbs (tiny light points): basic material; brightness driven via color scalar
MATS.bulb = new THREE.MeshBasicMaterial({ vertexColors: true });

export function updateWater(dt) {
  waterNormal.offset.x += dt * 0.012;
  waterNormal.offset.y += dt * 0.007;
}
