import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-bagni-logo',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="wordmark" [style.gap.px]="size() * 0.38">
      <svg
        [attr.width]="size() + 6"
        [attr.height]="size() + 6"
        viewBox="0 0 40 40"
        style="flex-shrink:0"
      >
        <circle cx="20" cy="20" r="18" fill="var(--primary)" />
        @for (seg of segments; track seg.i) {
          @if (seg.i % 2 !== 0) {
            <path [attr.d]="seg.d" fill="#FBF5E9" opacity="0.9" />
          }
        }
        <circle cx="20" cy="20" r="2.5" fill="var(--primary)" />
      </svg>
      <div>
        <div class="name" [style.font-size.px]="size()">Bagni Plage</div>
        @if (!compact()) {
          <div class="sub" [style.font-size.px]="size() * 0.46">dal 1962 · Ligurie</div>
        }
      </div>
    </div>
  `,
  styles: `
    .wordmark {
      display: flex;
      align-items: center;
    }
    .name {
      font-family: var(--font-display);
      color: var(--ink);
      letter-spacing: 0.02em;
      line-height: 1;
    }
    .sub {
      font-family: var(--font-serif);
      font-style: italic;
      color: var(--ink-soft);
      letter-spacing: 0.04em;
      margin-top: 2px;
    }
  `,
})
export class BagniLogoComponent {
  readonly size = input(22);
  readonly compact = input(false);

  readonly segments = Array.from({ length: 8 }, (_, i) => {
    const a = i * 45;
    const startRad = ((a - 22.5) * Math.PI) / 180;
    const endRad = ((a + 22.5) * Math.PI) / 180;
    const x1 = +(20 + 18 * Math.cos(startRad)).toFixed(3);
    const y1 = +(20 + 18 * Math.sin(startRad)).toFixed(3);
    const x2 = +(20 + 18 * Math.cos(endRad)).toFixed(3);
    const y2 = +(20 + 18 * Math.sin(endRad)).toFixed(3);
    return { i, d: `M 20 20 L ${x1} ${y1} A 18 18 0 0 1 ${x2} ${y2} Z` };
  });
}
