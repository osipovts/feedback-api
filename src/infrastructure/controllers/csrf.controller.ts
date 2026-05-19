import { Controller, Get, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { CsrfService } from '../security/csrf.service';
import { ApiResponse } from '@nestjs/swagger';
import { GetCsrfDto } from './dto/get-csrf.dto';

interface RequestWithCookies extends Request {
  cookies: Record<string, string | undefined>;
}

@Controller()
export class CsrfController {
  constructor(private readonly csrfService: CsrfService) {}

  @Get('csrf')
  @ApiResponse({ type: () => GetCsrfDto })
  getCsrfToken(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const request = req as RequestWithCookies;
    const cookieName = this.csrfService.getCookieName();

    let token = request.cookies?.[cookieName];

    if (!token) {
      token = this.csrfService.generateToken();

      res.cookie(cookieName, token, {
        httpOnly: false,
        secure: true,
        sameSite: 'none',
        path: '/',
      });
    }

    return { csrfToken: token };
  }
}
