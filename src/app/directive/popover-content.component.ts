import {
  AfterViewInit,
  Component,
  Input,
  OnDestroy,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';

@Component({
  template: `
    <div [ngStyle]="styles" class="popover-container">
      <ng-template #vc></ng-template>
    </div>
  `,
  styles: [
    `
      .popover-container {
        position: fixed;
      }
    `,
  ],
})
export class PoopOverContent implements AfterViewInit, OnDestroy {
  @ViewChild('vc', { read: ViewContainerRef }) viewContainer!: ViewContainerRef;

  @Input() top?: string;
  @Input() bottom?: string;
  @Input() left?: string;
  @Input() right?: string;

  @Input() template!: TemplateRef<any>;

  ngAfterViewInit() {
    this.viewContainer.createEmbeddedView(this.template);
  }

  ngOnDestroy(): void {
    this.viewContainer.clear();
  }

  get styles() {
    return {
      top: this.top,
      bottom: this.bottom,
      right: this.right,
      left: this.left,
    };
  }
}
