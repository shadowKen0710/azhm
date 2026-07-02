import {
  AudioLines,
  BookHeart,
  ChevronRight,
  MessagesSquare,
  PhoneCall,
  UsersRound,
  type LucideIcon,
} from "lucide-react"
import { Link, useNavigate } from "react-router-dom"

import { useCall } from "@/components/call"
import { PageHeader, Sheet } from "@/components/states"
import { Button } from "@/components/ui/button"

type Entry = {
  to: string
  icon: LucideIcon
  title: string
  desc: string
}

const entries: Entry[] = [
  {
    to: "/caregiver/memory-cards",
    icon: UsersRound,
    title: "认人卡",
    desc: "家人照片、称呼，帮 TA 认出身边的人",
  },
  {
    to: "/caregiver/voices",
    icon: AudioLines,
    title: "声线管理",
    desc: "授权录制家人声线，随时可撤销",
  },
  {
    to: "/caregiver/memories",
    icon: BookHeart,
    title: "记忆库",
    desc: "讲述你们的故事，AI 用家人声线陪患者怀旧",
  },
  {
    to: "/caregiver/conversations",
    icon: MessagesSquare,
    title: "对话记录",
    desc: "回看 AI 陪伴对话与情绪变化",
  },
]

export function CareHub() {
  return (
    <>
      <PageHeader light="家人" bold="陪伴" subtitle="管理认人卡、声线与对话记录" />
      <Sheet>
        <CallPatientCard />
        <h3 className="mt-7 font-display text-sm font-bold text-ink">陪伴工具</h3>
        <div className="mt-3 space-y-4">
          {entries.map((entry) => (
            <EntryCard key={entry.to} entry={entry} />
          ))}
        </div>
      </Sheet>
    </>
  )
}

/** 远程呼叫患者：照护者以家人身份发起，患者大屏自动接通。 */
function CallPatientCard() {
  const { callPatient } = useCall()
  const navigate = useNavigate()

  function call() {
    callPatient({
      by: "family",
      voiceId: "v1",
      name: "小雯",
      relation: "女儿",
      initial: "雯",
      tone: "peach",
    })
    navigate("/patient")
  }

  return (
    <div className="rounded-4xl bg-sun p-6">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-ink text-cream">
          <PhoneCall className="h-5 w-5" />
        </span>
        <div>
          <p className="font-display text-lg font-extrabold text-ink">
            远程呼叫患者
          </p>
          <p className="text-sm font-medium text-ink/70">
            以家人身份发起，患者大屏无需操作自动接通
          </p>
        </div>
      </div>
      <Button className="mt-4 w-full" onClick={call}>
        现在呼叫患者
      </Button>
    </div>
  )
}

function EntryCard({ entry }: { entry: Entry }) {
  const Icon = entry.icon
  return (
    <Link
      to={entry.to}
      className="flex items-center gap-4 rounded-4xl bg-muted/50 px-5 py-5 transition-all hover:scale-[0.99] hover:bg-muted"
    >
      <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-secondary">
        <Icon className="h-6 w-6 text-ink" strokeWidth={2.2} />
      </span>
      <div className="flex-1">
        <p className="font-display text-lg font-extrabold leading-snug text-ink">
          {entry.title}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">{entry.desc}</p>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
    </Link>
  )
}
