import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type MessageType = 'success' | 'error';

export interface AppMessage {
  type: MessageType;
  text: string;
}

@Injectable({ providedIn: 'root' })
export class MessageService {
  private messageSubject = new BehaviorSubject<AppMessage | null>(null);
  message$ = this.messageSubject.asObservable();

  show(type: MessageType, text: string, durationMs = 4000) {
    this.messageSubject.next({ type, text });
    if (durationMs > 0) {
      setTimeout(() => {
        if (this.messageSubject.value?.text === text) {
          this.clear();
        }
      }, durationMs);
    }
  }

  success(text: string, durationMs = 4000) {
    this.show('success', text, durationMs);
  }

  error(text: string, durationMs = 4000) {
    this.show('error', text, durationMs);
  }

  clear() {
    this.messageSubject.next(null);
  }
}
