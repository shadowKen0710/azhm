// 守护 · AI 陪聊后端代理（Cloudflare Worker）
// 持有 ANTHROPIC_API_KEY，把患者对话请求转发给 Claude（Haiku 4.5），
// 注入家人身份 + 记忆片段 + 怀旧/敏感守护指令，返回文本与真实 token 用量。
// 契约见 docs/BACKEND_PLAN.md §3。
import Anthropic from "@anthropic-ai/sdk"

interface Env {
  ANTHROPIC_API_KEY: string
  ALLOWED_ORIGIN?: string
}

const MODEL = "claude-haiku-4-5"

interface ReplyBody {
  memberName: string
  relation: string
  disclose?: boolean
  turnIndex: number
  memories: { tag: string; title: string; text: string }[]
}

function cors(origin: string) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type",
  }
}

function systemPrompt(b: ReplyBody): string {
  const mem = b.memories.length
    ? b.memories.map((m) => `- (${m.tag}) ${m.title}：${m.text}`).join("\n")
    : "（暂无共同回忆）"
  return [
    `你是阿兹海默症患者的家人「${b.memberName}」（${b.relation}），用温柔、简单、口语化的中文陪 TA 说话，帮助 TA 怀旧、安心。`,
    `每次只说一两句短话，用最熟悉的家常语气。自然地引用下面这些你们的共同回忆，唤起 TA 的记忆：`,
    mem,
    `安全守则（务必遵守）：`,
    `1. 绝不编造事实或不存在的回忆；不确定就温和带过。`,
    `2. 若 TA 说"想出门/难受/找不到家/想念已故亲人"等，先安抚情绪、不否定、不承诺做不到的事，并在回复末尾单独输出一行 [SENSITIVE] 作为给照护者的标记（该标记不要读给患者）。`,
    `3. 不谈医疗诊断、用药剂量、金钱等敏感决策。`,
    b.disclose ? `4. 你是 AI 模拟的声音，但对话中保持自然，不必反复声明。` : ``,
  ]
    .filter(Boolean)
    .join("\n")
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const origin = env.ALLOWED_ORIGIN ?? "*"
    if (req.method === "OPTIONS") {
      return new Response(null, { headers: cors(origin) })
    }
    const url = new URL(req.url)
    if (req.method !== "POST" || !url.pathname.endsWith("/companion/reply")) {
      return new Response("Not found", { status: 404, headers: cors(origin) })
    }

    let body: ReplyBody
    try {
      body = (await req.json()) as ReplyBody
    } catch {
      return json({ error: "bad json" }, 400, origin)
    }

    const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY })
    try {
      const msg = await client.messages.create({
        model: MODEL,
        max_tokens: 256,
        system: systemPrompt(body),
        messages: [
          {
            role: "user",
            content:
              body.turnIndex === 0
                ? "（接通了，请你先开口跟 TA 打招呼，并自然引用一段共同回忆。）"
                : "（继续这段温暖的对话，再引用另一段回忆，并轻轻鼓励 TA。）",
          },
        ],
      })

      const raw = msg.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("")
        .trim()
      const flaggedSensitive = raw.includes("[SENSITIVE]")
      const text = raw.replace(/\[SENSITIVE\]/g, "").trim()

      return json(
        {
          text,
          flaggedSensitive,
          usage: {
            inputTokens: msg.usage.input_tokens,
            outputTokens: msg.usage.output_tokens,
            cacheReadInputTokens: msg.usage.cache_read_input_tokens ?? 0,
          },
        },
        200,
        origin
      )
    } catch (e) {
      return json({ error: String(e) }, 502, origin)
    }
  },
}

function json(obj: unknown, status: number, origin: string): Response {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json", ...cors(origin) },
  })
}
