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

  @Output() onChange = this.control.valueChanges;

  constructor() {}

  ngOnInit(): void {}

  addEmoji(event: any) {
    this.control.setValue((this.control.value || '') + event.emoji.native);
  }

  @HostListener('document:keydown.enter', ['$event'])
  keypressListener(event: KeyboardEvent) {
    event.preventDefault();
    this.sendMessage();
  }

  sendMessage() {
    if (this.control.value && this.control.value?.trim()?.length > 0) {
      this.onSend.emit(this.control.value);
      this.control.setValue('');
    }
  }
}
