// The cast: every hero and foe as a base model + palette (by material name) + wuxia gear.
// Bases: adv = young swordsman (shaved), hood = woman (hood off unless `hooded`), mon = armoured lord.
const SK = '#e2bc98', SKF = '#ecc8a8';
// adventurer materials: Green/LightGreen = tunic, Brown = trousers, Brown2/Black = belt & boots, Grey = trim, Hair (+ beard)
const adv = (o) => ({ base: 'adventurer', shave: o.beard ? 0 : 1, hide: ['Backpack', ...(o.bald ? ['Adventurer_Head_4'] : []), ...(o.hide || [])],
  col: { Skin: o.skin || SK, Green: o.main, LightGreen: o.main2 || o.main, Brown: o.pants || '#16141a', Brown2: o.belt || '#2a2226', Black: o.boots || '#121014', Grey: o.trim || '#2a2a30', Hair: o.hair || '#141216', Eyebrows: o.hair || '#141216', Gold: o.gold || '#c9a040' },
  hairColor: o.hair || '#141216', gear: o.gear || [], scale: o.scale, opts: o.opts, opacity: o.opacity, emissive: o.emissive });
// hooded adventurer materials: LightBrown = top, Brown2 = trousers, DarkBrown = hood, Metal = shoulder flares, White = hair, Brown = belt
const hood = (o) => ({ base: 'hooded_adventurer', hide: ['Sword', ...(o.hooded ? [] : ['Medieval_Head_2']), ...(o.hide || [])],
  col: { Skin: o.skin || SKF, LightBrown: o.main, Brown2: o.pants || '#1a1618', DarkBrown: o.hoodc || o.pants || '#1a1618', Metal: o.flare || o.main2 || o.main, Metal_Dark: o.trim || '#2a2228', White: o.hair || '#121014', Brown: o.belt || '#141216', Black: o.boots || '#121014', Gold: o.gold || '#c9a040' },
  hairColor: o.hair || '#121014', gear: o.gear || [], scale: o.scale, opts: o.opts, opacity: o.opacity, emissive: o.emissive });
// monarch materials: Blue = tunic, Metal/Metal_Dark = armour, Beige = sash, DarkBrown = trousers, Hair_White (+ beard), King_Head_4 = crown
const mon = (o) => ({ base: 'monarch', shave: o.beard ? 0 : 1, hide: ['King_Head_4', ...(o.hide || [])],
  col: { Skin: o.skin || SK, Blue: o.main, Metal: o.armor || o.main2 || o.main, Metal_Dark: o.armor2 || '#16131a', Beige: o.sash || '#c9a040', DarkBrown: o.pants || '#141018', Hair_White: o.hair || '#141216', Gold: o.gold || '#c9a040' },
  hairColor: o.hair || '#141216', gear: o.gear || [], scale: o.scale, opts: o.opts, opacity: o.opacity, emissive: o.emissive });
const beast = (b, o) => ({ base: b, col: o.col || {}, scale: o.scale, opacity: o.opacity, emissive: o.emissive, gear: [] });

export const HERO_KINDS = {
  cheongpung: adv({ main: '#183c40', main2: '#235458', gear: ['band', 'topknot', 'long', 'sword'], opts: { len: 0.5 } }),
  unhak: mon({ main: '#d8dae2', armor: '#c8ccd8', armor2: '#3a4a6a', sash: '#2a3a5a', gear: ['guan', 'long', 'sword'], opts: { guard: '#c8ccd8' } }),
  yeoubi: hood({ main: '#8a1a24', main2: '#e8e4ec', pants: '#3a0c12', hair: '#ece8f0', gear: ['ears', 'long', 'fan'], opts: { len: 0.85, fan: '#c8343a' } }),
  cheolsan: adv({ main: '#b8642a', main2: '#c87a34', pants: '#6a3a1a', bald: 1, gear: ['staff'], scale: 1.1 }),
  dallae: hood({ main: '#e8e4dc', main2: '#a8242c', pants: '#a8242c', gear: ['long', 'fan'], opts: { len: 0.8, fan: '#e8e0c8' } }),
  yawol: hood({ hooded: 1, main: '#1a1418', main2: '#4a1018', pants: '#121014', hoodc: '#121014', gear: ['mask', 'sword'], opts: { guard: '#4a1018' } }),
  songhwa: hood({ main: '#3a6a3a', main2: '#d8d0b0', pants: '#2a3a24', gear: ['pony', 'fan'], opts: { fan: '#8ab060' } }),
  muyeong: adv({ main: '#2a2a30', main2: '#3a3a44', hair: '#e6e2ea', gear: ['long', 'blade'], opts: { len: 0.7 } }),
  geumbi: hood({ main: '#c89a2a', main2: '#a8242c', pants: '#5a1a14', gear: ['pony', 'fan'], opts: { fan: '#f0d878' } }),
  seola: hood({ main: '#dce8f4', main2: '#8ab8e0', pants: '#a8c4dc', hair: '#f0f4f8', gear: ['long', 'sword'], opts: { len: 0.9, guard: '#8ab8e0' } }),
  cheonma: mon({ main: '#1a0c10', armor: '#3a0e14', armor2: '#14080a', sash: '#8a141c', pants: '#0c0a0c', hair: '#0c0a0e', gold: '#a8242c', gear: ['guan', 'long'], opts: { len: 0.8 } }),
  sansin: mon({ beard: 1, main: '#e8e4dc', armor: '#d8d2c4', armor2: '#a89a7a', sash: '#6a8a4a', hair: '#ece8e0', gear: ['staff'] }),
  baekmae: hood({ main: '#e8e2d8', main2: '#c84a6a', pants: '#1a1618', gear: ['pony', 'sword'], opts: { guard: '#c84a6a', tassel: '#e88aa8' } }),
  palgeol: adv({ beard: 1, main: '#6a5a3a', main2: '#7a6a44', pants: '#4a3a2a', hair: '#2a2016', gear: ['band', 'staff'], opts: { band: '#6a4a2a' } }),
  dangyu: adv({ main: '#2a3a2a', main2: '#3a2a4a', gear: ['mask', 'topknot'] }),
  namgung: mon({ main: '#16224a', armor: '#1c2a5a', armor2: '#121a3a', sash: '#c9a040', gold: '#e0b850', gear: ['guan', 'sword'] }),
  aemi: hood({ main: '#9ac0e0', main2: '#e8ecf0', pants: '#3a4a6a', gear: ['pony', 'sword'], opts: { guard: '#9ac0e0' } }),
  gonryun: adv({ main: '#d8e4ee', main2: '#9ac0e0', pants: '#3a4a5a', gear: ['topknot', 'long', 'sword'], opts: { guard: '#9ac0e0' } }),
  jegal: hood({ main: '#2a5a5a', main2: '#e8e4dc', pants: '#1a2a2a', gear: ['long', 'fan'], opts: { fan: '#f2efe6' } }),
  dokgo: adv({ main: '#4a4c52', main2: '#5c5e66', pants: '#1c1a1e', hair: '#1a1820', gear: ['straw', 'long', 'sword'], opts: { len: 0.65 } }),
  hyeolrang: adv({ main: '#2a1a1e', main2: '#6a1018', pants: '#141014', hair: '#2a1416', gear: ['long', 'blade'], opts: { len: 0.6 } }),
  hyeonmu: mon({ main: '#2a1e3a', armor: '#3a2a4a', armor2: '#141018', sash: '#e8d070', gear: ['gat'] }),
  jusun: adv({ beard: 1, main: '#9a5a24', main2: '#b87a34', pants: '#3a2a1a', gear: ['band'], opts: { band: '#e8d070' } }),
  hwaryeon: hood({ main: '#c8401a', main2: '#f0a030', pants: '#5a1408', gear: ['long', 'fan'], opts: { fan: '#f0a030' } }),
  dueok: mon({ main: '#2a2a3a', armor: '#3a3a4a', skin: '#4a6ad0', sash: '#c8782a', gear: ['horns', 'club'], scale: 1.3 }),
  nameless: adv({ main: '#5a4a3a', main2: '#6a5a48', pants: '#2a241e', gear: ['straw', 'sword'] }),
  maengju: mon({ main: '#ece8e0', armor: '#d8c8a0', armor2: '#8a6a2a', sash: '#c9a040', gold: '#e8c050', gear: ['crown', 'long', 'sword'], opts: { guard: '#e8c050' } }),
};

export const FOE_KINDS = {
  wisp: beast('bat', { col: { Main: '#2a4ab0', Belly: '#9fd8ff', Nose: '#9fd8ff' }, emissive: '#18306a', scale: 0.8 }),
  crow: beast('bat', { col: { Main: '#141218', Belly: '#2a2630', Nose: '#a8242c' }, scale: 0.9 }),
  meok: beast('bat', { col: { Main: '#0c0a10', Belly: '#2a2234' }, scale: 1.1, opacity: 0.85 }),
  firebomb: beast('bat', { col: { Main: '#a8240c', Belly: '#ffb030' }, emissive: '#601800', scale: 1.0 }),
  wolf: beast('wolf', { col: { Main: '#4a4c50', Main_Light: '#7a7c80' } }),
  jangsanbeom: beast('wolf', { col: { Main: '#c8782a', Main_Light: '#f0e0c8' }, scale: 1.25 }),
  spider: beast('wolf', { col: { Main: '#141216', Main_Light: '#3a1a1e', Eyes_Black: '#e02020' }, scale: 0.85 }),
  toad: beast('wolf', { col: { Main: '#4a5a2a', Main_Light: '#8a9a4a' }, scale: 0.9 }),
  bulgasari: beast('wolf', { col: { Main: '#3a3a42', Main_Light: '#6a6a74' }, scale: 1.6 }),
  imugi: beast('dragon', { col: { Dragon_Main: '#1e3a2a', Dragon_Secondary: '#0e1a14', Dragon_Horn: '#c8c0a0' }, scale: 2.6 }),
  dokkaebi: adv({ beard: 1, main: '#c88a2a', main2: '#d89a3a', pants: '#2a1a14', skin: '#b8402e', hair: '#1a1210', gear: ['horns', 'club'], scale: 0.9 }),
  daedokkaebi: mon({ beard: 1, main: '#2a2a3a', armor: '#c88a2a', skin: '#3a5ac0', hair: '#ece4d4', gear: ['horns', 'club'], scale: 1.9 }),
  jangseung: mon({ beard: 1, main: '#8a8478', armor: '#7a7468', armor2: '#5a554c', sash: '#a8242c', pants: '#6a645a', skin: '#9a9488', hair: '#6a645a', scale: 1.3 }),
  wongwi: hood({ main: '#ece8f0', main2: '#ffffff', pants: '#d8d4e0', skin: '#e8eef4', gear: ['long'], opts: { len: 0.9 }, opacity: 0.72 }),
  mulgwisin: hood({ main: '#3a5a6a', main2: '#5a7a8a', pants: '#2a3a44', skin: '#b8ccd4', gear: ['long'], opts: { len: 0.9 }, opacity: 0.8 }),
  gangsi: adv({ main: '#1e2a4a', main2: '#2a3a5a', pants: '#141a2a', skin: '#a8c8b4', gear: ['qing'] }),
  eodukssini: mon({ main: '#0c0a10', armor: '#16121c', armor2: '#08060a', sash: '#2a1a3a', pants: '#08060a', skin: '#1a1620', hair: '#08060a', emissive: '#0a0614', scale: 1.25 }),
  geuseundae: mon({ main: '#141018', armor: '#1c1622', armor2: '#0a080c', sash: '#3a2a4a', pants: '#0a080c', skin: '#2a2430', hair: '#0a080c', scale: 1.5 }),
  agwi: adv({ main: '#4a4440', main2: '#5a544e', pants: '#2a2622', skin: '#8a8a7a', hair: '#2a2622' }),
  skeleton: adv({ main: '#3a3836', main2: '#4a4844', pants: '#2a2826', skin: '#e0dcd0', bald: 1, gear: ['sword'] }),
  mangtae: mon({ beard: 1, main: '#5a4a34', armor: '#4a3a28', sash: '#2a1e14', hair: '#c8c0b0', gear: ['straw'] }),
  foxmage: hood({ main: '#d8782a', main2: '#f0e8dc', pants: '#5a2a10', hair: '#e8a050', gear: ['ears', 'long', 'fan'], opts: { fan: '#f0e8dc' } }),
  bandit: adv({ beard: 1, main: '#5a4a2a', main2: '#6a5a34', pants: '#3a2a1a', hair: '#2a1e14', gear: ['band', 'blade'], opts: { band: '#5a1a14' } }),
  archer: adv({ beard: 1, main: '#3a4a2a', main2: '#4a5a34', pants: '#2a2a1a', hair: '#2a1e14', gear: ['band'], opts: { band: '#2a3a1a' } }),
  thug: adv({ main: '#1e1c22', main2: '#2a282e', pants: '#121014', gear: ['topknot', 'sword'], opts: { guard: '#5a5a60' } }),
  assassin: hood({ hooded: 1, main: '#141216', main2: '#2a1418', pants: '#0c0a0e', hoodc: '#0c0a0e', gear: ['mask', 'sword'], opts: { guard: '#3a3a40' } }),
  cultist: hood({ hooded: 1, main: '#6a0c14', main2: '#8a141c', pants: '#2a0608', hoodc: '#4a080e' }),
  brawler: adv({ beard: 1, main: '#c89a7a', main2: '#d0a484', pants: '#3a2a1e', skin: '#c89a7a', hair: '#1a1410', gear: ['band'], opts: { band: '#1a1410' }, scale: 1.2 }),
  poisoner: hood({ hooded: 1, main: '#3a2a4a', main2: '#4a8a3a', pants: '#1a1420', hoodc: '#2a1e34', gear: ['mask'], opts: { mask: '#2a3a24' } }),
  demonguard: mon({ main: '#1a0c10', armor: '#2a1418', armor2: '#0c0608', sash: '#8a141c', gear: ['helmet', 'blade'], scale: 1.15 }),
  chief: adv({ beard: 1, main: '#4a2a1a', main2: '#5a3a24', pants: '#2a1a10', hair: '#1a1210', gear: ['band', 'blade'], opts: { band: '#8a141c' }, scale: 1.6 }),
  heukyo: mon({ main: '#141016', armor: '#26202a', armor2: '#0a080c', sash: '#4a0c12', skin: '#8a7a70', gear: ['helmet', 'blade'], scale: 1.9 }),
  jeoseung: hood({ hooded: 1, main: '#0c0a0e', main2: '#1a161e', pants: '#08060a', hoodc: '#08060a', skin: '#d8dce0', gear: ['gat'], scale: 1.8 }),
};
