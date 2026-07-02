import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"

import {
  billingApi,
  estimateTokens,
  quoteOp,
  type BillableOp,
  type PayMethod,
  type RechargePackage,
} from "@/services/billingApi"

// 算力钱包 store：余额（算力点）+ 流水账。localStorage 持久化。

export interface LedgerEntry {
  id: string
  kind: "recharge" | "spend"
  op?: BillableOp
  credits: number // 正=充值，负=消费
  tokens?: number
  method?: PayMethod
  at: number
}

const KEY = "azhm.wallet"
const SEED_BALANCE = 500 // 初始赠送算力点（¥5）

interface Persisted {
  balance: number
  ledger: LedgerEntry[]
}

function load(): Persisted {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as Persisted
  } catch {
    /* 降级 */
  }
  return {
    balance: SEED_BALANCE,
    ledger: [
      {
        id: "seed",
        kind: "recharge",
        credits: SEED_BALANCE,
        at: 1,
      },
    ],
  }
}

interface WalletValue {
  balance: number
  ledger: LedgerEntry[]
  quote: (op: BillableOp, textLen?: number) => number
  canAfford: (op: BillableOp, textLen?: number) => boolean
  /** 扣费；余额足够则扣除并记账、返回 true，否则不扣、返回 false。 */
  charge: (op: BillableOp, textLen?: number) => boolean
  /** 尽力扣费（用于患者对话，不硬阻断）：能扣多少扣多少，恒记录。 */
  chargeBestEffort: (op: BillableOp, textLen?: number) => void
  recharge: (pkg: RechargePackage, method: PayMethod) => Promise<boolean>
}

const WalletContext = createContext<WalletValue | null>(null)

export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Persisted>(load)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
    } catch {
      /* 降级 */
    }
  }, [state])

  const quote: WalletValue["quote"] = (op, textLen) => quoteOp(op, textLen)
  const canAfford: WalletValue["canAfford"] = (op, textLen) =>
    state.balance >= quoteOp(op, textLen)

  const charge: WalletValue["charge"] = (op, textLen) => {
    const cost = quoteOp(op, textLen)
    if (state.balance < cost) return false
    setState((s) => ({
      balance: s.balance - cost,
      ledger: [
        {
          id: `sp-${Date.now()}`,
          kind: "spend",
          op,
          credits: -cost,
          tokens: estimateTokens(op, textLen),
          at: Date.now(),
        },
        ...s.ledger,
      ],
    }))
    return true
  }

  const chargeBestEffort: WalletValue["chargeBestEffort"] = (op, textLen) => {
    const cost = quoteOp(op, textLen)
    setState((s) => {
      const deducted = Math.min(cost, s.balance)
      if (deducted <= 0) return s
      return {
        balance: s.balance - deducted,
        ledger: [
          {
            id: `sp-${Date.now()}`,
            kind: "spend",
            op,
            credits: -deducted,
            tokens: estimateTokens(op, textLen),
            at: Date.now(),
          },
          ...s.ledger,
        ],
      }
    })
  }

  const recharge: WalletValue["recharge"] = async (pkg, method) => {
    const order = await billingApi.createRecharge(pkg)
    const { ok } = await billingApi.confirmPayment(order.orderId, method)
    if (!ok) return false
    setState((s) => ({
      balance: s.balance + order.credits,
      ledger: [
        {
          id: order.orderId,
          kind: "recharge",
          credits: order.credits,
          method,
          at: Date.now(),
        },
        ...s.ledger,
      ],
    }))
    return true
  }

  return (
    <WalletContext.Provider
      value={{
        balance: state.balance,
        ledger: state.ledger,
        quote,
        canAfford,
        charge,
        chargeBestEffort,
        recharge,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const v = useContext(WalletContext)
  if (!v) throw new Error("useWallet 必须在 WalletProvider 内使用")
  return v
}
