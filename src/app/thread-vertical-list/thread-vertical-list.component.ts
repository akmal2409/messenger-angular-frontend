import { Component, Input, OnInit } from '@angular/core';
import { LatestThread } from '../model/thread/latest-thread.model';

@Component({
  selector: 'app-thread-vertical-list',
  templateUrl: './thread-vertical-list.component.html',
  styleUrls: ['./thread-vertical-list.component.scss']
})
export class ThreadVerticalListComponent implements OnInit {
  @Input() threads: Array<LatestThread> = [];
  @Input() currenUserId!: string;

  constructor() { }

  ngOnInit(): void {
  }

}
