import { Component, Input, OnInit } from '@angular/core';
import { Message } from '../model/message/message.model';
import { UserDetails } from '../model/user/user-details.model';

@Component({
  selector: 'app-message-list',
  templateUrl: './message-list.component.html',
  styleUrls: ['./message-list.component.scss']
})
export class MessageListComponent implements OnInit {
  @Input() messages: Array<Message> = [];
  @Input() loading: boolean = false;
  @Input() memberMap = new Map<string, UserDetails>();
  @Input() currentUserId: string | undefined;

  constructor() { }

  ngOnInit(): void {
  }

}
