import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RecaptchaService } from './recaptcha.service';
import { RECAPTCHA_OPTIONS_KEY } from './recaptcha.decorator';
import { RecaptchaRequest } from './types/recaptcha-request.types';
import { RecaptchaVerifyOptions } from './types/recaptcha-verify.types';
@Injectable()
export class RecaptchaGuard implements CanActivate {
  constructor(
    private readonly recaptchaService: RecaptchaService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RecaptchaRequest>();

    const options = this.reflector.getAllAndOverride<RecaptchaVerifyOptions>(
      RECAPTCHA_OPTIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!options) {
      throw new ForbiddenException('reCAPTCHA options are not configured');
    }

    const token = request.body?.recaptchaToken;
    const version = request.body?.recaptchaVersion;

    if (!version) {
      throw new ForbiddenException('reCAPTCHA version missing');
    }

    if (version !== 'v2' && version !== 'v3') {
      throw new ForbiddenException('Invalid reCAPTCHA version');
    }

    await this.recaptchaService.verify(token ?? '', {
      ...options,
      version,
    });

    return true;
  }
}
