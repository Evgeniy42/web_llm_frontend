import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import AuthCallbackPage from '../../src/pages/AuthCallbackPage'
import { getSessionSnapshot, clearSession } from '../../src/services/session'

const profile = {
  id: 1,
  username: 'Ivan',
  email: 'ivan@mail.ru',
  roles: ['user'],
}

function renderCallback() {
  return render(
    <MemoryRouter initialEntries={['/auth/callback']}>
      <Routes>
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/chat" element={<div>Страница чата</div>} />
        <Route path="/login" element={<div>Страница входа</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('AuthCallbackPage', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
    window.history.replaceState({}, '', '/auth/callback')
  })

  afterEach(() => {
    clearSession()
    localStorage.clear()
    vi.unstubAllGlobals()
    window.history.replaceState({}, '', '/')
  })

  it('при успехе запрашивает профиль по cookie-сессии, сохраняет его и ведёт на /chat', async () => {
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(profile),
    })

    renderCallback()

    expect(await screen.findByText('Страница чата')).toBeInTheDocument()
    expect(fetch).toHaveBeenCalledWith('/api/v1/user/me', {
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    })
    expect(getSessionSnapshot()).toEqual(profile)
  })

  it('при #error показывает сообщение из параметра и ссылку «Вернуться ко входу»', async () => {
    window.location.hash = `#error=${encodeURIComponent('Доступ запрещён')}`

    renderCallback()

    expect(await screen.findByText('Ошибка входа')).toBeInTheDocument()
    expect(screen.getByText('Доступ запрещён')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Вернуться ко входу' })).toHaveAttribute(
      'href',
      '/login',
    )
    expect(fetch).not.toHaveBeenCalled()
    expect(getSessionSnapshot()).toBeNull()
  })

  it('при отказе /me (не-200) показывает ошибку «Не удалось завершить вход»', async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ detail: 'Unauthorized' }),
    })

    renderCallback()

    expect(await screen.findByText('Ошибка входа')).toBeInTheDocument()
    expect(screen.getByText('Не удалось завершить вход')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Вернуться ко входу' })).toBeInTheDocument()
    expect(getSessionSnapshot()).toBeNull()
  })
})
