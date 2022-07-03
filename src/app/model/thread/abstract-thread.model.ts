export abstract class AbstractThread {
  constructor(
    public threadId: string,
    public threadName: string,
    public threadPictureThumbnailUrl: string,
    public threadPictureUrl: string,
  ) { }
}
