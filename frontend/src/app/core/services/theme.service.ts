import { Injectable, effect, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly STORAGE_KEY = 'dark_mode';

  readonly isDark = signal<boolean>(localStorage.getItem(this.STORAGE_KEY) !== 'false');

  private readonly syncTheme = effect(() => {
    const dark = this.isDark();
    document.documentElement.classList.toggle('dark-theme', dark);
    localStorage.setItem(this.STORAGE_KEY, String(dark));
  });

  toggle(): void {
    this.isDark.update(v => !v);
  }
}
