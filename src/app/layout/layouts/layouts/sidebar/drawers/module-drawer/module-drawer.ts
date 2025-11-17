import { animate, state, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { ThemeService } from '../../../../../../shared/services/theme.service';
import { Subscription } from 'rxjs';

interface ModuleItem {
  id: string;
  name: string;
  icon: string;
  route: string;
  color: string;
  isActive: boolean;
  description?: string;
}

@Component({
  selector: 'app-module-drawer',
  imports: [
    CommonModule,
    MatIconModule
  ],
  templateUrl: './module-drawer.html',
  styleUrl: './module-drawer.scss',
  animations: [
    trigger('expandCollapse', [
      state('open', style({ height: '*', opacity: 1 })),
      state('closed', style({ height: '0px', opacity: 0 })),
      transition('open <=> closed', animate('300ms ease-in-out'))
    ])
  ]
})
export class ModuleDrawer implements OnInit {

  modulesList: ModuleItem[] = [];
  selectedModuleId: string | null = '1';
  activeTheme: string = localStorage.getItem('selectedTheme') || '';
  isLoading = true;
  error: string | null = null;
  private themeSub?: Subscription;

  constructor(
    private http: HttpClient,
    private themeService: ThemeService
  ) { }

  ngOnInit(): void {
    this.loadModulesList();
    this.themeSub = this.themeService.currentTheme$.subscribe(themeId => {
      this.activeTheme = themeId;
    });
  }

  loadModulesList(): void {
    let appList = JSON.parse(localStorage.getItem('appList') || '');
    const apps: ModuleItem[] = appList.map((m: any, index: number) => ({
        id: m.appId,
        name: m.appName,
        icon: '🏦',
        route: m.appUri,
        isActive: true,
    })
    );


    // Use dummy data instead of API call
    this.modulesList = apps;
    this.isLoading = false;
  }

  selectModule(moduleId: string): void {
    const selectedModule = this.modulesList.find(m => m.id === moduleId);

    if (!selectedModule) return;
    if (!selectedModule.isActive) return;

    if (this.selectedModuleId !== moduleId) {
      this.selectedModuleId = moduleId;
      // this.router.navigate([selectedModule.route]);
    }

  }

  // Check if module is selected
  isModuleSelected(moduleId: string): boolean {
    return this.selectedModuleId === moduleId;
  }

  // Check if module is clickable
  isModuleClickable(module: ModuleItem): boolean {
    return module.isActive && !this.isModuleSelected(module.id);
  }

  getModuleClasses(module: ModuleItem): string {
    const baseClasses = ' rounded-xl p-3 flex flex-col items-center text-center group relative transition-all';
    if (this.isModuleSelected(module.id)) {
      return `${baseClasses} border-3 border-green-600 cursor-default`;
    } else if (this.isModuleClickable(module)) {
      return `${baseClasses} cursor-pointer hover:shadow-lg hover:bg-gray-300`;
    } else {
      return `${baseClasses} opacity-60 cursor-not-allowed`;
    }
  }

  getIconClasses(module: ModuleItem): string {
    if (this.isModuleSelected(module.id)) {
      return `${module.color} scale-110`;
    } else if (this.isModuleClickable(module)) {
      return `${module.color} group-hover:scale-100`;
    } else {
      return `${module.color} opacity-70`;
    }
  }

  // Get currently selected module
  getSelectedModule(): ModuleItem | undefined {
    return this.modulesList.find(m => m.id === this.selectedModuleId);
  }

  ngOnDestroy(): void {
    this.themeSub?.unsubscribe();
  }

}
