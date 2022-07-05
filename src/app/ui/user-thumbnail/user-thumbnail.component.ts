import { ChangeDetectionStrategy, Component, Input } from "@angular/core";

@Component({
  selector: 'app-user-thumbnail',
  template: `
    <img [src]="imageSrc">
  `,
  styles: [`
    img {
      border-radius: 50%;
      object-fit: cover;
      max-width: 100%;
      max-height: 100%;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserThumbnailComponent {
  @Input() src: string | undefined;


  get imageSrc() {
    return (this.src && false) || '../../../assets/img/no-photo-thumbnail.png';
  }
}
