import { Injectable, signal } from '@angular/core';

/**
 * Shared sidebar state.
 *
 * Owns the `isOpen` boolean that the topbar hamburger toggles and the
 * sidebar reacts to. Keeping the state in a singleton service lets the
 * topbar emit an event into the sidebar without `@ViewChild` plumbing
 * and survives component re-creation if the layout ever rebuilds.
 *
 * Three layout modes are encoded by `mode`:
 *   - 'mobile'  (< 768px)   → off-canvas drawer, slide-in with backdrop
 *   - 'tablet'  (768–1024) → 72px icon-only rail with hover pop-out
 *   - 'desktop' (> 1024)   → 260px full sidebar, accordion expand on click
 *
 * The hamburger toggle now works in ALL modes (desktop included) so the
 * user can collapse the sidebar on a wide screen too — mirroring the
 * AdminLTE behaviour where the menu icon is always present.
 */
@Injectable({ providedIn: 'root' })
export class SidebarStateService {
  /** True when the sidebar should render in its expanded visual form. */
  readonly isOpen = signal<boolean>(true);

  /** Current layout mode, derived from window width by the layout. */
  readonly mode = signal<'mobile' | 'tablet' | 'desktop'>('desktop');

  toggle(): void {
    this.isOpen.update((v) => !v);
  }

  open(): void {
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
  }

  /**
   * Update layout mode from window size. Preserves the user's current
   * open/closed preference — only mobile→desktop loads force-open so
   * the user is never surprised.
   */
  setMode(mode: 'mobile' | 'tablet' | 'desktop'): void {
    const previous = this.mode();
    this.mode.set(mode);
    // Only force-open when we transition from mobile → desktop (so a
    // fresh desktop session shows the sidebar). Otherwise keep the
    // user's toggle state intact.
    if (previous === 'mobile' && mode === 'desktop') {
      this.isOpen.set(true);
    }
  }
}
