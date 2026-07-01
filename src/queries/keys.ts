// query-key 工厂：集中管理缓存键，避免散落字符串。
export const qk = {
  dashboard: ["dashboard"] as const,
  reminders: ["reminders"] as const,
  alerts: ["alerts"] as const,
  memoryCards: ["memory-cards"] as const,
  voices: ["voices"] as const,
  conversations: ["conversations"] as const,
  settings: ["settings"] as const,
  patientHome: ["patient", "home"] as const,
  patientTalk: (voiceId: string) => ["patient", "talk", voiceId] as const,
}
