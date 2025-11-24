import {Component, effect, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {UserProfileModel} from '../../model/UserProfile.model';
import {CommonModule} from '@angular/common';
import {MatMenuModule} from '@angular/material/menu';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {UserProfileService} from '../../service/user-profile-service';
import { InputSelectOptionField } from '../../../shared/common-components/input-types/input-select-option-field/input-select-option-field';
import { GenericButton } from '../../../shared/common-components/generic-component-type/generic-button/generic-button';
import { GenericModal } from '../../../shared/common-components/generic-component-type/generic-modal/generic-modal';
import { GenericDataGrid } from '../../../shared/common-components/generic-component-type/generic-data-grid';

@Component({
  selector: 'app-user-list-modal',
  imports: [CommonModule,  InputSelectOptionField, GenericButton, GenericModal,
    GenericDataGrid, MatMenuModule, MatIconModule, ReactiveFormsModule, MatButtonModule],
  templateUrl: './user-list-modal.html',
  styleUrl: './user-list-modal.scss'
})
export class UserListModal implements OnInit{
  @Input() showUserModal!: boolean;
  @Output() userSelected = new EventEmitter<any>();
  @Input() userId: any | null = null;
  user!: UserProfileModel;
  userList: UserProfileModel[] = [];

  modalForm!: FormGroup;
  frmGroup!: FormGroup;
  officeOptions: { key: string, value: string }[] = [];
  showUserModalGrid = false;
  showUserListModal = false;

  constructor(private formBuilder: FormBuilder, private userProfileService:UserProfileService) {
  }
  ngOnInit(): void {
    this.modalForm = this.formBuilder.group({
      homeOfficeId: [''],
    });
    this.loadDataForOffice();
  }
  loadDataForOffice() {
    const request = { };
    this.userProfileService.getAllOffice(request).subscribe({
      next: (res: any) => {
        this.officeOptions = res.map((item: { OFFICE_ID: any; OFFICE_NAME: any; }) => ({
          key: item.OFFICE_ID,
          value: item.OFFICE_NAME
        }));
      },
      error: (err) => { console.error(err); alert('Error Fetching Data'); }
    });
  }
  async getUserList(): Promise<void> {
    const officeId = this.modalForm.value.homeOfficeId;
    this.userProfileService.getAllUser(officeId).subscribe({
      next: (res: any) => {
        this.userList = res
        if(this.userList!=null){
          this.showUserModalGrid=true;
        }
      },
      error: (err) => { console.error(err); alert('Error Fetching Data'); }
    });
    console.log("userList....  ", this.userList )
  }

  loadUser(serializedData: string): void {
    const selectedUser  = JSON.parse(serializedData);
    //this.onUserIdChange(selectedUser.userId);
    this.userSelected.emit(selectedUser);
    this.closeModal();
  }

  openModal() {
    this.showUserModal = true;
  }
  closeModal() {
    this.showUserModal = false;
  }
}
