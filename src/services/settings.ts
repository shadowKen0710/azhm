import { mockFetch } from "@/services/mockFetch"

export interface SettingsData {
  patient: {
    name: string
    age: string
    condition: string
    homeAddress: string
  }
  caregiver: {
    name: string
    relation: string
    phone: string
  }
  safeZone: string
}

const full: SettingsData = {
  patient: {
    name: "占位·张爷爷",
    age: "78 岁",
    condition: "阿兹海默症 · 中期",
    homeAddress: "占位地址 · 阳光小区 12 栋",
  },
  caregiver: {
    name: "占位·李阿姨",
    relation: "女儿",
    phone: "占位 · 138 **** 0000",
  },
  safeZone: "占位安全区 · 小区范围",
}

export const getSettings = mockFetch<SettingsData>(() => full)
