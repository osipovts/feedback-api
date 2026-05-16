# Feedback API

NestJS приложение для обработки обратной связи с отправкой в Telegram.

## Особенности

- Clean Architecture + DDD подход
- Интеграция с Telegram API
- Защита: throttling, CORS, Helmet, reCAPTCHA v3, CSRF
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
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
TELEGRAM_CHAT_ID=your_telegram_chat_id_here

# Security Configuration
THROTTLE_TTL=60
THROTTLE_LIMIT=5
ALLOWED_ORIGINS=http://localhost:3000,http://mysite.com

# Google reCAPTCHA credentials
RECAPTCHA_SITE_KEY=your_recaptcha_site_key_here
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key_here
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

### Настройка reCAPTCHA

1. Зарегистрируйте сайт в [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin/create)
2. Получите Site Key и Secret Key
3. Добавьте ключи в `.env` файл:

```env
RECAPTCHA_SITE_KEY=your_recaptcha_site_key_here
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key_here
```

#### Реализация на React/Vue фронтенде

**Установка библиотеки:**

```bash
# Для React
npm install react-google-recaptcha-v3

# Для Vue
npm install @vue/recaptcha
```

**Пример для React:**

```jsx
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

const FeedbackForm = () => {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    message: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!executeRecaptcha) {
      alert('reCAPTCHA не загружена');
      return;
    }

    try {
      // Получаем reCAPTCHA токен
      const token = await executeRecaptcha('submit');

      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': getCsrfToken(), // функция для получения CSRF токена
        },
        body: JSON.stringify({
          ...formData,
          recaptchaToken: token,
        }),
      });

      if (response.ok) {
        alert('Форма успешно отправлена!');
        setFormData({ name: '', contact: '', message: '' });
      } else {
        const error = await response.json();
        alert(`Ошибка: ${error.error}`);
      }
    } catch (error) {
      console.error('Ошибка отправки:', error);
      alert('Произошла ошибка при отправке формы');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Имя"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
      />
      <input
        type="text"
        placeholder="Контакт"
        value={formData.contact}
        onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
        required
      />
      <textarea
        placeholder="Сообщение"
        value={formData.message}
        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
        required
      />
      <button type="submit">Отправить</button>
    </form>
  );
};
```

**Пример для Vue 3:**

```vue
<template>
  <form @submit.prevent="submitForm">
    <input v-model="formData.name" type="text" placeholder="Имя" required />
    <input
      v-model="formData.contact"
      type="text"
      placeholder="Контакт"
      required
    />
    <textarea v-model="formData.message" placeholder="Сообщение" required />
    <button type="submit">Отправить</button>
  </form>
</template>

<script setup>
import { ref } from 'vue';
import { useGoogleRecaptcha } from 'vue-recaptcha';

const { executeRecaptcha } = useGoogleRecaptcha({
  siteKey: import.meta.env.VITE_RECAPTCHA_SITE_KEY,
});

const formData = ref({
  name: '',
  contact: '',
  message: '',
});

const submitForm = async () => {
  if (!executeRecaptcha) {
    alert('reCAPTCHA не загружена');
    return;
  }

  try {
    const token = await executeRecaptcha('submit');

    const response = await fetch('/api/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': getCsrfToken(),
      },
      body: JSON.stringify({
        ...formData.value,
        recaptchaToken: token,
      }),
    });

    if (response.ok) {
      alert('Форма успешно отправлена!');
      formData.value = { name: '', contact: '', message: '' };
    } else {
      const error = await response.json();
      alert(`Ошибка: ${error.error}`);
    }
  } catch (error) {
    console.error('Ошибка отправки:', error);
    alert('Произошла ошибка при отправке формы');
  }
};
</script>
```

### Обработка ошибок на фронтенде

```javascript
const handleResponse = async (response) => {
  if (response.status === 429) {
    alert('Слишком много запросов. Пожалуйста, попробуйте позже.');
  } else if (response.status === 403) {
    if (response.error === 'Invalid CSRF token') {
      alert('Ошибка CSRF. Обновите страницу и попробуйте снова.');
    } else if (response.error === 'Invalid reCAPTCHA token') {
      alert('Пожалуйста, подтвердите что вы не робот.');
    }
  } else {
    const error = await response.json();
    alert(`Ошибка: ${error.error || 'Неизвестная ошибка'}`);
  }
};
```

### Настройка CSRF защиты

Для работы CSRF токенов добавьте в ваше приложение:

1. Создайте сервис для генерации CSRF токенов
2. Добавьте middleware для установки CSRF токена в cookies
3. Перед отправкой формы получайте CSRF токен и добавляйте в заголовок

```javascript
// Получение CSRF токена
async function getCsrfToken() {
  const response = await fetch('/api/csrf-token');
  const { token } = await response.json();
  return token;
}

// Использование при отправке формы
const csrfToken = await getCsrfToken();
fetch('/api/feedback', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken,
  },
  body: JSON.stringify(formData),
});
```

### Альтернативный подход с CORS

Если внешний фронтенд находится на другом домене, настройте CORS:

```env
ALLOWED_ORIGINS=http://your-frontend.com,http://localhost:3000
```

## Конфигурация

### Переменные окружения

| Переменная           | Описание                     | По умолчание          |
| -------------------- | ---------------------------- | --------------------- |
| PORT                 | Порт приложения              | 3000                  |
| NODE_ENV             | Режим работы                 | development           |
| TELEGRAM_BOT_TOKEN   | Токен Telegram бота          | -                     |
| TELEGRAM_CHAT_ID     | ID чата для отправки         | -                     |
| THROTTLE_TTL         | Время throttling (сек)       | 60                    |
| THROTTLE_LIMIT       | Лим запросов за TTL          | 5                     |
| RECAPTCHA_SITE_KEY   | Ключ reCAPTCHA для фронтенда | -                     |
| RECAPTCHA_SECRET_KEY | Ключ reCAPTCHA для бэкенда   | -                     |
| ALLOWED_ORIGINS      | Разрешенные источники CORS   | http://localhost:3000 |

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
