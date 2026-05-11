import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { BEACH_SITES } from '../../shared/bagni-catalog';

@Component({
  selector: 'app-plage-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './plage-detail.html',
})
export class PlageDetailComponent {
  slug = input.required<string>();

  protected auth = inject(AuthService);
  protected beach = computed(
    () => BEACH_SITES.find(site => site.slug === this.slug()) ?? BEACH_SITES[0],
  );
}
