import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Header() {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    navigate('/chat')
  }

  return (
    <header className="header">
      <Link to="/chat" className="header__logo" aria-label="Чат с LLM — на главную">
        <svg
          className="header__logo-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <span className="header__logo-text">Чат с LLM</span>
      </Link>
      {isAuthenticated ? (
        <div className="header__user">
          <div className="header__user-avatar" aria-hidden="true">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div className="header__user-info">
            <span className="header__user-name">{user.username}</span>
            <span className="header__user-email">{user.email}</span>
          </div>
          <button type="button" className="btn btn--ghost" onClick={handleLogout}>
            Выход
          </button>
        </div>
      ) : (
        <div className="header__auth">
          <Link to="/login" className="btn btn--ghost">
            Вход
          </Link>
          <Link to="/register" className="btn btn--primary">
            Регистрация
          </Link>
        </div>
      )}
    </header>
  )
}
