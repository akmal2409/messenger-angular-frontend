import { formatDate } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MessageSendRequest } from '../model/message/message-send-request.model';
import { Message } from '../model/message/message.model';
import { UserDetails } from '../model/user/user-details.model';

@Component({
  selector: 'app-message-list',
  template: `
    <ul class="message-list-container">
      <ng-container *ngFor="let message of messages; let i = index">
        <div class="message-date-separator" *ngIf="showTimestamp(i)">
          <small>{{ getFormattedTimestamp(message.timestamp) }}</small>
        </div>
        <li
          [ngClass]="
            currentUserId !== message.authorId ? 'alternate' : 'default'
          "
        >
          <app-message
            [message]="message.body"
            [authorName]="memberMap.get(message.authorId)?.name"
            [authorThumbnailUrl]="
              memberMap.get(message.authorId)?.profileThumbnailImageUrl
            "
            [isInverted]="currentUserId !== message.authorId"
            [isRead]="message.read"
            [id]="'messsage-' + message.messageId"
          ></app-message>
        </li>
      </ng-container>
      <li class="default" *ngFor="let message of pendingMessages">
        <app-message
          [message]="message.body"
          [isInverted]="false"
          [isRead]="false"
          [id]="'messsage-' + message.receiptId"
        ></app-message>
        <div class="message-spinner-container">
          <div class="spinner"></div>
        </div>
      </li>
    </ul>
  `,
  styleUrls: ['./message-list.component.scss'],
})
export class MessageListComponent implements OnInit {
  @Input() messages: Array<Message> = [];
  @Input() pendingMessages: Array<MessageSendRequest> = [];

  @Input() loading: boolean = false;
  @Input() memberMap = new Map<string, UserDetails>();
  @Input() currentUserId?: string;
  @Input() hasMore?: boolean;

  constructor() {}

  ngOnInit(): void {}

  public getFormattedTimestamp(date: Date): string {
    return formatDate(date, 'mediumDate', 'en-GB');
  }

  public showTimestamp(index: number) {
    if (!this.hasMore && index === 0) {
      return true;
    } else if (index > 0) {
      const previousMessageTime = new Date(this.messages[index - 1].timestamp);
      const currentMessageTime = new Date(this.messages[index].timestamp);

      return (
        currentMessageTime.getDay() > previousMessageTime.getDay() ||
        currentMessageTime.getMonth() > previousMessageTime.getMonth() ||
        currentMessageTime.getFullYear() > previousMessageTime.getFullYear()
      );
    }

    return false;
  }
}
