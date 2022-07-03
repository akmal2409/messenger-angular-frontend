import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { LatestThread } from "../model/thread/latest-thread.model";

@Injectable({
  providedIn: 'root'
})
export class ThreadService {

  constructor(
    private readonly http: HttpClient
  ) { }


  getLatestThreadsByUser(userId: string) {
    return this.http.get<Array<LatestThread>>(`${environment.apiUrl}/users/${userId}/threads`)
  }
}
