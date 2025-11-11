import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './shared/services/theme.service';
import { GlobalActivityTrackerService } from './shared/services/global-activity-tracker.service';
import { NovuService } from './shared/services/novu.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  standalone: true,
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected title = 'LdsComponentProject';

  constructor(private themeService: ThemeService, private activityTracker: GlobalActivityTrackerService,private novuService: NovuService) {}

  async ngOnInit() {
    // Theme service will automatically initialize the saved theme
    const userId = localStorage.getItem('userId');
    debugger;
    if (userId) {
      console.log('Novu initializing for user:', userId);
      await this.novuService.init(userId, 'oH9Vf1VWV7s8');
    } else {
      console.warn('No userId found in localStorage. Novu not initialized.');
      // অপশনাল: লগইন পেজে রিডাইরেক্ট করুন
      // this.router.navigate(['/login']);
    }
  }
}
