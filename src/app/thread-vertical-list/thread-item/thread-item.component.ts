import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

@Component({
  selector: '[app-thread-item]',
  template: `
    <!-- <div class="thumbnail"> -->
      <tui-badged-content
          class="thumbnail"
          [colorBottom]="statusColour"
          size="m"
          [rounded]="true">
          <app-user-thumbnail [src]="thumbnailUrl"></app-user-thumbnail>
      </tui-badged-content>
    <!-- </div> -->

    <div class="message-info" [class.unread]="!read">
      <p class="name" style="font-size: 0.85rem;">{{ name }}</p>
      <p class="message">{{ currentUserId == authorId ? 'You: ' : null}}{{ lastMessage }}</p>
    </div>

    <div class="message-status">
      <tui-badged-content
        colorTop="var(--tui-error-fill)"
        size="s"
        class="unread-badge-content"
        *ngIf="!read"
        [rounded]="true"
    >
         <ng-container [ngTemplateOutlet]="messsageTimestamp"></ng-container>
    </tui-badged-content>

      <div class="unread-badge-content" *ngIf="read">
        <ng-container [ngTemplateOutlet]="messsageTimestamp"></ng-container>
      </div>
    </div>

    <ng-template #messsageTimestamp>
      <small style="color: var(--tui-text-01);">{{ lastMessageAt }}</small>
    </ng-template>
  `,
  styles: [`
    :host {
      cursor: pointer;
      display: flex;
      flex-wrap: nowrap;
      padding: 10px 8px;
      box-sizing: border-box;
      border-radius: 8px;
      &:hover {
        background-color: rgba(#ccc, 0.4);
      }
    }

    .thumbnail {
      flex: 0 0 max-content;
    }

    .thumbnail img {
      border-radius: 50%;
      object-fit: cover;
      max-width: 100%;
      max-height: 100%;
    }

    .message-info {
      margin-left: 10px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      flex-grow: 1;
      min-width: 0;

      gap: 2px;

      p {
        padding: 0;
        margin: 0;
        white-space: nowrap; /* forces text to single line */
        overflow: hidden;
        text-overflow: ellipsis;
        /* max-width: 90%; */
      }

      .name {
        color: var(--tui-text-01);
      }

      &.unread {
        font-weight: 500;
      }
    }

    .message-status {
      flex: 0 0 60px;
    }

    .unread-badge-content {
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      align-items: center;
      height: 100%;

      small {
        text-align: right;
        width: 100%;
      }
    }

    .avatar-badge-content {
      max-width: 100%;
      max-height: 100%;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ThreadItemComponent implements OnInit {
  @Input() name!: string;
  @Input() thumbnailUrl!: string;
  @Input() lastMessageAt: string | undefined;
  @Input() lastMessage: string | undefined;
  @Input() read: boolean = false;
  @Input() systemMessage: boolean = false;
  @Input() currentUserId!: string;
  @Input() authorId: string | undefined;
  @Input() authorName: string | undefined;
  @Input() online!: boolean;


  constructor() { }

  ngOnInit(): void {
    this.online = this.show();
  }

  show() {
    return (Math.random() > 0.8);
  }

  get statusColour() {
    return this.online ? 'var(--tui-success-fill)' : 'var(--tui-base-03)';
  }
}
