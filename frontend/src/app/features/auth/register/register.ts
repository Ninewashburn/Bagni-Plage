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
  styles: `
    .auth-hero-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, transparent 35%, var(--bg) 100%);
    }
    .auth-hero-content {
      position: absolute;
      bottom: 60px;
      left: 28px;
      color: #fbf5e9;
    }
    .estate-label {
      font-family: var(--font-serif);
      font-style: italic;
      font-size: 0.875rem;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      opacity: 0.85;
    }
    .hero-title {
      font-family: var(--font-display);
      font-size: 2.75rem;
      line-height: 1;
      margin-top: 4px;
      text-shadow: 0 2px 20px rgba(0, 0, 0, 0.2);
    }
  `,
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
      next: response => {
        this.authService.storeSession(response);
        this.router.navigate(['/reservations']);
      },
      error: () => {
        this.error.set("Erreur lors de l'inscription. Vérifiez vos informations.");
        this.loading.set(false);
      },
    });
  }
}
