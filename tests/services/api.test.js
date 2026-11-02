import { describe, it, expect, vi, beforeEach } from 'vitest'
import { get, post } from '../../src/services/api'

const jsonResponse = (data, { ok = true, status = 200 } = {}) =>
  Promise.resolve({
    ok,
    status,
    json: () => Promise.resolve(data),
  })

describe('api', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('get отправляет запрос на относительный путь /api/v1', async () => {
    fetch.mockReturnValue(jsonResponse({ id: 1 }))

    const result = await get('/user/1')

    expect(fetch).toHaveBeenCalledWith('/api/v1/user/1', {
      headers: { 'Content-Type': 'application/json' },
    })
    expect(result).toEqual({ id: 1 })
  })

  it('post сериализует тело в JSON и выставляет метод POST', async () => {
    fetch.mockReturnValue(jsonResponse({ ok: true }))

    await post('/chat/send', { message: 'привет' })

    expect(fetch).toHaveBeenCalledWith('/api/v1/chat/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'привет' }),
    })
  })

  it('бросает ошибку с detail из тела ответа', async () => {
    fetch.mockReturnValue(jsonResponse({ detail: 'Не найдено' }, { ok: false, status: 404 }))

    const error = await get('/user/999').catch((e) => e)

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
})
