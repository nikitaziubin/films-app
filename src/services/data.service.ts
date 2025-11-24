import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { Film, Series, Trailer, Rating, Comment, User, ProductionCompany, Genre, Payment } from '../models';

@Injectable({ providedIn: 'root' })
export class DataService {
  private apiUrl = 'http://localhost:8080/api';

  films$ = new BehaviorSubject<Film[]>([]);
  series$ = new BehaviorSubject<Series[]>([]);
  trailers$ = new BehaviorSubject<Trailer[]>([]);
  ratings$ = new BehaviorSubject<Rating[]>([]);
  comments$ = new BehaviorSubject<Comment[]>([]);
  users$ = new BehaviorSubject<User[]>([]);
  productionCompanies$ = new BehaviorSubject<ProductionCompany[]>([]);
  genres$ = new BehaviorSubject<Genre[]>([]);
  payments$ = new BehaviorSubject<Payment[]>([]);

  constructor(private http: HttpClient) {
    this.refreshAll();
  }

  refreshAll() {
    this.getAllFilms();
    this.getAllSeries();
    this.getAllTrailers();
    this.getAllRatings();
    this.getAllComments();
    this.getAllUsers();
    this.getAllProductionCompanies();
    this.getAllGenres();
  }
  getAllProductionCompanies() {
    this.http
      .get<ProductionCompany[]>(`${this.apiUrl}/production-companies`)
      .subscribe((pcs) => this.productionCompanies$.next(pcs));
  }
  getAllUsers() {
    this.http
      .get<User[]>(`${this.apiUrl}/users`)
      .subscribe((u) => this.users$.next(u));
  }
  // ---- FILMS ----
  getAllFilms() {
    this.http.get<Film[]>(`${this.apiUrl}/films`).subscribe({
      next: (data) => this.films$.next(data),
      error: (err) => console.error('Failed to load films', err),
    });
  }

  addFilm(film: any) {
    this.http
      .post<Film>(`${this.apiUrl}/films`, film)
      .subscribe(() => this.getAllFilms());
  }

  updateFilm(film: Film) {
    this.http
      .put(`${this.apiUrl}/films/${film.id}`, film)
      .subscribe(() => this.getAllFilms());
  }

  deleteFilm(id: number) {
    this.http
      .delete(`${this.apiUrl}/films/${id}`)
      .subscribe(() => this.getAllFilms());
  }

  // ---- SERIES ----
  getAllSeries() {
    this.http.get<Series[]>(`${this.apiUrl}/series`).subscribe({
      next: (data) => this.series$.next(data),
      error: (err) => console.error('Failed to load series', err),
    });
  }

  addSeries(series: any) {
    this.http
      .post<Series>(`${this.apiUrl}/series`, series)
      .subscribe(() => this.getAllSeries());
  }

  updateSeries(series: Series) {
    this.http
      .put(`${this.apiUrl}/series/${series.id}`, series)
      .subscribe(() => this.getAllSeries());
  }

  deleteSeries(id: number) {
    this.http
      .delete(`${this.apiUrl}/series/${id}`)
      .subscribe(() => this.getAllSeries());
  }

  // ---- TRAILERS ----
  getAllTrailers() {
    this.http
      .get<Trailer[]>(`${this.apiUrl}/trailers`)
      .subscribe((data) => this.trailers$.next(data));
  }

  addTrailer(trailer: any) {
    this.http
      .post<Trailer>(`${this.apiUrl}/trailers`, trailer)
      .subscribe(() => this.getAllTrailers());
  }

  updateTrailer(trailer: Trailer) {
    this.http
      .put(`${this.apiUrl}/trailers/${trailer.id}`, trailer)
      .subscribe(() => this.getAllTrailers());
  }

  deleteTrailer(id: number) {
    this.http
      .delete(`${this.apiUrl}/trailers/${id}`)
      .subscribe(() => this.getAllTrailers());
  }

  // ---- COMMENTS ----
  getAllComments() {
    this.http
      .get<Comment[]>(`${this.apiUrl}/films-comments`)
      .subscribe((data) => this.comments$.next(data));
  }

  // addComment(comment: any) {
  //   this.http
  //     .post(`${this.apiUrl}/films-comments`, comment)
  //     .subscribe(() => this.getAllComments());
  // }
  addComment(comment: any) {
    this.http
      .post<Comment>(`${this.apiUrl}/films-comments`, comment)
      .subscribe({
        next: () => this.getAllComments(),
        error: (err) => {
          console.error('Failed to add comment', err);
          alert('Failed to add comment');
        },
      });
  }
  updateComment(comment: any) {
    this.http
      .put<Comment>(`${this.apiUrl}/films-comments/${comment.id}`, comment)
      .subscribe(() => this.getAllComments());
  }

  deleteComment(id: number) {
    this.http
      .delete(`${this.apiUrl}/films-comments/${id}`)
      .subscribe(() => this.getAllComments());
  }

  // ---- RATINGS ----
  getAllRatings() {
    this.http
      .get<Rating[]>(`${this.apiUrl}/films-ratings`)
      .subscribe((data) => this.ratings$.next(data));
  }

  updateRating(rating: any) {
    this.http
      .put<Rating>(`${this.apiUrl}/films-ratings/${rating.id}`, rating)
      .subscribe(() => this.getAllRatings());
  }

  addRating(rating: any) {
    this.http.post<Rating>(`${this.apiUrl}/films-ratings`, rating).subscribe({
      next: () => this.getAllRatings(),
      error: (err) => {
        console.error('Failed to add rating', err);
        alert(err.error?.message || 'Failed to add rating');
      },
    });
  }
  deleteRating(id: number) {
    this.http
      .delete(`${this.apiUrl}/films-ratings/${id}`)
      .subscribe(() => this.getAllRatings());
  }
  getAllGenres() {
    this.http
      .get<Genre[]>(`${this.apiUrl}/genres`)
      .subscribe((g) => this.genres$.next(g));
  }
  getAllPayments() {
    this.http
      .get<Payment[]>(`${this.apiUrl}/payments`)
      .subscribe((ps) => this.payments$.next(ps));
  }
  getMyPayments(userId: number) {
    this.http
      .get<Payment[]>(`${this.apiUrl}/payments`)
      .subscribe((all) =>
        this.payments$.next(all.filter((p) => p.user?.id === userId))
      );
  }
}
