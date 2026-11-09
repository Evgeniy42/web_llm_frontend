import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useAuth } from '../hooks/useAuth'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await login({ email: email.trim(), password })
      navigate('/chat')
    } catch (err) {
      setError(err.message || 'Не удалось войти. Проверьте данные и попробуйте снова.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="app">
      <Header />
      <main className="auth">
        <div className="auth__card">
          <h1 className="auth__title">Вход</h1>
          <p className="auth__subtitle">Войдите, чтобы продолжить диалог с нейросетью</p>

          <form className="auth__form" onSubmit={handleSubmit}>
            <label className="auth__field">
              <span className="auth__label">Email</span>
              <input
                className="auth__input"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </label>

            <label className="auth__field">
              <span className="auth__label">Пароль</span>
              <input
                className="auth__input"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Введите пароль"
                autoComplete="current-password"
                required
              />
            </label>

            {error && <p className="auth__error">{error}</p>}

            <button type="submit" className="btn btn--primary auth__submit" disabled={isSubmitting}>
              {isSubmitting ? 'Входим…' : 'Войти'}
            </button>
          </form>

          <p className="auth__hint">
            Нет аккаунта?{' '}
            <Link className="auth__link" to="/register">
              Зарегистрироваться
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
