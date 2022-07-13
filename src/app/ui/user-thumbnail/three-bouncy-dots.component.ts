import { Component } from '@angular/core';

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
      }
      .dot {
        width: 10px;
        height: 10px;
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
          transform: translateY(-10px);
        }

        50% {
          transform: translateY(-10px);
        }

        100% {
          transform: translateY(0);
        }
      }
    `,
  ],
})
export class ThreeBouncyDotsComponent {}
