import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { DataGridComponent } from '../../../../shared/components/data-grid';
import { DataSelectionModal } from '../../../../shared/components/data-selection-modal/data-selection-modal';
import { ExpansionPanelHeader } from '../../../../shared/components/expansion-panel-header/expansion-panel-header';
import { ExpansionSubPanelHeader } from '../../../../shared/components/expansion-sub-panel-header/expansion-sub-panel-header';
import { AmountInput } from '../../../../shared/components/input-types/amount-input/amount-input';
import { AmountToWordInput } from '../../../../shared/components/input-types/amount-to-word-input/amount-to-word-input';
import { Button } from '../../../../shared/components/input-types/button/button';
import { DateInput } from '../../../../shared/components/input-types/date-input/date-input';
import { FileComponent } from '../../../../shared/components/input-types/file-input/file-input';
import { IdBoxComponent } from '../../../../shared/components/input-types/id-box/id-box';
import { NumberInput } from '../../../../shared/components/input-types/number-input/number-input';
import { OfficeBoxComponent } from '../../../../shared/components/input-types/office-box/office-box';
import { SelectOptionField } from '../../../../shared/components/input-types/select-option-field/select-option-field';
import { Switch } from '../../../../shared/components/input-types/switch/switch';
import { TextArea } from '../../../../shared/components/input-types/text-area/text-area';
import { TextBaseInput } from '../../../../shared/components/input-types/text-base-input/text-base-input';
import { LdsModalComponent } from '../../../../shared/components/lds-modal/lds-modal';
import { LdsStepperComponent } from '../../../../shared/components/lds-stepper/lds-stepper';
import { MultiSelectOptionField } from '../../../../shared/components/multi-select-option-field/multi-select-option-field';
import { ToastHelperService } from '../../../../shared/services/toast-helper.service';
import { VehicleInfoService } from '../../service/vehicle-info.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CodeFileService } from '../../../../shared/services/code-file.service';
import { catchError, forkJoin, map, Observable, of } from 'rxjs';
import { RouteInfoService } from '../../service/route-info.service';
import { CodeFileLevelConstant } from '../../../../shared/constant/code-file-level.constant';
import { CodeFileTypeConstant } from '../../../../shared/constant/code-file-type.constant';
import { SelectOptionsModel } from '../../../../shared/models/select-options-model';

@Component({
  selector: 'app-vehicle-info',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TextBaseInput,
    IdBoxComponent,
    AmountInput,
    Switch,
    Button,
    TextArea,
    AmountToWordInput,
    SelectOptionField,
    DateInput,
    MultiSelectOptionField,
    LdsStepperComponent,
    FileComponent,
    OfficeBoxComponent,
    LdsModalComponent,
    NumberInput,
    DataGridComponent,
    ExpansionPanelHeader,
    ExpansionSubPanelHeader,
    DataSelectionModal,
  ],
  templateUrl: './vehicle-info.html',
  styleUrl: './vehicle-info.scss',
})
export class VehicleInfo {

  frmGroup!: FormGroup;

  // for expansion panels
  isPanelOpen = signal(true);
  isSubPanelOpen = signal(true);

  // dropdowns
  vehicleTypeOptions: SelectOptionsModel[] = [];
  overallConditionOptions: SelectOptionsModel[] = [];
  usageTypeOptions: SelectOptionsModel[] = [];
  purchaseTypeOptions: SelectOptionsModel[] = [];

  // state
  isUpdate = false;
  buttonName = 'save';
  model: any = {};

  constructor(
    private fb: FormBuilder,
    private vehicleInfoService: VehicleInfoService,
    private routeService: RouteInfoService,
    private codeFileService: CodeFileService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private toast: ToastHelperService
  ) {
    this.initializeForm();
    this.loadDropdownData();
  }

  /** ============ FORM INITIALIZATION ============ */
  private initializeForm(): void {
    this.frmGroup = this.fb.group(
      {
        id: [null],
        uuid: [null],
        vehicleType: ['', Validators.required],
        vehicleName: ['', [Validators.required, Validators.maxLength(100)]],
        noOfSeats: [null, [Validators.required, Validators.min(1), Validators.max(99999)]],
        overallCondition: ['', Validators.required],
        registrationNumber: ['', {
          validators: [Validators.required, Validators.maxLength(40)],
          asyncValidators: [this.uniqueValidator('registrationNumber')],
          updateOn: 'blur',
        }],
        chassisNumber: ['', {
          validators: [Validators.required, Validators.maxLength(40)],
          asyncValidators: [this.uniqueValidator('chassisNumber')],
          updateOn: 'blur',
        }],
        engineNumber: ['', {
          validators: [Validators.required, Validators.maxLength(40)],
          asyncValidators: [this.uniqueValidator('engineNumber')],
          updateOn: 'blur',
        }],
        vehicleReceiveDate: ['', Validators.required],
        usageType: ['', Validators.required],
        purchaseType: ['', Validators.required],
        tyreSize: ['', Validators.max(99999)],
        tyreType: ['', Validators.maxLength(50)],
        vehicleModel: ['', Validators.maxLength(100)],
        purchasePrice: ['', [Validators.required, Validators.min(0.01), Validators.pattern(/^\d{1,12}(\.\d{1,2})?$/)]],
        purchaseDate: ['', Validators.required],
        maxPassengerCapacity: ['', [Validators.min(1), Validators.max(99999)]],
        vehicleColor: ['', Validators.maxLength(30)],
        engineCC: ['', [Validators.min(1), Validators.max(99999)]],
        mileage: ['', [Validators.min(1), Validators.max(99999)]],
        cngCapacity: ['', [Validators.min(1), Validators.max(99999)]],
        fuelCapacity: ['', [Validators.min(0.01), Validators.max(99999)]],
        fiscalYear: ['', [Validators.maxLength(10), this.fiscalYearValidator()]],
        supplierName: ['', [Validators.required, Validators.maxLength(100)]],
        insuranceNo: ['', {
          validators: [Validators.required, Validators.maxLength(40)],
          asyncValidators: [this.uniqueInsuranceValidator()],
          updateOn: 'blur',
        }],
        insuranceCompany: ['', [Validators.required, Validators.maxLength(100)]],
        taxTokenDate: ['', Validators.required],
        taxTokenExpiryDate: ['', Validators.required],
        fitnessDate: ['', Validators.required],
        fitnessExpiryDate: ['', Validators.required],
        insuranceIssueDate: [''],
        insuranceExpiryDate: [''],
      },
      {
        validators: [
          this.dateRangeValidator('taxTokenDate', 'taxTokenExpiryDate', 'taxTokenExpiryBeforeStart'),
          this.dateRangeValidator('fitnessDate', 'fitnessExpiryDate', 'fitnessExpiryBeforeStart'),
          this.insuranceDatesValidator(),
          this.newVehicleDatesValidator(),
          this.vehicleReceiveDateValidator(),
        ],
      }
    );
  }

  /** ============ LOAD DROPDOWN DATA ============ */
  private loadDropdownData(): void {
    const vehicleTypes$ = this.codeFileService.groupFilesByType(CodeFileLevelConstant.VEHICLE_TYPE).pipe(
      catchError(() => of({ payload: { [CodeFileLevelConstant.VEHICLE_TYPE]: [] } }))
    );
    const overallCondition$ = this.codeFileService.groupFilesByType(CodeFileTypeConstant.VEHICLE_OVERALL_CONDITION).pipe(
      catchError(() => of({ payload: { [CodeFileLevelConstant.VEHICLE_OVERALL_CONDITION]: [] } }))
    );
    const purchaseType$ = this.codeFileService.groupFilesByType(CodeFileTypeConstant.VEHICLE_PURCHASE_TYPE).pipe(
      catchError(() => of({ payload: { [CodeFileLevelConstant.VEHICLE_PURCHASE_TYPE]: [] } }))
    );
    const usageType$ = this.codeFileService.groupFilesByType(CodeFileTypeConstant.VEHICLE_USAGE_TYPE).pipe(
      catchError(() => of({ payload: { [CodeFileLevelConstant.VEHICLE_USAGE_TYPE]: [] } }))
    );

    forkJoin({
      vehicleTypes: vehicleTypes$,
      overallCondition: overallCondition$,
      purchaseType: purchaseType$,
      usageType: usageType$,
    }).subscribe({
      next: (res: any) => {
        this.vehicleTypeOptions = this.toSelectOptions(res.vehicleTypes?.payload?.[CodeFileLevelConstant.VEHICLE_TYPE]);
        this.overallConditionOptions = this.toSelectOptions(res.overallCondition?.payload?.[CodeFileLevelConstant.VEHICLE_OVERALL_CONDITION]);
        this.purchaseTypeOptions = this.toSelectOptions(res.purchaseType?.payload?.[CodeFileLevelConstant.VEHICLE_PURCHASE_TYPE]);
        this.usageTypeOptions = this.toSelectOptions(res.usageType?.payload?.[CodeFileLevelConstant.VEHICLE_USAGE_TYPE]);
        this.checkUpdateMode();
      },
      error: () => this.checkUpdateMode(),
    });
  }

  private checkUpdateMode(): void {
    this.activatedRoute.queryParams.subscribe(() => {
      if (history.state?.data) {
        this.isUpdate = true;
        this.model = history.state.data;
        this.setForm();
        this.buttonName = 'update';
      }
    });
  }

  /** ============ VALIDATORS ============ */
  private uniqueValidator(field: string) {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value || (this.isUpdate && control.value === this.model[field])) return of(null);
      return this.vehicleInfoService.checkUnique(field, control.value).pipe(
        map(res => (res.payload.isUnique ? null : { duplicateCheck: true })),
        catchError(() => of(null))
      );
    };
  }

  private uniqueInsuranceValidator() {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value || (this.isUpdate && control.value === this.model.insuranceNo)) return of(null);
      return this.vehicleInfoService.checkUnique('insuranceNo', control.value).pipe(
        map(res => (res.payload.isUnique ? null : { duplicateCheck: true })),
        catchError(() => of(null))
      );
    };
  }

  private dateRangeValidator(start: string, end: string, key: string) {
    return (form: FormGroup): ValidationErrors | null => {
      const s = form.get(start)?.value;
      const e = form.get(end)?.value;
      if (!s || !e) return null;
      if (new Date(e) <= new Date(s)) {
        form.get(end)?.setErrors({ [key]: true });
        return { [key]: true };
      }
      return null;
    };
  }

  private insuranceDatesValidator() {
    return (form: FormGroup): ValidationErrors | null => {
      const issue = form.get('insuranceIssueDate')?.value;
      const expiry = form.get('insuranceExpiryDate')?.value;
      if (issue && !expiry) {
        form.get('insuranceExpiryDate')?.setErrors({ required: true });
        return { insuranceDatesIncomplete: true };
      }
      if (!issue && expiry) {
        form.get('insuranceIssueDate')?.setErrors({ required: true });
        return { insuranceDatesIncomplete: true };
      }
      if (issue && expiry && new Date(expiry) <= new Date(issue)) {
        form.get('insuranceExpiryDate')?.setErrors({ dateOrder: true });
        return { insuranceDateOrderInvalid: true };
      }
      return null;
    };
  }

  private vehicleReceiveDateValidator() {
    return (form: FormGroup): ValidationErrors | null => {
      const p = form.get('purchaseDate')?.value;
      const r = form.get('vehicleReceiveDate')?.value;
      if (!p || !r) return null;
      if (new Date(r) < new Date(p)) {
        form.get('vehicleReceiveDate')?.setErrors({ receiveBeforePurchase: true });
        return { receiveBeforePurchase: true };
      }
      return null;
    };
  }

  private newVehicleDatesValidator() {
    return (form: FormGroup): ValidationErrors | null => {
      const type = form.get('purchaseType')?.value;
      const date = form.get('purchaseDate')?.value;
      const typeId = type?.id ?? type;
      if (typeId !== 251 || !date) return null;
      const p = new Date(date);
      const fields = ['taxTokenDate', 'fitnessDate', 'insuranceIssueDate'];
      let invalid = false;
      fields.forEach(f => {
        const val = form.get(f)?.value;
        if (val && new Date(val) < p) {
          form.get(f)?.setErrors({ beforePurchase: true });
          invalid = true;
        }
      });
      return invalid ? { newVehicleDatesInvalid: true } : null;
    };
  }

  private fiscalYearValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      const val = control.value;
      if (!val) return null;
      if (!/^[\d-]+$/.test(val)) return { invalidFiscalYear: true };
      return null;
    };
  }

  /** ============ ACTIONS ============ */
  onSubmit(): void {
    if (!this.frmGroup.valid) {
      this.markFormTouched();
      this.toast.error('Please fix validation errors in the form.', 'Validation Error');
      return;
    }
    this.isUpdate ? this.update() : this.save();
  }

  private generateModel(): void {
    this.model = {
      ...this.frmGroup.value,
      vehicleType: this.frmGroup.value.vehicleType,
      overallCondition: this.frmGroup.value.overallCondition,
      usageType: this.frmGroup.value.usageType,
      purchaseType: this.frmGroup.value.purchaseType,
    };

    if (!this.isUpdate) {
      this.model.details = [
        {
          taxTokenDate: this.frmGroup.value.taxTokenDate,
          taxTokenExpiryDate: this.frmGroup.value.taxTokenExpiryDate,
          fitnessDate: this.frmGroup.value.fitnessDate,
          fitnessExpiryDate: this.frmGroup.value.fitnessExpiryDate,
          insuranceIssueDate: this.frmGroup.value.insuranceIssueDate,
          insuranceExpiryDate: this.frmGroup.value.insuranceExpiryDate,
        },
      ];
    }
  }

  save(): void {
    this.generateModel();
    this.vehicleInfoService.create(this.model).subscribe({
      next: (res) => {
        if (res.status) {
          this.toast.success('Vehicle information saved successfully.', 'Success');
          this.onReset();
        } else {
          this.toast.error(res.message || 'Save failed.', 'Error');
        }
      },
      error: () => this.toast.error('Save failed due to validation errors.', 'Error'),
    });
  }

  update(): void {
    this.generateModel();
    this.vehicleInfoService.update(this.model).subscribe({
      next: (res) => {
        if (res.status) {
          this.toast.success('Vehicle information updated successfully.', 'Success');
          this.onReset();
        } else {
          this.toast.error(res.message || 'Update failed.', 'Error');
        }
      },
      error: () => this.toast.error('Update failed due to validation errors.', 'Error'),
    });
  }

  onReset(): void {
    this.frmGroup.reset();
    this.isUpdate = false;
    this.buttonName = 'save';
    this.toast.info('Form cleared successfully.', 'Reset');
  }

  onView(): void {
    this.router.navigate(['/vehicle/list']);
  }

  onPurchaseDateChange(): void {
    this.frmGroup.get('vehicleReceiveDate')?.updateValueAndValidity();
  }

  private setForm(): void {
    const m = this.model;
    const patch = {
      ...m,
      vehicleType: this.normalizeSelectValue(m.vehicleType),
      overallCondition: this.normalizeSelectValue(m.overallCondition),
      usageType: this.normalizeSelectValue(m.usageType),
      purchaseType: this.normalizeSelectValue(m.purchaseType),
    };
    this.frmGroup.patchValue(patch);
  }

  private markFormTouched(): void {
    Object.values(this.frmGroup.controls).forEach(c => c.markAsTouched());
  }

  private toSelectOptions(items: any[] | undefined): SelectOptionsModel[] {
    if (!Array.isArray(items)) return [];
    return items.map(item => ({
      key: item?.id ?? item?.code ?? item,
      value: item?.name ?? item?.shortName ?? `${item?.id ?? item}`,
    }));
  }

  private normalizeSelectValue(value: any): any {
    if (value && typeof value === 'object') {
      return value.id ?? value.key ?? value.value ?? '';
    }
    return value ?? '';
  }
}
