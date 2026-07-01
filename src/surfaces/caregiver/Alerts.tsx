import {
  MapPin,
  PillBottle,
  ShieldAlert,
  ShieldCheck,
  Wifi,
  WifiOff,
} from "lucide-react"

import { MonitorControls, StatusBanner } from "@/components/MonitorControls"
import { Button } from "@/components/ui/button"
import {
  EmptyState,
  InlineError,
  PageHeader,
  Sheet,
  SkeletonRows,
} from "@/components/states"
import { cn } from "@/lib/utils"
import { useAlerts } from "@/queries/hooks"
import type { SosEvent, SosState } from "@/services/alerts"
import { useMonitor, type MonAlert } from "@/state/monitor"

const monKindIcon: Record<MonAlert["kind"], typeof PillBottle> = {
  "missed-med": PillBottle,
  offline: WifiOff,
  recovered: Wifi,
}

const stateLabel: Record<SosState, string> = {
  triggered: "已触发",
  sent: "已发送",
  acknowledged: "已接收",
  resolved: "已解决",
  escalated: "已升级",
  cancelled: "已取消",
}

function hhmm(ts: number) {
  const d = new Date(ts)
  const p = (n: number) => String(n).padStart(2, "0")
  return `${p(d.getHours())}:${p(d.getMinutes())}`
}

export function Alerts() {
  const { status, data, retry } = useAlerts()
  const mon = useMonitor()

  return (
    <>
      <PageHeader light="告警" bold="中心" />
      <Sheet>
        {status === "loading" && <SkeletonRows rows={4} />}
        {status === "error" && <InlineError onRetry={retry} />}
        {status === "success" &&
          data &&
          (data.active === null && data.history.length === 0 ? (
            // 「空数据」演示：纯空态视觉
            <EmptyState
              icon={ShieldCheck}
              title="一切正常"
              hint="暂无告警，患者状态平稳。"
            />
          ) : (
            <div className="space-y-6">
              <StatusBanner />
              <MonitorControls />
              {data.active && <ActiveAlert event={data.active} />}
              <LiveHistory alerts={mon.alerts} />
            </div>
          ))}
      </Sheet>
    </>
  )
}

/* ---------- 进行中告警（SOS 时间线签名卡） ---------- */
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

      <div className="mt-5 flex gap-3">
        <Button className="flex-1">我已知晓</Button>
        <Button variant="outline" className="flex-1">
          标记已解决
        </Button>
      </div>
    </div>
  )
}

/* ---------- 实时历史（状态机生成，非预置） ---------- */
function LiveHistory({ alerts }: { alerts: MonAlert[] }) {
  return (
    <div>
      <h3 className="font-display text-sm font-bold text-ink">历史</h3>
      {alerts.length === 0 ? (
        <p className="mt-2 rounded-3xl bg-muted/50 px-4 py-4 text-sm text-muted-foreground">
          暂无历史告警。到点未服药或患者失联时会自动出现在这里。
        </p>
      ) : (
        <ul className="mt-2 space-y-2.5">
          {alerts.map((a) => (
            <LiveRow key={a.id} alert={a} />
          ))}
        </ul>
      )}
    </div>
  )
}

function LiveRow({ alert }: { alert: MonAlert }) {
  const Icon = monKindIcon[alert.kind]
  const high = alert.level === "high"
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
          high ? "text-destructive" : "text-emerald-500"
        )}
        strokeWidth={2.4}
      />
      <div className="flex-1 leading-snug">
        <p className="text-[0.95rem] font-bold text-ink">{alert.title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{alert.detail}</p>
        <p className="mt-1 text-[0.66rem] font-semibold text-muted-foreground">
          {hhmm(alert.at)}
        </p>
      </div>
    </li>
  )
}
