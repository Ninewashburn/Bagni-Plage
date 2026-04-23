import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-avatar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="avatar"
      [style.width.px]="size()"
      [style.height.px]="size()"
      [style.background]="color()"
      [style.font-size.px]="size() * 0.4"
    >
      {{ initials() }}
    </div>
  `,
})
export class AvatarComponent {
  readonly initials = input('?');
  readonly color = input('var(--primary)');
  readonly size = input(36);
}
