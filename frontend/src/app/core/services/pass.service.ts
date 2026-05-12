import { Injectable, computed, signal } from '@angular/core';
import { BagniOffer } from '../../shared/bagni-catalog';

export interface ActiveBagniPass {
  offerName: string;
  badge: string;
  price: string;
  credits: string;
  discount: string;
  activatedAt: string;
  validUntil: string;
}

const STORAGE_KEY = 'bagni.active-pass';

@Injectable({ providedIn: 'root' })
export class PassService {
  private readonly activePassSignal = signal<ActiveBagniPass | null>(this.readStoredPass());

  readonly activePass = this.activePassSignal.asReadonly();
  readonly hasActivePass = computed(() => this.activePassSignal() !== null);

  activate(offer: BagniOffer): void {
    const now = new Date();
    const validUntil = new Date(now);
    validUntil.setMonth(validUntil.getMonth() + 3);

    const pass: ActiveBagniPass = {
      offerName: offer.name,
      badge: offer.badge,
      price: offer.price,
      credits: offer.credits || 'Selon réservation',
      discount: offer.discount || '-',
      activatedAt: now.toISOString(),
      validUntil: validUntil.toISOString(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(pass));
    this.activePassSignal.set(pass);
  }

  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.activePassSignal.set(null);
  }

  private readStoredPass(): ActiveBagniPass | null {
    try {
      const rawPass = localStorage.getItem(STORAGE_KEY);
      return rawPass ? (JSON.parse(rawPass) as ActiveBagniPass) : null;
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  }
}
