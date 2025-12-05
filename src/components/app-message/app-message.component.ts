// src/app/components/app-message/app-message.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageService } from '../../services/message.service';

@Component({
  selector: 'app-message',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="messageService.message$ | async as msg"
      class="app-message"
      [ngClass]="msg.type"
      (click)="messageService.clear()"
    >
      {{ msg.text }}
    </div>
  `,
  styles: [
    `
      .app-message {
        position: fixed;
        top: 16px;
        right: 16px;
        z-index: 1000;
        padding: 10px 16px;
        border-radius: 4px;
        color: #fff;
        font-weight: 500;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
        cursor: pointer;
        max-width: 320px;
      }

      .app-message.success {
        background-color: #2e7d32; /* green */
      }

      .app-message.error {
        background-color: #c62828; /* red */
      }
    `,
  ],
})
export class AppMessageComponent {
  constructor(public messageService: MessageService) {}
}
