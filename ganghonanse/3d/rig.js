// Voxel ("3D 도트") figures with long, heroic proportions (~32 cubes tall). Each body part is modelled cube
// by cube from a spec (hair, hat, weapon, robe, build) using colours read from the character's pixel sprite,
// then meshed with per-cube colour jitter and corner ambient occlusion. Parts are InstancedMeshes, so a
// crowd of one kind of foe costs 6 draw calls; pose() writes per-instance matrices for run/attack/flinch.
window.Rig = (() => {
  const V = 0.075; // world size of one cube
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
    let skin = [236, 196, 160];
    { const s = band(0.1, 0.55, false).find((c) => isSkin(c[0], c[1], c[2])); if (s) skin = s; }
    const hair = hairs[0] || [40, 34, 40];
    const main = body.find((c) => far(c, skin)) || hair;
    const accent = body.find((c) => far(c, main) && far(c, skin)) || main.map((v) => Math.min(255, v * 1.35));
    const pants = low.find((c) => far(c, skin)) || main;
    return { skin: C(...skin), hair: C(...hair), main: C(...main), accent: C(...accent), pants: C(...pants) };
  }

  // ---------- a tiny voxel modeller ----------
  class Grid {
    constructor() { this.m = new Map(); }
    key(x, y, z) { return (x + 512) * 1048576 + (y + 512) * 1024 + (z + 512); }
    set(x, y, z, c) { if (c) this.m.set(this.key(x, y, z), [x, y, z, c]); else this.m.delete(this.key(x, y, z)); }
    has(x, y, z) { return this.m.has(this.key(x, y, z)); }
    get(x, y, z) { const v = this.m.get(this.key(x, y, z)); return v && v[3]; }
    box(x0, y0, z0, x1, y1, z1, c) { for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) for (let z = z0; z <= z1; z++) this.set(x, y, z, typeof c === 'function' ? c(x, y, z) : c); }
    paint(x0, y0, z0, x1, y1, z1, c) { for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) for (let z = z0; z <= z1; z++) if (this.has(x, y, z)) this.set(x, y, z, typeof c === 'function' ? c(x, y, z) : c); }
    // (ox, oy, oz): grid point that becomes the part's pivot
    mesh(ox, oy, oz) {
      const pos = [], nor = [], col = [];
      const FACES = [
        [[1, 0, 0], [[1, 0, 0], [1, 1, 0], [1, 1, 1], [1, 0, 1]], 0.82],
        [[-1, 0, 0], [[0, 0, 1], [0, 1, 1], [0, 1, 0], [0, 0, 0]], 0.78],
        [[0, 1, 0], [[0, 1, 1], [1, 1, 1], [1, 1, 0], [0, 1, 0]], 1.0],
        [[0, -1, 0], [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]], 0.55],
        [[0, 0, 1], [[1, 0, 1], [1, 1, 1], [0, 1, 1], [0, 0, 1]], 0.92],
        [[0, 0, -1], [[0, 0, 0], [0, 1, 0], [1, 1, 0], [1, 0, 0]], 0.7],
      ];
      const AO = [1, 0.8, 0.66, 0.55];
      const t = new THREE.Color();
      for (const [x, y, z, c] of this.m.values()) {
        const j = 0.94 + ((((x * 73856093) ^ (y * 19349663) ^ (z * 83492791)) >>> 0) % 13) / 100;
        for (const [n, quad, shade] of FACES) {
          if (this.has(x + n[0], y + n[1], z + n[2])) continue;
          const axes = [0, 1, 2].filter((k) => n[k] === 0);
          const ao = quad.map((q) => {
            const s0 = q[axes[0]] ? 1 : -1, s1 = q[axes[1]] ? 1 : -1;
            const e1 = [...n], e2 = [...n], cr = [...n];
            e1[axes[0]] = s0; e2[axes[1]] = s1; cr[axes[0]] = s0; cr[axes[1]] = s1;
            const a = this.has(x + e1[0], y + e1[1], z + e1[2]), b = this.has(x + e2[0], y + e2[1], z + e2[2]), c2 = this.has(x + cr[0], y + cr[1], z + cr[2]);
            return AO[a && b ? 3 : (a ? 1 : 0) + (b ? 1 : 0) + (c2 ? 1 : 0)];
          });
          const order = ao[0] + ao[2] > ao[1] + ao[3] ? [0, 1, 2, 0, 2, 3] : [1, 2, 3, 1, 3, 0];
          for (const k of order) {
            const q = quad[k];
            pos.push((x + q[0] - ox) * V, (y + q[1] - oy) * V, (z + q[2] - oz) * V);
            nor.push(n[0], n[1], n[2]);
            t.copy(c).multiplyScalar(shade * j * ao[k]);
            col.push(t.r, t.g, t.b);
          }
        }
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
      g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
      g.computeBoundingSphere();
      return g;
    }
  }
  const lighter = (c, k = 1.25) => c.clone().multiplyScalar(k);
  const darker = (c, k = 0.7) => c.clone().multiplyScalar(k);
  const STEEL = hex('#dfe6f0'), STEEL2 = hex('#9aa6b8'), GOLD = hex('#e8b84a'), WOOD = hex('#7a5232'), BLACK = hex('#1c1820'), WHITE = hex('#f2efe6'), RED = hex('#c8343a'), PAPER = hex('#f0d878'), EYE = hex('#15121c');

  // ---------- body plan (cube units; +z faces the camera, +y up) ----------
  function makeParts(spec, col) {
    const build = spec.build || 'm';
    const K = { m: { w: 8, legH: 16, torH: 11, d: 5, arm: 13 }, f: { w: 7, legH: 16, torH: 10, d: 4, arm: 12 }, big: { w: 11, legH: 14, torH: 13, d: 7, arm: 14 },
      kid: { w: 7, legH: 10, torH: 8, d: 5, arm: 9 }, old: { w: 8, legH: 14, torH: 11, d: 5, arm: 12 }, thin: { w: 6, legH: 17, torH: 11, d: 4, arm: 13 } }[build];
    const skin = spec.skinColor ? hex(spec.skinColor) : col.skin;
    const hair = spec.hairColor ? hex(spec.hairColor) : col.hair;
    const main = spec.mainColor ? hex(spec.mainColor) : col.main;
    const acc = spec.accColor ? hex(spec.accColor) : col.accent;
    const pants = spec.pantsColor ? hex(spec.pantsColor) : spec.robe === 'long' ? darker(main, 0.8) : col.pants;
    const belt = spec.beltColor ? hex(spec.beltColor) : darker(acc, 0.85);
    const { w: W, legH: LH, torH: TH, d: D, arm: AH } = K;
    const half = Math.floor(W / 2);
    const parts = {};

    // legs: trousers, wrapped shins, boots with a toe
    const lw = build === 'big' ? 4 : 3;
    const leg = () => {
      const g = new Grid();
      const shoe = spec.shoe ? hex(spec.shoe) : BLACK;
      g.box(0, 3, 0, lw - 1, LH - 1, 2, pants);
      g.box(0, 3, 0, lw - 1, 5, 2, spec.wrap ? hex(spec.wrap) : lighter(pants, 1.15));
      g.box(0, 0, 0, lw - 1, 2, 3, shoe);
      g.box(0, 2, 0, lw - 1, 2, 2, lighter(shoe, 1.6));
      return g.mesh(lw / 2, LH, 1.5);
    };
    const hipY = LH * V;
    const lx = (lw / 2 + 0.4) * V;
    if (!spec.float) { parts.legL = { geo: leg(), pivot: [-lx, hipY, 0] }; parts.legR = { geo: leg(), pivot: [lx, hipY, 0] }; }

    // torso: crossed-collar robe, sash, shoulders; skirt for robes; back extras
    {
      const g = new Grid();
      const zf = D - 1;
      for (let y = 0; y < TH; y++) { const taper = y < 3 ? 1 : 0; g.box(taper, y, 0, W - 1 - taper, y, zf, main); }
      g.box(-1, TH - 2, 0, W, TH - 1, zf, main);
      for (let y = TH - 1; y >= 2; y--) {
        const x = Math.round(half - 1 + (TH - 1 - y) * 0.55);
        g.set(x, y, zf, acc); g.set(x + 1, y, zf, acc);
        if (y > TH - 4) for (let k = half - 1 - (TH - 1 - y); k < x; k++) g.set(k, y, zf, spec.inner ? hex(spec.inner) : WHITE);
      }
      g.paint(-1, TH - 1, 0, W, TH - 1, zf, (x, y, z) => lighter(g.get(x, y, z), 1.08));
      g.box(0, 0, -1, W - 1, 1, zf + 1, belt);
      g.box(half - 1, 0, zf + 1, half, 1, zf + 1, spec.knot ? hex(spec.knot) : GOLD);
      if (spec.robe) {
        const L = spec.robe === 'long' ? LH - 2 : Math.round(LH * 0.55);
        for (let i = 1; i <= L; i++) {
          const f = Math.floor(i / 4);
          for (let x = -f; x <= W - 1 + f; x++) for (let z = -f; z <= zf + f; z++) {
            const edge = x === -f || x === W - 1 + f || z === -f || z === zf + f;
            if (!edge) continue;
            if (z === zf + f && x >= half - 1 && x <= half && i > 2) continue; // front slit so legs can stride
            g.set(x, -i, z, i === L ? acc : main);
          }
        }
        for (let i = 1; i <= L; i++) g.set(half + 1, -i, zf + Math.floor(i / 4), acc);
      }
      if (build === 'big') { g.box(-2, TH - 3, -1, 0, TH, zf + 1, darker(main, 0.85)); g.box(W - 1, TH - 3, -1, W + 1, TH, zf + 1, darker(main, 0.85)); }
      if (spec.extra === 'cape') g.box(-1, -LH + 3, -2, W, TH - 1, -2, (x, y) => (y < -LH + 5 ? acc : darker(acc, 0.9)));
      if (spec.extra === 'tails') {
        for (let t = 0; t < 3; t++) {
          const bx = 1 + t * 2.5;
          for (let i = 0; i < 12; i++) {
            const r = i < 3 || i > 9 ? 1 : 2, cx2 = Math.round(bx + (t - 1) * i * 0.35), cy = 1 + Math.round(i * 0.7), cz = -1 - i;
            g.box(cx2 - r + 1, cy - r + 1, cz, cx2 + r - 1, cy + r - 1, cz, i > 9 ? WHITE : hair);
          }
        }
      }
      if (spec.extra === 'beads') for (let x = 1; x < W - 1; x++) g.set(x, TH - 1 - (x === 1 || x === W - 2 ? 0 : 1), zf + 1, x % 2 ? hex('#6a2a1a') : hex('#8a4a2a'));
      if (spec.extra === 'gourd') { g.box(W, 0, 1, W + 1, 2, 2, hex('#c8963c')); g.box(W, 3, 1, W, 4, 1, hex('#c8963c')); }
      if (spec.extra === 'sheath') g.box(-1, -6, -1, -1, 2, -1, hex('#3a2a2a'));
      if (spec.extra === 'quiver') { g.box(W - 3, 2, -2, W - 2, TH + 2, -2, WOOD); g.box(W - 3, TH + 3, -2, W - 2, TH + 3, -2, hex('#e8e0c0')); }
      parts.torso = { geo: g.mesh(W / 2, 0, D / 2), pivot: [0, hipY + V, 0] };
    }

    // head: skull, face pixels, hair styles, hats
    {
      const g = new Grid();
      const HS = 8, F = HS - 1, ey = 3;
      g.box(0, 0, 0, HS - 1, HS - 1, HS - 1, skin);
      g.box(3, -1, 3, 4, -1, 4, darker(skin, 0.9));
      const face = spec.face || (build === 'f' ? 'girl' : 'boy');
      const eye = hex(spec.eyes || (face === 'demon' ? '#ffd23a' : '#15121c'));
      if (face === 'skull') {
        g.paint(0, 0, 0, HS - 1, HS - 1, HS - 1, hex('#e8e4d8'));
        g.box(1, 3, F, 2, 4, F, EYE); g.box(5, 3, F, 6, 4, F, EYE); g.set(3, 2, F, EYE); g.set(4, 2, F, EYE);
        for (let x = 1; x < 7; x += 2) g.set(x, 0, F, EYE);
      } else if (face === 'mask') {
        g.box(0, 0, F, HS - 1, 3, F, darker(spec.hoodColor ? hex(spec.hoodColor) : main, 0.6));
        g.set(1, ey + 1, F, eye); g.set(2, ey + 1, F, eye); g.set(5, ey + 1, F, eye); g.set(6, ey + 1, F, eye);
      } else {
        const tall = face === 'old' ? 1 : 2;
        for (const ex of [1, 5]) {
          g.box(ex, ey, F, ex + 1, ey + tall - 1, F, eye);
          if (face !== 'demon' && face !== 'old') g.set(ex + (ex < 4 ? 1 : 0), ey + tall - 1, F, WHITE);
          if (face === 'demon') g.set(ex + (ex < 4 ? 1 : 0), ey, F, BLACK);
        }
        if (face === 'girl') { g.set(0, ey + 2, F, EYE); g.set(7, ey + 2, F, EYE); g.set(1, ey - 1, F, hex('#f08a96')); g.set(6, ey - 1, F, hex('#f08a96')); g.set(3, 1, F, hex('#c06060')); g.set(4, 1, F, hex('#c06060')); }
        else if (face === 'demon') { g.box(2, 0, F, 5, 1, F, hex('#3a1418')); g.set(2, 1, F, WHITE); g.set(5, 1, F, WHITE); g.box(1, ey + 2, F, 2, ey + 2, F, BLACK); g.box(5, ey + 2, F, 6, ey + 2, F, BLACK); }
        else {
          const by = ey + 2 + (face === 'old' ? -1 : 0), brow = face === 'old' ? WHITE : darker(hair, 0.8);
          g.box(1, by, F, 2, by, F, brow); g.box(5, by, F, 6, by, F, brow);
          if (spec.angry) { g.set(2, by + 1, F, null); g.set(1, by + 1, F, brow); g.set(6, by + 1, F, brow); }
          g.box(3, 1, F, 4, 1, F, darker(skin, spec.angry ? 0.6 : 0.72));
        }
        if (spec.scar) for (let y = 1; y < 6; y++) g.set(6, y, F, hex('#a03a3a'));
      }
      const style = spec.hair || 'short';
      if (style !== 'bald' && face !== 'skull') {
        g.box(-1, HS - 1, -1, HS, HS, HS - 1, hair);
        g.box(-1, 1, -1, HS, HS - 1, 0, hair);
        g.box(-1, 3, 0, -1, HS - 1, HS - 2, hair); g.box(HS, 3, 0, HS, HS - 1, HS - 2, hair);
        for (let x = -1; x <= HS; x++) if (x % 3 !== 0) g.set(x, HS - 1, HS, hair);
        g.set(-1, 2, HS - 2, hair); g.set(HS, 2, HS - 2, hair);
        g.paint(-1, HS, -1, HS, HS, HS, (x, y, z) => lighter(g.get(x, y, z), 1.18));
      }
      if (style === 'topknot') { g.box(3, HS + 1, 2, 4, HS + 2, 3, hair); g.box(1, HS + 2, 2, 6, HS + 2, 2, GOLD); }
      if (style === 'long' || style === 'longwhite') g.box(-1, style === 'longwhite' ? -9 : -7, -2, HS, 2, -1, hair);
      if (style === 'pony') { g.box(3, HS - 2, -2, 4, HS - 1, -2, acc); for (let i = 0; i < 9; i++) g.box(3, HS - 3 - i, -3 - Math.floor(i / 4), 4, HS - 3 - i, -3 - Math.floor(i / 4), hair); }
      if (style === 'bun') { g.box(0, HS + 1, 1, 1, HS + 2, 2, hair); g.box(6, HS + 1, 1, 7, HS + 2, 2, hair); g.set(1, HS + 2, 3, acc); g.set(6, HS + 2, 3, acc); }
      if (style === 'wild') for (let i = 0; i < 8; i++) { g.box(i, HS + 1, 1 + (i % 3), i, HS + 2 + (i % 2), 1 + (i % 3), hair); g.set(i + (i < 4 ? -1 : 1), HS + 3, 1, hair); }
      const hat = spec.hat;
      if (hat === 'band') { g.box(-1, HS - 3, -1, HS, HS - 3, HS, RED); for (let i = 0; i < 6; i++) { g.set(2 - Math.floor(i / 2), HS - 4 - i, -2 - Math.floor(i / 3), RED); g.set(5 + Math.floor(i / 3), HS - 4 - i, -2 - Math.floor(i / 2), RED); } }
      if (hat === 'straw') for (let ring = 0; ring < 4; ring++) { const r = 8 - ring * 2.2; for (let x = -9; x <= 16; x++) for (let z = -9; z <= 16; z++) { const dd = Math.hypot(x - 3.5, z - 3.5); if (dd <= r && dd > r - 2.6) g.set(x, HS + ring, z, ring % 2 ? hex('#b89850') : hex('#d4b46a')); } }
      if (hat === 'gat') for (let x = -6; x <= 13; x++) for (let z = -6; z <= 13; z++) { const dd = Math.hypot(x - 3.5, z - 3.5); if (dd <= 9.5) g.set(x, HS + 1, z, BLACK); if (dd <= 3) g.box(x, HS + 2, z, x, HS + 5, z, BLACK); }
      if (hat === 'hood') { const hc = spec.hoodColor ? hex(spec.hoodColor) : darker(main, 0.75); g.box(-1, -1, -2, HS, HS + 1, -1, hc); g.box(-1, 0, -1, -1, HS + 1, HS, hc); g.box(HS, 0, -1, HS, HS + 1, HS, hc); g.box(-1, HS, -1, HS, HS + 1, HS, hc); }
      if (hat === 'crown') { g.box(2, HS + 1, 2, 5, HS + 3, 5, GOLD); g.box(-1, HS + 2, 3, HS, HS + 2, 3, GOLD); g.set(3, HS + 4, 3, RED); }
      if (hat === 'horns' || hat === 'horn1') {
        const hc = hex(spec.hornColor || '#f2e8d0');
        for (const bx of hat === 'horn1' ? [3] : [0, 7]) for (let i = 0; i < 5; i++) g.set(bx + (hat === 'horn1' ? 0 : bx < 3 ? -Math.floor(i / 2) : Math.floor(i / 2)), HS + 1 + i, 3, i > 3 ? WHITE : hc);
      }
      if (hat === 'ears') for (const bx of [0, 6]) { g.box(bx, HS + 1, 3, bx + 1, HS + 2, 4, hair); g.set(bx + (bx ? 1 : 0), HS + 3, 3, hair); g.set(bx + (bx ? 0 : 1), HS + 1, 5, hex('#f0a0b0')); }
      if (hat === 'helmet') { g.box(-1, HS - 2, -1, HS, HS + 1, HS, hex('#4a4450')); g.box(3, HS + 2, 2, 4, HS + 4, 4, RED); g.box(-1, HS - 2, HS, HS, HS - 2, HS, GOLD); }
      if (hat === 'qing') { g.box(-1, HS, -1, HS, HS + 2, HS, hex('#2a2c3a')); g.box(3, HS + 3, 3, 4, HS + 3, 4, RED); for (let y = 0; y < 5; y++) g.box(3, y, HS, 4, y, HS, PAPER); g.set(3, 2, HS, RED); }
      if (hat === 'guan') { g.box(2, HS + 1, 1, 5, HS + 2, 5, BLACK); g.box(-1, HS + 1, 3, HS, HS + 1, 3, GOLD); }
      if (spec.beard) { const bc = hex(spec.beard); g.box(1, -4, F, 6, 1, F, bc); g.box(2, -6, F, 5, -5, F, bc); g.box(0, 2, F, 1, 3, F, bc); g.box(6, 2, F, 7, 3, F, bc); }
      parts.head = { geo: g.mesh(HS / 2, -1, HS / 2), pivot: [0, hipY + V * (TH + 2), 0] };
    }

    // arms: sleeve flaring at the cuff, hand, held weapon
    const arm = (right) => {
      const g = new Grid();
      g.box(0, 3, 0, 2, AH - 1, 2, main);
      g.box(0, AH - 2, 0, 2, AH - 1, 2, lighter(main, 1.06));
      if (spec.robe || spec.sleeves) { g.box(-1, 2, -1, 3, 4, 3, main); g.box(-1, 2, -1, 3, 2, 3, acc); }
      else g.box(0, 3, 0, 2, 3, 2, acc);
      g.box(0, 0, 0, 2, 2, 2, skin);
      if (spec.bracer) g.box(0, 3, 0, 2, 5, 2, hex(spec.bracer));
      const w = spec.weapon, hz = 3;
      if ((w === 'sword' && right) || w === 'twin') {
        g.box(1, 1, hz - 2, 1, 1, hz - 1, hex('#3a2a2a'));
        g.box(0, 1, hz, 2, 1, hz, GOLD); g.box(1, 0, hz, 1, 2, hz, GOLD);
        for (let i = 1; i <= 15; i++) { g.set(1, 1, hz + i, i === 15 ? STEEL2 : STEEL); if (i < 14) g.set(1, 2, hz + i, STEEL2); }
        if (spec.tassel) g.box(1, -2, hz - 2, 1, 0, hz - 2, RED);
      }
      if (w === 'blade' && right) {
        g.box(1, 1, hz - 3, 1, 1, hz - 1, hex('#3a2a2a')); g.box(0, 0, hz, 2, 3, hz, hex('#5a4a3a'));
        for (let i = 1; i <= 17; i++) g.box(1, 0, hz + i, 1, i > 15 ? 2 : 3, hz + i, i % 5 === 0 ? STEEL2 : STEEL);
      }
      if (w === 'staff' && right) { g.box(1, -14, 1, 1, 16, 1, WOOD); g.box(1, 16, 1, 1, 17, 1, GOLD); g.box(1, -15, 1, 1, -14, 1, GOLD); }
      if (w === 'spear' && right) { g.box(1, -12, 1, 1, 20, 1, WOOD); g.box(1, 21, 1, 1, 24, 1, STEEL); g.set(0, 21, 1, STEEL); g.set(2, 21, 1, STEEL); g.box(1, 19, 2, 1, 20, 2, RED); }
      if (w === 'fan' && right) { const fc = spec.fanColor ? hex(spec.fanColor) : WHITE; for (let a = 0; a < 7; a++) for (let r = 1; r < 7; r++) { const t = (a / 6 - 0.5) * 1.6; g.set(1 + Math.round(Math.sin(t) * r), Math.round(Math.cos(t) * r) - 1, hz, r === 6 ? acc : fc); } }
      if (w === 'bell' && right) { g.box(1, -3, 1, 1, 0, 1, GOLD); g.box(0, -6, 0, 2, -4, 2, GOLD); g.box(-1, -6, -1, 3, -6, 3, GOLD); g.box(1, -7, 1, 1, -7, 1, RED); }
      if (w === 'talisman' && right) { g.box(0, -6, hz - 1, 2, -1, hz - 1, PAPER); g.box(1, -5, hz - 1, 1, -2, hz - 1, RED); }
      if (w === 'club' && right) { for (let i = 0; i < 13; i++) { const r = i > 7 ? 1 : 0; g.box(1 - r, 1 - r, hz + i - 2, 1 + r, 1 + r, hz + i - 2, i > 7 ? hex(spec.clubColor || '#b88a3a') : WOOD); } g.set(1, 3, hz + 8, STEEL); g.set(-1, 1, hz + 9, STEEL); g.set(3, 1, hz + 10, STEEL); }
      if (w === 'axe' && right) { g.box(1, 1, hz - 2, 1, 1, hz + 8, WOOD); g.box(1, -2, hz + 6, 1, 4, hz + 8, STEEL); g.box(1, -3, hz + 7, 1, 5, hz + 7, STEEL2); }
      if (w === 'bow' && !right) for (let i = -9; i <= 9; i++) { g.set(1, 1 + i, hz + Math.round(3 - Math.abs(i) * 0.33), WOOD); if (Math.abs(i) < 9) g.set(1, 1 + i, hz - 1, hex('#e8e0c0')); }
      if (w === 'flask' && right) { g.box(0, -4, 1, 2, -1, 3, hex('#5ac04a')); g.box(1, 0, 2, 1, 0, 2, hex('#8a6a4a')); }
      if (w === 'needle' && right) for (let i = 0; i < 3; i++) g.box(i, -6, hz, i, -1, hz, STEEL);
      if (w === 'claw') for (let i = 0; i < 3; i++) g.box(i, -3, hz - 1, i, 0, hz - 1, STEEL);
      return g.mesh(1.5, AH, 1.5);
    };
    const shx = (W / 2 + 1.5) * V, shy = hipY + V * (TH - 0.5);
    parts.armL = { geo: arm(false), pivot: [-shx, shy, 0] };
    parts.armR = { geo: arm(true), pivot: [shx, shy, 0] };
    return { parts, height: hipY + V * (TH + 10) };
  }

  // ---------- instanced type ----------
  function makeType(spec, col, cap) {
    const { parts, height } = makeParts(spec, col);
    const mat = new THREE.MeshLambertMaterial({ vertexColors: true });
    const meshes = {};
    for (const [k, p] of Object.entries(parts)) {
      const m = new THREE.InstancedMesh(p.geo, mat, cap);
      m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      m.count = 0; m.frustumCulled = false; m.castShadow = true;
      m.setColorAt(0, new THREE.Color(1, 1, 1));
      meshes[k] = m;
    }
    const group = new THREE.Group();
    for (const m of Object.values(meshes)) group.add(m);
    const free = [];
    let used = 0;
    const M = new THREE.Matrix4(), R = new THREE.Matrix4(), Pm = new THREE.Matrix4(), tmp = new THREE.Matrix4();
    const Q = new THREE.Quaternion(), E = new THREE.Euler(), Vv = new THREE.Vector3(), Sv = new THREE.Vector3(), col3 = new THREE.Color();
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
      // st: { x, y, z, yaw, s, phase, move, atk, hurt, dead, t, tint }
      pose(i, st) {
        if (i < 0) return;
        const mv = st.move || 0, ph = st.phase || 0, atk = st.atk || 0, hurt = st.hurt || 0, t = st.t || 0;
        const bob = spec.float ? 0.35 + Math.sin(t * 3) * 0.12 : Math.abs(Math.sin(ph)) * 0.1 * mv + Math.sin(t * 2.2) * 0.012;
        E.set(-hurt * 0.35 - (st.dead || 0) * 1.45, st.yaw || 0, 0, 'YXZ');
        Q.setFromEuler(E);
        M.compose(Vv.set(st.x, st.y + bob, st.z), Q, Sv.setScalar(st.s || 1));
        const lean = 0.18 * mv - hurt * 0.25;
        const set = (k, rx, ry = 0, rz = 0) => {
          const m = meshes[k]; if (!m) return;
          const p = parts[k];
          Pm.makeTranslation(p.pivot[0], p.pivot[1], p.pivot[2]);
          R.makeRotationFromEuler(E.set(rx, ry, rz, 'XYZ'));
          tmp.multiplyMatrices(M, Pm).multiply(R);
          m.setMatrixAt(i, tmp);
          m.instanceMatrix.needsUpdate = true;
        };
        const sw = Math.sin(ph) * mv;
        const stride = spec.robe === 'long' ? 0.6 : 0.85;
        set('torso', lean, Math.sin(ph) * 0.12 * mv);
        set('head', -lean * 0.5 + Math.sin(t * 2.2) * 0.025);
        const swing = atk > 0 ? -2.5 * Math.sin(Math.min(1, atk) * Math.PI) : 0;
        const zombie = spec.pose === 'zombie' ? -1.45 : 0, flt = spec.float ? -0.4 : 0;
        set('armL', -sw * 0.9 + zombie + flt + (spec.weapon === 'bow' ? -1.2 : 0), 0, 0.08);
        set('armR', sw * 0.9 + zombie + flt + swing + (spec.weapon === 'staff' || spec.weapon === 'spear' ? -0.25 : 0), 0, -0.08);
        set('legL', sw * stride);
        set('legR', -sw * stride);
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
  return { get, analyse, V };
})();
