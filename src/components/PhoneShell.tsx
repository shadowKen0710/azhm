import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

/** 手机外框：统一圆角、阴影、宽度。bg 决定顶部露出的底色（黄头卡页用 sun）。 */
export function PhoneShell({
  children,
  bg = "bg-cream",
  className,
}: {
  children: ReactNode
  bg?: string
  className?: string
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[400px] overflow-hidden rounded-[44px] shadow-phone",
        bg,
        className
      )}
    >
      <div className="relative flex min-h-[812px] flex-col">{children}</div>
    </div>
  )
}
