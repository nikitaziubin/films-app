import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { MessageService } from '../../services/message.service';

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
    <h2>Register</h2>
    <h2>Register</h2>
    <form #registerForm="ngForm" (ngSubmit)="onRegister(registerForm)">
      <input
        [(ngModel)]="name"
        name="name"
        placeholder="Full Name"
        required
        #nameCtrl="ngModel"
      />
      <div
        class="error"
        *ngIf="nameCtrl.invalid && (nameCtrl.dirty || nameCtrl.touched)"
      >
        Name is required.
      </div>
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
        [(ngModel)]="phoneNumber"
        name="phone"
        placeholder="Phone Number"
        required
        #phoneCtrl="ngModel"
        pattern="^\\+?\\d{6,15}$"
      />
      <div
        class="error"
        *ngIf="phoneCtrl.invalid && (phoneCtrl.dirty || phoneCtrl.touched)"
      >
        <span *ngIf="phoneCtrl.errors?.['required']"
          >Phone number is required.</span
        >
        <span *ngIf="phoneCtrl.errors?.['pattern']"
          >Enter a valid phone number.</span
        >
      </div>
      <input
        [(ngModel)]="password"
        name="password"
        placeholder="Password"
        type="password"
        required
        minlength="6"
        #passwordCtrl="ngModel"
      />
      <div
        class="error"
        *ngIf="
          passwordCtrl.invalid && (passwordCtrl.dirty || passwordCtrl.touched)
        "
      >
        <span *ngIf="passwordCtrl.errors?.['required']"
          >Password is required.</span
        >
        <span *ngIf="passwordCtrl.errors?.['minlength']"
          >Password must be at least 6 characters.</span
        >
      </div>

      <button [disabled]="registerForm.invalid">Create account</button>
      <p>Already have an account? <a routerLink="/login">Login</a></p>
    </form>
  `,
})
export class RegisterComponent {
  name = '';
  email = '';
  phoneNumber = '';
  password = '';

  constructor(private auth: AuthService, private router: Router, private messageService: MessageService) {}

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
        this.messageService.error('Registration failed: ' + (err.error?.message || 'Unknown error'));
      },
    });
  }
  onRegister(form: any) {
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }
    this.submit();
  }
}
