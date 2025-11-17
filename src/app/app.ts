import {Component, inject, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import {Router, RouterOutlet} from '@angular/router';
import { ThemeService } from './shared/services/theme.service';
import { GlobalActivityTrackerService } from './shared/services/global-activity-tracker.service';
import { NovuService } from './shared/services/novu.service';
import { LoaderService } from './shared/services/loader.service';
import { LoaderComponent } from './shared/components/loader/loader.component';
import {Title} from '@angular/platform-browser';
import pkg from '../../package.json';
import {KeyclockService} from './core/service/keyclock.service';
import {AuthService} from './core/auth/auth.service';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LoaderComponent, CommonModule],
  templateUrl: './app.html',
  standalone: true,
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected title = 'LdsComponentProject';
  authService = inject(AuthService);

  constructor(private themeService: ThemeService,
              public loaderService: LoaderService,
              private router: Router,
              private activityTracker: GlobalActivityTrackerService,
              private rootTitle: Title,
              private novuService: NovuService) {}




  async ngOnInit() {
    // const isAuthenticated = await this.authService.init();
    // //debugger;
    // const currentPath = window.location.pathname;
    //
    // if (isAuthenticated) {
    //   this.authService.decodeToken();
    //   // if (currentPath === '/login' || currentPath === '/') {
    //   //   this.router.navigate(['/home']);
    //   // }
    // }
    // else {
    //   if (currentPath !== '/login') {
    //     this.router.navigate(['/login']);
    //   }
    // }

    //console.log(this.authService.getToken())
    this.rootTitle.setTitle(pkg.name || 'Default Title');
    // Theme service will automatically initialize the saved theme
    const userId = localStorage.getItem('userId');
    if (userId) {
      console.log('Novu initializing for user:', userId);
      // await this.novuService.init(userId, 'oH9Vf1VWV7s8');
      await this.novuService.init(userId, 'EDstW_4loKyp');
    } else {
      console.warn('No userId found in localStorage. Novu not initialized.');
      // অপশনাল: লগইন পেজে রিডাইরেক্ট করুন
      // this.router.navigate(['/login']);
    }
  }
}
