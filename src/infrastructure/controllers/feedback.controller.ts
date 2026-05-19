import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiSecurity,
} from '@nestjs/swagger';
import { CreateFeedbackUseCase } from '../../application/use-cases/create-feedback.use-case';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { RecaptchaGuard } from '../security/recaptcha/recaptcha.guard';

@Controller('feedback')
@ApiTags('Feedback')
@ApiSecurity('csrf')
export class FeedbackController {
  constructor(private readonly createFeedbackUseCase: CreateFeedbackUseCase) {}

  @Post()
  @Throttle({})
  @UseGuards(RecaptchaGuard)
  @ApiOperation({ summary: 'Create new feedback' })
  @ApiBody({ type: () => CreateFeedbackDto })
  @ApiResponse({ status: 201, description: 'Feedback created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async create(@Body() data: CreateFeedbackDto) {
    await this.createFeedbackUseCase.execute(data);

    return { message: 'Feedback created', data };
  }
}
