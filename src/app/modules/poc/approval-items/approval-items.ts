import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
//import { ApprovalStepsDialogComponent } from '../approval-steps/approval-steps-dialog.component/approval-steps-dialog.component';
import { DataGridComponent } from "../../../shared/components/data-grid";
import { ExpansionPanelHeader } from "../../../shared/components/expansion-panel-header/expansion-panel-header";
import {ApprovalSteps} from '../approval-steps/approval-steps';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Button} from '../../../shared/components/input-types/button/button';
import {DateInput} from '../../../shared/components/input-types/date-input/date-input';
import {SelectOptionField} from '../../../shared/components/input-types/select-option-field/select-option-field';

@Component({
  selector: 'app-approval-items',
  standalone: true,
  imports: [CommonModule, DataGridComponent, ExpansionPanelHeader, Button, DateInput, SelectOptionField],
  templateUrl: './approval-items.html',
  styleUrl: './approval-items.scss'
})
export class ApprovalItems implements OnInit{

  // Columns to display
  selectedColumns = ['setId', 'functionName', 'actionType', 'remarks', 'recordUserId', 'currentUxContent'];
  dataSource: any[] = [];

  // test api resonse
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
  apiResponseMaker: any[] = [
    {
      "createDate": "2025-10-22T10:20:11.001",
      "updateDate": null,
      "createdBy": null,
      "updatedBy": null,
      "isEdited": false,
      "isDeleted": false,
      "isCreated": false,
      "actionType": "UPDATE",
      "selector": "app-gl-subsidiary",
      "remarks": "Record updated for test",
      "approveFlag": "APPROVED",
      "appId": 901,
      "functionId": 901003,
      "cloneObject": null,
      "setId": 300,
      "noOfApprovalLevel": 3,
      "minApprovalLevelReq": 0,
      "lastApprovalLevel": 1,
      "nextApprovalLevel": 2,
      "primaryTableNm": "MREG_GL_AC_SUBSIDIARY",
      "recordUserId": "anik",
      "recordDt": "2025-10-22T10:18:55.000",
      "previousUxContent": "{\"glAccSubNm\":\"Branch A\",\"glSubRefNo\":\"BR001\"}",
      "currentUxContent": "{\"glAccSubNm\":\"Branch A Updated\",\"glSubRefNo\":\"BR001U\"}",
      "functionName": "GL Subsidiary"
    },
    {
      "createDate": "2025-10-22T10:25:21.101",
      "updateDate": null,
      "createdBy": null,
      "updatedBy": null,
      "isEdited": false,
      "isDeleted": false,
      "isCreated": true,
      "actionType": "CREATE",
      "selector": "app-gl-subsidiary",
      "remarks": "New subsidiary added",
      "approveFlag": "PENDING",
      "appId": 901,
      "functionId": 901003,
      "cloneObject": null,
      "setId": 301,
      "noOfApprovalLevel": 3,
      "minApprovalLevelReq": 0,
      "lastApprovalLevel": 0,
      "nextApprovalLevel": 1,
      "primaryTableNm": "MREG_GL_AC_SUBSIDIARY",
      "recordUserId": "rahim",
      "recordDt": "2025-10-22T10:24:55.000",
      "previousUxContent": null,
      "currentUxContent": "{\"glAccSubNm\":\"Branch B\",\"glSubRefNo\":\"BR002\"}",
      "functionName": "GL Subsidiary"
    },
    {
      "createDate": "2025-10-22T11:30:35.501",
      "updateDate": null,
      "createdBy": null,
      "updatedBy": null,
      "isEdited": true,
      "isDeleted": false,
      "isCreated": false,
      "actionType": "UPDATE",
      "selector": "app-gl-subsidiary",
      "remarks": "Correction in name",
      "approveFlag": "PENDING",
      "appId": 901,
      "functionId": 901003,
      "cloneObject": null,
      "setId": 302,
      "noOfApprovalLevel": 3,
      "minApprovalLevelReq": 0,
      "lastApprovalLevel": 0,
      "nextApprovalLevel": 1,
      "primaryTableNm": "MREG_GL_AC_SUBSIDIARY",
      "recordUserId": "karim",
      "recordDt": "2025-10-22T11:29:55.000",
      "previousUxContent": "{\"glAccSubNm\":\"Branch C\"}",
      "currentUxContent": "{\"glAccSubNm\":\"Branch C Edited\"}",
      "functionName": "GL Subsidiary"
    },
    {
      "createDate": "2025-10-22T12:40:25.401",
      "updateDate": null,
      "createdBy": null,
      "updatedBy": null,
      "isEdited": false,
      "isDeleted": false,
      "isCreated": false,
      "actionType": "DELETE",
      "selector": "app-gl-subsidiary",
      "remarks": "Obsolete branch removed",
      "approveFlag": "REJECTED",
      "appId": 901,
      "functionId": 901003,
      "cloneObject": null,
      "setId": 303,
      "noOfApprovalLevel": 3,
      "minApprovalLevelReq": 0,
      "lastApprovalLevel": 0,
      "nextApprovalLevel": 0,
      "primaryTableNm": "MREG_GL_AC_SUBSIDIARY",
      "recordUserId": "sara",
      "recordDt": "2025-10-22T12:35:00.000",
      "previousUxContent": "{\"glAccSubNm\":\"Branch D\"}",
      "currentUxContent": "{\"glAccSubNm\":\"Branch D\"}",
      "functionName": "GL Subsidiary"
    },
    {
      "createDate": "2025-10-22T13:00:12.901",
      "updateDate": null,
      "createdBy": null,
      "updatedBy": null,
      "isEdited": false,
      "isDeleted": false,
      "isCreated": true,
      "actionType": "CREATE",
      "selector": "app-gl-subsidiary",
      "remarks": "New registration",
      "approveFlag": "APPROVED",
      "appId": 901,
      "functionId": 901003,
      "cloneObject": null,
      "setId": 304,
      "noOfApprovalLevel": 3,
      "minApprovalLevelReq": 0,
      "lastApprovalLevel": 2,
      "nextApprovalLevel": 3,
      "primaryTableNm": "MREG_GL_AC_SUBSIDIARY",
      "recordUserId": "anik",
      "recordDt": "2025-10-22T13:00:00.000",
      "previousUxContent": null,
      "currentUxContent": "{\"glAccSubNm\":\"Branch E\",\"glSubRefNo\":\"BR005\"}",
      "functionName": "GL Subsidiary"
    },
    {
      "createDate": "2025-10-22T13:45:15.123",
      "updateDate": null,
      "createdBy": null,
      "updatedBy": null,
      "isEdited": true,
      "isDeleted": false,
      "isCreated": false,
      "actionType": "UPDATE",
      "selector": "app-gl-subsidiary",
      "remarks": "Balance correction",
      "approveFlag": "PENDING",
      "appId": 901,
      "functionId": 901003,
      "cloneObject": null,
      "setId": 305,
      "noOfApprovalLevel": 3,
      "minApprovalLevelReq": 0,
      "lastApprovalLevel": 0,
      "nextApprovalLevel": 1,
      "primaryTableNm": "MREG_GL_AC_SUBSIDIARY",
      "recordUserId": "rahim",
      "recordDt": "2025-10-22T13:43:45.000",
      "previousUxContent": "{\"glAccSubNm\":\"Branch F\"}",
      "currentUxContent": "{\"glAccSubNm\":\"Branch F Updated\"}",
      "functionName": "GL Subsidiary"
    },
    {
      "createDate": "2025-10-22T14:00:00.000",
      "updateDate": null,
      "createdBy": null,
      "updatedBy": null,
      "isEdited": false,
      "isDeleted": false,
      "isCreated": true,
      "actionType": "CREATE",
      "selector": "app-gl-subsidiary",
      "remarks": "New office created",
      "approveFlag": "PENDING",
      "appId": 901,
      "functionId": 901003,
      "cloneObject": null,
      "setId": 306,
      "noOfApprovalLevel": 3,
      "minApprovalLevelReq": 0,
      "lastApprovalLevel": 0,
      "nextApprovalLevel": 1,
      "primaryTableNm": "MREG_GL_AC_SUBSIDIARY",
      "recordUserId": "karim",
      "recordDt": "2025-10-22T13:59:00.000",
      "previousUxContent": null,
      "currentUxContent": "{\"glAccSubNm\":\"Branch G\"}",
      "functionName": "GL Subsidiary"
    },
    {
      "createDate": "2025-10-22T14:10:00.000",
      "updateDate": null,
      "createdBy": null,
      "updatedBy": null,
      "isEdited": false,
      "isDeleted": false,
      "isCreated": false,
      "actionType": "UPDATE",
      "selector": "app-gl-subsidiary",
      "remarks": "Minor text fix",
      "approveFlag": "APPROVED",
      "appId": 901,
      "functionId": 901003,
      "cloneObject": null,
      "setId": 307,
      "noOfApprovalLevel": 3,
      "minApprovalLevelReq": 0,
      "lastApprovalLevel": 2,
      "nextApprovalLevel": 3,
      "primaryTableNm": "MREG_GL_AC_SUBSIDIARY",
      "recordUserId": "anik",
      "recordDt": "2025-10-22T14:09:00.000",
      "previousUxContent": "{\"glAccSubNm\":\"Branch H\"}",
      "currentUxContent": "{\"glAccSubNm\":\"Branch H Corrected\"}",
      "functionName": "GL Subsidiary"
    },
    {
      "createDate": "2025-10-22T14:20:00.000",
      "updateDate": null,
      "createdBy": null,
      "updatedBy": null,
      "isEdited": false,
      "isDeleted": true,
      "isCreated": false,
      "actionType": "DELETE",
      "selector": "app-gl-subsidiary",
      "remarks": "Closed due to merge",
      "approveFlag": "REJECTED",
      "appId": 901,
      "functionId": 901003,
      "cloneObject": null,
      "setId": 308,
      "noOfApprovalLevel": 3,
      "minApprovalLevelReq": 0,
      "lastApprovalLevel": 1,
      "nextApprovalLevel": 2,
      "primaryTableNm": "MREG_GL_AC_SUBSIDIARY",
      "recordUserId": "rahim",
      "recordDt": "2025-10-22T14:18:00.000",
      "previousUxContent": "{\"glAccSubNm\":\"Branch I\"}",
      "currentUxContent": "{\"glAccSubNm\":\"Branch I (Removed)\"}",
      "functionName": "GL Subsidiary"
    },
    {
      "createDate": "2025-10-22T14:35:00.000",
      "updateDate": null,
      "createdBy": null,
      "updatedBy": null,
      "isEdited": true,
      "isDeleted": false,
      "isCreated": false,
      "actionType": "UPDATE",
      "selector": "app-gl-subsidiary",
      "remarks": "Reactivated old branch",
      "approveFlag": "PENDING",
      "appId": 901,
      "functionId": 901003,
      "cloneObject": null,
      "setId": 309,
      "noOfApprovalLevel": 3,
      "minApprovalLevelReq": 0,
      "lastApprovalLevel": 0,
      "nextApprovalLevel": 1,
      "primaryTableNm": "MREG_GL_AC_SUBSIDIARY",
      "recordUserId": "karim",
      "recordDt": "2025-10-22T14:34:00.000",
      "previousUxContent": "{\"glAccSubNm\":\"Branch J Old\"}",
      "currentUxContent": "{\"glAccSubNm\":\"Branch J Reactivated\"}",
      "functionName": "GL Subsidiary"
    }
  ];
  userAccessList: any[] = [
    {
      "functionId": 901001,
      "functionName": "Customer Management",
      "moduleName": "CRM",
      "accessLevel": "FULL",
      "menuOrder": 1
    },
    {
      "functionId": 901002,
      "functionName": "Loan Processing",
      "moduleName": "Finance",
      "accessLevel": "EDIT",
      "menuOrder": 2
    },
    {
      "functionId": 901003,
      "functionName": "GL Subsidiary",
      "moduleName": "Accounts",
      "accessLevel": "VIEW",
      "menuOrder": 3
    },
    {
      "functionId": 901004,
      "functionName": "Employee Directory",
      "moduleName": "HR",
      "accessLevel": "VIEW",
      "menuOrder": 4
    },
    {
      "functionId": 901005,
      "functionName": "Inventory Management",
      "moduleName": "Logistics",
      "accessLevel": "FULL",
      "menuOrder": 5
    }
  ];
  functionOptions: { key: number; value: string }[] = [];
  makerList: any[] = [];
  frmGroup!: FormGroup;
  showmakerList:boolean = false;
  // Service injections
  router = inject(Router);
  fb = inject(FormBuilder);
  // approvalService = inject(ApprovalService);
  dialog = inject(MatDialog);
  businessHeaderPanel: WritableSignal<boolean> = signal(true);

  ngOnInit(): void {
    this.populatedForm();
    this.loadUnApprovedList();
    this.loadUserAccessList();
  }

  populatedForm(): void {
    this.frmGroup = this.fb.group({
      functionId: [''],
      toDate: [''],
      fromDate: [''],
    });
  }

  loadUserAccessList(): void {
    // 1) Try LS, otherwise fall back to in-memory dummy array
    const ls = localStorage.getItem('userAccessList');
    const data = ls ? JSON.parse(ls) : this.userAccessList;

    // 2) If LS was empty, seed it so future loads work too
    if (!ls) {
      localStorage.setItem('userAccessList', JSON.stringify(this.userAccessList));
    }

    // 3) Build options for <app-select-option-field>
    this.functionOptions = (data || []).map(
      (item: { functionId: number; functionName: string }) => ({
        key: item.functionId,
        value: item.functionName
      })
    );

    // 4) (Optional) set a default selection if none
    if (!this.frmGroup.get('functionId')?.value && this.functionOptions.length) {
      this.frmGroup.patchValue({ functionId: this.functionOptions[0].key });
    }
  }


  loadUnApprovedList(): void {
    //console.log("Loaded dummy data = ", this.apiResponse);

    this.dataSource = this.apiResponse.map((item: any) => ({
      ...item,
      currentContext: this.parseJson(item.currentUxContent),
      previousContext: this.parseJson(item.previousUxContent)
    }));
  }

  loadMakerList(): void {
    // read filters
    const { fromDate, toDate, functionId } = this.frmGroup.value || {};

    // build inclusive date range
    const from = fromDate ? new Date(fromDate) : new Date('1900-01-01');
    const to   = toDate   ? new Date(toDate)   : new Date('2999-12-31');
    to.setHours(23, 59, 59, 999); // include end-of-day

    const fnId = functionId ? Number(functionId) : null;

    // use dummy list instead of API
    const source = this.apiResponseMaker ?? [];

    // filter
    const filtered = source.filter(item => {
      const itemFn = Number(item.functionId);
      const itemDate = new Date(item.createDate);
      const fnOk = fnId !== null ? itemFn === fnId : true;
      return fnOk && itemDate >= from && itemDate <= to;
    });

    // map + parse JSON strings
    this.makerList = filtered.map(item => ({
      ...item,
      currentContext: this.parseJson(item.currentUxContent),
      previousContext: this.parseJson(item.previousUxContent),
    }));

    this.showmakerList = this.makerList.length > 0;
  }


  resetMakerForm(){
    this.frmGroup.reset();
    this.frmGroup.markAsPristine();
    this.frmGroup.markAsUntouched();
    this.makerList = [];
    this.showmakerList = false;
  }

  parseJson(jsonStr: string): any {
    try {
      return JSON.parse(jsonStr || '{}');
    } catch {
      return {};
    } ''

  }

  view(row: any): void {
    this.router.navigateByUrl('config/approval-movement', { state: { data: row } });
  }

  // Handle custom "Approval Progress" click
  showApprovalSteps(row: any): void {
    this.dialog.open(ApprovalSteps, {
      width: '600px',
      data: row
    });
  }

}
