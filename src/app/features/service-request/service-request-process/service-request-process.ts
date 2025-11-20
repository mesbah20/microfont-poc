import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  signal,
  WritableSignal,
  Type,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { Subscription } from 'rxjs';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { DataGridComponent } from '../../../shared/components/data-grid';
import { ExpansionPanelHeader } from '../../../shared/components/expansion-panel-header/expansion-panel-header';
import { BUTTON_VISIBILITY } from '../../../shared/constant/button-signals.constant';
import { ServiceRequestDetails } from '../../../shared/components/service-request-details/service-request-details';
import {
  ServiceRequest,
  ServiceRequestService,
} from '../../../core/services/service-request.service';
import { SelectOptionField } from '../../../shared/components/input-types/select-option-field/select-option-field';
import { DateInput } from '../../../shared/components/input-types/date-input/date-input';
import { LdsModalComponent } from '../../../shared/components/lds-modal/lds-modal';
import { Button } from '../../../shared/components/input-types/button/button';

@Component({
  selector: 'app-service-request-process',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DateInput,
    CommonModule,
    LdsModalComponent,
    DataGridComponent,
    ExpansionPanelHeader,
    SelectOptionField,
    Button,
  ],
  templateUrl: './service-request-process.html',
  styleUrls: ['./service-request-process.scss'],
})
export class ServiceRequestProcess implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(LdsModalComponent) modalComponentRef?: LdsModalComponent;

  frmGroup: FormGroup;
  toastr = inject(ToastrService);
  serviceRequestService = inject(ServiceRequestService);
  businessHeaderPanel: WritableSignal<boolean> = signal(true);
  subPanel1: WritableSignal<boolean> = signal(true);
  serviceRequests = signal<ServiceRequest[]>([]);

  private departmentMap = new Map<number, string>();

  officeOptions = signal<{ key: string; value: string }[]>([]);

  showModal = false;
  modalComponent?: Type<any>;
  serviceRequestDetails: Type<any> = ServiceRequestDetails;
  modalComponentData?: any = null;
  modalOkButtonText = signal('OK');
  private modalSubscriptions: Subscription[] = [];
  private subscriptionCheckTimer: any = null;

  get selectedColumns(): string[] {
    return [
      'serviceId',
      'fullName',
      'issuerEmail',
      'deptName',
      'requestTypeText',
      'priorityText',
      'details',
      'statusText',
      'resolverRemarks',
    ];
  }

  get customColumnNames(): any {
    return {
      serviceId: 'Request ID',
      fullName: 'Issuer Name',
      issuerEmail: 'Issuer Email',
      deptName: 'Department',
      requestTypeText: 'Request Type',
      priorityText: 'Priority',
      details: 'Details/Remarks',
      statusText: 'Status',
      resolverRemarks: 'HR/IT Response',
    };
  }

  constructor(private formBuilder: FormBuilder) {
    BUTTON_VISIBILITY.set({
      save: false,
      update: false,
      view: false,
      delete: false,
      exit: true,
      reset: false,
    });
  }

  ngAfterViewInit() {
    this.subscribeToChildOutputs();
  }

  ngOnDestroy() {
    this.modalSubscriptions.forEach((sub) => sub.unsubscribe());
    this.modalSubscriptions = [];

    if (this.subscriptionCheckTimer) {
      clearInterval(this.subscriptionCheckTimer);
      this.subscriptionCheckTimer = null;
    }
  }

  private subscribeToChildOutputs() {
    this.modalSubscriptions.forEach((sub) => sub.unsubscribe());
    this.modalSubscriptions = [];

    if (this.subscriptionCheckTimer) {
      clearInterval(this.subscriptionCheckTimer);
      this.subscriptionCheckTimer = null;
    }

    this.subscriptionCheckTimer = setInterval(() => {
      if (
        this.modalComponentRef &&
        (this.modalComponentRef as any).componentRef
      ) {
        const childInstance = (this.modalComponentRef as any).componentRef
          .instance;
        if (childInstance && childInstance.okButtonTextChange) {
          const sub = childInstance.okButtonTextChange.subscribe(
            (text: string) => {
              this.onOkButtonTextChange(text);
            }
          );
          this.modalSubscriptions.push(sub);

          if (childInstance.okButtonText) {
            setTimeout(() => {
              this.modalOkButtonText.set(childInstance.okButtonText);
            }, 0);
          }

          clearInterval(this.subscriptionCheckTimer);
          this.subscriptionCheckTimer = null;
        }
      }
    }, 100);

    setTimeout(() => {
      if (this.subscriptionCheckTimer) {
        clearInterval(this.subscriptionCheckTimer);
        this.subscriptionCheckTimer = null;
      }
    }, 3000);
  }

  onOkButtonTextChange(text: string) {
    if (this.showModal) {
      this.modalOkButtonText.set(text);
    }
  }

  onModalClose(isVisible: boolean) {
    this.showModal = isVisible;

    if (!isVisible) {
      this.modalSubscriptions.forEach((sub) => sub.unsubscribe());
      this.modalSubscriptions = [];

      if (this.subscriptionCheckTimer) {
        clearInterval(this.subscriptionCheckTimer);
        this.subscriptionCheckTimer = null;
      }
    }
  }

  onModalResult(result: any) {
    // Don't close modal if result is null or just a button text update
    if (!result) return;

    // Close modal only for actual actions (not button text changes)
    if (result.action === 'updated') {
      this.showModal = false;
    }

    // If the service request was updated, optimistically merge into the table
    if (result?.action === 'updated') {
      const updated: ServiceRequest | undefined = result.request;
      const forcedResolverRemarks: string | undefined =
        result.updatedResolverRemarks;
      if (updated) {
        const current = [...this.serviceRequests()];
        const idx = current.findIndex(
          (r) =>
            r.serviceId === (updated.serviceId || updated.id) ||
            r.id === (updated.serviceId || updated.id)
        );

        if (idx !== -1) {
          // Build merged object carefully to preserve computed display fields
          const merged: ServiceRequest = {
            ...current[idx],
            ...updated,
            // Force preserve display fields - use nullish coalescing to prevent null overwriting
            fullName: updated.fullName ?? current[idx].fullName,
            issuerEmail: updated.issuerEmail ?? current[idx].issuerEmail,
            details:
              updated.details ?? current[idx].details ?? current[idx].remarks,
            deptName: updated.deptName ?? current[idx].deptName,
            requestTypeText:
              updated.requestTypeText ?? current[idx].requestTypeText,
            priorityText: updated.priorityText ?? current[idx].priorityText,
            document: updated.document ?? current[idx].document,
            fileName: updated.fileName ?? current[idx].fileName,
            statusText: this.getStatusText(
              updated.status ?? current[idx].status
            ),
            resolverRemarks:
              forcedResolverRemarks ??
              updated.resolverRemarks ??
              current[idx].resolverRemarks,
            updatedAt: new Date(),
          } as ServiceRequest;
          current[idx] = merged;
          this.serviceRequests.set(current);
        } else {
          // If not found (e.g., due to limited fetch scope), append it so user still sees the change
          const appended: ServiceRequest = {
            ...updated,
            fullName: updated.fullName || '',
            issuerEmail: updated.issuerEmail || updated.email || '',
            details: updated.details || updated.remarks || '',
            deptName: this.getDepartmentName(updated.deptId || 0),
            requestTypeText: this.getRequestTypeText(
              updated.requestTypeId || 0
            ),
            priorityText: this.getPriorityText(updated.priorityLevel || 0),
            statusText: this.getStatusText(updated.status),
            resolverRemarks:
              forcedResolverRemarks ??
              updated.resolverRemarks ??
              'Resolver not yet reviewed',
          } as ServiceRequest;
          this.serviceRequests.set([appended, ...current]);
        }
      }

      this.toastr.success('Service request updated successfully', 'Success');
      // Optional: Avoid immediate reload to prevent losing the row when using user-scoped API
      // this.loadServiceRequests();
    }
  }

  openModal(componentToLoad?: Type<any>, data?: any) {
    this.showModal = false;
    this.modalComponent = undefined;
    this.modalOkButtonText.set('Close');

    setTimeout(() => {
      this.modalComponent = componentToLoad || this.serviceRequestDetails;
      this.modalComponentData = data || {};
      this.showModal = true;

      setTimeout(() => this.subscribeToChildOutputs(), 500);
    }, 50);
  }

  ngOnInit(): void {
    this.frmGroup = this.formBuilder.group({
      // Office selection
      office: ['', Validators.required],
      // Date filters
      fromDate: [''],
      toDate: [''],
    });

    // Load saved office from storage if available
    const savedOfficeId =
      sessionStorage.getItem('officeId') || localStorage.getItem('officeId');
    if (savedOfficeId) {
      this.frmGroup.patchValue({ office: savedOfficeId });
    }

    // Load departments, offices, and service requests
    this.loadDepartments();
    this.loadOffices();
  }
  private loadServiceRequests(): void {
    this.serviceRequestService.getServiceRequests().subscribe({
      next: (requests) => {
        // Transform the requests to add readable text for IDs
        const transformedRequests = (requests || []).map((request) => ({
          ...request,
          // Display only the actual fullName; do not fall back to issuerName/userId
          fullName: request.fullName ?? '',
          requestTypeText: this.getRequestTypeText(request.requestTypeId || 0),
          priorityText: this.getPriorityText(request.priorityLevel || 0),
          statusText: this.getStatusText(request.status || '0'),
          deptName: this.getDepartmentName(request.deptId || 0),
          resolverRemarks:
            request.resolverRemarks || 'Resolver not yet reviewed',
          // Normalize backend date fields so date filters work reliably
          createdAt: (request as any).createDate
            ? new Date((request as any).createDate)
            : request.createdAt
            ? new Date(request.createdAt as any)
            : undefined,
          updatedAt: (request as any).modifyDate
            ? new Date((request as any).modifyDate)
            : request.updatedAt
            ? new Date(request.updatedAt as any)
            : undefined,
        })) as ServiceRequest[];

        // Apply filters
        const filteredRequests = this.applyFilters(transformedRequests);

        this.serviceRequests.set(filteredRequests);
      },
      error: (error) => {
        this.toastr.error('Failed to load service requests', 'Error');
      },
    });
  }
  private applyFilters(requests: ServiceRequest[]): ServiceRequest[] {
    const selectedOfficeId = this.frmGroup.get('office')?.value;
    const fromDateValue = this.frmGroup.get('fromDate')?.value;
    const toDateValue = this.frmGroup.get('toDate')?.value;

    let filtered = requests;

    // Filter by office if selected (check for non-empty string or valid number)
    if (
      selectedOfficeId !== null &&
      selectedOfficeId !== undefined &&
      selectedOfficeId !== ''
    ) {
      const officeId =
        typeof selectedOfficeId === 'string'
          ? parseInt(selectedOfficeId, 10)
          : selectedOfficeId;

      // Check if parsing was successful
      if (isNaN(officeId)) {
        this.toastr.error('Invalid office selection', 'Filter Error');
      } else {
        filtered = filtered.filter((req) => req.officeId === officeId);
      }
    }

    // Filter by from date if selected
    if (fromDateValue) {
      const fromDate = new Date(fromDateValue);
      fromDate.setHours(0, 0, 0, 0); // Start of day

      filtered = filtered.filter((req) => {
        if (!req.createdAt) return false;
        const reqDate = new Date(req.createdAt);
        reqDate.setHours(0, 0, 0, 0);
        return reqDate >= fromDate;
      });
    }

    // Filter by to date if selected
    if (toDateValue) {
      const toDate = new Date(toDateValue);
      toDate.setHours(23, 59, 59, 999); // End of day

      filtered = filtered.filter((req) => {
        if (!req.createdAt) return false;
        const reqDate = new Date(req.createdAt);
        return reqDate <= toDate;
      });
    }
    return filtered;
  }

  private getRequestTypeText(id: number): string {
    const requestTypes: { [key: number]: string } = {
      1: 'Access Request',
      2: 'Software Installation',
      3: 'Hardware Issue',
      4: 'Network Problem',
      5: 'Account Issue',
    };
    return requestTypes[id] || `Type ${id}`;
  }

  private getPriorityText(level: number): string {
    const priorityMap: { [key: number]: string } = {
      0: 'Low',
      1: 'High',
      2: 'Medium',
      3: 'Low',
      4: 'Urgent',
      5: 'Standard',
    };
    return priorityMap[level] || `Priority ${level}`;
  }

  private getStatusText(status: string | number | undefined): string {
    const statusNum =
      typeof status === 'string' ? parseInt(status) : status || 0;
    const statusMap: { [key: number]: string } = {
      0: 'Pending',
      1: 'In Progress',
      2: 'Resolved',
      3: 'Rejected',
    };
    return statusMap[statusNum] || 'Unknown';
  }

  private loadDepartments(): void {
    this.serviceRequestService.getAllDepartments().subscribe({
      next: (departments) => {
        // Populate the department map
        departments.forEach((dept) => {
          this.departmentMap.set(dept.deptSl, dept.deptNm);
        });

        // Now load service requests after departments are loaded
        this.loadServiceRequests();
      },
      error: (error) => {
        this.toastr.error('Failed to load departments', 'Error');
        // Still load service requests even if departments fail
        this.loadServiceRequests();
      },
    });
  }

  private loadOffices(): void {
    this.serviceRequestService.getOfficeOptions().subscribe({
      next: (options) => {
        this.officeOptions.set(options);
      },
      error: (error) => {
        this.toastr.error('Failed to load office information', 'Error');
        // Set empty array as fallback
        this.officeOptions.set([]);
      },
    });
  }

  onOfficeChange(event: {
    selectedOption: any;
    selectedKey: string;
    selectedValue: string;
  }): void {
    // Update the form value
    this.frmGroup.patchValue({ office: event.selectedKey });

    // Save officeId to sessionStorage
    sessionStorage.setItem('officeId', event.selectedKey);
    localStorage.setItem('officeId', event.selectedKey); // Also save to localStorage as backup

    this.toastr.info(
      `Office selected: ${event.selectedValue}`,
      'Office Selection'
    );

    // Note: Office filter will be applied when user clicks "Apply Filters" button
  }

  onApplyFilters(): void {
    const fromDate = this.frmGroup.get('fromDate')?.value;
    const toDate = this.frmGroup.get('toDate')?.value;

    // Validate date range
    if (fromDate && toDate) {
      const from = new Date(fromDate);
      const to = new Date(toDate);

      if (from > to) {
        this.toastr.error(
          'From Date cannot be later than To Date',
          'Invalid Date Range'
        );
        return;
      }
    }

    // Reload service requests with the applied filters
    this.loadServiceRequests();
    this.toastr.success('Filters applied successfully', 'Filter');
  }

  onClearFilters(): void {
    this.frmGroup.patchValue({
      office: '',
      fromDate: '',
      toDate: '',
    });
    this.loadServiceRequests();
    this.toastr.info('Filters cleared', 'Filter');
  }

  private getDepartmentName(deptId: number): string {
    return this.departmentMap.get(deptId) || `Department ${deptId}`;
  }

  onTransactionView(serializedData: string): void {
    const serviceRequest = JSON.parse(serializedData);
    console.log("Selected serviceRequest", serviceRequest);
    // Ensure dates are properly mapped
    const mappedRequest = {
      ...serviceRequest,
      createdAt: serviceRequest.createDate
        ? new Date(serviceRequest.createDate)
        : serviceRequest.createdAt || null,
      updatedAt: serviceRequest.modifyDate
        ? new Date(serviceRequest.modifyDate)
        : serviceRequest.updatedAt || null,
    };

    // Open modal with service request details
    console.log("this.serviceRequestDetails", this.serviceRequestDetails);

    this.openModal(
      this.serviceRequestDetails,
      {
        selectedRequest: mappedRequest,
        isViewOnly: true,
      }
    );
    this.toastr.info(
      `Viewing service request from ${
        mappedRequest.issuerName || mappedRequest.fullName
      }`,
      'View Mode'
    );
  }
}
