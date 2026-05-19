import { Request } from 'express';

interface HasRecaptchaToken {
  recaptchaToken: string;
}

export type RecaptchaRequest = Request<
  Record<string, never>,
  unknown,
  HasRecaptchaToken
>;
