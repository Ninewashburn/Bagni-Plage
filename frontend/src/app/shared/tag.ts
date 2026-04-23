import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-tag',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="tag" [class]="'tag--' + variant()"><ng-content /></span>`,
})
export class TagComponent {
  readonly variant = input<
    'pending' | 'accepted' | 'refused' | 'past' | 'sea' | 'primary' | 'default'
  >('default');
}
