import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"

import type { SettingsData } from "@/services/settings"

// 设置可写 store：患者档案 / 主照护者 / 安全区。localStorage 持久化。

const KEY = "azhm.settings"

const seed: SettingsData = {
  patient: {
    name: "张爷爷",
    age: "78 岁",
    condition: "阿兹海默症 · 中期",
    homeAddress: "阳光小区 12 栋",
  },
  caregiver: {
    name: "李阿姨",
    relation: "女儿",
    phone: "138 0000 0000",
  },
  safeZone: "小区范围",
}

function load(): SettingsData {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as SettingsData) : seed
  } catch {
    return seed
  }
}

interface SettingsValue {
  settings: SettingsData
  save: (next: SettingsData) => void
}

const Ctx = createContext<SettingsValue | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SettingsData>(load)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(settings))
    } catch {
      /* 降级 */
    }
  }, [settings])

  return (
    <Ctx.Provider value={{ settings, save: setSettings }}>
      {children}
    </Ctx.Provider>
  )
}

export function useSettingsStore() {
  const v = useContext(Ctx)
  if (!v) throw new Error("useSettingsStore 必须在 SettingsProvider 内")
  return v
}
