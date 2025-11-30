import { Component, computed, signal, effect } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { RouterLink, RouterOutlet, ActivatedRoute } from '@angular/router';
import { Film, WikiDescription } from '../../models';
import { WikiDescriptionService } from '../../services/wiki-description.service';
import { FilterService } from '../../services/filter.service';


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
      .card:hover .wiki-action {
        opacity: 1;
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
      .wiki-action {
        margin-top: 4px;
        font-size: 12px;
        color: #0066cc;
        cursor: pointer;
        opacity: 0;
        transition: opacity 0.2s ease;
      }
      .wiki-action.disabled {
        color: #999;
        cursor: default;
      }
      .error {
        color: #b00020;
        font-size: 12px;
        margin-top: -4px;
        margin-bottom: 6px;
      }
      .actions {
        margin-top: 12px;
      }
    `,
  ],
  template: `
    <h2 *ngIf="seriesId() === null">Films</h2>

    <div class="grid">
      <div
        *ngIf="films().length === 0"
        style="grid-column: 1/-1; padding: 20px; color: #666;"
      >
        No such films.
      </div>

      <div class="card" *ngFor="let f of films()">
        <div *ngIf="seriesId() === null && f.id && auth.isLoggedIn()">
          <button class="buy-button" (click)="toggleBuying(f.id!)">
            Buy film
          </button>
        </div>

        <div class="section" *ngIf="f.id && isBuying(f.id!)">
          <h4>Payment Details for {{ f.name }}</h4>
          <form class="payment-form" #paymentForm="ngForm">
            <input
              placeholder="Card Number"
              [(ngModel)]="payment.cardNumber"
              name="cc-{{ f.id }}"
              required
              pattern="^\\d{12,19}$"
              #cardNumber="ngModel"
            />
            <div
              class="error"
              *ngIf="
                cardNumber.invalid && (cardNumber.dirty || cardNumber.touched)
              "
            >
              <span *ngIf="cardNumber.errors?.['required']"
                >Card number is required.</span
              >
              <span *ngIf="cardNumber.errors?.['pattern']"
                >Card number must be 12–19 digits.</span
              >
            </div>

            <input
              placeholder="Name on Card"
              [(ngModel)]="payment.nameOnCard"
              name="cc-name-{{ f.id }}"
              required
              #nameOnCard="ngModel"
            />
            <div
              class="error"
              *ngIf="
                nameOnCard.invalid && (nameOnCard.dirty || nameOnCard.touched)
              "
            >
              Name on card is required.
            </div>

            <input
              placeholder="CVC"
              [(ngModel)]="payment.cvc"
              name="cc-cvc-{{ f.id }}"
              required
              pattern="^\\d{3,4}$"
              #cvc="ngModel"
            />
            <div
              class="error"
              *ngIf="cvc.invalid && (cvc.dirty || cvc.touched)"
            >
              <span *ngIf="cvc.errors?.['required']">CVC is required.</span>
              <span *ngIf="cvc.errors?.['pattern']"
                >CVC must be 3 or 4 digits.</span
              >
            </div>

            <div class="actions">
              <button
                type="button"
                (click)="onBuy(paymentForm, f.id)"
                [disabled]="paymentForm.invalid"
              >
                Buy Now
              </button>
              <button type="button" (click)="toggleBuying(f.id!)">
                Cancel
              </button>
            </div>
          </form>
        </div>
        <h3>{{ f.name }}</h3>
        <div class="muted">
          {{ f.quality || '—' }} • {{ f.duration || '—' }} •
          {{ f.language || '—' }}
        </div>
        <div class="muted">Genres: {{ getGenreNames(f) }}</div>
        <div class="muted">Price: {{ f.filmPrice }} €</div>
        <div class="section">
          <strong>Description</strong>
          <p *ngIf="f.description as d">
            {{ d.descriptionText }}
          </p>
          <p *ngIf="!f.description" class="muted">No description yet.</p>

          <div
            *ngIf="!f.description && f.id"
            class="wiki-action"
            (click)="!wikiLoading[f.id!] && loadWikiDescription(f)"
            [class.disabled]="wikiLoading[f.id!]"
          >
            {{
              wikiLoading[f.id!]
                ? 'Loading description from Wikipedia…'
                : 'See description (Wikipedia)'
            }}
          </div>
        </div>

        <div class="section" *ngIf="f.id">
          <strong>Average rating:</strong>
          <ng-container *ngIf="ratingCount(f) > 0; else noRating">
            ⭐ {{ avgRating(f) }} ({{ ratingCount(f) }} ratings)
          </ng-container>
          <ng-template #noRating>— No ratings yet</ng-template>
        </div>

        <div class="toggle" *ngIf="f.id" (click)="toggleDetails(f.id!)">
          {{
            isOpen(f.id!)
              ? '▼ Hide details'
              : '▶ Show details (trailers, rate & comments)'
          }}
        </div>

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
    public auth: AuthService,
    private wikiService: WikiDescriptionService,
    private filter: FilterService
  ) {
    this.route.paramMap.subscribe((params) => {
      const idString = params.get('id');
      if (idString) {
        this.seriesId.set(Number(idString));
      } else {
        this.seriesId.set(null);
      }
    });

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
  wikiLoading: Record<number, boolean> = {};

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
  loadWikiDescription(film: Film) {
    if (!film.id) return;
    const id = film.id;

    if (this.wikiLoading[id]) return;

    this.wikiLoading[id] = true;

    this.wikiService.createForFilm(id).subscribe({
      next: (desc: WikiDescription) => {
        this.wikiLoading[id] = false;
        film.description = desc;
      },
      error: () => {
        this.wikiLoading[id] = false;
      },
    });
  }
  payment = {
    cardNumber: '',
    nameOnCard: '',
    cvc: '',
  };

  onBuy(form: any, filmId: number) {
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }
  }

  private parseDurationToMinutes(text?: string | null): number | null {
    if (!text) return null;
    const s = String(text).toLowerCase();
    const hrMin = /(?:(\d+)\s*h(?:ours?)?)?\s*(?:(\d+)\s*m(?:in(?:utes?)?)?)?/;
    const mOnly = /^(\d+)\s*(m|min|minutes?)?$/;
    let match = s.match(hrMin);
    if (match && (match[1] || match[2])) {
      const h = match[1] ? parseInt(match[1], 10) : 0;
      const m = match[2] ? parseInt(match[2], 10) : 0;
      return h * 60 + m;
    }
    match = s.match(mOnly);
    if (match) {
      return parseInt(match[1], 10);
    }
    const digits = s.match(/\d+/);
    return digits ? parseInt(digits[0], 10) : null;
  }

  films = computed(() => {
    const id = this.seriesId();
    const all = this.allFilms();

    let list =
      id === null
        ? all.filter((x) => !x.series)
        : all.filter((f) => f.series && f.series.id === id);

    const raw = this.filter.searchValue;
    const term = (raw == null ? '' : String(raw)).trim().toLowerCase();

    if (term.length > 0) {
      list = list.filter((f) => {
        const name = (f.name || '').toString().trim().toLowerCase();
        return name.startsWith(term);
      });
    }

    const selGenres = this.filter.selectedGenres();
    if (selGenres && selGenres.length > 0) {
      list = list.filter((f) => {
        const ids = (f['genres'] || []).map((g: any) => Number(g.id));
        return selGenres.every((requiredId) => ids.includes(requiredId));
      });
    }

    const minP = this.filter.minPrice();
    const maxP = this.filter.maxPrice();
    if (minP != null) {
      list = list.filter(
        (f) => typeof f.filmPrice === 'number' && f.filmPrice >= minP
      );
    }
    if (maxP != null) {
      list = list.filter(
        (f) => typeof f.filmPrice === 'number' && f.filmPrice <= maxP
      );
    }

    const minD = this.filter.minDuration();
    const maxD = this.filter.maxDuration();
    if (minD != null || maxD != null) {
      list = list.filter((f) => {
        const minutes = this.parseDurationToMinutes(f.duration);
        if (minutes == null) return false;
        if (minD != null && minutes < minD) return false;
        if (maxD != null && minutes > maxD) return false;
        return true;
      });
    }

    return list;
  });
}
