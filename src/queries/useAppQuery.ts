import { useQuery } from "@tanstack/react-query"

import { useDemoMode } from "@/components/demo"

export type ResourceStatus = "loading" | "success" | "error"

/**
 * 桥接 TanStack Query 与全局演示态，并暴露与旧 useResource 一致的
 * { status, data, retry } 形态，便于页面无痛迁移。
 * - loading 模式：queryFn 永不 resolve → 保持 pending
 * - error 模式：getter 抛错
 * - empty 模式：getter 返回空数据（页面自行判断空态）
 */
export function useAppQuery<T>(
  key: readonly unknown[],
  getter: (opts: { fail?: boolean; empty?: boolean }) => Promise<T>
) {
  const mode = useDemoMode()
  const q = useQuery({
    queryKey: [...key, mode],
    queryFn: () => {
      if (mode === "loading") return new Promise<T>(() => {})
      return getter({ fail: mode === "error", empty: mode === "empty" })
    },
  })

  const status: ResourceStatus = q.isError
    ? "error"
    : q.isSuccess
      ? "success"
      : "loading"

  return { status, data: q.data ?? null, retry: () => void q.refetch() }
}
