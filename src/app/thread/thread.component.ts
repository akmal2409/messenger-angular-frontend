import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IMessage } from '@stomp/stompjs';
import { forkJoin, map, switchMap, take } from 'rxjs';
import { Message } from '../model/message/message.model';
import { Thread } from '../model/thread/thread.model';
import { UserDetails } from '../model/user/user-details.model';
import { User } from '../model/user/user.model';
import { MessageEvent } from '../model/websocket/message-event.model';
import { AuthService } from '../service/auth.service';
import { MessageService } from '../service/message.service';
import { RxStompService } from '../service/rx-stomp.service';
import { ThreadEventType, ThreadService } from '../service/thread.service';

@Component({
  selector: 'app-thread',
  template: `
    <div class="thread-header-container"></div>
    <div class="message-list-container">
      <tui-scrollbar class="message-list-scrollbar">
        <app-message-list
          [loading]="loading"
          [messages]="messages"
          [memberMap]="memberMap"
          [currentUserId]="currentUser?.uid"
        ></app-message-list>
      </tui-scrollbar>
    </div>
    <div class="message-input-container">
      <app-message-input></app-message-input>
    </div>
  `,
  styleUrls: ['./thread.component.scss'],
})
export class ThreadComponent implements OnInit {
  constructor(
    private readonly messageService: MessageService,
    private readonly authService: AuthService,
    private readonly threadService: ThreadService,
    private readonly route: ActivatedRoute,
    private readonly rxStompService: RxStompService
  ) {}

  messages: Array<Message> = [];
  currentUser!: User;
  loading = true;
  memberMap = new Map<string, UserDetails>();

  private _pagingState: string | undefined;
  private _threadId!: string;
  private thread!: Thread;

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
        },
      });
  }

  private setupMessageListener() {
    this.rxStompService
      .watch(`/user/queue/threads/${this._threadId}`)
      .subscribe((message) => {
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
}
