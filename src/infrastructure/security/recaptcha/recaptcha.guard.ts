import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { RecaptchaService } from '../recaptcha.service';
import { RecaptchaRequest } from './types/recaptcha-request.types';

@Injectable()
export class RecaptchaGuard implements CanActivate {
  constructor(private readonly recaptchaService: RecaptchaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RecaptchaRequest>();

    const token = request.body.recaptchaToken;

    await this.recaptchaService.verifyToken(token);

    return true;
  }
}
