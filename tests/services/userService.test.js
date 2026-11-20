import { describe, it, expect, vi } from 'vitest'
import { get, post } from '../../src/services/api'
import { getMe, logout, subscribe } from '../../src/services/userService'

vi.mock('../../src/services/api', () => ({
  post: vi.fn(),
  get: vi.fn(),
}))

describe('userService', () => {
  it('getMe отправляет GET на /user/me', async () => {
    get.mockResolvedValue({ id: 1, username: 'u', email: 'e@mail.ru', roles: ['user'] })

    await getMe()

    expect(get).toHaveBeenCalledWith('/user/me')
  })

  it('logout отправляет POST на /user/logout без тела', async () => {
    post.mockResolvedValue(null)

    await logout()

    expect(post).toHaveBeenCalledWith('/user/logout')
  })

  it('subscribe отправляет POST на /user/subscription', async () => {
    post.mockResolvedValue({ message: 'Подписка оформлена' })

    await subscribe()

    expect(post).toHaveBeenCalledWith('/user/subscription')
  })
})
