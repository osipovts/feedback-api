import { randomUUID } from 'crypto';
import { FeedbackEntity } from '../../domain/entities/feedback.entity';

export type CreateFeedbackData = Pick<
  FeedbackEntity,
  'name' | 'contact' | 'message'
> & {
  recaptchaToken?: string;
  recaptchaVersion?: string;
};

export function feedbackFactory({
  name,
  contact,
  message,
}: CreateFeedbackData): FeedbackEntity {
  return new FeedbackEntity(randomUUID(), name, contact, message, new Date());
}
