// 강호난세 3D: the 2D game's long-term progress (same localStorage save), its data tables and the lobby screens.
// The 3D page lives on the same origin as the 2D one, so 은자, 명성, 장비, 업적 and 해금 carry over both ways.

// ---------- save ----------
export const PROGRESS_KEY = 'yokai-survivors-progress';
export const progress = { totalKills: 0, combos: [], achievements: [], played: [], bosses: {}, gold: 0, totalGold: 0, shop: {}, wins: 0, bestStage: 0, difficulty: 'normal', clears: {}, mastery: {}, quests: null, questsDone: 0,
  settings: { sfx: true, music: true, vib: true }, goldKills: 0, fame: 0, sect: {}, sectName: '', secrets: {}, duelWins: 0, giyeonCount: 0 };
try { Object.assign(progress, JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}')); } catch (e) { /* storage unavailable */ }
for (const k of ['shake', 'nums', 'sfx', 'music', 'vib']) if (progress.settings[k] === undefined) progress.settings[k] = true;
export const settings = progress.settings;
export function saveProgress() {
  try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress)); } catch (e) { /* storage unavailable */ }
}
export function markSeen(id) { if (!progress.combos.includes(id)) { progress.combos.push(id); saveProgress(); } }

// ---------- emoji → pixel icon ----------
const ICON_FILES = { '🗡️': 'sword', '🔥': 'fire', '⭕': 'chakram', '⚡': 'bolt', '☯️': 'taiji', '🌀': 'swirl', '💫': 'qi', '🎇': 'firework', '🕊️': 'crane', '☠️': 'poison_skull', '🔪': 'slash', '🧊': 'icecube', '🌪️': 'tornado', '📯': 'talisman', '🌸': 'sakura', '🏵️': 'plumfall', '🖐️': 'palm', '🛕': 'vajra', '🥢': 'staff', '🍶': 'bottle', '📍': 'needles', '🧪': 'flask', '⚔️': 'crossed', '👑': 'crown', '🥶': 'icepalm', '🌨️': 'snowcloud', '😈': 'demon', '🩸': 'blood', '🪷': 'lotus', '🏔️': 'mountain', '☁️': 'cloud', '🔯': 'formation', '🪶': 'feather', '👊': 'fist', '🦊': 'fox', '🌕': 'moon', '🌩️': 'thunder', '🔱': 'trident', '⛰️': 'rockmount', '✨': 'sparkles', '🐉': 'dragon', '🐲': 'dragon_red', '🦢': 'swan', '❄️': 'snowflake', '🕸️': 'web', '💮': 'whiteflower', '🙏': 'pray', '🌧️': 'rain', '👹': 'oni', '💗': 'heart', '⏳': 'hourglass', '🍃': 'leaf', '🧲': 'magnet', '🍵': 'tea', '🎯': 'target', '📜': 'scroll', '🛡️': 'shield', '👥': 'clones', '🧧': 'luckbag', '🕯️': 'candle', '🏹': 'bow', '🍑': 'peach', '💰': 'money', '🔄': 'reroll', '⏭️': 'skip', '🚫': 'banish', '💀': 'skull', '🏯': 'castle', '🌙': 'crescent', '🌒': 'darkmoon', '🌅': 'sunrise', '📖': 'book', '📚': 'books', '🎒': 'bundle', '🎁': 'chest', '🏮': 'lantern', '☀️': 'sun', '🌈': 'rainbow', '⚰️': 'coffin', '🌟': 'star', '🥋': 'gi', '🧭': 'compass', '🔒': 'lock', '🏆': 'trophy', '🧨': 'firecracker', '💎': 'gem', '📿': 'beads', '🏅': 'medal' };
let A = (p) => '../assets/' + p;
export function setAssetResolver(fn) { A = fn; }
export function iconFile(emoji) { const n = ICON_FILES[emoji] || ICON_FILES[emoji.replace(/️/g, '')] || ICON_FILES[emoji + '️']; return n ? `icons/${n}.png` : null; }
export function icon(emoji, cls = 'pi') { const f = iconFile(emoji); return f ? `<img class="${cls}" src="${A(f)}" alt="">` : `<span class="${cls}">${emoji}</span>`; }
export const ICON_LIST = Object.values(ICON_FILES);

// ---------- tables (ported from the 2D game; stat names follow the 3D player) ----------
export const GRADES = [
  { id: 'common', name: '일반', color: '#d8d2c2', w: 46 },
  { id: 'rare', name: '희귀', color: '#4aa3ff', w: 30 },
  { id: 'epic', name: '영웅', color: '#b05cff', w: 16 },
  { id: 'legend', name: '전설', color: '#ff9a1f', w: 7 },
  { id: 'myth', name: '신화', color: '#ff3b5c', w: 1.2 },
];
export const SHOP = [
  { id: 'might', icon: '🩸', name: '혈기 수련', desc: '모든 피해 +5%', max: 5, cost: 120, apply(p) { p.dmgMul += 0.05; } },
  { id: 'body', icon: '💗', name: '신체 단련', desc: '최대 HP +10', max: 5, cost: 100, apply(p) { p.maxHp += 10; p.hp += 10; } },
  { id: 'armor', icon: '🛡️', name: '철포삼', desc: '받는 피해 -3%', max: 3, cost: 200, apply(p) { p.armor *= 0.97; } },
  { id: 'regen', icon: '🍵', name: '호흡법', desc: '초당 HP +0.2 회복', max: 5, cost: 150, apply(p) { p.regen += 0.2; } },
  { id: 'speed', icon: '🍃', name: '보법', desc: '이동 속도 +4%', max: 3, cost: 150, apply(p) { p.speed *= 1.04; } },
  { id: 'haste', icon: '⏳', name: '심법', desc: '무공 대기시간 -3%', max: 3, cost: 250, apply(p) { p.haste *= 0.97; } },
  { id: 'area', icon: '☯️', name: '내력', desc: '무공 범위 +5%', max: 3, cost: 200, apply(p) { p.area *= 1.05; } },
  { id: 'growth', icon: '📜', name: '총명', desc: '경험치 +4%', max: 5, cost: 120, apply(p) { p.xpMul += 0.04; } },
  { id: 'magnet', icon: '🧲', name: '흡기', desc: '줍는 범위 +15%', max: 3, cost: 100, apply(p) { p.magnet *= 1.15; } },
  { id: 'luck', icon: '🧧', name: '길운', desc: '행운 +10% (아이템·큰 보물함)', max: 3, cost: 180, apply(p) { p.luck += 0.1; } },
  { id: 'greed', icon: '💰', name: '재물운', desc: '얻는 은자 +15%', max: 5, cost: 100, apply(p) { p.greed += 0.15; } },
  { id: 'reroll', icon: '🔄', name: '변통', desc: '레벨업 다시뽑기 +2', max: 3, cost: 150, apply(p) { p.rerolls += 2; } },
  { id: 'skip', icon: '⏭️', name: '인내', desc: '레벨업 넘기기 +2', max: 3, cost: 80, apply(p) { p.skips += 2; } },
  { id: 'banish', icon: '🚫', name: '봉인술', desc: '레벨업 봉인 +1', max: 3, cost: 200, apply(p) { p.banishes += 1; } },
  { id: 'revival', icon: '🪷', name: '환생', desc: '쓰러져도 한 번 HP 절반으로 되살아나요', max: 1, cost: 1200, apply(p) { p.halfRevives = (p.halfRevives || 0) + 1; } },
  { id: 'curse', icon: '💀', name: '마기', desc: '요괴 체력·속도·수 +10%, 은자 +20% (도전용)', max: 5, cost: 100, apply(p) { p.curse += 0.1; p.greed += 0.2; } },
];
const shopLevel = (id) => progress.shop[id] || 0;
const shopCost = (u) => u.cost * (shopLevel(u.id) + 1);

export const GEAR = [
  { id: 'weapon', icon: '🗡️', slot: '무기', names: ['녹슨 검', '정련된 검', '청강검', '현철 보검', '용음신검'], val: [6, 12, 20, 32, 50], desc: (v) => `모든 피해 +${v}%`, apply(p, v) { p.dmgMul += v / 100; } },
  { id: 'armor', icon: '🥋', slot: '의복', names: ['무명옷', '가죽 갑의', '철갑', '금사갑', '천잠보의'], val: [15, 30, 50, 80, 120], desc: (v) => `최대 HP +${v}, 받는 피해 -${Math.round(v / 7)}%`, apply(p, v) { p.maxHp += v; p.hp += v; p.armor *= 1 - v / 700; } },
  { id: 'trinket', icon: '📿', slot: '장신구', names: ['동전 목걸이', '옥패', '호박 노리개', '야명주', '여의 노리개'], val: [3, 6, 10, 15, 22], desc: (v) => `치명타 +${v}%, 경험치 +${v}%`, apply(p, v) { p.crit += v / 100; p.xpMul += v / 100; } },
  { id: 'boots', icon: '🪶', slot: '신발', names: ['짚신', '가죽신', '비운화', '축지신', '등운보'], val: [3, 6, 9, 13, 18], desc: (v) => `이동 속도 +${v}%, 대기시간 -${Math.round(v * 0.7)}%`, apply(p, v) { p.speed *= 1 + v / 100; p.haste *= 1 - v * 0.007; } },
];
export const GEAR_COST = 300;
const gearInv = (id) => ((progress.gear || (progress.gear = {}))[id] || (progress.gear[id] = [0, 0, 0, 0, 0]));
const gearBest = (id) => { const inv = gearInv(id); for (let g = 4; g >= 0; g--) if (inv[g] > 0) return g; return -1; };
export function rollGear() {
  const ws = [55, 28, 12, 4.5, 0.5];
  let r = Math.random() * 100, g = 0;
  while (r >= ws[g]) r -= ws[g++];
  const G = GEAR[Math.floor(Math.random() * GEAR.length)];
  const better = g > gearBest(G.id);
  gearInv(G.id)[g]++;
  saveProgress();
  return { g, icon: G.icon, name: `[${G.slot}] ${G.names[g]}`, desc: G.desc(G.val[g]), tag: better ? '장착! 더 좋은 장비예요' : '보관함에 들어갔어요 (3개 모으면 합성)' };
}

export const SECT_BUILDINGS = [
  { id: 'hall', icon: '⚔️', name: '연무장', desc: '모든 피해 +4% (레벨마다)', max: 5, cost: 30, apply(p, l) { p.dmgMul += 0.04 * l; } },
  { id: 'library', icon: '📚', name: '장경각', desc: 'Lv1 다시뽑기 +1 · Lv2 레벨업 카드 4장 · Lv3 다시뽑기 +2 더', max: 3, cost: 60, apply(p, l) { if (l >= 1) p.rerolls += 1; if (l >= 2) p.cardCount = 4; if (l >= 3) p.rerolls += 2; } },
  { id: 'pharmacy', icon: '🍵', name: '약방', desc: '최대 HP +12, 회복 효과 +15% (레벨마다)', max: 4, cost: 35, apply(p, l) { p.maxHp += 12 * l; p.hp += 12 * l; p.healMul += 0.15 * l; } },
  { id: 'treasury', icon: '💰', name: '보물고', desc: '얻는 은자 +10% (레벨마다)', max: 5, cost: 40, apply(p, l) { p.greed += 0.1 * l; } },
  { id: 'inn', icon: '🏮', name: '객잔', desc: 'Lv1 출정 때 보물함 1개 · Lv2 장 돌파 선물 +1 · Lv3 출정 보물함 2개', max: 3, cost: 80, apply(p, l) { p.innChests = l >= 3 ? 2 : l >= 1 ? 1 : 0; p.stageGiftBonus = l >= 2 ? 1 : 0; } },
  { id: 'guard', icon: '🛡️', name: '수호진', desc: '받는 피해 -3% (레벨마다)', max: 5, cost: 45, apply(p, l) { p.armor *= 0.97 ** l; } },
  { id: 'disciples', icon: '👥', name: '제자 숙소', desc: '제자가 따라다니며 함께 싸워요 (레벨마다 1명)', max: 3, cost: 100, apply(p, l) { p.disciples = l; } },
];
const sectLevel = (id) => progress.sect[id] || 0;
const buildCost = (b) => b.cost * (sectLevel(b.id) + 1);

export const MASTERY_XP = [0, 40, 120, 250, 450, 700];
export const MASTERY_PERKS = ['최대 HP +15', '시작 무공 +1단계', '모든 피해 +8%', '비전서 선택지 +1', '필살기 게이지 절반으로 시작 · 필살기 피해 +50%'];
export function masteryLevel(id) {
  const xp = progress.mastery[id] || 0;
  let lv = 0;
  while (lv + 1 < MASTERY_XP.length && xp >= MASTERY_XP[lv + 1]) lv++;
  return lv;
}

// Everything bought between runs, applied to a fresh 3D player.
export function applyMeta(p, heroKey) {
  for (const u of SHOP) for (let i = 0; i < shopLevel(u.id); i++) u.apply(p);
  for (const G of GEAR) { const g = gearBest(G.id); if (g >= 0) G.apply(p, G.val[g]); }
  for (const b of SECT_BUILDINGS) if (sectLevel(b.id)) b.apply(p, sectLevel(b.id));
  const ml = masteryLevel(heroKey);
  if (ml >= 1) { p.maxHp += 15; p.hp += 15; }
  if (ml >= 2) p.startBonus = 1;
  if (ml >= 3) p.dmgMul += 0.08;
  if (ml >= 4) p.arcanaChoices = 4;
  if (ml >= 5) { p.ult = 50; p.ultMul = 1.5; }
}

export const DIFFICULTIES = [
  { id: 'easy', icon: '🍃', name: '입문', desc: '처음이라면. 요괴 체력·공격력 ×0.8. 성장 빠름. 은자 ×0.7', hp: 0.8, dmg: 0.8, spawn: 1, speed: 1.05, gold: 0.7, ramp: 1, elite: 0.8, xp: 1 },
  { id: 'normal', icon: '⚔️', name: '강호', desc: '체력 ×1.4, 공격력 ×1.35. 기본 속도·출현', hp: 1.4, dmg: 1.35, spawn: 1, speed: 1, gold: 1, ramp: 1.25, elite: 1.3, xp: 0.85 },
  { id: 'hard', icon: '🔥', name: '고수', desc: '체력 ×2.6, 공격력 ×2. 요괴가 조금 느리고 덜 나와요. 은자 ×1.6', hp: 2.6, dmg: 2, spawn: 0.85, speed: 0.9, gold: 1.6, ramp: 1.8, elite: 2, xp: 0.8 },
  { id: 'hell', icon: '💀', name: '마경', desc: '체력 ×4.2, 공격력 ×2.8. 정예가 자주 나와요. 은자 ×2.8', hp: 4.2, dmg: 2.8, spawn: 0.72, speed: 0.82, gold: 2.8, ramp: 2.4, elite: 3, xp: 0.72 },
  { id: 'cheonma', icon: '😈', name: '천마경', desc: '극악. 체력 ×6, 공격력 ×3.6. 한 마리 한 마리가 괴물. 은자 ×4.5', hp: 6, dmg: 3.6, spawn: 0.6, speed: 0.74, gold: 4.5, ramp: 3.2, elite: 4.5, xp: 0.65 },
];
export const HEAT_MAX = 9;
const HEAT_RULES = [[3, '회복량 절반'], [5, '보스 체력 +30%'], [7, '보스 공격 패턴 +1'], [9, '시작 최대 HP -30%']];
export function heatDesc(h) {
  if (!h) return '업화 없이 도전해요';
  const rules = HEAT_RULES.filter(([lv]) => h >= lv).map(([, t]) => t);
  return `요괴 체력 +${22 * h}% · 공격 +${12 * h}% · 정예 +${30 * h}%${rules.length ? ` · ${rules.join(' · ')}` : ''} · 점수 ×${(1 + 0.25 * h).toFixed(2)} · 은자 ×${(1 + 0.15 * h).toFixed(2)}`;
}
export function makeDiff(id, h) {
  const base = DIFFICULTIES.find((d) => d.id === id) || DIFFICULTIES[1];
  return h ? { ...base, name: `${base.name}·업화${h}`, heat: h, hp: base.hp * (1 + 0.22 * h), dmg: base.dmg * (1 + 0.12 * h), elite: base.elite * (1 + 0.3 * h), gold: base.gold * (1 + 0.15 * h) } : { ...base, heat: 0 };
}
export function applyHeatToPlayer(p, h) {
  if (h >= 3) p.healMul *= 0.5;
  if (h >= 9) { p.maxHp = Math.round(p.maxHp * 0.7); p.hp = Math.min(p.hp, p.maxHp); }
}
// Each chapter steps the yokai up (relative to the 3D chapter-1 tuning).
export const STAGE_SCALE = [
  { hp: 1, dmg: 1, speed: 1, spawn: 1, elite: 1 },
  { hp: 2.15, dmg: 1.46, speed: 1.05, spawn: 1.2, elite: 1.67 },
  { hp: 3.85, dmg: 2, speed: 1.1, spawn: 1.4, elite: 2.33 },
  { hp: 6.5, dmg: 2.6, speed: 1.14, spawn: 1.6, elite: 3.33 },
];

export const REALMS = [
  { name: '삼류', need: 0 }, { name: '이류', need: 4 }, { name: '일류', need: 9 }, { name: '절정', need: 15 },
  { name: '초절정', need: 22 }, { name: '화경', need: 30 }, { name: '현경', need: 39 }, { name: '생사경', need: 49 },
];
export const RANKS = {
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
  nameless: ['이름 없는 자', '떠돌이', '무명검객', '외길 검객', '일검', '검귀', '검마', '무명'],
};
export const heroTier = (realm) => (realm >= 7 ? 4 : realm >= 6 ? 3 : realm >= 4 ? 2 : realm >= 2 ? 1 : 0);
export function rankOf(hero, realm) { return (RANKS[hero.key === 'nameless' ? 'nameless' : hero.sect === 'all' ? 'maeng' : hero.sect || 'none'] || RANKS.none)[realm]; }

export const ARCANA = [
  { id: 'thunder', icon: '⚡', name: '뇌정', desc: '치명타가 터지면 25% 확률로 벼락이 떨어져 주변을 태워요' },
  { id: 'bloodrain', icon: '🩸', name: '혈우', desc: '요괴를 쓰러뜨리면 8% 확률로 피의 비가 내려 주변에 큰 피해' },
  { id: 'diamond', icon: '🛡️', name: '금강신체', desc: '경험치 구슬을 주울 때마다 HP 0.4 회복, 잠깐 무적' },
  { id: 'chain', icon: '👥', name: '연환', desc: '모든 무공 발사 수 +1, 대신 모든 피해 -15%', apply(p) { p.extra++; p.dmgMul *= 0.85; } },
  { id: 'reverse', icon: '🔥', name: '역천', desc: 'HP가 절반 이하면 모든 피해 +50%' },
  { id: 'ten', icon: '📖', name: '만류귀종', desc: '경지가 오를 때마다 모든 무공이 1단계 강해져요' },
  { id: 'greedy', icon: '💰', name: '탐욕의 길', desc: '은자 ×2, 대신 받는 피해 +25%', apply(p) { p.greed *= 2; p.armor *= 1.25; } },
  { id: 'absorb', icon: '🧲', name: '흡성', desc: '줍는 범위 ×2.5, 경험치 +20%', apply(p) { p.magnet *= 2.5; p.xpMul += 0.2; } },
  { id: 'heaven', icon: '⚔️', name: '천벌', desc: '보스·정예에게 주는 피해 ×1.8' },
  { id: 'meteor', icon: '🌟', name: '유성검우', desc: '8초마다 하늘에서 검 8자루가 떨어져요' },
  { id: 'frost', icon: '❄️', name: '빙결지체', desc: '맞은 요괴가 12% 확률로 얼어붙어요' },
  { id: 'gale', icon: '🍃', name: '질풍', desc: '경공 2단 점프가 착지하는 순간 주변 요괴를 베어요' },
  { id: 'ghostgate', icon: '💀', name: '귀문', desc: '필살기 게이지가 2배 빨리 차요' },
  { id: 'twinult', icon: '☯️', name: '쌍천', desc: '필살기가 두 번 연속으로 터져요' },
];

export const RELICS = [
  { id: 'storm', name: '뇌우의 방울', need: ['lightning', 'tornado'], desc: '모든 무공 대기시간 -12%', apply(p) { p.haste *= 0.88; } },
  { id: 'moon', name: '월하쌍인', need: ['shot', 'boomerang'], desc: '발사 수 +1', apply(p) { p.extra++; } },
  { id: 'guard', name: '호신강기', need: ['orbit', 'aura'], desc: '받는 피해 -15%', apply(p) { p.armor *= 0.85; } },
  { id: 'heaven', name: '파천검결', need: ['quake', 'beam'], desc: '모든 피해 +15%', apply(p) { p.dmgMul += 0.15; } },
  { id: 'powder', name: '벽력화약고', need: ['firework', 'mine'], desc: '범위 +20%', apply(p) { p.area *= 1.2; } },
  { id: 'crane', name: '독학', need: ['fairy', 'thorn'], desc: '지속 피해 ×1.4, 지속시간 +20%', apply(p) { p.dotMul *= 1.4; p.durMul += 0.2; } },
  { id: 'frost', name: '한빙결계', need: ['icicle', 'aura'], desc: '가까운 요괴가 느려져요, 초당 HP 1 회복', apply(p) { p.chillAura = Math.max(p.chillAura || 0, 4.2); p.regen += 1; } },
  { id: 'twin', name: '쌍룡검', need: ['slash', 'beam'], desc: '치명타 +12%, 치명 피해 +0.4', apply(p) { p.crit += 0.12; p.critMul += 0.4; } },
  { id: 'tri', name: '삼재검진', need: ['lightning', 'beam', 'quake'], desc: '모든 피해 +25%, 보스 피해 +25%', apply(p) { p.dmgMul += 0.25; p.bossMul *= 1.25; } },
  { id: 'samadhi', name: '삼매진화', need: ['orbit', 'firework', 'thorn'], desc: '범위 +25%, 지속 피해 ×1.5', apply(p) { p.area *= 1.25; p.dotMul *= 1.5; } },
  { id: 'myriad', name: '만검일화', need: ['shot', 'fairy', 'slash'], desc: '관통 +2, 발사 수 +1', apply(p) { p.pierce += 2; p.extra++; } },
  { id: 'wind', name: '풍뢰신행', need: ['tornado', 'boomerang', 'mine'], desc: '이동 속도 +15%, 대기시간 -10%', apply(p) { p.speed *= 1.15; p.haste *= 0.9; } },
];

export const GEM_SLOTS = 3;
export const GEMS = [
  { id: 'ruby', name: '혈옥', desc: '모든 피해 +14%', apply(p) { p.dmgMul += 0.14; } },
  { id: 'sapphire', name: '청옥', desc: '모든 무공 대기시간 -10%', apply(p) { p.haste *= 0.9; } },
  { id: 'topaz', name: '황옥', desc: '치명타 +10%, 치명 피해 +0.3', apply(p) { p.crit += 0.1; p.critMul += 0.3; } },
  { id: 'pearl', name: '백옥', desc: '최대 HP +35, HP 35 회복', apply(p) { p.maxHp += 35; p.hp = Math.min(p.maxHp, p.hp + 35); } },
  { id: 'obsidian', name: '흑요석', desc: '받는 피해 -12%', apply(p) { p.armor *= 0.88; } },
  { id: 'jade', name: '비취', desc: '초당 HP 1.5 회복', apply(p) { p.regen += 1.5; } },
  { id: 'amber', name: '호박', desc: '경험치 +25%', apply(p) { p.xpMul += 0.25; } },
  { id: 'amethyst', name: '자수정', desc: '범위 +18%', apply(p) { p.area *= 1.18; } },
  { id: 'moonstone', name: '월장석', desc: '이동 속도 +12%', apply(p) { p.speed *= 1.12; } },
  { id: 'diamond', name: '금강석', desc: '보스·정예 피해 +35%', apply(p) { p.bossMul *= 1.35; } },
  { id: 'coral', name: '산호', desc: '발사 수 +1, 모든 피해 -5%', apply(p) { p.extra++; p.dmgMul -= 0.05; } },
  { id: 'catseye', name: '묘안석', desc: '줍는 범위 +40%, 은자 +30%', apply(p) { p.magnet *= 1.4; p.greed *= 1.3; } },
  { id: 'blood', name: '혈정', desc: '요괴를 쓰러뜨릴 때마다 HP 0.5 회복', apply(p) { p.killHeal += 0.5; } },
  { id: 'thunder', name: '뇌정석', desc: '필살기 게이지 +40% 빨리', apply(p) { p.ultGain *= 1.4; } },
];

// tick: { every, fn(G) } runs from the game loop (G = game hooks given at pull time)
export const ITEMS = [
  { id: 'tea', g: 0, icon: '🍵', name: '녹차 한 잔', desc: '초당 HP 0.5 회복', apply(p) { p.regen += 0.5; } },
  { id: 'chopsticks', g: 0, icon: '🥢', name: '쇠젓가락', desc: '모든 피해 +5%', apply(p) { p.dmgMul += 0.05; } },
  { id: 'sandal', g: 0, icon: '🍃', name: '짚신', desc: '이동 속도 +5%', apply(p) { p.speed *= 1.05; } },
  { id: 'magnet', g: 0, icon: '🧲', name: '자석 부적', desc: '줍는 범위 +20%', apply(p) { p.magnet *= 1.2; } },
  { id: 'oldbook', g: 0, icon: '📜', name: '낡은 서책', desc: '경험치 +8%', apply(p) { p.xpMul += 0.08; } },
  { id: 'leather', g: 0, icon: '🛡️', name: '가죽 호구', desc: '받는 피해 -4%', apply(p) { p.armor *= 0.96; } },
  { id: 'peach', g: 0, icon: '🍑', name: '말린 복숭아', desc: '최대 HP +15', apply(p) { p.maxHp += 15; p.hp += 15; } },
  { id: 'feather', g: 1, icon: '🎯', name: '매의 깃', desc: '치명타 +6%', apply(p) { p.crit += 0.06; } },
  { id: 'hourglass', g: 1, icon: '⏳', name: '모래시계', desc: '모든 무공 대기시간 -6%', apply(p) { p.haste *= 0.94; } },
  { id: 'arrowhead', g: 1, icon: '🏹', name: '관통 화살촉', desc: '관통 +1', apply(p) { p.pierce++; } },
  { id: 'pouch', g: 1, icon: '🧧', name: '복주머니', desc: '은자 +25%, 행운 +0.2', apply(p) { p.greed *= 1.25; p.luck += 0.2; } },
  { id: 'incense', g: 1, icon: '🕯️', name: '향초', desc: '지속시간 +15%, 범위 +8%', apply(p) { p.durMul += 0.15; p.area *= 1.08; } },
  { id: 'wine', g: 1, icon: '🍶', name: '호리병 술', desc: '모든 피해 +12%, 받는 피해 +4%', apply(p) { p.dmgMul += 0.12; p.armor *= 1.04; } },
  { id: 'clone', g: 2, icon: '👥', name: '분신 부적', desc: '발사 수 +1', apply(p) { p.extra++; } },
  { id: 'bloodring', g: 2, icon: '🩸', name: '혈옥 반지', desc: '처치 시 HP 0.3 회복, 피해 +8%', apply(p) { p.killHeal += 0.3; p.dmgMul += 0.08; } },
  { id: 'fan', g: 2, icon: '🌀', name: '태풍 부채', desc: '범위 +18%', apply(p) { p.area *= 1.18; } },
  { id: 'drum', g: 2, icon: '⚡', name: '뇌신의 북', desc: '6초마다 주변 요괴 다섯에게 벼락', apply(p) { p.itemTicks.push({ every: 6, t: 6, fn: 'drum' }); } },
  { id: 'mirror', g: 2, icon: '🔯', name: '팔괘경', desc: '치명 피해 +0.5, 받는 피해 -6%', apply(p) { p.critMul += 0.5; p.armor *= 0.94; } },
  { id: 'pearl', g: 3, icon: '🐉', name: '여의주', desc: '쓰러지면 한 번 되살아나요, 최대 HP +30', apply(p) { p.halfRevives = (p.halfRevives || 0) + 1; p.maxHp += 30; p.hp += 30; } },
  { id: 'moonblade', g: 3, icon: '🌕', name: '월광검', desc: '8초마다 거대한 달빛 검기가 사방을 베어요', apply(p) { p.itemTicks.push({ every: 8, t: 8, fn: 'moonblade' }); } },
  { id: 'crown', g: 3, icon: '👑', name: '패왕의 관', desc: '모든 피해 +30%, 보스 피해 +30%', apply(p) { p.dmgMul += 0.3; p.bossMul *= 1.3; } },
  { id: 'crow', g: 3, icon: '☀️', name: '삼족오 깃털', desc: '필살기 게이지 ×1.8, 대기시간 -10%', apply(p) { p.ultGain *= 1.8; p.haste *= 0.9; } },
  { id: 'fortune', g: 4, icon: '🌈', name: '천운', desc: '피해 +50%, 대기시간 -20%, 발사 +1, 이동 +15%', apply(p) { p.dmgMul += 0.5; p.haste *= 0.8; p.extra++; p.speed *= 1.15; } },
  { id: 'heart', g: 4, icon: '😈', name: '천마의 심장', desc: '피해 +80%, 처치 시 HP 1 회복, 최대 HP -25%', apply(p) { p.dmgMul += 0.8; p.killHeal += 1; p.maxHp = Math.round(p.maxHp * 0.75); p.hp = Math.min(p.hp, p.maxHp); } },
];
export function pullItem(p, forceG) {
  let g = forceG;
  if (g === undefined) {
    const lk = Math.max(0, p.luck - 1);
    const ws = GRADES.map((G, i) => G.w * (i >= 2 ? 1 + lk * 0.6 : 1));
    if (p.pity >= 8) ws[0] = ws[1] = 0;
    let r = Math.random() * ws.reduce((a, b) => a + b, 0);
    g = 0;
    while (r >= ws[g]) r -= ws[g++];
  }
  p.pity = g >= 2 ? 0 : p.pity + 1;
  p.pulls++;
  const pool = ITEMS.filter((it) => it.g === g);
  const it = pool[Math.floor(Math.random() * pool.length)];
  const stack = (p.items[it.id] || 0) + 1;
  p.items[it.id] = stack;
  it.apply(p);
  const dex = progress.itemDex || (progress.itemDex = {});
  const isNew = !dex[it.id];
  dex[it.id] = (dex[it.id] || 0) + 1;
  saveProgress();
  return { g, icon: it.icon, name: it.name + (stack > 1 ? ` ★${stack}` : ''), desc: it.desc, tag: isNew ? 'NEW!' : stack > 1 ? '중복 · 효과 한 번 더!' : '' };
}

export const SHRINE_BUFFS = [
  { id: 'fury', icon: '🔥', name: '분노의 제단', desc: '피해 +40%', color: '#e63c32' },
  { id: 'swift', icon: '🍃', name: '질풍의 제단', desc: '이동 속도 +35%', color: '#5ac878' },
  { id: 'focus', icon: '⏳', name: '집중의 제단', desc: '무공 대기시간 -30%', color: '#7896ff' },
  { id: 'fortune', icon: '💰', name: '재물의 제단', desc: '경험치·은자 ×2', color: '#f0be3c' },
  { id: 'guard', icon: '🛡️', name: '수호의 제단', desc: '받는 피해 -50%', color: '#c8c8e1' },
];
export const AFFIX = {
  swift: { name: '질주', color: '#8fe0ff' },
  armored: { name: '철갑', color: '#d8dce4' },
  volatile: { name: '폭발', color: '#ff7050' },
  split: { name: '분열', color: '#c7a0ff' },
};
export const RAIDS = [
  { name: '녹림 산채 습격!', sub: '산적 떼가 길을 막았다', members: ['bandit', 'bandit', 'archer'], captain: '산채 두령', capKind: 'bandit' },
  { name: '흑도 살막 습격!', sub: '보이지 않는 살수를 조심하세요', members: ['thug', 'thug', 'assassin'], captain: '흑도 두목', capKind: 'thug' },
  { name: '혈교 강림!', sub: '혈교 신도가 몰려온다', members: ['cultist', 'poisoner', 'thug', 'brawler'], captain: '혈교 교주', capKind: 'cultist' },
  { name: '마교 진격!', sub: '마교 무사단이 포위해 온다', members: ['demonguard', 'brawler', 'assassin', 'cultist'], captain: '마교 장로', capKind: 'demonguard' },
];
export const DAILY_MODS = [
  { name: '정예 행렬', desc: '정예가 세 배로 나와요', run(p, d) { d.elite *= 3; } },
  { name: '유리 대포', desc: '주는 피해 +60%, 최대 HP -40%', run(p) { p.dmgMul += 0.6; p.maxHp = Math.round(p.maxHp * 0.6); p.hp = p.maxHp; } },
  { name: '질풍노도', desc: '나와 요괴 모두 이동 속도 +25%', run(p, d) { p.speed *= 1.25; d.speed *= 1.25; } },
  { name: '황금비', desc: '은자 ×2, 황금 도깨비가 자주 나와요', run(p) { p.greed *= 2; p.goldRush = true; } },
  { name: '피의 서약', desc: '회복 불가(회복량 0), 대신 피해 +35%', run(p) { p.healMul = 0; p.regen = 0; p.dmgMul += 0.35; } },
  { name: '거인족', desc: '요괴 체력 ×1.5, 경험치 +50%', run(p, d) { d.hp *= 1.5; p.xpMul += 0.5; } },
  { name: '인해전술', desc: '요괴가 1.6배 많이 나와요, 줍는 범위 ×2', run(p, d) { d.spawn *= 1.6; p.magnet *= 2; } },
  { name: '무공 폭주', desc: '시작 무공 3단계, 대기시간 -20%', run(p) { p.startBonus = (p.startBonus || 0) + 2; p.haste *= 0.8; } },
];
export function dailyInfo(heroKeys) {
  const d = new Date();
  const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  let h = 0;
  for (const ch of date) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const rnd = () => { h = (h * 1103515245 + 12345) >>> 0; return h / 4294967296; };
  const hero = heroKeys[Math.floor(rnd() * heroKeys.length)];
  const i = Math.floor(rnd() * DAILY_MODS.length);
  let j = Math.floor(rnd() * (DAILY_MODS.length - 1));
  if (j >= i) j++;
  return { date, hero, mods: [DAILY_MODS[i], DAILY_MODS[j]] };
}

// ---------- 기연 (fortuitous encounters): run(api) → [title, sub] ----------
export const GIYEON = [
  { title: '동굴 속 영약', text: '이끼 낀 동굴 깊은 곳에서 백 년 묵은 영약이 은은히 빛난다.', options: [
    { icon: '🍵', label: '삼킨다', desc: '운이 좋으면 내공이 크게 늘지만, 탈이 날 수도 있다', run(g) { const p = g.P; if (Math.random() < 0.7) { p.maxHp += 40; p.hp += 40; p.bonusCult += 4; g.checkRealm(); return ['영약을 흡수했다!', '최대 HP +40 · 경지 수련도 +4']; } p.hp = Math.max(1, p.hp * 0.5); p.buffs.weak = 30; return ['주화입마!', 'HP 절반을 잃고 30초 동안 피해 -25%']; } },
    { icon: '💰', label: '챙겨서 판다', desc: '확실한 은자', run(g) { g.addGold(80); return ['영약을 챙겼다', '은자 +80']; } },
    { icon: '🧭', label: '그냥 지나간다', desc: '아무 일도 없다', run() { return ['조용히 동굴을 나섰다', '']; } },
  ] },
  { title: '무너진 서고의 비급', text: '무너진 서고 더미 속에서 낡은 비급 한 권이 손에 잡혔다.', options: [
    { icon: '📖', label: '읽는다', desc: '가진 무공이 크게 깨우쳐지거나… 머리가 어지러워진다', run(g) { const ids = g.upgradable(); if (ids.length && Math.random() < 0.65) { const id = ids[Math.floor(Math.random() * ids.length)]; g.grant(id); if (g.upgradable().includes(id)) g.grant(id); return ['깨달음!', `${g.weaponName(id)} +2단계`]; } g.P.buffs.dizzy = 25; return ['글자가 뒤엉킨다…', '25초 동안 무공 대기시간 +30%']; } },
    { icon: '🔥', label: '불태운다', desc: '불꽃 속에서 기운을 얻는다', run(g) { g.P.ult = 100; g.addGold(30); return ['비급이 타오른다', '필살기 게이지 가득 · 은자 +30']; } },
  ] },
  { title: '이름 없는 고수의 무덤', text: '풀숲 사이, 이름조차 새겨지지 않은 무덤 하나가 있다.', options: [
    { icon: '🙏', label: '절하고 지나간다', desc: '고수의 혼이 지켜준다', run(g) { g.P.buffs.guard = 40; g.P.luck += 0.2; return ['고수의 가호', '40초 동안 받는 피해 -50% · 행운 증가']; } },
    { icon: '⚰️', label: '무덤을 판다', desc: '보물이 있을지도… 아니면', run(g) { if (Math.random() < 0.55) { g.drop('treasure', 1.5, 0); g.drop('treasure', -1.5, 0); return ['보물이다!', '보물함 2개']; } g.ring('wongwi', 14, 9); return ['원귀들이 깨어났다!', '버텨내세요']; } },
  ] },
  { title: '술 권하는 노인', text: '바위에 걸터앉은 노인이 껄껄 웃으며 술 한 잔을 내민다.', options: [
    { icon: '🍶', label: '받아 마신다', desc: '노인의 정체는…?', run(g) { const p = g.P; if (Math.random() < 0.5 && p.realm + 1 < REALMS.length) { p.bonusCult += Math.max(0, REALMS[p.realm + 1].need - g.cultivation()); g.checkRealm(); return ['은둔 고수의 술!', '경지가 한 단계 오른다']; } p.buffs.drunk = 20; p.ult = Math.min(100, p.ult + 40); return ['독한 술이다…', '20초 동안 비틀비틀 · 필살기 게이지 +40']; } },
    { icon: '🧭', label: '정중히 사양한다', desc: '노인이 은자를 쥐여준다', run(g) { g.addGold(30); return ['노인이 웃으며 은자를 건넨다', '은자 +30']; } },
  ] },
  { title: '요괴의 거래', text: '어둠 속에서 붉은 눈이 속삭인다. "피를 조금 주면… 힘을 주지."', options: [
    { icon: '🩸', label: '피를 내준다', desc: '최대 HP를 바치고 힘을 얻는다', run(g) { const p = g.P; p.maxHp = Math.max(30, p.maxHp - 30); p.hp = Math.min(p.hp, p.maxHp); p.dmgMul += 0.25; return ['계약이 맺어졌다', '최대 HP -30 · 모든 피해 +25%']; } },
    { icon: '⚔️', label: '베어버린다', desc: '거절의 대가로 요괴 무리가 몰려온다 (경험치)', run(g) { g.ring('dokkaebi', 18, 10); return ['요괴 무리가 덤벼든다!', '']; } },
  ] },
  { title: '폭포 아래 수련터', text: '천 길 폭포 아래, 옛 고수들이 수련하던 바위가 있다.', options: [
    { icon: '🌊', label: '폭포수를 맞으며 수련한다', desc: '고통 끝에 깨달음', run(g) { const p = g.P; p.hp = Math.max(1, p.hp - p.maxHp * 0.3); for (const id of g.upgradable()) g.grant(id); return ['폭포 수련 완료!', 'HP 30% 잃음 · 모든 무공 +1단계']; } },
    { icon: '🍵', label: '물을 마시고 쉰다', desc: '기운을 회복한다', run(g) { g.P.hp = g.P.maxHp; return ['맑은 물에 기운이 돈다', 'HP 전부 회복']; } },
  ] },
];

// ---------- 업적 (r = the run summary the game hands in) ----------
export const ACHIEVEMENTS = [
  { id: 'kill100', icon: '🗡️', name: '첫 사냥', desc: '한 판에 요괴 100마리 퇴치', check: (r) => r.kills >= 100 },
  { id: 'kill1000', icon: '👹', name: '백귀야행 정리', desc: '한 판에 요괴 1,000마리 퇴치', check: (r) => r.kills >= 1000 },
  { id: 'total10000', icon: '🏯', name: '요괴 사냥꾼', desc: '누적 요괴 10,000마리 퇴치', check: () => progress.totalKills >= 10000 },
  { id: 'survive3', icon: '🌙', name: '밤을 버티다', desc: '한 판에 3분 버티기', check: (r) => r.elapsed >= 180 },
  { id: 'survive5', icon: '🌒', name: '깊은 밤', desc: '한 판에 5분 버티기', check: (r) => r.elapsed >= 300 },
  { id: 'survive10', icon: '🌅', name: '새벽을 보다', desc: '한 판에 10분 버티기', check: (r) => r.elapsed >= 600 },
  { id: 'boss1', icon: '💀', name: '첫 대어', desc: '보스 요괴 처치', check: (r) => r.bossKills >= 1 },
  { id: 'bossAll', icon: '👑', name: '삼대 요괴', desc: '대도깨비·이무기·흑요장군을 모두 처치 (누적)', check: () => ['대도깨비', '이무기', '흑요장군'].every((b) => progress.bosses[b]) },
  { id: 'combo1', icon: '✨', name: '첫 합성', desc: '무공 합성에 성공', check: () => progress.combos.length >= 1 },
  { id: 'combo5', icon: '📖', name: '비급 수집가', desc: '서로 다른 합성 5가지 발견 (누적)', check: () => progress.combos.length >= 5 },
  { id: 'comboAll', icon: '📚', name: '무공의 대가', desc: '모든 합성 발견', check: (r) => progress.combos.length >= r.evoTotal },
  { id: 'combo3run', icon: '🔥', name: '삼합', desc: '한 판에 합성 3번', check: (r) => r.evos >= 3 },
  { id: 'level20', icon: '⛰️', name: '경지에 오르다', desc: '한 판에 Lv.20 도달', check: (r) => r.level >= 20 },
  { id: 'fullSlots', icon: '🎒', name: '무공 수집', desc: '무공 칸을 모두 채우기', check: (r) => r.weapons >= r.maxWeapons },
  { id: 'chest3', icon: '🎁', name: '보물 사냥꾼', desc: '한 판에 보물함 3개 열기', check: (r) => r.chests >= 3 },
  { id: 'sectUlt1', icon: '🏮', name: '문파의 비전', desc: '문파 오의를 처음으로 깨우치기', check: (r) => progress.combos.some((id) => r.partnerEvo(id)) },
  { id: 'sectUlt3', icon: '🐉', name: '무림의 패자', desc: '서로 다른 문파 오의 3가지 발견 (누적)', check: (r) => progress.combos.filter((id) => r.partnerEvo(id)).length >= 3 },
  { id: 'realm3', icon: '🌀', name: '절정고수', desc: '한 판에 절정의 경지에 오르기', check: (r) => r.realm >= 3 },
  { id: 'realm5', icon: '☀️', name: '화경의 문턱', desc: '한 판에 화경의 경지에 오르기', check: (r) => r.realm >= 5 },
  { id: 'realm7', icon: '🌈', name: '생사경', desc: '한 판에 생사경에 오르기', check: (r) => r.realm >= 7 },
  { id: 'stage2', icon: '🏮', name: '숲으로', desc: '1장 돌파', check: () => progress.bestStage >= 1 },
  { id: 'stage3', icon: '🏯', name: '산사의 종소리', desc: '3장 돌파', check: () => progress.bestStage >= 3 },
  { id: 'reaper', icon: '⚰️', name: '저승사자 퇴치', desc: '4장의 저승사자를 쓰러뜨려 모든 장 돌파', check: () => progress.wins >= 1 },
  { id: 'elite5', icon: '🌟', name: '정예 사냥', desc: '한 판에 정예 요괴 5마리 처치', check: (r) => r.elites >= 5 },
  { id: 'lantern20', icon: '🏮', name: '석등 파괴자', desc: '한 판에 석등 20개 부수기', check: (r) => r.lanterns >= 20 },
  { id: 'gold1000', icon: '💰', name: '부자 협객', desc: '누적 은자 1,000냥 모으기', check: () => progress.totalGold >= 1000 },
  { id: 'shop1', icon: '🥋', name: '수련의 시작', desc: '수련장에서 처음으로 수련하기', check: () => Object.keys(progress.shop).length > 0 },
  { id: 'cursed', icon: '💀', name: '마기를 품고', desc: '마기 3단계 이상으로 저승사자 퇴치', check: (r) => r.curse >= 0.29 && r.won },
  { id: 'clearHard', icon: '🔥', name: '고수의 길', desc: '고수 난이도로 저승사자 퇴치', check: () => progress.clears.hard || progress.clears.hell },
  { id: 'clearHell', icon: '💀', name: '마경 정복', desc: '마경 난이도로 저승사자 퇴치', check: () => progress.clears.hell || progress.clears.cheonma },
  { id: 'clearCheonma', icon: '😈', name: '천마경 정복', desc: '천마경 난이도로 저승사자 퇴치', check: () => progress.clears.cheonma },
  { id: 'quest5', icon: '📜', name: '의뢰 해결사', desc: '의뢰 5개 완료 (누적)', check: () => progress.questsDone >= 5 },
  { id: 'mastery5', icon: '🥋', name: '일인전승', desc: '협객 하나의 숙련도를 Lv.5까지 올리기', check: () => Object.keys(progress.mastery).some((id) => masteryLevel(id) >= 5) },
  { id: 'combo300', icon: '🔥', name: '삼백연격', desc: '한 판에 300연격 달성', check: (r) => r.maxCombo >= 300 },
  { id: 'goldHunt', icon: '💰', name: '황금 사냥꾼', desc: '황금 도깨비 포획 (누적 3마리)', check: () => (progress.goldKills || 0) >= 3 },
  { id: 'shrine3', icon: '🏮', name: '제단의 축복', desc: '한 판에 제단 3번 사용', check: (r) => r.shrinesUsed >= 3 },
  { id: 'duel1', icon: '⚔️', name: '비무 승리', desc: '떠돌이 고수와의 비무에서 승리', check: () => (progress.duelWins || 0) >= 1 },
  { id: 'duel5', icon: '👑', name: '천하무적', desc: '비무 5승 (누적)', check: () => (progress.duelWins || 0) >= 5 },
  { id: 'giyeon3', icon: '📖', name: '기연을 만나다', desc: '기연 3번 겪기 (누적)', check: () => (progress.giyeonCount || 0) >= 3 },
  { id: 'sect10', icon: '🏯', name: '문파의 기틀', desc: '문파 건물 레벨 합 10', check: () => Object.values(progress.sect || {}).reduce((a, b) => a + b, 0) >= 10 },
  { id: 'sanctum', icon: '✨', name: '하늘 밖의 검', desc: '숨겨진 사당을 찾아 천외비선을 깨우치기', secret: true, hint: '맵 어딘가, 아주 드물게 이끼 낀 비석이…', check: () => !!progress.secrets?.sanctum },
  { id: 'secretOne', icon: '🗡️', name: '하나의 길', desc: '무공을 단 하나만 지닌 채 3장 돌파', secret: true, hint: '하나의 길만 걷는 자에게…', check: (r) => r.cleared >= 3 && r.weapons === 1 },
  { id: 'sealTap', icon: '🏮', name: '일곱 번의 낙관', desc: '제목의 낙관을 일곱 번 두드리기 (은자 300)', secret: true, hint: '제목을 유심히 보면…', check: () => !!progress.secrets?.seal },
  { id: 'allHeroes', icon: '🧭', name: '팔도 유람', desc: '해금 없이 고를 수 있는 협객으로 모두 한 번씩 출정', check: (r) => r.baseHeroes.every((id) => progress.played.includes(id)) },
];
export const ACHV_BY_ID = Object.fromEntries(ACHIEVEMENTS.map((a) => [a.id, a]));
export const HERO_UNLOCK = { cheonma: 'survive10', sansin: 'combo5', dokgo: 'reaper', hyeolrang: 'kill1000', hyeonmu: 'elite5', jusun: 'lantern20', hwaryeon: 'realm7', dueok: 'gold1000', nameless: 'secretOne', maengju: 'sectUlt3' };
export const heroUnlocked = (key) => !HERO_UNLOCK[key] || progress.achievements.includes(HERO_UNLOCK[key]);
export function checkAchievements(r, onNew) {
  for (const a of ACHIEVEMENTS) {
    if (progress.achievements.includes(a.id)) continue;
    let ok = false;
    try { ok = a.check(r); } catch (e) { ok = false; }
    if (!ok) continue;
    progress.achievements.push(a.id);
    saveProgress();
    const hero = Object.keys(HERO_UNLOCK).find((k) => HERO_UNLOCK[k] === a.id);
    onNew(a, hero);
  }
}

// ---------- 의뢰 (daily requests) ----------
const todayKey = () => { const d = new Date(); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };
function seededRandom(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1103515245 + 12345) >>> 0) / 4294967296); }
export function ensureQuests(heroes) {
  const key = todayKey();
  if (progress.quests && progress.quests.date === key) return progress.quests.list;
  const r = seededRandom([...key].reduce((h, c) => h * 31 + c.charCodeAt(0), 7) >>> 0);
  const open = heroes.filter((h) => heroUnlocked(h.key));
  const TYPES = [
    () => { const n = [300, 500, 800][Math.floor(r() * 3)]; return { type: 'kills', n, text: `한 판에 요괴 ${n}마리 퇴치`, reward: Math.round(n / 4) }; },
    () => { const n = 1 + Math.floor(r() * 2); return { type: 'clear', n, text: `${n}장 돌파`, reward: 120 * n }; },
    () => { const h = open[Math.floor(r() * open.length)]; return { type: 'heroClear', h: h.key, text: `${h.name}(으)로 1장 돌파`, reward: 180 }; },
    () => { const n = [3, 5][Math.floor(r() * 2)]; return { type: 'ults', n, text: `한 판에 필살기 ${n}번 사용`, reward: 40 * n }; },
    () => { const n = [20, 40][Math.floor(r() * 2)]; return { type: 'dashes', n, text: `한 판에 경공 ${n}번`, reward: 3 * n }; },
    () => { const n = 2 + Math.floor(r() * 2); return { type: 'elites', n, text: `한 판에 정예 요괴 ${n}마리 처치`, reward: 60 * n }; },
    () => { const n = [8, 12][Math.floor(r() * 2)]; return { type: 'lanterns', n, text: `한 판에 석등 ${n}개 부수기`, reward: 10 * n }; },
    () => ({ type: 'combo', n: 1, text: '한 판에 무공 합성 성공', reward: 150 }),
    () => { const n = 3 + Math.floor(r() * 2); return { type: 'realm', n, text: `한 판에 ${REALMS[n].name}의 경지 도달`, reward: 60 * n }; },
    () => ({ type: 'hardClear', n: 1, text: '고수 이상 난이도로 1장 돌파', reward: 250 }),
  ];
  const types = [...TYPES.keys()].sort(() => r() - 0.5).slice(0, 3);
  progress.quests = { date: key, list: types.map((i) => ({ ...TYPES[i](), done: false })) };
  saveProgress();
  return progress.quests.list;
}
function questMet(q, r) {
  switch (q.type) {
    case 'kills': return r.kills >= q.n;
    case 'clear': return r.cleared >= q.n;
    case 'heroClear': return r.hero === q.h && r.cleared >= 1;
    case 'ults': return r.ults >= q.n;
    case 'dashes': return r.dashes >= q.n;
    case 'elites': return r.elites >= q.n;
    case 'lanterns': return r.lanterns >= q.n;
    case 'combo': return r.evos >= 1;
    case 'realm': return r.realm >= q.n;
    case 'hardClear': return r.diffHp >= 1.5 && r.cleared >= 1;
  }
  return false;
}
// Returns the rewards earned (gold is paid straight into the save).
export function checkQuests(r, heroes) {
  const out = [];
  for (const q of ensureQuests(heroes)) {
    if (q.done || !questMet(q, r)) continue;
    q.done = true;
    progress.gold += q.reward;
    progress.questsDone++;
    out.push(q);
  }
  saveProgress();
  return out;
}

// ---------- end-of-run bookkeeping ----------
export const DIFF_SCORE = { easy: 0.5, normal: 1, hard: 1.6, hell: 2.4, cheonma: 3.5 };
const SCORE_RANKS = [[0, '구품'], [2500, '팔품'], [6000, '칠품'], [11000, '육품'], [18000, '오품'], [28000, '사품'], [42000, '삼품'], [65000, '이품'], [100000, '일품']];
export const rankName = (score) => SCORE_RANKS.filter(([min]) => score >= min).pop()[1];
const fmtTime = (sec) => `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(Math.floor(sec % 60)).padStart(2, '0')}`;
export function recordScore(r, diff, daily) {
  const raw = r.kills * 2 + r.elapsed * 3 + r.stage * 800 + (r.won ? 3000 : 0) + r.bossKills * 400 + r.elites * 80 + r.maxCombo * 2;
  const score = Math.round(raw * (DIFF_SCORE[diff.id] || 1) * (1 + 0.25 * (diff.heat || 0)));
  const best = score > (progress.bestScore || 0);
  if (best) progress.bestScore = score;
  progress.records = [...(progress.records || []), { score, hero: r.hero, diff: diff.name, win: !!r.won }].sort((a, b) => b.score - a.score).slice(0, 5);
  progress.history = [{ score, hero: r.hero, diff: diff.name, daily: !!daily, result: r.won ? '퇴치' : '패배', stage: r.stageName, time: fmtTime(r.elapsed), mode: '3D' }, ...(progress.history || [])].slice(0, 10);
  if (daily) {
    const d = progress.daily && progress.daily.date === daily.date ? progress.daily : { date: daily.date, best: 0, tries: 0 };
    d.tries++;
    d.best = Math.max(d.best, score);
    progress.daily = d;
  }
  let unlocked = 0;
  const h = diff.heat || 0;
  if (!daily && r.won && diff.id !== 'easy' && h >= (progress.heat || 0) && h < HEAT_MAX) { progress.heat = h + 1; unlocked = progress.heat; }
  saveProgress();
  return { score, best, unlocked, rank: rankName(score) };
}
export function gainFame(r) {
  const f = Math.floor(r.kills / 25) + 15 * r.cleared + (r.won ? 60 : 0) + Math.floor(r.elapsed / 20);
  progress.fame = (progress.fame || 0) + f;
  saveProgress();
  return f;
}
export function gainMastery(r) {
  const before = masteryLevel(r.hero);
  const xp = Math.floor(r.kills / 15) + 25 * r.cleared + (r.won ? 80 : 0) + Math.floor(r.elapsed / 30);
  progress.mastery[r.hero] = (progress.mastery[r.hero] || 0) + xp;
  saveProgress();
  return { xp, before, after: masteryLevel(r.hero) };
}

// ---------- 출석 & 방치 ----------
export const ATTEND = [{ gold: 200 }, { boxes: 1 }, { gold: 400 }, { boxes: 2 }, { gold: 600 }, { boxes: 2 }, { gold: 1000, boxes: 3 }];
const attendText = (r) => [r.gold ? `은자 ${r.gold}` : '', r.boxes ? `장비 상자 ${r.boxes}` : ''].filter(Boolean).join(' + ');
export const attendPending = () => (progress.attend?.last || '') !== todayKey();
const idleRate = () => 30 + 40 * (progress.bestStage || 0) + 2 * Object.keys(progress.sect || {}).length;
function idlePending() {
  if (!progress.idleAt) { progress.idleAt = Date.now(); saveProgress(); }
  const hours = Math.min(12, (Date.now() - progress.idleAt) / 3600000);
  return { hours, gold: Math.floor(hours * idleRate()) };
}

// ---------- UI: toast, gacha reveal, lobby screens ----------
const $ = (id) => document.getElementById(id);
const toastQ = [];
let toastBusy = false;
export function toast(title, sub = '') {
  toastQ.push([title, sub]);
  if (!toastBusy) nextToast();
}
function nextToast() {
  const t = toastQ.shift(), el = $('toast');
  if (!t) { toastBusy = false; el.classList.remove('show'); return; }
  toastBusy = true;
  el.innerHTML = `<b>${t[0]}</b>${t[1] ? `<small>${t[1]}</small>` : ''}`;
  el.classList.add('show');
  setTimeout(() => { el.classList.remove('show'); setTimeout(nextToast, 300); }, 2400);
}

let sound = () => {};
export function setSound(fn) { sound = fn; }
// The orb flashes up through the grades before the card turns over (the "it's going gold!" beat).
let gacha = null;
export function showGacha(src, roll, onClose) {
  const res = roll();
  const el = $('gacha'), orb = el.querySelector('.orb'), card = el.querySelector('.gcard');
  el.querySelector('.gsrc').textContent = src;
  card.style.display = 'none'; orb.style.display = '';
  el.className = 'overlay on g0';
  orb.style.setProperty('--gc', GRADES[0].color);
  gacha = { res, done: false, timers: [], onClose };
  const T = (ms, f) => gacha.timers.push(setTimeout(f, ms));
  for (let k = 1; k <= res.g; k++) T(380 + k * 400, () => { el.className = `overlay on g${k} bump`; orb.style.setProperty('--gc', GRADES[k].color); sound('gachaStep', k); setTimeout(() => el.classList.remove('bump'), 150); });
  T(600 + res.g * 400 + 200, revealGacha);
  sound('gachaShake');
}
function revealGacha() {
  if (!gacha || gacha.done) return;
  gacha.timers.forEach(clearTimeout);
  gacha.done = true;
  const { g, icon: ic, name, desc, tag } = gacha.res;
  const el = $('gacha'), card = el.querySelector('.gcard');
  el.className = `overlay on g${g} revealed`;
  el.querySelector('.orb').style.display = 'none';
  card.style.setProperty('--gc', GRADES[g].color);
  card.innerHTML = `<div class="ggrade">${GRADES[g].name}</div>${icon(ic, 'gicon')}<b>${name}</b><span>${desc}</span><em>${tag || ''}</em><small>눌러서 계속</small>`;
  card.style.display = '';
  sound('gachaReveal', g);
  if (g >= 3) toast(`${GRADES[g].name} 등급 획득!`, name);
}
export function gachaAdvance() {
  if (!gacha) return false;
  if (!gacha.done) { revealGacha(); return true; }
  const done = gacha.onClose;
  gacha = null;
  $('gacha').className = 'overlay';
  done && done();
  return true;
}
export const gachaOpen = () => !!gacha;

// Lobby: one overlay with tabs. ctx gives the game's tables for the 도감 and 기록.
let LCTX = null;
export function initLobby(ctx) { LCTX = ctx; }
const TABS = [['shop', '수련장'], ['sect', '문파'], ['gear', '장비'], ['attend', '출석·방치'], ['quest', '의뢰'], ['achv', '업적'], ['dex', '도감'], ['record', '기록'], ['settings', '설정']];
export function openLobby(tab = 'shop') {
  const el = $('lobby');
  el.classList.add('on');
  $('lobbyTabs').innerHTML = TABS.map(([id, n]) => `<button class="btn tab${id === tab ? ' sel' : ''}" data-tab="${id}">${n}${id === 'attend' && attendPending() ? ' •' : ''}</button>`).join('');
  $('lobbyTabs').querySelectorAll('button').forEach((b) => (b.onclick = () => openLobby(b.dataset.tab)));
  $('lobbyPurse').textContent = `은자 ${progress.gold}냥 · 명성 ${progress.fame || 0} · 장비 상자 ${progress.gearBoxes || 0}`;
  const body = $('lobbyBody');
  const card = (ic, title, stars, desc, key, on, cls = '') => `<button class="card shop ${cls}" ${on ? '' : 'disabled'} data-k="${key}">${icon(ic)}<b>${title}</b><span class="st">${stars}</span><span>${desc}</span></button>`;
  const rerender = () => { openLobby(tab); LCTX?.onChange?.(); };
  if (tab === 'shop') {
    body.innerHTML = `<p>은자로 영구 수련을 해요 (2D 판과 공유)</p><div class="cards">${SHOP.map((u) => { const lv = shopLevel(u.id), max = lv >= u.max; return card(u.icon, u.name, '★'.repeat(lv) + '☆'.repeat(u.max - lv), `${u.desc}<br><i>${max ? '완성' : `은자 ${shopCost(u)}`}</i>`, u.id, !max && progress.gold >= shopCost(u), max ? 'maxed' : ''); }).join('')}</div>`;
    body.querySelectorAll('[data-k]').forEach((b) => (b.onclick = () => { const u = SHOP.find((x) => x.id === b.dataset.k); const c = shopCost(u); if (progress.gold < c || shopLevel(u.id) >= u.max) return; progress.gold -= c; progress.shop[u.id] = shopLevel(u.id) + 1; saveProgress(); sound('select'); rerender(); }));
  } else if (tab === 'sect') {
    body.innerHTML = `<p>${progress.sectName ? `「${progress.sectName}」 ` : ''}명성으로 문파 건물을 지어요</p><div class="cards">${SECT_BUILDINGS.map((b) => { const lv = sectLevel(b.id), max = lv >= b.max; return card(b.icon, b.name, '★'.repeat(lv) + '☆'.repeat(b.max - lv), `${b.desc}<br><i>${max ? '완공' : `명성 ${buildCost(b)}`}</i>`, b.id, !max && (progress.fame || 0) >= buildCost(b), max ? 'maxed' : ''); }).join('')}</div>`;
    body.querySelectorAll('[data-k]').forEach((b) => (b.onclick = () => { const B = SECT_BUILDINGS.find((x) => x.id === b.dataset.k); const c = buildCost(B); if ((progress.fame || 0) < c || sectLevel(B.id) >= B.max) return; progress.fame -= c; progress.sect[B.id] = sectLevel(B.id) + 1; saveProgress(); sound('chest'); rerender(); }));
  } else if (tab === 'gear') {
    body.innerHTML = `<div class="row"><button class="btn main" id="gOpen" ${progress.gearBoxes > 0 ? '' : 'disabled'}>장비 상자 열기 (${progress.gearBoxes || 0})</button><button class="btn" id="gBuy" ${progress.gold >= GEAR_COST ? '' : 'disabled'}>은자 ${GEAR_COST}냥으로 뽑기</button></div>
      <div class="glist">${GEAR.map((G) => { const inv = gearInv(G.id), g = gearBest(G.id), mg = inv.findIndex((n, i) => i < 4 && n >= 3);
        return `<div class="grow" style="--gc:${g >= 0 ? GRADES[g].color : '#999'}">${icon(G.icon)}<div><b>${g >= 0 ? `${G.slot} · ${G.names[g]} (${GRADES[g].name})` : `${G.slot} · 없음`}</b><small>${g >= 0 ? G.desc(G.val[g]) : '장비 상자에서 얻을 수 있어요'}</small><small class="dim">보관: ${inv.map((n, i) => `${GRADES[i].name} ${n}`).join(' · ')}</small></div>${mg >= 0 ? `<button class="btn" data-m="${G.id}:${mg}">합성 ${GRADES[mg].name}3→${GRADES[mg + 1].name}</button>` : ''}</div>`; }).join('')}</div>`;
    $('gOpen').onclick = () => { if (!(progress.gearBoxes > 0)) return; progress.gearBoxes--; saveProgress(); showGacha('장비 상자', rollGear, rerender); };
    $('gBuy').onclick = () => { if (progress.gold < GEAR_COST) return; progress.gold -= GEAR_COST; saveProgress(); showGacha('은자 뽑기', rollGear, rerender); };
    body.querySelectorAll('[data-m]').forEach((b) => (b.onclick = () => { const [id, g] = b.dataset.m.split(':'); const inv = gearInv(id); if (inv[+g] < 3) return; inv[+g] -= 3; inv[+g + 1]++; saveProgress(); sound('gachaReveal', +g + 1); toast(`${GRADES[+g + 1].name} 장비 합성!`, GEAR.find((x) => x.id === id).names[+g + 1]); rerender(); }));
  } else if (tab === 'attend') {
    const a = progress.attend || { last: '', day: 0 }, next = attendPending() ? a.day % 7 : -1, idle = idlePending();
    body.innerHTML = `<div class="attend">${ATTEND.map((r, i) => `<div class="aday${i < (next >= 0 ? next : ((a.day - 1) % 7) + 1) ? ' got' : ''}${i === next ? ' today' : ''}"><b>${i + 1}일</b><small>${attendText(r)}</small></div>`).join('')}</div>
      <div class="row"><button class="btn main" id="aClaim" ${next < 0 ? 'disabled' : ''}>${next < 0 ? '오늘은 이미 받았어요' : `${next + 1}일차 보상 받기`}</button></div>
      <p>문파 제자들이 수련하며 모은 은자: <b>${idle.gold}냥</b> (${idle.hours.toFixed(1)}시간 · 최대 12시간 · 시간당 ${idleRate()}냥)</p>
      <div class="row"><button class="btn" id="iClaim" ${idle.gold < 1 ? 'disabled' : ''}>방치 보상 받기</button></div>`;
    $('aClaim').onclick = () => { if (!attendPending()) return; const at = progress.attend || (progress.attend = { last: '', day: 0 }); const r = ATTEND[at.day % 7]; at.day++; at.last = todayKey(); progress.gold += r.gold || 0; progress.gearBoxes = (progress.gearBoxes || 0) + (r.boxes || 0); saveProgress(); sound('chest'); toast('출석 보상!', attendText(r)); rerender(); };
    $('iClaim').onclick = () => { const i = idlePending(); if (i.gold < 1) return; progress.gold += i.gold; progress.idleAt = Date.now(); saveProgress(); sound('coin', 8); toast('방치 보상 수령', `은자 ${i.gold}냥`); rerender(); };
  } else if (tab === 'quest') {
    const qs = ensureQuests(LCTX.heroes);
    body.innerHTML = `<p>오늘의 의뢰 · 판이 끝날 때 조건을 채우면 은자를 받아요 (누적 ${progress.questsDone}개 완료)</p><div class="glist">${qs.map((q) => `<div class="grow${q.done ? ' done' : ''}">${icon(q.done ? '🏅' : '📜')}<div><b>${q.text}</b><small>보상 은자 ${q.reward}냥${q.done ? ' · 완료!' : ''}</small></div></div>`).join('')}</div>`;
  } else if (tab === 'achv') {
    const got = progress.achievements.length;
    body.innerHTML = `<p>${got} / ${ACHIEVEMENTS.length} 달성</p><div class="glist two">${ACHIEVEMENTS.map((a) => { const ok = progress.achievements.includes(a.id), hero = Object.keys(HERO_UNLOCK).find((k) => HERO_UNLOCK[k] === a.id), h = hero && LCTX.heroes.find((x) => x.key === hero);
      return `<div class="grow${ok ? ' done' : ' locked'}">${icon(ok ? a.icon : '🔒')}<div><b>${ok || !a.secret ? a.name : '???'}</b><small>${ok || !a.secret ? a.desc : a.hint}</small>${h ? `<small class="dim">해금: ${h.name} · ${h.role}</small>` : ''}</div></div>`; }).join('')}</div>`;
  } else if (tab === 'dex') {
    const b = progress.bestiary || {}, dex = progress.itemDex || {};
    body.innerHTML = `<h3>요괴 도감</h3><div class="dex">${Object.entries(LCTX.enemies).map(([k, t]) => `<div class="dx${b[k] ? '' : ' unk'}"><img src="${A(`${k}.png`)}" alt=""><small>${b[k] ? `${t.name}<br>${b[k]}마리` : '???'}</small></div>`).join('')}</div>
      <h3>기물 도감</h3><div class="dex">${ITEMS.map((it) => `<div class="dx${dex[it.id] ? '' : ' unk'}" style="--gc:${GRADES[it.g].color}">${icon(it.icon)}<small>${dex[it.id] ? `${it.name}<br>${it.desc}` : `??? (${GRADES[it.g].name})`}</small></div>`).join('')}</div>
      <h3>합성 비급 (${progress.combos.length})</h3><div class="dex">${LCTX.evos().map(([id, name, ic]) => `<div class="dx${progress.combos.includes(id) ? '' : ' unk'}"><img src="${A(ic)}" alt=""><small>${progress.combos.includes(id) ? name : '???'}</small></div>`).join('')}</div>`;
  } else if (tab === 'record') {
    const hn = (k) => LCTX.heroes.find((h) => h.key === k)?.name || k;
    const d = progress.daily;
    body.innerHTML = `<p>최고 점수 <b>${progress.bestScore || 0}</b> (${rankName(progress.bestScore || 0)}) · 업화 ${progress.heat || 0}단계 열림 · 퇴치 ${progress.wins}회 · 누적 처치 ${progress.totalKills}</p>
      ${d ? `<p>일일 도전 ${d.date}: 최고 ${d.best}점 · ${d.tries}번 도전</p>` : ''}
      <h3>명예의 전당</h3><div class="glist">${(progress.records || []).map((r, i) => `<div class="grow"><b>${i + 1}</b><div><b>${r.score}점 · ${rankName(r.score)}</b><small>${hn(r.hero)} · ${r.diff}${r.win ? ' · 퇴치' : ''}</small></div></div>`).join('') || '<p>아직 기록이 없어요</p>'}</div>
      <h3>최근 기록</h3><div class="glist">${(progress.history || []).map((r) => `<div class="grow"><div><b>${r.score}점 · ${hn(r.hero)} · ${r.result}</b><small>${r.diff}${r.daily ? ' (일일)' : ''} · ${r.stage}까지 · ${r.time}${r.mode ? ` · ${r.mode}` : ''}</small></div></div>`).join('')}</div>
      <h3>협객 숙련도</h3><div class="dex">${LCTX.heroes.map((h) => `<div class="dx${progress.mastery[h.key] ? '' : ' unk'}"><img src="${A(`${h.key}.png`)}" alt=""><small>${h.name}<br>숙련 Lv.${masteryLevel(h.key)}</small></div>`).join('')}</div>`;
  } else if (tab === 'settings') {
    const S = [['sfx', '효과음'], ['music', '음악'], ['vib', '진동'], ['shake', '화면 흔들림'], ['nums', '피해 숫자']];
    body.innerHTML = `<div class="row">${S.map(([k, n]) => `<button class="btn${settings[k] ? ' sel' : ''}" data-s="${k}">${n} ${settings[k] ? '켬' : '끔'}</button>`).join('')}</div><p class="dim">저장은 2D 판과 같은 브라우저 저장소를 써요.</p>`;
    body.querySelectorAll('[data-s]').forEach((b) => (b.onclick = () => { settings[b.dataset.s] = !settings[b.dataset.s]; saveProgress(); LCTX.onSettings?.(); rerender(); }));
  }
}
