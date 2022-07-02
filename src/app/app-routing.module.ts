import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OktaCallbackComponent } from '@okta/okta-angular';
import { MessengerHomeComponent } from './messenger-home/messenger-home.component';
import { ErrorComponent } from './shared/error/error.component';
import { RedirectAuthenticatedUsersGuard } from './shared/guard/redirect-authenticated-users.guard';
import { WelcomeComponent } from './welcome/welcome.component';

const routes: Routes = [
  {
    path: '', component: WelcomeComponent, pathMatch: 'full',
    data: { redirectUrl: '/home' },
    canActivate: [RedirectAuthenticatedUsersGuard]
  },
  {
    path: 'home', component: MessengerHomeComponent, children: [

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
