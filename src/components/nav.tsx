import {
  Coins,
  HeartHandshake,
  House,
  LogOut,
  Pill,
  Settings,
  Siren,
} from "lucide-react"
import { NavLink, useLocation, useNavigate } from "react-router-dom"

import { useAuth } from "@/auth/AuthContext"
import { DemoToggle } from "@/components/demo"
import { cn } from "@/lib/utils"
import { useWallet } from "@/state/wallet"

/** 顶栏：角色切换（照护者 / 患者）+ 演示态开关 + 已登录用户/退出 + 算力余额。 */
export function TopBar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { isAuthenticated, logout } = useAuth()
  const { balance } = useWallet()
  const isPatient = pathname.startsWith("/patient")

  return (
    <div className="mb-5 space-y-3">
      {isAuthenticated && (
        <div className="flex items-center justify-between px-1">
          <button
            onClick={() => navigate("/caregiver/wallet")}
            className="flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-sm font-bold text-cream shadow-soft"
          >
            <Coins className="h-4 w-4 text-sun" />
            {balance.toLocaleString()} 点
          </button>
          <button
            onClick={() => {
              logout()
              navigate("/login", { replace: true })
            }}
            className="flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 text-sm font-bold text-ink shadow-soft"
          >
            <LogOut className="h-4 w-4" />
            退出
          </button>
        </div>
      )}
      <div className="flex items-center gap-1 rounded-full bg-card p-1 shadow-soft">
        <RoleTab active={!isPatient} onClick={() => navigate("/caregiver")}>
          照护者
        </RoleTab>
        <RoleTab active={isPatient} onClick={() => navigate("/patient")}>
          患者
        </RoleTab>
      </div>
      <DemoToggle />
    </div>
  )
}

function RoleTab({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 rounded-full px-4 py-2 text-sm font-bold transition-colors",
        active ? "bg-ink text-cream" : "text-muted-foreground hover:text-ink"
      )}
    >
      {children}
    </button>
  )
}

const TABS = [
  { to: "/caregiver", label: "首页", icon: House, end: true },
  { to: "/caregiver/reminders", label: "提醒", icon: Pill, end: false },
  { to: "/caregiver/alerts", label: "告警", icon: Siren, end: false, badge: true },
  { to: "/caregiver/care", label: "陪伴", icon: HeartHandshake, end: false },
  { to: "/caregiver/settings", label: "设置", icon: Settings, end: false },
]

/** 照护者底部导航，贴在手机框底部。 */
export function BottomNav() {
  return (
    <nav className="sticky bottom-0 z-20 mt-auto border-t border-border/70 bg-card/95 px-2 py-2 backdrop-blur">
      <ul className="flex items-stretch justify-between">
        {TABS.map((t) => (
          <li key={t.to} className="flex-1">
            <NavLink
              to={t.to}
              end={t.end}
              className={({ isActive }) =>
                cn(
                  "relative flex flex-col items-center gap-1 rounded-2xl py-1.5 text-[0.66rem] font-semibold transition-colors",
                  isActive ? "text-ink" : "text-muted-foreground"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      "grid h-9 w-12 place-items-center rounded-full transition-colors",
                      isActive && "bg-secondary"
                    )}
                  >
                    <t.icon className="h-5 w-5" strokeWidth={2.2} />
                    {t.badge && (
                      <span className="absolute right-3 top-1 h-2 w-2 rounded-full bg-destructive" />
                    )}
                  </span>
                  {t.label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
