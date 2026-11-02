import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Chat from '../../src/components/Chat'

const emptyChat = { id: 1, title: 'Чат', messages: [] }
const chatWithMessages = {
  id: 1,
  title: 'Чат',
  messages: [
    { id: 1, text: 'Привет', sender: 'user', timestamp: '2026-01-01T00:00:00Z' },
    { id: 2, text: 'Здравствуйте', sender: 'bot', timestamp: '2026-01-01T00:00:01Z' },
  ],
}

describe('Chat', () => {
  it('показывает заглушку, когда сообщений нет', () => {
    render(<Chat chat={emptyChat} onSendMessage={() => {}} isLoading={false} />)

    expect(screen.getByText('Начните диалог — напишите первое сообщение')).toBeInTheDocument()
  })

  it('рендерит сообщения с подписями отправителей', () => {
    render(<Chat chat={chatWithMessages} onSendMessage={() => {}} isLoading={false} />)

    expect(screen.getByText('Привет')).toBeInTheDocument()
    expect(screen.getByText('Здравствуйте')).toBeInTheDocument()
    expect(screen.getByText('Вы')).toBeInTheDocument()
    expect(screen.getByText('Нейросеть')).toBeInTheDocument()
  })

  it('отправляет сообщение и очищает поле ввода', async () => {
    const onSendMessage = vi.fn()
    render(<Chat chat={emptyChat} onSendMessage={onSendMessage} isLoading={false} />)

    const input = screen.getByPlaceholderText('Введите сообщение...')
    await userEvent.type(input, 'Тестовое сообщение{Enter}')

    expect(onSendMessage).toHaveBeenCalledWith('Тестовое сообщение')
    expect(input).toHaveValue('')
  })

  it('не отправляет сообщение, состоящее из пробелов', async () => {
    const onSendMessage = vi.fn()
    render(<Chat chat={emptyChat} onSendMessage={onSendMessage} isLoading={false} />)

    await userEvent.type(screen.getByPlaceholderText('Введите сообщение...'), '   {Enter}')

    expect(onSendMessage).not.toHaveBeenCalled()
  })

  it('блокирует ввод и кнопку во время загрузки', () => {
    render(<Chat chat={chatWithMessages} onSendMessage={() => {}} isLoading={true} />)

    expect(screen.getByPlaceholderText('Введите сообщение...')).toBeDisabled()
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
