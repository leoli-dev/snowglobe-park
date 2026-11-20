// Time of day + weather → every lighting/sky/fog parameter of the inner world.
import * as THREE from 'three';
import { DEG, smoothstep, clamp, lerp, GLOBE } from '../core/config.js';
import { U } from '../core/materials.js';

export const WEATHERS = {
  clear:    { name: '晴', cloud: 0.06, overcast: 0.0, snow: 0, rain: 0, fog: 0.0010, sun: 1.0, wind: 0.15, dark: 0, light: 0, accum: 0, wet: 0 },
  cloudy:   { name: '多云', cloud: 0.75, overcast: 0.42, snow: 0, rain: 0, fog: 0.0016, sun: 0.55, wind: 0.3, dark: 0.12, light: 0, accum: 0, wet: 0 },
  snow:     { name: '小雪', cloud: 0.6, overcast: 0.5, snow: 0.32, rain: 0, fog: 0.0024, sun: 0.5, wind: 0.22, dark: 0.15, light: 0, accum: 0.0015, wet: 0 },
  blizzard: { name: '暴风雪', cloud: 1.0, overcast: 0.9, snow: 1.0, rain: 0, fog: 0.0042, sun: 0.2, wind: 1.0, dark: 0.45, light: 0, accum: 0.008, wet: 0 },
  rain:     { name: '雨', cloud: 0.9, overcast: 0.78, snow: 0, rain: 0.55, fog: 0.0030, sun: 0.3, wind: 0.35, dark: 0.3, light: 0, accum: -0.004, wet: 1 },
  storm:    { name: '雷雨', cloud: 1.0, overcast: 1.0, snow: 0, rain: 1.0, fog: 0.0036, sun: 0.1, wind: 0.85, dark: 0.6, light: 1, accum: -0.006, wet: 1 },
  fog:      { name: '雾', cloud: 0.25, overcast: 0.55, snow: 0, rain: 0, fog: 0.0085, sun: 0.35, wind: 0.04, dark: 0.18, light: 0, accum: 0, wet: 0.3 },
  aurora:   { name: '极光', cloud: 0.0, overcast: 0.0, snow: 0.08, rain: 0, fog: 0.0009, sun: 1.0, wind: 0.1, dark: 0, light: 0, accum: 0, wet: 0, aurora: 1 },
};
const SNOW_TARGET = { snow: 0.75, blizzard: 1.0, rain: 0.18, storm: 0.12 };
const KEYS_W = ['cloud', 'overcast', 'snow', 'rain', 'fog', 'sun', 'wind', 'dark', 'light', 'accum', 'wet', 'aurora'];

// keyframes over sun altitude (degrees)
const K = [
  { a: -90, zen: '#030716', hor: '#0b1430', sun: '#000000', si: 0, hs: '#1b2b5c', hg: '#0a0e1d', hi: 0.55 },
  { a: -14, zen: '#050b22', hor: '#132048', sun: '#000000', si: 0, hs: '#1f2f62', hg: '#0c1020', hi: 0.6 },
  { a: -6, zen: '#121d48', hor: '#373e78', sun: '#000000', si: 0, hs: '#2f3c74', hg: '#141729', hi: 0.75 },
  { a: -2, zen: '#283978', hor: '#b86a7c', sun: '#ff6c3c', si: 0.15, hs: '#5a5890', hg: '#2c2232', hi: 0.95 },
  { a: 2, zen: '#3b58a2', hor: '#f29a66', sun: '#ff8c4e', si: 1.1, hs: '#9488b6', hg: '#5e4a42', hi: 1.15 },
  { a: 8, zen: '#4d7ec8', hor: '#f6cd9c', sun: '#ffbe80', si: 2.6, hs: '#bcc6e4', hg: '#8e7c6a', hi: 1.35 },
  { a: 18, zen: '#4a88d8', hor: '#cfe1f3', sun: '#ffeeda', si: 3.9, hs: '#d0e1ff', hg: '#d0c7b9', hi: 1.55 },
  { a: 90, zen: '#3d7fd6', hor: '#c2dbf2', sun: '#fff5e8', si: 4.3, hs: '#d8e7ff', hg: '#dad3c7', hi: 1.6 },
].map(k => ({ ...k, zen: new THREE.Color(k.zen), hor: new THREE.Color(k.hor), sun: new THREE.Color(k.sun), hs: new THREE.Color(k.hs), hg: new THREE.Color(k.hg) }));

const _c = new THREE.Color();
function sampleKeys(alt, out) {
  let i = 0;
  while (i < K.length - 2 && alt > K[i + 1].a) i++;
  const a = K[i], b = K[i + 1];
  const t = clamp((alt - a.a) / (b.a - a.a), 0, 1);
  out.zen.copy(a.zen).lerp(b.zen, t);
  out.hor.copy(a.hor).lerp(b.hor, t);
  out.sun.copy(a.sun).lerp(b.sun, t);
  out.si = lerp(a.si, b.si, t);
  out.hs.copy(a.hs).lerp(b.hs, t);
  out.hg.copy(a.hg).lerp(b.hg, t);
  out.hi = lerp(a.hi, b.hi, t);
}

export class Atmos {
  constructor(world, sky) {
    this.world = world;
    this.sky = sky;
    this.hour = 15.6;
    this.weatherKey = 'snow';
    this.W = { ...WEATHERS.snow, aurora: 0 };
    this.Wt = { ...WEATHERS.snow, aurora: 0 };
    this.flash = 0;
    this.s = { zen: new THREE.Color(), hor: new THREE.Color(), sun: new THREE.Color(), si: 0, hs: new THREE.Color(), hg: new THREE.Color(), hi: 1 };

    const sun = new THREE.DirectionalLight(0xffffff, 3);
    sun.castShadow = true;
    sun.shadow.mapSize.set(4096, 4096);
    const sc = sun.shadow.camera;
    sc.left = -158; sc.right = 158; sc.top = 158; sc.bottom = -158; sc.near = 10; sc.far = 900;
    sun.shadow.bias = -0.00035;
    sun.shadow.normalBias = 0.06;
    sun.shadow.radius = 2.5;
    world.add(sun, sun.target);
    this.sun = sun;
    this.hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
    world.add(this.hemi);
    world.fog = new THREE.FogExp2(0xffffff, 0.001);

    this.sunDir = new THREE.Vector3();
    this.moonDir = new THREE.Vector3();
    this.night = 0;
    this.lights = 0;
    this.sunAlt = 0;
    this.overColor = new THREE.Color();
  }
  setWeather(key) {
    if (!WEATHERS[key]) return;
    this.weatherKey = key;
    this.Wt = { aurora: 0, ...WEATHERS[key] };
  }
  // sun path for a mid-winter day: sunrise ~7:00, sunset ~17:00
  sunAt(h) {
    const alt = 34 * Math.sin(Math.PI * (h - 7) / 10);
    let altDeg;
    if (h >= 7 && h <= 17) altDeg = alt;
    else {
      // below horizon: dip smoothly down to -40 at midnight
      const hh = h < 7 ? h + 24 : h; // 17..31
      altDeg = -40 * Math.sin(Math.PI * (hh - 17) / 14);
    }
    const az = 180 + 62 * ((h - 12) / 5);
    return { alt: altDeg, az };
  }
  update(dt, t) {
    // weather blend
    const k = 1 - Math.exp(-dt * 0.9);
    for (const key of KEYS_W) this.W[key] = lerp(this.W[key] ?? 0, this.Wt[key] ?? 0, k);
    const W = this.W;

    const { alt, az } = this.sunAt(this.hour);
    this.sunAlt = alt;
    const ca = Math.cos(alt * DEG);
    this.sunDir.set(ca * Math.sin(az * DEG), Math.sin(alt * DEG), -ca * Math.cos(az * DEG)).normalize();
    // moon: high in the south-east → south-west during the night
    const mh = this.hour < 12 ? this.hour + 24 : this.hour; // 12..36
    const mt = clamp((mh - 18) / 12, 0, 1); // 18:00..06:00
    const mAlt = 18 + 34 * Math.sin(Math.PI * mt);
    const mAz = 120 + 120 * mt;
    const cm = Math.cos(mAlt * DEG);
    this.moonDir.set(cm * Math.sin(mAz * DEG), Math.sin(mAlt * DEG), -cm * Math.cos(mAz * DEG)).normalize();

    const s = this.s;
    sampleKeys(alt, s);
    const night = smoothstep(3, -7, alt);
    this.night = night;
    const day = 1 - night;
    // overcast color
    this.overColor.set('#9ea7b2').lerp(_c.set('#1a1d28'), night);
    if (alt > -3 && alt < 8) this.overColor.lerp(_c.set('#8d7f86'), 0.35 * (1 - Math.abs(alt - 2.5) / 6));
    const O = W.overcast;

    // sky dome
    const su = this.sky.u;
    su.uZen.value.copy(s.zen); su.uHor.value.copy(s.hor);
    su.uSunCol.value.copy(s.sun).multiplyScalar(1.0);
    su.uSunDir.value.copy(this.sunDir);
    su.uMoonDir.value.copy(this.moonDir);
    su.uOver.value.copy(this.overColor);
    su.uOvercast.value = O;
    su.uSunset.value = smoothstep(-6, 1, alt) * smoothstep(14, 3, alt);
    su.uStars.value = smoothstep(-5, -13, alt) * (1 - O);
    su.uMoon.value = smoothstep(-2, -9, alt);
    su.uTime.value = t;
    su.uAurora.value = (W.aurora || 0) * smoothstep(-4, -12, alt);

    // lightning
    this.flash = Math.max(0, this.flash - dt * 6);
    su.uFlash.value = this.flash * 0.6;

    // main directional light: sun by day, moon by night (cross-fade through dusk)
    const sunI = s.si * W.sun;
    const moonI = night * 0.7 * (1 - O * 0.85);
    let dir, colr, inten;
    if (alt > -1.5) { dir = this.sunDir; colr = s.sun; inten = sunI * smoothstep(-1.5, 1.5, alt); }
    else { dir = this.moonDir; colr = _c.set('#9fb5ff'); inten = moonI * smoothstep(-1.5, -6, alt); }
    this.sun.position.set(GLOBE.cx, 0, GLOBE.cz).addScaledVector(dir, 420);
    this.sun.target.position.set(GLOBE.cx, 0, GLOBE.cz);
    this.sun.color.copy(colr);
    this.sun.intensity = inten + this.flash * 2.5;
    this.sun.castShadow = inten > 0.02;

    // ambient
    const hemiSky = _c.copy(s.hs).lerp(this.overColor, O * 0.6);
    this.hemi.color.copy(hemiSky);
    this.hemi.groundColor.copy(s.hg).lerp(this.overColor, O * 0.4);
    this.hemi.intensity = s.hi * (1 - O * 0.12) + this.flash * 3.5;

    // fog
    const fogC = this.world.fog.color;
    fogC.copy(s.hor).lerp(this.overColor, 0.35 + O * 0.5).lerp(s.zen, 0.15).multiplyScalar(1 - O * 0.22);
    this.world.fog.density = W.fog;

    // water reflects the sky
    U.uSkyRefl.value.copy(s.hor).lerp(s.zen, 0.35).lerp(this.overColor, O * 0.6).multiplyScalar(0.55);

    // night lights
    const lights = clamp(Math.max(night, W.dark * smoothstep(-5, 25, alt) + night * 0.0), 0, 1);
    this.lights = lights;
    U.uGlow.value = 0.04 + lights * 1.55;
    U.uNeon.value = 0.32 + lights * 1.7;
    U.uCastle.value = smoothstep(0.35, 0.95, lights) * 0.55;
    U.uIce.value = 0.1 + lights * 0.75;
    U.uWet.value = lerp(U.uWet.value, W.wet, 1 - Math.exp(-dt * 0.4));
    // snow accumulation (slow, only while it actually snows or rains)
    if (this.autoAccum) {
      const tgt = SNOW_TARGET[this.weatherKey];
      if (tgt !== undefined) {
        const rate = Math.abs(W.accum) + 0.0004;
        const d = tgt - U.uSnow.value;
        U.uSnow.value += Math.sign(d) * Math.min(Math.abs(d), rate * dt);
      }
    }
    // castle tint cycles at night
    const ph = t * 0.12;
    U.uCastleTint.value.setHSL((0.78 + 0.14 * Math.sin(ph) + 0.06 * Math.sin(ph * 2.3)) % 1, 0.6, 0.55);
  }
}
