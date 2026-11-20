// Floating name tags for attractions and characters (HTML overlay).
import * as THREE from 'three';

const v = new THREE.Vector3();
export class Labels {
  constructor(app, pois, onPick) {
    this.app = app;
    this.root = document.getElementById('labels');
    this.enabled = true;
    this.items = pois.filter(p => !p.group).map(p => {
      const el = document.createElement('div');
      el.className = 'lbl' + (p.kind === 'character' ? ' ch' : '');
      el.textContent = p.name;
      el.style.opacity = '0';
      el.addEventListener('click', (e) => { e.stopPropagation(); onPick(p); });
      this.root.appendChild(el);
      return { p, el, on: false };
    });
  }
  pos(p, out) {
    if (p.follow) {
      p.follow.getWorldPosition(out);
      const o = p.followOffset || [0, 2, 0];
      out.x += o[0]; out.y += o[1] + 1.5; out.z += o[2];
      return out;
    }
    return out.set(p.x, p.labelY ?? (p.y + (p.kind === 'character' ? 1.2 : 6)), p.z);
  }
  update() {
    const app = this.app, cam = app.camera;
    const W = innerWidth, H = innerHeight;
    const show = this.enabled && !app.miniature && app.ready;
    const camPos = cam.position;
    const list = [];
    for (const it of this.items) {
      if (!show) { if (it.on) { it.el.style.opacity = '0'; it.on = false; } continue; }
      this.pos(it.p, v);
      const d = v.distanceTo(camPos);
      const range = it.p.kind === 'character' ? 34 : 150;
      const near = it.p.kind === 'character' ? 1.5 : 8;
      let vis = d < range && d > near;
      if (vis) {
        v.project(cam);
        vis = v.z < 1 && v.x > -1.05 && v.x < 1.05 && v.y > -1.05 && v.y < 1.1;
        if (vis) list.push({ it, d, x: (v.x * 0.5 + 0.5) * W, y: (-v.y * 0.5 + 0.5) * H, range });
      }
      if (!vis && it.on) { it.el.style.opacity = '0'; it.on = false; it.el.style.pointerEvents = 'none'; }
    }
    list.sort((a, b) => a.d - b.d);
    const placed = [];
    list.forEach((o, i) => {
      const { it } = o;
      const w = (it.w ||= it.el.offsetWidth || 60), hgt = 20;
      const x0 = o.x - w / 2, y0 = o.y - hgt;
      let clash = false;
      for (const r of placed) if (x0 < r[2] && x0 + w > r[0] && y0 < r[3] && y0 + hgt > r[1]) { clash = true; break; }
      if (i > 28 || clash) { if (it.on) { it.el.style.opacity = '0'; it.on = false; it.el.style.pointerEvents = 'none'; } return; }
      placed.push([x0 - 4, y0 - 2, x0 + w + 4, y0 + hgt + 2]);
      it.el.style.transform = `translate(${o.x.toFixed(1)}px, ${o.y.toFixed(1)}px) translate(-50%, -100%)`;
      const fade = Math.min(1, (1 - o.d / o.range) * 3);
      it.el.style.opacity = fade.toFixed(2);
      it.el.style.pointerEvents = fade > 0.3 ? 'auto' : 'none';
      it.on = true;
    });
  }
}
