import { post, get } from './api'

export async function register({ username, email, password }) {
  return post('/user/register', { username, email, password })
}

export async function login({ email, password }) {
  return post('/user/login', { email, password })
}

export async function getUserById(userId) {
  return get(`/user/${userId}`)
}

// Профиль текущего пользователя по Bearer из сохранённой сессии.
// Внимание: на странице /auth/callback эта функция НЕ используется —
// там сессии ещё нет, поэтому профиль запрашивается прямым fetch с токеном из hash
export async function getMe() {
  return get('/user/me')
}

export async function logout(refreshToken) {
  return post('/user/logout', { refresh_token: refreshToken })
}

export async function subscribe() {
  return post('/user/subscription')
}
