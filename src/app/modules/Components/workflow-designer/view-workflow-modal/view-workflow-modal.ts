import {Component, EventEmitter, inject, Input, Output} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {UserRolesModel} from '../../../model/UserRoles.model';
import {ToastrService} from 'ngx-toastr';
import {DefineRolesService} from '../../../service/define-roles-service';
import {Button} from '../../../../shared/components/input-types/button/button';
import {DataGridComponent} from '../../../../shared/components/data-grid/data-grid';
import {LdsModalComponent} from '../../../../shared/components/lds-modal/lds-modal';
import {MatMenuModule} from '@angular/material/menu';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {CommonModule} from '@angular/common';
import {WorkflowDesignerService} from '../services/workflow-designer.service';

@Component({
  selector: 'app-view-workflow-modal',
  imports: [Button, DataGridComponent,LdsModalComponent, MatMenuModule,
    MatIconModule, ReactiveFormsModule, MatButtonModule, CommonModule],
  templateUrl: './view-workflow-modal.html',
  styleUrl: './view-workflow-modal.scss'
})
export class ViewWorkflowModal {
  @Input() showUserRolesModal!: boolean;
  @Output() roleSelected = new EventEmitter<any>();
  @Input() roleName: any | null = null;

  modalForm!: FormGroup;
  userRolesList: UserRolesModel[] = [];
  showUserModalGrid = false;
  toastr = inject(ToastrService);

  constructor(private formBuilder: FormBuilder, private service:WorkflowDesignerService) {}
  ngOnInit(): void {
    this.modalForm = this.formBuilder.group({
      roleName: [''],
    });
    this.getAllRoles();
  }

  closeModal() {
    this.showUserRolesModal = false;
  }
  getAllRoles() {
    this.service.getAllFunctionLevels().subscribe({
      next: (res: any) => {
        console.log("workflow List....  ", res)
        this.userRolesList = res
        if(this.userRolesList!=null){
          this.showUserModalGrid = true;
        }
      },
      error: (err) => { console.error(err); alert('Error Fetching Data'); }
    });

  }
  loadUserRoles(serializedData: string): void {
    const selectedRole = JSON.parse(serializedData);
    this.roleSelected.emit(selectedRole);
    this.closeModal();
  }
}
