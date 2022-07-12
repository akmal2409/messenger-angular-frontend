import {
  Component,
  EventEmitter,
  HostListener,
  OnInit,
  Output,
} from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-message-input',
  templateUrl: './message-input.component.html',
  styleUrls: ['./message-input.component.scss'],
})
export class MessageInputComponent implements OnInit {
  @Output() onSend = new EventEmitter<string>();

  control = new FormControl<string>('');

  constructor() {}

  ngOnInit(): void {}

  addEmoji(event: any) {
    this.control.setValue((this.control.value || '') + event.emoji.native);
  }

  @HostListener('document:keydown.enter', ['$event'])
  keypressListener() {
    if (this.control.value && this.control.value?.trim()?.length > 0) {
      this.onSend.emit(this.control.value);
      this.control.setValue('');
    }
  }
}
