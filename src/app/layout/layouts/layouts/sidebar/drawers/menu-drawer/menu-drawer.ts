import {Component, OnInit} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatIcon} from '@angular/material/icon';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {HttpClient} from '@angular/common/http';
import {CommonModule} from '@angular/common';
import { ThemeService } from '../../../../../../shared/services/theme.service';
import { Subscription } from 'rxjs';
import { ActivityLogService } from '../../../../../../shared/services/activity-log.service';

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
      state('open', style({height: '*', opacity: 1})),
      state('closed', style({height: '0px', opacity: 0})),
      transition('open <=> closed', animate('300ms ease-in-out'))
    ])
  ]
})
export class MenuDrawer implements OnInit {

  openSections: { [key: string]: boolean } = {
    mxMessages: false,
    messageList: true,
  };

  userAccessList: UserAccessItem[] = [];
  mxMessagesList: UserAccessItem[] = [];
  messageListItems: UserAccessItem[] = [];
  activeTheme: string = localStorage.getItem('selectedTheme') || '';
  isLoading = true;
  error: string | null = null;
private themeSub?: Subscription;
  constructor(
    private http: HttpClient,
    private activityLog: ActivityLogService,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.loadUserAccessList();
     this.themeSub = this.themeService.currentTheme$.subscribe(themeId => {
      this.activeTheme = themeId;
    });
  }

  loadUserAccessList(): void {
    const apiUrl = 'http://192.168.20.93:8091/api/user-login/get-user-access-list';
    const params = {
      userId: localStorage.getItem('userId'),
      appId: '133',
      itemType: 'F',
      isHoUser: '0'
    };

    this.http.get<UserAccessItem[]>(apiUrl, { params: params as any })
      .subscribe({
        next: (data) => {
          this.userAccessList = data;
          localStorage.setItem('userAccessList', JSON.stringify(data));
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading user access list:', err);
          this.error = 'Failed to load menu items';
          this.isLoading = false;
        }
      });

      const dummyData: UserAccessItem[] = [
      {
        FunctionId: 'F001',
        FunctionName: 'Dashboard',
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
        ModuleId: 'M001',
        ModuleName: 'Main Module',
        AppRoute: '/dashboard',
        ItemType: 'F',
        QuickRouteNo: '1001',
        IsFinancial: '0'
      },
      {
        FunctionId: 'F002',
        FunctionName: 'All components',
        HOFunctionFlag: '1',
        AllowMaintAddFlag: '1',
        AllowMaintEditFlag: '1',
        AllowMaintDelFlag: '1',
        AllowMaintViewFlag: '1',
        AllowMaintAuthFlag: '1',
        AllowProcessFlag: '1',
        AllowReportViewFlag: '1',
        AllowReportPrintFlag: '1',
        AllowReportGenFlag: '1',
        AllowAnyOfficeOpsFlag: '1',
        ModuleId: 'M002',
        ModuleName: 'Admin Module',
        AppRoute: '/mx/components',
        ItemType: 'F',
        QuickRouteNo: '1002',
        IsFinancial: '0'
      },
      {
        FunctionId: 'F003',
        FunctionName: 'Alert Example Page',
        HOFunctionFlag: '0',
        AllowMaintAddFlag: '0',
        AllowMaintEditFlag: '0',
        AllowMaintDelFlag: '0',
        AllowMaintViewFlag: '1',
        AllowMaintAuthFlag: '0',
        AllowProcessFlag: '0',
        AllowReportViewFlag: '1',
        AllowReportPrintFlag: '1',
        AllowReportGenFlag: '1',
        AllowAnyOfficeOpsFlag: '1',
        ModuleId: 'M003',
        ModuleName: 'Reports Module',
        AppRoute: '/alert-example-page',
        ItemType: 'F',
        QuickRouteNo: '1003',
        IsFinancial: '1'
      },
      {
        FunctionId: 'F004',
        FunctionName: 'Settings',
        HOFunctionFlag: '1',
        AllowMaintAddFlag: '1',
        AllowMaintEditFlag: '1',
        AllowMaintDelFlag: '0',
        AllowMaintViewFlag: '1',
        AllowMaintAuthFlag: '1',
        AllowProcessFlag: '0',
        AllowReportViewFlag: '0',
        AllowReportPrintFlag: '0',
        AllowReportGenFlag: '0',
        AllowAnyOfficeOpsFlag: '1',
        ModuleId: 'M002',
        ModuleName: 'Admin Module',
        AppRoute: '/mx/activity-tracker-toggle',
        ItemType: 'F',
        QuickRouteNo: '1004',
        IsFinancial: '0'
      },
      {
        FunctionId: 'F005',
        FunctionName: 'Form',
        HOFunctionFlag: '0',
        AllowMaintAddFlag: '1',
        AllowMaintEditFlag: '1',
        AllowMaintDelFlag: '1',
        AllowMaintViewFlag: '1',
        AllowMaintAuthFlag: '1',
        AllowProcessFlag: '1',
        AllowReportViewFlag: '1',
        AllowReportPrintFlag: '1',
        AllowReportGenFlag: '1',
        AllowAnyOfficeOpsFlag: '0',
        ModuleId: 'M004',
        ModuleName: 'Finance Module',
        AppRoute: '/mx/form',
        ItemType: 'F',
        QuickRouteNo: '1005',
        IsFinancial: '1'
      },
      {
        FunctionId: 'F006',
        FunctionName: 'Customer Support',
        HOFunctionFlag: '0',
        AllowMaintAddFlag: '1',
        AllowMaintEditFlag: '1',
        AllowMaintDelFlag: '0',
        AllowMaintViewFlag: '1',
        AllowMaintAuthFlag: '0',
        AllowProcessFlag: '1',
        AllowReportViewFlag: '1',
        AllowReportPrintFlag: '0',
        AllowReportGenFlag: '0',
        AllowAnyOfficeOpsFlag: '1',
        ModuleId: 'M005',
        ModuleName: 'Support Module',
        AppRoute: '/customer-support',
        ItemType: 'F',
        QuickRouteNo: '1006',
        IsFinancial: '0'
      },
      {
        FunctionId: 'F007',
        FunctionName: 'Analytics',
        HOFunctionFlag: '1',
        AllowMaintAddFlag: '0',
        AllowMaintEditFlag: '0',
        AllowMaintDelFlag: '0',
        AllowMaintViewFlag: '1',
        AllowMaintAuthFlag: '0',
        AllowProcessFlag: '0',
        AllowReportViewFlag: '1',
        AllowReportPrintFlag: '1',
        AllowReportGenFlag: '1',
        AllowAnyOfficeOpsFlag: '1',
        ModuleId: 'M003',
        ModuleName: 'Reports Module',
        AppRoute: '/analytics',
        ItemType: 'F',
        QuickRouteNo: '1007',
        IsFinancial: '1'
      },
      {
        FunctionId: 'F008',
        FunctionName: 'Inventory Management',
        HOFunctionFlag: '0',
        AllowMaintAddFlag: '1',
        AllowMaintEditFlag: '1',
        AllowMaintDelFlag: '1',
        AllowMaintViewFlag: '1',
        AllowMaintAuthFlag: '1',
        AllowProcessFlag: '1',
        AllowReportViewFlag: '1',
        AllowReportPrintFlag: '1',
        AllowReportGenFlag: '1',
        AllowAnyOfficeOpsFlag: '0',
        ModuleId: 'M006',
        ModuleName: 'Inventory Module',
        AppRoute: '/inventory',
        ItemType: 'F',
        QuickRouteNo: '1008',
        IsFinancial: '0'
      },
      {
        FunctionId: 'F009',
        FunctionName: 'Billing',
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
        ModuleId: 'M004',
        ModuleName: 'Finance Module',
        AppRoute: '/billing',
        ItemType: 'F',
        QuickRouteNo: '1009',
        IsFinancial: '1'
      },
      {
        FunctionId: 'F010',
        FunctionName: 'Notifications',
        HOFunctionFlag: '0',
        AllowMaintAddFlag: '1',
        AllowMaintEditFlag: '1',
        AllowMaintDelFlag: '1',
        AllowMaintViewFlag: '1',
        AllowMaintAuthFlag: '0',
        AllowProcessFlag: '1',
        AllowReportViewFlag: '0',
        AllowReportPrintFlag: '0',
        AllowReportGenFlag: '0',
        AllowAnyOfficeOpsFlag: '1',
        ModuleId: 'M007',
        ModuleName: 'Communication Module',
        AppRoute: '/notifications',
        ItemType: 'F',
        QuickRouteNo: '1010',
        IsFinancial: '0'
      }
    ];

    // Use dummy data instead of API call
    this.userAccessList = dummyData;
    localStorage.setItem('userAccessList', JSON.stringify(dummyData));
    this.isLoading = false;
  } 

  onMenuClick(item: UserAccessItem): void {
    // Sidebar থেকে FunctionId save করা
    localStorage.setItem('currentFunctionId', item.FunctionId);

    // Optional: frontend log
    this.activityLog.logEvent('PAGE_NAVIGATE', item.FunctionId, { route: item.AppRoute });
  }

  toggleSection(section: string): void {
    this.openSections[section] = !this.openSections[section];
  }

  isSectionOpen(section: string): boolean {
    return this.openSections[section];
  }
}