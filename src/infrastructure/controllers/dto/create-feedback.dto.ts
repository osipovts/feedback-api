import { IsNotEmpty, IsString, Length } from 'class-validator';
import { type CreateFeedbackData } from '../../../application/factories/create-feedback.factory';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFeedbackDto implements CreateFeedbackData {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  name!: string;

  @ApiProperty()
  @IsNotEmpty()
  @Length(1, 200)
  contact!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Length(10, 1000)
  message!: string;
}
