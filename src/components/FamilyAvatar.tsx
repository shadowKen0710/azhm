import { cn } from "@/lib/utils"
import { toneBg } from "@/lib/tone"
import type { FamilyTone } from "@/services/family"

/** 家人头像：有照片显示照片，否则暖色底 + 首字占位。 */
export function FamilyAvatar({
  photo,
  initial,
  tone,
  className,
}: {
  photo?: string
  initial: string
  tone: FamilyTone
  className?: string
}) {
  if (photo) {
    return (
      <img
        src={photo}
        alt={initial}
        className={cn("rounded-full object-cover", className)}
      />
    )
  }
  return (
    <span
      className={cn(
        "grid place-items-center rounded-full font-display font-extrabold text-ink",
        toneBg[tone],
        className
      )}
    >
      {initial}
    </span>
  )
}
