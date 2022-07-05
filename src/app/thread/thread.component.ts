import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, switchMap, take } from 'rxjs';
import { Message } from '../model/message/message.model';
import { User } from '../model/user/user.model';
import { AuthService } from '../service/auth.service';
import { MessageService } from '../service/message.service';

@Component({
  selector: 'app-thread',
  templateUrl: './thread.component.html',
  styleUrls: ['./thread.component.scss'],
})
export class ThreadComponent implements OnInit {
  constructor(
    private readonly messageService: MessageService,
    private readonly authService: AuthService,
    private readonly route: ActivatedRoute
  ) { }

  messages: Array<Message> = [];
  currentUser!: User;
  loading = true;

  private _pagingState: string | undefined;
  private _threadId!: string;

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
          return this.messageService.getMessagesByUserByThread(
            this.currentUser.uid,
            this._threadId
          );
        })
      )
      .subscribe({
        next: (scrollContent) => {
          this._pagingState = scrollContent.pagingState;
          this.messages = scrollContent.content;
          console.log('Messages', this.messages);

        },
      });
  }
}
