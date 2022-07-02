import { Component } from "@angular/core";
import { AuthService } from "../service/auth.service";

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: [`./welcome.component.scss`]
})
export class WelcomeComponent {

  constructor(
    private readonly authService: AuthService
  ) { }

  onSignIn() {
    this.authService.singInWithRedirect();
  }
}
