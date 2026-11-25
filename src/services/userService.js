import { post, get } from './api'

// Вход/регистрация происходят на стороне Keycloak:
// GET /user/login и GET /user/login/google — это full-page навигация (<a href>),
// а не fetch, поэтому здесь их нет.

// Профиль текущего пользователя по сессионной куке
export async function getMe() {
  return get('/user/me')
}

// Серверный logout сбрасывает HttpOnly-куки; тело запроса не нужно
export async function logout() {
  return post('/user/logout')
}

export async function subscribe() {
  return post('/user/subscription')
}
