// 포커 열전: 세븐포커 (Korean seven-card stud) rules engine and computer players — no DOM.
// Cards are 0..51: rank = id % 13 + 2 (2..14), suit = floor(id / 13) (0 ♠, 1 ♥, 2 ♦, 3 ♣).
// House rules as in Korean online poker: 4 cards, throw 1 and open 1, then 4구 · 5구 · 6구 open and 7구 히든,
// betting with 삥 · 따당 · 쿼터 · 하프 · 콜 · 체크 · 다이, the best open hand bets first,
// and equal hands are split by suit (♠ > ◆ > ♥ > ♣).
(function (root) {
  'use strict';
  const rankOf = (c) => (c % 13) + 2, suitOf = (c) => Math.floor(c / 13);
  const SUIT_RANK = [4, 2, 3, 1]; // ♠ ♥ ◆ ♣ → ♠4 ◆3 ♥2 ♣1
  const RN = { 11: 'J', 12: 'Q', 13: 'K', 14: 'A' };
  const rankName = (r) => RN[r] || String(r);
  const SUIT_CH = ['♠', '♥', '◆', '♣'];
  const cardName = (c) => SUIT_CH[suitOf(c)] + rankName(rankOf(c));
  // low → high
  const CAT_NAME = ['탑', '원페어', '투페어', '트리플', '스트레이트', '백스트레이트', '마운틴', '플러시', '풀하우스', '포카드', '스트레이트 플러시', '백스트레이트 플러시', '로열 스트레이트 플러시'];
  const CAT_SHORT = ['탑', '원페어', '투페어', '트리플', '스트레이트', '백스트레이트', '마운틴', '플러시', '풀하우스', '포카드', '스티플', '백스티플', '로티플'];

  // ---------- evaluation (Korean order; final tie-break by suit) ----------
  const byRankSuit = (a, b) => rankOf(b) - rankOf(a) || SUIT_RANK[suitOf(b)] - SUIT_RANK[suitOf(a)];
  function pack(cat, rs, suitCard) {
    let v = cat;
    for (let i = 0; i < 5; i++) v = v * 16 + (rs[i] || 0);
    return v * 5 + (suitCard == null ? 0 : SUIT_RANK[suitOf(suitCard)]);
  }
  // highest straight in a set of cards: returns { kind: 'mountain' | 'back' | 'normal', cards } preferring Korean order
  function findStraight(cards) {
    const byR = {};
    for (const c of cards.slice().sort(byRankSuit)) if (!byR[rankOf(c)]) byR[rankOf(c)] = c;
    const has = (r) => byR[r === 1 ? 14 : r];
    const run = (top) => { const out = []; for (let r = top; r > top - 5; r--) { const c = has(r); if (c == null) return null; out.push(c); } return out; };
    const m = run(14); if (m) return { kind: 'mountain', cards: m };
    const b = run(5); if (b) return { kind: 'back', cards: [b[4], b[0], b[1], b[2], b[3]] }; // A first: its suit settles ties
    for (let top = 13; top >= 6; top--) { const n = run(top); if (n) return { kind: 'normal', cards: n }; }
    return null;
  }
  function evaluate(cards) {
    const bySuit = [[], [], [], []], byRank = {};
    for (const c of cards) { bySuit[suitOf(c)].push(c); (byRank[rankOf(c)] = byRank[rankOf(c)] || []).push(c); }
    const fs = bySuit.find((s) => s.length >= 5);
    if (fs) {
      const st = findStraight(fs);
      if (st) {
        const cat = st.kind === 'mountain' ? 12 : st.kind === 'back' ? 11 : 10;
        return { cat, best: st.cards, score: pack(cat, st.kind === 'back' ? [5, 4, 3, 2, 1] : st.cards.map(rankOf), st.cards[0]) };
      }
    }
    const groups = Object.keys(byRank).map(Number).map((r) => ({ r, cs: byRank[r].slice().sort(byRankSuit) })).sort((a, b) => b.cs.length - a.cs.length || b.r - a.r);
    const kick = (excl, n) => cards.filter((c) => !excl.includes(rankOf(c))).sort(byRankSuit).slice(0, n);
    const g0 = groups[0], g1 = groups[1];
    if (g0.cs.length === 4) { const k = kick([g0.r], 1); return { cat: 9, best: [...g0.cs, ...k], score: pack(9, [g0.r, k[0] ? rankOf(k[0]) : 0], g0.cs[0]) }; }
    if (g0.cs.length === 3 && g1 && g1.cs.length >= 2) return { cat: 8, best: [...g0.cs, ...g1.cs.slice(0, 2)], score: pack(8, [g0.r, g1.r], g0.cs[0]) };
    if (fs) { const top = fs.slice().sort(byRankSuit).slice(0, 5); return { cat: 7, best: top, score: pack(7, top.map(rankOf), top[0]) }; }
    const st = findStraight(cards);
    if (st) { const cat = st.kind === 'mountain' ? 6 : st.kind === 'back' ? 5 : 4; return { cat, best: st.cards, score: pack(cat, st.kind === 'back' ? [5, 4, 3, 2, 1] : st.cards.map(rankOf), st.cards[0]) }; }
    if (g0.cs.length === 3) { const k = kick([g0.r], 2); return { cat: 3, best: [...g0.cs, ...k], score: pack(3, [g0.r, ...k.map(rankOf)], g0.cs[0]) }; }
    if (g0.cs.length === 2 && g1 && g1.cs.length === 2) { const k = kick([g0.r, g1.r], 1); return { cat: 2, best: [...g0.cs, ...g1.cs, ...k], score: pack(2, [g0.r, g1.r, ...k.map(rankOf)], g0.cs[0]) }; }
    if (g0.cs.length === 2) { const k = kick([g0.r], 3); return { cat: 1, best: [...g0.cs, ...k], score: pack(1, [g0.r, ...k.map(rankOf)], g0.cs[0]) }; }
    const top = cards.slice().sort(byRankSuit).slice(0, 5);
    return { cat: 0, best: top, score: pack(0, top.map(rankOf), top[0]) };
  }
  // what the open cards (1–4) show, for deciding who bets first
  function evalOpen(cards) {
    if (!cards.length) return { cat: -1, score: -1, best: [] };
    const byRank = {};
    for (const c of cards) (byRank[rankOf(c)] = byRank[rankOf(c)] || []).push(c);
    const g = Object.keys(byRank).map(Number).map((r) => ({ r, cs: byRank[r].slice().sort(byRankSuit) })).sort((a, b) => b.cs.length - a.cs.length || b.r - a.r);
    const rest = (excl) => cards.filter((c) => !excl.includes(rankOf(c))).sort(byRankSuit).map(rankOf);
    if (g[0].cs.length === 4) return { cat: 9, score: pack(9, [g[0].r], g[0].cs[0]), best: g[0].cs };
    if (g[0].cs.length === 3) return { cat: 3, score: pack(3, [g[0].r, ...rest([g[0].r])], g[0].cs[0]), best: g[0].cs };
    if (g[0].cs.length === 2 && g[1] && g[1].cs.length === 2) return { cat: 2, score: pack(2, [g[0].r, g[1].r], g[0].cs[0]), best: [...g[0].cs, ...g[1].cs] };
    if (g[0].cs.length === 2) return { cat: 1, score: pack(1, [g[0].r, ...rest([g[0].r])], g[0].cs[0]), best: g[0].cs };
    const s = cards.slice().sort(byRankSuit);
    return { cat: 0, score: pack(0, s.map(rankOf), s[0]), best: [s[0]] };
  }
  function describe(ev) {
    const r = (i) => rankName(rankOf(ev.best[i]));
    switch (ev.cat) {
      case 0: return `${r(0)} 탑`;
      case 1: return `${r(0)} 원페어`;
      case 2: return `${r(0)}·${r(2)} 투페어`;
      case 3: return `${r(0)} 트리플`;
      case 4: return `${r(0)} 스트레이트`;
      case 7: return `${r(0)} 플러시`;
      case 8: return `${r(0)} 풀하우스`;
      case 9: return `${r(0)} 포카드`;
      case 10: return `${r(0)} 스티플`;
      default: return CAT_SHORT[ev.cat];
    }
  }

  // ---------- random ----------
  function mulberry(seed) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  // ---------- computer personalities ----------
  const PERSONAS = [
    { id: 'rock', name: '김철벽', tag: '꽉 막힌 수비형', color: '#5a7a9a', tight: 1.35, aggr: 0.3, bluff: 0.03, trap: 0.15 },
    { id: 'fire', name: '박불꽃', tag: '겁 없는 하프꾼', color: '#d8542a', tight: 0.8, aggr: 0.75, bluff: 0.16, trap: 0 },
    { id: 'calc', name: '이계산', tag: '냉정한 계산형', color: '#3a9a6a', tight: 1.1, aggr: 0.55, bluff: 0.07, trap: 0.15 },
    { id: 'fish', name: '최낚시', tag: '끝까지 따라오는 낚시꾼', color: '#8a6ac8', tight: 0.8, aggr: 0.25, bluff: 0.05, trap: 0.45 },
    { id: 'wild', name: '정도박', tag: '종잡을 수 없는 승부사', color: '#c8a03a', tight: 0.65, aggr: 0.85, bluff: 0.25, trap: 0.05 },
    { id: 'old', name: '노영감', tag: '삥만 치는 노련한 영감', color: '#9a8a6a', tight: 1.2, aggr: 0.2, bluff: 0.1, trap: 0.35 },
  ];
  const DIFF = { easy: { iters: 90, noise: 0.12, skill: 0.75 }, normal: { iters: 180, noise: 0.06, skill: 1 }, hard: { iters: 340, noise: 0.02, skill: 1.15 } };

  // ---------- the table ----------
  const STREET_NAME = ['', '', '', '', '4구', '5구', '6구', '히든'];
  const MAX_RAISES = 3; // per betting round

  class StudTable {
    constructor(opts) {
      this.rnd = mulberry(opts.seed ?? Math.random() * 2 ** 32);
      this.diff = DIFF[opts.difficulty || 'normal'];
      this.unit = opts.unit; // 삥 and ante
      this.players = opts.players.map((p, i) => ({ seat: i, name: p.name, human: !!p.human, persona: p.persona || null, chips: p.chips, cards: [], open: [], folded: false, allIn: false, bet: 0, total: 0, acted: false, last: '', chose: false }));
      this.handNo = 0; this.log = [];
    }
    say(text, kind = '') { this.log.push({ text, kind, hand: this.handNo }); if (this.log.length > 200) this.log.shift(); }
    seated() { return this.players.filter((p) => !p.empty); }
    contenders() { return this.players.filter((p) => !p.folded && !p.empty); }
    pot() { return this.players.reduce((s, p) => s + p.total, 0); }
    next(i, pred) { const n = this.players.length; for (let k = 1; k <= n; k++) { const j = (i + k) % n; if (pred(this.players[j])) return j; } return -1; }
    draw() { return this.deck.pop(); }
    // a player's cards: 2 hidden + open ones + (from 7구) the hidden last card
    openCards(p) { return p.cards.filter((_, k) => p.open[k]); }

    startHand() {
      if (this.seated().length < 2) return false;
      this.handNo++;
      const d = Array.from({ length: 52 }, (_, i) => i);
      for (let i = 51; i > 0; i--) { const j = Math.floor(this.rnd() * (i + 1)); [d[i], d[j]] = [d[j], d[i]]; }
      this.deck = d; this.result = null; this.street = 3; this.phase = 'choose'; this.raises = 0;
      for (const p of this.players) Object.assign(p, { cards: [], open: [], folded: !!p.empty, allIn: false, bet: 0, total: 0, acted: false, last: '', chose: !!p.empty });
      // everybody antes, then gets four cards face down
      for (const p of this.seated()) { const a = Math.min(this.unit, p.chips); p.chips -= a; p.total += a; if (!p.chips) p.allIn = true; }
      for (let r = 0; r < 4; r++) for (const p of this.seated()) { p.cards.push(this.draw()); p.open.push(false); }
      this.say(`${this.handNo}번째 판 · 기본 ${this.unit}`, 'hand');
      for (const p of this.seated()) if (!p.human) { const [dc, oc] = this.aiChoose(p); this.choose(p.seat, dc, oc); }
      return true;
    }
    // throw one card away and turn one face up
    choose(i, discardIdx, openIdx) {
      const p = this.players[i];
      if (p.chose) return;
      const keep = p.cards.filter((_, k) => k !== discardIdx);
      const openCard = p.cards[openIdx];
      p.cards = keep.filter((c) => c !== openCard).concat([openCard]);
      p.open = [false, false, true];
      p.chose = true;
      if (this.seated().every((q) => q.chose)) this.nextStreet();
    }
    aiChoose(p) {
      // keep the three that look best together, then show the card that gives the least away
      const cs = p.cards;
      let best = -1, bestD = 0;
      for (let d = 0; d < 4; d++) {
        const k = cs.filter((_, i) => i !== d), rs = k.map(rankOf).sort((a, b) => b - a), ss = k.map(suitOf);
        let v = rs[0] * 0.6 + rs[1] * 0.3 + rs[2] * 0.1;
        if (rs[0] === rs[1] || rs[1] === rs[2]) v += 30 + Math.max(rs[0] === rs[1] ? rs[0] : rs[1]) * 1.5;
        if (rs[0] === rs[2]) v += 60;
        if (ss[0] === ss[1] && ss[1] === ss[2]) v += 14;
        if (rs[0] - rs[2] <= 4 && new Set(rs).size === 3) v += 10;
        if (v > best) { best = v; bestD = d; }
      }
      const keep = [0, 1, 2, 3].filter((i) => i !== bestD);
      const rk = keep.map((i) => rankOf(cs[i]));
      const pairR = rk.find((r, i) => rk.indexOf(r) !== i);
      // open a card outside the pair; otherwise the middle card
      let open = keep.find((i) => rankOf(cs[i]) !== pairR);
      if (pairR == null) open = keep.slice().sort((a, b) => rankOf(cs[a]) - rankOf(cs[b]))[1];
      return [bestD, open ?? keep[0]];
    }
    nextStreet() {
      for (const p of this.players) { p.bet = 0; p.acted = false; }
      this.curBet = 0; this.raises = 0;
      if (this.street >= 7) return this.finish();
      this.street++;
      this.phase = 'bet';
      for (const p of this.contenders()) { p.cards.push(this.draw()); p.open.push(this.street < 7); if (!p.allIn) p.last = ''; }
      this.say(`${STREET_NAME[this.street]}`, 'street');
      this.toAct = this.boss();
      this.settleIfDone();
    }
    // the best open hand acts first (보스)
    boss() {
      let best = -2, who = -1;
      for (const p of this.contenders()) { if (p.allIn) continue; const s = evalOpen(this.openCards(p)).score; if (s > best) { best = s; who = p.seat; } }
      return who;
    }
    options(i = this.toAct) {
      const p = this.players[i], pot = this.pot();
      const toCall = Math.min(this.curBet - p.bet, p.chips), maxTo = p.bet + p.chips;
      const canRaise = this.raises < MAX_RAISES && maxTo > this.curBet && !(p.acted && this.curBet > p.bet && this.raises >= MAX_RAISES);
      const after = pot + toCall; // the pot once this player has called
      const step = Math.max(1, Math.round(this.unit / 10));
      const r = (v) => Math.min(maxTo, Math.ceil(v / step) * step);
      const o = { toCall, canCheck: toCall === 0, maxTo, pot, acts: {} };
      if (this.curBet === 0) {
        o.acts.check = 0;
        if (canRaise) { o.acts.ping = r(this.unit); o.acts.quarter = r(Math.max(this.unit, after / 4)); o.acts.half = r(Math.max(this.unit, after / 2)); }
      } else {
        o.acts.call = toCall;
        if (canRaise) { o.acts.ddadang = r(this.curBet * 2); o.acts.quarter = r(this.curBet + after / 4); o.acts.half = r(this.curBet + after / 2); }
      }
      o.acts.die = 0;
      return o;
    }
    act(type) {
      const i = this.toAct, p = this.players[i], o = this.options(i);
      if (!(type in o.acts)) type = o.canCheck ? 'check' : 'call';
      const NAMES = { ping: '삥', ddadang: '따당', quarter: '쿼터', half: '하프' };
      if (type === 'die') { p.folded = true; p.last = '다이'; this.say(`${p.name}: 다이`, 'fold'); }
      else if (type === 'check') { p.last = '체크'; this.say(`${p.name}: 체크`, 'check'); }
      else if (type === 'call') {
        const a = o.toCall; p.chips -= a; p.bet += a; p.total += a; if (!p.chips) p.allIn = true;
        p.last = p.allIn ? '올인' : '콜'; this.say(`${p.name}: ${p.last} ${a}`, 'call');
      } else {
        const to = o.acts[type], add = to - p.bet;
        p.chips -= add; p.bet = to; p.total += add; if (!p.chips) p.allIn = true;
        if (to > this.curBet) { this.raises++; for (const q of this.players) if (q !== p) q.acted = false; }
        this.curBet = Math.max(this.curBet, to);
        p.last = p.allIn ? '올인' : NAMES[type];
        this.say(`${p.name}: ${p.last} (${to})`, 'raise');
      }
      p.acted = true;
      this.advance();
    }
    advance() {
      if (this.contenders().length === 1) return this.finish();
      const need = (p) => !p.folded && !p.empty && !p.allIn && (!p.acted || p.bet < this.curBet);
      if (this.players.some(need)) { this.toAct = this.next(this.toAct, need); return; }
      this.nextStreet();
    }
    settleIfDone() {
      const canBet = this.contenders().filter((p) => !p.allIn);
      if (this.contenders().length > 1 && canBet.length <= 1) {
        this.runout = true;
        while (this.street < 7) { this.street++; for (const p of this.contenders()) { p.cards.push(this.draw()); p.open.push(this.street < 7); } }
        this.finish();
      }
    }
    finish() {
      this.phase = 'done'; this.street = Math.max(this.street, 7);
      const cont = this.contenders();
      const evals = new Map(cont.map((p) => [p, cont.length > 1 ? evaluate(p.cards) : null]));
      const levels = [...new Set(this.players.filter((p) => p.total > 0).map((p) => p.total))].sort((a, b) => a - b);
      const won = new Map(), pots = [];
      let prev = 0;
      for (const lv of levels) {
        let amt = 0; for (const p of this.players) amt += Math.max(0, Math.min(p.total, lv) - prev);
        const elig = cont.filter((p) => p.total >= lv); prev = lv;
        if (!amt) continue;
        if (!elig.length) { if (pots.length) pots[pots.length - 1].amt += amt; continue; }
        pots.push({ amt, elig });
      }
      for (const pot of pots) {
        // suits break ties, so there is always one winner
        let best = -1, w = null;
        for (const p of pot.elig) { const s = evals.get(p)?.score ?? 0; if (s > best) { best = s; w = p; } }
        w.chips += pot.amt; won.set(w, (won.get(w) || 0) + pot.amt); pot.winner = w;
      }
      const showdown = cont.length > 1;
      this.result = { showdown, pots, won, evals };
      for (const [p, g] of won) this.say(`${p.name} ${g} 획득${showdown ? ` · ${describe(evals.get(p))}` : ''}`, 'win');
      this.toAct = -1;
    }

    // ---------- computer decision ----------
    equityFor(p, iters) {
      const seen = new Set(p.cards);
      for (const q of this.contenders()) if (q !== p) for (const c of this.openCards(q)) seen.add(c);
      const pool = []; for (let c = 0; c < 52; c++) if (!seen.has(c)) pool.push(c);
      const opps = this.contenders().filter((q) => q !== p);
      const rnd = this.rnd;
      let win = 0;
      for (let it = 0; it < iters; it++) {
        let k = 0;
        const take = () => { const j = k + Math.floor(rnd() * (pool.length - k)); const t = pool[k]; pool[k] = pool[j]; pool[j] = t; return pool[k++]; };
        const mine = p.cards.slice(); while (mine.length < 7) mine.push(take());
        const me = evaluate(mine).score;
        let beat = false;
        for (const q of opps) {
          const theirs = this.openCards(q); while (theirs.length < 7) theirs.push(take());
          if (evaluate(theirs).score > me) { beat = true; break; }
        }
        if (!beat) win++;
      }
      return win / iters;
    }
    decide(i = this.toAct) {
      const p = this.players[i], per = p.persona || PERSONAS[2], o = this.options(i), D = this.diff, rnd = this.rnd;
      const opp = this.contenders().length - 1;
      const eq = Math.min(1, Math.max(0, this.equityFor(p, D.iters) + (rnd() - 0.5) * 2 * D.noise));
      const rel = eq * (opp + 1), tight = per.tight / D.skill;
      const strong = rel > 2 * tight || eq > 0.78, good = rel > 1.3 * tight || eq > 0.6;
      const potOdds = o.toCall / (o.pot + o.toCall || 1);
      const has = (k) => k in o.acts;
      const r = rnd();
      const hidden = this.street === 7;
      if (o.canCheck) {
        if (strong && r < per.trap && !hidden) return 'check';
        if (strong && has('half')) return r < 0.7 ? 'half' : 'quarter';
        if (good && r < per.aggr && has('ping')) return r < per.aggr * 0.4 && has('quarter') ? 'quarter' : 'ping';
        if (r < per.bluff && has('half')) return 'half';
        return 'check';
      }
      const pressure = o.toCall / Math.max(1, p.chips + p.bet);
      if (strong && r < per.aggr + 0.15) return has('half') && r < 0.75 ? 'half' : has('ddadang') ? 'ddadang' : 'call';
      if (eq >= potOdds + 0.04 * tight + pressure * 0.12 || (good && pressure < 0.2)) {
        if (good && r < per.aggr * 0.3 && has('ddadang')) return 'ddadang';
        return 'call';
      }
      if (r < per.bluff * 0.5 && pressure < 0.12 && has('half')) return 'half';
      if (pressure < 0.03 && r < 0.5 / tight) return 'call';
      return 'die';
    }
  }

  const API = { rankOf, suitOf, rankName, cardName, SUIT_CH, CAT_NAME, CAT_SHORT, STREET_NAME, evaluate, evalOpen, describe, PERSONAS, DIFF, StudTable, mulberry };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.STUD = API;
})(typeof window !== 'undefined' ? window : globalThis);
