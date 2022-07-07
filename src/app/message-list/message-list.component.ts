import { Component, Input, OnInit } from '@angular/core';
import { Message } from '../model/message/message.model';
import { UserDetails } from '../model/user/user-details.model';

@Component({
  selector: 'app-message-list',
  template: `
    <ul class="message-list-container">
      <li
        *ngFor="let message of messages"
        [ngClass]="currentUserId !== message.authorId ? 'alternate' : 'default'"
      >
        <app-message
          [message]="message.body"
          [authorName]="memberMap.get(message.authorId)?.name"
          [authorThumbnailUrl]="
            memberMap.get(message.authorId)?.profileThumbnailImageUrl
          "
          [timestamp]="message.timestamp"
          [isInverted]="currentUserId !== message.authorId"
          [isRead]="message.read"
          [id]="'messsage-' + message.messageId"
        ></app-message>
      </li>
    </ul>
  `,
  styleUrls: ['./message-list.component.scss'],
})
export class MessageListComponent implements OnInit {
  @Input() messages: Array<Message> = [];
  @Input() loading: boolean = false;
  @Input() memberMap = new Map<string, UserDetails>();
  @Input() currentUserId: string | undefined;

  constructor() {}

  ngOnInit(): void {}
}
