import { useCallback, useEffect, useState } from "react"

import { useDemoMode } from "@/components/demo"

export type ResourceStatus = "loading" | "success" | "error"

/**
 * 统一的数据获取 hook。读取全局演示态：
 * - loading：停在加载态
 * - error：让 fetcher 失败
 * - empty：让 fetcher 返回空数据（由页面判断渲染空态）
 * 未来把各 service 的 mock 换成真实 API 即可，页面无需改动（见 SPEC §1/§4）。
 */
export function useResource<T>(
  fetcher: (opts: { fail?: boolean; empty?: boolean }) => Promise<T>
) {
  const mode = useDemoMode()
  const [status, setStatus] = useState<ResourceStatus>("loading")
  const [data, setData] = useState<T | null>(null)
  const [tick, setTick] = useState(0)

  const retry = useCallback(() => setTick((t) => t + 1), [])

  useEffect(() => {
    let alive = true
    setStatus("loading")
    if (mode === "loading") return
    fetcher({ fail: mode === "error", empty: mode === "empty" })
      .then((d) => {
        if (!alive) return
        setData(d)
        setStatus("success")
      })
      .catch(() => alive && setStatus("error"))
    return () => {
      alive = false
    }
    // fetcher 每次渲染新建，故仅依赖 mode/tick
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, tick])

  return { status, data, retry }
}
