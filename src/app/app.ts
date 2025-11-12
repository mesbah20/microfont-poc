import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './shared/services/theme.service';
import { GlobalActivityTrackerService } from './shared/services/global-activity-tracker.service';
import { NovuService } from './shared/services/novu.service';
import { LoaderService } from './shared/services/loader.service';
import { LoaderComponent } from './shared/components/loader/loader.component';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LoaderComponent, CommonModule],
  templateUrl: './app.html',
  standalone: true,
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected title = 'LdsComponentProject';


  constructor(private themeService: ThemeService,  public loaderService: LoaderService, private activityTracker: GlobalActivityTrackerService,private novuService: NovuService) {}




  async ngOnInit() {
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
