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
    portrait: $('portrait'), evoHint: $('evo-hint'), weaponRow: $('weapon-row'),
    banner: $('banner'), bannerMain: $('banner-main'), bannerSub: $('banner-sub'),
    start: $('start-screen'), evoChart: $('evo-chart'), dexCount: $('dex-count'), secretHints: $('secret-hints'),
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
    piyak: { size: 48, color: '#ffde5f', emoji: '🐤' },
    jjaek: { size: 48, color: '#ffc850', emoji: '🐦' },
    jjirit: { size: 60, color: '#ffd746', emoji: '⚡' },
    beongae: { size: 72, color: '#ffc832', emoji: '⚡' },
    sallang: { size: 60, color: '#82dec3', emoji: '🍃' },
    hoeori: { size: 72, color: '#69cdc8', emoji: '🌀' },
    mungchi: { size: 48, color: '#f2dec8', emoji: '🐾' },
    meongmung: { size: 48, color: '#e4b480', emoji: '🐶' },
    seori: { size: 60, color: '#bee1ff', emoji: '❄️' },
    nunbora: { size: 72, color: '#a0cdfa', emoji: '❄️' },
    bawi: { size: 60, color: '#af8764', emoji: '🪨' },
    sanmaek: { size: 72, color: '#96785f', emoji: '⛰️' },
    nyangkong: { size: 48, color: '#dac6ff', emoji: '🐱' },
    nyangnyang: { size: 48, color: '#cdb4fa', emoji: '🐱' },
    dalbit: { size: 60, color: '#7d87d7', emoji: '🌙' },
    eunha: { size: 72, color: '#6964c3', emoji: '🌌' },
    satang: { size: 60, color: '#ffafd4', emoji: '🍭' },
    chukje: { size: 72, color: '#ffa0be', emoji: '🎉' },
    pongdang: { size: 48, color: '#aae1ff', emoji: '💧' },
    cheombeong: { size: 48, color: '#e4ecf6', emoji: '🦭' },
    pado: { size: 60, color: '#78b9f0', emoji: '🌊' },
    haeil: { size: 72, color: '#5096e6', emoji: '🌊' },
    sanho: { size: 60, color: '#ffaa9b', emoji: '🪸' },
    jinju: { size: 72, color: '#ffd7e1', emoji: '🦪' },
    mujigae: { size: 72, color: '#faf8ff', emoji: '🌈' },
    byeolttong: { size: 72, color: '#464b8c', emoji: '🌠' },
    hwanggeum: { size: 72, color: '#ffc846', emoji: '👑' },
    kkum: { size: 72, color: '#e1cdff', emoji: '💤' },
    badayojeong: { size: 72, color: '#8cdce6', emoji: '🧚' },
    slime: { size: 48, color: '#ffde73', emoji: '💧' },
    mushroom: { size: 48, color: '#f06464', emoji: '🍄' },
    bee: { size: 48, color: '#ffd750', emoji: '🐝' },
    turtle: { size: 48, color: '#78b46e', emoji: '🐢' },
    ghost: { size: 48, color: '#eee8ff', emoji: '👻' },
    snowman: { size: 48, color: '#f8faff', emoji: '⛄' },
    jelly: { size: 48, color: '#ffa0c8', emoji: '🍮' },
    bat: { size: 64, color: '#a070de', emoji: '🦇' },
    cloudking: { size: 64, color: '#aaa5cd', emoji: '⛈️' },
    kingshroom: { size: 64, color: '#b96ee1', emoji: '🍄' },
    bubble: { size: 24, color: '#aae1ff' },
    fireball: { size: 28, color: '#ff9646' },
    leaf: { size: 24, color: '#87d46e' },
    feather: { size: 24, color: '#fff6d7' },
    star: { size: 28, color: '#ffe164', emoji: '⭐' },
    gem: { size: 20, color: '#78e1c8' },
    gem_big: { size: 24, color: '#ff96cd' },
    heart: { size: 24, color: '#ff6987', emoji: '❤' },
    candy: { size: 24, color: '#ff96be', emoji: '🍬' },
    magnet: { size: 24, color: '#ff5f6e', emoji: '🧲' },
    bomb: { size: 24, color: '#5a556e', emoji: '💣' },
    chest: { size: 28, color: '#cd8c55', emoji: '🎁' },
    fairy: { size: 24, color: '#aae6ff', emoji: '🧚' },
    shell: { size: 20, color: '#ff8c78' },
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

  // ---------- Weapons ----------
  // Every weapon has a level (1..max). Cooldowns are scaled by player.haste.
  const MAX_WEAPONS = 4;

  const WEAPONS = {
    shot: {
      name: () => ({ fire: '불꽃탄', leaf: '잎새탄' }[player.branch] || '방울탄'),
      icon: () => ({ fire: '🔥', leaf: '🍃' }[player.branch] || '💧'),
      desc: '가장 가까운 적에게 탄을 쏴요',
      up: '데미지 +4, 2단계마다 발사 수 +1',
      max: 7,
      create: () => ({ damage: 10, count: 1, pierce: 1, cooldown: 0.7, timer: 0.3, speed: 380, sprite: 'bubble', radius: 9 }),
      upgrade(w) { w.damage += 4; if (w.level % 2 === 1) w.count++; },
      update(w, dt) {
        if ((w.timer -= dt) > 0) return;
        const target = nearestEnemy(520);
        if (!target) return;
        w.timer = w.cooldown * player.haste;
        const base = Math.atan2(target.y - player.y, target.x - player.x);
        const n = w.count + player.extra;
        for (let i = 0; i < n; i++) {
          const a = base + (i - (n - 1) / 2) * 0.22;
          projectiles.push({
            x: player.x, y: player.y, vx: Math.cos(a) * w.speed, vy: Math.sin(a) * w.speed,
            damage: w.damage, pierce: w.pierce, radius: w.radius, sprite: w.sprite, life: 1.5, hit: new Set(),
          });
        }
      },
    },
    orbit: {
      name: () => '별빛 수호',
      icon: () => '⭐',
      desc: '주위를 빙글빙글 도는 별이 적을 막아줘요',
      up: '별 +1개, 별 데미지 +3',
      max: 6,
      create: () => ({ count: 1, damage: 8, dist: 58, angle: 0, hits: new Map() }),
      upgrade(w) { w.count++; w.damage += 3; },
      update(w, dt) {
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
      },
    },
    boomerang: {
      name: () => (player.branch === 'wind' ? '회오리 깃털' : '깃털 부메랑'),
      icon: () => '🪶',
      desc: '날아갔다 돌아오며 길 위의 적을 모두 때려요',
      up: '데미지 +5, 2단계마다 깃털 +1',
      max: 6,
      create: () => ({ damage: 12, count: 1, cooldown: 1.3, timer: 0.4, range: 230, speed: 420 }),
      upgrade(w) { w.damage += 5; if (w.level % 2 === 0) w.count++; },
      update(w, dt) {
        if ((w.timer -= dt) > 0) return;
        const target = nearestEnemy(450);
        if (!target) return;
        w.timer = w.cooldown * player.haste;
        const base = Math.atan2(target.y - player.y, target.x - player.x);
        const n = w.count + player.extra;
        for (let i = 0; i < n; i++) {
          const a = base + (i - (n - 1) / 2) * 0.5;
          projectiles.push({
            kind: 'boomerang', x: player.x, y: player.y, vx: Math.cos(a) * w.speed, vy: Math.sin(a) * w.speed,
            damage: w.damage, pierce: Infinity, radius: 12, sprite: 'feather', life: 4,
            traveled: 0, range: w.range, returning: false, hit: new Set(),
          });
        }
      },
    },
    lightning: {
      name: () => '번개',
      icon: () => '⚡',
      desc: '주변의 적에게 번개가 떨어져요',
      up: '번개 +1개, 데미지 +6',
      max: 6,
      create: () => ({ damage: 20, count: 1, cooldown: 1.8, timer: 0.8, range: 420 }),
      upgrade(w) { w.count++; w.damage += 6; },
      update(w, dt) {
        if ((w.timer -= dt) > 0) return;
        const near = enemies.filter((e) => dist(e.x, e.y, player.x, player.y) < w.range);
        if (!near.length) return;
        w.timer = w.cooldown * player.haste;
        for (const e of shuffled(near).slice(0, w.count)) {
          fx.push({ kind: 'bolt', x: e.x, y: e.y, life: 0.25, max: 0.25, seed: Math.random() * 100 });
          damageEnemy(e, enemies.indexOf(e), w.damage, 0, 0);
        }
      },
    },
    aura: {
      name: () => '서리 오라',
      icon: () => '❄️',
      desc: '주변 적을 얼려서 느리게 하고 계속 아프게 해요',
      up: '범위 +10, 데미지 +3',
      max: 6,
      create: () => ({ damage: 5, radius: 70, tick: 0.5, timer: 0, slow: 0.35 }),
      upgrade(w) { w.radius += 10; w.damage += 3; },
      update(w, dt) {
        if ((w.timer -= dt) > 0) return;
        w.timer = w.tick;
        for (let j = enemies.length - 1; j >= 0; j--) {
          const e = enemies[j];
          if (dist(e.x, e.y, player.x, player.y) < w.radius * player.area + e.type.radius) damageEnemy(e, j, w.damage, 0, 0, 0, true);
        }
      },
    },
    quake: {
      name: () => '박치기 충격파',
      icon: () => '💥',
      desc: '주기적으로 둥글게 퍼지는 충격파로 적을 밀쳐내요',
      up: '데미지 +6, 범위 +15',
      max: 6,
      create: () => ({ damage: 16, radius: 110, cooldown: 1.4, timer: 0.6 }),
      upgrade(w) { w.damage += 6; w.radius += 15; },
      update(w, dt) {
        if ((w.timer -= dt) > 0) return;
        const radius = w.radius * player.area;
        if (!nearestEnemy(radius + 40)) return;
        w.timer = w.cooldown * player.haste;
        fx.push({ kind: 'ring', x: player.x, y: player.y, r: radius, life: 0.35, max: 0.35 });
        for (let j = enemies.length - 1; j >= 0; j--) {
          const e = enemies[j];
          if (dist(e.x, e.y, player.x, player.y) < radius + e.type.radius) {
            damageEnemy(e, j, w.damage, e.x - player.x, e.y - player.y, 24);
          }
        }
      },
    },
  };

  Object.assign(WEAPONS, {
    beam: {
      name: () => '별빛 빔',
      icon: () => '🌈',
      desc: '적을 꿰뚫는 긴 빛줄기를 쏴요',
      up: '데미지 +7, 3단계마다 빔 +1',
      max: 6,
      create: () => ({ damage: 18, count: 1, cooldown: 2.0, timer: 0.5, length: 360, width: 14 }),
      upgrade(w) { w.damage += 7; if (w.level % 3 === 0) w.count++; },
      update(w, dt) {
        if ((w.timer -= dt) > 0) return;
        const target = nearestEnemy(w.length);
        if (!target) return;
        w.timer = w.cooldown * player.haste;
        const base = Math.atan2(target.y - player.y, target.x - player.x);
        const n = w.count + player.extra;
        for (let i = 0; i < n; i++) {
          const a = base + (i - (n - 1) / 2) * 0.35;
          const cx = Math.cos(a), cy = Math.sin(a);
          fx.push({ kind: 'beam', x: player.x, y: player.y, a, len: w.length, w: w.width, life: 0.3, max: 0.3 });
          for (let j = enemies.length - 1; j >= 0; j--) {
            const e = enemies[j];
            const rx = e.x - player.x, ry = e.y - player.y;
            const along = rx * cx + ry * cy;
            if (along < 0 || along > w.length) continue;
            if (Math.abs(rx * cy - ry * cx) < w.width + e.type.radius) damageEnemy(e, j, w.damage, cx, cy);
          }
        }
      },
    },
    firework: {
      name: () => '폭죽',
      icon: () => '🎆',
      desc: '적 무리 위로 폭죽을 쏘아 펑 터뜨려요',
      up: '데미지 +6, 폭발 범위 +8, 2단계마다 폭죽 +1',
      max: 6,
      create: () => ({ damage: 16, count: 1, cooldown: 1.5, timer: 0.4, radius: 55 }),
      upgrade(w) { w.damage += 6; w.radius += 8; if (w.level % 2 === 0) w.count++; },
      update(w, dt) {
        if ((w.timer -= dt) > 0) return;
        const near = enemies.filter((e) => dist(e.x, e.y, player.x, player.y) < 420);
        if (!near.length) return;
        w.timer = w.cooldown * player.haste;
        for (const e of shuffled(near).slice(0, w.count + player.extra)) {
          shells.push({ sx: player.x, sy: player.y, tx: e.x, ty: e.y, t: 0, dur: 0.5, damage: w.damage, radius: w.radius * player.area });
        }
      },
    },
    fairy: {
      name: () => '방울 요정',
      icon: () => '🧚',
      desc: '요정들이 적을 쫓아가서 콕 때려요',
      up: '데미지 +3, 요정 +1',
      max: 6,
      create: () => ({ damage: 9, count: 2, cooldown: 1.1, timer: 0.3, speed: 300 }),
      upgrade(w) { w.damage += 3; w.count++; },
      update(w, dt) {
        if ((w.timer -= dt) > 0) return;
        if (!nearestEnemy(500)) return;
        w.timer = w.cooldown * player.haste;
        const n = w.count + player.extra;
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2 + anim;
          projectiles.push({
            kind: 'homing', x: player.x, y: player.y, vx: Math.cos(a) * w.speed, vy: Math.sin(a) * w.speed,
            speed: w.speed, damage: w.damage, pierce: 1, radius: 9, sprite: 'fairy', life: 2.5, hit: new Set(),
          });
        }
      },
    },
    thorn: {
      name: () => (player.branch === 'coral' ? '산호 가시' : '가시 덩굴'),
      icon: () => '🌵',
      desc: '지나간 자리에 가시밭을 남겨 적을 찌르고 느리게 해요',
      up: '데미지 +3, 가시밭 크기 +6, 유지시간 +0.5초',
      max: 6,
      create: () => ({ damage: 6, radius: 34, life: 3, cooldown: 0.7, timer: 0 }),
      upgrade(w) { w.damage += 3; w.radius += 6; w.life += 0.5; },
      update(w, dt) {
        if ((w.timer -= dt) > 0) return;
        w.timer = w.cooldown * player.haste;
        zones.push({ x: player.x, y: player.y, r: w.radius * player.area, damage: w.damage, life: w.life, max: w.life, tick: 0, seed: Math.random() * 10 });
      },
    },
  });

  function grantWeapon(p, id, times = 1) {
    for (let i = 0; i < times; i++) {
      const w = p.weapons[id];
      if (!w) p.weapons[id] = { ...WEAPONS[id].create(), level: 1 };
      else { w.level++; WEAPONS[id].upgrade(w); }
    }
    return p.weapons[id];
  }


  // Secret forms: stage 4 alternatives that only appear when their condition is met at Lv.13.
  const SECRET_DESC = '비밀 진화! 모든 무기 +1단계, 대기시간 -15%, 최대 HP +50';
  function secretBoost(p) {
    p.maxHp += 50;
    p.haste *= 0.85;
    for (const id of Object.keys(p.weapons)) grantWeapon(p, id);
  }

  // ---------- Starters & evolution lines ----------
  // STAGE_LEVELS[i] = level at which stage i+1 is reached.
  const STAGE_LEVELS = [1, 4, 8, 13];

  const LINES = {
    water: { starter: 'mongsil', desc: '균형형 · 방울탄으로 시작', hp: 100, speed: 190, weapon: 'shot' },
    bird: { starter: 'piyak', desc: '날쌘형 · 깃털 부메랑으로 시작 (HP 낮음)', hp: 85, speed: 215, weapon: 'boomerang' },
    beast: { starter: 'mungchi', desc: '튼튼형 · 충격파로 시작 (느림)', hp: 125, speed: 175, weapon: 'quake' },
    cat: { starter: 'nyangkong', desc: '마법형 · 폭죽으로 시작', hp: 95, speed: 195, weapon: 'firework' },
    seal: { starter: 'pongdang', desc: '친구형 · 방울 요정으로 시작', hp: 110, speed: 185, weapon: 'fairy' },
  };

  const FORMS = {
    // 몽실이 계열
    mongsil: { line: 'water', stage: 1, name: '몽실이', sprite: 'mongsil', apply() {} },
    kkomul: {
      line: 'water', stage: 2, name: '꼬물룡', sprite: 'kkomul',
      desc: '최대 HP +20, 방울탄 강화',
      apply(p) { p.maxHp += 20; grantWeapon(p, 'shot'); },
    },
    hwareu: {
      line: 'water', stage: 3, branch: 'fire', name: '화르룡', sprite: 'hwareu',
      desc: '공격형! 방울탄이 불꽃탄으로 바뀌어요. 데미지 ×1.4, 최대 HP +20',
      apply(p) {
        const w = grantWeapon(p, 'shot', 0) || grantWeapon(p, 'shot');
        p.maxHp += 20;
        w.damage *= 1.4;
        w.sprite = 'fireball';
        w.radius = 11;
      },
    },
    ipsae: {
      line: 'water', stage: 3, branch: 'leaf', name: '잎새룡', sprite: 'ipsae',
      desc: '생존형! 잎새탄 + 별빛 수호 강화, 초당 회복 +1.5, 속도 +10%, 최대 HP +30',
      apply(p) {
        p.maxHp += 30;
        p.regen += 1.5;
        p.speed *= 1.1;
        if (p.weapons.shot) p.weapons.shot.sprite = 'leaf';
        grantWeapon(p, 'orbit');
      },
    },
    taeyang: {
      line: 'water', stage: 4, branch: 'fire', name: '태양룡', sprite: 'taeyang',
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
      line: 'water', stage: 4, branch: 'leaf', name: '꽃잎룡', sprite: 'kkotip',
      desc: '별빛 수호 2단계 강화, 별 데미지 ×1.5, 초당 회복 +2',
      apply(p) {
        p.maxHp += 40;
        p.regen += 2;
        grantWeapon(p, 'orbit', 2).damage *= 1.5;
      },
    },

    // 삐약이 계열
    piyak: { line: 'bird', stage: 1, name: '삐약이', sprite: 'piyak', apply() {} },
    jjaek: {
      line: 'bird', stage: 2, name: '짹짹이', sprite: 'jjaek',
      desc: '최대 HP +20, 깃털 부메랑 강화',
      apply(p) { p.maxHp += 20; grantWeapon(p, 'boomerang'); },
    },
    jjirit: {
      line: 'bird', stage: 3, branch: 'thunder', name: '찌릿새', sprite: 'jjirit',
      desc: '번개형! 번개 2단계 획득·강화, 속도 +10%, 최대 HP +20',
      apply(p) { p.maxHp += 20; p.speed *= 1.1; grantWeapon(p, 'lightning', 2); },
    },
    sallang: {
      line: 'bird', stage: 3, branch: 'wind', name: '살랑새', sprite: 'sallang',
      desc: '바람형! 깃털 부메랑 2단계 강화, 깃털 데미지 ×1.3, 속도 +15%',
      apply(p) { p.maxHp += 20; p.speed *= 1.15; grantWeapon(p, 'boomerang', 2).damage *= 1.3; },
    },
    beongae: {
      line: 'bird', stage: 4, branch: 'thunder', name: '번개왕새', sprite: 'beongae',
      desc: '번개 2단계 강화, 번개 데미지 ×1.5, 번개 대기시간 -25%',
      apply(p) {
        const w = grantWeapon(p, 'lightning', 2);
        p.maxHp += 30;
        w.damage *= 1.5;
        w.cooldown *= 0.75;
      },
    },
    hoeori: {
      line: 'bird', stage: 4, branch: 'wind', name: '회오리새', sprite: 'hoeori',
      desc: '깃털 +2개, 깃털 데미지 ×1.4, 사거리 증가',
      apply(p) {
        const w = grantWeapon(p, 'boomerang', 0) || grantWeapon(p, 'boomerang');
        p.maxHp += 30;
        w.count += 2;
        w.damage *= 1.4;
        w.range += 60;
      },
    },

    // 뭉치 계열
    mungchi: { line: 'beast', stage: 1, name: '뭉치', sprite: 'mungchi', apply() {} },
    meongmung: {
      line: 'beast', stage: 2, name: '멍뭉이', sprite: 'meongmung',
      desc: '최대 HP +25, 충격파 강화',
      apply(p) { p.maxHp += 25; grantWeapon(p, 'quake'); },
    },
    seori: {
      line: 'beast', stage: 3, branch: 'ice', name: '서리늑대', sprite: 'seori',
      desc: '얼음형! 서리 오라 2단계 획득·강화, 오라 범위 +20, 최대 HP +25',
      apply(p) { p.maxHp += 25; grantWeapon(p, 'aura', 2).radius += 20; },
    },
    bawi: {
      line: 'beast', stage: 3, branch: 'rock', name: '바위곰', sprite: 'bawi',
      desc: '바위형! 충격파 데미지 ×1.4, 범위 +25, 최대 HP +40',
      apply(p) {
        const w = grantWeapon(p, 'quake', 0) || grantWeapon(p, 'quake');
        p.maxHp += 40;
        w.damage *= 1.4;
        w.radius += 25;
      },
    },
    nunbora: {
      line: 'beast', stage: 4, branch: 'ice', name: '눈보라늑대', sprite: 'nunbora',
      desc: '서리 오라 데미지 ×1.8, 범위 +30, 적을 더 느리게',
      apply(p) {
        const w = grantWeapon(p, 'aura', 0) || grantWeapon(p, 'aura');
        p.maxHp += 30;
        w.damage *= 1.8;
        w.radius += 30;
        w.slow = 0.55;
      },
    },
    sanmaek: {
      line: 'beast', stage: 4, branch: 'rock', name: '산맥곰', sprite: 'sanmaek',
      desc: '충격파 대기시간 -30%, 데미지 ×1.5, 범위 +20, 최대 HP +60',
      apply(p) {
        const w = p.weapons.quake;
        p.maxHp += 60;
        w.cooldown *= 0.7;
        w.damage *= 1.5;
        w.radius += 20;
      },
    },
  };
  Object.assign(FORMS, {
    // 냥콩이 계열
    nyangkong: { line: 'cat', stage: 1, name: '냥콩이', sprite: 'nyangkong', apply() {} },
    nyangnyang: {
      line: 'cat', stage: 2, name: '냥냥이', sprite: 'nyangnyang',
      desc: '최대 HP +20, 폭죽 강화',
      apply(p) { p.maxHp += 20; grantWeapon(p, 'firework'); },
    },
    dalbit: {
      line: 'cat', stage: 3, branch: 'moon', name: '달빛냥', sprite: 'dalbit',
      desc: '달빛형! 별빛 빔 2단계 획득·강화, 최대 HP +20',
      apply(p) { p.maxHp += 20; grantWeapon(p, 'beam', 2); },
    },
    satang: {
      line: 'cat', stage: 3, branch: 'candy', name: '사탕냥', sprite: 'satang',
      desc: '사탕형! 폭죽 2단계 강화, 폭발 범위 +15, 최대 HP +20',
      apply(p) { p.maxHp += 20; grantWeapon(p, 'firework', 2).radius += 15; },
    },
    eunha: {
      line: 'cat', stage: 4, branch: 'moon', name: '은하냥', sprite: 'eunha',
      desc: '별빛 빔 데미지 ×1.6, 빔 +1, 빔이 더 굵어져요',
      apply(p) {
        const w = grantWeapon(p, 'beam', 0) || grantWeapon(p, 'beam');
        p.maxHp += 30;
        w.damage *= 1.6;
        w.count++;
        w.width += 6;
      },
    },
    chukje: {
      line: 'cat', stage: 4, branch: 'candy', name: '축제냥', sprite: 'chukje',
      desc: '폭죽 +2개, 폭죽 데미지 ×1.4',
      apply(p) {
        const w = p.weapons.firework;
        p.maxHp += 30;
        w.count += 2;
        w.damage *= 1.4;
      },
    },
    kkum: {
      line: 'cat', stage: 4, secret: true, name: '꿈냥', sprite: 'kkum', desc: SECRET_DESC,
      hint: '폭죽과 별빛 빔이 둘 다 4단계 이상인 채 Lv.13',
      unlock: (p) => (p.weapons.firework?.level || 0) >= 4 && (p.weapons.beam?.level || 0) >= 4,
      apply: secretBoost,
    },

    // 퐁당이 계열
    pongdang: { line: 'seal', stage: 1, name: '퐁당이', sprite: 'pongdang', apply() {} },
    cheombeong: {
      line: 'seal', stage: 2, name: '첨벙이', sprite: 'cheombeong',
      desc: '최대 HP +20, 방울 요정 강화',
      apply(p) { p.maxHp += 20; grantWeapon(p, 'fairy'); },
    },
    pado: {
      line: 'seal', stage: 3, branch: 'wave', name: '파도물범', sprite: 'pado',
      desc: '파도형! 방울 요정 2단계 강화, 요정 데미지 ×1.3, 최대 HP +20',
      apply(p) { p.maxHp += 20; grantWeapon(p, 'fairy', 2).damage *= 1.3; },
    },
    sanho: {
      line: 'seal', stage: 3, branch: 'coral', name: '산호물범', sprite: 'sanho',
      desc: '산호형! 산호 가시 2단계 획득·강화, 초당 회복 +1, 최대 HP +30',
      apply(p) { p.maxHp += 30; p.regen += 1; grantWeapon(p, 'thorn', 2); },
    },
    haeil: {
      line: 'seal', stage: 4, branch: 'wave', name: '해일물범', sprite: 'haeil',
      desc: '요정 +3, 요정 데미지 ×1.4',
      apply(p) {
        const w = p.weapons.fairy;
        p.maxHp += 30;
        w.count += 3;
        w.damage *= 1.4;
      },
    },
    jinju: {
      line: 'seal', stage: 4, branch: 'coral', name: '진주물범', sprite: 'jinju',
      desc: '가시 데미지 ×1.6, 가시밭 크기 +12, 초당 회복 +2, 최대 HP +40',
      apply(p) {
        const w = grantWeapon(p, 'thorn', 0) || grantWeapon(p, 'thorn');
        p.maxHp += 40;
        p.regen += 2;
        w.damage *= 1.6;
        w.radius += 12;
      },
    },
    badayojeong: {
      line: 'seal', stage: 4, secret: true, name: '바다요정', sprite: 'badayojeong', desc: SECRET_DESC,
      hint: '보물상자를 2개 이상 연 채 Lv.13',
      unlock: (p) => p.chests >= 2,
      apply: secretBoost,
    },

    // 다른 계열의 비밀 진화
    mujigae: {
      line: 'water', stage: 4, secret: true, name: '무지개룡', sprite: 'mujigae', desc: SECRET_DESC,
      hint: '무기 4칸을 모두 채운 채 Lv.13',
      unlock: (p) => Object.keys(p.weapons).length >= 4,
      apply: secretBoost,
    },
    byeolttong: {
      line: 'bird', stage: 4, secret: true, name: '별똥새', sprite: 'byeolttong', desc: SECRET_DESC,
      hint: '별빛 수호를 가진 채 Lv.13',
      unlock: (p) => !!p.weapons.orbit,
      apply: secretBoost,
    },
    hwanggeum: {
      line: 'beast', stage: 4, secret: true, name: '황금곰', sprite: 'hwanggeum', desc: SECRET_DESC,
      hint: '최대 HP 250 이상으로 Lv.13',
      unlock: (p) => p.maxHp >= 250,
      apply: secretBoost,
    },
  });
  const formsOf = (line, stage) => Object.keys(FORMS).filter((id) => FORMS[id].line === line && FORMS[id].stage === stage);

  // ---------- Enemies ----------
  const ENEMY_TYPES = {
    slime: { name: '말랑이', sprite: 'slime', hp: 10, speed: 85, damage: 6, radius: 13, xp: 3, weight: 3, barY: 18 },
    mushroom: { name: '버섯돌이', sprite: 'mushroom', hp: 26, speed: 62, damage: 10, radius: 15, xp: 7, weight: 2, minTime: 35, barY: 24 },
    bee: { name: '꼬마벌', sprite: 'bee', hp: 8, speed: 120, damage: 4, radius: 11, xp: 3, weight: 1.5, minTime: 75, barY: 16, move: 'zigzag' },
    turtle: { name: '돌거북', sprite: 'turtle', hp: 70, speed: 38, damage: 12, radius: 18, xp: 12, weight: 1, minTime: 150, barY: 22 },
    ghost: { name: '둥실유령', sprite: 'ghost', hp: 22, speed: 88, damage: 7, radius: 14, xp: 8, weight: 1, minTime: 210, barY: 20, move: 'float', alpha: 0.8 },
    jelly: { name: '말랑젤리', sprite: 'jelly', hp: 24, speed: 75, damage: 8, radius: 14, xp: 6, weight: 1.2, minTime: 120, barY: 20, split: 'jellyMini' },
    jellyMini: { name: '꼬마젤리', sprite: 'jelly', scale: 0.6, hp: 8, speed: 105, damage: 4, radius: 9, xp: 2, weight: 0, barY: 12 },
    snowman: { name: '꼬마눈사람', sprite: 'snowman', hp: 40, speed: 55, damage: 11, radius: 15, xp: 9, weight: 1.2, minTime: 270, barY: 24 },
    bat: { name: '박쥐대장', sprite: 'bat', hp: 260, speed: 48, damage: 18, radius: 22, xp: 50, boss: true, barY: 32 },
    cloudking: { name: '먹구름대왕', sprite: 'cloudking', hp: 330, speed: 52, damage: 20, radius: 26, xp: 60, boss: true, barY: 34, summon: true },
    kingshroom: { name: '버섯대왕', sprite: 'kingshroom', hp: 380, speed: 40, damage: 22, radius: 24, xp: 70, boss: true, barY: 34 },
  };
  const BOSSES = [ENEMY_TYPES.bat, ENEMY_TYPES.kingshroom, ENEMY_TYPES.cloudking];
  const MAX_ENEMIES = 260;
  // Bosses arrive on the minute (from 1:00), surround waves on the half minute (from 2:30).
  const EVENT_INTERVAL = 60;
  const BOSS_START = 60;
  const WAVE_START = 150;

  // ---------- Passive upgrades ----------
  const PASSIVES = [
    {
      id: 'hp', max: 5, icon: '💖', title: '튼튼한 몸', desc: '최대 HP +20, HP 20 회복',
      apply(p) { p.maxHp += 20; p.hp = Math.min(p.maxHp, p.hp + 20); },
    },
    { id: 'haste', max: 4, icon: '⏱️', title: '재빠른 공격', desc: '모든 무기 대기시간 -10%', apply(p) { p.haste *= 0.9; } },
    { id: 'speed', max: 3, icon: '👟', title: '날쌘 발', desc: '이동 속도 +10%', apply(p) { p.speed *= 1.1; } },
    { id: 'magnet', max: 3, icon: '🧲', title: '자석 꼬리', desc: '아이템 줍는 범위 +30%', apply(p) { p.pickupRadius *= 1.3; } },
    { id: 'regen', max: 4, icon: '🌿', title: '회복의 이슬', desc: '초당 HP 1 회복', apply(p) { p.regen += 1; } },
    { id: 'crit', max: 4, icon: '🍬', title: '별사탕', desc: '치명타 확률 +10% (데미지 2배)', apply(p) { p.crit += 0.1; } },
    { id: 'xp', max: 3, icon: '👑', title: '공부하는 왕관', desc: '얻는 경험치 +15%', apply(p) { p.xpMul += 0.15; } },
    { id: 'armor', max: 4, icon: '🛡️', title: '단단한 껍질', desc: '받는 피해 -8%', apply(p) { p.armor *= 0.92; } },
    { id: 'area', max: 4, icon: '🔆', title: '큰 몸짓', desc: '오라·충격파·폭죽·가시밭 범위 +12%', apply(p) { p.area *= 1.12; } },
    { id: 'extra', max: 2, icon: '👯', title: '분신술', desc: '탄·깃털·빔·폭죽·요정 발사 수 +1', apply(p) { p.extra++; } },
    { id: 'luck', max: 3, icon: '🍀', title: '행운 클로버', desc: '하트·사탕·자석·폭탄이 더 자주 떨어져요', apply(p) { p.luck += 0.4; } },
  ];
  // Offered to fill the row once everything else is maxed out.
  const SNACK = { icon: '🍰', title: '맛있는 간식', desc: 'HP 30 회복', pick: () => { player.hp = Math.min(player.maxHp, player.hp + 30); } };

  // ---------- Pokédex-style record of every form seen (per browser) ----------
  const DEX_KEY = 'mongsil-survivors-dex';
  let seen = new Set();
  try { seen = new Set(JSON.parse(localStorage.getItem(DEX_KEY) || '[]')); } catch (e) { /* storage unavailable */ }
  function markSeen(id) {
    if (seen.has(id)) return;
    seen.add(id);
    try { localStorage.setItem(DEX_KEY, JSON.stringify([...seen])); } catch (e) { /* storage unavailable */ }
  }

  // ---------- Utility ----------
  const val = (v) => (typeof v === 'function' ? v() : v);
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
  let player, enemies, projectiles, pickups, particles, floatTexts, fx, shells, zones;
  let elapsed = 0, kills = 0, spawnTimer = 0, bossTimer = 0, bossCount = 0, waveTimer = 0;
  let modalDelay = 0, flash = 0, anim = 0;
  const modalQueue = [];
  const keys = new Set();

  function resetGame(lineId = 'water') {
    const line = LINES[lineId];
    player = {
      x: 0, y: 0,
      line: lineId, form: line.starter, stage: 1, branch: null,
      radius: SPRITE_DEFS[line.starter].size * 0.3,
      speed: line.speed, maxHp: line.hp, hp: line.hp, regen: 0, pickupRadius: 100, haste: 1,
      crit: 0, xpMul: 1, armor: 1, area: 1, extra: 0, luck: 1, chests: 0,
      level: 1, xp: 0, xpToNext: 10, picks: {},
      facing: -1, moving: false, invuln: 0, glow: 0,
      weapons: {},
    };
    grantWeapon(player, line.weapon);
    enemies = [];
    projectiles = [];
    pickups = [];
    particles = [];
    floatTexts = [];
    fx = [];
    shells = [];
    zones = [];
    modalQueue.length = 0;
    elapsed = 0;
    kills = 0;
    spawnTimer = 0;
    bossTimer = 0;
    bossCount = 0;
    waveTimer = 0;
    modalDelay = 0;
    flash = 0;
    ui.portrait.src = spritePath(line.starter);
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
      const options = formsOf(player.line, player.stage + 1).filter((id) => (FORMS[id].secret
        ? FORMS[id].unlock(player)
        : !player.branch || FORMS[id].branch === player.branch));
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
    markSeen(id);
  }

  function gainXp(amount) {
    player.xp += amount * player.xpMul;
    while (player.xp >= player.xpToNext) {
      player.xp -= player.xpToNext;
      player.level++;
      player.xpToNext = Math.floor(player.xpToNext * 1.2 + 5);
      modalQueue.push({ type: 'upgrade' });
      burst(player.x, player.y, 14, ['#fff6b0', '#ffffff', '#b8f0e0'], 120, 0.5, 3);
      checkEvolution();
    }
  }

  // ---------- Choice modals (starter pick, level-up upgrades, branch evolution) ----------
  function upgradeOffers() {
    const cards = [];
    const owned = Object.keys(player.weapons).length;
    for (const [id, W] of Object.entries(WEAPONS)) {
      const w = player.weapons[id];
      if (w ? w.level >= W.max : owned >= MAX_WEAPONS) continue;
      const n = w ? w.level + 1 : 1;
      cards.push({
        icon: W.icon(), title: `${W.name()} ${w ? '강화' : '획득'}`, desc: w ? W.up : W.desc,
        stars: '★'.repeat(n) + '☆'.repeat(W.max - n),
        pick: () => grantWeapon(player, id),
      });
    }
    for (const u of PASSIVES) {
      const n = (player.picks[u.id] || 0) + 1;
      if (n > u.max) continue;
      cards.push({
        icon: u.icon, title: u.title, desc: u.desc, stars: '★'.repeat(n) + '☆'.repeat(u.max - n),
        pick: () => { player.picks[u.id] = n; u.apply(player); },
      });
    }
    const offer = shuffled(cards).slice(0, 3);
    if (offer.length < 3) offer.push(SNACK);
    return offer;
  }

  function openNextModal() {
    const m = modalQueue.shift();
    if (!m) return;
    state = 'choice';
    ui.banner.classList.remove('show');
    if (m.type === 'starter') {
      showChoice('누구와 모험할까요?', '시작 몬스터마다 진화 계열과 무기가 달라요', Object.entries(LINES).map(([id, L]) => ({
        img: L.starter, title: FORMS[L.starter].name, desc: L.desc, big: true,
        pick: () => { resetGame(id); markSeen(L.starter); updateHud(); },
      })));
    } else if (m.type === 'branch') {
      const secret = m.options.some((id) => FORMS[id].secret);
      showChoice(secret ? '비밀 진화 조건 달성!' : '진화의 갈림길!', `${FORMS[player.form].name}이(가) 어떤 모습으로 진화할까요?`, m.options.map((id) => ({
        img: FORMS[id].sprite, title: (FORMS[id].secret ? '★ ' : '') + FORMS[id].name, desc: FORMS[id].desc, big: true,
        pick: () => { evolveTo(id); checkEvolution(); },
      })));
    } else if (m.type === 'chest') {
      showChoice('보물상자!', '선물 하나를 골라주세요', upgradeOffers());
    } else {
      showChoice('레벨 업!', '능력을 하나 골라주세요', upgradeOffers());
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
    const pool = Object.values(ENEMY_TYPES).filter((t) => !t.boss && t.weight > 0 && elapsed >= (t.minTime || 0));
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
  function spawnEnemy(type, angle, distance, at) {
    const t = elapsed;
    const hp = type.hp * (1 + t / 120 + (t / 300) ** 2);
    const e = {
      type, x: 0, y: 0, hp, maxHp: hp,
      speed: type.speed * (1 + Math.min(t / 360, 0.5)),
      damage: Math.round(type.damage * (1 + t / 240)),
      contactCd: 0, flash: 0, phase: Math.random() * Math.PI * 2,
    };
    if (at) {
      e.x = at.x;
      e.y = at.y;
    } else {
      placeOnRing(e, angle, distance);
    }
    enemies.push(e);
  }

  // A closing ring of enemies that forces the player to break out.
  function spawnSurroundWave() {
    const type = elapsed >= 300 ? ENEMY_TYPES.bee : elapsed >= 180 ? ENEMY_TYPES.mushroom : ENEMY_TYPES.slime;
    const n = 16 + Math.floor(elapsed / 20);
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
    if (elapsed >= BOSS_START) {
      bossTimer -= dt;
      if (bossTimer <= 0) {
        bossTimer = EVENT_INTERVAL;
        const boss = BOSSES[bossCount++ % BOSSES.length];
        spawnEnemy(boss);
        showBanner(`${boss.name} 등장!`, 'boss');
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

  function damageEnemy(e, idx, amount, kx, ky, push = 6, quiet = false) {
    const crit = Math.random() < player.crit;
    if (crit) amount *= 2;
    e.hp -= amount;
    e.flash = 0.1;
    const k = Math.hypot(kx, ky) || 1;
    const p = e.type.boss ? push / 6 : push;
    e.x += (kx / k) * p;
    e.y += (ky / k) * p;
    if (!quiet || crit) addFloatText(e.x, e.y - e.type.radius, crit ? `${Math.round(amount)}!` : String(Math.round(amount)), crit ? '#ffe066' : '#fff');
    if (e.hp <= 0) killEnemy(e, idx);
  }

  function killEnemy(e, idx) {
    kills++;
    enemies.splice(idx, 1);
    burst(e.x, e.y, e.type.boss ? 24 : 8, ['#ffffff', '#fff0b3', '#ffd1e0'], e.type.boss ? 200 : 110, 0.4, 4);
    pickups.push({ kind: e.type.xp >= 20 ? 'gem_big' : 'gem', value: e.type.xp, x: e.x, y: e.y });
    if (e.type.split) {
      for (const dx of [-10, 10]) spawnEnemy(ENEMY_TYPES[e.type.split], 0, 0, { x: e.x + dx, y: e.y });
    }
    if (e.type.boss) {
      pickups.push({ kind: 'chest', x: e.x + 16, y: e.y + 6 });
      pickups.push({ kind: 'heart', value: 25, x: e.x - 16, y: e.y + 6 });
      return;
    }
    const roll = Math.random() / player.luck;
    const drop = roll < 0.004 ? 'bomb' : roll < 0.009 ? 'magnet' : roll < 0.016 ? 'candy' : roll < 0.04 ? 'heart' : null;
    if (drop) pickups.push({ kind: drop, value: drop === 'candy' ? 60 : 25, x: e.x + 12, y: e.y + 6 });
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
    if (stick.active && Math.hypot(stick.dx, stick.dy) > 8) {
      dx = stick.dx;
      dy = stick.dy;
    }
    player.moving = dx !== 0 || dy !== 0;
    if (player.moving) {
      const len = Math.hypot(dx, dy);
      player.x += (dx / len) * player.speed * dt;
      player.y += (dy / len) * player.speed * dt;
      if (dx !== 0) player.facing = Math.sign(dx);
    }
    if (player.regen > 0) player.hp = Math.min(player.maxHp, player.hp + player.regen * dt);
    if (player.invuln > 0) player.invuln -= dt;
    if (player.glow > 0) player.glow -= dt;
  }

  function updateEnemies(dt) {
    const farLimit = Math.hypot(viewW, viewH) * 0.85;
    const aura = player.weapons.aura;
    const summons = [];
    for (const e of enemies) {
      const dx = player.x - e.x, dy = player.y - e.y;
      const d = Math.hypot(dx, dy) || 1;
      if (d > farLimit) { placeOnRing(e); continue; }
      let speed = e.speed;
      if (e.type.move === 'float') speed *= 0.6 + 0.4 * Math.sin(elapsed * 3 + e.phase);
      if (aura && d < aura.radius * player.area + e.type.radius) speed *= 1 - aura.slow;
      if (zones.some((z) => dist(z.x, z.y, e.x, e.y) < z.r + e.type.radius)) speed *= 0.7;
      if (e.type.summon && (e.summonCd = (e.summonCd ?? 3) - dt) <= 0) {
        e.summonCd = 5;
        summons.push(e);
      }
      e.x += (dx / d) * speed * dt;
      e.y += (dy / d) * speed * dt;
      if (e.type.move === 'zigzag') {
        const wiggle = Math.sin(elapsed * 8 + e.phase) * speed * 0.7 * dt;
        e.x += (-dy / d) * wiggle;
        e.y += (dx / d) * wiggle;
      }
      if (e.flash > 0) e.flash -= dt;
      if (e.contactCd > 0) e.contactCd -= dt;
      if (d < e.type.radius + player.radius * 0.8 && e.contactCd <= 0 && player.invuln <= 0) {
        const hurt = Math.max(1, Math.round(e.damage * player.armor));
        player.hp -= hurt;
        player.invuln = 0.5;
        e.contactCd = 0.6;
        addFloatText(player.x, player.y - player.radius - 6, `-${hurt}`, '#ff6b8e');
        if (player.hp <= 0) {
          player.hp = 0;
          gameOver();
          return;
        }
      }
    }
    for (const boss of summons) {
      for (let i = 0; i < 3; i++) {
        const a = (i / 3) * Math.PI * 2;
        spawnEnemy(ENEMY_TYPES.slime, 0, 0, { x: boss.x + Math.cos(a) * 40, y: boss.y + Math.sin(a) * 40 });
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

  function moveBoomerang(p, dt) {
    const speed = Math.hypot(p.vx, p.vy);
    if (!p.returning) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.traveled += speed * dt;
      if (p.traveled >= p.range) {
        p.returning = true;
        p.hit.clear();
      }
      return false;
    }
    const d = dist(p.x, p.y, player.x, player.y) || 1;
    const step = speed * 1.15 * dt;
    p.x += ((player.x - p.x) / d) * step;
    p.y += ((player.y - p.y) / d) * step;
    return d < player.radius + 6;
  }

  function updateProjectiles(dt) {
    for (let i = projectiles.length - 1; i >= 0; i--) {
      const p = projectiles[i];
      p.life -= dt;
      let dead = p.life <= 0;
      if (p.kind === 'boomerang') {
        p.spin = (p.spin || 0) + dt * 14;
        if (moveBoomerang(p, dt)) dead = true;
      } else if (p.kind === 'homing') {
        let best = null, bestD = 400;
        for (const e of enemies) {
          const d = dist(p.x, p.y, e.x, e.y);
          if (d < bestD) { bestD = d; best = e; }
        }
        if (best) {
          const k = Math.min(1, 6 * dt);
          p.vx += (((best.x - p.x) / bestD) * p.speed - p.vx) * k;
          p.vy += (((best.y - p.y) / bestD) * p.speed - p.vy) * k;
        }
        p.x += p.vx * dt;
        p.y += p.vy * dt;
      } else {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
      }
      for (let j = enemies.length - 1; j >= 0 && !dead; j--) {
        const e = enemies[j];
        if (p.hit.has(e) || dist(p.x, p.y, e.x, e.y) >= p.radius + e.type.radius) continue;
        p.hit.add(e);
        damageEnemy(e, j, p.damage, e.x - p.x, e.y - p.y);
        if (--p.pierce <= 0) dead = true;
      }
      if (dead) projectiles.splice(i, 1);
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
        collect(it);
      }
    }
  }

  function collect(it) {
    const head = player.y - player.radius - 6;
    if (it.kind === 'heart' || it.kind === 'candy') {
      player.hp = Math.min(player.maxHp, player.hp + it.value);
      addFloatText(player.x, head, `+${it.value}`, '#ff8fb4');
    } else if (it.kind === 'magnet') {
      for (const g of pickups) if (g.kind === 'gem' || g.kind === 'gem_big') g.vel = 300;
      addFloatText(player.x, head, '자석!', '#ff8fb4');
    } else if (it.kind === 'bomb') {
      flash = 0.25;
      fx.push({ kind: 'ring', x: player.x, y: player.y, r: Math.hypot(viewW, viewH) / 2, life: 0.5, max: 0.5 });
      for (let j = enemies.length - 1; j >= 0; j--) {
        const e = enemies[j];
        if (Math.abs(e.x - player.x) < viewW / 2 + 40 && Math.abs(e.y - player.y) < viewH / 2 + 40) {
          damageEnemy(e, j, e.type.boss ? 120 : e.hp + 1, 0, 0, 0, true);
        }
      }
    } else if (it.kind === 'chest') {
      player.chests++;
      modalQueue.unshift({ type: 'chest' });
      burst(player.x, player.y, 20, ['#ffe066', '#ffffff', '#ffc2dc'], 200, 0.6, 4, true);
    } else {
      gainXp(it.value);
    }
  }

  function updateShellsAndZones(dt) {
    for (let i = shells.length - 1; i >= 0; i--) {
      const sh = shells[i];
      if ((sh.t += dt) < sh.dur) continue;
      shells.splice(i, 1);
      fx.push({ kind: 'ring', x: sh.tx, y: sh.ty, r: sh.radius, life: 0.3, max: 0.3 });
      burst(sh.tx, sh.ty, 10, ['#ff9ec0', '#ffe066', '#9be7ff', '#b8f0a0'], 160, 0.4, 4, true);
      for (let j = enemies.length - 1; j >= 0; j--) {
        const e = enemies[j];
        if (dist(e.x, e.y, sh.tx, sh.ty) < sh.radius + e.type.radius) damageEnemy(e, j, sh.damage, e.x - sh.tx, e.y - sh.ty, 10);
      }
    }
    for (let i = zones.length - 1; i >= 0; i--) {
      const z = zones[i];
      if ((z.life -= dt) <= 0) { zones.splice(i, 1); continue; }
      if ((z.tick -= dt) > 0) continue;
      z.tick = 0.5;
      for (let j = enemies.length - 1; j >= 0; j--) {
        const e = enemies[j];
        if (dist(e.x, e.y, z.x, z.y) < z.r + e.type.radius) damageEnemy(e, j, z.damage, 0, 0, 0, true);
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
    for (let i = fx.length - 1; i >= 0; i--) {
      if ((fx[i].life -= dt) <= 0) fx.splice(i, 1);
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
    for (const [id, w] of Object.entries(player.weapons)) WEAPONS[id].update(w, dt);
    updateProjectiles(dt);
    updateShellsAndZones(dt);
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
    ui.weaponRow.textContent = Object.entries(player.weapons)
      .map(([id, w]) => `${WEAPONS[id].icon()}${w.level}`).join('  ');
  }

  // ---------- Render ----------
  function drawShadow(x, y, r) {
    ctx.fillStyle = 'rgba(70, 110, 50, 0.22)';
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawAura() {
    const w = player.weapons.aura;
    if (!w) return;
    ctx.fillStyle = 'rgba(175, 225, 255, 0.22)';
    ctx.strokeStyle = 'rgba(140, 205, 255, 0.55)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    const radius = w.radius * player.area;
    ctx.arc(player.x, player.y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    for (let i = 0; i < 6; i++) {
      const a = anim * 0.8 + (i / 6) * Math.PI * 2;
      const x = player.x + Math.cos(a) * radius * 0.8, y = player.y + Math.sin(a) * radius * 0.8;
      ctx.fillRect(x - 3, y - 1, 6, 2);
      ctx.fillRect(x - 1, y - 3, 2, 6);
    }
  }

  function drawZones() {
    for (const z of zones) {
      const a = clamp(z.life / 0.6, 0, 1) * 0.9;
      ctx.fillStyle = player.branch === 'coral' ? `rgba(255, 150, 140, ${0.25 * a})` : `rgba(120, 175, 90, ${0.25 * a})`;
      ctx.beginPath();
      ctx.arc(z.x, z.y, z.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = player.branch === 'coral' ? `rgba(230, 90, 100, ${a})` : `rgba(70, 130, 60, ${a})`;
      for (let i = 0; i < 7; i++) {
        const ang = z.seed + i * 0.9, rr = z.r * (0.25 + ((i * 37) % 10) / 14);
        const x = z.x + Math.cos(ang) * rr, y = z.y + Math.sin(ang) * rr * 0.7;
        ctx.beginPath();
        ctx.moveTo(x - 3, y + 2);
        ctx.lineTo(x, y - 5);
        ctx.lineTo(x + 3, y + 2);
        ctx.fill();
      }
    }
  }

  function drawShells() {
    for (const sh of shells) {
      const t = sh.t / sh.dur;
      const x = sh.sx + (sh.tx - sh.sx) * t;
      const y = sh.sy + (sh.ty - sh.sy) * t - Math.sin(Math.PI * t) * 70;
      drawSprite('shell', x, y);
    }
  }

  function drawFx() {
    for (const f of fx) {
      const a = clamp(f.life / f.max, 0, 1);
      if (f.kind === 'beam') {
        ctx.save();
        ctx.translate(f.x, f.y);
        ctx.rotate(f.a);
        ctx.globalAlpha = a;
        const g = ctx.createLinearGradient(0, -f.w, 0, f.w);
        g.addColorStop(0, 'rgba(255, 160, 210, 0)');
        g.addColorStop(0.3, 'rgba(255, 200, 120, 0.9)');
        g.addColorStop(0.5, 'rgba(255, 255, 255, 1)');
        g.addColorStop(0.7, 'rgba(150, 220, 255, 0.9)');
        g.addColorStop(1, 'rgba(190, 160, 255, 0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, -f.w, f.len, f.w * 2);
        ctx.restore();
      } else if (f.kind === 'ring') {
        const r = f.r * (1 - a * 0.6);
        ctx.strokeStyle = `rgba(255, 220, 150, ${a})`;
        ctx.lineWidth = 6 * a + 2;
        ctx.beginPath();
        ctx.arc(f.x, f.y, r, 0, Math.PI * 2);
        ctx.stroke();
      } else if (f.kind === 'bolt') {
        ctx.strokeStyle = `rgba(255, 245, 140, ${a})`;
        ctx.lineWidth = 4;
        ctx.beginPath();
        let x = f.x, y = f.y - 160;
        ctx.moveTo(x, y);
        for (let i = 1; i <= 6; i++) {
          x = f.x + (i < 6 ? Math.sin(f.seed + i * 2.3) * 12 : 0);
          y = f.y - 160 + (160 * i) / 6;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.strokeStyle = `rgba(255, 255, 255, ${a})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }
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
    const lift = t.move === 'float' ? Math.sin(anim * 3 + e.phase) * 4 - 4 : 0;
    const sc = t.scale || 1;
    drawSprite(t.sprite, e.x, e.y + lift, { sx: sc * (1 + 0.05 * b), sy: sc * (1 - 0.05 * b), groundR: r, flash: e.flash > 0, alpha: t.alpha });
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

    drawAura();
    drawZones();
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
    for (const p of projectiles) {
      const rot = p.kind === 'boomerang' ? p.spin : p.kind === 'homing' ? 0 : Math.atan2(p.vy, p.vx);
      drawSprite(p.sprite, p.x, p.y, { rot });
    }
    drawShells();
    drawFx();

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

    if (stick.active) {
      const len = Math.hypot(stick.dx, stick.dy);
      const k = len > 40 ? 40 / len : 1;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.beginPath();
      ctx.arc(stick.ox, stick.oy, 44, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255, 143, 180, 0.8)';
      ctx.beginPath();
      ctx.arc(stick.ox + stick.dx * k, stick.oy + stick.dy * k, 18, 0, Math.PI * 2);
      ctx.fill();
    }

    if (flash > 0) {
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, flash * 1.6)})`;
      ctx.fillRect(0, 0, viewW, viewH);
    }
  }

  // ---------- Screens ----------
  // Title-screen dex: each line's tree; forms not yet met show as silhouettes.
  function buildEvoChart() {
    const node = (id) => {
      const f = FORMS[id];
      const known = seen.has(id) || f.stage === 1;
      const el = document.createElement('div');
      el.className = known ? 'evo-node' : 'evo-node unseen';
      const name = document.createElement('span');
      name.textContent = known ? f.name : '???';
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
    ui.evoChart.replaceChildren();
    for (const lineId of Object.keys(LINES)) {
      const line = document.createElement('div');
      line.className = 'evo-line';
      const branches = document.createElement('div');
      branches.className = 'evo-branches';
      for (const id3 of formsOf(lineId, 3)) {
        const id4 = formsOf(lineId, 4).find((id) => FORMS[id].branch === FORMS[id3].branch);
        const row = document.createElement('div');
        row.className = 'evo-row';
        row.append(node(id3), arrow(), node(id4));
        branches.append(row);
      }
      line.append(node(formsOf(lineId, 1)[0]), arrow(), node(formsOf(lineId, 2)[0]), arrow(), branches);
      for (const sid of formsOf(lineId, 4).filter((id) => FORMS[id].secret)) {
        const sn = node(sid);
        sn.classList.add('secret');
        sn.title = FORMS[sid].hint;
        sn.querySelector('small').textContent = '★ 비밀';
        line.append(sn);
      }
      ui.evoChart.append(line);
    }
    ui.secretHints.replaceChildren(...Object.values(FORMS).filter((f) => f.secret).map((f) => {
      const li = document.createElement('li');
      li.textContent = `${LINES[f.line] ? FORMS[LINES[f.line].starter].name : ''} 계열: ${f.hint}`;
      return li;
    }));
    const total = Object.keys(FORMS).length;
    const found = Object.keys(FORMS).filter((id) => seen.has(id) || FORMS[id].stage === 1).length;
    ui.dexCount.textContent = `진화 도감 ${found} / ${total}`;
  }

  function startGame() {
    if (state !== 'title' && state !== 'gameover') return;
    resetGame();
    for (const el of [ui.start, ui.gameover, ui.choice, ui.pause]) el.classList.add('hidden');
    ui.hud.classList.remove('hidden');
    updateHud();
    state = 'playing';
    modalQueue.push({ type: 'starter' });
    openNextModal();
  }

  function gameOver() {
    state = 'gameover';
    const f = FORMS[player.form];
    ui.gameoverPortrait.src = spritePath(f.sprite);
    ui.gameoverStats.textContent = `${f.name} · Lv.${player.level} · ${fmtTime(elapsed)} 생존 · ${kills}마리 처치`;
    ui.hud.classList.add('hidden');
    ui.gameover.classList.remove('hidden');
    buildEvoChart();
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
    if (state === 'choice' && /^Digit[1-5]$/.test(e.code)) {
      const card = ui.choiceCards.children[Number(e.code.slice(5)) - 1];
      if (card) card.click();
    }
    if (e.code === 'Enter' || e.code === 'Space') startGame();
  });
  window.addEventListener('keyup', (e) => keys.delete(e.code));
  window.addEventListener('blur', () => keys.clear());

  // Touch / mouse drag acts as a floating joystick anchored where the drag started.
  const stick = { active: false, id: null, ox: 0, oy: 0, dx: 0, dy: 0 };
  canvas.addEventListener('pointerdown', (e) => {
    if (state !== 'playing') return;
    const r = canvas.getBoundingClientRect();
    Object.assign(stick, { active: true, id: e.pointerId, ox: e.clientX - r.left, oy: e.clientY - r.top, dx: 0, dy: 0 });
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!stick.active || e.pointerId !== stick.id) return;
    const r = canvas.getBoundingClientRect();
    stick.dx = e.clientX - r.left - stick.ox;
    stick.dy = e.clientY - r.top - stick.oy;
  });
  const endStick = (e) => { if (e.pointerId === stick.id) stick.active = false; };
  canvas.addEventListener('pointerup', endStick);
  canvas.addEventListener('pointercancel', endStick);
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
