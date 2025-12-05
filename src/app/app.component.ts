import { Component, computed } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../components/navbar/navbar.component';
import { AuthService } from '../services/auth.service';
import { AppMessageComponent } from "../components/app-message/app-message.component";


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, AppMessageComponent],
  template: `
    <app-navbar></app-navbar>
    <main class="container" style="padding:16px">
      <router-outlet></router-outlet>
      <app-message></app-message>
    </main>
  `,
})
export class AppComponent {
  user = computed(() => this.auth.currentUser);

  constructor(private auth: AuthService) {}

  isLoggedIn() {
    return !!this.user();
  }

  isAdmin() {
    return this.user()?.role === 'ADMIN';
  }
}

