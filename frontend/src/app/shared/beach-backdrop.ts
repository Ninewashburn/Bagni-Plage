import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-beach-backdrop',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="beach-backdrop" [style.height.px]="height()">
      <div class="sun"></div>
      @for (row of rows; track row) {
        <div class="parasol-row" [style.top]="52 + row * 13 + '%'">
          @for (col of cols; track col) {
            <div
              class="parasol-dot"
              [class.dot-primary]="(col + row) % 3 === 0"
              [class.dot-accent]="(col + row) % 3 === 1"
            ></div>
          }
        </div>
      }
      <svg class="waves-svg" viewBox="0 0 400 20" preserveAspectRatio="none">
        <path
          d="M0 10 Q 50 0, 100 10 T 200 10 T 300 10 T 400 10"
          fill="none"
          stroke="#FBF5E9"
          stroke-width="1.5"
          opacity="0.5"
        />
        <path
          d="M0 15 Q 50 8, 100 15 T 200 15 T 300 15 T 400 15"
          fill="none"
          stroke="#FBF5E9"
          stroke-width="1"
          opacity="0.3"
        />
      </svg>
    </div>
  `,
  styles: `
    .beach-backdrop {
      position: relative;
      overflow: hidden;
      background: linear-gradient(
        180deg,
        var(--sea) 0%,
        var(--sea-deep) 42%,
        var(--sand) 44%,
        var(--sand) 100%
      );
    }

    .sun {
      position: absolute;
      top: 22px;
      right: 60px;
      width: 72px;
      height: 72px;
      border-radius: 50%;
      background: var(--accent);
      opacity: 0.88;
      filter: blur(1px);
    }

    .parasol-row {
      position: absolute;
      left: 0;
      right: 0;
      display: flex;
      justify-content: space-around;
      padding: 0 20px;
    }

    .parasol-dot {
      width: 13px;
      height: 13px;
      border-radius: 50%;
      background: #fbf5e9;
      box-shadow: 0 2px 0 rgba(43, 29, 19, 0.28);
      flex-shrink: 0;

      &.dot-primary {
        background: var(--primary);
      }
      &.dot-accent {
        background: var(--accent);
      }
    }

    .waves-svg {
      position: absolute;
      top: 40%;
      left: 0;
      width: 100%;
      pointer-events: none;
    }
  `,
})
export class BeachBackdropComponent {
  readonly height = input(280);
  readonly rows = [0, 1, 2, 3];
  readonly cols = Array.from({ length: 12 }, (_, i) => i);
}
