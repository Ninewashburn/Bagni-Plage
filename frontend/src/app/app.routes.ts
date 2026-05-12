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
    path: 'plages',
    loadComponent: () => import('./features/plages/plages').then(m => m.PlagesComponent),
  },
  {
    path: 'plages/:slug',
    loadComponent: () => import('./features/plages/plage-detail').then(m => m.PlageDetailComponent),
  },
  {
    path: 'offres',
    loadComponent: () => import('./features/offres/offres').then(m => m.OffresComponent),
  },
  {
    path: 'guide-local',
    loadComponent: () =>
      import('./features/guide-local/guide-local').then(m => m.GuideLocalComponent),
  },
  {
    path: 'reserver',
    redirectTo: 'reservations/nouvelle',
    pathMatch: 'full',
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
    path: 'reservations/:id/ticket',
    loadComponent: () =>
      import('./features/reservations/ticket/reservation-ticket').then(
        m => m.ReservationTicketComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'check-in',
    loadComponent: () => import('./features/check-in/check-in').then(m => m.CheckInComponent),
    canActivate: [authGuard, concessionnaireGuard],
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
  {
    path: 'mon-compte',
    redirectTo: 'profil',
    pathMatch: 'full',
  },
  {
    path: 'ma-journee',
    loadComponent: () => import('./features/ma-journee/ma-journee').then(m => m.MaJourneeComponent),
    canActivate: [authGuard],
  },
  { path: '**', redirectTo: 'login' },
];
