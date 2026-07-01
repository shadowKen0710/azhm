// 数据访问层 —— 页面只调用此处，未来把 mock 换成真实 API 即可（见 SPEC §1/§4）。
import { dashboardMock, type DashboardData } from "@/mock/dashboard"

const MOCK_DELAY = 700

export type { DashboardData }

/** 拉取首页数据。fail=true 时模拟接口失败，用于演示错误态。 */
export function getDashboard(opts?: {
  fail?: boolean
  empty?: boolean
}): Promise<DashboardData> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (opts?.fail) {
        reject(new Error("接口占位错误"))
        return
      }
      if (opts?.empty) {
        resolve({
          ...dashboardMock,
          week: dashboardMock.week.map((d) => ({ ...d, mood: null })),
          reminderGroups: [],
        })
        return
      }
      resolve(dashboardMock)
    }, MOCK_DELAY)
  })
}
