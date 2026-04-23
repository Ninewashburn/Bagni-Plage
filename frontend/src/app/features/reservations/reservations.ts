import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReservationService } from '../../core/services/reservation.service';
import { AuthService } from '../../core/services/auth.service';
import { Reservation, Statut, ParasolInfo } from '../../core/models/reservation.model';
import { AvatarComponent } from '../../shared/avatar';
import { TagComponent } from '../../shared/tag';

@Component({
  selector: 'app-reservations',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    CurrencyPipe,
    RouterLink,
    MatPaginatorModule,
    MatProgressBarModule,
    AvatarComponent,
    TagComponent,
  ],
  templateUrl: './reservations.html',
})
export class ReservationsComponent implements OnInit {
  private reservationService = inject(ReservationService);
  private snackBar = inject(MatSnackBar);
  private destroyRef = inject(DestroyRef);
  protected auth = inject(AuthService);

  reservations = signal<Reservation[]>([]);
  totalElements = signal(0);
  loading = signal(false);
  pendingCount = signal(0);

  activeTab = 0;
  currentPage = 0;
  readonly pageSize = 20;

  readonly tabs = [
    { value: 0, label: 'Toutes' },
    { value: 1, label: 'En attente' },
    { value: 2, label: 'Validées' },
    { value: 3, label: 'Refusées' },
  ];

  ngOnInit(): void {
    this.load();
    if (this.auth.isConcessionnaire()) {
      this.loadPendingCount();
    }
  }

  private load(): void {
    this.loading.set(true);

    if (this.auth.isConcessionnaire()) {
      const obs =
        this.activeTab === 1
          ? this.reservationService.getPending(this.currentPage, this.pageSize)
          : this.reservationService.getAll(this.currentPage, this.pageSize);

      obs.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: page => {
          this.reservations.set(page.content);
          this.totalElements.set(page.totalElements);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
    } else {
      this.reservationService
        .getMy()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: list => {
            this.reservations.set(list);
            this.totalElements.set(list.length);
            this.loading.set(false);
          },
          error: () => this.loading.set(false),
        });
    }
  }

  private loadPendingCount(): void {
    this.reservationService
      .getPending(0, 1)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(page => this.pendingCount.set(page.totalElements));
  }

  onTabChange(index: number): void {
    this.activeTab = index;
    this.currentPage = 0;
    this.load();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.load();
  }

  valider(id: number): void {
    this.reservationService
      .validate(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: updated => {
          this.reservations.update(list => list.map(r => (r.id === id ? updated : r)));
          this.loadPendingCount();
          this.snackBar.open('Réservation validée', 'Fermer', { duration: 3000 });
        },
        error: () =>
          this.snackBar.open('Erreur lors de la validation', 'Fermer', { duration: 3000 }),
      });
  }

  refuser(id: number): void {
    this.reservationService
      .refuse(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: updated => {
          this.reservations.update(list => list.map(r => (r.id === id ? updated : r)));
          this.loadPendingCount();
          this.snackBar.open('Réservation refusée', 'Fermer', { duration: 3000 });
        },
        error: () => this.snackBar.open('Erreur lors du refus', 'Fermer', { duration: 3000 }),
      });
  }

  statutLabel(statut: Statut): string {
    return ({ EN_ATTENTE: 'En attente', VALIDEE: 'Validée', REFUSEE: 'Refusée' } as const)[statut];
  }

  statutVariant(statut: Statut): 'pending' | 'accepted' | 'refused' {
    return ({ EN_ATTENTE: 'pending', VALIDEE: 'accepted', REFUSEE: 'refused' } as const)[statut];
  }

  formatParasols(parasols: ParasolInfo[]): string {
    return parasols.map(p => p.identifiant).join(', ');
  }

  equipementLabel(eq: string): string {
    return (
      (
        {
          UN_LIT: '1 lit',
          DEUX_LITS: '2 lits',
          UN_FAUTEUIL: '1 fauteuil',
          FAUTEUIL_ET_LIT: 'Fauteuil + lit',
          DEUX_FAUTEUILS: '2 fauteuils',
        } as Record<string, string>
      )[eq] ?? eq
    );
  }

  clientInitials(r: Reservation): string {
    return (r.client.prenom[0] ?? '') + (r.client.nom[0] ?? '');
  }

  clientColor(r: Reservation): string {
    const colors = ['#C8553D', '#3E7D8C', '#E9A24B', '#7AA68A', '#5A4432', '#A23E2B'];
    return colors[r.id % colors.length];
  }
}
