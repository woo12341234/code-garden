// Effect engine for 강호난세 3D: hand-painted canvas textures (slash arcs, soft rings, shockwaves, sparks,
// smoke, magic circles, petals, talismans, flames, snowflakes, feathers, lotus, palm, taiji, cracks) and
// layered presets built from billboards, ground decals and oriented planes. Everything fades on curves,
// is capped for phones, and reads well under the low-resolution pixel render.
import * as THREE from 'three';

const TAU = Math.PI * 2;
const rnd = (a, b) => a + Math.random() * (b - a);

// ---------- textures ----------
function canvasTex(size, draw) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const g = c.getContext('2d');
  draw(g, size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
const TEX = {};
function makeTextures() {
  TEX.glow = canvasTex(64, (g, s) => { const r = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.22, 'rgba(255,255,255,.75)'); r.addColorStop(0.55, 'rgba(255,255,255,.18)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, s, s); });
  TEX.ring = canvasTex(128, (g, s) => { const r = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2); r.addColorStop(0, 'rgba(255,255,255,0)'); r.addColorStop(0.62, 'rgba(255,255,255,.05)'); r.addColorStop(0.84, 'rgba(255,255,255,.9)'); r.addColorStop(0.9, 'rgba(255,255,255,1)'); r.addColorStop(0.96, 'rgba(255,255,255,.25)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, s, s); });
  TEX.shock = canvasTex(128, (g, s) => {
    g.translate(s / 2, s / 2);
    for (let i = 0; i < 90; i++) {
      const a = (i / 90) * TAU, r0 = s * 0.34 + Math.random() * s * 0.06, r1 = s * 0.47 + Math.random() * s * 0.03;
      const gr = g.createLinearGradient(Math.cos(a) * r0, Math.sin(a) * r0, Math.cos(a) * r1, Math.sin(a) * r1);
      gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.7, 'rgba(255,255,255,.95)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.strokeStyle = gr; g.lineWidth = 2 + Math.random() * 3; g.beginPath(); g.moveTo(Math.cos(a) * r0, Math.sin(a) * r0); g.lineTo(Math.cos(a) * r1, Math.sin(a) * r1); g.stroke();
    }
  });
  // a crescent sweeping counter-clockwise from 0 to ~200°: thick bright head, thin fading tail, white core
  TEX.slash = canvasTex(256, (g, s) => {
    const c = s / 2, R = s * 0.44, steps = 120, span = Math.PI * 1.15;
    for (let i = 0; i < steps; i++) {
      const u = i / steps, a0 = -span / 2 + u * span, a1 = a0 + span / steps * 1.6;
      const w = s * (0.02 + 0.17 * Math.pow(u, 1.3)), al = Math.pow(u, 1.1);
      g.strokeStyle = `rgba(255,255,255,${0.55 * al})`; g.lineWidth = w; g.beginPath(); g.arc(c, c, R - w * 0.3, a0, a1); g.stroke();
      g.strokeStyle = `rgba(255,255,255,${al})`; g.lineWidth = Math.max(1.5, w * 0.28); g.beginPath(); g.arc(c, c, R, a0, a1); g.stroke();
    }
  });
  TEX.streak = canvasTex(128, (g, s) => { const gr = g.createLinearGradient(0, 0, s, 0); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.75, 'rgba(255,255,255,.9)'); gr.addColorStop(0.92, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; const v = g.createLinearGradient(0, s * 0.3, 0, s * 0.7); g.fillRect(0, s * 0.42, s, s * 0.16); g.globalCompositeOperation = 'destination-in'; v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(0.5, 'rgba(0,0,0,1)'); v.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = v; g.fillRect(0, 0, s, s); });
  TEX.spark = canvasTex(64, (g, s) => { const c = s / 2; const r = g.createRadialGradient(c, c, 0, c, c, c * 0.5); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, s, s); g.fillStyle = 'rgba(255,255,255,.95)'; for (const [w, h] of [[s, 3], [3, s]]) g.fillRect(c - w / 2, c - h / 2, w, h); g.globalAlpha = 0.5; g.translate(c, c); g.rotate(Math.PI / 4); g.fillRect(-s * 0.3, -1, s * 0.6, 2); g.fillRect(-1, -s * 0.3, 2, s * 0.6); });
  TEX.smoke = canvasTex(64, (g, s) => { for (let i = 0; i < 14; i++) { const x = s / 2 + rnd(-s * 0.18, s * 0.18), y = s / 2 + rnd(-s * 0.18, s * 0.18), r = rnd(s * 0.14, s * 0.3); const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(255,255,255,.35)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, s, s); } });
  TEX.rune = canvasTex(256, (g, s) => {
    const c = s / 2; g.strokeStyle = 'rgba(255,255,255,.95)'; g.fillStyle = 'rgba(255,255,255,.95)';
    for (const [r, w] of [[0.48, 3], [0.43, 1.5], [0.3, 2], [0.12, 2]]) { g.lineWidth = w; g.beginPath(); g.arc(c, c, s * r, 0, TAU); g.stroke(); }
    for (let i = 0; i < 48; i++) { const a = (i / 48) * TAU; g.lineWidth = i % 4 ? 1 : 2.5; g.beginPath(); g.moveTo(c + Math.cos(a) * s * 0.43, c + Math.sin(a) * s * 0.43); g.lineTo(c + Math.cos(a) * s * (i % 4 ? 0.455 : 0.48), c + Math.sin(a) * s * (i % 4 ? 0.455 : 0.48)); g.stroke(); }
    // eight trigrams
    for (let i = 0; i < 8; i++) {
      g.save(); g.translate(c, c); g.rotate((i / 8) * TAU); g.translate(0, -s * 0.365);
      for (let k = 0; k < 3; k++) { const broken = ((i >> k) & 1) === 1; if (broken) { g.fillRect(-14, -8 + k * 7, 11, 3.5); g.fillRect(3, -8 + k * 7, 11, 3.5); } else g.fillRect(-14, -8 + k * 7, 28, 3.5); }
      g.restore();
    }
    g.lineWidth = 2; g.beginPath(); for (let i = 0; i <= 6; i++) { const a = (i / 6) * TAU * 2 - Math.PI / 2; g[i ? 'lineTo' : 'moveTo'](c + Math.cos(a) * s * 0.29, c + Math.sin(a) * s * 0.29); } g.stroke();
  });
  TEX.taiji = canvasTex(128, (g, s) => { const c = s / 2, r = s * 0.46; g.fillStyle = '#fff'; g.beginPath(); g.arc(c, c, r, 0, TAU); g.fill(); g.fillStyle = 'rgba(40,36,48,1)'; g.beginPath(); g.arc(c, c, r, -Math.PI / 2, Math.PI / 2); g.arc(c, c + r / 2, r / 2, Math.PI / 2, -Math.PI / 2, true); g.arc(c, c - r / 2, r / 2, Math.PI / 2, -Math.PI / 2); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(c, c + r / 2, r / 7, 0, TAU); g.fill(); g.fillStyle = 'rgba(40,36,48,1)'; g.beginPath(); g.arc(c, c - r / 2, r / 7, 0, TAU); g.fill(); });
  TEX.petal = canvasTex(64, (g, s) => { const gr = g.createLinearGradient(0, 0, 0, s); gr.addColorStop(0, '#fff'); gr.addColorStop(1, '#ffd0e0'); g.fillStyle = gr; g.beginPath(); g.moveTo(s / 2, s * 0.92); g.bezierCurveTo(s * 0.05, s * 0.55, s * 0.2, s * 0.1, s / 2, s * 0.22); g.bezierCurveTo(s * 0.8, s * 0.1, s * 0.95, s * 0.55, s / 2, s * 0.92); g.fill(); });
  TEX.talisman = canvasTex(64, (g, s) => { g.fillStyle = '#f2d872'; g.fillRect(s * 0.28, s * 0.06, s * 0.44, s * 0.88); g.strokeStyle = '#b8241c'; g.lineWidth = 3; g.beginPath(); g.moveTo(s * 0.5, s * 0.14); for (let i = 0; i < 6; i++) g.lineTo(s * (0.36 + (i % 2) * 0.28), s * (0.24 + i * 0.11)); g.stroke(); g.fillStyle = '#b8241c'; g.fillRect(s * 0.42, s * 0.8, s * 0.16, s * 0.08); });
  TEX.flame = canvasTex(64, (g, s) => { const gr = g.createRadialGradient(s / 2, s * 0.68, 0, s / 2, s * 0.6, s * 0.45); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,240,180,.9)'); gr.addColorStop(0.7, 'rgba(255,255,255,.25)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.beginPath(); g.moveTo(s / 2, s * 0.04); g.bezierCurveTo(s * 0.86, s * 0.42, s * 0.88, s * 0.96, s / 2, s * 0.96); g.bezierCurveTo(s * 0.12, s * 0.96, s * 0.14, s * 0.42, s / 2, s * 0.04); g.fill(); });
  TEX.flake = canvasTex(64, (g, s) => { g.translate(s / 2, s / 2); g.strokeStyle = '#fff'; g.lineWidth = 3; for (let i = 0; i < 6; i++) { g.rotate(Math.PI / 3); g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -s * 0.44); g.moveTo(0, -s * 0.24); g.lineTo(-s * 0.1, -s * 0.34); g.moveTo(0, -s * 0.24); g.lineTo(s * 0.1, -s * 0.34); g.stroke(); } });
  TEX.feather = canvasTex(64, (g, s) => { g.translate(s / 2, s / 2); g.rotate(0.6); g.fillStyle = '#fff'; g.beginPath(); g.ellipse(0, 0, s * 0.12, s * 0.42, 0, 0, TAU); g.fill(); g.strokeStyle = 'rgba(160,170,190,1)'; g.lineWidth = 2; g.beginPath(); g.moveTo(0, -s * 0.42); g.lineTo(0, s * 0.46); g.stroke(); });
  TEX.lotus = canvasTex(128, (g, s) => { g.translate(s / 2, s * 0.62); g.fillStyle = 'rgba(255,255,255,.9)'; for (let i = -3; i <= 3; i++) { g.save(); g.rotate(i * 0.38); g.beginPath(); g.moveTo(0, 0); g.bezierCurveTo(-s * 0.13, -s * 0.2, -s * 0.06, -s * 0.42, 0, -s * 0.48); g.bezierCurveTo(s * 0.06, -s * 0.42, s * 0.13, -s * 0.2, 0, 0); g.fill(); g.restore(); } });
  TEX.palm = canvasTex(128, (g, s) => { g.fillStyle = '#fff'; g.beginPath(); g.ellipse(s * 0.5, s * 0.66, s * 0.22, s * 0.25, 0, 0, TAU); g.fill(); [[-0.17, 0.42, 0.075, 0.22], [-0.06, 0.34, 0.075, 0.27], [0.06, 0.34, 0.075, 0.27], [0.17, 0.42, 0.07, 0.22]].forEach(([x, y, w, h]) => { g.beginPath(); g.ellipse(s * (0.5 + x), s * y, s * w, s * h, x * 0.6, 0, TAU); g.fill(); }); g.beginPath(); g.ellipse(s * 0.24, s * 0.66, s * 0.07, s * 0.18, -0.9, 0, TAU); g.fill(); });
  TEX.crack = canvasTex(128, (g, s) => { g.translate(s / 2, s / 2); for (let i = 0; i < 9; i++) { let a = (i / 9) * TAU + rnd(-0.2, 0.2), r = 0; g.beginPath(); g.moveTo(0, 0); while (r < s * 0.48) { r += rnd(6, 12); a += rnd(-0.35, 0.35); g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.strokeStyle = 'rgba(255,255,255,1)'; g.lineWidth = 2.5; g.stroke(); } const gr = g.createRadialGradient(0, 0, 0, 0, 0, s * 0.2); gr.addColorStop(0, 'rgba(255,255,255,.8)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(-s / 2, -s / 2, s, s); });
  TEX.crescent = canvasTex(128, (g, s) => { g.fillStyle = '#fff'; g.beginPath(); g.arc(s / 2, s / 2, s * 0.46, -1.3, 1.3); g.arc(s * 0.36, s / 2, s * 0.4, 1.15, -1.15, true); g.fill(); });
  TEX.sword = canvasTex(128, (g, s) => { g.fillStyle = '#fff'; g.beginPath(); g.moveTo(s * 0.98, s / 2); g.lineTo(s * 0.3, s * 0.45); g.lineTo(s * 0.3, s * 0.55); g.closePath(); g.fill(); g.fillStyle = '#e8c060'; g.fillRect(s * 0.26, s * 0.36, s * 0.04, s * 0.28); g.fillStyle = '#6a3a2a'; g.fillRect(s * 0.06, s * 0.47, s * 0.2, s * 0.06); });
  TEX.chakram = canvasTex(64, (g, s) => { g.translate(s / 2, s / 2); g.strokeStyle = '#fff'; g.lineWidth = 6; g.beginPath(); g.arc(0, 0, s * 0.34, 0, TAU); g.stroke(); g.fillStyle = '#fff'; for (let i = 0; i < 6; i++) { g.rotate(TAU / 6); g.beginPath(); g.moveTo(s * 0.36, -4); g.lineTo(s * 0.48, 0); g.lineTo(s * 0.36, 4); g.fill(); } });
  TEX.crane = canvasTex(64, (g, s) => { g.fillStyle = '#fff'; g.beginPath(); g.moveTo(s * 0.5, s * 0.3); g.lineTo(s * 0.95, s * 0.15); g.lineTo(s * 0.58, s * 0.52); g.lineTo(s * 0.88, s * 0.62); g.lineTo(s * 0.5, s * 0.62); g.lineTo(s * 0.12, s * 0.62); g.lineTo(s * 0.42, s * 0.52); g.lineTo(s * 0.05, s * 0.15); g.closePath(); g.fill(); g.fillStyle = '#c8343a'; g.fillRect(s * 0.47, s * 0.26, s * 0.06, s * 0.06); });
  for (const t of Object.values(TEX)) { t.magFilter = THREE.LinearFilter; t.generateMipmaps = true; }
}

// ---------- engine ----------
export function createFX(scene, opts = {}) {
  makeTextures();
  const live = [];
  const cap = () => (opts.low?.() ? 260 : 620);
  const planeGeo = new THREE.PlaneGeometry(1, 1);
  const groundGeo = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);
  const blendOf = (b) => (b === 'normal' ? THREE.NormalBlending : THREE.AdditiveBlending);
  const ease = { out: (k) => 1 - (1 - k) * (1 - k), in: (k) => k * k, flash: (k) => (k < 0.12 ? k / 0.12 : 1 - (k - 0.12) / 0.88), lin: (k) => k };

  // base element: o = { tex, color, size, life, grow (end scale mult), spin, fade ('out'|'flash'|...), vel, drag, grav, delay, opacity, blend }
  function add(obj, o) {
    if (live.length >= cap()) { obj.material.dispose(); return null; }
    obj.renderOrder = o.order ?? 3;
    obj.visible = !o.delay;
    scene.add(obj);
    const e = { obj, o, t: 0, life: o.life || 0.4, vx: o.vel?.[0] || 0, vy: o.vel?.[1] || 0, vz: o.vel?.[2] || 0, s0: o.size || 1, follow: o.follow };
    live.push(e);
    return e;
  }
  function mat(o) {
    return new THREE.MeshBasicMaterial({ map: TEX[o.tex || 'glow'], color: o.color || '#ffffff', transparent: true, opacity: o.opacity ?? 1, blending: blendOf(o.blend), depthWrite: false, side: THREE.DoubleSide, fog: false });
  }
  const FX = {
    TEX,
    sprite(x, y, z, o) {
      const m = new THREE.SpriteMaterial({ map: TEX[o.tex || 'glow'], color: o.color || '#ffffff', transparent: true, opacity: o.opacity ?? 1, blending: blendOf(o.blend), depthWrite: false, rotation: o.rot ?? (o.spin ? rnd(0, TAU) : 0), fog: false });
      const s = new THREE.Sprite(m); s.position.set(x, y, z); s.scale.setScalar(o.size || 1);
      if (o.aspect) s.scale.x *= o.aspect;
      return add(s, o);
    },
    ground(x, y, z, o) {
      const m = new THREE.Mesh(groundGeo, mat(o)); m.position.set(x, y + (o.lift ?? 0.12), z); m.scale.setScalar(o.size || 1); m.rotation.y = o.yaw || 0;
      return add(m, o);
    },
    // a plane lying in the ground plane but lifted, turned to `yaw` (world angle a = atan2(dz, dx)); tilt raises it toward the camera
    plane(x, y, z, o) {
      const m = new THREE.Mesh(planeGeo, mat(o)); m.position.set(x, y, z);
      m.rotation.order = 'YXZ'; m.rotation.set(-Math.PI / 2 + (o.tilt || 0), -(o.yaw || 0), o.roll || 0);
      m.scale.set(o.w || o.size || 1, o.h || o.size || 1, 1);
      return add(m, o);
    },
    update(dt) {
      for (let i = live.length - 1; i >= 0; i--) {
        const e = live[i], o = e.o;
        e.t += dt;
        if (o.delay && e.t < o.delay) { continue; }
        e.obj.visible = true;
        const k = Math.min(1, (e.t - (o.delay || 0)) / e.life);
        if (e.follow) { const p = e.follow(); e.obj.position.set(p.x, p.y, p.z); }
        else if (e.vx || e.vy || e.vz || o.grav) {
          e.vy -= (o.grav || 0) * dt;
          const d = o.drag ? Math.max(0, 1 - o.drag * dt) : 1; e.vx *= d; e.vy *= d; e.vz *= d;
          e.obj.position.x += e.vx * dt; e.obj.position.y += e.vy * dt; e.obj.position.z += e.vz * dt;
        }
        const g = 1 + ((o.grow ?? 1) - 1) * ease[o.growEase || 'out'](k);
        if (e.obj.isSprite) { e.obj.scale.set(e.s0 * g * (o.aspect || 1), e.s0 * g, 1); if (o.spin) e.obj.material.rotation += o.spin * dt; }
        else {
          if (o.w) e.obj.scale.set(o.w * g, o.h * (o.growH ? 1 + (o.growH - 1) * ease.out(k) : g), 1); else e.obj.scale.setScalar(e.s0 * g);
          if (o.spin) e.obj.rotation[e.obj.rotation.order === 'YXZ' ? 'z' : 'y'] += o.spin * dt;
        }
        const f = o.fade || 'flash';
        const vis = f === 'out' ? 1 - ease.in(k) : f === 'hold' ? (k < 0.75 ? Math.min(1, k / 0.08) : (1 - k) / 0.25) : f === 'lin' ? 1 - k : ease.flash(k);
        e.obj.material.opacity = (o.opacity ?? 1) * vis;
        if (k >= 1) { scene.remove(e.obj); e.obj.material.dispose(); live.splice(i, 1); }
      }
    },
    clear() { for (const e of live) { scene.remove(e.obj); e.obj.material.dispose(); } live.length = 0; },
    count: () => live.length,

    // ---------- presets ----------
    // impact spark at a hit point: star flash + streaking sparks
    hit(x, y, z, color = '#ffffff', big = false) {
      FX.sprite(x, y, z, { tex: 'spark', color, size: big ? 2.2 : 1.2, life: 0.16, grow: 1.6, rot: rnd(0, TAU), fade: 'flash' });
      FX.sprite(x, y, z, { tex: 'glow', color, size: big ? 2.4 : 1.2, life: 0.18, grow: 1.4, opacity: 0.8 });
      const n = opts.low?.() ? 2 : big ? 6 : 3;
      for (let i = 0; i < n; i++) {
        const a = rnd(0, TAU), sp = rnd(6, 14);
        FX.sprite(x, y, z, { tex: 'streak', color, size: 0.5, aspect: 3, life: rnd(0.12, 0.22), vel: [Math.cos(a) * sp, rnd(2, 8), Math.sin(a) * sp], drag: 6, grow: 0.3, rot: rnd(0, TAU), fade: 'out' });
      }
    },
    // a sword cut: dark under-arc for contrast, coloured arc, white core arc, sparks thrown off the edge
    slash(x, y, z, a, R, color, o = {}) {
      const side = o.side || 1, life = o.life || 0.34, tilt = Math.max(o.tilt ?? 0.75, 0.55);
      const yaw = a + (side > 0 ? 0 : Math.PI);
      FX.plane(x, y - 0.05, z, { tex: 'slash', color: '#120c18', blend: 'normal', size: R * 2.1, life, grow: 1.1, opacity: 0.45, yaw, tilt, roll: side < 0 ? Math.PI : 0, order: 2 });
      FX.sprite(x + Math.cos(a) * R * 0.5, y, z + Math.sin(a) * R * 0.5, { tex: 'glow', color, size: R * 1.3, life: life * 0.6, grow: 1.3, opacity: 0.5 });
      FX.plane(x, y, z, { tex: 'slash', color, size: R * 2.4, life, grow: 1.15, yaw, tilt, roll: side < 0 ? Math.PI : 0, spin: (o.spin ?? 2.5) * side });
      FX.plane(x, y + 0.03, z, { tex: 'slash', color: '#ffffff', size: R * 2.05, life: life * 0.7, grow: 1.12, yaw, tilt, roll: side < 0 ? Math.PI : 0, spin: (o.spin ?? 2.5) * side });
      if (!opts.low?.()) for (let i = 0; i < 6; i++) { const t = a + rnd(-0.9, 0.9), r = R * rnd(0.85, 1.05); FX.sprite(x + Math.cos(t) * r, y + rnd(0, 0.5), z + Math.sin(t) * r, { tex: 'spark', color, size: rnd(0.4, 0.8), life: rnd(0.15, 0.3), vel: [Math.cos(t) * 5, rnd(1, 4), Math.sin(t) * 5], drag: 5, fade: 'out' }); }
    },
    // expanding soft ring + rough shockwave edge on the ground
    shockwave(x, y, z, R, color, o = {}) {
      FX.ground(x, y, z, { tex: 'ring', color, size: R * 0.3, grow: 1 / 0.3 * 1.05, life: o.life || 0.45, fade: 'flash', opacity: o.opacity ?? 1 });
      FX.ground(x, y, z, { tex: 'shock', color: o.edge || '#ffffff', size: R * 0.35, grow: 1 / 0.35, life: (o.life || 0.45) * 0.8, fade: 'out', opacity: 0.8, spin: 0.6 });
    },
    // explosion: flash, fire/energy ball, shockwave, smoke, embers, scorch
    explode(x, y, z, R, color, o = {}) {
      FX.sprite(x, y + R * 0.3, z, { tex: 'glow', color: '#ffffff', size: R * 1.2, life: 0.14, grow: 1.5 });
      FX.sprite(x, y + R * 0.3, z, { tex: 'glow', color, size: R * 1.6, life: 0.4, grow: 1.4, fade: 'flash' });
      FX.shockwave(x, y, z, R * 1.15, color, { life: 0.4 });
      if (o.smoke !== false) for (let i = 0; i < (opts.low?.() ? 3 : 6); i++) FX.sprite(x + rnd(-R, R) * 0.4, y + 0.3, z + rnd(-R, R) * 0.4, { tex: 'smoke', color: o.smokeColor || '#5a5058', blend: 'normal', size: R * rnd(0.6, 1), life: rnd(0.6, 1.0), vel: [rnd(-1, 1), rnd(1.5, 3), rnd(-1, 1)], grow: 1.8, fade: 'out', opacity: 0.6 });
      for (let i = 0; i < (opts.low?.() ? 4 : 10); i++) { const a = rnd(0, TAU), sp = rnd(4, 12); FX.sprite(x, y + 0.4, z, { tex: 'spark', color, size: rnd(0.3, 0.6), life: rnd(0.3, 0.6), vel: [Math.cos(a) * sp, rnd(4, 10), Math.sin(a) * sp], grav: 18, drag: 1.5, fade: 'out' }); }
      if (o.scorch !== false) FX.ground(x, y, z, { tex: 'crack', color: o.scorch || '#2a1814', blend: 'normal', size: R * 1.4, life: 1.6, fade: 'out', opacity: 0.55, order: 1, lift: 0.08 });
    },
    // a straight bolt of energy: outer glow plane, inner core, flashes at both ends
    beam(x0, y0, z0, x1, y1, z1, color, width = 0.6, life = 0.3) {
      const dx = x1 - x0, dz = z1 - z0, L = Math.hypot(dx, dz) || 0.01, a = Math.atan2(dz, dx), mx = (x0 + x1) / 2, my = (y0 + y1) / 2, mz = (z0 + z1) / 2;
      const yaw = a; // plane's local x runs along the beam
      FX.plane(mx, my, mz, { tex: 'streak', color, w: L, h: width * 3, life, grow: 1, growH: 0.2, yaw, tilt: 0.9, fade: 'flash' });
      FX.plane(mx, my + 0.02, mz, { tex: 'streak', color: '#ffffff', w: L, h: width, life: life * 0.8, growH: 0.1, yaw, tilt: 0.9, fade: 'flash' });
      FX.sprite(x0, y0, z0, { tex: 'glow', color, size: width * 3, life: life * 0.8, grow: 0.6 });
      FX.sprite(x1, y1, z1, { tex: 'spark', color, size: width * 3.5, life: life * 0.7, grow: 1.4, rot: rnd(0, TAU) });
    },
    // lightning from the sky: jagged segments, flash, ground ring, embers
    bolt(x, y, z, color) {
      let px = x + rnd(-2, 2), py = y + 22, pz = z + rnd(-2, 2);
      for (let i = 1; i <= 7; i++) {
        const t = i / 7, nx = i === 7 ? x : x + rnd(-1.4, 1.4) * (1 - t), ny = y + 22 * (1 - t), nz = i === 7 ? z : z + rnd(-1.4, 1.4) * (1 - t);
        const L = Math.hypot(nx - px, ny - py, nz - pz);
        const m = new THREE.Mesh(planeGeo, mat({ tex: 'streak', color }));
        m.position.set((px + nx) / 2, (py + ny) / 2, (pz + nz) / 2);
        m.lookAt(m.position.x + (nx - px), m.position.y + (ny - py), m.position.z + (nz - pz)); m.rotateY(Math.PI / 2);
        m.scale.set(L * 1.1, 0.9, 1);
        add(m, { life: 0.22, fade: 'flash', w: L * 1.1, h: 0.9 });
        px = nx; py = ny; pz = nz;
      }
      FX.sprite(x, y + 1, z, { tex: 'glow', color: '#ffffff', size: 4, life: 0.15, grow: 1.4 });
      FX.shockwave(x, y, z, 3, color, { life: 0.35 });
      FX.ground(x, y, z, { tex: 'crack', color: '#20141c', blend: 'normal', size: 2.6, life: 1.2, fade: 'out', opacity: 0.5, lift: 0.08, order: 1 });
    },
    // pillar of light from the sky (used for drops, heals, ultimates)
    pillar(x, y, z, color, h = 18, w = 1.4, life = 0.45) {
      FX.plane(x, y + h / 2, z, { tex: 'streak', color, w: h, h: w * 2, life, yaw: 0, tilt: Math.PI / 2, roll: Math.PI / 2, fade: 'flash', growH: 0.2 });
      FX.sprite(x, y + h / 2, z, { tex: 'streak', color, size: w * 2.4, aspect: 0.15, life, rot: Math.PI / 2, fade: 'flash' });
    },
    // magic circle on the ground; returns the element so callers can keep it alive while a zone lasts
    rune(x, y, z, R, color, life = 1, spin = 0.8) {
      return FX.ground(x, y, z, { tex: 'rune', color, size: R * 2, life, fade: 'hold', spin, opacity: 0.9, order: 1 });
    },
  };
  return FX;
}
