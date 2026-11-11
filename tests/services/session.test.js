import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  saveSession,
  clearSession,
  getSessionSnapshot,
  getAccessToken,
  isSessionActive,
  subscribeSession,
  getSessionRoles,
  hasRole,
  ROLE_VIP_USER,
} from '../../src/services/session'

// Собирает ненастоящий JWT с заданными realm-ролями (подпись не проверяется на клиенте)
function makeJwt(roles = []) {
  const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const payload = btoa(JSON.stringify({ sub: 'user-uuid', realm_access: { roles } }))
  return `${header}.${payload}.signature`
}

const authResponse = {
  id: 1,
  username: 'Тест',
  email: 'test@example.com',
  access_token: 'jwt-access-token',
  token_type: 'Bearer',
  expires_in: 3600,
  refresh_token: 'jwt-refresh-token',
}

describe('session', () => {
  beforeEach(() => {
    clearSession()
    localStorage.clear()
  })

  it('saveSession маппит UserAuthResponseDTO в сессию', () => {
    const session = saveSession(authResponse)

    expect(session.user).toEqual({ id: 1, username: 'Тест', email: 'test@example.com' })
    expect(session.accessToken).toBe('jwt-access-token')
    expect(session.refreshToken).toBe('jwt-refresh-token')
    expect(session.expiresAt).toBeGreaterThan(Date.now())
  })

  it('сохраняет сессию в localStorage', () => {
    saveSession(authResponse)

    const raw = localStorage.getItem('web-llm:session')
    expect(raw).not.toBeNull()
    expect(JSON.parse(raw).accessToken).toBe('jwt-access-token')
  })

  it('getAccessToken возвращает токен активной сессии', () => {
    saveSession(authResponse)

    expect(getAccessToken()).toBe('jwt-access-token')
    expect(isSessionActive()).toBe(true)
  })

  it('просроченная сессия считается неактивной, токен не выдаётся', () => {
    saveSession({ ...authResponse, expires_in: -1 })

    expect(isSessionActive()).toBe(false)
    expect(getAccessToken()).toBeNull()
  })

  it('clearSession удаляет сессию и уведомляет подписчиков', () => {
    saveSession(authResponse)
    const listener = vi.fn()
    const unsubscribe = subscribeSession(listener)

    clearSession()

    expect(getSessionSnapshot()).toBeNull()
    expect(localStorage.getItem('web-llm:session')).toBeNull()
    expect(listener).toHaveBeenCalledTimes(1)

    unsubscribe()
  })

  it('saveSession уведомляет подписчиков', () => {
    const listener = vi.fn()
    const unsubscribe = subscribeSession(listener)

    saveSession(authResponse)

    expect(listener).toHaveBeenCalledTimes(1)

    unsubscribe()
  })

  it('getSessionRoles извлекает роли из realm_access.roles JWT', () => {
    saveSession({ ...authResponse, access_token: makeJwt(['user', ROLE_VIP_USER]) })

    expect(getSessionRoles()).toEqual(['user', ROLE_VIP_USER])
    expect(hasRole(ROLE_VIP_USER)).toBe(true)
    expect(hasRole('admin')).toBe(false)
  })

  it('без сессии или с битым токеном ролей нет', () => {
    expect(getSessionRoles()).toEqual([])

    saveSession({ ...authResponse, access_token: 'not-a-jwt' })

    expect(getSessionRoles()).toEqual([])
    expect(hasRole(ROLE_VIP_USER)).toBe(false)
  })
})
