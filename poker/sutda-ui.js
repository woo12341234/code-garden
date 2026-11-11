// 포커 열전 · 섯다 table: squeezing the last card (쪼기), catching a bottom deal (밑장 잡기),
// a heartbeat that rises with the pot, table talk, and a slow one-by-one showdown.
(function () {
  'use strict';
  const D = window.SUTDA, HW = window.HWATU, ART = window.ART, H = window.HALL;
  const $ = (id) => document.getElementById(id);
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const won = (n) => H.won(n);
  const img = (src, cls = 'card') => { const i = new Image(); i.src = src; i.className = cls; i.draggable = false; return i; };
  let T = null, chan = null, gameId = 0, seats = [], actResolve = null, squeezeResolve = null, catchMode = false;
  const sd = { speed: 1 };
  const delay = (ms) => sleep(ms / sd.speed);

  // ---------- heartbeat: faster and louder the more is at stake ----------
  let heart = { on: false, bpm: 0, t: null };
  function beat() {
    if (!heart.on) return;
    if (H.prefs.sound) { H.tone(62, 0.13, 'sine', 0.28 * heart.vol); H.tone(56, 0.13, 'sine', 0.2 * heart.vol, 0.17); }
    const v = $('vignette'); v.classList.remove('pulse'); void v.offsetWidth; v.classList.add('pulse');
    heart.t = setTimeout(beat, 60000 / heart.bpm);
  }
  function setTension(level) { // 0 calm … 1 nerve-racking
    $('vignette').style.setProperty('--tension', level.toFixed(2));
    if (level < 0.25) { heart.on = false; clearTimeout(heart.t); return; }
    heart.bpm = 64 + level * 76; heart.vol = 0.4 + level * 0.6;
    if (!heart.on) { heart.on = true; beat(); }
  }
  function stakeTension() {
    if (!T || T.phase === 'done') return 0;
    const me = T.players[0], pot = T.pot();
    const share = pot / Math.max(1, me.chips + me.total);
    const o = T.toAct === 0 ? T.options(0) : null;
    const facing = o ? o.toCall / Math.max(1, me.chips) : 0;
    return Math.min(1, share * 0.9 + facing * 1.2 + (T.round === 2 ? 0.1 : 0));
  }

  // ---------- table layout ----------
  const LAYOUT = { 1: [[50, 16]], 2: [[24, 20], [76, 20]], 3: [[12, 52], [50, 15], [88, 52]], 4: [[10, 60], [26, 17], [74, 17], [90, 60]], 5: [[9, 62], [17, 22], [50, 13], [83, 22], [91, 62]] };
  const TALL = { 1: [[50, 12]], 2: [[27, 15], [73, 15]], 3: [[22, 46], [50, 11], [78, 46]], 4: [[22, 60], [26, 15], [74, 15], [78, 60]], 5: [[20, 64], [20, 30], [50, 10], [80, 30], [80, 64]] };
  const tall = () => innerWidth < 640 && innerHeight > innerWidth;
  function pos(i) { return i === 0 ? [50, 92] : (tall() ? TALL : LAYOUT)[T.players.length - 1][i - 1]; }
  function build() {
    const box = $('sdSeats'); box.innerHTML = ''; seats = [];
    T.players.forEach((p, i) => {
      const [x, y] = pos(i);
      const el = document.createElement('div'); el.className = 'sseat' + (p.human ? ' me' : '') + (!p.human && y < 30 ? ' top' : '');
      el.style.left = x + '%'; el.style.top = y + '%';
      el.innerHTML = `${p.human ? '' : '<div class="two"></div><div class="hname"></div>'}<div class="plate"><div class="ava"><img alt=""></div><div class="nm"><b></b><span class="money"></span></div></div><div class="bubble"></div><div class="talk"></div>`;
      box.appendChild(el);
      const bet = document.createElement('div'); bet.className = 'bet';
      const by = p.human ? 74 : y;
      bet.style.left = (x + (50 - x) * 0.42) + '%'; bet.style.top = (by + (46 - by) * 0.42) + '%';
      box.appendChild(bet);
      el.onclick = () => { if (catchMode && !p.human && !p.folded) doCatch(i); };
      seats.push({ el, bet, two: el.querySelector('.two'), hname: el.querySelector('.hname'), ava: el.querySelector('.ava img'), nm: el.querySelector('.nm b'), money: el.querySelector('.money'), bubble: el.querySelector('.bubble'), talk: el.querySelector('.talk'), key: '', who: '' });
    });
  }
  const BUB = { 다이: 'die', 체크: 'check', 콜: 'call', 삥: 'ping', 따당: 'ddadang', 쿼터: 'quarter', 하프: 'half', 올인: 'allin' };
  let showCards = false, mySecondOpen = false;
  function render() {
    T.players.forEach((p, i) => {
      const s = seats[i];
      if (s.who !== p.name) { s.who = p.name; s.ava.src = ART.portrait(p.human ? 'me' : p.persona.id); s.nm.textContent = p.human ? '나' : p.name; s.el.style.setProperty('--pc', p.human ? '#f2c86a' : p.persona.color); }
      s.money.textContent = won(p.chips);
      s.el.classList.toggle('turn', T.toAct === i && T.phase === 'bet');
      s.el.classList.toggle('folded', p.folded); s.el.classList.toggle('exposed', !!s.force);
      s.bubble.textContent = p.last; s.bubble.className = 'bubble ' + (BUB[p.last] || '');
      const bv = T.phase === 'bet' ? p.bet : 0;
      if (s.betV !== bv) { s.betV = bv; s.bet.innerHTML = bv ? `<img src="${ART.stack(Math.min(bv / T.unit * 5, 9999))[0]}" alt=""><span>${won(bv)}</span>` : ''; }
      if (s.two) {
        const face = showCards && (!p.folded || s.force) && p.cards.length === 2 && (s.reveal || 0);
        const key = p.cards.join() + '|' + face + '|' + p.folded;
        if (s.key !== key) {
          const had = s.two.childElementCount;
          s.two.innerHTML = '';
          p.cards.forEach((c, k) => { const up = face && k < face; const im = img(up ? HW.face(c) : HW.back(), 'card' + (k >= had ? ' deal' : '') + (up ? ' flip' : '') + (k === 1 && s.bottom ? ' bottom' : '')); s.two.appendChild(im); });
          s.key = key;
        }
        s.hname.textContent = showCards && (!p.folded || s.force) && s.reveal === 2 && p.cards.length === 2 ? D.hand(p.cards[0], p.cards[1]).name : '';
      }
    });
    const pot = T.pot();
    const st = pot ? ART.stack(Math.min(pot / T.unit * 3, 99999)) : null;
    $('sdPot').innerHTML = pot ? `${st ? `<img src="${st[0]}" style="height:${Math.round(st[2] * 0.95)}px" alt="">` : ''}<div><small>판돈</small><b>${won(pot)}</b></div>` : '';
    $('sdRound').textContent = T.phase === 'done' ? '' : T.round === 1 ? '첫 장' : '두 번째 장';
    renderMine();
    const canCatch = T.phase === 'bet' && T.round === 2 && !T.accused && !T.players[0].folded && actResolve;
    $('sdCatch').disabled = !canCatch;
    $('sdCatch').classList.toggle('armed', catchMode);
    setTension(stakeTension());
  }
  function renderMine() {
    const me = T.players[0], box = $('sdCards');
    const key = me.cards.join() + '|' + mySecondOpen + '|' + !!squeezeResolve;
    if (box.dataset.key !== key) {
      box.innerHTML = '';
      me.cards.forEach((c, k) => {
        const wrap = document.createElement('div'); wrap.className = 'scard';
        if (k === 1 && !mySecondOpen) {
          // the squeeze: the face sits under the back, which you slide up
          wrap.classList.add('squeeze');
          wrap.append(img(HW.face(c), 'card face'), img(HW.back(), 'card back'));
          const hint = document.createElement('i'); hint.textContent = squeezeResolve ? '위로 밀어 쪼기' : ''; wrap.appendChild(hint);
          if (squeezeResolve) attachSqueeze(wrap);
        } else wrap.appendChild(img(HW.face(c), 'card deal'));
        box.appendChild(wrap);
      });
      box.dataset.key = key;
    }
    box.classList.toggle('dim', me.folded);
    $('sdHand').textContent = me.folded ? '다이' : me.cards.length === 2 && mySecondOpen ? D.hand(me.cards[0], me.cards[1]).name : me.cards.length ? `${D.month(me.cards[0])}월 한 장` : '';
  }

  // ---------- 쪼기 ----------
  function attachSqueeze(wrap) {
    const back = wrap.querySelector('.back');
    let y0 = null, p = 0;
    const set = (v) => {
      p = Math.max(0, Math.min(1, v));
      back.style.clipPath = `inset(0 0 ${p * 100}% 0)`;
      back.style.transform = `translateY(${-p * 8}px) rotate(${-p * 4}deg)`;
      setTension(Math.max(stakeTension(), 0.35 + p * 0.6));
      if (p >= 0.98) done();
    };
    const done = () => {
      if (!squeezeResolve) return;
      const r = squeezeResolve; squeezeResolve = null;
      mySecondOpen = true; $('sdPrompt').textContent = '';
      $('sdCards').dataset.key = ''; render();
      const me = T.players[0], h = D.hand(me.cards[0], me.cards[1]);
      if (h.val >= 801 || h.tier === 'trick') { H.sfx('big'); banner(h.name + '!', '', h.val >= 900 ? 'legend' : 'gold'); H.say(h.name); } else H.sfx('chip');
      r();
    };
    const start = (e) => { y0 = (e.touches ? e.touches[0] : e).clientY; e.preventDefault(); };
    const move = (e) => { if (y0 == null) return; const y = (e.touches ? e.touches[0] : e).clientY; set((y0 - y) / (back.getBoundingClientRect().height * 0.9)); };
    const end = () => { if (y0 == null) return; y0 = null; if (p < 0.98) set(Math.min(p, 0.35)); };
    wrap.addEventListener('pointerdown', (e) => { wrap.setPointerCapture(e.pointerId); start(e); });
    wrap.addEventListener('pointermove', move); wrap.addEventListener('pointerup', end); wrap.addEventListener('pointercancel', end);
    wrap.ondblclick = () => set(1);
    wrap.squeezeTo = set;
  }
  function squeeze() {
    return new Promise((res) => {
      squeezeResolve = res; mySecondOpen = false;
      $('sdPrompt').innerHTML = '마지막 패를 위로 밀어 올려 <b>쪼아</b> 보세요 <button id="sdFlip">한 번에 까기</button>';
      $('sdFlip').onclick = () => { const w = document.querySelector('.scard.squeeze'); if (w && w.squeezeTo) w.squeezeTo(1); };
      $('sdCards').dataset.key = ''; render();
    });
  }

  // ---------- your turn ----------
  function humanTurn() {
    const o = T.options(0), me = T.players[0];
    document.querySelectorAll('#sdActs .bt').forEach((b) => {
      const a = b.dataset.a, ok = a in o.acts, amt = o.acts[a];
      b.disabled = !ok;
      b.querySelector('small').textContent = !ok || a === 'die' || a === 'check' ? '' : a === 'call' ? (amt >= me.chips ? '올인' : won(amt)) : amt >= me.bet + me.chips ? '올인' : won(amt);
    });
    $('sdBar').classList.add('myturn');
    H.sfx('turn');
    odds();
    return new Promise((res) => { actResolve = res; render(); });
  }
  function answer(a) { if (!actResolve) return; if (a !== '__catch' && !(a in T.options(0).acts)) return; const r = actResolve; actResolve = null; catchMode = false; $('sdBar').classList.remove('myturn'); r(a); }
  document.querySelectorAll('#sdActs .bt').forEach((b) => (b.onclick = () => answer(b.dataset.a)));
  $('sdCatch').onclick = () => { if ($('sdCatch').disabled) return; catchMode = !catchMode; $('sdPrompt').textContent = catchMode ? '누구 손이 수상했나요? 그 사람 자리를 누르세요' : ''; $('sdSeats').classList.toggle('picking', catchMode); render(); };
  function doCatch(i) {
    catchMode = false; $('sdSeats').classList.remove('picking'); $('sdPrompt').textContent = '';
    const r = T.accuse(0, i);
    if (!r) return;
    const p = T.players[i];
    if (r.caught) {
      seats[i].reveal = 2; seats[i].force = true; showCards = true; seats[i].bottom = false;
      banner('밑장 잡았다!', `${p.name} · 벌금 ${won(r.fine)} + 판돈 ${won(r.pot)}`, 'caught'); H.sfx('big'); H.say('밑장 잡았다');
      talk(i, '…이걸 보네', 2500);
    } else {
      banner('헛짚었다…', `${p.name}에게 ${won(r.fine)} 물어줌`, 'miss'); H.sfx('lose');
      talk(i, ['생사람 잡지 마쇼', '증거 있어요?', '허허, 눈이 침침하신가'][Math.floor(Math.random() * 3)], 2200);
    }
    answer('__catch');
  }
  addEventListener('keydown', (e) => {
    if (!document.body.classList.contains('playing-sutda') || document.querySelector('.overlay.on')) return;
    const n = +e.key, order = ['die', 'check', 'call', 'ping', 'ddadang', 'quarter', 'half'];
    if (actResolve && n >= 1 && n <= 7) answer(order[n - 1]);
    if (squeezeResolve && (e.key === ' ' || e.key === 'Enter')) { e.preventDefault(); $('sdFlip')?.click(); }
  });
  function odds() {
    if (!H.prefs.hint || T.players[0].folded || T.phase !== 'bet') { $('sdOdds').textContent = ''; return; }
    const eq = T.equityFor(T.players[0], 500), o = T.options(0);
    $('sdOdds').textContent = `승률 약 ${Math.round(eq * 100)}%` + (o.toCall ? ` · 콜하려면 ${Math.round((o.toCall / (o.pot + o.toCall)) * 100)}% 필요` : '');
  }

  // ---------- effects ----------
  function banner(text, sub = '', kind = '') {
    const b = $('sdBanner');
    b.innerHTML = `<b>${text}</b>${sub ? `<small>${sub}</small>` : ''}`;
    b.className = 'show ' + kind; void b.offsetWidth; b.classList.add('go');
    clearTimeout(banner.t); banner.t = setTimeout(() => (b.className = ''), 1900 / Math.min(sd.speed, 2));
  }
  function talk(i, text, ms = 1800) {
    const s = seats[i]; if (!s) return;
    s.talk.textContent = text; s.talk.classList.add('on');
    clearTimeout(s.talkT); s.talkT = setTimeout(() => s.talk.classList.remove('on'), ms / Math.min(sd.speed, 1.5));
  }
  function centerOf(el) { const t = $('sdTable').getBoundingClientRect(), r = el.getBoundingClientRect(); return [r.left - t.left + r.width / 2, r.top - t.top + r.height / 2]; }
  // cards slide out of the deck; a bottom deal comes from underneath with a quick blur (the tell)
  function dealFly(i, bottom) {
    const tgt = i === 0 ? $('sdCards') : seats[i].two; if (!tgt || sd.speed > 2.5) return;
    const [x0, y0] = centerOf($('sdDeck')), [x1, y1] = centerOf(tgt);
    const c = img(HW.back(), 'fly-card' + (bottom ? ' from-bottom' : '')); c.style.left = x0 + 'px'; c.style.top = (y0 + (bottom ? 10 : 0)) + 'px';
    $('sdTable').appendChild(c);
    c.animate([{ transform: 'translate(-50%,-50%) rotate(0)', opacity: 1 }, { transform: `translate(calc(-50% + ${x1 - x0}px), calc(-50% + ${y1 - y0}px)) rotate(${bottom ? 380 : 360}deg) scale(.8)`, opacity: 0.2 }],
      { duration: (bottom ? 180 : 380) / Math.min(sd.speed, 2), easing: 'cubic-bezier(.3,.7,.3,1)' }).onfinish = () => c.remove();
    H.noise(bottom ? 0.03 : 0.05, bottom ? 0.05 : 0.1, bottom ? 1200 : 3200);
  }
  function flyChips(fromEl, toEl, n = 3, color = 4) {
    if (!fromEl || !toEl || sd.speed > 2.5) return;
    const [x0, y0] = centerOf(fromEl), [x1, y1] = centerOf(toEl);
    for (let k = 0; k < n; k++) {
      const c = img(ART.chip((color + k) % 6), 'fly'); c.style.left = x0 + 'px'; c.style.top = y0 + 'px'; $('sdTable').appendChild(c);
      c.animate([{ transform: 'translate(-50%,-50%)', opacity: 0.2 }, { transform: `translate(calc(-50% + ${x1 - x0}px), calc(-50% + ${y1 - y0}px))`, opacity: 1, offset: 0.85 }, { transform: `translate(calc(-50% + ${x1 - x0}px), calc(-50% + ${y1 - y0}px)) scale(.8)`, opacity: 0 }],
        { duration: 500 / Math.min(sd.speed, 2) + k * 50, delay: k * 45, easing: 'cubic-bezier(.3,.7,.3,1)' }).onfinish = () => c.remove();
    }
  }
  const WHISPER = { easy: 0.7, normal: 0.35, hard: 0 };

  // ---------- a hand ----------
  async function dealAnim(round) {
    T.players.forEach((p, i) => { seats[i].bottom = round === 2 && T.bottomDeal === i; });
    for (const p of T.contenders()) { dealFly(p.seat, round === 2 && T.bottomDeal === p.seat); await delay(120); }
    render();
    if (round === 2 && T.bottomDeal > 0 && Math.random() < (WHISPER[H.prefs.diff] ?? 0.35)) setTimeout(() => { $('sdMsg').textContent = '…방금 누군가 손이 이상하게 빨랐는데?'; }, 400);
  }
  async function playHand(g) {
    showCards = false; mySecondOpen = false; catchMode = false;
    seats.forEach((s) => { s.reveal = 0; s.force = false; s.el.classList.remove('winner'); s.key = ''; });
    $('sdMsg').textContent = '';
    T.startHand();
    render();
    await dealAnim(1);
    let seenRound = 1, seenReplay = 0;
    // a computer or two sizes you up as the hand begins
    const chatty = T.players.filter((p) => !p.human)[Math.floor(Math.random() * (T.players.length - 1))];
    if (chatty && Math.random() < 0.5) talk(chatty.seat, chatty.persona.lines[Math.floor(Math.random() * chatty.persona.lines.length)]);
    while (true) {
      if (g !== gameId) return false;
      if (T.replays !== seenReplay) { seenReplay = T.replays; await showReplay(); seenRound = 1; mySecondOpen = false; continue; }
      if (T.round !== seenRound) {
        seenRound = T.round;
        await dealAnim(2);
        if (!T.players[0].folded && T.players[0].cards.length === 2) await squeeze(); else mySecondOpen = true;
        if (g !== gameId) return false;
        continue;
      }
      if (T.phase === 'done' || T.toAct < 0) break;
      const i = T.toAct, p = T.players[i];
      render();
      let a;
      if (p.human) a = await humanTurn();
      else { await delay(600 + Math.random() * 700); a = T.decide(i); }
      if (g !== gameId) return false;
      if (a === '__catch') { render(); continue; }
      const chipsBefore = p.chips, betsBefore = T.players.map((q) => q.bet), roundBefore = T.round;
      T.act(a);
      const w = p.last;
      H.say(w, p.human ? 1 : 0.85 + (i % 3) * 0.1);
      w === '다이' ? H.sfx('die') : w === '체크' ? H.sfx('check') : w === '올인' ? H.sfx('allin') : w === '하프' ? H.sfx('half') : H.sfx('chip');
      if (p.chips < chipsBefore) flyChips(seats[i].el.querySelector('.plate'), seats[i].bet, w === '하프' || w === '올인' ? 5 : 2, w === '하프' ? 0 : 4);
      if (!p.human && (w === '하프' || w === '올인') && Math.random() < 0.6) talk(i, p.persona.lines[Math.floor(Math.random() * p.persona.lines.length)]);
      if (!p.human && w === '다이' && Math.random() < 0.3) talk(i, ['에잇', '이번엔 봐준다', '다음 판에 보자'][Math.floor(Math.random() * 3)]);
      if (w === '올인') banner('올인!', p.human ? '나' : p.name, 'allin');
      if (T.round !== roundBefore || T.phase === 'done') { betsBefore.forEach((b, k) => { if (b > 0 || (k === i && p.chips < chipsBefore)) flyChips(seats[k].bet, $('sdPot'), 3, 2 + k); }); await delay(350); }
      render();
    }
    // a round may have closed without anyone acting (all-in): make sure the last card was seen
    if (!mySecondOpen && !T.players[0].folded && T.players[0].cards.length === 2 && !(T.result && T.result.caught)) { await dealAnim(2); await squeeze(); }
    $('sdBar').classList.remove('myturn');
    return true;
  }
  async function showReplay() {
    const R = T.lastReplay;
    showCards = true;
    banner(`${R.name}!`, '재경기 · 판돈은 그대로', 'gold');
    $('sdMsg').textContent = `${R.by.human ? '나' : R.by.name}의 ${R.name} · 재경기`;
    H.say('재경기');
    await delay(2200);
    showCards = false; seats.forEach((s) => { s.reveal = 0; s.key = ''; });
    $('sdCards').dataset.key = ''; render();
    await dealAnim(1);
  }
  async function showResult() {
    const R = T.result, me = T.players[0];
    setTension(0);
    if (R.showdown) {
      // lights down, then each hand turns over one card at a time
      document.body.classList.add('sd-dim');
      showCards = true;
      for (const p of T.contenders()) { if (p.human) continue; const s = seats[p.seat]; s.reveal = 1; render(); H.sfx('deal'); await delay(380); s.reveal = 2; render(); H.sfx('check'); await delay(520); }
      document.body.classList.remove('sd-dim');
    }
    const winners = [...R.won.keys()];
    for (const w of winners) seats[w.seat].el.classList.add('winner');
    const total = [...R.won.values()].reduce((a, b) => a + b, 0);
    const w = winners[0], h = R.showdown ? R.hands.get(w) : null;
    const trick = h && ((h.kind === 'catcher' && R.eff.get(w) > 809) || (h.kind === 'inspector' && R.eff.get(w) >= 950));
    $('sdMsg').textContent = R.caught ? `${R.caught.by.human ? '내가' : R.caught.by.name + '이(가)'} ${R.caught.cheat.name}의 밑장을 잡았다 · +${won(total + R.caught.fine)}` : `${winners.map((x) => (x.human ? '나' : x.name)).join('·')} 승리 · ${h ? h.name : '모두 다이'} · +${won(total)}`;
    for (const x of winners) flyChips($('sdPot'), seats[x.seat].el.querySelector('.plate'), 7, 0);
    if (!R.caught) {
      if (trick) { banner(`${h.name}!!`, '잡았다!', 'legend'); H.sfx('big'); H.say(h.name); }
      else if (h && h.val >= 900) { banner(h.name + '!', `${w.human ? '나' : w.name} 승리`, 'legend'); H.sfx('big'); }
      else if (R.won.has(me)) { banner('WIN', `+${won(R.won.get(me))}`, 'win'); H.sfx('win'); H.say('승리'); }
      else if (!me.folded && R.showdown) H.sfx('lose');
    }
    // the losers grumble, the winner gloats
    if (!w.human && Math.random() < 0.6) talk(w.seat, ['고맙소', '잘 먹겠습니다', '운도 실력이지', '허허허'][Math.floor(Math.random() * 4)], 2200);
    H.stats.hands++; if (R.won.has(me)) { H.stats.won++; H.stats.bigPot = Math.max(H.stats.bigPot, R.won.get(me)); }
    H.setMoney(me.chips);
    render();
  }
  function refreshSeats() {
    const used = new Set(T.players.map((p) => p.persona && p.persona.id));
    T.players.forEach((p) => {
      if (p.human || p.chips >= T.unit * 3) return;
      const pool = D.PERSONAS.filter((x) => !used.has(x.id)), per = pool.length ? pool[Math.floor(Math.random() * pool.length)] : p.persona;
      used.delete(p.persona.id); used.add(per.id);
      Object.assign(p, { name: per.name, persona: per, chips: bankroll() });
      $('sdMsg').textContent = `${per.name}님이 자리에 앉았어요`;
    });
  }
  const bankroll = () => Math.round(chan.unit * (60 + Math.random() * 240));
  async function loop(g) {
    while (g === gameId) {
      if (T.players[0].chips < T.unit) { H.setMoney(T.players[0].chips); leave(true); return; }
      if (!(await playHand(g))) return;
      await showResult();
      await delay(2800);
      if (g !== gameId) return;
      refreshSeats();
    }
  }

  // ---------- entering / leaving ----------
  function enter(ch) {
    chan = ch; gameId++; sd.speed = H.speed;
    // the card sharp usually has a seat at the table
    const others = D.PERSONAS.filter((p) => p.id !== 'sharp').sort(() => Math.random() - 0.5);
    const n = Math.min(5, H.prefs.n);
    const pool = (Math.random() < 0.75 ? [D.PERSONAS.find((p) => p.id === 'sharp'), ...others] : others).slice(0, n).sort(() => Math.random() - 0.5);
    T = new D.SutdaTable({ unit: ch.unit, difficulty: H.prefs.diff, players: [{ name: '나', human: true, chips: H.getMoney() }, ...pool.map((p) => ({ name: p.name, persona: p, chips: bankroll() }))] });
    build();
    $('sdChan').innerHTML = `<b style="color:${ch.color}">섯다 · ${ch.name}</b><span>학교 ${won(ch.unit)}</span>`;
    document.body.classList.add('playing-sutda');
    H.say(`섯다 ${ch.name}입니다`);
    syncHud();
    loop(gameId);
  }
  function leave(broke) {
    gameId++; actResolve = null; squeezeResolve = null; catchMode = false; setTension(0);
    if (T) H.setMoney(T.players[0].chips);
    document.body.classList.remove('playing-sutda', 'sd-dim');
    H.back();
    if (broke) { const got = H.aid(); H.info(`<h2>보유 머니가 부족해요</h2><p>이 채널 학교(기본 판돈)는 ${won(chan.unit)}이에요.${got ? ` 가상 머니라 지원금으로 ${won(H.getMoney())}까지 채워 드렸어요.` : ' 로비에서 더 낮은 채널로 가 보세요.'}</p>`); }
  }
  const SPEEDS = [[1, '보통'], [1.8, '빠름'], [3, '매우 빠름']];
  function syncHud() { $('sdSpeedBtn').textContent = (SPEEDS.find((x) => x[0] === sd.speed) || SPEEDS[0])[1]; $('sdHintBtn').classList.toggle('on', H.prefs.hint); }
  $('sdSpeedBtn').onclick = () => { const i = SPEEDS.findIndex((x) => x[0] === sd.speed); sd.speed = SPEEDS[(i + 1) % SPEEDS.length][0]; syncHud(); };
  $('sdHintBtn').onclick = () => { H.prefs.hint = !H.prefs.hint; syncHud(); if (actResolve) odds(); };
  $('sdExitBtn').onclick = () => { if (confirm('나가면 이번 판에 건 돈은 잃어요. 나갈까요?')) leave(false); };
  $('sdLogBtn').onclick = () => {
    const list = $('logList'); list.innerHTML = '';
    for (const l of T ? T.log.slice(-150) : []) { const d = document.createElement('div'); d.className = l.kind; d.textContent = l.text.replace(/\d{5,}/g, (m) => won(+m)); list.appendChild(d); }
    $('logPanel').classList.add('on'); list.scrollTop = list.scrollHeight;
  };
  const RULES = `<h2>섯다 족보 (높은 순)</h2><table>
    <tr><td>38광땡</td><td>3월 광 + 8월 광 · 최고의 패</td></tr><tr><td>18광땡 · 13광땡</td><td>1월 광 + 8월 광 · 1월 광 + 3월 광</td></tr>
    <tr><td>땡</td><td>같은 달 두 장 · 장땡(10) > 9땡 > … > 삥땡(1)</td></tr>
    <tr><td>알리 · 독사</td><td>1+2 · 1+4</td></tr><tr><td>구삥 · 장삥</td><td>1+9 · 1+10</td></tr><tr><td>장사 · 세륙</td><td>10+4 · 4+6</td></tr>
    <tr><td>끗</td><td>두 달을 더한 끝자리 · 갑오(9끗) > 8끗 > … > 1끗 > 망통(0)</td></tr></table>
    <h3>특수패</h3><table>
    <tr><td>땡잡이</td><td>3월 광 + 7월 열끗 · 상대가 1~9땡이면 이겨요 (아니면 망통)</td></tr>
    <tr><td>암행어사</td><td>4월 열끗 + 7월 열끗 · 13·18광땡을 잡아요 (아니면 1끗)</td></tr>
    <tr><td>구사</td><td>4 + 9 · 남은 상대가 알리 이하면 재경기</td></tr>
    <tr><td>멍텅구리구사</td><td>4월 열끗 + 9월 열끗 · 남은 상대가 9땡 이하면 재경기</td></tr></table>
    <h3>진행</h3><p>모두 학교(기본 판돈)를 내고 한 장씩 받아 베팅, 한 장 더 받아(쪼기) 다시 베팅한 뒤 패를 까요. 같은 패면 판돈을 나눠요.</p>
    <h3>밑장 잡기</h3><p>테이블에 꾼이 앉아 있으면 가끔 덱 밑에서 패를 빼요. 두 번째 장을 돌릴 때 유난히 빠르게 미끄러져 나오는 카드를 잘 보세요. 내 차례에 '밑장 잡기'를 누르고 그 사람을 고르면, 맞으면 판돈 전부와 벌금을 받고, 틀리면 벌금을 물어요. 한 판에 한 번이에요.</p>
    <p>단축키: 1~7 베팅 · Space 한 번에 까기</p>`;
  $('sdRankBtn').onclick = () => H.info(RULES);
  addEventListener('resize', () => { if (T && document.body.classList.contains('playing-sutda')) { build(); render(); } });

  window.SUTDA_UI = { enter, get T() { return T; }, answer, get waitAct() { return !!actResolve; }, get waitSqueeze() { return !!squeezeResolve; }, flip: () => { const w = document.querySelector('.scard.squeeze'); if (w && w.squeezeTo) w.squeezeTo(1); }, catchSeat: (i) => { catchMode = true; doCatch(i); }, setSpeed: (s) => (sd.speed = s), RULES };
})();
