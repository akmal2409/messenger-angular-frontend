import { Component, HostBinding, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-message',
  template: `
    <div class="message-content">
      {{ message }}
    </div>
  `,
  styleUrls: ['./message.component.scss'],
})
export class MessageComponent implements OnInit {
  @Input() message!: string;
  @Input() isInverted!: boolean;
  @Input() authorName: string | undefined;
  @Input() authorThumbnailUrl: string | undefined;
  @Input() isRead: boolean | undefined;
  @Input() timestamp!: Date;
  @HostBinding('id') @Input() id!: string;

  constructor() {}

  ngOnInit(): void {}

  @HostBinding('class')
  get _hostClass() {
    return this.isInverted ? 'message-host-alternate' : 'message-host-default';
  }
}
