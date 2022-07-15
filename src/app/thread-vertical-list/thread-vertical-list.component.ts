import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { LatestThread } from '../model/thread/latest-thread.model';
import { PresenceUtils } from '../shared/presence.utils';

@Component({
  selector: 'app-thread-vertical-list',
  templateUrl: './thread-vertical-list.component.html',
  styleUrls: ['./thread-vertical-list.component.scss'],
})
export class ThreadVerticalListComponent implements OnInit {
  @Output() onClick = new EventEmitter<LatestThread>();

  @Input() threads: Array<LatestThread> = [];
  @Input() currenUserId!: string;
  @Input() showTypingThreadIdMap!: Map<string, boolean>;
  @Input() threadLastSeenMap = new Map<string, Date>();

  constructor() {}

  ngOnInit(): void {}

  /**
   * if less than 5 minutes have passed since the user was active,
   * mark itas online
   * @param lastSeenAt
   * @returns
   */
  public isOnline(lastSeenAt: Date | undefined) {
    return PresenceUtils.isOnline(lastSeenAt);
  }
}
