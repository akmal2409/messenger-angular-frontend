import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-thumbnail-presence',
  template: `
    <tui-badged-content
      [ngStyle]="style || {}"
      [colorBottom]="statusColour"
      size="m"
      [rounded]="true"
    >
      <app-user-thumbnail [src]="thumbnailUrl"></app-user-thumbnail>
    </tui-badged-content>
  `,
  styles: [
    `
      .thumbnail {
        height: 40px;
      }
    `,
  ],
})
export class ThumbnailWithPresence {
  @Input() thumbnailUrl?: string;
  @Input() active!: boolean;
  @Input() style?: any;

  get statusColour() {
    return this.active ? 'var(--tui-success-fill)' : 'var(--tui-base-03)';
  }
}
