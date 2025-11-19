import { CommonModule } from '@angular/common';
import { Component, OnInit, Type, WritableSignal, effect, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TextBaseInput } from '../../../shared/components/input-types/text-base-input/text-base-input';
import { SelectOptionField } from '../../../shared/components/input-types/select-option-field/select-option-field';
import { Button } from '../../../shared/components/input-types/button/button';
import { ExpansionPanelHeader } from '../../../shared/components/expansion-panel-header/expansion-panel-header';
import { TextArea } from '../../../shared/components/input-types/text-area/text-area';
import { DateInput } from '../../../shared/components/input-types/date-input/date-input';
import { NumberInput } from '../../../shared/components/input-types/number-input/number-input';
import { IdBoxComponent } from '../../../shared/components/input-types/id-box/id-box';
import { BUTTON_VISIBILITY, MENU_NAME, ONCLICK_RESET, ONCLICK_SAVE } from '../../../shared/constant/button-signals.constant';
import { ReportBackendService, ReportMetadata, ReportParameterMetadata, ReportGenerationRequest } from '../services/report-backend.service';
import { DialogUtils } from '../../../shared/service/dialog-utils';
import { ReportRegistrationService } from '../services/report-registration.service';
import { Switch } from "../../../shared/components/input-types/switch/switch";
import { LdsModalComponent } from "../../../shared/components/lds-modal/lds-modal";
import { ReportSelectionModalComponent } from '../components/report-selection-modal/report-selection-modal';

/**
 * Report Generation Page
 * Dynamically renders report parameters and generates reports
 */
@Component({
  selector: 'app-report-generation-ui',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatTooltipModule,
    TextBaseInput,
    SelectOptionField,
    Button,
    ExpansionPanelHeader,
    TextArea,
    DateInput,
    NumberInput,
    IdBoxComponent,
    Switch,
    LdsModalComponent,
],
  templateUrl: './report-generation-ui.html',
  styleUrl: './report-generation-ui.scss'
})
export class ReportGenerationUI implements OnInit {
  // Injected services
  private formBuilder = inject(FormBuilder);
  private toastr = inject(ToastrService);
  private route = inject(ActivatedRoute);
  private reportBackendService = inject(ReportBackendService);
  private reportRegistrationService = inject(ReportRegistrationService);
  private dialogUtils = inject(DialogUtils);
  showModal = false;
  // Form and state properties
  selectionForm!: FormGroup;
  parameterForm!: FormGroup;
  loading = signal<boolean>(false);
  generating = signal<boolean>(false);
  selectionPanel: WritableSignal<boolean> = signal(true);
  parametersPanel: WritableSignal<boolean> = signal(true);
  outputFormatPanel: WritableSignal<boolean> = signal(true);

  // Report configuration
  reportMetadata = signal<ReportMetadata | null>(null);
  sortedParameters = signal<ReportParameterMetadata[]>([]);
  selectedFormat = signal<string>('PDF');
  availableFormats = signal<string[]|null>([]);
  modalComponent?: Type<any>;
  ReportSelectionModalComponent: Type<any> = ReportSelectionModalComponent;
  modalComponentData?: any = null;
  // Report list for selection
  reportList: any[] = [];

  // Dependent parameter loading states
  dependentParamLoading = signal<{ [key: string]: boolean }>({});

  menuName = MENU_NAME;
  onClickReset = ONCLICK_RESET;
  onClickSave = ONCLICK_SAVE;

  constructor() {
    effect(() => {
      const metadata = this.reportMetadata();
      if (metadata) {
        this.menuName.set(`REPORT GENERATION - ${metadata.reportName.toUpperCase()}`);
      } else {
        this.menuName.set('REPORT GENERATION');
      }
    });
    BUTTON_VISIBILITY.set({
      save: false,
      update: false,
      view: false,
      delete: false,
      exit: false,
      reset: true,
    });
    this.setupSignalEffects();
  }

  ngOnInit() {
    this.initializeSelectionForm();
    this.initializeParameterForm();
    this.loadReportList();

    // Check for query parameters to pre-load a report
    this.route.queryParams.subscribe(params => {
      const reportId = params['reportId'];
      if (reportId) {
        this.loadReportMetadataById(parseInt(reportId));
      }
    });
  }

  /**
   * Initialize selection form
   */
  private initializeSelectionForm() {
    this.selectionForm = this.formBuilder.group({
      reportId: [null],
      functionId: [''],
      reportName: [{ value: '', disabled: true }],
      appCode: [''],
    });
  }

  /**
   * Initialize empty parameter form
   */
  private initializeParameterForm() {
    this.parameterForm = this.formBuilder.group({});
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

  onIdBoxChanged(value: string): void {
    console.log('IdBox changed:', value);
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
    this.modalComponent = componentToLoad || this.ReportSelectionModalComponent;

    const currentFieldData = this.selectionForm?.getRawValue ? this.selectionForm.getRawValue() : {};
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

onModalResult(result: any) {
  console.log('Modal result received:', result);

  if (!result) {
    this.showModal = false;
    return;
  }

  // Handle report selection result
  if (result.id && result.reportName && result.functionId) {
    // Update form with selected report name and load metadata
    this.selectionForm.patchValue({
      reportName: result.reportName,
      functionId: result.functionId
    });
    this.loadReportMetadataById(result.id);
  } else if (typeof result === 'object' && !Array.isArray(result)) {
    // Handle other modal results
    const controlKeys = Object.keys(this.selectionForm.controls);
    const patch: any = {};
    controlKeys.forEach(key => {
      if (result[key] !== undefined) {
        patch[key] = result[key];
      }
    });
    if (Object.keys(patch).length) {
      console.log('Patching parent form with modal data:', patch);
      this.selectionForm.patchValue(patch);
    }
  }

  this.showModal = false;
}

  /**
   * Load all reports for selection
   */
  private loadReportList() {
    let resourceList = JSON.parse(localStorage.getItem('resourceList') || '[]');
    if(!resourceList || resourceList.length === 0) {
      console.warn('No resourceList found in localStorage');
      return;
    }
    
    // Filter resources where functionType is 'R' and extract functionIds
    const reportFunctionIds: string[] = resourceList
      .filter((item: any) => item?.attributes?.functionType === 'R')
      .map((m: any) => m.attributes.functionId)
      .filter((id: string) => id); // Remove any undefined/null values
    
    console.log('Report Function IDs to send:', reportFunctionIds);
    
    if (reportFunctionIds.length === 0) {
      console.warn('No report functions found with type "R"');
      this.toastr.warning('No report functions available for this user', 'Access Info');
      return;
    }

    this.reportRegistrationService.getByUserFunctions(reportFunctionIds).subscribe({
      next: (reports) => {
        console.log('Received reports from API:', reports);
        this.reportList = reports.map(report => ({
          id: report.id,
          reportName: report.reportName,
          functionId: report.functionId,
          status: report.isVisible ? 'Active' : 'Inactive'
        }));
        console.log('Processed report list:', this.reportList);
      },
      error: (err) => {
        console.error('Error loading reports:', err);
        this.toastr.error('Failed to load reports', 'Error');
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
      this.onReset();
    }
  }

  /**
   * Open report selection modal using new LdsModal
   */
  openReportModal() {
    console.log('=== OPENING REPORT SELECTION MODAL ===');
    
    // Reset modal state
    this.showModal = false;
    this.modalComponent = undefined;

    setTimeout(() => {
      this.modalComponent = this.ReportSelectionModalComponent;
      
      // Prepare modal data with configuration
      this.modalComponentData = {
        config: {
          title: 'Select Report',
          searchPlaceholder: 'Search reports by name, function ID...',
          findButtonText: 'Search',
          loadingText: 'Searching reports...',
          noDataMessage: 'No reports found. Try different search criteria or contact administrator.',
          allowMultiSelect: false,
          showCreateNew: false
        }
      };

      console.log('Opening modal with data:', this.modalComponentData);
      this.showModal = true;
    }, 50);
  }

  /**
   * Load report metadata by report ID
   */
  private loadReportMetadataById(reportId: number) {
    this.loading.set(true);
    this.reportBackendService.getReportMetadataById(reportId).subscribe({
      next: (metadata) => {
        this.reportMetadata.set(metadata);
        this.selectionForm.patchValue({
          reportId: metadata.id,
          functionId: metadata.functionId,
          reportName: metadata.reportName,
          appCode: metadata?.dataSourceInfo?.vAppName,
        });
        
        // Sort parameters and rebuild form
        const sorted = [...metadata.parameters].sort((a, b) => a.parameterOrder - b.parameterOrder);
        this.sortedParameters.set(sorted);
        this.rebuildParameterForm(sorted);
        
        // Set available formats (backend uses supportedFormats)
        const formats = metadata.supportedFormats || metadata.outputFormats || [];
        this.availableFormats.set(formats);
        if (formats.length > 0) {
          this.selectedFormat.set(formats[0]);
        }
        
        this.loading.set(false);
       // this.toastr.success('Report loaded successfully', 'Success');
      },
      error: (err) => {
        console.error('Error loading report metadata:', err);
        this.toastr.error('Failed to load report metadata', 'Error');
        this.loading.set(false);
      }
    });
  }

  /**
   * Load report metadata by function ID or report name
   */
  loadReportByFunctionId() {
    const functionId = this.selectionForm.get('functionId')?.value;
    const reportName = this.selectionForm.get('reportName')?.value;
    
    if (!functionId && !reportName) {
      this.toastr.warning('Please enter a Function ID or Report Name', 'Warning');
      return;
    }

    this.loading.set(true);

    // Try to load by function ID first, then by report name
    if (functionId) {
      this.loadReportByIdentifier('functionId', functionId);
    } else if (reportName) {
      this.loadReportByIdentifier('reportName', reportName);
    }
  }

  /**
   * Load report by identifier (functionId or reportName)
   */
  private loadReportByIdentifier(type: 'functionId' | 'reportName', value: string) {
    let serviceCall;
    
    if (type === 'functionId') {
      serviceCall = this.reportBackendService.getReportMetadataByFunctionId(value);
    } else {
      // For report name, find from the loaded report list first
      const foundReport = this.reportList.find(report => 
        report.reportName.toLowerCase().includes(value.toLowerCase())
      );
      
      if (foundReport) {
        serviceCall = this.reportBackendService.getReportMetadataById(foundReport.id);
      } else {
        this.loading.set(false);
        this.toastr.error(`No report found with name containing: ${value}`, 'Error');
        return;
      }
    }

    serviceCall.subscribe({
      next: (metadata) => {
        this.reportMetadata.set(metadata);
        this.selectionForm.patchValue({
          reportId: metadata.id,
          reportName: metadata.reportName,
          functionId: metadata.functionId,
        });
        
        // Sort parameters and rebuild form
        const sorted = [...metadata.parameters].sort((a, b) => a.parameterOrder - b.parameterOrder);
        this.sortedParameters.set(sorted);
        this.rebuildParameterForm(sorted);
        
        // Set available formats (backend uses supportedFormats)
        const formats = metadata.supportedFormats || metadata.outputFormats || [];
        this.availableFormats.set(formats);
        if (formats.length > 0) {
          this.selectedFormat.set(formats[0]);
        }
        
        this.loading.set(false);
       // this.toastr.success('Report loaded successfully', 'Success');
      },
      error: (err) => {
        console.error('Error loading report metadata:', err);
        this.toastr.error(`Failed to load report by ${type}`, 'Error');
        this.loading.set(false);
      }
    });
  }

  /**
   * Rebuild parameter form based on metadata
   */
  private rebuildParameterForm(parameters: ReportParameterMetadata[]) {
    const group: any = {};
    
    parameters.forEach(param => {
      const validators = [];
      if (param.isRequired) {
        validators.push(Validators.required);
      }
      if (param.minLength) {
        validators.push(Validators.minLength(param.minLength));
      }
      if (param.maxLength) {
        validators.push(Validators.maxLength(param.maxLength));
      }
      if (param.minValue !== undefined) {
        validators.push(Validators.min(param.minValue));
      }
      if (param.maxValue !== undefined) {
        validators.push(Validators.max(param.maxValue));
      }
      
      // Process template variables in default value
      let processedDefaultValue: any = this.processParameterTemplate(param.defaultValue || '');
      
      // Special handling for date fields
      if (param.dataType === 'DATE' && processedDefaultValue) {
        // Convert date string to Date object for date inputs
        if (processedDefaultValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
          processedDefaultValue = new Date(processedDefaultValue + 'T00:00:00');
        }
      }
      
      group[param.parameterName] = [processedDefaultValue, validators];
      
      // Load dynamic options for parameters with dataSource
      if (param.inputType === 'SELECT' && param.dataSource) {
        this.loadParameterFromAPI(param);
      }
    });
    
    this.parameterForm = this.formBuilder.group(group);
  }

  /**
   * Initialize the parameter form dynamically
   */
  private initializeForm() {
    const formControls: { [key: string]: FormControl } = {};

    this.sortedParameters().forEach(param => {
      const validators = [];

      if (param.required) {
        validators.push(Validators.required);
      }

      if (param.dataType === 'TEXT') {
        if (param.minLength) validators.push(Validators.minLength(param.minLength));
        if (param.maxLength) validators.push(Validators.maxLength(param.maxLength));
      }

      if (param.dataType === 'NUMBER') {
        if (param.minValue !== undefined) validators.push(Validators.min(param.minValue));
        if (param.maxValue !== undefined) validators.push(Validators.max(param.maxValue));
      }
console.log(param);
      // Set default value
      let defaultValue: any = '';
      if (param.defaultValue) {
        if (param.defaultValue === 'TODAY' && param.dataType === 'DATE') {
          defaultValue = new Date();
        } else {
          defaultValue = this.processParameterTemplate(param.defaultValue);
        }
      }

      formControls[param.parameterName] = new FormControl(defaultValue, validators);
    });

    this.parameterForm = this.formBuilder.group(formControls);

    // Setup listeners for dependent parameters
    this.setupDependentParameterListeners();
  }

  /**
   * Setup listeners for cascading parameters
   */
  private setupDependentParameterListeners() {
    this.sortedParameters().forEach(param => {
      if (param.dependsOnParameter) {
        const parentControl = this.parameterForm.get(param.dependsOnParameter);
        
        if (parentControl) {
          // Disable dependent field initially if parent has no value
          if (!parentControl.value) {
            this.parameterForm.get(param.parameterName)?.disable();
          }

          // Listen to parent changes
          parentControl.valueChanges.subscribe(parentValue => {
            this.onParentParameterChange(param.parameterName, param.dependsOnParameter!, parentValue);
          });
        }
      }
    });
  }

  /**
   * Handle parent parameter change for cascading
   */
  private onParentParameterChange(paramName: string, parentParamName: string, parentValue: any) {
    const control = this.parameterForm.get(paramName);

    if (!parentValue || parentValue === 'ALL') {
      // Disable and clear dependent parameter
      control?.setValue('');
      control?.disable();
    } else {
      // Enable and load options for dependent parameter
      control?.enable();
      this.loadDependentOptions(paramName, parentValue);
    }
  }

  /**
   * Load options for dependent parameter
   */
  private loadDependentOptions(paramName: string, parentValue: any) {
    this.dependentParamLoading.set({
      ...this.dependentParamLoading(),
      [paramName]: true,
    });

    // Simulate API call to load dependent options
    setTimeout(() => {
      // Mock dependent options based on parent value
      const mockOptions: { [key: string]: Array<{ value: string; label: string }> } = {
        IT: [
          { value: 'PERMANENT', label: 'Permanent' },
          { value: 'CONTRACT', label: 'Contract' },
          { value: 'INTERN', label: 'Intern' },
        ],
        HR: [
          { value: 'PERMANENT', label: 'Permanent' },
          { value: 'CONTRACT', label: 'Contract' },
        ],
        FIN: [
          { value: 'PERMANENT', label: 'Permanent' },
          { value: 'CONSULTANT', label: 'Consultant' },
        ],
      };

      const options = mockOptions[parentValue] || [];

      // Update parameter options - convert array to string format
      const param = this.sortedParameters().find(p => p.parameterName === paramName);
      if (param) {
        const optionsString = options.map((opt: any) => `${opt.value}:${opt.label}`).join(',');
        // Update the signal with new options
        const updatedParams = this.sortedParameters().map(p => 
          p.parameterName === paramName ? { ...p, selectOptions: optionsString } : p
        );
        this.sortedParameters.set(updatedParams);
      }

      this.dependentParamLoading.set({
        ...this.dependentParamLoading(),
        [paramName]: false,
      });

      this.toastr.info(`Options loaded for ${param?.parameterLabel}.`, 'Options Loaded');
    }, 800);
  }

  /**
   * Check if parameter is dependent and parent has no value
   */
  isParameterDisabled(param: ReportParameterMetadata): boolean {
    if (param.dependsOnParameter) {
      const parentControl = this.parameterForm.get(param.dependsOnParameter);
      return !parentControl?.value || parentControl.value === 'ALL';
    }
    return false;
  }

  /**
   * Check if dependent parameter is loading
   */
  isParameterLoading(paramName: string): boolean {
    return this.dependentParamLoading()[paramName] || false;
  }

  /**
   * Get dropdown options for parameter
   */
  getParameterOptions(param: ReportParameterMetadata): Array<{ key: string; value: string }> {
    return this.getSelectOptions(param);
  }

  /**
   * Get output format options
   */
  getOutputFormatOptions(): Array<{ key: string; value: string }> {
    const formats = this.availableFormats();
    return formats?.map((format: string) => ({
      key: format,
      value: format,
    }))??[];
  }

  /**
   * Generate and preview report
   */
  onGenerateReport() {
    if (this.parameterForm.invalid) {
      this.toastr.error('Please fill all required fields correctly.', 'Validation Error');
      Object.keys(this.parameterForm.controls).forEach(key => {
        const control = this.parameterForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      return;
    }    
    
    if (this.selectionForm.invalid) {
      this.toastr.error('Please fill all required fields correctly.', 'Validation Error');
      Object.keys(this.selectionForm.controls).forEach(key => {
        const control = this.selectionForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      return;
    }

    const metadata = this.reportMetadata();
    if (!metadata) {
      this.toastr.error('No report loaded. Please select a report first.', 'Error');
      return;
    }

    this.generating.set(true);

    const formValues = this.parameterForm.value;
    const appCode =  metadata?.dataSourceInfo?.vAppName || 'ultimus';
    
    // Process template variables in parameter values before sending
    const processedParameters: { [key: string]: any } = {};
    Object.keys(formValues).forEach(key => {
      let value = formValues[key];
      
      // Handle Date objects - convert to YYYY-MM-DD format
      if (value instanceof Date) {
        value = value.toISOString().split('T')[0];
      }
      
      // Process template variables
      processedParameters[key] = this.processParameterTemplate(value);
    });
    
    const request: ReportGenerationRequest = {
      reportId: metadata.id,
      outputFormat: this.selectedFormat(),
      parameters: processedParameters,
      appCode: appCode
    };

    this.reportBackendService.generateReportNew(request).subscribe({
      next: (blob) => {
        // Preview the report instead of downloading
        this.previewReport(blob, metadata.reportName);
        
        this.toastr.success(`Report "${metadata.reportName}" generated successfully!`, 'Success');
        this.generating.set(false);
      },
      error: (err) => {
        console.error('Error generating report:', err);
        this.toastr.error('Failed to generate report. Please try again.', 'Error');
        this.generating.set(false);
      }
    });
  }

  /**
   * Preview report in new window/tab
   */
  private previewReport(blob: Blob, reportName: string) {
    const format = this.selectedFormat().toLowerCase();
    
    // Create object URL for the blob
    const url = window.URL.createObjectURL(blob);
    
    if (format === 'pdf') {
      // For PDF, open in new tab for preview
      window.open(url, '_blank');
    } else {
      // For Excel/other formats, create download with preview option
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      
      // Determine file extension
      const extension = format === 'xlsx' ? 'xlsx' : format === 'xls' || 'excel' ? 'xls' : format;
      const filename = `${reportName}_${new Date().getTime()}.${extension}`;
      link.download = filename;
      
      // Show preview options dialog
      this.showPreviewDialog(url, filename, format);
    }
    
    // Clean up the URL after some time
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
    }, 10000);
  }

  /**
   * Show preview options dialog for non-PDF formats
   */
  private showPreviewDialog(url: string, filename: string, format: string) {
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    
  }

  /**
   * Download report directly (can be called from preview)
   */
  onDownloadReport() {
    // Re-generate report for download
    this.onGenerateReportForDownload();
  }

  /**
   * Generate report specifically for download
   */
  private onGenerateReportForDownload() {
    const metadata = this.reportMetadata();
    if (!metadata) return;
    const appCode =  metadata?.dataSourceInfo?.vAppName || 'ultimus';
    this.generating.set(true);

    const formValues = this.parameterForm.value;
    const request: ReportGenerationRequest = {
      reportId: metadata.id,
      outputFormat: this.selectedFormat(),
      parameters: formValues,
      appCode: appCode
    };

    this.reportBackendService.generateReportNew(request).subscribe({
      next: (blob) => {
        console.log()
        // Direct download
        const format = this.selectedFormat().toLowerCase();
        const extension = format === 'xlsx' ? 'xlsx' : format === 'xls'|| 'excel' ? 'xls' : 'pdf';
        const filename = `${metadata.reportName}_${new Date().getTime()}.${extension}`;
        
        this.reportBackendService.downloadBlob(blob, filename);
        this.generating.set(false);
      },
      error: (err) => {
        console.error('Error generating report:', err);
        this.toastr.error('Failed to generate report. Please try again.', 'Error');
        this.generating.set(false);
      }
    });
  }

  /**
   * Reset form
   */
  onReset() {
    this.selectionForm.reset({
      appCode: '' // Keep default app code
    });
    this.parameterForm.reset();
    this.reportMetadata.set(null);
    this.sortedParameters.set([]);
    this.availableFormats.set([]);
    this.selectedFormat.set('PDF');

    this.toastr.info('Form has been reset.', 'Reset');
  }

  /**
   * Get help text for parameter
   */
  getHelpText(param: ReportParameterMetadata): string {
    return param.helpText || '';
  }
  
  /**
   * Check if parameter has select options
   */
  hasSelectOptions(param: ReportParameterMetadata): boolean {
    return (param.inputType === 'SELECT' || param.dataType === 'SELECT') && !!param.selectOptions;
  }
  
  /**
   * Parse select options from string (supports JSON format)
   */
  getSelectOptions(param: ReportParameterMetadata): Array<{ key: string, value: string }> {
    if (!param.selectOptions) {
      // Return empty array if no options - user needs to configure them
      return [];
    }
    
    try {
      // First, try to parse as JSON object format
      // e.g., {"ORACLE":"Oracle","POSTGRESQL":"PostGreSql","MYSQL":"MySql"}
      const parsedOptions = JSON.parse(param.selectOptions);
      
      if (typeof parsedOptions === 'object' && !Array.isArray(parsedOptions)) {
        // Convert object to array of {key, value}
        return Object.entries(parsedOptions).map(([key, value]) => ({
          key: key,
          value: value as string
        }));
      }
      
      // If it's already an array format
      if (Array.isArray(parsedOptions)) {
        return parsedOptions.map(opt => ({
          key: opt.key || opt.value,
          value: opt.value || opt.key
        }));
      }
      
      return [];
    } catch (jsonError) {
      // If JSON parsing fails, try comma-separated "key:value" format
      // e.g., "option1:Option 1,option2:Option 2"
      try {
        const options = param.selectOptions.split(',').map(opt => {
          const [key, value] = opt.split(':');
          return { key: key.trim(), value: value?.trim() || key.trim() };
        });
        return options;
      } catch (e) {
        console.error('Error parsing select options:', e);
        return [];
      }
    }
  }
  
  /**
   * Check if parameter should show as text input
   */
  isTextInput(param: ReportParameterMetadata): boolean {
    // Show as text input if STRING type and not SELECT input type
    return param.dataType === 'STRING' && param.inputType !== 'SELECT' && param.inputType !== 'TEXTAREA';
  }
  
  /**
   * Check if parameter should show as text area
   */
  isTextArea(param: ReportParameterMetadata): boolean {
    return param.dataType === 'STRING' && param.inputType === 'TEXTAREA';
  }
  
  /**
   * Check if parameter should show as number input
   */
  isNumberInput(param: ReportParameterMetadata): boolean {
    return param.dataType === 'NUMBER';
  }
  
  /**
   * Check if parameter should show as date input
   */
  isDateInput(param: ReportParameterMetadata): boolean {
    return param.dataType === 'DATE';
  }

  /**
   * Check if parameter should show as switch
   */
  isSwitchInput(param: ReportParameterMetadata): boolean {
    return param.inputType === 'SWITCH';
  }

  /**
   * Process parameter template variables
   * Supports: {{userId}}, {{userBranch}}, {{userName}}, {{currentDate}}, {{transactionDate}}, {{userRole}}, TODAY
   */
  private processParameterTemplate(value: string): string {
    console.log("Processing template: ", value);
    if (!value || typeof value !== 'string') {
      return value;
    }

    // Handle special date values first
    if (value.toUpperCase() === 'TODAY') {
      const today = this.getCurrentDate();
      console.log(`TODAY processed to: ${today}`);
      return today;
    }

    // Template variable mapping
    const templateVars: { [key: string]: string } = {
      'userId': this.getUserId(),
      'homeBranch': this.getHomeBranch(),
      'userName': this.getUserName(),
      'userRole': this.getUserRole(),
      'currentDate': this.getCurrentDate(),
      'systemDate': new Date().toISOString().split('T')[0],
      'transactionDate': this.getTransactionDate(),
      'firstDateOfMonth': this.getFirstDateOfMonth(),
      'lastDateOfMonth': this.getLastDateOfMonth(),
      'firstDateOfYear': this.getFirstDateOfYear(),
      'lastDateOfYear': this.getLastDateOfYear(),
      'previousSystemDate': this.getPreviousSystemDate(),
      'previousTransactionDate': this.getPreviousTransactionDate(),
      'functionID': this.getFunctionId(),
      'accountNumber': this.getAccountNumber()
     
    };

    // Replace template variables {{variableName}}
    let processedValue = value;
    Object.keys(templateVars).forEach(key => {
      const pattern = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      processedValue = processedValue.replace(pattern, templateVars[key]);
    });

    return processedValue;
  }
getFirstDateOfMonth(){
  const currentDate = new Date();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  return firstDayOfMonth.toISOString().split('T')[0];
}
getLastDateOfMonth(){
  const currentDate = new Date();
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  return lastDayOfMonth.toISOString().split('T')[0];
}
getFirstDateOfYear(){
  const currentDate = new Date();
  const firstDayOfYear = new Date(currentDate.getFullYear(), 0, 1);
  return firstDayOfYear.toISOString().split('T')[0];
}
getLastDateOfYear(){
  const currentDate = new Date();
  const lastDayOfYear = new Date(currentDate.getFullYear(), 11, 31);
  return lastDayOfYear.toISOString().split('T')[0];
}
getPreviousSystemDate(){
  const currentDate = new Date();
  const previousDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 1);
  return previousDay.toISOString().split('T')[0];
}
getPreviousTransactionDate(){
  const currentDate = new Date();
  const previousDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 1);
  return previousDay.toISOString().split('T')[0];
}
getFunctionId(){
  return sessionStorage.getItem('functionId') || localStorage.getItem('functionId') || '';
}
getAccountNumber(){
  return sessionStorage.getItem('accountNumber') || localStorage.getItem('accountNumber') || '';
}
  /**
   * Get current user ID from session/localStorage
   */
  private getUserId(): string {
    const userId = sessionStorage.getItem('userId') || localStorage.getItem('userId') || '';
    console.log('getUserId() result:', userId);
    return userId;
  }

  /**
   * Get user's home branch from session/localStorage
   */
  private getHomeBranch(): string {
    const userBranch = sessionStorage.getItem('homeBranchId') || localStorage.getItem('homeBranchId')|| '';
    return userBranch;
  }

  /**
   * Get user's display name from session/localStorage
   */
  private getUserName(): string {
    return sessionStorage.getItem('userName') || localStorage.getItem('userName') || '';
  }

  /**
   * Get current date in YYYY-MM-DD format
   */
  private getCurrentDate(): string {
    const currentDate = new Date().toISOString().split('T')[0];
    console.log('getCurrentDate() result:', currentDate);
    return currentDate;
  }

  /**
   * Get transaction date 
   */
  private getTransactionDate(): string {
    return sessionStorage.getItem('transactionDate') || localStorage.getItem('transactionDate') || new Date().toISOString().split('T')[0];
  }

  /**
   * Get user role from session/localStorage
   */
  private getUserRole(): string {
    const userRole = sessionStorage.getItem('userRole') || localStorage.getItem('userRole') || '';
    console.log('getUserRole() result:', userRole);
    return userRole;
  }

  /**
   * Public method to test template processing (for debugging)
   */
  public testTemplate(template: string): string {
    console.log('=== MANUAL TEMPLATE TEST ===');
    const result = this.processParameterTemplate(template);
    console.log('Test result:', result);
    return result;
  }

  /**
   * Refresh all parameter values with template processing
   */
  public refreshParameterTemplates(): void {
    console.log('=== REFRESHING PARAMETER TEMPLATES ===');
    const currentFormValue = this.parameterForm.value;
    const parameters = this.sortedParameters();
    
    parameters.forEach(param => {
      if (param.defaultValue && param.defaultValue.includes('{{')) {
        const processedValue = this.processParameterTemplate(param.defaultValue);
        console.log(`Refreshing ${param.parameterName}: "${param.defaultValue}" -> "${processedValue}"`);
        this.parameterForm.patchValue({
          [param.parameterName]: processedValue
        });
      }
    });
  }


  /**
   * Load parameter options from API endpoint
   */
  private loadParameterFromAPI(param: ReportParameterMetadata) {
    if (!param.dataSource) return;

    // Set loading state
    this.dependentParamLoading.set({
      ...this.dependentParamLoading(),
      [param.parameterName]: true
    });

    const apiUrl = param.dataSource.trim();
    console.log(`Loading options from API: ${apiUrl} for parameter: ${param.parameterName}`);

    // Process template variables in API URL
    const processedUrl = this.processParameterTemplate(apiUrl);
    console.log(`Processed API URL: ${processedUrl}`);

    // Parse field mapping from selectOptions if available
    let keyField = 'id';
    let valueField = 'name';
    let arrayPath = '';
    
    if (param.selectOptions) {
      try {
        const fieldMapping = JSON.parse(param.selectOptions);
        keyField = fieldMapping.keyField || keyField;
        valueField = fieldMapping.valueField || valueField;
        arrayPath = fieldMapping.arrayPath || arrayPath;
        console.log(`Using field mapping: keyField="${keyField}", valueField="${valueField}", arrayPath="${arrayPath}"`);
      } catch (e) {
        console.warn('Invalid field mapping JSON, using defaults:', e);
      }
    }

    fetch(processedUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Add authentication headers if needed
        'Authorization': `Bearer ${sessionStorage.getItem('authToken') || ''}`,
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    })
    .then(data => {
      console.log(`API response for ${param.parameterName}:`, data);
      
      // Extract array from nested object if arrayPath is specified
      let dataArray = data;
      
      if (arrayPath && typeof data === 'object' && !Array.isArray(data)) {
        // Navigate to nested array using dot notation (e.g., "response.payload")
        const pathParts = arrayPath.split('.');
        let current = data;
        
        for (const part of pathParts) {
          if (current && typeof current === 'object' && part in current) {
            current = current[part];
          } else {
            throw new Error(`Array path "${arrayPath}" not found in API response`);
          }
        }
        
        dataArray = current;
        console.log(`Extracted array from path "${arrayPath}":`, dataArray);
      }
      
      // Convert API response to select options format using specified fields
      let optionsString = '';
      
      if (Array.isArray(dataArray)) {
        const options: { [key: string]: string } = {};
        
        dataArray.forEach(item => {
          const key = item[keyField];
          const value = item[valueField];
          
          if (key !== undefined && value !== undefined) {
            options[String(key)] = String(value);
          }
        });
        
        optionsString = JSON.stringify(options);
        console.log(`Converted ${dataArray.length} items to options using ${keyField}/${valueField}:`, optionsString);
      } else if (!arrayPath && typeof data === 'object') {
        // If no arrayPath specified and response is object, try common array properties
        const commonArrayProps = ['data', 'payload', 'items', 'results', 'content'];
        let foundArray = false;
        
        for (const prop of commonArrayProps) {
          if (data[prop] && Array.isArray(data[prop])) {
            dataArray = data[prop];
            console.log(`Auto-detected array in property "${prop}":`, dataArray);
            foundArray = true;
            break;
          }
        }
        
        if (foundArray && Array.isArray(dataArray)) {
          const options: { [key: string]: string } = {};
          
          dataArray.forEach(item => {
            const key = item[keyField];
            const value = item[valueField];
            
            if (key !== undefined && value !== undefined) {
              options[String(key)] = String(value);
            }
          });
          
          optionsString = JSON.stringify(options);
        } else {
          // Use response as-is if it's already a key-value object
          optionsString = JSON.stringify(data);
        }
      } else {
        throw new Error('API response must be an array or object with array property');
      }

      // Update parameter options in the signal
      this.updateParameterOptions(param.parameterName, optionsString);
      this.clearParameterLoading(param.parameterName);
    })
    .catch(error => {
      console.error(`Error loading options from API for ${param.parameterName}:`, error);
      this.clearParameterLoading(param.parameterName);
      this.toastr.error(`Failed to load options for ${param.parameterLabel}: ${error.message}`, 'API Error');
    });
  }

  /**
   * Load parameter options from database query
   */
  private loadParameterFromDatabase(param: ReportParameterMetadata) {
    if (!param.selectOptions) return;

    console.log(`Loading options from Database for parameter: ${param.parameterName}`);
    
    // For database queries, we'll need to call a backend endpoint that executes the query
    const query = param.selectOptions.trim();
    const processedQuery = this.processParameterTemplate(query);
    
    const requestPayload = {
      query: processedQuery,
      parameterName: param.parameterName
    };

    // Call backend service to execute database query
    this.reportBackendService.executeParameterQuery(requestPayload)
      .subscribe({
        next: (data) => {
          console.log(`Database response for ${param.parameterName}:`, data);
          
          // Convert database response to select options format
          let optionsString = '';
          if (Array.isArray(data)) {
            const options: { [key: string]: string } = {};
            data.forEach(row => {
              // Assume first column is key, second is value
              const keys = Object.keys(row);
              const key = row[keys[0]];
              const value = row[keys[1]] || row[keys[0]];
              if (key && value) {
                options[key] = value;
              }
            });
            optionsString = JSON.stringify(options);
          } else {
            optionsString = JSON.stringify(data);
          }

          this.updateParameterOptions(param.parameterName, optionsString);
          this.clearParameterLoading(param.parameterName);
          
        },
        error: (error) => {
          console.error(`Error loading options from Database for ${param.parameterName}:`, error);
          this.clearParameterLoading(param.parameterName);
          this.toastr.error(`Failed to load options for ${param.parameterLabel}`, 'Database Error');
        }
      });
  }

  /**
   * Update parameter options in the signal
   */
  private updateParameterOptions(parameterName: string, optionsString: string) {
    const updatedParams = this.sortedParameters().map(p => 
      p.parameterName === parameterName ? { ...p, selectOptions: optionsString } : p
    );
    this.sortedParameters.set(updatedParams);
    console.log(`Updated options for ${parameterName}:`, optionsString);
  }

  /**
   * Clear parameter loading state
   */
  private clearParameterLoading(parameterName: string) {
    this.dependentParamLoading.set({
      ...this.dependentParamLoading(),
      [parameterName]: false
    });
  }
}
