import { Component, Inject, signal, computed } from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef, MatDialogContent, MatDialogClose} from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

// Raw JSON structure from your approval service
interface RawApproval {
  queueId: number;
  setId: number;
  approveLevel: number;
  approverNo: number;
  approveFlag: string;
  userId: string;
  remarks: string | null;
  actionTime: string | null;
}

interface ApproverDetail {
  performedBy: string;
  role: string;
  status: 'APPROVED' | 'REJECTED' | 'PENDING' | 'CREATED';
  performedTime: Date | null;
  comment: string | null;
}

interface ApprovalStep {
  stepOrder: number;
  stepName: string;
  minReqSupervisor: number;
  historyList: ApproverDetail[];
}

@Component({
  selector: 'app-view-approval-activities',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogContent,
    MatIconModule,
    MatButtonModule,
    MatDialogClose
  ],
  templateUrl: './view-approval-activities.component.html',
})
export class ViewApprovalActivitiesComponent {
  selectedStepId = signal<number | null>(null);

  // Hardcoded demo JSON (replace with real API response if needed)
  //senario 1
  rawData1: RawApproval[] = [
    {
      queueId: 224, setId: 245, approveLevel: 1, approverNo: 2,
      approveFlag: 'PENDING', userId: 'checker_manager', remarks: null, actionTime: null
    },
    {
      queueId: 225, setId: 245, approveLevel: 1, approverNo: 2,
      approveFlag: 'PENDING', userId: 'checker_manager2', remarks: null, actionTime: null
    },
    {
      queueId: 226, setId: 245, approveLevel: 2, approverNo: 1,
      approveFlag: 'DEFAULT', userId: 'checker_gm', remarks: null, actionTime: null
    },
    {
      queueId: 227, setId: 245, approveLevel: 2, approverNo: 1,
      approveFlag: 'DEFAULT', userId: 'checker_gm2', remarks: null, actionTime: null
    },
    {
      queueId: 228, setId: 245, approveLevel: 3, approverNo: 1,
      approveFlag: 'DEFAULT', userId: 'checker_ceo', remarks: null, actionTime: null
    }
  ];
  //senario 2
  rawData: RawApproval[] = [
    // --- Level 1: Manager Review ---
    {
      queueId: 224, setId: 245, approveLevel: 1, approverNo: 2,
      approveFlag: 'APPROVED', userId: 'checker_manager',
      remarks: 'Reviewed and verified', actionTime: '2025-11-07T09:45:00Z'
    },
    {
      queueId: 225, setId: 245, approveLevel: 1, approverNo: 2,
      approveFlag: 'APPROVED', userId: 'checker_manager2',
      remarks: 'All documents are valid', actionTime: '2025-11-07T10:00:00Z'
    },

    // --- Level 2: General Manager Approval ---
    {
      queueId: 226, setId: 245, approveLevel: 2, approverNo: 1,
      approveFlag: 'PENDING', userId: 'checker_gm',
      remarks: 'Awaiting GM confirmation', actionTime: null
    },
    {
      queueId: 227, setId: 245, approveLevel: 2, approverNo: 1,
      approveFlag: 'DEFAULT', userId: 'checker_gm2',
      remarks: null, actionTime: null
    },

    // --- Level 3: CEO Final Approval ---
    {
      queueId: 228, setId: 245, approveLevel: 3, approverNo: 1,
      approveFlag: 'DEFAULT', userId: 'checker_ceo',
      remarks: null, actionTime: null
    },

    // --- Level 4: Rejected Example ---
    {
      queueId: 229, setId: 245, approveLevel: 4, approverNo: 1,
      approveFlag: 'REJECTED', userId: 'checker_audit',
      remarks: 'Insufficient backup documents', actionTime: '2025-11-08T14:25:00Z'
    }
  ];

  steps: ApprovalStep[] = this.transformToSteps(this.rawData);

  // overall computed timeline status
  timelineStatus = computed(() => {
    if (this.steps.some(s => this.getStepStatus(s.historyList) === 'REJECTED')) return 'REJECTED';
    if (this.steps.some(s => this.getStepStatus(s.historyList) === 'PENDING')) return 'PENDING';
    if (this.steps.every(s => this.getStepStatus(s.historyList) === 'APPROVED')) return 'APPROVED';
    return 'CREATED';
  });

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ViewApprovalActivitiesComponent>
  ) {}

  // --- Transform JSON → Step model ---
  private transformToSteps(json: RawApproval[]): ApprovalStep[] {
    const grouped = json.reduce((acc: Record<number, RawApproval[]>, item: RawApproval) => {
      (acc[item.approveLevel] ||= []).push(item);
      return acc;
    }, {});

    return Object.keys(grouped)
      .map(levelStr => Number(levelStr))
      .sort((a, b) => a - b)
      .map(level => {
        const approvers = grouped[level];
        return {
          stepOrder: level,
          stepName: this.getStepName(level),
          minReqSupervisor: Math.max(...approvers.map((a: RawApproval) => a.approverNo ?? 1)),
          historyList: approvers.map((a: RawApproval) => ({
            performedBy: a.userId,
            role: this.getRoleName(a.userId),
            status: this.mapFlag(a.approveFlag),
            performedTime: a.actionTime ? new Date(a.actionTime) : null,
            comment: a.remarks
          }))
        };
      });
  }

  // --- Helper methods ---
  getStepStatus(approvers: ApproverDetail[]): 'APPROVED' | 'REJECTED' | 'PENDING' | 'CREATED' {
    const approved = approvers.filter(a => a.status === 'APPROVED').length;
    const rejected = approvers.filter(a => a.status === 'REJECTED').length;
    const pending = approvers.filter(a => a.status === 'PENDING').length;

    if (rejected > 0) return 'REJECTED';
    if (pending > 0) return 'PENDING';

    // @ts-ignore
    const parent = this.steps.find(s => s.historyList === approvers);
    if (approved >= (parent?.minReqSupervisor ?? 1)) return 'APPROVED';

    return 'CREATED';
  }

  getApprovedCount(list: ApproverDetail[]): number {
    return list.filter(a => a.status === 'APPROVED').length;
  }

  getStepName(level: number): string {
    return {
      1: 'Manager Review',
      2: 'General Manager Approval',
      3: 'CEO Approval'
    }[level] || `Level ${level}`;
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

  mapFlag(flag: string): 'APPROVED' | 'REJECTED' | 'PENDING' | 'CREATED' {
    switch (flag) {
      case 'APPROVED': return 'APPROVED';
      case 'REJECTED': return 'REJECTED';
      case 'PENDING': return 'PENDING';
      default: return 'CREATED';
    }
  }

  toggleStep(id: number) {
    this.selectedStepId.update(cur => (cur === id ? null : id));
  }
}
