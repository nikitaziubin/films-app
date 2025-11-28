import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
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
      .error {
        color: #b00020;
        font-size: 12px;
        margin-top: -4px;
        margin-bottom: 6px;
      }
      button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    `,
  ],
  template: `
    <h2>Login</h2>
    <form #loginForm="ngForm" (ngSubmit)="submit()">
      <input
        [(ngModel)]="email"
        name="email"
        placeholder="Email"
        required
        pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$"
        #emailCtrl="ngModel"
      />
      <div
        class="error"
        *ngIf="emailCtrl.invalid && (emailCtrl.dirty || emailCtrl.touched)"
      >
        <span *ngIf="emailCtrl.errors?.['required']">Email is required.</span>
        <span *ngIf="emailCtrl.errors?.['pattern']"
          >Please enter a valid email.</span
        >
      </div>
      <input
        [(ngModel)]="password"
        name="p"
        placeholder="password"
        type="password"
        required
      />
      <button [disabled]="loginForm.invalid">Login</button>
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
