import { Component, computed, signal, effect } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { RouterLink, RouterOutlet, ActivatedRoute } from '@angular/router';
import { Film } from '../../models';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [CommonModule, FormsModule, RouterLink, RouterOutlet],
  styles: [
    `
      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 16px;
      }
      .card {
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 12px;
        background: #fff;
        position: relative;
      }
      a.card-link {
        text-decoration: none;
        color: inherit;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }
      a.card-link:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }
      .muted {
        color: #666;
        font-size: 12px;
      }
      .section {
        margin-top: 10px;
        padding-top: 10px;
        border-top: 1px dashed #ddd;
      }
      .toggle {
        margin-top: 8px;
        cursor: pointer;
        user-select: none;
      }
      .toggle:hover {
        text-decoration: underline;
      }
      textarea {
        width: 100%;
        min-height: 60px;
      }
      .buy-button {
        position: absolute;
        top: 12px;
        right: 12px;
      }
      .payment-form input,
      .payment-form button {
        display: block;
        width: 100%;
        margin-bottom: 8px;
      }
    `,
  ],
  template: `
    <!-- Title Logic -->
    <div *ngIf="user() as u" class="muted" style="margin-bottom:8px">
      Logged in as: <strong>{{ u.name }}</strong> ({{ u.email }})
    </div>
    <h2 *ngIf="seriesId() === null">Films</h2>
    <h2 *ngIf="seriesId() !== null">
      <a routerLink="/" style="text-decoration:none; color:#666">Home</a> /
      Series Details (ID: {{ seriesId() }})
    </h2>

    <div class="grid">
      <!-- Debug message if list is empty -->
      <div
        *ngIf="films().length === 0"
        style="grid-column: 1/-1; padding: 20px; color: #666;"
      >
        No films.
      </div>

      <div class="card" *ngFor="let f of films()">
        <!-- Buy Button (Home Page Only) -->
        <div *ngIf="seriesId() === null && f.id">
          <button class="buy-button" (click)="toggleBuying(f.id!)">
            Buy film
          </button>
        </div>

        <!-- Payment Form -->
        <div class="section" *ngIf="f.id && isBuying(f.id!)">
          <h4>Payment Details for {{ f.name }}</h4>
          <form class="payment-form">
            <input placeholder="Card Number" name="cc-{{ f.id }}" />
            <input placeholder="Name on Card" name="cc-name-{{ f.id }}" />
            <input placeholder="CVC" name="cc-cvc-{{ f.id }}" />
            <button type="button">Buy Now</button>
            <button type="button" (click)="toggleBuying(f.id!)">Cancel</button>
          </form>
        </div>

        <h3>{{ f.name }}</h3>
        <div class="muted">
          {{ f.quality || '—' }} • {{ f.duration || '—' }} •
          {{ f.language || '—' }}
        </div>
        <div class="muted">
          Genres: {{ getGenreNames(f) }}
        </div>
        <p>{{ f.description || 'No description.' }}</p>

        <!-- Ratings -->
        <div class="section" *ngIf="f.id">
          <strong>Average rating:</strong>
          <ng-container *ngIf="ratingCount(f) > 0; else noRating">
            ⭐ {{ avgRating(f) }} ({{ ratingCount(f) }} ratings)
          </ng-container>
          <ng-template #noRating>— No ratings yet</ng-template>
        </div>

        <!-- Toggle Details -->
        <div class="toggle" *ngIf="f.id" (click)="toggleDetails(f.id!)">
          {{
            isOpen(f.id!)
              ? '▼ Hide details'
              : '▶ Show details (trailers, rate & comments)'
          }}
        </div>

        <!-- Details Section -->
        <div *ngIf="f.id && isOpen(f.id!)">
          <div class="section">
            <strong>Trailers</strong>
            <ul>
              <li *ngFor="let t of trailersFor(f)">
                <a [href]="t.trailerUrl" target="_blank">{{ t.title }}</a>
                <span class="muted">({{ t.duration || '—' }})</span>
              </li>
            </ul>
            <div *ngIf="trailersFor(f).length === 0" class="muted">
              No trailers available
            </div>
          </div>

          <div class="section">
            <strong>Rate this film</strong>

            <form (ngSubmit)="addRating(f.id!)">
              <div class="muted" *ngIf="user() as u; else mustLoginRate">
                Rating as: <strong>{{ u.name }}</strong>
              </div>
              <ng-template #mustLoginRate>
                <div class="muted">You must log in to rate.</div>
              </ng-template>

              <input
                required
                type="number"
                min="1"
                max="5"
                [(ngModel)]="ratingDraft[f.id!].value"
                name="rating-{{ f.id }}"
                placeholder="1..5"
              />
              <button [disabled]="!user()">Add rating</button>
            </form>
          </div>

          <div class="section">
            <strong>Comments</strong>
            <div *ngFor="let c of commentsFor(f)">
              <b>{{ c.user?.name || 'Anonymous' }}</b
              >: {{ c.textOfComment }}
              <span class="muted" *ngIf="c.spoiler">[spoiler]</span>
            </div>
            <div *ngIf="commentsFor(f).length === 0" class="muted">
              No comments yet.
            </div>

            <form (ngSubmit)="addComment(f.id!)" style="margin-top:8px">
              <div class="muted" *ngIf="user() as u; else mustLogin">
                Commenting as: <strong>{{ u.name }}</strong>
              </div>
              <ng-template #mustLogin>
                <div class="muted">You must log in to comment.</div>
              </ng-template>

              <textarea
                required
                [(ngModel)]="commentDraft[f.id!].text"
                name="ctext-{{ f.id }}"
                placeholder="Your comment"
              ></textarea>
              <label>
                <input
                  type="checkbox"
                  [(ngModel)]="commentDraft[f.id!].spoiler"
                  name="csp-{{ f.id }}"
                />
                spoiler
              </label>
              <button [disabled]="!user()">Add comment</button>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Series List -->
    <div *ngIf="seriesId() === null">
      <h2 class="page-title" style="margin-top: 32px;">Series</h2>
      <div class="grid">
        <a
          class="card card-link"
          *ngFor="let s of allSeries()"
          [routerLink]="['/series', s.id]"
        >
          <h3>{{ s.name }}</h3>
          <p class="muted">
            {{ s.status }} • {{ s.numberOfEpisodes }} Episodes
          </p>
        </a>
      </div>
    </div>
  `,
})
export class HomeComponent {
  seriesId = signal<number | null>(null);
  user = computed(() => this.auth.currentUser);

  constructor(
    private data: DataService,
    private route: ActivatedRoute,
    private auth: AuthService
  ) {
    this.route.paramMap.subscribe((params) => {
      const idString = params.get('id');
      if (idString) {
        this.seriesId.set(Number(idString));
      } else {
        this.seriesId.set(null);
      }
    });

    // Debug: Watch data to see why filter might fail
    effect(() => {
      const currentId = this.seriesId();
      const allFilms = this.allFilms();
      if (currentId !== null) {
        console.log(`[Home] Filter Debug:`);
        console.log(
          `- Looking for Series ID: ${currentId} (Type: ${typeof currentId})`
        );

        const sample = allFilms.find((f) => f.series);
        if (sample) {
          console.log(`- Sample Film Series Data:`, sample.series);
          console.log(
            `- Sample Film Series ID Type:`,
            typeof sample.series?.id
          );
        } else {
          console.log(`- No films with series data found in loaded films.`);
        }
      }
    });
  }

  private allFilms = toSignal(this.data.films$, { initialValue: [] });
  allSeries = toSignal(this.data.series$, { initialValue: [] });
  globalTrailers = toSignal(this.data.trailers$, { initialValue: [] });
  globalRatings = toSignal(this.data.ratings$, { initialValue: [] });
  globalComments = toSignal(this.data.comments$, { initialValue: [] });

  films = computed(() => {
    const id = this.seriesId();
    const all = this.allFilms();

    if (id === null) {
      // Home Page: Return films where series is null or undefined
      return all.filter((x) => !x.series);
    } else {
      return all.filter((f) => f.series && f.series.id === id);
    }
  });

  // --- state ---
  openFilmId: number | null = null;
  buyFilmId: number | null = null;

  isOpen(id: number): boolean {
    return this.openFilmId === id;
  }
  isBuying(id: number): boolean {
    return this.buyFilmId === id;
  }

  toggleDetails(id: number) {
    this.openFilmId = this.openFilmId === id ? null : id;
    if (!this.ratingDraft[id]) this.ratingDraft[id] = { value: 5 };
    if (!this.commentDraft[id])
      this.commentDraft[id] = { text: '', spoiler: false };
  }

  toggleBuying(id: number) {
    this.buyFilmId = this.buyFilmId === id ? null : id;
  }

  ratingDraft: Record<number, { value: number }> = {};
  commentDraft: Record<number, { text: string; spoiler: boolean }> = {};

  // --- Helpers that use nested data first, then fallback ---

  trailersFor(film: Film) {
    return this.globalTrailers().filter((t) => t.film?.id === film.id);
  }

  commentsFor(film: Film) {
    return this.globalComments().filter((c) => c.film?.id === film.id);
  }

  ratingCount(film: Film) {
    return this.globalRatings().filter((r) => r.film?.id === film.id).length;
  }

  avgRating(film: Film) {
    const list = this.globalRatings().filter((r) => r.film?.id === film.id);
    if (!list.length) return '—';
    const avg = list.reduce((s, r) => s + (r.rating || 0), 0) / list.length;
    return avg.toFixed(2);
  }

  addRating(filmId: number) {
    const d = this.ratingDraft[filmId];
    const u = this.user();

    if (!d) return;
    if (!u || !u.id) {
      alert('You must be logged in to rate.');
      return;
    }

    this.data.addRating({
      rating: +d.value,
      film: { id: filmId },
      user: { id: u.id },
    });

    this.ratingDraft[filmId] = { value: 5 };
  }

  addComment(filmId: number) {
    const d = this.commentDraft[filmId];
    const u = this.user();

    if (!d || !d.text) return;
    if (!u || !u.id) {
      alert('You must be logged in to comment.');
      return;
    }

    this.data.addComment({
      textOfComment: d.text,
      spoiler: d.spoiler,
      language: 'EN',
      film: { id: filmId },
      user: { id: u.id },
    });

    this.commentDraft[filmId] = { text: '', spoiler: false };
  }
  getGenreNames(film: any): string {
    return (film.genres || []).map((g: any) => g.genreName).join(', ');
  }
}
