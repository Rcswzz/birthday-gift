"use strict";

// submitGift v2.0.0
// 网页 -> 云函数(自带跨域头) -> CloudBase PostgreSQL (匿名登录 + PostgREST)
// 零依赖，仅用 Node 内置 https 模块

const https = require("https");

const BASE = "https://gift-d7gwjyjj1eaa0c987.api.tcloudbasegateway.com";

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

function request(path, opts = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE + path);
    const req = https.request(
      url,
      {
        method: opts.method || "GET",
        headers: opts.headers || {},
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          let json = null;
          try { json = JSON.parse(data); } catch (e) {}
          resolve({ status: res.statusCode, json, text: data });
        });
      }
    );
    req.on("error", reject);
    if (opts.body != null) req.write(opts.body);
    req.end();
  });
}

function getMethod(event) {
  return (
    (event &&
      (event.httpMethod ||
        (event.requestContext && event.requestContext.http && event.requestContext.http.method) ||
        (event.request && event.request.method))) ||
    "POST"
  );
}

function parseBody(event) {
  let data = event || {};
  try {
    if (event && typeof event === "object" && event.body) {
      data = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
    }
  } catch (e) {}
  return data;
}

exports.main = async (event = {}, context = {}) => {
  const method = getMethod(event);
  if (method === "OPTIONS" || method === "HEAD") {
    return { statusCode: 204, headers };
  }

  const data = parseBody(event);

  try {
    // 1) 匿名登录，获取 access_token
    const deviceId = "fn-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
    const login = await request("/auth/v1/signin/anonymously", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-device-id": deviceId },
      body: "{}",
    });
    const token = login.json && login.json.access_token;
    if (!token) {
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({ ok: false, error: "anonymous login failed", detail: login.text }),
      };
    }

    // 2) 写入数据库（列名与表结构一致：小写下划线）
    const body = JSON.stringify({
      type: data.type || "gift",
      category: data.category || "",
      gift_id: data.giftId || "",
      gift_name: data.giftName || "",
      message: data.message || "",
      submitted_at: data.submittedAt || new Date().toISOString(),
    });
    const ins = await request("/v1/rdb/rest/gift_choice?select=id", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body,
    });

    if (ins.status >= 200 && ins.status < 300) {
      const id = ins.json && Array.isArray(ins.json) && ins.json[0] ? ins.json[0].id : null;
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, id }) };
    }

    return {
      statusCode: 502,
      headers,
      body: JSON.stringify({ ok: false, error: "insert failed: " + ins.status, detail: ins.text }),
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ ok: false, error: e.message }),
    };
  }
};