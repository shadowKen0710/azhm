import { useEffect, useRef, useState } from "react"
import { Mic, Square, X } from "lucide-react"

import { FamilyAvatar } from "@/components/FamilyAvatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useMemories } from "@/state/memories"
import type { MemoryTag } from "@/services/companionApi"
import type { VoiceProfileView } from "@/state/voices"

const TAGS: { tag: MemoryTag; label: string }[] = [
  { tag: "childhood", label: "儿时" },
  { tag: "daily", label: "日常" },
  { tag: "milestone", label: "大事" },
  { tag: "place", label: "地点" },
  { tag: "other", label: "其他" },
]

const HINT =
  "讲讲你和 TA 的一段往事，越具体越好。例如：小时候一起做的事、TA 的口头禅、你们常去的地方…"

/** 记忆投喂表单：文字 + 可选录音音条 + 标签，归属某位家人。 */
export function MemoryForm({
  member,
  onClose,
}: {
  member: VoiceProfileView
  onClose: () => void
}) {
  const { addMemory } = useMemories()

  const [title, setTitle] = useState("")
  const [text, setText] = useState("")
  const [tag, setTag] = useState<MemoryTag>("childhood")
  const [error, setError] = useState<string | null>(null)

  // 录音音条（本地，不上传）
  const [recording, setRecording] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const recRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    return () => {
      window.removeEventListener("keydown", onKey)
      streamRef.current?.getTracks().forEach((t) => t.stop())
      if (tickRef.current) clearInterval(tickRef.current)
    }
  }, [onClose])

  async function startRec() {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      chunksRef.current = []
      const rec = new MediaRecorder(stream)
      rec.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data)
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" })
        setAudioUrl(URL.createObjectURL(blob))
      }
      rec.start()
      recRef.current = rec
      setRecording(true)
      setSeconds(0)
      tickRef.current = setInterval(() => setSeconds((s) => s + 1), 1000)
    } catch {
      setError("无法使用麦克风，可改用文字记录。")
    }
  }

  function stopRec() {
    recRef.current?.stop()
    streamRef.current?.getTracks().forEach((t) => t.stop())
    if (tickRef.current) clearInterval(tickRef.current)
    setRecording(false)
  }

  function submit() {
    if (!text.trim()) {
      setError("请写下这段回忆的内容。")
      return
    }
    addMemory({
      memberId: member.memberId,
      title: title.trim() || "一段回忆",
      text: text.trim(),
      tag,
      hasAudio: !!audioUrl,
    })
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-[400px] overflow-y-auto rounded-[32px] bg-card p-6 shadow-phone"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-extrabold text-ink">
            讲讲你和{member.name}的故事
          </h2>
          <button
            aria-label="关闭"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <FamilyAvatar
            photo={member.photo}
            initial={member.initial}
            tone={member.tone}
            className="h-11 w-11 text-base"
          />
          <p className="text-sm text-muted-foreground">
            AI 会用 {member.name} 的声线，把这段回忆讲给患者听。
          </p>
        </div>

        {/* 标签 */}
        <p className="mt-5 text-sm font-semibold text-ink">类型</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {TAGS.map((t) => (
            <button
              key={t.tag}
              onClick={() => setTag(t.tag)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-bold transition-colors",
                tag === t.tag
                  ? "bg-ink text-cream"
                  : "bg-muted/60 text-ink hover:bg-muted"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* 标题 */}
        <p className="mt-4 text-sm font-semibold text-ink">起个名字</p>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="如：夏夜的萤火虫"
          className="mt-2"
        />

        {/* 正文 */}
        <p className="mt-4 text-sm font-semibold text-ink">这段回忆</p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={HINT}
          rows={4}
          className="mt-2 w-full rounded-2xl border-2 border-input bg-card p-4 text-base font-medium leading-relaxed text-ink outline-none placeholder:text-muted-foreground focus-visible:border-ring"
        />

        {/* 录音音条（可选，本地不上传） */}
        <div className="mt-4 flex items-center justify-between rounded-2xl bg-muted/50 px-4 py-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink">语音记录（可选）</p>
            <p className="text-xs text-muted-foreground">
              {audioUrl
                ? "已录制，仅存本机"
                : recording
                  ? `录音中 ${seconds}s`
                  : "也可以直接说给 AI 听"}
            </p>
          </div>
          {!recording ? (
            <button
              onClick={startRec}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-destructive text-destructive-foreground"
              aria-label="录音"
            >
              <Mic className="h-5 w-5" />
            </button>
          ) : (
            <button
              onClick={stopRec}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-ink text-cream"
              aria-label="停止录音"
            >
              <Square className="h-4 w-4" fill="currentColor" />
            </button>
          )}
        </div>
        {audioUrl && <audio src={audioUrl} controls className="mt-2 w-full" />}

        {error && (
          <p className="mt-4 text-sm font-semibold text-destructive">{error}</p>
        )}

        <Button className="mt-6 w-full" onClick={submit}>
          让 AI 记住
        </Button>
      </div>
    </div>
  )
}
