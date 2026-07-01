# [阿兹海默患者守护app] —— 带界面的 POC  
  
## 文档  
- 产品规格（事实来源）: [SPEC.md](SPEC.md)  
- 界面走查 / 对外演示索引（含全部截图与直达 URL）: [docs/WALKTHROUGH.md](docs/WALKTHROUGH.md)  
  
## 技术栈  
React + Vite + TypeScript + Tailwind + shadcn/ui  
  
## 命令  
- 开发预览: npm run dev  
- 构建: npm run build  
- 代码检查: npm run lint  
  
## 设计约定  
- 每次写前端代码前，先加载 frontend-design skill，无例外  
- 用 shadcn/ui 组件，不要手搓  
- 禁止默认 Tailwind 紫色和默认 Inter 字体  
- 每个组件都要实现：加载 / 空 / 错误 / 正常 四种状态  
  
## 截图验证  
- 改完界面后，截图当前状态，和我给的参考图对照，对不齐就改了再截  
  
## 边界  
- 数据先用假数据（mock），不连真实后端  
