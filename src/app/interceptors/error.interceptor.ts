
import {
  HttpInterceptorFn,
  HttpErrorResponse,
  HttpResponse,
} from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    // SUCCESS responses (200, 201, 204, ...)
    tap((event) => {
      if (event instanceof HttpResponse) {
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
          const status = event.status; // 200, 201, 204...
          let msg = 'Operation completed successfully.';
          if (status === 201) msg = 'Created successfully.';
          if (status === 204) msg = 'Operation completed (no content).';

          alert(msg);
        }
      }
    }),
    catchError((error: HttpErrorResponse) => {
      const body = error.error;
      let message = 'Unexpected error occurred.';

      if (body) {
        if (body.message) {
          message = body.message;
        }
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
