import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react"

import { voiceApi, type VoiceSample } from "@/services/voiceApi"
import { useFamily } from "@/state/family"
import type { FamilyTone } from "@/services/family"

// 声线可写 store —— 授权/撤销/训练进度的事实来源。
// 训练进度由 voiceApi（可插拔，现 mock）驱动，patient 端据此判断家人是否可对话。

export type VoiceStatus = "none" | "training" | "ready" | "revoked"

export interface VoiceRecord {
  memberId: string
  status: VoiceStatus
  authorized: boolean
  sampleSeconds: number
  learnProgress: number // 0-100
  jobId?: string
}

// 展示用：家人档案 + 声线状态合并
export interface VoiceProfileView {
  memberId: string
  name: string
  relation: string
  initial: string
  tone: FamilyTone
  photo?: string
  status: VoiceStatus
  authorized: boolean
  sampleSeconds: number
  learnProgress: number
}

const KEY = "azhm.voices"

// 种子：小雯已就绪、秀兰训练偏低、建国已撤销
const seed: Record<string, VoiceRecord> = {
  f1: { memberId: "f1", status: "ready", authorized: true, sampleSeconds: 214, learnProgress: 72 },
  f3: { memberId: "f3", status: "ready", authorized: true, sampleSeconds: 168, learnProgress: 45 },
  f2: { memberId: "f2", status: "revoked", authorized: false, sampleSeconds: 0, learnProgress: 0 },
}

function load(): Record<string, VoiceRecord> {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Record<string, VoiceRecord>) : seed
  } catch {
    return seed
  }
}

interface VoicesValue {
  profiles: VoiceProfileView[]
  /** 提交录音样本 → 入组并开始训练（进度轮询）。 */
  authorize: (memberId: string, sample: VoiceSample) => Promise<void>
  revoke: (memberId: string) => void
  /** 某家人声线是否可用于对话（ready + authorized）。 */
  isVoiceReady: (memberId: string) => boolean
}

const VoicesContext = createContext<VoicesValue | null>(null)

export function VoicesProvider({ children }: { children: ReactNode }) {
  const { members } = useFamily()
  const [records, setRecords] = useState<Record<string, VoiceRecord>>(load)
  const timers = useRef<Record<string, ReturnType<typeof setInterval>>>({})

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(records))
    } catch {
      /* 降级 */
    }
  }, [records])

  // 清理轮询计时器
  useEffect(() => {
    const t = timers.current
    return () => Object.values(t).forEach(clearInterval)
  }, [])

  function startPolling(memberId: string, jobId: string) {
    clearInterval(timers.current[jobId])
    timers.current[jobId] = setInterval(async () => {
      const job = await voiceApi.pollTraining(jobId)
      setRecords((prev) => {
        const r = prev[memberId]
        if (!r || r.jobId !== jobId) return prev
        return {
          ...prev,
          [memberId]: {
            ...r,
            learnProgress: job.progress,
            status: job.status === "ready" ? "ready" : "training",
          },
        }
      })
      if (job.status !== "training") {
        clearInterval(timers.current[jobId])
        delete timers.current[jobId]
      }
    }, 500)
  }

  const authorize: VoicesValue["authorize"] = async (memberId, sample) => {
    const { jobId } = await voiceApi.enrollVoice(memberId, sample)
    setRecords((prev) => ({
      ...prev,
      [memberId]: {
        memberId,
        status: "training",
        authorized: true,
        sampleSeconds: Math.round(sample.durationSec),
        learnProgress: 0,
        jobId,
      },
    }))
    startPolling(memberId, jobId)
  }

  const revoke: VoicesValue["revoke"] = (memberId) =>
    setRecords((prev) => ({
      ...prev,
      [memberId]: {
        memberId,
        status: "revoked",
        authorized: false,
        sampleSeconds: 0,
        learnProgress: 0,
      },
    }))

  const isVoiceReady: VoicesValue["isVoiceReady"] = (memberId) => {
    const r = records[memberId]
    return !!r && r.authorized && r.status === "ready"
  }

  // 合并家人档案 + 声线记录用于展示
  const profiles: VoiceProfileView[] = members.map((m) => {
    const r = records[m.id]
    return {
      memberId: m.id,
      name: m.name,
      relation: m.relation,
      initial: m.initial,
      tone: m.tone,
      photo: m.photo,
      status: r?.status ?? "none",
      authorized: r?.authorized ?? false,
      sampleSeconds: r?.sampleSeconds ?? 0,
      learnProgress: r?.learnProgress ?? 0,
    }
  })

  return (
    <VoicesContext.Provider
      value={{ profiles, authorize, revoke, isVoiceReady }}
    >
      {children}
    </VoicesContext.Provider>
  )
}

export function useVoicesStore() {
  const v = useContext(VoicesContext)
  if (!v) throw new Error("useVoicesStore 必须在 VoicesProvider 内使用")
  return v
}
