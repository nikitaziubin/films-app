import { Component, computed, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop'; // Added import
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { Film, Trailer, Rating, Comment, Series } from '../../models';
import { MessageService } from '../../services/message.service';

type Entity = 'films' | 'trailers' | 'ratings' | 'comments' | 'series';
@Component({
  standalone: true,
  selector: 'app-admin-list',
  imports: [CommonModule, FormsModule],
  styles: [
    `
      .layout {
        display: grid;
        gap: 16px;
        grid-template-columns: 1fr 1fr;
      }
      .panel {
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 12px;
        background: #fff;
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th,
      td {
        border-bottom: 1px solid #eee;
        padding: 6px;
        text-align: left;
      }
      input,
      textarea,
      select {
        width: 100%;
        padding: 6px;
        margin-bottom: 8px;
      }
      .actions {
        display: flex;
        gap: 8px;
      }
      .muted {
        color: #666;
      }
      .checkbox-field {
        display: flex;
        align-items: center;
        gap: 6px;
        margin: 8px 0;
      }
      .checkbox-field input[type='checkbox'] {
        width: auto;
        margin: 0;
      }
      .checkbox-field label {
        margin: 0;
        font-size: 0.95em;
      }
      .error {
        color: #b00020;
        font-size: 12px;
        margin-top: -4px;
        margin-bottom: 6px;
      }
      .confirm-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1100;
      }

      .confirm-dialog {
        background: #222;
        color: #fff;
        padding: 16px 20px 18px;
        border-radius: 10px;
        min-width: 280px;
        max-width: 90vw;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
        border: 1px solid #333;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI',
          sans-serif;
      }

      .confirm-header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 8px;
      }

      .confirm-header h3 {
        flex: 1;
        margin: 0;
        font-size: 1rem;
      }

      .icon-circle {
        width: 32px;
        height: 32px;
        border-radius: 999px;
        background: rgba(255, 160, 0, 0.15);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .icon-warning {
        width: 20px;
        height: 20px;
        color: #ffca28; /* amber */
      }

      .close-btn {
        background: transparent;
        border: none;
        padding: 0;
        margin: 0;
        cursor: pointer;
        color: #aaa;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      .close-btn:hover {
        color: #fff;
      }

      .icon-close {
        width: 18px;
        height: 18px;
      }

      .confirm-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
      }

      .btn-cancel,
      .btn-delete {
        padding: 6px 12px;
        border-radius: 6px;
        font-size: 0.9rem;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        cursor: pointer;
        border: 1px solid transparent;
      }

      .btn-cancel {
        background: #333;
        color: #eee;
        border-color: #555;
      }

      .btn-delete {
        background: #c62828;
        color: #fff;
        border-color: #e53935;
      }

      .btn-cancel:hover {
        background: #444;
      }

      .btn-delete:hover {
        background: #b71c1c;
      }

      .icon-trash {
        width: 16px;
        height: 16px;
      }
      .confirm-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1100;
      }

      /* base dialog styles (your existing ones) */
      .confirm-dialog {
        background: #222;
        color: #fff;
        padding: 16px 20px 18px;
        border-radius: 10px;
        min-width: 280px;
        max-width: 90vw;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
        border: 1px solid #333;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI',
          sans-serif;

        /* --- animation part --- */
        transform-origin: top center; /* like a door hinged at the top */
        transform: scaleY(0.2); /* start squashed vertically */
        opacity: 0;
        animation: doorOpen 250ms ease-out forwards;
      }

      @keyframes doorOpen {
        from {
          transform: scaleY(0.2);
          opacity: 0;
        }
        to {
          transform: scaleY(1);
          opacity: 1;
        }
      }
    `,
  ],
  template: `
    <h2 class="muted">Admin {{ entity() | titlecase }}</h2>
    <div class="layout">
      <div class="panel">
        <h3>List</h3>
        <table *ngIf="entity() === 'films'">
          <tr>
            <th>Name</th>
            <th>Lang</th>
            <th>Duration</th>
            <th>Age Limit</th>
            <th>Budget</th>
            <th>Film cost</th>
            <th>Series</th>
            <th>Production Company</th>
            <th>Genres</th>
            <th></th>
          </tr>
          <tr
            *ngFor="let x of regularFilms()"
            (click)="select(x)"
            [style.cursor]="'pointer'"
          >
            <td>{{ x.name }}</td>
            <td>{{ x.language }}</td>
            <td>{{ x.duration }}</td>
            <td>{{ x.ageLimit }}</td>
            <td>{{ x.budget }}</td>
            <td>{{ x.filmPrice }} €</td>
            <td>{{ x.series?.name || '—' }}</td>
            <td>{{ x.productionCompany?.name }}</td>
            <td>{{ getGenreNames(x) }}</td>
            <td class="actions">
              <button (click)="edit(x, $event)">Edit</button>
              <button (click)="remove('films', x.id, $event)">Delete</button>
            </td>
          </tr>
        </table>

        <table *ngIf="entity() === 'series'">
          <tr>
            <th>Name</th>
            <th>Status</th>
            <th>Expected number of episodes</th>
            <th>Country</th>
            <th>Production Company</th>
            <th>Current number of episodes</th>
            <th></th>
          </tr>
          <tr
            *ngFor="let x of seriesList()"
            (click)="select(x)"
            [style.cursor]="'pointer'"
          >
            <td>{{ x.name }}</td>
            <td>{{ x.status }}</td>
            <td>{{ x.numberOfEpisodes }}</td>
            <td>{{ x.countryOfProduction }}</td>
            <td>{{ x.productionCompanyName }}</td>
            <td>{{ x.films?.length || 0 }}</td>
            <td class="actions">
              <button (click)="edit(x, $event)">Edit</button>
              <button (click)="remove('series', x.id, $event)">Delete</button>
            </td>
          </tr>
        </table>

        <table *ngIf="entity() === 'trailers'">
          <tr>
            <th>Title</th>
            <th>Film name</th>
            <th>Film id</th>
            <th>URL</th>
            <th>Duration</th>
            <th>Age Limit</th>
            <th></th>
          </tr>
          <tr *ngFor="let x of trailers()" (click)="select(x)">
            <td>{{ x.title }}</td>
            <td>{{ x.film?.name }}</td>
            <td>{{ x.film?.id }}</td>
            <td>{{ x.trailerUrl }}</td>
            <td>{{ x.duration }}</td>
            <td>{{ x.ageLimit }}</td>

            <td class="actions">
              <button (click)="edit(x, $event)">Edit</button>
              <button (click)="remove('trailers', x.id, $event)">Delete</button>
            </td>
          </tr>
        </table>

        <table *ngIf="entity() === 'ratings'">
          <tr>
            <th>Film name</th>
            <th>Film id</th>
            <th>User name</th>
            <th>User email</th>
            <th>Rating</th>
            <th>Date</th>
            <th></th>
          </tr>
          <tr *ngFor="let x of ratings()" (click)="select(x)">
            <td>{{ x.film?.name }}</td>
            <td>{{ x.film?.id }}</td>
            <td>{{ x.user?.name }}</td>
            <td>{{ x.user?.email }}</td>
            <td>⭐ {{ x.rating }}</td>
            <td>{{ x.dateOfPublish | date : 'yyyy-MM-dd HH:mm' }}</td>
            <td class="actions">
              <button (click)="edit(x, $event)">Edit</button>
              <button (click)="remove('ratings', x.id, $event)">Delete</button>
            </td>
          </tr>
        </table>

        <table *ngIf="entity() === 'comments'">
          <tr>
            <th>Film name</th>
            <th>Film id</th>
            <th>User name</th>
            <th>User email</th>
            <th>Text</th>
            <th>Spoiler</th>
            <th>Language</th>
            <th></th>
          </tr>
          <tr *ngFor="let x of comments()" (click)="select(x)">
            <td>{{ x.film?.name }}</td>
            <td>{{ x.film?.id }}</td>
            <td>{{ x.user?.name }}</td>
            <td>{{ x.user?.email }}</td>
            <td>{{ x.textOfComment | slice : 0 : 30 }}...</td>
            <td>{{ x.spoiler ? 'Yes' : 'No' }}</td>
            <td>{{ x.language }}</td>
            <td class="actions">
              <button (click)="edit(x, $event)">Edit</button>
              <button (click)="remove('comments', x.id, $event)">Delete</button>
            </td>
          </tr>
        </table>
      </div>

      <div class="panel">
        <h3>Attributes / Editor</h3>

        <!-- FILM FORM -->
        <form *ngIf="entity() === 'films'" #filmForm="ngForm">
          <input
            placeholder="Name"
            [(ngModel)]="film.name"
            name="fname"
            required
            #fname="ngModel"
          />
          <div
            class="error"
            *ngIf="fname.invalid && (fname.dirty || fname.touched)"
          >
            Name is required.
          </div>
          <input
            placeholder="Language"
            [(ngModel)]="film.language"
            name="flang"
            required
            #flang="ngModel"
          />
          <div
            class="error"
            *ngIf="flang.invalid && (flang.dirty || flang.touched)"
          >
            Language is required.
          </div>
          <input
            placeholder="Duration"
            [(ngModel)]="film.duration"
            name="fdur"
            required
            #fdur="ngModel"
          />
          <div
            class="error"
            *ngIf="fdur.invalid && (fdur.dirty || fdur.touched)"
          >
            Duration is required.
          </div>
          <input
            placeholder="Quality"
            [(ngModel)]="film.quality"
            name="fqual"
            required
            #fqual="ngModel"
          />
          <div
            class="error"
            *ngIf="fqual.invalid && (fqual.dirty || fqual.touched)"
          >
            Quality is required.
          </div>
          <input
            placeholder="Preview Photo URL"
            [(ngModel)]="film.previewPhoto"
            name="fpreview"
            required
            #fpreview="ngModel"
          />
          <div
            class="error"
            *ngIf="fpreview.invalid && (fpreview.dirty || fpreview.touched)"
          >
            <span *ngIf="fpreview.errors?.['required']"
              >Preview URL is required.</span
            >
            <span *ngIf="fpreview.errors?.['pattern']">
              Please enter a valid http/https URL.
            </span>
          </div>
          <input
            placeholder="Age Limit"
            [(ngModel)]="film.ageLimit"
            name="fage"
            required
            #fage="ngModel"
          />
          <div
            class="error"
            *ngIf="fage.invalid && (fage.dirty || fage.touched)"
          >
            Age limit is required.
          </div>
          <input
            type="date"
            [(ngModel)]="film.dateOfPublish"
            name="fdate"
            required
            #fdate="ngModel"
          />
          <div
            class="error"
            *ngIf="fdate.invalid && (fdate.dirty || fdate.touched)"
          >
            Publish date is required.
          </div>
          <input
            type="number"
            placeholder="Budget"
            [(ngModel)]="film.budget"
            name="fbud"
            required
            min="0.01"
            #fbud="ngModel"
          />
          <div
            class="error"
            *ngIf="fbud.invalid && (fbud.dirty || fbud.touched)"
          >
            <span *ngIf="fbud.errors?.['required']">Budget is required.</span>
            <span *ngIf="fbud.errors?.['min']">Budget must be positive.</span>
          </div>
          <input
            type="number"
            placeholder="Film price"
            [(ngModel)]="film.filmPrice"
            name="fprice"
            required
            min="0.01"
            #fprice="ngModel"
          />
          <div
            class="error"
            *ngIf="fprice.invalid && (fprice.dirty || fprice.touched)"
          >
            <span *ngIf="fprice.errors?.['required']"
              >Film price is required.</span
            >
            <span *ngIf="fprice.errors?.['min']"
              >Film price must be positive.</span
            >
          </div>
          <label>
            Series
            <select [(ngModel)]="film.seriesId" name="fseries">
              <option [ngValue]="null">-- standalone film --</option>
              <option *ngFor="let s of seriesList()" [ngValue]="s.id">
                {{ s.name }}
              </option>
            </select>
          </label>
          <label>
            Production company
            <select
              [(ngModel)]="film.productionCompanyId"
              name="fprod"
              required
              #fprod="ngModel"
            >
              <option [ngValue]="null">-- select --</option>
              <option
                *ngFor="let pc of productionCompanies()"
                [ngValue]="pc.id"
              >
                {{ pc.name }} ({{ pc.country }})
              </option>
            </select>
          </label>
          <div
            class="error"
            *ngIf="fprod.invalid && (fprod.dirty || fprod.touched)"
          >
            Production company is required.
          </div>
          <label>
            Genres
            <select
              multiple
              [(ngModel)]="film.genreIds"
              name="fgenres"
              #fgenres="ngModel"
              (change)="onGenresChange()"
            >
              <option *ngFor="let g of genres()" [ngValue]="g.id">
                {{ g.genreName }}
              </option>
            </select>
          </label>
          <div class="error" *ngIf="genresError">
            Select at least one genre.
          </div>
          <div class="actions">
            <button
              type="button"
              (click)="onSaveFilm(filmForm)"
              [disabled]="filmForm.invalid || genresError"
            >
              {{ film.id ? 'Update' : 'Create' }}
            </button>
            <button type="button" (click)="clear()">Clear</button>
          </div>
        </form>
        <!-- SERIES FORM -->
        <form *ngIf="entity() === 'series'" #seriesForm="ngForm">
          <input
            placeholder="Name"
            [(ngModel)]="series.name"
            name="sname"
            required
            #sname="ngModel"
          />
          <div
            class="error"
            *ngIf="sname.invalid && (sname.dirty || sname.touched)"
          >
            Name is required.
          </div>
          <input
            placeholder="Age Limit"
            [(ngModel)]="series.ageLimit"
            name="sage"
            required
            #sage="ngModel"
          />
          <div
            class="error"
            *ngIf="sage.invalid && (sage.dirty || sage.touched)"
          >
            Age limit is required.
          </div>
          <input
            type="date"
            placeholder="Date of publish"
            [(ngModel)]="series.dateOfPublish"
            name="sdofpub"
            required
            #sdofpub="ngModel"
          />
          <div
            class="error"
            *ngIf="sdofpub.invalid && (sdofpub.dirty || sdofpub.touched)"
          >
            Date of publish is required.
          </div>
          <input
            placeholder="Country of production"
            [(ngModel)]="series.countryOfProduction"
            name="scofprod"
            required
            #scofprod="ngModel"
          />
          <div
            class="error"
            *ngIf="scofprod.invalid && (scofprod.dirty || scofprod.touched)"
          >
            Country of production is required.
          </div>
          <input
            placeholder="Production company"
            [(ngModel)]="series.productionCompanyName"
            name="spcom"
            required
            #spcom="ngModel"
          />
          <div
            class="error"
            *ngIf="spcom.invalid && (spcom.dirty || spcom.touched)"
          >
            Production company is required.
          </div>
          <input
            placeholder="Status"
            [(ngModel)]="series.status"
            name="sstat"
            required
            #sstat="ngModel"
          />
          <div
            class="error"
            *ngIf="sstat.invalid && (sstat.dirty || sstat.touched)"
          >
            Status is required.
          </div>
          <input
            type="number"
            placeholder="Number of episodes"
            [(ngModel)]="series.numberOfEpisodes"
            name="snumofeps"
            required
            min="1"
            #snumofeps="ngModel"
          />
          <div
            class="error"
            *ngIf="snumofeps.invalid && (snumofeps.dirty || snumofeps.touched)"
          >
            <span *ngIf="snumofeps.errors?.['required']">
              Number of episodes is required.
            </span>
            <span *ngIf="snumofeps.errors?.['min']"> Must be at least 1. </span>
          </div>
          <div class="actions">
            <button
              type="button"
              (click)="onSaveSeries(seriesForm)"
              [disabled]="seriesForm.invalid"
            >
              {{ series.id ? 'Update' : 'Create' }}
            </button>
            <button type="button" (click)="clear()">Clear</button>
          </div>
        </form>

        <!-- TRAILER FORM -->
        <form *ngIf="entity() === 'trailers'" #trailerForm="ngForm">
          <input
            placeholder="Title"
            [(ngModel)]="trailer.title"
            name="ttitle"
            required
            #ttitle="ngModel"
          />
          <div
            class="error"
            *ngIf="ttitle.invalid && (ttitle.dirty || ttitle.touched)"
          >
            Title is required.
          </div>
          <input
            placeholder="URL"
            [(ngModel)]="trailer.trailerUrl"
            name="turl"
            required
            pattern="https?://.+"
            #turl="ngModel"
          />
          <div
            class="error"
            *ngIf="turl.invalid && (turl.dirty || turl.touched)"
          >
            <span *ngIf="turl.errors?.['required']">URL is required.</span>
            <span *ngIf="turl.errors?.['pattern']"
              >Enter a valid http/https URL.</span
            >
          </div>
          <input
            placeholder="Duration"
            [(ngModel)]="trailer.duration"
            name="tdur"
            required
            #tdur="ngModel"
          />
          <div
            class="error"
            *ngIf="tdur.invalid && (tdur.dirty || tdur.touched)"
          >
            Duration is required.
          </div>
          <input
            placeholder="Age Limit"
            [(ngModel)]="trailer.ageLimit"
            name="tage"
            required
            #tage="ngModel"
          />
          <div
            class="error"
            *ngIf="tage.invalid && (tage.dirty || tage.touched)"
          >
            Age limit is required.
          </div>
          <label>
            Film
            <select
              [(ngModel)]="trailer.filmId"
              name="tfilm"
              required
              #tfilm="ngModel"
            >
              <option [ngValue]="null">-- select film --</option>
              <option *ngFor="let f of regularFilms()" [ngValue]="f.id">
                {{ f.name }} (ID: {{ f.id }})
              </option>
            </select>
          </label>
          <div
            class="error"
            *ngIf="tfilm.invalid && (tfilm.dirty || tfilm.touched)"
          >
            Film is required.
          </div>

          <div class="actions">
            <button
              type="button"
              (click)="onSaveTrailer(trailerForm)"
              [disabled]="trailerForm.invalid"
            >
              {{ trailer.id ? 'Update' : 'Create' }}
            </button>
            <button type="button" (click)="clear()">Clear</button>
          </div>
        </form>

        <!-- RATING FORM -->
        <form *ngIf="entity() === 'ratings'" #ratingForm="ngForm">
          <div class="muted" *ngIf="rating.id">
            Editing rating #{{ rating.id }}
          </div>

          <label>
            Film
            <select
              [(ngModel)]="rating.filmId"
              name="rfilm"
              required
              #rfilm="ngModel"
            >
              <option [ngValue]="null">-- select film --</option>
              <option *ngFor="let f of regularFilms()" [ngValue]="f.id">
                {{ f.name }} (ID: {{ f.id }})
              </option>
            </select>
          </label>
          <div
            class="error"
            *ngIf="rfilm.invalid && (rfilm.dirty || rfilm.touched)"
          >
            Film is required.
          </div>

          <label>
            User
            <select
              [(ngModel)]="rating.userId"
              name="ruser"
              required
              #ruser="ngModel"
            >
              <option [ngValue]="null">-- select user --</option>
              <option *ngFor="let u of users()" [ngValue]="u.id">
                {{ u.name }} ({{ u.email }})
              </option>
            </select>
          </label>
          <div
            class="error"
            *ngIf="ruser.invalid && (ruser.dirty || ruser.touched)"
          >
            User is required.
          </div>

          <input
            type="number"
            min="1"
            max="5"
            placeholder="1..5"
            [(ngModel)]="rating.rating"
            name="rr"
            required
            #rr="ngModel"
          />
          <div class="error" *ngIf="rr.invalid && (rr.dirty || rr.touched)">
            <span *ngIf="rr.errors?.['required']">Rating is required.</span>
            <span *ngIf="rr.errors?.['min']">Minimum rating is 1.</span>
            <span *ngIf="rr.errors?.['max']">Maximum rating is 5.</span>
          </div>

          <div class="actions">
            <button
              type="button"
              (click)="onSaveRating(ratingForm)"
              [disabled]="ratingForm.invalid"
            >
              {{ rating.id ? 'Update' : 'Create' }}
            </button>
            <button type="button" (click)="clear()">Clear</button>
          </div>
        </form>

        <!-- COMMENT FORM -->
        <form *ngIf="entity() === 'comments'" #commentForm="ngForm">
          <textarea
            placeholder="Text"
            [(ngModel)]="comment.textOfComment"
            name="ctext"
            required
            #ctext="ngModel"
          ></textarea>
          <div
            class="error"
            *ngIf="ctext.invalid && (ctext.dirty || ctext.touched)"
          >
            Text is required.
          </div>

          <div class="checkbox-field">
            <input type="checkbox" [(ngModel)]="comment.spoiler" name="csp" />
            <label>spoiler</label>
          </div>

          <input
            placeholder="Language"
            [(ngModel)]="comment.language"
            name="clang"
            required
            #clang="ngModel"
          />
          <div
            class="error"
            *ngIf="clang.invalid && (clang.dirty || clang.touched)"
          >
            Language is required.
          </div>

          <label>
            Film
            <select
              [(ngModel)]="comment.filmId"
              name="cfilm"
              required
              #cfilm="ngModel"
            >
              <option [ngValue]="null">-- select film --</option>
              <option *ngFor="let f of regularFilms()" [ngValue]="f.id">
                {{ f.name }} (ID: {{ f.id }})
              </option>
            </select>
          </label>
          <div
            class="error"
            *ngIf="cfilm.invalid && (cfilm.dirty || cfilm.touched)"
          >
            Film is required.
          </div>

          <label>
            User
            <select
              [(ngModel)]="comment.userId"
              name="cuser"
              required
              #cuser="ngModel"
            >
              <option [ngValue]="null">-- select user --</option>
              <option *ngFor="let u of users()" [ngValue]="u.id">
                {{ u.name }} ({{ u.email }})
              </option>
            </select>
          </label>
          <div
            class="error"
            *ngIf="cuser.invalid && (cuser.dirty || cuser.touched)"
          >
            User is required.
          </div>

          <div class="actions">
            <button
              type="button"
              (click)="onSaveComment(commentForm)"
              [disabled]="commentForm.invalid"
            >
              {{ comment.id ? 'Update' : 'Create' }}
            </button>
            <button type="button" (click)="clear()">Clear</button>
          </div>
        </form>
      </div>
    </div>
    <div
      *ngIf="confirmDelete.show"
      class="confirm-backdrop"
      (click)="confirmDeleteCancel()"
    >
      <div class="confirm-dialog" (click)="$event.stopPropagation()">
        <div class="confirm-header">
          <div class="icon-circle">
            <svg viewBox="0 0 24 24" class="icon-warning" aria-hidden="true">
              <path
                fill="currentColor"
                d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"
              ></path>
            </svg>
          </div>
          <h3>Confirm deletion</h3>
          <button
            type="button"
            class="close-btn"
            (click)="confirmDeleteCancel()"
            aria-label="Close"
          >
            <svg viewBox="0 0 24 24" class="icon-close">
              <path
                fill="currentColor"
                d="M18.3 5.71L12 12.01 5.7 5.7 4.29 7.11 10.59 13.4 4.3 19.7 5.71 21.11 12 14.82l6.29 6.29 1.41-1.41-6.29-6.29 6.29-6.29z"
              />
            </svg>
          </button>
        </div>

        <p>
          Are you sure you want to delete this
          {{ confirmDelete.kind }} item?
        </p>

        <div class="confirm-actions">
          <button
            type="button"
            class="btn-cancel"
            (click)="confirmDeleteCancel()"
          >
            Cancel
          </button>
          <button type="button" class="btn-delete" (click)="confirmDeleteYes()">
            <svg viewBox="0 0 24 24" class="icon-trash">
              <path
                fill="currentColor"
                d="M9 3v1H4v2h1v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6h1V4h-5V3H9zm2 4h2v10h-2V7zm-3 0h2v10H8V7zm8 0h-2v10h2V7z"
              />
            </svg>
            Delete
          </button>
        </div>
      </div>
    </div>
  `,
})
export class AdminListComponent {
  entity = signal<Entity>('films');
  selected: any = null;

  // working models
  film: Partial<Film> & {
    seriesId?: number | null;
    productionCompanyId?: number | null;
    genreIds?: number[];
  } = {};
  series: Partial<Series> = {};
  trailer: Partial<Trailer> & { filmId?: number | null } = {};
  rating: Partial<Rating> & {
    filmId?: number | null;
    userId?: number | null;
  } = {};

  comment: Partial<Comment> & {
    filmId?: number | null;
    userId?: number | null;
  } = {};
  confirmDelete = {
    show: false,
    kind: null as Entity | null,
    id: null as number | null,
  };

  // Signals for data
  private allFilms = toSignal(this.data.films$, { initialValue: [] });
  productionCompanies = toSignal(this.data.productionCompanies$, {
    initialValue: [],
  });
  genres = toSignal(this.data.genres$, { initialValue: [] });

  serieFilms = computed(() => {
    const all = this.allFilms();
    // Check if series object is present (not null/undefined)
    return all.filter((film) => !!film.series);
  });

  regularFilms = computed(() => {
    const all = this.allFilms();
    // Check if series object is missing
    return all;
  });

  // Use toSignal for series list
  seriesList = toSignal(this.data.series$, { initialValue: [] });
  trailers = toSignal(this.data.trailers$, { initialValue: [] });
  ratings = toSignal(this.data.ratings$, { initialValue: [] });
  comments = toSignal(this.data.comments$, { initialValue: [] });
  users = toSignal(this.data.users$, { initialValue: [] });

  constructor(
    public data: DataService,
    private route: ActivatedRoute,
    private messageService: MessageService
  ) {
    this.route.data.subscribe((d) => {
      const e = (d['entity'] ?? 'films') as Entity;
      this.entity.set(e);
      this.clear();
    });
  }

  select(item: any) {
    this.selected = item;
  }

  edit(item: any, ev?: Event) {
    ev?.stopPropagation();
    switch (this.entity()) {
      case 'films':
        this.film = {
          ...item,
          seriesId: item.series?.id ?? null,
          productionCompanyId: item.productionCompany?.id ?? null,
          genreIds: item.genres ? item.genres.map((g: any) => g.id) : [],
        };
        break;
      case 'series':
        this.series = { ...item };
        break;
      case 'trailers':
        this.trailer = {
          ...item,
          filmId: item.film?.id ?? null,
        };
        break;
      case 'ratings':
        this.rating = {
          ...item,
          filmId: item.film?.id ?? null,
          userId: item.user?.id ?? null,
        };
        break;
      case 'comments':
        this.comment = {
          ...item,
          filmId: item.film?.id ?? null,
          userId: item.user?.id ?? null,
        };
        break;
    }
  }

  clear() {
    this.selected = null;
    this.film = { genreIds: [] };
    this.series = {};
    this.trailer = {};
    this.rating = { rating: 5 };
    this.comment = {};
  }

  // remove(kind: Entity, id: number, ev?: Event) {
  //   ev?.stopPropagation();
  //   if (!confirm('Are you sure you want to delete?')) return;
  //   if (kind === 'films') this.data.deleteFilm(id);
  //   if (kind === 'series') this.data.deleteSeries(id);
  //   if (kind === 'trailers') this.data.deleteTrailer(id);
  //   if (kind === 'ratings') this.data.deleteRating(id);
  //   if (kind === 'comments') this.data.deleteComment(id);
  //   this.clear();
  // }

  confirmDeleteYes() {
    if (!this.confirmDelete.kind || this.confirmDelete.id == null) {
      this.confirmDeleteCancel();
      return;
    }

    const { kind, id } = this.confirmDelete;

    if (kind === 'films') this.data.deleteFilm(id);
    if (kind === 'series') this.data.deleteSeries(id);
    if (kind === 'trailers') this.data.deleteTrailer(id);
    if (kind === 'ratings') this.data.deleteRating(id);
    if (kind === 'comments') this.data.deleteComment(id);

    this.clear();
    this.confirmDeleteCancel();
    this.messageService.success('Item deleted successfully.');
  }
  remove(kind: Entity, id: number, ev?: Event) {
    ev?.stopPropagation();
    this.confirmDelete = { show: true, kind, id };
  }
  // user cancels deletion
  confirmDeleteCancel() {
    this.confirmDelete = { show: false, kind: null, id: null };
  }

  // saves
  saveFilm() {
    const f = this.film as Film & {
      seriesId?: number | null;
      productionCompanyId?: number | null;
      genreIds?: number[];
    };

    const payload: any = {
      name: f.name!,
      language: f.language,
      duration: f.duration,
      quality: f.quality,
      previewPhoto: f.previewPhoto,
      ageLimit: f.ageLimit,
      dateOfPublish: f.dateOfPublish,
      budget: f.budget,
      filmPrice: f.filmPrice,
      description: f.description,
    };

    if (f.seriesId != null) {
      payload.series = { id: f.seriesId };
    } else {
      payload.series = null;
    }

    if (f.productionCompanyId != null) {
      payload.productionCompany = { id: f.productionCompanyId };
    } else {
      payload.productionCompany = null;
    }

    if (f.genreIds && f.genreIds.length > 0) {
      payload.genres = f.genreIds.map((id) => ({ id }));
    } else {
      payload.genres = [];
    }

    if (f.id) {
      payload.id = f.id;
      this.data.updateFilm(payload);
    } else {
      this.data.addFilm(payload);
    }

    this.clear();
  }

  saveSeries() {
    const s = this.series as Series;

    const payload: any = {
      name: s.name,
      ageLimit: s.ageLimit,
      dateOfPublish: s.dateOfPublish,
      countryOfProduction: s.countryOfProduction,
      productionCompanyName: s.productionCompanyName,
      status: s.status,
      numberOfEpisodes: s.numberOfEpisodes,
    };

    if (s.id) {
      payload.id = s.id;
      this.data.updateSeries(payload);
    } else {
      this.data.addSeries(payload);
    }
    this.clear();
  }

  saveTrailer() {
    const t = this.trailer as Trailer & { filmId?: number | null };

    if (!t.filmId) {
      this.messageService.error('Please select a film for the trailer.');
      return;
    }

    const payload: any = {
      title: t.title!,
      trailerUrl: t.trailerUrl!,
      duration: t.duration,
      ageLimit: t.ageLimit,
      film: { id: t.filmId },
    };

    if (t.id) {
      payload.id = t.id;
      this.data.updateTrailer(payload);
    } else {
      this.data.addTrailer(payload);
    }

    this.clear();
  }

  saveRating() {
    const r = this.rating as Rating & {
      filmId?: number | null;
      userId?: number | null;
    };

    if (!r.filmId) {
      this.messageService.error('Please select a film for the rating.');
      return;
    }
    if (!r.userId) {
      this.messageService.error('Please select a user for the rating.');
      return;
    }

    const payload: any = {
      rating: r.rating,
      film: { id: r.filmId },
      user: { id: r.userId },
    };

    if (r.id) {
      payload.id = r.id;
      this.data.updateRating(payload);
    } else {
      this.data.addRating(payload);
    }

    this.clear();
  }

  saveComment() {
    const c = this.comment as Comment & {
      filmId?: number | null;
      userId?: number | null;
    };

    if (!c.filmId) {
      this.messageService.error('Please select a film for the comment.');
      return;
    }
    if (!c.userId) {
      this.messageService.error('Please select a user for the comment.');
      return;
    }

    const payload: any = {
      textOfComment: c.textOfComment,
      spoiler: !!c.spoiler,
      language: c.language,
      film: { id: c.filmId },
      user: { id: c.userId },
    };

    if (c.id) {
      payload.id = c.id;
      this.data.updateComment(payload);
    } else {
      this.data.addComment(payload);
    }

    this.clear();
  }
  getGenreNames(film: any): string {
    return (film.genres || []).map((g: any) => g.genreName).join(', ');
  }
  genresError = false;

  onGenresChange() {
    const ids = this.film.genreIds || [];
    this.genresError = !ids || ids.length === 0;
  }

  onSaveFilm(form: any) {
    if (form.invalid || this.genresError) {
      form.control.markAllAsTouched();
      return;
    }
    this.saveFilm();
  }
  onSaveSeries(form: any) {
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }
    this.saveSeries();
  }
  onSaveTrailer(form: any) {
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }
    this.saveTrailer();
  }
  onSaveRating(form: any) {
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }
    this.saveRating();
  }
  onSaveComment(form: any) {
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }
    this.saveComment();
  }
}
