import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import { randomBytes, timingSafeEqual } from 'node:crypto';

type HttpMethod =
  | 'GET'
  | 'HEAD'
  | 'OPTIONS'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE';

interface CsrfMiddlewareOptions {
  cookieName?: string;
  headerName?: string;
  ignoredMethods?: readonly HttpMethod[];
  ignoredPaths?: readonly string[];
  tokenLength?: number;
  secureCookies?: boolean;
}

interface RequestWithCookies extends Request {
  cookies: Record<string, string | undefined>;
}

const DEFAULT_OPTIONS: Required<CsrfMiddlewareOptions> = {
  cookieName: 'csrf-token',
  headerName: 'x-csrf-token',
  ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
  ignoredPaths: [],
  tokenLength: 32,
  secureCookies: true,
};

@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  private readonly options: Required<CsrfMiddlewareOptions> = DEFAULT_OPTIONS;

  public use(req: Request, res: Response, next: NextFunction): void {
    const request = req as RequestWithCookies;

    if (this.shouldIgnore(request)) {
      this.ensureTokenExists(request, res);
      next();

      return;
    }

    const cookieToken = request.cookies[this.options.cookieName];
    const headerToken = this.extractHeaderToken(request);

    if (cookieToken === undefined || headerToken === undefined) {
      throw new ForbiddenException('CSRF token missing');
    }

    const isValid = this.compareTokens(cookieToken, headerToken);

    if (!isValid) {
      throw new ForbiddenException('Invalid CSRF token');
    }

    next();
  }

  private shouldIgnore(req: Request): boolean {
    const method = req.method.toUpperCase() as HttpMethod;

    if (this.options.ignoredMethods.includes(method)) {
      return true;
    }

    return this.options.ignoredPaths.some((path) => req.path.startsWith(path));
  }

  private ensureTokenExists(req: RequestWithCookies, res: Response): void {
    const existingToken = req.cookies[this.options.cookieName];

    if (existingToken !== undefined) {
      return;
    }

    const token = this.generateToken();

    res.cookie(this.options.cookieName, token, {
      httpOnly: false,
      secure: true,
      sameSite: 'none',
      path: '/',
    });
  }

  private extractHeaderToken(req: Request): string | undefined {
    const value = req.header(this.options.headerName);

    if (value === undefined || value.length === 0) {
      return undefined;
    }

    return value;
  }

  private generateToken(): string {
    return randomBytes(this.options.tokenLength).toString('hex');
  }

  private compareTokens(left: string, right: string): boolean {
    const leftBuffer = Buffer.from(left);
    const rightBuffer = Buffer.from(right);

    if (leftBuffer.length !== rightBuffer.length) {
      return false;
    }

    return timingSafeEqual(leftBuffer, rightBuffer);
  }
}
