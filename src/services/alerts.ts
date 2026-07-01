import { mockFetch } from "@/services/mockFetch"

export type SosState =
  | "triggered"
  | "sent"
  | "acknowledged"
  | "resolved"
  | "escalated"
  | "cancelled"

export interface SosStep {
  label: string
  time: string
  done: boolean
}

export interface SosEvent {
  id: string
  state: SosState
  startedAt: string
  lastLocation: string // mock 位置占位（非真实 GPS，见 SPEC §10）
  steps: SosStep[]
}

export type AlertKind = "missed-med" | "offline" | "sos" | "sensitive"

export interface AlertItem {
  id: string
  kind: AlertKind
  title: string
  detail: string
  time: string
  level: "high" | "info"
}

export interface AlertsData {
  patientOnline: boolean
  lastSeen: string
  active: SosEvent | null
  history: AlertItem[]
}

const full: AlertsData = {
  patientOnline: true,
  lastSeen: "刚刚",
  active: {
    id: "sos1",
    state: "sent",
    startedAt: "14:32",
    lastLocation: "占位位置 · 小区中心花园附近",
    steps: [
      { label: "已触发", time: "14:32", done: true },
      { label: "已发送给照护者", time: "14:32", done: true },
      { label: "照护者已接收", time: "14:33", done: true },
      { label: "等待响应", time: "—", done: false },
    ],
  },
  history: [
    {
      id: "a1",
      kind: "missed-med",
      title: "未服药 · 上午的水",
      detail: "占位提醒超时未确认，已自动升级。",
      time: "今天 11:20",
      level: "high",
    },
    {
      id: "a2",
      kind: "sensitive",
      title: "敏感话题 · 对话中",
      detail: "患者提到「想出门」，已安抚并通知。",
      time: "今天 10:05",
      level: "info",
    },
    {
      id: "a3",
      kind: "offline",
      title: "曾短暂失联",
      detail: "设备 14:02–14:08 无心跳，已恢复。",
      time: "今天 14:08",
      level: "info",
    },
  ],
}

export const getAlerts = mockFetch<AlertsData>((empty) =>
  empty
    ? { patientOnline: true, lastSeen: "刚刚", active: null, history: [] }
    : full
)
