import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MessageNavigator from '../../src/components/MessageNavigator'

const messages = [
  { id: 1, text: 'Вопрос 1', sender: 'user' },
  { id: 2, text: 'Ответ 1', sender: 'bot' },
  { id: 3, text: 'Вопрос 2', sender: 'user' },
]

describe('MessageNavigator', () => {
  it('показывает заглушку, когда сообщений пользователя нет', () => {
    render(<MessageNavigator messages={[]} onNavigate={() => {}} />)

    expect(screen.getByText('Сообщений пока нет')).toBeInTheDocument()
  })

  it('показывает только сообщения пользователя с нумерацией', () => {
    render(<MessageNavigator messages={messages} onNavigate={() => {}} />)

    expect(screen.getByText('Вопрос 1')).toBeInTheDocument()
    expect(screen.getByText('Вопрос 2')).toBeInTheDocument()
    expect(screen.queryByText('Ответ 1')).not.toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('вызывает onNavigate с id сообщения при клике', async () => {
    const onNavigate = vi.fn()
    render(<MessageNavigator messages={messages} onNavigate={onNavigate} />)

    await userEvent.click(screen.getByText('Вопрос 2'))

    expect(onNavigate).toHaveBeenCalledWith(3)
  })
})
