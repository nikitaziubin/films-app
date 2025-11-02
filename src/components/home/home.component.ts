import { Component, computed, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { RouterLink, RouterOutlet } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

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
        top: 30px;
        right: 12px;
      }
      .payment-form input,
      .payment-form button {
        display: block;
        width: 50%;
        margin-bottom: 8px;
      }
    `,
  ],
  template: `
    <h2>Films</h2>
    <div class="grid">
      <div class="card" *ngFor="let f of films()">
        <div *ngIf="seriesId() === null">
          <button class="buy-button" (click)="toggleBuying(f.id)">
            Buy film
          </button>
        </div>
        <div class="section" *ngIf="isBuying(f.id)">
          <h4>Payment Details for {{ f.name }}</h4>
          <form class="payment-form">
            <input placeholder="Card Number" name="cc-{{ f.id }}" />
            <input placeholder="Name on Card" name="cc-name-{{ f.id }}" />
            <input placeholder="CVC" name="cc-cvc-{{ f.id }}" />
            <button type="button">Buy Now</button>
            <button type="button" (click)="toggleBuying(f.id)">Cancel</button>
          </form>
        </div>
        <h3>{{ f.name }}</h3>
        <div class="muted">
          {{ f.quality || '—' }} • {{ f.duration || '—' }} min •
          {{ f.language || '—' }}
        </div>
        <p>{{ f.description || 'No description.' }}</p>

        <!-- Only average rating on the card -->
        <div class="section">
          <strong>Average rating:</strong>
          <ng-container *ngIf="ratingCount(f.id) > 0; else noRating">
            ⭐ {{ avgRating(f.id) }} ({{ ratingCount(f.id) }} ratings)
          </ng-container>
          <ng-template #noRating>— No ratings yet</ng-template>
        </div>

        <!-- Single-card toggle -->
        <div class="toggle" (click)="toggleDetails(f.id)">
          {{
            isOpen(f.id)
              ? '▼ Hide details'
              : '▶ Show details (trailers, rate & comments)'
          }}
        </div>

        <!-- Details only for the open film -->
        <div *ngIf="isOpen(f.id)">
          <div class="section">
            <strong>Trailers</strong>
            <ul>
              <li *ngFor="let t of trailersFor(f.id)">
                <a [href]="t.url" target="_blank">{{ t.title }}</a>
                <span class="muted">({{ t.duration || '—' }} min)</span>
              </li>
            </ul>
          </div>

          <div class="section">
            <strong>Rate this film</strong>
            <form (ngSubmit)="addRating(f.id)">
              <input
                required
                [(ngModel)]="ratingDraft[f.id].user"
                name="user-{{ f.id }}"
                placeholder="Your name"
              />
              <input
                required
                type="number"
                min="1"
                max="5"
                [(ngModel)]="ratingDraft[f.id].value"
                name="rating-{{ f.id }}"
                placeholder="1..5"
              />
              <button>Add rating</button>
            </form>
          </div>

          <div class="section">
            <strong>Comments</strong>
            <div *ngFor="let c of commentsFor(f.id)">
              <b>{{ c.user }}</b
              >: {{ c.text }}
              <span class="muted" *ngIf="c.spoiler">[spoiler]</span>
            </div>

            <form (ngSubmit)="addComment(f.id)" style="margin-top:8px">
              <input
                required
                [(ngModel)]="commentDraft[f.id].user"
                name="cuser-{{ f.id }}"
                placeholder="Your name"
              />
              <textarea
                required
                [(ngModel)]="commentDraft[f.id].text"
                name="ctext-{{ f.id }}"
                placeholder="Your comment"
              ></textarea>
              <label
                ><input
                  type="checkbox"
                  [(ngModel)]="commentDraft[f.id].spoiler"
                  name="csp-{{ f.id }}"
                />
                spoiler</label
              >
              <button>Add comment</button>
            </form>
          </div>
        </div>
      </div>
    </div>
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
            {{ s.status }} • {{ s.filmIds.length || 0 }} Episodes
          </p>
        </a>
      </div>
    </div>
  `,
})
export class HomeComponent {
  seriesId = signal<number | null>(null);
  constructor(private data: DataService, private route: ActivatedRoute) {
    this.route.paramMap.subscribe((params) => {
      const idString = params.get('id');
      if (idString) {
        this.seriesId.set(+idString);
      } else {
        this.seriesId.set(null);
      }
    });
  }

  private allFilms = toSignal(this.data.films$, { initialValue: [] });
  allSeries = toSignal(this.data.series$, { initialValue: [] });
  trailers = toSignal(this.data.trailers$, { initialValue: [] });
  ratings = toSignal(this.data.ratings$, { initialValue: [] });
  comments = toSignal(this.data.comments$, { initialValue: [] });

  films = computed(() => {
    const id = this.seriesId();
    if (id === null) {
      return this.allFilms().filter((x) => x.is_for_series == false);
    } else {
      const serieToShow = this.allSeries().find((x) => x.id === id);
      const filmIds = serieToShow?.filmIds || [];

      return this.allFilms().filter((f) => {
        return filmIds.includes(f.id);
      });
    }
  });

  // --- single-open card state
  openFilmId: number | null = null;
  buyFilmId: number | null = null;
  isOpen = (id: number) => this.openFilmId === id;
  toggleDetails(id: number) {
    this.openFilmId = this.openFilmId === id ? null : id;
    // ensure per-film drafts exist when details open
    if (!this.ratingDraft[id]) this.ratingDraft[id] = { user: '', value: 5 };
    if (!this.commentDraft[id])
      this.commentDraft[id] = { user: '', text: '', spoiler: false };
  }
  isBuying = (id: number) => this.buyFilmId === id;
  toggleBuying(id: number) {
    this.buyFilmId = this.buyFilmId === id ? null : id;
  }

  // --- per-film drafts (stop cross-typing)
  ratingDraft: Record<number, { user: string; value: number }> = {};
  commentDraft: Record<
    number,
    { user: string; text: string; spoiler: boolean }
  > = {};

  // helpers for template (no arrow functions in bindings)
  trailersFor = (filmId: number) =>
    this.trailers().filter((t) => t.filmId === filmId);
  commentsFor = (filmId: number) =>
    this.comments().filter((c) => c.filmId === filmId);

  ratingCount(filmId: number) {
    return this.ratings().filter((r) => r.filmId === filmId).length;
  }
  avgRating(filmId: number) {
    const list = this.ratings().filter((r) => r.filmId === filmId);
    if (!list.length) return '—';
    const avg = list.reduce((s, r) => s + (r.rating || 0), 0) / list.length;
    return avg.toFixed(2);
  }

  addRating(filmId: number) {
    const d = this.ratingDraft[filmId];
    if (!d || !d.user) return;
    this.data.addRating({
      filmId,
      user: d.user,
      rating: +d.value,
      reviewTitle: '',
    });
    this.ratingDraft[filmId] = { user: '', value: 5 };
  }

  addComment(filmId: number) {
    const d = this.commentDraft[filmId];
    if (!d || !d.user || !d.text) return;
    this.data.addComment({
      filmId,
      user: d.user,
      text: d.text,
      spoiler: d.spoiler,
      language: 'EN',
    });
    this.commentDraft[filmId] = { user: '', text: '', spoiler: false }; // reset only this film's form
  }
}
