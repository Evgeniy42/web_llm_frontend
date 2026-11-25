const STORAGE_KEY = 'web-llm:session'

// В localStorage хранится только профиль пользователя { id, username, email, roles }.
// Токены живут в HttpOnly-куках и фронтенду недоступны;
// реальную валидность сессии определяет сервер (при 401 от API вызывается clearSession).
function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed?.id) return null
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

// Снапшот без побочных эффектов — безопасен для useSyncExternalStore
export function getSessionSnapshot() {
  return session
}

// Локальный признак входа: наличие сохранённого профиля
export function isSessionActive(current = session) {
  return current !== null
}

// Realm-роль Keycloak пользователя с подпиской (приходит в ответе GET /user/me)
export const ROLE_VIP_USER = 'vip_user'

// Realm-роль Keycloak администратора: доступ к загрузке документов в векторную БД
export const ROLE_ADMIN = 'admin'

export function hasRole(role, current = session) {
  if (!isSessionActive(current)) return false
  return (current.roles ?? []).includes(role)
}

// Принимает профиль из GET /user/me и сохраняет сессию.
export function saveSession(profile) {
  session = {
    id: profile.id,
    username: profile.username,
    email: profile.email,
    roles: profile.roles ?? [],
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
