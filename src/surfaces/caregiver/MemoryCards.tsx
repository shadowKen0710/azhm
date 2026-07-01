import { Pencil, Plus, UserPlus } from "lucide-react"

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
import { getMemoryCards, type FamilyMember } from "@/services/family"

export function MemoryCards() {
  const { status, data, retry } = useResource(getMemoryCards)

  return (
    <>
      <PageHeader
        light="认人"
        bold="卡"
        subtitle={data ? `${data.members.length} 位家人` : undefined}
        right={<AddButton />}
      />
      <Sheet>
        {status === "loading" && <SkeletonRows rows={3} />}
        {status === "error" && <InlineError onRetry={retry} />}
        {status === "success" &&
          data &&
          (data.members.length === 0 ? (
            <EmptyState
              icon={UserPlus}
              title="还没有家人"
              hint="添加第一位家人，帮 TA 认出你。"
              actionLabel="添加家人"
            />
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {data.members.map((member) => (
                <MemberCard key={member.id} member={member} />
              ))}
              <AddCard />
            </div>
          ))}
      </Sheet>
    </>
  )
}

function AddButton() {
  return (
    <button
      aria-label="新增家人"
      className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-ink text-cream transition-transform hover:scale-95"
    >
      <Plus className="h-5 w-5" />
    </button>
  )
}

function MemberCard({ member }: { member: FamilyMember }) {
  return (
    <div className="relative flex flex-col items-center rounded-4xl bg-muted/50 px-4 py-6 text-center">
      <button
        aria-label={`编辑 ${member.name}`}
        className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-ink/10 hover:text-ink"
      >
        <Pencil className="h-4 w-4" />
      </button>
      <div
        className={cn(
          "grid h-16 w-16 place-items-center rounded-full font-display text-2xl font-extrabold text-ink",
          toneBg[member.tone]
        )}
      >
        {member.initial}
      </div>
      <p className="mt-3 text-[0.95rem] font-bold leading-snug text-ink">
        {member.name}
      </p>
      <p className="mt-0.5 text-xs font-medium text-muted-foreground">
        {member.relation}
      </p>
      <span className="mt-2 inline-block rounded-full bg-secondary/60 px-3 py-1 text-xs font-semibold text-ink">
        叫 TA：{member.nickname}
      </span>
    </div>
  )
}

function AddCard() {
  return (
    <button
      aria-label="添加家人"
      className="flex flex-col items-center justify-center rounded-4xl border-2 border-dashed border-border px-4 py-6 text-muted-foreground transition-colors hover:border-ink/30 hover:text-ink"
    >
      <span className="grid h-16 w-16 place-items-center rounded-full bg-secondary">
        <Plus className="h-7 w-7" />
      </span>
      <span className="mt-3 text-[0.95rem] font-bold">添加</span>
    </button>
  )
}
