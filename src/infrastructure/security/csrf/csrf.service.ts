import { Injectable } from '@nestjs/common';
import { randomBytes } from 'node:crypto';

@Injectable()
export class CsrfService {
  private readonly cookieName = 'csrf-token';
  private readonly tokenLength = 32;

  generateToken(): string {
    return randomBytes(this.tokenLength).toString('hex');
  }

  getCookieName(): string {
    return this.cookieName;
  }
}
