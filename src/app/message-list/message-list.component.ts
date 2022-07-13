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
          <div
            class="thumbnail-wrapper"
            *ngIf="currentUserId !== message.authorId"
          >
            <app-user-thumbnail
              *ngIf="showMessageThumbnail(message, i)"
              [src]="memberMap.get(message.authorId)?.profileThumbnailImageUrl"
            ></app-user-thumbnail>
          </div>
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

      <li *ngIf="showTyping" class="alternate elevated">
        <three-bouncy-dots></three-bouncy-dots>
      </li>
    </ul>
  `,
  styleUrls: ['./message-list.component.scss'],
})
export class MessageListComponent implements OnInit {
  @Input() messages: Array<Message> = [];
  @Input() pendingMessages: Array<MessageSendRequest> = [];

  @Input() loading: boolean = false;
  @Input() showTyping?: boolean;
  @Input() memberMap = new Map<string, UserDetails>();
  @Input() currentUserId?: string;
  @Input() hasMore?: boolean;

  constructor() {}

  ngOnInit(): void {}

  /**
   * Returns formatted date in format 'MM dd,yyyy'.
   * If the date is today, it returns 'Today'
   *
   * @param date
   * @returns
   */
  public getFormattedTimestamp(date: Date): string {
    const today = new Date();
    const parsedDate = new Date(date); // because under the hood the date from the backend is a string, bug in JS

    if (parsedDate.setHours(0, 0, 0, 0) === today.setHours(0, 0, 0, 0))
      return 'Today';

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

  public showMessageThumbnail(message: Message, index: number) {
    const notFromCurrentUser = message.authorId !== this.currentUserId;

    if (notFromCurrentUser && index === this.messages.length - 1) return true;
    else if (notFromCurrentUser && index < this.messages.length - 1) {
      const nextMessage = this.messages[index + 1];

      return (
        nextMessage.authorId !== message.authorId ||
        this.showTimestamp(index + 1)
      );
    } else {
      return false;
    }
  }
}
