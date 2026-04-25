# Вперёд по маршрутам промышленности 🏭

Цифровая платформа для подбора рабочих мест и знакомства соискателей с промышленными предприятиями.

## Быстрый старт

### Требования
- Node.js 18+
- PostgreSQL 13+
- npm или yarn

### Установка и запуск

#### 1. Backend

```bash
cd backend
npm install

# Создайте БД (или используйте mock с SQLite для MVP)
# createdb vpered_db

npm start  # или npm run dev
```

**API доступен на:** `http://localhost:3000/api/v1`

#### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

**App доступен на:** `http://localhost:5173`

## Архитектура

### Backend (Node.js/Express)
- **Models:** User, UserProfile, Enterprise, Vacancy, Assessment, Tour, Application, Message
- **Services:** Auth, Profile, Assessment, Matching (с интеграцией внешнего API)
- **API:** REST с JWT auth
- **Database:** PostgreSQL + Sequelize ORM

### Frontend (React + Vite)
- **State Management:** Zustand
- **Styling:** TailwindCSS
- **Forms:** React Hook Form
- **Routing:** React Router v6

## API Контракты

### Authentication
- `POST /api/v1/auth/register` - регистрация
- `POST /api/v1/auth/login` - вход
- `POST /api/v1/auth/refresh-token` - обновление токена

### Profile
- `GET /api/v1/profile` - получить профиль
- `PATCH /api/v1/profile` - обновить профиль
- `POST /api/v1/profile/role` - установить роль

### Assessment
- `GET /api/v1/assessment/questions` - список вопросов
- `POST /api/v1/assessment/start` - начать анкету
- `POST /api/v1/assessment/{id}/answer` - ответить на вопрос
- `POST /api/v1/assessment/{id}/complete` - завершить анкету

### Recommendations
- `POST /api/v1/recommendations/generate` - сгенерировать рекомендации
- `GET /api/v1/recommendations` - получить рекомендации

## Интеграция с внешним сервисом оценки

Backend поддерживает интеграцию с внешним сервисом для улучшенного подбора:

**Запрос:**
```javascript
POST https://evaluation-service.example.com/api/v1/recommendations/evaluate

{
  "userId": "uuid",
  "userProfile": { /* профиль */ },
  "assessmentAnswers": [ /* ответы */ ],
  "enterpriseIds": [ /* id предприятий */ ],
  "vacancyIds": [ /* id вакансий */ ]
}
```

**Ответ:**
```javascript
{
  "recommendations": [
    {
      "enterpriseId": "uuid",
      "vacancyId": "uuid",
      "matchScore": 87,
      "explanation": "...",
      "factors": [ /* факторы */ ]
    }
  ]
}
```

**Fallback:** При недоступности внешнего API используется базовый алгоритм скоринга.

## Функционал MVP

✅ **Аутентификация**
- Регистрация по email/пароль
- Выбор роли (соискатель/студент)
- JWT токены

✅ **Профиль пользователя**
- Заполнение данных
- Управление предпочтениями
- Цифровой паспорт

✅ **Анкета и подбор**
- 6 вопросов о предпочтениях
- Базовый скоринг + опцион к внешнему API
- Рекомендации предприятий и вакансий

✅ **Каталоги**
- Предприятия (placeholder)
- Вакансии (placeholder)
- Экскурсии (placeholder)

✅ **Dashboard пользователя**
- Мой профиль
- Мои отклики
- Мои записи на экскурсии
- Сообщения
- Цифровой паспорт

## Дизайн

- **Color:** Светлый (#ffffff), строгий (#1a1a1a), акцент (#0066cc)
- **Typography:** Inter font
- **Components:** TailwindCSS
- **Responsive:** Mobile-first approach

## Тестовые данные (скоро)

```sql
-- Будут добавлены seed-данные:
-- 5 тестовых пользователей
-- 3 предприятия
-- 5 вакансий
-- 3 экскурсии
```

## Следующие шаги (phase 2)

- [ ] Каталог предприятий (полная реализация)
- [ ] Вакансии и экскурсии (полная реализация)
- [ ] HR-кабинет (управление вакансиями, заявками)
- [ ] Сообщения/чат
- [ ] Документы (инструкции, договоры)
- [ ] 3D-визуализация (интеграция)
- [ ] Аналитика
- [ ] Email-уведомления

## Структура файлов

```
backend/
├── src/
│   ├── config/          # Конфиги (env, database)
│   ├── models/          # Sequelize модели
│   ├── controllers/     # API контроллеры
│   ├── services/        # Бизнес-логика
│   ├── routes/          # API маршруты
│   ├── middleware/      # Auth, errors
│   └── app.js           # Express app
└── server.js            # Entry point

frontend/
├── src/
│   ├── components/      # React компоненты
│   ├── pages/           # Страницы
│   ├── services/        # API клиент
│   ├── store/           # Zustand stores
│   ├── styles/          # Глобальные стили
│   └── App.jsx          # Main component
└── tailwind.config.js   # TailwindCSS config
```

## Лицензия

MIT

---

**Статус:** MVP (в разработке)
**Версия:** 0.1.0
