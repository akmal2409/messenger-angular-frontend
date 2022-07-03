import { Component, OnInit } from '@angular/core';
import { switchMap, take } from 'rxjs';
import { LatestThread } from '../model/thread/latest-thread.model';
import { User } from '../model/user/user.model';
import { AuthService } from '../service/auth.service';
import { ThreadService } from '../service/thread.service';

@Component({
  selector: 'app-messenger-home',
  templateUrl: './messenger-home.component.html',
  styleUrls: ['./messenger-home.component.scss']
})
export class MessengerHomeComponent implements OnInit {
  latestThreads: Array<LatestThread> = [];
  loading = false;
  user!: User;

  constructor(
    private readonly threadService: ThreadService,
    private readonly authService: AuthService
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
        console.log('Latest threads', this.latestThreads);

        this.loading = false;
      });
  }

}
