import { Component, computed } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../components/navbar/navbar.component';
import { AuthService } from '../services/auth.service';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    <main class="container" style="padding:16px">
      <router-outlet></router-outlet>
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

