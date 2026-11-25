import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { saveSession } from '../services/session'
import { getMe } from '../services/userService'

// Страница-приёмник редиректа от backend'а после входа через Keycloak.
// К этому моменту backend уже поставил HttpOnly-куки сессии:
// успех — /auth/callback без параметров, ошибка — /auth/callback#error=<urlencoded>.
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

      // Сразу убираем параметры из адресной строки, чтобы они не остались в истории
      window.history.replaceState(null, '', window.location.pathname)

      const errorParam = params.get('error')
      if (errorParam) {
        setError(errorParam)
        return
      }

      try {
        // Куки уже выставлены backend'ом — запрашиваем профиль по сессии
        const profile = await getMe()
        saveSession(profile)
        navigate('/chat', { replace: true })
      } catch {
        setError('Не удалось завершить вход')
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
              <p className="auth__subtitle">Проверяем данные вашего аккаунта</p>
              <div className="auth__spinner" aria-hidden="true" />
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
