import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {CommonModule, DatePipe, NgClass} from '@angular/common';
import {MatIconButton} from '@angular/material/button';
import {SelectOptionField} from '../input-types/select-option-field/select-option-field';
import {MatPaginator} from '@angular/material/paginator';
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {MatTableDataSource} from '@angular/material/table';
import {MatDialog} from '@angular/material/dialog';
import {MatIcon} from '@angular/material/icon';
import {MatTooltip} from '@angular/material/tooltip';
import {GetUnauthorizedMessagesRequest, ProcessAuthorizationRequest, SwiftAuthorizationLog} from '../../models/swift-authorization-log.model';
import {AuthorizationService} from '../../services/authorization.service';
import {XmlViewDialog} from '../xml-view-dialog/xml-view-dialog';
import {AlertSuccessComponent, SuccessModalConfig} from '../alert-success/alert-success';
import { Button } from "../input-types/button/button";
import { TextArea } from "../input-types/text-area/text-area";
import { AlertInfoComponent, InfoModalConfig } from '../alert-info/alert-info';
import { AlertWarningComponent, WarningModalConfig } from '../alert-warning/alert-warning';
import { AUTHORIZE_LOG_ACTION, DECLINE_LOG_ACTION, UNAUTHORIZED_STATUS, AUTHORIZED_STATUS, DECLINED_STATUS } from '../../constant/common.constant';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BUTTON_VISIBILITY } from '../../constant/button-signals.constant';

@Component({
  selector: 'app-authorization',
  imports: [
    CommonModule,
    CommonModule,
    DatePipe,
    NgClass,
    NgClass,
    MatIcon,
    MatIconButton,
    MatPaginator,
    MatTooltip,
    ReactiveFormsModule,
    ReactiveFormsModule,
    SelectOptionField,
    Button,
    TextArea
],
  templateUrl: './authorization.html',
  standalone: true,
  styleUrl: './authorization.scss'
})
export class Authorization implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // Form for the interface
  authorizationForm: FormGroup;

  // Authorization logs data source
  authorizationDataSource = new MatTableDataSource<SwiftAuthorizationLog>([]);

  // Authorization logs data source

  // Filter properties
  // Filter properties
  selectedMessageType: string = '';
  selectedRemarks: string = '';
  userId: string = localStorage.getItem("userId")||'';
  homeBranchId: string = sessionStorage.getItem('homeBranchId') || '';


  // Message types for dropdown (SWIFT message types)
  // Message types for dropdown (SWIFT message types)
  messageTypes: any[] = [
    { key: 'PACS008', value: 'PACS008 - Customer Credit Transfer' },
    { key: 'PACS009', value: 'PACS009 - Financial Institution Credit Transfer Return' },
    { key: 'PACS003', value: 'PACS003 - Direct Debit' },
    { key: 'PACS002', value: 'PACS002 - Payment Status Report' },
    { key: 'PACS004', value: 'PACS004 - Payment Return' },
    { key: 'CAMT029', value: 'CAMT029 - Resolution of Investigation' },
    { key: 'CAMT056', value: 'CAMT056 - Cancellation Request' },
    { key: 'CAMT053', value: 'CAMT053 - Bank to Customer Statement' },
  ];

  // Loading states
  isLoading: boolean = false;

  // Selected authorization logs for bulk operations
  selectedLogs: SwiftAuthorizationLog[] = [];

  // Check if current message type is PACS009 and has IbtTrans in remarks
  isPacs009WithIbtTrans(): boolean {
    const messageType = this.authorizationForm.get('messageType')?.value;
    return messageType === 'PACS009' && this.hasIbtTransInRemarks();
  }

  // Check if IbtTrans restriction should be shown (only when multiple IbtTrans messages exist)
  shouldShowIbtTransRestriction(): boolean {
    if (!this.isPacs009WithIbtTrans()) {
      return false;
    }
    const ibtTransCount = this.authorizationDataSource.data.filter(log => this.isIbtTransMessage(log)).length;
    return ibtTransCount > 1;
  }

  // Check if any of the current logs have IbtTrans in remarks
  private hasIbtTransInRemarks(): boolean {
    return this.authorizationDataSource.data.some(log => 
      log.remarks && log.remarks.toLowerCase().includes('ibttrans')
    );
  }

  // Check if a specific log is an IbtTrans message
  private isIbtTransMessage(log: SwiftAuthorizationLog): boolean {
    return !!(log.remarks && log.remarks.toLowerCase().includes('ibttrans'));
  }

  // Count how many IbtTrans messages are currently selected
  private getSelectedIbtTransCount(): number {
    return this.selectedLogs.filter(log => this.isIbtTransMessage(log)).length;
  }

  // Alert modal states
  showInfoAlert: boolean = false;
  showWarningAlert: boolean = false;
  infoAlertConfig: InfoModalConfig = {};
  warningAlertConfig: WarningModalConfig = {};

  // Pending actions for confirmation
  pendingAction: (() => void) | null = null;

  constructor(
    private dialog: MatDialog,
    private fb: FormBuilder,
    private authorizationService: AuthorizationService
  ) {
    BUTTON_VISIBILITY.set({
      save: false,
      update: false,
      view: false,
      delete: false,
      exit: true,
      reset: true,
    });
    this.initializeForm();
  }

  ngOnInit() {
    // Set up filter predicate for authorization data table
    this.userId = localStorage.getItem("userId")||'';
    this.homeBranchId = sessionStorage.getItem('homeBranchId') || '';
    this.authorizationDataSource.filterPredicate = (data: SwiftAuthorizationLog, filter: string) => {
      const searchTerm = filter.toLowerCase();
      return (
        data.msgRefNo.toLowerCase().includes(searchTerm) ||
        data.makeBy.toLowerCase().includes(searchTerm) ||
        (data.authBy?.toLowerCase().includes(searchTerm) || false) ||
        data.messageType.toLowerCase().includes(searchTerm) ||
        (data.authBy?.toLowerCase().includes(searchTerm) || false) ||
        data.messageType.toLowerCase().includes(searchTerm) ||
        (data.remarks?.toLowerCase().includes(searchTerm) || false)
      );
    };

    // Load initial data with default message type
    this.loadUnauthorizedMessages();
  }

  ngAfterViewInit() {
    this.authorizationDataSource.paginator = this.paginator;

    // Load initial data with default message type
    this.loadUnauthorizedMessages();
  }

  private initializeForm() {
    this.authorizationForm = this.fb.group({
      messageType: [null], // Default to PACS009
      remarks: ['']
    });

    // Watch for message type changes
    this.authorizationForm.get('messageType')?.valueChanges.subscribe(value => {
      if (value) {
        this.selectedMessageType = value;
        // Reset selection when message type changes
        this.selectedLogs = [];
        this.loadUnauthorizedMessages();
      }
    });
  }

  /**
   * Load unauthorized messages from the API
   */
  loadUnauthorizedMessages(): void {
    this.authorizationForm.patchValue({
      remarks: ''
    });
    const messageType = this.authorizationForm.get('messageType')?.value;
    if (!messageType) {
      return;
    }
    const request: GetUnauthorizedMessagesRequest = {
      messageType: messageType,
      authBy: this.userId,
      branchId: this.homeBranchId
    };

    this.isLoading = true;

    this.authorizationService.getUnauthorizedMessages(request).subscribe({
      next: (response: any) => {
        this.isLoading = false;

        let authorizationLogs: SwiftAuthorizationLog[] = [];

        // Handle different response formats
        if (response && Array.isArray(response)) {
          authorizationLogs = response;
        } else if (response && response.data && Array.isArray(response.data)) {
          authorizationLogs = response.data;
        } else if (response && response.payload && Array.isArray(response.payload)) {
          authorizationLogs = response.payload;
        } else if (response && response.result && Array.isArray(response.result)) {
          authorizationLogs = response.result;
        } else {
          console.warn('Unexpected authorization logs response format:', response);
          authorizationLogs = [];
        }

        this.authorizationDataSource.data = authorizationLogs;

        if (authorizationLogs.length === 0) {
          console.log(`No unauthorized messages found for message type: ${messageType}`);
        }

        // Reset paginator
        if (this.paginator) {
          this.paginator.firstPage();
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error loading authorization logs:', error);
        this.showWarning({
          title: 'Loading Error',
          message: 'Failed to load authorization logs. Please try again.',
          buttons: [{ text: 'OK', action: 'ok' }]
        });
        this.authorizationDataSource.data = [];
      }
    });
  }

  /**
   * Apply search filter to the table
   */
  applyFilter(event: KeyboardEvent) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.authorizationDataSource.filter = filterValue.trim().toLowerCase();

    // Reset paginator to first page when searching
    if (this.paginator) {
      this.paginator.firstPage();
    }
  }

  /**
   * Track function for ngFor optimization
   */
  trackByFn(index: number, item: SwiftAuthorizationLog): any {
    return item.id || index;
  }

  /**
   * Clear all filters and reload data
   */
  clearFilters() {
    this.authorizationForm.patchValue({
      messageType: null,
      remarks: ''
    });
    this.authorizationDataSource.filter = '';
    this.selectedLogs = [];
    this.loadUnauthorizedMessages();
  }

  getAuthorizeButtonClass() {
    return this.selectedLogs.length > 0 ? 'text-white bg-green-600 hover:bg-green-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60';
  }

  getDeclineButtonClass() {
    return this.selectedLogs.length > 0 ? 'text-white bg-red-600 hover:bg-red-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60';
  }
  /**
   * Show info alert with custom configuration using MatDialog
   */
  private showInfo(config: InfoModalConfig) {
    const dialogRef = this.dialog.open(AlertInfoComponent, {
      data: config,
      width: '400px',
      disableClose: false
    });

    // Handle button clicks if there are custom buttons
    if (config.buttons && config.buttons.length > 0) {
      dialogRef.componentInstance.buttonClick.subscribe((event: { action: string; button: any }) => {
        if (event.action === 'confirm' && this.pendingAction) {
          this.pendingAction();
        }
        dialogRef.close();
      });
    }
  }

  /**
   * Show warning alert with custom configuration using MatDialog
   */
  private showWarning(config: WarningModalConfig) {
    const dialogRef = this.dialog.open(AlertWarningComponent, {
      data: config,
      width: '400px',
      disableClose: false
    });

    // Handle button clicks if there are custom buttons
    if (config.buttons && config.buttons.length > 0) {
      dialogRef.componentInstance.buttonClick.subscribe((event: { action: string; button: any }) => {
        if (event.action === 'confirm' && this.pendingAction) {
          this.pendingAction();
        }
        dialogRef.close();
      });
    }
  }

  /**
   * Show success alert with custom configuration using MatDialog
   */
  private showSuccess(config: SuccessModalConfig) {
    const dialogRef = this.dialog.open(AlertSuccessComponent, {
      data: config,
      width: '400px',
      disableClose: false
    });

    // Handle button clicks if there are custom buttons
    if (config.buttons && config.buttons.length > 0) {
      dialogRef.componentInstance.buttonClick.subscribe((event: { action: string; button: any }) => {
        dialogRef.close();
      });
    }
  }


  /**
   * Handle info alert close
   */
  onInfoAlertClose() {
    this.showInfoAlert = false;
    this.infoAlertConfig = {};
    this.pendingAction = null;
  }

  /**
   * Handle warning alert close
   */
  onWarningAlertClose() {
    this.showWarningAlert = false;
    this.warningAlertConfig = {};
    this.pendingAction = null;
  }

  /**
   * Handle warning alert button clicks
   */
  onWarningAlertButtonClick(event: { action: string; button: any }) {
    if (event.action === 'confirm' && this.pendingAction) {
      this.pendingAction();
    }
    // Always close the dialog regardless of action (Yes or No)
    this.onWarningAlertClose();
  }

  /**
   * Handle info alert button clicks
   */
  onInfoAlertButtonClick(event: { action: string; button: any }) {
    if (event.action === 'confirm' && this.pendingAction) {
      this.pendingAction();
    }
    // Always close the dialog regardless of action (Yes or No)
    this.onInfoAlertClose();
  }

  /**
   * Preview request JSON data
   */
  previewRequestJson(log: SwiftAuthorizationLog) {
    if (!log.requestBody) {
      this.showWarning({
        title: 'No Data Available',
        message: 'No request data available for this message.',
        buttons: [{ text: 'OK', action: 'ok' }]
      });
      return;
    }

    // Format JSON for better display
    let formattedJson = log.requestBody;
    try {
      const jsonObject = JSON.parse(log.requestBody);
      formattedJson = JSON.stringify(jsonObject, null, 2);
    } catch (e) {
      console.warn('Request body is not valid JSON, displaying as-is');
    }

    this.dialog.open(XmlViewDialog, {
      data: { xmlData: formattedJson, title: 'Request JSON', subTitle: 'Request JSON Body' },
      width: '90vw',
      height: '90vh',
      maxWidth: 'none',
      maxHeight: 'none',
      panelClass: 'xml-dialog-panel'
    });
  }

  /**
   * Preview response XML data
   */
  previewResponseXml(log: SwiftAuthorizationLog) {
    if (!log.contentOfMsg) {
      this.showWarning({
        title: 'No Data Available',
        message: 'No response XML available for this message.',
        buttons: [{ text: 'OK', action: 'ok' }]
      });
      return;
    }

    this.dialog.open(XmlViewDialog, {
      data: { xmlData: log.contentOfMsg},
      width: '90vw',
      height: '90vh',
      maxWidth: 'none',
      maxHeight: 'none',
      panelClass: 'xml-dialog-panel'
    });
  }



  /**
   * Toggle selection of a log for bulk operations
   */
  toggleSelection(log: SwiftAuthorizationLog) {
    const index = this.selectedLogs.findIndex(l => l.id === log.id);
    if (index > -1) {
      this.selectedLogs.splice(index, 1);
    } else {
      this.selectedLogs.push(log);
    }
  }

  /**
   * Check if a log is selected
   */
  isSelected(log: SwiftAuthorizationLog): boolean {
    return this.selectedLogs.some(l => l.id === log.id);
  }

  /**
   * Handle checkbox change with proper state control
   */
  onCheckboxChange(event: Event, log: SwiftAuthorizationLog) {
    const checkbox = event.target as HTMLInputElement;
    const isChecked = checkbox.checked;
    
    // If trying to check an IbtTrans message when restriction applies
    if (isChecked && this.isPacs009WithIbtTrans() && this.isIbtTransMessage(log)) {
      // Check if we already have 1 IbtTrans message selected
      if (this.getSelectedIbtTransCount() >= 1) {
        // Uncheck the checkbox immediately
        checkbox.checked = false;
        this.showWarning({
          title: 'Selection Restriction',
          message: 'For PACS009 messages with IbtTrans, you can only select and authorize one IbtTrans message at a time.',
          buttons: [{ text: 'OK', action: 'ok' }]
        });
        return;
      }
    }
    
    // Allow normal toggle behavior
    this.toggleSelection(log);
  }

  /**
   * Select/deselect all visible logs
   */
  toggleSelectAll() {
    if (this.selectedLogs.length === this.authorizationDataSource.filteredData.length) {
      this.selectedLogs = [];
    } else {
      // Check if PACS009 with IbtTrans restriction applies and there are multiple IbtTrans messages
      if (this.isPacs009WithIbtTrans()) {
        const ibtTransCount = this.authorizationDataSource.filteredData.filter(log => this.isIbtTransMessage(log)).length;
        if (ibtTransCount > 1) {
          this.showWarning({
            title: 'Selection Restriction',
            message: 'For PACS009 messages with IbtTrans, you can only select one IbtTrans message at a time. Please select messages individually.',
            buttons: [{ text: 'OK', action: 'ok' }]
          });
          return;
        }
      }
      this.selectedLogs = [...this.authorizationDataSource.filteredData];
    }
  }

  /**
   * Authorize selected messages in bulk
   */
  authorizeSelected() {
    if (this.selectedLogs.length === 0) {
      this.showWarning({
        title: 'No Selection',
        message: 'Please select at least one message to authorize.',
        buttons: [{ text: 'OK', action: 'ok' }]
      });
      return;
    }

    // Check if PACS009 with IbtTrans restriction applies
    if (this.isPacs009WithIbtTrans() && this.getSelectedIbtTransCount() > 1) {
      this.showWarning({
        title: 'Authorization Restriction',
        message: 'For PACS009 messages with IbtTrans, you can only authorize one IbtTrans message at a time. Please select only one IbtTrans message.',
        buttons: [{ text: 'OK', action: 'ok' }]
      });
      return;
    }

    // Show confirmation dialog using MatDialog with existing alert-info component
    const dialogRef = this.dialog.open(AlertInfoComponent, {
      data: {
        title: 'Confirm Authorization',
        message: `Are you sure you want to authorize ${this.selectedLogs.length} selected message(s)?`,
        buttons: [
          { text: 'Yes, Authorize', action: 'confirm' },
          { text: 'Cancel', action: 'cancel' }
        ]
      },
      width: '400px',
      disableClose: true
    });

    dialogRef.componentInstance.buttonClick.subscribe((event: { action: string; button: any }) => {
      if (event.action === 'confirm') {
        this.performAuthorization();
      }
      dialogRef.close();
    });
  }

  /**
   * Perform the actual authorization after confirmation
   */
  private performAuthorization() {
    const remarks = this.authorizationForm.get('remarks')?.value || '';
    
    const authorizationRequests = this.selectedLogs.map(log => {
      const request: ProcessAuthorizationRequest = {
        logId: log.id,
        action: AUTHORIZE_LOG_ACTION,
        authBy: this.userId,
        branchId: this.homeBranchId,
        remarks: remarks
      };
      return this.authorizationService.processAuthorization(request).pipe(
        catchError(error => {
          console.error(`Error authorizing message ${log.msgRefNo}:`, error);
          return of({ error: true, logId: log.id, message: error.message || 'Authorization failed', originalError: error });
        })
      );
    });

    if (authorizationRequests.length === 0) {
      this.showWarning({
        title: 'No Messages',
        message: 'No messages to authorize.',
        buttons: [{ text: 'OK', action: 'ok' }]
      });
      return;
    }

    forkJoin(authorizationRequests).subscribe({
      next: (responses) => {
        console.log('Authorization responses:', responses);

        // Process responses and handle both success and error cases
        const processedResults = responses.map((response: any) => {
          // If this is a caught error response
          if (response.error) {
            return response;
          }

          // Check if the response indicates a failure in the payload
          if (response && response.payload && response.payload.success === false) {
            const errorMessage = response.payload.message || 'Authorization failed';
            const errorCode = response.payload.errorCode || 'UNKNOWN_ERROR';
            const logId = response.payload.logId;
            
            console.error(`Authorization failed for log ID ${logId}:`, {
              errorCode,
              message: errorMessage,
              errorDetails: response.payload.errorDetails,
              fullResponse: response
            });

            return {
              error: true,
              logId: logId,
              message: errorMessage,
              errorCode: errorCode,
              errorDetails: response.payload.errorDetails
            };
          }

          // Success case
          return response;
        });

        const errors = processedResults.filter((response: any) => response.error);
        const successes = processedResults.filter((response: any) => !response.error);

        if (errors.length > 0) {
          console.error('Some authorizations failed:', errors);
          
          // Create detailed error message
          let errorMessage = `${successes.length} messages authorized successfully. ${errors.length} failed:\n\n`;
          errors.forEach((error: any) => {
            errorMessage += `• Log ID ${error.logId}: ${error.message}`;
            if (error.errorCode) {
              errorMessage += ` (${error.errorCode})`;
            }
            errorMessage += '\n';
          });

          this.showWarning({
            title: errors.length === responses.length ? 'Authorization Failed' : 'Partial Success',
            message: errorMessage.trim(),
            buttons: [{ text: 'OK', action: 'ok' }]
          });
        } else {
          this.showSuccess({
            title: 'Authorization Successful',
            message: `${successes.length} messages authorized successfully!`,
            buttons: [{ text: 'OK', action: 'ok' }]
          });
        }

        this.selectedLogs = [];
        this.loadUnauthorizedMessages();
      },
      error: (error) => {
        console.error('Unexpected error during authorization:', error);
        this.showWarning({
          title: 'Authorization Error',
          message: 'An unexpected error occurred during authorization. Please try again.',
          buttons: [{ text: 'OK', action: 'ok' }]
        });
      }
    });
    
  }

  /**
   * Decline selected messages in bulk
   */
  declineSelected() {
    if (this.selectedLogs.length === 0) {
      this.showWarning({
        title: 'No Selection',
        message: 'Please select at least one message to decline.',
        buttons: [{ text: 'OK', action: 'ok' }]
      });
      return;
    }

    const remarks = this.authorizationForm.get('remarks')?.value;

    if (!remarks || remarks.trim() === '') {
      this.showWarning({
        title: 'Missing Remarks',
        message: 'Please provide remarks for declining the selected messages.',
        buttons: [{ text: 'OK', action: 'ok' }]
      });
      return;
    }

    // Show confirmation dialog using MatDialog with existing alert-warning component
    const dialogRef = this.dialog.open(AlertWarningComponent, {
      data: {
        title: 'Confirm Decline',
        message: `Are you sure you want to decline ${this.selectedLogs.length} selected message(s)?`,
        buttons: [
          { text: 'Yes, Decline', action: 'confirm' },
          { text: 'Cancel', action: 'cancel' }
        ]
      },
      width: '400px',
      disableClose: true
    });

    dialogRef.componentInstance.buttonClick.subscribe((event: { action: string; button: any }) => {
      if (event.action === 'confirm') {
        this.performDecline();
      }
      dialogRef.close();
    });
  }

  /**
   * Perform the actual decline after confirmation
   */
  private performDecline() {
    const remarks = this.authorizationForm.get('remarks')?.value;

    const declineRequests = this.selectedLogs.map(log => {
      const request: ProcessAuthorizationRequest = {
        logId: log.id,
        action: DECLINE_LOG_ACTION,
        authBy: this.userId,
        branchId: this.homeBranchId,
        remarks: remarks
      };
      return this.authorizationService.processAuthorization(request).pipe(
        catchError(error => {
          console.error(`Error declining message ${log.msgRefNo}:`, error);
          return of({ error: true, logId: log.id, message: error.message || 'Decline failed', originalError: error });
        })
      );
    });

    if (declineRequests.length === 0) {
      this.showWarning({
        title: 'No Messages',
        message: 'No messages to decline.',
        buttons: [{ text: 'OK', action: 'ok' }]
      });
      return;
    }

    forkJoin(declineRequests).subscribe({
      next: (responses) => {
        console.log('Decline responses:', responses);

        // Process responses and handle both success and error cases
        const processedResults = responses.map((response: any) => {
          // If this is a caught error response
          if (response.error) {
            return response;
          }

          // Check if the response indicates a failure in the payload
          if (response && response.payload && response.payload.success === false) {
            const errorMessage = response.payload.message || 'Decline failed';
            const errorCode = response.payload.errorCode || 'UNKNOWN_ERROR';
            const logId = response.payload.logId;
            
            console.error(`Decline failed for log ID ${logId}:`, {
              errorCode,
              message: errorMessage,
              errorDetails: response.payload.errorDetails,
              fullResponse: response
            });

            return {
              error: true,
              logId: logId,
              message: errorMessage,
              errorCode: errorCode,
              errorDetails: response.payload.errorDetails
            };
          }

          // Success case
          return response;
        });

        const errors = processedResults.filter((response: any) => response.error);
        const successes = processedResults.filter((response: any) => !response.error);

        if (errors.length > 0) {
          console.error('Some declines failed:', errors);
          
          // Create detailed error message
          let errorMessage = `${successes.length} messages declined successfully. ${errors.length} failed:\n\n`;
          errors.forEach((error: any) => {
            errorMessage += `• Log ID ${error.logId}: ${error.message}`;
            if (error.errorCode) {
              errorMessage += ` (${error.errorCode})`;
            }
            errorMessage += '\n';
          });

          this.showWarning({
            title: errors.length === responses.length ? 'Decline Failed' : 'Partial Success',
            message: errorMessage.trim(),
            buttons: [{ text: 'OK', action: 'ok' }]
          });
        } else {
          this.showSuccess({
            title: 'Decline Successful',
            message: `${successes.length} messages declined successfully!`,
            buttons: [{ text: 'OK', action: 'ok' }]
          });
        }

        this.selectedLogs = [];
        this.loadUnauthorizedMessages();
      },
      error: (error) => {
        console.error('Unexpected error during decline:', error);
        this.showWarning({
          title: 'Decline Error',
          message: 'An unexpected error occurred during decline. Please try again.',
          buttons: [{ text: 'OK', action: 'ok' }]
        });
      }
    });
  }

  /**
   * Get authorization status display text
   */
  getAuthStatusText(authStatusId: string): string {
    switch (authStatusId) {
      case UNAUTHORIZED_STATUS: return 'Unauthorized';
      case AUTHORIZED_STATUS: return 'Authorized';
      case DECLINED_STATUS: return 'Declined';
      default: return 'Unknown';
    }
  }

  /**
   * Get authorization status CSS class
   */
  getAuthStatusClass(authStatusId: string): string {
    switch (authStatusId) {
      case UNAUTHORIZED_STATUS: return 'text-yellow-600 bg-yellow-100';
      case AUTHORIZED_STATUS: return 'text-green-600 bg-green-100';
      case DECLINED_STATUS: return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }

  /**
   * Test method to verify API integration
   * This method can be called from browser console for testing
   */
  testProcessAuthorization() {
    console.log('Testing process authorization API...');

    // Test with sample data (logId: 16, action: 'AUTHORIZE', remarks: 'Test1')
    const request: ProcessAuthorizationRequest = {
      logId: 16,
      action: AUTHORIZE_LOG_ACTION,
      authBy: this.userId,
      branchId: this.homeBranchId,
      remarks: 'Test1'
    };

    this.authorizationService.processAuthorization(request).subscribe({
      next: (response) => {
        console.log('Test API call successful:', response);
        this.showInfo({
          title: 'Test Success',
          message: 'Test API call successful! Check console for details.',
          buttons: [{ text: 'OK', action: 'ok' }]
        });
      },
      error: (error) => {
        console.error('Test API call failed:', error);
        this.showWarning({
          title: 'Test Failed',
          message: 'Test API call failed! Check console for error details.',
          buttons: [{ text: 'OK', action: 'ok' }]
        });
      }
    });
  }
}
