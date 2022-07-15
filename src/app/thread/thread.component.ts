import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IMessage } from '@stomp/stompjs';
import {
  debounceTime,
  forkJoin,
  fromEvent,
  map,
  Subject,
  switchMap,
  take,
  takeUntil,
} from 'rxjs';
import { v4 as uuid } from 'uuid';
import { MessageAcknowledgement } from '../model/message/message-acknowledgement.model';
import { MessageSendRequest } from '../model/message/message-send-request.model';
import { Message } from '../model/message/message.model';
import { Thread } from '../model/thread/thread.model';
import { UserDetails } from '../model/user/user-details.model';
import { User } from '../model/user/user.model';
import { MessageEvent } from '../model/websocket/message-event.model';
import { AuthService } from '../service/auth.service';
import { MessageService } from '../service/message.service';
import { RxStompService } from '../service/rx-stomp.service';
import { ThreadEventType, ThreadService } from '../service/thread.service';
import { UserService } from '../service/user.service';

export interface UserDetailsWithPresence extends UserDetails {
  lastSeenAt?: Date;
}

@Component({
  selector: 'app-thread',
  template: `
    <div class="thread-header-container">
      <app-thread-header
        *ngIf="thread"
        [currentUserUid]="currentUser.uid"
        [groupThread]="thread.groupThread"
        [members]="thread.members"
        [memberMap]="memberMap"
        [threadName]="thread.threadName"
        [threadThumbnailUrl]="thread.threadPictureThumbnailUrl"
      ></app-thread-header>
    </div>
    <div class="message-list-container">
      <div class="message-list-scrollbar" #scrollRef>
        <app-message-list
          [hasMore]="hasMore"
          [loading]="loading"
          [messages]="messages"
          [showTyping]="showTyping"
          [pendingMessages]="pendingMessages"
          [memberMap]="memberMap"
          [currentUserId]="currentUser?.uid"
        ></app-message-list>
        <tui-loader [showLoader]="loading"></tui-loader>
      </div>
    </div>
    <div class="message-input-container">
      <app-message-input
        (onChange)="onMessageInput($event)"
        (onSend)="onSendMessage($event)"
      ></app-message-input>
    </div>
  `,
  styleUrls: ['./thread.component.scss'],
})
export class ThreadComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('scrollRef', { read: ElementRef })
  private scrollContainer?: ElementRef<HTMLElement>;

  constructor(
    private readonly messageService: MessageService,
    private readonly authService: AuthService,
    private readonly threadService: ThreadService,
    private readonly route: ActivatedRoute,
    private readonly rxStompService: RxStompService,
    private readonly userService: UserService
  ) {}

  messages: Array<Message> = [];
  pendingMessages: Array<MessageSendRequest> = [];
  currentUser!: User;
  loading = true;
  memberMap = new Map<string, UserDetailsWithPresence>();

  showTyping = false;

  typingTimeoutId: any;

  private readonly _destroy$ = new Subject<undefined>();
  private readonly onType = new Subject<string | null>();

  private readonly typing$ = this.onType
    .asObservable()
    .pipe(debounceTime(250), takeUntil(this._destroy$));

  private _pagingState: string | undefined;
  private _threadId!: string;
  thread!: Thread;

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        map((params) => {
          this.loading = true;
          return params.get('threadId');
        }),
        switchMap((threadId) => {
          this._threadId = threadId!;
          return this.authService.user$;
        }),
        take(1),
        switchMap((user) => {
          this.currentUser = user;
          return forkJoin([
            this.messageService
              .getMessagesByUserByThread(this.currentUser.uid, this._threadId)
              .pipe(
                map((messages) => {
                  const copy = { ...messages, content: [...messages.content] };
                  copy.content.reverse();
                  return copy;
                })
              ),
            this.threadService.getById(this._threadId, this.currentUser.uid),
          ]);
        })
      )
      .subscribe({
        next: ([scrollContent, thread]) => {
          this._pagingState = scrollContent.pagingState;
          this.messages = scrollContent.content;
          this.thread = thread;
          this.setupMemberMap();
          this.setupMessageListener();
          this.setupAckChannelListener();
          this.setupTypingListener();
          this.fetchUserPresences();
          this.setupUserPresenceEventListener();

          if (this.messages.length > 0) {
            // when reading messages we asynchronously update on the backend the status,
            // therefore, we have to update it in the sidebar.
            const lastMessageReadStatus =
              this.messages[this.messages.length - 1].read;
            this.threadService.publish({
              type: ThreadEventType.READ_STATUS,
              threadId: this._threadId,
              payload: lastMessageReadStatus,
            });
          }

          this.loading = false;
        },
      });
  }

  ngAfterViewInit(): void {
    this.setUpLazyLoadingScrollListener();
  }

  onMessageInput(body: string | null) {
    this.onType.next(body);
  }

  /**
   * Returns true if there are any messages in the thread and
   * we have reached the last page of the content.
   */
  get hasMore(): boolean {
    return this.messages.length > 0 && this._pagingState != null;
  }

  /**
   * On every scroll within the message list with a debounceTime of 100ms
   * we check whether we have scrolled all the way up and need to load more content.
   * scrollTop due to inverse scrolling is negative and hence we must take a positive value
   * of it.
   * The calculation reasonings are following:
   * The scrollHeight according to MDN represents the total space taken by the content
   * irrespective of the overflow (if we were to plade it all on a screen, that would have been
   * the total scrollHeight). Furthermore, scrollTop tells us how far we have scrolled in,
   * due to inverse scrolling this number actually represents the distance between the bottom
   * of the container and the top. Hence, when we scroll completely up we will have
   * maximum possible scrollTop position which does not include the container height. Therefore,
   * in order to verify that we have scrolled up all the way, we have to also add
   * offsetHeight (which takes into account height and padding). Since some of these numbers
   * can be floating, we have to round up to the nearest integer.
   */
  private setUpLazyLoadingScrollListener() {
    if (this.scrollContainer?.nativeElement) {
      fromEvent(this.scrollContainer.nativeElement, 'scroll')
        .pipe(takeUntil(this._destroy$), debounceTime(100))
        .subscribe(() => {
          if (
            this.scrollContainer &&
            Math.ceil(
              Math.abs(this.scrollContainer?.nativeElement.scrollTop) +
                this.scrollContainer?.nativeElement.offsetHeight
            ) >= this.scrollContainer.nativeElement.scrollHeight
          ) {
            if (
              this._pagingState &&
              this._pagingState.trim().length > 0 &&
              !this.loading
            ) {
              this.fetchNextPage();
            }
          }
        });
    }
  }

  private fetchUserPresences() {
    const userIdsToFetchPresenceFor = this.thread.members
      .filter((user) => user.uid !== this.currentUser.uid)
      .map((u) => u.uid);

    this.userService
      .getPresenceByIds(userIdsToFetchPresenceFor)
      .subscribe((userPresences) => {
        for (const uid in userPresences) {
          if (this.memberMap.has(uid)) {
            this.memberMap.set(uid, {
              ...this.memberMap.get(uid)!,
              lastSeenAt: new Date(userPresences[uid]),
            });
          }
        }
      });
  }

  private setupUserPresenceEventListener() {
    const userIdsToFetchPresenceFor = this.thread.members
      .filter((user) => user.uid !== this.currentUser.uid)
      .map((u) => u.uid);

    this.userService
      .presenceEventsForUids$(userIdsToFetchPresenceFor)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (presenceEvent) => {
          this.memberMap.set(presenceEvent.uid, {
            ...this.memberMap.get(presenceEvent.uid)!,
            lastSeenAt: new Date(presenceEvent.lastSeenAt),
          });
        },
      });
  }

  onSendMessage(message: string) {
    const receiptId = uuid();

    const messageSendRequest = new MessageSendRequest(
      message,
      this._threadId,
      receiptId
    );
    this.pendingMessages.push(messageSendRequest);
    this.rxStompService.publish({
      destination: `/ws-api/users/${this.currentUser.uid}/threads/${this._threadId}/messages`,
      body: JSON.stringify(messageSendRequest),
    });
  }

  private setupAckChannelListener() {
    this.rxStompService
      .watch(`/user/queue/threads/${this._threadId}/acks`)
      .pipe(takeUntil(this._destroy$))
      .subscribe((message) => {
        const acknowledgement = JSON.parse(
          message.body
        ) as MessageAcknowledgement;

        const pendingMessageIndex = this.pendingMessages.findIndex(
          (m) => m.receiptId === acknowledgement.receiptId
        );
        if (pendingMessageIndex !== -1) {
          this.pendingMessages.splice(pendingMessageIndex, 1);
        }

        this.messages.push(acknowledgement.message);
        this.threadService.publish({
          type: ThreadEventType.ACK,
          threadId: this._threadId,
          payload: acknowledgement.message,
        });
      });
  }

  private setupTypingListener() {
    this.typing$.subscribe({
      next: (body) => {
        console.log(
          'Publishing to',
          `/ws-api/users/${this.currentUser.uid}/threads/${this._threadId}/typing`
        );

        this.rxStompService.publish({
          destination: `/ws-api/users/${this.currentUser.uid}/threads/${this._threadId}/typing`,
        });
      },
    });

    this.rxStompService
      .watch(`/user/queue/typing`)
      .pipe(takeUntil(this._destroy$))
      .subscribe((message) => {
        if (this.typingTimeoutId) {
          clearTimeout(this.typingTimeoutId);
        }
        this.showTyping = true;
        this.typingTimeoutId = setTimeout(() => {
          this.showTyping = false;
        }, 3000);
      });
  }

  /**
   * Depending on the paging state, fetches the next batch of messages.
   */
  private fetchNextPage() {
    this.loading = true;

    this.messageService
      .getMessagesByUserByThread(
        this.currentUser.uid,
        this._threadId,
        this.messages[0].bucket + '',
        this._pagingState
      )
      .pipe(
        map((messages) => {
          messages.content.reverse();
          return messages;
        })
      )
      .subscribe(
        (messages) => {
          this._pagingState = messages.pagingState;
          this.messages.unshift(...messages.content);
        },
        () => (this.loading = false),
        () => (this.loading = false)
      );
  }

  private setupMessageListener() {
    this.rxStompService
      .watch(`/user/queue/threads/${this._threadId}`)
      .pipe(takeUntil(this._destroy$))
      .subscribe((message) => {
        console.log('Message received at', new Date().getTime());
        this.handleMessageEvent(message);
      });
  }

  private handleMessageEvent(message: IMessage) {
    const messageEvent = JSON.parse(message.body) as MessageEvent;

    this.threadService.publish({
      type: ThreadEventType.NEW_MESSAGE,
      threadId: this._threadId,
      payload: messageEvent,
    });
    this.messages.push(Message.fromMessageEvent(messageEvent));
  }

  private setupMemberMap() {
    this.memberMap.clear();

    for (const member of this.thread.members) {
      this.memberMap.set(member.uid, member);
    }
  }

  ngOnDestroy() {
    this._destroy$.next(undefined);
    this._destroy$.complete();
  }
}
