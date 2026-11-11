import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Header from '../../src/components/Header'
import Footer from '../../src/components/Footer'
import { saveSession, clearSession } from '../../src/services/session'
import { subscribe } from '../../src/services/userService'

vi.mock('../../src/services/userService', () => ({
  subscribe: vi.fn(),
}))

// Собирает ненастоящий JWT с заданными realm-ролями (подпись не проверяется на клиенте)
function makeJwt(roles = []) {
  const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const payload = btoa(JSON.stringify({ sub: 'user-uuid', realm_access: { roles } }))
  return `${header}.${payload}.signature`
}

function saveAuthSession(roles = []) {
  saveSession({
    id: 1,
    username: 'Ivan',
    email: 'ivan@mail.ru',
    access_token: makeJwt(roles),
    refresh_token: 'refresh-token',
    expires_in: 3600,
  })
}

function renderHeader() {
  return render(
    <MemoryRouter>
      <Header />
    </MemoryRouter>,
  )
}

describe('Header', () => {
  it('показывает логотип и ссылки авторизации', () => {
    renderHeader()

    expect(screen.getByText('Чат с LLM')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Чат с LLM/ })).toHaveAttribute('href', '/chat')
    expect(screen.getByRole('link', { name: 'Вход' })).toHaveAttribute('href', '/login')
    expect(screen.getByRole('link', { name: 'Регистрация' })).toHaveAttribute('href', '/register')
  })

  it('не показывает кнопку подписки без авторизации', () => {
    renderHeader()

    expect(screen.queryByRole('button', { name: 'Получить подписку' })).not.toBeInTheDocument()
  })
})

describe('Header (авторизованный пользователь)', () => {
  afterEach(() => {
    clearSession()
    vi.clearAllMocks()
  })

  it('показывает кнопку «Получить подписку» пользователю без подписки', () => {
    saveAuthSession(['user'])
    renderHeader()

    expect(screen.getByRole('button', { name: 'Получить подписку' })).toBeInTheDocument()
    expect(screen.queryByText('Подписка подключена.')).not.toBeInTheDocument()
  })

  it('показывает «Подписка подключена.» вместо кнопки пользователю с ролью vip_user', () => {
    saveAuthSession(['user', 'vip_user'])
    renderHeader()

    expect(screen.getByText('Подписка подключена.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Получить подписку' })).not.toBeInTheDocument()
  })

  it('показывает окно с подтверждением после оформления подписки', async () => {
    saveAuthSession(['user'])
    subscribe.mockResolvedValue({ message: 'Подписка оформлена' })
    renderHeader()

    await userEvent.click(screen.getByRole('button', { name: 'Получить подписку' }))

    expect(subscribe).toHaveBeenCalledTimes(1)
    expect(await screen.findByText('Подписка оформлена')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Понятно' }))

    expect(screen.queryByText('Подписка оформлена')).not.toBeInTheDocument()
  })

  it('показывает окно с ошибкой, если запрос не удался', async () => {
    saveAuthSession(['user'])
    subscribe.mockRejectedValue(new Error('HTTP 500'))
    renderHeader()

    await userEvent.click(screen.getByRole('button', { name: 'Получить подписку' }))

    expect(await screen.findByText('HTTP 500')).toBeInTheDocument()
  })
})

describe('Footer', () => {
  it('показывает описание приложения', () => {
    render(<Footer />)

    expect(screen.getByText(/Приложение для чата с текстовой нейросетью/)).toBeInTheDocument()
  })
})
