// src/app/components/user-profile/user-profile.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserProfile } from '../../models';
import { UserProfileService } from '../../services/user-profile.service';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-user-profile',
  imports: [CommonModule, FormsModule],
  styles: [
    `
      .profile-page {
        max-width: 700px;
        margin: 24px 16px;
      }
      h2 {
        margin-bottom: 16px;
      }
      form {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px 16px;
      }
      label {
        display: flex;
        flex-direction: column;
        font-size: 0.9rem;
        font-weight: 500;
      }
      input,
      select {
        margin-top: 4px;
        padding: 6px 8px;
        border-radius: 4px;
        border: 1px solid #ccc;
      }
      .full-row {
        grid-column: 1 / -1;
      }
      .actions {
        grid-column: 1 / -1;
        margin-top: 8px;
      }
      button {
        padding: 6px 12px;
        border-radius: 4px;
        border: 1px solid #444;
        background: #222;
        color: #fff;
        cursor: pointer;
        margin-right: 8px;
      }
      button:hover {
        background: #333;
      }
      .info-box {
        padding: 10px 12px;
        margin-bottom: 16px;
        border-radius: 4px;
        background: #f5f5f5;
        font-size: 0.9rem;
        color: #555;
      }
      .error {
        color: #b00020;
        font-size: 0.78rem;
        margin-top: 2px;
        font-weight: 400;
      }
      button:disabled,
      button.disabled {
        opacity: 0.5;
        cursor: not-allowed;
        background: #888 !important;
        border-color: #666 !important;
      }
    `,
  ],
  template: `
    <div class="profile-page">
      <h2>My Profile</h2>

      <div *ngIf="!auth.isLoggedIn()" class="info-box">
        You must be logged in to view or edit your profile.
      </div>

      <div *ngIf="auth.isLoggedIn()">
        <div class="info-box" *ngIf="!loaded && !loading">
          You don't have a profile yet. Fill the form and click Save.
        </div>
        <div class="info-box" *ngIf="loading">Loading profile...</div>

        <form
          *ngIf="!loading"
          #profileForm="ngForm"
          (ngSubmit)="onSaveProfile(profileForm)"
        >
          <label>
            Birth date
            <input
              type="date"
              [(ngModel)]="model.birthDate"
              name="birthDate"
              required
              #birthDate="ngModel"
            />
            <span
              class="error"
              *ngIf="
                birthDate.invalid && (birthDate.dirty || birthDate.touched)
              "
            >
              Birth date is required.
            </span>
          </label>

          <label>
            Gender
            <select
              [(ngModel)]="model.gender"
              name="gender"
              required
              #gender="ngModel"
            >
              <option value="" disabled>Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            <span
              class="error"
              *ngIf="gender.invalid && (gender.dirty || gender.touched)"
            >
              Gender is required.
            </span>
          </label>

          <label>
            Country
            <input
              [(ngModel)]="model.country"
              name="country"
              required
              #country="ngModel"
            />
            <span
              class="error"
              *ngIf="country.invalid && (country.dirty || country.touched)"
            >
              Country is required.
            </span>
          </label>

          <label>
            City
            <input
              [(ngModel)]="model.city"
              name="city"
              required
              #city="ngModel"
            />
            <span
              class="error"
              *ngIf="city.invalid && (city.dirty || city.touched)"
            >
              City is required.
            </span>
          </label>

          <label class="full-row">
            Address
            <input
              [(ngModel)]="model.address"
              name="address"
              required
              #address="ngModel"
            />
            <span
              class="error"
              *ngIf="address.invalid && (address.dirty || address.touched)"
            >
              Address is required.
            </span>
          </label>

          <label>
            ZIP Code
            <input
              [(ngModel)]="model.zipCode"
              name="zipCode"
              required
              pattern="^[0-9A-Za-z- ]{3,10}$"
              #zipCode="ngModel"
            />
            <span
              class="error"
              *ngIf="zipCode.invalid && (zipCode.dirty || zipCode.touched)"
            >
              <ng-container *ngIf="zipCode.errors?.['required']">
                ZIP code is required.
              </ng-container>
              <ng-container *ngIf="zipCode.errors?.['pattern']">
                ZIP code must be 3–10 characters (digits/letters/-/space).
              </ng-container>
            </span>
          </label>

          <label>
            Region
            <input
              [(ngModel)]="model.region"
              name="region"
              required
              #region="ngModel"
            />
            <span
              class="error"
              *ngIf="region.invalid && (region.dirty || region.touched)"
            >
              Region is required.
            </span>
          </label>

          <div class="actions">
            <button
              type="submit"
              [disabled]="profileForm.invalid"
              [class.disabled]="profileForm.invalid"
            >
              {{ loaded ? 'Update profile' : 'Create profile' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class UserProfileComponent {
  model: UserProfile = {
    birthDate: '',
    gender: '',
    country: '',
    city: '',
    address: '',
    zipCode: '',
    region: '',
  };

  loading = false;
  loaded = false; // whether we have an existing profile (for PUT vs POST)
  profileId?: number; // backend profile id

  constructor(
    public auth: AuthService,
    private userProfileService: UserProfileService
  ) {
    this.loadProfile();
  }

  private loadProfile() {
    const user = this.auth.currentUser;
    if (!user || !user.id) return;

    this.loading = true;
    this.userProfileService.getMyProfile(user.id).subscribe({
      next: (p) => {
        this.loading = false;
        this.loaded = true;
        this.profileId = p.id; // real profile ID (1 in your example)
        this.model = {
          id: p.id,
          birthDate: p.birthDate?.substring(0, 10),
          gender: p.gender,
          country: p.country,
          city: p.city,
          address: p.address,
          zipCode: p.zipCode,
          region: p.region,
        };
      },
      error: () => {
        this.loading = false;
        this.loaded = false;
        // 404 -> no profile yet
      },
    });
  }

  save() {
    const user = this.auth.currentUser;
    if (!user || !user.id) {
      alert('You must be logged in.');
      return;
    }

    const payload: UserProfile = {
      ...this.model,
      user: { id: user.id },
    };

    if (this.loaded && this.profileId) {
      this.userProfileService.updateProfile(this.profileId, payload).subscribe({
        next: (p) => {
          this.loaded = true;
          this.profileId = p.id;
          // success alert handled by interceptor
        },
      });
    } else {
      this.userProfileService.createProfile(payload).subscribe({
        next: (p) => {
          this.loaded = true;
          this.profileId = p.id;
        },
      });
    }
  }
  onSaveProfile(form: any) {
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }
    this.save();
  }
}
