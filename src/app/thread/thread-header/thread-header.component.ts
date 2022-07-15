import { Component, Input, OnInit } from '@angular/core';
import { UserDetails } from 'src/app/model/user/user-details.model';
import { PresenceUtils } from 'src/app/shared/presence.utils';
import { UserDetailsWithPresence } from '../thread.component';

@Component({
  selector: 'app-thread-header',
  template: `
    <div class="thread-details">
      <app-thumbnail-presence
        [style]="{ height: '35px', width: '35px' }"
        [thumbnailUrl]="thumbnail"
        [active]="!groupThread && isOnline()"
      >
      </app-thumbnail-presence>
      <p class="thread-name">{{ name }}</p>
    </div>
  `,
  styles: [
    `
      :host {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
      }
      .thread-details {
        display: flex;
        align-items: center;
        width: 70%;
        max-height: 100%;
      }

      .thread-name {
        margin: 0;
        margin-left: 12px;
        font-weight: 500;
        font-size: 0.9375rem;
        line-height: 20px;
        padding-bottom: 5px;
      }
    `,
  ],
})
export class ThreadHeaderComponent implements OnInit {
  @Input() groupThread!: boolean;
  @Input() threadName!: string;
  @Input() members!: Array<UserDetails>;
  @Input() threadThumbnailUrl?: string;
  @Input() currentUserUid!: string;
  @Input() memberMap!: Map<string, UserDetailsWithPresence>;

  constructor() {}

  ngOnInit(): void {}

  get name() {
    if (this.groupThread) {
      return this.threadName;
    }

    // means its a one on one chat, we have to get an inverse participant
    return this.inverseParticipant?.name;
  }

  get thumbnail() {
    if (this.groupThread) {
      return this.threadThumbnailUrl;
    }

    // means its a one on one chat, we have to get an inverse participant
    return this.inverseParticipant?.profileThumbnailImageUrl;
  }

  public isOnline() {
    if (this.groupThread) {
      return false;
    }
    return PresenceUtils.isOnline(
      this.memberMap.get(this.inverseParticipant!.uid)?.lastSeenAt
    );
  }

  /**
   * For 1-1 chats returns the other side of the conversation (relative to the user)
   */
  get inverseParticipant() {
    return this.members.find((m) => m.uid !== this.currentUserUid);
  }
}
