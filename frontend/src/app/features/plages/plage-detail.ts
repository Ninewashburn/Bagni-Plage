import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CatalogService } from '../../core/services/catalog.service';
import { BEACH_SITES, BeachSite } from '../../shared/bagni-catalog';

@Component({
  selector: 'app-plage-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './plage-detail.html',
})
export class PlageDetailComponent implements OnInit {
  slug = input.required<string>();

  protected auth = inject(AuthService);
  private catalogService = inject(CatalogService);
  private destroyRef = inject(DestroyRef);

  protected beach = signal<BeachSite>(BEACH_SITES[0]);

  ngOnInit(): void {
    this.catalogService
      .getSite(this.slug())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(site => this.beach.set(site));
  }
}
