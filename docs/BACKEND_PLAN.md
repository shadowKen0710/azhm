# 后端方案 · 接真实 Claude API + 真实计费对话

> 目标：让「患者与 AI 家人对话」由真实大模型（Claude）生成，并按**实际消耗的 token** 计费（沿用 `token 现金成本 × 1.6` 的算力点规则）。本文件是方案，不含代码改动。

---

## 0. 结论先行

- **浏览器不能直接调 Claude API**：API key 不能进前端，且 Anthropic 不支持带 key 的浏览器跨域调用。必须有一个**后端代理**持有 key。
- 当前 app 是 GitHub Pages 静态站，**跑不了后端**。方案 = 前端保持 Pages，新增一个**独立的 serverless 函数**做代理；或整站迁到 Vercel/Netlify（同源，免 CORS）。
- 现有 `companionApi`（可插拔接口）就是接入点：**只替换 `services/companionApi.ts` 的实现**，上层记忆库/对话页/钱包零改动。
- 计费从「按估算 token」升级为「**按后端返回的真实 usage**」——钱包加一个 `chargeByTokens()`。
- 语音克隆（`voiceApi`）与支付（`billingApi`）**仍保持 mock**，本方案只做对话。

---

## 1. 架构

```
患者对话页 (Talk.tsx)
   │  companionApi.generateReply(ctx)   ← 接口不变
   ▼
services/companionApi.ts  (real 实现，读 VITE_COMPANION_API=real)
   │  POST {BACKEND_URL}/companion/reply   { memberName, relation, memories, history, disclose }
   ▼
后端代理 (serverless, 持有 ANTHROPIC_API_KEY)
   │  @anthropic-ai/sdk → client.messages.create({ model: "claude-opus-4-8", ... })
   ▼
Claude API → { text, usage:{ input_tokens, output_tokens, cache_read_input_tokens } }
   │
   ▼  返回 { text, usage }
前端：wallet.chargeByTokens("dialogue", usage) 按真实 token × 1.6 扣算力点
```

**关键点**：token 计量以后端返回的真实 `usage` 为准，不再用前端估算。

---

## 2. 部署形态（需你选一个）

| 选项 | 说明 | CORS | 适合 |
|---|---|---|---|
| **A. Cloudflare Workers**（推荐） | 前端仍在 Pages；Worker 单独部署做 `/companion/*` 代理。免费额度足够 POC。 | 需配 | 想保留现有 Pages 部署、改动最小 |
| **B. Vercel / Netlify 整站迁移** | 静态 + serverless functions 同源托管，无 CORS；但要把部署从 Pages 换过去 | 免 | 想要同源、后续要更多后端能力 |
| **C. 自有 Node 服务 / VPS** | 完整控制，可加数据库/鉴权 | 需配 | 已有服务器、要接真实用户体系 |

**推荐 A**：保留现有 GitHub Pages 自动部署不动，只加一个 Worker。需要你提供：Cloudflare 账号 + `ANTHROPIC_API_KEY`（配为 Worker Secret，绝不进前端）。

---

## 3. 后端接口契约

`POST {BACKEND_URL}/companion/reply`

请求：
```jsonc
{
  "memberName": "小雯",
  "relation": "女儿",
  "disclose": true,                 // 是否 AI 声线（决定是否在文案层面明示）
  "memories": [                     // 该家人的记忆片段（作为上下文）
    { "tag": "childhood", "title": "夏夜的萤火虫", "text": "..." }
  ],
  "history": [                      // 本次对话已有轮次
    { "who": "ai", "text": "..." },
    { "who": "patient", "text": "..." }
  ]
}
```

响应：
```jsonc
{
  "text": "爸，是我呀……",
  "usage": { "input_tokens": 812, "output_tokens": 96, "cache_read_input_tokens": 640 },
  "flaggedSensitive": false         // 后端可做敏感话题判定
}
```

后端实现要点（`@anthropic-ai/sdk`）：
- `client.messages.create({ model, max_tokens: 512, system, messages })`，非流式即可（对话短，`usage` 干净）。
- **system prompt** 注入：家人身份/称呼 + 记忆片段 + 怀旧疗法指令 + **敏感话题守护**（患者说"想出门/难受/找不到家"时先安抚、不胡编、置 `flaggedSensitive`）+（可选）AI 明示。
- 记忆片段放在 system 里靠前、稳定处，配 `cache_control`（prompt caching 降本，`cache_read_input_tokens` 会体现）。
- 读 `response.usage` 原样回传给前端。

---

## 4. 模型与真实定价（供计价对齐）

| 模型 | ID | 输入 $/1M | 输出 $/1M | 折算（¥7.2/$，×1.6，1点=¥0.01） |
|---|---|---|---|---|
| **Opus 4.8**（最强，默认） | `claude-opus-4-8` | $5 | $25 | ≈ 5.8 点/1K 输入 · 28.8 点/1K 输出 |
| Sonnet 4.6（均衡） | `claude-sonnet-4-6` | $3 | $15 | ≈ 3.5 点/1K 输入 · 17.3 点/1K 输出 |
| Haiku 4.5（最省） | `claude-haiku-4-5` | $1 | $5 | ≈ 1.2 点/1K 输入 · 5.8 点/1K 输出 |

- 默认用 **Opus 4.8**（最有"人味"、最能自然织入回忆）。但这是**面向消费者的高频陪聊**，成本敏感——**Sonnet 4.6 或 Haiku 4.5 能把每次对话成本降到 1/3～1/5**，是否降级由你的商业决策定。
- **计价升级**：现 `billingApi.PRICING` 是单一 ¥0.05/1K 平均价。真实计费应区分**输入价/输出价**、并按所选模型的真实单价（上表）×1.6。`estimateTokens` 保留给"预估显示"，实际扣费用后端 `usage`。

**一次对话成本示例**（Opus 4.8，含记忆约 800 输入 + 100 输出，缓存命中后输入多为 cache-read≈0.1×）：首轮约 ~30 点（¥0.30），后续缓存命中约 ~5–8 点/轮。Haiku 则约 1–2 点/轮。

---

## 5. 前端改动（小而集中）

1. `services/companionApi.ts` 新增 `realCompanionApi`（`fetch` 后端），用 `VITE_COMPANION_API=real|mock` + `VITE_COMPANION_URL` 切换；默认 `mock`（线上 Pages 演示不变）。
2. `state/wallet.tsx` 加 `chargeByTokens(op, usage)`：按真实输入/输出 token × 各自单价 → 算力点，写流水（流水里已可显示 tokens）。
3. `Talk.tsx`：`generateReply` 已是 async，改为真实调用后，用返回的 `usage` 调 `chargeByTokens`（替换现在的 `chargeBestEffort` 估算扣费）；`flaggedSensitive` 用于对话记录标记。
4. `.env` 增加 `VITE_COMPANION_URL`；`.gitignore` 忽略本地 env。

对话页四态、记忆织入、AI 明示、敏感守护——**交互与 UI 全不变**，只是内容变真实。

---

## 6. 安全与隐私（务必）

- **API key 只在后端**（Worker Secret / 环境变量），永不进前端包。
- **数据出境同意**：记忆片段含真实家庭隐私，发给 Claude = 数据离开本机。需在 UI 增加一次**明确同意**（"开启真实 AI 对话会将你录入的回忆发送到 AI 服务生成回复"），与声线授权同级别；不同意则回落 mock。
- **后端最小化**：只转发必要字段；不落库存储对话（或明确告知并加保留期）。
- **限流**：后端按来源/会话限流，防刷（真实 token 花真钱）。
- **CORS**：Worker 只允许你的 Pages 域名。

---

## 7. 实施步骤（分阶段，可中断）

1. **计价改造**：`billingApi` 拆分输入/输出单价 + 选定模型；`wallet.chargeByTokens()`。（纯前端，可先做、可测）
2. **后端代理**：Cloudflare Worker + `@anthropic-ai/sdk`，实现 `/companion/reply`，配 key/CORS/限流；本地 `wrangler dev` 联调。
3. **前端接线**：`realCompanionApi` + feature flag + 同意开关；`Talk` 用真实 usage 扣费。
4. **验证**：本地起 Worker + dev server，患者与"小雯"对话 → 真实回复引用记忆 → 钱包按真实 token 扣减、流水显示 tokens。
5. **上线**：Worker 部署（生产 key）；前端 `VITE_COMPANION_URL` 指向 Worker；Pages 默认仍可 mock，真实对话通过 flag 开启。
6. e2e：真实链路用 msw/mock 后端跑（避免测试真花钱）；保留一条"真实冒烟"手测脚本。

---

## 8. 风险

- **真金白银**：每次对话消耗真实 token。必须先有余额校验 + 限流，避免超支。
- **延迟**：真实模型比 mock 慢（数百 ms–数秒）；对话页"正在接通/聆听"动画已能覆盖。
- **隐私合规**：家庭回忆是敏感数据，出境需同意 + 明确保留策略。
- **可用性**：后端/网络故障时，患者端**必须温和退化**（已有"信号不太好"回退）——真实实现失败要 catch 并回落，绝不给患者报错。
- **成本波动**：Opus 高频陪聊费用可观；上线前用 `count_tokens` 或小样本压测真实 token 量，据此定价/选模型/设限流。
- **模型选择是业务决策**：默认 Opus 4.8 最佳体验；若走量，Sonnet/Haiku 显著降本——需你拍板。

---

## 9. 明确仍不做

- ❌ 真实语音克隆 / TTS（`voiceApi` 仍 mock）——本方案只做**文本对话**由 Claude 生成；真声线仍需 GPT-SoVITS 后端（另案）。
- ❌ 真实支付扣款（`billingApi.confirmPayment` 仍 mock）——本方案做**真实用量计费**（扣算力点），但充值仍是模拟结账。
- ❌ 真实账号体系（仍前端 mock 登录）——后端如需按用户计费，需配合真实鉴权（另案）。

---

## 10. 需要你确认的输入

1. **部署形态**：A（Cloudflare Worker，推荐）/ B（迁 Vercel）/ C（自有服务器）？
2. **模型**：Opus 4.8（默认最佳）/ Sonnet 4.6 / Haiku 4.5（最省）？
3. **key 与账号**：能否提供 `ANTHROPIC_API_KEY` + 所选平台账号？
4. **同意文案**：数据出境同意的措辞是否按上面 §6 的写法？

确认后我按 §7 分阶段实现，第 1 步（计价改造）可立即先做且不依赖后端。
