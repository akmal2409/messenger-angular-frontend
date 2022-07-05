import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { Message } from "../model/message/message.model";
import { ScrollContent } from "../model/shared/scroll-content.model";
import { queryParams } from "../shared/http/http.util";

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  constructor(
    private readonly http: HttpClient
  ) { }


  public getMessagesByUserByThread(uid: string, threadId: string, bucket?: string, pagingState?: string, beforeMessageId?: number): Observable<ScrollContent<Message>> {
    return this.http.get<ScrollContent<Message>>(
      `${environment.apiUrl}/users/${uid}/threads/${threadId}/messages`,
      {
        params: queryParams({ bucket, pagingState, beforeMessageId })
      }
    );
  }
}
