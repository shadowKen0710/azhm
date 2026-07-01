# 阿兹海默症患者守护 App（POC）

**在线预览**：https://shadowken0710.github.io/azhm/ ·
**仓库**：https://github.com/shadowKen0710/azhm

> 顶部可切「照护者 ⇄ 患者」与四态开关。患者大屏被动事件可直达：
> [家人来电](https://shadowken0710.github.io/azhm/patient?call=family) ·
> [AI 来电](https://shadowken0710.github.io/azhm/patient?call=ai) ·
> [到点提醒](https://shadowken0710.github.io/azhm/patient?remind=1)

带界面的 POC：**照护者监控**患者健康安全为主，**患者**通过大屏零操作被动接收家人 / AI 仿真家人的通话；并覆盖用药日程提醒、一键 SOS、认人卡、AI 声线陪伴。

- 照护者端 = 竖屏手机控制台；患者端 = 横屏智能屏/电视大屏。
- 数据为占位假数据，经 service 层抽象，可无痛替换真实 API。

## 快速开始

```bash
npm install
npm run dev        # http://localhost:5173/
npm run build      # 生产构建（含 tsc 类型检查）
npm run test:e2e   # Playwright 关键交互链路测试（需 npx playwright install chromium）
```

顶部有 **角色切换**（照护者 ⇄ 患者）与 **演示态开关**（正常 / 空数据 / 错误 / 加载中）。

## 文档

- **产品规格（事实来源）**：[SPEC.md](SPEC.md)
- **界面走查 / 演示索引**（全部截图 + 直达 URL + 演示脚本）：[docs/WALKTHROUGH.md](docs/WALKTHROUGH.md)

## 技术栈

React + Vite + TypeScript + Tailwind + shadcn/ui。

## 目录速览

```
src/
  surfaces/caregiver/   照护者控制台各页
  surfaces/patient/     患者大屏各页
  components/           共享 UI（状态视图、导航、通话总线、演示态）
  services/             数据访问层（mock + mockFetch 封装）
docs/                   界面走查与截图
SPEC.md                 完整产品规格
```
