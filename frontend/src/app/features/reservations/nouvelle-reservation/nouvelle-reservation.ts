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
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private snackBar = inject(MatSnackBar);

  files = signal<FilePlageDetail[]>([]);
  disponibleIds = signal<Set<number>>(new Set());
  loadingFiles = signal(false);
  loadingDisponibles = signal(false);
  loadingCreate = signal(false);
  paymentSimulated = signal(false);

  dateForm = this.fb.group({
    dateDebut: [null as Date | null, Validators.required],
    dateFin: [null as Date | null, Validators.required],
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

  readonly minDate = new Date();

  readonly nbJours = computed(() => {
    const { dateDebut, dateFin } = this.dateValues();
    if (!dateDebut || !dateFin) return 0;
    const diff = (dateFin as Date).getTime() - (dateDebut as Date).getTime();
    return Math.max(1, Math.floor(diff / 86400000) + 1);
  });

  readonly sortedFiles = computed(() => [...this.files()].sort((a, b) => a.numero - b.numero));

  readonly gridRows = computed(() => {
    const sorted = this.sortedFiles();
    return Array.from({ length: 36 }, (_, i) => ({
      rowNum: i + 1,
      cells: sorted.map(file => ({
        file,
        parasol: file.parasols.find(p => p.numeroEmplacement === i + 1) ?? null,
      })),
    }));
  });

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

  readonly totalPrice = computed(() => {
    const p = this.selectedParasol();
    if (!p) return 0;
    return p.prixJournalier * this.nbJours();
  });

  readonly equipements: { value: Equipement; label: string }[] = [
    { value: 'UN_LIT', label: '1 lit' },
    { value: 'DEUX_LITS', label: '2 lits' },
    { value: 'UN_FAUTEUIL', label: '1 fauteuil de réalisateur' },
    { value: 'FAUTEUIL_ET_LIT', label: '1 fauteuil + 1 lit' },
    { value: 'DEUX_FAUTEUILS', label: '2 fauteuils de réalisateur' },
  ];

  ngOnInit(): void {
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

    this.reservationService
      .create({
        parasolIds: [parasolId as number],
        equipement: equipement as Equipement,
        dateDebut: this.toIsoDate(dateDebut as Date),
        dateFin: this.toIsoDate(dateFin as Date),
        montantPaye: this.totalPrice(),
        remarques: remarques || undefined,
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

  private toIsoDate(d: Date): string {
    return d.toISOString().split('T')[0];
  }
}
