import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './shared/services/theme.service';
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

  constructor(private themeService: ThemeService,
    public loaderService: LoaderService
  ) {}

  ngOnInit() {
    // Theme service will automatically initialize the saved theme
  }
}
