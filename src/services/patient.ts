import { mockFetch } from "@/services/mockFetch"

export interface PatientFamily {
  id: string
  voiceId: string
  name: string
  relation: string
  initial: string
  tone: "peach" | "mint" | "sky" | "lilac"
  voiceAvailable: boolean // 声线是否已授权可对话
}

export interface PatientNextReminder {
  time: string
  title: string
  icon: "pill" | "walk" | "phone" | "water"
}

export interface PatientHomeData {
  greeting: string
  patientName: string
  timeLabel: string
  dateLabel: string
  family: PatientFamily[]
  nextReminder: PatientNextReminder | null
}

const family: PatientFamily[] = [
  { id: "f1", voiceId: "v1", name: "小雯", relation: "女儿", initial: "雯", tone: "peach", voiceAvailable: true },
  { id: "f3", voiceId: "v2", name: "秀兰", relation: "老伴", initial: "兰", tone: "mint", voiceAvailable: true },
  { id: "f2", voiceId: "v3", name: "建国", relation: "儿子", initial: "建", tone: "sky", voiceAvailable: false },
]

export const getPatientHome = mockFetch<PatientHomeData>((empty) => ({
  greeting: "下午好",
  patientName: "张爷爷",
  timeLabel: "14:30",
  dateLabel: "7月16日 · 周四",
  family: empty ? [] : family,
  nextReminder: empty
    ? null
    : { time: "19:00", title: "傍晚与家人通话", icon: "phone" },
}))

// ---------- 对话页 ----------
export interface TalkTurn {
  who: "ai" | "patient"
  text: string
}

export interface PatientTalkData {
  voiceId: string
  name: string
  relation: string
  initial: string
  tone: PatientFamily["tone"]
  turns: TalkTurn[]
}

type TalkCaller = Pick<PatientTalkData, "name" | "relation" | "initial" | "tone"> & {
  turns: TalkTurn[]
}

const talkCallers: Record<string, TalkCaller> = {
  v1: {
    name: "小雯",
    relation: "女儿",
    initial: "雯",
    tone: "peach",
    turns: [
      { who: "ai", text: "爸，是我呀，小雯。今天有没有好好吃饭呀？" },
      { who: "patient", text: "吃了吃了，中午吃的面条。" },
      { who: "ai", text: "那就好。记得下午还要量个血压哦，我陪着你。" },
    ],
  },
  v2: {
    name: "秀兰",
    relation: "老伴",
    initial: "兰",
    tone: "mint",
    turns: [
      { who: "ai", text: "老头子，忙什么呢？想你了就打过来看看。" },
      { who: "patient", text: "没忙啥，刚在窗边坐着晒太阳。" },
      { who: "ai", text: "那挺好。一会儿记得喝口水，别老坐着。" },
    ],
  },
}

export const getPatientTalk = (voiceId: string) =>
  mockFetch<PatientTalkData>(() => {
    const caller = talkCallers[voiceId] ?? talkCallers.v1
    return { voiceId, ...caller }
  })
