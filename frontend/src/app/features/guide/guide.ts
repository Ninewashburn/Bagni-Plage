import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { BEACH_SITES, GUIDE_PLACES, QR_CELLS } from '../../shared/bagni-catalog';
import { GuidePlaceCardComponent } from '../../shared/guide-place-card';

@Component({
  selector: 'app-guide',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, GuidePlaceCardComponent],
  templateUrl: './guide.html',
})
export class GuideComponent {
  protected auth = inject(AuthService);
  protected readonly qrCells = QR_CELLS;
  protected readonly beachSites = BEACH_SITES;
  protected readonly places = GUIDE_PLACES;
}
