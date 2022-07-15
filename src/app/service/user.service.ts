import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { filter, Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { UserPresences } from '../model/user/user-presences.type';
import { User } from '../model/user/user.model';
import { UserPresenceEvent } from '../model/websocket/user-presence-event.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly _presence$ = new Subject<UserPresenceEvent>();

  constructor(private http: HttpClient) {}

  getUserByUid(uid: string): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/users/${uid}`);
  }

  getPresenceByIds(uids: Array<string>): Observable<UserPresences> {
    return this.http.get<UserPresences>(
      `${environment.apiUrl}/users/presence`,
      {
        params: new HttpParams().append('userIds', uids.join(',')),
      }
    );
  }

  public get presenceEventStream() {
    return this._presence$;
  }

  public get presenceEvents$() {
    return this._presence$.asObservable();
  }

  /**
   * Returns a stream of events only scoped for the required user ids.
   * @param uids list of user ids for whom we wish to receive the events.
   */
  public presenceEventsForUids$(uids: Array<string>) {
    return this._presence$
      .asObservable()
      .pipe(filter((presenceEvent) => uids.includes(presenceEvent.uid)));
  }
}
