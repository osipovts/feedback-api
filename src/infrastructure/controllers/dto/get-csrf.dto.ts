import { ApiProperty } from '@nestjs/swagger';

export class GetCsrfDto {
  @ApiProperty()
  csrfToken!: string;
}
