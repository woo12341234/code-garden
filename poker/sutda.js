// 포커 열전 · 섯다: two-card 화투 game — rules, betting and computer players (no DOM).
// Cards 0..19: month = floor(id / 2) + 1. id 0 1광 · 4 3광 · 14 8광 · 6 4월 열끗 · 12 7월 열끗 · 16 9월 열끗.
(function (root) {
  'use strict';
  const month = (c) => Math.floor(c / 2) + 1;
  const MID = { 1: '삥', 10: '장' };

  // ---------- hands ----------
  // val orders hands; kind marks the ones with tricks (땡잡이 · 암행어사 · 구사 · 멍텅구리구사)
  function hand(a, b) {
    const ids = [a, b].sort((x, y) => x - y), has = (x, y) => ids[0] === x && ids[1] === y;
    if (has(4, 14)) return { val: 1000, name: '38광땡', tier: 'god' };
    if (has(0, 14)) return { val: 902, name: '18광땡', tier: 'gwang' };
    if (has(0, 4)) return { val: 901, name: '13광땡', tier: 'gwang' };
    const [m1, m2] = [month(a), month(b)].sort((x, y) => x - y);
    if (m1 === m2) return { val: 800 + m1, name: m1 === 10 ? '장땡' : `${MID[m1] || m1}땡`, tier: 'ddaeng' };
    if (has(4, 12)) return { val: 600, name: '땡잡이', kind: 'catcher', tier: 'trick' };
    if (has(6, 12)) return { val: 601, name: '암행어사', kind: 'inspector', tier: 'trick' };
    if (has(6, 16)) return { val: 603, name: '멍텅구리구사', kind: 'meongusa', tier: 'trick' };
    if (m1 === 4 && m2 === 9) return { val: 603, name: '구사', kind: 'gusa', tier: 'trick' };
    const MADE = { '1-2': [706, '알리'], '1-4': [705, '독사'], '1-9': [704, '구삥'], '1-10': [703, '장삥'], '4-10': [702, '장사'], '4-6': [701, '세륙'] };
    const mk = MADE[`${m1}-${m2}`];
    if (mk) return { val: mk[0], name: mk[1], tier: 'made' };
    const k = (m1 + m2) % 10;
    return { val: 600 + k, name: k === 9 ? '갑오' : k === 0 ? '망통' : `${k}끗`, tier: 'kkut' };
  }
  // who wins among the hands still in: tricks first, then a possible 구사 replay
  function resolve(entries) {
    const eff = entries.map((e) => e.h.val);
    const bestOther = (i) => Math.max(-1, ...entries.map((e, j) => (j === i ? -1 : e.h.val)));
    entries.forEach((e, i) => {
      const top = bestOther(i);
      if (e.h.kind === 'catcher' && top >= 801 && top <= 809) eff[i] = 809.5; // 땡잡이 catches 1~9땡
      if (e.h.kind === 'inspector' && (top === 901 || top === 902)) eff[i] = 950; // 암행어사 catches 13·18광땡
    });
    const effBestOther = (i) => Math.max(-1, ...eff.map((v, j) => (j === i ? -1 : v)));
    for (let i = 0; i < entries.length; i++) {
      const k = entries[i].h.kind;
      if ((k === 'gusa' && effBestOther(i) <= 706) || (k === 'meongusa' && effBestOther(i) <= 809)) return { replay: true, by: entries[i], eff };
    }
    const best = Math.max(...eff);
    return { replay: false, winners: entries.filter((_, i) => eff[i] === best), eff };
  }

  function mulberry(seed) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  // ---------- players ----------
  // cheat: a card sharp who now and then deals himself from the bottom of the deck
  const PERSONAS = [
    { id: 'rock', name: '김철벽', color: '#5a7a9a', tight: 1.35, aggr: 0.3, bluff: 0.04, lines: ['…', '천천히 하시죠', '난 급할 거 없어요'] },
    { id: 'fire', name: '박불꽃', color: '#d8542a', tight: 0.8, aggr: 0.75, bluff: 0.2, lines: ['하프 간다!', '겁나면 접어', '오늘 다 털어간다'] },
    { id: 'calc', name: '이계산', color: '#3a9a6a', tight: 1.1, aggr: 0.5, bluff: 0.08, lines: ['확률은 내 편이에요', '계산 끝났습니다', '흠…'] },
    { id: 'fish', name: '최낚시', color: '#8a6ac8', tight: 0.8, aggr: 0.25, bluff: 0.05, lines: ['따라는 가볼게요', '허허, 재밌네', '물었다…?'] },
    { id: 'wild', name: '정도박', color: '#c8a03a', tight: 0.6, aggr: 0.85, bluff: 0.3, lines: ['인생 한 방이지!', '죽어도 고!', '판 키워봐'] },
    { id: 'old', name: '노영감', color: '#9a8a6a', tight: 1.2, aggr: 0.2, bluff: 0.12, lines: ['젊은이, 서두르지 말게', '허허허', '이 나이 먹고 질 순 없지'] },
    { id: 'sharp', name: '검은손 백사', color: '#3a2a3a', tight: 0.9, aggr: 0.6, bluff: 0.15, cheat: 0.45, lines: ['패는 손이 고르는 거요', '눈 크게 뜨고 보슈', '운 같은 건 안 믿어'] },
  ];
  const DIFF = { easy: { iters: 120, noise: 0.12, skill: 0.75 }, normal: { iters: 260, noise: 0.06, skill: 1 }, hard: { iters: 500, noise: 0.02, skill: 1.15 } };
  const MAX_RAISES = 3;

  class SutdaTable {
    constructor(opts) {
      this.rnd = mulberry(opts.seed ?? Math.random() * 2 ** 32);
      this.diff = DIFF[opts.difficulty || 'normal'];
      this.unit = opts.unit;
      this.players = opts.players.map((p, i) => ({ seat: i, name: p.name, human: !!p.human, persona: p.persona || null, chips: p.chips, cards: [], folded: false, allIn: false, bet: 0, total: 0, acted: false, last: '' }));
      this.dealer = Math.floor(this.rnd() * this.players.length);
      this.handNo = 0; this.log = [];
    }
    say(text, kind = '') { this.log.push({ text, kind, hand: this.handNo }); if (this.log.length > 200) this.log.shift(); }
    contenders() { return this.players.filter((p) => !p.folded); }
    pot() { return this.players.reduce((s, p) => s + p.total, 0); }
    next(i, pred) { const n = this.players.length; for (let k = 1; k <= n; k++) { const j = (i + k) % n; if (pred(this.players[j])) return j; } return -1; }
    shuffle() { const d = Array.from({ length: 20 }, (_, i) => i); for (let i = 19; i > 0; i--) { const j = Math.floor(this.rnd() * (i + 1)); [d[i], d[j]] = [d[j], d[i]]; } this.deck = d; }

    startHand() {
      this.handNo++; this.result = null; this.replays = 0;
      this.dealer = this.next(this.dealer, () => true);
      for (const p of this.players) Object.assign(p, { cards: [], folded: false, allIn: false, bet: 0, total: 0, acted: false, last: '' });
      for (const p of this.players) { const a = Math.min(this.unit, p.chips); p.chips -= a; p.total += a; if (!p.chips) p.allIn = true; }
      this.say(`${this.handNo}번째 판 · 학교 ${this.unit}`, 'hand');
      this.deal();
    }
    // first card, then a betting round; the second card comes after
    deal() {
      this.shuffle(); this.cheated = -1; this.bottomDeal = -1; this.accused = false;
      for (const p of this.contenders()) p.cards = [this.deck.pop()];
      this.round = 1; this.phase = 'bet';
      this.openRound();
    }
    openRound() {
      for (const p of this.players) { p.bet = 0; p.acted = false; if (!p.folded && !p.allIn) p.last = ''; }
      this.curBet = 0; this.raises = 0;
      this.toAct = this.next(this.dealer, (p) => !p.folded && !p.allIn);
      if (this.contenders().filter((p) => !p.allIn).length <= 1) { this.toAct = -1; this.endRound(); }
    }
    secondCard() {
      for (const p of this.contenders()) {
        let c = this.deck.pop();
        const per = p.persona;
        // the sharp: if the bottom card makes a better hand, slide it out instead (a quick hand, but a tell)
        if (per && per.cheat && this.rnd() < per.cheat) {
          const bottom = this.deck[0];
          if (hand(p.cards[0], bottom).val > hand(p.cards[0], c).val + 1) { this.deck[0] = c; c = bottom; this.cheated = p.seat; this.bottomDeal = p.seat; }
        }
        p.cards.push(c);
      }
      this.round = 2;
      this.openRound();
    }
    options(i = this.toAct) {
      const p = this.players[i], pot = this.pot();
      const toCall = Math.min(this.curBet - p.bet, p.chips), maxTo = p.bet + p.chips;
      const canRaise = this.raises < MAX_RAISES && maxTo > this.curBet;
      const after = pot + toCall, step = Math.max(1, Math.round(this.unit / 10));
      const r = (v) => Math.min(maxTo, Math.ceil(v / step) * step);
      const o = { toCall, canCheck: toCall === 0, pot, acts: {} };
      if (this.curBet === 0) { o.acts.check = 0; if (canRaise) { o.acts.ping = r(this.unit); o.acts.quarter = r(Math.max(this.unit, after / 4)); o.acts.half = r(Math.max(this.unit, after / 2)); } }
      else { o.acts.call = toCall; if (canRaise) { o.acts.ddadang = r(this.curBet * 2); o.acts.quarter = r(this.curBet + after / 4); o.acts.half = r(this.curBet + after / 2); } }
      o.acts.die = 0;
      return o;
    }
    act(type) {
      const i = this.toAct, p = this.players[i], o = this.options(i);
      if (!(type in o.acts)) type = o.canCheck ? 'check' : 'call';
      const NAMES = { ping: '삥', ddadang: '따당', quarter: '쿼터', half: '하프' };
      if (type === 'die') { p.folded = true; p.last = '다이'; this.say(`${p.name}: 다이`, 'fold'); }
      else if (type === 'check') { p.last = '체크'; this.say(`${p.name}: 체크`, 'check'); }
      else if (type === 'call') { const a = o.toCall; p.chips -= a; p.bet += a; p.total += a; if (!p.chips) p.allIn = true; p.last = p.allIn ? '올인' : '콜'; this.say(`${p.name}: ${p.last} ${a}`, 'call'); }
      else {
        const to = o.acts[type], add = to - p.bet;
        p.chips -= add; p.bet = to; p.total += add; if (!p.chips) p.allIn = true;
        if (to > this.curBet) { this.raises++; for (const q of this.players) if (q !== p) q.acted = false; }
        this.curBet = Math.max(this.curBet, to);
        p.last = p.allIn ? '올인' : NAMES[type]; this.say(`${p.name}: ${p.last} (${to})`, 'raise');
      }
      p.acted = true;
      if (this.contenders().length === 1) return this.finish();
      const need = (q) => !q.folded && !q.allIn && (!q.acted || q.bet < this.curBet);
      if (this.players.some(need)) { this.toAct = this.next(i, need); return; }
      this.endRound();
    }
    endRound() {
      if (this.contenders().length === 1) return this.finish();
      if (this.round === 1) { this.secondCard(); return; }
      this.showdown();
    }
    showdown() {
      const cont = this.contenders();
      const res = resolve(cont.map((p) => ({ p, h: hand(p.cards[0], p.cards[1]) })));
      if (res.replay && this.replays < 3) {
        // 구사: the pot stays and everybody still in plays again
        this.replays++;
        this.say(`${res.by.p.name}의 ${res.by.h.name}! 재경기`, 'replay');
        this.lastReplay = { by: res.by.p, name: res.by.h.name, shown: cont.map((p) => ({ p, cards: p.cards.slice(), h: hand(p.cards[0], p.cards[1]) })) };
        this.deal();
        return;
      }
      this.finish(res.replay ? null : res);
    }
    // the pot (layered by all-ins) goes to the best hand that put in enough
    finish(res) {
      this.phase = 'done'; this.toAct = -1;
      const cont = this.contenders();
      const showdown = cont.length > 1;
      const hands = new Map(cont.map((p) => [p, p.cards.length === 2 ? hand(p.cards[0], p.cards[1]) : null]));
      if (showdown && !res) res = resolve(cont.map((p) => ({ p, h: hands.get(p) })));
      const effOf = new Map(showdown ? cont.map((p, i) => [p, res.eff[i]]) : cont.map((p) => [p, 1]));
      const levels = [...new Set(this.players.filter((p) => p.total > 0).map((p) => p.total))].sort((a, b) => a - b);
      const won = new Map(); let prev = 0, carry = 0;
      for (const lv of levels) {
        let amt = carry; carry = 0;
        for (const p of this.players) amt += Math.max(0, Math.min(p.total, lv) - prev);
        prev = lv;
        const elig = cont.filter((p) => p.total >= lv);
        if (!elig.length) { carry = amt; continue; }
        const best = Math.max(...elig.map((p) => effOf.get(p)));
        const ws = elig.filter((p) => effOf.get(p) === best), share = Math.floor(amt / ws.length);
        let rest = amt - share * ws.length;
        for (const w of ws) { const g = share + (rest-- > 0 ? 1 : 0); w.chips += g; won.set(w, (won.get(w) || 0) + g); }
      }
      if (carry) { const w = [...won.keys()][0] || cont[0]; w.chips += carry; won.set(w, (won.get(w) || 0) + carry); }
      this.result = { showdown, won, hands, eff: effOf };
      for (const [p, g] of won) this.say(`${p.name} ${g} 획득${showdown ? ` · ${hands.get(p).name}` : ''}`, 'win');
    }
    // 밑장 잡기: call out a player you think dealt from the bottom (once a hand, after the second card)
    accuse(by, target) {
      if (this.accused || this.round !== 2 || this.phase !== 'bet') return null;
      this.accused = true;
      const A = this.players[by], B = this.players[target], pen = this.unit * 10;
      if (this.cheated === target) {
        // caught: the cheat loses the hand, the pot goes to the accuser, and he pays a fine on top
        const fine = Math.min(B.chips, pen);
        B.chips -= fine; A.chips += fine;
        const pot = this.pot();
        for (const p of this.players) if (p !== A) p.folded = true;
        this.phase = 'done'; this.toAct = -1;
        A.chips += pot;
        this.result = { showdown: false, won: new Map([[A, pot]]), hands: new Map(), eff: new Map(), caught: { by: A, cheat: B, fine } };
        this.say(`${A.name}이(가) ${B.name}의 밑장을 잡았다! 벌금 ${fine}`, 'win');
        return { caught: true, fine, pot };
      }
      const fine = Math.min(A.chips, Math.round(pen / 2));
      A.chips -= fine; B.chips += fine;
      this.say(`${A.name}의 헛짚음 · ${B.name}에게 ${fine} 물어줌`, 'out');
      return { caught: false, fine };
    }

    // ---------- computer decision ----------
    equityFor(p, iters) {
      const pool = []; for (let c = 0; c < 20; c++) if (!p.cards.includes(c)) pool.push(c);
      const opps = this.contenders().filter((q) => q !== p);
      let win = 0;
      for (let it = 0; it < iters; it++) {
        let k = 0;
        const take = () => { const j = k + Math.floor(this.rnd() * (pool.length - k)); const t = pool[k]; pool[k] = pool[j]; pool[j] = t; return pool[k++]; };
        const mine = p.cards.length === 2 ? p.cards : [p.cards[0], take()];
        const entries = [{ p, h: hand(mine[0], mine[1]) }, ...opps.map((q) => ({ p: q, h: hand(take(), take()) }))];
        const r = resolve(entries);
        if (r.replay) win += 0.5;
        else if (r.winners.some((e) => e.p === p)) win += 1 / r.winners.length;
      }
      return win / iters;
    }
    decide(i = this.toAct) {
      const p = this.players[i], per = p.persona || PERSONAS[2], o = this.options(i), D = this.diff, rnd = this.rnd;
      const opp = this.contenders().length - 1;
      const eq = Math.min(1, Math.max(0, this.equityFor(p, D.iters) + (rnd() - 0.5) * 2 * D.noise));
      const rel = eq * (opp + 1), tight = per.tight / D.skill;
      const strong = rel > 1.8 * tight || eq > 0.75, good = rel > 1.2 * tight || eq > 0.55;
      const potOdds = o.toCall / (o.pot + o.toCall || 1), has = (k) => k in o.acts, r = rnd();
      if (o.canCheck) {
        if (strong && has('half')) return r < 0.7 ? 'half' : 'quarter';
        if (good && r < per.aggr && has('ping')) return 'ping';
        if (r < per.bluff && has('half')) return 'half';
        return 'check';
      }
      const pressure = o.toCall / Math.max(1, p.chips + p.bet);
      if (strong && r < per.aggr + 0.15) return has('half') && r < 0.75 ? 'half' : has('ddadang') ? 'ddadang' : 'call';
      if (eq >= potOdds + 0.04 * tight + pressure * 0.12 || (good && pressure < 0.2)) return good && r < per.aggr * 0.3 && has('ddadang') ? 'ddadang' : 'call';
      if (r < per.bluff * 0.5 && pressure < 0.12 && has('half')) return 'half';
      if (pressure < 0.03 && r < 0.5 / tight) return 'call';
      return 'die';
    }
  }

  const API = { month, hand, resolve, PERSONAS, DIFF, SutdaTable };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.SUTDA = API;
})(typeof window !== 'undefined' ? window : globalThis);
