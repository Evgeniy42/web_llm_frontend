import { clearSession } from './session'

// Авторизация — по HttpOnly-куке, которую backend ставит после входа через Keycloak.
// Поэтому все запросы идут с credentials: 'include' и БЕЗ заголовка Authorization.
async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers }

  const response = await fetch(`/api/v1${path}`, {
    ...options,
    headers,
    credentials: 'include',
  })

  // Куки сессии недействительны — сбрасываем локальный профиль
  if (response.status === 401) {
    clearSession()
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    const error = new Error(body.detail || `HTTP ${response.status}`)
    error.status = response.status
    throw error
  }

  // 204 No Content — тела нет
  if (response.status === 204) {
    return null
  }

  return response.json()
}

export function get(path) {
  return request(path)
}

export function post(path, data) {
  return request(path, {
    method: 'POST',
    body: data === undefined ? undefined : JSON.stringify(data),
  })
}
