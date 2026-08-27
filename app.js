/* ============================================================
   礼物挑选页 · 交互逻辑
   状态机：welcome → list → anim → result
   ============================================================ */
(() => {
  "use strict";

  const CATEGORY_META = {
    moon:  { emoji: "🌙", label: "月亮" },
    penny: { emoji: "🪙", label: "六便士" },
  };

  const CHOICE_KEY = "giftChoice";
  const SENT_KEY = "giftSent";

  const state = {
    category: null,
    giftId: null,
    giftName: null,
    sent: localStorage.getItem(SENT_KEY) === "1",
    submitting: false,
  };

  const $ = (sel) => document.querySelector(sel);

  const views = {
    welcome: $("#view-welcome"),
    list: $("#view-list"),
    anim: $("#view-anim"),
    result: $("#view-result"),
  };

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 视图切换 ---------- */

  function showView(name) {
    Object.entries(views).forEach(([key, el]) => {
      const active = key === name;
      el.classList.toggle("active", active);
      el.hidden = !active;
    });
    window.scrollTo(0, 0);
  }

  /* ---------- 本地持久化 ---------- */

  function readStoredChoice() {
    try {
      const raw = localStorage.getItem(CHOICE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function lockChoice() {
    localStorage.setItem(
      CHOICE_KEY,
      JSON.stringify({
        category: state.category,
        giftId: state.giftId,
        giftName: state.giftName,
      })
    );
  }

  /* ---------- ① 开场 ---------- */

  document.querySelectorAll(".choice-card").forEach((card) => {
    card.addEventListener("click", () => openList(card.dataset.category));
  });

  function openList(category) {
    state.category = category;
    state.giftId = null;
    document.body.dataset.cat = category;
    $("#list-title").textContent =
      "你选了" + CATEGORY_META[category].emoji + " " + CATEGORY_META[category].label;
    renderGifts(category);
    showView("list");
  }

  /* ---------- ② 礼物列表 ---------- */

  function renderGifts(category) {
    const grid = $("#gift-grid");
    grid.innerHTML = "";
    GIFT_CONFIG.gifts[category].forEach((gift, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "gift-card";
      btn.style.setProperty("--i", i);
      btn.innerHTML =
        '<span class="gift-emoji" aria-hidden="true">' + gift.emoji +
        "</span><span class=\"gift-name\">" + gift.name + "</span>";
      btn.addEventListener("click", () => selectGift(btn, gift));
      grid.appendChild(btn);
    });
    $("#btn-confirm").disabled = true;
  }

  function selectGift(btn, gift) {
    document.querySelectorAll(".gift-card").forEach((c) => c.classList.remove("selected"));
    btn.classList.add("selected");
    state.giftId = gift.id;
    state.giftName = gift.name;
    $("#btn-confirm").disabled = false;
  }

  $("#btn-back").addEventListener("click", () => {
    state.giftId = null;
    state.giftName = null;
    showView("welcome");
  });

  $("#btn-confirm").addEventListener("click", () => {
    if (!state.giftId || state.submitting) return;
    state.submitting = true;
    lockChoice();
    sendChoice();      // 并行提交
    playAnimation();   // 播放动画
  });

  /* ---------- 数据提交（Formspree） ---------- */

  async function sendChoice() {
    const payload = {
      category: state.category,
      giftId: state.giftId,
      giftName: state.giftName,
      submittedAt: new Date().toISOString(),
    };
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const res = await fetch("https://formspree.io/f/" + GIFT_CONFIG.FORM_ID, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      state.sent = true;
      localStorage.setItem(SENT_KEY, "1");
    } catch (err) {
      // 网络失败或表单 ID 未配置：结果页会显示重试
      console.error("提交失败:", err);
    } finally {
      clearTimeout(timeout);
    }
  }

  /* ---------- ③ 动画 ---------- */

  const PHASES = [
    { cls: "phase-pop",       at: 0,    caption: "正在打包你的礼物…" },
    { cls: "phase-item",      at: 900 },
    { cls: "phase-lid",       at: 1800 },
    { cls: "phase-bow",       at: 2500 },
    { cls: "phase-sparkle",   at: 2600 },
    { cls: "phase-truck-in",  at: 3400, caption: "小车出发啦！" },
    { cls: "phase-load",      at: 4400 },
    { cls: "phase-truck-out", at: 5300, caption: "礼物在路上…" },
  ];
  const ANIM_END = 6600;

  let animTimers = [];

  function playAnimation() {
    const stage = $("#view-anim");
    const gift = (GIFT_CONFIG.gifts[state.category] || []).find(
      (g) => g.id === state.giftId
    );
    $("#anim-gift").textContent = gift ? gift.emoji : "🎁";
    $("#stage-caption").textContent = "正在打包你的礼物…";

    // 清掉上一轮的定时器与阶段类
    animTimers.forEach(clearTimeout);
    animTimers = [];
    PHASES.forEach((p) => stage.classList.remove(p.cls));

    showView("anim");

    if (reducedMotion) {
      animTimers.push(setTimeout(showResult, 600));
      return;
    }

    PHASES.forEach((p) => {
      animTimers.push(
        setTimeout(() => {
          stage.classList.add(p.cls);
          if (p.caption) $("#stage-caption").textContent = p.caption;
        }, p.at)
      );
    });
    animTimers.push(setTimeout(showResult, ANIM_END));
  }

  /* ---------- ④ 结果页 ---------- */

  function showResult() {
    const stored = readStoredChoice();
    const giftName = state.giftName || (stored && stored.giftName);

    $("#result-emoji").textContent = state.sent ? "🎉" : "🎁";
    $("#result-title").textContent = state.sent ? "收到啦！" : "你已经选好啦";
    $("#result-sub").textContent = state.sent ? "期待它到你手上" : "刚才没送出去";
    $("#result-gift").textContent = giftName ? "你选的是：" + giftName : "";

    const retry = $("#btn-retry");
    retry.hidden = state.sent;
    retry.disabled = false;
    showView("result");
  }

  $("#btn-retry").addEventListener("click", async () => {
    const retry = $("#btn-retry");
    retry.disabled = true;
    await sendChoice();
    showResult();
  });

  /* ---------- 启动 ---------- */

  (function init() {
    const stored = readStoredChoice();
    if (stored) {
      state.category = stored.category;
      state.giftId = stored.giftId;
      state.giftName = stored.giftName;
      showResult();
      return;
    }
    showView("welcome");
  })();
})();

