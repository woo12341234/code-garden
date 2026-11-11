// 포커 열전 · 섯다: the 20 화투 cards used in 섯다 (months 1–10, two each), drawn in code and cached as image URLs.
// Original artwork in the traditional look: thick plastic card with a dark edge, flat woodblock colours with black
// outlines, the red sky of 송학/공산, the 光 seal, 홍단·청단·초단 ribbons, and a plain red back.
(function () {
  'use strict';
  const W = 100, H = 160, S = 3;
  const INK = '#1a1414', RED = '#d42a22', DRED = '#9a1610', CREAM = '#f7f0dc', PAPER = '#fbf6e8';
  const GREEN = '#2f7a3a', DGREEN = '#1c4f26', GOLD = '#f2c23a', PINK = '#f4a6b8', PURPLE = '#5a3a9a', BROWN = '#6a4024';
  // id 0..19: month = floor(id / 2) + 1; the first of each month is its 광/열끗 card, the second its 띠
  const SPEC = [
    [1, 'gwang', '학'], [1, 'tti', 'hong'], [2, 'yeol', '꾀꼬리'], [2, 'tti', 'hong'], [3, 'gwang', '휘장'], [3, 'tti', 'hong'],
    [4, 'yeol', '두견새'], [4, 'tti', 'cho'], [5, 'yeol', '나무다리'], [5, 'tti', 'cho'], [6, 'yeol', '나비'], [6, 'tti', 'cheong'],
    [7, 'yeol', '멧돼지'], [7, 'tti', 'cho'], [8, 'gwang', '보름달'], [8, 'yeol', '기러기'], [9, 'yeol', '술잔'], [9, 'tti', 'cheong'],
    [10, 'yeol', '사슴'], [10, 'tti', 'cheong'],
  ];
  const DECK = SPEC.map(([m, t, a], id) => ({ id, m, t, motif: t === 'tti' ? null : a, rib: t === 'tti' ? a : null }));

  function rng(seed) { let s = seed * 9301 + 49297; return () => ((s = (s * 9301 + 49297) % 233280) / 233280); }
  // every shape is flat-filled and outlined in ink, like a woodblock print
  function shape(g, build, fill, lw = 1.1, line = INK) { g.beginPath(); build(); if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.lineWidth = lw; g.strokeStyle = line; g.lineJoin = 'round'; g.stroke(); } }
  const oval = (g, x, y, rx, ry, rot, fill, lw) => shape(g, () => g.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2), fill, lw);
  function curve(g, pts) { g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) { const [x, y] = pts[i], [px, py] = pts[i - 1]; g.quadraticCurveTo(px, py, (px + x) / 2, (py + y) / 2); } g.lineTo(...pts[pts.length - 1]); }
  // an outlined branch: a dark line with a lighter core
  function branch(g, pts, w, core = BROWN) { g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); curve(g, pts); g.lineWidth = w + 2; g.strokeStyle = INK; g.stroke(); g.beginPath(); curve(g, pts); g.lineWidth = w; g.strokeStyle = core; g.stroke(); }
  function line(g, pts, w, col = INK) { g.beginPath(); curve(g, pts); g.lineWidth = w; g.strokeStyle = col; g.lineCap = 'round'; g.stroke(); }
  function leaf(g, x, y, len, ang, col, wid = 0.35, lw = 0.9) { g.save(); g.translate(x, y); g.rotate(ang); shape(g, () => { g.moveTo(0, 0); g.quadraticCurveTo(len * 0.5, -len * wid, len, 0); g.quadraticCurveTo(len * 0.5, len * wid, 0, 0); }, col, lw); g.restore(); }
  function blossom(g, x, y, r, col, petals = 5, rot = 0, center = GOLD) {
    for (let i = 0; i < petals; i++) { const a = rot + (i / petals) * Math.PI * 2; oval(g, x + Math.cos(a) * r * 0.55, y + Math.sin(a) * r * 0.55, r * 0.52, r * 0.4, a, col, 0.7); }
    oval(g, x, y, r * 0.24, r * 0.24, 0, center, 0.5);
  }
  // a pine clump: a rounded fan of needles
  function pine(g, x, y, s) {
    shape(g, () => { g.moveTo(x - 18 * s, y); g.quadraticCurveTo(x - 16 * s, y - 15 * s, x, y - 16 * s); g.quadraticCurveTo(x + 16 * s, y - 15 * s, x + 18 * s, y); g.closePath(); }, GREEN, 1.2);
    for (let i = 0; i < 11; i++) { const a = Math.PI + (i + 0.5) / 11 * Math.PI; line(g, [[x, y - 1], [x + Math.cos(a) * 15 * s, y + Math.sin(a) * 13 * s]], 0.8, DGREEN); }
    shape(g, () => { g.moveTo(x - 18 * s, y); g.lineTo(x + 18 * s, y); }, null, 1.4);
  }
  function hill(g, y, col = INK) { shape(g, () => { g.moveTo(0, H); g.lineTo(0, y + 10); g.quadraticCurveTo(26, y - 16, 52, y + 2); g.quadraticCurveTo(78, y + 16, W, y - 6); g.lineTo(W, H); g.closePath(); }, col, 0); }
  function sky(g, h, col = RED) { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, col); gr.addColorStop(1, '#e8502a'); g.fillStyle = gr; g.fillRect(0, 0, W, h); }
  function text(g, s, x, y, size, col, font) { g.font = `${size}px ${font}`; g.fillStyle = col; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(s, x, y); }

  // the plant of each month (drawn first, behind the animal or object)
  const PLANT = {
    1(g, r, c) {
      if (c.t === 'gwang') { sky(g, 92); oval(g, 62, 40, 24, 24, 0, '#ff5a2a', 0); oval(g, 62, 40, 20, 20, 0, '#ffd84a', 0); }
      branch(g, [[6, 160], [18, 128], [14, 104], [30, 84]], 5);
      branch(g, [[16, 126], [44, 118], [62, 126]], 3);
      for (const [x, y, s] of (c.t === 'gwang' ? [[30, 86, 1], [12, 112, 0.8], [56, 126, 0.85], [28, 146, 0.9]] : [[30, 86, 1.1], [70, 70, 1], [12, 112, 0.9], [60, 124, 1], [84, 106, 0.8], [30, 146, 1], [76, 150, 0.9]])) pine(g, x, y, s);
    },
    2(g, r) {
      branch(g, [[0, 148], [26, 130], [48, 132], [82, 104], [100, 98]], 4.5, '#2a1a14');
      branch(g, [[48, 132], [58, 158]], 3, '#2a1a14'); branch(g, [[82, 104], [80, 84]], 2.5, '#2a1a14');
      for (let i = 0; i < 11; i++) { const t = r(); blossom(g, 6 + t * 90, 140 - t * 44 + (r() - 0.5) * 22, 5.5 + r() * 1.5, RED, 5, r() * 3, '#ffe8a0'); }
    },
    3(g, r, c) {
      // a cloud of cherry blossom over everything
      const top = c.t === 'gwang' ? 6 : 70;
      for (let i = 0; i < (c.t === 'gwang' ? 22 : 30); i++) blossom(g, r() * W, top + r() * (c.t === 'gwang' ? 54 : 88), 5 + r() * 3, i % 3 ? PINK : '#ffd2de', 5, r() * 3, '#d83a5a');
      if (c.t !== 'gwang') branch(g, [[18, 160], [30, 124], [64, 104]], 3, '#4a2a1a');
    },
    4(g, r) {
      // black bush clover hanging from the top
      oval(g, 74, 22, 12, 12, 0, '#e86a4a', 0);
      for (let k = 0; k < 4; k++) {
        const x0 = 12 + k * 25; line(g, [[x0, -2], [x0 + 6, 40], [x0 - 2, 96]], 1.6);
        for (let i = 0; i < 11; i++) leaf(g, x0 + Math.sin(i * 1.1) * 4, 6 + i * 8.5, 11, Math.PI / 2 + (i % 2 ? 0.75 : -0.75), INK, 0.3, 0);
      }
      for (let i = 0; i < 8; i++) oval(g, 8 + r() * 84, 14 + r() * 80, 1.8, 1.8, 0, RED, 0);
    },
    5(g, r) {
      for (let i = 0; i < 9; i++) leaf(g, 6 + i * 11, 162, 64 + r() * 36, -Math.PI / 2 + (r() - 0.5) * 0.35, i % 2 ? GREEN : DGREEN, 0.07, 0.8);
      for (const [x, y] of [[24, 86], [56, 70], [82, 94]]) { for (let k = 0; k < 3; k++) leaf(g, x, y, 12, -Math.PI / 2 + (k - 1) * 1.1, PURPLE, 0.5, 0.9); oval(g, x, y + 4, 4, 6, 0, '#7a5ad8', 0.8); oval(g, x, y - 1, 2, 2, 0, GOLD, 0); }
    },
    6(g) {
      for (const [x, y, s] of [[34, 112, 1.2], [72, 80, 0.9]]) {
        for (let i = 0; i < 5; i++) leaf(g, x, y + 12 * s, 26 * s, Math.PI * (0.05 + i * 0.22), i % 2 ? GREEN : DGREEN, 0.32);
        for (let ring = 3; ring > 0; ring--) blossom(g, x, y, 7.5 * ring * s, ring % 2 ? RED : '#f2505a', 7, ring, ring === 1 ? GOLD : DRED);
      }
    },
    7(g) {
      for (let k = 0; k < 3; k++) {
        line(g, [[10 + k * 32, 162], [20 + k * 30, 124], [12 + k * 34, 70]], 1.6, '#4a1a14');
        for (let i = 0; i < 11; i++) { const y = 154 - i * 8, x = 14 + k * 31 + Math.sin(i * 1.3) * 6; leaf(g, x, y, 9, i % 2 ? -0.6 : Math.PI + 0.6, RED, 0.42, 0.6); oval(g, x + 4, y - 3, 1.8, 1.8, 0, '#ff9a8a', 0); }
      }
    },
    8(g, r, c) {
      // 공산: red sky over a black hill with silver grass
      sky(g, 104);
      hill(g, 98);
      for (let i = 0; i < 13; i++) line(g, [[4 + i * 7.6, 162], [6 + i * 7.6, 124], [11 + i * 7.6, 108]], 1.1, '#f2ecd8');
    },
    9(g) {
      for (let i = 0; i < 5; i++) leaf(g, 50, 156, 36, -Math.PI / 2 + (i - 2) * 0.45, i % 2 ? GREEN : DGREEN, 0.3);
      for (const [x, y, s] of [[28, 108, 1], [70, 118, 1.1], [52, 86, 0.85]]) { blossom(g, x, y, 14 * s, GOLD, 16, 0, '#c8601a'); blossom(g, x, y, 7.5 * s, '#ffe27a', 10, 0.3, '#c8601a'); }
    },
    10(g, r) {
      branch(g, [[100, 34], [62, 62], [30, 66], [0, 88]], 3, '#3a1a14');
      for (let i = 0; i < 11; i++) { const x = 8 + r() * 84, y = 50 + r() * 108, s = 0.8 + r() * 0.5; for (let k = 0; k < 5; k++) leaf(g, x, y, 10 * s, -Math.PI / 2 + (k - 2) * 0.55, i % 3 ? RED : '#f07a2a', 0.36, 0.6); }
    },
  };
  // the animal or object of the 광 / 열끗 card
  const FEATURE = {
    학(g) {
      oval(g, 46, 104, 20, 12, -0.25, '#ffffff', 1.3);
      shape(g, () => { g.moveTo(28, 98); g.quadraticCurveTo(18, 104, 14, 116); g.quadraticCurveTo(26, 112, 34, 108); g.closePath(); }, INK, 0);
      shape(g, () => { g.moveTo(58, 98); g.quadraticCurveTo(66, 82, 62, 66); }, null, 5);
      shape(g, () => { g.moveTo(58, 98); g.quadraticCurveTo(66, 82, 62, 66); }, null, 3, '#ffffff');
      oval(g, 62, 63, 5, 4, 0, '#ffffff', 1.1); oval(g, 62, 59.5, 2.6, 1.8, 0, RED, 0); oval(g, 63.5, 63, 0.9, 0.9, 0, INK, 0);
      shape(g, () => { g.moveTo(66, 63); g.lineTo(76, 66); g.lineTo(66, 65); g.closePath(); }, '#c8a040', 0.6);
      line(g, [[42, 114], [40, 140]], 1.4); line(g, [[50, 114], [53, 140]], 1.4);
    },
    꾀꼬리(g) {
      oval(g, 60, 70, 12, 8, -0.3, '#b8c83a', 1.1); oval(g, 71, 63, 6.5, 6, 0, '#b8c83a', 1.1); oval(g, 73, 62, 1.3, 1.3, 0, INK, 0);
      leaf(g, 50, 74, 14, Math.PI + 0.35, '#6a7a1a', 0.3); shape(g, () => { g.moveTo(77, 63); g.lineTo(83, 64); g.lineTo(77, 65.5); g.closePath(); }, '#c8601a', 0.5);
      line(g, [[56, 77], [54, 84]], 1); line(g, [[62, 77], [62, 84]], 1);
    },
    휘장(g) {
      // the red festival curtain
      shape(g, () => { g.moveTo(-2, 70); g.quadraticCurveTo(50, 58, 102, 70); g.lineTo(102, 162); g.lineTo(-2, 162); g.closePath(); }, RED, 1.4);
      for (let i = 0; i < 5; i++) line(g, [[6 + i * 22, 72], [4 + i * 22, 160]], 1, DRED);
      for (let k = 0; k < 3; k++) for (let i = 0; i < 4; i++) { const x = 16 + i * 22 + (k % 2) * 11, y = 92 + k * 22; oval(g, x, y, 6, 6, 0, '#ffffff', 0.9); blossom(g, x, y, 4, PINK, 5, 0, '#d83a5a'); }
      shape(g, () => { g.moveTo(-2, 66); g.quadraticCurveTo(50, 54, 102, 66); }, null, 4, '#f2c23a');
    },
    두견새(g) {
      shape(g, () => { g.moveTo(26, 66); g.quadraticCurveTo(50, 50, 72, 60); g.quadraticCurveTo(52, 62, 40, 74); g.closePath(); }, '#4a4a5a', 1.1);
      oval(g, 26, 66, 6, 5, 0, '#4a4a5a', 1.1); oval(g, 24, 65, 1.2, 1.2, 0, '#fff', 0);
      leaf(g, 58, 66, 22, 0.25, INK, 0.22, 0); shape(g, () => { g.moveTo(20, 66); g.lineTo(14, 67); g.lineTo(20, 68); }, GOLD, 0.5);
    },
    나무다리(g) {
      // the eight-plank zigzag bridge over the irises
      for (let i = 0; i < 4; i++) { const x = 2 + i * 24, y = 130 - (i % 2) * 14; shape(g, () => g.rect(x, y, 26, 6), '#8a5a30', 1.1); for (const dx of [3, 21]) shape(g, () => g.rect(x + dx, y + 6, 3, 30), '#5a3a1a', 0.9); }
    },
    나비(g) {
      for (const [x, y, s] of [[70, 34, 1], [30, 56, 0.85]]) {
        oval(g, x - 7 * s, y - 1, 8 * s, 6.5 * s, -0.5, '#2a2a5a', 1); oval(g, x + 7 * s, y - 1, 8 * s, 6.5 * s, 0.5, '#2a2a5a', 1);
        oval(g, x - 5 * s, y + 6 * s, 5 * s, 4 * s, 0.3, GOLD, 0.8); oval(g, x + 5 * s, y + 6 * s, 5 * s, 4 * s, -0.3, GOLD, 0.8);
        oval(g, x, y + 2, 1.4, 6 * s, 0, INK, 0); line(g, [[x, y - 4], [x - 4, y - 10]], 0.7); line(g, [[x, y - 4], [x + 4, y - 10]], 0.7);
      }
    },
    멧돼지(g) {
      for (const x of [32, 44, 58, 68]) shape(g, () => g.rect(x, 118, 4.5, 15), '#2a1810', 0.8);
      shape(g, () => { g.moveTo(20, 112); g.quadraticCurveTo(26, 92, 52, 94); g.quadraticCurveTo(72, 92, 84, 104); g.quadraticCurveTo(90, 112, 82, 118); g.quadraticCurveTo(50, 128, 24, 120); g.closePath(); }, '#5a3420', 1.3);
      for (let i = 0; i < 6; i++) line(g, [[30 + i * 7, 96], [33 + i * 7, 100]], 0.9, '#2a1810');
      oval(g, 86, 112, 4, 3.5, 0, '#3a2014', 1); oval(g, 76, 103, 1.6, 1.6, 0, '#fff', 0);
      shape(g, () => { g.moveTo(82, 116); g.quadraticCurveTo(88, 118, 88, 113); }, null, 1.6, '#f2e8c8');
    },
    보름달(g) {
      oval(g, 50, 50, 31, 31, 0, '#fff6d8', 1.4);
      oval(g, 50, 50, 26, 26, 0, '#ffe7a0', 0);
    },
    기러기(g) {
      for (const [x, y, s] of [[28, 36, 1], [52, 24, 0.9], [76, 40, 0.8]]) {
        shape(g, () => { g.moveTo(x - 14 * s, y + 6 * s); g.quadraticCurveTo(x - 5 * s, y - 8 * s, x, y); g.quadraticCurveTo(x + 5 * s, y - 8 * s, x + 14 * s, y + 6 * s); g.quadraticCurveTo(x + 4 * s, y + 2 * s, x, y + 4 * s); g.quadraticCurveTo(x - 4 * s, y + 2 * s, x - 14 * s, y + 6 * s); }, INK, 0);
        oval(g, x, y + 3 * s, 3.5 * s, 2.4 * s, 0, INK, 0);
      }
    },
    술잔(g) {
      shape(g, () => { g.moveTo(24, 40); g.lineTo(76, 40); g.quadraticCurveTo(72, 74, 50, 76); g.quadraticCurveTo(28, 74, 24, 40); }, RED, 1.4);
      oval(g, 50, 40, 26, 4, 0, '#f2c23a', 1.1);
      shape(g, () => g.rect(40, 76, 20, 6), GOLD, 1.1);
      text(g, '壽', 50, 58, 19, GOLD, 'bold serif');
    },
    사슴(g) {
      for (const x of [34, 42, 58, 66]) shape(g, () => g.rect(x, 108, 3.5, 24), '#6a3a1a', 0.8);
      oval(g, 50, 104, 24, 11, 0, '#b8743a', 1.3);
      shape(g, () => { g.moveTo(66, 100); g.lineTo(72, 82); g.lineTo(78, 84); g.lineTo(74, 102); g.closePath(); }, '#b8743a', 1.1);
      oval(g, 76, 80, 6, 5, 0.4, '#b8743a', 1.1); oval(g, 77, 78.5, 1.2, 1.2, 0, INK, 0);
      line(g, [[74, 76], [70, 64], [64, 60]], 1.6, '#4a2a14'); line(g, [[70, 66], [74, 60]], 1.2, '#4a2a14'); line(g, [[78, 76], [82, 64], [88, 62]], 1.6, '#4a2a14');
      for (let i = 0; i < 6; i++) oval(g, 36 + i * 5.5, 100 + (i % 2) * 4, 1.5, 1.5, 0, '#fff0d0', 0);
    },
  };
  function ribbon(g, kind) {
    const col = kind === 'cheong' ? '#2348a8' : RED;
    g.save(); g.translate(52, 30); g.rotate(-0.1);
    shape(g, () => { g.moveTo(-11, 0); g.lineTo(11, 0); g.lineTo(11, 86); g.lineTo(0, 78); g.lineTo(-11, 86); g.closePath(); }, col, 1.4);
    g.fillStyle = 'rgba(255,255,255,.22)'; g.fillRect(-9.5, 1, 3, 76);
    if (kind !== 'cho') {
      // the lettered ribbons of 홍단 and 청단
      g.fillStyle = INK; g.font = '900 14px "Noto Sans KR", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
      [...(kind === 'hong' ? '홍단' : '청단')].forEach((ch, i) => { g.fillStyle = kind === 'hong' ? INK : '#fff'; g.fillText(ch, 0, 22 + i * 20); });
    }
    g.restore();
  }
  function seal(g) {
    oval(g, 15, 15, 11, 11, 0, RED, 1.2);
    g.lineWidth = 0.8; g.strokeStyle = '#fff6dc'; g.beginPath(); g.ellipse(15, 15, 8.6, 8.6, 0, 0, Math.PI * 2); g.stroke();
    text(g, '光', 15, 15.5, 13, '#fff6dc', 'bold serif');
  }
  function rounded(g, x, y, w, h, r) { g.beginPath(); g.roundRect(x, y, w, h, r); }
  // the thick plastic card: a dark edge, a cream face, a glossy sheen
  function body(g, faceFill) {
    rounded(g, 0, 0, W, H, 8); g.fillStyle = '#120c0c'; g.fill();
    rounded(g, 2.5, 2.5, W - 5, H - 5, 6.5); g.fillStyle = faceFill; g.fill();
  }
  function finish(g, rnd) {
    // paper grain and a plastic shine
    for (let i = 0; i < 220; i++) { g.fillStyle = `rgba(${rnd() < 0.5 ? '0,0,0' : '255,255,255'},${0.03 + rnd() * 0.04})`; g.fillRect(rnd() * W, rnd() * H, 0.8, 0.8); }
    const sh = g.createLinearGradient(0, 0, W, H); sh.addColorStop(0, 'rgba(255,255,255,.28)'); sh.addColorStop(0.35, 'rgba(255,255,255,0)'); sh.addColorStop(0.8, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,0,.14)');
    g.fillStyle = sh; g.fillRect(0, 0, W, H);
  }
  const prefs = { months: false };
  function paint(c) {
    const cv = document.createElement('canvas'); cv.width = W * S; cv.height = H * S;
    const g = cv.getContext('2d'); g.scale(S, S);
    body(g, PAPER);
    g.save(); rounded(g, 2.5, 2.5, W - 5, H - 5, 6.5); g.clip();
    const r = rng(c.id * 7 + 3);
    PLANT[c.m](g, r, c);
    if (c.motif) FEATURE[c.motif](g);
    if (c.rib) ribbon(g, c.rib);
    if (c.t === 'gwang') seal(g);
    if (prefs.months) { oval(g, 87, 147, 8, 8, 0, 'rgba(20,14,14,.85)', 0); text(g, String(c.m), 87, 148, 10, '#ffe9a8', 'bold "Noto Sans KR", sans-serif'); }
    finish(g, r);
    g.restore();
    return cv.toDataURL('image/png');
  }
  function paintBack() {
    const cv = document.createElement('canvas'); cv.width = W * S; cv.height = H * S;
    const g = cv.getContext('2d'); g.scale(S, S);
    body(g, '#b0141a');
    g.save(); rounded(g, 2.5, 2.5, W - 5, H - 5, 6.5); g.clip();
    const gr = g.createRadialGradient(40, 50, 10, 50, 80, 110); gr.addColorStop(0, '#d8262a'); gr.addColorStop(1, '#8a0c10'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    finish(g, rng(99));
    g.restore();
    return cv.toDataURL('image/png');
  }
  let cache = {};
  window.HWATU = {
    DECK,
    face: (id) => cache[id] || (cache[id] = paint(DECK[id])),
    back: () => cache.b || (cache.b = paintBack()),
    // a small month number in the corner, for anyone still learning the cards
    get months() { return prefs.months; },
    set months(v) { if (prefs.months !== !!v) { prefs.months = !!v; const b = cache.b; cache = { b }; } },
  };
})();
