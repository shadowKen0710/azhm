import {
  MapPin,
  MessageCircleWarning,
  PillBottle,
  ShieldAlert,
  ShieldCheck,
  WifiOff,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  EmptyState,
  InlineError,
  PageHeader,
  Sheet,
  SkeletonRows,
} from "@/components/states"
import { cn } from "@/lib/utils"
import { useResource } from "@/lib/useResource"
import {
  getAlerts,
  type AlertItem,
  type SosEvent,
  type SosState,
} from "@/services/alerts"

const kindIcon: Record<AlertItem["kind"], typeof PillBottle> = {
  "missed-med": PillBottle,
  offline: WifiOff,
  sensitive: MessageCircleWarning,
  sos: ShieldAlert,
}

const stateLabel: Record<SosState, string> = {
  triggered: "已触发",
  sent: "已发送",
  acknowledged: "已接收",
  resolved: "已解决",
  escalated: "已升级",
  cancelled: "已取消",
}

export function Alerts() {
  const { status, data, retry } = useResource(getAlerts)

  const subtitle = data
    ? data.patientOnline
      ? `患者在线 · ${data.lastSeen}`
      : `患者离线 · ${data.lastSeen}`
    : undefined

  return (
    <>
      <PageHeader light="告警" bold="中心" subtitle={subtitle} />
      <Sheet>
        {status === "loading" && <SkeletonRows rows={4} />}
        {status === "error" && <InlineError onRetry={retry} />}
        {status === "success" &&
          data &&
          (data.active === null && data.history.length === 0 ? (
            <EmptyState
              icon={ShieldCheck}
              title="一切正常"
              hint="暂无告警，患者状态平稳。"
            />
          ) : (
            <div className="space-y-9">
              {data.active && <ActiveAlert event={data.active} />}
              {data.history.length > 0 && <History items={data.history} />}
            </div>
          ))}
      </Sheet>
    </>
  )
}

/* ---------- 进行中告警（本页签名卡） ---------- */
function ActiveAlert({ event }: { event: SosEvent }) {
  return (
    <div className="rounded-4xl border-2 border-destructive/70 bg-secondary p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-destructive text-destructive-foreground">
            <ShieldAlert className="h-5 w-5" strokeWidth={2.4} />
          </span>
          <h3 className="font-display text-base font-extrabold text-ink">
            进行中 · 紧急求助
          </h3>
        </div>
        <span className="rounded-full bg-destructive px-3 py-1.5 text-xs font-bold text-destructive-foreground">
          {stateLabel[event.state]}
        </span>
      </div>

      {/* 时间线 */}
      <ol className="mt-5 space-y-3">
        {event.steps.map((step, i) => (
          <li key={i} className="flex items-center gap-3">
            <span
              className={cn(
                "h-3 w-3 shrink-0 rounded-full",
                step.done ? "bg-ink" : "border-2 border-ink/25"
              )}
            />
            <span
              className={cn(
                "flex-1 text-sm font-medium",
                step.done ? "text-ink" : "text-muted-foreground"
              )}
            >
              {step.label}
            </span>
            <span className="text-xs font-semibold text-muted-foreground">
              {step.time}
            </span>
          </li>
        ))}
      </ol>

      {/* 位置占位 */}
      <div className="mt-5 flex items-center gap-2.5 rounded-3xl bg-card px-4 py-3">
        <MapPin className="h-5 w-5 shrink-0 text-sun" strokeWidth={2.4} />
        <div className="flex-1 leading-snug">
          <p className="text-[0.95rem] font-medium text-ink">
            {event.lastLocation}
          </p>
          <p className="text-xs font-semibold text-muted-foreground">
            占位位置 · 非真实定位
          </p>
        </div>
      </div>

      {/* 操作 */}
      <div className="mt-5 flex gap-3">
        <Button className="flex-1">我已知晓</Button>
        <Button variant="outline" className="flex-1">
          标记已解决
        </Button>
      </div>
    </div>
  )
}

/* ---------- 历史列表 ---------- */
function History({ items }: { items: AlertItem[] }) {
  return (
    <div>
      <h3 className="font-display text-sm font-bold text-ink">历史</h3>
      <ul className="mt-2 space-y-2.5">
        {items.map((item) => (
          <HistoryRow key={item.id} item={item} />
        ))}
      </ul>
    </div>
  )
}

function HistoryRow({ item }: { item: AlertItem }) {
  const Icon = kindIcon[item.kind]
  const high = item.level === "high"
  return (
    <li
      className={cn(
        "flex items-start gap-3 rounded-3xl px-4 py-3.5",
        high ? "border-l-4 border-destructive bg-destructive/10" : "bg-muted/50"
      )}
    >
      <Icon
        className={cn(
          "mt-0.5 h-5 w-5 shrink-0",
          high ? "text-destructive" : "text-sun"
        )}
        strokeWidth={2.4}
      />
      <div className="flex-1 leading-snug">
        <p className="text-[0.95rem] font-bold text-ink">{item.title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{item.detail}</p>
        <p className="mt-1 text-[0.66rem] font-semibold text-muted-foreground">
          {item.time}
        </p>
      </div>
    </li>
  )
}
