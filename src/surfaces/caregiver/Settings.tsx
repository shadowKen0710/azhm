import { Link } from "react-router-dom"
import {
  ChevronRight,
  HeartHandshake,
  ShieldCheck,
  User,
  type LucideIcon,
} from "lucide-react"

import { InlineError, PageHeader, Sheet, SkeletonRows } from "@/components/states"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useSettings } from "@/queries/hooks"
import type { SettingsData } from "@/services/settings"

export function Settings() {
  const { status, data, retry } = useSettings()

  return (
    <>
      <PageHeader light="我的" bold="设置" />
      <Sheet>
        {status === "loading" && <SkeletonRows rows={4} />}
        {status === "error" && <InlineError onRetry={retry} />}
        {status === "success" && data && <SettingsForm settings={data} />}
      </Sheet>
    </>
  )
}

function SettingsForm({ settings }: { settings: SettingsData }) {
  return (
    <div className="space-y-5">
      <GroupCard icon={User} title="患者档案">
        <Field label="姓名" value={settings.patient.name} />
        <Field label="年龄" value={settings.patient.age} />
        <Field label="病程" value={settings.patient.condition} />
        <Field label="家庭住址" value={settings.patient.homeAddress} last />
      </GroupCard>

      <GroupCard icon={HeartHandshake} title="主照护者">
        <Field label="姓名" value={settings.caregiver.name} />
        <Field label="关系" value={settings.caregiver.relation} />
        <Field label="联系电话" value={settings.caregiver.phone} last />
      </GroupCard>

      <GroupCard icon={ShieldCheck} title="安全与声线">
        <div className="border-b border-border/60 py-3">
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs font-medium text-muted-foreground">
              安全区
            </span>
            <span className="text-right text-sm font-bold text-ink">
              {settings.safeZone}
            </span>
          </div>
          <p className="mt-1 text-[0.68rem] text-muted-foreground">
            真实定位不在 POC 范围
          </p>
        </div>
        <Link
          to="/caregiver/voices"
          className="flex items-center justify-between gap-4 py-3.5 transition-colors hover:text-ink"
        >
          <span className="text-sm font-bold text-ink">AI 声线授权管理</span>
          <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
        </Link>
      </GroupCard>

      <div className="flex flex-col items-center gap-2 pt-1">
        <Button className="px-10">保存修改</Button>
        <p className="text-[0.66rem] text-muted-foreground">
          POC 演示 · 数据为假数据
        </p>
      </div>
    </div>
  )
}

function GroupCard({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-4xl bg-muted/50 px-5 py-4">
      <div className="flex items-center gap-2.5">
        <Icon className="h-5 w-5 text-sun" strokeWidth={2.4} />
        <h3 className="font-display text-sm font-bold text-ink">{title}</h3>
      </div>
      <div className="mt-1.5">{children}</div>
    </div>
  )
}

function Field({
  label,
  value,
  last = false,
}: {
  label: string
  value: string
  last?: boolean
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 py-3",
        !last && "border-b border-border/60"
      )}
    >
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-bold text-ink">{value}</span>
    </div>
  )
}
