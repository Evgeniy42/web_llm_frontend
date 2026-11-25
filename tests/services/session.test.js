import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  saveSession,
  clearSession,
  getSessionSnapshot,
  isSessionActive,
  subscribeSession,
  hasRole,
  ROLE_VIP_USER,
} from '../../src/services/session'

const profile = {
  id: 1,
  username: 'Тест',
  email: 'test@example.com',
  roles: ['user'],
}

describe('session', () => {
  beforeEach(() => {
    clearSession()
    localStorage.clear()
  })

  it('saveSession сохраняет профиль пользователя', () => {
    const session = saveSession(profile)

    expect(session).toEqual(profile)
    expect(getSessionSnapshot()).toEqual(profile)
  })

  it('сохраняет в localStorage только профиль, без токенов', () => {
    saveSession(profile)

    const raw = localStorage.getItem('web-llm:session')
    expect(raw).not.toBeNull()
    const stored = JSON.parse(raw)
    expect(stored).toEqual(profile)
    expect(stored).not.toHaveProperty('accessToken')
    expect(stored).not.toHaveProperty('refreshToken')
    expect(stored).not.toHaveProperty('expiresAt')
  })

  it('сессия активна, пока сохранён профиль (валидность проверяет сервер по куке)', () => {
    expect(isSessionActive()).toBe(false)

    saveSession(profile)

    expect(isSessionActive()).toBe(true)
  })

  it('clearSession удаляет сессию и уведомляет подписчиков', () => {
    saveSession(profile)
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

    saveSession(profile)

    expect(listener).toHaveBeenCalledTimes(1)

    unsubscribe()
  })

  it('hasRole читает роли из сохранённого профиля', () => {
    saveSession({ ...profile, roles: ['user', ROLE_VIP_USER] })

    expect(hasRole(ROLE_VIP_USER)).toBe(true)
    expect(hasRole('admin')).toBe(false)
  })

  it('без сессии ролей нет', () => {
    expect(hasRole(ROLE_VIP_USER)).toBe(false)
  })

  it('профиль без поля roles трактуется как отсутствие ролей', () => {
    saveSession({ id: 1, username: 'Тест', email: 'test@example.com' })

    expect(hasRole(ROLE_VIP_USER)).toBe(false)
    expect(getSessionSnapshot().roles).toEqual([])
  })
})
