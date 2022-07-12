import {
  ChangeDetectorRef,
  ComponentRef,
  Directive,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { PoopOverContent } from './popover-content.component';

@Directive({
  selector: '[appPopover]',
})
export class PopoverDirective implements OnDestroy {
  @Input() appPopover!: TemplateRef<any>;
  show = false;

  componentRef?: ComponentRef<PoopOverContent>;

  constructor(
    private view: ViewContainerRef,
    private el: ElementRef<HTMLElement>,
    private cdr: ChangeDetectorRef
  ) {}

  @HostListener('click')
  onClick() {
    this.show = !this.show;

    if (this.show) {
      const clientRec = this.el.nativeElement.getBoundingClientRect();

      this.componentRef =
        this.view.createComponent<PoopOverContent>(PoopOverContent);
      console.log(clientRec);

      let top = clientRec.top;
      let left = clientRec.left;

      if (clientRec.y + clientRec.height > window.innerHeight) {
        top = window.innerHeight - clientRec.height - 400;
      }

      if (clientRec.x + clientRec.width > window.screenX) {
        left = window.screenX - clientRec.width - 100;
      }

      this.componentRef.instance.template = this.appPopover;
      this.componentRef.instance.top = top - 440 + 'px';
      // this.componentRef.instance.bottom = clientRec.bottom + 'px';
      this.componentRef.instance.left = clientRec.left - 330 + 'px';
      // this.componentRef.instance.right = clientRec.right + 'px';
      this.cdr.detectChanges();
    } else {
      if (this.componentRef) {
        this.componentRef.destroy();
      }
    }
  }

  ngOnDestroy(): void {
    if (this.componentRef) {
      this.componentRef.destroy();
    }
  }
}
