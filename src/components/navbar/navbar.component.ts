import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule, NgIf } from '@angular/common';
import { FilterService } from '../../services/filter.service';
import { FilterPanelComponent } from '../filter-panel/filter-panel.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, NgIf, CommonModule, FormsModule, FilterPanelComponent],
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
        color: #ffd700;
        font-weight: bold;
        font-size: 0.8em;
        margin-left: 5px;
      }
      .filter-wrap {
        position: relative;
      }
      .filter-popup {
        position: absolute;
        right: 0;
        top: 44px;
        z-index: 30;
      }
    `,
  ],
  template: `
    <nav>
      <a routerLink="/" style="font-size: 1.2em; font-weight: bold;">CATALOG</a>

      <ng-container *ngIf="auth.isAdmin()">
        <a routerLink="/films">Films</a>
        <a routerLink="/series">Series</a>
        <a routerLink="/trailers">Trailers</a>
        <a routerLink="/comments">Comments</a>
        <a routerLink="/ratings">Ratings</a>
      </ng-container>

      <a routerLink="/payments" *ngIf="auth.isLoggedIn()"> My Payments </a>
      <a routerLink="/profile" *ngIf="auth.isLoggedIn()">My Profile</a>

      <span class="spacer"></span>

      <div class="filter-wrap">
        <input placeholder="Search films..." [(ngModel)]="filter.searchValue" />
        <button type="button" (click)="filter.togglePanel()">Filter</button>

        <div class="filter-popup" *ngIf="filter.showPanel()">
          <app-filter-panel></app-filter-panel>
        </div>
      </div>

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
  constructor(public auth: AuthService, public filter: FilterService) {}
}
