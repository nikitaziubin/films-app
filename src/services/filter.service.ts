import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FilterService {
  // UI panel open/close
  showPanel = signal(false);

  // Search term (bound from navbar)
  private _search = signal('');
  get search() {
    return this._search();
  }
  set searchValue(v: string) {
    this._search.set(v ?? '');
  }
  get searchValue() {
    return this._search();
  }

  // Genres selected (array of ids)
  private _selectedGenres = signal<number[]>([]);
  selectedGenres() {
    return this._selectedGenres();
  }
  toggleGenre(id: number) {
    const arr = [...this._selectedGenres()];
    const idx = arr.indexOf(id);
    if (idx >= 0) arr.splice(idx, 1);
    else arr.push(id);
    this._selectedGenres.set(arr);
  }
  setSelectedGenres(list: number[]) {
    this._selectedGenres.set([...list]);
  }

  // Price range (currency unit same as film.filmPrice)
  private _minPrice = signal<number | null>(null);
  private _maxPrice = signal<number | null>(null);
  minPrice() {
    return this._minPrice();
  }
  maxPrice() {
    return this._maxPrice();
  }
  setPriceRange(min: number | null, max: number | null) {
    this._minPrice.set(min ?? null);
    this._maxPrice.set(max ?? null);
  }

  // Duration in minutes
  private _minDuration = signal<number | null>(null);
  private _maxDuration = signal<number | null>(null);
  minDuration() {
    return this._minDuration();
  }
  maxDuration() {
    return this._maxDuration();
  }
  setDurationRange(min: number | null, max: number | null) {
    this._minDuration.set(min ?? null);
    this._maxDuration.set(max ?? null);
  }

  togglePanel() {
    this.showPanel.update((v) => !v);
  }

  reset() {
    this._search.set('');
    this._selectedGenres.set([]);
    this._minPrice.set(null);
    this._maxPrice.set(null);
    this._minDuration.set(null);
    this._maxDuration.set(null);
  }
}
