// 강호난세 3D: the 2D game's heroes, foes, chapters and techniques in a real 3D world (Three.js).
// Rules run on the x/z plane with a height function H(x, z); characters are rigged low-poly models
// (chars.js) and the scene is drawn at low resolution and scaled up with hard pixels.
import * as THREE from 'three';
import { loadBases, defineKind, spawnChar, spawnCrowdChar, updateCrowds } from './chars.js';
import { mergeGeometries } from './lib/BufferGeometryUtils.js';
import { HERO_KINDS, FOE_KINDS } from './kinds.js';
import { createFX } from './fx.js';
import { createArts, HERO_DATA, PASSIVES, PASSIVE_BY_ID, SECTS } from './arts.js';
import * as M from './meta.js';
import { createSound } from './sfx.js';
(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const IS_TOUCH = matchMedia('(pointer: coarse)').matches;
  const rand = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const smooth = (e0, e1, x) => { const t = clamp((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); };
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const shuffle = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  function seeded(seed) { let s = seed >>> 0 || 1; return () => ((s = Math.imul(s ^ (s >>> 15), 2246822519) + 0x9e3779b9 >>> 0) / 4294967296); }
  let lowFx = IS_TOUCH;
  const A = (p) => (window.__A && window.__A[p]) || '../assets/' + p;
  M.setAssetResolver(A);
  const SND = createSound(M.settings), sfx = SND.sfx;
  M.setSound(sfx);

  // ---------- 데이터 (2D 판에서 가져옴; 거리 단위: 2D 픽셀 / PX) ----------
  const PX = 23;
  const HEROES = HERO_DATA;
  // name, hp, speed(px/s), damage, radius(px), xp, sprite size(px), weight, ai
  const E = (name, hp, spd, dmg, r, xp, size, w, o = {}) => ({ name, hp, spd, dmg, r, xp, size, w, ...o });
  const ENEMIES = {
    wisp: E('도깨비불', 10, 85, 6, 12, 3, 44, 3, { fly: 1.4 }),
    dokkaebi: E('꼬마도깨비', 26, 62, 10, 15, 7, 50, 2),
    crow: E('까마귀요괴', 8, 120, 4, 11, 3, 44, 1.5, { fly: 2.4 }),
    meok: E('먹물요괴', 24, 75, 8, 14, 6, 48, 1.2),
    jangseung: E('돌장승', 70, 38, 12, 16, 12, 56, 1),
    wongwi: E('원귀', 22, 88, 7, 14, 8, 50, 1, { fly: 0.8, alpha: 0.85 }),
    gangsi: E('강시', 40, 70, 11, 15, 9, 52, 1.2, { hop: true }),
    eodukssini: E('어둑시니', 30, 80, 10, 15, 9, 54, 1),
    bulgasari: E('불가사리', 160, 34, 16, 18, 25, 64, 0.4),
    wolf: E('이리 요괴', 34, 105, 13, 14, 10, 50, 1.2, { ai: 'charger' }),
    foxmage: E('여우 요술사', 40, 70, 10, 14, 12, 52, 0.8, { ai: 'ranged' }),
    firebomb: E('불덩이 요괴', 26, 95, 22, 14, 9, 48, 0.8),
    jangsanbeom: E('장산범', 46, 92, 15, 15, 11, 54, 1, { ai: 'charger' }),
    spider: E('거미 요괴', 34, 66, 9, 15, 9, 52, 1),
    toad: E('독두꺼비', 40, 50, 9, 15, 9, 50, 1, { hop: true }),
    skeleton: E('백골', 30, 72, 10, 13, 8, 52, 2),
    mangtae: E('망태 할아범', 70, 46, 12, 15, 16, 56, 0.5),
    mulgwisin: E('물귀신', 44, 70, 11, 14, 11, 52, 1, { fly: 0.5 }),
    geuseundae: E('그슨대', 90, 58, 14, 15, 16, 60, 0.6),
    agwi: E('아귀', 52, 96, 8, 14, 10, 52, 0.8),
    bandit: E('녹림 산적', 36, 74, 11, 14, 9, 60, 2),
    archer: E('산적 궁수', 26, 70, 9, 14, 9, 60, 1, { ai: 'ranged' }),
    thug: E('흑도 칼잡이', 40, 86, 12, 14, 10, 60, 1.5),
    assassin: E('살수', 30, 98, 16, 13, 12, 60, 0.8, { ai: 'charger' }),
    cultist: E('혈교 신도', 44, 60, 10, 14, 13, 60, 0.7, { ai: 'ranged' }),
    brawler: E('사파 권사', 110, 62, 17, 16, 15, 64, 0.8, { ai: 'charger' }),
    poisoner: E('독문 독인', 36, 64, 11, 14, 12, 60, 0.8, { ai: 'ranged' }),
    demonguard: E('마교 무사', 150, 70, 20, 16, 20, 66, 0.7, { ai: 'charger' }),
    daedokkaebi: E('대도깨비', 2600, 48, 18, 24, 120, 120, 0, { boss: true }),
    imugi: E('이무기', 4200, 40, 22, 24, 160, 130, 0, { boss: true }),
    heukyo: E('흑요장군', 6000, 52, 24, 24, 200, 130, 0, { boss: true }),
    jeoseung: E('저승사자', 9000, 72, 30, 28, 300, 140, 0, { boss: true }),
  };
  for (const [k, t] of Object.entries(ENEMIES)) t.key = k;
  const STAGES = [
    { name: '1장 · 마을 어귀', sub: '해 질 녘, 마을에 도깨비불이 번진다', pool: ['wisp', 'dokkaebi', 'crow', 'skeleton', 'toad', 'agwi', 'bandit', 'archer'], boss: 'daedokkaebi',
      pal: { g1: '#6f9a4a', g2: '#8aa956', dirt: '#9b7d55', rock: '#857a6e', top: '#a5b864', water: '#4c8fb0', sky: ['#5b86b4', '#9cc3d6', '#e9dcc0'], fog: '#9cc3d6', mtn: '#7d9bb0', props: ['pine', 'pine', 'rock', 'house', 'lantern'] } },
    { name: '2장 · 대나무 숲', sub: '먹물 같은 안개가 숲을 삼킨다', pool: ['wisp', 'dokkaebi', 'crow', 'meok', 'jangseung', 'wolf', 'spider', 'jangsanbeom', 'mangtae', 'skeleton', 'bandit', 'thug', 'assassin'], boss: 'imugi',
      pal: { g1: '#3f6a40', g2: '#567e4a', dirt: '#5f5038', rock: '#6e6a5a', top: '#7a9a5a', water: '#3f7a74', sky: ['#4a6a64', '#8fb0a0', '#d6dcc0'], fog: '#8fb0a0', mtn: '#5f7f74', props: ['bamboo', 'bamboo', 'bamboo', 'rock', 'pine'] } },
    { name: '3장 · 버려진 산사', sub: '원귀와 강시가 종을 울린다', pool: ['crow', 'meok', 'jangseung', 'wongwi', 'gangsi', 'wolf', 'foxmage', 'firebomb', 'mulgwisin', 'spider', 'skeleton', 'agwi', 'cultist', 'poisoner', 'brawler', 'thug'], boss: 'heukyo',
      pal: { g1: '#7d7a6e', g2: '#8f8a7a', dirt: '#6a7a4c', rock: '#6e665c', top: '#9a9686', water: '#4a6a80', sky: ['#4a4068', '#a89cb8', '#e8c8a8'], fog: '#a89cb8', mtn: '#6a6080', props: ['lantern', 'deadtree', 'rock', 'pagoda', 'pine'] } },
    { name: '4장 · 저승길', sub: '어둠 끝에서 저승사자가 기다린다', pool: ['meok', 'wongwi', 'gangsi', 'eodukssini', 'bulgasari', 'wolf', 'foxmage', 'firebomb', 'geuseundae', 'jangsanbeom', 'mulgwisin', 'mangtae', 'toad', 'demonguard', 'brawler', 'assassin', 'cultist'], boss: 'jeoseung',
      pal: { g1: '#4a4054', g2: '#5c5068', dirt: '#3a3040', rock: '#3e3446', top: '#6a5e78', water: '#5a1a28', sky: ['#1a1020', '#4a2a3a', '#8a3a3a'], fog: '#3a2838', mtn: '#2a2030', props: ['deadtree', 'grave', 'grave', 'rock', 'lantern'] } },
  ];
  const STAGE_LEN = 300;

  // ---------- 렌더러 ----------
  const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
  // Megabonk-style: render at a fraction of the screen and let CSS blow the pixels up
  let PIXEL = IS_TOUCH ? 2.0 : 2.2;
  renderer.setPixelRatio(1 / PIXEL);
  renderer.domElement.style.imageRendering = 'pixelated';
  renderer.shadowMap.enabled = !IS_TOUCH;
  renderer.debug.checkShaderErrors = false;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.setSize(innerWidth, innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  document.body.prepend(renderer.domElement);
  const fx2d = $('fx2d'), g2 = fx2d.getContext('2d');
  function resize() {
    renderer.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
    fx2d.width = innerWidth; fx2d.height = innerHeight;
  }
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.3, 300);
  addEventListener('resize', resize); resize();
  const hemi = new THREE.HemisphereLight('#d8e4f4', '#4a3e30', 0.95); scene.add(hemi);
  const sun = new THREE.DirectionalLight('#ffe2b8', 2.1); sun.position.set(60, 90, 30); scene.add(sun); scene.add(sun.target);
  sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -26, right: 26, top: 26, bottom: -26, near: 1, far: 260 }); sun.shadow.bias = -0.0015;
  // cool rim light from behind for crisp silhouettes
  const rim = new THREE.DirectionalLight('#9ec4ff', 1.3); scene.add(rim); scene.add(rim.target);

  // shared textures
  const loader = new THREE.TextureLoader();
  const texCache = {};
  function tex(key, flip) {
    const id = key + (flip ? '|f' : '');
    if (texCache[id]) return texCache[id];
    const t = loader.load(A(`${key}.png`));
    t.colorSpace = THREE.SRGBColorSpace; t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.generateMipmaps = false;
    if (flip) { t.wrapS = THREE.RepeatWrapping; t.repeat.x = -1; t.offset.x = 1; }
    return (texCache[id] = t);
  }
  function radialTex(stops) {
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    stops.forEach(([o, col]) => gr.addColorStop(o, col));
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  }
  const shadowTex = radialTex([[0, 'rgba(0,0,0,.55)'], [0.6, 'rgba(0,0,0,.3)'], [1, 'rgba(0,0,0,0)']]);
  const glowTex = radialTex([[0, 'rgba(255,255,255,1)'], [0.25, 'rgba(255,255,255,.6)'], [1, 'rgba(255,255,255,0)']]);
  const shadowGeo = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);
  const shadowMat = new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false });
  const ADD = { transparent: true, blending: THREE.AdditiveBlending, depthWrite: false };

  // ---------- 지형 ----------
  const WORLD = 170, WATER_Y = -2.4;
  let PLATEAUS = [], BASINS = [], OBST = [], pads = [], chests = [], hillSeed = 0, world = null;
  function hills(x, z) {
    const s = hillSeed;
    return 3.2 * Math.sin(x * 0.045 + s) * Math.cos(z * 0.038 - s * 0.7) + 2.2 * Math.sin((x + z) * 0.021 + 1.3 + s) + 1.1 * Math.sin(x * 0.11 + z * 0.07 + s * 2) + 0.5 * Math.cos(z * 0.16 - x * 0.05);
  }
  // gameplay reads heights from a precomputed grid (bilinear); the exact formula only fills the grid
  const HRES = 1, HN = WORLD * 2 / HRES + 1;
  let HG = null;
  function H(x, z) {
    if (!HG) return Hx(x, z);
    const fx = clamp((x + WORLD) / HRES, 0, HN - 1.001), fz = clamp((z + WORLD) / HRES, 0, HN - 1.001);
    const ix = fx | 0, iz = fz | 0, tx = fx - ix, tz = fz - iz, i = iz * HN + ix;
    const a = HG[i] + (HG[i + 1] - HG[i]) * tx, b = HG[i + HN] + (HG[i + HN + 1] - HG[i + HN]) * tx;
    return a + (b - a) * tz;
  }
  function buildHeightGrid() {
    HG = null;
    const g = new Float32Array(HN * HN);
    for (let j = 0; j < HN; j++) for (let i = 0; i < HN; i++) g[j * HN + i] = Hx(-WORLD + i * HRES, -WORLD + j * HRES);
    HG = g;
  }
  // obstacles bucketed into a coarse grid so walkers only test their neighbours
  const OCELL = 6;
  let OGRID = new Map();
  const okey = (cx, cz) => cx * 4096 + cz;
  function buildObstGrid() {
    OGRID = new Map();
    for (const ob of OBST) { const k = okey(Math.floor(ob.x / OCELL), Math.floor(ob.z / OCELL)); if (!OGRID.has(k)) OGRID.set(k, []); OGRID.get(k).push(ob); }
  }
  function Hx(x, z) {
    let h = hills(x, z);
    for (const p of PLATEAUS) { const d = Math.hypot(x - p.x, z - p.z); if (d < p.r + 2) h += p.h * smooth(p.r + 1.6, p.r, d); }
    for (const b of BASINS) { const d2 = ((x - b.x) ** 2 + (z - b.z) ** 2) / (b.r * b.r); if (d2 < 4) h -= b.d * Math.exp(-d2 * 1.6); }
    const edge = Math.max(Math.abs(x), Math.abs(z));
    if (edge > WORLD - 14) h += (edge - (WORLD - 14)) * 1.4;
    return h;
  }
  const PROP_GEO = {
    trunk: new THREE.CylinderGeometry(0.25, 0.35, 2, 5), leaf: new THREE.ConeGeometry(1.6, 2.6, 6), rock: new THREE.DodecahedronGeometry(1, 0),
    bamboo: new THREE.CylinderGeometry(0.12, 0.14, 7, 5), box: new THREE.BoxGeometry(1, 1, 1), roof: new THREE.ConeGeometry(1, 1, 4),
    branch: new THREE.CylinderGeometry(0.06, 0.12, 1.6, 4),
  };
  const lam = (c, extra = {}) => new THREE.MeshLambertMaterial({ color: c, flatShading: true, ...extra });
  function buildWorld(si) {
    const st = STAGES[si], pal = st.pal;
    if (world) { scene.remove(world); world.traverse((o) => { if (o.geometry && !Object.values(PROP_GEO).includes(o.geometry)) o.geometry.dispose(); }); }
    world = new THREE.Group(); scene.add(world);
    const rnd = seeded(1234 + si * 7919);
    hillSeed = si * 1.7;
    PLATEAUS = []; BASINS = []; OBST = []; pads = []; chests = [];
    for (let i = 0; i < 9; i++) {
      for (let k = 0; k < 20; k++) {
        const big = i < 5, r = big ? 11 + rnd() * 9 : 7 + rnd() * 3, x = (rnd() - 0.5) * 2 * (WORLD - 30), z = (rnd() - 0.5) * 2 * (WORLD - 30);
        if (Math.hypot(x, z) < r + 18 || PLATEAUS.some((p) => Math.hypot(p.x - x, p.z - z) < p.r + r + 14)) continue;
        PLATEAUS.push({ x, z, r, h: big ? 6 + rnd() * 5 : 2.6 + rnd() * 0.6, chest: big });
        break;
      }
    }
    for (let i = 0; i < 2; i++) BASINS.push({ x: (rnd() - 0.5) * 220, z: (rnd() - 0.5) * 220, r: 16 + rnd() * 10, d: 6 + rnd() * 2 });
    BASINS = BASINS.filter((b) => Math.hypot(b.x, b.z) > b.r + 20);
    buildHeightGrid();
    // sky + fog
    const SKY = new THREE.Color(pal.fog);
    scene.background = SKY; scene.fog = new THREE.Fog(SKY, 48, 125); if (typeof camZoom === 'number') setZoom(camZoom);
    hemi.groundColor.set(si === 3 ? '#2a1a28' : '#5a4a36'); hemi.intensity = si === 3 ? 0.8 : 1.15; sun.intensity = si === 3 ? 0.9 : 1.6;
    {
      const c = document.createElement('canvas'); c.width = 4; c.height = 256;
      const g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 256);
      gr.addColorStop(0, pal.sky[0]); gr.addColorStop(0.5, pal.sky[1]); gr.addColorStop(1, pal.sky[2]);
      g.fillStyle = gr; g.fillRect(0, 0, 4, 256);
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
      const dome = new THREE.Mesh(new THREE.SphereGeometry(240, 24, 12), new THREE.MeshBasicMaterial({ map: t, side: THREE.BackSide, fog: false, depthWrite: false }));
      world.add(dome); world.userData.dome = dome;
      const mm = new THREE.MeshBasicMaterial({ color: pal.mtn, fog: false });
      for (let i = 0; i < 26; i++) {
        const a = (i / 26) * Math.PI * 2 + rnd() * 0.2, s = 30 + rnd() * 30;
        const m = new THREE.Mesh(new THREE.ConeGeometry(1, 1, 5), mm); m.scale.set(s * 1.4, s, s * 1.4);
        m.position.set(Math.cos(a) * 225, s * 0.5 - 12, Math.sin(a) * 225); dome.add(m);
      }
    }
    // ground mesh
    const SEG = IS_TOUCH ? 170 : 220, size = WORLD * 2;
    const geo = new THREE.PlaneGeometry(size, size, SEG, SEG); geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position, col = new Float32Array(pos.count * 3);
    const C1 = new THREE.Color(pal.g1), C2 = new THREE.Color(pal.g2), DIRT = new THREE.Color(pal.dirt), ROCK = new THREE.Color(pal.rock), SAND = new THREE.Color(si === 3 ? '#2a1a20' : '#cdb88a'), TOP = new THREE.Color(pal.top), c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i), y = H(x, z);
      pos.setY(i, y);
      const sl = Math.hypot(H(x + 0.6, z) - H(x - 0.6, z), H(x, z + 0.6) - H(x, z - 0.6)) / 1.2;
      const n = 0.5 + 0.5 * Math.sin(x * 0.23 + Math.cos(z * 0.19) * 2) * Math.cos(z * 0.21 - x * 0.07);
      c.copy(C1).lerp(C2, n);
      if (PLATEAUS.some((p) => Math.hypot(x - p.x, z - p.z) < p.r && p.h > 4)) c.lerp(TOP, 0.5);
      if (Math.sin(x * 0.07 + z * 0.05 + si) > 0.9) c.lerp(DIRT, 0.65);
      if (y < WATER_Y + 0.7) c.lerp(SAND, smooth(WATER_Y + 0.7, WATER_Y, y));
      if (sl > 0.9) c.copy(ROCK).lerp(DIRT, n * 0.4).multiplyScalar(0.85 + 0.15 * Math.sin(y * 3));
      if (si === 3 && Math.abs(Math.sin(x * 0.09) * Math.cos(z * 0.07) - 0.2) < 0.012) c.set('#c8402c');
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    geo.computeVertexNormals();
    { const gm = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true })); gm.receiveShadow = true; world.add(gm); }
    const water = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.MeshLambertMaterial({ color: pal.water, transparent: true, opacity: 0.72, emissive: si === 3 ? '#3a0a10' : '#000000' }));
    water.rotation.x = -Math.PI / 2; water.position.y = WATER_Y; world.add(water);
    // props
    const M = {
      trunk: lam('#6b4a32'), leaf: lam('#3f6e3c'), leaf2: lam('#557f3d'), rock: lam(si === 3 ? '#4a4050' : '#8d877c'), bamboo: lam('#7fa24e'),
      wall: lam('#d8cfb8'), roof: lam('#6a5a48'), stone: lam('#9a948a'), fire: new THREE.MeshBasicMaterial({ color: '#ffb050' }), dead: lam('#4a3a34'), grave: lam('#6a6470'),
    };
    const free = (x, z) => H(x, z) > WATER_Y + 0.4 && Math.hypot(x, z) > 10 && !PLATEAUS.some((p) => Math.abs(Math.hypot(x - p.x, z - p.z) - p.r) < 3.5);
    const N = IS_TOUCH ? 200 : 280;
    const propBucket = [], glowBucket = [];
    for (let i = 0; i < N; i++) {
      const x = (rnd() - 0.5) * 2 * (WORLD - 16), z = (rnd() - 0.5) * 2 * (WORLD - 16);
      if (!free(x, z)) continue;
      const kind = pal.props[Math.floor(rnd() * pal.props.length)];
      const g = new THREE.Group(); g.position.set(x, H(x, z), z); g.rotation.y = rnd() * 6.28;
      const add = (geo2, mat, px, py, pz, sx = 1, sy = 1, sz = 1) => { const m = new THREE.Mesh(geo2, mat); m.position.set(px, py, pz); m.scale.set(sx, sy, sz); g.add(m); return m; };
      if (kind === 'pine') {
        const s = 1 + rnd() * 0.6;
        add(PROP_GEO.trunk, M.trunk, 0, 1, 0);
        for (let k = 0; k < 3; k++) add(PROP_GEO.leaf, k % 2 ? M.leaf2 : M.leaf, 0, 2.4 + k * 1.2, 0, 1 - k * 0.25, 1 - k * 0.25, 1 - k * 0.25);
        g.scale.setScalar(s); OBST.push({ x, z, r: 0.6 * s });
      } else if (kind === 'rock') {
        const s = 0.8 + rnd() * 1.6; add(PROP_GEO.rock, M.rock, 0, s * 0.3, 0, s, s * (0.6 + rnd() * 0.3), s); OBST.push({ x, z, r: s * 0.95 });
      } else if (kind === 'bamboo') {
        for (let k = 0; k < 8; k++) { const b = add(PROP_GEO.bamboo, M.bamboo, rnd() * 2.4 - 1.2, 3.5, rnd() * 2.4 - 1.2); b.rotation.z = rnd() * 0.16 - 0.08; }
        OBST.push({ x, z, r: 1.3 });
      } else if (kind === 'house') {
        add(PROP_GEO.box, M.wall, 0, 1.2, 0, 4, 2.4, 3); const r = add(PROP_GEO.roof, M.roof, 0, 3.3, 0, 3.6, 1.8, 2.8); r.rotation.y = Math.PI / 4;
        OBST.push({ x, z, r: 2.4 });
      } else if (kind === 'lantern') {
        add(PROP_GEO.box, M.stone, 0, 0.6, 0, 0.5, 1.2, 0.5); add(PROP_GEO.box, M.fire, 0, 1.45, 0, 0.6, 0.5, 0.6); add(PROP_GEO.roof, M.stone, 0, 2, 0, 0.8, 0.6, 0.8);
        OBST.push({ x, z, r: 0.5 });
      } else if (kind === 'pagoda') {
        for (let k = 0; k < 4; k++) { add(PROP_GEO.box, M.wall, 0, 0.9 + k * 1.6, 0, 2.4 - k * 0.4, 1.2, 2.4 - k * 0.4); const r = add(PROP_GEO.roof, M.roof, 0, 1.75 + k * 1.6, 0, 2.6 - k * 0.4, 0.6, 2.6 - k * 0.4); r.rotation.y = Math.PI / 4; }
        OBST.push({ x, z, r: 1.6 });
      } else if (kind === 'deadtree') {
        add(PROP_GEO.trunk, M.dead, 0, 1.4, 0, 1, 1.4, 1);
        for (let k = 0; k < 4; k++) { const b = add(PROP_GEO.branch, M.dead, 0, 2.2 + k * 0.4, 0); b.rotation.z = (k % 2 ? 1 : -1) * (0.7 + rnd() * 0.4); b.rotation.y = rnd() * 6; b.position.x = (k % 2 ? 0.4 : -0.4); }
        OBST.push({ x, z, r: 0.6 });
      } else if (kind === 'grave') {
        add(PROP_GEO.box, M.grave, 0, 0.7, 0, 0.9, 1.4, 0.3); OBST.push({ x, z, r: 0.5 });
      }
      // bake this prop into the shared buckets (one merged mesh per world instead of hundreds of draw calls)
      g.updateMatrixWorld(true);
      g.traverse((m) => { if (!m.isMesh) return; const gg = m.geometry.index ? m.geometry.toNonIndexed() : m.geometry.clone(); gg.applyMatrix4(m.matrixWorld); const n = gg.attributes.position.count, col = new Float32Array(n * 3), c0 = m.material.color; for (let i = 0; i < n; i++) { col[i * 3] = c0.r; col[i * 3 + 1] = c0.g; col[i * 3 + 2] = c0.b; } gg.setAttribute('color', new THREE.BufferAttribute(col, 3)); if (gg.attributes.uv) gg.deleteAttribute('uv'); (m.material.isMeshBasicMaterial ? glowBucket : propBucket).push(gg); });
    }
    buildObstGrid();
    if (propBucket.length) { const pm = new THREE.Mesh(mergeGeometries(propBucket), new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true })); pm.castShadow = pm.receiveShadow = true; world.add(pm); }
    if (glowBucket.length) world.add(new THREE.Mesh(mergeGeometries(glowBucket), new THREE.MeshBasicMaterial({ vertexColors: true })));
    // 경공대 + chests
    const padGeo = new THREE.TorusGeometry(1.4, 0.18, 6, 20).rotateX(Math.PI / 2), padCore = new THREE.CircleGeometry(1.2, 18).rotateX(-Math.PI / 2);
    const padMat = new THREE.MeshBasicMaterial({ color: '#7fe3ff', opacity: 0.85, ...ADD }), padCoreMat = new THREE.MeshBasicMaterial({ color: '#3aa6d8', opacity: 0.4, ...ADD });
    const chestM = lam('#8a2d24'), goldM = lam('#e8b34a', { emissive: '#4a3000' });
    for (const p of PLATEAUS) {
      if (p.h < 5) continue;
      const a = Math.atan2(-p.z, -p.x);
      const x = p.x + Math.cos(a) * (p.r + 4.2), z = p.z + Math.sin(a) * (p.r + 4.2);
      const g = new THREE.Group(); g.position.set(x, H(x, z) + 0.08, z);
      const ring = new THREE.Mesh(padGeo, padMat); ring.position.y = 0.15; g.add(ring); g.add(new THREE.Mesh(padCore, padCoreMat));
      world.add(g); pads.push({ x, z, tx: p.x, tz: p.z, h: p.h, ring });
      if (p.chest) {
        const c2 = new THREE.Group(); c2.position.set(p.x, H(p.x, p.z), p.z);
        const body = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.1, 1.1), chestM); body.position.y = 0.55; c2.add(body);
        const lid = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.4, 1.2), goldM); lid.position.y = 1.2; c2.add(lid);
        const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.9, 30, 10, 1, true), new THREE.MeshBasicMaterial({ color: '#ffd76a', opacity: 0.18, side: THREE.DoubleSide, ...ADD }));
        beam.position.y = 15; c2.add(beam);
        world.add(c2); chests.push({ x: p.x, z: p.z, g: c2, open: false });
      }
    }
  }

  // ---------- 배우 (3D 캐릭터) ----------
  const CHAR_SCALE = 1.45; // CC0 models are ~1.8 m; heroes stand ~2.6 units like the old sprites
  function makeActor(kind, scale = 1, tint, crowd = false) {
    const ch = crowd ? spawnCrowdChar(kind, CHAR_SCALE * scale) : spawnChar(kind, CHAR_SCALE * scale);
    ch.obj.rotation.order = 'YXZ';
    if (tint) ch.tint(tint);
    scene.add(ch.obj);
    const sh = new THREE.Mesh(shadowGeo, shadowMat); sh.renderOrder = 1; sh.visible = !renderer.shadowMap.enabled; scene.add(sh);
    return { ch, sh, kind, yaw: 0, h: ch.height, scale: ch.height * 0.45, state: '' };
  }
  // dx/dz: facing direction; moving: 0..1 drives run vs idle
  function placeActor(a, x, y, z, gy, dx, dz, moving, dt, runSpeed = 1) {
    a.ch.obj.position.set(x, y, z);
    if (dx || dz) {
      const want = Math.atan2(dx, dz);
      let d = want - a.yaw; d = Math.atan2(Math.sin(d), Math.cos(d));
      a.yaw += d * Math.min(1, dt * 12);
      a.ch.obj.rotation.y = a.yaw;
    }
    if (!a.ch.busy()) { const st = moving > 0.1 ? 'run' : 'idle'; if (st !== a.state) { a.ch.play(st); a.state = st; } }
    a.ch.update(dt * (a.state === 'run' ? runSpeed : 1));
    a.sh.position.set(x, gy + 0.06, z);
    a.sh.scale.setScalar(a.scale * (1 - clamp((y - gy) / 8, 0, 0.7)));
  }
  function actorAnim(a, name, speed = 1) { a.ch.play(name, 0.08, speed); a.state = name; }
  function dropActor(a) { a.ch.dispose(); scene.remove(a.sh); }

  // ---------- 입력 ----------
  const keys = {};
  let wantJump = false, wantUlt = false, camYaw = 0, camMode = IS_TOUCH ? 'fixed' : 'chase';
  // view distance: mouse wheel / +− keys / pinch / the 🔍 buttons; remembered in the shared settings
  const ZOOM_MIN = 0.6, ZOOM_MAX = 2.6;
  let camZoom = clamp(M.settings.zoom ?? 1.25, ZOOM_MIN, ZOOM_MAX), zoomSaveT = null;
  function setZoom(z) {
    camZoom = clamp(z, ZOOM_MIN, ZOOM_MAX);
    // wider views see further: push the fog and the sun's shadow box out with the camera
    if (scene.fog) { scene.fog.near = 48 * Math.max(1, camZoom); scene.fog.far = 125 * Math.max(1, camZoom * 0.9); }
    const r = 26 * Math.max(1, camZoom * 0.85); Object.assign(sun.shadow.camera, { left: -r, right: r, top: r, bottom: -r }); sun.shadow.camera.updateProjectionMatrix();
    clearTimeout(zoomSaveT); zoomSaveT = setTimeout(() => { M.settings.zoom = +camZoom.toFixed(2); M.saveProgress(); }, 400);
  }
  addEventListener('wheel', (e) => { if (!running || e.target.closest?.('.overlay')) return; e.preventDefault(); setZoom(camZoom * Math.exp(e.deltaY * 0.0012)); }, { passive: false });
  addEventListener('keydown', (e) => {
    keys[e.code] = true;
    SND.ensure();
    if (M.gachaOpen() && ['Space', 'Enter', 'KeyE'].includes(e.code)) { e.preventDefault(); M.gachaAdvance(); return; }
    if (modal && /^Digit[1-5]$/.test(e.code) && $('levelup').classList.contains('on')) { $('cards').children[+e.code.slice(5) - 1]?.click(); return; }
    if (e.code === 'Space') { wantJump = true; e.preventDefault(); }
    if (e.code === 'KeyQ' && !e.repeat) wantUlt = true;
    if (e.code === 'KeyV') toggleCam();
    if (e.code === 'Minus' || e.code === 'NumpadSubtract') setZoom(camZoom / 1.15);
    if (e.code === 'Equal' || e.code === 'NumpadAdd') setZoom(camZoom * 1.15);
    if (e.code === 'Escape') togglePause();
  });
  addEventListener('keyup', (e) => { keys[e.code] = false; });
  const stick = { id: null, ox: 0, oy: 0, x: 0, y: 0 }, look = { id: null, lx: 0 };
  const stickEl = $('stick'), knob = stickEl.firstElementChild;
  const cv = renderer.domElement;
  const pinch = new Map(); let pinchD = 0;
  cv.addEventListener('pointerdown', (e) => { if (e.pointerType === 'touch') { pinch.set(e.pointerId, [e.clientX, e.clientY]); if (pinch.size === 2) { const [a, b] = [...pinch.values()]; pinchD = Math.hypot(a[0] - b[0], a[1] - b[1]); } } });
  addEventListener('pointermove', (e) => {
    if (!pinch.has(e.pointerId)) return;
    pinch.set(e.pointerId, [e.clientX, e.clientY]);
    if (pinch.size !== 2 || !pinchD) return;
    const [a, b] = [...pinch.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]);
    setZoom(camZoom * pinchD / Math.max(20, d)); pinchD = d;
  });
  const endPinch = (e) => { pinch.delete(e.pointerId); if (pinch.size < 2) pinchD = 0; };
  addEventListener('pointerup', endPinch); addEventListener('pointercancel', endPinch);
  cv.addEventListener('pointerdown', (e) => {
    const touchStick = e.pointerType !== 'mouse' && (camMode === 'fixed' || e.clientX < innerWidth * 0.55);
    if (touchStick && stick.id === null) {
      stick.id = e.pointerId; stick.ox = e.clientX; stick.oy = e.clientY; stick.x = stick.y = 0;
      stickEl.style.display = 'block'; stickEl.style.left = e.clientX + 'px'; stickEl.style.top = e.clientY + 'px'; knob.style.transform = '';
    } else if (look.id === null && camMode === 'chase') { look.id = e.pointerId; look.lx = e.clientX; }
  });
  addEventListener('pointermove', (e) => {
    if (e.pointerId === stick.id) {
      let dx = e.clientX - stick.ox, dy = e.clientY - stick.oy; const d = Math.hypot(dx, dy), m = 46;
      if (d > m) { dx *= m / d; dy *= m / d; }
      stick.x = dx / m; stick.y = dy / m; knob.style.transform = `translate(${dx}px,${dy}px)`;
    } else if (e.pointerId === look.id) { camYaw -= (e.clientX - look.lx) * 0.006; look.lx = e.clientX; }
  });
  const endPtr = (e) => { if (e.pointerId === stick.id) { stick.id = null; stick.x = stick.y = 0; stickEl.style.display = 'none'; } if (e.pointerId === look.id) look.id = null; };
  addEventListener('pointerup', endPtr); addEventListener('pointercancel', endPtr);
  $('jumpBtn').addEventListener('pointerdown', (e) => { wantJump = true; e.stopPropagation(); });
  $('ultBtn').addEventListener('pointerdown', (e) => { wantUlt = true; e.stopPropagation(); });
  $('zoomIn').addEventListener('pointerdown', (e) => { setZoom(camZoom / 1.2); e.stopPropagation(); });
  $('zoomOut').addEventListener('pointerdown', (e) => { setZoom(camZoom * 1.2); e.stopPropagation(); });
  if (IS_TOUCH) { $('jumpBtn').style.display = 'block'; $('ultBtn').style.display = 'block'; $('hint').textContent = '아무 곳이나 끌어서 이동 · 경공 = 점프(2단) · 필살 = 필살기 · 두 손가락/🔍로 시야'; }
  function toggleCam() {
    camMode = camMode === 'chase' ? 'fixed' : 'chase';
    if (camMode === 'fixed') camYaw = 0;
    $('camBtn').textContent = '카메라: ' + (camMode === 'chase' ? '추적(회전)' : '고정');
  }
  $('camBtn').textContent = '카메라: ' + (camMode === 'chase' ? '추적(회전)' : '고정');
  $('camBtn').onclick = toggleCam;
  $('fxBtn').onclick = () => { lowFx = !lowFx; $('fxBtn').textContent = '이펙트: ' + (lowFx ? '가볍게' : '높음'); };
  $('fxBtn').textContent = '이펙트: ' + (lowFx ? '가볍게' : '높음');
  $('menuBtn').onclick = () => togglePause();
  $('resume').onclick = () => togglePause(false);

  // ---------- 상태 ----------
  let heroIdx = 0;
  let corpses = [];
  let P, enemies = [], shots = [], eshots = [], orbs = [], fxs = [], texts = [], parts = [], coinChain = 0, coinAt = -9;
  let clearing = false, time = 0, stageTime = 0, si = 0, kills = 0, spawnT = 0, waveDone = false, bossOut = false, boss = null;
  let running = false, paused = false, modal = false, bannerT = 0, shake = 0, flashT = 0;


  // ---------- 효과 (3D) ----------
  const PMAX = 900, pPos = new Float32Array(PMAX * 3), pCol = new Float32Array(PMAX * 3);
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3)); pGeo.setAttribute('color', new THREE.BufferAttribute(pCol, 3));
  const points = new THREE.Points(pGeo, new THREE.PointsMaterial({ size: 0.5, vertexColors: true, map: glowTex, ...ADD }));
  points.frustumCulled = false; scene.add(points);
  function burst(x, y, z, color, n, sp = 7, life = 0.5, grav = 14) {
    const c = new THREE.Color(color);
    if (lowFx) n = Math.ceil(n / 2);
    for (let i = 0; i < n && parts.length < PMAX; i++) {
      const a = rand(0, 6.28), u = rand(-0.3, 1);
      parts.push({ x, y, z, vx: Math.cos(a) * sp * rand(0.3, 1), vy: u * sp, vz: Math.sin(a) * sp * rand(0.3, 1), life, max: life, r: c.r, g: c.g, b: c.b, grav });
    }
  }
  const matCache = {};
  const addMat = (color, opacity = 1) => { const k = color + opacity; return matCache[k] || (matCache[k] = new THREE.MeshBasicMaterial({ color, opacity, side: THREE.DoubleSide, ...ADD })); };
  // every effect object: { obj, life, max, tick(f, k, dt) }. Materials are cloned when they fade.
  function addFx(obj, life, tick) { scene.add(obj); fxs.push({ obj, life, max: life, tick }); return obj; }
  function fadeMat(m) { const c = m.clone(); c.userData.base = m.opacity; return c; }
  function ringWave(x, y, z, R, color, life = 0.5, width = 0.35, delay = 0) {
    const m = new THREE.Mesh(new THREE.RingGeometry(1 - width, 1, 48).rotateX(-Math.PI / 2), fadeMat(addMat(color, 0.9)));
    m.position.set(x, y + 0.25, z); m.scale.setScalar(0.01);
    return addFx(m, life + delay, (f, k) => {
      const t = clamp((f.max - f.life - delay) / life, 0, 1);
      m.visible = t > 0;
      m.scale.setScalar(Math.max(0.01, R * Math.pow(t, 0.55)));
      m.material.opacity = (1 - t) * 0.9;
    });
  }
  function sectorSlash(x, y, z, a, half, R, color, life = 0.42, side = 1) {
    // crescent blade of light sweeping across `half*2` radians
    const g = new THREE.Group(); g.position.set(x, y, z);
    const body = new THREE.Mesh(new THREE.RingGeometry(R * 0.55, R, 40, 1, 0, 1).rotateX(-Math.PI / 2), fadeMat(addMat(color, 0.85)));
    const core = new THREE.Mesh(new THREE.RingGeometry(R * 0.93, R * 1.0, 40, 1, 0, 1).rotateX(-Math.PI / 2), fadeMat(addMat('#ffffff', 1)));
    g.add(body); g.add(core);
    const a0 = a - half * side;
    return addFx(g, life, (f, k) => {
      const sweep = Math.min(1, k / 0.25);
      const len = 2 * half * sweep;
      for (const m of [body, core]) {
        m.geometry.dispose();
        const r0 = m === body ? R * 0.55 : R * 0.93;
        m.geometry = new THREE.RingGeometry(r0, R * (1 + 0.08 * k), 40, 1, 0, Math.max(0.01, len)).rotateX(-Math.PI / 2);
        m.material.opacity = (1 - k) * (m === body ? 0.85 : 1);
      }
      // RingGeometry runs counterclockwise from +x in its plane; after rotateX it maps theta to -z
      g.rotation.y = side > 0 ? -(a0 + len) : -a0;
      g.position.y = y + 0.4;
    });
  }
  function beamLine(x0, y0, z0, x1, y1, z1, color, width = 0.12, life = 0.22) {
    const L = Math.hypot(x1 - x0, y1 - y0, z1 - z0) || 0.01;
    const g = new THREE.Group();
    const glow = new THREE.Mesh(new THREE.CylinderGeometry(width * 3, width * 3, L, 6, 1, true), fadeMat(addMat(color, 0.5)));
    const core = new THREE.Mesh(new THREE.CylinderGeometry(width, width, L, 6, 1, true), fadeMat(addMat('#ffffff', 1)));
    g.add(glow); g.add(core);
    g.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
    g.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(x1 - x0, y1 - y0, z1 - z0).normalize());
    return addFx(g, life, (f, k) => { glow.material.opacity = 0.5 * (1 - k); core.material.opacity = 1 - k; const s = 1 - k * 0.6; glow.scale.set(s, 1, s); });
  }
  function bolt(x, y, z, color) {
    // jagged lightning from the sky
    const pts = [[x + rand(-2, 2), y + 26, z + rand(-2, 2)]];
    for (let i = 1; i <= 6; i++) { const t = i / 6; pts.push([x + rand(-1.2, 1.2) * (1 - t), y + 26 * (1 - t), z + rand(-1.2, 1.2) * (1 - t)]); }
    pts[6] = [x, y, z];
    for (let i = 0; i < 6; i++) beamLine(...pts[i], ...pts[i + 1], color, 0.1, 0.25);
    ringWave(x, y, z, 3, color, 0.35, 0.4);
    burst(x, y + 0.5, z, color, 10, 8, 0.35);
  }
  function glowSprite(color, size) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color, ...ADD })); s.scale.set(size, size, 1); return s; }
  function cracks(x, y, z, R, color) {
    const g = new THREE.Group(); g.position.set(x, 0, z);
    const mat = fadeMat(addMat(color, 1));
    const n = lowFx ? 6 : 10;
    for (let i = 0; i < n; i++) {
      let a = (i / n) * Math.PI * 2 + rand(-0.2, 0.2), r = 0, px = 0, pz = 0;
      const len = R * rand(0.6, 1.05);
      while (r < len) {
        r += rand(0.7, 1.4); a += rand(-0.3, 0.3);
        const nx = Math.cos(a) * r, nz = Math.sin(a) * r, L = Math.hypot(nx - px, nz - pz);
        const seg = new THREE.Mesh(new THREE.PlaneGeometry(0.22, L).rotateX(-Math.PI / 2), mat);
        seg.position.set((px + nx) / 2, H(x + (px + nx) / 2, z + (pz + nz) / 2) + 0.12, (pz + nz) / 2);
        seg.rotation.y = -Math.atan2(nz - pz, nx - px) + Math.PI / 2;
        g.add(seg); px = nx; pz = nz;
      }
    }
    return addFx(g, 0.9, (f, k) => { mat.opacity = k < 0.2 ? 1 : 1 - (k - 0.2) / 0.8; mat.color.set(k < 0.25 ? '#fff4d0' : color); });
  }
  // webtoon onomatopoeia + damage numbers, drawn on the 2D overlay
  const WORDS = { cut: ['촤악!', '서걱!', '슈칵!'], hit: ['퍽!', '쾅!', '콰앙!!'] };
  function text(x, y, z, s, color, size = 16, life = 0.75, big = false) { if (texts.length < (lowFx ? 40 : 90)) texts.push({ x, y, z, s, color, size, life, max: life, big, jx: rand(-0.4, 0.4) }); }
  let wordCd = 0;
  function word(kind, x, y, z, big = false) { if (wordCd > 0) return; wordCd = big ? 0.15 : 0.35; text(x, y + 2.5, z, pick(WORDS[kind]), '#fff3c8', big ? 34 : 24, 0.7, true); }
  function impact(sec = 0.06) { if (M.settings.flash !== false) flashT = Math.min(0.12, Math.max(flashT, sec)); }

  // ---------- 무공 (arts.js) ----------
  let nearCache = null, nearFrame = -1, frameNo = 0;
  function nearestN(n, range, x = P.x, z = P.z) {
    if (x === P.x && z === P.z) {
      if (nearFrame !== frameNo) { nearFrame = frameNo; nearCache = enemies.map((e) => ({ e, d2: (e.x - x) ** 2 + (e.z - z) ** 2 })).sort((a, b) => a.d2 - b.d2); }
      const out = [], r2 = range * range;
      for (const c of nearCache) { if (c.d2 >= r2 || out.length >= n) break; if (!c.e.dead) out.push(c.e); }
      return out;
    }
    return enemies.filter((e) => !e.dead && (e.x - x) ** 2 + (e.z - z) ** 2 < range * range).sort((a, b) => ((a.x - x) ** 2 + (a.z - z) ** 2) - ((b.x - x) ** 2 + (b.z - z) ** 2)).slice(0, n);
  }
  const nearest = (range) => nearestN(1, range)[0];
  const inRadius = (x, z, R, fn) => { for (const e of enemies) if (!e.dead && Math.hypot(e.x - x, e.z - z) < R + e.r) fn(e); };
  function lineHits(x0, z0, x1, z1, width, fn) {
    const L = Math.hypot(x1 - x0, z1 - z0) || 1, cx = (x1 - x0) / L, cz = (z1 - z0) / L;
    for (const e of enemies) {
      if (e.dead) continue;
      const rx = e.x - x0, rz = e.z - z0, al = rx * cx + rz * cz;
      if (al < -e.r || al > L + e.r || Math.abs(rx * cz - rz * cx) >= width + e.r) continue;
      fn(e, cx, cz);
    }
  }
  const chest = () => P.y + 1.5;
  const FXS = createFX(scene, { low: () => lowFx });
  let hitStopT = 0;
  const G = {
    FX: FXS, scene,
    get P() { return P; }, get enemies() { return enemies; }, get time() { return time; },
    H, hurt: (e, d, kx, kz, o) => hurt(e, d, kx, kz, o), nearestN, inRadius, lineHits, chest,
    heal: (v) => { P.hp = Math.min(P.maxHp, P.hp + v * (P.healMul || 1)); },
    text: (...a) => text(...a), word: (...a) => word(...a), impact: (v) => impact(v), shake: (v) => { shake = Math.max(shake, v); },
    hitStop: (v) => { hitStopT = Math.max(hitStopT, v); }, lowFx: () => lowFx, banner: (t, s2) => banner(t, s2),
    heroColor: () => HEROES[heroIdx].color,
    heroSwing: (anim = 'slash') => { if (P.atkCd <= 0 && !P.air) { actorAnim(P.actor, anim, 1.8); P.atkCd = 0.45; } },
    leap: (vy, stomp) => { if (P.air) return; P.vy = vy; P.air = true; P.stomping = !!stomp; },
    phantom: (...a) => phantom(...a),
  };
  const ARTS = createArts(G);
  const WEAPONS = ARTS.WEAPONS, EVOS = ARTS.EVOS;
  function phantom(x0, y0, z0, x1, y1, z1, col, delay) {
    const ghosts = [0, 1].map(() => {
      const g = makeActor(heroKey(), 1);
      g.ch.mat.transparent = true; g.ch.mat.depthWrite = false; g.ch.mat.emissive.set(col); g.ch.mat.emissiveIntensity = 0.9; g.ch.mat.opacity = 0;
      g.sh.visible = false; actorAnim(g, 'slash', 2.2);
      g.yaw = Math.atan2(x1 - x0, z1 - z0); g.ch.obj.rotation.y = g.yaw;
      return g;
    });
    FXS.beam(x0, y0 + 1.3, z0, x1, y1 + 1.3, z1, col, 0.5, 0.45 + delay);
    let t = 0;
    const tick = () => {
      t += 1 / 60;
      const age = t, k = Math.min(1, age / (0.45 + delay)), u = Math.max(0, Math.min(1, (age - delay) / 0.16));
      ghosts.forEach((g, i) => { const tt = Math.max(0, u - i * 0.18); g.ch.obj.position.set(x0 + (x1 - x0) * tt, y0 + (y1 - y0) * tt, z0 + (z1 - z0) * tt); g.ch.mat.opacity = age < delay ? 0 : (0.75 - i * 0.3) * (1 - k); g.ch.update(1 / 60); });
      if (k < 1) setTimeout(tick, 16); else ghosts.forEach((g) => dropActor(g));
    };
    tick();
  }

  // ---------- 영웅 ----------
  const heroKey = () => HEROES[heroIdx].key;
  const heroLook = () => (P.tier ? `${heroKey()}_t${P.tier}` : heroKey());
  function newPlayer() {
    return { x: 0, z: 0, y: 0, vy: 0, lx: 0, lz: 0, hp: 120, maxHp: 120, speed: 8.6, jump: 13, jumps: 0, maxJumps: 2, air: false, inv: 0, lv: 1, xp: 0, next: 6,
      magnet: 4.5, faceL: false, bob: 0, haste: 1, area: 1, dmgMul: 1, armor: 1, regen: 0, extra: 0, crit: 0.05, ult: 0, tier: 0,
      weapons: {}, passives: {}, actor: null, stomping: false, atkCd: 0,
      critMul: 2, killHeal: 0, xpMul: 1, pierce: 0, durMul: 1, healMul: 1, dotMul: 1, bossMul: 1, luck: 1, revives: 0, maxWeapons: 6, boostT: 0,
      // 2D systems: purse, level-up tools, items, relics, gems, arcana, realm, run stats
      gold: 0, greed: 1, curse: 0, rerolls: 1, skips: 1, banishes: 1, banished: new Set(), cardCount: 3, halfRevives: 0, paidRevive: false,
      items: {}, itemTicks: [], pity: 0, pulls: 0, relics: new Set(), gems: [], arc: new Set(), buffs: {}, ultGain: 1, ultMul: 1, ultT: 0,
      realm: 0, bonusCult: 0, evos: 0, picks: 0, combo: 0, comboT: 0, maxCombo: 0, elites: 0, chests: 0, lanterns: 0, bossKills: 0, cleared: 0,
      ults: 0, dashes: 0, shrinesUsed: 0, goldKills: 0, altarCost: 40, innChests: 0, stageGiftBonus: 0, disciples: 0, meteorT: 8, heartT: 0, won: false };
  }
  function grant(id) {
    const w = P.weapons[id];
    if (!w) P.weapons[id] = { ...WEAPONS[id].create(), level: 1 };
    else { w.level++; WEAPONS[id].upgrade(w); }
    refreshWeps();
    checkRelics(); checkRealm();
  }
  function refreshWeps() {
    $('weps').innerHTML = Object.entries(P.weapons).map(([id, w]) => `<img src="${A(`icons/${w.evolved ? 'e' : 'w'}_${WEAPONS[id].icon.slice(2)}.png`)}" title="${w.evolved ? EVOS[id].name : WEAPONS[id].name}">`).join('') +
      Object.entries(P.passives).map(([id]) => `<img src="${A(`icons/${PASSIVE_BY_ID[id].icon}.png`)}">`).join('');
  }

  // ---------- 적 ----------
  function spawn(key, opts = {}) {
    const T = opts.T || ENEMIES[key];
    for (let tries = 0; tries < 10; tries++) {
      const a = opts.a ?? rand(0, 6.28), d = opts.d ?? rand(24, 34);
      const x = opts.x ?? P.x + Math.cos(a) * d, z = opts.z ?? P.z + Math.sin(a) * d;
      if (Math.abs(x) > WORLD - 10 || Math.abs(z) > WORLD - 10 || H(x, z) < WATER_Y - 1.2) { if (opts.a !== undefined || opts.x !== undefined) return null; continue; }
      const SS = M.STAGE_SCALE[Math.min(si, 3)], c = P.curse;
      // time ramp × chapter step × difficulty (강호 = the tuning baseline) × 마기
      const mul = (1 + stageTime / 160 * (diff.ramp / 1.25)) * SS.hp ** 0.8 * (diff.hp / 1.4) * (1 + c) * (opts.elite ? 6 : 1) * (opts.hpMul || 1);
      const bossHp = (1 + si * 0.25) * (diff.hp / 1.4) * (diff.heat >= 5 ? 1.3 : 1);
      const act = opts.actor || makeActor(opts.kind || T.key, opts.scale || (opts.elite ? 1.3 : 1), opts.elite ? '#ffd890' : opts.tint, !opts.solo);
      const e = { T, x, z, y: H(x, z) + (T.fly || 0), hp: T.hp * (T.boss ? bossHp : mul), max: 0, flash: 0, kx: 0, kz: 0, stun: 0, cd: rand(1, 3), phase: rand(0, 6),
        a: act, r: Math.max(0.45, T.r / PX * 1.1) * (opts.elite ? 1.3 : 1) * (opts.rMul || 1), h: act.h, elite: !!opts.elite,
        dmg: T.dmg * SS.dmg ** 0.8 * (diff.dmg / 1.35) * (opts.elite ? 1.5 : 1) * (opts.dmgMul || 1),
        spd: (T.spd / PX) * (opts.elite ? 0.9 : 1) * diff.speed * SS.speed * (1 + c / 2), xpMul: diff.xp / 0.85 };
      if (opts.elite) {
        e.affix = opts.affix || pick(Object.keys(M.AFFIX));
        if (e.affix === 'swift') e.spd *= 1.6;
      }
      if (opts.title) e.title = opts.title;
      if (opts.march) e.march = opts.march;
      e.max = e.hp;
      enemies.push(e);
      return e;
    }
    return null;
  }
  function pickEnemy() {
    const pool = STAGES[si].pool, tot = pool.reduce((s, k) => s + ENEMIES[k].w, 0);
    let r = Math.random() * tot;
    for (const k of pool) if ((r -= ENEMIES[k].w) <= 0) return k;
    return pool[0];
  }
  let sparkBudget = 0;
  function hurt(e, dmg, kx = 0, kz = 0, o = {}) {
    if (e.dead) return;
    if (e.T.prop) { kill(e); return; }
    const crit = Math.random() < P.crit, big = e.T.boss || e.elite || e.T.duelist;
    dmg *= P.dmgMul * (crit ? P.critMul : 1) * (P.high ? 1.2 : 1) * (e.T.boss ? P.bossMul : 1) * (o.dot ? P.dotMul : 1);
    if (P.berserk) dmg *= 1 + P.berserk * (1 - clamp(P.hp / P.maxHp, 0, 1));
    if (P.buffs.fury > 0) dmg *= 1.4;
    if (P.buffs.weak > 0) dmg *= 0.75;
    if (e.affix === 'armored') dmg *= 0.5;
    if (P.ultT > 0) dmg *= P.ultMul;
    if (P.arc.has('reverse') && P.hp < P.maxHp / 2) dmg *= 1.5;
    if (P.arc.has('heaven') && big) dmg *= 1.8;
    if (P.arc.has('frost') && Math.random() < 0.12) e.chill = 2;
    if (P.arc.has('thunder') && crit && !o.arcana && Math.random() < 0.25) procs.push(() => { FXS.bolt(e.x, H(e.x, e.z), e.z, '#bfe0ff'); inRadius(e.x, e.z, 3.5, (t) => hurt(t, 30 + P.lv * 6, 0, 0, { arcana: true, quiet: true, color: '#bfe0ff' })); });
    e.hp -= dmg; e.flash = 0.1;
    if (!e.T.boss) { e.kx += kx; e.kz += kz; }
    if (sparkBudget > 0 && (!o.quiet || crit)) { sparkBudget--; FXS.hit(e.x + rand(-0.3, 0.3), e.y + e.h * rand(0.35, 0.65), e.z + rand(-0.3, 0.3), o.color || '#ffffff', crit || o.big); }
    if (M.settings.nums && ((texts.length < 60 && !o.quiet) || crit)) text(e.x, e.y + e.h * 0.9, e.z, Math.round(dmg) + (crit ? '!' : ''), crit ? '#ffcf4a' : o.quiet ? '#c8ffb0' : '#ffffff', crit ? 20 : 15, 0.6);
    if (!o.quiet || crit) sfx(crit ? 'crit' : 'hit');
    if (e.T.gold && Math.random() < 0.25) dropPickup('eunja', e.x + rand(-1, 1), e.z + rand(-1, 1), 2);
    if (e.hp <= 0) kill(e);
  }
  // Effects that hit other enemies run after the current loop (no re-entrant kills mid-iteration).
  const procs = [];
  function kill(e) {
    if (e.dead) return;
    e.dead = true;
    if (e.T.prop) { breakLantern(e); return; }
    kills++; sfx('kill');
    P.combo++; P.comboT = 2.4; P.maxCombo = Math.max(P.maxCombo, P.combo);
    if (P.combo % 50 === 0) comboMilestone(P.combo);
    M.progress.totalKills++;
    const bst = M.progress.bestiary || (M.progress.bestiary = {}); if (ENEMIES[e.T.key]) bst[e.T.key] = (bst[e.T.key] || 0) + 1;
    if (P.killHeal) heal(P.killHeal);
    FXS.explode(e.x, e.y, e.z, e.T.boss ? 6 : e.elite ? 2.5 : 1.2, e.T.boss ? '#ffcf6a' : e.T.gold ? '#ffd76a' : '#ff8a6a', { smoke: e.T.boss || e.elite, scorch: false });
    P.ult = Math.min(100, P.ult + (e.T.boss ? 30 : e.elite ? 8 : 0.6) * P.ultGain * (P.arc.has('ghostgate') ? 2 : 1));
    burst(e.x, e.y + e.h * 0.4, e.z, e.T.boss ? '#ffcf6a' : '#ff8a6a', e.T.boss ? 90 : e.elite ? 30 : 12, e.T.boss ? 16 : 8, 0.6);
    if (P.arc.has('bloodrain') && Math.random() < 0.08) { const x = e.x, z = e.z; procs.push(() => { FXS.explode(x, H(x, z), z, 4.5, '#c81428'); inRadius(x, z, 4.8, (t) => hurt(t, 40 + P.lv * 5, (t.x - x) * 2, (t.z - z) * 2, { arcana: true, color: '#ff3040' })); }); }
    const big = e.T.boss || e.elite;
    const n = big ? 10 : 1;
    for (let i = 0; i < n; i++) {
      const ox = e.x + (n > 1 ? rand(-3, 3) : 0), oz = e.z + (n > 1 ? rand(-3, 3) : 0);
      const xp = e.T.xp * (1 + si * 0.5) * (big ? 1.2 : 1) * (e.xpMul || 1);
      if (orbs.length > 300) { orbs[orbs.length - 1].v += xp; continue; }
      const m = new THREE.Mesh(orbGeo, xp >= 15 ? orbBig : xp >= 8 ? orbMid : orbMat); scene.add(m);
      orbs.push({ m, x: ox, z: oz, y: H(ox, oz) + 0.6, v: xp });
    }
    actorAnim(e.a, 'die'); e.a.ch.flash(false);
    corpses.push({ a: e.a, t: 1.1, y: e.y });
    if (corpses.length > (IS_TOUCH ? 10 : 24)) { const c = corpses.shift(); dropActor(c.a); }
    if (e.T.gold) { goldCaught(e); return; }
    if (e.T.duelist) { duelWon(e); return; }
    if (e.affix === 'volatile') bombs.push({ x: e.x, z: e.z, t: 0.9, R: 4.2, dmg: e.dmg * 1.4, mark: FXS.ground(e.x, H(e.x, e.z), e.z, { tex: 'glow', color: '#ff4020', size: 8.4, life: 0.9, fade: 'hold', opacity: 0.5, blend: 'normal', order: 1 }) });
    if (e.affix === 'split') for (let i = 0; i < 3; i++) procs.push(() => spawn(e.T.key, { x: e.x + Math.cos(i * 2.1) * 1.2, z: e.z + Math.sin(i * 2.1) * 1.2 }));
    if (e.elite) {
      P.elites++; hitStopT = Math.max(hitStopT, 0.05);
      dropPickup('treasure', e.x + 0.7, e.z + 0.3);
      dropPickup('jumeoni', e.x - 0.7, e.z + 0.3, 15);
      if (Math.random() < 0.12) dropGem(e.x, e.z - 0.8);
      if (Math.random() < 0.35) dropPickup('bottari', e.x + 0.9, e.z - 0.8);
    }
    if (e.T.boss) {
      P.bossKills++; M.progress.bosses[e.T.name] = true; M.saveProgress();
      for (const o of orbs) o.pull = true;
      dropPickup('jumeoni', e.x, e.z + 1, 20); dropGem(e.x, e.z - 1); dropPickup('bottari', e.x - 1.1, e.z - 1);
      dropPickup('treasure', e.x + 0.8, e.z + 0.3); dropPickup('peach', e.x - 0.8, e.z + 0.3, 25);
      sfx('boom'); SND.buzz([60, 40, 90]);
    } else if (!e.elite) {
      if (Math.random() < 0.0025 * P.luck) dropPickup('bottari', e.x - 0.5, e.z + 0.3);
      const r = Math.random() / P.luck;
      const d = r < 0.004 ? 'thunderball' : r < 0.007 ? 'bangul' : r < 0.011 ? 'gourd' : r < 0.018 ? 'ginseng' : r < 0.042 ? 'peach' : r < 0.065 ? 'eunja' : null;
      if (d) dropPickup(d, e.x + 0.5, e.z + 0.3, d === 'ginseng' ? 60 : d === 'eunja' ? 2 : 25);
    }
    if (e === boss) bossDown();
  }
  const orbGeo = new THREE.OctahedronGeometry(0.3, 0), orbMat = new THREE.MeshBasicMaterial({ color: '#7ff0c8' }), orbMid = new THREE.MeshBasicMaterial({ color: '#6ab8ff' }), orbBig = new THREE.MeshBasicMaterial({ color: '#ffd76a' });

  // 적 공격: 원거리 탄 / 돌진 / 보스 내려찍기
  const eshotGeo = new THREE.SphereGeometry(0.35, 8, 6), eshotMats = {};
  const eshotMat = (c) => eshotMats[c] || (eshotMats[c] = new THREE.MeshBasicMaterial({ color: c }));
  function enemyShoot(e, color = '#ff5a8a') {
    const sy = e.y + e.h * 0.45, a = Math.atan2(P.z - e.z, P.x - e.x), spd = 11;
    const m = new THREE.Mesh(eshotGeo, eshotMat(color)); scene.add(m);
    FXS.sprite(e.x, sy, e.z, { tex: 'glow', color, size: 1.6, life: 3, fade: 'hold', follow: (() => { const o = { x: 0, y: 0, z: 0 }; return () => { o.x = m.position.x; o.y = m.position.y; o.z = m.position.z; if (!m.parent) o.y = -99; return o; }; })() });
    eshots.push({ m, x: e.x, y: sy, z: e.z, vx: Math.cos(a) * spd, vz: Math.sin(a) * spd, life: 3, dmg: e.dmg * 0.8 });
  }
  function bossAttack(e) {
    // telegraphed slam at the hero's feet: jump to dodge it
    const x = P.x, z = P.z, R = 4.5 + si * 0.6, y = H(x, z);
    FXS.ground(x, y, z, { tex: 'glow', color: '#ff2020', size: R * 2.2, life: 1.0, fade: 'hold', opacity: 0.45, blend: 'normal', order: 1 });
    FXS.ground(x, y, z, { tex: 'ring', color: '#ff5050', size: R * 0.4, grow: 5, life: 1.0, fade: 'hold', growEase: 'lin' });
    e.slamAt = { t: 1.0, x, z, R };
    text(e.x, e.y + e.h + 1, e.z, '!', '#ff5050', 40, 0.8, true);
  }

  // ---------- 필살기 (영웅마다 다름) ----------
  function ultimate(again = false) {
    if (!again) { if (P.ult < 100) return; P.ult = 0; P.ults++; if (P.arc.has('twinult')) setTimeout(() => running && ultimate(true), 700); }
    P.ultT = 2.5;
    actorAnim(P.actor, 'slash', 1.2);
    sfx('ult'); SND.buzz(60);
    ARTS.ultimate(HEROES[heroIdx]);
  }

  // ---------- 선택 창 (레벨업·보물함·비전서·갈림길·기연 공용) ----------
  const modalQ = [];
  function queue(fn, front = false) { if (front) modalQ.unshift(fn); else modalQ.push(fn); pump(); }
  function pump() {
    if (modal || !running || !modalQ.length || M.gachaOpen()) return;
    modal = true;
    try { modalQ.shift()(); } catch (err) { console.error(err); modal = false; }
  }
  // watchdog: "modal" with no window on screen means a window failed to open; unstick the run
  let stuckT = 0;
  function modalWatch(dt) {
    const shown = M.gachaOpen() || ['levelup', 'clear', 'pause'].some((id) => $(id).classList.contains('on'));
    stuckT = running && modal && !shown ? stuckT + dt : 0;
    if (stuckT > 1) { stuckT = 0; modal = false; pump(); }
  }
  function endModal() { modal = false; setTimeout(pump, 140); }
  const cardImg = (o) => (o.img ? `<img src="${A(o.img)}">` : M.icon(o.icon || '✨'));
  // opts: { img | icon, title, st, desc, cls, pick }; tools: show reroll/skip/banish (level-up only)
  function showChoice(title, sub, opts, tools = null) {
    $('luTitle').textContent = title;
    $('luSub').textContent = sub || '';
    const cards = $('cards'); cards.innerHTML = '';
    let banishing = false;
    for (const o of opts) {
      const b = document.createElement('button'); b.className = 'card ' + (o.cls || '');
      b.innerHTML = `${cardImg(o)}<b>${o.title}</b><span class="st">${o.st || ''}</span><span>${o.desc || ''}</span>`;
      b.onclick = () => {
        if (banishing && o.key) { P.banishes--; P.banished.add(o.key); sfx('select'); showChoice(title, sub, tools.offers(), tools); return; }
        $('levelup').classList.remove('on'); sfx('select'); o.pick(); refreshWeps(); endModal();
      };
      cards.appendChild(b);
    }
    const tl = $('luTools'); tl.innerHTML = '';
    if (tools) {
      for (const [ic, label, field, act] of [['🔄', '다시뽑기', 'rerolls', () => showChoice(title, sub, tools.offers(), tools)], ['⏭️', '넘기기', 'skips', () => { $('levelup').classList.remove('on'); addGold(3); endModal(); }], ['🚫', '봉인', 'banishes', null]]) {
        const b = document.createElement('button'); b.className = 'btn tool';
        b.innerHTML = `${M.icon(ic)} ${label} ${P[field]}`; b.disabled = P[field] <= 0;
        b.onclick = () => { if (P[field] <= 0) return; if (!act) { banishing = !banishing; b.classList.toggle('sel', banishing); return; } if (field !== 'banishes') P[field]--; act(); };
        tl.appendChild(b);
      }
    }
    $('levelup').classList.add('on');
  }
  function relicHint(id) {
    const r = M.RELICS.find((x) => !P.relics.has(x.id) && x.need.includes(id) && x.need.every((n) => n === id || P.weapons[n]));
    return r ? `<br><i class="relic">📿 유물 「${r.name}」 발동!</i>` : '';
  }
  function upgradeOffers() {
    const opts = [];
    for (const [id, w] of Object.entries(P.weapons)) {
      const E2 = EVOS[id];
      if (!E2 || w.evolved || w.level < WEAPONS[id].max || !(E2.passive ? P.passives[E2.passive] : P.weapons[E2.partner]?.level >= WEAPONS[E2.partner].max)) continue;
      const W = WEAPONS[id];
      opts.push({ img: `icons/e_${W.icon.slice(2)}.png`, cls: 'evo', title: `${E2.partner ? '문파 오의' : '각성'}: ${E2.name}`, st: `${W.name} + ${E2.passive ? PASSIVE_BY_ID[E2.passive].name : WEAPONS[E2.partner].name}`, desc: E2.desc,
        pick: () => { E2.apply(w); w.evolved = true; P.evos++; M.markSeen(id); banner(`${E2.name}!`, '무공이 각성했다'); impact(0.08); sfx('combo'); checkRealm(); } });
    }
    const cards = [], sectCards = [];
    const sect = HEROES[heroIdx].sect, owned = Object.keys(P.weapons).length;
    for (const [id, W] of Object.entries(WEAPONS)) {
      const w = P.weapons[id];
      if (!w && W.sect && sect !== 'all' && W.sect !== sect) continue;
      if (!w && W.secret && !(M.progress.secrets?.sanctum || P.lv >= 12)) continue;
      if (!w && P.banished.has(id)) continue;
      if (w ? w.level >= W.max : owned >= P.maxWeapons) continue;
      const lv = w ? w.level + 1 : 1;
      (W.sect ? sectCards : cards).push({ key: id, img: `icons/${W.icon}.png`, cls: w ? '' : 'new', title: `${W.sect ? `[${SECTS[W.sect]}] ` : ''}${W.name}`, st: '★'.repeat(lv) + '☆'.repeat(W.max - lv), desc: (w ? W.up : W.desc) + (w ? '' : relicHint(id)), pick: () => grant(id) });
    }
    for (const p of PASSIVES) {
      const lv = (P.passives[p.id] || 0) + 1;
      if (lv > p.max || P.banished.has(p.id) || (Object.keys(P.passives).length >= 6 && !P.passives[p.id])) continue;
      cards.push({ key: p.id, img: `icons/${p.icon}.png`, title: p.name, st: '★'.repeat(lv) + '☆'.repeat(p.max - lv), desc: p.desc, pick: () => { P.passives[p.id] = lv; p.f(P); P.picks++; checkRealm(); } });
    }
    const featured = sectCards.length && Math.random() < 0.65 ? [pick(sectCards)] : [];
    const n = P.cardCount + (P.lv % 5 === 0 ? 1 : 0);
    const offer = [...opts.slice(0, n), ...featured, ...shuffle([...cards, ...sectCards.filter((c) => !featured.includes(c))])].slice(0, n);
    if (offer.length < 3) offer.push({ img: 'icons/peach.png', title: '천도복숭아', desc: 'HP 40 회복', pick: () => heal(40) });
    return offer;
  }
  function levelUp(title = '깨달음', sub = '능력을 하나 골라주세요') {
    const tools = { offers: upgradeOffers };
    showChoice(title, sub, upgradeOffers(), tools);
  }
  function arcanaChoice() {
    const pool = shuffle(M.ARCANA.filter((a) => !P.arc.has(a.id))).slice(0, P.arcanaChoices || 3);
    if (!pool.length) return endModal();
    showChoice('비전서', '이번 판의 규칙을 바꿀 비전서 한 권을 골라요', pool.map((a) => ({ icon: a.icon, cls: 'evo', title: `비전서: ${a.name}`, desc: a.desc, pick: () => { P.arc.add(a.id); if (a.apply) a.apply(P); } })));
  }
  function gachaModal(src, grade) {
    queue(() => { sfx('chest'); M.showGacha(src, () => pullItem(grade), endModal); }, true);
  }
  function pullItem(grade) { return M.pullItem(P, grade); }
  function gemChoice() {
    const owned = new Set(P.gems);
    showChoice(`내단 (${P.gems.length + 1}/${M.GEM_SLOTS})`, '요괴의 내단을 흡수해 보석 자리에 박아요', shuffle(M.GEMS.filter((g) => !owned.has(g.id))).slice(0, 3).map((g) => ({ icon: '💎', cls: 'evo', title: `내단: ${g.name}`, desc: g.desc, pick: () => { P.gems.push(g.id); g.apply(P); } })));
  }
  function dealChoice() {
    showChoice('갈림길', '돌파한 길목에서 두 존재가 기다리고 있어요', [
      { icon: '🙏', title: '선인의 축복', desc: '최대 HP +25, HP 전부 회복', pick: () => { P.maxHp += 25; P.hp = P.maxHp; } },
      { icon: '😈', cls: 'evo', title: '마인의 거래', desc: `최대 HP를 20% 바치고 전설 기물 하나를 확정으로 얻어요 (지금 최대 HP ${Math.round(P.maxHp)})`, pick: () => { P.maxHp = Math.round(P.maxHp * 0.8); P.hp = Math.min(P.hp, P.maxHp); gachaModal('마인의 거래', 3); } },
      { icon: '🧭', title: '그냥 지나간다', desc: '아무것도 받지 않아요', pick: () => {} },
    ]);
  }

  function checkRelics() {
    for (const r of M.RELICS) {
      if (P.relics.has(r.id) || !r.need.every((id) => P.weapons[id])) continue;
      P.relics.add(r.id); r.apply(P);
      M.toast(`📿 유물 발동: ${r.name}`, `${r.need.map((id) => WEAPONS[id].name).join('+')} → ${r.desc}`);
      if (P.actor) { FXS.shockwave(P.x, P.y + 0.2, P.z, 5, '#ffd76b'); burst(P.x, chest(), P.z, '#ffd76b', 30, 9, 0.7); }
      sfx('chest');
    }
  }
  // ---------- 경지 (realm) ----------
  const cultivation = () => Object.values(P.weapons).reduce((n, w) => n + w.level, 0) + P.evos * 4 + Math.floor(P.picks / 2) + P.bonusCult;
  function checkRealm() {
    if (!P.actor || P.realm + 1 >= M.REALMS.length || cultivation() < M.REALMS[P.realm + 1].need) return;
    P.realm++;
    const h = HEROES[heroIdx], t = M.heroTier(P.realm);
    P.dmgMul += 0.06; P.maxHp += 10; P.hp = P.maxHp; P.inv = Math.max(P.inv, 1);
    if (t !== P.tier) {
      P.tier = t;
      // higher realms glow: a warm inner light, gold at the summit
      P.actor.ch.mat.emissive.set(['#000000', '#0c0806', '#1a1008', '#2a1a08', '#3a2a08'][t]); P.actor.ch.mat.userData.base = undefined;
      $('portrait').src = A(`${heroLook()}.png`);
    }
    banner(`경지 상승! ${M.REALMS[P.realm].name}`, `${M.rankOf(h, P.realm)}(으)로 승격 · 모든 피해 +6%, 최대 HP +10`);
    burst(P.x, chest(), P.z, '#ffe08a', 50, 10, 0.8); FXS.pillar(P.x, P.y, P.z, '#ffe08a', 14, 1.6, 0.6); impact(0.06); sfx('levelup');
    if (P.arc.has('ten')) for (const [id, w] of Object.entries(P.weapons)) if (w.level < WEAPONS[id].max) grant(id);
    checkRealm();
  }

  // ---------- 진행 ----------
  function banner(t, sub = '') { $('banner').innerHTML = t + (sub ? `<small>${sub}</small>` : ''); $('banner').style.opacity = 1; bannerT = 2.6; }
  function gainXp(v) {
    P.xp += v * P.xpMul * (P.buffs.fortune > 0 ? 2 : 1);
    while (P.xp >= P.next) {
      P.xp -= P.next; P.lv++;
      P.next = Math.floor(6 + P.lv * 4.2 + P.lv * P.lv * 0.32);
      sfx('levelup');
      queue(() => levelUp());
    }
  }
  function heal(v) { const k = v * P.healMul; P.hp = Math.min(P.maxHp, P.hp + k); return k; }
  function addGold(v) {
    const g = v * P.greed * diff.gold * (P.buffs.fortune > 0 ? 2 : 1);
    P.gold += g;
    text(P.x, P.y + 3.2, P.z, `은자 +${Math.round(g)}`, '#e8eef6', 15, 0.7);
  }
  // Pays the run's 은자 into the shared save (safe to call twice).
  let banked = 0;
  function bankGold() {
    const g = Math.floor(P.gold) - banked;
    if (g <= 0) return;
    banked += g; M.progress.gold += g; M.progress.totalGold += g; M.saveProgress();
  }
  function comboMilestone(n) {
    sfx('combo'); addGold(5 + n / 10);
    let t = `${n}연격!`;
    if (n % 150 === 0) { for (const o of orbs) o.pull = true; heal(15); t += ' 경험치 흡수 · HP +15'; }
    if (n % 300 === 0) { dropPickup('treasure', P.x + 1.5, P.z); t += ' · 보물함!'; }
    text(P.x, P.y + 4, P.z, t, '#ffd76b', 24, 1.1, true);
  }
  function bossDown() {
    $('boss').style.display = 'none';
    impact(0.1); shake = 1.4; hitStopT = 0.14;
    text(boss.x, boss.y + boss.h, boss.z, '격파!!', '#ffe08a', 46, 1.4, true);
    boss = null;
    const last = si >= STAGES.length - 1;
    clearing = true;
    M.progress.bestStage = Math.max(M.progress.bestStage, si + 1);
    P.cleared++;
    for (const e of enemies) if (!e.dead && !e.T.prop) { e.dead = true; FXS.explode(e.x, e.y, e.z, 1.2, '#ffffff', { scorch: false }); dropActor(e.a); }
    enemies = enemies.filter((e) => !e.dead); eshots.forEach((s2) => scene.remove(s2.m)); eshots = [];
    P.hp = P.maxHp;
    addGold(40 * (si + 1));
    if (last) {
      M.progress.wins++; M.progress.clears[diff.id] = true; P.won = true;
      dropPickup('jumeoni', P.x, P.z + 1.5, 150);
      M.saveProgress();
      setTimeout(() => running && gameOver('win'), 2200);
      return;
    }
    M.progress.gearBoxes = (M.progress.gearBoxes || 0) + 1;
    M.saveProgress();
    M.toast('장비 상자 획득', '시작 화면의 장비 탭에서 열 수 있어요');
    banner(`${STAGES[si].name.split(' · ')[0]} 돌파!`, '요괴가 물러갔어요 · HP 전부 회복');
    setTimeout(() => {
      const gifts = 3 + P.stageGiftBonus;
      for (let k = 1; k <= gifts; k++) queue(() => levelUp(`돌파 선물 (${k}/${gifts})`, '선물 하나를 골라주세요'));
      queue(arcanaChoice);
      if (Math.random() < 0.6) queue(dealChoice);
      queue(() => {
        $('clearTitle').textContent = `${STAGES[si].name.split(' · ')[0]} 돌파`;
        $('clearTxt').textContent = `다음: ${STAGES[si + 1].name} — ${STAGES[si + 1].sub}`;
        $('nextBtn').onclick = () => { $('clear').classList.remove('on'); nextStage(); endModal(); };
        $('clear').classList.add('on');
      });
    }, 1600);
  }
  function clearField() {
    for (const e of enemies) dropActor(e.a);
    for (const c of corpses) dropActor(c.a);
    corpses = [];
    enemies = [];
    for (const s2 of [...shots, ...eshots]) scene.remove(s2.m);
    for (const o of orbs) scene.remove(o.m);
    shots = []; eshots = []; orbs = [];
    clearEvents();
    ARTS.clear(); FXS.clear();
  }
  function nextStage() {
    gainXp(orbs.reduce((s2, o) => s2 + o.v, 0));
    clearField();
    texts = [];
    si++; stageTime = 0; bossOut = false; waveDone = false; clearing = false;
    buildWorld(si);
    P.x = 0; P.z = 0; P.y = H(0, 0); P.vy = 0; P.air = false; P.lx = P.lz = 0;
    P.hp = Math.min(P.maxHp, P.hp + P.maxHp * 0.5);
    resetStageEvents();
    banner(STAGES[si].name, `${STAGES[si].sub} · 요괴의 기운이 한층 짙어졌다`);
    sfx('gong');
  }

  // ---------- 강호 사건: 줍는 것, 제단, 습격, 황금 도깨비, 기연·비무·사당, 석등, 제자 ----------
  let diff = M.makeDiff('normal', 0), daily = null;
  let pickups = [], shrines = [], altars = [], oddities = [], bombs = [], disciples = [];
  let shrineT = 25, goldT = 90, oddT = 70, lanternT = 3, achvT = 3, raided = {}, marchDone = false, duelDone = false, sanctumRolled = false, altarDone = false;
  const PICK_SIZE = { treasure: 1.7, bottari: 1.3, naedan: 1.2, jumeoni: 1.1, thunderball: 1.2 };
  const pickMats = {};
  const pickMat = (k) => pickMats[k] || (pickMats[k] = new THREE.SpriteMaterial({ map: tex(k), transparent: true, alphaTest: 0.3 }));
  function dropPickup(kind, x, z, v = 0) {
    if (pickups.length > 120) return;
    const s2 = new THREE.Sprite(pickMat(kind)); const sz = PICK_SIZE[kind] || 1; s2.scale.set(sz, sz, 1); scene.add(s2);
    pickups.push({ kind, x, z, v, s: s2, t: 0, sz });
  }
  function dropGem(x, z) {
    if (P.gems.length + pickups.filter((it) => it.kind === 'naedan').length >= M.GEM_SLOTS) dropPickup('jumeoni', x, z, 30);
    else dropPickup('naedan', x, z);
  }
  function collect(it) {
    const hy = P.y + 3;
    if (it.kind === 'peach' || it.kind === 'ginseng') { text(P.x, hy, P.z, `+${Math.round(heal(it.v))}`, '#ff8fb4', 20, 0.8); sfx('coin', 6); }
    else if (it.kind === 'gourd') { for (const o of orbs) o.pull = true; text(P.x, hy, P.z, '흡수!', '#e0503f', 22, 0.8, true); sfx('combo'); }
    else if (it.kind === 'thunderball') {
      impact(0.12); shake = Math.max(shake, 1.2); sfx('boom'); FXS.shockwave(P.x, P.y, P.z, 30, '#ffe08a', { life: 0.6 });
      for (const e of nearestN(999, 32)) procs.push(() => hurt(e, e.T.boss ? 120 : e.hp + 1, 0, 0, { quiet: true, color: '#ffe08a' }));
    } else if (it.kind === 'eunja' || it.kind === 'jumeoni') { addGold(it.v); sfx('coin', 4); }
    else if (it.kind === 'bangul') { P.freeze = 6; impact(0.08); FXS.shockwave(P.x, P.y, P.z, 30, '#8cc8f0', { life: 0.6 }); text(P.x, hy, P.z, '정지!', '#8cc8f0', 24, 0.9, true); sfx('shrine'); }
    else if (it.kind === 'bottari') { gachaModal('요괴 보따리'); burst(P.x, chest(), P.z, '#ffd76b', 24, 8, 0.6); }
    else if (it.kind === 'naedan') { queue(gemChoice, true); burst(P.x, chest(), P.z, '#c890ff', 24, 8, 0.6); sfx('chest'); }
    else if (it.kind === 'treasure') {
      P.chests++;
      const r = Math.random() * P.luck, n = r > 0.94 ? 5 : r > 0.72 ? 3 : 1;
      for (let k = n; k >= 1; k--) queue(() => levelUp(n > 1 ? `보물함! (${k}/${n})` : '보물함!', '선물 하나를 골라주세요'), true);
      if (n >= 5) gachaModal('대박 보물함');
      addGold(10 * n);
      FXS.pillar(P.x, P.y, P.z, '#ffd76a', 16, n > 1 ? 2.4 : 1.4, 0.9); burst(P.x, chest(), P.z, '#ffe066', 40, 10, 0.7); sfx('chest');
    }
  }
  // 석등: breakable props that hold small treats (they count as targets like in 2D)
  const LANTERN_T = { key: 'lantern', name: '석등', hp: 1, spd: 0, dmg: 0, r: 14, xp: 0, prop: true };
  const lanternGeo = (() => {
    const parts = [[1.0, 0.35, 1.0, 0.17], [0.32, 1.1, 0.32, 0.9], [0.9, 0.2, 0.9, 1.5], [0.62, 0.55, 0.62, 1.88], [1.2, 0.18, 1.2, 2.24], [0.5, 0.2, 0.5, 2.42]];
    return mergeGeometries(parts.map(([w, h, d, y]) => new THREE.BoxGeometry(w, h, d).translate(0, y, 0)));
  })();
  const lanternMat = new THREE.MeshLambertMaterial({ color: '#9a958a', emissive: '#2a1a08' });
  function propActor(geo, mat, h) {
    const m = new THREE.Mesh(geo, mat); m.castShadow = true; scene.add(m);
    const sh = new THREE.Mesh(shadowGeo, shadowMat); sh.visible = false; scene.add(sh);
    return { ch: { obj: m, mat: { emissive: { set() {} } }, height: h, play() {}, busy: () => true, update() {}, flash() {}, setLook() {}, dispose() { m.removeFromParent(); } }, sh, yaw: 0, h, scale: 1, state: '' };
  }
  function breakLantern(e) {
    P.lanterns++;
    burst(e.x, e.y + 1.5, e.z, '#ffd76b', 16, 6, 0.5); FXS.hit(e.x, e.y + 1.5, e.z, '#ffd76b', true); sfx('kill');
    dropActor(e.a);
    const r = Math.random() / Math.sqrt(P.luck);
    const d = r < 0.06 ? 'thunderball' : r < 0.14 ? 'bangul' : r < 0.24 ? 'gourd' : r < 0.36 ? 'ginseng' : r < 0.6 ? 'peach' : r < 0.85 ? 'eunja' : 'jumeoni';
    dropPickup(d, e.x, e.z, d === 'ginseng' ? 60 : d === 'eunja' ? 4 : d === 'jumeoni' ? 15 : 25);
  }
  // world markers for shrines, altars and oddities: a ground ring, a light shaft and a floating icon
  const ringGeo = new THREE.RingGeometry(0.86, 1, 40).rotateX(-Math.PI / 2), shaftGeo = new THREE.CylinderGeometry(1, 1, 14, 16, 1, true).translate(0, 7, 0);
  const iconMats = {};
  function marker(x, z, R, color, ic) {
    const g = new THREE.Group(), y = H(x, z);
    g.position.set(x, y + 0.12, z);
    const ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color, ...ADD, opacity: 0.85 })); ring.scale.setScalar(R); g.add(ring);
    const fill = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color, ...ADD, opacity: 0.9 })); fill.scale.setScalar(0.01); g.add(fill);
    const shaft = new THREE.Mesh(shaftGeo, new THREE.MeshBasicMaterial({ color, ...ADD, opacity: 0.12, side: THREE.DoubleSide })); shaft.scale.set(R * 0.5, 1, R * 0.5); g.add(shaft);
    const f = M.iconFile(ic);
    if (f) { const sp = new THREE.Sprite(iconMats[f] || (iconMats[f] = new THREE.SpriteMaterial({ map: tex(f.replace('.png', '')), transparent: true, alphaTest: 0.3 }))); sp.scale.set(1.6, 1.6, 1); sp.position.y = 3.4; g.add(sp); g.userData.icon = sp; }
    g.userData.fill = fill; scene.add(g);
    return g;
  }
  const dropMarker = (g) => { g.removeFromParent(); g.traverse((o) => { if (o.material && !Object.values(iconMats).includes(o.material)) o.material.dispose(); }); };
  function ringAround(x, z, R) { for (let i = 0; i < 10; i++) { const a = rand(0, 6.28), d = rand(R * 0.7, R); const px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d; if (Math.abs(px) < WORLD - 14 && Math.abs(pz) < WORLD - 14 && H(px, pz) > WATER_Y && H(px, pz) < H(x, z) + 3) return [px, pz]; } return [x + R * 0.7, z]; }
  const GAPI = {
    get P() { return P; }, addGold: (v) => addGold(v), grant: (id) => grant(id), weaponName: (id) => WEAPONS[id].name, cultivation: () => cultivation(), checkRealm: () => checkRealm(),
    upgradable: () => Object.keys(P.weapons).filter((id) => P.weapons[id].level < WEAPONS[id].max),
    drop: (k, dx, dz) => dropPickup(k, P.x + dx, P.z + dz), ring: (k, n, R) => { for (let i = 0; i < n; i++) spawn(k, { a: (i / n) * Math.PI * 2, d: R }); },
  };
  function oddityChoice(o) {
    if (o.kind === 'giyeon') {
      M.progress.giyeonCount = (M.progress.giyeonCount || 0) + 1; M.saveProgress();
      showChoice(`기연 · ${o.ev.title}`, o.ev.text, o.ev.options.map((op) => ({ icon: op.icon, title: op.label, desc: op.desc, pick: () => { const [t, sub] = op.run(GAPI); banner(t, sub); sfx('shrine'); } })));
    } else if (o.kind === 'duel') {
      const h = HEROES.find((x) => x.key === o.hid);
      showChoice(`비무 · ${h.name}`, `${h.role} ${h.name}이(가) 비무를 청한다. 이기면 은자와 보물함을 얻어요`, [
        { img: `${h.key}.png`, cls: 'evo', title: '겨룬다', desc: '쓰러뜨릴 때까지 따라붙어요', pick: () => startDuel(h, o.x, o.z) },
        { icon: '🧭', title: '사양한다', desc: '고수가 웃으며 떠나요', pick: () => {} },
      ]);
    } else if (o.kind === 'sanctum') {
      M.progress.secrets = M.progress.secrets || {}; M.progress.secrets.sanctum = true; M.saveProgress();
      const secret = Object.entries(WEAPONS).filter(([id, W]) => W.secret && !P.weapons[id]);
      const opts = shuffle(secret).slice(0, 3).map(([id, W]) => ({ img: `icons/${W.icon}.png`, cls: 'evo', title: `비전: ${W.name}`, desc: W.desc, pick: () => grant(id) }));
      if (Object.keys(P.weapons).length >= P.maxWeapons || !opts.length) { banner('하늘 밖의 검', '비전 무공이 이제 깨달음 선택지에 나타나요'); endModal(); return; }
      showChoice('숨겨진 사당', '이끼 낀 비석에 하늘 밖의 검이 새겨져 있다 (이제 비전 무공이 영원히 열려요)', opts);
    }
  }
  function startDuel(h, x, z) {
    const T = { key: h.key, name: `${h.name} (비무)`, hp: 700 + si * 900, spd: 120, dmg: 16 + si * 5, r: 15, xp: 40, ai: 'charger', duelist: true };
    const e = spawn(null, { T, x, z, solo: true, kind: h.key, dmgMul: 1, hpMul: 1 });
    if (e) { e.title = `${h.name} · ${h.role}`; banner('비무 시작!', `${h.name}을(를) 쓰러뜨리세요`); sfx('boss'); }
  }
  function duelWon(e) {
    M.progress.duelWins = (M.progress.duelWins || 0) + 1; M.saveProgress();
    addGold(60 + si * 40); dropPickup('treasure', e.x, e.z);
    banner('비무 승리!', `${e.T.name.split(' ')[0]}이(가) 고개를 숙였다`); hitStopT = 0.12; sfx('chest');
  }
  function goldCaught(e) {
    P.goldKills++; M.progress.goldKills = (M.progress.goldKills || 0) + 1; M.saveProgress();
    dropPickup('jumeoni', e.x, e.z, 40);
    for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2; dropPickup('eunja', e.x + Math.cos(a) * 2, e.z + Math.sin(a) * 2, 8); }
    if (Math.random() < 0.5) dropPickup('treasure', e.x, e.z - 1.4);
    dropPickup('bottari', e.x + 1.4, e.z - 1.4);
    FXS.pillar(e.x, e.y, e.z, '#ffd76a', 18, 2, 0.8); burst(e.x, e.y + 1, e.z, '#ffd76b', 60, 12, 0.9);
    banner('황금 도깨비 포획!', '은자가 쏟아져요'); sfx('goblin'); hitStopT = 0.1;
  }
  const RAID_KEY = (w) => `${si}-${w}`;
  function updateEvents(dt) {
    if (clearing) { while (procs.length) procs.shift()(); return; }
    for (const k of Object.keys(P.buffs)) if ((P.buffs[k] -= dt) <= 0) delete P.buffs[k];
    if ((P.comboT -= dt) <= 0) P.combo = 0;
    if (P.ultT > 0) P.ultT -= dt;
    if (P.freeze > 0) P.freeze -= dt;
    if (P.hp < P.maxHp * 0.3 && (P.heartT -= dt) <= 0) { P.heartT = 0.85; sfx('heart'); }
    while (procs.length) procs.shift()();
    for (const t of P.itemTicks) if ((t.t -= dt) <= 0) {
      t.t = t.every;
      if (t.fn === 'drum') { for (const e of shuffle(nearestN(30, 20)).slice(0, 5)) { FXS.bolt(e.x, H(e.x, e.z), e.z, '#bfe0ff'); hurt(e, 30 + P.lv * 6, 0, 0, { color: '#bfe0ff' }); } sfx('crit'); }
      else { FXS.shockwave(P.x, P.y + 0.5, P.z, 10, '#c8dcff', { life: 0.5 }); FXS.slash(P.x, P.y + 1.2, P.z, 0, 9, '#dfe8ff', { life: 0.35 }); inRadius(P.x, P.z, 10, (e) => hurt(e, 60 + P.lv * 9, (e.x - P.x) * 1.5, (e.z - P.z) * 1.5, { color: '#c8dcff' })); }
    }
    if (P.arc.has('meteor') && (P.meteorT -= dt) <= 0) {
      P.meteorT = 8;
      const tg = nearestN(8, 22);
      for (let i = 0; i < 8; i++) {
        const e = tg[i % Math.max(1, tg.length)], x = e ? e.x : P.x + rand(-8, 8), z = e ? e.z : P.z + rand(-8, 8);
        setTimeout(() => { if (!running) return; FXS.pillar(x, H(x, z), z, '#ffe8a0', 16, 0.7, 0.35); FXS.shockwave(x, H(x, z), z, 2.6, '#ffe8a0', { life: 0.3 }); inRadius(x, z, 2.6, (t) => hurt(t, 40 + P.lv * 7, 0, 0, { arcana: true, color: '#ffe8a0' })); }, i * 90);
      }
    }
    // volatile elites' death blasts
    for (const b of bombs) if ((b.t -= dt) <= 0) {
      FXS.explode(b.x, H(b.x, b.z), b.z, b.R, '#ff5a3c'); shake = Math.max(shake, 0.5); sfx('boom');
      if (Math.hypot(P.x - b.x, P.z - b.z) < b.R && P.y - H(P.x, P.z) < 1.5) damagePlayer(b.dmg);
    }
    bombs = bombs.filter((b) => b.t > 0);
    // pickups
    for (const it of pickups) {
      it.t += dt;
      const d = Math.hypot(P.x - it.x, P.z - it.z);
      if ((it.kind === 'eunja' || it.kind === 'jumeoni') && d < P.magnet) { const k = Math.min(1, dt * 10 / Math.max(d, 0.5)); it.x += (P.x - it.x) * k; it.z += (P.z - it.z) * k; }
      it.s.position.set(it.x, H(it.x, it.z) + it.sz * 0.55 + Math.sin(time * 3 + it.x) * 0.12, it.z);
      if (d < 1.5 && Math.abs(P.y - H(it.x, it.z)) < 2.5) { it.got = true; collect(it); }
      else if (it.t > 90 && it.kind !== 'treasure' && it.kind !== 'naedan') it.got = true;
      if (it.got) it.s.removeFromParent();
    }
    pickups = pickups.filter((it) => !it.got);
    // 석등
    if ((lanternT -= dt) <= 0) {
      lanternT = 5;
      if (enemies.filter((e) => e.T.prop).length < 10) { const a = rand(0, 6.28), d = rand(16, 26); const x = P.x + Math.cos(a) * d, z = P.z + Math.sin(a) * d; if (Math.abs(x) < WORLD - 12 && Math.abs(z) < WORLD - 12 && H(x, z) > WATER_Y) spawn(null, { T: LANTERN_T, x, z, actor: propActor(lanternGeo, lanternMat, 2.6) }); }
    }
    // 제단: stand inside for 2.2 s to receive a 30-second blessing
    if ((shrineT -= dt) <= 0) {
      shrineT = rand(65, 95);
      if (shrines.length < 2) { const [x, z] = ringAround(P.x, P.z, 22); const buff = pick(M.SHRINE_BUFFS); shrines.push({ x, z, buff, charge: 0, life: 70, g: marker(x, z, 2.6, buff.color, buff.icon) }); }
    }
    for (const sh of shrines) {
      sh.life -= dt;
      const inside = Math.hypot(P.x - sh.x, P.z - sh.z) < 2.6;
      sh.charge = clamp(sh.charge + (inside ? dt : -dt * 0.6), 0, 2.2);
      sh.g.userData.fill.scale.setScalar(0.01 + 2.6 * sh.charge / 2.2); sh.g.rotation.y += dt;
      if (sh.charge >= 2.2) {
        P.buffs[sh.buff.id] = 30; P.shrinesUsed++; sh.life = 0;
        sfx('shrine'); SND.buzz(40); FXS.pillar(sh.x, H(sh.x, sh.z), sh.z, sh.buff.color, 18, 2.4, 0.8);
        banner(sh.buff.name, `30초 동안 ${sh.buff.desc}`);
      }
      if (sh.life <= 0) dropMarker(sh.g);
    }
    shrines = shrines.filter((sh) => sh.life > 0);
    // 천운 제단: one per chapter; pay the run's 은자 for a pull (price climbs)
    if (!altarDone && stageTime > 40) {
      altarDone = true;
      const [x, z] = ringAround(P.x, P.z, 18);
      altars.push({ x, z, charge: 0, cool: 0, g: marker(x, z, 2.4, '#ff9a1f', '🎁') });
      banner('천운 제단 출현', '은자를 바치면 기물을 뽑을 수 있어요'); sfx('shrine');
    }
    for (const al of altars) {
      al.cool = Math.max(0, al.cool - dt);
      al.g.rotation.y += dt * 2; al.g.children[0].material.color.setHSL((time * 0.25) % 1, 0.9, 0.6);
      const inside = Math.hypot(P.x - al.x, P.z - al.z) < 2.4;
      al.charge = inside && !al.cool ? al.charge + dt : 0;
      al.g.userData.fill.scale.setScalar(0.01 + 2.4 * Math.min(1, al.charge));
      if (al.charge < 1) continue;
      al.charge = 0; al.cool = 2.5;
      if (P.gold - banked < P.altarCost) { text(al.x, H(al.x, al.z) + 4, al.z, `은자 부족 (${P.altarCost}냥)`, '#ff6050', 18, 1); continue; }
      P.gold -= P.altarCost; P.altarCost = Math.round(P.altarCost * 1.6);
      FXS.pillar(al.x, H(al.x, al.z), al.z, '#ffb040', 18, 2, 0.8);
      gachaModal('천운 제단');
    }
    // 세력 습격 at 1:02 and 3:20 of each chapter
    const wave = stageTime >= 200 ? 2 : stageTime >= 62 ? 1 : 0;
    if (wave && !raided[RAID_KEY(wave)] && !boss) {
      raided[RAID_KEY(wave)] = true;
      const rd = M.RAIDS[Math.min(si, M.RAIDS.length - 1)];
      const n = Math.round((12 + si * 4) * Math.min(1, diff.spawn + 0.15));
      for (let i = 0; i < n; i++) spawn(rd.members[i % rd.members.length], { a: (i / n) * Math.PI * 2, d: 18 });
      spawn(rd.capKind, { elite: true, affix: 'armored', title: rd.captain, hpMul: 1.5, d: 20 });
      banner(rd.name, `${rd.sub} · ${rd.captain} 등장`); sfx('boss'); SND.buzz([40, 30, 40]);
    }
    // 백귀야행: a column of ghosts sweeps across from chapter 2 on
    if (!marchDone && si >= 1 && stageTime > 240 && !boss) {
      marchDone = true;
      const a = rand(0, 6.28), dx = Math.cos(a), dz = Math.sin(a), nx = -dz, nz = dx;
      for (let i = 0; i < 28; i++) { const o = (i % 7 - 3) * 1.8, back = Math.floor(i / 7) * 2.5; spawn(i % 3 ? 'wongwi' : 'wisp', { x: P.x - dx * (26 + back) + nx * o, z: P.z - dz * (26 + back) + nz * o, march: { dx, dz, t: 12 } }); }
      banner('백귀야행!', '귀신 행렬이 지나간다 · 길을 비켜요'); sfx('boss');
    }
    // 황금 도깨비: flees, escapes after 14 s
    if (stageTime > 30 && (goldT -= dt) <= 0 && !boss) {
      goldT = P.goldRush ? rand(35, 55) : rand(100, 160);
      const T = { key: 'dokkaebi', name: '황금 도깨비', hp: 140 * (1 + si), spd: 0, dmg: 0, r: 15, xp: 20, gold: true };
      const a = rand(0, 6.28), g = spawn(null, { T, x: P.x + Math.cos(a) * 14, z: P.z + Math.sin(a) * 14, solo: true, kind: 'dokkaebi', tint: '#ffcc33', scale: 1.2 });
      if (g) { g.spd = P.speed * 0.82; g.escapeT = 14; g.flee = true; g.hp = g.max = 140 * (1 + si) * (diff.hp / 1.4); banner('황금 도깨비 출현!', '도망가기 전에 잡으면 은자가 쏟아져요'); sfx('goblin'); }
    }
    // 기연 spots, a wandering challenger, the rare hidden sanctum
    if (stageTime > 40 && (oddT -= dt) <= 0) {
      oddT = rand(80, 140);
      if (oddities.length < 2) { const [x, z] = ringAround(P.x, P.z, 24); oddities.push({ kind: 'giyeon', ev: pick(M.GIYEON), x, z, life: 75, g: marker(x, z, 1.8, '#b48cff', '📖') }); }
    }
    if (!duelDone && stageTime > 100 && !boss) {
      duelDone = true;
      const ids = HEROES.filter((h) => h.key !== heroKey() && M.heroUnlocked(h.key));
      const h = pick(ids), [x, z] = ringAround(P.x, P.z, 16);
      oddities.push({ kind: 'duel', hid: h.key, x, z, life: 45, g: marker(x, z, 1.8, '#ffd76a', '⚔️') });
      banner(`떠돌이 고수 ${h.name}`, '비무를 청해 왔어요 · 다가가면 겨룰지 정할 수 있어요');
    }
    if (!sanctumRolled && stageTime > 60) {
      sanctumRolled = true;
      if (Math.random() < 0.15) { const a = rand(0, 6.28); let x = clamp(P.x + Math.cos(a) * 40, -WORLD + 20, WORLD - 20), z = clamp(P.z + Math.sin(a) * 40, -WORLD + 20, WORLD - 20); oddities.push({ kind: 'sanctum', x, z, life: 999, g: marker(x, z, 2, '#8cffc8', '✨') }); }
    }
    for (const o of oddities) {
      o.life -= dt; o.g.rotation.y += dt * 1.5;
      if (o.g.userData.icon) o.g.userData.icon.position.y = 3.4 + Math.sin(time * 2) * 0.3;
      if (Math.hypot(P.x - o.x, P.z - o.z) < 2 && Math.abs(P.y - H(o.x, o.z)) < 3) { o.life = 0; queue(() => oddityChoice(o), true); }
      if (o.life <= 0) dropMarker(o.g);
    }
    oddities = oddities.filter((o) => o.life > 0);
    updateDisciples(dt);
    if ((achvT -= dt) <= 0) { achvT = 3; M.checkAchievements(runSummary(), onAchv); }
  }
  function updateDisciples(dt) {
    if (disciples.length < P.disciples && P.actor) {
      const pool = HEROES.filter((h) => !M.HERO_UNLOCK[h.key] && h.key !== heroKey());
      const h = pool[(disciples.length * 7 + 3) % pool.length];
      disciples.push({ h, a: makeActor(h.key, 0.78), x: P.x, z: P.z, y: P.y, cd: 0.6 + disciples.length * 0.4 });
    }
    disciples.forEach((d, i) => {
      const ang = camYaw + Math.PI + (i - (disciples.length - 1) / 2) * 0.9, tx = P.x + Math.sin(ang) * 2.6, tz = P.z + Math.cos(ang) * 2.6;
      const dx = tx - d.x, dz = tz - d.z, dd = Math.hypot(dx, dz);
      if (dd > 30) { d.x = tx; d.z = tz; }
      const sp = Math.min(dd, P.speed * 1.15 * dt);
      if (dd > 0.3) { d.x += (dx / dd) * sp; d.z += (dz / dd) * sp; }
      d.y = H(d.x, d.z);
      placeActor(d.a, d.x, d.y, d.z, d.y, dd > 0.3 ? dx : 0, dd > 0.3 ? dz : 0, dd > 0.5 ? 1 : 0, dt, 1.2);
      if ((d.cd -= dt) <= 0) {
        const e = nearestN(1, 16, d.x, d.z)[0];
        d.cd = 1.1;
        if (e) { FXS.beam(d.x, d.y + 1.3, d.z, e.x, e.y + e.h * 0.5, e.z, d.h.color, 0.35, 0.18); hurt(e, 10 + P.lv * 2.5, (e.x - d.x) * 0.5, (e.z - d.z) * 0.5, { quiet: true, color: d.h.color }); actorAnim(d.a, 'slash', 1.6); }
      }
    });
  }
  function clearEvents() {
    for (const it of pickups) it.s.removeFromParent();
    for (const x of [...shrines, ...altars, ...oddities]) dropMarker(x.g);
    pickups = []; shrines = []; altars = []; oddities = []; bombs = []; procs.length = 0;
  }
  function resetStageEvents() {
    shrineT = 25; oddT = 70; goldT = P.goldRush ? 20 : rand(60, 100); marchDone = false; duelDone = false; sanctumRolled = false; altarDone = false;
    for (const d of disciples) { d.x = P.x; d.z = P.z; }
    for (let i = 0; i < P.innChests; i++) dropPickup('treasure', P.x + 3 + i * 1.6, P.z + 1);
  }
  const partnerEvo = (id) => !!EVOS[id]?.partner;
  const baseHeroes = HEROES.filter((h) => !M.HERO_UNLOCK[h.key]).map((h) => h.key);
  function runSummary() {
    return { kills, elapsed: time, bossKills: P.bossKills, evos: P.evos, evoTotal: Object.keys(EVOS).length, level: P.lv, weapons: Object.keys(P.weapons).length, maxWeapons: P.maxWeapons,
      chests: P.chests, partnerEvo, realm: P.realm, elites: P.elites, lanterns: P.lanterns, curse: P.curse, won: P.won, maxCombo: P.maxCombo, shrinesUsed: P.shrinesUsed, cleared: P.cleared,
      baseHeroes, hero: heroKey(), ults: P.ults, dashes: P.dashes, diffHp: diff.hp, stage: si, stageName: STAGES[si].name.split(' · ')[0] };
  }
  function onAchv(a, hero) {
    const h = hero && HEROES.find((x) => x.key === hero);
    M.toast(`🏆 업적 달성: ${a.name}`, h ? `새 협객 해금! ${h.name} · ${h.role}` : a.desc);
    sfx('chest');
  }

  // ---------- 이동 판정 ----------
  function canStep(x0, z0, x1, z1, footY) {
    if (Math.abs(x1) > WORLD - 6 || Math.abs(z1) > WORLD - 6) return false;
    const g1 = H(x1, z1);
    if (footY >= g1 - 0.25) return true;
    const d = Math.hypot(x1 - x0, z1 - z0) || 1e-3;
    return (g1 - H(x0, z0)) / d < 1.5 && g1 - footY < 0.9;
  }
  function moveXZ(o, dx, dz, footY, r) {
    const cx0 = Math.floor((o.x + dx) / OCELL), cz0 = Math.floor((o.z + dz) / OCELL);
    for (let gx = cx0 - 1; gx <= cx0 + 1; gx++) for (let gz = cz0 - 1; gz <= cz0 + 1; gz++) for (const ob of OGRID.get(okey(gx, gz)) || []) {
      const ex = o.x + dx - ob.x, ez = o.z + dz - ob.z;
      if (Math.abs(ex) > ob.r + r || Math.abs(ez) > ob.r + r) continue;
      const d = Math.hypot(ex, ez), m = ob.r + r;
      if (d < m && d > 1e-4) { dx += (ex / d) * (m - d); dz += (ez / d) * (m - d); }
    }
    if (canStep(o.x, o.z, o.x + dx, o.z + dz, footY)) { o.x += dx; o.z += dz; return; }
    if (canStep(o.x, o.z, o.x + dx, o.z, footY)) { o.x += dx; return; }
    if (canStep(o.x, o.z, o.x, o.z + dz, footY)) o.z += dz;
  }

  // ---------- 매 프레임 ----------
  const camPos = new THREE.Vector3(), camLook = new THREE.Vector3();
  let fwdX = 0, fwdZ = -1, rgtX = 1, rgtZ = 0;
  function update(dt) {
    frameNo++;
    time += dt; stageTime += dt;
    wordCd = Math.max(0, wordCd - dt);
    // input → camera-relative movement
    if (camMode === 'chase') { if (keys.KeyE) camYaw -= dt * 2.2; }
    let ix = (keys.KeyD || keys.ArrowRight ? 1 : 0) - (keys.KeyA || keys.ArrowLeft ? 1 : 0) + stick.x;
    let iz = (keys.KeyS || keys.ArrowDown ? 1 : 0) - (keys.KeyW || keys.ArrowUp ? 1 : 0) + stick.y;
    const il = Math.hypot(ix, iz); if (il > 1) { ix /= il; iz /= il; }
    fwdX = -Math.sin(camYaw); fwdZ = -Math.cos(camYaw); rgtX = Math.cos(camYaw); rgtZ = -Math.sin(camYaw);
    if (P.boostT > 0) P.boostT -= dt;
    const spdNow = P.speed * (P.boostT > 0 ? 1.4 : 1) * (P.buffs.swift > 0 ? 1.35 : 1);
    const mx = (rgtX * ix - fwdX * iz) * spdNow, mz = (rgtZ * ix - fwdZ * iz) * spdNow;
    if (P.flameTrail && il > 0.1 && (P.trailT = (P.trailT || 0) - dt) <= 0) { P.trailT = 0.22; ARTS.poison(P.x, P.z, 1.1 * P.area, 5 + P.lv * 1.2, 1.6, '#ff6a2a'); }
    if (Math.abs(ix) > 0.1) P.faceL = ix < 0;
    P.lx *= P.air ? 0.995 : 0.8; P.lz *= P.air ? 0.995 : 0.8;
    moveXZ(P, (mx + P.lx) * dt, (mz + P.lz) * dt, P.y, 0.6);
    const g = H(P.x, P.z);
    if (wantJump && P.jumps < P.maxJumps) {
      P.vy = P.jump * (P.jumps ? 0.85 : 1); P.jumps++; P.air = true; P.inv = Math.max(P.inv, 0.25); P.dashes++; sfx('dash');
      if (P.jumps === 2 && P.arc.has('gale')) P.galeLand = true;
      if (P.jumps === 2) actorAnim(P.actor, 'roll', 1.6);
      burst(P.x, P.y + 0.3, P.z, '#e8f4ff', 10, 4, 0.35);
      if (P.jumps === 2) FXS.shockwave(P.x, P.y, P.z, 1.8, '#cfefff', { life: 0.3 });
    }
    wantJump = false;
    if (wantUlt) { wantUlt = false; ultimate(); }
    if (P.air || P.y > g + 0.6) {
      P.air = true; P.vy -= (P.stomping && P.vy < 0 ? 70 : 34) * dt; P.y += P.vy * dt;
      if (P.y <= g) { P.y = g; P.vy = 0; P.air = false; P.jumps = 0; P.stomping = false; burst(P.x, g + 0.2, P.z, '#d8cbb0', 6, 3, 0.3);
        if (P.galeLand) { P.galeLand = false; FXS.slash(P.x, g + 1, P.z, 0, 5, '#b8ffd0', { life: 0.3 }); FXS.shockwave(P.x, g, P.z, 5, '#b8ffd0'); inRadius(P.x, P.z, 5, (e) => hurt(e, 25 + P.lv * 4, (e.x - P.x) * 2, (e.z - P.z) * 2, { arcana: true, color: '#b8ffd0' })); }
        if (P.onLand) { const f = P.onLand; P.onLand = null; f(); } }
    } else { P.y = g; P.jumps = 0; }
    if (P.y < WATER_Y - 0.6) P.y = Math.max(P.y, g);
    for (const p of pads) {
      p.ring.rotation.y += dt * 2; p.ring.position.y = 0.15 + Math.sin(time * 4) * 0.1;
      if (!P.air && Math.hypot(P.x - p.x, P.z - p.z) < 1.5) {
        const dx = p.tx - P.x, dz = p.tz - P.z, d = Math.hypot(dx, dz);
        P.vy = Math.sqrt(2 * 34 * (p.h + 5)); P.air = true; P.jumps = 1;
        const tAir = (P.vy + Math.sqrt(P.vy * P.vy - 2 * 34 * p.h)) / 34;
        P.lx = (dx / d) * (d - 2) / tAir; P.lz = (dz / d) * (d - 2) / tAir;
        burst(P.x, P.y + 0.5, P.z, '#7fe3ff', 30, 9, 0.6); text(P.x, P.y + 3, P.z, '경공!', '#9fefff', 26, 0.8, true);
      }
    }
    const top = PLATEAUS.find((p) => p.h > 4 && Math.hypot(P.x - p.x, P.z - p.z) < p.r);
    const high = !!top && P.y > top.h + hills(P.x, P.z) - 1.5;
    if (high && !P.high) text(P.x, P.y + 3, P.z, '고지 점령! 피해 +20%', '#ffe08a', 18, 1.2);
    P.high = high;
    for (const c of chests) {
      if (c.open) continue;
      c.g.rotation.y += dt * 0.6;
      if (Math.hypot(P.x - c.x, P.z - c.z) < 2.2 && Math.abs(P.y - H(c.x, c.z)) < 2) {
        c.open = true; world.remove(c.g); burst(c.x, P.y + 1, c.z, '#ffd76a', 60, 10, 0.8);
        banner('고원의 보물!', '깨달음 +1 · 체력 회복 · 은자'); P.hp = P.maxHp; addGold(25); sfx('chest'); queue(() => levelUp('고원의 보물'));
      }
    }
    P.inv = Math.max(0, P.inv - dt);
    if (P.regen) P.hp = Math.min(P.maxHp, P.hp + P.regen * dt);
    P.ult = Math.min(100, P.ult + dt * 0.8 * P.ultGain * (P.arc.has('ghostgate') ? 2 : 1));
    P.bob += dt * (il > 0.1 && !P.air ? 12 : 0);
    const bob = !P.air && il > 0.1 ? Math.abs(Math.sin(P.bob)) * 0.16 : 0;
    placeActor(P.actor, P.x, P.y, P.z, g, mx, mz, il, dt, P.speed / 6.2);
    P.actor.ch.obj.visible = !(P.inv > 0.3 && (time * 20) % 2 < 1);
    if (P.atkCd > 0) P.atkCd -= dt;

    updateCrowds(dt);
    const wdt = dt * (P.buffs.focus > 0 ? 1.43 : 1) * (P.buffs.dizzy > 0 ? 0.77 : 1);
    for (const [id, w] of Object.entries(P.weapons)) WEAPONS[id].update(w, wdt);
    ARTS.update(dt);
    updateEvents(dt);
    FXS.update(dt);
    for (const s of shots) {
      s.x += s.vx * dt; s.y += s.vy * dt; s.z += s.vz * dt; s.life -= dt;
      s.m.position.set(s.x, s.y, s.z);
      if (s.y < H(s.x, s.z) - 0.3) s.life = 0;
      for (const e of enemies) {
        if (e.dead || s.hit.has(e)) continue;
        if (Math.hypot(e.x - s.x, e.z - s.z) < e.r + s.r && Math.abs(e.y + e.h * 0.4 - s.y) < e.h * 0.6 + 0.8) {
          s.hit.add(e); const sp = Math.hypot(s.vx, s.vz) || 1; hurt(e, s.dmg, (s.vx / sp) * 5, (s.vz / sp) * 5);
          burst(s.x, s.y, s.z, s.color, 3, 4, 0.2);
          if (--s.pierce <= 0) { s.life = 0; break; }
        }
      }
      if (s.life <= 0) scene.remove(s.m);
    }
    shots = shots.filter((s) => s.life > 0);

    // spawning: denser over the chapter, a surrounding wave at 2:30, elites, the boss at 5:00
    spawnT -= dt;
    const cap = IS_TOUCH ? (lowFx ? 80 : 100) : 170;
    if (spawnT <= 0 && !boss && !clearing) {
      spawnT = Math.max(0.2, 0.75 - stageTime / 320);
      const n = Math.round((2 + Math.floor(stageTime / 50) + si) * diff.spawn * (1 + P.curse));
      for (let i = 0; i < n && enemies.length < cap; i++) spawn(pickEnemy());
      if (stageTime > 30 && Math.random() < (0.012 + si * 0.004) * (diff.elite / 1.3) * (1 + P.curse)) spawn(pickEnemy(), { elite: true });
    }
    if (!waveDone && stageTime > 150) {
      waveDone = true; banner('포위당했다!', '사방에서 몰려온다');
      const k = pickEnemy();
      for (let i = 0; i < 36 && enemies.length < cap + 40; i++) spawn(k, { a: (i / 36) * Math.PI * 2, d: 26 });
    }
    if (!bossOut && stageTime > STAGE_LEN) {
      bossOut = true;
      boss = spawn(STAGES[si].boss, { d: 24 });
      if (boss) { banner(`${boss.T.name} 출현`, STAGES[si].name); $('boss').style.display = 'block'; $('bossName').textContent = boss.T.name; impact(0.08); sfx('boss'); SND.buzz([60, 40, 60]); }
      else bossOut = false;
    }
    for (const e of enemies) {
      if (e.dead) continue;
      let dx = P.x - e.x, dz = P.z - e.z; const d = Math.hypot(dx, dz) || 1; dx /= d; dz /= d;
      if (e.T.prop) { if (d > 60) { e.dead = true; dropActor(e.a); } else placeActor(e.a, e.x, e.y = H(e.x, e.z), e.z, e.y, 0, 0, 0, dt); continue; }
      if (e.flee && (e.escapeT -= dt) <= 0) { e.dead = true; FXS.explode(e.x, e.y, e.z, 1.5, '#ffd76a', { scorch: false }); dropActor(e.a); text(e.x, e.y + 3, e.z, '도망쳤다…', '#ffd76a', 20, 1, true); continue; }
      if (d > 70 && !e.T.boss && !e.flee) { const a = rand(0, 6.28); e.x = P.x + Math.cos(a) * 38; e.z = P.z + Math.sin(a) * 38; continue; }
      let spd = e.spd;
      e.cd -= dt;
      if (e.flee) { dx = -dx; dz = -dz; if (d > 12) spd *= 0.5; }
      if (e.march) { if ((e.march.t -= dt) > 0) { dx = e.march.dx; dz = e.march.dz; spd = 6; } else e.march = null; }
      if (P.freeze > 0 && !e.T.boss) spd = 0;
      if (e.chill > 0) { e.chill -= dt; spd *= 0.5; }
      if (e.slowT > 0) { e.slowT -= dt; spd *= e.slowK ?? 1; if (e.slowT <= 0) e.slowK = 1; }
      if (P.chillAura && d < P.chillAura) spd *= 0.6;
      if (e.stun > 0) { e.stun -= dt; spd = 0; }
      else if (e.T.ai === 'ranged') {
        if (d < 9) spd *= -0.6; else if (d < 14) spd = 0;
        if (e.cd <= 0 && d < 22) { e.cd = rand(2.2, 3.2); enemyShoot(e, e.T.key === 'archer' ? '#e8d8a0' : e.T.key === 'poisoner' ? '#7ae05a' : '#ff5a8a'); }
      } else if (e.T.ai === 'charger') {
        if (e.dash > 0) { e.dash -= dt; spd *= 3.2; dx = e.dx; dz = e.dz; }
        else if (e.wind > 0) { e.wind -= dt; spd = 0; e.a.ch.setLook('wind'); if (e.wind <= 0) { e.dash = 0.6; e.dx = dx; e.dz = dz; e.a.ch.setLook(e.elite ? 'elite' : 'normal'); actorAnim(e.a, 'slash', 1.4); } }
        else if (e.cd <= 0 && d < 12) { e.cd = rand(3, 4.5); e.wind = 0.5; }
      }
      if (e.T.hop) spd *= 0.4 + 1.2 * Math.max(0, Math.sin(time * 5 + e.phase));
      if (e.T.boss) {
        if (e.cd <= 0) { e.cd = Math.max(2.2, 5 - si * 0.6 - (diff.heat >= 7 ? 0.6 : 0)); bossAttack(e); }
        if (e.slamAt && (e.slamAt.t -= dt) <= 0) {
          const s = e.slamAt; e.slamAt = null;
          FXS.explode(s.x, H(s.x, s.z), s.z, s.R, '#ff6a50'); sfx('boom'); FXS.ground(s.x, H(s.x, s.z), s.z, { tex: 'crack', color: '#ff5030', size: s.R * 2.2, life: 1.0, fade: 'out' }); shake = Math.max(shake, 0.8);
          if (Math.hypot(P.x - s.x, P.z - s.z) < s.R && P.y - H(P.x, P.z) < 1.2) damagePlayer(e.dmg * 1.4);
          if (Math.random() < 0.6) for (let i = 0; i < 4 + si * 2; i++) spawn(pickEnemy(), { a: rand(0, 6.28), d: rand(6, 10) + 0 });
        }
        if (Math.random() < dt * 0.3) enemyShoot(e, '#ff7a3a');
      }
      const gy = H(e.x, e.z);
      moveXZ(e, dx * spd * dt + e.kx * dt, dz * spd * dt + e.kz * dt, e.T.fly ? gy + 50 : e.y, e.r * 0.8);
      e.kx *= 0.86; e.kz *= 0.86;
      const ng = H(e.x, e.z);
      e.y = e.T.fly ? Math.max(e.y + (ng + e.T.fly + Math.sin(time * 3 + e.phase) * 0.4 - e.y) * dt * 3, ng + 0.3) : ng + (e.T.hop ? Math.max(0, Math.sin(time * 5 + e.phase)) * 0.6 : 0);
      const wasFlash = e.flash > 0;
      e.flash = Math.max(0, e.flash - dt);
      if (wasFlash !== e.flash > 0) e.a.ch.flash(e.flash > 0);
      // far foes animate at half rate to save time on phones
      const far = d > 30 && (Math.floor(time * 60) + e.phase * 10) % 2 < 1;
      placeActor(e.a, e.x, e.y, e.z, ng, spd >= 0 ? dx : -dx, spd >= 0 ? dz : -dz, Math.min(1, Math.abs(spd) / 2), far ? 0 : dt * (IS_TOUCH && d > 30 ? 2 : 1), Math.max(0.6, Math.abs(spd) / 3.2));
      if (e.dmg > 0 && P.inv <= 0 && d < e.r + 0.6 && Math.abs(P.y - e.y) < e.h * 0.6 + 0.4 && !(P.air && P.y > e.y + e.h * 0.7)) { damagePlayer(e.dmg); actorAnim(e.a, e.T.boss ? 'slash' : 'punch', 1.3); }
    }
    // separation (grid-free, but only nearby pairs)
    for (let i = 0; i < enemies.length; i++) {
      const a = enemies[i]; if (a.dead) continue;
      for (let j = i + 1; j < enemies.length; j++) {
        const b = enemies[j]; if (b.dead) continue;
        const dx = a.x - b.x, dz = a.z - b.z, m = a.r + b.r; if (Math.abs(dx) > m || Math.abs(dz) > m) continue;
        const d = Math.hypot(dx, dz); if (d < m && d > 1e-3) { const p = (m - d) * 0.25, wa = a.T.boss || a.T.prop ? 0 : 1, wb = b.T.boss || b.T.prop ? 0 : 1; a.x += (dx / d) * p * wa; a.z += (dz / d) * p * wa; b.x -= (dx / d) * p * wb; b.z -= (dz / d) * p * wb; }
      }
    }
    enemies = enemies.filter((e) => !e.dead);
    for (const c of corpses) { c.t -= dt; c.a.ch.update(dt); c.a.ch.obj.rotation.x = -Math.min(1.45, (1.1 - c.t) * 5); if (c.t < 0.3) c.a.ch.obj.position.y = c.y - (0.3 - c.t) * 2; }
    while (corpses.length && corpses[0].t <= 0) dropActor(corpses.shift().a);
    for (const s of eshots) {
      s.x += s.vx * dt; s.z += s.vz * dt; s.life -= dt; s.m.position.set(s.x, s.y, s.z);
      if (P.inv <= 0 && Math.hypot(P.x - s.x, P.z - s.z) < 0.8 && Math.abs(chest() - 0.5 - s.y) < 1.2) { damagePlayer(s.dmg); s.life = 0; }
      if (s.y < H(s.x, s.z)) s.life = 0;
      if (s.life <= 0) scene.remove(s.m);
    }
    eshots = eshots.filter((s) => s.life > 0);
    // pickups
    for (const o of orbs) {
      const d = Math.hypot(P.x - o.x, P.z - o.z);
      if (d < P.magnet || o.pull) { o.pull = true; const k = Math.min(1, dt * 14 / Math.max(d, 0.5)) * 1.6; o.x += (P.x - o.x) * k; o.z += (P.z - o.z) * k; o.y += (chest() - 0.3 - o.y) * k; }
      o.m.position.set(o.x, o.y + Math.sin(time * 4 + o.x) * 0.15, o.z); o.m.rotation.y += dt * 3;
      if (d < 1.2) {
        o.got = true; scene.remove(o.m); gainXp(o.v);
        coinChain = time - coinAt < 0.4 ? coinChain + 1 : 0; coinAt = time; sfx('coin', coinChain);
        if (P.arc.has('diamond')) { P.hp = Math.min(P.maxHp, P.hp + 0.4); P.inv = Math.max(P.inv, 0.12); }
      }
    }
    orbs = orbs.filter((o) => !o.got);
    if (orbs.length > 260) { const old = orbs.splice(0, 60); let v = 0; for (const o of old) { v += o.v; scene.remove(o.m); } const o = orbs[0]; if (o) o.v += v; }
    // effects & particles
    for (const f of fxs) {
      f.life -= dt;
      f.tick(f, clamp(1 - f.life / f.max, 0, 1), dt);
      if (f.life <= 0) { scene.remove(f.obj); f.obj.traverse((o) => { if (o.geometry && o.geometry !== qiGeo && o.geometry !== bladeGeo && o.geometry !== needleGeo) o.geometry.dispose(); if (o.material && o.material.userData.base !== undefined) o.material.dispose(); }); }
    }
    fxs = fxs.filter((f) => f.life > 0);
    let n = 0;
    for (const p of parts) {
      p.life -= dt; if (p.life <= 0) continue;
      p.vy -= p.grav * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
      const k = p.life / p.max;
      pPos[n * 3] = p.x; pPos[n * 3 + 1] = p.y; pPos[n * 3 + 2] = p.z;
      pCol[n * 3] = p.r * k; pCol[n * 3 + 1] = p.g * k; pCol[n * 3 + 2] = p.b * k; n++;
    }
    for (let i = parts.length - 1; i >= 0; i--) if (parts[i].life <= 0) parts.splice(i, 1);
    pGeo.setDrawRange(0, n); pGeo.attributes.position.needsUpdate = true; pGeo.attributes.color.needsUpdate = true;
    if (bannerT > 0 && (bannerT -= dt) <= 0) $('banner').style.opacity = 0;
  }
  function damagePlayer(d) {
    if (P.inv > 0 || !running) return;
    if (P.dodge && Math.random() < P.dodge) { P.inv = 0.25; text(P.x, P.y + 3, P.z, '흘림!', '#f0b050', 18, 0.6); return; }
    d *= P.armor * (P.buffs.guard > 0 ? 0.5 : 1);
    P.hp -= d; P.inv = 0.6; if (M.settings.shake) shake = Math.max(shake, 0.3);
    burst(P.x, chest(), P.z, '#ff4a4a', 12, 6, 0.4);
    text(P.x, P.y + 3, P.z, '-' + Math.round(d), '#ff6060', 18, 0.7);
    sfx('hurt'); SND.buzz(30);
    if (P.hp > 0) return;
    if (P.revives > 0) {
      // phoenix rebirth: full heal and a ring of fire
      P.revives--; P.hp = P.maxHp; P.inv = 2;
      FXS.pillar(P.x, H(P.x, P.z), P.z, '#ff7828', 20, 2.2, 0.8); FXS.explode(P.x, H(P.x, P.z), P.z, 9, '#ff7828');
      inRadius(P.x, P.z, 9, (e) => hurt(e, 200 + P.lv * 20, (e.x - P.x) * 3, (e.z - P.z) * 3, { color: '#ff7828' }));
      banner('불사조 강림', '다시 일어섰다'); return;
    }
    if (P.halfRevives > 0) {
      P.halfRevives--; P.hp = P.maxHp / 2; P.inv = 2.5;
      FXS.pillar(P.x, H(P.x, P.z), P.z, '#ffd0f0', 18, 2, 0.8); FXS.shockwave(P.x, P.y, P.z, 8, '#ffd0f0');
      banner('환생!', '한 번 더 일어섰다'); sfx('shrine'); return;
    }
    const cost = 150 * (si + 1);
    if (!P.paidRevive && M.progress.gold >= cost) {
      P.hp = 1; P.inv = 99;
      queue(() => showChoice('쓰러지기 직전…', `은자를 바치면 한 번 되살아날 수 있어요 (보유 ${M.progress.gold}냥)`, [
        { icon: '🐉', cls: 'evo', title: `은자 ${cost}냥으로 부활`, desc: 'HP 전부 회복 · 주변 적을 날려버리고 3초 무적', pick: () => {
          M.progress.gold -= cost; M.saveProgress(); P.paidRevive = true; P.hp = P.maxHp; P.inv = 3; impact(0.12);
          FXS.explode(P.x, H(P.x, P.z), P.z, 12, '#ffd76a'); inRadius(P.x, P.z, 13, (e) => hurt(e, 200 + P.lv * 15, (e.x - P.x) * 4, (e.z - P.z) * 4, { color: '#ffd76a' }));
          banner('기사회생!', '은자를 바쳐 다시 일어섰어요');
        } },
        { icon: '💀', title: '포기한다', desc: '이번 판을 여기서 끝내요', pick: () => gameOver('dead') },
      ]), true);
      return;
    }
    gameOver('dead');
  }
  function gameOver(kind = 'dead') {
    if (!running) return;
    running = false; modal = false; modalQ.length = 0;
    const win = kind === 'win';
    if (kind === 'dead') { sfx('death'); SND.buzz([80, 60, 160]); actorAnim(P.actor, 'die'); }
    if (win) addGold(100);
    bankGold();
    const r = runSummary();
    const quests = M.checkQuests(r, HEROES);
    const mx = M.gainMastery(r), fame = M.gainFame(r), sc = M.recordScore(r, diff, daily);
    if (!M.progress.played.includes(heroKey())) { M.progress.played.push(heroKey()); M.saveProgress(); }
    M.checkAchievements(runSummary(), onAchv);
    const h = HEROES[heroIdx];
    $('overTitle').textContent = win ? '강호 평정!' : kind === 'retire' ? '무사 귀환' : '쓰러졌다…';
    $('overTxt').innerHTML = `[${diff.name}] ${h.name} · ${M.REALMS[P.realm].name} ${M.rankOf(h, P.realm)} · Lv ${P.lv}<br>${STAGES[si].name.split(' · ')[0]}까지 · ${fmt(time)} · 처치 ${kills} · 최대 ${P.maxCombo}연격`;
    $('overScore').innerHTML = `<div class="score"><b>${sc.score}</b>점 · <span class="rank">${sc.rank}</span>${sc.best ? ' <i>최고 기록!</i>' : ''}</div>
      <div class="gains">은자 +${banked}냥 · 명성 +${fame} · 숙련 +${mx.xp}${mx.after > mx.before ? ` (숙련 Lv.${mx.after}! ${M.MASTERY_PERKS[mx.after - 1]})` : ''}</div>
      ${quests.map((q) => `<div class="gains">📜 의뢰 완료: ${q.text} · 은자 +${q.reward}</div>`).join('')}
      ${sc.unlocked ? `<div class="gains hot">🔥 업화 ${sc.unlocked}단계가 열렸어요</div>` : ''}`;
    $('pause').classList.remove('on'); $('levelup').classList.remove('on');
    setTimeout(() => $('over').classList.add('on'), kind === 'dead' ? 900 : 200);
  }
  const fmt = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
  function togglePause(v) {
    if (!running) return;
    if (modal && !paused) return;
    paused = v ?? !paused;
    $('pause').classList.toggle('on', paused);
  }

  // ---------- 카메라 & HUD ----------
  const proj = new THREE.Vector3();
  function updateCamera(dt) {
    const fixed = camMode === 'fixed';
    const far = (camera.aspect < 1 ? 1.3 : 1) * camZoom, dist = (fixed ? 12.5 : 10.5) * far, ht = (fixed ? 11 : 5.8) * far;
    camPos.set(P.x - fwdX * dist, P.y + ht, P.z - fwdZ * dist);
    const cg = H(camPos.x, camPos.z) + 1.5; if (camPos.y < cg) camPos.y = cg;
    camera.position.lerp(camPos, 1 - Math.exp(-dt * 8));
    if (shake > 0) { camera.position.x += rand(-1, 1) * shake * 0.4; camera.position.y += rand(-1, 1) * shake * 0.4; shake = Math.max(0, shake - dt * 3); }
    camLook.set(P.x + fwdX * (fixed ? 1.5 : 4), P.y + (fixed ? 0.8 : 1.8), P.z + fwdZ * (fixed ? 1.5 : 4));
    camera.lookAt(camLook);
    world.userData.dome.position.set(camera.position.x, 0, camera.position.z);
    sun.position.set(P.x + 40, P.y + 60, P.z + 20); sun.target.position.set(P.x, P.y, P.z);
    rim.position.set(P.x + fwdX * 40, P.y + 25, P.z + fwdZ * 40); rim.target.position.set(P.x, P.y, P.z);
  }
  function drawOverlay(dt) {
    g2.clearRect(0, 0, fx2d.width, fx2d.height);
    g2.textAlign = 'center'; g2.lineJoin = 'round';
    for (const t of texts) {
      t.life -= dt;
      if (t.life <= 0) continue;
      const age = t.max - t.life;
      proj.set(t.x, t.y + age * 1.4, t.z).project(camera);
      if (proj.z > 1) continue;
      const sx = (proj.x * 0.5 + 0.5) * fx2d.width, sy = (-proj.y * 0.5 + 0.5) * fx2d.height;
      const pop = age < 0.1 ? 1 + (0.1 - age) * (t.big ? 8 : 4) : 1;
      g2.globalAlpha = clamp(t.life / 0.3, 0, 1);
      g2.font = `${t.big ? 900 : 700} ${Math.round(t.size * pop)}px "Noto Sans KR", sans-serif`;
      g2.lineWidth = t.big ? 7 : 4; g2.strokeStyle = '#1a1018';
      g2.save(); g2.translate(sx, sy); if (t.big) g2.rotate(t.jx * 0.3);
      g2.strokeText(t.s, 0, 0); g2.fillStyle = t.color; g2.fillText(t.s, 0, 0);
      g2.restore();
    }
    texts = texts.filter((t) => t.life > 0);
    g2.globalAlpha = 1;
    // elite / boss health bars over their heads
    g2.font = '700 12px "Noto Sans KR", sans-serif'; g2.lineWidth = 3; g2.strokeStyle = '#1a1018';
    for (const e of enemies) {
      if (!e.elite && !e.T.boss && !e.T.duelist && !e.T.gold) continue;
      proj.set(e.x, e.y + e.h * 1.02, e.z).project(camera);
      if (proj.z > 1) continue;
      const sx = (proj.x * 0.5 + 0.5) * fx2d.width, sy = (-proj.y * 0.5 + 0.5) * fx2d.height, w = e.T.boss || e.T.duelist ? 90 : 46;
      g2.fillStyle = 'rgba(0,0,0,.6)'; g2.fillRect(sx - w / 2, sy, w, 5);
      g2.fillStyle = e.T.boss ? '#ff4d4d' : e.T.gold ? '#ffe070' : e.T.duelist ? '#7fd0ff' : '#ffcf5a'; g2.fillRect(sx - w / 2, sy, w * clamp(e.hp / e.max, 0, 1), 5);
      const label = e.title || (e.T.gold ? `황금 도깨비 ${Math.ceil(e.escapeT)}` : e.affix ? `정예 · ${M.AFFIX[e.affix].name}` : '');
      if (label) { g2.fillStyle = e.affix && !e.title ? M.AFFIX[e.affix].color : '#ffe9a0'; g2.strokeText(label, sx, sy - 4); g2.fillText(label, sx, sy - 4); }
    }
    const marks = [...shrines.map((x) => [x, x.buff.name, x.buff.color]), ...altars.map((x) => [x, `천운 제단 · ${P.altarCost}냥`, '#ffb040']), ...oddities.map((x) => [x, x.kind === 'duel' ? '비무' : x.kind === 'sanctum' ? '이끼 낀 비석' : '기연', '#d8c0ff'])];
    for (const [m, label, col] of marks) {
      proj.set(m.x, H(m.x, m.z) + 4.6, m.z).project(camera);
      const on = proj.z < 1 && Math.abs(proj.x) < 0.95 && Math.abs(proj.y) < 0.95;
      if (on) { const sx = (proj.x * 0.5 + 0.5) * fx2d.width, sy = (-proj.y * 0.5 + 0.5) * fx2d.height; g2.fillStyle = col; g2.strokeText(label, sx, sy); g2.fillText(label, sx, sy); continue; }
      let ax = proj.x, ay = proj.y; if (proj.z > 1) { ax = -ax; ay = -ay; }
      const k = Math.max(Math.abs(ax), Math.abs(ay)) || 1; ax /= k; ay /= k;
      const sx = (ax * 0.44 + 0.5) * fx2d.width, sy = (-ay * 0.42 + 0.5) * fx2d.height;
      g2.save(); g2.translate(sx, sy); g2.rotate(Math.atan2(-ay, ax)); g2.globalAlpha = 0.8;
      g2.fillStyle = col; g2.beginPath(); g2.moveTo(10, 0); g2.lineTo(-5, -6); g2.lineTo(-5, 6); g2.closePath(); g2.fill();
      g2.restore();
    }
    // arrows to unopened mesa chests
    for (const c of chests.filter((q) => !q.open).sort((a, b) => Math.hypot(a.x - P.x, a.z - P.z) - Math.hypot(b.x - P.x, b.z - P.z)).slice(0, 2)) {
      proj.set(c.x, H(c.x, c.z) + 2, c.z).project(camera);
      const on = proj.z < 1 && Math.abs(proj.x) < 0.95 && Math.abs(proj.y) < 0.95;
      if (on) continue;
      let ax = proj.x, ay = proj.y; if (proj.z > 1) { ax = -ax; ay = -ay; }
      const m = Math.max(Math.abs(ax), Math.abs(ay)) || 1; ax /= m; ay /= m;
      const sx = (ax * 0.46 + 0.5) * fx2d.width, sy = (-ay * 0.44 + 0.5) * fx2d.height;
      g2.save(); g2.translate(sx, sy); g2.rotate(Math.atan2(-ay, ax));
      g2.fillStyle = 'rgba(255, 215, 110, .85)'; g2.beginPath(); g2.moveTo(12, 0); g2.lineTo(-6, -7); g2.lineTo(-6, 7); g2.closePath(); g2.fill();
      g2.restore();
    }
  }
  // DOM writes only when a value changes (layout work adds up on phones)
  const hudCache = {};
  const setT = (id, v) => { if (hudCache[id] !== v) { hudCache[id] = v; $(id).textContent = v; } };
  const setW = (id, v) => { v = Math.round(v * 200) / 2; if (hudCache[id] !== v) { hudCache[id] = v; $(id).firstElementChild.style.width = v + '%'; } };
  function hud() {
    setW('xpbar', P.xp / P.next); setW('hpbar', Math.max(0, P.hp / P.maxHp)); setW('ultbar', P.ult / 100);
    const ready = P.ult >= 100; if (hudCache.ult !== ready) { hudCache.ult = ready; $('ultBtn').classList.toggle('ready', ready); }
    setT('lv', 'Lv ' + P.lv);
    setT('time', boss ? '두목전' : fmt(Math.max(0, STAGE_LEN - stageTime)));
    setT('kills', '처치 ' + kills);
    setT('gold', `은자 ${Math.floor(P.gold - banked)}`);
    setT('stage', `${STAGES[si].name} · ${M.REALMS[P.realm].name} ${M.rankOf(HEROES[heroIdx], P.realm)}${P.high ? ' · 고지 점령' : ''}`);
    setT('combo', P.combo >= 10 ? `${P.combo}연격` : '');
    const bk = Object.keys(P.buffs).map((k) => `${k}${Math.ceil(P.buffs[k])}`).join(',');
    if (hudCache.buffs !== bk) { hudCache.buffs = bk; $('buffs').innerHTML = Object.entries(P.buffs).map(([k, t]) => { const B = M.SHRINE_BUFFS.find((x) => x.id === k); return `<span>${M.icon(B ? B.icon : { weak: '💀', dizzy: '🌀', drunk: '🍶' }[k] || '✨')}${Math.ceil(t)}</span>`; }).join(''); }
    if (boss) { const v = Math.round(clamp(boss.hp / boss.max, 0, 1) * 200) / 2; if (hudCache.boss !== v) { hudCache.boss = v; $('boss').querySelector('i').style.width = v + '%'; } }
  }

  // ---------- 시작 ----------
  const heroesEl = $('heroes');
  let diffId = M.progress.difficulty || 'normal', heatSel = 0;
  function selectHero(i) {
    const h = HEROES[i];
    if (!M.heroUnlocked(h.key)) {
      const ac = M.ACHV_BY_ID[M.HERO_UNLOCK[h.key]];
      $('heroInfo').innerHTML = `🔒 <b>???</b> — 해금 조건: ${ac.secret ? `??? (${ac.hint})` : `업적 「${ac.name}」 (${ac.desc})`}`;
      return;
    }
    heroIdx = i;
    heroesEl.querySelectorAll('.hero').forEach((x, k) => x.classList.toggle('sel', k === i));
    const ml = M.masteryLevel(h.key);
    $('heroInfo').innerHTML = `<b>${h.name}</b> · ${h.role}${h.sect ? ` [${h.sect === 'all' ? '모든 문파' : SECTS[h.sect]}]` : ''} · 숙련 Lv.${ml} — 시작 무공: <b>${[h.weapon, h.extra].filter(Boolean).map((k) => WEAPONS[k].name).join('·')}</b><br><span style="opacity:.75">${h.trait}</span>`;
  }
  function buildHeroes() {
    heroesEl.innerHTML = '';
    HEROES.forEach(({ key: k, name: n }, i) => {
      const open = M.heroUnlocked(k);
      const b = document.createElement('button'); b.className = 'hero' + (open ? '' : ' locked') + (i === heroIdx ? ' sel' : '');
      b.innerHTML = `<img src="${A(`${k}.png`)}" alt=""><div>${open ? n : '🔒 ???'}</div>`;
      b.onclick = () => { selectHero(i); SND.ensure(); sfx('select'); };
      heroesEl.appendChild(b);
    });
  }
  function buildDiff() {
    $('diffs').innerHTML = M.DIFFICULTIES.map((d) => `<button class="btn chip${d.id === diffId ? ' sel' : ''}" data-d="${d.id}" title="${d.desc}">${M.icon(d.icon)} ${d.name}${M.progress.clears[d.id] ? ' ✓' : ''}</button>`).join('');
    $('diffs').querySelectorAll('[data-d]').forEach((b) => (b.onclick = () => { diffId = b.dataset.d; M.progress.difficulty = diffId; M.saveProgress(); buildDiff(); }));
    const maxH = M.progress.heat || 0;
    heatSel = Math.min(heatSel, maxH);
    $('heat').innerHTML = maxH ? `<button class="btn chip" id="heatDn">−</button><span>🔥 업화 ${heatSel}</span><button class="btn chip" id="heatUp">+</button>` : '';
    if (maxH) { $('heatDn').onclick = () => { heatSel = Math.max(0, heatSel - 1); buildDiff(); }; $('heatUp').onclick = () => { heatSel = Math.min(maxH, heatSel + 1); buildDiff(); }; }
    $('diffDesc').textContent = M.DIFFICULTIES.find((d) => d.id === diffId).desc + (heatSel ? ` · ${M.heatDesc(heatSel)}` : '');
    $('purse').textContent = `은자 ${M.progress.gold}냥 · 명성 ${M.progress.fame || 0} · 최고 ${M.progress.bestScore || 0}점${M.attendPending() ? ' · 출석 보상 대기 중!' : ''}`;
    const di = M.dailyInfo(baseHeroes), dh = HEROES.find((h) => h.key === di.hero);
    $('dailyBtn').innerHTML = `일일 도전 <small>${dh.name} · ${di.mods.map((m) => m.name).join('·')}${M.progress.daily?.date === di.date ? ` · 최고 ${M.progress.daily.best}` : ''}</small>`;
  }
  M.initLobby({ heroes: HEROES, enemies: ENEMIES, evos: () => Object.entries(EVOS).map(([id, E2]) => [id, E2.name, `icons/e_${WEAPONS[id].icon.slice(2)}.png`]), onChange: () => { buildDiff(); buildHeroes(); }, onSettings: () => SND.applySettings() });
  $('gacha').onclick = () => M.gachaAdvance();
  document.querySelectorAll('[data-lobby]').forEach((b) => (b.onclick = () => { SND.ensure(); M.openLobby(b.dataset.lobby); }));
  $('lobbyClose').onclick = () => { $('lobby').classList.remove('on'); buildDiff(); buildHeroes(); };
  // 낙관 easter egg from the 2D title: tap the seal seven times
  let sealTaps = 0;
  $('seal').onclick = () => { if (++sealTaps === 7 && !M.progress.secrets?.seal) { M.progress.secrets = M.progress.secrets || {}; M.progress.secrets.seal = true; M.progress.gold += 300; M.saveProgress(); M.checkAchievements(runSummary(), onAchv); buildDiff(); } };
  buildHeroes(); selectHero(0); M.ensureQuests(HEROES);
  buildWorld(0);
  P = newPlayer();
  buildDiff();
  // load the CC0 character models, then open the gates
  $('go').disabled = true; $('go').textContent = '불러오는 중…'; $('dailyBtn').disabled = true;
  const charsReady = loadBases().then(() => {
    for (const [k, spec] of Object.entries(HERO_KINDS)) defineKind(k, spec);
    for (const [k, spec] of Object.entries(FOE_KINDS)) defineKind(k, spec);
    FXS.warm(renderer, camera);
    $('go').disabled = false; $('go').textContent = '출전'; $('dailyBtn').disabled = false;
  }).catch((err) => { $('go').textContent = '모델을 불러오지 못했어요'; console.error(err); });
  function beginRun(isDaily) {
    SND.ensure(); SND.startMusic(() => running && !paused, () => !!boss);
    $('start').classList.remove('on'); $('lobby').classList.remove('on'); document.body.classList.add('playing');
    daily = isDaily ? M.dailyInfo(baseHeroes) : null;
    if (daily) heroIdx = HEROES.findIndex((h) => h.key === daily.hero);
    diff = daily ? { ...M.makeDiff('hard', 0), name: '일일 도전' } : M.makeDiff(diffId, heatSel);
    P.actor = makeActor(heroKey(), 1);
    P.y = H(0, 0); running = true;
    const hd = HEROES[heroIdx];
    P.maxHp = P.hp = hd.hp; P.speed = hd.speed; hd.setup(P);
    M.applyMeta(P, hd.key);
    M.applyHeatToPlayer(P, diff.heat || 0);
    if (daily) for (const m of daily.mods) m.run(P, diff);
    const lv = (P.startLevel || 1) + (P.startBonus || 0);
    for (let i = 0; i < Math.min(lv, WEAPONS[hd.weapon].max); i++) grant(hd.weapon);
    if (hd.extra) grant(hd.extra);
    $('portrait').src = A(`${heroKey()}.png`);
    $('meName').textContent = `${hd.name} · ${hd.role}`;
    camera.position.set(0, P.y + 15, 17);
    resetStageEvents();
    banner(daily ? '일일 도전' : STAGES[0].name, daily ? daily.mods.map((m) => m.name).join(' · ') : `[${diff.name}] ${STAGES[0].sub}`);
    sfx('gong');
    queue(arcanaChoice);
  }
  $('go').onclick = () => beginRun(false);
  $('dailyBtn').onclick = () => beginRun(true);
  $('retire').onclick = () => { paused = false; $('pause').classList.remove('on'); gameOver('retire'); };
  window.__dbg = {
    get P() { return P; }, get enemies() { return enemies; }, get pickups() { return pickups; }, M, WEAPONS, EVOS, grant, start: () => $('go').click(), daily: () => $('dailyBtn').click(), gameOver: (k) => gameOver(k), damage: (d) => damagePlayer(d), killBoss: () => { const b2 = enemies.find((e) => e.T.boss); if (b2) kill(b2); return !!b2; }, drop: (k, v) => dropPickup(k, P.x + 0.5, P.z, v), get modalQ() { return modalQ; }, get modal() { return modal; },
    perf(n) { const t0 = performance.now(); for (let i = 0; i < n; i++) { sparkBudget = 6; update(1 / 60); updateCamera(1 / 60); } const t1 = performance.now(); renderer.info.reset(); renderer.render(scene, camera); return { msPerUpdate: +((t1 - t0) / n).toFixed(2), calls: renderer.info.render.calls, tris: renderer.info.render.triangles, enemies: enemies.length, fx: FXS.count() }; },
    programs() { return renderer.info.programs.length; },
    perfStep() { sparkBudget = 6; update(1 / 60); updateCamera(1 / 60); },
    swarm(n) { for (let i = 0; i < n; i++) spawn(pickEnemy(), { d: 8 + (i % 20) }); },
    setStageTime: (t) => (stageTime = t), evolveAll: () => { for (const [id, w] of Object.entries(P.weapons)) if (EVOS[id]) { EVOS[id].apply(w); w.evolved = true; } refreshWeps(); },
    step(n) { for (let i = 0; i < n && running; i++) { sparkBudget = 6; if (M.gachaOpen()) { M.gachaAdvance(); M.gachaAdvance(); } if (modal) { const c = $('clear').classList.contains('on') ? $('nextBtn') : document.querySelector('#cards .card'); c?.click(); } else update(1 / 60); } return { t: stageTime, si, kills, lv: P.lv, hp: Math.round(P.hp), n: enemies.length, fx: fxs.length }; },
  };

  let last = performance.now(), idleA = 0, flashOn = false, frameErr = 0;
  function frame(now) {
    requestAnimationFrame(frame);
    let dt = Math.min(0.05, (now - last) / 1000); last = now;
    // the inverted impact frame runs on wall time, so a pause, a card pick or game over can never freeze it on screen
    const fl = flashT > 0 && running && !paused && !modal;
    if (flashT > 0) flashT = running && !paused && !modal ? flashT - dt : 0;
    if (fl !== flashOn) { flashOn = fl; $('flash').style.opacity = fl ? 1 : 0; }
    sparkBudget = lowFx ? 6 : 14;
    if (hitStopT > 0) { hitStopT -= dt; dt *= 0.08; }
    // one bad frame must not stall the whole run: log it and keep going
    if (running && !paused && !modal) { try { update(dt); } catch (err) { console.error(err); if (!frameErr++) M.toast('오류가 나서 한 프레임을 건너뛰었어요', String(err.message || err).slice(0, 60)); } }
    if (running) { updateCamera(dt); hud(); modalWatch(dt); }
    else { idleA += dt * 0.08; camera.position.set(Math.sin(idleA) * 55, 28, Math.cos(idleA) * 55); camera.lookAt(0, 0, 0); world.userData.dome.position.set(camera.position.x, 0, camera.position.z); }
    renderer.info.autoReset = true;
    renderer.render(scene, camera);
    drawOverlay(running && !paused && !modal ? dt : 0);
  }
  requestAnimationFrame(frame);
})();
