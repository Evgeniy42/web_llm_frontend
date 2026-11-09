import { getAccessToken, clearSession } from './session'

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers }

  const token = getAccessToken()
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`/api/v1${path}`, {
    ...options,
    headers,
  })

  // Токен отклонён сервером — сессия недействительна
  if (response.status === 401 && token) {
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
    body: JSON.stringify(data),
  })
}
