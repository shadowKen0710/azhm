import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"

import {
  companionApi,
  type MemoryPiece,
  type MemoryTag,
} from "@/services/companionApi"

// 记忆库可写 store —— 看护者投喂的共同回忆，按家人归属。
// 对话时经 companionApi 织入，帮助患者怀旧、缓解症状。

export interface MemoryInput {
  memberId: string
  title: string
  text: string
  tag: MemoryTag
  hasAudio: boolean
}

const KEY = "azhm.memories"

const seed: MemoryPiece[] = [
  {
    id: "m-seed-1",
    memberId: "f1",
    title: "夏夜的萤火虫",
    text: "小时候你带我去河边捉萤火虫，装在玻璃瓶里当灯笼，",
    tag: "childhood",
    hasAudio: false,
    createdAt: 1,
  },
  {
    id: "m-seed-2",
    memberId: "f1",
    title: "你做的西红柿鸡蛋面",
    text: "你每次都给我多放一个蛋，说女孩子要吃饱才长得高，",
    tag: "daily",
    hasAudio: false,
    createdAt: 2,
  },
]

function load(): MemoryPiece[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as MemoryPiece[]) : seed
  } catch {
    return seed
  }
}

interface MemoriesValue {
  memories: MemoryPiece[]
  forMember: (memberId: string) => MemoryPiece[]
  addMemory: (input: MemoryInput) => void
  removeMemory: (id: string) => void
}

const MemoriesContext = createContext<MemoriesValue | null>(null)

export function MemoriesProvider({ children }: { children: ReactNode }) {
  const [memories, setMemories] = useState<MemoryPiece[]>(load)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(memories))
    } catch {
      /* 降级 */
    }
  }, [memories])

  const addMemory = (input: MemoryInput) => {
    const piece: MemoryPiece = {
      id: `m-${Date.now()}`,
      createdAt: Date.now(),
      ...input,
    }
    setMemories((prev) => [piece, ...prev])
    // 通知可插拔接口“学习入库”（mock 无副作用；真实为写知识库）
    void companionApi.ingestMemory(input.memberId, piece)
  }

  const removeMemory = (id: string) =>
    setMemories((prev) => prev.filter((m) => m.id !== id))

  const forMember = (memberId: string) =>
    memories
      .filter((m) => m.memberId === memberId)
      .sort((a, b) => a.createdAt - b.createdAt)

  return (
    <MemoriesContext.Provider
      value={{ memories, forMember, addMemory, removeMemory }}
    >
      {children}
    </MemoriesContext.Provider>
  )
}

export function useMemories() {
  const v = useContext(MemoriesContext)
  if (!v) throw new Error("useMemories 必须在 MemoriesProvider 内使用")
  return v
}
