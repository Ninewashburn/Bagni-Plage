import { CurrencyPipe, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ClientService } from '../../core/services/client.service';
import { ParasolService } from '../../core/services/parasol.service';
import { ReservationService } from '../../core/services/reservation.service';
import { Reservation } from '../../core/models/reservation.model';
import { AvatarComponent } from '../../shared/avatar';
import { reservationStatusLabel } from '../../shared/reservation-labels';
import { TagComponent } from '../../shared/tag';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CurrencyPipe,
    DatePipe,
    RouterLink,
    MatProgressBarModule,
    AvatarComponent,
    TagComponent,
  ],
  templateUrl: './dashboard.html',
})
export class DashboardComponent implements OnInit {
  private reservationService = inject(ReservationService);
  private clientService = inject(ClientService);
  private parasolService = inject(ParasolService);
  private destroyRef = inject(DestroyRef);

  loading = signal(false);
  reservations = signal<Reservation[]>([]);
  clientsTotal = signal(0);
  parasolsTotal = signal(0);

  readonly pending = computed(() =>
    this.reservations()
      .filter(r => r.statut === 'EN_ATTENTE')
      .sort((a, b) => a.dateDebut.localeCompare(b.dateDebut)),
  );

  readonly confirmed = computed(() => this.reservations().filter(r => r.statut === 'VALIDEE'));

  readonly revenue = computed(() =>
    this.confirmed().reduce((total, reservation) => total + reservation.montantPaye, 0),
  );

  readonly occupancy = computed(() => {
    const total = this.parasolsTotal();
    if (!total) return 0;
    const occupied = new Set(this.confirmed().flatMap(r => r.parasols.map(p => p.id))).size;
    return Math.round((occupied / total) * 100);
  });

  ngOnInit(): void {
    this.loading.set(true);
    this.reservationService
      .getAll(0, 500)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: page => {
          this.reservations.set(page.content);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });

    this.clientService
      .getAll(0, 1)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(page => this.clientsTotal.set(page.totalElements));

    this.parasolService
      .getFiles()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(files =>
        this.parasolsTotal.set(files.reduce((total, file) => total + file.parasols.length, 0)),
      );
  }

  initials(reservation: Reservation): string {
    return (reservation.client.prenom[0] ?? '') + (reservation.client.nom[0] ?? '');
  }

  formatParasols(reservation: Reservation): string {
    return reservation.parasols.map(p => p.identifiant).join(', ');
  }

  statutVariant(statut: Reservation['statut']): 'pending' | 'accepted' | 'refused' {
    return ({ EN_ATTENTE: 'pending', VALIDEE: 'accepted', REFUSEE: 'refused' } as const)[statut];
  }

  statutLabel(statut: Reservation['statut']): string {
    return reservationStatusLabel(statut);
  }
}
