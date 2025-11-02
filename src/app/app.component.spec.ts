import { Component, computed } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    <main class="container" style="padding:16px">
      <router-outlet></router-outlet>
    </main>
  `,
})
export class AppComponent {
  constructor(public auth: AuthService) {}
  user = computed(() => this.auth.user());
}
