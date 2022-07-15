import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { interval, Subject, switchMap, take, takeUntil } from 'rxjs';
import { rxStompServiceFactory } from '../factory/rx-stomp-service.factory';
import { LatestThread } from '../model/thread/latest-thread.model';
import { User } from '../model/user/user.model';
import { AuthService } from '../service/auth.service';
import { RxStompService } from '../service/rx-stomp.service';
import { ThreadEventType, ThreadService } from '../service/thread.service';
import { Message } from '@stomp/stompjs';
import { Message as MessageModel } from 'src/app/model/message/message.model';
import { TuiAlertService } from '@taiga-ui/core';
import { MessageEvent } from '../model/websocket/message-event.model';
import { ActivatedRoute, Router } from '@angular/router';
import { TypingEvent } from '../model/message/typing-event.model';
import { UserPresenceEvent } from '../model/websocket/user-presence-event.model';
import { UserService } from '../service/user.service';

@Component({
  selector: 'app-messenger-home',
  templateUrl: './messenger-home.component.html',
  styleUrls: ['./messenger-home.component.scss'],
  providers: [
    {
      provide: RxStompService,
      useFactory: rxStompServiceFactory,
      deps: [AuthService],
    },
  ],
})
export class MessengerHomeComponent implements OnInit, OnDestroy {
  latestThreads: Array<LatestThread> = [];
  loading = false;
  user!: User;

  threadLastSeenMap = new Map<string, Date>(); // applicable only to non group threads
  uidToThreadMap = new Map<string, string>(); // applicable only to non group threads

  showTypingThreadIdMap = new Map<string, boolean>();
  showTypingTimeoutId?: any;

  private readonly _destroy$ = new Subject<null>();

  constructor(
    private readonly threadService: ThreadService,
    private readonly authService: AuthService,
    private readonly rxStompService: RxStompService,
    @Inject(TuiAlertService) private readonly alertService: TuiAlertService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly userService: UserService
  ) {}

  ngOnInit(): void {
    this.loading = true;

    this.authService.user$
      .pipe(
        take(1),
        switchMap((user) => {
          this.user = user;
          return this.threadService.getLatestThreadsByUser(user.uid);
        })
      )
      .subscribe((threads) => {
        this.latestThreads = threads;
        this.loading = false;

        this.fetchUserPresence();

        this.initNotificationsListener();
        this.initThreadEventListener();
        this.initTypingEventListener();
        this.initUserPresenceEventListener();
        this.initHeartbeatPublisher();
      });
  }

  onSelectThread(thread: LatestThread) {
    this.latestThreads.splice(this.latestThreads.indexOf(thread), 1, {
      ...thread,
      read: true,
    });
    this.router.navigate(['./thread', thread.threadId], {
      relativeTo: this.route,
    });
  }

  onLogout() {
    this.authService.signOut();
    this.rxStompService.deactivate();
  }

  private fetchUserPresence() {
    this.threadLastSeenMap = new Map<string, Date>();

    this.uidToThreadMap = new Map<string, string>(
      this.latestThreads
        .filter((t) => !t.groupThread)
        .map((t) => [
          [...t.memberIds].find((id) => id !== this.user.uid)!,
          t.threadId,
        ])
    );

    this.userService
      .getPresenceByIds([...this.uidToThreadMap.keys()])
      .subscribe((userPresences) => {
        for (const uid in userPresences) {
          this.threadLastSeenMap.set(
            this.uidToThreadMap.get(uid)!,
            new Date(userPresences[uid])
          );
        }
      });
  }

  /**
   * Periodically (every 4 minutes) sends a heartbeat to the server that marks the presence of the user
   * and notifies all of its contacts.
   */
  private initHeartbeatPublisher() {
    interval(20000)
      .pipe(takeUntil(this._destroy$))
      .subscribe(() => {
        console.log('Publishing heartbeat');

        this.rxStompService.publish({
          destination: `/ws-api/users/${this.user.uid}/heartbeat`,
        });
      });
  }

  private initNotificationsListener() {
    this.rxStompService
      .watch('/user/queue/notifications')
      .pipe(takeUntil(this._destroy$))
      .subscribe((message: Message) => {
        if (message.body) {
          const messageEvent: MessageEvent = JSON.parse(message.body);
          this.handleMessageEvent(messageEvent);
        }
      });
  }

  private initUserPresenceEventListener() {
    this.rxStompService
      .watch('/user/queue/user-presence')
      .pipe(takeUntil(this._destroy$))
      .subscribe((message: Message) => {
        const jsonPresenceEvent = JSON.parse(message.body) as RawPresenceEvent; // because JSON.parse cant handle serializing LocalDateTime
        const userPresenceEvent = new UserPresenceEvent(
          jsonPresenceEvent.uid,
          new Date(jsonPresenceEvent.lastSeenAt)
        );

        this.userService.presenceEventStream.next(userPresenceEvent);
        console.log('User presence', userPresenceEvent);

        if (this.uidToThreadMap.has(userPresenceEvent.uid)) {
          this.threadLastSeenMap.set(
            this.uidToThreadMap.get(userPresenceEvent.uid)!,
            userPresenceEvent.lastSeenAt
          );
        }
      });
  }

  private initTypingEventListener() {
    this.rxStompService
      .watch('/user/queue/typing')
      .pipe(takeUntil(this._destroy$))
      .subscribe((message) => {
        const typingEvent = JSON.parse(message.body) as TypingEvent;

        if (this.showTypingTimeoutId) {
          clearTimeout(this.showTypingTimeoutId);
        }

        this.showTypingThreadIdMap.set(typingEvent.threadId, true);

        this.showTypingTimeoutId = setTimeout(
          () => this.showTypingThreadIdMap.delete(typingEvent.threadId),
          2500
        );
      });
  }

  private initThreadEventListener() {
    this.threadService.events$
      .pipe(takeUntil(this._destroy$))
      .subscribe((event) => {
        const thread = this.latestThreads.find(
          (t) => t.threadId === event.threadId
        );

        if (thread) {
          switch (event.type) {
            case ThreadEventType.READ_STATUS:
              thread.read = event.payload as boolean;
              break;
            case ThreadEventType.NEW_MESSAGE:
              const messageEvent = event.payload as MessageEvent;
              thread.lastMessage = messageEvent.body;
              thread.author.name = messageEvent.authorName;
              thread.author.uid = messageEvent.authorId;
              thread.read = messageEvent.read;
              thread.lastMessageId = messageEvent.messageId;
              thread.threadName = messageEvent.threadName;
              thread.threadPictureUrl = messageEvent.threadPictureUrl;
              thread.threadPictureThumbnailUrl =
                messageEvent.threadPictureThumbnailUrl;
              thread.lastMessageAt = 'Now';
              this.latestThreads.sort(
                (t1, t2) => t2.lastMessageId - t1.lastMessageId
              );
              break;
            case ThreadEventType.ACK:
              const message = event.payload as MessageModel;
              thread.lastMessageId = message.messageId;
              thread.lastMessageAt = 'Now';
              thread.author.uid = message.authorId;
              thread.author.name = `${this.user.firstName} ${this.user.lastName}`;
              thread.author.profileImageUrl = this.user.profileImageUrl;
              thread.author.profileThumbnailImageUrl =
                this.user.profileThumbnailUrl;
              thread.lastMessage = message.body;
              this.latestThreads.sort(
                (t1, t2) => t2.lastMessageId - t1.lastMessageId
              );
              break;
          }
        }
      });
  }

  private handleMessageEvent(messageEvent: MessageEvent) {
    this.alertService
      .open(messageEvent.body, { label: messageEvent.authorName })
      .subscribe(() => {});

    const threads = [...this.latestThreads.map((t) => ({ ...t }))];

    const thread = threads.find(
      (thread) => thread.threadId === messageEvent.threadId
    );

    if (thread) {
      thread.lastMessage = messageEvent.body;
      thread.lastMessageAt = 'Now';
      thread.lastMessageId = messageEvent.messageId;
      thread.read = messageEvent.read;
      thread.author.uid = messageEvent.authorId;
      thread.author.name = messageEvent.authorName;
      thread.systemMessage = messageEvent.systemMessage;
    }

    threads.sort((t1, t2) => t2.lastMessageId - t1.lastMessageId);

    this.latestThreads = threads;
  }

  ngOnDestroy(): void {
    this._destroy$.next(null);
    this._destroy$.complete();
  }
}

type RawPresenceEvent = {
  uid: string;
  lastSeenAt: string;
};
