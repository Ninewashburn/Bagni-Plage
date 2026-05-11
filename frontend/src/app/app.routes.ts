import { Routes } from '@angular/router';
import { authGuard, concessionnaireGuard, guestOnlyGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'guide', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then(m => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register').then(m => m.RegisterComponent),
    canActivate: [guestOnlyGuard],
  },
  {
    path: 'guide',
    loadComponent: () => import('./features/guide/guide').then(m => m.GuideComponent),
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard').then(m => m.DashboardComponent),
    canActivate: [authGuard, concessionnaireGuard],
  },
  {
    path: 'planning',
    loadComponent: () => import('./features/planning/planning').then(m => m.PlanningComponent),
    canActivate: [authGuard, concessionnaireGuard],
  },
  {
    path: 'reservations',
    loadComponent: () =>
      import('./features/reservations/reservations').then(m => m.ReservationsComponent),
    canActivate: [authGuard],
  },
  {
    path: 'reservations/nouvelle',
    loadComponent: () =>
      import('./features/reservations/nouvelle-reservation/nouvelle-reservation').then(
        m => m.NouvelleReservationComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'clients',
    loadComponent: () => import('./features/clients/clients').then(m => m.ClientsComponent),
    canActivate: [authGuard, concessionnaireGuard],
  },
  {
    path: 'profil',
    loadComponent: () => import('./features/profil/profil').then(m => m.ProfilComponent),
    canActivate: [authGuard],
  },
  { path: '**', redirectTo: 'login' },
];
