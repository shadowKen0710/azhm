import {
  CalendarDays,
  Check,
  ChevronRight,
  Footprints,
  Forward,
  Frown,
  GlassWater,
  Heart,
  HeartPulse,
  Meh,
  Phone,
  Pill,
  Quote,
  RotateCw,
  Settings,
  Siren,
  Smile,
} from "lucide-react"
import { useNavigate } from "react-router-dom"

import { useAuth } from "@/auth/AuthContext"
import { StatusBanner } from "@/components/MonitorControls"
import { Button } from "@/components/ui/button"
import { SectionTitle, Sheet } from "@/components/states"
import { ROUTES } from "@/app/routes"
import { cn } from "@/lib/utils"
import { useDashboard } from "@/queries/hooks"
import type { DayCell, Mood } from "@/mock/dashboard"
import { useMonitor, type MonReminder, type MonReminderIcon } from "@/state/monitor"

const moodIcon: Record<Mood, typeof Smile> = {
  happy: Smile,
  calm: Meh,
  anxious: Frown,
}

const reminderIcon: Record<MonReminderIcon, typeof Pill> = {
  pill: Pill,
  heart: HeartPulse,
  walk: Footprints,
  phone: Phone,
  water: GlassWater,
}

const WEEKDAYS = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"]

function todayLabel() {
  const d = new Date()
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 · ${WEEKDAYS[d.getDay()]}`
}

export function Dashboard() {
  const { status, data, retry } = useDashboard()
  const { user } = useAuth()
  const mon = useMonitor()
  const navigate = useNavigate()

  if (status === "loading") return <LoadingState />
  if (status === "error") return <ErrorState onRetry={retry} />
  if (!data) return null

  const highAlerts = mon.alerts.filter((a) => a.level === "high").length
  const summary = !mon.online
    ? "患者当前失联，请尽快联系确认。"
    : highAlerts > 0
      ? `有 ${highAlerts} 条待处理告警，今日服药 ${mon.medDone}/${mon.medTotal}。`
      : `今天状态平稳，情绪平和，今日服药 ${mon.medDone}/${mon.medTotal}。`

  const todayReminders = [...mon.reminders].sort((a, b) =>
    a.time.localeCompare(b.time)
  )

  return (
    <>
      <Header
        greeting={user?.name ?? "照护者"}
        dateLabel={todayLabel()}
        summary={summary}
        onPlan={() => navigate(ROUTES.reminders)}
        onSettings={() => navigate(ROUTES.settings)}
      />
      <Sheet>
        <div className="mb-6">
          <StatusBanner />
        </div>

        {highAlerts > 0 && (
          <button
            onClick={() => navigate(ROUTES.alerts)}
            className="mb-6 flex w-full items-center gap-3 rounded-4xl border-l-4 border-destructive bg-destructive/10 px-5 py-4 text-left"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-destructive text-destructive-foreground">
              <Siren className="h-5 w-5" />
            </span>
            <div className="flex-1">
              <p className="font-bold text-ink">{highAlerts} 条待处理告警</p>
              <p className="text-sm text-muted-foreground">点此查看告警中心</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>
        )}

        <SectionTitle light="本周" bold="状态" />
        <div className="mt-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <CalendarDays className="h-4 w-4" />
          <span>近 7 天情绪（示意）</span>
        </div>
        <div className="mt-5 flex justify-between gap-1.5">
          {data.week.map((d) => (
            <WeekPill key={d.date} cell={d} />
          ))}
        </div>

        <div className="mt-9 flex items-center justify-between">
          <SectionTitle light="今日" bold="提醒" />
          <button
            onClick={() => navigate(ROUTES.reminders)}
            className="flex items-center gap-1 text-sm font-semibold text-muted-foreground"
          >
            全部
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <ul className="mt-4 space-y-2.5">
          {todayReminders.map((item) => (
            <LiveReminderRow
              key={item.id}
              item={item}
              onComplete={() => mon.completeReminder(item.id)}
            />
          ))}
        </ul>

        <div className="mt-7 flex justify-center">
          <Button variant="outline" className="px-9" onClick={() => navigate(ROUTES.reminders)}>
            管理提醒
          </Button>
        </div>
      </Sheet>
    </>
  )
}

/* ---------- 黄色问候头卡 ---------- */
function Header({
  greeting,
  dateLabel,
  summary,
  onPlan,
  onSettings,
}: {
  greeting: string
  dateLabel: string
  summary: string
  onPlan: () => void
  onSettings: () => void
}) {
  return (
    <header className="bg-sun px-7 pb-11 pt-9">
      <div className="flex items-center justify-between text-ink/70">
        <span className="text-sm font-semibold">{dateLabel}</span>
        <button
          aria-label="设置"
          onClick={onSettings}
          className="grid h-9 w-9 place-items-center rounded-full text-ink transition-colors hover:bg-ink/10"
        >
          <Settings className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <h1 className="font-display text-[2.05rem] leading-[1.1] text-ink">
          <span className="font-medium">你好，</span>
          <span className="whitespace-nowrap font-extrabold">{greeting}</span>
        </h1>
        <Button size="sm" className="h-11 shrink-0 px-5" onClick={onPlan}>
          今日计划
        </Button>
      </div>

      <Quote className="mt-6 h-7 w-7 rotate-180 fill-ink text-ink" />
      <p className="mt-2 text-[1.06rem] font-medium leading-relaxed text-ink">
        {summary}
      </p>

      <div className="mt-4 flex items-center justify-between">
        <span className="font-display text-sm font-bold text-ink">
          — 今日守护摘要
        </span>
        <div className="flex items-center gap-4 text-ink">
          <Heart className="h-5 w-5 fill-ink" />
          <Forward className="h-5 w-5" />
        </div>
      </div>
    </header>
  )
}

/* ---------- 周历胶囊 ---------- */
function WeekPill({ cell }: { cell: DayCell }) {
  const Face = cell.mood ? moodIcon[cell.mood] : null
  const today = cell.today

  return (
    <div
      className={cn(
        "flex h-[92px] w-[44px] flex-col items-center justify-between rounded-full py-3 transition-colors",
        today && "bg-ink text-cream",
        !today && cell.mood && "bg-sun text-ink",
        !today &&
          !cell.mood &&
          "border-2 border-border bg-transparent text-muted-foreground"
      )}
    >
      <span className="grid h-6 w-6 place-items-center">
        {Face ? (
          <Face className={cn("h-5 w-5", today ? "text-cream" : "text-ink")} />
        ) : (
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              today ? "bg-cream" : "bg-muted-foreground/60"
            )}
          />
        )}
      </span>
      <div className="flex flex-col items-center leading-none">
        <span className="font-display text-lg font-extrabold">{cell.date}</span>
        <span className="mt-1 text-[0.66rem] font-semibold opacity-80">
          {cell.weekday}
        </span>
      </div>
    </div>
  )
}

/* ---------- 实时提醒行 ---------- */
function LiveReminderRow({
  item,
  onComplete,
}: {
  item: MonReminder
  onComplete: () => void
}) {
  const Icon = reminderIcon[item.icon]
  const missed = item.status === "missed"
  return (
    <li
      className={cn(
        "flex items-center gap-3 rounded-3xl px-4 py-3",
        missed ? "bg-secondary" : "bg-muted/50"
      )}
    >
      <span className="w-10 shrink-0 font-display text-sm font-extrabold text-ink">
        {item.time}
      </span>
      <Icon className="h-5 w-5 shrink-0 text-sun" strokeWidth={2.4} />
      <span className="flex-1 text-[0.95rem] font-medium text-ink">
        {item.title}
      </span>
      {item.status === "done" ? (
        <span className="grid h-8 w-8 place-items-center rounded-full bg-ink text-cream">
          <Check className="h-4 w-4" strokeWidth={3} />
        </span>
      ) : (
        <button
          onClick={onComplete}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-bold",
            missed
              ? "bg-destructive text-destructive-foreground"
              : "border-2 border-ink/15 text-ink"
          )}
        >
          {missed ? "已错过 · 补记" : "完成"}
        </button>
      )}
    </li>
  )
}

/* ---------- 错误态（整屏暖黄，SOS 不受影响） ---------- */
function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-sun px-8 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-full bg-ink/10">
        <RotateCw className="h-8 w-8 text-ink" />
      </div>
      <p className="mt-5 font-display text-xl font-extrabold text-ink">
        没能加载今天的数据
      </p>
      <p className="mt-2 max-w-[240px] text-sm font-medium text-ink/70">
        接口占位错误。检查网络后重试，SOS 与提醒不受影响。
      </p>
      <Button className="mt-6" onClick={onRetry}>
        重试
      </Button>
    </div>
  )
}

/* ---------- 加载态骨架 ---------- */
function LoadingState() {
  return (
    <div className="flex-1 animate-pulse-soft">
      <div className="bg-sun px-7 pb-11 pt-9">
        <div className="flex items-center justify-between">
          <div className="h-4 w-28 rounded-full bg-ink/15" />
          <div className="h-9 w-9 rounded-full bg-ink/15" />
        </div>
        <div className="mt-6 h-12 w-3/4 rounded-2xl bg-ink/15" />
        <div className="mt-6 h-4 w-full rounded-full bg-ink/15" />
        <div className="mt-2 h-4 w-2/3 rounded-full bg-ink/15" />
      </div>
      <div className="rounded-t-[34px] bg-card px-7 pb-9 pt-7">
        <div className="h-6 w-32 rounded-full bg-muted" />
        <div className="mt-5 flex justify-between gap-1.5">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-[92px] w-[44px] rounded-full bg-muted" />
          ))}
        </div>
        <div className="mt-9 h-6 w-32 rounded-full bg-muted" />
        <div className="mt-5 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-6 w-full rounded-full bg-muted" />
          ))}
        </div>
      </div>
    </div>
  )
}
