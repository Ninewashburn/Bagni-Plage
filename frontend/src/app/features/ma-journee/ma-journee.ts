import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Reservation, ReservationTicket } from '../../core/models/reservation.model';
import { CatalogService } from '../../core/services/catalog.service';
import { PassService } from '../../core/services/pass.service';
import { ReservationService } from '../../core/services/reservation.service';
import { GuidePlace, QR_CELLS } from '../../shared/bagni-catalog';
import { GuidePlaceCardComponent } from '../../shared/guide-place-card';
import {
  equipmentLabel,
  reservationStatusLabel,
  ticketStatusLabel,
} from '../../shared/reservation-labels';

@Component({
  selector: 'app-ma-journee',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, RouterLink, GuidePlaceCardComponent],
  templateUrl: './ma-journee.html',
})
export class MaJourneeComponent implements OnInit {
  private reservationService = inject(ReservationService);
  private catalogService = inject(CatalogService);
  private destroyRef = inject(DestroyRef);
  protected passService = inject(PassService);

  protected readonly qrCells = QR_CELLS;
  protected reservation = signal<Reservation | null>(null);
  protected ticket = signal<ReservationTicket | null>(null);
  protected suggestedPlaces = signal<GuidePlace[]>([]);
  protected loading = signal(true);
  protected readonly equipmentLabel = equipmentLabel;
  protected readonly reservationStatusLabel = reservationStatusLabel;
  protected readonly ticketStatusLabel = ticketStatusLabel;

  protected readonly timeline = [
    { time: '10h00', label: 'Arrivée possible à la plage' },
    { time: '10h15', label: 'Contrôle du Bagni Pass et installation' },
    { time: '12h30', label: 'Restaurant recommandé à proximité' },
    { time: '14h00', label: 'Activité paddle selon météo' },
    { time: '18h00', label: 'Fin du créneau de journée' },
  ];

  ngOnInit(): void {
    this.catalogService
      .getGuidePlaces()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(places => this.suggestedPlaces.set(places.slice(0, 3)));

    this.reservationService
      .getMy()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: reservations => {
          const nextReservation = [...reservations]
            .filter(r => r.statut !== 'REFUSEE')
            .sort((a, b) => a.dateDebut.localeCompare(b.dateDebut))[0];
          this.reservation.set(nextReservation ?? null);
          this.loading.set(false);
          if (nextReservation?.statut === 'VALIDEE') {
            this.loadTicket(nextReservation.id);
          }
        },
        error: () => this.loading.set(false),
      });
  }

  protected formatParasols(reservation: Reservation): string {
    return reservation.parasols.map(p => p.identifiant).join(', ');
  }

  private loadTicket(id: number): void {
    this.reservationService
      .getTicket(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(ticket => this.ticket.set(ticket));
  }
}
