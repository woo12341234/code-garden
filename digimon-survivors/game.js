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
    start: $('start-screen'), evoChart: $('evo-chart'), dexCount: $('dex-count'),
    choice: $('choice-screen'), choiceTitle: $('choice-title'),
    choiceSubtitle: $('choice-subtitle'), choiceCards: $('choice-cards'),
    pause: $('pause-screen'),
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
    wisp: { size: 48, color: '#6eb9ff', emoji: '🔥' },
    dokkaebi: { size: 48, color: '#d64e3e', emoji: '👹' },
    crow: { size: 48, color: '#3a3a50', emoji: '🐦‍⬛' },
    jangseung: { size: 48, color: '#9e7c60', emoji: '🗿' },
    wongwi: { size: 48, color: '#f0f0ec', emoji: '👻' },
    meok: { size: 48, color: '#322c38', emoji: '🖤' },
    gangsi: { size: 48, color: '#a0c4b0', emoji: '🧟' },
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
  const MAX_WEAPONS = 4;

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
            damage: w.damage, pierce: w.pierce, radius: w.radius, sprite: w.sprite, life: 1.5, hit: new Set(),
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
            speed: w.speed, damage: w.damage, pierce: 1, radius: 9, sprite: 'crane', life: 2.5, hit: new Set(),
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


  // ---------- Heroes ----------
  // One form per hero; each has its own starting weapon and a trait.
  const HEROES = {
    cheongpung: {
      name: '청풍', role: '검객', weapon: 'shot', hp: 100, speed: 195,
      trait: '치명타 확률 +15%, 치명타 피해 ×2.5',
      setup(p) { p.crit += 0.15; p.critMul = 2.5; },
    },
    unhak: {
      name: '운학', role: '도사', weapon: 'lightning', hp: 95, speed: 185,
      trait: '모든 무공 대기시간 -15%',
      setup(p) { p.haste *= 0.85; },
    },
    yeoubi: {
      name: '여우비', role: '구미호', weapon: 'orbit', hp: 90, speed: 215,
      trait: '가장 빠름, 요괴를 쓰러뜨릴 때마다 HP 1 회복',
      setup(p) { p.killHeal = 1; },
    },
    cheolsan: {
      name: '철산', role: '무승', weapon: 'quake', hp: 150, speed: 170,
      trait: '최대 HP 150, 받는 피해 -15% (느림)',
      setup(p) { p.armor *= 0.85; },
    },
    dallae: {
      name: '달래', role: '무녀', weapon: 'fairy', hp: 100, speed: 190,
      trait: '얻는 경험치 +25%, 엽전 줍는 범위 +50%',
      setup(p) { p.xpMul += 0.25; p.pickupRadius *= 1.5; },
    },
    yawol: {
      name: '야월', role: '자객', weapon: 'boomerang', hp: 85, speed: 210,
      trait: '모든 무공 발사 수 +1 (HP 낮음)',
      setup(p) { p.extra += 1; },
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
    daedokkaebi: { name: '대도깨비', sprite: 'daedokkaebi', hp: 260, speed: 48, damage: 18, radius: 24, xp: 50, boss: true, barY: 34 },
    imugi: { name: '이무기', sprite: 'imugi', hp: 380, speed: 40, damage: 22, radius: 24, xp: 70, boss: true, barY: 34 },
    heukyo: { name: '흑요장군', sprite: 'heukyo', hp: 330, speed: 52, damage: 20, radius: 24, xp: 60, boss: true, barY: 34, summon: true },
  };
  const BOSSES = [ENEMY_TYPES.daedokkaebi, ENEMY_TYPES.imugi, ENEMY_TYPES.heukyo];
  const MAX_ENEMIES = 260;
  // Bosses arrive on the minute (from 1:00), surround waves on the half minute (from 2:30).
  const EVENT_INTERVAL = 60;
  const BOSS_START = 60;
  const WAVE_START = 150;

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
  const PASSIVE_BY_ID = Object.fromEntries(PASSIVES.map((u) => [u.id, u]));
  // Offered to fill the row once everything else is maxed out.
  const SNACK = { icon: '🍑', title: '천도복숭아', desc: 'HP 30 회복', pick: () => { player.hp = Math.min(player.maxHp, player.hp + 30); } };

  // ---------- Combo book: which combos this browser has discovered ----------
  const BOOK_KEY = 'yokai-survivors-combos';
  let seen = new Set();
  try { seen = new Set(JSON.parse(localStorage.getItem(BOOK_KEY) || '[]')); } catch (e) { /* storage unavailable */ }
  function markSeen(id) {
    if (seen.has(id)) return;
    seen.add(id);
    try { localStorage.setItem(BOOK_KEY, JSON.stringify([...seen])); } catch (e) { /* storage unavailable */ }
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

  function resetGame(heroId = 'cheongpung') {
    const hero = HEROES[heroId];
    player = {
      x: 0, y: 0,
      hero: heroId,
      radius: SPRITE_DEFS[heroId].size * 0.3,
      speed: hero.speed, maxHp: hero.hp, hp: hero.hp, regen: 0, pickupRadius: 100, haste: 1,
      crit: 0, critMul: 2, xpMul: 1, armor: 1, area: 1, extra: 0, luck: 1, chests: 0, killHeal: 0, combos: 0,
      level: 1, xp: 0, xpToNext: 10, picks: {},
      facing: -1, moving: false, invuln: 0, glow: 0,
      weapons: {},
    };
    hero.setup(player);
    grantWeapon(player, hero.weapon);
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

  // ---------- Combos ----------
  function comboReady(id) {
    const w = player.weapons[id];
    return w && !w.evolved && w.level >= WEAPONS[id].max && (player.picks[COMBOS[id].passive] || 0) > 0;
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
    showBanner(`합성! ${c.name}`, '', c.desc);
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
    }
  }

  // ---------- Choice modals (hero pick, level-up upgrades, combos) ----------
  function upgradeOffers() {
    const combos = Object.keys(COMBOS).filter(comboReady).map((id) => ({
      combo: true, icon: COMBOS[id].icon,
      title: `합성: ${COMBOS[id].name}`,
      desc: `${WEAPONS[id].name()} + ${PASSIVE_BY_ID[COMBOS[id].passive].title} → ${COMBOS[id].desc}`,
      pick: () => applyCombo(id),
    }));
    const cards = [];
    const owned = Object.keys(player.weapons).length;
    for (const [id, W] of Object.entries(WEAPONS)) {
      const w = player.weapons[id];
      if (w ? w.level >= W.max : owned >= MAX_WEAPONS) continue;
      const n = w ? w.level + 1 : 1;
      cards.push({
        icon: weaponIcon(id), title: `${weaponName(id)} ${w ? '강화' : '획득'}`, desc: w ? W.up : W.desc,
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
    const offer = [...combos.slice(0, 3), ...shuffled(cards)].slice(0, 3);
    if (offer.length < 3) offer.push(SNACK);
    return offer;
  }

  function openNextModal() {
    const m = modalQueue.shift();
    if (!m) return;
    state = 'choice';
    ui.banner.classList.remove('show');
    if (m.type === 'hero') {
      showChoice('누구로 요괴를 물리칠까요?', '협객마다 시작 무공과 특성이 달라요', Object.entries(HEROES).map(([id, H]) => ({
        img: id, title: `${H.name} · ${H.role}`, desc: `${WEAPONS[H.weapon].name()} · ${H.trait}`, big: true,
        pick: () => { resetGame(id); updateHud(); },
      })));
    } else if (m.type === 'chest') {
      showChoice('보물함!', '선물 하나를 골라주세요', upgradeOffers());
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
      card.className = `card${opt.big ? ' big' : ''}${opt.combo ? ' combo' : ''}`;
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
    const type = elapsed >= 300 ? ENEMY_TYPES.crow : elapsed >= 180 ? ENEMY_TYPES.dokkaebi : ENEMY_TYPES.wisp;
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
    if (crit) amount *= player.critMul;
    e.hp -= amount;
    e.flash = 0.1;
    const k = Math.hypot(kx, ky) || 1;
    const p = e.type.boss ? push / 6 : push;
    e.x += (kx / k) * p;
    e.y += (ky / k) * p;
    if (!quiet || crit) addFloatText(e.x, e.y - e.type.radius, crit ? `${Math.round(amount)}!` : String(Math.round(amount)), crit ? '#ff6a4d' : '#fff');
    if (e.hp <= 0) killEnemy(e, idx);
  }

  function killEnemy(e, idx) {
    kills++;
    enemies.splice(idx, 1);
    burst(e.x, e.y, e.type.boss ? 24 : 8, ['#ffffff', '#fff0b3', '#ffd1e0'], e.type.boss ? 200 : 110, 0.4, 4);
    pickups.push({ kind: e.type.xp >= 20 ? 'coin_gold' : 'coin', value: e.type.xp, x: e.x, y: e.y });
    if (player.killHeal) player.hp = Math.min(player.maxHp, player.hp + player.killHeal);
    if (e.type.split) {
      for (const dx of [-10, 10]) spawnEnemy(ENEMY_TYPES[e.type.split], 0, 0, { x: e.x + dx, y: e.y });
    }
    if (e.type.boss) {
      pickups.push({ kind: 'treasure', x: e.x + 16, y: e.y + 6 });
      pickups.push({ kind: 'peach', value: 25, x: e.x - 16, y: e.y + 6 });
      return;
    }
    const roll = Math.random() / player.luck;
    const drop = roll < 0.004 ? 'thunderball' : roll < 0.009 ? 'gourd' : roll < 0.016 ? 'ginseng' : roll < 0.04 ? 'peach' : null;
    if (drop) pickups.push({ kind: drop, value: drop === 'ginseng' ? 60 : 25, x: e.x + 12, y: e.y + 6 });
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
      if (e.type.move === 'hop') speed *= Math.max(0, Math.sin(elapsed * 6 + e.phase)) * 2.2;
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
        addFloatText(player.x, player.y - player.radius - 6, `-${hurt}`, '#e0503f');
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
        spawnEnemy(ENEMY_TYPES.wisp, 0, 0, { x: boss.x + Math.cos(a) * 40, y: boss.y + Math.sin(a) * 40 });
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
    if (it.kind === 'peach' || it.kind === 'ginseng') {
      player.hp = Math.min(player.maxHp, player.hp + it.value);
      addFloatText(player.x, head, `+${it.value}`, '#ff8fb4');
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
    } else if (it.kind === 'treasure') {
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
    ui.formName.textContent = `${HEROES[player.hero].name} · ${HEROES[player.hero].role}`;
    ui.kills.textContent = `요괴 ${kills}마리 퇴치`;
    ui.timer.textContent = fmtTime(elapsed);
    ui.evoHint.textContent = player.combos ? `합성 무공 ${player.combos}개` : '무공을 최대로 올리고 짝 비급을 모으면 합성!';
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
      for (let i = 0; i < 3; i++) {
        const ox = Math.cos(z.seed + i * 2.1 + anim) * z.r * 0.3, oy = Math.sin(z.seed + i * 2.1 + anim) * z.r * 0.2;
        ctx.fillStyle = `rgba(130, 80, 160, ${0.16 * a})`;
        ctx.beginPath();
        ctx.arc(z.x + ox, z.y + oy, z.r * (0.7 + i * 0.15), 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function drawShells() {
    for (const sh of shells) {
      const t = sh.t / sh.dur;
      const x = sh.sx + (sh.tx - sh.sx) * t;
      const y = sh.sy + (sh.ty - sh.sy) * t - Math.sin(Math.PI * t) * 70;
      drawSprite('talisman', x, y, { rot: sh.t * 12 });
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
        g.addColorStop(0, 'rgba(160, 210, 230, 0)');
        g.addColorStop(0.35, 'rgba(190, 230, 245, 0.85)');
        g.addColorStop(0.5, 'rgba(255, 255, 255, 1)');
        g.addColorStop(0.65, 'rgba(190, 230, 245, 0.85)');
        g.addColorStop(1, 'rgba(160, 210, 230, 0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, -f.w, f.len, f.w * 2);
        ctx.restore();
      } else if (f.kind === 'ring') {
        const r = f.r * (1 - a * 0.6);
        ctx.strokeStyle = `rgba(250, 245, 230, ${a})`;
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
    drawSprite(player.hero, player.x, player.y - hop, {
      flip: false, sx: 1 - amp * b, sy: 1 + amp * b, groundR: r, alpha: blink ? 0.45 : 1,
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
    ctx.fillStyle = bgPattern || '#e9dfc6';
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

    for (const pt of orbitPoints()) drawSprite('foxfire', pt.x, pt.y);
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

    if (flash > 0) {
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, flash * 1.6)})`;
      ctx.fillRect(0, 0, viewW, viewH);
    }
  }

  // ---------- Screens ----------
  // Title-screen combo book: discovered combos show their recipe and result.
  function buildBook() {
    ui.evoChart.replaceChildren();
    for (const [id, c] of Object.entries(COMBOS)) {
      const known = seen.has(id);
      const row = document.createElement('div');
      row.className = known ? 'book-row' : 'book-row unseen';
      const recipe = document.createElement('span');
      recipe.className = 'recipe';
      recipe.textContent = `${WEAPONS[id].icon()} ${WEAPONS[id].name()} + ${PASSIVE_BY_ID[c.passive].icon} ${PASSIVE_BY_ID[c.passive].title}`;
      const result = document.createElement('span');
      result.className = 'result';
      result.textContent = known ? `${c.icon} ${c.name}` : '???';
      row.append(recipe, result);
      ui.evoChart.append(row);
    }
    ui.dexCount.textContent = `무공 비급 ${seen.size} / ${Object.keys(COMBOS).length} · 무공을 최대로 올리고 짝 비급을 가지면 합성돼요`;
  }

  function startGame() {
    if (state !== 'title' && state !== 'gameover') return;
    resetGame();
    for (const el of [ui.start, ui.gameover, ui.choice, ui.pause]) el.classList.add('hidden');
    ui.hud.classList.remove('hidden');
    updateHud();
    state = 'playing';
    modalQueue.push({ type: 'hero' });
    openNextModal();
  }

  function gameOver() {
    state = 'gameover';
    const h = HEROES[player.hero];
    ui.gameoverPortrait.src = spritePath(player.hero);
    ui.gameoverStats.textContent = `${h.name} · Lv.${player.level} · ${fmtTime(elapsed)} 버팀 · 요괴 ${kills}마리 퇴치 · 합성 ${player.combos}개`;
    ui.hud.classList.add('hidden');
    ui.gameover.classList.remove('hidden');
    buildBook();
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
    if (state === 'choice' && /^Digit[1-6]$/.test(e.code)) {
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

  buildBook();
  preloadAssets().then(() => {
    buildBackground();
    resetGame();
    requestAnimationFrame(frame);
  });
})();
