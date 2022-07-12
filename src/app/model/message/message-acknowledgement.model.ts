import { Message } from './message.model';

export class MessageAcknowledgement {
  constructor(
    public message: Message,
    public receiptId: string,
    public success: boolean
  ) {}
}
