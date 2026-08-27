# 🎁 给你挑个小惊喜

给朋友的一个礼物挑选小页面：朋友先选「🌙 月亮」或「🪙 六便士」，再挑一件礼物，
页面会自动播放「装箱 → 打蝴蝶结 → 小车运输」的动画，并把选择结果邮件通知你。

纯前端、零依赖、无构建工具，可直接部署到 GitHub Pages。

## 本地预览

```bash
# 在项目目录启动静态服务器，然后浏览器打开 http://localhost:8000
python -m http.server 8000
```

## 接收选择结果（腾讯云开发 CloudBase，国内可达）

1. 打开 <https://cloud.tencent.com/> 用微信扫码登录，进入云开发控制台（<https://console.cloud.tencent.com/tcb>）。
2. 创建环境（免费版），开启「身份验证 → 匿名登录」，新建数据库集合 `gift_choice`。
3. 在「环境配置 → 安全来源 → 安全域名」里添加你的站点域名（如 `rcswzz.github.io`）。
4. 把控制台顶部的「环境 ID」（形如 `gift-xxxxxx`）填到 `config.js` 的 `BACKEND.cloudbase.envId`。

之后朋友每选一次礼物、每写一条留言，都会自动存入云端数据库 `gift_choice`，登录云开发控制台 → 数据库即可查看（含类别、礼物、留言、时间）。

## 发布到 GitHub Pages

1. 在 GitHub 新建一个仓库，把本项目代码推送上去。
2. 仓库 Settings → Pages → Build and deployment 选 `Deploy from a branch`，分支选 `main`，目录选 `/ (root)`。
3. 保存后等一两分钟，页面会给出链接（形如 `https://你的用户名.github.io/仓库名/`），把链接发给朋友即可。

## 替换成真实礼物

只改 `config.js` 里的 `GIFT_CONFIG.gifts`：

```js
gifts: {
  moon: [
    { id: "moon-1", name: "星空投影灯", emoji: "🌌" },
    // ...改成你的真实礼物，emoji 换成代表该礼物的 emoji
  ],
  penny: [
    { id: "penny-1", name: "保温杯", emoji: "☕" },
    // ...
  ],
},
```

改完推送代码，GitHub Pages 会自动更新。

## 说明

- 页面不显示价格，保持惊喜感；朋友选完一次即锁定（本机记录），刷新不会重复选择；结果页有留言区，可让朋友写一句祝福（选填）。
- 全程无外部图片/字体资源，离线也能正常打开。


