import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule, NgIf } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, NgIf, CommonModule],
  styles: [
    `
      nav {
        display: flex;
        gap: 12px;
        align-items: center;
        padding: 10px 16px;
        background: #222;
        color: #fff;
      }
      a {
        color: #fff;
        text-decoration: none;
        font-weight: 500;
      }
      a:hover {
        text-decoration: underline;
      }
      .spacer {
        flex: 1;
      }
      button {
        padding: 4px 10px;
        background: #444;
        color: white;
        border: 1px solid #666;
        border-radius: 4px;
        cursor: pointer;
        margin-left: 10px;
      }
      button:hover {
        background: #555;
      }
      input {
        padding: 6px;
        border-radius: 4px;
        border: none;
        margin-right: 8px;
      }
      .user-info {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        line-height: 1.2;
        margin-right: 10px;
        font-size: 0.9em;
      }
      .user-email {
        font-size: 0.8em;
        color: #aaa;
      }
      .admin-badge {
        color: #ffd700; /* Gold color */
        font-weight: bold;
        font-size: 0.8em;
        margin-left: 5px;
      }
    `,
  ],
  template: `
    <nav>
      <!-- Visible to everyone -->
      <a routerLink="/" style="font-size: 1.2em; font-weight: bold;">CATALOG</a>

      <!-- Visible ONLY to ADMIN -->
      <ng-container *ngIf="auth.isAdmin()">
        <a routerLink="/films">Films</a>
        <a routerLink="/series">Series</a>
        <a routerLink="/trailers">Trailers</a>
        <a routerLink="/comments">Comments</a>
        <a routerLink="/ratings">Ratings</a>
      </ng-container>

      <a routerLink="/payments" *ngIf="auth.isLoggedIn()"> My Payments </a>

      <span class="spacer"></span>

      <input placeholder="Search films..." />
      <button type="button">Filter</button>

      <span *ngIf="!auth.isLoggedIn()" style="margin-left: 15px;">
        <a routerLink="/login">Login</a>
        <span style="margin: 0 5px; color: #666;">|</span>
        <a routerLink="/register">Register</a>
      </span>

      <div
        *ngIf="auth.isLoggedIn()"
        style="display: flex; align-items: center; margin-left: 15px;"
      >
        <div class="user-info">
          <span>
            <span *ngIf="auth.isAdmin()" class="admin-badge">(ADMIN)</span>
            {{ auth.currentUser?.name || 'User' }}
          </span>
          <span class="user-email">{{ auth.user()?.email }}</span>
        </div>
        <button (click)="auth.logout()">Logout</button>
      </div>
    </nav>
  `,
})
export class NavbarComponent {
  constructor(public auth: AuthService) {}
}
