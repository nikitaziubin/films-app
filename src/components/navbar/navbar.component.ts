import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule, NgIf, NgClass } from '@angular/common';
import { FilterService } from '../../services/filter.service';
import { FilterPanelComponent } from '../filter-panel/filter-panel.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, NgIf, NgClass, CommonModule, FormsModule, FilterPanelComponent],
  styles: [
    `
      nav {
        display: flex;
        align-items: center;
        padding: 10px 16px;
        background: #222;
        color: #fff;
        gap: 12px;
        position: relative;
      }

      .brand {
        font-size: 1.2em;
        font-weight: bold;
      }

      .nav-links {
        display: flex;
        align-items: center;
        gap: 12px;
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

      /* --- Hamburger button --- */
      .hamburger {
        display: none;
        flex-direction: column;
        justify-content: center;
        gap: 4px;
        width: 28px;
        height: 24px;
        cursor: pointer;
      }
      .hamburger span {
        height: 3px;
        border-radius: 2px;
        background: #fff;
        display: block;
      }

      /* --- Mobile layout --- */
      @media (max-width: 768px) {
        nav {
          flex-wrap: wrap;
        }

        .nav-links,
        .filter-wrap,
        .auth-section {
          width: 100%;
        }

        /* hide normal links on small screens; show hamburger */
        .nav-links,
        .filter-wrap,
        .auth-section {
          display: none;
        }

        .nav-links.open,
        .filter-wrap.open,
        .auth-section.open {
          display: flex;
        }

        .nav-links.open {
          flex-direction: column;
          align-items: flex-start;
          margin-top: 8px;
        }

        .filter-wrap.open {
          justify-content: flex-start;
          margin-top: 8px;
        }

        .auth-section.open {
          justify-content: flex-start;
          align-items: center;
          margin-top: 8px;
        }

        .spacer {
          flex: 0;
        }

        .hamburger {
          display: flex;
          margin-left: auto;
        }
      }
    `,
  ],
  template: `
    <nav>
      <a routerLink="/" class="brand">CATALOG</a>

      <!-- Hamburger button (mobile only via CSS) -->
      <div class="hamburger" (click)="toggleMenu()">
        <span></span>
        <span></span>
        <span></span>
      </div>

      <span class="spacer"></span>

      <!-- Main nav links -->
      <div class="nav-links" [ngClass]="{ open: isMenuOpen }">
        <ng-container *ngIf="auth.isAdmin()">
          <a routerLink="/films" (click)="closeMenu()">Films</a>
          <a routerLink="/series" (click)="closeMenu()">Series</a>
          <a routerLink="/trailers" (click)="closeMenu()">Trailers</a>
          <a routerLink="/comments" (click)="closeMenu()">Comments</a>
          <a routerLink="/ratings" (click)="closeMenu()">Ratings</a>
        </ng-container>

        <a
          routerLink="/payments"
          *ngIf="auth.isLoggedIn()"
          (click)="closeMenu()"
        >
          My Payments
        </a>
        <a
          routerLink="/profile"
          *ngIf="auth.isLoggedIn()"
          (click)="closeMenu()"
        >
          My Profile
        </a>
      </div>

      <!-- Filter -->
      <div class="filter-wrap" [ngClass]="{ open: isMenuOpen }">
        <input
          placeholder="Search films..."
          [(ngModel)]="filter.searchValue"
        />
        <button type="button" (click)="filter.togglePanel()">Filter</button>

        <div class="filter-popup" *ngIf="filter.showPanel()">
          <app-filter-panel></app-filter-panel>
        </div>
      </div>

      <!-- Auth / user section -->
      <div
        class="auth-section"
        [ngClass]="{ open: isMenuOpen }"
        style="display: flex; align-items: center; margin-left: 15px;"
      >
        <span *ngIf="!auth.isLoggedIn()">
          <a routerLink="/login" (click)="closeMenu()">Login</a>
          <span style="margin: 0 5px; color: #666;">|</span>
          <a routerLink="/register" (click)="closeMenu()">Register</a>
        </span>

        <div *ngIf="auth.isLoggedIn()" style="display: flex; align-items: center;">
          <div class="user-info">
            <span>
              <span *ngIf="auth.isAdmin()" class="admin-badge">(ADMIN)</span>
              {{ auth.currentUser?.name || 'User' }}
            </span>
            <span class="user-email">{{ auth.user()?.email }}</span>
          </div>
          <button (click)="logout()">Logout</button>
        </div>
      </div>
    </nav>
  `,
})
export class NavbarComponent {
  isMenuOpen = false;

  constructor(public auth: AuthService, public filter: FilterService) {}

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  logout() {
    this.auth.logout();
    this.closeMenu();
  }
}
