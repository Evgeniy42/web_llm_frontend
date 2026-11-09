const STORAGE_KEY = 'web-llm:session'

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed?.accessToken || !parsed?.user) return null
    return parsed
  } catch {
    return null
  }
}

let session = load()
const listeners = new Set()

function notify() {
  listeners.forEach((listener) => listener())
}

export function subscribeSession(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

// Снапшот без побочных эффектов — безопасен для useSyncExternalStore.
// Истечение токена проверяется в useAuth / getAccessToken.
export function getSessionSnapshot() {
  return session
}

export function isSessionActive(current = session) {
  return current !== null && current.expiresAt > Date.now()
}

export function getAccessToken() {
  if (!isSessionActive()) return null
  return session.accessToken
}

// Принимает UserAuthResponseDTO бэкенда и сохраняет сессию.
export function saveSession(auth) {
  session = {
    user: { id: auth.id, username: auth.username, email: auth.email },
    accessToken: auth.access_token,
    refreshToken: auth.refresh_token ?? null,
    expiresAt: Date.now() + auth.expires_in * 1000,
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  notify()
  return session
}

export function clearSession() {
  if (session === null) return
  session = null
  localStorage.removeItem(STORAGE_KEY)
  notify()
}
