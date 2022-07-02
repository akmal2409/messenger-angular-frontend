import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { OKTA_AUTH, OktaAuthStateService } from '@okta/okta-angular';
import { OktaAuth } from '@okta/okta-auth-js';
import { delay } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(@Inject(OKTA_AUTH) public oktaAuth: OktaAuth,
    public authService: OktaAuthStateService,
    private readonly http: HttpClient) {

  }

  ngOnInit(): void {

  }

  ping() {
    this.http.get('http://localhost:8080/api/v1/users/00u5fo6wayZVk8Cxn5d7/threads')
      .subscribe(console.log);
    this.http.get('http://localhost:8080/api/v1/users/00u5fo6wayZVk8Cxn5d7/threads')
      .pipe(delay(100))
      .subscribe(console.log);
    this.http.get('http://localhost:8080/api/v1/users/00u5fo6wayZVk8Cxn5d7/threads')
      .pipe(delay(150))
      .subscribe(console.log);
  }
}
