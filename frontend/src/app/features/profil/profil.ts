import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';
import { ClientService } from '../../core/services/client.service';
import { PaysService } from '../../core/services/pays.service';
import { Pays } from '../../core/models/pays.model';
import { AvatarComponent } from '../../shared/avatar';

@Component({
  selector: 'app-profil',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinner,
    AvatarComponent,
  ],
  templateUrl: './profil.html',
})
export class ProfilComponent implements OnInit {
  protected auth = inject(AuthService);
  private clientService = inject(ClientService);
  private paysService = inject(PaysService);
  private snackBar = inject(MatSnackBar);
  private destroyRef = inject(DestroyRef);
  private fb = inject(FormBuilder);

  pays = signal<Pays[]>([]);
  loading = signal(false);
  saved = signal(false);

  form = this.fb.nonNullable.group({
    prenom: ['', Validators.required],
    nom: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    paysId: [0, [Validators.required, Validators.min(1)]],
  });

  ngOnInit(): void {
    if (this.auth.isConcessionnaire()) return;

    this.paysService
      .getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(p => this.pays.set(p));

    this.clientService
      .getMe()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(client => {
        this.form.patchValue({
          prenom: client.prenom,
          nom: client.nom,
          email: client.email,
          paysId: client.pays?.id ?? 0,
        });
      });
  }

  initials(): string {
    return ((this.auth.prenom() ?? '')[0] ?? '') + ((this.auth.nom() ?? '')[0] ?? '');
  }

  save(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.saved.set(false);

    this.clientService
      .updateMe(this.form.getRawValue())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.saved.set(true);
          this.snackBar.open('Profil mis à jour', 'Fermer', { duration: 3000 });
        },
        error: () => {
          this.loading.set(false);
          this.snackBar.open('Erreur lors de la mise à jour', 'Fermer', { duration: 3000 });
        },
      });
  }
}
