import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);

  if (authService.isAuthenticated()) return true;

  return inject(Router).createUrlTree(['/login']);
};

export const guestOnlyGuard: CanActivateFn = () => {
  const authService = inject(AuthService);

  if (!authService.isAuthenticated()) return true;

  return inject(Router).createUrlTree([authService.isConcessionnaire() ? '/dashboard' : '/profil']);
};

export const concessionnaireGuard: CanActivateFn = () => {
  const authService = inject(AuthService);

  if (authService.isConcessionnaire()) return true;

  return inject(Router).createUrlTree(['/reservations']);
};

export const clientGuard: CanActivateFn = () => {
  const authService = inject(AuthService);

  if (!authService.isConcessionnaire()) return true;

  return inject(Router).createUrlTree(['/dashboard']);
};
