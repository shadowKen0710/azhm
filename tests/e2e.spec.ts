import { expect, test } from "@playwright/test"

// 关键交互链路走查（对应 SPEC §7 / §11）。

// 默认注入已登录态，让受保护的照护者路由直接可达；患者 kiosk 不受影响。
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "azhm.auth",
      JSON.stringify({ name: "李阿姨", role: "caregiver", relation: "女儿" })
    )
  })
})

test("未登录访问照护者 → 跳登录 → 登录后进入", async ({ page }) => {
  await page.addInitScript(() => localStorage.removeItem("azhm.auth"))
  await page.goto("/caregiver/alerts")
  await page.waitForURL("**/login")
  await page.getByRole("button", { name: "登录" }).click()
  await page.waitForURL(/\/caregiver/)
  await expect(page.getByRole("heading", { name: /告警/ })).toBeVisible()
})

test("角色切换：照护者 ⇄ 患者", async ({ page }) => {
  await page.goto("/caregiver")
  await expect(page.getByText("本周", { exact: false })).toBeVisible()

  await page.getByRole("button", { name: "患者" }).click()
  await page.waitForURL("**/patient")
  await expect(page.getByText("紧急求助")).toBeVisible()
})

test("远程呼叫 → 患者大屏被动自动接通（真人来电，无 AI 明示）", async ({
  page,
}) => {
  await page.goto("/caregiver/care")
  await page.getByRole("button", { name: "现在呼叫患者" }).click()

  // 跳到患者大屏并弹出来电覆盖层（覆盖层独有文案，避开待机页演示按钮）
  await page.waitForURL("**/patient")
  await expect(page.getByText("想和你说说话", { exact: false })).toBeVisible({
    timeout: 8000,
  })

  // 无需任何点击，倒计时结束自动接通 → 通话页
  await page.waitForURL("**/patient/talk/**", { timeout: 8000 })
  await expect(page.getByText("正在和女儿通话")).toBeVisible()
  // 真人来电不显示 AI 明示
  await expect(page.getByText("AI 模拟声音")).toHaveCount(0)
})

test("患者主动拨出 → AI 通话显示「AI 模拟声音」明示", async ({ page }) => {
  await page.goto("/patient")
  await page
    .getByRole("button", { name: /小雯/ })
    .first()
    .click()

  await page.waitForURL("**/patient/talk/**")
  await expect(page.getByText("AI 模拟声音")).toBeVisible()
  await expect(page.getByText("正在聆听", { exact: false })).toBeVisible()
})

test("SOS 倒计时可撤销", async ({ page }) => {
  await page.goto("/patient")
  await page.getByRole("button", { name: "紧急求助" }).click()
  await expect(page.getByText("正在呼叫家人", { exact: false })).toBeVisible()

  await page.getByRole("button", { name: "取消" }).click()
  // 覆盖层关闭，回到待机（SOS 按钮仍在，呼叫态消失）
  await expect(page.getByText("正在呼叫家人", { exact: false })).toHaveCount(0)
  await expect(page.getByRole("button", { name: "紧急求助" })).toBeVisible()
})

test("到点提醒 → 已完成闭环", async ({ page }) => {
  await page.goto("/patient?remind=1")
  await expect(page.getByText("该量血压啦")).toBeVisible()

  await page.getByRole("button", { name: "已完成" }).click()
  await expect(page.getByText("真棒，已完成")).toBeVisible()
})

test("患者屏韧性：错误态不暴露技术错误，SOS 仍可用", async ({ page }) => {
  await page.goto("/patient")
  await page.getByRole("button", { name: "错误" }).click()
  await expect(page.getByText("连接有点慢", { exact: false })).toBeVisible()
  await expect(page.getByRole("button", { name: "紧急求助" })).toBeVisible()
})

test("状态机：用药到点未确认 → 自动升级为未服药告警", async ({ page }) => {
  await page.goto("/caregiver/alerts")
  // r2（午间血压药）dueAt≈8s，计时器到点后自动生成升级告警
  await expect(page.getByText("未服药 · 午间血压药")).toBeVisible({
    timeout: 15_000,
  })
  await expect(page.getByText("已自动升级", { exact: false })).toBeVisible()
})

test("状态机：断开患者 → 失联告警 → 恢复自消", async ({ page }) => {
  await page.goto("/caregiver/alerts")
  await page.getByRole("button", { name: "断开患者" }).click()
  // 心跳超时（≈6s）后失联
  await expect(page.getByText("患者失联", { exact: false })).toBeVisible({
    timeout: 12_000,
  })
  await page.getByRole("button", { name: "恢复在线" }).click()
  await expect(page.getByText("患者在线", { exact: false })).toBeVisible()
  await expect(page.getByText("已恢复在线", { exact: false })).toBeVisible()
})

test("提醒管理：新增 → 编辑 → 删除", async ({ page }) => {
  await page.goto("/caregiver/reminders")

  // 新增
  await page.getByRole("button", { name: "新增提醒" }).click()
  await page.getByPlaceholder("如：午间血压药").fill("测试提醒A")
  await page.getByRole("button", { name: "添加提醒" }).click()
  await expect(page.getByText("测试提醒A")).toBeVisible()

  // 编辑（点该行进入编辑，改标题保存）
  await page.getByText("测试提醒A").click()
  await page.getByPlaceholder("如：午间血压药").fill("测试提醒B")
  await page.getByRole("button", { name: "保存修改" }).click()
  await expect(page.getByText("测试提醒B")).toBeVisible()
  await expect(page.getByText("测试提醒A")).toHaveCount(0)

  // 删除（编辑态 → 删除 → 确认删除）
  await page.getByText("测试提醒B").click()
  await page.getByRole("button", { name: "删除" }).click()
  await page.getByRole("button", { name: "确认删除" }).click()
  await expect(page.getByText("测试提醒B")).toHaveCount(0)
})
