import { SetMetadata } from '@nestjs/common';
import { RecaptchaVerifyOptions } from './types/recaptcha-verify.types';

export const RECAPTCHA_OPTIONS_KEY = 'recaptcha_options';

export const Recaptcha = (options: RecaptchaVerifyOptions) =>
  SetMetadata(RECAPTCHA_OPTIONS_KEY, options);
