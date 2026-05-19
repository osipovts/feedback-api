import type { Request } from 'express';

export interface RecaptchaRequest extends Request {
  body: {
    recaptchaToken?: string;
    recaptchaVersion?: RecaptchaVersion;
    [key: string]: unknown;
  };
}

export type RecaptchaVersion = 'v2' | 'v3';
