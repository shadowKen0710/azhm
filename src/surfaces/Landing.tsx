import {
  AudioLines,
  BookHeart,
  Check,
  HeartHandshake,
  MonitorSmartphone,
  Pill,
  ShieldCheck,
  Siren,
  Sparkles,
  UsersRound,
  Volume2,
  type LucideIcon,
} from "lucide-react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  creditsPer1k,
  OP_LABEL,
  PAY_METHODS,
  PRICING,
  pricePer1kCNY,
  quoteOp,
  RECHARGE_PACKAGES,
  type BillableOp,
} from "@/services/billingApi"

export function Landing() {
  return (
    <div className="min-h-screen bg-cream text-ink">
      <SiteHeader />
      <Hero />
      <TrustStrip />
      <Features />
      <Pricing />
      <ClosingCta />
      <Footer />
    </div>
  )
}

/* ---------- 顶栏 ---------- */
function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-ink/10 bg-cream/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-2xl bg-sun text-ink">
            <HeartHandshake className="h-5 w-5" strokeWidth={2.2} />
          </span>
          <span className="font-display text-xl font-extrabold">守护</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/patient">患者大屏</Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/login">照护者登录</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}

/* ---------- Hero（thesis：会说话的记忆气泡） ---------- */
function Hero() {
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-8 pt-14 md:grid-cols-2 md:pt-20">
      <div className="motion-safe:animate-fade-up">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3.5 py-1.5 text-sm font-bold text-ink">
          <Sparkles className="h-4 w-4" />
          AI 家人声线陪伴
        </span>
        <h1 className="mt-5 font-display text-[2.9rem] font-extrabold leading-[1.08] tracking-tight md:text-6xl">
          让 AI 用家人的声音，
          <br />
          陪 TA 慢慢想起
        </h1>
        <p className="mt-5 max-w-md text-lg leading-relaxed text-ink/70">
          阿兹海默照护，最难的是孤独和遗忘。守护把家人的声音和你们的共同回忆交给
          AI，用最熟悉的声音陪患者说话；用药、安全、情绪，都替你看着。
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button size="lg" asChild>
            <Link to="/login">
              <HeartHandshake className="h-5 w-5" />
              照护者登录
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/patient">
              <MonitorSmartphone className="h-5 w-5" />
              看看患者大屏
            </Link>
          </Button>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          演示环境 · 数据为占位假数据，可自由体验
        </p>
      </div>

      <MemoryBubble />
    </section>
  )
}

/** 签名元素：像产品里真实对话那样，家人 AI 声线织入一段回忆。 */
function MemoryBubble() {
  return (
    <div className="motion-safe:animate-fade-up [animation-delay:150ms]">
      <div className="relative mx-auto max-w-md rounded-[2.5rem] bg-card p-7 shadow-phone">
        <div className="flex items-center gap-3">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-[#F7C9A0] font-display text-2xl font-extrabold text-ink">
            雯
          </span>
          <div>
            <p className="text-lg font-extrabold">正在和女儿通话</p>
            <p className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5" /> AI 模拟声音
            </p>
          </div>
          <span className="ml-auto flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-bold">
            <Volume2 className="h-3.5 w-3.5" /> 正在聆听
          </span>
        </div>

        <div className="mt-6 space-y-3">
          <div className="flex items-start gap-2.5">
            <span className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#F7C9A0] text-sm font-extrabold text-ink">
              雯
            </span>
            <p className="rounded-[1.6rem] bg-secondary px-4 py-3 text-[1.05rem] font-medium leading-relaxed text-ink">
              爸，是我呀。我刚想起小时候的事——你带我去河边捉萤火虫，装在玻璃瓶里当灯笼，你还记得吗？
            </p>
          </div>
          <div className="flex justify-end">
            <p className="rounded-[1.6rem] bg-ink px-4 py-3 text-[1.05rem] font-medium leading-relaxed text-cream">
              记得呀……你这么一说，我都想起来了。
            </p>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-2 rounded-2xl bg-muted/60 px-4 py-3 text-sm font-medium text-muted-foreground">
          <BookHeart className="h-4 w-4 text-sun" />
          这段回忆由家人亲自讲给 AI，用女儿的声线说出来
        </div>
      </div>
    </div>
  )
}

/* ---------- 信任条（伦理即卖点） ---------- */
function TrustStrip() {
  const items = ["家人授权录制", "录音不上传", "明示这是 AI", "随时可撤销"]
  return (
    <section className="border-y border-ink/10 bg-secondary/40">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-3 px-5 py-5">
        {items.map((t) => (
          <span key={t} className="flex items-center gap-2 text-sm font-bold">
            <ShieldCheck className="h-4 w-4 text-ink" strokeWidth={2.4} />
            {t}
          </span>
        ))}
      </div>
    </section>
  )
}

/* ---------- 核心功能 ---------- */
const FEATURES: { icon: LucideIcon; title: string; desc: string }[] = [
  { icon: AudioLines, title: "家人 AI 声线", desc: "授权录制家人声音，AI 学习后用最熟悉的声线陪患者说话。" },
  { icon: BookHeart, title: "记忆陪伴", desc: "把你们的共同回忆讲给 AI，对话时自然聊起往事，帮 TA 怀旧。" },
  { icon: ShieldCheck, title: "实时守护", desc: "在线状态、情绪信号、失联告警，患者好不好一眼看到。" },
  { icon: Pill, title: "用药日程提醒", desc: "到点用家人声线提醒；超时未服自动升级通知照护者。" },
  { icon: Siren, title: "一键 SOS", desc: "患者一键求助，全链路状态可追踪，误触可撤销。" },
  { icon: UsersRound, title: "认人卡", desc: "家人照片、称呼、关系，帮患者认出身边的人。" },
]

function Features() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-20">
      <h2 className="font-display text-3xl font-extrabold md:text-4xl">
        一套 app，照看
        <span className="text-ink/40"> 情感与安全</span>
      </h2>
      <p className="mt-3 max-w-lg text-lg text-ink/60">
        照护者用手机控制台管理一切；患者用一块横屏大屏，零操作就能被家人的声音陪着。
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="rounded-[1.8rem] bg-card p-6 shadow-soft transition-transform hover:-translate-y-1"
          >
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-secondary text-ink">
              <f.icon className="h-6 w-6" strokeWidth={2.2} />
            </span>
            <h3 className="mt-4 font-display text-xl font-extrabold">
              {f.title}
            </h3>
            <p className="mt-1.5 leading-relaxed text-ink/60">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ---------- 透明计价 ---------- */
function Pricing() {
  const ops: BillableOp[] = ["voice-train", "memory-ingest", "dialogue"]
  return (
    <section className="bg-ink py-20 text-cream">
      <div className="mx-auto max-w-6xl px-5">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-sm font-bold text-cream">
          按用量计费
        </span>
        <h2 className="mt-5 font-display text-3xl font-extrabold md:text-4xl">
          明明白白，用多少付多少
        </h2>
        <p className="mt-3 max-w-xl text-lg text-cream/60">
          训练声线、投喂记忆、AI 陪聊都按实际消耗的 token 计费：
          <b className="text-sun">
            {" "}
            token 现金成本 × {(1 + PRICING.markup).toFixed(1)}
          </b>
          （含 {Math.round(PRICING.markup * 100)}% 利润），折算为「算力点」。
          当前每 1K tokens = ¥{pricePer1kCNY.toFixed(2)} = {creditsPer1k} 点；1 点 =
          ¥{PRICING.creditValueCNY.toFixed(2)}。
        </p>

        {/* 各操作单价 */}
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {ops.map((op) => (
            <div key={op} className="rounded-[1.6rem] bg-white/5 p-5">
              <p className="text-sm font-semibold text-cream/60">
                {OP_LABEL[op]}
              </p>
              <p className="mt-1 font-display text-3xl font-extrabold text-sun">
                约 {quoteOp(op, 200)}
                <span className="ml-1 text-base font-bold text-cream/70">
                  点
                </span>
              </p>
            </div>
          ))}
        </div>

        {/* 充值套餐 */}
        <h3 className="mt-12 font-display text-xl font-extrabold">充值套餐</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {RECHARGE_PACKAGES.map((p, i) => (
            <div
              key={p.id}
              className={cn(
                "rounded-[1.6rem] p-6",
                i === 1 ? "bg-sun text-ink" : "bg-white/5 text-cream"
              )}
            >
              <p className="font-display text-3xl font-extrabold">
                {p.credits.toLocaleString()} 点
              </p>
              {p.bonus ? (
                <p
                  className={cn(
                    "text-sm font-bold",
                    i === 1 ? "text-ink/70" : "text-emerald-400"
                  )}
                >
                  赠 {p.bonus} 点
                </p>
              ) : (
                <p className="text-sm font-bold opacity-0">占位</p>
              )}
              <p className="mt-3 text-2xl font-extrabold">¥{p.amountCNY}</p>
            </div>
          ))}
        </div>

        {/* 支付方式 */}
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-semibold text-cream/60">
          <span>支持</span>
          {PAY_METHODS.map((m) => (
            <span key={m.method} className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-sun" />
              {m.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------- 收尾 CTA ---------- */
function ClosingCta() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-20 text-center">
      <h2 className="font-display text-3xl font-extrabold md:text-5xl">
        现在，为 TA 建一个会说话的家
      </h2>
      <p className="mx-auto mt-4 max-w-lg text-lg text-ink/60">
        录一段家人的声音，讲一个你们的故事。剩下的，交给守护。
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button size="lg" asChild>
          <Link to="/login">照护者登录</Link>
        </Button>
        <Button size="lg" variant="outline" asChild>
          <Link to="/patient">看看患者大屏</Link>
        </Button>
      </div>
    </section>
  )
}

/* ---------- 页脚 ---------- */
function Footer() {
  return (
    <footer className="border-t border-ink/10 px-5 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-sm text-ink/50 sm:flex-row">
        <span className="font-display font-bold text-ink/70">守护 · POC</span>
        <span>演示项目 · 数据为假数据，支付/克隆为模拟</span>
        <a
          href="https://github.com/shadowKen0710/azhm"
          className="font-semibold underline"
          target="_blank"
          rel="noreferrer"
        >
          GitHub 源码
        </a>
      </div>
    </footer>
  )
}
