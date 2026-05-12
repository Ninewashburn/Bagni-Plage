import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CatalogService } from '../../core/services/catalog.service';
import { BEACH_SITES, BeachSite } from '../../shared/bagni-catalog';

@Component({
  selector: 'app-plages',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './plages.html',
})
export class PlagesComponent implements OnInit {
  protected auth = inject(AuthService);
  private catalogService = inject(CatalogService);
  private destroyRef = inject(DestroyRef);

  protected beaches = signal<BeachSite[]>(BEACH_SITES);
  protected activeFilter = signal('Toutes');
  protected sortMode = signal('Recommandées');

  protected readonly filters = ['Toutes', 'Famille', 'Premium', 'Calme', 'Parking', 'Accès vélo'];
  protected readonly sortModes = ['Recommandées', 'Prix', 'Disponibilité'];

  protected filteredBeaches = computed(() => {
    const filter = this.activeFilter();
    const list =
      filter === 'Toutes'
        ? this.beaches()
        : this.beaches().filter(beach =>
            [...beach.badges, ...beach.highlights].some(item =>
              item.toLowerCase().includes(filter.toLowerCase()),
            ),
          );

    return [...list].sort((a, b) => {
      if (this.sortMode() === 'Prix') {
        return this.priceValue(a) - this.priceValue(b);
      }
      if (this.sortMode() === 'Disponibilité') {
        return this.availabilityValue(b) - this.availabilityValue(a);
      }
      return this.availabilityValue(b) - this.availabilityValue(a);
    });
  });

  ngOnInit(): void {
    this.catalogService
      .getSites()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(sites => this.beaches.set(sites));
  }

  protected setFilter(filter: string): void {
    this.activeFilter.set(filter);
  }

  protected setSort(mode: string): void {
    this.sortMode.set(mode);
  }

  private priceValue(beach: BeachSite): number {
    return Number(beach.price.match(/\d+/)?.[0] ?? 0);
  }

  private availabilityValue(beach: BeachSite): number {
    return Number(beach.availability.match(/\d+/)?.[0] ?? 0);
  }
}
