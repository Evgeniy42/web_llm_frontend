import { describe, it, expect, vi, beforeEach } from 'vitest'
import { get, post } from '../../src/services/api'
import { saveSession, clearSession, getSessionSnapshot } from '../../src/services/session'

const jsonResponse = (data, { ok = true, status = 200 } = {}) =>
  Promise.resolve({
    ok,
    status,
    json: () => Promise.resolve(data),
  })

const profile = {
  id: 1,
  username: 'Тест',
  email: 'test@example.com',
  roles: ['user'],
}

describe('api', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
    clearSession()
    localStorage.clear()
  })

  it('get отправляет запрос на относительный путь /api/v1 с cookie-сессией', async () => {
    fetch.mockReturnValue(jsonResponse(profile))

    const result = await get('/user/me')

    expect(fetch).toHaveBeenCalledWith('/api/v1/user/me', {
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    })
    expect(result).toEqual(profile)
  })

  it('post сериализует тело в JSON и выставляет метод POST', async () => {
    fetch.mockReturnValue(jsonResponse({ ok: true }))

    await post('/chat/send', { message: 'привет' })

    expect(fetch).toHaveBeenCalledWith('/api/v1/chat/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ message: 'привет' }),
    })
  })

  it('post без данных отправляет запрос без тела', async () => {
    fetch.mockReturnValue(
      Promise.resolve({
        ok: true,
        status: 204,
        json: () => Promise.reject(new Error('no body')),
      }),
    )

    const result = await post('/user/logout')

    expect(fetch).toHaveBeenCalledWith('/api/v1/user/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: undefined,
    })
    expect(result).toBeNull()
  })

  it('не добавляет заголовок Authorization — авторизация по HttpOnly-куке', async () => {
    saveSession(profile)
    fetch.mockReturnValue(jsonResponse(profile))

    await get('/user/me')

    const [, options] = fetch.mock.calls[0]
    expect(options.headers).not.toHaveProperty('Authorization')
  })

  it('бросает ошибку с detail из тела ответа', async () => {
    fetch.mockReturnValue(jsonResponse({ detail: 'Не найдено' }, { ok: false, status: 404 }))

    const error = await get('/user/me').catch((e) => e)

    expect(error).toBeInstanceOf(Error)
    expect(error.message).toBe('Не найдено')
    expect(error.status).toBe(404)
  })

  it('бросает ошибку с HTTP-статусом, если тело не JSON', async () => {
    fetch.mockReturnValue(
      Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.reject(new Error('not json')),
      }),
    )

    const error = await post('/chat/send', {}).catch((e) => e)

    expect(error.message).toBe('HTTP 500')
    expect(error.status).toBe(500)
  })

  it('сбрасывает сессию при ответе 401', async () => {
    saveSession(profile)
    fetch.mockReturnValue(jsonResponse({ detail: 'Unauthorized' }, { ok: false, status: 401 }))

    await get('/user/me').catch(() => {})

    expect(getSessionSnapshot()).toBeNull()
    expect(localStorage.getItem('web-llm:session')).toBeNull()
  })

  it('возвращает null для ответа 204 No Content', async () => {
    fetch.mockReturnValue(
      Promise.resolve({
        ok: true,
        status: 204,
        json: () => Promise.reject(new Error('no body')),
      }),
    )

    const result = await post('/user/logout')

    expect(result).toBeNull()
  })
})
