import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  effect,
  inject,
  Input,
  OnInit,
  signal,
  TemplateRef,
  ViewChild,
  WritableSignal
} from '@angular/core';
import {AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Button } from '../../../shared/components/input-types/button/button';
import { SelectOptionField } from '../../../shared/components/input-types/select-option-field/select-option-field';
import { DataGridComponent, TableRowDesigner } from '../../../shared/components/data-grid/index';
import { ExpansionPanelHeader } from '../../../shared/components/expansion-panel-header/expansion-panel-header';
import { DataSelectionModal } from '../../../shared/components/data-selection-modal/data-selection-modal';
import { BUTTON_VISIBILITY, ONCLICK_RESET, ONCLICK_SAVE } from '../../../shared/constant/button-signals.constant';
import { catchError, debounceTime, distinctUntilChanged, forkJoin, of } from 'rxjs';
import { DropdownOption } from '../../../shared/components/data-grid/data-grid';
import { WorkflowDesignerService } from '../workflow-designer/services/workflow-designer.service';
import { AmountInput } from '../../../shared/components/input-types/amount-input/amount-input';
import { TextBaseInput } from '../../../shared/components/input-types/text-base-input/text-base-input';
import {AssignWorkflowService} from '../../service/assign-workflow.service';


interface QueryRow {
  id: number;
  action: string;
  andOr: string;
  fieldName: string;
  operator: string;
  value: string;
  fieldType?: 'N' | 'S' | 'D' | 'B';
  fieldValueOptions?: Record<string, string> | null;
}

export interface Condition {
  id: number;
  applicationName: string;
  moduleName: string;
  functionName: string;
  priority: number;
  condition: string;
  conditionalWorkflow: string;
  conditionalWorkflowId: number;
  queryRowsData?: any[];
}

@Component({
  selector: 'app-assign-workflow',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    Button,
    SelectOptionField,
    CommonModule,
    DataGridComponent,
    ExpansionPanelHeader,
    AmountInput,
    TextBaseInput
  ],
  templateUrl: './assign-workflow.html',
  styleUrl: './assign-workflow.scss'
})
export class AssignWorkflow implements OnInit {

  masterFrmGroup!: FormGroup;
  conditionFrmGroup!: FormGroup;
  toastr = inject(ToastrService);
  businessHeaderPanel: WritableSignal<boolean> = signal(true);
  onClickSave = ONCLICK_SAVE;
  onClickReset = ONCLICK_RESET;
  isAddConditionDisabled = true;
  isEditMode: boolean = false;
  editingConditionId: number | null = null;
  applicationOptions: { key: string, value: string }[] = [];
  moduleOptions: { key: string, value: string }[] = [];
  functionOptions: { key: string, value: string }[] = [];
  workflowOptions: { key: string, value: string }[] = [];
  fieldOptions: { key: string, value: string }[] = [];
  fieldValueList: any[] = [];
  getListByFunctionId: any[] = [];
  operatorMap: any = {};
  showConditionSection = signal(false);
  isEditModeLoading : boolean= false;

  // Query Rows Signal
  queryRows: WritableSignal<QueryRow[]> = signal([
    { id: 1, action: '', andOr: '', fieldName: '', operator: '', value: '' }
  ]);

  // Conditions List Signal
  conditionsList: WritableSignal<Condition[]> = signal([]);

  // actionOptions = [
  //   { key: 'add', value: 'Add Row' },
  //   { key: 'remove', value: 'Remove Row' }
  // ];

  andOrOptions = [
    { key: 'and', value: 'And' },
    { key: 'or', value: 'Or' }
  ];


  operatorOptions = [
    { key: '==', value: '==' },
    { key: '!=', value: '!=' },
    { key: '>', value: '>' },
    { key: '<', value: '<' },
    { key: '>=', value: '>=' },
    { key: '<=', value: '<=' }
  ];

  operatorOptionsLimited = [
    { key: '==', value: '==' },
    { key: '!=', value: '!=' }
  ];

  convertToDropdownOptions(fieldValueObj: any): { key: string, value: string }[] {

    if (!fieldValueObj || typeof fieldValueObj !== 'object') {
      console.log('Invalid fieldValueObj, returning empty array');
      return [];
    }

    const options = Object.keys(fieldValueObj).map(key => {
      return {
        key: key,
        value: fieldValueObj[key]
      };
    });
    return options;
  }

  // Grid Configuration
  sampleTransactions = signal<Condition[]>([]);

  transactionDropdownColumns = signal(['status', 'priority']);

  transactionDropdownOptions = signal<Record<string, DropdownOption[]>>({
    status: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' }
    ],
    priority: [
      { value: '1', label: 'Priority 1' },
      { value: '2', label: 'Priority 2' },
      { value: '3', label: 'Priority 3' }
    ]
  });

  transactionRowDesigners = signal<TableRowDesigner[]>([
    {
      condition: (item: any) => item.priority === 1,
      backgroundColor: '#fee2e2',
      textColor: '#dc2626'
    },
    {
      condition: (item: any) => item.priority === 2,
      backgroundColor: '#fef3c7',
      textColor: '#d97706'
    }
  ]);

  constructor(
    private formBuilder: FormBuilder,
    private workflowService: WorkflowDesignerService,
    private assignflowService: AssignWorkflowService,
    private cdr: ChangeDetectorRef
  ) {
    BUTTON_VISIBILITY.set({
      save: true,
      update: false,
      view: false,
      delete: false,
      exit: false,
      reset: true,
    });

    effect(() => {
      if (this.onClickSave()) {
        this.save();
        ONCLICK_SAVE.set(false);
      }
      if (this.onClickReset()) {
        this.reset();
        ONCLICK_RESET.set(false);
      }
    });
  }

  ngOnInit(): void {
    this.initializeForms();
    this.loadInitialData();
    this.setupOthersDropdowns();
  }

  private initializeForms(): void {
    // Master Form
    this.masterFrmGroup = this.formBuilder.group({
      appId: [''],
      moduleId: [''],
      functionId: ['', Validators.required],
      workflowId: ['', Validators.required]
    });

    // Condition Form
    this.conditionFrmGroup = this.formBuilder.group({
      conditionalWorkflowId: ['', Validators.required],
      rows: this.formBuilder.array([this.buildRow()])
    });
  }

  private buildRow() {
    return this.formBuilder.group({
      id: [0],
      action: [''],
      andOr: [''],
      fieldName: [''],
      operator: [''],
      value: [''],
      fieldType: [''],            // "N", "S", "D", "B"
      fieldValueOptions: [[]],
    });
  }

  getRowFormGroup(index: number): FormGroup {
    const rowsArray = this.conditionFrmGroup.get('rows') as FormArray;
    return rowsArray.at(index) as FormGroup;
  }

  /*private syncFormArrayWithSignal(): void {
    const rowsArray = this.conditionFrmGroup.get('rows') as FormArray;
    const updatedRows: QueryRow[] = [];

    for (let i = 0; i < rowsArray.length; i++) {
      const rowForm = rowsArray.at(i) as FormGroup;
      const currentSignalRow = this.queryRows()[i];

      const updatedRow: QueryRow = {
        id: i + 1,
        action: currentSignalRow?.action || '',
        andOr: i === 0 ? '' : (currentSignalRow?.andOr || ''),
        field: rowForm.get('fieldName')?.value || currentSignalRow?.field || '',
        operator: rowForm.get('operator')?.value || currentSignalRow?.operator || '',
        value: rowForm.get('value')?.value || currentSignalRow?.value || '',
        fieldType: currentSignalRow?.fieldType,
        fieldValueOptions: currentSignalRow?.fieldValueOptions
      };

      updatedRows.push(updatedRow);
    }

    this.queryRows.set(updatedRows);
  }*/
  private syncFormArrayWithSignal(): void {
    const rowsArray = this.conditionFrmGroup.get('rows') as FormArray;

    const rows = rowsArray.controls.map((fg, i) => {
      const row = fg.value;

      // Look up field metadata
      const fieldMeta = this.fieldValueList.find(f => f.fieldName === row.fieldName);

      return {
        id: i + 1,
        action: row.action || '',
        andOr: row.andOr || (i === 0 ? '' : 'and'),
        fieldName: row.fieldName || '',
        operator: row.operator || '',
        value: row.value || '',
        fieldType: fieldMeta?.fieldType || '',                   // field type from metadata
        fieldValueOptions: fieldMeta?.fieldValue || null
      };
    });

    this.queryRows.set(rows);
    this.cdr.detectChanges();
  }

  private addRowToFormArray(): void {
    const rowsArray = this.conditionFrmGroup.get('rows') as FormArray;
    rowsArray.push(this.buildRow());
    this.syncFormArrayWithSignal();
  }

  private removeRowFromFormArray(rowIndex: number): void {
    const rowsArray = this.conditionFrmGroup.get('rows') as FormArray;
    rowsArray.removeAt(rowIndex);
    this.syncFormArrayWithSignal();
  }

  private loadInitialData(): void {

    // Fetch Applications
    this.workflowService.getApplications()
      .pipe(
        catchError((error) => {
          console.error('Error loading applications:', error);
          return of([]);
        })
      )
      .subscribe((applications) => {
        this.applicationOptions = applications.map(app => ({
          key: app.appId.toString(),
          value: app.appName
        }));
      });

  }

  private setupOthersDropdowns(): void {
    // Listen to Application ID changes
    this.masterFrmGroup.get('appId')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(appId => {
        if (appId) {
          this.onApplicationChange(appId);
        } else {
          // Reset dependent dropdowns
          this.moduleOptions = [];
          this.functionOptions = [];
          this.workflowOptions = [];
          this.masterFrmGroup.patchValue({
            moduleId: '',
            functionId: '',
            workflowId: '',
            conditionalWorkflowId: ''
          });
        }
      });

    // Listen to Module ID changes
    this.masterFrmGroup.get('moduleId')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(moduleId => {
        const appId = this.masterFrmGroup.get('appId')?.value;
        if (appId && moduleId) {
          this.onModuleChange(appId, moduleId);
        } else {
          // Reset function dropdown
          this.functionOptions = [];
          this.masterFrmGroup.patchValue({
            functionId: ''
          });
        }
      });

    // Listen to Function ID changes
    this.masterFrmGroup.get('functionId')?.valueChanges
      .pipe(
        debounceTime(200),
        distinctUntilChanged()
      )
      .subscribe(functionId => {
        const funId = this.masterFrmGroup.get('functionId')?.value;
        if (funId) {
          this.onFunctionChange(funId);
        } else {
          this.functionOptions = [];
          this.masterFrmGroup.patchValue({
            functionId: ''
          });
        }
      });
  }

  private onApplicationChange(appId: string): void {

    this.masterFrmGroup.patchValue({
      moduleId: '',
      functionId: '',
      workflowId: '',
      conditionalWorkflowId: ''
    });

    // Load Modules
    this.workflowService.getModules(Number(appId))
      .pipe(
        catchError((error) => {
          console.error('Error loading modules:', error);
          return of([]);
        })
      )
      .subscribe((modules) => {
        this.moduleOptions = modules.map(module => ({
          key: module.moduleId.toString(),
          value: module.moduleName
        }));
      });

    // Load Workflows based on Application ID
    this.loadWorkflowsByAppId(Number(appId));
  }

  private onModuleChange(appId: string, moduleId: string): void {

    this.masterFrmGroup.patchValue({
      functionId: ''
    });

    // Load Functions
    this.workflowService.getFunctions(Number(appId), moduleId)
      .pipe(
        catchError((error) => {
          console.error('Error loading functions:', error);
          return of([]);
        })
      )
      .subscribe((functions) => {
        this.functionOptions = functions.map(func => ({
          key: func.functionId.toString(),
          value: func.functionName
        }));
      });
  }

  private loadWorkflowsByAppId(appId: number): void {
    this.assignflowService.getWorkflowsByAppId(appId)
      .pipe(
        catchError((error) => {
          console.error('Error loading workflows:', error);
          return of([]);
        })
      )
      .subscribe((workflows) => {
        this.workflowOptions = workflows.map(workflow => ({
          key: workflow.workflowId.toString(),
          value: workflow.workflowName
        }));
        const funId = this.masterFrmGroup.get('functionId')?.value;
        if (funId) {
          this.patchWorkflowBasedOnFunction(funId);
        }
      });
  }

  private patchWorkflowBasedOnFunction(funId: string | number) {
    const functionId = Number(funId);

    this.getListByFunctionId = [];

    this.assignflowService.getWorkflowFunctionMapsByFunction(functionId)
      .pipe(
        catchError((error) => {
          console.error('Error loading workflow-function maps:', error);
          return of([]);
        })
      )
      .subscribe((response) => {

        this.getListByFunctionId = response;

        const hasData = response && response.length > 0;
        this.isAddConditionDisabled = !hasData;

        if (!hasData) {
          this.showConditionSection.set(false);
        }

        const wfId = response?.[0]?.workflowId?.toString() || '';

        // data petch
        if (this.workflowOptions.some(o => o.key === wfId)) {
          this.masterFrmGroup.patchValue({ workflowId: wfId });
        } else {
          this.masterFrmGroup.patchValue({ workflowId: '' });
        }

        if (!this.workflowOptions || this.workflowOptions.length === 0) {
          console.warn('workflowOptions empty, cannot map conditionalWorkflow yet');
          return;
        }

        // condition list show in data grid
        const conditionList = response
          .filter(item => item.condition !== null)
          .map((item, index) => ({
            id: item.workflowFunctionMapId,
            workflowFunctionMapId: item.workflowFunctionMapId,
            applicationName: this.getOptionLabel(this.applicationOptions, this.masterFrmGroup.get('appId')?.value),
            moduleName: this.getOptionLabel(this.moduleOptions, this.masterFrmGroup.get('moduleId')?.value),
            functionName: this.getOptionLabel(this.functionOptions, this.masterFrmGroup.get('functionId')?.value),
            priority: item.priority,
            condition: item.condition,
            conditionalWorkflow: this.getOptionLabel(this.workflowOptions, item.workflowId),
            conditionalWorkflowId: item.workflowId
          }));

        this.sampleTransactions.set(conditionList);
        this.conditionsList.set(conditionList);
      });
  }

  private onFunctionChange(funId: string): void {
    if (!funId) return;

    this.patchWorkflowBasedOnFunction(funId);
  }

  toggleConditionSection(): void {

    if (this.isAddConditionDisabled) return;

    this.showConditionSection.update(v => !v);

    if (this.showConditionSection()) {
      const funId = this.masterFrmGroup.get('functionId')?.value;
      if (!funId) return;

      // const funId = 901003;

      this.assignflowService.getConditionFieldsByFunctionId(funId)
        .pipe(
          catchError((error) => {
            console.error('Error loading condition fields:', error);
            return of([]);
          })
        )
        .subscribe((response: any[]) => {
          this.fieldValueList = response;
          this.fieldOptions = response.map(item => ({
            key: item.fieldName,
            value: item.fieldLabel
          }));
        });
      //this.testPopulateQueryRows();
    }
  }

  // Edit mode exit
  exitEditMode(): void {
    this.isEditMode = false;
    this.editingConditionId = null;
    this.resetConditionForm();
  }

  // Condition Form reset
  private resetConditionForm(): void {
    this.clearAllQueryRows();

    this.conditionFrmGroup.patchValue({
      conditionalWorkflowId: ''
    });
    // Form status reset
    this.conditionFrmGroup.markAsPristine();
    this.conditionFrmGroup.markAsUntouched();
  }

  // Condition priority find
  private getConditionPriority(conditionId: number): number {
    const condition = this.conditionsList().find(c => c.id === conditionId);
    return condition?.priority || this.conditionsList().length + 1;
  }

  // Add Condition to Grid
  addCurrentFormToGrid(): void {

    const masterValid = this.validateMasterSection();
    if (!masterValid) {
      this.toastr.error('Please fill required fields', 'Validation Error');
      return;
    }

    const rowsValid = this.validateFormArrayRows();
    if (!rowsValid) {
      this.toastr.error('Fill up condition fields', 'Incomplete Query');
      return;
    }

    const conditionString = this.buildConditionString();

    const masterValues = this.masterFrmGroup.value;
    const conditionValues = this.conditionFrmGroup.value;

    const currentList = this.conditionsList();

    const newCondition: Condition = {
      id: currentList.length + 1,
      applicationName: this.getOptionLabel(this.applicationOptions, masterValues.appId),
      moduleName: this.getOptionLabel(this.moduleOptions, masterValues.moduleId),
      functionName: this.getOptionLabel(this.functionOptions, masterValues.functionId),
      priority: currentList.length + 1,
      condition: conditionString,
      conditionalWorkflow: this.getOptionLabel(
        this.workflowOptions,
        conditionValues.conditionalWorkflowId
      ),
      conditionalWorkflowId: conditionValues.conditionalWorkflowId
    };

    this.conditionsList.set([...currentList, newCondition]);
    this.sampleTransactions.set([...currentList, newCondition]);
    this.resetQueryBuilder();
  }

  private getIdFromLabel(options: any[], label: string | null): number | null {
    const found = options.find(opt => opt.label === label);
    return found ? found.value : null;
  }
  populateFormFromCondition(selected: Condition): void {

    // 1. Populate Master Form
    this.masterFrmGroup.patchValue({
      appId: this.getIdFromLabel(this.applicationOptions, selected.applicationName),
      moduleId: this.getIdFromLabel(this.moduleOptions, selected.moduleName),
      functionId: this.getIdFromLabel(this.functionOptions, selected.functionName)
    });

    // 2. Populate Condition Form
    this.conditionFrmGroup.patchValue({
      conditionalWorkflowId: selected.conditionalWorkflowId
    });

    // 3. Repopulate Query Builder Rows
    this.rebuildQueryFromConditionString(selected.condition);
  }
  rebuildQueryFromConditionString(condition: string): void {
    const parsedRows = this.parseConditionString(condition);
    const formArray = this.queryFormArray();
    formArray.clear();

    const rows: QueryRow[] = parsedRows.map((r, index) => {
      // Look up the field metadata
      const fieldMeta = this.fieldValueList.find(f => f.fieldName === r.fieldName);

      const rowForm = this.formBuilder.group({
        andOr: [r.andOr || (index === 0 ? '' : 'and')],
        fieldName: [r.fieldName],
        operator: [r.operator],
        value: [r.value]
      });

      formArray.push(rowForm);

      // Return row object to update queryRows signal
      return {
        id: index + 1,
        action: '',
        andOr: r.andOr || (index === 0 ? '' : 'and'),
        fieldName: r.fieldName,
        operator: r.operator,
        value: r.value,
        fieldType: fieldMeta?.fieldType || '',                 // important for template
        fieldValueOptions: fieldMeta?.fieldValue || null      // important for dropdowns
      };
    });

    this.queryRows.set(rows);
    this.cdr.detectChanges();
  }




  onRowSelected(row: Condition) {
    this.populateFormFromCondition(row);
  }

  queryFormArray(): FormArray {
    return this.conditionFrmGroup.get('rows') as FormArray;
  }

  testPopulateQueryRows(): void {
    const fakeCondition: Condition = {
      id: 1,
      applicationName: 'Centrino',
      moduleName: 'metadata',
      functionName: 'Function',
      priority: 1,
      condition: "authNo > 2 AND isDocAtt == true",
      conditionalWorkflow: 'Test Workflow',
      conditionalWorkflowId: 2
    };

    this.populateFormFromCondition(fakeCondition);
  }


  /*  private getOptionLabel(options: any[], key: string): string {
      if (!key) {
        return 'N/A';
      }
      const option = options.find(opt => opt.key === key);
      return option?.value || 'N/A';
    }*/
  private getOptionLabel(options: any[], key: any): string {
    if (!key) return 'N/A';

    const keyStr = key.toString();

    const option = options.find(opt => opt.key === keyStr);
    return option?.value ?? 'N/A';
  }

  // Master Section Validation
  private validateMasterSection(): boolean {
    const masterValues = this.masterFrmGroup.value;
    const conditionalWorkflowId = this.conditionFrmGroup.get('conditionalWorkflowId')?.value;

    const isValid = !!(masterValues.appId &&
      masterValues.moduleId &&
      masterValues.functionId &&
      conditionalWorkflowId);
    return isValid;
  }

  // FormArray Rows Validation
  private validateFormArrayRows(): boolean {
    const rowsArray = this.conditionFrmGroup.get('rows') as FormArray;

    for (let i = 0; i < rowsArray.length; i++) {
      const rowGroup = rowsArray.at(i) as FormGroup;
      const fieldName = rowGroup.get('fieldName')?.value;
      const operator = rowGroup.get('operator')?.value;
      const value = rowGroup.get('value')?.value;

      if (!fieldName || !operator || !value) {
        console.log(`Row ${i} validation FAILED`);
        return false;
      }
    }
    return true;
  }

  // Build Condition String from Query Rows
  private buildConditionString(): string {
    const rowsArray = this.conditionFrmGroup.get('rows') as FormArray;
    const conditionParts: string[] = [];

    for (let i = 0; i < rowsArray.length; i++) {
      const rowGroup = rowsArray.at(i) as FormGroup;
      const field = rowGroup.get('fieldName')?.value;
      const operator = rowGroup.get('operator')?.value;
      const value = rowGroup.get('value')?.value;
      const andOr = rowGroup.get('andOr')?.value;

      if (field && operator && value) {
        let conditionPart = `${field} ${operator} ${value}`;

        if (i > 0 && andOr) {
          conditionPart = `${andOr.toUpperCase()} ${conditionPart}`;
        }

        conditionParts.push(conditionPart);
      }
    }

    return conditionParts.join(' ');
  }

  // Update Query Row Field
  updateQueryRow(rowId: number, field: string, value: string): void {
    const currentRows = this.queryRows();
    const updatedRows = currentRows.map(row =>
      row.id === rowId ? { ...row, [field]: value } : row
    );
    this.queryRows.set(updatedRows);
  }

  // Handle Action Dropdown Change
  onActionChange(event: any, rowId: number): void {
    const action = event.selectedKey;
    if (action === 'add') {
      this.addQueryRow();
    } else if (action === 'remove') {
      this.removeQueryRow(rowId);
    }
  }

  onFieldChange(event: any, rowId: number) {
    const selectedField = event.selectedKey;
    console.log('Field Changed:', selectedField);

    const field = this.fieldValueList.find(x => x.fieldName === selectedField);
    if (!field) return;

    const fieldType = field.fieldType;
    this.operatorMap[rowId] = fieldType === 'N' ? this.operatorOptions : this.operatorOptionsLimited;

    const rowIndex = this.queryRows().findIndex(r => r.id === rowId);
    if (rowIndex === -1) return;

    const rowsArray = this.conditionFrmGroup.get('rows') as FormArray;
    const rowForm = rowsArray.at(rowIndex) as FormGroup;

    rowForm.get('fieldName')?.setValue(selectedField);
    rowForm.get('operator')?.setValue('');
    rowForm.get('value')?.setValue('');

    const rows = [...this.queryRows()];
    rows[rowIndex] = {
      ...rows[rowIndex],
      fieldName: selectedField,
      operator: '',
      value: '',
      fieldType: fieldType,
      fieldValueOptions: field.fieldValue || null
    };
    this.queryRows.set(rows);

    this.cdr.detectChanges();
  }

  // onFieldChange(event: any, rowId: number) {
  //   if (this.isEditModeLoading) return;   // <<< IMPORTANT FIX
  //
  //   const selectedField = event.selectedKey;
  //   console.log('Field Changed:', selectedField);
  //
  //   const field = this.fieldValueList.find(x => x.fieldName === selectedField);
  //   if (!field) return;
  //
  //   const fieldType = field.fieldType;
  //   this.operatorMap[rowId] =
  //     fieldType === 'N' ? this.operatorOptions : this.operatorOptionsLimited;
  //
  //   const rowsArray = this.conditionFrmGroup.get('rows') as FormArray;
  //   const rowIndex = rowsArray.controls.findIndex(r => r.value.id === rowId);
  //   if (rowIndex === -1) return;
  //
  //   const rowForm = rowsArray.at(rowIndex) as FormGroup;
  //   rowForm.patchValue({
  //     fieldName: selectedField,
  //     operator: '',
  //     value: '',
  //     fieldType,
  //     fieldValueOptions: field.fieldValue || []
  //   });
  //
  //   this.refreshQueryRowsFromForm();
  // }

  onAndOrChange(event: any, rowId: number): void {
    const rowIndex = this.queryRows().findIndex(r => r.id === rowId);
    if (rowIndex !== -1) {
      const rowsArray = this.conditionFrmGroup.get('rows') as FormArray;
      const rowForm = rowsArray.at(rowIndex) as FormGroup;
      rowForm.get('andOr')?.setValue(event.selectedKey);
      this.syncFormArrayWithSignal();
    }
  }

  onOperatorChange(event: any, rowId: number): void {
    const rowIndex = this.queryRows().findIndex(r => r.id === rowId);
    if (rowIndex !== -1) {
      const rowsArray = this.conditionFrmGroup.get('rows') as FormArray;
      const rowForm = rowsArray.at(rowIndex) as FormGroup;
      rowForm.get('operator')?.setValue(event.selectedKey);
      this.syncFormArrayWithSignal();
    }
  }

  onValueChange(event: any, rowId: number): void {
    const rowIndex = this.queryRows().findIndex(r => r.id === rowId);
    if (rowIndex !== -1) {
      const rowsArray = this.conditionFrmGroup.get('rows') as FormArray;
      const rowForm = rowsArray.at(rowIndex) as FormGroup;

      let value;
      if (event.selectedKey !== undefined) {
        value = event.selectedKey;
      } else if (event.value !== undefined) {
        value = event.value;
      } else {
        value = event;
      }

      rowForm.get('value')?.setValue(value);
      this.syncFormArrayWithSignal();
    }
  }

  private findKeyByValue(options: any[], value: string): string {
    const option = options.find(opt => opt.value === value);
    return option?.key || '';
  }

  // Add Query Row
  addQueryRow(): void {
    this.addRowToFormArray();

    if (!this.isEditMode) {
      const currentRows = this.queryRows();
      if (currentRows.length > 1) {
        const lastRowIndex = currentRows.length - 1;
        const rowsArray = this.conditionFrmGroup.get('rows') as FormArray;
        const newRowForm = rowsArray.at(lastRowIndex) as FormGroup;

        newRowForm.patchValue({
          andOr: ''
        });

        const updatedRows = [...this.queryRows()];
        updatedRows[lastRowIndex] = {
          ...updatedRows[lastRowIndex],
          andOr: ''
        };
        this.queryRows.set(updatedRows);
      }
    }
  }

  // Remove Query Row
  removeQueryRow(rowId: number): void {
    const currentRows = this.queryRows();
    if (currentRows.length > 1) {
      const rowIndex = currentRows.findIndex(r => r.id === rowId);
      if (rowIndex !== -1) {
        this.removeRowFromFormArray(rowIndex);

      }
    } else {

    }
  }


  // Reset Query Builder
  private resetQueryBuilder(): void {

    const rowsArray = this.conditionFrmGroup.get('rows') as FormArray;
    while (rowsArray.length > 1) {
      rowsArray.removeAt(1);
    }

    const firstRow = rowsArray.at(0) as FormGroup;
    firstRow.patchValue({
      fieldName: '',
      operator: '',
      value: '',
      andOr: ''
    });

    firstRow.markAsPristine();
    firstRow.markAsUntouched();
    firstRow.setErrors(null);

    // Signal reset
    this.queryRows.set([
      { id: 1, action: '', andOr: '', fieldName: '', operator: '', value: '', fieldType: undefined, fieldValueOptions: null }
    ]);

    // ৫. Conditional workflow reset
    this.conditionFrmGroup.patchValue({
      conditionalWorkflowId: ''
    });

    // ৬. Conditional workflow control
    const conditionalWorkflowControl = this.conditionFrmGroup.get('conditionalWorkflowId');
    if (conditionalWorkflowControl) {
      conditionalWorkflowControl.markAsPristine();
      conditionalWorkflowControl.markAsUntouched();
      conditionalWorkflowControl.setErrors(null);
    }

    // ৭. Operator map reset
    this.operatorMap = {};

  }

  save(): void {

    const functionId = Number(this.masterFrmGroup.get('functionId')?.value);
    const defaultWorkflowId = Number(this.masterFrmGroup.get('workflowId')?.value);

    if (!functionId) {
      return;
    }

    const existingData = (this.getListByFunctionId || []).map(d => ({
      ...d
    }));

    const payload: any[] = [];
    existingData
      .filter(d => d.priority === 0)
      .forEach(d => payload.push({ ...d }));
    if (defaultWorkflowId && !existingData.some(d => d.priority === 0 && d.workflowId === defaultWorkflowId)) {
      payload.push({
        functionId: functionId,
        condition: null,
        priority: 0,
        workflowId: defaultWorkflowId
      });
    }

    this.conditionsList().forEach((c: Condition, idx: number) => {
      const priority = Number(c.priority || idx + 1);
      const workflowId = Number(c.conditionalWorkflowId);
      const condition = c.condition || null;

      const exists = existingData.some(d =>
        d.priority === priority &&
        d.workflowId === workflowId &&
        d.condition === condition
      );

      if (!exists) {
        payload.push({
          functionId: functionId,
          condition: condition,
          priority: priority,
          workflowId: workflowId
        });
      }
    });

    if (payload.length === 0) {
      return;
    }

    this.assignflowService.createWorkflowFunctionMap(payload)
      .subscribe({
        next: (res) => {
          this.toastr.success("Workflow saved successfully!", "Success");
          //  console.log('show json: ', res);
          // this.onFunctionChange(functionId.toString());
        },
        error: (err) => {
          console.error(err);
          this.toastr.error("Saving failed", "Error");
        }
      });
  }

  // Reset Function
  reset(): void {
    this.masterFrmGroup.reset();
    this.conditionFrmGroup.reset();

    const rowsArray = this.conditionFrmGroup.get('rows') as FormArray;
    while (rowsArray.length > 1) {
      rowsArray.removeAt(1);
    }
    const firstRow = rowsArray.at(0) as FormGroup;
    firstRow.reset();

    this.queryRows.set([
      { id: 1, action: '', andOr: 'and', fieldName: '', operator: '', value: '' }
    ]);
    this.conditionsList.set([]);
    this.sampleTransactions.set([]);
  }

/*  onEditCondition(serializedData: string): void {
    try {
      const condition: Condition = JSON.parse(serializedData);
      console.log('🔄 Editing Condition:', condition);

      // Activate edit mode
      this.isEditMode = true;
      this.editingConditionId = condition.id;

      // ===== Patch Master & Condition Form =====
      const masterValues = this.masterFrmGroup.value;
      const workflowId = condition.conditionalWorkflowId || this.findKeyByValue(this.workflowOptions, condition.conditionalWorkflow);
      console.log("workflowId",workflowId);
      this.conditionFrmGroup.patchValue({
        conditionalWorkflowId: workflowId
      });

      // ===== Clear existing rows =====
      const rowsArray = this.conditionFrmGroup.get('rows') as FormArray;
      while (rowsArray.length) rowsArray.removeAt(0);

      // ===== Parse condition string =====
      const conditions = condition.condition ? this.parseConditionString(condition.condition) : [];
      console.log("conditions",conditions);
      // ===== Patch rows =====
      conditions.forEach((cond, idx) => {
        const row = this.buildRow();
        row.patchValue({
          andOr: cond.andOr || '',
          fieldName: cond.fieldName,
          operator: cond.operator,
          value: cond.value
        });

        rowsArray.push(row);

        // Update operator map for dynamic operator select
        const fieldConfig = this.fieldValueList.find(f => f.fieldName === cond.fieldName);
        if (fieldConfig) {
          // this.operatorMap[row.value.id] = fieldConfig.fieldType === 'N'
          //   ? this.operatorOptions
          //   : this.operatorOptionsLimited;
          const rowId = row.value.id ?? idx + 1;
          this.operatorMap[rowId] = fieldConfig.fieldType === 'N'
            ? this.operatorOptions
            : this.operatorOptionsLimited;

        }
      });

      this.toastr.info(`Editing condition: ${condition.condition}`, 'Edit Mode');
      //this.testPopulateQueryRows();
    } catch (err) {
      console.error('Failed to edit condition:', err);
    }
  }*/
  onEditCondition(serializedData: string): void {
    try {
      const condition: Condition = typeof serializedData === 'string'
        ? JSON.parse(serializedData)
        : serializedData;
      console.log("Raw condition from grid:", condition.condition);
      this.isEditMode = true;
      this.editingConditionId = condition.id;

      // ===== Patch MASTER FORM =====
      this.masterFrmGroup.patchValue({
        appId: this.findKeyByValue(this.applicationOptions, condition.applicationName),
        moduleId: this.findKeyByValue(this.moduleOptions, condition.moduleName),
        functionId: this.findKeyByValue(this.functionOptions, condition.functionName)
      });

      // ===== Patch WORKFLOW DROPDOWN =====
      const workflowId = condition.conditionalWorkflowId ||
        this.findKeyByValue(this.workflowOptions, condition.conditionalWorkflow);

      this.conditionFrmGroup.patchValue({
        conditionalWorkflowId: workflowId?.toString() || ''
      });

      // ===== Clear existing rows =====
      const rowsArray = this.conditionFrmGroup.get('rows') as FormArray;
      while (rowsArray.length) rowsArray.removeAt(0);
      this.isEditModeLoading = true;
      // ===== Build rows from parsed condition string =====
      let parsedRows = condition.condition
        ? this.parseConditionString(condition.condition)
        : [];
      console.log("parsedRows", parsedRows);
      // --- Attach field metadata ---
      parsedRows = parsedRows.map(row => {
        const meta = this.fieldValueList.find(f => f.fieldName === row.fieldName);
        return {
          ...row,
          fieldType: meta?.fieldType || '',
          fieldValueOptions: meta?.fieldValue || []
        };
      });

     /* parsedRows.forEach((rowData: any, index: number) => {
        const row = this.buildRow();
        const fieldConfig = this.fieldValueList.find(f => f.fieldName === rowData.fieldName);

        row.patchValue({
          id: index + 1,
          action: '',
          andOr: rowData.andOr || (index === 0 ? '' : 'and'),
          fieldName: rowData.fieldName,
          operator: rowData.operator,
          value: rowData.value,
          fieldType: fieldConfig?.fieldType || '',
          fieldValueOptions: fieldConfig?.fieldValue || []
        });

        rowsArray.push(row);

        // Emit events so the UI reacts
        row.get('fieldName')?.updateValueAndValidity({ onlySelf: true, emitEvent: true });
        row.get('operator')?.updateValueAndValidity({ onlySelf: true, emitEvent: true });
        row.get('value')?.updateValueAndValidity({ onlySelf: true, emitEvent: true });

        this.operatorMap[index + 1] = fieldConfig?.fieldType === 'N'
          ? this.operatorOptions
          : this.operatorOptionsLimited;

        this.onFieldChange({ selectedKey: rowData.fieldName }, rowData.id || index + 1);
        this.onOperatorChange({ selectedKey: rowData.operator }, rowData.id || index + 1);
      });*/

      parsedRows.forEach((rowData: any, index: number) => {
        const row = this.buildRow();
        const fieldConfig = this.fieldValueList.find(f => f.fieldName === rowData.fieldName);

        const fieldType = fieldConfig?.fieldType || '';
        const fieldValueOptions = fieldConfig?.fieldValue || [];

        // Patch all values at once
        row.patchValue({
          id: index + 1,
          action: '',
          andOr: rowData.andOr || (index === 0 ? '' : 'and'),
          fieldName: rowData.fieldName,
          operator: rowData.operator,
          value: rowData.value,
          fieldType,
          fieldValueOptions
        });

        // Push to form array
        rowsArray.push(row);
        this.onFieldChange(
          { key: rowData.fieldName },   // same shape as onSelect
          rowData.id || index + 1               // row id
        );
        row.get('fieldName')?.updateValueAndValidity({ emitEvent: true });
        row.get('operator')?.updateValueAndValidity({ emitEvent: true });
        row.get('value')?.updateValueAndValidity({ emitEvent: true });
        // Update operator map BEFORE operator dropdown renders
        this.operatorMap[index + 1] = fieldType === 'N'
          ? this.operatorOptions
          : this.operatorOptionsLimited;
        //this.onFieldChange({ key: rowData.value.fieldName }, rowData.id || index + 1);
        //this.onFieldChange({ selectedKey: row.value.fieldName }, rowId);
        // this.onOperatorChange({ selectedKey: row.value.operator }, rowId);

        this.refreshQueryRowsFromForm();
        this.cdr.detectChanges();
      });
      // After all rows are patched


      this.isEditModeLoading = false;
      this.syncFormArrayWithSignal?.();
      this.cdr?.detectChanges();

      console.log('✅ Form patched from grid:', this.conditionFrmGroup.value);
    } catch (err) {
      console.error('❌ Failed to reverse patch condition:', err);
    }
  }

  private refreshQueryRowsFromForm() {
    const rowsArray = this.conditionFrmGroup.get('rows') as FormArray;
    const rows = rowsArray.controls.map((c, i) => {
      const val = c.value;
      const operatorOpts = this.operatorMap[val.id] || (val.fieldType === 'N' ? this.operatorOptions : this.operatorOptionsLimited);
      return {
        ...val,
        fieldValueOptions: val.fieldValueOptions || [],
        operatorOptions: operatorOpts
      };
    });
    this.queryRows.set(rows);
  }


/*  private refreshQueryRowsFromForm() {
    const rowsArray = this.conditionFrmGroup.get('rows') as FormArray;
    const rows = rowsArray.controls.map(c => c.value);
    this.queryRows.set(rows);
  }*/
  // ===== Helper: Parse condition string =====
/*  private parseConditionString(conditionString: string): any[] {
    const parts = conditionString.split(/(AND|OR)/i);
    const parsed: any[] = [];

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i].trim();
      if (part === 'AND' || part === 'OR') continue;

      const match = part.match(/(\w+)\s*([=!<>]+)\s*(.+)/);
      if (match) {
        let andOr = '';
        if (i > 0) {
          const prev = parts[i - 1].trim();
          if (prev === 'AND' || prev === 'OR') andOr = prev.toLowerCase();
        }

        parsed.push({
          fieldName: match[1].trim(),
          operator: match[2].trim(),
          value: match[3].trim().replace(/"/g, ''),
          andOr: andOr
        });
      }
    }
    return parsed;
  }*/

  private parseConditionString(conditionString: string): any[] {
    const parts = conditionString.split(/\s+(AND|OR)\s+/i);
    const parsed: any[] = [];

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i].trim();
      if (part.toUpperCase() === 'AND' || part.toUpperCase() === 'OR') continue;

      // Match operators including '==', '!=', '>=', '<=', '>', '<', 'LIKE'
      const match = part.match(/^(\w+)\s*(==|!=|>=|<=|>|<|LIKE)\s*(.+)$/i);
      if (!match) continue;

      // Determine andOr based on the previous item
      let andOr = '';
      if (i > 0) {
        const prev = parts[i - 1].trim().toUpperCase();
        if (prev === 'AND' || prev === 'OR') andOr = prev.toLowerCase();
      }

      parsed.push({
        fieldName: match[1].trim(),
        operator: match[2].trim(),
        value: match[3].trim().replace(/^"|"$/g, ''), // remove surrounding quotes
        andOr
      });
    }

    return parsed;
  }


  private patchConditionForm(condition: Condition): void {
    // Workflow ID find
    const workflowId = condition.conditionalWorkflowId ||
      this.findKeyByValue(this.workflowOptions, condition.conditionalWorkflow);

    this.conditionFrmGroup.patchValue({
      conditionalWorkflowId: workflowId
    });

    console.log('✅ Condition Form Patched - Workflow:', workflowId);
  }

  private parseAndPatchConditionString(conditionString: string): void {
    console.log('🔍 Parsing Condition String:', conditionString);

    this.clearAllQueryRows();

    // Condition string parse
    const conditions = this.parseConditionString(conditionString);

    console.log('📝 Parsed Conditions:', conditions);

    conditions.forEach((condition, index) => {
      if (index === 0) {

        this.patchQueryRow(0, condition);
      } else {
        this.addQueryRow();
        this.patchQueryRow(index, condition);
      }
    });
  }

  private patchQueryRow(index: number, condition: any): void {
    const rowsArray = this.conditionFrmGroup.get('rows') as FormArray;

    if (index < rowsArray.length) {
      const rowForm = rowsArray.at(index) as FormGroup;

      // Field type identify
      const fieldConfig = this.fieldValueList.find(f => f.fieldName === condition.fieldName);
      const fieldType = fieldConfig?.fieldType;

      // Row form patch
      rowForm.patchValue({
        andOr: condition.andOr || '',
        fieldName: condition.fieldName,
        operator: condition.operator,
        value: condition.value
      });

      // Signal update
      const updatedRows = [...this.queryRows()];
      if (updatedRows[index]) {
        updatedRows[index] = {
          ...updatedRows[index],
          andOr: condition.andOr || '',
          fieldName: condition.fieldName,
          operator: condition.operator,
          value: condition.value,
          fieldType: fieldType,
          fieldValueOptions: fieldConfig?.fieldValue || null
        };
        this.queryRows.set(updatedRows);
      }

      // Operator map update
      if (fieldType) {
        this.operatorMap[updatedRows[index].id] = fieldType === 'N' ? this.operatorOptions : this.operatorOptionsLimited;
      }

      console.log(`✅ Row ${index} Patched:`, condition);
    }
  }

  private clearAllQueryRows(): void {
    const rowsArray = this.conditionFrmGroup.get('rows') as FormArray;

    // rows remove
    while (rowsArray.length > 0) {
      rowsArray.removeAt(0);
    }

    // fresh row add
    rowsArray.push(this.buildRow());

    // Signal reset
    this.queryRows.set([
      { id: 1, action: '', andOr: '', fieldName: '', operator: '', value: '' }
    ]);

    // Operator map clear
    this.operatorMap = {};

    console.log('✅ All Query Rows Cleared');
  }

  onTransactionDelete(serializedData: string): void {

    const condition = JSON.parse(serializedData);

    if (!condition.workflowFunctionMapId) {
      this.deleteFromGridOnly(condition.id);
      this.toastr.warning('Condition deleted', 'Deleted');
      return;
    }

    if (confirm("Are you sure delete this condition?")) {

      this.assignflowService.deleteWorkflowFunctionMap(condition.workflowFunctionMapId)
        .subscribe({
          next: () => {
            this.deleteFromGridOnly(condition.id);
            this.toastr.success('Condition deleted successfully', 'Success');
          },
          error: (err) => {
            console.error(err);
            this.toastr.error('Failed to delete condition', 'Error');
          }
        });

    } else {

    }
  }

  private deleteFromGridOnly(id: number): void {
    const currentList = this.conditionsList();

    const updatedList = currentList
      .filter(c => c.id !== id)
      .map((c, index) => ({ ...c, priority: index + 1 }));

    this.conditionsList.set(updatedList);
    this.sampleTransactions.set(updatedList);
  }

  onTransactionView(serializedData: string): void {
    const condition = JSON.parse(serializedData);
    this.toastr.info(`Viewing: ${condition.condition}`, 'View');
  }

  onTransactionProgress(serializedData: string): void {
    console.log('Progress:', serializedData);
  }

  onTransactionPrint(serializedData: string): void {
    const condition = JSON.parse(serializedData);
    this.toastr.success(`Printing: ${condition.id}`, 'Print');
  }

  onTransactionRowSelect(event: { data: string, checked: boolean }): void {
    console.log('Row selected:', event);
  }

  onTransactionSelectAll(event: { isSelectAll: boolean, selectedRows: any[], count: number }): void {
    console.log('Select all:', event);
  }

  onTransactionDataChanged(newData: any[]): void {
    this.conditionsList.set(newData);
    this.toastr.success('Data updated', 'Updated');
  }

  // Track By Functions
  trackByRowId(index: number, row: QueryRow): number {
    return row.id;
  }

  trackByConditionId(index: number, condition: Condition): number {
    return condition.id;
  }

}
