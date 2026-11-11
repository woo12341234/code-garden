// 포커 열전 · 섯다: the 20 화투 cards used in 섯다 (months 1–10, two each), drawn in code (original artwork;
// the month motifs are the traditional ones) and cached as image URLs.
(function () {
  'use strict';
  const W = 100, H = 160, S = 3;
  const INK = '#1d1a1c', RED = '#c8322a', CREAM = '#f6efe0';
  // id 0..19: month = floor(id / 2) + 1; the first of each month is its 광/열끗 card, the second its 띠 (8월: 열끗 기러기)
  const SPEC = [
    [1, 'gwang', '학'], [1, 'tti', 'hong'], [2, 'yeol', '꾀꼬리'], [2, 'tti', 'hong'], [3, 'gwang', '휘장'], [3, 'tti', 'hong'],
    [4, 'yeol', '두견새'], [4, 'tti', 'cho'], [5, 'yeol', '나무다리'], [5, 'tti', 'cho'], [6, 'yeol', '나비'], [6, 'tti', 'cheong'],
    [7, 'yeol', '멧돼지'], [7, 'tti', 'cho'], [8, 'gwang', '보름달'], [8, 'yeol', '기러기'], [9, 'yeol', '술잔'], [9, 'tti', 'cheong'],
    [10, 'yeol', '사슴'], [10, 'tti', 'cheong'],
  ];
  const DECK = SPEC.map(([m, t, a], id) => ({ id, m, t, motif: t === 'tti' ? null : a, rib: t === 'tti' ? a : null }));

  function rng(seed) { let s = seed * 9301 + 49297; return () => ((s = (s * 9301 + 49297) % 233280) / 233280); }
  function blob(g, x, y, rx, ry, rot, fill) { g.save(); g.translate(x, y); g.rotate(rot); g.beginPath(); g.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2); g.fillStyle = fill; g.fill(); g.restore(); }
  function stroke(g, pts, w, col) { g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) { const [x, y] = pts[i], [px, py] = pts[i - 1]; g.quadraticCurveTo(px, py, (px + x) / 2, (py + y) / 2); } g.lineTo(...pts[pts.length - 1]); g.lineWidth = w; g.strokeStyle = col; g.lineCap = 'round'; g.lineJoin = 'round'; g.stroke(); }
  function flower(g, x, y, r, petals, col, center, rot = 0) { for (let i = 0; i < petals; i++) { const a = rot + (i / petals) * Math.PI * 2; blob(g, x + Math.cos(a) * r * 0.55, y + Math.sin(a) * r * 0.55, r * 0.55, r * 0.36, a, col); } blob(g, x, y, r * 0.25, r * 0.25, 0, center); }
  function leaf(g, x, y, len, ang, col, wid = 0.35) { g.save(); g.translate(x, y); g.rotate(ang); g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(len * 0.5, -len * wid, len, 0); g.quadraticCurveTo(len * 0.5, len * wid, 0, 0); g.fillStyle = col; g.fill(); g.restore(); }
  function hill(g, y, col) { g.beginPath(); g.moveTo(0, H); g.lineTo(0, y + 8); g.quadraticCurveTo(30, y - 14, 55, y + 2); g.quadraticCurveTo(80, y + 14, W, y - 4); g.lineTo(W, H); g.closePath(); g.fillStyle = col; g.fill(); }
  function text(g, s, x, y, size, col, font) { g.font = `${size}px ${font}`; g.fillStyle = col; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(s, x, y); }

  const PLANT = {
    1(g) { g.fillStyle = '#e2563f'; g.fillRect(0, 0, W, 48); stroke(g, [[10, 158], [30, 120], [26, 96], [44, 70]], 7, '#4a3220');
      for (const [x, y, s] of [[44, 70, 1.2], [22, 104, 1], [60, 98, 0.9], [36, 128, 0.9], [72, 124, 0.8]]) { for (let i = 0; i < 9; i++) leaf(g, x, y, 16 * s, -Math.PI + (i / 8) * Math.PI, '#1f5c34', 0.12); blob(g, x, y + 2, 14 * s, 6 * s, 0, '#2c7a44'); } },
    2(g, r) { stroke(g, [[0, 140], [30, 118], [52, 120], [86, 96], [100, 90]], 5, '#3a2620'); stroke(g, [[52, 120], [60, 146]], 3, '#3a2620'); for (let i = 0; i < 9; i++) flower(g, 8 + r() * 86, 90 + r() * 60, 6 + r() * 2, 5, '#e24a5a', '#ffe08a', r() * 3); },
    3(g, r) { for (let i = 0; i < 26; i++) flower(g, r() * W, 70 + r() * 90, 5 + r() * 3, 5, i % 3 ? '#f2a8b8' : '#fbd3dc', '#e05a78', r() * 3); stroke(g, [[20, 160], [34, 120], [70, 96]], 3, '#5a3a2a'); },
    4(g, r) { for (let k = 0; k < 4; k++) { const x0 = 14 + k * 24; stroke(g, [[x0, 0], [x0 + 6, 40], [x0 - 2, 90]], 2, '#222'); for (let i = 0; i < 10; i++) leaf(g, x0 + Math.sin(i) * 4, 8 + i * 9, 12, Math.PI / 2 + (i % 2 ? 0.7 : -0.7), INK, 0.3); } for (let i = 0; i < 6; i++) blob(g, 10 + r() * 80, 20 + r() * 70, 2, 2, 0, RED); },
    5(g, r) { for (let i = 0; i < 7; i++) leaf(g, 10 + i * 13, 160, 70 + r() * 30, -Math.PI / 2 + (r() - 0.5) * 0.4, '#2c6a3a', 0.08); for (const [x, y] of [[26, 92], [62, 80], [82, 104]]) { flower(g, x, y, 9, 3, '#5a3fa0', '#f2c84a', -Math.PI / 2); blob(g, x, y + 7, 4, 7, 0, '#7a5ac8'); } },
    6(g) { for (const [x, y, s] of [[34, 112, 1.25], [72, 82, 0.9]]) { for (let i = 0; i < 4; i++) leaf(g, x, y + 14 * s, 26 * s, Math.PI * (0.15 + i * 0.25), '#1f5c34', 0.3); for (let ring = 3; ring > 0; ring--) flower(g, x, y, 7 * ring * s, 7, ring % 2 ? '#d8283a' : '#f0505e', '#8a1020', ring); } },
    7(g) { for (let k = 0; k < 3; k++) { stroke(g, [[10 + k * 30, 160], [20 + k * 30, 120], [14 + k * 34, 80]], 2, '#5a2a20'); for (let i = 0; i < 9; i++) { const y = 150 - i * 8, x = 14 + k * 31 + Math.sin(i * 1.3) * 6; leaf(g, x, y, 9, i % 2 ? -0.6 : Math.PI + 0.6, '#c43030', 0.4); blob(g, x + 5, y - 3, 2, 2, 0, '#e86a6a'); } } },
    8(g) { g.fillStyle = '#e9d9b4'; g.fillRect(0, 0, W, 90); hill(g, 92, INK); for (let i = 0; i < 12; i++) stroke(g, [[6 + i * 8, 160], [8 + i * 8, 110], [12 + i * 8, 96]], 1.4, '#e8e0cc'); },
    9(g) { for (let i = 0; i < 5; i++) leaf(g, 50, 150, 34, -Math.PI / 2 + (i - 2) * 0.45, '#2c6a3a', 0.3); for (const [x, y, s] of [[30, 96, 1], [68, 110, 1.1], [52, 74, 0.8]]) { flower(g, x, y, 13 * s, 14, '#f2c03a', '#c86a1a', 0); flower(g, x, y, 7 * s, 10, '#ffe27a', '#c86a1a', 0.3); } },
    10(g, r) { stroke(g, [[100, 40], [60, 70], [30, 74], [0, 96]], 3, '#4a2a20'); for (let i = 0; i < 9; i++) { const x = 8 + r() * 84, y = 60 + r() * 96, s = 0.8 + r() * 0.5; for (let k = 0; k < 5; k++) leaf(g, x, y, 10 * s, -Math.PI / 2 + (k - 2) * 0.55, i % 3 ? '#d8402a' : '#f07a2a', 0.35); } },
  };
  const FEATURE = {
    학(g) { blob(g, 64, 26, 16, 16, 0, '#fff4d8'); blob(g, 64, 26, 13, 13, 0, '#e8332a'); blob(g, 44, 78, 18, 10, -0.3, '#ffffff'); blob(g, 30, 70, 10, 4, -0.7, INK); stroke(g, [[56, 72], [64, 58], [62, 48]], 3, '#ffffff'); blob(g, 62, 46, 4, 3.5, 0, '#ffffff'); blob(g, 62, 43, 2, 1.6, 0, '#e8332a'); stroke(g, [[60, 46], [70, 48]], 1.4, '#c8a050'); stroke(g, [[42, 86], [40, 104]], 1.4, INK); stroke(g, [[48, 86], [50, 104]], 1.4, INK); },
    꾀꼬리(g) { blob(g, 60, 60, 12, 8, -0.3, '#e8c83a'); blob(g, 70, 54, 6, 6, 0, '#e8c83a'); blob(g, 72, 53, 1.4, 1.4, 0, INK); leaf(g, 50, 64, 12, Math.PI + 0.4, '#7a8a2a', 0.3); stroke(g, [[75, 54], [80, 55]], 1.4, '#c86a1a'); },
    휘장(g) { for (let i = 0; i < 6; i++) { g.fillStyle = i % 2 ? '#ffffff' : '#c8322a'; g.fillRect(8 + i * 14, 20, 14, 44); } g.fillStyle = INK; g.fillRect(6, 16, 88, 5); for (let i = 0; i < 4; i++) blob(g, 18 + i * 22, 42, 5, 5, 0, '#f2c84a'); },
    두견새(g) { blob(g, 52, 60, 13, 7, 0.3, '#5a5a6a'); blob(g, 40, 56, 6, 5, 0, '#5a5a6a'); blob(g, 38, 55, 1.2, 1.2, 0, '#fff'); leaf(g, 64, 62, 18, 0.2, INK, 0.25); blob(g, 50, 40, 9, 9, 0, '#f2d0a0'); },
    나무다리(g) { g.fillStyle = '#7a5230'; for (let i = 0; i < 4; i++) g.fillRect(4 + i * 24, 120 - i * 10, 26, 6); g.fillStyle = '#5a3a20'; for (let i = 0; i < 5; i++) g.fillRect(6 + i * 22, 124 - i * 10, 3, 24); },
    나비(g) { for (const [x, y] of [[66, 40], [30, 58]]) { blob(g, x - 6, y, 8, 6, -0.4, '#2a2a48'); blob(g, x + 6, y, 8, 6, 0.4, '#2a2a48'); blob(g, x - 5, y + 6, 5, 4, 0.3, '#e8a83a'); blob(g, x + 5, y + 6, 5, 4, -0.3, '#e8a83a'); blob(g, x, y + 2, 1.5, 6, 0, INK); } },
    멧돼지(g) { blob(g, 50, 112, 28, 15, 0, '#4a3020'); blob(g, 74, 106, 10, 9, 0.3, '#4a3020'); blob(g, 82, 108, 4, 3, 0, '#2a1810'); blob(g, 76, 102, 1.5, 1.5, 0, '#fff'); for (const x of [32, 44, 58, 66]) { g.fillStyle = '#2a1810'; g.fillRect(x, 122, 4, 12); } stroke(g, [[80, 112], [86, 116]], 1.5, '#f2e8c8'); },
    보름달(g) { blob(g, 50, 46, 30, 30, 0, '#fff8e0'); blob(g, 50, 46, 26, 26, 0, '#ffe9a8'); blob(g, 42, 40, 6, 4, 0.4, 'rgba(200,170,90,.35)'); blob(g, 58, 54, 5, 3, -0.3, 'rgba(200,170,90,.35)'); },
    기러기(g) { for (const [x, y, s] of [[30, 30, 1], [52, 22, 0.85], [74, 34, 0.75]]) { g.beginPath(); g.moveTo(x - 12 * s, y + 4 * s); g.quadraticCurveTo(x - 4 * s, y - 6 * s, x, y); g.quadraticCurveTo(x + 4 * s, y - 6 * s, x + 12 * s, y + 4 * s); g.lineWidth = 2.6 * s; g.strokeStyle = INK; g.stroke(); blob(g, x, y + 1, 3 * s, 2 * s, 0, INK); } },
    술잔(g) { g.beginPath(); g.moveTo(26, 44); g.lineTo(74, 44); g.quadraticCurveTo(70, 74, 50, 76); g.quadraticCurveTo(30, 74, 26, 44); g.fillStyle = '#c8322a'; g.fill(); g.fillStyle = '#f2c84a'; g.fillRect(40, 76, 20, 5); text(g, '壽', 50, 58, 18, '#f2c84a', 'serif'); },
    사슴(g) { blob(g, 50, 104, 24, 12, 0, '#a86a3a'); blob(g, 72, 86, 7, 8, 0.4, '#a86a3a'); stroke(g, [[66, 96], [70, 88]], 6, '#a86a3a'); for (const x of [34, 42, 58, 64]) { g.fillStyle = '#6a4020'; g.fillRect(x, 112, 3, 20); } stroke(g, [[72, 78], [68, 64], [62, 60]], 1.6, '#6a4020'); stroke(g, [[74, 78], [80, 64], [86, 62]], 1.6, '#6a4020'); for (let i = 0; i < 5; i++) blob(g, 38 + i * 6, 100 + (i % 2) * 4, 1.6, 1.6, 0, '#f2e0c0'); },
  };
  function ribbon(g, kind) {
    const col = kind === 'cheong' ? '#2a4aa8' : '#c8322a';
    g.save(); g.translate(50, 36); g.rotate(-0.12);
    g.fillStyle = col; g.fillRect(-11, 0, 22, 82);
    g.beginPath(); g.moveTo(-11, 82); g.lineTo(0, 74); g.lineTo(11, 82); g.lineTo(11, 90); g.lineTo(-11, 90); g.closePath(); g.fillStyle = CREAM; g.fill();
    g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(-11, 0, 4, 82);
    if (kind === 'hong' || kind === 'cheong') { g.fillStyle = '#fff6dc'; g.fillRect(-8, 8, 16, 48); g.fillStyle = INK; g.font = 'bold 13px "Noto Sans KR", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; [...(kind === 'hong' ? '홍단' : '청단')].forEach((ch, i) => g.fillText(ch, 0, 20 + i * 18)); }
    g.restore();
  }
  function frame(g) { const rr = 9; g.beginPath(); g.moveTo(rr, 0); g.arcTo(W, 0, W, H, rr); g.arcTo(W, H, 0, H, rr); g.arcTo(0, H, 0, 0, rr); g.arcTo(0, 0, W, 0, rr); g.closePath(); }
  function paint(c) {
    const cv = document.createElement('canvas'); cv.width = W * S; cv.height = H * S;
    const g = cv.getContext('2d'); g.scale(S, S);
    frame(g); g.fillStyle = CREAM; g.fill(); g.save(); g.clip();
    PLANT[c.m](g, rng(c.id * 7 + 3));
    if (c.motif) FEATURE[c.motif](g);
    if (c.rib) ribbon(g, c.rib);
    if (c.t === 'gwang') { blob(g, 15, 15, 11, 11, 0, RED); blob(g, 15, 15, 9, 9, 0, '#e8463a'); text(g, '光', 15, 16, 14, '#fff6dc', 'serif'); }
    // month number, so a glance is enough
    blob(g, 86, 148, 9, 9, 0, 'rgba(20,16,18,.82)'); text(g, String(c.m), 86, 149, 11, '#ffe9a8', 'bold "Noto Sans KR", sans-serif');
    g.restore();
    g.lineWidth = 3; g.strokeStyle = INK; frame(g); g.stroke();
    return cv.toDataURL('image/png');
  }
  function paintBack() {
    const cv = document.createElement('canvas'); cv.width = W * S; cv.height = H * S;
    const g = cv.getContext('2d'); g.scale(S, S);
    frame(g); g.fillStyle = '#9a1e1a'; g.fill();
    g.strokeStyle = '#d8a84a'; g.lineWidth = 2; g.beginPath(); g.roundRect(6, 6, W - 12, H - 12, 6); g.stroke();
    for (let i = 0; i < 8; i++) for (let k = 0; k < 13; k++) blob(g, 12 + i * 11, 13 + k * 11.2, 1.6, 1.6, 0, 'rgba(255,220,150,.25)');
    text(g, '花', W / 2, H / 2, 40, '#f2c84a', 'serif');
    return cv.toDataURL('image/png');
  }
  const cache = {};
  window.HWATU = { DECK, face: (id) => cache[id] || (cache[id] = paint(DECK[id])), back: () => cache.b || (cache.b = paintBack()) };
})();
