import {Component, EventEmitter, inject, Input, Output, signal} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {ToastrService} from 'ngx-toastr';
import {DataGridComponent} from '../../../../shared/components/data-grid/data-grid';
import {LdsModalComponent} from '../../../../shared/components/lds-modal/lds-modal';
import {MatMenuModule} from '@angular/material/menu';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {CommonModule} from '@angular/common';
import {WorkflowDesignerService} from '../services/workflow-designer.service';
import {ApprovalFunctionLevelModel} from '../../../model/approval-workflow.model';

@Component({
  selector: 'app-view-workflow-modal',
  standalone: true,
  imports: [ DataGridComponent, MatMenuModule,
    MatIconModule, ReactiveFormsModule, MatButtonModule, CommonModule],
  templateUrl: './view-workflow-modal.html',
  styleUrl: './view-workflow-modal.scss'
})
export class ViewWorkflowModal {
  @Input() modalComponentData: any;
  @Output() modalResult = new EventEmitter<any>();

  workFlowId: any = null;
  modalForm!: FormGroup;
//  userRolesList: ApprovalFunctionLevelModel[] = [];
  userRolesList = signal<ApprovalFunctionLevelModel[]>([]);
  showUserModalGrid = false;

  constructor(
    private formBuilder: FormBuilder,
    private service: WorkflowDesignerService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.modalForm = this.formBuilder.group({
      workFlowId: [''],
    });
    this.getAllRoles();
    // Take incoming roleName
    if (this.modalComponentData) {
      this.workFlowId = this.modalComponentData.workflowId;
    }

  }

  getAllRoles() {
    this.service.getAllFunctionLevels().subscribe({
      next: (res) => {
        const transformedRequests: ApprovalFunctionLevelModel[] = (res || []).map((request) => ({
          workflowId: request.workflowId ?? null, // match optional number | null
          workflowName: request.workflowName != null ? String(request.workflowName) : null, // ensure string | null
          appId: request.appId ?? null,           // match optional number | null
          numberOfApprovalLevel: request.numberOfApprovalLevel ?? 0, // required field
        }));

        this.userRolesList.set(transformedRequests);
        this.showUserModalGrid = true;
      },
      error: () => this.toastr.error("Error fetching workflow list")
    });
  }
  loadUserRoles(serializedData: string) {
    const selectedRole = JSON.parse(serializedData);
    this.modalResult.emit(selectedRole);
  }
}

