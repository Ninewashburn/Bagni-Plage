import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { BagniLogoComponent } from '../../shared/bagni-logo';
import { AvatarComponent } from '../../shared/avatar';
import { ReservationService } from '../../core/services/reservation.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, BagniLogoComponent, AvatarComponent],
  template: `
    <aside class="app-sidebar">
      <div class="sidebar-brand">
        <app-bagni-logo [size]="17" />
      </div>

      <a class="sidebar-nav-item" routerLink="/dashboard" routerLinkActive="active">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
        >
          <rect x="3" y="3" width="7" height="8" rx="1.5" />
          <rect x="14" y="3" width="7" height="5" rx="1.5" />
          <rect x="14" y="12" width="7" height="9" rx="1.5" />
          <rect x="3" y="15" width="7" height="6" rx="1.5" />
        </svg>
        Tableau de bord
      </a>

      <a class="sidebar-nav-item" routerLink="/planning" routerLinkActive="active">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
        >
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M3 9h18M8 3v4M16 3v4" />
        </svg>
        Planning
      </a>

      <a class="sidebar-nav-item" routerLink="/guide" routerLinkActive="active">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
        >
          <path d="M9 18l-6 3V6l6-3 6 3 6-3v15l-6 3-6-3Z" />
          <path d="M9 3v15M15 6v15" />
        </svg>
        Guide touristique
      </a>

      <a
        class="sidebar-nav-item"
        routerLink="/reservations"
        routerLinkActive="active"
        [routerLinkActiveOptions]="{ exact: true }"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
        >
          <path d="M12 3v2M3 12a9 9 0 0 1 18 0H3zM12 12v7a2 2 0 1 1-4 0" />
        </svg>
        Réservations
        @if (pendingCount() > 0) {
          <span class="badge">{{ pendingCount() }}</span>
        }
      </a>

      <a class="sidebar-nav-item" routerLink="/reservations/nouvelle" routerLinkActive="active">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
        Nouvelle réservation
      </a>

      <a class="sidebar-nav-item" routerLink="/clients" routerLinkActive="active">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
        >
          <circle cx="9" cy="8" r="3.5" />
          <path d="M2 21c0-4 3-6 7-6s7 2 7 6M16 11a3 3 0 1 0 0-6M22 21c0-3-2-5-5-5" />
        </svg>
        Clients
      </a>

      <div style="margin-top:auto">
        <a
          class="sidebar-nav-item"
          routerLink="/profil"
          routerLinkActive="active"
          style="margin-bottom:8px"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
          >
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c0-5 4-8 8-8s8 3 8 8" />
          </svg>
          Mon profil
        </a>

        <div class="sidebar-profile">
          <app-avatar [initials]="initials()" color="var(--primary)" [size]="36" />
          <div style="flex:1;min-width:0">
            <div
              style="font-size:0.8125rem;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"
            >
              {{ auth.fullName() }}
            </div>
            <div style="font-size:0.6875rem;color:var(--ink-soft)">Gérant</div>
          </div>
          <button
            class="sidebar-nav-item"
            style="padding:6px;width:auto;min-width:0"
            (click)="auth.logout()"
            title="Déconnexion"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  `,
})
export class SidebarComponent {
  protected auth = inject(AuthService);
  private reservationService = inject(ReservationService);

  pendingCount = signal(0);

  readonly initials = () => {
    const p = this.auth.prenom() ?? '';
    const n = this.auth.nom() ?? '';
    return (p[0] ?? '') + (n[0] ?? '');
  };

  constructor() {
    this.reservationService
      .getPending(0, 1)
      .pipe(takeUntilDestroyed())
      .subscribe(page => this.pendingCount.set(page.totalElements));
  }
}
