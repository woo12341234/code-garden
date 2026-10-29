// 강호난세 3D: the 2D game's WebAudio synth (no sound files) — effects plus the gugak-style loop.
export function createSound(settings) {
  let ac = null, master = null, musicBus = null, noiseBuf = null;
  function ensure() {
    if (!ac) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      ac = new AC();
      master = ac.createGain(); master.gain.value = 0.55; master.connect(ac.destination);
      musicBus = ac.createGain(); musicBus.gain.value = settings.music ? 0.22 : 0; musicBus.connect(master);
    }
    if (ac.state === 'suspended') ac.resume();
    return true;
  }
  function tone({ type = 'square', f = 440, f2 = null, dur = 0.1, vol = 0.2, delay = 0, at = null, bus = null, vib = 0 }) {
    const t = at ?? ac.currentTime + delay;
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f, t);
    if (f2) o.frequency.exponentialRampToValueAtTime(Math.max(20, f2), t + dur);
    if (vib) { const l = ac.createOscillator(), lg = ac.createGain(); l.frequency.value = 5.5; lg.gain.value = vib; l.connect(lg).connect(o.frequency); l.start(t); l.stop(t + dur + 0.05); }
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(bus || master);
    o.start(t); o.stop(t + dur + 0.02);
  }
  function noise({ dur = 0.08, vol = 0.2, freq = 2000, f2 = null, q = 1, filter = 'bandpass', delay = 0, at = null, bus = null }) {
    if (!noiseBuf) { noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
    const t = at ?? ac.currentTime + delay;
    const src = ac.createBufferSource(); src.buffer = noiseBuf;
    const fl = ac.createBiquadFilter(); fl.type = filter; fl.frequency.setValueAtTime(freq, t);
    if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t + dur);
    fl.Q.value = q;
    const g = ac.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(fl).connect(g).connect(bus || master);
    src.start(t, Math.random() * 0.5); src.stop(t + dur + 0.02);
  }
  const SOUNDS = {
    hit: () => { noise({ dur: 0.05, vol: 0.12, freq: 1800 }); tone({ type: 'sine', f: 170, f2: 80, dur: 0.06, vol: 0.14 }); },
    crit: () => { noise({ dur: 0.09, vol: 0.22, freq: 3400, q: 2 }); tone({ type: 'triangle', f: 1100, f2: 320, dur: 0.1, vol: 0.14 }); },
    kill: () => tone({ type: 'square', f: 480 + Math.random() * 80, f2: 200, dur: 0.07, vol: 0.05 }),
    coin: (n = 0) => tone({ type: 'triangle', f: 880 * 2 ** (Math.min(n, 12) / 12), dur: 0.07, vol: 0.07 }),
    levelup: () => [587, 659, 784, 988, 1175].forEach((f, i) => tone({ type: 'triangle', f, dur: 0.18, vol: 0.12, delay: i * 0.06 })),
    hurt: () => { tone({ type: 'sawtooth', f: 240, f2: 70, dur: 0.2, vol: 0.18 }); noise({ dur: 0.14, vol: 0.14, freq: 500, filter: 'lowpass' }); },
    dash: () => noise({ dur: 0.2, vol: 0.16, freq: 900, f2: 4500, q: 0.7 }),
    ult: () => { tone({ type: 'sawtooth', f: 120, f2: 38, dur: 0.8, vol: 0.24 }); noise({ dur: 0.7, vol: 0.26, freq: 900, f2: 200, filter: 'lowpass' }); tone({ type: 'triangle', f: 660, f2: 1760, dur: 0.45, vol: 0.1, delay: 0.04 }); },
    boom: () => { noise({ dur: 0.4, vol: 0.3, freq: 600, f2: 120, filter: 'lowpass' }); tone({ type: 'sine', f: 95, f2: 32, dur: 0.4, vol: 0.3 }); },
    gong: () => { tone({ type: 'sine', f: 196, dur: 2.2, vol: 0.22, vib: 1.5 }); tone({ type: 'sine', f: 293, dur: 1.6, vol: 0.08 }); tone({ type: 'sine', f: 523, dur: 0.8, vol: 0.05 }); },
    boss: () => { tone({ type: 'sawtooth', f: 73, f2: 55, dur: 1.1, vol: 0.2 }); tone({ type: 'sawtooth', f: 110, f2: 82, dur: 1.1, vol: 0.12 }); noise({ dur: 0.9, vol: 0.12, freq: 300, filter: 'lowpass' }); },
    chest: () => [784, 988, 1175, 1568].forEach((f, i) => tone({ type: 'triangle', f, dur: 0.25, vol: 0.12, delay: i * 0.08 })),
    select: () => tone({ type: 'triangle', f: 660, f2: 990, dur: 0.08, vol: 0.1 }),
    combo: () => { tone({ type: 'square', f: 523, dur: 0.08, vol: 0.08 }); tone({ type: 'square', f: 784, dur: 0.12, vol: 0.08, delay: 0.07 }); },
    shrine: () => [392, 523, 659, 784].forEach((f, i) => tone({ type: 'sine', f, dur: 0.5, vol: 0.1, delay: i * 0.05, vib: 3 })),
    goblin: () => [1046, 1318, 1046, 1568].forEach((f, i) => tone({ type: 'square', f, dur: 0.07, vol: 0.06, delay: i * 0.07 })),
    heart: () => { tone({ type: 'sine', f: 70, f2: 50, dur: 0.12, vol: 0.25 }); tone({ type: 'sine', f: 65, f2: 45, dur: 0.12, vol: 0.18, delay: 0.16 }); },
    gachaStep: (n = 0) => { tone({ type: 'triangle', f: 523 * 2 ** (n * 4 / 12), dur: 0.22, vol: 0.13 }); noise({ dur: 0.18, vol: 0.1, freq: 5000, q: 2 }); },
    gachaShake: () => noise({ dur: 0.12, vol: 0.06, freq: 1400, q: 3 }),
    gachaReveal: (g = 0) => {
      [523, 659, 784, 1046, 1318].slice(0, 3 + Math.min(2, g)).forEach((f, i) => tone({ type: 'triangle', f: f * (g >= 3 ? 1.5 : 1), dur: 0.35, vol: 0.12, delay: i * 0.07 }));
      if (g >= 3) { tone({ type: 'sine', f: 196, dur: 2, vol: 0.22, vib: 2 }); noise({ dur: 0.8, vol: 0.18, freq: 6000, f2: 1200, q: 0.8 }); }
    },
    death: () => { tone({ type: 'sawtooth', f: 330, f2: 60, dur: 1.2, vol: 0.2 }); tone({ type: 'sine', f: 196, f2: 98, dur: 1.4, vol: 0.15, delay: 0.1 }); },
  };
  const GAP = { hit: 0.035, kill: 0.03, coin: 0.03, crit: 0.06, boom: 0.12 };
  const last = {};
  function sfx(name, ...args) {
    if (!settings.sfx || !ac || ac.state !== 'running') return;
    const now = ac.currentTime;
    if (now - (last[name] || -1) < (GAP[name] || 0)) return;
    last[name] = now;
    SOUNDS[name](...args);
  }
  // janggu-like drums under a pentatonic daegeum-ish line; faster in boss fights
  const PENTA = [293.7, 329.6, 392, 440, 493.9, 587.3, 659.3, 784];
  const music = { timer: null, step: 0, next: 0, note: 3, busy: () => false, boss: () => false };
  function tick() {
    if (!ac || !settings.music) return;
    const busy = music.busy(), boss = music.boss(), spb = 60 / (boss ? 128 : 100) / 2;
    if (music.next < ac.currentTime) music.next = ac.currentTime + 0.05;
    while (music.next < ac.currentTime + 0.25) {
      const t = music.next, k = music.step % 16;
      if (busy) {
        if (k === 0 || k === 8 || (boss && k === 12)) { tone({ type: 'sine', f: 90, f2: 45, dur: 0.25, vol: 0.5, at: t, bus: musicBus }); noise({ dur: 0.12, vol: 0.12, freq: 180, filter: 'lowpass', at: t, bus: musicBus }); }
        if (k === 4 || k === 11) noise({ dur: 0.08, vol: 0.18, freq: 900, q: 3, at: t, bus: musicBus });
        if (k === 6 || k === 14 || (boss && k % 2 === 1)) noise({ dur: 0.03, vol: 0.12, freq: 4200, q: 4, at: t, bus: musicBus });
        if (k % 4 === 0 || (k % 2 === 0 && Math.random() < 0.35)) {
          music.note = Math.max(0, Math.min(PENTA.length - 1, music.note + [-2, -1, -1, 0, 1, 1, 2][Math.floor(Math.random() * 7)]));
          tone({ type: 'triangle', f: PENTA[music.note], dur: spb * (k % 8 === 0 ? 3.2 : 1.8), vol: 0.14, at: t, bus: musicBus, vib: 4 });
        }
        if (k === 0 && music.step % 32 === 0) tone({ type: 'sine', f: 73.4, dur: spb * 15, vol: 0.12, at: t, bus: musicBus });
      }
      music.next += spb;
      music.step++;
    }
  }
  return {
    ensure, sfx,
    startMusic(busy, boss) { music.busy = busy; music.boss = boss; if (!music.timer) music.timer = setInterval(tick, 60); },
    applySettings() { if (musicBus) musicBus.gain.setTargetAtTime(settings.music ? 0.22 : 0, ac.currentTime, 0.1); },
    buzz(p) { if (settings.vib && navigator.vibrate) navigator.vibrate(p); },
  };
}
