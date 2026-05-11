import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { BAGNI_OFFERS, QR_CELLS } from '../../shared/bagni-catalog';

@Component({
  selector: 'app-offres',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './offres.html',
})
export class OffresComponent {
  protected auth = inject(AuthService);
  protected readonly offers = BAGNI_OFFERS;
  protected readonly qrCells = QR_CELLS;
}
