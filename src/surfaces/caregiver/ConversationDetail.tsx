import {
  AlertTriangle,
  ArrowLeft,
  Clock,
  Sparkles,
} from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"

import { FamilyAvatar } from "@/components/FamilyAvatar"
import { PageHeader, Sheet } from "@/components/states"
import { cn } from "@/lib/utils"
import {
  formatDuration,
  moodMeta,
  relTime,
} from "@/surfaces/caregiver/conversationUtils"
import { useConversationsStore } from "@/state/conversations"
import type { TalkTurn } from "@/services/patient"

export function ConversationDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { byId } = useConversationsStore()
  const conv = id ? byId(id) : undefined

  if (!conv) {
    return (
      <>
        <PageHeader light="对话" bold="详情" />
        <Sheet>
          <p className="rounded-4xl bg-muted/50 px-5 py-6 text-center text-sm text-muted-foreground">
            找不到这条对话记录。
          </p>
          <button
            onClick={() => navigate("/caregiver/conversations")}
            className="mt-4 flex items-center gap-1.5 text-sm font-bold text-ink"
          >
            <ArrowLeft className="h-4 w-4" />
            返回列表
          </button>
        </Sheet>
      </>
    )
  }

  const mood = moodMeta[conv.mood]

  return (
    <>
      <PageHeader
        light="对话"
        bold="详情"
        right={
          <button
            onClick={() => navigate("/caregiver/conversations")}
            aria-label="返回"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-ink/10 text-ink"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        }
      />
      <Sheet>
        {/* 头部：家人 + 元信息 */}
        <div className="flex items-center gap-3">
          <FamilyAvatar
            photo={conv.photo}
            initial={conv.initial}
            tone={conv.tone}
            className="h-14 w-14 text-xl"
          />
          <div className="flex-1">
            <p className="font-display text-lg font-extrabold text-ink">
              {conv.name}
              <span className="ml-2 text-sm font-semibold text-muted-foreground">
                {conv.relation}
              </span>
            </p>
            <p className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5" /> AI 声线陪聊 · {relTime(conv.at)}
            </p>
          </div>
        </div>

        {/* 徽标行 */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-semibold",
              mood.text
            )}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", mood.dot)} />
            情绪 · {mood.label}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            {formatDuration(conv.durationSec)}
          </span>
          {conv.flaggedSensitive && (
            <span className="inline-flex items-center gap-1 rounded-full bg-destructive px-3 py-1.5 text-xs font-bold text-destructive-foreground">
              <AlertTriangle className="h-3.5 w-3.5" strokeWidth={2.6} />
              敏感话题
            </span>
          )}
        </div>

        {/* 摘要 */}
        <div className="mt-4 rounded-4xl bg-secondary/50 p-4">
          <p className="text-xs font-bold text-ink/60">摘要</p>
          <p className="mt-1 text-sm leading-relaxed text-ink">{conv.summary}</p>
        </div>

        {conv.flaggedSensitive && (
          <div className="mt-3 rounded-4xl border-l-4 border-destructive bg-destructive/10 p-4 text-sm font-medium text-ink">
            这次对话触及敏感话题，AI 已先安抚并静默通知照护者（见 SPEC §9）。
          </div>
        )}

        {/* 逐句记录 */}
        <h3 className="mt-6 font-display text-sm font-bold text-ink">
          逐句记录
        </h3>
        <div className="mt-3 space-y-3">
          {conv.transcript.map((turn, i) => (
            <Bubble
              key={i}
              turn={turn}
              initial={conv.initial}
              photo={conv.photo}
              tone={conv.tone}
            />
          ))}
        </div>
      </Sheet>
    </>
  )
}

function Bubble({
  turn,
  initial,
  photo,
  tone,
}: {
  turn: TalkTurn
  initial: string
  photo?: string
  tone: "peach" | "mint" | "sky" | "lilac"
}) {
  if (turn.who === "patient") {
    return (
      <div className="flex justify-end">
        <p className="max-w-[80%] rounded-[1.4rem] bg-ink px-4 py-2.5 text-[0.95rem] font-medium leading-relaxed text-cream">
          {turn.text}
        </p>
      </div>
    )
  }
  return (
    <div className="flex items-start gap-2.5">
      <FamilyAvatar
        photo={photo}
        initial={initial}
        tone={tone}
        className="mt-0.5 h-8 w-8 text-xs"
      />
      <p className="max-w-[80%] rounded-[1.4rem] bg-secondary px-4 py-2.5 text-[0.95rem] font-medium leading-relaxed text-ink">
        {turn.text}
      </p>
    </div>
  )
}
