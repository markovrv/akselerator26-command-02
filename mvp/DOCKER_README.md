# Docker Compose Setup

Этот проект использует Docker Compose для запуска фронтенда и бэкенда.

## Требования

- Docker
- Docker Compose

## Структура

```
├── docker-compose.yml    # Основной файл оркестрации
├── backend/
│   ├── Dockerfile        # Конфигурация бэкенд контейнера
│   ├── .env.docker       # Переменные окружения для Docker
│   └── database.sqlite   # Файл базы данных SQLite (создаётся автоматически)
├── frontend/
│   ├── Dockerfile        # Конфигурация фронтенд контейнера
│   └── .env.docker       # Переменные окружения для Docker
```

## Порты

- **Фронтенд**: `http://localhost:25426`
- **Бэкенд API**: `http://localhost:25425/api/v1`

## Быстрый старт

1. **Сборка и запуск контейнеров:**

```bash
docker-compose up -d
```

2. **Остановка контейнеров:**

```bash
docker-compose down
```

3. **Просмотр логов:**

```bash
# Все сервисы
docker-compose logs -f

# Только бэкенд
docker-compose logs -f backend

# Только фронтенд
docker-compose logs -f frontend
```

4. **Пересборка контейнеров (после изменений в коде):**

```bash
docker-compose build
docker-compose up -d
```

## База данных

- База данных SQLite хранится в файле `backend/database.sqlite`
- Файл монтируется как volume, поэтому данные сохраняются между перезапусками контейнеров
- При первом запуске база данных автоматически инициализируется через Sequelize

## Переменные окружения

### Бэкенд (backend/.env.docker)

Основные настройки:
- `PORT=3000` - внутренний порт контейнера (внешний: 25425)
- `FRONTEND_URL=http://frontend:5173` - URL фронтенда (для CORS)
- `API_BASE_URL=http://localhost:3000/api/v1` - базовый URL API
- `JWT_SECRET` - секрет для JWT токенов (изменить в production!)

### Фронтенд (frontend/.env.docker)

- `VITE_API_URL=http://localhost:25425/api/v1` - URL API бэкенда
- `VITE_APP_NAME` - название приложения

## Разработка

### Бэкенд

Для разработки с hot-reload можно запустить бэкенд локально:
```bash
cd backend
npm install
npm run dev
```

### Фронтенд

Для разработки с hot-reload можно запустить фронтенд локально:
```bash
cd frontend
npm install
npm run dev
```

## Полезные команды

```bash
# Проверка статуса контейнеров
docker-compose ps

# Войти в контейнер (backend)
docker-compose exec backend sh

# Войти в контейнер (frontend)
docker-compose exec frontend sh

# Очистка: остановка и удаление volumes
docker-compose down -v

# Пересборка с очисткой кэша
docker-compose build --no-cache
```

## Примечания

1. **SQLite в Docker**: Файл базы данных хранится на хосте (`backend/database.sqlite`) и монтируется в контейнер. Это позволяет данным сохраняться между перезапусками.

2. **Сеть**: Контейнеры communicate через внутреннюю сеть `vpered-network`. Фронтенд обращается к бэкенду через `http://localhost:25425` (снаружи) или `http://backend:3000` (внутри сети Docker).

3. **Node.js версия**: Используется `node:24-alpine` (легковесный образ на Alpine Linux).

4. **Production**: Для production-развёртывания рекомендуется:
   - Использовать Nginx для фронтенда
   - Настроить корректные JWT секреты
   - Настроить SSL/TLS
   - Использовать отдельный образ для фронтенда (сборка через `npm run build` и serve через nginx)
