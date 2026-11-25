import { describe, it, expect, vi } from 'vitest'
import { post } from '../../src/services/api'
import { sendMessage } from '../../src/services/chatService'

vi.mock('../../src/services/api', () => ({
  post: vi.fn(),
  get: vi.fn(),
}))

describe('chatService', () => {
  it('sendMessage отправляет POST на /chat/send с текстом сообщения', async () => {
    post.mockResolvedValue({ response: 'ответ' })

    const result = await sendMessage('привет')

    expect(post).toHaveBeenCalledWith('/chat/send', { message: 'привет' })
    expect(result).toEqual({ response: 'ответ' })
  })
})
