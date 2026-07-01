import { useEffect, useState } from "react"
import {
  Footprints,
  GlassWater,
  HeartPulse,
  Phone,
  Pill,
  Trash2,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  useMonitor,
  type MonReminder,
  type MonReminderIcon,
  type ReminderInput,
} from "@/state/monitor"

const TYPES: {
  icon: MonReminderIcon
  label: string
  Icon: typeof Pill
  medication: boolean
}[] = [
  { icon: "pill", label: "用药", Icon: Pill, medication: true },
  { icon: "heart", label: "血压", Icon: HeartPulse, medication: true },
  { icon: "water", label: "喝水", Icon: GlassWater, medication: false },
  { icon: "walk", label: "活动", Icon: Footprints, medication: false },
  { icon: "phone", label: "通话", Icon: Phone, medication: false },
]

const VOICES = ["无", "女儿", "老伴", "儿子"]

/** 新增/编辑提醒表单（编辑传 reminder，新增传 null）。 */
export function ReminderForm({
  reminder,
  onClose,
}: {
  reminder: MonReminder | null
  onClose: () => void
}) {
  const { addReminder, updateReminder, removeReminder } = useMonitor()
  const isEdit = !!reminder

  const [icon, setIcon] = useState<MonReminderIcon>(reminder?.icon ?? "pill")
  const [time, setTime] = useState(reminder?.time ?? "08:00")
  const [title, setTitle] = useState(reminder?.title ?? "")
  const [voice, setVoice] = useState(reminder?.voice ?? "无")
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Esc 关闭
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  const valid = /^\d{2}:\d{2}$/.test(time) && title.trim().length > 0

  function submit() {
    if (!valid) {
      setError("请填写标题，并选择有效时间。")
      return
    }
    const input: ReminderInput = {
      icon,
      time,
      title: title.trim(),
      medication: TYPES.find((t) => t.icon === icon)!.medication,
      voice: voice === "无" ? undefined : voice,
    }
    if (isEdit && reminder) updateReminder(reminder.id, input)
    else addReminder(input)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[400px] rounded-[32px] bg-card p-6 shadow-phone"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-extrabold text-ink">
            {isEdit ? "编辑提醒" : "新增提醒"}
          </h2>
          <button
            aria-label="关闭"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 类型 */}
        <p className="mt-5 text-sm font-semibold text-ink">类型</p>
        <div className="mt-2 grid grid-cols-5 gap-2">
          {TYPES.map((t) => (
            <button
              key={t.icon}
              onClick={() => setIcon(t.icon)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-2xl py-2.5 text-xs font-bold transition-colors",
                icon === t.icon
                  ? "bg-ink text-cream"
                  : "bg-muted/60 text-ink hover:bg-muted"
              )}
            >
              <t.Icon className="h-5 w-5" strokeWidth={2.2} />
              {t.label}
            </button>
          ))}
        </div>

        {/* 时间 */}
        <p className="mt-5 text-sm font-semibold text-ink">时间</p>
        <Input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="mt-2"
        />

        {/* 标题 */}
        <p className="mt-4 text-sm font-semibold text-ink">提醒内容</p>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="如：午间血压药"
          className="mt-2"
          autoFocus
        />

        {/* 声线 */}
        <p className="mt-4 text-sm font-semibold text-ink">播报声线</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {VOICES.map((v) => (
            <button
              key={v}
              onClick={() => setVoice(v)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-bold transition-colors",
                voice === v
                  ? "bg-sun text-ink"
                  : "bg-muted/60 text-ink hover:bg-muted"
              )}
            >
              {v === "无" ? "不播报" : `${v}声线`}
            </button>
          ))}
        </div>

        {error && (
          <p className="mt-4 text-sm font-semibold text-destructive">{error}</p>
        )}

        {/* 操作 */}
        <div className="mt-6 flex gap-3">
          {isEdit &&
            (confirmDelete ? (
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => {
                  if (reminder) removeReminder(reminder.id)
                  onClose()
                }}
              >
                确认删除
              </Button>
            ) : (
              <Button
                variant="outline"
                size="icon"
                aria-label="删除"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            ))}
          <Button className="flex-1" onClick={submit}>
            {isEdit ? "保存修改" : "添加提醒"}
          </Button>
        </div>
      </div>
    </div>
  )
}
