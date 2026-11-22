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

function saveAuthSession(roles = []) {
  saveSession({
    id: 1,
    username: 'Ivan',
    email: 'ivan@mail.ru',
    roles,
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
  it('показывает логотип и ссылку входа', () => {
    renderHeader()

    expect(screen.getByText('RAG-система')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /RAG-система/ })).toHaveAttribute('href', '/chat')
    expect(screen.getByRole('link', { name: 'Вход' })).toHaveAttribute('href', '/login')
  })

  it('не показывает ссылки регистрации — регистрация происходит на странице Keycloak', () => {
    renderHeader()

    expect(screen.queryByRole('link', { name: 'Регистрация' })).not.toBeInTheDocument()
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

describe('Header (кнопка загрузки в БД)', () => {
  afterEach(() => {
    clearSession()
  })

  it('не показывает кнопку без авторизации', () => {
    renderHeader()

    expect(screen.queryByRole('link', { name: 'Загрузка данных в бд' })).not.toBeInTheDocument()
  })

  it('не показывает кнопку обычному пользователю', () => {
    saveAuthSession(['user', 'vip_user'])
    renderHeader()

    expect(screen.queryByRole('link', { name: 'Загрузка данных в бд' })).not.toBeInTheDocument()
  })

  it('показывает кнопку администратору рядом с логотипом', () => {
    saveAuthSession(['user', 'admin'])
    renderHeader()

    expect(screen.getByRole('link', { name: 'Загрузка данных в бд' })).toHaveAttribute(
      'href',
      '/rag-upload',
    )
  })
})

describe('Footer', () => {
  it('показывает описание приложения', () => {
    render(<Footer />)

    expect(screen.getByText(/Приложение для чата с текстовой нейросетью/)).toBeInTheDocument()
  })
})
