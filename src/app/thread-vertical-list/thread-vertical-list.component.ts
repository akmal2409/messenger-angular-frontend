import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { LatestThread } from '../model/thread/latest-thread.model';

@Component({
  selector: 'app-thread-vertical-list',
  templateUrl: './thread-vertical-list.component.html',
  styleUrls: ['./thread-vertical-list.component.scss'],
})
export class ThreadVerticalListComponent implements OnInit {
  @Output() onClick = new EventEmitter<LatestThread>();

  @Input() threads: Array<LatestThread> = [];
  @Input() currenUserId!: string;
  @Input() showTypingThreadIdMap!: Map<string, boolean>;

  constructor() {}

  ngOnInit(): void {}
}
