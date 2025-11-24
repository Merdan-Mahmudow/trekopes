# 1. Сборка Vite-проекта
FROM node:22-alpine AS build

WORKDIR /app

# лучше сначала тянуть только package*, чтобы кэшировать deps
COPY package*.json ./
RUN npm ci

# теперь уже код
COPY . .

# прод-билд Vite
RUN npm run build

# 2. Лёгкий nginx для статики
FROM nginx:1.27-alpine

# свой конфиг вместо дефолтного
COPY nginx.conf /etc/nginx/conf.d/default.conf

# забираем собранный фронт
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]