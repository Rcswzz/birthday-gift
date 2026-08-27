// ============================================================
// 礼物与配置集中在此文件
// 之后替换真实礼物：只改 GIFT_CONFIG.gifts 里的内容即可
// Formspree：注册 https://formspree.io 后新建表单，把 /f/ 后面的
// 表单 ID 填到下面 FORM_ID，朋友选择后你会收到邮件通知
// ============================================================
const GIFT_CONFIG = {
  FORM_ID: "YOUR_FORM_ID", // TODO: 替换成你的 Formspree 表单 ID

  gifts: {
    // 🌙 月亮：浪漫 / 理想 / 艺术系
    moon: [
      { id: "moon-1", name: "星空投影灯", emoji: "🌌" },
      { id: "moon-2", name: "一本诗集", emoji: "📖" },
      { id: "moon-3", name: "手绘明信片", emoji: "🎨" },
      { id: "moon-4", name: "香薰蜡烛", emoji: "🕯️" },
    ],
    // 🪙 六便士：实用 / 生活系
    penny: [
      { id: "penny-1", name: "保温杯", emoji: "☕" },
      { id: "penny-2", name: "充电宝", emoji: "🔋" },
      { id: "penny-3", name: "零食大礼包", emoji: "🍪" },
      { id: "penny-4", name: "毛绒拖鞋", emoji: "🩴" },
    ],
  },
};
