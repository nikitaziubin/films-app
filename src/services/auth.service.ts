import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  user = signal<string | null>(localStorage.getItem('auth_user'));

  login(username: string, _password: string) {
    // demo only: accept any username/password
    localStorage.setItem('auth_user', username);
    this.user.set(username);
  }
  register(username: string, _password: string) {
    // demo only
    this.login(username, _password);
  }
  logout() {
    localStorage.removeItem('auth_user');
    this.user.set(null);
  }
  isLoggedIn() {
    return !!this.user();
  }
}
