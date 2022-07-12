export class MessageSendRequest {
  constructor(
    public body: string,
    public threadId: string,
    public receiptId: string
  ) {}
}
