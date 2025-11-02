import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h2>Register</h2>
    <form (ngSubmit)="submit()">
      <input [(ngModel)]="username" name="u" placeholder="username" required />
      <input
        [(ngModel)]="password"
        name="p"
        placeholder="password"
        type="password"
        required
      />
      <button>Create account</button>
    </form>
  `,
})
export class RegisterComponent {
  username = '';
  password = '';
  constructor(private auth: AuthService, private router: Router) {}
  submit() {
    this.auth.register(this.username, this.password);
    this.router.navigateByUrl('/');
  }
}
