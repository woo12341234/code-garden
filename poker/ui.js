// 포커 열전: table screen — seats, dealing, your turn, the computer turns, showdowns, saving and sound.
(function () {
  'use strict';
  const P = window.POKER, CARDS = window.CARDS;
  const $ = (id) => document.getElementById(id);
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const fmt = (n) => Math.round(n).toLocaleString('ko-KR');
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { /* storage unavailable */ } },
  };
  const SAVE = 'poker-yeoljeon-save', STATS = 'poker-yeoljeon-stats', PREFS = 'poker-yeoljeon-prefs', GATE = 'poker-yeoljeon-age';
  const prefs = Object.assign({ n: 3, diff: 'normal', chips: 1500, speed: 1, sound: true, hint: false, auto: false }, store.get(PREFS, {}));
  const stats = Object.assign({ games: 0, wins: 0, best: 0, hands: 0, won: 0, bigPot: 0, bestCat: -1 }, store.get(STATS, {}));
  const savePrefs = () => store.set(PREFS, prefs);

  // ---------- sound (synthesised, no files) ----------
  let ac = null;
  function audio() { if (!ac) { const A = window.AudioContext || window.webkitAudioContext; if (A) ac = new A(); } if (ac && ac.state === 'suspended') ac.resume(); return ac; }
  function tone(f, dur, type = 'triangle', vol = 0.12, delay = 0, f2) {
    if (!prefs.sound || !ac) return;
    const t = ac.currentTime + delay, o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(ac.destination); o.start(t); o.stop(t + dur + 0.02);
  }
  function noise(dur, vol = 0.1, freq = 2500, delay = 0) {
    if (!prefs.sound || !ac) return;
    const t = ac.currentTime + delay, b = ac.createBuffer(1, Math.ceil(ac.sampleRate * dur), ac.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
    s.buffer = b; f.type = 'bandpass'; f.frequency.value = freq; g.gain.value = vol;
    s.connect(f).connect(g).connect(ac.destination); s.start(t);
  }
  const SFX = {
    deal: (i = 0) => noise(0.05, 0.12, 3200, i * 0.07),
    chip: () => { tone(1800, 0.05, 'square', 0.04); tone(2400, 0.05, 'square', 0.03, 0.04); },
    check: () => { tone(160, 0.08, 'sine', 0.25); tone(150, 0.08, 'sine', 0.2, 0.1); },
    fold: () => noise(0.18, 0.08, 900),
    allin: () => { tone(220, 0.5, 'sawtooth', 0.08, 0, 660); noise(0.4, 0.06, 600); },
    turn: () => tone(880, 0.12, 'sine', 0.08),
    win: () => [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.25, 'triangle', 0.12, i * 0.09)),
    lose: () => { tone(330, 0.4, 'triangle', 0.1, 0, 180); },
    big: () => { [392, 523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, 0.3, 'triangle', 0.12, i * 0.08)); noise(0.6, 0.08, 6000, 0.3); },
  };
  const sfx = (k, ...a) => SFX[k](...a);

  // ---------- seat layout (percent of the table box), clockwise from bottom-left ----------
  const LAYOUT = {
    1: [[50, 9]],
    2: [[20, 17], [80, 17]],
    3: [[10, 44], [50, 8], [90, 44]],
    4: [[9, 54], [26, 10], [74, 10], [91, 54]],
    5: [[8, 62], [13, 19], [50, 6], [87, 19], [92, 62]],
  };
  // narrow portrait screens: pull the side seats in so plates stay on screen
  const LAYOUT_TALL = {
    1: [[50, 8]],
    2: [[24, 13], [76, 13]],
    3: [[16, 34], [50, 7], [84, 34]],
    4: [[16, 50], [24, 12], [76, 12], [84, 50]],
    5: [[15, 60], [15, 25], [50, 6], [85, 25], [85, 60]],
  };
  const ME_POS = [50, 90];
  const tall = () => innerWidth < 600 && innerHeight > innerWidth;

  let T = null, seatEls = [], shownBoard = 0, speed = prefs.speed, running = false, gameId = 0;
  const delay = (ms) => sleep(ms / speed);

  // ---------- rendering ----------
  const img = (src, cls = 'card') => { const i = new Image(); i.src = src; i.className = cls; i.draggable = false; return i; };
  function seatPos(i) { return i === 0 ? ME_POS : (tall() ? LAYOUT_TALL : LAYOUT)[T.players.length - 1][i - 1]; }
  addEventListener('resize', () => { if (T) { buildSeats(); render(); } });
  function buildSeats() {
    const box = $('seats'); box.innerHTML = ''; seatEls = [];
    T.players.forEach((p, i) => {
      const [x, y] = seatPos(i);
      const el = document.createElement('div'); el.className = 'seat'; el.style.left = x + '%'; el.style.top = y + '%';
      const col = p.human ? '#c88a2a' : p.persona.color;
      el.innerHTML = `${p.human ? '' : '<div class="scards"></div>'}<div class="plate"><div class="ava" style="--pc:${col}"><img src="${ART.portrait(p.human ? 'me' : p.persona.id)}" alt=""></div><div class="nm"><b>${p.human ? '나' : p.name}</b><span class="chips"></span></div></div><div class="bubble"></div>`;
      if (p.human) { el.style.top = '93%'; el.classList.add('me'); }
      box.appendChild(el);
      // the bet marker sits between the seat and the middle of the table
      const bet = document.createElement('div'); bet.className = 'bet';
      bet.style.left = (x + (50 - x) * 0.38) + '%'; bet.style.top = ((p.human ? 74 : y) + (47 - (p.human ? 74 : y)) * 0.38) + '%';
      box.appendChild(bet);
      seatEls.push({ el, bet, cards: el.querySelector('.scards'), chips: el.querySelector('.chips'), bubble: el.querySelector('.bubble'), shown: null });
    });
  }
  function bubbleClass(t) { return t === '폴드' ? 'fold' : t === '올인' ? 'allin' : /레이즈|벳/.test(t) ? 'raise' : ''; }
  function render() {
    const [sb, bb] = T.blinds;
    const left = P.HANDS_PER_LEVEL - ((T.handNo - 1) % P.HANDS_PER_LEVEL);
    $('level').textContent = innerWidth < 600 ? `${sb}/${bb} · ${T.handNo}판 · 인상 ${left}판 뒤` : `블라인드 ${sb}/${bb} · ${T.handNo}판째 · ${left}판 뒤 인상`;
    T.players.forEach((p, i) => {
      const s = seatEls[i];
      s.el.classList.toggle('out', p.out);
      s.el.classList.toggle('folded', p.folded && !p.out);
      s.el.classList.toggle('turn', T.toAct === i && T.street < 4);
      s.chips.textContent = p.out ? '탈락' : fmt(p.chips);
      s.bubble.textContent = p.last === 'SB' || p.last === 'BB' ? p.last : p.last;
      s.bubble.className = 'bubble ' + bubbleClass(p.last);
      const bv = p.bet > 0 && T.street < 4 ? p.bet : 0;
      if (s.betV !== bv) { s.betV = bv; const [u, , hh] = bv ? ART.stack(bv) : []; s.bet.innerHTML = bv ? `<img src="${u}" style="height:${Math.round(hh * 0.8)}px" alt=""><span>${fmt(bv)}</span>` : ''; }
      if (s.cards) {
        const show = T.street === 4 && T.result && T.result.showdown && !p.folded;
        const key = p.out ? 'out' : !p.hole.length ? 'none' : show ? 'face' + p.hole.join() : 'back' + T.handNo;
        if (s.shown !== key) {
          s.cards.innerHTML = '';
          if (!p.out && p.hole.length) for (const c of p.hole) s.cards.appendChild(img(show ? CARDS.face(c) : CARDS.back(), 'card ' + (show ? 'flip' : 'deal')));
          s.shown = key;
        }
      }
    });
    // dealer button next to the dealer's plate
    const [dx, dy] = seatPos(T.dealer);
    const db = $('dealerBtn'), dy0 = T.dealer === 0 ? 82 : dy; db.style.left = (dx + (50 - dx) * 0.3 + (T.dealer === 0 ? 9 : 0)) + '%'; db.style.top = (dy0 + (47 - dy0) * 0.3 + (T.dealer === 0 ? 0 : 5)) + '%';
    const potNow = T.pot();
    // the pot holds what earlier streets collected; this street's bets still sit in front of the players
    const inPot = T.street < 4 ? potNow - T.players.reduce((a, q) => a + q.bet, 0) : potNow;
    setPot(inPot, potNow);
    renderBoard();
    renderMine();
  }
  let potShown = -1;
  function setPot(inPot, total) {
    const key = inPot + '|' + total;
    if (potShown === key) return; potShown = key;
    const st = inPot ? ART.stack(inPot) : null;
    $('pot').innerHTML = total ? `${st ? `<img src="${st[0]}" style="height:${Math.round(st[2] * 0.95)}px" alt="">` : ''}<span>팟 ${fmt(total)}</span>` : '';
  }
  // chips that slide across the felt: seat → bet, bets → pot, pot → winner
  function centerOf(el) { const t = $('table').getBoundingClientRect(), r = el.getBoundingClientRect(); return [r.left - t.left + r.width / 2, r.top - t.top + r.height / 2]; }
  function flyChips(fromEl, toEl, n = 3, color = 4) {
    if (!fromEl || !toEl || speed > 2.5) return;
    const [x0, y0] = centerOf(fromEl), [x1, y1] = centerOf(toEl);
    for (let k = 0; k < n; k++) {
      const c = document.createElement('img'); c.src = ART.chip((color + k) % 6); c.className = 'fly';
      c.style.left = x0 + 'px'; c.style.top = y0 + 'px';
      $('table').appendChild(c);
      const jx = (Math.random() - 0.5) * 16, jy = (Math.random() - 0.5) * 10;
      c.animate([{ transform: 'translate(-50%,-50%) scale(.9)', opacity: 0.2 }, { transform: `translate(calc(-50% + ${x1 - x0 + jx}px), calc(-50% + ${y1 - y0 + jy}px)) scale(1)`, opacity: 1, offset: 0.85 }, { transform: `translate(calc(-50% + ${x1 - x0 + jx}px), calc(-50% + ${y1 - y0 + jy}px)) scale(.8)`, opacity: 0 }],
        { duration: 520 / Math.min(speed, 2) + k * 50, delay: k * 45, easing: 'cubic-bezier(.3,.7,.3,1)' }).onfinish = () => c.remove();
    }
  }
  function banner(text, sub = '', kind = '') {
    const b = $('banner');
    b.innerHTML = `<b>${text}</b>${sub ? `<small>${sub}</small>` : ''}`;
    b.className = 'show ' + kind; void b.offsetWidth; b.classList.add('go');
    clearTimeout(banner.t); banner.t = setTimeout(() => (b.className = ''), 1700 / Math.min(speed, 2));
  }
  function renderBoard() {
    const b = $('board');
    if (b.children.length !== 5) { b.innerHTML = ''; for (let i = 0; i < 5; i++) { const d = document.createElement('div'); d.className = 'slot'; b.appendChild(d); } }
    for (let i = 0; i < 5; i++) {
      const want = i < shownBoard ? T.board[i] : null, cur = b.children[i];
      if (want == null) { if (cur.tagName !== 'DIV') b.replaceChild(Object.assign(document.createElement('div'), { className: 'slot' }), cur); continue; }
      if (cur.dataset && cur.dataset.c === String(want)) continue;
      const im = img(CARDS.face(want), 'card flip'); im.dataset.c = want; b.replaceChild(im, cur);
    }
  }
  function renderMine() {
    const me = T.players[0], box = $('myCards');
    const key = me.out ? 'out' : me.hole.join() + '|' + T.handNo;
    if (box.dataset.key !== key) { box.innerHTML = ''; if (!me.out) me.hole.forEach((c) => box.appendChild(img(CARDS.face(c), 'card deal'))); box.dataset.key = key; }
    box.querySelectorAll('.card').forEach((c) => c.classList.toggle('dim', me.folded));
    const board = T.board.slice(0, shownBoard);
    $('myHand').textContent = me.out ? '탈락했어요' : me.folded ? '폴드' : me.hole.length ? (board.length ? P.describe(P.evaluate([...me.hole, ...board])) : preflopName(me.hole)) : '';
  }
  function preflopName(h) {
    const [a, b] = h.map(P.rankOf).sort((x, y) => y - x), suited = P.suitOf(h[0]) === P.suitOf(h[1]);
    return a === b ? `포켓 ${P.rankName(a)}` : `${P.rankName(a)}${P.rankName(b)} ${suited ? '같은 무늬' : '다른 무늬'}`;
  }
  // flips any board cards the engine dealt that the screen hasn't shown yet
  async function catchUpBoard() {
    while (shownBoard < T.board.length) {
      const target = shownBoard === 0 ? 3 : shownBoard + 1;
      await delay(shownBoard === 0 ? 350 : 550);
      for (let i = shownBoard; i < target; i++) sfx('deal', i - shownBoard);
      shownBoard = target; render();
      await delay(350);
    }
  }

  // ---------- your turn ----------
  let humanResolve = null, raiseTo = 0;
  function updateOdds() {
    const me = T.players[0];
    if (!prefs.hint || me.folded || me.out || T.street >= 4 || !me.hole.length) { $('myOdds').textContent = ''; return; }
    const opp = T.contenders().length - 1;
    const eq = P.equity(me.hole, T.board.slice(0, shownBoard), Math.max(1, opp), 700);
    let s = `승률 약 ${Math.round(eq * 100)}% (상대 ${opp}명)`;
    if (T.toAct === 0) { const o = T.options(0); if (o.toCall > 0) s += ` · 콜하려면 ${Math.round((o.toCall / (o.pot + o.toCall)) * 100)}% 필요`; }
    $('myOdds').textContent = s;
  }
  function humanTurn() {
    const o = T.options(0), [, bb] = T.blinds;
    $('callBtn').textContent = o.canCheck ? '체크' : o.toCall >= T.players[0].chips ? `올인 ${fmt(o.toCall)}` : `콜 ${fmt(o.toCall)}`;
    $('foldBtn').disabled = false; $('callBtn').disabled = false;
    $('raiseBtn').disabled = !o.canRaise;
    $('raiseBtn').textContent = T.curBet === 0 ? '벳' : '레이즈';
    const r = $('raiseRange'); r.min = o.minTo; r.max = o.maxTo; r.step = Math.max(1, bb / 2); setRaise(o.minTo);
    $('bar').className = '';
    sfx('turn');
    updateOdds();
    return new Promise((res) => { humanResolve = res; });
  }
  function setRaise(v) {
    const o = T.options(0);
    raiseTo = Math.max(o.minTo, Math.min(o.maxTo, Math.round(v)));
    $('raiseRange').value = raiseTo;
    $('raiseAmt').textContent = raiseTo >= o.maxTo ? `올인 ${fmt(raiseTo)}` : fmt(raiseTo);
    $('raiseOk').textContent = raiseTo >= o.maxTo ? '올인' : (T.curBet === 0 ? '벳 ' : '레이즈 ') + fmt(raiseTo);
  }
  function answer(a) { if (!humanResolve) return; const r = humanResolve; humanResolve = null; $('bar').className = 'waiting'; r(a); }
  $('foldBtn').onclick = () => answer({ type: 'fold' });
  $('callBtn').onclick = () => answer({ type: T.options(0).canCheck ? 'check' : 'call' });
  $('raiseBtn').onclick = () => { if (humanResolve) $('bar').className = 'raising'; };
  $('raiseCancel').onclick = () => { $('bar').className = ''; };
  $('raiseOk').onclick = () => answer({ type: 'raise', to: raiseTo });
  $('raiseRange').oninput = (e) => setRaise(+e.target.value);
  document.querySelectorAll('#raisePanel .quick button').forEach((b) => (b.onclick = () => {
    const o = T.options(0), potAfterCall = o.pot + o.toCall;
    const v = { min: o.minTo, half: T.curBet + potAfterCall * 0.5, '3q': T.curBet + potAfterCall * 0.75, pot: T.curBet + potAfterCall, all: o.maxTo }[b.dataset.q];
    setRaise(v);
  }));
  addEventListener('keydown', (e) => {
    if (!humanResolve || document.querySelector('.overlay.on')) return;
    if (e.key === 'f' || e.key === 'F') answer({ type: 'fold' });
    if (e.key === 'c' || e.key === 'C' || e.key === ' ') { e.preventDefault(); $('callBtn').click(); }
    if (e.key === 'r' || e.key === 'R') $('bar').className = $('bar').className === 'raising' ? '' : 'raising';
    if (e.key === 'Enter' && $('bar').className === 'raising') $('raiseOk').click();
  });

  // ---------- the game loop ----------
  function actSound(p) {
    const t = p.last;
    if (t === '폴드') sfx('fold'); else if (t === '체크') sfx('check'); else if (t === '올인') sfx('allin'); else sfx('chip');
  }
  async function playHand(myGame) {
    shownBoard = 0;
    $('bar').className = 'waiting';
    $('msg').textContent = '';
    seatEls.forEach((s) => s.el.classList.remove('winner'));
    render();
    for (let i = 0; i < T.live().length * 2; i++) sfx('deal', i);
    await delay(500);
    let street = 0;
    while (T.street < 4 && T.toAct >= 0) {
      if (myGame !== gameId) return false;
      const i = T.toAct, p = T.players[i];
      render();
      let a;
      if (p.human) a = await humanTurn();
      else { await delay(550 + Math.random() * 450); a = T.decide(i); }
      if (myGame !== gameId) return false;
      const betsBefore = T.players.map((q) => q.bet), chipsBefore = p.chips;
      T.act(a.type, a.to);
      actSound(p);
      if (p.chips < chipsBefore) flyChips(seatEls[i].el.querySelector('.plate'), seatEls[i].bet, p.last === '올인' ? 5 : 2, p.last === '올인' ? 0 : 4);
      if (p.last === '올인') banner('올인!', `${p.human ? '내가' : p.name + '이(가)'} 전부 걸었어요`, 'allin');
      if (T.street !== street) {
        // the street closed: every bet slides into the pot
        betsBefore.forEach((b, k) => { if (b > 0 || (k === i && p.chips < chipsBefore)) flyChips(seatEls[k].bet, $('pot'), 3, 2 + k); });
        await delay(320);
      }
      render();
      if (T.street !== street) { street = T.street; await catchUpBoard(); }
    }
    $('bar').className = 'waiting';
    await catchUpBoard();
    return true;
  }
  async function showResult() {
    const R = T.result, me = T.players[0];
    render();
    $('myOdds').textContent = '';
    const winners = [...R.won.keys()];
    for (const w of winners) seatEls[w.seat].el.classList.add('winner');
    // light up the winning five on the board and in hands
    if (R.showdown) {
      const best = new Set(winners.flatMap((w) => R.evals.get(w).best));
      document.querySelectorAll('#board .card').forEach((c) => c.classList.toggle('win', best.has(+c.dataset.c)));
      T.players.forEach((p, i) => { if (i && seatEls[i].cards) [...seatEls[i].cards.children].forEach((c, k) => c.classList.toggle('win', winners.includes(p) && best.has(p.hole[k]))); });
      [...$('myCards').children].forEach((c, k) => c.classList.toggle('win', winners.includes(me) && best.has(me.hole[k])));
    }
    const total = [...R.won.values()].reduce((a, b) => a + b, 0);
    const names = winners.map((w) => (w.human ? '나' : w.name)).join('·');
    const how = R.showdown ? ' · ' + winners.map((w) => P.describe(R.evals.get(w))).filter((v, i, a) => a.indexOf(v) === i).join(' / ') : ' · 모두 폴드';
    $('msg').textContent = `${names} 승리${how} · +${fmt(total)}`;
    for (const w of winners) flyChips($('pot'), seatEls[w.seat].el.querySelector('.plate'), 6, 0);
    const topCat = R.showdown ? Math.max(...winners.map((w) => R.evals.get(w).cat)) : -1;
    if (topCat >= 4) banner(P.CAT_NAME[topCat] + '!', `${names} 승리`, topCat >= 7 ? 'legend' : 'strong');
    else if (R.won.has(me)) banner('승리!', `+${fmt(R.won.get(me))}`, 'win');
    await delay(450);
    setPot(0, 0);
    // stats
    stats.hands++;
    if (R.won.has(me)) {
      stats.won++;
      stats.bigPot = Math.max(stats.bigPot, R.won.get(me));
      if (R.showdown) stats.bestCat = Math.max(stats.bestCat, R.evals.get(me).cat);
      (R.showdown && R.evals.get(me).cat >= 6) || R.won.get(me) >= T.blinds[1] * 30 ? sfx('big') : sfx('win');
    } else if (!me.folded && R.showdown) sfx('lose');
    store.set(STATS, stats);
  }
  function saveGame() {
    if (!T) return;
    store.set(SAVE, { v: 1, diff: T.diffName, dealer: T.dealer, handNo: T.handNo, start: T.startChips, players: T.players.map((p) => ({ name: p.name, human: p.human, chips: p.chips, out: p.out, persona: p.persona && p.persona.id })) });
  }
  function waitNext() {
    return new Promise((res) => {
      $('bar').className = 'between';
      let t = null;
      const go = () => { clearTimeout(t); $('nextBtn').onclick = null; res(); };
      $('nextBtn').onclick = go;
      if (prefs.auto) t = setTimeout(go, 2600 / speed);
    });
  }
  async function loop(myGame) {
    running = true;
    while (myGame === gameId) {
      const live = T.live();
      if (T.players[0].out || live.length < 2) return endGame();
      if (!T.startHand()) return endGame();
      saveGame();
      const done = await playHand(myGame);
      if (!done) return;
      await showResult();
      saveGame();
      if (T.players[0].out || T.live().length < 2) { await delay(1200); return endGame(); }
      await waitNext();
    }
  }
  function endGame() {
    running = false;
    store.del(SAVE);
    const me = T.players[0];
    const alive = T.live().length;
    const place = me.out ? T.players.filter((p) => !p.out).length + T.players.filter((p) => p.out && p.bustAt > me.bustAt).length + 1 : 1;
    const win = !me.out && alive === 1;
    stats.games++; if (win) stats.wins++;
    stats.best = stats.best ? Math.min(stats.best, place) : place;
    store.set(STATS, stats);
    $('overTitle').textContent = win ? '우승!' : `${place}위`;
    $('overTxt').innerHTML = win
      ? `${T.players.length - 1}명을 모두 쓰러뜨렸어요<br>${T.handNo}판 · 칩 ${fmt(me.chips)}`
      : `칩이 바닥났어요 · ${T.handNo}판 버팀<br>상대 ${T.players.length - 1}명 중 ${place - 1}명이 남았어요`;
    $('over').classList.add('on');
    win ? sfx('big') : sfx('lose');
  }

  // ---------- starting a game ----------
  function makeTable(cfg) {
    const t = new P.Table(cfg);
    t.diffName = cfg.difficulty; t.startChips = cfg.startChips;
    // remember when each player busted so the final placing is right
    const finish = t.finish.bind(t);
    t.finish = function () { const before = new Set(this.players.filter((p) => p.out)); finish(); for (const p of this.players) if (p.out && !before.has(p)) p.bustAt = this.handNo * 100 + (p.seat || 0); };
    return t;
  }
  function begin(cfg, setup) {
    gameId++;
    T = makeTable(cfg);
    if (setup) setup(T);
    buildSeats();
    shownBoard = 0;
    $('start').classList.remove('on'); $('over').classList.remove('on');
    audio();
    loop(gameId);
  }
  function newGame() {
    const pool = P.PERSONAS.slice().sort(() => Math.random() - 0.5).slice(0, prefs.n);
    begin({ difficulty: prefs.diff, startChips: prefs.chips, players: [{ name: '나', human: true, chips: prefs.chips }, ...pool.map((p) => ({ name: p.name, persona: p, chips: prefs.chips }))] });
  }
  function resume() {
    const s = store.get(SAVE, null);
    if (!s) return;
    const byId = Object.fromEntries(P.PERSONAS.map((p) => [p.id, p]));
    begin({ difficulty: s.diff, startChips: s.start, dealer: s.dealer, players: s.players.map((p) => ({ name: p.name, human: p.human, chips: p.chips, persona: byId[p.persona] })) }, (t) => {
      t.handNo = s.handNo;
      s.players.forEach((p, i) => { t.players[i].out = p.out; });
    });
  }

  // ---------- menus ----------
  function seg(id, items, key, after) {
    const el = $(id); el.innerHTML = '';
    for (const [v, label] of items) {
      const b = document.createElement('button'); b.textContent = label; b.classList.toggle('sel', prefs[key] === v);
      b.onclick = () => { prefs[key] = v; savePrefs(); seg(id, items, key, after); after && after(); };
      el.appendChild(b);
    }
  }
  // title backdrop: a few cards and chips scattered on the felt
  function decor() {
    const d = $('decor'); if (d.childElementCount) return;
    const picks = [[51, 12, -22, 8], [38, 86, 14, 9], [25, 6, 36, 74], [12, 90, -12, 78], [50, 20, 8, 22]];
    for (const [c, x, rot, y] of picks) { const i = img(CARDS.face(c), 'dcard'); i.style.left = x + '%'; i.style.top = y + '%'; i.style.setProperty('--r', rot + 'deg'); d.appendChild(i); }
    for (const [k, x, y] of [[0, 18, 30], [2, 82, 34], [4, 14, 60], [1, 88, 66], [3, 76, 88]]) { const i = img(ART.chip(k), 'dchip'); i.style.left = x + '%'; i.style.top = y + '%'; d.appendChild(i); }
  }
  document.documentElement.style.setProperty('--felt', `url(${ART.felt()})`);
  function startScreen() {
    decor();
    seg('optN', [[1, '1명'], [2, '2명'], [3, '3명'], [4, '4명'], [5, '5명']], 'n', who);
    seg('optD', [['easy', '쉬움'], ['normal', '보통'], ['hard', '어려움']], 'diff');
    seg('optC', [[1000, '1,000'], [1500, '1,500'], [3000, '3,000']], 'chips');
    $('resumeBtn').disabled = !store.get(SAVE, null);
    who();
    $('start').classList.add('on');
  }
  function who() { $('who').textContent = `상대 후보: ${P.PERSONAS.map((p) => `${p.name}(${p.tag})`).join(' · ')} 중 ${prefs.n}명이 무작위로 앉아요`; }
  $('newBtn').onclick = () => { audio(); newGame(); };
  $('resumeBtn').onclick = () => { audio(); resume(); };
  $('againBtn').onclick = () => { audio(); newGame(); };
  $('homeBtn').onclick = () => { $('over').classList.remove('on'); startScreen(); };
  document.querySelectorAll('[data-close]').forEach((b) => (b.onclick = () => b.closest('.overlay').classList.remove('on')));
  $('logBtn').onclick = () => {
    const list = $('logList'); list.innerHTML = '';
    for (const l of T ? T.log.slice(-120) : []) { const d = document.createElement('div'); d.className = l.kind; d.textContent = l.text; list.appendChild(d); }
    $('logPanel').classList.add('on'); list.scrollTop = list.scrollHeight;
  };
  const SPEEDS = [[1, '보통'], [1.8, '빠름'], [3, '매우 빠름']];
  function syncHud() {
    $('speedBtn').textContent = SPEEDS.find((s) => s[0] === speed)[1];
    $('soundBtn').textContent = prefs.sound ? '소리' : '무음'; $('soundBtn').classList.toggle('on', prefs.sound);
    $('hintBtn').classList.toggle('on', prefs.hint);
    $('autoBtn').textContent = `다음 판 자동: ${prefs.auto ? '켬' : '끔'}`;
  }
  $('speedBtn').onclick = () => { const i = SPEEDS.findIndex((s) => s[0] === speed); speed = SPEEDS[(i + 1) % SPEEDS.length][0]; prefs.speed = speed; savePrefs(); syncHud(); };
  $('soundBtn').onclick = () => { prefs.sound = !prefs.sound; savePrefs(); audio(); syncHud(); };
  $('hintBtn').onclick = () => { prefs.hint = !prefs.hint; savePrefs(); syncHud(); if (T) updateOdds(); };
  $('menuBtn').onclick = () => $('menuPanel').classList.add('on');
  $('autoBtn').onclick = () => { prefs.auto = !prefs.auto; savePrefs(); syncHud(); };
  $('quitBtn').onclick = () => { gameId++; running = false; humanResolve = null; $('menuPanel').classList.remove('on'); startScreen(); };
  $('statsBtn').onclick = () => info(`<h2>전적</h2><table>
    <tr><td>토너먼트</td><td>${stats.games}번 · 우승 ${stats.wins}번${stats.best ? ` · 최고 ${stats.best}위` : ''}</td></tr>
    <tr><td>판</td><td>${fmt(stats.hands)}판 중 ${fmt(stats.won)}판 승리${stats.hands ? ` (${Math.round((stats.won / stats.hands) * 100)}%)` : ''}</td></tr>
    <tr><td>가장 큰 팟</td><td>${fmt(stats.bigPot)}</td></tr>
    <tr><td>최고 족보</td><td>${stats.bestCat >= 0 ? P.CAT_NAME[stats.bestCat] : '-'}</td></tr></table>`);
  $('rulesBtn').onclick = () => info(`<h2>족보 (높은 순)</h2><table>
    <tr><td>로열 플러시</td><td>같은 무늬 10·J·Q·K·A</td></tr><tr><td>스트레이트 플러시</td><td>같은 무늬로 연속된 다섯 장</td></tr>
    <tr><td>포카드</td><td>같은 숫자 네 장</td></tr><tr><td>풀하우스</td><td>같은 숫자 세 장 + 두 장</td></tr>
    <tr><td>플러시</td><td>같은 무늬 다섯 장</td></tr><tr><td>스트레이트</td><td>연속된 숫자 다섯 장 (A-2-3-4-5도 됨)</td></tr>
    <tr><td>트리플</td><td>같은 숫자 세 장</td></tr><tr><td>투페어</td><td>같은 숫자 두 장씩 두 쌍</td></tr>
    <tr><td>원페어</td><td>같은 숫자 두 장</td></tr><tr><td>하이카드</td><td>아무것도 없을 때 가장 높은 카드</td></tr></table>
    <h3>진행</h3><p>각자 2장을 받고, 바닥에 5장이 차례로 깔려요(플롭 3장 → 턴 1장 → 리버 1장). 내 2장과 바닥 5장 중 가장 좋은 5장으로 겨뤄요. 매 단계마다 체크·벳·콜·레이즈·폴드를 고르고, 끝까지 남은 사람끼리 패를 까서 이긴 사람이 팟을 가져가요.</p>
    <h3>토너먼트</h3><p>모두 같은 칩으로 시작하고, ${P.HANDS_PER_LEVEL}판마다 블라인드가 올라요. 칩을 다 잃으면 탈락, 마지막까지 남으면 우승이에요.</p>
    <h3>단축키</h3><p>C·Space 체크/콜 · R 레이즈 창 · Enter 레이즈 확정 · F 폴드</p>`);
  $('aboutBtn').onclick = () => gate(true);
  function info(html) { $('infoBody').innerHTML = html; $('infoPanel').classList.add('on'); }

  // ---------- first-launch notice (adults only: poker is a gambling game) ----------
  function gate(force) {
    if (!force && store.get(GATE, false)) return;
    $('gateBody').innerHTML = `<ul>
      <li>가상의 칩으로 컴퓨터와 하는 <b>1인용 포커</b>예요. 다른 사람과 붙지 않아요.</li>
      <li><b>실제 돈·결제·광고·환전이 없어요.</b> 칩은 아무 가치가 없고 사거나 팔 수 없어요.</li>
      <li>개인정보를 모으거나 외부로 보내지 않아요. 기록은 이 브라우저에만 저장돼요.</li>
      <li>포커는 도박을 소재로 한 게임이라 <span class="age">만 19세 이상</span>만 이용해 주세요.</li>
      <li>카드 그림과 프로그램은 이 게임을 위해 직접 만든 거예요. 글꼴은 Noto Sans KR과 GH Brush(나눔손글씨 붓의 일부 글자 사본)로 SIL Open Font License 1.1을 따라요.</li></ul>
      <p class="kid hidden" id="kidMsg">만 19세가 되면 다시 와 주세요. 이 게임은 성인용이에요.</p>
      <div class="row" id="gateBtns"><button class="big" id="gateOk">만 19세 이상이에요</button><button class="ghost" id="gateNo">아니에요</button></div>`;
    $('gate').classList.add('on');
    $('gateOk').onclick = () => { store.set(GATE, true); $('gate').classList.remove('on'); };
    $('gateNo').onclick = () => { store.del(GATE); $('kidMsg').classList.remove('hidden'); $('gateBtns').classList.add('hidden'); };
  }

  // debug hooks for automated tests
  window.__poker = { get T() { return T; }, answer, newGame, get waiting() { return !!humanResolve; }, setSpeed: (s) => (speed = s) };

  syncHud();
  startScreen();
  gate(false);
})();
