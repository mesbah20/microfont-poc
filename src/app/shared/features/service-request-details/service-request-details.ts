import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  signal,
  WritableSignal,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MatTabsModule } from '@angular/material/tabs';
import { jwtDecode } from 'jwt-decode';
import { ServiceRequest, ServiceRequestService } from '../../core/services/service-request.service';
import { ServiceRequestLog, ServiceRequestLogService } from '../../core/services/service-request-log.service';
import { UserService } from '../../core/user/user.service';
import { User } from '../../core/user/user.types';
import { InputTextArea } from '../../common-components/input-types/input-text-area/input-text-area';
import { InputSelectOptionField } from '../../common-components/input-types/input-select-option-field/input-select-option-field';
import { ExpansionPanelHeader } from '../../common-components/expansion-panel-header/expansion-panel-header';


@Component({
  selector: 'service-request-details',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextArea,
    InputSelectOptionField,
    ExpansionPanelHeader,
    MatTabsModule,
  ],
  templateUrl: './service-request-details.html',
  styleUrls: ['./service-request-details.scss'],
})
export class ServiceRequestDetails implements OnInit {
  toggleMenu: boolean = false;
  sidebarExpanded: boolean = false;
  showCreateForm: boolean = true;
  create: boolean = true;
  view: boolean = false;
  frmGroup!: FormGroup;
  responseForm!: FormGroup;
  public title = 'Service Request';
  businessHeaderPanel: WritableSignal<boolean> = signal(true);
  subPanel1: WritableSignal<boolean> = signal(true);
  toastr = inject(ToastrService);
  serviceRequestService = inject(ServiceRequestService);
  serviceRequestLogService = inject(ServiceRequestLogService);
  private cdr = inject(ChangeDetectorRef);
  @Output() modalResult = new EventEmitter<any>();
  @Output() okButtonTextChange = new EventEmitter<string>();
  @Input() modalParent?: { close(result?: any): void; closeModal(): void };
  @Input() initialData?: any;

  private userService = inject(UserService);

  officeId!: string;
  userId!: string;
  employeeId!: string;
  // Getter for OK button text based on current mode
  get okButtonText(): string {
    if (this.tabIndex() === 0) {
      return 'Close'; // View Details tab
    }
    return 'Send Response'; // HR/IT Response tab
  }

  // Selected service request to display
  @Input() selectedRequest: ServiceRequest | null = null;

  // Active tab using signal
  tabIndex = signal<number>(0);

  onTabChange(index: number): void {
    // Prevent unnecessary processing if tab didn't actually change
    if (this.tabIndex() === index) {
      return;
    }

    this.tabIndex.set(index);

    // Emit button text change asynchronously
    setTimeout(() => {
      this.okButtonTextChange.emit(this.okButtonText);
    }, 0);
  }

  handleView(): void {
    this.view = true;
    this.create = false;
    this.loadServiceRequests();
  }

  handleCreate(): void {
    this.create = true;
    this.view = false;
  }

  // File upload tracking
  selectedFile: File | null = null;

  // Service requests data for grid
  serviceRequests: ServiceRequest[] = [];

  // Table columns for prime-table-out
  displayedColumns = ['requestType', 'status', 'details'];

  // Department options loaded from API
  departmentOptions: { key: string; value: string }[] = [];

  // Enhanced dropdown options for existing fields
  dropdownOptions = [
    { key: 1, value: 'Access Request' },
    { key: 2, value: 'Software Installation' },
    { key: 3, value: 'Hardware Issue' },
    { key: 4, value: 'Network Problem' },
    { key: 5, value: 'Account Issue' },
  ];

  priorityOptions = [
    { key: 1, value: 'High' },
    { key: 2, value: 'Medium' },
    { key: 3, value: 'Low' },
  ];

  statusOptions = [
    { key: 0, value: 'Pending' },
    { key: 1, value: 'In Progress' },
    { key: 2, value: 'Resolved' },
    { key: 3, value: 'Rejected' },
  ];

  constructor(private formBuilder: FormBuilder) {
    // Initialize form in constructor to avoid template errors
    this.frmGroup = this.formBuilder.group({
      uuid: [''],
      serviceRequestId: [''],
      employeeId: [''],
      fullName: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
        ],
      ],
      email: ['', [Validators.required, Validators.email]],
      department: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
        ],
      ],
      requestType: ['', Validators.required],
      priority: ['', Validators.required],
      remarks: ['', [Validators.required, Validators.maxLength(500)]],
      fileUpload: [''],
    });

    // Initialize response form for HR/IT
    this.responseForm = this.formBuilder.group({
      status: ['', Validators.required],
      resolverRemarks: ['', [Validators.required, Validators.maxLength(1000)]],
    });
  }

  ngOnInit() {
    // Load departments from API
    this.loadDepartments();

    // Populate employee ID from JWT token
    this.populateEmployeeId();

    // Check if a specific service request was passed
    if (this.initialData?.selectedRequest) {
      const incomingRequest = this.initialData.selectedRequest;

      // Ensure both ID fields and computed display fields are present
      const deptId =
        incomingRequest.deptId ??
        (incomingRequest.department
          ? Number(incomingRequest.department)
          : undefined);
      const requestTypeId =
        incomingRequest.requestTypeId ??
        (incomingRequest.requestType
          ? Number(incomingRequest.requestType)
          : undefined);
      const priorityLevel =
        incomingRequest.priorityLevel ??
        (incomingRequest.priority
          ? Number(incomingRequest.priority)
          : undefined);

      this.selectedRequest = {
        ...incomingRequest,
        // Preserve or derive ID fields
        deptId: deptId,
        requestTypeId: requestTypeId,
        priorityLevel: priorityLevel,
        // Ensure computed display fields are present
        requestTypeText:
          incomingRequest.requestTypeText ||
          this.getRequestTypeValue(requestTypeId),
        priorityText:
          incomingRequest.priorityText ||
          this.getPriorityText(priorityLevel ?? 0),
        deptName:
          incomingRequest.deptName || this.getDepartmentName(deptId ?? 0),
      };

      // Populate form with the selected request data
      if (this.selectedRequest) {
        // Map API fields to form fields
        const mappedData = {
          fullName:
            this.selectedRequest.fullName || this.selectedRequest.issuerName,
          email: this.selectedRequest.issuerEmail || this.selectedRequest.email,
          department:
            this.selectedRequest.deptId?.toString() ||
            this.selectedRequest.department?.toString(),
          requestType:
            this.selectedRequest.requestTypeId?.toString() ||
            this.selectedRequest.requestType?.toString(),
          priority:
            this.selectedRequest.priorityLevel?.toString() ||
            this.selectedRequest.priority?.toString(),
          remarks: this.selectedRequest.details || this.selectedRequest.remarks,
          serviceRequestId:
            this.selectedRequest.serviceId || this.selectedRequest.id,
        };

        this.frmGroup.patchValue(mappedData);

        // Make form readonly since it's view mode
        if (this.initialData.isViewOnly) {
          Object.keys(this.frmGroup.controls).forEach((key) => {
            this.frmGroup.get(key)?.disable();
          });
        }

        // Initialize response form with current status (as number)
        const currentStatus =
          typeof this.selectedRequest.status === 'number'
            ? this.selectedRequest.status
            : this.parseStatusStringToNumber(
                this.selectedRequest.status || '0'
              );

        this.responseForm.patchValue({
          status: currentStatus,
          resolverRemarks: this.selectedRequest.resolverRemarks || '',
        });
      }
    } else {
      // Load user data from localStorage for new requests
      this.loadUserDataFromLocalStorage();
    }

    // Always load service requests list for the grid
    this.loadServiceRequests();

    this.userService.user$.subscribe((user: User) => {
      this.officeId = user.officeId;
      this.userId = user.username;
      this.employeeId = user.employeeId;

      console.log('Office ID:', this.officeId);
      console.log('User ID:', this.userId);
    });
  }
  loadServiceRequests(): void {
    // Get the logged-in user's name from localStorage
    //const userName = localStorage.getItem('userName') || 'Hasibul Haque';
    const userName = this.userId;

    this.serviceRequestService.getServiceRequestsByIssuer(userName).subscribe({
      next: (requests) => {
        // Transform the requests to add readable text for IDs
        this.serviceRequests = (requests || []).map((request) => ({
          ...request,
          requestTypeText: this.getRequestTypeText(request.requestTypeId || 0),
          priorityText: this.getPriorityText(request.priorityLevel || 0),
          statusText: this.getStatusText(request.status || '0'),
          deptName: this.getDepartmentName(request.deptId || 0),
          resolverRemarks:
            request.resolverRemarks || 'Resolver not yet reviewed',
        }));
      },
      error: (error) => {
        this.toastr.error('Failed to load service requests', 'Error');
      },
    });
  }

  private getRequestTypeText(id: number): string {
    const option = this.dropdownOptions.find((opt) => opt.key === id);
    return option ? option.value : `Type ${id}`;
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

  private getDepartmentName(deptId: number): string {
    const dept = this.departmentOptions.find(
      (opt) => opt.key === deptId.toString()
    );
    return dept ? dept.value : `Dept ${deptId}`;
  }

  private parseStatusStringToNumber(
    status: string | number | undefined
  ): number {
    if (typeof status === 'number') return status;
    if (!status) return 0;

    const statusMap: { [key: string]: number } = {
      pending: 0,
      'in-progress': 1,
      'in progress': 1,
      resolved: 2,
      rejected: 3,
    };

    return statusMap[status.toLowerCase()] ?? parseInt(status) ?? 0;
  }

  loadDepartments(): void {
    this.serviceRequestService.getDepartmentOptions().subscribe({
      next: (options) => {
        this.departmentOptions = options;
      },
      error: (error) => {
        this.toastr.error('Failed to load departments', 'Error');
        // Fallback to empty array
        this.departmentOptions = [];
      },
    });
  }

  /**
   * Extract employee ID from JWT token and populate the form field
   */
  populateEmployeeId(): void {
    try {
      // Get token from localStorage or sessionStorage
      const token =
        localStorage.getItem('authToken') ||
        sessionStorage.getItem('authToken');

      if (!token) {
        console.warn('No auth token found');
        return;
      }

      // Decode the JWT token
      const decodedToken: any = jwtDecode(token);

      // Extract employee ID from the decoded token
      const employeeId = decodedToken.employeeId;

      if (employeeId) {
        // Populate the employee ID field (it's disabled but can still be set)
        this.frmGroup.patchValue({
          employeeId: employeeId.toString(),
        });
        console.log('Employee ID populated:', employeeId);
      } else {
        console.warn('Employee ID not found in token');
      }
    } catch (error) {
      console.error('Error decoding JWT token:', error);
    }
  }

  loadUserDataFromLocalStorage(): void {
    const userData = {
      fullName: localStorage.getItem('userName') || 'Hasibul Haque',
      email: localStorage.getItem('userEmail') || 'hasib.haque@company.com',
    };

    // Populate the readonly fields
    this.frmGroup.patchValue({
      fullName: userData.fullName,
      email: userData.email,
    });
  }

  handleCategorySelection(event: {
    selectedOption: any;
    selectedKey: string;
    selectedValue: string;
  }): void {
    // Update priority based on selection
    if (event.selectedKey === 'option1' || event.selectedKey === 'option4') {
      // High priority or urgent
      this.toastr.info(
        'High priority request - Will be processed urgently',
        'Priority Update'
      );
    }
  }

  onPdfSelected(files: File[]): void {
    if (files && files.length > 0) {
      this.selectedFile = files[0];
      this.toastr.info(
        `File "${this.selectedFile.name}" selected`,
        'File Upload'
      );
    }
  }

  onFileInputChanged(context: string): void {}

  onInputTextAreaChanged(value: string): void {}

  onCommentChanged(value: string): void {}

  handleStatusChange(event: {
    selectedOption: any;
    selectedKey: string;
    selectedValue: string;
  }): void {}
  onResetResponse(): void {
    const currentStatus =
      typeof this.selectedRequest?.status === 'number'
        ? this.selectedRequest.status
        : this.parseStatusStringToNumber(this.selectedRequest?.status || '0');

    this.responseForm.reset({
      status: currentStatus,
      resolverRemarks: this.selectedRequest?.resolverRemarks || '',
    });
    this.toastr.info('Response form reset', 'Resetted');
  }

  /**
   * Method called by generic-modal when OK button is clicked
   * Handles different actions based on which tab is active
   */
  getModalResult(): any {
    // If on View Details tab (index 0), just close the modal
    if (this.tabIndex() === 0) {
      return null;
    }

    // If on HR/IT Response tab (index 1), trigger send response
    if (this.tabIndex() === 1) {
      // Validate form
      if (this.responseForm.invalid) {
        this.toastr.error('Please fill in all required fields', 'Form Error');
        Object.keys(this.responseForm.controls).forEach((key) => {
          this.responseForm.get(key)?.markAsTouched();
        });
        // Return null to indicate validation failed
        return null;
      }

      // Form is valid - trigger async submission
      setTimeout(() => {
        this.onSendResponse();
      }, 0);

      // Return form data to indicate submission is in progress
      return {
        ...this.responseForm.getRawValue(),
        mode: 'sendResponse',
        timestamp: new Date(),
      };
    }

    return null;
  }

  onSendResponse(): void {
    if (this.responseForm.invalid) {
      this.toastr.error('Please fill in all required fields', 'Form Error');
      Object.keys(this.responseForm.controls).forEach((key) => {
        this.responseForm.get(key)?.markAsTouched();
      });
      return;
    }

    if (!this.selectedRequest) {
      this.toastr.error('No service request selected', 'Error');
      return;
    }

    const responseData = this.responseForm.value;

    // Get the correct ID from the request (could be id or serviceId)
    const requestId = this.selectedRequest.serviceId || this.selectedRequest.id;

    if (!requestId) {
      this.toastr.error('Cannot update: Request ID is missing', 'Error');
      return;
    }

    // Update the service request with new status and resolver remarks
    const updatedRequest: ServiceRequest = {
      ...this.selectedRequest,
      id: requestId,
      serviceId: requestId,
      serviceDtlId: this.selectedRequest.serviceDtlId,
      // Ensure required fields are populated
      issuerName:
        this.selectedRequest.issuerName || this.selectedRequest.fullName || '',
      issuerEmail:
        this.selectedRequest.issuerEmail || this.selectedRequest.email || '',
      deptId:
        this.selectedRequest.deptId ??
        (this.selectedRequest.department
          ? Number(this.selectedRequest.department)
          : undefined),
      requestTypeId:
        this.selectedRequest.requestTypeId ??
        (this.selectedRequest.requestType
          ? Number(this.selectedRequest.requestType)
          : undefined),
      priorityLevel:
        this.selectedRequest.priorityLevel ??
        (this.selectedRequest.priority
          ? Number(this.selectedRequest.priority)
          : undefined),
      // Update status and remarks
      status: responseData.status,
      resolverRemarks: responseData.resolverRemarks,
      updatedAt: new Date(),
    };

    // Call service to update the request
    this.serviceRequestService.updateServiceRequest(updatedRequest).subscribe({
      next: (response) => {
        // Only proceed if response is valid
        if (response && (response.id || response.serviceId)) {
          const previousRequest = this.selectedRequest;

          const requestTypeKey =
            response.requestTypeId ??
            previousRequest?.requestTypeId ??
            (previousRequest?.requestType
              ? Number(previousRequest.requestType)
              : undefined);
          const priorityLevel =
            response.priorityLevel ??
            previousRequest?.priorityLevel ??
            (previousRequest?.priority
              ? Number(previousRequest.priority)
              : undefined);
          const deptId =
            response.deptId ??
            previousRequest?.deptId ??
            (previousRequest?.department
              ? Number(previousRequest.department)
              : undefined);

          const decoratedResponse: ServiceRequest = {
            ...response,
            // Preserve ID fields explicitly
            deptId: deptId,
            requestTypeId: requestTypeKey,
            priorityLevel: priorityLevel,
            // Preserve the updated status explicitly
            status: response.status ?? updatedRequest.status,
            resolverRemarks:
              response.resolverRemarks ?? updatedRequest.resolverRemarks,
            // Preserve or compute display fields
            requestTypeText:
              response.requestTypeText ??
              previousRequest?.requestTypeText ??
              this.getRequestTypeValue(requestTypeKey),
            priorityText:
              response.priorityText ??
              previousRequest?.priorityText ??
              this.getPriorityText(priorityLevel ?? 0),
            deptName:
              response.deptName ??
              previousRequest?.deptName ??
              this.getDepartmentName(deptId ?? 0),
            fullName: response.fullName ?? previousRequest?.fullName ?? '',
            issuerEmail:
              response.issuerEmail ?? previousRequest?.issuerEmail ?? '',
            details:
              response.details ??
              previousRequest?.details ??
              previousRequest?.remarks ??
              '',
          };

          // Log the status change
          this.logServiceRequestAction(decoratedResponse, 'UPDATE');

          // Here you would also send an email/notification to the employee
          // with the comment from HR/IT
          this.sendNotificationToEmployee(
            decoratedResponse,
            responseData.resolverRemarks
          );

          this.toastr.success(
            `Status updated and notification sent to employee`,
            'Response Sent'
          );

          // Reset the form to original values
          this.responseForm.patchValue({
            resolverRemarks: responseData.resolverRemarks,
          });

          // Update the displayed request
          this.selectedRequest = decoratedResponse;

          // Emit result to parent, ensure updated resolverRemarks and computed fields are preserved
          const mergedResponse = {
            ...decoratedResponse,
            resolverRemarks: responseData.resolverRemarks,
          } as ServiceRequest;

          this.modalResult.emit({
            action: 'updated',
            request: mergedResponse,
            updatedResolverRemarks: responseData.resolverRemarks,
          });

          // Optionally close modal after a delay
          setTimeout(() => {
            if (this.modalParent) {
              this.modalParent.close(response);
            }
          }, 1500);
        } else {
          this.toastr.error(
            'Update failed: Invalid response from server',
            'Error'
          );
        }
      },
      error: (error) => {
        this.toastr.error(
          'Failed to send response. Please try again.',
          'Error'
        );
      },
    });
  }
  private sendNotificationToEmployee(
    request: ServiceRequest,
    comment: string
  ): void {
    const employeeName = request.fullName || request.issuerName || 'Employee';
    const employeeEmail = request.issuerEmail || request.email || '';
    const requestType = this.getRequestTypeValue(
      request.requestTypeId || request.requestType
    );
    const department = this.getDepartment();

    const notificationData = {
      to: employeeEmail,
      subject: `Service Request Update: ${requestType}`,
      message: `
        Dear ${employeeName},

        Your service request has been updated:

        Status: ${request.status || this.getStatus()}
        Request Type: ${requestType}
        Department: ${department}

        HR/IT Comment:
        ${comment}

        If you have any questions, please contact the IT department.

        Best regards,
        IT Support Team
      `,
    };

    // In a real application, you would call an email/notification service here
    // this.notificationService.sendEmail(notificationData).subscribe(...);
  }

  onSubmit(): void {
    if (this.frmGroup.valid) {
      const formData = this.frmGroup.value;

      // Prepare service request data
      const serviceRequest: ServiceRequest = {
        fullName: formData.fullName,
        email: formData.email,
        department: formData.department,
        requestType: formData.requestType,
        priority: formData.priority,
        remarks: formData.remarks,
        fileName: this.selectedFile ? this.selectedFile.name : null,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Call backend service
      this.serviceRequestService.addServiceRequest(serviceRequest).subscribe({
        next: (response) => {
          this.toastr.success(
            'Service request submitted successfully!',
            'Success'
          );

          // Log the service request creation to the backend (silent, no UI feedback)
          this.logServiceRequestAction(response, 'CREATE');

          // Emit result to parent component
          this.modalResult.emit(response);

          // Reset form
          this.frmGroup.reset();
          this.selectedFile = null;

          // Reload service requests to show the new one
          this.loadServiceRequests();

          // Re-populate readonly fields
          this.loadUserDataFromLocalStorage();

          // Close modal if parent reference is provided
          if (this.modalParent) {
            this.modalParent.close(response);
          }
        },
        error: (error) => {
          this.toastr.error(
            'Failed to submit service request. Please try again.',
            'Error'
          );
        },
      });
    } else {
      this.toastr.error(
        'Please correct the errors in the form before submitting.',
        'Form Error'
      );

      // Mark all fields as touched to show validation errors
      Object.keys(this.frmGroup.controls).forEach((key) => {
        this.frmGroup.get(key)?.markAsTouched();
      });
    }
  }
  getRequestTypeValue(key: string | number | undefined): string {
    // First check if requestTypeText is available (computed field from parent)
    if (this.selectedRequest?.requestTypeText) {
      return this.selectedRequest.requestTypeText;
    }

    if (!key) return 'N/A';

    // Handle if key is a number (requestTypeId from API)
    if (typeof key === 'number') {
      const option = this.dropdownOptions.find((opt) => opt.key === key);
      return option ? option.value : `Type ${key}`;
    }

    // Handle if key is a string (requestType from form) - convert to number
    const numKey = Number(key);
    const option = this.dropdownOptions.find((opt) => opt.key === numKey);
    return option ? option.value : String(key);
  }

  getFullName(): string {
    if (!this.selectedRequest) return 'N/A';
    return (
      this.selectedRequest.fullName || this.selectedRequest.issuerName || 'N/A'
    );
  }

  getEmail(): string {
    if (!this.selectedRequest) return 'N/A';
    return (
      this.selectedRequest.issuerEmail || this.selectedRequest.email || 'N/A'
    );
  }

  getDepartment(): string {
    if (!this.selectedRequest) return 'N/A';

    // If deptId exists, get department name from options
    if (this.selectedRequest.deptId) {
      const dept = this.departmentOptions.find(
        (opt) => opt.key === this.selectedRequest!.deptId!.toString()
      );
      return dept ? dept.value : `Department ${this.selectedRequest.deptId}`;
    }

    // If deptName exists (computed field), use it
    if (this.selectedRequest.deptName) {
      return this.selectedRequest.deptName;
    }

    // Fallback to department field
    if (typeof this.selectedRequest.department === 'number') {
      const dept = this.departmentOptions.find(
        (opt) => opt.key === this.selectedRequest!.department!.toString()
      );
      return dept
        ? dept.value
        : `Department ${this.selectedRequest.department}`;
    }

    return String(this.selectedRequest.department || 'N/A');
  }

  getPriority(): string {
    if (!this.selectedRequest) return 'N/A';

    // Handle priorityText (computed field) - CHECK THIS FIRST
    if (this.selectedRequest.priorityText) {
      return this.selectedRequest.priorityText;
    }

    // Handle priorityLevel (number from API) - must not be null or undefined
    if (
      this.selectedRequest.priorityLevel !== undefined &&
      this.selectedRequest.priorityLevel !== null
    ) {
      return this.getPriorityText(this.selectedRequest.priorityLevel);
    }

    // Handle priority (string/number from form)
    if (this.selectedRequest.priority) {
      const numKey = Number(this.selectedRequest.priority);
      const option = this.priorityOptions.find((opt) => opt.key === numKey);
      return option ? option.value : String(this.selectedRequest.priority);
    }

    return 'N/A';
  }

  getRemarks(): string {
    if (!this.selectedRequest) return 'N/A';
    return (
      this.selectedRequest.details ||
      this.selectedRequest.remarks ||
      'No remarks provided'
    );
  }

  getStatus(): string {
    if (!this.selectedRequest) return 'pending';

    // Handle status as string
    if (typeof this.selectedRequest.status === 'string') {
      return this.selectedRequest.status;
    }

    // Handle statusText (computed field)
    if (this.selectedRequest.statusText) {
      return this.selectedRequest.statusText.toLowerCase();
    }

    // Handle status as number
    return this.getStatusText(this.selectedRequest.status || 0).toLowerCase();
  }

  getCreatedDate(): Date | null {
    if (!this.selectedRequest) return null;
    return this.selectedRequest.createdAt || null;
  }

  getUpdatedDate(): Date | null {
    if (!this.selectedRequest) return null;

    // Check updatedAt first, then modifyDate as fallback
    if (this.selectedRequest.updatedAt) {
      return this.selectedRequest.updatedAt;
    }

    // Check if modifyDate exists (from API response)
    const modifyDate = (this.selectedRequest as any).modifyDate;
    if (modifyDate) {
      return new Date(modifyDate);
    }

    return null;
  }

  getFileName(): string | null {
    if (!this.selectedRequest) return null;
    // If fileName exists, use it
    if (this.selectedRequest.fileName) {
      return this.selectedRequest.fileName;
    }
    // If document exists but no fileName, detect type from base64 and generate a default name
    if (this.selectedRequest.document) {
      const fileType = this.detectFileTypeFromBase64(
        this.selectedRequest.document
      );
      return `Attached_Document.${fileType}`;
    }
    return null;
  }

  private detectFileTypeFromBase64(base64: string): string {
    // Remove data URI prefix if present
    const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;

    // Decode first few bytes to check magic numbers
    try {
      const binaryString = atob(base64Data.substring(0, 100));
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Check magic numbers
      // PNG: 89 50 4E 47
      if (
        bytes[0] === 0x89 &&
        bytes[1] === 0x50 &&
        bytes[2] === 0x4e &&
        bytes[3] === 0x47
      ) {
        return 'png';
      }
      // JPEG: FF D8 FF
      if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
        return 'jpg';
      }
      // PDF: 25 50 44 46 (%PDF)
      if (
        bytes[0] === 0x25 &&
        bytes[1] === 0x50 &&
        bytes[2] === 0x44 &&
        bytes[3] === 0x46
      ) {
        return 'pdf';
      }
    } catch (e) {}

    // Default to pdf if cannot detect
    return 'pdf';
  }

  viewDocument(): void {
    if (!this.selectedRequest || !this.selectedRequest.document) {
      this.toastr.error('No document available to view', 'Error');
      return;
    }

    try {
      let base64Data = this.selectedRequest.document;

      // Remove data URI prefix if present (e.g., "data:image/png;base64,")
      if (base64Data.includes(',')) {
        base64Data = base64Data.split(',')[1];
      }

      const fileName = this.getFileName() || 'document';
      const mimeType = this.getMimeType(fileName);

      // Create blob from base64
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });

      // Create URL and open in new tab
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');

      // Clean up the URL after a delay
      setTimeout(() => URL.revokeObjectURL(url), 100000);

      this.toastr.success('Document opened in new tab', 'Success');
    } catch (error) {
      this.toastr.error('Failed to view document', 'Error');
    }
  }

  downloadDocument(): void {
    if (!this.selectedRequest || !this.selectedRequest.document) {
      this.toastr.error('No document available to download', 'Error');
      return;
    }

    try {
      let base64Data = this.selectedRequest.document;

      // Remove data URI prefix if present (e.g., "data:image/png;base64,")
      if (base64Data.includes(',')) {
        base64Data = base64Data.split(',')[1];
      }

      const fileName = this.getFileName() || 'document';
      const mimeType = this.getMimeType(fileName);

      // Create blob from base64
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();

      // Clean up
      URL.revokeObjectURL(url);

      this.toastr.success(`Document "${fileName}" downloaded`, 'Success');
    } catch (error) {
      this.toastr.error('Failed to download document', 'Error');
    }
  }

  private getMimeType(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const mimeTypes: { [key: string]: string } = {
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xls: 'application/vnd.ms-excel',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      gif: 'image/gif',
      txt: 'text/plain',
    };
    return mimeTypes[extension || ''] || 'application/octet-stream';
  }

  getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      pending: 'bg-yellow-100 text-yellow-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      resolved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
  }

  getFormattedRequests(): any[] {
    return this.serviceRequests.map((request, index) => ({
      position: index + 1,
      requestType: this.getRequestTypeValue(request.requestType),
      status: request.status || 'pending',
      department: request.department,
      priority: request.priority,
      remarks: request.remarks,
      fileName: request.fileName,
      createdAt: request.createdAt,
      fullName: request.fullName,
      email: request.email,
    }));
  }
  private logServiceRequestAction(
    serviceRequest: ServiceRequest | undefined,
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW'
  ): void {
    if (!serviceRequest) {
      return;
    }

    const log: ServiceRequestLog = {
      requestId: serviceRequest.serviceId || serviceRequest.id,
      action: action,
      fullName: serviceRequest.issuerName || serviceRequest.fullName || '',
      email: serviceRequest.issuerEmail || serviceRequest.email || '',
      department: serviceRequest.deptId || serviceRequest.department || 0,
      requestType:
        serviceRequest.requestTypeId?.toString() ||
        serviceRequest.requestType ||
        '',
      priority:
        serviceRequest.priorityLevel?.toString() ||
        serviceRequest.priority ||
        '',
      remarks: serviceRequest.details || serviceRequest.remarks || '',
      fileName: serviceRequest.fileName || null,
      status: serviceRequest.status?.toString() || '0',
      timestamp: new Date(),
      userAgent: navigator.userAgent,
      ipAddress: 'N/A', // IP address would be captured on the backend in a real scenario
    };

    this.serviceRequestLogService.logServiceRequest(log).subscribe({
      next: () => {},
      error: () => {
        // Fail silently - don't show error to user
      },
    });
  }
}
