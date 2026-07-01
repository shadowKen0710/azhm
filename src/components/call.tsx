import { createContext, useContext, useState, type ReactNode } from "react"

import type { Tone } from "@/lib/tone"

// 一次来电（家人手动发起 or AI 按日程自动发起）。
export type IncomingCall = {
  by: "family" | "ai"
  voiceId: string
  name: string
  relation: string
  initial: string
  tone: Tone
}

const CallContext = createContext<{
  pending: IncomingCall | null
  callPatient: (c: IncomingCall) => void
  clearCall: () => void
}>({ pending: null, callPatient: () => {}, clearCall: () => {} })

/**
 * 跨端通话总线：照护者端发起来电 → 患者大屏被动接收。
 * POC 用前端 Context 打通；真实中经推送/信令服务（不在 POC 范围）。
 */
export function CallProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<IncomingCall | null>(null)
  return (
    <CallContext.Provider
      value={{
        pending,
        callPatient: setPending,
        clearCall: () => setPending(null),
      }}
    >
      {children}
    </CallContext.Provider>
  )
}

export const useCall = () => useContext(CallContext)
