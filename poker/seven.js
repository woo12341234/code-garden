// 포커 열전 · 세븐포커: lobby channels, the table, choosing cards, the 삥·따당·하프 bar, voice calls, money and saving.
(function () {
  'use strict';
  const S = window.STUD, CARDS = window.CARDS, ART = window.ART;
  const $ = (id) => document.getElementById(id);
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { /* storage unavailable */ } },
  };
  const K = { money: 'seven-money', stats: 'seven-stats', prefs: 'seven-prefs', gate: 'poker-yeoljeon-age', jp: 'seven-jackpot' };
  const START_MONEY = 10000000, AID = 5000000;
  const prefs = Object.assign({ n: 4, diff: 'normal', speed: 1, sound: true, voice: true, hint: false, game: 'seven' }, store.get(K.prefs, {}));
  const stats = Object.assign({ hands: 0, won: 0, bigPot: 0, bestCat: -1, peak: START_MONEY, aid: 0 }, store.get(K.stats, {}));
  let money = store.get(K.money, START_MONEY);
  let jackpot = store.get(K.jp, 1234500000);
  const savePrefs = () => store.set(K.prefs, prefs);
  const saveMoney = () => { store.set(K.money, money); store.set(K.jp, Math.round(jackpot)); stats.peak = Math.max(stats.peak, money); store.set(K.stats, stats); };

  // ---------- 억·만 money ----------
  function won(n) {
    n = Math.round(n);
    if (n < 10000) return n.toLocaleString('ko-KR');
    const units = [[1e12, '조'], [1e8, '억'], [1e4, '만']];
    const parts = [];
    let rest = n;
    for (const [v, u] of units) { const q = Math.floor(rest / v); if (q) { parts.push(q.toLocaleString('ko-KR') + u); rest -= q * v; } if (parts.length === 2) break; }
    return parts.join(' ');
  }

  // ---------- channels ----------
  const CHANNELS = [
    { id: 'free', name: '자유 채널', unit: 1000, min: 0, color: '#6ad0ff' },
    { id: 'rookie', name: '초보 채널', unit: 10000, min: 1000000, color: '#7af0a0' },
    { id: 'mid', name: '중수 채널', unit: 100000, min: 10000000, color: '#f2d06a' },
    { id: 'pro', name: '고수 채널', unit: 1000000, min: 100000000, color: '#ff9a5a' },
    { id: 'whale', name: '큰손 채널', unit: 10000000, min: 1000000000, color: '#ff5a8a' },
    { id: 'legend', name: '전설 채널', unit: 100000000, min: 10000000000, color: '#c88aff' },
  ];

  // ---------- sound & voice ----------
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
    deal: (i = 0) => noise(0.05, 0.12, 3200, i * 0.05),
    chip: () => { tone(1800, 0.05, 'square', 0.04); tone(2400, 0.05, 'square', 0.03, 0.04); tone(2100, 0.05, 'square', 0.03, 0.08); },
    check: () => { tone(160, 0.08, 'sine', 0.25); tone(150, 0.08, 'sine', 0.2, 0.1); },
    die: () => noise(0.2, 0.08, 800),
    half: () => { tone(523, 0.12, 'square', 0.06); tone(784, 0.16, 'square', 0.06, 0.08); },
    allin: () => { tone(220, 0.5, 'sawtooth', 0.08, 0, 660); noise(0.4, 0.06, 600); },
    turn: () => tone(880, 0.12, 'sine', 0.08),
    win: () => [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.25, 'triangle', 0.12, i * 0.09)),
    lose: () => tone(330, 0.4, 'triangle', 0.1, 0, 180),
    big: () => { [392, 523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, 0.3, 'triangle', 0.12, i * 0.08)); noise(0.6, 0.08, 6000, 0.3); },
    coin: () => [1318, 1568, 2093].forEach((f, i) => tone(f, 0.12, 'triangle', 0.08, i * 0.06)),
  };
  const sfx = (k, ...a) => SFX[k] && SFX[k](...a);
  // calls are spoken with the device's own Korean voice when it has one
  let koVoice = null;
  function pickVoice() { const vs = window.speechSynthesis ? speechSynthesis.getVoices() : []; koVoice = vs.find((v) => /ko/i.test(v.lang)) || null; }
  if (window.speechSynthesis) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
  function say(text, pitch = 1) {
    if (!prefs.voice || !window.speechSynthesis || !koVoice) return;
    try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.voice = koVoice; u.lang = koVoice.lang; u.rate = 1.15 * Math.min(1.6, speed); u.pitch = pitch; speechSynthesis.speak(u); } catch (e) { /* voice unavailable */ }
  }

  // ---------- table layout (percent of the table box): me at the bottom, then clockwise ----------
  const LAYOUT = { 1: [[50, 17]], 2: [[24, 19], [76, 19]], 3: [[11, 56], [50, 16], [89, 56]], 4: [[10, 62], [22, 19], [78, 19], [90, 62]] };
  const LAYOUT_TALL = { 1: [[50, 10]], 2: [[27, 13], [73, 13]], 3: [[22, 46], [50, 9], [78, 46]], 4: [[22, 60], [26, 14], [74, 14], [78, 60]] };
  const tall = () => innerWidth < 640 && innerHeight > innerWidth;

  let T = null, chan = null, seatEls = [], speed = prefs.speed, gameId = 0, chooseResolve = null, actResolve = null;
  const delay = (ms) => sleep(ms / speed);
  const img = (src, cls = 'card') => { const i = new Image(); i.src = src; i.className = cls; i.draggable = false; return i; };

  // ---------- rendering ----------
  function seatPos(i) { return i === 0 ? [50, 92] : (tall() ? LAYOUT_TALL : LAYOUT)[T.players.length - 1][i - 1]; }
  function buildSeats() {
    const box = $('seats'); box.innerHTML = ''; seatEls = [];
    T.players.forEach((p, i) => {
      const [x, y] = seatPos(i);
      const el = document.createElement('div'); el.className = 'seat' + (p.human ? ' me' : '') + (!p.human && y < 30 ? ' top' : '');
      el.style.left = x + '%'; el.style.top = y + '%';
      el.innerHTML = `${p.human ? '' : '<div class="row7"></div><div class="openName"></div>'}<div class="plate"><div class="boss">BOSS</div><div class="ava"><img alt=""></div><div class="nm"><b></b><span class="money"></span></div></div><div class="bubble"></div>`;
      box.appendChild(el);
      const bet = document.createElement('div'); bet.className = 'bet';
      const by = p.human ? 72 : y;
      bet.style.left = (x + (50 - x) * 0.42) + '%'; bet.style.top = (by + (44 - by) * 0.42) + '%';
      box.appendChild(bet);
      seatEls.push({ el, bet, row: el.querySelector('.row7'), openName: el.querySelector('.openName'), ava: el.querySelector('.ava img'), nm: el.querySelector('.nm b'), money: el.querySelector('.money'), bubble: el.querySelector('.bubble'), key: null, who: null });
    });
  }
  const BUB = { 다이: 'die', 체크: 'check', 콜: 'call', 삥: 'ping', 따당: 'ddadang', 쿼터: 'quarter', 하프: 'half', 올인: 'allin' };
  function render() {
    const boss = T.phase === 'bet' ? T.toAct >= 0 && T.boss() : -1;
    T.players.forEach((p, i) => {
      const s = seatEls[i];
      if (s.who !== p.name) { s.who = p.name; s.ava.src = ART.portrait(p.human ? 'me' : p.persona.id); s.nm.textContent = p.human ? '나' : p.name; s.el.style.setProperty('--pc', p.human ? '#f2c86a' : p.persona.color); }
      s.money.textContent = won(p.chips);
      s.el.classList.toggle('turn', T.toAct === i && T.phase === 'bet');
      s.el.classList.toggle('folded', p.folded);
      s.el.classList.toggle('isboss', boss === i);
      s.bubble.textContent = p.last; s.bubble.className = 'bubble ' + (BUB[p.last] || '');
      const bv = T.phase === 'bet' ? p.bet : 0;
      if (s.betV !== bv) { s.betV = bv; s.bet.innerHTML = bv ? `<img src="${ART.stack(Math.min(bv / T.unit * 5, 9999))[0]}" alt=""><span>${won(bv)}</span>` : ''; }
      if (s.row) {
        const showAll = T.phase === 'done' && T.result && T.result.showdown && !p.folded;
        const key = p.cards.join() + '|' + p.open.join() + '|' + showAll + '|' + p.folded;
        if (s.key !== key) {
          const prev = s.row.childElementCount;
          s.row.innerHTML = '';
          p.cards.forEach((c, k) => {
            const face = p.open[k] || showAll;
            const im = img(face ? CARDS.face(c) : CARDS.back(), 'card' + (k >= prev ? ' deal' : '') + (showAll && !p.open[k] ? ' flip' : '') + (p.open[k] ? ' up' : ''));
            im.dataset.c = c; s.row.appendChild(im);
          });
          s.key = key;
        }
        const oc = T.openCards(p);
        s.openName.textContent = p.folded ? '' : showAll ? S.describe(T.result.evals.get(p)) : oc.length >= 2 && T.phase !== 'choose' ? openLabel(oc) : '';
      }
    });
    const pot = T.pot();
    const st = pot ? ART.stack(Math.min(pot / T.unit * 3, 99999)) : null;
    $('pot').innerHTML = pot ? `${st ? `<img src="${st[0]}" style="height:${Math.round(st[2] * 0.95)}px" alt="">` : ''}<div><small>판돈</small><b>${won(pot)}</b></div>` : '';
    $('street').textContent = T.phase === 'choose' ? '카드 선택' : T.phase === 'bet' ? S.STREET_NAME[T.street] : '';
    const me = T.players[0], o = T.phase === 'bet' && T.toAct >= 0 ? T.options(T.toAct) : null;
    $('callInfo').textContent = o && T.curBet ? `콜 ${won(T.curBet)}` : '';
    renderMine();
  }
  function openLabel(oc) { const e = S.evalOpen(oc); return e.cat >= 1 ? S.describe({ cat: e.cat, best: e.best }) : ''; }
  function renderMine() {
    const me = T.players[0], box = $('myCards');
    const key = me.cards.join() + '|' + me.open.join() + '|' + T.phase + '|' + (chooseStep || '');
    if (box.dataset.key !== key) {
      const prev = box.childElementCount;
      box.innerHTML = '';
      me.cards.forEach((c, k) => {
        const wrap = document.createElement('div'); wrap.className = 'mc' + (T.phase !== 'choose' && !me.open[k] ? ' hid' : '') + (T.phase !== 'choose' && me.open[k] ? ' up' : '');
        const im = img(CARDS.face(c), 'card' + (k >= prev ? ' deal' : '')); im.dataset.c = c; wrap.appendChild(im);
        if (T.phase !== 'choose' && !me.open[k]) { const t = document.createElement('i'); t.textContent = k >= 3 ? '히든' : '비공개'; wrap.appendChild(t); }
        if (T.phase === 'choose' && chooseResolve) wrap.onclick = () => pickChoose(k);
        if (chosenDiscard === k && chooseStep === 'open') wrap.classList.add('gone');
        box.appendChild(wrap);
      });
      box.dataset.key = key;
    }
    box.classList.toggle('dim', me.folded);
    $('myHand').textContent = me.folded ? '다이' : me.cards.length >= 5 ? S.describe(S.evaluate(me.cards)) : me.cards.length ? S.describe(S.evalOpen(me.cards)) : '';
  }

  // ---------- your choices ----------
  let chooseStep = null, chosenDiscard = -1;
  function humanChoose() {
    return new Promise((res) => {
      chooseStep = 'discard'; chosenDiscard = -1; chooseResolve = res;
      $('prompt').textContent = '버릴 카드 1장을 고르세요';
      $('me').classList.add('choosing');
      render();
      sfx('turn');
    });
  }
  function pickChoose(k) {
    if (!chooseResolve) return;
    if (chooseStep === 'discard') { chosenDiscard = k; chooseStep = 'open'; $('prompt').textContent = '상대에게 보여줄(오픈) 카드 1장을 고르세요'; sfx('chip'); $('myCards').dataset.key = ''; render(); return; }
    if (k === chosenDiscard) return;
    const r = chooseResolve; chooseResolve = null; chooseStep = null; $('prompt').textContent = ''; $('me').classList.remove('choosing');
    r([chosenDiscard, k]);
  }
  const ACT_ORDER = ['die', 'check', 'call', 'ping', 'ddadang', 'quarter', 'half'];
  function humanTurn() {
    const o = T.options(0), me = T.players[0];
    document.querySelectorAll('#acts .bt').forEach((b) => {
      const a = b.dataset.a, ok = a in o.acts;
      b.disabled = !ok;
      const amt = o.acts[a];
      b.querySelector('small').textContent = !ok ? '' : a === 'die' || a === 'check' ? '' : a === 'call' ? (amt >= me.chips ? '올인' : won(amt)) : (amt >= me.bet + me.chips ? '올인' : won(amt));
    });
    $('bar').classList.add('myturn');
    sfx('turn');
    updateOdds();
    return new Promise((res) => { actResolve = res; });
  }
  function answer(a) { if (!actResolve || !(a in T.options(0).acts)) return; const r = actResolve; actResolve = null; $('bar').classList.remove('myturn'); r(a); }
  document.querySelectorAll('#acts .bt').forEach((b) => (b.onclick = () => answer(b.dataset.a)));
  addEventListener('keydown', (e) => {
    if (document.querySelector('.overlay.on')) return;
    const n = +e.key;
    if (actResolve && n >= 1 && n <= 7) answer(ACT_ORDER[n - 1]);
    if (chooseResolve && n >= 1 && n <= 4) pickChoose(n - 1);
  });
  function updateOdds() {
    const me = T.players[0];
    if (!prefs.hint || me.folded || T.phase !== 'bet') { $('myOdds').textContent = ''; return; }
    const eq = T.equityFor(me, 400);
    const o = T.options(0);
    $('myOdds').textContent = `승률 약 ${Math.round(eq * 100)}%` + (o.toCall ? ` · 콜하려면 ${Math.round((o.toCall / (o.pot + o.toCall)) * 100)}% 필요` : '');
  }

  // ---------- effects ----------
  function banner(text, sub = '', kind = '') {
    const b = $('banner');
    b.innerHTML = `<b>${text}</b>${sub ? `<small>${sub}</small>` : ''}`;
    b.className = 'show ' + kind; void b.offsetWidth; b.classList.add('go');
    clearTimeout(banner.t); banner.t = setTimeout(() => (b.className = ''), 1800 / Math.min(speed, 2));
  }
  function centerOf(el) { const t = $('table').getBoundingClientRect(), r = el.getBoundingClientRect(); return [r.left - t.left + r.width / 2, r.top - t.top + r.height / 2]; }
  function flyChips(fromEl, toEl, n = 3, color = 4) {
    if (!fromEl || !toEl || speed > 2.5) return;
    const [x0, y0] = centerOf(fromEl), [x1, y1] = centerOf(toEl);
    for (let k = 0; k < n; k++) {
      const c = document.createElement('img'); c.src = ART.chip((color + k) % 6); c.className = 'fly';
      c.style.left = x0 + 'px'; c.style.top = y0 + 'px'; $('table').appendChild(c);
      const jx = (Math.random() - 0.5) * 18, jy = (Math.random() - 0.5) * 10;
      c.animate([{ transform: 'translate(-50%,-50%) scale(.9)', opacity: 0.2 }, { transform: `translate(calc(-50% + ${x1 - x0 + jx}px), calc(-50% + ${y1 - y0 + jy}px))`, opacity: 1, offset: 0.85 }, { transform: `translate(calc(-50% + ${x1 - x0 + jx}px), calc(-50% + ${y1 - y0 + jy}px)) scale(.8)`, opacity: 0 }],
        { duration: 520 / Math.min(speed, 2) + k * 50, delay: k * 45, easing: 'cubic-bezier(.3,.7,.3,1)' }).onfinish = () => c.remove();
    }
  }
  const CALL_WORD = { 다이: '다이', 체크: '체크', 콜: '콜', 삥: '삥', 따당: '따당', 쿼터: '쿼터', 하프: '하프', 올인: '올인' };

  // ---------- a hand ----------
  async function playHand(myGame) {
    $('msg').textContent = '';
    seatEls.forEach((s) => s.el.classList.remove('winner'));
    T.startHand();
    render();
    for (let i = 0; i < T.players.length * 4; i++) sfx('deal', i);
    await delay(600);
    if (myGame !== gameId) return false;
    const [d, o] = await humanChoose();
    if (myGame !== gameId) return false;
    T.choose(0, d, o);
    render(); sfx('deal');
    banner(S.STREET_NAME[T.street], '', 'street');
    await delay(500);
    let street = T.street;
    while (T.phase !== 'done') {
      if (myGame !== gameId) return false;
      const i = T.toAct, p = T.players[i];
      render();
      let a;
      if (p.human) a = await humanTurn();
      else { await delay(500 + Math.random() * 500); a = T.decide(i); }
      if (myGame !== gameId) return false;
      const betsBefore = T.players.map((q) => q.bet), chipsBefore = p.chips;
      T.act(a);
      const word = p.last;
      say(CALL_WORD[word] || '', p.human ? 1 : 0.9 + (i % 3) * 0.1);
      word === '다이' ? sfx('die') : word === '체크' ? sfx('check') : word === '올인' ? sfx('allin') : word === '하프' ? sfx('half') : sfx('chip');
      if (p.chips < chipsBefore) flyChips(seatEls[i].el.querySelector('.plate'), seatEls[i].bet, word === '하프' || word === '올인' ? 5 : 2, word === '하프' ? 0 : 4);
      if (word === '올인') banner('올인!', `${p.human ? '나' : p.name}`, 'allin');
      if (T.street !== street || T.phase === 'done') {
        betsBefore.forEach((b, k) => { if (b > 0 || (k === i && p.chips < chipsBefore)) flyChips(seatEls[k].bet, $('pot'), 3, 2 + k); });
        await delay(350);
        render();
        if (T.phase !== 'done') { sfx('deal'); banner(S.STREET_NAME[T.street], '', 'street'); }
        street = T.street;
        await delay(T.phase === 'done' ? 300 : 650);
      } else render();
    }
    $('bar').classList.remove('myturn');
    return true;
  }
  async function showResult() {
    const R = T.result, me = T.players[0];
    render();
    $('myOdds').textContent = '';
    const winners = [...R.won.keys()];
    for (const w of winners) seatEls[w.seat].el.classList.add('winner');
    if (R.showdown) {
      // the winning five light up
      const best = new Set(winners.flatMap((w) => R.evals.get(w).best));
      for (const w of winners) { const s = seatEls[w.seat]; [...(w.human ? $('myCards').querySelectorAll('.card') : s.row.children)].forEach((c) => c.classList.toggle('win', best.has(+c.dataset.c))); }
    }
    const w = winners[0], ev = R.showdown ? R.evals.get(w) : null;
    const total = [...R.won.values()].reduce((a, b) => a + b, 0);
    $('msg').textContent = `${w.human ? '나' : w.name} 승리 · ${ev ? S.describe(ev) : '모두 다이'} · +${won(total)}`;
    for (const x of winners) flyChips($('pot'), seatEls[x.seat].el.querySelector('.plate'), 7, 0);
    // jackpot grows with every pot and pays out on four of a kind or better (virtual money)
    jackpot += total * 0.01;
    if (ev && ev.cat >= 9) {
      const share = ev.cat >= 12 ? 1 : ev.cat >= 10 ? 0.3 : 0.1, pay = Math.round(jackpot * share);
      jackpot -= pay; w.chips += pay;
      banner('잭팟!', `${w.human ? '나' : w.name} · ${S.CAT_SHORT[ev.cat]} · +${won(pay)}`, 'legend'); sfx('big'); say('잭팟');
    } else if (ev && ev.cat >= 4) { banner(S.CAT_SHORT[ev.cat] + '!', `${w.human ? '나' : w.name} 승리`, ev.cat >= 7 ? 'strong' : ''); }
    else if (R.won.has(me)) banner('WIN', `+${won(R.won.get(me))}`, 'win');
    if (R.won.has(me)) { (ev && ev.cat >= 7) || R.won.get(me) >= T.unit * 200 ? sfx('big') : sfx('win'); say('승리'); } else if (!me.folded && R.showdown) sfx('lose');
    // stats & bankroll
    stats.hands++;
    if (R.won.has(me)) { stats.won++; stats.bigPot = Math.max(stats.bigPot, R.won.get(me)); if (ev && w.human) stats.bestCat = Math.max(stats.bestCat, ev.cat); }
    money = me.chips;
    saveMoney();
    render();
    $('jpAmt').textContent = won(jackpot);
  }
  // computer players who run dry stand up and someone new sits down
  function refreshSeats() {
    const used = new Set(T.players.map((p) => p.persona && p.persona.id));
    T.players.forEach((p, i) => {
      if (p.human || p.chips >= T.unit * 3) return;
      const pool = S.PERSONAS.filter((x) => !used.has(x.id));
      const per = pool.length ? pool[Math.floor(Math.random() * pool.length)] : p.persona;
      used.delete(p.persona.id); used.add(per.id);
      T.say(`${p.name}님이 나갔어요 · ${per.name}님 입장`, 'out');
      Object.assign(p, { name: per.name, persona: per, chips: botBankroll() });
      $('msg').textContent = `${per.name}님이 입장했어요`;
    });
  }
  const botBankroll = () => Math.round(chan.unit * (60 + Math.random() * 240));
  async function loop(myGame) {
    while (myGame === gameId) {
      if (T.players[0].chips < T.unit) { money = T.players[0].chips; saveMoney(); return broke(); }
      const ok = await playHand(myGame);
      if (!ok) return;
      await showResult();
      await delay(2600);
      if (myGame !== gameId) return;
      refreshSeats();
    }
  }

  // ---------- lobby ----------
  function enter(ch) {
    if (money < Math.max(ch.min, ch.unit * 10)) return;
    // the same hall runs 섯다 on its own table (sutda-ui.js), sharing the money
    if (prefs.game === 'sutda' && window.SUTDA_UI) { audio(); $('lobby').classList.remove('on'); window.SUTDA_UI.enter(ch); return; }
    audio(); chan = ch; gameId++;
    const pool = S.PERSONAS.slice().sort(() => Math.random() - 0.5).slice(0, prefs.n);
    T = new S.StudTable({ unit: ch.unit, difficulty: prefs.diff, players: [{ name: '나', human: true, chips: money }, ...pool.map((p) => ({ name: p.name, persona: p, chips: botBankroll() }))] });
    buildSeats();
    $('chan').innerHTML = `<b style="color:${ch.color}">${ch.name}</b><span>삥 ${won(ch.unit)}</span>`;
    $('jpAmt').textContent = won(jackpot);
    $('lobby').classList.remove('on');
    document.body.classList.add('playing');
    say(`${ch.name}에 입장했습니다`);
    loop(gameId);
  }
  function leave() {
    gameId++; chooseResolve = null; actResolve = null;
    if (T) { money = T.players[0].chips; saveMoney(); }
    document.body.classList.remove('playing');
    lobby();
  }
  function lobby() {
    decor();
    $('purse').innerHTML = `<small>보유 머니</small><b>${won(money)}</b>`;
    const box = $('chans'); box.innerHTML = '';
    for (const ch of CHANNELS) {
      const need = Math.max(ch.min, ch.unit * 10), ok = money >= need;
      const b = document.createElement('button'); b.className = 'chanBtn' + (ok ? '' : ' locked'); b.style.setProperty('--cc', ch.color);
      b.innerHTML = `<b>${ch.name}</b><span>삥 ${won(ch.unit)}</span><small>${ok ? '입장' : `${won(need)} 이상`}</small>`;
      b.disabled = !ok; b.onclick = () => enter(ch);
      box.appendChild(b);
    }
    seg('optG', [['seven', '세븐포커'], ['sutda', '섯다']], 'game');
    seg('optN', [[1, '1명'], [2, '2명'], [3, '3명'], [4, '4명']], 'n');
    seg('optD', [['easy', '쉬움'], ['normal', '보통'], ['hard', '어려움']], 'diff');
    $('lobby').classList.add('on');
  }
  function broke() {
    const canAid = money < AID;
    $('brokeTxt').innerHTML = `보유 머니 ${won(money)} · 이 채널은 삥 ${won(chan.unit)}이에요.${canAid ? '<br>가상 머니라 언제든 지원금을 받을 수 있어요.' : ''}`;
    const btns = $('brokeBtns'); btns.innerHTML = '';
    if (canAid) { const a = document.createElement('button'); a.className = 'big'; a.textContent = `지원금 받기 (${won(AID)}까지 채움)`; a.onclick = () => { money = AID; stats.aid++; saveMoney(); $('broke').classList.remove('on'); sfx('coin'); leave(); }; btns.appendChild(a); }
    const l = document.createElement('button'); l.className = 'ghost'; l.textContent = '로비로'; l.onclick = () => { $('broke').classList.remove('on'); leave(); }; btns.appendChild(l);
    $('broke').classList.add('on');
  }
  function seg(id, items, key) {
    const el = $(id); el.innerHTML = '';
    for (const [v, label] of items) { const b = document.createElement('button'); b.textContent = label; b.classList.toggle('sel', prefs[key] === v); b.onclick = () => { prefs[key] = v; savePrefs(); seg(id, items, key); }; el.appendChild(b); }
  }
  function decor() {
    const d = $('decor'); if (d.childElementCount) return;
    for (const [c, x, rot, y] of [[51, 10, -22, 10], [38, 88, 14, 12], [25, 7, 36, 78], [12, 92, -12, 80], [50, 18, 8, 46]]) { const i = img(CARDS.face(c), 'dcard'); i.style.left = x + '%'; i.style.top = y + '%'; i.style.setProperty('--r', rot + 'deg'); d.appendChild(i); }
    for (const [k, x, y] of [[0, 20, 28], [2, 80, 34], [4, 15, 62], [1, 86, 64], [3, 74, 90]]) { const i = img(ART.chip(k), 'dchip'); i.style.left = x + '%'; i.style.top = y + '%'; d.appendChild(i); }
  }

  // ---------- HUD buttons & panels ----------
  const SPEEDS = [[1, '보통'], [1.8, '빠름'], [3, '매우 빠름']];
  function syncHud() {
    $('speedBtn').textContent = SPEEDS.find((x) => x[0] === speed)[1];
    $('soundBtn').classList.toggle('on', prefs.sound); $('voiceBtn').classList.toggle('on', prefs.voice); $('hintBtn').classList.toggle('on', prefs.hint);
  }
  $('speedBtn').onclick = () => { const i = SPEEDS.findIndex((x) => x[0] === speed); speed = SPEEDS[(i + 1) % SPEEDS.length][0]; prefs.speed = speed; savePrefs(); syncHud(); };
  $('soundBtn').onclick = () => { prefs.sound = !prefs.sound; savePrefs(); audio(); syncHud(); };
  $('voiceBtn').onclick = () => { prefs.voice = !prefs.voice; savePrefs(); syncHud(); if (prefs.voice && !koVoice) info('<h2>음성</h2><p>이 기기에는 한국어 음성이 없어서 소리 내어 읽을 수 없어요. 효과음은 그대로 나와요.</p>'); };
  $('hintBtn').onclick = () => { prefs.hint = !prefs.hint; savePrefs(); syncHud(); if (T && actResolve) updateOdds(); };
  $('exitBtn').onclick = () => { if (confirm('나가면 이번 판에 건 돈은 잃어요. 나갈까요?')) leave(); };
  $('logBtn').onclick = () => {
    const list = $('logList'); list.innerHTML = '';
    for (const l of T ? T.log.slice(-150) : []) { const d = document.createElement('div'); d.className = l.kind; d.textContent = l.text.replace(/\d{5,}/g, (m) => won(+m)); list.appendChild(d); }
    $('logPanel').classList.add('on'); list.scrollTop = list.scrollHeight;
  };
  document.querySelectorAll('[data-close]').forEach((b) => (b.onclick = () => b.closest('.overlay').classList.remove('on')));
  function info(html) { $('infoBody').innerHTML = html; $('infoPanel').classList.add('on'); }
  const RULES = () => `<h2>족보 (높은 순)</h2><table>
    <tr><td>로열 스트레이트 플러시</td><td>같은 무늬 10·J·Q·K·A (로티플)</td></tr>
    <tr><td>백스트레이트 플러시</td><td>같은 무늬 A·2·3·4·5 (백스티플)</td></tr>
    <tr><td>스트레이트 플러시</td><td>같은 무늬로 이어진 다섯 장 (스티플)</td></tr>
    <tr><td>포카드</td><td>같은 숫자 네 장</td></tr><tr><td>풀하우스</td><td>같은 숫자 세 장 + 두 장</td></tr>
    <tr><td>플러시</td><td>같은 무늬 다섯 장</td></tr><tr><td>마운틴</td><td>10·J·Q·K·A</td></tr>
    <tr><td>백스트레이트</td><td>A·2·3·4·5</td></tr><tr><td>스트레이트</td><td>이어진 숫자 다섯 장</td></tr>
    <tr><td>트리플</td><td>같은 숫자 세 장</td></tr><tr><td>투페어</td><td>같은 숫자 두 장씩 두 쌍</td></tr>
    <tr><td>원페어</td><td>같은 숫자 두 장</td></tr><tr><td>탑</td><td>아무것도 없을 때 가장 높은 카드</td></tr></table>
    <p>족보와 숫자까지 같으면 무늬로 가려요: ♠ 스페이드 > ◆ 다이아 > ♥ 하트 > ♣ 클로버.</p>
    <h3>진행</h3><p>모두 기본 판돈(삥 한 번)을 내고 4장을 받아요. 1장은 버리고 1장은 펼쳐(오픈) 보여줘요. 그다음 4구·5구·6구는 앞면으로, 마지막 7구(히든)는 뒷면으로 받으며 매번 베팅해요. 7장 중 가장 좋은 5장으로 겨뤄요. 펼친 카드가 가장 좋은 사람(BOSS)이 먼저 베팅해요.</p>
    <h3>베팅</h3><table>
    <tr><td>삥</td><td>기본 판돈만큼 처음 거는 것</td></tr><tr><td>따당</td><td>앞사람이 건 돈의 두 배로</td></tr>
    <tr><td>쿼터</td><td>콜하고 판돈의 1/4을 더</td></tr><tr><td>하프</td><td>콜하고 판돈의 절반을 더</td></tr>
    <tr><td>콜 · 체크 · 다이</td><td>따라가기 · 넘기기 · 포기</td></tr></table>
    <p>한 바퀴에 올리기는 ${3}번까지예요. 단축키: 1 다이 · 2 체크 · 3 콜 · 4 삥 · 5 따당 · 6 쿼터 · 7 하프, 카드 고를 땐 1~4.</p>`;
  $('rankBtn').onclick = () => info(RULES());
  $('rulesBtn').onclick = () => info(RULES());
  $('statsBtn').onclick = () => info(`<h2>전적</h2><table>
    <tr><td>보유 머니</td><td>${won(money)} (최고 ${won(stats.peak)})</td></tr>
    <tr><td>판</td><td>${stats.hands.toLocaleString()}판 중 ${stats.won.toLocaleString()}판 승리${stats.hands ? ` (${Math.round((stats.won / stats.hands) * 100)}%)` : ''}</td></tr>
    <tr><td>가장 큰 판돈</td><td>${won(stats.bigPot)}</td></tr>
    <tr><td>최고 족보</td><td>${stats.bestCat >= 0 ? S.CAT_NAME[stats.bestCat] : '-'}</td></tr>
    <tr><td>지원금</td><td>${stats.aid}번 받음</td></tr></table>`);
  $('aboutBtn').onclick = () => gate(true);

  // ---------- first-launch notice (adults only) ----------
  function gate(force) {
    if (!force && store.get(K.gate, false)) return;
    $('gateBody').innerHTML = `<ul>
      <li>가상의 게임 머니로 컴퓨터와 하는 <b>1인용 세븐포커</b>예요. 다른 사람과 붙지 않아요.</li>
      <li><b>실제 돈·결제·광고·환전이 없어요.</b> 게임 머니(억·조 단위 포함)는 아무 가치가 없고 사거나 팔 수 없어요. 잭팟도 가상이에요.</li>
      <li>개인정보를 모으거나 외부로 보내지 않아요. 기록은 이 브라우저에만 저장돼요.</li>
      <li>포커는 도박을 소재로 한 게임이라 <span class="age">만 19세 이상</span>만 이용해 주세요.</li>
      <li>카드·캐릭터 그림과 프로그램은 이 게임을 위해 직접 만든 거예요. 글꼴은 Noto Sans KR과 GH Brush(나눔손글씨 붓의 일부 글자 사본)로 SIL Open Font License 1.1을 따라요.</li></ul>
      <p class="kid hidden" id="kidMsg">만 19세가 되면 다시 와 주세요. 이 게임은 성인용이에요.</p>
      <div class="row" id="gateBtns"><button class="big" id="gateOk">만 19세 이상이에요</button><button class="ghost" id="gateNo">아니에요</button></div>`;
    $('gate').classList.add('on');
    $('gateOk').onclick = () => { store.set(K.gate, true); $('gate').classList.remove('on'); };
    $('gateNo').onclick = () => { store.del(K.gate); $('kidMsg').classList.remove('hidden'); $('gateBtns').classList.add('hidden'); };
  }

  addEventListener('resize', () => { if (T && document.body.classList.contains('playing')) { buildSeats(); render(); } });
  document.documentElement.style.setProperty('--felt', `url(${ART.felt()})`);
  setInterval(() => { jackpot += Math.random() * (chan ? chan.unit : 1000) * 0.3; $('jpAmt').textContent = won(jackpot); }, 1200);
  // what the other games in the hall share
  window.HALL = {
    won, sfx, tone, noise, say, audio, prefs, stats, info,
    get speed() { return speed; },
    getMoney: () => money, setMoney: (m) => { money = Math.round(m); saveMoney(); },
    back: () => lobby(), savePrefs: () => savePrefs(),
    aid: () => { if (money >= AID) return false; money = AID; stats.aid++; saveMoney(); sfx('coin'); return true; },
  };
  window.__seven = { get T() { return T; }, answer, pickChoose, get waitAct() { return !!actResolve; }, get waitChoose() { return !!chooseResolve; }, setSpeed: (s) => (speed = s), enter: (i) => enter(CHANNELS[i]), get money() { return money; }, setMoney: (m) => { money = m; saveMoney(); } };

  syncHud();
  lobby();
  gate(false);
})();
