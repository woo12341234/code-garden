// 강호난세 3D: the 2D game's heroes, foes, chapters and techniques in a real 3D world (Three.js).
// Rules run on the x/z plane with a height function H(x, z); sprites stand as billboards.
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

  // ---------- 데이터 (2D 판에서 가져옴; 거리 단위: 2D 픽셀 / PX) ----------
  const PX = 23;
  const HEROES = [
    ['cheongpung', '청풍', '검객', 'qi'], ['unhak', '운학', '무당파 도사', 'lightning'], ['yeoubi', '여우비', '구미호', 'orbit'],
    ['cheolsan', '철산', '소림 무승', 'palm'], ['dallae', '달래', '무녀', 'lightning'], ['yawol', '야월', '자객', 'needles'],
    ['songhwa', '송화', '약사', 'heupseong'], ['muyeong', '무영', '검귀', 'geomgang'], ['geumbi', '금비', '부적술사', 'lightning'],
    ['seola', '설아', '북해빙궁 설녀', 'needles'], ['cheonma', '천마', '마교 교주', 'palm'], ['sansin', '산신령', '산의 주인', 'saja'],
    ['baekmae', '백매', '화산파 검수', 'qi'], ['palgeol', '팔걸', '개방 방도', 'cheongeun'], ['dangyu', '당유', '사천당가 암기술사', 'needles'],
    ['namgung', '남궁휘', '남궁세가 소가주', 'eogeom'], ['aemi', '청아', '아미파 여협', 'tanji'], ['gonryun', '설운', '곤륜파 검수', 'geomgang'],
    ['jegal', '제갈연', '제갈세가 군사', 'lightning'], ['dokgo', '독고', '검성', 'eogeom'], ['hyeolrang', '혈랑', '광전사 낭인', 'ihyeong'],
    ['hyeonmu', '현무', '강시술사', 'orbit'], ['jusun', '주선', '취권 고수', 'palm'], ['hwaryeon', '화련', '불사조의 무녀', 'orbit'],
    ['dueok', '두억', '도깨비 왕', 'cheongeun'], ['nameless', '무명', '이름 없는 검객', 'ihyeong'], ['maengju', '무림맹주', '천하제일인', 'eogeom'],
  ];
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
  const renderer = new THREE.WebGLRenderer({ antialias: !IS_TOUCH, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, IS_TOUCH ? 1.5 : 2));
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
  const hemi = new THREE.HemisphereLight('#e8f2ff', '#5a4a36', 1.15); scene.add(hemi);
  const sun = new THREE.DirectionalLight('#fff1d6', 1.6); sun.position.set(60, 90, 30); scene.add(sun); scene.add(sun.target);

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
  function H(x, z) {
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
    // sky + fog
    const SKY = new THREE.Color(pal.fog);
    scene.background = SKY; scene.fog = new THREE.Fog(SKY, 48, 125);
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
    world.add(new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true })));
    const water = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.MeshLambertMaterial({ color: pal.water, transparent: true, opacity: 0.72, emissive: si === 3 ? '#3a0a10' : '#000000' }));
    water.rotation.x = -Math.PI / 2; water.position.y = WATER_Y; world.add(water);
    // props
    const M = {
      trunk: lam('#6b4a32'), leaf: lam('#3f6e3c'), leaf2: lam('#557f3d'), rock: lam(si === 3 ? '#4a4050' : '#8d877c'), bamboo: lam('#7fa24e'),
      wall: lam('#d8cfb8'), roof: lam('#6a5a48'), stone: lam('#9a948a'), fire: new THREE.MeshBasicMaterial({ color: '#ffb050' }), dead: lam('#4a3a34'), grave: lam('#6a6470'),
    };
    const free = (x, z) => H(x, z) > WATER_Y + 0.4 && Math.hypot(x, z) > 10 && !PLATEAUS.some((p) => Math.abs(Math.hypot(x - p.x, z - p.z) - p.r) < 3.5);
    const N = IS_TOUCH ? 200 : 280;
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
      world.add(g);
    }
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

  // ---------- 빌보드 배우 ----------
  function makeActor(key, scale, tint) {
    const mat = new THREE.SpriteMaterial({ map: tex(key), transparent: true, alphaTest: 0.4 });
    if (tint) mat.color.set(tint);
    const sp = new THREE.Sprite(mat); sp.center.set(0.5, 0.1); sp.scale.set(scale, scale, 1);
    const sh = new THREE.Mesh(shadowGeo, shadowMat); sh.scale.setScalar(scale * 0.55); sh.renderOrder = 1;
    scene.add(sp); scene.add(sh);
    return { sp, sh, key, faceL: false, scale };
  }
  function placeActor(a, x, y, z, gy, faceL) {
    a.sp.position.set(x, y, z);
    a.sh.position.set(x, gy + 0.06, z);
    a.sh.scale.setScalar(a.scale * 0.55 * (1 - clamp((y - gy) / 8, 0, 0.7)));
    if (faceL !== a.faceL) { a.faceL = faceL; a.sp.material.map = tex(a.key, faceL); }
  }
  function setActorKey(a, key, scale) { a.key = key; a.sp.material.map = tex(key, a.faceL); if (scale) { a.scale = scale; a.sp.scale.set(scale, scale, 1); } }
  function dropActor(a) { scene.remove(a.sp); scene.remove(a.sh); a.sp.material.dispose(); }

  // ---------- 입력 ----------
  const keys = {};
  let wantJump = false, wantUlt = false, camYaw = 0, camMode = IS_TOUCH ? 'fixed' : 'chase';
  addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (e.code === 'Space') { wantJump = true; e.preventDefault(); }
    if (e.code === 'KeyQ' && !e.repeat) wantUlt = true;
    if (e.code === 'KeyV') toggleCam();
    if (e.code === 'Escape') togglePause();
  });
  addEventListener('keyup', (e) => { keys[e.code] = false; });
  const stick = { id: null, ox: 0, oy: 0, x: 0, y: 0 }, look = { id: null, lx: 0 };
  const stickEl = $('stick'), knob = stickEl.firstElementChild;
  const cv = renderer.domElement;
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
  if (IS_TOUCH) { $('jumpBtn').style.display = 'block'; $('ultBtn').style.display = 'block'; $('hint').textContent = '아무 곳이나 끌어서 이동 · 경공 = 점프(2단) · 필살 = 필살기'; }
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
  let P, enemies = [], shots = [], eshots = [], orbs = [], heals = [], fxs = [], texts = [], parts = [];
  let time = 0, stageTime = 0, si = 0, kills = 0, spawnT = 0, waveDone = false, bossOut = false, boss = null;
  let running = false, paused = false, modal = false, bannerT = 0, shake = 0, flashT = 0;

  const PASSIVES = [
    { id: 'hp', name: '단전호흡', icon: 'heart', desc: '최대 HP +20, 회복 20', max: 5, f: (p) => { p.maxHp += 20; p.hp = Math.min(p.maxHp, p.hp + 20); } },
    { id: 'haste', name: '쾌검', icon: 'hourglass', desc: '모든 무공 대기시간 -8%', max: 5, f: (p) => (p.haste *= 0.92) },
    { id: 'area', name: '기공 확장', icon: 'swirl', desc: '무공 범위 +12%', max: 5, f: (p) => (p.area *= 1.12) },
    { id: 'speed', name: '경공술', icon: 'feather', desc: '이동속도 +8%, 점프력 증가', max: 5, f: (p) => { p.speed *= 1.08; p.jump += 0.8; } },
    { id: 'dmg', name: '내공 심화', icon: 'fist', desc: '모든 피해 +10%', max: 5, f: (p) => (p.dmgMul += 0.1) },
    { id: 'magnet', name: '흡기공', icon: 'magnet', desc: '획득 범위 +30%', max: 4, f: (p) => (p.magnet *= 1.3) },
    { id: 'armor', name: '철포삼', icon: 'shield', desc: '받는 피해 -7%', max: 5, f: (p) => (p.armor *= 0.93) },
    { id: 'regen', name: '회춘공', icon: 'peach', desc: '초당 HP 0.4 회복', max: 5, f: (p) => (p.regen += 0.4) },
    { id: 'extra', name: '분심공', icon: 'clones', desc: '투사체·대상 +1', max: 2, f: (p) => p.extra++ },
    { id: 'crit', name: '혜안', icon: 'target', desc: '치명타 확률 +7%', max: 5, f: (p) => (p.crit += 0.07) },
  ];
  const PASSIVE_BY_ID = Object.fromEntries(PASSIVES.map((p) => [p.id, p]));

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
  function impact(sec = 0.06) { flashT = Math.max(flashT, sec); }

  // ---------- 무공 ----------
  const nearestN = (n, range, x = P.x, z = P.z) => enemies.filter((e) => !e.dead && (e.x - x) ** 2 + (e.z - z) ** 2 < range * range).sort((a, b) => ((a.x - x) ** 2 + (a.z - z) ** 2) - ((b.x - x) ** 2 + (b.z - z) ** 2)).slice(0, n);
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
  const chest = () => P.y + 1.3;
  const qiGeo = new THREE.TorusGeometry(1.1, 0.13, 4, 14, Math.PI * 0.9).rotateZ(Math.PI * 0.55).rotateX(Math.PI / 2);
  const bladeGeo = new THREE.ConeGeometry(0.2, 2.2, 4).rotateZ(-Math.PI / 2);
  const needleGeo = new THREE.ConeGeometry(0.07, 0.9, 4).rotateZ(-Math.PI / 2);
  const WEAPONS = {
    qi: {
      name: '검기', icon: 'w_beam', desc: '가장 가까운 적에게 초승달 검기를 날려요', up: '데미지 +5, 2단계마다 검기 +1', max: 7,
      create: () => ({ dmg: 13, count: 1, pierce: 2, cd: 0.85, t: 0.3, spd: 34 }),
      upgrade(w) { w.dmg += 5; if (w.level % 2 === 1) w.count++; },
      update(w, dt) {
        if ((w.t -= dt) > 0) return;
        const tg = nearest(28); if (!tg) return;
        w.t = w.cd * P.haste;
        const n = w.count + P.extra, col = w.evolved ? '#ffd76a' : '#bfefff';
        for (let i = 0; i < n; i++) {
          const a = Math.atan2(tg.z - P.z, tg.x - P.x) + (i - (n - 1) / 2) * 0.2;
          const m = new THREE.Mesh(qiGeo, addMat(col, 0.95)); m.add(new THREE.Mesh(qiGeo, addMat(w.evolved ? '#ff9a3a' : '#3f8cff', 0.45))); m.children[0].scale.setScalar(1.6);
          if (w.evolved) m.scale.setScalar(1.8);
          const vy = clamp((tg.y + 1 - chest()) / Math.max(1, Math.hypot(tg.x - P.x, tg.z - P.z)), -0.5, 0.5);
          shots.push({ m, x: P.x, y: chest(), z: P.z, vx: Math.cos(a) * w.spd, vy: vy * w.spd, vz: Math.sin(a) * w.spd, life: 0.9, pierce: w.pierce + (w.evolved ? 4 : 0), dmg: w.dmg, r: w.evolved ? 1.8 : 1, hit: new Set(), color: col });
          m.position.set(P.x, chest(), P.z); m.rotation.y = -a; scene.add(m);
        }
      },
    },
    orbit: {
      name: '여우불', icon: 'w_orbit', desc: '몸 주위를 도는 여우불이 적을 태워요', up: '여우불 +1, 데미지 +3', max: 6,
      create: () => ({ dmg: 9, count: 2, dist: 3.4, ang: 0, hits: new Map(), orbs: [] }),
      upgrade(w) { w.count++; w.dmg += 3; },
      update(w, dt) {
        w.ang += dt * 2.6;
        const n = Math.min(12, w.count + P.extra), R = w.dist * Math.sqrt(P.area);
        const col = w.evolved ? '#ff7ab0' : '#6ab8ff';
        while (w.orbs.length < n) { const s = glowSprite(col, 1.6); s.add(glowSprite('#ffffff', 0.5)); scene.add(s); w.orbs.push(s); }
        for (const [e, t] of w.hits) { if (t <= dt) w.hits.delete(e); else w.hits.set(e, t - dt); }
        w.orbs.forEach((s, i) => {
          const a = w.ang + (i / n) * Math.PI * 2, x = P.x + Math.cos(a) * R, z = P.z + Math.sin(a) * R;
          s.position.set(x, chest() + Math.sin(time * 4 + i) * 0.2, z); s.material.color.set(col);
          if (Math.random() < (lowFx ? 0.15 : 0.4)) burst(x, chest(), z, col, 1, 1.2, 0.35, -2);
          inRadius(x, z, 0.8, (e) => { if (w.hits.has(e) || Math.abs(e.y + 1 - chest()) > 3) return; w.hits.set(e, 0.4); hurt(e, w.dmg, Math.cos(a) * 4, Math.sin(a) * 4); });
        });
      },
    },
    lightning: {
      name: '뇌전부', icon: 'w_lightning', desc: '부적이 하늘의 벼락을 적에게 내리꽂아요', up: '벼락 +1, 데미지 +6', max: 7,
      create: () => ({ dmg: 22, count: 2, cd: 1.6, t: 0.8, R: 2.2 }),
      upgrade(w) { w.count++; w.dmg += 6; },
      update(w, dt) {
        if ((w.t -= dt) > 0) return;
        const pool = shuffle(nearestN(14, 24)); if (!pool.length) return;
        w.t = w.cd * P.haste;
        const col = w.evolved ? '#ffe36a' : '#b49cff';
        for (let i = 0; i < Math.min(pool.length, w.count + P.extra); i++) {
          const e = pool[i]; bolt(e.x, e.y, e.z, col);
          inRadius(e.x, e.z, w.R * P.area * (w.evolved ? 1.6 : 1), (o) => hurt(o, w.dmg, 0, 0));
        }
      },
    },
    palm: {
      name: '장풍', icon: 'w_yeorae', desc: '손바닥으로 거센 장풍을 밀어내 앞의 적을 날려요', up: '데미지 +7, 사거리 +0.8', max: 6,
      create: () => ({ dmg: 22, range: 8, cd: 2, t: 0.8 }),
      upgrade(w) { w.dmg += 7; w.range += 0.8; },
      update(w, dt) {
        if ((w.t -= dt) > 0) return;
        const tg = nearest(w.range * P.area + 2); if (!tg) return;
        w.t = w.cd * P.haste;
        const a = Math.atan2(tg.z - P.z, tg.x - P.x), R = w.range * P.area * (w.evolved ? 1.6 : 1), half = 0.75;
        const col = w.evolved ? '#ffb347' : '#ffe2a0';
        sectorSlash(P.x, P.y + 0.6, P.z, a, half, R, col, 0.45, 1);
        for (let k = 0; k < 3; k++) ringWave(P.x + Math.cos(a) * R * 0.3 * (k + 1), P.y, P.z + Math.sin(a) * R * 0.3 * (k + 1), 1.5 + k * 0.8, col, 0.4, 0.3, k * 0.06);
        let n = 0;
        for (const e of enemies) {
          if (e.dead) continue;
          const d = Math.hypot(e.x - P.x, e.z - P.z); if (d > R + e.r) continue;
          let da = Math.atan2(e.z - P.z, e.x - P.x) - a; da = Math.atan2(Math.sin(da), Math.cos(da));
          if (Math.abs(da) > half + 0.2) continue;
          hurt(e, w.dmg, Math.cos(a) * 14, Math.sin(a) * 14); n++;
        }
        if (n >= 4) word('hit', P.x + Math.cos(a) * 3, P.y, P.z + Math.sin(a) * 3, n >= 8);
      },
    },
    needles: {
      name: '만천화우', icon: 'w_needles', desc: '부채꼴로 암기를 흩뿌려요', up: '암기 +2, 데미지 +2', max: 7,
      create: () => ({ dmg: 7, count: 5, cd: 1.1, t: 0.5, spd: 40 }),
      upgrade(w) { w.count += 2; w.dmg += 2; },
      update(w, dt) {
        if ((w.t -= dt) > 0) return;
        const tg = nearest(24); if (!tg) return;
        w.t = w.cd * P.haste;
        const n = w.count + P.extra * 2, base = Math.atan2(tg.z - P.z, tg.x - P.x), col = w.evolved ? '#ffe070' : '#d8f0ff';
        for (let i = 0; i < n; i++) {
          const a = base + (i - (n - 1) / 2) * (1.2 / Math.max(1, n - 1));
          const m = new THREE.Mesh(needleGeo, addMat(col, 1)); m.add(glowSprite(col, 0.7));
          m.position.set(P.x, chest(), P.z); m.rotation.y = -a; scene.add(m);
          shots.push({ m, x: P.x, y: chest(), z: P.z, vx: Math.cos(a) * w.spd, vy: 0, vz: Math.sin(a) * w.spd, life: 0.7, pierce: 1 + (w.evolved ? 2 : 0), dmg: w.dmg, r: 0.6, hit: new Set(), color: col });
        }
      },
    },
    eogeom: {
      name: '어검술', icon: 'w_eogeom', desc: '비검이 몸 주위를 돌다가 때가 되면 적에게 날아가 꿰뚫고 돌아와요', up: '비검 +1, 데미지 +5', max: 7,
      create: () => ({ dmg: 15, count: 3, dist: 2.8, ang: 0, launch: 2.4, t: 1.2, hits: new Map(), swords: [] }),
      upgrade(w) { w.count++; w.dmg += 5; },
      update(w, dt) {
        w.ang += dt * 2.3;
        for (const [e, t] of w.hits) { if (t <= dt) w.hits.delete(e); else w.hits.set(e, t - dt); }
        const n = Math.min(14, w.count + P.extra), R = w.dist * Math.sqrt(P.area);
        const col = w.evolved ? '#ffd76a' : '#9fdcff';
        while (w.swords.length < n) {
          const m = new THREE.Mesh(bladeGeo, new THREE.MeshBasicMaterial({ color: '#e8f6ff' }));
          const halo = new THREE.Mesh(bladeGeo, addMat(col, 0.5)); halo.scale.set(1.3, 2.4, 2.4); m.add(halo);
          const trail = [0, 1, 2].map((k) => { const t = new THREE.Mesh(bladeGeo, fadeMat(addMat(col, 0.35 - k * 0.1))); scene.add(t); return t; });
          scene.add(m); w.swords.push({ m, halo, trail, hist: [], mode: 'orbit', x: P.x, y: chest(), z: P.z, a: 0 });
        }
        w.swords.forEach((s, i) => {
          s.halo.material = addMat(col, 0.5);
          const slot = w.ang + (i / n) * Math.PI * 2, ox = P.x + Math.cos(slot) * R, oz = P.z + Math.sin(slot) * R, oy = chest() + 0.3;
          if (s.mode === 'orbit') {
            s.x = ox; s.y = oy; s.z = oz; s.a = slot + Math.PI / 2;
            inRadius(s.x, s.z, 0.6, (e) => { if (w.hits.has(e)) return; w.hits.set(e, 0.45); hurt(e, w.dmg * 0.5, e.x - P.x, e.z - P.z); });
          } else if (s.mode === 'strike') {
            const e = s.target;
            if (!e || e.dead) { s.mode = 'back'; } else {
              const dx = e.x - s.x, dy = e.y + e.h * 0.4 - s.y, dz = e.z - s.z, d = Math.hypot(dx, dy, dz) || 1, step = 42 * dt;
              s.a = Math.atan2(dz, dx);
              if (d <= step + e.r) {
                hurt(e, w.dmg, dx, dz);
                xcut(e.x, e.y + e.h * 0.4, e.z, s.a, col);
                if (w.evolved) { ringWave(e.x, e.y, e.z, 2.4 * P.area, '#ffcf6a', 0.35); inRadius(e.x, e.z, 2.4 * P.area, (o) => o !== e && hurt(o, w.dmg * 0.6, o.x - e.x, o.z - e.z)); }
                s.mode = 'back';
              } else { s.x += (dx / d) * step; s.y += (dy / d) * step; s.z += (dz / d) * step; }
            }
          } else {
            const dx = ox - s.x, dy = oy - s.y, dz = oz - s.z, d = Math.hypot(dx, dy, dz) || 1, step = 48 * dt;
            s.a = Math.atan2(dz, dx);
            if (d <= step) s.mode = 'orbit'; else { s.x += (dx / d) * step; s.y += (dy / d) * step; s.z += (dz / d) * step; }
          }
          s.hist.unshift([s.x, s.y, s.z, s.a]); if (s.hist.length > 7) s.hist.pop();
          s.m.position.set(s.x, s.y, s.z); s.m.rotation.set(0, -s.a, s.mode === 'orbit' ? 0 : -0.15);
          s.trail.forEach((t, k) => { const h = s.hist[2 + k * 2]; t.visible = !!h && s.mode !== 'orbit'; if (h) { t.position.set(h[0], h[1], h[2]); t.rotation.set(0, -h[3], 0); } });
        });
        if ((w.t -= dt) > 0) return;
        const tg = nearestN(n, 20); if (!tg.length) return;
        w.t = w.launch * P.haste;
        w.swords.forEach((s, i) => { if (s.mode === 'orbit') { s.mode = 'strike'; s.target = tg[i % tg.length]; } });
      },
    },
    saja: {
      name: '사자후', icon: 'w_saja', desc: '내공을 실은 일갈로 주변 적을 날려 보내고 기절시켜요', up: '범위 +0.7, 데미지 +8, 기절 +0.15초', max: 6,
      create: () => ({ dmg: 18, R: 6.5, stun: 1, cd: 5, t: 2 }),
      upgrade(w) { w.R += 0.7; w.dmg += 8; w.stun += 0.15; },
      update(w, dt) {
        if ((w.t -= dt) > 0) return;
        const R = w.R * P.area * (w.evolved ? 1.5 : 1);
        if (!nearest(R * 0.9)) return;
        w.t = w.cd * P.haste;
        const col = w.evolved ? '#ff7a4a' : '#ffd88a';
        for (let k = 0; k < 3; k++) ringWave(P.x, P.y, P.z, R * (1 - k * 0.12), col, 0.5, 0.18, k * 0.08);
        const dome = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), fadeMat(addMat(col, 0.35)));
        dome.position.set(P.x, P.y, P.z);
        addFx(dome, 0.45, (f, k) => { dome.scale.set(R * Math.pow(k, 0.5), R * 0.45 * Math.pow(k, 0.5), R * Math.pow(k, 0.5)); dome.material.opacity = 0.35 * (1 - k); });
        text(P.x, P.y + 3.4, P.z, w.evolved ? '멸(滅)!!' : '갈(喝)!!', col, 38, 0.8, true);
        inRadius(P.x, P.z, R, (e) => { if (!e.T.boss) e.stun = Math.max(e.stun || 0, w.stun * (w.evolved ? 2 : 1)); hurt(e, w.dmg * (w.evolved ? 2 : 1), (e.x - P.x) * 3, (e.z - P.z) * 3); });
        burst(P.x, P.y + 0.3, P.z, '#fff3c8', 26, 12, 0.5);
        shake = Math.max(shake, 0.5);
      },
    },
    tanji: {
      name: '탄지신통', icon: 'w_tanji', desc: '손가락으로 튕긴 지풍이 빛줄기처럼 적 여럿을 꿰뚫어요', up: '데미지 +4, 2단계마다 지풍 +1', max: 7,
      create: () => ({ dmg: 9, count: 1, cd: 0.42, t: 0.4 }),
      upgrade(w) { w.dmg += 4; if (w.level % 2 === 1) w.count++; },
      update(w, dt) {
        if ((w.t -= dt) > 0) return;
        const pool = nearestN(8, 20); if (!pool.length) return;
        w.t = w.cd * P.haste;
        const col = w.evolved ? '#fff0a0' : '#aaf0ff';
        for (let i = 0; i < w.count + P.extra; i++) {
          const t = pool[i % pool.length], a = Math.atan2(t.z - P.z, t.x - P.x) + (i ? rand(-0.05, 0.05) : 0);
          const L = Math.hypot(t.x - P.x, t.z - P.z) + 7, x1 = P.x + Math.cos(a) * L, z1 = P.z + Math.sin(a) * L, y1 = t.y + t.h * 0.4;
          let pierce = 3;
          lineHits(P.x, P.z, x1, z1, 0.35, (e, cx, cz) => { if (pierce-- > 0) { hurt(e, w.dmg, cx * 3, cz * 3); burst(e.x, e.y + e.h * 0.4, e.z, col, 3, 4, 0.25); } });
          beamLine(P.x + Math.cos(a) * 0.6, chest(), P.z + Math.sin(a) * 0.6, x1, y1, z1, col, 0.06, 0.2);
        }
      },
    },
    geomgang: {
      name: '검강', icon: 'w_geomgang', desc: '검에 응축된 강기를 거대한 초승달로 휘둘러 앞을 통째로 베어요', up: '데미지 +10, 반경 +0.7 (4단계부터 왕복)', max: 6,
      create: () => ({ dmg: 32, R: 7.5, cd: 3.2, t: 1 }),
      upgrade(w) { w.dmg += 10; w.R += 0.7; },
      update(w, dt) {
        if (w.second && (w.second.t -= dt) <= 0) { const s = w.second; w.second = null; gangSlash(w, s.a, -1); }
        if ((w.t -= dt) > 0) return;
        const tg = nearest(w.R * P.area * 1.3); if (!tg) return;
        w.t = w.cd * P.haste;
        const a = Math.atan2(tg.z - P.z, tg.x - P.x);
        gangSlash(w, a, 1);
        if (w.level >= 4 || w.evolved) w.second = { t: 0.16, a };
      },
    },
    ihyeong: {
      name: '이형환위', icon: 'w_ihyeong', desc: '보이지 않는 속도로 분신이 튀어나가 적을 관통해 베어요', up: '데미지 +6, 2단계마다 분신 +1', max: 7,
      create: () => ({ dmg: 18, count: 2, cd: 2.6, t: 1.4 }),
      upgrade(w) { w.dmg += 6; if (w.level % 2 === 1) w.count++; },
      update(w, dt) {
        if ((w.t -= dt) > 0) return;
        const pool = nearestN(10, 17); if (!pool.length) return;
        w.t = w.cd * P.haste;
        const col = w.evolved ? '#ffa8f0' : '#b49cff';
        for (let i = 0; i < w.count + P.extra; i++) {
          const t = pool[i % pool.length], a = Math.atan2(t.z - P.z, t.x - P.x) + (i >= pool.length ? (i % 2 ? 0.3 : -0.3) : 0);
          const L = Math.hypot(t.x - P.x, t.z - P.z) + 3, x1 = P.x + Math.cos(a) * L, z1 = P.z + Math.sin(a) * L;
          lineHits(P.x, P.z, x1, z1, 0.9, (e, cx, cz) => { hurt(e, w.dmg, cx * 6, cz * 6); xcut(e.x, e.y + e.h * 0.4, e.z, a + Math.PI / 2, col); });
          phantom(P.x, P.y, P.z, x1, H(x1, z1), z1, col, i * 0.05);
        }
      },
    },
    cheongeun: {
      name: '천근추', icon: 'w_cheongeun', desc: '천 근의 무게로 뛰어올라 땅을 내리찍어 갈라 버려요', up: '데미지 +12, 범위 +0.6', max: 6,
      create: () => ({ dmg: 36, R: 5.5, cd: 4.6, t: 2, after: [] }),
      upgrade(w) { w.dmg += 12; w.R += 0.6; },
      update(w, dt) {
        for (let i = w.after.length - 1; i >= 0; i--) if ((w.after[i].t -= dt) <= 0) { const a = w.after.splice(i, 1)[0]; stomp(w, a.x, a.z, a.R, a.d, a.after); }
        if ((w.t -= dt) > 0) return;
        if (!nearest(w.R * P.area)) return;
        w.t = w.cd * P.haste;
        if (!P.air) { P.vy = 9; P.air = true; P.stomping = true; }
        const R = w.R * P.area * (w.evolved ? 1.4 : 1);
        w.after.push({ t: 0.5, x: P.x, z: P.z, R, d: w.dmg * (w.evolved ? 2.2 : 1), after: false });
        if (w.evolved) for (let k = 1; k <= 2; k++) w.after.push({ t: 0.5 + k * 0.32, x: P.x, z: P.z, R: R * (1 + k * 0.35), d: w.dmg, after: true });
      },
    },
    heupseong: {
      name: '흡성대법', icon: 'w_heupseong', desc: '적의 기운을 빨아들여 피해를 주고 내 체력으로 바꿔요', up: '대상 +1, 데미지 +4', max: 6,
      create: () => ({ dmg: 10, count: 3, cd: 2.8, t: 1.5, heal: 0.6 }),
      upgrade(w) { w.count++; w.dmg += 4; },
      update(w, dt) {
        if ((w.t -= dt) > 0) return;
        const pool = nearestN(w.count + P.extra, 13); if (!pool.length) return;
        w.t = w.cd * P.haste;
        const col = w.evolved ? '#ff5090' : '#c070ff';
        for (const e of pool) { hurt(e, w.dmg, (P.x - e.x) * 0.6, (P.z - e.z) * 0.6); drain(e, col); }
        P.hp = Math.min(P.maxHp, P.hp + Math.min(6, pool.length * w.heal));
        const v = glowSprite(col, 4); v.position.set(P.x, chest(), P.z);
        addFx(v, 0.6, (f, k) => { v.position.set(P.x, chest(), P.z); v.material.opacity = 1 - k; v.scale.setScalar(4 + k * 2); });
      },
    },
  };
  const EVOS = {
    qi: { passive: 'crit', name: '일섬', desc: '거대한 금빛 검기, 관통 +4, 데미지 ×1.8', apply: (w) => { w.dmg *= 1.8; w.count += 1; } },
    orbit: { passive: 'area', name: '구미호화', desc: '여우불 9개, 데미지 ×2', apply: (w) => { w.count = Math.max(w.count, 9); w.dmg *= 2; w.dist += 1.2; } },
    lightning: { passive: 'haste', name: '천벌뢰', desc: '벼락 +5, 범위 ×1.6, 데미지 ×1.8', apply: (w) => { w.count += 5; w.dmg *= 1.8; } },
    palm: { passive: 'hp', name: '태산압정', desc: '사거리 ×1.6, 데미지 ×2, 대기시간 -40%', apply: (w) => { w.dmg *= 2; w.cd *= 0.6; } },
    needles: { passive: 'speed', name: '폭우이화침', desc: '암기 +10, 관통 +2, 데미지 ×1.5', apply: (w) => { w.count += 10; w.dmg *= 1.5; } },
    eogeom: { passive: 'haste', name: '검룡승천', desc: '비검 +6, 꿰뚫을 때마다 금빛 폭발, 데미지 ×1.8', apply: (w) => { w.count += 6; w.dmg *= 1.8; w.launch *= 0.6; } },
    saja: { passive: 'armor', name: '사자멸혼후', desc: '범위 ×1.5, 데미지 ×2, 기절 ×2', apply: () => {} },
    tanji: { passive: 'crit', name: '무형지', desc: '지풍 +3, 데미지 ×1.8, 대기시간 -30%', apply: (w) => { w.count += 3; w.dmg *= 1.8; w.cd *= 0.7; } },
    geomgang: { passive: 'dmg', name: '천지양단', desc: '반경 +3.5, 데미지 ×2, 일직선 검강 추가', apply: (w) => { w.R += 3.5; w.dmg *= 2; } },
    ihyeong: { passive: 'speed', name: '분광환영', desc: '분신 +3, 데미지 ×1.8', apply: (w) => { w.count += 3; w.dmg *= 1.8; } },
    cheongeun: { passive: 'hp', name: '천근만근', desc: '범위 ×1.4, 데미지 ×2.2, 여진 두 번', apply: () => {} },
    heupseong: { passive: 'regen', name: '흡성마공', desc: '대상 +6, 데미지 ×2, 흡수 ×2', apply: (w) => { w.count += 6; w.dmg *= 2; w.heal *= 2; } },
  };
  function gangSlash(w, a, side) {
    const R = w.R * P.area, half = 1.15;
    let n = 0;
    for (const e of enemies) {
      if (e.dead) continue;
      const d = Math.hypot(e.x - P.x, e.z - P.z); if (d > R + e.r) continue;
      let da = Math.atan2(e.z - P.z, e.x - P.x) - a; da = Math.atan2(Math.sin(da), Math.cos(da));
      if (Math.abs(da) > half + e.r / Math.max(d, 1)) continue;
      hurt(e, w.dmg, (e.x - P.x) * 2, (e.z - P.z) * 2); n++;
    }
    const col = w.evolved ? '#ffd76a' : '#7ab8ff';
    sectorSlash(P.x, P.y + 0.8, P.z, a, half, R, col, 0.42, side);
    if (w.evolved && side > 0) {
      const L = 40, x1 = P.x + Math.cos(a) * L, z1 = P.z + Math.sin(a) * L;
      lineHits(P.x, P.z, x1, z1, 1.2, (e, cx, cz) => hurt(e, w.dmg * 0.8, cx * 8, cz * 8));
      beamLine(P.x, chest(), P.z, x1, chest(), z1, col, 0.25, 0.35);
    }
    if (n >= 6) { impact(0.05); shake = Math.max(shake, 0.4); }
    word('cut', P.x + Math.cos(a) * R * 0.6, P.y, P.z + Math.sin(a) * R * 0.6, n >= 6);
  }
  function stomp(w, x, z, R, dmg, after) {
    const y = H(x, z);
    inRadius(x, z, R, (e) => hurt(e, dmg, (e.x - x) * 3, (e.z - z) * 3));
    cracks(x, y, z, R, w.evolved ? '#ff6a3a' : '#ffaa50');
    ringWave(x, y, z, R * 1.1, '#fff0d0', 0.5, 0.25);
    burst(x, y + 0.3, z, '#d8cbb0', after ? 14 : 30, 10, 0.6);
    shake = Math.max(shake, after ? 0.4 : 0.8);
    if (!after) { word('hit', x, y, z, true); impact(0.05); }
  }
  function xcut(x, y, z, a, col) {
    for (const da of [0, 1.9]) {
      const L = 1.4, cx = Math.cos(a + da) * L, cz = Math.sin(a + da) * L;
      beamLine(x - cx, y + 0.6, z - cz, x + cx, y - 0.6, z + cz, col, 0.07, 0.22);
    }
  }
  function phantom(x0, y0, z0, x1, y1, z1, col, delay) {
    const g = new THREE.Group();
    const look = heroLook();
    const ghosts = [0, 1, 2].map((k) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex(look, x1 < x0), color: col, transparent: true, opacity: 0.8 - k * 0.25, blending: k ? THREE.AdditiveBlending : THREE.NormalBlending, depthWrite: false })); s.center.set(0.5, 0.1); s.scale.set(P.actor.scale, P.actor.scale, 1); g.add(s); return s; });
    const streak = beamLine(x0, y0 + 1.2, z0, x1, y1 + 1.2, z1, col, 0.18, 0.45 + delay);
    streak.visible = false;
    addFx(g, 0.45 + delay, (f, k) => {
      const t = clamp((f.max - f.life - delay) / 0.16, 0, 1);
      g.visible = streak.visible = f.max - f.life >= delay;
      ghosts.forEach((s, i) => { const tt = Math.max(0, t - i * 0.15); s.position.set(x0 + (x1 - x0) * tt, y0 + (y1 - y0) * tt, z0 + (z1 - z0) * tt); s.material.opacity = (0.85 - i * 0.25) * (1 - k); });
    });
  }
  function drain(e, col) {
    const sx = e.x, sy = e.y + e.h * 0.4, sz = e.z;
    const beads = [0, 1, 2].map(() => glowSprite(col, 0.8));
    const line = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: col, transparent: true, blending: THREE.AdditiveBlending }));
    const g = new THREE.Group(); beads.forEach((b) => g.add(b)); g.add(line);
    const seed = Math.random() * 6;
    addFx(g, 0.6, (f, k) => {
      const ex = P.x, ey = chest(), ez = P.z, at = (u) => {
        const wob = Math.sin(u * 9 + seed + k * 14) * 0.6 * Math.sin(u * Math.PI) * (1 - k);
        return [sx + (ex - sx) * u + wob, sy + (ey - sy) * u + Math.sin(u * Math.PI) * 1.2, sz + (ez - sz) * u - wob];
      };
      const pts = []; for (let i = 0; i <= 14; i++) pts.push(...at(i / 14));
      line.geometry.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
      line.material.opacity = 1 - k;
      beads.forEach((b, i) => { b.position.set(...at((k * 1.8 + i / 3) % 1)); b.material.opacity = 1 - k; });
    });
  }

  // ---------- 영웅 ----------
  const heroKey = () => HEROES[heroIdx][0];
  const tierOf = (lv) => (lv >= 22 ? 4 : lv >= 15 ? 3 : lv >= 10 ? 2 : lv >= 5 ? 1 : 0);
  const heroLook = () => (P.tier ? `${heroKey()}_t${P.tier}` : heroKey());
  const HERO_SCALE = 2.5;
  function newPlayer() {
    return { x: 0, z: 0, y: 0, vy: 0, lx: 0, lz: 0, hp: 120, maxHp: 120, speed: 8.6, jump: 13, jumps: 0, maxJumps: 2, air: false, inv: 0, lv: 1, xp: 0, next: 6,
      magnet: 4.5, faceL: false, bob: 0, haste: 1, area: 1, dmgMul: 1, armor: 1, regen: 0, extra: 0, crit: 0.05, ult: 0, tier: 0,
      weapons: {}, passives: {}, actor: null, stomping: false };
  }
  function grant(id) {
    const w = P.weapons[id];
    if (!w) P.weapons[id] = { ...WEAPONS[id].create(), level: 1 };
    else { w.level++; WEAPONS[id].upgrade(w); }
    refreshWeps();
  }
  function refreshWeps() {
    $('weps').innerHTML = Object.entries(P.weapons).map(([id, w]) => `<img src="${A(`icons/${w.evolved ? 'e' : 'w'}_${WEAPONS[id].icon.slice(2)}.png`)}" title="${w.evolved ? EVOS[id].name : WEAPONS[id].name}">`).join('') +
      Object.entries(P.passives).map(([id]) => `<img src="${A(`icons/${PASSIVE_BY_ID[id].icon}.png`)}">`).join('');
  }

  // ---------- 적 ----------
  const ENEMY_SCALE = (T) => T.size / PX;
  function spawn(key, opts = {}) {
    const T = ENEMIES[key];
    for (let tries = 0; tries < 10; tries++) {
      const a = opts.a ?? rand(0, 6.28), d = opts.d ?? rand(24, 34), x = P.x + Math.cos(a) * d, z = P.z + Math.sin(a) * d;
      if (Math.abs(x) > WORLD - 10 || Math.abs(z) > WORLD - 10 || H(x, z) < WATER_Y - 1.2) { if (opts.a !== undefined) return null; continue; }
      const mul = (1 + stageTime / 160 + si * 0.9) * (opts.elite ? 6 : 1);
      const sc = ENEMY_SCALE(T) * (opts.elite ? 1.35 : 1);
      const e = { T, x, z, y: H(x, z) + (T.fly || 0), hp: T.hp * (T.boss ? 1 + si * 0.25 : mul), max: 0, flash: 0, kx: 0, kz: 0, stun: 0, cd: rand(1, 3), phase: rand(0, 6),
        a: makeActor(T.key, sc, opts.elite ? '#ffd27a' : null), r: Math.max(0.45, T.r / PX * 1.1) * (opts.elite ? 1.3 : 1), h: sc, elite: !!opts.elite, dmg: T.dmg * (1 + si * 0.35) * (opts.elite ? 1.5 : 1), spd: (T.spd / PX) * (opts.elite ? 0.9 : 1) };
      if (T.alpha) { e.a.sp.material.transparent = true; e.a.sp.material.opacity = T.alpha; }
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
  function hurt(e, dmg, kx = 0, kz = 0) {
    if (e.dead) return;
    const crit = Math.random() < P.crit;
    dmg *= P.dmgMul * (crit ? 2 : 1) * (P.high ? 1.2 : 1);
    e.hp -= dmg; e.flash = 0.1;
    if (!e.T.boss) { e.kx += kx; e.kz += kz; }
    if (texts.length < 60 || crit) text(e.x, e.y + e.h * 0.9, e.z, Math.round(dmg) + (crit ? '!' : ''), crit ? '#ffcf4a' : '#ffffff', crit ? 20 : 15, 0.6);
    if (e.hp <= 0) kill(e);
  }
  function kill(e) {
    e.dead = true; kills++;
    P.ult = Math.min(100, P.ult + (e.T.boss ? 30 : e.elite ? 8 : 0.6));
    burst(e.x, e.y + e.h * 0.4, e.z, e.T.boss ? '#ffcf6a' : '#ff8a6a', e.T.boss ? 90 : e.elite ? 30 : 12, e.T.boss ? 16 : 8, 0.6);
    const big = e.T.boss || e.elite;
    const n = big ? 10 : 1;
    for (let i = 0; i < n; i++) {
      const ox = e.x + (n > 1 ? rand(-3, 3) : 0), oz = e.z + (n > 1 ? rand(-3, 3) : 0);
      const xp = e.T.xp * (1 + si * 0.5) * (big ? 1.2 : 1) / (big ? 1 : 1);
      const m = new THREE.Mesh(orbGeo, xp >= 15 ? orbBig : xp >= 8 ? orbMid : orbMat); scene.add(m);
      orbs.push({ m, x: ox, z: oz, y: H(ox, oz) + 0.6, v: xp });
    }
    if (Math.random() < (e.elite ? 1 : 0.012)) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.4, 8, 6), new THREE.MeshLambertMaterial({ color: '#ff8fb4', emissive: '#501020' })); scene.add(m); heals.push({ m, x: e.x, z: e.z }); }
    dropActor(e.a);
    if (e === boss) bossDown();
  }
  const orbGeo = new THREE.OctahedronGeometry(0.3, 0), orbMat = new THREE.MeshBasicMaterial({ color: '#7ff0c8' }), orbMid = new THREE.MeshBasicMaterial({ color: '#6ab8ff' }), orbBig = new THREE.MeshBasicMaterial({ color: '#ffd76a' });

  // 적 공격: 원거리 탄 / 돌진 / 보스 내려찍기
  const eshotGeo = new THREE.SphereGeometry(0.35, 8, 6);
  function enemyShoot(e, color = '#ff5a8a') {
    const sy = e.y + e.h * 0.45, a = Math.atan2(P.z - e.z, P.x - e.x), spd = 11;
    const m = new THREE.Mesh(eshotGeo, new THREE.MeshBasicMaterial({ color })); m.add(glowSprite(color, 1.4)); scene.add(m);
    eshots.push({ m, x: e.x, y: sy, z: e.z, vx: Math.cos(a) * spd, vz: Math.sin(a) * spd, life: 3, dmg: e.dmg * 0.8 });
  }
  function bossAttack(e) {
    // telegraphed slam at the hero's feet: jump to dodge it
    const x = P.x, z = P.z, R = 4.5 + si * 0.6, y = H(x, z);
    const warn = new THREE.Mesh(new THREE.CircleGeometry(1, 40).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#ff3030', transparent: true, opacity: 0.25, depthWrite: false }));
    const edge = new THREE.Mesh(new THREE.RingGeometry(0.94, 1, 48).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#ff5050', transparent: true, opacity: 0.9, depthWrite: false }));
    warn.add(edge); warn.position.set(x, y + 0.2, z);
    addFx(warn, 1.0, (f, k) => { warn.scale.setScalar(R * Math.min(1, k * 1.6)); warn.material.opacity = 0.15 + 0.25 * Math.abs(Math.sin(k * 20)); });
    e.slamAt = { t: 1.0, x, z, R };
    text(e.x, e.y + e.h + 1, e.z, '!', '#ff5050', 40, 0.8, true);
  }

  // ---------- 필살기: 천하일검 ----------
  function ultimate() {
    if (P.ult < 100) return;
    P.ult = 0;
    impact(0.08); shake = 1.2;
    const R = 22;
    for (let k = 0; k < 4; k++) ringWave(P.x, P.y, P.z, R * (0.4 + k * 0.2), k % 2 ? '#ffffff' : '#ffd76a', 0.7, 0.12, k * 0.1);
    for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; sectorSlash(P.x, P.y + 1 + i * 0.05, P.z, a, 0.35, R * 0.8, '#ffd76a', 0.6, 1); }
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 2.4, 60, 16, 1, true), fadeMat(addMat('#ffe8a0', 0.6)));
    pillar.position.set(P.x, P.y + 30, P.z);
    addFx(pillar, 0.9, (f, k) => { pillar.material.opacity = 0.6 * (1 - k); pillar.scale.set(1 + k * 2, 1, 1 + k * 2); });
    text(P.x, P.y + 4, P.z, '천하일검!!', '#ffe08a', 44, 1.2, true);
    inRadius(P.x, P.z, R, (e) => hurt(e, (60 + P.lv * 12) * (e.T.boss ? 1 : 3), (e.x - P.x) * 2, (e.z - P.z) * 2));
  }

  // ---------- 진행 ----------
  function banner(t, sub = '') { $('banner').innerHTML = t + (sub ? `<small>${sub}</small>` : ''); $('banner').style.opacity = 1; bannerT = 2.6; }
  function levelUp(title = '깨달음') {
    modal = true;
    $('luTitle').textContent = title;
    const opts = [];
    const owned = Object.keys(P.weapons);
    for (const [id, w] of Object.entries(P.weapons)) if (!w.evolved && w.level >= WEAPONS[id].max && P.passives[EVOS[id].passive]) opts.push({ evo: id });
    const pool = [];
    for (const [id, W] of Object.entries(WEAPONS)) { const w = P.weapons[id]; if (w ? w.level < W.max : owned.length < 6) pool.push({ w: id }); }
    for (const p of PASSIVES) if ((P.passives[p.id] || 0) < p.max && (Object.keys(P.passives).length < 6 || P.passives[p.id])) pool.push({ p: p.id });
    for (const o of shuffle(pool)) { if (opts.length >= 3 + (P.lv % 5 === 0 ? 1 : 0)) break; opts.push(o); }
    if (!opts.length) opts.push({ heal: true });
    const cards = $('cards'); cards.innerHTML = '';
    for (const o of opts) {
      const b = document.createElement('button'); b.className = 'card';
      if (o.evo) {
        const W = WEAPONS[o.evo], E2 = EVOS[o.evo];
        b.classList.add('evo');
        b.innerHTML = `<img src="${A(`icons/e_${W.icon.slice(2)}.png`)}"><b>각성: ${E2.name}</b><span class="st">${W.name} + ${PASSIVE_BY_ID[E2.passive].name}</span><span>${E2.desc}</span>`;
        b.onclick = () => { const w = P.weapons[o.evo]; E2.apply(w); w.evolved = true; refreshWeps(); close(); banner(`${E2.name}!`, '무공이 각성했다'); impact(0.08); };
      } else if (o.w) {
        const W = WEAPONS[o.w], w = P.weapons[o.w], lv = w ? w.level + 1 : 1;
        if (!w) b.classList.add('new');
        b.innerHTML = `<img src="${A(`icons/${W.icon}.png`)}"><b>${W.name}</b><span class="st">${'★'.repeat(lv)}${'☆'.repeat(W.max - lv)}</span><span>${w ? W.up : W.desc}</span>`;
        b.onclick = () => { grant(o.w); close(); };
      } else if (o.p) {
        const p = PASSIVE_BY_ID[o.p], lv = (P.passives[o.p] || 0) + 1;
        b.innerHTML = `<img src="${A(`icons/${p.icon}.png`)}"><b>${p.name}</b><span class="st">${'★'.repeat(lv)}${'☆'.repeat(p.max - lv)}</span><span>${p.desc}</span>`;
        b.onclick = () => { P.passives[o.p] = lv; p.f(P); refreshWeps(); close(); };
      } else {
        b.innerHTML = `<img src="${A(`icons/peach.png`)}"><b>휴식</b><span></span><span>HP 40 회복</span>`;
        b.onclick = () => { P.hp = Math.min(P.maxHp, P.hp + 40); close(); };
      }
      cards.appendChild(b);
    }
    $('levelup').classList.add('on');
    function close() { $('levelup').classList.remove('on'); modal = false; if (P.pendingLv > 0) { P.pendingLv--; setTimeout(() => levelUp(), 120); } }
  }
  function gainXp(v) {
    P.xp += v;
    while (P.xp >= P.next) {
      P.xp -= P.next; P.lv++;
      P.next = Math.floor(6 + P.lv * 4.2 + P.lv * P.lv * 0.32);
      const t = tierOf(P.lv);
      if (t !== P.tier) {
        P.tier = t;
        setActorKey(P.actor, heroLook(), HERO_SCALE * (t === 4 ? 32 / 24 : 1));
        $('portrait').src = A(`${heroLook()}.png`);
        banner(t === 4 ? '문주의 위엄' : '모습이 바뀌었다!', ['', '강호인', '일류고수', '절정고수', '천하제일'][t]);
        burst(P.x, chest(), P.z, '#ffe08a', 50, 10, 0.8); impact(0.06);
      }
      if (modal) P.pendingLv = (P.pendingLv || 0) + 1; else levelUp();
    }
  }
  function bossDown() {
    $('boss').style.display = 'none';
    impact(0.1); shake = 1.4;
    text(boss.x, boss.y + boss.h, boss.z, '격파!!', '#ffe08a', 46, 1.4, true);
    boss = null;
    setTimeout(() => {
      modal = true;
      const last = si >= STAGES.length - 1;
      $('clearTitle').textContent = last ? '강호 평정!' : `${STAGES[si].name.split(' · ')[0]} 돌파`;
      $('clearTxt').textContent = last ? `저승사자마저 쓰러뜨렸다 · 처치 ${kills} · Lv ${P.lv}` : `다음: ${STAGES[si + 1].name} — ${STAGES[si + 1].sub}`;
      $('nextBtn').textContent = last ? '처음으로' : '다음 장으로';
      $('nextBtn').onclick = () => { if (last) return location.reload(); $('clear').classList.remove('on'); nextStage(); };
      $('clear').classList.add('on');
    }, 1600);
  }
  function clearField() {
    for (const e of enemies) dropActor(e.a);
    enemies = [];
    for (const s of [...shots, ...eshots]) scene.remove(s.m);
    for (const o of [...orbs, ...heals]) scene.remove(o.m);
    shots = []; eshots = []; orbs = []; heals = [];
  }
  function nextStage() {
    gainXp(orbs.reduce((s, o) => s + o.v, 0));
    clearField();
    texts = [];
    si++; stageTime = 0; bossOut = false; waveDone = false;
    buildWorld(si);
    P.x = 0; P.z = 0; P.y = H(0, 0); P.vy = 0; P.air = false; P.lx = P.lz = 0;
    P.hp = Math.min(P.maxHp, P.hp + P.maxHp * 0.5);
    modal = false;
    banner(STAGES[si].name, STAGES[si].sub);
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
    for (const ob of OBST) {
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
    time += dt; stageTime += dt;
    wordCd = Math.max(0, wordCd - dt);
    // input → camera-relative movement
    if (camMode === 'chase') { if (keys.KeyE) camYaw -= dt * 2.2; }
    let ix = (keys.KeyD || keys.ArrowRight ? 1 : 0) - (keys.KeyA || keys.ArrowLeft ? 1 : 0) + stick.x;
    let iz = (keys.KeyS || keys.ArrowDown ? 1 : 0) - (keys.KeyW || keys.ArrowUp ? 1 : 0) + stick.y;
    const il = Math.hypot(ix, iz); if (il > 1) { ix /= il; iz /= il; }
    fwdX = -Math.sin(camYaw); fwdZ = -Math.cos(camYaw); rgtX = Math.cos(camYaw); rgtZ = -Math.sin(camYaw);
    const mx = (rgtX * ix - fwdX * iz) * P.speed, mz = (rgtZ * ix - fwdZ * iz) * P.speed;
    if (Math.abs(ix) > 0.1) P.faceL = ix < 0;
    P.lx *= P.air ? 0.995 : 0.8; P.lz *= P.air ? 0.995 : 0.8;
    moveXZ(P, (mx + P.lx) * dt, (mz + P.lz) * dt, P.y, 0.6);
    const g = H(P.x, P.z);
    if (wantJump && P.jumps < P.maxJumps) {
      P.vy = P.jump * (P.jumps ? 0.85 : 1); P.jumps++; P.air = true; P.inv = Math.max(P.inv, 0.25);
      burst(P.x, P.y + 0.3, P.z, '#e8f4ff', 10, 4, 0.35);
      if (P.jumps === 2) ringWave(P.x, P.y, P.z, 1.6, '#cfefff', 0.3, 0.3);
    }
    wantJump = false;
    if (wantUlt) { wantUlt = false; ultimate(); }
    if (P.air || P.y > g + 0.6) {
      P.air = true; P.vy -= (P.stomping && P.vy < 0 ? 70 : 34) * dt; P.y += P.vy * dt;
      if (P.y <= g) { P.y = g; P.vy = 0; P.air = false; P.jumps = 0; P.stomping = false; burst(P.x, g + 0.2, P.z, '#d8cbb0', 6, 3, 0.3); }
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
        banner('고원의 보물!', '깨달음 +1 · 체력 회복'); P.hp = P.maxHp; setTimeout(() => (modal ? (P.pendingLv = (P.pendingLv || 0) + 1) : levelUp('보물')), 250);
      }
    }
    P.inv = Math.max(0, P.inv - dt);
    if (P.regen) P.hp = Math.min(P.maxHp, P.hp + P.regen * dt);
    P.ult = Math.min(100, P.ult + dt * 0.8);
    P.bob += dt * (il > 0.1 && !P.air ? 12 : 0);
    const bob = !P.air && il > 0.1 ? Math.abs(Math.sin(P.bob)) * 0.16 : 0;
    placeActor(P.actor, P.x, P.y + bob, P.z, g, P.faceL);
    P.actor.sp.material.opacity = P.inv > 0.3 && (time * 20) % 2 < 1 ? 0.5 : 1;

    for (const [id, w] of Object.entries(P.weapons)) WEAPONS[id].update(w, dt);
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
    const cap = IS_TOUCH ? 130 : 180;
    if (spawnT <= 0 && !boss) {
      spawnT = Math.max(0.2, 0.75 - stageTime / 320);
      const n = 2 + Math.floor(stageTime / 50) + si;
      for (let i = 0; i < n && enemies.length < cap; i++) spawn(pickEnemy());
      if (Math.random() < 0.012 + si * 0.004) spawn(pickEnemy(), { elite: true });
    }
    if (!waveDone && stageTime > 150) {
      waveDone = true; banner('포위당했다!', '사방에서 몰려온다');
      const k = pickEnemy();
      for (let i = 0; i < 36 && enemies.length < cap + 40; i++) spawn(k, { a: (i / 36) * Math.PI * 2, d: 26 });
    }
    if (!bossOut && stageTime > STAGE_LEN) {
      bossOut = true;
      boss = spawn(STAGES[si].boss, { d: 24 });
      if (boss) { banner(`${boss.T.name} 출현`, STAGES[si].name); $('boss').style.display = 'block'; $('bossName').textContent = boss.T.name; impact(0.08); }
      else bossOut = false;
    }
    for (const e of enemies) {
      if (e.dead) continue;
      let dx = P.x - e.x, dz = P.z - e.z; const d = Math.hypot(dx, dz) || 1; dx /= d; dz /= d;
      if (d > 70 && !e.T.boss) { const a = rand(0, 6.28); e.x = P.x + Math.cos(a) * 38; e.z = P.z + Math.sin(a) * 38; continue; }
      let spd = e.spd;
      e.cd -= dt;
      if (e.stun > 0) { e.stun -= dt; spd = 0; }
      else if (e.T.ai === 'ranged') {
        if (d < 9) spd *= -0.6; else if (d < 14) spd = 0;
        if (e.cd <= 0 && d < 22) { e.cd = rand(2.2, 3.2); enemyShoot(e, e.T.key === 'archer' ? '#e8d8a0' : e.T.key === 'poisoner' ? '#7ae05a' : '#ff5a8a'); }
      } else if (e.T.ai === 'charger') {
        if (e.dash > 0) { e.dash -= dt; spd *= 3.2; dx = e.dx; dz = e.dz; }
        else if (e.wind > 0) { e.wind -= dt; spd = 0; e.a.sp.material.color.set('#ff8080'); if (e.wind <= 0) { e.dash = 0.6; e.dx = dx; e.dz = dz; } }
        else if (e.cd <= 0 && d < 12) { e.cd = rand(3, 4.5); e.wind = 0.5; }
      }
      if (e.T.hop) spd *= 0.4 + 1.2 * Math.max(0, Math.sin(time * 5 + e.phase));
      if (e.T.boss) {
        if (e.cd <= 0) { e.cd = Math.max(2.6, 5 - si * 0.6); bossAttack(e); }
        if (e.slamAt && (e.slamAt.t -= dt) <= 0) {
          const s = e.slamAt; e.slamAt = null;
          ringWave(s.x, H(s.x, s.z), s.z, s.R * 1.1, '#ff6a50', 0.45, 0.3); cracks(s.x, H(s.x, s.z), s.z, s.R, '#ff5030'); shake = Math.max(shake, 0.8);
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
      e.flash = Math.max(0, e.flash - dt);
      if (!(e.wind > 0)) e.a.sp.material.color.set(e.flash > 0 ? '#ffffff' : e.elite ? '#ffd27a' : '#ffffff');
      e.a.sp.material.color.multiplyScalar(e.flash > 0 ? 4 : 1);
      placeActor(e.a, e.x, e.y, e.z, ng, dx * rgtX + dz * rgtZ < 0);
      // see-through when standing between the camera and the hero
      const fw = (e.x - P.x) * fwdX + (e.z - P.z) * fwdZ, side = Math.abs((e.x - P.x) * rgtX + (e.z - P.z) * rgtZ);
      const hide = camMode === 'chase' && fw < -0.5 && side < 3.5;
      e.a.sp.material.opacity = hide ? 0.35 : e.T.alpha || 1; e.a.sh.visible = !hide;
      if (P.inv <= 0 && d < e.r + 0.6 && Math.abs(P.y - e.y) < e.h * 0.6 + 0.4 && !(P.air && P.y > e.y + e.h * 0.7)) damagePlayer(e.dmg);
    }
    // separation (grid-free, but only nearby pairs)
    for (let i = 0; i < enemies.length; i++) {
      const a = enemies[i]; if (a.dead) continue;
      for (let j = i + 1; j < enemies.length; j++) {
        const b = enemies[j]; if (b.dead) continue;
        const dx = a.x - b.x, dz = a.z - b.z, m = a.r + b.r; if (Math.abs(dx) > m || Math.abs(dz) > m) continue;
        const d = Math.hypot(dx, dz); if (d < m && d > 1e-3) { const p = (m - d) * 0.25, wa = a.T.boss ? 0 : 1, wb = b.T.boss ? 0 : 1; a.x += (dx / d) * p * wa; a.z += (dz / d) * p * wa; b.x -= (dx / d) * p * wb; b.z -= (dz / d) * p * wb; }
      }
    }
    enemies = enemies.filter((e) => !e.dead);
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
      if (d < 1.2) { o.got = true; scene.remove(o.m); gainXp(o.v); }
    }
    orbs = orbs.filter((o) => !o.got);
    if (orbs.length > 260) { const old = orbs.splice(0, 60); let v = 0; for (const o of old) { v += o.v; scene.remove(o.m); } const o = orbs[0]; if (o) o.v += v; }
    for (const h of heals) { h.m.position.set(h.x, H(h.x, h.z) + 0.6 + Math.sin(time * 3) * 0.15, h.z); if (Math.hypot(P.x - h.x, P.z - h.z) < 1.3) { h.got = true; scene.remove(h.m); P.hp = Math.min(P.maxHp, P.hp + 30); text(P.x, P.y + 3, P.z, '+30', '#ff8fb4', 20, 0.8); } }
    heals = heals.filter((h) => !h.got);
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
    if (P.inv > 0) return;
    d *= P.armor;
    P.hp -= d; P.inv = 0.6; shake = Math.max(shake, 0.3);
    burst(P.x, chest(), P.z, '#ff4a4a', 12, 6, 0.4);
    text(P.x, P.y + 3, P.z, '-' + Math.round(d), '#ff6060', 18, 0.7);
    if (P.hp <= 0) gameOver();
  }
  function gameOver() {
    running = false;
    $('overTitle').textContent = '쓰러졌다…';
    $('overTxt').textContent = `${STAGES[si].name} · ${fmt(stageTime)} 버팀 · 처치 ${kills} · Lv ${P.lv}`;
    $('over').classList.add('on');
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
    const far = camera.aspect < 1 ? 1.35 : 1, dist = (fixed ? 17 : 14) * far, ht = (fixed ? 15 : 8) * far;
    camPos.set(P.x - fwdX * dist, P.y + ht, P.z - fwdZ * dist);
    const cg = H(camPos.x, camPos.z) + 1.5; if (camPos.y < cg) camPos.y = cg;
    camera.position.lerp(camPos, 1 - Math.exp(-dt * 8));
    if (shake > 0) { camera.position.x += rand(-1, 1) * shake * 0.4; camera.position.y += rand(-1, 1) * shake * 0.4; shake = Math.max(0, shake - dt * 3); }
    camLook.set(P.x + fwdX * (fixed ? 1.5 : 4), P.y + (fixed ? 0.8 : 1.8), P.z + fwdZ * (fixed ? 1.5 : 4));
    camera.lookAt(camLook);
    world.userData.dome.position.set(camera.position.x, 0, camera.position.z);
    sun.position.set(P.x + 60, 90, P.z + 30); sun.target.position.set(P.x, 0, P.z);
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
    for (const e of enemies) {
      if (!e.elite && !e.T.boss) continue;
      proj.set(e.x, e.y + e.h * 1.02, e.z).project(camera);
      if (proj.z > 1) continue;
      const sx = (proj.x * 0.5 + 0.5) * fx2d.width, sy = (-proj.y * 0.5 + 0.5) * fx2d.height, w = e.T.boss ? 90 : 46;
      g2.fillStyle = 'rgba(0,0,0,.6)'; g2.fillRect(sx - w / 2, sy, w, 5);
      g2.fillStyle = e.T.boss ? '#ff4d4d' : '#ffcf5a'; g2.fillRect(sx - w / 2, sy, w * clamp(e.hp / e.max, 0, 1), 5);
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
    if (flashT > 0) { flashT -= dt; $('flash').style.opacity = 1; } else $('flash').style.opacity = 0;
  }
  function hud() {
    $('xpbar').firstChild.style.width = (P.xp / P.next) * 100 + '%';
    $('hpbar').firstChild.style.width = Math.max(0, P.hp / P.maxHp) * 100 + '%';
    $('ultbar').firstChild.style.width = P.ult + '%';
    $('ultBtn').classList.toggle('ready', P.ult >= 100);
    $('lv').textContent = 'Lv ' + P.lv;
    $('time').textContent = boss ? '두목전' : fmt(Math.max(0, STAGE_LEN - stageTime));
    $('kills').textContent = '처치 ' + kills;
    $('stage').textContent = STAGES[si].name + (P.high ? ' · 고지 점령' : '');
    if (boss) $('boss').querySelector('i').style.width = clamp(boss.hp / boss.max, 0, 1) * 100 + '%';
  }

  // ---------- 시작 ----------
  const heroesEl = $('heroes');
  function selectHero(i) {
    heroIdx = i;
    heroesEl.querySelectorAll('.hero').forEach((x, k) => x.classList.toggle('sel', k === i));
    const [, name, role, wid] = HEROES[i];
    $('heroInfo').innerHTML = `<b>${name}</b> · ${role} — 시작 무공: <b>${WEAPONS[wid].name}</b><br><span style="opacity:.75">${WEAPONS[wid].desc}</span>`;
  }
  HEROES.forEach(([k, n], i) => {
    const b = document.createElement('button'); b.className = 'hero';
    b.innerHTML = `<img src="${A(`${k}.png`)}" alt=""><div>${n}</div>`;
    b.onclick = () => selectHero(i);
    heroesEl.appendChild(b);
  });
  selectHero(0);
  buildWorld(0);
  P = newPlayer();
  $('go').onclick = () => {
    $('start').classList.remove('on');
    P.actor = makeActor(heroKey(), HERO_SCALE);
    P.y = H(0, 0); running = true;
    grant(HEROES[heroIdx][3]);
    $('portrait').src = A(`${heroKey()}.png`);
    $('meName').textContent = `${HEROES[heroIdx][1]} · ${HEROES[heroIdx][2]}`;
    camera.position.set(0, P.y + 15, 17);
    banner(STAGES[0].name, STAGES[0].sub);
  };
  window.__dbg = {
    get P() { return P; }, get enemies() { return enemies; }, WEAPONS, EVOS, grant, start: () => $('go').click(),
    setStageTime: (t) => (stageTime = t), evolveAll: () => { for (const [id, w] of Object.entries(P.weapons)) { EVOS[id].apply(w); w.evolved = true; } refreshWeps(); },
    step(n) { for (let i = 0; i < n && running; i++) { if (modal) { document.querySelector('#cards .card, #nextBtn')?.click(); } update(1 / 60); } return { t: stageTime, si, kills, lv: P.lv, hp: Math.round(P.hp), n: enemies.length, fx: fxs.length }; },
  };

  let last = performance.now(), idleA = 0;
  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (running && !paused && !modal) update(dt);
    if (running) { updateCamera(dt); hud(); }
    else { idleA += dt * 0.08; camera.position.set(Math.sin(idleA) * 55, 28, Math.cos(idleA) * 55); camera.lookAt(0, 0, 0); world.userData.dome.position.set(camera.position.x, 0, camera.position.z); }
    renderer.render(scene, camera);
    drawOverlay(running && !paused && !modal ? dt : 0);
  }
  requestAnimationFrame(frame);
})();
