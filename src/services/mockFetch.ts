// 统一的假接口封装。未来把 body 换成真实 fetch 即可（见 SPEC §1/§4）。
const MOCK_DELAY = 700

export function mockFetch<T>(build: (empty: boolean) => T) {
  return (opts?: { fail?: boolean; empty?: boolean }): Promise<T> =>
    new Promise((resolve, reject) => {
      setTimeout(() => {
        if (opts?.fail) reject(new Error("接口占位错误"))
        else resolve(build(!!opts?.empty))
      }, MOCK_DELAY)
    })
}
