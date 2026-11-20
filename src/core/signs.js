// Canvas-text signs (lit at night)
import * as THREE from 'three';
import { U } from './materials.js';

export const signMats = [];
export function makeSign(lines, { w = 8, h = 1.6, bg = '#1f3b2f', fg = '#f6e7b8', border = '#d9b45a', font = '"Songti SC","STSong",Georgia,serif', px = 512, glow = 0.7, weight = '700' } = {}) {
  const cw = px, ch = Math.round(px * h / w);
  const c = document.createElement('canvas'); c.width = cw; c.height = ch;
  const g = c.getContext('2d');
  g.fillStyle = bg; g.fillRect(0, 0, cw, ch);
  if (border) { g.strokeStyle = border; g.lineWidth = Math.max(3, ch * 0.06); g.strokeRect(g.lineWidth / 2, g.lineWidth / 2, cw - g.lineWidth, ch - g.lineWidth); }
  g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle';
  const arr = Array.isArray(lines) ? lines : [lines];
  arr.forEach((ln, i) => {
    const size = (i === 0 ? 0.52 : 0.28) * ch / Math.max(1, arr.length * 0.8);
    g.font = `${i === 0 ? weight : '400'} ${size}px ${font}`;
    const y = ch * (arr.length === 1 ? 0.53 : (i === 0 ? 0.42 : 0.78));
    let s = size;
    while (g.measureText(ln).width > cw * 0.9 && s > 8) { s *= 0.92; g.font = `${i === 0 ? weight : '400'} ${s}px ${font}`; }
    g.fillText(ln, cw / 2, y);
  });
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  const m = new THREE.MeshStandardMaterial({ map: t, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: 0, roughness: 0.6 });
  m.userData.glow = glow;
  signMats.push(m);
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
  return mesh;
}
export function updateSigns() {
  const g = U.uGlow.value;
  for (const m of signMats) m.emissiveIntensity = 0.05 + Math.min(g, 3.4) * 0.18 * m.userData.glow;
}
