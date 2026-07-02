import type { ConvMood } from "@/services/conversations"

export const moodMeta: Record<
  ConvMood,
  { label: string; dot: string; text: string }
> = {
  happy: { label: "愉快", dot: "bg-emerald-500", text: "text-emerald-700" },
  calm: { label: "平稳", dot: "bg-ink/40", text: "text-muted-foreground" },
  anxious: { label: "焦虑", dot: "bg-amber-500", text: "text-amber-700" },
  sad: { label: "低落", dot: "bg-sky-500", text: "text-sky-700" },
}

export function formatDuration(sec: number) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m} 分 ${String(s).padStart(2, "0")} 秒`
}

/** 时间戳 → 相对时间标签（种子用小数字表示示例数据）。 */
export function relTime(ts: number) {
  if (ts < 1e6) return "示例"
  const d = new Date(ts)
  const now = new Date()
  const sameDay = d.toDateString() === now.toDateString()
  const p = (n: number) => String(n).padStart(2, "0")
  const hm = `${p(d.getHours())}:${p(d.getMinutes())}`
  return sameDay ? `今天 ${hm}` : `${d.getMonth() + 1}/${d.getDate()} ${hm}`
}
