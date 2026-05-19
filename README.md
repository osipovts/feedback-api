# Feedback API

Бэкенд для обработки форм обратной связи с отправкой в Telegram.

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

#### Дев режим:

```bash
pnpm start:dev
```

#### Прод режим:

```bash
pnpm build
pnpm start:prod
```

#### Docker:

```bash
docker-compose up
```

## API

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

### CORS

Если внешний фронтенд находится на другом домене, настройте CORS:

```env
ALLOWED_ORIGINS=http://your-frontend.com,http://localhost:3000
```

### Интеграция с HTML/JS фронтендом

Для отправки формы с внешнего HTML/JS фронтенда необходимо выполнить следующие шаги:

#### 1. Получение CSRF токена

Сначала необходимо получить CSRF токен, который будет использоваться для защиты формы. Для этого отправьте GET запрос к эндпоинту `/api/csrf`:

```javascript
// Получение CSRF токена
async function getCsrfToken() {
  try {
    const response = await fetch('http://localhost:3000/api/csrf', {
      method: 'GET',
      credentials: 'include', // Важно! Для передачи cookies
    });

    if (!response.ok) {
      throw new Error('Failed to get CSRF token');
    }

    return response;
  } catch (error) {
    console.error('Error getting CSRF token:', error);
    throw error;
  }
}
```

#### 2. Отправка формы

После получения CSRF токена можно отправлять форму. Пример реализации:

```javascript
// Отправка формы обратной связи
async function submitFeedback(formData) {
  try {
    // Получаем CSRF токен
    await getCsrfToken();

    const response = await fetch('http://localhost:3000/api/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token':
          document.cookie
            .split('; ')
            .find((row) => row.startsWith('csrf_token='))
            ?.split('=')[1] || '',
      },
      credentials: 'include', // Важно! Для передачи cookies
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Feedback submitted:', result);
    return result;
  } catch (error) {
    console.error('Error submitting feedback:', error);
    throw error;
  }
}

// Пример использования
const feedbackForm = {
  name: 'Иван Иванов',
  contact: 'ivan@example.com',
  message: 'Тестовое сообщение',
  // Если используется reCAPTCHA
  recaptchaToken: 'your_recaptcha_token_here',
};

submitFeedback(feedbackForm)
  .then((result) => {
    // Обработка успешной отправки
    alert('Форма успешно отправлена!');
  })
  .catch((error) => {
    // Обработка ошибки
    alert('Ошибка при отправке формы: ' + error.message);
  });
```

#### 3. Настройка reCAPTCHA (если используется)

Если на форме используется reCAPTCHA, необходимо:

1. Добавить скрипт reCAPTCHA на страницу:

```html
<script src="https://www.google.com/recaptcha/api.js" async defer></script>
```

2. Добавить элемент reCAPTCHA:

```html
<div class="g-recaptcha" data-sitekey="your_recaptcha_site_key_here"></div>
```

3. Получить токен reCAPTCHA перед отправкой формы:

```javascript
function getRecaptchaToken() {
  return new Promise((resolve, reject) => {
    grecaptcha.ready(() => {
      grecaptcha
        .execute('your_recaptcha_site_key_here', { action: 'submit' })
        .then((token) => {
          resolve(token);
        })
        .catch((error) => {
          reject(error);
        });
    });
  });
}

// Использование при отправке формы
async function submitWithRecaptcha(formData) {
  try {
    const recaptchaToken = await getRecaptchaToken();
    formData.recaptchaToken = recaptchaToken;

    return await submitFeedback(formData);
  } catch (error) {
    console.error('reCAPTCHA error:', error);
    throw error;
  }
}
```

#### 4. Обработка ошибок

Важно корректно обрабатывать возможные ошибки:

```javascript
async function submitFeedback(formData) {
  try {
    await getCsrfToken();

    const response = await fetch('http://localhost:3000/api/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token':
          document.cookie
            .split('; ')
            .find((row) => row.startsWith('csrf_token='))
            ?.split('=')[1] || '',
      },
      credentials: 'include',
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || 'Произошла ошибка при отправке формы',
      );
    }

    return await response.json();
  } catch (error) {
    console.error('Submission error:', error);
    throw error;
  }
}
```
