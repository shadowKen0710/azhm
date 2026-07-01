import { createContext, useContext, useState, type ReactNode } from "react"

import { cn } from "@/lib/utils"

export type DemoMode = "normal" | "empty" | "error" | "loading"

const MODES: { key: DemoMode; label: string }[] = [
  { key: "normal", label: "正常" },
  { key: "empty", label: "空数据" },
  { key: "error", label: "错误" },
  { key: "loading", label: "加载中" },
]

const DemoContext = createContext<{
  mode: DemoMode
  setMode: (m: DemoMode) => void
}>({ mode: "normal", setMode: () => {} })

export function DemoProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<DemoMode>("normal")
  return (
    <DemoContext.Provider value={{ mode, setMode }}>
      {children}
    </DemoContext.Provider>
  )
}

export const useDemoMode = () => useContext(DemoContext).mode

/** 全局演示态切换器（见 SPEC §1 dev 演示控制台）。 */
export function DemoToggle() {
  const { mode, setMode } = useContext(DemoContext)
  return (
    <div className="flex items-center gap-1 rounded-full bg-card p-1 shadow-soft">
      {MODES.map((m) => (
        <button
          key={m.key}
          onClick={() => setMode(m.key)}
          className={cn(
            "flex-1 rounded-full px-2.5 py-1.5 text-xs font-semibold transition-colors",
            m.key === mode
              ? "bg-ink text-cream"
              : "text-muted-foreground hover:text-ink"
          )}
        >
          {m.label}
        </button>
      ))}
    </div>
  )
}
