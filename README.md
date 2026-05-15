# Feedback API

NestJS приложение для обработки обратной связи с отправкой в Telegram.

## Особенности

- Clean Architecture + DDD подход
- Интеграция с Telegram API
- Защита: throttling, CORS, Helmet
- Валидация данных
- Docker-контейнеризация
- Swagger документация

## Быстрый старт

### Требования

- Node.js 18+
- pnpm
- Docker (опционально)

### Установка

1. Клонируйте репозиторий:

```bash
git clone <repository-url>
cd feedback
```

2. Установите зависимости:

```bash
pnpm install
```

3. Создайте `.env` файл:

```bash
cp .env.example .env
```

4. Настройте переменные окружения в `.env`:

```env
# Application Configuration
PORT=3000
NODE_ENV=development

# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=ваш_токен_бота
TELEGRAM_CHAT_ID=ваш_ID_чата

# Security Configuration
THROTTLE_TTL=60
THROTTLE_LIMIT=10
```

### Запуск

#### Реж разработки:

```bash
pnpm start:dev
```

#### Реж продакшена:

```bash
pnpm build
pnpm start:prod
```

#### Через Docker:

```bash
docker-compose up --build
```

## API Документация

После запуска приложение доступно по:

- API: http://localhost:3000/api
- Swagger: http://localhost:3000/api/docs

## Эндпоинты

### Health Check

```
GET /api/health
```

Проверка состояния приложения.

### Создание обратной связи

```
POST /api/feedback
```

**Пример запроса:**

```json
{
  "name": "Иван Иванов",
  "contact": "ivan@example.com",
  "message": "Тестовое сообщение"
}
```

**Пример ответа:**

```json
{
  "message": "Feedback submitted successfully",
  "data": {
    "id": "uuid",
    "name": "Иван Иванов",
    "contact": "ivan@example.com",
    "message": "Тестовое сообщение",
    "createdAt": "2024-01-01T12:00:00.000Z"
  }
}
```

## Интеграция с внешней формой

### Получение CSRF токена

Для защиты CSRF при отправке формы из внешнего HTML приложения:

1. Создайте эндпоинт для получения CSRF токена (пример):

```typescript
// В контроллере добавить
@Get('csrf-token')
getCsrfToken() {
  return { token: this.csrfTokenService.generate() };
}
```

2. Используйте CSRF токен в форме:

```html
<form id="feedbackForm">
  <input type="hidden" name="_csrf" id="csrfToken" />
  <input type="text" name="name" required />
  <input type="text" name="contact" required />
  <textarea name="message" required></textarea>
  <button type="submit">Отправить</button>
</form>

<script>
  async function getCsrfToken() {
    const response = await fetch('/api/feedback/csrf-token');
    const { token } = await response.json();
    document.getElementById('csrfToken').value = token;
  }

  await getCsrfToken();

  // Обработка отправки формы
  document
    .getElementById('feedbackForm')
    .addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData);

      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': document.getElementById('csrfToken').value,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      console.log('Response:', result);
    });
</script>
```

### Альтернативный подход с CORS

Если внешний фронтенд находится на другом домене, настройте CORS:

```env
ALLOWED_ORIGINS=http://your-frontend.com,http://localhost:3000
```

## Конфигурация

### Переменные окружения

| Переменная         | Описание                   | По умолчание          |
| ------------------ | -------------------------- | --------------------- |
| PORT               | Порт приложения            | 3000                  |
| NODE_ENV           | Режим работы               | development           |
| TELEGRAM_BOT_TOKEN | Токен Telegram бота        | -                     |
| TELEGRAM_CHAT_ID   | ID чата для отправки       | -                     |
| THROTTLE_TTL       | Время throttling (сек)     | 60                    |
| THROTTLE_LIMIT     | Лим запросов за TTL        | 10                    |
| ALLOWED_ORIGINS    | Разрешенные источники CORS | http://localhost:3000 |

### Настройка Telegram бота

1. Создайте бота через [@BotFather](https://t.me/BotFather)
2. Получите токен
3. Добавьте бота в целевой чат
4. Получите ID чата через [@userinfobot](https://t.me/userinfobot)

## Структура проекта

```
src/
├── application/          # Слой use cases
│   ├── dto/
│   └── use-cases/
├── common/              # Общие компоненты
│   ├── filters/
│   └── pipes/
├── config/              # Конфигурация
├── domain/              # Domain слой
│   ├── entities/
│   ├── exceptions/
│   ├── repositories/
│   └── services/
├── infrastructure/      # Infrastructure слой
│   ├── controllers/
│   ├── repositories/
│   └── telegram/
└── main.ts             # Точка входа
```

## Разработка

### Тестирование

```bash
# Unit тесты
pnpm test

# E2E тесты
pnpm test:e2e
```

### Линтинг

```bash
pnpm lint
```

### Форматирование

```bash
pnpm format
```

## Лицензия

MIT
