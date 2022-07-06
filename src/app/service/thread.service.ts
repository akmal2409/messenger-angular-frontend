import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { filter, Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { LatestThread } from '../model/thread/latest-thread.model';
import { Thread } from '../model/thread/thread.model';
import { MessageEvent } from '../model/websocket/message-event.model';

@Injectable({
  providedIn: 'root',
})
export class ThreadService {
  private readonly _eventBus = new Subject<ThreadEvent>();

  constructor(private readonly http: HttpClient) {}

  public publish(event: ThreadEvent) {
    this._eventBus.next(event);
  }

  public get events$(): Observable<ThreadEvent> {
    return this._eventBus.asObservable();
  }

  public subscribeOn(type: ThreadEventType): Observable<ThreadEvent> {
    return this.events$.pipe(filter((event) => event.type === type));
  }

  public getLatestThreadsByUser(userId: string) {
    return this.http.get<Array<LatestThread>>(
      `${environment.apiUrl}/users/${userId}/threads`
    );
  }

  public getById(threadId: string, uid: string) {
    return this.http.get<Thread>(
      `${environment.apiUrl}/users/${uid}/threads/${threadId}`
    );
  }
}

export interface ThreadEvent {
  type: ThreadEventType;
  threadId: string;
  payload: MessageEvent | boolean;
}

export enum ThreadEventType {
  READ_STATUS,
  NEW_MESSAGE,
}
