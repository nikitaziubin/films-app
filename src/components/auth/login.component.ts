import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h2>Login</h2>
    <form (ngSubmit)="submit()">
      <!-- Changed name="u" to name="email" to match backend expectation -->
      <input [(ngModel)]="email" name="email" placeholder="email" required />
      <input
        [(ngModel)]="password"
        name="p"
        placeholder="password"
        type="password"
        required
      />
      <button>Login</button>
    </form>
  `,
})
export class LoginComponent {
  email = ''; // Changed from username to email
  password = '';
  constructor(private auth: AuthService, private router: Router) {}

  submit() {
    // Pass a single object with email and password
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: () => this.router.navigateByUrl('/'),
      error: (err) => console.error('Login failed', err),
    });
  }
}
