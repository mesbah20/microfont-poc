import { CommonModule } from '@angular/common';
import { Component, OnInit, WritableSignal, effect, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { TextBaseInput } from '../../../shared/components/input-types/text-base-input/text-base-input';
import { SelectOptionField } from '../../../shared/components/input-types/select-option-field/select-option-field';
import { Button } from '../../../shared/components/input-types/button/button';
import { DataSelectionModal } from '../../../shared/components/data-selection-modal/data-selection-modal';
import { DialogUtils } from '../../../shared/service/dialog-utils';
import { BUTTON_VISIBILITY, MENU_NAME, ONCLICK_DELETE, ONCLICK_RESET, ONCLICK_SAVE, ONCLICK_UPDATE } from '../../../shared/constant/button-signals.constant';
import { IdBoxComponent } from '../../../shared/components/input-types/id-box/id-box';
import { ExpansionPanelHeader } from '../../../shared/components/expansion-panel-header/expansion-panel-header';
import { Switch } from '../../../shared/components/input-types/switch/switch';
import { TextArea } from '../../../shared/components/input-types/text-area/text-area';
import { FileComponent } from '../../../shared/components/input-types/file-input/file-input';
import { DataGridComponent } from '../../../shared/components/data-grid/data-grid';
import { ExpansionSubPanelHeader } from "../../../shared/components/expansion-sub-panel-header/expansion-sub-panel-header";
import { ReportRegistrationService, ReportDTO } from '../services/report-registration.service';
import { DatabaseConnectionService } from '../services/database-connection.service';
import { ApiEndpointService } from '../services/api-endpoint.service';
import { DateInput } from "../../../shared/components/input-types/date-input/date-input";
import { NumberInput } from "../../../shared/components/input-types/number-input/number-input";

/**
 * Report Registration and Parameter Setup Page
 * Handles report metadata and parameter definitions
 */
@Component({
  selector: 'app-report-parameter-list-ui',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatTooltipModule,
    TextBaseInput,
    SelectOptionField,
    Button,
    IdBoxComponent,
    ExpansionPanelHeader,
    Switch,
    TextArea,
    FileComponent,
    DataGridComponent,
    ExpansionSubPanelHeader,
    DateInput,
    NumberInput
],
  templateUrl: './report-parameter-list-ui.html',
  styleUrl: './report-parameter-list-ui.scss'
})
export class ReportParameterListUI implements OnInit {
  // Injected services
  private formBuilder = inject(FormBuilder);
  private toastr = inject(ToastrService);
  private dialogUtils = inject(DialogUtils);
  private dialog = inject(MatDialog);
  private reportService = inject(ReportRegistrationService);
  private dbService = inject(DatabaseConnectionService);
  private apiService = inject(ApiEndpointService);

  // Form and state properties
  reportForm!: FormGroup;
  parameterForm!: FormGroup;
  loading = signal<boolean>(false);
  reportInfoPanel: WritableSignal<boolean> = signal(true);
  parameterSubPanel: WritableSignal<boolean> = signal(true);
  isParameterModalOpen = signal<boolean>(false);
  isEditingParameter = signal<boolean>(false);
  editingParameterIndex = signal<number>(-1);
  currentReportId = signal<number | null>(null);
  selectedReportFile: File | null = null;

  // Report Category options
  reportCategoryOptions = [
    { key: 'FINANCIAL', value: 'Financial' },
    { key: 'OPERATIONAL', value: 'Operational' },
    { key: 'COMPLIANCE', value: 'Compliance' },
    { key: 'CUSTOM', value: 'Custom' },
  ];

  // Data Source Type options
  dataSourceTypeOptions = [
    { key: 'DATABASE', value: 'Database' },
    { key: 'API', value: 'API Endpoint' },
    { key: 'BOTH', value: 'Both' },
  ];

  // Output Format options (for multi-select checkboxes)
  outputFormatOptions = [
    { key: 'PDF', value: 'PDF' },
    { key: 'EXCEL', value: 'Excel' },
    // { key: 'WORD', value: 'Word' },
    // { key: 'HTML', value: 'HTML' },
    { key: 'CSV', value: 'CSV' },
  ];

  // Parameter Data Type options
  parameterDataTypeOptions = [
    { key: 'STRING', value: 'String/Text' },
    { key: 'NUMBER', value: 'Number' },
    { key: 'DATE', value: 'Date' },
    { key: 'BOOLEAN', value: 'Boolean' },
    { key: 'SELECT', value: 'Dropdown/Select' },
  ];

  // Input Type options
  inputTypeOptions = [
    { key: 'TEXT', value: 'Text Input' },
    { key: 'TEXTAREA', value: 'Text Area' },
    { key: 'SWITCH', value: 'Switch' },
    { key: 'SELECT', value: 'Dropdown' },
    { key: 'NUMBER', value: 'Number Box' },
    { key: 'AMOUNT', value: 'Amount Box' },
    { key: 'DATE', value: 'Date Picker' },
  ];

  // Dynamic data for dropdowns
  databaseConnections: { key: string, value: string }[] = [];
  apiEndpoints: { key: string, value: string }[] = [];
  
  // Report list loaded from backend
  reportList: any[] = [];

  // Mock function list (can be replaced with real API later)
  functionList = [
    {
      functionId: 'FN_ATT_001',
      functionName: 'Attendance Management',
      module: 'HR',
    },
    {
      functionId: 'FN_FIN_001',
      functionName: 'Financial Reports',
      module: 'Finance',
    },
    {
      functionId: 'FN_PAY_001',
      functionName: 'Payroll Processing',
      module: 'Finance',
    },
    {
      functionId: 'FN_INV_001',
      functionName: 'Inventory Management',
      module: 'Operations',
    },
  ];

  // Auto Generation Period options
  autoGenPeriodOptions = [
    { key: 'DAILY', value: 'Daily' },
    { key: 'WEEKLY', value: 'Weekly' },
    { key: 'MONTHLY', value: 'Monthly' },
    { key: 'QUARTERLY', value: 'Quarterly' },
    { key: 'YEARLY', value: 'Yearly' },
  ];

  // Data Source options for parameters
  dataSourceOptions = [
    { key: 'STATIC', value: 'Static Options (Manual)' },
    { key: 'API', value: 'API Endpoint' },
    { key: 'DATABASE', value: 'Database Query' },
    { key: 'FUNCTION', value: 'Custom Function' },
  ];

  // Predefined default values for different parameter types
  predefinedDefaultValues = [
    { key: '{{homeBranch}}', value: 'Home Branch' },
    { key: '{{transactionDate}}', value: 'Transaction Date' },
    { key: '{{systemDate}}', value: 'System Date' },
    { key: '{{firstDateOfMonth}}', value: 'First Date of Month' },
    { key: '{{lastDateOfMonth}}', value: 'Last Date of Month' },
    { key: '{{firstDateOfYear}}', value: 'First Date of Year' },
    { key: '{{lastDateOfYear}}', value: 'Last Date of Year' },
    { key: '{{userID}}', value: 'User ID' },
    { key: '{{functionID}}', value: 'Function ID' },
    { key: '{{accountNumber}}', value: 'Account Number' },
    { key: '{{previousSystemDate}}', value: 'Previous System Date' },
    { key: '{{previousTransactionDate}}', value: 'Previous Transaction Date' },
    { key: '{{branchCode}}', value: 'Branch Code' },
    { key: '{{transactionAmount}}', value: 'Transaction Amount' },
    { key: '{{transactionType}}', value: 'Transaction Type' },
    { key: '{{balanceAfterTransaction}}', value: 'Balance After Transaction' },
    { key: '{{customerName}}', value: 'Customer Name' },
    { key: '{{transactionReference}}', value: 'Transaction Reference' },
    { key: '{{currencyCode}}', value: 'Currency Code' },
    { key: 'TODAY', value: 'Today' },
    { key: 'UserInput', value: 'Custom User Input' },
  ];

  // Parameters array
  parameters = signal<any[]>([]);

  // Parameter table columns configuration
  parameterColumns: any[] = [];

  menuName = MENU_NAME;
  onClickReset = ONCLICK_RESET;
  onClickSave = ONCLICK_SAVE;
  onClickUpdate = ONCLICK_UPDATE;
  onClickDelete = ONCLICK_DELETE;

  constructor() {
    effect(() => {
      let localMenuName = 'REPORT REGISTRATION';
      this.menuName.set(localMenuName);
    });
    BUTTON_VISIBILITY.set({
      save: true,
      update: false,
      view: false,
      delete: false,
      exit: false,
      reset: true,
    });
    this.setupSignalEffects();
  }

  ngOnInit() {
    this.initializeReportForm();
    this.initializeParameterForm();
    this.setupDataSourceListener();
    this.setupParameterDataTypeListener();
    this.setupDataSourceChangeListener();
    this.setupDefaultValueListener();
    this.setupParameterColumns();
    this.setupFunctionIdListener();
    this.loadDatabaseConnections();
    this.loadApiEndpoints();
    this.loadReports();
  }

  /**
   * Setup listener for default value changes
   */
  private setupDefaultValueListener() {
    this.parameterForm.get('defaultValueType')?.valueChanges.subscribe((type) => {
      if (type === 'custom') {
        const customValue = this.parameterForm.get('customDefaultValue')?.value;
        this.parameterForm.get('defaultValue')?.setValue(customValue);
      } else {
        // Clear custom value when switching to predefined
        this.parameterForm.get('customDefaultValue')?.setValue('');
      }
    });

    this.parameterForm.get('customDefaultValue')?.valueChanges.subscribe((value) => {
      if (this.parameterForm.get('defaultValueType')?.value === 'custom') {
        this.parameterForm.get('defaultValue')?.setValue(value);
      }
    });

    // Handle BOOLEAN type switch
    this.parameterForm.get('dataType')?.valueChanges.subscribe((dataType) => {
      if (dataType === 'BOOLEAN') {
        this.parameterForm.get('defaultValue')?.setValue(false);
      }
    });
  }

  /**
   * Get filtered predefined values based on parameter type
   */
  getFilteredPredefinedValues(): Array<{ key: string, value: string }> {
    const dataType = this.parameterForm.get('dataType')?.value;
    
    switch (dataType) {
      case 'DATE':
        return this.predefinedDefaultValues.filter(item => 
          item.key.toLowerCase().includes('date') || 
          item.key === 'TODAY' || 
          item.key === '{{transactionDate}}' ||
          item.key === '{{systemDate}}'
        );
      case 'STRING':
        return this.predefinedDefaultValues.filter(item => 
          !item.key.toLowerCase().includes('date') && 
          !item.key.toLowerCase().includes('amount') &&
          item.key !== 'TODAY'
        );
      case 'NUMBER':
        return this.predefinedDefaultValues.filter(item => 
          item.key.toLowerCase().includes('amount') || 
          item.key === '{{userID}}' ||
          item.key === '{{accountNumber}}' ||
          item.key === 'UserInput'
        );
      default:
        return this.predefinedDefaultValues;
    }
  }

  /**
   * Get select options for default value dropdown (SELECT parameters)
   */
  getSelectOptionsForDefault(): Array<{ key: string, value: string }> {
    const selectOptionsValue = this.parameterForm.get('selectOptions')?.value;
    
    if (!selectOptionsValue) {
      return [];
    }

    try {
      const options = JSON.parse(selectOptionsValue);
      return Object.entries(options).map(([key, value]) => ({
        key: key,
        value: value as string
      }));
    } catch (e) {
      return [];
    }
  }
  
  /**
   * Setup listener for dataSource field changes
   */
  private setupDataSourceChangeListener() {
    this.parameterForm.get('dataSource')?.valueChanges.subscribe(() => {
      this.updateSelectOptionsValidators();
    });
    
    // Also listen to dataType and inputType changes
    this.parameterForm.get('dataType')?.valueChanges.subscribe(() => {
      this.updateSelectOptionsValidators();
    });
    
    this.parameterForm.get('inputType')?.valueChanges.subscribe(() => {
      this.updateSelectOptionsValidators();
    });
  }

  /**
   * Setup function ID listener to populate function name
   */
  private setupFunctionIdListener() {
    this.reportForm.get('functionId')?.valueChanges.subscribe(functionId => {
      if (functionId) {
        const selectedFunction = this.functionList.find(f => f.functionId === functionId);
        if (selectedFunction) {
          this.reportForm.get('functionName')?.setValue(selectedFunction.functionName);
        }
      } else {
        this.reportForm.get('functionName')?.setValue('');
      }
    });
  }

  private setupSignalEffects(): void {
    effect(() => {
      this.handleButtonActions();
    });
  }

  private handleButtonActions(): void {
    if (this.onClickReset()) {
      this.onRefresh();
    } else if (this.onClickSave()) {
      this.onSave();
    } else if (this.onClickUpdate()) {
      console.log("Update Clicked");
      this.onUpdate();
    } else if (this.onClickDelete()) {
      this.onDelete();
    }
  }

  /**
   * Initialize the report form with validation
   */
  private initializeReportForm() {
    this.reportForm = this.formBuilder.group({
      id: [null],
      reportName: ['', [Validators.required, Validators.maxLength(150)]],
      functionId: ['', [Validators.required]],
      functionName: [{ value: '', disabled: true }],
      dataSourceType: ['', [Validators.required]],
      databaseConnectionId: [''],
      apiEndpointId: [''],
      reportFile: [null],
      reportFileName: ['', [Validators.maxLength(150)]],
      outputFormats: [['PDF'], [Validators.required]],
      isVisible: [true],
      autoGenPeriod: [''],
      genBeforeEod: [false],
    });
  }

  /**
   * Initialize the parameter form
   */
  private initializeParameterForm() {
    this.parameterForm = this.formBuilder.group({
      parameterName: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9_]+$/)]],
      parameterLabel: ['', [Validators.required, Validators.maxLength(100)]],
      dataType: ['STRING', [Validators.required]],
      inputType: ['TEXT'],
      selectOptions: [''],
      dataSource: ['', [this.urlValidator]],
      formatPattern: [''],
      isRequired: [false],
      isVisible: [true],
      isReadonly: [false],
      minLength: [null],
      maxLength: [null],
      minValue: [null],
      maxValue: [null],
      defaultValueType: ['predefined'], // 'predefined' or 'custom'
      defaultValue: [''],
      customDefaultValue: [''],
      parameterOrder: [1],
      dependsOnParameter: [''],
      helpText: ['', [Validators.maxLength(200)]],
    });
  }

  /**
   * Setup parameter table columns
   */
  private setupParameterColumns() {
    this.parameterColumns = [
      { property: 'sNo', header: 'S.No.', isEditable: false, isNumeric: true, isVisible: true, width: '80px' },
      { property: 'parameterName', header: 'Parameter Name', isEditable: false, isNumeric: false, isVisible: true, width: '150px' },
      { property: 'parameterLabel', header: 'Parameter Label', isEditable: false, isNumeric: false, isVisible: true, width: '150px' },
      { property: 'dataType', header: 'Data Type', isEditable: false, isNumeric: false, isVisible: true, width: '120px' },
      { property: 'isRequired', header: 'Required', isEditable: false, isNumeric: false, isVisible: true, width: '100px' },
      { property: 'isVisible', header: 'Visible', isEditable: false, isNumeric: false, isVisible: true, width: '100px' },
      { property: 'isReadonly', header: 'Readonly', isEditable: false, isNumeric: false, isVisible: true, width: '100px' },
      { property: 'defaultValue', header: 'Default Value', isEditable: false, isNumeric: false, isVisible: true, width: '150px' },
    ];
  }

  /**
   * Setup listener for data source type changes
   */
  private setupDataSourceListener() {
    this.reportForm.get('dataSourceType')?.valueChanges.subscribe(dataSourceType => {
      this.updateDataSourceValidators(dataSourceType);
    });
  }

  /**
   * Update validators based on data source type
   */
  private updateDataSourceValidators(dataSourceType: string) {
    const dbControl = this.reportForm.get('databaseConnectionId');
    const apiControl = this.reportForm.get('apiEndpointId');

    dbControl?.clearValidators();
    apiControl?.clearValidators();

    if (dataSourceType === 'DATABASE' || dataSourceType === 'BOTH') {
      dbControl?.setValidators([Validators.required]);
    }
    if (dataSourceType === 'API' || dataSourceType === 'BOTH') {
      apiControl?.setValidators([Validators.required]);
    }

    dbControl?.updateValueAndValidity();
    apiControl?.updateValueAndValidity();
  }

  /**
   * Setup listener for parameter data type changes
   */
  private setupParameterDataTypeListener() {
    this.parameterForm.get('dataType')?.valueChanges.subscribe(dataType => {
      this.updateParameterValidators(dataType);
    });
  }

  /**
   * Update parameter validators based on data type
   */
  private updateParameterValidators(dataType: string) {
    const selectOptionsControl = this.parameterForm.get('selectOptions');
    const inputTypeControl = this.parameterForm.get('inputType');
    
    selectOptionsControl?.clearValidators();
    
    // Set default input type based on data type
    if (dataType === 'NUMBER') {
      inputTypeControl?.setValue('NUMBER');
    } else if (dataType === 'STRING') {
      inputTypeControl?.setValue('TEXT');
    } else if (dataType === 'DATE') {
      inputTypeControl?.setValue('DATE');
    } else if (dataType === 'BOOLEAN') {
      inputTypeControl?.setValue('SWITCH');
    } else if (dataType === 'SELECT') {
      selectOptionsControl?.setValidators([Validators.required]);
      inputTypeControl?.setValue('SELECT');
    }
    
    selectOptionsControl?.updateValueAndValidity();
  }

  /**
   * Update selectOptions validators based on dataSource value
   */
  private updateSelectOptionsValidators() {
    const selectOptionsControl = this.parameterForm.get('selectOptions');
    const dataSourceControl = this.parameterForm.get('dataSource');
    const dataTypeControl = this.parameterForm.get('dataType');
    const inputTypeControl = this.parameterForm.get('inputType');
    
    selectOptionsControl?.clearValidators();
    
    const dataType = dataTypeControl?.value;
    const inputType = inputTypeControl?.value;
    const dataSourceValue = dataSourceControl?.value?.trim();
    
    // Only require selectOptions for SELECT/DROPDOWN types without dataSource
    const isSelectType = dataType === 'SELECT' || inputType === 'SELECT' || dataType === 'DROPDOWN';
    
    if (isSelectType && !dataSourceValue) {
      selectOptionsControl?.setValidators([Validators.required]);
    }
    
    selectOptionsControl?.updateValueAndValidity();
  }

  /**
   * Check if data source fields should be shown
   */
  showDatabaseConnection(): boolean {
    const dataSourceType = this.reportForm.get('dataSourceType')?.value;
    return dataSourceType === 'DATABASE' || dataSourceType === 'BOTH';
  }

  showApiEndpoint(): boolean {
    const dataSourceType = this.reportForm.get('dataSourceType')?.value;
    return dataSourceType === 'API' || dataSourceType === 'BOTH';
  }

  /**
   * Get filtered input type options based on data type
   */
  getFilteredInputTypeOptions(): { key: string, value: string }[] {
    const dataType = this.parameterForm.get('dataType')?.value;
    
    if (dataType === 'NUMBER') {
      // For NUMBER data type, only show Number Box and Amount Box
      return this.inputTypeOptions.filter(option => 
        ['NUMBER', 'AMOUNT'].includes(option.key)
      );
    } else if (dataType === 'STRING') {
      // For STRING data type, show Text, TextArea, and Dropdown
      return this.inputTypeOptions.filter(option => 
        ['TEXT', 'TEXTAREA', 'SELECT'].includes(option.key)
      );
    } else if (dataType === 'DATE') {
      // For DATE data type, only show Date Picker
      return this.inputTypeOptions.filter(option => 
        option.key === 'DATE'
      );
    } else if (dataType === 'BOOLEAN') {
      // For BOOLEAN data type, show Select dropdown
      return this.inputTypeOptions.filter(option => 
        option.key === 'SWITCH'
      );
    } 
    // else if (dataType === 'SELECT') {
    //   // For SELECT data type, only show Dropdown
    //   return this.inputTypeOptions.filter(option => 
    //     option.key === 'SELECT'
    //   );
    // }
    
    // Default: return all options
    return this.inputTypeOptions;
  }

  /**
   * Check parameter form field visibility
   */
  showTextInputType(): boolean {
    return this.parameterForm.get('dataType')?.value === 'STRING';
  }

  showDropdownOptions(): boolean {
    const dataType = this.parameterForm.get('dataType')?.value;
    const inputType = this.parameterForm.get('inputType')?.value;
    return dataType === 'SELECT' || inputType === 'SELECT';
  }

  showTextValidation(): boolean {
    return this.parameterForm.get('dataType')?.value === 'STRING';
  }

  showNumberValidation(): boolean {
    return this.parameterForm.get('dataType')?.value === 'NUMBER';
  }

  showDateFormat(): boolean {
    return this.parameterForm.get('dataType')?.value === 'DATE';
  }

  /**
   * Custom validator for URL format
   */
  urlValidator(control: any) {
    if (!control.value) {
      return null; // Allow empty values
    }
    
    const value = control.value.trim();
    
    // Allow template variables
    if (value.includes('{{') && value.includes('}}')) {
      return null;
    }
    
    try {
      // Check if it's a valid URL
      new URL(value);
      return null;
    } catch (error) {
      // If not a URL, check if it might be a SQL query or function
      const lowerValue = value.toLowerCase();
      
      // Allow SQL queries
      if (lowerValue.startsWith('select ') || lowerValue.includes('from ')) {
        return null;
      }
      
      // Allow function calls
      if (lowerValue.includes('()') || lowerValue.match(/^[a-zA-Z_][a-zA-Z0-9_]*\s*\(/)) {
        return null;
      }
      
      // Allow static JSON
      try {
        JSON.parse(value);
        return null;
      } catch (jsonError) {
        return { invalidDataSource: true };
      }
    }
  }

  /**
   * Get appropriate placeholder text for select options based on data source
   */
  getSelectOptionsPlaceholder(): string {
    if (this.hasDataSource()) {
      return 'Enter field mapping: {"keyField":"id","valueField":"name","arrayPath":"data"}';
    }
    return 'Enter options as JSON: {"key1":"Label 1","key2":"Label 2"}';
  }
  
  /**
   * Get select options label based on whether dataSource is provided
   */
  getSelectOptionsLabel(): string {
    if (this.hasDataSource()) {
      return 'Field Mapping (keyField, valueField)';
    }
    return 'Select Options (Required)';
  }
  
  /**
   * Check if dataSource is provided
   */
  hasDataSource(): boolean {
    const dataSource = this.parameterForm.get('dataSource')?.value?.trim();
    return !!dataSource;
  }

  /**
   * Check if dataSource field has validation errors
   */
  getDataSourceError(): string | null {
    const dataSourceControl = this.parameterForm.get('dataSource');
    
    if (dataSourceControl?.errors && dataSourceControl?.touched) {
      if (dataSourceControl.errors['invalidDataSource']) {
        return 'Please enter a valid URL, SQL query, function call, or JSON object';
      }
    }
    
    return null;
  }

  /**
   * Load database connections from backend
   */
  private loadDatabaseConnections() {
    this.dbService.getAll().subscribe({
      next: (connections) => {
        this.databaseConnections = connections.map(conn => ({
          key: conn.id!.toString(),
          value: `${conn.id}-${conn.connectionName}`
        }));
      },
      error: (err) => {
        console.error('Error loading database connections:', err);
        this.toastr.error('Failed to load database connections', 'Error');
      }
    });
  }

  /**
   * Load API endpoints from backend
   */
  private loadApiEndpoints() {
    this.apiService.getAll().subscribe({
      next: (endpoints) => {
        this.apiEndpoints = endpoints.map(ep => ({
          key: ep.id!.toString(),
          value: `${ep.id}-${ep.endpointName}`
        }));
      },
      error: (err) => {
        console.error('Error loading API endpoints:', err);
        this.toastr.error('Failed to load API endpoints', 'Error');
      }
    });
  }

  /**
   * Load reports from backend
   */
  private loadReports() {
    this.loading.set(true);
    this.reportService.getAll().subscribe({
      next: (reports) => {
        this.reportList = reports.map(report => {
          const func = this.functionList.find(f => f.functionId === report.functionId);
          return {
            id: report.id,
            reportName: report.reportName,
            functionName: func?.functionName || report.functionId,
            status: report.isVisible ? 'Active' : 'Inactive',
            functionId: report.functionId
          };
        });
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading reports:', err);
        this.toastr.error('Failed to load reports from server', 'Error');
        this.loading.set(false);
      }
    });
  }

  /**
   * Open report selection modal
   */
  openReportModal() {
    const pickTablePair = new Map<string, string>([
      ['id', 'ID'],
      ['reportName', 'Report Name'],
      ['functionName', 'Function'],
      ['status', 'Status'],
    ]);

    const dialogRef = this.dialogUtils.openDialog(
      DataSelectionModal,
      pickTablePair,
      this.reportList
    );

    dialogRef.afterClosed().subscribe((selectedReport: any) => {
      if (selectedReport) {
        this.loadReportById(selectedReport.id);
      }
    });
  }

  /**
   * Open function selection modal
   */
  openFunctionModal() {
    const pickTablePair = new Map<string, string>([
      ['functionId', 'Function Id'],
      ['functionName', 'Function Name'],
      ['module', 'Module'],
    ]);

    const dialogRef = this.dialogUtils.openDialog(
      DataSelectionModal,
      pickTablePair,
      this.functionList
    );

    dialogRef.afterClosed().subscribe((selectedFunction: any) => {
      if (selectedFunction) {
        this.reportForm.patchValue({
          functionId: selectedFunction.functionId,
        });
        this.toastr.info('Function selected.', 'Function Selected');
      }
    });
  }

  /**
   * Load report by ID from backend
   */
  private loadReportById(reportId: number) {
    this.loading.set(true);
    this.reportService.getById(reportId).subscribe({
      next: (report) => {
        this.currentReportId.set(report.id!);
        
        // Find and set function name
        const selectedFunction = this.functionList.find(f => f.functionId === report.functionId);
        
        // Populate form with fetched report data
        this.reportForm.patchValue({
          id: report.id,
          reportName: report.reportName,
          functionId: report.functionId,
          functionName: selectedFunction?.functionName || '',
          dataSourceType: report.dataSourceType,
          databaseConnectionId: report.databaseConnectionId || '',
          apiEndpointId: report.apiEndpointId || '',
          reportFileName: report.reportFileName || '',
          outputFormats: report.outputFormats || ['PDF'],
          isVisible: report.isVisible !== undefined ? report.isVisible : true,
          autoGenPeriod: report.autoGenPeriod || '',
          genBeforeEod: report.genBeforeEod || false,
        });

        // Load parameters
        if (report.parameters && report.parameters.length > 0) {
          const paramData = report.parameters.map((param, index) => ({
            sNo: index + 1,
            parameterName: param.parameterName,
            parameterLabel: param.parameterLabel,
            dataType: param.dataType,
            dataSource: param.dataSource,
            isRequired: param.isRequired ? 'Yes' : 'No',
            isVisible: param.isVisible !== undefined ? (param.isVisible ? 'Yes' : 'No') : 'Yes',
            isReadonly: param.isReadonly !== undefined ? (param.isReadonly ? 'Yes' : 'No') : 'No',
            defaultValue: param.defaultValue || '',
            inputType: param.inputType,
            selectOptions: param.selectOptions,
            formatPattern: param.formatPattern,
            minLength: param.minLength,
            maxLength: param.maxLength,
            minValue: param.minValue,
            maxValue: param.maxValue,
            parameterOrder: param.parameterOrder,
            dependsOnParameter: param.dependsOnParameter,
            helpText: param.helpText
          }));
          this.parameters.set(paramData);
        } else {
          this.parameters.set([]);
        }

        // Update button visibility
        BUTTON_VISIBILITY.set({
          save: false,
          update: true,
          view: false,
          delete: true,
          exit: false,
          reset: true,
        });

        this.toastr.info('Report loaded successfully.', 'Report Selected');
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading report:', err);
        this.toastr.error('Failed to load report', 'Error');
        this.loading.set(false);
      }
    });
  }

  /**
   * Open parameter form for adding new parameter
   */
  openParameterForm() {
    this.isEditingParameter.set(false);
    this.editingParameterIndex.set(-1);
    this.parameterForm.reset({
      dataType: 'STRING',
      inputType: 'TEXT',
      isRequired: false,
      isVisible: true,
      isReadonly: false,
      parameterOrder: this.parameters().length + 1,
    });
    this.isParameterModalOpen.set(true);
  }

  /**
   * Handle parameter edit from grid
   */
  onParameterEdit(eventData: any) {
    console.log('=== EDIT DEBUG START ===');
    console.log('Raw event data received:', eventData);
    console.log('Event data type:', typeof eventData);
    
    // Parse JSON string if needed
    let parameter = eventData;
    if (typeof eventData === 'string') {
      try {
        parameter = JSON.parse(eventData);
        console.log('Parsed JSON string to object:', parameter);
      } catch (e) {
        console.error('Failed to parse JSON string:', e);
        this.toastr.error('Invalid parameter data format', 'Error');
        return;
      }
    } else if (eventData?.data) {
      parameter = eventData.data;
      console.log('Using eventData.data:', parameter);
    } else if (eventData?.rowData) {
      parameter = eventData.rowData;
      console.log('Using eventData.rowData:', parameter);
    } else if (eventData?.item) {
      parameter = eventData.item;
      console.log('Using eventData.item:', parameter);
    }
    
    console.log('Final parameter object:', parameter);
    console.log('All current parameters:', this.parameters());
    
    if (!parameter || !parameter.sNo) {
      console.error('No valid parameter data found in event');
      this.toastr.error('Invalid parameter data for editing', 'Error');
      return;
    }
    
    const index = this.parameters().findIndex(p => p.sNo === parameter.sNo);
    console.log('Found parameter at index:', index);
    
    if (index === -1) {
      console.error('Parameter not found in array');
      this.toastr.error('Parameter not found for editing.', 'Error');
      return;
    }
    
    this.isEditingParameter.set(true);
    this.editingParameterIndex.set(index);
    
    // Populate form with parameter data
    const formData = {
      parameterName: parameter.parameterName,
      parameterLabel: parameter.parameterLabel,
      dataType: parameter.dataType,
      inputType: parameter.inputType,
      selectOptions: parameter.selectOptions,
      dataSource: parameter.dataSource,
      formatPattern: parameter.formatPattern,
      isRequired: parameter.isRequired === 'Yes' || parameter.isRequired === true,
      isVisible: parameter.isVisible === 'Yes' || parameter.isVisible === true,
      isReadonly: parameter.isReadonly === 'Yes' || parameter.isReadonly === true,
      minLength: parameter.minLength ? Number(parameter.minLength) : null,
      maxLength: parameter.maxLength ? Number(parameter.maxLength) : null,
      minValue: parameter.minValue !== null && parameter.minValue !== undefined ? Number(parameter.minValue) : null,
      maxValue: parameter.maxValue !== null && parameter.maxValue !== undefined ? Number(parameter.maxValue) : null,
      defaultValue: parameter.defaultValue,
      parameterOrder: parameter.parameterOrder || parameter.sNo,
      dependsOnParameter: parameter.dependsOnParameter,
      helpText: parameter.helpText,
    };
    
    console.log('Form data to be patched:', formData);
    this.parameterForm.patchValue(formData);
    console.log('Form values after patch:', this.parameterForm.value);
    console.log('=== EDIT DEBUG END ===');
    
    this.isParameterModalOpen.set(true);
  }

  /**
   * Handle parameter delete from grid
   */
  onParameterDelete(eventData: any) {
    console.log('=== DELETE DEBUG START ===');
    console.log('Raw delete event data:', eventData);
    console.log('Event data type:', typeof eventData);
    
    // Parse JSON string if needed
    let parameter = eventData;
    if (typeof eventData === 'string') {
      try {
        parameter = JSON.parse(eventData);
        console.log('Parsed JSON string to object:', parameter);
      } catch (e) {
        console.error('Failed to parse JSON string:', e);
        this.toastr.error('Invalid parameter data format', 'Error');
        return;
      }
    } else if (eventData?.data) {
      parameter = eventData.data;
      console.log('Using eventData.data:', parameter);
    } else if (eventData?.rowData) {
      parameter = eventData.rowData;
      console.log('Using eventData.rowData:', parameter);
    } else if (eventData?.item) {
      parameter = eventData.item;
      console.log('Using eventData.item:', parameter);
    }
    
    console.log('Final parameter object for delete:', parameter);
    
    if (!parameter || !parameter.sNo) {
      console.error('No valid parameter data found in delete event');
      this.toastr.error('Invalid parameter data for deletion', 'Error');
      return;
    }
    
    if (confirm('Are you sure you want to delete this parameter?')) {
      const currentParams = [...this.parameters()];
      console.log('Current parameters before delete:', currentParams);
      console.log('Parameter to delete - sNo:', parameter.sNo);
      
      // Find and remove the parameter by sNo
      const filteredParams = currentParams.filter(p => {
        console.log(`Comparing ${p.sNo} !== ${parameter.sNo} (types: ${typeof p.sNo} vs ${typeof parameter.sNo})`);
        return p.sNo !== parameter.sNo;
      });
      
      console.log('Filtered parameters after delete:', filteredParams);
      console.log('Original length:', currentParams.length, 'New length:', filteredParams.length);
      
      // Renumber S.No. to maintain sequence
      const renumberedParams = filteredParams.map((p, index) => {
        const newParam = { ...p };
        newParam.sNo = index + 1;
        newParam.parameterOrder = index + 1;
        return newParam;
      });
      
      console.log('Renumbered parameters:', renumberedParams);
      
      // Force signal update with empty array first, then new data
      this.parameters.set([]);
      
      // Use setTimeout to ensure proper signal update
      setTimeout(() => {
        this.parameters.set(renumberedParams);
        console.log('Parameters signal updated. New value:', this.parameters());
        this.toastr.success('Parameter deleted successfully.', 'Success');
      }, 100);
      
      console.log('=== DELETE DEBUG END ===');
    }
  }

  /**
   * Add or update parameter
   */
  onAddParameter() {
    if (this.parameterForm.invalid) {
      this.toastr.error('Please fill all required fields correctly.', 'Validation Error');
      console.log('Form errors:', this.parameterForm.errors);
      console.log('Form value:', this.parameterForm.value);
      
      // Mark all fields as touched to show validation errors
      Object.keys(this.parameterForm.controls).forEach(key => {
        const control = this.parameterForm.get(key);
        if (control?.invalid) {
          console.log(`Field ${key} is invalid:`, control.errors);
          control.markAsTouched();
        }
      });
      return;
    }

    const formValue = this.parameterForm.value;
    console.log('Form value before processing:', formValue);
    
    const parameter = {
      sNo: this.isEditingParameter() ? this.parameters()[this.editingParameterIndex()].sNo : this.parameters().length + 1,
      parameterName: formValue.parameterName,
      parameterLabel: formValue.parameterLabel,
      dataType: formValue.dataType,
      inputType: formValue.inputType,
      selectOptions: formValue.selectOptions,
      dataSource: formValue.dataSource,
      formatPattern: formValue.formatPattern,
      isRequired: formValue.isRequired ? 'Yes' : 'No',
      isVisible: formValue.isVisible ? 'Yes' : 'No',
      isReadonly: formValue.isReadonly ? 'Yes' : 'No',
      minLength: formValue.minLength,
      maxLength: formValue.maxLength,
      minValue: formValue.minValue,
      maxValue: formValue.maxValue,
      defaultValue: formValue.defaultValue,
      parameterOrder: formValue.parameterOrder,
      dependsOnParameter: formValue.dependsOnParameter,
      helpText: formValue.helpText,
    };

    console.log('Parameter object created:', parameter);

    if (this.isEditingParameter()) {
      // Update existing parameter
      const currentParams = [...this.parameters()];
      currentParams[this.editingParameterIndex()] = parameter;
      this.parameters.set(currentParams);
      this.toastr.success('Parameter updated successfully.', 'Success');
    } else {
      // Add new parameter
      this.parameters.set([...this.parameters(), parameter]);
      this.toastr.success('Parameter added successfully.', 'Success');
    }

    this.isParameterModalOpen.set(false);
  }

  /**
   * Cancel parameter form
   */
  onCancelParameter() {
    this.isParameterModalOpen.set(false);
  }

  onIdBoxChanged(value: string): void {
    console.log('IdBox changed:', value);
  }

  /**
   * Check if a format is selected
   */
  isFormatSelected(formatKey: string): boolean {
    const formats = this.reportForm.get('outputFormats')?.value;
    return Array.isArray(formats) && formats.includes(formatKey);
  }

  /**
   * Handle output format checkbox change
   */
  onOutputFormatChange(event: any, formatKey: string) {
    const currentFormats = this.reportForm.get('outputFormats')?.value || [];
    
    if (event.target.checked) {
      // Add format if not already present
      if (!currentFormats.includes(formatKey)) {
        this.reportForm.patchValue({
          outputFormats: [...currentFormats, formatKey]
        });
      }
    } else {
      // Remove format
      this.reportForm.patchValue({
        outputFormats: currentFormats.filter((f: string) => f !== formatKey)
      });
    }
  }

  /**
   * Handle file upload
   */
  onFileSelected(files: File[]) {
    if (files && files.length > 0) {
      this.selectedReportFile = files[0];
      this.reportForm.patchValue({
        reportFileName: files[0].name,
      });
      this.toastr.success(`File "${files[0].name}" selected.`, 'File Selected');
    }
  }

  /**
   * Save report
   */
  onSave() {
    if (this.reportForm.invalid) {
      this.toastr.error('Please fill all required fields correctly.', 'Validation Error');
      Object.keys(this.reportForm.controls).forEach(key => {
        const control = this.reportForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      return;
    }

    if (this.parameters().length === 0) {
      this.toastr.warning('Please add at least one parameter for the report.', 'Warning');
      return;
    }

    this.loading.set(true);

    const formValue = this.reportForm.value;
    
    // Prepare ReportDTO
    const reportDTO: ReportDTO = {
      reportName: formValue.reportName,
      functionId: formValue.functionId,
      dataSourceType: formValue.dataSourceType,
      databaseConnectionId: formValue.databaseConnectionId || undefined,
      apiEndpointId: formValue.apiEndpointId || undefined,
      outputFormats: formValue.outputFormats,
      isVisible: formValue.isVisible,
      autoGenPeriod: formValue.autoGenPeriod || "D",
      genBeforeEod: formValue.genBeforeEod,
      parameters: this.parameters().map(param => ({
        parameterName: param.parameterName,
        parameterLabel: param.parameterLabel,
        dataType: param.dataType,
        inputType: param.inputType,
        selectOptions: param.selectOptions,
        dataSource: param.dataSource,
        formatPattern: param.formatPattern,
        isRequired: param.isRequired === 'Yes',
        isVisible: param.isVisible === 'Yes',
        isReadonly: param.isReadonly === 'Yes',
        minLength: param.minLength,
        maxLength: param.maxLength,
        minValue: param.minValue,
        maxValue: param.maxValue,
        defaultValue: param.defaultValue,
        parameterOrder: param.sNo,
        dependsOnParameter: param.dependsOnParameter,
        helpText: param.helpText
      }))
    };

    // Call API to create report
    this.reportService.create(reportDTO, this.selectedReportFile || undefined).subscribe({
      next: (response) => {
        this.toastr.success('Report registered successfully!', 'Success');
        this.currentReportId.set(response.id!);
        
        // Update button visibility for edit mode
        BUTTON_VISIBILITY.set({
          save: false,
          update: true,
          view: false,
          delete: true,
          exit: false,
          reset: true,
        });
        
        // Refresh report list
        this.loadReports();
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error saving report:', err);
        this.toastr.error('Failed to save report. Please try again.', 'Error');
        this.loading.set(false);
      }
    });
  }

  /**
   * Update existing report
   */
  onUpdate() {
    console.log("this.reportForm: ", this.reportForm)
    if (this.reportForm.invalid) {
      this.toastr.error('Please fill all required fields correctly.', 'Validation Error');
      Object.keys(this.reportForm.controls).forEach(key => {
        const control = this.reportForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      return;
    }

    const reportId = this.currentReportId();
    if (!reportId) {
      this.toastr.error('No report selected for update.', 'Error');
      return;
    }

    if (this.parameters().length === 0) {
      this.toastr.warning('Please add at least one parameter for the report.', 'Warning');
      return;
    }

    this.loading.set(true);

    const formValue = this.reportForm.value;
    
    // Prepare ReportDTO
    const reportDTO: ReportDTO = {
      reportName: formValue.reportName,
      functionId: formValue.functionId,
      dataSourceType: formValue.dataSourceType,
      databaseConnectionId: formValue.databaseConnectionId || undefined,
      apiEndpointId: formValue.apiEndpointId || undefined,
      outputFormats: formValue.outputFormats,
      isVisible: formValue.isVisible,
      autoGenPeriod: formValue.autoGenPeriod || undefined,
      genBeforeEod: formValue.genBeforeEod,
      parameters: this.parameters().map(param => ({
        parameterName: param.parameterName,
        parameterLabel: param.parameterLabel,
        dataType: param.dataType,
        inputType: param.inputType,
        selectOptions: param.selectOptions,
        dataSource: param.dataSource,
        formatPattern: param.formatPattern,
        isRequired: param.isRequired === 'Yes',
        isVisible: param.isVisible === 'Yes',
        isReadonly: param.isReadonly === 'Yes',
        minLength: param.minLength,
        maxLength: param.maxLength,
        minValue: param.minValue,
        maxValue: param.maxValue,
        defaultValue: param.defaultValue,
        parameterOrder: param.sNo,
        dependsOnParameter: param.dependsOnParameter,
        helpText: param.helpText
      }))
    };

    // Call API to update report
    this.reportService.update(reportId, reportDTO, this.selectedReportFile || undefined).subscribe({
      next: (response) => {
        this.toastr.success('Report updated successfully!', 'Success');
        
        // Refresh report list
        this.loadReports();
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error updating report:', err);
        this.toastr.error('Failed to update report. Please try again.', 'Error');
        this.loading.set(false);
      }
    });
  }

  /**
   * Delete report
   */
  onDelete() {
    const reportId = this.currentReportId();
    if (!reportId) {
      this.toastr.error('No report selected for deletion.', 'Error');
      return;
    }

    if (!confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      return;
    }

    this.loading.set(true);

    this.reportService.delete(reportId).subscribe({
      next: () => {
        this.toastr.success('Report deleted successfully!', 'Success');
        
        // Refresh and reset form
        this.onRefresh();
        this.loadReports();
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error deleting report:', err);
        this.toastr.error('Failed to delete report. Please try again.', 'Error');
        this.loading.set(false);
      }
    });
  }

  /**
   * Refresh form
   */
  onRefresh() {
    this.reportForm.reset({
      outputFormats: ['PDF'],
      isVisible: true,
      genBeforeEod: false,
      autoGenPeriod: '',
    });
    this.parameters.set([]);
    this.currentReportId.set(null);
    this.selectedReportFile = null;
    
    // Reset button visibility
    BUTTON_VISIBILITY.set({
      save: true,
      update: false,
      view: false,
      delete: false,
      exit: false,
      reset: true,
    });
    
    this.toastr.info('Form has been reset.', 'Refresh');
  }
}
