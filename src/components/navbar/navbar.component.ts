import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, NgIf],
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
      }
      .spacer {
        flex: 1;
      }
      button {
        padding: 6px 10px;
      }
    `,
  ],
  template: `
    <nav>
      <a routerLink="/">CATALOG</a>
      <a routerLink="/films">Films (CRUD)</a>
      <a routerLink="/series">Series (CRUD)</a>
      <a routerLink="/trailers">Trailers (CRUD)</a>
      <a routerLink="/comments">Comments (CRUD)</a>
      <a routerLink="/ratings">Ratings (CRUD)</a>
      <input placeholder="search for the film">
      <button type="button">filter</button>
      <span class="spacer"></span>

      <span *ngIf="!auth.isLoggedIn()">
        <a routerLink="/login">Login</a> |
        <a routerLink="/register">Register</a>
      </span>
      <span *ngIf="auth.isLoggedIn()">
        Logged in as <strong>{{ auth.user() }}</strong>
        <button (click)="auth.logout()">Logout</button>
      </span>
    </nav>
  `,
})
export class NavbarComponent {
  constructor(public auth: AuthService) {}
}
