import {
  Component,
  inject,
  signal,
  effect,
  HostListener,
  OnInit,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Topbar } from './topbar/topbar';
import { Sidebar } from './sidebar/sidebar';
import { SidebarStateService } from '../core/services/sidebar-state.service';

/**
 * Application shell: topbar + sidebar + routed outlet.
 *
 * Owns the responsive mode-resolution (mobile / tablet / desktop) and
 * updates the shared `SidebarStateService` so that:
 *   - topbar hamburger clicks toggle the sidebar across all modes
 *   - the sidebar reflects the correct layout state on resize
 *   - the `.layout-content` margin-left adjusts to the sidebar width
 *
 * The hamburger is **always visible** on every breakpoint, including
 * desktop — the user can collapse the sidebar on a wide screen too.
 */
@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [Topbar, Sidebar, RouterOutlet],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class Layout implements OnInit {
  readonly state = inject(SidebarStateService);

  /** Reactive left-margin for the content area based on sidebar mode + state. */
  readonly contentMargin = signal<string>('260px');

  constructor() {
    // Re-derive marginLeft whenever mode or open-state changes.
    effect(() => {
      const mode = this.state.mode();
      const open = this.state.isOpen();
      let m: string;
      if (mode === 'mobile') {
        m = '0';
      } else if (mode === 'tablet') {
        m = open ? '260px' : '72px';
      } else {
        // desktop — collapsed = hidden, expanded = 260px
        m = open ? '260px' : '0';
      }
      this.contentMargin.set(m);
    });
  }

  ngOnInit(): void {
    this.syncMode();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.syncMode();
  }

  private syncMode(): void {
    const w = window.innerWidth;
    const next: 'mobile' | 'tablet' | 'desktop' =
      w < 768 ? 'mobile' : w <= 1024 ? 'tablet' : 'desktop';
    if (next !== this.state.mode()) {
      this.state.setMode(next);
    }
  }

  onToggleSidebar(): void {
    this.state.toggle();
  }
}
