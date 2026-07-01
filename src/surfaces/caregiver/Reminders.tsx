import {
  Check,
  Footprints,
  GlassWater,
  HeartPulse,
  Phone,
  Pill,
  Plus,
  Utensils,
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
import {
  getReminders,
  type Reminder,
  type ReminderStatus,
} from "@/services/reminders"

const icons = {
  pill: Pill,
  heart: HeartPulse,
  walk: Footprints,
  phone: Phone,
  meal: Utensils,
  water: GlassWater,
}

export function Reminders() {
  const { status, data, retry } = useResource(getReminders)

  return (
    <>
      <PageHeader
        light="今日"
        bold="提醒"
        subtitle={data ? `已完成 ${data.doneCount}/${data.total}` : undefined}
        right={<AddButton />}
      />
      <Sheet>
        {status === "loading" && <SkeletonRows rows={5} />}
        {status === "error" && <InlineError onRetry={retry} />}
        {status === "success" &&
          data &&
          (data.sections.length === 0 ? (
            <EmptyState
              icon={Plus}
              title="还没有提醒"
              hint="添加第一条用药或日程提醒，开始守护。"
              actionLabel="新增提醒"
            />
          ) : (
            <div className="space-y-7">
              {data.sections.map((section) => (
                <div key={section.label}>
                  <h3 className="font-display text-sm font-bold text-ink">
                    {section.label}
                  </h3>
                  <ul className="mt-2 space-y-2.5">
                    {section.items.map((item) => (
                      <ReminderRow key={item.id} item={item} />
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

function ReminderRow({ item }: { item: Reminder }) {
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
      <div className="flex-1">
        <p className="text-[0.95rem] font-medium leading-snug text-ink">
          {item.title}
        </p>
        {item.voice && (
          <span className="mt-0.5 inline-block text-xs font-semibold text-muted-foreground">
            🔊 {item.voice}声线播报
          </span>
        )}
      </div>
      <StatusBadge status={item.status} />
    </li>
  )
}

function StatusBadge({ status }: { status: ReminderStatus }) {
  if (status === "done")
    return (
      <span className="grid h-8 w-8 place-items-center rounded-full bg-ink text-cream">
        <Check className="h-4 w-4" strokeWidth={3} />
      </span>
    )
  if (status === "missed")
    return (
      <span className="rounded-full bg-destructive px-3 py-1.5 text-xs font-bold text-destructive-foreground">
        已错过
      </span>
    )
  return (
    <span className="rounded-full border-2 border-ink/15 px-3 py-1.5 text-xs font-bold text-muted-foreground">
      待办
    </span>
  )
}
