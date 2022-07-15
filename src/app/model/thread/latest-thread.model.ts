import { UserDetails } from '../user/user-details.model';
import { AbstractThread } from './abstract-thread.model';

export class LatestThread extends AbstractThread {
  constructor(
    threadId: string,
    threadName: string,
    threadPictureThumbnailUrl: string,
    threadPictureUrl: string,
    public lastMessageId: number,
    public lastMessageAt: string,
    public lastMessage: string,
    public author: UserDetails,
    public memberIds: Set<string>,
    public read: boolean,
    public systemMessage: boolean,
    public groupThread: boolean,
    public lastSeenAt: Date // front end related only
  ) {
    super(threadId, threadName, threadPictureThumbnailUrl, threadPictureUrl);
  }
}
