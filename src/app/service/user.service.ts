import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { User } from "../model/user/user.model";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private http: HttpClient
  ) { }

  getUserByUid(uid: string): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/users/${uid}`);
  }
}
