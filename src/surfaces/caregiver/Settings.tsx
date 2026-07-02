import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import {
  Check,
  ChevronRight,
  HeartHandshake,
  ShieldCheck,
  User,
  type LucideIcon,
} from "lucide-react"

import { InlineError, PageHeader, Sheet, SkeletonRows } from "@/components/states"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSettings } from "@/queries/hooks"
import { useSettingsStore } from "@/state/settings"
import type { SettingsData } from "@/services/settings"

export function Settings() {
  // 查询用于四态外壳（加载/错误演示）；正常态用可写设置 store。
  const { status, retry } = useSettings()

  return (
    <>
      <PageHeader light="我的" bold="设置" />
      <Sheet>
        {status === "loading" && <SkeletonRows rows={4} />}
        {status === "error" && <InlineError onRetry={retry} />}
        {status === "success" && <SettingsForm />}
      </Sheet>
    </>
  )
}

function SettingsForm() {
  const { settings, save } = useSettingsStore()
  const [draft, setDraft] = useState<SettingsData>(settings)
  const [saved, setSaved] = useState(false)

  // 外部变更时同步草稿
  useEffect(() => setDraft(settings), [settings])

  const dirty = JSON.stringify(draft) !== JSON.stringify(settings)

  function set<K extends keyof SettingsData>(key: K, value: SettingsData[K]) {
    setDraft((d) => ({ ...d, [key]: value }))
    setSaved(false)
  }

  function onSave() {
    save(draft)
    setSaved(true)
  }

  return (
    <div className="space-y-5">
      <GroupCard icon={User} title="患者档案">
        <EditField
          label="姓名"
          value={draft.patient.name}
          onChange={(v) => set("patient", { ...draft.patient, name: v })}
        />
        <EditField
          label="年龄"
          value={draft.patient.age}
          onChange={(v) => set("patient", { ...draft.patient, age: v })}
        />
        <EditField
          label="病程"
          value={draft.patient.condition}
          onChange={(v) => set("patient", { ...draft.patient, condition: v })}
        />
        <EditField
          label="家庭住址"
          value={draft.patient.homeAddress}
          onChange={(v) =>
            set("patient", { ...draft.patient, homeAddress: v })
          }
          last
        />
      </GroupCard>

      <GroupCard icon={HeartHandshake} title="主照护者">
        <EditField
          label="姓名"
          value={draft.caregiver.name}
          onChange={(v) => set("caregiver", { ...draft.caregiver, name: v })}
        />
        <EditField
          label="关系"
          value={draft.caregiver.relation}
          onChange={(v) =>
            set("caregiver", { ...draft.caregiver, relation: v })
          }
        />
        <EditField
          label="联系电话"
          value={draft.caregiver.phone}
          onChange={(v) => set("caregiver", { ...draft.caregiver, phone: v })}
          last
        />
      </GroupCard>

      <GroupCard icon={ShieldCheck} title="安全与声线">
        <EditField
          label="安全区"
          value={draft.safeZone}
          onChange={(v) => set("safeZone", v)}
          hint="真实定位不在 POC 范围"
          last
        />
        <Link
          to="/caregiver/voices"
          className="mt-1 flex items-center justify-between gap-4 border-t border-border/60 pt-3.5 transition-colors hover:text-ink"
        >
          <span className="text-sm font-bold text-ink">AI 声线授权管理</span>
          <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
        </Link>
      </GroupCard>

      <div className="flex flex-col items-center gap-2 pt-1">
        <Button className="px-10" onClick={onSave} disabled={!dirty}>
          {saved && !dirty ? (
            <>
              <Check className="h-5 w-5" />
              已保存
            </>
          ) : (
            "保存修改"
          )}
        </Button>
        <p className="text-[0.66rem] text-muted-foreground">
          修改本地保存 · 刷新后仍在
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
      <div className="mt-2">{children}</div>
    </div>
  )
}

function EditField({
  label,
  value,
  onChange,
  hint,
  last = false,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  hint?: string
  last?: boolean
}) {
  return (
    <div className={last ? "py-2" : "border-b border-border/60 py-2"}>
      <div className="flex items-center gap-4">
        <span className="w-20 shrink-0 text-xs font-medium text-muted-foreground">
          {label}
        </span>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 flex-1 border-transparent bg-card text-right text-sm font-bold"
        />
      </div>
      {hint && (
        <p className="mt-1 text-right text-[0.68rem] text-muted-foreground">
          {hint}
        </p>
      )}
    </div>
  )
}
