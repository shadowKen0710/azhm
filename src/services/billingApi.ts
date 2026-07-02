// 算力计价 + 支付 抽象层（可插拔）。
// 计价透明：向用户收取 = token 现金成本 × (1 + 利润率)，换算为「算力点」。
// 支付现为 mock；接 Stripe / PayPal / 支付宝 / 微信 时只替换本文件的支付实现，
// 保持 createRecharge / confirmPayment 接口不变。

// ---------- 计价常量（可配置） ----------
export const PRICING = {
  /** 基础 token 现金成本（¥ / 1K tokens）。 */
  tokenCostPer1kCNY: 0.05,
  /** 利润率（60%）。 */
  markup: 0.6,
  /** 1 算力点对应的人民币价值（¥）。 */
  creditValueCNY: 0.01,
}

/** 每 1K tokens 向用户收取的人民币（含利润）。 */
export const pricePer1kCNY =
  Math.round(PRICING.tokenCostPer1kCNY * (1 + PRICING.markup) * 100) / 100
/** 每 1K tokens 折合多少算力点（取整，避免浮点误差）。 */
export const creditsPer1k = Math.round(pricePer1kCNY / PRICING.creditValueCNY) // = 8

/** tokens → 算力点（向上取整，至少 1 点）。 */
export function tokensToCredits(tokens: number) {
  return Math.max(1, Math.ceil((tokens * creditsPer1k) / 1000))
}

/** 算力点 → 人民币（用于展示）。 */
export function creditsToCNY(credits: number) {
  return credits * PRICING.creditValueCNY
}

// ---------- 各操作的 token 估算 ----------
export type BillableOp = "voice-train" | "memory-ingest" | "dialogue"

export const OP_LABEL: Record<BillableOp, string> = {
  "voice-train": "训练声线",
  "memory-ingest": "投喂记忆",
  dialogue: "AI 陪聊",
}

/** 估算某操作消耗的 tokens。memory 随文本长度增长。 */
export function estimateTokens(op: BillableOp, textLen = 0): number {
  switch (op) {
    case "voice-train":
      return 40_000 // 声线训练是重操作
    case "memory-ingest":
      return Math.max(300, textLen * 3) // 中文约 1-2 token/字，估高一点
    case "dialogue":
      return 900 // 每次陪聊会话
  }
}

/** 某操作的算力点报价。 */
export function quoteOp(op: BillableOp, textLen = 0): number {
  return tokensToCredits(estimateTokens(op, textLen))
}

// ---------- 充值套餐 ----------
export interface RechargePackage {
  id: string
  credits: number
  amountCNY: number
  bonus?: number // 赠送算力点
}

export const RECHARGE_PACKAGES: RechargePackage[] = [
  { id: "p1", credits: 500, amountCNY: 5 },
  { id: "p2", credits: 1000, amountCNY: 10, bonus: 50 },
  { id: "p3", credits: 3000, amountCNY: 30, bonus: 300 },
  { id: "p4", credits: 10000, amountCNY: 100, bonus: 1500 },
]

export type PayMethod = "card" | "paypal" | "alipay" | "wechat"

export const PAY_METHODS: { method: PayMethod; label: string }[] = [
  { method: "card", label: "信用卡" },
  { method: "paypal", label: "PayPal" },
  { method: "alipay", label: "支付宝" },
  { method: "wechat", label: "微信支付" },
]

// ---------- 支付接口（可插拔） ----------
export interface RechargeOrder {
  orderId: string
  credits: number
  amountCNY: number
}

export interface BillingApi {
  createRecharge(pkg: RechargePackage): Promise<RechargeOrder>
  confirmPayment(
    orderId: string,
    method: PayMethod
  ): Promise<{ ok: boolean }>
}

// ---------- Mock 实现 ----------
export const mockBillingApi: BillingApi = {
  async createRecharge(pkg) {
    return {
      orderId: `order-${pkg.id}-${Date.now()}`,
      credits: pkg.credits + (pkg.bonus ?? 0),
      amountCNY: pkg.amountCNY,
    }
  },
  async confirmPayment(_orderId, _method) {
    // mock：模拟支付网关确认成功。真实实现走 Stripe/PayPal/支付宝/微信回调。
    return { ok: true }
  },
}

export const billingApi: BillingApi = mockBillingApi
