import { Component, computed, EventEmitter, Inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-view-approval-activities',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogContent,
    MatIcon,
    MatButtonModule
  ],
  templateUrl: './view-approval-activities.component.html',
  styleUrl: './view-approval-activities.component.scss'
})
export class ViewApprovalActivitiesComponent {
  closeEventEmitter: EventEmitter<boolean> = new EventEmitter<boolean>();
  selectedStepId = signal<number | null>(null);

  approvalStepsJson = [
    {
      "queueId": 224,
      "setId": 245,
      "approveLevel": 1,
      "approverNo": 2,
      "approveFlag": "PENDING",
      "userId": "checker_manager",
      "appId": 901,
      "functionId": 901003,
      "remarks": "Waiting manager review",
      "actionTime": null
    },
    {
      "queueId": 225,
      "setId": 245,
      "approveLevel": 1,
      "approverNo": 2,
      "approveFlag": "PENDING",
      "userId": "checker_manager2",
      "appId": 901,
      "functionId": 901003,
      "remarks": null,
      "actionTime": null
    },
    {
      "queueId": 226,
      "setId": 245,
      "approveLevel": 2,
      "approverNo": 1,
      "approveFlag": "DEFAULT",
      "userId": "checker_gm",
      "appId": 901,
      "functionId": 901003,
      "remarks": null,
      "actionTime": null
    },
    {
      "queueId": 227,
      "setId": 245,
      "approveLevel": 2,
      "approverNo": 1,
      "approveFlag": "DEFAULT",
      "userId": "checker_gm2",
      "appId": 901,
      "functionId": 901003,
      "remarks": null,
      "actionTime": null
    },
    {
      "queueId": 228,
      "setId": 245,
      "approveLevel": 3,
      "approverNo": 1,
      "approveFlag": "DEFAULT",
      "userId": "checker_ceo",
      "appId": 901,
      "functionId": 901003,
      "remarks": null,
      "actionTime": null
    }
  ];

  steps: any[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ViewApprovalActivitiesComponent>
  ) {
    //this.getHistorySteps(data.recordUuid, data.approvalConfigId);
    this.transformApprovalData();
  }

  ngOnInit(): void {

  }

  transformApprovalData() {
    // Group by approveLevel
    const groupedByLevel = this.approvalStepsJson.reduce((acc, item) => {
      if (!acc[item.approveLevel]) {
        acc[item.approveLevel] = [];
      }
      acc[item.approveLevel].push(item);
      return acc;
    }, {} as Record<number, any[]>);

    // Transform to steps structure
    this.steps = Object.keys(groupedByLevel).map((level) => {
      const levelNum = parseInt(level);
      const approvers = groupedByLevel[levelNum];
      const minReqSupervisor = approvers[0].approverNo;

      return {
        stepOrder: levelNum,
        stepName: this.getStepName(levelNum),
        minReqSupervisor: minReqSupervisor,
        historyList: approvers.map(approver => ({
          performedBy: approver.userId,
          role: this.getRoleName(approver.userId),
          status: this.mapApproveFlag(approver.approveFlag),
          performedTime: approver.actionTime ? new Date(approver.actionTime) : null,
          comment: approver.remarks
        }))
      };
    });
  }

  // getHistorySteps(recordId, currentStepId){
  //     this.approvalHistoryService.getHistoryByStep({currentApprovalStateId: currentStepId, recordId: recordId}).subscribe(res =>{
  //         this.steps = res.payload;
  //     })
  // }

  confirm(value: boolean): void {
    this.closeEventEmitter.emit(value);
    this.dialogRef.close();
  }

  // --- helpers ---
  getStepStatus(approvers: any[]): 'SUBMITTED' | 'PENDING' | 'REJECTED' | 'CREATED' | 'APPROVED' {
    if (!approvers || approvers.length === 0) {
      return 'CREATED';
    }

    const APPROVED = approvers?.filter(a => a.status === 'APPROVED')?.length;
    const REJECTED = approvers?.filter(a => a.status === 'REJECTED')?.length;
    const PENDING = approvers?.filter(a => a.status === 'PENDING')?.length;
    const SUBMITTED = approvers?.filter(a => a.status === 'SUBMITTED')?.length;

    if (REJECTED > 0) return 'REJECTED';
    if (PENDING > 0) return 'PENDING';
    if (SUBMITTED > 0) return 'SUBMITTED';
    if (APPROVED === approvers.length) return 'APPROVED';
    return 'CREATED';
  }

  getStepName(level: number): string {
    const stepNames: Record<number, string> = {
      1: 'Manager Review',
      2: 'General Manager Approval',
      3: 'CEO Final Approval'
    };
    return stepNames[level] || `Level ${level} Approval`;
  }

  getRoleName(userId: string): string {
    // @ts-ignore
    if (userId.includes('manager')) return 'Manager';
    // @ts-ignore
    if (userId.includes('gm')) return 'General Manager';
    // @ts-ignore
    if (userId.includes('ceo')) return 'CEO';
    return 'Approver';
  }

  mapApproveFlag(flag: string): string {
    const flagMapping: Record<string, string> = {
      'PENDING': 'PENDING',
      'DEFAULT': 'CREATED',
      'APPROVED': 'APPROVED',
      'REJECTED': 'REJECTED',
      'SUBMITTED': 'SUBMITTED'
    };
    return flagMapping[flag] || 'CREATED';
  }

  getApprovedCount(approvers: any[]) {
    return approvers?.filter(a => a.status === 'APPROVED')?.length || 0;
  }

  toggleStep(id: number) {
    this.selectedStepId.update(cur => (cur === id ? null : id));
  }

  // Computed properties (uncomment if you need them for the stats section)
  // submittedStepsCount = computed(() =>
  //     this.steps.filter(s => this.getStepStatus(s.historyList) === 'SUBMITTED').length
  // );

  // PENDINGStepsCount = computed(() =>
  //     this.steps.filter(s => this.getStepStatus(s.historyList) === 'PENDING').length
  // );

  // createdStepsCount = computed(() =>
  //     this.steps.filter(s => this.getStepStatus(s.historyList) === 'CREATED').length
  // );

  // totalApprovalsCount = computed(() =>
  //     this.steps.reduce((sum, step) => sum + this.getApprovedCount(step.historyList), 0)
  // );

  // totalApproversCount = computed(() =>
  //     this.steps.reduce((sum, step) => sum + (step.historyList?.length || 0), 0)
  // );
}
