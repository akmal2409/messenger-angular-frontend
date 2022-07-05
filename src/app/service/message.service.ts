import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  constructor(
    private readonly http: HttpClient
  ) { }


  public getMessagesByUserByThread(uid: string, threadId: string) {

  }
}
