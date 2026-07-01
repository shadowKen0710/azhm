import { useState, type FormEvent } from "react"
import { HeartHandshake, MonitorSmartphone } from "lucide-react"
import { Link, useLocation, useNavigate } from "react-router-dom"

import { useAuth } from "@/auth/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? "/caregiver"

  const [name, setName] = useState("李阿姨")

  function submit(e: FormEvent) {
    e.preventDefault()
    login({ name: name.trim() || "照护者", role: "caregiver", relation: "女儿" })
    navigate(from, { replace: true })
  }

  return (
    <main className="grid min-h-screen place-items-center bg-background px-4 py-8">
      <div className="w-full max-w-[400px] rounded-[36px] bg-card p-8 shadow-phone">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-sun text-ink">
            <HeartHandshake className="h-7 w-7" strokeWidth={2.2} />
          </span>
          <div>
            <p className="font-display text-2xl font-extrabold text-ink">守护</p>
            <p className="text-sm font-medium text-muted-foreground">
              照护者登录
            </p>
          </div>
        </div>

        <form onSubmit={submit} className="mt-8 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-ink">账号</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="姓名或手机号"
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-ink">密码</label>
            <Input type="password" defaultValue="demo" placeholder="密码" />
          </div>

          <Button type="submit" size="lg" className="w-full">
            登录
          </Button>
        </form>

        <p className="mt-3 text-center text-xs text-muted-foreground">
          演示 · 任意信息可直接登录（数据为假数据）
        </p>

        <div className="mt-6 border-t border-border pt-5">
          <Link
            to="/patient"
            className="flex items-center justify-center gap-2 rounded-full bg-secondary py-3 text-sm font-bold text-ink transition-transform active:scale-[0.98]"
          >
            <MonitorSmartphone className="h-5 w-5" />
            以患者大屏进入（无需登录）
          </Link>
        </div>
      </div>
    </main>
  )
}
