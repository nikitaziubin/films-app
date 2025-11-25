import { Component, computed, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop'; // Added import
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
            <th>Age Limit</th>
            <th>Budget</th>
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
        <form *ngIf="entity() === 'films'">
          <input placeholder="Name" [(ngModel)]="film.name" name="fname" />
          <input
            placeholder="Language"
            [(ngModel)]="film.language"
            name="flang"
          />
          <input
            placeholder="Duration"
            [(ngModel)]="film.duration"
            name="fdur"
          />
          <input
            placeholder="Quality"
            [(ngModel)]="film.quality"
            name="fqual"
          />
          <input
            placeholder="Preview Photo URL"
            [(ngModel)]="film.previewPhoto"
            name="fpreview"
          />
          <input
            placeholder="Age Limit"
            [(ngModel)]="film.ageLimit"
            name="fage"
          />
          <input type="date" [(ngModel)]="film.dateOfPublish" name="fdate" />
          <input type="number" placeholder="Budget" [(ngModel)]="film.budget" name="fbud" />
          <textarea
            placeholder="Description"
            [(ngModel)]="film.description"
            name="fdesc"
          ></textarea>
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
            <select [(ngModel)]="film.productionCompanyId" name="fprod">
              <option
                *ngFor="let pc of productionCompanies()"
                [ngValue]="pc.id"
              >
                {{ pc.name }} ({{ pc.country }})
              </option>
            </select>
          </label>
          <label>
            Genres
            <select multiple [(ngModel)]="film.genreIds" name="fgenres">
              <option *ngFor="let g of genres()" [ngValue]="g.id">
                {{ g.genreName }}
              </option>
            </select>
          </label>
          <div class="actions">
            <button type="button" (click)="saveFilm()">
              {{ film.id ? 'Update' : 'Create' }}
            </button>
            <button type="button" (click)="clear()">Clear</button>
          </div>
        </form>
        <!-- SERIES FORM -->
        <form *ngIf="entity() === 'series'">
          <input placeholder="Name" [(ngModel)]="series.name" name="sname" />
          <input
            placeholder="Age Limit"
            [(ngModel)]="series.ageLimit"
            name="sage"
          />

          <input
            type="date"
            placeholder="Date of publish"
            [(ngModel)]="series.dateOfPublish"
            name="sdofpub"
          />
          <input
            placeholder="Country of production"
            [(ngModel)]="series.countryOfProduction"
            name="scofprod"
          />
          <input
            placeholder="Production company"
            [(ngModel)]="series.productionCompanyName"
            name="spcom"
          />
          <input
            placeholder="Status"
            [(ngModel)]="series.status"
            name="sstat"
          />
          <input
            type="number"
            placeholder="Number of episodes"
            [(ngModel)]="series.numberOfEpisodes"
            name="snumofeps"
          />

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
            placeholder="Title"
            [(ngModel)]="trailer.title"
            name="ttitle"
          />

          <input
            placeholder="URL"
            [(ngModel)]="trailer.trailerUrl"
            name="turl"
          />

          <input
            placeholder="Duration"
            [(ngModel)]="trailer.duration"
            name="tdur"
          />

          <input
            placeholder="Age Limit"
            [(ngModel)]="trailer.ageLimit"
            name="tage"
          />

          <!-- Film selector -->
          <label>
            Film
            <select [(ngModel)]="trailer.filmId" name="tfilm">
              <option [ngValue]="null">-- select film --</option>
              <option *ngFor="let f of regularFilms()" [ngValue]="f.id">
                {{ f.name }} (ID: {{ f.id }})
              </option>
            </select>
          </label>

          <div class="actions">
            <button type="button" (click)="saveTrailer()">
              {{ trailer.id ? 'Update' : 'Create' }}
            </button>
            <button type="button" (click)="clear()">Clear</button>
          </div>
        </form>

        <!-- RATING FORM -->
        <form *ngIf="entity() === 'ratings'">
          <div class="muted" *ngIf="rating.id">
            Editing rating #{{ rating.id }}
          </div>
          <label>
            Film
            <select [(ngModel)]="rating.filmId" name="rfilm">
              <option [ngValue]="null">-- select film --</option>
              <option *ngFor="let f of regularFilms()" [ngValue]="f.id">
                {{ f.name }} (ID: {{ f.id }})
              </option>
            </select>
          </label>
          <label>
            User
            <select [(ngModel)]="rating.userId" name="ruser">
              <option [ngValue]="null">-- select user --</option>
              <option *ngFor="let u of users()" [ngValue]="u.id">
                {{ u.name }} ({{ u.email }})
              </option>
            </select>
          </label>

          <input
            type="number"
            min="1"
            max="5"
            placeholder="1..5"
            [(ngModel)]="rating.rating"
            name="rr"
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
          <textarea
            placeholder="Text"
            [(ngModel)]="comment.textOfComment"
            name="ctext"
          ></textarea>
          <div class="checkbox-field">
            <input type="checkbox" [(ngModel)]="comment.spoiler" name="csp" />
            <label>spoiler</label>
          </div>
          <input
            placeholder="Language"
            [(ngModel)]="comment.language"
            name="clang"
          />
          <label>
            Film
            <select [(ngModel)]="comment.filmId" name="cfilm">
              <option [ngValue]="null">-- select film --</option>
              <option *ngFor="let f of regularFilms()" [ngValue]="f.id">
                {{ f.name }} (ID: {{ f.id }})
              </option>
            </select>
          </label>
          <label>
            User
            <select [(ngModel)]="comment.userId" name="cuser">
              <option [ngValue]="null">-- select user --</option>
              <option *ngFor="let u of users()" [ngValue]="u.id">
                {{ u.name }} ({{ u.email }})
              </option>
            </select>
          </label>

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

  constructor(public data: DataService, private route: ActivatedRoute) {
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
      alert('Please select a film for the trailer.');
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
      alert('Please select a film for the rating.');
      return;
    }
    if (!r.userId) {
      alert('Please select a user for the rating.');
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
      alert('Please select a film for the comment.');
      return;
    }
    if (!c.userId) {
      alert('Please select a user for the comment.');
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
}
