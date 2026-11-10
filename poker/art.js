// 포커 열전: drawn-in-code art — character portraits, casino chips and stacks, felt texture.
(function () {
  'use strict';
  const S = 2;
  function canvas(w, h) { const c = document.createElement('canvas'); c.width = w * S; c.height = h * S; const g = c.getContext('2d'); g.scale(S, S); return [c, g]; }
  function ell(g, x, y, rx, ry, fill, rot = 0) { g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); g.fillStyle = fill; g.fill(); }

  // ---------- portraits: a shared bust, dressed per character ----------
  const LOOKS = {
    me: { bg: ['#e8b04a', '#8a5a18'], skin: '#f1cba3', cloth: '#2a3a5a', hair: '#2a1e1a', style: 'band' },
    rock: { bg: ['#7a96b4', '#2a3a4e'], skin: '#e8c19a', cloth: '#4a4e58', hair: '#1e1c1e', style: 'flat', glasses: 'square', brow: 'heavy', mouth: 'frown', tie: '#8a1e24' },
    fire: { bg: ['#f2843a', '#7a2210'], skin: '#f0c49a', cloth: '#1e1a1c', hair: '#e8462a', style: 'spiky', mouth: 'grin', scar: true },
    calc: { bg: ['#5ac88a', '#1a5a3a'], skin: '#f2d0ae', cloth: '#2a6a4a', hair: '#2a2420', style: 'part', glasses: 'round', mouth: 'line', shirt: true },
    fish: { bg: ['#b49ae8', '#4a3a7a'], skin: '#e6b88e', cloth: '#6a7040', hair: '#3a2a20', style: 'hat', eyes: 'smile', mouth: 'smile', stubble: true },
    wild: { bg: ['#f2d06a', '#7a5a10'], skin: '#e0b088', cloth: '#5a2a7a', hair: '#141214', style: 'slick', glasses: 'shades', mouth: 'smirk', chain: true },
    old: { bg: ['#c8b48a', '#4a3a24'], skin: '#e8c4a0', cloth: '#3a4a3a', hair: '#e8e4dc', style: 'bald', brow: 'heavy', mouth: 'smile', beard: true, eyes: 'smile' },
  };
  function portrait(id) {
    const L = LOOKS[id] || LOOKS.calc;
    const [c, g] = canvas(96, 96);
    const bg = g.createRadialGradient(48, 34, 6, 48, 48, 62); bg.addColorStop(0, L.bg[0]); bg.addColorStop(1, L.bg[1]);
    g.fillStyle = bg; g.fillRect(0, 0, 96, 96);
    // shoulders
    g.beginPath(); g.moveTo(8, 96); g.quadraticCurveTo(12, 66, 48, 64); g.quadraticCurveTo(84, 66, 88, 96); g.closePath(); g.fillStyle = L.cloth; g.fill();
    if (L.shirt || L.tie) { g.beginPath(); g.moveTo(38, 66); g.lineTo(48, 84); g.lineTo(58, 66); g.closePath(); g.fillStyle = '#f2efe8'; g.fill(); }
    if (L.tie) { g.beginPath(); g.moveTo(46, 70); g.lineTo(50, 70); g.lineTo(52, 92); g.lineTo(48, 96); g.lineTo(44, 92); g.closePath(); g.fillStyle = L.tie; g.fill(); }
    if (L.chain) { g.beginPath(); g.moveTo(36, 68); g.quadraticCurveTo(48, 86, 60, 68); g.lineWidth = 2.4; g.strokeStyle = '#f2c84a'; g.stroke(); }
    // neck & head
    g.fillStyle = L.skin; g.fillRect(42, 52, 12, 14);
    ell(g, 48, 42, 17, 20, L.skin);
    ell(g, 31, 44, 3, 5, L.skin); ell(g, 65, 44, 3, 5, L.skin);
    // hair / headgear
    g.fillStyle = L.hair;
    if (L.style === 'flat') { g.beginPath(); g.ellipse(48, 30, 18, 11, 0, Math.PI, 0); g.fill(); g.fillRect(30, 28, 36, 6); }
    else if (L.style === 'spiky') { g.beginPath(); g.moveTo(28, 36); for (let i = 0; i <= 8; i++) { const x = 28 + i * 5; g.lineTo(x, i % 2 ? 26 : 10 + (i % 3) * 3); } g.lineTo(68, 36); g.quadraticCurveTo(48, 24, 28, 36); g.fill(); }
    else if (L.style === 'part') { g.beginPath(); g.ellipse(48, 30, 18, 12, 0, Math.PI, 0); g.fill(); g.beginPath(); g.moveTo(30, 32); g.quadraticCurveTo(40, 22, 58, 26); g.lineTo(66, 34); g.quadraticCurveTo(54, 28, 30, 36); g.fill(); }
    else if (L.style === 'slick') { g.beginPath(); g.ellipse(48, 30, 18, 13, 0, Math.PI, 0); g.fill(); g.strokeStyle = 'rgba(255,255,255,.25)'; g.lineWidth = 1; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(34 + i * 6, 22); g.quadraticCurveTo(44 + i * 6, 18, 58, 24); g.stroke(); } }
    else if (L.style === 'hat') { g.beginPath(); g.ellipse(48, 30, 26, 6, 0, 0, Math.PI * 2); g.fillStyle = '#c8b07a'; g.fill(); g.beginPath(); g.ellipse(48, 24, 16, 12, 0, Math.PI, 0); g.fill(); g.fillStyle = '#7a5a2a'; g.fillRect(32, 24, 32, 4); }
    else if (L.style === 'bald') { g.beginPath(); g.ellipse(32, 36, 5, 9, 0.3, 0, Math.PI * 2); g.ellipse(64, 36, 5, 9, -0.3, 0, Math.PI * 2); g.fill(); }
    else if (L.style === 'band') { g.beginPath(); g.ellipse(48, 30, 18, 12, 0, Math.PI, 0); g.fill(); g.fillStyle = '#c8282e'; g.fillRect(30, 29, 36, 5); g.beginPath(); g.moveTo(64, 31); g.lineTo(74, 38); g.lineTo(70, 30); g.fill(); }
    // brows, eyes
    g.strokeStyle = L.hair === '#e8462a' ? '#a8301a' : '#1e1a1a'; g.lineCap = 'round';
    g.lineWidth = L.brow === 'heavy' ? 3 : 2;
    g.beginPath(); g.moveTo(38, 36 + (L.brow === 'heavy' ? 1 : 0)); g.lineTo(45, 37); g.moveTo(51, 37); g.lineTo(58, 36 + (L.brow === 'heavy' ? 1 : 0)); g.stroke();
    if (L.eyes === 'smile') { g.lineWidth = 2; g.beginPath(); g.arc(41, 43, 3, Math.PI * 1.1, Math.PI * 1.9); g.moveTo(52, 43); g.arc(55, 43, 3, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); }
    else { ell(g, 41.5, 42, 2, 2.4, '#1e1a1a'); ell(g, 54.5, 42, 2, 2.4, '#1e1a1a'); ell(g, 42.2, 41.3, 0.7, 0.7, '#fff'); ell(g, 55.2, 41.3, 0.7, 0.7, '#fff'); }
    if (L.glasses === 'square') { g.lineWidth = 1.6; g.strokeStyle = '#1e1a1a'; g.strokeRect(36, 38, 11, 8); g.strokeRect(49, 38, 11, 8); g.beginPath(); g.moveTo(47, 41); g.lineTo(49, 41); g.stroke(); }
    if (L.glasses === 'round') { g.lineWidth = 1.4; g.strokeStyle = '#6a4a2a'; g.beginPath(); g.arc(41.5, 42, 5, 0, Math.PI * 2); g.moveTo(59.5, 42); g.arc(54.5, 42, 5, 0, Math.PI * 2); g.moveTo(46.5, 42); g.lineTo(49.5, 42); g.stroke(); }
    if (L.glasses === 'shades') { g.fillStyle = '#111'; g.beginPath(); g.roundRect(34, 38, 13, 8, 3); g.roundRect(49, 38, 13, 8, 3); g.fill(); g.fillRect(46, 40, 4, 2); g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(36, 39, 4, 2); g.fillRect(51, 39, 4, 2); }
    // nose & mouth
    g.strokeStyle = 'rgba(120,70,40,.6)'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(48, 44); g.lineTo(46.5, 50); g.lineTo(49, 51); g.stroke();
    g.strokeStyle = '#7a2a24'; g.lineWidth = 2;
    g.beginPath();
    if (L.mouth === 'frown') { g.moveTo(43, 57); g.quadraticCurveTo(48, 54, 53, 57); }
    else if (L.mouth === 'grin') { g.moveTo(41, 54); g.quadraticCurveTo(48, 61, 56, 53); g.stroke(); g.beginPath(); g.moveTo(43, 55); g.lineTo(54, 55); g.strokeStyle = '#fff'; g.lineWidth = 1.4; }
    else if (L.mouth === 'smile') { g.moveTo(42, 54); g.quadraticCurveTo(48, 59, 54, 54); }
    else if (L.mouth === 'smirk') { g.moveTo(43, 56); g.quadraticCurveTo(50, 57, 55, 53); }
    else { g.moveTo(43, 55.5); g.lineTo(53, 55.5); }
    g.stroke();
    if (L.beard) { g.beginPath(); g.moveTo(36, 52); g.quadraticCurveTo(48, 76, 60, 52); g.quadraticCurveTo(48, 62, 36, 52); g.fillStyle = L.hair; g.fill(); }
    if (L.stubble) { g.fillStyle = 'rgba(60,40,30,.35)'; for (let i = 0; i < 26; i++) { const a = Math.PI * (0.15 + 0.7 * (i / 26)); g.fillRect(48 + Math.cos(a) * 13 - 0.5, 44 + Math.sin(a) * 15, 1, 1); } }
    if (L.scar) { g.strokeStyle = '#c87a6a'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(57, 46); g.lineTo(62, 52); g.moveTo(58, 50); g.lineTo(61, 48); g.stroke(); }
    // soft vignette
    const v = g.createRadialGradient(48, 48, 30, 48, 48, 68); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.45)'); g.fillStyle = v; g.fillRect(0, 0, 96, 96);
    return c.toDataURL('image/png');
  }

  // ---------- chips ----------
  const DENOMS = [[1000, '#f2c13a', '#7a5a10'], [500, '#8a4ac8', '#3a1a6a'], [100, '#24262c', '#000'], [25, '#2a9a5a', '#0e4a2a'], [5, '#d8343a', '#6a0e12'], [1, '#e8e4dc', '#8a8478']];
  function chipFace(g, x, y, r, col, dark) {
    ell(g, x, y, r, r, col);
    g.save(); g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.clip();
    g.fillStyle = '#fff';
    for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; g.save(); g.translate(x, y); g.rotate(a); g.fillRect(-r * 0.16, -r, r * 0.32, r * 0.28); g.restore(); }
    g.restore();
    ell(g, x, y, r * 0.66, r * 0.66, dark); ell(g, x, y, r * 0.58, r * 0.58, col);
    g.beginPath(); g.arc(x, y, r * 0.66, 0, Math.PI * 2); g.setLineDash([2, 2]); g.lineWidth = 1; g.strokeStyle = 'rgba(255,255,255,.7)'; g.stroke(); g.setLineDash([]);
  }
  // top view of a single chip (for flying chips and buttons)
  const chipCache = {};
  function chip(i = 4) {
    if (chipCache[i]) return chipCache[i];
    const [c, g] = canvas(28, 28); const [, col, dark] = DENOMS[i];
    ell(g, 14, 15.5, 12.5, 12.5, 'rgba(0,0,0,.35)'); chipFace(g, 14, 14, 12.5, col, dark);
    return (chipCache[i] = c.toDataURL('image/png'));
  }
  // stacks: break an amount into chip colours and draw up to four short stacks
  const stackCache = new Map();
  function stack(amount) {
    amount = Math.round(amount);
    if (stackCache.has(amount)) return stackCache.get(amount);
    const cols = [];
    let left = amount;
    for (let i = 0; i < DENOMS.length && cols.length < 4; i++) { const n = Math.floor(left / DENOMS[i][0]); if (n > 0) { cols.push([i, Math.min(n, 10)]); left -= n * DENOMS[i][0]; } }
    if (!cols.length) cols.push([5, 1]);
    // the canvas is only as tall as the tallest stack, so small bets don't shrink to specks
    const w = 14 + cols.length * 20, h = 14 + Math.max(...cols.map(([, n]) => n)) * 3;
    const [c, g] = canvas(w, h);
    cols.forEach(([i, n], k) => {
      const [, col, dark] = DENOMS[i], x = 14 + k * 20, base = h - 8;
      for (let j = 0; j < n; j++) {
        const y = base - j * 3;
        ell(g, x, y + 1.6, 9, 4.2, dark); g.fillStyle = dark; g.fillRect(x - 9, y - 0.4, 18, 2);
        ell(g, x, y - 0.4, 9, 4.2, col);
        g.fillStyle = 'rgba(255,255,255,.85)'; for (const dx of [-6, 0, 6]) g.fillRect(x + dx - 1, y + 0.2, 2, 1.6);
        if (j === n - 1) { ell(g, x, y - 0.4, 5.6, 2.6, dark); ell(g, x, y - 0.4, 4.8, 2.1, col); }
      }
    });
    const url = [c.toDataURL('image/png'), w, h];
    if (stackCache.size > 300) stackCache.clear();
    stackCache.set(amount, url);
    return url;
  }

  // ---------- felt texture & room ----------
  function felt() {
    const [c, g] = canvas(128, 128);
    const img = g.createImageData(256, 256);
    for (let i = 0; i < img.data.length; i += 4) { const v = Math.random() * 255; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 18; }
    g.putImageData(img, 0, 0);
    return c.toDataURL('image/png');
  }

  window.ART = { portrait, chip, stack, felt, LOOKS };
})();
