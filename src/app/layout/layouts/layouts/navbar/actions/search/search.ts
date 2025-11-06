import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-search',
    imports: [],
    templateUrl: './search.html',
    standalone: true,
    styleUrl: './search.scss'
})
export class Search implements OnInit {

    userAccessList: any[] = [];
    toastr = inject(ToastrService);

    constructor(
        private router: Router
    ) { }

    ngOnInit(): void {
        this.loadUserAccessList();
    }

    loadUserAccessList(): void {
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
        const dummyData: any[] = [
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
                QuickRouteNo: '10001',
                IsFinancial: '0'
            },
            {
                FunctionId: 'F002',
                FunctionName: 'User Management',
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
                QuickRouteNo: '10002',
                IsFinancial: '0'
            }
        ];
        this.userAccessList = dummyData;
    }

    handleFastPath(input: any) {
        const enteredCode = input.value.trim();
        if (!enteredCode) return;

        const match = this.userAccessList.find(
            x => x.QuickRouteNo.toString() === enteredCode
        );

        if (match) {
            this.router.navigate([match.AppRoute]);
        } else {
            this.toastr.warning('Invalid Route Number.', 'Invalid');
        }

        input.value = '';
    }

}
