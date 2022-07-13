import { Component, HostBinding, Input } from '@angular/core';

@Component({
  selector: 'three-bouncy-dots',
  template: `
    <div class="dot first"></div>
    <div class="dot second"></div>
    <div class="dot third"></div>
  `,
  styles: [
    `
      :host {
        display: flex;
        gap: 4px;

        &.s .dot {
          width: 8px;
          height: 8px;
        }

        &.m .dot {
          width: 10px;
          height: 10px;
        }

        &.l .dot {
          width: 15px;
          height: 15px;
        }
      }
      .dot {
        border-radius: 50%;
        background-color: #ccc;
        animation: 1s linear infinite bounce;
      }

      .second {
        animation-delay: 0.2s;
      }

      .third {
        animation-delay: 0.4s;
      }

      @keyframes bounce {
        0% {
          transform: translateY(0);
        }

        25% {
          transform: translateY(-6px);
        }

        50% {
          transform: translateY(-6px);
        }

        100% {
          transform: translateY(0);
        }
      }
    `,
  ],
})
export class ThreeBouncyDotsComponent {
  @Input() size?: 's' | 'm' | 'l' = 'm';

  @HostBinding('class') get hostClass() {
    if (this.size === 's') {
      return 's';
    } else if (this.size === 'm') {
      return 'm';
    } else if (this.size === 'l') {
      return 'l';
    } else {
      return 'm';
    }
  }
}
