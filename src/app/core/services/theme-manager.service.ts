import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type AppTheme = 'auto' | 'light' | 'dark';

const STORAGE_KEY = 'angular-material.dev';

/**
 * Demo-faithful theme manager.
 *
 * Mirrors demo's `ThemeManager` (used by the navbar Theme menu):
 *   - Stores the user's choice under the key `angular-material.dev`.
 *   - Toggles `<html data-bs-theme>` + `<html class="dark-theme">`.
 *   - When `theme === 'auto'`, watches `prefers-color-scheme: dark`.
 *
 * For the current modern UI scope we ONLY persist the user's choice
 * and react to system dark mode by emitting on `isDark$`. Wiring a
 * full dark-theme stylesheet is left for a later iteration.
 */
@Injectable({ providedIn: 'root' })
export class ThemeManagerService {
  private readonly _currentTheme$ = new BehaviorSubject<AppTheme>(this.readStoredTheme());
  readonly currentTheme$ = this._currentTheme$.asObservable();

  private readonly _isDark$ = new BehaviorSubject<boolean>(this.computeIsDark(this._currentTheme$.value));
  readonly isDark$ = this._isDark$.asObservable();

  private mediaQuery: MediaQueryList | null = null;
  private mediaListener: ((e: MediaQueryListEvent) => void) | null = null;

  constructor() {
    this.applyTheme(this._currentTheme$.value);
    this.watchSystemTheme();
  }

  get currentTheme(): AppTheme {
    return this._currentTheme$.value;
  }

  /** Change the active theme. */
  changeTheme(theme: AppTheme): void {
    this._currentTheme$.next(theme);
    this.applyTheme(theme);
    this._isDark$.next(this.computeIsDark(theme));
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* localStorage unavailable — silently skip */
    }
  }

  private readStoredTheme(): AppTheme {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw === 'light' || raw === 'dark' || raw === 'auto') return raw;
    } catch {
      /* fall through */
    }
    return 'auto';
  }

  private applyTheme(theme: AppTheme): void {
    const html = document.documentElement;
    html.setAttribute('data-bs-theme', theme);
    if (this.computeIsDark(theme)) {
      html.classList.add('dark-theme');
    } else {
      html.classList.remove('dark-theme');
    }
  }

  private computeIsDark(theme: AppTheme): boolean {
    if (theme === 'dark') return true;
    if (theme === 'light') return false;
    // auto
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  }

  private watchSystemTheme(): void {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.mediaListener = () => {
      if (this._currentTheme$.value === 'auto') {
        this._isDark$.next(this.mediaQuery?.matches ?? false);
        this.applyTheme('auto');
      }
    };
    this.mediaQuery.addEventListener('change', this.mediaListener);
  }
}