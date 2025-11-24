import {Component, effect, EventEmitter, inject, Input, OnInit, Output, signal, WritableSignal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TextBaseInput} from '../../../shared/components/input-types/text-base-input/text-base-input';
import {ExpansionPanelHeader} from '../../../shared/components/expansion-panel-header/expansion-panel-header';
import {SelectOptionField} from '../../../shared/components/input-types/select-option-field/select-option-field';
import {DataGridComponent} from '../../../shared/components/data-grid/data-grid';
import {MatMenuModule} from '@angular/material/menu';
import {MatIconModule} from '@angular/material/icon';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {SubPanelHeader} from '../../../shared/components/sub-panel-header/sub-panel-header';
import {MatButtonModule} from '@angular/material/button';
import {IdBoxComponent} from '../../../shared/components/input-types/id-box/id-box';
import {BUTTON_VISIBILITY, ONCLICK_RESET, ONCLICK_SAVE} from '../../../shared/constant/button-signals.constant';
import {ToastrService} from 'ngx-toastr';
import {UserGrantPackageModel, UserProfileModel} from '../../model/UserProfile.model';
import {UserListModal} from '../user-list-modal/user-list-modal';
import {UserGrantRole, UserRolesModel} from '../../model/UserRoles.model';
import {UserProfileService} from '../../service/user-profile-service';
import {AssignRolesToUserService} from '../../service/assign-roles-to-user-service';

@Component({
  selector: 'app-assign-roles-to-user',
  imports: [CommonModule, TextBaseInput, UserListModal, ExpansionPanelHeader, SelectOptionField,   DataGridComponent,
      MatMenuModule, MatIconModule, ReactiveFormsModule, SubPanelHeader,
    MatButtonModule, IdBoxComponent],
  templateUrl: './assign-roles-to-user.html',
  styleUrl: './assign-roles-to-user.scss'
})

export class AssignRolesToUser implements OnInit{

  onClickSave = ONCLICK_SAVE;
  onClickReset = ONCLICK_RESET;
  toastr = inject(ToastrService);

  businessHeaderPanel: WritableSignal<boolean> = signal(true);

  user!: UserProfileModel;
  userList: UserProfileModel[] = [];

  unAssignedUserRole: UserRolesModel[] = [];
  assignedUserRole: UserGrantRole[] = [];   // list to be removed

  addRoleList: UserGrantRole[] = [];
  removeRoleList: UserGrantRole[] = [];     // list to be added

  frmGroup!: FormGroup;
  modalForm!: FormGroup;
  roleForm!: FormGroup;
  officeOptions: { key: string, value: string }[] = [];
  showUserModal = false;
  showUserInfoBlock : boolean | null = null;

  showUnassignedGrid = true;
  showAssignedGrid = true;
  showAssignedRoleGrid = false;
  showUnassignedRoleGrid = false;


  constructor(private formBuilder: FormBuilder, private userProfileService:UserProfileService, private baseService: AssignRolesToUserService) {
    BUTTON_VISIBILITY.set({
      save: true,
      update: false,
      view: false,
      delete: false,
      exit: false,
      reset: true,
    });
    effect(() => {
      if(this.onClickSave()) {
        this.submit();
        ONCLICK_SAVE.set(false);
      }
      if(this.onClickReset()) {
        this.reset();
        ONCLICK_RESET.set(false);
      }
    });
  }
  ngOnInit(): void {
    this.frmGroup = this.formBuilder.group({
      user: this.formBuilder.group({
        userId: ['',  [Validators.required]],
        userName: [''],
        userDescription: [''],
        userStatusActiveFlag: [''],
        homeOfficeId: [''],
      }),
      userStatus: [''],
    });
    this.roleForm = this.formBuilder.group({
      fromDt: [''],
      toDt: ['']
    });
    this.loadDataForOffice();
  }

  get userForm(): FormGroup {
    return this.frmGroup.get('user') as FormGroup;
  }

  loadUser(serializedData: any): void {
    console.log("load user... ", serializedData);
    this.onUserIdChange(serializedData.userId);
  }

  onUserIdChange(userId: any): void {
    this.userProfileService.getUserProfileById(userId)
      .subscribe(data => {
        this.user = data;

        if (this.user?.userName != null) {
          this.showUserInfoBlock = true;
          const status = this.user?.userStatusActiveFlag === 1 ? 'Active' : 'Inactive';
          this.frmGroup.patchValue({ userStatus: status });

          this.baseService.getUnassignedUserRoles(userId)
            .subscribe(data => {
              this.unAssignedUserRole = data;
              console.log("unassigned roles....", this.unAssignedUserRole);
              this.showUnassignedRoleGrid=true;
            });
          this.baseService.getAssignedUserRoles(userId)
            .subscribe(data => {
              this.assignedUserRole = data;
              console.log("assigned roles....", this.assignedUserRole);
              this.showAssignedRoleGrid=true;
            });
        }else{
          this.showUserInfoBlock = false;
        }
        console.log("this.user: ", this.user);
        this.frmGroup.get('user')?.patchValue(this.user);
      });
  }


  openModal(){
    this.showUserModal = false;
    setTimeout(() => {
      this.showUserModal = true;
    }, 0);
  }

  resetUnassignedGrid(): void {
    this.showUnassignedGrid = false;
    setTimeout(() => {
      this.showUnassignedGrid = true;
    }, 0);
  }

  onAddPackageRowSelect(event: { data: string; checked: boolean }): void {
    const selectedPkg = JSON.parse(event.data);

    if (event.checked) {
      // Add if not already there
      if (!this.addRoleList.some(p => p.roleName === selectedPkg.packageId)) {
        this.addRoleList.push(selectedPkg);
      }
    } else {
      // Remove if unchecked
      this.addRoleList = this.addRoleList.filter(p => p.roleName !== selectedPkg.packageId);
    }
  }

  onAddAllPackageRowSelect(event: { isSelectAll: boolean; selectedRows: UserRolesModel[]; count: number }): void {
    console.log('Select all package:', event);

    if (event.isSelectAll) {
      // Convert UserPackageModel[] → UserGrantPackageModel[]
      this.addRoleList = this.unAssignedUserRole.map(pkg => ({
        userId: this.frmGroup.get('user.userId')?.value || '',
        roleName: pkg.roleName,
        approveFlag:1,        //hard coded for now
        fromDt: null,
        toDt: null
      }));
    } else {
      this.addRoleList = [];
    }
  }



  selectPackage(): void {
    if (this.addRoleList.length > 0) {
      const allPackages = [...this.assignedUserRole, ...this.addRoleList];
      this.assignedUserRole = allPackages.filter(
        (pkg, index, self) => index === self.findIndex(p => p.roleName === pkg.roleName)
      );

      this.unAssignedUserRole = this.unAssignedUserRole.filter(
        pkg => !this.addRoleList.some(selected => selected.roleName === pkg.roleName)
      );

      this.addRoleList = [];
      this.showAssignedRoleGrid = true;

      // Force UI grid to refresh so checkboxes clear visually
      this.resetUnassignedGrid();
    }
  }
  resetAssignedGrid(): void {
    this.showAssignedGrid = false;
    setTimeout(() => {
      this.showAssignedGrid = true;
    }, 0);
  }

  /*onRemoveAllPackageRowSelect(event: { isSelectAll: boolean; selectedRows: UserGrantRole[]; count: number }): void {
    console.log('Select all package:', event);

    if (event.isSelectAll) {
      // Convert UserPackageModel[] → UserGrantPackageModel[]
      this.removeRoleList = this.assignedUserRole.map(pkg => ({
        userId: pkg.userId,
        roleName: pkg.roleName,
        approveFlag: 1,
        fromDt:null,
        toDt:null
      }));
    } else {
      this.removeRoleList = [];
    }
  }*/
  onRemoveAllPackageRowSelect(event: { isSelectAll: boolean; selectedRows: UserGrantRole[]; count: number }): void {
    console.log('Select all package:', event);

    if (event.isSelectAll) {
      const newItems = event.selectedRows.map(pkg => ({
        userId: pkg.userId,
        roleName: pkg.roleName,
        approveFlag: 1,
        fromDt: pkg.fromDt ?? null,
        toDt: pkg.toDt ?? null
      }));

      const combined = [...this.removeRoleList, ...newItems];
      this.removeRoleList = combined.filter(
        (pkg, index, self) => index === self.findIndex(p => p.roleName === pkg.roleName)
      );
    } else {
      this.removeRoleList = [];
    }

    console.log('Updated removeRoleList:', this.removeRoleList);
  }

  /*removePackage(): void {
    if (!this.removeRoleList || this.removeRoleList.length === 0) return;

    const removeRoleNames = new Set(this.removeRoleList.map(r => r.roleName));
    const convertedToUserRoles: UserRolesModel[] = this.removeRoleList.map(r => ({
      roleName: r.roleName,
      roleDescrip: null,
      approveFlag: 1 // hard code for now
    }));

    const merged = [...this.unAssignedUserRole, ...convertedToUserRoles];
    this.unAssignedUserRole = merged.filter(
      (pkg, index, self) => index === self.findIndex(p => p.roleName === pkg.roleName)
    );

    this.assignedUserRole = this.assignedUserRole.filter(
      pkg => !removeRoleNames.has(pkg.roleName)
    );

    this.removeRoleList = [];
    this.showUnassignedRoleGrid = true;
    this.resetAssignedGrid();
  }*/
  removePackage(): void {
    if (!this.removeRoleList || this.removeRoleList.length === 0) return;

    const removeRoleNames = new Set(this.removeRoleList.map(r => r.roleName));

    // Convert UserGrantRole → UserRolesModel
    const convertedToUserRoles: UserRolesModel[] = this.removeRoleList.map(r => ({
      roleName: r.roleName,
      roleDescrip: null,
      approveFlag: 1
    }));

    const merged = [...this.unAssignedUserRole, ...convertedToUserRoles];
    this.unAssignedUserRole = merged.filter(
      (pkg, index, self) => index === self.findIndex(p => p.roleName === pkg.roleName)
    );

    this.assignedUserRole = this.assignedUserRole.filter(
      pkg => !removeRoleNames.has(pkg.roleName)
    );

    this.showUnassignedRoleGrid = true;
    this.resetAssignedGrid();
  }


  /*onRemovePackageRowSelect(event: { data: string; checked: boolean }): void {
    const selectedPkg = JSON.parse(event.data);

    if (event.checked) {
      // Add if not already there
      if (!this.removeRoleList.some(p => p.roleName === selectedPkg.roleName)) {
        this.removeRoleList.push(selectedPkg);
      }
    } else {
      // Remove if unchecked
      this.removeRoleList = this.removeRoleList.filter(p => p.roleName !== selectedPkg.roleName);
    }
  }*/
  onRemovePackageRowSelect(event: { data: string; checked: boolean }): void {
    const selectedPkg: UserGrantRole = JSON.parse(event.data);

    if (event.checked) {
      // Add if not already selected
      if (!this.removeRoleList.some(p => p.roleName === selectedPkg.roleName)) {
        this.removeRoleList.push(selectedPkg);
      }
    } else {
      // Remove if unchecked
      this.removeRoleList = this.removeRoleList.filter(p => p.roleName !== selectedPkg.roleName);
    }

    console.log('Updated removeRoleList:', this.removeRoleList);
  }
  editPackage(serializedData: string) {
    const editPackage = JSON.parse(serializedData) as UserGrantPackageModel;
    console.log('Edit data received:', editPackage);

    this.roleForm.patchValue({
      fromDt: editPackage.fromDt,
      toDt: editPackage.toDt
    });
  }
  onPackageChanged(newData: any[]): void {
    console.log("Package change... ", newData);

    const datePattern = /^\d{4}-\d{2}-\d{2}$/;

    const validatedPackageData = newData.map(editPackage => {
      let isValid = true;

      if (editPackage.fromDt) {
        if (!datePattern.test(editPackage.fromDt)) {
          this.toastr.error('Invalid From Date format. Expected: YYYY-MM-DD', 'Validation Error');
          editPackage.fromDt = ''; // Clear invalid field
          isValid = false;
        } else {
          const fromDate = new Date(editPackage.fromDt);
          if (isNaN(fromDate.getTime())) {
            this.toastr.error('Invalid From Date value.', 'Validation Error');
            editPackage.fromDt = '';
            isValid = false;
          }
        }
      }

      if (editPackage.toDt) {
        if (!datePattern.test(editPackage.toDt)) {
          this.toastr.error('Invalid To Date format. Expected: YYYY-MM-DD', 'Validation Error');
          editPackage.toDt = '';
          isValid = false;
        } else {
          const toDate = new Date(editPackage.toDt);
          if (isNaN(toDate.getTime())) {
            this.toastr.error('Invalid To Date value.', 'Validation Error');
            editPackage.toDt = '';
            isValid = false;
          }
        }
      }

      // Compare only if both are valid and non-empty
      if (isValid && editPackage.fromDt && editPackage.toDt) {
        const fromDate = new Date(editPackage.fromDt);
        const toDate = new Date(editPackage.toDt);

        if (toDate < fromDate) {
          this.toastr.error('To Date cannot be earlier than From Date.', 'Validation Error');
          editPackage.toDt = ''; // clear invalid date
          isValid = false;
        }
      }

      return editPackage;
    });

    // Update with validated data
    this.assignedUserRole = validatedPackageData;

    this.toastr.success('Package data updated with validation', 'Data Updated');
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

  submit() {
    if (this.frmGroup.invalid) {
      this.frmGroup.markAllAsTouched();
      this.toastr.warning("Data Invalid/Missing.", "Warning");
      return;
    }

    const formValue = this.frmGroup.value.user;

    // --- Build assign list ---
    const assignRequest: UserGrantRole[] = this.assignedUserRole.map(pkg => ({
      userId: formValue.userId,
      roleName: pkg.roleName,
      approveFlag: 1,
      fromDt: pkg.fromDt,
      toDt: pkg.toDt
    }));

    // --- Build remove list ---
    const removeRequest: UserGrantRole[] = this.removeRoleList
      .filter((pkg, index, self) => index === self.findIndex(p => p.roleName === pkg.roleName))
      .map(pkg => ({
        userId: formValue.userId,
        roleName: pkg.roleName,
        approveFlag: 1,
        fromDt: pkg.fromDt ?? null,
        toDt: pkg.toDt ?? null
      }));

    console.log("Save List: ", assignRequest);
    console.log("Remove List: ", removeRequest);

    // --- API Calls ---
    if (assignRequest.length > 0) {
      this.baseService.assignRolesToUser(assignRequest).subscribe({
        next: (res) => {
          console.log('Assign successful:', res);
          this.toastr.success('Data saved successfully!', 'Save Successful');
        },
        error: (err) => {
          console.error('Assign API Error:', err);
          this.toastr.error('Error saving data', 'Error');
        }
      });
    }

    if (removeRequest.length > 0) {
      this.baseService.removeRolesFromUser(removeRequest).subscribe({
        next: (res) => {
          console.log('Remove successful:', res);
          this.toastr.success('Data removed successfully!', 'Removed Successful');
        },
        error: (err) => {
          console.error('Remove API Error:', err);
          this.toastr.error('Error removing data', 'Error');
        }
      });
    }
  }

  reset(){
    this.frmGroup.reset();
    this.roleForm.reset();
    this.showUnassignedRoleGrid = false;
    // this.showUnassignedGrid = false;
    // this.showAssignedGrid = false;

    this.addRoleList = [];
    this.removeRoleList= [];
    this.unAssignedUserRole = [];
    this.assignedUserRole = [];
    this.showAssignedRoleGrid = false;
    this.showUserInfoBlock = null;
  }
}
