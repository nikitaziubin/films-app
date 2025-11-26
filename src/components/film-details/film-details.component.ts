// src/app/components/film-details/film-details.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Film, WikiDescription } from '../../models';
import { WikiDescriptionService } from '../../services/wiki-description.service';

@Component({
  standalone: true,
  selector: 'app-film-details',
  imports: [CommonModule],
  template: `
    <div *ngIf="film">
      <h2>{{ film.name }}</h2>
      <div class="description-container">
        <h3>Description</h3>
        <p *ngIf="film.description">
          {{ film.description.descriptionText }}
        </p>
        <div *ngIf="!film.description">
          <button (click)="loadWikiDescription()" [disabled]="loading">
            {{
              loading ? 'Loading description…' : 'See description (Wikipedia)'
            }}
          </button>

          <p class="hint" *ngIf="!loading">
            This will fetch a short summary from Wikipedia using the film title.
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .description-container {
        margin-top: 16px;
        padding: 12px;
        border-radius: 4px;
        background: #f8f8f8;
      }
      button {
        padding: 6px 12px;
        border-radius: 4px;
        border: 1px solid #444;
        background: #222;
        color: #fff;
        cursor: pointer;
      }
      button[disabled] {
        opacity: 0.6;
        cursor: default;
      }
      .hint {
        font-size: 0.85rem;
        color: #666;
        margin-top: 4px;
      }
    `,
  ],
})
export class FilmDetailsComponent {
  @Input() film!: Film;

  loading = false;

  constructor(private wikiDescriptionService: WikiDescriptionService) {}

  loadWikiDescription(): void {
    if (!this.film?.id || this.loading) return;

    this.loading = true;

    this.wikiDescriptionService.createForFilm(this.film.id).subscribe({
      next: (desc: WikiDescription) => {
        this.loading = false;
        this.film.description = desc;
      },
      error: () => {
        this.loading = false;
      },
    });
  }
}
