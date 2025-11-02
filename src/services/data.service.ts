import { Injectable, numberAttribute } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Film, Trailer, Rating, Comment, Series } from '../models';


const LS_KEY = 'films-app-data-v1';

type StoreShape = {
  films: Film[];
  series: Series[];
  trailers: Trailer[];
  ratings: Rating[];
  comments: Comment[];
  nextId: number;
};

const seed: StoreShape = {
  nextId: 1000,
  films: [
    {
      id: 1,
      name: 'Inception',
      quality: 'HD',
      duration: 148,
      language: 'EN',
      budget: 160,
      description: 'A mind-bending heist.',
      is_for_series: false,
    },
    {
      id: 2,
      name: 'Interstellar',
      quality: 'HD',
      duration: 169,
      language: 'EN',
      budget: 165,
      description: 'Journey beyond the stars.',
      is_for_series: false,
    },
    {
      id: 100,
      name: 'Pilot',
      duration: 58,
      dateOfPublish: '2008-01-20',
      description: 'A high school chemistry teacher learns he has cancer.',
      is_for_series: true,
    },
    {
      id: 101,
      name: "Cat's in the Bag...",
      duration: 48,
      dateOfPublish: '2008-01-27',
      description: 'Walt and Jesse deal with the aftermath of their first cook.',
      is_for_series: true,
    },
    {
      id: 102,
      name: '...And the Bag\'s in the River',
      duration: 48,
      dateOfPublish: '2008-02-10',
      description: 'Walt is faced with a difficult decision.',
      is_for_series: true,
    },
  ],
  series:[
    {
      id: 1,
      name: "Breaking Bad",
      date_of_publish: new Date('2008-01-20'),
      country_of_production: "USA",
      production_company: "Paramaunt",
      status: "finished",
      number_of_episodes: 8,
      filmIds: [100, 101, 102],
    }
  ],
  trailers: [
    {
      id: 10,
      filmId: 1,
      title: 'Inception Trailer 1',
      url: 'https://youtu.be/YoHD9XEInc0',
      duration: 2,
    },
    {
      id: 11,
      filmId: 2,
      title: 'Interstellar Trailer 1',
      url: 'https://youtu.be/zSWdZVtXT7E',
      duration: 3,
    },
  ],
  ratings: [
    { id: 20, filmId: 1, user: 'alice', rating: 5, reviewTitle: 'Masterpiece' },
    { id: 21, filmId: 2, user: 'bob', rating: 4 },
  ],
  comments: [
    {
      id: 30,
      filmId: 1,
      user: 'alice',
      text: 'Loved the ending!',
      spoiler: false,
    },
    { id: 31, filmId: 2, user: 'bob', text: 'Great music.', spoiler: false },
  ],
};

@Injectable({ providedIn: 'root' })
export class DataService {
  private store: StoreShape;
  films$ = new BehaviorSubject<Film[]>([]);
  series$ = new BehaviorSubject<Series[]>([]);
  trailers$ = new BehaviorSubject<Trailer[]>([]);
  ratings$ = new BehaviorSubject<Rating[]>([]);
  comments$ = new BehaviorSubject<Comment[]>([]);

  constructor() {
    const saved = localStorage.getItem(LS_KEY);
    this.store = saved ? JSON.parse(saved) : seed;
    this.refresh();
  }

  private persist() {
    localStorage.setItem(LS_KEY, JSON.stringify(this.store));
    this.refresh();
  }
  private refresh() {
    this.films$.next([...this.store.films]);
    this.series$.next([...this.store.series]);
    this.trailers$.next([...this.store.trailers]);
    this.ratings$.next([...this.store.ratings]);
    this.comments$.next([...this.store.comments]);
  }
  private nextId() {
    return this.store.nextId++;
  }

  // ---- Films
  addFilm(f: Omit<Film, 'id'>) {
    const nf = { ...f, id: this.nextId() };
    this.store.films.push(nf);
    this.persist();
  }
  updateFilm(f: Film) {
    this.store.films = this.store.films.map((x) => (x.id === f.id ? f : x));
    this.persist();
  }
  deleteFilm(id: number) {
    this.store.films = this.store.films.filter((x) => x.id !== id);
    // cascade deletes
    const filmId = id;
    this.store.trailers = this.store.trailers.filter(
      (t) => t.filmId !== filmId
    );
    this.store.ratings = this.store.ratings.filter((r) => r.filmId !== filmId);
    this.store.comments = this.store.comments.filter(
      (c) => c.filmId !== filmId
    );
    this.persist();
  }

  addSeries(s: Omit<Series, 'id'>){
    const ns = { ...s, id: this.nextId()};
    this.store.series.push(ns);
    this.persist();
  }
  updateSeries(s: Series){
    this.store.series = this.store.series.map((x) => (x.id === s.id ? s : x));
    this.persist();
  }
  deleteSeries(id: number){
    const seriesToDelete = this.store.series.find((x) => x.id === id);
    if (seriesToDelete) {
      if (Array.isArray(seriesToDelete.filmIds)) {
        seriesToDelete.filmIds.forEach((element) => {
          this.deleteFilm(element);
        });
      }

      this.store.series = this.store.series.filter((s) => s.id !== id);
    }
    this.persist();
  }

  // ---- Trailers
  addTrailer(t: Omit<Trailer, 'id'>) {
    const nt = { ...t, id: this.nextId() };
    this.store.trailers.push(nt);
    this.persist();
  }
  updateTrailer(t: Trailer) {
    this.store.trailers = this.store.trailers.map((x) =>
      x.id === t.id ? t : x
    );
    this.persist();
  }
  deleteTrailer(id: number) {
    this.store.trailers = this.store.trailers.filter((x) => x.id !== id);
    this.persist();
  }

  // ---- Ratings
  addRating(r: Omit<Rating, 'id'>) {
    const nr = { ...r, id: this.nextId(), date: new Date().toISOString() };
    this.store.ratings.push(nr);
    this.persist();
  }
  updateRating(r: Rating) {
    this.store.ratings = this.store.ratings.map((x) => (x.id === r.id ? r : x));
    this.persist();
  }
  deleteRating(id: number) {
    this.store.ratings = this.store.ratings.filter((x) => x.id !== id);
    this.persist();
  }

  // ---- Comments
  addComment(c: Omit<Comment, 'id'>) {
    const nc = { ...c, id: this.nextId(), date: new Date().toISOString() };
    this.store.comments.push(nc);
    this.persist();
  }
  updateComment(c: Comment) {
    this.store.comments = this.store.comments.map((x) =>
      x.id === c.id ? c : x
    );
    this.persist();
  }
  deleteComment(id: number) {
    this.store.comments = this.store.comments.filter((x) => x.id !== id);
    this.persist();
  }
}
