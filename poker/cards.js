// 포커 열전: the 52 cards and the back, drawn in code (original artwork) and cached as image URLs.
// Four-colour suits so they read at a glance on a phone: ♠ black · ♥ red · ♦ blue · ♣ green.
(function () {
  'use strict';
  const W = 100, H = 140, S = 3;
  const SUIT_COL = ['#1d1b22', '#c8282e', '#2457b8', '#1f7a46'];
  const PAPER = '#fbf7ee';
  const rankName = (r) => ({ 11: 'J', 12: 'Q', 13: 'K', 14: 'A' }[r] || String(r));

  function suitPath(g, s, x, y, sz) {
    g.save(); g.translate(x, y); g.scale(sz / 20, sz / 20); g.beginPath();
    if (s === 1) { // heart
      g.moveTo(0, 8); g.bezierCurveTo(-12, 0, -11, -9, -5, -9); g.bezierCurveTo(-2, -9, 0, -7, 0, -5); g.bezierCurveTo(0, -7, 2, -9, 5, -9); g.bezierCurveTo(11, -9, 12, 0, 0, 8);
    } else if (s === 2) { // diamond
      g.moveTo(0, -10); g.quadraticCurveTo(4, -4, 8, 0); g.quadraticCurveTo(4, 4, 0, 10); g.quadraticCurveTo(-4, 4, -8, 0); g.quadraticCurveTo(-4, -4, 0, -10);
    } else if (s === 0) { // spade
      g.moveTo(0, -10); g.bezierCurveTo(-3, -5, -11, -1, -9, 4); g.bezierCurveTo(-8, 8, -3, 8, -1, 5); g.lineTo(-3, 10); g.lineTo(3, 10); g.lineTo(1, 5); g.bezierCurveTo(3, 8, 8, 8, 9, 4); g.bezierCurveTo(11, -1, 3, -5, 0, -10);
    } else { // club
      g.arc(0, -5, 4.6, 0, Math.PI * 2); g.moveTo(-1, 2); g.arc(-5, 2, 4.6, 0, Math.PI * 2); g.moveTo(9.6, 2); g.arc(5, 2, 4.6, 0, Math.PI * 2);
      g.moveTo(-1.5, 2); g.lineTo(-3, 10); g.lineTo(3, 10); g.lineTo(1.5, 2);
    }
    g.fillStyle = SUIT_COL[s]; g.fill(); g.restore();
  }
  function rounded(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
  function corner(g, r, s) {
    g.fillStyle = SUIT_COL[s]; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
    g.font = `900 ${r === 10 ? 17 : 20}px "Noto Sans KR", "Apple SD Gothic Neo", sans-serif`;
    g.fillText(rankName(r), 12, 24);
    suitPath(g, s, 12, 34, 11);
  }
  // classic pip layouts on a 3-column grid
  const PIPS = {
    2: [[1, 0], [1, 4]], 3: [[1, 0], [1, 2], [1, 4]], 4: [[0, 0], [2, 0], [0, 4], [2, 4]], 5: [[0, 0], [2, 0], [1, 2], [0, 4], [2, 4]],
    6: [[0, 0], [2, 0], [0, 2], [2, 2], [0, 4], [2, 4]], 7: [[0, 0], [2, 0], [1, 1], [0, 2], [2, 2], [0, 4], [2, 4]],
    8: [[0, 0], [2, 0], [1, 1], [0, 2], [2, 2], [1, 3], [0, 4], [2, 4]], 9: [[0, 0], [2, 0], [0, 1.33], [2, 1.33], [1, 2], [0, 2.67], [2, 2.67], [0, 4], [2, 4]],
    10: [[0, 0], [2, 0], [1, 0.67], [0, 1.33], [2, 1.33], [0, 2.67], [2, 2.67], [1, 3.33], [0, 4], [2, 4]],
  };
  // a court figure, drawn in the top half and mirrored (double-ended like real cards)
  function court(g, r, s) {
    const col = SUIT_COL[s];
    g.save(); rounded(g, 22, 16, 56, 108, 5); g.clip();
    g.fillStyle = '#f3e6c8'; g.fillRect(22, 16, 56, 108);
    for (const flip of [0, 1]) {
      g.save();
      if (flip) { g.translate(W, H); g.rotate(Math.PI); }
      // robe
      g.beginPath(); g.moveTo(26, 70); g.quadraticCurveTo(30, 46, 50, 44); g.quadraticCurveTo(70, 46, 74, 70); g.closePath();
      g.fillStyle = col; g.fill();
      g.fillStyle = '#e8b84a'; g.fillRect(46, 46, 8, 24);
      for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(50, 52 + i * 6, 1.6, 0, Math.PI * 2); g.fillStyle = '#fff4d8'; g.fill(); }
      // collar
      g.beginPath(); g.moveTo(38, 46); g.lineTo(50, 54); g.lineTo(62, 46); g.lineWidth = 2; g.strokeStyle = '#fff4d8'; g.stroke();
      // head
      g.beginPath(); g.arc(50, 36, 8.5, 0, Math.PI * 2); g.fillStyle = '#f1cfa8'; g.fill();
      g.fillStyle = '#2a2024'; g.fillRect(45.5, 35, 2, 2); g.fillRect(52.5, 35, 2, 2);
      if (r === 13) { // king: crown and beard
        g.beginPath(); g.moveTo(40, 30); g.lineTo(42, 18); g.lineTo(46, 25); g.lineTo(50, 16); g.lineTo(54, 25); g.lineTo(58, 18); g.lineTo(60, 30); g.closePath(); g.fillStyle = '#e8b84a'; g.fill();
        g.beginPath(); g.moveTo(43, 40); g.quadraticCurveTo(50, 52, 57, 40); g.fillStyle = '#6a4a3a'; g.fill();
      } else if (r === 12) { // queen: hair and tiara
        g.beginPath(); g.arc(50, 34, 10, Math.PI, 0); g.fillStyle = '#4a2a2a'; g.fill(); g.fillRect(40, 34, 4, 12); g.fillRect(56, 34, 4, 12);
        g.beginPath(); g.moveTo(43, 27); g.lineTo(50, 21); g.lineTo(57, 27); g.lineWidth = 2.4; g.strokeStyle = '#e8b84a'; g.stroke();
        g.beginPath(); g.arc(50, 21, 2, 0, Math.PI * 2); g.fillStyle = '#e84a6a'; g.fill();
        g.beginPath(); g.arc(50, 36, 8.5, 0.15 * Math.PI, 0.85 * Math.PI); g.fillStyle = '#f1cfa8'; g.fill();
      } else { // jack: feathered cap
        g.beginPath(); g.moveTo(40, 31); g.quadraticCurveTo(50, 20, 61, 30); g.closePath(); g.fillStyle = col; g.fill();
        g.beginPath(); g.moveTo(58, 27); g.quadraticCurveTo(68, 16, 66, 28); g.fillStyle = '#e8b84a'; g.fill();
      }
      g.restore();
    }
    g.restore();
    g.strokeStyle = col; g.lineWidth = 1.4; rounded(g, 22, 16, 56, 108, 5); g.stroke();
    g.beginPath(); g.moveTo(22, 70); g.lineTo(78, 70); g.stroke();
    suitPath(g, s, 30, 26, 10); suitPath(g, s, 70, 114, 10);
  }
  function paint(c) {
    const r = (c % 13) + 2, s = Math.floor(c / 13);
    const cv = document.createElement('canvas'); cv.width = W * S; cv.height = H * S;
    const g = cv.getContext('2d'); g.scale(S, S);
    rounded(g, 0.5, 0.5, W - 1, H - 1, 8); g.fillStyle = PAPER; g.fill();
    g.lineWidth = 1; g.strokeStyle = 'rgba(0,0,0,.25)'; g.stroke();
    corner(g, r, s);
    g.save(); g.translate(W, H); g.rotate(Math.PI); corner(g, r, s); g.restore();
    if (r >= 11 && r <= 13) court(g, r, s);
    else if (r === 14) { suitPath(g, s, 50, 72, s === 0 ? 46 : 38); if (s === 0) { g.beginPath(); g.arc(50, 72, 30, 0, Math.PI * 2); g.lineWidth = 1; g.strokeStyle = 'rgba(0,0,0,.25)'; g.stroke(); } }
    else {
      for (const [cx, cy] of PIPS[r]) {
        const x = 33 + cx * 17, y = 28 + cy * 21;
        if (cy > 2) { g.save(); g.translate(x, y); g.rotate(Math.PI); suitPath(g, s, 0, 0, 15); g.restore(); } else suitPath(g, s, x, y, 15);
      }
    }
    return cv.toDataURL('image/png');
  }
  function paintBack() {
    const cv = document.createElement('canvas'); cv.width = W * S; cv.height = H * S;
    const g = cv.getContext('2d'); g.scale(S, S);
    rounded(g, 0.5, 0.5, W - 1, H - 1, 8); g.fillStyle = '#7a1d24'; g.fill();
    rounded(g, 6, 6, W - 12, H - 12, 5); g.lineWidth = 2; g.strokeStyle = '#e8c27a'; g.stroke();
    g.save(); rounded(g, 8, 8, W - 16, H - 16, 4); g.clip();
    g.strokeStyle = 'rgba(232,194,122,.35)'; g.lineWidth = 1;
    for (let i = -H; i < W + H; i += 7) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + H, H); g.stroke(); g.beginPath(); g.moveTo(i + H, 0); g.lineTo(i, H); g.stroke(); }
    g.restore();
    g.beginPath(); g.arc(W / 2, H / 2, 17, 0, Math.PI * 2); g.fillStyle = '#7a1d24'; g.fill(); g.lineWidth = 2; g.strokeStyle = '#e8c27a'; g.stroke();
    suitPath(g, 0, W / 2 - 6, H / 2 - 5, 9); suitPath(g, 1, W / 2 + 6, H / 2 - 5, 9); suitPath(g, 2, W / 2 - 6, H / 2 + 6, 9); suitPath(g, 3, W / 2 + 6, H / 2 + 6, 9);
    return cv.toDataURL('image/png');
  }
  const cache = {};
  window.CARDS = { face: (c) => cache[c] || (cache[c] = paint(c)), back: () => cache.b || (cache.b = paintBack()), SUIT_COL };
})();
