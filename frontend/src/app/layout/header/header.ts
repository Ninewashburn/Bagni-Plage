import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
})
export class HeaderComponent {
  protected auth = inject(AuthService);
  protected theme = inject(ThemeService);
  private router = inject(Router);

  protected goToGuide(section: string | null, event: MouseEvent): void {
    event.preventDefault();
    this.router.navigate(['/guide'], { fragment: section ?? undefined }).then(() => {
      setTimeout(() => {
        if (!section) {
          document.querySelector('.app-content')?.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
        document.getElementById(section)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }
}
