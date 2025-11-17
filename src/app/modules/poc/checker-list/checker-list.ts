import {Component, OnInit, signal, WritableSignal, inject, Type} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DataGridComponent } from '../../../shared/components/data-grid';
import { ExpansionPanelHeader } from '../../../shared/components/expansion-panel-header/expansion-panel-header';
import {ViewApprovalActivitiesComponent} from '../view-approval-activities/view-approval-activities.component';
import {LdsModalComponent} from '../../../shared/components/lds-modal/lds-modal';
import { UserService } from '../../../core/user/user.service';
import { User} from '../../../core/user/user.types';

@Component({
  selector: 'app-checker-list',
  standalone: true,
  imports: [CommonModule, DataGridComponent, ExpansionPanelHeader, LdsModalComponent],
  templateUrl: './checker-list.html',
  styleUrl: './checker-list.scss'
})
export class CheckerList implements OnInit {
  router = inject(Router);
  dialog = inject(MatDialog);

  // +++ 2. INJECT THE USER SERVICE +++
  private userService = inject(UserService);
  private currentUser: User | null = null;

  // Modal controls
  isModalVisible: boolean = false;
  modalTitle: string = '';
  modalComponent: any = null;
  modalComponentData: any = null;

  businessHeaderPanel: WritableSignal<boolean> = signal(true);

  selectedColumns = ['setId', 'functionName', 'actionType', 'remarks', 'recordUserId', 'currentUxContent'];
  dataSource: any[] = [];

  // Dummy list
  apiResponse: any[] = [
    {
      "setId": 240,
      "functionName": "GL Subsidiary",
      "actionType": "UPDATE",
      "remarks": "Checked and pending",
      "recordUserId": "anik",
      "approveFlag": "PENDING",
      "previousUxContent": "{\"glAccSubNm\":\"Principal Branch 1\"}",
      "currentUxContent": "{\"glAccSubNm\":\"Principal Branch 1 edited\"}"
    },
    {
      "setId": 241,
      "functionName": "GL Subsidiary",
      "actionType": "UPDATE",
      "remarks": "Awaiting verification",
      "recordUserId": "rahim",
      "approveFlag": "PENDING",
      "previousUxContent": "{\"glAccSubNm\":\"Principal Branch 2\"}",
      "currentUxContent": "{\"glAccSubNm\":\"Principal Branch 2 edited\"}"
    },
    {
      "setId": 242,
      "functionName": "GL Subsidiary",
      "actionType": "UPDATE",
      "remarks": "Auto review pending",
      "recordUserId": "karim",
      "approveFlag": "PENDING",
      "previousUxContent": "{\"glAccSubNm\":\"Principal Branch 3\"}",
      "currentUxContent": "{\"glAccSubNm\":\"Principal Branch 3 edited\"}"
    },
    {
      "setId": 243,
      "functionName": "GL Subsidiary",
      "actionType": "UPDATE",
      "remarks": "Manual verification",
      "recordUserId": "anik",
      "approveFlag": "PENDING",
      "previousUxContent": "{\"glAccSubNm\":\"Principal Branch 4\"}",
      "currentUxContent": "{\"glAccSubNm\":\"Principal Branch 4 edited\"}"
    },
    {
      "setId": 244,
      "functionName": "GL Subsidiary",
      "actionType": "UPDATE",
      "remarks": "Checked and pending",
      "recordUserId": "rahim",
      "approveFlag": "PENDING",
      "previousUxContent": "{\"glAccSubNm\":\"Principal Branch 5\"}",
      "currentUxContent": "{\"glAccSubNm\":\"Principal Branch 5 edited\"}"
    },
    {
      "setId": 245,
      "functionName": "GL Subsidiary",
      "actionType": "UPDATE",
      "remarks": "Awaiting manager review",
      "recordUserId": "karim",
      "approveFlag": "PENDING",
      "previousUxContent": "{\"glAccSubNm\":\"Principal Branch 6\"}",
      "currentUxContent": "{\"glAccSubNm\":\"Principal Branch 6 edited\"}"
    },
    {
      "setId": 246,
      "functionName": "GL Subsidiary",
      "actionType": "UPDATE",
      "remarks": "Checked and pending",
      "recordUserId": "anik",
      "approveFlag": "PENDING",
      "previousUxContent": "{\"glAccSubNm\":\"Principal Branch 7\"}",
      "currentUxContent": "{\"glAccSubNm\":\"Principal Branch 7 edited\"}"
    },
    {
      "setId": 247,
      "functionName": "GL Subsidiary",
      "actionType": "UPDATE",
      "remarks": "Awaiting verification",
      "recordUserId": "rahim",
      "approveFlag": "PENDING",
      "previousUxContent": "{\"glAccSubNm\":\"Principal Branch 8\"}",
      "currentUxContent": "{\"glAccSubNm\":\"Principal Branch 8 edited\"}"
    },
    {
      "setId": 248,
      "functionName": "GL Subsidiary",
      "actionType": "UPDATE",
      "remarks": "Auto review pending",
      "recordUserId": "karim",
      "approveFlag": "PENDING",
      "previousUxContent": "{\"glAccSubNm\":\"Principal Branch 9\"}",
      "currentUxContent": "{\"glAccSubNm\":\"Principal Branch 9 edited\"}"
    },
    {
      "setId": 249,
      "functionName": "GL Subsidiary",
      "actionType": "UPDATE",
      "remarks": "Manual verification",
      "recordUserId": "anik",
      "approveFlag": "PENDING",
      "previousUxContent": "{\"glAccSubNm\":\"Principal Branch 10\"}",
      "currentUxContent": "{\"glAccSubNm\":\"Principal Branch 10 edited\"}"
    }
  ];

  ngOnInit(): void {
    this.loadPending();
  }

  // ngOnInit(): void {
  //   // We subscribe to the user$ observable
  //   this.userService.user$.subscribe(user => {
  //     if (user) {
  //       // Once we have a user, store it and load their data
  //       console.log("Logged in user:", user);
  //       this.currentUser = user;
  //       this.loadPending(); // <-- Now we load the data
  //     } else {
  //       // Handle case where user is logged out or null
  //       console.log("Waiting for user login...");
  //       this.currentUser = null;
  //       this.dataSource = []; // Clear data
  //     }
  //   });
  // }

  loadPending(): void {
    this.dataSource = this.apiResponse.map((item: any) => ({
      ...item,
      currentContext: this.parseJson(item.currentUxContent),
      previousContext: this.parseJson(item.previousUxContent),
    }));
  }

  // loadPending(): void {
  //   // Add a "guard clause" to ensure we have a user
  //   if (!this.currentUser) {
  //     console.warn("loadPending called, but no user is logged in.");
  //     this.dataSource = [];
  //     return;
  //   }
  //
  //   // Get the username (e.g., "bob")
  //   const myUsername = this.currentUser.username;
  //
  //   //
  //   // NOTE: This filters your local 'apiResponse' list.
  //   // In a real app, you would send 'myUsername' to your backend API
  //   // (e.g., this.myApiService.getPendingItems(myUsername).subscribe(...))
  //   //
  //   const myPendingItems = this.apiResponse.filter(
  //     item => item.recordUserId === myUsername
  //   );
  //
  //   // Now, map the filtered items
  //   this.dataSource = myPendingItems.map((item: any) => ({
  //     ...item,
  //     currentContext: this.parseJson(item.currentUxContent),
  //     previousContext: this.parseJson(item.previousUxContent),
  //   }));
  //
  //   console.log(`Loaded ${this.dataSource.length} items for user ${myUsername}`);
  // }

  view(row: any): void {
    this.router.navigateByUrl('mx/approval-movement', {state: {data: row}});
  }

  // showApprovalSteps(row: any): void {
  //   this.modalTitle = 'Approval Activities';
  //   this.modalComponent = ViewApprovalActivitiesComponent;
  //   this.modalComponentData = row;
  //   this.modalSize = 'lg';
  //   this.modalMaxHeight = '85%';
  //   this.modalMaxWidth = '85%';
  //   this.isModalVisible = true;
  // }

  handleProgressClick(rowDataString: string): void {
    try {
      const rowData = JSON.parse(rowDataString);
      // Pass the component and data to openModal
      this.openModal(
        ViewApprovalActivitiesComponent,
        rowData,
        'Approval Activities'
      );
    } catch (e) {
      console.error('Failed to parse row data for modal:', e);
    }
  }

  openModal(componentToLoad: Type<any>, data: any, title: string = 'Modal') {
    this.isModalVisible = false;
    this.modalComponent = undefined;

    setTimeout(() => {
      this.modalTitle = title;
      this.modalComponent = componentToLoad;
      this.modalComponentData = data;
      this.isModalVisible = true;
    }, 50);
  }

  onModalVisibilityChange(visible: boolean): void {
    this.isModalVisible = visible;
  }

  onModalResult(result: any): void {
    //console.log('Modal Result:', result);
  }


  private parseJson(jsonStr: string): any {
    try {
      return JSON.parse(jsonStr || '{}');
    } catch {
      return {};
    }
  }

}
