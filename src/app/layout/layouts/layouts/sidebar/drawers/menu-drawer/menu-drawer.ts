import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../../../../shared/services/theme.service';
import { Subscription } from 'rxjs';

interface UserAccessItem {
  FunctionId: string;
  FunctionName: string;
  HOFunctionFlag: string;
  AllowMaintAddFlag: string;
  AllowMaintEditFlag: string;
  AllowMaintDelFlag: string;
  AllowMaintViewFlag: string;
  AllowMaintAuthFlag: string;
  AllowProcessFlag: string;
  AllowReportViewFlag: string;
  AllowReportPrintFlag: string;
  AllowReportGenFlag: string;
  AllowAnyOfficeOpsFlag: string;
  MenuId: string;
  MenuName: string;
  ModuleId: string;
  ModuleName: string;
  AppRoute: string;
  ItemType: string;
  QuickRouteNo: string;
  IsFinancial: string;
}

@Component({
  selector: 'app-menu-drawer',
  imports: [
    RouterLink,
    MatIcon,
    CommonModule
  ],
  templateUrl: './menu-drawer.html',
  standalone: true,
  styleUrl: './menu-drawer.scss',
  animations: [
    trigger('expandCollapse', [
      state('open', style({ height: '*', opacity: 1 })),
      state('closed', style({ height: '0px', opacity: 0 })),
      transition('open <=> closed', animate('300ms ease-in-out'))
    ])
  ]
})
export class MenuDrawer implements OnInit {

  openSections: { [key: string]: boolean } = {};
  userAccessList: UserAccessItem[] = [];
  menuSections: any[] = [];
  groupedMenu: any = {};
  activeTheme: string = localStorage.getItem('selectedTheme') || '';
  isLoading = true;
  error: string | null = null;
  private themeSub?: Subscription;

  constructor(
    private http: HttpClient,
    private themeService: ThemeService
  ) { }

  ngOnInit(): void {
    this.loadUserAccessList();
    this.themeSub = this.themeService.currentTheme$.subscribe(themeId => {
      this.activeTheme = themeId;
    });
  }

  loadUserAccessList(): void {
    let resourceList = JSON.parse(localStorage.getItem('resourceList') || '');

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
    if(!resourceList)
      return;
    const dummyData: UserAccessItem[] = resourceList.filter((item:any) => 
      item?.attributes?.functionType != 'R'
    ).map((m: any) => ({
      FunctionId: m.attributes.functionId,
      FunctionName: m.attributes.functionName,
      HOFunctionFlag: '0',
      AllowMaintAddFlag: '1',
      AllowMaintEditFlag: '1',
      AllowMaintDelFlag: '0',
      AllowMaintViewFlag: '1',
      AllowMaintAuthFlag: '1',
      AllowProcessFlag: '1',
      AllowReportViewFlag: '1',
      AllowReportPrintFlag: '1',
      AllowReportGenFlag: '1',
      AllowAnyOfficeOpsFlag: '1',
      ModuleId: m.attributes.moduleId,
      ModuleName: m.attributes.moduleName,
      AppRoute: m.uris,
      ItemType: 'F',
      QuickRouteNo: m.attributes.quickRoute,
      IsFinancial: '0'
    }));
    // const dummyData: UserAccessItem[] = [
    //   {
    //     FunctionId: 'F001',
    //     FunctionName: 'Dashboard',
    //     HOFunctionFlag: '0',
    //     AllowMaintAddFlag: '1',
    //     AllowMaintEditFlag: '1',
    //     AllowMaintDelFlag: '0',
    //     AllowMaintViewFlag: '1',
    //     AllowMaintAuthFlag: '1',
    //     AllowProcessFlag: '1',
    //     AllowReportViewFlag: '1',
    //     AllowReportPrintFlag: '1',
    //     AllowReportGenFlag: '1',
    //     AllowAnyOfficeOpsFlag: '1',
    //     MenuId: '01',
    //     MenuName: 'Operation',
    //     ModuleId: 'M001',
    //     ModuleName: 'Main Module',
    //     AppRoute: '/dashboard',
    //     ItemType: 'F',
    //     QuickRouteNo: '10001',
    //     IsFinancial: '0'
    //   },
    //   {
    //     FunctionId: 'F002',
    //     FunctionName: 'User Management',
    //     HOFunctionFlag: '1',
    //     AllowMaintAddFlag: '1',
    //     AllowMaintEditFlag: '1',
    //     AllowMaintDelFlag: '1',
    //     AllowMaintViewFlag: '1',
    //     AllowMaintAuthFlag: '1',
    //     AllowProcessFlag: '1',
    //     AllowReportViewFlag: '1',
    //     AllowReportPrintFlag: '1',
    //     AllowReportGenFlag: '1',
    //     AllowAnyOfficeOpsFlag: '1',
    //     MenuId: '02',
    //     MenuName: 'Operation',
    //     ModuleId: 'M002',
    //     ModuleName: 'Admin Module',
    //     AppRoute: '/mx/components',
    //     ItemType: 'F',
    //     QuickRouteNo: '10002',
    //     IsFinancial: '0'
    //   },
    //   {
    //     FunctionId: 'F003',
    //     FunctionName: 'Activity Tracker Toggle',
    //     HOFunctionFlag: '1',
    //     AllowMaintAddFlag: '1',
    //     AllowMaintEditFlag: '1',
    //     AllowMaintDelFlag: '1',
    //     AllowMaintViewFlag: '1',
    //     AllowMaintAuthFlag: '1',
    //     AllowProcessFlag: '1',
    //     AllowReportViewFlag: '1',
    //     AllowReportPrintFlag: '1',
    //     AllowReportGenFlag: '1',
    //     AllowAnyOfficeOpsFlag: '1',
    //     MenuId: '03',
    //     MenuName: 'Configuration',
    //     ModuleId: 'M003',
    //     ModuleName: 'User Module',
    //     AppRoute: '/mx/activity-tracker-toggle',
    //     ItemType: 'F',
    //     QuickRouteNo: '10003',
    //     IsFinancial: '0'
    //   },
    //   {
    //     FunctionId: 'F004',
    //     FunctionName: 'Form For Notification',
    //     HOFunctionFlag: '1',
    //     AllowMaintAddFlag: '1',
    //     AllowMaintEditFlag: '1',
    //     AllowMaintDelFlag: '1',
    //     AllowMaintViewFlag: '1',
    //     AllowMaintAuthFlag: '1',
    //     AllowProcessFlag: '1',
    //     AllowReportViewFlag: '1',
    //     AllowReportPrintFlag: '1',
    //     AllowReportGenFlag: '1',
    //     AllowAnyOfficeOpsFlag: '1',
    //     MenuId: '04',
    //     MenuName: 'Configuration',
    //     ModuleId: 'M004',
    //     ModuleName: 'Admin Module',
    //     AppRoute: '/mx/form',
    //     ItemType: 'F',
    //     QuickRouteNo: '10004',
    //     IsFinancial: '0'
    //   }
    // ];

    // Use dummy data instead of API call
    this.isLoading = false;
    this.userAccessList = dummyData;
    this.generateMenuFromAccess();

  }

  generateMenuFromAccess() {

    const uniqueMenuNames = [
      ...new Set(
        this.userAccessList
          //.filter(item => item.ModuleName?.toLowerCase() !== 'report')
          .map(item => item.ModuleName)
      )
    ];

    this.menuSections = uniqueMenuNames.map(name => ({
      key: name.toLowerCase().replace(/\s+/g, ''),
      label: name,
      icon: this.getIcon(name)
    }));

    this.groupedMenu = this.userAccessList.reduce((acc: { [key: string]: UserAccessItem[] }, item) => {
      if (!acc[item.ModuleName]) {
        acc[item.ModuleName] = [];
      }
      acc[item.ModuleName].push(item);
      return acc;
    }, {});


    uniqueMenuNames.forEach(name => {
      const key = name.toLowerCase().replace(/\s+/g, '');
      this.openSections[key] = false;
    });

  }

  getIcon(name: string) {
    const map: any = {
      Configuration: 'settings',
      Operation: 'work',
      Dashboard: 'dashboard'
    };
    return map[name] || 'folder';
  }

  toggleSection(section: string): void {
    this.openSections[section] = !this.openSections[section];
  }

  isSectionOpen(section: string): boolean {
    return this.openSections[section];
  }

  onMenuItemClick(item: UserAccessItem): void {
    // Step 1: Save FunctionId to localStorage
    console.log(item)
    localStorage.setItem('currentFunctionId', item.FunctionId);

    // Optional: Log for debug
  }

  getItemsByMenu(menuName: string) {
    return this.groupedMenu[menuName] || [];
  }


}

