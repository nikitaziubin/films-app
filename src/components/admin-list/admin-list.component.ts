import { Component, computed, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { Film, Trailer, Rating, Comment, Series } from '../../models';

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
            <th>Description</th>
            <th></th>
          </tr>
          <tr
            *ngFor="let x of data.films$.value"
            (click)="select(x)"
            [style.cursor]="'pointer'"
          >
            <td>{{ x.name }}</td>
            <td>{{ x.language }}</td>
            <td>{{ x.duration }}</td>
            <td>{{ x.description }}</td>
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
            <th>Episodes</th>
            <th></th>
          </tr>
          <tr
            *ngFor="let x of seriesList()"
            (click)="select(x)"
            [style.cursor]="'pointer'"
          >
            <td>{{ x.name }}</td>
            <td>{{ x.status }}</td>
            <td>{{ x.filmIds }}</td>
            <td class="actions">
              <button (click)="edit(x, $event)">Edit</button>
              <button (click)="remove('series', x.id, $event)">Delete</button>
            </td>
          </tr>
        </table>

        <table *ngIf="entity() === 'trailers'">
          <tr>
            <th>Title</th>
            <th>FilmId</th>
            <th>URL</th>
            <th></th>
          </tr>
          <tr *ngFor="let x of data.trailers$.value" (click)="select(x)">
            <td>{{ x.title }}</td>
            <td>{{ x.filmId }}</td>
            <td>{{ x.url }}</td>
            <td class="actions">
              <button (click)="edit(x, $event)">Edit</button>
              <button (click)="remove('trailers', x.id, $event)">Delete</button>
            </td>
          </tr>
        </table>

        <table *ngIf="entity() === 'ratings'">
          <tr>
            <th>FilmId</th>
            <th>User</th>
            <th>Rating</th>
            <th></th>
          </tr>
          <tr *ngFor="let x of data.ratings$.value" (click)="select(x)">
            <td>{{ x.filmId }}</td>
            <td>{{ x.user }}</td>
            <td>⭐ {{ x.rating }}</td>
            <td class="actions">
              <button (click)="edit(x, $event)">Edit</button>
              <button (click)="remove('ratings', x.id, $event)">Delete</button>
            </td>
          </tr>
        </table>

        <table *ngIf="entity() === 'comments'">
          <tr>
            <th>FilmId</th>
            <th>User</th>
            <th>Text</th>
            <th></th>
          </tr>
          <tr *ngFor="let x of data.comments$.value" (click)="select(x)">
            <td>{{ x.filmId }}</td>
            <td>{{ x.user }}</td>
            <td>{{ x.text | slice : 0 : 30 }}...</td>
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
        <form *ngIf="entity() === 'films'">
          <input placeholder="Name" [(ngModel)]="film.name" name="fname" />
          <input
            placeholder="Language"
            [(ngModel)]="film.language"
            name="flang"
          />
          <input
            type="number"
            placeholder="Duration (min)"
            [(ngModel)]="film.duration"
            name="fdur"
          />
          <input
            placeholder="Quality"
            [(ngModel)]="film.quality"
            name="fqual"
          />
          <input
            type="number"
            placeholder="Budget"
            [(ngModel)]="film.budget"
            name="fbud"
          />
          <textarea
            placeholder="Description"
            [(ngModel)]="film.description"
            name="fdesc"
          ></textarea>
          <div class="checkbox-field">
            <input
              type="checkbox"
              [(ngModel)]="film.is_for_series"
              name="fisforseries"
            />
            <label> Is for series ? </label>
          </div>
          <div class="actions">
            <button type="button" (click)="saveFilm()">
              {{ film.id ? 'Update' : 'Create' }}
            </button>
            <button type="button" (click)="clear()">Clear</button>
          </div>
        </form>
        <!-- SERIES FORM -->
        <form *ngIf="entity() === 'series'">
          <input placeholder="Name" [(ngModel)]="series.name" name="fname" />
          <input
            type="date"
            placeholder="Date of publish"
            [(ngModel)]="series.date_of_publish"
            name="sdofpub"
          />
          <input
            placeholder="Country of production"
            [(ngModel)]="series.country_of_production"
            name="scofprod"
          />
          <input
            placeholder="Production company"
            [(ngModel)]="series.production_company"
            name="spcom"
          />
          <input
            placeholder="Status"
            [(ngModel)]="series.status"
            name="sstat"
          />
          <input
            type="number"
            placeholder="Number ofepisodes"
            [(ngModel)]="series.number_of_episodes"
            name="snumofeps"
          />
          <label>Select Films (Episodes):</label>
          <select
            multiple
            [(ngModel)]="series.filmIds"
            name="sfilms"
            style="height: 150px;"
          >
            <option *ngFor="let film of serieFilms()" [ngValue]="film.id">
              {{ film.name }} (ID: {{ film.id }})
            </option>
          </select>
          <div class="actions">
            <button type="button" (click)="saveSeries()">
              {{ series.id ? 'Update' : 'Create' }}
            </button>
            <button type="button" (click)="clear()">Clear</button>
          </div>
        </form>
        <!-- TRAILER FORM -->
        <form *ngIf="entity() === 'trailers'">
          <input
            type="number"
            placeholder="Film ID"
            [(ngModel)]="trailer.filmId"
            name="tfilm"
          />
          <input
            placeholder="Title"
            [(ngModel)]="trailer.title"
            name="ttitle"
          />
          <input placeholder="URL" [(ngModel)]="trailer.url" name="turl" />
          <input
            type="number"
            placeholder="Duration"
            [(ngModel)]="trailer.duration"
            name="tdur"
          />
          <div class="actions">
            <button type="button" (click)="saveTrailer()">
              {{ trailer.id ? 'Update' : 'Create' }}
            </button>
            <button type="button" (click)="clear()">Clear</button>
          </div>
        </form>

        <!-- RATING FORM -->
        <form *ngIf="entity() === 'ratings'">
          <input
            type="number"
            placeholder="Film ID"
            [(ngModel)]="rating.filmId"
            name="rfilm"
          />
          <input placeholder="User" [(ngModel)]="rating.user" name="ruser" />
          <input
            type="number"
            min="1"
            max="5"
            placeholder="1..5"
            [(ngModel)]="rating.rating"
            name="rr"
          />
          <input
            placeholder="Review title"
            [(ngModel)]="rating.reviewTitle"
            name="rrev"
          />
          <div class="actions">
            <button type="button" (click)="saveRating()">
              {{ rating.id ? 'Update' : 'Create' }}
            </button>
            <button type="button" (click)="clear()">Clear</button>
          </div>
        </form>

        <!-- COMMENT FORM -->
        <form *ngIf="entity() === 'comments'">
          <input
            type="number"
            placeholder="Film ID"
            [(ngModel)]="comment.filmId"
            name="cfilm"
          />
          <input placeholder="User" [(ngModel)]="comment.user" name="cuser" />
          <textarea
            placeholder="Text"
            [(ngModel)]="comment.text"
            name="ctext"
          ></textarea>
          <div class="checkbox-field">
            <input type="checkbox" [(ngModel)]="comment.spoiler" name="csp" />
            <label> spoiler</label>
          </div>

          <input
            placeholder="Language"
            [(ngModel)]="comment.language"
            name="clang"
          />
          <div class="actions">
            <button type="button" (click)="saveComment()">
              {{ comment.id ? 'Update' : 'Create' }}
            </button>
            <button type="button" (click)="clear()">Clear</button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class AdminListComponent {
  entity = signal<Entity>('films');
  selected: any = null;

  // working models
  film: Partial<Film> = {};
  series: Partial<Series> = {};
  trailer: Partial<Trailer> = {};
  rating: Partial<Rating> = { rating: 5 };
  comment: Partial<Comment> = {};
  serieFilms = computed(() => {
    const allFilms = this.data.films$.value;
    return allFilms.filter((film) => film.is_for_series === true);
  });
  regularFilms = computed(() => {
    return this.data.films$.value.filter((film) => !film.is_for_series);
  });
  seriesList = signal(this.data.series$.value);
  constructor(public data: DataService, private route: ActivatedRoute) {
    this.route.data.subscribe((d) => {
      const e = (d['entity'] ?? 'films') as Entity;
      this.entity.set(e);
      this.clear();
    });
    this.data.series$.subscribe((series) => this.seriesList.set(series));
  }

  select(item: any) {
    this.selected = item;
  }
  edit(item: any, ev?: Event) {
    ev?.stopPropagation();
    switch (this.entity()) {
      case 'films':
        this.film = { ...item };
        break;
      case 'series':
        this.series = { ...item };
        break;
      case 'trailers':
        this.trailer = { ...item };
        break;
      case 'ratings':
        this.rating = { ...item };
        break;
      case 'comments':
        this.comment = { ...item };
        break;
    }
  }
  clear() {
    this.selected = null;
    this.film = {};
    this.series = {};
    this.trailer = {};
    this.rating = { rating: 5 };
    this.comment = {};
  }
  remove(kind: Entity, id: number, ev?: Event) {
    ev?.stopPropagation();
    if (!confirm('Are you sure you want to delete?')) return;
    if (kind === 'films') this.data.deleteFilm(id);
    if (kind === 'series') this.data.deleteSeries(id);
    if (kind === 'trailers') this.data.deleteTrailer(id);
    if (kind === 'ratings') this.data.deleteRating(id);
    if (kind === 'comments') this.data.deleteComment(id);
    this.clear();
  }

  // saves
  saveFilm() {
    const f = this.film as Film;
    if (f.id) this.data.updateFilm(f);
    else
      this.data.addFilm({
        name: f.name!,
        language: f.language,
        duration: f.duration,
        quality: f.quality,
        budget: f.budget,
        description: f.description,
        is_for_series: f.is_for_series,
      });
    this.clear();
  }
  saveSeries() {
    const s = this.series as Series;
    if (s.id) this.data.updateSeries(s);
    else
      this.data.addSeries({
        name: s.name,
        date_of_publish: s.date_of_publish,
        country_of_production: s.country_of_production,
        production_company: s.production_company,
        status: s.status,
        number_of_episodes: s.number_of_episodes,
        filmIds: s.filmIds,
      });
    this.clear();
  }
  saveTrailer() {
    const t = this.trailer as Trailer;
    if (t.id) this.data.updateTrailer(t);
    else
      this.data.addTrailer({
        filmId: +t.filmId!,
        title: t.title!,
        url: t.url!,
        duration: t.duration,
        age: t.age,
      });
    this.clear();
  }
  saveRating() {
    const r = this.rating as Rating;
    if (r.id) this.data.updateRating(r);
    else
      this.data.addRating({
        filmId: +r.filmId!,
        user: r.user!,
        rating: +r.rating!,
        reviewTitle: r.reviewTitle,
      });
    this.clear();
  }
  saveComment() {
    const c = this.comment as Comment;
    if (c.id) this.data.updateComment(c);
    else
      this.data.addComment({
        filmId: +c.filmId!,
        user: c.user!,
        text: c.text!,
        spoiler: !!c.spoiler,
        language: c.language || 'EN',
      });
    this.clear();
  }
}
