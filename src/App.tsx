import { lazy, Suspense } from "react"
import { Navigate, Route, Routes } from "react-router-dom"

import { AuthProvider } from "@/auth/AuthContext"
import { Login } from "@/auth/Login"
import { RequireAuth } from "@/auth/RequireAuth"
import { CallProvider } from "@/components/call"
import { DemoProvider } from "@/components/demo"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { Fallback } from "@/components/Fallback"
import { CaregiverLayout, PatientLayout } from "@/layouts"
import { NotFound } from "@/surfaces/NotFound"
import { MonitorProvider } from "@/state/monitor"

// 页面按路由懒加载（代码分割）。
const lazyPage = <T extends Record<string, React.ComponentType>>(
  loader: () => Promise<T>,
  name: keyof T
) => lazy(() => loader().then((m) => ({ default: m[name] })))

const Dashboard = lazyPage(
  () => import("@/surfaces/caregiver/Dashboard"),
  "Dashboard"
)
const Reminders = lazyPage(
  () => import("@/surfaces/caregiver/Reminders"),
  "Reminders"
)
const Alerts = lazyPage(() => import("@/surfaces/caregiver/Alerts"), "Alerts")
const CareHub = lazyPage(() => import("@/surfaces/caregiver/CareHub"), "CareHub")
const MemoryCards = lazyPage(
  () => import("@/surfaces/caregiver/MemoryCards"),
  "MemoryCards"
)
const Voices = lazyPage(() => import("@/surfaces/caregiver/Voices"), "Voices")
const Conversations = lazyPage(
  () => import("@/surfaces/caregiver/Conversations"),
  "Conversations"
)
const Settings = lazyPage(
  () => import("@/surfaces/caregiver/Settings"),
  "Settings"
)
const PatientHome = lazyPage(
  () => import("@/surfaces/patient/Home"),
  "PatientHome"
)
const PatientTalk = lazyPage(
  () => import("@/surfaces/patient/Talk"),
  "PatientTalk"
)
const PatientWho = lazyPage(() => import("@/surfaces/patient/Who"), "PatientWho")

export default function App() {
  return (
    <DemoProvider>
      <AuthProvider>
        <CallProvider>
          <MonitorProvider>
            <ErrorBoundary>
              <Suspense fallback={<Fallback />}>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route
                    path="/"
                    element={<Navigate to="/caregiver" replace />}
                  />

                  {/* 照护者控制台：受保护 */}
                  <Route
                    path="/caregiver"
                    element={
                      <RequireAuth>
                        <CaregiverLayout />
                      </RequireAuth>
                    }
                  >
                    <Route index element={<Dashboard />} />
                    <Route path="reminders" element={<Reminders />} />
                    <Route path="alerts" element={<Alerts />} />
                    <Route path="care" element={<CareHub />} />
                    <Route path="memory-cards" element={<MemoryCards />} />
                    <Route path="voices" element={<Voices />} />
                    <Route path="conversations" element={<Conversations />} />
                    <Route path="settings" element={<Settings />} />
                  </Route>

                  {/* 患者大屏：公开 kiosk */}
                  <Route path="/patient" element={<PatientLayout />}>
                    <Route index element={<PatientHome />} />
                    <Route path="talk/:voiceId" element={<PatientTalk />} />
                    <Route path="who" element={<PatientWho />} />
                  </Route>

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </MonitorProvider>
        </CallProvider>
      </AuthProvider>
    </DemoProvider>
  )
}
