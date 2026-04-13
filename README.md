# Report Ideas

Лайки отчётов теперь хранятся в Postgres-базе, подключённой через Vercel Storage, через serverless API [api/report-likes.js](api/report-likes.js).

## Настройка Vercel Database

1. В Vercel откройте проект и добавьте Postgres storage или Neon integration из Marketplace.
2. После подключения Vercel обычно создаёт переменную `DATABASE_URL` автоматически.
3. Для локальной разработки создайте файл `.env` по образцу из [.env.example](.env.example).
4. Если переменная не появилась автоматически, добавьте её вручную в Project Settings -> Environment Variables.

Обязательная переменная:

- `DATABASE_URL`

Совместимость:

- `POSTGRES_URL` тоже поддерживается как fallback

## Локальный запуск

```bash
npm install
npm run dev
```

Если база Vercel не настроена, API лайков вернёт `503`, а интерфейс покажет, что голосование временно недоступно вместо локального несинхронизированного fallback.