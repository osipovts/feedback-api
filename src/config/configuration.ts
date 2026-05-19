export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN || '',
    chatId: process.env.TELEGRAM_CHAT_ID || '',
  },
  security: {
    throttleTtl: parseInt(process.env.THROTTLE_TTL || '60', 10),
    throttleLimit: parseInt(process.env.THROTTLE_LIMIT || '5', 10),
    recaptcha: {
      v2: {
        secretKey: process.env.RECAPTCHA_V2_SECRET_KEY,
      },
      v3: {
        secretKey: process.env.RECAPTCHA_V3_SECRET_KEY,
      },
      minScore: Number(process.env.RECAPTCHA_MIN_SCORE ?? 0.5),
      hostname: process.env.RECAPTCHA_HOSTNAME,
    },
    corsAllowedOrigins: process.env.ALLOWED_ORIGINS?.split(','),
  },
});
