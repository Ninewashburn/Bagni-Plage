import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReservationService } from '../../core/services/reservation.service';
import { ReservationTicket } from '../../core/models/reservation.model';
import { ticketStatusLabel } from '../../shared/reservation-labels';

@Component({
  selector: 'app-check-in',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule],
  templateUrl: './check-in.html',
})
export class CheckInComponent {
  private fb = inject(FormBuilder);
  private reservationService = inject(ReservationService);
  private destroyRef = inject(DestroyRef);

  protected ticket = signal<ReservationTicket | null>(null);
  protected loading = signal(false);
  protected error = signal<string | null>(null);
  protected readonly ticketStatusLabel = ticketStatusLabel;

  protected form = this.fb.nonNullable.group({
    ticketCode: ['', Validators.required],
  });

  rechercher(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(null);
    this.reservationService
      .findTicket(this.form.controls.ticketCode.value.trim())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ticket => {
          this.ticket.set(ticket);
          this.loading.set(false);
        },
        error: () => {
          this.ticket.set(null);
          this.error.set('Ticket introuvable ou inaccessible.');
          this.loading.set(false);
        },
      });
  }

  validerArrivee(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(null);
    this.reservationService
      .checkInTicket(this.form.controls.ticketCode.value.trim())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ticket => {
          this.ticket.set(ticket);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Impossible de valider ce ticket.');
          this.loading.set(false);
        },
      });
  }
}
