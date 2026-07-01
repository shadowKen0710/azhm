import { useState } from "react"
import { Pencil, Plus, UserPlus } from "lucide-react"

import { FamilyAvatar } from "@/components/FamilyAvatar"
import {
  EmptyState,
  InlineError,
  PageHeader,
  Sheet,
  SkeletonRows,
} from "@/components/states"
import { useMemoryCards } from "@/queries/hooks"
import { useFamily } from "@/state/family"
import type { FamilyMember } from "@/services/family"
import { MemberForm } from "@/surfaces/caregiver/MemberForm"

type FormState = { open: false } | { open: true; member: FamilyMember | null }

export function MemoryCards() {
  // 查询用于四态外壳（加载/空/错误演示）；正常态渲染可写的家人 store。
  const { status, data, retry } = useMemoryCards()
  const { members } = useFamily()
  const [form, setForm] = useState<FormState>({ open: false })

  const openNew = () => setForm({ open: true, member: null })
  const openEdit = (m: FamilyMember) => setForm({ open: true, member: m })

  // 演示「空数据」态：mock 返回空则显示空态；否则用真实 store
  const showEmpty = status === "success" && data && data.members.length === 0

  return (
    <>
      <PageHeader
        light="认人"
        bold="卡"
        subtitle={`${members.length} 位家人`}
        right={<AddButton onClick={openNew} />}
      />
      <Sheet>
        {status === "loading" && <SkeletonRows rows={3} />}
        {status === "error" && <InlineError onRetry={retry} />}
        {status === "success" &&
          (showEmpty ? (
            <div onClick={openNew}>
              <EmptyState
                icon={UserPlus}
                title="还没有家人"
                hint="添加第一位家人，帮 TA 认出你。"
                actionLabel="添加家人"
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {members.map((member) => (
                <MemberCard
                  key={member.id}
                  member={member}
                  onEdit={() => openEdit(member)}
                />
              ))}
              <AddCard onClick={openNew} />
            </div>
          ))}
      </Sheet>

      {form.open && (
        <MemberForm
          member={form.member}
          onClose={() => setForm({ open: false })}
        />
      )}
    </>
  )
}

function AddButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      aria-label="新增家人"
      onClick={onClick}
      className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-ink text-cream transition-transform hover:scale-95"
    >
      <Plus className="h-5 w-5" />
    </button>
  )
}

function MemberCard({
  member,
  onEdit,
}: {
  member: FamilyMember
  onEdit: () => void
}) {
  return (
    <button
      onClick={onEdit}
      aria-label={`编辑 ${member.name}`}
      className="relative flex flex-col items-center rounded-4xl bg-muted/50 px-4 py-6 text-center transition-transform active:scale-[0.98]"
    >
      <span className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full text-muted-foreground">
        <Pencil className="h-4 w-4" />
      </span>
      <FamilyAvatar
        photo={member.photo}
        initial={member.initial}
        tone={member.tone}
        className="h-16 w-16 text-2xl"
      />
      <p className="mt-3 text-[0.95rem] font-bold leading-snug text-ink">
        {member.name}
      </p>
      <p className="mt-0.5 text-xs font-medium text-muted-foreground">
        {member.relation}
      </p>
      <span className="mt-2 inline-block rounded-full bg-secondary/60 px-3 py-1 text-xs font-semibold text-ink">
        叫 TA：{member.nickname}
      </span>
    </button>
  )
}

function AddCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      aria-label="添加"
      onClick={onClick}
      className="flex flex-col items-center justify-center rounded-4xl border-2 border-dashed border-border px-4 py-6 text-muted-foreground transition-colors hover:border-ink/30 hover:text-ink"
    >
      <span className="grid h-16 w-16 place-items-center rounded-full bg-secondary">
        <Plus className="h-7 w-7" />
      </span>
      <span className="mt-3 text-[0.95rem] font-bold">添加</span>
    </button>
  )
}
