import { createContext, useCallback, useContext, useState } from 'react'
import {
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  getStoredUser,
} from './api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // Восстанавливаем пользователя из localStorage при загрузке страницы.
  const [user, setUser] = useState(() => getStoredUser())

  const login = useCallback(async (email) => {
    const { user: loggedIn } = await apiLogin(email)
    setUser(loggedIn)
    return loggedIn
  }, [])

  const register = useCallback(async (values) => {
    const { user: created } = await apiRegister(values)
    setUser(created)
    return created
  }, [])

  const logout = useCallback(() => {
    apiLogout()
    setUser(null)
  }, [])

  const value = { user, login, register, logout }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth должен использоваться внутри <AuthProvider>')
  }
  return ctx
}
