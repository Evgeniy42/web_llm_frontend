import { useEffect, useSyncExternalStore } from 'react'
import {
  login as loginRequest,
  register as registerRequest,
  logout as logoutRequest,
} from '../services/userService'
import {
  subscribeSession,
  getSessionSnapshot,
  isSessionActive,
  hasRole,
  ROLE_VIP_USER,
  saveSession,
  clearSession,
} from '../services/session'

export function useAuth() {
  const session = useSyncExternalStore(subscribeSession, getSessionSnapshot)
  const isAuthenticated = isSessionActive(session)
  // Роль зашита в JWT снимком на момент входа: после оформления подписки
  // она появится здесь только после повторного входа
  const hasSubscription = isAuthenticated && hasRole(ROLE_VIP_USER, session)

  // Автоматический выход, когда истекает access-токен
  useEffect(() => {
    if (!session) return undefined

    const msUntilExpiry = session.expiresAt - Date.now()
    if (msUntilExpiry <= 0) {
      clearSession()
      return undefined
    }

    const timer = setTimeout(clearSession, msUntilExpiry)
    return () => clearTimeout(timer)
  }, [session])

  const login = async ({ email, password }) => {
    const auth = await loginRequest({ email, password })
    return saveSession(auth).user
  }

  const register = async ({ username, email, password }) => {
    const auth = await registerRequest({ username, email, password })
    return saveSession(auth).user
  }

  const logout = async () => {
    const refreshToken = getSessionSnapshot()?.refreshToken

    // Локальную сессию завершаем в любом случае,
    // даже если серверный logout недоступен
    try {
      if (refreshToken) {
        await logoutRequest(refreshToken)
      }
    } catch {
      // игнорируем ошибки сети/сервера при выходе
    } finally {
      clearSession()
    }
  }

  return {
    user: isAuthenticated ? session.user : null,
    isAuthenticated,
    hasSubscription,
    login,
    register,
    logout,
  }
}
