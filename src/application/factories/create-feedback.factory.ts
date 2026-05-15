import { randomUUID } from 'crypto';
import { FeedbackEntity } from '../../domain/entities/feedback.entity';

export type CreateFeedbackData = Pick<
  FeedbackEntity,
  'name' | 'contact' | 'message'
>;

export function feedbackFactory({
  name,
  contact,
  message,
}: CreateFeedbackData): FeedbackEntity {
  return new FeedbackEntity(randomUUID(), name, contact, message, new Date());
}
