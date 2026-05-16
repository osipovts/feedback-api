import { Controller, Get } from '@nestjs/common';

/**
 * Just for csrf cookie setup:
 * await fetch('https://example.com/api/csrf', { credentials: 'include' });
 */
@Controller('csrf')
export class CsrfController {
  @Get()
  init(): { success: true } {
    return {
      success: true,
    };
  }
}
