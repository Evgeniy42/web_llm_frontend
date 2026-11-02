import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useChat } from '../../src/hooks/useChat'
import { sendMessage as sendMessageToApi } from '../../src/services/chatService'

vi.mock('../../src/services/chatService', () => ({
  sendMessage: vi.fn(),
}))

describe('useChat', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('создаёт стартовый чат и делает его активным', () => {
    const { result } = renderHook(() => useChat())

    expect(result.current.chats).toHaveLength(1)
    expect(result.current.chats[0].title).toBe('Новый чат')
    expect(result.current.activeChat).toEqual(result.current.chats[0])
    expect(result.current.isLoading).toBe(false)
  })

  it('sendMessage добавляет сообщение пользователя и ответ бота', async () => {
    sendMessageToApi.mockResolvedValue({ response: 'Ответ нейросети' })
    const { result } = renderHook(() => useChat())

    await act(async () => {
      await result.current.sendMessage('Привет')
    })

    const messages = result.current.activeChat.messages
    expect(messages).toHaveLength(2)
    expect(messages[0]).toMatchObject({ text: 'Привет', sender: 'user' })
    expect(messages[1]).toMatchObject({ text: 'Ответ нейросети', sender: 'bot' })
    expect(result.current.isLoading).toBe(false)
  })

  it('первое сообщение задаёт заголовок чата (не более 30 символов)', async () => {
    sendMessageToApi.mockResolvedValue({ response: 'ok' })
    const { result } = renderHook(() => useChat())
    const longText = 'А'.repeat(50)

    await act(async () => {
      await result.current.sendMessage(longText)
    })

    expect(result.current.activeChat.title).toBe('А'.repeat(30))
  })

  it('игнорирует пустое сообщение и не ходит в API', async () => {
    const { result } = renderHook(() => useChat())

    await act(async () => {
      await result.current.sendMessage('   ')
    })

    expect(sendMessageToApi).not.toHaveBeenCalled()
    expect(result.current.activeChat.messages).toHaveLength(0)
  })

  it('при ошибке API добавляет сообщение об ошибке и сбрасывает isLoading', async () => {
    sendMessageToApi.mockRejectedValue(new Error('сеть недоступна'))
    const { result } = renderHook(() => useChat())

    await act(async () => {
      await result.current.sendMessage('Привет')
    })

    const messages = result.current.activeChat.messages
    expect(messages).toHaveLength(2)
    expect(messages[1].sender).toBe('bot')
    expect(messages[1].text).toContain('Ошибка соединения')
    expect(result.current.isLoading).toBe(false)
  })

  it('createNewChat добавляет чат и переключается на него', () => {
    const { result } = renderHook(() => useChat())

    act(() => {
      result.current.createNewChat()
    })

    expect(result.current.chats).toHaveLength(2)
    expect(result.current.activeChatId).toBe(result.current.chats[1].id)
  })

  it('selectChat меняет активный чат', () => {
    const { result } = renderHook(() => useChat())
    const firstChatId = result.current.chats[0].id

    act(() => {
      result.current.createNewChat()
    })
    act(() => {
      result.current.selectChat(firstChatId)
    })

    expect(result.current.activeChatId).toBe(firstChatId)
  })

  it('сообщения пишутся только в активный чат', async () => {
    sendMessageToApi.mockResolvedValue({ response: 'ok' })
    const { result } = renderHook(() => useChat())

    act(() => {
      result.current.createNewChat()
    })
    await act(async () => {
      await result.current.sendMessage('Во второй чат')
    })

    expect(result.current.chats[0].messages).toHaveLength(0)
    expect(result.current.chats[1].messages).toHaveLength(2)
  })
})
