import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../../core/services/auth.service';
import { BeachBackdropComponent } from '../../../shared/beach-backdrop';
import { BagniLogoComponent } from '../../../shared/bagni-logo';

@Component({
  selector: 'app-login',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    BeachBackdropComponent,
    BagniLogoComponent,
  ],
  templateUrl: './login.html',
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
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    motDePasse: ['', [Validators.required, Validators.minLength(8)]],
  });

  loading = signal(false);
  error = signal<string | null>(null);

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(null);

    this.authService.login(this.form.getRawValue()).subscribe({
      next: () =>
        this.router.navigate([
          this.authService.isConcessionnaire() ? '/dashboard' : '/reservations',
        ]),
      error: () => {
        this.error.set('Email ou mot de passe incorrect.');
        this.loading.set(false);
      },
    });
  }
}
