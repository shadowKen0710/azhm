import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"

import type { FamilyMember, FamilyTone } from "@/services/family"

const KEY = "azhm.family"

// 家人档案可写 store —— 认人卡（增删改）与患者「认认人」的事实来源。
// 数据在内存，从 mock 种子初始化；日后替换为真实 API。

export interface FamilyInput {
  name: string
  relation: string
  nickname: string
  tone: FamilyTone
  photo?: string
}

const seed: FamilyMember[] = [
  { id: "f1", name: "小雯", relation: "女儿", nickname: "之之", initial: "雯", tone: "peach" },
  { id: "f2", name: "建国", relation: "儿子", nickname: "小建", initial: "建", tone: "sky" },
  { id: "f3", name: "秀兰", relation: "老伴", nickname: "老伴", initial: "兰", tone: "mint" },
  { id: "f4", name: "乐乐", relation: "外孙", nickname: "乐乐", initial: "乐", tone: "lilac" },
]

/** 取姓名末字作头像首字（中文姓名末字更像称呼）。 */
function initialOf(name: string) {
  const t = name.trim()
  return t ? t[t.length - 1] : "亲"
}

interface FamilyValue {
  members: FamilyMember[]
  addMember: (input: FamilyInput) => void
  updateMember: (id: string, input: FamilyInput) => void
  removeMember: (id: string) => void
}

const FamilyContext = createContext<FamilyValue | null>(null)

function load(): FamilyMember[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as FamilyMember[]) : seed
  } catch {
    return seed
  }
}

export function FamilyProvider({ children }: { children: ReactNode }) {
  const [members, setMembers] = useState<FamilyMember[]>(load)

  // 持久化：认人卡为患者依赖的数据，刷新/大屏重启后应保留。
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(members))
    } catch {
      /* 存储不可用时静默降级 */
    }
  }, [members])

  const addMember = (input: FamilyInput) =>
    setMembers((prev) => [
      ...prev,
      { id: `f-${Date.now()}`, initial: initialOf(input.name), ...input },
    ])

  const updateMember = (id: string, input: FamilyInput) =>
    setMembers((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, ...input, initial: initialOf(input.name) } : m
      )
    )

  const removeMember = (id: string) =>
    setMembers((prev) => prev.filter((m) => m.id !== id))

  return (
    <FamilyContext.Provider
      value={{ members, addMember, updateMember, removeMember }}
    >
      {children}
    </FamilyContext.Provider>
  )
}

export function useFamily() {
  const v = useContext(FamilyContext)
  if (!v) throw new Error("useFamily 必须在 FamilyProvider 内使用")
  return v
}
