import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './layout/header/header';
import { SidebarComponent } from './layout/sidebar/sidebar';
import { FooterComponent } from './layout/footer/footer';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, HeaderComponent, SidebarComponent, FooterComponent],
  template: `
    @if (auth.isAuthenticated() && auth.isConcessionnaire()) {
      <div class="app-shell">
        <app-sidebar />
        <div class="app-main">
          <div class="app-content">
            <router-outlet />
          </div>
        </div>
      </div>
    } @else {
      <div class="app-main-nosidebar">
        <app-header />
        <div class="app-content">
          <router-outlet />
        </div>
        <app-footer />
      </div>
    }
  `,
})
export class AppComponent {
  protected auth = inject(AuthService);
}
