import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { environment } from '../environments/environment';
import { LoaderComponent } from './shared/common-components/loader/loader.component';
import { AuthService } from './core/auth/auth.service';
import { UserService } from './core/user/user.service';
import { User } from './core/user/user.types';
import { ThemeService } from './shared/services/theme.service';
import { GlobalActivityTrackerService } from './shared/services/global-activity-tracker.service';
import { NovuService } from './shared/services/novu.service';
import { LoaderService } from './shared/services/loader.service';
import { SidebarService } from './layout/service/sidebar.service';
import { ButtonUtils } from './shared/constant/button-signals.constant';
import { BrandingService } from './core/services/branding.service';
import { AuthenticationService } from './core/services/authentication.service';
import { SuccessOrErrorPopup } from './shared/components/success-or-error-popup/success-or-error-popup';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LoaderComponent, SuccessOrErrorPopup, CommonModule],
  templateUrl: './app.html',
  standalone: true,
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected title = 'Microfont POC';
  authService = inject(AuthService);
  private userService = inject(UserService);
  private router = inject(Router);
  private themeService = inject(ThemeService);
  private loaderService = inject(LoaderService);
  private activityTracker = inject(GlobalActivityTrackerService);
  private rootTitle = inject(Title);
  private sidebarService = inject(SidebarService);
  private novuService = inject(NovuService);
  private branding = inject(BrandingService);
  private demoAuth = inject(AuthenticationService);
  userId: string = '';

  constructor() {
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      takeUntilDestroyed(),
    ).subscribe((event: NavigationEnd) => {
      const url = event.urlAfterRedirects;
      const resetRoutes = ['/', '/dashboard'];
      if (resetRoutes.includes(url)) {
        ButtonUtils.resetAll();
      }
    });
  }

  async ngOnInit() {
    const isAuthenticated = await this.authService.init();
    const currentPath = window.location.pathname;

    if (this.branding.isReady()) {
      this.rootTitle.setTitle(`${this.branding.displayName()} Internet Banking`);
    }

    if (isAuthenticated) {
      this.authService.decodeToken();
      this.authService.getResources().subscribe({
        next: (res) => {
          localStorage.setItem('resourceList', JSON.stringify(res));
          this.sidebarService.notifyResourceListReady();
        },
        error: (error) => {
          console.error('Error loading resources:', error);
          localStorage.setItem('resourceList', '[]');
          this.sidebarService.notifyResourceListReady();
        }
      });

      this.authService.getUserWiseApplications().subscribe({
        next: (res) => {
          localStorage.setItem('appList', JSON.stringify(res));
          this.sidebarService.notifyAppListReady();
        },
        error: (error) => {
          console.error('Error loading applications:', error);
          localStorage.setItem('appList', '[]');
          this.sidebarService.notifyAppListReady();
        }
      });
    }

    this.demoAuth.currentUser.subscribe((user) => {
      if (user) {
        this.userId = user.userName;
      }
    });

    this.userService.user$.subscribe((user: User) => {
      this.userId = user.username;
    });
  }
}