import {Component, effect, inject, OnInit, signal, WritableSignal} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {UserGrantPackageModel, UserProfileModel} from '../../model/UserProfile.model';
import {MatMenuModule} from '@angular/material/menu';
import {MatIconModule} from '@angular/material/icon';
import {UserPackageModel} from '../../model/UserPackage.model';
import {MatButtonModule} from '@angular/material/button';
import {BUTTON_VISIBILITY, ONCLICK_RESET, ONCLICK_SAVE} from '../../../../shared/constant/button-signals.constant';
import {ToastrService} from 'ngx-toastr';
import {UserListModal} from '../user-list-modal/user-list-modal';
import {UserProfileService} from '../../service/user-profile-service';
import { InputTextBox } from '../../../../shared/common-components/input-types/input-text-box/input-text-box';
import { InputSelectOptionField } from '../../../../shared/common-components/input-types/input-select-option-field/input-select-option-field';
import { ExpansionPanelHeader } from '../../../../shared/common-components/expansion-panel-header/expansion-panel-header';
import { GenericDataGrid } from '../../../../shared/common-components/generic-component-type/generic-data-grid/generic-data-grid';
import { GenericButton } from '../../../../shared/common-components/generic-component-type/generic-button/generic-button';
import { SubPanelHeader } from '../../../../shared/common-components/sub-panel-header/sub-panel-header';
import { GenericSwitch } from '../../../../shared/common-components/generic-component-type/generic-switch/generic-switch';
import { InputIdBox } from '../../../../shared/common-components/input-types/input-id-box/input-id-box';
import { InputFile } from '../../../../shared/common-components/input-types/input-file/input-file';

interface IpGridItem {
  logInUserTerminalIp: any;
}

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, InputTextBox, ExpansionPanelHeader, InputSelectOptionField, GenericButton, GenericDataGrid,
    MatMenuModule, MatIconModule, ReactiveFormsModule, SubPanelHeader,
    MatButtonModule, InputFile, InputIdBox, GenericSwitch,  UserListModal ],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.scss'
})
export class UserProfile implements OnInit{
  toastr = inject(ToastrService);
  user!: UserProfileModel;
  unAssignedUserPackage: UserPackageModel[] = [];
  assignedUserPackage: UserGrantPackageModel[] = [];                      // list to-be saved
  frmGroup!: FormGroup;
  modalForm!: FormGroup;
  packageForm!: FormGroup;
  showUserModal = false;
  onClickSave = ONCLICK_SAVE;
  onClickReset = ONCLICK_RESET;
  companyName = sessionStorage.getItem("companyName");
  officeId = sessionStorage.getItem("officeId");
  officeOptions: { key: string, value: string }[] = [];
  concatIpList: string | null;
  ipAddressList: IpGridItem[] = [];
  showUserIpGrid = false;
  showUnassignedGrid = true;
  showAssignedGrid = true;

  addPackageList: UserGrantPackageModel[] = [];
  removePackageList: UserPackageModel[] = [];
  showAssignedPackageGrid = false;
  isEmployeeInfoEnable = false;
  showUnassignedPackageGrid = false;
  showUserModalGrid = false;
  showEmployeeDetails = false;
  userList: UserProfileModel[] = [];
  businessHeaderPanel: WritableSignal<boolean> = signal(true);
  subPanel1: WritableSignal<boolean> = signal(true);

  selectedFiles: File[] = [];
  imageBase64: string | null = null;
  constructor(private formBuilder: FormBuilder, private userProfileService:UserProfileService) {
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
        userName: ['', [Validators.required]],
        userDescription: ['', [Validators.required]],
        mobileNumber: ['', [Validators.minLength(11),Validators.maxLength(11), Validators.pattern('^[0-9]*$')]],
        userEmailId: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)]],
        loginId: ['', [Validators.maxLength(15)]],
        employeeId: [''],
        homeOfficeId: ['',[Validators.required]],
        employeeCode: [''],
        macAddress: ['',  [Validators.pattern(/^([0-9A-Fa-f]{2}[-:]){5}([0-9A-Fa-f]{2})$/)]],
        logInUserTerminalIp: ['', [Validators.pattern(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/)]],
        logInAppTerminalIp: ['',  [Validators.pattern(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/)]],
        appLogInTime: ['', [Validators.pattern(/^([0-1]?[0-9]|2[0-3]):([0-5][0-9])(:[0-5][0-9])?$/)]],
        appLogOutTime: ['', [Validators.pattern(/^([0-1]?[0-9]|2[0-3]):([0-5][0-9])(:[0-5][0-9])?$/)]],
        sessionExpTime: [''],
        passwordString: [''],
        bankStaffFlag: [true],
      })
    });

    this.isEmployeeInfoEnable = true;
    this.frmGroup.get('user.bankStaffFlag')?.valueChanges.subscribe((isEnabled: boolean) => {
      this.handleSwitchToggle(isEnabled);
    });
  this.packageForm = this.formBuilder.group({
  fromDt: [''],
  toDt: ['']
});
    this.modalForm = this.formBuilder.group({
        homeOfficeId: [''],
    });
    this.loadDataForOffice();
  }

  private handleSwitchToggle(isEnabled: boolean): void {
    if (isEnabled) {
      this.showEmployeeDetails=true;
      //this.frmGroup.get('user.employeeId')?.setValidators([Validators.requiredTrue]);
      //this.frmGroup.get('user.employeeCode')?.setValidators([Validators.requiredTrue]);
    } else {
      this.showEmployeeDetails=false;
      //this.frmGroup.get('user.employeeId')?.clearValidators();
      //this.frmGroup.get('user.employeeCode')?.clearValidators();
    }
  }

  get userForm(): FormGroup {
    return this.frmGroup.get('user') as FormGroup;
  }

  onUserIdChange(userId: any): void {
    this.userProfileService.getUserProfileById(userId)
      .subscribe(data => {
        this.user = data;
        console.log("this.user: ", this.user );
        this.frmGroup.get('user')?.patchValue(this.user);
        if (this.user?.userImg) {
          if (this.user.userImg.startsWith('data:image')) {
            this.imageBase64 = this.user.userImg;
          } else {
            this.imageBase64 = `data:image/jpeg;base64,${this.user.userImg}`;
          }
        } else {
          this.imageBase64 = null;
        }
        if (this.user?.logInUserTerminalIp) {
          this.showUserIpGrid = true;
          this.extractIPs(this.user.logInUserTerminalIp);
          this.userForm.patchValue({
            logInUserTerminalIp: ''
          });
        }
        if (!this.user?.bankStaffFlag) {
          this.userForm.patchValue({
            bankStaffFlag: false
          });
        }
        if (this.user?.userId == null) {
        this.userProfileService.getAllPackage()
          .subscribe(data => {
            this.unAssignedUserPackage = data;
            console.log("packages....", this.unAssignedUserPackage);
            this.showUnassignedPackageGrid=true;
          });
      }
      });
  }
  extractIPs(ipString: string): void {
    if (!ipString) return;

    // Split by "/" and trim spaces
    const ipList = ipString.split('/').map(ip => ({
      logInUserTerminalIp: ip.trim()
    }));

    // Append to existing grid data
    this.ipAddressList = [...this.ipAddressList, ...ipList];
    console.log("Updated IP Address List: ", this.ipAddressList);
  }

  resetUnassignedGrid(): void {
    this.showUnassignedGrid = false;
    setTimeout(() => {
      this.showUnassignedGrid = true;
    }, 0);
  }

  /*onAddPackageRowSelect(serializedData: string): void {
    const selectedPkg = JSON.parse(serializedData);
    const exists = this.addPackageList.some(p => p.packageId === selectedPkg.packageId);

    if (exists) {
      this.addPackageList = this.addPackageList.filter(p => p.packageId !== selectedPkg.packageId);
    } else {
      this.addPackageList.push(selectedPkg);
    }
  }*/
  onAddPackageRowSelect(event: { data: string; checked: boolean }): void {
    const selectedPkg = JSON.parse(event.data);

    if (event.checked) {
      // Add if not already there
      if (!this.addPackageList.some(p => p.packageId === selectedPkg.packageId)) {
        this.addPackageList.push(selectedPkg);
      }
    } else {
      // Remove if unchecked
      this.addPackageList = this.addPackageList.filter(p => p.packageId !== selectedPkg.packageId);
    }
  }

/*  onAddAllPackageRowSelect(checked: boolean): void {
    console.log('Select all package:', checked);

    if (checked) {
      this.addPackageList = this.unAssignedUserPackage.map(pkg => ({
        userId: this.frmGroup.get('user.userId')?.value || '',
        packageId: pkg.packageId,
        fromDt: null,
        toDt: null
      }));
    } else {
      this.addPackageList = [];
    }
  }*/

  onAddAllPackageRowSelect(event: { isSelectAll: boolean; selectedRows: UserPackageModel[]; count: number }): void {
    console.log('Select all package:', event);

    if (event.isSelectAll) {
      // Convert UserPackageModel[] → UserGrantPackageModel[]
      this.addPackageList = this.unAssignedUserPackage.map(pkg => ({
        userId: this.frmGroup.get('user.userId')?.value || '',
        packageId: pkg.packageId,
        fromDt: null,
        toDt: null
      }));
    } else {
      this.addPackageList = [];
    }
  }



  selectPackage(): void {
    if (this.addPackageList.length > 0) {
      const allPackages = [...this.assignedUserPackage, ...this.addPackageList];
      this.assignedUserPackage = allPackages.filter(
        (pkg, index, self) => index === self.findIndex(p => p.packageId === pkg.packageId)
      );

      this.unAssignedUserPackage = this.unAssignedUserPackage.filter(
        pkg => !this.addPackageList.some(selected => selected.packageId === pkg.packageId)
      );

      this.addPackageList = [];
      this.showAssignedPackageGrid = true;

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
/*  onRemoveAllPackageRowSelect(checked: boolean): void {
    if (checked) {
      this.removePackageList = this.assignedUserPackage.map(pkg => ({
        packageId: pkg.packageId,
        packageName: '',
        packageDesc: ''
      }));
    } else {
      // Unselect all
      this.removePackageList = [];
    }
  }*/
  onRemoveAllPackageRowSelect(event: { isSelectAll: boolean; selectedRows: UserGrantPackageModel[]; count: number }): void {
    console.log('Select all package:', event);

    if (event.isSelectAll) {
      // Convert UserPackageModel[] → UserGrantPackageModel[]
      this.removePackageList = this.assignedUserPackage.map(pkg => ({
        packageId: pkg.packageId,
        packageName: '',
        packageDesc: ''
      }));
    } else {
      this.removePackageList = [];
    }
  }


  removePackage() {
    if (this.removePackageList.length > 0) {
      // Merge selected with assigned (remove duplicates)
      const allPackages = [...this.unAssignedUserPackage, ...this.removePackageList];
      this.unAssignedUserPackage = allPackages.filter(
        (pkg, index, self) => index === self.findIndex(p => p.packageId === pkg.packageId)
      );

      // Remove from unassigned list
      this.assignedUserPackage = this.assignedUserPackage.filter(
        pkg => !this.removePackageList.some(selected => selected.packageId === pkg.packageId)
      );

      this.removePackageList = [];
      this.showUnassignedPackageGrid = true;

      this.resetAssignedGrid();
    }
  }
/*  onRemovePackageRowSelect(serializedData: string): void {
    const selectedPkg = JSON.parse(serializedData) as UserPackageModel;
    const exists = this.removePackageList.some(p => p.packageId === selectedPkg.packageId);

    if (exists) {
      this.removePackageList = this.removePackageList.filter(p => p.packageId !== selectedPkg.packageId);
    } else {

      this.removePackageList.push(selectedPkg);
    }
  }*/
  onRemovePackageRowSelect(event: { data: string; checked: boolean }): void {
    const selectedPkg = JSON.parse(event.data);

    if (event.checked) {
      // Add if not already there
      if (!this.removePackageList.some(p => p.packageId === selectedPkg.packageId)) {
        this.removePackageList.push(selectedPkg);
      }
    } else {
      // Remove if unchecked
      this.removePackageList = this.removePackageList.filter(p => p.packageId !== selectedPkg.packageId);
    }
  }
  editPackage(serializedData: string) {
    const editPackage = JSON.parse(serializedData) as UserGrantPackageModel;
    console.log('Edit data received:', editPackage);

    this.packageForm.patchValue({
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
    this.assignedUserPackage = validatedPackageData;

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

  getUserList(){
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

  loadUser(serializedData: any): void {
    //const selectedUser = JSON.parse(serializedData);
    console.log("load user... ", serializedData);
   // const selectedUser  = JSON.parse(serializedData);
    this.onUserIdChange(serializedData.userId);
    //this.closeModal();
  }

  addAddresses() {
    const initFormValue = this.userForm.value;
/*    const macPattern = /^([0-9A-Fa-f]{2}[-:]){5}([0-9A-Fa-f]{2})$/;
    const ipPattern = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/;

    if (!macPattern.test(initFormValue.macAddress)) {
      alert('Invalid MAC Address format');
      return;
    }
    if (!ipPattern.test(initFormValue.logInAppTerminalIp)) {
      alert('Invalid Terminal IP');
      return;
    }
    if (!ipPattern.test(initFormValue.logInUserTerminalIp)) {
      alert('Invalid User Terminal IP');
      return;
    }*/

    this.showUserIpGrid = true;
    const gridItem: IpGridItem = {
      logInUserTerminalIp: initFormValue.logInUserTerminalIp,
    };

    this.ipAddressList = [...this.ipAddressList, gridItem];
    this.userForm.patchValue({
      logInUserTerminalIp: ''
    });

    this.userForm.get('logInUserTerminalIp')?.markAsPristine();
  }

  removeAddresses(serializedData: string) {
    const removeItem = JSON.parse(serializedData) as IpGridItem;
    this.ipAddressList = this.ipAddressList.filter(item =>
      !(
        item.logInUserTerminalIp === removeItem.logInUserTerminalIp
      )
    );
    if (this.ipAddressList.length === 0) {
      this.showUserIpGrid = false;
    }
  }

  editAddress(serializedData: string) {
    const editItem = JSON.parse(serializedData) as IpGridItem;
    console.log('Edit data received:', editItem);

    this.userForm.patchValue({
      logInUserTerminalIp: editItem.logInUserTerminalIp
    });
  }
  onIpDataChanged(newData: any[]): void {
    console.log('Transaction data changed:', newData);

    // Validate amounts in the updated data
    const validatedData = newData.map(editItem => {
      if (editItem.logInUserTerminalIp) {
        // Ensure amount is within valid range
        const ipPattern = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/;
        if (!ipPattern.test(editItem.logInUserTerminalIp)) {
          alert('Invalid User Terminal IP');
          return;
        }
      }
      return editItem;
    });

    // Update with validated data
    this.ipAddressList = validatedData;

    this.toastr.success('IP address updated with validation', 'Data Updated');
  }

  openModal() {
    this.showUserModal = true;
    /*this.showUserModal = false;
    setTimeout(() => {
      this.showUserModal = true;
    }, 0);*/
  }
  closeModal() {
    this.showUserModal = false;
  }
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      this.convertImageToBase64([]); // call your existing method
      return;
    }

    this.convertImageToBase64(Array.from(input.files));
  }

  convertImageToBase64(files: File[]): void {
    if (!files || files.length === 0) {
      this.selectedFiles = [];
      this.imageBase64 = null;
      return;
    }

    const file = files[0];
    this.selectedFiles = files;

    if (!file.type.match(/image\/jpeg|image\/jpg/)) {
      console.error('Only JPEG or JPG images are allowed.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      this.imageBase64 = reader.result as string;
    };
    reader.onerror = (error) => {
      console.error('Error reading file:', error);
    };
    reader.readAsDataURL(file);
  }

  onImagesSelected(files: File[]): void {
    this.selectedFiles = files || [];
    this.toastr.info(`${this.selectedFiles.length} image file(s) selected`, 'Files');
  }
  onFileInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files: File[] = input.files ? Array.from(input.files) : [];
    this.convertImageToBase64(files);
  }

  submit() {
    if (this.frmGroup.invalid) {
      this.frmGroup.markAllAsTouched();

      // Recursive function to log errors
      const logErrors = (form: FormGroup, parentKey: string = '') => {
        Object.keys(form.controls).forEach(key => {
          const control = form.get(key);
          const path = parentKey ? `${parentKey}.${key}` : key;

          if (control instanceof FormGroup) {
            logErrors(control, path);
          } else if (control && control.invalid) {
            console.log(`Control "${path}" is invalid. Errors:`, control.errors);
          }
        });
      };

      logErrors(this.frmGroup);

      this.toastr.warning("Data Invalid/Missing.", "warning");
      return;
    }

    if(this.ipAddressList){
     this.concatIpList = this.ipAddressList
        .map(item => item.logInUserTerminalIp)
        .join('/');
    }


    console.log("imageBase64... ", this.imageBase64);
    const formValue = this.frmGroup.value.user;

    const request: UserProfileModel = {
      userId: formValue.userId,
      userName: formValue.userName,
      userDescription: formValue.userDescription,
      homeOfficeId: Number(formValue.homeOfficeId),
      mobileNumber: formValue.mobileNumber,
      userEmailId: formValue.userEmailId,
      loginId: formValue.loginId,
      passwordString: formValue.passwordString,
      lastPasswordChangedOn: null,
      forcePasswordChangedFlag: false,
      smsAdminRoleFlag: false,
      sysAdminRoleFlag: false,
      builtInUserFlag: false,
      officeManagerFlag: false,
      employeeId: Number(formValue.employeeId),
      userStatusActiveFlag: 1,
      userStatusChangedOn: null,
      userStatusChangeReason: '',
      userProfileClosedFlag: 0,
      userProfileClosedOn: null,
      userProfileChangeReason: '',
      failedLoginAttemptsNos: 0,
      activationLink: '',
      activationExpiredOn: null,
      activationLinkStatus: '',
      logInAppTerminalIp: formValue.logInAppTerminalIp,
      logInUserTerminalIp: this.concatIpList,
      appLogInTime: formValue.appLogInTime,
      appLogOutTime: formValue.appLogOutTime,
      sessionExpTime: Number(formValue.sessionExpTime),
      macAddress: formValue.macAddress,
      approveFlag: false,
      userImg: this.imageBase64,
      employeeCode: formValue.employeeCode,
      bankStaffFlag:formValue.bankStaffFlag ,
      mregUserGrantPackageRequestList: this.assignedUserPackage.map(pkg => ({
        userId: formValue.userId,
        packageId: pkg.packageId,
        fromDt: pkg.fromDt,
        toDt: pkg.toDt,
        approveFlag: 1,
      })),

    };
    console.log("saved data....", request);

    this.userProfileService.saveUserProfile(request).subscribe({
      next: (res) => {
        console.log('Transaction successful. User ID:', res.userId);
        this.toastr.success('Data saved successfully!', 'Save Successful');
      },
      error: (err) => {
        console.error('API Error:', err);
        this.toastr.error(err, 'Error');
      }
    });
  }

  reset() {
    this.frmGroup.reset();
    this.packageForm.reset();
    this.ipAddressList = [];
    this.showUserIpGrid = false;
    this.showUnassignedPackageGrid = false;
    // this.showUnassignedGrid = false;
    // this.showAssignedGrid = false;

    this.addPackageList = [];
    this.removePackageList= [];
    this.unAssignedUserPackage = [];
    this.assignedUserPackage = [];
    this.showAssignedPackageGrid = false;
    this.concatIpList =  null;
    this.imageBase64 = null;
  }

}
