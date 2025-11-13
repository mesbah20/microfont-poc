import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
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

  // ✅ Dummy dropdown data (now in correct Option structure)
  vehicleTypeOptions = [
    { key: 1, value: 'Car' },
    { key: 2, value: 'Bus' },
    { key: 3, value: 'Truck' },
  ];

  overallConditionOptions = [
    { key: 1, value: 'Excellent' },
    { key: 2, value: 'Good' },
    { key: 3, value: 'Average' },
  ];

  usageTypeOptions = [
    { key: 1, value: 'Personal' },
    { key: 2, value: 'Commercial' },
  ];

  purchaseTypeOptions = [
    { key: 1, value: 'New' },
    { key: 2, value: 'Used' },
  ];

  // ✅ Signals for expansion panels
  isPanelOpen = signal(true);
  isSubPanelOpen = signal(true);

  constructor(private fb: FormBuilder) {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.frmGroup = this.fb.group({
      vehicleType: [''],
      vehicleName: [''],
      vehicleModel: [''],
      overallCondition: [''],
      usageType: [''],
      noOfSeats: [''],
      maxPassengerCapacity: [''],
      registrationNumber: [''],
      chassisNumber: [''],
      engineNumber: [''],
      engineCC: [''],
      mileage: [''],
      vehicleColor: [''],
      purchaseType: [''],
      purchaseDate: [''],
      purchasePrice: [''],
      vehicleReceiveDate: [''],
      supplierName: [''],
      insuranceNo: [''],
      insuranceCompany: [''],
      insuranceIssueDate: [''],
      insuranceExpiryDate: [''],
      taxTokenDate: [''],
      taxTokenExpiryDate: [''],
      fitnessDate: [''],
      fitnessExpiryDate: [''],
      fiscalYear: [''],
      tyreSize: [''],
      tyreType: [''],
      cngCapacity: [''],
      fuelCapacity: [''],
    });
  }

  // ✅ Dummy button handlers (for UI only)
  onSubmit(): void {
    console.log('Form submitted:', this.frmGroup.value);
    alert('Submit clicked (UI only)');
  }

  onReset(): void {
    this.frmGroup.reset();
  }

  onView(): void {
    alert('Back to list clicked');
  }

  onPurchaseDateChange(): void {
    console.log('Purchase date changed');
  }
}
