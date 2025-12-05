import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { DataService } from '../../services/data.service';
import { FilterService } from '../../services/filter.service';
import { Genre } from '../../models';

@Component({
  standalone: true,
  selector: 'app-filter-panel',
  imports: [CommonModule, FormsModule],
  template: `
    <div
      class="filter-panel"
      style="padding:12px; border:1px solid #ddd; background:#fff; border-radius:6px; width:320px;"
    >
      <h4 style="margin:0 0 8px 0">Filter films</h4>

      <div style="margin-bottom:8px;">
        <strong>Description contains</strong>
        <input
          type="text"
          [(ngModel)]="filter.descriptionSearchValue"
          name="descriptionSearch"
          placeholder="Search in description..."
          style="width:100%; margin-top:4px;"
        />
        <small style="font-size:0.8rem; color:#666;">
          Only first 10 words of each description are checked.
        </small>
      </div>

      <div style="margin-bottom:8px;">
        <strong>Genres</strong>
        <div *ngFor="let g of genres()" style="margin:4px 0;">
          <label
            style="font-weight:400; display:flex; align-items:center; gap:8px; color:#222;"
          >
            <input
              type="checkbox"
              [checked]="isChecked(g.id)"
              (change)="toggle(g.id)"
              [attr.aria-label]="'Toggle genre ' + getGenreLabel(g)"
            />
            <span>{{ getGenreLabel(g) }}</span>
          </label>
        </div>
      </div>

      <div style="margin-bottom:8px;">
        <strong>Price (€)</strong>
        <div style="display:flex; gap:8px; align-items:stretch;">
          <label style="display:flex; flex-direction:column; width:100%;">
            <small style="margin-bottom:4px; color:#333;">Price (max)</small>
            <input
              type="number"
              [(ngModel)]="price"
              name="price"
              placeholder="Max"
              style="width:100%"
              min="0"
            />
          </label>
        </div>
      </div>

      <div style="margin-bottom:8px;">
        <strong>Duration</strong>
        <div style="font-size:0.85rem; color:#555; margin:6px 0;">
          Select maximum duration from 0 to 3 hours (minutes).
        </div>

        <div style="display:flex; gap:8px; align-items:flex-end;">
          <label style="display:flex; flex-direction:column; width:100%;">
            <small style="margin-bottom:4px; color:#333;"
              >Max duration (minutes)</small
            >
            <input
              type="number"
              [(ngModel)]="maxDuration"
              name="maxDuration"
              (change)="onMaxDurationInputChange()"
              placeholder="Max"
              style="width:100%"
              min="0"
              max="180"
            />
          </label>
        </div>

        <div style="margin-top:8px;">
          <input
            type="range"
            min="0"
            max="180"
            step="5"
            [(ngModel)]="maxDuration"
            name="maxDurationSlider"
            (input)="onMaxDurationSlider($any($event).target.value)"
            style="width:100%"
            aria-label="Maximum duration slider"
          />

          <div
            style="display:flex; justify-content:space-between; font-size:0.9rem; color:#333; margin-top:6px;"
          >
            <div>Min: 0m</div>
            <div>Max: {{ formatMinutes(maxDuration) }}</div>
          </div>
        </div>
      </div>

      <div
        style="display:flex; gap:8px; justify-content:flex-end; margin-top:10px;"
      >
        <button type="button" (click)="reset()">Reset</button>
        <button type="button" (click)="apply()">Apply</button>
      </div>
    </div>
  `,
})
export class FilterPanelComponent implements OnInit {
  genres = toSignal(this.data.genres$, { initialValue: [] as Genre[] });
  price: number | null = null;

  // single duration control: maxDuration in minutes (0..180). min is fixed 0.
  maxDuration: number = 180;

  constructor(private data: DataService, protected filter: FilterService) {}

  ngOnInit(): void {
    // initialize from filter service if user previously set values
    this.price = this.filter.maxPrice() ?? null;
    this.maxDuration = this.filter.maxDuration() ?? 180;
    console.debug('FilterPanel genres (signal):', this.genres());
  }

  isChecked(id: number) {
    return this.filter.selectedGenres().includes(id);
  }

  toggle(id: number) {
    this.filter.toggleGenre(id);
  }

  getGenreLabel(g: any): string {
    if (!g) return '';
    return String(
      g.genreName ??
        g.name ??
        g.title ??
        g.label ??
        (g.id ? `Genre ${g.id}` : '')
    );
  }

  onMaxDurationSlider(value: string | number) {
    const v = Number(value);
    this.maxDuration = Math.max(0, Math.min(180, Math.round(v)));
  }

  onMaxDurationInputChange() {
    if (this.maxDuration == null) this.maxDuration = 180;
    this.maxDuration = Math.max(0, Math.min(180, Number(this.maxDuration)));
  }

  formatMinutes(value: number | null): string {
    if (value == null) return '—';
    const v = Number(value);
    const h = Math.floor(v / 60);
    const m = v % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  }

  apply() {
    this.filter.setPriceRange(
      null,
      this.price != null ? Number(this.price) : null
    );
    this.filter.setDurationRange(0, this.maxDuration);
    this.filter.togglePanel();
  }

  reset() {
    this.price = null;
    this.maxDuration = 180;
    this.filter.reset();
    this.filter.togglePanel();
  }
}
