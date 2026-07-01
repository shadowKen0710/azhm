import { createContext, useContext, useState, type ReactNode } from "react"

// 鉴权骨架（POC）：mock token 持久化到 localStorage；日后替换为真实登录/JWT。
export type Role = "caregiver"

export interface AuthUser {
  name: string
  role: Role
  relation?: string
}

const KEY = "azhm.auth"

function load(): AuthUser | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as AuthUser) : null
  } catch {
    return null
  }
}

interface AuthValue {
  user: AuthUser | null
  isAuthenticated: boolean
  login: (user: AuthUser) => void
  logout: () => void
}

const AuthContext = createContext<AuthValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(load)

  const login = (u: AuthUser) => {
    localStorage.setItem(KEY, JSON.stringify(u))
    setUser(u)
  }
  const logout = () => {
    localStorage.removeItem(KEY)
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const v = useContext(AuthContext)
  if (!v) throw new Error("useAuth 必须在 AuthProvider 内使用")
  return v
}
