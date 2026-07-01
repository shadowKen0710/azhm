import {
  Check,
  Footprints,
  GlassWater,
  HeartPulse,
  Phone,
  Pill,
  Plus,
} from "lucide-react"

import {
  EmptyState,
  InlineError,
  PageHeader,
  Sheet,
  SkeletonRows,
} from "@/components/states"
import { cn } from "@/lib/utils"
import { useResource } from "@/lib/useResource"
import { getReminders } from "@/services/reminders"
import { useMonitor, type MonReminder } from "@/state/monitor"

const icons = {
  pill: Pill,
  heart: HeartPulse,
  walk: Footprints,
  phone: Phone,
  water: GlassWater,
}

const PERIODS = ["上午", "下午", "晚上"] as const

function periodOf(time: string) {
  const h = Number(time.split(":")[0])
  return h < 12 ? "上午" : h < 18 ? "下午" : "晚上"
}

export function Reminders() {
  // useResource 只用于四态外壳（加载/空/错误演示）；正常态渲染实时状态机数据。
  const { status, retry } = useResource(getReminders)
  const { reminders, completeReminder } = useMonitor()

  const done = reminders.filter((r) => r.status === "done").length
  const sections = PERIODS.map((label) => ({
    label,
    items: reminders.filter((r) => periodOf(r.time) === label),
  })).filter((s) => s.items.length > 0)

  return (
    <>
      <PageHeader
        light="今日"
        bold="提醒"
        subtitle={`已完成 ${done}/${reminders.length}`}
        right={<AddButton />}
      />
      <Sheet>
        {status === "loading" && <SkeletonRows rows={5} />}
        {status === "error" && <InlineError onRetry={retry} />}
        {status === "success" &&
          (sections.length === 0 ? (
            <EmptyState
              icon={Plus}
              title="还没有提醒"
              hint="添加第一条用药或日程提醒，开始守护。"
              actionLabel="新增提醒"
            />
          ) : (
            <div className="space-y-7">
              {sections.map((section) => (
                <div key={section.label}>
                  <h3 className="font-display text-sm font-bold text-ink">
                    {section.label}
                  </h3>
                  <ul className="mt-2 space-y-2.5">
                    {section.items.map((item) => (
                      <ReminderRow
                        key={item.id}
                        item={item}
                        onComplete={() => completeReminder(item.id)}
                      />
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ))}
      </Sheet>
    </>
  )
}

function AddButton() {
  return (
    <button
      aria-label="新增提醒"
      className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-ink text-cream transition-transform hover:scale-95"
    >
      <Plus className="h-5 w-5" />
    </button>
  )
}

function ReminderRow({
  item,
  onComplete,
}: {
  item: MonReminder
  onComplete: () => void
}) {
  const Icon = icons[item.icon]
  const missed = item.status === "missed"
  return (
    <li
      className={cn(
        "flex items-center gap-3 rounded-3xl px-4 py-3.5",
        missed ? "bg-secondary" : "bg-muted/50"
      )}
    >
      <div className="flex w-11 shrink-0 flex-col items-center">
        <span className="font-display text-sm font-extrabold text-ink">
          {item.time.split(":")[0]}
        </span>
        <span className="text-[0.66rem] font-semibold text-muted-foreground">
          {item.time.split(":")[1]}
        </span>
      </div>
      <Icon className="h-5 w-5 shrink-0 text-sun" strokeWidth={2.4} />
      <p className="flex-1 text-[0.95rem] font-medium leading-snug text-ink">
        {item.title}
      </p>
      {item.status === "done" ? (
        <span className="grid h-8 w-8 place-items-center rounded-full bg-ink text-cream">
          <Check className="h-4 w-4" strokeWidth={3} />
        </span>
      ) : item.status === "missed" ? (
        <button
          onClick={onComplete}
          className="rounded-full bg-destructive px-3 py-1.5 text-xs font-bold text-destructive-foreground"
        >
          已错过 · 补记
        </button>
      ) : (
        <button
          onClick={onComplete}
          className="rounded-full border-2 border-ink/15 px-3 py-1.5 text-xs font-bold text-ink"
        >
          标记完成
        </button>
      )}
    </li>
  )
}
