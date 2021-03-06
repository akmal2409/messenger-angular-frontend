export class MessageEvent {
  constructor(
    public messageId: number,
    public threadId: string,
    public threadName: string,
    public threadPictureUrl: string,
    public threadPictureThumbnailUrl: string,
    public bucket: number,
    public authorId: string,
    public authorName: string,
    public body: string,
    public read: boolean,
    public edited: boolean,
    public systemMessage: boolean,
    public timestamp: Date
  ) {}
}
