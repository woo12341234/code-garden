(function () {
  "use strict";

  const TILE = 48;
  const COLS = 15;
  const ROWS = 10;

  const WAYPOINTS = [
    { x: 0, y: 264 },
    { x: 216, y: 264 },
    { x: 216, y: 120 },
    { x: 456, y: 120 },
    { x: 456, y: 360 },
    { x: 648, y: 360 },
    { x: 648, y: 216 },
    { x: 720, y: 216 },
  ];

  const TOWER_TYPES = {
    cannon: { name: "캐논", cost: 50, range: 110, damage: 18, fireRate: 1.1, projectileSpeed: 420, color: "#9aa7b5" },
    sniper: { name: "저격수", cost: 100, range: 220, damage: 55, fireRate: 0.6, projectileSpeed: 600, color: "#b06fe0" },
    slow: { name: "슬로우", cost: 75, range: 90, damage: 6, fireRate: 1.4, projectileSpeed: 380, color: "#4aa8ff", slowFactor: 0.5, slowDuration: 1.6 },
  };

  const ENEMY_TYPES = {
    basic: { hp: 40, speed: 70, reward: 6, damage: 1, color: "#e0563f", radius: 12 },
    fast: { hp: 25, speed: 125, reward: 7, damage: 1, color: "#f0c419", radius: 10 },
    tank: { hp: 150, speed: 42, reward: 14, damage: 2, color: "#7a4fd1", radius: 16 },
  };

  function blockedPathCells() {
    const blocked = new Set();
    for (let i = 0; i < WAYPOINTS.length - 1; i++) {
      const a = WAYPOINTS[i];
      const b = WAYPOINTS[i + 1];
      if (a.y === b.y) {
        const row = Math.max(0, Math.min(ROWS - 1, Math.floor(a.y / TILE)));
        const c1 = Math.floor(Math.min(a.x, b.x) / TILE);
        const c2 = Math.floor((Math.max(a.x, b.x) - 1) / TILE);
        for (let c = Math.max(0, c1); c <= Math.min(COLS - 1, c2); c++) blocked.add(`${c},${row}`);
      } else if (a.x === b.x) {
        const col = Math.max(0, Math.min(COLS - 1, Math.floor(a.x / TILE)));
        const r1 = Math.floor(Math.min(a.y, b.y) / TILE);
        const r2 = Math.floor((Math.max(a.y, b.y) - 1) / TILE);
        for (let r = Math.max(0, r1); r <= Math.min(ROWS - 1, r2); r++) blocked.add(`${col},${r}`);
      }
    }
    return blocked;
  }

  const BLOCKED = blockedPathCells();

  const canvas = document.getElementById("board");
  const ctx = canvas.getContext("2d");

  const el = {
    gold: document.getElementById("gold"),
    life: document.getElementById("life"),
    wave: document.getElementById("wave"),
    overlay: document.getElementById("overlay"),
    overlayTitle: document.getElementById("overlay-title"),
    overlayDesc: document.getElementById("overlay-desc"),
    restartBtn: document.getElementById("restart-btn"),
    buildHint: document.getElementById("build-hint"),
    selectedPanel: document.getElementById("selected-panel"),
    selectedName: document.getElementById("selected-name"),
    selectedStats: document.getElementById("selected-stats"),
    upgradeBtn: document.getElementById("upgrade-btn"),
    upgradeCost: document.getElementById("upgrade-cost"),
    sellBtn: document.getElementById("sell-btn"),
    startWaveBtn: document.getElementById("start-wave-btn"),
    waveHint: document.getElementById("wave-hint"),
    towerBtns: Array.from(document.querySelectorAll(".tower-btn")),
  };

  let state = null;

  function freshState() {
    return {
      gold: 150,
      life: 20,
      waveNum: 0,
      towers: [],
      enemies: [],
      projectiles: [],
      spawnQueue: [],
      spawnTimer: 0,
      waveInProgress: false,
      gameOver: false,
      buildType: null,
      selectedTower: null,
      hover: null,
    };
  }

  function cellKey(col, row) {
    return `${col},${row}`;
  }

  function isBuildable(col, row) {
    if (col < 0 || row < 0 || col >= COLS || row >= ROWS) return false;
    if (BLOCKED.has(cellKey(col, row))) return false;
    return !state.towers.some((t) => t.col === col && t.row === row);
  }

  function towerAt(col, row) {
    return state.towers.find((t) => t.col === col && t.row === row) || null;
  }

  function upgradeCost(tower) {
    return Math.round(TOWER_TYPES[tower.type].cost * 0.7 * tower.level);
  }

  function sellValue(tower) {
    return Math.round(tower.spent * 0.6);
  }

  function currentStats(tower) {
    const base = TOWER_TYPES[tower.type];
    const mult = 1 + (tower.level - 1) * 0.5;
    return {
      damage: base.damage * mult,
      range: base.range * (1 + (tower.level - 1) * 0.12),
      fireRate: base.fireRate,
    };
  }

  function composeWave(waveNum) {
    const queue = [];
    const basicCount = 6 + waveNum * 2;
    for (let i = 0; i < basicCount; i++) queue.push("basic");
    if (waveNum >= 3) {
      const fastCount = waveNum;
      for (let i = 0; i < fastCount; i++) queue.push("fast");
    }
    if (waveNum >= 5) {
      const tankCount = Math.floor(waveNum / 2);
      for (let i = 0; i < tankCount; i++) queue.push("tank");
    }
    for (let i = queue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [queue[i], queue[j]] = [queue[j], queue[i]];
    }
    return queue.map((type) => {
      const base = ENEMY_TYPES[type];
      const hpMult = 1 + (waveNum - 1) * 0.18;
      const speedMult = Math.min(1.4, 1 + (waveNum - 1) * 0.015);
      return {
        type,
        hp: base.hp * hpMult,
        maxHp: base.hp * hpMult,
        speed: base.speed * speedMult,
        baseSpeed: base.speed * speedMult,
        reward: base.reward,
        damage: base.damage,
        color: base.color,
        radius: base.radius,
        x: WAYPOINTS[0].x,
        y: WAYPOINTS[0].y,
        waypointIndex: 1,
        distanceTraveled: 0,
        slowTimer: 0,
        alive: true,
      };
    });
  }

  function startWave() {
    if (state.waveInProgress || state.gameOver) return;
    state.waveNum++;
    state.spawnQueue = composeWave(state.waveNum);
    state.spawnTimer = 0;
    state.waveInProgress = true;
    updateUI();
  }

  function updateUI() {
    el.gold.textContent = Math.floor(state.gold);
    el.life.textContent = Math.max(0, state.life);
    el.wave.textContent = state.waveNum;
    el.startWaveBtn.disabled = state.waveInProgress || state.gameOver;
    el.waveHint.textContent = state.waveInProgress
      ? "웨이브 진행 중..."
      : "준비되면 웨이브를 시작하세요.";

    el.towerBtns.forEach((btn) => {
      const type = btn.dataset.type;
      btn.classList.toggle("selected", state.buildType === type);
      const affordable = state.gold >= TOWER_TYPES[type].cost;
      btn.style.opacity = affordable ? "1" : "0.5";
    });

    if (state.selectedTower && state.towers.includes(state.selectedTower)) {
      const t = state.selectedTower;
      const stats = currentStats(t);
      el.selectedPanel.classList.remove("hidden");
      el.selectedName.textContent = `${TOWER_TYPES[t.type].name} (Lv.${t.level})`;
      el.selectedStats.textContent = `공격력 ${stats.damage.toFixed(0)} · 사거리 ${stats.range.toFixed(0)} · 속도 ${stats.fireRate.toFixed(1)}/s`;
      el.upgradeCost.textContent = upgradeCost(t);
      document.getElementById("sell-value").textContent = sellValue(t);
      el.upgradeBtn.disabled = state.gold < upgradeCost(t);
    } else {
      el.selectedPanel.classList.add("hidden");
    }

    el.buildHint.textContent = state.buildType
      ? `${TOWER_TYPES[state.buildType].name} 선택됨 - 빈 칸을 클릭해 설치하세요.`
      : "타워를 선택하고 빈 칸을 클릭하세요.";
  }

  function placeTower(col, row) {
    const type = state.buildType;
    if (!type) return;
    const cost = TOWER_TYPES[type].cost;
    if (state.gold < cost) return;
    if (!isBuildable(col, row)) return;
    state.gold -= cost;
    state.towers.push({
      type,
      col,
      row,
      x: col * TILE + TILE / 2,
      y: row * TILE + TILE / 2,
      level: 1,
      spent: cost,
      cooldown: 0,
    });
    updateUI();
  }

  function pickTarget(tower) {
    const stats = currentStats(tower);
    let best = null;
    let bestProgress = -1;
    for (const e of state.enemies) {
      if (!e.alive) continue;
      const dx = e.x - tower.x;
      const dy = e.y - tower.y;
      if (dx * dx + dy * dy <= stats.range * stats.range) {
        if (e.distanceTraveled > bestProgress) {
          bestProgress = e.distanceTraveled;
          best = e;
        }
      }
    }
    return best;
  }

  function fireTower(tower, dt) {
    tower.cooldown -= dt;
    if (tower.cooldown > 0) return;
    const target = pickTarget(tower);
    if (!target) return;
    const stats = currentStats(tower);
    const typeDef = TOWER_TYPES[tower.type];
    state.projectiles.push({
      x: tower.x,
      y: tower.y,
      target,
      damage: stats.damage,
      speed: typeDef.projectileSpeed,
      color: typeDef.color,
      slowFactor: typeDef.slowFactor,
      slowDuration: typeDef.slowDuration,
    });
    tower.cooldown = 1 / stats.fireRate;
  }

  function updateProjectiles(dt) {
    state.projectiles = state.projectiles.filter((p) => {
      if (!p.target.alive) return false;
      const dx = p.target.x - p.x;
      const dy = p.target.y - p.y;
      const dist = Math.hypot(dx, dy);
      const move = p.speed * dt;
      if (move >= dist) {
        p.target.hp -= p.damage;
        if (p.slowFactor) {
          p.target.speed = p.target.baseSpeed * p.slowFactor;
          p.target.slowTimer = p.slowDuration;
        }
        if (p.target.hp <= 0 && p.target.alive) {
          p.target.alive = false;
          state.gold += p.target.reward;
        }
        return false;
      }
      p.x += (dx / dist) * move;
      p.y += (dy / dist) * move;
      return true;
    });
  }

  function updateEnemies(dt) {
    for (const e of state.enemies) {
      if (!e.alive) continue;
      if (e.slowTimer > 0) {
        e.slowTimer -= dt;
        if (e.slowTimer <= 0) e.speed = e.baseSpeed;
      }
      const target = WAYPOINTS[e.waypointIndex];
      if (!target) continue;
      const dx = target.x - e.x;
      const dy = target.y - e.y;
      const dist = Math.hypot(dx, dy);
      const move = e.speed * dt;
      if (move >= dist) {
        e.x = target.x;
        e.y = target.y;
        e.distanceTraveled += dist;
        e.waypointIndex++;
        if (e.waypointIndex >= WAYPOINTS.length) {
          e.alive = false;
          state.life -= e.damage;
          if (state.life <= 0) {
            state.life = 0;
            triggerGameOver();
          }
        }
      } else {
        e.x += (dx / dist) * move;
        e.y += (dy / dist) * move;
        e.distanceTraveled += move;
      }
    }
    state.enemies = state.enemies.filter((e) => e.alive);
  }

  function updateSpawning(dt) {
    if (!state.waveInProgress) return;
    if (state.spawnQueue.length > 0) {
      state.spawnTimer -= dt;
      if (state.spawnTimer <= 0) {
        const enemy = state.spawnQueue.shift();
        state.enemies.push(enemy);
        state.spawnTimer = 0.55;
      }
    } else if (state.enemies.length === 0) {
      state.waveInProgress = false;
      state.gold += 10 + state.waveNum * 2;
      updateUI();
    }
  }

  function triggerGameOver() {
    state.gameOver = true;
    el.overlayTitle.textContent = "게임 오버";
    el.overlayDesc.textContent = `${state.waveNum}웨이브까지 버텼습니다.`;
    el.overlay.classList.remove("hidden");
  }

  function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const isPath = BLOCKED.has(cellKey(c, r));
        ctx.fillStyle = isPath ? "#3a4a5e" : (c + r) % 2 === 0 ? "#182432" : "#152030";
        ctx.fillRect(c * TILE, r * TILE, TILE, TILE);
      }
    }

    ctx.strokeStyle = "rgba(255,255,255,0.03)";
    for (let c = 0; c <= COLS; c++) {
      ctx.beginPath();
      ctx.moveTo(c * TILE, 0);
      ctx.lineTo(c * TILE, ROWS * TILE);
      ctx.stroke();
    }
    for (let r = 0; r <= ROWS; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * TILE);
      ctx.lineTo(COLS * TILE, r * TILE);
      ctx.stroke();
    }

    if (state.hover && state.buildType) {
      const { col, row } = state.hover;
      const ok = isBuildable(col, row) && state.gold >= TOWER_TYPES[state.buildType].cost;
      ctx.fillStyle = ok ? "rgba(47,191,113,0.35)" : "rgba(224,86,63,0.35)";
      ctx.fillRect(col * TILE, row * TILE, TILE, TILE);
      const range = TOWER_TYPES[state.buildType].range;
      ctx.strokeStyle = "rgba(255,255,255,0.25)";
      ctx.beginPath();
      ctx.arc(col * TILE + TILE / 2, row * TILE + TILE / 2, range, 0, Math.PI * 2);
      ctx.stroke();
    }

    for (const t of state.towers) {
      const def = TOWER_TYPES[t.type];
      ctx.fillStyle = def.color;
      ctx.beginPath();
      ctx.arc(t.x, t.y, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#0b1420";
      ctx.lineWidth = 2;
      ctx.stroke();
      if (t.level > 1) {
        ctx.fillStyle = "#0b1420";
        ctx.font = "bold 10px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(String(t.level), t.x, t.y + 3);
      }
      if (state.selectedTower === t) {
        ctx.strokeStyle = "rgba(255,255,255,0.4)";
        ctx.beginPath();
        ctx.arc(t.x, t.y, currentStats(t).range, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    for (const e of state.enemies) {
      ctx.fillStyle = e.color;
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
      ctx.fill();

      const barW = e.radius * 2;
      const pct = Math.max(0, e.hp / e.maxHp);
      ctx.fillStyle = "#1a1a1a";
      ctx.fillRect(e.x - barW / 2, e.y - e.radius - 9, barW, 4);
      ctx.fillStyle = pct > 0.5 ? "#2fbf71" : pct > 0.25 ? "#f0c419" : "#e0563f";
      ctx.fillRect(e.x - barW / 2, e.y - e.radius - 9, barW * pct, 4);
    }

    for (const p of state.projectiles) {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function loop(timestamp) {
    if (!loop.last) loop.last = timestamp;
    const dt = Math.min(0.05, (timestamp - loop.last) / 1000);
    loop.last = timestamp;

    if (!state.gameOver) {
      updateSpawning(dt);
      updateEnemies(dt);
      for (const t of state.towers) fireTower(t, dt);
      updateProjectiles(dt);
    }

    drawBoard();
    updateUI();
    requestAnimationFrame(loop);
  }

  function canvasCellFromEvent(evt) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (evt.clientX - rect.left) * scaleX;
    const y = (evt.clientY - rect.top) * scaleY;
    return { col: Math.floor(x / TILE), row: Math.floor(y / TILE) };
  }

  canvas.addEventListener("mousemove", (evt) => {
    state.hover = canvasCellFromEvent(evt);
  });

  canvas.addEventListener("mouseleave", () => {
    state.hover = null;
  });

  canvas.addEventListener("click", (evt) => {
    if (state.gameOver) return;
    const { col, row } = canvasCellFromEvent(evt);
    const existing = towerAt(col, row);
    if (existing) {
      state.selectedTower = existing;
      state.buildType = null;
    } else if (state.buildType) {
      placeTower(col, row);
    } else {
      state.selectedTower = null;
    }
    updateUI();
  });

  el.towerBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const type = btn.dataset.type;
      state.buildType = state.buildType === type ? null : type;
      state.selectedTower = null;
      updateUI();
    });
  });

  el.upgradeBtn.addEventListener("click", () => {
    const t = state.selectedTower;
    if (!t) return;
    const cost = upgradeCost(t);
    if (state.gold < cost) return;
    state.gold -= cost;
    t.spent += cost;
    t.level++;
    updateUI();
  });

  el.sellBtn.addEventListener("click", () => {
    const t = state.selectedTower;
    if (!t) return;
    state.gold += sellValue(t);
    state.towers = state.towers.filter((x) => x !== t);
    state.selectedTower = null;
    updateUI();
  });

  el.startWaveBtn.addEventListener("click", startWave);

  el.restartBtn.addEventListener("click", () => {
    el.overlay.classList.add("hidden");
    init();
  });

  function init() {
    state = freshState();
    updateUI();
  }

  init();
  requestAnimationFrame(loop);
})();
