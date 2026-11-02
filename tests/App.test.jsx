import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../src/App'

vi.mock('../src/services/chatService', () => ({
  sendMessage: vi.fn(),
}))

describe('App', () => {
  it('рендерит страницу чата на произвольном маршруте (редирект на /chat)', async () => {
    window.history.pushState({}, '', '/unknown-route')

    render(<App />)

    expect(window.location.pathname).toBe('/chat')
    expect(await screen.findByText('Чат с LLM')).toBeInTheDocument()
    expect(screen.getByText('Начните диалог — напишите первое сообщение')).toBeInTheDocument()
  })
})
