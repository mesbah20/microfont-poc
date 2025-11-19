import { Component, effect, inject, Inject, Input, OnInit, signal, SimpleChanges, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { GlService } from '../../services/gl-transaction-service';
import { ExpansionPanelHeader } from '../../shared/components/expansion-panel-header/expansion-panel-header';

import { IdBoxComponent } from '../../shared/components/input-types/id-box/id-box';
import { TextBaseInput } from '../../shared/components/input-types/text-base-input/text-base-input';
import { DateInput } from '../../shared/components/input-types/date-input/date-input';
import { SelectOptionField } from '../../shared/components/input-types/select-option-field/select-option-field';
import { UtilService } from '../../services/util-service';
import { firstValueFrom } from 'rxjs';
import { GetGLAccountChartInfoRequest } from '../../models/GlTransactionModel';
import { GLStatusRequest } from '../../models/GLAccount';
import { CommonModule, formatDate } from '@angular/common';
import { BUTTON_VISIBILITY, ONCLICK_RESET, ONCLICK_SAVE, ONCLICK_VIEW } from '../../shared/constant/button-signals.constant';
import { GLSubsidiaryModel } from '../../models/GLSubsidiary';
import { GlSubsidiaryService } from '../../services/gl-subsidiary-service';
import { ExchangeService } from '../../services/exchange-service';
import { GlSubPopup } from "./popup/gl-sub-popup/gl-sub-popup";
import { ActivatedRoute } from '@angular/router';
import { buildFormGroup } from '../../models/form-utils';
import { FormControlHighlightDirective } from '../../shared/directives/form-control-highlight.directive';
import { HighlightService } from '../../shared/services/highlight.service';
import { UserService } from '../../core/user/user.service';
import { User } from '../../core/user/user.types';


@Component({
  selector: 'app-gl-subsidiary',
  standalone: true,
  imports: [ExpansionPanelHeader, TextBaseInput, IdBoxComponent, GlSubPopup, DateInput,
    ReactiveFormsModule, SelectOptionField, CommonModule],
  templateUrl: './gl-subsidiary.html',
  styleUrl: './gl-subsidiary.scss'
})
export class GlSubsidiary implements OnInit {



  //Declarations 
  @Input() viewObject: any | null;
  @Input() isViewDetails: boolean | false;
  @Input() highlightMap: Record<string, boolean> | null = null;
  @Input() isApprovalView: boolean = false;
 
  private userService = inject(UserService);
  
  frmGroup: FormGroup;
  businessHeaderPanel: WritableSignal<boolean> = signal(true);
  toastr = inject(ToastrService);
  showModal = false;
  isOfficeDisabled = true;
  isDepartmentDisabled = true;
  isEmployeeDisabled = true;
  isReferenceNoDisabled = true;
  headOfficeId = 1;
  selectedBranchNm: string | null;
  selectedDeptNm: string | null;
  onClickSave = ONCLICK_SAVE;
  onClickRefresh = ONCLICK_RESET;
  onClickView = ONCLICK_VIEW;
  isEditMode: boolean = false;
  currentClone: string = '';
  currentRegId: string = '';
  officeOptions: { key: number; value: string }[] = [];

  officeBankOptions: { key: number; value: string }[] = [];
  officeDeptOptions: { key: number; value: string }[] = [];

  isOfficeIdReadOnly: boolean = false;
  isExpRegReadOnly: boolean = false;

  isRightSideEnabled: boolean = false;
  functionId: number;
  userId : string;
  entityTypeId : string;
  //End  Declarations


  //Page Load
  constructor(private fb: FormBuilder,
    private glService: GlService, private utilService: UtilService,
    private glSubsidiaryService: GlSubsidiaryService,
    private exchangeService: ExchangeService,
    @Inject(HighlightService) private hl: HighlightService,
    private route: ActivatedRoute) {

    const formObject = new GLSubsidiaryModel();
    this.frmGroup = buildFormGroup(this.fb, formObject);
    this.frmGroup.get("entryDt")?.setValue(new Date());
    BUTTON_VISIBILITY.set({
      save: true,
      update: false,
      view: true,
      delete: false,
      exit: false,
      reset: true,
    });

    effect(() => {
      if (this.onClickSave()) {
        this.onSubsidiarySubmit();
        ONCLICK_SAVE.set(false);
      } if (this.onClickRefresh()) {
        this.onSubsidiaryReset();
        ONCLICK_RESET.set(false);
      }
      if (this.onClickView()) {
        this.openModal();
        ONCLICK_VIEW.set(false);
      }
    });
  }

  ngOnInit(): void {
    this.onSubsidiaryReset();
    this.loadDataForOffice();
    this.loadDataForDept();
    if (this.isViewDetails) {
      BUTTON_VISIBILITY.set({
        save: false,
        update: false,
        view: true,
        delete: false,
        exit: false,
        reset: false,
      });
      this.patchForm(this.viewObject);
      console.log("this.isApprovalView in on changes ", this.isApprovalView);

    }
    this.route.queryParams.subscribe(params => {
      this.functionId = Number(params["functionId"]);
    });
    console.log("FunctionId = ", this.functionId);

    this.userService.user$.subscribe((user: User) => {
    
        this.userId = user.username;
    
 });
  }

  // End Page Load

  // DDL Bindings 
  officeRegOptions = [
    { key: 0, value: 'Other' },
    { key: 1, value: 'Office' },
    { key: 2, value: 'Department' },
    { key: 3, value: 'Employee' }
  ];
  loadDataForOffice() {
    this.exchangeService.getOwnOfficeList("1").subscribe({
      next: (res: any) => {
        this.officeOptions = res.map((item: { OFFICE_ID: any; OFFICE_NAME: any; }) => ({
          key: item.OFFICE_ID,
          value: item.OFFICE_NAME
        }));
        this.officeBankOptions = res.map((item: { OFFICE_ID: any; OFFICE_NAME: any; }) => ({
          key: item.OFFICE_ID,
          value: item.OFFICE_NAME
        }));
      },
      error: (err) => { console.error(err); alert('Error Fetching Data'); }
    });
  }
  loadDataForDept() {
    const request = {};
    this.exchangeService.getAllDepartment(request).subscribe({
      next: (res: any) => {
        this.officeDeptOptions = res.map((item: { DEPT_SL: any; DEPT_NM: any; }) => ({
          key: item.DEPT_SL,
          value: item.DEPT_NM
        }));
      },
      error: (err) => { console.error(err); alert('Error Fetching Data'); }
    });
  }
  // End Bindings
  // Events 

  ngOnChanges(changes: SimpleChanges) {
    if (changes['highlightMap'] && this.highlightMap) {
      if (this.isApprovalView && Object.keys(this.highlightMap).length > 0) {
        this.hl.setMap({ ...this.highlightMap });
      } else if (this.isApprovalView) {
        this.hl.setMap({});
      }
    }
  }
  async onGLSerialChange() {
    const initFormValue = this.frmGroup.value;

    const paddedtxtGlKey = initFormValue.glAccSl && initFormValue.glAccSl !== ''
      ? this.utilService.padString(String(initFormValue.glAccSl), '0', 3, 8)
      : initFormValue.glAccSl;

    this.frmGroup.patchValue({
      glAccSl: paddedtxtGlKey
    });

    if (initFormValue.glAccSl && initFormValue.glAccSl !== '') {
      const isValid = this.isValidGlAccount();

      if (!isValid) return;
      const gl_ac_chart = await this.GetCorGLChartAccount();
      if (!gl_ac_chart || gl_ac_chart.length > 0) {
        const data = gl_ac_chart[0];
        if (data.glAccSubFlag === 0) {
          this.toastr.warning('GL Subsidiary Register is Not Allowed.');
          this.frmGroup.reset();
          return;
        }
        this.frmGroup.patchValue({
          glAccNo: data.accountNo ?? '',
          glAccName: data.accountTitle ?? '',
          glAccType: data.accDrCr === "D" ? "Debit" : "Credit",
          currencyCode: data.currencyShNm ?? ''
        });
      } else {
        this.toastr.warning('No account info found for given GL Serial.');
        this.frmGroup.reset();
        return;
      }

    }
  }

  onOfficeRegTypeChange(event: any) {
    const type = event?.value ?? event;
    const selectedKey = type.selectedKey;

    this.frmGroup.patchValue({
      glBankOffice: '',
      departmentId: '',
      employeeId: '',
      glAccSubNm: '',
      glSubRefNo: '',
    });

    this.isOfficeDisabled = true;
    this.isDepartmentDisabled = true;
    this.isEmployeeDisabled = true;

    // Remove all validators
    this.frmGroup.get('glBankOffice')?.clearValidators();
    this.frmGroup.get('departmentId')?.clearValidators();
    this.frmGroup.get('employeeId')?.clearValidators();

    switch (selectedKey) {
      case 1: // Office
        // Enable and make mandatory

        this.isOfficeDisabled = false;
        this.isReferenceNoDisabled = false;
        this.updateField('glBankOffice', true)

        // Disable Department & Employee
        this.isDepartmentDisabled = true;
        this.updateField('departmentId', false)

        this.isEmployeeDisabled = true;
        this.frmGroup.get('employeeId')?.clearValidators();
        this.frmGroup.get('employeeId')?.disable();
        break;

      case 2: // Department
        this.isOfficeDisabled = true;
        this.isReferenceNoDisabled = false;
        this.isDepartmentDisabled = false;
        this.isEmployeeDisabled = false;
        this.updateField('glBankOffice', true);
        this.updateField('departmentId', true);
        this.isEmployeeDisabled = true;
        break;

      case 3: // Employee
        this.isOfficeDisabled = true;
        this.isReferenceNoDisabled = false;
        this.isDepartmentDisabled = true;
        this.isEmployeeDisabled = false;
        this.updateField('glBankOffice', true)
        this.updateField('departmentId', true)
        break;

      default:
        const bankOfficeCtrl = this.frmGroup.get('glBankOffice');
        bankOfficeCtrl?.clearValidators();
        bankOfficeCtrl?.reset();
        bankOfficeCtrl?.disable();
        this.isOfficeDisabled = true;
        this.isReferenceNoDisabled = true;

        this.isDepartmentDisabled = true;
        this.isEmployeeDisabled = true;
        break;
    }

    // Apply updated validation rules
    this.frmGroup.get('glBankOffice')?.updateValueAndValidity();
    this.frmGroup.get('departmentId')?.updateValueAndValidity();
    this.frmGroup.get('employeeId')?.updateValueAndValidity();
  }

  openModal() {
    this.showModal = false;
    setTimeout(() => {
      this.showModal = true;
    }, 0);
  }
  onSubmit() { }

  onBranchChange(event: any) {
    const fullBranchName = event.selectedOption.value;
    if (fullBranchName.glAccSl != '') {
      this.onGLSerialChange();
    }

    this.loadEntityType(event.selectedOption.key);

  }

  onBankOfficeChange(event: any) {
    const fullBranchName = event.selectedOption.value;

    // Extract text
    const parts = fullBranchName.split('-');
    this.selectedBranchNm = parts.length > 1 ? parts[1].trim() : fullBranchName;
    if (this.frmGroup.value.expRegType == 1) {
      this.frmGroup.patchValue({
        glAccSubNm: this.selectedBranchNm
      });
    }

  }
  onDeptChange(event: any) {
    const deptNm = event.selectedOption.value;
    if (this.frmGroup.value.expRegType == 2 || this.frmGroup.value.expRegType == 3) {
      this.frmGroup.patchValue({
        glAccSubNm: deptNm + "(" + this.selectedBranchNm + ")"
      });
    }
  }

  async onAccountSelected(account: any) {

    // Parse the data string if needed
    let accountData = account?.data;
    if (typeof accountData === 'string') {
      try {
        accountData = JSON.parse(accountData);
      } catch (e) {
        console.error('Failed to parse account data', e);
        return;
      }
    }

    // Patch the form with the account values
    this.frmGroup.patchValue(accountData);

    // Manually trigger onGLSerialChange
    await this.onGLSerialChange();
    // Close the modal
    this.showModal = false;
  }


  onAccountNumberChange() { }

  onSubsidiarySubmit() {
    console.log("entry date  = ", this.frmGroup.get('entryDt'));
    let payload: any;
    if (this.isEditMode) {
      payload = this.createPayLoad(false, true);
    }
    else {
      payload = this.createPayLoad(true, false);
    }
    console.log(" Payload for Submit = ", payload);
    this.glSubsidiaryService.createGlSubsidiary(payload).subscribe({
      next: (res) => {
        console.log(" result after submit : ", res);
        if (res.errorMsg == null || res.errorMsg == '') {


          this.onOfficeRegTypeChange({ value: { selectedKey: '0' } });
          if (this.isEditMode) {
            this.toastr.success('Data Updated Successfully');

          }
          else {
            this.toastr.success('Subsidiary saved successfully with Reg Id : ' + res.regId + ' & Serial No : ' + res.glAccSubSl);

          }

          this.onSubsidiaryReset();

        } else {
          this.onSubsidiaryReset();

          this.onOfficeRegTypeChange({ value: { selectedKey: '0' } });
          this.toastr.error('Error Saving Data! Err: ' + res.errorMsg);

        }
        console.log(res);
        //  


        //this.fetchRestrictionInfo();
      },
      error: (err) => {
        console.error('Error saving subsidiary:', err);
        this.toastr.error('Failed to save subsidiary err: ' + err.message);
        this.onSubsidiaryReset();
      }
    });
  }


  onSubsidiaryReset() {
    this.isEditMode = false;
    const formObject = new GLSubsidiaryModel();
    this.frmGroup = buildFormGroup(this.fb, formObject);
    this.frmGroup.get("entryDt")?.setValue(new Date());

    this.onOfficeRegTypeChange({ value: { selectedKey: '0' } });
  }

  async onGlAccSubSlChanged() {
    const initFormValue = this.frmGroup.value;

    // Prepare request payload
    const req = {
      pofficeId: initFormValue.officeId,
      pglAccSl: initFormValue.glAccSl,
      pglAccSubSl: initFormValue.glAccSubSl,
      pqueueId: '' // or whatever your queue ID logic is
    };
    try {
      // Call service and wait for result
      const data: GLSubsidiaryModel[] = await this.glSubsidiaryService
        .getGLSubsidiaryAccountInfo(req)
        .toPromise();

      if (data && data.length > 0) {
        let parsedDate: Date;

        const record = data[0];
        console.log("Record Fetched from Sub Sl  = ", record);
        this.frmGroup.patchValue(record);
        this.isEditMode = true;
      }
      else {
        this.frmGroup.get('glAccSubSl')?.setValue('');
        this.toastr.warning('Invalid Input or Unapproved Data Found!');
      }

    } catch (err) {
      console.error('Failed to fetch GL Subsidiary info:', err);
    }
  }
  //End Events

  //User Generated Methods
  async isValidGlAccount(): Promise<boolean> {
    const req: GLStatusRequest = {
      paccountSl: this.frmGroup.get('glAccSl')?.value,
      pentityId: this.entityTypeId,
      pproductType: null
    };

    try {
      const result = await firstValueFrom(this.glSubsidiaryService.validateGlAccount(req));
      if (result === 1) {
        return true;
      } else {
        this.toastr.info("Not a valid GL number");
        return false;
      }
    } catch (err) {
      console.error('Error validating GL account:', err);
      this.toastr.error('Error occurred while validating GL account.');
      return false;
    }
  }

  async GetCorGLChartAccount(): Promise<any | null> {
    const initialFormValue = this.frmGroup.value;
    if (initialFormValue.glAccSl) {

      const request: GetGLAccountChartInfoRequest = {
        pnameValueList: "0",
        pentityId: this.entityTypeId,
        pglAccSl: initialFormValue.glAccSl,
        paccountNo: initialFormValue.glAccNo,
        pqueueId: ""
      };

      try {
        return await firstValueFrom(this.glService.getGLAccountChartInfo(request));
      } catch (err) {
        console.error("Error fetching GL account info:", err);
        this.toastr.error("Error fetching gl account")
      }
    }
  }

  updateField(controlName: string, isEnable: boolean) {
    this.frmGroup.get(controlName)?.setValidators([Validators.required]);
    isEnable ? this.frmGroup.get(controlName)?.enable() : this.frmGroup.get(controlName)?.disable();
  }

  makeDeptMandatoryWithValidation(): boolean {
    const branchId = this.frmGroup.get('officeId')?.value;

    if (branchId === this.headOfficeId) {
      this.isDepartmentDisabled = true;
      this.frmGroup.get('departmentId')?.setValidators([Validators.required]);
      this.frmGroup.get('departmentId')?.enable();
      return true;
    } else {
      this.isDepartmentDisabled = false;
      this.frmGroup.get('departmentId')?.clearValidators();
      this.frmGroup.get('departmentId')?.disable();
      return false;
    }
  }

  private parseDateString(dateStr: string): Date {
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day);
  }

  todayDateString(): string {
    const d = new Date();
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  }
  createPayLoad(isCreate: boolean, isUpdated: boolean) {
    const formValue = this.frmGroup.getRawValue();

    const payload: any = {
      ...formValue,

      // 🔹 Add system/session fields
      recordUserId: this.userId,
      entityId: this.entityTypeId,
      functionId: this.functionId,
      isCreated: isCreate,
      isEdited: isUpdated,
      isDeleted: false
    };
    return payload;
  }

  async patchForm(data: GLSubsidiaryModel) {
    this.loadDataForOffice();
    this.frmGroup.patchValue({ ...data });
    this.frmGroup.disable();
    this.isOfficeIdReadOnly = true;
    this.isExpRegReadOnly = true;
    this.isOfficeDisabled = true;
    await this.onGLSerialChange();
  }
 ngOnDestroy(): void {
    this.hl.setMap({});
  }
  loadEntityType(officeId : number){
    this.exchangeService.getEntityInfo(officeId).subscribe({
      next: (res: any) => {
        this.entityTypeId = res;
      },
      error: (err) => { console.error(err); alert('Error Fetching Data'); }
    });
  }
}
