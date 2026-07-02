import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"

import type { ConvMood } from "@/services/conversations"
import type { FamilyTone } from "@/services/family"
import type { TalkTurn } from "@/services/patient"

// 对话记录可写 store：患者与 AI 家人的对话在此留存，供照护者回看。
// localStorage 持久化；患者 Talk 结束时写入一条。

export interface ConversationRecord {
  id: string
  memberId: string
  name: string
  relation: string
  initial: string
  tone: FamilyTone
  photo?: string
  at: number // 开始时间戳
  durationSec: number
  mood: ConvMood
  flaggedSensitive: boolean
  summary: string
  transcript: TalkTurn[]
}

export type NewConversation = Omit<ConversationRecord, "id">

const KEY = "azhm.conversations"

const seed: ConversationRecord[] = [
  {
    id: "c1",
    memberId: "f1",
    name: "小雯",
    relation: "女儿",
    initial: "雯",
    tone: "peach",
    at: 1,
    durationSec: 240,
    mood: "anxious",
    flaggedSensitive: true,
    summary: "患者提到「想出门找孩子」，AI 安抚并转移话题，已通知照护者。",
    transcript: [
      { who: "ai", text: "爸，是我呀，小雯。今天有没有好好吃饭呀？" },
      { who: "patient", text: "我要出门去找你，你怎么还不回家……" },
      { who: "ai", text: "爸别急，我在呢。外面天凉，你先在家等我，我很快回去看你，好不好？" },
      { who: "patient", text: "那……那好吧。" },
    ],
  },
  {
    id: "c2",
    memberId: "f3",
    name: "秀兰",
    relation: "老伴",
    initial: "兰",
    tone: "mint",
    at: 2,
    durationSec: 156,
    mood: "happy",
    flaggedSensitive: false,
    summary: "一起回忆年轻时的事，情绪愉快，配合完成了早餐后服药。",
    transcript: [
      { who: "ai", text: "老头子，还记得咱们第一次跳舞那晚吗？" },
      { who: "patient", text: "记得记得，你还踩了我的脚。" },
      { who: "ai", text: "就你记性好！来，把早饭后的药吃了，我看着你。" },
    ],
  },
  {
    id: "c3",
    memberId: "f1",
    name: "小雯",
    relation: "女儿",
    initial: "雯",
    tone: "peach",
    at: 3,
    durationSec: 92,
    mood: "calm",
    flaggedSensitive: false,
    summary: "睡前简短聊天，提醒明天的血压测量，情绪平稳。",
    transcript: [
      { who: "ai", text: "爸，早点休息。明天记得量个血压。" },
      { who: "patient", text: "知道了，你也早点睡。" },
    ],
  },
]

function load(): ConversationRecord[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as ConversationRecord[]) : seed
  } catch {
    return seed
  }
}

interface ConversationsValue {
  records: ConversationRecord[]
  byId: (id: string) => ConversationRecord | undefined
  addConversation: (c: NewConversation) => void
}

const Ctx = createContext<ConversationsValue | null>(null)

export function ConversationsProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useState<ConversationRecord[]>(load)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(records))
    } catch {
      /* 降级 */
    }
  }, [records])

  const addConversation = (c: NewConversation) =>
    setRecords((prev) => [{ id: `conv-${Date.now()}`, ...c }, ...prev])

  const byId = (id: string) => records.find((r) => r.id === id)

  return (
    <Ctx.Provider value={{ records, byId, addConversation }}>
      {children}
    </Ctx.Provider>
  )
}

export function useConversationsStore() {
  const v = useContext(Ctx)
  if (!v) throw new Error("useConversationsStore 必须在 ConversationsProvider 内")
  return v
}
