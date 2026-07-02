import { useState } from "react"
import { BookHeart, Mic, Plus, Trash2 } from "lucide-react"

import { FamilyAvatar } from "@/components/FamilyAvatar"
import { EmptyState, PageHeader, Sheet } from "@/components/states"
import { cn } from "@/lib/utils"
import { useMemories } from "@/state/memories"
import { useVoicesStore, type VoiceProfileView } from "@/state/voices"
import type { MemoryPiece, MemoryTag } from "@/services/companionApi"
import { MemoryForm } from "@/surfaces/caregiver/MemoryForm"

const tagLabel: Record<MemoryTag, string> = {
  childhood: "儿时",
  daily: "日常",
  milestone: "大事",
  place: "地点",
  other: "其他",
}

export function Memories() {
  const { profiles } = useVoicesStore()
  const { memories, forMember, removeMemory } = useMemories()
  const [enroll, setEnroll] = useState<VoiceProfileView | null>(null)

  return (
    <>
      <PageHeader
        light="记忆"
        bold="库"
        subtitle="讲述你们的故事，AI 用家人声线陪患者怀旧"
      />
      <Sheet>
        {profiles.length === 0 ? (
          <EmptyState
            icon={BookHeart}
            title="还没有家人"
            hint="先在「认人卡」添加家人，再来记录你们的故事。"
          />
        ) : (
          <div className="space-y-7">
            {profiles.map((p) => (
              <MemberGroup
                key={p.memberId}
                member={p}
                stories={forMember(p.memberId)}
                onAdd={() => setEnroll(p)}
                onRemove={removeMemory}
              />
            ))}
            {memories.length === 0 && (
              <p className="pt-2 text-center text-sm text-muted-foreground">
                点任意家人的「＋」，讲讲你们之间的故事。
              </p>
            )}
          </div>
        )}
      </Sheet>

      {enroll && (
        <MemoryForm member={enroll} onClose={() => setEnroll(null)} />
      )}
    </>
  )
}

function MemberGroup({
  member,
  stories,
  onAdd,
  onRemove,
}: {
  member: VoiceProfileView
  stories: MemoryPiece[]
  onAdd: () => void
  onRemove: (id: string) => void
}) {
  return (
    <div>
      <div className="flex items-center gap-3">
        <FamilyAvatar
          photo={member.photo}
          initial={member.initial}
          tone={member.tone}
          className="h-11 w-11 text-base"
        />
        <div className="flex-1">
          <p className="font-bold text-ink">{member.name}</p>
          <p className="text-xs font-semibold text-muted-foreground">
            {member.relation} · 已记录 {stories.length} 段
          </p>
        </div>
        <button
          onClick={onAdd}
          aria-label={`给${member.name}添加记忆`}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ink text-cream transition-transform hover:scale-95"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {stories.length > 0 && (
        <ul className="mt-3 space-y-2.5">
          {stories.map((s) => (
            <StoryRow key={s.id} story={s} onRemove={() => onRemove(s.id)} />
          ))}
        </ul>
      )}
    </div>
  )
}

function StoryRow({
  story,
  onRemove,
}: {
  story: MemoryPiece
  onRemove: () => void
}) {
  const [confirm, setConfirm] = useState(false)
  return (
    <li className="rounded-3xl bg-muted/50 px-4 py-3">
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[0.66rem] font-bold text-ink">
          {tagLabel[story.tag]}
        </span>
        <span className="flex-1 truncate text-[0.95rem] font-bold text-ink">
          {story.title}
        </span>
        {story.hasAudio && <Mic className="h-4 w-4 shrink-0 text-sun" />}
        <button
          onClick={() => (confirm ? onRemove() : setConfirm(true))}
          aria-label="删除记忆"
          className={cn(
            "grid h-7 w-7 shrink-0 place-items-center rounded-full transition-colors",
            confirm
              ? "bg-destructive text-destructive-foreground"
              : "text-muted-foreground hover:bg-ink/10"
          )}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      <p className="mt-1.5 line-clamp-2 text-sm leading-snug text-muted-foreground">
        {story.text}
      </p>
    </li>
  )
}
