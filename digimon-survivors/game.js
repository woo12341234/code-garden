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
    start: $('start-screen'), titleStats: $('title-stats'), toast: $('toast'), toastTitle: $('toast-title'), toastSub: $('toast-sub'),
    achv: $('achv-screen'), achvList: $('achv-list'), bookList: $('book-list'), achvCount: $('achv-count'), bookCount: $('book-count'), heroList: $('hero-list'),
    choice: $('choice-screen'), choiceTitle: $('choice-title'),
    choiceSubtitle: $('choice-subtitle'), choiceCards: $('choice-cards'),
    pause: $('pause-screen'), pauseBuild: $('pause-build'), pauseDmg: $('pause-dmg'), pauseStats: $('pause-stats'), quitBtn: $('quit-btn'),
    choiceTools: $('choice-tools'), gold: $('gold'), gameoverTitle: $('gameover-title'), continueBtn: $('continue-btn'),
    shop: $('shop-screen'), shopList: $('shop-list'), shopGold: $('shop-gold'),
    gameover: $('gameover-screen'), gameoverPortrait: $('gameover-portrait'), gameoverStats: $('gameover-stats'),
  };

  // ---------- Sprites ----------
  // Each key loads assets/<key>.png. If the file is missing, a colored circle + emoji is drawn instead.
  // size = on-screen size in CSS px (our pixel art is drawn at exactly 2x its grid size).
  const SPRITE_DEFS = {
    cheongpung: { size: 48, color: '#34767f', emoji: '🗡️' },
    unhak: { size: 48, color: '#e4e2d6', emoji: '📜' },
    yeoubi: { size: 48, color: '#c4303c', emoji: '🦊' },
    cheolsan: { size: 48, color: '#c47a34', emoji: '📿' },
    dallae: { size: 48, color: '#be342e', emoji: '🔔' },
    yawol: { size: 48, color: '#34324e', emoji: '🥷' },
    songhwa: { size: 48, color: '#608c56', emoji: '🌿' },
    muyeong: { size: 48, color: '#6e707c', emoji: '⚔️' },
    geumbi: { size: 48, color: '#deba50', emoji: '🧧' },
    seola: { size: 48, color: '#ecf4fa', emoji: '❄️' },
    cheonma: { size: 48, color: '#781824', emoji: '😈' },
    sansin: { size: 48, color: '#f0eee4', emoji: '🏔️' },
    icicle: { size: 20, color: '#bee6ff' },
    baekmae: { size: 48, color: '#463c46', emoji: '🌸' },
    palgeol: { size: 48, color: '#967d5f', emoji: '🥢' },
    dangyu: { size: 48, color: '#28503c', emoji: '📍' },
    namgung: { size: 48, color: '#284696', emoji: '👑' },
    maengju: { size: 48, color: '#f5f2e8', emoji: '🐉' },
    petal: { size: 20, color: '#fa9fbe' },
    needle: { size: 24, color: '#c8cdd4' },
    bottle: { size: 24, color: '#d69646', emoji: '🍶' },
    palm: { size: 72, color: '#f0c350', emoji: '🖐️' },
    bigsword: { size: 48, color: '#c8cdd4', emoji: '🗡️' },
    yinyang: { size: 28, color: '#2a2224', emoji: '☯️' },
    wisp: { size: 48, color: '#6eb9ff', emoji: '🔥' },
    dokkaebi: { size: 48, color: '#d64e3e', emoji: '👹' },
    crow: { size: 48, color: '#3a3a50', emoji: '🐦‍⬛' },
    jangseung: { size: 48, color: '#9e7c60', emoji: '🗿' },
    wongwi: { size: 48, color: '#f0f0ec', emoji: '👻' },
    meok: { size: 48, color: '#322c38', emoji: '🖤' },
    gangsi: { size: 48, color: '#a0c4b0', emoji: '🧟' },
    eodukssini: { size: 48, color: '#282434', emoji: '🌑' },
    bulgasari: { size: 48, color: '#78706e', emoji: '🦏' },
    aemi: { size: 48, color: '#b096d2', emoji: '🗡️' },
    gonryun: { size: 48, color: '#6ea0d2', emoji: '🏔️' },
    jegal: { size: 48, color: '#46786e', emoji: '🪶' },
    daedokkaebi: { size: 64, color: '#4870be', emoji: '👹' },
    imugi: { size: 64, color: '#468c64', emoji: '🐍' },
    heukyo: { size: 64, color: '#3e3a4c', emoji: '⚔️' },
    sword: { size: 28, color: '#c8cdd4' },
    foxfire: { size: 28, color: '#ff8c46', emoji: '🔥' },
    chakram: { size: 24, color: '#c8cdd4' },
    crane: { size: 24, color: '#f8f5ec' },
    talisman: { size: 20, color: '#f0d25a' },
    coin: { size: 20, color: '#cd8c46' },
    coin_gold: { size: 24, color: '#ebbe46' },
    peach: { size: 24, color: '#faa0a0', emoji: '🍑' },
    ginseng: { size: 24, color: '#ecd2a0', emoji: '🌱' },
    gourd: { size: 24, color: '#d69646', emoji: '🏺' },
    thunderball: { size: 24, color: '#403c4c', emoji: '💣' },
    treasure: { size: 28, color: '#aa2828', emoji: '🎁' },
    seokdeung: { size: 40, color: '#b0aa9c', emoji: '🏮' },
    eunja: { size: 24, color: '#ced4de', emoji: '🪙' },
    jumeoni: { size: 28, color: '#c8323c', emoji: '💰' },
    bangul: { size: 24, color: '#deb048', emoji: '🔔' },
    jeoseung: { size: 72, color: '#242028', emoji: '💀' },
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
    g.fillStyle = '#e9dfc6';
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
    for (let i = 0; i < 40; i++) {
      const color = rnd() < 0.5 ? '#b9b096' : '#cbc2a6';
      stamp(TUFT.map(([x, y]) => [x, y, color]), ...spot());
    }
    for (let i = 0; i < 50; i++) stamp([[0, 0, rnd() < 0.5 ? '#ddd1b4' : '#f3ead6']], ...spot());
    for (let i = 0; i < 10; i++) stamp([[0, 0, '#c8574d'], [1, 0, '#c8574d'], [1, 1, '#a8433b']], ...spot());
    bgPattern = ctx.createPattern(tile, 'repeat');
  }

  // ---------- Weapons ----------
  // Every weapon has a level (1..max). Cooldowns are scaled by player.haste.
  const MAX_WEAPONS = 5;

  const WEAPONS = {
    shot: {
      name: () => '비검',
      icon: () => '🗡️',
      desc: '가장 가까운 요괴에게 칼을 날려요',
      up: '데미지 +4, 2단계마다 발사 수 +1',
      max: 7,
      create: () => ({ damage: 10, count: 1, pierce: 1, cooldown: 0.7, timer: 0.3, speed: 380, sprite: 'sword', radius: 9 }),
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
            damage: w.damage, pierce: w.pierce + player.pierce, radius: w.radius, sprite: w.sprite, life: 1.5, hit: new Set(),
          });
        }
      },
    },
    orbit: {
      name: () => '여우불',
      icon: () => '🔥',
      desc: '몸 주위를 도는 여우불이 요괴를 태워요',
      up: '여우불 +1개, 데미지 +3',
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
      name: () => '원월륜',
      icon: () => '⭕',
      desc: '날아갔다 돌아오며 길 위의 요괴를 모두 베어요',
      up: '데미지 +5, 2단계마다 원월륜 +1',
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
            damage: w.damage, pierce: Infinity, radius: 12, sprite: 'chakram', life: 4,
            traveled: 0, range: w.range, returning: false, hit: new Set(),
          });
        }
      },
    },
    lightning: {
      name: () => '뇌전부',
      icon: () => '⚡',
      desc: '부적을 태워 주변 요괴에게 벼락을 내려요',
      up: '벼락 +1개, 데미지 +6',
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
      name: () => '금빛 결계',
      icon: () => '☯️',
      desc: '결계 안의 요괴를 느리게 하고 계속 피해를 줘요',
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
      name: () => '장풍',
      icon: () => '🌀',
      desc: '손바닥 바람을 둥글게 터뜨려 요괴를 밀쳐내요',
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
      name: () => '검기',
      icon: () => '💫',
      desc: '요괴를 꿰뚫는 긴 칼바람을 날려요',
      up: '데미지 +7, 3단계마다 검기 +1',
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
      name: () => '폭염부',
      icon: () => '🎇',
      desc: '요괴 무리 위로 부적을 던져 불꽃으로 터뜨려요',
      up: '데미지 +6, 폭발 범위 +8, 2단계마다 부적 +1',
      max: 6,
      create: () => ({ damage: 14, count: 1, cooldown: 1.8, timer: 0.4, radius: 55 }),
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
      name: () => '종이학',
      icon: () => '🕊️',
      desc: '접은 종이학들이 요괴를 쫓아가 쪼아요',
      up: '데미지 +3, 2단계마다 종이학 +1',
      max: 6,
      create: () => ({ damage: 7, count: 2, cooldown: 1.35, timer: 0.3, speed: 300 }),
      upgrade(w) { w.damage += 3; if (w.level % 2 === 0) w.count++; },
      update(w, dt) {
        if ((w.timer -= dt) > 0) return;
        if (!nearestEnemy(500)) return;
        w.timer = w.cooldown * player.haste;
        const n = w.count + player.extra;
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2 + anim;
          projectiles.push({
            kind: 'homing', x: player.x, y: player.y, vx: Math.cos(a) * w.speed, vy: Math.sin(a) * w.speed,
            speed: w.speed, damage: w.damage, pierce: 1 + player.pierce, radius: 9, sprite: 'crane', life: 2.5, hit: new Set(),
          });
        }
      },
    },
    thorn: {
      name: () => '독안개',
      icon: () => '☠️',
      desc: '지나간 자리에 독안개를 남겨 요괴를 느리게 하고 중독시켜요',
      up: '데미지 +3, 안개 크기 +6, 유지시간 +0.5초',
      max: 6,
      create: () => ({ damage: 6, radius: 34, life: 3, cooldown: 0.7, timer: 0 }),
      upgrade(w) { w.damage += 3; w.radius += 6; w.life += 0.5; },
      update(w, dt) {
        if ((w.timer -= dt) > 0) return;
        w.timer = w.cooldown * player.haste;
        zones.push({ x: player.x, y: player.y, r: w.radius * player.area, damage: w.damage, life: w.life * player.durMul, max: w.life * player.durMul, tick: 0, seed: Math.random() * 10 });
      },
    },
  });

  Object.assign(WEAPONS, {
    slash: {
      name: () => '쌍검베기',
      icon: () => '🔪',
      desc: '바라보는 쪽을 넓게 베어요 (3단계부터 양쪽)',
      up: '데미지 +5, 범위 +10',
      max: 6,
      create: () => ({ damage: 14, count: 1, cooldown: 1.0, timer: 0.3, range: 110, height: 44 }),
      upgrade(w) { w.damage += 5; w.range += 10; if (w.level === 3) w.count = 2; if (w.level === 6) w.height += 16; },
      update(w, dt) {
        if ((w.timer -= dt) > 0) return;
        if (!nearestEnemy(w.range + 60)) return;
        w.timer = w.cooldown * player.haste;
        const dirs = w.count >= 2 ? [player.facing, -player.facing] : [player.facing];
        for (const d of dirs) {
          fx.push({ kind: 'slash', x: player.x, y: player.y, dir: d, range: w.range, h: w.height, life: 0.2, max: 0.2 });
          for (let j = enemies.length - 1; j >= 0; j--) {
            const e = enemies[j];
            const rx = (e.x - player.x) * d;
            if (rx < -10 || rx > w.range + e.type.radius || Math.abs(e.y - player.y) > w.height / 2 + e.type.radius) continue;
            damageEnemy(e, j, w.damage, d, 0, 8);
          }
        }
      },
    },
    icicle: {
      name: () => '빙설',
      icon: () => '🧊',
      desc: '하늘에서 얼음 송곳을 떨어뜨려 요괴를 얼려요',
      up: '얼음 +1, 데미지 +4',
      max: 6,
      create: () => ({ damage: 15, count: 2, cooldown: 1.3, timer: 0.5, radius: 32 }),
      upgrade(w) { w.count++; w.damage += 4; },
      update(w, dt) {
        if ((w.timer -= dt) > 0) return;
        const near = enemies.filter((e) => dist(e.x, e.y, player.x, player.y) < 320);
        if (!near.length) return;
        w.timer = w.cooldown * player.haste;
        for (const e of shuffled(near).slice(0, w.count)) {
          shells.push({ kind: 'drop', sx: e.x, sy: e.y, tx: e.x, ty: e.y, t: 0, dur: 0.4, damage: w.damage, radius: w.radius * player.area, chill: true });
        }
      },
    },
    tornado: {
      name: () => '회오리',
      icon: () => '🌪️',
      desc: '요괴 무리를 휩쓸며 떠도는 회오리를 일으켜요',
      up: '데미지 +4, 크기 +4, 2단계마다 회오리 +1',
      max: 6,
      create: () => ({ damage: 8, count: 1, cooldown: 2.4, timer: 0.8, radius: 30, life: 3 }),
      upgrade(w) { w.damage += 4; w.radius += 4; if (w.level % 2 === 0) w.count++; },
      update(w, dt) {
        if ((w.timer -= dt) > 0) return;
        if (!nearestEnemy(400)) return;
        w.timer = w.cooldown * player.haste;
        for (let i = 0; i < w.count; i++) {
          const a = Math.random() * Math.PI * 2;
          projectiles.push({
            kind: 'tornado', x: player.x, y: player.y, vx: Math.cos(a) * 110, vy: Math.sin(a) * 110,
            damage: w.damage, pierce: Infinity, radius: w.radius, life: w.life * player.durMul, rehit: 0.4, hit: new Set(),
          });
        }
      },
    },
    mine: {
      name: () => '지뢰부',
      icon: () => '📯',
      desc: '발밑에 부적을 깔아두면 요괴가 밟을 때 터져요',
      up: '데미지 +10, 폭발 범위 +8',
      max: 6,
      create: () => ({ damage: 30, radius: 70, cooldown: 1.4, timer: 0.4, pull: 0 }),
      upgrade(w) { w.damage += 10; w.radius += 8; },
      update(w, dt) {
        if ((w.timer -= dt) > 0) return;
        w.timer = w.cooldown * player.haste;
        if (mines.length >= 10) mines.shift();
        mines.push({ x: player.x, y: player.y, arm: 0.3, life: 10 * player.durMul, damage: w.damage, radius: w.radius * player.area, pull: w.pull });
      },
    },
  });

  // ---------- Sect techniques (only offered to heroes of that sect) ----------
  const SECTS = {
    hwasan: '화산파', mudang: '무당파', sorim: '소림사', gaebang: '개방',
    dang: '사천당가', namgung: '남궁세가', bukhae: '북해빙궁', magyo: '마교',
    aemi: '아미파', gonryun: '곤륜파', jegal: '제갈세가',
  };

  function ringPoints(w) {
    const pts = [];
    for (let i = 0; i < w.count; i++) {
      const a = w.angle + (i / w.count) * Math.PI * 2;
      pts.push({ x: player.x + Math.cos(a) * w.dist, y: player.y + Math.sin(a) * w.dist });
    }
    return pts;
  }

  function tickHits(w, dt) {
    for (const [e, t] of w.hits) {
      if (t <= dt) w.hits.delete(e);
      else w.hits.set(e, t - dt);
    }
  }

  function ringBlast(x, y, radius, damage, push, color, onHit) {
    fx.push({ kind: 'ring', x, y, r: radius, life: 0.35, max: 0.35, color });
    for (let j = enemies.length - 1; j >= 0; j--) {
      const e = enemies[j];
      if (dist(e.x, e.y, x, y) >= radius + e.type.radius) continue;
      if (onHit) onHit(e);
      damageEnemy(e, j, damage, e.x - x, e.y - y, push);
    }
  }

  function beamStrike(a, length, width, damage, tint, onHit) {
    const cx = Math.cos(a), cy = Math.sin(a);
    fx.push({ kind: 'beam', x: player.x, y: player.y, a, len: length, w: width, life: 0.3, max: 0.3, tint });
    for (let j = enemies.length - 1; j >= 0; j--) {
      const e = enemies[j];
      const rx = e.x - player.x, ry = e.y - player.y;
      const along = rx * cx + ry * cy;
      if (along < 0 || along > length || Math.abs(rx * cy - ry * cx) >= width + e.type.radius) continue;
      if (onHit) onHit(e);
      damageEnemy(e, j, damage, cx, cy);
    }
  }

  const heal = (n) => { player.hp = Math.min(player.maxHp, player.hp + n); };

  Object.assign(WEAPONS, {
    plum: {
      sect: 'hwasan', name: () => '매화검법', icon: () => '🌸',
      desc: '매화 꽃잎 같은 검기를 부채꼴로 흩뿌려요', up: '꽃잎 +2, 데미지 +3', max: 6,
      create: () => ({ damage: 7, count: 5, cooldown: 1.1, timer: 0.3, speed: 420, pierce: 2 }),
      upgrade(w) { w.count += 2; w.damage += 3; },
      update(w, dt) {
        if ((w.timer -= dt) > 0) return;
        const t = nearestEnemy(450);
        if (!t) return;
        w.timer = w.cooldown * player.haste;
        const base = Math.atan2(t.y - player.y, t.x - player.x);
        const n = w.count + player.extra;
        for (let i = 0; i < n; i++) {
          const a = base + (i - (n - 1) / 2) * (1.6 / Math.max(1, n - 1));
          projectiles.push({
            kind: 'petal', x: player.x, y: player.y, vx: Math.cos(a) * w.speed, vy: Math.sin(a) * w.speed,
            damage: w.damage, pierce: w.pierce + player.pierce, radius: 8, sprite: 'petal', life: 0.9, hit: new Set(), spin: Math.random() * 6,
          });
        }
      },
    },
    plumrain: {
      sect: 'hwasan', name: () => '매화낙영', icon: () => '🏵️',
      desc: '요괴 머리 위로 매화가 비처럼 떨어져요', up: '꽃비 +2, 데미지 +3', max: 6,
      create: () => ({ damage: 10, count: 4, cooldown: 1.4, timer: 0.6, radius: 28 }),
      upgrade(w) { w.count += 2; w.damage += 3; },
      update(w, dt) {
        if ((w.timer -= dt) > 0) return;
        const near = enemies.filter((e) => dist(e.x, e.y, player.x, player.y) < 340);
        if (!near.length) return;
        w.timer = w.cooldown * player.haste;
        for (const e of shuffled(near).slice(0, w.count)) {
          shells.push({ kind: 'drop', sprite: 'petal', tx: e.x, ty: e.y, t: 0, dur: 0.35, damage: w.damage, radius: w.radius * player.area, colors: ['#fa9fbe', '#ffffff', '#e05a82'] });
        }
      },
    },
    taiji: {
      sect: 'mudang', name: () => '태극검', icon: () => '☯️',
      desc: '음양의 검이 몸 주위를 크게 돌며 베어요', up: '데미지 +5, 반경 +10 (4단계에 검 4자루)', max: 6,
      create: () => ({ damage: 14, count: 2, dist: 90, angle: 0, hits: new Map() }),
      upgrade(w) { w.damage += 5; w.dist += 10; if (w.level === 4) w.count = 4; },
      update(w, dt) {
        w.angle += dt * 3.2;
        tickHits(w, dt);
        for (const pt of ringPoints(w)) {
          for (let j = enemies.length - 1; j >= 0; j--) {
            const e = enemies[j];
            if (w.hits.has(e) || dist(pt.x, pt.y, e.x, e.y) >= 16 + e.type.radius) continue;
            w.hits.set(e, 0.35);
            damageEnemy(e, j, w.damage, e.x - player.x, e.y - player.y, 10);
          }
        }
      },
      drawAbove(w) { for (const pt of ringPoints(w)) drawSprite('yinyang', pt.x, pt.y, { rot: anim * 5 }); },
    },
    yangui: {
      sect: 'mudang', name: () => '양의검진', icon: () => '🌀',
      desc: '검진이 요괴를 안쪽으로 끌어당기며 베어요', up: '범위 +12, 데미지 +3', max: 6,
      create: () => ({ damage: 6, radius: 120, tick: 0.5, timer: 0, pull: 70 }),
      upgrade(w) { w.radius += 12; w.damage += 3; },
      update(w, dt) {
        const r = w.radius * player.area;
        for (const e of enemies) {
          const d = dist(e.x, e.y, player.x, player.y);
          if (d < r && d > 40 && !e.type.boss) {
            e.x += ((player.x - e.x) / d) * w.pull * dt;
            e.y += ((player.y - e.y) / d) * w.pull * dt;
          }
        }
        if ((w.timer -= dt) > 0) return;
        w.timer = w.tick;
        for (let j = enemies.length - 1; j >= 0; j--) {
          const e = enemies[j];
          if (dist(e.x, e.y, player.x, player.y) < r + e.type.radius) damageEnemy(e, j, w.damage, 0, 0, 0, true);
        }
      },
      drawBelow(w) {
        const r = w.radius * player.area;
        ctx.lineWidth = 3;
        ctx.setLineDash([14, 10]);
        ctx.lineDashOffset = -anim * 40;
        ctx.strokeStyle = 'rgba(42, 34, 36, 0.55)';
        ctx.beginPath();
        ctx.arc(player.x, player.y, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.lineDashOffset = -anim * 40 + 12;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.beginPath();
        ctx.arc(player.x, player.y, r - 6, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      },
    },
    yeorae: {
      sect: 'sorim', name: () => '여래신장', icon: () => '🖐️',
      desc: '하늘에서 거대한 금빛 손바닥을 내리쳐요', up: '데미지 +12, 범위 +10', max: 6,
      create: () => ({ damage: 40, count: 1, radius: 90, cooldown: 2.8, timer: 1 }),
      upgrade(w) { w.damage += 12; w.radius += 10; },
      update(w, dt) {
        if ((w.timer -= dt) > 0) return;
        const near = enemies.filter((e) => dist(e.x, e.y, player.x, player.y) < 380);
        if (!near.length) return;
        w.timer = w.cooldown * player.haste;
        for (const e of shuffled(near).slice(0, w.count)) {
          shells.push({ kind: 'drop', sprite: 'palm', tx: e.x, ty: e.y, t: 0, dur: 0.5, damage: w.damage, radius: w.radius * player.area, push: 20, colors: ['#f0c350', '#fff3c0', '#c99a3a'], ringColor: 'gold' });
        }
      },
    },
    geumgang: {
      sect: 'sorim', name: () => '금강신공', icon: () => '🛕',
      desc: '잠시 금강불괴가 되어 피해를 받지 않고, 주변을 금빛으로 쳐내요', up: '데미지 +8, 무적 시간 +0.2초', max: 6,
      create: () => ({ damage: 20, radius: 100, cooldown: 7, timer: 3, guard: 1.2 }),
      upgrade(w) { w.damage += 8; w.guard += 0.2; },
      update(w, dt) {
        if ((w.timer -= dt) > 0) return;
        w.timer = w.cooldown * player.haste;
        player.invuln = Math.max(player.invuln, w.guard);
        player.glow = Math.max(player.glow, w.guard);
        ringBlast(player.x, player.y, w.radius * player.area, w.damage, 20, 'gold');
      },
    },
    tagu: {
      sect: 'gaebang', name: () => '타구봉법', icon: () => '🥢',
      desc: '봉을 한 바퀴 휘둘러 둘러싼 요괴를 쳐내요', up: '데미지 +5, 범위 +8', max: 6,
      create: () => ({ damage: 13, radius: 85, cooldown: 1.2, timer: 0.4 }),
      upgrade(w) { w.damage += 5; w.radius += 8; },
      update(w, dt) {
        if ((w.timer -= dt) > 0) return;
        const r = w.radius * player.area;
        if (!nearestEnemy(r + 20)) return;
        w.timer = w.cooldown * player.haste;
        fx.push({ kind: 'spin', x: player.x, y: player.y, r, life: 0.25, max: 0.25 });
        ringBlast(player.x, player.y, r, w.damage, 20, 'none');
      },
    },
    bottle: {
      sect: 'gaebang', name: () => '취팔선 술병', icon: () => '🍶',
      desc: '술병을 던지면 터지며 다른 요괴에게 튕겨 가요', up: '데미지 +5, 2단계마다 튕김 +1', max: 6,
      create: () => ({ damage: 18, bounces: 2, cooldown: 1.6, timer: 0.5, radius: 50 }),
      upgrade(w) { w.damage += 5; if (w.level % 2 === 0) w.bounces++; },
      update(w, dt) {
        if ((w.timer -= dt) > 0) return;
        const t = nearestEnemy(420);
        if (!t) return;
        w.timer = w.cooldown * player.haste;
        shells.push({ sprite: 'bottle', sx: player.x, sy: player.y, tx: t.x, ty: t.y, t: 0, dur: 0.45, damage: w.damage, radius: w.radius * player.area, bounces: w.bounces, colors: ['#d69646', '#fff3c0', '#e0503f'] });
      },
    },
    needles: {
      sect: 'dang', name: () => '만천화우', icon: () => '📍',
      desc: '사방으로 암기를 비처럼 뿌려요', up: '암기 +3, 데미지 +2', max: 6,
      create: () => ({ damage: 6, count: 10, cooldown: 1.5, timer: 0.4, speed: 470 }),
      upgrade(w) { w.count += 3; w.damage += 2; },
      update(w, dt) {
        if ((w.timer -= dt) > 0) return;
        if (!nearestEnemy(420)) return;
        w.timer = w.cooldown * player.haste;
        const n = w.count + player.extra * 2;
        const off = Math.random() * Math.PI;
        for (let i = 0; i < n; i++) {
          const a = off + (i / n) * Math.PI * 2;
          projectiles.push({
            x: player.x, y: player.y, vx: Math.cos(a) * w.speed, vy: Math.sin(a) * w.speed,
            damage: w.damage, pierce: 1 + player.pierce, radius: 7, sprite: 'needle', life: 0.75, hit: new Set(),
          });
        }
      },
    },
    dokmu: {
      sect: 'dang', name: () => '당가독무', icon: () => '🧪',
      desc: '요괴 무리 한가운데 맹독 안개를 피워요', up: '데미지 +3, 안개 크기 +8', max: 6,
      create: () => ({ damage: 7, radius: 60, life: 4, cooldown: 1.6, timer: 0.5 }),
      upgrade(w) { w.damage += 3; w.radius += 8; },
      update(w, dt) {
        if ((w.timer -= dt) > 0) return;
        const t = nearestEnemy(380);
        if (!t) return;
        w.timer = w.cooldown * player.haste;
        zones.push({ x: t.x, y: t.y, r: w.radius * player.area, damage: w.damage, life: w.life * player.durMul, max: w.life * player.durMul, tick: 0, seed: Math.random() * 10, tint: 'green' });
      },
    },
    skysword: {
      sect: 'namgung', name: () => '창궁검우', icon: () => '⚔️',
      desc: '하늘에서 거대한 검을 떨어뜨려요', up: '검 +1, 데미지 +6', max: 6,
      create: () => ({ damage: 28, count: 1, cooldown: 1.8, timer: 0.6, radius: 40 }),
      upgrade(w) { w.count++; w.damage += 6; },
      update(w, dt) {
        if ((w.timer -= dt) > 0) return;
        const near = enemies.filter((e) => dist(e.x, e.y, player.x, player.y) < 360);
        if (!near.length) return;
        w.timer = w.cooldown * player.haste;
        for (const e of shuffled(near).slice(0, w.count)) {
          shells.push({ kind: 'drop', sprite: 'bigsword', tx: e.x, ty: e.y, t: 0, dur: 0.3, damage: w.damage, radius: w.radius * player.area, push: 12, colors: ['#ffffff', '#c8cdd4', '#c99a3a'] });
        }
      },
    },
    jewang: {
      sect: 'namgung', name: () => '제왕검형', icon: () => '👑',
      desc: '제왕의 위엄이 담긴 굵은 금빛 검강을 쏘아요', up: '데미지 +9, 굵기 +4', max: 6,
      create: () => ({ damage: 26, width: 24, length: 420, cooldown: 2.3, timer: 0.6 }),
      upgrade(w) { w.damage += 9; w.width += 4; },
      update(w, dt) {
        if ((w.timer -= dt) > 0) return;
        const t = nearestEnemy(w.length);
        if (!t) return;
        w.timer = w.cooldown * player.haste;
        beamStrike(Math.atan2(t.y - player.y, t.x - player.x), w.length, w.width, w.damage, 'gold');
      },
    },
    binbaek: {
      sect: 'bukhae', name: () => '빙백신장', icon: () => '🥶',
      desc: '얼음 장력을 터뜨려 주변 요괴를 꽁꽁 얼려요', up: '데미지 +5, 범위 +12', max: 6,
      create: () => ({ damage: 12, radius: 100, cooldown: 1.7, timer: 0.6, freeze: 2 }),
      upgrade(w) { w.damage += 5; w.radius += 12; },
      update(w, dt) {
        if ((w.timer -= dt) > 0) return;
        const r = w.radius * player.area;
        if (!nearestEnemy(r + 30)) return;
        w.timer = w.cooldown * player.haste;
        ringBlast(player.x, player.y, r, w.damage, 0, 'ice', (e) => { e.chill = w.freeze; });
      },
    },
    hanbing: {
      sect: 'bukhae', name: () => '한빙기', icon: () => '🌨️',
      desc: '몸에서 냉기를 뿜어 주변 요괴를 느리게 하고 얼려요', up: '범위 +12, 데미지 +2', max: 6,
      create: () => ({ damage: 4, radius: 90, tick: 0.5, timer: 0 }),
      upgrade(w) { w.radius += 12; w.damage += 2; },
      update(w, dt) {
        if ((w.timer -= dt) > 0) return;
        w.timer = w.tick;
        const r = w.radius * player.area;
        for (let j = enemies.length - 1; j >= 0; j--) {
          const e = enemies[j];
          if (dist(e.x, e.y, player.x, player.y) >= r + e.type.radius) continue;
          e.chill = Math.max(e.chill || 0, 0.6);
          damageEnemy(e, j, w.damage, 0, 0, 0, true);
        }
      },
      drawBelow(w) {
        ctx.fillStyle = 'rgba(190, 230, 255, 0.18)';
        ctx.strokeStyle = 'rgba(140, 200, 240, 0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(player.x, player.y, w.radius * player.area, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      },
    },
    cheonmasingong: {
      sect: 'magyo', name: () => '천마신공', icon: () => '😈',
      desc: '붉은 마기를 폭발시키고, 맞은 요괴 수만큼 HP를 흡수해요', up: '데미지 +8, 범위 +12', max: 6,
      create: () => ({ damage: 22, radius: 130, cooldown: 1.5, timer: 0.6 }),
      upgrade(w) { w.damage += 8; w.radius += 12; },
      update(w, dt) {
        if ((w.timer -= dt) > 0) return;
        const r = w.radius * player.area;
        if (!nearestEnemy(r)) return;
        w.timer = w.cooldown * player.haste;
        let hits = 0;
        ringBlast(player.x, player.y, r, w.damage, 14, 'blood', () => { hits++; });
        heal(Math.min(5, hits * 0.5));
      },
    },
    hyeolma: {
      sect: 'magyo', name: () => '혈마검', icon: () => '🩸',
      desc: '앞뒤로 핏빛 검기를 날리고, 벤 만큼 HP를 흡수해요', up: '데미지 +7 (3단계부터 네 방향)', max: 6,
      create: () => ({ damage: 20, dirs: 2, length: 320, width: 14, cooldown: 1.8, timer: 0.6 }),
      upgrade(w) { w.damage += 7; if (w.level === 3) w.dirs = 4; },
      update(w, dt) {
        if ((w.timer -= dt) > 0) return;
        const t = nearestEnemy(w.length);
        if (!t) return;
        w.timer = w.cooldown * player.haste;
        const base = Math.atan2(t.y - player.y, t.x - player.x);
        for (let i = 0; i < w.dirs; i++) {
          beamStrike(base + (i / w.dirs) * Math.PI * 2, w.length, w.width, w.damage, 'blood', () => heal(0.3));
        }
      },
    },
  });

  Object.assign(WEAPONS, {
    emeija: {
      sect: 'aemi', name: () => '아미자', icon: () => '🥢',
      desc: '양손의 아미자를 던졌다가 다시 받아요', up: '데미지 +4, 2단계마다 아미자 +1', max: 6,
      create: () => ({ damage: 10, count: 2, cooldown: 0.9, timer: 0.3, range: 170, speed: 540 }),
      upgrade(w) { w.damage += 4; if (w.level % 2 === 0) w.count++; },
      update(w, dt) {
        if ((w.timer -= dt) > 0) return;
        const t = nearestEnemy(360);
        if (!t) return;
        w.timer = w.cooldown * player.haste;
        const base = Math.atan2(t.y - player.y, t.x - player.x);
        const n = w.count + player.extra;
        for (let i = 0; i < n; i++) {
          const a = base + (i - (n - 1) / 2) * 0.35;
          projectiles.push({
            kind: 'boomerang', x: player.x, y: player.y, vx: Math.cos(a) * w.speed, vy: Math.sin(a) * w.speed,
            damage: w.damage, pierce: Infinity, radius: 10, sprite: 'needle', life: 3, traveled: 0, range: w.range, returning: false, hit: new Set(),
          });
        }
      },
    },
    geumjeong: {
      sect: 'aemi', name: () => '금정불광', icon: () => '🪷',
      desc: '금빛 불광으로 자신을 치유하고 주변 요괴를 밀어내요', up: '회복 +2, 데미지 +5', max: 6,
      create: () => ({ damage: 15, radius: 110, heal: 5, cooldown: 4, timer: 2 }),
      upgrade(w) { w.heal += 2; w.damage += 5; },
      update(w, dt) {
        if ((w.timer -= dt) > 0) return;
        w.timer = w.cooldown * player.haste;
        heal(w.heal);
        ringBlast(player.x, player.y, w.radius * player.area, w.damage, 22, 'gold');
      },
    },
    seolgeom: {
      sect: 'gonryun', name: () => '곤륜설검', icon: () => '🏔️',
      desc: '눈보라 같은 검기로 꿰뚫고 얼려요', up: '데미지 +6, 2단계마다 검기 +1', max: 6,
      create: () => ({ damage: 18, count: 1, length: 380, width: 13, cooldown: 1.7, timer: 0.5 }),
      upgrade(w) { w.damage += 6; if (w.level % 2 === 0) w.count++; },
      update(w, dt) {
        if ((w.timer -= dt) > 0) return;
        const t = nearestEnemy(w.length);
        if (!t) return;
        w.timer = w.cooldown * player.haste;
        const base = Math.atan2(t.y - player.y, t.x - player.x);
        const n = w.count + player.extra;
        for (let i = 0; i < n; i++) {
          beamStrike(base + (i - (n - 1) / 2) * 0.3, w.length, w.width, w.damage, 'ice', (e) => { e.chill = 1.5; });
        }
      },
    },
    leap: {
      sect: 'gonryun', name: () => '능공허도', icon: () => '☁️',
      desc: '허공을 밟고 뛰어올라 잠시 빨라지고, 내려설 때 바람을 일으켜요', up: '데미지 +5, 빨라지는 시간 +0.3초', max: 6,
      create: () => ({ damage: 14, radius: 90, boost: 1.5, cooldown: 3, timer: 1 }),
      upgrade(w) { w.damage += 5; w.boost += 0.3; },
      update(w, dt) {
        if ((w.timer -= dt) > 0) return;
        w.timer = w.cooldown * player.haste;
        player.boost = w.boost;
        ringBlast(player.x, player.y, w.radius * player.area, w.damage, 18, 'ice');
      },
    },
    formation: {
      sect: 'jegal', name: () => '팔진도', icon: () => '🔯',
      desc: '요괴 무리 위에 진법을 펼쳐 발을 묶고 피해를 줘요', up: '데미지 +3, 진 크기 +10', max: 6,
      create: () => ({ damage: 6, radius: 80, life: 5, cooldown: 3, timer: 0.8 }),
      upgrade(w) { w.damage += 3; w.radius += 10; },
      update(w, dt) {
        if ((w.timer -= dt) > 0) return;
        const t = nearestEnemy(360);
        if (!t) return;
        w.timer = w.cooldown * player.haste;
        zones.push({ x: t.x, y: t.y, r: w.radius * player.area, damage: w.damage, life: w.life * player.durMul, max: w.life * player.durMul, tick: 0, seed: Math.random() * 10, tint: 'formation', hold: 0.75 });
      },
    },
    fan: {
      sect: 'jegal', name: () => '학우선', icon: () => '🪶',
      desc: '깃털 부채를 부쳐 요괴를 휩쓰는 바람을 날려요', up: '데미지 +4, 바람 +1', max: 6,
      create: () => ({ damage: 9, count: 3, cooldown: 1.6, timer: 0.5, radius: 22 }),
      upgrade(w) { w.damage += 4; w.count++; },
      update(w, dt) {
        if ((w.timer -= dt) > 0) return;
        const t = nearestEnemy(400);
        if (!t) return;
        w.timer = w.cooldown * player.haste;
        const base = Math.atan2(t.y - player.y, t.x - player.x);
        const n = w.count + player.extra;
        for (let i = 0; i < n; i++) {
          const a = base + (i - (n - 1) / 2) * 0.28;
          projectiles.push({
            kind: 'tornado', x: player.x, y: player.y, vx: Math.cos(a) * 260, vy: Math.sin(a) * 260,
            damage: w.damage, pierce: Infinity, radius: w.radius, life: 1.6, rehit: 0.4, hit: new Set(),
          });
        }
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


  // ---------- Heroes ----------
  // One form per hero; each has its own starting weapon and a trait.
  const HEROES = {
    cheongpung: {
      name: '청풍', role: '검객', weapon: 'shot', hp: 100, speed: 195,
      trait: '치명타 확률 +15%, 치명타 피해 ×2.5',
      setup(p) { p.crit += 0.15; p.critMul = 2.5; },
    },
    unhak: {
      sect: 'mudang', name: '운학', role: '무당파 도사', weapon: 'lightning', hp: 110, speed: 185,
      trait: '모든 무공 대기시간 -15%',
      setup(p) { p.haste *= 0.85; },
    },
    yeoubi: {
      name: '여우비', role: '구미호', weapon: 'orbit', hp: 90, speed: 215,
      trait: '가장 빠름, 요괴 4마리를 쓰러뜨릴 때마다 HP 1 회복',
      setup(p) { p.killHeal = 0.25; },
    },
    cheolsan: {
      sect: 'sorim', name: '철산', role: '소림 무승', weapon: 'quake', hp: 150, speed: 170,
      trait: '최대 HP 150, 받는 피해 -15% (느림)',
      setup(p) { p.armor *= 0.85; },
    },
    dallae: {
      name: '달래', role: '무녀', weapon: 'fairy', hp: 100, speed: 190,
      trait: '얻는 경험치 +25%, 엽전 줍는 범위 +50%',
      setup(p) { p.xpMul += 0.25; p.pickupRadius *= 1.5; },
    },
    yawol: {
      name: '야월', role: '자객', weapon: 'boomerang', hp: 95, speed: 210,
      trait: '모든 무공 발사 수 +1 (HP 낮음)',
      setup(p) { p.extra += 1; },
    },
    songhwa: {
      name: '송화', role: '약사', weapon: 'thorn', hp: 105, speed: 190,
      trait: '초당 HP 1 회복, 모든 범위 +20%',
      setup(p) { p.regen += 1; p.area *= 1.2; },
    },
    muyeong: {
      name: '무영', role: '검귀', weapon: 'slash', hp: 100, speed: 200,
      trait: '모든 피해 +15%, 조금 빠름',
      setup(p) { p.dmgMul += 0.15; },
    },
    geumbi: {
      name: '금비', role: '부적술사', weapon: 'mine', hp: 100, speed: 190,
      trait: '대기시간 -10%, 지속시간 +30%',
      setup(p) { p.haste *= 0.9; p.durMul += 0.3; },
    },
    seola: {
      sect: 'bukhae', name: '설아', role: '북해빙궁 설녀', weapon: 'icicle', hp: 100, speed: 190,
      trait: '가까이 온 요괴가 얼어서 느려져요',
      setup(p) { p.chillAura = 85; },
    },
    cheonma: {
      sect: 'magyo', name: '천마', role: '마교 교주', weapon: 'cheonmasingong', extra: 'hyeolma', hp: 160, speed: 205, unlock: 'survive10',
      trait: '천마신공·혈마검을 들고 시작, 모든 피해 +50%, 치명타 +10%',
      setup(p) { p.dmgMul += 0.5; p.crit += 0.1; },
    },
    sansin: {
      name: '산신령', role: '산의 주인', weapon: 'aura', extra: 'orbit', hp: 200, speed: 195, unlock: 'combo5',
      trait: '결계·여우불을 들고 시작, 초당 HP 3 회복, 대기시간 -15%',
      setup(p) { p.regen += 3; p.haste *= 0.85; },
    },
    baekmae: {
      sect: 'hwasan', name: '백매', role: '화산파 검수', weapon: 'plum', hp: 100, speed: 200,
      trait: '치명타 확률 +10%, 꽃잎이 요괴를 하나 더 꿰뚫어요',
      setup(p) { p.crit += 0.1; p.pierce += 1; },
    },
    palgeol: {
      sect: 'gaebang', name: '팔걸', role: '개방 방도', weapon: 'tagu', hp: 120, speed: 190,
      trait: '엽전 줍는 범위 +40%, 복숭아·인삼 회복량 2배',
      setup(p) { p.pickupRadius *= 1.4; p.healMul = 2; },
    },
    dangyu: {
      sect: 'dang', name: '당유', role: '사천당가 암기술사', weapon: 'needles', hp: 90, speed: 205,
      trait: '중독된 듯 모든 지속 피해 +40%, 조금 빠름',
      setup(p) { p.dotMul = 1.4; },
    },
    namgung: {
      sect: 'namgung', name: '남궁휘', role: '남궁세가 소가주', weapon: 'jewang', hp: 115, speed: 190,
      trait: '모든 피해 +20%, 보스에게 피해 +50%',
      setup(p) { p.dmgMul += 0.2; p.bossMul = 1.5; },
    },
    aemi: {
      sect: 'aemi', name: '청아', role: '아미파 여협', weapon: 'emeija', hp: 105, speed: 200,
      trait: '초당 HP 1 회복, 받는 피해 -10%',
      setup(p) { p.regen += 1; p.armor *= 0.9; },
    },
    gonryun: {
      sect: 'gonryun', name: '설운', role: '곤륜파 검수', weapon: 'seolgeom', hp: 100, speed: 210,
      trait: '빠름, 치명타 확률 +5%',
      setup(p) { p.crit += 0.05; },
    },
    jegal: {
      sect: 'jegal', name: '제갈연', role: '제갈세가 군사', weapon: 'formation', hp: 95, speed: 190,
      trait: '얻는 경험치 +20%, 대기시간 -10%',
      setup(p) { p.xpMul += 0.2; p.haste *= 0.9; },
    },
    maengju: {
      allSects: true, name: '무림맹주', role: '천하제일인', weapon: 'jewang', extra: 'plum', hp: 180, speed: 205, unlock: 'sectUlt3',
      trait: '모든 문파의 무공을 배울 수 있음, 모든 피해 +30%, 대기시간 -10%',
      setup(p) { p.dmgMul += 0.3; p.haste *= 0.9; },
    },
  };

  // ---------- Combos ----------
  // A weapon at max level plus its paired passive unlocks a gold combo card on level-up.
  const COMBOS = {
    shot: { passive: 'haste', name: '만검귀종', icon: '⚔️', desc: '비검이 비처럼 쏟아져요. 발사 +4, 관통 +3, 데미지 ×1.5',
      apply(w) { w.count += 4; w.pierce += 3; w.damage *= 1.5; } },
    orbit: { passive: 'area', name: '구미호화', icon: '🦊', desc: '여우불 9개가 크게 돌며 불태워요. 데미지 ×2',
      apply(w) { w.count = Math.max(w.count, 9); w.dist += 30; w.damage *= 2; } },
    boomerang: { passive: 'speed', name: '천월륜', icon: '🌕', desc: '원월륜 +3, 사거리 +100, 데미지 ×1.6',
      apply(w) { w.count += 3; w.range += 100; w.damage *= 1.6; } },
    lightning: { passive: 'xp', name: '천벌뢰', icon: '🌩️', desc: '벼락 +5, 데미지 ×1.8, 대기시간 -40%',
      apply(w) { w.count += 5; w.damage *= 1.8; w.cooldown *= 0.6; } },
    aura: { passive: 'armor', name: '금강결계', icon: '🔱', desc: '결계 범위 +50, 데미지 ×2, 요괴를 거의 멈춰 세워요',
      apply(w) { w.radius += 50; w.damage *= 2; w.slow = 0.65; } },
    quake: { passive: 'hp', name: '태산압정', icon: '⛰️', desc: '장풍 범위 +80, 데미지 ×2, 대기시간 -40%',
      apply(w) { w.radius += 80; w.damage *= 2; w.cooldown *= 0.6; } },
    beam: { passive: 'crit', name: '일섬', icon: '✨', desc: '검기 +2, 더 굵게, 데미지 ×1.8',
      apply(w) { w.count += 2; w.width += 10; w.damage *= 1.8; } },
    firework: { passive: 'luck', name: '화룡부', icon: '🐉', desc: '부적 +3, 폭발 범위 +40',
      apply(w) { w.count += 3; w.radius += 40; } },
    fairy: { passive: 'extra', name: '학의 군무', icon: '🦢', desc: '종이학 +6, 데미지 ×1.5',
      apply(w) { w.count += 6; w.damage *= 1.5; } },
    thorn: { passive: 'regen', name: '만독지대', icon: '🧪', desc: '독안개 크기 +30, 데미지 ×2, 유지시간 +3초',
      apply(w) { w.radius += 30; w.damage *= 2; w.life += 3; } },
  };
  Object.assign(COMBOS, {
    slash: { passive: 'dmg', name: '쌍룡참', icon: '🐲', desc: '항상 양쪽을 크게 베어요. 범위 +60, 데미지 ×2',
      apply(w) { w.count = 2; w.range += 60; w.height += 30; w.damage *= 2; } },
    icicle: { passive: 'pierce', name: '빙창우', icon: '❄️', desc: '얼음 +5, 폭발 범위 +15, 데미지 ×1.6',
      apply(w) { w.count += 5; w.radius += 15; w.damage *= 1.6; } },
    tornado: { passive: 'duration', name: '천풍', icon: '🌀', desc: '회오리 +2, 크기 +20, 오래 지속, 데미지 ×1.5',
      apply(w) { w.count += 2; w.radius += 20; w.life *= 2; w.damage *= 1.5; } },
    mine: { passive: 'magnet', name: '천라지망', icon: '🕸️', desc: '지뢰부가 요괴를 끌어당기고, 범위 +30, 데미지 ×1.5',
      apply(w) { w.pull = 1; w.radius += 30; w.damage *= 1.5; } },
  });
  Object.assign(COMBOS, {
    plum: { partner: 'plumrain', name: '매화만개', icon: '💮', desc: '꽃잎 +10, 관통 +3, 데미지 ×1.6. 하늘이 매화로 뒤덮여요',
      apply(w) { w.count += 10; w.pierce += 3; w.damage *= 1.6; } },
    taiji: { partner: 'yangui', name: '태극무극', icon: '☯️', desc: '태극검 6자루가 더 크게 돌아요. 데미지 ×2',
      apply(w) { w.count = 6; w.dist += 40; w.damage *= 2; } },
    yeorae: { partner: 'geumgang', name: '천수여래장', icon: '🙏', desc: '손바닥 3개가 한꺼번에 떨어져요. 범위 +40, 데미지 ×1.8',
      apply(w) { w.count = 3; w.radius += 40; w.damage *= 1.8; } },
    tagu: { partner: 'bottle', name: '광걸난무', icon: '🌪️', desc: '범위 +50, 데미지 ×2, 대기시간 -40%',
      apply(w) { w.radius += 50; w.damage *= 2; w.cooldown *= 0.6; } },
    needles: { partner: 'dokmu', name: '폭우이화침', icon: '🌧️', desc: '암기 +16, 데미지 ×1.5',
      apply(w) { w.count += 16; w.damage *= 1.5; } },
    skysword: { partner: 'jewang', name: '제왕검우', icon: '🗡️', desc: '검 +6, 범위 +20, 데미지 ×1.7',
      apply(w) { w.count += 6; w.radius += 20; w.damage *= 1.7; } },
    binbaek: { partner: 'hanbing', name: '북해빙결', icon: '🧊', desc: '범위 +80, 데미지 ×2, 4초 동안 얼려요',
      apply(w) { w.radius += 80; w.damage *= 2; w.freeze = 4; } },
    cheonmasingong: { partner: 'hyeolma', name: '천마군림', icon: '👹', desc: '범위 +100, 데미지 ×2.2',
      apply(w) { w.radius += 100; w.damage *= 2.2; } },
  });
  Object.assign(COMBOS, {
    emeija: { partner: 'geumjeong', name: '아미금정', icon: '🪷', desc: '아미자 +4, 사거리 +80, 데미지 ×2',
      apply(w) { w.count += 4; w.range += 80; w.damage *= 2; } },
    seolgeom: { partner: 'leap', name: '설산비천', icon: '🌨️', desc: '검기 +2, 더 굵게, 데미지 ×2',
      apply(w) { w.count += 2; w.width += 10; w.damage *= 2; } },
    formation: { partner: 'fan', name: '와룡천진', icon: '🐲', desc: '진이 두 배로 커지고 오래가며 데미지 ×2.2',
      apply(w) { w.radius *= 2; w.life += 3; w.damage *= 2.2; } },
  });
  const comboRecipe = (id) => {
    const c = COMBOS[id];
    return c.partner
      ? `${WEAPONS[id].icon()} ${WEAPONS[id].name()} + ${WEAPONS[c.partner].icon()} ${WEAPONS[c.partner].name()}`
      : `${WEAPONS[id].icon()} ${WEAPONS[id].name()} + ${PASSIVE_BY_ID[c.passive].icon} ${PASSIVE_BY_ID[c.passive].title}`;
  };
  const weaponName = (id) => (player.weapons[id]?.evolved ? COMBOS[id].name : WEAPONS[id].name());
  const weaponIcon = (id) => (player.weapons[id]?.evolved ? COMBOS[id].icon : WEAPONS[id].icon());

  // ---------- Enemies ----------
  const ENEMY_TYPES = {
    wisp: { name: '도깨비불', sprite: 'wisp', hp: 10, speed: 85, damage: 6, radius: 12, xp: 3, weight: 3, barY: 16 },
    dokkaebi: { name: '꼬마도깨비', sprite: 'dokkaebi', hp: 26, speed: 62, damage: 10, radius: 15, xp: 7, weight: 2, minTime: 35, barY: 22 },
    crow: { name: '까마귀요괴', sprite: 'crow', hp: 8, speed: 120, damage: 4, radius: 11, xp: 3, weight: 1.5, minTime: 75, barY: 14, move: 'zigzag' },
    meok: { name: '먹물요괴', sprite: 'meok', hp: 24, speed: 75, damage: 8, radius: 14, xp: 6, weight: 1.2, minTime: 120, barY: 18, split: 'meokMini' },
    meokMini: { name: '꼬마먹물', sprite: 'meok', scale: 0.6, hp: 8, speed: 105, damage: 4, radius: 9, xp: 2, weight: 0, barY: 12 },
    jangseung: { name: '돌장승', sprite: 'jangseung', hp: 70, speed: 38, damage: 12, radius: 16, xp: 12, weight: 1, minTime: 150, barY: 26 },
    wongwi: { name: '원귀', sprite: 'wongwi', hp: 22, speed: 88, damage: 7, radius: 14, xp: 8, weight: 1, minTime: 210, barY: 22, move: 'float', alpha: 0.85 },
    gangsi: { name: '강시', sprite: 'gangsi', hp: 40, speed: 70, damage: 11, radius: 15, xp: 9, weight: 1.2, minTime: 270, barY: 24, move: 'hop' },
    eodukssini: { name: '어둑시니', sprite: 'eodukssini', hp: 30, speed: 80, damage: 10, radius: 15, xp: 9, weight: 1, minTime: 330, barY: 24, grows: true, alpha: 0.9 },
    bulgasari: { name: '불가사리', sprite: 'bulgasari', hp: 160, speed: 34, damage: 16, radius: 18, xp: 25, weight: 0.4, minTime: 360, barY: 24 },
    daedokkaebi: { name: '대도깨비', sprite: 'daedokkaebi', hp: 260, speed: 48, damage: 18, radius: 24, xp: 50, boss: true, barY: 34 },
    imugi: { name: '이무기', sprite: 'imugi', hp: 380, speed: 40, damage: 22, radius: 24, xp: 70, boss: true, barY: 34 },
    seokdeung: { name: '석등', sprite: 'seokdeung', hp: 1, speed: 0, damage: 0, radius: 14, xp: 0, weight: 0, barY: 22, prop: true },
    jeoseung: { name: '저승사자', sprite: 'jeoseung', hp: 1500, speed: 72, damage: 40, radius: 28, xp: 300, boss: true, final: true, barY: 42, summon: true },
    heukyo: { name: '흑요장군', sprite: 'heukyo', hp: 330, speed: 52, damage: 20, radius: 24, xp: 60, boss: true, barY: 34, summon: true },
  };
  const BOSSES = [ENEMY_TYPES.daedokkaebi, ENEMY_TYPES.imugi, ENEMY_TYPES.heukyo];
  const MAX_ENEMIES = 260;
  // Bosses arrive on the minute (from 1:00), surround waves on the half minute (from 2:30).
  const EVENT_INTERVAL = 60;
  const BOSS_START = 60;
  const WAVE_START = 150;
  const FINAL_TIME = 900; // 15:00 — the Reaper comes; beating him clears the run
  const MARCH_TIMES = [420, 720]; // 백귀야행: a parade of ghosts crossing the screen (then every 5 min)

  // ---------- Passive upgrades ----------
  const PASSIVES = [
    { id: 'hp', max: 5, icon: '💗', title: '단전호흡', desc: '최대 HP +20, HP 20 회복', apply(p) { p.maxHp += 20; p.hp = Math.min(p.maxHp, p.hp + 20); } },
    { id: 'haste', max: 4, icon: '⏳', title: '쾌속', desc: '모든 무공 대기시간 -10%', apply(p) { p.haste *= 0.9; } },
    { id: 'speed', max: 3, icon: '🍃', title: '경공', desc: '이동 속도 +10%', apply(p) { p.speed *= 1.1; } },
    { id: 'magnet', max: 3, icon: '🧲', title: '흡성대법', desc: '엽전 줍는 범위 +30%', apply(p) { p.pickupRadius *= 1.3; } },
    { id: 'regen', max: 4, icon: '🍵', title: '운기조식', desc: '초당 HP 1 회복', apply(p) { p.regen += 1; } },
    { id: 'crit', max: 4, icon: '🎯', title: '급소 찌르기', desc: '치명타 확률 +10%', apply(p) { p.crit += 0.1; } },
    { id: 'xp', max: 3, icon: '📜', title: '깨달음', desc: '얻는 경험치 +15%', apply(p) { p.xpMul += 0.15; } },
    { id: 'armor', max: 4, icon: '🛡️', title: '금강불괴', desc: '받는 피해 -8%', apply(p) { p.armor *= 0.92; } },
    { id: 'area', max: 4, icon: '☯️', title: '내공', desc: '결계·장풍·폭염부·독안개 범위 +12%', apply(p) { p.area *= 1.12; } },
    { id: 'extra', max: 2, icon: '👥', title: '분신술', desc: '비검·원월륜·검기·폭염부·종이학 발사 수 +1', apply(p) { p.extra++; } },
    { id: 'luck', max: 3, icon: '🧧', title: '복주머니', desc: '복숭아·인삼·호리병·벽력탄이 더 자주 나와요', apply(p) { p.luck += 0.4; } },
  ];
  PASSIVES.push(
    { id: 'dmg', max: 5, icon: '🩸', title: '혈기', desc: '모든 피해 +10%', apply(p) { p.dmgMul += 0.1; } },
    { id: 'duration', max: 3, icon: '🕯️', title: '집중', desc: '독안개·회오리·지뢰부 지속시간 +20%', apply(p) { p.durMul += 0.2; } },
    { id: 'pierce', max: 3, icon: '🏹', title: '관통술', desc: '비검·종이학이 요괴를 하나 더 꿰뚫어요', apply(p) { p.pierce++; } },
  );
  const PASSIVE_BY_ID = Object.fromEntries(PASSIVES.map((u) => [u.id, u]));
  // Offered to fill the row once everything else is maxed out.
  const SNACK = { icon: '🍑', title: '천도복숭아', desc: 'HP 30 회복', pick: () => { player.hp = Math.min(player.maxHp, player.hp + 30); } };

  // ---------- Progress & achievements (saved per browser) ----------
  const PROGRESS_KEY = 'yokai-survivors-progress';
  const progress = { totalKills: 0, combos: [], achievements: [], played: [], bosses: {}, gold: 0, totalGold: 0, shop: {}, wins: 0 };
  try { Object.assign(progress, JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}')); } catch (e) { /* storage unavailable */ }
  const seen = new Set(progress.combos);
  function saveProgress() {
    progress.combos = [...seen];
    try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress)); } catch (e) { /* storage unavailable */ }
  }
  function markSeen(id) {
    if (seen.has(id)) return;
    seen.add(id);
    saveProgress();
  }

  // ---------- 수련장: permanent upgrades bought with 은자 between runs ----------
  const SHOP = [
    { id: 'might', icon: '🩸', name: '혈기 수련', desc: '모든 피해 +5%', max: 5, cost: 120, apply(p) { p.dmgMul += 0.05; } },
    { id: 'body', icon: '💗', name: '신체 단련', desc: '최대 HP +10', max: 5, cost: 100, apply(p) { p.maxHp += 10; p.hp += 10; } },
    { id: 'armor', icon: '🛡️', name: '철포삼', desc: '받는 피해 -3%', max: 3, cost: 200, apply(p) { p.armor *= 0.97; } },
    { id: 'regen', icon: '🍵', name: '호흡법', desc: '초당 HP +0.2 회복', max: 5, cost: 150, apply(p) { p.regen += 0.2; } },
    { id: 'speed', icon: '🍃', name: '보법', desc: '이동 속도 +4%', max: 3, cost: 150, apply(p) { p.speed *= 1.04; } },
    { id: 'haste', icon: '⏳', name: '심법', desc: '무공 대기시간 -3%', max: 3, cost: 250, apply(p) { p.haste *= 0.97; } },
    { id: 'area', icon: '☯️', name: '내력', desc: '무공 범위 +5%', max: 3, cost: 200, apply(p) { p.area *= 1.05; } },
    { id: 'growth', icon: '📜', name: '총명', desc: '경험치 +4%', max: 5, cost: 120, apply(p) { p.xpMul += 0.04; } },
    { id: 'magnet', icon: '🧲', name: '흡기', desc: '줍는 범위 +15%', max: 3, cost: 100, apply(p) { p.pickupRadius *= 1.15; } },
    { id: 'luck', icon: '🧧', name: '길운', desc: '행운 +10% (아이템·큰 보물함)', max: 3, cost: 180, apply(p) { p.luck += 0.1; } },
    { id: 'greed', icon: '💰', name: '재물운', desc: '얻는 은자 +15%', max: 5, cost: 100, apply(p) { p.greed += 0.15; } },
    { id: 'reroll', icon: '🔄', name: '변통', desc: '레벨업 다시뽑기 +2', max: 3, cost: 150, apply(p) { p.rerolls += 2; } },
    { id: 'skip', icon: '⏭️', name: '인내', desc: '레벨업 넘기기 +2', max: 3, cost: 80, apply(p) { p.skips += 2; } },
    { id: 'banish', icon: '🚫', name: '봉인술', desc: '레벨업 봉인 +1', max: 3, cost: 200, apply(p) { p.banishes += 1; } },
    { id: 'revival', icon: '🪷', name: '환생', desc: '쓰러져도 한 번 HP 절반으로 되살아나요', max: 1, cost: 1200, apply(p) { p.revives += 1; } },
    { id: 'curse', icon: '💀', name: '마기', desc: '요괴 체력·속도·수 +10%, 은자 +20% (도전용)', max: 5, cost: 100, apply(p) { p.curse += 0.1; p.greed += 0.2; } },
  ];
  const shopLevel = (id) => progress.shop[id] || 0;
  const shopCost = (u) => u.cost * (shopLevel(u.id) + 1);
  function applyShop(p) {
    for (const u of SHOP) for (let i = 0; i < shopLevel(u.id); i++) u.apply(p);
  }

  const BASE_HEROES = () => Object.keys(HEROES).filter((id) => !HEROES[id].unlock);
  // check(player) runs during play; anything about past runs reads `progress`.
  const ACHIEVEMENTS = [
    { id: 'kill100', icon: '🗡️', name: '첫 사냥', desc: '한 판에 요괴 100마리 퇴치', check: () => kills >= 100 },
    { id: 'kill1000', icon: '👹', name: '백귀야행 정리', desc: '한 판에 요괴 1,000마리 퇴치', check: () => kills >= 1000 },
    { id: 'total10000', icon: '🏯', name: '요괴 사냥꾼', desc: '누적 요괴 10,000마리 퇴치', check: () => progress.totalKills >= 10000 },
    { id: 'survive3', icon: '🌙', name: '밤을 버티다', desc: '한 판에 3분 버티기', check: () => elapsed >= 180 },
    { id: 'survive5', icon: '🌒', name: '깊은 밤', desc: '한 판에 5분 버티기', check: () => elapsed >= 300 },
    { id: 'survive10', icon: '🌅', name: '새벽을 보다', desc: '한 판에 10분 버티기', check: () => elapsed >= 600 },
    { id: 'boss1', icon: '💀', name: '첫 대어', desc: '보스 요괴 처치', check: (p) => p.bossKills >= 1 },
    { id: 'bossAll', icon: '👑', name: '삼대 요괴', desc: '대도깨비·이무기·흑요장군을 모두 처치 (누적)', check: () => BOSSES.every((b) => progress.bosses[b.name]) },
    { id: 'combo1', icon: '✨', name: '첫 합성', desc: '무공 합성에 성공', check: () => seen.size >= 1 },
    { id: 'combo5', icon: '📖', name: '비급 수집가', desc: '서로 다른 합성 5가지 발견 (누적)', check: () => seen.size >= 5 },
    { id: 'comboAll', icon: '📚', name: '무공의 대가', desc: '모든 합성 발견', check: () => seen.size >= Object.keys(COMBOS).length },
    { id: 'combo3run', icon: '🔥', name: '삼합', desc: '한 판에 합성 3번', check: (p) => p.combos >= 3 },
    { id: 'level20', icon: '⛰️', name: '경지에 오르다', desc: '한 판에 Lv.20 도달', check: (p) => p.level >= 20 },
    { id: 'fullSlots', icon: '🎒', name: '무공 수집', desc: '무공 칸 5개를 모두 채우기', check: (p) => Object.keys(p.weapons).length >= MAX_WEAPONS },
    { id: 'chest3', icon: '🎁', name: '보물 사냥꾼', desc: '한 판에 보물함 3개 열기', check: (p) => p.chests >= 3 },
    { id: 'sectUlt1', icon: '🏮', name: '문파의 비전', desc: '문파 오의를 처음으로 깨우치기', check: () => [...seen].some((id) => COMBOS[id]?.partner) },
    { id: 'sectUlt3', icon: '🐉', name: '무림의 패자', desc: '서로 다른 문파 오의 3가지 발견 (누적)', check: () => [...seen].filter((id) => COMBOS[id]?.partner).length >= 3 },
    { id: 'realm3', icon: '🌀', name: '절정고수', desc: '한 판에 절정의 경지에 오르기', check: (p) => p.realm >= 3 },
    { id: 'realm5', icon: '☀️', name: '화경의 문턱', desc: '한 판에 화경의 경지에 오르기', check: (p) => p.realm >= 5 },
    { id: 'realm7', icon: '🌈', name: '생사경', desc: '한 판에 생사경에 오르기', check: (p) => p.realm >= 7 },
    { id: 'reaper', icon: '⚰️', name: '저승사자 퇴치', desc: '15:00에 나타나는 저승사자를 쓰러뜨리기', check: () => progress.wins >= 1 },
    { id: 'elite5', icon: '🌟', name: '정예 사냥', desc: '한 판에 정예 요괴 5마리 처치', check: (p) => p.elites >= 5 },
    { id: 'lantern20', icon: '🏮', name: '석등 파괴자', desc: '한 판에 석등 20개 부수기', check: (p) => p.lanterns >= 20 },
    { id: 'gold1000', icon: '💰', name: '부자 협객', desc: '누적 은자 1,000냥 모으기', check: () => progress.totalGold >= 1000 },
    { id: 'shop1', icon: '🥋', name: '수련의 시작', desc: '수련장에서 처음으로 수련하기', check: () => Object.keys(progress.shop).length > 0 },
    { id: 'cursed', icon: '💀', name: '마기를 품고', desc: '마기 3단계 이상으로 저승사자 퇴치', check: (p) => p.curse >= 0.29 && p.wonRun },
    { id: 'allHeroes', icon: '🧭', name: '팔도 유람', desc: '해금 없이 고를 수 있는 협객으로 모두 한 번씩 출정', check: () => BASE_HEROES().every((id) => progress.played.includes(id)) },
  ];
  const ACHV_BY_ID = Object.fromEntries(ACHIEVEMENTS.map((a) => [a.id, a]));
  const heroUnlocked = (id) => !HEROES[id].unlock || progress.achievements.includes(HEROES[id].unlock);

  let achvTimer = 0;
  function checkAchievements() {
    for (const a of ACHIEVEMENTS) {
      if (progress.achievements.includes(a.id) || !a.check(player)) continue;
      progress.achievements.push(a.id);
      saveProgress();
      const unlockedHero = Object.values(HEROES).find((h) => h.unlock === a.id);
      showToast(`🏆 업적 달성: ${a.name}`, unlockedHero ? `새 협객 해금! ${unlockedHero.name} · ${unlockedHero.role}` : a.desc);
    }
  }

  const toastQueue = [];
  let toastBusy = false;
  function showToast(title, sub) {
    toastQueue.push([title, sub]);
    if (!toastBusy) nextToast();
  }
  function nextToast() {
    const t = toastQueue.shift();
    if (!t) { toastBusy = false; ui.toast.classList.remove('show'); return; }
    toastBusy = true;
    ui.toastTitle.textContent = t[0];
    ui.toastSub.textContent = t[1];
    ui.toast.classList.add('show');
    setTimeout(() => { ui.toast.classList.remove('show'); setTimeout(nextToast, 350); }, 2600);
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
  let state = 'title'; // title | playing | choice | paused | gameover | victory
  let player, enemies, projectiles, pickups, particles, floatTexts, fx, shells, zones, mines;
  let elapsed = 0, kills = 0, spawnTimer = 0, bossTimer = 0, bossCount = 0, waveTimer = 0;
  let propTimer = 0, finalSpawned = false, marchIdx = 0, banked = 0, dmgSrc = 'item', banishMode = false;
  let modalDelay = 0, flash = 0, anim = 0;
  const modalQueue = [];
  const keys = new Set();

  function resetGame(heroId = 'cheongpung') {
    const hero = HEROES[heroId];
    player = {
      x: 0, y: 0,
      hero: heroId,
      radius: SPRITE_DEFS[heroId].size * 0.3,
      speed: hero.speed, maxHp: hero.hp, hp: hero.hp, regen: 0, pickupRadius: 100, haste: 1,
      crit: 0, critMul: 2, xpMul: 1, armor: 1, area: 1, extra: 0, luck: 1, chests: 0, killHeal: 0, combos: 0,
      dmgMul: 1, durMul: 1, pierce: 0, chillAura: 0, bossKills: 0, healMul: 1, dotMul: 1, bossMul: 1, realm: 0, boost: 0,
      gold: 0, greed: 1, curse: 0, revives: 0, rerolls: 1, skips: 1, banishes: 1, banished: new Set(), freeze: 0,
      elites: 0, lanterns: 0, dmgBy: {}, wonRun: false,
      level: 1, xp: 0, xpToNext: 10, picks: {},
      facing: -1, moving: false, invuln: 0, glow: 0,
      weapons: {},
    };
    hero.setup(player);
    applyShop(player);
    grantWeapon(player, hero.weapon);
    if (hero.extra) grantWeapon(player, hero.extra);
    enemies = [];
    projectiles = [];
    pickups = [];
    particles = [];
    floatTexts = [];
    fx = [];
    shells = [];
    zones = [];
    mines = [];
    achvTimer = 0;
    modalQueue.length = 0;
    elapsed = 0;
    kills = 0;
    spawnTimer = 0;
    bossTimer = 0;
    bossCount = 0;
    waveTimer = 0;
    propTimer = 2;
    finalSpawned = false;
    marchIdx = 0;
    banked = 0;
    banishMode = false;
    modalDelay = 0;
    flash = 0;
    ui.portrait.src = spritePath(heroId);
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

  // ---------- Realm (경지) & sect rank (직위) ----------
  // Cultivation = total technique levels + 4 per combo + one per two passive picks.
  const REALMS = [
    { name: '삼류', need: 0 }, { name: '이류', need: 4 }, { name: '일류', need: 9 }, { name: '절정', need: 15 },
    { name: '초절정', need: 22 }, { name: '화경', need: 30 }, { name: '현경', need: 39 }, { name: '생사경', need: 49 },
  ];
  const RANKS = {
    none: ['낭인', '무명고수', '강호인', '협객', '대협', '일대종사', '무림명숙', '천하제일인'],
    hwasan: ['삼대제자', '이대제자', '일대제자', '매화검수', '장로', '태상장로', '장문인', '화산검선'],
    mudang: ['속가제자', '삼대제자', '이대제자', '일대제자', '장로', '태상장로', '장문인', '무당진인'],
    sorim: ['행자', '사미승', '비구', '나한', '달마원 수좌', '장로', '방장', '생불'],
    gaebang: ['일결제자', '삼결제자', '오결제자', '칠결제자', '구결장로', '집법장로', '방주', '천하제일걸'],
    dang: ['외가 수련생', '당가 무사', '당가 고수', '비전 계승자', '장로', '태상장로', '가주', '독왕'],
    namgung: ['방계 무사', '직계 무사', '창궁검대원', '창궁검대주', '장로', '소가주', '가주', '검제'],
    bukhae: ['시녀', '빙궁무사', '빙백대원', '빙백대주', '장로', '궁주 후계자', '궁주', '빙후'],
    magyo: ['마졸', '교도', '마인', '혈마대원', '장로', '호법', '부교주', '천마'],
    aemi: ['속가제자', '삼대제자', '이대제자', '일대제자', '장로', '태상장로', '장문인', '아미신니'],
    gonryun: ['삼대제자', '이대제자', '일대제자', '설산검수', '장로', '태상장로', '장문인', '곤륜검선'],
    jegal: ['방계 서생', '직계 서생', '책사', '군사', '장로', '소가주', '가주', '와룡'],
    maeng: ['맹원', '조장', '대주', '단주', '군사', '장로', '부맹주', '무림맹주'],
  };
  const REALM_AURA = [null, null, null, '120, 170, 255', '180, 120, 255', '255, 200, 80', '255, 255, 255', 'rainbow'];

  function cultivation() {
    const lv = Object.values(player.weapons).reduce((n, w) => n + w.level, 0);
    const picks = Object.values(player.picks).reduce((n, v) => n + v, 0);
    return lv + player.combos * 4 + Math.floor(picks / 2);
  }
  const rankOf = (realm) => {
    const h = HEROES[player.hero];
    return RANKS[h.allSects ? 'maeng' : h.sect || 'none'][realm];
  };

  function checkRealm() {
    const c = cultivation();
    if (player.realm + 1 >= REALMS.length || c < REALMS[player.realm + 1].need) return;
    player.realm++;
    player.dmgMul += 0.06;
    player.maxHp += 10;
    player.hp = player.maxHp;
    player.invuln = Math.max(player.invuln, 1);
    player.glow = 1.4;
    flash = Math.max(flash, 0.35);
    modalDelay = Math.max(modalDelay, 1.4);
    const aura = REALM_AURA[player.realm];
    burst(player.x, player.y, 36, aura && aura !== 'rainbow' ? [`rgb(${aura})`, '#ffffff'] : ['#ffd76b', '#ffffff', '#e0503f'], 260, 0.9, 5, true);
    showBanner(`경지 상승! ${REALMS[player.realm].name}`, '', `${rankOf(player.realm)}(으)로 승격 · 모든 피해 +6%, 최대 HP +10`);
    checkAchievements();
  }

  // ---------- Combos ----------
  function comboReady(id) {
    const w = player.weapons[id];
    const c = COMBOS[id];
    if (!w || w.evolved || w.level < WEAPONS[id].max) return false;
    if (c.partner) return (player.weapons[c.partner]?.level || 0) >= WEAPONS[c.partner].max;
    return (player.picks[c.passive] || 0) > 0;
  }

  function applyCombo(id) {
    const c = COMBOS[id];
    const w = player.weapons[id];
    c.apply(w);
    w.evolved = true;
    player.combos++;
    player.invuln = 1.2;
    player.glow = 1.2;
    flash = 0.45;
    modalDelay = 1.6;
    burst(player.x, player.y, 40, ['#ffd76b', '#ffffff', '#e0503f', '#2a2224'], 280, 0.9, 5, true);
    showBanner(c.partner ? `오의! ${c.name}` : `합성! ${c.name}`, '', c.desc);
    markSeen(id);
    checkAchievements();
  }

  function gainXp(amount) {
    player.xp += amount * player.xpMul;
    while (player.xp >= player.xpToNext) {
      player.xp -= player.xpToNext;
      player.level++;
      player.xpToNext = Math.floor(player.xpToNext * 1.2 + 5);
      modalQueue.push({ type: 'upgrade' });
      burst(player.x, player.y, 14, ['#fff6b0', '#ffffff', '#b8f0e0'], 120, 0.5, 3);
    }
  }

  // ---------- Choice modals (hero pick, level-up upgrades, combos) ----------
  function upgradeOffers() {
    const combos = Object.keys(COMBOS).filter(comboReady).map((id) => ({
      combo: true, icon: COMBOS[id].icon,
      title: `${COMBOS[id].partner ? '문파 오의' : '합성'}: ${COMBOS[id].name}`,
      desc: `${comboRecipe(id).replace(/\p{Extended_Pictographic}\uFE0F?\s?/gu, '')} → ${COMBOS[id].desc}`,
      pick: () => applyCombo(id),
    }));
    const cards = [];
    const sectCards = [];
    const hero = HEROES[player.hero];
    const owned = Object.keys(player.weapons).length;
    for (const [id, W] of Object.entries(WEAPONS)) {
      const w = player.weapons[id];
      if (W.sect && !w && !hero.allSects && W.sect !== hero.sect) continue;
      if (!w && player.banished.has(id)) continue;
      if (w ? w.level >= W.max : owned >= MAX_WEAPONS) continue;
      const n = w ? w.level + 1 : 1;
      (W.sect ? sectCards : cards).push({
        icon: weaponIcon(id), title: `${W.sect ? `[${SECTS[W.sect]}] ` : ''}${weaponName(id)} ${w ? '강화' : '획득'}`, desc: w ? W.up : W.desc,
        stars: '★'.repeat(n) + '☆'.repeat(W.max - n), sect: !!W.sect, key: id,
        pick: () => grantWeapon(player, id),
      });
    }
    for (const u of PASSIVES) {
      const n = (player.picks[u.id] || 0) + 1;
      if (n > u.max || player.banished.has(u.id)) continue;
      cards.push({
        icon: u.icon, title: u.title, desc: u.desc, stars: '★'.repeat(n) + '☆'.repeat(u.max - n), key: u.id,
        pick: () => { player.picks[u.id] = n; u.apply(player); },
      });
    }
    const featured = sectCards.length && Math.random() < 0.65 ? [shuffled(sectCards)[0]] : [];
    const offer = [...combos.slice(0, 3), ...featured, ...shuffled([...cards, ...sectCards.filter((c) => !featured.includes(c))])].slice(0, 3);
    if (offer.length < 3) offer.push(SNACK);
    return offer;
  }

  function openNextModal() {
    const m = modalQueue.shift();
    if (!m) return;
    state = 'choice';
    ui.banner.classList.remove('show');
    if (m.type === 'hero') {
      showChoice('누구로 요괴를 물리칠까요?', '협객마다 시작 무공과 특성이 달라요', Object.entries(HEROES).sort((x, y) => !heroUnlocked(x[0]) - !heroUnlocked(y[0])).map(([id, H]) => (heroUnlocked(id) ? {
        img: id, title: `${H.name} · ${H.role}`, desc: `${H.allSects ? '[모든 문파] ' : H.sect ? `[${SECTS[H.sect]}] ` : ''}${[H.weapon, H.extra].filter(Boolean).map((w) => WEAPONS[w].name()).join('·')} · ${H.trait}`, hero: true,
        pick: () => {
          resetGame(id);
          if (!progress.played.includes(id)) { progress.played.push(id); saveProgress(); }
          updateHud();
        },
      } : {
        img: id, title: '🔒 ???', desc: `해금 조건: 업적 「${ACHV_BY_ID[H.unlock].name}」 (${ACHV_BY_ID[H.unlock].desc})`, hero: true, locked: true,
      })));
    } else if (m.type === 'chest') {
      showChoice(m.of > 1 ? `보물함! (${m.n}/${m.of})` : '보물함!', '선물 하나를 골라주세요', upgradeOffers(), true);
    } else {
      showChoice('레벨 업!', '능력을 하나 골라주세요', upgradeOffers(), true);
    }
  }

  // Reroll / skip / banish buttons under level-up cards (counts come from the 수련장).
  function buildChoiceTools(title, subtitle) {
    ui.choiceTools.replaceChildren();
    const tools = [
      ['🔄', '다시뽑기', 'rerolls', 'R', () => showChoice(title, subtitle, upgradeOffers(), true)],
      ['⏭️', '넘기기', 'skips', 'X', () => { closeChoice(); addGold(3); }],
      ['🚫', '봉인', 'banishes', 'B', null],
    ];
    for (const [icon, label, field, key, act] of tools) {
      const b = document.createElement('button');
      b.className = 'tool' + (field === 'banishes' && banishMode ? ' armed' : '');
      b.dataset.key = key;
      b.textContent = `${icon} ${label} ${player[field]} [${key}]`;
      b.disabled = player[field] <= 0;
      b.addEventListener('click', () => {
        if (state !== 'choice' || player[field] <= 0) return;
        if (!act) {
          banishMode = !banishMode;
          b.classList.toggle('armed', banishMode);
          ui.choiceSubtitle.textContent = banishMode ? '봉인할 카드를 고르세요. 이번 판에는 다시 나오지 않아요' : subtitle;
          return;
        }
        player[field]--;
        banishMode = false;
        act();
      });
      ui.choiceTools.append(b);
    }
  }

  function closeChoice() {
    ui.choice.classList.add('hidden');
    state = 'playing';
    banishMode = false;
  }

  function showChoice(title, subtitle, options, tools = false) {
    banishMode = false;
    ui.choiceTools.replaceChildren();
    if (tools) buildChoiceTools(title, subtitle);
    ui.choiceTitle.textContent = title;
    ui.choiceSubtitle.textContent = subtitle;
    ui.choiceCards.replaceChildren();
    options.forEach((opt, i) => {
      const card = document.createElement('button');
      card.className = `card${opt.big ? ' big' : ''}${opt.hero ? ' hero' : ''}${opt.combo ? ' combo' : ''}${opt.sect ? ' sect' : ''}${opt.locked ? ' locked' : ''}`;
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
        if (state !== 'choice' || opt.locked) return;
        if (banishMode) {
          if (!opt.key) return;
          player.banishes--;
          player.banished.add(opt.key);
          showChoice(title, subtitle, upgradeOffers(), true);
          return;
        }
        closeChoice();
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
    const c = player.curse;
    const hp = type.prop ? 1 : type.hp * (1 + t / 120 + (t / 300) ** 2) * (1 + c);
    const e = {
      type, x: 0, y: 0, hp, maxHp: hp,
      speed: type.speed * (1 + Math.min(t / 360, 0.5)) * (1 + c / 2),
      damage: Math.round(type.damage * (1 + t / 240)),
      contactCd: 0, flash: 0, phase: Math.random() * Math.PI * 2,
    };
    // 정예: a rare golden, much tougher version that drops a treasure chest.
    if (!type.boss && !type.prop && !at && t >= 90 && Math.random() < 0.01) {
      e.elite = true;
      e.hp = e.maxHp = hp * 7;
      e.damage = Math.round(e.damage * 1.5);
      e.speed *= 0.9;
    }
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
    const type = elapsed >= 300 ? ENEMY_TYPES.crow : elapsed >= 180 ? ENEMY_TYPES.dokkaebi : ENEMY_TYPES.wisp;
    const n = 16 + Math.floor(elapsed / 20);
    const r = Math.min(viewW, viewH) / 2 + 60;
    for (let i = 0; i < n; i++) spawnEnemy(type, (i / n) * Math.PI * 2, r);
    showBanner(`${type.name} 떼가 몰려와요!`, 'boss');
  }

  function spawnMarch() {
    const types = [ENEMY_TYPES.wongwi, ENEMY_TYPES.gangsi, ENEMY_TYPES.dokkaebi];
    const dir = Math.random() < 0.5 ? 1 : -1;
    const n = 36;
    for (let i = 0; i < n; i++) {
      const x = player.x - dir * (viewW / 2 + 60 + Math.random() * 260);
      const y = player.y + (i / (n - 1) - 0.5) * viewH * 1.1;
      spawnEnemy(types[i % types.length], 0, 0, { x, y });
      const e = enemies[enemies.length - 1];
      e.march = dir * 130;
    }
    showBanner('백귀야행!', 'boss', '요괴 행렬이 지나가요. 피하거나 뚫고 가세요');
  }

  function spawnLantern() {
    const a = Math.random() * Math.PI * 2;
    const d = Math.max(viewW, viewH) * (0.35 + Math.random() * 0.4);
    spawnEnemy(ENEMY_TYPES.seokdeung, 0, 0, { x: player.x + Math.cos(a) * d, y: player.y + Math.sin(a) * d });
  }

  function updateSpawner(dt) {
    if ((propTimer -= dt) <= 0) {
      propTimer = 9;
      if (enemies.filter((e) => e.type.prop).length < 5) spawnLantern();
    }
    if (!finalSpawned && elapsed >= FINAL_TIME) {
      finalSpawned = true;
      spawnEnemy(ENEMY_TYPES.jeoseung);
      showBanner('저승사자가 나타났다!', 'boss', '쓰러뜨리면 퇴치 완료');
    }
    const marchAt = MARCH_TIMES[marchIdx] ?? MARCH_TIMES[MARCH_TIMES.length - 1] + 300 * (marchIdx - MARCH_TIMES.length + 1);
    if (elapsed >= marchAt) {
      marchIdx++;
      spawnMarch();
    }
    spawnTimer -= dt;
    if (spawnTimer <= 0 && enemies.length < MAX_ENEMIES) {
      spawnTimer = clamp(1.0 - elapsed / 160, 0.25, 1.0);
      const n = Math.round((1 + Math.floor(elapsed / 60)) * (1 + player.curse));
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
      if (e.type.prop) continue;
      const dx = e.x - player.x, dy = e.y - player.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < bestD) { bestD = d2; best = e; }
    }
    return best;
  }

  function damageEnemy(e, idx, amount, kx, ky, push = 6, quiet = false) {
    const crit = Math.random() < player.crit;
    amount *= player.dmgMul * (e.type.boss ? player.bossMul : 1) * (quiet ? player.dotMul : 1);
    if (crit) amount *= player.critMul;
    player.dmgBy[dmgSrc] = (player.dmgBy[dmgSrc] || 0) + Math.min(amount, Math.max(0, e.hp));
    e.hp -= amount;
    e.flash = 0.1;
    const k = Math.hypot(kx, ky) || 1;
    const p = e.type.prop ? 0 : e.type.boss || e.elite ? push / 6 : push;
    e.x += (kx / k) * p;
    e.y += (ky / k) * p;
    if (!quiet || crit) addFloatText(e.x, e.y - e.type.radius, crit ? `${Math.round(amount)}!` : String(Math.round(amount)), crit ? '#ff6a4d' : '#fff');
    if (e.hp <= 0) killEnemy(e, idx);
  }

  function addGold(v) {
    const g = v * player.greed;
    player.gold += g;
    addFloatText(player.x, player.y - player.radius - 20, `은자 +${Math.round(g)}`, '#cfd6e0');
  }

  // Sends the run's 은자 to the bank (safe to call more than once).
  function bankGold() {
    const g = Math.floor(player.gold) - banked;
    if (g <= 0) return;
    banked += g;
    progress.gold += g;
    progress.totalGold += g;
    saveProgress();
  }

  function breakLantern(e, idx) {
    enemies.splice(idx, 1);
    player.lanterns++;
    burst(e.x, e.y, 12, ['#b0aa9c', '#ffd76b', '#ffffff'], 140, 0.45, 4);
    const r = Math.random() / Math.sqrt(player.luck);
    const drop = r < 0.06 ? 'thunderball' : r < 0.14 ? 'bangul' : r < 0.24 ? 'gourd' : r < 0.36 ? 'ginseng' : r < 0.6 ? 'peach' : r < 0.85 ? 'eunja' : 'coin_gold';
    pickups.push({ kind: drop, value: drop === 'ginseng' ? 60 : drop === 'eunja' ? 4 : drop === 'coin_gold' ? 15 : 25, x: e.x, y: e.y });
  }

  function killEnemy(e, idx) {
    if (e.type.prop) { breakLantern(e, idx); return; }
    kills++;
    progress.totalKills++;
    enemies.splice(idx, 1);
    burst(e.x, e.y, e.type.boss ? 24 : 8, ['#ffffff', '#fff0b3', '#ffd1e0'], e.type.boss ? 200 : 110, 0.4, 4);
    pickups.push({ kind: e.type.xp >= 20 ? 'coin_gold' : 'coin', value: e.type.xp, x: e.x, y: e.y });
    if (player.killHeal) player.hp = Math.min(player.maxHp, player.hp + player.killHeal);
    if (e.type.split) {
      for (const dx of [-10, 10]) spawnEnemy(ENEMY_TYPES[e.type.split], 0, 0, { x: e.x + dx, y: e.y });
    }
    if (e.elite) {
      player.elites++;
      pickups.push({ kind: 'treasure', x: e.x + 14, y: e.y + 6 });
      pickups.push({ kind: 'jumeoni', value: 15, x: e.x - 14, y: e.y + 6 });
    }
    if (e.type.final) {
      progress.wins++;
      player.wonRun = true;
      saveProgress();
      pickups.push({ kind: 'jumeoni', value: 150, x: e.x, y: e.y - 16 });
      player.victoryAt = elapsed + 1.5;
    }
    if (e.type.boss) {
      player.bossKills++;
      pickups.push({ kind: 'jumeoni', value: 20, x: e.x, y: e.y + 20 });
      progress.bosses[e.type.name] = true;
      saveProgress();
      pickups.push({ kind: 'treasure', x: e.x + 16, y: e.y + 6 });
      pickups.push({ kind: 'peach', value: 25, x: e.x - 16, y: e.y + 6 });
      return;
    }
    const roll = Math.random() / player.luck;
    const drop = roll < 0.004 ? 'thunderball' : roll < 0.007 ? 'bangul' : roll < 0.011 ? 'gourd' : roll < 0.018 ? 'ginseng' : roll < 0.042 ? 'peach' : roll < 0.065 ? 'eunja' : null;
    if (drop) pickups.push({ kind: drop, value: drop === 'ginseng' ? 60 : drop === 'eunja' ? 2 : 25, x: e.x + 12, y: e.y + 6 });
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
      const spd = player.speed * (player.boost > 0 ? 1.4 : 1);
      player.x += (dx / len) * spd * dt;
      player.y += (dy / len) * spd * dt;
      if (dx !== 0) player.facing = Math.sign(dx);
    }
    if (player.regen > 0) player.hp = Math.min(player.maxHp, player.hp + player.regen * dt);
    if (player.invuln > 0) player.invuln -= dt;
    if (player.glow > 0) player.glow -= dt;
    if (player.boost > 0) player.boost -= dt;
  }

  function updateEnemies(dt) {
    const farLimit = Math.hypot(viewW, viewH) * 0.85;
    const aura = player.weapons.aura;
    const summons = [];
    const frozen = player.freeze > 0;
    if (frozen) player.freeze -= dt;
    for (const e of enemies) {
      const dx = player.x - e.x, dy = player.y - e.y;
      const d = Math.hypot(dx, dy) || 1;
      if (e.type.prop) { if (d > farLimit * 1.6) e.gone = true; continue; }
      if (e.march) {
        if (!frozen) e.x += e.march * dt;
        if ((e.x - player.x) * Math.sign(e.march) > viewW) e.gone = true;
      } else if (d > farLimit) { placeOnRing(e); continue; }
      if (e.flash > 0) e.flash -= dt;
      if (frozen) continue;
      let speed = e.march ? 0 : e.speed;
      if (e.type.move === 'float') speed *= 0.6 + 0.4 * Math.sin(elapsed * 3 + e.phase);
      if (e.type.move === 'hop') speed *= Math.max(0, Math.sin(elapsed * 6 + e.phase)) * 2.2;
      if (aura && d < aura.radius * player.area + e.type.radius) speed *= 1 - aura.slow;
      for (const z of zones) if (dist(z.x, z.y, e.x, e.y) < z.r + e.type.radius) speed *= 1 - (z.hold || 0.3);
      if (e.chill > 0) { e.chill -= dt; speed *= 0.5; }
      if (e.type.grows) e.grow = clamp(1.8 - d / 300, 1, 1.8);
      if (player.chillAura && d < player.chillAura) speed *= 0.6;
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
      if (e.contactCd > 0) e.contactCd -= dt;
      if (d < e.type.radius + player.radius * 0.8 && e.contactCd <= 0 && player.invuln <= 0) {
        const hurt = Math.max(1, Math.round(e.damage * player.armor));
        player.hp -= hurt;
        player.invuln = 0.5;
        e.contactCd = 0.6;
        addFloatText(player.x, player.y - player.radius - 6, `-${hurt}`, '#e0503f');
        if (player.hp <= 0 && player.revives > 0) {
          player.revives--;
          player.hp = player.maxHp * 0.5;
          player.invuln = 2.5;
          player.glow = 1.5;
          flash = 0.5;
          ringBlast(player.x, player.y, 260, 40, 60, 'gold');
          showBanner('환생!', '', 'HP 절반으로 되살아났어요');
        } else if (player.hp <= 0) {
          player.hp = 0;
          gameOver();
          return;
        }
      }
    }
    if (enemies.some((e) => e.gone)) enemies = enemies.filter((e) => !e.gone);
    for (const boss of summons) {
      for (let i = 0; i < 3; i++) {
        const a = (i / 3) * Math.PI * 2;
        spawnEnemy(ENEMY_TYPES.wisp, 0, 0, { x: boss.x + Math.cos(a) * 40, y: boss.y + Math.sin(a) * 40 });
      }
    }
    // Push overlapping enemies apart so they don't stack into one blob.
    for (let i = 0; i < enemies.length; i++) {
      const a = enemies[i];
      if (a.type.prop) continue;
      for (let j = i + 1; j < enemies.length; j++) {
        const b = enemies[j];
        if (b.type.prop) continue;
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
      dmgSrc = p.src || 'item';
      p.life -= dt;
      let dead = p.life <= 0;
      if (p.kind === 'boomerang') {
        p.spin = (p.spin || 0) + dt * 14;
        if (moveBoomerang(p, dt)) dead = true;
      } else if (p.kind === 'tornado') {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if ((p.rehit -= dt) <= 0) { p.rehit = 0.4; p.hit.clear(); }
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
    if (it.kind === 'peach' || it.kind === 'ginseng') {
      const v = it.value * player.healMul;
      player.hp = Math.min(player.maxHp, player.hp + v);
      addFloatText(player.x, head, `+${v}`, '#ff8fb4');
    } else if (it.kind === 'gourd') {
      for (const g of pickups) if (g.kind === 'coin' || g.kind === 'coin_gold') g.vel = 300;
      addFloatText(player.x, head, '흡수!', '#e0503f');
    } else if (it.kind === 'thunderball') {
      flash = 0.25;
      fx.push({ kind: 'ring', x: player.x, y: player.y, r: Math.hypot(viewW, viewH) / 2, life: 0.5, max: 0.5 });
      for (let j = enemies.length - 1; j >= 0; j--) {
        const e = enemies[j];
        if (Math.abs(e.x - player.x) < viewW / 2 + 40 && Math.abs(e.y - player.y) < viewH / 2 + 40) {
          damageEnemy(e, j, e.type.boss ? 120 : e.hp + 1, 0, 0, 0, true);
        }
      }
    } else if (it.kind === 'eunja' || it.kind === 'jumeoni') {
      addGold(it.value);
    } else if (it.kind === 'bangul') {
      player.freeze = 6;
      flash = 0.2;
      fx.push({ kind: 'ring', x: player.x, y: player.y, r: Math.hypot(viewW, viewH) / 2, life: 0.6, max: 0.6, color: 'ice' });
      addFloatText(player.x, head, '정지!', '#8cc8f0');
    } else if (it.kind === 'treasure') {
      player.chests++;
      // Like other survivors games, a lucky chest holds 3 or 5 gifts.
      const r = Math.random() * player.luck;
      const n = r > 0.94 ? 5 : r > 0.72 ? 3 : 1;
      for (let k = n; k >= 1; k--) modalQueue.unshift({ type: 'chest', n: k, of: n });
      addGold(10 * n);
      burst(player.x, player.y, 20, ['#ffe066', '#ffffff', '#ffc2dc'], 200, 0.6, 4, true);
    } else {
      gainXp(it.value);
    }
  }

  function updateShellsAndZones(dt) {
    for (let i = shells.length - 1; i >= 0; i--) {
      const sh = shells[i];
      if ((sh.t += dt) < sh.dur) continue;
      dmgSrc = sh.src || 'item';
      shells.splice(i, 1);
      fx.push({ kind: 'ring', x: sh.tx, y: sh.ty, r: sh.radius, life: 0.3, max: 0.3, color: sh.ringColor });
      burst(sh.tx, sh.ty, 10, sh.colors || (sh.chill ? ['#ffffff', '#bfe6ff', '#8cc8f0'] : ['#e0503f', '#ffd76b', '#ffffff', '#2a2224']), 160, 0.4, 4, true);
      for (let j = enemies.length - 1; j >= 0; j--) {
        const e = enemies[j];
        if (dist(e.x, e.y, sh.tx, sh.ty) >= sh.radius + e.type.radius) continue;
        if (sh.chill) e.chill = 1.5;
        damageEnemy(e, j, sh.damage, e.x - sh.tx, e.y - sh.ty, sh.push ?? (sh.chill ? 0 : 10));
      }
      if (sh.bounces > 0) {
        let next = null, best = 260;
        for (const e of enemies) {
          const d = dist(e.x, e.y, sh.tx, sh.ty);
          if (d > 30 && d < best) { best = d; next = e; }
        }
        if (next) shells.push({ ...sh, sx: sh.tx, sy: sh.ty, tx: next.x, ty: next.y, t: 0, bounces: sh.bounces - 1 });
      }
    }
    for (let i = mines.length - 1; i >= 0; i--) {
      const m = mines[i];
      m.life -= dt;
      if ((m.arm -= dt) > 0) continue;
      let boom = m.life <= 0;
      for (const e of enemies) {
        const d = dist(e.x, e.y, m.x, m.y);
        if (m.pull && d < 130) {
          e.x += ((m.x - e.x) / (d || 1)) * 60 * dt;
          e.y += ((m.y - e.y) / (d || 1)) * 60 * dt;
        }
        if (d < 22 + e.type.radius) boom = true;
      }
      if (!boom) continue;
      dmgSrc = m.src || 'item';
      mines.splice(i, 1);
      fx.push({ kind: 'ring', x: m.x, y: m.y, r: m.radius, life: 0.35, max: 0.35 });
      burst(m.x, m.y, 14, ['#e0503f', '#ffd76b', '#2a2224'], 200, 0.45, 4);
      for (let j = enemies.length - 1; j >= 0; j--) {
        const e = enemies[j];
        if (dist(e.x, e.y, m.x, m.y) < m.radius + e.type.radius) damageEnemy(e, j, m.damage, e.x - m.x, e.y - m.y, 14);
      }
    }
    for (let i = zones.length - 1; i >= 0; i--) {
      const z = zones[i];
      if ((z.life -= dt) <= 0) { zones.splice(i, 1); continue; }
      if ((z.tick -= dt) > 0) continue;
      z.tick = 0.5;
      dmgSrc = z.src || 'item';
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
    for (const [id, w] of Object.entries(player.weapons)) {
      const before = [projectiles.length, shells.length, zones.length, mines.length];
      dmgSrc = id;
      WEAPONS[id].update(w, dt);
      [projectiles, shells, zones, mines].forEach((arr, k) => { for (let i = before[k]; i < arr.length; i++) arr[i].src ??= id; });
    }
    dmgSrc = 'item';
    updateProjectiles(dt);
    updateShellsAndZones(dt);
    updatePickups(dt);
    updateEffects(dt);
    if ((achvTimer -= dt) <= 0) { achvTimer = 0.5; checkAchievements(); checkRealm(); }
    if (player.victoryAt && elapsed >= player.victoryAt && !modalQueue.length) { player.victoryAt = 0; victory(); return; }
    if (modalQueue.length && modalDelay <= 0) openNextModal();
    updateHud();
  }

  function updateHud() {
    ui.hpBar.style.width = `${clamp(player.hp / player.maxHp, 0, 1) * 100}%`;
    ui.hpText.textContent = `${Math.ceil(player.hp)} / ${Math.round(player.maxHp)}`;
    ui.xpBar.style.width = `${clamp(player.xp / player.xpToNext, 0, 1) * 100}%`;
    ui.level.textContent = `Lv.${player.level}`;
    ui.formName.textContent = HEROES[player.hero].name;
    ui.kills.textContent = `요괴 ${kills}마리 퇴치`;
    ui.gold.textContent = `은자 ${Math.floor(player.gold)}냥`;
    ui.timer.textContent = fmtTime(elapsed);
    const next = REALMS[player.realm + 1];
    ui.evoHint.textContent = `${REALMS[player.realm].name} · ${rankOf(player.realm)}${next ? ` (다음 경지 ${cultivation()}/${next.need})` : ''}`;
    ui.weaponRow.textContent = Object.entries(player.weapons)
      .map(([id, w]) => `${weaponIcon(id)}${w.evolved ? '★' : w.level}`).join('  ');
  }

  // ---------- Render ----------
  function drawShadow(x, y, r) {
    ctx.fillStyle = 'rgba(80, 60, 40, 0.22)';
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawAura() {
    const w = player.weapons.aura;
    if (!w) return;
    ctx.fillStyle = 'rgba(240, 200, 90, 0.16)';
    ctx.strokeStyle = 'rgba(200, 150, 50, 0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    const radius = w.radius * player.area;
    ctx.arc(player.x, player.y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = 'rgba(190, 52, 46, 0.85)';
    for (let i = 0; i < 6; i++) {
      const a = anim * 0.8 + (i / 6) * Math.PI * 2;
      const x = player.x + Math.cos(a) * radius * 0.8, y = player.y + Math.sin(a) * radius * 0.8;
      ctx.fillRect(x - 3, y - 1, 6, 2);
      ctx.fillRect(x - 1, y - 3, 2, 6);
    }
  }

  function drawZones() {
    for (const z of zones) {
      const a = clamp(z.life / 0.6, 0, 1);
      if (z.tint === 'formation') {
        ctx.save();
        ctx.translate(z.x, z.y);
        ctx.rotate(anim * 0.6);
        ctx.strokeStyle = `rgba(200, 150, 50, ${0.75 * a})`;
        ctx.fillStyle = `rgba(240, 200, 90, ${0.12 * a})`;
        ctx.lineWidth = 2;
        for (const k of [1, 0.62]) {
          ctx.beginPath();
          for (let i = 0; i <= 8; i++) {
            const ang = (i / 8) * Math.PI * 2;
            ctx[i ? 'lineTo' : 'moveTo'](Math.cos(ang) * z.r * k, Math.sin(ang) * z.r * k);
          }
          ctx.fill();
          ctx.stroke();
        }
        ctx.restore();
        continue;
      }
      for (let i = 0; i < 3; i++) {
        const ox = Math.cos(z.seed + i * 2.1 + anim) * z.r * 0.3, oy = Math.sin(z.seed + i * 2.1 + anim) * z.r * 0.2;
        ctx.fillStyle = z.tint === 'green' ? `rgba(90, 160, 70, ${0.18 * a})` : `rgba(130, 80, 160, ${0.16 * a})`;
        ctx.beginPath();
        ctx.arc(z.x + ox, z.y + oy, z.r * (0.7 + i * 0.15), 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function drawMines() {
    for (const m of mines) {
      ctx.globalAlpha = m.arm > 0 ? 0.5 : 0.75 + 0.25 * Math.sin(anim * 8);
      drawSprite('talisman', m.x, m.y);
    }
    ctx.globalAlpha = 1;
  }

  function drawTornado(p) {
    for (let i = 0; i < 4; i++) {
      const r = p.radius * (1 - i * 0.2);
      ctx.strokeStyle = `rgba(110, 130, 120, ${0.55 - i * 0.1})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(p.x + Math.sin(anim * 9 + i) * 4, p.y - i * 10, r, r * 0.35, 0, anim * 6 + i, anim * 6 + i + Math.PI * 1.5);
      ctx.stroke();
    }
  }

  function drawShells() {
    for (const sh of shells) {
      if (sh.kind === 'drop') {
        drawSprite(sh.sprite || 'icicle', sh.tx, sh.ty - (1 - sh.t / sh.dur) * 220);
        continue;
      }
      const t = sh.t / sh.dur;
      const x = sh.sx + (sh.tx - sh.sx) * t;
      const y = sh.sy + (sh.ty - sh.sy) * t - Math.sin(Math.PI * t) * 70;
      drawSprite(sh.sprite || 'talisman', x, y, { rot: sh.t * 12 });
    }
  }

  function drawFx() {
    for (const f of fx) {
      const a = clamp(f.life / f.max, 0, 1);
      if (f.kind === 'spin') {
        ctx.strokeStyle = `rgba(120, 90, 60, ${a})`;
        ctx.lineWidth = 7;
        ctx.beginPath();
        const st = (1 - a) * Math.PI * 4;
        ctx.arc(f.x, f.y, f.r * 0.85, st, st + Math.PI * 1.4);
        ctx.stroke();
      } else if (f.kind === 'slash') {
        ctx.strokeStyle = `rgba(255, 255, 255, ${a})`;
        ctx.lineWidth = 6 * a + 2;
        ctx.beginPath();
        ctx.ellipse(f.x + f.dir * f.range * 0.45, f.y, f.range * 0.55, f.h * 0.6, 0, f.dir > 0 ? -1.2 : Math.PI - 1.2, f.dir > 0 ? 1.2 : Math.PI + 1.2);
        ctx.stroke();
        ctx.strokeStyle = `rgba(190, 52, 46, ${a * 0.6})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      } else if (f.kind === 'beam') {
        ctx.save();
        ctx.translate(f.x, f.y);
        ctx.rotate(f.a);
        ctx.globalAlpha = a;
        const g = ctx.createLinearGradient(0, -f.w, 0, f.w);
        const edge = { gold: '240, 195, 80', blood: '170, 20, 30', ice: '150, 200, 250' }[f.tint] || '160, 210, 230';
        const mid = { gold: '255, 236, 160', blood: '230, 60, 60', ice: '220, 240, 255' }[f.tint] || '190, 230, 245';
        g.addColorStop(0, `rgba(${edge}, 0)`);
        g.addColorStop(0.35, `rgba(${mid}, 0.85)`);
        g.addColorStop(0.5, 'rgba(255, 255, 255, 1)');
        g.addColorStop(0.65, `rgba(${mid}, 0.85)`);
        g.addColorStop(1, `rgba(${edge}, 0)`);
        ctx.fillStyle = g;
        ctx.fillRect(0, -f.w, f.len, f.w * 2);
        ctx.restore();
      } else if (f.kind === 'ring') {
        const r = f.r * (1 - a * 0.6);
        if (f.color === 'none') continue;
        const rgb = { gold: '240, 195, 80', ice: '170, 220, 255', blood: '200, 30, 40' }[f.color] || '250, 245, 230';
        ctx.strokeStyle = `rgba(${rgb}, ${a})`;
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
    const aura = REALM_AURA[player.realm];
    if (aura) {
      const rgb = aura === 'rainbow' ? `${Math.round(200 + 55 * Math.sin(anim * 3))}, ${Math.round(200 + 55 * Math.sin(anim * 3 + 2))}, ${Math.round(200 + 55 * Math.sin(anim * 3 + 4))}` : aura;
      const R = r * (2 + player.realm * 0.25);
      const g = ctx.createRadialGradient(player.x, player.y, r * 0.4, player.x, player.y, R);
      g.addColorStop(0, `rgba(${rgb}, 0.35)`);
      g.addColorStop(1, `rgba(${rgb}, 0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(player.x, player.y, R, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(${rgb}, 0.9)`;
      for (let i = 0; i < player.realm; i++) {
        const a = anim * 1.5 + (i / player.realm) * Math.PI * 2;
        ctx.fillRect(player.x + Math.cos(a) * R * 0.7 - 2, player.y + Math.sin(a) * R * 0.45 - 2 - (anim * 40 + i * 13) % 20, 3, 3);
      }
    }
    drawShadow(player.x, player.y + r * 0.9, r * 1.05);
    const grow = 1 + player.realm * 0.035;
    const speed = player.moving ? 14 : 4;
    const amp = player.moving ? 0.07 : 0.035;
    const b = Math.sin(anim * speed);
    const hop = player.moving ? Math.abs(Math.sin(anim * speed / 2)) * 3 : 0;
    const blink = player.invuln > 0 && player.glow <= 0 && Math.floor(anim * 20) % 2 === 0;
    drawSprite(player.hero, player.x, player.y - hop, {
      flip: false, sx: grow * (1 - amp * b), sy: grow * (1 + amp * b), groundR: r, alpha: blink ? 0.45 : 1,
    });
  }

  function drawEnemy(e) {
    const t = e.type;
    const r = t.radius;
    drawShadow(e.x, e.y + r * 0.85, r);
    const b = Math.sin(anim * 9 + e.phase);
    const lift = t.move === 'float' ? Math.sin(anim * 3 + e.phase) * 4 - 4 : 0;
    const sc = (t.scale || 1) * (e.grow || 1) * (e.elite ? 1.4 : 1);
    if (e.elite) {
      ctx.strokeStyle = `rgba(222, 176, 72, ${0.6 + 0.3 * Math.sin(anim * 6)})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(e.x, e.y + r * 0.9, r * 1.5, r * 0.6, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    const sq = t.prop || player.freeze > 0 ? 0 : 0.05 * b;
    drawSprite(t.sprite, e.x, e.y + lift, { sx: sc * (1 + sq), sy: sc * (1 - sq), groundR: r, flash: e.flash > 0, alpha: t.alpha });
    if (t.boss || e.elite || (!t.prop && e.hp < e.maxHp)) {
      const w = t.boss ? 56 : e.elite ? 40 : 26;
      const x = Math.round(e.x - w / 2), y = Math.round(e.y - t.barY);
      ctx.fillStyle = 'rgba(80, 50, 80, 0.75)';
      ctx.fillRect(x - 1, y - 1, w + 2, 6);
      ctx.fillStyle = '#fff';
      ctx.fillRect(x, y, w, 4);
      ctx.fillStyle = t.boss ? '#b58cf0' : e.elite ? '#deb048' : '#ff7fa8';
      ctx.fillRect(x, y, w * clamp(e.hp / e.maxHp, 0, 1), 4);
    }
  }

  function render() {
    const camX = Math.round(player.x - viewW / 2);
    const camY = Math.round(player.y - viewH / 2);
    ctx.save();
    ctx.translate(-camX, -camY);

    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = bgPattern || '#e9dfc6';
    ctx.fillRect(camX, camY, viewW, viewH);

    drawAura();
    for (const [id, w] of Object.entries(player.weapons)) if (WEAPONS[id].drawBelow) WEAPONS[id].drawBelow(w);
    drawZones();
    drawMines();
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

    for (const pt of orbitPoints()) drawSprite('foxfire', pt.x, pt.y);
    for (const [id, w] of Object.entries(player.weapons)) if (WEAPONS[id].drawAbove) WEAPONS[id].drawAbove(w);
    for (const p of projectiles) {
      if (p.kind === 'tornado') { drawTornado(p); continue; }
      const rot = p.kind === 'boomerang' ? p.spin : p.kind === 'homing' ? 0 : p.kind === 'petal' ? p.spin + p.life * 8 : Math.atan2(p.vy, p.vx);
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

    ctx.font = 'bold 17px "Gowun Batang", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(42, 34, 36, 0.9)';
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

    if (player.freeze > 0) {
      ctx.fillStyle = `rgba(140, 200, 240, ${0.18 * Math.min(1, player.freeze)})`;
      ctx.fillRect(0, 0, viewW, viewH);
    }
    if (flash > 0) {
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, flash * 1.6)})`;
      ctx.fillRect(0, 0, viewW, viewH);
    }
  }

  // ---------- Screens ----------
  // Achievements window: achievements, the combo book (recipes hidden until found) and hero unlocks.
  function buildAchievements() {
    ui.achvList.replaceChildren(...ACHIEVEMENTS.map((a) => {
      const done = progress.achievements.includes(a.id);
      const hero = Object.values(HEROES).find((h) => h.unlock === a.id);
      const el = document.createElement('div');
      el.className = done ? 'achv done' : 'achv';
      const icon = document.createElement('span');
      icon.className = 'achv-icon';
      icon.textContent = done ? a.icon : '🔒';
      const text = document.createElement('div');
      const name = document.createElement('b');
      name.textContent = a.name;
      const desc = document.createElement('small');
      desc.textContent = a.desc + (hero ? ` · 보상: ${done ? hero.name : '???'} 해금` : '');
      text.append(name, desc);
      el.append(icon, text);
      return el;
    }));
    ui.bookList.replaceChildren(...Object.entries(COMBOS).map(([id, c]) => {
      const known = seen.has(id);
      const row = document.createElement('div');
      row.className = known ? 'book-row' : 'book-row unseen';
      const recipe = document.createElement('span');
      recipe.textContent = known ? comboRecipe(id) : (c.partner ? `[${SECTS[WEAPONS[id].sect]} 오의] ??? + ???` : '??? + ???');
      const result = document.createElement('span');
      result.className = 'result';
      result.textContent = known ? `${c.icon} ${c.name}` : '???';
      row.append(recipe, result);
      return row;
    }));
    ui.heroList.replaceChildren(...Object.keys(HEROES).map((id) => {
      const img = pixelImg(id);
      img.title = heroUnlocked(id) ? `${HEROES[id].name} · ${HEROES[id].role}` : '???';
      if (!heroUnlocked(id)) img.className = 'locked';
      return img;
    }));
    const done = progress.achievements.length;
    ui.achvCount.textContent = `${done} / ${ACHIEVEMENTS.length}`;
    ui.bookCount.textContent = `${seen.size} / ${Object.keys(COMBOS).length}`;
    const heroes = Object.keys(HEROES).filter(heroUnlocked).length;
    ui.titleStats.textContent = `업적 ${done}/${ACHIEVEMENTS.length} · 비급 ${seen.size}/${Object.keys(COMBOS).length} · 협객 ${heroes}/${Object.keys(HEROES).length} · 은자 ${progress.gold}냥`;
  }

  function openAchievements() {
    buildAchievements();
    ui.achv.classList.remove('hidden');
  }

  function buildShop() {
    ui.shopGold.textContent = `은자 ${progress.gold}냥`;
    ui.shopList.replaceChildren(...SHOP.map((u) => {
      const lv = shopLevel(u.id);
      const el = document.createElement('button');
      const maxed = lv >= u.max;
      el.className = 'card shop-card' + (maxed ? ' maxed' : '');
      el.disabled = maxed || progress.gold < shopCost(u);
      for (const [cls, text] of [['icon', u.icon], ['title', u.name], ['stars', '★'.repeat(lv) + '☆'.repeat(u.max - lv)], ['desc', u.desc], ['key', maxed ? '완성' : `은자 ${shopCost(u)}냥`]]) {
        const d = document.createElement('div');
        d.className = cls;
        d.textContent = text;
        el.append(d);
      }
      el.addEventListener('click', () => {
        if (maxed || progress.gold < shopCost(u)) return;
        progress.gold -= shopCost(u);
        progress.shop[u.id] = lv + 1;
        saveProgress();
        checkAchievements();
        buildShop();
      });
      return el;
    }));
  }

  function openShop() {
    buildShop();
    ui.shop.classList.remove('hidden');
  }

  function refundShop() {
    for (const u of SHOP) for (let i = 0; i < shopLevel(u.id); i++) progress.gold += u.cost * (i + 1);
    progress.shop = {};
    saveProgress();
    buildShop();
  }

  function damageReport() {
    const rows = Object.entries(player.dmgBy).filter(([, v]) => v >= 1).sort((a, b) => b[1] - a[1]);
    const total = rows.reduce((n, [, v]) => n + v, 0) || 1;
    return rows.map(([id, v]) => {
      const name = WEAPONS[id] ? `${weaponIcon(id)} ${weaponName(id)}` : '🧨 아이템';
      const row = document.createElement('div');
      row.className = 'book-row';
      const a = document.createElement('span');
      a.textContent = name;
      const b = document.createElement('span');
      b.className = 'result';
      b.textContent = `${Math.round(v).toLocaleString()} (${Math.round((v / total) * 100)}%) · 초당 ${Math.round(v / Math.max(1, elapsed))}`;
      row.append(a, b);
      return row;
    });
  }

  function buildPause() {
    ui.pauseBuild.replaceChildren(...Object.entries(player.weapons).map(([id, w]) => {
      const el = document.createElement('span');
      el.className = 'chip';
      el.textContent = `${weaponIcon(id)} ${weaponName(id)} ${w.evolved ? '★' : `Lv.${w.level}`}`;
      return el;
    }), ...PASSIVES.filter((u) => player.picks[u.id]).map((u) => {
      const el = document.createElement('span');
      el.className = 'chip passive';
      el.textContent = `${u.icon} ${u.title} ${player.picks[u.id]}`;
      return el;
    }));
    ui.pauseDmg.replaceChildren(...damageReport());
    ui.pauseStats.textContent = `${REALMS[player.realm].name} · ${rankOf(player.realm)} · 피해 ×${player.dmgMul.toFixed(2)} · 치명타 ${Math.round(player.crit * 100)}% · 대기시간 ×${player.haste.toFixed(2)} · 받는 피해 ×${player.armor.toFixed(2)} · 은자 ${Math.floor(player.gold)}냥${player.revives ? ` · 환생 ${player.revives}` : ''}`;
    ui.quitBtn.textContent = '로비로 나가기';
    ui.quitBtn.dataset.confirm = '';
  }

  function toLobby() {
    bankGold();
    checkAchievements();
    state = 'title';
    for (const el of [ui.hud, ui.pause, ui.choice, ui.gameover]) el.classList.add('hidden');
    ui.start.classList.remove('hidden');
    buildAchievements();
  }

  function startGame() {
    if (state !== 'title' && state !== 'gameover' && state !== 'victory') return;
    resetGame();
    for (const el of [ui.start, ui.gameover, ui.choice, ui.pause, ui.achv, ui.shop]) el.classList.add('hidden');
    ui.hud.classList.remove('hidden');
    updateHud();
    state = 'playing';
    modalQueue.push({ type: 'hero' });
    openNextModal();
  }

  function gameOver(win = false) {
    state = win ? 'victory' : 'gameover';
    const h = HEROES[player.hero];
    if (win) addGold(100);
    bankGold();
    ui.gameoverTitle.textContent = win ? '퇴치 완료!' : '쓰러졌다...';
    ui.continueBtn.classList.toggle('hidden', !win);
    ui.gameoverPortrait.src = spritePath(player.hero);
    ui.gameoverStats.textContent = `${h.name} · ${REALMS[player.realm].name} ${rankOf(player.realm)} · Lv.${player.level} · ${fmtTime(elapsed)} 버팀 · 요괴 ${kills}마리 퇴치 · 합성 ${player.combos}개 · 은자 ${Math.floor(player.gold)}냥 획득`;
    $('gameover-dmg').replaceChildren(...damageReport());
    checkAchievements();
    ui.hud.classList.add('hidden');
    ui.gameover.classList.remove('hidden');
    buildAchievements();
  }
  const victory = () => gameOver(true);

  // After clearing, the run can go on endlessly (no more victory screen).
  function continueRun() {
    if (state !== 'victory') return;
    ui.gameover.classList.add('hidden');
    ui.hud.classList.remove('hidden');
    state = 'playing';
  }

  function togglePause() {
    if (state === 'playing') {
      state = 'paused';
      buildPause();
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
    const overlayOpen = !ui.achv.classList.contains('hidden') || !ui.shop.classList.contains('hidden');
    if (e.code === 'Escape' && overlayOpen) {
      ui.achv.classList.add('hidden');
      ui.shop.classList.add('hidden');
      return;
    }
    if (e.code === 'KeyP' || e.code === 'Escape') togglePause();
    if (state === 'choice' && /^Digit[0-9]$/.test(e.code)) {
      const card = ui.choiceCards.children[(Number(e.code.slice(5)) + 9) % 10];
      if (card) card.click();
    }
    if (state === 'choice') {
      const tool = [...ui.choiceTools.children].find((b) => `Key${b.dataset.key}` === e.code);
      if (tool) tool.click();
    }
    if ((e.code === 'Enter' || e.code === 'Space') && !overlayOpen && state !== 'victory') startGame();
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
  for (const id of ['achv-btn', 'achv-btn-2']) $(id).addEventListener('click', openAchievements);
  $('achv-close').addEventListener('click', () => ui.achv.classList.add('hidden'));
  $('shop-btn').addEventListener('click', openShop);
  $('shop-close').addEventListener('click', () => ui.shop.classList.add('hidden'));
  $('refund-btn').addEventListener('click', refundShop);
  $('resume-btn').addEventListener('click', togglePause);
  ui.quitBtn.addEventListener('click', () => {
    if (state !== 'paused') return;
    if (!ui.quitBtn.dataset.confirm) {
      ui.quitBtn.dataset.confirm = '1';
      ui.quitBtn.textContent = '정말 나갈까요? (은자는 챙겨요)';
      return;
    }
    toLobby();
  });
  ui.continueBtn.addEventListener('click', continueRun);
  $('lobby-btn').addEventListener('click', () => { if (state === 'gameover' || state === 'victory') toLobby(); });

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

  buildAchievements();
  preloadAssets().then(() => {
    buildBackground();
    resetGame();
    requestAnimationFrame(frame);
  });
})();
