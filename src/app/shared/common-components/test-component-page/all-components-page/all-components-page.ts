// Enhanced TypeScript Component with Relatable Fields
import { Component, effect, inject, OnInit, signal, TemplateRef, ViewChild, WritableSignal, Type } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextBox } from '../../input-types/input-text-box/input-text-box';
import { InputIdBox } from '../../input-types/input-id-box/input-id-box';
import { InputAmountInWord } from '../../input-types/input-amount-in-word/input-amount-in-word';
import { InputSelectOptionField } from '../../input-types/input-select-option-field/input-select-option-field';
import { InputFile } from '../../input-types/input-file/input-file';
import { InputOfficeBox } from '../../input-types/input-office-box/input-office-box';
import { TableRowDesigner } from '../../generic-component-type/generic-data-grid';
import { ExpansionPanelHeader } from '../../expansion-panel-header/expansion-panel-header';
import { ExpansionSubPanelHeader } from '../../expansion-sub-panel-header/expansion-sub-panel-header';
import { InputTextArea } from '../../input-types/input-text-area/input-text-area';
import { InputNumber } from '../../input-types/input-number/input-number';
import { DropdownOption, GenericDataGrid } from '../../generic-component-type/generic-data-grid/generic-data-grid';
import { GenericMultiInputSelectOption } from '../../generic-component-type/generic-multi-select-option/generic-multi-select-option';
import { BUTTON_VISIBILITY, ONCLICK_SAVE } from '../../../constant/button-signals.constant';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { InputDate } from '../../input-types/input-date/input-date';
import { OtherComponentsPage } from '../other-components-page/other-components-page';
import { CommonModule } from '@angular/common';
import {ToastHelperService} from '../../../services/toast-helper.service';
import { InputAmount } from '../../input-types/input-amount/input-amount';
import { Tooltip } from 'highcharts';
import { GenericButton } from '../../generic-component-type/generic-button/generic-button';
import { GenericSwitch } from '../../generic-component-type/generic-switch/generic-switch';
import { GenericModal } from '../../generic-component-type/generic-modal/generic-modal';
import { CommonQuillEditorComponent } from '../../common-quill-editor/common-quill-editor';

// Types for data selection modal
export interface AccountData {
  id: string;
  name: string;
  category: string;
  amount: number;
}

export interface DataSelectionConfig {
  pickTableDataSource: AccountData[];
  pickTablePair: Map<string, string>;
  apiSearchPlaceholder: string;
  findButtonText: string;
  loadingText: string;
  noDataMessage: string;
  loadingMessage: string;
}

@Component({
  selector: 'app-all-components-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputTextBox,
    InputIdBox,
    GenericSwitch,
    GenericButton,
    InputTextArea,
    InputAmountInWord,
    InputSelectOptionField,
    InputDate,
    CommonModule,
    GenericMultiInputSelectOption,
    InputFile,
    InputOfficeBox,
    GenericDataGrid,
    InputNumber,
    InputAmount,  
    GenericModal,
    CommonQuillEditorComponent,
    ExpansionPanelHeader,
    ExpansionSubPanelHeader,
  ],
  templateUrl: './all-components-page.html',
  styleUrls: ['./all-components-page.scss'],
})
export class AllComponentsPage implements OnInit {
  private toastCount = 0;      // Unique ID for CSS classes
  private startY = 50;         // Starting Y position
  private gapY = 70;
  frmGroup: FormGroup;
  toastr = inject(ToastHelperService);
  businessHeaderPanel: WritableSignal<boolean> = signal(true);
  subPanel1: WritableSignal<boolean> = signal(true);
  // Reference to this component's own class
  static instance: Type<AllComponentsPage> = AllComponentsPage;
  isDataSelectionModalOpen = signal(false);
  onClickSave = ONCLICK_SAVE;
  @ViewChild('transactionGrid') gridComponent!: GenericDataGrid;

  // Methods for modal events
  onModalClosed() {
    this.isDataSelectionModalOpen.set(false);
  }

onModalResult(result: any) {
  console.log('Modal result received:', result);

  if (!result) return;

  // If child sends { field, value }
  if (result.field) {
    this.frmGroup.get(result.field)?.setValue(result.value);
  } else if (typeof result === 'object' && !Array.isArray(result)) {
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
  } else {
    // Fallback: set a known control
    // this.frmGroup.get('textBox')?.setValue(result);
  }

  this.showModal = false;
}

  // openModal() {
  //   this.isDataSelectionModalOpen.set(true);
  // }

  // Relatable field signals
  selectedCurrency = signal<string>('USD');
  selectedCountry = signal<string>('');
  selectedProductCategory = signal<string>('');
  filteredSubCategories = signal<any[]>([]);
  calculatedTaxRate = signal<number>(0);
  isHighValueTransaction = signal<boolean>(false);
  relatedTransactions = signal<any[]>([]);
  showModal = false;
  isTRUE = false;
  modalComponent?: Type<any>;
  OtherComponentsPageComponent: Type<any> = OtherComponentsPage;
  modalComponentData?: any = null;
  selectedRowIds = signal<Set<string>>(new Set());

  // Data Selection Modal Configuration
  modalConfig: DataSelectionConfig = {
    pickTableDataSource: [
      { id: 'ACC001', name: 'Main Trading Account', category: 'Trading', amount: 50000.00 },
      { id: 'ACC002', name: 'Investment Portfolio', category: 'Investment', amount: 75000.00 },
      { id: 'ACC003', name: 'Operating Account', category: 'Business', amount: 25000.00 },
      { id: 'ACC004', name: 'Reserve Fund', category: 'Savings', amount: 100000.00 }
    ],
    pickTablePair: new Map<string, string>([
      ['id', 'ID'],
      ['name', 'Name'],
      ['category', 'Category'],
      ['amount', 'Amount']
    ]),
    apiSearchPlaceholder: 'Search transactions...',
    findButtonText: 'Find Transaction',
    loadingText: 'Searching transactions...',
    noDataMessage: 'No transactions found. Try different search terms.',
    loadingMessage: 'Loading transaction data...'
  };
  // Enhanced dropdown options with relationships
  currencyOptions = [
    { key: 'USD', value: 'US Dollar', rate: 1, taxRate: 0.05, country: 'US' },
    { key: 'EUR', value: 'Euro', rate: 0.85, taxRate: 0.08, country: 'EU' },
    { key: 'GBP', value: 'British Pound', rate: 0.73, taxRate: 0.07, country: 'UK' },
    { key: 'JPY', value: 'Japanese Yen', rate: 110, taxRate: 0.03, country: 'JP' },
    { key: 'CAD', value: 'Canadian Dollar', rate: 1.25, taxRate: 0.06, country: 'CA' },
    { key: 'AUD', value: 'Australian Dollar', rate: 1.35, taxRate: 0.04, country: 'AU' }
  ];

  countryOptions = [
    { key: 'US', value: 'United States', region: 'NA', riskLevel: 'low' },
    { key: 'EU', value: 'European Union', region: 'EU', riskLevel: 'low' },
    { key: 'UK', value: 'United Kingdom', region: 'EU', riskLevel: 'low' },
    { key: 'JP', value: 'Japan', region: 'AS', riskLevel: 'low' },
    { key: 'CA', value: 'Canada', region: 'NA', riskLevel: 'low' },
    { key: 'AU', value: 'Australia', region: 'OC', riskLevel: 'low' },
    { key: 'CN', value: 'China', region: 'AS', riskLevel: 'medium' },
    { key: 'RU', value: 'Russia', region: 'AS', riskLevel: 'high' },
    { key: 'BD', value: 'Bangladesh', region: 'AS', riskLevel: 'medium' }
  ];

  productCategoryOptions = [
    { key: 'electronics', value: 'Electronics', taxMultiplier: 1.2, requiresApproval: false },
    { key: 'automotive', value: 'Automotive', taxMultiplier: 1.5, requiresApproval: true },
    { key: 'healthcare', value: 'Healthcare', taxMultiplier: 0.8, requiresApproval: true },
    { key: 'financial', value: 'Financial Services', taxMultiplier: 2.0, requiresApproval: true },
    { key: 'retail', value: 'Retail', taxMultiplier: 1.0, requiresApproval: false },
    { key: 'construction', value: 'Construction', taxMultiplier: 1.3, requiresApproval: true }
  ];

  subCategoryOptions = [
    // Electronics
    { key: 'mobile', value: 'Mobile Devices', parentCategory: 'electronics', minAmount: 100 },
    { key: 'computers', value: 'Computers', parentCategory: 'electronics', minAmount: 500 },
    { key: 'accessories', value: 'Accessories', parentCategory: 'electronics', minAmount: 10 },

    // Automotive
    { key: 'parts', value: 'Auto Parts', parentCategory: 'automotive', minAmount: 50 },
    { key: 'services', value: 'Auto Services', parentCategory: 'automotive', minAmount: 100 },
    { key: 'vehicles', value: 'Vehicles', parentCategory: 'automotive', minAmount: 5000 },

    // Healthcare
    { key: 'equipment', value: 'Medical Equipment', parentCategory: 'healthcare', minAmount: 1000 },
    { key: 'supplies', value: 'Medical Supplies', parentCategory: 'healthcare', minAmount: 50 },
    { key: 'pharmaceuticals', value: 'Pharmaceuticals', parentCategory: 'healthcare', minAmount: 100 },

    // Financial
    { key: 'banking', value: 'Banking Services', parentCategory: 'financial', minAmount: 1000 },
    { key: 'insurance', value: 'Insurance', parentCategory: 'financial', minAmount: 500 },
    { key: 'investment', value: 'Investment', parentCategory: 'financial', minAmount: 10000 },

    // Retail
    { key: 'clothing', value: 'Clothing', parentCategory: 'retail', minAmount: 20 },
    { key: 'food', value: 'Food & Beverages', parentCategory: 'retail', minAmount: 5 },
    { key: 'home', value: 'Home & Garden', parentCategory: 'retail', minAmount: 25 },

    // Construction
    { key: 'materials', value: 'Building Materials', parentCategory: 'construction', minAmount: 100 },
    { key: 'tools', value: 'Construction Tools', parentCategory: 'construction', minAmount: 50 },
    { key: 'labor', value: 'Labor Services', parentCategory: 'construction', minAmount: 200 }
  ];

  // Enhanced dropdown options for existing fields
  dropdownOptions = [
    { key: 'option1', value: 'High Priority Transaction' },
    { key: 'option2', value: 'Medium Priority Transaction' },
    { key: 'option3', value: 'Low Priority Transaction' },
    { key: 'option4', value: 'Urgent Processing Required' },
    { key: 'option5', value: 'Standard Processing' }
  ];

  // Enhanced sample transactions with relatable fields
  sampleTransactions = signal([
    {
      id: 'TXN001',
      transactionType: 'PACS.008',
      amount: 50000.00,
      currency: 'USD',
      country: 'US',
      productCategory: 'financial',
      subCategory: 'banking',
      status: 'pending',
      fromAccount: '1234567890',
      toAccount: '0987654321',
      date: '2024-01-15',
      priority: 'high',
      department: 'sales',
      category: 'international',
      taxRate: 0.10,
      calculatedTax: 5000.00,
      totalAmount: 55000.00,
      riskLevel: 'medium',
      requiresApproval: true,
      availableRoles: [
        { value: 'admin', label: 'Administrator' },
        { value: 'approver', label: 'Transaction Approver' },
        { value: 'viewer', label: 'View Only' }
      ],
      assignedRole: 'approver'
    },
    {
      id: 'TXN002',
      transactionType: 'PACS.008',
      amount: 25000.00,
      currency: 'EUR',
      country: 'EU',
      productCategory: 'electronics',
      subCategory: 'computers',
      status: 'completed',
      fromAccount: '1111111111',
      toAccount: '2222222222',
      date: '2024-01-14',
      priority: 'normal',
      department: 'finance',
      category: 'domestic',
      taxRate: 0.096,
      calculatedTax: 2400.00,
      totalAmount: 27400.00,
      riskLevel: 'low',
      requiresApproval: false,
      availableRoles: [
        { value: 'admin', label: 'Administrator' },
        { value: 'viewer', label: 'View Only' }
      ],
      assignedRole: 'viewer'
    },
    {
      id: 'TXN003',
      transactionType: 'PACS.008',
      amount: 100000.00,
      currency: 'GBP',
      country: 'UK',
      productCategory: 'automotive',
      subCategory: 'vehicles',
      status: 'failed',
      fromAccount: '3333333333',
      toAccount: '4444444444',
      date: '2024-01-13',
      priority: 'high',
      department: 'operations',
      category: 'urgent',
      taxRate: 0.105,
      calculatedTax: 10500.00,
      totalAmount: 110500.00,
      riskLevel: 'low',
      requiresApproval: true,
      availableRoles: [
        { value: 'admin', label: 'Administrator' },
        { value: 'approver', label: 'Transaction Approver' },
        { value: 'specialist', label: 'Operations Specialist' }
      ],
      assignedRole: 'specialist'
    },
    {
      id: 'TXN004',
      transactionType: 'PACS.008',
      amount: 100000.00,
      currency: 'GBP',
      country: 'UK',
      productCategory: 'automotive',
      subCategory: 'parts',
      status: 'failed',
      fromAccount: '3333333333',
      toAccount: '4444444444',
      date: '2024-01-13',
      priority: 'high',
      department: 'operations',
      category: 'urgent',
      taxRate: 0.105,
      calculatedTax: 10500.00,
      totalAmount: 110500.00,
      riskLevel: 'low',
      requiresApproval: true,
      availableRoles: [
        { value: 'admin', label: 'Administrator' },
        { value: 'approver', label: 'Transaction Approver' },
        { value: 'specialist', label: 'Operations Specialist' }
      ],
      assignedRole: 'specialist'
    },
    {
      id: 'TXN005',
      transactionType: 'PACS.008',
      amount: 100000.00,
      currency: 'GBP',
      country: 'UK',
      productCategory: 'retail',
      subCategory: 'clothing',
      status: 'failed',
      fromAccount: '3333333333',
      toAccount: '4444444444',
      date: '2024-01-13',
      priority: 'high',
      department: 'operations',
      category: 'urgent',
      taxRate: 0.105,
      calculatedTax: 10500.00,
      totalAmount: 110500.00,
      riskLevel: 'low',
      requiresApproval: true,
      availableRoles: [
        { value: 'admin', label: 'Administrator' },
        { value: 'approver', label: 'Transaction Approver' },
        { value: 'specialist', label: 'Operations Specialist' }
      ],
      assignedRole: 'specialist'
    },
    {
      id: 'TXN006',
      transactionType: 'PACS.008',
      amount: 100000.00,
      currency: 'AUD',
      country: 'AU',
      productCategory: 'retail',
      subCategory: 'clothing',
      status: 'failed',
      fromAccount: '3333333333',
      toAccount: '4444444444',
      date: '2024-01-13',
      priority: 'high',
      department: 'operations',
      category: 'urgent',
      taxRate: 0.105,
      calculatedTax: 10500.00,
      totalAmount: 110500.00,
      riskLevel: 'low',
      requiresApproval: true,
      availableRoles: [
        { value: 'admin', label: 'Administrator' },
        { value: 'approver', label: 'Transaction Approver' },
        { value: 'specialist', label: 'Operations Specialist' }
      ],
      assignedRole: 'specialist'
    }
  ]);

  // Enhanced transaction dropdown options with relatable fields
  transactionDropdownOptions = signal<Record<string, DropdownOption[]>>({
    status: [
      { value: 'pending', label: 'Pending Review' },
      { value: 'completed', label: 'Completed' },
      { value: 'failed', label: 'Failed' },
      { value: 'cancelled', label: 'Cancelled' },
      { value: 'in_progress', label: 'In Progress' }
    ],
    priority: [
      { value: 'low', label: 'Low Priority' },
      { value: 'normal', label: 'Normal Priority' },
      { value: 'high', label: 'High Priority' },
      { value: 'urgent', label: 'Urgent' }
    ],
    department: [
      { value: 'sales', label: 'Sales Department' },
      { value: 'finance', label: 'Finance Department' },
      { value: 'operations', label: 'Operations' },
      { value: 'treasury', label: 'Treasury' },
      { value: 'compliance', label: 'Compliance' },
      { value: 'risk', label: 'Risk Management' }
    ],
    category: [
      { value: 'domestic', label: 'Domestic Transfer' },
      { value: 'international', label: 'International Transfer' },
      { value: 'corporate', label: 'Corporate Payment' },
      { value: 'retail', label: 'Retail Payment' },
      { value: 'fx_trade', label: 'FX Trade Settlement' },
      { value: 'urgent', label: 'Urgent Payment' }
    ],
  currency: [
    { value: 'USD', label: 'US Dollar' },
    { value: 'EUR', label: 'Euro' },
    { value: 'GBP', label: 'British Pound' },
    { value: 'JPY', label: 'Japanese Yen' },
    { value: 'CAD', label: 'Canadian Dollar' },
    { value: 'AUD', label: 'Australian Dollar' }
  ],
  // Add country options
  country: [
    { value: 'US', label: 'United States' },
    { value: 'EU', label: 'European Union' },
    { value: 'UK', label: 'United Kingdom ' },
    { value: 'JP', label: 'Japan' },
    { value: 'CA', label: 'Canada' },
    { value: 'AU', label: 'Australia' },
    { value: 'CN', label: 'China' },
    { value: 'RU', label: 'Russia' },
    { value: 'BD', label: 'Bangladesh' }
  ],
  // Add product category options
  productCategory: [
    { value: 'electronics', label: 'Electronics' },
    { value: 'automotive', label: 'Automotive' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'financial', label: 'Financial Services' },
    { value: 'retail', label: 'Retail' },
    { value: 'construction', label: 'Construction' }
  ],
    subCategory: [] // Will be populated dynamically based on selected category
  });

  // Enhanced dropdown columns to include new relatable fields
  transactionDropdownColumns = signal(['status', 'priority', 'department', 'category', 'assignedRole', 'currency', 'country', 'productCategory', 'subCategory']);


    accountsData = [
    { accountId: 'ACC001', accountName: 'Main Current Account', accountType: 'Current', balance: 50000.00 },
    { accountId: 'ACC002', accountName: 'Savings Account', accountType: 'Savings', balance: 25000.00 },
    { accountId: 'ACC003', accountName: 'Business Account', accountType: 'Business', balance: 100000.00 },
    { accountId: 'ACC004', accountName: 'Investment Account', accountType: 'Investment', balance: 75000.00 },
    { accountId: 'ACC005', accountName: 'Foreign Currency Account', accountType: 'FC', balance: 30000.00 }
  ];

  filteredAccounts = [...this.accountsData];
   filterAccounts(searchTerm: string) {
    if (!searchTerm.trim()) {
      this.filteredAccounts = [...this.accountsData];
      return;
    }

    const term = searchTerm.toLowerCase();
    this.filteredAccounts = this.accountsData.filter(account =>
      account.accountId.toLowerCase().includes(term) ||
      account.accountName.toLowerCase().includes(term) ||
      account.accountType.toLowerCase().includes(term)
    );
  }

  // Create new account handler
  createNewAccount() {
    // You can implement account creation logic here
    this.toastr.info('Create new account functionality would be implemented here', 'Feature');
    this.showModal = false;
  }
  constructor(
    private formBuilder: FormBuilder,
    //private toastr: CustomToastrService

  ) {
    BUTTON_VISIBILITY.set({
      save: true,
      update: false,
      view: true,
      delete: true,
      exit: true,
      reset: true,
    });

    effect(() => {
    if(this.onClickSave()) {
        this.save();
        ONCLICK_SAVE.set(false);
    }
  });
  }


save(): void {
  console.log('=== STARTING SAVE PROCESS ===');

  // First, let's see what the form actually contains
  console.log('Form valid status:', this.frmGroup.valid);
  console.log('Form value:', this.frmGroup.value);
  console.log('Form errors:', this.getFormErrors());

  // Check if form is invalid
  if (this.frmGroup.invalid) {
    console.log('❌ Form is invalid');

    // Get detailed error information
    const errors = this.getDetailedFormErrors();
    console.log('Detailed form errors:', errors);

    // Show specific error messages
    this.showFormValidationErrors(errors);
    return;
  }

  // Additional custom validation
  if (!this.validateRequiredFields()) {
    console.log('❌ Custom validation failed');
    return;
  }

  // If we reach here, form is valid
  console.log('✅ Form is valid, proceeding with save...');

  // Get all form data including calculated values
  const completeFormData = this.getCompleteFormData();

  console.log('=== COMPLETE FORM DATA ===');
  console.log(JSON.stringify(completeFormData, null, 2));

  this.toastr.success('Data saved successfully! Check console for complete data.', 'Save Successful');
}

// Improved validation method
validateRequiredFields(): boolean {
  // Define required fields based on your form
  const requiredFields = [
    'textBox',
    'id',
    'amount',
    'dropdown',
    'currency',
    'country',
    'productCategory',
    'subCategory',
    'officeCode',
    'number'
    // Remove 'textArea' from required if express processing is enabled
  ];

  // Check if express processing is enabled (switch is on)
  const isExpressProcessing = this.frmGroup.get('switch')?.value;

  // Add textArea as required only if not in express processing mode
  if (!isExpressProcessing) {
    requiredFields.push('textArea');
  }

  let hasErrors = false;

  for (const fieldName of requiredFields) {
    const control = this.frmGroup.get(fieldName);

    if (!control) {
      console.log(`⚠️ Control '${fieldName}' not found in form`);
      continue;
    }

    const value = control.value;
    const isEmpty = value === null || value === undefined || value === '' ||
                   (Array.isArray(value) && value.length === 0);

    if (isEmpty || control.invalid) {
      console.log(`❌ Field '${fieldName}' is invalid or empty:`, {
        value: value,
        errors: control.errors,
        valid: control.valid
      });

      this.toastr.error(`Please fill in: ${this.getFieldDisplayName(fieldName)}`, 'Required Field');
      hasErrors = true;
    }
  }

  return !hasErrors;
}


private getFieldDisplayName(fieldName: string): string {
  const fieldNames: { [key: string]: string } = {
    textBox: 'Transaction Reference',
    id: 'Account ID',
    amount: 'Transaction Amount',
    dropdown: 'Priority Level',
    currency: 'Currency',
    country: 'Country',
    productCategory: 'Product Category',
    subCategory: 'Sub Category',
    textArea: 'Transaction Notes',
    officeCode: 'Office Code',
    number: 'Reference Number'
  };

  return fieldNames[fieldName] || fieldName;
}

// Get detailed form errors
private getDetailedFormErrors(): any {
  const formErrors: any = {};

  Object.keys(this.frmGroup.controls).forEach(key => {
    const control = this.frmGroup.get(key);
    if (control && control.errors) {
      formErrors[key] = {
        value: control.value,
        errors: control.errors,
        touched: control.touched,
        dirty: control.dirty
      };
    }
  });

  return formErrors;
}




  onModalClose(isVisible: boolean) {
    console.log('Modal visibility changed:', isVisible);
    this.showModal = isVisible;

    if (!isVisible) {
      console.log('Modal closed');
    }
  }

  onModalVisibilityChange(isVisible: boolean) {
    this.showModal = isVisible;
    console.log('Modal visibility changed to:', isVisible);
  }

// Update the openModal method:
// In all-components-page.ts
openModal(componentToLoad?: Type<any>, data?: any) {
  console.log('=== OPENING MODAL ===');
  console.log('Component to load:', componentToLoad);
  console.log('Component name:', componentToLoad?.name);

  // Reset modal state
  this.showModal = false;
  this.modalComponent = undefined;


  setTimeout(() => {
    this.modalComponent = componentToLoad || this.OtherComponentsPageComponent;

    const currentFieldData = this.frmGroup?.getRawValue ? this.frmGroup.getRawValue() : {};
    this.modalComponentData = {
      initialData: currentFieldData,
      ...(data || {})
    };

    console.log('Setting modal component:', this.modalComponent?.name);
    console.log('Setting modal data:', this.modalComponentData);

    this.showModal = true;

    console.log('Modal should now be visible');
  }, 50);
}
// Show specific validation errors
/*private showFormValidationErrors(errors: any): void {
  const errorKeys = Object.keys(errors);

  if (errorKeys.length === 0) {
    this.toastr.error('Form has validation errors but no specific errors found', 'Validation Error');
    return;
  }

  // Show first few errors to avoid spam
  errorKeys.slice(0, 3).forEach(key => {
    const fieldError = errors[key];
    const fieldName = this.getFieldDisplayName(key);

    if (fieldError.errors.required) {
      this.toastr.error(`${fieldName} is required`, 'Required Field');
    } else if (fieldError.errors.minlength) {
      this.toastr.error(`${fieldName} must be at least ${fieldError.errors.minlength.requiredLength} characters`, 'Validation Error');
    } else if (fieldError.errors.maxlength) {
      this.toastr.error(`${fieldName} must not exceed ${fieldError.errors.maxlength.requiredLength} characters`, 'Validation Error');
    } else if (fieldError.errors.min) {
      this.toastr.error(`${fieldName} must be at least ${fieldError.errors.min.min}`, 'Validation Error');
    } else if (fieldError.errors.max) {
      this.toastr.error(`${fieldName} must not exceed ${fieldError.errors.max.max}`, 'Validation Error');
    } else if (fieldError.errors.pattern) {
      this.toastr.error(`${fieldName} has invalid format`, 'Validation Error');
    } else if (fieldError.errors.minAmount) {
      this.toastr.error(`${fieldName} must be at least ${fieldError.errors.minAmount} for selected subcategory`, 'Validation Error');
    } else {
      this.toastr.error(`${fieldName} has validation errors`, 'Validation Error');
    }
  });

  if (errorKeys.length > 3) {
    this.toastr.warning(`${errorKeys.length - 3} more validation errors found. Check form fields.`, 'Additional Errors');
  }
}*/

/*private showFormValidationErrors(errors: any): void {
  const errorKeys = Object.keys(errors);

  if (errorKeys.length === 0) {
    this.toastr.error('Form has validation errors but no specific errors found', 'Validation Error', {
      toastClass: 'ngx-toastr custom-toast-0',
      timeOut: 0, // stays until manually closed
      closeButton: true
    });
    return;
  }

  // Show first few errors to avoid spam
  errorKeys.slice(0, 3).forEach((key, index) => {
    const fieldError = errors[key];
    const fieldName = this.getFieldDisplayName(key);

    // Dynamic Y position for each toast
    const y = 80 + index * 70; // 80px initial offset, 70px spacing between toasts
    const customClass = `custom-toast-${index}`;

    // Create dynamic CSS for this toast
    const style = document.createElement('style');
    style.textContent = `
      .${customClass} {
        position: fixed !important;
        top: ${y}px !important;
        left: 900px !important;
        z-index: 9999 !important;
      }
    `;
    document.head.appendChild(style);

    // Determine error message
    let message = '';
    if (fieldError.errors.required) {
      message = `${fieldName} is required`;
    } else if (fieldError.errors.minlength) {
      message = `${fieldName} must be at least ${fieldError.errors.minlength.requiredLength} characters`;
    } else if (fieldError.errors.maxlength) {
      message = `${fieldName} must not exceed ${fieldError.errors.maxlength.requiredLength} characters`;
    } else if (fieldError.errors.min) {
      message = `${fieldName} must be at least ${fieldError.errors.min.min}`;
    } else if (fieldError.errors.max) {
      message = `${fieldName} must not exceed ${fieldError.errors.max.max}`;
    } else if (fieldError.errors.pattern) {
      message = `${fieldName} has invalid format`;
    } else if (fieldError.errors.minAmount) {
      message = `${fieldName} must be at least ${fieldError.errors.minAmount} for selected subcategory`;
    } else {
      message = `${fieldName} has validation errors`;
    }

    // Show toast at custom Y position
    this.toastr.error(message, 'Validation Error', {
      toastClass: `ngx-toastr ${customClass}`,
      timeOut: 0, // stays until manually closed
      closeButton: true,
      progressBar: true
    }).onHidden.subscribe(() => {
      document.head.removeChild(style); // clean up CSS
    });
  });

  // Show additional errors notice if more than 3
  if (errorKeys.length > 3) {
    const y = 80 + 3 * 70; // position below first 3 toasts
    const customClass = `custom-toast-more`;

    const style = document.createElement('style');
    style.textContent = `
      .${customClass} {
        position: fixed !important;
        top: ${y}px !important;
        left: 900px !important;
        z-index: 9999 !important;
      }
    `;
    document.head.appendChild(style);

    this.toastr.warning(`${errorKeys.length - 3} more validation errors found. Check form fields.`, 'Additional Errors', {
      toastClass: `ngx-toastr ${customClass}`,
      timeOut: 0,
      closeButton: true,
      progressBar: true
    }).onHidden.subscribe(() => {
      document.head.removeChild(style);
    });
  }
}*/


private showFormValidationErrors(errors: any): void {
  const errorKeys = Object.keys(errors);

  if (errorKeys.length === 0) {
    //this.showCustomToastMessage1('Form has validation errors but no specific errors found', 'Validation Error', 'error');
    this.toastr.error('Form has validation errors but no specific errors found', 'Validation Error');
    return;
  }

  // Show first few errors
  errorKeys.slice(0, 3).forEach((key) => {
    const fieldError = errors[key];
    const fieldName = this.getFieldDisplayName(key);

    // Build message
    let message = '';
    if (fieldError.errors.required) {
      message = `${fieldName} is required`;
    } else if (fieldError.errors.minlength) {
      message = `${fieldName} must be at least ${fieldError.errors.minlength.requiredLength} characters`;
    } else if (fieldError.errors.maxlength) {
      message = `${fieldName} must not exceed ${fieldError.errors.maxlength.requiredLength} characters`;
    } else if (fieldError.errors.min) {
      message = `${fieldName} must be at least ${fieldError.errors.min.min}`;
    } else if (fieldError.errors.max) {
      message = `${fieldName} must not exceed ${fieldError.errors.max.max}`;
    } else if (fieldError.errors.pattern) {
      message = `${fieldName} has invalid format`;
    } else if (fieldError.errors.minAmount) {
      message = `${fieldName} must be at least ${fieldError.errors.minAmount} for selected subcategory`;
    } else {
      message = `${fieldName} has validation errors`;
    }

    // Show toast with stacking
    //this.showCustomToastMessage1(message, 'Validation Error', 'error');
    this.toastr.error(message, 'Validation Error');
  });

  // If more than 3 errors, show summary
  if (errorKeys.length > 3) {
    this.toastr.warning(
      `${errorKeys.length - 3} more validation errors found. Check form fields.`,
      'Additional Errors',
    );
  }
}

// Get complete form data including calculated values
private getCompleteFormData(): any {
  const formValues = this.frmGroup.value;

  // Include disabled field values
  const disabledValues = {
    taxRate: this.frmGroup.get('taxRate')?.value,
    calculatedTax: this.frmGroup.get('calculatedTax')?.value,
    totalAmount: this.frmGroup.get('totalAmount')?.value,
    riskLevel: this.frmGroup.get('riskLevel')?.value,
    requiresApproval: this.frmGroup.get('requiresApproval')?.value
  };

  return {
    timestamp: new Date().toISOString(),
    formData: {
      ...formValues,
      ...disabledValues
    },
    calculatedValues: {
      selectedCurrency: this.selectedCurrency(),
      selectedCountry: this.selectedCountry(),
      selectedProductCategory: this.selectedProductCategory(),
      calculatedTaxRate: this.calculatedTaxRate(),
      isHighValueTransaction: this.isHighValueTransaction(),
      isApprovalRequired: this.isApprovalRequired(),
      relationshipStatus: this.getRelationshipStatus()
    },
    fileData: {
      pdfFiles: this.pdfFiles.map(f => ({ name: f.name, size: f.size, type: f.type })),
      anyFiles: this.anyFiles.map(f => ({ name: f.name, size: f.size, type: f.type })),
      profilePicFile: this.profilePicFile ? { name: this.profilePicFile.name, size: this.profilePicFile.size } : null
    },
    gridData: {
      transactions: this.sampleTransactions(),
      transactionCount: this.sampleTransactions().length
    },
    formStatus: {
      valid: this.frmGroup.valid,
      dirty: this.frmGroup.dirty,
      touched: this.frmGroup.touched
    }
  };
}

// Updated getFormErrors method
private getFormErrors(): any {
  const formErrors: any = {};

  Object.keys(this.frmGroup.controls).forEach(key => {
    const control = this.frmGroup.get(key);
    if (control && !control.valid && control.errors) {
      formErrors[key] = control.errors;
    }
  });

  return formErrors;
}

// Method to mark all fields as touched (helpful for showing validation errors)
markAllFieldsAsTouched(): void {
  Object.keys(this.frmGroup.controls).forEach(key => {
    this.frmGroup.get(key)?.markAsTouched();
  });
}

// Debug method to check current form state
debugFormState(): void {
  console.log('=== FORM DEBUG INFO ===');

  Object.keys(this.frmGroup.controls).forEach(key => {
    const control = this.frmGroup.get(key);
    console.log(`${key}:`, {
      value: control?.value,
      valid: control?.valid,
      errors: control?.errors,
      touched: control?.touched,
      dirty: control?.dirty,
      disabled: control?.disabled
    });
  });
}

private restoreGridSelections(): void {
  try {
    // Try to get multiple selections first
    const multipleSelectionsData = localStorage.getItem('selectedRows');
    if (multipleSelectionsData) {
      const selectedRowIds = JSON.parse(multipleSelectionsData);
      console.log('ss',selectedRowIds);
      if (Array.isArray(selectedRowIds) && selectedRowIds.length > 0) {
        const transactions = this.sampleTransactions();
        
        // Restore all selected rows
        selectedRowIds.forEach((rowId: string, index: number) => {
          const rowIndex = transactions.findIndex(t => t.id === rowId);
          
          if (rowIndex !== -1) {
            // Add to selected IDs signal
            this.selectedRowIds.update(ids => {
              const newIds = new Set(ids);
              newIds.add(rowId);
              return newIds;
            });

            // Stagger the row selections to avoid timing issues
            setTimeout(() => {
              this.selectRowInGrid(rowIndex, rowId);
            }, 500 + (index * 100));
          }
        });
        
        console.log('Restored multiple selections:', selectedRowIds);
        this.toastr.info(`Restored ${selectedRowIds.length} selected rows`, 'Grid Selection');
        return;
      }
    }
    
    // Fallback: try single row selection for backward compatibility
    const storedData = localStorage.getItem('rowData');
    if (storedData) {
      const rowData = JSON.parse(storedData);
      
      if (rowData.id) {
        const transactions = this.sampleTransactions();
        const rowIndex = transactions.findIndex(t => t.id === rowData.id);
        
        if (rowIndex !== -1) {
          this.selectedRowIds.update(ids => {
            const newIds = new Set(ids);
            newIds.add(rowData.id);
            return newIds;
          });

          setTimeout(() => {
            this.selectRowInGrid(rowIndex, rowData.id);
          }, 500);
          
          console.log('Restored single selection for row:', rowData.id);
          this.toastr.info(`Restored selection: ${rowData.id}`, 'Grid Selection');
        }
      }
    }
  } catch (error) {
    console.error('Error restoring grid selections:', error);
  }
}


private selectRowInGrid(index: number, rowId?: string): void {
  const transactions = this.sampleTransactions();
  if (index >= 0 && index < transactions.length) {
    const transaction = transactions[index];
    
    
    if (this.gridComponent) {
      try {
        
        this.gridComponent.onRowSelect(index, true);
        console.log('Grid row selected via component method');
      } catch (error) {
        console.log('Grid component selection method not available, using fallback:', error);
      }
    }
    
    // this.onTransactionRowSelect({
    //   data: JSON.stringify(transaction),
    //   checked: true
    // });

    // Force change detection if needed
    console.log(`Selected row ${rowId || transaction.id} at index ${index}`);
  }
}

// Multiple selection localStorage methods
private saveMultipleSelectionsToStorage(): void {
  try {
    const selectedIds = Array.from(this.selectedRowIds());
    localStorage.setItem('selectedRows', JSON.stringify(selectedIds));
    console.log('Saved multiple selections to localStorage:', selectedIds);
  } catch (error) {
    console.error('Error saving multiple selections to localStorage:', error);
  }
}

private removeSelectionFromStorage(rowId: string): void {
  try {
    const selectedIds = Array.from(this.selectedRowIds());
    localStorage.setItem('selectedRows', JSON.stringify(selectedIds));
    
    // Also remove single selection if it matches
    const currentRowData = localStorage.getItem('rowData');
    if (currentRowData) {
      const storedRowData = JSON.parse(currentRowData);
      if (storedRowData.id === rowId) {
        localStorage.removeItem('rowData');
      }
    }
  } catch (error) {
    console.error('Error removing selection from localStorage:', error);
  }
}

onTransactionRowSelect(event: { data: string, checked: boolean }): void {
  console.log('Row selection event:', event);
  
  const rowData = JSON.parse(event.data);
  
  if (event.checked) {
    // Add to selected rows
    this.selectedRowIds.update(ids => {
      const newIds = new Set(ids);
      newIds.add(rowData.id);
      return newIds;
    });
    
    // Store all selected rows in localStorage
    this.saveMultipleSelectionsToStorage();
    
    console.log(`Row ${rowData.id} selected and stored in localStorage`);
    this.toastr.info(`Transaction ${rowData.id} selected. Total: ${this.selectedRowIds().size}`, 'Row Selected');
  } else {
    // Remove from selected rows
    this.selectedRowIds.update(ids => {
      const newIds = new Set(ids);
      newIds.delete(rowData.id);
      return newIds;
    });
    
    // Update localStorage with remaining selections
    this.removeSelectionFromStorage(rowData.id);
    
    console.log(`Row ${rowData.id} deselected`);
    this.toastr.info(`Transaction ${rowData.id} deselected. Total: ${this.selectedRowIds().size}`, 'Row Deselected');
  }
}
  

  ngOnInit(): void {
    this.frmGroup = this.formBuilder.group({
      textBox: [{ value: '', disabled: false }, [Validators.required, Validators.minLength(3), Validators.maxLength(20), Validators.pattern(/^[a-zA-Z0-9_]+$/)]],
      id: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      textArea: ['', [Validators.required, Validators.maxLength(500)]],
      switch: [true],
      amount: ['', [Validators.required, Validators.max(1000000), Validators.min(1)]],
      amountToWord: ['', [Validators.required, Validators.max(1000000), Validators.min(1)]],
      dropdown: ['', Validators.required],
      multiSelect: [[]],  
      // categories: [[], Validators.required],
      date: ['', Validators.required],
      number: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      officeCode: ['', [Validators.required, Validators.maxLength(10), Validators.minLength(3)]],
      fileUpload: [null],

      // New relatable fields
      currency: ['USD', Validators.required],
      country: ['', Validators.required],
      productCategory: ['', Validators.required],
      subCategory: ['', Validators.required],
      taxRate: [{ value: 0, disabled: true }],
      calculatedTax: [{ value: 0, disabled: true }],
      totalAmount: [{ value: 0, disabled: true }],
      riskLevel: [{ value: '', disabled: true }],
      requiresApproval: [{ value: false, disabled: true }],

      // Horizontal display mode controls (same as outline section)
      textBoxHorizontal: ['', [Validators.minLength(3), Validators.maxLength(20), Validators.pattern(/^[a-zA-Z0-9_]+$/)]],
      currencyHorizontal: ['EUR'],
      amountToWordHorizontal: ['', [Validators.max(1000000), Validators.min(1)]],
      dropdownHorizontal: [''],
      multiSelectHorizontal: [[]],
      numberHorizontal: ['', [Validators.pattern('^[0-9]*$')]],
      officeCodeHorizontal: ['', [Validators.maxLength(10), Validators.minLength(3)]],
      quillEditor: ['']
    });

    this.setupFieldRelationships();
    setTimeout(() => {
      this.restoreGridSelections();
    }, 100);

  }

  private setupFieldRelationships(): void {
    // Currency changes affect country, tax rate, and amount calculations
    this.frmGroup.get('currency')?.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe((currencyCode: string) => {
      this.handleCurrencyChange(currencyCode);
    });

    // Country changes affect risk level and approval requirements
    this.frmGroup.get('country')?.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe((countryCode: string) => {
      this.handleCountryChange(countryCode);
    });

    // Product category changes affect subcategories and tax calculations
    this.frmGroup.get('productCategory')?.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe((categoryCode: string) => {
      this.handleProductCategoryChange(categoryCode);
    });

    // Amount changes affect tax calculations and approval requirements
    this.frmGroup.get('amount')?.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe((amount: number) => {
      this.handleAmountChange(amount);
    });

    // Subcategory changes affect minimum amount validation
    this.frmGroup.get('subCategory')?.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe((subCategoryCode: string) => {
      this.handleSubCategoryChange(subCategoryCode);
    });

    // Switch toggle affects transaction processing
    this.frmGroup.get('switch')?.valueChanges.subscribe((isEnabled: boolean) => {
      this.handleSwitchToggle(isEnabled);
    });

    this.frmGroup.get('switch')?.valueChanges.subscribe((isEnabled: boolean) => {
      this.handleSwitchToggle(!isEnabled);
    });
  }


  onTextBoxChanged(value: string): void {
    console.log('TextBox changed:', value);
  }

  onInputTextAreaChanged(value: string): void {
    console.log('InputTextArea changed:', value);
  }
  onIdBoxChanged(value: string): void {
    console.log('IdBox changed:', value);
  }
  onAmountChanged(value: string): void {
    console.log('Amount changed:', value);
  }
  onAmountToWordChanged(value: string): void {
    console.log('AmountToWord changed:', value);
  }
  onNumberChanged(value: string): void {
    console.log('Number changed:', value);
  }
  onOfficeBoxChanged(value: { officeCode: string, officeName: string }): void {
    console.log('OfficeBox changed:', value);
  }

  private handleCurrencyChange(currencyCode: string): void {
    const currency = this.currencyOptions.find(c => c.key === currencyCode);
    if (currency) {
      this.selectedCurrency.set(currencyCode);

      // Auto-select related country
      this.frmGroup.patchValue({
        country: currency.country
      }, { emitEvent: false });

      // Update tax rate
      this.frmGroup.patchValue({
        taxRate: currency.taxRate
      });

      // Recalculate amounts
      this.recalculateAmounts();

      // Filter related transactions in grid
      this.filterRelatedTransactions();

      this.toastr.info(`Currency changed to ${currency.value}. Auto-selected ${currency.country}`, 'Currency Update');
    }
  }

  private handleCountryChange(countryCode: string): void {
    const country = this.countryOptions.find(c => c.key === countryCode);
    if (country) {
      this.selectedCountry.set(countryCode);

      // Update risk level
      this.frmGroup.patchValue({
        riskLevel: country.riskLevel
      });

      // Update approval requirements based on risk
      const requiresApproval = country.riskLevel === 'high' || country.riskLevel === 'medium';
      this.frmGroup.patchValue({
        requiresApproval: requiresApproval
      });

      // Update validation rules based on risk level
      this.updateValidationRules(country.riskLevel);

      this.toastr.info(`Country set to ${country.value}. Risk level: ${country.riskLevel}`, 'Country Update');
    }
  }

  private handleProductCategoryChange(categoryCode: string): void {
    const category = this.productCategoryOptions.find(c => c.key === categoryCode);
    if (category) {
      this.selectedProductCategory.set(categoryCode);

      // Filter subcategories
      const filteredSubs = this.subCategoryOptions.filter(sub => sub.parentCategory === categoryCode);
      this.filteredSubCategories.set(filteredSubs);

      // Update dropdown options for subcategory in grid
      this.transactionDropdownOptions.update(options => ({
        ...options,
        subCategory: filteredSubs.map(sub => ({ value: sub.key, label: sub.value }))
      }));

      // Reset subcategory selection
      this.frmGroup.patchValue({
        subCategory: ''
      });

      // Update approval requirements
      this.frmGroup.patchValue({
        requiresApproval: category.requiresApproval
      });

      // Recalculate tax with category multiplier
      this.recalculateAmounts();

      this.toastr.info(`Product category changed to ${category.value}`, 'Category Update');
    }
  }

  private handleAmountChange(amount: number): void {
    if (amount && amount > 0) {
      // Check if high value transaction
      const isHighValue = amount > 50000;
      this.isHighValueTransaction.set(isHighValue);

      // Update approval requirements for high value
      if (isHighValue) {
        this.frmGroup.patchValue({
          requiresApproval: true
        });
      }

      // Recalculate tax and total
      this.recalculateAmounts();

      // Update amount to words field
      this.frmGroup.patchValue({
        amountToWord: amount

      });

      if (isHighValue) {
        this.toastr.warning('High value transaction - Approval required', 'High Value Alert');
      }
    }
  }

  private handleSubCategoryChange(subCategoryCode: string): void {
    const subCategory = this.subCategoryOptions.find(s => s.key === subCategoryCode);
    if (subCategory) {
      // Update minimum amount validation
      const currentAmount = this.frmGroup.get('amount')?.value || 0;
      if (currentAmount < subCategory.minAmount) {
        this.frmGroup.get('amount')?.setErrors({ minAmount: subCategory.minAmount });
        this.toastr.error(`Minimum amount for ${subCategory.value} is ${subCategory.minAmount}`, 'Validation Error');
      }

      // Update amount field minimum validator
      this.frmGroup.get('amount')?.setValidators([
        Validators.required,
        Validators.min(subCategory.minAmount),
        Validators.max(1000000)
      ]);
      this.frmGroup.get('amount')?.updateValueAndValidity();
    }
  }

showDynamicToasts() {
    const messages = [
      'First toast message',
      'Second toast message',
      'Third toast message',
      'Fourth toast message'
    ];

    this.showNextToast(messages, 0);
  }

   private showNextToast(messages: string[], index: number) {
    if (index >= messages.length) return;

    this.toastCount++;
    const styleId = `dynamic-toast-${this.toastCount}`;
    // Calculate Y position dynamically
    const yPosition = this.startY + index * this.gapY;
    const xPosition = 50; // fixed X position, adjust if needed

    // Create dynamic CSS class
    const style = document.createElement('style');
    style.id = styleId;
    style.innerHTML = `
      .${styleId} {
        top: ${yPosition}px !important;
        left: ${xPosition}px !important;
        position: fixed !important;
      }
    `;
    document.head.appendChild(style);

    // Show toast and wait until hidden to show next one
    this.toastr.success(messages[index], 'Success', {
      toastClass: `ngx-toastr ${styleId}`,
      timeOut: 600,
    }).onHidden.subscribe(() => {
      this.showNextToast(messages, index + 1);
    });

    this.toastr.error(messages[index], 'Validation', {
      toastClass: `ngx-toastr ${styleId}`,
      closeButton: true,
      timeOut: 3000,
      progressBar: true,
    }).onHidden.subscribe(() => {

      document.head.removeChild(style);
      this.showNextToast(messages, index + 1);
    });
  }

  private handleSwitchToggle(isEnabled: boolean): void {
    if (isEnabled) {
      // Enable express processing - reduce validation requirements
      this.frmGroup.get('textArea')?.setValidators([Validators.maxLength(500)]);
      /*this.toastr.success('Express processing enabled', 'Processing Mode', {
      //positionClass: 'toast-top-left'
      toastClass: 'ngx-toastr custom-toast-position',
      closeButton: true
    }
    );*/
    //this.showCustomToast('Express processing enabled','Processing Mode' );
    this.toastr.success('Operation completed!', 'Processing Mode');

    } else {
      // Standard processing - restore full validation
      this.frmGroup.get('textArea')?.setValidators([Validators.required, Validators.maxLength(500)]);
      /*this.toastr.info('Standard processing mode', 'Processing Mode', {
      //positionClass: 'toast-top-left'
      toastClass: 'ngx-toastr',
      closeButton: true
    }
    );*/
    //this.showCustomToast('Standard processing mode','info');
    this.toastr.info('Standard processing mode', 'info');

    }
    this.frmGroup.get('textArea')?.updateValueAndValidity();
  }

  private recalculateAmounts(): void {
    const amount = this.frmGroup.get('amount')?.value || 0;
    const taxRate = this.frmGroup.get('taxRate')?.value || 0;
    const categoryCode = this.frmGroup.get('productCategory')?.value;

    let effectiveTaxRate = taxRate;

    // Apply category tax multiplier
    if (categoryCode) {
      const category = this.productCategoryOptions.find(c => c.key === categoryCode);
      if (category) {
        effectiveTaxRate = taxRate * category.taxMultiplier;
      }
    }

    const calculatedTax = amount * effectiveTaxRate;
    const totalAmount = amount + calculatedTax;

    this.calculatedTaxRate.set(effectiveTaxRate);

    this.frmGroup.patchValue({
      taxRate: effectiveTaxRate,
      calculatedTax: calculatedTax,
      totalAmount: totalAmount
    });
  }

  private updateValidationRules(riskLevel: string): void {
    // Update validation based on risk level
    if (riskLevel === 'high') {
      // High risk requires more documentation
      this.frmGroup.get('textArea')?.setValidators([
        Validators.required,
        Validators.minLength(50),
        Validators.maxLength(500)
      ]);
      this.frmGroup.get('fileUpload')?.setValidators([Validators.required]);
    } else if (riskLevel === 'medium') {
      this.frmGroup.get('textArea')?.setValidators([
        Validators.required,
        Validators.minLength(20),
        Validators.maxLength(500)
      ]);
    } else {
      // Low risk - standard validation
      this.frmGroup.get('textArea')?.setValidators([
        Validators.required,
        Validators.maxLength(500)
      ]);
    }

    // Update validity
    this.frmGroup.get('textArea')?.updateValueAndValidity();
    this.frmGroup.get('fileUpload')?.updateValueAndValidity();
  }

  private filterRelatedTransactions(): void {
    const currentCurrency = this.frmGroup.get('currency')?.value;
    const currentCategory = this.frmGroup.get('productCategory')?.value;

    // Filter transactions in grid based on current form values
    const allTransactions = this.sampleTransactions();
    const filtered = allTransactions.filter(t =>
      t.currency === currentCurrency || t.productCategory === currentCategory
    );

    this.relatedTransactions.set(filtered);

    // Update grid data if needed
    // You can emit this to update the grid component
  }

  // Enhanced event handlers with relatable field logic
  handleCategorySelection(event: { selectedOption: any; selectedKey: string; selectedValue: string }): void {
    console.log('Selected option:', event.selectedOption);

    // Update priority based on selection
    if (event.selectedKey === 'option1' || event.selectedKey === 'option4') {
      // High priority or urgent
      this.frmGroup.patchValue({
        requiresApproval: true
      });
      this.toastr.info('High priority transaction - Approval required', 'Priority Update');
    }
  }

  // Enhanced grid event handlers
  onTransactionEdit(serializedData: string): void {
    const transaction = JSON.parse(serializedData);

    // Pre-populate form with transaction data for editing
    this.frmGroup.patchValue({
      amount: transaction.amount,
      currency: transaction.currency,
      country: transaction.country,
      productCategory: transaction.productCategory,
      subCategory: transaction.subCategory,
      textBox: transaction.id,
      textArea: `Editing transaction ${transaction.id}`
    });

    this.toastr.info(`Editing transaction: ${transaction.id}`, 'Edit Mode');
  }

onTransactionDataChanged(newData: any[]): void {
  console.log('Transaction data changed:', newData);

  // Validate amounts in the updated data
  const validatedData = newData.map(transaction => {
    if (transaction.amount) {
      // Ensure amount is within valid range
      if (transaction.amount < 1) {
        transaction.amount = 1;
        this.toastr.warning(`Minimum amount of 1 applied to transaction ${transaction.id}`, 'Validation');
      } else if (transaction.amount > 1000000) {
        transaction.amount = 1000000;
        this.toastr.warning(`Maximum amount of 1,000,000 applied to transaction ${transaction.id}`, 'Validation');
      }

      // Validate against subcategory minimum
      const subCategory = this.subCategoryOptions.find(s => s.key === transaction.subCategory);
      if (subCategory && transaction.amount < subCategory.minAmount) {
        transaction.amount = subCategory.minAmount;
        this.toastr.warning(`Minimum amount of ${subCategory.minAmount} applied for ${subCategory.value}`, 'Validation');
      }

      // Recalculate related fields
      transaction = this.recalculateTransactionAmounts(transaction);
    }
    return transaction;
  });

  // Update with validated data
  this.sampleTransactions.set(validatedData);
  this.filterRelatedTransactions();

  this.toastr.success('Transaction data updated with validation', 'Data Updated');
}

private recalculateTransactionAmounts(transaction: any): any {
  const amount = Number(transaction.amount) || 0;
  let taxRate = 0.05; // Default tax rate

  // Get currency-specific tax rate
  const currency = this.currencyOptions.find(c => c.key === transaction.currency);
  if (currency) {
    taxRate = currency.taxRate;
  }

  // Apply category multiplier
  const category = this.productCategoryOptions.find(c => c.key === transaction.productCategory);
  if (category) {
    taxRate *= category.taxMultiplier;
  }

  const calculatedTax = amount * taxRate;
  const totalAmount = amount + calculatedTax;

  return {
    ...transaction,
    amount: amount,
    taxRate: taxRate,
    calculatedTax: calculatedTax,
    totalAmount: totalAmount,
    requiresApproval: category?.requiresApproval || amount > 50000
  };
}
  private validateTransactionRelationships(transaction: any): void {
    // Validate currency-country relationship
    const currency = this.currencyOptions.find(c => c.key === transaction.currency);
    if (currency && currency.country !== transaction.country) {
      this.toastr.warning(`Currency-Country mismatch in ${transaction.id}`, 'Validation Warning');
    }

    // Validate category-subcategory relationship
    const subCategory = this.subCategoryOptions.find(s => s.key === transaction.subCategory);
    if (subCategory && subCategory.parentCategory !== transaction.productCategory) {
      this.toastr.error(`Invalid subcategory for ${transaction.id}`, 'Validation Error');
    }

    // Validate minimum amount for subcategory
    if (subCategory && transaction.amount < subCategory.minAmount) {
      this.toastr.error(`Amount below minimum for ${transaction.subCategory} in ${transaction.id}`, 'Amount Error');
    }
  }

  // Method to get filtered options for template
  getFilteredSubCategories(): any[] {
    return this.filteredSubCategories();
  }

  // Method to check if approval is required
  isApprovalRequired(): boolean {
    return this.frmGroup.get('requiresApproval')?.value || false;
  }

  // Method to get current tax rate
  getCurrentTaxRate(): number {
    return this.calculatedTaxRate();
  }

  // Method to get risk level styling
  getRiskLevelClass(): string {
    const riskLevel = this.frmGroup.get('riskLevel')?.value;
    switch (riskLevel) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  }

  // Export current form as transaction
  addCurrentFormToGrid(): void {
    const formValue = this.frmGroup.value;

    if (this.frmGroup.valid) {
      const newTransaction = {
        id: `TXN${Date.now().toString().slice(-6)}`,
        transactionType: 'PACS.008',
        amount: formValue.amount,
        currency: formValue.currency,
        country: formValue.country,
        productCategory: formValue.productCategory,
        subCategory: formValue.subCategory,
        status: 'pending',
        fromAccount: formValue.textBox || 'AUTO',
        toAccount: formValue.id || 'AUTO',
        date: formValue.date || new Date().toISOString().split('T')[0],
        priority: this.isHighValueTransaction() ? 'high' : 'normal',
        department: 'user_input',
        category: 'form_generated',
        taxRate: formValue.taxRate,
        calculatedTax: formValue.calculatedTax,
        totalAmount: formValue.totalAmount,
        riskLevel: formValue.riskLevel,
        requiresApproval: formValue.requiresApproval,
        availableRoles: [
          { value: 'admin', label: 'Administrator' },
          { value: 'approver', label: 'Transaction Approver' },
          { value: 'viewer', label: 'View Only' }
        ],
        assignedRole: formValue.requiresApproval ? 'approver' : 'viewer'
      };

      // Add to grid data
      const currentTransactions = this.sampleTransactions();
      this.sampleTransactions.set([...currentTransactions, newTransaction]);

      // Reset form
      this.resetFormWithDefaults();

      this.toastr.success(`Transaction ${newTransaction.id} added to grid`, 'Transaction Added');
    } else {
      this.toastr.error('Please fix form errors before adding to grid', 'Validation Error');
    }
  }

  // Reset form but keep some relatable field values
  private resetFormWithDefaults(): void {
    const currentCurrency = this.frmGroup.get('currency')?.value;
    const currentCountry = this.frmGroup.get('country')?.value;

    this.frmGroup.reset();

    // Restore some values to maintain context
    this.frmGroup.patchValue({
      currency: currentCurrency,
      country: currentCountry,
      switch: true,
      taxRate: 0,
      calculatedTax: 0,
      totalAmount: 0
    });
  }

  // Bulk update related fields in grid
  bulkUpdateGridByCategory(): void {
    const selectedCategory = this.frmGroup.get('productCategory')?.value;
    if (!selectedCategory) {
      this.toastr.warning('Please select a product category first', 'Bulk Update');
      return;
    }

    const currentTransactions = this.sampleTransactions();
    const updatedTransactions = currentTransactions.map(transaction => {
      if (transaction.productCategory === selectedCategory) {
        const category = this.productCategoryOptions.find(c => c.key === selectedCategory);
        if (category) {
          // Recalculate tax for matching category
          const newTaxRate = transaction.currency === 'USD' ? 0.05 * category.taxMultiplier :
                           transaction.currency === 'EUR' ? 0.08 * category.taxMultiplier :
                           0.06 * category.taxMultiplier;
          const newTax = transaction.amount * newTaxRate;

          return {
            ...transaction,
            taxRate: newTaxRate,
            calculatedTax: newTax,
            totalAmount: transaction.amount + newTax,
            requiresApproval: category.requiresApproval
          };
        }
      }
      return transaction;
    });

    this.sampleTransactions.set(updatedTransactions);
    this.toastr.success(`Updated all transactions in category: ${selectedCategory}`, 'Bulk Update Complete');
  }

  // Advanced filtering for grid
  filterGridByCriteria(): void {
    const criteria = {
      currency: this.frmGroup.get('currency')?.value,
      country: this.frmGroup.get('country')?.value,
      productCategory: this.frmGroup.get('productCategory')?.value,
      minAmount: this.frmGroup.get('amount')?.value || 0,
      riskLevel: this.frmGroup.get('riskLevel')?.value
    };

    // This would typically be handled by the grid component's filtering mechanism
    // For now, we'll update a filtered signal that the grid can use
    const allTransactions = this.sampleTransactions();
    const filtered = allTransactions.filter(transaction => {
      let matches = true;

      if (criteria.currency && transaction.currency !== criteria.currency) matches = false;
      if (criteria.country && transaction.country !== criteria.country) matches = false;
      if (criteria.productCategory && transaction.productCategory !== criteria.productCategory) matches = false;
      if (criteria.minAmount && transaction.amount < criteria.minAmount) matches = false;
      if (criteria.riskLevel && transaction.riskLevel !== criteria.riskLevel) matches = false;

      return matches;
    });

    // You would pass this filtered data to your grid component
    console.log('Filtered transactions:', filtered);
    this.toastr.info(`Found ${filtered.length} matching transactions`, 'Filter Applied');
  }

  // Get suggested values based on current form state
  getSuggestedValues(): any {
    const currency = this.frmGroup.get('currency')?.value;
    const category = this.frmGroup.get('productCategory')?.value;
    const amount = this.frmGroup.get('amount')?.value || 0;

    const suggestions = {
      suggestedOfficeCode: currency === 'USD' ? 'US01' : currency === 'EUR' ? 'EU01' : 'INTL',
      suggestedTextBox: `${currency}_${category}_${Date.now().toString().slice(-4)}`,
      suggestedDate: new Date().toISOString().split('T')[0],
      suggestedNumber: Math.floor(amount / 1000) || 1
    };

    return suggestions;
  }

  // Auto-populate suggested values
  applySuggestedValues(): void {
    const suggestions = this.getSuggestedValues();

    this.frmGroup.patchValue({
      officeCode: suggestions.suggestedOfficeCode,
      textBox: suggestions.suggestedTextBox,
      date: suggestions.suggestedDate,
      number: suggestions.suggestedNumber
    });

    this.toastr.info('Applied suggested values based on current selections', 'Auto-Complete');
  }

  // Validate all relationships
  validateAllRelationships(): boolean {
    const errors = [];
    const formValue = this.frmGroup.value;

    // Currency-Country relationship
    const currency = this.currencyOptions.find(c => c.key === formValue.currency);
    if (currency && currency.country !== formValue.country) {
      errors.push('Currency and Country do not match');
    }

    // Category-Subcategory relationship
    const subCategory = this.subCategoryOptions.find(s => s.key === formValue.subCategory);
    if (subCategory && subCategory.parentCategory !== formValue.productCategory) {
      errors.push('Product Category and Subcategory do not match');
    }

    // Amount-Subcategory minimum
    if (subCategory && formValue.amount < subCategory.minAmount) {
      errors.push(`Amount must be at least ${subCategory.minAmount} for selected subcategory`);
    }

    // Display errors
    if (errors.length > 0) {
      errors.forEach(error => this.toastr.error(error, 'Relationship Validation'));
      return false;
    }

    this.toastr.success('All relationships are valid', 'Validation Passed');
    return true;
  }

  // Method to sync form with selected grid row
  syncFormWithGridRow(transaction: any): void {
    this.frmGroup.patchValue({
      textBox: transaction.id,
      amount: transaction.amount,
      currency: transaction.currency,
      country: transaction.country,
      productCategory: transaction.productCategory,
      subCategory: transaction.subCategory,
      date: transaction.date,
      textArea: `Synced with transaction: ${transaction.id}`,
      taxRate: transaction.taxRate,
      calculatedTax: transaction.calculatedTax,
      totalAmount: transaction.totalAmount,
      riskLevel: transaction.riskLevel,
      requiresApproval: transaction.requiresApproval
    });

    this.toastr.info(`Form synced with transaction ${transaction.id}`, 'Form Sync');
  }

  // Enhanced transaction view handler
  onTransactionView(serializedData: string): void {
    const transaction = JSON.parse(serializedData);

    // Sync form with selected transaction
    this.syncFormWithGridRow(transaction);

    // Show detailed information
    const details = `
      Transaction: ${transaction.id}
      Amount: ${transaction.amount} ${transaction.currency}
      Tax: ${transaction.calculatedTax}
      Total: ${transaction.totalAmount}
      Risk Level: ${transaction.riskLevel}
      Requires Approval: ${transaction.requiresApproval ? 'Yes' : 'No'}
    `;

    console.log('Transaction Details:', details);
    this.toastr.info(`Viewing transaction: ${transaction.id}`, 'View Mode');
  }

  // Method to get relationship status
  getRelationshipStatus(): any {
    return {
      currencyCountryMatch: this.isCurrencyCountryMatch(),
      categorySubcategoryMatch: this.isCategorySubcategoryMatch(),
      amountValid: this.isAmountValidForSubcategory(),
      highValueTransaction: this.isHighValueTransaction(),
      approvalRequired: this.isApprovalRequired(),
      riskLevel: this.frmGroup.get('riskLevel')?.value,
      effectiveTaxRate: this.getCurrentTaxRate()
    };
  }

  private isCurrencyCountryMatch(): boolean {
    const currency = this.frmGroup.get('currency')?.value;
    const country = this.frmGroup.get('country')?.value;
    const currencyData = this.currencyOptions.find(c => c.key === currency);
    return currencyData ? currencyData.country === country : false;
  }

  private isCategorySubcategoryMatch(): boolean {
    const category = this.frmGroup.get('productCategory')?.value;
    const subCategory = this.frmGroup.get('subCategory')?.value;
    const subCategoryData = this.subCategoryOptions.find(s => s.key === subCategory);
    return subCategoryData ? subCategoryData.parentCategory === category : true;
  }

  private isAmountValidForSubcategory(): boolean {
    const amount = this.frmGroup.get('amount')?.value || 0;
    const subCategory = this.frmGroup.get('subCategory')?.value;
    const subCategoryData = this.subCategoryOptions.find(s => s.key === subCategory);
    return subCategoryData ? amount >= subCategoryData.minAmount : true;
  }

  // Existing methods from your original code...

  dataSelectionConfig = signal<any>({
    pickTableDataSource: [
      { id: 'ITEM001', name: 'Sample Item 1', description: 'First sample item', category: 'Electronics' },
      { id: 'ITEM002', name: 'Sample Item 2', description: 'Second sample item', category: 'Books' },
      { id: 'ITEM003', name: 'Sample Item 3', description: 'Third sample item', category: 'Clothing' },
      { id: 'ITEM004', name: 'Sample Item 4', description: 'Fourth sample item', category: 'Electronics' },
      { id: 'ITEM005', name: 'Sample Item 5', description: 'Fifth sample item', category: 'Sports' },
    ],

    pickTablePair: new Map<string, string>([
      ['id', 'Item ID'],
      ['name', 'Item Name'],
      ['description', 'Description'],
      ['category', 'Category']
    ]),

    apiSearchPlaceholder: 'Search for items...',
    findButtonText: 'Search',
    loadingText: 'Searching...',
    noDataMessage: 'No items found. Use search to find items.',
    loadingMessage: 'Loading items...'
  });

  private mockItemService = {
    getItems: async (params: any) => {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const items = [
        { id: 'ITEM001', name: 'Sample Item 1', description: 'First sample item', category: 'Electronics' },
        { id: 'ITEM002', name: 'Sample Item 2', description: 'Second sample item', category: 'Books' },
        { id: 'ITEM003', name: 'Sample Item 3', description: 'Third sample item', category: 'Clothing' },
        { id: 'ITEM004', name: 'Sample Item 4', description: 'Fourth sample item', category: 'Electronics' },
        { id: 'ITEM005', name: 'Sample Item 5', description: 'Fifth sample item', category: 'Sports' },
      ];

      let filteredItems = items;
      if (params?.search) {
        const searchTerm = params.search.toLowerCase();
        filteredItems = items.filter(item =>
          item.name.toLowerCase().includes(searchTerm) ||
          item.description.toLowerCase().includes(searchTerm) ||
          item.category.toLowerCase().includes(searchTerm)
        );
      }

      return {
        data: filteredItems,
        totalRecords: filteredItems.length
      };
    }
  };

  @ViewChild('step1Template', { static: true }) step1Template!: TemplateRef<any>;
  @ViewChild('step2Template', { static: true }) step2Template!: TemplateRef<any>;
  @ViewChild('step3Template', { static: true }) step3Template!: TemplateRef<any>;

  gridData = [
    { id: '1', name: 'Item 1', value: 'Value 1' },
    { id: '2', name: 'Item 2', value: 'Value 2' },
    { id: '3', name: 'Item 3', value: 'Value 3' },
  ];

  showAnyFileUpload: boolean = true;
  pdfFiles: File[] = [];
  imageFiles: File[] = [];
  anyFiles: File[] = [];
  documentFiles: File[] = [];
  profilePicFile?: File;
  

  transactionColumnNames = signal({
    'id': 'Transaction ID',
    'transactionType': 'Type',
    'amount': 'Amount',
    'currency': 'Currency',
    'country': 'Country',
    'productCategory': 'Product Category',
    'subCategory': 'Sub Category',
    'status': 'Status',
    'fromAccount': 'From Account',
    'toAccount': 'To Account',
    'date': 'Date',
    'priority': 'Priority',
    'department': 'Department',
    'category': 'Category',
    'taxRate': 'Tax Rate',
    'calculatedTax': 'Tax Amount',
    'totalAmount': 'Total Amount',
    'riskLevel': 'Risk Level',
    'requiresApproval': 'Requires Approval',
    'assignedRole': 'Assigned Role'
  });

  transactionRowDesigners = signal<TableRowDesigner[]>([
    {
      condition: (item: any) => item.riskLevel === 'high',
      // backgroundColor: '#fee2e2',
      // textColor: '#dc2626',
      // borderColor: '#fca5a5'
    },
    {
      condition: (item: any) => item.riskLevel === 'medium',
      // backgroundColor: '#d8d4c5ff',
      // textColor: '#d97706',
      // borderColor: '#d4d4d4ff'
    },
    {
      condition: (item: any) => item.riskLevel === 'low',
      // backgroundColor: '#dcfce7',
      // textColor: '#070707ff',
      // borderColor: '#86efac'
    },
    {
      condition: (item: any) => item.requiresApproval,
      // backgroundColor: '#e0e7ff',
      // textColor: '#3730a3',
      // borderColor: '#a5b4fc'
    }
  ]);

  transactionDynamicDropdownSources = signal<Record<string, string>>({
    assignedRole: 'availableRoles'
  });

  bicTableHeaders = new Map<string, string>([
    ['swift', 'SWIFT Code'],
    ['branchName', 'Branch Name'],
    ['address', 'Address']
  ]);



  ngAfterViewInit(): void {
    setTimeout(() => {
      // this.steps = [
      //   {
      //     title: 'Personal Information',
      //     subtitle: 'Enter your basic details',
      //     form: 'personalInfoForm',
      //     formContent: this.step1Template
      //   },
      //   {
      //     title: 'Contact Details',
      //     subtitle: 'Add your contact information',
      //     form: 'contactForm',
      //     formContent: this.step2Template
      //   },
      //   {
      //     title: 'Review & Submit',
      //     subtitle: 'Review your information',
      //     form: 'reviewForm',
      //     formContent: this.step3Template
      //   }
      // ];
    });
  }

  handleFileChange(files: File[]): void {
    console.log('Selected files:', files);
  }

  handleGridAction(action: string, rowData: any): void {
    console.log(`Grid action: ${action}`, rowData);
  }

  onStepperSubmit() {
    console.log('Stepper submitted!');
  }

  onPdfSelected(files: File[]): void {
    this.pdfFiles = files || [];
    this.toastr.info(`${this.pdfFiles.length} PDF file(s) selected`, 'Files');
    console.log('Current PDF files:', this.pdfFiles);
  }

  onImagesSelected(files: File[]): void {
    this.imageFiles = files || [];
    this.toastr.info(`${this.imageFiles.length} image file(s) selected`, 'Files');
  }

  onAnyFilesSelected(files: File[]): void {
    this.anyFiles = files || [];
    this.toastr.info(`${this.anyFiles.length} file(s) selected`, 'Files');
  }

  onDocumentsSelected(files: File[]): void {
    this.documentFiles = files || [];
    this.toastr.info(`${this.documentFiles.length} document(s) selected`, 'Files');
  }

  onProfilePicSelected(files: File[]): void {
    this.profilePicFile = files && files.length > 0 ? files[0] : undefined;
    this.toastr.success(this.profilePicFile ? `Selected: ${this.profilePicFile.name}` : 'No file selected', 'Profile Picture');
  }

  onFileInputChanged(context: string): void {
    this.toastr.show(`File input changed: ${context}`, 'Notice');
  }

  onTransactionDelete(serializedData: string): void {
    const transaction = JSON.parse(serializedData);
    console.log('Delete transaction:', transaction);
    this.toastr.warning(`Deleting transaction: ${transaction.id}`, 'Delete Confirmation');
  }

  onTransactionPrint(serializedData: string): void {
    const transaction = JSON.parse(serializedData);
    console.log('Print transaction:', transaction);
    this.toastr.success(`Printing transaction: ${transaction.id}`, 'Print');
  }

// onTransactionRowSelect(event: { data: string, checked: boolean }): void {
//   const rowData = JSON.parse(event.data);

//   if (event.checked) {
//     console.log('Row CHECKED:', rowData);
    
//     // Store in localStorage
//     localStorage.setItem('rowData', JSON.stringify(rowData));
    
//     // Update selected IDs signal
//     this.selectedRowIds.update(ids => {
//       const newIds = new Set(ids);
//       newIds.add(rowData.id);
//       return newIds;
//     });
    
//     this.toastr.success(`Row selected: ${rowData.id}`, 'Selection');
    
//   } else {
//     console.log('Row UNCHECKED:', rowData);
    
//     // Remove from localStorage if it's the unchecked row
//     const storedData = localStorage.getItem('rowData');
//     if (storedData) {
//       const stored = JSON.parse(storedData);
//       if (stored.id === rowData.id) {
//         localStorage.removeItem('rowData');
//       }
//     }
    
//     // Update selected IDs signal
//     this.selectedRowIds.update(ids => {
//       const newIds = new Set(ids);
//       newIds.delete(rowData.id);
//       return newIds;
//     });
    
//     this.toastr.info(`Row deselected: ${rowData.id}`, 'Selection');
//   }
// }

// 6. Enhanced method to check if a specific row should be pre-selected
isRowPreSelected(rowId: string): boolean {
  return this.selectedRowIds().has(rowId);
}

// 7. Method to get initially selected indices for the grid
getInitiallySelectedIndices(): number[] {
  const selectedIds = this.selectedRowIds();
  const transactions = this.sampleTransactions();
  const indices: number[] = [];
  
  transactions.forEach((transaction, index) => {
    if (selectedIds.has(transaction.id)) {
      indices.push(index);
    }
  });
  
  return indices;
}

onSwitchToggled(event:any): void {
  alert(`Switch toggled: ${this.frmGroup.get('switch')?.value ? 'ON' : 'OFF'}`);
}

onTransactionSelectAll(event: { isSelectAll: boolean, selectedRows: any[], count: number }): void {
  console.log('Select all:', event.isSelectAll);
  console.log('Selected rows:', event.selectedRows);
  console.log('Count:', event.count);

  if (event.isSelectAll) {
    // All rows on current page are selected
    console.log(`Selected ${event.count} transactions`);

    // Calculate totals
    const totalAmount = event.selectedRows.reduce((sum, row) => sum + (row.amount || 0), 0);
    console.log('Total amount:', totalAmount);


  } else {
    console.log('All selections cleared');
  }
}

handleCheckboxChange($event:any): void {

}

handleColumnSelectAll($event:any): void {
  console.log('Column select all:', $event);
}





  onDotsClick(): void {
    console.log('Dots clicked - opening data selection modal');
    this.setupModalData();
    this.isDataSelectionModalOpen.set(true);
  }

  private setupModalData(): void {
    // Set up sample data for the modal
    this.modalConfig.pickTableDataSource = [
      { id: 'ACC001', name: 'John Doe', category: 'Individual', amount: 5000 },
      { id: 'ACC002', name: 'ABC Corp', category: 'Corporate', amount: 15000 },
      { id: 'ACC003', name: 'Jane Smith', category: 'Individual', amount: 7500 },
      { id: 'ACC004', name: 'XYZ Ltd', category: 'Corporate', amount: 25000 }
    ];
  }

  onFindClicked(searchTerm: string): void {
    console.log('Searching for:', searchTerm);
    // Filter the data based on search term
    this.modalConfig.pickTableDataSource = this.modalConfig.pickTableDataSource.filter(item =>
      Object.values(item).some(val =>
        val.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }

  onDataSelectionResult(result: AccountData | null): void {
    if (result) {
      console.log('Selected data:', result);

      this.frmGroup.patchValue({
        id: result.id,
        textBox: result.name
      });
    }
    this.isDataSelectionModalOpen.set(false);
  }

  onBlur(value: string): void {
    console.log('Textbox blurred, value:', value);
    // You can run extra validation, API calls, or formatting here
  }
}
