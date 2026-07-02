# 守护 · AI 陪聊后端（Cloudflare Worker）

把患者对话请求转发给 Claude（Haiku 4.5），注入家人身份 + 记忆 + 怀旧/敏感守护，
返回文本与真实 token 用量。前端按真实用量计费（`chargeByUsage`）。

契约与整体方案见 [`../docs/BACKEND_PLAN.md`](../docs/BACKEND_PLAN.md)。

## 部署（拿到 Anthropic API key + Cloudflare 账号后）

```bash
cd worker
npm install
npx wrangler login                      # 登录 Cloudflare
npx wrangler secret put ANTHROPIC_API_KEY   # 粘贴你的 key（不进代码/仓库）
# 按需把 wrangler.toml 的 ALLOWED_ORIGIN 改成你的前端域名
npm run deploy                          # 得到 https://azhm-companion.<subdomain>.workers.dev
```

## 本地联调（不部署也能测）

```bash
cd worker
npm install
echo 'ANTHROPIC_API_KEY = "sk-ant-..."' > .dev.vars   # 本地密钥，勿提交
npm run dev                              # http://localhost:8787
```

## 前端接线

前端真实对话默认关闭；启用 = 配置后端地址 + 看护者同意（设置页「真实 AI 对话」开关）。

- 后端地址：构建期设 `VITE_COMPANION_URL`，或运行时 `localStorage['azhm.companion.url']`。
- 同意：设置 →「安全与声线」→「真实 AI 对话」开关（写 `localStorage['azhm.companion.consent']`）。

两者齐备后，患者对话页自动改用真实 Claude 回复并按真实 token 计费；否则回落 mock。

## 契约

`POST {url}/companion/reply`
```jsonc
// 请求
{ "memberName":"小雯","relation":"女儿","disclose":true,"turnIndex":0,
  "memories":[{"tag":"childhood","title":"夏夜的萤火虫","text":"..."}] }
// 响应
{ "text":"...","flaggedSensitive":false,
  "usage":{"inputTokens":812,"outputTokens":96,"cacheReadInputTokens":640} }
```
