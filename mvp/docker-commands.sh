#!/bin/bash
# Docker Compose команды для проекта "Вперёд по маршрутам промышленности"

# Сборка и запуск
docker-compose up -d

# Остановка
docker-compose down

# Остановка с удалением volumes (данные БД будут удалены!)
docker-compose down -v

# Просмотр логов
docker-compose logs -f

# Просмотр логов бэкенда
docker-compose logs -f backend

# Просмотр логов фронтенда
docker-compose logs -f frontend

# Пересборка
docker-compose build

# Пересборка с очисткой кэша
docker-compose build --no-cache

# Статус контейнеров
docker-compose ps

# Войти в контейнер бэкенда
docker-compose exec backend sh

# Войти в контейнер фронтенда
docker-compose exec frontend sh

# Перезапуск отдельных сервисов
docker-compose restart backend
docker-compose restart frontend

# Очистка неиспользуемых образов Docker
docker system prune -a
