// UI controller: time & weather dock, zoom rail, guide, labels, miniature
// photo mode, sounds, keyboard shortcuts and scheduled shows.
import * as THREE from 'three';
import { U } from '../core/materials.js';
import { WEATHERS } from '../env/atmos.js';
import { Labels } from './labels.js';
import { Photo } from './photo.js';
import { Sound } from '../audio/music.js';

const $ = (id) => document.getElementById(id);
const LAND_ORDER = ['城堡', '美国小镇大街', '探险世界', '边域世界', '自由广场', '梦幻世界', '米奇卡通城', '玩具总动员乐园', '明日世界', '乐园环线', '天空'];
const WX_TOAST = { clear: '晴空万里', cloudy: '云朵飘进了玻璃球', snow: '下起了小雪', blizzard: '暴风雪来了，积雪会越来越厚', rain: '下雨了，地面会变得湿亮', storm: '雷雨交加', fog: '起雾了', aurora: '极光夜（夜晚时出现在球顶）' };

function phaseName(h) {
  if (h < 5) return '深夜';
  if (h < 6.8) return '黎明';
  if (h < 8.5) return '清晨';
  if (h < 11.5) return '上午';
  if (h < 13) return '正午';
  if (h < 16) return '下午';
  if (h < 17.6) return '黄昏';
  if (h < 19.5) return '傍晚';
  return '夜晚';
}
const fmt = (h) => `${String(Math.floor(h)).padStart(2, '0')}:${String(Math.floor((h % 1) * 60)).padStart(2, '0')}`;

export class UI {
  constructor(app) {
    this.app = app;
    this.sound = new Sound();
    $('ui').hidden = false;
    const toastEl = $('toast');
    let tt = null;
    this.toast = (msg) => {
      toastEl.textContent = msg;
      toastEl.classList.add('show');
      clearTimeout(tt);
      tt = setTimeout(() => toastEl.classList.remove('show'), 2600);
    };
    this.photo = new Photo(app, this.toast, this.sound);
    this.labels = new Labels(app, app.park.pois, (p) => this.goto(p));
    this.bindTime();
    this.bindWeather();
    this.bindActions();
    this.bindRail();
    this.bindGuide();
    this.bindKeys();
    app.controls.onUserInput = () => {
      if (this.follow) this.follow = null;
      $('hint').classList.add('gone');
    };
    // sounds hooked to effects
    app.weather.onThunder = (d) => this.sound.thunder(d);
    app.fireworks.onBoom = (dist, big) => this.sound.boom(dist, big);
    app.fireworks.onLaunch = () => this.sound.launch();
    this.lastHour = app.atmos.hour;
    this.shakeT = 9;
    setTimeout(() => $('hint').classList.add('gone'), 12000);
  }

  // ---------- time ----------
  bindTime() {
    const app = this.app;
    const hour = $('hour');
    hour.addEventListener('input', () => { app.atmos.hour = (+hour.value / 60) % 24; app.timeHold = true; });
    hour.addEventListener('change', () => { app.timeHold = false; });
    hour.addEventListener('pointerup', () => { app.timeHold = false; });
    $('playBtn').addEventListener('click', () => this.setPlaying(!app.playing));
    $('speed').addEventListener('change', (e) => { app.timeRate = 1 / +e.target.value; });
    app.timeRate = 1 / +$('speed').value;
  }
  setPlaying(on) {
    const app = this.app;
    app.playing = on;
    $('playIcon').innerHTML = on ? '<path d="M8 5v14M16 5v14"/>' : '<path d="M7 4.5l12 7.5-12 7.5z"/>';
    $('playBtn').title = on ? '暂停时间流逝' : '继续时间流逝';
    $('playBtn').setAttribute('aria-label', $('playBtn').title);
  }

  // ---------- weather ----------
  bindWeather() {
    const app = this.app;
    $('wx').addEventListener('click', (e) => {
      const b = e.target.closest('button[data-w]');
      if (!b) return;
      const k = b.dataset.w;
      app.setWeather(k);
      if (k === 'aurora' && app.atmos.night < 0.6) { app.atmos.hour = 22.5; }
      this.toast(WX_TOAST[k] || WEATHERS[k].name);
    });
    const snow = $('snowAmt');
    snow.addEventListener('input', () => { U.uSnow.value = +snow.value / 100; $('snowVal').textContent = snow.value + '%'; });
    $('autoAccum').addEventListener('change', (e) => { app.atmos.autoAccum = e.target.checked; });
  }
  syncWeather(k) {
    document.querySelectorAll('#wx button').forEach(b => b.classList.toggle('on', b.dataset.w === k));
  }

  // ---------- actions ----------
  bindActions() {
    const app = this.app;
    $('shakeBtn').addEventListener('click', () => this.shake());
    $('fireBtn').addEventListener('click', () => this.fireworks());
    $('paradeBtn').addEventListener('click', () => this.parade());
    $('musicBtn').addEventListener('click', () => {
      const on = this.sound.toggleMusic();
      app.music = on;
      $('musicBtn').setAttribute('aria-pressed', on ? 'true' : 'false');
      this.toast(on ? `音乐盒：${this.sound.songName}` : '音乐盒已停止');
    });
    $('miniBtn').addEventListener('click', () => this.photo.toggle());
    $('dockToggle').addEventListener('click', () => {
      const d = $('dock');
      const collapsed = d.classList.toggle('collapsed');
      $('dockToggle').setAttribute('aria-expanded', collapsed ? 'false' : 'true');
    });
    if (innerWidth < 720) { $('dock').classList.add('collapsed'); $('dockToggle').setAttribute('aria-expanded', 'false'); }
    // any first click unlocks audio for sound effects
    window.addEventListener('pointerdown', () => this.sound.ensure(), { once: true });
  }
  shake() {
    this.app.weather.shake(1);
    this.shakeT = 0;
    this.sound.shake();
    this.toast('哗啦——雪花和亮片在玻璃球里旋转');
  }
  fireworks() {
    const app = this.app;
    if (app.fireworks.running) { this.toast('烟花正在燃放中'); return; }
    if (app.atmos.night < 0.7) { app.atmos.hour = 20.9; this.toast('入夜了——城堡烟花表演即将开始'); }
    else this.toast('城堡烟花表演开始！');
    setTimeout(() => app.fireworks.startShow(), app.atmos.night < 0.7 ? 1500 : 200);
    if (app.controls.dist > 300 && !app.miniature) app.controls.flyTo({ target: new THREE.Vector3(0, 55, 10), dist: 330, pitch: 0.18, yaw: 0 });
  }
  parade() {
    const app = this.app;
    if (app.parade.running) { this.toast('巡游正在进行中'); return; }
    app.parade.start();
    this.toast('圣诞巡游从小镇广场出发啦');
    if (!app.miniature) app.controls.flyTo({ target: new THREE.Vector3(0, 2, 64), dist: 34, pitch: 0.42, yaw: 0.0 });
  }

  // ---------- zoom rail ----------
  bindRail() {
    const app = this.app, c = app.controls;
    const z = $('zoom');
    this.zoomDrag = false;
    z.addEventListener('input', () => { this.zoomDrag = true; c.setZoom01(+z.value / 1000); });
    z.addEventListener('change', () => { this.zoomDrag = false; });
    z.addEventListener('pointerup', () => { this.zoomDrag = false; });
    $('zoomIn').addEventListener('click', () => c.zoomBy(0.55, null));
    $('zoomOut').addEventListener('click', () => c.zoomBy(1.8, null));
    $('home').addEventListener('click', () => { this.follow = null; c.flyTo({ target: c.home.clone(), dist: this.homeDist(), pitch: 0.13, yaw: 0 }); });
    $('labelsBtn').addEventListener('click', () => {
      this.labels.enabled = !this.labels.enabled;
      $('labelsBtn').setAttribute('aria-pressed', this.labels.enabled ? 'true' : 'false');
      this.toast(this.labels.enabled ? '已显示名称标签（靠近时出现）' : '已隐藏名称标签');
    });
  }
  homeDist() { return Math.max(760, 400 / (0.611 * Math.max(this.app.camera.aspect, 0.3))); }

  // ---------- guide ----------
  bindGuide() {
    const pois = this.app.park.pois;
    this.tab = 'attraction';
    const countA = pois.filter(p => p.kind !== 'character').length;
    const countC = pois.filter(p => p.kind === 'character').length;
    $('countA').textContent = countA;
    $('countC').textContent = countC;
    const open = (on) => { $('guide').hidden = !on; $('guideBtn').setAttribute('aria-pressed', on ? 'true' : 'false'); if (on) this.renderGuide(); };
    $('guideBtn').addEventListener('click', () => open($('guide').hidden));
    $('guideClose').addEventListener('click', () => open(false));
    document.querySelectorAll('.tab').forEach(t => t.addEventListener('click', () => {
      this.tab = t.dataset.tab;
      document.querySelectorAll('.tab').forEach(x => x.classList.toggle('on', x === t));
      this.renderGuide();
    }));
    $('guideSearch').addEventListener('input', () => this.renderGuide());
    this.openGuide = open;
  }
  renderGuide() {
    const q = $('guideSearch').value.trim().toLowerCase();
    const pois = this.app.park.pois.filter(p => (this.tab === 'character' ? p.kind === 'character' : p.kind !== 'character'))
      .filter(p => !q || p.name.toLowerCase().includes(q) || (p.en || '').toLowerCase().includes(q) || (p.land || '').includes(q));
    const byLand = new Map();
    for (const p of pois) { const l = p.land || '其他'; if (!byLand.has(l)) byLand.set(l, []); byLand.get(l).push(p); }
    const lands = [...byLand.keys()].sort((a, b) => (LAND_ORDER.indexOf(a) + 99) % 99 - (LAND_ORDER.indexOf(b) + 99) % 99);
    const list = $('guideList');
    list.textContent = '';
    for (const l of lands) {
      const h = document.createElement('div'); h.className = 'g-land'; h.textContent = l; list.appendChild(h);
      const items = byLand.get(l).sort((a, b) => (b.group ? 1 : 0) - (a.group ? 1 : 0));
      for (const p of items) {
        const b = document.createElement('button'); b.className = 'g-item';
        const zh = document.createElement('span'); zh.className = 'zh'; zh.textContent = (p.group ? '◎ ' : '') + p.name;
        const en = document.createElement('span'); en.className = 'en'; en.textContent = p.en || '';
        b.append(zh, en);
        b.addEventListener('click', () => { this.goto(p); if (innerWidth < 720) this.openGuide(false); });
        list.appendChild(b);
      }
    }
    if (!pois.length) { const e = document.createElement('div'); e.className = 'g-land'; e.textContent = '没有找到匹配的名字'; list.appendChild(e); }
  }
  goto(p) {
    const c = this.app.controls;
    let target;
    if (p.follow) {
      target = new THREE.Vector3();
      p.follow.getWorldPosition(target);
      const o = p.followOffset || [0, 2, 0];
      target.add(new THREE.Vector3(o[0], o[1], o[2]));
      this.follow = p;
    } else { target = new THREE.Vector3(p.x, p.y, p.z); this.follow = null; }
    const dist = this.app.miniature ? Math.max(p.dist * 1.3, 22) : p.dist;
    c.flyTo({ target, dist, pitch: this.app.miniature ? Math.max(0.45, p.pitch ?? 0.3) : (p.pitch ?? 0.3), yaw: p.yaw ?? c.yaw });
    this.toast(`${p.name}${p.en ? ' · ' + p.en : ''}`);
  }

  // ---------- keyboard ----------
  bindKeys() {
    window.addEventListener('keydown', (e) => {
      if (e.target.closest?.('input[type=search],input[type=text],textarea,select')) return;
      const k = e.key.toLowerCase();
      if (k === ' ') { e.preventDefault(); if (this.app.miniature) this.photo.shoot(); else this.shake(); }
      else if (k === 'f') this.fireworks();
      else if (k === 'p') this.parade();
      else if (k === 'm') this.photo.toggle();
      else if (k === 'g') this.openGuide($('guide').hidden);
      else if (k === 'l') $('labelsBtn').click();
      else if (k === 'h') $('home').click();
      else if (k === 'escape') { if (!$('lightbox').hidden) $('lightbox').hidden = true; else if (this.app.miniature) this.photo.exit(); }
    });
  }

  // ---------- per frame ----------
  update(dt) {
    const app = this.app, atm = app.atmos;
    const h = atm.hour;
    // scheduled fireworks at 21:00
    if (this.lastHour < 21 && h >= 21 && !app.fireworks.running) { app.fireworks.startShow(); this.toast('21:00 城堡烟花表演开始'); }
    if (this.lastHour < 19.5 && h >= 19.5) this.toast('19:30 夜间电光巡游出发');
    if (this.lastHour < 14 && h >= 14) this.toast('14:00 圣诞巡游出发');
    this.lastHour = h;
    // time readout
    const t = fmt(h);
    if (t !== this._t) {
      this._t = t;
      $('timeBig').textContent = t;
      $('brandClock').textContent = t;
      $('timePhase').textContent = phaseName(h);
      $('sunmoon').classList.toggle('moon', atm.sunAlt < -2);
    }
    if (!app.timeHold) $('hour').value = Math.round(h * 60);
    // snow amount readout follows accumulation
    const sv = Math.round(U.uSnow.value * 100);
    if (sv !== this._sv) { this._sv = sv; $('snowAmt').value = sv; $('snowVal').textContent = sv + '%'; }
    if (!this.zoomDrag) $('zoom').value = Math.round(app.controls.zoom01 * 1000);
    // follow moving things (trains, Tinker Bell...)
    if (this.follow && !app.controls.flight) {
      const p = this.follow, v = new THREE.Vector3();
      p.follow.getWorldPosition(v);
      const o = p.followOffset || [0, 2, 0];
      v.x += o[0]; v.y += o[1]; v.z += o[2];
      app.controls.g.target.copy(v);
      app.controls.target.lerp(v, 0.25);
    }
    // globe shake wobble
    this.shakeT += dt;
    if (this.shakeT < 1.4) {
      const k = (1 - this.shakeT / 1.4);
      app.camera.position.x += Math.sin(this.shakeT * 38) * 2.2 * k * k * (app.controls.dist / 400);
      app.camera.position.y += Math.cos(this.shakeT * 31) * 1.4 * k * k * (app.controls.dist / 400);
    }
    this.labels.update();
  }
}
