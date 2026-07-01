import { Navigate, Route, Routes } from "react-router-dom"

import { CallProvider } from "@/components/call"
import { DemoProvider } from "@/components/demo"
import { CaregiverLayout, PatientLayout } from "@/layouts"
import { Dashboard } from "@/surfaces/caregiver/Dashboard"
import { Reminders } from "@/surfaces/caregiver/Reminders"
import { Alerts } from "@/surfaces/caregiver/Alerts"
import { CareHub } from "@/surfaces/caregiver/CareHub"
import { MemoryCards } from "@/surfaces/caregiver/MemoryCards"
import { Voices } from "@/surfaces/caregiver/Voices"
import { Conversations } from "@/surfaces/caregiver/Conversations"
import { Settings } from "@/surfaces/caregiver/Settings"
import { PatientHome } from "@/surfaces/patient/Home"
import { PatientTalk } from "@/surfaces/patient/Talk"
import { PatientWho } from "@/surfaces/patient/Who"

export default function App() {
  return (
    <DemoProvider>
      <CallProvider>
        <Routes>
        <Route path="/" element={<Navigate to="/caregiver" replace />} />

        <Route path="/caregiver" element={<CaregiverLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="reminders" element={<Reminders />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="care" element={<CareHub />} />
          <Route path="memory-cards" element={<MemoryCards />} />
          <Route path="voices" element={<Voices />} />
          <Route path="conversations" element={<Conversations />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="/patient" element={<PatientLayout />}>
          <Route index element={<PatientHome />} />
          <Route path="talk/:voiceId" element={<PatientTalk />} />
          <Route path="who" element={<PatientWho />} />
        </Route>

        <Route path="*" element={<Navigate to="/caregiver" replace />} />
        </Routes>
      </CallProvider>
    </DemoProvider>
  )
}
