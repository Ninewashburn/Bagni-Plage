import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ReservationService } from '../../../core/services/reservation.service';
import { ReservationTicket } from '../../../core/models/reservation.model';
import { ticketStatusLabel } from '../../../shared/reservation-labels';

@Component({
  selector: 'app-reservation-ticket',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, RouterLink],
  templateUrl: './reservation-ticket.html',
})
export class ReservationTicketComponent {
  private route = inject(ActivatedRoute);
  private reservationService = inject(ReservationService);
  private destroyRef = inject(DestroyRef);

  protected ticket = signal<ReservationTicket | null>(null);
  protected loading = signal(true);
  protected error = signal<string | null>(null);

  protected qrCells = computed(() =>
    this.buildQrCells(this.ticket()?.qrPayload ?? 'BAGNI-PENDING'),
  );

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.loading.set(false);
      this.error.set('Ticket introuvable.');
      return;
    }

    this.reservationService
      .getTicket(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ticket => {
          this.ticket.set(ticket);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Impossible de charger le Bagni Pass.');
          this.loading.set(false);
        },
      });
  }

  protected statutLabel(status: string): string {
    return ticketStatusLabel(status);
  }

  private buildQrCells(seed: string): boolean[] {
    const cells: boolean[] = [];
    let state = 0;
    for (const char of seed) {
      state = (state * 31 + char.charCodeAt(0)) >>> 0;
    }
    for (let i = 0; i < 81; i++) {
      state = (state * 1664525 + 1013904223) >>> 0;
      const finder =
        (i % 9 < 3 && Math.floor(i / 9) < 3) ||
        (i % 9 > 5 && Math.floor(i / 9) < 3) ||
        (i % 9 < 3 && Math.floor(i / 9) > 5);
      cells.push(finder || state % 3 === 0);
    }
    return cells;
  }
}
