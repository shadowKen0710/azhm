// 各域数据 hooks（TanStack Query）。页面统一用这些，替代旧的 useResource。
// 底层仍调用 services（mock），日后替换为真实 API 时页面无需改动。
import { qk } from "@/queries/keys"
import { useAppQuery } from "@/queries/useAppQuery"
import { getAlerts } from "@/services/alerts"
import { getConversations } from "@/services/conversations"
import { getDashboard } from "@/services/dashboard"
import { getMemoryCards, getVoices } from "@/services/family"
import { getPatientHome, getPatientTalk } from "@/services/patient"
import { getReminders } from "@/services/reminders"
import { getSettings } from "@/services/settings"

export const useDashboard = () => useAppQuery(qk.dashboard, getDashboard)
export const useReminders = () => useAppQuery(qk.reminders, getReminders)
export const useAlerts = () => useAppQuery(qk.alerts, getAlerts)
export const useMemoryCards = () => useAppQuery(qk.memoryCards, getMemoryCards)
export const useVoices = () => useAppQuery(qk.voices, getVoices)
export const useConversations = () =>
  useAppQuery(qk.conversations, getConversations)
export const useSettings = () => useAppQuery(qk.settings, getSettings)
export const usePatientHome = () => useAppQuery(qk.patientHome, getPatientHome)
export const usePatientTalk = (voiceId: string) =>
  useAppQuery(qk.patientTalk(voiceId), getPatientTalk(voiceId))
