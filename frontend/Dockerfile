# ---- Стадия сборки ----
FROM node:20-alpine AS build
WORKDIR /app

# Копируем файлы зависимостей
COPY package*.json ./
# Чистая установка зависимостей
RUN npm i

# Копируем исходники и собираем приложение
COPY . .
# Vite соберёт статику в папку /app/dist
RUN npm run build

# ---- Стадия production ----
FROM nginx:stable-alpine

# Копируем кастомный конфиг Nginx (см. ниже)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Копируем собранные файлы из временного образа
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]