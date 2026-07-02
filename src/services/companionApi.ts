// AI 陪伴对话 API 抽象层（可插拔）。
// 现为 mock：把看护者投喂的「记忆片段」织入对话，模拟基于共同回忆的陪聊。
// 日后接真实 LLM（Claude API / 本地模型）时，只需替换本文件实现，保持接口不变：
//   ingestMemory(memberId, memory)  → 记忆入库/向量化（真实为写入知识库）
//   generateReply(ctx)              → 基于记忆 + 对话历史生成回复
//                                     （真实为调用 LLM，system 注入记忆作为上下文）

export interface MemoryPiece {
  id: string
  memberId: string
  title: string
  text: string
  tag: MemoryTag
  hasAudio: boolean
  createdAt: number
}

export type MemoryTag = "childhood" | "daily" | "milestone" | "place" | "other"

export interface ReplyContext {
  memberName: string
  relation: string
  memories: MemoryPiece[]
  turnIndex: number // 第几轮 AI 发言
  patientSaid?: string
  disclose?: boolean // 是否 AI 声线（true=AI 模拟；false=真人来电）
}

import type { TokenUsage } from "@/services/billingApi"

export interface ReplyResult {
  text: string
  usedMemoryId?: string
  usage?: TokenUsage // 真实后端返回；mock 无
  flaggedSensitive?: boolean
}

export interface CompanionApi {
  ingestMemory(memberId: string, memory: MemoryPiece): Promise<void>
  generateReply(ctx: ReplyContext): Promise<ReplyResult>
}

// ---------- Mock 实现 ----------
export const mockCompanionApi: CompanionApi = {
  async ingestMemory() {
    // mock：记忆已由 store 持有，这里模拟“学习入库”，无副作用。
  },

  async generateReply(ctx) {
    const { memberName, relation, memories, turnIndex } = ctx

    // 开场白：优先用最近投喂的一段回忆（feed → 陪聊闭环最直观）
    if (turnIndex === 0) {
      if (memories.length === 0) {
        return {
          text: `是我呀，${memberName}。今天感觉怎么样？我一直想着你。`,
        }
      }
      const m = memories[memories.length - 1]
      return {
        text: `是我呀，${memberName}。我刚想起${memoryLead(m)}——${m.text}你还记得吗？`,
        usedMemoryId: m.id,
      }
    }

    // 后续：换一段更早的回忆继续聊
    if (memories.length > 0) {
      const m = memories[(memories.length - 1 - turnIndex + memories.length * 9) % memories.length]
      return {
        text: `${gentleAck()}还有啊，${m.text}那时候真好。我们以后常这样聊聊，好不好？`,
        usedMemoryId: m.id,
      }
    }

    // 无记忆时的通用暖场
    void relation
    return { text: "没关系，慢慢来。我陪着你，想到什么都可以跟我说。" }
  },
}

function memoryLead(m: MemoryPiece) {
  switch (m.tag) {
    case "childhood":
      return "小时候的事"
    case "daily":
      return "我们平常一起做的事"
    case "milestone":
      return "那件大事"
    case "place":
      return "我们一起去过的地方"
    default:
      return "一件事"
  }
}

function gentleAck() {
  return "嗯，我懂。"
}

// ---------- 真实实现（Cloudflare Worker 代理 → Claude）----------
// 见 docs/BACKEND_PLAN.md。后端契约：POST {url}/companion/reply
//   → { text, usage:{inputTokens,outputTokens,cacheReadInputTokens?}, flaggedSensitive }
export const realCompanionApi: CompanionApi = {
  async ingestMemory() {
    // 记忆仍由前端 store 持有并随每次请求发给后端；此处无副作用。
  },

  async generateReply(ctx) {
    const url = companionUrl()
    if (!url) throw new Error("companion backend not configured")
    const res = await fetch(`${url.replace(/\/$/, "")}/companion/reply`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        memberName: ctx.memberName,
        relation: ctx.relation,
        disclose: ctx.disclose ?? true,
        turnIndex: ctx.turnIndex,
        memories: ctx.memories.map((m) => ({
          tag: m.tag,
          title: m.title,
          text: m.text,
        })),
      }),
    })
    if (!res.ok) throw new Error(`companion backend ${res.status}`)
    const data = (await res.json()) as ReplyResult
    return data
  },
}

// ---------- 配置 / 同意 / 解析 ----------
// 真实对话需同时满足：配置了后端地址 + 看护者已同意数据出境。
// 地址来源：localStorage 覆盖（便于配置/测试）→ 构建期 VITE_COMPANION_URL。
const URL_KEY = "azhm.companion.url"
const CONSENT_KEY = "azhm.companion.consent"

export function companionUrl(): string {
  try {
    const local = localStorage.getItem(URL_KEY)
    if (local) return local
  } catch {
    /* ignore */
  }
  return (import.meta.env.VITE_COMPANION_URL as string | undefined) ?? ""
}

export function isCompanionConfigured(): boolean {
  return companionUrl().length > 0
}

export function isCompanionConsented(): boolean {
  try {
    return localStorage.getItem(CONSENT_KEY) === "1"
  } catch {
    return false
  }
}

export function setCompanionConsent(on: boolean) {
  try {
    if (on) localStorage.setItem(CONSENT_KEY, "1")
    else localStorage.removeItem(CONSENT_KEY)
  } catch {
    /* ignore */
  }
}

/** 真实对话是否可用（已配置后端 + 已同意）。 */
export function realCompanionEnabled(): boolean {
  return isCompanionConfigured() && isCompanionConsented()
}

/** 取当前应使用的实现：满足条件用真实，否则回落 mock。 */
export function getCompanionApi(): { api: CompanionApi; real: boolean } {
  return realCompanionEnabled()
    ? { api: realCompanionApi, real: true }
    : { api: mockCompanionApi, real: false }
}

export const companionApi: CompanionApi = mockCompanionApi
