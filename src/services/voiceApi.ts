// 声线克隆 API 抽象层（可插拔）。
// 现为 mock 实现：本地模拟「入组 → 训练 job 轮询 → 合成」。
// 日后接 GPT-SoVITS / Replicate / HF 等真实推理后端时，只需替换本文件的实现，
// 保持下方接口不变，上层（VoiceProvider / 录音流程）无需改动。
//
// 真实后端映射示意：
//   enrollVoice(memberId, sample)  → POST /voices  (上传样本, 返回 jobId)
//   pollTraining(jobId)            → GET  /jobs/:id (返回 progress/status)
//   synthesize(voiceId, text)      → POST /tts     (返回音频 URL/blob)

export interface VoiceSample {
  blob: Blob
  durationSec: number
}

export interface TrainingJob {
  jobId: string
  progress: number // 0-100
  status: "training" | "ready" | "failed"
}

export interface VoiceApi {
  enrollVoice(memberId: string, sample: VoiceSample): Promise<{ jobId: string }>
  pollTraining(jobId: string): Promise<TrainingJob>
  synthesize(voiceId: string, text: string): Promise<{ audioUrl: string }>
}

// ---------- Mock 实现 ----------
// 训练进度按真实时间推进（演示用较快），不落真实模型。
const jobs = new Map<string, { startedAt: number; memberId: string }>()
const TRAIN_MS = 6000

export const mockVoiceApi: VoiceApi = {
  async enrollVoice(memberId, _sample) {
    const jobId = `job-${memberId}-${Date.now()}`
    jobs.set(jobId, { startedAt: Date.now(), memberId })
    return { jobId }
  },

  async pollTraining(jobId) {
    const job = jobs.get(jobId)
    if (!job) return { jobId, progress: 0, status: "failed" }
    const elapsed = Date.now() - job.startedAt
    const progress = Math.min(100, Math.round((elapsed / TRAIN_MS) * 100))
    return {
      jobId,
      progress,
      status: progress >= 100 ? "ready" : "training",
    }
  },

  async synthesize(_voiceId, _text) {
    // mock：不真正合成，返回占位。真实实现返回 TTS 音频。
    return { audioUrl: "" }
  },
}

// 当前使用的实现（切换真实后端时改这里）。
export const voiceApi: VoiceApi = mockVoiceApi
