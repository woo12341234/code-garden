(function () {
  'use strict';

  // ---------- Canvas / DOM ----------
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  const hpBar = document.getElementById('hp-bar');
  const hpText = document.getElementById('hp-text');
  const xpBar = document.getElementById('xp-bar');
  const timerEl = document.getElementById('timer');
  const levelEl = document.getElementById('level');
  const killsEl = document.getElementById('kills');
  const startScreen = document.getElementById('start-screen');
  const levelupScreen = document.getElementById('levelup-screen');
  const gameoverScreen = document.getElementById('gameover-screen');
  const upgradeChoicesEl = document.getElementById('upgrade-choices');
  const gameoverStatsEl = document.getElementById('gameover-stats');

  // ---------- Asset loading (image if present, else placeholder) ----------
  function loadImage(path) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = path;
    });
  }

  const SPRITE_DEFS = {
    player: { path: 'assets/player.png', color: '#4dd2ff', emoji: '🟦' },
    baby: { path: 'assets/baby.png', color: '#ffe14d', emoji: '🥚' },
    rookie: { path: 'assets/rookie.png', color: '#ff8a4d', emoji: '🦎' },
    champion: { path: 'assets/champion.png', color: '#c04dff', emoji: '🐲' },
    bolt: { path: 'assets/bolt.png', color: '#ff4d4d', emoji: '🔥' },
    orbit: { path: 'assets/orbit.png', color: '#4dffb8', emoji: '🌀' },
    gem: { path: 'assets/gem.png', color: '#4dffb8', emoji: '💎' },
  };
  const SPRITES = {};

  async function preloadAssets() {
    const entries = Object.entries(SPRITE_DEFS);
    await Promise.all(entries.map(async ([key, def]) => {
      const img = await loadImage(def.path);
      SPRITES[key] = { img, color: def.color, emoji: def.emoji };
    }));
  }

  function drawSprite(key, x, y, radius, facing) {
    const s = SPRITES[key];
    if (s && s.img) {
      const size = radius * 2.4;
      ctx.save();
      ctx.translate(x, y);
      if (facing === -1) ctx.scale(-1, 1);
      ctx.drawImage(s.img, -size / 2, -size / 2, size, size);
      ctx.restore();
    } else {
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = (s && s.color) || '#fff';
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.4)';
      ctx.lineWidth = 2;
      ctx.stroke();
      if (s && s.emoji) {
        ctx.font = `${Math.floor(radius * 1.4)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(s.emoji, x, y + 1);
      }
    }
  }

  // ---------- Enemy type definitions (Digimon-flavored, placeholder art) ----------
  const ENEMY_TYPES = {
    baby: { name: 'Baby-type', sprite: 'baby', hp: 12, speed: 90, damage: 6, radius: 14, xp: 3, weight: 1 },
    rookie: { name: 'Rookie-type', sprite: 'rookie', hp: 32, speed: 65, damage: 10, radius: 18, xp: 6, weight: 1, minTime: 30 },
    champion: { name: 'Champion-type', sprite: 'champion', hp: 260, speed: 45, damage: 22, radius: 30, xp: 40, weight: 0, minTime: 60, isElite: true },
  };

  // ---------- Utility ----------
  function dist(ax, ay, bx, by) { return Math.hypot(ax - bx, ay - by); }
  function rand(min, max) { return min + Math.random() * (max - min); }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  // ---------- Input ----------
  const keys = new Set();
  window.addEventListener('keydown', (e) => keys.add(e.key.toLowerCase()));
  window.addEventListener('keyup', (e) => keys.delete(e.key.toLowerCase()));

  // ---------- Weapon upgrade pool ----------
  const UPGRADE_POOL = [
    {
      id: 'bolt_level', title: 'Pepper Breath 강화', icon: '🔥',
      desc: '주 무기 데미지 및 투사체 증가',
      apply(player) { const w = player.weapons.bolt; w.level++; w.damage += 4; if (w.level % 2 === 0) w.count++; },
    },
    {
      id: 'orbit_unlock_or_level', title: 'Blue Blaster', icon: '🌀',
      desc: '주변을 도는 실드 무기 (레벨업 시 강화)',
      apply(player) {
        if (!player.weapons.orbit) {
          player.weapons.orbit = { level: 1, damage: 8, radius: 90, count: 1, angle: 0, hitCooldown: new Map() };
        } else {
          const w = player.weapons.orbit;
          w.level++; w.damage += 4;
          if (w.level % 2 === 0) w.count++;
        }
      },
    },
    {
      id: 'max_hp', title: '최대 체력 증가', icon: '❤️',
      desc: '최대 HP +20, 즉시 회복',
      apply(player) { player.maxHp += 20; player.hp = Math.min(player.maxHp, player.hp + 20); },
    },
    {
      id: 'speed', title: '이동 속도 증가', icon: '👟',
      desc: '이동 속도 +12%',
      apply(player) { player.speed *= 1.12; },
    },
    {
      id: 'pickup', title: '자석 범위 증가', icon: '🧲',
      desc: 'XP 획득 범위 +30%',
      apply(player) { player.pickupRadius *= 1.3; },
    },
    {
      id: 'regen', title: '재생력', icon: '💚',
      desc: '초당 체력 회복 +1',
      apply(player) { player.regen += 1; },
    },
  ];

  // ---------- Game state ----------
  let state = 'start'; // start | playing | levelup | gameover
  let elapsed = 0;
  let kills = 0;
  let lastSpawn = 0;
  let lastChampion = 0;

  let player, enemies, projectiles, gems, floatTexts;

  function resetGame() {
    player = {
      x: 0, y: 0, radius: 18, speed: 200,
      maxHp: 100, hp: 100, regen: 0,
      pickupRadius: 70,
      level: 1, xp: 0, xpToNext: 10,
      facing: 1,
      invuln: 0,
      weapons: {
        bolt: { level: 1, damage: 10, count: 1, pierce: 1, cooldown: 0.7, timer: 0, speed: 420 },
      },
    };
    enemies = [];
    projectiles = [];
    gems = [];
    floatTexts = [];
    elapsed = 0;
    kills = 0;
    lastSpawn = 0;
    lastChampion = 0;
  }

  // ---------- Spawning ----------
  function pickEnemyType() {
    const t = elapsed;
    const pool = Object.values(ENEMY_TYPES).filter(e => !e.isElite && (e.minTime === undefined || t >= e.minTime));
    const totalWeight = pool.reduce((s, e) => s + e.weight, 0);
    let r = Math.random() * totalWeight;
    for (const e of pool) {
      r -= e.weight;
      if (r <= 0) return e;
    }
    return pool[0];
  }

  function spawnEnemy(typeDef) {
    const angle = Math.random() * Math.PI * 2;
    const dist0 = Math.max(canvas.width, canvas.height) / 2 + 120;
    const x = player.x + Math.cos(angle) * dist0;
    const y = player.y + Math.sin(angle) * dist0;
    const hpMult = 1 + elapsed / 90;
    enemies.push({
      x, y, type: typeDef,
      hp: typeDef.hp * hpMult,
      maxHp: typeDef.hp * hpMult,
      contactCooldown: 0,
    });
  }

  function updateSpawner(dt) {
    lastSpawn += dt;
    const interval = clamp(1.1 - elapsed / 120, 0.18, 1.1);
    if (lastSpawn >= interval) {
      lastSpawn = 0;
      const count = 1 + Math.floor(elapsed / 45);
      for (let i = 0; i < count; i++) spawnEnemy(pickEnemyType());
    }
    lastChampion += dt;
    if (elapsed >= ENEMY_TYPES.champion.minTime && lastChampion >= 45) {
      lastChampion = 0;
      spawnEnemy(ENEMY_TYPES.champion);
    }
  }

  // ---------- Combat ----------
  function fireBolt(dt) {
    const w = player.weapons.bolt;
    w.timer -= dt;
    if (w.timer > 0) return;
    let nearest = null, nearestD = Infinity;
    for (const e of enemies) {
      const d = dist(player.x, player.y, e.x, e.y);
      if (d < nearestD) { nearestD = d; nearest = e; }
    }
    if (!nearest) return;
    w.timer = w.cooldown;
    const baseAngle = Math.atan2(nearest.y - player.y, nearest.x - player.x);
    const spread = 0.28;
    for (let i = 0; i < w.count; i++) {
      const off = (i - (w.count - 1) / 2) * spread;
      const angle = baseAngle + off;
      projectiles.push({
        x: player.x, y: player.y,
        vx: Math.cos(angle) * w.speed, vy: Math.sin(angle) * w.speed,
        damage: w.damage, pierce: w.pierce, radius: 8, life: 1.6,
      });
    }
  }

  function updateOrbit(dt) {
    const w = player.weapons.orbit;
    if (!w) return;
    w.angle += dt * 2.4;
    for (const [id, t] of w.hitCooldown) {
      if (t - dt <= 0) w.hitCooldown.delete(id); else w.hitCooldown.set(id, t - dt);
    }
  }

  function orbitPositions() {
    const w = player.weapons.orbit;
    if (!w) return [];
    const pts = [];
    for (let i = 0; i < w.count; i++) {
      const a = w.angle + (i / w.count) * Math.PI * 2;
      pts.push({ x: player.x + Math.cos(a) * w.radius, y: player.y + Math.sin(a) * w.radius });
    }
    return pts;
  }

  function addFloatText(x, y, text, color) {
    floatTexts.push({ x, y, text, color, life: 0.7 });
  }

  function gainXp(amount) {
    player.xp += amount;
    while (player.xp >= player.xpToNext) {
      player.xp -= player.xpToNext;
      player.level++;
      player.xpToNext = Math.floor(player.xpToNext * 1.25 + 6);
      triggerLevelUp();
    }
  }

  let pendingUpgrades = 0;
  function triggerLevelUp() {
    pendingUpgrades++;
  }

  function showLevelUpScreen() {
    state = 'levelup';
    levelupScreen.classList.remove('hidden');
    upgradeChoicesEl.innerHTML = '';
    const choices = [...UPGRADE_POOL].sort(() => Math.random() - 0.5).slice(0, 3);
    for (const choice of choices) {
      const card = document.createElement('div');
      card.className = 'upgrade-card';
      card.innerHTML = `<div class="icon">${choice.icon}</div><div class="title">${choice.title}</div><div class="desc">${choice.desc}</div>`;
      card.onclick = () => {
        choice.apply(player);
        pendingUpgrades--;
        levelupScreen.classList.add('hidden');
        if (pendingUpgrades > 0) {
          showLevelUpScreen();
        } else {
          state = 'playing';
        }
      };
      upgradeChoicesEl.appendChild(card);
    }
  }

  function killEnemy(e, idx) {
    kills++;
    gems.push({ x: e.x, y: e.y, value: e.type.xp, radius: 6 });
    addFloatText(e.x, e.y, `+${e.type.xp}xp`, '#4dffb8');
    enemies.splice(idx, 1);
  }

  // ---------- Update ----------
  function update(dt) {
    elapsed += dt;

    // movement
    let dx = 0, dy = 0;
    if (keys.has('w') || keys.has('arrowup')) dy -= 1;
    if (keys.has('s') || keys.has('arrowdown')) dy += 1;
    if (keys.has('a') || keys.has('arrowleft')) dx -= 1;
    if (keys.has('d') || keys.has('arrowright')) dx += 1;
    if (dx !== 0 || dy !== 0) {
      const len = Math.hypot(dx, dy);
      dx /= len; dy /= len;
      player.x += dx * player.speed * dt;
      player.y += dy * player.speed * dt;
      if (dx !== 0) player.facing = dx > 0 ? 1 : -1;
    }

    if (player.regen > 0) player.hp = Math.min(player.maxHp, player.hp + player.regen * dt);
    if (player.invuln > 0) player.invuln -= dt;

    updateSpawner(dt);
    fireBolt(dt);
    updateOrbit(dt);

    // enemies move toward player
    for (const e of enemies) {
      const d = dist(player.x, player.y, e.x, e.y) || 1;
      const spd = e.type.speed;
      e.x += ((player.x - e.x) / d) * spd * dt;
      e.y += ((player.y - e.y) / d) * spd * dt;
      if (e.contactCooldown > 0) e.contactCooldown -= dt;

      const hitR = e.type.radius + player.radius;
      if (d < hitR && e.contactCooldown <= 0 && player.invuln <= 0) {
        player.hp -= e.type.damage;
        e.contactCooldown = 0.6;
        player.invuln = 0.4;
        if (player.hp <= 0) { player.hp = 0; triggerGameOver(); return; }
      }
    }

    // projectiles
    for (let i = projectiles.length - 1; i >= 0; i--) {
      const p = projectiles[i];
      p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt;
      if (p.life <= 0) { projectiles.splice(i, 1); continue; }
      for (let j = enemies.length - 1; j >= 0; j--) {
        const e = enemies[j];
        if (dist(p.x, p.y, e.x, e.y) < p.radius + e.type.radius) {
          e.hp -= p.damage;
          addFloatText(e.x, e.y - 10, p.damage.toFixed(0), '#ffcc4d');
          p.pierce--;
          if (e.hp <= 0) killEnemy(e, j);
          if (p.pierce <= 0) { projectiles.splice(i, 1); break; }
        }
      }
    }

    // orbit weapon collisions
    const orbitPts = orbitPositions();
    if (orbitPts.length) {
      const w = player.weapons.orbit;
      for (const pt of orbitPts) {
        for (let j = enemies.length - 1; j >= 0; j--) {
          const e = enemies[j];
          if (dist(pt.x, pt.y, e.x, e.y) < 14 + e.type.radius) {
            const key = e;
            if (!w.hitCooldown.has(key)) {
              e.hp -= w.damage;
              addFloatText(e.x, e.y - 10, w.damage.toFixed(0), '#4dffb8');
              w.hitCooldown.set(key, 0.3);
              if (e.hp <= 0) killEnemy(e, j);
            }
          }
        }
      }
    }

    // gems
    for (let i = gems.length - 1; i >= 0; i--) {
      const g = gems[i];
      const d = dist(player.x, player.y, g.x, g.y);
      if (d < player.pickupRadius) {
        const speed = 500;
        const dd = d || 1;
        g.x += ((player.x - g.x) / dd) * speed * dt;
        g.y += ((player.y - g.y) / dd) * speed * dt;
      }
      if (d < player.radius + 4) {
        gainXp(g.value);
        gems.splice(i, 1);
      }
    }

    for (let i = floatTexts.length - 1; i >= 0; i--) {
      const f = floatTexts[i];
      f.y -= 30 * dt; f.life -= dt;
      if (f.life <= 0) floatTexts.splice(i, 1);
    }

    if (pendingUpgrades > 0) showLevelUpScreen();

    updateHud();
  }

  function updateHud() {
    hpBar.style.width = `${clamp((player.hp / player.maxHp) * 100, 0, 100)}%`;
    hpText.textContent = `${Math.ceil(player.hp)} / ${player.maxHp}`;
    xpBar.style.width = `${clamp((player.xp / player.xpToNext) * 100, 0, 100)}%`;
    levelEl.textContent = `Lv.${player.level}`;
    killsEl.textContent = `킬 ${kills}`;
    const m = Math.floor(elapsed / 60).toString().padStart(2, '0');
    const s = Math.floor(elapsed % 60).toString().padStart(2, '0');
    timerEl.textContent = `${m}:${s}`;
  }

  function triggerGameOver() {
    state = 'gameover';
    gameoverScreen.classList.remove('hidden');
    const m = Math.floor(elapsed / 60).toString().padStart(2, '0');
    const s = Math.floor(elapsed % 60).toString().padStart(2, '0');
    gameoverStatsEl.textContent = `생존 시간 ${m}:${s} · 레벨 ${player.level} · 킬 ${kills}`;
  }

  // ---------- Render ----------
  function render() {
    ctx.fillStyle = '#14141f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const camX = player.x - canvas.width / 2;
    const camY = player.y - canvas.height / 2;

    ctx.save();
    ctx.translate(-camX, -camY);

    // grid background
    const grid = 64;
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    const startX = Math.floor(camX / grid) * grid;
    const startY = Math.floor(camY / grid) * grid;
    for (let x = startX; x < camX + canvas.width + grid; x += grid) {
      ctx.beginPath(); ctx.moveTo(x, camY); ctx.lineTo(x, camY + canvas.height); ctx.stroke();
    }
    for (let y = startY; y < camY + canvas.height + grid; y += grid) {
      ctx.beginPath(); ctx.moveTo(camX, y); ctx.lineTo(camX + canvas.width, y); ctx.stroke();
    }

    // gems
    for (const g of gems) drawSprite('gem', g.x, g.y, g.radius, 1);

    // enemies
    for (const e of enemies) {
      drawSprite(e.type.sprite, e.x, e.y, e.type.radius, 1);
      const barW = e.type.radius * 2;
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(e.x - barW / 2, e.y - e.type.radius - 10, barW, 4);
      ctx.fillStyle = '#ff4d4d';
      ctx.fillRect(e.x - barW / 2, e.y - e.type.radius - 10, barW * clamp(e.hp / e.maxHp, 0, 1), 4);
    }

    // orbit weapon
    for (const pt of orbitPositions()) drawSprite('orbit', pt.x, pt.y, 14, 1);

    // projectiles
    for (const p of projectiles) drawSprite('bolt', p.x, p.y, 8, 1);

    // player
    drawSprite('player', player.x, player.y, player.radius, player.facing);

    // floating text
    ctx.textAlign = 'center';
    for (const f of floatTexts) {
      ctx.globalAlpha = clamp(f.life / 0.7, 0, 1);
      ctx.fillStyle = f.color;
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(f.text, f.x, f.y);
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }

  // ---------- Main loop ----------
  let lastTime = 0;
  function loop(ts) {
    const dt = Math.min((ts - lastTime) / 1000 || 0, 0.05);
    lastTime = ts;
    if (state === 'playing') update(dt);
    if (state !== 'start') render();
    requestAnimationFrame(loop);
  }

  // ---------- Screens ----------
  document.getElementById('start-btn').addEventListener('click', () => {
    resetGame();
    startScreen.classList.add('hidden');
    gameoverScreen.classList.add('hidden');
    state = 'playing';
  });

  document.getElementById('restart-btn').addEventListener('click', () => {
    resetGame();
    gameoverScreen.classList.add('hidden');
    state = 'playing';
  });

  preloadAssets().then(() => {
    requestAnimationFrame(loop);
  });
})();
