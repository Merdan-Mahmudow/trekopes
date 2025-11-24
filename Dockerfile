# 1. Сборка Vite-проекта
FROM node:22-alpine AS build

WORKDIR /app

ENV NODE_ENV=production

# лучше сначала тянуть только package*, чтобы кэшировать deps
COPY package*.json ./
RUN npm ci

# теперь уже код
COPY . .

# build-time envs для Vite (можно пробрасывать через docker build --build-arg)
ARG VITE_DEBUG=false
ENV VITE_DEBUG=${VITE_DEBUG}

# прод-билд Vite
RUN npm run build

# 2. Лёгкий nginx для статики
FROM nginx:1.27-alpine

ENV NODE_ENV=production

# свой конфиг вместо дефолтного
COPY nginx.conf /etc/nginx/conf.d/default.conf

# забираем собранный фронт
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --retries=5 \
  CMD wget -qO- http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]