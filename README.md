# Платформа «Вперёд по маршрутам промышленности»

Веб-платформа для профориентации соискателей и студентов с использованием ИИ-тестирования и подбора вакансий на предприятиях промышленности.

---

## Технологический стек

### Frontend
- **Vue 3** — Composition API, `<script setup>`
- **TypeScript** — полная типизация
- **Vite 5** — сборка и dev-сервер
- **Vue Router 4** — маршрутизация с guards
- **Pinia** — управление состоянием (auth store)
- **Vuestic UI** — компонентная библиотека для админ-панели (таблицы, модалки, badges, селекты, вкладки)
- **Axios** — HTTP-клиент с перехватчиками для JWT
- **Three.js 0.160** — 3D-рендеринг (GLTFLoader, OrbitControls)
- **SCSS** — стили с единой дизайн-системой
- **Inter** — основной шрифт (Google Fonts + Cyrillic)

### Backend
- **Node.js 24** — серверная среда выполнения
- **Express 4** — HTTP-фреймворк
- **TypeScript** — полная типизация
- **tsx** — запуск TypeScript без предварительной компиляции
- **better-sqlite3** — SQLite БД с синхронным API
- **jsonwebtoken** — генерация и верификация JWT
- **express-validator** — валидация входящих запросов
- **multer** — загрузка файлов
- **pdfkit** — генерация PDF-документов (направления на экскурсию)
- **openai** — SDK для LLM (OpenAI-compatible + OpenRouter)

### База данных
- **SQLite 3** (via better-sqlite3) — встроенная серверная БД
- Файл: `server/data/app.db`
- Миграции и seed-данные выполняются автоматически при первом запуске
- WAL-режим для производительности

### Интеграции
- **LLM** — OpenAI-compatible провайдер или OpenRouter (подбор вакансий по ответам на тест)
- **Fallback-алгоритм** — многфакторный скоринг без LLM (5 факторов, до 100 баллов)

---

## Структура проекта

```
├── server/                              # Node.js бэкенд (Express + TypeScript)
│   ├── src/
│   │   ├── app.ts                       # Точка входа: Express, middleware, routes
│   │   ├── routes/
│   │   │   ├── index.ts                 # Роутер: подключение всех маршрутов
│   │   │   ├── authRouter.ts            # POST /auth/register, POST /auth/login
│   │   │   ├── userRouter.ts            # GET/PUT /users/profile
│   │   │   ├── enterpriseRouter.ts      # CRUD /enterprises
│   │   │   ├── vacancyRouter.ts         # CRUD /vacancies
│   │   │   ├── testRouter.ts            # Тесты: вопросы, отправка, результаты
│   │   │   ├── excursionRouter.ts       # Экскурсии: CRUD, регистрация, отписка, PDF
│   │   │   ├── fileRouter.ts            # Загрузка/скачивание/удаление файлов
│   │   │   └── adminRouter.ts           # Админ-панель: пользователи, цифровой паспорт
│   │   ├── middleware/
│   │   │   ├── auth.ts                  # JWT-аутентификация + проверка активности
│   │   │   └── errorHandler.ts          # Глобальная обработка ошибок
│   │   ├── services/
│   │   │   ├── jwtService.ts            # Генерация и верификация JWT
│   │   │   ├── llmService.ts            # Интеграция с LLM (OpenAI/OpenRouter)
│   │   │   ├── vacancyMatchingService.ts# ИИ-подбор вакансий + fallback-скоринг
│   │   │   └── pdfService.ts            # Генерация PDF (направление на экскурсию)
│   │   ├── stores/                      # In-code хранилища (SQLite DAO)
│   │   │   ├── userStore.ts             # Пользователи
│   │   │   ├── enterpriseStore.ts       # Предприятия
│   │   │   ├── vacancyStore.ts          # Вакансии
│   │   │   ├── excursionStore.ts        # Экскурсии + регистрации
│   │   │   ├── fileStore.ts             # Метаданные файлов
│   │   │   └── passportStore.ts         # Цифровой паспорт (тесты, рекомендации)
│   │   ├── database/
│   │   │   ├── index.ts                 # Инициализация SQLite, миграции, seed
│   │   │   └── schema.sql               # SQL-схема (для документации)
│   │   └── docs/
│   │       └── API.md                   # REST API документация
│   ├── fonts/                           # Шрифты для PDF (Inter Cyrillic, скачиваются автоматически)
│   ├── uploads/                         # Загруженные файлы
│   ├── data/                            # SQLite база данных (app.db)
│   ├── .env                             # Переменные окружения
│   ├── .env.example                     # Шаблон окружения
│   ├── package.json
│   └── tsconfig.json
│
├── client/                              # Vue 3 фронтенд
│   ├── src/
│   │   ├── main.ts                      # Точка входа: Vue, Pinia, Router, Vuestic
│   │   ├── App.vue                      # Корневой компонент с MainNav
│   │   ├── api/
│   │   │   └── index.ts                 # Axios-клиент с JWT перехватчиками
│   │   ├── stores/
│   │   │   └── auth.ts                  # Pinia store: авторизация, сессия
│   │   ├── router/
│   │   │   └── index.ts                 # Vue Router: маршруты + guards
│   │   ├── assets/
│   │   │   └── theme.scss               # Дизайн-система (цвета, шрифты, отступы)
│   │   ├── components/
│   │   │   ├── MainNav.vue              # Главное меню (sticky, адаптивное)
│   │   │   ├── Viewer3D.vue             # Three.js GLTF-плеер
│   │   │   └── admin/
│   │   │       ├── AdminEnterprises.vue  # CRUD предприятий
│   │   │       ├── AdminVacancies.vue    # CRUD вакансий
│   │   │       ├── AdminExcursions.vue   # Экскурсии + заявки (вкладки)
│   │   │       ├── AdminFiles.vue        # Загрузка файлов
│   │   │       └── AdminUsers.vue        # Пользователи + цифровой паспорт
│   │   └── views/
│   │       ├── HomeView.vue              # Лендинг
│   │       ├── AuthView.vue              # Регистрация / Вход
│   │       ├── TestView.vue              # Прохождение теста
│   │       ├── EnterprisesView.vue       # Каталог предприятий
│   │       ├── EnterpriseDetailsView.vue # Детали предприятия
│   │       ├── VacanciesView.vue         # Каталог вакансий с фильтрами
│   │       ├── VacancyDetailsView.vue    # Детали вакансии + 3D + экскурсии
│   │       ├── ExcursionsView.vue        # Каталог экскурсий + запись/отписка
│   │       ├── ProfileView.vue           # Профиль: рекомендации + записи
│   │       └── admin/
│   │           └── AdminLayoutView.vue   # Layout админки с табами
│   ├── public/
│   ├── index.html                        # HTML-шаблон + Material Icons
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── env.d.ts
│   └── .env.example
│
├── .gitignore
├── README.md
└── info.md                               # Техническое задание
```

---

## Быстрый старт

### Предварительные требования
- **Node.js** >= 18.x
- **npm** >= 9.x

### Запуск проекта

#### 1. Установка зависимостей

```bash
# Сервер
cd server
npm install

# Клиент
cd ../client
npm install
```

#### 2. Настройка окружения

```bash
# Сервер
cd server
copy .env.example .env
# Отредактируйте .env, указав LLM_API_KEY (если нужен ИИ-подбор)

# Клиент
cd ../client
copy .env.example .env
```

#### 3. Запуск

Откройте два терминала:

```bash
# Терминал 1 — сервер
cd server
npm run dev
# Сервер запустится на http://localhost:3000

# Терминал 2 — клиент
cd client
npm run dev
# Фронтенд запустится на http://localhost:5173
```

При первом запуске сервер автоматически:
- Создаст директорию `server/data/`
- Инициализирует SQLite БД (`app.db`)
- Заполнит seed-данными: 3 предприятия, 4 вакансии, 2 экскурсии, 5 вопросов теста
- Создаст аккаунт администратора

---

## Учётные записи

### Администратор (создаётся автоматически)
- **Email:** `admin@forward-industry.ru`
- **Роль:** `admin`
- **Доступ:** `http://localhost:5173/admin`

### Регистрация соискателя/студента
- **Страница:** `http://localhost:5173/register`
- Вход по email без пароля (MVP-режим)

---

## Основные маршруты

### Публичные
| Маршрут | Описание |
|---------|----------|
| `GET /` | Лендинг |
| `GET /enterprises` | Каталог предприятий |
| `GET /enterprises/:id` | Детали предприятия + вакансии |
| `GET /vacancies` | Каталог вакансий с фильтрами |
| `GET /vacancies/:id` | Детали вакансии (описание, 3D, экскурсии) |
| `GET /excursions` | Каталог экскурсий |

### Авторизованные
| Маршрут | Описание |
|---------|----------|
| `GET /test` | Пройти тест профориентации |
| `GET /profile` | Профиль: рекомендации, результаты, записи |
| `POST /excursions/:id/register` | Записаться на экскурсию |
| `DELETE /excursions/:id/register` | Отписаться от экскурсии |
| `GET /excursions/registrations/:id/referral` | Скачать PDF-направление |

### Администратор
| Маршрут | Описание |
|---------|----------|
| `GET /admin` | Админ-панель (табы: Предприятия, Вакансии, Экскурсии, Пользователи, Файлы) |

---

## API документация

Полная документация: [`server/docs/API.md`](./server/docs/API.md)

### Ключевые эндпоинты

**Аутентификация:**
- `POST /api/auth/register` — регистрация
- `POST /api/auth/login` — вход по email

**Тестирование:**
- `GET /api/tests/questions` — список вопросов
- `POST /api/tests/submit` — отправка ответов → ИИ-подбор вакансий
- `GET /api/tests/results` — результаты теста и рекомендации

**Администрирование:**
- `GET /api/admin/users` — список пользователей
- `GET /api/admin/users/:id` — полный цифровой паспорт
- `PUT /api/admin/users/:id/role` — смена роли
- `PUT /api/admin/users/:id/toggle-active` — блокировка
- `DELETE /api/admin/users/:id/passport` — очистка паспорта

---

## ИИ-подбор вакансий

### Как работает
1. Пользователь проходит тест (5 вопросов: интересы, переезд, здоровье, ЗП, тип работы)
2. Сервер формирует промпт и отправляет в LLM (если API-ключ настроен)
3. LLM возвращает JSON с `vacancyId`, `matchScore` (0-100), `reason`
4. Если LLM недоступен — используется **fallback-алгоритм** с многфакторным скорингом

### Fallback-скоринг (макс. 100 баллов)
| Фактор | Максимум |
|--------|----------|
| Совпадение интересов (ключевые слова) | 40 |
| Готовность к переезду | 15 |
| Ограничения по здоровью | 10 |
| Соответствие зарплатным ожиданиям | 25 |
| Совпадение типа работы | 10 |

### Настройка LLM (`.env`)
```env
# Вариант 1: OpenAI-compatible
LLM_PROVIDER=openai-compatible
LLM_API_KEY=sk-...
LLM_API_URL=https://api.openai.com/v1
LLM_MODEL=gpt-3.5-turbo

# Вариант 2: OpenRouter
LLM_PROVIDER=openrouter
OPENROUTER_API_KEY=sk-or-...
OPENROUTER_MODEL=openai/gpt-3.5-turbo
```

---

## Дизайн-система

- **Цвета:** синий `#2563eb` (акцент), тёмный `#0f172a` (текст), фон `#f8fafc`
- **Шрифт:** Inter (Google Fonts, поддержка Cyrillic)
- **Скругления:** 8–16px
- **Тени:** мягкие, 3 уровня
- **Компоненты:** Vuestic UI для админки, кастомные для публичных страниц

---

## Лицензия

MIT
