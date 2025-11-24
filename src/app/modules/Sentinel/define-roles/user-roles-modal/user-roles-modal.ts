import {Component, EventEmitter, inject, Input, Output} from '@angular/core';
import {UserRolesModel} from '../../../model/UserRoles.model';
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {DefineRolesService} from '../../../service/define-roles-service';
import {ToastrService} from 'ngx-toastr';
import {CommonModule} from '@angular/common';
import {MatMenuModule} from '@angular/material/menu';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import { GenericDataGrid } from '../../../../shared/common-components/generic-component-type/generic-data-grid';
import { GenericModal } from '../../../../shared/common-components/generic-component-type/generic-modal/generic-modal';

@Component({
  selector: 'app-user-roles-modal',
  imports: [GenericDataGrid,GenericModal, MatMenuModule,
    MatIconModule, ReactiveFormsModule, MatButtonModule, CommonModule],
  templateUrl: './user-roles-modal.html',
  styleUrl: './user-roles-modal.scss'
})
export class UserRolesModal {

  @Input() showUserRolesModal!: boolean;
  @Output() roleSelected = new EventEmitter<any>();
  @Input() roleName: any | null = null;

  modalForm!: FormGroup;
  userRolesList: UserRolesModel[] = [];
  showUserModalGrid = false;
  toastr = inject(ToastrService);

  constructor(private formBuilder: FormBuilder, private service:DefineRolesService) {}
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
    this.service.getAllRoles().subscribe({
      next: (res: any) => {
        console.log("userRolesList....  ", res)
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
