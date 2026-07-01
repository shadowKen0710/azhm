import { Outlet } from "react-router-dom"

import { BottomNav, TopBar } from "@/components/nav"
import { PhoneShell } from "@/components/PhoneShell"

/** 照护者控制台外壳：手机框 + 底部导航。 */
export function CaregiverLayout() {
  return (
    <main className="min-h-screen bg-background px-4 py-6">
      <div className="mx-auto max-w-[400px]">
        <TopBar />
        <PhoneShell bg="bg-cream">
          <Outlet />
          <BottomNav />
        </PhoneShell>
      </div>
    </main>
  )
}

/** 患者大屏外壳：横屏智能屏/电视形态，无操作即可被动接收来电。 */
export function PatientLayout() {
  return (
    <main className="min-h-screen bg-background px-4 py-6">
      <div className="mx-auto max-w-[960px]">
        <TopBar />
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[40px] bg-cream shadow-phone">
          <Outlet />
        </div>
      </div>
    </main>
  )
}
