// Low-poly wuxia figures with heroic proportions (~7.5 heads tall): small head, broad shoulders, long legs,
// robe tails, hair and ribbons that trail in the wind, knees and elbows that bend. Colours are read from the
// character's pixel sprite, then muted toward a dramatic palette. Every bone is an InstancedMesh, so a crowd
// of one kind of foe costs ~14 draw calls; pose() composes the bone matrices for run / attack / flinch.
window.Rig = (() => {
  const cv = document.createElement('canvas');
  const cx = cv.getContext('2d', { willReadFrequently: true });
  const C = (r, g, b) => new THREE.Color().setRGB(r / 255, g / 255, b / 255, THREE.SRGBColorSpace);
  const hex = (h) => new THREE.Color(h);

  // ---------- colours from the sprite ----------
  function analyse(img) {
    const w = img.naturalWidth, h = img.naturalHeight;
    cv.width = w; cv.height = h; cx.clearRect(0, 0, w, h); cx.drawImage(img, 0, 0);
    const d = cx.getImageData(0, 0, w, h).data;
    let x0 = w, y0 = h, x1 = 0, y1 = 0;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3] > 200) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    const isSkin = (r, g, b) => r > 165 && g > 110 && b > 80 && r > g && g >= b - 6 && r - b > 28 && r - b < 130;
    const band = (fy0, fy1, skipSkin = true) => {
      const m = new Map();
      for (let y = Math.floor(y0 + (y1 - y0) * fy0); y < y0 + (y1 - y0) * fy1; y++) {
        for (let x = x0; x <= x1; x++) {
          const i = (y * w + x) * 4;
          if (d[i + 3] < 200) continue;
          const r = d[i], g = d[i + 1], b = d[i + 2];
          if (r + g + b < 95) continue;
          if (skipSkin && isSkin(r, g, b)) continue;
          const k = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3);
          const e = m.get(k) || { n: 0, r: 0, g: 0, b: 0 };
          e.n++; e.r += r; e.g += g; e.b += b; m.set(k, e);
        }
      }
      return [...m.values()].sort((a, b) => b.n - a.n).map((e) => [e.r / e.n, e.g / e.n, e.b / e.n]);
    };
    const far = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]) > 70;
    const hairs = band(0, 0.3), body = band(0.42, 0.78), low = band(0.8, 1);
    let skin = [226, 190, 158];
    { const s = band(0.1, 0.55, false).find((c) => isSkin(c[0], c[1], c[2])); if (s) skin = s; }
    const hair = hairs[0] || [30, 26, 34];
    const main = body.find((c) => far(c, skin)) || hair;
    const accent = body.find((c) => far(c, main) && far(c, skin)) || main.map((v) => Math.min(255, v * 1.35));
    const pants = low.find((c) => far(c, skin)) || main;
    // a moodier, less candy-coloured palette
    const mute = (c, k = 0.82) => { const col = C(...c); const hsl = {}; col.getHSL(hsl); return col.setHSL(hsl.h, hsl.s * k, hsl.l * 0.9); };
    return { skin: C(...skin), hair: mute(hair, 0.7), main: mute(main), accent: mute(accent, 0.9), pants: mute(pants, 0.7) };
  }

  // ---------- geometry ----------
  function paint(g, color) {
    g = g.index ? g.toNonIndexed() : g;
    const n = g.attributes.position.count, a = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { a[i * 3] = color.r; a[i * 3 + 1] = color.g; a[i * 3 + 2] = color.b; }
    g.setAttribute('color', new THREE.BufferAttribute(a, 3));
    if (g.attributes.uv) g.deleteAttribute('uv');
    return g;
  }
  function merge(list) {
    list = list.filter(Boolean);
    let n = 0; for (const g of list) n += g.attributes.position.count;
    const p = new Float32Array(n * 3), c = new Float32Array(n * 3);
    let o = 0;
    for (const g of list) { p.set(g.attributes.position.array, o * 3); c.set(g.attributes.color.array, o * 3); o += g.attributes.position.count; }
    const m = new THREE.BufferGeometry();
    m.setAttribute('position', new THREE.BufferAttribute(p, 3)); m.setAttribute('color', new THREE.BufferAttribute(c, 3));
    m.computeVertexNormals(); m.computeBoundingSphere();
    return m;
  }
  const T = (g, x, y, z, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => {
    g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)), new THREE.Vector3(sx, sy, sz)));
    return g;
  };
  // tapered limb hanging down from the origin
  const limb = (r0, r1, len, col, seg = 5, sz = 1) => paint(T(new THREE.CylinderGeometry(r0, r1, len, seg), 0, -len / 2, 0, 0, 0, 0, 1, 1, sz), col);
  const box = (w, h, d, col, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) => paint(T(new THREE.BoxGeometry(w, h, d), x, y, z, rx, ry, rz), col);
  const cyl = (rt, rb, h, seg, col, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sz = 1) => paint(T(new THREE.CylinderGeometry(rt, rb, h, seg), x, y, z, rx, ry, rz, sx, 1, sz), col);
  // a flat cloth panel hanging from its top edge (double faced)
  const cloth = (wTop, wBot, len, col, thick = 0.025) => {
    const g = new THREE.BufferGeometry();
    const a = wTop / 2, b = wBot / 2, t = thick / 2;
    const v = [[-a, 0, t], [a, 0, t], [b, -len, t], [-b, -len, t], [-a, 0, -t], [a, 0, -t], [b, -len, -t], [-b, -len, -t]];
    const F = [[0, 3, 2, 1], [5, 6, 7, 4], [0, 1, 5, 4], [3, 7, 6, 2], [0, 4, 7, 3], [1, 2, 6, 5]];
    const pos = [];
    for (const [i, j, k, l] of F) for (const q of [i, j, k, i, k, l]) pos.push(...v[q]);
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    return paint(g, col);
  };
  const STEEL = hex('#d8e0ec'), STEEL2 = hex('#7f8a9c'), GOLD = hex('#c9a040'), WOOD = hex('#5a3a24'), BLACK = hex('#16131a'), BONE = hex('#e6e0d0'), RED = hex('#a8242c');
  const darker = (c, k = 0.7) => c.clone().multiplyScalar(k);
  const lighter = (c, k = 1.2) => c.clone().multiplyScalar(k);

  // ---------- body plan ----------
  // spec: { build: m|f|big|old|thin, hair, hat, weapon, robe: long|short, extra, face, beard, ... colour overrides }
  function makeBody(spec, col) {
    const build = spec.build || 'm';
    const B = { m: { sw: 1, h: 1, l: 1 }, f: { sw: 0.8, h: 0.95, l: 0.85 }, big: { sw: 1.4, h: 1.12, l: 1.45 }, old: { sw: 0.95, h: 0.96, l: 0.95 }, thin: { sw: 0.85, h: 1.04, l: 0.85 } }[build] || { sw: 1, h: 1, l: 1 };
    const skin = spec.skinColor ? hex(spec.skinColor) : col.skin;
    const hair = spec.hairColor ? hex(spec.hairColor) : col.hair;
    const main = spec.mainColor ? hex(spec.mainColor) : col.main;
    const acc = spec.accColor ? hex(spec.accColor) : col.accent;
    const pants = spec.pantsColor ? hex(spec.pantsColor) : darker(spec.robe === 'long' ? main : col.pants, 0.75);
    const boot = spec.shoe ? hex(spec.shoe) : BLACK;
    const H = B.h, L = B.l, SW = B.sw;
    const KNEE = 0.82 * H, HIP = 1.58 * H, WAIST = 1.86 * H, SHO = 2.4 * H, NECK = 2.5 * H;
    const P = {}; // part: { geo, parent, at:[x,y,z] relative to parent pivot }
    // legs: thigh (hip→knee) and shin (knee→ankle) with boots
    const hipX = 0.14 * SW;
    const thigh = () => merge([limb(0.14 * L, 0.105 * L, HIP - KNEE, pants, 6)]);
    const shin = () => merge([limb(0.1 * L, 0.078 * L, KNEE - 0.06, pants, 6), cyl(0.105 * L, 0.09 * L, 0.42, 6, boot, 0, -KNEE + 0.27, 0), box(0.15 * L, 0.09, 0.3, boot, 0, -KNEE + 0.07, 0.07), cyl(0.09 * L, 0.09 * L, 0.05, 6, darker(boot, 1.6), 0, -0.36 * H, 0)]);
    if (!spec.float) {
      P.thighL = { geo: thigh(), parent: 'root', at: [-hipX, HIP, 0] };
      P.shinL = { geo: shin(), parent: 'thighL', at: [0, -(HIP - KNEE), 0] };
      P.thighR = { geo: thigh(), parent: 'root', at: [hipX, HIP, 0] };
      P.shinR = { geo: shin(), parent: 'thighR', at: [0, -(HIP - KNEE), 0] };
    }
    // torso (pivot at the waist): tapered chest, crossed collar, sash, shoulder line
    {
      const chestH = SHO - WAIST;
      const g = [
        cyl(0.35 * SW, 0.23 * L, chestH + 0.08, 6, main, 0, chestH / 2, 0, 0, Math.PI / 6, 0, 1, 0.66),
        cyl(0.235 * L, 0.25 * L, WAIST - HIP + 0.08, 6, main, 0, -(WAIST - HIP) / 2, 0, 0, Math.PI / 6, 0, 1, 0.7),
        cyl(0.25 * L, 0.25 * L, 0.12, 6, spec.beltColor ? hex(spec.beltColor) : darker(acc, 0.8), 0, 0.0, 0, 0, Math.PI / 6, 0, 1, 0.74),
        box(0.06, chestH * 0.95, 0.03, acc, 0.03, chestH * 0.5, 0.19 * SW * 0.62 + 0.02, 0, 0, -0.42),
        box(0.06, chestH * 0.6, 0.03, spec.inner ? hex(spec.inner) : hex('#d8d2c4'), -0.06, chestH * 0.68, 0.2 * SW * 0.62, 0, 0, 0.42),
        box(0.74 * SW, 0.12, 0.3 * SW, main, 0, chestH - 0.02, 0),
      ];
      if (build === 'big' || spec.armor) g.push(box(0.26 * SW, 0.14, 0.28, spec.armor ? hex(spec.armor) : darker(main, 0.8), -0.36 * SW, chestH - 0.02, 0, 0, 0, 0.35), box(0.26 * SW, 0.14, 0.28, spec.armor ? hex(spec.armor) : darker(main, 0.8), 0.36 * SW, chestH - 0.02, 0, 0, 0, -0.35));
      if (spec.extra === 'beads') for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2; g.push(box(0.06, 0.06, 0.06, hex('#5a2a1a'), Math.cos(a) * 0.17, chestH - 0.04 - Math.max(0, Math.sin(a)) * 0.18, Math.sin(a) * 0.12 + 0.05)); }
      if (spec.extra === 'sheath' || spec.weapon === 'sword' || spec.weapon === 'blade') g.push(box(0.05, 1.0, 0.07, hex('#2a1c1c'), 0.12, chestH * 0.45, -0.17, 0, 0, 0.7), box(0.12, 0.04, 0.1, GOLD, 0.42, chestH * 0.45 + 0.37, -0.17, 0, 0, 0.7));
      if (spec.extra === 'quiver') g.push(cyl(0.06, 0.06, 0.6, 6, WOOD, -0.1, chestH * 0.55, -0.18, 0, 0, -0.5));
      if (spec.extra === 'gourd') g.push(cyl(0.07, 0.09, 0.16, 6, hex('#b8863c'), 0.24 * L, -0.08, 0.1), cyl(0.05, 0.06, 0.1, 6, hex('#b8863c'), 0.24 * L, 0.05, 0.1));
      P.torso = { geo: merge(g), parent: 'root', at: [0, WAIST, 0] };
    }
    // robe tails: one long back flap and two front flaps that stream behind when running
    if (spec.robe) {
      const len = spec.robe === 'long' ? (WAIST - 0.25) : (WAIST - KNEE) * 0.85;
      P.flapB = { geo: merge([cloth(0.42 * L, 0.55 * L, len, main), cloth(0.44 * L, 0.57 * L, 0.06, acc).translate(0, -len + 0.03, -0.001)]), parent: 'torso', at: [0, -0.02, -0.15 * L] };
      P.flapL = { geo: merge([cloth(0.2 * L, 0.26 * L, len * 0.95, main), cloth(0.21 * L, 0.27 * L, 0.06, acc).translate(0, -len * 0.95 + 0.03, 0.001)]), parent: 'torso', at: [-0.11 * L, -0.02, 0.13 * L] };
      P.flapR = { geo: merge([cloth(0.2 * L, 0.26 * L, len * 0.95, darker(main, 0.92)), cloth(0.21 * L, 0.27 * L, 0.06, acc).translate(0, -len * 0.95 + 0.03, 0.001)]), parent: 'torso', at: [0.11 * L, -0.02, 0.13 * L] };
    }
    if (spec.extra === 'cape') P.cape = { geo: merge([cloth(0.6 * SW, 0.85 * SW, SHO - 0.45, acc), cloth(0.62 * SW, 0.87 * SW, 0.06, GOLD).translate(0, -(SHO - 0.45) + 0.03, -0.002)]), parent: 'torso', at: [0, SHO - WAIST - 0.02, -0.17] };
    if (spec.extra === 'tails') P.cape = { geo: merge([0, 1, 2].map((i) => T(paint(new THREE.ConeGeometry(0.14, 1.3, 6), hair), (i - 1) * 0.18, -0.62, 0, Math.PI, 0, (i - 1) * 0.35))), parent: 'torso', at: [0, -0.05, -0.2] };
    // head (pivot at the neck): small skull, sharp eyes, hair and hats
    {
      const hs = 0.175;
      const fz = hs * 0.98;
      const g = [cyl(0.055, 0.065, 0.12, 6, skin, 0, 0.04, 0), T(paint(new THREE.IcosahedronGeometry(hs, 1), skin), 0, 0.2, 0.01, 0, 0, 0, 0.92, 1.15, 1.0)];
      const face = spec.face || (build === 'f' ? 'f' : 'm');
      const eye = hex(spec.eyes || (face === 'demon' ? '#ffcc30' : '#141018'));
      if (face === 'skull') { g.length = 1; g.push(T(paint(new THREE.IcosahedronGeometry(hs, 1), BONE), 0, 0.2, 0, 0, 0, 0, 0.92, 1.12, 1)); g.push(box(0.05, 0.045, 0.02, BLACK, -0.055, 0.22, fz), box(0.05, 0.045, 0.02, BLACK, 0.055, 0.22, fz), box(0.1, 0.02, 0.02, BLACK, 0, 0.11, fz - 0.01)); }
      else {
        // narrow, slightly slanted eyes and a hard brow line
        g.push(box(0.055, face === 'f' ? 0.024 : 0.016, 0.02, eye, -0.055, 0.215, fz, 0, 0, face === 'f' ? 0.1 : 0.18), box(0.055, face === 'f' ? 0.024 : 0.016, 0.02, eye, 0.055, 0.215, fz, 0, 0, face === 'f' ? -0.1 : -0.18));
        if (face !== 'f') g.push(box(0.07, 0.014, 0.02, darker(hair, 0.8), -0.06, 0.25, fz - 0.005, 0, 0, 0.28), box(0.07, 0.014, 0.02, darker(hair, 0.8), 0.06, 0.25, fz - 0.005, 0, 0, -0.28));
        if (face === 'f') g.push(box(0.04, 0.012, 0.02, hex('#9a3a42'), 0, 0.12, fz - 0.02));
        if (face === 'demon') g.push(box(0.1, 0.03, 0.02, hex('#2a0c10'), 0, 0.12, fz - 0.01), box(0.015, 0.03, 0.02, BONE, -0.035, 0.11, fz), box(0.015, 0.03, 0.02, BONE, 0.035, 0.11, fz));
        if (face === 'mask') g.push(box(0.3, 0.13, 0.03, darker(spec.hoodColor ? hex(spec.hoodColor) : main, 0.55), 0, 0.13, fz - 0.02));
        if (spec.scar) g.push(box(0.012, 0.14, 0.02, hex('#8a2a2a'), 0.06, 0.2, fz + 0.005, 0, 0, 0.2));
      }
      const style = spec.hair || 'short';
      if (style !== 'bald' && face !== 'skull') {
        g.push(T(paint(new THREE.IcosahedronGeometry(hs * 1.08, 1), hair), 0, 0.24, -0.025, 0, 0, 0, 0.98, 0.95, 1.02));
        // sharp bangs falling over the forehead
        for (let i = 0; i < 5; i++) g.push(T(paint(new THREE.ConeGeometry(0.035, 0.14, 4), hair), (i - 2) * 0.05, 0.27, fz - 0.03, Math.PI + 0.25, 0, (i - 2) * 0.18));
        g.push(T(paint(new THREE.ConeGeometry(0.035, 0.2, 4), hair), -0.15, 0.17, 0.04, Math.PI, 0, -0.1), T(paint(new THREE.ConeGeometry(0.035, 0.2, 4), hair), 0.15, 0.17, 0.04, Math.PI, 0, 0.1));
      }
      if (style === 'topknot') g.push(cyl(0.05, 0.06, 0.1, 6, hair, 0, 0.42, -0.04), box(0.16, 0.02, 0.02, GOLD, 0, 0.44, -0.04));
      if (style === 'bun') g.push(T(paint(new THREE.IcosahedronGeometry(0.07, 0), hair), 0, 0.38, -0.1), box(0.2, 0.015, 0.015, GOLD, 0, 0.38, -0.08, 0, 0.5, 0.3));
      if (style === 'wild') for (let i = 0; i < 7; i++) g.push(T(paint(new THREE.ConeGeometry(0.05, 0.22, 4), hair), (i - 3) * 0.045, 0.36, -0.06, -0.6 + (i % 2) * 0.3, 0, (i - 3) * 0.3));
      const hat = spec.hat;
      if (hat === 'band') g.push(cyl(hs * 1.06, hs * 1.06, 0.035, 8, RED, 0, 0.27, -0.01));
      if (hat === 'straw') g.push(cyl(0.02, 0.46, 0.16, 12, hex('#b89a5a'), 0, 0.41, 0), cyl(0.46, 0.46, 0.015, 12, hex('#8a6e3a'), 0, 0.33, 0));
      if (hat === 'gat') g.push(cyl(0.44, 0.44, 0.012, 16, BLACK, 0, 0.36, 0), cyl(0.1, 0.12, 0.18, 10, BLACK, 0, 0.45, 0));
      if (hat === 'hood') g.push(T(paint(new THREE.IcosahedronGeometry(hs * 1.3, 1), spec.hoodColor ? hex(spec.hoodColor) : darker(main, 0.7)), 0, 0.22, -0.05, 0, 0, 0, 1, 1.12, 1.05));
      if (hat === 'crown') g.push(box(0.1, 0.09, 0.14, GOLD, 0, 0.42, -0.02), box(0.24, 0.015, 0.015, GOLD, 0, 0.44, -0.02, 0, Math.PI / 2, 0));
      if (hat === 'guan') g.push(box(0.12, 0.1, 0.16, BLACK, 0, 0.42, -0.03), box(0.3, 0.015, 0.015, GOLD, 0, 0.41, -0.03));
      if (hat === 'horns' || hat === 'horn1') {
        const hc = hex(spec.hornColor || '#e6dcc4');
        if (hat === 'horn1') g.push(T(paint(new THREE.ConeGeometry(0.045, 0.24, 5), hc), 0, 0.45, 0.02));
        else g.push(T(paint(new THREE.ConeGeometry(0.05, 0.3, 5), hc), -0.12, 0.42, 0, 0, 0, 0.5), T(paint(new THREE.ConeGeometry(0.05, 0.3, 5), hc), 0.12, 0.42, 0, 0, 0, -0.5));
      }
      if (hat === 'ears') g.push(T(paint(new THREE.ConeGeometry(0.06, 0.16, 4), hair), -0.1, 0.42, 0, 0, 0, 0.25), T(paint(new THREE.ConeGeometry(0.06, 0.16, 4), hair), 0.1, 0.42, 0, 0, 0, -0.25));
      if (hat === 'helmet') g.push(T(paint(new THREE.IcosahedronGeometry(hs * 1.15, 1), hex('#3a3540')), 0, 0.27, -0.01, 0, 0, 0, 1, 0.85, 1), cyl(0.012, 0.012, 0.18, 4, RED, 0, 0.48, -0.02));
      if (hat === 'qing') g.push(cyl(0.15, 0.17, 0.12, 8, hex('#22242e'), 0, 0.38, 0), box(0.08, 0.2, 0.01, hex('#e8d070'), 0, 0.2, fz + 0.01));
      if (spec.beard) g.push(T(paint(new THREE.ConeGeometry(0.08, 0.32, 5), hex(spec.beard)), 0, -0.02, fz - 0.04, Math.PI));
      P.head = { geo: merge(g), parent: 'torso', at: [0, NECK - WAIST, 0] };
      // long hair / ponytail / headband ribbons stream behind the head
      const streams = [];
      if (style === 'long' || style === 'longwhite') streams.push(cloth(0.26, 0.2, style === 'longwhite' ? 0.95 : 0.75, hair, 0.05));
      if (style === 'pony') streams.push(T(paint(new THREE.CylinderGeometry(0.045, 0.02, 0.7, 5), hair), 0, -0.35, 0), cyl(0.05, 0.05, 0.05, 6, acc, 0, 0, 0));
      if (hat === 'band') streams.push(T(cloth(0.04, 0.03, 0.55, RED, 0.01), -0.03, 0, 0, 0, 0, 0.15), T(cloth(0.04, 0.03, 0.45, RED, 0.01), 0.03, 0, 0, 0, 0, -0.15));
      if (spec.extra === 'scarf') streams.push(cloth(0.12, 0.08, 0.9, acc, 0.02));
      if (streams.length) P.hairS = { geo: merge(streams), parent: 'head', at: [0, style === 'pony' ? 0.36 : 0.3, -0.16] };
    }
    // arms: upper arm and forearm with a wide sleeve; weapons ride in the right hand
    {
      const ua = 0.5 * H, fa = 0.46 * H, shX = 0.34 * SW + 0.06;
      const upper = () => merge([limb(0.11 * L, 0.09 * L, ua, main, 6), T(paint(new THREE.IcosahedronGeometry(0.125 * L, 0), main), 0, -0.02, 0)]);
      const fore = (right) => {
        const g = [limb(0.088 * L, 0.07 * L, fa, spec.bracer ? hex(spec.bracer) : main, 6), box(0.11 * L, 0.12, 0.1, skin, 0, -fa - 0.04, 0.01)];
        if (spec.robe || spec.sleeves) g.push(cyl(0.08, 0.15 * L, fa * 0.6, 6, main, 0, -fa * 0.55, 0), cyl(0.15 * L, 0.155 * L, 0.04, 6, acc, 0, -fa * 0.86, 0));
        const w = spec.weapon, hy = -fa - 0.05;
        // blades point forward-down from the fist; when the arm trails back they stream behind
        if ((w === 'sword' && right) || w === 'twin') g.push(box(0.03, 0.03, 0.18, hex('#2a1c1c'), 0, hy, 0.02), box(0.14, 0.025, 0.04, GOLD, 0, hy, 0.12), box(0.035, 0.012, 1.0, STEEL, 0, hy, 0.64), box(0.018, 0.016, 0.98, STEEL2, 0.012, hy, 0.63), T(paint(new THREE.ConeGeometry(0.025, 0.08, 4), STEEL), 0, hy, 1.17, Math.PI / 2));
        if (spec.tassel && right) g.push(box(0.02, 0.18, 0.02, RED, 0, hy - 0.1, -0.08));
        if (w === 'blade' && right) g.push(box(0.035, 0.035, 0.26, hex('#2a1c1c'), 0, hy, 0.02), box(0.08, 0.18, 1.15, STEEL, 0, hy - 0.04, 0.75), box(0.082, 0.04, 1.1, STEEL2, 0, hy + 0.06, 0.73));
        if (w === 'staff' && right) g.push(cyl(0.025, 0.025, 2.4, 6, WOOD, 0, hy + 0.2, 0.05, 0.25), cyl(0.032, 0.032, 0.08, 6, GOLD, 0, hy + 1.35, 0.35, 0.25));
        if (w === 'spear' && right) g.push(cyl(0.022, 0.022, 2.6, 6, WOOD, 0, hy + 0.3, 0.05, 0.2), T(paint(new THREE.ConeGeometry(0.04, 0.3, 4), STEEL), 0, hy + 1.6, 0.33, 0.2), box(0.03, 0.1, 0.03, RED, 0, hy + 1.38, 0.3));
        if (w === 'fan' && right) g.push(T(paint(new THREE.CylinderGeometry(0.3, 0.3, 0.012, 10, 1, false, -0.9, 1.8), spec.fanColor ? hex(spec.fanColor) : hex('#e8e4da')), 0, hy - 0.05, 0.1, Math.PI / 2, 0, 0));
        if (w === 'bell' && right) g.push(cyl(0.01, 0.01, 0.2, 4, GOLD, 0, hy - 0.1, 0.03), T(paint(new THREE.ConeGeometry(0.07, 0.1, 8), GOLD), 0, hy - 0.24, 0.03));
        if (w === 'talisman' && right) g.push(box(0.1, 0.22, 0.008, hex('#e8d070'), 0, hy - 0.12, 0.06), box(0.02, 0.15, 0.01, RED, 0, hy - 0.12, 0.066));
        if (w === 'club' && right) g.push(cyl(0.035, 0.09, 1.0, 6, spec.clubColor ? hex(spec.clubColor) : hex('#8a6a3a'), 0, hy, 0.5, Math.PI / 2), T(paint(new THREE.ConeGeometry(0.03, 0.08, 4), STEEL), 0.08, hy, 0.85, 0, 0, -Math.PI / 2));
        if (w === 'axe' && right) g.push(cyl(0.02, 0.02, 0.8, 5, WOOD, 0, hy, 0.35, Math.PI / 2), box(0.02, 0.24, 0.18, STEEL, 0, hy + 0.08, 0.68));
        if (w === 'bow' && !right) g.push(T(paint(new THREE.TorusGeometry(0.5, 0.018, 4, 14, Math.PI * 0.9), WOOD), 0, hy, 0.12, 0, Math.PI / 2, Math.PI * 0.55));
        if (w === 'flask' && right) g.push(cyl(0.05, 0.08, 0.16, 6, hex('#4aa03a'), 0, hy - 0.08, 0.04));
        if (w === 'needle' && right) for (let i = 0; i < 3; i++) g.push(box(0.008, 0.008, 0.26, STEEL, (i - 1) * 0.025, hy, 0.14));
        if (w === 'claw') for (let i = 0; i < 3; i++) g.push(box(0.012, 0.012, 0.2, STEEL, (i - 1) * 0.03, hy - 0.02, 0.12));
        return merge(g);
      };
      P.upperL = { geo: upper(), parent: 'torso', at: [-shX, SHO - WAIST - 0.05, 0] };
      P.foreL = { geo: fore(false), parent: 'upperL', at: [0, -ua, 0] };
      P.upperR = { geo: upper(), parent: 'torso', at: [shX, SHO - WAIST - 0.05, 0] };
      P.foreR = { geo: fore(true), parent: 'upperR', at: [0, -ua, 0] };
    }
    return { P, height: NECK + 0.45 };
  }

  // ---------- instancing + skeleton pose ----------
  const ORDER = ['torso', 'head', 'hairS', 'flapB', 'flapL', 'flapR', 'cape', 'upperL', 'foreL', 'upperR', 'foreR', 'thighL', 'shinL', 'thighR', 'shinR'];
  function makeType(spec, col, cap) {
    const { P, height } = makeBody(spec, col);
    const mat = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true, side: THREE.DoubleSide });
    const meshes = {};
    for (const k of ORDER) {
      if (!P[k]) continue;
      const m = new THREE.InstancedMesh(P[k].geo, mat, cap);
      m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      m.count = 0; m.frustumCulled = false; m.castShadow = true;
      m.setColorAt(0, new THREE.Color(1, 1, 1));
      meshes[k] = m;
    }
    const group = new THREE.Group();
    for (const m of Object.values(meshes)) group.add(m);
    const free = [];
    let used = 0;
    const W = {}; for (const k of ORDER) W[k] = new THREE.Matrix4();
    W.root = new THREE.Matrix4();
    const Q = new THREE.Quaternion(), E = new THREE.Euler(), Vv = new THREE.Vector3(), Sv = new THREE.Vector3(), L = new THREE.Matrix4(), col3 = new THREE.Color();
    const hidden = new THREE.Matrix4().makeScale(0, 0, 0);
    return {
      group, height, spec,
      alloc() {
        const i = free.length ? free.pop() : used++;
        if (i >= cap) return -1;
        for (const m of Object.values(meshes)) { m.count = Math.max(m.count, i + 1); m.setColorAt(i, col3.setRGB(1, 1, 1)); m.instanceColor.needsUpdate = true; }
        return i;
      },
      release(i) {
        if (i < 0) return;
        free.push(i);
        for (const m of Object.values(meshes)) { m.setMatrixAt(i, hidden); m.instanceMatrix.needsUpdate = true; }
      },
      // st: { x, y, z, yaw, s, phase, move (0..1), atk (0..1 swing progress), hurt, dead, t, tint }
      pose(i, st) {
        if (i < 0) return;
        const mv = st.move || 0, ph = st.phase || 0, hurt = st.hurt || 0, t = st.t || 0;
        const atk = st.atk > 0 && st.atk < 1 ? st.atk : 0;
        const s = Math.sin(ph), c2 = Math.cos(ph);
        const run = mv;
        const bob = spec.float ? 0.4 + Math.sin(t * 3) * 0.1 : Math.abs(Math.cos(ph)) * 0.08 * run;
        const wind = Math.sin(t * 3.1) * 0.08 + Math.sin(t * 5.3) * 0.04;
        // swing: wind-up behind (0→0.35) then a fast cut across (0.35→1)
        const cut = atk ? (atk < 0.35 ? -atk / 0.35 : -1 + (atk - 0.35) / 0.65 * 2.2) : 0;
        const R = {
          torso: [0.32 * run + (spec.build === 'old' ? 0.18 : 0) - hurt * 0.4 + (atk ? 0.15 : 0), s * 0.18 * run + cut * 0.5, 0],
          head: [-0.22 * run + Math.sin(t * 2) * 0.02, -s * 0.12 * run - cut * 0.25, 0],
          hairS: [0.25 + run * 1.0 + wind, 0, Math.sin(t * 4) * 0.1],
          flapB: [0.12 + run * 0.95 + wind * 0.8, 0, 0],
          flapL: [-0.05 + Math.max(0, -s) * 0.6 * run + run * 0.35 + wind * 0.5, 0, 0.08],
          flapR: [-0.05 + Math.max(0, s) * 0.6 * run + run * 0.35 + wind * 0.5, 0, -0.08],
          cape: [0.1 + run * 1.1 + wind, 0, 0],
          // left arm pumps; sword arm trails back while running, then cuts on attack
          upperL: [s * 0.9 * run + (spec.weapon === 'bow' ? -1.3 : 0) + (spec.pose === 'zombie' ? -1.5 : 0) + (spec.float ? -0.3 : 0), 0, 0.12],
          foreL: [-0.6 - 0.5 * run + (spec.pose === 'zombie' ? 0.2 : 0), 0, 0],
          upperR: [atk ? -1.6 + cut * -1.4 : (spec.weapon === 'sword' || spec.weapon === 'blade' || spec.weapon === 'twin' ? 0.7 * run - s * 0.3 * run + 0.15 : -s * 0.9 * run) + (spec.pose === 'zombie' ? -1.5 : 0) + (spec.weapon === 'staff' || spec.weapon === 'spear' ? -0.3 : 0), atk ? cut * 0.6 : 0, -0.12 - (atk ? 0.4 : 0)],
          foreR: [atk ? -0.25 : -0.35 - 0.3 * run, 0, 0],
          thighL: [-s * 0.95 * run - (atk ? 0.3 : 0), 0, 0.03],
          shinL: [Math.max(0, s) * 1.3 * run + 0.08 + (atk ? 0.3 : 0), 0, 0],
          thighR: [s * 0.95 * run + (atk ? 0.35 : 0), 0, -0.03],
          shinR: [Math.max(0, -s) * 1.3 * run + 0.08, 0, 0],
        };
        // root
        E.set(-(st.dead || 0) * 1.4, st.yaw || 0, 0, 'YXZ');
        Q.setFromEuler(E);
        W.root.compose(Vv.set(st.x, st.y + bob, st.z), Q, Sv.setScalar(st.s || 1));
        for (const k of ORDER) {
          const p = P[k]; if (!p) continue;
          const r = R[k] || [0, 0, 0];
          Q.setFromEuler(E.set(r[0], r[1], r[2], 'XYZ'));
          L.compose(Vv.set(p.at[0], p.at[1], p.at[2]), Q, Sv.set(1, 1, 1));
          W[k].multiplyMatrices(W[p.parent], L);
          meshes[k].setMatrixAt(i, W[k]);
          meshes[k].instanceMatrix.needsUpdate = true;
        }
        if (st.tint !== undefined) {
          col3.copy(st.tint || col3.setRGB(1, 1, 1));
          for (const m of Object.values(meshes)) { m.setColorAt(i, col3); m.instanceColor.needsUpdate = true; }
        }
      },
    };
  }

  const cache = {};
  const imgs = {};
  const load = (src) => imgs[src] || (imgs[src] = new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = src; }));
  function get(key, src, spec, cap) {
    const id = key + '|' + cap;
    if (!cache[id]) cache[id] = load(src).then((im) => makeType(spec, analyse(im), cap));
    return cache[id];
  }
  return { get, analyse };
})();
