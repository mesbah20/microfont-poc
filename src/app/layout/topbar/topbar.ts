import {
  Component,
  computed,
  inject,
  signal,
  DestroyRef,
  EventEmitter,
  HostListener,
  Output,
  OnInit,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { toSignal } from '@angular/core/rxjs-interop';
import { BrandingService } from '../../core/services/branding.service';
import { AuthenticationService } from '../../core/services/authentication.service';
import { ThemeManagerService, AppTheme } from '../../core/services/theme-manager.service';
import { ConfirmationDialogService } from '../../shared/components/confirmation-dialog/confirmation-dialog.service';
import { NotificationsMenuComponent } from '../../shared/components/notifications-menu/notifications-menu';
import { SidebarStateService } from '../../core/services/sidebar-state.service';


@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    MatBadgeModule,
    MatTooltipModule,
    NotificationsMenuComponent,
  ],
  templateUrl: './topbar.html',
  styleUrl: './topbar.scss',
})
export class Topbar implements OnInit {
  private readonly branding = inject(BrandingService);
  private readonly auth = inject(AuthenticationService);
  private readonly theme = inject(ThemeManagerService);
  private readonly confirm = inject(ConfirmationDialogService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly elementRef = inject(ElementRef);
  readonly sidebarState = inject(SidebarStateService);

  logoUrl = computed(() => this.branding.logoUrl());
  displayName = computed(() => this.branding.displayName());

  // ============ User state ============
  readonly currentUser = toSignal(this.auth.currentUser, {
    initialValue: this.auth.currentUserValue,
  });

  userName = computed(() => {
    const u = this.currentUser() as any;
    return u?.fullName || u?.userName || 'Guest';
  });

  userEmail = computed(() => {
    const u: any = this.currentUser();
    return u?.email || u?.mailAddress || '';
  });

  isFirstLogin = computed(() => !!(this.currentUser() as any)?.isFirstLogin);

  userInitials = computed(() => {
    const n = this.userName().trim();
    if (!n) return 'U';
    const parts = n.split(/\s+/);
    return (
      ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() ||
      n[0].toUpperCase()
    );
  });

  // ============ BD clock ============
  bdTime = signal(this.formatBDTime(new Date()));

  // ============ Theme ============
  readonly themeOptions: Array<{ value: AppTheme; label: string; icon: string }> = [
    { value: 'auto', label: 'System', icon: 'desktop_windows' },
    { value: 'light', label: 'Light', icon: 'light_mode' },
    { value: 'dark', label: 'Dark', icon: 'dark_mode' },
  ];
  currentTheme = toSignal(this.theme.currentTheme$, {
    initialValue: this.theme.currentTheme,
  });

  // ============ Mobile sheet ============
  mobileMenuOpen = signal(false);

  @Output() toggleSidebar = new EventEmitter<void>();

  ngOnInit(): void {
    // Live BD time (updates every second).
    const id = setInterval(() => this.bdTime.set(this.formatBDTime(new Date())), 1000);
    this.destroyRef.onDestroy(() => clearInterval(id));
  }

  private formatBDTime(d: Date): string {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Dhaka',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }).format(d);
  }

  // ============ Actions ============
  onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update((v) => !v);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  setTheme(value: AppTheme): void {
    this.theme.changeTheme(value);
  }

  onSignOut(): void {
    this.closeMobileMenu();
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

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.mobileMenuOpen()) return;
    const host = this.elementRef.nativeElement as HTMLElement;
    if (!host.contains(event.target as Node)) {
      this.mobileMenuOpen.set(false);
    }
  }
}