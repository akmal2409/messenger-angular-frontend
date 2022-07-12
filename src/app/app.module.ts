import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { OktaAuthModule, OKTA_CONFIG } from '@okta/okta-angular';
import { OktaAuth, OktaAuthOptions } from '@okta/okta-auth-js';
import {
  TuiAlertModule,
  TuiDialogModule,
  TuiRootModule,
  TUI_SANITIZER,
} from '@taiga-ui/core';
import { NgDompurifySanitizer } from '@tinkoff/ng-dompurify';
import { environment } from 'src/environments/environment';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RedirectAuthenticatedUsersGuard } from './shared/guard/redirect-authenticated-users.guard';
import { AuthInterceptor } from './shared/interceptors/auth.interceptor';
import { WelcomeComponent } from './welcome/welcome.component';
import { MessengerHomeComponent } from './messenger-home/messenger-home.component';
import { TuiModule } from './tui.module';
import { ThreadVerticalListComponent } from './thread-vertical-list/thread-vertical-list.component';
import { ThreadItemComponent } from './thread-vertical-list/thread-item/thread-item.component';
import { UserThumbnailComponent } from './ui/user-thumbnail/user-thumbnail.component';
import { ThreadComponent } from './thread/thread.component';
import { MessageListComponent } from './message-list/message-list.component';
import { MessageComponent } from './message-list/message/message.component';
import { MessageInputComponent } from './message-input/message-input.component';
import { ThreadHeaderComponent } from './thread/thread-header/thread-header.component';
import { ThumbnailWithPresence } from './ui/user-thumbnail/thumbnail-with-presence.component';
import { PopoverDirective } from './directive/emoji-popover.directive';
import { PoopOverContent } from './directive/popover-content.component';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { ReactiveFormsModule } from '@angular/forms';

const oktaConfig: OktaAuthOptions = {
  issuer: environment.issuer,
  clientId: environment.clientId,
  redirectUri: '/login/callback',
  scopes: ['openid', 'profile', 'offline_access'],
};

const oktaAuth = new OktaAuth(oktaConfig);

@NgModule({
  declarations: [
    AppComponent,
    WelcomeComponent,
    MessengerHomeComponent,
    ThreadVerticalListComponent,
    ThreadItemComponent,
    UserThumbnailComponent,

    ThreadComponent,
    MessageListComponent,
    MessageComponent,
    MessageInputComponent,
    ThreadHeaderComponent,
    ThumbnailWithPresence,
    PopoverDirective,
    PoopOverContent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    OktaAuthModule,
    AppRoutingModule,
    TuiModule,
    BrowserAnimationsModule,
    PickerModule,
    ReactiveFormsModule,
  ],
  providers: [
    { provide: OKTA_CONFIG, useValue: { oktaAuth } },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: TUI_SANITIZER, useClass: NgDompurifySanitizer },
    RedirectAuthenticatedUsersGuard,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
