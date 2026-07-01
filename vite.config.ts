import path from "node:path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// GitHub Pages 项目站点在 /azhm/ 下；本地开发仍用 /。
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/azhm/" : "/",
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}))
