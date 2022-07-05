import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OktaAuthGuard, OktaCallbackComponent } from '@okta/okta-angular';
import { MessengerHomeComponent } from './messenger-home/messenger-home.component';
import { ErrorComponent } from './shared/error/error.component';
import { RedirectAuthenticatedUsersGuard } from './shared/guard/redirect-authenticated-users.guard';
import { ThreadComponent } from './thread/thread.component';
import { WelcomeComponent } from './welcome/welcome.component';

const routes: Routes = [
  {
    path: '', component: WelcomeComponent, pathMatch: 'full',
    data: { redirectUrl: '/home' },
    canActivate: [RedirectAuthenticatedUsersGuard]
  },
  {
    path: 'home', component: MessengerHomeComponent, canActivate: [OktaAuthGuard],
    canActivateChild: [OktaAuthGuard], children: [
      { path: 'thread/:threadId', component: ThreadComponent }
    ]
  },
  {
    path: 'login/callback',
    component: OktaCallbackComponent,
  },
  {
    path: 'error',
    component: ErrorComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
