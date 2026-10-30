// First-launch notice shared by the 2D and 3D pages: what the game does and doesn't do (no payments, ads,
// accounts or data collection), the recommended age, and the licences of everything bundled.
// Only a single "seen" flag is stored, in this browser; no age or birth date is kept.
(() => {
  const KEY = 'ganghonanse-notice-v1';
  const css = `
  #gh-notice { position: fixed; inset: 0; z-index: 999; display: flex; align-items: center; justify-content: center; padding: 16px; box-sizing: border-box;
    background: rgba(8, 8, 12, .86); font-family: 'Noto Sans KR', 'Apple SD Gothic Neo', 'Malgun Gothic', system-ui, sans-serif; color: #f4efe6; }
  #gh-notice .box { width: min(560px, 100%); max-height: 100%; overflow-y: auto; background: #1d1a22; border: 1px solid #6a5a3a; border-radius: 16px; padding: 20px 22px; box-sizing: border-box; line-height: 1.6; }
  #gh-notice h2 { margin: 0 0 10px; font-size: 20px; color: #ffd98a; }
  #gh-notice ul { margin: 0 0 12px; padding-left: 20px; font-size: 14px; }
  #gh-notice li { margin: 4px 0; }
  #gh-notice .age { display: inline-block; background: #2f6a3a; color: #fff; font-weight: 900; border-radius: 6px; padding: 0 6px; }
  #gh-notice .row { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px; }
  #gh-notice button { font: inherit; font-weight: 700; border-radius: 12px; padding: 10px 14px; cursor: pointer; border: 1px solid #ffe3a0; background: linear-gradient(180deg, #e8b24a, #b07a22); color: #1b1206; }
  #gh-notice button.ghost { background: transparent; color: #f4efe6; border-color: rgba(255,255,255,.3); }
  #gh-notice details { margin-top: 12px; font-size: 12px; opacity: .9; }
  #gh-notice summary { cursor: pointer; font-weight: 700; }
  #gh-notice .kid { display: none; margin-top: 10px; font-size: 14px; color: #ffd0a0; }`;
  const html = `<div class="box" role="dialog" aria-modal="true" aria-labelledby="gh-notice-t">
    <h2 id="gh-notice-t">시작하기 전에</h2>
    <ul>
      <li><b>무료 게임이에요.</b> 현금 결제, 광고, 회원가입이 없어요.</li>
      <li>개인정보를 모으거나 외부로 보내지 않아요. 기록은 이 기기의 브라우저에만 저장돼요.</li>
      <li>은자·장비 상자·기물 뽑기는 게임 안에서만 얻고 쓰는 재화예요. 현금으로 사거나 현금으로 바꿀 수 없어요. 뽑기 확률은 뽑기 화면에 표시돼요.</li>
      <li>칼싸움·요괴 퇴치 같은 판타지 폭력 표현(피 표현 포함)이 있어 <span class="age">만 12세 이상</span>에게 권해요.</li>
      <li>등장하는 인물·문파·요괴는 무협 장르와 옛이야기에서 따온 지어낸 것으로, 실제나 특정 작품과 관계없어요.</li>
    </ul>
    <div class="row">
      <button id="gh-ok">만 12세 이상이에요 · 시작</button>
      <button id="gh-kid" class="ghost">만 12세 미만이에요</button>
    </div>
    <div class="kid" id="gh-kidmsg">보호자와 함께 이용해 주세요. 보호자가 내용을 확인했다면 아래 버튼을 눌러 주세요.
      <div class="row"><button id="gh-guard">보호자가 확인했어요 · 시작</button></div></div>
    <details><summary>저작권·라이선스</summary>
      <p>게임 코드와 도트 그림(협객·요괴·아이콘·소품)은 이 프로젝트에서 직접 만든 창작물이에요(도트 그림은 <code>tools/</code>의 생성 스크립트로 그림). 효과음과 음악은 브라우저에서 실시간으로 합성해서 음원 파일을 쓰지 않아요.</p>
      <p><b>3D 캐릭터 모델</b>: Quaternius (quaternius.com), CC0 1.0 퍼블릭 도메인. 색·장비는 이 게임에서 바꿨어요.</p>
      <p><b>글꼴</b>: 고운바탕(The Gowun Batang Project Authors), Noto Sans KR(Google·Adobe), 나눔손글씨 붓(NHN Corporation)을 줄인 사본 'GH Brush'. 모두 SIL Open Font License 1.1 (fonts/OFL-*.txt).</p>
      <p><b>라이브러리</b>: three.js © 2010-2023 Three.js Authors (MIT), meshoptimizer © 2016-2022 Arseny Kapoulkine (MIT). 전체 고지: THIRD_PARTY_NOTICES.md</p>
    </details>
  </div>`;
  function show(force) {
    let seen = null;
    try { seen = localStorage.getItem(KEY); } catch (e) { /* storage unavailable */ }
    if (seen && !force) return;
    const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    const el = document.createElement('div'); el.id = 'gh-notice'; el.innerHTML = html;
    document.body.appendChild(el);
    // keep game hotkeys (Space, Enter…) from firing underneath while the notice is up
    const block = (e) => { if (e.key !== 'Tab') e.stopImmediatePropagation(); };
    window.addEventListener('keydown', block, true);
    const done = () => { try { localStorage.setItem(KEY, '1'); } catch (e) { /* storage unavailable */ } window.removeEventListener('keydown', block, true); el.remove(); st.remove(); };
    el.querySelector('#gh-ok').onclick = done;
    el.querySelector('#gh-guard').onclick = done;
    el.querySelector('#gh-kid').onclick = () => { el.querySelector('#gh-kidmsg').style.display = 'block'; };
  }
  window.ghNotice = () => show(true);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => show(false)); else show(false);
})();
