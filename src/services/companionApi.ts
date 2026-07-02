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
}

export interface CompanionApi {
  ingestMemory(memberId: string, memory: MemoryPiece): Promise<void>
  generateReply(ctx: ReplyContext): Promise<{ text: string; usedMemoryId?: string }>
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

export const companionApi: CompanionApi = mockCompanionApi
