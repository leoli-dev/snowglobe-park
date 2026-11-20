// Orbit camera with continuous zoom from "whole globe on the table" down to
// street level, zoom-to-cursor, panning, pinch, double-click fly-to.
import * as THREE from 'three';
import { GLOBE, clamp, lerp, smoothstep } from '../core/config.js';

const HOME = new THREE.Vector3(GLOBE.cx, 12, GLOBE.cz);
const ease = (t) => t * t * t * (t * (t * 6 - 15) + 10);
const wrapAngle = (a) => Math.atan2(Math.sin(a), Math.cos(a));

export class GlobeControls {
  constructor(camera, dom, { groundAt, pick }) {
    this.camera = camera;
    this.dom = dom;
    this.groundAt = groundAt;
    this.pick = pick; // (ndcX, ndcY) -> Vector3 | null
    this.target = HOME.clone();
    this.yaw = 0.0; this.pitch = 0.14; this.dist = GlobeControls.homeDist(camera.aspect);
    this.g = { target: this.target.clone(), yaw: this.yaw, pitch: this.pitch, dist: this.dist };
    this.minDist = 1.6; this.maxDist = 1700;
    this.minPitchMini = null; // set by miniature mode
    this.flight = null;
    this.enabled = true;
    this.idle = 0;
    this.autoRotate = true;
    this.pointers = new Map();
    this.onUserInput = null;
    this._bind();
  }
  get home() { return HOME; }
  static homeDist(aspect) { return Math.max(760, 400 / (0.611 * Math.max(aspect, 0.3))); }

  _bind() {
    const el = this.dom;
    el.addEventListener('contextmenu', (e) => e.preventDefault());
    el.addEventListener('pointerdown', (e) => this._down(e));
    el.addEventListener('pointermove', (e) => this._move(e));
    el.addEventListener('pointerup', (e) => this._up(e));
    el.addEventListener('pointercancel', (e) => this._up(e));
    el.addEventListener('wheel', (e) => this._wheel(e), { passive: false });
    el.addEventListener('dblclick', (e) => this._dbl(e));
    window.addEventListener('keydown', (e) => this._key(e));
  }
  _touchInput() { this.idle = 0; this.flight = null; if (this.onUserInput) this.onUserInput(); }
  _ndc(e) {
    const r = this.dom.getBoundingClientRect();
    return [((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1];
  }
  _down(e) {
    if (!this.enabled) return;
    this.dom.setPointerCapture?.(e.pointerId);
    this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY, button: e.button, shift: e.shiftKey || e.ctrlKey || e.metaKey });
    this._touchInput();
    this.downAt = { x: e.clientX, y: e.clientY, t: performance.now() };
  }
  _up(e) {
    this.pointers.delete(e.pointerId);
    this.pinch = null;
  }
  _move(e) {
    const p = this.pointers.get(e.pointerId);
    if (!p || !this.enabled) return;
    const dx = e.clientX - p.x, dy = e.clientY - p.y;
    p.x = e.clientX; p.y = e.clientY;
    this._touchInput();
    if (this.pointers.size >= 2) {
      const pts = [...this.pointers.values()];
      const a = pts[0], b = pts[1];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      if (this.pinch) {
        const ratio = this.pinch.d / Math.max(d, 1);
        this.zoomBy(ratio, null);
        this.pan((mx - this.pinch.mx) * 0.5, (my - this.pinch.my) * 0.5);
      }
      this.pinch = { d, mx, my };
      return;
    }
    if (p.button === 2 || p.button === 1 || p.shift) this.pan(dx, dy);
    else this.rotate(dx, dy);
  }
  rotate(dx, dy) {
    const s = this.dist < 30 ? 0.0042 : 0.0055;
    this.g.yaw -= dx * s;
    this.g.pitch += dy * s * 0.85;
  }
  pan(dx, dy) {
    const k = this.g.dist * 0.0016;
    const cy = Math.cos(this.yaw), sy = Math.sin(this.yaw);
    // camera right = (cos, 0, -sin), forward on ground = (-sin, 0, -cos)
    this.g.target.x += (-dx * cy - dy * sy) * k;
    this.g.target.z += (dx * sy - dy * cy) * k;
  }
  zoomBy(factor, cursorNdc) {
    const old = this.g.dist;
    const nd = clamp(old * factor, this.minDist, this.maxDist);
    if (cursorNdc && factor < 1) {
      const hit = this.pick(cursorNdc[0], cursorNdc[1]);
      if (hit) {
        const w = (1 - nd / old) * 0.92;
        this.g.target.lerp(hit, w);
      }
    }
    this.g.dist = nd;
  }
  _wheel(e) {
    if (!this.enabled) return;
    e.preventDefault();
    this._touchInput();
    let dy = e.deltaY;
    if (e.deltaMode === 1) dy *= 16;
    if (e.ctrlKey) dy *= 2.5; // trackpad pinch
    dy = clamp(dy, -240, 240);
    this.zoomBy(Math.exp(dy * 0.0016), this._ndc(e));
  }
  _dbl(e) {
    if (!this.enabled) return;
    const hit = this.pick(...this._ndc(e));
    if (hit) this.flyTo({ target: hit, dist: clamp(this.g.dist * 0.32, 7, 70) });
  }
  _key(e) {
    if (!this.enabled || e.target.closest?.('input,textarea,select')) return;
    const k = e.key;
    const step = 22;
    let used = true;
    if (k === 'ArrowLeft' || k === 'q') this.g.yaw += 0.12;
    else if (k === 'ArrowRight' || k === 'e') this.g.yaw -= 0.12;
    else if (k === 'ArrowUp') this.g.pitch += 0.08;
    else if (k === 'ArrowDown') this.g.pitch -= 0.08;
    else if (k === 'w') this.pan(0, step);
    else if (k === 's') this.pan(0, -step);
    else if (k === 'a') this.pan(step, 0);
    else if (k === 'd') this.pan(-step, 0);
    else if (k === '=' || k === '+') this.zoomBy(0.8, null);
    else if (k === '-' || k === '_') this.zoomBy(1.25, null);
    else used = false;
    if (used) this._touchInput();
  }

  // zoom slider: 0 = farthest, 1 = closest (logarithmic)
  get zoom01() { return (Math.log(this.maxDist) - Math.log(this.g.dist)) / (Math.log(this.maxDist) - Math.log(this.minDist)); }
  setZoom01(z) {
    const d = Math.exp(lerp(Math.log(this.maxDist), Math.log(this.minDist), clamp(z, 0, 1)));
    this.g.dist = d;
    this._touchInput();
  }

  flyTo({ target, dist, yaw, pitch, duration }) {
    const t0 = this.target.clone(), t1 = (target || this.g.target).clone();
    const d0 = this.dist, d1 = clamp(dist ?? this.g.dist, this.minDist, this.maxDist);
    const y0 = this.yaw, y1 = yaw ?? this.yaw;
    const p0 = this.pitch, p1 = pitch ?? clamp(this.pitch, 0.18, 1.2);
    const travel = t0.distanceTo(t1);
    const hop = Math.log(1 + travel / Math.max(Math.min(d0, d1), 5)) * 0.42;
    const dur = duration ?? clamp(1.4 + Math.abs(Math.log(d1 / d0)) * 0.25 + travel / 180, 1.4, 3.6);
    this.flight = { t0, t1, d0, d1, y0, y1: y0 + wrapAngle(y1 - y0), p0, p1, hop, dur, t: 0 };
    this.g.target.copy(t1); this.g.dist = d1; this.g.yaw = this.flight.y1; this.g.pitch = p1;
  }

  update(dt) {
    this.idle += dt;
    const g = this.g;
    if (this.flight) {
      const f = this.flight;
      f.t += dt / f.dur;
      const e = ease(Math.min(f.t, 1));
      this.target.lerpVectors(f.t0, f.t1, e);
      this.dist = Math.exp(lerp(Math.log(f.d0), Math.log(f.d1), e) + f.hop * Math.sin(Math.PI * e));
      this.yaw = lerp(f.y0, f.y1, e);
      this.pitch = lerp(f.p0, f.p1, e);
      if (f.t >= 1) this.flight = null;
    } else {
      if (this.autoRotate && this.idle > 30 && g.dist > 280) g.yaw += dt * 0.045;
      // constraints on goals
      g.dist = clamp(g.dist, this.minDist, this.maxDist);
      const far = smoothstep(200, 470, g.dist);
      if (far > 0) g.target.lerp(HOME, 1 - Math.exp(-dt * 3.0 * far));
      const rr = Math.hypot(g.target.x, g.target.z);
      if (rr > 142) { g.target.x *= 142 / rr; g.target.z *= 142 / rr; }
      const gy = this.groundAt(g.target.x, g.target.z);
      g.target.y = clamp(g.target.y, gy, 95);
      const pMin = this.minPitchMini ?? lerp(-0.08, -0.32, smoothstep(250, 500, g.dist));
      const pMax = this.maxPitchMini ?? 1.5;
      g.pitch = clamp(g.pitch, pMin, pMax);
      const k = 1 - Math.exp(-dt * 9);
      this.target.lerp(g.target, k);
      this.dist = Math.exp(lerp(Math.log(this.dist), Math.log(g.dist), k));
      this.yaw = lerp(this.yaw, g.yaw, k);
      this.pitch = lerp(this.pitch, g.pitch, k);
    }
    // place camera
    const cp = Math.cos(this.pitch);
    const cam = this.camera;
    cam.position.set(
      this.target.x + this.dist * cp * Math.sin(this.yaw),
      this.target.y + this.dist * Math.sin(this.pitch),
      this.target.z + this.dist * cp * Math.cos(this.yaw)
    );
    // keep above ground (inside the globe) and above the table (outside)
    const insideR = cam.position.distanceTo(new THREE.Vector3(GLOBE.cx, GLOBE.cy, GLOBE.cz));
    let floor;
    if (insideR < GLOBE.R + 2) floor = this.groundAt(cam.position.x, cam.position.z) + 0.55;
    else floor = -90;
    if (cam.position.y < floor) {
      const need = clamp((floor - this.target.y) / this.dist, -1, 1);
      this.pitch = Math.asin(need);
      if (!this.flight) this.g.pitch = Math.max(this.g.pitch, this.pitch);
      const cp2 = Math.cos(this.pitch);
      cam.position.set(
        this.target.x + this.dist * cp2 * Math.sin(this.yaw),
        floor,
        this.target.z + this.dist * cp2 * Math.cos(this.yaw)
      );
    }
    cam.lookAt(this.target);
    // dynamic clipping planes for the huge zoom range
    const d = this.dist;
    cam.near = clamp(d * 0.01, 0.03, 3);
    cam.far = clamp(d * 4 + 1800, 2200, 7000);
    cam.updateProjectionMatrix();
  }
}
