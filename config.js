// ============================================================
// 礼物与后台配置集中在此文件
// 替换礼物：只改 gifts 里的内容
// 后台接收：在 BACKEND 里填 Bmob 或 Formspree 的密钥即可
// ============================================================
const GIFT_CONFIG = {
  BACKEND: {
    // 国内首选：Bmob（https://www.bmob.cn）注册后创建应用，
    // 在「设置 → 应用密钥」里复制 Application ID 和 REST API Key 填进来
    bmob: {
      appId: "", // TODO: Bmob Application ID
      key: "",   // TODO: Bmob REST API Key
    },
    // 备选：Formspree（海外，国内网络可能打不开）
    formspree: {
      formId: "", // TODO: Formspree 表单 ID
    },
  },

  gifts: {
    // 🌙 月亮 · 浪漫型
    moon: [
      { id: "moon-1", name: "胶卷相机", emoji: "📷" },
      { id: "moon-2", name: "钢笔", emoji: "🖊️" },
      { id: "moon-3", name: "泡泡玛特盲盒", emoji: "🎁" },
      { id: "moon-4", name: "护照夹", emoji: "🛂" },
    ],
    // 🪙 六便士 · 实用型
    penny: [
      { id: "penny-1", name: "旅行枕", emoji: "😴" },
      { id: "penny-2", name: "颈部按摩仪", emoji: "💆" },
      { id: "penny-3", name: "养生茶包", emoji: "🍵" },
      { id: "penny-4", name: "磁吸充电宝", emoji: "🔋" },
    ],
  },
};
