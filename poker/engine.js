// 포커 열전: No-Limit Texas Hold'em rules engine and computer players (no DOM; runs in the browser or in node).
// Cards are 0..51: rank = id % 13 + 2 (2..14, 14 = A), suit = floor(id / 13) (0 ♠, 1 ♥, 2 ♦, 3 ♣).
(function (root) {
  'use strict';
  const rankOf = (c) => (c % 13) + 2, suitOf = (c) => Math.floor(c / 13);
  const RANK_CH = { 11: 'J', 12: 'Q', 13: 'K', 14: 'A' };
  const rankName = (r) => RANK_CH[r] || String(r);
  const SUIT_CH = ['♠', '♥', '♦', '♣'];
  const cardName = (c) => rankName(rankOf(c)) + SUIT_CH[suitOf(c)];
  const CAT_NAME = ['하이카드', '원페어', '투페어', '트리플', '스트레이트', '플러시', '풀하우스', '포카드', '스트레이트 플러시', '로열 플러시'];

  // ---------- hand evaluation: best five of up to seven ----------
  // score packs the category and five tie-break ranks into one comparable number.
  const pack = (cat, rs) => cat * 1048576 + (rs[0] || 0) * 65536 + (rs[1] || 0) * 4096 + (rs[2] || 0) * 256 + (rs[3] || 0) * 16 + (rs[4] || 0);
  function straightTop(mask) {
    // mask bit r set for each rank r (2..14); the ace also counts low
    if (mask & (1 << 14)) mask |= 1 << 1;
    for (let top = 14; top >= 5; top--) {
      let ok = true;
      for (let r = top; r > top - 5; r--) if (!(mask & (1 << r))) { ok = false; break; }
      if (ok) return top;
    }
    return 0;
  }
  const straightRanks = (top) => [top, top - 1, top - 2, top - 3, top - 4].map((r) => (r === 1 ? 14 : r));
  function evaluate(cards) {
    const bySuit = [[], [], [], []], byRank = {};
    let mask = 0;
    for (const c of cards) { bySuit[suitOf(c)].push(c); const r = rankOf(c); (byRank[r] = byRank[r] || []).push(c); mask |= 1 << r; }
    const pickRanks = (rs, pool) => rs.map((r) => pool.find((c) => rankOf(c) === r && (pool = pool.filter((x) => x !== c), true)));
    // flush / straight flush
    const fs = bySuit.find((s) => s.length >= 5);
    if (fs) {
      let fm = 0; for (const c of fs) fm |= 1 << rankOf(c);
      const top = straightTop(fm);
      if (top) { const rs = straightRanks(top); return { score: pack(top === 14 ? 9 : 8, rs), cat: top === 14 ? 9 : 8, best: pickRanks(rs, fs.slice()) }; }
    }
    const groups = Object.keys(byRank).map(Number).map((r) => ({ r, cs: byRank[r] })).sort((a, b) => b.cs.length - a.cs.length || b.r - a.r);
    const kick = (excl, n) => cards.filter((c) => !excl.includes(rankOf(c))).sort((a, b) => rankOf(b) - rankOf(a)).slice(0, n);
    if (groups[0].cs.length === 4) {
      const k = kick([groups[0].r], 1);
      return { score: pack(7, [groups[0].r, groups[0].r, groups[0].r, groups[0].r, rankOf(k[0])]), cat: 7, best: [...groups[0].cs, ...k] };
    }
    if (groups[0].cs.length === 3 && groups[1] && groups[1].cs.length >= 2) {
      const t = groups[0], p = groups[1];
      return { score: pack(6, [t.r, t.r, t.r, p.r, p.r]), cat: 6, best: [...t.cs, ...p.cs.slice(0, 2)] };
    }
    if (fs) { const top5 = fs.slice().sort((a, b) => rankOf(b) - rankOf(a)).slice(0, 5); return { score: pack(5, top5.map(rankOf)), cat: 5, best: top5 }; }
    const st = straightTop(mask);
    if (st) { const rs = straightRanks(st); return { score: pack(4, rs), cat: 4, best: pickRanks(rs, cards.slice()) }; }
    if (groups[0].cs.length === 3) { const k = kick([groups[0].r], 2); return { score: pack(3, [groups[0].r, groups[0].r, groups[0].r, ...k.map(rankOf)]), cat: 3, best: [...groups[0].cs, ...k] }; }
    if (groups[0].cs.length === 2 && groups[1] && groups[1].cs.length === 2) {
      const a = groups[0], b = groups[1], k = kick([a.r, b.r], 1);
      return { score: pack(2, [a.r, a.r, b.r, b.r, ...k.map(rankOf)]), cat: 2, best: [...a.cs, ...b.cs, ...k] };
    }
    if (groups[0].cs.length === 2) { const k = kick([groups[0].r], 3); return { score: pack(1, [groups[0].r, groups[0].r, ...k.map(rankOf)]), cat: 1, best: [...groups[0].cs, ...k] }; }
    const top5 = cards.slice().sort((a, b) => rankOf(b) - rankOf(a)).slice(0, 5);
    return { score: pack(0, top5.map(rankOf)), cat: 0, best: top5 };
  }
  function describe(ev) {
    const rs = ev.best.map(rankOf);
    switch (ev.cat) {
      case 0: return `하이카드 ${rankName(rs[0])}`;
      case 1: return `원페어 (${rankName(rs[0])})`;
      case 2: return `투페어 (${rankName(rs[0])}·${rankName(rs[2])})`;
      case 3: return `트리플 (${rankName(rs[0])})`;
      case 4: return `스트레이트 (${rankName(Math.max(...rs.map((r) => (r === 14 && rs.includes(5) && !rs.includes(13) ? 1 : r))))} 하이)`;
      case 5: return `플러시 (${rankName(rs[0])} 하이)`;
      case 6: return `풀하우스 (${rankName(rs[0])}·${rankName(rs[3])})`;
      case 7: return `포카드 (${rankName(rs[0])})`;
      default: return CAT_NAME[ev.cat];
    }
  }

  // ---------- random ----------
  function mulberry(seed) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function shuffled(rnd) { const d = Array.from({ length: 52 }, (_, i) => i); for (let i = 51; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [d[i], d[j]] = [d[j], d[i]]; } return d; }

  // Monte Carlo equity of `hole` against `nOpp` random hands on the given board.
  function equity(hole, board, nOpp, iters, rnd = Math.random) {
    const used = new Set([...hole, ...board]);
    const pool = []; for (let c = 0; c < 52; c++) if (!used.has(c)) pool.push(c);
    let win = 0;
    const need = 5 - board.length;
    for (let it = 0; it < iters; it++) {
      // partial Fisher–Yates: draw just what this trial needs
      const take = need + nOpp * 2;
      for (let i = 0; i < take; i++) { const j = i + Math.floor(rnd() * (pool.length - i)); const t = pool[i]; pool[i] = pool[j]; pool[j] = t; }
      const b = board.concat(pool.slice(0, need));
      const me = evaluate(hole.concat(b)).score;
      let best = 0, ties = 0, beat = false;
      for (let o = 0; o < nOpp; o++) {
        const s = evaluate([pool[need + o * 2], pool[need + o * 2 + 1], ...b]).score;
        if (s > me) { beat = true; break; }
        if (s === me) ties++;
        if (s > best) best = s;
      }
      if (!beat) win += ties ? 1 / (ties + 1) : 1;
    }
    return win / iters;
  }

  // ---------- computer personalities ----------
  // tight: how much better than an even share a hand must be to play · aggr: raise instead of call · bluff: bet with air · trap: slow-play monsters
  const PERSONAS = [
    { id: 'rock', name: '김철벽', tag: '꽉 막힌 수비형', color: '#5a7a9a', tight: 1.35, aggr: 0.3, bluff: 0.03, trap: 0.1 },
    { id: 'fire', name: '박불꽃', tag: '겁 없는 공격형', color: '#d8542a', tight: 0.8, aggr: 0.7, bluff: 0.16, trap: 0 },
    { id: 'calc', name: '이계산', tag: '냉정한 계산형', color: '#3a9a6a', tight: 1.1, aggr: 0.55, bluff: 0.08, trap: 0.15 },
    { id: 'fish', name: '최낚시', tag: '잘 따라오는 낚시꾼', color: '#8a6ac8', tight: 0.85, aggr: 0.25, bluff: 0.05, trap: 0.45 },
    { id: 'wild', name: '정도박', tag: '종잡을 수 없는 승부사', color: '#c8a03a', tight: 0.65, aggr: 0.8, bluff: 0.26, trap: 0.05 },
  ];
  const DIFF = { easy: { iters: 120, noise: 0.12, skill: 0.7 }, normal: { iters: 260, noise: 0.06, skill: 1 }, hard: { iters: 500, noise: 0.02, skill: 1.15 } };

  // ---------- the table ----------
  const BLIND_LEVELS = [[10, 20], [15, 30], [25, 50], [50, 100], [75, 150], [100, 200], [150, 300], [200, 400], [300, 600], [500, 1000], [800, 1600], [1200, 2400]];
  const HANDS_PER_LEVEL = 8;

  class Table {
    constructor(opts) {
      this.rnd = mulberry(opts.seed ?? (Math.random() * 2 ** 32));
      this.diff = DIFF[opts.difficulty || 'normal'];
      this.players = opts.players.map((p, i) => ({ seat: i, name: p.name, human: !!p.human, persona: p.persona || null, chips: p.chips, out: false, hole: [], bet: 0, total: 0, folded: false, allIn: false, acted: false, last: '' }));
      this.dealer = opts.dealer ?? Math.floor(this.rnd() * this.players.length);
      this.handNo = 0;
      this.log = [];
      this.listeners = [];
    }
    get level() { return Math.min(BLIND_LEVELS.length - 1, Math.floor(this.handNo / HANDS_PER_LEVEL)); }
    get blinds() { return BLIND_LEVELS[this.level]; }
    live() { return this.players.filter((p) => !p.out); }
    next(i, pred = (p) => !p.out) { const n = this.players.length; for (let k = 1; k <= n; k++) { const j = (i + k) % n; if (pred(this.players[j])) return j; } return -1; }
    pot() { return this.players.reduce((s, p) => s + p.total, 0); }
    say(text, kind = '') { this.log.push({ text, kind, hand: this.handNo }); if (this.log.length > 200) this.log.shift(); }

    // starts a hand; returns false when the tournament is over
    startHand() {
      for (const p of this.players) if (!p.out && p.chips <= 0) p.out = true;
      if (this.live().length < 2) return false;
      this.handNo++;
      this.deck = shuffled(this.rnd);
      this.board = [];
      this.street = 0; // 0 preflop · 1 flop · 2 turn · 3 river · 4 showdown
      this.result = null;
      for (const p of this.players) Object.assign(p, { hole: [], bet: 0, total: 0, folded: p.out, allIn: false, acted: false, last: '' });
      this.dealer = this.next(this.dealer);
      const heads = this.live().length === 2;
      const [sb, bb] = this.blinds;
      this.sbSeat = heads ? this.dealer : this.next(this.dealer);
      this.bbSeat = this.next(this.sbSeat);
      if (this.handNo > 1 && (this.handNo - 1) % HANDS_PER_LEVEL === 0 && this.level > 0) this.say(`블라인드가 ${sb}/${bb}로 올랐어요`, 'level');
      this.post(this.sbSeat, sb, '스몰 블라인드'); this.post(this.bbSeat, bb, '빅 블라인드');
      for (let r = 0; r < 2; r++) for (let k = 1; k <= this.players.length; k++) { const p = this.players[(this.dealer + k) % this.players.length]; if (!p.out) p.hole.push(this.deck.pop()); }
      this.curBet = bb; this.minRaise = bb;
      this.toAct = this.next(this.bbSeat, (p) => !p.folded && !p.allIn);
      this.say(`${this.handNo}번째 판 · 블라인드 ${sb}/${bb}`, 'hand');
      this.settleIfDone();
      return true;
    }
    post(i, amt, what) {
      const p = this.players[i], a = Math.min(amt, p.chips);
      p.chips -= a; p.bet += a; p.total += a; if (!p.chips) p.allIn = true;
      p.last = what === '스몰 블라인드' ? 'SB' : 'BB';
    }
    // what the player to act may do
    options(i = this.toAct) {
      const p = this.players[i];
      const toCall = Math.min(this.curBet - p.bet, p.chips);
      const maxTo = p.bet + p.chips;
      const minTo = Math.min(maxTo, this.curBet + this.minRaise);
      // a player who already acted may only re-raise when a full raise reopened the action (a short all-in doesn't)
      return { toCall, canCheck: toCall === 0, minTo, maxTo, canRaise: maxTo > this.curBet && !(p.acted && this.curBet > p.bet), pot: this.pot() };
    }
    act(type, to = 0) {
      const i = this.toAct, p = this.players[i], o = this.options(i);
      if (type === 'check' && !o.canCheck) type = 'call';
      if (type === 'raise' && !o.canRaise) type = o.canCheck ? 'check' : 'call';
      if (type === 'fold') { p.folded = true; p.last = '폴드'; this.say(`${p.name}: 폴드`, 'fold'); }
      else if (type === 'check') { p.last = '체크'; this.say(`${p.name}: 체크`, 'check'); }
      else if (type === 'call') {
        const a = o.toCall; p.chips -= a; p.bet += a; p.total += a; if (!p.chips) p.allIn = true;
        p.last = p.allIn ? '올인' : `콜 ${a}`; this.say(`${p.name}: ${p.allIn ? `올인 (${p.bet})` : `콜 ${a}`}`, 'call');
      } else {
        to = Math.max(o.minTo, Math.min(o.maxTo, Math.round(to)));
        const add = to - p.bet, raiseBy = to - this.curBet;
        p.chips -= add; p.bet = to; p.total += add; if (!p.chips) p.allIn = true;
        if (raiseBy >= this.minRaise) { this.minRaise = raiseBy; for (const q of this.players) if (q !== p && q.acted) q.acted = false; }
        const was = this.curBet; this.curBet = Math.max(this.curBet, to);
        p.last = p.allIn ? '올인' : was === 0 ? `벳 ${to}` : `레이즈 ${to}`;
        this.say(`${p.name}: ${p.allIn ? `올인 (${to})` : was === 0 ? `벳 ${to}` : `레이즈 → ${to}`}`, 'raise');
      }
      p.acted = true;
      this.advance();
    }
    contenders() { return this.players.filter((p) => !p.folded); }
    advance() {
      if (this.contenders().length === 1) return this.finish();
      const pending = this.players.filter((p) => !p.folded && !p.allIn && (!p.acted || p.bet < this.curBet));
      if (pending.length) { this.toAct = this.next(this.toAct, (p) => !p.folded && !p.allIn && (!p.acted || p.bet < this.curBet)); return; }
      this.nextStreet();
    }
    nextStreet() {
      for (const p of this.players) { p.bet = 0; p.acted = false; }
      this.curBet = 0; this.minRaise = this.blinds[1];
      if (this.street === 3) return this.finish();
      this.street++;
      this.deck.pop(); // burn
      if (this.street === 1) this.board.push(this.deck.pop(), this.deck.pop(), this.deck.pop()); else this.board.push(this.deck.pop());
      this.say(`${['', '플롭', '턴', '리버'][this.street]}: ${this.board.map(cardName).join(' ')}`, 'street');
      for (const p of this.players) if (!p.folded && !p.allIn) p.last = '';
      this.toAct = this.next(this.dealer, (p) => !p.folded && !p.allIn);
      this.settleIfDone();
    }
    // nobody (or only one player) can still bet: deal the rest out
    settleIfDone() {
      const canBet = this.players.filter((p) => !p.folded && !p.allIn);
      const facing = canBet.filter((p) => p.bet < this.curBet);
      if (this.contenders().length > 1 && canBet.length <= 1 && !facing.length) { this.runout = true; while (this.street < 3) this.nextStreetQuiet(); this.finish(); }
    }
    nextStreetQuiet() {
      for (const p of this.players) { p.bet = 0; p.acted = false; }
      this.curBet = 0; this.street++; this.deck.pop();
      if (this.street === 1) this.board.push(this.deck.pop(), this.deck.pop(), this.deck.pop()); else this.board.push(this.deck.pop());
    }
    // pots, layered by all-in amounts; folded chips stay in but can't win
    finish() {
      this.street = 4;
      const cont = this.contenders();
      const evals = new Map(cont.map((p) => [p, cont.length > 1 ? evaluate([...p.hole, ...this.board]) : null]));
      const levels = [...new Set(this.players.filter((p) => p.total > 0).map((p) => p.total))].sort((a, b) => a - b);
      const won = new Map(); const pots = [];
      let prev = 0;
      for (const lv of levels) {
        let amt = 0; for (const p of this.players) amt += Math.max(0, Math.min(p.total, lv) - prev);
        const elig = cont.filter((p) => p.total >= lv);
        prev = lv;
        if (!amt) continue;
        if (!elig.length) { const last = pots[pots.length - 1]; if (last) last.amt += amt; continue; }
        pots.push({ amt, elig });
      }
      for (const pot of pots) {
        let best = -1, winners = [];
        for (const p of pot.elig) { const s = evals.get(p)?.score ?? 0; if (s > best) { best = s; winners = [p]; } else if (s === best) winners.push(p); }
        const share = Math.floor(pot.amt / winners.length);
        let rest = pot.amt - share * winners.length;
        // odd chips go to the first winner left of the dealer
        const order = winners.slice().sort((a, b) => ((a.seat - this.dealer + this.players.length) % this.players.length) - ((b.seat - this.dealer + this.players.length) % this.players.length));
        for (const w of order) { const g = share + (rest > 0 ? 1 : 0); rest--; w.chips += g; won.set(w, (won.get(w) || 0) + g); }
        pot.winners = winners;
      }
      const showdown = cont.length > 1;
      this.result = { showdown, pots, won, evals, board: this.board.slice() };
      for (const [p, g] of won) this.say(`${p.name} ${g} 획득${showdown ? ` · ${describe(evals.get(p))}` : ''}`, 'win');
      for (const p of this.players) if (!p.out && p.chips <= 0) { p.out = true; this.say(`${p.name} 탈락`, 'out'); }
      this.toAct = -1;
    }

    // ---------- computer decision ----------
    decide(i = this.toAct) {
      const p = this.players[i], per = p.persona || PERSONAS[2], o = this.options(i), D = this.diff, rnd = this.rnd;
      const opp = this.contenders().length - 1;
      const eq = Math.min(1, Math.max(0, equity(p.hole, this.board, opp, D.iters, rnd) + (rnd() - 0.5) * 2 * D.noise));
      const share = 1 / (opp + 1), rel = eq / share; // 1 = an even share of the pot
      const [, bb] = this.blinds;
      const pot = o.pot;
      const potOdds = o.toCall / (pot + o.toCall || 1);
      const tight = per.tight / D.skill;
      const strong = rel > 1.7 * tight || eq > 0.75, good = rel > 1.15 * tight || eq > 0.6;
      const sizeTo = (frac) => Math.max(o.minTo, Math.min(o.maxTo, this.curBet + Math.round((pot + o.toCall) * frac / bb) * bb));
      const r = rnd();
      // the stack is short next to the pot: shove or fold
      if (p.chips <= bb * 6 && (good || (o.toCall === 0 && r < per.aggr * 0.5))) return { type: 'raise', to: o.maxTo };
      if (o.canCheck) {
        if (strong && r < per.trap) return { type: 'check' };
        if ((strong || (good && r < per.aggr)) && o.canRaise) return { type: 'raise', to: sizeTo(strong ? 0.6 + rnd() * 0.5 : 0.5) };
        if (r < per.bluff * (this.street === 0 ? 0.5 : 1) && o.canRaise) return { type: 'raise', to: sizeTo(0.5 + rnd() * 0.3) };
        return { type: 'check' };
      }
      const pressure = o.toCall / Math.max(1, p.chips + p.bet);
      if (strong && o.canRaise && r < per.aggr + 0.2) return { type: 'raise', to: pressure > 0.4 ? o.maxTo : sizeTo(0.7 + rnd() * 0.6) };
      const margin = 0.04 * tight + pressure * 0.15;
      if (eq >= potOdds + margin || (good && pressure < 0.25)) {
        if (good && o.canRaise && r < per.aggr * 0.35) return { type: 'raise', to: sizeTo(0.6) };
        return { type: 'call' };
      }
      if (o.canRaise && r < per.bluff * 0.5 && pressure < 0.15 && this.street > 0) return { type: 'raise', to: sizeTo(0.8) };
      // cheap enough to peek
      if (o.toCall <= bb && r < 1 / tight * 0.6) return { type: 'call' };
      return { type: 'fold' };
    }
  }

  const API = { rankOf, suitOf, rankName, cardName, SUIT_CH, CAT_NAME, evaluate, describe, equity, mulberry, shuffled, PERSONAS, DIFF, BLIND_LEVELS, HANDS_PER_LEVEL, Table };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.POKER = API;
})(typeof window !== 'undefined' ? window : globalThis);
