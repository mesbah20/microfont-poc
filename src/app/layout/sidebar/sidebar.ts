import {
  Component,
  computed,
  inject,
  signal,
  DestroyRef,
  HostListener,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  NavigationEnd,
} from '@angular/router';
import { filter, startWith } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

import { MenuService } from '../../core/services/menu.service';
import { BrandingService } from '../../core/services/branding.service';
import { AuthenticationService } from '../../core/services/authentication.service';
import { ConfirmationDialogService } from '../../shared/components/confirmation-dialog/confirmation-dialog.service';
import { SidebarStateService } from '../../core/services/sidebar-state.service';
import { iconForMenu } from '../../core/services/menu-icon.map';
import { IMenu } from '../../core/models/menu.model';

interface NavLeaf {
  key: string;
  label: string;
  localTitle: string;
  route: string;
  icon: string;
  parentKey?: string;
}

interface NavNode {
  key: string;
  label: string;
  icon: string;
  url?: string;
  children?: NavLeaf[];
  /** True when this node has nested children (renders as an accordion). */
  expandable: boolean;
}

/**
 * Sidebar — modern banking (CBPLC theme + AdminLTE collapsed pattern)
 *
 * Layout architecture:
 *
 *   ┌──────────────────────────────────────────┐
 *   │ [🏦 Logo] Citizens Bank                  │  ← Brand header (white)
 *   ├──────────────────────────────────────────┤
 *   │ 🔍 Search menu…                          │  ← Nav filter
 *   │                                          │
 *   │  Accounts              ▾                 │  ← Accordion parents
 *   │  Requests              ▸                 │     (white bg)
 *   │  History              ▸                 │
 *   │  ─────                                 │
 *   │  Fund Transfer                           │  ← Leaf items
 *   │  Bill Pay                                │
 *   │  Top Up                                  │
 *   │  Change Password                          │
 *   ├──────────────────────────────────────────┤
 *   │ [⤴️  Sign out]                           │  ← Pinned, red, no
 *   └──────────────────────────────────────────┘     profile link
 *
 * Color palette (effective combination):
 *   - Brand header  →  white   (#ffffff)    → logo stands out cleanly
 *   - Search bar    →  white   (#ffffff)    → fits modern banking UI
 *   - Parent nav    →  white   (#ffffff)    → clean, professional
 *   - Submenu items →  slate   (#f1f5f9)    → user-requested "light dark"
 *   - Footer        →  slate   (#f8fafc)    → subtle bottom tier
 *   - Sign-out      →  red     (#dc2626)    → demo brand-primary, pops out
 *
 * Three layout modes (driven by `SidebarStateService.mode`):
 *   - desktop (> 1024px): collapsible (hamburger toggle), 260px expanded
 *   - tablet  (768–1024): can also open at 260px or collapse to 72px rail
 *   - mobile  (< 768px):  off-canvas drawer with backdrop
 */
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    RouterLinkActive,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar implements OnInit {
  private readonly branding = inject(BrandingService);
  private readonly menuService = inject(MenuService);
  private readonly auth = inject(AuthenticationService);
  private readonly confirm = inject(ConfirmationDialogService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  readonly state = inject(SidebarStateService);

  // ============ Brand ============
  logoUrl = computed(() => this.branding.logoUrl());
  bankName = computed(() => this.branding.bankName());
  displayName = computed(() => this.branding.displayName());

  // ============ User (used only for avatar fallback) ============
  userName = computed(() => {
    const u: any = this.auth.currentUserValue;
    return u?.fullName || u?.userName || 'Customer';
  });

  // ============ Search ============
  navSearch = signal('');

  // ============ Nav ============
  /** Build flat nav tree from MenuService, preserving parents with children. */
  readonly nav = computed<NavNode[]>(() => {
    const out: NavNode[] = [];
    for (const item of this.menuService.getMainMenu()) {
      if (!item.enabled) continue;
      if (item.url) {
        out.push({
          key: item.key,
          label: item.title,
          icon: iconForMenu(item),
          url: item.url,
          expandable: false,
        });
      } else if (item.children?.length) {
        const leaves: NavLeaf[] = [];
        for (const child of item.children) {
          if (!child.enabled) continue;
          leaves.push({
            key: child.key,
            label: child.title,
            localTitle: child.localTitle,
            route: child.url ?? '#',
            icon: iconForMenu(child),
            parentKey: item.key,
          });
        }
        if (leaves.length) {
          out.push({
            key: item.key,
            label: item.title,
            icon: iconForMenu(item),
            children: leaves,
            expandable: true,
          });
        }
      }
    }
    return out;
  });

  /** Currently expanded accordion parent key (only one at a time). */
  expandedKey = signal<string | null>(null);

  /** Auto-open the accordion whose prefix matches the current route. */
  private readonly routePrefixMap: Record<string, string> = {
    '/account/': 'ACCOUNTS',
    '/myservices/': 'SERVICES',
    '/history/': 'HISTORY',
  };

  /** Filtered nav list driven by search text. */
  readonly filteredNav = computed<NavNode[]>(() => {
    const term = this.navSearch().trim().toLowerCase();
    if (!term) return this.nav();
    const out: NavNode[] = [];
    for (const node of this.nav()) {
      if (!node.expandable) {
        if (node.label.toLowerCase().includes(term) || node.key.toLowerCase().includes(term)) {
          out.push(node);
        }
        continue;
      }
      const matched: NavLeaf[] = (node.children ?? []).filter((c) => {
        const hay = `${c.label} ${c.localTitle} ${c.key}`.toLowerCase();
        return hay.includes(term);
      });
      if (matched.length) {
        out.push({ ...node, children: matched });
      } else if (node.label.toLowerCase().includes(term)) {
        out.push(node);
      }
    }
    return out;
  });

  readonly hasResults = computed(() => this.filteredNav().length > 0);

  ngOnInit(): void {
    // Auto-expand the right accordion based on the current route.
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        startWith(null),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.syncExpandedFromRoute());
  }

  private syncExpandedFromRoute(): void {
    const url = this.router.url;
    for (const [prefix, key] of Object.entries(this.routePrefixMap)) {
      if (url.startsWith(prefix)) {
        this.expandedKey.set(key);
        return;
      }
    }
    // For deep-leaves outside the prefix map, expand the parent by looking
    // for the leaf whose route matches.
    for (const node of this.nav()) {
      if (!node.expandable) continue;
      const hit = node.children?.some((c) => url.startsWith(c.route));
      if (hit) {
        this.expandedKey.set(node.key);
        return;
      }
    }
  }

  // ============ Actions ============
  toggleMobile(): void {
    this.state.toggle();
  }

  closeMobile(): void {
    if (this.state.mode() === 'mobile') this.state.close();
  }

  toggleAccordion(key: string): void {
    this.expandedKey.update((current) => (current === key ? null : key));
  }

  isExpanded(key: string): boolean {
    return this.expandedKey() === key;
  }

  onSearchChange(value: string): void {
    this.navSearch.set(value);
  }

  clearSearch(): void {
    this.navSearch.set('');
  }

  onSignOut(): void {
    this.closeMobile();
    this.confirm
      .confirm({
        title: 'Sign out',
        message: 'Are you sure you want to end your session?',
        btnOkText: 'Sign out',
        btnCancelText: 'Cancel',
        tone: 'danger',
      })
      .subscribe((ok) => {
        if (ok) this.auth.logout();
      });
  }

  @HostListener('window:resize')
  onResize(): void {
    this.syncMode();
  }

  private syncMode(): void {
    const w = window.innerWidth;
    const next: 'mobile' | 'tablet' | 'desktop' =
      w < 768 ? 'mobile' : w <= 1024 ? 'tablet' : 'desktop';
    if (next !== this.state.mode()) this.state.setMode(next);
  }
}
