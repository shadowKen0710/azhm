import { useState } from "react"
import { Mic, ShieldCheck } from "lucide-react"

import { FamilyAvatar } from "@/components/FamilyAvatar"
import {
  EmptyState,
  InlineError,
  PageHeader,
  Sheet,
  SkeletonRows,
} from "@/components/states"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useVoices } from "@/queries/hooks"
import { useVoicesStore, type VoiceProfileView } from "@/state/voices"
import { VoiceEnrollFlow } from "@/surfaces/caregiver/VoiceEnrollFlow"

function formatSample(seconds: number) {
  if (!seconds) return "暂无样本"
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `样本 ${m}分${s}秒`
}

export function Voices() {
  // 查询用于四态外壳；正常态用可写声线 store。
  const { status, retry } = useVoices()
  const { profiles, revoke } = useVoicesStore()
  const [enroll, setEnroll] = useState<VoiceProfileView | null>(null)

  return (
    <>
      <PageHeader
        light="声线"
        bold="管理"
        subtitle="AI 模拟家人声线陪伴患者"
      />
      <Sheet>
        {/* 授权安全边界（SPEC §9）：声线必须经家人本人授权。 */}
        <div className="mb-6 flex items-start gap-3 rounded-4xl bg-secondary px-5 py-4">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-ink" strokeWidth={2.4} />
          <p className="text-sm font-medium leading-snug text-ink/80">
            声线须经家人本人授权录制，录音仅在本机处理、不上传，可随时撤销。
          </p>
        </div>

        {status === "loading" && <SkeletonRows rows={3} />}
        {status === "error" && <InlineError onRetry={retry} />}
        {status === "success" &&
          (profiles.length === 0 ? (
            <EmptyState
              icon={Mic}
              title="还没有家人"
              hint="先在「认人卡」添加家人，再来授权录制声线。"
            />
          ) : (
            <div className="space-y-3">
              {profiles.map((profile) => (
                <VoiceCard
                  key={profile.memberId}
                  profile={profile}
                  onEnroll={() => setEnroll(profile)}
                  onRevoke={() => revoke(profile.memberId)}
                />
              ))}
            </div>
          ))}
      </Sheet>

      {enroll && (
        <VoiceEnrollFlow member={enroll} onClose={() => setEnroll(null)} />
      )}
    </>
  )
}

function VoiceCard({
  profile,
  onEnroll,
  onRevoke,
}: {
  profile: VoiceProfileView
  onEnroll: () => void
  onRevoke: () => void
}) {
  const dim = profile.status === "revoked" || profile.status === "none"
  const [confirmRevoke, setConfirmRevoke] = useState(false)

  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-4xl bg-muted/50 px-4 py-4",
        dim && "opacity-70"
      )}
    >
      <FamilyAvatar
        photo={profile.photo}
        initial={profile.initial}
        tone={profile.tone}
        className="h-12 w-12 text-lg"
      />

      <div className="min-w-0 flex-1">
        <p className="text-[0.95rem] leading-tight text-ink">
          <span className="font-bold">{profile.name}</span>
          <span className="ml-1.5 text-xs font-semibold text-muted-foreground">
            {profile.relation}
          </span>
        </p>

        {profile.status === "ready" || profile.status === "training" ? (
          <>
            <div className="mt-2 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-sun transition-all"
                  style={{ width: `${profile.learnProgress}%` }}
                />
              </div>
              <span className="shrink-0 text-[0.66rem] font-semibold text-muted-foreground">
                {profile.status === "training" ? "学习中 " : "已学习 "}
                {profile.learnProgress}%
              </span>
            </div>
            <p className="mt-1 text-[0.66rem] font-medium text-muted-foreground">
              {formatSample(profile.sampleSeconds)}
            </p>
          </>
        ) : (
          <p className="mt-1 text-xs font-medium text-muted-foreground">
            {profile.status === "revoked" ? "已撤销授权" : "尚未授权"}
          </p>
        )}
      </div>

      <div className="flex shrink-0 flex-col items-end gap-2">
        {profile.status === "ready" && (
          <>
            <span className="rounded-full bg-[#B9E2C4] px-2.5 py-1 text-[0.66rem] font-bold text-ink">
              可用
            </span>
            {confirmRevoke ? (
              <Button variant="destructive" size="sm" onClick={onRevoke}>
                确认撤销
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmRevoke(true)}
              >
                撤销授权
              </Button>
            )}
          </>
        )}
        {profile.status === "training" && (
          <span className="rounded-full bg-sun px-2.5 py-1 text-[0.66rem] font-bold text-ink">
            学习中
          </span>
        )}
        {(profile.status === "revoked" || profile.status === "none") && (
          <Button variant="outline" size="sm" onClick={onEnroll}>
            {profile.status === "revoked" ? "重新授权" : "授权录制"}
          </Button>
        )}
      </div>
    </div>
  )
}
