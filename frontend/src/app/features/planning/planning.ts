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
import { DatePipe, CurrencyPipe, TitleCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReservationService } from '../../core/services/reservation.service';
import { ParasolService } from '../../core/services/parasol.service';
import { AuthService } from '../../core/services/auth.service';
import { Reservation } from '../../core/models/reservation.model';
import { FilePlageDetail } from '../../core/models/parasol.model';
import { ParasolGridComponent } from '../../shared/parasol-grid/parasol-grid';
import { AvatarComponent } from '../../shared/avatar';
import { TagComponent } from '../../shared/tag';

@Component({
  selector: 'app-planning',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    CurrencyPipe,
    TitleCasePipe,
    RouterLink,
    MatProgressBarModule,
    ParasolGridComponent,
    AvatarComponent,
    TagComponent,
  ],
  templateUrl: './planning.html',
})
export class PlanningComponent implements OnInit {
  private reservationService = inject(ReservationService);
  private parasolService = inject(ParasolService);
  private destroyRef = inject(DestroyRef);
  private snackBar = inject(MatSnackBar);
  protected auth = inject(AuthService);

  reservations = signal<Reservation[]>([]);
  files = signal<FilePlageDetail[]>([]);
  loading = signal(false);
  selectedRes = signal<Reservation | null>(null);
  activeView = signal<'jour' | 'semaine' | 'mois' | 'période'>('semaine');
  readonly views = ['jour', 'semaine', 'mois', 'période'] as const;
  private offsetWeeks = signal(0);

  readonly weekStart = computed(() => {
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7) + this.offsetWeeks() * 7);
    monday.setHours(0, 0, 0, 0);
    return monday;
  });

  readonly weekEnd = computed(() => {
    const end = new Date(this.weekStart());
    end.setDate(end.getDate() + 6);
    return end;
  });

  readonly weekDays = computed(() =>
    Array.from({ length: 7 }, (_, i) => {
      const d = new Date(this.weekStart());
      d.setDate(d.getDate() + i);
      return d;
    }),
  );

  readonly pendingList = computed(() => this.reservations().filter(r => r.statut === 'EN_ATTENTE'));

  readonly highlightIds = computed(() => (this.selectedRes()?.parasols ?? []).map(p => p.id));

  readonly stats = computed(() => {
    const valides = this.reservations().filter(r => r.statut !== 'REFUSEE');
    return {
      occupes: valides.reduce((s, r) => s + r.parasols.length, 0),
      total: Math.round(valides.reduce((s, r) => s + r.montantPaye, 0)),
    };
  });

  ngOnInit(): void {
    this.parasolService
      .getFiles()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(f => this.files.set(f));
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.reservationService
      .getPlanning(this.toIsoDate(this.weekStart()), this.toIsoDate(this.weekEnd()))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: list => {
          this.reservations.set(list);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  prevWeek(): void {
    this.offsetWeeks.update(n => n - 1);
    this.load();
  }
  nextWeek(): void {
    this.offsetWeeks.update(n => n + 1);
    this.load();
  }
  goToToday(): void {
    this.offsetWeeks.set(0);
    this.load();
  }

  isToday(d: Date): boolean {
    return d.toDateString() === new Date().toDateString();
  }

  getReservationsForDay(day: Date): Reservation[] {
    const d = this.toIsoDate(day);
    return this.reservations().filter(r => r.dateDebut <= d && r.dateFin >= d);
  }

  valider(res: Reservation): void {
    this.reservationService
      .validate(res.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.load();
          this.selectedRes.set(null);
          this.snackBar.open(`Réservation validée`, 'Fermer', { duration: 3000 });
        },
        error: () => this.snackBar.open('Erreur', 'Fermer', { duration: 3000 }),
      });
  }

  refuser(res: Reservation): void {
    this.reservationService
      .refuse(res.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.load();
          this.selectedRes.set(null);
          this.snackBar.open(`Réservation refusée`, 'Fermer', { duration: 3000 });
        },
        error: () => this.snackBar.open('Erreur', 'Fermer', { duration: 3000 }),
      });
  }

  formatParasols(r: Reservation): string {
    return r.parasols.map(p => p.identifiant).join(', ');
  }

  initials(r: Reservation): string {
    return (r.client.prenom[0] ?? '') + (r.client.nom[0] ?? '');
  }

  avatarColor(r: Reservation): string {
    const colors = ['#C8553D', '#3E7D8C', '#E9A24B', '#7AA68A', '#5A4432', '#A23E2B'];
    return colors[r.id % colors.length];
  }

  statutVariant(statut: string): 'pending' | 'accepted' | 'refused' {
    return (
      ({ EN_ATTENTE: 'pending', VALIDEE: 'accepted', REFUSEE: 'refused' } as const)[statut] ??
      'pending'
    );
  }

  equipLabel(eq: string): string {
    return (
      (
        {
          UN_LIT: '1 lit',
          DEUX_LITS: '2 lits',
          UN_FAUTEUIL: '1 fauteuil',
          FAUTEUIL_ET_LIT: '1 fauteuil + 1 lit',
          DEUX_FAUTEUILS: '2 fauteuils',
        } as Record<string, string>
      )[eq] ?? eq
    );
  }

  private toIsoDate(d: Date): string {
    return d.toISOString().split('T')[0];
  }
}
