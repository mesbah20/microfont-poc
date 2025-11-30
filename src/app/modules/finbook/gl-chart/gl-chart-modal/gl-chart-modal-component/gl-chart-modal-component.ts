import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { buildFormGroup } from '../../../../../shared/models/form-utils';
import { GlChartInformation } from '../../gl-chart-information-model';
import { ExpansionPanelHeader } from "../../../../../shared/common-components/expansion-panel-header/expansion-panel-header";
import { CommonModule } from '@angular/common';
import { InputTextBox } from '../../../../../shared/common-components/input-types/input-text-box/input-text-box';
import { InputSelectOptionField } from "../../../../../shared/common-components/input-types/input-select-option-field/input-select-option-field";
import { GenericSwitch } from "../../../../../shared/common-components/generic-component-type/generic-switch/generic-switch";
import { ExchangeService } from '../../../exchange-service';

@Component({
  selector: 'app-gl-chart-modal-component',
 standalone: true,
  imports: [
    CommonModule,
    InputTextBox,
    ReactiveFormsModule,
    ExpansionPanelHeader,
    InputSelectOptionField,
    GenericSwitch
],
  templateUrl: './gl-chart-modal-component.html',
  styleUrl: './gl-chart-modal-component.scss'
})
export class GlChartModalComponent implements OnChanges {
  frmGroup: FormGroup;
  public title = 'General Ledger Information'; 
  businessHeaderPanel: WritableSignal<boolean> = signal(true);
  isReadOnly = false;
  @Input() mode: 'add' | 'edit' | 'view' = 'view';

  
   @Output() modalResult = new EventEmitter<any>();
   
   @Input() modalParent?: { close(result?: any): void; closeModal(): void };
   
   @Input() initialData?: any;

     constructor( private formBuilder: FormBuilder, private exchangeService : ExchangeService) {
  }
  //  serviceOptions = [
  //   { key: 'C', value: 'Conventional - Local' },
  //   { key: 'I', value: 'Islamic' },

  // ];

  serviceOptions: { key: number; value: string }[] = [];

   glTypeOptions = [
    { key: 'A', value: 'Asset' },
    { key: 'L', value: 'Liability' },

  ];
  
  accTypeOptions = [
    { key: 'D', value: 'Debit' },
    { key: 'C', value: 'Credit' },

  ];
    txnTypeOptions = [
    { key: '0', value: 'Transaction Not Allowed' },
    { key: '1', value: 'All Transactions Allowed' },

    { key: '2', value: 'Only System Transactions Allowed' },

    { key: '3', value: 'Only Manual Transactions Allowed' },

  ];
  //   currencyOptions = [
  //   { key: '0', value: 'BDT', rate: 1, taxRate: 0.05, country: 'BD' },
  //   { key: '1', value: 'USD', rate: 110, taxRate: 0.08, country: 'US' },
  //   { key: '2', value: 'British Pound', rate: 0.73, taxRate: 0.07, country: 'UK' },
  //   { key: '3', value: 'Japanese Yen', rate: 110, taxRate: 0.03, country: 'JP' },
  //   { key: '4', value: 'Canadian Dollar', rate: 1.25, taxRate: 0.06, country: 'CA' },
  //   { key: '5', value: 'Australian Dollar', rate: 1.35, taxRate: 0.04, country: 'AU' }
  // ];

  currencyOptions: { key: number; value: string }[] = [];
  ngOnInit() {
    const formObject = new GlChartInformation();
    this.getEntityTypeList();
    this.getCurrencyList();
      this.frmGroup = buildFormGroup(this.formBuilder, formObject);

      // Default switches to false so UI shows unchecked until data is applied
      this.frmGroup.patchValue({
        CONTRA_CONTINGENT_FLAG: false,
        HO_ACCESS_FLAG: false,
        OFF_BS_FLAG: false
      }, { emitEvent: false });

      // Account No. must be exactly 11 digits
      const accNoCtrl = this.frmGroup.get('ACCOUNT_NO');
      if (accNoCtrl) {
        accNoCtrl.addValidators([Validators.required, Validators.pattern(/^\d{11}$/)]);
        accNoCtrl.updateValueAndValidity({ emitEvent: false });
      }

      this.applyInitialData(this.initialData);
      this.applyMode(this.mode);

  }

  getEntityTypeList() {
    const payload = {};
    this.exchangeService.getEntityTypeList(payload).subscribe({
      next: (res: any) => {
        console.log('res', res);
        this.serviceOptions = res.map((item: { ENTITY_TYPE_ID: any; ENTITY_TYPE_NM: any; }) => ({
          key: item.ENTITY_TYPE_ID,
          value: item.ENTITY_TYPE_NM
        }));
      },
      error: (err) => { console.error(err); alert('Error Fetching Entity Type'); }
    });
  }

  getCurrencyList() {
    const payload = {};
    this.exchangeService.getCurrencyList(payload).subscribe({
      next: (res: any) => {
        console.log('res', res);
        this.currencyOptions = res.map((item: { CURRENCY_ID: any; CURRENCY_SH_NM: any; }) => ({
          key: item.CURRENCY_ID.toString(),
          value: item.CURRENCY_SH_NM
        }));
      },
      error: (err) => { console.error(err); alert('Error Fetching Entity Type'); }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.frmGroup) {
      return;
    }

    if (changes['initialData']) {
      this.applyInitialData(changes['initialData'].currentValue);
    }

    if (changes['mode']) {
      this.applyMode(changes['mode'].currentValue);
    }
  }

  private applyInitialData(data: any) {
    if (!data || !this.frmGroup) {
      return;
    }

    try {
      const patch: any = {};
      const booleanKeys = ['CONTRA_CONTINGENT_FLAG', 'HO_ACCESS_FLAG', 'OFF_BS_FLAG'];

      Object.keys(this.frmGroup.controls).forEach(key => {
        if (data[key] !== undefined) {
          const value = data[key];
          patch[key] = booleanKeys.includes(key)
            ? this.toBooleanFlag(value)
            : value;
        }
      });
      if (Object.keys(patch).length) {
        this.frmGroup.patchValue(patch, { emitEvent: false });
      }

      // Ensure boolean controls are coerced to actual booleans after patch
      booleanKeys.forEach(key => {
        const ctrl = this.frmGroup.get(key);
        if (ctrl) {
          ctrl.setValue(this.toBooleanFlag(ctrl.value), { emitEvent: false });
        }
      });
    } catch (e) {
      console.warn('Failed to apply initialData to modal form', e);
    }
  }

  private applyMode(mode: 'add' | 'edit' | 'view') {
    this.isReadOnly = mode === 'view';

    if (!this.frmGroup) {
      return;
    }

    if (this.isReadOnly) {
      this.frmGroup.disable({ emitEvent: false });
    } else {
      this.frmGroup.enable({ emitEvent: false });
    }
  }

  // Expose result for generic modal OK button
  getModalResult() {
    return this.frmGroup?.getRawValue ? this.frmGroup.getRawValue() : {};
  }

  private toBooleanFlag(val: any): boolean {
    return val === true || val === 1 || val === '1' || val === 'true';
  }
}
