// ============================================================
// 礼物与后台配置集中在此文件
// 替换礼物：只改 gifts 里的内容
// 后台接收：在 BACKEND 里填 Bmob 或 Formspree 的密钥即可
// ============================================================
const GIFT_CONFIG = {
  BACKEND: {
    // 首选：腾讯云开发 CloudBase（微信扫码注册，国内可达）
    // 控制台创建环境后，把顶部「环境 ID」（形如 gift-xxxxxx）填进来
    cloudbase: {
      envId: "gift-d7gwjyjj1eaa0c987",
      restBase: "https://gift-d7gwjyjj1eaa0c987.api.tcloudbasegateway.com",
      functionUrl: "https://gift-d7gwjyjj1eaa0c987-1476106106.ap-shanghai.app.tcloudbase.com/submitGift",
    },
    // 备选：Bmob（国内 BaaS）
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




