// src/app/services/wiki-description.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WikiDescription } from '../models';

@Injectable({ providedIn: 'root' })
export class WikiDescriptionService {
  private apiUrl = 'http://localhost:8080/api/wiki-descriptions';

  constructor(private http: HttpClient) {}

  createForFilm(filmId: number): Observable<WikiDescription> {
    return this.http.post<WikiDescription>(
      `${this.apiUrl}/by-film/${filmId}`,
      {}
    );
  }

  getByFilm(filmId: number): Observable<WikiDescription> {
    return this.http.get<WikiDescription>(`${this.apiUrl}/by-film/${filmId}`);
  }
}
