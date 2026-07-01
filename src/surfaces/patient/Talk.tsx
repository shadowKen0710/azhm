import { Mic, PhoneOff, Sparkles } from "lucide-react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"

import { cn } from "@/lib/utils"
import { toneBg, type Tone } from "@/lib/tone"
import { usePatientTalk } from "@/queries/hooks"
import type { TalkTurn } from "@/services/patient"

export function PatientTalk() {
  const { voiceId } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const isAi = params.get("by") !== "family" // 家人来电=真人；其余为 AI 模拟

  const { status, data } = usePatientTalk(voiceId ?? "")

  if (status === "loading") return <Connecting />
  if (status === "error" || !data)
    return <GentleNotice onHome={() => navigate("/patient")} />

  const tone = data.tone as Tone
  return (
    <div className="flex h-full">
      {/* 左：来电人 + 状态 + 挂断 */}
      <div className="flex w-[40%] flex-col items-center justify-center gap-4 bg-sun/10 p-8 text-center">
        <span
          className={cn(
            "grid h-32 w-32 place-items-center rounded-full font-display text-5xl font-extrabold text-ink shadow-soft",
            toneBg[tone]
          )}
        >
          {data.initial}
        </span>
        <div>
          <p className="text-lg font-semibold text-muted-foreground">
            正在和{data.relation}通话
          </p>
          <p className="font-display text-3xl font-extrabold text-ink">
            {data.name}
          </p>
        </div>

        {isAi && (
          <div className="flex items-center gap-1.5 rounded-full bg-secondary px-4 py-2 text-sm font-bold text-ink">
            <Sparkles className="h-4 w-4" />
            AI 模拟声音
          </div>
        )}

        {/* 环境聆听指示：设备自动聆听，无需按键 */}
        <div className="mt-2 flex items-center gap-2 text-base font-semibold text-muted-foreground">
          <span className="grid h-10 w-10 animate-pulse-soft place-items-center rounded-full bg-sun text-ink">
            <Mic className="h-5 w-5" />
          </span>
          正在聆听…
        </div>

        <button
          onClick={() => navigate("/patient")}
          className="mt-4 flex items-center gap-2 rounded-full bg-destructive px-7 py-3 text-lg font-extrabold text-destructive-foreground"
        >
          <PhoneOff className="h-5 w-5" />
          挂断
        </button>
      </div>

      {/* 右：大字幕对话 */}
      <div className="flex w-[60%] flex-col p-8">
        <div className="flex-1 space-y-4 overflow-y-auto">
          {data.turns.map((turn, i) => (
            <Bubble key={i} turn={turn} initial={data.initial} tone={tone} />
          ))}
        </div>
        <p className="pt-3 text-center text-sm font-medium text-muted-foreground">
          说想出门或不舒服时，家人会第一时间知道
        </p>
      </div>
    </div>
  )
}

function Bubble({
  turn,
  initial,
  tone,
}: {
  turn: TalkTurn
  initial: string
  tone: Tone
}) {
  if (turn.who === "patient") {
    return (
      <div className="flex justify-end">
        <p className="max-w-[85%] rounded-[1.75rem] bg-ink px-5 py-3 text-xl font-medium leading-relaxed text-cream">
          {turn.text}
        </p>
      </div>
    )
  }
  return (
    <div className="flex items-start gap-3">
      <span
        className={cn(
          "grid h-11 w-11 shrink-0 place-items-center rounded-full font-display text-base font-extrabold text-ink",
          toneBg[tone]
        )}
      >
        {initial}
      </span>
      <p className="max-w-[85%] rounded-[1.75rem] bg-secondary px-5 py-3 text-xl font-medium leading-relaxed text-ink">
        {turn.text}
      </p>
    </div>
  )
}

function Connecting() {
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <div className="h-28 w-28 animate-pulse-soft rounded-full bg-sun" />
      <p className="mt-6 text-3xl font-bold text-muted-foreground">
        正在接通家人…
      </p>
    </div>
  )
}

function GentleNotice({ onHome }: { onHome: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-10 text-center">
      <p className="font-display text-3xl font-extrabold text-ink">信号不太好</p>
      <p className="mt-3 text-xl font-medium text-muted-foreground">
        我们待会儿再聊，你先歇一会儿。
      </p>
      <button
        onClick={onHome}
        className="mt-8 rounded-full bg-sun px-10 py-4 text-2xl font-extrabold text-ink"
      >
        回家
      </button>
    </div>
  )
}
