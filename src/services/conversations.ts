import { mockFetch } from "@/services/mockFetch"

export type ConvMood = "calm" | "happy" | "anxious" | "sad"

export interface ConversationItem {
  id: string
  voiceId: string
  name: string
  relation: string
  initial: string
  tone: "peach" | "mint" | "sky" | "lilac"
  startedAt: string
  durationSec: number
  mood: ConvMood
  flaggedSensitive: boolean
  summary: string
}

export interface ConversationsData {
  items: ConversationItem[]
}

const items: ConversationItem[] = [
  {
    id: "c1",
    voiceId: "v1",
    name: "占位·小雯",
    relation: "女儿",
    initial: "雯",
    tone: "peach",
    startedAt: "今天 10:05",
    durationSec: 240,
    mood: "anxious",
    flaggedSensitive: true,
    summary: "占位摘要 —— 患者提到「想出门找孩子」，AI 安抚并转移话题，已通知照护者。",
  },
  {
    id: "c2",
    voiceId: "v2",
    name: "占位·秀兰",
    relation: "老伴",
    initial: "兰",
    tone: "mint",
    startedAt: "今天 08:20",
    durationSec: 156,
    mood: "happy",
    flaggedSensitive: false,
    summary: "占位摘要 —— 一起回忆年轻时的事，情绪愉快，配合完成了早餐后服药。",
  },
  {
    id: "c3",
    voiceId: "v1",
    name: "占位·小雯",
    relation: "女儿",
    initial: "雯",
    tone: "peach",
    startedAt: "昨天 19:40",
    durationSec: 92,
    mood: "calm",
    flaggedSensitive: false,
    summary: "占位摘要 —— 睡前简短聊天，提醒明天的血压测量，情绪平稳。",
  },
]

export const getConversations = mockFetch<ConversationsData>((empty) =>
  empty ? { items: [] } : { items }
)
