import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-stamp',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="stamp"
      [style.width.px]="size()"
      [style.height.px]="size()"
      [style.font-size.px]="size() * 0.155"
      [style.padding.px]="size() * 0.1"
      [style.transform]="'rotate(' + rotate() + 'deg)'"
    >
      <ng-content />
    </div>
  `,
  styles: `
    .stamp {
      border-radius: 50%;
      border: 2px double var(--primary);
      color: var(--primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-serif);
      font-style: italic;
      font-weight: 600;
      text-align: center;
      line-height: 1.15;
      opacity: 0.75;
      flex-shrink: 0;
    }
  `,
})
export class StampComponent {
  readonly size = input(80);
  readonly rotate = input(-6);
}
