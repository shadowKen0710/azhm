import { mockFetch } from "@/services/mockFetch"

// 家人档案 —— 认人卡与声线共用同一批家人（见 SPEC §5.4/§5.5）。
export interface FamilyMember {
  id: string
  name: string
  relation: string
  nickname: string
  initial: string // 头像占位用首字
  tone: "peach" | "mint" | "sky" | "lilac" // 头像底色占位
}

export interface MemoryCardsData {
  members: FamilyMember[]
}

const members: FamilyMember[] = [
  { id: "f1", name: "占位·小雯", relation: "女儿", nickname: "之之", initial: "雯", tone: "peach" },
  { id: "f2", name: "占位·建国", relation: "儿子", nickname: "小建", initial: "建", tone: "sky" },
  { id: "f3", name: "占位·秀兰", relation: "老伴", nickname: "老伴", initial: "兰", tone: "mint" },
  { id: "f4", name: "占位·乐乐", relation: "外孙", nickname: "乐乐", initial: "乐", tone: "lilac" },
]

export const getMemoryCards = mockFetch<MemoryCardsData>((empty) =>
  empty ? { members: [] } : { members }
)

// ---------- 声线 ----------
export interface VoiceProfile {
  id: string
  memberId: string
  name: string
  relation: string
  initial: string
  tone: FamilyMember["tone"]
  status: "ready" | "recording" | "revoked"
  authorized: boolean
  sampleSeconds: number
  learnProgress: number // 0-100 可视化占位
}

export interface VoicesData {
  profiles: VoiceProfile[]
}

const profiles: VoiceProfile[] = [
  { id: "v1", memberId: "f1", name: "占位·小雯", relation: "女儿", initial: "雯", tone: "peach", status: "ready", authorized: true, sampleSeconds: 214, learnProgress: 72 },
  { id: "v2", memberId: "f3", name: "占位·秀兰", relation: "老伴", initial: "兰", tone: "mint", status: "ready", authorized: true, sampleSeconds: 168, learnProgress: 45 },
  { id: "v3", memberId: "f2", name: "占位·建国", relation: "儿子", initial: "建", tone: "sky", status: "revoked", authorized: false, sampleSeconds: 0, learnProgress: 0 },
]

export const getVoices = mockFetch<VoicesData>((empty) =>
  empty ? { profiles: [] } : { profiles }
)
