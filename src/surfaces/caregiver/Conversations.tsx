import { AlertTriangle, ChevronRight, MessagesSquare } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { FamilyAvatar } from "@/components/FamilyAvatar"
import { EmptyState, PageHeader, Sheet } from "@/components/states"
import { cn } from "@/lib/utils"
import { moodMeta, relTime } from "@/surfaces/caregiver/conversationUtils"
import {
  useConversationsStore,
  type ConversationRecord,
} from "@/state/conversations"

/** 稳定排序：敏感对话置顶，其余按时间倒序（新的在前）。 */
function ordered(items: ConversationRecord[]) {
  return [...items].sort((a, b) => {
    const s = Number(b.flaggedSensitive) - Number(a.flaggedSensitive)
    return s !== 0 ? s : b.at - a.at
  })
}

export function Conversations() {
  const { records } = useConversationsStore()
  const navigate = useNavigate()

  return (
    <>
      <PageHeader
        light="对话"
        bold="记录"
        subtitle="AI 陪伴对话摘要与情绪信号"
      />
      <Sheet>
        {records.length === 0 ? (
          <EmptyState
            icon={MessagesSquare}
            title="还没有对话记录"
            hint="患者与 AI 家人的对话会在这里留存回看。"
          />
        ) : (
          <div className="space-y-3">
            {ordered(records).map((item) => (
              <ConversationCard
                key={item.id}
                item={item}
                onOpen={() => navigate(`/caregiver/conversations/${item.id}`)}
              />
            ))}
          </div>
        )}
      </Sheet>
    </>
  )
}

function ConversationCard({
  item,
  onOpen,
}: {
  item: ConversationRecord
  onOpen: () => void
}) {
  const mood = moodMeta[item.mood]
  return (
    <button
      onClick={onOpen}
      className={cn(
        "w-full rounded-4xl bg-muted/50 p-4 text-left transition-transform active:scale-[0.99]",
        item.flaggedSensitive &&
          "border-l-4 border-destructive bg-destructive/5 ring-2 ring-destructive/25"
      )}
    >
      <div className="flex items-start gap-3">
        <FamilyAvatar
          photo={item.photo}
          initial={item.initial}
          tone={item.tone}
          className="h-11 w-11 text-base"
        />
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
        <div className="flex shrink-0 items-center gap-1">
          <span className="text-xs font-semibold text-muted-foreground">
            {relTime(item.at)}
          </span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
        {item.summary}
      </p>
    </button>
  )
}
