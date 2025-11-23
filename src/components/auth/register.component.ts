import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  styles: [
    `
      input {
        display: block;
        margin-bottom: 8px;
        width: 100%;
        padding: 8px;
      }
      button {
        padding: 8px 16px;
      }
    `,
  ],
  template: `
    <h2>Register</h2>
    <form (ngSubmit)="submit()">
      <input [(ngModel)]="name" name="name" placeholder="Full Name" required />
      <input
        [(ngModel)]="email"
        name="email"
        placeholder="Email"
        type="email"
        required
      />
      <input
        [(ngModel)]="phoneNumber"
        name="phone"
        placeholder="Phone Number"
        required
      />
      <input
        [(ngModel)]="password"
        name="password"
        placeholder="Password"
        type="password"
        required
      />

      <button>Create account</button>
      <p>Already have an account? <a routerLink="/login">Login</a></p>
    </form>
  `,
})
export class RegisterComponent {
  name = '';
  email = '';
  phoneNumber = '';
  password = '';

  constructor(private auth: AuthService, private router: Router) {}

  submit() {
    const registerRequest = {
      name: this.name,
      email: this.email,
      phoneNumber: this.phoneNumber,
      password: this.password,
      role: 'LOGGED_IN', // Default role if backend requires it
    };

    this.auth.register(registerRequest).subscribe({
      next: (user) => {
        console.log('Registration successful', user);
        // Backend returns User object, but no tokens.
        // Redirect to login so user can authenticate and get tokens.
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Registration failed', err);
        alert(
          'Registration failed: ' + (err.error?.message || 'Unknown error')
        );
      },
    });
  }
}
