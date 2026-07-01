import {
  CalendarDays,
  Footprints,
  Forward,
  Frown,
  Heart,
  HeartPulse,
  Meh,
  Phone,
  Pill,
  Plus,
  Quote,
  RotateCw,
  Settings,
  Smile,
  Trash2,
  Utensils,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { StatusBanner } from "@/components/MonitorControls"
import { EmptyState, SectionTitle, Sheet } from "@/components/states"
import { cn } from "@/lib/utils"
import { useDashboard } from "@/queries/hooks"
import type { DashboardData } from "@/services/dashboard"
import type { DayCell, Mood, ReminderItem } from "@/mock/dashboard"

const moodIcon: Record<Mood, typeof Smile> = {
  happy: Smile,
  calm: Meh,
  anxious: Frown,
}

const reminderIcon: Record<ReminderItem["icon"], typeof Pill> = {
  pill: Pill,
  heart: HeartPulse,
  walk: Footprints,
  phone: Phone,
  meal: Utensils,
}

export function Dashboard() {
  const { status, data, retry } = useDashboard()

  if (status === "loading") return <LoadingState />
  if (status === "error") return <ErrorState onRetry={retry} />
  if (!data) return null

  const empty = data.reminderGroups.length === 0
  return (
    <>
      <Header data={data} />
      <Sheet>
        <div className="mb-6">
          <StatusBanner />
        </div>
        <SectionTitle light="本周" bold="状态" />
        <div className="mt-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <CalendarDays className="h-4 w-4" />
          <span>{data.weekRange}</span>
        </div>
        <div className="mt-5 flex justify-between gap-1.5">
          {data.week.map((d) => (
            <WeekPill key={d.date} cell={d} />
          ))}
        </div>

        <div className="mt-9">
          <SectionTitle light="今日" bold="提醒" />
        </div>

        {empty ? (
          <div className="mt-5">
            <EmptyState
              icon={Plus}
              title="还没有提醒"
              hint="添加第一条用药或日程提醒，开始守护。"
              actionLabel="新增提醒"
            />
          </div>
        ) : (
          <>
            <div className="mt-5 space-y-6">
              {data.reminderGroups.map((group) => (
                <div key={group.label}>
                  <h3 className="font-display text-sm font-bold text-ink">
                    {group.label}
                  </h3>
                  <ul className="mt-1">
                    {group.items.map((item) => (
                      <ReminderRow key={item.id} item={item} />
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-7 flex justify-center">
              <Button variant="outline" className="px-9">
                管理提醒
              </Button>
            </div>
          </>
        )}
      </Sheet>
    </>
  )
}

/* ---------- 黄色问候头卡 ---------- */
function Header({ data }: { data: DashboardData }) {
  return (
    <header className="bg-sun px-7 pb-11 pt-9">
      <div className="flex items-center justify-between text-ink/70">
        <span className="text-sm font-semibold">{data.dateLabel}</span>
        <button
          aria-label="设置"
          className="grid h-9 w-9 place-items-center rounded-full text-ink transition-colors hover:bg-ink/10"
        >
          <Settings className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <h1 className="font-display text-[2.05rem] leading-[1.1] text-ink">
          <span className="font-medium">你好，</span>
          <span className="whitespace-nowrap font-extrabold">
            {data.caregiverName}
          </span>
        </h1>
        <Button size="sm" className="h-11 shrink-0 px-5">
          今日计划
        </Button>
      </div>

      <Quote className="mt-6 h-7 w-7 rotate-180 fill-ink text-ink" />
      <p className="mt-2 text-[1.06rem] font-medium leading-relaxed text-ink">
        {data.summary}
      </p>

      <div className="mt-4 flex items-center justify-between">
        <span className="font-display text-sm font-bold text-ink">
          — {data.summaryBy}
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

/* ---------- 提醒行 ---------- */
function ReminderRow({ item }: { item: ReminderItem }) {
  const Icon = reminderIcon[item.icon]
  return (
    <li className="flex items-center gap-3 border-b border-border/70 py-3.5 last:border-b-0">
      <Icon className="h-5 w-5 shrink-0 text-sun" strokeWidth={2.4} />
      <span className="flex-1 text-[0.98rem] font-medium text-ink">
        {item.title}
      </span>
      {item.removable && (
        <button
          aria-label="删除提醒"
          className="grid h-9 w-9 place-items-center rounded-2xl bg-ink text-cream transition-transform hover:scale-95"
        >
          <Trash2 className="h-4 w-4" />
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
