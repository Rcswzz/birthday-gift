/* ============================================================
   生日礼物挑选页 · 交互逻辑
   状态机：intro → welcome → list → anim → result(+留言)
   ============================================================ */
(() => {
  "use strict";

  const CATEGORY_META = {
    moon:  { emoji: "🌙", label: "月亮" },
    penny: { emoji: "🪙", label: "六便士" },
  };

  const CHOICE_KEY = "giftChoice";
  const SENT_KEY = "giftSent";
  const MSG_KEY = "giftMsgSent";

  const state = {
    category: null,
    giftId: null,
    giftName: null,
    sent: localStorage.getItem(SENT_KEY) === "1",
    msgSent: localStorage.getItem(MSG_KEY) === "1",
    submitting: false,
  };

  const $ = (sel) => document.querySelector(sel);

  const views = {
    intro: $("#view-intro"),
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

  /* ---------- 数据提交（Formspree） ---------- */

  async function postToFormspree(payload) {
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
      return true;
    } catch (err) {
      // 网络失败或表单 ID 未配置：界面会给出重试
      console.error("提交失败:", err);
      return false;
    } finally {
      clearTimeout(timeout);
    }
  }

  async function sendChoice() {
    const ok = await postToFormspree({
      type: "gift",
      category: state.category,
      giftId: state.giftId,
      giftName: state.giftName,
      submittedAt: new Date().toISOString(),
    });
    if (ok) {
      state.sent = true;
      localStorage.setItem(SENT_KEY, "1");
    }
  }

  /* ---------- ① 开场铺垫 ---------- */

  $("#btn-start").addEventListener("click", () => showView("welcome"));

  /* ---------- ② 选风格 ---------- */

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

  /* ---------- ③ 礼物列表 ---------- */

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

  /* ---------- ④ 动画 ---------- */

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

  /* ---------- ⑤ 结果页 + 留言 ---------- */

  function showResult() {
    const stored = readStoredChoice();
    const giftName = state.giftName || (stored && stored.giftName);

    $("#result-emoji").textContent = state.sent ? "🎉" : "🎁";
    $("#result-title").textContent = state.sent ? "收到啦！" : "你已经选好啦";
    $("#result-sub").textContent = state.sent
      ? "期待它到你手上 · It's coming to you!"
      : "刚才没送出去 · Something went wrong";

    $("#result-gift").textContent = giftName ? "你选的是：" + giftName : "";

    const retry = $("#btn-retry");
    retry.hidden = state.sent;
    retry.disabled = false;

    renderMessageBox();
    showView("result");
  }

  $("#btn-retry").addEventListener("click", async () => {
    const retry = $("#btn-retry");
    retry.disabled = true;
    state.submitting = false;
    await sendChoice();
    showResult();
  });

  /* 留言区 */
  function renderMessageBox() {
    const box = $("#message-box");
    const status = $("#msg-status");
    const input = $("#msg-input");
    const btn = $("#btn-send-msg");

    if (state.msgSent) {
      status.textContent = "💌 已送达，你的祝福我会转达！";
      status.className = "msg-status";
      status.hidden = false;
      input.disabled = true;
      btn.disabled = true;
      btn.textContent = "已送出 ✓";
    } else {
      status.hidden = true;
      input.disabled = false;
      btn.disabled = false;
      btn.textContent = "送出祝福 💌";
    }
  }

  $("#btn-send-msg").addEventListener("click", async () => {
    const input = $("#msg-input");
    const status = $("#msg-status");
    const msg = input.value.trim();
    const btn = $("#btn-send-msg");

    if (!msg) {
      status.textContent = "先写点祝福再送出吧 ✏️";
      status.className = "msg-status error";
      status.hidden = false;
      return;
    }

    btn.disabled = true;
    const ok = await postToFormspree({
      type: "message",
      category: state.category,
      giftId: state.giftId,
      giftName: state.giftName,
      message: msg,
      submittedAt: new Date().toISOString(),
    });

    if (ok) {
      state.msgSent = true;
      localStorage.setItem(MSG_KEY, "1");
      status.textContent = "💌 已送达，你的祝福我会转达！";
      status.className = "msg-status";
      status.hidden = false;
      input.disabled = true;
      btn.textContent = "已送出 ✓";
    } else {
      status.textContent = "没送出去，再试一次";
      status.className = "msg-status error";
      status.hidden = false;
      btn.disabled = false;
    }
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
    showView("intro");
  })();
})();
