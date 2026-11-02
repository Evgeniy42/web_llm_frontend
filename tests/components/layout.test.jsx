import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Header from '../../src/components/Header'
import Footer from '../../src/components/Footer'

describe('Header', () => {
  it('показывает логотип и кнопки авторизации', () => {
    render(<Header />)

    expect(screen.getByText('Чат с LLM')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Вход' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Регистрация' })).toBeInTheDocument()
  })
})

describe('Footer', () => {
  it('показывает описание приложения', () => {
    render(<Footer />)

    expect(screen.getByText(/Приложение для чата с текстовой нейросетью/)).toBeInTheDocument()
  })
})
