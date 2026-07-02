import { useState } from "react"
import {
  AudioLines,
  BookHeart,
  Coins,
  CreditCard,
  MessagesSquare,
  Plus,
  Wallet as WalletIcon,
  X,
} from "lucide-react"

import { PageHeader, Sheet } from "@/components/states"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  COMPANION_MODEL,
  creditsToCNY,
  creditsPer1k,
  MODEL_PRICING,
  modelCreditsPer1k,
  OP_LABEL,
  PAY_METHODS,
  pricePer1kCNY,
  quoteOp,
  RECHARGE_PACKAGES,
  type BillableOp,
  type PayMethod,
  type RechargePackage,
} from "@/services/billingApi"
import { useWallet, type LedgerEntry } from "@/state/wallet"

const opIcon: Record<BillableOp, typeof AudioLines> = {
  "voice-train": AudioLines,
  "memory-ingest": BookHeart,
  dialogue: MessagesSquare,
}

function time(ts: number) {
  if (ts < 1e6) return "赠送"
  const d = new Date(ts)
  const p = (n: number) => String(n).padStart(2, "0")
  return `${d.getMonth() + 1}/${d.getDate()} ${p(d.getHours())}:${p(d.getMinutes())}`
}

export function Wallet() {
  const { balance, ledger } = useWallet()
  const [recharge, setRecharge] = useState(false)

  const low = balance < 320 // 不足一次声线训练

  return (
    <>
      <PageHeader light="算力" bold="钱包" subtitle="按用量计费 · 透明计价" />
      <Sheet>
        {/* 余额卡 */}
        <div className="rounded-4xl bg-ink p-6 text-cream">
          <div className="flex items-center gap-2 text-sm font-semibold text-cream/70">
            <Coins className="h-4 w-4" />
            算力余额
          </div>
          <p className="mt-2 font-display text-5xl font-extrabold">
            {balance.toLocaleString()}
            <span className="ml-2 text-lg font-bold text-cream/60">点</span>
          </p>
          <p className="mt-1 text-sm font-medium text-cream/60">
            ≈ ¥{creditsToCNY(balance).toFixed(2)}
          </p>
          <Button
            className="mt-4 w-full bg-sun text-ink hover:bg-sun/90"
            onClick={() => setRecharge(true)}
          >
            <Plus className="h-5 w-5" />
            充值算力
          </Button>
        </div>

        {low && (
          <p className="mt-3 rounded-3xl bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive">
            余额偏低，可能不足以训练声线，建议充值。
          </p>
        )}

        {/* 计价说明 */}
        <h3 className="mt-7 font-display text-sm font-bold text-ink">
          计价说明
        </h3>
        <div className="mt-2 rounded-4xl bg-muted/50 p-5 text-sm text-muted-foreground">
          <p>
            按实际消耗的 token 计费：<b className="text-ink">token 现金成本 ×
            1.6（含 60% 利润）</b>，折算为算力点。
          </p>
          <p className="mt-1">
            当前：每 1K tokens = ¥{pricePer1kCNY.toFixed(2)} ={" "}
            {creditsPer1k} 点；1 点 = ¥0.01。
          </p>
          <ul className="mt-3 space-y-2">
            {(["voice-train", "memory-ingest", "dialogue"] as BillableOp[]).map(
              (op) => {
                const Icon = opIcon[op]
                return (
                  <li key={op} className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4 text-sun" />
                    <span className="flex-1 text-ink">{OP_LABEL[op]}</span>
                    <span className="font-bold text-ink">
                      约 {quoteOp(op, 200)} 点
                    </span>
                  </li>
                )
              }
            )}
          </ul>
          <p className="mt-3 border-t border-border/60 pt-3 text-xs">
            AI 陪聊接入真实模型后按实际用量计费（{MODEL_PRICING[COMPANION_MODEL].label}
            ）：约 {modelCreditsPer1k().input} 点/1K 输入 · {modelCreditsPer1k().output}{" "}
            点/1K 输出。
          </p>
        </div>

        {/* 流水 */}
        <h3 className="mt-7 font-display text-sm font-bold text-ink">流水</h3>
        <ul className="mt-2 space-y-2">
          {ledger.map((e) => (
            <LedgerRow key={e.id} entry={e} />
          ))}
        </ul>
      </Sheet>

      {recharge && <RechargeSheet onClose={() => setRecharge(false)} />}
    </>
  )
}

function LedgerRow({ entry }: { entry: LedgerEntry }) {
  const positive = entry.credits > 0
  const Icon = entry.op ? opIcon[entry.op] : entry.kind === "recharge" ? CreditCard : Coins
  return (
    <li className="flex items-center gap-3 rounded-3xl bg-muted/40 px-4 py-3">
      <span
        className={cn(
          "grid h-9 w-9 shrink-0 place-items-center rounded-full",
          positive ? "bg-[#B9E2C4] text-ink" : "bg-secondary text-ink"
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[0.95rem] font-bold text-ink">
          {entry.kind === "recharge"
            ? "充值"
            : entry.op
              ? OP_LABEL[entry.op]
              : "消费"}
        </p>
        <p className="text-xs text-muted-foreground">
          {time(entry.at)}
          {entry.tokens ? ` · ${entry.tokens.toLocaleString()} tokens` : ""}
        </p>
      </div>
      <span
        className={cn(
          "shrink-0 font-display text-base font-extrabold",
          positive ? "text-emerald-600" : "text-ink"
        )}
      >
        {positive ? "+" : ""}
        {entry.credits} 点
      </span>
    </li>
  )
}

function RechargeSheet({ onClose }: { onClose: () => void }) {
  const { recharge } = useWallet()
  const [pkg, setPkg] = useState<RechargePackage>(RECHARGE_PACKAGES[1])
  const [method, setMethod] = useState<PayMethod>("alipay")
  const [paying, setPaying] = useState(false)
  const [done, setDone] = useState(false)

  async function pay() {
    setPaying(true)
    const ok = await recharge(pkg, method)
    setPaying(false)
    if (ok) setDone(true)
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
            充值算力
          </h2>
          <button
            aria-label="关闭"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {done ? (
          <div className="mt-6 flex flex-col items-center text-center">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-ink text-cream">
              <WalletIcon className="h-8 w-8" />
            </span>
            <p className="mt-4 font-display text-xl font-extrabold text-ink">
              充值成功
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              已到账 {pkg.credits + (pkg.bonus ?? 0)} 点
            </p>
            <Button className="mt-6 w-full" onClick={onClose}>
              完成
            </Button>
          </div>
        ) : (
          <>
            {/* 套餐 */}
            <p className="mt-5 text-sm font-semibold text-ink">选择套餐</p>
            <div className="mt-2 grid grid-cols-2 gap-3">
              {RECHARGE_PACKAGES.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPkg(p)}
                  className={cn(
                    "rounded-3xl border-2 p-4 text-left transition-colors",
                    pkg.id === p.id
                      ? "border-ink bg-secondary"
                      : "border-border bg-muted/40"
                  )}
                >
                  <p className="font-display text-xl font-extrabold text-ink">
                    {p.credits} 点
                  </p>
                  {p.bonus && (
                    <p className="text-xs font-bold text-emerald-600">
                      赠 {p.bonus} 点
                    </p>
                  )}
                  <p className="mt-1 text-sm font-bold text-muted-foreground">
                    ¥{p.amountCNY}
                  </p>
                </button>
              ))}
            </div>

            {/* 支付方式 */}
            <p className="mt-5 text-sm font-semibold text-ink">支付方式</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {PAY_METHODS.map((m) => (
                <button
                  key={m.method}
                  onClick={() => setMethod(m.method)}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold transition-colors",
                    method === m.method
                      ? "bg-ink text-cream"
                      : "bg-muted/60 text-ink hover:bg-muted"
                  )}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <Button className="mt-6 w-full" onClick={pay} disabled={paying}>
              {paying
                ? "支付中…"
                : `支付 ¥${pkg.amountCNY} · 充 ${pkg.credits + (pkg.bonus ?? 0)} 点`}
            </Button>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              演示 · 支付为模拟，未真实扣款
            </p>
          </>
        )}
      </div>
    </div>
  )
}
