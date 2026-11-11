import { describe, it, expect, vi } from 'vitest'
import { get, post } from '../../src/services/api'
import { register, login, getUserById, logout, subscribe } from '../../src/services/userService'

vi.mock('../../src/services/api', () => ({
  post: vi.fn(),
  get: vi.fn(),
}))

describe('userService', () => {
  it('register отправляет POST на /user/register', async () => {
    const data = { username: 'u', email: 'e@mail.ru', password: 'p' }
    post.mockResolvedValue({ id: 1 })

    await register(data)

    expect(post).toHaveBeenCalledWith('/user/register', data)
  })

  it('login отправляет POST на /user/login', async () => {
    const data = { email: 'e@mail.ru', password: 'p' }
    post.mockResolvedValue({ token: 't' })

    await login(data)

    expect(post).toHaveBeenCalledWith('/user/login', data)
  })

  it('getUserById отправляет GET на /user/:id', async () => {
    get.mockResolvedValue({ id: 42 })

    await getUserById(42)

    expect(get).toHaveBeenCalledWith('/user/42')
  })

  it('logout отправляет POST на /user/logout с refresh-токеном', async () => {
    post.mockResolvedValue(null)

    await logout('jwt-refresh-token')

    expect(post).toHaveBeenCalledWith('/user/logout', { refresh_token: 'jwt-refresh-token' })
  })

  it('subscribe отправляет POST на /user/subscription', async () => {
    post.mockResolvedValue({ message: 'Подписка оформлена' })

    await subscribe()

    expect(post).toHaveBeenCalledWith('/user/subscription')
  })
})
