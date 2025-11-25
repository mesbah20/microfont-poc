import { Component, Input, Output, EventEmitter, ChangeDetectorRef, Type } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextBox } from '../../../../shared/common-components/input-types/input-text-box/input-text-box';
import { GenericSwitch } from '../../../../shared/common-components/generic-component-type/generic-switch/generic-switch';
import { InputSelectOptionField } from '../../../../shared/common-components/input-types/input-select-option-field/input-select-option-field';
import { GenericModal } from '../../../../shared/common-components/generic-component-type/generic-modal/generic-modal';
import { GLTreeNode } from '../gl-tree-node-model';
import { GlChartService } from '../gl-chart-service';
import { ToastHelperService } from '../../../../shared/services/toast-helper.service';
import { GlChartModalComponent } from '../gl-chart-modal/gl-chart-modal-component/gl-chart-modal-component';
@Component({
  selector: 'app-account-node',
  standalone: true,
  imports: [CommonModule, MatMenuModule, MatIconModule, MatButtonModule, MatDialogModule, ReactiveFormsModule,
    InputTextBox,
    GenericSwitch,
    InputSelectOptionField,
    CommonModule,
    GenericModal,
    GlChartModalComponent],
  templateUrl: './gl-node-component.html',
  styleUrls: ['./gl-node-component.scss']
})
export class AccountNodeComponent {
  @Input() node!: GLTreeNode;
  @Input() level: number = 0;

  @Output() childAdded = new EventEmitter<GLTreeNode>();
  modalHostComponent: Type<any> = GlChartModalComponent;
  modalComponent?: Type<any>;
  modalComponentData?: any = null;
  constructor(private formBuilder: FormBuilder, private dialog: MatDialog, private cdr: ChangeDetectorRef, private glService: GlChartService, private toastr: ToastHelperService) {
  }
  newChild : GLTreeNode;
  frmGroup: FormGroup;
  showModal = false;
  editModal = false;
  addModal = false;
  modalMode: 'add' | 'edit' | 'view' = 'view';
  isEntityReadOnly = false;
	  isProductTypeReadOnly = false;
	  isGlSlReadOnly = false;
	  isGlAccNoReadOnly = false;
	  isAccTitleReadOnly = false;
	  isTotallingGlReadOnly = false;
	  isCurrencyReadOnly = false;
	  isAccountTypeReadOnly = false;
	  isTxnFlagReadOnly = false;
    isOffBsFlagEnabled = false;
	  isHOAccessEnabled = false;
	  isContraConEnabled = false;
    buttonText = "Save";
    isModalButtonHidden =false;
  currencyOptions = [
    { key: '0', value: 'BDT', rate: 1, taxRate: 0.05, country: 'BD' },
    { key: '1', value: 'USD', rate: 110, taxRate: 0.08, country: 'US' },
    { key: '2', value: 'British Pound', rate: 0.73, taxRate: 0.07, country: 'UK' },
    { key: '3', value: 'Japanese Yen', rate: 110, taxRate: 0.03, country: 'JP' },
    { key: '4', value: 'Canadian Dollar', rate: 1.25, taxRate: 0.06, country: 'CA' },
    { key: '5', value: 'Australian Dollar', rate: 1.35, taxRate: 0.04, country: 'AU' }
  ];


  surviceOptions = [
    { key: 'C', value: 'Conventional - Local' },
    { key: 'I', value: 'Islamic' },

  ];

  accTypeOptions = [
    { key: 'D', value: 'Debit' },
    { key: 'C', value: 'Credit' },

  ];


  glTypeOptions = [
    { key: 'A', value: 'Asset' },
    { key: 'L', value: 'Liability' },

  ];

  txnTypeOptions = [
    { key: '0', value: 'Transaction Not Allowed' },
    { key: '1', value: 'All Transactions Allowed' },

    { key: '2', value: 'Only System Transactions Allowed' },

    { key: '3', value: 'Only Manual Transactions Allowed' },

  ];
  ngOnInit() {
    this.ensureFormInitialized();
  }
  toggle() {
    this.node.expanded = !this.node.expanded;

  }


openModal(componentToLoad?: Type<any>, data?: any) {
  console.log('=== OPENING MODAL ===');
  console.log('Component to load:', componentToLoad);
  console.log('Component name:', componentToLoad?.name);

  // Reset modal state
  this.showModal = false;
  this.modalComponent = undefined;

  this.ensureFormInitialized();

  // Configure modal component and data
  this.modalComponent = componentToLoad || this.modalHostComponent;

  const currentFieldData = this.frmGroup?.getRawValue ? this.frmGroup.getRawValue() : {};
  const initialDataRaw = data?.initialData ?? (this.node ? { ...this.node, ...currentFieldData } : currentFieldData);
  const initialData = {
    ...initialDataRaw,
    CONTRA_CONTINGENT_FLAG: this.toBooleanFlag(initialDataRaw?.CONTRA_CONTINGENT_FLAG),
    HO_ACCESS_FLAG: this.toBooleanFlag(initialDataRaw?.HO_ACCESS_FLAG),
    OFF_BS_FLAG: this.toBooleanFlag(initialDataRaw?.OFF_BS_FLAG)
  };
  // Totalling account should always mirror the parent's GL_ACC_SL
  if (this.node?.GL_ACC_SL) {
    initialData.TOT_GL_ACC_SL = this.node.GL_ACC_SL;
  }
  this.modalMode = data?.mode ?? 'view';

  this.modalComponentData = {
    initialData,
    mode: this.modalMode,
    ...(data || {})
  };

  console.log('Setting modal component:', this.modalComponent?.name);
  console.log('Setting modal data:', this.modalComponentData);

  // Show modal and ensure change detection runs
  this.showModal = true;
  this.cdr.detectChanges();

  console.log('Modal should now be visible');
}

  closeModal() {
    this.showModal = false; // Reset first
    
  }
  onModalClose(isVisible: boolean) {
    console.log('Modal visibility changed:', isVisible);
    this.showModal = isVisible;

    if (!isVisible) {
      console.log('Modal closed');
    }
  }
  onModalResult(result: any) {
  console.log('Modal result received:', result);

  if (!result) return;

  // Normalize data object
  const resultData = typeof result === 'object' && !Array.isArray(result) ? result : {};

  switch (this.modalMode) {
    case 'add':
      this.handleAddResult(resultData);
      break;
    case 'edit':
      this.handleEditResult(resultData);
      break;
    case 'view':
    default:
      this.applyResultToForm(resultData);
      break;
  }

  this.showModal = false;
}
  private applyResultToForm(result: any) {
    const controlKeys = Object.keys(this.frmGroup.controls);
    const patch: any = {};
    controlKeys.forEach(key => {
      if (result[key] !== undefined) {
        patch[key] = result[key];
      }
    });
    if (Object.keys(patch).length) {
      console.log('Patching parent form with modal data:', patch);
      this.frmGroup.patchValue(patch);
    }
  }

  private handleAddResult(result: any) {
    const newChild = this.buildChildFromResult(result);
    const payload = this.buildPayload(newChild);

    console.log('Submitting GL account payload', payload);

    this.glService.createGLAccount(payload).subscribe({
      next: (res: any) => {
        console.log('createGLAccount response', res);
        if (res?.errorMsg == null) {
          newChild.GL_ACC_SL = res?.pglAccSl ?? newChild.GL_ACC_SL;
          this.toastr.success(`Data saved successfully. GL SL: ${newChild.GL_ACC_SL}`, 'GL Account');
          this.appendChildToTree(newChild);
        } else {
          this.toastr.error(`Failed to save GL Account: ${res.errorMsg}`, 'GL Account');
        }
      },
      error: (err) => { console.error(err); this.toastr.error('Error saving GL Account', 'GL Account'); }
    });
  }

  private handleEditResult(result: any) {
    // Always keep totalling account tied to parent
    if (this.node?.GL_ACC_SL) {
      result.TOT_GL_ACC_SL = this.node.GL_ACC_SL;
    }
    // Keep GL type in sync with parent
    if (this.node?.PRODUCT_TYPE) {
      result.PRODUCT_TYPE = this.node.PRODUCT_TYPE;
    }

    const payload = this.buildUpdatePayload(result);

    this.glService.updateGLAccount(payload).subscribe({
      next: (res: any) => {
        if (res?.errorMsg) {
          this.toastr.error(`Failed to update GL Account: ${res.errorMsg}`, 'GL Account');
          return;
        }
        this.updateNodeFromResult(result);
        this.toastr.success('GL Account updated successfully', 'GL Account');
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Error updating GL Account', 'GL Account');
      }
    });
  }


  private buildChildFromResult(result: any) {
    const parentTotalling = this.node?.GL_ACC_SL ?? '';
    return {
      ACCOUNT_NO: result.ACCOUNT_NO ?? '',
      ACCOUNT_TITLE: result.ACCOUNT_TITLE ?? '',
      ACC_DR_CR: result.ACC_DR_CR ?? '',
      ACC_LEVEL: (this.node.ACC_LEVEL ?? 0) + 1,
      CONTRA_CONTIGENT_FLAG: result.CONTRA_CONTIGENT_FLAG ?? false,
      CURRENCY_ID: result.CURRENCY_ID ?? '',
      ENTITY_ID: result.ENTITY_ID ?? '',
      HO_ACCESS_FLAG: result.HO_ACCESS_FLAG ?? false,
      OFF_BS_FLAG: result.OFF_BS_FLAG ?? false,
      // child GL type must mirror parent product type
      PRODUCT_TYPE: this.node?.PRODUCT_TYPE ?? result.PRODUCT_TYPE ?? '',
      TOT_GL_ACC_SL: parentTotalling,
      TXN_FLAG: result.TXN_FLAG ?? '0',
      children: [],
      expanded: false,
      hasChildren: false,
      GL_ACC_SL: result.GL_ACC_SL ?? ''
    };
  }

  private buildPayload(newChild: any) {
    return {
      precordUserId: 'anik2',
      paccountNo: newChild.ACCOUNT_NO,
      paccountTitle: newChild.ACCOUNT_TITLE,
      pproductId: '94',
      ptotGlAccSl: newChild.TOT_GL_ACC_SL,
      pproductType: this.node?.PRODUCT_TYPE ?? newChild.PRODUCT_TYPE,
      paccDrCr: newChild.ACC_DR_CR,
      paccLevel: newChild.ACC_LEVEL,
      pcurrencyId: newChild.CURRENCY_ID,
      ptxnFlag: '0',
      poffBsFlag: newChild.OFF_BS_FLAG ? '1' : '0',
      phoAccesFlag: newChild.HO_ACCESS_FLAG ? '1' : '0',
      pcontraContingentFlag: newChild.CONTRA_CONTINGENT_FLAG ? '1' : '0',
      pentityId: newChild.ENTITY_ID,
      pioTxnFlag: newChild.TXN_FLAG ? '1' : '0'
    };
  }

  private appendChildToTree(newChild: any) {
    if (!this.node.children) {
      this.node.children = [];
    }
    this.node.children.push(newChild);
    this.node.expanded = true;
    this.node.hasChildren = true;
    this.cdr.detectChanges();
    this.childAdded.emit(newChild);
  }

  private buildUpdatePayload(result: any) {
    const merged = { ...this.node, ...result };
    return {
      precordUserId: 'anik2',
      pglAccSl: this.node?.GL_ACC_SL,
      pentityId: this.node?.ENTITY_ID,
      paccountNo: merged.ACCOUNT_NO,
      paccountTitle: merged.ACCOUNT_TITLE,
      pproductId: '94',
      ptotGlAccSl: this.node?.TOT_GL_ACC_SL ?? this.node?.GL_ACC_SL,
      pproductType: this.node?.PRODUCT_TYPE ?? merged.PRODUCT_TYPE,
      paccDrCr: merged.ACC_DR_CR,
      paccLevel: this.node?.ACC_LEVEL,
      pcurrencyId: merged.CURRENCY_ID,
      ptxnFlag: merged.TXN_FLAG ?? merged.txnFlag ?? '0',
      poffBsFlag: merged.OFF_BS_FLAG ? '1' : '0',
      pofficeAccesFlag: (merged.OFFICE_ACCES_FLAG ?? merged.officeAccessFlag ?? 0).toString(),
      phoAccesFlag: merged.HO_ACCESS_FLAG ? '1' : '0',
      pcontraContingentFlag: merged.CONTRA_CONTINGENT_FLAG ? '1' : '0',
      pioTxnFlag: merged.TXN_FLAG ? '1' : '0'
    };
  }

  private updateNodeFromResult(result: any) {
    const updates = {
      ACCOUNT_NO: result.ACCOUNT_NO,
      ACCOUNT_TITLE: result.ACCOUNT_TITLE,
      ACC_DR_CR: result.ACC_DR_CR,
      CURRENCY_ID: result.CURRENCY_ID,
      TXN_FLAG: result.TXN_FLAG,
      txnFlag: typeof result.TXN_FLAG === 'string' ? parseInt(result.TXN_FLAG, 10) : result.TXN_FLAG,
      OFF_BS_FLAG: result.OFF_BS_FLAG,
      HO_ACCESS_FLAG: result.HO_ACCESS_FLAG,
      CONTRA_CONTINGENT_FLAG: result.CONTRA_CONTINGENT_FLAG,
      PRODUCT_TYPE: this.node?.PRODUCT_TYPE,
      TOT_GL_ACC_SL: this.node?.TOT_GL_ACC_SL ?? this.node?.GL_ACC_SL
    };

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        (this.node as any)[key] = value;
      }
    });
    this.cdr.detectChanges();
  }

  private toBooleanFlag(value: any): boolean {
    return value === true || value === 1 || value === '1' || value === 'true';
  }

  private ensureFormInitialized(force: boolean = false) {
    if (force || !this.frmGroup) {
      this.populateModalFields();
    }
  }

  private populateModalFields(){
    this.frmGroup = this.formBuilder.group({
      ENTITY_ID: [this.node?.ENTITY_ID ?? ''],
      PRODUCT_TYPE: [this.node?.PRODUCT_TYPE ?? ''],
      GL_ACC_SL: [this.node?.GL_ACC_SL ?? ''],
      ACCOUNT_NO: [this.node?.ACCOUNT_NO ?? '', [Validators.required, Validators.pattern(/^\d{11}$/)]],
      ACCOUNT_TITLE: [this.node?.ACCOUNT_TITLE ?? ''],
      TOT_GL_ACC_SL: [this.node?.TOT_GL_ACC_SL ?? this.node?.GL_ACC_SL ?? ''],
      CURRENCY_ID: [this.node?.CURRENCY_ID != null ? String(this.node.CURRENCY_ID) : ''],
      ACC_DR_CR: [this.node?.ACC_DR_CR ?? ''],
      TXN_FLAG: [this.node?.txnFlag != null ? String(this.node.txnFlag) : ''],
      CONTRA_CONTINGENT_FLAG: [this.toBooleanFlag(this.node?.CONTRA_CONTINGENT_FLAG)],
      HO_ACCESS_FLAG: [this.toBooleanFlag(this.node?.HO_ACCESS_FLAG)],
      OFF_BS_FLAG: [this.toBooleanFlag(this.node?.OFF_BS_FLAG)],
    });
  }

  cleanModalFields(){
    this.frmGroup = this.formBuilder.group({
      ENTITY_ID: [''],
      PRODUCT_TYPE: [this.node?.PRODUCT_TYPE ?? ''],
      GL_ACC_SL: [''],
      ACCOUNT_NO: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
      ACCOUNT_TITLE: [''],
      TOT_GL_ACC_SL: [this.node?.GL_ACC_SL ?? ''],
      CURRENCY_ID: [''],
      ACC_DR_CR: [''],
      CONTRA_CONTINGENT_FLAG: [false],
      HO_ACCESS_FLAG: [false],
      OFF_BS_FLAG: [false],
    });
  }

  addChild() {
    console.log("Add child clicked!");
    this.buttonText = "Save";
    
    this.cleanModalFields();
    this.isGlSlReadOnly = true;
    this.isTotallingGlReadOnly= true;
    this.openModal(undefined, { mode: 'add', initialData: this.frmGroup.getRawValue() });
      
  }
  viewDetails() {
    this.modalMode = 'view';
    this.buttonText = "Close";
    this.buttonText = "Close";
    this.ensureFormInitialized(true);
    const initialData = this.frmGroup?.getRawValue ? this.frmGroup.getRawValue() : {};
    this.openModal(undefined, { mode: 'view', initialData });

  }

  editDetails() {
    this.modalMode = 'edit';
    this.buttonText = "Update";
    this.buttonText = "Update";
    this.ensureFormInitialized(true);
    const initialData = this.frmGroup?.getRawValue ? this.frmGroup.getRawValue() : {};
    this.openModal(undefined, { mode: 'edit', initialData });
  }

}
