import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule, MatSelectChange } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { VerificationService } from '../../services/verification.service';
import { SignupService } from '../../services/signup.service';
import { BankAccountService } from '../../services/bank-account.service';
import { SuccessOrErrorPopupService } from '../../services/success-or-error-popup.service';
import { ConfirmOtp } from '../../../shared/components/confirm-otp/confirm-otp';
import { RootResponse } from '../../models/root-response.model';
import { IHomeBranchInfoResponse } from '../../models/bankinfo.model';
import { ISignup } from '../../models/signup.model';

@Component({
  selector: 'app-self-registration',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    ConfirmOtp,
  ],
  templateUrl: './self-registration.component.html',
  styleUrl: './self-registration.component.scss',
})
export class SelfRegistrationComponent implements OnInit {
  private fb = inject(FormBuilder);
  private verification = inject(VerificationService);
  private signupService = inject(SignupService);
  private bankAccount = inject(BankAccountService);
  private popup = inject(SuccessOrErrorPopupService);

  form!: FormGroup;
  userType: 'INDIVIDUAL' | 'PROPRIETORSHIP' = 'INDIVIDUAL';
  showUserId = signal(true);
  otpStep = signal(false);
  otp = '';
  isLoading = signal(false);
  branches = signal<IHomeBranchInfoResponse[]>([]);
  /** Branch ID (string) selected from the dropdown — mirrors demo's `branchID` field */
  selectedBranchId = '';
  /** Branch display name — mirrors demo's `branchName` field */
  selectedBranchName = '';

  ngOnInit(): void {
    this.form = this.fb.group({
      userId: [''],
      /** Stored as branch ID string (per demo `value="{{ branch.brancH_ID }}"`) */
      branch: ['', Validators.required],
      accountNo: ['', [Validators.required, Validators.pattern('[0-9]+')]],
      accountTitle: ['', Validators.required],
      mobileNo: ['', [Validators.required, Validators.pattern('[0-9]+'), Validators.minLength(11)]],
      email: ['', [Validators.required, Validators.email, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
      birthDate: [null],
    });
    this.checkAutoUserId();
    this.loadBranches();
  }

  private checkAutoUserId(): void {
    this.verification.getAppSettingsByKey('AUTO_SET_USER_ID_AT_SIGNUP').subscribe({
      next: (res) => {
        const value = (res?.value ?? '').toString().toUpperCase();
        this.showUserId.set(value !== 'TRUE');
      },
      error: () => this.showUserId.set(true),
    });
  }

  private loadBranches(): void {
    this.bankAccount.getHomeBankBranchList('0').subscribe({
      next: (res: RootResponse<IHomeBranchInfoResponse[]>) => {
        if (res?.Status === 'OK' && Array.isArray(res.Result)) {
          this.branches.set(res.Result);
        } else {
          this.branches.set([]);
          if (res?.Message) {
            this.popup.showSuccessOrErrorPopup('Failure', res.Message, 'error');
          }
        }
      },
      error: () => this.branches.set([]),
    });
  }

  onUserTypeChange(value: 'INDIVIDUAL' | 'PROPRIETORSHIP'): void {
    this.userType = value;
    const dobCtrl = this.form.get('birthDate');
    if (value === 'PROPRIETORSHIP') {
      dobCtrl?.clearValidators();
      dobCtrl?.setValue(null);
    } else {
      dobCtrl?.setValidators(Validators.required);
    }
    dobCtrl?.updateValueAndValidity();
  }

  get accountTitleLabel(): string {
    return this.userType === 'PROPRIETORSHIP' ? 'E-TIN' : 'Account Title';
  }

  get f() {
    return this.form.controls;
  }

  /**
   * Demo-faithful branch selection handler.
   * Captures the selected branch ID (from form value) and the viewValue (display name).
   */
  onBranchChange(event: MatSelectChange): void {
    this.selectedBranchId = (event?.value ?? '').toString();
    // viewValue is the displayed text (matches demo's event.source.selected.viewValue)
    const selected = event?.source?.selected;
    const viewValue = Array.isArray(selected) ? selected[0]?.viewValue : selected?.viewValue;
    this.selectedBranchName = (viewValue ?? '').toString();
  }

  formatDob(date: Date | null): string {
    if (!date) return this.userType === 'PROPRIETORSHIP' ? '01/01/0001' : '';
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${mm}/${dd}/${yyyy}`;
  }

  buildPayload(): ISignup {
    const v = this.form.value;
    return {
      UserID: v.userId || '',
      BranchName: this.selectedBranchName,
      AccountNo: v.accountNo,
      AccountTitle: v.accountTitle,
      BranchId: this.selectedBranchId || v.branch,
      AccountAddressTypeId: '1',
      PhoneNumber: v.mobileNo,
      Email: v.email,
      DOB: this.formatDob(v.birthDate),
      ChannelName: 'IBU',
    };
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.verifyMobile();
  }

  /** Demo-faithful: resets the form to its initial state */
  onRefresh(): void {
    this.form.reset();
    this.otp = '';
    this.otpStep.set(false);
    this.selectedBranchId = '';
    this.selectedBranchName = '';
  }

  private verifyMobile(): void {
    this.isLoading.set(true);
    const v = this.form.value;
    this.verification
      .verifyMobile(
        this.otp,
        v.mobileNo,
        this.selectedBranchId || v.branch,
        v.accountNo,
      )
      .subscribe({
        next: (res: RootResponse<any>) => {
          this.isLoading.set(false);
          if (res?.Status === 'OK') {
            this.createUser();
            return;
          }
          if (res?.Status === 'OTP') {
            this.otpStep.set(true);
            return;
          }
          this.popup.showSuccessOrErrorPopup(
            'Failure',
            res?.Message || 'Verification failed',
            'error',
          );
        },
        error: (err: any) => {
          this.isLoading.set(false);
          const message =
            err?.error?.Message ||
            err?.error?.message ||
            err?.message ||
            'Verification failed';
          this.popup.showSuccessOrErrorPopup(
            'Failure',
            message,
            'error',
          );
        },
      });
  }

  onOtpSubmit(otp: string): void {
    this.otp = otp;
    this.verifyMobile();
  }

  onOtpBack(): void {
    this.otpStep.set(false);
    this.otp = '';
  }

  private createUser(): void {
    this.isLoading.set(true);
    const payload = this.buildPayload();
    const obs =
      this.userType === 'PROPRIETORSHIP'
        ? this.signupService.signupProprietorship(payload)
        : this.signupService.signupIndividual(payload);
    obs.subscribe({
      next: (res: RootResponse<any>) => {
        this.isLoading.set(false);
        if (res?.Status === 'OK') {
          this.popup.showSuccessOrErrorPopup(
            'Success',
            res.Message || 'Your account has been created successfully.',
            'success',
          );
          this.form.reset();
          this.selectedBranchId = '';
          this.selectedBranchName = '';
          this.otpStep.set(false);
          this.otp = '';
        } else {
          this.popup.showSuccessOrErrorPopup(
            'Failure',
            res?.Message || 'Signup failed',
            'error',
          );
        }
      },
      error: (err: any) => {
        this.isLoading.set(false);
        const message =
          err?.error?.Message ||
          err?.error?.message ||
          err?.message ||
          'Signup failed';
        this.popup.showSuccessOrErrorPopup(
          'Failure',
          message,
          'error',
        );
      },
    });
  }
}