import { useMonitor } from "@/state/monitor"

/** 演示 · 异常路径触发（真实由到点/心跳事件驱动，这里手动模拟）。 */
export function MonitorControls() {
  const { online, reminders, armReminder, completeReminder, setConnected } =
    useMonitor()
  const med = reminders.find((r) => r.id === "r2")
  const medMissed = med?.status === "missed"

  return (
    <div className="rounded-4xl border border-dashed border-border px-4 py-3">
      <p className="mb-2 text-xs font-semibold text-muted-foreground">
        演示 · 异常路径（计时器驱动，约几秒后触发）
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => armReminder("r2")}
          className="rounded-full bg-secondary px-3 py-2 text-xs font-bold text-ink"
        >
          {medMissed ? "重新计时服药" : "服药提醒计时"}
        </button>
        <button
          onClick={() => completeReminder("r2")}
          className="rounded-full bg-ink px-3 py-2 text-xs font-bold text-cream"
        >
          标记已服药
        </button>
        {online ? (
          <button
            onClick={() => setConnected(false)}
            className="rounded-full border-2 border-destructive/40 px-3 py-2 text-xs font-bold text-destructive"
          >
            断开患者
          </button>
        ) : (
          <button
            onClick={() => setConnected(true)}
            className="rounded-full bg-sun px-3 py-2 text-xs font-bold text-ink"
          >
            恢复在线
          </button>
        )}
      </div>
    </div>
  )
}

/** 患者在线/失联横幅（Dashboard 与告警中心共用）。 */
export function StatusBanner() {
  const { online, lastSeenLabel, medDone, medTotal } = useMonitor()
  return (
    <div
      className={
        online
          ? "flex items-center justify-between rounded-3xl bg-secondary px-5 py-3"
          : "flex items-center justify-between rounded-3xl bg-destructive px-5 py-3 text-destructive-foreground"
      }
    >
      <div className="flex items-center gap-2.5">
        <span
          className={
            online
              ? "h-2.5 w-2.5 rounded-full bg-emerald-500"
              : "h-2.5 w-2.5 rounded-full bg-white"
          }
        />
        <span className={online ? "font-bold text-ink" : "font-bold"}>
          {online ? "患者在线 · 刚刚" : `患者失联 · 最后在线 ${lastSeenLabel}`}
        </span>
      </div>
      <span
        className={
          online
            ? "text-sm font-semibold text-ink/70"
            : "text-sm font-semibold text-destructive-foreground/90"
        }
      >
        今日服药 {medDone}/{medTotal}
      </span>
    </div>
  )
}
