import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { GuidePlace } from './bagni-catalog';

@Component({
  selector: 'app-guide-place-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="guide-place-card">
      <div class="guide-place-top">
        <span class="guide-place-type">{{ place.type }}</span>
        <span class="guide-place-tag">{{ place.tag }}</span>
      </div>
      <h3>{{ place.name }}</h3>
      <p>{{ place.description }}</p>
      <div class="guide-place-meta">
        <span>{{ place.distance }}</span>
        <span>{{ place.walk }} à pied</span>
      </div>
    </article>
  `,
})
export class GuidePlaceCardComponent {
  @Input({ required: true }) place!: GuidePlace;
}
