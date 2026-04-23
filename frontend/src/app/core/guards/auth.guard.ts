import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);

  if (authService.isAuthenticated()) return true;

  return inject(Router).createUrlTree(['/login']);
};

export const concessionnaireGuard: CanActivateFn = () => {
  const authService = inject(AuthService);

  if (authService.isConcessionnaire()) return true;

  return inject(Router).createUrlTree(['/planning']);
};

export const clientGuard: CanActivateFn = () => {
  const authService = inject(AuthService);

  if (!authService.isConcessionnaire()) return true;

  return inject(Router).createUrlTree(['/planning']);
};
