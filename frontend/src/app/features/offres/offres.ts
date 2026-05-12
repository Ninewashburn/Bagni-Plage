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
import { PassService } from '../../core/services/pass.service';
import { BAGNI_OFFERS, BagniOffer, QR_CELLS } from '../../shared/bagni-catalog';

@Component({
  selector: 'app-offres',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './offres.html',
})
export class OffresComponent implements OnInit {
  protected auth = inject(AuthService);
  protected passService = inject(PassService);
  private catalogService = inject(CatalogService);
  private destroyRef = inject(DestroyRef);

  protected offers = signal<BagniOffer[]>(BAGNI_OFFERS);
  protected selectedOffer = signal<string | null>(null);
  protected activatedOffer = signal<string | null>(
    this.passService.activePass()?.offerName ?? null,
  );
  protected readonly qrCells = QR_CELLS;

  protected recommendedOffer = computed(
    () => this.offers().find(offer => offer.recommended) ?? this.offers()[1] ?? this.offers()[0],
  );

  ngOnInit(): void {
    this.catalogService
      .getOffers()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(offers => this.offers.set(offers));
  }

  protected selectOffer(offer: BagniOffer): void {
    this.selectedOffer.set(offer.name);
  }

  protected activateOffer(offer: BagniOffer): void {
    this.passService.activate(offer);
    this.activatedOffer.set(offer.name);
  }
}
