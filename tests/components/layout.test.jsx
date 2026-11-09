import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Header from '../../src/components/Header'
import Footer from '../../src/components/Footer'

describe('Header', () => {
  it('показывает логотип и ссылки авторизации', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    )

    expect(screen.getByText('Чат с LLM')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Чат с LLM/ })).toHaveAttribute('href', '/chat')
    expect(screen.getByRole('link', { name: 'Вход' })).toHaveAttribute('href', '/login')
    expect(screen.getByRole('link', { name: 'Регистрация' })).toHaveAttribute('href', '/register')
  })
})

describe('Footer', () => {
  it('показывает описание приложения', () => {
    render(<Footer />)

    expect(screen.getByText(/Приложение для чата с текстовой нейросетью/)).toBeInTheDocument()
  })
})
