export class Message {
  constructor(
    public messageId: number, // eventually we will have to include also string id's because its 64bit number and we only have 53bit at disposal in JS
    public threadId: string,
    public bucket: number,
    public authorId: string,
    public body: string,
    public read: boolean,
    public edited: boolean,
    public systemMessage: boolean
  ) { }
}
