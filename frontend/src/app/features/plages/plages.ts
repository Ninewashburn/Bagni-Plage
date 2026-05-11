import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { BEACH_SITES } from '../../shared/bagni-catalog';

@Component({
  selector: 'app-plages',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './plages.html',
})
export class PlagesComponent {
  protected auth = inject(AuthService);
  protected readonly beaches = BEACH_SITES;
  protected readonly filters = ['Ville', 'Date', 'Budget', 'Famille', 'Premium', 'Parking'];
}
