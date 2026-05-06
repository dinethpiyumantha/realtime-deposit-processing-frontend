import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

interface AuthContextValue {
  apiKey: string | null
  isAuthenticated: boolean
  login: (key: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [apiKey, setApiKey] = useState<string | null>(() => localStorage.getItem('api_key'))

  useEffect(() => {
    if (apiKey) {
      localStorage.setItem('api_key', apiKey)
    } else {
      localStorage.removeItem('api_key')
    }
  }, [apiKey])

  const login = (key: string) => setApiKey(key)
  const logout = () => setApiKey(null)

  return (
    <AuthContext.Provider value={{ apiKey, isAuthenticated: !!apiKey, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
