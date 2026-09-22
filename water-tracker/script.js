(function () {
  "use strict";

  const STORAGE_KEY = "water-tracker:logs";
  const GOAL_KEY = "water-tracker:goal";
  const DEFAULT_GOAL = 2000;
  const CIRCUMFERENCE = 2 * Math.PI * 80;

  const el = {
    todayLabel: document.getElementById("today-label"),
    currentAmount: document.getElementById("current-amount"),
    goalAmount: document.getElementById("goal-amount"),
    percentLabel: document.getElementById("percent-label"),
    progressCircle: document.getElementById("progress-circle"),
    goalInput: document.getElementById("goal-input"),
    customAmount: document.getElementById("custom-amount"),
    customAddBtn: document.getElementById("custom-add-btn"),
    resetDayBtn: document.getElementById("reset-day-btn"),
    logList: document.getElementById("log-list"),
    weekChart: document.getElementById("week-chart"),
  };

  function todayKey(date = new Date()) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function loadLogs() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function saveLogs(logs) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  }

  function loadGoal() {
    const raw = localStorage.getItem(GOAL_KEY);
    const parsed = raw ? parseInt(raw, 10) : DEFAULT_GOAL;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_GOAL;
  }

  function saveGoal(goal) {
    localStorage.setItem(GOAL_KEY, String(goal));
  }

  let logs = loadLogs();
  let goal = loadGoal();

  function getTodayEntries() {
    const key = todayKey();
    if (!logs[key]) logs[key] = [];
    return logs[key];
  }

  function addEntry(amount) {
    if (!Number.isFinite(amount) || amount <= 0) return;
    const entries = getTodayEntries();
    entries.push({ amount, time: new Date().toISOString() });
    saveLogs(logs);
    render();
  }

  function removeEntry(index) {
    const entries = getTodayEntries();
    entries.splice(index, 1);
    saveLogs(logs);
    render();
  }

  function resetToday() {
    logs[todayKey()] = [];
    saveLogs(logs);
    render();
  }

  function formatTime(iso) {
    const d = new Date(iso);
    return d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
  }

  function renderHeader() {
    const now = new Date();
    el.todayLabel.textContent = now.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });
  }

  function renderProgress(totalToday) {
    el.currentAmount.textContent = totalToday;
    el.goalAmount.textContent = goal;
    const pct = Math.min(100, Math.round((totalToday / goal) * 100));
    el.percentLabel.textContent = `${pct}%`;

    const offset = CIRCUMFERENCE - (Math.min(totalToday, goal) / goal) * CIRCUMFERENCE;
    el.progressCircle.style.strokeDashoffset = String(offset);
    el.progressCircle.style.stroke = totalToday >= goal ? "#2fbf71" : "";
  }

  function renderLogList(entries) {
    el.logList.innerHTML = "";
    if (entries.length === 0) {
      const li = document.createElement("li");
      li.className = "log-empty";
      li.textContent = "아직 기록이 없어요. 물을 마셔볼까요?";
      el.logList.appendChild(li);
      return;
    }
    entries
      .map((entry, index) => ({ entry, index }))
      .reverse()
      .forEach(({ entry, index }) => {
        const li = document.createElement("li");

        const left = document.createElement("span");
        left.textContent = `💧 ${entry.amount}ml`;

        const right = document.createElement("span");
        right.style.display = "flex";
        right.style.alignItems = "center";
        right.style.gap = "8px";

        const time = document.createElement("span");
        time.className = "log-time";
        time.textContent = formatTime(entry.time);

        const removeBtn = document.createElement("button");
        removeBtn.className = "log-remove";
        removeBtn.textContent = "✕";
        removeBtn.setAttribute("aria-label", "기록 삭제");
        removeBtn.addEventListener("click", () => removeEntry(index));

        right.appendChild(time);
        right.appendChild(removeBtn);
        li.appendChild(left);
        li.appendChild(right);
        el.logList.appendChild(li);
      });
  }

  function renderWeekChart() {
    el.weekChart.innerHTML = "";
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d);
    }

    const maxAmount = Math.max(
      goal,
      ...days.map((d) => sumEntries(logs[todayKey(d)] || []))
    );

    days.forEach((d) => {
      const key = todayKey(d);
      const total = sumEntries(logs[key] || []);
      const isToday = key === todayKey();

      const wrap = document.createElement("div");
      wrap.className = "week-bar-wrap" + (isToday ? " is-today" : "");

      const bar = document.createElement("div");
      bar.className = "week-bar" + (total >= goal && total > 0 ? " goal-met" : "");
      const heightPct = maxAmount > 0 ? Math.max((total / maxAmount) * 100, total > 0 ? 4 : 0) : 0;
      bar.style.height = `${heightPct}%`;
      bar.title = `${total}ml`;

      const label = document.createElement("div");
      label.className = "week-bar-label";
      label.textContent = d.toLocaleDateString("ko-KR", { weekday: "short" });

      wrap.appendChild(bar);
      wrap.appendChild(label);
      el.weekChart.appendChild(wrap);
    });
  }

  function sumEntries(entries) {
    return entries.reduce((sum, e) => sum + e.amount, 0);
  }

  function render() {
    renderHeader();
    const entries = getTodayEntries();
    const total = sumEntries(entries);
    renderProgress(total);
    renderLogList(entries);
    renderWeekChart();
  }

  document.querySelectorAll(".quick-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      addEntry(parseInt(btn.dataset.amount, 10));
    });
  });

  el.customAddBtn.addEventListener("click", () => {
    const value = parseInt(el.customAmount.value, 10);
    if (Number.isFinite(value) && value > 0) {
      addEntry(value);
      el.customAmount.value = "";
    }
  });

  el.customAmount.addEventListener("keydown", (e) => {
    if (e.key === "Enter") el.customAddBtn.click();
  });

  el.goalInput.addEventListener("change", () => {
    const value = parseInt(el.goalInput.value, 10);
    if (Number.isFinite(value) && value > 0) {
      goal = value;
      saveGoal(goal);
      render();
    } else {
      el.goalInput.value = goal;
    }
  });

  el.resetDayBtn.addEventListener("click", () => {
    if (confirm("오늘의 기록을 모두 초기화할까요?")) {
      resetToday();
    }
  });

  el.goalInput.value = goal;
  render();
})();
