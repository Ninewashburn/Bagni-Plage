import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { AuthService } from '../../../core/services/auth.service';
import { PaysService } from '../../../core/services/pays.service';
import { Pays } from '../../../core/models/pays.model';
import { AUTH_HERO_STYLES } from '../../../shared/auth-hero-styles';
import { BeachBackdropComponent } from '../../../shared/beach-backdrop';
import { BagniLogoComponent } from '../../../shared/bagni-logo';

@Component({
  selector: 'app-register',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    BeachBackdropComponent,
    BagniLogoComponent,
  ],
  templateUrl: './register.html',
  styles: AUTH_HERO_STYLES,
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private paysService = inject(PaysService);
  private router = inject(Router);

  form = this.fb.nonNullable.group({
    nom: ['', Validators.required],
    prenom: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    motDePasse: ['', [Validators.required, Validators.minLength(8)]],
    paysId: [0, [Validators.required, Validators.min(1)]],
  });

  pays = signal<Pays[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  constructor() {
    this.paysService
      .getAll()
      .pipe(takeUntilDestroyed())
      .subscribe(p => this.pays.set(p));
  }

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(null);

    this.authService.register(this.form.getRawValue()).subscribe({
      next: () => this.router.navigate(['/reservations']),
      error: () => {
        this.error.set("Erreur lors de l'inscription. Vérifiez vos informations.");
        this.loading.set(false);
      },
    });
  }
}
