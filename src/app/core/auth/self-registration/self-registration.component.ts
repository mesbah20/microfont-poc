import {
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { VerificationService } from '../../services/verification.service';
import { SignupService } from '../../services/signup.service';
import { BankAccountService } from '../../services/bank-account.service';
import { SuccessOrErrorPopupService } from '../../services/success-or-error-popup.service';
import { ConfirmOtp } from '../../../shared/components/confirm-otp/confirm-otp';
import { RootResponse } from '../../models/root-response.model';
import { IHomeBranchInfoResponse } from '../../models/bankinfo.model';
import { ISignup } from '../../models/signup.model';
import { FloatingInput } from '../../../shared/components/floating-input/floating-input';

@Component({
  selector: 'app-self-registration',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ConfirmOtp, FloatingInput],
  templateUrl: './self-registration.component.html',
  styleUrl: './self-registration.component.scss',
})
export class SelfRegistrationComponent implements OnInit {
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private host = inject(ElementRef<HTMLElement>);
  private verification = inject(VerificationService);
  private signupService = inject(SignupService);
  private bankAccount = inject(BankAccountService);
  private popup = inject(SuccessOrErrorPopupService);

  form!: FormGroup;
  userType: 'INDIVIDUAL' | 'PROPRIETORSHIP' = 'INDIVIDUAL';
  showUserId = signal(true);
  otpStep = signal(false);
  otp = signal('');
  isLoading = signal(false);
  submitted = signal(false);
  branches = signal<IHomeBranchInfoResponse[]>([]);
  selectedBranchId = '';
  selectedBranchName = '';
  branchDropdownOpen = signal(false);

  ngOnInit(): void {
    this.form = this.fb.group({
      userId: [''],
      branch: ['', Validators.required],
      accountNo: ['', [Validators.required, Validators.pattern('[0-9]+')]],
      accountTitle: ['', Validators.required],
      mobileNo: [
        '',
        [Validators.required, Validators.pattern('[0-9]+'), Validators.minLength(11)],
      ],
      email: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
        ],
      ],
      birthDate: [null],
      birthDateStr: [''],
    });

    this.form
      .get('birthDateStr')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((val) => {
        this.form.get('birthDate')?.setValue(val ? new Date(val as string) : null);
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
    const dobStrCtrl = this.form.get('birthDateStr');
    if (value === 'PROPRIETORSHIP') {
      dobCtrl?.clearValidators();
      dobCtrl?.setValue(null);
      dobStrCtrl?.clearValidators();
      dobStrCtrl?.setValue('');
    } else {
      dobCtrl?.setValidators(Validators.required);
      dobStrCtrl?.setValidators(Validators.required);
    }
    dobCtrl?.updateValueAndValidity();
    dobStrCtrl?.updateValueAndValidity();
  }

  get accountTitleLabel(): string {
    return this.userType === 'PROPRIETORSHIP' ? 'E-TIN' : 'Account Title';
  }

  get accountTitleIcon(): 'building' | 'user' {
    return this.userType === 'PROPRIETORSHIP' ? 'building' : 'user';
  }

  get f() {
    return this.form.controls;
  }

  selectBranch(b: IHomeBranchInfoResponse): void {
    this.selectedBranchId = (b.brancH_ID ?? '').toString();
    this.selectedBranchName = (b.brancH_NM ?? '').toString();
    this.form.patchValue({ branch: this.selectedBranchId });
    this.branchDropdownOpen.set(false);
    this.f['branch']?.markAsTouched();
  }

  toggleBranchDropdown(): void {
    this.branchDropdownOpen.update((v) => !v);
  }

  closeBranchDropdown(): void {
    this.branchDropdownOpen.set(false);
  }

  /**
   * Close the home-branch dropdown when the user clicks anywhere outside
   * of the `.reg-branch-wrap` element (matches the natural Material
   * select / native `<select>` behaviour).
   */
  @HostListener('document:mousedown', ['$event'])
  onDocumentMouseDown(ev: MouseEvent): void {
    if (!this.branchDropdownOpen()) return;
    const target = ev.target as Node | null;
    if (!target) return;
    const root = this.host.nativeElement;
    // Find the branch wrapper element via closest() so clicks on the trigger,
    // arrow, or dropdown items themselves don't immediately re-close it.
    const inside = target instanceof Node && root.contains(target)
      ? (target as Element).closest('.reg-branch-wrap')
      : null;
    if (!inside) {
      this.closeBranchDropdown();
    }
  }

  showError(field: 'userId' | 'branch' | 'accountNo' | 'accountTitle' | 'mobileNo' | 'email' | 'birthDate' | 'birthDateStr'): boolean {
    const ctrl = this.form.get(field);
    if (!ctrl) return false;
    return !!ctrl.errors && (ctrl.touched || this.submitted());
  }

  onSubmit(): void {
    this.submitted.set(true);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.verifyMobile();
  }

  onRefresh(): void {
    this.form.reset();
    this.otp.set('');
    this.otpStep.set(false);
    this.selectedBranchId = '';
    this.selectedBranchName = '';
    this.submitted.set(false);
  }

  formatDob(date: Date | null | string): string {
    if (!date) return this.userType === 'PROPRIETORSHIP' ? '01/01/0001' : '';
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return '';
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const yyyy = d.getFullYear();
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

  private verifyMobile(): void {
    this.isLoading.set(true);
    const v = this.form.value;
    this.verification
      .verifyMobile(
        this.otp(),
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
          this.popup.showSuccessOrErrorPopup('Failure', message, 'error');
        },
      });
  }

  onOtpSubmit(otp: string): void {
    this.otp.set(otp);
    this.verifyMobile();
  }

  onOtpBack(): void {
    this.otpStep.set(false);
    this.otp.set('');
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
          this.otp.set('');
          this.submitted.set(false);
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
        this.popup.showSuccessOrErrorPopup('Failure', message, 'error');
      },
    });
  }
}
