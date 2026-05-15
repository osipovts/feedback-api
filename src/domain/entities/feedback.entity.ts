export class FeedbackEntity {
  constructor(
    public readonly id: string,
    public name: string,
    public contact: string,
    public message: string,
    public readonly createdAt: Date,
  ) {}
}
