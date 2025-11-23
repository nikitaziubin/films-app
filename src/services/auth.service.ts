import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { tap, switchMap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { AuthResponse, User } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  private usersUrl = 'http://localhost:8080/api/users';

  user = signal<User | null>(this.getUserFromStorage());
  get currentUser(): User | null {
    return this.user();
  }
  isAdmin = computed(() => {
    const u = this.user();
    if (!u || !u.role) return false;
    const role = String(u.role).toUpperCase();
    return role.includes('ADMIN');
  });

  constructor(private http: HttpClient, private router: Router) {}

  login(loginRequest: any) {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, loginRequest)
      .pipe(
        // 1. Save tokens immediately so interceptor can see them
        tap((response) => this.saveTokens(response)),

        switchMap((response) => {
          // 2. Decode token to get ID
          const decoded = this.decodeToken(response.accessToken);
          // Check if your token uses 'id', 'sub', or 'userId'
          const userId = decoded.id || decoded.sub;

          if (userId) {
            // 3. Explicitly pass header to ensure it works even if interceptor is delayed/misconfigured
            const headers = new HttpHeaders({
              Authorization: `Bearer ${response.accessToken}`,
            });

            return this.http
              .get<User>(`${this.usersUrl}/${userId}`, { headers })
              .pipe(
                tap((user) => this.updateUser(user)),
                catchError((err) => {
                  console.error('Failed to fetch user details', err);
                  // Fallback: try to reconstruct user from token claims if API fails
                  const fallbackUser: User = {
                    id: userId,
                    email: decoded.sub || '', // 'sub' is standard for email/username in Spring Security
                    role: decoded.role || decoded.roles || 'LOGGED_IN',
                    name: decoded.name || 'User',
                    phoneNumber: '',
                  };
                  this.updateUser(fallbackUser);
                  return of(fallbackUser);
                })
              );
          } else {
            return of(null);
          }
        })
      );
  }

  register(registerRequest: any) {
    return this.http.post<User>(`${this.apiUrl}/register`, registerRequest);
  }

  refreshToken() {
    const token = localStorage.getItem('refresh_token');
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/refresh-tokens`, {
        refreshToken: token,
      })
      .pipe(tap((response) => this.saveTokens(response)));
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    this.user.set(null);
    this.router.navigate(['/login']);
  }

  // --- HELPERS ---

  private saveTokens(response: AuthResponse) {
    localStorage.setItem('access_token', response.accessToken);
    localStorage.setItem('refresh_token', response.refreshToken);
  }

  private updateUser(user: User) {
    console.log('Updating User State:', user);
    localStorage.setItem('user_data', JSON.stringify(user));
    this.user.set(user);
    console.log('isAdmin?', this.isAdmin());
  }

  private getUserFromStorage(): User | null {
    const stored = localStorage.getItem('user_data');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Error parsing stored user', e);
        return null;
      }
    }
    return null;
  }

  getAccessToken() {
    return localStorage.getItem('access_token');
  }

  isLoggedIn() {
    return !!this.user();
  }

  private decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        window
          .atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('Error decoding JWT', e);
      return {};
    }
  }
}
