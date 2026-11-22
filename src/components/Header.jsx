import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { subscribe } from '../services/userService'

export default function Header() {
  const navigate = useNavigate()
  const { user, isAuthenticated, hasSubscription, isAdmin, logout } = useAuth()
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [subscriptionNotice, setSubscriptionNotice] = useState(null)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const handleSubscribe = async () => {
    setIsSubscribing(true)
    try {
      const response = await subscribe()
      setSubscriptionNotice({ type: 'success', text: response.message })
    } catch (error) {
      setSubscriptionNotice({
        type: 'error',
        text: error.message || 'Не удалось оформить подписку. Попробуйте позже.',
      })
    } finally {
      setIsSubscribing(false)
    }
  }

  return (
    <>
      <header className="header">
        <div className="header__left">
          <Link to="/chat" className="header__logo" aria-label="RAG-система — на главную">
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
            <span className="header__logo-text">RAG-система</span>
          </Link>
          {isAdmin && (
            <Link to="/rag-upload" className="btn btn--ghost header__nav-link">
              Загрузка данных в бд
            </Link>
          )}
        </div>
        {isAuthenticated ? (
          <div className="header__user">
            {hasSubscription ? (
              <span className="header__subscription">Подписка подключена.</span>
            ) : (
              <button
                type="button"
                className="btn btn--primary"
                onClick={handleSubscribe}
                disabled={isSubscribing}
              >
                {isSubscribing ? 'Оформляем…' : 'Получить подписку'}
              </button>
            )}
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
            <Link to="/login" className="btn btn--primary">
              Вход
            </Link>
          </div>
        )}
      </header>
      {subscriptionNotice && (
        <div className="subscription-modal__overlay" onClick={() => setSubscriptionNotice(null)}>
          <div
            className={`subscription-modal subscription-modal--${subscriptionNotice.type}`}
            role="dialog"
            aria-modal="true"
            aria-label="Оформление подписки"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="subscription-modal__text">{subscriptionNotice.text}</p>
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => setSubscriptionNotice(null)}
            >
              Понятно
            </button>
          </div>
        </div>
      )}
    </>
  )
}
