// Every technique of 강호난세 (the 2D game's generic, sect and secret arts) rebuilt for 3D on fx.js, plus their
// awakenings, the passives, the 27 heroes with their 2D traits, and each hero's ultimate.
// Distances are 2D pixels / 23; damage and cooldowns follow the 2D numbers.
import * as THREE from 'three';

const PX = 23;
const TAU = Math.PI * 2;
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const shuffle = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

export const SECTS = { hwasan: '화산파', mudang: '무당파', sorim: '소림사', gaebang: '개방', dang: '사천당가', namgung: '남궁세가', bukhae: '북해빙궁', magyo: '마교', aemi: '아미파', gonryun: '곤륜파', jegal: '제갈세가' };

// ---------- heroes (2D stats & traits) ----------
export const HERO_DATA = [
  ['cheongpung', '청풍', '검객', null, 'geomsul', null, 100, 195, '치명타 확률 +15%, 치명타 피해 ×2.5', (p) => { p.crit += 0.15; p.critMul = 2.5; }, 'slash', '#40c8d2', '청풍만검'],
  ['unhak', '운학', '무당파 도사', 'mudang', 'lightning', null, 110, 185, '모든 무공 대기시간 -15%', (p) => { p.haste *= 0.85; }, 'cast', '#788cff', '뇌정만리'],
  ['yeoubi', '여우비', '구미호', null, 'orbit', null, 90, 215, '가장 빠름, 요괴 4마리마다 HP 1 회복', (p) => { p.killHeal += 0.25; }, 'cast', '#6ebeff', '구미호화'],
  ['cheolsan', '철산', '소림 무승', 'sorim', 'gwonbeop', null, 150, 170, '최대 HP 150, 받는 피해 -15%', (p) => { p.armor *= 0.85; }, 'palm', '#ffbe46', '나한대권'],
  ['dallae', '달래', '무녀', null, 'fairy', null, 100, 190, '경험치 +25%, 줍는 범위 +50%', (p) => { p.xpMul += 0.25; p.magnet *= 1.5; }, 'cast', '#ff788c', '만신강림'],
  ['yawol', '야월', '자객', null, 'boomerang', null, 95, 210, '모든 무공 발사 수 +1', (p) => { p.extra += 1; }, 'throw', '#e63c3c', '월하난무'],
  ['songhwa', '송화', '약사', null, 'thorn', null, 105, 190, '초당 HP 1 회복, 범위 +20%', (p) => { p.regen += 1; p.area *= 1.2; }, 'cast', '#96e65a', '백초독무'],
  ['muyeong', '무영', '검귀', null, 'slash', null, 100, 200, '모든 피해 +15%', (p) => { p.dmgMul += 0.15; }, 'twin', '#dc3c46', '쌍귀참'],
  ['geumbi', '금비', '부적술사', null, 'mine', null, 100, 190, '대기시간 -10%, 지속시간 +30%', (p) => { p.haste *= 0.9; p.durMul += 0.3; }, 'cast', '#ffc846', '천부폭렬'],
  ['seola', '설아', '북해빙궁 설녀', 'bukhae', 'icicle', null, 100, 190, '가까이 온 요괴가 얼어서 느려져요', (p) => { p.chillAura = 85 / PX; }, 'cast', '#a0dcff', '설녀의 숨결'],
  ['cheonma', '천마', '마교 교주', 'magyo', 'cheonmasingong', 'hyeolma', 160, 205, '모든 피해 +50%, 치명타 +10%', (p) => { p.dmgMul += 0.5; p.crit += 0.1; }, 'palm', '#dc1e32', '천마혈우'],
  ['sansin', '산신령', '산의 주인', null, 'aura', 'orbit', 200, 195, '초당 HP 3 회복, 대기시간 -15%', (p) => { p.regen += 3; p.haste *= 0.85; }, 'cast', '#ffe696', '산군강림'],
  ['baekmae', '백매', '화산파 검수', 'hwasan', 'plum', null, 100, 200, '치명타 +10%, 꽃잎 관통 +1', (p) => { p.crit += 0.1; p.pierce += 1; }, 'slash', '#fa8cb4', '매화폭풍'],
  ['palgeol', '팔걸', '개방 방도', 'gaebang', 'tagu', null, 120, 190, '줍는 범위 +40%, 회복량 2배', (p) => { p.magnet *= 1.4; p.healMul = 2; }, 'spin', '#78c85a', '타구광풍'],
  ['dangyu', '당유', '사천당가 암기술사', 'dang', 'needles', null, 90, 205, '모든 지속 피해 +40%', (p) => { p.dotMul = 1.4; }, 'throw', '#96e65a', '만천암우'],
  ['namgung', '남궁휘', '남궁세가 소가주', 'namgung', 'jewang', null, 115, 190, '모든 피해 +20%, 보스 피해 +50%', (p) => { p.dmgMul += 0.2; p.bossMul = 1.5; }, 'slash', '#f0c85a', '창궁제왕검'],
  ['aemi', '청아', '아미파 여협', 'aemi', 'emeija', null, 105, 200, '초당 HP 1 회복, 받는 피해 -10%', (p) => { p.regen += 1; p.armor *= 0.9; }, 'throw', '#be96f0', '금정연화'],
  ['gonryun', '설운', '곤륜파 검수', 'gonryun', 'seolgeom', null, 100, 210, '빠름, 치명타 +5%', (p) => { p.crit += 0.05; }, 'slash', '#96d2ff', '설산검우'],
  ['jegal', '제갈연', '제갈세가 군사', 'jegal', 'formation', null, 95, 190, '경험치 +20%, 대기시간 -10%', (p) => { p.xpMul += 0.2; p.haste *= 0.9; }, 'cast', '#5ac8aa', '팔진천라'],
  ['dokgo', '독고', '검성', null, 'geomsul', null, 100, 205, '검술 한 단계 높은 형, 8번째 베기마다 일섬, 치명타 +10%', (p) => { p.formBonus = 1; p.issen = true; p.crit += 0.1; }, 'slash', '#e6e6f5', '독고일검'],
  ['hyeolrang', '혈랑', '광전사 낭인', null, 'slash', 'geomsul', 130, 210, 'HP가 낮을수록 강해짐, 처치 시 HP 0.5 흡혈', (p) => { p.berserk = 1.2; p.killHeal += 0.5; }, 'twin', '#d21e28', '혈월광란'],
  ['hyeonmu', '현무', '강시술사', null, 'orbit', null, 95, 195, '쓰러진 요괴의 20%가 원귀로 일어나 덮쳐요', (p) => { p.necro = 0.2; }, 'cast', '#b482ff', '백귀야행'],
  ['jusun', '주선', '취권 고수', null, 'gwonbeop', 'bottle', 115, 215, '공격을 30% 확률로 흘려내요', (p) => { p.dodge = 0.3; }, 'palm', '#f0aa50', '취팔선'],
  ['hwaryeon', '화련', '불사조의 무녀', null, 'firework', null, 100, 205, '지나간 자리에 불길, 한 번 불사조로 부활', (p) => { p.flameTrail = true; p.revives += 1; }, 'cast', '#ff7828', '주작강림'],
  ['dueok', '두억', '도깨비 왕', null, 'quake', null, 170, 190, '줍는 범위 ×2, 받는 피해 -10%', (p) => { p.magnet *= 2; p.armor *= 0.9; }, 'palm', '#5a8ce6', '도깨비 대잔치'],
  ['nameless', '무명', '이름 없는 검객', null, 'geomsul', null, 110, 215, '무공 하나만, 3단계로 시작, 모든 피해 +120%', (p) => { p.maxWeapons = 1; p.dmgMul += 1.2; p.startLevel = 3; }, 'slash', '#c8c8d7', '무명일검'],
  ['maengju', '무림맹주', '천하제일인', 'all', 'geomsul', 'jewang', 180, 205, '모든 문파 무공, 모든 피해 +30%, 대기시간 -10%', (p) => { p.dmgMul += 0.3; p.haste *= 0.9; }, 'slash', '#ffdc78', '천하제일검'],
].map(([key, name, role, sect, weapon, extra, hp, speed, trait, setup, ult, color, ultName]) => ({ key, name, role, sect, weapon, extra, hp, speed: speed / PX * 1.0, trait, setup, ult, color, ultName }));

// ---------- passives (2D) ----------
export const PASSIVES = [
  { id: 'hp', icon: 'heart', name: '단전호흡', desc: '최대 HP +20, HP 20 회복', max: 6, f: (p) => { p.maxHp += 20; p.hp = Math.min(p.maxHp, p.hp + 20); } },
  { id: 'haste', icon: 'hourglass', name: '쾌속', desc: '모든 무공 대기시간 -10%', max: 6, f: (p) => { p.haste *= 0.9; } },
  { id: 'speed', icon: 'leaf', name: '경공', desc: '이동 속도 +10%, 점프력 증가', max: 6, f: (p) => { p.speed *= 1.1; p.jump += 0.6; } },
  { id: 'magnet', icon: 'magnet', name: '흡성', desc: '줍는 범위 +30%', max: 6, f: (p) => { p.magnet *= 1.3; } },
  { id: 'regen', icon: 'tea', name: '운기조식', desc: '초당 HP 1 회복', max: 6, f: (p) => { p.regen += 1; } },
  { id: 'crit', icon: 'target', name: '급소 찌르기', desc: '치명타 확률 +10%', max: 6, f: (p) => { p.crit += 0.1; } },
  { id: 'xp', icon: 'scroll', name: '깨달음', desc: '얻는 경험치 +15%', max: 6, f: (p) => { p.xpMul += 0.15; } },
  { id: 'armor', icon: 'shield', name: '금강불괴', desc: '받는 피해 -8%', max: 6, f: (p) => { p.armor *= 0.92; } },
  { id: 'area', icon: 'taiji', name: '내공', desc: '모든 범위 +12%', max: 6, f: (p) => { p.area *= 1.12; } },
  { id: 'extra', icon: 'clones', name: '분신술', desc: '발사 수·대상 +1', max: 3, f: (p) => { p.extra++; } },
  { id: 'luck', icon: 'luckbag', name: '복주머니', desc: '회복 영약·보물이 더 자주 나와요', max: 6, f: (p) => { p.luck += 0.4; } },
  { id: 'dmg', icon: 'fist', name: '내공 심화', desc: '모든 피해 +10%', max: 6, f: (p) => { p.dmgMul += 0.1; } },
  { id: 'pierce', icon: 'needles', name: '관통', desc: '투사체 관통 +1', max: 4, f: (p) => { p.pierce++; } },
  { id: 'duration', icon: 'hourglass', name: '지속', desc: '지속시간 +20%', max: 5, f: (p) => { p.durMul += 0.2; } },
];
export const PASSIVE_BY_ID = Object.fromEntries(PASSIVES.map((p) => [p.id, p]));

export function createArts(G) {
  const { FX, scene } = G;
  const P = () => G.P;
  const shots = [], zones = [], mines = [], shells = [], timers = [];
  const later = (t, fn) => timers.push({ t, fn });
  const ch = () => G.chest();
  const A = (n) => n * P().area;
  const eY = (e) => e.y + e.h * 0.45;

  // ---------- visuals for flying things ----------
  const planeGeo = new THREE.PlaneGeometry(1, 1);
  // projectile visuals are pooled: their materials live for the whole session (no allocation or shader churn)
  const vpool = {};
  function fromPool(key, make) { const list = vpool[key] || (vpool[key] = []); const o = list.pop() || make(); o.userData.pkey = key; return o; }
  function flatMesh(tex, color, w, h, add = true) {
    const m = fromPool('f' + add, () => new THREE.Mesh(planeGeo, new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: add ? THREE.AdditiveBlending : THREE.NormalBlending, fog: false })));
    m.material.map = FX.TEX[tex]; m.material.color.set(color); m.material.opacity = 1;
    m.rotation.set(0, 0, 0); m.rotation.order = 'YXZ'; m.scale.set(w, h, 1); m.renderOrder = 3;
    scene.add(m); return m;
  }
  function spriteObj(tex, color, size, add = true) {
    const s = fromPool('s' + add, () => new THREE.Sprite(new THREE.SpriteMaterial({ transparent: true, depthWrite: false, blending: add ? THREE.AdditiveBlending : THREE.NormalBlending, fog: false })));
    s.material.map = FX.TEX[tex]; s.material.color.set(color); s.material.opacity = 1; s.material.rotation = 0;
    s.scale.setScalar(size); s.renderOrder = 3; scene.add(s); return s;
  }
  const kill3 = (o) => { if (!o) return; scene.remove(o); if (o.userData.pkey) vpool[o.userData.pkey].push(o); };

  // projectile: { x,y,z,vx,vz,vy, life, dmg, r, pierce, kind, vis(mesh|sprite), glow, trail, color, onHit, spin, ... }
  function shoot(o) {
    const s = { y: ch(), vy: 0, r: 0.6, pierce: 1 + P().pierce, hit: new Set(), trailT: 0, ...o };
    if (s.tex) { s.vis = s.flat ? flatMesh(s.tex, s.color, s.w || 1, s.h || 1, s.add !== false) : spriteObj(s.tex, s.color, s.size || 1, s.add !== false); }
    if (s.glowSize) s.glow = spriteObj('glow', s.color, s.glowSize);
    s.x0 = s.x; s.z0 = s.z;
    shots.push(s);
    return s;
  }
  function updateShots(dt) {
    for (let i = shots.length - 1; i >= 0; i--) {
      const s = shots[i];
      s.life -= dt;
      if (s.kind === 'homing') {
        const t = G.nearestN(1, 22, s.x, s.z)[0];
        if (t) { const want = Math.atan2(t.z - s.z, t.x - s.x), cur = Math.atan2(s.vz, s.vx); let d = want - cur; d = Math.atan2(Math.sin(d), Math.cos(d)); const na = cur + Math.max(-1, Math.min(1, d)) * dt * (s.turn || 6), sp = Math.hypot(s.vx, s.vz); s.vx = Math.cos(na) * sp; s.vz = Math.sin(na) * sp; }
      } else if (s.kind === 'boomerang') {
        const out = Math.hypot(s.x - s.x0, s.z - s.z0);
        if (!s.back && out > s.range) { s.back = true; s.hit.clear(); }
        if (s.back) { const dx = P().x - s.x, dz = P().z - s.z, d = Math.hypot(dx, dz) || 1, sp = Math.hypot(s.vx, s.vz); s.vx = dx / d * sp; s.vz = dz / d * sp; if (d < 1) s.life = 0; }
      } else if (s.kind === 'wander') {
        s.wt = (s.wt || 0) - dt;
        if (s.wt <= 0) { s.wt = 0.6; const t = G.nearestN(1, 14, s.x, s.z)[0]; const a = t ? Math.atan2(t.z - s.z, t.x - s.x) + rnd(-0.5, 0.5) : rnd(0, TAU); const sp = Math.hypot(s.vx, s.vz); s.vx = Math.cos(a) * sp; s.vz = Math.sin(a) * sp; }
      }
      s.x += s.vx * dt; s.z += s.vz * dt; s.y += s.vy * dt;
      if (s.ground) s.y = G.H(s.x, s.z) + s.ground;
      if (s.vis) {
        s.vis.position.set(s.x, s.y, s.z);
        if (s.flat) { s.vis.rotation.y = -Math.atan2(s.vz, s.vx); s.vis.rotation.x = -Math.PI / 2 + (s.tilt ?? 0.6); if (s.spin) s.vis.rotation.z += s.spin * dt; }
        else if (s.spin) s.vis.material.rotation += s.spin * dt;
        if (s.life < 0.15) s.vis.material.opacity = s.life / 0.15;
      }
      if (s.glow) s.glow.position.set(s.x, s.y, s.z);
      if (s.trail && (s.trailT -= dt) <= 0) { s.trailT = G.lowFx() ? 0.06 : 0.03; FX.sprite(s.x, s.y, s.z, { tex: s.trailTex || 'glow', color: s.color, size: s.trail, life: s.trailLife || 0.25, grow: 0.3, fade: 'out', opacity: 0.7, rot: s.trailTex === 'petal' ? rnd(0, TAU) : 0 }); }
      if (s.y < G.H(s.x, s.z) - 0.4 && !s.ground) s.life = 0;
      const rehit = s.rehit;
      for (const e of G.enemies) {
        if (e.dead) continue;
        if (rehit) { if ((e.rehitT?.get?.(s) || 0) > G.time) continue; }
        else if (s.hit.has(e)) continue;
        if (Math.hypot(e.x - s.x, e.z - s.z) < e.r + s.r && Math.abs(eY(e) - s.y) < e.h * 0.6 + s.r + 0.4) {
          if (rehit) { (e.rehitT ??= new Map()).set(s, G.time + rehit); } else s.hit.add(e);
          const sp = Math.hypot(s.vx, s.vz) || 1;
          G.hurt(e, s.dmg, (s.vx / sp) * (s.push ?? 5), (s.vz / sp) * (s.push ?? 5), { color: s.color, dot: s.dot });
          s.onHit?.(e, s);
          if (--s.pierce <= 0) { s.life = 0; break; }
        }
      }
      if (s.life <= 0) { s.onEnd?.(s); kill3(s.vis); kill3(s.glow); shots.splice(i, 1); }
    }
  }
  // lobbed shell: arcs from (sx,sz) to (tx,tz) and calls land()
  function lob(o) { const s = { t: 0, dur: 0.45, h: 4, ...o }; s.vis = spriteObj(s.tex || 'glow', s.color, s.size || 1, s.add !== false); shells.push(s); return s; }
  function updateShells(dt) {
    for (let i = shells.length - 1; i >= 0; i--) {
      const s = shells[i];
      s.t += dt;
      const k = Math.min(1, s.t / s.dur);
      const x = s.sx + (s.tx - s.sx) * k, z = s.sz + (s.tz - s.sz) * k, y = (s.sy ?? ch()) * (1 - k) + G.H(s.tx, s.tz) * k + Math.sin(k * Math.PI) * s.h + (s.drop ? (1 - k) * s.drop : 0);
      s.vis.position.set(x, y, z);
      if (s.spin) s.vis.material.rotation += s.spin * dt;
      if (!G.lowFx() && Math.random() < 0.6) FX.sprite(x, y, z, { tex: 'glow', color: s.color, size: (s.size || 1) * 0.6, life: 0.2, grow: 0.3, fade: 'out', opacity: 0.6 });
      if (k >= 1) { kill3(s.vis); shells.splice(i, 1); s.land(s.tx, G.H(s.tx, s.tz), s.tz); }
    }
  }
  // lingering zones: { x,z,R,life,tick,dmg,color,slow,pull,follow,onTick, rune }
  function zone(o) { const z = { tickT: 0, ...o, max: o.life }; if (o.rune) z.runeFx = FX.rune(z.x, G.H(z.x, z.z), z.z, z.R, o.color, o.life > 100 ? 1 : z.life, o.runeSpin ?? 0.6); zones.push(z); return z; }
  function updateZones(dt) {
    for (let i = zones.length - 1; i >= 0; i--) {
      const z = zones[i];
      z.life -= dt;
      if (z.follow) { z.x = P().x; z.z = P().z; if (z.runeFx) z.runeFx.obj.position.set(z.x, G.H(z.x, z.z) + 0.12, z.z); }
      z.puff?.(z, dt);
      for (const e of G.enemies) {
        if (e.dead) continue;
        const d = Math.hypot(e.x - z.x, e.z - z.z);
        if (d > z.R + e.r) continue;
        if (z.slow) e.slowT = Math.max(e.slowT || 0, 0.25), e.slowK = Math.min(e.slowK ?? 1, 1 - z.slow);
        if (z.pull && d > 1.5 && !e.T.boss) { e.x += (z.x - e.x) / d * z.pull * dt; e.z += (z.z - e.z) / d * z.pull * dt; }
      }
      if ((z.tickT -= dt) <= 0) {
        z.tickT = z.tick || 0.5;
        G.inRadius(z.x, z.z, z.R, (e) => { G.hurt(e, z.dmg, 0, 0, { dot: true, color: z.color, quiet: true }); z.onTick?.(e); });
      }
      if (z.life <= 0) zones.splice(i, 1);
    }
  }
  function updateMines(dt) {
    for (let i = mines.length - 1; i >= 0; i--) {
      const m = mines[i];
      m.arm -= dt; m.life -= dt;
      m.vis.material.opacity = 0.6 + 0.4 * Math.sin(G.time * 8);
      if (m.pull) for (const e of G.enemies) { const d = Math.hypot(e.x - m.x, e.z - m.z); if (d < m.R * 2.5 && d > 0.5 && !e.T.boss) { e.x += (m.x - e.x) / d * 2.5 * dt; e.z += (m.z - e.z) / d * 2.5 * dt; } }
      let boom = m.life <= 0;
      if (m.arm <= 0) for (const e of G.enemies) if (!e.dead && Math.hypot(e.x - m.x, e.z - m.z) < e.r + 0.9) { boom = true; break; }
      if (boom) {
        kill3(m.vis);
        mines.splice(i, 1);
        const y = G.H(m.x, m.z);
        FX.explode(m.x, y, m.z, m.R, m.color);
        G.inRadius(m.x, m.z, m.R, (e) => G.hurt(e, m.dmg, (e.x - m.x) * 3, (e.z - m.z) * 3, { color: m.color }));
        G.shake(0.25);
      }
    }
  }
  function blast(x, z, R, dmg, color, push = 4, onHit, o = {}) {
    const y = G.H(x, z);
    if (o.fx !== false) FX.shockwave(x, y, z, R, color, { life: 0.4 });
    let n = 0;
    G.inRadius(x, z, R, (e) => { n++; G.hurt(e, dmg, (e.x - x) * push * 0.3, (e.z - z) * push * 0.3, { color }); onHit?.(e); });
    return n;
  }
  // strike along a line from the hero
  function lineStrike(a, L, width, dmg, color, onHit, o = {}) {
    const x0 = P().x, z0 = P().z, x1 = x0 + Math.cos(a) * L, z1 = z0 + Math.sin(a) * L;
    FX.beam(x0 + Math.cos(a) * 0.6, ch(), z0 + Math.sin(a) * 0.6, x1, ch(), z1, color, o.vis ?? Math.max(0.35, width * 0.7), o.life || 0.3);
    G.lineHits(x0, z0, x1, z1, width, (e, cx, cz) => { G.hurt(e, dmg, cx * 6, cz * 6, { color }); onHit?.(e); });
  }
  // fan-shaped cut in front of the hero
  function arcStrike(a, R, half, dmg, color, push = 8, o = {}) {
    FX.slash(P().x, ch() - 0.2, P().z, a, R, color, { side: o.side || 1, tilt: 0.8 });
    let n = 0;
    for (const e of G.enemies) {
      if (e.dead) continue;
      const d = Math.hypot(e.x - P().x, e.z - P().z); if (d > R + e.r) continue;
      let da = Math.atan2(e.z - P().z, e.x - P().x) - a; da = Math.atan2(Math.sin(da), Math.cos(da));
      if (Math.abs(da) > half + e.r / Math.max(d, 1) && d > e.r + 1) continue;
      G.hurt(e, dmg, (e.x - P().x) * push * 0.2, (e.z - P().z) * push * 0.2, { color }); n++;
    }
    return n;
  }
  // crescent wave that flies and cuts everything on its path
  function wave(a, dmg, speed, R, life, color, o = {}) {
    return shoot({ x: P().x, z: P().z, vx: Math.cos(a) * speed, vz: Math.sin(a) * speed, life, dmg, r: R, pierce: 999, tex: 'slash', flat: true, w: R * 2.4, h: R * 2.4, tilt: o.tilt ?? 0.35, color, trail: R * 1.2, trailTex: 'glow', push: 8, ...o });
  }
  const tgt = (range) => G.nearestN(1, range)[0];
  const aimAt = (e) => Math.atan2(e.z - P().z, e.x - P().x);
  const n = (w) => (w.count || 1) + P().extra;

  // ---------- techniques ----------
  const W = {};
  const def = (id, o) => { W[id] = o; };
  // generic
  def('shot', { name: '비검', icon: 'w_shot', desc: '가장 가까운 적에게 칼을 날려요', up: '데미지 +4, 2단계마다 발사 수 +1', max: 7, color: '#ffd76a',
    create: () => ({ dmg: 10, count: 1, cd: 0.7, t: 0.3 }), upgrade(w) { w.dmg += 4; if (w.level % 2 === 1) w.count++; },
    update(w, dt) { if ((w.t -= dt) > 0) return; const e = tgt(22); if (!e) return; w.t = w.cd * P().haste; const b = aimAt(e);
      for (let i = 0; i < n(w); i++) { const a = b + (i - (n(w) - 1) / 2) * 0.22; shoot({ x: P().x, z: P().z, vx: Math.cos(a) * 17, vz: Math.sin(a) * 17, life: 1.4, dmg: w.dmg, r: 0.5, tex: 'sword', flat: true, w: 1.7, h: 0.9, color: w.evolved ? '#ffe08a' : '#e8f0ff', add: false, glowSize: 1.1, trail: 0.6, trailTex: 'streak' }); } } });
  def('orbit', { name: '여우불', icon: 'w_orbit', desc: '몸 주위를 도는 여우불이 적을 태워요', up: '여우불 +1개, 데미지 +3', max: 6, color: '#6ab8ff',
    create: () => ({ dmg: 8, count: 1, dist: 58 / PX, ang: 0, hits: new Map(), orbs: [] }), upgrade(w) { w.count++; w.dmg += 3; },
    update(w, dt) {
      w.ang += dt * 2.6;
      const cnt = Math.min(12, w.count + P().extra), R = A(w.dist + (w.evolved ? 1.3 : 0)), col = w.evolved ? '#ff7ab0' : '#5aa8ff';
      while (w.orbs.length < cnt) w.orbs.push({ f: spriteObj('flame', col, 1.2), g: spriteObj('glow', col, 2.2) });
      for (const [e, t] of w.hits) { if (t <= dt) w.hits.delete(e); else w.hits.set(e, t - dt); }
      w.orbs.forEach((o, i) => {
        const a = w.ang + (i / cnt) * TAU, x = P().x + Math.cos(a) * R, z = P().z + Math.sin(a) * R, y = ch() + Math.sin(G.time * 4 + i) * 0.15;
        o.f.position.set(x, y + 0.15, z); o.g.position.set(x, y, z); o.f.material.color.set(col); o.g.material.color.set(col);
        o.f.scale.set(1.1 + Math.sin(G.time * 18 + i) * 0.12, 1.4 + Math.sin(G.time * 14 + i) * 0.15, 1);
        if (Math.random() < (G.lowFx() ? 0.2 : 0.5)) FX.sprite(x, y, z, { tex: 'flame', color: col, size: 0.7, life: 0.3, vel: [0, 2.5, 0], grow: 0.3, fade: 'out', opacity: 0.8 });
        G.inRadius(x, z, 0.75, (e) => { if (w.hits.has(e)) return; w.hits.set(e, 0.4); G.hurt(e, w.dmg, Math.cos(a) * 4, Math.sin(a) * 4, { color: col }); });
      });
    } });
  def('boomerang', { name: '원월륜', icon: 'w_boomerang', desc: '날아갔다 돌아오며 길 위의 적을 모두 베어요', up: '데미지 +5, 2단계마다 원월륜 +1', max: 6, color: '#ffe8a0',
    create: () => ({ dmg: 12, count: 1, cd: 1.3, t: 0.4, range: 230 / PX }), upgrade(w) { w.dmg += 5; if (w.level % 2 === 0) w.count++; },
    update(w, dt) { if ((w.t -= dt) > 0) return; const e = tgt(20); if (!e) return; w.t = w.cd * P().haste; const b = aimAt(e);
      for (let i = 0; i < n(w); i++) { const a = b + (i - (n(w) - 1) / 2) * 0.5; shoot({ kind: 'boomerang', x: P().x, z: P().z, vx: Math.cos(a) * 18, vz: Math.sin(a) * 18, life: 4, range: A(w.range), dmg: w.dmg, r: 0.75, pierce: 999, tex: 'chakram', flat: true, w: 1.5, h: 1.5, tilt: 0.25, spin: 18, color: w.evolved ? '#ffd76a' : '#f0f4ff', glowSize: 1.8, trail: 0.9, trailTex: 'glow' }); } } });
  def('lightning', { name: '뇌전부', icon: 'w_lightning', desc: '부적을 태워 주변 적에게 벼락을 내려요', up: '벼락 +1개, 데미지 +6', max: 6, color: '#b49cff',
    create: () => ({ dmg: 20, count: 1, cd: 1.8, t: 0.8, range: 420 / PX }), upgrade(w) { w.count++; w.dmg += 6; },
    update(w, dt) { if ((w.t -= dt) > 0) return; const pool = shuffle(G.nearestN(20, w.range)); if (!pool.length) return; w.t = w.cd * P().haste;
      FX.sprite(P().x, ch() + 1.2, P().z, { tex: 'talisman', color: '#ffffff', blend: 'normal', size: 0.9, life: 0.35, vel: [0, 3, 0], fade: 'out' });
      pool.slice(0, w.count + (w.evolved ? 5 : 0)).forEach((e, i) => later(i * 0.05, () => { if (e.dead) return; FX.bolt(e.x, e.y, e.z, w.evolved ? '#ffe36a' : '#b49cff'); G.inRadius(e.x, e.z, A(1.2), (o) => G.hurt(o, w.dmg, 0, 0, { color: '#c8b0ff' })); })); } });
  def('aura', { name: '금빛 결계', icon: 'w_aura', desc: '결계 안의 적을 느리게 하고 계속 피해를 줘요', up: '범위 +0.45, 데미지 +3', max: 6, color: '#ffd25a',
    create: () => ({ dmg: 5, R: 70 / PX, tick: 0.5, t: 0, slow: 0.35 }), upgrade(w) { w.R += 10 / PX; w.dmg += 3; },
    update(w, dt) {
      const R = A(w.R);
      if (!w.z || w.z.life <= 0) w.z = zone({ x: P().x, z: P().z, R, life: 9999, tick: w.tick, dmg: w.dmg, color: '#ffd25a', slow: w.slow, follow: true, rune: true, runeSpin: 0.5 });
      w.z.R = R; w.z.dmg = w.dmg; w.z.slow = w.slow;
      if (w.z.runeFx) { w.z.runeFx.t = 0.3; w.z.runeFx.obj.scale.setScalar(R * 2); }
      if (Math.random() < (G.lowFx() ? 0.1 : 0.3)) { const a = rnd(0, TAU), r = rnd(0, R); FX.sprite(P().x + Math.cos(a) * r, G.H(P().x, P().z) + 0.2, P().z + Math.sin(a) * r, { tex: 'spark', color: '#ffd25a', size: 0.35, life: 0.8, vel: [0, 2, 0], fade: 'out' }); }
    } });
  def('quake', { name: '장풍', icon: 'w_quake', desc: '손바닥 바람을 둥글게 터뜨려 적을 밀쳐내요', up: '데미지 +6, 범위 +0.65', max: 6, color: '#ffe2a0',
    create: () => ({ dmg: 16, R: 110 / PX, cd: 1.4, t: 0.6 }), upgrade(w) { w.dmg += 6; w.R += 15 / PX; },
    update(w, dt) { if ((w.t -= dt) > 0) return; const R = A(w.R) * (w.evolved ? 1.6 : 1); if (!tgt(R + 1.5)) return; w.t = w.cd * P().haste;
      const y = G.H(P().x, P().z);
      FX.ground(P().x, y, P().z, { tex: 'palm', color: w.evolved ? '#ffb347' : '#ffe8b0', size: R * 0.8, life: 0.4, grow: 1.6, opacity: 0.7 });
      FX.shockwave(P().x, y, P().z, R, '#ffe2a0', { life: 0.45 });
      for (let i = 0; i < (G.lowFx() ? 5 : 10); i++) { const a = (i / 10) * TAU; FX.sprite(P().x + Math.cos(a) * 1, y + 0.4, P().z + Math.sin(a) * 1, { tex: 'smoke', color: '#d8cbb0', blend: 'normal', size: 1.4, life: 0.6, vel: [Math.cos(a) * R * 1.4, 0.5, Math.sin(a) * R * 1.4], drag: 3, grow: 1.6, fade: 'out', opacity: 0.6 }); }
      blast(P().x, P().z, R, w.dmg, '#ffe2a0', 24, null, { fx: false }); G.shake(0.2); } });
  def('beam', { name: '검기', icon: 'w_beam', desc: '적을 꿰뚫는 긴 칼바람을 날려요', up: '데미지 +7, 3단계마다 검기 +1', max: 6, color: '#7fe6ff',
    create: () => ({ dmg: 18, count: 1, cd: 2.0, t: 0.5, L: 360 / PX, width: 14 / PX }), upgrade(w) { w.dmg += 7; if (w.level % 3 === 0) w.count++; },
    update(w, dt) { if ((w.t -= dt) > 0) return; const e = tgt(w.L); if (!e) return; w.t = w.cd * P().haste; const b = aimAt(e);
      for (let i = 0; i < n(w); i++) lineStrike(b + (i - (n(w) - 1) / 2) * 0.35, w.L, w.width + (w.evolved ? 0.5 : 0), w.dmg, w.evolved ? '#9ff6ff' : '#7fe6ff', null, { vis: 0.7 + (w.evolved ? 0.4 : 0) });
      G.heroSwing(); } });
  def('firework', { name: '폭염부', icon: 'w_firework', desc: '적 무리 위로 부적을 던져 불꽃으로 터뜨려요', up: '데미지 +6, 폭발 범위 +0.35, 2단계마다 부적 +1', max: 6, color: '#ff6a3a',
    create: () => ({ dmg: 14, count: 1, cd: 1.8, t: 0.4, R: 55 / PX }), upgrade(w) { w.dmg += 6; w.R += 8 / PX; if (w.level % 2 === 0) w.count++; },
    update(w, dt) { if ((w.t -= dt) > 0) return; const pool = shuffle(G.nearestN(16, 18)); if (!pool.length) return; w.t = w.cd * P().haste;
      for (const e of pool.slice(0, n(w))) lob({ sx: P().x, sz: P().z, tx: e.x, tz: e.z, dur: 0.5, h: 4, tex: 'talisman', color: '#ffffff', add: false, size: 0.9, spin: 10, land: (x, y, z) => { FX.explode(x, y, z, A(w.R) * 1.2, '#ff7a2a'); G.inRadius(x, z, A(w.R), (o) => G.hurt(o, w.dmg, (o.x - x) * 2, (o.z - z) * 2, { color: '#ff8a4a' })); G.shake(0.15); } }); } });
  def('fairy', { name: '종이학', icon: 'w_fairy', desc: '접은 종이학들이 적을 쫓아가 쪼아요', up: '데미지 +3, 2단계마다 종이학 +1', max: 6, color: '#f8f5ec',
    create: () => ({ dmg: 7, count: 2, cd: 1.35, t: 0.3 }), upgrade(w) { w.dmg += 3; if (w.level % 2 === 0) w.count++; },
    update(w, dt) { if ((w.t -= dt) > 0) return; if (!tgt(22)) return; w.t = w.cd * P().haste;
      for (let i = 0; i < n(w) + (w.evolved ? 6 : 0); i++) { const a = (i / n(w)) * TAU + G.time; shoot({ kind: 'homing', x: P().x, z: P().z, vx: Math.cos(a) * 13, vz: Math.sin(a) * 13, life: 2.5, dmg: w.dmg, r: 0.5, tex: 'crane', flat: true, w: 1.0, h: 1.0, tilt: 0.9, color: '#ffffff', add: false, trail: 0.4, trailTex: 'glow', turn: 7 }); } } });
  def('thorn', { name: '독안개', icon: 'w_thorn', desc: '지나간 자리에 독안개를 남겨 적을 느리게 하고 중독시켜요', up: '데미지 +3, 안개 크기 +0.25, 유지 +0.5초', max: 6, color: '#8ae05a',
    create: () => ({ dmg: 6, R: 34 / PX, life: 3, cd: 0.7, t: 0 }), upgrade(w) { w.dmg += 3; w.R += 6 / PX; w.life += 0.5; },
    update(w, dt) { if ((w.t -= dt) > 0) return; w.t = w.cd * P().haste; poison(P().x, P().z, A(w.R) * (w.evolved ? 1.6 : 1), w.dmg * (w.evolved ? 2 : 1), w.life * P().durMul, '#7ad04a'); } });
  def('slash', { name: '쌍검베기', icon: 'w_slash', desc: '바라보는 쪽을 넓게 베어요 (3단계부터 양쪽)', up: '데미지 +5, 범위 +0.45', max: 6, color: '#5adc8c',
    create: () => ({ dmg: 14, count: 1, cd: 1.0, t: 0.3, R: 135 / PX }), upgrade(w) { w.dmg += 5; w.R += 10 / PX; if (w.level === 3) w.count = 2; },
    update(w, dt) { if ((w.t -= dt) > 0) return; const e = tgt(A(w.R) + 2.5); if (!e) return; w.t = w.cd * P().haste; const a = aimAt(e);
      const col = w.evolved ? '#7affb0' : '#d8f0e4';
      const hits = arcStrike(a, A(w.R) * (w.evolved ? 1.4 : 1), 1.1, w.dmg, col, 8);
      if (w.count >= 2) later(0.08, () => arcStrike(a + Math.PI, A(w.R) * (w.evolved ? 1.4 : 1), 1.1, w.dmg, col, 8, { side: -1 }));
      if (hits >= 4) G.word('cut', P().x + Math.cos(a) * 2, P().y, P().z + Math.sin(a) * 2, hits >= 8);
      G.heroSwing(); } });
  def('icicle', { name: '빙설', icon: 'w_icicle', desc: '하늘에서 얼음 송곳을 떨어뜨려 적을 얼려요', up: '얼음 +1, 데미지 +4', max: 6, color: '#aee6ff',
    create: () => ({ dmg: 15, count: 2, cd: 1.3, t: 0.5, R: 32 / PX }), upgrade(w) { w.count++; w.dmg += 4; },
    update(w, dt) { if ((w.t -= dt) > 0) return; const pool = shuffle(G.nearestN(16, 14)); if (!pool.length) return; w.t = w.cd * P().haste;
      for (const e of pool.slice(0, w.count + (w.evolved ? 5 : 0))) icicleDrop(e.x, e.z, A(w.R) * (w.evolved ? 1.5 : 1), w.dmg); } });
  def('tornado', { name: '회오리', icon: 'w_tornado', desc: '적 무리를 휩쓸며 떠도는 회오리를 일으켜요', up: '데미지 +4, 크기 +0.17, 2단계마다 회오리 +1', max: 6, color: '#a0f0d0',
    create: () => ({ dmg: 8, count: 1, cd: 2.4, t: 0.8, R: 30 / PX, life: 3 }), upgrade(w) { w.dmg += 4; w.R += 4 / PX; if (w.level % 2 === 0) w.count++; },
    update(w, dt) { if ((w.t -= dt) > 0) return; if (!tgt(18)) return; w.t = w.cd * P().haste;
      for (let i = 0; i < w.count + (w.evolved ? 2 : 0); i++) { const a = rnd(0, TAU), R = A(w.R) * (w.evolved ? 1.6 : 1);
        const s = shoot({ kind: 'wander', x: P().x, z: P().z, vx: Math.cos(a) * 4.8, vz: Math.sin(a) * 4.8, life: w.life * P().durMul * (w.evolved ? 2 : 1), dmg: w.dmg, r: R + 0.3, pierce: 999, rehit: 0.4, ground: 0.2, push: 3 });
        s.trailT = 99; s.funnel = 0;
        const tick = () => { if (s.life <= 0) return; for (let k = 0; k < (G.lowFx() ? 2 : 4); k++) { const h = k * 0.9, rr = R * (0.45 + k * 0.25), aa = G.time * 9 + k * 1.7; FX.sprite(s.x + Math.cos(aa) * rr * 0.5, s.y + h, s.z + Math.sin(aa) * rr * 0.5, { tex: 'smoke', color: '#c8f0e0', blend: 'normal', size: rr * 1.6, life: 0.28, grow: 1.3, fade: 'out', opacity: 0.55, spin: 8 }); } FX.sprite(s.x, s.y + 1.4, s.z, { tex: 'streak', color: '#a0f0d0', size: R * 2.2, aspect: 0.6, life: 0.12, rot: G.time * 12, opacity: 0.7 }); later(0.06, tick); };
        tick(); } } });
  def('mine', { name: '지뢰부', icon: 'w_mine', desc: '발밑에 부적을 깔아두면 적이 밟을 때 터져요', up: '데미지 +10, 폭발 범위 +0.35', max: 6, color: '#e84ad2',
    create: () => ({ dmg: 30, R: 70 / PX, cd: 1.4, t: 0.4 }), upgrade(w) { w.dmg += 10; w.R += 8 / PX; },
    update(w, dt) { if ((w.t -= dt) > 0) return; w.t = w.cd * P().haste; if (mines.length >= 10) { kill3(mines[0].vis); mines.shift(); }
      const y = G.H(P().x, P().z), vis = flatMesh('talisman', '#ffffff', 0.9, 0.9, false); vis.position.set(P().x, y + 0.15, P().z); vis.rotation.set(-Math.PI / 2, rnd(0, TAU), 0);
      mines.push({ x: P().x, z: P().z, arm: 0.3, life: 10 * P().durMul, dmg: w.dmg, R: A(w.R) * (w.evolved ? 1.4 : 1), vis, color: '#e84ad2', pull: w.evolved }); } });
  // sword & fist forms grow with level (2D: with realm)
  const formStage = (w, steps) => { const lv = w.level + (w.evolved ? 1 : 0) + (P().formBonus || 0); let i = 0; while (i + 1 < steps.length && steps[i + 1] <= lv) i++; return i; };
  def('geomsul', { name: '검술', icon: 'w_geomsul', desc: '눈앞을 베는 검술. 단련할수록 검기 → 검사 → 검강 → 이기어검으로 뻗어 나가요', up: '데미지 +6, 대기시간 -6%', max: 6, color: '#40c8d2',
    create: () => ({ dmg: 17, cd: 0.8, t: 0.2, R: 112 / PX, swings: 0 }), upgrade(w) { w.dmg += 6; w.cd *= 0.94; },
    update(w, dt) { if ((w.t -= dt) > 0) return; const st = formStage(w, [0, 2, 3, 4, 6]); const e = tgt(st >= 2 ? 18 : A(w.R) + 2.6); if (!e) return; w.t = w.cd * P().haste;
      const a = aimAt(e), col = w.evolved ? '#ffe08a' : G.heroColor();
      const hits = arcStrike(a, A(w.R) * (st >= 1 ? 1.4 : 1), st >= 1 ? 1.5 : 1.25, w.dmg * (st >= 1 ? 1.15 : 1), col, 10, { side: w.swings % 2 ? -1 : 1 });
      w.swings++;
      if (P().issen && w.swings % 8 === 0) { lineStrike(a, 30, 1.0, w.dmg * 4, '#ffd76a', null, { vis: 1.5, life: 0.45 }); lineStrike(a + Math.PI, 30, 1.0, w.dmg * 4, '#ffd76a', null, { vis: 1.5, life: 0.45 }); G.impact(0.06); G.shake(0.6); G.text(P().x, P().y + 3.5, P().z, '일섬!', '#ffd76a', 34, 0.8, true); }
      for (let i = 0; i < 1 + P().extra; i++) { const b = a + (i - P().extra / 2) * 0.3;
        if (st === 2) lineStrike(b, 300 / PX, 0.3, w.dmg * 0.8, col, null, { vis: 0.35 });
        if (st >= 3) wave(b, w.dmg * 1.6, 18.7, A(1.05), 0.9, col); }
      if (st >= 4) for (let i = 0; i < 2 + P().extra; i++) { const b = a + Math.PI + (i - 0.5) * 1.2; shoot({ kind: 'homing', x: P().x, z: P().z, vx: Math.cos(b) * 13, vz: Math.sin(b) * 13, life: 2.2, dmg: w.dmg * 1.2, r: 0.5, pierce: 3 + P().pierce, tex: 'sword', flat: true, w: 1.6, h: 0.85, color: '#e8f0ff', add: false, glowSize: 1.2, trail: 0.7, trailTex: 'streak', turn: 8 }); }
      if (hits >= 5) G.word('cut', P().x + Math.cos(a) * 2, P().y, P().z + Math.sin(a) * 2, hits >= 9);
      G.heroSwing(); } });
  def('gwonbeop', { name: '권법', icon: 'w_gwonbeop', desc: '눈앞을 치는 권법. 단련할수록 권풍 → 권강 → 백보신권으로 멀리 닿아요', up: '데미지 +7, 밀쳐내기 증가', max: 6, color: '#ffbe46',
    create: () => ({ dmg: 20, cd: 0.62, t: 0.2, R: 92 / PX, push: 18 }), upgrade(w) { w.dmg += 7; w.push += 4; },
    update(w, dt) { if ((w.t -= dt) > 0) return; const st = formStage(w, [0, 2, 4, 5]); const e = tgt(st >= 3 ? 24 : st >= 2 ? 18 : A(w.R) + 2.2); if (!e) return; w.t = w.cd * P().haste;
      const a = aimAt(e), R = A(w.R), col = w.evolved ? '#ffd040' : '#ffbe46';
      const fx = P().x + Math.cos(a) * R * 0.8, fz = P().z + Math.sin(a) * R * 0.8;
      FX.plane(fx, ch(), fz, { tex: 'palm', color: col, size: 1.6, life: 0.22, grow: 1.6, yaw: a, tilt: 1.2, fade: 'flash' });
      arcStrike(a, R, 1.05, w.dmg, col, w.push);
      if (st >= 1) { const bx = P().x + Math.cos(a) * R * 1.3, bz = P().z + Math.sin(a) * R * 1.3; blast(bx, bz, A(2), w.dmg * 0.8, col, w.push + 10); FX.sprite(bx, G.H(bx, bz) + 1, bz, { tex: 'glow', color: col, size: 2.5, life: 0.2, grow: 1.5 }); }
      if (st >= 2) for (let i = 0; i < 1 + P().extra; i++) wave(a + (i - P().extra / 2) * 0.3, w.dmg * 1.5, 20, A(0.87), 0.8, col, { tex: 'palm', w: 1.8, h: 1.8, tilt: 1.0 });
      if (st >= 3) { const pool = G.nearestN(12, 24); for (let k = 0; k < Math.min(pool.length, 2 + P().extra); k++) { const o = pick(pool); FX.beam(P().x, ch(), P().z, o.x, eY(o), o.z, '#ffd76a', 0.4, 0.2); FX.explode(o.x, o.y, o.z, A(3), '#ffd76a'); blast(o.x, o.z, A(3), w.dmg * 2.2, '#ffd76a', 24, null, { fx: false }); } }
      G.heroSwing('punch'); } });
  def('cheonoe', { name: '천외비선', icon: 'w_cheonoe', secret: true, desc: '하늘 밖에서 검이 비처럼 떨어져 적을 꿰뚫어요 (숨겨진 무공)', up: '검 +1, 데미지 +8', max: 6, color: '#ffe08a',
    create: () => ({ dmg: 30, count: 4, cd: 2.4, t: 0.5 }), upgrade(w) { w.count++; w.dmg += 8; },
    update(w, dt) { if ((w.t -= dt) > 0) return; const pool = G.nearestN(30, 20); if (!pool.length) return; w.t = w.cd * P().haste;
      for (let i = 0; i < w.count + P().extra; i++) { const e = pick(pool); later(i * 0.06, () => swordDrop(e.x, e.z, A(2), w.dmg, '#ffe08a', 2.6)); } } });

  // helpers used by several arts
  function poison(x, z, R, dmg, life, color) {
    zone({ x, z, R, life, tick: 0.5, dmg, color, slow: 0.3,
      puff: (zz, dt) => { if ((zz.pt = (zz.pt || 0) - dt) > 0) return; zz.pt = G.lowFx() ? 0.3 : 0.15; const a = rnd(0, TAU), r = rnd(0, zz.R); FX.sprite(zz.x + Math.cos(a) * r, G.H(zz.x, zz.z) + 0.4, zz.z + Math.sin(a) * r, { tex: 'smoke', color, blend: 'normal', size: zz.R * rnd(0.8, 1.3), life: 1.0, vel: [0, 0.4, 0], grow: 1.3, fade: 'hold', opacity: 0.42 }); } });
    FX.ground(x, G.H(x, z), z, { tex: 'ring', color, size: R * 2, life, fade: 'hold', opacity: 0.35, order: 1 });
  }
  const shardGeo = new THREE.ConeGeometry(0.25, 1.6, 5), shardMat = new THREE.MeshLambertMaterial({ color: '#d8f0ff', emissive: '#4a7aa0', transparent: true, opacity: 0.95 });
  function icicleDrop(x, z, R, dmg, color = '#aee6ff') {
    const y = G.H(x, z);
    FX.ground(x, y, z, { tex: 'ring', color, size: R * 2, life: 0.4, opacity: 0.5, fade: 'lin' });
    const shard = new THREE.Mesh(shardGeo, shardMat);
    shard.rotation.x = Math.PI; scene.add(shard);
    let t = 0;
    const fall = () => { t += 1 / 60; const k = Math.min(1, t / 0.32); shard.position.set(x, y + 0.8 + (1 - k * k) * 12, z); if (k < 1) later(1 / 60, fall); else { scene.remove(shard); FX.shockwave(x, y, z, R * 1.2, color, { life: 0.35 }); FX.ground(x, y, z, { tex: 'flake', color, size: R * 2.2, life: 1.2, fade: 'out', opacity: 0.8, order: 1 }); for (let i = 0; i < (G.lowFx() ? 3 : 7); i++) { const a = rnd(0, TAU); FX.sprite(x, y + 0.5, z, { tex: 'flake', color: '#ffffff', size: 0.45, life: 0.5, vel: [Math.cos(a) * 5, rnd(3, 6), Math.sin(a) * 5], grav: 14, fade: 'out', spin: 6 }); } G.inRadius(x, z, R, (e) => { G.hurt(e, dmg, 0, 0, { color }); e.chill = Math.max(e.chill || 0, 1.5); }); } };
    fall();
  }
  function swordDrop(x, z, R, dmg, color, size = 2) {
    const y = G.H(x, z);
    FX.ground(x, y, z, { tex: 'ring', color, size: R * 2, life: 0.3, opacity: 0.6, fade: 'lin' });
    const s = flatMesh('sword', '#ffffff', size * 1.8, size * 0.9, false);
    s.rotation.set(0, Math.random() * TAU, -Math.PI / 2);
    let t = 0;
    const fall = () => { t += 1 / 60; const k = Math.min(1, t / 0.22); s.position.set(x, y + size * 0.6 + (1 - k * k) * 14, z); if (k < 1) later(1 / 60, fall); else { later(0.5, () => kill3(s)); FX.explode(x, y, z, R, color, { smoke: false }); FX.pillar(x, y, z, color, 10, 0.8, 0.3); blast(x, z, R, dmg, color, 12, null, { fx: false }); } };
    fall();
  }
  function palmDrop(x, z, R, dmg, color) {
    const y = G.H(x, z);
    FX.ground(x, y, z, { tex: 'palm', color, size: R * 2.2, life: 0.45, opacity: 0.35, fade: 'lin' });
    const p = flatMesh('palm', color, R * 2.4, R * 2.4); p.rotation.set(-Math.PI / 2, 0, 0);
    let t = 0;
    const fall = () => { t += 1 / 60; const k = Math.min(1, t / 0.45); p.position.set(x, y + 0.3 + (1 - k * k) * 10, z); p.material.opacity = 0.4 + k * 0.6; if (k < 1) later(1 / 60, fall); else { later(0.15, () => kill3(p)); FX.explode(x, y, z, R, color); FX.ground(x, y, z, { tex: 'palm', color: '#3a2a10', blend: 'normal', size: R * 2.2, life: 1.6, fade: 'out', opacity: 0.4, order: 1 }); blast(x, z, R, dmg, color, 20, null, { fx: false }); G.shake(0.5); G.impact(0.04); G.word('hit', x, y, z, true); } };
    fall();
  }

  // ---------- sect arts ----------
  def('plum', { sect: 'hwasan', name: '매화검법', icon: 'w_plum', desc: '매화 꽃잎 같은 검기를 부채꼴로 흩뿌려요', up: '꽃잎 +2, 데미지 +3', max: 6, color: '#ff8ab4',
    create: () => ({ dmg: 7, count: 5, cd: 1.1, t: 0.3 }), upgrade(w) { w.count += 2; w.dmg += 3; },
    update(w, dt) { if ((w.t -= dt) > 0) return; const e = tgt(20); if (!e) return; w.t = w.cd * P().haste; const b = aimAt(e), k = w.count + P().extra;
      for (let i = 0; i < k; i++) { const a = b + (i - (k - 1) / 2) * (1.6 / Math.max(1, k - 1)); shoot({ x: P().x, z: P().z, vx: Math.cos(a) * 18, vz: Math.sin(a) * 18, life: 0.9, dmg: w.dmg, r: 0.4, pierce: 2 + P().pierce, tex: 'petal', size: 0.8, spin: 14, color: '#ffc0d8', add: false, glowSize: 1.0, trail: 0.55, trailTex: 'petal', trailLife: 0.4 }); }
      G.heroSwing(); } });
  def('plumrain', { sect: 'hwasan', name: '매화낙영', icon: 'w_plumrain', desc: '적 머리 위로 매화가 비처럼 떨어져요', up: '꽃비 +2, 데미지 +3', max: 6, color: '#ff8ab4',
    create: () => ({ dmg: 10, count: 4, cd: 1.4, t: 0.6, R: 28 / PX }), upgrade(w) { w.count += 2; w.dmg += 3; },
    update(w, dt) { if ((w.t -= dt) > 0) return; const pool = shuffle(G.nearestN(16, 15)); if (!pool.length) return; w.t = w.cd * P().haste;
      for (const e of pool.slice(0, w.count)) { const x = e.x, z = e.z, y = G.H(x, z); for (let i = 0; i < (G.lowFx() ? 3 : 6); i++) FX.sprite(x + rnd(-1, 1), y + rnd(5, 8), z + rnd(-1, 1), { tex: 'petal', color: pick(['#ffc0d8', '#ffffff', '#ff7aa8']), size: 0.6, life: 0.4, vel: [0, -16, 0], spin: 10, fade: 'out' });
        later(0.35, () => { FX.shockwave(x, y, z, A(w.R) * 2, '#ff8ab4', { life: 0.3 }); FX.ground(x, y, z, { tex: 'petal', color: '#ff9fc0', size: 1.2, life: 1.0, fade: 'out', opacity: 0.8, spin: 1 }); G.inRadius(x, z, A(w.R) * 1.6, (o) => G.hurt(o, w.dmg, 0, 0, { color: '#ff8ab4' })); }); } } });
  def('taiji', { sect: 'mudang', name: '태극검', icon: 'w_taiji', desc: '음양의 검이 몸 주위를 크게 돌며 베어요', up: '데미지 +5, 반경 증가 (4단계에 4자루)', max: 6, color: '#a8ccff',
    create: () => ({ dmg: 14, count: 2, dist: 90 / PX, ang: 0, hits: new Map(), discs: [] }), upgrade(w) { w.dmg += 5; w.dist += 10 / PX; if (w.level === 4) w.count = 4; },
    update(w, dt) { w.ang += dt * 3.2; const cnt = w.evolved ? 6 : w.count, R = A(w.dist + (w.evolved ? 1.7 : 0));
      while (w.discs.length < cnt) { const d = flatMesh('taiji', '#ffffff', 1.4, 1.4, false); d.material.opacity = 0.95; w.discs.push({ d, g: spriteObj('glow', '#a8ccff', 2.4) }); }
      for (const [e, t] of w.hits) { if (t <= dt) w.hits.delete(e); else w.hits.set(e, t - dt); }
      w.discs.forEach((o, i) => { const a = w.ang + (i / cnt) * TAU, x = P().x + Math.cos(a) * R, z = P().z + Math.sin(a) * R, y = ch();
        o.d.position.set(x, y, z); o.d.rotation.set(-Math.PI / 2 + 0.8, 0, G.time * 6); o.g.position.set(x, y, z);
        if (!G.lowFx() && Math.random() < 0.4) FX.sprite(x, y, z, { tex: 'glow', color: '#a8ccff', size: 0.9, life: 0.25, grow: 0.3, fade: 'out', opacity: 0.6 });
        G.inRadius(x, z, 0.75, (e) => { if (w.hits.has(e)) return; w.hits.set(e, 0.35); G.hurt(e, w.dmg, (e.x - P().x) * 2, (e.z - P().z) * 2, { color: '#a8ccff' }); }); }); } });
  def('yangui', { sect: 'mudang', name: '양의검진', icon: 'w_yangui', desc: '검진이 적을 안쪽으로 끌어당기며 베어요', up: '범위 +0.5, 데미지 +3', max: 6, color: '#c8dcff',
    create: () => ({ dmg: 6, R: 120 / PX, pull: 70 / PX }), upgrade(w) { w.R += 12 / PX; w.dmg += 3; },
    update(w, dt) { const R = A(w.R); if (!w.z || w.z.life <= 0) w.z = zone({ x: P().x, z: P().z, R, life: 9999, tick: 0.5, dmg: w.dmg, color: '#c8dcff', pull: w.pull, follow: true, rune: true, runeSpin: -1.2 }); w.z.R = R; w.z.dmg = w.dmg; if (w.z.runeFx) { w.z.runeFx.t = 0.3; w.z.runeFx.obj.scale.setScalar(R * 2); } } });
  def('yeorae', { sect: 'sorim', name: '여래신장', icon: 'w_yeorae', desc: '하늘에서 거대한 금빛 손바닥을 내리쳐요', up: '데미지 +12, 범위 증가', max: 6, color: '#ffd25a',
    create: () => ({ dmg: 40, count: 1, R: 90 / PX, cd: 2.8, t: 1 }), upgrade(w) { w.dmg += 12; w.R += 10 / PX; },
    update(w, dt) { if ((w.t -= dt) > 0) return; const pool = shuffle(G.nearestN(12, 16)); if (!pool.length) return; w.t = w.cd * P().haste;
      for (const e of pool.slice(0, w.count)) palmDrop(e.x, e.z, A(w.R), w.dmg, '#ffd25a'); } });
  def('geumgang', { sect: 'sorim', name: '금강신공', icon: 'w_geumgang', desc: '잠시 금강불괴가 되어 피해를 받지 않고 주변을 쳐내요', up: '데미지 +8, 무적 +0.2초', max: 6, color: '#ffd25a',
    create: () => ({ dmg: 20, R: 100 / PX, cd: 7, t: 3, guard: 1.2 }), upgrade(w) { w.dmg += 8; w.guard += 0.2; },
    update(w, dt) { if ((w.t -= dt) > 0) return; w.t = w.cd * P().haste; P().inv = Math.max(P().inv, w.guard);
      FX.sprite(P().x, ch(), P().z, { tex: 'glow', color: '#ffd25a', size: 5, life: w.guard, fade: 'hold', opacity: 0.5, follow: () => ({ x: P().x, y: ch(), z: P().z }) });
      FX.sprite(P().x, ch(), P().z, { tex: 'ring', color: '#fff0b0', size: 4, life: w.guard, fade: 'hold', opacity: 0.8, spin: 2, follow: () => ({ x: P().x, y: ch(), z: P().z }) });
      FX.pillar(P().x, G.H(P().x, P().z), P().z, '#ffd25a', 14, 1.4, 0.5);
      blast(P().x, P().z, A(w.R), w.dmg, '#ffd25a', 20); G.text(P().x, P().y + 3.4, P().z, '금강불괴!', '#ffe08a', 26, 0.8, true); } });
  def('tagu', { sect: 'gaebang', name: '타구봉법', icon: 'w_tagu', desc: '봉을 한 바퀴 휘둘러 둘러싼 적을 쳐내요', up: '데미지 +5, 범위 +0.35', max: 6, color: '#8ae05a',
    create: () => ({ dmg: 13, R: 105 / PX, cd: 1.2, t: 0.4 }), upgrade(w) { w.dmg += 5; w.R += 8 / PX; },
    update(w, dt) { if ((w.t -= dt) > 0) return; const R = A(w.R) * (w.evolved ? 1.5 : 1); if (!tgt(R + 1)) return; w.t = w.cd * P().haste * (w.evolved ? 0.6 : 1);
      for (const s of [0, Math.PI]) FX.slash(P().x, ch() - 0.6, P().z, s + G.time * 3, R, '#b8f090', { tilt: 0.05, spin: 9, life: 0.3 });
      blast(P().x, P().z, R, w.dmg * (w.evolved ? 2 : 1), '#8ae05a', 20, null, { fx: false });
      for (let i = 0; i < (G.lowFx() ? 3 : 8); i++) { const a = rnd(0, TAU); FX.sprite(P().x + Math.cos(a) * R, G.H(P().x, P().z) + 0.6, P().z + Math.sin(a) * R, { tex: 'petal', color: '#8ae05a', size: 0.5, life: 0.5, vel: [Math.cos(a) * 4, 3, Math.sin(a) * 4], grav: 8, spin: 8, fade: 'out' }); }
      G.heroSwing(); } });
  def('bottle', { sect: 'gaebang', name: '취팔선 술병', icon: 'w_bottle', desc: '술병을 던지면 터지며 다른 적에게 튕겨 가요', up: '데미지 +5, 2단계마다 튕김 +1', max: 6, color: '#ffb050',
    create: () => ({ dmg: 18, bounces: 2, cd: 1.6, t: 0.5, R: 50 / PX }), upgrade(w) { w.dmg += 5; if (w.level % 2 === 0) w.bounces++; },
    update(w, dt) { if ((w.t -= dt) > 0) return; const e = tgt(18); if (!e) return; w.t = w.cd * P().haste;
      const throwAt = (sx, sz, t, left) => lob({ sx, sz, sy: sx === P().x ? ch() : G.H(sx, sz) + 0.5, tx: t.x, tz: t.z, dur: 0.42, h: 3.5, tex: 'flame', color: '#ffb050', size: 0.9, spin: 12, land: (x, y, z) => { FX.explode(x, y, z, A(w.R), '#ffa040'); G.inRadius(x, z, A(w.R), (o) => G.hurt(o, w.dmg, (o.x - x) * 2, (o.z - z) * 2, { color: '#ffa040' })); if (left > 0) { const nx = G.nearestN(4, 9, x, z).find((o) => Math.hypot(o.x - x, o.z - z) > 1); if (nx) throwAt(x, z, nx, left - 1); } } });
      throwAt(P().x, P().z, e, w.bounces + (w.evolved ? 3 : 0)); } });
  def('needles', { sect: 'dang', name: '만천화우', icon: 'w_needles', desc: '사방으로 암기를 비처럼 뿌려요', up: '암기 +3, 데미지 +2', max: 6, color: '#c8a0ff',
    create: () => ({ dmg: 6, count: 10, cd: 1.5, t: 0.4 }), upgrade(w) { w.count += 3; w.dmg += 2; },
    update(w, dt) { if ((w.t -= dt) > 0) return; if (!tgt(18)) return; w.t = w.cd * P().haste; const k = w.count + P().extra * 3 + (w.evolved ? 16 : 0);
      for (let i = 0; i < k; i++) { const a = (i / k) * TAU + rnd(-0.05, 0.05); shoot({ x: P().x, z: P().z, vx: Math.cos(a) * 20.4, vz: Math.sin(a) * 20.4, life: 0.75, dmg: w.dmg, r: 0.35, pierce: 1 + P().pierce, tex: 'streak', flat: true, w: 1.2, h: 0.35, tilt: 0.6, color: '#e0d0ff', trail: 0.3, trailTex: 'glow', dot: true }); }
      FX.sprite(P().x, ch(), P().z, { tex: 'ring', color: '#c8a0ff', size: 2, life: 0.25, grow: 2.5 }); } });
  def('dokmu', { sect: 'dang', name: '당가독무', icon: 'w_dokmu', desc: '적 무리 한가운데 맹독 안개를 피워요', up: '데미지 +3, 안개 크기 +0.35', max: 6, color: '#8ae05a',
    create: () => ({ dmg: 7, R: 60 / PX, life: 4, cd: 1.6, t: 0.5 }), upgrade(w) { w.dmg += 3; w.R += 8 / PX; },
    update(w, dt) { if ((w.t -= dt) > 0) return; const e = tgt(16); if (!e) return; w.t = w.cd * P().haste;
      lob({ sx: P().x, sz: P().z, tx: e.x, tz: e.z, dur: 0.4, h: 3, tex: 'glow', color: '#8ae05a', size: 0.8, land: (x, y, z) => { FX.explode(x, y, z, A(w.R), '#8ae05a', { smokeColor: '#4a7a3a', scorch: '#1a2a14' }); poison(x, z, A(w.R), w.dmg, w.life * P().durMul, '#6ac04a'); } }); } });
  def('skysword', { sect: 'namgung', name: '창궁검우', icon: 'w_skysword', desc: '하늘에서 거대한 검을 떨어뜨려요', up: '검 +1, 데미지 +6', max: 6, color: '#ffe08a',
    create: () => ({ dmg: 28, count: 1, cd: 1.8, t: 0.6, R: 40 / PX }), upgrade(w) { w.count++; w.dmg += 6; },
    update(w, dt) { if ((w.t -= dt) > 0) return; const pool = shuffle(G.nearestN(16, 16)); if (!pool.length) return; w.t = w.cd * P().haste;
      pool.slice(0, w.count + (w.evolved ? 6 : 0)).forEach((e, i) => later(i * 0.07, () => swordDrop(e.x, e.z, A(w.R) * (w.evolved ? 1.5 : 1), w.dmg, '#ffe08a', 2.6))); } });
  def('jewang', { sect: 'namgung', name: '제왕검형', icon: 'w_jewang', desc: '제왕의 위엄이 담긴 굵은 금빛 검강을 쏘아요', up: '데미지 +9, 굵기 증가', max: 6, color: '#ffd25a',
    create: () => ({ dmg: 26, width: 24 / PX, L: 420 / PX, cd: 2.3, t: 0.6 }), upgrade(w) { w.dmg += 9; w.width += 4 / PX; },
    update(w, dt) { if ((w.t -= dt) > 0) return; const e = tgt(w.L); if (!e) return; w.t = w.cd * P().haste; const a = aimAt(e);
      lineStrike(a, w.L, w.width, w.dmg, '#ffd25a', null, { vis: w.width * 1.6, life: 0.4 });
      FX.slash(P().x, ch() - 0.4, P().z, a, 2.4, '#ffe08a', { tilt: 0.3 }); G.shake(0.3); G.heroSwing(); } });
  def('binbaek', { sect: 'bukhae', name: '빙백신장', icon: 'w_binbaek', desc: '얼음 장력을 터뜨려 주변 적을 꽁꽁 얼려요', up: '데미지 +5, 범위 +0.5', max: 6, color: '#bfe6ff',
    create: () => ({ dmg: 12, R: 100 / PX, cd: 1.7, t: 0.6, freeze: 2 }), upgrade(w) { w.dmg += 5; w.R += 12 / PX; },
    update(w, dt) { if ((w.t -= dt) > 0) return; const R = A(w.R) + (w.evolved ? 3.5 : 0); if (!tgt(R + 1.2)) return; w.t = w.cd * P().haste;
      const y = G.H(P().x, P().z);
      FX.ground(P().x, y, P().z, { tex: 'palm', color: '#dff4ff', size: 2.2, life: 0.3, grow: 1.5 });
      FX.shockwave(P().x, y, P().z, R, '#bfe6ff', { life: 0.5 });
      FX.ground(P().x, y, P().z, { tex: 'flake', color: '#e0f4ff', size: R * 2, life: 1.0, fade: 'out', opacity: 0.55, spin: 0.5, order: 1 });
      blast(P().x, P().z, R, w.dmg * (w.evolved ? 2 : 1), '#bfe6ff', 0, (e) => { e.chill = Math.max(e.chill || 0, w.evolved ? 4 : w.freeze); FX.sprite(e.x, eY(e), e.z, { tex: 'flake', color: '#ffffff', size: 1.2, life: 0.5, spin: 3, fade: 'out' }); }, { fx: false }); } });
  def('hanbing', { sect: 'bukhae', name: '한빙기', icon: 'w_hanbing', desc: '몸에서 냉기를 뿜어 주변 적을 느리게 하고 얼려요', up: '범위 +0.5, 데미지 +2', max: 6, color: '#cfeaff',
    create: () => ({ dmg: 4, R: 90 / PX }), upgrade(w) { w.R += 12 / PX; w.dmg += 2; },
    update(w, dt) { const R = A(w.R); if (!w.z || w.z.life <= 0) w.z = zone({ x: P().x, z: P().z, R, life: 9999, tick: 0.5, dmg: w.dmg, color: '#cfeaff', slow: 0.4, follow: true, onTick: (e) => { e.chill = Math.max(e.chill || 0, 0.6); }, puff: (zz) => { if (Math.random() < (G.lowFx() ? 0.15 : 0.4)) { const a = rnd(0, TAU), r = rnd(0.5, zz.R); FX.sprite(zz.x + Math.cos(a) * r, G.H(zz.x, zz.z) + rnd(0.2, 1.8), zz.z + Math.sin(a) * r, { tex: 'flake', color: '#e8f6ff', size: 0.4, life: 0.9, vel: [Math.cos(a + 1.6) * 3, 0.3, Math.sin(a + 1.6) * 3], spin: 4, fade: 'out' }); } } }); w.z.R = R; w.z.dmg = w.dmg; } });
  def('cheonmasingong', { sect: 'magyo', name: '천마신공', icon: 'w_cheonmasingong', desc: '붉은 마기를 폭발시키고, 맞은 적 수만큼 HP를 흡수해요', up: '데미지 +8, 범위 +0.5', max: 6, color: '#e01e32',
    create: () => ({ dmg: 22, R: 130 / PX, cd: 1.5, t: 0.6 }), upgrade(w) { w.dmg += 8; w.R += 12 / PX; },
    update(w, dt) { if ((w.t -= dt) > 0) return; const R = A(w.R) + (w.evolved ? 4.3 : 0); if (!tgt(R)) return; w.t = w.cd * P().haste;
      const y = G.H(P().x, P().z);
      FX.sprite(P().x, ch(), P().z, { tex: 'glow', color: '#ff2040', size: R * 1.2, life: 0.35, grow: 1.3 });
      FX.ground(P().x, y, P().z, { tex: 'shock', color: '#ff3040', size: R * 0.4, grow: 2.6, life: 0.45, fade: 'out' });
      FX.ground(P().x, y, P().z, { tex: 'crack', color: '#ff2a3a', size: R * 1.8, life: 0.7, fade: 'out', opacity: 0.9 });
      for (let i = 0; i < (G.lowFx() ? 4 : 10); i++) { const a = rnd(0, TAU); FX.sprite(P().x, ch(), P().z, { tex: 'smoke', color: '#2a0810', blend: 'normal', size: 2, life: 0.6, vel: [Math.cos(a) * R * 1.4, rnd(1, 3), Math.sin(a) * R * 1.4], drag: 3, grow: 1.8, fade: 'out', opacity: 0.6 }); }
      const hits = blast(P().x, P().z, R, w.dmg * (w.evolved ? 2.2 : 1), '#ff3040', 14, null, { fx: false }); G.heal(Math.min(5, hits * 0.5)); G.shake(0.3); } });
  def('hyeolma', { sect: 'magyo', name: '혈마검', icon: 'w_hyeolma', desc: '앞뒤로 핏빛 검기를 날리고, 벤 만큼 HP를 흡수해요', up: '데미지 +7 (3단계부터 네 방향)', max: 6, color: '#ff2a3a',
    create: () => ({ dmg: 20, dirs: 2, L: 320 / PX, width: 14 / PX, cd: 1.8, t: 0.6 }), upgrade(w) { w.dmg += 7; if (w.level === 3) w.dirs = 4; },
    update(w, dt) { if ((w.t -= dt) > 0) return; const e = tgt(w.L); if (!e) return; w.t = w.cd * P().haste; const b = aimAt(e);
      for (let i = 0; i < w.dirs; i++) { const a = b + (i / w.dirs) * TAU; lineStrike(a, w.L, w.width, w.dmg, '#ff2a3a', () => G.heal(0.3), { vis: 0.8 }); FX.slash(P().x, ch() - 0.4, P().z, a, 2.2, '#ff4a5a', { tilt: 0.3 }); }
      G.heroSwing(); } });
  def('emeija', { sect: 'aemi', name: '아미자', icon: 'w_emeija', desc: '양손의 아미자를 던졌다가 다시 받아요', up: '데미지 +4, 2단계마다 아미자 +1', max: 6, color: '#d8c0ff',
    create: () => ({ dmg: 10, count: 2, cd: 0.9, t: 0.3, range: 170 / PX }), upgrade(w) { w.dmg += 4; if (w.level % 2 === 0) w.count++; },
    update(w, dt) { if ((w.t -= dt) > 0) return; const e = tgt(16); if (!e) return; w.t = w.cd * P().haste; const b = aimAt(e), k = w.count + P().extra + (w.evolved ? 4 : 0);
      for (let i = 0; i < k; i++) { const a = b + (i - (k - 1) / 2) * 0.35; shoot({ kind: 'boomerang', x: P().x, z: P().z, vx: Math.cos(a) * 23.5, vz: Math.sin(a) * 23.5, life: 3, range: A(w.range) * (w.evolved ? 1.5 : 1), dmg: w.dmg, r: 0.45, pierce: 999, tex: 'streak', flat: true, w: 1.3, h: 0.4, tilt: 0.6, color: '#efe4ff', glowSize: 0.9, trail: 0.4, trailTex: 'glow', spin: 0 }); } } });
  def('geumjeong', { sect: 'aemi', name: '금정불광', icon: 'w_geumjeong', desc: '금빛 불광으로 자신을 치유하고 주변 적을 밀어내요', up: '회복 +2, 데미지 +5', max: 6, color: '#ffd76a',
    create: () => ({ dmg: 15, R: 110 / PX, heal: 5, cd: 4, t: 2 }), upgrade(w) { w.heal += 2; w.dmg += 5; },
    update(w, dt) { if ((w.t -= dt) > 0) return; w.t = w.cd * P().haste; G.heal(w.heal);
      const y = G.H(P().x, P().z);
      FX.ground(P().x, y, P().z, { tex: 'lotus', color: '#ffe08a', size: 4, life: 0.9, grow: 1.4, fade: 'hold', opacity: 0.85 });
      FX.pillar(P().x, y, P().z, '#ffe08a', 12, 1.6, 0.6);
      blast(P().x, P().z, A(w.R), w.dmg, '#ffd76a', 22); G.text(P().x, P().y + 3.4, P().z, '+' + w.heal, '#8affb0', 20, 0.8); } });
  def('seolgeom', { sect: 'gonryun', name: '곤륜설검', icon: 'w_seolgeom', desc: '눈보라 같은 검기로 꿰뚫고 얼려요', up: '데미지 +6, 2단계마다 검기 +1', max: 6, color: '#c8e8ff',
    create: () => ({ dmg: 18, count: 1, L: 380 / PX, width: 13 / PX, cd: 1.7, t: 0.5 }), upgrade(w) { w.dmg += 6; if (w.level % 2 === 0) w.count++; },
    update(w, dt) { if ((w.t -= dt) > 0) return; const e = tgt(w.L); if (!e) return; w.t = w.cd * P().haste; const b = aimAt(e), k = n(w) + (w.evolved ? 2 : 0);
      for (let i = 0; i < k; i++) { const a = b + (i - (k - 1) / 2) * 0.3; lineStrike(a, w.L, w.width + (w.evolved ? 0.4 : 0), w.dmg, '#c8e8ff', (o) => { o.chill = 1.5; }, { vis: 0.8 }); for (let j = 1; j < (G.lowFx() ? 3 : 6); j++) FX.sprite(P().x + Math.cos(a) * j * 2.5, ch(), P().z + Math.sin(a) * j * 2.5, { tex: 'flake', color: '#ffffff', size: 0.5, life: 0.5, vel: [0, 1, 0], spin: 5, fade: 'out' }); }
      G.heroSwing(); } });
  def('leap', { sect: 'gonryun', name: '능공허도', icon: 'w_leap', desc: '허공을 밟고 뛰어올라 잠시 빨라지고, 내려설 때 바람을 일으켜요', up: '데미지 +5, 가속 시간 +0.3초', max: 6, color: '#e0f0ff',
    create: () => ({ dmg: 14, R: 90 / PX, boost: 1.5, cd: 3, t: 1 }), upgrade(w) { w.dmg += 5; w.boost += 0.3; },
    update(w, dt) { if ((w.t -= dt) > 0) return; if (!tgt(10) || P().air) return; w.t = w.cd * P().haste;
      G.leap(9); P().boostT = w.boost; FX.sprite(P().x, ch(), P().z, { tex: 'smoke', color: '#ffffff', blend: 'normal', size: 2.4, life: 0.5, grow: 1.6, fade: 'out', opacity: 0.6 });
      P().onLand = () => { const y = G.H(P().x, P().z); FX.shockwave(P().x, y, P().z, A(w.R), '#e0f0ff'); for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU; FX.sprite(P().x, y + 0.4, P().z, { tex: 'streak', color: '#ffffff', size: 1.2, aspect: 2.5, life: 0.35, vel: [Math.cos(a) * 12, 0, Math.sin(a) * 12], rot: -a, fade: 'out' }); } blast(P().x, P().z, A(w.R), w.dmg, '#e0f0ff', 18, null, { fx: false }); }; } });
  def('formation', { sect: 'jegal', name: '팔진도', icon: 'w_formation', desc: '적 무리 위에 진법을 펼쳐 발을 묶고 피해를 줘요', up: '데미지 +3, 진 크기 +0.45', max: 6, color: '#5ae0b8',
    create: () => ({ dmg: 6, R: 80 / PX, life: 5, cd: 3, t: 0.8 }), upgrade(w) { w.dmg += 3; w.R += 10 / PX; },
    update(w, dt) { if ((w.t -= dt) > 0) return; const e = tgt(18); if (!e) return; w.t = w.cd * P().haste; const R = A(w.R) * (w.evolved ? 2 : 1);
      FX.pillar(e.x, G.H(e.x, e.z), e.z, '#5ae0b8', 8, R * 0.8, 0.4);
      zone({ x: e.x, z: e.z, R, life: (w.life + (w.evolved ? 3 : 0)) * P().durMul, tick: 0.5, dmg: w.dmg * (w.evolved ? 2.2 : 1), color: '#5ae0b8', slow: 0.75, rune: true, runeSpin: 0.9 }); } });
  def('fan', { sect: 'jegal', name: '학우선', icon: 'w_fan', desc: '깃털 부채를 부쳐 적을 휩쓰는 바람을 날려요', up: '데미지 +4, 바람 +1', max: 6, color: '#e8fff8',
    create: () => ({ dmg: 9, count: 3, cd: 1.6, t: 0.5, R: 22 / PX }), upgrade(w) { w.dmg += 4; w.count++; },
    update(w, dt) { if ((w.t -= dt) > 0) return; const e = tgt(18); if (!e) return; w.t = w.cd * P().haste; const b = aimAt(e), k = w.count + P().extra;
      for (let i = 0; i < k; i++) { const a = b + (i - (k - 1) / 2) * 0.28; wave(a, w.dmg, 14, A(w.R) * 2.5, 1.0, '#e8fff8', { tex: 'crescent', w: 2, h: 2, tilt: 0.5, trail: 0.8, trailTex: 'feather', trailLife: 0.5, push: 14 }); }
      G.heroSwing(); } });

  // ---------- secret arts (비전, everyone) ----------
  def('eogeom', { name: '어검술', icon: 'w_eogeom', desc: '비검이 몸 주위를 돌다가 때가 되면 적에게 날아가 꿰뚫고 돌아와요', up: '비검 +1, 데미지 +5', max: 7, color: '#9fdcff',
    create: () => ({ dmg: 15, count: 3, dist: 2.8, ang: 0, launch: 2.4, t: 1.2, hits: new Map(), swords: [] }), upgrade(w) { w.count++; w.dmg += 5; },
    update(w, dt) {
      w.ang += dt * 2.3;
      for (const [e, t] of w.hits) { if (t <= dt) w.hits.delete(e); else w.hits.set(e, t - dt); }
      const cnt = Math.min(14, w.count + P().extra), R = w.dist * Math.sqrt(P().area), col = w.evolved ? '#ffd76a' : '#9fdcff';
      while (w.swords.length < cnt) w.swords.push({ m: flatMesh('sword', '#ffffff', 1.7, 0.9, false), g: spriteObj('glow', col, 1.4), mode: 'orbit', x: P().x, y: ch(), z: P().z, a: 0, tt: 0 });
      w.swords.forEach((s, i) => {
        const slot = w.ang + (i / cnt) * TAU, ox = P().x + Math.cos(slot) * R, oz = P().z + Math.sin(slot) * R, oy = ch() + 0.3;
        if (s.mode === 'orbit') { s.x = ox; s.y = oy; s.z = oz; s.a = slot + Math.PI / 2; G.inRadius(s.x, s.z, 0.6, (e) => { if (w.hits.has(e)) return; w.hits.set(e, 0.45); G.hurt(e, w.dmg * 0.5, e.x - P().x, e.z - P().z, { color: col }); }); }
        else if (s.mode === 'strike') {
          const e = s.target;
          if (!e || e.dead) s.mode = 'back';
          else { const dx = e.x - s.x, dy = eY(e) - s.y, dz = e.z - s.z, d = Math.hypot(dx, dy, dz) || 1, step = 42 * dt; s.a = Math.atan2(dz, dx);
            if (d <= step + e.r) { G.hurt(e, w.dmg, dx, dz, { color: col, big: true }); FX.slash(e.x, eY(e), e.z, s.a, 1.6, col, { tilt: 1.0, life: 0.2 }); if (w.evolved) { FX.explode(e.x, e.y, e.z, 2.4 * P().area, '#ffcf6a', { smoke: false }); G.inRadius(e.x, e.z, 2.4 * P().area, (o) => o !== e && G.hurt(o, w.dmg * 0.6, o.x - e.x, o.z - e.z)); } s.mode = 'back'; }
            else { s.x += dx / d * step; s.y += dy / d * step; s.z += dz / d * step; } }
          if ((s.tt -= dt) <= 0) { s.tt = 0.025; FX.sprite(s.x, s.y, s.z, { tex: 'streak', color: col, size: 0.9, aspect: 2.4, life: 0.18, rot: 0, fade: 'out', opacity: 0.8 }); }
        } else { const dx = ox - s.x, dy = oy - s.y, dz = oz - s.z, d = Math.hypot(dx, dy, dz) || 1, step = 48 * dt; s.a = Math.atan2(dz, dx); if (d <= step) s.mode = 'orbit'; else { s.x += dx / d * step; s.y += dy / d * step; s.z += dz / d * step; } }
        s.m.position.set(s.x, s.y, s.z); s.m.rotation.set(-Math.PI / 2 + 0.6, -s.a, 0); s.g.position.set(s.x, s.y, s.z); s.g.material.color.set(col);
      });
      if ((w.t -= dt) > 0) return;
      const pool = G.nearestN(cnt, 20); if (!pool.length) return;
      w.t = w.launch * P().haste;
      w.swords.forEach((s, i) => { if (s.mode === 'orbit') { s.mode = 'strike'; s.target = pool[i % pool.length]; } });
    } });
  def('saja', { name: '사자후', icon: 'w_saja', desc: '내공을 실은 일갈로 주변 적을 날려 보내고 기절시켜요', up: '범위 +0.7, 데미지 +8, 기절 +0.15초', max: 6, color: '#ffd88a',
    create: () => ({ dmg: 18, R: 6.5, stun: 1, cd: 5, t: 2 }), upgrade(w) { w.R += 0.7; w.dmg += 8; w.stun += 0.15; },
    update(w, dt) { if ((w.t -= dt) > 0) return; const R = w.R * P().area * (w.evolved ? 1.5 : 1); if (!tgt(R * 0.9)) return; w.t = w.cd * P().haste;
      const col = w.evolved ? '#ff7a4a' : '#ffd88a', y = G.H(P().x, P().z);
      for (let k = 0; k < 3; k++) later(k * 0.08, () => FX.shockwave(P().x, y, P().z, R * (1 - k * 0.12), col, { life: 0.5 }));
      FX.sprite(P().x, P().y + 2.2, P().z, { tex: 'glow', color: col, size: 3, life: 0.3, grow: 2 });
      for (let i = 0; i < 12; i++) { const a = (i / 12) * TAU; FX.plane(P().x + Math.cos(a) * 2, ch(), P().z + Math.sin(a) * 2, { tex: 'crescent', color: col, size: 1.6, life: 0.4, vel: [Math.cos(a) * R * 2, 0, Math.sin(a) * R * 2], yaw: a, tilt: 1.2, grow: 1.8, fade: 'out' }); }
      G.text(P().x, P().y + 3.4, P().z, w.evolved ? '멸(滅)!!' : '갈(喝)!!', col, 38, 0.8, true);
      G.inRadius(P().x, P().z, R, (e) => { if (!e.T.boss) e.stun = Math.max(e.stun || 0, w.stun * (w.evolved ? 2 : 1)); G.hurt(e, w.dmg * (w.evolved ? 2 : 1), (e.x - P().x) * 3, (e.z - P().z) * 3, { color: col }); });
      G.shake(0.5); G.impact(0.04); } });
  def('tanji', { name: '탄지신통', icon: 'w_tanji', desc: '손가락으로 튕긴 지풍이 빛줄기처럼 적 여럿을 꿰뚫어요', up: '데미지 +4, 2단계마다 지풍 +1', max: 7, color: '#aaf0ff',
    create: () => ({ dmg: 9, count: 1, cd: 0.42, t: 0.4 }), upgrade(w) { w.dmg += 4; if (w.level % 2 === 1) w.count++; },
    update(w, dt) { if ((w.t -= dt) > 0) return; const pool = G.nearestN(8, 20); if (!pool.length) return; w.t = w.cd * P().haste; const col = w.evolved ? '#fff0a0' : '#aaf0ff';
      for (let i = 0; i < w.count + P().extra; i++) { const t = pool[i % pool.length], a = aimAt(t) + (i ? rnd(-0.05, 0.05) : 0), L = Math.hypot(t.x - P().x, t.z - P().z) + 7;
        let pierce = 3; G.lineHits(P().x, P().z, P().x + Math.cos(a) * L, P().z + Math.sin(a) * L, 0.35, (e, cx, cz) => { if (pierce-- > 0) G.hurt(e, w.dmg, cx * 3, cz * 3, { color: col }); });
        FX.beam(P().x + Math.cos(a) * 0.6, ch(), P().z + Math.sin(a) * 0.6, P().x + Math.cos(a) * L, eY(t), P().z + Math.sin(a) * L, col, 0.22, 0.2); } } });
  def('geomgang', { name: '검강', icon: 'w_geomgang', desc: '응축된 강기를 거대한 초승달로 휘둘러 앞을 통째로 베어요', up: '데미지 +10, 반경 +0.7 (4단계부터 왕복)', max: 6, color: '#7ab8ff',
    create: () => ({ dmg: 32, R: 7.5, cd: 3.2, t: 1 }), upgrade(w) { w.dmg += 10; w.R += 0.7; },
    update(w, dt) { if ((w.t -= dt) > 0) return; const e = tgt(w.R * P().area * 1.3); if (!e) return; w.t = w.cd * P().haste; const a = aimAt(e);
      const cut = (side) => { const col = w.evolved ? '#ffd76a' : '#7ab8ff'; const hits = arcStrike(a, w.R * P().area, 1.15, w.dmg, col, 20, { side }); if (w.evolved && side > 0) lineStrike(a, 40, 1.2, w.dmg * 0.8, col, null, { vis: 1.6, life: 0.4 }); if (hits >= 6) { G.impact(0.05); G.shake(0.4); G.hitStop(0.05); } G.word('cut', P().x + Math.cos(a) * 3, P().y, P().z + Math.sin(a) * 3, hits >= 6); };
      cut(1); if (w.level >= 4 || w.evolved) later(0.16, () => cut(-1)); G.heroSwing(); } });
  def('ihyeong', { name: '이형환위', icon: 'w_ihyeong', desc: '보이지 않는 속도로 분신이 튀어나가 적을 관통해 베어요', up: '데미지 +6, 2단계마다 분신 +1', max: 7, color: '#b49cff',
    create: () => ({ dmg: 18, count: 2, cd: 2.6, t: 1.4 }), upgrade(w) { w.dmg += 6; if (w.level % 2 === 1) w.count++; },
    update(w, dt) { if ((w.t -= dt) > 0) return; const pool = G.nearestN(10, 17); if (!pool.length) return; w.t = w.cd * P().haste; const col = w.evolved ? '#ffa8f0' : '#b49cff';
      for (let i = 0; i < w.count + P().extra; i++) { const t = pool[i % pool.length], a = aimAt(t) + (i >= pool.length ? (i % 2 ? 0.3 : -0.3) : 0), L = Math.hypot(t.x - P().x, t.z - P().z) + 3, x1 = P().x + Math.cos(a) * L, z1 = P().z + Math.sin(a) * L;
        G.lineHits(P().x, P().z, x1, z1, 0.9, (e, cx, cz) => { G.hurt(e, w.dmg, cx * 6, cz * 6, { color: col }); FX.slash(e.x, eY(e), e.z, a + Math.PI / 2, 1.4, col, { tilt: 1.1, life: 0.2 }); });
        G.phantom(P().x, P().y, P().z, x1, G.H(x1, z1), z1, col, i * 0.05); } } });
  def('cheongeun', { name: '천근추', icon: 'w_cheongeun', desc: '천 근의 무게로 뛰어올라 땅을 내리찍어 갈라 버려요', up: '데미지 +12, 범위 +0.6', max: 6, color: '#ffaa50',
    create: () => ({ dmg: 36, R: 5.5, cd: 4.6, t: 2 }), upgrade(w) { w.dmg += 12; w.R += 0.6; },
    update(w, dt) { if ((w.t -= dt) > 0) return; if (!tgt(w.R * P().area)) return; w.t = w.cd * P().haste;
      if (!P().air) G.leap(9, true);
      const R = w.R * P().area * (w.evolved ? 1.4 : 1), col = w.evolved ? '#ff6a3a' : '#ffaa50';
      const stomp = (x, z, RR, d, after) => { const y = G.H(x, z); FX.ground(x, y, z, { tex: 'crack', color: col, size: RR * 2.2, life: 0.9, fade: 'out', opacity: 1, order: 1 }); FX.ground(x, y, z, { tex: 'crack', color: '#20140c', blend: 'normal', size: RR * 2.2, life: 2.2, fade: 'out', opacity: 0.6, order: 1, lift: 0.08 }); FX.explode(x, y, z, RR, col, { scorch: false }); G.inRadius(x, z, RR, (e) => G.hurt(e, d, (e.x - x) * 3, (e.z - z) * 3, { color: col })); G.shake(after ? 0.4 : 0.8); if (!after) { G.word('hit', x, y, z, true); G.impact(0.05); G.hitStop(0.05); } };
      later(0.5, () => { const x = P().x, z = P().z; stomp(x, z, R, w.dmg * (w.evolved ? 2.2 : 1), false); if (w.evolved) for (let k = 1; k <= 2; k++) later(k * 0.32, () => stomp(x, z, R * (1 + k * 0.35), w.dmg, true)); }); } });
  def('heupseong', { name: '흡성대법', icon: 'w_heupseong', desc: '적의 기운을 빨아들여 피해를 주고 내 체력으로 바꿔요', up: '대상 +1, 데미지 +4', max: 6, color: '#c070ff',
    create: () => ({ dmg: 10, count: 3, cd: 2.8, t: 1.5, heal: 0.6 }), upgrade(w) { w.count++; w.dmg += 4; },
    update(w, dt) { if ((w.t -= dt) > 0) return; const pool = G.nearestN(w.count + P().extra, 13); if (!pool.length) return; w.t = w.cd * P().haste; const col = w.evolved ? '#ff5090' : '#c070ff';
      for (const e of pool) { G.hurt(e, w.dmg, (P().x - e.x) * 0.6, (P().z - e.z) * 0.6, { color: col }); const sx = e.x, sy = eY(e), sz = e.z; for (let k = 0; k < (G.lowFx() ? 3 : 6); k++) { const t0 = k * 0.05; later(t0, () => { const dur = 0.35; FX.sprite(sx, sy, sz, { tex: 'glow', color: col, size: 0.7, life: dur, follow: (() => { const st = G.time; return () => { const u = Math.min(1, (G.time - st) / dur); return { x: sx + (P().x - sx) * u + Math.sin(u * 9 + k) * 0.4 * (1 - u), y: sy + (ch() - sy) * u + Math.sin(u * Math.PI) * 1.2, z: sz + (P().z - sz) * u }; }; })(), fade: 'lin' }); }); } }
      G.heal(Math.min(6, pool.length * w.heal));
      FX.sprite(P().x, ch(), P().z, { tex: 'shock', color: col, size: 4, life: 0.6, grow: 0.3, spin: -6, fade: 'flash', follow: () => ({ x: P().x, y: ch(), z: P().z }) }); } });

  // ---------- awakenings ----------
  const EVOS = {
    shot: { passive: 'haste', name: '만검귀종', desc: '비검이 비처럼 쏟아져요. 발사 +4, 관통 +3, 데미지 ×1.5', apply: (w) => { w.count += 4; w.dmg *= 1.5; } },
    orbit: { passive: 'area', name: '구미호화', desc: '여우불 9개가 크게 돌며 불태워요. 데미지 ×2', apply: (w) => { w.count = Math.max(w.count, 9); w.dmg *= 2; } },
    boomerang: { passive: 'speed', name: '천월륜', desc: '원월륜 +3, 사거리 +4, 데미지 ×1.6', apply: (w) => { w.count += 3; w.range += 4; w.dmg *= 1.6; } },
    lightning: { passive: 'xp', name: '천벌뢰', desc: '벼락 +5, 데미지 ×1.8, 대기시간 -40%', apply: (w) => { w.dmg *= 1.8; w.cd *= 0.6; } },
    aura: { passive: 'armor', name: '금강결계', desc: '결계 범위 +2, 데미지 ×2, 적을 거의 멈춰 세워요', apply: (w) => { w.R += 2; w.dmg *= 2; w.slow = 0.65; } },
    quake: { passive: 'hp', name: '태산압정', desc: '장풍 범위 ×1.6, 데미지 ×2, 대기시간 -40%', apply: (w) => { w.dmg *= 2; w.cd *= 0.6; } },
    beam: { passive: 'crit', name: '일섬', desc: '검기 +2, 더 굵게, 데미지 ×1.8', apply: (w) => { w.count += 2; w.dmg *= 1.8; } },
    firework: { passive: 'luck', name: '화룡부', desc: '부적 +3, 폭발 범위 +1.7', apply: (w) => { w.count += 3; w.R += 1.7; } },
    fairy: { passive: 'extra', name: '학의 군무', desc: '종이학 +6, 데미지 ×1.5', apply: (w) => { w.dmg *= 1.5; } },
    thorn: { passive: 'regen', name: '만독지대', desc: '독안개 크기 ×1.6, 데미지 ×2, 유지 +3초', apply: (w) => { w.life += 3; } },
    geomsul: { passive: 'crit', name: '심검합일', desc: '한 단계 높은 형으로 펼쳐져요. 데미지 ×2, 대기시간 -25%', apply: (w) => { w.dmg *= 2; w.cd *= 0.75; } },
    gwonbeop: { passive: 'armor', name: '금강패권', desc: '한 단계 높은 형의 권법. 데미지 ×2, 범위 +0.9', apply: (w) => { w.dmg *= 2; w.R += 0.9; } },
    slash: { passive: 'dmg', name: '쌍룡참', desc: '항상 양쪽을 크게 베어요. 범위 ×1.4, 데미지 ×2', apply: (w) => { w.count = 2; w.dmg *= 2; } },
    icicle: { passive: 'pierce', name: '빙창우', desc: '얼음 +5, 폭발 범위 ×1.5, 데미지 ×1.6', apply: (w) => { w.dmg *= 1.6; } },
    tornado: { passive: 'duration', name: '천풍', desc: '회오리 +2, 크기 ×1.6, 오래 지속, 데미지 ×1.5', apply: (w) => { w.dmg *= 1.5; } },
    mine: { passive: 'magnet', name: '천라지망', desc: '지뢰부가 적을 끌어당기고, 범위 ×1.4, 데미지 ×1.5', apply: (w) => { w.dmg *= 1.5; } },
    plum: { partner: 'plumrain', name: '매화만개', desc: '꽃잎 +10, 데미지 ×1.6. 하늘이 매화로 뒤덮여요', apply: (w) => { w.count += 10; w.dmg *= 1.6; } },
    taiji: { partner: 'yangui', name: '태극무극', desc: '태극검 6자루가 더 크게 돌아요. 데미지 ×2', apply: (w) => { w.dmg *= 2; } },
    yeorae: { partner: 'geumgang', name: '천수여래장', desc: '손바닥 3개가 한꺼번에 떨어져요. 범위 +1.7, 데미지 ×1.8', apply: (w) => { w.count = 3; w.R += 1.7; w.dmg *= 1.8; } },
    tagu: { partner: 'bottle', name: '광걸난무', desc: '범위 ×1.5, 데미지 ×2, 대기시간 -40%', apply: () => {} },
    needles: { partner: 'dokmu', name: '폭우이화침', desc: '암기 +16, 데미지 ×1.5', apply: (w) => { w.dmg *= 1.5; } },
    skysword: { partner: 'jewang', name: '제왕검우', desc: '검 +6, 범위 ×1.5, 데미지 ×1.7', apply: (w) => { w.dmg *= 1.7; } },
    binbaek: { partner: 'hanbing', name: '북해빙결', desc: '범위 +3.5, 데미지 ×2, 4초 동안 얼려요', apply: () => {} },
    cheonmasingong: { partner: 'hyeolma', name: '천마군림', desc: '범위 +4.3, 데미지 ×2.2', apply: () => {} },
    emeija: { partner: 'geumjeong', name: '아미금정', desc: '아미자 +4, 사거리 ×1.5, 데미지 ×2', apply: (w) => { w.dmg *= 2; } },
    seolgeom: { partner: 'leap', name: '설산비천', desc: '검기 +2, 더 굵게, 데미지 ×2', apply: (w) => { w.dmg *= 2; } },
    formation: { partner: 'fan', name: '와룡천진', desc: '진이 두 배로 커지고 오래가며 데미지 ×2.2', apply: () => {} },
    eogeom: { passive: 'haste', name: '검룡승천', desc: '비검 +6, 꿰뚫을 때마다 금빛 폭발, 데미지 ×1.8', apply: (w) => { w.count += 6; w.dmg *= 1.8; w.launch *= 0.6; } },
    saja: { passive: 'armor', name: '사자멸혼후', desc: '범위 ×1.5, 데미지 ×2, 기절 ×2', apply: () => {} },
    tanji: { passive: 'crit', name: '무형지', desc: '지풍 +3, 데미지 ×1.8, 대기시간 -30%', apply: (w) => { w.count += 3; w.dmg *= 1.8; w.cd *= 0.7; } },
    geomgang: { passive: 'dmg', name: '천지양단', desc: '반경 +3.5, 데미지 ×2, 일직선 검강 추가', apply: (w) => { w.R += 3.5; w.dmg *= 2; } },
    ihyeong: { passive: 'speed', name: '분광환영', desc: '분신 +3, 데미지 ×1.8', apply: (w) => { w.count += 3; w.dmg *= 1.8; } },
    cheongeun: { passive: 'hp', name: '천근만근', desc: '범위 ×1.4, 데미지 ×2.2, 여진 두 번', apply: () => {} },
    heupseong: { passive: 'regen', name: '흡성마공', desc: '대상 +6, 데미지 ×2, 흡수 ×2', apply: (w) => { w.count += 6; w.dmg *= 2; w.heal *= 2; } },
  };

  // ---------- ultimates (per hero style) ----------
  function ultimate(hero) {
    const p = P(), y = G.H(p.x, p.z), col = hero.color, dmg = (40 + p.lv * 7) * 1.0;
    G.impact(0.08); G.shake(1.1); G.hitStop(0.1);
    G.banner(hero.ultName, `${hero.name}의 필살기!`);
    FX.pillar(p.x, y, p.z, col, 24, 2.4, 0.8);
    for (let k = 0; k < 3; k++) later(k * 0.1, () => FX.shockwave(p.x, y, p.z, 14 + k * 5, k === 1 ? '#ffffff' : col, { life: 0.7 }));
    FX.ground(p.x, y, p.z, { tex: 'rune', color: col, size: 20, life: 1.4, fade: 'hold', spin: 1.2, opacity: 0.8 });
    const L = 30;
    if (hero.ult === 'slash') { for (let i = 0; i < 16; i++) wave((i / 16) * TAU, dmg * 1.2, 22, 1.4, 1.3, col); arcStrike(0, 7.4, Math.PI, dmg, col, 30); }
    else if (hero.ult === 'twin') { for (const a of [Math.PI / 4, -Math.PI / 4, Math.PI * 3 / 4, -Math.PI * 3 / 4]) lineStrike(a, L, 1.2, dmg * 2, col, null, { vis: 2, life: 0.5 }); }
    else if (hero.ult === 'palm') { palmDrop(p.x, p.z, 16, dmg * 2.4, col); }
    else if (hero.ult === 'cast') { blast(p.x, p.z, 11, dmg, col, 30); zone({ x: p.x, z: p.z, R: 11, life: 3.2, tick: 0.4, dmg: dmg * 0.35, color: col, slow: 0.6, rune: true, runeSpin: 1.5 }); }
    else if (hero.ult === 'throw') { for (let i = 0; i < 36; i++) { const a = (i / 36) * TAU; shoot({ x: p.x, z: p.z, vx: Math.cos(a) * 22, vz: Math.sin(a) * 22, life: 1.4, dmg: dmg * 0.9, r: 0.45, pierce: 6, tex: 'streak', flat: true, w: 1.4, h: 0.4, tilt: 0.6, color: col, trail: 0.4 }); } }
    else { for (let k = 0; k < 12; k++) later(k * 0.2, () => { FX.slash(p.x, G.chest() - 0.5, p.z, G.time * 8, 7.8, col, { tilt: 0.05, spin: 10, life: 0.25 }); blast(P().x, P().z, 7.8, dmg * 0.45, col, 24, null, { fx: false }); }); }
  }

  function update(dt) {
    for (let i = timers.length - 1; i >= 0; i--) { if ((timers[i].t -= dt) <= 0) { const f = timers[i].fn; timers.splice(i, 1); f(); } }
    updateShots(dt); updateShells(dt); updateZones(dt); updateMines(dt);
  }
  function clear() {
    for (const s of shots) { kill3(s.vis); kill3(s.glow); }
    for (const s of shells) kill3(s.vis);
    for (const m of mines) kill3(m.vis);
    shots.length = shells.length = zones.length = mines.length = timers.length = 0;
    for (const w of Object.values(P().weapons || {})) { if (w.z) w.z = null; }
  }
  // persistent weapon visuals (orbs, discs, swords) when the run is reset
  function dropWeaponVisuals(w) { for (const o of w.orbs || []) { kill3(o.f); kill3(o.g); } for (const d of w.discs || []) { kill3(d.d); kill3(d.g); } for (const s of w.swords || []) { kill3(s.m); kill3(s.g); } }
  return { WEAPONS: W, EVOS, ultimate, update, clear, dropWeaponVisuals, poison, zones };
}
