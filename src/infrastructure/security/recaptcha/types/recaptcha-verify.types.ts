import { RecaptchaVersion } from './recaptcha-request.types';

export interface RecaptchaVerifyOptions {
  expectedAction?: string;
  minScore?: number;
  version: RecaptchaVersion;
}
