// 路由路径常量，集中管理，避免散落字符串。
export const ROUTES = {
  login: "/login",
  caregiver: "/caregiver",
  reminders: "/caregiver/reminders",
  alerts: "/caregiver/alerts",
  care: "/caregiver/care",
  memoryCards: "/caregiver/memory-cards",
  voices: "/caregiver/voices",
  conversations: "/caregiver/conversations",
  memories: "/caregiver/memories",
  settings: "/caregiver/settings",
  patient: "/patient",
  patientTalk: (voiceId: string) => `/patient/talk/${voiceId}`,
  patientWho: "/patient/who",
} as const
