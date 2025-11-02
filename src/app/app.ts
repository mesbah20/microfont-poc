import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './shared/services/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  standalone: true,
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected title = 'LdsComponentProject';

  constructor(private themeService: ThemeService) {}

  ngOnInit() {
    // Theme service will automatically initialize the saved theme
  }
}
