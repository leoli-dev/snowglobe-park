// Music box (public-domain carols synthesized with WebAudio) + sound effects.
const NOTE = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 };
const freq = (n) => {
  const m = /^([A-G]#?)(\d)$/.exec(n);
  if (!m) return 0;
  const midi = 12 * (+m[2] + 1) + NOTE[m[1]];
  return 440 * Math.pow(2, (midi - 69) / 12);
};
const parse = (s) => s.trim().split(/\s+/).map(tok => { const [n, d] = tok.split(':'); return [n, +d]; });

const SONGS = [
  { name: 'Jingle Bells', bpm: 118, notes: parse(`
    E5:1 E5:1 E5:2 E5:1 E5:1 E5:2 E5:1 G5:1 C5:1.5 D5:0.5 E5:4
    F5:1 F5:1 F5:1.5 F5:0.5 F5:1 E5:1 E5:1 E5:0.5 E5:0.5 E5:1 D5:1 D5:1 E5:1 D5:2 G5:2
    E5:1 E5:1 E5:2 E5:1 E5:1 E5:2 E5:1 G5:1 C5:1.5 D5:0.5 E5:4
    F5:1 F5:1 F5:1.5 F5:0.5 F5:1 E5:1 E5:1 E5:0.5 E5:0.5 G5:1 G5:1 F5:1 D5:1 C5:4 R:2`) },
  { name: 'We Wish You a Merry Christmas', bpm: 150, notes: parse(`
    D5:1 G5:1 G5:0.5 A5:0.5 G5:0.5 F#5:0.5 E5:1 E5:1 E5:1 A5:1 A5:0.5 B5:0.5 A5:0.5 G5:0.5 F#5:1 D5:1 D5:1
    B5:1 B5:0.5 C6:0.5 B5:0.5 A5:0.5 G5:1 E5:1 D5:0.5 D5:0.5 E5:1 A5:1 F#5:1 G5:3 R:2`) },
  { name: 'Silent Night', bpm: 96, notes: parse(`
    G5:1.5 A5:0.5 G5:1 E5:3 G5:1.5 A5:0.5 G5:1 E5:3 D6:2 D6:1 B5:3 C6:2 C6:1 G5:3
    A5:2 A5:1 C6:1.5 B5:0.5 A5:1 G5:1.5 A5:0.5 G5:1 E5:3 A5:2 A5:1 C6:1.5 B5:0.5 A5:1 G5:1.5 A5:0.5 G5:1 E5:3
    D6:2 D6:1 F6:1.5 D6:0.5 B5:1 C6:3 E6:3 C6:1 G5:1 E5:1 G5:1.5 F5:0.5 D5:1 C5:4 R:2`) },
];

export class Sound {
  constructor() {
    this.ctx = null;
    this.musicOn = false;
    this.songIdx = 0;
    this.noteIdx = 0;
    this.nextTime = 0;
    this.timer = null;
  }
  ensure() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return this.ctx; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    const ctx = this.ctx = new AC();
    this.master = ctx.createGain(); this.master.gain.value = 0.55; this.master.connect(ctx.destination);
    // small hall reverb
    const len = ctx.sampleRate * 2.4;
    const ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2); }
    this.verb = ctx.createConvolver(); this.verb.buffer = ir;
    this.wet = ctx.createGain(); this.wet.gain.value = 0.32;
    this.verb.connect(this.wet); this.wet.connect(this.master);
    this.musicBus = ctx.createGain(); this.musicBus.gain.value = 0.9;
    this.musicBus.connect(this.master); this.musicBus.connect(this.verb);
    this.sfxBus = ctx.createGain(); this.sfxBus.gain.value = 0.8;
    this.sfxBus.connect(this.master); this.sfxBus.connect(this.verb);
    this.noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const nd = this.noise.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    return ctx;
  }
  pluck(f, t, vel = 0.22) {
    const ctx = this.ctx;
    const out = ctx.createGain();
    out.gain.setValueAtTime(0.0001, t);
    out.gain.exponentialRampToValueAtTime(vel, t + 0.004);
    out.gain.exponentialRampToValueAtTime(0.0006, t + 2.4);
    out.connect(this.musicBus);
    for (const [mul, g, dec] of [[1, 1, 2.4], [2, 0.28, 0.9], [4.02, 0.09, 0.25], [6.3, 0.03, 0.12]]) {
      if (f * mul > 16000) continue;
      const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f * mul;
      const gg = ctx.createGain(); gg.gain.setValueAtTime(g, t); gg.gain.exponentialRampToValueAtTime(0.0005, t + dec);
      o.connect(gg); gg.connect(out); o.start(t); o.stop(t + dec + 0.05);
    }
  }
  schedule() {
    const ctx = this.ctx;
    while (this.nextTime < ctx.currentTime + 0.25) {
      const song = SONGS[this.songIdx];
      const [n, beats] = song.notes[this.noteIdx];
      const dur = beats * 60 / song.bpm;
      if (n !== 'R') {
        this.pluck(freq(n), this.nextTime, 0.2 + Math.random() * 0.04);
        // music-box comb: a soft low fifth on strong beats
        if (this.noteIdx % 4 === 0) this.pluck(freq(n) / 2, this.nextTime, 0.07);
      }
      this.nextTime += dur * (0.98 + Math.random() * 0.04);
      this.noteIdx++;
      if (this.noteIdx >= song.notes.length) { this.noteIdx = 0; this.songIdx = (this.songIdx + 1) % SONGS.length; this.nextTime += 0.8; }
    }
  }
  toggleMusic() {
    if (!this.ensure()) return false;
    this.musicOn = !this.musicOn;
    if (this.musicOn) {
      this.nextTime = this.ctx.currentTime + 0.1;
      this.timer = setInterval(() => this.schedule(), 90);
    } else { clearInterval(this.timer); this.timer = null; }
    return this.musicOn;
  }
  get songName() { return SONGS[this.songIdx].name; }
  noiseHit({ dur = 1, f0 = 800, f1 = 200, q = 0.7, gain = 0.4, type = 'lowpass', delay = 0 }) {
    const ctx = this.ctx; if (!ctx || ctx.state !== 'running') return;
    const t = ctx.currentTime + delay;
    const src = ctx.createBufferSource(); src.buffer = this.noise;
    const flt = ctx.createBiquadFilter(); flt.type = type; flt.Q.value = q;
    flt.frequency.setValueAtTime(f0, t); flt.frequency.exponentialRampToValueAtTime(Math.max(30, f1), t + dur);
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0005, t + dur);
    src.connect(flt); flt.connect(g); g.connect(this.sfxBus);
    src.start(t, Math.random() * 0.8); src.stop(t + dur + 0.05);
  }
  shutter() { if (!this.ensure()) return; this.noiseHit({ dur: 0.07, f0: 6000, f1: 2500, type: 'bandpass', gain: 0.5 }); this.noiseHit({ dur: 0.05, f0: 3000, f1: 1500, type: 'bandpass', gain: 0.35, delay: 0.09 }); }
  shake() { if (!this.ensure()) return; this.noiseHit({ dur: 1.4, f0: 400, f1: 2400, type: 'bandpass', q: 1.5, gain: 0.35 }); for (let i = 0; i < 10; i++) this.pluckSafe(1800 + Math.random() * 2400, 0.1 + Math.random() * 1.2, 0.04); }
  pluckSafe(f, delay, vel) { const ctx = this.ctx; if (!ctx) return; this.pluck(f, ctx.currentTime + delay, vel); }
  launch() { const ctx = this.ctx; if (!ctx || ctx.state !== 'running') return; const t = ctx.currentTime; const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(700, t); o.frequency.exponentialRampToValueAtTime(1600, t + 1.1); const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.03, t + 0.1); g.gain.exponentialRampToValueAtTime(0.0005, t + 1.2); o.connect(g); g.connect(this.sfxBus); o.start(t); o.stop(t + 1.25); }
  boom(dist, big) { this.noiseHit({ dur: big ? 2.0 : 1.3, f0: big ? 500 : 900, f1: 60, gain: big ? 0.7 : 0.45, delay: Math.min(1.2, dist / 700) }); this.noiseHit({ dur: 0.6, f0: 5000, f1: 1500, type: 'highpass', gain: 0.06, delay: Math.min(1.2, dist / 700) + 0.15 }); }
  thunder(delay) { this.noiseHit({ dur: 3.2, f0: 260, f1: 40, gain: 0.8, delay }); this.noiseHit({ dur: 1.5, f0: 1200, f1: 200, gain: 0.25, delay: delay + 0.05 }); }
}
