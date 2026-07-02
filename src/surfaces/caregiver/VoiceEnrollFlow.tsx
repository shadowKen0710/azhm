import { useEffect, useRef, useState } from "react"
import {
  Check,
  Coins,
  Mic,
  Play,
  RotateCcw,
  ShieldCheck,
  Square,
  X,
} from "lucide-react"
import { useNavigate } from "react-router-dom"

import { FamilyAvatar } from "@/components/FamilyAvatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useVoicesStore, type VoiceProfileView } from "@/state/voices"
import { useWallet } from "@/state/wallet"
import { quoteOp } from "@/services/billingApi"

type Step =
  | "consent"
  | "record"
  | "review"
  | "training"
  | "done"
  | "insufficient"

const SAMPLE_TEXT = "爸，是我呀。今天有没有好好吃饭？记得按时吃药，我陪着你。"

/** 声线授权录制流程：同意 → 录音(真实麦克风) → 试听 → 训练 → 完成。 */
export function VoiceEnrollFlow({
  member,
  onClose,
}: {
  member: VoiceProfileView
  onClose: () => void
}) {
  const { authorize, profiles } = useVoicesStore()
  const { charge, balance } = useWallet()
  const navigate = useNavigate()
  const trainCost = quoteOp("voice-train")
  const [step, setStep] = useState<Step>("consent")
  const [consent, setConsent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 录音
  const [recording, setRecording] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [level, setLevel] = useState(0) // 0-1 音量，用于波形动画
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const durationRef = useRef(0)

  const mediaRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const blobRef = useRef<Blob | null>(null)
  const rafRef = useRef<number | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // 实时训练进度（从 store 读取本家人）
  const live = profiles.find((p) => p.memberId === member.memberId)

  function cleanup() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    if (tickRef.current) clearInterval(tickRef.current)
    streamRef.current?.getTracks().forEach((t) => t.stop())
    audioCtxRef.current?.close().catch(() => {})
  }
  useEffect(() => cleanup, [])

  async function startRecording() {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      // 音量分析驱动波形动画
      const ctx = new AudioContext()
      audioCtxRef.current = ctx
      const src = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 256
      src.connect(analyser)
      analyserRef.current = analyser
      const buf = new Uint8Array(analyser.frequencyBinCount)
      const loop = () => {
        analyser.getByteTimeDomainData(buf)
        let peak = 0
        for (const v of buf) peak = Math.max(peak, Math.abs(v - 128) / 128)
        setLevel(peak)
        rafRef.current = requestAnimationFrame(loop)
      }
      loop()

      chunksRef.current = []
      const rec = new MediaRecorder(stream)
      rec.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data)
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" })
        blobRef.current = blob
        setAudioUrl(URL.createObjectURL(blob))
        setStep("review")
      }
      rec.start()
      mediaRef.current = rec
      setRecording(true)
      setSeconds(0)
      tickRef.current = setInterval(
        () => setSeconds((s) => (durationRef.current = s + 1)),
        1000
      )
    } catch {
      setError("无法使用麦克风。请在浏览器允许麦克风权限后重试。")
    }
  }

  function stopRecording() {
    mediaRef.current?.stop()
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    if (tickRef.current) clearInterval(tickRef.current)
    streamRef.current?.getTracks().forEach((t) => t.stop())
    setRecording(false)
    setLevel(0)
  }

  function reRecord() {
    setAudioUrl(null)
    setSeconds(0)
    durationRef.current = 0
    setStep("record")
  }

  async function submit() {
    if (!blobRef.current) return
    // 训练声线扣算力；余额不足则拦截并引导充值。
    if (!charge("voice-train")) {
      setStep("insufficient")
      return
    }
    setStep("training")
    await authorize(member.memberId, {
      blob: blobRef.current,
      durationSec: durationRef.current,
    })
  }

  // 训练完成 → done
  useEffect(() => {
    if (step === "training" && live?.status === "ready") setStep("done")
  }, [step, live?.status])

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
            授权录制 · {member.name}声线
          </h2>
          <button
            aria-label="关闭"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 flex flex-col items-center">
          <FamilyAvatar
            photo={member.photo}
            initial={member.initial}
            tone={member.tone}
            className="h-16 w-16 text-2xl"
          />
        </div>

        {/* 同意 */}
        {step === "consent" && (
          <>
            <div className="mt-5 rounded-4xl bg-secondary/60 p-5">
              <div className="flex items-center gap-2 font-bold text-ink">
                <ShieldCheck className="h-5 w-5" />
                知情同意
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                声线须经 <b className="text-ink">{member.name}本人</b>{" "}
                同意后录制，仅用于陪伴患者，可随时撤销。录音只在本机处理，不上传。
              </p>
            </div>
            <label className="mt-4 flex cursor-pointer items-center gap-3">
              <button
                onClick={() => setConsent((v) => !v)}
                className={cn(
                  "grid h-7 w-7 shrink-0 place-items-center rounded-lg border-2 transition-colors",
                  consent
                    ? "border-ink bg-ink text-cream"
                    : "border-ink/25 bg-transparent"
                )}
                aria-label="确认同意"
              >
                {consent && <Check className="h-4 w-4" strokeWidth={3} />}
              </button>
              <span className="text-sm font-medium text-ink">
                我已获得 {member.name} 本人同意录制其声线
              </span>
            </label>
            <Button
              className="mt-6 w-full"
              disabled={!consent}
              onClick={() => setStep("record")}
            >
              下一步 · 录音
            </Button>
          </>
        )}

        {/* 录音 */}
        {step === "record" && (
          <>
            <p className="mt-5 text-sm font-semibold text-ink">
              请清晰朗读下面这句话：
            </p>
            <p className="mt-2 rounded-3xl bg-muted/60 p-4 text-lg font-medium leading-relaxed text-ink">
              {SAMPLE_TEXT}
            </p>

            {/* 波形动画 */}
            <div className="mt-5 flex h-16 items-center justify-center gap-1">
              {Array.from({ length: 13 }).map((_, i) => {
                const base = recording ? 0.25 + level * (i % 2 ? 1.4 : 0.9) : 0.2
                const h = Math.min(1, base) * 100
                return (
                  <span
                    key={i}
                    className={cn(
                      "w-2 rounded-full transition-all duration-100",
                      recording ? "bg-sun" : "bg-muted"
                    )}
                    style={{ height: `${Math.max(12, h)}%` }}
                  />
                )
              })}
            </div>
            <p className="text-center font-display text-2xl font-extrabold text-ink">
              {String(Math.floor(seconds / 60)).padStart(2, "0")}:
              {String(seconds % 60).padStart(2, "0")}
            </p>

            {error && (
              <p className="mt-3 text-center text-sm font-semibold text-destructive">
                {error}
              </p>
            )}

            <div className="mt-5 flex justify-center">
              {!recording ? (
                <button
                  onClick={startRecording}
                  className="grid h-20 w-20 place-items-center rounded-full bg-destructive text-destructive-foreground shadow-soft transition-transform active:scale-95"
                  aria-label="开始录音"
                >
                  <Mic className="h-9 w-9" />
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  disabled={seconds < 2}
                  className="grid h-20 w-20 place-items-center rounded-full bg-ink text-cream shadow-soft transition-transform active:scale-95 disabled:opacity-40"
                  aria-label="停止录音"
                >
                  <Square className="h-8 w-8" fill="currentColor" />
                </button>
              )}
            </div>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              {recording ? "至少录 2 秒，点方块停止" : "点麦克风开始录音"}
            </p>
          </>
        )}

        {/* 试听 */}
        {step === "review" && audioUrl && (
          <>
            <p className="mt-5 text-center text-sm font-semibold text-ink">
              录好了（{seconds} 秒），试听一下：
            </p>
            <audio src={audioUrl} controls className="mt-3 w-full" />
            <div className="mt-6 flex gap-3">
              <Button variant="outline" className="flex-1" onClick={reRecord}>
                <RotateCcw className="h-5 w-5" />
                重录
              </Button>
              <Button className="flex-1" onClick={submit}>
                <Play className="h-5 w-5" />
                开始学习
              </Button>
            </div>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              训练将消耗 {trainCost} 算力点（余额 {balance} 点）
            </p>
          </>
        )}

        {/* 余额不足 */}
        {step === "insufficient" && (
          <div className="mt-6 flex flex-col items-center text-center">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-destructive/10 text-destructive">
              <Coins className="h-8 w-8" />
            </span>
            <p className="mt-4 font-display text-xl font-extrabold text-ink">
              算力不足
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              训练声线需 {trainCost} 点，当前余额 {balance} 点。充值后即可继续。
            </p>
            <Button
              className="mt-6 w-full"
              onClick={() => {
                onClose()
                navigate("/caregiver/wallet")
              }}
            >
              去充值
            </Button>
          </div>
        )}

        {/* 训练中 */}
        {step === "training" && (
          <div className="mt-6 text-center">
            <p className="font-display text-lg font-extrabold text-ink">
              AI 正在学习 {member.name} 的声音…
            </p>
            <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-sun transition-all duration-300"
                style={{ width: `${live?.learnProgress ?? 0}%` }}
              />
            </div>
            <p className="mt-2 text-sm font-semibold text-muted-foreground">
              已学习 {live?.learnProgress ?? 0}%
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              训练在可插拔的 voiceService 内进行（当前为模拟；接入 GPT-SoVITS
              后此处为真实训练）
            </p>
          </div>
        )}

        {/* 完成 */}
        {step === "done" && (
          <div className="mt-6 flex flex-col items-center text-center">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-ink text-cream">
              <Check className="h-8 w-8" strokeWidth={3} />
            </span>
            <p className="mt-4 font-display text-xl font-extrabold text-ink">
              {member.name}声线已就绪
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              现在患者可以和 {member.name} 的 AI 声线对话了。
            </p>
            <Button className="mt-6 w-full" onClick={onClose}>
              完成
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
