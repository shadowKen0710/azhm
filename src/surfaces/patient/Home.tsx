import { useEffect, useState } from "react"
import {
  Check,
  Clock,
  PhoneIncoming,
  Pill,
  ShieldAlert,
  UsersRound,
  X,
} from "lucide-react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"

import { useCall, type IncomingCall } from "@/components/call"
import { useMonitor } from "@/state/monitor"
import { cn } from "@/lib/utils"
import { toneBg } from "@/lib/tone"
import { useResource } from "@/lib/useResource"
import { getPatientHome, type PatientFamily } from "@/services/patient"

const CALLERS: Record<string, IncomingCall> = {
  family: { by: "family", voiceId: "v2", name: "秀兰", relation: "老伴", initial: "兰", tone: "mint" },
  ai: { by: "ai", voiceId: "v1", name: "小雯", relation: "女儿", initial: "雯", tone: "peach" },
}

export function PatientHome() {
  const { status, data } = useResource(getPatientHome)
  const [params] = useSearchParams()
  const { pending, clearCall } = useCall()
  const [sos, setSos] = useState(false)
  const [incoming, setIncoming] = useState<IncomingCall | null>(
    () => CALLERS[params.get("call") ?? ""] ?? null
  )
  const [remind, setRemind] = useState<boolean>(() => params.get("remind") === "1")

  // 照护者远程发起的来电 → 患者大屏被动收到
  useEffect(() => {
    if (pending) setIncoming(pending)
  }, [pending])

  const dismissCall = () => {
    setIncoming(null)
    clearCall()
  }

  if (status === "loading") return <GentleLoading />

  const family = data?.family ?? []

  return (
    <div className="flex h-full">
      {/* 左：时钟 · 提醒 · SOS */}
      <div className="flex w-[56%] flex-col justify-between p-9">
        <div>
          <p className="font-display text-4xl font-extrabold leading-tight text-ink">
            {data?.greeting ?? "你好"}，{data?.patientName ?? ""}
          </p>
          <div className="mt-3 flex items-baseline gap-3">
            <span className="font-display text-[5rem] font-extrabold leading-none text-ink">
              {data?.timeLabel ?? "--:--"}
            </span>
            <span className="text-xl font-semibold text-muted-foreground">
              {data?.dateLabel ?? ""}
            </span>
          </div>
        </div>

        {status === "error" ? (
          <div className="rounded-4xl bg-secondary/60 px-6 py-5 text-lg font-semibold text-muted-foreground">
            现在连接有点慢，先歇一会儿，家人随时会来看你。
          </div>
        ) : (
          data?.nextReminder && (
            <div className="flex items-center gap-4 rounded-4xl bg-sun px-6 py-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-ink text-cream font-display text-lg font-extrabold">
                {data.nextReminder.time.split(":")[0]}
              </div>
              <div>
                <p className="text-sm font-bold text-ink/60">
                  接下来 · {data.nextReminder.time}
                </p>
                <p className="text-xl font-extrabold text-ink">
                  {data.nextReminder.title}
                </p>
              </div>
            </div>
          )
        )}

        <button
          onClick={() => setSos(true)}
          className="flex items-center justify-center gap-3 rounded-[2rem] bg-destructive py-5 text-2xl font-extrabold text-destructive-foreground shadow-soft transition-transform active:scale-[0.98]"
        >
          <ShieldAlert className="h-8 w-8" strokeWidth={2.4} />
          紧急求助
        </button>
      </div>

      {/* 右：家人（可主动拨出）+ 演示来电 */}
      <div className="flex w-[44%] flex-col bg-sun/10 p-8">
        <div className="flex items-center justify-between">
          <p className="text-2xl font-extrabold text-ink">家人</p>
          <Link
            to="/patient/who"
            className="flex items-center gap-1.5 text-base font-semibold text-muted-foreground"
          >
            <UsersRound className="h-5 w-5" />
            认认人
          </Link>
        </div>

        {family.length === 0 ? (
          <div className="mt-6 rounded-4xl bg-secondary/60 px-6 py-8 text-center text-lg font-semibold text-muted-foreground">
            还没有家人哦
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-2 gap-4">
            {family.map((m) => (
              <FamilyTile key={m.id} m={m} />
            ))}
          </div>
        )}

        <div className="mt-auto">
          <DemoPanel onCall={setIncoming} onRemind={() => setRemind(true)} />
        </div>
      </div>

      {sos && <SosOverlay onClose={() => setSos(false)} />}
      {incoming && <IncomingOverlay call={incoming} onEnd={dismissCall} />}
      {remind && <ReminderOverlay onClose={() => setRemind(false)} />}
    </div>
  )
}

function FamilyTile({ m }: { m: PatientFamily }) {
  const navigate = useNavigate()
  return (
    <button
      disabled={!m.voiceAvailable}
      onClick={() => navigate(`/patient/talk/${m.voiceId}`)}
      className="flex items-center gap-3 rounded-4xl bg-card px-4 py-3 text-left shadow-soft transition-transform active:scale-[0.98] disabled:opacity-40"
    >
      <span
        className={cn(
          "grid h-14 w-14 shrink-0 place-items-center rounded-full font-display text-xl font-extrabold text-ink",
          toneBg[m.tone]
        )}
      >
        {m.initial}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-lg font-bold text-ink">
          {m.name}
        </span>
        <span className="block text-sm font-semibold text-muted-foreground">
          {m.voiceAvailable ? m.relation : "暂不可对话"}
        </span>
      </span>
    </button>
  )
}

/** 演示：模拟被动来电与到点提醒（真实中由照护者/日程自动触发）。 */
function DemoPanel({
  onCall,
  onRemind,
}: {
  onCall: (c: IncomingCall) => void
  onRemind: () => void
}) {
  return (
    <div className="rounded-4xl border border-dashed border-border px-4 py-3">
      <p className="mb-2 text-xs font-semibold text-muted-foreground">
        演示 · 被动事件（患者无需操作）
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onCall(CALLERS.family)}
          className="flex-1 rounded-full bg-ink px-3 py-2 text-sm font-bold text-cream"
        >
          家人来电
        </button>
        <button
          onClick={() => onCall(CALLERS.ai)}
          className="flex-1 rounded-full bg-sun px-3 py-2 text-sm font-bold text-ink"
        >
          AI 来电
        </button>
        <button
          onClick={onRemind}
          className="w-full rounded-full border-2 border-ink/15 px-3 py-2 text-sm font-bold text-ink"
        >
          提醒到点
        </button>
      </div>
    </div>
  )
}

/** 到点提醒覆盖层（大屏被动弹出）：见 SPEC §6.4。 */
function ReminderOverlay({ onClose }: { onClose: () => void }) {
  const { completeReminder } = useMonitor()
  const [done, setDone] = useState(false)

  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-sun px-10 text-center">
      {!done ? (
        <>
          <span className="grid h-28 w-28 place-items-center rounded-full bg-ink text-cream">
            <Pill className="h-14 w-14" strokeWidth={2.2} />
          </span>
          <p className="mt-6 font-display text-5xl font-extrabold text-ink">
            该吃药啦
          </p>
          <p className="mt-3 text-2xl font-semibold text-ink/80">
            占位提醒 · 午间血压药
          </p>
          <p className="mt-2 text-lg font-semibold text-ink/60">
            🔊 女儿声线正在提醒你
          </p>

          <div className="mt-9 flex gap-5">
            <button
              onClick={() => {
                completeReminder("r2")
                setDone(true)
              }}
              className="flex items-center gap-2 rounded-[2rem] bg-ink px-10 py-5 text-2xl font-extrabold text-cream"
            >
              <Check className="h-7 w-7" strokeWidth={3} />
              已完成
            </button>
            <button
              onClick={onClose}
              className="flex items-center gap-2 rounded-[2rem] bg-white px-10 py-5 text-2xl font-extrabold text-ink"
            >
              <Clock className="h-7 w-7" />
              稍后提醒
            </button>
          </div>
          <p className="mt-5 text-base font-medium text-ink/50">
            未操作将稍后再次提醒，并通知家人
          </p>
        </>
      ) : (
        <>
          <span className="grid h-28 w-28 place-items-center rounded-full bg-ink text-cream">
            <Check className="h-14 w-14" strokeWidth={2.6} />
          </span>
          <p className="mt-6 font-display text-4xl font-extrabold text-ink">
            真棒，已完成
          </p>
          <button
            onClick={onClose}
            className="mt-8 rounded-[2rem] bg-ink px-12 py-4 text-2xl font-extrabold text-cream"
          >
            好的
          </button>
        </>
      )}
    </div>
  )
}

/** 来电覆盖层：显示来电，倒计时后自动接通（零操作）。 */
function IncomingOverlay({
  call,
  onEnd,
}: {
  call: IncomingCall
  onEnd: () => void
}) {
  const navigate = useNavigate()
  const [count, setCount] = useState(3)

  useEffect(() => {
    if (count === 0) {
      onEnd()
      navigate(`/patient/talk/${call.voiceId}?incoming=1&by=${call.by}`)
      return
    }
    const t = setTimeout(() => setCount((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [count, call, navigate, onEnd])

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center gap-12 bg-ink px-16 text-cream">
      <div className="flex flex-col items-center">
        <span
          className={cn(
            "grid h-40 w-40 animate-pulse-soft place-items-center rounded-full font-display text-6xl font-extrabold text-ink",
            toneBg[call.tone]
          )}
        >
          {call.initial}
        </span>
      </div>
      <div className="max-w-[360px]">
        <div className="flex items-center gap-2 text-lg font-semibold text-cream/70">
          <PhoneIncoming className="h-5 w-5" />
          {call.by === "ai" ? "AI 模拟来电" : "家人来电"}
        </div>
        <p className="mt-2 font-display text-5xl font-extrabold">
          {call.name}
        </p>
        <p className="mt-1 text-2xl font-semibold text-cream/80">
          {call.relation}想和你说说话
        </p>
        <p className="mt-6 text-xl font-medium text-cream/70">
          无需操作，{count} 秒后自动接通…
        </p>
        <button
          onClick={onEnd}
          className="mt-6 flex items-center gap-2 rounded-full bg-white/15 px-6 py-3 text-lg font-bold text-cream"
        >
          <X className="h-5 w-5" />
          以后再说
        </button>
      </div>
    </div>
  )
}

function GentleLoading() {
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <div className="h-24 w-24 animate-pulse-soft rounded-full bg-sun" />
      <p className="mt-6 text-3xl font-bold text-muted-foreground">正在准备…</p>
    </div>
  )
}

/** SOS 倒计时确认覆盖层（可撤销）。 */
function SosOverlay({ onClose }: { onClose: () => void }) {
  const [count, setCount] = useState(5)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    if (sent) return
    if (count === 0) {
      setSent(true)
      return
    }
    const t = setTimeout(() => setCount((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [count, sent])

  return (
    <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-destructive px-8 text-center text-destructive-foreground">
      {!sent ? (
        <>
          <p className="text-3xl font-bold">正在呼叫家人…</p>
          <div className="mt-6 grid h-28 w-28 place-items-center rounded-full bg-white/20 font-display text-6xl font-extrabold">
            {count}
          </div>
          <button
            onClick={onClose}
            className="mt-8 flex items-center gap-2 rounded-full bg-white px-10 py-4 text-2xl font-extrabold text-destructive"
          >
            <X className="h-7 w-7" strokeWidth={3} />
            取消
          </button>
        </>
      ) : (
        <>
          <div className="grid h-24 w-24 place-items-center rounded-full bg-white/20">
            <ShieldAlert className="h-12 w-12" />
          </div>
          <p className="mt-6 text-4xl font-extrabold">已通知家人</p>
          <p className="mt-3 text-2xl font-medium opacity-90">
            别担心，待在原地，家人马上就来。
          </p>
          <button
            onClick={onClose}
            className="mt-8 rounded-full bg-white px-12 py-4 text-2xl font-extrabold text-destructive"
          >
            好的
          </button>
        </>
      )}
    </div>
  )
}