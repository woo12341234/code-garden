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
    timer: $('timer'), stageInfo: $('stage-info'), level: $('level'), kills: $('kills'), formName: $('form-name'),
    portrait: $('portrait'), evoHint: $('evo-hint'), weaponRow: $('weapon-row'),
    banner: $('banner'), bannerMain: $('banner-main'), bannerSub: $('banner-sub'),
    start: $('start-screen'), titleStats: $('title-stats'), toast: $('toast'), toastTitle: $('toast-title'), toastSub: $('toast-sub'),
    achv: $('achv-screen'), achvList: $('achv-list'), bookList: $('book-list'), achvCount: $('achv-count'), bookCount: $('book-count'), heroList: $('hero-list'),
    choice: $('choice-screen'), choiceTitle: $('choice-title'),
    choiceSubtitle: $('choice-subtitle'), choiceCards: $('choice-cards'),
    pause: $('pause-screen'), pauseBuild: $('pause-build'), pauseDmg: $('pause-dmg'), pauseStats: $('pause-stats'), quitBtn: $('quit-btn'),
    choiceTools: $('choice-tools'), gold: $('gold'), gameoverTitle: $('gameover-title'), continueBtn: $('continue-btn'),
    dashBtn: $('dash-btn'), ultBtn: $('ult-btn'), questScreen: $('quest-screen'), questList: $('quest-list'),
    shop: $('shop-screen'), shopList: $('shop-list'), shopGold: $('shop-gold'),
    gameover: $('gameover-screen'), gameoverPortrait: $('gameover-portrait'), gameoverStats: $('gameover-stats'),
  };

  // ---------- Sprites ----------
  // Each key loads assets/<key>.png. If the file is missing, a colored circle + emoji is drawn instead.
  // size = on-screen size in CSS px (our pixel art is drawn at exactly 2x its grid size).
  const SPRITE_DEFS = {
    cheongpung: { size: 64, color: '#34767f', emoji: '🗡️' },
    unhak: { size: 64, color: '#e4e2d6', emoji: '📜' },
    yeoubi: { size: 64, color: '#c4303c', emoji: '🦊' },
    cheolsan: { size: 64, color: '#c47a34', emoji: '📿' },
    dallae: { size: 64, color: '#be342e', emoji: '🔔' },
    yawol: { size: 64, color: '#34324e', emoji: '🥷' },
    songhwa: { size: 64, color: '#608c56', emoji: '🌿' },
    muyeong: { size: 64, color: '#6e707c', emoji: '⚔️' },
    geumbi: { size: 64, color: '#deba50', emoji: '🧧' },
    seola: { size: 64, color: '#ecf4fa', emoji: '❄️' },
    cheonma: { size: 64, color: '#781824', emoji: '😈' },
    sansin: { size: 64, color: '#f0eee4', emoji: '🏔️' },
    icicle: { size: 20, color: '#bee6ff' },
    baekmae: { size: 64, color: '#463c46', emoji: '🌸' },
    palgeol: { size: 64, color: '#967d5f', emoji: '🥢' },
    dangyu: { size: 64, color: '#28503c', emoji: '📍' },
    namgung: { size: 64, color: '#284696', emoji: '👑' },
    maengju: { size: 64, color: '#f5f2e8', emoji: '🐉' },
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
    aemi: { size: 64, color: '#b096d2', emoji: '🗡️' },
    gonryun: { size: 64, color: '#6ea0d2', emoji: '🏔️' },
    jegal: { size: 64, color: '#46786e', emoji: '🪶' },
    dokgo: { size: 64, color: '#24222c', emoji: '🗡️' },
    hyeolrang: { size: 64, color: '#828290', emoji: '🐺' },
    hyeonmu: { size: 64, color: '#462c60', emoji: '👻' },
    jusun: { size: 64, color: '#aa7846', emoji: '🍶' },
    hwaryeon: { size: 64, color: '#d23228', emoji: '🔥' },
    dueok: { size: 64, color: '#466ebe', emoji: '👹' },
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

  // Pixel-art badges (assets/icons) that stand in for emoji anywhere in the UI.
  const ICON_FILES = {"🗡️": "sword", "🔥": "fire", "⭕": "chakram", "⚡": "bolt", "☯️": "taiji", "🌀": "swirl", "💫": "qi", "🎇": "firework", "🕊️": "crane", "☠️": "poison_skull", "🔪": "slash", "🧊": "icecube", "🌪️": "tornado", "📯": "talisman", "🌸": "sakura", "🏵️": "plumfall", "🖐️": "palm", "🛕": "vajra", "🥢": "staff", "🍶": "bottle", "📍": "needles", "🧪": "flask", "⚔️": "crossed", "👑": "crown", "🥶": "icepalm", "🌨️": "snowcloud", "😈": "demon", "🩸": "blood", "🪷": "lotus", "🏔️": "mountain", "☁️": "cloud", "🔯": "formation", "🪶": "feather", "👊": "fist", "🦊": "fox", "🌕": "moon", "🌩️": "thunder", "🔱": "trident", "⛰️": "rockmount", "✨": "sparkles", "🐉": "dragon", "🐲": "dragon_red", "🦢": "swan", "❄️": "snowflake", "🕸️": "web", "💮": "whiteflower", "🙏": "pray", "🌧️": "rain", "👹": "oni", "💗": "heart", "⏳": "hourglass", "🍃": "leaf", "🧲": "magnet", "🍵": "tea", "🎯": "target", "📜": "scroll", "🛡️": "shield", "👥": "clones", "🧧": "luckbag", "🕯️": "candle", "🏹": "bow", "🍑": "peach", "💰": "money", "🔄": "reroll", "⏭️": "skip", "🚫": "banish", "💀": "skull", "🏯": "castle", "🌙": "crescent", "🌒": "darkmoon", "🌅": "sunrise", "📖": "book", "📚": "books", "🎒": "bundle", "🎁": "chest", "🏮": "lantern", "☀️": "sun", "🌈": "rainbow", "⚰️": "coffin", "🌟": "star", "🥋": "gi", "🧭": "compass", "🔒": "lock", "🏆": "trophy", "🧨": "firecracker"};
  const EMOJI_RE = /\p{Extended_Pictographic}\uFE0F?(?:\u200D\p{Extended_Pictographic}\uFE0F?)*/gu;
  function iconImg(emoji, cls = 'pi') {
    const name = ICON_FILES[emoji] || ICON_FILES[emoji.replace(/\uFE0F/g, '')] || ICON_FILES[emoji + '\uFE0F'];
    if (!name) {
      const span = document.createElement('span');
      span.textContent = emoji;
      return span;
    }
    const img = document.createElement('img');
    img.src = spritePath(`icons/${name}`);
    img.alt = emoji;
    img.className = cls;
    return img;
  }
  // Sets el's content to text, swapping each known emoji for its pixel icon.
  function richText(el, text) {
    const parts = [];
    let last = 0;
    for (const m of text.matchAll(EMOJI_RE)) {
      if (m.index > last) parts.push(text.slice(last, m.index));
      parts.push(iconImg(m[0]));
      last = m.index + m[0].length;
    }
    if (last < text.length) parts.push(text.slice(last));
    el.replaceChildren(...parts);
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
      create: () => ({ damage: 14, count: 1, cooldown: 1.0, timer: 0.3, range: 135, height: 84 }),
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

  // ---------- Sect visual themes ----------
  // Every technique gets particles in its sect's style when it fires, while its projectiles fly and
  // where it lands. General techniques borrow the hero's sect.
  const SECT_FX = {
    hwasan: { shape: 'petal', colors: ['#ff9fc0', '#ffd1e0', '#e0507a', '#ffffff'], glow: '255, 130, 175', sigil: 'plum' },
    mudang: { shape: 'taiji', colors: ['#ffffff', '#a8ccff', '#2a2224'], glow: '150, 190, 255', sigil: 'taiji' },
    sorim: { shape: 'ember', colors: ['#ffd76b', '#fff2b0', '#e0a030'], glow: '255, 205, 90', sigil: 'halo' },
    gaebang: { shape: 'leaf', colors: ['#8fd070', '#c8e8a0', '#5a8a3a'], glow: '150, 215, 100', sigil: 'dust' },
    dang: { shape: 'mist', colors: ['#a070e0', '#9fe060', '#4a7a50'], glow: '150, 230, 90', sigil: 'dust' },
    namgung: { shape: 'spark', colors: ['#ffe08a', '#ffffff', '#6080e0'], glow: '255, 220, 120', sigil: 'halo' },
    bukhae: { shape: 'flake', colors: ['#ffffff', '#bfe6ff', '#7ab8f0'], glow: '170, 220, 255', sigil: 'frost' },
    magyo: { shape: 'ember', colors: ['#ff3040', '#a01020', '#2a1018', '#ff8060'], glow: '230, 30, 50', sigil: 'blood' },
    aemi: { shape: 'petal', colors: ['#e0c8ff', '#ffffff', '#b090e0', '#ffd76b'], glow: '200, 160, 250', sigil: 'lotus' },
    gonryun: { shape: 'flake', colors: ['#ffffff', '#cfe8ff', '#90c0f0'], glow: '160, 210, 255', sigil: 'frost' },
    jegal: { shape: 'leaf', colors: ['#80e0c0', '#ffffff', '#3a8070'], glow: '110, 220, 180', sigil: 'bagua' },
    maeng: { shape: 'spark', colors: ['#ffe08a', '#ffffff', '#ffb040'], glow: '255, 225, 140', sigil: 'halo' },
  };
  // Combos / sect ultimates switch to an entirely different, awakened look in their own colour.
  const COMBO_FX = {
    shot: ['255, 215, 90', 'spark'], orbit: ['110, 190, 255', 'ember'], boomerang: ['255, 230, 140', 'spark'], lightning: ['190, 150, 255', 'spark'],
    aura: ['255, 205, 90', 'ember'], quake: ['210, 150, 90', 'mist'], beam: ['120, 230, 255', 'spark'], firework: ['255, 90, 50', 'ember'],
    fairy: ['255, 250, 240', 'petal'], thorn: ['150, 230, 90', 'mist'], geomsul: ['255, 225, 120', 'spark'], gwonbeop: ['255, 180, 60', 'ember'],
    slash: ['90, 220, 140', 'leaf'], icicle: ['170, 225, 255', 'flake'], tornado: ['150, 230, 200', 'leaf'], mine: ['210, 70, 210', 'ember'],
    plum: ['255, 100, 160', 'petal'], taiji: ['120, 160, 255', 'taiji'], yeorae: ['255, 215, 90', 'ember'], tagu: ['130, 210, 90', 'leaf'],
    needles: ['170, 100, 240', 'mist'], skysword: ['255, 225, 120', 'spark'], binbaek: ['190, 235, 255', 'flake'], cheonmasingong: ['230, 20, 50', 'ember'],
    emeija: ['210, 170, 255', 'petal'], seolgeom: ['200, 235, 255', 'flake'], formation: ['90, 230, 190', 'leaf'],
  };
  const evoCache = {};
  function evoTheme(id) {
    if (evoCache[id]) return evoCache[id];
    const [rgb, shape] = COMBO_FX[id] || ['255, 215, 90', 'spark'];
    return (evoCache[id] = { rgb, glow: rgb, shape, colors: [`rgb(${rgb})`, '#ffffff', `rgb(${rgb})`, '#2a2224'], sigil: 'ult' });
  }
  function sectStyle(id) {
    if (player?.weapons[id]?.evolved) return evoTheme(id);
    const W = WEAPONS[id];
    if (W?.sect) return SECT_FX[W.sect];
    const h = player && HEROES[player.hero];
    if (!h) return null;
    return SECT_FX[h.allSects ? 'maeng' : h.sect] || null;
  }
  const PARTICLE_CAP = 700;
  const INK_FX = { shape: 'ink', colors: ['#2a2224', '#2a2224', '#5a2a2a'] };
  function flair(st, x, y, n, speed = 120, life = 0.7, size = 4) {
    for (let i = 0; i < n && particles.length < PARTICLE_CAP; i++) {
      const a = Math.random() * Math.PI * 2;
      const v = speed * (0.3 + Math.random() * 0.7);
      particles.push({
        x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 20, life: life * (0.6 + Math.random() * 0.6), max: life,
        size: size * (0.7 + Math.random() * 0.6), shape: st.shape, color: st.colors[i % st.colors.length],
        rot: Math.random() * 6.28, spin: (Math.random() - 0.5) * 8, fall: st.shape === 'petal' || st.shape === 'flake' || st.shape === 'leaf' ? 40 : st.shape === 'ember' ? -50 : 0,
      });
    }
  }
  function castFlair(st) {
    flair(st, player.x, player.y - 8, 8, 150, 0.8, 5);
    if (fx.length < 200) fx.push({ kind: 'sigil', x: player.x, y: player.y + player.radius * 0.8, style: st.sigil, glow: st.glow, life: 0.6, max: 0.6 });
  }
  function hitFlair(st, x, y, big) {
    flair(st, x, y, big ? 6 : 3, big ? 160 : 100, 0.55, big ? 5 : 4);
    if (st.sigil === 'ult') flair(INK_FX, x, y, big ? 5 : 3, 180, 0.45, 3);
    if (fx.length < 220) fx.push({ kind: 'bloom', x, y, glow: st.glow, r: big ? 26 : 16, life: 0.22, max: 0.22 });
  }

  function drawParticle(p) {
    const k = clamp(p.life / p.max, 0, 1);
    const s = Math.max(1, p.size * (0.5 + 0.5 * k));
    ctx.globalAlpha = k;
    ctx.fillStyle = p.color;
    if (!p.shape) {
      if (p.star) {
        ctx.fillRect(p.x - s * 1.5, p.y - s / 2, s * 3, s);
        ctx.fillRect(p.x - s / 2, p.y - s * 1.5, s, s * 3);
      } else ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s);
      return;
    }
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    switch (p.shape) {
      case 'petal':
        ctx.beginPath();
        ctx.ellipse(0, 0, s * 1.3, s * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fillRect(-s * 0.6, -0.5, s * 0.6, 1);
        break;
      case 'leaf':
        ctx.beginPath();
        ctx.ellipse(0, 0, s * 1.5, s * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(40, 60, 30, 0.6)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-s * 1.4, 0);
        ctx.lineTo(s * 1.4, 0);
        ctx.stroke();
        break;
      case 'flake':
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let i = 0; i < 3; i++) {
          const a = (i * Math.PI) / 3;
          ctx.moveTo(-Math.cos(a) * s * 1.4, -Math.sin(a) * s * 1.4);
          ctx.lineTo(Math.cos(a) * s * 1.4, Math.sin(a) * s * 1.4);
        }
        ctx.stroke();
        break;
      case 'taiji':
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, s, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#2a2224';
        ctx.beginPath();
        ctx.arc(0, 0, s, -Math.PI / 2, Math.PI / 2);
        ctx.arc(0, s / 2, s / 2, Math.PI / 2, -Math.PI / 2, true);
        ctx.arc(0, -s / 2, s / 2, Math.PI / 2, -Math.PI / 2);
        ctx.fill();
        break;
      case 'ember':
        ctx.globalAlpha = k * 0.35;
        ctx.beginPath();
        ctx.arc(0, 0, s * 1.7, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = k;
        ctx.beginPath();
        ctx.arc(0, 0, s * 0.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-1, -1, 2, 2);
        break;
      case 'mist':
        ctx.globalAlpha = k * 0.45;
        ctx.beginPath();
        ctx.arc(0, 0, s * (2.6 - k * 1.2), 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'ink':
        ctx.globalAlpha = k * 0.85;
        ctx.beginPath();
        ctx.arc(0, 0, s, 0, Math.PI * 2);
        ctx.arc(s * 1.3, 0, s * 0.45, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'spark':
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-s * 1.6, 0);
        ctx.lineTo(-s * 0.4, s * 0.7);
        ctx.lineTo(s * 0.4, -s * 0.7);
        ctx.lineTo(s * 1.6, 0);
        ctx.stroke();
        break;
    }
    ctx.restore();
  }

  function drawSigil(f) {
    const a = clamp(f.life / f.max, 0, 1);
    const t = 1 - a;
    const R = player.radius * (f.style === 'ult' ? 2.4 + t * 2.4 : 1.6 + t * 1.6);
    ctx.save();
    ctx.translate(f.x, f.y);
    ctx.scale(1, 0.45);
    ctx.globalAlpha = a;
    ctx.strokeStyle = `rgba(${f.glow}, 0.95)`;
    ctx.fillStyle = `rgba(${f.glow}, 0.18)`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, R, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.rotate(anim * 2);
    ctx.lineWidth = 2;
    if (f.style === 'ult') {
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, R * 0.8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(42, 34, 36, 0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, R * 0.62, 0, Math.PI * 2);
      ctx.stroke();
      for (let i = 0; i < 8; i++) {
        ctx.rotate(Math.PI / 4);
        ctx.fillStyle = `rgba(${f.glow}, 0.95)`;
        ctx.beginPath();
        ctx.moveTo(R * 0.82, -5);
        ctx.lineTo(R * 1.25, 0);
        ctx.lineTo(R * 0.82, 5);
        ctx.fill();
        ctx.fillStyle = 'rgba(42, 34, 36, 0.85)';
        ctx.fillRect(R * 0.4, -2, R * 0.16, 4);
      }
    } else if (f.style === 'taiji') {
      ctx.beginPath();
      ctx.arc(0, 0, R * 0.7, 0, Math.PI * 2);
      ctx.moveTo(0, -R * 0.7);
      ctx.arc(0, -R * 0.35, R * 0.35, -Math.PI / 2, Math.PI / 2);
      ctx.arc(0, R * 0.35, R * 0.35, -Math.PI / 2, Math.PI / 2, true);
      ctx.stroke();
    } else if (f.style === 'bagua') {
      for (let i = 0; i < 8; i++) {
        ctx.rotate(Math.PI / 4);
        ctx.fillStyle = `rgba(${f.glow}, 0.9)`;
        ctx.fillRect(R * 0.62, -4, 4, 8);
        if (i % 2) ctx.fillRect(R * 0.74, -4, 4, 8);
      }
    } else if (f.style === 'plum' || f.style === 'lotus') {
      for (let i = 0; i < 5; i++) {
        ctx.rotate((Math.PI * 2) / 5);
        ctx.beginPath();
        ctx.ellipse(R * 0.45, 0, R * 0.3, R * 0.16, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else if (f.style === 'frost') {
      for (let i = 0; i < 6; i++) {
        ctx.rotate(Math.PI / 3);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(R * 0.85, 0);
        ctx.moveTo(R * 0.5, 0);
        ctx.lineTo(R * 0.65, R * 0.15);
        ctx.moveTo(R * 0.5, 0);
        ctx.lineTo(R * 0.65, -R * 0.15);
        ctx.stroke();
      }
    } else if (f.style === 'blood') {
      for (let i = 0; i < 3; i++) {
        ctx.rotate((Math.PI * 2) / 3);
        ctx.beginPath();
        ctx.arc(R * 0.3, 0, R * 0.5, -1, 1);
        ctx.stroke();
      }
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, R * 0.72, 0, Math.PI * 2);
      ctx.stroke();
      for (let i = 0; i < 12; i++) {
        ctx.rotate(Math.PI / 6);
        ctx.fillStyle = `rgba(${f.glow}, 0.9)`;
        ctx.fillRect(R * 0.78, -1.5, R * 0.18, 3);
      }
    }
    ctx.restore();
  }

  // ---------- Martial basics whose form grows with the realm (경지) ----------
  // A classic wuxia progression: a blade first only cuts what it touches, then its qi extends
  // (검기), stretches into a thread (검사), hardens into a flying aura (검강) and finally the sword
  // flies by will alone (이기어검). Fists go 권각 → 권풍 → 권강 → 백보신권.
  const SWORD_FORMS = [
    { at: 0, name: '검술', desc: '눈앞의 요괴를 베어요' },
    { at: 2, name: '검기', desc: '칼날에 검기가 서려 베는 범위가 넓어져요' },
    { at: 3, name: '검사', desc: '실처럼 가는 검사가 멀리 뻗어 나가요' },
    { at: 4, name: '검강', desc: '단단히 맺힌 검강이 초승달처럼 날아가 모두 꿰뚫어요' },
    { at: 6, name: '이기어검', desc: '의지만으로 검을 날려 요괴를 쫓아 베어요' },
  ];
  const FIST_FORMS = [
    { at: 0, name: '권각', desc: '주먹과 발로 눈앞의 요괴를 쳐요' },
    { at: 2, name: '권풍', desc: '주먹 끝에서 바람이 일어 앞쪽 요괴를 날려버려요' },
    { at: 4, name: '권강', desc: '응축된 권강이 날아가 요괴를 꿰뚫어요' },
    { at: 5, name: '백보신권', desc: '백 걸음 밖의 요괴까지 주먹이 닿아 터져요' },
  ];
  function formIndex(forms, w) {
    const realm = (player?.realm || 0) + (w?.evolved ? 1 : 0) + (player?.formBonus || 0);
    let i = 0;
    while (i + 1 < forms.length && forms[i + 1].at <= realm) i++;
    return i;
  }
  const heroRgb = () => (MOTION[player.hero] || [0, '255, 255, 255'])[1];

  // A close-range sweep in front of the hero.
  function arcStrike(a, radius, half, damage, push) {
    fx.push({ kind: 'arc', x: player.x, y: player.y, a, r: radius, half, rgb: heroRgb(), life: 0.2, max: 0.2 });
    for (let j = enemies.length - 1; j >= 0; j--) {
      const e = enemies[j];
      const dx = e.x - player.x, dy = e.y - player.y;
      const d = Math.hypot(dx, dy);
      if (d > radius + e.type.radius * 1.3) continue;
      let da = Math.atan2(dy, dx) - a;
      da = Math.atan2(Math.sin(da), Math.cos(da));
      if (Math.abs(da) > half + e.type.radius / Math.max(d, 1) && d > e.type.radius + player.radius * 1.8) continue;
      damageEnemy(e, j, damage, dx, dy, push);
    }
  }

  function waveShot(a, damage, speed, radius, life) {
    projectiles.push({
      kind: 'wave', x: player.x, y: player.y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed,
      damage, pierce: 999, radius, life, max: life, rgb: heroRgb(), hit: new Set(),
    });
  }

  Object.assign(WEAPONS, {
    geomsul: {
      name: () => { const f = SWORD_FORMS[formIndex(SWORD_FORMS, player?.weapons.geomsul)]; return f.at ? `검술 · ${f.name}` : '검술'; },
      icon: () => '⚔️',
      desc: '눈앞을 베는 근접 검술. 경지가 오를수록 검기 → 검사 → 검강 → 이기어검으로 뻗어 나가요',
      up: '데미지 +6, 대기시간 -6%',
      max: 6,
      create: () => ({ damage: 17, cooldown: 0.8, timer: 0.2, range: 112 }),
      upgrade(w) { w.damage += 6; w.cooldown *= 0.94; },
      update(w, dt) {
        if ((w.timer -= dt) > 0) return;
        const stage = formIndex(SWORD_FORMS, w);
        const target = nearestEnemy(stage >= 2 ? 420 : w.range + 60);
        if (!target) return;
        w.timer = w.cooldown * player.haste;
        const a = Math.atan2(target.y - player.y, target.x - player.x);
        const r = w.range * player.area * (stage >= 1 ? 1.4 : 1);
        arcStrike(a, r, stage >= 1 ? 1.5 : 1.25, w.damage * (stage >= 1 ? 1.15 : 1), 10);
        if (player.issen && ++player.swings % 8 === 0) {
          beamStrike(a, Math.hypot(viewW, viewH) * 0.6, 22, w.damage * 4, 'gold');
          beamStrike(a + Math.PI, Math.hypot(viewW, viewH) * 0.6, 22, w.damage * 4, 'gold');
          shake = Math.max(shake, 8);
          flash = Math.max(flash, 0.15);
          addFloatText(player.x, player.y - 46, '일섬!', '#ffd76b');
        }
        const n = 1 + player.extra;
        for (let i = 0; i < n; i++) {
          const b = a + (i - (n - 1) / 2) * 0.3;
          if (stage === 2) beamStrike(b, 300, 5, w.damage * 0.8);
          if (stage >= 3) waveShot(b, w.damage * 1.6, 430, 24 * player.area, 0.9);
        }
        if (stage >= 4) {
          for (let i = 0; i < 2 + player.extra; i++) {
            const b = a + Math.PI + (i - 0.5) * 1.2;
            projectiles.push({
              kind: 'homing', x: player.x, y: player.y, vx: Math.cos(b) * 300, vy: Math.sin(b) * 300,
              speed: 460, damage: w.damage * 1.2, pierce: 3 + player.pierce, radius: 10, sprite: 'sword', life: 2.2, hit: new Set(),
            });
          }
        }
      },
    },
    gwonbeop: {
      name: () => { const f = FIST_FORMS[formIndex(FIST_FORMS, player?.weapons.gwonbeop)]; return f.at ? `권법 · ${f.name}` : '권법'; },
      icon: () => '👊',
      desc: '눈앞을 치는 근접 권법. 경지가 오를수록 권풍 → 권강 → 백보신권으로 멀리 닿아요',
      up: '데미지 +7, 밀쳐내기 +4',
      max: 6,
      create: () => ({ damage: 20, cooldown: 0.62, timer: 0.2, range: 92, push: 18 }),
      upgrade(w) { w.damage += 7; w.push += 4; },
      update(w, dt) {
        if ((w.timer -= dt) > 0) return;
        const stage = formIndex(FIST_FORMS, w);
        const far = stage >= 3 ? 560 : stage >= 2 ? 420 : w.range + 50;
        const target = nearestEnemy(far);
        if (!target) return;
        w.timer = w.cooldown * player.haste;
        const a = Math.atan2(target.y - player.y, target.x - player.x);
        const r = w.range * player.area;
        arcStrike(a, r, 1.05, w.damage, w.push);
        if (stage >= 1) {
          const fx0 = player.x + Math.cos(a) * r * 1.3, fy0 = player.y + Math.sin(a) * r * 1.3;
          ringBlast(fx0, fy0, 46 * player.area, w.damage * 0.8, w.push + 10, 'gold');
        }
        for (let i = 0; i < 1 + player.extra; i++) {
          const b = a + (i - player.extra / 2) * 0.3;
          if (stage >= 2) waveShot(b, w.damage * 1.5, 470, 20 * player.area, 0.8);
        }
        if (stage >= 3) {
          // 백보신권: the blow lands on a distant yokai and bursts there
          const pool = enemies.filter((e) => !e.type.prop && dist(e.x, e.y, player.x, player.y) < 560);
          for (let k = 0; k < Math.min(pool.length, 2 + player.extra); k++) {
            const e = pool[Math.floor(Math.random() * pool.length)];
            fx.push({ kind: 'beam', x: player.x, y: player.y, a: Math.atan2(e.y - player.y, e.x - player.x), len: dist(e.x, e.y, player.x, player.y), w: 8, life: 0.2, max: 0.2, tint: 'gold' });
            ringBlast(e.x, e.y, 70 * player.area, w.damage * 2.2, 24, 'gold');
          }
        }
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
      create: () => ({ damage: 13, radius: 105, cooldown: 1.2, timer: 0.4 }),
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
      name: '청풍', role: '검객', weapon: 'geomsul', hp: 100, speed: 195,
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
      sect: 'sorim', name: '철산', role: '소림 무승', weapon: 'gwonbeop', hp: 150, speed: 170,
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
    dokgo: {
      name: '독고', role: '검성', weapon: 'geomsul', hp: 100, speed: 205, unlock: 'reaper',
      trait: '검술이 한 단계 높은 형으로 시작, 8번째 베기마다 화면을 가르는 일섬, 치명타 +10%',
      ranks: ['무명검객', '검객', '검호', '검협', '검왕', '검존', '검신', '검성'],
      setup(p) { p.formBonus = 1; p.issen = true; p.crit += 0.1; },
    },
    hyeolrang: {
      name: '혈랑', role: '광전사 낭인', weapon: 'slash', extra: 'geomsul', hp: 130, speed: 210, unlock: 'kill1000',
      trait: 'HP가 낮을수록 강해져요(최대 피해 ×2.2), 처치할 때마다 HP 0.5 흡혈',
      ranks: ['떠돌이', '낭인', '혈랑', '혈귀', '혈왕', '광혈', '혈마', '혈랑왕'],
      setup(p) { p.berserk = 1.2; p.killHeal += 0.5; },
    },
    hyeonmu: {
      name: '현무', role: '강시술사', weapon: 'orbit', hp: 95, speed: 195, unlock: 'elite5',
      trait: '쓰러진 요괴의 20%가 원귀로 일어나 다른 요괴를 덮쳐요',
      ranks: ['수습 술사', '술사', '강시술사', '귀문술사', '귀왕', '명부지기', '저승관', '귀신왕'],
      setup(p) { p.necro = 0.2; },
    },
    jusun: {
      name: '주선', role: '취권 고수', weapon: 'gwonbeop', extra: 'bottle', hp: 115, speed: 215, unlock: 'lantern20',
      trait: '취권: 요괴의 공격을 30% 확률로 흘려내요, 몸이 흔들흔들',
      ranks: ['술꾼', '취객', '취협', '취선', '주광', '주성', '취불', '주선'],
      setup(p) { p.dodge = 0.3; p.drunk = true; },
    },
    hwaryeon: {
      name: '화련', role: '불사조의 무녀', weapon: 'firework', hp: 100, speed: 205, unlock: 'realm7',
      trait: '지나간 자리에 불길이 남고, 한 번 불사조로 되살아나며 주변을 불태워요',
      ranks: ['불씨', '화녀', '염화', '화령', '주작의 깃', '화신', '불사조', '주작'],
      setup(p) { p.flameTrail = true; p.revives += 1; p.phoenix = true; },
    },
    dueok: {
      name: '두억', role: '도깨비 왕', weapon: 'quake', hp: 170, speed: 190, unlock: 'gold1000',
      trait: '은자 ×2, 줍는 범위 ×2, 보물함 선물 +1, 받는 피해 -10%',
      ranks: ['꼬마 도깨비', '도깨비', '도깨비 장수', '도깨비 대장', '도깨비 두령', '방망이 왕', '도깨비 왕', '두억시니'],
      setup(p) { p.greed += 1; p.pickupRadius *= 2; p.bonusGift = 1; p.armor *= 0.9; },
    },
    maengju: {
      allSects: true, name: '무림맹주', role: '천하제일인', weapon: 'geomsul', extra: 'jewang', hp: 180, speed: 205, unlock: 'sectUlt3',
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
    geomsul: { passive: 'crit', name: '심검합일', icon: '🌟', desc: '검과 마음이 하나가 되어 한 단계 높은 형으로 펼쳐져요. 데미지 ×2, 대기시간 -25%',
      apply(w) { w.damage *= 2; w.cooldown *= 0.75; } },
    gwonbeop: { passive: 'armor', name: '금강패권', icon: '☀️', desc: '한 단계 높은 형의 권법. 데미지 ×2, 범위 +20',
      apply(w) { w.damage *= 2; w.range += 20; } },
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
  // ---------- Chapters (장) ----------
  // Each chapter runs STAGE_LEN seconds, then its boss appears; beating it clears the chapter and the
  // hero chooses to press on (keeping the build) or return home with the loot. Chapter 4 ends the run.
  const STAGE_LEN = 210;
  const STAGES = [
    { name: '1장 · 마을 어귀', sub: '해 질 녘, 마을에 도깨비불이 번진다', pool: ['wisp', 'dokkaebi', 'crow'], mid: null, boss: 'daedokkaebi', tint: null },
    { name: '2장 · 대나무 숲', sub: '먹물 같은 안개가 숲을 삼킨다', pool: ['wisp', 'dokkaebi', 'crow', 'meok', 'jangseung'], mid: 'daedokkaebi', boss: 'imugi', tint: 'rgba(60, 120, 60, 0.13)' },
    { name: '3장 · 버려진 산사', sub: '원귀와 강시가 종을 울린다', pool: ['crow', 'meok', 'jangseung', 'wongwi', 'gangsi'], mid: 'imugi', boss: 'heukyo', tint: 'rgba(90, 50, 120, 0.15)' },
    { name: '4장 · 저승길', sub: '어둠 끝에서 저승사자가 기다린다', pool: ['meok', 'wongwi', 'gangsi', 'eodukssini', 'bulgasari'], mid: 'heukyo', boss: 'jeoseung', tint: 'rgba(20, 16, 30, 0.28)' },
  ];
  const ENDLESS = { name: '무한 수련', sub: '끝없는 요괴의 밤', pool: null, mid: null, boss: null, tint: 'rgba(120, 20, 30, 0.16)', endless: true };
  const MARCH_TIMES = [420, 720]; // 백귀야행: a parade of ghosts crossing the screen (then every 5 min)

  // ---------- Passive upgrades ----------
  const PASSIVES = [
    { id: 'hp', max: 6, icon: '💗', title: '단전호흡', desc: '최대 HP +20, HP 20 회복', apply(p) { p.maxHp += 20; p.hp = Math.min(p.maxHp, p.hp + 20); } },
    { id: 'haste', max: 6, icon: '⏳', title: '쾌속', desc: '모든 무공 대기시간 -10%', apply(p) { p.haste *= 0.9; } },
    { id: 'speed', max: 6, icon: '🍃', title: '경공', desc: '이동 속도 +10%', apply(p) { p.speed *= 1.1; } },
    { id: 'magnet', max: 6, icon: '🧲', title: '흡성대법', desc: '엽전 줍는 범위 +30%', apply(p) { p.pickupRadius *= 1.3; } },
    { id: 'regen', max: 6, icon: '🍵', title: '운기조식', desc: '초당 HP 1 회복', apply(p) { p.regen += 1; } },
    { id: 'crit', max: 6, icon: '🎯', title: '급소 찌르기', desc: '치명타 확률 +10%', apply(p) { p.crit += 0.1; } },
    { id: 'xp', max: 6, icon: '📜', title: '깨달음', desc: '얻는 경험치 +15%', apply(p) { p.xpMul += 0.15; } },
    { id: 'armor', max: 6, icon: '🛡️', title: '금강불괴', desc: '받는 피해 -8%', apply(p) { p.armor *= 0.92; } },
    { id: 'area', max: 6, icon: '☯️', title: '내공', desc: '결계·장풍·폭염부·독안개 범위 +12%', apply(p) { p.area *= 1.12; } },
    { id: 'extra', max: 6, icon: '👥', title: '분신술', desc: '비검·원월륜·검기·폭염부·종이학 발사 수 +1', apply(p) { p.extra++; } },
    { id: 'luck', max: 6, icon: '🧧', title: '복주머니', desc: '복숭아·인삼·호리병·벽력탄이 더 자주 나와요', apply(p) { p.luck += 0.4; } },
  ];
  PASSIVES.push(
    { id: 'dmg', max: 6, icon: '🩸', title: '혈기', desc: '모든 피해 +10%', apply(p) { p.dmgMul += 0.1; } },
    { id: 'duration', max: 6, icon: '🕯️', title: '집중', desc: '독안개·회오리·지뢰부 지속시간 +20%', apply(p) { p.durMul += 0.2; } },
    { id: 'pierce', max: 6, icon: '🏹', title: '관통술', desc: '비검·종이학이 요괴를 하나 더 꿰뚫어요', apply(p) { p.pierce++; } },
  );
  const PASSIVE_BY_ID = Object.fromEntries(PASSIVES.map((u) => [u.id, u]));
  // Offered to fill the row once everything else is maxed out.
  const SNACK = { icon: '🍑', title: '천도복숭아', desc: 'HP 30 회복', pick: () => { player.hp = Math.min(player.maxHp, player.hp + 30); } };

  // ---------- Progress & achievements (saved per browser) ----------
  const PROGRESS_KEY = 'yokai-survivors-progress';
  const progress = { totalKills: 0, combos: [], achievements: [], played: [], bosses: {}, gold: 0, totalGold: 0, shop: {}, wins: 0, bestStage: 0, difficulty: 'normal', clears: {}, mastery: {}, quests: null, questsDone: 0 };
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
    { id: 'stage2', icon: '🏮', name: '숲으로', desc: '1장 돌파', check: () => progress.bestStage >= 1 },
    { id: 'stage3', icon: '🏯', name: '산사의 종소리', desc: '3장 돌파', check: () => progress.bestStage >= 3 },
    { id: 'reaper', icon: '⚰️', name: '저승사자 퇴치', desc: '4장의 저승사자를 쓰러뜨려 모든 장 돌파', check: () => progress.wins >= 1 },
    { id: 'elite5', icon: '🌟', name: '정예 사냥', desc: '한 판에 정예 요괴 5마리 처치', check: (p) => p.elites >= 5 },
    { id: 'lantern20', icon: '🏮', name: '석등 파괴자', desc: '한 판에 석등 20개 부수기', check: (p) => p.lanterns >= 20 },
    { id: 'gold1000', icon: '💰', name: '부자 협객', desc: '누적 은자 1,000냥 모으기', check: () => progress.totalGold >= 1000 },
    { id: 'shop1', icon: '🥋', name: '수련의 시작', desc: '수련장에서 처음으로 수련하기', check: () => Object.keys(progress.shop).length > 0 },
    { id: 'cursed', icon: '💀', name: '마기를 품고', desc: '마기 3단계 이상으로 저승사자 퇴치', check: (p) => p.curse >= 0.29 && p.wonRun },
    { id: 'clearHard', icon: '🔥', name: '고수의 길', desc: '고수 난이도로 저승사자 퇴치', check: () => progress.clears.hard || progress.clears.hell },
    { id: 'clearHell', icon: '💀', name: '마경 정복', desc: '마경 난이도로 저승사자 퇴치', check: () => progress.clears.hell },
    { id: 'quest5', icon: '📜', name: '의뢰 해결사', desc: '의뢰 5개 완료 (누적)', check: () => progress.questsDone >= 5 },
    { id: 'mastery5', icon: '🥋', name: '일인전승', desc: '협객 하나의 숙련도를 Lv.5까지 올리기', check: () => Object.keys(HEROES).some((id) => masteryLevel(id) >= 5) },
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
    richText(ui.toastTitle, t[0]);
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
  let propTimer = 0, stageIdx = 0, stageTime = 0, stageBossOut = false, midOut = false, finalSpawned = false, marchIdx = 0, banked = 0, dmgSrc = 'item', banishMode = false;
  let modalDelay = 0, flash = 0, anim = 0, shake = 0;
  const modalQueue = [];
  const keys = new Set();

  const BASE_SPEED_MUL = 1.15; // every hero moves 15% faster than their listed speed

  function resetGame(heroId = 'cheongpung') {
    const hero = HEROES[heroId];
    player = {
      x: 0, y: 0,
      hero: heroId,
      radius: 14.4,
      speed: hero.speed * BASE_SPEED_MUL, maxHp: hero.hp, hp: hero.hp, regen: 0, pickupRadius: 100, haste: 1,
      crit: 0, critMul: 2, xpMul: 1, armor: 1, area: 1, extra: 0, luck: 1, chests: 0, killHeal: 0, combos: 0,
      dmgMul: 1, durMul: 1, pierce: 0, chillAura: 0, bossKills: 0, healMul: 1, dotMul: 1, bossMul: 1, realm: 0, boost: 0, atk: 0, atkDir: 0, atkCd: 0,
      gold: 0, greed: 1, curse: 0, revives: 0, rerolls: 1, skips: 1, banishes: 1, banished: new Set(), freeze: 0,
      elites: 0, lanterns: 0, dmgBy: {}, wonRun: false,
      dashCd: 0, dashT: 0, dashVx: 0, dashVy: 0, dashFrom: null, dashes: 0, ult: 0, ults: 0, ultAgainAt: 0, spinUlt: 0, ultMul: 1,
      arc: new Set(), meteorT: 8, cleared: 0, trail: [],
      formBonus: 0, issen: false, berserk: 0, necro: 0, dodge: 0, drunk: false, flameTrail: false, phoenix: false, bonusGift: 0, trailCd: 0, swings: 0,
      level: 1, xp: 0, xpToNext: 10, picks: {},
      facing: -1, moving: false, invuln: 0, glow: 0,
      weapons: {},
    };
    hero.setup(player);
    applyShop(player);
    const ml = masteryLevel(heroId);
    if (ml >= 1) { player.maxHp += 15; player.hp += 15; }
    if (ml >= 3) player.dmgMul += 0.08;
    if (ml >= 5) { player.ult = ULT_NEED / 2; player.ultMul = 1.5; }
    grantWeapon(player, hero.weapon, masteryLevel(heroId) >= 2 ? 2 : 1);
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
    shake = 0;
    kills = 0;
    spawnTimer = 0;
    bossTimer = 0;
    bossCount = 0;
    waveTimer = 0;
    propTimer = 2;
    finalSpawned = false;
    stageIdx = 0;
    stageTime = 0;
    stageBossOut = false;
    midOut = false;
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
    return (h.ranks || RANKS[h.allSects ? 'maeng' : h.sect || 'none'])[realm];
  };

  function checkRealm() {
    const c = cultivation();
    if (player.realm + 1 >= REALMS.length || c < REALMS[player.realm + 1].need) return;
    player.realm++;
    player.dmgMul += 0.06;
    if (hasArc('ten')) for (const [id, w] of Object.entries(player.weapons)) if (w.level < WEAPONS[id].max) grantWeapon(player, id);
    player.maxHp += 10;
    player.hp = player.maxHp;
    player.invuln = Math.max(player.invuln, 1);
    player.glow = 1.4;
    shake = Math.max(shake, 7);
    flash = Math.max(flash, 0.35);
    modalDelay = Math.max(modalDelay, 1.4);
    const aura = REALM_AURA[player.realm];
    burst(player.x, player.y, 36, aura && aura !== 'rainbow' ? [`rgb(${aura})`, '#ffffff'] : ['#ffd76b', '#ffffff', '#e0503f'], 260, 0.9, 5, true);
    showBanner(`경지 상승! ${REALMS[player.realm].name}`, '', `${rankOf(player.realm)}(으)로 승격 · 모든 피해 +6%, 최대 HP +10`);
    for (const [id, forms] of [['geomsul', SWORD_FORMS], ['gwonbeop', FIST_FORMS]]) {
      const w = player.weapons[id];
      if (!w) continue;
      const f = forms[formIndex(forms, w)];
      if (f.at === player.realm + (w.evolved ? 1 : 0) + player.formBonus) showToast(`${WEAPONS[id].icon()} ${f.name} 발현!`, f.desc);
    }
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

  // ---------- Hero mastery (협객 숙련도) ----------
  const MASTERY_XP = [0, 40, 120, 250, 450, 700];
  const MASTERY_PERKS = ['최대 HP +15', '시작 무공 +1단계', '모든 피해 +8%', '비전서 선택지 +1', '필살기 게이지 절반으로 시작 · 필살기 피해 +50%'];
  function masteryLevel(id) {
    const xp = progress.mastery[id] || 0;
    let lv = 0;
    while (lv + 1 < MASTERY_XP.length && xp >= MASTERY_XP[lv + 1]) lv++;
    return lv;
  }
  function gainMastery(win) {
    const id = player.hero;
    const before = masteryLevel(id);
    const xp = Math.floor(kills / 15) + 25 * player.cleared + (win ? 80 : 0) + Math.floor(elapsed / 30);
    progress.mastery[id] = (progress.mastery[id] || 0) + xp;
    saveProgress();
    const after = masteryLevel(id);
    if (after > before) showToast(`🌟 ${HEROES[id].name} 숙련 Lv.${after}!`, MASTERY_PERKS[after - 1]);
    return xp;
  }

  // ---------- 비전서 (arcana): run-wide rule changers ----------
  const ARCANA = [
    { id: 'thunder', icon: '⚡', name: '뇌정', desc: '치명타가 터지면 25% 확률로 벼락이 떨어져 주변을 태워요' },
    { id: 'bloodrain', icon: '🩸', name: '혈우', desc: '요괴를 쓰러뜨리면 8% 확률로 피의 비가 내려 주변에 큰 피해' },
    { id: 'diamond', icon: '🛡️', name: '금강신체', desc: '엽전을 주울 때마다 HP 0.4 회복, 잠깐 무적' },
    { id: 'chain', icon: '👥', name: '연환', desc: '모든 무공 발사 수 +1, 대신 모든 피해 -15%', apply(p) { p.extra++; p.dmgMul *= 0.85; } },
    { id: 'reverse', icon: '🔥', name: '역천', desc: 'HP가 절반 이하면 모든 피해 +50%' },
    { id: 'ten', icon: '📖', name: '만류귀종', desc: '경지가 오를 때마다 모든 무공이 1단계 강해져요' },
    { id: 'greedy', icon: '💰', name: '탐욕의 길', desc: '은자 ×2, 대신 받는 피해 +25%', apply(p) { p.greed *= 2; p.armor *= 1.25; } },
    { id: 'absorb', icon: '🧲', name: '흡성', desc: '줍는 범위 ×2.5, 경험치 +20%', apply(p) { p.pickupRadius *= 2.5; p.xpMul += 0.2; } },
    { id: 'heaven', icon: '⚔️', name: '천벌', desc: '보스·정예에게 주는 피해 ×1.8' },
    { id: 'meteor', icon: '🌟', name: '유성검우', desc: '8초마다 하늘에서 검 8자루가 떨어져요' },
    { id: 'frost', icon: '❄️', name: '빙결지체', desc: '맞은 요괴가 12% 확률로 얼어붙어요' },
    { id: 'gale', icon: '🍃', name: '질풍', desc: '대시 대기시간 절반, 대시가 지나간 길의 요괴를 베어요' },
    { id: 'ghostgate', icon: '💀', name: '귀문', desc: '필살기 게이지가 2배 빨리 차요' },
    { id: 'twinult', icon: '☯️', name: '쌍천', desc: '필살기가 두 번 연속으로 터져요' },
  ];
  const ARC_BY_ID = Object.fromEntries(ARCANA.map((a) => [a.id, a]));
  const hasArc = (id) => player.arc.has(id);
  // Effects that hit other enemies are deferred so they never splice `enemies` mid-loop.
  const pendingProcs = [];
  function runProcs() {
    while (pendingProcs.length) {
      const f = pendingProcs.shift();
      dmgSrc = 'arcana';
      f();
    }
  }
  function arcanaOffers() {
    const pool = shuffled(ARCANA.filter((a) => !player.arc.has(a.id)));
    return pool.slice(0, masteryLevel(player.hero) >= 4 ? 4 : 3).map((a) => ({
      icon: a.icon, title: `비전서: ${a.name}`, desc: a.desc, combo: true,
      pick: () => { player.arc.add(a.id); if (a.apply) a.apply(player); },
    }));
  }

  // ---------- Dash (경공) & ultimate (필살기) ----------
  const DASH_CD = 2.4, DASH_TIME = 0.16, DASH_SPEED = 900, ULT_NEED = 100;
  const ULT_NAMES = {
    cheongpung: '청풍만검', unhak: '뇌정만리', yeoubi: '구미호화', cheolsan: '나한대권', dallae: '만신강림', yawol: '월하난무',
    songhwa: '백초독무', muyeong: '쌍귀참', geumbi: '천부폭렬', seola: '설녀의 숨결', cheonma: '천마혈우', sansin: '산군강림',
    baekmae: '매화폭풍', palgeol: '타구광풍', dangyu: '만천암우', namgung: '창궁제왕검', maengju: '천하제일검', aemi: '금정연화',
    gonryun: '설산검우', jegal: '팔진천라', dokgo: '독고일검', hyeolrang: '혈월광란', hyeonmu: '백귀야행', jusun: '취팔선',
    hwaryeon: '주작강림', dueok: '도깨비 대잔치',
  };
  function moveInput() {
    let dx = 0, dy = 0;
    if (keys.has('KeyW') || keys.has('ArrowUp')) dy -= 1;
    if (keys.has('KeyS') || keys.has('ArrowDown')) dy += 1;
    if (keys.has('KeyA') || keys.has('ArrowLeft')) dx -= 1;
    if (keys.has('KeyD') || keys.has('ArrowRight')) dx += 1;
    if (stick.active && Math.hypot(stick.dx, stick.dy) > 8) { dx = stick.dx; dy = stick.dy; }
    return [dx, dy];
  }
  function dash() {
    if (state !== 'playing' || player.dashCd > 0) return;
    let [dx, dy] = moveInput();
    if (!dx && !dy) dx = player.facing || 1;
    const len = Math.hypot(dx, dy);
    player.dashVx = (dx / len) * DASH_SPEED;
    player.dashVy = (dy / len) * DASH_SPEED;
    player.dashT = DASH_TIME;
    player.dashFrom = { x: player.x, y: player.y };
    player.invuln = Math.max(player.invuln, 0.32);
    player.dashCd = DASH_CD * (hasArc('gale') ? 0.5 : 1);
    player.dashes++;
    burst(player.x, player.y + player.radius, 10, ['#d8cbb0', '#ffffff'], 140, 0.4, 4);
  }
  function ultimate(second = false) {
    if (!second && (state !== 'playing' || player.ult < ULT_NEED)) return;
    if (!second) { player.ult = 0; player.ults++; if (hasArc('twinult')) player.ultAgainAt = elapsed + 0.7; }
    const [style, rgb] = MOTION[player.hero] || ['slash', '255, 255, 255'];
    const dmg = (40 + player.level * 7) * player.ultMul;
    const L = Math.hypot(viewW, viewH) * 0.6;
    dmgSrc = 'ult';
    flash = Math.max(flash, 0.3);
    shake = Math.max(shake, 12);
    fx.push({ kind: 'ultwave', x: player.x, y: player.y, rgb, life: 0.9, max: 0.9 });
    burst(player.x, player.y, 50, [`rgb(${rgb})`, '#ffffff', '#2a2224'], 380, 1.1, 6, true);
    if (!second) showBanner(ULT_NAMES[player.hero] || '필살기', 'ult', `${HEROES[player.hero].name}의 필살기!`);
    if (style === 'slash') {
      for (let i = 0; i < 16; i++) waveShot((i / 16) * Math.PI * 2, dmg * 1.2, 520, 30, 1.3);
      arcStrike(0, 170, Math.PI, dmg, 30);
    } else if (style === 'twin') {
      for (const a of [Math.PI / 4, -Math.PI / 4, Math.PI * 3 / 4, -Math.PI * 3 / 4]) beamStrike(a, L, 26, dmg * 2, 'blood');
    } else if (style === 'palm') {
      ringBlast(player.x, player.y, 380, dmg * 2.4, 70, 'gold');
      fx.push({ kind: 'bigpalm', x: player.x, y: player.y, life: 0.7, max: 0.7 });
    } else if (style === 'cast') {
      ringBlast(player.x, player.y, 260, dmg, 30, 'none');
      zones.push({ x: player.x, y: player.y, r: 260, damage: dmg * 0.35, life: 3.2, tick: 0, seed: 0, tint: 'ult', rgb, hold: 0.6, src: 'ult' });
    } else if (style === 'throw') {
      for (let i = 0; i < 36; i++) {
        const a = (i / 36) * Math.PI * 2;
        projectiles.push({ x: player.x, y: player.y, vx: Math.cos(a) * 520, vy: Math.sin(a) * 520, damage: dmg * 0.9, pierce: 6, radius: 10, sprite: 'needle', life: 1.4, hit: new Set(), src: 'ult' });
      }
    } else {
      player.spinUlt = 2.4;
    }
    dmgSrc = 'item';
  }

  // ---------- 의뢰판 (daily requests) ----------
  function todayKey() {
    const d = new Date();
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  }
  const QUEST_TYPES = [
    (r) => { const n = [300, 500, 800][Math.floor(r() * 3)]; return { type: 'kills', n, text: `한 판에 요괴 ${n}마리 퇴치`, reward: Math.round(n / 4) }; },
    (r) => { const n = 1 + Math.floor(r() * 2); return { type: 'clear', n, text: `${n}장 돌파`, reward: 120 * n }; },
    (r) => { const ids = Object.keys(HEROES).filter(heroUnlocked); const h = ids[Math.floor(r() * ids.length)]; return { type: 'heroClear', h, text: `${HEROES[h].name}(으)로 1장 돌파`, reward: 180 }; },
    (r) => { const n = [3, 5][Math.floor(r() * 2)]; return { type: 'ults', n, text: `한 판에 필살기 ${n}번 사용`, reward: 40 * n }; },
    (r) => { const n = [20, 40][Math.floor(r() * 2)]; return { type: 'dashes', n, text: `한 판에 대시 ${n}번`, reward: 3 * n }; },
    (r) => { const n = 2 + Math.floor(r() * 2); return { type: 'elites', n, text: `한 판에 정예 요괴 ${n}마리 처치`, reward: 60 * n }; },
    (r) => { const n = [8, 12][Math.floor(r() * 2)]; return { type: 'lanterns', n, text: `한 판에 석등 ${n}개 부수기`, reward: 10 * n }; },
    () => ({ type: 'combo', n: 1, text: '한 판에 무공 합성 성공', reward: 150 }),
    (r) => { const n = 3 + Math.floor(r() * 2); return { type: 'realm', n, text: `한 판에 ${REALMS[n].name}의 경지 도달`, reward: 60 * n }; },
    () => ({ type: 'hardClear', n: 1, text: '고수 이상 난이도로 1장 돌파', reward: 250 }),
  ];
  function ensureQuests() {
    const key = todayKey();
    if (progress.quests && progress.quests.date === key) return progress.quests.list;
    const r = seededRandom([...key].reduce((h, c) => h * 31 + c.charCodeAt(0), 7) >>> 0);
    const types = [...QUEST_TYPES.keys()].sort(() => r() - 0.5).slice(0, 3);
    progress.quests = { date: key, list: types.map((i) => ({ ...QUEST_TYPES[i](r), done: false })) };
    saveProgress();
    return progress.quests.list;
  }
  function questMet(q, p) {
    switch (q.type) {
      case 'kills': return kills >= q.n;
      case 'clear': return p.cleared >= q.n;
      case 'heroClear': return p.hero === q.h && p.cleared >= 1;
      case 'ults': return p.ults >= q.n;
      case 'dashes': return p.dashes >= q.n;
      case 'elites': return p.elites >= q.n;
      case 'lanterns': return p.lanterns >= q.n;
      case 'combo': return p.combos >= 1;
      case 'realm': return p.realm >= q.n;
      case 'hardClear': return diff.hp >= 1.5 && p.cleared >= 1;
    }
    return false;
  }
  function checkQuests() {
    if (state !== 'playing' && state !== 'choice') return;
    for (const q of ensureQuests()) {
      if (q.done || !questMet(q, player)) continue;
      q.done = true;
      progress.gold += q.reward;
      progress.totalGold += q.reward;
      progress.questsDone++;
      saveProgress();
      showToast(`📜 의뢰 완료: ${q.text}`, `보상 은자 ${q.reward}냥`);
    }
  }
  function buildQuests() {
    const list = ensureQuests();
    ui.questList.replaceChildren(...list.map((q) => {
      const el = document.createElement('div');
      el.className = q.done ? 'achv done' : 'achv';
      const icon = document.createElement('span');
      icon.className = 'achv-icon';
      icon.append(iconImg(q.done ? '🏆' : '📜'));
      const text = document.createElement('div');
      const b = document.createElement('b');
      b.textContent = q.text;
      const sm = document.createElement('small');
      sm.textContent = q.done ? `완료 · 은자 ${q.reward}냥 받음` : `보상 은자 ${q.reward}냥 · 한 판 안에 달성하면 바로 받아요`;
      text.append(b, sm);
      el.append(icon, text);
      return el;
    }));
  }

  // Chapter boss down: sweep the field, reward the hero, then ask whether to press on.
  function stageClear() {
    progress.bestStage = Math.max(progress.bestStage, stageIdx + 1);
    saveProgress();
    for (const e of enemies) if (!e.type.prop) burst(e.x, e.y, 4, ['#2a2224', '#ffffff'], 120, 0.5, 4);
    enemies = enemies.filter((e) => e.type.prop);
    player.hp = player.maxHp;
    flash = 0.4;
    addGold(40 * (stageIdx + 1));
    showBanner(`${STAGES[stageIdx].name.split(' · ')[0]} 돌파!`, '', '요괴가 물러갔어요 · HP 전부 회복');
    player.cleared++;
    for (let k = 3; k >= 1; k--) modalQueue.push({ type: 'chest', n: 4 - k, of: 3 });
    modalQueue.push({ type: 'arcana' }, { type: 'stage' });
    modalDelay = 1.6;
    checkAchievements();
  }

  function enterStage(i) {
    stageIdx = i;
    stageTime = 0;
    stageBossOut = false;
    midOut = false;
    waveTimer = 30;
    const st = curStage();
    showBanner(st.name, '', st.sub);
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
        img: id, title: `${H.name} · ${H.role}`, desc: `${H.allSects ? '[모든 문파] ' : H.sect ? `[${SECTS[H.sect]}] ` : ''}${[H.weapon, H.extra].filter(Boolean).map((w) => WEAPONS[w].name()).join('·')} · ${H.trait} · 숙련 Lv.${masteryLevel(id)}`, hero: true,
        pick: () => {
          resetGame(id);
          enterStage(0);
          modalQueue.unshift({ type: 'arcana' });
          if (!progress.played.includes(id)) { progress.played.push(id); saveProgress(); }
          updateHud();
        },
      } : {
        img: id, title: '🔒 ???', desc: `해금 조건: 업적 「${ACHV_BY_ID[H.unlock].name}」 (${ACHV_BY_ID[H.unlock].desc})`, hero: true, locked: true,
      })));
    } else if (m.type === 'arcana') {
      showChoice('비전서', '이번 판의 규칙을 바꿀 비전서 한 권을 골라요', arcanaOffers());
    } else if (m.type === 'difficulty') {
      showChoice('난이도', '요괴의 세기를 골라주세요 (어려울수록 은자를 더 줘요)', DIFFICULTIES.map((d) => ({
        icon: d.icon, title: d.name + (progress.clears[d.id] ? ' ✓' : ''), desc: d.desc + (d.id === progress.difficulty ? ' · 지난번 선택' : ''), sect: d.id === progress.difficulty,
        pick: () => { diff = d; progress.difficulty = d.id; saveProgress(); },
      })));
    } else if (m.type === 'stage') {
      const next = STAGES[stageIdx + 1];
      showChoice(`${STAGES[stageIdx].name.split(' · ')[0]} 돌파!`, '무공은 그대로 이어져요. 더 깊이 들어갈까요?', [
        { icon: '🏮', title: `다음: ${next.name}`, desc: `${next.sub}. 더 강한 요괴가 나오고 은자도 더 많이 얻어요`, big: true, pick: () => enterStage(stageIdx + 1) },
        { icon: '🧭', title: '여기서 귀환', desc: '모은 은자를 챙겨 로비로 돌아가요', big: true, pick: () => gameOver('retire') },
      ]);
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
      richText(b, `${icon} ${label} ${player[field]} [${key}]`);
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
        icon.append(iconImg(opt.icon, 'pi big'));
        card.append(icon);
      }
      for (const [cls, text] of [['title', opt.title], ['stars', opt.stars], ['desc', opt.desc], ['key', `[${i + 1}]`]]) {
        if (!text) continue;
        const el = document.createElement('div');
        el.className = cls;
        richText(el, text);
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
  // ---------- Difficulty (난이도) ----------
  const DIFFICULTIES = [
    { id: 'easy', icon: '🍃', name: '입문', desc: '요괴 체력·공격력 ×0.6, 조금 덜 나와요. 은자 ×0.7', hp: 0.6, dmg: 0.6, spawn: 0.8, speed: 0.92, gold: 0.7 },
    { id: 'normal', icon: '⚔️', name: '강호', desc: '기본 난이도', hp: 1, dmg: 1, spawn: 1, speed: 1, gold: 1 },
    { id: 'hard', icon: '🔥', name: '고수', desc: '요괴 체력 ×1.5, 공격력 ×1.4, 더 많이 몰려와요. 은자 ×1.5', hp: 1.5, dmg: 1.4, spawn: 1.25, speed: 1.08, gold: 1.5 },
    { id: 'hell', icon: '💀', name: '마경', desc: '요괴 체력 ×2.4, 공격력 ×2, 훨씬 많고 빨라요. 은자 ×2.5', hp: 2.4, dmg: 2, spawn: 1.6, speed: 1.15, gold: 2.5 },
  ];
  let diff = DIFFICULTIES[1];

  const curStage = () => (stageIdx < STAGES.length ? STAGES[stageIdx] : ENDLESS);
  function pickEnemyType() {
    const st = curStage();
    const pool = st.pool ? st.pool.map((id) => ENEMY_TYPES[id]) : Object.values(ENEMY_TYPES).filter((t) => !t.boss && t.weight > 0 && elapsed >= (t.minTime || 0));
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
    const hp = type.prop ? 1 : type.hp * (1 + t / 120 + (t / 300) ** 2) * (1 + c) * diff.hp;
    const e = {
      type, x: 0, y: 0, hp, maxHp: hp,
      speed: type.speed * (1 + Math.min(t / 360, 0.5)) * (1 + c / 2) * diff.speed,
      damage: Math.round(type.damage * (1 + t / 240) * diff.dmg),
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
    const st = curStage();
    stageTime += dt;
    if (st.mid && !midOut && stageTime >= STAGE_LEN / 2) {
      midOut = true;
      spawnEnemy(ENEMY_TYPES[st.mid]);
      showBanner(`${ENEMY_TYPES[st.mid].name} 등장!`, 'boss');
    }
    if (st.boss && !stageBossOut && stageTime >= STAGE_LEN) {
      stageBossOut = true;
      spawnEnemy(ENEMY_TYPES[st.boss]);
      const b = enemies[enemies.length - 1];
      b.stageBoss = true;
      if (!b.type.final) { b.hp *= 2.5; b.maxHp = b.hp; }
      showBanner(`${b.type.final ? '저승사자가 나타났다!' : `장의 주인, ${b.type.name}!`}`, 'boss', '쓰러뜨리면 이 장을 돌파해요');
    }
    const marchAt = MARCH_TIMES[marchIdx] ?? MARCH_TIMES[MARCH_TIMES.length - 1] + 300 * (marchIdx - MARCH_TIMES.length + 1);
    if (elapsed >= marchAt) {
      marchIdx++;
      spawnMarch();
    }
    spawnTimer -= dt;
    if (spawnTimer <= 0 && enemies.length < MAX_ENEMIES) {
      spawnTimer = clamp(1.0 - elapsed / 160, 0.25, 1.0);
      const n = Math.max(1, Math.round((1 + Math.floor(elapsed / 60)) * (1 + player.curse) * diff.spawn));
      for (let i = 0; i < n; i++) spawnEnemy(pickEnemyType());
    }
    if (st.endless && elapsed >= BOSS_START) {
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

  // Attack motion: the hero lunges and swings toward whatever the technique just targeted.
  const ATK_TIME = 0.24;
  // How each hero's strike looks: slash (sword arc), twin, palm, cast (magic circle), throw, spin (staff).
  const MOTION = {
    cheongpung: ['slash', '64, 200, 210'], baekmae: ['slash', '250, 140, 180'], muyeong: ['twin', '220, 60, 70'],
    namgung: ['slash', '240, 200, 90'], maengju: ['slash', '255, 220, 120'], gonryun: ['slash', '150, 210, 255'],
    cheonma: ['palm', '220, 30, 50'], cheolsan: ['palm', '255, 190, 70'],
    unhak: ['cast', '120, 140, 255'], dallae: ['cast', '255, 120, 140'], geumbi: ['cast', '255, 200, 70'],
    jegal: ['cast', '90, 200, 170'], seola: ['cast', '160, 220, 255'], songhwa: ['cast', '150, 230, 90'],
    yeoubi: ['cast', '110, 190, 255'], sansin: ['cast', '255, 230, 150'],
    yawol: ['throw', '230, 60, 60'], dangyu: ['throw', '150, 230, 90'], aemi: ['throw', '190, 150, 240'],
    palgeol: ['spin', '120, 200, 90'],
    dokgo: ['slash', '230, 230, 245'], hyeolrang: ['twin', '210, 30, 40'], hyeonmu: ['cast', '180, 130, 255'],
    jusun: ['palm', '240, 170, 80'], hwaryeon: ['cast', '255, 120, 40'], dueok: ['palm', '90, 140, 230'],
  };
  function triggerAttack(proj) {
    if (player.atkCd > 0) return;
    let a;
    if (proj && (proj.vx || proj.vy)) a = Math.atan2(proj.vy, proj.vx);
    else {
      const t = nearestEnemy(600);
      a = t ? Math.atan2(t.y - player.y, t.x - player.x) : (player.facing < 0 ? Math.PI : 0);
    }
    player.atk = ATK_TIME;
    player.atkDir = a;
    player.atkCd = 0.28;
  }

  function damageEnemy(e, idx, amount, kx, ky, push = 6, quiet = false) {
    const crit = Math.random() < player.crit;
    amount *= player.dmgMul * (e.type.boss ? player.bossMul : 1) * (quiet ? player.dotMul : 1);
    if (player.berserk) amount *= 1 + player.berserk * (1 - clamp(player.hp / player.maxHp, 0, 1));
    if (player.arc.size) {
      if (hasArc('reverse') && player.hp < player.maxHp / 2) amount *= 1.5;
      if (hasArc('heaven') && (e.type.boss || e.elite)) amount *= 1.8;
      if (hasArc('frost') && Math.random() < 0.12) e.chill = 2;
      if (hasArc('thunder') && crit && dmgSrc !== 'arcana' && Math.random() < 0.25) {
        const ex = e.x, ey = e.y, v = amount * 0.6;
        pendingProcs.push(() => {
          fx.push({ kind: 'bolt', x: ex, y: ey, seed: Math.random() * 10, life: 0.3, max: 0.3 });
          ringBlast(ex, ey, 60, v, 10, 'gold');
        });
      }
    }
    if (crit) amount *= player.critMul;
    player.dmgBy[dmgSrc] = (player.dmgBy[dmgSrc] || 0) + Math.min(amount, Math.max(0, e.hp));
    e.hp -= amount;
    e.flash = 0.1;
    e.hurt = 0.14;
    if (WEAPONS[dmgSrc] && (e.flairCd = (e.flairCd || 0) - 1) <= 0) {
      const st = sectStyle(dmgSrc);
      if (st) { hitFlair(st, e.x, e.y - 4, crit || e.type.boss); e.flairCd = 3; }
    }
    if (!quiet && fx.length < 160) fx.push({ kind: 'spark', x: e.x - (kx / (Math.hypot(kx, ky) || 1)) * e.type.radius * 0.6, y: e.y - (ky / (Math.hypot(kx, ky) || 1)) * e.type.radius * 0.6 - 4, life: 0.16, max: 0.16, rot: Math.random() * Math.PI, crit });
    const k = Math.hypot(kx, ky) || 1;
    const p = e.type.prop ? 0 : e.type.boss || e.elite ? push / 6 : push;
    e.x += (kx / k) * p;
    e.y += (ky / k) * p;
    if (!quiet || crit) addFloatText(e.x, e.y - e.type.radius, crit ? `${Math.round(amount)}!` : String(Math.round(amount)), crit ? '#ff6a4d' : '#fff');
    if (e.hp <= 0) killEnemy(e, idx);
  }

  function addGold(v) {
    const g = v * player.greed * diff.gold;
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
    player.ult = Math.min(ULT_NEED, player.ult + (hasArc('ghostgate') ? 2 : 1) * (e.type.boss ? 10 : 1));
    if (hasArc('bloodrain') && Math.random() < 0.08) {
      const ex = e.x, ey = e.y;
      pendingProcs.push(() => {
        fx.push({ kind: 'ultwave', x: ex, y: ey, rgb: '200, 20, 40', life: 0.5, max: 0.5, small: true });
        ringBlast(ex, ey, 110, 40 + player.level * 5, 20, 'blood');
      });
    }
    progress.totalKills++;
    enemies.splice(idx, 1);
    if (fx.length < 200) fx.push({ kind: 'die', sprite: e.type.sprite, x: e.x, y: e.y, r: e.type.radius, sc: (e.type.scale || 1) * (e.grow || 1) * (e.elite ? 1.4 : 1), alpha: e.type.alpha ?? 1, life: 0.32, max: 0.32 });
    if (e.type.boss || e.elite) shake = Math.max(shake, e.type.boss ? 10 : 5);
    burst(e.x, e.y, e.type.boss ? 24 : 8, ['#ffffff', '#fff0b3', '#ffd1e0'], e.type.boss ? 200 : 110, 0.4, 4);
    pickups.push({ kind: e.type.xp >= 20 ? 'coin_gold' : 'coin', value: e.type.xp, x: e.x, y: e.y });
    if (player.killHeal) player.hp = Math.min(player.maxHp, player.hp + player.killHeal);
    if (player.necro && Math.random() < player.necro && projectiles.length < 300) {
      const a = Math.random() * Math.PI * 2;
      projectiles.push({
        kind: 'homing', x: e.x, y: e.y, vx: Math.cos(a) * 120, vy: Math.sin(a) * 120 - 60, speed: 300,
        damage: 12 + player.level * 2.5, pierce: 3, radius: 12, sprite: 'wongwi', life: 3, hit: new Set(), src: 'necro', ghost: true,
      });
    }
    if (e.type.split) {
      for (const dx of [-10, 10]) spawnEnemy(ENEMY_TYPES[e.type.split], 0, 0, { x: e.x + dx, y: e.y });
    }
    if (e.elite) {
      player.elites++;
      pickups.push({ kind: 'treasure', x: e.x + 14, y: e.y + 6 });
      pickups.push({ kind: 'jumeoni', value: 15, x: e.x - 14, y: e.y + 6 });
    }
    if (e.type.final && e.stageBoss) {
      progress.wins++;
      player.cleared++;
      progress.clears[diff.id] = true;
      player.wonRun = true;
      saveProgress();
      pickups.push({ kind: 'jumeoni', value: 150, x: e.x, y: e.y - 16 });
      player.victoryAt = elapsed + 1.5;
    } else if (e.stageBoss) {
      player.stageClearAt = elapsed + 1.2;
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
    const [dx, dy] = moveInput();
    player.moving = dx !== 0 || dy !== 0;
    if (player.dashCd > 0) player.dashCd -= dt;
    if (player.dashT > 0) {
      player.dashT -= dt;
      player.x += player.dashVx * dt;
      player.y += player.dashVy * dt;
      player.trail.push({ x: player.x, y: player.y, life: 0.28 });
      if (player.dashT <= 0 && hasArc('gale') && player.dashFrom) {
        const a = Math.atan2(player.y - player.dashFrom.y, player.x - player.dashFrom.x);
        const len = dist(player.x, player.y, player.dashFrom.x, player.dashFrom.y);
        const sx = player.x, sy = player.y;
        player.x = player.dashFrom.x; player.y = player.dashFrom.y;
        dmgSrc = 'arcana';
        beamStrike(a, len + 20, 20, 30 + player.level * 5, 'ice');
        player.x = sx; player.y = sy;
      }
    }
    for (let i = player.trail.length - 1; i >= 0; i--) if ((player.trail[i].life -= dt) <= 0) player.trail.splice(i, 1);
    player.ult = Math.min(ULT_NEED, player.ult + dt * 0.6 * (hasArc('ghostgate') ? 2 : 1));
    if (player.ultAgainAt && elapsed >= player.ultAgainAt) { player.ultAgainAt = 0; ultimate(true); }
    if (player.spinUlt > 0) {
      const before = player.spinUlt;
      player.spinUlt -= dt;
      if (Math.floor(before * 5) !== Math.floor(player.spinUlt * 5)) {
        dmgSrc = 'ult';
        fx.push({ kind: 'spin', x: player.x, y: player.y, r: 180, life: 0.25, max: 0.25 });
        ringBlast(player.x, player.y, 180, (40 + player.level * 7) * player.ultMul * 0.45, 24, 'none');
      }
    }
    if (hasArc('meteor') && (player.meteorT -= dt) <= 0) {
      player.meteorT = 8;
      const targets = shuffled(enemies.filter((e) => !e.type.prop && Math.abs(e.x - player.x) < viewW / 2 && Math.abs(e.y - player.y) < viewH / 2)).slice(0, 8);
      for (const e of targets) {
        const ex = e.x, ey = e.y;
        pendingProcs.push(() => {
          fx.push({ kind: 'beam', x: ex, y: ey - 240, a: Math.PI / 2, len: 240, w: 7, life: 0.3, max: 0.3, tint: 'gold' });
          ringBlast(ex, ey, 50, 30 + player.level * 5, 12, 'gold');
        });
      }
    }
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
    if (player.atk > 0) player.atk -= dt;
    if (player.flameTrail && player.moving && (player.trailCd -= dt) <= 0 && zones.length < 80) {
      player.trailCd = 0.22;
      zones.push({ x: player.x, y: player.y + player.radius * 0.6, r: 26 * player.area, damage: 5 + player.level * 1.2, life: 1.6, tick: 0, seed: Math.random() * 6, tint: 'fire', hold: 0.05, src: 'phoenix' });
    }
    if (player.atkCd > 0) player.atkCd -= dt;
    if (shake > 0) shake = Math.max(0, shake - dt * 30);
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
      if (e.hurt > 0) e.hurt -= dt;
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
      if (d < e.type.radius + player.radius * 0.8 && e.contactCd <= 0 && player.invuln <= 0 && player.dodge && Math.random() < player.dodge) {
        e.contactCd = 0.6;
        player.invuln = 0.25;
        e.x -= (dx / d) * 18;
        e.y -= (dy / d) * 18;
        addFloatText(player.x, player.y - player.radius - 6, '흘림!', '#f0b050');
        continue;
      }
      if (d < e.type.radius + player.radius * 0.8 && e.contactCd <= 0 && player.invuln <= 0) {
        const hurt = Math.max(1, Math.round(e.damage * player.armor));
        player.hp -= hurt;
        player.invuln = 0.5;
        shake = Math.max(shake, 4);
        e.contactCd = 0.6;
        addFloatText(player.x, player.y - player.radius - 6, `-${hurt}`, '#e0503f');
        if (player.hp <= 0 && player.revives > 0) {
          player.revives--;
          player.hp = player.maxHp * 0.5;
          player.invuln = 2.5;
          player.glow = 1.5;
          flash = 0.5;
          ringBlast(player.x, player.y, 260, 40, 60, 'gold');
          if (player.phoenix) {
            player.phoenix = false;
            player.hp = player.maxHp;
            dmgSrc = 'item';
            ringBlast(player.x, player.y, 420, 300 + player.level * 20, 80, 'blood');
            burst(player.x, player.y, 60, ['#ff7828', '#ffd060', '#ffffff', '#e0302a'], 360, 1.2, 6, true);
            showBanner('불사조 강림!', '', '불꽃 속에서 HP 전부 회복하며 되살아났어요');
          } else showBanner('환생!', '', 'HP 절반으로 되살아났어요');
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
      if (p.src && Math.random() < (p.evo ? 0.7 : 0.3)) {
        const st = sectStyle(p.src);
        if (st) flair(st, p.x, p.y, 1, 30, p.evo ? 0.6 : 0.45, p.evo ? 4 : 3);
      }
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
      shake = 12;
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
      const n = (r > 0.94 ? 5 : r > 0.72 ? 3 : 1) + player.bonusGift;
      for (let k = n; k >= 1; k--) modalQueue.unshift({ type: 'chest', n: k, of: n });
      addGold(10 * n);
      burst(player.x, player.y, 20, ['#ffe066', '#ffffff', '#ffc2dc'], 200, 0.6, 4, true);
    } else {
      gainXp(it.value);
      if (hasArc('diamond')) {
        player.hp = Math.min(player.maxHp, player.hp + 0.4);
        player.invuln = Math.max(player.invuln, 0.12);
      }
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
      if (p.fall) { p.vy += p.fall * dt * 3; p.vx += Math.sin(p.life * 6 + p.rot) * 30 * dt; }
      if (p.spin) p.rot += p.spin * dt;
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
      const fxBefore = fx.length;
      dmgSrc = id;
      WEAPONS[id].update(w, dt);
      [projectiles, shells, zones, mines].forEach((arr, k) => { for (let i = before[k]; i < arr.length; i++) arr[i].src ??= id; });
      if (w.evolved) {
        const ev = evoTheme(id);
        for (const arr of [projectiles, shells, zones, mines]) for (const it of arr) if (it.src === id && !it.evo) { it.evo = ev; if (it.rgb) it.rgb = ev.rgb; }
        for (let i = fxBefore; i < fx.length; i++) fx[i].evo ??= ev;
      }
      if (fx.slice(fxBefore).some((f) => f.kind !== 'spark' && f.kind !== 'die' && f.kind !== 'bloom') || before.some((n, k) => [projectiles, shells, zones, mines][k].length > n)) {
        triggerAttack(projectiles.length > before[0] ? projectiles[projectiles.length - 1] : null);
        const st = sectStyle(id);
        if (st && (w.flairCd = (w.flairCd || 0)) <= 0) {
          castFlair(st);
          if (w.evolved) flair(st, player.x, player.y - 10, 10, 220, 0.9, 6);
          w.flairCd = 0.35;
        }
      }
      if (w.flairCd > 0) w.flairCd -= dt;
    }
    dmgSrc = 'item';
    runProcs();
    updateProjectiles(dt);
    runProcs();
    updateShellsAndZones(dt);
    runProcs();
    updatePickups(dt);
    updateEffects(dt);
    if ((achvTimer -= dt) <= 0) { achvTimer = 0.5; checkAchievements(); checkRealm(); checkQuests(); }
    if (player.victoryAt && elapsed >= player.victoryAt && !modalQueue.length) { player.victoryAt = 0; progress.bestStage = Math.max(progress.bestStage, STAGES.length); saveProgress(); victory(); return; }
    if (player.stageClearAt && elapsed >= player.stageClearAt && !modalQueue.length) { player.stageClearAt = 0; stageClear(); }
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
    const st = curStage();
    ui.timer.textContent = fmtTime(st.endless ? elapsed : stageTime);
    ui.stageInfo.textContent = `[${diff.name}] ` + (st.endless ? st.name : stageBossOut ? `${st.name.split(' · ')[0]} · 보스전!` : `${st.name} · 보스까지 ${fmtTime(Math.max(0, STAGE_LEN - stageTime))}`);
    const next = REALMS[player.realm + 1];
    ui.evoHint.textContent = `${REALMS[player.realm].name} · ${rankOf(player.realm)}${next ? ` (다음 경지 ${cultivation()}/${next.need})` : ''}`;
    const dashP = player.dashCd > 0 ? 1 - player.dashCd / (DASH_CD * (hasArc('gale') ? 0.5 : 1)) : 1;
    ui.dashBtn.style.setProperty('--p', dashP);
    ui.dashBtn.classList.toggle('ready', dashP >= 1);
    ui.ultBtn.style.setProperty('--p', player.ult / ULT_NEED);
    ui.ultBtn.classList.toggle('ready', player.ult >= ULT_NEED);
    const row = Object.entries(player.weapons).map(([id, w]) => `${weaponIcon(id)}${w.evolved ? '★' : w.level}`).join(' ');
    if (row !== ui.weaponRow.dataset.row) {
      ui.weaponRow.dataset.row = row;
      richText(ui.weaponRow, row);
    }
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
      if (z.tint === 'ult') {
        const k = clamp(z.life / 0.6, 0, 1);
        ctx.save();
        ctx.translate(z.x, z.y);
        ctx.rotate(anim * 1.5);
        ctx.fillStyle = `rgba(${z.rgb}, ${0.14 * k})`;
        ctx.strokeStyle = `rgba(${z.rgb}, ${0.8 * k})`;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 0, z.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i <= 5; i++) {
          const p = (i * 2 * Math.PI * 2) / 5;
          ctx[i ? 'lineTo' : 'moveTo'](Math.cos(p) * z.r * 0.8, Math.sin(p) * z.r * 0.8);
        }
        ctx.stroke();
        ctx.restore();
        continue;
      }
      if (z.tint === 'fire') {
        const k = clamp(z.life / 1.6, 0, 1);
        for (let i = 0; i < 3; i++) {
          const ox = Math.sin(z.seed + i * 2 + anim * 6) * z.r * 0.3;
          ctx.fillStyle = i === 2 ? `rgba(255, 220, 120, ${0.5 * k})` : `rgba(255, ${90 + i * 50}, 40, ${0.35 * k})`;
          ctx.beginPath();
          ctx.ellipse(z.x + ox, z.y - i * 5 * k, z.r * (0.9 - i * 0.25) * k, z.r * (0.55 - i * 0.12) * k, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        continue;
      }
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

  // Awakened versions of the basic effect shapes (rings, beams, slashes, bolts...).
  function drawEvoFx(f, a) {
    const rgb = f.evo.rgb;
    ctx.save();
    if (f.kind === 'ring') {
      if (f.color === 'none' && !f.r) { ctx.restore(); return true; }
      const r = f.r * (1 - a * 0.5);
      ctx.fillStyle = `rgba(${rgb}, ${0.14 * a})`;
      ctx.beginPath();
      ctx.arc(f.x, f.y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = `rgba(${rgb}, ${a})`;
      ctx.lineWidth = 9 * a + 3;
      ctx.stroke();
      ctx.strokeStyle = `rgba(255, 255, 255, ${a})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(f.x, f.y, r * 0.9, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = `rgba(42, 34, 36, ${0.7 * a})`;
      ctx.lineWidth = 3;
      for (let i = 0; i < 16; i++) {
        const ang = (i / 16) * Math.PI * 2 + (1 - a) * 2;
        ctx.beginPath();
        ctx.moveTo(f.x + Math.cos(ang) * r * 0.78, f.y + Math.sin(ang) * r * 0.78);
        ctx.lineTo(f.x + Math.cos(ang) * r * 1.12, f.y + Math.sin(ang) * r * 1.12);
        ctx.stroke();
      }
    } else if (f.kind === 'beam') {
      ctx.translate(f.x, f.y);
      ctx.rotate(f.a);
      ctx.globalAlpha = a;
      ctx.fillStyle = `rgba(${rgb}, 0.3)`;
      ctx.fillRect(0, -f.w * 2.4, f.len, f.w * 4.8);
      ctx.fillStyle = `rgba(${rgb}, 0.9)`;
      ctx.fillRect(0, -f.w * 1.2, f.len, f.w * 2.4);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, -f.w * 0.45, f.len, f.w * 0.9);
      ctx.strokeStyle = `rgba(${rgb}, 1)`;
      ctx.lineWidth = 2;
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(0, side * f.w * 1.6);
        for (let x = 20; x <= f.len; x += 20) ctx.lineTo(x, side * f.w * (1.4 + Math.sin(x * 0.37 + f.a * 9 + anim * 30) * 0.9));
        ctx.stroke();
      }
      ctx.fillStyle = `rgba(${rgb}, 0.8)`;
      ctx.beginPath();
      ctx.arc(f.len, 0, f.w * 2.6, 0, Math.PI * 2);
      ctx.fill();
    } else if (f.kind === 'slash') {
      const lo = f.dir > 0 ? -1.4 : Math.PI - 1.4;
      crescent(f.x, f.y, f.range * 1.05, lo, lo + 2.8, 1, rgb, a, 0.55);
      crescent(f.x, f.y, f.range * 0.7, lo + 0.3, lo + 2.5, 1, rgb, a * 0.6, 0.35);
    } else if (f.kind === 'spin') {
      const st = (1 - a) * Math.PI * 4;
      crescent(f.x, f.y, f.r, st, st + Math.PI * 1.9, 1, rgb, a, 0.4);
    } else if (f.kind === 'arc') {
      const t = 1 - a;
      const sweep = f.half * 2 * (1 - (1 - Math.min(1, t * 1.6)) ** 3);
      crescent(f.x, f.y - 4, f.r * 1.08, f.a - f.half, f.a - f.half + sweep, 1, rgb, a, 0.6);
      ctx.strokeStyle = `rgba(${rgb}, ${a * 0.8})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(f.x, f.y - 4, f.r * 1.2, f.a - f.half, f.a - f.half + sweep);
      ctx.stroke();
    } else if (f.kind === 'bolt') {
      for (const [w, col] of [[12, `rgba(${rgb}, ${0.35 * a})`], [5, `rgba(${rgb}, ${a})`], [2, `rgba(255, 255, 255, ${a})`]]) {
        ctx.strokeStyle = col;
        ctx.lineWidth = w;
        ctx.beginPath();
        let x = f.x, y = f.y - 200;
        ctx.moveTo(x, y);
        for (let i = 1; i <= 8; i++) {
          x = f.x + (i < 8 ? Math.sin(f.seed + i * 2.3) * 18 : 0);
          y = f.y - 200 + (200 * i) / 8;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.fillStyle = `rgba(${rgb}, ${0.5 * a})`;
      ctx.beginPath();
      ctx.arc(f.x, f.y, 30 * (1.4 - a * 0.4), 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.restore();
      return false;
    }
    ctx.restore();
    return true;
  }

  function drawFx() {
    for (const f of fx) {
      const a = clamp(f.life / f.max, 0, 1);
      if (f.kind === 'die') {
        const k = 1 - a;
        drawSprite(f.sprite, f.x, f.y - k * 10, { sx: f.sc * (1 + 0.5 * k), sy: f.sc * (1 - 0.7 * k), groundR: f.r, flash: k < 0.4, alpha: f.alpha * a });
        continue;
      }
      if (f.kind === 'sigil') { drawSigil(f); continue; }
      if (f.kind === 'ultwave') {
        const t = 1 - a;
        const R = (f.small ? 110 : Math.hypot(viewW, viewH) * 0.55) * (0.15 + t * 0.85);
        ctx.strokeStyle = `rgba(${f.rgb}, ${a})`;
        ctx.lineWidth = (f.small ? 6 : 18) * a + 2;
        ctx.beginPath();
        ctx.arc(f.x, f.y, R, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = `rgba(42, 34, 36, ${0.6 * a})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(f.x, f.y, R * 0.85, 0, Math.PI * 2);
        ctx.stroke();
        continue;
      }
      if (f.kind === 'bigpalm') {
        const t = 1 - a;
        drawSprite('palm', f.x, f.y - 140 * (1 - Math.min(1, t * 3)), { sx: 3.2, sy: 3.2, alpha: Math.min(1, a * 2) });
        continue;
      }
      if (f.evo && drawEvoFx(f, a)) continue;
      if (f.kind === 'bloom') {
        const rr = f.r * (1.4 - a * 0.4);
        ctx.fillStyle = `rgba(${f.glow}, ${0.35 * a})`;
        ctx.beginPath();
        ctx.arc(f.x, f.y, rr, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(255, 255, 255, ${0.85 * a})`;
        ctx.beginPath();
        ctx.arc(f.x, f.y, rr * 0.4, 0, Math.PI * 2);
        ctx.fill();
        continue;
      }
      if (f.kind === 'arc') {
        const t = 1 - a;
        const sweep = f.half * 2 * (1 - (1 - Math.min(1, t * 1.6)) ** 3);
        ctx.save();
        crescent(f.x, f.y - 4, f.r, f.a - f.half, f.a - f.half + sweep, 1, f.rgb, a, 0.42);
        ctx.restore();
        continue;
      }
      if (f.kind === 'spark') {
        const s = (f.crit ? 15 : 10) * (0.6 + (1 - a) * 0.8);
        ctx.save();
        ctx.translate(f.x, f.y);
        ctx.rotate(f.rot);
        ctx.fillStyle = f.crit ? `rgba(255, 110, 70, ${a})` : `rgba(255, 255, 255, ${a})`;
        ctx.fillRect(-s, -1.5, s * 2, 3);
        ctx.fillRect(-1.5, -s, 3, s * 2);
        ctx.fillStyle = `rgba(255, 230, 140, ${a})`;
        ctx.fillRect(-3, -3, 6, 6);
        ctx.restore();
        continue;
      }
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
    drawShadow(player.x, player.y + r * 0.9, r * 1.2);
    const grow = 1 + player.realm * 0.035;
    const speed = player.moving ? 14 : 4;
    const amp = player.moving ? 0.07 : 0.035;
    const b = Math.sin(anim * speed);
    const hop = player.moving ? Math.abs(Math.sin(anim * speed / 2)) * 3 : 0;
    const blink = player.invuln > 0 && player.glow <= 0 && Math.floor(anim * 20) % 2 === 0;
    // Attack motion: wind up, lunge toward the target, then recover.
    const at = player.atk > 0 ? 1 - player.atk / ATK_TIME : 0;
    const punch = player.atk > 0 ? Math.sin(at * Math.PI) : 0;
    const dx = Math.cos(player.atkDir), dy = Math.sin(player.atkDir);
    const side = dx >= 0 ? 1 : -1;
    const [style, rgb] = MOTION[player.hero] || ['slash', '255, 255, 255'];
    for (const t of player.trail) drawSprite(player.hero, t.x, t.y - ((SPRITES[player.hero]?.size || 48) / 2 - r), { groundR: r + (SPRITES[player.hero]?.size || 48) / 2 - r, alpha: t.life * 1.6, sx: grow, sy: grow, flash: true });
    const reach = style === 'cast' ? 3 : 9;
    const lx = player.x + dx * punch * reach, ly = player.y + dy * punch * reach * 0.6 - hop;
    // 64px heroes stand with their feet on the shadow
    const lift = (SPRITES[player.hero]?.size || 48) / 2 - r;
    const opts = (k, alpha) => ({ flip: false, rot: side * punch * (style === 'cast' ? 0.03 : 0.1) * k + (player.drunk ? Math.sin(anim * 2.6) * 0.14 : 0), sx: grow * (1 - amp * b + 0.1 * punch * k), sy: grow * (1 + amp * b - 0.08 * punch * k), groundR: r + lift, alpha });
    if (player.atk > 0 && style !== 'cast') {
      for (const k of [0.35, 0.65]) drawSprite(player.hero, player.x + dx * punch * reach * k, player.y + dy * punch * reach * 0.6 * k - hop - lift, opts(k, 0.12 + k * 0.1));
    }
    if (player.atk > 0 && style === 'cast') drawMagicCircle(at, rgb);
    drawSprite(player.hero, lx, ly - lift, opts(1, blink ? 0.45 : 1));
    if (player.atk > 0) drawStrike(style, at, side, rgb);
  }

  // Crescent blade trail: thick at the leading edge, coloured rim, white core.
  function crescent(cx, cy, R, lo, hi, side, rgb, alpha, thick = 0.4) {
    const steps = 20;
    const outer = [], inner = [];
    for (let i = 0; i <= steps; i++) {
      const u = i / steps;
      const ang = lo + (hi - lo) * u;
      const lead = side > 0 ? u : 1 - u;
      outer.push([cx + Math.cos(ang) * R, cy + Math.sin(ang) * R]);
      inner.push([cx + Math.cos(ang) * R * (1 - thick * lead), cy + Math.sin(ang) * R * (1 - thick * lead)]);
    }
    ctx.beginPath();
    outer.forEach(([x, y], i) => ctx[i ? 'lineTo' : 'moveTo'](x, y));
    for (let i = inner.length - 1; i >= 0; i--) ctx.lineTo(inner[i][0], inner[i][1]);
    ctx.closePath();
    const g = ctx.createRadialGradient(cx, cy, R * (1 - thick), cx, cy, R);
    g.addColorStop(0, `rgba(${rgb}, ${0.15 * alpha})`);
    g.addColorStop(0.55, `rgba(${rgb}, ${0.85 * alpha})`);
    g.addColorStop(1, `rgba(255, 255, 255, ${alpha})`);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = `rgba(42, 34, 36, ${0.7 * alpha})`;
    ctx.stroke();
  }

  function drawMagicCircle(t, rgb) {
    const a = Math.sin(t * Math.PI);
    const R = player.radius * (1.8 + t * 0.8);
    const cx = player.x, cy = player.y + player.radius * 0.8;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(1, 0.45);
    ctx.rotate(anim * 3);
    ctx.strokeStyle = `rgba(${rgb}, ${0.9 * a})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, R, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, R * 0.7, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const p = (i * 2 * Math.PI * 2) / 6;
      ctx[i ? 'lineTo' : 'moveTo'](Math.cos(p) * R * 0.7, Math.sin(p) * R * 0.7);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.fillStyle = `rgba(${rgb}, ${0.18 * a})`;
    ctx.beginPath();
    ctx.arc(0, 0, R, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawStrike(style, t, side, rgb) {
    const ease = 1 - (1 - t) ** 3;
    const alpha = t < 0.65 ? 1 : (1 - t) / 0.35;
    const dir = player.atkDir;
    const cx = player.x, cy = player.y - 6;
    ctx.save();
    if (style === 'slash' || style === 'twin') {
      const R = player.radius * 3;
      const sweeps = style === 'twin' ? [side, -side] : [side];
      for (const sd of sweeps) {
        const a0 = dir - sd * 1.5;
        const a1 = a0 + sd * 3 * ease;
        crescent(cx, cy, R, Math.min(a0, a1), Math.max(a0, a1), sd, rgb, alpha);
        crescent(cx, cy, R * 0.72, Math.min(a0, a1 - sd * 0.5), Math.max(a0, a1 - sd * 0.5), sd, rgb, alpha * 0.5, 0.25);
        // blade tip sparkle
        const tx = cx + Math.cos(a1) * R, ty = cy + Math.sin(a1) * R;
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fillRect(tx - 6, ty - 1, 12, 2);
        ctx.fillRect(tx - 1, ty - 6, 2, 12);
      }
    } else if (style === 'palm') {
      // a shockwave burst in front of the fist
      const px = cx + Math.cos(dir) * player.radius * (1.4 + ease * 1.2), py = cy + Math.sin(dir) * player.radius * (1.4 + ease * 1.2);
      ctx.strokeStyle = `rgba(${rgb}, ${alpha})`;
      ctx.lineWidth = 4 * (1 - t) + 1;
      ctx.beginPath();
      ctx.arc(px, py, 6 + ease * 26, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.lineWidth = 2;
      for (let i = 0; i < 8; i++) {
        const a = dir + (i - 3.5) * 0.28;
        const r0 = 8 + ease * 14, r1 = r0 + 12 * (1 - t) + 4;
        ctx.beginPath();
        ctx.moveTo(px + Math.cos(a) * r0, py + Math.sin(a) * r0);
        ctx.lineTo(px + Math.cos(a) * r1, py + Math.sin(a) * r1);
        ctx.stroke();
      }
      const g = ctx.createRadialGradient(px, py, 0, px, py, 16);
      g.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
      g.addColorStop(1, `rgba(${rgb}, 0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(px, py, 16, 0, Math.PI * 2);
      ctx.fill();
    } else if (style === 'cast') {
      // a glowing sigil at the raised hand
      const hx = cx + side * 18, hy = cy - 12;
      const R = 7 + ease * 9;
      const g = ctx.createRadialGradient(hx, hy, 0, hx, hy, R * 1.6);
      g.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
      g.addColorStop(0.4, `rgba(${rgb}, ${0.8 * alpha})`);
      g.addColorStop(1, `rgba(${rgb}, 0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(hx, hy, R * 1.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.translate(hx, hy);
      ctx.rotate(anim * 6);
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.lineWidth = 2;
      ctx.strokeRect(-R * 0.6, -R * 0.6, R * 1.2, R * 1.2);
      ctx.rotate(Math.PI / 4);
      ctx.strokeStyle = `rgba(${rgb}, ${alpha})`;
      ctx.strokeRect(-R * 0.6, -R * 0.6, R * 1.2, R * 1.2);
    } else if (style === 'throw') {
      // a quick flick: speed streaks leaving the hand toward the target
      ctx.lineCap = 'round';
      for (let i = -1; i <= 1; i++) {
        const a = dir + i * 0.16;
        const r0 = 12 + ease * 30, r1 = r0 + 22 * (1 - t) + 6;
        ctx.strokeStyle = i ? `rgba(${rgb}, ${alpha * 0.8})` : `rgba(255, 255, 255, ${alpha})`;
        ctx.lineWidth = i ? 2 : 3;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
        ctx.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
        ctx.stroke();
      }
      const a0 = dir - side * 0.9;
      crescent(cx, cy, player.radius * 2, Math.min(a0, a0 + side * 1.8 * ease), Math.max(a0, a0 + side * 1.8 * ease), side, rgb, alpha * 0.7, 0.3);
    } else if (style === 'spin') {
      const R = player.radius * 2.8;
      const a0 = dir - Math.PI;
      crescent(cx, cy, R, a0 + 0, a0 + Math.PI * 2 * ease, 1, rgb, alpha, 0.3);
    }
    ctx.restore();
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
    const hk = e.hurt > 0 && !t.prop ? e.hurt / 0.14 : 0;
    drawSprite(t.sprite, e.x, e.y + lift, { sx: sc * (1 + sq + 0.28 * hk), sy: sc * (1 - sq - 0.22 * hk), rot: hk * 0.18 * Math.sin(e.phase * 7), groundR: r, flash: e.flash > 0, alpha: t.alpha });
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
    const sk = state === 'playing' ? shake : 0;
    const camX = Math.round(player.x - viewW / 2 + (Math.random() - 0.5) * sk);
    const camY = Math.round(player.y - viewH / 2 + (Math.random() - 0.5) * sk);
    ctx.save();
    ctx.translate(-camX, -camY);

    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = bgPattern || '#e9dfc6';
    ctx.fillRect(camX, camY, viewW, viewH);
    if (state !== 'title' && curStage().tint) {
      ctx.fillStyle = curStage().tint;
      ctx.fillRect(camX, camY, viewW, viewH);
    }

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

    const orbEvo = player.weapons.orbit?.evolved;
    for (const pt of orbitPoints()) {
      if (orbEvo) {
        ctx.fillStyle = 'rgba(110, 190, 255, 0.35)';
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 22, 0, Math.PI * 2);
        ctx.fill();
      }
      drawSprite('foxfire', pt.x, pt.y, orbEvo ? { sx: 1.3, sy: 1.3 } : {});
    }
    for (const [id, w] of Object.entries(player.weapons)) if (WEAPONS[id].drawAbove) WEAPONS[id].drawAbove(w);
    for (const p of projectiles) {
      if (p.kind === 'tornado') { drawTornado(p); continue; }
      if (p.kind === 'wave') {
        const a = Math.atan2(p.vy, p.vx);
        const R = p.radius * 1.6;
        ctx.save();
        crescent(p.x - Math.cos(a) * R * 0.6, p.y - Math.sin(a) * R * 0.6, R, a - 1.1, a + 1.1, 1, p.rgb, clamp(p.life / p.max * 2, 0, 1), 0.5);
        ctx.restore();
        continue;
      }
      const rot = p.kind === 'boomerang' ? p.spin : p.kind === 'homing' ? 0 : p.kind === 'petal' ? p.spin + p.life * 8 : Math.atan2(p.vy, p.vx);
      if (p.evo) {
        ctx.fillStyle = `rgba(${p.evo.rgb}, 0.35)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, (p.radius || 10) * 2.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, (p.radius || 10) * 1.1, 0, Math.PI * 2);
        ctx.fill();
        drawSprite(p.sprite, p.x, p.y, { rot, sx: 1.35, sy: 1.35 });
        continue;
      }
      if (p.ghost) { drawSprite(p.sprite, p.x, p.y, { alpha: 0.7, sx: 0.7, sy: 0.7 }); continue; }
      drawSprite(p.sprite, p.x, p.y, { rot });
    }
    drawShells();
    drawFx();

    for (const p of particles) drawParticle(p);
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
      icon.append(iconImg(done ? a.icon : '🔒'));
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
      richText(recipe, known ? comboRecipe(id) : (c.partner ? `[${SECTS[WEAPONS[id].sect]} 오의] ??? + ???` : '??? + ???'));
      const result = document.createElement('span');
      result.className = 'result';
      richText(result, known ? `${c.icon} ${c.name}` : '???');
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
    ui.titleStats.textContent = `최고 ${progress.bestStage >= STAGES.length ? '전 장 돌파' : `${progress.bestStage}장 돌파`} · 업적 ${done}/${ACHIEVEMENTS.length} · 비급 ${seen.size}/${Object.keys(COMBOS).length} · 협객 ${heroes}/${Object.keys(HEROES).length} · 은자 ${progress.gold}냥`;
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
        if (cls === 'icon') d.append(iconImg(text, 'pi big'));
        else d.textContent = text;
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
      const name = WEAPONS[id] ? `${weaponIcon(id)} ${weaponName(id)}` : { necro: '💀 원귀 소환', phoenix: '🔥 불길', ult: `💫 ${ULT_NAMES[player.hero] || '필살기'}`, arcana: '📖 비전서' }[id] || '🧨 아이템';
      const row = document.createElement('div');
      row.className = 'book-row';
      const a = document.createElement('span');
      richText(a, name);
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
      richText(el, `${weaponIcon(id)} ${weaponName(id)} ${w.evolved ? '★' : `Lv.${w.level}`}`);
      return el;
    }), ...[...player.arc].map((id) => {
      const el = document.createElement('span');
      el.className = 'chip arc';
      richText(el, `${ARC_BY_ID[id].icon} ${ARC_BY_ID[id].name}`);
      el.title = ARC_BY_ID[id].desc;
      return el;
    }), ...PASSIVES.filter((u) => player.picks[u.id]).map((u) => {
      const el = document.createElement('span');
      el.className = 'chip passive';
      richText(el, `${u.icon} ${u.title} ${player.picks[u.id]}`);
      return el;
    }));
    ui.pauseDmg.replaceChildren(...damageReport());
    ui.pauseStats.textContent = `[${diff.name}] ${REALMS[player.realm].name} · ${rankOf(player.realm)} · 피해 ×${player.dmgMul.toFixed(2)} · 치명타 ${Math.round(player.crit * 100)}% · 대기시간 ×${player.haste.toFixed(2)} · 받는 피해 ×${player.armor.toFixed(2)} · 은자 ${Math.floor(player.gold)}냥${player.revives ? ` · 환생 ${player.revives}` : ''}`;
    ui.quitBtn.textContent = '로비로 나가기';
    ui.quitBtn.dataset.confirm = '';
  }

  function toLobby() {
    const wasPlaying = state === 'paused';
    bankGold();
    if (wasPlaying) { checkQuests(); gainMastery(false); }
    checkAchievements();
    state = 'title';
    for (const el of [ui.hud, ui.pause, ui.choice, ui.gameover]) el.classList.add('hidden');
    ui.start.classList.remove('hidden');
    buildAchievements();
  }

  function startGame() {
    if (state !== 'title' && state !== 'gameover' && state !== 'victory') return;
    resetGame();
    for (const el of [ui.start, ui.gameover, ui.choice, ui.pause, ui.achv, ui.shop, ui.questScreen]) el.classList.add('hidden');
    ui.hud.classList.remove('hidden');
    updateHud();
    state = 'playing';
    modalQueue.push({ type: 'difficulty' }, { type: 'hero' });
    openNextModal();
  }

  function gameOver(kind = 'dead') {
    const win = kind === true || kind === 'win';
    state = win ? 'victory' : 'gameover';
    const h = HEROES[player.hero];
    if (win) addGold(100);
    bankGold();
    checkQuests();
    const mxp = gainMastery(win);
    ui.gameoverTitle.textContent = win ? '퇴치 완료!' : kind === 'retire' ? '무사 귀환' : '쓰러졌다...';
    ui.continueBtn.classList.toggle('hidden', !win);
    ui.gameoverPortrait.src = spritePath(player.hero);
    ui.gameoverStats.textContent = `[${diff.name}] ${h.name} · ${REALMS[player.realm].name} ${rankOf(player.realm)} · Lv.${player.level} · ${curStage().name.split(' · ')[0]}까지 · ${fmtTime(elapsed)} 버팀 · 요괴 ${kills}마리 퇴치 · 합성 ${player.combos}개 · 은자 ${Math.floor(player.gold)}냥 획득 · 숙련 +${mxp} (Lv.${masteryLevel(player.hero)})`;
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
    enterStage(STAGES.length);
    ui.gameover.classList.add('hidden');
    ui.hud.classList.remove('hidden');
    state = 'playing';
  }

  function togglePause() {
    if (state === 'playing') {
      state = 'paused';
      ui.banner.classList.remove('show');
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
    const overlayOpen = !ui.achv.classList.contains('hidden') || !ui.shop.classList.contains('hidden') || !ui.questScreen.classList.contains('hidden');
    if (e.code === 'Escape' && overlayOpen) {
      ui.achv.classList.add('hidden');
      ui.shop.classList.add('hidden');
      ui.questScreen.classList.add('hidden');
      return;
    }
    if (e.code === 'KeyP' || e.code === 'Escape') togglePause();
    if (state === 'playing' && (e.code === 'Space' || e.code === 'ShiftLeft' || e.code === 'ShiftRight')) { e.preventDefault(); dash(); return; }
    if (state === 'playing' && e.code === 'KeyQ') { ultimate(); return; }
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
  $('quest-btn').addEventListener('click', () => { buildQuests(); ui.questScreen.classList.remove('hidden'); });
  $('quest-close').addEventListener('click', () => ui.questScreen.classList.add('hidden'));
  ui.dashBtn.addEventListener('pointerdown', (e) => { e.stopPropagation(); dash(); });
  ui.ultBtn.addEventListener('pointerdown', (e) => { e.stopPropagation(); ultimate(); });
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
