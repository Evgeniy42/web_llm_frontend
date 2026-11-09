import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useAuth } from '../hooks/useAuth'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()

  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await register({ username: username.trim(), email: email.trim(), password })
      navigate('/chat')
    } catch (err) {
      setError(err.message || 'Не удалось зарегистрироваться. Попробуйте снова.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="app">
      <Header />
      <main className="auth">
        <div className="auth__card">
          <h1 className="auth__title">Регистрация</h1>
          <p className="auth__subtitle">Создайте аккаунт, чтобы начать общение с нейросетью</p>

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
              <span className="auth__label">Имя</span>
              <input
                className="auth__input"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Как к вам обращаться"
                autoComplete="name"
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
                placeholder="Придумайте пароль"
                autoComplete="new-password"
                required
              />
            </label>

            {error && <p className="auth__error">{error}</p>}

            <button type="submit" className="btn btn--primary auth__submit" disabled={isSubmitting}>
              {isSubmitting ? 'Создаём аккаунт…' : 'Зарегистрироваться'}
            </button>
          </form>

          <p className="auth__hint">
            Уже есть аккаунт?{' '}
            <Link className="auth__link" to="/login">
              Войти
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
