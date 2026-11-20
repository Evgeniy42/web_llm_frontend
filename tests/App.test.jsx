import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../src/App'
import { saveSession, clearSession } from '../src/services/session'

vi.mock('../src/services/chatService', () => ({
  sendMessage: vi.fn(),
}))

describe('App', () => {
  afterEach(() => {
    clearSession()
  })

  it('редиректит произвольный маршрут на /chat и просит войти без авторизации', async () => {
    window.history.pushState({}, '', '/unknown-route')

    render(<App />)

    expect(window.location.pathname).toBe('/chat')
    expect(await screen.findByText('Чат с LLM')).toBeInTheDocument()
    expect(
      screen.getByText('Чтобы продолжить, нужно войти или зарегистрироваться'),
    ).toBeInTheDocument()
    expect(screen.queryByText('Начните диалог — напишите первое сообщение')).not.toBeInTheDocument()
  })

  it('показывает чат авторизованному пользователю', async () => {
    saveSession({
      id: 1,
      username: 'Ivan',
      email: 'ivan@mail.ru',
      roles: ['user'],
    })
    window.history.pushState({}, '', '/chat')

    render(<App />)

    expect(await screen.findByText('Начните диалог — напишите первое сообщение')).toBeInTheDocument()
    expect(
      screen.queryByText('Чтобы продолжить, нужно войти или зарегистрироваться'),
    ).not.toBeInTheDocument()
  })
})
