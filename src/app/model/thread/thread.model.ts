import { UserDetails } from "../user/user-details.model";
import { AbstractThread } from "./abstract-thread.model";

export class Thread extends AbstractThread {
  constructor(
    threadId: string,
    threadName: string,
    threadPictureThumbnailUrl: string,
    threadPictureUrl: string,
    public groupThread: boolean,
    public members: Array<UserDetails>
  ) {
    super(
      threadId,
      threadName,
      threadPictureThumbnailUrl,
      threadPictureUrl
    );
  }
}
