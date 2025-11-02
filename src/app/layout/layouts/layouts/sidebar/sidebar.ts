import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MenuDrawer } from './drawers/menu-drawer/menu-drawer';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { ProfileDrawer } from './drawers/profile-drawer/profile-drawer';
import { RouterLink } from '@angular/router';
import { Search } from '../navbar/actions/search/search';
import { Subscription } from 'rxjs';
import { ThemeService } from '../../../../shared/services/theme.service';
import { SidebarService } from '../../../service/sidebar.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    MatIcon,
    MenuDrawer,
    TitleCasePipe,
    CommonModule,
    ProfileDrawer,
    RouterLink,
    Search
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class Sidebar {
  // Existing properties
  activeItem: string = '';
  drawerOpen: boolean = false;
  drawerType: string = '';
  activeTheme: string = localStorage.getItem('selectedTheme') || '';

  // New property for sidebar expansion
  sidebarExpanded: boolean = false;
   private subs = new Subscription();
  private themeSub?: Subscription;
  constructor(private themeService: ThemeService,
    private sidebarService: SidebarService
  ) {}
  // Toggle sidebar expansion (Gmail-style)
    toggleSidebar(): void {
    this.sidebarExpanded = !this.sidebarExpanded;
    }

  ngOnInit(): void {
    // ✅ Subscribe to theme changes
    this.themeSub = this.themeService.currentTheme$.subscribe(themeId => {
      this.activeTheme = themeId;
    });

    this.subs.add(
      this.sidebarService.sidebarExpanded$.subscribe(expanded => {
        this.sidebarExpanded = expanded;
        console.log('Sidebar expanded:', expanded);
      })
    );
    console.log('Active Theme in Sidebar:', this.activeTheme);
  }

  ngOnDestroy(): void {
    this.themeSub?.unsubscribe();
  }
  // Existing methods
  setActiveItem(item: string): void {
    this.activeItem = item;
  }

  toggleDrawer(type: string): void {
    if (this.drawerType === type && this.drawerOpen) {
      this.drawerOpen = false;
    } else {
      this.drawerType = type;
      this.drawerOpen = true;
    }
  }
}