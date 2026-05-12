import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { API_BASE_URL } from '../api-url';
import {
  BAGNI_OFFERS,
  BEACH_SITES,
  BagniOffer,
  BeachSite,
  GUIDE_PLACES,
  GuidePlace,
} from '../../shared/bagni-catalog';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly apiUrl = inject(API_BASE_URL);
  private readonly http = inject(HttpClient);

  getSites(): Observable<BeachSite[]> {
    return this.http
      .get<BeachSite[]>(`${this.apiUrl}/sites`)
      .pipe(catchError(() => of(BEACH_SITES)));
  }

  getSite(slug: string): Observable<BeachSite> {
    return this.http
      .get<BeachSite>(`${this.apiUrl}/sites/${slug}`)
      .pipe(catchError(() => of(BEACH_SITES.find(site => site.slug === slug) ?? BEACH_SITES[0])));
  }

  getGuidePlaces(siteSlug?: string): Observable<GuidePlace[]> {
    const params = siteSlug ? { siteSlug } : undefined;
    return this.http
      .get<GuidePlace[]>(`${this.apiUrl}/guide-places`, { params })
      .pipe(
        catchError(() =>
          of(GUIDE_PLACES.filter(place => !siteSlug || place.siteSlug === siteSlug)),
        ),
      );
  }

  getOffers(): Observable<BagniOffer[]> {
    return this.http
      .get<BagniOffer[]>(`${this.apiUrl}/offers`)
      .pipe(catchError(() => of(BAGNI_OFFERS)));
  }
}
