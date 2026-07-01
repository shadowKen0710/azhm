import { mockFetch } from "@/services/mockFetch"

export type ReminderStatus = "done" | "pending" | "missed"
export type ReminderIcon = "pill" | "heart" | "walk" | "phone" | "meal" | "water"

export interface Reminder {
  id: string
  time: string
  title: string
  icon: ReminderIcon
  status: ReminderStatus
  voice?: string // 绑定的家人声线（占位）
}

export interface ReminderSection {
  label: string
  items: Reminder[]
}

export interface RemindersData {
  doneCount: number
  total: number
  sections: ReminderSection[]
}

const full: RemindersData = {
  doneCount: 2,
  total: 5,
  sections: [
    {
      label: "上午",
      items: [
        { id: "r1", time: "08:00", title: "占位提醒 · 早餐后服药", icon: "pill", status: "done", voice: "女儿" },
        { id: "r2", time: "09:30", title: "占位提醒 · 上午散步 30 分钟", icon: "walk", status: "done" },
        { id: "r3", time: "11:00", title: "占位提醒 · 喝一杯水", icon: "water", status: "missed" },
      ],
    },
    {
      label: "下午",
      items: [
        { id: "r4", time: "13:00", title: "占位提醒 · 午间血压药", icon: "heart", status: "pending", voice: "女儿" },
      ],
    },
    {
      label: "晚上",
      items: [
        { id: "r5", time: "19:00", title: "占位提醒 · 傍晚与家人通话", icon: "phone", status: "pending" },
      ],
    },
  ],
}

export const getReminders = mockFetch<RemindersData>((empty) =>
  empty ? { doneCount: 0, total: 0, sections: [] } : full
)
