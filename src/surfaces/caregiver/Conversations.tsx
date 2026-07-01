import { AlertTriangle, MessagesSquare } from "lucide-react"

import {
  EmptyState,
  InlineError,
  PageHeader,
  Sheet,
  SkeletonRows,
} from "@/components/states"
import { cn } from "@/lib/utils"
import { toneBg } from "@/lib/tone"
import { useResource } from "@/lib/useResource"
import {
  getConversations,
  type ConversationItem,
  type ConvMood,
} from "@/services/conversations"

const moods: Record<ConvMood, { label: string; dot: string; text: string }> = {
  happy: { label: "愉快", dot: "bg-emerald-500", text: "text-emerald-700" },
  calm: { label: "平稳", dot: "bg-ink/40", text: "text-muted-foreground" },
  anxious: { label: "焦虑", dot: "bg-amber-500", text: "text-amber-700" },
  sad: { label: "低落", dot: "bg-sky-500", text: "text-sky-700" },
}

function formatDuration(sec: number) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m} 分 ${String(s).padStart(2, "0")} 秒`
}

export function Conversations() {
  const { status, data, retry } = useResource(getConversations)

  return (
    <>
      <PageHeader
        light="对话"
        bold="记录"
        subtitle="AI 陪伴对话摘要与情绪信号"
      />
      <Sheet>
        {status === "loading" && <SkeletonRows rows={3} />}
        {status === "error" && <InlineError onRetry={retry} />}
        {status === "success" &&
          data &&
          (data.items.length === 0 ? (
            <EmptyState
              icon={MessagesSquare}
              title="还没有对话记录"
              hint="患者与 AI 家人的对话会在这里留存回看。"
            />
          ) : (
            <div className="space-y-3">
              {sortSensitiveFirst(data.items).map((item) => (
                <ConversationCard key={item.id} item={item} />
              ))}
            </div>
          ))}
      </Sheet>
    </>
  )
}

/** 稳定排序：敏感对话置顶，其余保持原顺序。 */
function sortSensitiveFirst(items: ConversationItem[]) {
  return [...items].sort((a, b) => {
    return Number(b.flaggedSensitive) - Number(a.flaggedSensitive)
  })
}

function ConversationCard({ item }: { item: ConversationItem }) {
  const mood = moods[item.mood]
  return (
    <article
      className={cn(
        "rounded-4xl bg-muted/50 p-4",
        item.flaggedSensitive &&
          "border-l-4 border-destructive bg-destructive/5 ring-2 ring-destructive/25"
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "grid h-11 w-11 shrink-0 place-items-center rounded-full font-display text-base font-extrabold text-ink",
            toneBg[item.tone]
          )}
        >
          {item.initial}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[0.95rem] leading-snug text-ink">
            <span className="font-bold">{item.name}</span>
            <span className="ml-1.5 text-xs font-medium text-muted-foreground">
              {item.relation}
            </span>
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full bg-card px-2.5 py-1 text-xs font-semibold",
                mood.text
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", mood.dot)} />
              {mood.label}
            </span>
            {item.flaggedSensitive && (
              <span className="inline-flex items-center gap-1 rounded-full bg-destructive px-2.5 py-1 text-xs font-bold text-destructive-foreground">
                <AlertTriangle className="h-3.5 w-3.5" strokeWidth={2.6} />
                敏感话题
              </span>
            )}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xs font-semibold text-muted-foreground">
            {item.startedAt}
          </p>
          <p className="mt-0.5 text-[0.7rem] font-medium text-muted-foreground">
            {formatDuration(item.durationSec)}
          </p>
        </div>
      </div>
      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
        {item.summary}
      </p>
    </article>
  )
}
