#!/bin/sh
set -e

# Ждём, пока бекенд будет готов (для SQLite не нужно, но оставим на будущее)

# Запускаем миграции Sequelize
echo "Running database migrations..."
npx sequelize-cli db:migrate

# Опционально: загрузка тестовых данных только если таблицы пусты
# npx sequelize-cli db:seed:all

# Запускаем сервер
exec "$@"