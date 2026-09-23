(function () {
  'use strict';

  // ---------- Canvas ----------
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');
  let viewW = 0, viewH = 0, dpr = 1;

  function resize() {
    dpr = window.devicePixelRatio || 1;
    viewW = window.innerWidth;
    viewH = window.innerHeight;
    canvas.width = Math.round(viewW * dpr);
    canvas.height = Math.round(viewH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener('resize', resize);
  resize();

  const $ = (id) => document.getElementById(id);
  const ui = {
    hud: $('hud'), hpBar: $('hp-bar'), hpText: $('hp-text'), xpBar: $('xp-bar'),
    timer: $('timer'), level: $('level'), kills: $('kills'), formName: $('form-name'),
    portrait: $('portrait'), evoHint: $('evo-hint'),
    banner: $('banner'), bannerMain: $('banner-main'), bannerSub: $('banner-sub'),
    start: $('start-screen'), evoChart: $('evo-chart'),
    choice: $('choice-screen'), choiceTitle: $('choice-title'),
    choiceSubtitle: $('choice-subtitle'), choiceCards: $('choice-cards'),
    pause: $('pause-screen'),
    gameover: $('gameover-screen'), gameoverPortrait: $('gameover-portrait'), gameoverStats: $('gameover-stats'),
  };

  // ---------- Sprites ----------
  // Each key loads assets/<key>.png. If the file is missing, a colored circle + emoji is drawn instead.
  // size = on-screen size in CSS px (our pixel art is drawn at exactly 2x its grid size).
  const SPRITE_DEFS = {
    mongsil: { size: 48, color: '#96d7ff', emoji: '🥚' },
    kkomul: { size: 48, color: '#69b9fa', emoji: '🦎' },
    hwareu: { size: 60, color: '#ff8c55', emoji: '🔥' },
    ipsae: { size: 60, color: '#7dcd73', emoji: '🌿' },
    taeyang: { size: 72, color: '#ffb946', emoji: '☀️' },
    kkotip: { size: 72, color: '#73c87d', emoji: '🌸' },
    slime: { size: 48, color: '#ffde73', emoji: '💧' },
    mushroom: { size: 48, color: '#f06464', emoji: '🍄' },
    bat: { size: 64, color: '#a070de', emoji: '🦇' },
    bubble: { size: 24, color: '#aae1ff' },
    fireball: { size: 28, color: '#ff9646' },
    leaf: { size: 24, color: '#87d46e' },
    star: { size: 28, color: '#ffe164', emoji: '⭐' },
    gem: { size: 20, color: '#78e1c8' },
    gem_big: { size: 24, color: '#ff96cd' },
    heart: { size: 24, color: '#ff6987', emoji: '❤' },
  };
  const SPRITES = {};
  const spritePath = (key) => `assets/${key}.png`;

  function loadImage(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });
  }

  function preloadAssets() {
    return Promise.all(Object.entries(SPRITE_DEFS).map(async ([key, def]) => {
      SPRITES[key] = { ...def, img: await loadImage(spritePath(key)) };
    }));
  }

  function pixelImg(key) {
    const img = document.createElement('img');
    img.src = spritePath(key);
    img.alt = '';
    img.onerror = () => { img.style.visibility = 'hidden'; };
    return img;
  }

  // groundR anchors squash/stretch at the creature's feet instead of its center.
  function drawSprite(key, x, y, o = {}) {
    const s = SPRITES[key];
    if (!s) return;
    const size = s.size;
    const ground = o.groundR || 0;
    ctx.save();
    ctx.translate(Math.round(x), Math.round(y + ground));
    if (o.rot) ctx.rotate(o.rot);
    ctx.scale((o.flip ? -1 : 1) * (o.sx || 1), o.sy || 1);
    if (o.alpha !== undefined) ctx.globalAlpha = o.alpha;
    if (o.flash) ctx.filter = 'brightness(2.2)';
    const top = -size / 2 - ground;
    if (s.img) {
      ctx.imageSmoothingEnabled = s.img.width > size * dpr * 2;
      ctx.drawImage(s.img, -size / 2, top, size, size);
    } else {
      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.arc(0, top + size / 2, size * 0.32, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(80, 50, 80, 0.6)';
      ctx.stroke();
      if (s.emoji) {
        ctx.font = `${Math.round(size * 0.36)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(s.emoji, 0, top + size / 2 + 1);
      }
    }
    ctx.restore();
  }

  // ---------- Background (tiled pastel meadow) ----------
  let bgPattern = null;

  function seededRandom(seed) {
    return function () {
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function buildBackground() {
    const T = 320, U = 2;
    const tile = document.createElement('canvas');
    tile.width = T;
    tile.height = T;
    const g = tile.getContext('2d');
    g.fillStyle = '#cfeaa9';
    g.fillRect(0, 0, T, T);
    const rnd = seededRandom(7);
    const spot = () => [Math.floor(rnd() * T / U) * U, Math.floor(rnd() * T / U) * U];
    // Draw wrapped copies so decorations crossing the tile edge stay seamless.
    const stamp = (cells, x0, y0) => {
      for (const [dx, dy, color] of cells) {
        g.fillStyle = color;
        for (const ox of [-T, 0, T]) {
          for (const oy of [-T, 0, T]) g.fillRect(x0 + dx * U + ox, y0 + dy * U + oy, U, U);
        }
      }
    };
    const TUFT = [[0, 0], [2, 0], [4, 0], [1, 1], [2, 1], [3, 1]];
    for (let i = 0; i < 46; i++) {
      const color = rnd() < 0.5 ? '#a8d888' : '#b6df95';
      stamp(TUFT.map(([x, y]) => [x, y, color]), ...spot());
    }
    for (let i = 0; i < 40; i++) stamp([[0, 0, '#ddf1c3']], ...spot());
    const PETALS = ['#ffffff', '#ffc4d8', '#c9e6ff', '#fff1a8'];
    for (let i = 0; i < 16; i++) {
      const p = PETALS[Math.floor(rnd() * PETALS.length)];
      const c = p === '#fff1a8' ? '#ffb86b' : '#ffd76b';
      stamp([[1, 0, p], [0, 1, p], [2, 1, p], [1, 2, p], [1, 1, c]], ...spot());
    }
    bgPattern = ctx.createPattern(tile, 'repeat');
  }

  // ---------- Evolution line ----------
  // STAGE_LEVELS[i] = level at which stage i+1 is reached.
  const STAGE_LEVELS = [1, 4, 8, 13];

  const FORMS = {
    mongsil: {
      stage: 1, name: '몽실이', sprite: 'mongsil',
      apply() {},
    },
    kkomul: {
      stage: 2, name: '꼬물룡', sprite: 'kkomul',
      desc: '최대 HP +20, 방울탄 데미지 +3',
      apply(p) { p.maxHp += 20; p.weapons.shot.damage += 3; },
    },
    hwareu: {
      stage: 3, branch: 'fire', name: '화르룡', sprite: 'hwareu',
      desc: '공격형! 방울탄이 불꽃탄으로 바뀌어요. 데미지 ×1.4, 최대 HP +20',
      apply(p) {
        const w = p.weapons.shot;
        p.maxHp += 20;
        w.damage *= 1.4;
        w.sprite = 'fireball';
        w.radius = 11;
      },
    },
    ipsae: {
      stage: 3, branch: 'leaf', name: '잎새룡', sprite: 'ipsae',
      desc: '생존형! 잎새탄 + 별빛 수호 +1, 초당 회복 +1.5, 속도 +10%, 최대 HP +30',
      apply(p) {
        p.maxHp += 30;
        p.regen += 1.5;
        p.speed *= 1.1;
        p.weapons.shot.sprite = 'leaf';
        addOrbitStar(p);
      },
    },
    taeyang: {
      stage: 4, branch: 'fire', name: '태양룡', sprite: 'taeyang',
      desc: '불꽃탄 +2발, 관통 +2, 데미지 ×1.3',
      apply(p) {
        const w = p.weapons.shot;
        p.maxHp += 30;
        w.count += 2;
        w.pierce += 2;
        w.damage *= 1.3;
      },
    },
    kkotip: {
      stage: 4, branch: 'leaf', name: '꽃잎룡', sprite: 'kkotip',
      desc: '별빛 수호 +2, 별 데미지 ×1.5, 초당 회복 +2',
      apply(p) {
        p.maxHp += 40;
        p.regen += 2;
        addOrbitStar(p);
        addOrbitStar(p);
        p.weapons.orbit.damage *= 1.5;
      },
    },
  };
  const formsAtStage = (stage) => Object.keys(FORMS).filter((id) => FORMS[id].stage === stage);

  // ---------- Enemies ----------
  const ENEMY_TYPES = {
    slime: { name: '말랑이', sprite: 'slime', hp: 10, speed: 85, damage: 6, radius: 13, xp: 3, weight: 3, barY: 18 },
    mushroom: { name: '버섯돌이', sprite: 'mushroom', hp: 26, speed: 62, damage: 10, radius: 15, xp: 7, weight: 2, minTime: 35, barY: 24 },
    bat: { name: '박쥐대장', sprite: 'bat', hp: 260, speed: 48, damage: 18, radius: 22, xp: 50, boss: true, minTime: 60, barY: 32 },
  };
  const MAX_ENEMIES = 260;
  // Bosses arrive on the minute (from 1:00), surround waves on the half minute (from 1:30).
  const EVENT_INTERVAL = 60;
  const WAVE_START = 90;

  // ---------- Upgrades ----------
  const val = (v) => (typeof v === 'function' ? v() : v);
  const shotName = () => ({ fire: '불꽃탄', leaf: '잎새탄' }[player.branch] || '방울탄');

  function addOrbitStar(p) {
    if (!p.weapons.orbit) {
      p.weapons.orbit = { count: 1, damage: 8, dist: 58, angle: 0, hits: new Map() };
    } else {
      p.weapons.orbit.count++;
      p.weapons.orbit.damage += 3;
    }
  }

  // max = how many times an upgrade can be picked per run; apply(p, n) gets n = which pick this is (1-based).
  const UPGRADES = [
    {
      id: 'shot', max: 6,
      icon: () => ({ fire: '🔥', leaf: '🍃' }[player.branch] || '💧'),
      title: () => `${shotName()} 강화`,
      desc: '데미지 +4, 2번 강화할 때마다 발사 수 +1',
      apply(p, n) {
        p.weapons.shot.damage += 4;
        if (n % 2 === 0) p.weapons.shot.count++;
      },
    },
    { id: 'rapid', max: 4, icon: '⚡', title: '연사력 증가', desc: '발사 간격 -12%', apply(p) { p.weapons.shot.cooldown *= 0.88; } },
    {
      id: 'orbit', max: 5, icon: '⭐',
      title: () => (player.weapons.orbit ? '별빛 수호 강화' : '별빛 수호 획득'),
      desc: () => (player.weapons.orbit ? '별 +1개, 별 데미지 +3' : '주위를 빙글빙글 도는 별이 적을 막아줘요'),
      apply(p) { addOrbitStar(p); },
    },
    {
      id: 'hp', max: 5, icon: '💖', title: '튼튼한 몸', desc: '최대 HP +20, HP 20 회복',
      apply(p) { p.maxHp += 20; p.hp = Math.min(p.maxHp, p.hp + 20); },
    },
    { id: 'speed', max: 3, icon: '👟', title: '날쌘 발', desc: '이동 속도 +10%', apply(p) { p.speed *= 1.1; } },
    { id: 'magnet', max: 3, icon: '🧲', title: '자석 꼬리', desc: '아이템 줍는 범위 +30%', apply(p) { p.pickupRadius *= 1.3; } },
    { id: 'regen', max: 4, icon: '🌿', title: '회복의 이슬', desc: '초당 HP 1 회복', apply(p) { p.regen += 1; } },
  ];
  // Offered to fill the row once the other upgrades are maxed out.
  const SNACK = {
    id: 'snack', icon: '🍰', title: '맛있는 간식', desc: 'HP 30 회복',
    apply(p) { p.hp = Math.min(p.maxHp, p.hp + 30); },
  };

  // ---------- Utility ----------
  const dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const fmtTime = (sec) => `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(Math.floor(sec % 60)).padStart(2, '0')}`;

  function shuffled(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // ---------- State ----------
  let state = 'title'; // title | playing | choice | paused | gameover
  let player, enemies, projectiles, pickups, particles, floatTexts;
  let elapsed = 0, kills = 0, spawnTimer = 0, bossTimer = 0, waveTimer = 0, modalDelay = 0, flash = 0, anim = 0;
  const modalQueue = [];
  const keys = new Set();

  function resetGame() {
    player = {
      x: 0, y: 0,
      form: 'mongsil', stage: 1, branch: null,
      radius: SPRITE_DEFS.mongsil.size * 0.3,
      speed: 190, maxHp: 100, hp: 100, regen: 0, pickupRadius: 100,
      level: 1, xp: 0, xpToNext: 10, picks: {},
      facing: -1, moving: false, invuln: 0, glow: 0,
      weapons: {
        shot: { damage: 10, count: 1, pierce: 1, cooldown: 0.7, timer: 0.3, speed: 380, sprite: 'bubble', radius: 9 },
        orbit: null,
      },
    };
    enemies = [];
    projectiles = [];
    pickups = [];
    particles = [];
    floatTexts = [];
    modalQueue.length = 0;
    elapsed = 0;
    kills = 0;
    spawnTimer = 0;
    bossTimer = 0;
    waveTimer = 0;
    modalDelay = 0;
    flash = 0;
    ui.portrait.src = spritePath(FORMS.mongsil.sprite);
  }

  // ---------- Effects ----------
  function burst(x, y, n, colors, speed = 150, life = 0.5, size = 4, star = false) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = speed * (0.35 + Math.random() * 0.65);
      particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life, max: life, size, star, color: colors[i % colors.length] });
    }
  }

  function addFloatText(x, y, text, color) {
    if (floatTexts.length < 60) floatTexts.push({ x, y, text, color, life: 0.8 });
  }

  function showBanner(text, kind = '', sub = '') {
    ui.bannerMain.textContent = text;
    ui.bannerSub.textContent = sub;
    ui.banner.className = kind;
    void ui.banner.offsetWidth; // restart the CSS animation
    ui.banner.classList.add('show');
  }

  // ---------- Evolution ----------
  function stageForLevel(level) {
    let stage = 1;
    STAGE_LEVELS.forEach((lv, i) => { if (level >= lv) stage = i + 1; });
    return stage;
  }

  function checkEvolution() {
    const target = stageForLevel(player.level);
    while (player.stage < target) {
      const options = formsAtStage(player.stage + 1).filter((id) => !player.branch || FORMS[id].branch === player.branch);
      if (options.length > 1) {
        if (!modalQueue.some((m) => m.type === 'branch')) modalQueue.unshift({ type: 'branch', options });
        return;
      }
      evolveTo(options[0]);
    }
  }

  function evolveTo(id) {
    const from = FORMS[player.form];
    const to = FORMS[id];
    player.form = id;
    player.stage = to.stage;
    if (to.branch) player.branch = to.branch;
    to.apply(player);
    player.radius = SPRITE_DEFS[to.sprite].size * 0.3;
    player.hp = player.maxHp;
    player.invuln = 1.5;
    player.glow = 1.2;
    flash = 0.45;
    modalDelay = 1.6;
    burst(player.x, player.y, 40, ['#fff6b0', '#ffffff', '#ffc2dc', '#b8ecff'], 280, 0.9, 5, true);
    showBanner(`${from.name} → ${to.name} 진화!`, '', to.desc);
    ui.portrait.src = spritePath(to.sprite);
  }

  function gainXp(amount) {
    player.xp += amount;
    while (player.xp >= player.xpToNext) {
      player.xp -= player.xpToNext;
      player.level++;
      player.xpToNext = Math.floor(player.xpToNext * 1.2 + 5);
      modalQueue.push({ type: 'upgrade' });
      burst(player.x, player.y, 14, ['#fff6b0', '#ffffff', '#b8f0e0'], 120, 0.5, 3);
      checkEvolution();
    }
  }

  // ---------- Choice modals (level-up upgrades & branch evolution) ----------
  function openNextModal() {
    const m = modalQueue.shift();
    if (!m) return;
    state = 'choice';
    ui.banner.classList.remove('show');
    if (m.type === 'branch') {
      showChoice('진화의 갈림길!', `${FORMS[player.form].name}이(가) 어떤 모습으로 진화할까요?`, m.options.map((id) => ({
        img: FORMS[id].sprite, title: FORMS[id].name, desc: FORMS[id].desc, big: true,
        pick: () => { evolveTo(id); checkEvolution(); },
      })));
    } else {
      const offer = shuffled(UPGRADES.filter((u) => (player.picks[u.id] || 0) < u.max)).slice(0, 3);
      if (offer.length < 3) offer.push(SNACK);
      showChoice('레벨 업!', '능력을 하나 골라주세요', offer.map((u) => {
        const n = (player.picks[u.id] || 0) + 1;
        return {
          icon: val(u.icon), title: val(u.title), desc: val(u.desc),
          stars: u.max ? '★'.repeat(n) + '☆'.repeat(u.max - n) : '',
          pick: () => { player.picks[u.id] = n; u.apply(player, n); },
        };
      }));
    }
  }

  function showChoice(title, subtitle, options) {
    ui.choiceTitle.textContent = title;
    ui.choiceSubtitle.textContent = subtitle;
    ui.choiceCards.replaceChildren();
    options.forEach((opt, i) => {
      const card = document.createElement('button');
      card.className = opt.big ? 'card big' : 'card';
      if (opt.img) {
        card.append(pixelImg(opt.img));
      } else {
        const icon = document.createElement('div');
        icon.className = 'icon';
        icon.textContent = opt.icon;
        card.append(icon);
      }
      for (const [cls, text] of [['title', opt.title], ['stars', opt.stars], ['desc', opt.desc], ['key', `[${i + 1}]`]]) {
        if (!text) continue;
        const el = document.createElement('div');
        el.className = cls;
        el.textContent = text;
        card.append(el);
      }
      card.addEventListener('click', () => {
        if (state !== 'choice') return;
        ui.choice.classList.add('hidden');
        state = 'playing';
        opt.pick();
      });
      ui.choiceCards.append(card);
    });
    ui.choice.classList.remove('hidden');
  }

  // ---------- Spawning ----------
  function pickEnemyType() {
    const pool = Object.values(ENEMY_TYPES).filter((t) => !t.boss && elapsed >= (t.minTime || 0));
    let r = Math.random() * pool.reduce((s, t) => s + t.weight, 0);
    for (const t of pool) {
      r -= t.weight;
      if (r <= 0) return t;
    }
    return pool[0];
  }

  function placeOnRing(e, a = Math.random() * Math.PI * 2, d = Math.hypot(viewW, viewH) / 2 + 40) {
    e.x = player.x + Math.cos(a) * d;
    e.y = player.y + Math.sin(a) * d;
  }

  // Enemies get tougher, faster and hit harder the longer the run goes.
  function spawnEnemy(type, angle, distance) {
    const t = elapsed;
    const hp = type.hp * (1 + t / 120 + (t / 300) ** 2);
    const e = {
      type, x: 0, y: 0, hp, maxHp: hp,
      speed: type.speed * (1 + Math.min(t / 360, 0.5)),
      damage: Math.round(type.damage * (1 + t / 180)),
      contactCd: 0, flash: 0, phase: Math.random() * Math.PI * 2,
    };
    placeOnRing(e, angle, distance);
    enemies.push(e);
  }

  // A closing ring of enemies that forces the player to break out.
  function spawnSurroundWave() {
    const type = elapsed >= 180 ? ENEMY_TYPES.mushroom : ENEMY_TYPES.slime;
    const n = 20 + Math.floor(elapsed / 15);
    const r = Math.min(viewW, viewH) / 2 + 60;
    for (let i = 0; i < n; i++) spawnEnemy(type, (i / n) * Math.PI * 2, r);
    showBanner(`${type.name} 떼가 몰려와요!`, 'boss');
  }

  function updateSpawner(dt) {
    spawnTimer -= dt;
    if (spawnTimer <= 0 && enemies.length < MAX_ENEMIES) {
      spawnTimer = clamp(1.0 - elapsed / 160, 0.25, 1.0);
      const n = 1 + Math.floor(elapsed / 60);
      for (let i = 0; i < n; i++) spawnEnemy(pickEnemyType());
    }
    if (elapsed >= ENEMY_TYPES.bat.minTime) {
      bossTimer -= dt;
      if (bossTimer <= 0) {
        bossTimer = EVENT_INTERVAL;
        spawnEnemy(ENEMY_TYPES.bat);
        showBanner(`${ENEMY_TYPES.bat.name} 등장!`, 'boss');
      }
    }
    if (elapsed >= WAVE_START) {
      waveTimer -= dt;
      if (waveTimer <= 0) {
        waveTimer = EVENT_INTERVAL;
        spawnSurroundWave();
      }
    }
  }

  // ---------- Combat ----------
  function nearestEnemy(range) {
    let best = null, bestD = range * range;
    for (const e of enemies) {
      const dx = e.x - player.x, dy = e.y - player.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < bestD) { bestD = d2; best = e; }
    }
    return best;
  }

  function damageEnemy(e, idx, amount, kx, ky) {
    e.hp -= amount;
    e.flash = 0.1;
    const k = Math.hypot(kx, ky) || 1;
    const push = e.type.boss ? 1 : 6;
    e.x += (kx / k) * push;
    e.y += (ky / k) * push;
    addFloatText(e.x, e.y - e.type.radius, String(Math.round(amount)), '#fff');
    if (e.hp <= 0) killEnemy(e, idx);
  }

  function killEnemy(e, idx) {
    kills++;
    enemies.splice(idx, 1);
    burst(e.x, e.y, e.type.boss ? 24 : 8, ['#ffffff', '#fff0b3', '#ffd1e0'], e.type.boss ? 200 : 110, 0.4, 4);
    pickups.push({ kind: e.type.xp >= 20 ? 'gem_big' : 'gem', value: e.type.xp, x: e.x, y: e.y });
    if (e.type.boss || Math.random() < 0.025) {
      pickups.push({ kind: 'heart', value: 25, x: e.x + 14, y: e.y + 6 });
    }
  }

  function fireShot(dt) {
    const w = player.weapons.shot;
    w.timer -= dt;
    if (w.timer > 0) return;
    const target = nearestEnemy(520);
    if (!target) return;
    w.timer = w.cooldown;
    const base = Math.atan2(target.y - player.y, target.x - player.x);
    for (let i = 0; i < w.count; i++) {
      const a = base + (i - (w.count - 1) / 2) * 0.22;
      projectiles.push({
        x: player.x, y: player.y, vx: Math.cos(a) * w.speed, vy: Math.sin(a) * w.speed,
        damage: w.damage, pierce: w.pierce, radius: w.radius, sprite: w.sprite,
        life: 1.5, hit: new Set(),
      });
    }
  }

  function orbitPoints() {
    const w = player.weapons.orbit;
    if (!w) return [];
    const r = w.dist + player.radius;
    const pts = [];
    for (let i = 0; i < w.count; i++) {
      const a = w.angle + (i / w.count) * Math.PI * 2;
      pts.push({ x: player.x + Math.cos(a) * r, y: player.y + Math.sin(a) * r });
    }
    return pts;
  }

  // ---------- Update ----------
  function movePlayer(dt) {
    let dx = 0, dy = 0;
    if (keys.has('KeyW') || keys.has('ArrowUp')) dy -= 1;
    if (keys.has('KeyS') || keys.has('ArrowDown')) dy += 1;
    if (keys.has('KeyA') || keys.has('ArrowLeft')) dx -= 1;
    if (keys.has('KeyD') || keys.has('ArrowRight')) dx += 1;
    player.moving = dx !== 0 || dy !== 0;
    if (player.moving) {
      const len = Math.hypot(dx, dy);
      player.x += (dx / len) * player.speed * dt;
      player.y += (dy / len) * player.speed * dt;
      if (dx !== 0) player.facing = dx;
    }
    if (player.regen > 0) player.hp = Math.min(player.maxHp, player.hp + player.regen * dt);
    if (player.invuln > 0) player.invuln -= dt;
    if (player.glow > 0) player.glow -= dt;
  }

  function updateEnemies(dt) {
    const farLimit = Math.hypot(viewW, viewH) * 0.85;
    for (const e of enemies) {
      const dx = player.x - e.x, dy = player.y - e.y;
      const d = Math.hypot(dx, dy) || 1;
      if (d > farLimit) { placeOnRing(e); continue; }
      e.x += (dx / d) * e.speed * dt;
      e.y += (dy / d) * e.speed * dt;
      if (e.flash > 0) e.flash -= dt;
      if (e.contactCd > 0) e.contactCd -= dt;
      if (d < e.type.radius + player.radius * 0.8 && e.contactCd <= 0 && player.invuln <= 0) {
        player.hp -= e.damage;
        player.invuln = 0.5;
        e.contactCd = 0.6;
        addFloatText(player.x, player.y - player.radius - 6, `-${e.damage}`, '#ff6b8e');
        if (player.hp <= 0) {
          player.hp = 0;
          gameOver();
          return;
        }
      }
    }
    // Push overlapping enemies apart so they don't stack into one blob.
    for (let i = 0; i < enemies.length; i++) {
      const a = enemies[i];
      for (let j = i + 1; j < enemies.length; j++) {
        const b = enemies[j];
        const min = (a.type.radius + b.type.radius) * 0.8;
        const dx = b.x - a.x, dy = b.y - a.y;
        if (Math.abs(dx) > min || Math.abs(dy) > min) continue;
        const d2 = dx * dx + dy * dy;
        if (d2 >= min * min || d2 === 0) continue;
        const d = Math.sqrt(d2);
        const push = (min - d) / 2;
        a.x -= (dx / d) * push;
        a.y -= (dy / d) * push;
        b.x += (dx / d) * push;
        b.y += (dy / d) * push;
      }
    }
  }

  function updateProjectiles(dt) {
    for (let i = projectiles.length - 1; i >= 0; i--) {
      const p = projectiles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      let dead = p.life <= 0;
      for (let j = enemies.length - 1; j >= 0 && !dead; j--) {
        const e = enemies[j];
        if (p.hit.has(e) || dist(p.x, p.y, e.x, e.y) >= p.radius + e.type.radius) continue;
        p.hit.add(e);
        damageEnemy(e, j, p.damage, p.vx, p.vy);
        if (--p.pierce <= 0) dead = true;
      }
      if (dead) projectiles.splice(i, 1);
    }
  }

  function updateOrbit(dt) {
    const w = player.weapons.orbit;
    if (!w) return;
    w.angle += dt * 2.6;
    for (const [e, t] of w.hits) {
      if (t <= dt) w.hits.delete(e);
      else w.hits.set(e, t - dt);
    }
    for (const pt of orbitPoints()) {
      for (let j = enemies.length - 1; j >= 0; j--) {
        const e = enemies[j];
        if (w.hits.has(e) || dist(pt.x, pt.y, e.x, e.y) >= 12 + e.type.radius) continue;
        w.hits.set(e, 0.4);
        damageEnemy(e, j, w.damage, e.x - player.x, e.y - player.y);
      }
    }
  }

  function updatePickups(dt) {
    for (let i = pickups.length - 1; i >= 0; i--) {
      const it = pickups[i];
      const d = dist(player.x, player.y, it.x, it.y);
      if (it.vel || d < player.pickupRadius) {
        it.vel = (it.vel || 160) + 900 * dt;
        const step = Math.min(it.vel * dt, d);
        it.x += ((player.x - it.x) / (d || 1)) * step;
        it.y += ((player.y - it.y) / (d || 1)) * step;
      }
      if (dist(player.x, player.y, it.x, it.y) < player.radius + 6) {
        pickups.splice(i, 1);
        if (it.kind === 'heart') {
          player.hp = Math.min(player.maxHp, player.hp + it.value);
          addFloatText(player.x, player.y - player.radius - 6, `+${it.value}`, '#ff8fb4');
        } else {
          gainXp(it.value);
        }
      }
    }
  }

  function updateEffects(dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      const drag = Math.max(0, 1 - 4 * dt);
      p.vx *= drag;
      p.vy *= drag;
      p.life -= dt;
      if (p.life <= 0) particles.splice(i, 1);
    }
    for (let i = floatTexts.length - 1; i >= 0; i--) {
      const f = floatTexts[i];
      f.y -= 32 * dt;
      f.life -= dt;
      if (f.life <= 0) floatTexts.splice(i, 1);
    }
    if (flash > 0) flash -= dt;
  }

  function update(dt) {
    elapsed += dt;
    modalDelay -= dt;
    movePlayer(dt);
    updateSpawner(dt);
    updateEnemies(dt);
    if (state !== 'playing') return;
    fireShot(dt);
    updateProjectiles(dt);
    updateOrbit(dt);
    updatePickups(dt);
    updateEffects(dt);
    if (modalQueue.length && modalDelay <= 0) openNextModal();
    updateHud();
  }

  function updateHud() {
    ui.hpBar.style.width = `${clamp(player.hp / player.maxHp, 0, 1) * 100}%`;
    ui.hpText.textContent = `${Math.ceil(player.hp)} / ${Math.round(player.maxHp)}`;
    ui.xpBar.style.width = `${clamp(player.xp / player.xpToNext, 0, 1) * 100}%`;
    ui.level.textContent = `Lv.${player.level}`;
    ui.formName.textContent = FORMS[player.form].name;
    ui.kills.textContent = `${kills}마리 처치`;
    ui.timer.textContent = fmtTime(elapsed);
    ui.evoHint.textContent = player.stage < STAGE_LEVELS.length
      ? `다음 진화: Lv.${STAGE_LEVELS[player.stage]}`
      : '최종 진화 완료!';
  }

  // ---------- Render ----------
  function drawShadow(x, y, r) {
    ctx.fillStyle = 'rgba(70, 110, 50, 0.22)';
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawPlayer() {
    const r = player.radius;
    if (player.glow > 0) {
      const g = ctx.createRadialGradient(player.x, player.y, 0, player.x, player.y, r * 3.2);
      g.addColorStop(0, `rgba(255, 250, 210, ${Math.min(1, player.glow)})`);
      g.addColorStop(1, 'rgba(255, 250, 210, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(player.x, player.y, r * 3.2, 0, Math.PI * 2);
      ctx.fill();
    }
    drawShadow(player.x, player.y + r * 0.9, r * 1.05);
    const speed = player.moving ? 14 : 4;
    const amp = player.moving ? 0.07 : 0.035;
    const b = Math.sin(anim * speed);
    const hop = player.moving ? Math.abs(Math.sin(anim * speed / 2)) * 3 : 0;
    const blink = player.invuln > 0 && player.glow <= 0 && Math.floor(anim * 20) % 2 === 0;
    // Our art faces left (tail on the right), so flip when walking right.
    drawSprite(FORMS[player.form].sprite, player.x, player.y - hop, {
      flip: player.facing > 0, sx: 1 - amp * b, sy: 1 + amp * b, groundR: r, alpha: blink ? 0.45 : 1,
    });
  }

  function drawEnemy(e) {
    const t = e.type;
    const r = t.radius;
    drawShadow(e.x, e.y + r * 0.85, r);
    const b = Math.sin(anim * 9 + e.phase);
    drawSprite(t.sprite, e.x, e.y, { sx: 1 + 0.05 * b, sy: 1 - 0.05 * b, groundR: r, flash: e.flash > 0 });
    if (t.boss || e.hp < e.maxHp) {
      const w = t.boss ? 56 : 26;
      const x = Math.round(e.x - w / 2), y = Math.round(e.y - t.barY);
      ctx.fillStyle = 'rgba(80, 50, 80, 0.75)';
      ctx.fillRect(x - 1, y - 1, w + 2, 6);
      ctx.fillStyle = '#fff';
      ctx.fillRect(x, y, w, 4);
      ctx.fillStyle = t.boss ? '#b58cf0' : '#ff7fa8';
      ctx.fillRect(x, y, w * clamp(e.hp / e.maxHp, 0, 1), 4);
    }
  }

  function render() {
    const camX = Math.round(player.x - viewW / 2);
    const camY = Math.round(player.y - viewH / 2);
    ctx.save();
    ctx.translate(-camX, -camY);

    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = bgPattern || '#cfeaa9';
    ctx.fillRect(camX, camY, viewW, viewH);

    for (const it of pickups) drawSprite(it.kind, it.x, it.y + Math.sin(anim * 5 + it.x) * 2);

    enemies.sort((a, b) => a.y - b.y);
    let playerDrawn = false;
    for (const e of enemies) {
      if (!playerDrawn && e.y > player.y) {
        drawPlayer();
        playerDrawn = true;
      }
      drawEnemy(e);
    }
    if (!playerDrawn) drawPlayer();

    for (const pt of orbitPoints()) drawSprite('star', pt.x, pt.y, { rot: anim * 4 });
    for (const p of projectiles) drawSprite(p.sprite, p.x, p.y, { rot: Math.atan2(p.vy, p.vx) });

    for (const p of particles) {
      ctx.globalAlpha = clamp(p.life / p.max, 0, 1);
      ctx.fillStyle = p.color;
      const s = Math.max(1, p.size * (0.5 + 0.5 * p.life / p.max));
      if (p.star) {
        ctx.fillRect(p.x - s * 1.5, p.y - s / 2, s * 3, s);
        ctx.fillRect(p.x - s / 2, p.y - s * 1.5, s, s * 3);
      } else {
        ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s);
      }
    }
    ctx.globalAlpha = 1;

    ctx.font = '18px Jua, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(80, 50, 80, 0.85)';
    for (const f of floatTexts) {
      ctx.globalAlpha = clamp(f.life / 0.3, 0, 1);
      ctx.strokeText(f.text, f.x, f.y);
      ctx.fillStyle = f.color;
      ctx.fillText(f.text, f.x, f.y);
    }
    ctx.globalAlpha = 1;
    ctx.restore();

    if (flash > 0) {
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, flash * 1.6)})`;
      ctx.fillRect(0, 0, viewW, viewH);
    }
  }

  // ---------- Screens ----------
  function buildEvoChart() {
    const node = (id) => {
      const f = FORMS[id];
      const el = document.createElement('div');
      el.className = 'evo-node';
      const name = document.createElement('span');
      name.textContent = f.name;
      const lv = document.createElement('small');
      lv.textContent = `Lv.${STAGE_LEVELS[f.stage - 1]}`;
      el.append(pixelImg(f.sprite), name, lv);
      return el;
    };
    const arrow = () => {
      const a = document.createElement('div');
      a.className = 'evo-arrow';
      a.textContent = '▶';
      return a;
    };
    const branches = document.createElement('div');
    branches.className = 'evo-branches';
    for (const id3 of formsAtStage(3)) {
      const id4 = formsAtStage(4).find((id) => FORMS[id].branch === FORMS[id3].branch);
      const row = document.createElement('div');
      row.className = 'evo-row';
      row.append(node(id3), arrow(), node(id4));
      branches.append(row);
    }
    ui.evoChart.append(node(formsAtStage(1)[0]), arrow(), node(formsAtStage(2)[0]), arrow(), branches);
  }

  function startGame() {
    if (state !== 'title' && state !== 'gameover') return;
    resetGame();
    for (const el of [ui.start, ui.gameover, ui.choice, ui.pause]) el.classList.add('hidden');
    ui.hud.classList.remove('hidden');
    updateHud();
    state = 'playing';
  }

  function gameOver() {
    state = 'gameover';
    const f = FORMS[player.form];
    ui.gameoverPortrait.src = spritePath(f.sprite);
    ui.gameoverStats.textContent = `${f.name} · Lv.${player.level} · ${fmtTime(elapsed)} 생존 · ${kills}마리 처치`;
    ui.hud.classList.add('hidden');
    ui.gameover.classList.remove('hidden');
  }

  function togglePause() {
    if (state === 'playing') {
      state = 'paused';
      ui.pause.classList.remove('hidden');
    } else if (state === 'paused') {
      state = 'playing';
      ui.pause.classList.add('hidden');
    }
  }

  // e.code is layout-independent, so WASD still works with the Korean IME on.
  window.addEventListener('keydown', (e) => {
    keys.add(e.code);
    if (e.repeat) return;
    if (e.code === 'KeyP' || e.code === 'Escape') togglePause();
    if (state === 'choice' && /^Digit[1-3]$/.test(e.code)) {
      const card = ui.choiceCards.children[Number(e.code.slice(5)) - 1];
      if (card) card.click();
    }
    if (e.code === 'Enter' || e.code === 'Space') startGame();
  });
  window.addEventListener('keyup', (e) => keys.delete(e.code));
  window.addEventListener('blur', () => keys.clear());
  $('start-btn').addEventListener('click', startGame);
  $('restart-btn').addEventListener('click', startGame);

  // ---------- Main loop ----------
  let lastTime = 0;
  function frame(ts) {
    const dt = Math.min((ts - lastTime) / 1000 || 0, 0.05);
    lastTime = ts;
    if (state === 'playing' || state === 'title') anim += dt;
    if (state === 'playing') update(dt);
    render();
    requestAnimationFrame(frame);
  }

  buildEvoChart();
  preloadAssets().then(() => {
    buildBackground();
    resetGame();
    requestAnimationFrame(frame);
  });
})();
