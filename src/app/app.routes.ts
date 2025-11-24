import { Routes } from '@angular/router';
import { HomeComponent } from '../components/home/home.component';
import { AdminListComponent } from '../components/admin-list/admin-list.component';
import { LoginComponent } from '../components/auth/login.component';
import { RegisterComponent } from '../components/auth/register.component';
import { MyPaymentsComponent } from '../components/payments/payments.component';


export const appRoutes: Routes = [
  { path: '', component: HomeComponent, title: 'Films' },
  {
    path: 'series/:id',
    component: HomeComponent,
    title: 'Series Details',
  },
  {
    path: 'films',
    component: AdminListComponent,
    data: { entity: 'films' },
    title: 'Films (CRUD)',
  },
  {
    path: 'series',
    component: AdminListComponent,
    data: { entity: 'series' },
    title: 'Series (CRUD)',
  },
  {
    path: 'trailers',
    component: AdminListComponent,
    data: { entity: 'trailers' },
    title: 'Trailers (CRUD)',
  },
  {
    path: 'comments',
    component: AdminListComponent,
    data: { entity: 'comments' },
    title: 'Comments (CRUD)',
  },
  {
    path: 'ratings',
    component: AdminListComponent,
    data: { entity: 'ratings' },
    title: 'Ratings (CRUD)',
  },
  { path: 'login', component: LoginComponent, title: 'Login' },
  { path: 'register', component: RegisterComponent, title: 'Register' },
  { path: 'payments', component: MyPaymentsComponent },
  { path: '**', redirectTo: '' },
];
