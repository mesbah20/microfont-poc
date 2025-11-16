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
    // const apiUrl = 'http://192.168.20.93:8091/api/user-login/get-user-access-list';
    // const params = {
    //   userId: localStorage.getItem('userId'),
    //   appId: '133',
    //   itemType: 'F',
    //   isHoUser: '0'
    // };

    // this.http.get<UserAccessItem[]>(apiUrl, { params: params as any })
    //   .subscribe({
    //     next: (data) => {
    //       this.userAccessList = data;
    //       localStorage.setItem('userAccessList', JSON.stringify(data));
    //       this.isLoading = false;
    //     },
    //     error: (err) => {
    //       console.error('Error loading user access list:', err);
    //       this.error = 'Failed to load menu items';
    //       this.isLoading = false;
    //     }
    //   });

    //------------ testing with dummy data ------------
    const dummyData: ModuleItem[] = [
      {
        id: '1',
        name: 'Nexo',
        icon: '🏦', 
        // icon: 'account_balance',
        route: '/nexo',
        color: 'from-blue-500 to-cyan-500',
        isActive: true,
        description: 'Manage stocks & warehouses'
      },
      {
        id: '2',
        name: 'Access Control',
        icon: '🔐',
        // icon: 'lock_outline',
        route: '/access-control',
        color: 'from-gray-800 to-gray-600',
        isActive: true,
        description: 'Manage users, roles & permissions'
      },
      {
        id: '3',
        name: 'Recruitment',
        icon: '📝',
        // icon: 'edit',
        route: '/recruitment',
        color: 'from-pink-500 to-rose-500',
        isActive: true,
        description: 'Post jobs & manage applicants'
      },
      {
        id: '4',
        name: 'Employee',
        icon: '👥',
        // icon: 'people_outline',
        route: '/employee',
        color: 'from-indigo-500 to-purple-500',
        isActive: true,
        description: 'Employee directory & profiles'
      },
      {
        id: '5',
        name: 'Vehicle',
        icon: '🚗',
        // icon: 'directions_car',
        route: '/vehicle-management',
        color: 'from-yellow-500 to-orange-500',
        isActive: true,
        description: 'Track and manage your fleet operations'
      },
      {
        id: '6',
        name: 'Payroll',
        icon: '💰',
        // icon: 'attach_money',
        route: '/payroll',
        color: 'from-amber-500 to-yellow-500',
        isActive: false,
        description: 'Process salaries & deductions'
      },
      {
        id: '7',
        name: 'Leave',
        icon: '🕒',
        // icon: 'schedule',
        route: '/leave-attendance',
        color: 'from-teal-500 to-green-500',
        isActive: false,
        description: 'Track employee leave & hours'
      },
      {
        id: '8',
        name: 'Procurement',
        icon: '🛒',
        // icon: 'shopping_cart',
        route: '/procurement',
        color: 'from-indigo-600 to-violet-500',
        isActive: false,
        description: 'Manage purchase orders and vendors'
      },
      {
        id: '9',
        name: 'Inventory',
        icon: '📦',
        // icon: 'inventory_2',
        route: '/inventory',
        color: 'from-blue-500 to-cyan-500',
        isActive: false,
        description: 'Manage stocks & warehouses'
      }
    ];

    // Use dummy data instead of API call
    this.modulesList = dummyData;
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
