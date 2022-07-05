import { Component, Inject, OnInit } from '@angular/core';
import { switchMap, take } from 'rxjs';
import { rxStompServiceFactory } from '../factory/rx-stomp-service.factory';
import { LatestThread } from '../model/thread/latest-thread.model';
import { User } from '../model/user/user.model';
import { AuthService } from '../service/auth.service';
import { RxStompService } from '../service/rx-stomp.service';
import { ThreadService } from '../service/thread.service';
import { Message } from '@stomp/stompjs';
import { TuiAlertService } from '@taiga-ui/core';
import { MessageEvent } from '../model/websocket/message-event.model';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-messenger-home',
  templateUrl: './messenger-home.component.html',
  styleUrls: ['./messenger-home.component.scss'],
  providers: [{
    provide: RxStompService,
    useFactory: rxStompServiceFactory,
    deps: [AuthService]
  }]
})
export class MessengerHomeComponent implements OnInit {
  latestThreads: Array<LatestThread> = [];
  loading = false;
  user!: User;

  constructor(
    private readonly threadService: ThreadService,
    private readonly authService: AuthService,
    private readonly rxStompService: RxStompService,
    @Inject(TuiAlertService) private readonly alertService: TuiAlertService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.loading = true;

    this.authService.user$
      .pipe(take(1),
        switchMap((user) => {
          this.user = user;
          return this.threadService.getLatestThreadsByUser(user.uid)
        }))
      .subscribe(threads => {
        this.latestThreads = threads;
        this.loading = false;

        this.initNotificationsListener();
      });
  }

  onSelectThread(thread: LatestThread) {
    this.latestThreads.splice(this.latestThreads.indexOf(thread), 1, { ...thread, read: true });
    this.router.navigate(['./thread', thread.threadId], { relativeTo: this.route });
  }

  onLogout() {
    this.authService.signOut();
    this.rxStompService.deactivate();
  }

  private initNotificationsListener() {
    this.rxStompService.watch("/user/queue/notifications").subscribe((message: Message) => {
      if (message.body) {
        const messageEvent: MessageEvent = JSON.parse(message.body);
        this.handleMessageEvent(messageEvent);
      }
    });
  }

  private handleMessageEvent(messageEvent: MessageEvent) {
    this.alertService.open(messageEvent.body, { label: messageEvent.authorName })
      .subscribe(() => { });

    const threads = [...this.latestThreads.map(t => ({ ...t }))];

    const thread = threads.find(thread => thread.threadId === messageEvent.threadId);

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
}
