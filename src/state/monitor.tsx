import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"

// 真实异常状态机（SPEC §8.1 未服药升级 / §8.4 失联心跳）：
// 由计时器/事件驱动，联动告警中心与 Dashboard，而非预置假数据。

export type MonReminderStatus = "pending" | "done" | "missed"
export type MonReminderIcon = "pill" | "heart" | "walk" | "phone" | "water"

export interface MonReminder {
  id: string
  time: string
  title: string
  icon: MonReminderIcon
  medication: boolean
  status: MonReminderStatus
  dueAt: number | null // 截止时间戳；now ≥ dueAt 且仍 pending → missed
}

export type MonAlertKind = "missed-med" | "offline" | "recovered"

export interface MonAlert {
  id: string
  kind: MonAlertKind
  title: string
  detail: string
  at: number
  level: "high" | "info"
}

// 演示用短时长（秒级可观察）；真实中为分钟/小时。
const DUE_MS = 8000
const OFFLINE_MS = 6000

function hhmm(ts: number) {
  const d = new Date(ts)
  const p = (n: number) => String(n).padStart(2, "0")
  return `${p(d.getHours())}:${p(d.getMinutes())}`
}

interface MonitorState {
  connected: boolean
  online: boolean
  lastSeenAt: number
  reminders: MonReminder[]
  alerts: MonAlert[]
}

function seed(now: number): MonitorState {
  return {
    connected: true,
    online: true,
    lastSeenAt: now,
    reminders: [
      { id: "r1", time: "08:00", title: "早餐后服药", icon: "pill", medication: true, status: "done", dueAt: null },
      { id: "r2", time: "12:30", title: "午间血压药", icon: "heart", medication: true, status: "pending", dueAt: now + DUE_MS },
      { id: "r3", time: "15:00", title: "下午喝一杯水", icon: "water", medication: false, status: "pending", dueAt: null },
      { id: "r4", time: "19:00", title: "傍晚与家人通话", icon: "phone", medication: false, status: "pending", dueAt: null },
    ],
    alerts: [],
  }
}

interface MonitorValue {
  online: boolean
  lastSeenLabel: string
  reminders: MonReminder[]
  alerts: MonAlert[]
  medDone: number
  medTotal: number
  armReminder: (id: string) => void
  completeReminder: (id: string) => void
  snoozeReminder: (id: string) => void
  setConnected: (v: boolean) => void
}

const MonitorContext = createContext<MonitorValue | null>(null)

export function MonitorProvider({ children }: { children: ReactNode }) {
  const [s, setS] = useState<MonitorState>(() => seed(Date.now()))

  // 单一心跳/巡检计时器：驱动失联与未服药升级。
  useEffect(() => {
    const t = setInterval(() => {
      setS((prev) => {
        const now = Date.now()
        const fresh: MonAlert[] = []
        let { online, lastSeenAt } = prev

        // 心跳：连接中持续刷新；断开超时则失联。
        if (prev.connected) {
          lastSeenAt = now
          online = true
        } else if (online && now - lastSeenAt > OFFLINE_MS) {
          online = false
          fresh.push({
            id: `offline-${lastSeenAt}`,
            kind: "offline",
            title: "患者失联",
            detail: `设备无心跳，最后在线 ${hhmm(lastSeenAt)}`,
            at: now,
            level: "high",
          })
        }

        // 未服药升级：到点未确认 → missed → 生成升级告警。
        const reminders = prev.reminders.map((r) => {
          if (r.status === "pending" && r.dueAt != null && now >= r.dueAt) {
            fresh.push({
              id: `missed-${r.id}`,
              kind: "missed-med",
              title: `未服药 · ${r.title}`,
              detail: "到点未确认，已自动升级。",
              at: now,
              level: "high",
            })
            return { ...r, status: "missed" as const, dueAt: null }
          }
          return r
        })

        const existing = new Set(prev.alerts.map((a) => a.id))
        const alerts = [
          ...fresh.filter((a) => !existing.has(a.id)),
          ...prev.alerts,
        ]
        return { ...prev, online, lastSeenAt, reminders, alerts }
      })
    }, 1000)
    return () => clearInterval(t)
  }, [])

  const armReminder = (id: string) =>
    setS((p) => ({
      ...p,
      reminders: p.reminders.map((r) =>
        r.id === id ? { ...r, status: "pending", dueAt: Date.now() + DUE_MS } : r
      ),
    }))

  const completeReminder = (id: string) =>
    setS((p) => ({
      ...p,
      reminders: p.reminders.map((r) =>
        r.id === id ? { ...r, status: "done", dueAt: null } : r
      ),
    }))

  const snoozeReminder = (id: string) =>
    setS((p) => ({
      ...p,
      reminders: p.reminders.map((r) =>
        r.id === id ? { ...r, status: "pending", dueAt: Date.now() + DUE_MS } : r
      ),
    }))

  const setConnected = (v: boolean) =>
    setS((p) => {
      if (v) {
        const now = Date.now()
        const wasOffline = !p.online
        return {
          ...p,
          connected: true,
          online: true,
          lastSeenAt: now,
          alerts: wasOffline
            ? [
                {
                  id: `recovered-${now}`,
                  kind: "recovered",
                  title: "患者已恢复在线",
                  detail: `心跳恢复 ${hhmm(now)}`,
                  at: now,
                  level: "info",
                },
                ...p.alerts,
              ]
            : p.alerts,
        }
      }
      return { ...p, connected: false }
    })

  const meds = s.reminders.filter((r) => r.medication)
  const value: MonitorValue = {
    online: s.online,
    lastSeenLabel: s.online ? "刚刚" : hhmm(s.lastSeenAt),
    reminders: s.reminders,
    alerts: s.alerts,
    medDone: meds.filter((r) => r.status === "done").length,
    medTotal: meds.length,
    armReminder,
    completeReminder,
    snoozeReminder,
    setConnected,
  }

  return (
    <MonitorContext.Provider value={value}>{children}</MonitorContext.Provider>
  )
}

export function useMonitor() {
  const v = useContext(MonitorContext)
  if (!v) throw new Error("useMonitor 必须在 MonitorProvider 内使用")
  return v
}
