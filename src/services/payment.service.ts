import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private baseUrl = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient) {}

  createPaymentIntent(
    filmId: number,
    userId: number
  ): Observable<{ clientSecret: string }> {
    return this.http.post<{ clientSecret: string }>(
      `${this.baseUrl}/create-payment-intent`,
      { filmId, userId }
    );
  }
}
