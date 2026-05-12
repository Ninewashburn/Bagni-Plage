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
import { CatalogService } from '../../core/services/catalog.service';
import { BEACH_SITES, GUIDE_PLACES, GuidePlace } from '../../shared/bagni-catalog';
import { GuidePlaceCardComponent } from '../../shared/guide-place-card';

@Component({
  selector: 'app-guide-local',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [GuidePlaceCardComponent],
  templateUrl: './guide-local.html',
})
export class GuideLocalComponent implements OnInit {
  private catalogService = inject(CatalogService);
  private destroyRef = inject(DestroyRef);

  protected readonly categories = [
    'Tous',
    'Restaurants',
    'Parkings',
    'Activités nautiques',
    'Promenades',
    'Marchés',
    'Points de vue',
  ];
  protected readonly sites = [{ slug: 'tous', name: 'Toutes les plages' }, ...BEACH_SITES];

  protected places = signal<GuidePlace[]>(GUIDE_PLACES);
  protected activeCategory = signal('Tous');
  protected activeSite = signal('tous');

  protected filteredPlaces = computed(() =>
    this.places().filter(place => {
      const categoryMatches =
        this.activeCategory() === 'Tous' || place.category === this.activeCategory();
      const siteMatches = this.activeSite() === 'tous' || place.siteSlug === this.activeSite();
      return categoryMatches && siteMatches;
    }),
  );

  ngOnInit(): void {
    this.catalogService
      .getGuidePlaces()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(places => this.places.set(places));
  }

  protected setCategory(category: string): void {
    this.activeCategory.set(category);
  }

  protected setSite(slug: string): void {
    this.activeSite.set(slug);
  }
}
