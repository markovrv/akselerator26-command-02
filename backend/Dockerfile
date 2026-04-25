FROM node:20-alpine

# Устанавливаем системные зависимости (для sqlite3)
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Копируем package.json и устанавливаем зависимости
COPY package*.json ./
RUN npm i

# Копируем исходники приложения (кроме database.sqlite, чтобы не затереть, но сначала скопируем всё)
COPY . .

# Убедимся, что файл базы данных существует в исходниках, и скопируем его в нужное место
# Если в исходниках он лежит в корне backend/database.sqlite — он скопируется выше.
# Создаём папку для данных (на случай, если её нет)
RUN mkdir -p /app/data

# Копируем существующую базу данных из проекта в volume
COPY database.sqlite /app/data/database.sqlite

# Даём права на запись (чтобы приложение могло изменять БД)
RUN chmod 666 /app/data/database.sqlite

EXPOSE 3000

# Указываем переменную окружения для пути к БД
ENV DB_STORAGE=/app/data/database.sqlite

CMD ["node", "server.js"]