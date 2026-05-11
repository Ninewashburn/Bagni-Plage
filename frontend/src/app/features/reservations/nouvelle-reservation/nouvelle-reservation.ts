import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ParasolService } from '../../../core/services/parasol.service';
import { ReservationService } from '../../../core/services/reservation.service';
import { FilePlageDetail } from '../../../core/models/parasol.model';
import { Equipement } from '../../../core/models/reservation.model';
import { AuthService } from '../../../core/services/auth.service';
import { ClientService } from '../../../core/services/client.service';
import { Client } from '../../../core/models/client.model';

@Component({
  selector: 'app-nouvelle-reservation',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    CurrencyPipe,
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    MatSelectModule,
    MatStepperModule,
    MatTooltipModule,
  ],
  templateUrl: './nouvelle-reservation.html',
})
export class NouvelleReservationComponent implements OnInit {
  private fb = inject(FormBuilder);
  private parasolService = inject(ParasolService);
  private reservationService = inject(ReservationService);
  private clientService = inject(ClientService);
  protected auth = inject(AuthService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private snackBar = inject(MatSnackBar);

  files = signal<FilePlageDetail[]>([]);
  clients = signal<Client[]>([]);
  disponibleIds = signal<Set<number>>(new Set());
  loadingFiles = signal(false);
  loadingClients = signal(false);
  loadingDisponibles = signal(false);
  loadingCreate = signal(false);
  paymentSimulated = signal(false);

  dateForm = this.fb.group({
    dateDebut: [null as Date | null, Validators.required],
    dateFin: [null as Date | null, Validators.required],
  });

  clientForm = this.fb.group({
    clientId: [null as number | null, [Validators.required, Validators.min(1)]],
  });

  parasolForm = this.fb.group({
    parasolId: [null as number | null, [Validators.required, Validators.min(1)]],
  });

  equipementForm = this.fb.nonNullable.group({
    equipement: ['' as Equipement | '', Validators.required],
    remarques: [''],
  });

  private dateValues = toSignal(this.dateForm.valueChanges, {
    initialValue: this.dateForm.value,
  });

  private parasolValue = toSignal(this.parasolForm.valueChanges, {
    initialValue: this.parasolForm.value,
  });

  private equipementValue = toSignal(this.equipementForm.valueChanges, {
    initialValue: this.equipementForm.value,
  });

  private readonly seasonYear =
    new Date() > new Date(new Date().getFullYear(), 8, 15)
      ? new Date().getFullYear() + 1
      : new Date().getFullYear();
  readonly seasonStart = new Date(this.seasonYear, 4, 1);
  readonly seasonEnd = new Date(this.seasonYear, 8, 15);
  readonly minDate = new Date() > this.seasonStart ? new Date() : this.seasonStart;

  readonly nbJours = computed(() => {
    const { dateDebut, dateFin } = this.dateValues();
    if (!dateDebut || !dateFin) return 0;
    const diff = (dateFin as Date).getTime() - (dateDebut as Date).getTime();
    return Math.max(1, Math.floor(diff / 86400000) + 1);
  });

  readonly datesOutOfOrder = computed(() => {
    const { dateDebut, dateFin } = this.dateValues();
    return !!dateDebut && !!dateFin && (dateFin as Date).getTime() < (dateDebut as Date).getTime();
  });

  readonly sortedFiles = computed(() => [...this.files()].sort((a, b) => a.numero - b.numero));
  readonly emplNums = Array.from({ length: 36 }, (_, i) => i + 1);

  sortedParasols(file: FilePlageDetail): typeof file.parasols {
    return [...file.parasols].sort((a, b) => a.numeroEmplacement - b.numeroEmplacement);
  }

  readonly selectedParasolId = computed(() => this.parasolValue().parasolId ?? null);

  readonly selectedParasol = computed(() => {
    const id = this.selectedParasolId();
    if (!id) return null;
    for (const file of this.files()) {
      const p = file.parasols.find(p => p.id === id);
      if (p) return { ...p, prixJournalier: file.prixJournalier };
    }
    return null;
  });

  readonly selectedEquipement = computed(() => this.equipementValue().equipement ?? '');

  readonly equipmentExtra = computed(() => this.extraDailyPrice(this.selectedEquipement()));

  readonly totalPrice = computed(() => {
    const p = this.selectedParasol();
    if (!p) return 0;
    return (p.prixJournalier + this.equipmentExtra()) * this.nbJours();
  });

  readonly equipements: { value: Equipement; label: string; extra: number }[] = [
    { value: 'UN_LIT', label: '1 lit inclus', extra: 0 },
    { value: 'DEUX_LITS', label: '2 lits', extra: 8 },
    { value: 'UN_FAUTEUIL', label: '1 fauteuil de réalisateur', extra: 4 },
    { value: 'FAUTEUIL_ET_LIT', label: '1 fauteuil + 1 lit', extra: 6 },
    { value: 'DEUX_FAUTEUILS', label: '2 fauteuils de réalisateur', extra: 8 },
  ];

  ngOnInit(): void {
    if (this.auth.isConcessionnaire()) {
      this.loadingClients.set(true);
      this.clientService
        .getAll(0, 500)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: page => {
            this.clients.set(page.content);
            this.loadingClients.set(false);
          },
          error: () => this.loadingClients.set(false),
        });
    }

    this.loadingFiles.set(true);
    this.parasolService
      .getFiles()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: files => {
          this.files.set(files);
          this.loadingFiles.set(false);
        },
        error: () => this.loadingFiles.set(false),
      });
  }

  onDatesNext(): void {
    if (this.dateForm.invalid) return;
    if (this.datesOutOfOrder()) {
      this.snackBar.open('La date de départ doit être après la date d’arrivée.', 'Fermer', {
        duration: 3500,
      });
      return;
    }
    this.loadDisponibles();
  }

  private loadDisponibles(): void {
    const { dateDebut, dateFin } = this.dateForm.value;
    if (!dateDebut || !dateFin) return;
    this.loadingDisponibles.set(true);
    this.parasolForm.reset();
    this.parasolService
      .getDisponibles(this.toIsoDate(dateDebut as Date), this.toIsoDate(dateFin as Date))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: list => {
          this.disponibleIds.set(new Set(list.map(p => p.id)));
          this.loadingDisponibles.set(false);
        },
        error: () => this.loadingDisponibles.set(false),
      });
  }

  isAvailable(id: number): boolean {
    return this.disponibleIds().has(id);
  }

  isSelected(id: number): boolean {
    return this.selectedParasolId() === id;
  }

  selectParasol(id: number): void {
    this.parasolForm.patchValue({ parasolId: id });
  }

  simulatePaiement(): void {
    this.paymentSimulated.set(true);
    this.createReservation();
  }

  private createReservation(): void {
    this.loadingCreate.set(true);
    const { dateDebut, dateFin } = this.dateForm.value;
    const { parasolId } = this.parasolForm.value;
    const { equipement, remarques } = this.equipementForm.value;
    const { clientId } = this.clientForm.value;

    this.reservationService
      .create({
        parasolIds: [parasolId as number],
        equipement: equipement as Equipement,
        dateDebut: this.toIsoDate(dateDebut as Date),
        dateFin: this.toIsoDate(dateFin as Date),
        remarques: remarques || undefined,
        clientId: this.auth.isConcessionnaire() ? (clientId as number) : undefined,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.loadingCreate.set(false);
          this.snackBar.open('Réservation créée avec succès !', 'Fermer', { duration: 4000 });
          this.router.navigate(['/reservations']);
        },
        error: () => {
          this.loadingCreate.set(false);
          this.paymentSimulated.set(false);
          this.snackBar.open('Erreur lors de la création', 'Fermer', { duration: 4000 });
        },
      });
  }

  equipLabel(eq: string): string {
    return (
      (
        {
          UN_LIT: '1 lit inclus',
          DEUX_LITS: '2 lits',
          UN_FAUTEUIL: '1 fauteuil de réalisateur',
          FAUTEUIL_ET_LIT: '1 fauteuil + 1 lit',
          DEUX_FAUTEUILS: '2 fauteuils de réalisateur',
        } as Record<string, string>
      )[eq] ?? eq
    );
  }

  extraDailyPrice(eq: string): number {
    return this.equipements.find(e => e.value === eq)?.extra ?? 0;
  }

  private toIsoDate(d: Date): string {
    return [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, '0'),
      String(d.getDate()).padStart(2, '0'),
    ].join('-');
  }
}
