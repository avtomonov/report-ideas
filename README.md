# Report Ideas

Лайки отчётов теперь хранятся в Upstash Redis через serverless API [api/report-likes.js](api/report-likes.js).

## Настройка Redis

1. Создайте Redis-базу в Upstash или подключите Redis integration в Vercel Marketplace.
2. Скопируйте значения REST URL и REST Token в переменные окружения.
3. Для локальной разработки создайте файл `.env` по образцу из [.env.example](.env.example).
4. Для Vercel добавьте те же переменные в Project Settings -> Environment Variables.

Обязательные переменные:

- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

## Локальный запуск

```bash
npm install
npm run dev
```

Если Redis не настроен, API лайков вернёт `503`, а интерфейс покажет, что голосование временно недоступно вместо локального несинхронизированного fallback.