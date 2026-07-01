// 首页假数据（占位符）。真实接口接入后由 services 层替换。
export type Mood = "calm" | "happy" | "anxious"

export interface DayCell {
  date: number
  weekday: string
  mood: Mood | null
  today?: boolean
  future?: boolean
}

export interface ReminderItem {
  id: string
  title: string
  icon: "pill" | "heart" | "walk" | "phone" | "meal"
  removable?: boolean
}

export interface ReminderGroup {
  label: string
  items: ReminderItem[]
}

export interface DashboardData {
  caregiverName: string
  patientName: string
  dateLabel: string
  summary: string
  summaryBy: string
  weekRange: string
  week: DayCell[]
  reminderGroups: ReminderGroup[]
}

export const dashboardMock: DashboardData = {
  caregiverName: "李阿姨",
  patientName: "张爷爷",
  dateLabel: "2020年7月16日 · 周四",
  summary:
    "占位摘要 —— 今天状态平稳，情绪平和，服药 2/3 已完成，暂无异常告警。",
  summaryBy: "今日守护摘要",
  weekRange: "2020年7月13日 — 7月19日",
  week: [
    { date: 13, weekday: "周一", mood: "calm" },
    { date: 14, weekday: "周二", mood: "happy" },
    { date: 15, weekday: "周三", mood: "anxious" },
    { date: 16, weekday: "周四", mood: "calm", today: true },
    { date: 17, weekday: "周五", mood: null, future: true },
    { date: 18, weekday: "周六", mood: null, future: true },
    { date: 19, weekday: "周日", mood: null, future: true },
  ],
  reminderGroups: [
    {
      label: "用药",
      items: [
        { id: "m1", title: "占位提醒 · 早餐后服药", icon: "pill" },
        { id: "m2", title: "占位提醒 · 午间血压药", icon: "heart", removable: true },
      ],
    },
    {
      label: "日程",
      items: [
        { id: "s1", title: "占位提醒 · 上午散步 30 分钟", icon: "walk" },
        { id: "s2", title: "占位提醒 · 傍晚与家人通话", icon: "phone" },
      ],
    },
  ],
}
