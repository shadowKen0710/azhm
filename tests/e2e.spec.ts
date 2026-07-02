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

test("落地页公开可访问，CTA 通向登录", async ({ page }) => {
  await page.addInitScript(() => localStorage.removeItem("azhm.auth"))
  await page.goto("/")
  await expect(
    page.getByRole("heading", { name: /陪 TA 慢慢想起/ })
  ).toBeVisible()
  await expect(page.getByText("明明白白，用多少付多少")).toBeVisible()
  await page.getByRole("link", { name: "照护者登录" }).first().click()
  await page.waitForURL("**/login")
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

test("认人卡：新增 → 编辑 → 删除", async ({ page }) => {
  await page.goto("/caregiver/memory-cards")

  // 新增家人
  await page.getByRole("button", { name: "新增家人" }).click()
  await page.getByPlaceholder("如：小雯").fill("测试家人甲")
  await page.getByPlaceholder("如：女儿").fill("表弟")
  await page.getByRole("button", { name: "添加家人" }).click()
  await expect(page.getByText("测试家人甲", { exact: true })).toBeVisible()

  // 编辑（点卡片进入编辑，改姓名保存）
  await page.getByText("测试家人甲", { exact: true }).click()
  await page.getByPlaceholder("如：小雯").fill("测试家人乙")
  await page.getByRole("button", { name: "保存修改" }).click()
  await expect(page.getByText("测试家人乙", { exact: true })).toBeVisible()
  await expect(page.getByText("测试家人甲", { exact: true })).toHaveCount(0)

  // 持久化：刷新后仍在（家人档案存 localStorage，患者大屏也读同一份）
  await page.reload()
  await expect(page.getByText("测试家人乙", { exact: true })).toBeVisible()

  // 患者「认认人」轮播能看到 5 位家人（含新增）
  await page.goto("/patient/who")
  await expect(page.getByText("/ 5", { exact: false })).toBeVisible()

  // 删除
  await page.goto("/caregiver/memory-cards")
  await page.getByText("测试家人乙", { exact: true }).click()
  await page.getByRole("button", { name: "删除" }).click()
  await page.getByRole("button", { name: "确认删除" }).click()
  await expect(page.getByText("测试家人乙", { exact: true })).toHaveCount(0)
})

test("声线授权：录音 → 训练 → 就绪，撤销后患者不可对话", async ({ page }) => {
  await page.goto("/caregiver/voices")

  // 建国(f2) 种子为已撤销 → 重新授权，进入录音流程
  await page.getByRole("button", { name: "重新授权" }).click()

  // 同意 → 录音
  await page.getByRole("button", { name: "确认同意" }).click()
  await page.getByRole("button", { name: "下一步 · 录音" }).click()

  // 真实麦克风（假设备）录音 ≥2s → 停止
  await page.getByRole("button", { name: "开始录音" }).click()
  await page.waitForTimeout(2600)
  await page.getByRole("button", { name: "停止录音" }).click()

  // 试听 → 开始学习 → 训练 → 就绪
  await page.getByRole("button", { name: "开始学习" }).click()
  await expect(page.getByText("声线已就绪", { exact: false })).toBeVisible({
    timeout: 15_000,
  })
  await page.getByRole("button", { name: "完成" }).click()

  // 撤销授权 → 患者端该家人「暂不可对话」
  await page.goto("/caregiver/voices")
  // 小雯(f1) 为第一张可用卡 → 撤销其授权
  await page.getByRole("button", { name: "撤销授权" }).first().click()
  await page.getByRole("button", { name: "确认撤销" }).first().click()

  await page.goto("/patient")
  await expect(page.getByText("暂不可对话").first()).toBeVisible()
})

test("记忆库：看护者投喂故事 → 患者对话引用该回忆", async ({ page }) => {
  await page.goto("/caregiver/memories")

  // 给小雯(第一个家人)添加一段记忆
  await page.getByRole("button", { name: "给小雯添加记忆" }).click()
  await page.getByPlaceholder("如：夏夜的萤火虫").fill("放风筝")
  await page
    .locator("textarea")
    .fill("你小时候最爱在广场上放那只大燕子风筝，")
  await page.getByRole("button", { name: "让 AI 记住" }).click()
  await expect(page.getByText("放风筝", { exact: true })).toBeVisible()

  // 患者与小雯(v1)对话：AI 开场应织入该回忆
  await page.goto("/patient/talk/v1?by=family")
  await expect(page.getByText("放那只大燕子风筝", { exact: false })).toBeVisible(
    { timeout: 8000 }
  )
})

test("算力钱包：充值到账 + 训练扣费", async ({ page }) => {
  await page.goto("/caregiver/wallet")

  // 顶栏余额胶囊（初始 500 点）
  await expect(page.getByRole("button", { name: /500 点/ })).toBeVisible()

  // 充值 1000 点套餐（含赠 50）→ 支付宝 → 成功
  await page.getByRole("button", { name: "充值算力" }).click()
  await page.getByRole("button", { name: /1000 点/ }).click()
  await page.getByRole("button", { name: "支付宝" }).click()
  await page.getByRole("button", { name: /支付 ¥/ }).click()
  await expect(page.getByText("充值成功")).toBeVisible({ timeout: 8000 })
  await page.getByRole("button", { name: "完成" }).click()
  // 500 + 1000 + 50 = 1550
  await expect(page.getByRole("button", { name: /1,?550 点/ })).toBeVisible()

  // 去训练小雯声线（扣 320 点）→ 余额应下降
  await page.goto("/caregiver/voices")
  // 小雯已就绪，先撤销再重新授权以触发训练；或直接训练已撤销的建国
  await page.getByRole("button", { name: "重新授权" }).click()
  await page.getByRole("button", { name: "确认同意" }).click()
  await page.getByRole("button", { name: "下一步 · 录音" }).click()
  await page.getByRole("button", { name: "开始录音" }).click()
  await page.waitForTimeout(2600)
  await page.getByRole("button", { name: "停止录音" }).click()
  await page.getByRole("button", { name: "开始学习" }).click()
  await expect(page.getByText("声线已就绪", { exact: false })).toBeVisible({
    timeout: 15_000,
  })
  await page.getByRole("button", { name: "完成" }).click()
  // 1550 - 320 = 1230
  await expect(page.getByRole("button", { name: /1,?230 点/ })).toBeVisible()
})

test("对话记录：列表 → 详情逐句记录", async ({ page }) => {
  await page.goto("/caregiver/conversations")
  // 敏感对话置顶
  await expect(page.getByText("敏感话题").first()).toBeVisible()
  // 点第一条进入详情
  await page.getByText("想出门找孩子", { exact: false }).click()
  await page.waitForURL("**/caregiver/conversations/**")
  await expect(page.getByText("逐句记录")).toBeVisible()
  await expect(page.getByText("我要出门去找你", { exact: false })).toBeVisible()
  // 返回列表
  await page.getByRole("button", { name: "返回" }).click()
  await page.waitForURL(/\/caregiver\/conversations$/)
})

test("患者对话 → 生成对话记录", async ({ page }) => {
  // 患者与小雯(v1)对话后挂断 → 照护者对话记录新增一条
  await page.goto("/patient/talk/v1?by=family")
  await expect(page.getByText("正在和女儿通话")).toBeVisible()
  await page.getByRole("button", { name: "挂断" }).click()
  await page.waitForURL(/\/patient$/)

  await page.goto("/caregiver/conversations")
  // 新记录：小雯的对话，含开场白摘要
  await expect(page.getByText("小雯").first()).toBeVisible()
})

test("设置：编辑并保存，刷新后仍在", async ({ page }) => {
  await page.goto("/caregiver/settings")

  const nameInput = page.locator("input").first() // 患者姓名
  await nameInput.fill("王奶奶")
  await page.getByRole("button", { name: "保存修改" }).click()
  await expect(page.getByRole("button", { name: "已保存" })).toBeVisible()

  // 刷新后仍在（localStorage 持久化）
  await page.reload()
  await expect(page.locator("input").first()).toHaveValue("王奶奶")
})
