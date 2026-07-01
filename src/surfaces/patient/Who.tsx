import { useState } from "react"
import {
  ChevronLeft,
  ChevronRight,
  House,
  MessageCircleHeart,
} from "lucide-react"
import { useNavigate } from "react-router-dom"

import { cn } from "@/lib/utils"
import { FamilyAvatar } from "@/components/FamilyAvatar"
import { useMemoryCards } from "@/queries/hooks"
import { useFamily } from "@/state/family"

export function PatientWho() {
  const { status } = useMemoryCards()
  const { members } = useFamily()
  const navigate = useNavigate()
  const [index, setIndex] = useState(0)

  if (status === "loading") return <GentleLoading />
  if (status === "error")
    return (
      <GentleFallback
        title="现在有点慢"
        hint="先歇一会儿，等会儿再来认认人。"
        onHome={() => navigate("/patient")}
      />
    )

  if (members.length === 0)
    return (
      <GentleFallback
        title="还没有家人哦"
        hint="等家人加进来，就能在这里认认人啦。"
        onHome={() => navigate("/patient")}
      />
    )

  const safeIndex = Math.min(index, members.length - 1)
  const member = members[safeIndex]

  return (
    <div className="flex h-full flex-col p-8">
      <button
        onClick={() => navigate("/patient")}
        className="flex items-center gap-2 self-start rounded-full bg-secondary/70 px-6 py-3 text-xl font-extrabold text-ink transition-transform active:scale-[0.97]"
      >
        <House className="h-6 w-6" strokeWidth={2.4} />
        回家
      </button>

      {/* 大头像 + 姓名（横向） */}
      <div className="flex flex-1 items-center justify-center gap-12">
        <FamilyAvatar
          photo={member.photo}
          initial={member.initial}
          tone={member.tone}
          className="h-48 w-48 shrink-0 text-[6rem] shadow-soft"
        />

        <div className="text-left">
          <p className="text-2xl font-bold text-muted-foreground">
            这是你的{member.relation}
          </p>
          <p className="mt-1 font-display text-[3.6rem] font-extrabold leading-tight text-ink">
            {member.name}
          </p>
          <p className="mt-2 text-xl font-semibold text-muted-foreground">
            叫 TA：{member.nickname}
          </p>
          <button
            onClick={() => navigate(`/patient/talk/${member.id}`)}
            className="mt-7 flex items-center gap-3 rounded-[2.5rem] bg-sun px-9 py-5 text-2xl font-extrabold text-ink shadow-soft transition-transform active:scale-[0.98]"
          >
            <MessageCircleHeart className="h-7 w-7" strokeWidth={2.4} />
            和 TA 说说话
          </button>
        </div>
      </div>

      {/* 左右切换 */}
      <div className="flex items-center justify-between">
        <ArrowButton
          direction="prev"
          disabled={safeIndex === 0}
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
        />
        <span className="text-lg font-bold text-muted-foreground">
          {safeIndex + 1} / {members.length}
        </span>
        <ArrowButton
          direction="next"
          disabled={safeIndex === members.length - 1}
          onClick={() => setIndex((i) => Math.min(members.length - 1, i + 1))}
        />
      </div>
    </div>
  )
}

function ArrowButton({
  direction,
  disabled,
  onClick,
}: {
  direction: "prev" | "next"
  disabled: boolean
  onClick: () => void
}) {
  const Icon = direction === "prev" ? ChevronLeft : ChevronRight
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === "prev" ? "上一位" : "下一位"}
      className={cn(
        "grid h-16 w-16 place-items-center rounded-full bg-secondary text-ink shadow-soft transition-transform active:scale-[0.95]",
        disabled && "opacity-30"
      )}
    >
      <Icon className="h-9 w-9" strokeWidth={2.6} />
    </button>
  )
}

function GentleLoading() {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <div className="h-24 w-24 animate-pulse-soft rounded-full bg-sun" />
      <p className="mt-6 text-3xl font-bold text-muted-foreground">正在准备…</p>
    </div>
  )
}

function GentleFallback({
  title,
  hint,
  onHome,
}: {
  title: string
  hint: string
  onHome: () => void
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-8 text-center">
      <p className="font-display text-3xl font-extrabold text-ink">{title}</p>
      <p className="mt-3 text-xl font-medium text-muted-foreground">{hint}</p>
      <button
        onClick={onHome}
        className="mt-9 flex items-center gap-3 rounded-[2.5rem] bg-sun px-12 py-5 text-2xl font-extrabold text-ink shadow-soft transition-transform active:scale-[0.98]"
      >
        <House className="h-7 w-7" strokeWidth={2.4} />
        回家
      </button>
    </div>
  )
}
