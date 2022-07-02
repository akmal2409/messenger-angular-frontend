import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { OktaAuthModule, OKTA_CONFIG } from '@okta/okta-angular';
import { OktaAuth, OktaAuthOptions } from '@okta/okta-auth-js';
import { TuiAlertModule, TuiDialogModule, TuiRootModule, TUI_SANITIZER } from "@taiga-ui/core";
import { NgDompurifySanitizer } from "@tinkoff/ng-dompurify";
import { environment } from 'src/environments/environment';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RedirectAuthenticatedUsersGuard } from './shared/guard/redirect-authenticated-users.guard';
import { AuthInterceptor } from './shared/interceptors/auth.interceptor';
import { WelcomeComponent } from './welcome/welcome.component';
import { MessengerHomeComponent } from './messenger-home/messenger-home.component';
import { TuiModule } from './tui.module';

const oktaConfig: OktaAuthOptions = {
  issuer: environment.issuer,
  clientId: environment.clientId,
  redirectUri: '/login/callback',
  scopes: ['openid', 'profile', 'offline_access'],
  tokenManager: {
    autoRenew: false,
  },

};

const oktaAuth = new OktaAuth(oktaConfig);

@NgModule({
  declarations: [
    AppComponent,
    WelcomeComponent,
    MessengerHomeComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    OktaAuthModule,
    AppRoutingModule,
    TuiModule,
    BrowserAnimationsModule,
  ],
  providers: [
    { provide: OKTA_CONFIG, useValue: { oktaAuth } },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: TUI_SANITIZER, useClass: NgDompurifySanitizer },
    RedirectAuthenticatedUsersGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
