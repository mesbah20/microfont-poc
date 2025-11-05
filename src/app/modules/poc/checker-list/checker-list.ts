import { Component, OnInit, signal, WritableSignal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DataGridComponent } from '../../../shared/components/data-grid';
import { ExpansionPanelHeader } from '../../../shared/components/expansion-panel-header/expansion-panel-header';
import {FormBuilder, FormGroup} from '@angular/forms';
import {ViewApprovalActivitiesComponent} from '../view-approval-activities/view-approval-activities.component';
@Component({
  selector: 'app-checker-list',
  standalone: true,
  imports: [CommonModule, DataGridComponent, ExpansionPanelHeader],
  templateUrl: './checker-list.html',
  styleUrl: './checker-list.scss'
})
export class CheckerList implements OnInit {
  router = inject(Router);
  dialog = inject(MatDialog);
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

  loadPending(): void {
    this.dataSource = this.apiResponse.map((item: any) => ({
      ...item,
      currentContext: this.parseJson(item.currentUxContent),
      previousContext: this.parseJson(item.previousUxContent),
    }));
  }

  view(row: any): void {
    this.router.navigateByUrl('config/approval-movement', {state: {data: row}});
  }

  showApprovalSteps(row: any): void {
    this.dialog.open(ViewApprovalActivitiesComponent, {
      width: '600px',
      data: row
    });
  }

  private parseJson(jsonStr: string): any {
    try {
      return JSON.parse(jsonStr || '{}');
    } catch {
      return {};
    }
  }

}
