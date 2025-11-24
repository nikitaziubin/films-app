// src/app/interceptors/error.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const body = error.error;
      let message = 'Unexpected error occurred.';

      if (body) {
        // Case: { status, message, error }
        if (body.message) {
          message = body.message;
        }

        // Case: validation error { status, errors: [ { field, message } ] }
        if (body.errors && Array.isArray(body.errors)) {
          const details = body.errors
            .map((e: any) => `${e.field}: ${e.message}`)
            .join('\n');
          message = `Validation failed:\n${details}`;
        }
      }

      alert(message);
      return throwError(() => error);
    })
  );
};
