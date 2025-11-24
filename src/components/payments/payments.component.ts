// src/app/components/my-payments/my-payments.component.ts
import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-my-payments',
  imports: [CommonModule],
  template: `
    <div class="payments-page">
      <h2>My Payments</h2>

      <div *ngIf="!user()" class="info-box">
        You must be logged in to see your payments.
      </div>

      <div *ngIf="user()">
        <div *ngIf="payments().length === 0" class="info-box">
          You have no payments yet.
        </div>

        <table *ngIf="payments().length > 0" class="payments-table">
          <thead>
            <tr>
              <th>Number</th>
              <th>Film</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of payments(); let i = index">
              <td>{{ i + 1 }}</td>
              <td>{{ p.film?.name || '—' }}</td>
              <td>{{ p.amount | number : '1.2-2' }} €</td>
              <td>{{ p.paymentMethod }}</td>
              <td>
                <span
                  class="status-pill"
                  [ngClass]="{
                    success: p.transactionStatus === 'SUCCESS',
                    failed: p.transactionStatus === 'FAILED',
                    pending: p.transactionStatus === 'PENDING'
                  }"
                >
                  {{ p.transactionStatus }}
                </span>
              </td>
              <td>{{ p.dateOfPublish | date : 'yyyy-MM-dd HH:mm' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [
    `
      .payments-page {
        max-width: 800px;
        margin: 24px 16px;
        padding: 0 12px;
      }

      h2 {
        margin-bottom: 16px;
      }

      .info-box {
        padding: 12px 16px;
        border-radius: 6px;
        background: #f5f5f5;
        color: #555;
        font-size: 14px;
      }

      .payments-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 12px;
        font-size: 14px;
      }

      .payments-table th,
      .payments-table td {
        padding: 8px 10px;
        border-bottom: 1px solid #e0e0e0;
        text-align: left;
      }

      .payments-table thead {
        background: #fafafa;
        font-weight: 600;
      }

      .payments-table tr:hover tbody tr:hover {
        background: #f9f9f9;
      }

      .status-pill {
        padding: 2px 8px;
        border-radius: 999px;
        font-size: 12px;
        text-transform: uppercase;
      }

      .status-pill.success {
        background: #e6f7e9;
        color: #1a7f37;
      }

      .status-pill.failed {
        background: #fdecea;
        color: #b3261e;
      }

      .status-pill.pending {
        background: #fff4e5;
        color: #a15c0f;
      }
    `,
  ],
})
export class MyPaymentsComponent {
  user = computed(() => this.auth.currentUser);
  payments = toSignal(this.data.payments$, { initialValue: [] });

  constructor(private data: DataService, private auth: AuthService) {
    const u = this.auth.currentUser;
    if (u?.id) {
      this.data.getMyPayments(u.id);
    }
  }
}
