import type { ComponentType, ReactNode } from "react"
import { RotateCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/** 章节标题：前半常规 + 后半加粗，复刻参考图 "My Week / My Goals" 处理。 */
export function SectionTitle({
  light,
  bold,
  className,
}: {
  light: string
  bold: string
  className?: string
}) {
  return (
    <h2 className={cn("font-display text-2xl text-ink", className)}>
      <span className="font-medium">{light} </span>
      <span className="font-extrabold">{bold}</span>
    </h2>
  )
}

/** 照护者子页统一的黄色页眉（延续 light+bold 标题签名）。 */
export function PageHeader({
  light,
  bold,
  subtitle,
  right,
}: {
  light: string
  bold: string
  subtitle?: string
  right?: ReactNode
}) {
  return (
    <header className="bg-sun px-7 pb-7 pt-9">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-[2rem] leading-tight text-ink">
            <span className="font-medium">{light} </span>
            <span className="font-extrabold">{bold}</span>
          </h1>
          {subtitle && (
            <p className="mt-1.5 text-sm font-medium text-ink/70">{subtitle}</p>
          )}
        </div>
        {right}
      </div>
    </header>
  )
}

/** 骨架行。 */
export function SkeletonRows({ rows = 4 }: { rows?: number }) {
  return (
    <div className="animate-pulse-soft space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-16 w-full rounded-3xl bg-muted" />
      ))}
    </div>
  )
}

/** 内容区内联错误态（列表类页面用）。 */
export function InlineError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center rounded-4xl bg-secondary/60 px-6 py-10 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-full bg-ink/10">
        <RotateCw className="h-7 w-7 text-ink" />
      </div>
      <p className="mt-4 font-display text-lg font-extrabold text-ink">
        没能加载
      </p>
      <p className="mt-1 max-w-[240px] text-sm text-muted-foreground">
        接口占位错误。SOS 与提醒不受影响，重试即可。
      </p>
      <Button className="mt-5" onClick={onRetry}>
        重试
      </Button>
    </div>
  )
}

/** 空态引导卡。 */
export function EmptyState({
  icon: Icon,
  title,
  hint,
  actionLabel,
}: {
  icon: ComponentType<{ className?: string }>
  title: string
  hint: string
  actionLabel?: string
}) {
  return (
    <div className="flex flex-col items-center rounded-4xl border-2 border-dashed border-border px-6 py-10 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-full bg-secondary">
        <Icon className="h-7 w-7 text-ink" />
      </div>
      <p className="mt-4 text-base font-bold text-ink">{title}</p>
      <p className="mt-1 max-w-[250px] text-sm text-muted-foreground">{hint}</p>
      {actionLabel && <Button className="mt-5">{actionLabel}</Button>}
    </div>
  )
}

/** 白色内容纸容器（列表类页面统一用）。 */
export function Sheet({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <section
      className={cn(
        "flex-1 rounded-t-[34px] bg-card px-7 pb-28 pt-7",
        className
      )}
    >
      {children}
    </section>
  )
}
