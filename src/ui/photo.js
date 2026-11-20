// Miniature (tilt-shift) photo mode: lens blur band, punchy toy colors,
// sped-up life, shutter with flash, date stamp, gallery and saving.
import * as THREE from 'three';
import { clamp } from '../core/config.js';

const $ = (id) => document.getElementById(id);

export class Photo {
  constructor(app, toast, sfx) {
    this.app = app;
    this.toast = toast;
    this.sfx = sfx;
    this.photos = [];
    this.downloads = null;
    // the artifact viewer offers saving through the downloads capability
    try {
      if (window.claude && typeof window.claude.use === 'function') {
        window.claude.use('downloads').then((d) => { this.downloads = d; }).catch(() => {});
      }
    } catch (e) { /* not inside a viewer */ }
    this.params = { focus: 0.52, band: 0.14, blur: 16, sat: 1.32, speed: 2 };
    const bind = (id, key, f) => {
      const el = $(id);
      el.addEventListener('input', () => { this.params[key] = f(+el.value); this.apply(); });
    };
    bind('tFocus', 'focus', v => v / 100);
    bind('tBand', 'band', v => v / 100);
    bind('tBlur', 'blur', v => v);
    bind('tSat', 'sat', v => v / 100);
    bind('tSpeed', 'speed', v => v);
    $('miniExit').addEventListener('click', () => this.exit());
    $('shutter').addEventListener('click', () => this.shoot());
    $('lbClose').addEventListener('click', () => { $('lightbox').hidden = true; });
    $('lightbox').addEventListener('click', (e) => { if (e.target.id === 'lightbox') $('lightbox').hidden = true; });
    $('lbSave').addEventListener('click', () => this.save(this.current));
    // drag the focus band directly
    const handle = $('bandHandle');
    let dragging = false;
    handle.addEventListener('pointerdown', (e) => { dragging = true; handle.setPointerCapture(e.pointerId); e.stopPropagation(); });
    handle.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const f = clamp(e.clientY / innerHeight, 0.15, 0.85);
      this.params.focus = 1 - f;
      $('tFocus').value = Math.round((1 - f) * 100);
      this.apply();
    });
    handle.addEventListener('pointerup', () => { dragging = false; });
  }
  apply() {
    const P = this.params, post = this.app.post;
    post.tilt.uniforms.uFocus.value = P.focus;
    post.tilt.uniforms.uBand.value = P.band;
    post.tilt.uniforms.uBlur.value = P.blur;
    post.grade.uniforms.uSat.value = this.app.miniature ? P.sat : 1.06;
    post.grade.uniforms.uContrast.value = this.app.miniature ? 1.12 : 1.03;
    post.grade.uniforms.uVig.value = this.app.miniature ? 0.55 : 0.35;
    post.grade.uniforms.uWarm.value = this.app.miniature ? 1 : 0;
    if (this.app.miniature) this.app.speed = P.speed;
    const band = $('band');
    const top = (1 - P.focus) - P.band / 2;
    band.style.top = (top * 100).toFixed(2) + '%';
    band.style.height = (P.band * 100).toFixed(2) + '%';
  }
  enter() {
    const app = this.app, c = app.controls;
    if (app.miniature) return;
    app.miniature = true;
    document.body.classList.add('mini-on');
    $('mini').hidden = false;
    $('miniBtn').setAttribute('aria-pressed', 'true');
    app.post.tilt.enabled = true;
    c.minPitchMini = 0.3;
    c.maxPitchMini = 1.35;
    c.maxDist = 240;
    // pick a classic high-angle view if we are far away or too low
    if (c.dist > 200 || c.pitch < 0.3) {
      const t = c.dist > 200 ? new THREE.Vector3(0, 4, 40) : c.target.clone();
      c.flyTo({ target: t, dist: c.dist > 200 ? 95 : Math.max(c.dist, 45), pitch: 0.62, yaw: c.dist > 200 ? 0.35 : c.yaw });
    }
    this.apply();
    this.toast('缩微摄影：拖动画面取景，按快门拍照（空格也可）');
  }
  exit() {
    const app = this.app, c = app.controls;
    if (!app.miniature) return;
    app.miniature = false;
    document.body.classList.remove('mini-on');
    $('mini').hidden = true;
    $('miniBtn').setAttribute('aria-pressed', 'false');
    app.post.tilt.enabled = false;
    c.minPitchMini = null; c.maxPitchMini = null; c.maxDist = 1700;
    app.speed = 1;
    this.apply();
  }
  toggle() { this.app.miniature ? this.exit() : this.enter(); }
  shoot() {
    if ($('tTimer').checked) {
      let n = 3;
      const cd = $('countdown');
      cd.hidden = false; cd.textContent = n;
      const iv = setInterval(() => {
        n--;
        if (n <= 0) { clearInterval(iv); cd.hidden = true; this.capture(); }
        else cd.textContent = n;
      }, 1000);
      return;
    }
    this.capture();
  }
  capture() {
    const app = this.app;
    app.captureNext = (canvas) => {
      const w = canvas.width, h = canvas.height;
      const out = document.createElement('canvas');
      out.width = w; out.height = h;
      const g = out.getContext('2d');
      g.drawImage(canvas, 0, 0);
      if ($('tStamp').checked) {
        const hh = app.atmos.hour;
        const txt = `'26 12 25  ${String(Math.floor(hh)).padStart(2, '0')}:${String(Math.floor((hh % 1) * 60)).padStart(2, '0')}`;
        const fs = Math.round(h * 0.034);
        g.font = `bold ${fs}px "Courier New", monospace`;
        g.textAlign = 'right'; g.textBaseline = 'bottom';
        g.shadowColor = 'rgba(255,120,30,0.9)'; g.shadowBlur = fs * 0.5;
        g.fillStyle = '#ffa646';
        g.fillText(txt, w - fs * 1.2, h - fs * 0.9);
        g.shadowBlur = 0;
      }
      out.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const shot = { blob, url, name: `snowglobe-${Date.now()}.jpg` };
        this.photos.unshift(shot);
        this.renderGallery();
        this.toast('已拍下一张缩微照片，点缩略图查看与保存');
      }, 'image/jpeg', 0.93);
    };
    const fl = $('flash');
    fl.classList.remove('go'); void fl.offsetWidth; fl.classList.add('go');
    this.sfx?.shutter();
  }
  renderGallery() {
    const g = $('gallery');
    g.textContent = '';
    for (const p of this.photos.slice(0, 10)) {
      const b = document.createElement('button');
      b.title = '查看照片';
      const img = document.createElement('img');
      img.src = p.url; img.alt = '缩微照片';
      b.appendChild(img);
      b.addEventListener('click', () => this.open(p));
      g.appendChild(b);
    }
  }
  open(p) {
    this.current = p;
    const wrap = $('lbImgWrap');
    wrap.textContent = '';
    const img = document.createElement('img');
    img.src = p.url; img.alt = '缩微照片';
    wrap.appendChild(img);
    $('lbNote').textContent = '';
    $('lightbox').hidden = false;
  }
  async save(p) {
    if (!p) return;
    const note = $('lbNote');
    if (this.downloads) {
      try {
        await this.downloads.save({ filename: p.name, data: p.blob });
        note.textContent = '已保存。';
      } catch (e) {
        note.textContent = e && e.code === 'declined' ? '已取消保存。' : '这里无法直接保存，可以右键图片“另存为”。';
      }
      return;
    }
    const a = document.createElement('a');
    a.href = p.url; a.download = p.name;
    document.body.appendChild(a); a.click(); a.remove();
    note.textContent = '已开始下载。如果没有反应，可以右键图片“另存为”。';
  }
}
