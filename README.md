# Веб-приложения для чата с LLM-моделью

### Краткое описание
Fullstack-приложение для чата с LLM. Backend: сервис пользователя (регистрация, вход,
получение по ID) и минимальный сценарий чата (10 случайных ответов вместо LLM).
Frontend: React-приложение для веб-интерфейса чата.

### Стек
- CI/CD: Docker Compose
- Backend: FastAPI, SQLAlchemy 2.x, Pydantic 2.x, PostgreSQL 16
- Frontend: React 19, Vite, oxlint
- Migration: Flyway (выполняется при старте приложения)
- Тесты: pytest (unit + integration с настоящей PostgreSQL)

### Архитектура frontend (`frontend/web-llm/src`)
- `components/` — переиспользуемые React-компоненты
- `hooks/` — кастомные React-хуки
- `pages/` — страницы приложения
- `services/` — работа с API (запросы к backend)
- `utils/` — вспомогательные функции
- `assets/` — статические ресурсы (изображения, иконки)
- `App.jsx` — корневой компонент
- `main.jsx` — точка входа

### Сервисы
- UserService — регистрация, вход, получение пользователя
- ChatService — отправка сообщений (MockLLM с 10 случайными ответами)