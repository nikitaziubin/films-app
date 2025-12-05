import {
  HttpInterceptorFn,
  HttpErrorResponse,
  HttpResponse,
} from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { MessageService } from '../../services/message.service';
import { inject } from '@angular/core';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const messageService = inject(MessageService);
  return next(req).pipe(
    tap((event) => {
      if (event instanceof HttpResponse) {
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
          const status = event.status;
          let msg = 'Operation completed successfully.';
          if (status === 201) msg = 'Created successfully.';
          if (status === 204) msg = 'Operation completed (no content).';
          messageService.success(msg);
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
          const details = body.errorslo
            .map((e: any) => `${e.field}: ${e.message}`)
            .join('\n');
          message = `Validation failed:\n${details}`;
        }
      }
      messageService.success(message);
      return throwError(() => error);
    })
  );
};
