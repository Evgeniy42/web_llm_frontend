import { useSyncExternalStore } from 'react'
import { logout as logoutRequest } from '../services/userService'
import {
  subscribeSession,
  getSessionSnapshot,
  isSessionActive,
  hasRole,
  ROLE_VIP_USER,
  ROLE_ADMIN,
  clearSession,
} from '../services/session'

export function useAuth() {
  const session = useSyncExternalStore(subscribeSession, getSessionSnapshot)
  const isAuthenticated = isSessionActive(session)
  // Роли приходят в ответе GET /user/me и сохраняются в профиле;
  // после оформления подписки роль vip_user появится здесь после повторного входа
  const hasSubscription = isAuthenticated && hasRole(ROLE_VIP_USER, session)
  // Роль admin: загрузка документов в векторную БД и прочие админ-функции
  const isAdmin = isAuthenticated && hasRole(ROLE_ADMIN, session)

  const logout = async () => {
    // Локальную сессию завершаем в любом случае,
    // даже если серверный logout недоступен
    try {
      await logoutRequest()
    } catch {
      // игнорируем ошибки сети/сервера при выходе
    } finally {
      clearSession()
    }
  }

  return {
    user: isAuthenticated ? session : null,
    isAuthenticated,
    hasSubscription,
    isAdmin,
    logout,
  }
}
