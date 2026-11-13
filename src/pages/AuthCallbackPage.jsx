import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { saveSession } from '../services/session'

// Страница-приёмник OAuth-редиректа от backend'а (/auth/callback).
// Токены приходят во fragment: #access_token=...&refresh_token=...&expires_in=...
// либо ошибка: #error=<urlencoded сообщение>.
export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  // StrictMode монтирует эффект дважды — защищаемся от повторной обработки,
  // т.к. hash очищается уже при первом проходе
  const processedRef = useRef(false)

  useEffect(() => {
    if (processedRef.current) return
    processedRef.current = true

    async function handleCallback() {
      const params = new URLSearchParams(window.location.hash.slice(1))

      // Сразу убираем токены из адресной строки, чтобы они не остались в истории
      window.history.replaceState(null, '', window.location.pathname)

      const errorParam = params.get('error')
      if (errorParam) {
        setError(errorParam)
        return
      }

      const accessToken = params.get('access_token')
      if (!accessToken) {
        setError('Не удалось завершить вход через Google')
        return
      }

      try {
        // Сессия ещё не сохранена, поэтому api.get токен не подставит —
        // запрашиваем профиль напрямую с Bearer из параметров callback'а
        const response = await fetch('/api/v1/user/me', {
          headers: { Authorization: `Bearer ${accessToken}` },
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const profile = await response.json()

        saveSession({
          id: profile.id,
          username: profile.username,
          email: profile.email,
          access_token: accessToken,
          refresh_token: params.get('refresh_token'),
          token_type: params.get('token_type') || 'Bearer',
          expires_in: Number(params.get('expires_in')) || 0,
        })

        navigate('/chat', { replace: true })
      } catch {
        setError('Не удалось завершить вход через Google')
      }
    }

    handleCallback()
  }, [navigate])

  return (
    <div className="app">
      <Header />
      <main className="auth">
        <div className="auth__card">
          {error ? (
            <>
              <h1 className="auth__title">Ошибка входа</h1>
              <p className="auth__subtitle">{error}</p>
              <p className="auth__hint">
                <Link className="auth__link" to="/login">
                  Вернуться ко входу
                </Link>
              </p>
            </>
          ) : (
            <>
              <h1 className="auth__title">Завершаем вход…</h1>
              <p className="auth__subtitle">Проверяем данные вашего аккаунта Google</p>
              <div className="auth__spinner" aria-hidden="true" />
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
