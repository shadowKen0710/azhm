import { Mic, Plus, ShieldCheck } from "lucide-react"

import {
  EmptyState,
  InlineError,
  PageHeader,
  Sheet,
  SkeletonRows,
} from "@/components/states"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { toneBg } from "@/lib/tone"
import { useResource } from "@/lib/useResource"
import { getVoices, type VoiceProfile } from "@/services/family"

/** 秒数换算成「3分34秒」样本时长小字。 */
function formatSample(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}分${s}秒`
}

export function Voices() {
  const { status, data, retry } = useResource(getVoices)

  return (
    <>
      <PageHeader
        light="声线"
        bold="管理"
        subtitle="AI 模拟家人声线陪伴患者"
        right={<AddButton />}
      />
      <Sheet>
        {/* 授权安全边界（SPEC §9）：声线必须经家人本人授权。 */}
        <div className="mb-6 flex items-start gap-3 rounded-4xl bg-secondary px-5 py-4">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-ink" strokeWidth={2.4} />
          <p className="text-sm font-medium leading-snug text-ink/80">
            声线须经家人本人授权录制，可随时撤销。
          </p>
        </div>

        {status === "loading" && <SkeletonRows rows={3} />}
        {status === "error" && <InlineError onRetry={retry} />}
        {status === "success" &&
          data &&
          (data.profiles.length === 0 ? (
            <EmptyState
              icon={Mic}
              title="还没有授权任何声线"
              hint="邀请家人授权录制，AI 才能用 TA 的声音陪伴患者。"
              actionLabel="开始授权录制"
            />
          ) : (
            <div className="space-y-3">
              {data.profiles.map((profile) => (
                <VoiceCard key={profile.id} profile={profile} />
              ))}
            </div>
          ))}
      </Sheet>
    </>
  )
}

function AddButton() {
  return (
    <button
      aria-label="授权录制声线"
      className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-ink text-cream transition-transform hover:scale-95"
    >
      <Plus className="h-5 w-5" />
    </button>
  )
}

function VoiceCard({ profile }: { profile: VoiceProfile }) {
  const revoked = profile.status === "revoked"
  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-4xl bg-muted/50 px-4 py-4",
        revoked && "opacity-60"
      )}
    >
      <div
        className={cn(
          "grid h-12 w-12 shrink-0 place-items-center rounded-full font-display text-lg font-extrabold text-ink",
          toneBg[profile.tone]
        )}
      >
        {profile.initial}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[0.95rem] leading-tight text-ink">
          <span className="font-bold">{profile.name}</span>
          <span className="ml-1.5 text-xs font-semibold text-muted-foreground">
            {profile.relation}
          </span>
        </p>

        {/* 学习进度（可视化占位）。 */}
        <div className="mt-2 flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-sun"
              style={{ width: `${profile.learnProgress}%` }}
            />
          </div>
          <span className="shrink-0 text-[0.66rem] font-semibold text-muted-foreground">
            已学习 {profile.learnProgress}%
          </span>
        </div>

        <p className="mt-1 text-[0.66rem] font-medium text-muted-foreground">
          样本 {formatSample(profile.sampleSeconds)}
        </p>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-2">
        {profile.status === "ready" ? (
          <>
            <span className="rounded-full bg-[#B9E2C4] px-2.5 py-1 text-[0.66rem] font-bold text-ink">
              可用
            </span>
            <Button variant="outline" size="sm">
              撤销授权
            </Button>
          </>
        ) : (
          <>
            <span className="rounded-full bg-muted px-2.5 py-1 text-[0.66rem] font-bold text-muted-foreground">
              已撤销
            </span>
            <Button variant="outline" size="sm">
              重新授权
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
